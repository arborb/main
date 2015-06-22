package nexos.controller.ed;

import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.ed.ED02030EService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Class: 인터페이스 송수신 스케줄링<br>
 * Description: 인터페이스 송수신 스케줄링 Controller<br>
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
@RequestMapping("/ED02030E")
public class ED02030EController extends CommonController {

  @Resource
  private ED02030EService service;

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

  @RequestMapping(value = "/getSchedulerStartedYN.do", method = RequestMethod.POST)
  public ResponseEntity<String> getSchedulerStartedYN(HttpServletRequest request) {

    ResponseEntity<String> result = null;

    try {
      result = getResponseEntity(request, service.getSchedulerStartedYN());
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  @RequestMapping(value = "/startScheduler.do", method = RequestMethod.POST)
  public ResponseEntity<String> startScheduler(HttpServletRequest request,
    @RequestParam(Consts.PK_USER_ID) String userId) {

    ResponseEntity<String> result = null;

    try {
      result = getResponseEntity(request, service.startScheduler(userId));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  @RequestMapping(value = "/stopScheduler.do", method = RequestMethod.POST)
  public ResponseEntity<String> stopScheduler(HttpServletRequest request, @RequestParam(Consts.PK_USER_ID) String userId) {

    ResponseEntity<String> result = null;

    try {
      result = getResponseEntity(request, service.stopScheduler(userId));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
}
