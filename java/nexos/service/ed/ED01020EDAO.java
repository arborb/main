package nexos.service.ed;

import java.util.Map;

public interface ED01020EDAO {

    /**
     * I/F코드 정보 저장 처리
     * @param params
     * @return
     * @throws Exception
     */
    void saveDetail(Map<String, Object> params) throws Exception;
}