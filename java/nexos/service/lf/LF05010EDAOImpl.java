package nexos.service.lf;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: LF05010EDAOImpl<br>
 * Description: LF05010E DAO (Data Access Object)<br>
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
@Repository("LF05010EDAO")
public class LF05010EDAOImpl implements LF05010EDAO {

  @Resource
  private NexosDAO nexosDAO;

  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "LF05010E";
    final String MASTER_TABLE_NM = "LD030NM";
    final String MASTER_INSERT_ID = PRORAM_ID + ".INSERT_" + MASTER_TABLE_NM;
    final String MASTER_UPDATE_ID = PRORAM_ID + ".UPDATE_" + MASTER_TABLE_NM;
    final String DETAIL_TABLE_NM = "LD030ND";
    final String DETAIL_INSERT_ID = PRORAM_ID + ".INSERT_" + DETAIL_TABLE_NM;
    final String DETAIL_UPDATE_ID = PRORAM_ID + ".UPDATE_" + DETAIL_TABLE_NM;
    final String DETAIL_DELETE_ID = PRORAM_ID + ".DELETE_" + DETAIL_TABLE_NM;

    final String LD030NM_GETNO_ID = "WT.LD_030NM_GETNO";
    final String LD030ND_GETNO_ID = "WT.LD_030ND_GETNO";

    final String GET_PROTECT_ID = "WF.GET_PROTECT";

    // 파라메터 처리
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    List<Map<String, Object>> detailDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    // N: 신규 등록
    String process_Cd = (String)params.get("P_PROCESS_CD");
    String user_Id = (String)params.get(Consts.PK_USER_ID);
    String proceed_No;
    int line_No;
    int dsCnt = detailDS.size();

    // 등록자ID 입력
    masterDS.put(Consts.PK_USER_ID, user_Id);

    Map<String, Object> newParams;

    // 보안 설정 CHECK SP 호출
    newParams = new HashMap<String, Object>();
    newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
    newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
    newParams.put("P_PROTECT_DATE", masterDS.get("P_DELIVERY_DATE"));

    HashMap<String, Object> mapResult1 = nexosDAO.callSP(GET_PROTECT_ID, newParams);
    String oMsg = (String)mapResult1.get(Consts.PK_O_MSG);
    if (!Consts.OK.equals(oMsg)) {
      throw new RuntimeException(oMsg);
    }

    // 신규 등록
    if ("N".equals(process_Cd)) {

      if (dsCnt < 1) {
        throw new RuntimeException("예외운송비등록 상세내역이 존재하지 않습니다.");
      }

      // 입고번호 채번
      newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_DELIVERY_DATE", masterDS.get("P_DELIVERY_DATE"));

      HashMap<String, Object> mapResult = nexosDAO.callSP(LD030NM_GETNO_ID, newParams);
      oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      line_No = 1;

      proceed_No = (String)mapResult.get("O_DELIVERY_NO");
      masterDS.put("P_DELIVERY_NO", proceed_No);

      // 마스터 생성, CRUD 체크 안함
      nexosDAO.insert(MASTER_INSERT_ID, masterDS);
    } else {

      // 입고순번 채번
      proceed_No = (String)masterDS.get("P_DELIVERY_NO");
      newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_DELIVERY_DATE", masterDS.get("P_DELIVERY_DATE"));
      newParams.put("P_DELIVERY_NO", proceed_No);

      HashMap<String, Object> mapResult = nexosDAO.callSP(LD030ND_GETNO_ID, newParams);
      oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      line_No = ((Number)mapResult.get("O_LINE_NO")).intValue();

      // 마스터 수정, 마스터를 수정했으면
      if (Consts.DV_CRUD_U.equals(masterDS.get(Consts.PK_CRUD))) {
        nexosDAO.update(MASTER_UPDATE_ID, masterDS);
      }
    }
    if (dsCnt > 0) {

      // 디테일 처리
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = detailDS.get(i);
        rowData.put(Consts.PK_USER_ID, user_Id);

        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(crud)) {
          rowData.put("P_DELIVERY_NO", proceed_No);
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
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void delete(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PROGRAM_ID = "LF05010E";
    final String DELETE_MASTER_ID = PROGRAM_ID + ".DELETE_LD030NM";
    final String DELETE_DETAIL_ID = PROGRAM_ID + ".DELETE_LD030ND_ALL";

    final String GET_PROTECT_ID = "WF.GET_PROTECT";

    int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);

      // 보안 설정 CHECK SP 호출
      rowData.put("P_PROTECT_DATE", rowData.get("P_DELIVERY_DATE"));
      HashMap<String, Object> mapResult = nexosDAO.callSP(GET_PROTECT_ID, rowData);

      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      if (Consts.DV_CRUD_D.equals(crud)) {
        nexosDAO.delete(DELETE_DETAIL_ID, rowData);
        nexosDAO.delete(DELETE_MASTER_ID, rowData);
      }
    }
  }
}
