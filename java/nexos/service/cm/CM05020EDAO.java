package nexos.service.cm;

import java.util.Map;

public interface CM05020EDAO {

  /**
     * 반품로케이션 내역 저장
     * @param params
     * @return
     * @throws Exception
     */
  void save(Map<String, Object> params) throws Exception;

}
