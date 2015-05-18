package nexos.service.ed;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.JsonDataSet;
import nexos.service.common.CommonDAO;
import nexos.service.ed.common.EDCommonDAO;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

/**
 * Class: ED03060EService<br>
 * Description: [수신]반입예정 관리(ED03060E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("ED03060E")
public class ED03060EService {

  // private final Logger logger = LoggerFactory.getLogger(ED03060EService.class);

  /**
   * DAO 주입처리하기
   */
  @Resource
  private CommonDAO                  common;

  @Resource
  private EDCommonDAO                edCommon;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return common.getJsonDataSet(queryId, params);
  }

  /**
   * 수신 처리 결과를 Map 형태로 Return
   */
  @SuppressWarnings({"rawtypes", "unchecked"})
  public Map recvProcessing(Map<String, Object> params) throws Exception {

    HashMap<String, Object> mapResult = null;

    final String GET_SYSDATE_ID = "WC.GET_SYSDATE";
    final String DATA_DIV_DBLINK = "01";
    final String DATA_DIV_EXCEL = "02";
    final String DATA_DIV_TEXT = "03";
    final String DATA_DIV_XML = "04";

    String data_Div = (String)params.get("P_DATA_DIV");

    List list = common.getDataSet(GET_SYSDATE_ID);
    if (list == null || list.size() == 0) {
      throw new RuntimeException("수신일자를 가져오지 못했습니다. 다시 처리하십시오.");
    }
    // 수신일자 세팅
    Map<String, Object> rowData = (HashMap<String, Object>)list.get(0);
    String recv_Date = (String)rowData.get("SYS_DATE");
    params.put("P_RECV_DATE", recv_Date);

    // DBLink
    if (DATA_DIV_DBLINK.equals(data_Div)) {
      TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
      try {
        mapResult = common.callSP((String)params.get(Consts.PK_QUERY_ID), params);

        String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
        transactionManager.commit(ts);
      } catch (Exception e) {
        transactionManager.rollback(ts);
        throw new RuntimeException(e.getMessage());
      }
    } else if (DATA_DIV_EXCEL.equals(data_Div) || DATA_DIV_TEXT.equals(data_Div) || DATA_DIV_XML.equals(data_Div)) {
      // EXCEL, TEXT, XML
      TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
      try {
        if (DATA_DIV_EXCEL.equals(data_Div)) {
          mapResult = edCommon.recvExcel(params);
        } else if (DATA_DIV_TEXT.equals(data_Div)) {
          mapResult = edCommon.recvText(params);
        } else {
          mapResult = edCommon.recvXML(params);
        }

        String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
        transactionManager.commit(ts);
      } catch (Exception e) {
        transactionManager.rollback(ts);
        throw new RuntimeException(e.getMessage());
      }

      // EDI 테이블에 입력 후 ER_PROCESSING 호출
      Map<String, Object> callParams = new HashMap<String, Object>();
      callParams.put("P_BU_CD", params.get("P_BU_CD"));
      callParams.put("P_EDI_DIV", params.get("P_EDI_DIV"));
      callParams.put("P_DEFINE_NO", params.get("P_DEFINE_NO"));
      callParams.put("P_RECV_DATE", params.get("P_RECV_DATE"));
      callParams.put("P_RECV_NO", params.get("P_RECV_NO"));
      callParams.put("P_PROCESS_CD", "B");
      callParams.put("P_USER_ID", params.get("P_USER_ID"));
      ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
      try {
        mapResult = common.callSP((String)params.get(Consts.PK_QUERY_ID), callParams);

        String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
        transactionManager.commit(ts);
      } catch (Exception e) {
        transactionManager.rollback(ts);
        throw new RuntimeException(e.getMessage());
      }

      // ER_PROCESSING 후 ER_PROCESSING_AFTER 호출
      return callERProcessingAfter(params);
    } else {
      throw new RuntimeException("[" + data_Div + "]정의되지 않은 데이터 처리유형입니다.");
    }
    return mapResult;
  }

  /**
   * SP 실행 후 처리 결과를 Map 형태로 Return
   */
  @SuppressWarnings("rawtypes")
  public Map callERProcessing(String queryId, Map<String, Object> params) throws Exception {

    HashMap<String, Object> mapResult;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      mapResult = common.callSP(queryId, params);

      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      transactionManager.commit(ts);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }

    // ER_PROCESSING 후 ER_PROCESSING_AFTER 호출
    return callERProcessingAfter(params);
  }

  @SuppressWarnings("rawtypes")
  public Map callERProcessingAfter(Map<String, Object> params) throws Exception {

    HashMap<String, Object> mapResult;
    final String ER_PROCESSING_AFTER = "ER_PROCESSING_AFTER";

    // ER_PROCESSING 후 ER_PROCESSING_AFTER 호출
    Map<String, Object> callParams = new HashMap<String, Object>();
    callParams.put("P_BU_CD", params.get("P_BU_CD"));
    callParams.put("P_EDI_DIV", params.get("P_EDI_DIV"));
    callParams.put("P_DEFINE_NO", params.get("P_DEFINE_NO"));
    callParams.put("P_RECV_DATE", params.get("P_RECV_DATE"));
    callParams.put("P_RECV_NO", params.get("P_RECV_NO"));
    callParams.put("P_USER_ID", params.get("P_USER_ID"));

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      mapResult = common.callSP(ER_PROCESSING_AFTER, callParams);

      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      transactionManager.commit(ts);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }

    return mapResult;
  }

  /**
   * SP 실행 후 처리 결과를 Map 형태로 Return
   */
  @SuppressWarnings("rawtypes")
  public Map callDelete(String queryId, Map<String, Object> params) throws Exception {

    HashMap<String, Object> mapResult;

    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      mapResult = common.callSP(queryId, params);

      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      transactionManager.commit(ts);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return mapResult;
  }
}