package nexos.common.spring.security;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.dao.DataAccessException;
import org.springframework.orm.ibatis.SqlMapClientTemplate;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * Class: SecurityUserDetailsService<br>
 * Description: 스프링 보안 Authentication Manager에서 사용할 UserDetailsService의 구현 Class<br>
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
public class SecurityUserDetailsService implements UserDetailsService {

  // private final Logger logger = LoggerFactory.getLogger(SecurityUserDetailsService.class);

  private SqlMapClientTemplate sqlMapClientTemplate;

  public SqlMapClientTemplate getSqlMapClientTemplate() {

    return sqlMapClientTemplate;
  }

  public void setSqlMapClientTemplate(SqlMapClientTemplate sqlMapClientTemplate) {

    this.sqlMapClientTemplate = sqlMapClientTemplate;
  }

  /**
   * 사용자 정보 조회
   * 
   * @param user_Id 사용자 ID
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  public List getUserInfo(String user_Id) throws DataAccessException {

    Map<String, Object> callParams = new HashMap<String, Object>();
    callParams.put("P_USER_ID", user_Id);

    return sqlMapClientTemplate.queryForList("WC.GET_LOGIN", callParams);
  }

  /**
   * 사용자ID를 기준으로 로그인 처리
   */
  @SuppressWarnings({"rawtypes", "unchecked"})
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

    List userInfoList = null;
    // 사용자정보 조회
    try {
      userInfoList = getUserInfo(username);
    } catch (DataAccessException e) {
      throw new UsernameNotFoundException("사용자 정보를 확인할 수 없습니다.");
    }
    if (userInfoList == null || userInfoList.size() == 0) {
      throw new UsernameNotFoundException("등록되어 있지 않은 사용자입니다.");
    }
    Map<String, Object> userInfo = (Map<String, Object>)userInfoList.get(0);

    SecurityUserAuthenticationToken securityUserToken = new SecurityUserAuthenticationToken();
    securityUserToken.setUsername((String)userInfo.get("USER_ID"));
    securityUserToken.setPassword((String)userInfo.get("USER_PWD"));

    return securityUserToken;
  }

}