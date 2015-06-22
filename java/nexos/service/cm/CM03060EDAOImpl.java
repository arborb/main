package nexos.service.cm;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: CS01010EDAOImpl<br>
 * Description: CS01010E DAO (Data Access Object)<br>
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
@Repository("CM03060EDAO")
public class CM03060EDAOImpl implements CM03060EDAO {

  // private final Logger logger = LoggerFactory.getLogger(CM02020EDAOImpl.class);

  @Resource
  private NexosDAO nexosDAO;

  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> masterDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);

    String user_Id = (String)params.get(Consts.PK_REG_USER_ID);

    final String PRORAM_ID = "CM03060E";

    final String BU_TABLE_NM = "CMBU"; // 사업부마스터

    final String BU_INSERT_ID = PRORAM_ID + ".INSERT_" + BU_TABLE_NM;
    final String BU_UPDATE_ID = PRORAM_ID + ".UPDATE_" + BU_TABLE_NM;
    final String BU_DELETE_ID = PRORAM_ID + ".DELETE_" + BU_TABLE_NM;


    int msCnt = masterDS.size();
    if (msCnt > 0) {
      for (int i = 0; i < msCnt; i++) {
        Map<String, Object> rowData = masterDS.get(i);
        rowData.put(Consts.PK_REG_USER_ID, user_Id);

        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(crud)) {
          nexosDAO.insert(BU_INSERT_ID, rowData);
        } else if (Consts.DV_CRUD_U.equals(crud)) {
          nexosDAO.update(BU_UPDATE_ID, rowData);
        } else if (Consts.DV_CRUD_D.equals(crud)) {
          nexosDAO.delete(BU_DELETE_ID, rowData);
        }
      }
    }

  }

}
