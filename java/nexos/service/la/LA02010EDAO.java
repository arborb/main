package nexos.service.la;

import java.util.Map;

public interface LA02010EDAO {

  /**
   * 납품예약등록 마스터/디테일 저장 처리(팝업화면에서)
   * 
   * @param params
   * @return
   * @throws Exception
   */
  void save(Map<String, Object> params) throws Exception;
}