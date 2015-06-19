package nexos.controller.report;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.ServletOutputStream;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.report.ReportService;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

/**
 * Class: ReportController<br>
 * Description: Report 출력에서 사용할 공통 컨트롤러 Class<br>
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
public class ReportController extends CommonController {

  @Resource
  private ReportService service;

  private final Logger  logger = LoggerFactory.getLogger(ReportController.class);

  public ReportController() throws Exception {
  }

  /**
   * 리포트 기본 호출에 대한 컨트롤러(GET)
   * 
   * @param request
   * @param response
   * @return reponse OutputStream으로 PDF 문서를 리턴
   */
  @RequestMapping(value = "/report.do", method = RequestMethod.GET)
  public void showReportGet(HttpServletRequest request, HttpServletResponse response) {

    setResponseHeader(response);

    ServletOutputStream servletOutput = null;

    try {
      // Response에 기록하기 위해 OutputStream 가져오기
      servletOutput = response.getOutputStream();

      // Report 파라메터 값 읽기
      Map<String, Object> params = getReportParams(request, servletOutput);
      String oMsg = getResultMessage(params);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      if (params.get("P_COOKIE_NM") != null) {
        // jQuery FileDownload Event 처리를 위한 Cookie 세팅
        Cookie fileDownloadCookie = new Cookie((String)params.get("P_COOKIE_NM"), "true");
        fileDownloadCookie.setSecure(false);
        fileDownloadCookie.setMaxAge(1000);
        fileDownloadCookie.setPath("/");
        response.addCookie(fileDownloadCookie);
      }

      // PDF 문서 생성하고 servletOutput에 기록
      Map<String, Object> resultMap = service.getReport(params);

      oMsg = (String)resultMap.get(Consts.PK_RESULT_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      setReportResponse(response);
      request.setAttribute("__RESPONSE_STATUS", Consts.OK);
    } catch (Exception e) {
      ResponseEntity<String> resultEntity = getResponseEntitySubmitError(request, e, "정상적으로 처리되지 않았습니다.");
      setErrorResponse(response);
      if (servletOutput != null) {
        try {
          servletOutput.write(resultEntity.getBody().getBytes(Consts.CHARSET));
        } catch (Exception e1) {
        }
      }
    } finally {
      if (servletOutput != null) {
        try {
          servletOutput.close();
        } catch (Exception e) {
          logger.error(e.toString());
        }
        servletOutput = null;
      }
    }
  }

  /**
   * 리포트 기본 호출에 대한 컨트롤러(POST)
   * 
   * @param request
   * @param response
   * @return reponse OutputStream으로 PDF 문서를 리턴
   */
  @RequestMapping(value = "/report.do", method = RequestMethod.POST)
  public void showReportPost(HttpServletRequest request, HttpServletResponse response) {
    showReportGet(request, response);
  }

  /**
   * Report 출력을 위한 파라메터를 Request에서 읽음
   * 
   * @param request
   * @param servletOutput
   * @return
   */
  private HashMap<String, Object> getReportParams(HttpServletRequest request, ServletOutputStream servletOutput) {

    HashMap<String, Object> result = new HashMap<String, Object>();

    final String PK_SERVLET_CONTEXT = "P_SERVLET_CONTEXT";
    final String PK_SERVLET_OUTPUT = "P_SERVLET_OUTPUT";
    final String PK_REPORT_FILE = "P_REPORT_FILE";
    final String PK_CHECKED_VALUE = "P_CHECKED_VALUE";
    final String PK_OTHER_TEMPO = "P_OTHER_TEMPO";
    final String PK_PRINT_COPY = "P_PRINT_COPY";
    final String PK_SILENT_PRINT_YN = "P_SILENT_PRINT_YN";
    final String PK_INTERNAL_QUERY_YN = "P_INTERNAL_QUERY_YN";
    final String PK_USER_NM = "P_USER_NM";

    final String PK_PRINT_LI_BILL = "P_PRINT_LI_BILL";
    final String PK_PRINT_LO_BILL = "P_PRINT_LO_BILL";
    final String PK_PRINT_RI_BILL = "P_PRINT_RI_BILL";
    final String PK_PRINT_RO_BILL = "P_PRINT_RO_BILL";
    final String PK_PRINT_LO_BOX = "P_PRINT_LO_BOX";
    final String PK_PRINT_WB_NO = "P_PRINT_WB_NO";
    final String PK_PRINT_CARD = "P_PRINT_CARD";
    final String PK_PRINT_SHIP_ID = "P_PRINT_SHIP_ID";
    final String PK_PRINT_LOCATION_ID = "P_PRINT_LOCATION_ID";
    final String PK_PRINT_INBOUND_SEQ = "P_PRINT_INBOUND_SEQ";

    final String PK_PRINTER_NM = "P_PRINTER_NM";
    final String PK_SILENT_PRINTER_NM = "P_SILENT_PRINTER_NM";
    final String PK_COOKIE_NM = "P_COOKIE_NM";
    final String PK_CONTEXT_URL = "P_CONTEXT_URL";

    HashMap<String, Object> queryParams = (HashMap<String, Object>)getParameter(request
      .getParameter(Consts.PK_QUERY_PARAMS));
    String oMsg = (String)queryParams.get(Consts.PK_RESULT_MSG);
    if (!Consts.OK.equals(oMsg)) {
      return result;
    }

    try {
      result.put(PK_SERVLET_CONTEXT, request.getSession().getServletContext());
      result.put(PK_SERVLET_OUTPUT, servletOutput);

      result.put(PK_REPORT_FILE, request.getParameter(PK_REPORT_FILE));
      result.put(PK_PRINT_COPY, request.getParameter(PK_PRINT_COPY));
      result.put(PK_SILENT_PRINT_YN, request.getParameter(PK_SILENT_PRINT_YN));

      result.put(Consts.PK_QUERY_ID, request.getParameter(Consts.PK_QUERY_ID));
      result.put(Consts.PK_QUERY_PARAMS, queryParams);
      result.put(PK_INTERNAL_QUERY_YN, request.getParameter(PK_INTERNAL_QUERY_YN));
      result.put(PK_CHECKED_VALUE, request.getParameter(PK_CHECKED_VALUE));
      result.put(PK_OTHER_TEMPO, request.getParameter(PK_OTHER_TEMPO));

      result.put(Consts.PK_USER_ID, request.getParameter(Consts.PK_USER_ID));
      result.put(PK_USER_NM, request.getParameter(PK_USER_NM));

      result.put(PK_PRINT_LI_BILL, request.getParameter(PK_PRINT_LI_BILL));
      result.put(PK_PRINT_LO_BILL, request.getParameter(PK_PRINT_LO_BILL));
      result.put(PK_PRINT_RI_BILL, request.getParameter(PK_PRINT_RI_BILL));
      result.put(PK_PRINT_RO_BILL, request.getParameter(PK_PRINT_RO_BILL));
      result.put(PK_PRINT_LO_BOX, request.getParameter(PK_PRINT_LO_BOX));
      result.put(PK_PRINT_WB_NO, request.getParameter(PK_PRINT_WB_NO));
      result.put(PK_PRINT_CARD, request.getParameter(PK_PRINT_CARD));
      result.put(PK_PRINT_SHIP_ID, request.getParameter(PK_PRINT_SHIP_ID));
      result.put(PK_PRINT_LOCATION_ID, request.getParameter(PK_PRINT_LOCATION_ID));
      result.put(PK_PRINT_INBOUND_SEQ, request.getParameter(PK_PRINT_INBOUND_SEQ));

      result.put(PK_PRINTER_NM, request.getParameter(PK_PRINTER_NM));
      result.put(PK_SILENT_PRINTER_NM, request.getParameter(PK_SILENT_PRINTER_NM));
      result.put(PK_COOKIE_NM, request.getParameter(PK_COOKIE_NM));
      result.put(PK_CONTEXT_URL, request.getRequestURL().toString().replaceAll(request.getRequestURI(), ""));

      result.put(Consts.PK_RESULT_MSG, Consts.OK);
    } catch (Exception e) {
      result.put(Consts.PK_RESULT_MSG, e.getMessage());
    }
    return result;
  }

  /**
   * Response Header 세팅
   * 
   * @param response
   */
  private void setResponseHeader(HttpServletResponse response) {
    // Cache를 사용하지 않음
    response.setHeader("Cache-Control", "no-cache");
    response.setHeader("Pragma", "no-cache");
    response.setHeader("Expires", "0");
  }

  private void setReportResponse(HttpServletResponse response) {
    response.setHeader("Content-Disposition", "inline; filename=Report.pdf;");
    // Context Type을 PDF로 설정.
    response.setContentType("application/pdf");
  }

  private void setErrorResponse(HttpServletResponse response) {

    // Context Type을 PDF로 설정.
    response.setContentType("text/html; charset=UTF-8");
  }
}
