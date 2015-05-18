package nexos.service.cm;

import java.util.Map;

public interface CM02050EDAO {

  /**
     * 운송사 내역 저장
     * @param params
     * @return
     * @throws Exception
     */
  void save(Map<String, Object> params) throws Exception;

}
