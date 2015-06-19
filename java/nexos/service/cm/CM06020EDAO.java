package nexos.service.cm;

import java.util.Map;

public interface CM06020EDAO {

  /**
   * 안전재고 내역 저장
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}
