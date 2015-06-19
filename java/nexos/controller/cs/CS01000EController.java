package nexos.controller.cs;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.net.URLEncoder;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.cs.CS01000EService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.springframework.web.multipart.support.DefaultMultipartHttpServletRequest;

/**
 * Class: CS01000EService 관리 컨트롤러<br>
 * Description: CS01000EService 관리 Controller<br>
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
@RequestMapping("/CS01000E")
public class CS01000EController extends CommonController {

  @Resource
  private CS01000EService service;

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
   * 공지 저장 처리
   * 
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/saveMaster.do", method = RequestMethod.POST)
  public ResponseEntity<String> saveMaster(HttpServletRequest request,
    @RequestParam(Consts.PK_DS_MASTER) String masterDS, 
    //@RequestParam(Consts.PK_DS_DETAIL) String detailDS,
    @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;
    
    
    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    
    // 입고예정등록 마스터 DataSet Map에 추가
  //  Map<String, Object> detailParams = getParameter(detailDS);
  //  oMsg = getResultMessage(detailParams);
   //(!Consts.OK.equals(oMsg)) {
    //  result = getResponseEntityError(request, oMsg);
    //  return result;
   // }
    
    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.saveMaster(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 공지 저장 처리
   * 
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/saveMasterAttachment.do", method = RequestMethod.POST)
  public ResponseEntity<String> saveMasterAttachment(HttpServletRequest request,
    @RequestParam("P_UPLOAD_FILE") CommonsMultipartFile attachmentFile,
    @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    
    
    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    if (request instanceof DefaultMultipartHttpServletRequest) {
      MultipartFile multipartFile = ((DefaultMultipartHttpServletRequest)request).getFile("P_UPLOAD_FILE");
      params.put("P_UPLOAD_FILE", multipartFile);
    }
    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.saveMaster(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 덧글 저장 처리
   * 
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/saveDetail.do", method = RequestMethod.POST)
  public ResponseEntity<String> saveDetail(HttpServletRequest request,
    @RequestParam(Consts.PK_DS_DETAIL) String masterDS, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_DETAIL);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.saveDetail(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 덧글 읽음 처리
   * 
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @param user_Id 사용자ID
   * @return
   */
  @RequestMapping(value = "/readNotice.do", method = RequestMethod.POST)
  public ResponseEntity<String> readNotice(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.readNotice(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 공지사항 첨부파일 다운로드 처리
   * 
   * @param request
   * @param ediFile
   * @param queryId
   * @param queryParams
   * @return
   */
  @RequestMapping(value = "/attachmentDownload.do", method = RequestMethod.POST)
  public ResponseEntity<String> attachmentDownload(HttpServletRequest request, HttpServletResponse response,
    @RequestParam("P_FILE_NM") String file_Nm) {

    ResponseEntity<String> result = null;

    FileInputStream attachmentDownloadFileInput = null;
    OutputStream responseOutput = null;
    File attachmentDownloadFile = null;
    try {
      ServletContext context = request.getSession().getServletContext();

      String webRootPath = request.getSession().getServletContext().getRealPath("/");
      String attachmentDownloadPath = service.getProperty("noticeAttachment");

      String attachmentDownloadFullPath = webRootPath + attachmentDownloadPath;
      String attachmentDownloadFileFullName = attachmentDownloadFullPath + file_Nm;
      attachmentDownloadFile = new File(attachmentDownloadFileFullName);
      if (!attachmentDownloadFile.exists()) {
        throw new RuntimeException("첨부파일이 서버에 존재하지 않습니다.");
      }

      attachmentDownloadFileInput = new FileInputStream(attachmentDownloadFile);

      String mimeType = context.getMimeType(attachmentDownloadFileFullName);
      if (mimeType == null) {
        mimeType = "application/octet-stream";
      }
      response.setContentType(mimeType);
      response.setContentLength((int)attachmentDownloadFile.length());

      String headerKey = "Content-Disposition";
      String headerValue = String.format("attachment; filename=\"%s\"", URLEncoder.encode(file_Nm, Consts.CHARSET));
      response.setHeader(headerKey, headerValue);

      responseOutput = response.getOutputStream();

      byte[ ] buffer = new byte[4096];
      int bytesRead = -1;

      while ((bytesRead = attachmentDownloadFileInput.read(buffer)) != -1) {
        responseOutput.write(buffer, 0, bytesRead);
      }
      responseOutput.flush();
    } catch (Exception e) {
      result = getResponseEntityError(request, "첨부 파일 다운로드 중 오류가 발생했습니다.\n\n" + e.getMessage());
    } finally {
      try {
        if (attachmentDownloadFileInput != null) {
          attachmentDownloadFileInput.close();
        }
      } catch (Exception e) {
      }
      try {
        if (responseOutput != null) {
          responseOutput.close();
        }
      } catch (Exception e) {
      }
    }

    return result;
  }
  

  /**
   * 저장 처리

   */
  @RequestMapping(value = "/save1.do", method = RequestMethod.POST)
  public ResponseEntity<String> save1(HttpServletRequest request, 
      @RequestParam(Consts.PK_DS_SUB) String subDS,
      @RequestParam(Consts.PK_USER_ID) String user_Id) {

    ResponseEntity<String> result = null;

    
 
    Map<String, Object> params = getDataSet(subDS, Consts.PK_DS_SUB);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
   

    params.put(Consts.PK_USER_ID, user_Id);

    try {
      result = getResponseEntity(request, service.save1(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 공지사항그룹 삭제
   * 
   * @param request HttpServletRequest
   * @param queryId 쿼리ID
   * @param queryParams 쿼리 호출 파라메터
   * @return
   */
  @SuppressWarnings("rawtypes")
  @RequestMapping(value = "/callDelete.do", method = RequestMethod.POST)
  public ResponseEntity<String> callUserDelete(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      Map mapResult = service.callDelete(params);
      result = getResponseEntity(request, mapResult);
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
  
}
