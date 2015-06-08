package nexos.service.ed.task;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.Util;
import nexos.common.ibatis.NexosDAO;

import org.quartz.JobBuilder;
import org.quartz.JobDataMap;
import org.quartz.JobDetail;
import org.quartz.Scheduler;
import org.quartz.SchedulerException;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.scheduling.quartz.SchedulerFactoryBean;
import org.springframework.security.access.annotation.Secured;

@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
public class EDTaskManagerService {

  private final Logger         logger = LoggerFactory.getLogger(EDTaskManagerService.class);

  @Resource
  private ApplicationContext   appContext;

  @Resource
  private SchedulerFactoryBean taskScheduler;

  public SchedulerFactoryBean getTaskScheduler() {

    return this.taskScheduler;
  }

  public ApplicationContext getApplicationContext() {

    return this.appContext;
  }

  public boolean isStarted() {

    boolean result = false;

    try {
      Scheduler scheduler = taskScheduler.getScheduler();
      if (scheduler != null) {
        // List<JobExecutionContext> executingJobs = scheduler.getCurrentlyExecutingJobs();
        // result = executingJobs.size() > 0;

        // result = scheduler.isStarted();

        List<String> jobGroupNames = scheduler.getJobGroupNames();
        result = jobGroupNames.size() > 0;
      }
    } catch (SchedulerException e) {
      e.printStackTrace();
    }

    return result;
  }

  public void startScheduler() throws Exception {

    this.startScheduler(false);
  }

  public void startScheduler(boolean autoStartup) throws Exception {

    // logger.info("EDTASKMANAGER.startScheduler");

    if (isStarted()) {
      throw new RuntimeException("스케줄러가 이미 동작 중 입니다.");
    }

    try {
      createJobs(autoStartup);

      Scheduler scheduler = taskScheduler.getScheduler();
      if (scheduler != null) {
        scheduler.start();
      }
    } catch (Exception e) {
      throw new RuntimeException(e.getMessage());
    }
  }

  public void stopScheduler() throws Exception {

    // logger.info("EDTASKMANAGER.stopScheduler");

    if (isStarted()) {
      try {
        Scheduler scheduler = taskScheduler.getScheduler();
        if (scheduler != null) {
          scheduler.standby();
          scheduler.clear();
        }
      } catch (Exception e) {
        throw new RuntimeException("스케줄러 중지 중 오류가 발생했습니다.\n\n" + e.getMessage());
      }
    }
  }

