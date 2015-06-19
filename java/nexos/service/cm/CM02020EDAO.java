package nexos.service.cm;

import java.util.Map;

public interface CM02020EDAO {

  /**
   * 차량 내역 저장
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}
