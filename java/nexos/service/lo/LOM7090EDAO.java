package nexos.service.lo;

import java.util.Map;

public interface LOM7090EDAO {

	/**
	 * 출고스캔검수-검수 취소
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	Map callBWScanConfirm(Map<String, Object> params) throws Exception;

	/**
	 * 출고스캔검수-검수 완료
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	Map callFWScanConfirm(Map<String, Object> params) throws Exception;

	/**
	 * 출고스캔검수-박스 삭제(팝업화면에서)
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	String callScanBoxDelete(Map<String, Object> params) throws Exception;

	/**
	 * 출고스캔검수-박스 통합(팝업화면에서)
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	Map callScanBoxMerge(Map<String, Object> params) throws Exception;

	/**
	 * Delivery_Batch 채번
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	String deliveryBatch(Map<String, Object> params) throws Exception;

	/**
	 * 출고스캔검수 내역(상품별)
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	void save(Map<String, Object> params) throws Exception;

	/**
	 * 출고지시 저장
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	String saveDirections(Map<String, Object> params) throws Exception;
	
  /**
   * 지시취소 체크 Update 프로시저 호출
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  Map callUpdate(Map<String, Object> params) throws Exception;
  
}