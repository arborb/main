package nexos.controller.lc;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.lc.LC03010EService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Class: 로케이션이동 컨트롤러<br>
 * Description: 로케이션이동 관리 Controller<br>
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
@RequestMapping("/LC03010E")
public class LC03010EController extends CommonController {

  @Resource
  private LC03010EService service;

  /**
   * 데이터 조회
   * @param request            HttpServletRequest
   * @param queryId            쿼리ID
   * @param queryParams        쿼리 호출 파라메터
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

    try {
      result = getResponseEntity(request, service.getDataSet(queryId, params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 저장 처리
   * @param request
   * @param masterDS
   * @param subDS
   * @param process_Cd
   * @param user_Id
   * @return
   */
  @RequestMapping(value = "/save.do", method = RequestMethod.POST)
  public ResponseEntity<String> save(HttpServletRequest request, @RequestParam(Consts.PK_DS_MASTER) String masterDS,
      @RequestParam(Consts.PK_DS_SUB) String subDS, @RequestParam("P_PROCESS_CD") String process_Cd,
      @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // 로케이션이동 디테일 내역 DataSet Map에 추가
    Map<String, Object> params = getDataSet(subDS, Consts.PK_DS_SUB);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    // 로케이션이동 마스터 DataSet Map에 추가
    Map<String, Object> masterParams = getParameter(masterDS);
    oMsg = getResultMessage(masterParams);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    params.put(Consts.PK_DS_MASTER, masterParams);
    params.put(Consts.PK_USER_ID, user_Id);
    params.put("P_PROCESS_CD", process_Cd); // 수정추가

    try {
      result = getResponseEntity(request, service.save(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  @RequestMapping(value = "/getConfirmYn.do", method = RequestMethod.POST)
  public ResponseEntity<String> getConfirmYn(HttpServletRequest request,
      @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    final String PROCEDURE_ID = "WF.GET_LC_CONFIRM_YN";

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.callSP(PROCEDURE_ID, params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * SP호출하여 데이터 취득
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

  @RequestMapping(value = "/callLcBwMoveEntry.do", method = RequestMethod.POST)
  public ResponseEntity<String> callLcBwMoveEntry(HttpServletRequest request,
      @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    try {
      result = getResponseEntity(request, service.callLcBwMoveEntry(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  @RequestMapping(value = "/callLcMoveConfirm.do", method = RequestMethod.POST)
  public ResponseEntity<String> callLcMoveConfirm(HttpServletRequest request,
      @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.callLcMoveConfirm(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  @RequestMapping(value = "/callLcFWFillupEmergencyEntry.do", method = RequestMethod.POST)
  public ResponseEntity<String> callLcFWFillupEmergencyEntry(HttpServletRequest request,
      @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    try {
      result = getResponseEntity(request, service.callLcFWFillupEmergencyEntry(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  @RequestMapping(value = "/callLcFWFillupSafetyEntry.do", method = RequestMethod.POST)
  public ResponseEntity<String> callLcFWFillupSafetyEntry(HttpServletRequest request,
      @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    try {
      result = getResponseEntity(request, service.callLcFWFillupSafetyEntry(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  @RequestMapping(value = "/getMoveoutwaitqty.do", method = RequestMethod.POST)
  public ResponseEntity<String> getMoveoutwaitqty(HttpServletRequest request,
      @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    final String PROCEDURE_ID = "WF.GET_MOVE_OUTWAIT_QTY";

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.callSP(PROCEDURE_ID, params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 저장 처리
   * @param request
   * @param masterDS
   * @param subDS
   * @param process_Cd
   * @param user_Id
   * @return
   */
  @RequestMapping(value = "/save1.do", method = RequestMethod.POST)
  public ResponseEntity<String> save1(HttpServletRequest request, @RequestParam(Consts.PK_DS_MASTER) String masterDS,
      @RequestParam(Consts.PK_DS_SUB) String subDS, @RequestParam("P_PROCESS_CD") String process_Cd,
      @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // 로케이션이동 디테일 내역 DataSet Map에 추가
    Map<String, Object> params = getDataSet(subDS, Consts.PK_DS_SUB);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    // 로케이션이동 마스터 DataSet Map에 추가
    Map<String, Object> masterParams = getParameter(masterDS);
    oMsg = getResultMessage(masterParams);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    params.put(Consts.PK_DS_MASTER, masterParams);
    params.put(Consts.PK_USER_ID, user_Id);
    params.put("P_PROCESS_CD", process_Cd); // 수정추가

    try {
      result = getResponseEntity(request, service.save1(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
  
  @RequestMapping(value = "/callStock_Move.do", method = RequestMethod.POST)
  public ResponseEntity<String> callStock_Move(HttpServletRequest request,
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
      result = getResponseEntity(request, service.callStock_Move(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
}

}
