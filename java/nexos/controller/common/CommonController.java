package nexos.controller.common;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.common.Util;
import nexos.common.ibatis.JsonDataSet;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Class: CommonController<br>
 * Description: 콘트롤러에 대한 공통 Class<br>
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
public class CommonController {

  // private final Logger logger = LoggerFactory.getLogger(CommonController.class);

  /**
   * Json String 을 List 로 변환하여 Map 로 리턴
   * 
   * @param jsonDS
   * @param dsKey
   * @return
   */
  public Map<String, Object> getDataSet(String jsonDS, String dsKey) {
    Map<String, Object> result = new HashMap<String, Object>();

    if (Util.isNull(jsonDS)) {
      result.put(dsKey, null);
      result.put(Consts.PK_RESULT_MSG, Consts.OK);
    } else {
      ObjectMapper mapper = new ObjectMapper();
      List<Map<String, Object>> resultDS = null;
      try {
        resultDS = mapper.readValue(jsonDS, new TypeReference<List<Map<String, Object>>>() {
        });
        result.put(dsKey, resultDS);
        result.put(Consts.PK_RESULT_MSG, Consts.OK);
      } catch (Exception e) {
        result.put(Consts.PK_RESULT_MSG, e.getMessage());
      }
    }
    return result;
  }

  /**
   * response HttpHeader 리턴
   * 
   * @return
   */
  protected HttpHeaders getHttpHeader() {

    HttpHeaders result = new HttpHeaders();
    // Context Type을 text/html로 설정.
    result.add("Content-Type", "text/html; charset=UTF-8");

    return result;
  }

  /**
   * Json String 을 Map 로 변환하여 리턴
   * 
   * @param jsonParam
   * @return
   */
  public Map<String, Object> getParameter(String jsonParam) {
    Map<String, Object> result = new HashMap<String, Object>();

    if (Util.isNull(jsonParam)) {
      result.put(Consts.PK_RESULT_MSG, Consts.OK);
    } else {
      ObjectMapper mapper = new ObjectMapper();
      try {
        result = mapper.readValue(jsonParam, new TypeReference<Map<String, Object>>() {
        });
        result.put(Consts.PK_RESULT_MSG, Consts.OK);
      } catch (Exception e) {
        result.put(Consts.PK_RESULT_MSG, e.getMessage());
      }
    }
    return result;
  }

  /**
   * JsonDataSet 을 Json String으로 변환하여 Response Entity로 리턴
   * 
   * @param responseList
   * @return
   * @throws Exception
   */
  public ResponseEntity<String> getResponseEntity(HttpServletRequest request, JsonDataSet responseJson) {

    request.setAttribute("__RESPONSE_STATUS", Consts.OK);

    return new ResponseEntity<String>(responseJson.getDataSet(), getHttpHeader(), HttpStatus.OK);
  }

  /**
   * List 를 Json String으로 변환하여 Response Entity로 리턴
   * 
   * @param responseList
   * @return
   * @throws Exception
   */
  @SuppressWarnings({"rawtypes", "unchecked"})
  public ResponseEntity<String> getResponseEntity(HttpServletRequest request, List responseList) {

    StringBuffer sbResult = new StringBuffer();
    if (responseList != null && responseList.size() > 0) {
      ObjectMapper mapper = new ObjectMapper();
      Map<String, Object> rowData;

      try {
        // 첫번째 데이터 변환
        rowData = (HashMap<String, Object>)responseList.get(0);
        rowData.put(Consts.DK_ID, Consts.DV_ID_PREFIX + 0);
        rowData.put(Consts.DK_CRUD, Consts.DV_CRUD_R);
        sbResult.append("[").append(mapper.writeValueAsString(rowData));

        int listCnt = responseList.size();

        for (int i = 1; i < listCnt; i++) {
          rowData = (HashMap<String, Object>)responseList.get(i);
          rowData.put(Consts.DK_ID, Consts.DV_ID_PREFIX + i);
          rowData.put(Consts.DK_CRUD, Consts.DV_CRUD_R);
          sbResult.append(",").append(mapper.writeValueAsString(rowData));
        }
        sbResult.append("]");
      } catch (Exception e) {
        return getResponseEntityError(request, e);
      }
    }

    String result = sbResult.toString();
    sbResult.setLength(0);
    return getResponseEntity(request, result, Consts.DV_RESULT_TYPE_LIST);
  }

