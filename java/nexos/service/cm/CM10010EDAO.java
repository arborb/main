package nexos.service.cm;

import java.util.Map;

public interface CM10010EDAO {

  /**
   * 이벤트관리 마스터/디테일 저장 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void delete(Map<String, Object> params) throws Exception;

  /**
   * 이벤트관리 마스터/디테일 저장 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}