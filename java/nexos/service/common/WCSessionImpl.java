package nexos.service.common;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Class: WCSessionImpl<br>
 * Description: Spring 보안 승인 및 사용자 정보 매핑<br>
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
@Repository("WCSESSION")
public class WCSessionImpl implements WCSession {

  private final Logger logger = LoggerFactory.getLogger(WCSessionImpl.class);

  @SuppressWarnings("rawtypes")
  @Override
  @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
  public void setUserAuthentication(ApplicationContext appContext, Map userInfo) {

    try {
      boolean isNewAuthentication = true;
      String username = (String)userInfo.get("USER_ID");
      String password = (String)userInfo.get("USER_PWD");

      Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      if (authentication != null && !(authentication instanceof AnonymousAuthenticationToken)) {
        if (authentication.getName().equals(username)) {
          isNewAuthentication = false;
        }
      }
      if (isNewAuthentication) {
        AuthenticationManager manager = (AuthenticationManager)appContext.getBean("authenticationManager");
        UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken = new UsernamePasswordAuthenticationToken(
          username, password);
        authentication = manager.authenticate(usernamePasswordAuthenticationToken);
        // 초기화 후 지정
        SecurityContextHolder.clearContext();
        SecurityContextHolder.getContext().setAuthentication(authentication);
      }
      // logger.info("Authentication User = " + authentication.getName() + (isNewAuthentication ? "" :
      // ", 이미 보안 승인되어 있음"));
      // logger.info("Authentications     = " + authentication.getAuthorities());
    } catch (Exception e) {
      logger.error(e.getMessage());
      throw new RuntimeException("보안 승인중 오류가 발생하였습니다.");
    }
  }

  @Override
  @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
  public void removeUserAuthentication() {

    try {
      // Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
      // if (authentication != null) {
      // logger.info("Unauthentication Name = " + authentication.getName());
      // }
      SecurityContextHolder.clearContext();
    } catch (Exception e) {
      logger.error(e.getMessage());
      throw new RuntimeException(e.getMessage());
    }
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  @Override
  public Map mappingSession(WCDAO wcdao, Map userInfo) {

    Map result = null;

    final String PK_USER_ID = "USER_ID";
    final String PK_CLIENT_IP = "CLIENT_IP";

    String user_Id = (String)userInfo.get(PK_USER_ID);

    // CLIENT IP
    ServletRequestAttributes requestAttrib = (ServletRequestAttributes)RequestContextHolder.currentRequestAttributes();
    HttpServletRequest request = requestAttrib.getRequest();

    String remoteAddr;
    if (request != null) {
      remoteAddr = request.getRemoteAddr();
    } else {
      remoteAddr = "localhost";
    }

    // 자동출력 프린터 정보 읽기
    List userSysInfoList = wcdao.getCSUserSysInfo(user_Id, remoteAddr);
    Map<String, String> userSysInfo = null;
    if ((userSysInfoList != null) && (userSysInfoList.size() > 0)) {
      userSysInfo = (HashMap)userSysInfoList.get(0);
    } else {
      userSysInfo = new HashMap<String, String>();
      userSysInfo.put(PK_CLIENT_IP, remoteAddr);
    }

    result = new HashMap<String, String>();
    result.putAll(userInfo);
    if (userSysInfo != null) {
      result.putAll(userSysInfo);
    }

    return result;
  }
}
