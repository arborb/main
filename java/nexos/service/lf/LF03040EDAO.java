package nexos.service.lf;

import java.util.Map;

public interface LF03040EDAO {

    /**
     * 위탁수수료 합계조정 마스터 저장 처리
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;
    

}