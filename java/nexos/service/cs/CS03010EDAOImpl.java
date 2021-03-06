package nexos.service.cs;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: CS03010EDAOImpl<br>
 * Description: CS03010E DAO (Data Access Object)<br>
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
@Repository("CS03010EDAO")
public class CS03010EDAOImpl implements CS03010EDAO {

  // private final Logger logger = LoggerFactory.getLogger(CS03010EDAOImpl.class);

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

    final String PRORAM_ID = "CS03010E";
    final String TABLE_NM = "CPPROCESS";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;

    // 그룹코드 처리
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
        // 삭제일 경우 상용코드 먼저 삭제
        Map<String, Object> newRowData = new HashMap<String, Object>();
        newRowData.put("P_CODE_GRP", rowData.get("P_CODE_CD"));
        nexosDAO.delete(DELETE_ID, newRowData);
        // 그룹코드 삭제
        nexosDAO.delete(DELETE_ID, rowData);
      }
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void saveDetail(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    if (saveDS == null || saveDS.size() == 0) {
      return;
    }
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "CS03010E";
    final String TABLE_NM = "CPCHILDPROCESS";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;

    // 상용코드 처리
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
