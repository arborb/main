package nexos.service.cs;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: CS04010EDAOImpl<br>
 * Description: CS04010E DAO (Data Access Object)<br>
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
@Repository("CS04010EDAO")
public class CS04010EDAOImpl implements CS04010EDAO {

  @Resource
  private NexosDAO nexosDAO;

  @SuppressWarnings("unchecked")
  @Override
  public void saveMaster(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    if (saveDS == null || saveDS.size() == 0) {
      return;
    }
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String CPPOLICY_PRORAM_ID = "CS04010E";
    final String CPPOLICY_TABLE_NM = "CPPOLICY";
    final String CPPOLICY_INSERT_ID = CPPOLICY_PRORAM_ID + ".INSERT_" + CPPOLICY_TABLE_NM;
    final String CPPOLICY_UPDATE_ID = CPPOLICY_PRORAM_ID + ".UPDATE_" + CPPOLICY_TABLE_NM;
    final String CPPOLICY_DELETE_ID = CPPOLICY_PRORAM_ID + ".DELETE_" + CPPOLICY_TABLE_NM;

    final String CPPOLICYVAL_PRORAM_ID = "CS04010E";
    final String CPPOLICYVAL_TABLE_NM = "CPPOLICYVAL";
    final String CPPOLICYVAL_DELETE_ID = CPPOLICYVAL_PRORAM_ID + ".DELETE_" + CPPOLICYVAL_TABLE_NM;

    final String CPBUPOLICYVAL_PRORAM_ID = "CS04020E";
    final String CPBUPOLICYVAL_TABLE_NM = "CPBUPOLICYVAL";
    final String CPBUPOLICYVAL_DELETE_ID = CPBUPOLICYVAL_PRORAM_ID + ".DELETE_" + CPBUPOLICYVAL_TABLE_NM;

    // 정책코드 처리
    int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_C.equals(crud)) {
        nexosDAO.insert(CPPOLICY_INSERT_ID, rowData);
      } else if (Consts.DV_CRUD_U.equals(crud)) {
        nexosDAO.update(CPPOLICY_UPDATE_ID, rowData);
      } else if (Consts.DV_CRUD_D.equals(crud)) {
        // 삭제일 경우 사업부정책, 정책 먼저 삭제
        Map<String, Object> newRowData = new HashMap<String, Object>();
        newRowData.put("P_POLICY_CD", rowData.get("P_POLICY_CD"));
        nexosDAO.delete(CPBUPOLICYVAL_DELETE_ID, newRowData);
        nexosDAO.delete(CPPOLICYVAL_DELETE_ID, newRowData);

        nexosDAO.delete(CPPOLICY_DELETE_ID, rowData);
      }
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void saveDetail(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String CPPOLICYVAL_PRORAM_ID = "CS04010E";
    final String CPPOLICYVAL_TABLE_NM = "CPPOLICYVAL";
    final String CPPOLICYVAL_INSERT_ID = CPPOLICYVAL_PRORAM_ID + ".INSERT_" + CPPOLICYVAL_TABLE_NM;
    final String CPPOLICYVAL_UPDATE_ID = CPPOLICYVAL_PRORAM_ID + ".UPDATE_" + CPPOLICYVAL_TABLE_NM;
    final String CPPOLICYVAL_DELETE_ID = CPPOLICYVAL_PRORAM_ID + ".DELETE_" + CPPOLICYVAL_TABLE_NM;

    final String CPBUPOLICYVAL_PRORAM_ID = "CS04020E";
    final String CPBUPOLICYVAL_TABLE_NM = "CPBUPOLICYVAL";
    final String CPBUPOLICYVAL_DELETE_ID = CPBUPOLICYVAL_PRORAM_ID + ".DELETE_" + CPBUPOLICYVAL_TABLE_NM;

    // 정책값 처리
    int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_C.equals(crud)) {
        nexosDAO.insert(CPPOLICYVAL_INSERT_ID, rowData);
      } else if (Consts.DV_CRUD_U.equals(crud)) {
        nexosDAO.update(CPPOLICYVAL_UPDATE_ID, rowData);
      } else if (Consts.DV_CRUD_D.equals(crud)) {
        // 삭제일 경우 브랜드정책 먼저 삭제
        Map<String, Object> newRowData = new HashMap<String, Object>();
        newRowData.put("P_POLICY_CD", rowData.get("P_POLICY_CD"));
        newRowData.put("P_POLICY_VAL", rowData.get("P_POLICY_VAL"));
        nexosDAO.delete(CPBUPOLICYVAL_DELETE_ID, newRowData);

        nexosDAO.delete(CPPOLICYVAL_DELETE_ID, rowData);
      }
    }
  }

}
