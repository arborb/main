package nexos.service.cs;

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
 * Class: CS03020EService<br>
 * Description: 브랜드별 프로세스 관리(CS03020E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("CS03020E")
public class CS03020EService {

  // private final Logger logger = LoggerFactory.getLogger(CS03020EService.class);

  /**
   * DAO 주입처리하기 
   */
  @Resource
  private CS03020EDAO                dao;

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
   * 브랜드별 프로세스 마스터 저장 처리
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
   * SP 실행 후 처리 결과를 Map 형태로 Return
   */
  @SuppressWarnings("rawtypes")
  public Map callBuProcessCopy(String queryId, Map<String, Object> params) throws Exception {

    HashMap<String, Object> result;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      result = common.callSP(queryId, params);

      String oMsg = (String)result.get(Consts.PK_O_MSG);
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

}
