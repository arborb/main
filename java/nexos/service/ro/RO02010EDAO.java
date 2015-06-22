package nexos.service.ro;

import java.util.Map;

public interface RO02010EDAO {

  /**
   * 반출등록 마스터/디테일 저장 처리
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

  /**
   * 반출확정 저장
   * @param params
   * @return
   * @throws Exception
   */
  void saveConfirms(Map<String, Object> params) throws Exception;
  
  /**
   * 사용자 삭제 프로시저 호출
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  Map callDelete(Map<String, Object> params) throws Exception;


  void saveSub(Map<String, Object> params) throws Exception;
  

  @SuppressWarnings("rawtypes")
  Map callLi_Fw_Directions_Proc(Map<String, Object> params) throws Exception;
  
}