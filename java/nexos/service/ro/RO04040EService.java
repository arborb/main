package nexos.service.ro;

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
 * Class: WCService<br>
 * Description: 딜상품 관리(RO04040E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("RO04040E")

public class RO04040EService {

  // private final Logger logger = LoggerFactory.getLogger(RO04040EService.class);

  /**
   * DAO 주입처리하기 
   */
  @Resource
  private RO04040EDAO                dao;

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
   * 딜/딜옵션/딜상품 저장 처리
   * @param params 신규, 수정된 데이터
   */
  public String save(Map<String, Object> params) throws Exception {

    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    
    try {
      dao.saveMaster(params);
      dao.saveDetail(params);
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
   * 운송장 저장처리
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  public String callDelete(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "RO_BOX_DELETE";
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
  public String callInsert(Map<String, Object> params) throws Exception {

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
   * 송장발행 기록 등록 호출
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  public String callWbSave(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "RO_BOX_SAVE";

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);

    // 전표 단위 Transaction
    final int dsCnt = saveDS.size();
    StringBuffer sbResult = new StringBuffer();
    TransactionDefinition td = new DefaultTransactionDefinition();
    for (int i = 0; i < dsCnt; i++) {

      // SP 호출 파라메터
      Map<String, Object> callParams = saveDS.get(i);

      // RO_BOX_SAVE 호출
      TransactionStatus ts = transactionManager.getTransaction(td);
      try {
        HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, callParams);
        String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
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

  
}
