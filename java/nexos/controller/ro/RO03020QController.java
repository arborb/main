package nexos.controller.ro;

import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.ro.RO03020QService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

/**
 * Class: 반품내역 컨트롤러<br>
 * Description: 반품내역 관리 Controller<br>
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
@RequestMapping("/RO03020Q")
public class RO03020QController extends CommonController {

    @Resource
    private RO03020QService service;

    /**
     * 내역 조회
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
}
