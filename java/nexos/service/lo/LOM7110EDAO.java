package nexos.service.lo;

import java.util.Map;

public interface LOM7110EDAO {
  
  /**
   * 피킹검수 - 용기삭제
   *
   * @param params
   * @return
   * @throws Exception
   */
  String callBoxDelete(Map<String, Object> params) throws Exception;

  /**
   * 피킹검수 - 검수 완료
   *
   * @param params
   * @return
   * @throws Exception
   */
  String callFWScanConfirm(Map<String, Object> params) throws Exception;

  /**
   * 출고스캔검수-박스 통합(팝업화면에서)
   * 
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("rawtypes")
  Map callScanBoxMerge(Map<String, Object> params) throws Exception;
}