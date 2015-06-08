package nexos.service.li;

import java.util.Map;

public interface LI01010EDAO {

    /**
     * 입고예정등록 마스터/디테일 저장 처리(팝업화면에서)
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;
    
    /**
     * 입고예정등록 마스터/디테일 삭제 처리
     * @param params
     * @return
     * @throws Exception
     */
    void delete(Map<String, Object> params) throws Exception;    

}