package nexos.service.lx;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: LX02010EDAOImpl<br>
 * Description: LX02010E DAO (Data Access Object)<br>
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
@Repository("LX02010EDAO")
public class LX02010EDAOImpl implements LX02010EDAO {

  // private final Logger logger = LoggerFactory.getLogger(LX02010EDAOImpl.class);

  @Resource
  private NexosDAO nexosDAO;

  /**
   * X-DOCK 프로세스별 수량 저장 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @Override
  public void save(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "LX02010E";
    final String DETAIL20_TABLE_NM = "LX020ND";
    final String DETAIL20_UPDATE_INSPECT_QTY_ID = PRORAM_ID + ".UPDATE_" + DETAIL20_TABLE_NM + "_INSPECT_QTY";
    final String SUB20_TABLE_NM = "LX020NS";
    final String SUB20_UPDATE_INSPECT_QTY_ID = PRORAM_ID + ".UPDATE_" + SUB20_TABLE_NM + "_INSPECT_QTY";
    final String SUB20_UPDATE_DISTRIBUTE_QTY_ID = PRORAM_ID + ".UPDATE_" + SUB20_TABLE_NM + "_DISTRIBUTE_QTY";
    final String SUB20_UPDATE_DELIVERY_QTY_ID = PRORAM_ID + ".UPDATE_" + SUB20_TABLE_NM + "_DELIVERY_QTY";

    // A: 예정 -> 등록, B: 등록 -> 수정
    String process_Cd = (String)params.get("P_PROCESS_CD");
    String crud = (String)params.get(Consts.PK_CRUD);
    if (Consts.DV_CRUD_C.equals(crud)) {

    } else if (Consts.DV_CRUD_U.equals(crud)) {

      if (Consts.PROCESS_ORDER.equals(process_Cd)) {

      } else if (Consts.PROCESS_ENTRY.equals(process_Cd)) {

      } else if (Consts.PROCESS_XINSPECT.equals(process_Cd)) {
        // LX020ND 검수수량 수정
        nexosDAO.update(DETAIL20_UPDATE_INSPECT_QTY_ID, params);
      } else if (Consts.PROCESS_XINSPECT_ASN.equals(process_Cd)) {
        // LX020NS 검수수량 수정
        nexosDAO.update(SUB20_UPDATE_INSPECT_QTY_ID, params);
      } else if (Consts.PROCESS_XDISTRIBUTE.equals(process_Cd)) {
        // LX020NS 분배수량 수정
        nexosDAO.update(SUB20_UPDATE_DISTRIBUTE_QTY_ID, params);
      } else if (Consts.PROCESS_XCONFIRM.equals(process_Cd)) {

      } else if (Consts.PROCESS_XDELIVERY.equals(process_Cd)) {
        // LX020ND 미배송수량 및 미배송사유, 내역 수정
        nexosDAO.update(SUB20_UPDATE_DELIVERY_QTY_ID, params);
      }

    } else if (Consts.DV_CRUD_D.equals(crud)) {

    }

  }

  /**
   * X-DOCK 예정 등록수량 수정 후 등록처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  @Override
  public void saveEntry(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "LX02010E";
    final String DETAIL10_TABLE_NM = "LX010ND";
    final String DETAIL10_UPDATE10_ENTRY_QTY_ID = PRORAM_ID + ".UPDATE_" + DETAIL10_TABLE_NM + "_ENTRY_QTY";
    final String ENTRY_PROCEDURE_ID = "LX_FW_ENTRY_PROCESSING";

    // 파라메터 처리
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    List<Map<String, Object>> detailDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    // A: 예정 -> 등록, B: 등록 -> 수정
    String process_Cd = (String)params.get("P_PROCESS_CD");
    String user_Id = (String)params.get(Consts.PK_USER_ID);
    int dsCnt = detailDS.size();

    // 등록자ID 입력
    masterDS.put(Consts.PK_USER_ID, user_Id);

    if (dsCnt > 0) {

      // 디테일 처리
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = detailDS.get(i);
        rowData.put(Consts.PK_USER_ID, user_Id);
        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(crud)) {

        } else if (Consts.DV_CRUD_U.equals(crud)) {
          // LX010ND 등록수량 수정
          nexosDAO.update(DETAIL10_UPDATE10_ENTRY_QTY_ID, rowData);
        } else if (Consts.DV_CRUD_D.equals(crud)) {

        }
      }

      // 예정 > 등록 (A) 처리 프로시져 실행(등록탭의 수정팝업창에서 저장했을때만 수행)
      if (Consts.PROCESS_ORDER.equals(process_Cd)) {

        Map<String, Object> newParams = new HashMap<String, Object>();
        newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
        newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
        newParams.put("P_ORDER_DATE", masterDS.get("P_ORDER_DATE"));
        newParams.put("P_ORDER_NO", masterDS.get("P_ORDER_NO"));
        newParams.put("P_XDOCK_DATE", masterDS.get("P_XDOCK_DATE"));
        newParams.put("P_USER_ID", user_Id);

        HashMap<String, Object> mapResult2 = nexosDAO.callSP(ENTRY_PROCEDURE_ID, newParams);
        String oMsg = (String)mapResult2.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
      }
    }

  }

}