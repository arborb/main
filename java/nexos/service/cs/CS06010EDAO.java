package nexos.service.cs;

import java.util.Map;

public interface CS06010EDAO {

  /**
   * 화면표시그룹 저장 처리
   * @param params
   * @return
   * @throws Exception
   */
  void saveMaster(Map<String, Object> params) throws Exception;

  /**
   * 메시지그룹 저장 처리
   * @param params
   * @return
   * @throws Exception
   */
  void saveDetail(Map<String, Object> params) throws Exception;
}