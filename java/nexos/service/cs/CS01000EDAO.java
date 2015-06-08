package nexos.service.cs;

import java.util.Map;

public interface CS01000EDAO {

  /**
   * 공지사항 저장
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void saveMaster(Map<String, Object> params) throws Exception;

  /**
   * 덧글 저장
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void saveDetail(Map<String, Object> params) throws Exception;

  /**
   * 공지 읽음 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void readNotice(Map<String, Object> params) throws Exception;
  

  void saveSub(Map<String, Object> params) throws Exception;
  
  @SuppressWarnings("rawtypes")
  Map callDelete(Map<String, Object> params) throws Exception;
}