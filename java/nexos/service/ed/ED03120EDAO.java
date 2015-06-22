package nexos.service.ed;

import java.util.Map;

public interface ED03120EDAO {

  /**
   * 엑셀 처리오류건 수정
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}
