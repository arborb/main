package nexos.service.lf;

import java.util.Map;

public interface LF02050EDAO {

  /**
     * 배송청구수수료 마스터(사업부별) 저장 처리
     * @param params
     * @return
     * @throws Exception
     */
  void saveMaster(Map<String, Object> params) throws Exception;

  /**
     * 배송청구수수료 마스터(보관유형별/상품그룹별/상품별) 저장 처리
     * @param params
     * @return
     * @throws Exception
     */
  void saveDetail(Map<String, Object> params) throws Exception;

}