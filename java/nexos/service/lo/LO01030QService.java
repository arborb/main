package nexos.service.lo;

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
 * Class: LO01030QService<br>
 * Description: 출고예정내역(LO01030Q) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LO01030Q")
public class LO01030QService {

  // private final Logger logger = LoggerFactory.getLogger(LO01030QService.class);

  /**
   * DAO 주입처리하기 
   */
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
   * 미출예상상품 사업부이관 SP 호출
   * @param params
   * @return
   * @throws Exception
   */
  public String callChangeBu(String queryId, Map<String, Object> params) throws Exception {

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
}