package nexos.service.ri;

import java.util.Map;

public interface RIM2010EDAO {

  /**
   * 온라인반입등록 마스터/디테일 저장 처리
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

  /**
   * 온라인반입지시 - 온라인반입지시 저장
   * @param params
   * @return
   * @throws Exception
   */
  void saveDirectionsLocId(Map<String, Object> params) throws Exception;

  /**
   * 온라인반입확정/적치 - 온라인반입지시 저장
   * @param params
   * @return
   * @throws Exception
   */
  void saveDirections(Map<String, Object> params) throws Exception;

}