package nexos.service.li;

import java.util.Map;

public interface LI02010EDAO {

  /**
   * 입고등록 마스터/디테일 저장 처리
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

  /**
   * 입고지시 - 입고지시 저장
   * @param params
   * @return
   * @throws Exception
   */
  void saveDirectionsLocId(Map<String, Object> params) throws Exception;

  /**
   * 입고확정/적치 - 입고지시 저장
   * @param params
   * @return
   * @throws Exception
   */
  
  void saveDirections(Map<String, Object> params) throws Exception;  

  
  void saveSub(Map<String, Object> params) throws Exception;
  
  /**
   *삭제 프로시저 호출
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  Map callDelete(Map<String, Object> params) throws Exception;


  @SuppressWarnings("rawtypes")
  Map callLi_Fw_Putaway_Proc(Map<String, Object> params) throws Exception;


}