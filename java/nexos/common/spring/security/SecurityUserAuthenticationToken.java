package nexos.common.spring.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

/**
 * Class: SecurityUserAuthenticationToken<br>
 * Description: 스프링 보안 처리시 사용하는 사용자 정보<br>
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
public class SecurityUserAuthenticationToken implements UserDetails {

  private static final long   serialVersionUID = -6586553218075108244L;
  private String              username         = null;
  private String              password         = null;
  private Map<String, Object> userInfo         = null;

  public SecurityUserAuthenticationToken() {

    this.userInfo = new HashMap<String, Object>();
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {

    List<GrantedAuthority> authorities = new ArrayList<GrantedAuthority>();
    authorities.add(new SimpleGrantedAuthority("ROLE_USER"));

    return authorities;
  }

  @Override
  public String getUsername() {

    return username;
  }

  public void setUsername(String username) {

    this.username = username;
  }

  @Override
  public String getPassword() {

    return password;
  }

  public void setPassword(String password) {

    this.password = password;
  }

  @SuppressWarnings("rawtypes")
  public Map getUserInfo() {

    return userInfo;
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  public void setUserInfo(Map userInfo) {

    this.userInfo.clear();
    if (userInfo != null) {
      this.userInfo.putAll(userInfo);
    }
  }

  @Override
  public boolean isAccountNonExpired() {

    return true;
  }

  @Override
  public boolean isAccountNonLocked() {

    return true;
  }

  @Override
  public boolean isCredentialsNonExpired() {

    return true;
  }

  @Override
  public boolean isEnabled() {

    return true;
  }

  @Override
  public int hashCode() {

    final int prime = 31;
    int result = 1;
    result = prime * result + ((getUsername() == null) ? 0 : getUsername().hashCode());
    return result;
  }

  @Override
  public boolean equals(Object obj) {

    if (this == obj) {
      return true;
    }

    if (obj == null) {
      return false;
    }

    if (getClass() != obj.getClass()) {
      return false;
    }

    SecurityUserAuthenticationToken other = (SecurityUserAuthenticationToken)obj;
    if (getUsername() == null) {
      if (other.getUsername() != null) {
        return false;
      }
    }
    if (!getUsername().equals(other.getUsername())) {
      return false;
    }

    return true;
  }
}
