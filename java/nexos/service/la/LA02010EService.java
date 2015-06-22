package nexos.service.la;

import java.util.HashMap;
import java.util.List;
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
 * Class: LA02010E Service<br>
 * Description: 납품예약관리(LA02010E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service
public class LA02010EService {

  /**
   * DAO 주입처리하기
   */
  @Resource
  private LA02010EDAO                dao;

  @Resource
  private CommonDAO                  commonDAO;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * 발주확정/취소 처리
   * 
   * @param params
   */
  @SuppressWarnings("unchecked")
  public String callAppointMentCancel(Map<String, Object> params) throws Exception {

    final String LA_APPOINTMENT_CANCEL_ID = "LA_APPOINTMENT_CANCEL";

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final int dsCnt = saveDS.size();
    StringBuffer sbResult = new StringBuffer();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> callParams = saveDS.get(i);
      callParams.put(Consts.PK_USER_ID, user_Id);

      TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
      try {
        HashMap<String, Object> mapResult = callSP(LA_APPOINTMENT_CANCEL_ID, callParams);
        String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        // 오류면 Rollback
        if (!Consts.OK.equals(oMsg)) {
          transactionManager.rollback(ts);
          sbResult.append(oMsg).append(Consts.CRLF);
        } else {
          transactionManager.commit(ts);
        }
      } catch (Exception e) {
        transactionManager.rollback(ts);
        throw new RuntimeException(e.getMessage());
      }
    }
    if (sbResult.length() == 0) {
      sbResult.append(Consts.OK);
    } else {
      throw new RuntimeException(sbResult.toString());
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

    return commonDAO.callSP(queryId, params);
  }

  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return commonDAO.getJsonDataSet(queryId, params);
  }

  /**
   * 납품예약등록작업 팝업 화면 저장 처리
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