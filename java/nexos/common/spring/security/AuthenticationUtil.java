package nexos.common.spring.security;

import java.util.Collection;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.AuthorityUtils;
import org.springframework.security.core.context.SecurityContextHolder;

public class AuthenticationUtil {

  private AuthenticationUtil() {
  }

  public static void clearAuthentication() {

    SecurityContextHolder.getContext().setAuthentication(null);
    SecurityContextHolder.clearContext();
  }

  public static void configureAuthentication() {

    String role = "ROLE_USER";
    Collection<GrantedAuthority> authorities = AuthorityUtils.createAuthorityList(role);
    Authentication authentication = new UsernamePasswordAuthenticationToken("EDI", role, authorities);
    SecurityContextHolder.getContext().setAuthentication(authentication);
  }
}
