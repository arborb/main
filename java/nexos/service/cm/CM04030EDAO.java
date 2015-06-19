package nexos.service.cm;

import java.util.Map;

public interface CM04030EDAO {

  /**
   * 세트상품 내역 저장
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}
