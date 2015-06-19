package nexos.service.cm;

import java.util.Map;

public interface CM09010EDAO {

  /**
   * 작업일자 내역 저장
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}
