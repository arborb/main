package nexos.service.lc;

import java.util.Map;

public interface LC04010EDAO {

  /**
   * 재고실사 마스터/디테일 저장 처리
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

  /**
   * 재고실사 등록 마스터 처리
   * @param params
   * @return
   * @throws Exception
   */
  void delete(Map<String, Object> params) throws Exception;

}