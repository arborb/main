package nexos.service.lo;

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
 * Class: LOM9110EService<br>
 * Description: 재고실사(LOM9110E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LOM9110E")
public class LOM9110EService {

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
   * 합포장관리 강제완료/작업취소11
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  public String callPorpertiesUpdate(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LO_HAS_UPDATE_PROC";
    List<Map<String, Object>> spcallDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    // 브랜드 단위 Transaction
    final int dsCnt = spcallDS.size();
    StringBuffer sbResult = new StringBuffer();
    String oMsg;

    TransactionDefinition td = new DefaultTransactionDefinition();
    for (int i = 0; i < dsCnt; i++) {

      // SP 호출 파라메터
      Map<String, Object> callParams = spcallDS.get(i);

      // LS_010NM_PROPERTIES_UPDATE 호출
      TransactionStatus ts = transactionManager.getTransaction(td);
      try {
        callParams.put(Consts.PK_USER_ID, user_Id);
        HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, callParams);
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

    if (sbResult.length() == 0) {
      sbResult.append(Consts.OK);
    }
    return sbResult.toString();
  }

  
  /**
   * 합포장관리 강제완료/작업취소11
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  public String callPorpertiesUpdate1(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LO_HAS_END_PROC";
    List<Map<String, Object>> spcallDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    // 브랜드 단위 Transaction
    final int dsCnt = spcallDS.size();
    StringBuffer sbResult = new StringBuffer();
    String oMsg;

    TransactionDefinition td = new DefaultTransactionDefinition();
    for (int i = 0; i < dsCnt; i++) {

      // SP 호출 파라메터
      Map<String, Object> callParams = spcallDS.get(i);

      // LS_010NM_PROPERTIES_UPDATE 호출
      TransactionStatus ts = transactionManager.getTransaction(td);
      try {
        callParams.put(Consts.PK_USER_ID, user_Id);
        HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, callParams);
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

    if (sbResult.length() == 0) {
      sbResult.append(Consts.OK);
    }
    return sbResult.toString();
  }

  /**
   * 재고속성변경처리
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  public String callLineproc(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LO_HAS_LINE_PROC";
    List<Map<String, Object>> spcallDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    // 브랜드 단위 Transaction
    final int dsCnt = spcallDS.size();
    StringBuffer sbResult = new StringBuffer();
    StringBuffer sbResult1 = new StringBuffer();
    String oMsg;
    String oMsg2;
    String oHasNo;
    TransactionDefinition td = new DefaultTransactionDefinition();
    for (int i = 0; i < dsCnt; i++) {

      // SP 호출 파라메터
      Map<String, Object> callParams = spcallDS.get(i);
//      Map<String, Object> test;
      // LS_010NM_PROPERTIES_UPDATE 호출
      TransactionStatus ts = transactionManager.getTransaction(td);
      try {
        callParams.put(Consts.PK_USER_ID, user_Id);
        HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, callParams);
        oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        //oMsg2 = (String)mapResult.get(Consts.PK_O_MSG2);
        oHasNo = (String)mapResult.get(Consts.PK_O_HAS_NO);
        
        // 오류면 Rollback
        if (!Consts.OK.equals(oMsg)) {
          transactionManager.rollback(ts);
          sbResult.append(oMsg);
          sbResult.append(Consts.CRLF);
          continue;
        }
        
        
        sbResult.append(",");
        sbResult.append(oHasNo);  
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
   * 합포장관리 강제완료/작업취소11
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  public String callProc_Bw(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LO_HAS_PROC_BW";
    List<Map<String, Object>> spcallDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    // 브랜드 단위 Transaction
    final int dsCnt = spcallDS.size();
    StringBuffer sbResult = new StringBuffer();
    String oMsg;

    TransactionDefinition td = new DefaultTransactionDefinition();
    for (int i = 0; i < dsCnt; i++) {

      // SP 호출 파라메터
      Map<String, Object> callParams = spcallDS.get(i);

      // LS_010NM_PROPERTIES_UPDATE 호출
      TransactionStatus ts = transactionManager.getTransaction(td);
      try {
        callParams.put(Consts.PK_USER_ID, user_Id);
        HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, callParams);
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

    if (sbResult.length() == 0) {
      sbResult.append(Consts.OK);
    }
    return sbResult.toString();
  }

}