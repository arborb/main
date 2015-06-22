package nexos.service.cs;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;
import nexos.common.spring.security.CommonEncryptor;

import org.springframework.stereotype.Repository;

/**
 * Class: CS01011EDAOImpl<br>
 * Description: CS01011E DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
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
@Repository("CS01011EDAO")
public class CS01011EDAOImpl implements CS01011EDAO {

  // private final Logger logger = LoggerFactory.getLogger(CM02020EDAOImpl.class);

  @Resource
  private NexosDAO        nexosDAO;

  @Resource
  private CommonEncryptor commonEncryptor;


  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

   List<Map<String, Object>> detailDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);

    String user_Id = (String)params.get(Consts.PK_REG_USER_ID);

    final String PRORAM_ID = "CS01011E";

    final String CENTER_TABLE_NM = "CSUSERNOTICEGROUP"; // 사용자별운영센터마스터

    final String CENTER_INSERT_ID = PRORAM_ID + ".INSERT_" + CENTER_TABLE_NM;
    final String CENTER_DELETE_ID = PRORAM_ID + ".DELETE_" + CENTER_TABLE_NM;



    int dsCnt = detailDS.size();
    if (dsCnt > 0) {
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = detailDS.get(i);
        rowData.put(Consts.PK_REG_USER_ID, user_Id);

        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(crud)) {
          nexosDAO.insert(CENTER_INSERT_ID, rowData);
        } else if (Consts.DV_CRUD_D.equals(crud)) {
          nexosDAO.delete(CENTER_DELETE_ID, rowData);
        }
      }
    }

  }

}
