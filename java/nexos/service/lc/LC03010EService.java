package nexos.service.lc;

import java.util.HashMap;
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
 * Class: LC03010EService<br>
 * Description: 재고이동(LC03010E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LC03010E")
public class LC03010EService {

  /**
   * DAO 주입처리하기
   */
  @Resource
  private LC03010EDAO                dao;

  @Resource
  private CommonDAO                  common;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return common.getJsonDataSet(queryId, params);
  }

  /**
   * 재고이동 저장 처리
   * @param params
   * 신규, 수정된 데이터
   */
  @SuppressWarnings("unchecked")
  public String save(Map<String, Object> params) throws Exception {

    // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
    final String TABLE_DIV = "B";

    // 신규 등록이 아닐 경우 저장 전 입고진행상태 체크
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    String process_Cd = (String)params.get("P_PROCESS_CD");

    if (!Consts.PROCESS_ENTRY_NEW.equals(process_Cd)) {
      Map<String, Object> checkParams = new HashMap<String, Object>();
      checkParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      checkParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      checkParams.put("P_ETC_DATE", masterDS.get("P_MOVE_DATE"));
      checkParams.put("P_ETC_NO", masterDS.get("P_MOVE_NO"));
      checkParams.put("P_TABLE_DIV", TABLE_DIV);

      String oMsg = getConfirmYn(checkParams);
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
   * 저장/삭제시 확정된 전표일 우 저장/삭제 불가
   * 
   * @param params
   * @param checkState
   * @return
   */
  public String getConfirmYn(Map<String, Object> params) {

    final String PROCEDURE_ID = "WF.GET_LC_CONFIRM_YN";

    String result = Consts.OK;
    HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, params);

    String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
    if (!Consts.OK.equals(oMsg)) {
      result = oMsg;
    } else {
      String oConfirm_Yn = (String)mapResult.get("O_CONFIRM_YN");
      if (Consts.YES.equals(oConfirm_Yn)) {
        result = "이미 확정 처리된 데이터입니다.";
      } else {
        result = oMsg;
      }
    }
    return result;
  }

  /**
   * SP 실행 후 처리 결과를 Map 형태로 Return
   */
  @SuppressWarnings("rawtypes")
  public HashMap callLcBwMoveEntry(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LC_BW_MOVE_ENTRY";
    HashMap<String, Object> mapResult;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      mapResult = common.callSP(PROCEDURE_ID, params);

      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      transactionManager.commit(ts);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return mapResult;
  }

  /**
   * SP 실행 후 처리 결과를 Map 형태로 Return
   */
  @SuppressWarnings("rawtypes")
  public HashMap callLcMoveConfirm(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LC_FW_MOVE_CONFIRM";
    HashMap<String, Object> mapResult;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      mapResult = common.callSP(PROCEDURE_ID, params);

      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      transactionManager.commit(ts);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return mapResult;
  }

  /**
   * 긴급보충 SP 실행 후 처리 결과를 Map 형태로 Return
   */
  @SuppressWarnings("rawtypes")
  public HashMap callLcFWFillupEmergencyEntry(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LC_FW_FILLUP_EMERGENCY_ENTRY";
    HashMap<String, Object> mapResult;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      mapResult = common.callSP(PROCEDURE_ID, params);

      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      transactionManager.commit(ts);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return mapResult;
  }
  
  /**
   * 피킹존안전재고보충 SP 실행 후 처리 결과를 Map 형태로 Return
   */
  @SuppressWarnings("rawtypes")
  public HashMap callLcFWFillupSafetyEntry(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LC_FW_FILLUP_SAFETY_ENTRY";
    HashMap<String, Object> mapResult;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      mapResult = common.callSP(PROCEDURE_ID, params);

      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      transactionManager.commit(ts);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return mapResult;
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

}