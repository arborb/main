package nexos.service.lx;

import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: LX04010EDAOImpl<br>
 * Description: LX04010E DAO (Data Access Object)<br>
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
@Repository("LX04010EDAO")
public class LX04010EDAOImpl implements LX04010EDAO {

  // private final Logger logger = LoggerFactory.getLogger(LX04010EDAOImpl.class);

  @Resource
  private NexosDAO nexosDAO;

  /**
   * X-DOCK 프로세스별 수량 저장 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @Override
  public void save(Map<String, Object> params) throws Exception {

    // SQLMAP ID 세팅
    final String PRORAM_ID = "LX04010E";
    final String DETAIL20_TABLE_NM = "LX020ND";
    final String DETAIL20_UPDATE_INSPECT_QTY_ID = PRORAM_ID + ".UPDATE_" + DETAIL20_TABLE_NM + "_INSPECT_QTY";
    final String SUB20_TABLE_NM = "LX020NS";
    final String SUB20_UPDATE_INSPECT_QTY_ID = PRORAM_ID + ".UPDATE_" + SUB20_TABLE_NM + "_INSPECT_QTY";
    final String SUB20_UPDATE_DISTRIBUTE_QTY_ID = PRORAM_ID + ".UPDATE_" + SUB20_TABLE_NM + "_DISTRIBUTE_QTY";
    final String SUB20_UPDATE_DELIVERY_QTY_ID = PRORAM_ID + ".UPDATE_" + SUB20_TABLE_NM + "_DELIVERY_QTY";

    // A: 예정 -> 등록, B: 등록 -> 수정
    String process_Cd = (String)params.get("P_PROCESS_CD");
    String crud = (String)params.get(Consts.PK_CRUD);
    if (Consts.DV_CRUD_C.equals(crud)) {

    } else if (Consts.DV_CRUD_U.equals(crud)) {

      if (Consts.PROCESS_ORDER.equals(process_Cd)) {

      } else if (Consts.PROCESS_ENTRY.equals(process_Cd)) {

      } else if (Consts.PROCESS_XINSPECT.equals(process_Cd)) {
        // LX020ND 검수수량 수정
        nexosDAO.update(DETAIL20_UPDATE_INSPECT_QTY_ID, params);
      } else if (Consts.PROCESS_XINSPECT_ASN.equals(process_Cd)) {
        // LX020NS 검수수량 수정
        nexosDAO.update(SUB20_UPDATE_INSPECT_QTY_ID, params);
      } else if (Consts.PROCESS_XDISTRIBUTE.equals(process_Cd)) {
        // LX020NS 분배수량 수정
        nexosDAO.update(SUB20_UPDATE_DISTRIBUTE_QTY_ID, params);
      } else if (Consts.PROCESS_XCONFIRM.equals(process_Cd)) {

      } else if (Consts.PROCESS_XDELIVERY.equals(process_Cd)) {
        // LX020ND 미배송수량 및 미배송사유, 내역 수정
        nexosDAO.update(SUB20_UPDATE_DELIVERY_QTY_ID, params);
      }

    } else if (Consts.DV_CRUD_D.equals(crud)) {

    }

  }

}