package nexos.service.li;

import java.util.Map;

public interface LI05010EDAO {

    /**
     * 배송완료처리
     * @param params
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;

}