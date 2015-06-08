package nexos.service.cm;

import java.util.Map;

public interface CM04070EDAO {

  /**
   * 상품등록요청 저장/수정/삭제
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}
