package nexos.service.lx;

import java.util.Map;

public interface LX02010EDAO {

  /**
   * 프로세스별 수량 저장 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

  /**
   * 예정의 등록수량 수정 후 등록 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void saveEntry(Map<String, Object> params) throws Exception;

}