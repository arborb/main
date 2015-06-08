package nexos.service.cs;

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
 * Class: CS01010EService<br>
 * Description: 사용자관리 내역 조회(CS02010Q) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("CS01010E")
public class CS01010EService {

  // private final Logger logger = LoggerFactory.getLogger(CM01010EService.class);
  @Resource
  private CS01010EDAO                dao;

  @Resource
  private CommonDAO                  common;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * 사용자 복사
   *
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  public Map callUserCopy(Map<String, Object> params) throws Exception {

    Map result;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      result = dao.callUserCopy(params);
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
   * 사용자 삭제
   *
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  public Map callUserDelete(Map<String, Object> params) throws Exception {

    Map result;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      result = dao.callUserDelete(params);
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
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return common.getJsonDataSet(queryId, params);
  }

  /**
   * 사용자 마스터 저장 처리
   *
   * @param params 신규, 수정, 삭제된 데이터
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
   * 사용자별프로그램마스터 저장
   *
   * @param params 삭제된 데이터
   */
  public String saveUserProgram(Map<String, Object> params) throws Exception {

    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      dao.saveUserProgram(params);
      transactionManager.commit(ts);
      result = Consts.OK;
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return result;
  }

}