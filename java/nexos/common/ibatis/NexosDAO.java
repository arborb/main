package nexos.common.ibatis;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.springframework.orm.ibatis.SqlMapClientTemplate;

/**
 * Class: NexosDAO<br>
 * Description: 모든 DAO (Data Access Object) - 데이터처리를 담당하는 최상위 Class<br>
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
public class NexosDAO {

  // IBatis의 sqlMapClient를 사용하지 않고
  // spring의 SqlMapClientTemplate를 사용하도록 합니다.
  // @Resource
  // protected SqlMapClient sqlMapClient;

  private SqlMapClientTemplate sqlMapClientTemplate;

  /**
   * SqlMapClientTemplate 를 가져옵니다.
   * 
   * @return
   */
  public SqlMapClientTemplate getSqlMapClientTemplate() {

    return sqlMapClientTemplate;
  }

  /**
   * SqlMapClientTemplate 를 주입합니다.
   * 
   * @param sqlMapClientTemplate
   */
  public void setSqlMapClientTemplate(SqlMapClientTemplate sqlMapClientTemplate) {

    this.sqlMapClientTemplate = sqlMapClientTemplate;
  }

  /**
   * List 형태로 데이터 조회하기
   * 
   * @param queryId 조회할 쿼리ID
   * @param map 조회 조건
   * @return 조회 결과
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  public List list(String queryId, Map<String, Object> map) {

    return sqlMapClientTemplate.queryForList(queryId, map);
  }

  /**
   * List 형태로 데이터 조회하기
   * 
   * @param queryId 조회할 쿼리ID
   * @return 조회 결과
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  public List list(String queryId) {

    return sqlMapClientTemplate.queryForList(queryId);
  }

  /**
   * JSON 형태로 데이터 조회하기
   * 
   * @param queryId 조회할 쿼리ID
   * @return 조회 결과
   * @throws Exception
   */
  public JsonDataSet jsonList(String queryId) {

    return jsonList(queryId, null);
  }

  /**
   * JSON 형태로 데이터 조회하기
   * 
   * @param queryId 조회할 쿼리ID
   * @param map 조회 조건
   * @return 조회 결과
   * @throws Exception
   */
  public JsonDataSet jsonList(String queryId, Map<String, Object> map) {

    JsonRowHandler rowHandler = new JsonRowHandler();
    sqlMapClientTemplate.queryWithRowHandler(queryId, map, rowHandler);
    return rowHandler.getJsonDataSet();
  }

  /**
   * 데이터 조회 후 Excel 형태로 데이터 기록
   * 
   * @param queryId 조회할 쿼리ID
   * @param xlsWorkbook Excel Workbook
   * @param grdColumns Grid Column 정보
   * @param xlsExportType Excel Export 타입
   * @param xlsTitle Excel Sheet 타이틀
   * @return 데이터 건수
   */
  public int listToExcel(String queryId, HSSFWorkbook xlsWorkbook, List<Map<String, Object>> grdColumns,
    String xlsExportType, String xlsTitle) {

    return listToExcel(queryId, null, xlsWorkbook, grdColumns, xlsExportType, xlsTitle);
  }

  /**
   * 데이터 조회 후 Excel 형태로 데이터 기록
   * 
   * @param queryId 조회할 쿼리ID
   * @param map 조회 조건
   * @param xlsWorkbook Excel Workbook
   * @param grdColumns Grid Column 정보
   * @param xlsExportType Excel Export 타입
   * @param xlsTitle Excel Sheet 타이틀
   * @return 데이터 건수
   */
  public int listToExcel(String queryId, Map<String, Object> map, HSSFWorkbook xlsWorkbook,
    List<Map<String, Object>> grdColumns, String xlsExportType, String xlsTitle) {

    ExcelRowHandler rowHandler = new ExcelRowHandler(xlsWorkbook, grdColumns, xlsExportType, xlsTitle);
    sqlMapClientTemplate.queryWithRowHandler(queryId, map, rowHandler);
    return rowHandler.getCount();
  }

  /**
   * 입력 처리하기
   * 
   * @param queryId 입력처리할 쿼리ID
   * @param map 입력처리할 데이터
   * @return The primary key of the newly inserted row. This might be automatically
   * generated by the RDBMS, or selected from a sequence table or other source.
   * @throws Exception
   */
  public Object insert(String queryId, Map<String, Object> map) {

    return sqlMapClientTemplate.insert(queryId, map);
  }

  /**
   * 수정 처리하기
   * 
   * @param queryId 업데이트할 쿼리ID
   * @param map 업데이트할 데이터
   * @return 처리 갯수
   * @throws Exception
   */
  public int update(String queryId, Map<String, Object> map) {

    return sqlMapClientTemplate.update(queryId, map);
  }

  /**
   * 삭제처리 하기
   * 
   * @param queryId
   * @param map
   * @return
   * @throws Exception
   */
  public int delete(String queryId, Map<String, Object> map) {

    return sqlMapClientTemplate.delete(queryId, map);
  }

  /**
   * SP 호출
   * 
   * @param queryId 호출할 쿼리ID
   * @param map 프로시저 파라메터
   * @return 파라메터 Map 에 OUTPUT 파라메터
   * @throws Exception
   */
  public HashMap<String, Object> callSP(String queryId, Map<String, Object> map) {

   HashMap<String, Object> resultMap = new HashMap<String, Object>(map);
    sqlMapClientTemplate.update(queryId, resultMap);
    return resultMap;
  }
}
