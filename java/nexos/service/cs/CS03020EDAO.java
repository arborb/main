package nexos.service.cs;

import java.util.Map;

public interface CS03020EDAO {

  /**
   * 브랜드별 프로세스 내역 저장
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;
}