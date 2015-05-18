package nexos.service.lx;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.JsonDataSet;
import nexos.service.common.CommonDAO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

/**
 * Class: LX02010EService<br>
 * Description: X-DOCK작업(LX02010E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 * 
 * <pre style="font-family: NanumGothicCoding, GulimChe">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2013-01-01    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 * </pre>
 */
@Service("LX02010E")
public class LX02010EService {

  // private final Logger logger = LoggerFactory.getLogger(LV01000QService.class);

  /**
   * DAO 주입처리하기
   */
  @Resource
  private LX02010EDAO                dao;

  @Resource
  private CommonDAO                  common;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * LX_PROCESSING 호출
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  public String callLXProcessing(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LX_PROCESSING";
    final String ENTRY_PROCEDURE_ID = "LX_FW_ENTRY_PROCESSING";

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String process_Cd = (String)params.get("P_PROCESS_CD");
    String direction = (String)params.get("P_DIRECTION");
    String process_State_BW = (String)params.get("P_PROCESS_STATE_BW");
    String process_State_FW = (String)params.get("P_PROCESS_STATE_FW");
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    // 처리할 수 있는 진행상태
    String CHECK_STATE = "";
    String CHECK_PROCESS_CD = Consts.PROCESS_ENTRY;
    String CHECK_DIV = "";
    // 처리
    if (Consts.DIRECTION_FW.equals(direction)) {
      CHECK_STATE = process_State_FW;
      CHECK_DIV = "1";
      if (Consts.PROCESS_ENTRY.equals(process_Cd)) {
        CHECK_STATE = Consts.STATE_ORDER;
        CHECK_PROCESS_CD = Consts.PROCESS_ORDER;
      }
    } else {
      // 취소
      CHECK_DIV = "2";
      CHECK_STATE = process_State_BW;
    }

    HashMap<String, Object> checkParams = new HashMap<String, Object>();
    checkParams.put("P_LINE_NO", ""); // 전표단위
    checkParams.put("P_PROCESS_CD", CHECK_PROCESS_CD);
    checkParams.put("P_STATE_DIV", CHECK_DIV); // 상태구분([1]MIN, [2]MAX)

    // LX_PROCESSING 호출
    // 전표 단위 Transaction
    final int dsCnt = saveDS.size();
    StringBuffer sbResult = new StringBuffer();
    TransactionDefinition td = new DefaultTransactionDefinition();
    for (int i = 0; i < dsCnt; i++) {

      // SP 호출 파라메터
      Map<String, Object> callParams = saveDS.get(i);
      callParams.put("P_PROCESS_CD", process_Cd);
      callParams.put("P_DIRECTION", direction);
      callParams.put(Consts.PK_USER_ID, user_Id);

      // 진행상태 체크
      checkParams.put("P_CENTER_CD", callParams.get("P_CENTER_CD"));
      checkParams.put("P_BU_CD", callParams.get("P_BU_CD"));
      checkParams.put("P_XDOCK_DATE", callParams.get("P_XDOCK_DATE"));
      checkParams.put("P_XDOCK_NO", callParams.get("P_XDOCK_NO"));
      checkParams.put("P_LINE_NO", callParams.get("P_LINE_NO"));
      checkParams.put("P_XDOCK_TYPE", callParams.get("P_XDOCK_TYPE"));
      checkParams.put("P_DELIVERY_BATCH", callParams.get("P_DELIVERY_BATCH"));
      checkParams.put("P_DELIVERY_CD", callParams.get("P_DELIVERY_CD"));
      checkParams.put("P_RDELIVERY_CD", callParams.get("P_RDELIVERY_CD"));
      String oMsg = canProcessingState(checkParams, CHECK_STATE);
      if (!Consts.OK.equals(oMsg)) {
        sbResult.append(oMsg).append(Consts.CRLF);
        continue;
      }

      // LX_PROCESSING 호출
      TransactionStatus ts = transactionManager.getTransaction(td);
      try {
        HashMap<String, Object> mapResult;
        // 등록 진행 일 경우 LX_FW_ENTRY_PROCESSING
        if (Consts.PROCESS_ENTRY.equals(process_Cd) && Consts.DIRECTION_FW.equals(direction)) {
          callParams.put("P_ORDER_DATE", callParams.get("P_XDOCK_DATE"));
          callParams.put("P_ORDER_NO", callParams.get("P_XDOCK_NO"));
          callParams.put("P_XDOCK_DATE", callParams.get("P_XDOCK_DATE_P"));
          mapResult = callSP(ENTRY_PROCEDURE_ID, callParams);
        } else {
          mapResult = callSP(PROCEDURE_ID, callParams);
        }
        oMsg = (String)mapResult.get(Consts.PK_O_MSG);

        // 오류면 Rollback
        if (!Consts.OK.equals(oMsg)) {
          transactionManager.rollback(ts);
          sbResult.append(oMsg);
          sbResult.append(Consts.CRLF);
          continue;
        }
        transactionManager.commit(ts);
      } catch (Exception e) {
        transactionManager.rollback(ts);
        throw new RuntimeException(e.getMessage());
      }
    }
    if (sbResult.length() == 0) {
      sbResult.append(Consts.OK);
    }
    return sbResult.toString();
  }

  /**
   * SP 호출 후 OUTPUT 값을 Map 형태로 Return
   * 
   * @param queryId
   * @param params
   * @return
   */
  public HashMap<String, Object> callSP(String queryId, Map<String, Object> params) {

    return common.callSP(queryId, params);
  }

