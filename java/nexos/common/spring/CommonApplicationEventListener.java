package nexos.common.spring;

import java.io.File;
import java.lang.reflect.Array;
import java.lang.reflect.Field;
import java.sql.Driver;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Enumeration;
import java.util.Properties;

import javax.annotation.Resource;

import nexos.common.Util;
import nexos.common.spring.security.AuthenticationUtil;
import nexos.service.ed.task.EDTaskManagerService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.context.event.ContextClosedEvent;
import org.springframework.context.event.ContextRefreshedEvent;

import com.mchange.v2.c3p0.ComboPooledDataSource;

/**
 * Class: CommonApplicationEventListener<br>
 * Description: Application Event Listener Class<br>
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
public class CommonApplicationEventListener implements ApplicationListener<ApplicationEvent> {

  private final Logger logger = LoggerFactory.getLogger(CommonApplicationEventListener.class);

  @Resource
  private Properties   globalProps;

  @Resource
  private Properties   taskProps;

  @Override
  public void onApplicationEvent(ApplicationEvent event) {

    // logger.info("SERVER EVENT LOG >> EVENT : " + event.getClass().getSimpleName());

    // if (event instanceof ServletRequestHandledEvent) {
    // ServletRequestHandledEvent e = (ServletRequestHandledEvent)event;
    // StringBuilder sbBuffer = new StringBuilder();
    // sbBuffer.append("CLIENT REQUEST LOG");
    // sbBuffer.append("\n  CLIENT IP   : ").append(e.getClientAddress());
    // sbBuffer.append("\n  SESSION ID  : ").append(e.getSessionId());
    // sbBuffer.append("\n  USER        : ").append(e.getUserName());
    // sbBuffer.append("\n  REQUEST URL : ").append(e.getRequestUrl());
    // sbBuffer.append("\n  METHOD      : ").append(e.getMethod());
    // sbBuffer.append("\n  TIME        : ").append(String.format("%.2f", e.getProcessingTimeMillis() / 1000f));
    // if (e.wasFailure()) {
    // sbBuffer.append("\n  STATUS      : ERROR▶").append(e.getFailureCause().getMessage());
    // } else {
    // sbBuffer.append("\n  STATUS      : OK");
    // }
    // sbBuffer.append("\n");
    // logger.info(sbBuffer.toString());
    // }

    if (event instanceof ContextRefreshedEvent) {

      // Context Refreshed Event
      createFileDirs();

      if (Boolean.parseBoolean(taskProps.getProperty("TASKSCHEDULER.AutoStartup"))) {
        logger.info("TaskScheduler Startup...");
        ApplicationContext appContext = ((ContextRefreshedEvent)event).getApplicationContext();
        EDTaskManagerService taskManager = (EDTaskManagerService)appContext.getBean("EDTASKMANAGER");
        if (taskManager != null) {
          AuthenticationUtil.configureAuthentication();
          try {
            taskManager.startScheduler(true);
          } catch (Exception e) {
            logger.error("TaskScheduler[startScheduler] Error", e);
          } finally {
            AuthenticationUtil.clearAuthentication();
          }
        }
        sleep(2000);
      }

    } else if (event instanceof ContextClosedEvent) {

      // Context Closed Event
      ApplicationContext appContext = ((ContextClosedEvent)event).getApplicationContext();
      EDTaskManagerService taskManager = (EDTaskManagerService)appContext.getBean("EDTASKMANAGER");
      if (taskManager != null) {
        AuthenticationUtil.configureAuthentication();
        try {
          taskManager.shutdownScheduler();
        } catch (Exception e) {
          logger.error("TaskScheduler[stopScheduler] Error", e);
        } finally {
          AuthenticationUtil.clearAuthentication();
        }
      }
      sleep(2000);

      ComboPooledDataSource dataSource = (ComboPooledDataSource)appContext.getBean("dataSource");
      if (dataSource != null) {
        try {
          dataSource.close();
        } catch (Exception e) {
          logger.error("ComboPooledDataSource[close] Error", e);
        } finally {
          dataSource = null;
        }
      }
      sleep(2000);

      Enumeration<Driver> drivers = DriverManager.getDrivers();
      while (drivers.hasMoreElements()) {
        Driver driver = drivers.nextElement();
        try {
          DriverManager.deregisterDriver(driver);
        } catch (SQLException e) {
          logger.error("DriverManager[deregisterDriver] Error", e);
        }
      }

      try {
        cleanThreadLocals(new String[ ] {
          "com.ibatis.sqlmap.engine.mapping.result.ResultObjectFactoryUtil$FactorySettings",
          "com.sun.org.apache.xerces.internal.jaxp.DocumentBuilderImpl"});
      } catch (Exception e) {
        logger.error("ResultObjectFactory[factorySettings.remove] Error", e);
      }

      writeMemoryLeak();
    }
  }

  private void sleep(long millis) {

    try {
      Thread.sleep(millis);
    } catch (InterruptedException e) {
    }
  }

  private void writeMemoryLeak() {

    // Thread thread = Thread.currentThread();
    // StringBuilder sb = new StringBuilder();
    //
    // try {
    // Field threadLocalsField = Thread.class.getDeclaredField("threadLocals");
    // threadLocalsField.setAccessible(true);
    //
    // Class threadLocalMapClass = Class.forName("java.lang.ThreadLocal$ThreadLocalMap");
    // Field tableField = threadLocalMapClass.getDeclaredField("table");
    // tableField.setAccessible(true);
    //
    // Object table = tableField.get(threadLocalsField.get(thread));
    //
    // int threadLocalCount = Array.getLength(table);
    //
    // StringBuilder classSb = new StringBuilder();
    //
    // int leakCount = 0;
    //
    // for (int i = 0; i < threadLocalCount; i++) {
    // Object entry = Array.get(table, i);
    // if (entry != null) {
    // Field valueField = entry.getClass().getDeclaredField("value");
    // valueField.setAccessible(true);
    // Object value = valueField.get(entry);
    // if (value != null) {
    // classSb.append(value.getClass().getName()).append(", ");
    // } else {
    // classSb.append("null, ");
    // }
    // leakCount++;
    // }
    // }
    //
    // sb.append("possible ThreadLocal leaks: ").append(leakCount).append(" of ").append(threadLocalCount)
    // .append(" = [").append(classSb.substring(0, classSb.length() - 2)).append("] ");
    // } catch (Exception e) {
    //
    // }
    // if (sb.length() > 0) {
    // logger.warn(sb.toString());
    // }
  }

  private void cleanThreadLocals(String[ ] cleanClassNames) throws NoSuchFieldException, ClassNotFoundException,
    IllegalArgumentException, IllegalAccessException {

    Thread[ ] threadgroup = new Thread[256];
    Thread.enumerate(threadgroup);

    for (int i = 0; i < threadgroup.length; i++) {
      if (threadgroup[i] != null) {
        cleanThreadLocals(threadgroup[i], cleanClassNames);
      }
    }
  }

  @SuppressWarnings("rawtypes")
  private void cleanThreadLocals(Thread thread, String[ ] cleanClassNames) throws NoSuchFieldException,
    ClassNotFoundException, IllegalArgumentException, IllegalAccessException {

    Field threadLocalsField = Thread.class.getDeclaredField("threadLocals");
    threadLocalsField.setAccessible(true);

    Class threadLocalMapKlazz = Class.forName("java.lang.ThreadLocal$ThreadLocalMap");
    Field tableField = threadLocalMapKlazz.getDeclaredField("table");
    tableField.setAccessible(true);

    Object fieldLocal = threadLocalsField.get(thread);
    if (fieldLocal == null) {
      return;
    }
    Object table = tableField.get(fieldLocal);

    int threadLocalCount = Array.getLength(table);

    for (int i = 0; i < threadLocalCount; i++) {
      Object entry = Array.get(table, i);
      if (entry != null) {
        Field valueField = entry.getClass().getDeclaredField("value");
        valueField.setAccessible(true);
        Object value = valueField.get(entry);
        if (value != null) {
          String valueClassName = value.getClass().getName();
          for (String checkClassName : cleanClassNames) {
            if (valueClassName.equals(checkClassName)) {
              valueField.set(entry, null);
            }
          }
        }
      }
    }
  }

  private void createFileDirs() {

    // 파일 폴더 생성
    logger.info("Create Application Temporary Directories...");
    String WEB_ROOT_PATH = globalProps.getProperty("webapp.root");
    createFileDir(WEB_ROOT_PATH, globalProps.getProperty("fileRoot"), globalProps.getProperty("ediRecvRoot"),
      globalProps.getProperty("ediSendRoot"), globalProps.getProperty("excelExport"),
      globalProps.getProperty("noticeAttachment"), globalProps.getProperty("uploadTemp"),
      globalProps.getProperty("biCustImage"), globalProps.getProperty("biBuImage"),
      globalProps.getProperty("biBrandImage"));
  }

  private void createFileDir(String rootPath, String... pathList) {

    for (String path : pathList) {
      File targetDir = new File(Util.getPathName(rootPath, path));
      if (!targetDir.exists()) {
        try {
          targetDir.mkdirs();
          targetDir.setWritable(true);
        } catch (Exception e) {
        }
      }
    }
  }

  public void initalize() {

    // logger.info("CommonApplicationEventListener.initalize");
  }

  public void destory() {

    // logger.info("CommonApplicationEventListener.destory");
  }
}
