package nexos.service.li;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: WCDAOImpl<br>
 * Description: LI04010E DAO (Data Access Object)<br>
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
@Repository("LI04010EDAO")
public class LI04010EDAOImpl implements LI04010EDAO {

	@Resource
    private NexosDAO                   nexosDAO;

	@Override
    @SuppressWarnings("unchecked")
	public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String user_Id = (String)params.get(Consts.PK_USER_ID);

        final String PRORAM_ID = "LI04010E";
        final String TABLE_NM = "LI020ND";
        final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;


        int dsCnt = saveDS.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = saveDS.get(i);
            rowData.put(Consts.PK_REG_USER_ID, user_Id);

            String crud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_U.equals(crud)) {
                nexosDAO.update(UPDATE_ID, rowData);
            }
        }
	}

}
