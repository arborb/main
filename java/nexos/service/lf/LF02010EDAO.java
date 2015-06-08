package nexos.service.lf;

import java.util.Map;

public interface LF02010EDAO {

    /**
     * 정산코드 저장 처리
     * @param params
     * @return
     * @throws Exception
     */
    void saveMaster(Map<String, Object> params) throws Exception;

    /**
     * 세부코드 저장 처리
     * @param params
     * @return
     * @throws Exception
     */
    void saveDetail(Map<String, Object> params) throws Exception;
}