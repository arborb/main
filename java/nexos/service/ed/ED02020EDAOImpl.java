package nexos.service.ed;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: WCDAOImpl<br>
 * Description: ED02020E DAO (Data Access Object)<br>
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
@Repository("ED02020EDAO")
public class ED02020EDAOImpl implements ED02020EDAO {

  @Resource
  private NexosDAO nexosDAO;

  @Override
  @SuppressWarnings("unchecked")
  public void saveMaster(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PROGRAM_ID = "ED02020E";
    final String TABLE_NM = "EMDEFINE";
    final String INSERT_ID = PROGRAM_ID + ".INSERT_" + TABLE_NM;
    final String UPDATE_ID = PROGRAM_ID + ".UPDATE_" + TABLE_NM;
    final String DELETE_ID = PROGRAM_ID + ".DELETE_" + TABLE_NM;

    final String DETAIL1_TABLE_NM = "EMDEFINESUB";
    final String DETAIL1_DELETE_ID = PROGRAM_ID + ".DELETE_" + DETAIL1_TABLE_NM;

    // 인터페이스 송신정의 마스터 처리
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
        // 인터페이스 송신정의 디테일 삭제
        nexosDAO.delete(DETAIL1_DELETE_ID, rowData);
        nexosDAO.delete(DELETE_ID, rowData);
      }
    }
  }

  @Override
  @SuppressWarnings("unchecked")
  public void saveDetail(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    if (saveDS == null) {
      return;
    }

    final String PROGRAM_ID = "ED02020E";
    final String TABLE_NM = "EMDEFINESUB";
    final String INSERT_ID = PROGRAM_ID + ".INSERT_" + TABLE_NM;
    final String UPDATE_ID = PROGRAM_ID + ".UPDATE_" + TABLE_NM;
    final String DELETE_ID = PROGRAM_ID + ".DELETE_" + TABLE_NM;

    // 인터페이스 송신정의 디테일 처리
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