  /**
   * XDOCK_STATE 체크
   * 
   * @param params
   * @param checkState
   * @return
   */
  public String canProcessingState(Map<String, Object> params, String checkState) {

    final String PROCEDURE_ID = "WF.GET_LX_XDOCK_STATE";

    String result = Consts.OK;
    HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, params);
    String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
    if (Consts.OK.equals(oMsg)) {
      String oXDockState = (String)mapResult.get("O_XDOCK_STATE");
      if (!checkState.equals(oXDockState)) {
        result = String.format("[진행상태 : %s] 처리할 수 있는 상태가 아닙니다.\n다시 조회 후 데이터를 확인하십시오.", oXDockState);
      } else {
        result = oMsg;
      }
    } else {
      result = oMsg;
    }
    return result;
  }

  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return common.getJsonDataSet(queryId, params);
  }

  /**
   * 각 프로세스 별 수량 수정
   * 
   * @param params 수정된 데이터
   */
  @SuppressWarnings("unchecked")
  public String save(Map<String, Object> params) throws Exception {

    String process_Cd = (String)params.get("P_PROCESS_CD");
    // String user_Id = (String)params.get(Consts.PK_USER_ID);
    // String process_State_BW = (String)params.get("P_PROCESS_STATE_BW");
    String process_State_FW = (String)params.get("P_PROCESS_STATE_FW");

    // 저장 전 진행상태 체크
    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    final int dsCnt = saveDS.size();
    StringBuffer sbResult = new StringBuffer();
    TransactionDefinition td = new DefaultTransactionDefinition();
    for (int i = 0; i < dsCnt; i++) {

      // 호출 파라메터
      Map<String, Object> saveParams = saveDS.get(i);

      Map<String, Object> checkParams = new HashMap<String, Object>();
      checkParams.put("P_CENTER_CD", saveParams.get("P_CENTER_CD"));
      checkParams.put("P_BU_CD", saveParams.get("P_BU_CD"));
      checkParams.put("P_XDOCK_DATE", saveParams.get("P_XDOCK_DATE"));
      checkParams.put("P_XDOCK_NO", saveParams.get("P_XDOCK_NO"));
      checkParams.put("P_LINE_NO", saveParams.get("P_LINE_NO"));
      checkParams.put("P_XDOCK_TYPE", saveParams.get("P_XDOCK_TYPE"));
      checkParams.put("P_DELIVERY_BATCH", saveParams.get("P_DELIVERY_BATCH"));
      checkParams.put("P_DELIVERY_CD", saveParams.get("P_DELIVERY_CD"));
      checkParams.put("P_RDELIVERY_CD", saveParams.get("P_RDELIVERY_CD"));
      checkParams.put("P_PROCESS_CD", "B"); // 예정 이외는 전부 등록테이블로 검색
      checkParams.put("P_STATE_DIV", "1");
      String oMsg = canProcessingState(checkParams, process_State_FW);
      if (!Consts.OK.equals(oMsg)) {
        sbResult.append(oMsg).append(Consts.CRLF);
        continue;
      }

      // 프로세스 코드 셋팅
      saveParams.put("P_PROCESS_CD", process_Cd);

      // 저장 처리
      TransactionStatus ts = transactionManager.getTransaction(td);
      try {
        dao.save(saveParams);
        transactionManager.commit(ts);
      } catch (Exception e) {
        sbResult.append(e.getMessage()).append(Consts.CRLF);
        transactionManager.rollback(ts);
      }
    }

    if (sbResult.length() == 0) {
      sbResult.append(Consts.OK);
    }
    return sbResult.toString();
  }

  /**
   * 예정의 등록수량 수정 후 등록처리
   * 
   * @param params 수정된 데이터
   */
  @SuppressWarnings("unchecked")
  public String saveEntry(Map<String, Object> params) throws Exception {

    String process_Cd = (String)params.get("P_PROCESS_CD");
    String process_State_BW = (String)params.get("P_PROCESS_STATE_BW");
    String process_State_FW = (String)params.get("P_PROCESS_STATE_FW");
    String CHECK_STATE;

    // 저장 전 진행상태 체크
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    Map<String, Object> checkParams = new HashMap<String, Object>();
    checkParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
    checkParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
    if (Consts.PROCESS_ORDER.equals(process_Cd)) {
      CHECK_STATE = process_State_FW;
      checkParams.put("P_XDOCK_DATE", masterDS.get("P_ORDER_DATE"));
      checkParams.put("P_XDOCK_NO", masterDS.get("P_ORDER_NO"));

    } else {
      CHECK_STATE = process_State_BW;
      checkParams.put("P_XDOCK_DATE", masterDS.get("P_XDOCK_DATE"));
      checkParams.put("P_XDOCK_NO", masterDS.get("P_XDOCK_NO"));
    }
    checkParams.put("P_PROCESS_CD", process_Cd);
    checkParams.put("P_LINE_NO", masterDS.get("P_LINE_NO"));
    checkParams.put("P_XDOCK_TYPE", masterDS.get("P_XDOCK_TYPE"));
    checkParams.put("P_DELIVERY_BATCH", masterDS.get("P_DELIVERY_BATCH"));
    checkParams.put("P_DELIVERY_CD", masterDS.get("P_DELIVERY_CD"));
    checkParams.put("P_RDELIVERY_CD", masterDS.get("P_RDELIVERY_CD"));
    checkParams.put("P_PROCESS_CD", params.get("P_PROCESS_CD"));
    checkParams.put("P_STATE_DIV", "1");
    String oMsg = canProcessingState(checkParams, CHECK_STATE);
    if (!Consts.OK.equals(oMsg)) {
      throw new RuntimeException(oMsg);
    }

    // 저장 처리
    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      dao.saveEntry(params);
      transactionManager.commit(ts);
      result = Consts.OK;
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return result;
  }

}