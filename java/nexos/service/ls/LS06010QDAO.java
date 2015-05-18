package nexos.service.ls;

import java.util.Map;

public interface LS06010QDAO {

    /**
     * 배송완료처리
     * @param params
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;
    
    /**
     * 딜 삭제 프로시저 호출
     * 
     * @param params
     * @return
     * @throws Exception
     */
    @SuppressWarnings("rawtypes")
    Map callDelete(Map<String, Object> params) throws Exception;



}