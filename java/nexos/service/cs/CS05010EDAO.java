package nexos.service.cs;

import java.util.Map;

public interface CS05010EDAO {

  /**
   * 그룹코드 저장 처리
   * @param params
   * @return
   * @throws Exception
   */
  void saveMaster(Map<String, Object> params) throws Exception;

  /**
   * 상용코드 저장 처리
   * @param params
   * @return
   * @throws Exception
   */
  void saveDetail(Map<String, Object> params) throws Exception;
}