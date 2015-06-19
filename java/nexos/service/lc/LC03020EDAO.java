package nexos.service.lc;

import java.util.Map;

public interface LC03020EDAO {

  /**
   * 로케이션ID병합 데이터 저장 처리
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}