package nexos.common.ibatis;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFCellStyle;
import org.apache.poi.hssf.usermodel.HSSFDataFormat;
import org.apache.poi.hssf.usermodel.HSSFFont;
import org.apache.poi.hssf.usermodel.HSSFRichTextString;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.hssf.util.HSSFColor;

import nexos.common.Consts;

import com.ibatis.sqlmap.client.event.RowHandler;

/**
 * Class: ExcelRowHandler<br>
 * Description: Excel Download DataSet Handler Class<br>
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
 *  1.0        2012-11-10    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 * </pre>
 */
public class ExcelRowHandler implements RowHandler {

  // private final Logger logger = LoggerFactory.getLogger(ExcelRowHandler.class);

  // private final String EXPORT_TYPE_GRID = "1";
  private final String                   EXPORT_TYPE_DATASET = "2";

  private int                            rowNum;

  private final int                      XLS_MAX_ROW         = 65001;
  private final String                   XLS_FONT_NM         = "굴림체";
  private final short                    XLS_FONT_SIZE       = 9 * 20;
  private final short                    XLS_ROW_HEIGHT      = 18 * 20;
  private final String                   XLS_STRING_FORMAT   = "text";
  private final String                   XLS_NUMBER_FORMAT   = "#,##0";
  private final String                   XLS_DATE_FORMAT     = "yyyy-mm-dd";
  private final String                   XLS_DATETIME_FORMAT = "yyyy-mm-dd hh:mm:ss";

  private final String                   PK_COLUMN_NM        = "P_COLUMN_NM";
  private final String                   PK_COLUMN_TITLE     = "P_COLUMN_TITLE";
  private final String                   PK_COLUMN_TYPE      = "P_COLUMN_TYPE";
  private final String                   PK_COLUMN_WIDTH     = "P_COLUMN_WIDTH";
  private final String                   CT_STRING           = "S";
  private final String                   CT_DATE             = "D";
  private final String                   CT_NUMBER           = "N";

  private final String[ ]                CT_DATE_NM          = {"_DATE", "_DATETIME", "_TIME"};
  private final String[ ]                CT_NUMBER_NM        = {"_QTY", "_BOX", "_EA", "_PRICE", "_AMT", "_ORDER",
    "_LENGTH", "_WIDTH", "_CAPA", "_WEIGHT", "_HEIGHT", "_CASE", "_PLT", "_STAIR", "_PLACE", "_CASE", "_CNT", "_CBM",
    "_RATE", "_RBOX", "_RPLT"                                };

  // 날짜 Formatter
  private SimpleDateFormat               stringDateFormat;
  // 일시 Formatter
  private SimpleDateFormat               stringDatetimeFormat;

  // 컬럼 정보
  private List<Map<String, Object>>      grdColumns;
  private ArrayList<Map<String, Object>> xlsColumns;
  private int                            xlsColumnCount;

  // EXCEL Workbook
  private HSSFWorkbook                   xlsWorkbook;
  // EXCEL Sheet
  private HSSFSheet                      xlsSheet;

  // Data Formatter
  private HSSFDataFormat                 xlsDataFormat;
  // Data Cell Font
  private HSSFFont                       xlsCellFont;
  // Header Font
  private HSSFFont                       xlsHeaderFont;
  // Header Cell Style
  private HSSFCellStyle                  xlsHeaderCell;
  // String Cell Style
  private HSSFCellStyle                  xlsStringCell;
  // Number Cell Style
  private HSSFCellStyle                  xlsNumberCell;
  // Date Cell Style
  private HSSFCellStyle                  xlsDateCell;
  // Datetime Cell Style
  private HSSFCellStyle                  xlsDatetimeCell;

  private int                            xlsRowNum;
  private int                            xlsSheetNum;

  private String                         xlsExportType;
  private String                         xlsTitle;

