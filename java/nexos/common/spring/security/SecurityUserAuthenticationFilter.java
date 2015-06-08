package nexos.common.spring.security;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import nexos.common.Consts;

import org.apache.commons.httpclient.HttpStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.util.UrlUtils;
import org.springframework.util.Assert;
import org.springframework.web.filter.GenericFilterBean;

import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Class: SecurityUserAuthenticationFilter<br>
 * Description: 스프링 보안 Session 유효성 체크 Class<br>
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
public class SecurityUserAuthenticationFilter extends GenericFilterBean /*implements
  ApplicationListener<SessionDestroyedEvent>*/ {

  private final Logger     logger           = LoggerFactory.getLogger(SecurityUserAuthenticationFilter.class);

  private SessionRegistry  sessionRegistry;
  private String           expiredUrl;
  private LogoutHandler[ ] handlers         = new LogoutHandler[ ] {new SecurityContextLogoutHandler()};
  private RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

  public SecurityUserAuthenticationFilter(SessionRegistry sessionRegistry) {

    this(sessionRegistry, null);
  }

  public SecurityUserAuthenticationFilter(SessionRegistry sessionRegistry, String expiredUrl) {

    this.sessionRegistry = sessionRegistry;
    this.expiredUrl = expiredUrl;
  }

  @Override
  public void afterPropertiesSet() {

    Assert.notNull(sessionRegistry, "SessionRegistry required");
    Assert.isTrue(expiredUrl == null || UrlUtils.isValidRedirectUrl(expiredUrl), expiredUrl
      + " isn't a valid redirect URL");
  }

  public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain) throws IOException, ServletException {

    HttpServletRequest request = (HttpServletRequest)req;
    HttpServletResponse response = (HttpServletResponse)res;

    String url = request.getServletPath().toLowerCase();
    // logger.info("SecurityUserAuthenticationFilter[doFilter] >> " + url);

    // 체크 대상이 아니면
    if (!isIncludeUrl(url) || isExcludeUrl(url)) {
      chain.doFilter(request, response);
      return;
    }

    HttpSession session = request.getSession(false);
    if (session != null) {
      SessionInformation info = sessionRegistry.getSessionInformation(session.getId());

      if (info != null) {
        if (info.isExpired()) {
          // Expired - abort processing
          doLogout(request, response);

          String targetUrl = determineExpiredUrl(request, info);

          if (targetUrl != null) {
            redirectStrategy.sendRedirect(request, response, targetUrl);

            return;
          } else {

            doWriteError(response, Consts.DV_RESULT_CD_ACCESSDENIED);
            return;
          }
        } else {
          // Non-expired - update last request date/time
          sessionRegistry.refreshLastRequest(info.getSessionId());
        }
      }
    } else {
      doWriteError(response, Consts.DV_RESULT_CD_ACCESSDENIED);
      return;
    }

    chain.doFilter(request, response);
  }

  private boolean isIncludeUrl(String url) {

    return url.endsWith(".do");
  }

  private boolean isExcludeUrl(String url) {

    return url.contains("login") || url.contains("logout");
  }

  private void doWriteError(HttpServletResponse response, int errorCode) throws IOException {

    String result = null;
    Map<String, Object> resultMap = new HashMap<String, Object>();

    if (errorCode == Consts.DV_RESULT_CD_INVALIDSESSION) {
      resultMap.put(Consts.DK_RESULT_CD, Consts.DV_RESULT_CD_INVALIDSESSION);
      resultMap.put(Consts.DK_RESULT_TYPE, Consts.DV_RESULT_TYPE_STR);
      resultMap.put(Consts.DK_RESULT_DATA, "중복 로그인으로 세션 정보가 변경되어 해당 페이지에서는 더이상 작업할 수 없습니다.\n\n현재 페이지를 닫습니다.[F]");
    } else if (errorCode == Consts.DV_RESULT_CD_ACCESSDENIED) {
      resultMap.put(Consts.DK_RESULT_CD, Consts.DV_RESULT_CD_ACCESSDENIED);
      resultMap.put(Consts.DK_RESULT_TYPE, Consts.DV_RESULT_TYPE_STR);
      resultMap.put(Consts.DK_RESULT_DATA, "세션이 만료되었습니다. 다시 로그인 하십시오.");
    } else {
      resultMap.put(Consts.DK_RESULT_CD, Consts.DV_RESULT_CD_ERROR);
      resultMap.put(Consts.DK_RESULT_TYPE, Consts.DV_RESULT_TYPE_STR);
      resultMap.put(Consts.DK_RESULT_DATA, "정의되지 않은 오류입니다. 다시 처리 하십시오.");
    }

    ObjectMapper mapper = new ObjectMapper();
    try {
      result = mapper.writeValueAsString(resultMap);
    } catch (Exception e) {
      result = "{\"RESULT_CD\":1,\"RESULT_DATA\":\"정의되지 않은 오류입니다. 다시 처리 하십시오.\",\"RESULT_TYPE\":\"S\"}";
    }

    response.setStatus(HttpStatus.SC_INTERNAL_SERVER_ERROR);
    response.setContentType(MediaType.TEXT_HTML_VALUE);
    response.setCharacterEncoding(Consts.CHARSET);

    response.getWriter().print(result);
    response.flushBuffer();
  }

  protected String determineExpiredUrl(HttpServletRequest request, SessionInformation info) {

    return expiredUrl;
  }

  private void doLogout(HttpServletRequest request, HttpServletResponse response) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();

    for (LogoutHandler handler : handlers) {
      handler.logout(request, response, auth);
    }
  }

  public void setLogoutHandlers(LogoutHandler[ ] handlers) {

    Assert.notNull(handlers);
    this.handlers = handlers;
  }

  public void setRedirectStrategy(RedirectStrategy redirectStrategy) {

    this.redirectStrategy = redirectStrategy;
  }

//  @Override
//  public void onApplicationEvent(SessionDestroyedEvent event) {
//
//    List<SecurityContext> contexts = event.getSecurityContexts();
//    if (!contexts.isEmpty()) {
//      for (SecurityContext ctx : contexts) {
//        SecurityUserAuthenticationToken securityUserToken = (SecurityUserAuthenticationToken)ctx.getAuthentication()
//          .getPrincipal();
//        logger.info("SecurityUserAuthenticationFilter[onSessionDestroyedEvent] USER, SESSION : "
//          + securityUserToken.getUsername() + ", " + event.getId());
//      }
//    }
//  }

}
