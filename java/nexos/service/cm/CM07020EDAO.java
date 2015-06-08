package nexos.service.cm;

import java.util.Map;

public interface CM07020EDAO {

  /**
   * 운송장대역관리 내역 저장
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}
