package nexos.service.ed.ws;

import java.io.InputStream;
import java.lang.reflect.Method;
import java.util.Properties;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.Util;

import org.apache.commons.io.IOUtils;
import org.apache.commons.lang.StringEscapeUtils;
import org.apache.cxf.interceptor.Fault;
import org.apache.cxf.message.Exchange;
import org.apache.cxf.message.Message;
import org.apache.cxf.phase.AbstractPhaseInterceptor;
import org.apache.cxf.phase.Phase;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.annotation.Secured;

@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
public class EDReceiverInterceptor extends AbstractPhaseInterceptor<Message> {

  private final Logger logger = LoggerFactory.getLogger(EDReceiverInterceptor.class);

  @Resource
  private Properties   taskProps;

  public EDReceiverInterceptor() {

    super(Phase.PRE_STREAM);
  }

  @Override
  public void handleMessage(Message message) throws Fault {

    if (!isOutMessage(message)) {

      final String HANDLEMESSAGE_METHOD_NM_PREFIX = "handleMessage_";
      String SITE_CD = Util.getNull(taskProps.getProperty("EDI.SITE_CD"), Consts.SITE_CD_STANDARD);

      try {
        Method handleMessageFn = this.getClass().getMethod(HANDLEMESSAGE_METHOD_NM_PREFIX + SITE_CD, Message.class);
        handleMessageFn.invoke(this, message);
      } catch (Exception e) {
        e.printStackTrace();
      }

    }
  }

  public void handleMessage_0000(Message message) throws Fault {

  }

  public void handleMessage_0010(Message message) throws Fault {

    try {
      InputStream isContent = message.getContent(InputStream.class);
      String envMessage = IOUtils.toString(isContent, Consts.CHARSET);
      IOUtils.closeQuietly(isContent);
      // logger.info("EDReceiverInterceptor[handleMessage >>  EnvelopeMessage<O>]\n" + envMessage);

      String lowerEnvelopeMessage = envMessage.toLowerCase();
      int startXmlDoc = lowerEnvelopeMessage.indexOf("<xmlstring");
      if (startXmlDoc == -1) {
        startXmlDoc = lowerEnvelopeMessage.indexOf("xmlstring>");
      }
      int endXmlDoc = lowerEnvelopeMessage.lastIndexOf("xmlstring>");
      if (startXmlDoc == endXmlDoc || startXmlDoc == -1 || endXmlDoc == -1) {
        return;
      }

      startXmlDoc = lowerEnvelopeMessage.indexOf(">", startXmlDoc) + 1;
      endXmlDoc = lowerEnvelopeMessage.lastIndexOf("<", endXmlDoc);
      String envMessageH = envMessage.substring(0, startXmlDoc);
      String envMessageF = envMessage.substring(endXmlDoc);
      String envMessageP = envMessage.substring(startXmlDoc, endXmlDoc).trim();

      if (envMessageP.startsWith("<") && envMessageP.endsWith(">")) {
        envMessageP = StringEscapeUtils.escapeXml(envMessageP);
        envMessage = envMessageH + envMessageP + envMessageF;
        // logger.info("EDReceiverInterceptor[handleMessage >>  EnvelopeMessage<C>]\n" + envMessage);
      }

      isContent = IOUtils.toInputStream(envMessage, Consts.CHARSET);
      message.setContent(InputStream.class, isContent);
      IOUtils.closeQuietly(isContent);
    } catch (Exception e) {
      logger.error("Unable to perform change.", e);
      throw new RuntimeException(e);
    }
  }

  public boolean isOutMessage(Message message) {

    Exchange exchange = message.getExchange();
    return message != null && exchange != null
      && (message == exchange.getOutMessage() || message == exchange.getOutFaultMessage());
  }

}
