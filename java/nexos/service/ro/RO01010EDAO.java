package nexos.service.ro;

import java.util.Map;

public interface RO01010EDAO {

  /**
   * 반출예정등록 마스터/디테일 저장 처리(팝업화면에서)
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

  /**
   * 반출예정등록 마스터/디테일 삭제처리
   * @param params
   * @return
   * @throws Exception
   */
  void delete(Map<String, Object> params) throws Exception;

}