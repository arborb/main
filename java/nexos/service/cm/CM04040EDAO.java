package nexos.service.cm;

import java.util.Map;

public interface CM04040EDAO {

  /**
   * 딜 마스터 내역 저장
   * @param params
   * @return
   * @throws Exception
   */
  void saveMaster(Map<String, Object> params) throws Exception;

  /**
     * 딜옵셥 마스터 내역 저장
     * @param params
     * @return
     * @throws Exception
     */
  void saveDetail(Map<String, Object> params) throws Exception;

  /**
     * 딜상품 마스터 내역 저장
     * @param params
     * @return
     * @throws Exception
     */
  void saveSub(Map<String, Object> params) throws Exception;

}
