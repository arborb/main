package nexos.service.cm;

import java.util.Map;

public interface CM01030EDAO {

  /**
   * 로케이션 행 내역 저장
   * @param params
   * @return
   * @throws Exception
   */
void saveMaster(Map<String, Object> params) throws Exception;

/**
   * 로케이션 내역 저장
   * @param params
   * @return
   * @throws Exception
   */
  void saveDetail(Map<String, Object> params) throws Exception;

}