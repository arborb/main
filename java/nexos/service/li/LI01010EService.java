package nexos.service.li;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.JsonDataSet;
import nexos.service.common.CommonDAO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

/**
 * Class: LI01010E Service<br>
 * Description: 입고예정작업(LI01010E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LI01010E")
public class LI01010EService {

  /**
   * DAO 주입처리하기
   */
  @Resource
  private LI01010EDAO                dao;

  @Resource
  private CommonDAO                  common;

  @Resource
  private PlatformTransactionManager transactionManager;

  final String                       CHECK_STATE = Consts.STATE_ORDER;

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
   * 저장/삭제시 상태를 체크해서 "10"이 아닐경우 저장/삭제 불가
   *
   * @param params
   * @param checkState
   * @return
   */
  public String canProcessingdState(Map<String, Object> params, String checkState) {

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
   * 입고예정작업 삭제 처리
   *
   * @param params 신규, 수정된 데이터
   */
  @SuppressWarnings("unchecked")
  public String delete(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    Map<String, Object> rowData = saveDS.get(0);
    Map<String, Object> checkParams = new HashMap<String, Object>();
    checkParams.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
    checkParams.put("P_BU_CD", rowData.get("P_BU_CD"));
    checkParams.put("P_INBOUND_DATE", rowData.get("P_ORDER_DATE"));
    checkParams.put("P_INBOUND_NO", rowData.get("P_ORDER_NO"));
    checkParams.put("P_LINE_NO", "");
    checkParams.put("P_PROCESS_CD", Consts.PROCESS_ORDER);
    checkParams.put("P_STATE_DIV", "1");

    String oMsg = canProcessingdState(checkParams, CHECK_STATE);
    if (!Consts.OK.equals(oMsg)) {
      throw new RuntimeException(oMsg);
    }

    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      dao.delete(params);
      transactionManager.commit(ts);
      result = Consts.OK;
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
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
   * 입고예정작업 팝업 화면 저장 처리
   *
   * @param params 신규, 수정된 데이터
   */
  @SuppressWarnings("unchecked")
  public String save(Map<String, Object> params) throws Exception {

    // 신규 등록이 아닐 경우 저장 전 입고진행상태 체크
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    String process_Cd = (String)params.get("P_PROCESS_CD");

    if (!Consts.PROCESS_ENTRY_NEW.equals(process_Cd)) {
      Map<String, Object> checkParams = new HashMap<String, Object>();
      // checkParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      checkParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD_ORG"));
      checkParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      checkParams.put("P_INBOUND_DATE", masterDS.get("P_ORDER_DATE_ORG"));
      checkParams.put("P_INBOUND_NO", masterDS.get("P_ORDER_NO"));
      checkParams.put("P_LINE_NO", "");
      checkParams.put("P_PROCESS_CD", Consts.PROCESS_ORDER);
      checkParams.put("P_STATE_DIV", "1");

      String oMsg = canProcessingdState(checkParams, CHECK_STATE);
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

}