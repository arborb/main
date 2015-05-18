package nexos.controller.lf;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.lf.LF01020EService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Class: 월마감 관리 컨트롤러<br>
 * Description: 월마감 관리 Controller<br>
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
@RequestMapping("/LF01020E")
public class LF01020EController extends CommonController {

    @Resource
    private LF01020EService service;

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
     * 마감 처리
     * @param request   HttpServletRequest
     * @param subDS  DataSet
     * @param user_Id   사용자ID
     * @return
     */
    @RequestMapping(value = "/callProcessingClossing.do", method = RequestMethod.POST)
    public ResponseEntity<String> callProcessingClossing(HttpServletRequest request,
        @RequestParam(Consts.PK_DS_MASTER) String masterDS, @RequestParam(Consts.PK_USER_ID) String user_Id) {

    	ResponseEntity<String> result = null;

    	// DataSet Map에 추가
    	Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
    	String oMsg = getResultMessage(params);
    	if (!Consts.OK.equals(oMsg)) {
    		result = getResponseEntityError(request, oMsg);
    		return result;
    	}
    	params.put(Consts.PK_USER_ID, user_Id);

    	try {
    		result = getResponseEntity(request, service.callProcessingClossing(params));
    	} catch (Exception e) {
    		result = getResponseEntityError(request, e);
    	}

    	return result;
    }
}
