package nexos.service.lo;

import java.util.Map;

public interface LOM7020EDAO {

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
   * 출고스캔검수 내역(상품별)
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;
}