  public ExcelRowHandler(HSSFWorkbook xlsWorkbook, List<Map<String, Object>> grdColumns, String xlsExportType,
    String xlsTitle) {

    // this.rowNum = 0;

    this.xlsRowNum = 0;
    this.xlsSheetNum = 0;
    this.xlsColumnCount = 0;

    this.xlsWorkbook = xlsWorkbook;
    this.grdColumns = grdColumns;
    this.xlsColumns = new ArrayList<Map<String, Object>>();
    this.xlsExportType = xlsExportType;
    this.xlsTitle = xlsTitle;

    createFormatterAndStyle();
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  @Override
  public void handleRow(Object valueObject) {

    Map rowData = (Map)valueObject;

    writeXLSRow(rowData);
  }

  /**
   * SELECT한 레코드 건별 EXCEL 데이터로 변환 처리
   * 
   * @param rowData
   */
  public void writeXLSRow(Map<String, Object> rowData) {

    // Row가 0이면 Sheet 생성 및 컬럼헤더 정보 생성
    if (xlsRowNum == 0) {
      writeHeaderRow(rowData);
    }

    writeDataRow(rowData);

    // RowCount 증가
    xlsRowNum++;

    // Sheet분할
    if (xlsRowNum == XLS_MAX_ROW) {
      // Row 수 초기화
      xlsRowNum = 0;
    }

    rowNum++;
  }

  /**
   * 데이터 건수 리턴
   * 
   * @return int
   */
  public int getCount() {

    return rowNum;
  }

  /**
   * Header Cell 기록
   * 
   * @param xlsRow
   * @param colIndex
   * @param columnInfo
   */
  private void writeHeaderCell(HSSFRow xlsRow, int colIndex, Map<String, Object> columnInfo) {

    HSSFCell xlsCell = xlsRow.createCell(colIndex);
    xlsCell.setCellStyle(xlsHeaderCell);
    xlsCell.setCellValue(new HSSFRichTextString((String)columnInfo.get(PK_COLUMN_TITLE)));
    xlsSheet.setColumnWidth(colIndex, (Integer)columnInfo.get(PK_COLUMN_WIDTH) * 256);
  }

  /**
   * Header Row 기록
   * 
   * @param rowData
   */
  @SuppressWarnings("rawtypes")
  private void writeHeaderRow(Map<String, Object> rowData) {

    // 컬럼 정보 생성, 한번만
    if (xlsColumnCount == 0) {

      // 그리드의 컬럼정보를 기준으로 Export
      int grdColumnCount = grdColumns.size();
      for (int i = 0; i < grdColumnCount; i++) {
        Map<String, Object> columnInfo = grdColumns.get(i);
        String columnName = (String)columnInfo.get(PK_COLUMN_NM);
        columnInfo.put(PK_COLUMN_TYPE, getColumnType(columnName));
        xlsColumns.add(columnInfo);
      }
      xlsColumnCount = xlsColumns.size();

      // 데이터셋을 Excel로 Export
      // 그리드에 표시하지 않은 컬럼이 있을 경우 추가 함
      if (EXPORT_TYPE_DATASET.equals(xlsExportType)) {
        // DataSet 전체를 Excel로 Export
        Iterator columns = rowData.keySet().iterator();
        while (columns.hasNext()) {
          String columnName = (String)columns.next();
          // 등록한 컬럼인지 체크
          if (existColumn(columnName)) {
            continue;
          }
          Object columnValue = rowData.get(columnName);
          Map<String, Object> columnInfo = new HashMap<String, Object>();
          columnInfo.put(PK_COLUMN_NM, columnName);
          columnInfo.put(PK_COLUMN_TITLE, columnName);
          columnInfo.put(PK_COLUMN_TYPE, getColumnType(columnName, columnValue));
          columnInfo.put(PK_COLUMN_WIDTH, columnName.length() + 5);
          xlsColumns.add(columnInfo);
        }
        xlsColumnCount = xlsColumns.size();
      }
    }

    // Sheet 생성
    xlsSheetNum++;
    xlsSheet = xlsWorkbook.createSheet(xlsTitle + " (" + xlsSheetNum + ")");
    xlsSheet.createFreezePane(0, 1);

    // 헤더 Row 기록
    HSSFRow xlsRow = xlsSheet.createRow(xlsRowNum);
    xlsRow.setHeight(XLS_ROW_HEIGHT);
    for (int i = 0; i < xlsColumnCount; i++) {
      writeHeaderCell(xlsRow, i, xlsColumns.get(i));
    }
    xlsRowNum = 1;
  }

  /**
   * Data Cell 기록
   * 
   * @param xlsRow
   * @param colIndex
   * @param columnInfo
   * @param rowData
   */
  private void writeDataCell(HSSFRow xlsRow, int colIndex, Map<String, Object> columnInfo, Map<String, Object> rowData) {

    HSSFCell xlsCell = xlsRow.createCell(colIndex);
    try {
      String columnType = (String)columnInfo.get(PK_COLUMN_TYPE);
      Object columnValue = rowData.get(columnInfo.get(PK_COLUMN_NM));

      // 날짜 컬럼
      if (CT_DATE.equals(columnType)) {
        xlsCell.setCellStyle(xlsDateCell);
        if (columnValue == null) {
          return;
        }
        try {
          if (columnValue instanceof String) {
            String value = (String)columnValue;
            if (value.length() == 10) {
              xlsCell.setCellValue(stringDateFormat.parse(value));
            } else {
              xlsCell.setCellStyle(xlsDatetimeCell);
              xlsCell.setCellValue(stringDatetimeFormat.parse(value));
            }
          } else {
            xlsCell.setCellValue((Date)columnValue);
          }
        } catch (Exception e) {
          xlsCell.setCellStyle(xlsStringCell);
          xlsCell.setCellValue(new HSSFRichTextString(columnValue.toString()));
        }
        return;
      }

      // 숫자 컬럼
      if (CT_NUMBER.equals(columnType)) {
        xlsCell.setCellStyle(xlsNumberCell);
        if (columnValue == null) {
          return;
        }
        try {
          if (columnValue instanceof String) {
            xlsCell.setCellValue(Double.valueOf((String)columnValue));
          } else {
            xlsCell.setCellValue(((Number)columnValue).doubleValue());
          }
        } catch (Exception e) {
          xlsCell.setCellStyle(xlsStringCell);
          xlsCell.setCellValue(new HSSFRichTextString(columnValue.toString()));
        }
        return;
      }

      // 그외 문자 컬럼
      xlsCell.setCellStyle(xlsStringCell);
      if (columnValue == null) {
        return;
      }
      if (columnValue instanceof String) {
        xlsCell.setCellValue(new HSSFRichTextString((String)columnValue));
      } else {
        xlsCell.setCellValue(new HSSFRichTextString(columnValue.toString()));
      }
    } catch (Exception e) {
      xlsCell.setCellStyle(xlsStringCell);
      xlsCell.setCellValue(new HSSFRichTextString("ERROR"));
    }
  }

  /**
   * Data Row 기록
   * 
   * @param rowData
   */
  private void writeDataRow(Map<String, Object> rowData) {

    // Data Row 기록
    HSSFRow xlsRow = xlsSheet.createRow(xlsRowNum);
    xlsRow.setHeight(XLS_ROW_HEIGHT);
    for (int i = 0; i < xlsColumnCount; i++) {
      writeDataCell(xlsRow, i, xlsColumns.get(i), rowData);
    }
  }

  /**
   * 컬럼명으로 날짜 컬럼인지 체크
   * 
   * @param columnName
   * @return
   */
  private boolean isDateColumn(String columnName) {

    boolean result = false;
    // 날짜 컬럼
    int count = CT_DATE_NM.length;
    for (int i = 0; i < count; i++) {
      if (columnName.endsWith(CT_DATE_NM[i])) {
        result = true;
        break;
      }
    }
    return result;
  }

  /**
   * 컬럼명으로 숫자 컬럼인지 체크
   * 
   * @param columnName
   * @return
   */
  private boolean isNumberColumn(String columnName) {

    boolean result = false;
    // 숫자 컬럼
    int count = CT_NUMBER_NM.length;
    for (int i = 0; i < count; i++) {
      if (columnName.endsWith(CT_NUMBER_NM[i])) {
        result = true;
        break;
      }
    }
    return result;
  }

  /**
   * 컬럼명으로 컬럼타입 리턴
   * 
   * @param columnName
   * @return
   */
  private String getColumnType(String columnName) {

    String result = CT_STRING;

    if (isDateColumn(columnName)) {
      result = CT_DATE;
    } else if (isNumberColumn(columnName)) {
      result = CT_NUMBER;
    }

    return result;
  }

  /**
   * 컬럼 데이터 값으로 컬럼타입 리턴
   * 
   * @param columnName
   * @param columnValue
   * @return
   */
  private String getColumnType(String columnName, Object columnValue) {

    String result = CT_STRING;

    if (columnValue instanceof Date) {
      result = CT_DATE;
    } else if (columnValue instanceof Number) {
      result = CT_NUMBER;
    } else if (isDateColumn(columnName)) {
      result = CT_DATE;
    }

    return result;
  }

  /**
   * 컬럼 정보에 해당 컬럼명이 존재하는지 체크
   * 
   * @param columnName
   * @return
   */
  private boolean existColumn(String columnName) {

    boolean result = false;
    for (int i = 0; i < xlsColumnCount; i++) {
      Map<String, Object> column = xlsColumns.get(i);
      if (columnName.equals(column.get(PK_COLUMN_NM))) {
        result = true;
        break;
      }
    }
    return result;
  }

  /**
   * XLS Formatter, Style, Font 생성
   */
  private void createFormatterAndStyle() {

    stringDateFormat = new SimpleDateFormat(Consts.DATE_FORMAT);
    stringDatetimeFormat = new SimpleDateFormat(Consts.DATETIME_FORMAT);

    xlsDataFormat = xlsWorkbook.createDataFormat();
    // Header Font
    xlsHeaderFont = xlsWorkbook.createFont();
    xlsHeaderFont.setFontName(XLS_FONT_NM);
    xlsHeaderFont.setBoldweight(HSSFFont.BOLDWEIGHT_BOLD);
    xlsHeaderFont.setFontHeight(XLS_FONT_SIZE);
    xlsHeaderFont.setColor(HSSFColor.DARK_BLUE.index);

    // Header Cell Style
    xlsHeaderCell = xlsWorkbook.createCellStyle();
    xlsHeaderCell.setBorderLeft(HSSFCellStyle.BORDER_THIN);
    xlsHeaderCell.setBorderRight(HSSFCellStyle.BORDER_THIN);
    xlsHeaderCell.setBorderTop(HSSFCellStyle.BORDER_THIN);
    xlsHeaderCell.setBorderBottom(HSSFCellStyle.BORDER_THIN);
    xlsHeaderCell.setLeftBorderColor(HSSFColor.BLACK.index);
    xlsHeaderCell.setRightBorderColor(HSSFColor.BLACK.index);
    xlsHeaderCell.setTopBorderColor(HSSFColor.BLACK.index);
    xlsHeaderCell.setBottomBorderColor(HSSFColor.BLACK.index);
    xlsHeaderCell.setFillForegroundColor(HSSFColor.PALE_BLUE.index);
    xlsHeaderCell.setFillPattern(HSSFCellStyle.SOLID_FOREGROUND);
    xlsHeaderCell.setFont(xlsHeaderFont);
    xlsHeaderCell.setAlignment(HSSFCellStyle.ALIGN_CENTER);
    xlsHeaderCell.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);
    xlsHeaderCell.setDataFormat(HSSFDataFormat.getBuiltinFormat(XLS_STRING_FORMAT));

    // Data Cell Font
    xlsCellFont = xlsWorkbook.createFont();
    xlsCellFont.setFontName(XLS_FONT_NM);
    xlsCellFont.setFontHeight(XLS_FONT_SIZE);

    // String Cell Style
    xlsStringCell = xlsWorkbook.createCellStyle();
    xlsStringCell.setBorderLeft(HSSFCellStyle.BORDER_THIN);
    xlsStringCell.setBorderRight(HSSFCellStyle.BORDER_THIN);
    xlsStringCell.setBorderTop(HSSFCellStyle.BORDER_THIN);
    xlsStringCell.setBorderBottom(HSSFCellStyle.BORDER_THIN);
    xlsStringCell.setLeftBorderColor(HSSFColor.BLACK.index);
    xlsStringCell.setRightBorderColor(HSSFColor.BLACK.index);
    xlsStringCell.setTopBorderColor(HSSFColor.BLACK.index);
    xlsStringCell.setBottomBorderColor(HSSFColor.BLACK.index);
    xlsStringCell.setFont(xlsCellFont);
    xlsStringCell.setAlignment(HSSFCellStyle.ALIGN_LEFT);
    xlsStringCell.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);
    xlsStringCell.setDataFormat(HSSFDataFormat.getBuiltinFormat(XLS_STRING_FORMAT));

