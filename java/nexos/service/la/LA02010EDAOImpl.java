package nexos.service.la;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: LA02010EDAOImpl<br>
 * Description: LA02010E DAO (Data Access Object)<br>
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
@Repository("LA02010EDAO")
public class LA02010EDAOImpl implements LA02010EDAO {

  @Resource
  private NexosDAO nexosDAO;

  /**
   * 납품예약 등록 시 기등록된 수량에 대한 체크
   */
  private void checkingAppointQTY(Map<String, Object> rowData, int rownum) {

    final String LA_GET_APPOINT_QTY_ID = "LA_GET_APPOINT_QTY";

    Map<String, Object> newParams = new HashMap<String, Object>();
    newParams.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
    newParams.put("P_BU_CD", rowData.get("P_BU_CD"));
    newParams.put("P_REQUEST_DATE", rowData.get("P_REQUEST_DATE"));
    newParams.put("P_REQUEST_NO", rowData.get("P_REQUEST_NO"));
    newParams.put("P_LINE_NO", rowData.get("P_LINE_NO"));

    HashMap<String, Object> mapResult = nexosDAO.callSP(LA_GET_APPOINT_QTY_ID, newParams);

    String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
    if (!Consts.OK.equals(oMsg)) {
      throw new RuntimeException(oMsg);
    }

    int intAppoint_Qty = Integer.parseInt(mapResult.get("O_APPOINT_QTY").toString());
    int intInput_qty = Integer.parseInt(rowData.get("P_INPUT_QTY").toString());

    if (intInput_qty > intAppoint_Qty) {
      String errMsg = "예약가능량 보다 큰 예약수량을 등록하실 수 없습니다. \n[" + String.valueOf(rownum + 1) + "]행, 등록수량[" + intInput_qty
        + "], 예약가능량[" + intAppoint_Qty + "]";
      throw new RuntimeException(errMsg);
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "LA02010E";
    final String MASTER_TABLE_NM = "LA020NM";
    final String MASTER_INSERT_ID = PRORAM_ID + ".INSERT_" + MASTER_TABLE_NM;
    final String DETAIL_TABLE_NM = "LA020ND";
    final String DETAIL_INSERT_ID = PRORAM_ID + ".INSERT_" + DETAIL_TABLE_NM;

    final String LA020NM_GETNO_ID = "WT.LA_020NM_GETNO";
    final String LA_APPOINTSTATE_UPDATE_ID = "LA_APPOINTSTATE_UPDATE";

    // 파라메터 처리
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    List<Map<String, Object>> detailDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    String user_Id = (String)params.get(Consts.PK_USER_ID);
    String appoint_No;
    int line_No;
    int dsCnt = detailDS.size();

    // 등록자ID 입력
    masterDS.put(Consts.PK_USER_ID, user_Id);

    Map<String, Object> newParams;

    if (dsCnt < 1) {
      throw new RuntimeException("납품예정등록 상세내역이 존재하지 않습니다.");
    }

    // 납품예정번호 채번
    newParams = new HashMap<String, Object>();
    newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
    newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
    newParams.put("P_APPOINT_DATE", masterDS.get("P_APPOINT_DATE"));

    HashMap<String, Object> mapResult = nexosDAO.callSP(LA020NM_GETNO_ID, newParams);
    String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
    if (!Consts.OK.equals(oMsg)) {
      throw new RuntimeException(oMsg);
    }

    line_No = 1;

    appoint_No = (String)mapResult.get("O_APPOINT_NO");
    masterDS.put("P_APPOINT_NO", appoint_No);

    // 마스터 생성, CRUD 체크 안함
    nexosDAO.insert(MASTER_INSERT_ID, masterDS);

    if (dsCnt > 0) {

      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = detailDS.get(i);
        this.checkingAppointQTY(rowData, i); // 납품예약 등록 시 기등록된 수량에 대한 체크
      }

      // 디테일 처리
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = detailDS.get(i);
        rowData.put(Consts.PK_USER_ID, user_Id);

        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(crud)) {
          rowData.put("P_APPOINT_NO", appoint_No);
          if ("".equals(String.valueOf(rowData.get("P_LINE_NO")))) {
            rowData.put("P_LINE_NO", line_No);
            line_No++;
          }
          nexosDAO.insert(DETAIL_INSERT_ID, rowData);
        }
      }

      // 진행상태 및 예약수량 수정
      newParams.clear();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_REQUEST_DATE", masterDS.get("P_REQUEST_DATE"));
      newParams.put("P_REQUEST_NO", masterDS.get("P_REQUEST_NO"));
      newParams.put("P_DIRECTION", Consts.DIRECTION_FW);
      newParams.put("P_USER_ID", user_Id);

      HashMap<String, Object> mapResult2 = nexosDAO.callSP(LA_APPOINTSTATE_UPDATE_ID, newParams);
      oMsg = (String)mapResult2.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
    }
  }
}