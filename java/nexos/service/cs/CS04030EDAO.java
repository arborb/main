package nexos.service.cs;

import java.util.Map;

public interface CS04030EDAO {

  /**
   * 브랜드별 정책 내역 저장
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

}
