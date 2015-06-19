package nexos.service.lc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.JsonDataSet;
import nexos.common.ibatis.NexosDAO;
import nexos.service.common.CommonDAO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

/**
 * Class: LC04010EService<br>
 * Description: 재고실사(LC04010E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LC04010E")
public class LC04010EService {

  /**
   * DAO 주입처리하기
   */
  @Resource
  private LC04010EDAO                dao;

  @Resource
  private CommonDAO                  common;

  @Resource
  private NexosDAO                   nexosDAO;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return common.getJsonDataSet(queryId, params);
  }

  /**
   * 재고실사 저장 처리
   * 
   * @param params
   *            신규, 수정된 데이터
   */

  @SuppressWarnings("unchecked")
  public String callLcsave(Map<String, Object> params) throws Exception {
    final String PROCEDUREM_ID = "LC_040MSAVE";
    final String PROCEDURED_ID = "LC_040DSAVE";
    final String PROCEDUREUPDATE_ID = "LC_040DUPDATE";
    final String PROCEDUREDELETE_ID = "LC_040DELETE";
    final String LC040NM_GETNO_ID = "WT.LC_040NM_GETNO";
    // final String LC040ND_GETNO_ID = "WT.LC_040ND_GETNO";
    List<Map<String, Object>> detailDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);

    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);

    String user_Id = (String)params.get(Consts.PK_USER_ID);
    String process_Cd = (String)params.get("P_PROCESS_CD");
    String invest_No = null;
    int dsCnt = detailDS.size();
    int line_No = 0;
    // 신규 등록
    if (Consts.PROCESS_ENTRY_NEW.equals(process_Cd)) {

      StringBuffer smResult = new StringBuffer();
      TransactionDefinition tm = new DefaultTransactionDefinition();
      TransactionStatus tg = transactionManager.getTransaction(tm);

      if (dsCnt < 1) {
        throw new RuntimeException("재고실사등록 상세내역이 존재하지 않습니다.");
      }

      // 입고번호 채번
      HashMap<String, Object> mapResult1 = nexosDAO.callSP(LC040NM_GETNO_ID, masterDS);
      String oMsg = (String)mapResult1.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      
      
     // masterDS.put("P_MANAGER_ID", masterDS.get("재고실사"));
      masterDS.put("P_INVEST_END_DATE", masterDS.get("P_INVEST_START_DATE"));
      invest_No = (String)mapResult1.get("O_INVEST_NO");
      masterDS.put("P_INVEST_NO", invest_No);

      // 마스터 생성, CRUD 체크 안함
      try {
        masterDS.put(Consts.PK_USER_ID, user_Id);
        HashMap<String, Object> mapResult = callSP(PROCEDUREM_ID, masterDS);
        oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        // 오류면 Rollback
        if (!Consts.OK.equals(oMsg)) {
          transactionManager.rollback(tg);
          smResult.append(oMsg);
          smResult.append("\r\n");
        }
        transactionManager.commit(tg);
      } catch (Exception e) {
        // SP 내에서 오류가 아니면 Exit
        transactionManager.rollback(tg);
        throw new RuntimeException(e.getMessage());
      }

    }

    // 브랜드 단위 Transaction
    final int dsCnt1 = detailDS.size();
    StringBuffer sbResult = new StringBuffer();
    String oMsg;

    TransactionDefinition td = new DefaultTransactionDefinition();

    for (int i = 0; i < dsCnt1; i++) {

      // SP 호출 파라메터
      Map<String, Object> callParams = detailDS.get(i);
      String crud = (String)callParams.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_C.equals(crud)) {
        // LS_010NM_PROPERTIES_UPDATE 호출
        TransactionStatus ts = transactionManager.getTransaction(td);
        try {
          callParams.put(Consts.PK_USER_ID, user_Id);
          callParams.put("P_INVEST_DATE", masterDS.get("P_INVEST_DATE"));
          callParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
          callParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
          callParams.put("P_INVEST_NO", invest_No);
          if ("".equals(String.valueOf(callParams.get("P_LINE_NO")))) {
            callParams.put("P_LINE_NO", line_No);
            line_No++;
          }
          HashMap<String, Object> mapResult = callSP(PROCEDURED_ID, callParams);
          oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          // 오류면 Rollback
          if (!Consts.OK.equals(oMsg)) {
            transactionManager.rollback(ts);
            sbResult.append(oMsg);
            sbResult.append("\r\n");
            continue;
          }
          transactionManager.commit(ts);
        } catch (Exception e) {
          // SP 내에서 오류가 아니면 Exit
          transactionManager.rollback(ts);
          throw new RuntimeException(e.getMessage());
        }
      } else if (Consts.DV_CRUD_U.equals(crud)) {

        // LS_010NM_PROPERTIES_UPDATE 호출
        TransactionStatus ts = transactionManager.getTransaction(td);
        try {
          callParams.put(Consts.PK_USER_ID, user_Id);
          callParams.put("P_INVEST_DATE", masterDS.get("P_INVEST_DATE"));
          callParams.put("P_INVEST_NO", masterDS.get("P_INVEST_NO"));
          callParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
          callParams.put("P_BU_CD", masterDS.get("P_BU_CD"));

          HashMap<String, Object> mapResult = callSP(PROCEDUREUPDATE_ID, callParams);
          oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          // 오류면 Rollback
          if (!Consts.OK.equals(oMsg)) {
            transactionManager.rollback(ts);
            sbResult.append(oMsg);
            sbResult.append("\r\n");
            continue;
          }
          transactionManager.commit(ts);
        } catch (Exception e) {
          // SP 내에서 오류가 아니면 Exit
          transactionManager.rollback(ts);
          throw new RuntimeException(e.getMessage());
        }

      } else if (Consts.DV_CRUD_D.equals(crud)) {
        // LS_010NM_PROPERTIES_UPDATE 호출
        TransactionStatus ts = transactionManager.getTransaction(td);
        try {
          callParams.put(Consts.PK_USER_ID, user_Id);
          callParams.put("P_INVEST_DATE", masterDS.get("P_INVEST_DATE"));
          callParams.put("P_INVEST_NO", masterDS.get("P_INVEST_NO"));
          callParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
          callParams.put("P_BU_CD", masterDS.get("P_BU_CD"));

          HashMap<String, Object> mapResult = callSP(PROCEDUREDELETE_ID, callParams);
          oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          // 오류면 Rollback
          if (!Consts.OK.equals(oMsg)) {
            transactionManager.rollback(ts);
            sbResult.append(oMsg);
            sbResult.append("\r\n");
            continue;
          }
          transactionManager.commit(ts);
        } catch (Exception e) {
          // SP 내에서 오류가 아니면 Exit
          transactionManager.rollback(ts);
          throw new RuntimeException(e.getMessage());
        }
      }
    }

    if (sbResult.length() == 0) {
      sbResult.append(Consts.OK);
    }
    return sbResult.toString();
  }

  @SuppressWarnings("unchecked")
  public String save(Map<String, Object> params) throws Exception {

    // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
    final String TABLE_DIV = "C";

    // 신규 등록이 아닐 경우 저장 전 입고진행상태 체크
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    String process_Cd = (String)params.get("P_PROCESS_CD");

    if (!Consts.PROCESS_ENTRY_NEW.equals(process_Cd)) {
      Map<String, Object> checkParams = new HashMap<String, Object>();
      checkParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      checkParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      checkParams.put("P_ETC_DATE", masterDS.get("P_INVEST_DATE"));
      checkParams.put("P_ETC_NO", masterDS.get("P_INVEST_NO"));
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
   * 재고실사 삭제 처리
   * 
   * @param params
   *            신규, 수정된 데이터
   */
  @SuppressWarnings("unchecked")
  public String delete(Map<String, Object> params) throws Exception {

    // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
    final String TABLE_DIV = "C";

    List<Map<String, Object>> dateDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    Map<String, Object> masterDS = dateDS.get(0);
    Map<String, Object> checkParams = new HashMap<String, Object>();
    checkParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
    checkParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
    checkParams.put("P_ETC_DATE", masterDS.get("P_INVEST_DATE"));
    checkParams.put("P_ETC_NO", masterDS.get("P_INVEST_NO"));
    checkParams.put("P_TABLE_DIV", TABLE_DIV);

    String oMsg = getConfirmYn(checkParams);
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
   * 재고실사 재고반영 SP 실행 후 처리 결과를 Map 형태로 Return
   */
  @SuppressWarnings("rawtypes")
  public HashMap callLcFwInvestReplectConfirm(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LC_FW_INVEST_REPLECT_CONFIRM";
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
   * ERP 재고실사 전송 SP 실행 후 처리 결과를 Map 형태로 Return
   */
  @SuppressWarnings("rawtypes")
  public HashMap callEsStErpCreation(Map<String, Object> params) throws Exception {
    
    final String PROCEDURE_ID = "ES_ST_ERP_CREATION";
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
   * 재고실사 확정취소 SP 실행 후 처리 결과를 Map 형태로 Return
   */
  @SuppressWarnings("rawtypes")
  public HashMap callLcInvestConfirmBWFW(String procedure_id, Map<String, Object> params) throws Exception {

    HashMap<String, Object> mapResult;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      mapResult = common.callSP(procedure_id, params);

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
