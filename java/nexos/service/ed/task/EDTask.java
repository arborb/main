package nexos.service.ed.task;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Map;

import nexos.common.Consts;
import nexos.common.spring.security.AuthenticationUtil;
import nexos.service.ed.common.EDCommonService;

import org.quartz.DisallowConcurrentExecution;
import org.quartz.Job;
import org.quartz.JobDataMap;
import org.quartz.JobExecutionContext;
import org.quartz.JobExecutionException;
import org.quartz.JobKey;
import org.quartz.PersistJobDataAfterExecution;
import org.quartz.SimpleScheduleBuilder;
import org.quartz.Trigger;
import org.quartz.TriggerBuilder;
import org.quartz.TriggerKey;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component("EDTASK")
@PersistJobDataAfterExecution
@DisallowConcurrentExecution
public class EDTask implements Job {

  private final Logger logger = LoggerFactory.getLogger(EDTask.class);

  @SuppressWarnings("rawtypes")
  @Override
  public void execute(JobExecutionContext context) throws JobExecutionException {

    SimpleDateFormat sdf = new SimpleDateFormat(Consts.DATETIME_FORMAT);
    JobDataMap jobDataMap = context.getJobDetail().getJobDataMap();

    String JOB_NM = jobDataMap.getString("P_JOB_NM");
    Map DEFINE_INFO = (Map)jobDataMap.get("P_DEFINE_INFO");
    int EXEC_COUNT = jobDataMap.getInt("P_EXEC_COUNT");
    EXEC_COUNT++;
    jobDataMap.put("P_EXEC_COUNT", EXEC_COUNT);

    StringBuffer sbLog = new StringBuffer();
    sbLog.append("Executing task..................................................").append("\n");
    sbLog.append("[START TASK]").append(")\n");
    sbLog.append("▶ JOB      :【").append(JOB_NM).append("】\n");
    sbLog.append("▶ JOB 설명 :【").append((String)DEFINE_INFO.get("P_DEFINE_NM")).append("】\n");
    sbLog.append("▶ JOB 실행 :【").append(EXEC_COUNT).append("】\n");
    sbLog.append("   [준비    ").append(sdf.format(System.currentTimeMillis())).append("] ");
    sbLog.append(pauseJob(jobDataMap)).append("\n");
    sbLog.append("   [실행    ").append(sdf.format(System.currentTimeMillis())).append("] ");
    sbLog.append(execJob(jobDataMap)).append("\n");
    sbLog.append("   [대기    ").append(sdf.format(System.currentTimeMillis())).append("] ");
    sbLog.append(scheduleJob(jobDataMap)).append("\n");
    sbLog.append("[STOP TASK]");
    logger.info(sbLog.toString());
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  private String execJob(JobDataMap jobDataMap) {

    String result = null;

    EDTaskManagerService taskManager = (EDTaskManagerService)jobDataMap.get("P_TASK_MANAGER");

    AuthenticationUtil.configureAuthentication();
    try {
      EDCommonService edCommon = (EDCommonService)taskManager.getApplicationContext().getBean("EDCOMMON");
      String oMsg = edCommon.execTask((Map)jobDataMap.get("P_DEFINE_INFO"));
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      result = "Success : " + oMsg;
    } catch (Exception e) {
      result = "Error   : " + e.getMessage();
    } finally {
      AuthenticationUtil.clearAuthentication();
    }

    return result;
  }

  private String pauseJob(JobDataMap jobDataMap) {

    String result = "Success : ";

    String JOB_NM = jobDataMap.getString("P_JOB_NM");
    EDTaskManagerService taskManager = (EDTaskManagerService)jobDataMap.get("P_TASK_MANAGER");

    try {
      taskManager.getTaskScheduler().getScheduler().pauseJob(new JobKey(JOB_NM, Consts.TRIGER_GROUP));
      result += Consts.OK;
    } catch (Exception e) {
      result = "Error   : " + e.getMessage();
    }

    return result;
  }

  private String scheduleJob(JobDataMap jobDataMap) {

    String result = "Success : ";

    String TRIGGER_NM = jobDataMap.getString("P_TRIGGER_NM");
    EDTaskManagerService taskManager = (EDTaskManagerService)jobDataMap.get("P_TASK_MANAGER");
    // 다음 실행 스케줄 등록
    try {
      Date triggerStartTime = taskManager.getNextExecTime(jobDataMap);
      SimpleScheduleBuilder jobSchedule = SimpleScheduleBuilder.simpleSchedule().withIntervalInHours(24 * 365)
        .withRepeatCount(1);

      Trigger trigger = TriggerBuilder.newTrigger().withIdentity(TRIGGER_NM, Consts.TRIGER_GROUP)
        .startAt(triggerStartTime).withSchedule(jobSchedule).build();

      taskManager.getTaskScheduler().getScheduler()
        .rescheduleJob(new TriggerKey(TRIGGER_NM, Consts.TRIGER_GROUP), trigger);

      result += jobDataMap.getString("P_NEXT_EXEC_TIME");
    } catch (Exception e) {
      result = "Error   : " + e.getMessage();
    }
    return result;
  }
}
