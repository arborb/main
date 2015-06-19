package nexos.service.li;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.JsonDataSet;
import nexos.service.common.CommonDAO;
import nexos.service.ed.common.EDCommonService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

/**
 * Class: LI02010EService<br>
 * Description: 입고작업(LI02010E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LI02010E")
public class LI02010EService {

  // private final Logger logger = LoggerFactory.getLogger(LI02010EService.class);

  /**
   * DAO 주입처리하기 
   */
  @Resource
  private LI02010EDAO                dao;

  @Resource
  private CommonDAO                  common;

  @Resource
  private EDCommonService            edCommonService;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return common.getJsonDataSet(queryId, params);
  }

  /**
   * SP 호출 후 OUTPUT 값을 Map 형태로 Return
   * @param queryId
   * @param params
   * @return
   */
  public HashMap<String, Object> callSP(String queryId, Map<String, Object> params) {

    return common.callSP(queryId, params);
  }

  public String canProcessingState(Map<String, Object> params, String checkState) {

    final String PROCEDURE_ID = "WF.GET_LI_INBOUND_STATE";

    String result = Consts.OK;
    HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, params);

    String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
    if (Consts.OK.equals(oMsg)) {
      String oInboundState = (String)mapResult.get("O_INBOUND_STATE");
      if (!checkState.equals(oInboundState)) {
        result = String.format("[진행상태 : %s] 처리할 수 있는 상태가 아닙니다.\n다시 조회 후 데이터를 확인하십시오.", oInboundState);
      } else {
        result = oMsg;
      }
    } else {
      result = oMsg;
    }
    return result;
  }

  /**
   * 입고등록 마스터/디테일 저장 처리
   * @param params 신규, 수정된 데이터
   */
  @SuppressWarnings("unchecked")
  public String save(Map<String, Object> params) throws Exception {

    // 신규 등록이 아닐 경우 저장 전 입고진행상태 체크
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    String process_Cd = (String)params.get("P_PROCESS_CD");
    String process_State_BW = (String)params.get("P_PROCESS_STATE_BW");
    String process_State_FW = (String)params.get("P_PROCESS_STATE_FW");

    if (!Consts.PROCESS_ENTRY_NEW.equals(process_Cd)) {
      String CHECK_STATE;
      Map<String, Object> checkParams = new HashMap<String, Object>();
      checkParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      checkParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      checkParams.put("P_LINE_NO", "");
      checkParams.put("P_STATE_DIV", "1");

      if (Consts.PROCESS_ORDER.equals(process_Cd)) {
        CHECK_STATE = process_State_FW;
        checkParams.put("P_INBOUND_DATE", masterDS.get("P_ORDER_DATE"));
        checkParams.put("P_INBOUND_NO", masterDS.get("P_ORDER_NO"));

      } else {
        CHECK_STATE = process_State_BW;
        checkParams.put("P_INBOUND_DATE", masterDS.get("P_INBOUND_DATE"));
        checkParams.put("P_INBOUND_NO", masterDS.get("P_INBOUND_NO"));
      }
      checkParams.put("P_PROCESS_CD", process_Cd);

      String oMsg = canProcessingState(checkParams, CHECK_STATE);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
    }

    // 저장 처리
    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      dao.save(params);
      transactionManager.commit(ts);
      result = Consts.OK;
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return result;
  }

  /**
   * 입고지시 - 입고지시 저장 처리
   * @param params 수정된 데이터
   */
  public String saveDirectionsLocId(Map<String, Object> params) throws Exception {

    // 진행상태 체크 안함 - SP 내에서 체크
    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      dao.saveDirectionsLocId(params);
      transactionManager.commit(ts);
      result = Consts.OK;
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return result;
  }

  /**
   * 입고확정/적치 - 입고지시 저장 처리
   * @param params 수정된 데이터
   */
  @SuppressWarnings("unchecked")
  public String saveDirections(Map<String, Object> params) throws Exception {

    // 저장 전 입고진행상태 체크
    Map<String, Object> checkParams = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    String checkState = (String)checkParams.get("P_CHECK_STATE");
    String oMsg = canProcessingState(checkParams, checkState);
    if (!Consts.OK.equals(oMsg)) {
      throw new RuntimeException(oMsg);
    }
    if (Consts.STATE_ENTRY.equals(checkState)) {
      params.put("P_PROCESS_CD", Consts.PROCESS_DIRECTIONS);
    } else if (Consts.STATE_DIRECTIONS.equals(checkState)) {
      params.put("P_PROCESS_CD", Consts.PROCESS_CONFIRM);
    } else {
      params.put("P_PROCESS_CD", Consts.PROCESS_PUTAWAY);
    }

    // 입고지시 저장
    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      dao.saveDirections(params);
      transactionManager.commit(ts);
      result = Consts.OK;
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return result;
  }
  
