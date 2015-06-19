package nexos.controller.common;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import nexos.common.Consts;
import nexos.common.Util;
import nexos.service.common.WCService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Class: WMS 공통 컨트롤러<br>
 * Description: WMS Common Controller Class<br>
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
@RequestMapping("/WC")
public class WCController extends CommonController {

  @Resource
  private WCService service;

  /**
   * 로그인 처리
   * 
   * @param request
   * @param user_Id
   * @param user_Pwd
   * @return
   */
  @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
  @RequestMapping(value = "/getLogin.do", method = RequestMethod.POST)
  public ResponseEntity<String> getLogin(HttpServletRequest request, @RequestParam(Consts.PK_USER_ID) String user_Id,
    @RequestParam("P_USER_PWD") String user_Pwd) {

    ResponseEntity<String> result = null;
    

    Map<String, Object> params = new HashMap<String, Object>();
    params.put(Consts.PK_USER_ID, user_Id);
    params.put("P_USER_PWD", user_Pwd);

    try {
      result = getResponseEntity(request, service.getLogin(params));
      HttpSession session = request.getSession();
      session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
        SecurityContextHolder.getContext());
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 로그아웃 처리
   * 
   * @param params 조회조건
   */
  @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
  @RequestMapping(value = "/getLogout.do", method = RequestMethod.POST)
  public ResponseEntity<String> getLogout(HttpServletRequest request, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = new HashMap<String, Object>();
    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.getLogout(params) ? Consts.YES : Consts.NO);
      HttpSession session = request.getSession();
      session.removeAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 사용자 메뉴 가져오기
   * 
   * @param params 조회조건
   */
  @RequestMapping(value = "/getUserProgramMenu.do", method = RequestMethod.POST)
  public ResponseEntity<String> getUserProgramMenu(HttpServletRequest request,
    @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = new HashMap<String, Object>();
    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.getUserProgramMenu(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 사용자 비밀번호 변경
   * 
   * @param request
   * @param user_Id
   * @param user_Pwd
   * @return
   */
  @RequestMapping(value = "/setUserPassword.do", method = RequestMethod.POST)
  public ResponseEntity<String> setUserPassword(HttpServletRequest request,
    @RequestParam(Consts.PK_USER_ID) String user_Id, @RequestParam("P_USER_PWD") String user_Pwd) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = new HashMap<String, Object>();
    params.put(Consts.PK_USER_ID, user_Id);
    params.put("P_USER_PWD", user_Pwd);

    try {
      result = getResponseEntity(request, service.setUserPassword(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  @RequestMapping(value = "/reloadSqlMap.do", method = RequestMethod.POST)
  public ResponseEntity<String> reloadSqlMap(HttpServletRequest request) {
    ResponseEntity<String> result = null;

    try {
      result = getResponseEntity(request, service.reloadSqlMap());
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 팝업 데이터 조회
   * 
   * @param queryId
   * @param queryParams
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
   * 데이터 암호화(AES-128)
   * 
   * @param queryId
   * @param queryParams
   * @return
   */
  @RequestMapping(value = "/getEncryptString.do", method = RequestMethod.POST)
  public ResponseEntity<String> getEncryptString(HttpServletRequest request,
    @RequestParam("P_ENCRYPT_PARAMS") String encryptParams, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(encryptParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.getEncryptString(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 데이터 암호화(SHA-512)
   * 
   * @param queryId
   * @param queryParams
   * @return
   */
  @RequestMapping(value = "/getEncryptHash.do", method = RequestMethod.POST)
  public ResponseEntity<String> getEncryptHash(HttpServletRequest request,
    @RequestParam("P_ENCRYPT_PARAMS") String encryptParams, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(encryptParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.getEncryptHash(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * Function Call
   * 
   * @param cmdParams
   * @return
   */
  @RequestMapping(value = "/callFn.do", method = RequestMethod.POST)
  public ResponseEntity<String> callFn(HttpServletRequest request, @RequestParam("P_CMD_PARAMS") String cmdParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(cmdParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.callFn(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 엑셀 다운로드
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
  @SuppressWarnings("unchecked")
  @RequestMapping(value = "/excelExport.do", method = RequestMethod.POST)
  public ResponseEntity<String> excelExport(HttpServletRequest request, HttpServletResponse response,
    @RequestParam(Consts.PK_QUERY_ID) String queryId, @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams,
    @RequestParam("P_COLUMN_INFO") String columnInfo, @RequestParam("P_EXCEL_TITLE") String excelTitle,
    @RequestParam("P_EXPORT_TYPE") String exportType, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    String oMsg = "";

    Map<String, Object> exportParams = getDataSet(columnInfo, "P_COLUMN_INFO");
    oMsg = getResultMessage(exportParams);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    exportParams.put(Consts.PK_QUERY_ID, queryId);
    Map<String, Object> mapParams = getParameter(queryParams);
    oMsg = getResultMessage(mapParams);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    exportParams.put(Consts.PK_QUERY_PARAMS, mapParams);
    exportParams.put("P_EXCEL_TITLE", excelTitle);
    exportParams.put("P_EXPORT_TYPE", exportType);
    exportParams.put(Consts.PK_USER_ID, user_Id);

    
    
    Map<String, Object> mapResult = null;
    try {
      exportParams.put("P_CONTEXT_URL", request.getRequestURL().toString().replaceAll(request.getRequestURI(), ""));

      mapResult = service.excelExport(exportParams);
      oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        result = getResponseEntitySubmitError(request, oMsg);
        return result;
      }
    } catch (Exception e) {
      result = getResponseEntitySubmitError(request, e);
      return result;
    }

    FileInputStream xlsFileInput = null;
    OutputStream responseOutput = null;
    File xlsFile = null;
    try {
      String xlsFileFullName = (String)mapResult.get("O_XLS_FILE_FULL_NM");;
      xlsFile = new File(xlsFileFullName);
      xlsFileInput = new FileInputStream(xlsFile);

      response.setContentType("application/download; charset=utf-8");
      response.setContentLength((int)xlsFile.length());
      response.setHeader("Cache-Control", "no-cache");
      response.setHeader("Pragma", "no-cache");
      response.setHeader("Expires", "0");

      // jQuery FileDownload Event 처리를 위한 Cookie 세팅
      Cookie fileDownloadCookie = new Cookie("neXosFileDownload", "true");
      fileDownloadCookie.setSecure(false);
      fileDownloadCookie.setMaxAge(1000);
      fileDownloadCookie.setPath("/");
      response.addCookie(fileDownloadCookie);

      String xlsFileName = null;
      if (Util.isIE(request.getHeader("User-Agent"))) {
        xlsFileName = URLEncoder.encode(xlsFile.getName(), Consts.CHARSET);
      } else {
        xlsFileName = new String(xlsFile.getName().getBytes(Consts.CHARSET), "ISO-8859-1");
      }
      response.setHeader("Content-Disposition", "attachment; filename=\"" + xlsFileName + "\";");
      response.setHeader("Content-Transfer-Encoding", "binary");

      responseOutput = response.getOutputStream();

      // 파일 기록
      byte[ ] buffer = new byte[4096];
      int bytesRead = -1;
      while ((bytesRead = xlsFileInput.read(buffer)) != -1) {
        responseOutput.write(buffer, 0, bytesRead);
      }
      responseOutput.flush();
    } catch (Exception e) {
      result = getResponseEntitySubmitError(request, "EXCEL 파일 다운로드 중 오류가 발생했습니다.");
    } finally {
      try {
        if (xlsFileInput != null) {
          xlsFileInput.close();
        }
      } catch (Exception e) {
      }
      try {
        if (responseOutput != null) {
          responseOutput.close();
        }
      } catch (Exception e) {
      }
      if (xlsFile != null) {
        try {
          xlsFile.delete();
        } catch (Exception e) {
        }
      }
    }
    return result;
  }

  /**
   * 그리드 컬럼순서 저장
   * 
   * @param user_Id
   * @param program_Id
   * @param grid_Id
   * @param column_Position
   * @param reg_User_Id
   * @return
   */
  @RequestMapping(value = "/saveGridColumnOrder.do", method = RequestMethod.POST)
  public ResponseEntity<String> saveGridColumnOrder(HttpServletRequest request,
    @RequestParam(Consts.PK_USER_ID) String user_Id, @RequestParam("P_PROGRAM_ID") String program_Id,
    @RequestParam("P_GRID_ID") String grid_Id, @RequestParam("P_COLUMN_POSITION") String column_Position,
    @RequestParam("P_REG_USER_ID") String reg_User_Id) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = new HashMap<String, Object>();;
    params.put(Consts.PK_USER_ID, user_Id);
    params.put("P_PROGRAM_ID", program_Id);
    params.put("P_GRID_ID", grid_Id);
    params.put("P_COLUMN_POSITION", column_Position);
    params.put("P_REG_USER_ID", reg_User_Id);

    try {
      result = getResponseEntity(request, service.saveGridColumnOrder(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
}
