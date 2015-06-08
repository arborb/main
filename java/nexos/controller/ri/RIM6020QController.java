package nexos.controller.ri;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.ri.RIM6020QService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Class: 반품확인서 화면 컨트롤러<br>
 * Description: 반품확인서 화면 관리 Controller<br>
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
@RequestMapping("/RIM6020Q")
public class RIM6020QController extends CommonController {

  @Resource
  private RIM6020QService service;

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
     * 내역 조회
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