package nexos.controller.lo;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.lo.LOM9090EService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Class: 재고실사 컨트롤러<br>
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
@RequestMapping("/LOM9090E")
public class LOM9090EController extends CommonController {

  @Resource
  private LOM9090EService service;

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
    @RequestParam(Consts.PK_DS_DETAIL) String detailDS, @RequestParam("P_PROCESS_CD") String P_PROCESS_CD,
    @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // 재고실사등록 디테일 DataSet Map에 추가
    Map<String, Object> params = getDataSet(detailDS, Consts.PK_DS_DETAIL);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    // 재고실사등록 마스터 DataSet Map에 추가
    Map<String, Object> masterParams = getParameter(masterDS);
    oMsg = getResultMessage(masterParams);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    params.put(Consts.PK_DS_MASTER, masterParams);
    params.put(Consts.PK_USER_ID, user_Id);
    params.put("P_PROCESS_CD", P_PROCESS_CD);

    try {
      result = getResponseEntity(request, service.save(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 삭제 처리
   * @param request     HttpServletRequest
   * @param masterDS    DataSet
   * @param user_Id     사용자ID
   * @return
   */
  @RequestMapping(value = "/delete.do", method = RequestMethod.POST)
  public ResponseEntity<String> delete(HttpServletRequest request, @RequestParam(Consts.PK_DS_MASTER) String masterDS) {

    ResponseEntity<String> result = null;

    // 재고실사 등록 디테일 DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.delete(params));
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

  @RequestMapping(value = "/callLcInvestConfirmBWFW.do", method = RequestMethod.POST)
  public ResponseEntity<String> callLcInvestConfirmBWFW(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_ID) String queryId, @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.callLcInvestConfirmBWFW(queryId, params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  @RequestMapping(value = "/callLcFwInvestReplectConfirm.do", method = RequestMethod.POST)
  public ResponseEntity<String> callLcFwInvestReplectConfirm(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.callLcFwInvestReplectConfirm(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
  @RequestMapping(value = "/callEsStErpCreation.do", method = RequestMethod.POST)
  public ResponseEntity<String> callEsStErpCreation(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {
    
    ResponseEntity<String> result = null;
    
    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    
    try {
      result = getResponseEntity(request, service.callEsStErpCreation(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }
    
    return result;
  }
  
  /**
   * 재고속성변경 처리
   * @param request   HttpServletRequest
   * @param subDS  DataSet
   * @param user_Id   사용자ID
   * @return
   */
  @RequestMapping(value = "/callLineproc.do", method = RequestMethod.POST)
  public ResponseEntity<String> callLineproc(HttpServletRequest request,
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
      result = getResponseEntity(request, service.callLineproc(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
  
  /**
   * 재고속성변경 처리
   * @param request   HttpServletRequest
   * @param subDS  DataSet
   * @param user_Id   사용자ID
   * @return
   */
  @RequestMapping(value = "/callExitproc.do", method = RequestMethod.POST)
  public ResponseEntity<String> callExitproc(HttpServletRequest request,
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
      result = getResponseEntity(request, service.callExitproc(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
  
  /**
   * 재고속성변경 처리
   * @param request   HttpServletRequest
   * @param subDS  DataSet
   * @param user_Id   사용자ID
   * @return
   */
  @RequestMapping(value = "/callPorpertiesUpdate.do", method = RequestMethod.POST)
  public ResponseEntity<String> callPorpertiesUpdate(HttpServletRequest request,
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
      result = getResponseEntity(request, service.callPorpertiesUpdate(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
  

}
