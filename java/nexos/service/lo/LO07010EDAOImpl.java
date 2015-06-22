package nexos.service.lo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: LO07010EDAOImpl<br>
 * Description: LO07010E DAO (Data Access Object)<br>
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
@Repository("LO07010EDAO")
public class LO07010EDAOImpl implements LO07010EDAO {

  @Resource
  private NexosDAO nexosDAO;

  @SuppressWarnings("rawtypes")
  @Override
  public Map callBWScanConfirm(Map<String, Object> params) throws Exception {

    final String LO_BW_SCAN_CONFIRM_ORDER_ID = "LO_BW_SCAN_CONFIRM";

    return nexosDAO.callSP(LO_BW_SCAN_CONFIRM_ORDER_ID, params);
  }

  @SuppressWarnings("rawtypes")
  @Override
  public Map callFWScanConfirm(Map<String, Object> params) throws Exception {

    final String LO_FW_SCAN_CONFIRM_ORDER_ID = "LO_FW_SCAN_CONFIRM";

    return nexosDAO.callSP(LO_FW_SCAN_CONFIRM_ORDER_ID, params);
  }

  @SuppressWarnings("unchecked")
  @Override
  public String callScanBoxDelete(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String LO_SCAN_BOX_DELETE_ID = "LO_SCAN_BOX_DELETE";

    String result = Consts.OK;
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    HashMap<String, Object> mapResult = null;
    String oMsg;

    // 파라메터 처리
    List<Map<String, Object>> masterDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);

    int dsCnt = masterDS.size();
    if (dsCnt > 0) {
      // 디테일 처리
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = masterDS.get(i);

        rowData.put(Consts.PK_USER_ID, user_Id);
        mapResult = nexosDAO.callSP(LO_SCAN_BOX_DELETE_ID, rowData);

        oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
      }
    }

    return result;
  }

  @SuppressWarnings("rawtypes")
  @Override
  public Map callScanBoxMerge(Map<String, Object> params) throws Exception {

    final String LO_SCAN_BOX_MERGE_ID = "LO_SCAN_BOX_MERGE";

    return nexosDAO.callSP(LO_SCAN_BOX_MERGE_ID, params);
  }

  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String LO_SCAN_BOX_SAVE_ID = "LO_SCAN_BOX_SAVE_T2"; // 상품 단위 저장
    final String LO_SCAN_BOX_COMPLETE_ID = "LO_SCAN_BOX_COMPLETE";

    // 마스터 데이터
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    // 디테일 데이터
    List<Map<String, Object>> detailDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    // 박스완료 여부
    String COMPLETE_YN = (String)params.get("P_COMPLETE_YN");
    String USER_ID = (String)masterDS.get(Consts.PK_USER_ID);
    String BOX_TYPE = (String)masterDS.get("P_BOX_TYPE");

    HashMap<String, Object> mapResult = null;
    String oMsg;

    int dsCnt = detailDS.size();
    if (dsCnt > 0) {
      // 디테일 처리
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = detailDS.get(i);

        rowData.put(Consts.PK_USER_ID, USER_ID);
        rowData.put("P_BOX_TYPE", BOX_TYPE);
        mapResult = nexosDAO.callSP(LO_SCAN_BOX_SAVE_ID, rowData);

        oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
      }
    }

    // 박스완료 처리
    if (Consts.YES.equals(COMPLETE_YN)) {

      masterDS.put(Consts.PK_USER_ID, USER_ID);
      mapResult = nexosDAO.callSP(LO_SCAN_BOX_COMPLETE_ID, masterDS);

      oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
    }
  }

}
