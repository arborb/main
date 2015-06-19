package nexos.service.cs;

import java.util.Map;

public interface CS06020EDAO {

  /**
   * 메세지 내역 저장
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}