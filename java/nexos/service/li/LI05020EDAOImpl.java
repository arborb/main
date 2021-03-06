package nexos.service.li;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: LI05020EDAOImpl<br>
 * Description: LI05020E DAO (Data Access Object)<br>
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
@Repository("LI05020EDAO")
public class LI05020EDAOImpl implements LI05020EDAO {

    @Resource
    private NexosDAO nexosDAO;

    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String user_Id = (String)params.get(Consts.PK_USER_ID);

        final String PRORAM_ID = "LI05020E";
        final String TABLE_NM = "LI040NM";
        final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
        final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
        final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;
        
        int dsCnt = saveDS.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = saveDS.get(i);
            rowData.put(Consts.PK_REG_USER_ID, user_Id);

            String crud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(crud)) {
                nexosDAO.update(INSERT_ID, rowData);
            }else if (Consts.DV_CRUD_U.equals(crud)) {
            	nexosDAO.update(UPDATE_ID, rowData);
            }else if (Consts.DV_CRUD_D.equals(crud)) {
            	nexosDAO.update(DELETE_ID, rowData);
            }
        }
    }
}
