package nexos.service.ed.ws;

import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;
import javax.jws.WebService;

import org.springframework.security.access.annotation.Secured;

import nexos.common.Consts;
import nexos.service.ed.common.EDReceiverService;

@WebService(endpointInterface = "nexos.service.ed.ws.EDReceiver")
@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
public class EDReceiverImpl implements EDReceiver {

  // private final Logger logger = LoggerFactory.getLogger(EDReceiverImpl.class);

  @Resource
  private EDReceiverService service;

  @Resource
  private Properties        taskProps;

  @Override
  public String productDataExport(String xmlString) {

    HashMap<String, Object> params = new HashMap<String, Object>();
    params.put("P_BU_CD", taskProps.getProperty("WS.ERITEM.BU_CD"));
    params.put("P_EDI_DIV", taskProps.getProperty("WS.ERITEM.EDI_DIV"));
    params.put("P_DEFINE_NO", taskProps.getProperty("WS.ERITEM.DEFINE_NO"));
    params.put("P_RECV_DATE", "");
    params.put("P_RECV_NO", "");
    params.put("P_PROCESS_CD", taskProps.getProperty("WS.ERITEM.PROCESS_CD"));
    params.put("P_DATA_DIV", taskProps.getProperty("WS.ERITEM.DATA_DIV"));
    params.put("P_USER_ID", taskProps.getProperty("WS.USER_ID"));
    params.put("P_FILE_DIV", Consts.FILE_DIV_DOC);
    String SITE_CD = taskProps.getProperty("EDI.SITE_CD");
    params.put("P_SITE_CD", SITE_CD);

    if (Boolean.parseBoolean(taskProps.getProperty("WS.UseRSAEncryptor"))) {
      params.put("P_ENC_DOCUMENT", xmlString);
      params.put("P_KEY_FILE_NM", taskProps.getProperty("WS.PrivateKey_" + SITE_CD));
    } else {
      params.put("P_DOCUMENT", xmlString);
    }

    String result = recvERItem(params);

    StringBuffer sbResult = new StringBuffer();
    if (Consts.OK.equals(result)) {
      sbResult.append("<ProductUpdateReturns>").append(Consts.CRLF);
      sbResult.append("  <ProductUpdates>").append(Consts.CRLF);
      sbResult.append("    <ProductUpdate Code=\"0\" Message=\"Success\" />").append(Consts.CRLF);
      sbResult.append("  </ProductUpdates>").append(Consts.CRLF);
      sbResult.append("</ProductUpdateReturns>");
    } else {
      sbResult.append("<ProductUpdateReturns>").append(Consts.CRLF);
      sbResult.append("  <ProductUpdates>").append(Consts.CRLF);
      sbResult.append(
        "    <ProductUpdate Code=\"1\" Message=\"" + result.replaceAll("(?:\\r\\n|\\n\\r|\\n|\\r)", " ") + "\" />")
        .append(Consts.CRLF);
      sbResult.append("  </ProductUpdates>").append(Consts.CRLF);
      sbResult.append("</ProductUpdateReturns>");
    }

    result = sbResult.toString();
    // logger.info("EDReceiver[ProductDataExport >> recvResult]\n" + result);

    return result;
  }

  @Override
  public String orderExport(String xmlString) {

    HashMap<String, Object> params = new HashMap<String, Object>();
    params.put("P_BU_CD", taskProps.getProperty("WS.ERLOORDER.BU_CD"));
    params.put("P_EDI_DIV", taskProps.getProperty("WS.ERLOORDER.EDI_DIV"));
    params.put("P_DEFINE_NO", taskProps.getProperty("WS.ERLOORDER.DEFINE_NO"));
    params.put("P_RECV_DATE", "");
    params.put("P_RECV_NO", "");
    params.put("P_PROCESS_CD", taskProps.getProperty("WS.ERLOORDER.PROCESS_CD"));
    params.put("P_DATA_DIV", taskProps.getProperty("WS.ERLOORDER.DATA_DIV"));
    params.put("P_USER_ID", taskProps.getProperty("WS.USER_ID"));
    params.put("P_FILE_DIV", Consts.FILE_DIV_DOC);
    String SITE_CD = taskProps.getProperty("EDI.SITE_CD");
    params.put("P_SITE_CD", SITE_CD);

    if (Boolean.parseBoolean(taskProps.getProperty("WS.UseRSAEncryptor"))) {
      params.put("P_ENC_DOCUMENT", xmlString);
      params.put("P_KEY_FILE_NM", taskProps.getProperty("WS.PrivateKey_" + SITE_CD));
    } else {
      params.put("P_DOCUMENT", xmlString);
    }

    String result = recvERLOOrder(params);

    StringBuffer sbResult = new StringBuffer();
    if (Consts.OK.equals(result)) {
      sbResult.append("<OrderUpdateReturns>").append(Consts.CRLF);
      sbResult.append("  <OrderUpdates>").append(Consts.CRLF);
      sbResult.append("    <OrderUpdate Code=\"0\" Message=\"Success\" />").append(Consts.CRLF);
      sbResult.append("  </OrderUpdates>").append(Consts.CRLF);
      sbResult.append("</OrderUpdateReturns>");
    } else {
      sbResult.append("<OrderUpdateReturns>").append(Consts.CRLF);
      sbResult.append("  <OrderUpdates>").append(Consts.CRLF);
      sbResult.append(
        "    <OrderUpdate Code=\"1\" Message=\"" + result.replaceAll("(?:\\r\\n|\\n\\r|\\n|\\r)", " ") + "\" />")
        .append(Consts.CRLF);
      sbResult.append("  </OrderUpdates>").append(Consts.CRLF);
      sbResult.append("</OrderUpdateReturns>");
    }

    result = sbResult.toString();
    // logger.info("EDReceiver[OrderExport >> recvResult]\n" + result);

    return result;
  }