  /**
   * Map 을 Json String으로 변환하여 Response Entity로 리턴
   * 
   * @param responseList
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  public ResponseEntity<String> getResponseEntity(HttpServletRequest request, Map responseMap) {

    String result = null;
    if (responseMap != null && !responseMap.isEmpty()) {
      ObjectMapper mapper = new ObjectMapper();
      try {
        result = mapper.writeValueAsString(responseMap);
      } catch (Exception e) {
        return getResponseEntityError(request, e);
      }
    }
    return getResponseEntity(request, result, Consts.DV_RESULT_TYPE_MAP);
  }

  /**
   * String을 Response Entity로 리턴
   * 
   * @param responseText
   * @return
   */
  public ResponseEntity<String> getResponseEntity(HttpServletRequest request, String responseText) {

    return getResponseEntity(request, responseText, Consts.DV_RESULT_TYPE_STR);
  }

  /**
   * String을 Response Entity로 리턴
   * 
   * @param responseText
   * @param resultType
   * @return
   */
  public ResponseEntity<String> getResponseEntity(HttpServletRequest request, String responseText, String resultType) {

    String result = null;

    Map<String, Object> resultMap = new HashMap<String, Object>();
    resultMap.put(Consts.DK_RESULT_CD, Consts.DV_RESULT_CD_OK);
    resultMap.put(Consts.DK_RESULT_TYPE, resultType);
    resultMap.put(Consts.DK_RESULT_DATA, responseText);

    ObjectMapper mapper = new ObjectMapper();
    try {
      result = mapper.writeValueAsString(resultMap);
    } catch (Exception e) {
      return getResponseEntityError(request, e);
    }

    request.setAttribute("__RESPONSE_STATUS", Consts.OK);

    return new ResponseEntity<String>(result, getHttpHeader(), HttpStatus.OK);
  }

