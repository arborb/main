package nexos.service.cm;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: CM02020EDAOImpl<br>
 * Description: CM02020E DAO (Data Access Object)<br>
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
@Repository("CM07020EDAO")
public class CM07020EDAOImpl implements CM07020EDAO {

  // private final Logger logger = LoggerFactory.getLogger(CM02020EDAOImpl.class);

  @Resource
  private NexosDAO nexosDAO;

  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "CM07020E";
    final String TABLE_NM = "CMWBNOBAND";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;
    final String CM_WBNOBAND_GETNO_ID = "WB.CM_WBNOBAND_GETNO";
    final String SET_WBNO_DELETE_ID = "WB.SET_WBNO_DELETE";

    int LINE_NO;

    Map<String, Object> newParams;

    int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_C.equals(crud)) {

        //순번 채번
        newParams = new HashMap<String, Object>();
        newParams.put("P_CARRIER_CD", rowData.get("P_CARRIER_CD"));
        HashMap<String, Object> mapResult = nexosDAO.callSP(CM_WBNOBAND_GETNO_ID, newParams);
        String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
        LINE_NO = ((Number)mapResult.get("O_LINE_NO")).intValue();
        rowData.put("P_LINE_NO", LINE_NO);
        
        nexosDAO.insert(INSERT_ID, rowData);
      } else if (Consts.DV_CRUD_U.equals(crud)) {
        nexosDAO.update(UPDATE_ID, rowData);
      } else if (Consts.DV_CRUD_D.equals(crud)) {
        
        //기생성된 운송장번호 삭제
        newParams = new HashMap<String, Object>();
        newParams.put("P_CARRIER_CD", rowData.get("P_CARRIER_CD"));
        newParams.put("P_LINE_NO", rowData.get("P_LINE_NO"));
        newParams.put("P_USER_ID", rowData.get("P_REG_USER_ID"));
        HashMap<String, Object> mapResult = nexosDAO.callSP(SET_WBNO_DELETE_ID, newParams);
        String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }

        nexosDAO.delete(DELETE_ID, rowData);
      }
    }
  }

}
