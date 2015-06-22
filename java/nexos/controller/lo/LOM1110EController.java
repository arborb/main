package nexos.controller.lo;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.lo.LOM1110EService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Class: 온라인 출고예정작업[롯데백화점] 컨트롤러<br>
 * Description: 온라인 출고예정작업[롯데백화점] Controller<br>
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
@RequestMapping("/LOM1110E")
public class LOM1110EController extends CommonController {

    @Resource
  private LOM1110EService service;

    @RequestMapping(value = "/callSP.do", method = RequestMethod.POST)
    public ResponseEntity<String> callSP(HttpServletRequest request, @RequestParam(Consts.PK_QUERY_ID) String queryId,
        @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

        ResponseEntity<String> result = null;

        Map<String, Object> params = getParameter(queryParams);
        String oMsg = getResultMessage(params);
        if (!Consts.OK.equals(oMsg)) {
          result = getResponseEntityError(request, oMsg);
          return result;
        }

        try {
          HashMap<String, Object> mapResult = service.callSP(queryId, params);
          result = getResponseEntity(request, mapResult);
        } catch (Exception e) {
          result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
       * 삭제 처리
       * @param request   HttpServletRequest
       * @param masterDS  DataSet
       * @param user_Id   사용자ID
       * @return
       */
      @RequestMapping(value = "/delete.do", method = RequestMethod.POST)
      public ResponseEntity<String> delete(HttpServletRequest request,
              @RequestParam(Consts.PK_DS_MASTER) String masterDS,
              @RequestParam(Consts.PK_USER_ID) String user_Id) {

          ResponseEntity<String> result = null;

          // 출고예정등록 디테일 DataSet Map에 추가
          Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
          String oMsg = getResultMessage(params);
          if (!Consts.OK.equals(oMsg)) {
            result = getResponseEntityError(request, oMsg);
            return result;
          }

          params.put(Consts.PK_USER_ID, user_Id);

          try {
              result = getResponseEntity(request, service.delete(params));
          } catch (Exception e) {
              result = getResponseEntityError(request, e);
          }

          return result;
      }

  /**
   * 데이터 조회
   * @param request     HttpServletRequest
   * @param queryId     쿼리ID
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
     * 저장 처리
     * @param request   HttpServletRequest
     * @param masterDS  DataSet
     * @param user_Id   사용자ID
     * @return
     */
    @RequestMapping(value = "/save.do", method = RequestMethod.POST)
    public ResponseEntity<String> save(HttpServletRequest request,
            @RequestParam(Consts.PK_DS_MASTER) String masterDS,
            @RequestParam(Consts.PK_DS_DETAIL) String detailDS,
            @RequestParam(Consts.PK_DS_SUB) String subDS,
            @RequestParam("P_PROCESS_CD") String P_PROCESS_CD,
            @RequestParam(Consts.PK_USER_ID) String user_Id) {

        ResponseEntity<String> result = null;

        // 온라인 출고예정등록 디테일 DataSet Map에 추가
        Map<String, Object> params = getDataSet(detailDS, Consts.PK_DS_DETAIL);
        String oMsg = getResultMessage(params);
        if (!Consts.OK.equals(oMsg)) {
          result = getResponseEntityError(request, oMsg);
          return result;
        }

        // 온라인 출고예정등록 마스터 DataSet Map에 추가
        Map<String, Object> masterParams = getParameter(masterDS);
        oMsg = getResultMessage(masterParams);
        if (!Consts.OK.equals(oMsg)) {
          result = getResponseEntityError(request, oMsg);
          return result;
        }

        // 출고부가정보 마스터(온라인고객) DataSet Map에 추가
        Map<String, Object> subParams = getParameter(subDS);
        oMsg = getResultMessage(subParams);
        if (!Consts.OK.equals(oMsg)) {
          result = getResponseEntityError(request, oMsg);
          return result;
        }

        params.put(Consts.PK_DS_MASTER, masterParams);
        params.put(Consts.PK_DS_SUB, subParams);
        params.put(Consts.PK_USER_ID, user_Id);
        params.put("P_PROCESS_CD", P_PROCESS_CD);

        try {
            result = getResponseEntity(request, service.save(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }

    /**
     * 프린터 출력여부
     *
     * @param request HttpServletRequest
     * @param subDS DataSet
     * @param user_Id 사용자ID
     * @return
     */
    @RequestMapping(value = "/savePrintHis.do", method = RequestMethod.POST)
    public ResponseEntity<String> savePrintHis(HttpServletRequest request, @RequestParam(Consts.PK_DS_DETAIL) String detailDS,
      @RequestParam(Consts.PK_USER_ID) String user_Id) {

      ResponseEntity<String> result = null;

      Map<String, Object> params = getDataSet(detailDS, Consts.PK_DS_DETAIL);
      String oMsg = getResultMessage(params);
      if (!Consts.OK.equals(oMsg)) {
        result = getResponseEntityError(request, oMsg);
        return result;
      }

      params.put(Consts.PK_USER_ID, user_Id);

      try {
      result = getResponseEntity(request, service.savePrintHis(params));
      } catch (Exception e) {
        result = getResponseEntityError(request, e);
      }

      return result;
    }
}
