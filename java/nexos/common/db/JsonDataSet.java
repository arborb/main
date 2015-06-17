package nexos.common.db;

import java.util.ArrayList;
import java.util.Map;

import nexos.common.Consts;

/**
 * Class: JsonDataSet<br>
 * Description: Compact Json DataSet Class, 대용량 데이터 처리를 위해 생성한 Custom Json DataSet<br>
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
public class JsonDataSet {

  public static String             ARR_PREFIX        = "[";
  public static String             ARR_SUFFIX        = "]";
  public static String             OBJ_PREFIX        = "{";
  public static String             OBJ_SUFFIX        = "}";
  public static String             OBJ_QUOTATION     = "\"";
  public static String             NV_SEPARATOR      = ":";
  public static String             DATA_SEPARATOR    = ",";
  public static String             SUB_OBJ_QUOTATION = "\\\"";
  private final int                COL_OFFSET        = 2;

  private ArrayList<String>        alColumns;
  private ArrayList<StringBuilder> alData;

  public JsonDataSet() {

    this.alColumns = new ArrayList<String>();
    this.alData = new ArrayList<StringBuilder>();
  }

  public ArrayList<String> getColumns() {

    return alColumns;
  }

  /**
   * SELECT한 데이터뎃의 컬럼 수 리턴
   * 
   * @return
   */
  public int getDataColumnCount() {

    int result = alColumns.size() - COL_OFFSET;
    if (result < 0) {
      result = 0;
    };

    return result;
  }

  /**
   * SELECT한 데이터셋에서 컬럼명 정보 기록, ID, CRUD 추가 기록
   * 
   * @param rowData
   */
  public void setColumns(Map<String, Object> rowData) {

    try {
      for (String columnName : rowData.keySet()) {
        alColumns.add(columnName);
      }

      // 추가 컬럼
      alColumns.add(Consts.DK_ID);
      alColumns.add(Consts.DK_CRUD);
    } catch (Exception e) {
      throw new RuntimeException("컬럼 정보 처리 중 오류가 발생했습니다.\n" + e.getMessage());
    }
  }

  /**
   * Json 데이터 추가, Array 형태 [ ]
   * 
   * @param sbData
   */
  public void appendData(StringBuilder sbData) {

    if (sbData == null) {
      return;
    }
    alData.add(sbData);
  }

  /**
   * 컬럼 정보를 Json Object 형태로 리턴
   * 
   * @return
   */
  private String getJsonColumns() {

    StringBuilder sbResult = new StringBuilder();
    for (int col = 0, colCount = alColumns.size(); col < colCount; col++) {
      sbResult.append(JsonDataSet.SUB_OBJ_QUOTATION).append(col).append(JsonDataSet.SUB_OBJ_QUOTATION)
        .append(JsonDataSet.NV_SEPARATOR).append(JsonDataSet.SUB_OBJ_QUOTATION).append(alColumns.get(col))
        .append(JsonDataSet.SUB_OBJ_QUOTATION).append(JsonDataSet.DATA_SEPARATOR);
    }
    sbResult.setLength(sbResult.length() - 1);
    return JsonDataSet.OBJ_PREFIX + sbResult.toString() + JsonDataSet.OBJ_SUFFIX;
  }

  /**
   * 처리결과에 대한 코드 값을 버퍼에 기록
   * 
   * @param sbBuffer
   * @param resultCode
   */
  private void setResultCode(StringBuilder sbBuffer, int resultCode) {
    // DK_RESULT_CD:resultCode
    sbBuffer.append(JsonDataSet.OBJ_QUOTATION).append(Consts.DK_RESULT_CD).append(JsonDataSet.OBJ_QUOTATION)
      .append(JsonDataSet.NV_SEPARATOR).append(JsonDataSet.OBJ_QUOTATION).append(resultCode)
      .append(JsonDataSet.OBJ_QUOTATION).append(JsonDataSet.DATA_SEPARATOR);
  }

  /**
   * 처리결과에 대한 리턴 결과 데이터의 타입에 값을 버퍼에 기록
   * 
   * @param sbBuffer
   * @param resultType
   */
  private void setResultType(StringBuilder sbBuffer, String resultType) {
    // DK_RESULT_TYPE:resultType
    sbBuffer.append(JsonDataSet.OBJ_QUOTATION).append(Consts.DK_RESULT_TYPE).append(JsonDataSet.OBJ_QUOTATION)
      .append(JsonDataSet.NV_SEPARATOR).append(JsonDataSet.OBJ_QUOTATION).append(resultType)
      .append(JsonDataSet.OBJ_QUOTATION).append(JsonDataSet.DATA_SEPARATOR);
  }

  /**
   * 리턴 결과 데이터의 컬럼 정보를 버퍼에 기록
   * 
   * @param sbBuffer
   * @param resultColumn
   */
  private void setResultColumn(StringBuilder sbBuffer, String resultColumn) {
    // DK_RESULT_COLUMN:resultColumn
    sbBuffer.append(JsonDataSet.OBJ_QUOTATION).append(Consts.DK_RESULT_COLUMN).append(JsonDataSet.OBJ_QUOTATION)
      .append(JsonDataSet.NV_SEPARATOR).append(JsonDataSet.OBJ_QUOTATION).append(resultColumn)
      .append(JsonDataSet.OBJ_QUOTATION).append(JsonDataSet.DATA_SEPARATOR);
  }

  /**
   * 리턴 결과 데이터의 분할된 수를 버퍼에 기록
   * 
   * @param sbBuffer
   * @param resultDataCount
   */
  private void setResultDataCount(StringBuilder sbBuffer, int resultDataCount) {
    // DK_RESULT_DATA_CNT:resultDataCount
    sbBuffer.append(JsonDataSet.OBJ_QUOTATION).append(Consts.DK_RESULT_DATA_CNT).append(JsonDataSet.OBJ_QUOTATION)
      .append(JsonDataSet.NV_SEPARATOR).append(resultDataCount).append(JsonDataSet.DATA_SEPARATOR);
  }

  /**
   * 빈 데이터셋에 대한 결과 데이터 리턴
   * 
   * @return
   */
  private String getEmptyDataSet() {

    StringBuilder sbResult = new StringBuilder();
    // {
    sbResult.append(JsonDataSet.OBJ_PREFIX);
    setResultCode(sbResult, Consts.DV_RESULT_CD_OK);
    setResultType(sbResult, Consts.DV_RESULT_TYPE_LIST);
    // DK_RESULT_DATA:[]
    sbResult.append(JsonDataSet.OBJ_QUOTATION).append(Consts.DK_RESULT_DATA).append(JsonDataSet.OBJ_QUOTATION)
      .append(JsonDataSet.NV_SEPARATOR).append(JsonDataSet.OBJ_QUOTATION).append(JsonDataSet.ARR_PREFIX)
      .append(JsonDataSet.ARR_SUFFIX).append(JsonDataSet.OBJ_QUOTATION);
    // }
    sbResult.append(JsonDataSet.OBJ_SUFFIX);

    return sbResult.toString();
  }

  /**
   * 단일 데이터에 대한 결과 데이터 리턴
   * 
   * @return
   */
  private String getSingleDataSet() {

    StringBuilder sbResult = new StringBuilder();
    // {
    sbResult.append(JsonDataSet.OBJ_PREFIX);
    setResultCode(sbResult, Consts.DV_RESULT_CD_OK);
    setResultType(sbResult, Consts.DV_RESULT_TYPE_SLIST);
    setResultColumn(sbResult, getJsonColumns());
    alColumns.clear();
    // DK_RESULT_DATA:[{...},{...}]
    sbResult.append(JsonDataSet.OBJ_QUOTATION).append(Consts.DK_RESULT_DATA).append(JsonDataSet.OBJ_QUOTATION)
      .append(JsonDataSet.NV_SEPARATOR).append(JsonDataSet.OBJ_QUOTATION).append(JsonDataSet.ARR_PREFIX)
      .append(alData.get(0)).append(JsonDataSet.ARR_SUFFIX).append(JsonDataSet.OBJ_QUOTATION);
    alData.clear();
    // }
    sbResult.append(JsonDataSet.OBJ_SUFFIX);

    return sbResult.toString();
  }

  /**
   * 분할 데이터에 대한 결과 데이터 리턴
   * 
   * @return
   */
  private String getMultipleDataSet(int dataCount) {

    StringBuilder sbResult = new StringBuilder();
    // {
    sbResult.append(JsonDataSet.OBJ_PREFIX);
    setResultCode(sbResult, Consts.DV_RESULT_CD_OK);
    setResultType(sbResult, Consts.DV_RESULT_TYPE_MLIST);
    setResultColumn(sbResult, getJsonColumns());
    alColumns.clear();
    setResultDataCount(sbResult, dataCount);
    // DK_RESULT_DATA...:[]
    while (dataCount > 0) {
      dataCount--;
      StringBuilder sbData = alData.get(dataCount);
      sbResult.append(JsonDataSet.OBJ_QUOTATION).append(Consts.DK_RESULT_DATA + (dataCount + 1))
        .append(JsonDataSet.OBJ_QUOTATION).append(JsonDataSet.NV_SEPARATOR).append(JsonDataSet.OBJ_QUOTATION)
        .append(JsonDataSet.ARR_PREFIX).append(sbData).append(JsonDataSet.ARR_SUFFIX).append(JsonDataSet.OBJ_QUOTATION)
        .append(JsonDataSet.DATA_SEPARATOR);
      sbData.setLength(0);
      sbData.trimToSize();
      alData.remove(dataCount);
    }
    sbResult.setLength(sbResult.length() - 1);
    // }
    sbResult.append(JsonDataSet.OBJ_SUFFIX);

    return sbResult.toString();
  }

  /**
   * SELECT한 결과에 대한 최종 데이터를 Json 문자열로 리턴
   * 
   * @return
   */
  public String getDataSet() {

    int dataCount = alData.size();
    if (dataCount == 0) {
      return getEmptyDataSet();
    } else {
      if (dataCount == 1) {
        return getSingleDataSet();
      } else {
        return getMultipleDataSet(dataCount);
      }
    }
  }

}
