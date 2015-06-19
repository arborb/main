package nexos.service.lf;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: LF03030EDAOImpl<br>
 * Description: LF03030E DAO (Data Access Object)<br>
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
@Repository("LF03030EDAO")
public class LF03030EDAOImpl implements LF03030EDAO {

    @Resource
    private NexosDAO nexosDAO;

    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

      List<Map<String, Object>> saveMasterDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
      String user_Id = (String)params.get(Consts.PK_USER_ID);

      final String PROGRAM_ID = "LF03030E";
      final String TABLE_NM = "LF030NM";
      final String UPDATE_ID = PROGRAM_ID + ".UPDATE_" + TABLE_NM;
     
      // DataSet 처리
      int dsCnt = saveMasterDS.size();
      for (int i = 0; i < dsCnt; i++) {
          Map<String, Object> rowData = saveMasterDS.get(i);
          rowData.put(Consts.PK_REG_USER_ID, user_Id);

          String crud = (String)rowData.get(Consts.PK_CRUD);
          if (Consts.DV_CRUD_U.equals(crud)) {
              nexosDAO.update(UPDATE_ID, rowData);
          } 
      }
      
    }
}
