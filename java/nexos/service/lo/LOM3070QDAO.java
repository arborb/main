package nexos.service.lo;

import java.util.Map;

public interface LOM3070QDAO {

  /**
   * 안전재고 내역 저장
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}
