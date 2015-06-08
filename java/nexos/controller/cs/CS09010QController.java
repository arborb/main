package nexos.controller.cs;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import nexos.common.Consts;
import nexos.common.Util;
import nexos.controller.common.CommonController;
import nexos.service.cs.CS09010QService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

/**
 * Class: 쿼리 실행기 데이터 조회 컨트롤러<br>
 * Description: 쿼리 실행기 데이터 조회 조회 Controller<br>
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
@RequestMapping("/CS09010Q")
public class CS09010QController extends CommonController {

  @Resource
  private CS09010QService service;

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
   * 쿼리 파일 저장
   * 
   * @param request
   * @param response
   * @param queryId
   * @param queryParams
   * @param columnInfo
   * @param excelTitle
   * @param user_Id
   * @return
   */
  @RequestMapping(value = "/saveQuery.do", method = RequestMethod.POST)
  public ResponseEntity<String> saveQuery(HttpServletRequest request, HttpServletResponse response,
    @RequestParam("P_QUERY_TEXT") String queryText, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    OutputStream responseOutput = null;
    try {

      byte[ ] byteQueryText = queryText.getBytes(Consts.CHARSET);
      String mimeType = "application/plain";
      response.setContentType(mimeType);
      response.setContentLength(byteQueryText.length);

      String queryFileName = "Query_" + Util.getNowDate("yyyyMMddHHmmss") + ".txt";
      response.setHeader("Content-Disposition", String.format("attachment; filename=\"%s\"", queryFileName));

      // jQuery FileDownload Event 처리를 위한 Cookie 세팅
      Cookie fileDownloadCookie = new Cookie("neXosFileDownload", "true");
      fileDownloadCookie.setSecure(false);
      fileDownloadCookie.setMaxAge(1000);
      fileDownloadCookie.setPath("/");
      response.addCookie(fileDownloadCookie);

      responseOutput = response.getOutputStream();

      responseOutput.write(byteQueryText);

      responseOutput.flush();
    } catch (Exception e) {
      result = getResponseEntityError(request, "QUERY 파일 저장 중 오류가 발생했습니다.");
    } finally {
      try {
        if (responseOutput != null) {
          responseOutput.close();
        }
      } catch (Exception e) {
      }
    }
    return result;
  }

  @RequestMapping(value = "/openQuery.do", method = RequestMethod.POST)
  public ResponseEntity<String> openQuery(HttpServletRequest request, HttpServletResponse response,
    @RequestParam("P_UPLOAD_FILE") CommonsMultipartFile queryFile, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    BufferedReader uploadFileReader = null;
    try {
      if (queryFile.isEmpty()) {
        throw new RuntimeException("빈 파일입니다. 다른 파일을 선택하십시오.");
      }

      uploadFileReader = new BufferedReader(new InputStreamReader(queryFile.getInputStream(), Consts.CHARSET));

      StringBuffer sbResult = new StringBuffer();
      String line = null;
      while ((line = uploadFileReader.readLine()) != null) {
        sbResult.append(line);
        sbResult.append("\n");
      }

      result = getResponseEntity(request, sbResult.toString());
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    } finally {
      try {
        if (uploadFileReader != null) {
          uploadFileReader.close();
        }
      } catch (Exception e) {
      }
    }

    return result;
  }
}
