package nexos.service.lc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: LC03010EDAOImpl<br>
 * Description: LC03010E DAO (Data Access Object)<br>
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
@Repository("LC03010EDAO")
public class LC03010EDAOImpl implements LC03010EDAO {

  @Resource
  private NexosDAO nexosDAO;

  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String LC_FW_MOVE_ORDER_ID = "LC_FW_MOVE_ORDER";
    final String LC_BW_MOVE_ENTRY_ID = "LC_BW_MOVE_ENTRY";

    // 파라메터 처리
    List<Map<String, Object>> subDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
    String user_Id = (String)params.get(Consts.PK_USER_ID);
    int dsCnt = subDS.size();

    if (dsCnt > 0) {
      String move_No = null;
      // 디테일 처리
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = subDS.get(i);
        rowData.put(Consts.PK_USER_ID, user_Id);
        String crud = (String)rowData.get(Consts.PK_CRUD);

        if (Consts.DV_CRUD_C.equals(crud)) {
          if (move_No != null) {
            rowData.put("P_MOVE_NO", move_No);
          }
          HashMap<String, Object> mapResult = nexosDAO.callSP(LC_FW_MOVE_ORDER_ID, rowData);
          String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }
          if (move_No == null) {
            move_No = (String)mapResult.get("O_MOVE_NO");
          }
        } else if (Consts.DV_CRUD_D.equals(crud)) {
          HashMap<String, Object> mapResult = nexosDAO.callSP(LC_BW_MOVE_ENTRY_ID, rowData);
          String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }
        }
      }
    }
  }
}
