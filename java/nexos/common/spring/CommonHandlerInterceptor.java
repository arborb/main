package nexos.common.spring;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Enumeration;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import nexos.common.Consts;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.LocalVariableTableParameterNameDiscoverer;
import org.springframework.core.MethodParameter;
import org.springframework.core.ParameterNameDiscoverer;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

/**
 * Class: CommonHandlerInterceptor<br>
 * Description: Controller Log 기록을 위한 HandlerInterceptor Class<br>
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
public class CommonHandlerInterceptor implements HandlerInterceptor {

  private final Logger                  logger         = LoggerFactory.getLogger(CommonHandlerInterceptor.class);
  private final ParameterNameDiscoverer nameDiscoverer = new LocalVariableTableParameterNameDiscoverer();
  private final String                  LOG_PREFIX     = Consts.CRLF + "  ";

  /**
   * 뷰를 통해서 클라이언트에 응답을 전송한 뒤에 실행
   * Controller나 View에 오류가 발생해도 실행
   */
  @Override
  public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
    Exception exception) throws Exception {
    long preTime = ((Number)request.getAttribute("__REQUEST_PRE_TIME")).longValue();
    long postTime = ((Number)request.getAttribute("__REQUEST_POST_TIME")).longValue();
    String lastStatus = (String)request.getAttribute("__RESPONSE_STATUS");
    long endTime = System.currentTimeMillis();

    request.removeAttribute("__REQUEST_PRE_TIME");
    request.removeAttribute("__REQUEST_POST_TIME");
    logger
      .info(getCallLog(request, response, (HandlerMethod)handler, preTime, postTime, endTime, lastStatus, exception));
  }

  /**
   * Controller 가 요청을 처리한 뒤에 호출 됨
   * Controller 실행도중 예외가 발생하면 이 메서드는 실행
   */
  @Override
  public void postHandle(HttpServletRequest request, HttpServletResponse response, Object handler,
    ModelAndView modelAndView) throws Exception {

    long time = System.currentTimeMillis();
    request.setAttribute("__REQUEST_POST_TIME", time);
  }

  /**
   * Controller 가 호출되기 전에 실행
   * return false일 경우 Controller로 다음 처리를 넘기지 않고 종료처리
   */
  @Override
  public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {

    long time = System.currentTimeMillis();
    request.setAttribute("__REQUEST_PRE_TIME", time);

    return true;
  }

  /**
   * 로그 기록을 위한 문자열 리턴
   * 
   * @param request
   * @param response
   * @param handlerMethod
   * @param preTime
   * @param postTime
   * @param endTime
   * @param exception
   * @return
   */
  @SuppressWarnings("rawtypes")
  private String getCallLog(HttpServletRequest request, HttpServletResponse response, HandlerMethod handlerMethod,
    long preTime, long postTime, long endTime, String lastStatus, Exception exception) {

    SimpleDateFormat sdfDATETIME = new SimpleDateFormat(Consts.DATETIME_FORMAT);
    StringBuilder sbLog = new StringBuilder();
    sbLog.append("CLIENT REQUEST LOG");
    sbLog.append(LOG_PREFIX).append("CLIENT IP   : ").append(request.getRemoteAddr());
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication != null) {
      sbLog.append(LOG_PREFIX).append("USER ID     : ").append(authentication.getName());
    }
    sbLog.append(LOG_PREFIX).append("SESSION ID  : ").append(request.getRequestedSessionId());
    sbLog.append(LOG_PREFIX).append("CONTROLLER  : ").append(handlerMethod.getBeanType().getSimpleName());
    if (logger.isDebugEnabled()) {
      sbLog.append(LOG_PREFIX).append("METHOD      : ");
      sbLog.append(handlerMethod.getMethod().getReturnType().getSimpleName()).append(" ");
      sbLog.append(handlerMethod.getMethod().getName()).append("(");
      int lastParamIndex = handlerMethod.getMethodParameters().length - 1;
      for (MethodParameter param : handlerMethod.getMethodParameters()) {
        param.initParameterNameDiscovery(nameDiscoverer);
        sbLog.append(param.getParameterType().getSimpleName()).append(" ");
        sbLog.append(param.getParameterName());
        if (param.getParameterIndex() < lastParamIndex) {
          sbLog.append(", ");
        }
      }

      sbLog.append(")").append(LOG_PREFIX).append("PARAMETERS  : ");
      Enumeration params = request.getParameterNames();
      if (params.hasMoreElements()) {
        while (params.hasMoreElements()) {
          String param = (String)params.nextElement();
          sbLog.append(Consts.CRLF + "                ").append(String.format("%-20s : ", param))
            .append(request.getParameter(param));
        }
      } else {
        sbLog.append("( None )");
      }

      sbLog.append(LOG_PREFIX).append("TIME        : PRE (").append(sdfDATETIME.format(new Date(preTime)));
      sbLog.append("), POST (").append(sdfDATETIME.format(new Date(postTime)));
      sbLog.append(String.format(", %.2f", (postTime - preTime) / 1000f));
      sbLog.append("), AFTER (").append(sdfDATETIME.format(new Date(endTime)));
      sbLog.append(String.format(", %.2f", (endTime - preTime) / 1000f)).append(")");
    } else {
      sbLog.append(LOG_PREFIX).append("METHOD      : ").append(handlerMethod.getMethod().getName());
      sbLog.append(LOG_PREFIX).append("TIME        : POST (");
      sbLog.append(String.format("%.2f", (postTime - preTime) / 1000f));
      sbLog.append("), AFTER (").append(String.format("%.2f", (endTime - preTime) / 1000f)).append(")");
    }
    if (lastStatus == null || "".equals(lastStatus)) {
      lastStatus = "null";
    }
    sbLog.append(LOG_PREFIX).append("STATUS      : ").append(lastStatus);
    /*
     * if (exception != null) {
     * sbLog.append(LOG_PREFIX).append("ERROR       : ")
     * .append(Util.getNull(exception.getMessage(), "Null Pointer Exception"));
     * }
     */

    return sbLog.append(Consts.CRLF).toString();
  }
}
