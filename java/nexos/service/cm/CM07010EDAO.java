package nexos.service.cm;

import java.util.Map;

public interface CM07010EDAO {

  /**
   * 우편번호 내역 저장
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}
