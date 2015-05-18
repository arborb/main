package nexos.service.common;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Hashtable;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.common.ibatis.JsonDataSet;
import nexos.common.spring.security.CommonEncryptor;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.orm.ibatis.SqlMapClientFactoryBean;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Class: WCService<br>
 * Description: WMS Common 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 * 
 *          <pre style="font-family: NanumGothicCoding, GulimChe">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2013-01-01    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 * </pre>
 */
@Service("WC")
// 보안정책상 로그인전 접근가능하도록 처리
public class WCService {

	// private final Logger logger = LoggerFactory.getLogger(WCService.class);

	/**
	 * DAO 주입처리하기
	 */
	@Resource
	private WCDAO dao;

	@Resource
	private CommonDAO common;

	@Resource
	private CommonEncryptor commonEncryptor;

	// private InetAddress machineInfo;

	/**
	 * Session 관련(로그인/아웃) 주입처리하기
	 */
	@Resource
	private WCSession session;

	@Resource
	private PlatformTransactionManager transactionManager;

	@Autowired
	private ApplicationContext appContext;

	private static Hashtable<String, Integer> loginUsers = new Hashtable<String, Integer>();

	/**
	 * Function Call
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("rawtypes")
	public Map callFn(Map<String, Object> params) throws Exception {

		HashMap<String, Object> result = new HashMap<String, Object>();
		result.put(Consts.PK_O_MSG, Consts.OK);

		final String PK_O_RESULT_DATA = "O_RESULT_DATA";
		String CMD = (String) params.get("P_CMD");
		String PARAMS = (String) params.get("P_PARAMS");
		String[] callParams = PARAMS.split("^");

		if ("GENKEY".equalsIgnoreCase(CMD)) {
			result.put(PK_O_RESULT_DATA, Boolean.toString(commonEncryptor
					.generateKeyFiles(callParams[0], callParams[1])));
		} else if ("ENCRSA0000".equalsIgnoreCase(CMD)) {
			result.put(PK_O_RESULT_DATA,
					commonEncryptor.encryptRSA(callParams[0]));
		} else if ("DECRSA0000".equalsIgnoreCase(CMD)) {
			result.put(PK_O_RESULT_DATA,
					commonEncryptor.decryptRSA(callParams[0]));
		} else if ("ENCRSA0010".equalsIgnoreCase(CMD)) {
			result.put(PK_O_RESULT_DATA, commonEncryptor.encryptRSA(
					callParams[0], "nexos/config/publicKey_0010.xml"));
		} else if ("DECRSA0010".equalsIgnoreCase(CMD)) {
			result.put(PK_O_RESULT_DATA, commonEncryptor.decryptRSA(
					callParams[0], "nexos/config/privateKey_0010.xml"));
		} else {
			result.put(Consts.PK_O_MSG, "정의되지 않은 명령입니다.");
		}

		return result;
	}

	/**
	 * 즐겨찾기 삭제
	 * 
	 * @param params
	 *            조회조건
	 */
	public String deleteUserBookMark(Map<String, Object> params) {
		// 즐겨찾기 저장
		String result = Consts.ERROR;

		TransactionStatus ts = transactionManager
				.getTransaction(new DefaultTransactionDefinition());
		try {
			dao.deleteBookMark(params);

			transactionManager.commit(ts);
			result = Consts.OK;
		} catch (Exception e) {
			transactionManager.rollback(ts);
			throw new RuntimeException(e.getMessage());
		}

		return result;
	}

	/**
	 * Excel 파일 생성 후 생성된 서버의 파일명 리턴
	 * 
	 * @param params
	 *            조회조건
	 */
	@SuppressWarnings("rawtypes")
	public Map excelExport(Map<String, Object> params) throws Exception {

		return dao.excelExport(params);
	}

	// /**
	// * 로그인 처리 및 사용자 정보 리턴
	// *
	// * @param params 조회조건
	// */
	// @SuppressWarnings({"rawtypes", "unchecked"})
	// // 보안정책상 로그인전 접근가능하도록 처리
	// @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
	// public Map getLogin(Map<String, Object> params) {
	//
	// Map result = null;
	//
	// // 1. 로그인 데이터 조회하기
	// Map<String, String> userInfo = (Map)dao.getLogin(params);
	// String userId = userInfo.get("USER_ID");
	//
	// try {
	// // 2. 스프링 보안 처리
	// session.setUserAuthentication(appContext, userInfo);
	// // 3. 세션변수 세팅
	// result = session.mappingSession(dao, userInfo);
	// } catch (Exception e) {
	// throw new RuntimeException("로그인 세션처리 중 오류가 발생하였습니다.");
	// }
	//
	// // 4. 로그인 기록 처리하기
	// String user_Id = (String)result.get("USER_ID");
	// String clientIP = (String)result.get("CLIENT_IP");
	// TransactionStatus ts = transactionManager.getTransaction(new
	// DefaultTransactionDefinition());
	// try {
	// dao.updateLoginInfo(user_Id, clientIP, user_Id);
	// transactionManager.commit(ts);
	// } catch (Exception e) {
	// transactionManager.rollback(ts);
	// throw new RuntimeException(e.getMessage());
	// }
	//
	// return result;
	// }
	//
	// /**
	// * 로그아웃 처리
	// *
	// * @param params 조회조건
	// */
	// @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
	// public boolean getLogout(Map<String, Object> params) {
	// // 로그아웃 기록
	// dao.getLogout(params);
	//
	// // 스프링 보안해지
	// session.removeUserAuthentication();
	// return true;
	// }

