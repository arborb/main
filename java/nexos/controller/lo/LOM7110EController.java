package nexos.controller.lo;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.lo.LOM7110EService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Class: 온라인출고대물검수 컨트롤러<br>
 * Description: 온라인출고대물검수 Controller<br>
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
@RequestMapping("/LOM7110E")
public class LOM7110EController extends CommonController {

  @Resource
  private LOM7110EService service;
  
  /**
   * 피킹검수 - 용기삭제
   *
   * @param request HttpServletRequest
   * @param subDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/callBoxDelete.do", method = RequestMethod.POST)
  public ResponseEntity<String> callBoxDelete(HttpServletRequest request,
      @RequestParam(Consts.PK_DS_MASTER) String masterDS) {
    
    ResponseEntity<String> result = null;
    
    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    
    try {
      result = getResponseEntity(request, service.callBoxDelete(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }
    
    return result;
  }

  /**
   * 피킹검수 - 검수취소
   *
   * @param request HttpServletRequest
   * @param subDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/callBWScanConfirm.do", method = RequestMethod.POST)
  public ResponseEntity<String> callBWScanConfirm(HttpServletRequest request,
    @RequestParam(Consts.PK_DS_MASTER) String masterDS) {

    ResponseEntity<String> result = null;

    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    
    try {
      result = getResponseEntity(request, service.callBWScanConfirm(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 피킹검수 - 검수완료
   *
   * @param request HttpServletRequest
   * @param subDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @SuppressWarnings("rawtypes")
  @RequestMapping(value = "/callFWScanConfirm.do", method = RequestMethod.POST)
  public ResponseEntity<String> callFWScanConfirm(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      Map mapResult = service.callFWScanConfirm(params);
      result = getResponseEntity(request, mapResult);
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * SP 호출 - 조회
   *
   * @param request HttpServletRequest
   * @param queryId 쿼리ID
   * @param queryParams 상품바코드
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

}
