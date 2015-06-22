package nexos.service.lc;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: WCDAOImpl<br>
 * Description: LC02030E DAO (Data Access Object)<br>
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
@Repository("LC02030EDAO")
public class LC02030EDAOImpl implements LC02030EDAO {

  @Resource
  private NexosDAO nexosDAO;

  @Override
  @SuppressWarnings("unchecked")
  public void save(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "LC02030E";
    final String D_TABLE_NM = "LC010ND";
    final String DETAIL_UPDATE_ID = PRORAM_ID + ".UPDATE_" + D_TABLE_NM;
    final String LC_FW_STOCK_CHANGE_ORDER = "LC_FW_STOCK_CHANGE_ORDER";
    final String LC_BW_ETC_ENTRY = "LC_BW_ETC_ENTRY";

    // 파라메터 처리
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    List<Map<String, Object>> subDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
    String etc_no = (String)params.get("P_ETC_NO");
    String user_Id = (String)params.get(Consts.PK_USER_ID);
    int subCnt = subDS.size();

    // 등록자ID 입력
    masterDS.put(Consts.PK_USER_ID, user_Id);

    // Sub 저장
    if (subCnt > 0) {
      for (int i = 0; i < subCnt; i++) {
        Map<String, Object> rowData = subDS.get(i);
        rowData.put(Consts.PK_USER_ID, user_Id);

        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(crud)) {

          // etc_no가 null인 경우는 신규인 경우
          if (etc_no != null) {
            rowData.put("P_ETC_NO", etc_no);
          }

          HashMap<String, Object> mapResult = nexosDAO.callSP(LC_FW_STOCK_CHANGE_ORDER, rowData);

          String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }

          if (etc_no == null) {
            etc_no = (String)mapResult.get("O_ETC_NO");
          }
        } else if (Consts.DV_CRUD_D.equals(crud)) {
          // 입고전표
          Map<String, Object> spParams = new HashMap<String, Object>();
          spParams.put("P_CENTER_CD", rowData.get("P_LINK_CENTER_CD"));
          spParams.put("P_BU_CD", rowData.get("P_LINK_BU_CD"));
          spParams.put("P_ETC_DATE", rowData.get("P_LINK_ETC_DATE"));
          spParams.put("P_ETC_NO", rowData.get("P_LINK_ETC_NO"));
          spParams.put("P_LINE_NO", rowData.get("P_LINE_NO"));
          spParams.put(Consts.PK_USER_ID, user_Id);

          HashMap<String, Object> mapResult;

          mapResult = nexosDAO.callSP(LC_BW_ETC_ENTRY, spParams);
          String oMsg = "";
          oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }
          mapResult = nexosDAO.callSP(LC_BW_ETC_ENTRY, rowData);
          oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }
        } else if (Consts.DV_CRUD_U.equals(crud)) {
          nexosDAO.update(DETAIL_UPDATE_ID, rowData);
        }
      }
    }
  }
}
