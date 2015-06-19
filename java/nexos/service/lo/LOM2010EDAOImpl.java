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
 * Class: LOM2010EDAOImpl<br>
 * Description: LOM2010E DAO (Data Access Object)<br>
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
@Repository("LOM2010EDAO")
public class LOM2010EDAOImpl implements LOM2010EDAO {
 
  // private final Logger logger = LoggerFactory.getLogger(LOM2010EDAOImpl.class);

  @Resource
  private NexosDAO nexosDAO;

  /**
   * 상품의 재고 취득
   */
  private void checkingOut_StockQTY(Map<String, Object> rowData, int rownum) {

    final String GET_PSTOCK_QTY_ID = "WF.GET_LO_PSTOCK_QTY";

    String outbound_no = (String)rowData.get("P_OUTBOUND_NO");
    // 출고예정 종결처리
    Map<String, Object> newParams = new HashMap<String, Object>();
    newParams.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
    newParams.put("P_BU_CD", rowData.get("P_BU_CD"));
    newParams.put("P_BRAND_CD", rowData.get("P_BRAND_CD"));
    newParams.put("P_ITEM_CD", rowData.get("P_ITEM_CD"));
    newParams.put("P_ITEM_STATE", rowData.get("P_ITEM_STATE"));
    newParams.put("P_ITEM_LOT", rowData.get("P_ITEM_LOT"));
    newParams.put("P_POLICY_LO310", "");
    newParams.put("P_POLICY_LO320", "");
    newParams.put("P_OUTBOUND_DATE", outbound_no.equals("") ? "" : rowData.get("P_OUTBOUND_DATE"));
    newParams.put("P_OUTBOUND_NO", outbound_no);

    HashMap<String, Object> mapResult = nexosDAO.callSP(GET_PSTOCK_QTY_ID, newParams);

    String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
    if (!Consts.OK.equals(oMsg)) {
      throw new RuntimeException(oMsg);
    }

    int intPSTOCK_QTY = Integer.parseInt(mapResult.get("O_PSTOCK_QTY").toString());
    int intSumEntry_qty = Integer.parseInt(rowData.get("P_SUM_ENTRY_QTY").toString());
    int intEntry_qty = Integer.parseInt(rowData.get("P_ENTRY_QTY").toString());
    if (intSumEntry_qty > intPSTOCK_QTY) {
      String errMsg = "출고가능량 보다 큰 출고수량을 등록하실 수 없습니다. \n[" + String.valueOf(rownum + 1) + "]행, 등록수량[" + intEntry_qty
        + "], 출고가능량[" + intPSTOCK_QTY + "]";
      throw new RuntimeException(errMsg);
    }
  }

  /**
   * 출고개별 화면에서 Confirm처리시 신규배송차수일 경우 Delivery_Batch를 취득
   *
   * @param params
   * @throws Exception
   */
  @Override
  public String deliveryBatch(Map<String, Object> params) throws Exception {

    String delivery_batch = (String)params.get("P_DELIVERY_BATCH");
    if (delivery_batch.equals("000")) {
      // 배송차수 채번
      delivery_batch = this.getDelivery_batch(params);
    }

    return delivery_batch;
  }

  /**
   * 배송차수 채번
   */
  private String getDelivery_batch(Map<String, Object> masterDS) {

    final String LO_DELIVERY_BATCH_GETNO_ID = "WT.LO_DELIVERY_BATCH_GETNO";

    String strDeliveryBatch = (String)masterDS.get("P_DELIVERY_BATCH");
    if (masterDS.get("P_DELIVERY_BATCH") == null || masterDS.get("P_DELIVERY_BATCH").equals("")
      || masterDS.get("P_DELIVERY_BATCH").equals("000")) {

      Map<String, Object> newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_OUTBOUND_DATE", masterDS.get("P_OUTBOUND_DATE"));
      newParams.put("P_DELIVERY_BATCH_NM", masterDS.get("P_DELIVERY_BATCH_NM"));
      newParams.put("P_USER_ID", masterDS.get("P_USER_ID"));

      HashMap<String, Object> mapResult = nexosDAO.callSP(LO_DELIVERY_BATCH_GETNO_ID, newParams);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      strDeliveryBatch = (String)mapResult.get("O_DELIVERY_BATCH");
    }
    return strDeliveryBatch;
  }

