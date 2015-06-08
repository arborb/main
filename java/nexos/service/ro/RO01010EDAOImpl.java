package nexos.service.ro;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: RO01010EDAOImpl<br>
 * Description: RO01010E DAO (Data Access Object)<br>
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
@Repository("RO01010EDAO")
public class RO01010EDAOImpl implements RO01010EDAO {

  @Resource
  private NexosDAO nexosDAO;

  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "RO01010E";
    final String MASTER_TABLE_NM = "RO010NM";
    final String MASTER_INSERT_ID = PRORAM_ID + ".INSERT_" + MASTER_TABLE_NM;
    final String MASTER_UPDATE_ID = PRORAM_ID + ".UPDATE_" + MASTER_TABLE_NM;
    final String DETAIL_TABLE_NM = "RO010ND";
    final String DETAIL_INSERT_ID = PRORAM_ID + ".INSERT_" + DETAIL_TABLE_NM;
    final String DETAIL_UPDATE_ID = PRORAM_ID + ".UPDATE_" + DETAIL_TABLE_NM;
    final String DETAIL_DELETE_ID = PRORAM_ID + ".DELETE_" + DETAIL_TABLE_NM;
   
    final String RO_TABLE_NM = "RO010PM";
    final String RO_INSERT_ID = PRORAM_ID + ".INSERT_" + RO_TABLE_NM;
    final String RO_UPDATE_ID = PRORAM_ID + ".UPDATE_" + RO_TABLE_NM;

    final String RO010NM_GETNO_ID = "WT.RO_010NM_GETNO";
    final String RO010ND_GETNO_ID = "WT.RO_010ND_GETNO";
    final String RO_PROCESSING_ID = "RO_PROCESSING";
    final String RO_OUTBOUND_STATE = "WF.GET_RO_OUTBOUND_STATE";

    // 파라메터 처리
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    Map<String, Object> subDS = (HashMap<String, Object>)params.get(Consts.PK_DS_SUB);
    List<Map<String, Object>> detailDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    // N: 신규 등록
    String process_Cd = (String)params.get("P_PROCESS_CD");
    String user_Id = (String)params.get(Consts.PK_USER_ID);
    String order_No;
    int line_No;
    int dsCnt = detailDS.size();

    // 등록자ID 입력
    masterDS.put(Consts.PK_USER_ID, user_Id);
    subDS.put(Consts.PK_USER_ID, user_Id);

    Map<String, Object> newParams;
    // 신규 등록
    if (Consts.PROCESS_ENTRY_NEW.equals(process_Cd)) {

      if (dsCnt < 1) {
        throw new RuntimeException("출고예정등록 상세내역이 존재하지 않습니다.");
      }

      // 출고번호 채번
      newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_ORDER_DATE", masterDS.get("P_ORDER_DATE"));

      HashMap<String, Object> mapResult = nexosDAO.callSP(RO010NM_GETNO_ID, newParams);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      line_No = 1;

      order_No = (String)mapResult.get("O_ORDER_NO");
      masterDS.put("P_ORDER_NO", order_No);
      subDS.put("P_ORDER_NO", order_No);

      // 마스터 생성, CRUD 체크 안함
      nexosDAO.insert(MASTER_INSERT_ID, masterDS);
      nexosDAO.insert(RO_INSERT_ID, subDS);
    } else {
      // 수정전 상태 체크
      newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_OUTBOUND_DATE", masterDS.get("P_ORDER_DATE"));
      newParams.put("P_OUTBOUND_NO", masterDS.get("P_ORDER_NO"));
      newParams.put("P_LINE_NO", "");
      newParams.put("P_PROCESS_CD", Consts.PROCESS_ORDER);
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
      // 출고순번 채번
      order_No = (String)masterDS.get("P_ORDER_NO");
      newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_ORDER_DATE", masterDS.get("P_ORDER_DATE"));
      newParams.put("P_ORDER_NO", order_No);

      mapResult = nexosDAO.callSP(RO010ND_GETNO_ID, newParams);
      oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      line_No = ((Number)mapResult.get("O_LINE_NO")).intValue();

      // 마스터 수정, 마스터를 수정했으면
      if (Consts.DV_CRUD_U.equals(masterDS.get(Consts.PK_CRUD))) {
        nexosDAO.update(MASTER_UPDATE_ID, masterDS);
      }
      //온라인 부가정보 마스터를 수정했을때 업데이트
      if (Consts.DV_CRUD_U.equals(subDS.get(Consts.PK_CRUD))) {
        nexosDAO.update(RO_UPDATE_ID, subDS);
      }
    }

    // 디테일이 변경되었으면 LO_PROCESSING 호출
    if (dsCnt > 0) {

      // 디테일 처리
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = detailDS.get(i);
        rowData.put(Consts.PK_USER_ID, user_Id);

        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(crud)) {
          rowData.put("P_ORDER_NO", order_No);
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
      newParams.put("P_OUTBOUND_DATE", masterDS.get("P_ORDER_DATE"));
      newParams.put("P_OUTBOUND_NO", order_No);
      newParams.put("P_PROCESS_CD", Consts.PROCESS_ORDER);
      newParams.put("P_DIRECTION", Consts.DIRECTION_FW);
      newParams.put("P_USER_ID", user_Id);

      HashMap<String, Object> mapResult2 = nexosDAO.callSP(RO_PROCESSING_ID, newParams);
      String oMsg = (String)mapResult2.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void delete(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "RO01010E";
    final String DELETE_MASTER_ID = PRORAM_ID + ".DELETE_RO010NM";
    final String DELETE_DETAIL_ID = PRORAM_ID + ".DELETE_RO010ND_ALL";

    int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_D.equals(crud)) {
        nexosDAO.delete(DELETE_DETAIL_ID, rowData);
        nexosDAO.delete(DELETE_MASTER_ID, rowData);
      }
    }
  }
}
