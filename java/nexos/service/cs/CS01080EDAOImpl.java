package nexos.service.cs;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: CS01080EDAOImpl<br>
 * Description: CS01080E DAO (Data Access Object)<br>
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
@Repository("CS01080EDAO")
public class CS01080EDAOImpl implements CS01080EDAO {

  // private final Logger logger = LoggerFactory.getLogger(CS01080EDAOImpl.class);

  @Resource
  private NexosDAO nexosDAO;

  @Override
  @SuppressWarnings("unchecked")
  public void save(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    List<Map<String, Object>> subDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
    String user_Id = (String)params.get(Consts.PK_REG_USER_ID);

    final String PRORAM_ID = "CS01080E";
    final String TABLE_NM = "CSUSERSYSINFO";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM + "_PRINT";
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM + "_PRINT";

    int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_U.equals(crud)) {
        nexosDAO.update(UPDATE_ID, rowData);
      }
    }

    int ssCnt = subDS.size();
    for (int i = 0; i < ssCnt; i++) {
      Map<String, Object> rowData = subDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_C.equals(crud)) {
        nexosDAO.insert(INSERT_ID, rowData);
      } else if (Consts.DV_CRUD_U.equals(crud)) {
        nexosDAO.update(UPDATE_ID, rowData);
      }
    }
  }

}
