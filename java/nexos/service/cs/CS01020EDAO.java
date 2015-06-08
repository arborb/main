package nexos.service.cs;

import java.util.List;
import java.util.Map;

public interface CS01020EDAO {

  /**
   * 메뉴정보 조회
   * @param queryId 쿼리ID
   * @param params 조회조건
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  List getProgramMenu(String queryId, Map<String, Object> params);

  /**
   * 프로그램 메뉴데이터를 생성하는 Method.
   * @param list : 메뉴데이터
   * @return String : JSON메뉴데이터.
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  List getProgramMenuTree(List list);

  /**
   * 프로그램 메뉴 저장
   * @param params
   * @return
   * @throws Exception
   */
  void saveProgram(Map<String, Object> params) throws Exception;

  /**
   * 프로그램 사용자 저장
   * @param params
   * @return
   * @throws Exception
   */
  void saveUserProgram(Map<String, Object> params) throws Exception;

}