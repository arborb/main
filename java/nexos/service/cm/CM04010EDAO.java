package nexos.service.cm;

import java.util.Map;

public interface CM04010EDAO {

  /**
     * 상품그룹 대분류 내역 저장
     * @param params
     * @return
     * @throws Exception
     */
  void saveMaster(Map<String, Object> params) throws Exception;

  /**
     * 상품그룹 중분류 내역 저장
     * @param params
     * @return
     * @throws Exception
     */
  void saveDetail(Map<String, Object> params) throws Exception;

  /**
     * 상품그룹 소분류 내역 저장
     * @param params
     * @return
     * @throws Exception
     */
  void saveSub(Map<String, Object> params) throws Exception;

}
