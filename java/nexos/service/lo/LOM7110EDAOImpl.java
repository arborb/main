package nexos.service.lo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: LOM711EDAOImpl<br>
 * Description: LOM711E DAO (Data Access Object)<br>
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
@Repository("LOM7110EDAO")
public class LOM7110EDAOImpl implements LOM7110EDAO {

  @Resource
  private NexosDAO nexosDAO;

  @SuppressWarnings("unchecked")
  @Override
  public String callBoxDelete(Map<String, Object> params) throws Exception {
    
    // SQLMAP ID 세팅
    final String LO_PICK_SCAN_BOX_DEL = "LO_PICK_SCAN_BOX_DEL";
    
    String result = Consts.OK;
    //String user_Id = (String)params.get(Consts.PK_USER_ID);
    
    HashMap<String, Object> mapResult = null;
    String oMsg;
    
    // 파라메터 처리
    List<Map<String, Object>> masterDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    
    int dsCnt = masterDS.size();
    if (dsCnt > 0) {
      // 디테일 처리
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = masterDS.get(i);
        
        //rowData.put(Consts.PK_USER_ID, user_Id);
        mapResult = nexosDAO.callSP(LO_PICK_SCAN_BOX_DEL, rowData);
        
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
  public Map callFWScanConfirm(Map<String, Object> params) throws Exception {

    final String LO_FW_SCAN_CONFIRM_ORDER_ID = "LO_FW_SCAN_PICK_PROC";

    return nexosDAO.callSP(LO_FW_SCAN_CONFIRM_ORDER_ID, params);
  }
}