	/**
	 * List형태(조회데이터들)의 값을 되돌려 주는 호출 처리
	 */
	public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

		return common.getJsonDataSet(queryId, params);
	}

	/**
	 * 데이터 암호화(SHA-512)
	 * 
	 * @param params
	 *            암호화할 데이터
	 */
	@SuppressWarnings("rawtypes")
	public Map getEncryptHash(Map<String, Object> params) throws Exception {

		HashMap<String, Object> result = new HashMap<String, Object>();

		Iterator encryptKeys = params.keySet().iterator();
		while (encryptKeys.hasNext()) {
			String encryptKey = (String) encryptKeys.next();
			String encryptVal = commonEncryptor.encryptHASH((String) params
					.get(encryptKey));
			result.put(encryptKey, encryptVal);
		}
		return result;
	}

	/**
	 * 데이터 암호화(AES-128)
	 * 
	 * @param params
	 *            암호화할 데이터
	 */
	@SuppressWarnings("rawtypes")
	public Map getEncryptString(Map<String, Object> params) throws Exception {

		HashMap<String, Object> result = new HashMap<String, Object>();

		Iterator encryptKeys = params.keySet().iterator();
		while (encryptKeys.hasNext()) {
			String encryptKey = (String) encryptKeys.next();
			String encryptVal = commonEncryptor.encrypt((String) params
					.get(encryptKey));
			result.put(encryptKey, encryptVal);
		}

		return result;
	}

	/**
	 * 시스템 정보를 반환하다.
	 * 
	 * @return InetAddress
	 * 
	 *         public InetAddress getMachineInfo() { /* try { machineInfo =
	 *         InetAddress.getLocalHost(); } catch (UnknownHostException e) {
	 *         e.printStackTrace(); } return machineInfo;
	 * 
	 *         try { Enumeration<NetworkInterface> networkInterfaces =
	 *         NetworkInterface .getNetworkInterfaces(); while
	 *         (networkInterfaces.hasMoreElements()) { NetworkInterface ni =
	 *         networkInterfaces.nextElement(); Enumeration<InetAddress> nias =
	 *         ni.getInetAddresses(); while (nias.hasMoreElements()) {
	 *         InetAddress ia = nias.nextElement(); if (!ia.isLinkLocalAddress()
	 *         && !ia.isLoopbackAddress() && ia instanceof Inet4Address) {
	 *         return ia; } } } } catch (SocketException e) {
	 *         System.out.println("unable to get current IP " + e.getMessage());
	 *         } return null; }
	 */

	/**
	 * 사용자 프로그램 메뉴 정보를 리턴
	 * 
	 * @param params
	 *            조회조건
	 */
	@SuppressWarnings("rawtypes")
	public List getUserProgramBookMark(Map<String, Object> params) {
		// 메뉴정보 가져오기
		List listResult = dao.getUserProgramBookMark(params);
		return dao.getUserProgramBookMarkTree(listResult);
	}

	/**
	 * 사용자 프로그램 메뉴 정보를 리턴
	 * 
	 * @param params
	 *            조회조건
	 */
	@SuppressWarnings("rawtypes")
	public List getUserProgramMenu(Map<String, Object> params) {
		// 메뉴정보 가져오기
		List listResult = dao.getUserProgramMenu(params);
		return dao.getUserProgramMenuTree(listResult);
	}

	/**
	 * 로그인 처리 및 사용자 정보 리턴
	 * 
	 * @param params
	 *            조회조건
	 * @throws UnknownHostException
	 */
	@SuppressWarnings({ "rawtypes", "unchecked" })
	@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
	public Map login(Map<String, Object> params) throws UnknownHostException {

		Map result = null;

		// 1. 로그인 데이터 조회하기
		Map<String, String> userInfo = dao.getLogin(params);
		try {
			// 2. 세션변수 세팅
			result = mappingSession(userInfo);
		} catch (Exception e) {
			throw new RuntimeException("로그인 세션처리 중 오류가 발생하였습니다.");
		}

		// 4. 로그인 기록 처리하기
		String user_Id = (String) result.get("USER_ID");
		String clientIP = (String) params.get("P_CLIENT_IP");
		/*
		 * System.out.println("getHostAddress: " +
		 * getMachineInfo().getHostAddress() + "  --  " +
		 * "getCanonicalHostName: " + getMachineInfo().getCanonicalHostName() +
		 * "  --  " + "getAddress: " + getMachineInfo().getAddress() + "  --  "
		 * + "toString: " + getMachineInfo().toString() + "  --  " +
		 * "getHostName: " + getMachineInfo().getHostName());
		 */

		TransactionStatus ts = transactionManager
				.getTransaction(new DefaultTransactionDefinition());
		try {
			dao.updateLoginInfo(user_Id, clientIP, user_Id);

			transactionManager.commit(ts);
		} catch (Exception e) {
			transactionManager.rollback(ts);
			throw new RuntimeException(e.getMessage());
		}

		return result;
	}

	@SuppressWarnings({ "rawtypes", "unchecked" })
	public Map mappingSession(Map userInfo) throws UnknownHostException {

		Map result = null;

		final String PK_USER_ID = "USER_ID";
		final String PK_CLIENT_IP = "CLIENT_IP";

		String user_Id = (String) userInfo.get(PK_USER_ID);

		// CLIENT IP
		ServletRequestAttributes requestAttrib = (ServletRequestAttributes) RequestContextHolder
				.currentRequestAttributes();
		HttpServletRequest request = requestAttrib.getRequest();

		String remoteAddr;
		if (request != null) {
			remoteAddr = request.getRemoteAddr();
		} else {
			remoteAddr = "localhost";
		}
		InetAddress address = InetAddress.getLocalHost();

		System.out.println("++++++getRemoteAddr: " + request.getRemoteAddr());
		System.out.println("++++++getLocalAddr: " + request.getLocalAddr());
		System.out.println("++++++getHostName: " + address.getHostName());

		HttpServletRequest req = ((ServletRequestAttributes) RequestContextHolder
				.currentRequestAttributes()).getRequest();
		String ip = req.getHeader("X-FORWARDED-FOR");
		System.out.println("++++++ip: " + ip);

		/*
		 * System.out.println(">>>>> remoteAddr: " + request.getRemoteAddr() +
		 * "  --  getRemoteUser: " + request.getRemoteUser() +
		 * "  --  getLocalName: " + request.getLocalName() +
		 * "  --  getServerName: " + request.getServerName() +
		 * "  --  remoteHost: " + request.getRemoteHost());
		 */
		// 자동출력 프린터 정보 읽기
		List userSysInfoList = dao.getCSUserSysInfo(user_Id, remoteAddr);
		Map<String, String> userSysInfo = null;
		if (userSysInfoList != null && userSysInfoList.size() > 0) {
			userSysInfo = (HashMap) userSysInfoList.get(0);
		} else {
			userSysInfo = new HashMap<String, String>();
			userSysInfo.put(PK_CLIENT_IP, remoteAddr);
		}

		result = new HashMap<String, String>();
		result.putAll(userInfo);
		if (userSysInfo != null) {
			result.putAll(userSysInfo);
		}

		return result;
	}

	/**
	 * sqlMap 리로드
	 * 
	 * @return
	 */
	public String reloadSqlMap() {

		SqlMapClientFactoryBean factory = appContext
				.getBean(SqlMapClientFactoryBean.class);
		return dao.reloadSqlMap(factory);
	}

	/**
	 * 그리드 컬럼순서 저장
	 * 
	 * @param params
	 *            조회조건
	 */
	public String saveGridColumnOrder(Map<String, Object> params) {
		String result = Consts.ERROR;

		TransactionStatus ts = transactionManager
				.getTransaction(new DefaultTransactionDefinition());
		try {
			dao.saveGridColumnOrder(params);

			transactionManager.commit(ts);
			result = Consts.OK;
		} catch (Exception e) {
			transactionManager.rollback(ts);
			throw new RuntimeException(e.getMessage());
		}

		return result;
	}

	/**
	 * 즐겨찾기를 추가
	 * 
	 * @param params
	 *            조회조건
	 */
	public String saveUserBookMark(Map<String, Object> params) {
		// 즐겨찾기 저장
		String result = Consts.ERROR;

		TransactionStatus ts = transactionManager
				.getTransaction(new DefaultTransactionDefinition());
		try {
			dao.saveBookMark(params);

			transactionManager.commit(ts);
			result = Consts.OK;
		} catch (Exception e) {
			transactionManager.rollback(ts);
			throw new RuntimeException(e.getMessage());
		}

		return result;
	}

	/**
	 * 사용자 비밀번호 변경
	 * 
	 * @param params
	 *            조회조건
	 */
	public String setUserPassword(Map<String, Object> params) {
		String result = Consts.ERROR;

		TransactionStatus ts = transactionManager
				.getTransaction(new DefaultTransactionDefinition());
		try {
			dao.updateUserPassword(params);

			transactionManager.commit(ts);
			result = Consts.OK;
		} catch (Exception e) {
			transactionManager.rollback(ts);
			throw new RuntimeException(e.getMessage());
		}

		return result;
	}

}