/*
  * 삭제
  * 
  * @param params
  * @return
  * @throws Exception
  */
 @SuppressWarnings("rawtypes")
 public Map callDelete(Map<String, Object> params) throws Exception {

   Map result;

   TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
   try {
     result = (Map)dao.callDelete(params);
     String oMsg = (String)result.get(Consts.PK_O_MSG);
     // 오류면 Rollback
     if (!Consts.OK.equals(oMsg)) {
       transactionManager.rollback(ts);
     }
     transactionManager.commit(ts);
   } catch (Exception e) {
     transactionManager.rollback(ts);
     throw new RuntimeException(e.getMessage());
   }

   return result;
 }

  public String save1(Map<String, Object> params) throws Exception {

    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      dao.saveSub(params);
      transactionManager.commit(ts);
      result = Consts.OK;
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return result;
  }
  
  
  /**
   * LI_PROCESSING 호출
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  public String callLIProcessing(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LI_PROCESSING";

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String process_Cd = (String)params.get("P_PROCESS_CD");
    String process_State_BW = (String)params.get("P_PROCESS_STATE_BW");
    String process_State_FW = (String)params.get("P_PROCESS_STATE_FW");
    String direction = (String)params.get("P_DIRECTION");
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    // 처리할 수 있는 진행상태
    String CHECK_STATE = "";
    // 처리
    if (Consts.DIRECTION_FW.equals(direction)) {
      CHECK_STATE = process_State_FW;
    } else {
      // 취소
      CHECK_STATE = process_State_BW;
    }

    HashMap<String, Object> checkParams = new HashMap<String, Object>();
    checkParams.put("P_LINE_NO", ""); // 전표단위
    checkParams.put("P_PROCESS_CD", Consts.PROCESS_ENTRY);// 진행상태체크 프로세스코드([A]예정, [B]등록)
    checkParams.put("P_STATE_DIV", "1"); // 상태구분([1]MIN, [2]MAX)

    // LI_PROCESSING 호출
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
      checkParams.put("P_INBOUND_DATE", callParams.get("P_INBOUND_DATE"));
      checkParams.put("P_INBOUND_NO", callParams.get("P_INBOUND_NO"));
      String oMsg = canProcessingState(checkParams, CHECK_STATE);
      if (!Consts.OK.equals(oMsg)) {
        sbResult.append(oMsg).append(Consts.CRLF);
        continue;
      }

      // LI_PROCESSING 호출
      TransactionStatus ts = transactionManager.getTransaction(td);
      try {
        HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, callParams);
        oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        // 오류면 Rollback
        if (!Consts.OK.equals(oMsg)) {
          transactionManager.rollback(ts);
          sbResult.append(oMsg).append(Consts.CRLF);
          continue;
        }

        if (process_Cd.equals(Consts.PROCESS_CONFIRM)) {
          // 변동가용재고 송신 호출
          oMsg = edCommonService.realtimeSendProcessing();
          // 오류면 Rollback
          if (!Consts.OK.equals(oMsg)) {
            transactionManager.rollback(ts);
            sbResult.append(oMsg).append(Consts.CRLF);
            continue;
          }
        }

        transactionManager.commit(ts);
      } catch (Exception e) {
        // SP 내에서 오류가 아니면 Exit
        transactionManager.rollback(ts);
        throw new RuntimeException(e.getMessage());
      }
    }
    if (sbResult.length() == 0) {
      sbResult.append(Consts.OK);
    }
    return sbResult.toString();
  }



  @SuppressWarnings("rawtypes")
  public Map callLi_Fw_Putaway_Proc(Map<String, Object> params) throws Exception {

    Map result;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      result = (Map)dao.callLi_Fw_Putaway_Proc(params);
      String oMsg = (String)result.get(Consts.PK_O_MSG);
      // 오류면 Rollback
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      transactionManager.commit(ts);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }

    return result;
  }
  

  
  /**
   * LI_FW_ENTRY_PROCESSING 호출
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  public String callLIEntryProcessing(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LI_FW_ENTRY_PROCESSING";

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String process_Cd = (String)params.get("P_PROCESS_CD");
    // String process_State_BW = (String)params.get("P_PROCESS_STATE_BW");
    String process_State_FW = (String)params.get("P_PROCESS_STATE_FW");
    String direction = (String)params.get("P_DIRECTION");
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    // 처리
    if (!Consts.DIRECTION_FW.equals(direction) && !Consts.PROCESS_ENTRY_T1.equals(process_Cd)) {
      return String.format("[프로세스, 진행방향 : %s, %s] 처리할 수 있는 프로세스가 아닙니다.", process_Cd, direction);
    }

    HashMap<String, Object> checkParams = new HashMap<String, Object>();
    checkParams.put("P_LINE_NO", ""); // 전표단위
    checkParams.put("P_PROCESS_CD", Consts.PROCESS_ORDER); // 진행상태체크 프로세스코드([A]예정, [B]등록)
    checkParams.put("P_STATE_DIV", "1"); // 상태구분([1]MIN, [2]MAX)

    // LI_PROCESSING 호출
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
      checkParams.put("P_INBOUND_DATE", callParams.get("P_ORDER_DATE"));
      checkParams.put("P_INBOUND_NO", callParams.get("P_ORDER_NO"));
      String oMsg = canProcessingState(checkParams, process_State_FW);// 처리할 수 있는 진행상태
      if (!Consts.OK.equals(oMsg)) {
        sbResult.append(oMsg).append(Consts.CRLF);
        continue;
      }

      // LI_FW_ENTRY_PROCESSING 호출
      TransactionStatus ts = transactionManager.getTransaction(td);
      try {
        HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, callParams);
        oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        // 오류면 Rollback
        if (!Consts.OK.equals(oMsg)) {
          transactionManager.rollback(ts);
          sbResult.append(oMsg).append(Consts.CRLF);
          continue;
        }
        // 리턴된 입고일자, 입고번호로 필요시 추가 처리
        // String oInbound_Date = (String)mapResult.get("O_INBOUND_DATE");
        // String oInbound_No = (String)mapResult.get("O_INBOUND_NO");
        transactionManager.commit(ts);
      } catch (Exception e) {
        // SP 내에서 오류가 아니면 Exit
        transactionManager.rollback(ts);
        throw new RuntimeException(e.getMessage());
      }
    }
    if (sbResult.length() == 0) {
      sbResult.append(Consts.OK);
    }
    return sbResult.toString();
  }
}