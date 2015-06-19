package nexos.service.cs;

import java.util.Map;

public interface CS03010EDAO {

  /**
   * 프로세스 내역 저장
   * @param params
   * @return
   * @throws Exception
   */
  void saveMaster(Map<String, Object> params) throws Exception;

  /**
   * 하위프로세스 저장 처리
   * @param params
   * @return
   * @throws Exception
   */
  void saveDetail(Map<String, Object> params) throws Exception;

}
