package nexos.service.ed.common;

import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.Util;
import nexos.common.spring.security.CommonEncryptor;
import nexos.service.ed.common.EDCommonDAO;

import org.apache.commons.lang.StringEscapeUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

/**
 * Class: EDReceiverService<br>
 * Description: WS를 통한 수신 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("EDRECEIVER")
@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
public class EDReceiverService {

  private final Logger               logger = LoggerFactory.getLogger(EDReceiverService.class);

  @Resource
  private EDCommonDAO                edCommonDAO;

  @Resource
  private EDCommonService            edCommon;

  @Resource
  private CommonEncryptor            encryptor;

  @Resource
  private PlatformTransactionManager transactionManager;

  public EDCommonDAO getCommonDAO() {

    return edCommonDAO;
  }

  public String recvProcessing(Map<String, Object> params) {

    String result = Consts.ERROR;

    final String RECV_METHOD_NM_PREFIX = "recvProcessing_";

    String BU_CD = (String)params.get("P_BU_CD");
    String EDI_DIV = (String)params.get("P_EDI_DIV");
    String DEFINE_NO = (String)params.get("P_DEFINE_NO");
    String SITE_CD = Util.getNull((String)params.get("P_SITE_CD"), Consts.SITE_CD_STANDARD);
    logger
      .info("\nEDRECEIVER[recvProcessing] >> Receiving................................................................\n"
        + BU_CD + "_" + EDI_DIV + "_" + DEFINE_NO);

    try {
      Method recvProcessingFn = this.getClass().getMethod(RECV_METHOD_NM_PREFIX + SITE_CD, Map.class);
      result = (String)recvProcessingFn.invoke(this, params);
    } catch (Exception e) {
      result = e.getMessage();
    }

    return result;
  }

  public String recvProcessing_0000(Map<String, Object> params) {

    String result = Consts.OK;
    String ER_PROCESSING_ID = "ER_PROCESSING";
    HashMap<String, Object> resultMap = null;
    DefaultTransactionDefinition dtd = new DefaultTransactionDefinition();
    TransactionStatus ts = null;
    String oMsg = null;

    // XML -> EDI 테이블에 데이터 입력 중 발생하는 오류가 아니면 Return Value는 "OK"로 넘김
    ts = transactionManager.getTransaction(dtd);
    try {
      // 암호화된 문서
      if (params.containsKey("P_ENC_DOCUMENT")) {
        String KEY_FILE_NM = (String)params.get("P_KEY_FILE_NM");
        String ENC_DOCUMENT = (String)params.get("P_ENC_DOCUMENT");
        // logger.info("EDRECEIVER[recvProcessing >> ENC_DOCUMENT]\n" + ENC_DOCUMENT);
        String DEC_DOCUMENT = encryptor.decryptRSA(ENC_DOCUMENT, KEY_FILE_NM);
        if (DEC_DOCUMENT.startsWith("&lt;") && DEC_DOCUMENT.endsWith("&gt;")) {
          // logger.info("EDRECEIVER[recvProcessing >> P_DOCUMENT<D>]\n" + DEC_DOCUMENT);
          DEC_DOCUMENT = StringEscapeUtils.unescapeXml(DEC_DOCUMENT);
        }
        params.put("P_DOCUMENT", DEC_DOCUMENT);
        params.remove("P_ENC_DOCUMENT");
        params.remove("P_KEY_FILE_NM");
      }
      // logger.info("EDRECEIVER[recvProcessing >> P_DOCUMENT]\n" + (String)params.get("P_DOCUMENT"));

      if (Util.isNull((String)params.get("P_RECV_DATE"))) {
        params.put("P_RECV_DATE", edCommonDAO.getEDIDate());
      }

      resultMap = edCommonDAO.recvXML(params);

      oMsg = (String)resultMap.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      transactionManager.commit(ts);
      // logger.info("EDRECEIVER[recvProcessing >> recvResult]\n" + result);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      result = e.getMessage();
      logger.error("EDRECEIVER[recvProcessing] Error", e);
      return result;
    }

    // EDI 테이블에 입력 후 ER_PROCESSING 호출
    HashMap<String, Object> callParams = new HashMap<String, Object>(resultMap);
    callParams.put("P_USER_ID", params.get("P_USER_ID"));
    callParams.put("P_PROCESS_CD", "B");
    ts = transactionManager.getTransaction(dtd);
    try {
      resultMap = edCommonDAO.callSP(ER_PROCESSING_ID, callParams);
      oMsg = (String)resultMap.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      transactionManager.commit(ts);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      logger.error("EDRECEIVER[recvProcessing] Error", e);
      return result;
    }

    // 정상 처리시 다음 처리, 트랜잭션 별도
    try {
      recvProcessingAfter_0000(callParams);
    } catch (Exception e) {
    }

    return result;
  }

  public String recvProcessing_0010(Map<String, Object> params) {

    String result = Consts.OK;
    String ER_PROCESSING_ID = "ER_PROCESSING";
    HashMap<String, Object> resultMap = null;
    DefaultTransactionDefinition dtd = new DefaultTransactionDefinition();
    TransactionStatus ts = null;
    String oMsg = null;

    // XML -> EDI 테이블에 데이터 입력 중 발생하는 오류가 아니면 Return Value는 "OK"로 넘김
    ts = transactionManager.getTransaction(dtd);
    try {
      // 암호화된 문서
      if (params.containsKey("P_ENC_DOCUMENT")) {
        String KEY_FILE_NM = (String)params.get("P_KEY_FILE_NM");
        String ENC_DOCUMENT = (String)params.get("P_ENC_DOCUMENT");
        // logger.info("EDRECEIVER[recvProcessing >> ENC_DOCUMENT]\n" + ENC_DOCUMENT);
        String DEC_DOCUMENT = encryptor.decryptRSA(ENC_DOCUMENT, KEY_FILE_NM).trim();
        if (DEC_DOCUMENT.startsWith("&lt;") && DEC_DOCUMENT.endsWith("&gt;")) {
          // logger.info("EDRECEIVER[recvProcessing >> P_DOCUMENT<D>]\n" + DEC_DOCUMENT);
          DEC_DOCUMENT = StringEscapeUtils.unescapeXml(DEC_DOCUMENT);
        }
        params.put("P_DOCUMENT", DEC_DOCUMENT);
        params.remove("P_ENC_DOCUMENT");
        params.remove("P_KEY_FILE_NM");
      }
      // logger.info("EDRECEIVER[recvProcessing >> P_DOCUMENT]\n" + (String)params.get("P_DOCUMENT"));

      if (Util.isNull((String)params.get("P_RECV_DATE"))) {
        params.put("P_RECV_DATE", edCommonDAO.getEDIDate());
      }

      resultMap = edCommonDAO.recvXML(params);

      oMsg = (String)resultMap.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      transactionManager.commit(ts);
      // logger.info("EDRECEIVER[recvProcessing >> recvResult]\n" + result);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      result = e.getMessage();
      logger.error("EDRECEIVER[recvProcessing] Error", e);
      return result;
    }

    // EDI 테이블에 입력 후 ER_PROCESSING 호출
    HashMap<String, Object> callParams = new HashMap<String, Object>(resultMap);
    callParams.put("P_USER_ID", params.get("P_USER_ID"));
    callParams.put("P_PROCESS_CD", "B");
    ts = transactionManager.getTransaction(dtd);
    try {
      resultMap = edCommonDAO.callSP(ER_PROCESSING_ID, callParams);
      oMsg = (String)resultMap.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      transactionManager.commit(ts);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      logger.error("EDRECEIVER[recvProcessing] Error", e);
      return result;
    }

    // 정상 처리시 다음 처리, 트랜잭션 별도
    try {
      recvProcessingAfter_0010(callParams);
    } catch (Exception e) {
    }

    return result;
  }

  private void recvProcessingAfter_0000(Map<String, Object> params) {

    final String ER_PROCESSING_AFTER_ID = "ER_PROCESSING_AFTER";

    HashMap<String, Object> resultMap = null;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      resultMap = edCommonDAO.callSP(ER_PROCESSING_AFTER_ID, params);
      String oMsg = (String)resultMap.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      transactionManager.commit(ts);
      // logger.info("EDRECEIVER[recvProcessingAfter] : " + oMsg);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      logger.error("EDRECEIVER[recvProcessingAfter] Error", e);
    }
  }

  private void recvProcessingAfter_0010(Map<String, Object> params) {

    final String ER_PROCESSING_AFTER_ID = "ER_PROCESSING_AFTER";

    HashMap<String, Object> resultMap = null;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      resultMap = edCommonDAO.callSP(ER_PROCESSING_AFTER_ID, params);
      String oMsg = (String)resultMap.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      oMsg = edCommon.realtimeSendProcessing();
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      transactionManager.commit(ts);
      // logger.info("EDRECEIVER[recvProcessingAfter] : " + oMsg);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      logger.error("EDRECEIVER[recvProcessingAfter] Error", e);
    }
  }
}