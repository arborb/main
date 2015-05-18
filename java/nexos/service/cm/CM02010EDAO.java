package nexos.service.cm;

import java.util.Map;

public interface CM02010EDAO {

  /**
     * 운송권역 내역 저장
     * @param params
     * @return
     * @throws Exception
     */
  void save(Map<String, Object> params) throws Exception;

}
