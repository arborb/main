package nexos.service.lo;

import java.util.Map;

public interface LOM6010QDAO {

  /**
   * 복수의 CMSHIPID 채번
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  Map callShipIdGetNo(Map<String, Object> params) throws Exception;

  /**
   * 적재팔레트발행 출력체크 저장 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;
}
