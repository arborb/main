package nexos.service.cm;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;
import nexos.service.common.WCDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: WCDAOImpl<br>
 * Description: CM04050E DAO (Data Access Object)<br>
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
@Repository("CM04050EDAO")
public class CM04050EDAOImpl implements CM04050EDAO {

  @Resource
  private WCDAO    dao;

  @Resource
  private NexosDAO nexosDAO;

  @Override
  @SuppressWarnings("unchecked")
  public void save(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> masterDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    List<Map<String, Object>> detailDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "CM04050E";
    final String TABLE_NM = "CMCENTERITEM";
    final String UPDATE_MASTER_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM + "_MASTER";
    final String UPDATE_DETAIL_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM + "_DETAIL";
    final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;

    int msCnt = masterDS.size();
    if (msCnt > 0) {
      for (int i = 0; i < msCnt; i++) {
        Map<String, Object> rowData = masterDS.get(i);
        rowData.put(Consts.PK_REG_USER_ID, user_Id);

        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_U.equals(crud)) {
          nexosDAO.update(UPDATE_MASTER_ID, rowData);
        } else if (Consts.DV_CRUD_D.equals(crud)) {
          nexosDAO.delete(DELETE_ID, rowData);
        }
      }
    }

    int dsCnt = detailDS.size();
    if (dsCnt > 0) {
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = detailDS.get(i);
        rowData.put(Consts.PK_REG_USER_ID, user_Id);

        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_U.equals(crud)) {
          nexosDAO.update(UPDATE_DETAIL_ID, rowData);
        }
      }
    }
  }

  @Override
  public String callCenterItemCheckAllocate(Map<String, Object> params) throws Exception {

    final String CM_CENTERITEM_CHECK_ALLOCATE_ID = "CM_CENTERITEM_CHECK_ALLOCATE";

    String result = Consts.OK;

    HashMap<String, Object> mapResult = null;
    String checkedValue = (String)params.get("P_CHECKED_VALUE");

    // 선택 값 CTCHECKVALUE 테이블에 INSERT
    Map<String, Object> checkedParams = new HashMap<String, Object>();
    checkedParams.put(Consts.PK_CHECKED_VALUE, checkedValue);
    dao.insertCheckedValue(checkedParams);

    mapResult = nexosDAO.callSP(CM_CENTERITEM_CHECK_ALLOCATE_ID, params);

    String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
    if (!Consts.OK.equals(oMsg)) {
      throw new RuntimeException(oMsg);
    }

    return result;
  }
}
