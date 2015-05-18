package nexos.service.cm;

import java.util.Map;

public interface CM04060EDAO {

  /**
   * 공급처상품관리 마스터 저장 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

  /**
   * 공급처상품관리 (공급처별 상품할당) 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  String callVendorItemAddItem(Map<String, Object> params) throws Exception;

  /**
   * 공급처상품관리 (상품별 공급처할당) 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  String callVendorItemAddVendor(Map<String, Object> params) throws Exception;

}
