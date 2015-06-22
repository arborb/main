package nexos.service.report;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.InputStream;
import java.sql.Connection;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;

import javax.annotation.Resource;
import javax.servlet.ServletContext;

import net.sf.jasperreports.engine.JREmptyDataSource;
import net.sf.jasperreports.engine.JasperRunManager;
import nexos.common.Consts;
import nexos.common.Util;
import nexos.service.common.WCDAO;

import org.springframework.jdbc.datasource.DataSourceUtils;
import org.springframework.orm.ibatis.SqlMapClientTemplate;
import org.springframework.stereotype.Repository;

import com.penta.scpdb.ScpDbAgent;

/**
 * Class: ReportDAOImpl<br>
 * Description: Report DAO (Data Access Object)<br>
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
@Repository("ReportDAO")
public class ReportDAOImpl implements ReportDAO {

  @Resource
  private WCDAO                dao;

  @Resource
  private SqlMapClientTemplate sqlMapClientTemplate;

  // private final Logger logger = LoggerFactory.getLogger(ReportDAOImpl.class);

  @SuppressWarnings({"rawtypes", "unchecked"})
  @Override
  public Map getReport(Map<String, Object> params) {

    Map<String, Object> result = new HashMap<String, Object>();

    ReportDataSource rptDS = null;
    InputStream rptInput = null;
    try {
      // 파라메터 가져오기
      ByteArrayOutputStream pdfOutput = (ByteArrayOutputStream)params.get("P_REPORT_OUTPUT");
      ServletContext sevletContext = (ServletContext)params.get("P_SERVLET_CONTEXT");

      String REPORT_ROOT = (String)params.get("P_REPORT_ROOT");
      String REPORT_EMPTY_FILE_NAME = (String)params.get("P_EMPTY_REPORT_FILE");

      String WEB_ROOT_PATH = (String)params.get("P_WEB_ROOT");
      String BI_CUST_PATH = (String)params.get("P_BI_CUST");
      String BI_BU_PATH = (String)params.get("P_BI_BU");
      String BI_BRAND_PATH = (String)params.get("P_BI_BRAND");

      String REPORT_FILE_NM = (String)params.get("P_REPORT_FILE");
      String REPORT_FILE_FULLNM;
      if (Util.isNull(REPORT_FILE_NM)) {
        REPORT_FILE_NM = REPORT_EMPTY_FILE_NAME;
        REPORT_FILE_FULLNM = REPORT_ROOT + REPORT_FILE_NM;
      } else {
        REPORT_FILE_FULLNM = REPORT_ROOT + REPORT_FILE_NM + ".jasper";
      }
      if (!"/".equals(File.separator)) {
        REPORT_FILE_FULLNM = REPORT_FILE_FULLNM.replaceAll("/", Matcher.quoteReplacement(File.separator));
      }

      rptInput = sevletContext.getResourceAsStream(REPORT_FILE_FULLNM);
      if (rptInput == null) {
        throw new RuntimeException("Report 파일이 서버에 존재하지 않습니다.");
      }

      String queryId = (String)params.get(Consts.PK_QUERY_ID);
      HashMap<String, Object> queryParams = (HashMap<String, Object>)params.get(Consts.PK_QUERY_PARAMS);
      String checkedValue = (String)params.get("P_CHECKED_VALUE");
      String internalQueryYn = (String)params.get("P_INTERNAL_QUERY_YN");

      // 서버 현재일시
      Map<String, Object> mapSysDate = dao.getSysDate();
      String oMsg = (String)mapSysDate.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        result.put(Consts.PK_RESULT_MSG, oMsg);
        return result;
      }
      
      //Scp
      ScpDbAgent agt = new ScpDbAgent();
      String iniFilePath = "/opt/SCP/scpdb_agent_unix.ini"; 
      String outKey = agt.ScpExportKey( iniFilePath, "KEY1", "AccountName" );
      
      
      System.out.println("[java] 11111111111111111111111111111111111111ScpExportKey : " + outKey);
        
      
      // Report 파라메터 세팅
      queryParams.put("P_SYSDATE", mapSysDate.get("SYS_DATETIME"));
      queryParams.put(Consts.PK_USER_ID, params.get(Consts.PK_USER_ID));
      queryParams.put("P_USER_NM", params.get("P_USER_NM"));
      queryParams.put("P_SUBREPORT_DIR", WEB_ROOT_PATH + REPORT_ROOT);
      queryParams.put("P_BI_CUST_DIR", WEB_ROOT_PATH + BI_CUST_PATH);
      queryParams.put("P_BI_BU_DIR", WEB_ROOT_PATH + BI_BU_PATH);
      queryParams.put("P_BI_BRAND_DIR", WEB_ROOT_PATH + BI_BRAND_PATH);
      queryParams.put("P_SCPKEY", outKey);

      // Package의 Query로 출력
      if (Consts.NO.equals(internalQueryYn)) {
        if (!Util.isNull(queryId)) {
          if (!Util.isNull(checkedValue)) {
            // 선택 값 CTCHECKVALUE 테이블에 INSERT
            Map<String, Object> checkedParams = new HashMap<String, Object>();
            checkedParams.put(Consts.PK_CHECKED_VALUE, checkedValue);
            checkedParams.put("OTHER_TEMPO", params.get("P_OTHER_TEMPO"));
            dao.insertCheckedValue(checkedParams);
          }

          // 데이터 JRDataSource로 가져오기
          rptDS = new ReportDataSource(sqlMapClientTemplate, queryId, queryParams);

          // 조회한 내역이 존재하지 않는다면 에러
          if ((rptDS == null) || rptDS.size() == 0) {
            throw new RuntimeException("출력할 데이터가 존재하지 않습니다.");
          }
          JasperRunManager.runReportToPdfStream(rptInput, pdfOutput, queryParams, rptDS);
        } else {
          JasperRunManager.runReportToPdfStream(rptInput, pdfOutput, queryParams, new JREmptyDataSource());
        }
      } else {
        // Report의 Query로 출력
        Connection conn = null;
        if (!Util.isNull(checkedValue)) {
          // 선택 값 CTCHECKVALUE 테이블에 INSERT
          Map<String, Object> checkedParams = new HashMap<String, Object>();
          checkedParams.put(Consts.PK_CHECKED_VALUE, checkedValue);
          checkedParams.put("P_OTHER_TEMPO", params.get("P_OTHER_TEMPO"));
          dao.insertCheckedValue(checkedParams);
        }
        try {
          conn = DataSourceUtils.getConnection(sqlMapClientTemplate.getDataSource());
          JasperRunManager.runReportToPdfStream(rptInput, pdfOutput, queryParams, conn);
        } finally {
          DataSourceUtils.releaseConnection(conn, sqlMapClientTemplate.getDataSource());
        }
      }
      pdfOutput.flush();
      result.put(Consts.PK_RESULT_MSG, Consts.OK);
    } catch (Exception e) {
      result.put(Consts.PK_RESULT_MSG, e.getMessage());
    } finally {
      if (rptInput != null) {
        try {
          rptInput.close();
        } catch (Exception e) {
        }
        rptInput = null;
      }
    }

    return result;
  }
}
