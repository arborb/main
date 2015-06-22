package nexos.service.ld;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: LD02010EDAOImpl<br>
 * Description: LD02010E DAO (Data Access Object)<br>
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
@Repository("LD02010EDAO")
public class LD02010EDAOImpl implements LD02010EDAO {

  @Resource
  private NexosDAO nexosDAO;

  @Override
  @SuppressWarnings("unchecked")
  public void save(Map<String, Object> params) throws Exception {
    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String change_Type = (String)params.get("P_CHANGE_TYPE");
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String CHANGE_TYPE_DOCK = "1";
    final String CHANGE_TYPE_OUTBOUND = "2";
    final String CHANGE_TYPE_DELIVERY = "3";
    final String LD_FW_CHANGE_CAR_T1_ID = "LD_FW_CHANGE_DOCK_T1";
    final String LD_FW_CHANGE_CAR_T2_ID = "LD_FW_CHANGE_DOCK_T2";
    final String LD_FW_CHANGE_CAR_T3_ID = "LD_FW_CHANGE_DOCK_T2";

    int dsCnt = saveDS.size();
    if (CHANGE_TYPE_DOCK.equals(change_Type)) {
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = saveDS.get(i);
        rowData.put(Consts.PK_USER_ID, user_Id);

        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(crud) || Consts.DV_CRUD_U.equals(crud)) {
          // 도크변경 처리 sp 호출
          HashMap<String, Object> mapResult = nexosDAO.callSP(LD_FW_CHANGE_CAR_T1_ID, rowData);

          String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }
        }
      }
    } else if (CHANGE_TYPE_OUTBOUND.equals(change_Type)) {
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = saveDS.get(i);
        rowData.put(Consts.PK_USER_ID, user_Id);

        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(crud) || Consts.DV_CRUD_U.equals(crud)) {
          // 도크변경 처리 sp 호출
          HashMap<String, Object> mapResult = nexosDAO.callSP(LD_FW_CHANGE_CAR_T2_ID, rowData);

          String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }
        }
      }
    } else if (CHANGE_TYPE_DELIVERY.equals(change_Type)) {
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = saveDS.get(i);
        rowData.put(Consts.PK_USER_ID, user_Id);

        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(crud) || Consts.DV_CRUD_U.equals(crud)) {
          // 도크변경 처리 sp 호출
          HashMap<String, Object> mapResult = nexosDAO.callSP(LD_FW_CHANGE_CAR_T3_ID, rowData);

          String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }
        }
      }
    }
  }

}
