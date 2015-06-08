package nexos.service.cm;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: WCDAOImpl<br>
 * Description: CM05020E DAO (Data Access Object)<br>
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
@Repository("CM05020EDAO")
public class CM05020EDAOImpl implements CM05020EDAO {

  @Resource
  private NexosDAO nexosDAO;

  @Override
  @SuppressWarnings("unchecked")
  public void save(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "CM05020E";
    final String TABLE_NM = "CMRETURNLOC";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;
    final String CHK_LOCATION = "WF.CHK_LOCATION02";

    int dsCnt = saveDS.size();
    String location;
    Map<String, Object> newParams;
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_C.equals(crud)) {
        // 1: XX-XX-XX-XX
        if (rowData.get("P_DSP_LOCATION_POLICY").equals("1")) {
          location = (String)rowData.get("P_ZONE_CD") + "-" + (String)rowData.get("P_BANK_CD") + "-"
              + (String)rowData.get("P_BAY_CD") + "-" + (String)rowData.get("P_LEV_CD");
          // 2: XXXX-XX-XX
        } else if (rowData.get("P_DSP_LOCATION_POLICY").equals("2")) {
          location = (String)rowData.get("P_ZONE_CD") + (String)rowData.get("P_BANK_CD") + "-"
              + (String)rowData.get("P_BAY_CD") + "-" + (String)rowData.get("P_LEV_CD");
          // 3: XXXXXXXX
        } else {
          location = (String)rowData.get("P_ZONE_CD") + (String)rowData.get("P_BANK_CD")
              + (String)rowData.get("P_BAY_CD") + (String)rowData.get("P_LEV_CD");
        }
        // LOCATION_CD 컬럼값 교체
        rowData.put("P_LOCATION_CD", location);

        // 로케이션 체크
        newParams = new HashMap<String, Object>();
        newParams.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
        newParams.put("P_ZONE_CD", rowData.get("P_ZONE_CD"));
        newParams.put("P_BANK_CD", rowData.get("P_BANK_CD"));
        newParams.put("P_BAY_CD", rowData.get("P_BAY_CD"));
        newParams.put("P_LEV_CD", rowData.get("P_LEV_CD"));

        HashMap<String, Object> mapResult = nexosDAO.callSP(CHK_LOCATION, newParams);
        String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }

        nexosDAO.insert(INSERT_ID, rowData);
      } else if (Consts.DV_CRUD_U.equals(crud)) {
        nexosDAO.update(UPDATE_ID, rowData);
      } else if (Consts.DV_CRUD_D.equals(crud)) {
        nexosDAO.delete(DELETE_ID, rowData);
      }
    }
  }

}
