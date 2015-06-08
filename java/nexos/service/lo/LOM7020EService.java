package nexos.service.lo;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.JsonDataSet;
import nexos.common.ibatis.NexosDAO;
import nexos.service.common.CommonDAO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

/**
 * Class: LOM7020EService<br>
 * Description: 온라인출고단품검수(LOM7020E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LOM7020E")
public class LOM7020EService {

  /**
   * DAO 주입처리하기
   */
  @Resource
  private LOM7020EDAO                dao;

  @Resource
  private CommonDAO                  common;

  @Resource
  private NexosDAO                   nexosDAO;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * 출고스캔검수-검수 취소
   * 
   * @param params
   */
  @SuppressWarnings("rawtypes")
  public Map callBWScanConfirm(Map<String, Object> params) throws Exception {

    Map result;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      result = dao.callBWScanConfirm(params);
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
   * 출고스캔검수-박스 삭제(팝업화면에서)
   * 
   * @param params
   */
  public String callScanBoxDelete(Map<String, Object> params) throws Exception {

    String result;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      result = dao.callScanBoxDelete(params);
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
   * 출고스캔검수-박스 통합(팝업화면에서)
   * 
   * @param params
   */
  @SuppressWarnings("rawtypes")
  public Map callScanBoxMerge(Map<String, Object> params) throws Exception {

    Map result;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      result = dao.callScanBoxMerge(params);
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

  /**
   * 출고스캔검수(상품별) 화면 저장 처리
   * 
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

}