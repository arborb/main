package nexos.service.lf;

import java.util.Map;

public interface LF01030EDAO {

  /**
   * 사용자 복사 프로시저 호출
   *
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  Map callAdjustInsert(Map<String, Object> params) throws Exception;


  /**
   * 물류센터 존 내역 조회
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}