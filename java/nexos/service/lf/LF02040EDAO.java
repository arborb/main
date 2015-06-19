package nexos.service.lf;

import java.util.Map;

public interface LF02040EDAO {

    /**
     * 임대수수료 기준관리 저장 처리
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;
    

}