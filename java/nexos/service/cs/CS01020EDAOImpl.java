package nexos.service.cs;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.Util;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: CM01010EDAOImpl<br>
 * Description: CM01010E DAO (Data Access Object)<br>
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
@Repository("CS01020EDAO")
public class CS01020EDAOImpl implements CS01020EDAO {

  // private final Logger logger = LoggerFactory.getLogger(CS01020EDAOImpl.class);

  @Resource
  private NexosDAO nexosDAO;

  @SuppressWarnings("rawtypes")
  @Override
  public List getProgramMenu(String queryId, Map<String, Object> params) {
    if (params != null && params.size() > 0) {
      return nexosDAO.list(queryId, params);
    } else {
      return nexosDAO.list(queryId);
    }
  }

  @Override
  @SuppressWarnings({"rawtypes", "unchecked"})
  public List getProgramMenuTree(List list) {
    List result = new ArrayList();
    if (list == null || list.size() == 0) {
      return result;
    }

    Iterator iterator = list.iterator();
    Map<String, Object> rowData = null;

    /*
     * Tree 데이터 구조
     *  [{ "id": "id_1", "PROGRAM_ID": "CS00000M", .. , "EXE_LEVEL4": "Y", indent:"0", parent:"" },
     *   { "id": "id_2", "PROGRAM_ID": "CS01010E", .. , "EXE_LEVEL4": "Y", indent:"1", parent:"1" },
     *   { "id": "id_3", "PROGRAM_ID": "CM00000M", .. , "EXE_LEVEL4": "Y", indent:"0", parent:"" },
     *   { "id": "id_4", "PROGRAM_ID": "CM01010E", .. , "EXE_LEVEL4": "Y", indent:"1", parent:"3" },
     *   { "id": "id_5", "PROGRAM_ID": "CM01020E", .. , "EXE_LEVEL4": "Y", indent:"1", parent:"3" }
     *  ]
     */
    while (iterator.hasNext()) {
      rowData = (HashMap)iterator.next();

      Map<String, Object> menuData = new HashMap<String, Object>();

      menuData.put(Consts.DK_ID, Consts.DV_ID_PREFIX + String.valueOf(rowData.get("ROW_ID")));
      menuData.put("PROGRAM_ID", rowData.get("PROGRAM_ID"));
      menuData.put("PROGRAM_NM", rowData.get("PROGRAM_NM"));
      menuData.put("PROGRAM_GRP1", rowData.get("PROGRAM_GRP1"));
      menuData.put("PROGRAM_GRP2", rowData.get("PROGRAM_GRP2"));
      menuData.put("PROGRAM_GRP3", rowData.get("PROGRAM_GRP3"));
      menuData.put("PROGRAM_GRP4", rowData.get("PROGRAM_GRP4"));
      menuData.put("PROGRAM_DIV", rowData.get("PROGRAM_DIV"));
      menuData.put("WIDE_YN", rowData.get("WIDE_YN"));
      menuData.put("WEB_URL", rowData.get("WEB_URL"));
      menuData.put("EXE_LEVEL1", rowData.get("EXE_LEVEL1"));
      menuData.put("EXE_LEVEL2", rowData.get("EXE_LEVEL2"));
      menuData.put("EXE_LEVEL3", rowData.get("EXE_LEVEL3"));
      menuData.put("EXE_LEVEL4", rowData.get("EXE_LEVEL4"));
      menuData.put("FAVORITE_YN", rowData.get("FAVORITE_YN"));
      menuData.put("MENU_SHOW_YN", rowData.get("MENU_SHOW_YN"));
      menuData.put("indent", String.valueOf(rowData.get("MENU_INDENT")));
      String parent = String.valueOf(rowData.get("PARENT_ID"));
      if (!Util.isNull(parent)) {
        parent = Consts.DV_ID_PREFIX + parent;
      } else {
        parent = "";
      }
      menuData.put("parent", parent);
      menuData.put("_collapsed", true);

      result.add(menuData);
    }

    return result;
  }

  @SuppressWarnings("unchecked")
  @Override
  public void saveProgram(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "CS01020E";
    final String CSUSER_TABLE_NM = "CSPROGRAM";
    final String CSUSERPROGRAM_TABLE_NM = "CSUSERPROGRAM";
    final String CSUSER_INSERT_ID = PRORAM_ID + ".INSERT_" + CSUSER_TABLE_NM;
    final String CSUSER_UPDATE_ID = PRORAM_ID + ".UPDATE_" + CSUSER_TABLE_NM;
    final String CSUSER_DELETE_ID = PRORAM_ID + ".DELETE_" + CSUSER_TABLE_NM;
    final String CSUSERPROGRAM_DELETE_ID = PRORAM_ID + ".DELETE_" + CSUSERPROGRAM_TABLE_NM;
    final String CSUSER_DELETE_GROUP_ID = PRORAM_ID + ".DELETE_" + CSUSER_TABLE_NM + "_GROUP";
    final String CSUSERPROGRAM_DELETE_GROUP_ID = PRORAM_ID + ".DELETE_" + CSUSERPROGRAM_TABLE_NM + "_GROUP";
    final String PROGRAM_DIV_MENU = "M";

    int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_C.equals(crud)) {
        nexosDAO.insert(CSUSER_INSERT_ID, rowData);
      } else if (Consts.DV_CRUD_U.equals(crud)) {
        nexosDAO.update(CSUSER_UPDATE_ID, rowData);
      } else if (Consts.DV_CRUD_D.equals(crud)) {
        // 메뉴 삭제일 경우 하위 프로그램 전체 삭제 - 별도 쿼리ID
        if (PROGRAM_DIV_MENU.equals(rowData.get("P_PROGRAM_DIV"))) {
          // 사용자 프로그램 먼저 삭제
          nexosDAO.delete(CSUSERPROGRAM_DELETE_GROUP_ID, rowData);
          nexosDAO.delete(CSUSER_DELETE_GROUP_ID, rowData);
        } else {
          // 삭제일 경우 사용자프로그램을 먼저 삭제
          Map<String, Object> newRowData = new HashMap<String, Object>();
          newRowData.put("P_PROGRAM_ID", rowData.get("P_PROGRAM_ID"));
          nexosDAO.delete(CSUSERPROGRAM_DELETE_ID, newRowData);

          nexosDAO.delete(CSUSER_DELETE_ID, rowData);
        }
      }
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void saveUserProgram(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "CS01020E";
    final String TABLE_NM = "CSUSERPROGRAM";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;

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
