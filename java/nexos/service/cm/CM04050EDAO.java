package nexos.service.cm;

import java.util.Map;

public interface CM04050EDAO {

  /**
   * 물류센터상품관리 마스터 저장 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

  /**
   * 물류센터상품관리 (개별 할당) 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  String callCenterItemCheckAllocate(Map<String, Object> params) throws Exception;

}
