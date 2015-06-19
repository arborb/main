package nexos.service.ld;

import java.util.Map;

public interface LD01010EDAO {

  /**
   * 배차조정 저장
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

  /**
   * 전표분할 저장
   * @param params
   * @return
   * @throws Exception
   */
  void saveSplitOrder(Map<String, Object> params) throws Exception;

}
