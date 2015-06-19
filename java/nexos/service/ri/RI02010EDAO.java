package nexos.service.ri;

import java.util.Map;

public interface RI02010EDAO {

  /**
   * 반입등록 마스터/디테일 저장 처리
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

  /**
   * 반입지시 - 반입지시 저장
   * @param params
   * @return
   * @throws Exception
   */
  void saveDirectionsLocId(Map<String, Object> params) throws Exception;

  /**
   * 반입확정/적치 - 반입지시 저장
   * @param params
   * @return
   * @throws Exception
   */
  void saveDirections(Map<String, Object> params) throws Exception;

}