  /**
   * 출고차수를 채번
   */
  private String getOutbound_batch(Map<String, Object> param) {

    final String LO_OUTBOUND_BATCH_GETNO_ID = "WT.LO_OUTBOUND_BATCH_GETNO";

    String strOutboundBatch = null;
    Map<String, Object> newParams = new HashMap<String, Object>();
    newParams.put("P_CENTER_CD", param.get("P_CENTER_CD"));
    newParams.put("P_BU_CD", param.get("P_BU_CD"));
    newParams.put("P_OUTBOUND_DATE", param.get("P_OUTBOUND_DATE"));
    newParams.put("P_OUTBOUND_BATCH_NM", param.get("P_OUTBOUND_BATCH_NM"));
    newParams.put(Consts.PK_USER_ID, param.get(Consts.PK_USER_ID));

    HashMap<String, Object> mapResult = nexosDAO.callSP(LO_OUTBOUND_BATCH_GETNO_ID, newParams);
    String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
    if (!Consts.OK.equals(oMsg)) {
      throw new RuntimeException(oMsg);
    }
    strOutboundBatch = (String)mapResult.get("O_OUTBOUND_BATCH");
    return strOutboundBatch;
  }

  /**
   * 출고등록 마스터/디테일 저장 처리
   *
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "LOM2010E";
    final String MASTER_TABLE_NM = "LO020NM";
    final String MASTER_INSERT_ID = PRORAM_ID + ".INSERT_" + MASTER_TABLE_NM;
    final String MASTER_UPDATE_ID = PRORAM_ID + ".UPDATE_" + MASTER_TABLE_NM;
    final String DETAIL_TABLE_NM = "LO020ND";
    final String DETAIL_INSERT_ID = PRORAM_ID + ".INSERT_" + DETAIL_TABLE_NM;
    final String DETAIL_UPDATE_ID = PRORAM_ID + ".UPDATE_" + DETAIL_TABLE_NM;
    final String DETAIL_DELETE_ID = PRORAM_ID + ".DELETE_" + DETAIL_TABLE_NM;
    //final String SUB_TABLE_NM = "LO020PM";
    //final String SUB_INSERT_ID = PRORAM_ID + ".INSERT_" + SUB_TABLE_NM;
    //final String SUB_UPDATE_ID = PRORAM_ID + ".UPDATE_" + SUB_TABLE_NM;


    final String LOM_INSERT_ID1 = "LO_2010PM_INSERT";
    final String LOM_UPDATE_ID1 = "LO_2010PM_UPDATE";

    
    final String LO020NM_GETNO_ID = "WT.LO_020NM_GETNO";
    final String LO020ND_GETNO_ID = "WT.LO_020ND_GETNO";
    final String LO_POLICY_ENTRY_INIT_ID = "LO_POLICY_ENTRY_INIT";
    final String LO_PROCESSING_ID = "LO_PROCESSING";

    // 파라메터 처리
    Map<String, Object> masterDS = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);
    Map<String, Object> subDS = (HashMap<String, Object>)params.get(Consts.PK_DS_SUB);
    List<Map<String, Object>> detailDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    // A: 예정 -> 등록, B: 등록 -> 수정, N: 신규 등록
    String process_Cd = (String)params.get("P_PROCESS_CD");
    String user_Id = (String)params.get(Consts.PK_USER_ID);
    String outbound_No;
    String delivery_Batch = null;
    int line_No;
    int dsCnt = detailDS.size();

    // 등록자ID 입력
    masterDS.put(Consts.PK_USER_ID, user_Id);
    subDS.put(Consts.PK_USER_ID, user_Id);


  


    Map<String, Object> newParams;
    // 등록 처리 -> 예정 > 등록, 신규 등록
    if (Consts.PROCESS_ORDER.equals(process_Cd) || Consts.PROCESS_ENTRY_NEW.equals(process_Cd)) {

      if (dsCnt < 1) {
        throw new RuntimeException("출고등록 상세내역이 존재하지 않습니다.");
      }

      // 출고번호 채번
      newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_OUTBOUND_DATE", masterDS.get("P_OUTBOUND_DATE"));

      HashMap<String, Object> mapResult = nexosDAO.callSP(LO020NM_GETNO_ID, newParams);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      line_No = 1;

      outbound_No = (String)mapResult.get("O_OUTBOUND_NO");
      masterDS.put("P_OUTBOUND_NO", outbound_No);
      subDS.put("P_OUTBOUND_NO", outbound_No);




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
      
      
      
      // 배송차수 채번 및 LOBATCH 등록
      delivery_Batch = getDelivery_batch(masterDS);
      masterDS.put("P_DELIVERY_BATCH", delivery_Batch);

      // 출고차수 기본값 000으로 수정.
      masterDS.put("P_OUTBOUND_BATCH", "000");

      // 송수신상태 기본값 설정.
      masterDS.put("P_SEND_STATE", "00");
      // 도착(납품)예정일시
      
      newParams.put("P_PLANED_DATETIME", masterDS.get("P_PLANED_DATETIME"));

      // 마스터 생성, CRUD 체크 안함
      nexosDAO.insert(MASTER_INSERT_ID, masterDS);
      // 출고부가정보 마스터(온라인고객), CRUD 체크 안함
      //nexosDAO.insert(SUB_INSERT_ID, subDS);

      nexosDAO.callSP(LOM_INSERT_ID1, subDS);
      
    } else {

      // 배송차수 채번 및 LOBATCH 등록
      delivery_Batch = getDelivery_batch(masterDS);
      masterDS.put("P_DELIVERY_BATCH", delivery_Batch);

      // 수정 처리
      // 출고순번 채번
      outbound_No = (String)masterDS.get("P_OUTBOUND_NO");
      newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_OUTBOUND_DATE", masterDS.get("P_OUTBOUND_DATE"));
      newParams.put("P_OUTBOUND_NO", outbound_No);

      HashMap<String, Object> mapResult = nexosDAO.callSP(LO020ND_GETNO_ID, newParams);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      line_No = ((Number)mapResult.get("O_LINE_NO")).intValue();

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
      
      
      
      // 마스터를 수정했으면 업데이트
      if (Consts.DV_CRUD_U.equals(masterDS.get(Consts.PK_CRUD))) {
        nexosDAO.update(MASTER_UPDATE_ID, masterDS);
      }
      // 출고부가정보 마스터(온라인고객)를 수정했으면 업데이트
      if (Consts.DV_CRUD_U.equals(subDS.get(Consts.PK_CRUD))) {
        //nexosDAO.update(SUB_UPDATE_ID, subDS);
        
        nexosDAO.callSP(LOM_UPDATE_ID1, subDS);
        
      }
    }

    // 디테일이 변경되었으면 LO_PROCESSING 호출
    if (dsCnt > 0) {

      // 지시 초기화
      newParams.clear();
      newParams.put("P_CENTER_CD", masterDS.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", masterDS.get("P_BU_CD"));
      newParams.put("P_OUTBOUND_DATE", masterDS.get("P_OUTBOUND_DATE"));
      newParams.put("P_OUTBOUND_NO", outbound_No);
      newParams.put("P_USER_ID", user_Id);

      HashMap<String, Object> mapResult1 = nexosDAO.callSP(LO_POLICY_ENTRY_INIT_ID, newParams);
      String oMsg = (String)mapResult1.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      // LO020ND테이블에 추가/수정 전에 출고가능량 체크를 한다.
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = detailDS.get(i);
        this.checkingOut_StockQTY(rowData, i); // 재고체크
      }

      // 디테일 처리
      for (int i = 0; i < dsCnt; i++) {
        Map<String, Object> rowData = detailDS.get(i);
        rowData.put(Consts.PK_USER_ID, user_Id);
        String crud = (String)rowData.get(Consts.PK_CRUD);
        if (Consts.DV_CRUD_C.equals(crud)) {
          rowData.put("P_OUTBOUND_NO", outbound_No);
          if ("".equals(String.valueOf(rowData.get("P_LINE_NO")))) {
            rowData.put("P_LINE_NO", line_No);
            rowData.put("P_ORG_LINE_NO", line_No);
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
      newParams.put("P_OUTBOUND_DATE", masterDS.get("P_OUTBOUND_DATE"));
      newParams.put("P_OUTBOUND_NO", outbound_No);
      newParams.put("P_PROCESS_CD", Consts.PROCESS_ENTRY);
      newParams.put("P_DIRECTION", Consts.DIRECTION_FW);
      newParams.put("P_USER_ID", user_Id);

      HashMap<String, Object> mapResult2 = nexosDAO.callSP(LO_PROCESSING_ID, newParams);
      oMsg = (String)mapResult2.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
    }

  }

  /**
   * 출고확정 저장
   *
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  @Override
  public void saveConfirms(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "LOM2010E";
    final String MASTER_TABLE_NM = "LO020NM";
    final String MASTER_UPDATE_ID = PRORAM_ID + ".UPDATE_" + MASTER_TABLE_NM;
    final String TABLE_NM = "LO030NM";
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;

    final String LO_020ND_QTY_UPDATE = "LO_020ND_QTY_UPDATE";

    // 파라메터 처리
    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    Map<String, Object> masterParams = (HashMap<String, Object>)params.get(Consts.PK_DS_MASTER);

    masterParams.put(Consts.PK_USER_ID, user_Id);
    String crud = (String)masterParams.get(Consts.PK_CRUD);
    if (Consts.DV_CRUD_U.equals(crud)) {
      nexosDAO.update(MASTER_UPDATE_ID, masterParams);
    }

    // INSERT/UPDATE/DELETE 처리
    final int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_USER_ID, user_Id);

      crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_U.equals(crud)) {
        nexosDAO.update(UPDATE_ID, rowData);
      }
      // 출고등록 디테일 확정수량 수정 처리
      Map<String, Object> newParams = new HashMap<String, Object>();
      newParams.put("P_CENTER_CD", rowData.get("P_CENTER_CD"));
      newParams.put("P_BU_CD", rowData.get("P_BU_CD"));
      newParams.put("P_OUTBOUND_DATE", rowData.get("P_OUTBOUND_DATE"));
      newParams.put("P_OUTBOUND_NO", rowData.get("P_OUTBOUND_NO"));
      newParams.put("P_LINE_NO", rowData.get("P_LINE_NO"));
      newParams.put(Consts.PK_USER_ID, user_Id);

      HashMap<String, Object> mapResult = nexosDAO.callSP(LO_020ND_QTY_UPDATE, newParams);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
    }
  }

  /**
   * 배송완료의 상세정보 내용 저장(배송수량/미배송사유/미배송사유내역)
   */
  @SuppressWarnings("unchecked")
  @Override
  public void saveDelivery(Map<String, Object> params) throws Exception {

    final String PRORAM_ID = "LOM2010E";
    final String TABLE_NM = "LO020ND";
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM + "_DELIVERY";

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_U.equals(crud)) {
        int count = nexosDAO.update(UPDATE_ID, rowData);
        if (count == 0) {
          throw new Exception("출고확정된 전표만 미배송저장 처리가 가능합니다.");
        }
      }
    }
  }

  /**
   * 출고지시 화면에서 Confirm처리시 DELIVERY_TYPE 저장후 처리
   *
   * @param params
   * @return
   * @throws Exception
   */
  @Override
  public String saveDeliverytype(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "LOM2010E";
    final String TABLE_NM = "LO020NM";
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;

    String delivery_type = (String)params.get("P_DELIVERY_TYPE");
    String direction = (String)params.get("P_DIRECTION");

    if (Consts.DIRECTION_BW.equals(direction)) {
      params.put("P_DELIVERY_TYPE", "");
    } else {
      params.put("P_DELIVERY_TYPE", delivery_type);
    }
    // UPDATE처리
    nexosDAO.update(UPDATE_ID, params);

    return delivery_type;
  }

  /**
   * 출고지시 화면에서 Confirm처리시 OUTBOUND_BATCH 저장후 처리
   *
   * @param params
   * @return
   * @throws Exception
   */
  @Override
  public String saveDirections(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "LOM2010E";
    final String TABLE_NM = "LO020NM";
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;

    String outbound_batch = (String)params.get("P_OUTBOUND_BATCH");

    String outbound_Batch_save = null;
    if (outbound_batch.equals("000")) {
      outbound_Batch_save = this.getOutbound_batch(params);
    } else {
      outbound_Batch_save = outbound_batch;
    }
 
    params.put("P_OUTBOUND_BATCH", outbound_Batch_save);
    // UPDATE처리
    nexosDAO.update(UPDATE_ID, params);

    return outbound_Batch_save;
  }

  /**
   * 출고등록(일괄) 저장
   *
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  @Override
  public void saveEntryBT(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "LOM2010E";
    final String TABLE_NM = "LO010ND";
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;

    // 파라메터 처리
    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    // INSERT/UPDATE/DELETE 처리
    final int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_U.equals(crud)) {
        int update = nexosDAO.update(UPDATE_ID, rowData);
        if (update == 0) {
          StringBuilder sbError = new StringBuilder();
          sbError.append("[예정일자: ").append(rowData.get("P_ORDER_DATE"));
          sbError.append(",예정번호: ").append(rowData.get("P_ORDER_NO"));
          sbError.append(",순번: ").append(rowData.get("P_LINE_NO")).append("]\n");
          sbError.append("해당 데이터는 진행상태가 변경되어 저장할 수 없습니다.");
          throw new RuntimeException(sbError.toString());
        }
      }
    }
  }

  /**
   * 출고지시 화면에서 Confirm처리시 SHIP_TYPE 저장후 처리
   *
   * @param params
   * @return
   * @throws Exception
   */
  @Override
  public String saveShiptype(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "LOM2010E";
    final String TABLE_NM = "LO020NM";
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;

    String ship_type = (String)params.get("P_SHIP_TYPE");
    String direction = (String)params.get("P_DIRECTION");

    if (Consts.DIRECTION_BW.equals(direction)) {
      params.put("P_SHIP_TYPE", "");
    } else {
      params.put("P_SHIP_TYPE", ship_type);
    }
    // UPDATE처리
    nexosDAO.update(UPDATE_ID, params);

    return ship_type;
  }
  
  
  @SuppressWarnings("rawtypes")
  @Override
  public Map callUpdate(Map<String, Object> params) throws Exception {

    final String LO_UDATE = "TEMP_LOCNT_30_UPDATE";

    return nexosDAO.callSP(LO_UDATE, params);
  }

  
  @SuppressWarnings("rawtypes")
  @Override
  public Map callUpdateD(Map<String, Object> params) throws Exception {

    final String LO_D_UDATE = "TEMP_LOCNT_40_UPDATE";

    return nexosDAO.callSP(LO_D_UDATE, params);
  }
}
