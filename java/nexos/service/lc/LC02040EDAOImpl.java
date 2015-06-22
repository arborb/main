package nexos.service.lc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.service.common.CommonDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: WCDAOImpl<br>
 * Description: LC02040E DAO (Data Access Object)<br>
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
@Repository("LC02040EDAO")
public class LC02040EDAOImpl implements LC02040EDAO {

  @Resource
  private CommonDAO commonDAO;

  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    final String LC_FW_SET_ORDER = "LC_FW_SET_ORDER";

    List<Map<String, Object>> subDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    String etc_no = null;

    if (subDS.size() > 0) {
      for (int i = 0; i < subDS.size(); i++) {

        Map<String, Object> rowData = subDS.get(i);
        rowData.put(Consts.PK_USER_ID, user_Id);
        String crud = (String)rowData.get(Consts.PK_CRUD);

        if (Consts.DV_CRUD_C.equals(crud)) {

          // etc_no가 null인 경우는 신규인 경우
          if (etc_no != null) {
            rowData.put("P_ETC_NO", etc_no);
          }

          HashMap<String, Object> mapResult = commonDAO.callSP(LC_FW_SET_ORDER, rowData);
          String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }
          if (etc_no == null) {
            etc_no = (String)mapResult.get("O_ETC_NO");
          }
        }
      }
    }
  }
}
