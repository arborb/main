package nexos.service.ro;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: RO03010EDAOImpl<br>
 * Description: RO03010E DAO (Data Access Object)<br>
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
@Repository("RO03010EDAO")
public class RO03010EDAOImpl implements RO03010EDAO {

  // private final Logger logger =
  // LoggerFactory.getLogger(RO03010EDAOImpl.class);

  @Resource
  private NexosDAO nexosDAO;

  final String     RO_PROCESSING_ID = "RO_PROCESSING";

  /**
   * 반출등록 마스터/디테일 저장 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "RO03010E";
    final String MASTER_TABLE_NM = "RO020NM";
    final String MASTER_INSERT_ID = PRORAM_ID + ".INSERT_" + MASTER_TABLE_NM;
    final String MASTER_UPDATE_ID = PRORAM_ID + ".UPDATE_" + MASTER_TABLE_NM;
    final String DETAIL_TABLE_NM = "RO020ND";
    final String DETAIL_INSERT_ID = PRORAM_ID + ".INSERT_" + DETAIL_TABLE_NM;
    final String DETAIL_UPDATE_ID = PRORAM_ID + ".UPDATE_" + DETAIL_TABLE_NM;
    final String DETAIL_DELETE_ID = PRORAM_ID + ".DELETE_" + DETAIL_TABLE_NM;


    final String SUB_TABLE_NM = "RO020PM";
    final String SUB_INSERT_ID = PRORAM_ID + ".INSERT_" + SUB_TABLE_NM;
    final String SUB_UPDATE_ID = PRORAM_ID + ".UPDATE_" + SUB_TABLE_NM;
    
    final String RO020NM_GETNO_ID = "WT.RO_020NM_GETNO";
    final String RO020ND_GETNO_ID = "WT.RO_020ND_GETNO";
    final String RO_OUTBOUND_STATE = "WF.GET_RO_OUTBOUND_STATE";

    final String RO_POLICY_ENTRY_INIT_ID = "RO_POLICY_ENTRY_INIT";

    // 파라메터 처리
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    List<Map<String, Object>> detailDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    Map<String, Object> subDS = (HashMap<String, Object>)params.get(Consts.PK_DS_SUB);
    
    // A: 예정 -> 등록, B: 등록 -> 수정, N: 신규 등록
    String process_Cd = (String)params.get("P_PROCESS_CD");
    String user_Id = (String)params.get(Consts.PK_USER_ID);
    String outbound_No;
    int line_No;
    int dsCnt = detailDS.size();

    // 등록자ID 입력
    masterDS.put(Consts.PK_USER_ID, user_Id);
    subDS.put(Consts.PK_USER_ID, user_Id);

    Map<String, Object> newParams;
    // 등록 처리 -> 예정 > 등록, 신규 등록
    if (Consts.PROCESS_ORDER.equals(process_Cd) || Consts.PROCESS_ENTRY_NEW.equals(process_Cd)) {

      if (dsCnt < 1) {
        throw new RuntimeException("반출등록 상세내역이 존재하지 않습니다.");
      }

      // 반출번호 채번
      newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_OUTBOUND_DATE", masterDS.get("P_OUTBOUND_DATE"));

      HashMap<String, Object> mapResult = nexosDAO.callSP(RO020NM_GETNO_ID, newParams);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      line_No = 1;

      outbound_No = (String)mapResult.get("O_OUTBOUND_NO");
      
      masterDS.put("P_OUTBOUND_NO", outbound_No);

      subDS.put("P_OUTBOUND_NO", outbound_No);

      // 송수신상태 기본값 설정.
      masterDS.put("P_SEND_STATE", "00");

      // 마스터 생성, CRUD 체크 안함
      nexosDAO.insert(MASTER_INSERT_ID, masterDS);

      nexosDAO.insert(SUB_INSERT_ID, subDS);
    } else {
      // 수정전 상태 체크
      newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_OUTBOUND_DATE", masterDS.get("P_OUTBOUND_DATE"));
      newParams.put("P_OUTBOUND_NO", masterDS.get("P_OUTBOUND_NO"));
      newParams.put("P_LINE_NO", "");
      newParams.put("P_PROCESS_CD", Consts.PROCESS_ENTRY);
      newParams.put("P_STATE_DIV", "1"); // 상태구분([1]MIN, [2]MAX)

      HashMap<String, Object> mapResult = nexosDAO.callSP(RO_OUTBOUND_STATE, newParams);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      } else {
        if (!mapResult.get("O_OUTBOUND_STATE").toString().equals(masterDS.get("P_OUTBOUND_STATE").toString())) {
          String errMsg = String.format("[진행상태 : %s] 처리할 수 있는 상태가 아닙니다.\n다시 조회 후 데이터를 확인하십시오.",
              mapResult.get("O_OUTBOUND_STATE").toString());
          throw new RuntimeException(errMsg);
        }
      }

      // 수정 처리
      // 반출순번 채번
      outbound_No = (String)masterDS.get("P_OUTBOUND_NO");
      newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_OUTBOUND_DATE", masterDS.get("P_OUTBOUND_DATE"));
      newParams.put("P_OUTBOUND_NO", outbound_No);

      mapResult = nexosDAO.callSP(RO020ND_GETNO_ID, newParams);
      oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      line_No = ((Number)mapResult.get("O_LINE_NO")).intValue();

      // 마스터 수정, 마스터를 수정했으면
      if (Consts.DV_CRUD_U.equals(masterDS.get(Consts.PK_CRUD))) {
        nexosDAO.update(MASTER_UPDATE_ID, masterDS);

      }

      // 출고부가정보 마스터(온라인고객)를 수정했으면 업데이트
      if (Consts.DV_CRUD_U.equals(subDS.get(Consts.PK_CRUD))) {
        nexosDAO.update(SUB_UPDATE_ID, subDS);
      }

      if (dsCnt > 0) {
        // 지시 초기화
        newParams.clear();
        newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
        newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
        newParams.put("P_OUTBOUND_DATE", masterDS.get("P_OUTBOUND_DATE"));
        newParams.put("P_OUTBOUND_NO", outbound_No);
        newParams.put("P_USER_ID", user_Id);

        HashMap<String, Object> mapResult1 = nexosDAO.callSP(RO_POLICY_ENTRY_INIT_ID, newParams);
        oMsg = (String)mapResult1.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
      }
    }

    // 디테일이 변경되었으면 RO_PROCESSING 호출
    if (dsCnt > 0) {

      // RO020ND테이블에 추가/수정 전에 출고가능량 체크를 한다.
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = detailDS.get(i);
        this.checkingOut_StockQTY(rowData); // 재고체크
      }

      // 디테일 처리
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = detailDS.get(i);
        rowData.put(Consts.PK_USER_ID, user_Id);

        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(crud)) {
          rowData.put("P_OUTBOUND_NO", outbound_No);
          if ("".equals(String.valueOf(rowData.get("P_LINE_NO")))) {
            rowData.put("P_LINE_NO", line_No);
            rowData.put("P_ORGLINE_NO", line_No);
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
      newParams.put("P_OUTBOUND_DATE", masterDS.get("P_OUTBOUND_DATE"));
      newParams.put("P_OUTBOUND_NO", outbound_No);
      newParams.put("P_PROCESS_CD", Consts.PROCESS_ENTRY);
      newParams.put("P_DIRECTION", Consts.DIRECTION_FW);
      newParams.put("P_USER_ID", user_Id);

      String oMsg = "";
      HashMap<String, Object> mapResult2 = nexosDAO.callSP(RO_PROCESSING_ID, newParams);
      oMsg = (String)mapResult2.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
    }

    // 신규등록 혹은 수정등록의 후처리
    // this.closingCarplanCreate(masterDS, user_Id);
  }

  @SuppressWarnings("rawtypes")
  @Override
  public Map callLi_Fw_Directions_Proc(Map<String, Object> params) throws Exception {

    // final String LO_FW_SCAN_CONFIRM_ORDER_ID = "LO_FW_SCAN_CONFIRM";

    return nexosDAO.callSP("RO_FW_DIRECTIONS_PROC", params);
  }
  
  @SuppressWarnings("rawtypes")
  @Override
  public Map callDelete(Map<String, Object> params) throws Exception {

    final String RO_DELETE = "RO030LP_DELETE";

    return nexosDAO.callSP(RO_DELETE, params);
  }
  /**
  /**
   * 반출확정 저장
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  @Override
  public void saveConfirms(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "RO03010E";
    final String MASTER_TABLE_NM = "RO020NM";
    final String MASTER_UPDATE_ID = PRORAM_ID + ".UPDATE_" + MASTER_TABLE_NM;
    final String TABLE_NM = "RO030NM";
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    final String PROCEDURE_ID = "RO_020ND_QTY_UPDATE";

    // 파라메터 처리
    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
    String user_Id = (String)params.get(Consts.PK_USER_ID);
    String process_Cd = (String)params.get("P_PROCESS_CD");

    HashMap<String, Object> mapUpdate = new HashMap<String, Object>();
    mapUpdate.put(Consts.PK_USER_ID, user_Id);
    mapUpdate.put("P_PROCESS_CD", process_Cd);

    // 확정의 비고 등록 위해 추가
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
        nexosDAO.update(UPDATE_ID, rowData);

        // 디테일 업데이트
        mapUpdate.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
        mapUpdate.put("P_BU_CD", rowData.get("P_BU_CD"));
        mapUpdate.put("P_OUTBOUND_DATE", rowData.get("P_OUTBOUND_DATE"));
        mapUpdate.put("P_OUTBOUND_NO", rowData.get("P_OUTBOUND_NO"));
        mapUpdate.put("P_LINE_NO", rowData.get("P_LINE_NO"));

        HashMap<String, Object> mapResult = nexosDAO.callSP(PROCEDURE_ID, mapUpdate);
        String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
      }
    }
  }

  @Override
  @SuppressWarnings("unchecked")
  public void saveSub(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "RO03010E";
    final String TABLE_NM = "RO020PL";
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
  
  /**
   * 상품의 재고 취득
   */
  private void checkingOut_StockQTY(Map<String, Object> rowData) {

    final String GET_PSTOCK_QTY_ID = "WF.GET_RO_PSTOCK_QTY";

    String outbound_no = (String)rowData.get("P_OUTBOUND_NO");
    // 가능량 체크 처리
    Map<String, Object> newParams = new HashMap<String, Object>();
    newParams.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
    newParams.put("P_BU_CD", rowData.get("P_BU_CD"));
    newParams.put("P_BRAND_CD", rowData.get("P_BRAND_CD"));
    newParams.put("P_ITEM_CD", rowData.get("P_ITEM_CD"));
    newParams.put("P_ITEM_STATE", rowData.get("P_ITEM_STATE"));
    newParams.put("P_ITEM_LOT", rowData.get("P_ITEM_LOT"));
    newParams.put("P_POLICY_LO310", "");
    newParams.put("P_POLICY_LO320", "");
    newParams.put("P_OUTBOUND_DATE", outbound_no.equals("") ? "" : rowData.get("P_OUTBOUND_DATE"));
    newParams.put("P_OUTBOUND_NO", outbound_no);

    HashMap<String, Object> mapResult = nexosDAO.callSP(GET_PSTOCK_QTY_ID, newParams);

    String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
    if (!Consts.OK.equals(oMsg)) {
      throw new RuntimeException(oMsg);
    }

    int intPSTOCK_QTY = Integer.parseInt(mapResult.get("O_PSTOCK_QTY").toString());
    int intSumEntry_qty = Integer.parseInt(rowData.get("P_SUM_ENTRY_QTY").toString());
    int intEntry_qty = Integer.parseInt(rowData.get("P_ENTRY_QTY").toString());
    if (intSumEntry_qty > intPSTOCK_QTY) {
      String errMsg = "출고가능량 보다 큰 출고수량을 등록하실 수 없습니다. \n순번[" + rowData.get("P_LINE_NO") + "], 등록수량[" + intEntry_qty
          + "], 출고가능량[" + intPSTOCK_QTY + "]";
      throw new RuntimeException(errMsg);
    }

  }

}