  @Override
  public String orderStatus(String xmlString) {

    HashMap<String, Object> params = new HashMap<String, Object>();
    params.put("P_BU_CD", taskProps.getProperty("WS.ERLOSTATUS.BU_CD"));
    params.put("P_EDI_DIV", taskProps.getProperty("WS.ERLOSTATUS.EDI_DIV"));
    params.put("P_DEFINE_NO", taskProps.getProperty("WS.ERLOSTATUS.DEFINE_NO"));
    params.put("P_RECV_DATE", "");
    params.put("P_RECV_NO", "");
    params.put("P_PROCESS_CD", taskProps.getProperty("WS.ERLOSTATUS.PROCESS_CD"));
    params.put("P_DATA_DIV", taskProps.getProperty("WS.ERLOSTATUS.DATA_DIV"));
    params.put("P_USER_ID", taskProps.getProperty("WS.USER_ID"));
    params.put("P_FILE_DIV", Consts.FILE_DIV_DOC);
    String SITE_CD = taskProps.getProperty("EDI.SITE_CD");
    params.put("P_SITE_CD", SITE_CD);

    if (Boolean.parseBoolean(taskProps.getProperty("WS.UseRSAEncryptor"))) {
      params.put("P_ENC_DOCUMENT", xmlString);
      params.put("P_KEY_FILE_NM", taskProps.getProperty("WS.PrivateKey_" + SITE_CD));
    } else {
      params.put("P_DOCUMENT", xmlString);
    }

    String result = recvERLOOrderStatus(params);

    StringBuffer sbResult = new StringBuffer();
    if (Consts.OK.equals(result)) {
      sbResult.append("<StatusUpdateReturns>").append(Consts.CRLF);
      sbResult.append("  <StatusUpdates>").append(Consts.CRLF);
      sbResult.append("    <StatusUpdate Code=\"0\" Message=\"Success\" />").append(Consts.CRLF);
      sbResult.append("  </StatusUpdates>").append(Consts.CRLF);
      sbResult.append("</StatusUpdateReturns>");
    } else {
      sbResult.append("<StatusUpdateReturns>").append(Consts.CRLF);
      sbResult.append("  <StatusUpdates>").append(Consts.CRLF);
      sbResult.append(
        "    <StatusUpdate Code=\"1\" Message=\"" + result.replaceAll("(?:\\r\\n|\\n\\r|\\n|\\r)", " ") + "\" />")
        .append(Consts.CRLF);
      sbResult.append("  </StatusUpdates>").append(Consts.CRLF);
      sbResult.append("</StatusUpdateReturns>");
    }

    result = sbResult.toString();
    // logger.info("EDReceiver[OrderStatus >> recvResult]\n" + result);

    return result;
  }

  private String recvERItem(Map<String, Object> params) {

    String result = Consts.ERROR;

    try {
      result = service.recvProcessing(params);
    } catch (Exception e) {
      result = e.getMessage();
    }

    return result;
  }

  private String recvERLOOrder(Map<String, Object> params) {

    String result = Consts.ERROR;

    try {
      result = service.recvProcessing(params);
    } catch (Exception e) {
      result = e.getMessage();
    }

    return result;
  }

  private String recvERLOOrderStatus(Map<String, Object> params) {

    String result = Consts.ERROR;

    try {
      result = service.recvProcessing(params);
    } catch (Exception e) {
      result = e.getMessage();
    }

    return result;
  }
}