  /**
   * 오류 발생시 오류 내용을 Json String으로 변환하여 Response Entity로 리턴
   * 
   * @param e
   * @return
   */
  public ResponseEntity<String> getResponseEntityError(HttpServletRequest request, Exception e) {

    return getResponseEntityError(request, e, null, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  /**
   * 오류 발생시 오류 내용을 Json String으로 변환하여 Response Entity로 리턴
   * 
   * @param e
   * @return
   */
  public ResponseEntity<String> getResponseEntityError(HttpServletRequest request, Exception e, String errorMessage,
    HttpStatus statusCode) {

    int errorCode = e instanceof AccessDeniedException ? Consts.DV_RESULT_CD_ACCESSDENIED : Consts.DV_RESULT_CD_ERROR;

    String lastErrorMessage = Util.getNull(e.getMessage(), "Null Pointer Exception");
    errorMessage = Util.isNull(errorMessage) ? lastErrorMessage : errorMessage + "\n\n" + lastErrorMessage;

    String errorLog = "";
    if (errorCode != Consts.DV_RESULT_CD_ACCESSDENIED) {
      /*
       * StringWriter sw = new StringWriter();
       * PrintWriter pw = new PrintWriter(sw);
       * e.printStackTrace(pw);
       * errorLog = sw.toString() + "\n";
       */

      // RuntimeException이면 첫번째 오류 메시지만 표시
      if (e instanceof RuntimeException) {
        errorLog = "              " + e.getClass().getName() + ": ";
        for (final StackTraceElement s : e.getStackTrace()) {
          errorLog += s.toString();
          break;
        }
      } else {
        errorLog = "\t" + e.getClass().getName() + ": " + lastErrorMessage;
        for (final StackTraceElement s : e.getStackTrace()) {
          errorLog += "\n\t\tat " + s.toString();
        }
      }
      errorLog += "\n";
    }

    return getResponseEntityError(request, errorMessage, errorLog, errorCode, statusCode);
  }

  /**
   * 오류 발생시 오류 내용을 Json String으로 변환하여 Response Entity로 리턴
   * 
   * @param e
   * @return
   */
  public ResponseEntity<String> getResponseEntityError(HttpServletRequest request, String errorMessage) {

    return getResponseEntityError(request, errorMessage, "", Consts.DV_RESULT_CD_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR);
  }

  /**
   * 오류 발생시 오류 내용을 Json String으로 변환하여 Response Entity로 리턴
   * 
   * @param errorMessage
   * @param errorCode
   * @param statusCode
   * @return
   */
  public ResponseEntity<String> getResponseEntityError(HttpServletRequest request, String errorMessage,
    String errorLog, int errorCode, HttpStatus statusCode) {

    String result = null;

    String lastErrorMessage = Util.getNull(errorMessage, "Null Pointer Exception");
    // logger.error("ERROR LOG\n  ERROR       : " + lastErrorMessage.replaceAll("/\n|\r/gi", " ") + "\n" + errorLog);

    Map<String, Object> resultMap = new HashMap<String, Object>();
    resultMap.put(Consts.DK_RESULT_CD, errorCode);
    resultMap.put(Consts.DK_RESULT_TYPE, Consts.DV_RESULT_TYPE_STR);
    resultMap.put(Consts.DK_RESULT_DATA, lastErrorMessage);

    ObjectMapper mapper = new ObjectMapper();
    try {
      result = mapper.writeValueAsString(resultMap);
    } catch (Exception e) {
      return getResponseEntityError(request, e);
    }

    request.setAttribute("__RESPONSE_STATUS", lastErrorMessage.replaceAll("/\n|\r/gi", " "));

    return new ResponseEntity<String>(result, getHttpHeader(), statusCode);
  }

  /**
   * Submit으로 IFrame을 불러올 경우 IE의 경우 내부 오류 메시지를 표시하여
   * contentDocument에 접근할 수 없어(cross domain - 권한 없음) 정상 처리하고 오류 메시지를 리턴
   * 오류
   * 
   * @param e
   * @return
   * @throws Exception
   */
  public ResponseEntity<String> getResponseEntitySubmitError(HttpServletRequest request, Exception e) {

    return getResponseEntityError(request, e, null, HttpStatus.OK);
  }

  public ResponseEntity<String> getResponseEntitySubmitError(HttpServletRequest request, Exception e,
    String errorMessage) {

    return getResponseEntityError(request, e, errorMessage, HttpStatus.OK);
  }

  /**
   * Submit으로 IFrame을 불러올 경우 IE의 경우 내부 오류 메시지를 표시하여
   * contentDocument에 접근할 수 없어(cross domain - 권한 없음) 정상 처리하고 오류 메시지를 리턴
   * 
   * @param errorMessage
   * @return
   */
  public ResponseEntity<String> getResponseEntitySubmitError(HttpServletRequest request, String errorMessage) {

    return getResponseEntityError(request, errorMessage, "", Consts.DV_RESULT_CD_ERROR, HttpStatus.OK);
  }

  /**
   * Map 에서 O_MSG 를 가져오고 Map에서 O_MSG 제거
   * 
   * @param params
   * @return
   */
  public String getResultMessage(Map<String, Object> params) {
    String result = (String)params.get(Consts.PK_RESULT_MSG);
    params.remove(Consts.PK_RESULT_MSG);
    return result;
  }

  /**
   * Json String 을 List 로 변환하여 Map 에 추가
   * 
   * @param result
   * @param jsonDS
   * @param dsKey
   */
  public void setDataSet(Map<String, Object> result, String jsonDS, String dsKey) {
    if (Util.isNull(jsonDS)) {
      result.put(dsKey, null);
      result.put(Consts.PK_RESULT_MSG, Consts.OK);
    } else {
      ObjectMapper mapper = new ObjectMapper();
      List<Map<String, Object>> resultDS = null;
      try {
        resultDS = mapper.readValue(jsonDS, new TypeReference<List<Map<String, Object>>>() {
        });
        result.put(dsKey, resultDS);
        result.put(Consts.PK_RESULT_MSG, Consts.OK);
      } catch (Exception e) {
        result.put(Consts.PK_RESULT_MSG, e.getMessage());
      }
    }
    return;
  }

  /**
   * Json String 을 Map 에 추가
   * 
   * @param result
   * @param jsonParam
   */
  public void setParameter(Map<String, Object> result, String jsonParam) {
    if (Util.isNull(jsonParam)) {
      result.put(Consts.PK_RESULT_MSG, Consts.OK);
    } else {
      ObjectMapper mapper = new ObjectMapper();
      try {
        result = mapper.readValue(jsonParam, new TypeReference<Map<String, Object>>() {
        });
        result.put(Consts.PK_RESULT_MSG, Consts.OK);
      } catch (Exception e) {
        result.put(Consts.PK_RESULT_MSG, e.getMessage());
      }
    }
  }

  /**
   * Json String 을 Map 에 추가
   * 
   * @param result
   * @param jsonParam
   * @param paramKey
   */
  public void setParameter(Map<String, Object> result, String jsonParam, String paramKey) {

    Map<String, Object> mapParam = new HashMap<String, Object>();

    if (Util.isNull(jsonParam)) {
      result.put(paramKey, null);
      result.put(Consts.PK_RESULT_MSG, Consts.OK);
    } else {
      ObjectMapper mapper = new ObjectMapper();
      try {
        mapParam = mapper.readValue(jsonParam, new TypeReference<Map<String, Object>>() {
        });
        result.put(paramKey, mapParam);
        result.put(Consts.PK_RESULT_MSG, Consts.OK);
      } catch (Exception e) {
        result.put(Consts.PK_RESULT_MSG, e.getMessage());
      }
    }
  }

}
