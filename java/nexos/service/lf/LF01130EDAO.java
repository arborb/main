package nexos.service.lf;

import java.util.Map;

public interface LF01130EDAO {

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
   * 임대수수료 기준관리 저장 처리
   * @param params
   * @return
   * @throws Exception
   */

  void save(Map<String, Object> params) throws Exception;

}