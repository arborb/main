package nexos.controller.ed;

import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.ed.ED02020EService;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;



/**
 * Class: 인터페이스 송신관리 컨트롤러<br>
 * Description: 인터페이스 송신관리 Controller<br>
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
@RequestMapping("/ED02020E")
public class ED02020EController extends CommonController {

    @Resource
    private ED02020EService service;

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
     * 인터페이스 송신관리 마스터/디테일 저장 처리
     * @param request   HttpServletRequest
     * @param masterDS  송신정의 마스터 DataSet
     * @param detailDS  송신정의 디테일 DataSet
     * @param user_Id   사용자ID
     * 
     * 참고 : 마스터 삭제 시에는 detailDS에 빈 DataSet이 넘어와야 한다. 
     */
    @RequestMapping(value = "/save.do", method = RequestMethod.POST)
    public ResponseEntity<String> save(HttpServletRequest request, 
            @RequestParam(Consts.PK_DS_MASTER) String masterDS,
            @RequestParam(Consts.PK_DS_DETAIL) String detailDS, 
            @RequestParam(Consts.PK_USER_ID) String user_Id) {

        ResponseEntity<String> result = null;

        // 송신정의 마스터 DataSet Map에 추가
        Map<String, Object> params = getDataSet(masterDS, Consts.PK_DS_MASTER);
        String oMsg = getResultMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            result = getResponseEntityError(request, oMsg);
            return result;
        }

        // 송신정의 디테일 DataSet Map에 추가
        setDataSet(params, detailDS, Consts.PK_DS_DETAIL);
        oMsg = getResultMessage(params);
        if (!Consts.OK.equals(oMsg)) {
            result = getResponseEntityError(request, oMsg);
            return result;
        }
        
        params.put(Consts.PK_USER_ID, user_Id);

        
        try {
            result = getResponseEntity(request, service.save(params));
        } catch (Exception e) {
            result = getResponseEntityError(request, e);
        }

        return result;
    }


}
