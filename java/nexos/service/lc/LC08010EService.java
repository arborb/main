package nexos.service.lc;

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
 * Class: LC08010EService<br>
 * Description: 부자재입출고관리(LC08010E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LC08010E")
public class LC08010EService {

  @Resource
  private CommonDAO                  common;
  /**
   * DAO 주입처리하기
   */
  @Resource
  private LC01010EDAO                dao;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * 삭제/확정/취소시 SP 호출
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
    final String IN_CD = "E";

    Map<String, Object> spParams = new HashMap<String, Object>();
    spParams.put("P_CENTER_CD", params.get("P_CENTER_CD"));
    spParams.put("P_BU_CD", params.get("P_BU_CD"));
    spParams.put("P_ETC_DATE", params.get("P_ETC_DATE"));
    spParams.put("P_ETC_NO", params.get("P_ETC_NO"));
    spParams.put(Consts.PK_USER_ID, params.get("P_USER_ID"));

    String PROCEDURE_ID = null;
    String inout_cd = params.get("P_INOUT_CD").toString().substring(0, 1);
    if (inout_cd.equals(IN_CD)) {
      if (processDiv.equals(Consts.DIRECTION_FW)) {
        PROCEDURE_ID = LC_FW_ETC_INCONFIRM;
      } else if (processDiv.equals(Consts.DIRECTION_BW)) {
        PROCEDURE_ID = LC_BW_ETC_INCONFIRM;
      } else {
        PROCEDURE_ID = LC_BW_ETC_ENTRY;
        spParams.put("P_LINE_NO", "");
      }
    } else {
      if (processDiv.equals(Consts.DIRECTION_FW)) {
        PROCEDURE_ID = LC_FW_ETC_OUTCONFIRM;
      } else if (processDiv.equals(Consts.DIRECTION_BW)) {
        PROCEDURE_ID = LC_BW_ETC_OUTCONFIRM;
      } else {
        PROCEDURE_ID = LC_BW_ETC_ENTRY;
        spParams.put("P_LINE_NO", "");
      }
    }

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());

    StringBuffer sbResult = new StringBuffer();

    try {
      HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, spParams);
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
   * 저장/삭제시 확정된 전표일 경우 저장/삭제 불가
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

    final String LC_FW_STOCK_IN_ORDER = "LC_FW_STOCK_IN_ORDER";
    final String LC_FW_STOCK_OUT_ORDER = "LC_FW_STOCK_OUT_ORDER";
    final String LC_BW_ETC_ENTRY = "LC_BW_ETC_ENTRY";

    // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
    final String TABLE_DIV = "A";

    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    List<Map<String, Object>> subDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
    String procedure_id = null;
    int ssCnt = subDS.size();
    String user_Id = (String)params.get(Consts.PK_USER_ID);
    String process_Cd = (String)params.get("P_PROCESS_CD");

    Map<String, Object> spParams = new HashMap<String, Object>();
    spParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
    spParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
    spParams.put("P_ETC_DATE", masterDS.get("P_ETC_DATE"));
    spParams.put("P_INOUT_CD", masterDS.get("P_INOUT_CD"));
    spParams.put("P_REMARK1", masterDS.get("P_REMARK1"));
    spParams.put("P_TABLE_DIV", TABLE_DIV);
    spParams.put(Consts.PK_USER_ID, user_Id);

    String etc_no = null;
    if (!Consts.PROCESS_ENTRY_NEW.equals(process_Cd)) {
      etc_no = (String)masterDS.get("P_ETC_NO");

      spParams.put("P_ETC_NO", etc_no);
      String oMsg = getConfirmYn(spParams);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
    }

    if (masterDS.get("P_INOUT_CD").toString().substring(0, 1).equals("D")) {
      procedure_id = LC_FW_STOCK_OUT_ORDER;
    } else {
      procedure_id = LC_FW_STOCK_IN_ORDER;
    }

    String result = Consts.ERROR;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {

      if (ssCnt > 0) {
        for (int i = 0; i < ssCnt; i++) {
          Map<String, Object> rowData = subDS.get(i);

          String crud = (String)rowData.get(Consts.PK_CRUD);
          if (Consts.DV_CRUD_C.equals(crud)) {
            if (!rowData.get("P_CONFIRM_QTY").toString().equals("0")) {
              spParams.put("P_ETC_DIV", rowData.get("P_ETC_DIV"));
              spParams.put("P_ETC_COMMENT", rowData.get("P_ETC_COMMENT"));
              spParams.put("P_LOCATION_CD", rowData.get("P_LOCATION_CD"));
              spParams.put("P_BRAND_CD", rowData.get("P_BRAND_CD"));
              spParams.put("P_ITEM_CD", rowData.get("P_ITEM_CD"));
              spParams.put("P_ITEM_STATE", rowData.get("P_ITEM_STATE"));
              spParams.put("P_ITEM_LOT", rowData.get("P_ITEM_LOT"));
              spParams.put("P_VALID_DATE", rowData.get("P_VALID_DATE"));
              spParams.put("P_BATCH_NO", rowData.get("P_BATCH_NO"));
              spParams.put("P_CONFIRM_QTY", rowData.get("P_CONFIRM_QTY"));
              // etc_no가 null인 경우는 신규인 경우
              if (etc_no != null) {
                spParams.put("P_ETC_NO", etc_no);
              } else {
                spParams.put("P_ETC_NO", "");
              }
              HashMap<String, Object> mapResult = common.callSP(procedure_id, spParams);
              String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
              if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
              }
              if (etc_no == null) {
                etc_no = (String)mapResult.get("O_ETC_NO");
              }
            }
          } else if (Consts.DV_CRUD_D.equals(crud)) {
            spParams.put("P_ETC_NO", masterDS.get("P_ETC_NO"));
            spParams.put("P_LINE_NO", rowData.get("P_LINE_NO"));
            HashMap<String, Object> mapResult = common.callSP(LC_BW_ETC_ENTRY, spParams);
            String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
            if (!Consts.OK.equals(oMsg)) {
              throw new RuntimeException(oMsg);
            }
          } else if (Consts.DV_CRUD_U.equals(crud)) {
            spParams.put("P_ETC_NO", masterDS.get("P_ETC_NO"));
            spParams.put("P_ETC_DIV", rowData.get("P_ETC_DIV"));
            spParams.put("P_ETC_COMMENT", rowData.get("P_ETC_COMMENT"));
            spParams.put("P_LINE_NO", rowData.get("P_LINE_NO"));
            dao.save(spParams);
          }
        }
      }
      transactionManager.commit(ts);
      result = Consts.OK;
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return result;
  }
}
