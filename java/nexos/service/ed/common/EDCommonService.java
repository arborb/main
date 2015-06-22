package nexos.service.ed.common;

import java.io.File;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.Util;

import org.apache.commons.io.FilenameUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

/**
 * Class: EDCommonService<br>
 * Description: 인터페이스 송수신 서비스를 담당하는 공통 Class(트랜잭션처리 담당)<br>
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

@Service("EDCOMMON")
@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
public class EDCommonService {

  private final Logger               logger           = LoggerFactory.getLogger(EDCommonService.class);

  @Resource
  private EDCommonDAO                edCommonDAO;

  @Resource
  private PlatformTransactionManager transactionManager;

  @Resource
  private EDSenderService            edSender;

  private final String               ER_PROCESSING_ID = "ER_PROCESSING";
  private final String               ES_PROCESSING_ID = "ES_PROCESSING";

  public String execTask(Map<String, Object> params) {

    String result = Consts.OK;

    // String BU_CD = (String)params.get("P_BU_CD");
    // String EDI_DIV = (String)params.get("P_EDI_DIV");
    // String DEFINE_NO = (String)params.get("P_DEFINE_NO");
    String DEFINE_DIV = (String)params.get("P_DEFINE_DIV");
    // String DATA_DIV = (String)params.get("P_DATA_DIV");
    String USER_ID = edSender.getTaskProperty("WS.USER_ID");
    String SITE_CD = Util.getNull(edSender.getTaskProperty("EDI.SITE_CD"), Consts.SITE_CD_STANDARD);

    try {
      String EDI_DATE = edCommonDAO.getEDIDate();
      params.put("P_EDI_DATE", EDI_DATE);
      params.put("P_USER_ID", USER_ID);
      params.put("P_SITE_CD", SITE_CD);

      // 스케줄 최종수행시각 업데이트
      updateLastExecTime(params);

      // 이전 오류내역 처리
      errorProcessing(params);

      if (Consts.DEFINE_DIV_RECV.equals(DEFINE_DIV)) {
        // 수신 처리
        result = taskRecvProcessing(params);
      } else if (Consts.DEFINE_DIV_SEND.equals(DEFINE_DIV)) {
        // 송신 처리
        result = taskSendProcessing(params);
      }
    } catch (Exception e) {
      result = e.getMessage();
    }

    return result;
  }

  public String taskRecvProcessing(Map<String, Object> params) throws Exception {

    String result = Consts.OK;

    final String RECV_AFTER_METHOD_NM_PREFIX = "recvProcessingAfter_";
    HashMap<String, Object> resultMap = null;
    HashMap<String, Object> callParams = new HashMap<String, Object>();

    String BU_CD = (String)params.get("P_BU_CD");
    String EDI_DIV = (String)params.get("P_EDI_DIV");
    String DEFINE_NO = (String)params.get("P_DEFINE_NO");
    // String DEFINE_DIV = (String)params.get("P_DEFINE_DIV");
    String DATA_DIV = (String)params.get("P_DATA_DIV");
    String USER_ID = (String)params.get("P_USER_ID");
    String RECV_DATE = (String)params.get("P_EDI_DATE");
    String SITE_CD = (String)params.get("P_SITE_CD");
    String oMsg;

    // 호출 파라메터 기본값 입력
    callParams.put("P_BU_CD", BU_CD);
    callParams.put("P_EDI_DIV", EDI_DIV);
    callParams.put("P_DEFINE_NO", DEFINE_NO);
    callParams.put("P_USER_ID", USER_ID);
    callParams.put("P_RECV_DATE", "");
    callParams.put("P_RECV_NO", "");

    // SITE별 파일 생성 처리
    Method recvProcessingAfterFn = this.getClass().getMethod(RECV_AFTER_METHOD_NM_PREFIX + SITE_CD, Map.class);

    DefaultTransactionDefinition dtd = new DefaultTransactionDefinition();
    TransactionStatus ts = null;
    try {
      // DBLink 처리
      if (Consts.DATA_DIV_DBLINK.equals(DATA_DIV)) {

        // SP로 전체 처리
        ts = transactionManager.getTransaction(dtd);
        try {
          callParams.put("P_PROCESS_CD", "A");

          resultMap = edCommonDAO.recvDBLink(callParams);
          oMsg = (String)resultMap.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }
          transactionManager.commit(ts);
        } catch (Exception e) {
          transactionManager.rollback(ts);
          throw new RuntimeException(e.getMessage());
        }

      } else if (Consts.DATA_DIV_XLS.equals(DATA_DIV) || Consts.DATA_DIV_TXT.equals(DATA_DIV)
        || Consts.DATA_DIV_XML.equals(DATA_DIV)) {

        // 파일 처리
        String REMOTE_DIV = (String)params.get("P_REMOTE_DIV");
        String PREFIX_FILE_NM = (String)params.get("P_PREFIX_FILE_NM");
        callParams.put("P_RECV_DATE", RECV_DATE);
        callParams.put("P_PREFIX_FILE_NM", PREFIX_FILE_NM);

        // FTP일 경우만 처리, 웹서비스는 오류 데이터에 대한 재처리만 함
        if (Consts.REMOTE_DIV_FTP.equals(REMOTE_DIV) || Consts.REMOTE_DIV_SFTP.equals(REMOTE_DIV)) {

          // 수신 파일구분 세팅, 서버의 파일
          callParams.put("P_FILE_DIV", Consts.FILE_DIV_SERVER);

          // 파일 수신 처리, FTP를 통한 처리, 접속정보 Validation은 TaskManagerService에서 처리
          String REMOTE_IP = (String)params.get("P_REMOTE_IP");
          String REMOTE_PORT = (String)params.get("P_REMOTE_PORT");
          String REMOTE_CHARSET = (String)params.get("P_REMOTE_CHARSET");
          String REMOTE_PASSIVE_YN = (String)params.get("P_REMOTE_PASSIVE_YN");
          String REMOTE_USER_ID = (String)params.get("P_REMOTE_USER_ID");
          String REMOTE_USER_PWD = (String)params.get("P_REMOTE_USER_PWD");
          String REMOTE_DIR = (String)params.get("P_REMOTE_DIR");

          // 수신 경로 세팅
          String EDI_DIR = (String)params.get("P_EDI_DIR");
          if (Util.isNull(EDI_DIR)) {
            EDI_DIR = EDI_DIV + File.separator;
          }
          String WEB_ROOT_PATH = edCommonDAO.getGlobalProperty("webapp.root");
          String EDI_RECV_PATH = edCommonDAO.getGlobalProperty("ediRecvRoot");
          String EDI_RECV_DATETIME = Util.getNowDate("yyyyMMddHHmmss");
          String EDI_RECV_FULLPATH = Util.getPathName(WEB_ROOT_PATH, EDI_RECV_PATH, EDI_DIR);
          String EDI_RECV_BACKUPPATH = Util.getPathName(EDI_RECV_FULLPATH, Consts.BACKUP_DIR,
            EDI_RECV_DATETIME.substring(0, 8));

          Util.createDir(EDI_RECV_FULLPATH, EDI_RECV_BACKUPPATH);

          // FTP 파일 다운로드
          try {
            edCommonDAO.ftpDownload(REMOTE_DIV, REMOTE_IP, REMOTE_PORT, REMOTE_CHARSET, REMOTE_PASSIVE_YN,
              REMOTE_USER_ID, REMOTE_USER_PWD, REMOTE_DIR, PREFIX_FILE_NM, EDI_RECV_FULLPATH);
          } catch (Exception e) {
            logger.error("EDCOMMON[recvProcessing] ftpDownload Error : " + e.getMessage());
          }

          // 다운로드한 파일 처리
          File ediDir = new File(EDI_RECV_FULLPATH);
          if (ediDir.exists()) {
            File[ ] ediFiles = ediDir.listFiles();
            if (ediFiles.length == 0) {
              throw new RuntimeException("수신 처리할 파일이 없습니다.");
            }

            for (int i = 0, fileCount = ediFiles.length; i < fileCount; i++) {
              File ediFile = ediFiles[i];
              if (ediFile.isDirectory()) {
                continue;
              }
              String ediFileName = ediFile.getPath();
              callParams.put("P_FILE_DIR", FilenameUtils.getFullPath(ediFileName));
              callParams.put("P_FILE_NM", FilenameUtils.getName(ediFileName));
              // logger.info("EDCOMMON[recvProcessing] >> " + (String)callParams.get("P_FILE_NM"));

              // 파일 파싱 후 EDI 테이블에 데이터 생성
              ts = transactionManager.getTransaction(dtd);
              try {
                if (Consts.DATA_DIV_XLS.equals(DATA_DIV)) {
                  resultMap = edCommonDAO.recvExcel(callParams);
                } else if (Consts.DATA_DIV_TXT.equals(DATA_DIV)) {
                  resultMap = edCommonDAO.recvText(callParams);
                } else {
                  resultMap = edCommonDAO.recvXML(callParams);
                }
                oMsg = (String)resultMap.get(Consts.PK_O_MSG);
                if (!Consts.OK.equals(oMsg)) {
                  throw new RuntimeException(oMsg);
                }
                transactionManager.commit(ts);
              } catch (Exception e) {
                transactionManager.rollback(ts);
                logger.error("EDCOMMON[recvProcessing] Recv[A] Error : " + ediFile.getPath(), e);
                // 오류시 다음 파일 처리
                continue;
              }

              callParams.remove("P_FILE_DIR");
              callParams.remove("P_FILE_NM");
              callParams.remove("P_PREFIX_FILE_NM");

              // EDI 테이블에 입력 후 ER_PROCESSING 호출
              callParams.put("P_RECV_NO", resultMap.get("P_RECV_NO"));
              callParams.put("P_PROCESS_CD", "B");

              ts = transactionManager.getTransaction(dtd);
              try {
                resultMap = edCommonDAO.callSP(ER_PROCESSING_ID, callParams);
                oMsg = (String)resultMap.get(Consts.PK_O_MSG);
                if (!Consts.OK.equals(oMsg)) {
                  throw new RuntimeException(oMsg);
                }
                transactionManager.commit(ts);
              } catch (Exception e) {
                transactionManager.rollback(ts);
                logger.error("EDCOMMON[recvProcessing] Recv[B] Error : " + ediFile.getPath(), e);
                // 오류시 다음 파일 처리
                continue;
              }

              callParams.put("P_SITE_CD", SITE_CD);
              oMsg = (String)recvProcessingAfterFn.invoke(this, callParams);
              callParams.remove("P_SITE_CD");
            }
          }
        }
      }
    } catch (Exception e) {
      result = "[사업부,구분,정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO + "]"
        + Util.getNull(e.getMessage(), "").replaceAll("\n", " ");
    }

    return result;
  }

  public String recvProcessingAfter_0000(Map<String, Object> params) throws Exception {

    String result = Consts.OK;

    return result;
  }

  public String recvProcessingAfter_0010(Map<String, Object> params) throws Exception {

    String result = Consts.OK;

    final String ER_PROCESSING_AFTER_ID = "ER_PROCESSING_AFTER";
    final String EDI_DIV_ERWBDELIVERYCJ = "RWB10";

    String EDI_DIV = (String)params.get("P_EDI_DIV");

    if (EDI_DIV_ERWBDELIVERYCJ.equals(EDI_DIV)) {
      TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
      try {
        HashMap<String, Object> resultMap = edCommonDAO.callSP(ER_PROCESSING_AFTER_ID, params);
        String oMsg = (String)resultMap.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }

        oMsg = realtimeSendProcessing();
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }

        transactionManager.commit(ts);
        // logger.info("EDCOMMON[recvProcessingAfter] : OK");
      } catch (Exception e) {
        transactionManager.rollback(ts);
        logger.error("EDCOMMON[recvProcessingAfter] Error", e);
      }
    }

    return result;
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  public String taskSendProcessing(Map<String, Object> params) throws Exception {

    String result = Consts.OK;

    final String SEND_DETAIL_INFO_ID = "EDCOMMON.RS_SEND_DETAIL_INFO";
    final String ES_FILE_NM_UPDATE_ID = "ES_FILE_NM_UPDATE";
    final String CREATE_FILE_METHOD_NM_PREFIX = "createFileProcessing_";
    HashMap<String, Object> resultMap = null;
    HashMap<String, Object> callParams = new HashMap<String, Object>();

    String BU_CD = (String)params.get("P_BU_CD");
    String EDI_DIV = (String)params.get("P_EDI_DIV");
    String DEFINE_NO = (String)params.get("P_DEFINE_NO");
    // String DEFINE_DIV = (String)params.get("P_DEFINE_DIV");
    String DATA_DIV = (String)params.get("P_DATA_DIV");
    String USER_ID = (String)params.get("P_USER_ID");
    String SEND_DATE = (String)params.get("P_EDI_DATE");
    String INOUT_DATE = SEND_DATE; // 입출고일자는 현재 송신일자와 동일
    String REMOTE_DIV = (String)params.get("P_REMOTE_DIV");
    String SITE_CD = (String)params.get("P_SITE_CD");
    String PREFIX_FILE_NM = (String)params.get("P_PREFIX_FILE_NM");
    String oMsg;

    // 호출 파라메터 기본값 입력
    callParams.put("P_BU_CD", BU_CD);
    callParams.put("P_EDI_DIV", EDI_DIV);
    callParams.put("P_DEFINE_NO", DEFINE_NO);
    callParams.put("P_SEND_DATE", "");
    callParams.put("P_SEND_NO", "");
    callParams.put("P_PROCESS_CD", "A");
    callParams.put("P_USER_ID", USER_ID);
    // TODO: 물류센터, 입출고일자 지정
    callParams.put("P_CENTER_CD", "%");
    callParams.put("P_INOUT_DATE", INOUT_DATE);

    DefaultTransactionDefinition dtd = new DefaultTransactionDefinition();
    TransactionStatus ts = null;
    try {
      if (Consts.DATA_DIV_DBLINK.equals(DATA_DIV)) {
        // DBLink 처리
        ts = transactionManager.getTransaction(dtd);
        try {
          resultMap = edCommonDAO.sendDBLink(callParams);
          oMsg = (String)resultMap.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }
          transactionManager.commit(ts);
        } catch (Exception e) {
          transactionManager.rollback(ts);
          throw new RuntimeException(e.getMessage());
        }
      } else if (Consts.DATA_DIV_XLS.equals(DATA_DIV) || Consts.DATA_DIV_TXT.equals(DATA_DIV)
        || Consts.DATA_DIV_XML.equals(DATA_DIV)) {

        // 송신 데이터 EDI 테이블에 생성
        callParams.put("P_SEND_DATE", SEND_DATE);
        ts = transactionManager.getTransaction(dtd);
        try {
          resultMap = edCommonDAO.callSP(ES_PROCESSING_ID, callParams);
          oMsg = (String)resultMap.get(Consts.PK_O_MSG);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }
          transactionManager.commit(ts);
        } catch (Exception e) {
          transactionManager.rollback(ts);
          logger.error("EDCOMMON[sendProcessing] Send[A] Error", e);
        }

        callParams.remove("P_SEND_NO");
        callParams.remove("P_CENTER_CD");
        callParams.remove("P_INOUT_DATE");
        callParams.remove("P_PROCESS_CD");
        callParams.put("P_SEND_DIV", "1"); // 1 - TASKSCHEDULER, 2 - REALTIME

        // EDI 테이블에서 정상처리 후 미송신된 송신일자/송신번호 정보 가져오기
        List sendInfoList = edCommonDAO.getSendInfo(callParams);
        if (sendInfoList != null && sendInfoList.size() > 0) {

          // 파일 송신을 위한 기본 처리
          String EDI_DIR = (String)params.get("P_EDI_DIR");
          if (Util.isNull(EDI_DIR)) {
            EDI_DIR = EDI_DIV + File.separator;
          }
          String WEB_ROOT_PATH = edCommonDAO.getGlobalProperty("webapp.root");
          String EDI_SEND_PATH = edCommonDAO.getGlobalProperty("ediSendRoot");
          String EDI_SEND_DATETIME = Util.getNowDate("yyyyMMddHHmmss");
          String EDI_SEND_FULLPATH = Util.getPathName(WEB_ROOT_PATH, EDI_SEND_PATH, EDI_DIR);
          String EDI_SEND_BACKUPPATH = Util.getPathName(EDI_SEND_FULLPATH, Consts.BACKUP_DIR,
            EDI_SEND_DATETIME.substring(0, 8));

          Util.createDir(EDI_SEND_FULLPATH, EDI_SEND_BACKUPPATH);

          // 송신 원격 정보
          String REMOTE_IP = (String)params.get("P_REMOTE_IP");
          String REMOTE_PORT = (String)params.get("P_REMOTE_PORT");
          String REMOTE_CHARSET = (String)params.get("P_REMOTE_CHARSET");
          String REMOTE_PASSIVE_YN = (String)params.get("P_REMOTE_PASSIVE_YN");
          String REMOTE_USER_ID = (String)params.get("P_REMOTE_USER_ID");
          String REMOTE_USER_PWD = (String)params.get("P_REMOTE_USER_PWD");
          String REMOTE_DIR = (String)params.get("P_REMOTE_DIR");

          String WEBSERVICE_URL = (String)params.get("P_WEBSERVICE_URL");
          String WEBSERVICE_METHOD = (String)params.get("P_WEBSERVICE_METHOD");

          // 파라메터 기본값 세팅
          if (Consts.REMOTE_DIV_FTP.equals(REMOTE_DIV) || Consts.REMOTE_DIV_SFTP.equals(REMOTE_DIV)) {
            callParams.put("P_FILE_DIV", Consts.FILE_DIV_SERVER);
          } else {
            callParams.put("P_FILE_DIV", Consts.FILE_DIV_DOC);

            callParams.put("P_WEBSERVICE_URL", WEBSERVICE_URL);
            callParams.put("P_WEBSERVICE_METHOD", WEBSERVICE_METHOD);
            callParams.put("P_REMOTE_USER_ID", REMOTE_USER_ID);
            callParams.put("P_REMOTE_USER_PWD", REMOTE_USER_PWD);
          }
          callParams.put("P_FILE_DIR", EDI_SEND_FULLPATH);
          callParams.put("P_QUERY_ID", SEND_DETAIL_INFO_ID);
          callParams.put("P_DATA_DIV", DATA_DIV);
          callParams.put("P_SITE_CD", SITE_CD);
          callParams.put("P_PREFIX_FILE_NM", PREFIX_FILE_NM);

          Method createFileProcessingFn = this.getClass().getMethod(CREATE_FILE_METHOD_NM_PREFIX + SITE_CD, Map.class);

          // 송신번호별로 파일 생성/송신 처리
          for (int i = 0, sendCount = sendInfoList.size(); i < sendCount; i++) {

            Map<String, Object> rowData = (HashMap)sendInfoList.get(i);

            callParams.put("P_SEND_DATE", rowData.get("SEND_DATE"));
            callParams.put("P_SEND_NO", rowData.get("SEND_NO"));

            try {
              resultMap = (HashMap<String, Object>)createFileProcessingFn.invoke(this, callParams);
              oMsg = (String)resultMap.get(Consts.PK_O_MSG);
              if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
              }
            } catch (Exception e) {
              logger.error("EDCOMMON[sendProcessing] Send[A] Error", e);
              // 파일 생성 오류시 다음 송신번호 처리
              continue;
            }

            // 서버에 생성된 파일명
            Object SEND_DOCUMENT = resultMap.get("O_DOCUMENT");
            String SEND_FILE_NM = (String)resultMap.get("O_SEND_FILE_FULL_NM");
            String BACKUP_FILE_NM = (String)resultMap.get("O_BACKUP_FILE_FULL_NM");

            // 파일 정상 송신시 송신 파일명 업데이트
            callParams.put("P_FILE_NM", FilenameUtils.getName(SEND_FILE_NM));

            ts = transactionManager.getTransaction(dtd);
            try {
              resultMap = edCommonDAO.callSP(ES_FILE_NM_UPDATE_ID, callParams);
              oMsg = (String)resultMap.get(Consts.PK_O_MSG);
              if (!Consts.OK.equals(oMsg)) {
                throw new RuntimeException(oMsg);
              }

              // 송신 파일명이 정상 업데이트 되었을 경우 파일 송신 처리
              callParams.remove("P_FILE_NM");
              // 파일 수신 처리, FTP를 통한 처리, 접속정보 Validation은 TaskManagerService에서 처리
              if (Consts.REMOTE_DIV_FTP.equals(REMOTE_DIV) || Consts.REMOTE_DIV_SFTP.equals(REMOTE_DIV)) {
                // FTP 파일 송신
                String[ ] SEND_FILES = new String[ ] {SEND_FILE_NM};
                edCommonDAO.ftpUpload(REMOTE_DIV, REMOTE_IP, REMOTE_PORT, REMOTE_CHARSET, REMOTE_PASSIVE_YN,
                  REMOTE_USER_ID, REMOTE_USER_PWD, REMOTE_DIR, SEND_FILES, EDI_SEND_BACKUPPATH);
              } else {
                // WS 파일 송신
                callParams.put("P_DOCUMENT", SEND_DOCUMENT);

                // 송신 파일 백업
                File sendFile = new File(SEND_FILE_NM);
                Util.renameFile(sendFile, new File(BACKUP_FILE_NM));

                oMsg = taskSendWebService(callParams);
                if (!Consts.OK.equals(oMsg)) {
                  throw new RuntimeException(oMsg);
                }
              }
              transactionManager.commit(ts);
            } catch (Exception e) {
              transactionManager.rollback(ts);
              logger.error("EDCOMMON[sendProcessing] Send[D] Error", e);
            }
          }
        } else {
          throw new RuntimeException("송신 대상이 없습니다.");
        }
      }
    } catch (Exception e) {
      result = "[사업부,구분,정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO + "]"
        + Util.getNull(e.getMessage(), "").replaceAll("\n", " ");
    }

    return result;
  }

  public String realtimeSendProcessing() {

    HashMap<String, Object> callParams = new HashMap<String, Object>();

    callParams.put("P_BU_CD", "");
    callParams.put("P_EDI_DIV", "");
    callParams.put("P_DEFINE_NO", "");
    callParams.put("P_SEND_DATE", "");
    // 1 - TASKSCHEDULER(ES<TABLE>), 2 - REALTIME(CTCHECKVALUE)
    callParams.put("P_SEND_DIV", "2");

    return realtimeSendProcessing(callParams);
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  public String realtimeSendProcessing(Map<String, Object> params) {

    String result = Consts.OK;

    try {
      HashMap<String, Object> callParams = new HashMap<String, Object>();

      callParams.put("P_BU_CD", params.get("P_BU_CD"));
      callParams.put("P_EDI_DIV", params.get("P_EDI_DIV"));
      callParams.put("P_DEFINE_NO", params.get("P_DEFINE_NO"));
      callParams.put("P_SEND_DATE", params.get("P_SEND_DATE"));
      // 1 - TASKSCHEDULER(ES<TABLE>), 2 - REALTIME(CTCHECKVALUE)
      callParams.put("P_SEND_DIV", params.get("P_SEND_DIV"));

      // EDI 테이블에서 정상처리 후 미송신된 송신일자/송신번호 정보 가져오기
      List sendInfoList = edCommonDAO.getSendInfo(callParams);
      if (sendInfoList == null || sendInfoList.size() == 0) {
        // throw new RuntimeException("송신 대상 정보가 존재하지 않습니다.");
        return result;
      }

      final String SEND_DETAIL_INFO_ID = "EDCOMMON.RS_SEND_DETAIL_INFO";
      final String ES_FILE_NM_UPDATE_ID = "ES_FILE_NM_UPDATE";
      final String CREATE_FILE_METHOD_NM_PREFIX = "createFileProcessing_";
      HashMap<String, Object> resultMap = null;

      String WEB_ROOT_PATH = edCommonDAO.getGlobalProperty("webapp.root");
      String EDI_SEND_PATH = edCommonDAO.getGlobalProperty("ediSendRoot");
      String SITE_CD = Util.getNull(edSender.getTaskProperty("EDI.SITE_CD"), Consts.SITE_CD_STANDARD);
      String EDI_SEND_DATETIME = Util.getNowDate("yyyyMMddHHmmss");
      String oMsg;

      // SITE별 파일 생성 처리
      Method createFileProcessingFn = this.getClass().getMethod(CREATE_FILE_METHOD_NM_PREFIX + SITE_CD, Map.class);

      callParams.clear();
      // 송신번호별로 파일 생성/송신 처리
      for (int i = 0, sendCount = sendInfoList.size(); i < sendCount; i++) {
        Map<String, Object> rowParams = Util.dataMapToParamMap((HashMap)sendInfoList.get(i));

        String BU_CD = (String)rowParams.get("P_BU_CD");
        String EDI_DIV = (String)rowParams.get("P_EDI_DIV");
        String DEFINE_NO = (String)rowParams.get("P_DEFINE_NO");
        String DATA_DIV = (String)rowParams.get("P_DATA_DIV");
        String SEND_DATE = (String)rowParams.get("P_SEND_DATE");
        String SEND_NO = (String)rowParams.get("P_SEND_NO");
        String USER_ID = (String)rowParams.get("P_USER_ID");
        String PREFIX_FILE_NM = (String)rowParams.get("P_PREFIX_FILE_NM");

        // 파일 송신을 위한 기본 처리
        String EDI_DIR = (String)rowParams.get("P_EDI_DIR");
        if (Util.isNull(EDI_DIR)) {
          EDI_DIR = EDI_DIV + File.separator;
        }

        String EDI_SEND_FULLPATH = Util.getPathName(WEB_ROOT_PATH, EDI_SEND_PATH, EDI_DIR);
        String EDI_SEND_BACKUPPATH = Util.getPathName(EDI_SEND_FULLPATH, Consts.BACKUP_DIR,
          EDI_SEND_DATETIME.substring(0, 8));

        Util.createDir(EDI_SEND_FULLPATH, EDI_SEND_BACKUPPATH);

        // 송신 원격 정보
        String REMOTE_DIV = (String)rowParams.get("P_REMOTE_DIV");
        String REMOTE_IP = (String)rowParams.get("P_REMOTE_IP");
        String REMOTE_PORT = (String)rowParams.get("P_REMOTE_PORT");
        String REMOTE_CHARSET = (String)rowParams.get("P_REMOTE_CHARSET");
        String REMOTE_PASSIVE_YN = (String)rowParams.get("P_REMOTE_PASSIVE_YN");
        String REMOTE_USER_ID = (String)rowParams.get("P_REMOTE_USER_ID");
        String REMOTE_USER_PWD = (String)rowParams.get("P_REMOTE_USER_PWD");
        String REMOTE_DIR = (String)rowParams.get("P_REMOTE_DIR");

        String WEBSERVICE_URL = (String)rowParams.get("P_WEBSERVICE_URL");
        String WEBSERVICE_METHOD = (String)rowParams.get("P_WEBSERVICE_METHOD");

        // 파라메터 세팅
        callParams.put("P_BU_CD", BU_CD);
        callParams.put("P_EDI_DIV", EDI_DIV);
        callParams.put("P_DEFINE_NO", DEFINE_NO);
        callParams.put("P_DATA_DIV", DATA_DIV);
        callParams.put("P_SEND_DATE", SEND_DATE);
        callParams.put("P_SEND_NO", SEND_NO);
        callParams.put("P_SITE_CD", SITE_CD);
        callParams.put("P_USER_ID", USER_ID);

        if (Consts.REMOTE_DIV_FTP.equals(REMOTE_DIV) || Consts.REMOTE_DIV_SFTP.equals(REMOTE_DIV)) {
          callParams.put("P_FILE_DIV", Consts.FILE_DIV_SERVER);
        } else {
          callParams.put("P_FILE_DIV", Consts.FILE_DIV_DOC);

          callParams.put("P_WEBSERVICE_URL", WEBSERVICE_URL);
          callParams.put("P_WEBSERVICE_METHOD", WEBSERVICE_METHOD);
          callParams.put("P_REMOTE_USER_ID", REMOTE_USER_ID);
          callParams.put("P_REMOTE_USER_PWD", REMOTE_USER_PWD);
        }
        callParams.put("P_FILE_DIR", EDI_SEND_FULLPATH);
        callParams.put("P_QUERY_ID", SEND_DETAIL_INFO_ID);
        callParams.put("P_PREFIX_FILE_NM", PREFIX_FILE_NM);

        resultMap = (HashMap<String, Object>)createFileProcessingFn.invoke(this, callParams);
        oMsg = (String)resultMap.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }

        // 서버에 생성된 파일명
        Object SEND_DOCUMENT = resultMap.get("O_DOCUMENT");
        String SEND_FILE_NM = (String)resultMap.get("O_SEND_FILE_FULL_NM");
        String BACKUP_FILE_NM = (String)resultMap.get("O_BACKUP_FILE_FULL_NM");

        // 파일 정상 송신시 송신 파일명 업데이트
        callParams.put("P_FILE_NM", FilenameUtils.getName(SEND_FILE_NM));

        resultMap = edCommonDAO.callSP(ES_FILE_NM_UPDATE_ID, callParams);
        oMsg = (String)resultMap.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }

        // 송신 파일명이 정상 업데이트 되었을 경우 파일 송신 처리
        callParams.remove("P_FILE_NM");

        // 파일 수신 처리, FTP를 통한 처리, 접속정보 Validation은 TaskManagerService에서 처리
        if (Consts.REMOTE_DIV_FTP.equals(REMOTE_DIV) || Consts.REMOTE_DIV_SFTP.equals(REMOTE_DIV)) {
          // FTP 파일 송신
          String[ ] SEND_FILES = new String[ ] {SEND_FILE_NM};
          edCommonDAO.ftpUpload(REMOTE_DIV, REMOTE_IP, REMOTE_PORT, REMOTE_CHARSET, REMOTE_PASSIVE_YN, REMOTE_USER_ID,
            REMOTE_USER_PWD, REMOTE_DIR, SEND_FILES, EDI_SEND_BACKUPPATH);
        } else {
          // WS 파일 송신
          callParams.put("P_DOCUMENT", SEND_DOCUMENT);

          // 송신 파일 백업
          File sendFile = new File(SEND_FILE_NM);
          Util.renameFile(sendFile, new File(BACKUP_FILE_NM));

          oMsg = taskSendWebService(callParams);
          if (!Consts.OK.equals(oMsg)) {
            throw new RuntimeException(oMsg);
          }
        }
      }
    } catch (Exception e) {
      result = "데이터 송신 중 오류가 발생했습니다.\n" + Util.getNull(e.getMessage(), "Null Pointer Exception");
      logger.error("EDCOMMON[realtimeSendProcessing] Error ", e);
    }

    return result;
  }

  public HashMap<String, Object> createFileProcessing_0000(Map<String, Object> params) throws Exception {

    HashMap<String, Object> resultMap = null;

    String DATA_DIV = (String)params.get("P_DATA_DIV");

    if (Consts.DATA_DIV_XLS.equals(DATA_DIV)) {
      resultMap = edCommonDAO.sendExcel(params);
    } else if (Consts.DATA_DIV_TXT.equals(DATA_DIV)) {
      resultMap = edCommonDAO.sendText(params);
    } else {
      resultMap = edCommonDAO.sendXML(params);
    }

    return resultMap;
  }

  public HashMap<String, Object> createFileProcessing_0010(Map<String, Object> params) throws Exception {

    HashMap<String, Object> resultMap = null;

    final String EDI_DIV_ESLOORDER = "SLO10"; // 출고확정

    String EDI_DIV = (String)params.get("P_EDI_DIV");
    String DATA_DIV = (String)params.get("P_DATA_DIV");

    if (Consts.DATA_DIV_XLS.equals(DATA_DIV)) {
      resultMap = edCommonDAO.sendExcel(params);
    } else if (Consts.DATA_DIV_TXT.equals(DATA_DIV)) {
      resultMap = edCommonDAO.sendText(params);
    } else {
      if (EDI_DIV_ESLOORDER.equals(EDI_DIV)) {
        resultMap = edCommonDAO.sendESLOOrder_0010(params);
      } else {
        resultMap = edCommonDAO.sendXML(params);
      }
    }
    return resultMap;
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  public void errorProcessing(Map<String, Object> params) {

    HashMap<String, Object> callParams = new HashMap<String, Object>();

    String BU_CD = (String)params.get("P_BU_CD");
    String EDI_DIV = (String)params.get("P_EDI_DIV");
    String DEFINE_NO = (String)params.get("P_DEFINE_NO");
    String DEFINE_DIV = (String)params.get("P_DEFINE_DIV");
    // String DATA_DIV = (String)params.get("P_DATA_DIV");
    String EDI_DATE = (String)params.get("P_EDI_DATE");
    String USER_ID = (String)params.get("P_USER_ID");
    String PROCESSING_ID = null;

    callParams.put("P_BU_CD", BU_CD);
    callParams.put("P_EDI_DIV", EDI_DIV);
    callParams.put("P_DEFINE_NO", DEFINE_NO);
    callParams.put("P_EDI_DATE", EDI_DATE);

    // 오류 송신 정보 가져오기
    List errorInfoList = edCommonDAO.getErrorInfo(callParams);
    if (errorInfoList == null || errorInfoList.size() == 0) {
      return;
    }

    callParams.remove("P_EDI_DATE");
    HashMap<String, Object> resultMap = null;
    String oMsg = null;

    DefaultTransactionDefinition dtd = new DefaultTransactionDefinition();

    callParams.put("P_USER_ID", USER_ID);
    callParams.put("P_INOUT_DATE", "");
    callParams.put("P_CENTER_CD", "");

    // 송신번호별 [ER|ES]_PROCESSING 호출
    for (int i = 0, listCount = errorInfoList.size(); i < listCount; i++) {
      Map<String, Object> rowData = (HashMap)errorInfoList.get(i);

      if (Consts.DEFINE_DIV_RECV.equals(DEFINE_DIV)) {
        callParams.put("P_RECV_DATE", rowData.get("RECV_DATE"));
        callParams.put("P_RECV_NO", rowData.get("RECV_NO"));
        callParams.remove("P_SEND_DATE");
        callParams.remove("P_SEND_NO");

        PROCESSING_ID = ER_PROCESSING_ID;
      } else {
        callParams.put("P_SEND_DATE", rowData.get("SEND_DATE"));
        callParams.put("P_SEND_NO", rowData.get("SEND_NO"));
        callParams.remove("P_RECV_DATE");
        callParams.remove("P_RECV_NO");

        PROCESSING_ID = ES_PROCESSING_ID;
      }
      callParams.put("P_PROCESS_CD", rowData.get("PROCESS_CD"));

      TransactionStatus ts = transactionManager.getTransaction(dtd);
      try {
        resultMap = edCommonDAO.callSP(PROCESSING_ID, callParams);
        oMsg = (String)resultMap.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
        transactionManager.commit(ts);
      } catch (Exception e) {
        transactionManager.rollback(ts);
        logger.error("EDCOMMON[errorProcessing] Error ", e);
      }
    }
  }

  private String taskSendWebService(Map<String, Object> params) throws Exception {

    String result = Consts.OK;

    result = edSender.sendProcessing(params);
    if (Consts.SUCCESS.equalsIgnoreCase(result) || Consts.SUCCESSFUL.equalsIgnoreCase(result)) {
      result = Consts.OK;
    } else {
      if (result == null) {
        result = Consts.ERROR;
      } else {
        if (result.toLowerCase().contains("code=\"0\"")) {
          result = Consts.OK;
        }
      }
    }

    return result;
  }

  private void updateLastExecTime(Map<String, Object> params) {

    final String EM_LAST_EXEC_TIME_UPDATE_ID = "EM_LAST_EXEC_TIME_UPDATE";

    HashMap<String, Object> callParams = new HashMap<String, Object>();

    String BU_CD = (String)params.get("P_BU_CD");
    String EDI_DIV = (String)params.get("P_EDI_DIV");
    String DEFINE_DIV = (String)params.get("P_DEFINE_DIV");
    String USER_ID = (String)params.get("P_USER_ID");

    callParams.put("P_BU_CD", BU_CD);
    callParams.put("P_EDI_DIV", EDI_DIV);
    callParams.put("P_DEFINE_DIV", DEFINE_DIV);
    callParams.put("P_USER_ID", USER_ID);

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      HashMap<String, Object> resultMap = edCommonDAO.callSP(EM_LAST_EXEC_TIME_UPDATE_ID, params);
      String oMsg = (String)resultMap.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      transactionManager.commit(ts);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      logger.error("EDCOMMON[updateLastExecTime] Error", e);
    }
  }
}
