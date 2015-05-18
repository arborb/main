package nexos.service.ed;

import java.util.HashMap;
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
 * Class: ED09020EService<br>
 * Description: [송신]재고가용재고(ED09020E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("ED09020E")
public class ED09020EService {

  // private final Logger logger = LoggerFactory.getLogger(ED09020EService.class);

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

  public HashMap<String, Object> sendFileDownload(Map<String, Object> params) throws Exception {

    HashMap<String, Object> mapResult = null;

    // final String DATA_DIV_DBLINK = "01";
    final String DATA_DIV_EXCEL = "02";
    final String DATA_DIV_TEXT = "03";
    final String DATA_DIV_XML = "04";

    String data_Div = (String)params.get("P_DATA_DIV");

    // EXCEL, TEXT, XML
    if (DATA_DIV_EXCEL.equals(data_Div) || DATA_DIV_TEXT.equals(data_Div) || DATA_DIV_XML.equals(data_Div)) {
      try {
        if (DATA_DIV_EXCEL.equals(data_Div)) {
          mapResult = edCommon.sendExcel(params);
        } else if (DATA_DIV_TEXT.equals(data_Div)) {
          mapResult = edCommon.sendText(params);
        } else if (DATA_DIV_XML.equals(data_Div)) {
          mapResult = edCommon.sendXML(params);
        }

        String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
      } catch (Exception e) {
        throw new RuntimeException(e.getMessage());
      }
    }
    return mapResult;
  }

  /**
   * SP 실행 후 처리 결과를 Map 형태로 Return
   */
  @SuppressWarnings("rawtypes")
  public Map callESProcessing(String queryId, Map<String, Object> params) throws Exception {

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