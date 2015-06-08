package nexos.service.lf;

import java.util.Map;

public interface LF03020EDAO {

    /**
     * 운송청구수수료 조정 마스터 저장 처리
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;
    

}