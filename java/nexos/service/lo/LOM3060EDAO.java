package nexos.service.lo;

import java.util.Map;

public interface LOM3060EDAO {

  /**
   * 주문 주소변경 내역 저장
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}