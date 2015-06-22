package nexos.service.cm;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: WCDAOImpl<br>
 * Description: CM04040E DAO (Data Access Object)<br>
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
@Repository("CM04040EDAO")
public class CM04040EDAOImpl implements CM04040EDAO {

  @Resource
  private NexosDAO nexosDAO;

  @Override
  @SuppressWarnings("unchecked")
  public void saveDetail(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "CM04040E";
    final String TABLE_NM = "CMDEALOPTION";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;

    final String TABLE_NM_SUB = "CMDEALITEM";
    final String DELETE_ID_SUB = PRORAM_ID + ".DELETE_" + TABLE_NM_SUB;

    // 딜옵셥 마스터 처리
    int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);

      if (Consts.DV_CRUD_C.equals(crud)) {
        nexosDAO.insert(INSERT_ID, rowData);
      } else if (Consts.DV_CRUD_U.equals(crud)) {
        nexosDAO.update(UPDATE_ID, rowData);
      } else if (Consts.DV_CRUD_D.equals(crud)) {
        Map<String, Object> newRowData = new HashMap<String, Object>();

        newRowData.put("P_BU_CD", rowData.get("P_BU_CD"));
        newRowData.put("P_MALL_CD", rowData.get("P_MALL_CD"));
        newRowData.put("P_DEAL_ID", rowData.get("P_DEAL_ID"));
        newRowData.put("P_OPTION_ID", rowData.get("P_OPTION_ID"));

        nexosDAO.delete(DELETE_ID_SUB, newRowData);
        nexosDAO.delete(DELETE_ID, newRowData);
      }
    }
  }

  @Override
  @SuppressWarnings("unchecked")
  public void saveMaster(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "CM04040E";
    final String TABLE_NM = "CMDEAL";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;

    final String TABLE_NM_DETAIL = "CMDEALOPTION";
    final String TABLE_NM_SUB = "CMDEALITEM";
    final String DELETE_ID_DETAIL = PRORAM_ID + ".DELETE_" + TABLE_NM_DETAIL;
    final String DELETE_ID_SUB = PRORAM_ID + ".DELETE_" + TABLE_NM_SUB;

    // 딜 마스터 처리
    int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);

      if (Consts.DV_CRUD_C.equals(crud)) {
        nexosDAO.insert(INSERT_ID, rowData);
      } else if (Consts.DV_CRUD_U.equals(crud)) {
        nexosDAO.update(UPDATE_ID, rowData);
      } else if (Consts.DV_CRUD_D.equals(crud)) {

        Map<String, Object> newRowData = new HashMap<String, Object>();
        newRowData.put("P_BU_CD", rowData.get("P_BU_CD"));
        newRowData.put("P_MALL_CD", rowData.get("P_MALL_CD"));
        newRowData.put("P_DEAL_ID", rowData.get("P_DEAL_ID"));

        nexosDAO.delete(DELETE_ID_SUB, newRowData);
        nexosDAO.delete(DELETE_ID_DETAIL, newRowData);
        nexosDAO.delete(DELETE_ID, newRowData);
      }
    }
  }

  @Override
  @SuppressWarnings("unchecked")
  public void saveSub(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "CM04040E";
    final String TABLE_NM = "CMDEALITEM";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;

    // 딜상품 마스터 처리
    int dsCnt = saveDS.size();

    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_C.equals(crud)) {
        nexosDAO.insert(INSERT_ID, rowData);
      } else if (Consts.DV_CRUD_U.equals(crud)) {
        nexosDAO.update(UPDATE_ID, rowData);
      } else if (Consts.DV_CRUD_D.equals(crud)) {
        nexosDAO.delete(DELETE_ID, rowData);
      }
    }
  }

}
