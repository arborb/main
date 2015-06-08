package nexos.service.lo;

import java.util.Map;

public interface LOM8010EDAO {

  /**
   * 적재팔레트 내역
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}