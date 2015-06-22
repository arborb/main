package nexos.service.la;

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
 * Class: LA01010E Service<br>
 * Description: 발주등록작업(LA01010E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service
public class LA01010EService {

  /**
   * DAO 주입처리하기
   */
  @Resource
  private LA01010EDAO                dao;

  @Resource
  private CommonDAO                  commonDAO;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * 발주데이터 생성 처리
   * 
   * @param params
   */
  @SuppressWarnings("rawtypes")
  public Map callRequestCreation(Map<String, Object> params) throws Exception {

    Map result;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      result = dao.callRequestCreation(params);
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
   * SP 호출 후 OUTPUT 값을 Map 형태로 Return
   * 
   * @param queryId
   * @param params
   * @return
   */
  public HashMap<String, Object> callSP(String queryId, Map<String, Object> params) {

    return commonDAO.callSP(queryId, params);
  }

  public String canCheckProcess(Map<String, Object> params) {

    final String PROCEDURE_ID = "WF.GET_LA_REQUEST_YN";

    String result = Consts.OK;
    HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, params);
    String request_Date = (String)params.get("P_REQUEST_DATE");
    String request_No = (String)params.get("P_REQUEST_NO");
    String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
    if (Consts.OK.equals(oMsg)) {
      String oRequestYn = (String)mapResult.get("O_REQUEST_YN");
      if (!Consts.NO.equals(oRequestYn)) {
        result = String.format("[발주일자/발주번호 : %s] 발주확정된 전표입니다.", request_Date + "/" + request_No);
      } else {
        result = oMsg;
      }
    } else {
      result = oMsg;
    }
    return result;
  }

  /**
   * 발주등록 삭제 처리
   * 
   * @param params 신규, 수정된 데이터
   */
  @SuppressWarnings("unchecked")
  public String delete(Map<String, Object> params) throws Exception {

    // 저장 전 상태 체크
    List<Map<String, Object>> masterDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);

    final int dsCnt = masterDS.size();
    StringBuffer sbResult = new StringBuffer();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> checkParams = masterDS.get(i);
      TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
      try {
        String oMsg = canCheckProcess(checkParams);
        // 오류면 Rollback
        if (!Consts.OK.equals(oMsg)) {
          transactionManager.rollback(ts);
          sbResult.append(oMsg).append(Consts.CRLF);
        } else {
          dao.delete(checkParams);
          transactionManager.commit(ts);
        }
      } catch (Exception e) {
        transactionManager.rollback(ts);
        throw new RuntimeException(e.getMessage());
      }
    }
    if (sbResult.length() == 0) {
      sbResult.append(Consts.OK);
    } else {
      throw new RuntimeException(sbResult.toString());
    }

    return sbResult.toString();
  }

  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return commonDAO.getJsonDataSet(queryId, params);
  }

  /**
   * 발주등록작업 팝업 화면 저장 처리
   * 
   * @param params 신규, 수정된 데이터
   */
  public String save(Map<String, Object> params) throws Exception {

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
   * 디테일 조정수량 저장 처리
   * 
   * @param params 수정된 데이터
   */
  @SuppressWarnings("unchecked")
  public String saveAdjust(Map<String, Object> params) throws Exception {

    // 저장 전 상태 체크
    List<Map<String, Object>> masterDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    Map<String, Object> rowData = masterDS.get(0);
    Map<String, Object> checkParams = new HashMap<String, Object>();
    checkParams.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
    checkParams.put("P_BU_CD", rowData.get("P_BU_CD"));
    checkParams.put("P_REQUEST_DATE", rowData.get("P_REQUEST_DATE"));
    checkParams.put("P_REQUEST_NO", rowData.get("P_REQUEST_NO"));
    String oMsg = canCheckProcess(checkParams);
    if (!Consts.OK.equals(oMsg)) {
      throw new RuntimeException(oMsg);
    }

    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      dao.saveAdjust(params);
      transactionManager.commit(ts);
      result = Consts.OK;
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return result;
  }

}