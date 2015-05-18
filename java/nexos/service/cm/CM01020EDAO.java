package nexos.service.cm;

import java.util.Map;

public interface CM01020EDAO {

  /**
   * 물류센터 존 내역 조회
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}