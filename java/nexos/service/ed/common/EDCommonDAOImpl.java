package nexos.service.ed.common;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.nio.ByteBuffer;
import java.nio.charset.Charset;
import java.nio.charset.CharsetDecoder;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.Vector;

import javax.annotation.Resource;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import nexos.common.Consts;
import nexos.common.Util;
import nexos.common.ibatis.NexosDAO;

import org.apache.axis.message.MessageElement;
import org.apache.axis.utils.XMLUtils;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPReply;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFDataFormat;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFRichTextString;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.util.HSSFColor;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import com.jcraft.jsch.Channel;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;

/**
 * Class: EDCommonDAOImpl<br>
 * Description: EDI Common DAO (Data Access Object) - 데이터처리를 담당하는 Class<br>
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
@SuppressWarnings("rawtypes")
@Repository("EDCOMMONDAO")
@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
// 주입되는 Bean id 역활을 합니다. 구현 클라스에 따라서 이 부분을 주석처리합니다.
public class EDCommonDAOImpl implements EDCommonDAO, Comparator<Vector<Object>> {

  private final Logger logger = LoggerFactory.getLogger(EDCommonDAOImpl.class);

  @Resource
  private NexosDAO     nexosDAO;

  @Resource
  private Properties   globalProps;

  @Override
  public HashMap<String, Object> callSP(String queryId, Map<String, Object> params) {

    return nexosDAO.callSP(queryId, params);
  }

  @Override
  public int compare(Vector<Object> o1, Vector<Object> o2) {
    return (Integer)o1.get(1) > (Integer)o2.get(1) ? 1 : 0;
  }

  private Charset detectCharset(File f, Charset charset) {

    BufferedInputStream bufferedInput = null;
    try {
      bufferedInput = new BufferedInputStream(new FileInputStream(f));
      CharsetDecoder decoder = charset.newDecoder();
      decoder.reset();

      byte[ ] tempBuffer = new byte[8192];
      byte[ ] buffer = null;

      // 파일에서 8192 byte만 읽음
      bufferedInput.read(tempBuffer);

      // 읽은 데이터에서 1 라인만 체크하기 위해 1라인만 추출
      int bufferLen = tempBuffer.length - 1;
      for (int i = 0; i < bufferLen; i++) {
        if (tempBuffer[i] == 13 || tempBuffer[i] == 10) {
          buffer = new byte[i];
          System.arraycopy(tempBuffer, 0, buffer, 0, i);
          break;
        }
      }
      // 체크
      if (identify(buffer, decoder)) {
        return charset;
      } else {
        return null;
      }
    } catch (Exception e) {
      return null;
    } finally {
      try {
        if (bufferedInput != null) {
          bufferedInput.close();
        }
      } catch (Exception e) {
        logger.error(e.getMessage());
      }
    }
  }

  private Charset detectCharset(File f, String[ ] charsets) {
    Charset charset = null;
    for (String charsetName : charsets) {
      charset = detectCharset(f, Charset.forName(charsetName));
      if (charset != null) {
        break;
      }
    }
    return charset;
  }

  @Override
  public void ftpDownload(String remoteType, String remoteIP, String remotePort, String remoteCharset,
    String remotePassiveYN, String remoteUserID, String remoteUserPwd, String remoteDir, String prefixFileNm,
    String ediDir) throws Exception {
    // remoteType >> 1 - FTP, 3 - SFTP
    if ("1".equals(remoteType)) {
      FTPClient ftpClient = null;
      try {
        ftpClient = new FTPClient();
        ftpClient.setControlEncoding(Util.getNull(remoteCharset, Consts.CHARSET));

        ftpClient.connect(remoteIP, Integer.parseInt(remotePort));
        if (!FTPReply.isPositiveCompletion(ftpClient.getReplyCode())) {
          throw new RuntimeException("FTP 서버에 접속할 수 없습니다. 원격 접속정보를 확인하십시오.");
        }

        ftpClient.setSoTimeout(60000);
        ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
        ftpClient.login(remoteUserID, remoteUserPwd);
        if (Consts.YES.equals(remotePassiveYN)) {
          ftpClient.enterLocalPassiveMode();
        }
        if (!ftpClient.changeWorkingDirectory(remoteDir)) {
          throw new RuntimeException("[" + remoteDir + "]원격 파일경로가 FTP서버에 존재하지 않습니다.");
        }

        String[ ] ftpEDIFiles = ftpClient.listNames();
        int ftpEDIFileCount = 0;
        if (ftpEDIFiles != null) {
          ftpEDIFileCount = ftpEDIFiles.length;
        }
        if (ftpEDIFileCount == 0) {
          throw new RuntimeException("[" + remoteDir + "]FTP서버에 수신할 파일이 존재하지 않습니다.");
        }
        String ftpFileName = null;
        File fileDownload = null;
        FileOutputStream fosDownload = null;
        for (int i = 0; i < ftpEDIFileCount; i++) {
          try {
            ftpFileName = ftpEDIFiles[i];
            if (prefixFileNm != null) {
              if (!ftpFileName.startsWith(prefixFileNm)) {
                continue;
              }
            }
            fileDownload = new File(ediDir + ftpFileName);
            fosDownload = new FileOutputStream(fileDownload);

            logger
              .info("EDCommonDAOImpl[ftpDownload] File download : " + ftpFileName + " >> " + fileDownload.getName());
            if (ftpClient.retrieveFile(ftpFileName, fosDownload)) {
              if (!ftpClient.deleteFile(ftpFileName)) {
                logger.error("EDCommonDAOImpl[ftpDownload] Download Error : " + ftpFileName);
                fileDownload.delete();
              }
            } else {
              logger.error("EDCommonDAOImpl[ftpDownload] Download Error : " + ftpFileName);
            }
          } catch (Exception e) {
            logger.error("EDCommonDAOImpl[ftpDownload] Error", e);
          } finally {
            if (fosDownload != null) {
              try {
                fosDownload.close();
              } catch (Exception e) {
              }
            }
          }
        }
      } catch (Exception e) {
        throw new RuntimeException(e.getMessage());
      } finally {
        if (ftpClient != null && ftpClient.isConnected()) {
          try {
            ftpClient.logout();
            ftpClient.disconnect();
          } catch (Exception e) {
          }
        }
      }
    } else {

      Session sftpSession = null;
      Channel sftpChannel = null;
      ChannelSftp sftpClient = null;

      JSch jsch = new JSch();
      try {
        sftpSession = jsch.getSession(remoteUserID, remoteIP, Integer.parseInt(remotePort));
        sftpSession.setPassword(remoteUserPwd);

        java.util.Properties config = new java.util.Properties();
        config.put("StrictHostKeyChecking", "no");
        sftpSession.setConfig(config);
        sftpSession.connect();
        sftpSession.setTimeout(60000);

        sftpChannel = sftpSession.openChannel("sftp");
        sftpChannel.connect();

        sftpClient = (ChannelSftp)sftpChannel;

        try {
          sftpClient.cd(remoteDir);
        } catch (Exception e) {
          throw new RuntimeException("[" + remoteDir + "]원격 파일경로가 FTP서버에 존재하지 않습니다.");
        }

        Vector ftpEDIFiles = sftpClient.ls("*");
        int ftpEDIFileCount = ftpEDIFiles.size();
        if (ftpEDIFileCount == 0) {
          throw new RuntimeException("[" + remoteDir + "]FTP서버에 수신할 파일이 존재하지 않습니다.");
        }

        String ftpFileName = null;
        File fileDownload = null;
        InputStream isFtpFile = null;
        FileOutputStream fosDownload = null;
        for (int i = 0; i < ftpEDIFileCount; i++) {
          ChannelSftp.LsEntry ftpEDIFile = (ChannelSftp.LsEntry)ftpEDIFiles.get(i);
          if (ftpEDIFile.getAttrs().isDir()) {
            continue;
          }
          ftpFileName = ftpEDIFile.getFilename();
          if (prefixFileNm != null) {
            if (!ftpFileName.startsWith(prefixFileNm)) {
              continue;
            }
          }

          fileDownload = new File(ediDir + ftpFileName);
          logger.info("EDCommonDAOImpl[ftpDownload] File download : " + ftpFileName + " >> " + fileDownload.getName());

          try {
            isFtpFile = sftpClient.get(ftpFileName);

            fosDownload = new FileOutputStream(fileDownload);
            int readLen;
            byte[ ] readBytes = new byte[8192];
            while ((readLen = isFtpFile.read(readBytes)) != -1) {
              fosDownload.write(readBytes, 0, readLen);
            }
            fosDownload.flush();
            try {
              sftpClient.rm(ftpFileName);
            } catch (Exception e) {
              logger.error("EDCommonDAOImpl[ftpDownload] Delete file Error : " + ftpFileName);
              fileDownload.delete();
            } finally {
              if (isFtpFile != null) {
                try {
                  isFtpFile.close();
                } catch (Exception ex) {
                } finally {
                  isFtpFile = null;
                }
              }
              if (fosDownload != null) {
                try {
                  fosDownload.close();
                } catch (Exception ex) {
                } finally {
                  fosDownload = null;
                }
              }
            }
          } catch (Exception e) {
            logger.error("EDCommonDAOImpl[ftpDownload] Download Error : " + ftpFileName);
            continue;
          } finally {
            if (isFtpFile != null) {
              try {
                isFtpFile.close();
              } catch (Exception e) {
              } finally {
                isFtpFile = null;
              }
            }
            if (fosDownload != null) {
              try {
                fosDownload.close();
              } catch (Exception e) {
              } finally {
                fosDownload = null;
              }
            }
          }
        }
      } catch (Exception e) {
        throw new RuntimeException(e.getMessage());
      } finally {
        if (sftpClient != null && sftpClient.isConnected()) {
          try {
            sftpClient.quit();
          } catch (Exception e) {
          }
        }
        if (sftpChannel != null && sftpChannel.isConnected()) {
          try {
            sftpChannel.disconnect();
          } catch (Exception e) {
          }
        }
        if (sftpSession != null && sftpSession.isConnected()) {
          try {
            sftpSession.disconnect();
          } catch (Exception e) {
          }
        }
      }
    }
  }

  @Override
  public void ftpUpload(String remoteType, String remoteIP, String remotePort, String remoteCharset,
    String remotePassiveYN, String remoteUserID, String remoteUserPwd, String remoteDir, String[ ] ediFiles,
    String backupDir) throws Exception {

    // remoteType >> 1 - FTP, 3 - SFTP
    if ("1".equals(remoteType)) {
      FTPClient ftpClient = null;
      try {
        ftpClient = new FTPClient();
        ftpClient.setControlEncoding(Util.getNull(remoteCharset, Consts.CHARSET));

        ftpClient.connect(remoteIP, Integer.parseInt(remotePort));
        if (!FTPReply.isPositiveCompletion(ftpClient.getReplyCode())) {
          throw new RuntimeException("FTP 서버에 접속할 수 없습니다. 원격 접속정보를 확인하십시오.");
        }
        ftpClient.setSoTimeout(60000);
        ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
        ftpClient.login(remoteUserID, remoteUserPwd);
        if (Consts.YES.equals(remotePassiveYN)) {
          ftpClient.enterLocalPassiveMode();
        }
        if (!ftpClient.changeWorkingDirectory(remoteDir)) {
          throw new RuntimeException("[" + remoteDir + "]원격 파일경로가 FTP서버에 존재하지 않습니다.");
        }

        String ftpFileName = null;
        String uploadFileName = null;
        File fileUpload = null;
        FileInputStream fisUpload = null;

        for (int i = 0, fileCount = ediFiles.length; i < fileCount; i++) {
          try {
            uploadFileName = ediFiles[i];
            fileUpload = new File(uploadFileName);
            ftpFileName = FilenameUtils.getName(uploadFileName);
            fisUpload = new FileInputStream(fileUpload);
            if (!ftpClient.storeFile(ftpFileName, fisUpload)) {
              logger.error("EDCommonDAOImpl[ftpUpload] Upload Error : " + ftpFileName);
            }
            try {
              fisUpload.close();
            } catch (Exception e) {
            } finally {
              fisUpload = null;
            }
            Util.renameFile(fileUpload, new File(backupDir + ftpFileName));
          } catch (Exception e) {
            logger.error("EDCommonDAOImpl[ftpUpload] Error", e);
          } finally {
            if (fisUpload != null) {
              try {
                fisUpload.close();
              } catch (Exception e) {
              }
            }
          }
        }
      } catch (Exception e) {
        throw new RuntimeException(e.getMessage());
      } finally {
        if (ftpClient != null && ftpClient.isConnected()) {
          try {
            ftpClient.logout();
            ftpClient.disconnect();
          } catch (Exception e) {
          }
        }
      }
    } else {

      Session sftpSession = null;
      Channel sftpChannel = null;
      ChannelSftp sftpClient = null;

      JSch jsch = new JSch();
      try {
        sftpSession = jsch.getSession(remoteUserID, remoteIP, Integer.parseInt(remotePort));
        sftpSession.setPassword(remoteUserPwd);

        java.util.Properties config = new java.util.Properties();
        config.put("StrictHostKeyChecking", "no");
        sftpSession.setConfig(config);
        sftpSession.connect();
        sftpSession.setTimeout(60000);

        sftpChannel = sftpSession.openChannel("sftp");
        sftpChannel.connect();

        sftpClient = (ChannelSftp)sftpChannel;

        try {
          sftpClient.cd(remoteDir);
        } catch (Exception e) {
          throw new RuntimeException("[" + remoteDir + "]원격 파일경로가 FTP서버에 존재하지 않습니다.");
        }

        String ftpFileName = null;
        String uploadFileName = null;
        File fileUpload = null;
        FileInputStream fisUpload = null;
        for (int i = 0, fileCount = ediFiles.length; i < fileCount; i++) {
          uploadFileName = ediFiles[i];
          ftpFileName = FilenameUtils.getName(uploadFileName);
          fileUpload = new File(uploadFileName);
          fisUpload = new FileInputStream(fileUpload);
          try {
            sftpClient.put(fisUpload, ftpFileName);
          } catch (Exception e) {
            logger.error("EDCommonDAOImpl[ftpUpload] Upload Error : " + ftpFileName);
          } finally {
            if (fisUpload != null) {
              try {
                fisUpload.close();
              } catch (Exception e) {
              }
            }
            fisUpload = null;
          }
          Util.renameFile(fileUpload, new File(backupDir + ftpFileName));
        }
      } catch (Exception e) {
        throw new RuntimeException(e.getMessage());
      } finally {
        if (sftpClient != null && sftpClient.isConnected()) {
          try {
            sftpClient.quit();
          } catch (Exception e) {
          }
        }
        if (sftpChannel != null && sftpChannel.isConnected()) {
          try {
            sftpChannel.disconnect();
          } catch (Exception e) {
          }
        }
        if (sftpSession != null && sftpSession.isConnected()) {
          try {
            sftpSession.disconnect();
          } catch (Exception e) {
          }
        }
      }
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public String getEDIDate() throws Exception {

    String result;
    final String GET_SYSDATE_ID = "WC.GET_SYSDATE";
    List list = nexosDAO.list(GET_SYSDATE_ID);
    if (list == null || list.size() == 0) {
      SimpleDateFormat sdf = new SimpleDateFormat(Consts.DATE_FORMAT);
      result = sdf.format(System.currentTimeMillis());
    } else {
      Map<String, Object> rowData = (HashMap<String, Object>)list.get(0);
      result = (String)rowData.get("SYS_DATE");
    }

    return result;
  }

  @Override
  public List getErrorInfo(Map<String, Object> params) {

    final String RS_ERROR_INFO_ID = "EDCOMMON.RS_ERROR_INFO";

    return nexosDAO.list(RS_ERROR_INFO_ID, params);
  }

  @Override
  public String getGlobalProperty(String key) {

    return globalProps.getProperty(key);
  }

  @Override
  public HashMap<String, Object> getRecvNo(Map<String, Object> params) {

    final String ER_RECV_GETNO_ID = "WT.ER_RECV_GETNO";

    return nexosDAO.callSP(ER_RECV_GETNO_ID, params);
  }

  @Override
  public List getRecvResultInfo(Map<String, Object> params) {

    final String RS_RECV_RESULT_INFO_ID = "EDCOMMON.RS_RECV_RESULT_INFO";

    return nexosDAO.list(RS_RECV_RESULT_INFO_ID, params);
  }

  @Override
  public List getSendDetailInfo(Map<String, Object> params) {

    final String RS_SEND_DETAIL_INFO_ID = "EDCOMMON.RS_SEND_DETAIL_INFO";

    return nexosDAO.list(RS_SEND_DETAIL_INFO_ID, params);
  }

  @Override
  public List getSendInfo(Map<String, Object> params) {

    final String RS_SEND_INFO_ID = "EDCOMMON.RS_SEND_INFO";

    return nexosDAO.list(RS_SEND_INFO_ID, params);
  }

  private int getXLSColumnIndex(String columnName) {

    columnName = columnName.toUpperCase();
    short value = 0;
    for (int i = 0, k = columnName.length() - 1; i < columnName.length(); i++, k--) {
      int alpabetIndex = (short)columnName.charAt(i) - 64;
      int delta = 0;
      if (k == 0) {
        delta = alpabetIndex - 1;
      } else {
        if (alpabetIndex == 0) {
          delta = 26 * k;
        } else {
          delta = alpabetIndex * 26 * k;
        }
      }
      value += delta;
    }
    return value;
  }

  private String getXMLColumnValue(Vector<Object> vtColumn, Element xmlDataElement) throws Exception {

    String result = "";

    // String COLUMN_NM = (String)vtColumn.get(0);
    // String xmlTag = (String)vtColumn.get(1);
    String xmlTagAttr = (String)vtColumn.get(2);
    String[ ] xmlTags = (String[ ])vtColumn.get(3);

    NodeList xmlColumnNodeList = null;
    Element xmlColumnElement = xmlDataElement;
    Node xmlColumnNode = null;
    for (int i = 0, nodeLevel = xmlTags.length; i < nodeLevel; i++) {
      xmlColumnNodeList = xmlColumnElement.getElementsByTagName(xmlTags[i]);
      if (xmlColumnNodeList.getLength() == 0) {
        // throw new RuntimeException("[컬럼명,태그명: " + COLUMN_NM + "," + xmlTag + "]XML 파일에 해당 태그가 정의되어 있지 않습니다.");
        return result;
      }
      xmlColumnNode = xmlColumnNodeList.item(0);
      if (xmlColumnNode.getNodeType() != Node.ELEMENT_NODE) {
        // throw new RuntimeException("[컬럼명,태그명: " + COLUMN_NM + "," + xmlTag + "]XML 파일에 해당 태그가 정의되어 있지 않습니다.");
        return result;
      }
      xmlColumnElement = (Element)xmlColumnNode;
    }

    if (!Util.isNull(xmlTagAttr)) {
      if (!xmlColumnElement.hasAttribute(xmlTagAttr)) {
        // throw new RuntimeException("[컬럼명,태그명,속성명: " + COLUMN_NM + "," + xmlTag + "," + xmlTagAttr +
        // "]XML 파일에 해당 태그/속성이 정의되어 있지 않습니다.");
        return result;
      }
      // result = xmlColumnNode.getAttributes().getNamedItem(xmlTagAttr).getNodeValue();
      result = xmlColumnElement.getAttribute(xmlTagAttr);
      // logger.info("xmlTagAttr 1=" + result);
      // logger.info("xmlTagAttr 2=" + xmlColumnElement.getAttribute(xmlTagAttr));
    } else {
      // result = xmlColumnElement.getChildNodes().item(0).getNodeValue();
      result = xmlColumnElement.getTextContent();
      // logger.info("xmlTag 1=" + result);
      // logger.info("xmlTag 2=" + xmlColumnElement.getTextContent());
    }

    return result;
  }

  private boolean identify(byte[ ] bytes, CharsetDecoder decoder) {
    try {
      decoder.decode(ByteBuffer.wrap(bytes));
    } catch (Exception e) {
      return false;
    }
    return true;
  }

  @Override
  public HashMap<String, Object> recvDBLink(Map<String, Object> params) throws Exception {

    final String ER_PROCESSING_ID_ID = "ER_PROCESSING";

    return nexosDAO.callSP(ER_PROCESSING_ID_ID, params);
  }

  @SuppressWarnings("unchecked")
  @Override
  public HashMap<String, Object> recvExcel(Map<String, Object> params) throws Exception {

    HashMap<String, Object> resultMap = new HashMap<String, Object>();

    final String DEFINE_INFO_ID = "EDCOMMON.RS_DEFINE_INFO";
    // 수신정의 상세내역 쿼리 파라메터 값 읽기

    // upload dir로 edi 파일 수신
    String ediRecvFileBackupFullName = null;
    File ediRecvFile = null;
    FileInputStream xlsFileInput = null;
    POIFSFileSystem xlsFile = null;

    XSSFWorkbook xlsxWorkbook = null;
    XSSFSheet xlsxSheet = null;
    XSSFRow xlsxRow = null;
    XSSFCell xlsxCell = null;

    HSSFWorkbook xlsWorkbook = null;
    HSSFSheet xlsSheet = null;
    HSSFRow xlsRow = null;
    HSSFCell xlsCell = null;
    try {
      String BU_CD = (String)params.get("P_BU_CD");
      String EDI_DIV = (String)params.get("P_EDI_DIV");
      String DEFINE_NO = (String)params.get("P_DEFINE_NO");
      String FILE_DIV = (String)params.get("P_FILE_DIV");

      // 수신정의 상세내역 데이터 쿼리
      List list = nexosDAO.list(DEFINE_INFO_ID, params);
      if (list == null || list.size() == 0) {
        throw new RuntimeException("[사업부,수신구분,수신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\n수신정의 내역이 등록되어 있지 않습니다.");
      }

      // 수신번호 채번
      Map<String, Object> mapGetRecvNo = getRecvNo(params);

      String oMsg = (String)mapGetRecvNo.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      String RECV_NO = (String)mapGetRecvNo.get("O_RECV_NO");
      params.put("P_RECV_NO", RECV_NO);

      // 나머지 파라메터 값 읽기
      String USER_ID = (String)params.get(Consts.PK_USER_ID);
      String RECV_DATE = (String)params.get("P_RECV_DATE");
      String WEB_ROOT_PATH = getGlobalProperty("webapp.root");
      String EDI_RECV_PATH = getGlobalProperty("ediRecvRoot");
      String EDI_RECV_FULLPATH = Util.getPathName(WEB_ROOT_PATH, EDI_RECV_PATH, EDI_DIV);

      CommonsMultipartFile ediUploadMultipartFile = null;
      String ediRecvFileName = null;
      String ediRecvFileFullName = null;
      String ediRecvFileBackupPath = null;
      String ediRecvDatetime = Util.getNowDate("yyyyMMddHHmmss");

      if (Consts.FILE_DIV_ATTACHMENT.equals(FILE_DIV)) {
        // Browser에서 파일 업로드
        ediUploadMultipartFile = (CommonsMultipartFile)params.get("P_UPLOAD_FILE");
        ediRecvFileName = USER_ID + "_" + ediRecvDatetime + "_"
          + ediUploadMultipartFile.getOriginalFilename().replaceAll(" ", "_");
      } else if (Consts.FILE_DIV_SERVER.equals(FILE_DIV)) {
        // 서버에 업로드된 파일
        EDI_RECV_FULLPATH = (String)params.get("P_FILE_DIR");
        ediRecvFileName = (String)params.get("P_FILE_NM");
      } else {
        throw new RuntimeException("[사업부,수신구분,수신정의번호,파일유형: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO + "," + FILE_DIV
          + "]\n처리할 수 없는 파일유형입니다.");
      }

      ediRecvFileFullName = EDI_RECV_FULLPATH + ediRecvFileName;
      ediRecvFileBackupPath = Util.getPathName(EDI_RECV_FULLPATH, Consts.BACKUP_DIR, ediRecvDatetime.substring(0, 8));
      ediRecvFileBackupFullName = ediRecvFileBackupPath + ediRecvFileName;

      // upload dir이 존재하지 않으면 생성
      Util.createDir(EDI_RECV_FULLPATH, ediRecvFileBackupPath);

      // resultMap 세팅
      resultMap.put("P_BU_CD", BU_CD);
      resultMap.put("P_EDI_DIV", EDI_DIV);
      resultMap.put("P_DEFINE_NO", DEFINE_NO);
      resultMap.put("P_RECV_DATE", RECV_DATE);
      resultMap.put("P_RECV_NO", RECV_NO);

      // 수신정의에서 기본 정보 읽기
      Map<String, Object> column = (HashMap<String, Object>)list.get(0);
      final String INSERT_ID = "EDCOMMON.INSERT_" + (String)column.get("TABLE_NM");
      Object objXlsFirstRow = column.get("XLS_FIRST_ROW");
      int xlsFirstRow = 0;
      if (objXlsFirstRow != null) {
        xlsFirstRow = ((Number)objXlsFirstRow).intValue() - 1;
      }

      int xlsCol;
      String xlsColumn_Nm = null;
      String xlsColumn_Val = null;
      String COLUMN_NM = null;

      // 실제 정의한 컬럼만 추출
      Vector<Object> vtColumn;
      int columnCnt = list.size();
      ArrayList<Vector<Object>> columns = new ArrayList<Vector<Object>>();
      for (int i = 0; i < columnCnt; i++) {
        column = (HashMap<String, Object>)list.get(i);
        try {
          COLUMN_NM = (String)column.get("COLUMN_NM");
          xlsColumn_Nm = (String)column.get("XLS_COLUMN_NM");

          if (!Util.isNull(xlsColumn_Nm) && !Util.isNull(COLUMN_NM)) {
            vtColumn = new Vector<Object>();
            vtColumn.add("P_" + COLUMN_NM);
            vtColumn.add(xlsColumn_Nm);
            vtColumn.add(getXLSColumnIndex(xlsColumn_Nm));
            columns.add(vtColumn);
          }
        } catch (Exception e) {
        }
      }
      columnCnt = columns.size();
      if (columnCnt == 0) {
        throw new RuntimeException("[사업부,수신구분,수신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\n수신정의 컬럼 중 처리 가능한 컬럼이 없습니다.");
      }

      ediRecvFile = new File(ediRecvFileFullName);
      if (Consts.FILE_DIV_ATTACHMENT.equals(FILE_DIV)) {
        try {
          ediUploadMultipartFile.transferTo(ediRecvFile);
        } catch (Exception e) {
          throw new RuntimeException("수신 처리할 파일을 전송하지 못했습니다.");
        }
      }

      // Excel 2007
      if (ediRecvFileFullName.toLowerCase().endsWith(".xlsx")) {
        try {
          xlsFileInput = new FileInputStream(ediRecvFileFullName);
          xlsxWorkbook = new XSSFWorkbook(xlsFileInput);
        } catch (Exception e) {
          throw new RuntimeException("엑셀 파일이 아닙니다. 엑셀 파일로 수신 처리하십시오.");
        }
        try {
          xlsxSheet = xlsxWorkbook.getSheetAt(0);
        } catch (Exception e) {
          throw new RuntimeException("엑셀 파일이 아닙니다. 엑셀 파일로 수신 처리하십시오.");
        }

        SimpleDateFormat stringDatetimeFormat = new SimpleDateFormat(Consts.DATETIME_FORMAT);
        NumberFormat stringNumberFormat = NumberFormat.getNumberInstance();
        stringNumberFormat.setGroupingUsed(false);
        int xlsRowCount = xlsxSheet.getPhysicalNumberOfRows();

        if (xlsFirstRow > xlsRowCount) {
          throw new RuntimeException("엑셀 파일에 처리할 데이터가 없습니다.[데이터건수:" + xlsRowCount + "][시작ROW:" + (xlsFirstRow + 1)
            + "]");
        }

        Map<String, Object> rowParams = new HashMap<String, Object>();
        // INSERT 기본 값 지정
        rowParams.put("P_BU_CD", BU_CD);
        rowParams.put("P_EDI_DIV", EDI_DIV);
        rowParams.put("P_DEFINE_NO", DEFINE_NO);
        rowParams.put("P_RECV_DATE", RECV_DATE);
        rowParams.put("P_RECV_NO", RECV_NO);
        rowParams.put("P_ERROR_DIV", "0"); // 오류구분 - 데이터입력 - 0
        rowParams.put("P_DATA_DIV", Consts.DATA_DIV_XLS); // 데이터처리유형 - EXCEL - 02
        rowParams.put("P_RECV_USER_ID", USER_ID);

        for (int row = xlsFirstRow; row < xlsRowCount; row++) {

          xlsxRow = xlsxSheet.getRow(row);
          if (xlsxRow == null) {
            throw new RuntimeException("엑셀 행이 비어있습니다. 확인 후 작업하십시오.");
          }
          for (int i = 0; i < columnCnt; i++) {
            vtColumn = columns.get(i);

            COLUMN_NM = (String)vtColumn.get(0);
            xlsColumn_Nm = (String)vtColumn.get(1);
            xlsCol = (Integer)vtColumn.get(2);

            // XLS 셀 값 읽기
            xlsColumn_Val = "";
            xlsxCell = xlsxRow.getCell(xlsCol);
            if (xlsxCell == null) {
              rowParams.put(COLUMN_NM, xlsColumn_Val);
            } else {
              switch (xlsxCell.getCellType()) {
              case XSSFCell.CELL_TYPE_FORMULA:
                switch (xlsxCell.getCachedFormulaResultType()) {
                case XSSFCell.CELL_TYPE_NUMERIC:
                  xlsColumn_Val = stringNumberFormat.format(xlsxCell.getNumericCellValue());
                  break;
                case XSSFCell.CELL_TYPE_STRING:
                  xlsColumn_Val = xlsxCell.getRichStringCellValue().getString().trim();
                  break;
                case XSSFCell.CELL_TYPE_BOOLEAN:
                  xlsColumn_Val = String.valueOf(xlsxCell.getBooleanCellValue());
                  break;
                }
                break;
              case XSSFCell.CELL_TYPE_NUMERIC:
                if (HSSFDateUtil.isCellDateFormatted(xlsxCell)) {
                  xlsColumn_Val = stringDatetimeFormat.format(xlsxCell.getDateCellValue());
                } else {
                  xlsColumn_Val = stringNumberFormat.format(xlsxCell.getNumericCellValue());
                }
                break;
              case XSSFCell.CELL_TYPE_STRING:
                xlsColumn_Val = xlsxCell.getRichStringCellValue().getString().trim();
                break;
              case XSSFCell.CELL_TYPE_BOOLEAN:
                xlsColumn_Val = String.valueOf(xlsxCell.getBooleanCellValue());
                break;
              case XSSFCell.CELL_TYPE_ERROR:
                xlsColumn_Val = String.valueOf(xlsxCell.getErrorCellValue());
                break;
              }
              rowParams.put(COLUMN_NM, xlsColumn_Val);
            }
          }

          rowParams.put("P_RECV_SEQ", row - xlsFirstRow + 1);
          nexosDAO.insert(INSERT_ID, rowParams);
        }
      } else {
        // Excel 2003 이하
        try {
          xlsFileInput = new FileInputStream(ediRecvFileFullName);
          xlsFile = new POIFSFileSystem(xlsFileInput);
          xlsWorkbook = new HSSFWorkbook(xlsFile);
        } catch (Exception e) {
          throw new RuntimeException("엑셀 파일이 아닙니다. 엑셀 파일로 수신 처리하십시오.");
        }
        try {
          xlsSheet = xlsWorkbook.getSheetAt(0);
        } catch (Exception e) {
          throw new RuntimeException("엑셀 파일이 아닙니다. 엑셀 파일로 수신 처리하십시오.");
        }

        SimpleDateFormat stringDatetimeFormat = new SimpleDateFormat(Consts.DATETIME_FORMAT);
        NumberFormat stringNumberFormat = NumberFormat.getNumberInstance();
        stringNumberFormat.setGroupingUsed(false);
        int xlsRowCount = xlsSheet.getPhysicalNumberOfRows();

        if (xlsFirstRow > xlsRowCount) {
          throw new RuntimeException("엑셀 파일에 처리할 데이터가 없습니다.[데이터건수:" + xlsRowCount + "][시작ROW:" + (xlsFirstRow + 1)
            + "]");
        }

        Map<String, Object> rowParams = new HashMap<String, Object>();
        // INSERT 기본 값 지정
        rowParams.put("P_BU_CD", BU_CD);
        rowParams.put("P_EDI_DIV", EDI_DIV);
        rowParams.put("P_DEFINE_NO", DEFINE_NO);
        rowParams.put("P_RECV_DATE", RECV_DATE);
        rowParams.put("P_RECV_NO", RECV_NO);
        rowParams.put("P_ERROR_DIV", "0"); // 오류구분 - 데이터입력 - 0
        rowParams.put("P_DATA_DIV", "02"); // 데이터처리유형 - EXCEL - 02
        rowParams.put("P_RECV_USER_ID", USER_ID);

        for (int row = xlsFirstRow; row < xlsRowCount; row++) {

          xlsRow = xlsSheet.getRow(row);
          if (xlsRow == null) {
            throw new RuntimeException("엑셀 행이 비어있습니다. 확인 후 작업하십시오.");
          }
          for (int i = 0; i < columnCnt; i++) {
            vtColumn = columns.get(i);

            COLUMN_NM = (String)vtColumn.get(0);
            xlsColumn_Nm = (String)vtColumn.get(1);
            xlsCol = (Integer)vtColumn.get(2);

            // XLS 셀 값 읽기
            xlsColumn_Val = "";
            xlsCell = xlsRow.getCell(xlsCol);
            if (xlsCell == null) {
              rowParams.put(COLUMN_NM, xlsColumn_Val);
            } else {
              switch (xlsCell.getCellType()) {
              case HSSFCell.CELL_TYPE_FORMULA:
                switch (xlsCell.getCachedFormulaResultType()) {
                case HSSFCell.CELL_TYPE_NUMERIC:
                  xlsColumn_Val = stringNumberFormat.format(xlsCell.getNumericCellValue());
                  break;
                case HSSFCell.CELL_TYPE_STRING:
                  xlsColumn_Val = xlsCell.getRichStringCellValue().getString().trim();
                  break;
                case HSSFCell.CELL_TYPE_BOOLEAN:
                  xlsColumn_Val = String.valueOf(xlsCell.getBooleanCellValue());
                  break;
                }
                break;
              case HSSFCell.CELL_TYPE_NUMERIC:
                if (HSSFDateUtil.isCellDateFormatted(xlsCell)) {
                  xlsColumn_Val = stringDatetimeFormat.format(xlsCell.getDateCellValue());
                } else {
                  xlsColumn_Val = stringNumberFormat.format(xlsCell.getNumericCellValue());
                }
                break;
              case HSSFCell.CELL_TYPE_STRING:
                xlsColumn_Val = xlsCell.getRichStringCellValue().getString().trim();
                break;
              case HSSFCell.CELL_TYPE_BOOLEAN:
                xlsColumn_Val = String.valueOf(xlsCell.getBooleanCellValue());
                break;
              case HSSFCell.CELL_TYPE_ERROR:
                xlsColumn_Val = String.valueOf(xlsCell.getErrorCellValue());
                break;
              }
              rowParams.put(COLUMN_NM, xlsColumn_Val);
            }
          }

          rowParams.put("P_RECV_SEQ", row - xlsFirstRow + 1);
          nexosDAO.insert(INSERT_ID, rowParams);
        }
      }
      params.put(Consts.PK_RESULT_MSG, Consts.OK);
      resultMap.put(Consts.PK_O_MSG, Consts.OK);
    } catch (Exception e) {
      String err = Util.getErrorMessage(e);
      params.put(Consts.PK_RESULT_MSG, err);
      resultMap.put(Consts.PK_O_MSG, err);
    } finally {
      xlsxSheet = null;
      xlsxWorkbook = null;
      xlsSheet = null;
      xlsWorkbook = null;
      xlsFile = null;
      try {
        if (xlsFileInput != null) {
          xlsFileInput.close();
        }
      } catch (Exception e) {
        logger.error(e.getMessage());
      }
      if (ediRecvFile != null) {
        try {
          if (ediRecvFileBackupFullName != null) {
            Util.renameFile(ediRecvFile, new File(ediRecvFileBackupFullName));
          }
        } catch (Exception e) {
          logger.error(e.getMessage());
        }
      }
    }
    return resultMap;
  }

  @SuppressWarnings("unchecked")
  @Override
  public HashMap<String, Object> recvExcel_01(Map<String, Object> params) throws Exception {

    HashMap<String, Object> resultMap = new HashMap<String, Object>();

    final String DEFINE_INFO_ID = "EDCOMMON.RS_DEFINE_INFO";
    // 수신정의 상세내역 쿼리 파라메터 값 읽기

    // upload dir로 edi 파일 수신
    String ediRecvFileBackupFullName = null;
    File ediRecvFile = null;
    FileInputStream xlsFileInput = null;
    POIFSFileSystem xlsFile = null;

    XSSFWorkbook xlsxWorkbook = null;
    XSSFSheet xlsxSheet = null;
    XSSFRow xlsxRow = null;
    XSSFCell xlsxCell = null;

    HSSFWorkbook xlsWorkbook = null;
    HSSFSheet xlsSheet = null;
    HSSFRow xlsRow = null;
    HSSFCell xlsCell = null;
    try {
      String BU_CD = (String)params.get("P_BU_CD");
      String EDI_DIV = (String)params.get("P_EDI_DIV");
      String DEFINE_NO = (String)params.get("P_DEFINE_NO");
      String FILE_DIV = (String)params.get("P_FILE_DIV");

      // 수신정의 상세내역 데이터 쿼리
      List list = nexosDAO.list(DEFINE_INFO_ID, params);
      if (list == null || list.size() == 0) {
        throw new RuntimeException("[사업부,수신구분,수신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\n수신정의 내역이 등록되어 있지 않습니다.");
      }

      // 수신번호 채번
      Map<String, Object> mapGetRecvNo = getRecvNo(params);

      String oMsg = (String)mapGetRecvNo.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      String RECV_NO = (String)mapGetRecvNo.get("O_RECV_NO");
      params.put("P_RECV_NO", RECV_NO);

      // 나머지 파라메터 값 읽기
      String USER_ID = (String)params.get(Consts.PK_USER_ID);
      String RECV_DATE = (String)params.get("P_RECV_DATE");
      String WEB_ROOT_PATH = getGlobalProperty("webapp.root");
      String EDI_RECV_PATH = getGlobalProperty("ediRecvRoot");
      String EDI_RECV_FULLPATH = Util.getPathName(WEB_ROOT_PATH, EDI_RECV_PATH, EDI_DIV);

      CommonsMultipartFile ediUploadMultipartFile = null;
      String ediRecvFileName = null;
      String ediRecvFileFullName = null;
      String ediRecvFileBackupPath = null;
      String ediRecvDatetime = Util.getNowDate("yyyyMMddHHmmss");

      if (Consts.FILE_DIV_ATTACHMENT.equals(FILE_DIV)) {
        // Browser에서 파일 업로드
        ediUploadMultipartFile = (CommonsMultipartFile)params.get("P_UPLOAD_FILE");
        ediRecvFileName = USER_ID + "_" + ediRecvDatetime + "_"
          + ediUploadMultipartFile.getOriginalFilename().replaceAll(" ", "_");
      } else if (Consts.FILE_DIV_SERVER.equals(FILE_DIV)) {
        // 서버에 업로드된 파일
        EDI_RECV_FULLPATH = (String)params.get("P_FILE_DIR");
        ediRecvFileName = (String)params.get("P_FILE_NM");
      } else {
        throw new RuntimeException("[사업부,수신구분,수신정의번호,파일유형: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO + "," + FILE_DIV
          + "]\n처리할 수 없는 파일유형입니다.");
      }

      ediRecvFileFullName = EDI_RECV_FULLPATH + ediRecvFileName;
      ediRecvFileBackupPath = Util.getPathName(EDI_RECV_FULLPATH, Consts.BACKUP_DIR, ediRecvDatetime.substring(0, 8));
      ediRecvFileBackupFullName = ediRecvFileBackupPath + ediRecvFileName;

      // upload dir이 존재하지 않으면 생성
      Util.createDir(EDI_RECV_FULLPATH, ediRecvFileBackupPath);

      // resultMap 세팅
      resultMap.put("P_BU_CD", BU_CD);
      resultMap.put("P_EDI_DIV", EDI_DIV);
      resultMap.put("P_DEFINE_NO", DEFINE_NO);
      resultMap.put("P_RECV_DATE", RECV_DATE);
      resultMap.put("P_RECV_NO", RECV_NO);

      // 수신정의에서 기본 정보 읽기
      Map<String, Object> column = (HashMap<String, Object>)list.get(0);
      final String INSERT_ID = "EDCOMMON.INSERT_" + (String)column.get("TABLE_NM");
      Object objXlsFirstRow = column.get("XLS_FIRST_ROW");
      int xlsFirstRow = 0;
      if (objXlsFirstRow != null) {
        xlsFirstRow = ((Number)objXlsFirstRow).intValue() - 1;
      }

      int xlsCol;
      String xlsColumn_Nm = null;
      String xlsColumn_Val = null;
      String COLUMN_NM = null;

      // 실제 정의한 컬럼만 추출
      Vector<Object> vtColumn;
      int columnCnt = list.size();
      ArrayList<Vector<Object>> columns = new ArrayList<Vector<Object>>();
      for (int i = 0; i < columnCnt; i++) {
        column = (HashMap<String, Object>)list.get(i);
        try {
          COLUMN_NM = (String)column.get("COLUMN_NM");
          xlsColumn_Nm = (String)column.get("XLS_COLUMN_NM");

          if (!Util.isNull(xlsColumn_Nm) && !Util.isNull(COLUMN_NM)) {
            vtColumn = new Vector<Object>();
            vtColumn.add("P_" + COLUMN_NM);
            vtColumn.add(xlsColumn_Nm);
            vtColumn.add(getXLSColumnIndex(xlsColumn_Nm));
            columns.add(vtColumn);
          }
        } catch (Exception e) {
        }
      }
      columnCnt = columns.size();
      if (columnCnt == 0) {
        throw new RuntimeException("[사업부,수신구분,수신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\n수신정의 컬럼 중 처리 가능한 컬럼이 없습니다.");
      }

      ediRecvFile = new File(ediRecvFileFullName);
      if (Consts.FILE_DIV_ATTACHMENT.equals(FILE_DIV)) {
        try {
          ediUploadMultipartFile.transferTo(ediRecvFile);
        } catch (Exception e) {
          throw new RuntimeException("수신 처리할 파일을 전송하지 못했습니다.");
        }
      }

      // Excel 2007
      if (ediRecvFileFullName.toLowerCase().endsWith(".xlsx")) {
        try {
          xlsFileInput = new FileInputStream(ediRecvFileFullName);
          xlsxWorkbook = new XSSFWorkbook(xlsFileInput);
        } catch (Exception e) {
          throw new RuntimeException("엑셀 파일이 아닙니다. 엑셀 파일로 수신 처리하십시오.");
        }
        try {
          xlsxSheet = xlsxWorkbook.getSheetAt(0);
        } catch (Exception e) {
          throw new RuntimeException("엑셀 파일이 아닙니다. 엑셀 파일로 수신 처리하십시오.");
        }

        SimpleDateFormat stringDatetimeFormat = new SimpleDateFormat(Consts.DATETIME_FORMAT);
        NumberFormat stringNumberFormat = NumberFormat.getNumberInstance();
        stringNumberFormat.setGroupingUsed(false);
        int xlsRowCount = xlsxSheet.getPhysicalNumberOfRows();

        if (xlsFirstRow > xlsRowCount) {
          throw new RuntimeException("엑셀 파일에 처리할 데이터가 없습니다.[데이터건수:" + xlsRowCount + "][시작ROW:" + (xlsFirstRow + 1)
            + "]");
        }

        Map<String, Object> rowParams = new HashMap<String, Object>();
        // INSERT 기본 값 지정
        rowParams.put("P_BU_CD", BU_CD);
        rowParams.put("P_EDI_DIV", EDI_DIV);
        rowParams.put("P_DEFINE_NO", DEFINE_NO);
        rowParams.put("P_RECV_DATE", RECV_DATE);
        rowParams.put("P_RECV_NO", RECV_NO);
        rowParams.put("P_ERROR_DIV", "93");
        rowParams.put("P_DATA_DIV", Consts.DATA_DIV_XLS); // 데이터처리유형 - EXCEL - 02
        rowParams.put("P_RECV_USER_ID", USER_ID);

        for (int row = xlsFirstRow; row < xlsRowCount; row++) {

          xlsxRow = xlsxSheet.getRow(row);
          if (xlsxRow == null) {
            throw new RuntimeException("엑셀 행이 비어있습니다. 확인 후 작업하십시오.");
          }
          for (int i = 0; i < columnCnt; i++) {
            vtColumn = columns.get(i);

            COLUMN_NM = (String)vtColumn.get(0);
            xlsColumn_Nm = (String)vtColumn.get(1);
            xlsCol = (Integer)vtColumn.get(2);

            // XLS 셀 값 읽기
            xlsColumn_Val = "";
            xlsxCell = xlsxRow.getCell(xlsCol);
            if (xlsxCell == null || xlsxCell.equals("")) {
              if (COLUMN_NM.equals("P_BU_NO") || COLUMN_NM.equals("P_BU_DATETIME") || COLUMN_NM.equals("P_DEAL_ID")
                || COLUMN_NM.equals("P_OPTION_VALUE") || COLUMN_NM.equals("P_SHIPPER_NM")
                || COLUMN_NM.equals("P_SHIPPER_HP") || COLUMN_NM.equals("P_SHIPPER_ZIP_CD")
                || COLUMN_NM.equals("P_SHIPPER_ADDR_BASIC")) {
                throw new RuntimeException("필수값 중에 비어있는 열이 있습니다." + "\n엑셀 [" + (row + 1) + "]번째 행,[" + xlsColumn_Nm
                  + "] 열");
              } else {
                rowParams.put(COLUMN_NM, xlsColumn_Val);
              }
            } else {
              switch (xlsxCell.getCellType()) {
              case XSSFCell.CELL_TYPE_FORMULA:
                switch (xlsxCell.getCachedFormulaResultType()) {
                case XSSFCell.CELL_TYPE_NUMERIC:
                  xlsColumn_Val = stringNumberFormat.format(xlsxCell.getNumericCellValue());
                  break;
                case XSSFCell.CELL_TYPE_STRING:
                  xlsColumn_Val = xlsxCell.getRichStringCellValue().getString().trim();
                  break;
                case XSSFCell.CELL_TYPE_BOOLEAN:
                  xlsColumn_Val = String.valueOf(xlsxCell.getBooleanCellValue());
                  break;
                }
                break;
              case XSSFCell.CELL_TYPE_NUMERIC:
                if (HSSFDateUtil.isCellDateFormatted(xlsxCell)) {
                  xlsColumn_Val = stringDatetimeFormat.format(xlsxCell.getDateCellValue());
                } else {
                  xlsColumn_Val = stringNumberFormat.format(xlsxCell.getNumericCellValue());
                }
                break;
              case XSSFCell.CELL_TYPE_STRING:
                xlsColumn_Val = xlsxCell.getRichStringCellValue().getString().trim();
                break;
              case XSSFCell.CELL_TYPE_BOOLEAN:
                xlsColumn_Val = String.valueOf(xlsxCell.getBooleanCellValue());
                break;
              case XSSFCell.CELL_TYPE_ERROR:
                xlsColumn_Val = String.valueOf(xlsxCell.getErrorCellValue());
                break;
              }
              rowParams.put(COLUMN_NM, xlsColumn_Val);
            }
          }

          rowParams.put("P_RECV_SEQ", row - xlsFirstRow + 1);
          rowParams.put("P_CENTER_CD", "G1");
          /*
           * if (DEFINE_NO.equals("EX01")) {
           * rowParams.put("P_BU_CD", "5000");
           * rowParams.put("P_CUST_CD", "5000");
           * } else {
           * rowParams.put("P_BU_CD", "6000");
           * rowParams.put("P_CUST_CD", "6000");
           * }
           */
          nexosDAO.insert(INSERT_ID, rowParams);
        }
      } else {
        // Excel 2003 이하
        try {
          xlsFileInput = new FileInputStream(ediRecvFileFullName);
          xlsFile = new POIFSFileSystem(xlsFileInput);
          xlsWorkbook = new HSSFWorkbook(xlsFile);
        } catch (Exception e) {
          throw new RuntimeException("엑셀 파일이 아닙니다. 엑셀 파일로 수신 처리하십시오.");
        }
        try {
          xlsSheet = xlsWorkbook.getSheetAt(0);
        } catch (Exception e) {
          throw new RuntimeException("엑셀 파일이 아닙니다. 엑셀 파일로 수신 처리하십시오.");
        }

        SimpleDateFormat stringDatetimeFormat = new SimpleDateFormat(Consts.DATETIME_FORMAT);
        NumberFormat stringNumberFormat = NumberFormat.getNumberInstance();
        stringNumberFormat.setGroupingUsed(false);
        int xlsRowCount = xlsSheet.getPhysicalNumberOfRows();

        if (xlsFirstRow > xlsRowCount) {
          throw new RuntimeException("엑셀 파일에 처리할 데이터가 없습니다.[데이터건수:" + xlsRowCount + "][시작ROW:" + (xlsFirstRow + 1)
            + "]");
        }

        Map<String, Object> rowParams = new HashMap<String, Object>();
        // INSERT 기본 값 지정
        rowParams.put("P_BU_CD", BU_CD);
        rowParams.put("P_EDI_DIV", EDI_DIV);
        rowParams.put("P_DEFINE_NO", DEFINE_NO);
        rowParams.put("P_RECV_DATE", RECV_DATE);
        rowParams.put("P_RECV_NO", RECV_NO);
        rowParams.put("P_ERROR_DIV", "93");
        rowParams.put("P_DATA_DIV", "02"); // 데이터처리유형 - EXCEL - 02
        rowParams.put("P_RECV_USER_ID", USER_ID);

        for (int row = xlsFirstRow; row < xlsRowCount; row++) {

          xlsRow = xlsSheet.getRow(row);
          if (xlsRow == null) {
            throw new RuntimeException("엑셀 행이 비어있습니다. 확인 후 작업하십시오.");
          }
          for (int i = 0; i < columnCnt; i++) {
            vtColumn = columns.get(i);

            COLUMN_NM = (String)vtColumn.get(0);
            xlsColumn_Nm = (String)vtColumn.get(1);
            xlsCol = (Integer)vtColumn.get(2);

            // XLS 셀 값 읽기
            xlsColumn_Val = "";
            xlsCell = xlsRow.getCell(xlsCol);
            if (xlsCell == null || xlsCell.equals("")) {
              if (COLUMN_NM.equals("P_BU_NO") || COLUMN_NM.equals("P_BU_DATETIME") || COLUMN_NM.equals("P_DEAL_ID")
                || COLUMN_NM.equals("P_OPTION_VALUE") || COLUMN_NM.equals("P_SHIPPER_NM")
                || COLUMN_NM.equals("P_SHIPPER_HP") || COLUMN_NM.equals("P_SHIPPER_ZIP_CD")
                || COLUMN_NM.equals("P_SHIPPER_ADDR_BASIC")) {
                throw new RuntimeException("필수값 중에 비어있는 열이 있습니다." + "\n엑셀 [" + (row + 1) + "]번째 행,[" + xlsColumn_Nm
                  + "] 열");
              } else {
                rowParams.put(COLUMN_NM, xlsColumn_Val);
              }
            } else {
              switch (xlsCell.getCellType()) {
              case HSSFCell.CELL_TYPE_FORMULA:
                switch (xlsCell.getCachedFormulaResultType()) {
                case HSSFCell.CELL_TYPE_NUMERIC:
                  xlsColumn_Val = stringNumberFormat.format(xlsCell.getNumericCellValue());
                  break;
                case HSSFCell.CELL_TYPE_STRING:
                  xlsColumn_Val = xlsCell.getRichStringCellValue().getString().trim();
                  break;
                case HSSFCell.CELL_TYPE_BOOLEAN:
                  xlsColumn_Val = String.valueOf(xlsCell.getBooleanCellValue());
                  break;
                }
                break;
              case HSSFCell.CELL_TYPE_NUMERIC:
                if (HSSFDateUtil.isCellDateFormatted(xlsCell)) {
                  xlsColumn_Val = stringDatetimeFormat.format(xlsCell.getDateCellValue());
                } else {
                  xlsColumn_Val = stringNumberFormat.format(xlsCell.getNumericCellValue());
                }
                break;
              case HSSFCell.CELL_TYPE_STRING:
                xlsColumn_Val = xlsCell.getRichStringCellValue().getString().trim();
                break;
              case HSSFCell.CELL_TYPE_BOOLEAN:
                xlsColumn_Val = String.valueOf(xlsCell.getBooleanCellValue());
                break;
              case HSSFCell.CELL_TYPE_ERROR:
                xlsColumn_Val = String.valueOf(xlsCell.getErrorCellValue());
                break;
              }
              rowParams.put(COLUMN_NM, xlsColumn_Val);
            }
          }

          rowParams.put("P_RECV_SEQ", row - xlsFirstRow + 1);
          rowParams.put("P_CENTER_CD", "G1");
          /*
           * if (DEFINE_NO.equals("EX01")) {
           * rowParams.put("P_BU_CD", "5000");
           * rowParams.put("P_CUST_CD", "5000");
           * } else {
           * rowParams.put("P_BU_CD", "6000");
           * rowParams.put("P_CUST_CD", "6000");
           * }
           */
          nexosDAO.insert(INSERT_ID, rowParams);
        }
      }
      params.put(Consts.PK_RESULT_MSG, Consts.OK);
      resultMap.put(Consts.PK_O_MSG, Consts.OK);
    } catch (Exception e) {
      String err = Util.getErrorMessage(e);
      params.put(Consts.PK_RESULT_MSG, err);
      resultMap.put(Consts.PK_O_MSG, err);
    } finally {
      xlsxSheet = null;
      xlsxWorkbook = null;
      xlsSheet = null;
      xlsWorkbook = null;
      xlsFile = null;
      try {
        if (xlsFileInput != null) {
          xlsFileInput.close();
        }
      } catch (Exception e) {
        logger.error(e.getMessage());
      }
      if (ediRecvFile != null) {
        try {
          if (ediRecvFileBackupFullName != null) {
            Util.renameFile(ediRecvFile, new File(ediRecvFileBackupFullName));
          }
        } catch (Exception e) {
          logger.error(e.getMessage());
        }
      }
    }
    return resultMap;
  }

  @SuppressWarnings({"unchecked", "resource"})
  @Override
  public HashMap<String, Object> recvText(Map<String, Object> params) throws Exception {

    HashMap<String, Object> resultMap = new HashMap<String, Object>();

    final String DEFINE_INFO_ID = "EDCOMMON.RS_DEFINE_INFO";
    // EUC-KR은 KS X 1001과 KS X 1003 표준안의 인코딩 방식이며,
    // CP949(MS949, x-windows-949)는 확장 완성형의 인코딩 방식이다.
    // 그러므로 EUC-KR은 2,350자의 한글, CP949는 11,172자의 한글을 표현할 수 있다.
    // 그러나 Java에서는 CP949와 MS949를 다르게 취급한다.
    // CP949는 IBM에서 처음 지정한 코드 페이지(sun.nio.cs.ext.IBM949)가 기준이고
    // Microsoft가 제정한 확장 완성형은 MS949(sun.nio.cs.ext.MS949)를 기준이다.
    // 그러므로 Java에서는 CP949와 EUC-KR이 사실상 같으며,
    // 확장 완성형을 사용하기 위해서는 MS949로 지정해야 한다.
    final String KR_CHARSET = "MS949";

    // upload dir로 edi 파일 수신
    File ediRecvFile = null;
    FileInputStream txtFileInput = null;
    InputStreamReader txtFileInputReader = null;
    BufferedReader txtFileReader = null;
    String ediRecvFileBackupFullName = null;
    try {
      // 수신정의 상세내역 쿼리 파라메터 값 읽기
      String BU_CD = (String)params.get("P_BU_CD");
      String EDI_DIV = (String)params.get("P_EDI_DIV");
      String DEFINE_NO = (String)params.get("P_DEFINE_NO");
      String FILE_DIV = (String)params.get("P_FILE_DIV");

      // 수신정의 상세내역 데이터 쿼리
      List list = nexosDAO.list(DEFINE_INFO_ID, params);
      if (list == null || list.size() == 0) {
        throw new RuntimeException("[사업부,수신구분,수신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\n수신정의 내역이 등록되어 있지 않습니다.");
      }

      // 수신번호 채번
      Map<String, Object> mapGetRecvNo = getRecvNo(params);

      String oMsg = (String)mapGetRecvNo.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      String RECV_NO = (String)mapGetRecvNo.get("O_RECV_NO");
      params.put("P_RECV_NO", RECV_NO);

      // 나머지 파라메터 값 읽기
      String USER_ID = (String)params.get(Consts.PK_USER_ID);
      String RECV_DATE = (String)params.get("P_RECV_DATE");
      String WEB_ROOT_PATH = getGlobalProperty("webapp.root");
      String EDI_RECV_PATH = getGlobalProperty("ediRecvRoot");
      String EDI_RECV_FULLPATH = Util.getPathName(WEB_ROOT_PATH, EDI_RECV_PATH, EDI_DIV);

      CommonsMultipartFile ediUploadMultipartFile = null;
      String ediRecvFileName = null;
      String ediRecvFileFullName = null;
      String ediRecvFileBackupPath = null;
      String ediRecvDatetime = Util.getNowDate("yyyyMMddHHmmss");

      if (Consts.FILE_DIV_ATTACHMENT.equals(FILE_DIV)) {
        // Browser에서 파일 업로드
        ediUploadMultipartFile = (CommonsMultipartFile)params.get("P_UPLOAD_FILE");
        ediRecvFileName = USER_ID + "_" + ediRecvDatetime + "_"
          + ediUploadMultipartFile.getOriginalFilename().replaceAll(" ", "_");
      } else if (Consts.FILE_DIV_SERVER.equals(FILE_DIV)) {
        // 서버에 업로드된 파일
        EDI_RECV_FULLPATH = (String)params.get("P_FILE_DIR");
        ediRecvFileName = (String)params.get("P_FILE_NM");
      } else if (Consts.FILE_DIV_DOC.equals(FILE_DIV)) {
        // 문자열
        ediRecvFileName = USER_ID + "_" + ediRecvDatetime + "_" + "DOC.txt";
      } else {
        throw new RuntimeException("[사업부,수신구분,수신정의번호,파일유형: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO + "," + FILE_DIV
          + "]\n처리할 수 없는 파일유형입니다.");
      }

      ediRecvFileFullName = EDI_RECV_FULLPATH + ediRecvFileName;
      ediRecvFileBackupPath = Util.getPathName(EDI_RECV_FULLPATH, Consts.BACKUP_DIR, ediRecvDatetime.substring(0, 8));
      ediRecvFileBackupFullName = ediRecvFileBackupPath + ediRecvFileName;

      // upload dir이 존재하지 않으면 생성
      Util.createDir(EDI_RECV_FULLPATH, ediRecvFileBackupPath);

      // resultMap 세팅
      resultMap.put("P_BU_CD", BU_CD);
      resultMap.put("P_EDI_DIV", EDI_DIV);
      resultMap.put("P_DEFINE_NO", DEFINE_NO);
      resultMap.put("P_RECV_DATE", RECV_DATE);
      resultMap.put("P_RECV_NO", RECV_NO);

      // 수신정의에서 기본 정보 읽기
      Map<String, Object> column = (HashMap<String, Object>)list.get(0);
      final String INSERT_ID = "EDCOMMON.INSERT_" + (String)column.get("TABLE_NM");
      String txtDelimeterYn = (String)column.get("TXT_DELIMETER_YN");
      String txtColDelimeter = (String)column.get("TXT_COL_DELIMETER");

      if (Consts.YES.equals(txtDelimeterYn) && Util.isNull(txtColDelimeter)) {
        throw new RuntimeException("[사업부,수신구분,수신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\n텍스트 컬럼 구분자가 지정되지 않았습니다.");
      }

      int txtPosition = -1;
      int txtLength = -1;
      String COLUMN_NM = null;
      String COLUMN_VAL = null;

      // 실제 정의한 컬럼만 추출
      Vector<Object> vtColumn;
      int columnCnt = list.size();
      ArrayList<Vector<Object>> columns = new ArrayList<Vector<Object>>();

      for (int i = 0; i < columnCnt; i++) {
        column = (HashMap<String, Object>)list.get(i);

        try {
          COLUMN_NM = (String)column.get("COLUMN_NM");
          txtPosition = ((Number)column.get("TXT_POSITION")).intValue();
          txtLength = ((Number)column.get("TXT_LENGTH")).intValue();

          if (txtPosition > -1 && txtLength > 0 && !Util.isNull(COLUMN_NM)) {
            vtColumn = new Vector<Object>();
            vtColumn.add("P_" + COLUMN_NM);
            vtColumn.add(txtPosition);
            vtColumn.add(txtLength);
            columns.add(vtColumn);
          }
        } catch (Exception e) {
        }
      }
      columnCnt = columns.size();
      if (columnCnt == 0) {
        throw new RuntimeException("[사업부,수신구분,수신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\n수신정의 컬럼 중 처리 가능한 컬럼이 없습니다.");
      }

      ediRecvFile = new File(ediRecvFileFullName);
      if (Consts.FILE_DIV_ATTACHMENT.equals(FILE_DIV)) {
        try {
          ediUploadMultipartFile.transferTo(ediRecvFile);
        } catch (Exception e) {
          throw new RuntimeException("수신 처리할 파일을 전송하지 못했습니다.");
        }
      } else if (Consts.FILE_DIV_DOC.equals(FILE_DIV)) {
        try {
          String document = (String)params.get("P_DOCUMENT");
          FileUtils.writeStringToFile(ediRecvFile, document, Consts.CHARSET);
        } catch (Exception e) {
          throw new RuntimeException("수신 처리할 파일을 전송하지 못했습니다.");
        }
      }

      String[ ] availableCharsets = {"UTF-8", "MS949", "EUC-KR"};
      Charset txtCharset = detectCharset(ediRecvFile, availableCharsets);
      if (txtCharset == null) {
        throw new RuntimeException("텍스트 파일의 인코딩을 [UTF-8, EUC-KR, MS949] 형식으로 저장 후 처리하십시오.");
      }
      logger.info("EDCommonDAO[recvText] File Encoding : " + txtCharset.displayName());

      try {
        txtFileInput = new FileInputStream(ediRecvFileFullName);
        txtFileInputReader = new InputStreamReader(txtFileInput, txtCharset);
        txtFileReader = new BufferedReader(txtFileInputReader);
      } catch (Exception e) {
        throw new RuntimeException("수신 처리할 텍스트 파일이 존재하지 않습니다.");
      }

      Map<String, Object> rowParams = new HashMap<String, Object>();
      // INSERT 기본 값 지정
      rowParams.put("P_BU_CD", BU_CD);
      rowParams.put("P_EDI_DIV", EDI_DIV);
      rowParams.put("P_DEFINE_NO", DEFINE_NO);
      rowParams.put("P_RECV_DATE", RECV_DATE);
      rowParams.put("P_RECV_NO", RECV_NO);
      rowParams.put("P_ERROR_DIV", "93"); // 오류구분 - 데이터입력 - 0
      rowParams.put("P_DATA_DIV", Consts.DATA_DIV_TXT); // 데이터처리유형 - TEXT - 03
      rowParams.put("P_RECV_USER_ID", USER_ID);

      int RECV_SEQ = 0;
      String txtLine = null;
      byte[ ] txtLineBytes = null;
      String[ ] txtLineSplit = null;

      // 컬럼 구분자로 처리일 경우
      if (Consts.YES.equals(txtDelimeterYn)) {
        txtLine = txtFileReader.readLine();
        if (txtLine != null) {
          // BOM 제거
          if (txtCharset.name().equals(Consts.CHARSET)) {
            txtLineBytes = txtLine.getBytes();
            if (txtLineBytes.length > 3) {
              if (txtLineBytes[0] == -17 && txtLineBytes[1] == -69 && txtLineBytes[2] == -65) {
                txtLine = new String(txtLineBytes, 3, txtLineBytes.length - 3);
              }
            }
          }
          do {
            // 공백 Line Skip
            if (txtLine.trim().equals("")) {
              txtLine = txtFileReader.readLine();
              continue;
            }

            txtLineSplit = txtLine.split(txtColDelimeter);
            for (int i = 0; i < columnCnt; i++) {
              vtColumn = columns.get(i);

              COLUMN_NM = (String)vtColumn.get(0);
              txtPosition = (Integer)vtColumn.get(1);
              txtLength = (Integer)vtColumn.get(2);

              try {
                txtLineBytes = txtLineSplit[txtPosition - 1].getBytes(KR_CHARSET);
                COLUMN_VAL = new String(txtLineBytes, 0, Math.min(txtLineBytes.length, txtLength), KR_CHARSET);
              } catch (Exception e) {
                throw new RuntimeException("컬럼명: " + COLUMN_NM.replace("P_", "") + "\n\n텍스트 시작위치/컬럼길이가 잘못 지정되었습니다.");
              }

              rowParams.put(COLUMN_NM, COLUMN_VAL.trim());
            }

            RECV_SEQ += 1;
            rowParams.put("P_RECV_SEQ", RECV_SEQ);
            if (EDI_DIV.equals("RWB10")) {
              rowParams.put("P_CARRIER_CD", "0010");
            } else if (EDI_DIV.equals("RWB20")) {
              rowParams.put("P_CARRIER_CD", "0020");
            }
            nexosDAO.insert(INSERT_ID, rowParams);

            txtLine = txtFileReader.readLine();
          } while (txtLine != null);
        }
      } else {
        // 위치/길이로 처리
        txtLine = txtFileReader.readLine();
        if (txtLine != null) {
          // BOM 제거
          if (txtCharset.name().equals(Consts.CHARSET)) {
            txtLineBytes = txtLine.getBytes();
            if (txtLineBytes.length > 3) {
              if (txtLineBytes[0] == -17 && txtLineBytes[1] == -69 && txtLineBytes[2] == -65) {
                txtLine = new String(txtLineBytes, 3, txtLineBytes.length - 3);
              }
            }
          }
          do {
            // 공백 Line Skip
            if (txtLine.trim().equals("")) {
              txtLine = txtFileReader.readLine();
              continue;
            }

            int errChk = 0;
            txtLineBytes = txtLine.getBytes(KR_CHARSET);
            for (int i = 0; i < columnCnt; i++) {
              vtColumn = columns.get(i);

              COLUMN_NM = (String)vtColumn.get(0);
              txtPosition = (Integer)vtColumn.get(1);
              // txtLength = (Integer)vtColumn.get(2);
              if (EDI_DIV.equals("RCM80")) {
                txtLength = txtLine.getBytes(KR_CHARSET).length;
              } else {
                txtLength = (Integer)vtColumn.get(2);
              }

              try {
                COLUMN_VAL = new String(txtLineBytes, txtPosition - 1, txtLength, KR_CHARSET);
              } catch (Exception e) {
                errChk++;
                // throw new RuntimeException("컬럼명: " + COLUMN_NM.replace("P_", "") + "\n\n텍스트 시작위치/컬럼길이가 잘못 지정되었습니다.");
              }

              rowParams.put(COLUMN_NM, COLUMN_VAL.trim());

              // String WB_NO_CHK = (String)rowParams.get("P_WB_NO");
              // String STATE_DIV_CHK = (String)rowParams.get("P_HDC_STATE_DIV");
              //
              // if (WB_NO_CHK.equals("") || WB_NO_CHK == null || STATE_DIV_CHK.equals("") || STATE_DIV_CHK == null) {
              // continue;
              // }

            }

            RECV_SEQ += 1;
            rowParams.put("P_RECV_SEQ", RECV_SEQ);
            if (EDI_DIV.equals("RWB10")) {
              rowParams.put("P_CARRIER_CD", "0010");
            } else if (EDI_DIV.equals("RWB20")) {
              rowParams.put("P_CARRIER_CD", "0020");
            }
            if (errChk == 0) {
              nexosDAO.insert(INSERT_ID, rowParams);
            }

            txtLine = txtFileReader.readLine();
          } while (txtLine != null);
        }
      }
      params.put(Consts.PK_RESULT_MSG, Consts.OK);
      resultMap.put(Consts.PK_O_MSG, Consts.OK);
    } catch (Exception e) {
      String err = Util.getErrorMessage(e);
      params.put(Consts.PK_RESULT_MSG, err);
      resultMap.put(Consts.PK_O_MSG, err);
    } finally {
      try {
        if (txtFileReader != null) {
          txtFileReader.close();
        }
      } catch (Exception e) {
        logger.error(e.getMessage());
      }
      try {
        if (txtFileInputReader != null) {
          txtFileInputReader.close();
        }
      } catch (Exception e) {
        logger.error(e.getMessage());
      }
      try {
        if (txtFileInput != null) {
          txtFileInput.close();
        }
      } catch (Exception e) {
        logger.error(e.getMessage());
      }
      if (ediRecvFile != null) {
        try {
          if (ediRecvFileBackupFullName != null) {
            Util.renameFile(ediRecvFile, new File(ediRecvFileBackupFullName));
          }
        } catch (Exception e) {
          logger.error(e.getMessage());
        }
      }
    }
    return resultMap;
  }

  @SuppressWarnings("unchecked")
  @Override
  public HashMap<String, Object> recvXML(Map<String, Object> params) throws Exception {

    HashMap<String, Object> resultMap = new HashMap<String, Object>();

    final String DEFINE_INFO_ID = "EDCOMMON.RS_DEFINE_INFO";

    // upload dir로 edi 파일 수신
    File ediRecvFile = null;
    DocumentBuilderFactory xmlDocFactory = null;
    DocumentBuilder xmlDocBuilder = null;
    Document xmlDoc = null;
    String ediRecvFileBackupFullName = null;
    try {
      // 수신정의 상세내역 쿼리 파라메터 값 읽기
      String BU_CD = (String)params.get("P_BU_CD");
      String EDI_DIV = (String)params.get("P_EDI_DIV");
      String DEFINE_NO = (String)params.get("P_DEFINE_NO");
      String FILE_DIV = (String)params.get("P_FILE_DIV");

      // 수신정의 상세내역 데이터 쿼리
      List list = nexosDAO.list(DEFINE_INFO_ID, params);
      if (list == null || list.size() == 0) {
        throw new RuntimeException("[사업부,수신구분,수신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\n수신정의 내역이 등록되어 있지 않습니다.");
      }

      // 수신번호 채번
      Map<String, Object> mapGetRecvNo = getRecvNo(params);

      String oMsg = (String)mapGetRecvNo.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      String RECV_NO = (String)mapGetRecvNo.get("O_RECV_NO");
      params.put("P_RECV_NO", RECV_NO);

      // 나머지 파라메터 값 읽기
      String USER_ID = (String)params.get(Consts.PK_USER_ID);
      String RECV_DATE = (String)params.get("P_RECV_DATE");
      String WEB_ROOT_PATH = getGlobalProperty("webapp.root");
      String EDI_RECV_PATH = getGlobalProperty("ediRecvRoot");
      String EDI_RECV_FULLPATH = Util.getPathName(WEB_ROOT_PATH, EDI_RECV_PATH, EDI_DIV);

      CommonsMultipartFile ediUploadMultipartFile = null;
      String ediRecvFileName = null;
      String ediRecvFileFullName = null;
      String ediRecvFileBackupPath = null;
      String ediRecvDatetime = Util.getNowDate("yyyyMMddHHmmss");

      if (Consts.FILE_DIV_ATTACHMENT.equals(FILE_DIV)) {
        // Browser에서 파일 업로드
        ediUploadMultipartFile = (CommonsMultipartFile)params.get("P_UPLOAD_FILE");
        ediRecvFileName = USER_ID + "_" + ediRecvDatetime + "_"
          + ediUploadMultipartFile.getOriginalFilename().replaceAll(" ", "_");
        ediRecvFileFullName = EDI_RECV_FULLPATH + ediRecvFileName;
      } else if (Consts.FILE_DIV_SERVER.equals(FILE_DIV)) {
        // 서버에 업로드된 파일
        EDI_RECV_FULLPATH = (String)params.get("P_FILE_DIR");
        ediRecvFileName = (String)params.get("P_FILE_NM");
      } else if (Consts.FILE_DIV_DOC.equals(FILE_DIV)) {
        // 문자열
        ediRecvFileName = USER_ID + "_" + ediRecvDatetime + "_" + "DOC.xml";
      } else {
        throw new RuntimeException("[사업부,수신구분,수신정의번호,파일유형: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO + "," + FILE_DIV
          + "]\n처리할 수 없는 파일유형입니다.");
      }

      ediRecvFileFullName = EDI_RECV_FULLPATH + ediRecvFileName;
      ediRecvFileBackupPath = Util.getPathName(EDI_RECV_FULLPATH, Consts.BACKUP_DIR, ediRecvDatetime.substring(0, 8));
      ediRecvFileBackupFullName = ediRecvFileBackupPath + ediRecvFileName;

      // upload dir이 존재하지 않으면 생성
      Util.createDir(EDI_RECV_FULLPATH, ediRecvFileBackupPath);

      // resultMap 세팅
      resultMap.put("P_BU_CD", BU_CD);
      resultMap.put("P_EDI_DIV", EDI_DIV);
      resultMap.put("P_DEFINE_NO", DEFINE_NO);
      resultMap.put("P_RECV_DATE", RECV_DATE);
      resultMap.put("P_RECV_NO", RECV_NO);

      // 수신정의에서 기본 정보 읽기
      Map<String, Object> column = (HashMap<String, Object>)list.get(0);
      final String INSERT_ID = "EDCOMMON.INSERT_" + (String)column.get("TABLE_NM");
      String xmlTagRoot = (String)column.get("XML_TAG_ROOT");
      String xmlTagBunch = (String)column.get("XML_TAG_BUNCH");
      String xmlTagSubBunch = (String)column.get("XML_TAG_SUB_BUNCH");

      if (Util.isNull(xmlTagRoot)) {
        throw new RuntimeException("[사업부,수신구분,수신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\nXML 루트태그가 정의되지 않았습니다.");
      }

      String xmlTagName = null;
      String[ ] xmlTagNames = null;
      String xmlTagAttr = null;
      String COLUMN_NM = null;
      String COLUMN_VAL = null;

      // 실제 정의한 컬럼만 추출
      Vector<Object> vtColumn;
      int columnCnt = list.size();
      ArrayList<Vector<Object>> columns = new ArrayList<Vector<Object>>();

      for (int i = 0; i < columnCnt; i++) {
        column = (HashMap<String, Object>)list.get(i);

        try {
          COLUMN_NM = (String)column.get("COLUMN_NM");
          xmlTagName = (String)column.get("XML_TAG_NM");
          xmlTagAttr = (String)column.get("XML_TAG_ATTR");

          if (!Util.isNull(COLUMN_NM) && !Util.isNull(xmlTagName)) {
            vtColumn = new Vector<Object>();
            vtColumn.add("P_" + COLUMN_NM);
            vtColumn.add(xmlTagName);
            vtColumn.add(xmlTagAttr);
            xmlTagNames = xmlTagName.split("/");
            if (xmlTagSubBunch != null && xmlTagSubBunch.equals(xmlTagNames[0])) {
              String[ ] xmlNewTagNames = new String[xmlTagNames.length - 1];
              System.arraycopy(xmlTagNames, 1, xmlNewTagNames, 0, xmlNewTagNames.length);
              vtColumn.add(xmlNewTagNames);
              vtColumn.add("S"); // SUB BUNCH
            } else {
              vtColumn.add(xmlTagNames);
              vtColumn.add("M");
            }

            columns.add(vtColumn);
          }
        } catch (Exception e) {
        }
      }
      columnCnt = columns.size();
      if (columnCnt == 0) {
        throw new RuntimeException("[사업부,수신구분,수신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\n수신정의 컬럼 중 처리 가능한 컬럼이 없습니다.");
      }

      ediRecvFile = new File(ediRecvFileFullName);
      if (Consts.FILE_DIV_ATTACHMENT.equals(FILE_DIV)) {
        try {
          ediUploadMultipartFile.transferTo(ediRecvFile);
        } catch (Exception e) {
          throw new RuntimeException("수신 처리할 파일을 전송하지 못했습니다.");
        }
      } else if (Consts.FILE_DIV_DOC.equals(FILE_DIV)) {
        try {
          String document = (String)params.get("P_DOCUMENT");
          FileUtils.writeStringToFile(ediRecvFile, document, Consts.CHARSET);
        } catch (Exception e) {
          throw new RuntimeException("수신 처리할 파일을 전송하지 못했습니다.");
        }
      }

      try {
        xmlDocFactory = DocumentBuilderFactory.newInstance();
        xmlDocBuilder = xmlDocFactory.newDocumentBuilder();
        xmlDoc = xmlDocBuilder.parse(ediRecvFile);
      } catch (Exception e) {
        throw new RuntimeException("수신 처리할 XML 파일을 파싱하지 못했습니다.");
      }

      Element xmlRootElement = xmlDoc.getDocumentElement();
      xmlRootElement.normalize();
      if (!xmlTagRoot.equals(xmlRootElement.getNodeName())) {
        throw new RuntimeException("[정의루트태그, 파일루트태그: " + xmlTagRoot + "," + xmlRootElement.getNodeName()
          + "]다른 형식의 XML 파일입니다. 파일을 확인하십시오.");
      }

      NodeList xmlDataNodeList = null;
      // 단위태그가 지정되어 있으면 단위태그로 리스트 가져옴
      if (!Util.isNull(xmlTagBunch)) {
        xmlDataNodeList = xmlRootElement.getElementsByTagName(xmlTagBunch);
      } else {
        xmlDataNodeList = xmlRootElement.getChildNodes();
      }

      if (xmlDataNodeList == null || xmlDataNodeList.getLength() == 0) {
        throw new RuntimeException("XML 파일에 처리할 데이터가 없습니다.");
      }

      Map<String, Object> rowParams = new HashMap<String, Object>();
      // INSERT 기본 값 지정
      rowParams.put("P_BU_CD", BU_CD);
      rowParams.put("P_EDI_DIV", EDI_DIV);
      rowParams.put("P_DEFINE_NO", DEFINE_NO);
      rowParams.put("P_RECV_DATE", RECV_DATE);
      rowParams.put("P_RECV_NO", RECV_NO);
      rowParams.put("P_ERROR_DIV", "0"); // 오류구분 - 데이터입력 - 0
      rowParams.put("P_DATA_DIV", Consts.DATA_DIV_XML); // 데이터처리유형 - XML - 04
      rowParams.put("P_RECV_USER_ID", USER_ID);

      int RECV_SEQ = 0;
      Node xmlDataNode = null;

      if (xmlTagSubBunch == null) {
        // 마스터 구조의 XML
        for (int row = 0, dataCount = xmlDataNodeList.getLength(); row < dataCount; row++) {
          xmlDataNode = xmlDataNodeList.item(row);
          if (xmlDataNode.getNodeType() == Node.ELEMENT_NODE) {

            Element xmlDataElement = (Element)xmlDataNode;
            for (int i = 0; i < columnCnt; i++) {
              vtColumn = columns.get(i);
              COLUMN_NM = (String)vtColumn.get(0);
              COLUMN_VAL = getXMLColumnValue(vtColumn, xmlDataElement);
              rowParams.put(COLUMN_NM, COLUMN_VAL);
            }

            RECV_SEQ += 1;
            rowParams.put("P_RECV_SEQ", RECV_SEQ);
            nexosDAO.insert(INSERT_ID, rowParams);
          }
        }
      } else {
        // 마스터/디테일 구조의 XML
        Node xmlDataSubNode = null;
        NodeList xmlDataSubNodeList = null;
        for (int row = 0, dataCount = xmlDataNodeList.getLength(); row < dataCount; row++) {
          xmlDataNode = xmlDataNodeList.item(row);
          if (xmlDataNode.getNodeType() == Node.ELEMENT_NODE) {

            // 마스터 데이터 파싱
            Element xmlDataElement = (Element)xmlDataNode;
            for (int i = 0; i < columnCnt; i++) {
              vtColumn = columns.get(i);
              if ("D".equals(vtColumn.get(4))) {
                continue;
              }
              COLUMN_NM = (String)vtColumn.get(0);
              COLUMN_VAL = getXMLColumnValue(vtColumn, xmlDataElement);
              rowParams.put(COLUMN_NM, COLUMN_VAL);
            }

            // 디테일 데이터 파싱
            xmlDataSubNodeList = xmlDataElement.getElementsByTagName(xmlTagSubBunch);
            for (int subRow = 0, subDataCount = xmlDataSubNodeList.getLength(); subRow < subDataCount; subRow++) {
              xmlDataSubNode = xmlDataSubNodeList.item(subRow);
              if (xmlDataSubNode.getNodeType() == Node.ELEMENT_NODE) {

                Element xmlSubDataElement = (Element)xmlDataSubNode;
                for (int i = 0; i < columnCnt; i++) {
                  vtColumn = columns.get(i);
                  if ("M".equals(vtColumn.get(4))) {
                    continue;
                  }
                  COLUMN_NM = (String)vtColumn.get(0);
                  COLUMN_VAL = getXMLColumnValue(vtColumn, xmlSubDataElement);
                  rowParams.put(COLUMN_NM, COLUMN_VAL);
                }

                RECV_SEQ += 1;
                rowParams.put("P_RECV_SEQ", RECV_SEQ);
                nexosDAO.insert(INSERT_ID, rowParams);
              }
            }
          }
        }
      }
      params.put(Consts.PK_RESULT_MSG, Consts.OK);
      resultMap.put(Consts.PK_O_MSG, Consts.OK);
    } catch (Exception e) {
      String err = Util.getErrorMessage(e);
      params.put(Consts.PK_RESULT_MSG, err);
      resultMap.put(Consts.PK_O_MSG, err);
    } finally {
      xmlDoc = null;
      xmlDocFactory = null;
      xmlDocBuilder = null;
      if (ediRecvFile != null) {
        try {
          if (ediRecvFileBackupFullName != null) {
            Util.renameFile(ediRecvFile, new File(ediRecvFileBackupFullName));
          }
        } catch (Exception e) {
          logger.error(e.getMessage());
        }
      }
    }
    return resultMap;
  }

  @Override
  public HashMap<String, Object> sendDBLink(Map<String, Object> params) throws Exception {

    final String ES_PROCESSING_ID = "ES_PROCESSING";

    return nexosDAO.callSP(ES_PROCESSING_ID, params);
  }

  @SuppressWarnings("unchecked")
  @Override
  public HashMap<String, Object> sendESLOOrder_0010(Map<String, Object> params) throws Exception {

    HashMap<String, Object> resultMap = new HashMap<String, Object>();

    final String PK_SEND_FILE_FULL_NM = "O_SEND_FILE_FULL_NM";
    final String PK_BACKUP_FILE_FULL_NM = "O_BACKUP_FILE_FULL_NM";

    try {
      // 파일 생성 쿼리 파라메터 값 읽기
      String queryId = (String)params.get(Consts.PK_QUERY_ID);

      // 송신정의 상세내역 쿼리 파라메터 값 읽기
      String BU_CD = (String)params.get("P_BU_CD");
      String EDI_DIV = (String)params.get("P_EDI_DIV");
      String DEFINE_NO = (String)params.get("P_DEFINE_NO");
      String SEND_DATE = (String)params.get("P_SEND_DATE");
      String SEND_NO = (String)params.get("P_SEND_NO");
      String PREFIX_FILE_NM = (String)params.get("P_PREFIX_FILE_NM");

      // 나머지 파라메터 값 읽기
      String USER_ID = (String)params.get(Consts.PK_USER_ID);
      String WEB_ROOT_PATH = getGlobalProperty("webapp.root");
      String EDI_SEND_PATH = getGlobalProperty("ediSendRoot");
      String EDI_SEND_FULLPATH = Util.getPathName(WEB_ROOT_PATH, EDI_SEND_PATH, EDI_DIV);

      // 서버 파일명 지정
      String ediSendDatetime = Util.getNowDate("yyyyMMddHHmmss");
      String ediSendFileName = Util.getNull(PREFIX_FILE_NM, USER_ID) + "_" + ediSendDatetime + "_" + BU_CD + "_"
        + EDI_DIV + "_" + DEFINE_NO + "_" + SEND_DATE.replaceAll("-", "") + "_" + SEND_NO + ".xml";

      String ediSendFileFullName = EDI_SEND_FULLPATH + ediSendFileName;
      String ediSendFileBackupPath = Util.getPathName(EDI_SEND_FULLPATH, Consts.BACKUP_DIR,
        ediSendDatetime.substring(0, 8));
      String ediSendFileBackupFullName = ediSendFileBackupPath + ediSendFileName;

      // upload dir이 존재하지 않으면 생성
      Util.createDir(EDI_SEND_FULLPATH, ediSendFileBackupPath);

      // 송신정의 상세내역 데이터 쿼리
      List list = nexosDAO.list(queryId, params);
      if (list == null || list.size() == 0) {
        throw new RuntimeException("[사업부,송신구분,송신정의번호,송신일자,송신번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO + ","
          + SEND_DATE + "," + SEND_NO + "]\n송신할 데이터가 존재하지 않습니다.");
      }

      int listCnt = list.size();
      Map<String, Object> rowData;

      nexos.service.ed.ws.elca.corpOnLineEcom.Coverpage coverpage = new nexos.service.ed.ws.elca.corpOnLineEcom.Coverpage();
      nexos.service.ed.ws.elca.corpOnLineEcom.Header header = new nexos.service.ed.ws.elca.corpOnLineEcom.Header();
      nexos.service.ed.ws.elca.corpOnLineEcom.Line[] line = new nexos.service.ed.ws.elca.corpOnLineEcom.Line[listCnt];

      for (int row = 0; row < listCnt; row++) {
        rowData = (HashMap<String, Object>)list.get(row);

        String MD_TYPE = (String)rowData.get("MD_TYPE");
        if ("M".equals(MD_TYPE)) {
          coverpage.setIZId("");
          coverpage.setIZTrxSequence("");
          coverpage.setIZUuid("");
          coverpage.setIZRecordStatus(new nexos.service.ed.ws.elca.corpOnLineEcom.IZRecordStatus(""));
          coverpage.setIZLargeFileFlag(new nexos.service.ed.ws.elca.corpOnLineEcom.IZLargeFileFlag(""));
          coverpage.setObjectType("");
          coverpage.setVersion("");
          coverpage.setAction(new nexos.service.ed.ws.elca.corpOnLineEcom.Action("CREATE"));
          coverpage.setObjectBusinessId((String)rowData.get("WMS_NO"));

          String DATETIME_STR = (String)rowData.get("DIRECTIONS_DATETIME");
          if (DATETIME_STR == null) {
            throw new RuntimeException("[사업부,송신구분,송신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
              + "]출고지시일시에 값이 없습니다. 데이터를 확인하십시오.");
          }
          coverpage.setApplicationTimestamp(DATETIME_STR);

          coverpage.setSourceApplication("CorpOnlineEcomKr");
          coverpage.setConfirmationIndicator(new nexos.service.ed.ws.elca.corpOnLineEcom.ConfirmationIndicator(""));
          coverpage.setAuditRequiredFlag(new nexos.service.ed.ws.elca.corpOnLineEcom.AuditRequiredFlag("N"));
          coverpage.setAdditionalRoutingFilters(new nexos.service.ed.ws.elca.corpOnLineEcom.AdditionalRoutingFilters());
          coverpage.setSplitControl(new nexos.service.ed.ws.elca.corpOnLineEcom.SplitControl());

          header.setDocumentId((String)rowData.get("BU_NO"));
          header.setDocumentType("B2BC");
          header.setReasonCode("Z20");
          header.setOrderType("Z3OS");
          header.setSalesOrganization("6210");
          header.setDistributionChannel("10");
          header.setBrandId((String)rowData.get("BRAND_CD"));

          DATETIME_STR = (String)rowData.get("BU_DATETIME");
          if (DATETIME_STR == null) {
            throw new RuntimeException("[사업부,송신구분,송신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
              + "]사업부전표일시에 값이 없습니다. 데이터를 확인하십시오.");
          }
          header.setOrderDate(DATETIME_STR);

          DATETIME_STR = (String)rowData.get("DELIVERY_DATETIME");
          if (DATETIME_STR == null) {
            throw new RuntimeException("[사업부,송신구분,송신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
              + "]배송일시에 값이 없습니다. 데이터를 확인하십시오.");
          }
          header.setRequestedDeliveryDate(DATETIME_STR);

          header.setSoldToParty(new nexos.service.ed.ws.elca.corpOnLineEcom.SoldToParty((String)rowData
            .get("SEND_BU_CD"), "", new nexos.service.ed.ws.elca.corpOnLineEcom.Address()));
          header.setShipToParty(new nexos.service.ed.ws.elca.corpOnLineEcom.ShipToParty("", "",
            new nexos.service.ed.ws.elca.corpOnLineEcom.Address2()));
        }

        line[row] = new nexos.service.ed.ws.elca.corpOnLineEcom.Line();
        line[row].setLineNumber((String)rowData.get("SEND_LINE_NO"));
        line[row].setMaterialNumber((String)rowData.get("ITEM_CD"));
        line[row].setQuantity((String)rowData.get("CONFIRM_QTY"));
        line[row].setUnitPrice((String)rowData.get("SUPPLY_PRICE"));
        line[row].setOrderType((String)rowData.get("ITEM_ORDER_DIV"));
      }

      nexos.service.ed.ws.elca.corpOnLineEcom.Doc_publishPurchaseOrderRequest request = new nexos.service.ed.ws.elca.corpOnLineEcom.Doc_publishPurchaseOrderRequest(
        coverpage, header, line);
      nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1 PublishPurchaseOrder_1 = new nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1(
        request);

      try {
        MessageElement me = new MessageElement(nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1
          .getTypeDesc().getXmlType(), PublishPurchaseOrder_1);
        FileUtils.writeStringToFile(new File(ediSendFileFullName), XMLUtils.DocumentToString(me.getAsDocument()),
          Consts.CHARSET);
      } catch (Exception e) {
        logger.info("EDCommonDAOImpl[sendESLOOrder_0010] Error", e);
      }

      resultMap.put(PK_SEND_FILE_FULL_NM, ediSendFileFullName);
      resultMap.put(PK_BACKUP_FILE_FULL_NM, ediSendFileBackupFullName);

      resultMap.put("O_DOCUMENT", PublishPurchaseOrder_1);

      resultMap.put(Consts.PK_O_MSG, Consts.OK);
    } catch (Exception e) {
      resultMap.put(Consts.PK_O_MSG, e.getMessage());
    } finally {

    }
    return resultMap;
  }

  @SuppressWarnings("unchecked")
  @Override
  public HashMap<String, Object> sendExcel(Map<String, Object> params) throws Exception {

    HashMap<String, Object> resultMap = new HashMap<String, Object>();

    final String DEFINE_INFO_ID = "EDCOMMON.RS_DEFINE_INFO";
    final String PK_SEND_FILE_FULL_NM = "O_SEND_FILE_FULL_NM";
    final String PK_BACKUP_FILE_FULL_NM = "O_BACKUP_FILE_FULL_NM";

    // 파일 생성 쿼리 파라메터 값 읽기
    String queryId = (String)params.get(Consts.PK_QUERY_ID);

    // 송신정의 상세내역 쿼리 파라메터 값 읽기
    String BU_CD = (String)params.get("P_BU_CD");
    String EDI_DIV = (String)params.get("P_EDI_DIV");
    String DEFINE_NO = (String)params.get("P_DEFINE_NO");
    String SEND_DATE = (String)params.get("P_SEND_DATE");
    String SEND_NO = (String)params.get("P_SEND_NO");
    String PREFIX_FILE_NM = (String)params.get("P_PREFIX_FILE_NM");
    // String FILE_DIV = (String)params.get("P_FILE_DIV");

    // 송신정의 상세내역 데이터 쿼리
    List defineList = nexosDAO.list(DEFINE_INFO_ID, params);
    if (defineList == null || defineList.size() == 0) {
      throw new RuntimeException("[사업부,송신구분,송신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
        + "]\n송신정의 내역이 등록되어 있지 않습니다.");
    }

    // 나머지 파라메터 값 읽기
    String USER_ID = (String)params.get(Consts.PK_USER_ID);
    String WEB_ROOT_PATH = getGlobalProperty("webapp.root");
    String EDI_SEND_PATH = getGlobalProperty("ediSendRoot");
    String EDI_SEND_FULLPATH = Util.getPathName(WEB_ROOT_PATH, EDI_SEND_PATH, EDI_DIV);

    // 서버 파일명 지정
    String ediSendDatetime = Util.getNowDate("yyyyMMddHHmmss");
    String ediSendFileName = Util.getNull(PREFIX_FILE_NM, USER_ID) + "_" + ediSendDatetime + "_" + BU_CD + "_"
      + EDI_DIV + "_" + DEFINE_NO + "_" + SEND_DATE.replaceAll("-", "") + "_" + SEND_NO + ".xls";
    String ediSendFileFullName = EDI_SEND_FULLPATH + ediSendFileName;
    String ediSendFileBackupPath = Util.getPathName(EDI_SEND_FULLPATH, Consts.BACKUP_DIR,
      ediSendDatetime.substring(0, 8));
    String ediSendFileBackupFullName = ediSendFileBackupPath + ediSendFileName;

    // upload dir이 존재하지 않으면 생성
    Util.createDir(EDI_SEND_FULLPATH, ediSendFileBackupPath);

    int xlsCol;
    String xlsColumn_Nm = null;
    String COLUMN_NM = null;
    String data_Type = null;

    // 실제 정의한 컬럼만 추출
    Vector<Object> vtColumn;
    Map<String, Object> column = null;
    int columnCount = defineList.size();
    ArrayList<Vector<Object>> columns = new ArrayList<Vector<Object>>();
    for (int i = 0; i < columnCount; i++) {
      column = (HashMap<String, Object>)defineList.get(i);
      try {
        COLUMN_NM = (String)column.get("COLUMN_NM");
        data_Type = (String)column.get("DATA_TYPE");
        xlsColumn_Nm = (String)column.get("XLS_COLUMN_NM");

        if (!Util.isNull(xlsColumn_Nm) && !Util.isNull(COLUMN_NM)) {
          vtColumn = new Vector<Object>();
          vtColumn.add(COLUMN_NM);
          if (data_Type == null) {
            data_Type = "1"; // Null이면 문자
          }
          vtColumn.add(data_Type);
          vtColumn.add(xlsColumn_Nm);
          vtColumn.add(getXLSColumnIndex(xlsColumn_Nm));
          columns.add(vtColumn);
        }
      } catch (Exception e) {
      }
    }
    columnCount = columns.size();
    if (columnCount == 0) {
      throw new RuntimeException("[사업부,송신구분,송신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
        + "]\n송신정의 컬럼 중 처리 가능한 컬럼이 없습니다.");
    }

    // 송신정의 상세내역 데이터 쿼리
    List list = nexosDAO.list(queryId, params);
    if (list == null || list.size() == 0) {
      throw new RuntimeException("[사업부,송신구분,송신정의번호,송신일자,송신번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO + ","
        + SEND_DATE + "," + SEND_NO + "]\n송신할 데이터가 존재하지 않습니다.");
    }

    // 엑셀 관련 상수
    final int XLS_MAX_ROW = 65001;
    final String XLS_FONT_NM = "굴림체";
    final short XLS_FONT_SIZE = 9 * 20;
    final short XLS_ROW_HEIGHT = 18 * 20;
    // final String CT_STRING = "1";
    final String CT_DATE = "2";
    final String CT_NUMBER = "3";

    SimpleDateFormat stringDateFormat = new SimpleDateFormat(Consts.DATE_FORMAT);
    SimpleDateFormat stringDatetimeFormat = new SimpleDateFormat(Consts.DATETIME_FORMAT);

    // 엑셀 관련 Object 생성
    FileOutputStream xlsFile = null;
    HSSFWorkbook xlsWorkbook = new HSSFWorkbook();
    HSSFSheet xlsSheet = null;

    HSSFDataFormat xlsDataFormat = xlsWorkbook.createDataFormat();
    // Header Font
    HSSFFont xlsHeaderFont = xlsWorkbook.createFont();
    xlsHeaderFont.setFontName(XLS_FONT_NM);
    xlsHeaderFont.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD);
    xlsHeaderFont.setFontHeight(XLS_FONT_SIZE);
    xlsHeaderFont.setColor(HSSFColor.DARK_BLUE.index);

    // Header Cell
    HSSFCellStyle xlsHeaderCell = xlsWorkbook.createCellStyle();
    xlsHeaderCell.setBorderLeft(HSSFCellStyle.BORDER_THIN);
    xlsHeaderCell.setBorderRight(HSSFCellStyle.BORDER_THIN);
    xlsHeaderCell.setBorderTop(HSSFCellStyle.BORDER_THIN);
    xlsHeaderCell.setBorderBottom(HSSFCellStyle.BORDER_THIN);
    xlsHeaderCell.setLeftBorderColor(HSSFColor.BLACK.index);
    xlsHeaderCell.setRightBorderColor(HSSFColor.BLACK.index);
    xlsHeaderCell.setTopBorderColor(HSSFColor.BLACK.index);
    xlsHeaderCell.setBottomBorderColor(HSSFColor.BLACK.index);
    xlsHeaderCell.setFillForegroundColor(HSSFColor.PALE_BLUE.index);
    xlsHeaderCell.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
    xlsHeaderCell.setFont(xlsHeaderFont);
    xlsHeaderCell.setAlignment(HSSFCellStyle.ALIGN_CENTER);
    xlsHeaderCell.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);
    xlsHeaderCell.setDataFormat(HSSFDataFormat.getBuiltinFormat("text"));

    // Data Cell Font
    HSSFFont xlsCellFont = xlsWorkbook.createFont();
    xlsCellFont.setFontName(XLS_FONT_NM);
    xlsCellFont.setFontHeight(XLS_FONT_SIZE);

    // String Cell
    HSSFCellStyle xlsStringCell = xlsWorkbook.createCellStyle();
    xlsStringCell.setBorderLeft(HSSFCellStyle.BORDER_THIN);
    xlsStringCell.setBorderRight(HSSFCellStyle.BORDER_THIN);
    xlsStringCell.setBorderTop(HSSFCellStyle.BORDER_THIN);
    xlsStringCell.setBorderBottom(HSSFCellStyle.BORDER_THIN);
    xlsStringCell.setLeftBorderColor(HSSFColor.BLACK.index);
    xlsStringCell.setRightBorderColor(HSSFColor.BLACK.index);
    xlsStringCell.setTopBorderColor(HSSFColor.BLACK.index);
    xlsStringCell.setBottomBorderColor(HSSFColor.BLACK.index);
    xlsStringCell.setFont(xlsCellFont);
    xlsStringCell.setAlignment(HSSFCellStyle.ALIGN_LEFT);
    xlsStringCell.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);
    xlsStringCell.setDataFormat(HSSFDataFormat.getBuiltinFormat("text"));

    // Number Cell
    HSSFCellStyle xlsNumberCell = xlsWorkbook.createCellStyle();
    xlsNumberCell.setBorderLeft(HSSFCellStyle.BORDER_THIN);
    xlsNumberCell.setBorderRight(HSSFCellStyle.BORDER_THIN);
    xlsNumberCell.setBorderTop(HSSFCellStyle.BORDER_THIN);
    xlsNumberCell.setBorderBottom(HSSFCellStyle.BORDER_THIN);
    xlsNumberCell.setLeftBorderColor(HSSFColor.BLACK.index);
    xlsNumberCell.setRightBorderColor(HSSFColor.BLACK.index);
    xlsNumberCell.setTopBorderColor(HSSFColor.BLACK.index);
    xlsNumberCell.setBottomBorderColor(HSSFColor.BLACK.index);
    xlsNumberCell.setFont(xlsCellFont);
    xlsNumberCell.setAlignment(HSSFCellStyle.ALIGN_RIGHT);
    xlsNumberCell.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);
    xlsNumberCell.setDataFormat(HSSFDataFormat.getBuiltinFormat("#,##0"));

    // Date Cell
    HSSFCellStyle xlsDateCell = xlsWorkbook.createCellStyle();
    xlsDateCell.setBorderLeft(HSSFCellStyle.BORDER_THIN);
    xlsDateCell.setBorderRight(HSSFCellStyle.BORDER_THIN);
    xlsDateCell.setBorderTop(HSSFCellStyle.BORDER_THIN);
    xlsDateCell.setBorderBottom(HSSFCellStyle.BORDER_THIN);
    xlsDateCell.setLeftBorderColor(HSSFColor.BLACK.index);
    xlsDateCell.setRightBorderColor(HSSFColor.BLACK.index);
    xlsDateCell.setTopBorderColor(HSSFColor.BLACK.index);
    xlsDateCell.setBottomBorderColor(HSSFColor.BLACK.index);
    xlsDateCell.setFont(xlsCellFont);
    xlsDateCell.setAlignment(HSSFCellStyle.ALIGN_RIGHT);
    xlsDateCell.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);
    xlsDateCell.setDataFormat(xlsDataFormat.getFormat("yyyy-mm-dd hh:mm:ss"));

    // 현재 Row
    int currentRow = 0;
    // 현재 Sheet
    int currentSheet = 1;

    Iterator iterator = list.iterator();
    Map<String, Object> rowData = null;
    HSSFRow xlsRow = null;
    HSSFCell xlsCell = null;
    try {
      xlsFile = new FileOutputStream(ediSendFileFullName);
      xlsSheet = xlsWorkbook.createSheet("SEND_" + EDI_DIV + " (1)");

      while (iterator.hasNext()) {
        rowData = (HashMap)iterator.next();

        // Row가 0이면 컬럼헤더 정보 생성
        if (currentRow == 0) {
          // 첫번째 Sheet에서만 컬럼 헤더 정보 생성
          xlsRow = xlsSheet.createRow(currentRow);
          xlsRow.setHeight(XLS_ROW_HEIGHT);
          for (int col = 0; col < columnCount; col++) {
            vtColumn = columns.get(col);

            COLUMN_NM = (String)vtColumn.get(0);
            xlsColumn_Nm = (String)vtColumn.get(2);
            xlsCol = (Integer)vtColumn.get(3);

            xlsCell = xlsRow.createCell(xlsCol);
            xlsCell.setCellStyle(xlsHeaderCell);
            xlsCell.setCellValue(new HSSFRichTextString(COLUMN_NM));

            xlsSheet.setColumnWidth(col, (COLUMN_NM.length() + 2) * 256);
          }
          currentRow = 1;
        }

        // Row 기록
        xlsRow = xlsSheet.createRow(currentRow);
        xlsRow.setHeight(XLS_ROW_HEIGHT);
        for (int col = 0; col < columnCount; col++) {
          vtColumn = columns.get(col);

          COLUMN_NM = (String)vtColumn.get(0);
          data_Type = (String)vtColumn.get(1);
          xlsCol = (Integer)vtColumn.get(3);
          Object columnValue = rowData.get(COLUMN_NM);

          xlsCell = xlsRow.createCell(xlsCol);
          try {
            if (CT_DATE.equals(data_Type)) {
              xlsCell.setCellStyle(xlsDateCell);
              if (columnValue == null) {
                continue;
              }

              String value = (String)columnValue;
              if (value.length() == 10) {
                xlsCell.setCellValue(stringDateFormat.parse(value));
              } else {
                xlsCell.setCellValue(stringDatetimeFormat.parse(value));
              }

            } else if (CT_NUMBER.equals(data_Type)) {
              xlsCell.setCellStyle(xlsNumberCell);
              if (columnValue == null) {
                continue;
              }

              xlsCell.setCellValue(Double.valueOf((String)columnValue));

            } else {
              xlsCell.setCellStyle(xlsStringCell);
              if (columnValue == null) {
                continue;
              }

              xlsCell.setCellValue(new HSSFRichTextString((String)columnValue));
            }
          } catch (Exception e) {
            logger.error(e.getMessage());
            xlsCell.setCellStyle(xlsStringCell);
            xlsCell.setCellValue(new HSSFRichTextString(""));
          }
        }

        // RowCount 증가
        currentRow++;

        // Sheet분할
        if (currentRow == XLS_MAX_ROW) {
          // Row 수 초기화
          currentRow = 0;
          // 새로운 Sheet만들기
          currentSheet++;
          xlsSheet = xlsWorkbook.createSheet("SEND_" + EDI_DIV + " (" + currentSheet + ")");
        }
      }

      // Excel 쓰기
      xlsWorkbook.write(xlsFile);
      resultMap.put(PK_SEND_FILE_FULL_NM, ediSendFileFullName);
      resultMap.put(PK_BACKUP_FILE_FULL_NM, ediSendFileBackupFullName);
      resultMap.put(Consts.PK_O_MSG, Consts.OK);
    } catch (Exception e) {
      resultMap.put(Consts.PK_O_MSG, e.getMessage());
    } finally {
      try {
        xlsSheet = null;
        xlsWorkbook = null;
        if (xlsFile != null) {
          xlsFile.close();
          xlsFile = null;
        }
      } catch (Exception e) {
        logger.error(e.getMessage());
      }
    }
    return resultMap;
  }

  @SuppressWarnings("unchecked")
  @Override
  public HashMap<String, Object> sendText(Map<String, Object> params) throws Exception {

    HashMap<String, Object> resultMap = new HashMap<String, Object>();

    final String DEFINE_INFO_ID = "EDCOMMON.RS_DEFINE_INFO";
    final String PK_SEND_FILE_FULL_NM = "O_SEND_FILE_FULL_NM";
    final String PK_BACKUP_FILE_FULL_NM = "O_BACKUP_FILE_FULL_NM";
    // EUC-KR은 KS X 1001과 KS X 1003 표준안의 인코딩 방식이며,
    // CP949(MS949, x-windows-949)는 확장 완성형의 인코딩 방식이다.
    // 그러므로 EUC-KR은 2,350자의 한글, CP949는 11,172자의 한글을 표현할 수 있다.
    // 그러나 Java에서는 CP949와 MS949를 다르게 취급한다.
    // CP949는 IBM에서 처음 지정한 코드 페이지(sun.nio.cs.ext.IBM949)가 기준이고
    // Microsoft가 제정한 확장 완성형은 MS949(sun.nio.cs.ext.MS949)를 기준이다.
    // 그러므로 Java에서는 CP949와 EUC-KR이 사실상 같으며,
    // 확장 완성형을 사용하기 위해서는 MS949로 지정해야 한다.
    final String KR_CHARSET = "MS949";

    // edi dir로 파일 생성
    FileOutputStream txtFileOutput = null;
    OutputStreamWriter txtFileOutputWriter = null;
    BufferedWriter txtFileWriter = null;
    try {

      // 파일 생성 쿼리 파라메터 값 읽기
      String queryId = (String)params.get(Consts.PK_QUERY_ID);

      // 송신정의 상세내역 쿼리 파라메터 값 읽기
      String BU_CD = (String)params.get("P_BU_CD");
      String EDI_DIV = (String)params.get("P_EDI_DIV");
      String DEFINE_NO = (String)params.get("P_DEFINE_NO");
      String SEND_DATE = (String)params.get("P_SEND_DATE");
      String SEND_NO = (String)params.get("P_SEND_NO");
      String PREFIX_FILE_NM = (String)params.get("P_PREFIX_FILE_NM");
      String FILE_DIV = (String)params.get("P_FILE_DIV");

      // 송신정의 상세내역 데이터 쿼리
      List defineList = nexosDAO.list(DEFINE_INFO_ID, params);
      if (defineList == null || defineList.size() == 0) {
        throw new RuntimeException("[사업부,송신구분,송신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\n송신정의 내역이 등록되어 있지 않습니다.");
      }

      // 나머지 파라메터 값 읽기
      String USER_ID = (String)params.get(Consts.PK_USER_ID);
      String WEB_ROOT_PATH = getGlobalProperty("webapp.root");
      String EDI_SEND_PATH = getGlobalProperty("ediSendRoot");
      String EDI_SEND_FULLPATH = Util.getPathName(WEB_ROOT_PATH, EDI_SEND_PATH, EDI_DIV);
      String ediSendFileName;

      logger.info("EDI_DIV : " + EDI_DIV);
      // 서버 파일명 지정
      String ediSendDatetime = Util.getNowDate("yyyyMMddHHmmss");
      if ("SWB10".equals(EDI_DIV)) {
        ediSendFileName = Util.getNull(PREFIX_FILE_NM, USER_ID) + "_" + ediSendDatetime + "_" + BU_CD + "_" + SEND_NO
          + ".txt";
      } else if ("SWB20".equals(EDI_DIV)) {
        ediSendFileName = Util.getNull(PREFIX_FILE_NM, USER_ID) + SEND_DATE.replaceAll("-", "") + BU_CD + SEND_NO
          + ".txt";
      } else {
        ediSendFileName = Util.getNull(PREFIX_FILE_NM, USER_ID) + "_" + ediSendDatetime + "_" + BU_CD + "_" + EDI_DIV
          + "_" + DEFINE_NO + "_" + SEND_DATE.replaceAll("-", "") + "_" + SEND_NO + ".txt";
      }
      logger.info("[EDI SEND FILENAME] : " + ediSendFileName);

      String ediSendFileFullName = EDI_SEND_FULLPATH + ediSendFileName;
      String ediSendFileBackupPath = Util.getPathName(EDI_SEND_FULLPATH, Consts.BACKUP_DIR,
        ediSendDatetime.substring(0, 8));
      String ediSendFileBackupFullName = ediSendFileBackupPath + ediSendFileName;

      // upload dir이 존재하지 않으면 생성
      Util.createDir(EDI_SEND_FULLPATH, ediSendFileBackupPath);

      // 송신정의에서 기본 정보 읽기
      Map<String, Object> column = (HashMap<String, Object>)defineList.get(0);
      String txtDelimeterYn = (String)column.get("TXT_DELIMETER_YN");
      String txtColDelimeter = (String)column.get("TXT_COL_DELIMETER");
      String txtCharset = (String)column.get("REMOTE_CHARSET");

      if (Consts.YES.equals(txtDelimeterYn) && Util.isNull(txtColDelimeter)) {
        throw new RuntimeException("[사업부,송신구분,송신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\n텍스트 컬럼 구분자가 지정되지 않았습니다.");
      }

      int txtPosition = -1;
      int txtLength = -1;
      String COLUMN_NM = null;
      String COLUMN_VAL = null;

      // 실제 정의한 컬럼만 추출
      Vector<Object> vtColumn;
      int columnCount = defineList.size();
      ArrayList<Vector<Object>> columns = new ArrayList<Vector<Object>>();

      for (int i = 0; i < columnCount; i++) {
        column = (HashMap<String, Object>)defineList.get(i);

        try {
          COLUMN_NM = (String)column.get("COLUMN_NM");
          txtPosition = ((Number)column.get("TXT_POSITION")).intValue();
          txtLength = ((Number)column.get("TXT_LENGTH")).intValue();

          if (txtPosition > -1 && txtLength > 0 && !Util.isNull(COLUMN_NM)) {
            vtColumn = new Vector<Object>();
            vtColumn.add(COLUMN_NM);
            vtColumn.add(txtPosition);
            vtColumn.add(txtLength);
            columns.add(vtColumn);
          }
        } catch (Exception e) {
        }
      }
      columnCount = columns.size();
      if (columnCount == 0) {
        throw new RuntimeException("[사업부,송신구분,송신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\n송신정의 컬럼 중 처리 가능한 컬럼이 없습니다.");
      }
      // 컬럼정보를 Position으로 재정렬
      Collections.sort(columns, this);

      // 송신정의 상세내역 데이터 쿼리
      List list = nexosDAO.list(queryId, params);
      if (list == null || list.size() == 0) {
        throw new RuntimeException("[사업부,송신구분,송신정의번호,송신일자,송신번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO + ","
          + SEND_DATE + "," + SEND_NO + "]\n송신할 데이터가 존재하지 않습니다.");
      }

      txtFileOutput = new FileOutputStream(ediSendFileFullName);
      txtFileOutputWriter = new OutputStreamWriter(txtFileOutput, txtCharset);
      txtFileWriter = new BufferedWriter(txtFileOutputWriter);

      int listCnt = list.size();
      Map<String, Object> rowData;
      StringBuffer sbWriteBuffer = new StringBuffer();
      byte[ ] txtLineBytes = null;

      // 컬럼 구분자로 처리일 경우
      if (Consts.YES.equals(txtDelimeterYn)) {
        for (int row = 0; row < listCnt; row++) {
          rowData = (HashMap<String, Object>)list.get(row);
          sbWriteBuffer.setLength(0);
          for (int col = 0; col < columnCount; col++) {
            vtColumn = columns.get(col);

            COLUMN_NM = (String)vtColumn.get(0);
            txtPosition = (Integer)vtColumn.get(1);
            txtLength = (Integer)vtColumn.get(2);

            COLUMN_VAL = (String)rowData.get(COLUMN_NM);

            if (COLUMN_VAL != null) {
              txtLineBytes = COLUMN_VAL.getBytes(KR_CHARSET);
              sbWriteBuffer.append(new String(txtLineBytes, 0, Math.min(txtLineBytes.length, txtLength), KR_CHARSET));
            }
            sbWriteBuffer.append(txtColDelimeter);
          }
          if (sbWriteBuffer.length() > 0) {
            sbWriteBuffer.delete(sbWriteBuffer.length() - txtColDelimeter.length(), sbWriteBuffer.length());
          }
          txtFileWriter.write(sbWriteBuffer.toString());
          txtFileWriter.write(Consts.CRLF);
        }
      } else {
        // 위치/길이로 처리
        for (int row = 0; row < listCnt; row++) {
          rowData = (HashMap<String, Object>)list.get(row);
          sbWriteBuffer.setLength(0);
          for (int col = 0; col < columnCount; col++) {
            vtColumn = columns.get(col);

            COLUMN_NM = (String)vtColumn.get(0);
            txtPosition = (Integer)vtColumn.get(1);
            txtLength = (Integer)vtColumn.get(2);

            COLUMN_VAL = (String)rowData.get(COLUMN_NM);

            if (COLUMN_VAL == null) {
              txtLineBytes = new byte[1];
              txtLineBytes[0] = 32;
            } else {
              txtLineBytes = COLUMN_VAL.getBytes(KR_CHARSET);
            }
            if (txtLineBytes.length > txtLength) {
              sbWriteBuffer.append(new String(txtLineBytes, 0, txtLength, KR_CHARSET));
            } else {
              byte[ ] newTxtLineBytes = new byte[txtLength];
              System.arraycopy(txtLineBytes, 0, newTxtLineBytes, 0, txtLineBytes.length);
              for (int i = txtLineBytes.length; i < txtLength; i++) {
                newTxtLineBytes[i] = 32;
              }
              sbWriteBuffer.append(new String(newTxtLineBytes, 0, txtLength, KR_CHARSET));
            }
          }
          txtFileWriter.write(sbWriteBuffer.toString());
          txtFileWriter.write(Consts.CRLF);
        }
      }

      if (Consts.FILE_DIV_DOC.equals(FILE_DIV)) {
        FileInputStream txtFileInput = null;
        InputStreamReader txtFileInputReader = null;
        BufferedReader txtFileReader = null;
        StringBuffer txtBuffer = new StringBuffer();
        try {
          txtFileInput = new FileInputStream(ediSendFileFullName);
          txtFileInputReader = new InputStreamReader(txtFileInput, txtCharset);
          txtFileReader = new BufferedReader(txtFileInputReader);

          String txtLine = null;
          while ((txtLine = txtFileReader.readLine()) != null) {
            txtBuffer.append(txtLine).append(Consts.CRLF);
          }
        } catch (Exception e) {
          logger.error(e.getMessage());
        } finally {
          try {
            if (txtFileReader != null) {
              txtFileReader.close();
            }
          } catch (Exception e) {
            logger.error(e.getMessage());
          }
          try {
            if (txtFileInputReader != null) {
              txtFileInputReader.close();
            }
          } catch (Exception e) {
            logger.error(e.getMessage());
          }
          try {
            if (txtFileInput != null) {
              txtFileInput.close();
            }
          } catch (Exception e) {
            logger.error(e.getMessage());
          }
        }
        resultMap.put("O_DOCUMENT", txtBuffer.toString());
      }

      resultMap.put(PK_SEND_FILE_FULL_NM, ediSendFileFullName);
      resultMap.put(PK_BACKUP_FILE_FULL_NM, ediSendFileBackupFullName);
      resultMap.put(Consts.PK_O_MSG, Consts.OK);
    } catch (Exception e) {
      resultMap.put(Consts.PK_O_MSG, e.getMessage());
    } finally {
      try {
        if (txtFileWriter != null) {
          txtFileWriter.close();
        }
      } catch (Exception e) {
        logger.error(e.getMessage());
      }
      try {
        if (txtFileOutputWriter != null) {
          txtFileOutputWriter.close();
        }
      } catch (Exception e) {
        logger.error(e.getMessage());
      }
      try {
        if (txtFileOutput != null) {
          txtFileOutput.close();
        }
      } catch (Exception e) {
        logger.error(e.getMessage());
      }
    }
    return resultMap;
  }

  @SuppressWarnings("unchecked")
  @Override
  public HashMap<String, Object> sendXML(Map<String, Object> params) throws Exception {

    HashMap<String, Object> resultMap = new HashMap<String, Object>();

    final String DEFINE_INFO_ID = "EDCOMMON.RS_DEFINE_INFO";
    final String PK_SEND_FILE_FULL_NM = "O_SEND_FILE_FULL_NM";
    final String PK_BACKUP_FILE_FULL_NM = "O_BACKUP_FILE_FULL_NM";

    // edi dir로 파일 생성
    FileOutputStream xmlFileOutput = null;
    OutputStreamWriter xmlFileOutputWriter = null;
    BufferedWriter xmlFileWriter = null;
    try {

      // 파일 생성 쿼리 파라메터 값 읽기
      String queryId = (String)params.get(Consts.PK_QUERY_ID);

      // 송신정의 상세내역 쿼리 파라메터 값 읽기
      String BU_CD = (String)params.get("P_BU_CD");
      String EDI_DIV = (String)params.get("P_EDI_DIV");
      String DEFINE_NO = (String)params.get("P_DEFINE_NO");
      String SEND_DATE = (String)params.get("P_SEND_DATE");
      String SEND_NO = (String)params.get("P_SEND_NO");
      String PREFIX_FILE_NM = (String)params.get("P_PREFIX_FILE_NM");
      String FILE_DIV = (String)params.get("P_FILE_DIV");

      // 송신정의 상세내역 데이터 쿼리
      List defineList = nexosDAO.list(DEFINE_INFO_ID, params);
      if (defineList == null || defineList.size() == 0) {
        throw new RuntimeException("[사업부,송신구분,송신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\n송신정의 내역이 등록되어 있지 않습니다.");
      }

      // 나머지 파라메터 값 읽기
      String USER_ID = (String)params.get(Consts.PK_USER_ID);
      String WEB_ROOT_PATH = getGlobalProperty("webapp.root");
      String EDI_SEND_PATH = getGlobalProperty("ediSendRoot");
      String EDI_SEND_FULLPATH = Util.getPathName(WEB_ROOT_PATH, EDI_SEND_PATH, EDI_DIV);

      // 서버 파일명 지정
      String ediSendDatetime = Util.getNowDate("yyyyMMddHHmmss");
      String ediSendFileName = Util.getNull(PREFIX_FILE_NM, USER_ID) + "_" + ediSendDatetime + "_" + BU_CD + "_"
        + EDI_DIV + "_" + DEFINE_NO + "_" + SEND_DATE.replaceAll("-", "") + "_" + SEND_NO + ".xml";

      String ediSendFileFullName = EDI_SEND_FULLPATH + ediSendFileName;
      String ediSendFileBackupPath = Util.getPathName(EDI_SEND_FULLPATH, Consts.BACKUP_DIR,
        ediSendDatetime.substring(0, 8));
      String ediSendFileBackupFullName = ediSendFileBackupPath + ediSendFileName;

      // upload dir이 존재하지 않으면 생성
      Util.createDir(EDI_SEND_FULLPATH, ediSendFileBackupPath);

      // 송신정의에서 기본 정보 읽기
      Map<String, Object> column = (HashMap<String, Object>)defineList.get(0);
      String xmlTagRoot = (String)column.get("XML_TAG_ROOT");
      String xmlTagBunch = (String)column.get("XML_TAG_BUNCH");
      String xmlTagSubBunch = (String)column.get("XML_TAG_SUB_BUNCH");

      if (Util.isNull(xmlTagRoot)) {
        throw new RuntimeException("[사업부,송신구분,송신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\nXML 루트태그가 정의되지 않았습니다.");
      }
      if (Util.isNull(xmlTagBunch) && Util.isNull(xmlTagSubBunch)) {
        throw new RuntimeException("[사업부,송신구분,송신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\nXML 단위태그가 정의되지 않았습니다.");
      }
      if (!Util.isNull(xmlTagSubBunch)) {
        if (xmlTagBunch.indexOf("#DETAIL_DATA#") == -1) {
          throw new RuntimeException("[사업부,송신구분,송신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
            + "]\nXML 마스터 태그에 #DETAIL_DATA#에 대한 정의가 되어 있지 않습니다.");
        }
      } else {
        if (xmlTagRoot.indexOf("#MASTER_DATA#") == -1) {
          throw new RuntimeException("[사업부,송신구분,송신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
            + "]\nXML 루트 태그에 #MASTER_DATA#에 대한 정의가 되어 있지 않습니다.");
        }
      }

      String COLUMN_NM = null;
      String COLUMN_VAL = null;

      // 실제 정의한 컬럼만 추출
      Vector<Object> vtColumn;
      int columnCount = defineList.size();
      ArrayList<Vector<Object>> columns = new ArrayList<Vector<Object>>();

      for (int i = 0; i < columnCount; i++) {
        column = (HashMap<String, Object>)defineList.get(i);
        try {
          COLUMN_NM = (String)column.get("COLUMN_NM");

          if (!Util.isNull(COLUMN_NM)) {
            vtColumn = new Vector<Object>();
            vtColumn.add(COLUMN_NM);
            columns.add(vtColumn);
          }
        } catch (Exception e) {
        }
      }
      columnCount = columns.size();
      if (columnCount == 0) {
        throw new RuntimeException("[사업부,송신구분,송신정의번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO
          + "]\n송신정의 컬럼 중 처리 가능한 컬럼이 없습니다.");
      }

      // 송신정의 상세내역 데이터 쿼리
      List list = nexosDAO.list(queryId, params);
      if (list == null || list.size() == 0) {
        throw new RuntimeException("[사업부,송신구분,송신정의번호,송신일자,송신번호: " + BU_CD + "," + EDI_DIV + "," + DEFINE_NO + ","
          + SEND_DATE + "," + SEND_NO + "]\n송신할 데이터가 존재하지 않습니다.");
      }

      xmlFileOutput = new FileOutputStream(ediSendFileFullName);
      xmlFileOutputWriter = new OutputStreamWriter(xmlFileOutput);
      xmlFileWriter = new BufferedWriter(xmlFileOutputWriter);

      int listCnt = list.size();
      Map<String, Object> rowData;

      String xmlCurrTagRoot = xmlTagRoot;
      String xmlCurrTagBunch = xmlTagBunch;
      String xmlCurrTagSubBunch = xmlTagSubBunch;
      ArrayList<String> xmlCurrTagBunchList = new ArrayList<String>();

      StringBuffer sbWriteBuffer = new StringBuffer();
      if (xmlTagSubBunch == null) {
        // 마스터 데이터 처리
        for (int row = 0; row < listCnt; row++) {
          rowData = (HashMap<String, Object>)list.get(row);

          xmlCurrTagBunch = xmlTagBunch;
          for (int col = 0; col < columnCount; col++) {
            vtColumn = columns.get(col);

            COLUMN_NM = (String)vtColumn.get(0);
            COLUMN_VAL = (String)rowData.get(COLUMN_NM);
            if (COLUMN_VAL == null) {
              COLUMN_VAL = "";
            }
            xmlCurrTagBunch = xmlCurrTagBunch.replaceAll("#" + COLUMN_NM + "#", COLUMN_VAL);
          }
          xmlCurrTagBunchList.add(xmlCurrTagBunch);
        }

        for (int i = 0, bunchCount = xmlCurrTagBunchList.size(); i < bunchCount; i++) {
          sbWriteBuffer.append(xmlCurrTagBunchList.get(i)).append(Consts.CRLF);
        }
        xmlCurrTagBunchList.clear();
        xmlCurrTagRoot = xmlCurrTagRoot.replaceFirst("#MASTER_DATA#", sbWriteBuffer.toString());
        sbWriteBuffer.setLength(0);
      } else {
        // 마스터/디테일 데이터 처리
        ArrayList<String> xmlCurrTagSubBunchList = new ArrayList<String>();
        for (int row = 0; row < listCnt; row++) {
          rowData = (HashMap<String, Object>)list.get(row);

          if ("M".equals(rowData.get("MD_TYPE"))) {
            // 이전 데이터 처리
            if (!xmlCurrTagSubBunchList.isEmpty()) {

              for (int i = 0, bunchCount = xmlCurrTagSubBunchList.size(); i < bunchCount; i++) {
                sbWriteBuffer.append(xmlCurrTagSubBunchList.get(i)).append(Consts.CRLF);
              }
              xmlCurrTagSubBunchList.clear();
              xmlCurrTagBunch = xmlCurrTagBunch.replaceFirst("#DETAIL_DATA#", sbWriteBuffer.toString());
              sbWriteBuffer.setLength(0);

              xmlCurrTagBunchList.add(xmlCurrTagBunch);
            }

            xmlCurrTagBunch = xmlTagBunch;
          }

          xmlCurrTagSubBunch = xmlTagSubBunch;
          for (int col = 0; col < columnCount; col++) {
            vtColumn = columns.get(col);

            COLUMN_NM = (String)vtColumn.get(0);
            COLUMN_VAL = (String)rowData.get(COLUMN_NM);
            if (COLUMN_VAL == null) {
              COLUMN_VAL = "";
            }
            xmlCurrTagBunch = xmlCurrTagBunch.replaceAll("#" + COLUMN_NM + "#", COLUMN_VAL);
            xmlCurrTagSubBunch = xmlCurrTagSubBunch.replaceAll("#" + COLUMN_NM + "#", COLUMN_VAL);
          }
          xmlCurrTagSubBunchList.add(xmlCurrTagSubBunch);
        }

        // 이전 데이터 처리
        if (!xmlCurrTagSubBunchList.isEmpty()) {

          sbWriteBuffer.setLength(0);
          for (int i = 0, bunchCount = xmlCurrTagSubBunchList.size(); i < bunchCount; i++) {
            sbWriteBuffer.append(xmlCurrTagSubBunchList.get(i)).append(Consts.CRLF);
          }
          xmlCurrTagSubBunchList.clear();
          xmlCurrTagBunch = xmlCurrTagBunch.replaceFirst("#DETAIL_DATA#", sbWriteBuffer.toString());
          xmlCurrTagBunchList.add(xmlCurrTagBunch);
        }

        sbWriteBuffer.setLength(0);
        for (int i = 0, bunchCount = xmlCurrTagBunchList.size(); i < bunchCount; i++) {
          sbWriteBuffer.append(xmlCurrTagBunchList.get(i)).append(Consts.CRLF);
        }
        xmlCurrTagBunchList.clear();
        xmlCurrTagRoot = xmlCurrTagRoot.replaceFirst("#MASTER_DATA#", sbWriteBuffer.toString());
        sbWriteBuffer.setLength(0);
      }
      xmlFileWriter.write(xmlCurrTagRoot);

      resultMap.put(PK_SEND_FILE_FULL_NM, ediSendFileFullName);
      resultMap.put(PK_BACKUP_FILE_FULL_NM, ediSendFileBackupFullName);

      if (Consts.FILE_DIV_DOC.equals(FILE_DIV)) {
        resultMap.put("O_DOCUMENT", xmlCurrTagRoot);
      }

      resultMap.put(Consts.PK_O_MSG, Consts.OK);
    } catch (Exception e) {
      resultMap.put(Consts.PK_O_MSG, e.getMessage());
    } finally {
      try {
        if (xmlFileWriter != null) {
          xmlFileWriter.close();
        }
      } catch (Exception e) {
        logger.error(e.getMessage());
      }
      try {
        if (xmlFileOutputWriter != null) {
          xmlFileOutputWriter.close();
        }
      } catch (Exception e) {
        logger.error(e.getMessage());
      }
      try {
        if (xmlFileOutput != null) {
          xmlFileOutput.close();
        }
      } catch (Exception e) {
        logger.error(e.getMessage());
      }
    }
    return resultMap;
  }

}
