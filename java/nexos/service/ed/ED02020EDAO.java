package nexos.service.ed;

import java.util.Map;

public interface ED02020EDAO {

	/**
     * 인터페이스 송신정의 마스터 저장
     * @param params
     * @return
     * @throws Exception
     */
    void saveMaster(Map<String, Object> params) throws Exception;

	/**
     * 인터페이스 송신정의 디테일 저장
     * @param params
     * @return
     * @throws Exception
     */
    void saveDetail(Map<String, Object> params) throws Exception;

}
