package nexos.controller.lo;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.lo.LOM7090EService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Class: 온라인출고스캔검수 컨트롤러<br>
 * Description: 온라인출고스캔검수 Controller<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 * 
 *          <pre style="font-family: NanumGothicCoding, GulimChe">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2013-01-01    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 * </pre>
 */
@Controller
@RequestMapping("/LOM7090E")
public class LOM7090EController extends CommonController {

	@Resource
	private LOM7090EService service;

  /**
   * 위메프 주문유형 변경 처리.
   *
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @return
   */
  @RequestMapping(value = "/callOrderDiv.do", method = RequestMethod.POST)
  public ResponseEntity<String> callInvProcLine(HttpServletRequest request,
    @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam("P_ORDER_DIV") String order_Div
    , @RequestParam("P_PROCESS_CD") String process_Cd) {

    ResponseEntity<String> result = null;

    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    params.put("P_ORDER_DIV",  order_Div);
    params.put("P_PROCESS_CD", process_Cd);
    
    try {
      result = getResponseEntity(request, service.callOrderDiv(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
  
  /**
   * 위메프 주문유형 변경 처리.
   *
   * @param request HttpServletRequest
   * @param masterDS DataSet
   * @return
   */
  @RequestMapping(value = "/callOrderAdjust.do", method = RequestMethod.POST)
  public ResponseEntity<String> callOrderAdjust(HttpServletRequest request,
      @RequestParam(Consts.PK_DS_MASTER) String masterDS) {
    
    ResponseEntity<String> result = null;
    
    // DataSet Map에 추가
    Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    
    try {
      result = getResponseEntity(request, service.callOrderAdjust(params));
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
  @RequestMapping(value = "/Cksave.do", method = RequestMethod.POST)
  public ResponseEntity<String> Cksave(HttpServletRequest request, @RequestParam(Consts.PK_DS_DETAIL) String detailDS,
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
      result = getResponseEntity(request, service.Cksave(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }
	/**
	 * 출고등록/출고지시- Confirm/Cancel 처리
	 * 
	 * @param request
	 *            HttpServletRequest
	 * @param subDS
	 *            DataSet
	 * @param user_Id
	 *            사용자ID
	 * @return
	 */
	@RequestMapping(value = "/callLOProcessing.do", method = RequestMethod.POST)
	public ResponseEntity<String> callLOProcessing(HttpServletRequest request,
			@RequestParam(Consts.PK_DS_MASTER) String masterDS,
			@RequestParam("P_PROCESS_CD") String process_Cd,
			@RequestParam("P_ENTRY_DATE") String outbound_Date,
			@RequestParam("P_DIRECTION") String direction,
			@RequestParam("P_PROCESS_STATE_BW") String process_State_BW,
			@RequestParam("P_PROCESS_STATE_FW") String process_State_FW,
			@RequestParam(Consts.PK_USER_ID) String user_Id) {

		ResponseEntity<String> result = null;

		// DataSet Map에 추가
		Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
		String oMsg = getResultMessage(params);
		if (!Consts.OK.equals(oMsg)) {
			result = getResponseEntityError(request, oMsg);
			return result;
		}
		params.put("P_PROCESS_CD", process_Cd);
		params.put("P_ENTRY_DATE", outbound_Date);
		params.put("P_DIRECTION", direction);
		params.put("P_PROCESS_STATE_BW", process_State_BW); // 취소가능 진행상태
		params.put("P_PROCESS_STATE_FW", process_State_FW); // 처리가능 진행상태
		params.put(Consts.PK_USER_ID, user_Id);

		try {
			if (process_Cd.equals("BT")) {
				result = getResponseEntity(request,
						service.entryBatchProcessing(params));
			} else {
				result = getResponseEntity(request,
						service.callLOProcessing(params));
			}
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}
	
	/**
	 * 출고등록/출고지시- Confirm/Cancel 처리
	 * 
	 * @param request
	 *            HttpServletRequest
	 * @param subDS
	 *            DataSet
	 * @param user_Id
	 *            사용자ID
	 * @return
	 */
	@RequestMapping(value = "/callOrderType.do", method = RequestMethod.POST)
	public ResponseEntity<String> callLOProcessing_OrderType(HttpServletRequest request,
	    @RequestParam(Consts.PK_DS_MASTER) String masterDS,
	    @RequestParam("P_PROCESS_CD") String process_Cd,
	    @RequestParam("P_DIRECTION") String direction,
	    @RequestParam("P_PROCESS_STATE_BW") String process_State_BW,
	    @RequestParam("P_PROCESS_STATE_FW") String process_State_FW,
	    @RequestParam(Consts.PK_USER_ID) String user_Id) {
	  
	  ResponseEntity<String> result = null;
	  
	  // DataSet Map에 추가
	  Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
	  String oMsg = getResultMessage(params);
	  if (!Consts.OK.equals(oMsg)) {
	    result = getResponseEntityError(request, oMsg);
	    return result;
	  }
	  params.put("P_PROCESS_CD", process_Cd);
	  params.put("P_DIRECTION", direction);
	  params.put("P_PROCESS_STATE_BW", process_State_BW); // 취소가능 진행상태
	  params.put("P_PROCESS_STATE_FW", process_State_FW); // 처리가능 진행상태
	  params.put(Consts.PK_USER_ID, user_Id);
	  
	  try {
      result = getResponseEntity(request,
          service.callLOProcessingOrderType(params));
	  } catch (Exception e) {
	    result = getResponseEntityError(request, e);
	  }
	  
	  return result;
	}

	/**
	 * SP 호출 - 조회
	 * 
	 * @param request
	 *            HttpServletRequest
	 * @param queryId
	 *            쿼리ID
	 * @param queryParams
	 *            상품바코드
	 * @return
	 */
	@RequestMapping(value = "/callSP.do", method = RequestMethod.POST)
	public ResponseEntity<String> callSP(HttpServletRequest request,
			@RequestParam(Consts.PK_QUERY_ID) String queryId,
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
	 * 내역 조회
	 * 
	 * @param request
	 *            HttpServletRequest
	 * @param queryId
	 *            쿼리ID
	 * @param queryParams
	 *            쿼리 호출 파라메터
	 * @return
	 */
	@RequestMapping(value = "/getDataSet.do", method = RequestMethod.POST)
	public ResponseEntity<String> getDataSet(HttpServletRequest request,
			@RequestParam(Consts.PK_QUERY_ID) String queryId,
			@RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

		ResponseEntity<String> result = null;

		Map<String, Object> params = getParameter(queryParams);
		String oMsg = getResultMessage(params);
		if (!Consts.OK.equals(oMsg)) {
			result = getResponseEntityError(request, oMsg);
			return result;
		}

		try {
			result = getResponseEntity(request,
					service.getDataSet(queryId, params));
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	/**
	 * 저장(상품별) 처리
	 * 
	 * @param request
	 *            HttpServletRequest
	 * @param masterDS
	 *            DataSet
	 * @param user_Id
	 *            사용자ID
	 * @return
	 */
	@RequestMapping(value = "/save.do", method = RequestMethod.POST)
	public ResponseEntity<String> save(HttpServletRequest request,
			@RequestParam(Consts.PK_DS_MASTER) String masterDS,
			@RequestParam(Consts.PK_DS_DETAIL) String detailDS,
			@RequestParam("P_COMPLETE_YN") String completeYn,
			@RequestParam("P_CARRIER_CD") String carrierCd) {

		ResponseEntity<String> result = null;

		Map<String, Object> params;
		// 출고스캔검수 DataSet Map에 추가
		params = getDataSet(detailDS, Consts.PK_DS_DETAIL);
		String oMsg = getResultMessage(params);
		if (!Consts.OK.equals(oMsg)) {
			result = getResponseEntityError(request, oMsg);
			return result;
		}

		// 마스터 DataSet Map에 추가
		Map<String, Object> masterParams = getParameter(masterDS);
		oMsg = getResultMessage(masterParams);
		if (!Consts.OK.equals(oMsg)) {
			result = getResponseEntityError(request, oMsg);
			return result;
		}
		params.put(Consts.PK_DS_MASTER, masterParams);
		params.put("P_COMPLETE_YN", completeYn);
		params.put("P_CARRIER_CD", carrierCd);

		try {
			result = getResponseEntity(request, service.save(params));
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}
}
