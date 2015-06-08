package nexos.service.ed;

import java.util.Map;

public interface ED10010EDAO {

    /**
     * 송수신구분코드 저장 처리
     * @param params
     * @return
     * @throws Exception
     */
    void saveDetail(Map<String, Object> params) throws Exception;

    /**
     * 그룹코드 저장 처리
     * @param params
     * @return
     * @throws Exception
     */
    void saveMaster(Map<String, Object> params) throws Exception;
}