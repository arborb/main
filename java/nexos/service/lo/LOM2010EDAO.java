package nexos.service.lo;

import java.util.Map;

public interface LOM2010EDAO {


  /**
   * Delivery_Batch 채번
   *
   * @param params
   * @return
   * @throws Exception
   */
  String deliveryBatch(Map<String, Object> params) throws Exception;
 
  /**
   * 출고등록 마스터/디테일 저장 처리
   *
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;

  /**
   * 출고확정 저장
   *
   * @param params
   * @return
   * @throws Exception
   */
  void saveConfirms(Map<String, Object> params) throws Exception;

  /**
   * 배송완료 저장
   *
   * @param params
   * @return
   * @throws Exception
   */
  void saveDelivery(Map<String, Object> params) throws Exception;

  /**
   * 위메프 지시 배송유형 저장
   *
   * @param params
   * @return
   * @throws Exception
   */
  String saveDeliverytype(Map<String, Object> params) throws Exception;

  /**
   * 출고지시 저장
   *
   * @param params
   * @return
   * @throws Exception
   */
  String saveDirections(Map<String, Object> params) throws Exception;

  /**
   * 출고등록(일괄) 저장
   *
   * @param params
   * @return
   * @throws Exception
   */
  void saveEntryBT(Map<String, Object> params) throws Exception;

  /**
   * 위메프 지시 운송구분 저장
   *
   * @param params
   * @return
   * @throws Exception
   */
  String saveShiptype(Map<String, Object> params) throws Exception;
  
  /**
   * 지시취소 체크 Update 프로시저 호출
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  Map callUpdate(Map<String, Object> params) throws Exception;
  

  /**
   * 지시취소 체크 Update 프로시저 호출
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  Map callUpdateD(Map<String, Object> params) throws Exception;


}