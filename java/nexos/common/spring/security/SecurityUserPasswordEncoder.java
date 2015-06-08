package nexos.common.spring.security;

import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Class: SecurityUserPasswordEncoder<br>
 * Description: 스프링 보안 처리시 사용하는 사용자 비밀번호 Encoder<br>
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
public class SecurityUserPasswordEncoder implements PasswordEncoder {

  private CommonEncryptor commonEncryptor;

  public CommonEncryptor getCommonEncryptor() {

    return commonEncryptor;
  }

  public void setCommonEncryptor(CommonEncryptor commonEncryptor) {

    this.commonEncryptor = commonEncryptor;
  }

  @Override
  public String encode(CharSequence rawPassword) {

    if (rawPassword == null) {
      throw new NullPointerException();
    }

    String result = rawPassword.toString();
    try {
      result = "ENC(" + commonEncryptor.encryptHASH(result) + ")";
    } catch (Exception e) {
    }

    return result;
  }

  @Override
  public boolean matches(CharSequence rawPassword, String encodedPassword) {

    if (encodedPassword == null || rawPassword == null) {
      return false;
    }

    if (!encodedPassword.equals(encode(rawPassword))) {
      return false;
    }

    return true;
  }
}
