package nexos.service.common;

import java.net.UnknownHostException;
import java.util.List;
import java.util.Map;

import org.springframework.orm.ibatis.SqlMapClientFactoryBean;

public interface WCDAO {

	/**
	 * 즐겨찾기를 삭제
	 * 
	 * @param params
	 *            조회조건
	 */
	void deleteBookMark(Map<String, Object> params);

	/**
	 * Excel 파일 생성 후 생성된 서버의 파일명 리턴
	 * 
	 * @param params
	 * @return
	 */
	@SuppressWarnings("rawtypes")
	Map excelExport(Map<String, Object> params) throws Exception;

	/**
	 * 로그인 부가 정보 조회
	 * 
	 * @param userId
	 * @param clientIP
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	List getCSUserSysInfo(String userId, String clientIP);

	/**
	 * 로그인 처리하기
	 * 
	 * @param params
	 *            조회조건
	 * @return
	 * @throws UnknownHostException
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	Map getLogin(Map<String, Object> params) throws UnknownHostException;

	/**
	 * 로그아웃 처리하기
	 * 
	 * @param params
	 *            조회조건
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	void getLogout(Map<String, Object> params);

	/**
	 * DB서버의 현재일자, 현재시간 리턴
	 * 
	 * @return
	 */
	@SuppressWarnings("rawtypes")
	Map getSysDate();

	/**
	 * 메뉴정보 조회
	 * 
	 * @param params
	 *            조회조건
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	List getUserProgramBookMark(Map<String, Object> params);

	/**
	 * 프로그램 메뉴데이터를 생성하는 Method.
	 * 
	 * @param list
	 *            : 메뉴데이터
	 * @return String : JSON메뉴데이터.
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	List getUserProgramBookMarkTree(List list);

	/**
	 * 메뉴정보 조회
	 * 
	 * @param params
	 *            조회조건
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	List getUserProgramMenu(Map<String, Object> params);

	/**
	 * 프로그램 메뉴데이터를 생성하는 Method.
	 * 
	 * @param list
	 *            : 메뉴데이터
	 * @return String : JSON메뉴데이터.
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	List getUserProgramMenuTree(List list);

	/**
	 * 체크값 기록하기
	 * 
	 * @param checkedValue
	 * @throws Exception
	 */
	void insertCheckedValue(Map<String, Object> params);

	/**
	 * sqlMap reload
	 * 
	 * @param factory
	 * @return
	 */
	String reloadSqlMap(SqlMapClientFactoryBean factory);

	/**
	 * 즐겨찾기를 추가
	 * 
	 * @param params
	 *            조회조건
	 */
	void saveBookMark(Map<String, Object> params);

	/**
	 * 그리드 컬럼순서 저장
	 * 
	 * @param params
	 * @throws Exception
	 */
	void saveGridColumnOrder(Map<String, Object> params);

	/**
	 * 로그인 기록
	 * 
	 * @param userId
	 * @param clientIP
	 * @param regUserId
	 * @throws Exception
	 */
	void updateLoginInfo(String userId, String clientIP, String regUserId);

	/**
	 * 사용자 비밀번호 변경
	 * 
	 * @param params
	 * @throws Exception
	 */
	void updateUserPassword(Map<String, Object> params);

}
