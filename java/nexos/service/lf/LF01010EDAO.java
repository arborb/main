package nexos.service.lf;

import java.util.Map;

public interface LF01010EDAO {

    /**
     * 보안설정/해제 마스터 저장 처리
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;
    

}