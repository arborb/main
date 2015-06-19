package nexos.service.lo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;
import nexos.common.spring.security.Encryption;

import org.springframework.stereotype.Repository;

/**
 * Class: LOM1010EDAOImpl<br>
 * Description: LOM1010E DAO (Data Access Object)<br>
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
@Repository("LOM1010EDAO")
public class LOM1010EDAOImpl implements LOM1010EDAO {

    @Resource
    private NexosDAO nexosDAO;

    @SuppressWarnings("unchecked")
    @Override
    public void save(Map<String, Object> params) throws Exception {

        // SQLMAP ID 세팅
        final String PRORAM_ID = "LO01010E";
        //final String LOM_PRORAM_ID = "LOM1010E";
        
        final String MASTER_TABLE_NM = "LO010NM";
        final String MASTER_INSERT_ID = PRORAM_ID + ".INSERT_" + MASTER_TABLE_NM;
        final String MASTER_UPDATE_ID = PRORAM_ID + ".UPDATE_" + MASTER_TABLE_NM;
        final String DETAIL_TABLE_NM = "LO010ND";
        final String DETAIL_INSERT_ID = PRORAM_ID + ".INSERT_" + DETAIL_TABLE_NM;
        final String DETAIL_UPDATE_ID = PRORAM_ID + ".UPDATE_" + DETAIL_TABLE_NM;
        final String DETAIL_DELETE_ID = PRORAM_ID + ".DELETE_" + DETAIL_TABLE_NM;
        //final String LOM_TABLE_NM = "LO010PM";
        //final String LOM_INSERT_ID = LOM_PRORAM_ID + ".INSERT_" + LOM_TABLE_NM;
        //final String LOM_UPDATE_ID = LOM_PRORAM_ID + ".UPDATE_" + LOM_TABLE_NM;
        

        final String LOM_INSERT_ID1 = "LO_1010PM_INSERT";
        final String LOM_UPDATE_ID1 = "LO_1010PM_UPDATE";

        final String LO010NM_GETNO_ID = "WT.LO_010NM_GETNO";
        final String LO010ND_GETNO_ID = "WT.LO_010ND_GETNO";
        final String LO_PROCESSING_ID = "LO_PROCESSING";

        // 파라메터 처리
        Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
        Map<String, Object> subDS = (HashMap<String, Object>)params.get(Consts.PK_DS_SUB);
        List<Map<String, Object>> detailDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
        //N: 신규 등록
        String process_Cd = (String)params.get("P_PROCESS_CD");
        String user_Id = (String)params.get(Consts.PK_USER_ID);
        String order_No;
        int line_No;
        int dsCnt = detailDS.size();
        

    
    

        // 등록자ID 입력
        masterDS.put(Consts.PK_USER_ID, user_Id);
        //subDS.put(Consts.PK_USER_ID, user_Id);

        Map<String, Object> newParams;
        // 신규 등록
        if (Consts.PROCESS_ENTRY_NEW.equals(process_Cd)) {

          if (dsCnt < 1) {
            throw new RuntimeException("출고예정등록 상세내역이 존재하지 않습니다.");
          }

          // 출고번호 채번
          newParams = new HashMap<String, Object>();
          newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
          newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
          newParams.put("P_ORDER_DATE", masterDS.get("P_ORDER_DATE"));

          HashMap<String, Object> mapResult = nexosDAO.callSP(LO010NM_GETNO_ID, newParams);
          String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }

          line_No = 1;

          order_No = (String)mapResult.get("O_ORDER_NO");
          masterDS.put("P_ORDER_NO", order_No);
          subDS.put("P_ORDER_NO", order_No);
          

          String ScpMasterEncStr1 =  (String)subDS.get(Consts.DK_SCP_DATA_11); //P_ORDERER_TEL
          String ScpMasterEncStr2 =  (String)subDS.get(Consts.DK_SCP_DATA_7);  //P_ORDERER_HP
          String ScpMasterEncStr3 =  (String)subDS.get(Consts.DK_SCP_DATA_6);  //P_ORDERER_EMAIL
          String ScpMasterEncStr6 =  (String)subDS.get(Consts.DK_SCP_DATA_4);  //P_SHIPPER_TEL
          String ScpMasterEncStr7 =  (String)subDS.get(Consts.DK_SCP_DATA_3);  //P_SHIPPER_HP
          String ScpMasterEncStr8 =  (String)subDS.get(Consts.DK_SCP_DATA_1);  //P_SHIPPER_ADDR_BASIC
          String ScpMasterEncStr9 =  (String)subDS.get(Consts.DK_SCP_DATA_2);  //P_SHIPPER_ADDR_DETAIL
          String ScpMasterEncStr10 =  (String)subDS.get(Consts.DK_SCP_DATA_5);  //P_ORDERER_NM
          String ScpMasterEncStr11 =  (String)subDS.get(Consts.DK_SCP_DATA_8);  //P_SHIPPER_NM
          

          
          Encryption EncStr = new Encryption();

          
          subDS.put(Consts.DK_SCP_DATA_11, EncStr.aesEncode(ScpMasterEncStr1));
          subDS.put(Consts.DK_SCP_DATA_7, EncStr.aesEncode(ScpMasterEncStr2));
          subDS.put(Consts.DK_SCP_DATA_6, EncStr.aesEncode(ScpMasterEncStr3));
          subDS.put(Consts.DK_SCP_DATA_4, EncStr.aesEncode(ScpMasterEncStr6));
          subDS.put(Consts.DK_SCP_DATA_3, EncStr.aesEncode(ScpMasterEncStr7));
          subDS.put(Consts.DK_SCP_DATA_1, EncStr.aesEncode(ScpMasterEncStr8));
          subDS.put(Consts.DK_SCP_DATA_2, EncStr.aesEncode(ScpMasterEncStr9));
          subDS.put(Consts.DK_SCP_DATA_5, EncStr.aesEncode(ScpMasterEncStr10));
          subDS.put(Consts.DK_SCP_DATA_8, EncStr.aesEncode(ScpMasterEncStr11));
          
          
          // 마스터 생성, CRUD 체크 안함
          nexosDAO.insert(MASTER_INSERT_ID, masterDS);
         // nexosDAO.insert(LOM_INSERT_ID, subDS);
          nexosDAO.callSP(LOM_INSERT_ID1, subDS);
        } else {
          // 수정 처리
          // 출고순번 채번
          order_No = (String)masterDS.get("P_ORDER_NO");
          newParams = new HashMap<String, Object>();
          newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
          newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
          newParams.put("P_ORDER_DATE", masterDS.get("P_ORDER_DATE"));
          newParams.put("P_ORDER_NO", order_No);

          String ScpMasterEncStr1 =  (String)subDS.get(Consts.DK_SCP_DATA_11); //P_ORDERER_TEL
          String ScpMasterEncStr2 =  (String)subDS.get(Consts.DK_SCP_DATA_7);  //P_ORDERER_HP
          String ScpMasterEncStr3 =  (String)subDS.get(Consts.DK_SCP_DATA_6);  //P_ORDERER_EMAIL
          String ScpMasterEncStr6 =  (String)subDS.get(Consts.DK_SCP_DATA_4);  //P_SHIPPER_TEL
          String ScpMasterEncStr7 =  (String)subDS.get(Consts.DK_SCP_DATA_3);  //P_SHIPPER_HP
          String ScpMasterEncStr8 =  (String)subDS.get(Consts.DK_SCP_DATA_1);  //P_SHIPPER_ADDR_BASIC
          String ScpMasterEncStr9 =  (String)subDS.get(Consts.DK_SCP_DATA_2);  //P_SHIPPER_ADDR_DETAIL
          String ScpMasterEncStr10 =  (String)subDS.get(Consts.DK_SCP_DATA_5);  //P_ORDERER_NM
          String ScpMasterEncStr11 =  (String)subDS.get(Consts.DK_SCP_DATA_8);  //P_SHIPPER_NM
          

          
          Encryption EncStr = new Encryption();

          
          subDS.put(Consts.DK_SCP_DATA_11, EncStr.aesEncode(ScpMasterEncStr1));
          subDS.put(Consts.DK_SCP_DATA_7, EncStr.aesEncode(ScpMasterEncStr2));
          subDS.put(Consts.DK_SCP_DATA_6, EncStr.aesEncode(ScpMasterEncStr3));
          subDS.put(Consts.DK_SCP_DATA_4, EncStr.aesEncode(ScpMasterEncStr6));
          subDS.put(Consts.DK_SCP_DATA_3, EncStr.aesEncode(ScpMasterEncStr7));
          subDS.put(Consts.DK_SCP_DATA_1, EncStr.aesEncode(ScpMasterEncStr8));
          subDS.put(Consts.DK_SCP_DATA_2, EncStr.aesEncode(ScpMasterEncStr9));
          subDS.put(Consts.DK_SCP_DATA_5, EncStr.aesEncode(ScpMasterEncStr10));
          subDS.put(Consts.DK_SCP_DATA_8, EncStr.aesEncode(ScpMasterEncStr11));
          
          
          HashMap<String, Object> mapResult = nexosDAO.callSP(LO010ND_GETNO_ID, newParams);
          String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }

          line_No = ((Number)mapResult.get("O_LINE_NO")).intValue();

          // 마스터 수정, 마스터를 수정했으면
          if (Consts.DV_CRUD_U.equals(masterDS.get(Consts.PK_CRUD))) {
            nexosDAO.update(MASTER_UPDATE_ID, masterDS);
          }
          //온라인 부가정보 마스터를 수정했을때 업데이트
          if (Consts.DV_CRUD_U.equals(subDS.get(Consts.PK_CRUD))) {
           // nexosDAO.update(LOM_UPDATE_ID, subDS);

            nexosDAO.callSP(LOM_UPDATE_ID1, subDS);
          }
        }

        // 디테일이 변경되었으면 LO_PROCESSING 호출
        if (dsCnt > 0) {

          // 디테일 처리
          for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = detailDS.get(i);
            rowData.put(Consts.PK_USER_ID, user_Id);

            String crud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_C.equals(crud)) {
                rowData.put("P_ORDER_NO", order_No);
                if ("".equals(String.valueOf(rowData.get("P_LINE_NO")))) {
                  rowData.put("P_LINE_NO", line_No);
                  line_No++;
                }
              nexosDAO.insert(DETAIL_INSERT_ID, rowData);
            } else if (Consts.DV_CRUD_U.equals(crud)) {
              nexosDAO.update(DETAIL_UPDATE_ID, rowData);
            } else if (Consts.DV_CRUD_D.equals(crud)) {
              nexosDAO.delete(DETAIL_DELETE_ID, rowData);
            }
          }

          newParams.clear();
          newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
          newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
          newParams.put("P_OUTBOUND_DATE", masterDS.get("P_ORDER_DATE"));
          newParams.put("P_OUTBOUND_NO", order_No);
          newParams.put("P_PROCESS_CD", Consts.PROCESS_ORDER);
          newParams.put("P_DIRECTION", Consts.DIRECTION_FW);
          newParams.put("P_USER_ID", user_Id);

          HashMap<String, Object> mapResult2 = nexosDAO.callSP(LO_PROCESSING_ID, newParams);
          String oMsg = (String)mapResult2.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }
        }
      }

    @SuppressWarnings("unchecked")
    @Override
    public void delete(Map<String, Object> params) throws Exception {

        List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
        String user_Id = (String)params.get(Consts.PK_USER_ID);

        final String PRORAM_ID = "LO01010E";
        final String LOM_PRORAM_ID = "LOM1010E";

        final String DELETE_MASTER_ID = PRORAM_ID + ".DELETE_LO010NM";
        final String DELETE_DETAIL_ID = PRORAM_ID + ".DELETE_LO010ND_ALL";
        final String UPDATE_MASTER_ID = PRORAM_ID + ".UPDATE_LO010NM";
        final String DELETE_LOM_ID = LOM_PRORAM_ID + ".DELETE_LO010PM";
        final String UPDATE_LOM_ID = LOM_PRORAM_ID + ".UPDATE_LO010PM";

        int dsCnt = saveDS.size();
        for (int i = 0; i < dsCnt; i++) {
            Map<String, Object> rowData = saveDS.get(i);
            rowData.put(Consts.PK_REG_USER_ID, user_Id);

            String crud = (String)rowData.get(Consts.PK_CRUD);
            if (Consts.DV_CRUD_D.equals(crud)) {
                nexosDAO.delete(DELETE_LOM_ID, rowData);
                nexosDAO.delete(DELETE_DETAIL_ID, rowData);
                nexosDAO.delete(DELETE_MASTER_ID, rowData);
            } else if (Consts.DV_CRUD_U.equals(crud)) {
                nexosDAO.update(UPDATE_MASTER_ID, rowData);
                nexosDAO.update(UPDATE_LOM_ID, rowData);
            }
        }
    }
}
