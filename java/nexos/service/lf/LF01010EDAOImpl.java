package nexos.service.lf;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: LF01010EDAOImpl<br>
 * Description: LF01010E DAO (Data Access Object)<br>
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
@Repository("LF01010EDAO")
public class LF01010EDAOImpl implements LF01010EDAO {

    @Resource
    private NexosDAO nexosDAO;

    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> saveMasterDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String user_Id = (String)params.get(Consts.PK_USER_ID);

        final String PROGRAM_ID = "LF01010E";
        final String TABLE_NM = "LS030NM";
        final String INSERT_ID = PROGRAM_ID + ".INSERT_" + TABLE_NM;
        final String UPDATE_ID = PROGRAM_ID + ".UPDATE_" + TABLE_NM;
        final String DELETE_ID = PROGRAM_ID + ".DELETE_" + TABLE_NM;

        // DataSet 처리
        int dsCnt = saveMasterDS.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = saveMasterDS.get(i);
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
