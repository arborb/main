package nexos.service.ld;

import java.util.Map;

public interface LD02010EDAO {

  /**
   * 도크조정 저장
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}
