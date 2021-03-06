package nexos.service.lo;

import java.util.Map;

import javax.annotation.Resource;

import nexos.common.ibatis.JsonDataSet;
import nexos.service.common.CommonDAO;
import nexos.service.common.WCDAO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;

/**
 * Class: LOM9150QService<br>
 * Description: 출고 내역(LOM9150Q) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LOM9150Q")
public class LOM9150QService {

  /**
   * DAO 주입처리하기
   */
  @Resource
  private CommonDAO                  common;

  @Resource
  private WCDAO                      dao;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return common.getJsonDataSet(queryId, params);
  }

}