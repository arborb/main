package nexos.service.cm;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: CM06010EDAOImpl<br>
 * Description: CM03020E DAO (Data Access Object)<br>
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
@Repository("CM06010EDAO")
public class CM06010EDAOImpl implements CM06010EDAO {

  // private final Logger logger = LoggerFactory.getLogger(CM06010EDAOImpl.class);

  @Resource
  private NexosDAO nexosDAO;

  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "CM06010E";
    final String TABLE_NM = "CMSAFETYSTOCK";
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