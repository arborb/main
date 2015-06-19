package nexos.service.lc;

import java.util.Map;

public interface LC03010EDAO {

  /**
   * 재고이동 마스터/디테일 저장 처리
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;


  void save1(Map<String, Object> params) throws Exception;

}
