package nexos.service.common;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import nexos.common.ibatis.JsonDataSet;

public interface CommonDAO {

  /**
   * SP 호출
   * 
   * @param queryId 쿼리ID
   * @param params 조회조건
   * @return
   * @throws Exception
   */
  HashMap<String, Object> callSP(String queryId, Map<String, Object> params);

  /**
   * 데이터 조회
   * 
   * @param queryId 쿼리ID
   * @param params 조회조건
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  List getDataSet(String queryId);

  /**
   * 데이터 조회
   * 
   * @param queryId 쿼리ID
   * @param params 조회조건
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  List getDataSet(String queryId, Map<String, Object> params);

  /**
   * 데이터 조회
   * 
   * @param queryId 쿼리ID
   * @param params 조회조건
   * @return
   * @throws Exception
   */
  JsonDataSet getJsonDataSet(String queryId);

  /**
   * 데이터 조회
   * 
   * @param queryId 쿼리ID
   * @param params 조회조건
   * @return
   * @throws Exception
   */
  JsonDataSet getJsonDataSet(String queryId, Map<String, Object> params);

}