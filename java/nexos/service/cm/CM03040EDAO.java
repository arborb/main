package nexos.service.cm;

import java.util.Map;

public interface CM03040EDAO {

  /**
     * 배송처 내역 저장
     * @param params
     * @return
     * @throws Exception
     */
  void save(Map<String, Object> params) throws Exception;

}
