package nexos.service.cm;

import java.util.Map;

public interface CM07030EDAO {

  /**
   * 상품사업부매칭관리 (상품사업부별 위탁사 매칭) 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  String callItemBuMatchOwnBrand(Map<String, Object> params) throws Exception;

  /**
   * 위탁사매칭관리 (화주별 대표위탁사 매칭) 처리
   *
   * @param params
   * @return
   * @throws Exception
   */
  String callVendorItemAddVendor(Map<String, Object> params) throws Exception;

  /**
   * 공급처상품관리 마스터 저장 처리
   *
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}