    // Number Cell Style
    xlsNumberCell = xlsWorkbook.createCellStyle();
    xlsNumberCell.setBorderLeft(HSSFCellStyle.BORDER_THIN);
    xlsNumberCell.setBorderRight(HSSFCellStyle.BORDER_THIN);
    xlsNumberCell.setBorderTop(HSSFCellStyle.BORDER_THIN);
    xlsNumberCell.setBorderBottom(HSSFCellStyle.BORDER_THIN);
    xlsNumberCell.setLeftBorderColor(HSSFColor.BLACK.index);
    xlsNumberCell.setRightBorderColor(HSSFColor.BLACK.index);
    xlsNumberCell.setTopBorderColor(HSSFColor.BLACK.index);
    xlsNumberCell.setBottomBorderColor(HSSFColor.BLACK.index);
    xlsNumberCell.setFont(xlsCellFont);
    xlsNumberCell.setAlignment(HSSFCellStyle.ALIGN_RIGHT);
    xlsNumberCell.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);
    xlsNumberCell.setDataFormat(HSSFDataFormat.getBuiltinFormat(XLS_NUMBER_FORMAT));

    // Date Cell Style
    xlsDateCell = xlsWorkbook.createCellStyle();
    xlsDateCell.setBorderLeft(HSSFCellStyle.BORDER_THIN);
    xlsDateCell.setBorderRight(HSSFCellStyle.BORDER_THIN);
    xlsDateCell.setBorderTop(HSSFCellStyle.BORDER_THIN);
    xlsDateCell.setBorderBottom(HSSFCellStyle.BORDER_THIN);
    xlsDateCell.setLeftBorderColor(HSSFColor.BLACK.index);
    xlsDateCell.setRightBorderColor(HSSFColor.BLACK.index);
    xlsDateCell.setTopBorderColor(HSSFColor.BLACK.index);
    xlsDateCell.setBottomBorderColor(HSSFColor.BLACK.index);
    xlsDateCell.setFont(xlsCellFont);
    xlsDateCell.setAlignment(HSSFCellStyle.ALIGN_CENTER);
    xlsDateCell.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);
    xlsDateCell.setDataFormat(xlsDataFormat.getFormat(XLS_DATE_FORMAT));

    // Datetime Cell Style
    xlsDatetimeCell = xlsWorkbook.createCellStyle();
    xlsDatetimeCell.setBorderLeft(HSSFCellStyle.BORDER_THIN);
    xlsDatetimeCell.setBorderRight(HSSFCellStyle.BORDER_THIN);
    xlsDatetimeCell.setBorderTop(HSSFCellStyle.BORDER_THIN);
    xlsDatetimeCell.setBorderBottom(HSSFCellStyle.BORDER_THIN);
    xlsDatetimeCell.setLeftBorderColor(HSSFColor.BLACK.index);
    xlsDatetimeCell.setRightBorderColor(HSSFColor.BLACK.index);
    xlsDatetimeCell.setTopBorderColor(HSSFColor.BLACK.index);
    xlsDatetimeCell.setBottomBorderColor(HSSFColor.BLACK.index);
    xlsDatetimeCell.setFont(xlsCellFont);
    xlsDatetimeCell.setAlignment(HSSFCellStyle.ALIGN_CENTER);
    xlsDatetimeCell.setVerticalAlignment(HSSFCellStyle.VERTICAL_CENTER);
    xlsDatetimeCell.setDataFormat(xlsDataFormat.getFormat(XLS_DATETIME_FORMAT));
  }
}
