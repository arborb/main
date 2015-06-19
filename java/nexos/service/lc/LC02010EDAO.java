package nexos.service.lc;

import java.util.Map;

public interface LC02010EDAO {

  /**
   * 상태변환관리 저장
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}
