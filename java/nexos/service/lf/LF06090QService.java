package nexos.service.lf;

import java.util.Map;

import javax.annotation.Resource;

import nexos.common.ibatis.JsonDataSet;
import nexos.service.common.CommonDAO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;

/**
 * Class: LF06090QService<br>
 * Description: 입고진행현황(LI03010Q) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("LF06090Q")
public class LF06090QService {
  
  /**
   * DAO 주입처리하기 
   */
  @Resource
  private CommonDAO                  common;

  @Resource
  private PlatformTransactionManager transactionManager;
  
  
  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {
System.out.println("params : " + params);
    return common.getJsonDataSet(queryId, params);
  }

}
