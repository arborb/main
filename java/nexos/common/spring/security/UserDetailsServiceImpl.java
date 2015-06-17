package nexos.common.spring.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * Class: UserDetailsServiceImpl<br>
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
public class UserDetailsServiceImpl implements UserDetailsService {

  // private final Logger logger = LoggerFactory.getLogger(UserDetailsServiceImpl.class);

  private UserDAO userDAO;

  /**
   * UserDAO를 리턴.
   * 
   * @return
   */
  public UserDAO getUserDAO() {

    return userDAO;
  }

  /**
   * UserDAO 주입
   * 
   * @param dao
   */
  public void setUserDAO(UserDAO userDAO) {

    this.userDAO = userDAO;
  }

  /**
   * 사용자명(id)를 기준으로 로그인처리
   */
  @SuppressWarnings({"rawtypes", "unchecked"})
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
    try {
      // 사용자정보 조회
      List userInfoList = userDAO.getUser(username);
      if (userInfoList == null || userInfoList.size() == 0) {
        throw new UsernameNotFoundException("사용자를 찾을 수 없습니다.");
      }
      Map<String, String> userInfo = (Map)userInfoList.get(0);

      String user_Id = userInfo.get("USER_ID");
      String user_Pwd = userInfo.get("USER_PWD");

      // 현재 시점에서 등록되어 있다는 것은 사용가능하다는 전제
      boolean enabled = true;
      boolean accountNonExpired = true;
      boolean credentialsNonExpired = true;
      boolean accountNonLocked = true;

      // 추후 고려사항으로 Authorities를 DB에 조회해서 가져오는 방식을 뜻하지만 현재 사용하지 않도록 합니다.
      /*
       * Collection<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();
       * List<String> authorityList = userDao.getAuthorities(userEntity.getUserName());
       * Iterator<String> ite = authorityList.iterator();
       * while(ite.hasNext()){
       * authorities.add(new GrantedAuthorityImpl(ite.next()));
       * }
       */
      // 기본 사용자롤인 "ROLE_USER"을 적용
      Collection<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();
      authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

      User user = new User(user_Id, user_Pwd, enabled, accountNonExpired, credentialsNonExpired, accountNonLocked,
        authorities);
      return user;
    } catch (Exception e) {
      throw new UsernameNotFoundException("사용자에 대한 보안 적용시 오류가 발생하였습니다.");
    }
  }
}