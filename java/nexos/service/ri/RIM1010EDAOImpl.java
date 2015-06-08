package nexos.service.ri;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: RIM1010EDAOImpl<br>
 * Description: RI01010E DAO (Data Access Object)<br>
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
@Repository("RIM1010EDAO")
public class RIM1010EDAOImpl implements RIM1010EDAO {

  @Resource
  private NexosDAO nexosDAO;

  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "RIM1010E";
    final String MASTER_TABLE_NM = "RI010NM";
    final String MASTER_INSERT_ID = PRORAM_ID + ".INSERT_" + MASTER_TABLE_NM;
    final String MASTER_UPDATE_ID = PRORAM_ID + ".UPDATE_" + MASTER_TABLE_NM;
    final String DETAIL_TABLE_NM = "RI010ND";
    final String DETAIL_INSERT_ID = PRORAM_ID + ".INSERT_" + DETAIL_TABLE_NM;
    final String DETAIL_UPDATE_ID = PRORAM_ID + ".UPDATE_" + DETAIL_TABLE_NM;
    final String DETAIL_DELETE_ID = PRORAM_ID + ".DELETE_" + DETAIL_TABLE_NM;
    // 온라인반입예정테이블
    final String SUB_TABLE_NM = "RI010PM";
    final String SUB_INSERT_ID = PRORAM_ID + ".INSERT_" + SUB_TABLE_NM;
    final String SUB_UPDATE_ID = PRORAM_ID + ".UPDATE_" + SUB_TABLE_NM;

    final String RI010NM_GETNO_ID = "WT.RI_010NM_GETNO";
    final String RI010ND_GETNO_ID = "WT.RI_010ND_GETNO";
    final String RI_PROCESSING_ID = "RI_PROCESSING";

    // 파라메터 처리
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    Map<String, Object> subDS = (HashMap<String, Object>)params.get(Consts.PK_DS_SUB);
    List<Map<String, Object>> detailDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    // N: 신규 등록
    String process_Cd = params.get("P_PROCESS_CD").toString();
    String user_Id = params.get(Consts.PK_USER_ID).toString();
    String order_No;
    int line_No;
    int dsCnt = detailDS.size();

    // 등록자ID 입력
    masterDS.put(Consts.PK_USER_ID, user_Id);

    Map<String, Object> newParams = null;
    // 신규 등록
    if (Consts.PROCESS_ENTRY_NEW.equals(process_Cd)) {

      if (dsCnt < 1) {
        throw new RuntimeException("온라인 반입예정등록 상세내역이 존재하지 않습니다.");
      }

      // 입고번호 채번
      newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_ORDER_DATE", masterDS.get("P_ORDER_DATE"));

      HashMap<String, Object> mapResult = nexosDAO.callSP(RI010NM_GETNO_ID, newParams);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      order_No = (String)mapResult.get("O_ORDER_NO");
      masterDS.put("P_ORDER_NO", order_No);
      subDS.put("P_ORDER_NO", order_No);

      // 마스터 생성, CRUD 체크 안함
      nexosDAO.insert(MASTER_INSERT_ID, masterDS);
      nexosDAO.insert(SUB_INSERT_ID, subDS);
    } else {
      // 수정 처리
      order_No = masterDS.get("P_CENTER_CD").toString(); // 수정(신규디테일)시 등록시 사용
      // 마스터를 수정했으면 업데이트
      if (Consts.DV_CRUD_U.equals(masterDS.get(Consts.PK_CRUD))) {
        nexosDAO.update(MASTER_UPDATE_ID, masterDS);
      }
      // 출고부가정보 마스터(온라인고객)를 수정했으면 업데이트
      if (Consts.DV_CRUD_U.equals(subDS.get(Consts.PK_CRUD))) {
        nexosDAO.update(SUB_UPDATE_ID, subDS);
      }

    }

    // 디테일이 변경되었으면 RI_PROCESSING 호출
    if (dsCnt > 0) {
      // 디테일 처리
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = detailDS.get(i);
        rowData.put(Consts.PK_USER_ID, user_Id);

        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(crud)) {
          // 입고순번 채번
          order_No = (String)masterDS.get("P_ORDER_NO");
          newParams = new HashMap<String, Object>();
          newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
          newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
          newParams.put("P_ORDER_DATE", masterDS.get("P_ORDER_DATE"));
          newParams.put("P_ORDER_NO", order_No);

          HashMap<String, Object> mapResult = nexosDAO.callSP(RI010ND_GETNO_ID, newParams);
          String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }

          line_No = ((Number)mapResult.get("O_LINE_NO")).intValue();
          rowData.put("P_ORDER_NO", order_No);
          rowData.put("P_LINE_NO", line_No);

          nexosDAO.insert(DETAIL_INSERT_ID, rowData);
        } else if (Consts.DV_CRUD_U.equals(crud)) {
          nexosDAO.update(DETAIL_UPDATE_ID, rowData);
        } else if (Consts.DV_CRUD_D.equals(crud)) {
          nexosDAO.delete(DETAIL_DELETE_ID, rowData);
        }
      }

      newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_INBOUND_DATE", masterDS.get("P_ORDER_DATE"));
      newParams.put("P_INBOUND_NO", order_No);
      newParams.put("P_PROCESS_CD", Consts.PROCESS_ORDER);
      newParams.put("P_DIRECTION", Consts.DIRECTION_FW);
      newParams.put("P_USER_ID", user_Id);

      HashMap<String, Object> mapResult2 = nexosDAO.callSP(RI_PROCESSING_ID, newParams);
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

    final String PRORAM_ID = "RIM1010E";
    final String DELETE_MASTER_ID = PRORAM_ID + ".DELETE_RI010NM";
    final String DELETE_DETAIL_ID = PRORAM_ID + ".DELETE_RI010ND_ALL";

    final String PM_PRORAM_ID = "RIM1010E";
    final String DELETE_NP_ID = PM_PRORAM_ID + ".DELETE_RI010PM";
    int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_D.equals(crud)) {
        nexosDAO.delete(DELETE_DETAIL_ID, rowData);
        nexosDAO.delete(DELETE_NP_ID, rowData);
        nexosDAO.delete(DELETE_MASTER_ID, rowData);
      }
    }
  }
}
