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
 * Class: LOM711EService<br>
 * Description: 온라인출고대물검수(LOM711E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LOM7110E")
public class LOM7110EService {

  /**
   * DAO 주입처리하기
   */
  @Resource
  private LOM7110EDAO                dao;

  @Resource
  private CommonDAO                  common;

  @Resource
  private PlatformTransactionManager transactionManager;
  
  /**
   * 피킹검수 - 용기삭제
   *
   * @param params
   */
  public String callBoxDelete(Map<String, Object> params) throws Exception {
    
    String result;
    
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      result = dao.callBoxDelete(params);
      // 오류면 Rollback
      if (!Consts.OK.equals(result)) {
        transactionManager.rollback(ts);
      }
      transactionManager.commit(ts);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    
    return result;
  }

  /**
   * 출고스캔검수-검수 취소
   *
   * @param params
   */
  @SuppressWarnings("unchecked")
  public String callBWScanConfirm(Map<String, Object> params) throws Exception {
    
    final String FW_PROCEDURE_ID = "LO_BW_SCAN_PICK_PROC";

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    
    final int dsCnt = saveDS.size();
    StringBuffer sbResult = new StringBuffer();
    TransactionDefinition td = new DefaultTransactionDefinition();
    for (int i = 0; i < dsCnt; i++) {

      // SP 호출 파라메터
      Map<String, Object> callParams = saveDS.get(i);
      
      // LO_PROCESSING 호출11
      TransactionStatus ts = transactionManager.getTransaction(td);
      
      try {
        String oMsg;
        //String oErrMsg;
        HashMap<String, Object> mapResult;

        mapResult = callSP(FW_PROCEDURE_ID, callParams);

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
   * 출고스캔검수-검수 완료
   *
   * @param params
   */
  @SuppressWarnings("rawtypes")
  public Map callFWScanConfirm(Map<String, Object> params) throws Exception {

    Map result;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      result = dao.callFWScanConfirm(params);
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

    return common.callSP(queryId, params);
  }

  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return common.getJsonDataSet(queryId, params);
  }

}
