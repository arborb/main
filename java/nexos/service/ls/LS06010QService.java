package nexos.service.ls;

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
 * Class: LS06010QService<br>
 * Description: 입고팔레트재분할(LS06010Q) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LS06010Q")
public class LS06010QService {

  /**
   * DAO 주입처리하기 
   */
  @Resource
  private LS06010QDAO                dao;

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
   * 입고팔레트재분할 저장 처리
   * @param params 신규, 수정된 데이터
   */
  public String save(Map<String, Object> params) throws Exception {

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
   * 자동분할 버튼 클릭시 
   * SP 실행 후 처리 결과를 Map 형태로 Return
   */
  public String setSplitPallet(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "LI_FW_SPLIT_PALLET";

    StringBuffer sbResult = new StringBuffer();

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      HashMap<String, Object> mapResult = common.callSP(PROCEDURE_ID, params);

      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      // 오류면 Rollback
      if (!Consts.OK.equals(oMsg)) {
        sbResult.append(oMsg);
        sbResult.append(Consts.CRLF);
        transactionManager.rollback(ts);
      } else {
        transactionManager.commit(ts);
      }
    } catch (Exception e) {
      // SP 내에서 오류가 아니면 Exit
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    if (sbResult.length() == 0) {
      sbResult.append(Consts.OK);
    }
    return sbResult.toString();
  }

  


/*
  * 딜삭제
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
  /**
   * SP 호출 후 OUTPUT 값을 Map 형태로 Return
   * @param queryId
   * @param params
   * @return
   */
  public HashMap<String, Object> callSP(String queryId, Map<String, Object> params) {

    return common.callSP(queryId, params);
  }
}