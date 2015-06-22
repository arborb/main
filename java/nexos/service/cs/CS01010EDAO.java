package nexos.service.cs;

import java.util.Map;


public interface CS01010EDAO {

  
  /**
   * 사용자 복사 프로시저 호출
   *
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  Map callUserCopy(Map<String, Object> params) throws Exception;

  /**
   * 사용자 삭제 프로시저 호출
   *
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  Map callUserDelete(Map<String, Object> params) throws Exception;

  /**
   * 사용자 내역 저장
   *
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

  /**
   * 사용자별프로그램마스터 저장
   *
   * @param params
   * @return
   * @throws Exception
   */
  void saveUserProgram(Map<String, Object> params) throws Exception;
}
