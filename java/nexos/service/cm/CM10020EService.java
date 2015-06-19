package nexos.service.cm;

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
 * Class:CM10020EService<br>
 * Description: 이벤트마스터 관리(CM10020E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
 *  1.0        2014-06-03    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 * </pre>
 */

@Service("CM10020E")
public class CM10020EService {

  /**
   * DAO 주입처리하기
   */
  @Resource
  private CM10020EDAO                dao;

  @Resource
  private CommonDAO                  common;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * 이벤트 재적용 SP 호출
   * @param params
   * @return
   * @throws Exception
   */
  public String callProcEventExec(String queryId, Map<String, Object> params) throws Exception {

    StringBuffer sbResult = new StringBuffer();
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());

    try {
      HashMap<String, Object> mapResult = common.callSP(queryId, params);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);

      // 오류면 Rollback
      if (!Consts.OK.equals(oMsg)) {
        transactionManager.rollback(ts);
        sbResult.append(oMsg);
        sbResult.append(Consts.CRLF);
      } else {
        transactionManager.commit(ts);
        sbResult.append(Consts.OK);
      }
    } catch (Exception e) {
      // SP 내에서 오류가 아니면 Exit
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }

    return sbResult.toString();
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
   * 온라인반입예정작업 저장 처리
   *
   * @param params 신규, 수정된 데이터
   */
  public String delete(Map<String, Object> params) throws Exception {

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
   * 입고예정작업 저장 처리
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

}
