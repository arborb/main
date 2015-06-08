package nexos.service.ed;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.JsonDataSet;
import nexos.service.common.CommonDAO;
import nexos.service.common.WCDAO;
import nexos.service.ed.common.EDCommonDAO;
import nexos.service.ed.common.EDCommonService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

/**
 * Class: ED09050EService<br>
 * Description: [재송신]출고확정 관리(ED09050E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("ED09050E")
public class ED09050EService {

  /**
   * DAO 주입처리하기
   */
   @Resource
   private CommonDAO common;
  
   @Resource
   private EDCommonDAO edCommonDAO;
  
   @Resource
   private EDCommonService edCommonService;
  
   @Resource
   private WCDAO wcDao;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return common.getJsonDataSet(queryId, params);
  }

  /**
   * SP 실행 후 처리 결과를 Map 형태로 Return
   */
  @SuppressWarnings("rawtypes")
  public Map callReSendLo(Map<String, Object> params) throws Exception {

    HashMap<String, Object> mapResult = null;

    HashMap<String, Object> callParams = new HashMap<String, Object>();

    callParams.put("P_BU_CD", params.get("P_BU_CD"));
    callParams.put("P_EDI_DIV", params.get("P_EDI_DIV"));
    callParams.put("P_DEFINE_NO", params.get("P_DEFINE_NO"));
    callParams.put("P_SEND_DATE", params.get("P_SEND_DATE"));
    callParams.put("P_USER_ID", params.get("P_USER_ID"));
    callParams.put("P_SEND_DIV", "2"); // 1 - TASKSCHEDULER(ES<TABLE>), 2 - REALTIME(CTCHECKVALUE)
    String checkedValue = (String)params.get("P_CHECKED_VALUE");

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      String oMsg = "";

      // 선택 값 CTCHECKVALUE 테이블에 INSERT
      Map<String, Object> checkedParams = new HashMap<String, Object>();
      checkedParams.put(Consts.PK_CHECKED_VALUE, checkedValue);
      wcDao.insertCheckedValue(checkedParams);

      // 리얼타임 송신 호출
      oMsg = edCommonService.realtimeSendProcessing(callParams);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      transactionManager.commit(ts);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return mapResult;
  }

}