package nexos.service.lf;

import java.util.Map;

public interface LF05010EDAO {

    /**
     * 예외운송비등록 마스터/디테일 저장 처리(팝업화면에서)
     * @param params
     * @return
     * @throws Exception
     */
    void save(Map<String, Object> params) throws Exception;
    
    /**
     * 예외운송비등록 마스터/디테일 삭제 처리
     * @param params
     * @return
     * @throws Exception
     */
    void delete(Map<String, Object> params) throws Exception;

}