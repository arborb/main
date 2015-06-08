package nexos.service.lo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.JsonDataSet;
import nexos.common.ibatis.NexosDAO;
import nexos.service.common.CommonDAO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

/**
 * Class: LOM8010QService<br>
 * Description: 주문보류관리(LOM8010Q) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LOM8010Q")
public class LOM8010QService {

  /**
   * DAO 주입처리하기
   */
  @Resource
  private CommonDAO                  common;

  @Resource
  private NexosDAO                   nexosDAO;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * 주문보류 프로시져 호출
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  public String callOrderHold(Map<String, Object> params) throws Exception {

    final String FW_PROCEDURE_ID = "LO_FW_ORDER_HOLD";
    final String BW_PROCEDURE_ID = "LO_BW_ORDER_HOLD";
    // final String CW_PROCEDURE_ID = "LO_BW_ORDER_PROC_IF";
    // final String CC_PROCEDURE_ID = "LO_BW_ORDER_PROC_TYPE1";
    final String CW_PROCEDURE_ID = "LO_BW_ORDER_PROC_ENTRY";
    final String CC_PROCEDURE_ID = "LO_BW_ORDER_PROC_CLOSE";
    final String CE_PROCEDURE_ID = "LO_BW_ORDER_PROC";

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String direction = (String)params.get("P_DIRECTION");
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    // 전표 단위 Transaction
    final int dsCnt = saveDS.size();
    StringBuffer sbResult = new StringBuffer();
    TransactionDefinition td = new DefaultTransactionDefinition();
    for (int i = 0; i < dsCnt; i++) {

      // SP 호출 파라메터
      Map<String, Object> callParams = saveDS.get(i);
      callParams.put(Consts.PK_USER_ID, user_Id);

      // LO_PROCESSING 호출11
      TransactionStatus ts = transactionManager.getTransaction(td);
      try {
        String oMsg;
        HashMap<String, Object> mapResult;

        if (Consts.DIRECTION_FW.equals(direction)) {
          mapResult = callSP(FW_PROCEDURE_ID, callParams);
        } else if (Consts.DIRECTION_BW.equals(direction)) {
          mapResult = callSP(BW_PROCEDURE_ID, callParams);
        } else if ("CC".equals(direction)) {
          mapResult = callSP(CC_PROCEDURE_ID, callParams);
        } else if ("CE".equals(direction)) {
          mapResult = callSP(CE_PROCEDURE_ID, callParams);
        } else {
          mapResult = callSP(CW_PROCEDURE_ID, callParams);
        }

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