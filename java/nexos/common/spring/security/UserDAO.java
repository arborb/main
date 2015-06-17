package nexos.common.spring.security;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.orm.ibatis.SqlMapClientTemplate;

/**
 * Class: UserDAO<br>
 * Description: 스프링 보안 처리시 사용하는 DAO (Data Access Object)<br>
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
public class UserDAO {

  private SqlMapClientTemplate sqlMapClientTemplate;

  /**
   * SqlMapClientTemplate 를 가져옵니다.
   * 
   * @return
   */
  public SqlMapClientTemplate getSqlMapClientTemplate() {

    return sqlMapClientTemplate;
  }

  /**
   * SqlMapClientTemplate 를 주입합니다.
   * 
   * @param sqlMapClientTemplate
   */
  public void setSqlMapClientTemplate(SqlMapClientTemplate sqlMapClientTemplate) {

    this.sqlMapClientTemplate = sqlMapClientTemplate;
  }

  /**
   * 특정 사용자 정보를 조회한다
   * 
   * @param userId 사용자 ID
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  public List getUser(String userId) throws Exception {

    Map<String, Object> map = new HashMap<String, Object>();
    map.put("P_USER_ID", userId);

    return sqlMapClientTemplate.queryForList("WC.GET_LOGIN", map);
  }
}
