package nexos.service.lc;

import java.util.Map;

import javax.annotation.Resource;

import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: WCDAOImpl<br>
 * Description: LC01010E DAO (Data Access Object)<br>
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
@Repository("LC01010EDAO")
public class LC01010EDAOImpl implements LC01010EDAO {

  @Resource
  private NexosDAO nexosDAO;

  @Override
  public void save(Map<String, Object> params) throws Exception {

    final String PRORAM_ID = "LC01010E";
    final String D_TABLE_NM = "LC010ND";
    final String DETAIL_UPDATE_ID = PRORAM_ID + ".UPDATE_" + D_TABLE_NM;

    nexosDAO.update(DETAIL_UPDATE_ID, params);
  }
}
