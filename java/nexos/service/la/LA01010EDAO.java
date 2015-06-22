package nexos.service.la;

import java.util.Map;

public interface LA01010EDAO {

  /**
   * 발주데이터 생성 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  Map callRequestCreation(Map<String, Object> params) throws Exception;

  /**
   * 발주등록 마스터/디테일 저장 처리(팝업화면에서)
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

  /**
   * 발주등록 디테일 저장 처리(조정수량)
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void saveAdjust(Map<String, Object> params) throws Exception;

  /**
   * 발주등록 마스터/디테일 삭제 처리
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void delete(Map<String, Object> params) throws Exception;
}