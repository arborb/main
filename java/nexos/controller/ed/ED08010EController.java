package nexos.controller.ed;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import nexos.common.Consts;
import nexos.common.Util;
import nexos.controller.common.CommonController;
import nexos.service.ed.ED08010EService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Class: [송신]CJ대한통운 택배 관리<br>
 * Description: [송신]CJ대한통운 택배 관리 Controller<br>
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
@Controller
@RequestMapping("/ED08010E")
public class ED08010EController extends CommonController {

  @Resource
  private ED08010EService service;

  /**
   * 데이터 조회
   * 
   * @param request HttpServletRequest
   * @param queryId 쿼리ID
   * @param queryParams 쿼리 호출 파라메터
   * @return
   */
  @RequestMapping(value = "/getDataSet.do", method = RequestMethod.POST)
  public ResponseEntity<String> getDataSet(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_ID) String queryId, @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.getDataSet(queryId, params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 송신 다운로드 처리
   * 
   * @param request
   * @param ediFile
   * @param queryId
   * @param queryParams
   * @return
   */
  @RequestMapping(value = "/sendFileDownload.do", method = RequestMethod.POST)
  public ResponseEntity<String> sendFileDownload(HttpServletRequest request, HttpServletResponse response,
    @RequestParam(Consts.PK_QUERY_ID) String queryId, @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    Map<String, Object> mapResult = null;
    try {
      params.put("P_FILE_DIV", "2"); // "2" - FILE_DIV_ATTACHMENT
      params.put(Consts.PK_QUERY_ID, queryId);

      mapResult = service.sendFileDownload(params);
      oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        result = getResponseEntityError(request, oMsg);
        return result;
      }
      // result = getResponseEntity(request, service.sendProcessing(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
      return result;
    }

    FileInputStream ediSendFileInput = null;
    OutputStream responseOutput = null;
    File ediSendFile = null;
    String ediSendFileBackupFullName = null;
    try {
      String ediSendFileFullName = (String)mapResult.get("O_SEND_FILE_FULL_NM");
      ediSendFileBackupFullName = (String)mapResult.get("O_BACKUP_FILE_FULL_NM");
      ediSendFile = new File(ediSendFileFullName);
      ediSendFileInput = new FileInputStream(ediSendFile);

      response.setContentType("application/download; charset=utf-8");
      response.setContentLength((int)ediSendFile.length());
      response.setHeader("Cache-Control", "no-cache");
      response.setHeader("Pragma", "no-cache");
      response.setHeader("Expires", "0");

      // jQuery FileDownload Event 처리를 위한 Cookie 세팅
      Cookie fileDownloadCookie = new Cookie("neXosFileDownload", "true");
      fileDownloadCookie.setSecure(false);
      fileDownloadCookie.setMaxAge(1000);
      fileDownloadCookie.setPath("/");
      response.addCookie(fileDownloadCookie);

      String ediSendFileName = null;
      if (Util.isIE(request.getHeader("User-Agent"))) {
        ediSendFileName = URLEncoder.encode(ediSendFile.getName(), Consts.CHARSET);
      } else {
        ediSendFileName = new String(ediSendFile.getName().getBytes(Consts.CHARSET), "ISO-8859-1");
      }
      response.setHeader("Content-Disposition", "attachment; filename=\"" + ediSendFileName + "\";");
      response.setHeader("Content-Transfer-Encoding", "binary");

      responseOutput = response.getOutputStream();

      byte[ ] buffer = new byte[4096];
      int bytesRead = -1;

      while ((bytesRead = ediSendFileInput.read(buffer)) != -1) {
        responseOutput.write(buffer, 0, bytesRead);
      }
      responseOutput.flush();
    } catch (Exception e) {
      result = getResponseEntityError(request, "송신 파일 다운로드 중 오류가 발생했습니다.");
    } finally {
      try {
        if (ediSendFileInput != null) {
          ediSendFileInput.close();
        }
      } catch (Exception e) {
      }
      try {
        if (responseOutput != null) {
          responseOutput.close();
        }
      } catch (Exception e) {
      }
      if (ediSendFile != null) {
        try {
          if (ediSendFileBackupFullName != null) {
            ediSendFile.renameTo(new File(ediSendFileBackupFullName));
          }
        } catch (Exception e) {
        }
      }
    }

    return result;
  }

  /**
   * SP 처리 - 송신처리 및 오류내역 처리
   * 
   * @param params
   * 조회조건
   */
  @RequestMapping(value = "/callESProcessing.do", method = RequestMethod.POST)
  public ResponseEntity<String> callESProcessing(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_ID) String queryId, @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.callESProcessing(queryId, params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
}
