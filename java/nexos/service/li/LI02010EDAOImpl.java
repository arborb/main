package nexos.service.li;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: LI02010EDAOImpl<br>
 * Description: LI02010E DAO (Data Access Object)<br>
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
@Repository("LI02010EDAO")
public class LI02010EDAOImpl implements LI02010EDAO {

  // private final Logger logger = LoggerFactory.getLogger(LI02010EDAOImpl.class);

  @Resource
  private NexosDAO nexosDAO;

  @SuppressWarnings("rawtypes")
  @Override
  public Map callDelete(Map<String, Object> params) throws Exception {

    final String LI_DELETE = "LI030LP_DELETE";

    return nexosDAO.callSP(LI_DELETE, params);
  }



  @SuppressWarnings("rawtypes")
  @Override
  public Map callLi_Fw_Putaway_Proc(Map<String, Object> params) throws Exception {

    // final String LO_FW_SCAN_CONFIRM_ORDER_ID = "LO_FW_SCAN_CONFIRM";

    return nexosDAO.callSP("LI_FW_PUTAWAY_PROC", params);
  }



  /**
   * 입고등록 마스터/디테일 저장 처리
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "LI02010E";
    final String MASTER_TABLE_NM = "LI020NM";
    final String PRORAM_ID_10 = "LI01010E";
    final String MASTER_TABLE_NM_10 = "LI010NM";
    final String MASTER_INSERT_ID = PRORAM_ID + ".INSERT_" + MASTER_TABLE_NM;
    final String MASTER_UPDATE_ID = PRORAM_ID + ".UPDATE_" + MASTER_TABLE_NM;
    final String MASTER_UPDATE_ID_10 = PRORAM_ID_10 + ".UPDATE_" + MASTER_TABLE_NM_10;
    // final String MASTER_DELETE_ID = PRORAM_ID + ".DELETE_" + MASTER_TABLE_NM;
    final String DETAIL_TABLE_NM = "LI020ND";
    final String DETAIL_INSERT_ID = PRORAM_ID + ".INSERT_" + DETAIL_TABLE_NM;
    final String DETAIL_UPDATE_ID = PRORAM_ID + ".UPDATE_" + DETAIL_TABLE_NM;
    final String DETAIL_DELETE_ID = PRORAM_ID + ".DELETE_" + DETAIL_TABLE_NM;

    final String LI020NM_GETNO_ID = "WT.LI_020NM_GETNO";
    final String LI020ND_GETNO_ID = "WT.LI_020ND_GETNO";
    final String LI_PROCESSING_ID = "LI_PROCESSING";
    final String LI_POLICY_ENTRY_INIT_ID = "LI_POLICY_ENTRY_INIT";

    // 파라메터 처리
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    List<Map<String, Object>> detailDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    // A: 예정 -> 등록, B: 등록 -> 수정, N: 신규 등록
    String process_Cd = (String)params.get("P_PROCESS_CD");
    String user_Id = (String)params.get(Consts.PK_USER_ID);
    String order_date_org = (String)masterDS.get("P_ORDER_DATE");
    String inbound_No;
    int line_No;
    int dsCnt = detailDS.size();

    // 등록자ID 입력
    masterDS.put(Consts.PK_USER_ID, user_Id);
    masterDS.put("P_ORDER_DATE_ORG", order_date_org);

    Map<String, Object> newParams;
    // 등록 처리 -> 예정 > 등록, 신규 등록
    if (Consts.PROCESS_ORDER.equals(process_Cd) || Consts.PROCESS_ENTRY_NEW.equals(process_Cd)) {

      if (dsCnt < 1) {
        throw new RuntimeException("입고등록 상세내역이 존재하지 않습니다.");
      }

      // 입고번호 채번
      newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_INBOUND_DATE", masterDS.get("P_INBOUND_DATE"));

      HashMap<String, Object> mapResult = nexosDAO.callSP(LI020NM_GETNO_ID, newParams);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      line_No = 1;

      inbound_No = (String)mapResult.get("O_INBOUND_NO");
      masterDS.put("P_INBOUND_NO", inbound_No);

      // 마스터 생성, CRUD 체크 안함
      nexosDAO.insert(MASTER_INSERT_ID, masterDS);
      nexosDAO.update(MASTER_UPDATE_ID_10, masterDS);
    } else {
      // 수정 처리
      // 입고순번 채번
      inbound_No = (String)masterDS.get("P_INBOUND_NO");
      newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_INBOUND_DATE", masterDS.get("P_INBOUND_DATE"));
      newParams.put("P_INBOUND_NO", inbound_No);

      HashMap<String, Object> mapResult = nexosDAO.callSP(LI020ND_GETNO_ID, newParams);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      line_No = ((Number)mapResult.get("O_LINE_NO")).intValue();

      // 마스터 수정, 마스터를 수정했으면
      if (Consts.DV_CRUD_U.equals(masterDS.get(Consts.PK_CRUD))) {
        nexosDAO.update(MASTER_UPDATE_ID, masterDS);
        nexosDAO.update(MASTER_UPDATE_ID_10, masterDS);
      }
    }

    // 디테일이 변경되었으면 LI_PROCESSING 호출
    if (dsCnt > 0) {

      // 지시 초기화
      newParams.clear();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_INBOUND_DATE", masterDS.get("P_INBOUND_DATE"));
      newParams.put("P_INBOUND_NO", inbound_No);
      //newParams.put("P_LINE_NO", "");
      //newParams.put("P_LOCID_DELETE_YN", Consts.YES);
      newParams.put("P_USER_ID", user_Id);

      HashMap<String, Object> mapResult1 = nexosDAO.callSP(LI_POLICY_ENTRY_INIT_ID, newParams);
      String oMsg = (String)mapResult1.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      // 디테일 처리
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = detailDS.get(i);
        rowData.put(Consts.PK_USER_ID, user_Id);

        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(crud)) {
          rowData.put("P_INBOUND_NO", inbound_No);
          if ("".equals(String.valueOf(rowData.get("P_LINE_NO")))) {
            rowData.put("P_LINE_NO", line_No);
            line_No++;
          }
          nexosDAO.insert(DETAIL_INSERT_ID, rowData);
        } else if (Consts.DV_CRUD_U.equals(crud)) {
          nexosDAO.update(DETAIL_UPDATE_ID, rowData);
        } else if (Consts.DV_CRUD_D.equals(crud)) {
          nexosDAO.delete(DETAIL_DELETE_ID, rowData);
        }
      }

      newParams.clear();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_INBOUND_DATE", masterDS.get("P_INBOUND_DATE"));
      newParams.put("P_INBOUND_NO", inbound_No);
      newParams.put("P_PROCESS_CD", Consts.PROCESS_ENTRY);
      newParams.put("P_DIRECTION", Consts.DIRECTION_FW);
      newParams.put("P_USER_ID", user_Id);

      HashMap<String, Object> mapResult2 = nexosDAO.callSP(LI_PROCESSING_ID, newParams);
      oMsg = (String)mapResult2.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
  }
    }
  }
  
  
  /**
   * 입고확정/적치 - 입고지시 저장
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  @Override
  public void saveDirections(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "LI02010E";
    final String MASTER_TABLE_NM = "LI020NM";
    final String MASTER_UPDATE_ID = PRORAM_ID + ".UPDATE_" + MASTER_TABLE_NM;
    final String TABLE_NM = "LI030NM";
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    final String PROCEDURE_ID = "LI_020ND_QTY_UPDATE";

    // 파라메터 처리
    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
    String user_Id = (String)params.get(Consts.PK_USER_ID);
    String process_Cd = (String)params.get("P_PROCESS_CD");

    // 디테일 확정수량 수정 Map
    HashMap<String, Object> mapUpdate = new HashMap<String, Object>();
    mapUpdate.put(Consts.PK_USER_ID, user_Id);
    mapUpdate.put("P_PROCESS_CD", process_Cd);

    // 확정의 비고 수정가능하도록 추가
    Map<String, Object> masterParams = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);

    masterParams.put(Consts.PK_USER_ID, user_Id);
    String crud = (String)masterParams.get(Consts.PK_CRUD);
    if (Consts.DV_CRUD_U.equals(crud)) {
      nexosDAO.update(MASTER_UPDATE_ID, masterParams);
    }

    // INSERT/UPDATE/DELETE 처리
    final int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_USER_ID, user_Id);

      crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_U.equals(crud)) {
        // 지시 업데이트
        nexosDAO.update(UPDATE_ID, rowData);

        // 디테일 업데이트
        mapUpdate.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
        mapUpdate.put("P_BU_CD", rowData.get("P_BU_CD"));
        mapUpdate.put("P_INBOUND_DATE", rowData.get("P_INBOUND_DATE"));
        mapUpdate.put("P_INBOUND_NO", rowData.get("P_INBOUND_NO"));
        mapUpdate.put("P_LINE_NO", rowData.get("P_LINE_NO"));

        HashMap<String, Object> mapResult = nexosDAO.callSP(PROCEDURE_ID, mapUpdate);
        String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
        }
      }
    }

  /**
   * 입고지시 - 입고지시 저장
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  @Override
  public void saveDirectionsLocId(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PROCEDURE_ID = "LI_FW_DIRECTIONS_LOCID";

    // 파라메터 처리
    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    // INSERT/UPDATE/DELETE 처리
    final int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_USER_ID, user_Id);

      // 지시 업데이트
      HashMap<String, Object> mapResult = nexosDAO.callSP(PROCEDURE_ID, rowData);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
    }
  }
  @Override
  @SuppressWarnings("unchecked")
  public void saveSub(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "LI02010E";
    final String TABLE_NM = "LI030PL";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
    //final String PROCEDURE_ID = "LI_FW_PUTAWAY_PROC";
    // 상품그룹 소분류 처리
    int dsCnt = saveDS.size();



    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put("P_USER_ID", user_Id);

      nexosDAO.insert(INSERT_ID, rowData);
    }

  }

}
