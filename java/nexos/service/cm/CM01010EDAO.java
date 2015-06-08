package nexos.service.cm;

import java.util.Map;

public interface CM01010EDAO {

  /**
   * 물류센터 내역 저장
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}