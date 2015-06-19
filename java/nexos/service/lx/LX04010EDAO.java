package nexos.service.lx;

import java.util.Map;

public interface LX04010EDAO {

  /**
   * 프로세스별 수량 저장 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;
}