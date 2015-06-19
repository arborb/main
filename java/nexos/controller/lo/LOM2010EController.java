package nexos.controller.lo;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.lo.LOM2010EService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

import com.penta.scpdb.ScpDbAgent;

/**
 * Class: 출고작업[온라인] 컨트롤러<br>
 * Description: 출고작업[온라인] 관리 Controller
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

@Controller
@RequestMapping("/LOM2010E")
public class LOM2010EController extends CommonController {

  @Resource
  private LOM2010EService service;

  /**
   * 위메프 배송유형 재적용(지시) 처리
   *
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @return
   */
  @RequestMapping(value = "/callInvProcLine.do", method = RequestMethod.POST)
  public ResponseEntity<String> callInvProcLine(HttpServletRequest request,
    @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam("P_PROCESS_CD") String process_Cd) {

    ResponseEntity<String> result = null;

    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      if (process_Cd.equals("B")) {
        result = getResponseEntity(request, service.callInvProcLine(params));
      } else {
        result = getResponseEntity(request, service.callInvProc(params));
      }
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 출고등록/출고지시- Confirm/Cancel 처리
   *
   * @param request HttpServletRequest
   * @param subDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/callLOProcessing.do", method = RequestMethod.POST)
  public ResponseEntity<String> callLOProcessing(HttpServletRequest request,
    @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam("P_PROCESS_CD") String process_Cd,
    @RequestParam("P_DIRECTION") String direction, @RequestParam("P_OUTBOUND_BATCH") String outbound_batch,
    @RequestParam("P_OUTBOUND_BATCH_NM") String outbound_batch_nm,
    @RequestParam("P_DELIVERY_BATCH_CD") String delivery_batch_cd,
    @RequestParam("P_DELIVERY_BATCH_NM") String delivery_batch_nm,
    @RequestParam("P_PROCESS_STATE_BW") String process_State_BW,
    @RequestParam("P_PROCESS_STATE_FW") String process_State_FW, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    params.put("P_PROCESS_CD", process_Cd);
    params.put("P_DIRECTION", direction);
    params.put("P_OUTBOUND_BATCH", outbound_batch);
    params.put("P_OUTBOUND_BATCH_NM", outbound_batch_nm);
    params.put("P_DELIVERY_BATCH", delivery_batch_cd);
    params.put("P_DELIVERY_BATCH_NM", delivery_batch_nm);
    params.put("P_PROCESS_STATE_BW", process_State_BW); // 취소가능 진행상태
    params.put("P_PROCESS_STATE_FW", process_State_FW); // 처리가능 진행상태
    params.put(Consts.PK_USER_ID, user_Id);

    try {
      if (process_Cd.equals("BT")) {
        result = getResponseEntity(request, service.entryBatchProcessing(params));
      } else {
        result = getResponseEntity(request, service.callLOProcessing(params));
      }
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 위메프 배송유형 재적용(개별등록) 처리
   *
   * @param request HttpServletRequest
   * @param subDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/callInvProc.do", method = RequestMethod.POST)
  public ResponseEntity<String> callLOProcessingC(HttpServletRequest request,
    @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam("P_DIRECTION_INVNO") String direction_invno) {

    ResponseEntity<String> result = null;

    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    params.put("P_DIRECTION_INVNO", direction_invno);

    try {
      // result = getResponseEntity(request, service.callInvProc(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 위메프 출고지시- Confirm/Cancel 처리
   *
   * @param request HttpServletRequest
   * @param subDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/callLOProcessingC.do", method = RequestMethod.POST)
  public ResponseEntity<String> callLOProcessingC(HttpServletRequest request,
    @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam("P_PROCESS_CD") String process_Cd,
    @RequestParam("P_DIRECTION") String direction, @RequestParam("P_OUTBOUND_BATCH") String outbound_batch,
    @RequestParam("P_OUTBOUND_BATCH_NM") String outbound_batch_nm,
    @RequestParam("P_DELIVERY_BATCH_CD") String delivery_batch_cd,
    @RequestParam("P_DELIVERY_BATCH_NM") String delivery_batch_nm, @RequestParam("P_SHIP_TYPE") String ship_type,
    @RequestParam("P_PROCESS_STATE_BW") String process_State_BW,
    @RequestParam("P_PROCESS_STATE_FW") String process_State_FW, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    params.put("P_PROCESS_CD", process_Cd);
    params.put("P_DIRECTION", direction);
    params.put("P_OUTBOUND_BATCH", outbound_batch);
    params.put("P_OUTBOUND_BATCH_NM", outbound_batch_nm);
    params.put("P_DELIVERY_BATCH", delivery_batch_cd);
    params.put("P_DELIVERY_BATCH_NM", delivery_batch_nm);
    params.put("P_SHIP_TYPE", ship_type);
    params.put("P_PROCESS_STATE_BW", process_State_BW); // 취소가능 진행상태
    params.put("P_PROCESS_STATE_FW", process_State_FW); // 처리가능 진행상태
    params.put(Consts.PK_USER_ID, user_Id);

    try {
      if (process_Cd.equals("BT")) {
        result = getResponseEntity(request, service.entryBatchProcessing(params));
      } else {
        result = getResponseEntity(request, service.callLOProcessing(params));
      }
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 위메프 운송구분 재적용 처리
   *
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @return
   */
  @RequestMapping(value = "/callProcShipType.do", method = RequestMethod.POST)
  public ResponseEntity<String> callProcShipType(HttpServletRequest request,
    @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam("P_PROCESS_CD") String process_Cd) {

    ResponseEntity<String> result = null;

    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
        result = getResponseEntity(request, service.callProcShipType(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * SP호출
   *
   * @param request
   * @param queryId
   * @param queryParams
   * @return
   */
  @RequestMapping(value = "/callSP.do", method = RequestMethod.POST)
  public ResponseEntity<String> callSP(HttpServletRequest request, @RequestParam(Consts.PK_QUERY_ID) String queryId,
    @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      HashMap<String, Object> mapResult = service.callSP(queryId, params);
      result = getResponseEntity(request, mapResult);
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 프린터 출력여부
   *
   * @param request HttpServletRequest
   * @param subDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/Cksave.do", method = RequestMethod.POST)
  public ResponseEntity<String> Cksave(HttpServletRequest request, @RequestParam(Consts.PK_DS_DETAIL) String detailDS,
    @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getDataSet(detailDS, Consts.PK_DS_DETAIL);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.Cksave(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 데이터 조회
   *
   * @param request HttpServletRequest
   * @param queryId 쿼리ID
   * @param queryParams 쿼리 호출 파라메터
   * @return
   */
  @RequestMapping(value = "/getDataSet.do", method = RequestMethod.POST)
  public ResponseEntity<String> getDataSet(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_ID) String queryId, @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    
    
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    // Scp 복호화 키 파라미터 송신
    ScpDbAgent agt = new ScpDbAgent();
    String iniFilePath = "/usr/scp/scpdb_agent_unix.ini";
    String outKey = agt.ScpExportKey( iniFilePath, "KEY1", "" );
    params.put("P_SCPKEY", outKey);
   
   
    
    try {
      result = getResponseEntity(request, service.getDataSet(queryId, params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 출고등록 (일괄) 조회 처리
   *
   * @param request HttpServletRequest
   * @param subDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/getDataSetEntryBT.do", method = RequestMethod.POST)
  public ResponseEntity<String> getDataSetEntryBT(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_ID) String queryId, @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    
    
    

    // Scp 복호화 키 파라미터 송신
    ScpDbAgent agt = new ScpDbAgent();
    String iniFilePath = "/usr/scp/scpdb_agent_unix.ini";
    String outKey = agt.ScpExportKey( iniFilePath, "KEY1", "" );
    params.put("P_SCPKEY", outKey);
    
    try {
      result = getResponseEntity(request, service.getDataSetEntryBT(queryId, params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 출고등록 - 출고등록 마스터/디테일 저장 처리
   *
   * @param request HttpServletRequest
   * @param subDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/save.do", method = RequestMethod.POST)
  public ResponseEntity<String> save(HttpServletRequest request, @RequestParam(Consts.PK_DS_MASTER) String masterDS,
    @RequestParam(Consts.PK_DS_DETAIL) String detailDS, @RequestParam(Consts.PK_DS_SUB) String subDS,
    @RequestParam("P_PROCESS_CD") String process_Cd, @RequestParam("P_PROCESS_STATE_BW") String process_State_BW,
    @RequestParam("P_PROCESS_STATE_FW") String process_State_FW, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // 출고등록 디테일 DataSet Map에 추가
    Map<String, Object> params = getDataSet(detailDS, Consts.PK_DS_DETAIL);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    // 출고등록 마스터 DataSet Map에 추가
    Map<String, Object> masterParams = getParameter(masterDS);
    oMsg = getResultMessage(masterParams);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    // 출고부가정보 마스터(온라인고객) DataSet Map에 추가
    Map<String, Object> subParams = getParameter(subDS);
    oMsg = getResultMessage(subParams);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    params.put(Consts.PK_DS_MASTER, masterParams);
    params.put(Consts.PK_DS_SUB, subParams);
    params.put("P_PROCESS_CD", process_Cd); // A: 예정 -> 등록, B: 등록 -> 수정, N: 신규 등록
    params.put("P_PROCESS_STATE_BW", process_State_BW); // 취소가능 진행상태
    params.put("P_PROCESS_STATE_FW", process_State_FW); // 처리가능 진행상태
    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.save(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 출고확정 저장 처리
   *
   * @param request HttpServletRequest
   * @param subDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/saveConfirms.do", method = RequestMethod.POST)
  public ResponseEntity<String> saveConfirms(HttpServletRequest request,
    @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam(Consts.PK_DS_SUB) String subDS,
    @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // 입고지시 DataSet Map에 추가
    Map<String, Object> params = getDataSet(subDS, Consts.PK_DS_SUB);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    // 진행상태 체크 Key 값 DataSet Map에 추가
    Map<String, Object> masterParams = getParameter(masterDS);
    oMsg = getResultMessage(masterParams);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    params.put(Consts.PK_DS_MASTER, masterParams);
    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.saveConfirms(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 배송완료 저장 처리
   *
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/saveDelivery.do", method = RequestMethod.POST)
  public ResponseEntity<String> saveDelivery(HttpServletRequest request,
    @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.saveDelivery(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 출고등록 (일괄) 저장 처리
   *
   * @param request HttpServletRequest
   * @param subDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/saveEntryBT.do", method = RequestMethod.POST)
  public ResponseEntity<String> saveEntryBT(HttpServletRequest request,
    @RequestParam(Consts.PK_DS_DETAIL) String detailDS, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(detailDS, Consts.PK_DS_DETAIL);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.saveEntryBT(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
  
  /**
   * SP 처리 - 출고 지시확정 처리 체크처리
   * 
   * @param params 조회조건
   */
  @RequestMapping(value = "/callWbProc.do", method = RequestMethod.POST)
  public ResponseEntity<String> callLoCancel(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_ID) String queryId, @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.callWbProc(queryId, params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
  
  /**
   * 지시취소 체크 Update
   * 
   * @param request HttpServletRequest
   * @param queryId 쿼리ID
   * @param queryParams 쿼리 호출 파라메터
   * @return
   */
    
  @SuppressWarnings("rawtypes")
  @RequestMapping(value = "/callUpdate.do", method = RequestMethod.POST)
  public ResponseEntity<String> callUserDelete(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      Map mapResult = service.callUpdate(params);
      result = getResponseEntity(request, mapResult);
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
  
  /**
   * 확정취소 체크 Update
   * 
   * @param request HttpServletRequest
   * @param queryId 쿼리ID
   * @param queryParams 쿼리 호출 파라메터
   * @return
   */
    
  @SuppressWarnings("rawtypes")
  @RequestMapping(value = "/callUpdateD.do", method = RequestMethod.POST)
  public ResponseEntity<String> callUserDeleteD(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      Map mapResult = service.callUpdateD(params);
      result = getResponseEntity(request, mapResult);
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

}
