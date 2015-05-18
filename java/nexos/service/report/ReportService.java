package nexos.service.report;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;
import javax.servlet.ServletOutputStream;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

import com.lowagie.text.pdf.PdfCopyFields;
import com.lowagie.text.pdf.PdfReader;
import com.lowagie.text.pdf.PdfStamper;
import com.lowagie.text.pdf.PdfWriter;

import nexos.common.Consts;
import nexos.common.Util;

/**
 * Class: ReportService<br>
 * Description: Report 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("REPORT")
public class ReportService {

  @Resource
  private ReportDAO                  dao;

  @Resource
  private PlatformTransactionManager transactionManager;

  @Resource
  private Properties                 globalProps;

  /**
   * PDF 문서를 생성하여 Response에 기록
   * 
   * @param params
   * @return
   */
  @SuppressWarnings("unchecked")
  public HashMap<String, Object> getReport(Map<String, Object> params) {

    HashMap<String, Object> result = new HashMap<String, Object>();

    ServletOutputStream servletOutput = null;

    PdfWriter pdfWriter = null;
    StringBuffer pdfJs = null;
    ByteArrayOutputStream pdfOutput = null;
    InputStream pdfInput = null;
    PdfReader pdfReader = null;
    PdfStamper pdfStamper = null;
    try {
      pdfOutput = new ByteArrayOutputStream();
      params.put("P_REPORT_OUTPUT", pdfOutput);
      params.put("P_EMPTY_REPORT_FILE", getProperty("emptyReportFile"));
      params.put("P_REPORT_ROOT", getProperty("reportRoot"));
      params.put("P_WEB_ROOT", getProperty("webapp.root"));
      params.put("P_BI_CUST", getProperty("biCustImage"));
      params.put("P_BI_BU", getProperty("biBuImage"));
      params.put("P_BI_BRAND", getProperty("biBrandImage"));

      String checkedValue = (String)params.get("P_CHECKED_VALUE");
      if (Util.isNull(checkedValue)) {
        result = (HashMap<String, Object>)dao.getReport(params);
      } else {
        TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
        try {
          result = (HashMap<String, Object>)dao.getReport(params);
          transactionManager.commit(ts);
        } catch (Exception e) {
          transactionManager.rollback(ts);
          throw new RuntimeException(e.getMessage());
        }
      }
      String oMsg = (String)result.get(Consts.PK_RESULT_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }

      // 출력매수에 대한 처리
      int printCopy = Util.getNullZeroInt((String)params.get("P_PRINT_COPY"));
      if (printCopy == 0) {
        printCopy = 1;
      }
      if (printCopy > 1) {
        PdfCopyFields pdfPrintCopy = new PdfCopyFields(pdfOutput);
        for (int i = 0; i < printCopy; i++) {
          pdfPrintCopy.addDocument(new PdfReader(outputToInputStream(pdfOutput)));
        }
        pdfPrintCopy.close();
      }

      pdfInput = outputToInputStream(pdfOutput);
      pdfReader = new PdfReader(pdfInput);

      servletOutput = (ServletOutputStream)params.get("P_SERVLET_OUTPUT");
      pdfStamper = new PdfStamper(pdfReader, servletOutput);
      pdfWriter = pdfStamper.getWriter();

      // 실제 출력할 프린터명 가져오기
      String printerNm = getPrinterName(params);

      String silentPrintYn = (String)params.get("P_SILENT_PRINT_YN");
      // 자동 출력일 경우
      if (Consts.YES.equals(silentPrintYn)) {
        pdfWriter.setViewerPreferences(PdfWriter.HideMenubar | PdfWriter.HideToolbar | PdfWriter.HideWindowUI);

        pdfJs = new StringBuffer();
        pdfJs.append("var param=this.getPrintParams();\r");
        // 프린터명이 지정되지 않으면 기본 프린터로 출력
        if (!Util.isNull(printerNm)) {
          pdfJs.append("param.printerName=\"").append(printerNm).append("\";\r");
        }
        pdfJs.append("param.interactive=param.constants.interactionLevel.silent;\r");
        pdfJs.append("param.pageHandling=param.constants.handling.shrink;\r");
        pdfJs.append("this.print(param);\r");
        pdfJs.append("this.closeDoc();");
        pdfWriter.addJavaScript(pdfJs.toString(), false);

        // 출혁 후 실행
        // pdfJs.setLength(0);
        // pdfJs.append("this.submitForm(\"");
        // pdfJs.append((String)params.get("P_CONTEXT_URL"));
        // pdfJs.append("/nexos/html/report/silentprintcomplete.html\");");
        //
        // pdfWriter.setAdditionalAction(PdfWriter.DID_PRINT, PdfAction.javaScript(pdfJs.toString(), pdfWriter));
      }

      servletOutput.flush();
      result.put(Consts.PK_RESULT_MSG, Consts.OK);
    } catch (Exception e) {
      result.put(Consts.PK_RESULT_MSG, e.getMessage());
    } finally {
      if (pdfInput != null) {
        try {
          pdfInput.close();
        } catch (Exception e) {
        }
        pdfInput = null;
      }
      if (pdfOutput != null) {
        try {
          pdfOutput.close();
        } catch (Exception e) {
        }
        pdfOutput = null;
      }
      if (pdfReader != null) {
        pdfReader.close();
        pdfReader = null;
      }
      pdfWriter = null;
      try {
        if (pdfStamper != null) {
          pdfStamper.close();
          pdfStamper = null;
        }
      } catch (Exception e) {
      }
    }
    return result;
  }

  /**
   * System Property 값 리턴
   * 
   * @param propertyName
   * @return
   */
  public String getProperty(String propertyName) {

    return globalProps.getProperty(propertyName);
  }

  /**
   * ByteArrayOutputStream를 InputStream으로 변환하는 Method.
   * 
   * @param source
   * @return
   * @throws IOException
   */
  private InputStream outputToInputStream(ByteArrayOutputStream source) {
    return new ByteArrayInputStream(source.toByteArray());
  }

  /**
   * 출력할 프린터명 리턴
   * 
   * @param params
   * @return
   */
  private String getPrinterName(Map<String, Object> params) {

    final String PK_PRINT_LI_BILL = "P_PRINT_LI_BILL";
    final String PK_PRINT_LO_BILL = "P_PRINT_LO_BILL";
    final String PK_PRINT_RI_BILL = "P_PRINT_RI_BILL";
    final String PK_PRINT_RO_BILL = "P_PRINT_RO_BILL";
    final String PK_PRINT_LO_BOX = "P_PRINT_LO_BOX";
    final String PK_PRINT_WB_NO = "P_PRINT_WB_NO";
    final String PK_PRINT_CARD = "P_PRINT_CARD";
    final String PK_PRINT_SHIP_ID = "P_PRINT_SHIP_ID";
    final String PK_PRINT_LOCATION_ID = "P_PRINT_LOCATION_ID";
    final String PK_PRINT_INBOUND_SEQ = "P_PRINT_INBOUND_SEQ";

    final String DV_PRINT_LI_BILL = "PRINT_LI_BILL";
    final String DV_PRINT_LO_BILL = "PRINT_LO_BILL";
    final String DV_PRINT_RI_BILL = "PRINT_RI_BILL";
    final String DV_PRINT_RO_BILL = "PRINT_RO_BILL";
    final String DV_PRINT_LO_BOX = "PRINT_LO_BOX";
    final String DV_PRINT_WB_NO = "PRINT_WB_NO";
    final String DV_PRINT_CARD = "PRINT_CARD";
    final String DV_PRINT_SHIP_ID = "PRINT_SHIP_ID";
    final String DV_PRINT_LOCATION_ID = "PRINT_LOCATION_ID";
    final String DV_PRINT_INBOUND_SEQ = "PRINT_INBOUND_SEQ";

    String PRINTER_NM = (String)params.get("P_PRINTER_NM");
    String SILENT_PRINTER_NM = (String)params.get("P_SILENT_PRINTER_NM");
    if (Util.isNull(SILENT_PRINTER_NM)) {
      if (DV_PRINT_LI_BILL.equals(PRINTER_NM)) {
        SILENT_PRINTER_NM = (String)params.get(PK_PRINT_LI_BILL);
      } else if (DV_PRINT_LO_BILL.equals(PRINTER_NM)) {
        SILENT_PRINTER_NM = (String)params.get(PK_PRINT_LO_BILL);
      } else if (DV_PRINT_RI_BILL.equals(PRINTER_NM)) {
        SILENT_PRINTER_NM = (String)params.get(PK_PRINT_RI_BILL);
      } else if (DV_PRINT_RO_BILL.equals(PRINTER_NM)) {
        SILENT_PRINTER_NM = (String)params.get(PK_PRINT_RO_BILL);
      } else if (DV_PRINT_LO_BOX.equals(PRINTER_NM)) {
        SILENT_PRINTER_NM = (String)params.get(PK_PRINT_LO_BOX);
      } else if (DV_PRINT_WB_NO.equals(PRINTER_NM)) {
        SILENT_PRINTER_NM = (String)params.get(PK_PRINT_WB_NO);
      } else if (DV_PRINT_CARD.equals(PRINTER_NM)) {
        SILENT_PRINTER_NM = (String)params.get(PK_PRINT_CARD);
      } else if (DV_PRINT_SHIP_ID.equals(PRINTER_NM)) {
        SILENT_PRINTER_NM = (String)params.get(PK_PRINT_SHIP_ID);
      } else if (DV_PRINT_LOCATION_ID.equals(PRINTER_NM)) {
        SILENT_PRINTER_NM = (String)params.get(PK_PRINT_LOCATION_ID);
      } else if (DV_PRINT_INBOUND_SEQ.equals(PRINTER_NM)) {
        SILENT_PRINTER_NM = (String)params.get(PK_PRINT_INBOUND_SEQ);
      }
    }

    return Util.replaceAll(SILENT_PRINTER_NM, "\\", "\\\\");
  }

}
