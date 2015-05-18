package nexos.controller.cm;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.cm.CM03070EService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.multipart.commons.CommonsMultipartFile;
import org.springframework.web.multipart.support.DefaultMultipartHttpServletRequest;

/**
 * Class: 로고이미지 관리 컨트롤러<br>
 * Description: 로고이미지 관리 Controller<br>
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
@RequestMapping("/CM03070E")
public class CM03070EController extends CommonController {

  // private final Logger logger = LoggerFactory.getLogger(CM03070EController.class);

  @Resource
  private CM03070EService service;

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
   * 로고이미지 저장 처리
   * 
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @return
   */
  @RequestMapping(value = "/saveBIImage.do", method = RequestMethod.POST)
  public ResponseEntity<String> saveBIImage(HttpServletRequest request,
    @RequestParam("P_UPLOAD_FILE") CommonsMultipartFile attachmentFile,
    @RequestParam("P_BIIMAGE_DIV") String biImage_Div, @RequestParam("P_BIIMAGE_CD") String biImage_Cd) {

    ResponseEntity<String> result = null;
    HashMap<String, Object> params = new HashMap<String, Object>();

    params.put("P_BIIMAGE_DIV", biImage_Div);
    params.put("P_BIIMAGE_CD", biImage_Cd);

    if (request instanceof DefaultMultipartHttpServletRequest) {
      MultipartFile multipartFile = ((DefaultMultipartHttpServletRequest)request).getFile("P_UPLOAD_FILE");
      params.put("P_UPLOAD_FILE", multipartFile);
    }

    try {
      result = getResponseEntity(request, service.saveBIImage(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 로고이미지 삭제 처리
   * 
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @return
   */
  @RequestMapping(value = "/removeBIImage.do", method = RequestMethod.POST)
  public ResponseEntity<String> removeBIImage(HttpServletRequest request,
    @RequestParam("P_BIIMAGE_DIV") String biImage_Div, @RequestParam("P_BIIMAGE_CD") String biImage_Cd) {

    ResponseEntity<String> result = null;

    HashMap<String, Object> params = new HashMap<String, Object>();
    params.put("P_BIIMAGE_DIV", biImage_Div);
    params.put("P_BIIMAGE_CD", biImage_Cd);

    try {
      result = getResponseEntity(request, service.removeBIImage(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * 로고이미지 표시 처리
   * 
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @return reponse OutputStream으로 이미지 문서를 리턴
   */
  @RequestMapping(value = "/getBIImage.do", method = RequestMethod.GET)
  public ResponseEntity<byte[ ]> getBIImage(HttpServletRequest request, HttpServletResponse response,
    @RequestParam("P_BIIMAGE_DIV") String biImage_Div, @RequestParam("P_BIIMAGE_CD") String biImage_Cd) {

    ResponseEntity<byte[ ]> result = null;

    HashMap<String, Object> params = new HashMap<String, Object>();
    params.put("P_BIIMAGE_DIV", biImage_Div);
    params.put("P_BIIMAGE_CD", biImage_Cd);
    try {
      Map<String, Object> resultMap = service.getBIImage(params);

      String oMsg = (String)resultMap.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      HttpHeaders headers = new HttpHeaders();
      byte[ ] byteBIImage = (byte[ ])resultMap.get("P_BIIMAGE");
      headers.setContentType(getMediaType(byteBIImage));

      result = new ResponseEntity<byte[ ]>(byteBIImage, headers, HttpStatus.OK);
      request.setAttribute("__RESPONSE_STATUS", Consts.OK);
    } catch (Exception e) {
      ResponseEntity<String> responseEntity = getResponseEntityError(request, e);
      result = new ResponseEntity<byte[ ]>(responseEntity.getBody().getBytes(), responseEntity.getHeaders(),
        responseEntity.getStatusCode());
    }
    return result;
  }

  private MediaType getMediaType(byte[ ] byteBIImage) {

    final byte[ ] signaturePNG = new byte[ ] {(byte)137, (byte)80, (byte)78, (byte)71, (byte)13, (byte)10, (byte)26,
      (byte)10};

    if (byteBIImage == null || byteBIImage.length < signaturePNG.length) {
      return MediaType.IMAGE_JPEG;
    }
    for (int i = 0, checkCount = signaturePNG.length; i < checkCount; i++) {
      if (byteBIImage[i] != signaturePNG[i]) {
        return MediaType.IMAGE_JPEG;
      }
    }

    return MediaType.IMAGE_PNG;
  }
}
