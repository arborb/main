package nexos.controller.lo;

import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.lo.LOM6010QService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Class: 적재팔레트출력및내역 컨트롤러<br>
 * Description: 적재팔레트출력및내역 Controller<br>
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
@RequestMapping("/LOM6010Q")
public class LOM6010QController extends CommonController {

  @Resource
  private LOM6010QService service;

  /**
   * 복수의 CMSHIPID 채번
   * 
   * @param request HttpServletRequest
   * @param queryParams
   * @return
   */
  @SuppressWarnings("rawtypes")
  @RequestMapping(value = "/callShipIdGetNo.do", method = RequestMethod.POST)
  public ResponseEntity<String> callShipIdGetNo(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      Map mapResult = service.callShipIdGetNo(params);
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
   * 적재팔레트발행 출력체크 저장 처리
   * 
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/save.do", method = RequestMethod.POST)
  public ResponseEntity<String> save(HttpServletRequest request, @RequestParam(Consts.PK_DS_MASTER) String saveDS,
    @RequestParam(Consts.PK_REG_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // masterDS 그리드를 DataSet Map에 추가
    Map<String, Object> params = getDataSet(saveDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    params.put(Consts.PK_REG_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.save(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
}
