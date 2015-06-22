package nexos.service.lf;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: LF05030EDAOImpl<br>
 * Description: LF05030E DAO (Data Access Object)<br>
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
@Repository("LF05030EDAO")
public class LF05030EDAOImpl implements LF05030EDAO {

  @Resource
  private NexosDAO nexosDAO;

  
  

  @Override
  @SuppressWarnings("unchecked")
  public void saveSub(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "LF05030E";
    final String TABLE_NM = "LF036NM";
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
  
 
  @SuppressWarnings("unchecked")
  @Override
  public void save1(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveMasterDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "LF05030E";
    final String TABLE_NM = "LF036NM";
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;

    // DataSet 처리
    int dsCnt = saveMasterDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveMasterDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_U.equals(crud)) {
        nexosDAO.update(UPDATE_ID, rowData);
      } else if (Consts.DV_CRUD_D.equals(crud)) {
        nexosDAO.delete(DELETE_ID, rowData);
      }
    }
  }
  

  @SuppressWarnings("unchecked")
  @Override
  public void delete(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PROGRAM_ID = "LF05030E";
    final String DELETE_MASTER_ID = PROGRAM_ID + ".DELETE_LF036NM";
    final String DELETE_DETAIL_ID = PROGRAM_ID + ".DELETE_LD030ND_ALL";


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