  public void shutdownScheduler() throws Exception {

    // logger.info("EDTASKMANAGER.stopScheduler");

    if (isStarted()) {
      try {
        Scheduler scheduler = taskScheduler.getScheduler();
        if (scheduler != null) {
          scheduler.shutdown(true);
        }
      } catch (Exception e) {
        throw new RuntimeException("스케줄러 중지 중 오류가 발생했습니다.\n\n" + e.getMessage());
      }
    }
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  private void createJobs(boolean isAutoStart) throws Exception {

    HashMap<String, Object> params = new HashMap<String, Object>();

    // 수신정의 데이터 쿼리
    List list = getEDDefines(params);
    try {
      if (list == null || list.size() == 0) {
        throw new RuntimeException("실행할 스케줄 데이터가 존재하지 않습니다.");
      }

      Scheduler scheduler = taskScheduler.getScheduler();
      if (scheduler == null) {
        throw new RuntimeException("스케줄러가 존재하지 않습니다.");
      }
      for (int i = 0, defineCount = list.size(); i < defineCount; i++) {
        Map<String, Object> rowData = (HashMap<String, Object>)list.get(i);

        String BU_CD = (String)rowData.get("BU_CD");
        String EDI_DIV = (String)rowData.get("EDI_DIV");
        String DEFINE_NO = (String)rowData.get("DEFINE_NO");
        String DEFINE_DIV = (String)rowData.get("DEFINE_DIV");
        String DATA_DIV = (String)rowData.get("DATA_DIV");
        String DATA_CYCLE_DIV = (String)rowData.get("DATA_CYCLE_DIV"); // 1: 특정, 2: 반복
        String REPEAT_EXEC_TIME = (String)rowData.get("REPEAT_EXEC_TIME");
        String[ ] REPEAT_EXEC_TIMES = null;
        if (REPEAT_EXEC_TIME == null) {
          REPEAT_EXEC_TIME = "";
          REPEAT_EXEC_TIMES = new String[ ] { };
        } else {
          REPEAT_EXEC_TIMES = REPEAT_EXEC_TIME.split(",");
        }

        String msgPrefix = "[사업부,구분,정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO + "]";
        String errMsg = null;

        // 송수신유형 체크
        if (!Consts.DEFINE_DIV_RECV.equals(DEFINE_DIV) && !Consts.DEFINE_DIV_SEND.equals(DEFINE_DIV)) {
          throw new RuntimeException(msgPrefix + "처리할 수 없는 송수신유형 구분입니다.");
        }

        // 데이터처리유형 체크
        if (!Consts.DATA_DIV_DBLINK.equals(DATA_DIV) && !Consts.DATA_DIV_XLS.equals(DATA_DIV)
          && !Consts.DATA_DIV_TXT.equals(DATA_DIV) && !Consts.DATA_DIV_XML.equals(DATA_DIV)) {
          throw new RuntimeException(msgPrefix + "처리할 수 없는 데이터처리유형 구분입니다.");
        }

        // 실행주기 체크
        if (REPEAT_EXEC_TIMES.length == 0
          || ("2".equals(DATA_CYCLE_DIV) && (REPEAT_EXEC_TIMES.length != 1 && REPEAT_EXEC_TIMES.length != 3))) {
          errMsg = msgPrefix + "스케줄 수행주기 설정이 잘못되었습니다. 설정 수정 후 수동으로 스케줄러를 재시작하십시오.";
          if (isAutoStart) {
            logger.info(errMsg);
            continue;
          } else {
            throw new RuntimeException(errMsg);
          }
        }

        // 파일 송수신일 경우 접속 정보 체크
        if (Consts.DATA_DIV_XLS.equals(DATA_DIV) || Consts.DATA_DIV_TXT.equals(DATA_DIV)
          || Consts.DATA_DIV_XML.equals(DATA_DIV)) {

          String REMOTE_DIV = (String)rowData.get("REMOTE_DIV");
          String REMOTE_IP = (String)rowData.get("REMOTE_IP");
          String REMOTE_PORT = (String)rowData.get("REMOTE_PORT");
          // String REMOTE_CHARSET = (String)rowData.get("REMOTE_CHARSET");
          // String REMOTE_PASSIVE_YN = (String)rowData.get("REMOTE_PASSIVE_YN");
          String REMOTE_USER_ID = (String)rowData.get("REMOTE_USER_ID");
          String REMOTE_USER_PWD = (String)rowData.get("REMOTE_USER_PWD");
          // String REMOTE_DIR = (String)rowData.get("REMOTE_DIR");
          // String EDI_DIR = (String)rowData.get("EDI_DIR");
          String WEBSERVICE_URL = (String)rowData.get("WEBSERVICE_URL");
          String WEBSERVICE_METHOD = (String)rowData.get("WEBSERVICE_METHOD");

          if (Consts.REMOTE_DIV_FTP.equals(REMOTE_DIV) || Consts.REMOTE_DIV_SFTP.equals(REMOTE_DIV)) {
            if (Util.isNull(REMOTE_IP) || Util.isNull(REMOTE_PORT) || Util.isNull(REMOTE_USER_ID)
              || Util.isNull(REMOTE_USER_PWD)) {
              errMsg = msgPrefix + "파일 송수신에 대한 FTP접속 정보가 지정되지 않았습니다. 설정 수정 후 수동으로 스케줄러를 재시작하십시오.";
              if (isAutoStart) {
                logger.info(errMsg);
                continue;
              } else {
                throw new RuntimeException(errMsg);
              }
            }
          } else if (Consts.REMOTE_DIV_WS.equals(REMOTE_DIV)) {
            if (Util.isNull(WEBSERVICE_URL) || Util.isNull(WEBSERVICE_METHOD)) {
              errMsg = msgPrefix + "송수신에 대한 웹서비스 정보가 지정되지 않았습니다. 설정 수정 후 수동으로 스케줄러를 재시작하십시오.";
              if (isAutoStart) {
                logger.info(errMsg);
                continue;
              } else {
                throw new RuntimeException(errMsg);
              }
            }
            if (Consts.DATA_DIV_XLS.equals(DATA_DIV)) {
              errMsg = msgPrefix + "엑셀 파일은 웹서비스로 송수신 처리할 수 없습니다. 설정 수정 후 수동으로 스케줄러를 재시작하십시오.";
              if (isAutoStart) {
                logger.info(errMsg);
                continue;
              } else {
                throw new RuntimeException(errMsg);
              }
            }
          }
        }

        String jobDefine = BU_CD + "_" + EDI_DIV + "_" + DEFINE_NO;
        String jobName = jobDefine + "_Job";
        String triggerName = jobDefine + "_Trigger";

        // Job 생성
        JobDetail jobDetail = JobBuilder.newJob(EDTask.class).withIdentity(jobName, Consts.TRIGER_GROUP).build();

        // Job 정보 세팅
        JobDataMap jobDataMap = jobDetail.getJobDataMap();
        jobDataMap.put("P_JOB_NM", jobName);
        jobDataMap.put("P_TRIGGER_NM", triggerName);
        jobDataMap.put("P_TASK_MANAGER", this);
        jobDataMap.put("P_DATA_CYCLE_DIV", DATA_CYCLE_DIV);
        jobDataMap.put("P_REPEAT_EXEC_TIMES", REPEAT_EXEC_TIMES);
        jobDataMap.put("P_EXEC_COUNT", 0);
        jobDataMap.put("P_DEFINE_INFO", Util.dataMapToParamMap(rowData));

        Date triggerStartTime = getNextExecTime(jobDataMap);
        SimpleScheduleBuilder jobSchedule = SimpleScheduleBuilder.simpleSchedule().withIntervalInHours(24 * 365)
          .withRepeatCount(1);

        // 스케줄 트리거 생성
        Trigger trigger = TriggerBuilder.newTrigger().withIdentity(triggerName, Consts.TRIGER_GROUP)
          .startAt(triggerStartTime).withSchedule(jobSchedule).build();

        // 스케줄 등록
        scheduler.scheduleJob(jobDetail, trigger);

        logger.info("스케줄등록: " + msgPrefix + "[다음실행일시: " + jobDataMap.getString("P_NEXT_EXEC_TIME") + "]");
      }
    } catch (Exception e) {
      clearJobs();
      if (isAutoStart) {
        logger.error("스케줄 생성 중 오류가 발생했습니다.\n" + e.getMessage().replace("\n\n", "\n"));
      } else {
        throw new RuntimeException("스케줄 생성 중 오류가 발생했습니다.\n\n" + e.getMessage());
      }
    }
  }

