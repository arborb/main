package nexos.common.ibatis;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import nexos.common.Consts;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ibatis.sqlmap.client.event.RowHandler;

/**
 * Class: JsonRowHandler<br>
 * Description: Compact Json DataSet Handler Class, 대용량 데이터 처리를 위해 생성한 ibatis RowHandler<br>
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
public class JsonRowHandler implements RowHandler {

  private final int               PAGE_SIZE = 10000;
  private int                     rowNum;

  private JsonDataSet             dsJson;
  private HashMap<String, Object> hmWriter;
  private ObjectMapper            omWriter;
  private StringBuilder           sbWriter;
  private ArrayList<String>       alColumns;
  private int                     colCount;

  public JsonRowHandler() {

    this.dsJson = new JsonDataSet();
    this.hmWriter = new HashMap<String, Object>();
    this.omWriter = new ObjectMapper();
    this.sbWriter = new StringBuilder();

    this.rowNum = 0;
    this.alColumns = null;
    this.colCount = 0;
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  @Override
  public void handleRow(Object valueObject) {

    Map rowData = (Map)valueObject;

    if (rowNum == 0) {
      dsJson.setColumns(rowData);
      alColumns = dsJson.getColumns();
      colCount = dsJson.getDataColumnCount();
    }

    addRow(rowData);
  }

  /**
   * SELECT한 레코드 건별 Json 문자열로 변환 처리
   * 
   * @param rowData
   */
  public void addRow(Map<String, Object> rowData) {

    try {
      // hmWriter.clear();
      for (int col = 0; col < colCount; col++) {
        hmWriter.put("" + col, rowData.get(alColumns.get(col)));
      }
      hmWriter.put("" + colCount, Consts.DV_ID_PREFIX + rowNum);
      hmWriter.put("" + (colCount + 1), Consts.DV_CRUD_R);
      byte[ ] mapJsonBytes = omWriter.writeValueAsBytes(omWriter.writeValueAsString(hmWriter));
      sbWriter.append(new String(mapJsonBytes, 1, mapJsonBytes.length - 2, Consts.CHARSET)).append(
        JsonDataSet.DATA_SEPARATOR);
    } catch (Exception e) {
      throw new RuntimeException("[" + rowNum + "] 데이터 처리 중 오류가 발생했습니다.\n" + e.getMessage());
    }

    rowNum++;
    if ((rowNum % PAGE_SIZE) == 0) {
      appendDataList();
    }
  }

  /**
   * 현재까지 기록된 내용을 Json DataSet에 기록
   */
  private void appendDataList() {

    int len = sbWriter.length();
    if (len > 0) {
      sbWriter.setLength(len - 1);
      dsJson.appendData(sbWriter);
      sbWriter = new StringBuilder();
    }
  }

  /**
   * SELECT한 데이터를 Json DataSet으로 리턴
   * 
   * @return
   */
  public JsonDataSet getJsonDataSet() {

    appendDataList();
    alColumns = null;
    hmWriter.clear();
    hmWriter = null;
    omWriter = null;
    sbWriter = null;
    return dsJson;
  }
}
