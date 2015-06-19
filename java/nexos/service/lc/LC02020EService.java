package nexos.service.lc;

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
 * Class: LC02020EService<br>
 * Description: 상태변환관리(LC02020E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LC02020E")
public class LC02020EService {

  @Resource
  private CommonDAO                  common;
  /**
   * DAO 주입처리하기
   */
  @Resource
  private LC02020EDAO                dao;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return common.getJsonDataSet(queryId, params);
  }

  /**
   * 기타입출고관리 - 기타입출고 등록 저장 처리
   * 
   * @param params 신규, 수정된 데이터
   */
  @SuppressWarnings("unchecked")
  public String save(Map<String, Object> params) throws Exception {

    // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
    final String TABLE_DIV = "A";

    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    String process_Cd = (String)params.get("P_PROCESS_CD");

    Map<String, Object> checkParams = new HashMap<String, Object>();
    checkParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
    checkParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
    checkParams.put("P_ETC_DATE", masterDS.get("P_ETC_DATE"));
    checkParams.put("P_INOUT_CD", masterDS.get("P_INOUT_CD"));
    checkParams.put("P_TABLE_DIV", TABLE_DIV);

    String etc_no = null;
    if (!Consts.PROCESS_ENTRY_NEW.equals(process_Cd)) {
      etc_no = (String)masterDS.get("P_ETC_NO");

      checkParams.put("P_ETC_NO", etc_no);
      String oMsg = getConfirmYn(checkParams);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
    }

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
   * 저장/삭제시 확정된 전표일 우 저장/삭제 불가
   * 
   * @param params
   * @param checkState
   * @return
   */
  public String getConfirmYn(Map<String, Object> params) {

    final String PROCEDURE_ID = "WF.GET_LC_CONFIRM_YN";

    String result = Consts.OK;
    HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, params);

    String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
    if (!Consts.OK.equals(oMsg)) {
      result = oMsg;
    } else {
      String oConfirm_Yn = (String)mapResult.get("O_CONFIRM_YN");
      if (Consts.YES.equals(oConfirm_Yn)) {
        result = "이미 확정 처리된 데이터입니다.";
      } else {
        result = oMsg;
      }
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
   * SP 호출
   * 
   * @param params
   * @return
   * @throws Exception
   */
  public String callLCProcessing(String processDiv, Map<String, Object> params) throws Exception {

    final String LC_BW_ETC_ENTRY = "LC_BW_ETC_ENTRY";
    final String LC_BW_ETC_INCONFIRM = "LC_BW_ETC_INCONFIRM";
    final String LC_BW_ETC_OUTCONFIRM = "LC_BW_ETC_OUTCONFIRM";
    final String LC_FW_ETC_INCONFIRM = "LC_FW_ETC_INCONFIRM";
    final String LC_FW_ETC_OUTCONFIRM = "LC_FW_ETC_OUTCONFIRM";
    final String DV_DEL = "DEL";

    String PROCEDURE_ID_E = null;
    String PROCEDURE_ID_D = null;

    if (processDiv.equals(Consts.DIRECTION_FW)) {
      PROCEDURE_ID_E = LC_FW_ETC_INCONFIRM;
      PROCEDURE_ID_D = LC_FW_ETC_OUTCONFIRM;
    } else if (processDiv.equals(Consts.DIRECTION_BW)) {
      PROCEDURE_ID_E = LC_BW_ETC_INCONFIRM;
      PROCEDURE_ID_D = LC_BW_ETC_OUTCONFIRM;
    } else if (processDiv.equals(DV_DEL)) {
      PROCEDURE_ID_E = LC_BW_ETC_ENTRY;
      PROCEDURE_ID_D = LC_BW_ETC_ENTRY;
    }

    Map<String, Object> spParams_E = new HashMap<String, Object>();
    spParams_E.put("P_CENTER_CD", params.get("P_LINK_CENTER_CD"));
    spParams_E.put("P_BU_CD", params.get("P_LINK_BU_CD"));
    spParams_E.put("P_ETC_DATE", params.get("P_LINK_ETC_DATE"));
    spParams_E.put("P_ETC_NO", params.get("P_LINK_ETC_NO"));
    spParams_E.put(Consts.PK_USER_ID, params.get("P_USER_ID"));

    Map<String, Object> spParams_D = new HashMap<String, Object>();
    spParams_D.put("P_CENTER_CD", params.get("P_CENTER_CD"));
    spParams_D.put("P_BU_CD", params.get("P_BU_CD"));
    spParams_D.put("P_ETC_DATE", params.get("P_ETC_DATE"));
    spParams_D.put("P_ETC_NO", params.get("P_ETC_NO"));
    spParams_D.put(Consts.PK_USER_ID, params.get("P_USER_ID"));

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());

    StringBuffer sbResult = new StringBuffer();

    HashMap<String, Object> mapResult_E;
    HashMap<String, Object> mapResult_D;

    try {
      // 삭제일 경우
      if (DV_DEL.equals(processDiv)) {
        spParams_E.put("P_LINE_NO", "");
        spParams_D.put("P_LINE_NO", "");
        mapResult_E = callSP(PROCEDURE_ID_E, spParams_E);
        mapResult_D = callSP(PROCEDURE_ID_D, spParams_D);
        // 확정일 경우
      } else if (Consts.DIRECTION_FW.equals(processDiv)) {
        mapResult_D = callSP(PROCEDURE_ID_D, spParams_D);
        mapResult_E = callSP(PROCEDURE_ID_E, spParams_E);
        // 취소일 경우
      } else {
        mapResult_E = callSP(PROCEDURE_ID_E, spParams_E);
        mapResult_D = callSP(PROCEDURE_ID_D, spParams_D);
      }
      String oMsg_E = (String)mapResult_E.get(Consts.PK_O_MSG);
      String oMsg_D = (String)mapResult_D.get(Consts.PK_O_MSG);
      // 오류면 Rollback
      if (!Consts.OK.equals(oMsg_E) || !Consts.OK.equals(oMsg_D)) {
        transactionManager.rollback(ts);
        if (!Consts.OK.equals(oMsg_E)) {
          sbResult.append(oMsg_E);
          sbResult.append(Consts.CRLF);
        }
        if (!Consts.OK.equals(oMsg_D)) {
          sbResult.append(oMsg_D);
          sbResult.append(Consts.CRLF);
        }
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