  private void clearJobs() {
    try {
      if (isStarted()) {
        stopScheduler();
      } else {
        Scheduler scheduler = taskScheduler.getScheduler();
        if (scheduler != null) {
          scheduler.clear();
        }
      }
    } catch (Exception e) {
      logger.error("스케줄 초기화 중 오류가 발생했습니다.", e);
    }
  }

  /**
   * 다음 실행일시 계산
   * 
   * @param jobDataMap
   * @return
   */
  public Date getNextExecTime(JobDataMap jobDataMap) {

    Date result = null;
    String DATA_CYCLE_DIV = jobDataMap.getString("P_DATA_CYCLE_DIV");
    String[ ] REPEAT_EXEC_TIMES = (String[ ])jobDataMap.get("P_REPEAT_EXEC_TIMES");

    SimpleDateFormat sdf = new SimpleDateFormat(Consts.DATETIME_FORMAT);
    Calendar calNextTime = Calendar.getInstance();

    Date currDateTime = calNextTime.getTime();
    String currDateTimeStr = sdf.format(currDateTime);
    String currTimeStr = currDateTimeStr.substring(11, 16);
    // 1: 특정
    // A.compareTo(B) -> A > B >> 양수, A = B >> 0, A < B << 음수
    if ("1".equals(DATA_CYCLE_DIV)) {
      String[ ] nextTimeStr = null;
      for (int i = 0, timeCount = REPEAT_EXEC_TIMES.length; i < timeCount; i++) {
        if (currTimeStr.compareTo(REPEAT_EXEC_TIMES[i]) < 0) {
          nextTimeStr = REPEAT_EXEC_TIMES[i].split(":");
          break;
        }
      }
      // 당일 가능 시간이 지났으면 다음 날 첫번째 시간으로 지정
      if (nextTimeStr == null) {
        nextTimeStr = REPEAT_EXEC_TIMES[0].split(":");
        calNextTime.set(Calendar.DATE, calNextTime.get(Calendar.DATE) + 1);
        calNextTime.set(Calendar.HOUR_OF_DAY, Integer.parseInt(nextTimeStr[0]));
        calNextTime.set(Calendar.MINUTE, Integer.parseInt(nextTimeStr[1]));
        calNextTime.set(Calendar.SECOND, 0);
        calNextTime.set(Calendar.MILLISECOND, 0);
      } else {
        calNextTime.set(Calendar.HOUR_OF_DAY, Integer.parseInt(nextTimeStr[0]));
        calNextTime.set(Calendar.MINUTE, Integer.parseInt(nextTimeStr[1]));
        calNextTime.set(Calendar.SECOND, 0);
        calNextTime.set(Calendar.MILLISECOND, 0);
      }
    } else {
      // 2: 반복 -> 시간만 지정 되었을 경우 현재일시 + 지정시간(초)로 다음 실행일시 지정
      if (REPEAT_EXEC_TIMES.length == 1) {

        calNextTime.set(Calendar.SECOND, calNextTime.get(Calendar.SECOND) + Integer.parseInt(REPEAT_EXEC_TIMES[0]));
        calNextTime.set(Calendar.MILLISECOND, 0);

      } else {
        // 시작,종료시간 + 수행주기가 지정시간내 있으면 다음 실행시간을 지정
        calNextTime.set(Calendar.SECOND, calNextTime.get(Calendar.SECOND) + Integer.parseInt(REPEAT_EXEC_TIMES[2]));
        calNextTime.set(Calendar.MILLISECOND, 0);

        String nextDateTimeStr = sdf.format(calNextTime.getTime());
        String nextTimeStr = nextDateTimeStr.substring(11, 16);

        // 날짜가 다를 경우 다음 날 시작 시간으로 지정
        if (!currDateTimeStr.substring(0, 10).equals(nextDateTimeStr.substring(0, 10))) {

          String[ ] nextTime = REPEAT_EXEC_TIMES[0].split(":");
          calNextTime.setTime(currDateTime);
          calNextTime.set(Calendar.DATE, calNextTime.get(Calendar.DATE) + 1);
          calNextTime.set(Calendar.HOUR_OF_DAY, Integer.parseInt(nextTime[0]));
          calNextTime.set(Calendar.MINUTE, Integer.parseInt(nextTime[1]));
          calNextTime.set(Calendar.SECOND, 0);
          calNextTime.set(Calendar.MILLISECOND, 0);

          // 날짜가 같을 경우
        } else {
          // 다음 실행 시간이 종료 시간 이후일 경우 다음날 시작시간
          if (nextTimeStr.compareTo(REPEAT_EXEC_TIMES[1]) > 0) {

            String[ ] nextTime = REPEAT_EXEC_TIMES[0].split(":");
            calNextTime.setTime(currDateTime);
            calNextTime.set(Calendar.DATE, calNextTime.get(Calendar.DATE) + 1);
            calNextTime.set(Calendar.HOUR_OF_DAY, Integer.parseInt(nextTime[0]));
            calNextTime.set(Calendar.MINUTE, Integer.parseInt(nextTime[1]));
            calNextTime.set(Calendar.SECOND, 0);
            calNextTime.set(Calendar.MILLISECOND, 0);

            // 다음 실행 시간이 시작 시간 전일 경우 현재 날짜에 시작 시간
          } else if (nextTimeStr.compareTo(REPEAT_EXEC_TIMES[0]) < 0) {

            String[ ] nextTime = REPEAT_EXEC_TIMES[0].split(":");
            calNextTime.setTime(currDateTime);
            calNextTime.set(Calendar.HOUR_OF_DAY, Integer.parseInt(nextTime[0]));
            calNextTime.set(Calendar.MINUTE, Integer.parseInt(nextTime[1]));
            calNextTime.set(Calendar.SECOND, 0);
            calNextTime.set(Calendar.MILLISECOND, 0);
          }
        }
      }
    }

    result = calNextTime.getTime();
    jobDataMap.put("P_NEXT_EXEC_TIME", sdf.format(result));
    return result;
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  private List getEDDefines(Map params) {

    List result = null;
    final String SCHEDULE_DEFINE_INFO_ID = "EDCOMMON.RS_SCHEDULE_DEFINE_INFO";

    NexosDAO dao = (NexosDAO)appContext.getBean("nexosDAO");

    try {
      result = dao.list(SCHEDULE_DEFINE_INFO_ID, params);
    } finally {
      dao = null;
    }

    return result;
  }

}
