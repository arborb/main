package nexos.service.lo;

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
 * Class: LO02010EService<br>
 * Description: 출고작업(LO02010E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LO02010E")
public class LO02010EService {

  // private final Logger logger = LoggerFactory.getLogger(LO02010EService.class);

  /**
   * DAO 주입처리하기
   */
  @Resource
  private LO02010EDAO                dao;

  @Resource
  private CommonDAO                  common;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * LO_PROCESSING 호출
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  public String callLOProcessing(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LO_PROCESSING";
    final String ENTRY_PROCEDURE_ID = "LO_FW_ENTRY_PROCESSING";

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String process_Cd = (String)params.get("P_PROCESS_CD");
    String direction = (String)params.get("P_DIRECTION");
    String process_State_BW = (String)params.get("P_PROCESS_STATE_BW");
    String process_State_FW = (String)params.get("P_PROCESS_STATE_FW");

    String user_Id = (String)params.get(Consts.PK_USER_ID);
    String outbound_batch = null; // 출고차수
    String outbound_batch_nm = null; // 출고차수명
    String delivery_batch = null; // 배송차수

    // 처리할 수 있는 진행상태
    String CHECK_STATE = "";
    String CHECK_PROCESS_CD = Consts.PROCESS_ENTRY;
    // 처리
    if (Consts.DIRECTION_FW.equals(direction)) {
      CHECK_STATE = process_State_FW;
      if (Consts.PROCESS_ENTRY.equals(process_Cd) || Consts.PROCESS_ENTRY_T1.equals(process_Cd)) {
        CHECK_STATE = Consts.STATE_ORDER;
        CHECK_PROCESS_CD = Consts.PROCESS_ORDER;
      }
    } else {
      // 취소
      CHECK_STATE = process_State_BW;
    }

    HashMap<String, Object> checkParams = new HashMap<String, Object>();
    checkParams.put("P_LINE_NO", ""); // 전표단위
    checkParams.put("P_PROCESS_CD", CHECK_PROCESS_CD);
    checkParams.put("P_STATE_DIV", "1"); // 상태구분([1]MIN, [2]MAX)

    // LO_PROCESSING 호출
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
      String outbound_No = (String)callParams.get("P_OUTBOUND_NO");

      // 진행상태 체크
      checkParams.put("P_CENTER_CD", callParams.get("P_CENTER_CD"));
      checkParams.put("P_BU_CD", callParams.get("P_BU_CD"));
      checkParams.put("P_OUTBOUND_DATE", callParams.get("P_OUTBOUND_DATE"));
      checkParams.put("P_OUTBOUND_NO", outbound_No);
      String oMsg = canProcessingState(checkParams, CHECK_STATE);
      if (!Consts.OK.equals(oMsg)) {
        sbResult.append(oMsg).append(Consts.CRLF);
        continue;
      }

      // LO_PROCESSING 호출11
      TransactionStatus ts = transactionManager.getTransaction(td);
      try {
        // 개별출고등록일 경우 확정처리시 LOBATCH 추가 및 Delivery_Batch 갱신후 처리
        if (Consts.PROCESS_ENTRY_T1.equals(process_Cd) && Consts.DIRECTION_FW.equals(direction)) {
          // 그리드에서 복수 선택해서 등록처리 할 경우 배송차수는 최초 취득한 배송차수로 등록한다.
          if (delivery_batch == null) {
            delivery_batch = (String)params.get("P_DELIVERY_BATCH");
          }
          callParams.put("P_DELIVERY_BATCH_NM", params.get("P_DELIVERY_BATCH_NM"));
          callParams.put("P_DELIVERY_BATCH", delivery_batch);
          callParams.put("P_ORDER_DATE", callParams.get("P_OUTBOUND_DATE"));
          callParams.put("P_ORDER_NO", callParams.get("P_OUTBOUND_NO"));
          callParams.put("P_OUTBOUND_DATE", callParams.get("P_OUTBOUND_DATE_B"));
          // 등록버튼 클릭시의 배송차수가 "000"인 경우만 채번하고 그 외에는 선택한 배송차수로 등록처리한다.
          delivery_batch = dao.deliveryBatch(callParams);
          callParams.put("P_DELIVERY_BATCH", delivery_batch);
          HashMap<String, Object> mapResult = callSP(ENTRY_PROCEDURE_ID, callParams);
          oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          // 배송완료 처리/취소 호출
        } else if (Consts.PROCESS_DELIVERY.equals(process_Cd)) {
          HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, callParams);
          oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        } else {
          // 출고지시일 경우 확정처리시 Outbound_Batch 갱신후 처리
          if (Consts.PROCESS_DIRECTIONS.equals(process_Cd) && Consts.DIRECTION_FW.equals(direction)) {
            // 출고지시 정보에서 1건 이상 선택 했을 경우, 선택한 행을 모두 같은 OUTBOUND_BATH로 설정 해야 함
            if (outbound_batch == null) {
              callParams.put("P_OUTBOUND_BATCH", params.get("P_OUTBOUND_BATCH"));
              callParams.put("P_OUTBOUND_BATCH_NM", params.get("P_OUTBOUND_BATCH_NM"));
            } else {
              callParams.put("P_OUTBOUND_BATCH", outbound_batch);
              callParams.put("P_OUTBOUND_BATCH_NM", outbound_batch_nm);
            }
            outbound_batch = dao.saveDirections(callParams);
          }
          HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, callParams);
          oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        }
        // 오류면 Rollback
        if (!Consts.OK.equals(oMsg)) {
          transactionManager.rollback(ts);
          sbResult.append(oMsg);
          sbResult.append(Consts.CRLF);
          continue;
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

  /**
   * 출고등록(일괄) 출고가능 수량 조정 처리
   * 
   * @param params 조회 조건
   */
  public String callOrderAdjustment(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LO_POLICY_ORDER_ADJUSTMENT_T1";

    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      // 일괄등록처리
      HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, params);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      // 오류면 Rollback
      if (!Consts.OK.equals(oMsg)) {
        transactionManager.rollback(ts);
        result = oMsg;
      } else {
        transactionManager.commit(ts);
        result = Consts.OK;
      }
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return result;
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
   * OUTBOUND_STATE 체크
   * 
   * @param params
   * @param checkState
   * @return
   */
  public String canProcessingState(Map<String, Object> params, String checkState) {

    final String PROCEDURE_ID = "WF.GET_LO_OUTBOUND_STATE";

    String result = Consts.OK;
    HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, params);

    String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
    if (Consts.OK.equals(oMsg)) {
      String oOutboundState = (String)mapResult.get("O_OUTBOUND_STATE");
      if (!checkState.equals(oOutboundState)) {
        result = String.format("[진행상태 : %s] 처리할 수 있는 상태가 아닙니다.\n다시 조회 후 데이터를 확인하십시오.", oOutboundState);
      } else {
        result = oMsg;
      }
    } else {
      result = oMsg;
    }
    return result;
  }

  /**
   * 출고일괄등록/취소 처리
   * 
   * @param params 수정된 데이터
   */
  @SuppressWarnings("unchecked")
  public String entryBatchProcessing(Map<String, Object> params) throws Exception {

    final String PROCEDURE_FW_ID = "LO_FW_ENTRY_BATCH";
    final String PROCEDURE_BW_ID = "LO_BW_ENTRY_BATCH";

    String process_id = null;
    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {

      // 일괄등록처리
      List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
      Map<String, Object> callParams = saveDS.get(0);
      String user_Id = (String)params.get(Consts.PK_USER_ID);
      if (params.get("P_DIRECTION").toString().equals(Consts.DIRECTION_FW)) {
        process_id = PROCEDURE_FW_ID;
      } else {
        process_id = PROCEDURE_BW_ID;
      }

      callParams.put(Consts.PK_USER_ID, user_Id);

      HashMap<String, Object> mapResult = callSP(process_id, callParams);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      // 오류면 Rollback
      if (!Consts.OK.equals(oMsg)) {
        transactionManager.rollback(ts);
        result = oMsg;
      } else {
        transactionManager.commit(ts);
        result = Consts.OK;
      }
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
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSetEntryBT(String queryId, Map<String, Object> params) throws Exception {

    // 출고가능 수량 조정 처리
    callOrderAdjustment(params);

    return common.getJsonDataSet(queryId, params);
  }

  /**
   * 출고등록 마스터/디테일 저장 처리
   * 
   * @param params 신규, 수정된 데이터
   */
  @SuppressWarnings("unchecked")
  public String save(Map<String, Object> params) throws Exception {

    // 신규 등록이 아닐 경우 저장 전 출고진행상태 체크
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
        checkParams.put("P_OUTBOUND_DATE", masterDS.get("P_ORDER_DATE"));
        checkParams.put("P_OUTBOUND_NO", masterDS.get("P_ORDER_NO"));

      } else {
        CHECK_STATE = process_State_BW;
        checkParams.put("P_OUTBOUND_DATE", masterDS.get("P_OUTBOUND_DATE"));
        checkParams.put("P_OUTBOUND_NO", masterDS.get("P_OUTBOUND_NO"));
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
   * 출고확정 저장 처리
   * 
   * @param params 수정된 데이터
   */
  @SuppressWarnings("unchecked")
  public String saveConfirms(Map<String, Object> params) throws Exception {

    // 저장 전 입고진행상태 체크
    Map<String, Object> checkParams = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    String checkState = (String)checkParams.get("P_CHECK_STATE");
    String oMsg = canProcessingState(checkParams, checkState);
    if (!Consts.OK.equals(oMsg)) {
      throw new RuntimeException(oMsg);
    }
    // 입고지시 저장
    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      dao.saveConfirms(params);
      transactionManager.commit(ts);
      result = Consts.OK;
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return result;
  }

  /**
   * 배송완료처리 저장 처리
   * 
   * @param params 신규, 수정된 데이터
   */
  public String saveDelivery(Map<String, Object> params) throws Exception {

    // 진행상태 체크
    @SuppressWarnings("unchecked")
    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    Map<String, Object> rowData = saveDS.get(0);
    Map<String, Object> newParams = new HashMap<String, Object>();
    newParams.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
    newParams.put("P_BU_CD", rowData.get("P_BU_CD"));
    newParams.put("P_OUTBOUND_DATE", rowData.get("P_OUTBOUND_DATE"));
    newParams.put("P_OUTBOUND_NO", rowData.get("P_OUTBOUND_NO"));
    newParams.put("P_LINE_NO", "");
    newParams.put("P_PROCESS_CD", Consts.PROCESS_ENTRY);
    newParams.put("P_STATE_DIV", "1"); // 상태구분([1]MIN, [2]MAX)
    String CHECK_STATE = (String)rowData.get("P_CUR_STATE");

    String oMsg = canProcessingState(newParams, CHECK_STATE);
    if (!Consts.OK.equals(oMsg)) {
      throw new RuntimeException(oMsg);
    }

    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      dao.saveDelivery(params);
      transactionManager.commit(ts);
      result = Consts.OK;
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return result;
  }

  /**
   * 출고등록(일괄) 저장 처리
   * 
   * @param params 수정된 데이터
   */
  public String saveEntryBT(Map<String, Object> params) throws Exception {

    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      dao.saveEntryBT(params);
      transactionManager.commit(ts);
      result = Consts.OK;
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return result;
  }

}