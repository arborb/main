package nexos.service.ed;

import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.JsonDataSet;
import nexos.service.common.CommonDAO;
import nexos.service.ed.task.EDTaskManagerService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * Class: ED02030EService<br>
 * Description: 인터페이스 송수신 스케줄링(ED02030E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("ED02030E")
public class ED02030EService {

  private final Logger         logger = LoggerFactory.getLogger(ED02030EService.class);

  /**
   * DAO 주입처리하기
   */
  @Resource
  private CommonDAO            common;

  @Resource
  private EDTaskManagerService edTaskManager;

  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return common.getJsonDataSet(queryId, params);
  }

  /**
   * 스케줄 실행여부
   */
  public String getSchedulerStartedYN() {

    String result = Consts.NO;

    try {
      result = edTaskManager.isStarted() ? Consts.YES : Consts.NO;
    } catch (Exception e) {
      result = e.getMessage();
    }

    return result;
  }

  /**
   * 스케줄 실행
   */
  public String startScheduler(String userId) throws Exception {

    logger.info("ED02030E[startScheduler] USER_ID: " + userId);

    String result = Consts.OK;

    edTaskManager.startScheduler();

    return result;
  }

  /**
   * 스케줄 중지
   */
  public String stopScheduler(String userId) throws Exception {

    logger.info("ED02030E[stopScheduler] USER_ID: " + userId);

    String result = Consts.OK;

    edTaskManager.stopScheduler();

    return result;
  }
}
