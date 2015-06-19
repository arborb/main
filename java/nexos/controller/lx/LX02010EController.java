package nexos.controller.lx;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.lx.LX02010EService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Class: Cross-Dock작업 컨트롤러<br>
 * Description: Cross-Dock작업 Controller<br>
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
@RequestMapping("/LX02010E")
public class LX02010EController extends CommonController {

  @Resource
  private LX02010EService service;

  /**
   * Cross-Dock 단계진행 처리
   * 
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @param process_Cd 프로세스 코드
   * @param direction 등록 or 취소
   * @param process_State_FW 등록 가능 진행상태
   * @param process_State_BW 취소 가능 진행상태
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/callLXProcessing.do", method = RequestMethod.POST)
  public ResponseEntity<String> callLXProcessing(HttpServletRequest request,
    @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam("P_PROCESS_CD") String process_Cd,
    @RequestParam("P_DIRECTION") String direction, @RequestParam("P_PROCESS_STATE_BW") String process_State_BW,
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
    params.put("P_PROCESS_STATE_BW", process_State_BW); // 취소가능 진행상태
    params.put("P_PROCESS_STATE_FW", process_State_FW); // 처리가능 진행상태
    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.callLXProcessing(params));
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

    try {
      result = getResponseEntity(request, service.getDataSet(queryId, params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 각 프로세스 별 저장 처리
   * 
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @param process_Cd 프로세스 코드
   * @param process_State_FW 등록 가능 진행상태
   * @param process_State_BW 취소 가능 진행상태
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/save.do", method = RequestMethod.POST)
  public ResponseEntity<String> save(HttpServletRequest request, @RequestParam(Consts.PK_DS_MASTER) String masterDS,
    @RequestParam("P_PROCESS_CD") String process_Cd, @RequestParam("P_PROCESS_STATE_BW") String process_State_BW,
    @RequestParam("P_PROCESS_STATE_FW") String process_State_FW, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // 마스터 DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    params.put("P_PROCESS_CD", process_Cd); // A: 예정 -> 등록, B: 등록 -> 수정
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
   * 예정의 등록수량 수정후 등록처리
   * 
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @param detailDS DataSet
   * @param process_Cd 프로세스 코드
   * @param process_State_FW 등록 가능 진행상태
   * @param process_State_BW 취소 가능 진행상태
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/saveEntry.do", method = RequestMethod.POST)
  public ResponseEntity<String> saveEntry(HttpServletRequest request,
    @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam(Consts.PK_DS_DETAIL) String detailDS,
    @RequestParam("P_PROCESS_CD") String process_Cd, @RequestParam("P_PROCESS_STATE_BW") String process_State_BW,
    @RequestParam("P_PROCESS_STATE_FW") String process_State_FW, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // 디테일 DataSet Map에 추가
    Map<String, Object> params = getDataSet(detailDS, Consts.PK_DS_DETAIL);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    // 마스터 DataSet Map에 추가
    Map<String, Object> masterParams = getParameter(masterDS);
    oMsg = getResultMessage(masterParams);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    params.put(Consts.PK_DS_MASTER, masterParams);
    params.put("P_PROCESS_CD", process_Cd); // A: 예정 -> 등록, B: 등록 -> 수정
    params.put("P_PROCESS_STATE_BW", process_State_BW); // 취소가능 진행상태
    params.put("P_PROCESS_STATE_FW", process_State_FW); // 처리가능 진행상태
    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.saveEntry(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
}
