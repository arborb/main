package nexos.controller.ri;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.ri.RI02010EService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Class: 반입작업 컨트롤러<br>
 * Description: 반입작업 관리 Controller<br>
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
@RequestMapping("/RI02010E")
public class RI02010EController extends CommonController {

  @Resource
  private RI02010EService service;

  /**
   * 데이터 조회
   * @param request     HttpServletRequest
   * @param queryId     쿼리ID
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

    try {
      result = getResponseEntity(request, service.getDataSet(queryId, params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

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
   * 반입등록 - 반입등록 마스터/디테일 저장 처리
   * @param request   HttpServletRequest
   * @param subDS  DataSet
   * @param user_Id   사용자ID
   * @return
   */
  @RequestMapping(value = "/save.do", method = RequestMethod.POST)
  public ResponseEntity<String> save(HttpServletRequest request, @RequestParam(Consts.PK_DS_MASTER) String masterDS,
      @RequestParam(Consts.PK_DS_DETAIL) String detailDS, @RequestParam("P_PROCESS_CD") String process_Cd,
      @RequestParam("P_PROCESS_STATE_BW") String process_State_BW,
      @RequestParam("P_PROCESS_STATE_FW") String process_State_FW, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // 반입등록 디테일 DataSet Map에 추가
    Map<String, Object> params = getDataSet(detailDS, Consts.PK_DS_DETAIL);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    // 반입등록 마스터 DataSet Map에 추가
    Map<String, Object> masterParams = getParameter(masterDS);
    oMsg = getResultMessage(masterParams);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    params.put(Consts.PK_DS_MASTER, masterParams);
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
   * 반입지시 - 반입지시 저장 처리
   * @param request   HttpServletRequest
   * @param subDS  DataSet
   * @param user_Id   사용자ID
   * @return
   */
  @RequestMapping(value = "/saveDirectionsLocId.do", method = RequestMethod.POST)
  public ResponseEntity<String> saveDirectionsLocId(HttpServletRequest request,
      @RequestParam(Consts.PK_DS_SUB) String subDS, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // 반입지시 DataSet Map에 추가
    Map<String, Object> params = getDataSet(subDS, Consts.PK_DS_SUB);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.saveDirectionsLocId(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 반입확정/적치 - 반입지시 저장 처리
   * @param request   HttpServletRequest
   * @param subDS  DataSet
   * @param user_Id   사용자ID
   * @return
   */
  @RequestMapping(value = "/saveDirections.do", method = RequestMethod.POST)
  public ResponseEntity<String> saveDirections(HttpServletRequest request,
      @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam(Consts.PK_DS_SUB) String subDS,
      @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // 반입지시 DataSet Map에 추가
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
      result = getResponseEntity(request, service.saveDirections(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 반입확정 - 저장 처리
   * @param request   HttpServletRequest
   * @param subDS  DataSet
   * @param user_Id   사용자ID
   * @return
   */
  @RequestMapping(value = "/callRIProcessing.do", method = RequestMethod.POST)
  public ResponseEntity<String> callRIProcessing(HttpServletRequest request,
      @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam("P_PROCESS_CD") String process_Cd,
      @RequestParam("P_PROCESS_STATE_BW") String process_State_BW,
      @RequestParam("P_PROCESS_STATE_FW") String process_State_FW, @RequestParam("P_DIRECTION") String direction,
      @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    params.put("P_PROCESS_CD", process_Cd);
    params.put("P_PROCESS_STATE_BW", process_State_BW); // 취소가능 진행상태
    params.put("P_PROCESS_STATE_FW", process_State_FW); // 처리가능 진행상태
    params.put("P_DIRECTION", direction);
    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.callRIProcessing(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * RI_FW_ENTRY_PROCESSING 호출
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @param process_Cd 프로세스 코드
   * @param direction 처리 진행방향
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/callRIEntryProcessing.do", method = RequestMethod.POST)
  public ResponseEntity<String> callRIEntryProcessing(HttpServletRequest request,
      @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam("P_PROCESS_CD") String process_Cd,
      @RequestParam("P_PROCESS_STATE_BW") String process_State_BW,
      @RequestParam("P_PROCESS_STATE_FW") String process_State_FW, @RequestParam("P_DIRECTION") String direction,
      @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    params.put("P_PROCESS_CD", process_Cd);
    params.put("P_PROCESS_STATE_BW", process_State_BW); // 취소가능 진행상태
    params.put("P_PROCESS_STATE_FW", process_State_FW); // 처리가능 진행상태
    params.put("P_DIRECTION", direction);
    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.callRIEntryProcessing(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
}