package nexos.service.common;

import java.util.Map;

import org.springframework.context.ApplicationContext;

public interface WCSession {

  /**
   * 스프링보안처리하기
   * 
   * @param username 아이디
   * @param password 암호
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  void setUserAuthentication(ApplicationContext appContext, Map userInfo);

  /**
   * 스프링 보안해지하기
   * 
   * @throws Exception
   */
  void removeUserAuthentication();

  /**
   * Session 세팅
   * 
   * @param list
   */
  @SuppressWarnings("rawtypes")
  Map mappingSession(WCDAO wcdao, Map userInfo);

}