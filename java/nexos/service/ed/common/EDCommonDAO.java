package nexos.service.ed.common;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public interface EDCommonDAO {

  /**
   * SP 호출
   * 
   * @param queryId 쿼리ID
   * @param params 조회조건
   * @return
   * @throws Exception
   */
  HashMap<String, Object> callSP(String queryId, Map<String, Object> params);

  /**
   * FTP 파일 다운로드
   * 
   * @param remoteType
   * @param remoteIP
   * @param remotePort
   * @param remoteCharset
   * @param remotePassiveYN
   * @param remoteUserID
   * @param remoteUserPwd
   * @param remoteDir
   * @param prefixFileNm
   * @param ediDir
   */
  void ftpDownload(String remoteType, String remoteIP, String remotePort, String remoteCharset, String remotePassiveYN,
    String remoteUserID, String remoteUserPwd, String remoteDir, String prefixFileNm, String ediDir) throws Exception;

  /**
   * FTP 파일 업로드
   * 
   * @param remoteType
   * @param remoteIP
   * @param remorePort
   * @param remoteCharset
   * @param remotePassiveYN
   * @param remoteUserID
   * @param remoteUserPwd
   * @param remoteDir
   * @param ediFiles
   * @param backupDir
   */
  void ftpUpload(String remoteType, String remoteIP, String remorePort, String remoteCharset, String remotePassiveYN,
    String remoteUserID, String remoteUserPwd, String remoteDir, String[ ] ediFiles, String backupDir) throws Exception;

  /**
   * 수신일자 리턴, 1순위 DB_SERVER, 2순위 WAS_SERVER
   * 
   * @return
   * @throws Exception
   */
  String getEDIDate() throws Exception;

  /**
   * 송수신 오류 정보 리턴
   * 
   * @param params
   * @return
   */
  @SuppressWarnings("rawtypes")
  List getErrorInfo(Map<String, Object> params);

  /**
   * Property 값 읽기
   * 
   * @param key
   * @return
   */
  String getGlobalProperty(String key);

  /**
   * 수신번호 채번
   * 
   * @param params
   * @return
   */
  HashMap<String, Object> getRecvNo(Map<String, Object> params);

  /**
   * 수신처리 결과 정보 리턴
   * 
   * @param params
   * @return
   */
  @SuppressWarnings("rawtypes")
  List getRecvResultInfo(Map<String, Object> params);

  /**
   * 송신 대상 상세 정보 리턴
   * 
   * @param params
   * @return
   */
  @SuppressWarnings("rawtypes")
  List getSendDetailInfo(Map<String, Object> params);

  /**
   * 송신 대상 정보 리턴
   * 
   * @param params
   * @return
   */
  @SuppressWarnings("rawtypes")
  List getSendInfo(Map<String, Object> params);

  /**
   * DBLink -> EDI Temp Table에 Insert
   * 
   * @param params
   */
  HashMap<String, Object> recvDBLink(Map<String, Object> params) throws Exception;

  /**
   * Excel 파일 -> EDI Temp Table에 Insert
   * 
   * @param params
   */
  HashMap<String, Object> recvExcel(Map<String, Object> params) throws Exception;

  /**
   * Excel 파일 -> EDI Temp Table에 Insert (위메프 엑셀 주문리스트 Upload를 위한 Function 구현)
   * 
   * @param params
   */
  HashMap<String, Object> recvExcel_01(Map<String, Object> params) throws Exception;

  /**
   * Text 파일 -> EDI Temp Table에 Insert
   * 
   * @param params
   */
  HashMap<String, Object> recvText(Map<String, Object> params) throws Exception;

  /**
   * XML 파일 -> EDI Temp Table에 Insert
   * 
   * @param params
   */
  HashMap<String, Object> recvXML(Map<String, Object> params) throws Exception;

  /**
   * EDI Temp Table의 데이터를 DBLink로 송신
   * 
   * @param params
   */
  HashMap<String, Object> sendDBLink(Map<String, Object> params) throws Exception;

  /**
   * 출고확정 송신(ELCA 전용)
   * 
   * @param params
   * @return
   * @throws Exception
   */
  HashMap<String, Object> sendESLOOrder_0010(Map<String, Object> params) throws Exception;

  /**
   * EDI Temp Table의 데이터를 Excel 파일로 생성
   * 
   * @param params
   */
  HashMap<String, Object> sendExcel(Map<String, Object> params) throws Exception;

  /**
   * EDI Temp Table의 데이터를 Text 파일로 생성
   * 
   * @param params
   */
  HashMap<String, Object> sendText(Map<String, Object> params) throws Exception;

  /**
   * EDI Temp Table의 데이터를 XML 파일로 생성
   * 
   * @param params
   */
  HashMap<String, Object> sendXML(Map<String, Object> params) throws Exception;
}