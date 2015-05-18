package nexos.service.ed.common;

import java.lang.reflect.Method;
import java.net.URL;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;
import javax.xml.namespace.QName;

import nexos.common.Consts;
import nexos.common.Util;
import nexos.common.spring.security.CommonEncryptor;

import org.apache.axis.AxisEngine;
import org.apache.axis.client.Call;
import org.apache.axis.constants.Style;
import org.apache.axis.constants.Use;
import org.apache.axis.description.OperationDesc;
import org.apache.axis.description.ParameterDesc;
import org.apache.axis.soap.SOAPConstants;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.security.access.annotation.Secured;

/**
 * Class: EDSenderService<br>
 * Description: WS를 통한 송신 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("EDSENDER")
@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
public class EDSenderService {

  private final Logger    logger = LoggerFactory.getLogger(EDSenderService.class);

  @Resource
  private CommonEncryptor encryptor;

  @Resource
  private Properties      taskProps;

  @SuppressWarnings("rawtypes")
  public String sendProcessing(Map params) {

    String result = Consts.ERROR;

    final String SEND_METHOD_NM_PREFIX = "sendProcessing_";

    String BU_CD = (String)params.get("P_BU_CD");
    String EDI_DIV = (String)params.get("P_EDI_DIV");
    String DEFINE_NO = (String)params.get("P_DEFINE_NO");
    String SITE_CD = Util.getNull((String)params.get("P_SITE_CD"), Consts.SITE_CD_STANDARD);
    logger
      .info("\nEDSENDER[sendProcessing] >> Sending....................................................................\n"
        + BU_CD + "_" + EDI_DIV + "_" + DEFINE_NO);

    try {
      Method sendProcessingFn = this.getClass().getMethod(SEND_METHOD_NM_PREFIX + SITE_CD, Map.class);
      result = (String)sendProcessingFn.invoke(this, params);
    } catch (Exception e) {
      result = e.getMessage();
    }

    return result;
  }

  @SuppressWarnings("rawtypes")
  public String sendProcessing_0000(Map params) {

    String result = Consts.ERROR;

    final String PK_WS_URL = "P_WEBSERVICE_URL";
    final String PK_WS_METHOD = "P_WEBSERVICE_METHOD";
    final String PK_DOCUMENT = "P_DOCUMENT";
    final String PK_REMOTE_USER_ID = "P_REMOTE_USER_ID";
    final String PK_REMOTE_USER_PWD = "P_REMOTE_USER_PWD";
    final String PK_SITE_CD = "P_SITE_CD";

    final String IN_PARAM_NM_SUFFIX = "XML";
    final String OUT_PARAM_NM_SUFFIX = "Return";

    String WS_URL = (String)params.get(PK_WS_URL);
    String WS_WSDL_URL = WS_URL + "?WSDL";
    String WS_METHOD = (String)params.get(PK_WS_METHOD);
    String WS_SOAP_URL = WS_URL + "/" + WS_METHOD;
    String WS_PARAM = (String)params.get(PK_DOCUMENT);
    String WS_USER_ID = (String)params.get(PK_REMOTE_USER_ID);
    String WS_USER_PWD = (String)params.get(PK_REMOTE_USER_PWD);
    String SITE_CD = (String)params.get(PK_SITE_CD);

    // logger.info("EDSENDER[sendProcessing >> WS_URL] " + WS_URL);
    // logger.info("EDSENDER[sendProcessing >> WS_METHOD] " + WS_METHOD);
    // logger.info("EDSENDER[sendProcessing >> WS_PARAM]\n" + WS_PARAM);

    org.apache.axis.client.Service service = new org.apache.axis.client.Service();
    try {
      if (Boolean.parseBoolean(taskProps.getProperty("WS.UseRSAEncryptor"))) {
        String KEY_FILE_NM = taskProps.getProperty("WS.PublicKey_" + SITE_CD);
        WS_PARAM = encryptor.encryptRSA(WS_PARAM, KEY_FILE_NM);
        // logger.info("EDSENDER[sendProcessing >> WS_PARAM<ENC>]\n" + WS_PARAM);
      }

      Call callSrv = (Call)service.createCall();

      ParameterDesc callParam = new ParameterDesc(new QName(WS_URL, WS_METHOD + IN_PARAM_NM_SUFFIX), ParameterDesc.IN,
        getStringParamQName(), String.class, false, false);
      callParam.setOmittable(true);

      OperationDesc callOper = new OperationDesc();
      callOper.setName(WS_METHOD);
      callOper.addParameter(callParam);
      callOper.setReturnType(getStringParamQName());
      callOper.setReturnClass(String.class);
      callOper.setReturnQName(new QName(WS_URL, WS_METHOD + OUT_PARAM_NM_SUFFIX));
      callOper.setStyle(Style.WRAPPED);
      callOper.setUse(Use.LITERAL);

      callSrv.setOperation(callOper);
      callSrv.setUseSOAPAction(true);
      callSrv.setSOAPActionURI(WS_SOAP_URL);
      callSrv.setEncodingStyle(null);
      callSrv.setProperty(Call.SEND_TYPE_ATTR, Boolean.FALSE);
      callSrv.setProperty(AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
      callSrv.setSOAPVersion(SOAPConstants.SOAP11_CONSTANTS);
      callSrv.setOperationName(new QName(WS_URL, WS_METHOD));
      callSrv.setTargetEndpointAddress(new URL(WS_WSDL_URL));

      if (WS_USER_ID != null && WS_USER_PWD != null) {
        callSrv.setUsername(WS_USER_ID);
        callSrv.setPassword(WS_USER_PWD);
      }

      Object callResult = callSrv.invoke(new Object[ ] {WS_PARAM});
      if (callResult != null) {
        result = (String)callResult;
      }
      // logger.info("EDSENDER[sendProcessing >> sendResult]\n" + result);
    } catch (Exception e) {
      logger.error("EDSENDER[sendProcessing] Error", e);
      result = e.getMessage();
    }

    return result;
  }

  @SuppressWarnings("rawtypes")
  public String sendProcessing_0010(Map params) {

    String result = Consts.ERROR;

    final String EDI_DIV_ESLOORDER = "SLO10";
    final String PK_WS_URL = "P_WEBSERVICE_URL";
    final String PK_WS_METHOD = "P_WEBSERVICE_METHOD";
    final String PK_REMOTE_USER_ID = "P_REMOTE_USER_ID";
    final String PK_REMOTE_USER_PWD = "P_REMOTE_USER_PWD";
    final String PK_DOCUMENT = "P_DOCUMENT";
    final String PK_SITE_CD = "P_SITE_CD";

    String EDI_DIV = (String)params.get("P_EDI_DIV");
    if (EDI_DIV_ESLOORDER.equals(EDI_DIV)) {

      String WS_URL = (String)params.get(PK_WS_URL);
      String WS_METHOD = (String)params.get(PK_WS_METHOD);
      String WS_USER_ID = (String)params.get(PK_REMOTE_USER_ID);
      String WS_USER_PWD = (String)params.get(PK_REMOTE_USER_PWD);

      nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1 WS_PARAM = (nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1)params
        .get(PK_DOCUMENT);

      // logger.info("EDSENDER[sendProcessing >> WS_URL] " + WS_URL);
      // logger.info("EDSENDER[sendProcessing >> WS_METHOD] " + WS_METHOD);

      try {
        // 접속정보 세팅
        // 테스트서버:
        // http://wm3px.am.elcompanies.net:54522/ws/elc.purchaseOrder.corpOnLineEcom.kr.publish:corpOnLineEcom/elc_purchaseOrder_corpOnLineEcom_kr_publish_corpOnLineEcom_Port
        // elOnline_Kr / ELonlineKR4PSP
        // 실서버 :
        // http://wm3px.am.elcompanies.net:59522/ws/elc.purchaseOrder.corpOnLineEcom.kr.publish:corpOnLineEcom/elc_purchaseOrder_corpOnLineEcom_kr_publish_corpOnLineEcom_Port
        nexos.service.ed.ws.elca.corpOnLineEcom.CorpOnLineEcomLocator wsLocator = new nexos.service.ed.ws.elca.corpOnLineEcom.CorpOnLineEcomLocator();
        wsLocator.setCorpOnLineEcomEndpointAddress(WS_URL);
        nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrderBinderStub wsStub = (nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrderBinderStub)wsLocator
          .getCorpOnLineEcom();
        if (WS_USER_ID != null && WS_USER_PWD != null) {
          wsStub.setUsername(WS_USER_ID);
          wsStub.setPassword(WS_USER_PWD);
        }

        // Method 검색
        Method method = wsStub.getClass().getMethod(WS_METHOD,
          nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1.class);

        // Method 호출
        nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1Response response = (nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1Response)method
          .invoke(wsStub, WS_PARAM);

        // 처리 결과 parsing
        nexos.service.ed.ws.elca.corpOnLineEcom.Doc_publishPurchaseOrderResponse docResponse = response.getResponse();
        nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage3 resultMessage3 = docResponse.getResultMessage(0);
        result = resultMessage3.getFullMessage();

        // logger.info("EDSENDER[sendProcessing >> sendResult] " + result);
      } catch (Exception e) {
        logger.error("EDSENDER[sendProcessing] Error", e);
        if (e instanceof org.apache.axis.AxisFault) {
          result = ((org.apache.axis.AxisFault)e).getFaultString();
        } else {
          result = e.getMessage();
        }
      }
    } else {
      String WS_URL = (String)params.get(PK_WS_URL);
      String WS_METHOD = (String)params.get(PK_WS_METHOD);
      String WS_PARAM = (String)params.get(PK_DOCUMENT);
      String WS_USER_ID = (String)params.get(PK_REMOTE_USER_ID);
      String WS_USER_PWD = (String)params.get(PK_REMOTE_USER_PWD);
      String SITE_CD = (String)params.get(PK_SITE_CD);

      // logger.info("EDSENDER[sendProcessing >> WS_URL] " + WS_URL);
      // logger.info("EDSENDER[sendProcessing >> WS_METHOD] " + WS_METHOD);
      // logger.info("EDSENDER[sendProcessing >> WS_PARAM]\n" + WS_PARAM);

      try {
        if (Boolean.parseBoolean(taskProps.getProperty("WS.UseRSAEncryptor"))) {
          String KEY_FILE_NM = taskProps.getProperty("WS.PublicKey_" + SITE_CD);
          WS_PARAM = encryptor.encryptRSA(WS_PARAM, KEY_FILE_NM);
          // logger.info("EDSENDER[sendProcessing >> WS_PARAM<ENC>]\n" + WS_PARAM);
        }

        // 접속정보 세팅
        // 테스트서버:
        // http://10.32.231.37:8080/krservice/krservice.svc
        nexos.service.ed.ws.elca.krService.KrServiceLocator wsLocator = new nexos.service.ed.ws.elca.krService.KrServiceLocator();
        wsLocator.setKrServiceEndpointAddress(WS_URL);
        nexos.service.ed.ws.elca.krService.KrServiceBinderStub wsStub = (nexos.service.ed.ws.elca.krService.KrServiceBinderStub)wsLocator
          .getKrService();
        if (WS_USER_ID != null && WS_USER_PWD != null) {
          wsStub.setUsername(WS_USER_ID);
          wsStub.setPassword(WS_USER_PWD);
        }

        // Method 검색
        Method method = wsStub.getClass().getMethod(WS_METHOD, java.lang.String.class);

        // Method 호출
        Object callResult = method.invoke(wsStub, WS_PARAM);
        if (callResult != null) {
          result = (String)callResult;
        }
        // logger.info("EDSENDER[sendProcessing >> sendResult]\n" + result);
      } catch (Exception e) {
        logger.error("EDSENDER[sendProcessing] Error", e);
        if (e instanceof org.apache.axis.AxisFault) {
          result = ((org.apache.axis.AxisFault)e).getFaultString();
        } else {
          result = e.getMessage();
        }
      }
    }
    return result;
  }

  private QName getStringParamQName() {

    return new QName("http://www.w3.org/2001/XMLSchema", "string");
  }

  public String getTaskProperty(String key) {

    return taskProps.getProperty(key);
  }
}