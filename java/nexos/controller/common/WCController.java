package nexos.controller.common;

import java.io.File;
import java.io.FileInputStream;
import java.io.OutputStream;
import java.net.InetAddress;
import java.net.URLEncoder;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import nexos.common.Consts;
import nexos.common.Util;
import nexos.common.spring.security.SecurityUserAuthenticationToken;
import nexos.service.common.WCService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.annotation.Secured;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.security.web.authentication.session.SessionAuthenticationStrategy;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

/**
 * Class: WMS 공통 컨트롤러<br>
 * Description: WMS Common Controller Class<br>
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
@Controller
@RequestMapping("/WC")
public class WCController extends CommonController {

	@Resource
	private WCService service;
	private InetAddress machineInfo;

	@Resource
	AuthenticationManager authenticationManager;

	@Resource
	SessionAuthenticationStrategy sessionAuthenticationStrategy;

	@Resource
	SecurityContextRepository securityContextRepository;

	/**
	 * Function Call
	 * 
	 * @param cmdParams
	 * @return
	 */
	@RequestMapping(value = "/callFn.do", method = RequestMethod.POST)
	public ResponseEntity<String> callFn(HttpServletRequest request,
			@RequestParam("P_CMD_PARAMS") String cmdParams) {

		ResponseEntity<String> result = null;

		Map<String, Object> params = getParameter(cmdParams);
		String oMsg = getResultMessage(params);
		if (!Consts.OK.equals(oMsg)) {
			result = getResponseEntityError(request, oMsg);
			return result;
		}

		try {
			result = getResponseEntity(request, service.callFn(params));
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	/**
	 * 즐겨찾기 삭제
	 * 
	 * @param user_Id
	 * @param program_Id
	 * @return
	 */
	@RequestMapping(value = "/deleteUserBookMark.do", method = RequestMethod.POST)
	public ResponseEntity<String> deleteUserBookMark(
			HttpServletRequest request,
			@RequestParam(Consts.PK_USER_ID) String user_id,
			@RequestParam("P_PROGRAM_ID") String program_id) {

		ResponseEntity<String> result = null;

		Map<String, Object> params = new HashMap<String, Object>();
		params.put(Consts.PK_USER_ID, user_id);
		params.put("P_PROGRAM_ID", program_id);
		try {
			result = getResponseEntity(request,
					service.deleteUserBookMark(params));
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	/**
	 * 엑셀 다운로드
	 * 
	 * @param request
	 * @param response
	 * @param queryId
	 * @param queryParams
	 * @param columnInfo
	 * @param excelTitle
	 * @param user_Id
	 * @return
	 */
	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/excelExport.do", method = RequestMethod.POST)
	public ResponseEntity<String> excelExport(HttpServletRequest request,
			HttpServletResponse response,
			@RequestParam(Consts.PK_QUERY_ID) String queryId,
			@RequestParam(Consts.PK_QUERY_PARAMS) String queryParams,
			@RequestParam("P_COLUMN_INFO") String columnInfo,
			@RequestParam("P_EXCEL_TITLE") String excelTitle,
			@RequestParam("P_EXPORT_TYPE") String exportType,
			@RequestParam(Consts.PK_USER_ID) String user_Id) {

		ResponseEntity<String> result = null;

		String oMsg = "";

		Map<String, Object> exportParams = getDataSet(columnInfo,
				"P_COLUMN_INFO");
		oMsg = getResultMessage(exportParams);
		if (!Consts.OK.equals(oMsg)) {
			result = getResponseEntityError(request, oMsg);
			return result;
		}

		exportParams.put(Consts.PK_QUERY_ID, queryId);
		Map<String, Object> mapParams = getParameter(queryParams);
		oMsg = getResultMessage(mapParams);
		if (!Consts.OK.equals(oMsg)) {
			result = getResponseEntityError(request, oMsg);
			return result;
		}
		exportParams.put(Consts.PK_QUERY_PARAMS, mapParams);
		exportParams.put("P_EXCEL_TITLE", excelTitle);
		exportParams.put("P_EXPORT_TYPE", exportType);
		exportParams.put(Consts.PK_USER_ID, user_Id);

		Map<String, Object> mapResult = null;
		try {
			exportParams.put("P_CONTEXT_URL", request.getRequestURL()
					.toString().replaceAll(request.getRequestURI(), ""));

			mapResult = service.excelExport(exportParams);
			oMsg = (String) mapResult.get(Consts.PK_O_MSG);
			if (!Consts.OK.equals(oMsg)) {
				result = getResponseEntitySubmitError(request, oMsg);
				return result;
			}
		} catch (Exception e) {
			result = getResponseEntitySubmitError(request, e);
			return result;
		}

		FileInputStream xlsFileInput = null;
		OutputStream responseOutput = null;
		File xlsFile = null;
		try {
			String xlsFileFullName = (String) mapResult
					.get("O_XLS_FILE_FULL_NM");
			;
			xlsFile = new File(xlsFileFullName);
			xlsFileInput = new FileInputStream(xlsFile);

			response.setContentType("application/download; charset=utf-8");
			response.setContentLength((int) xlsFile.length());
			response.setHeader("Cache-Control", "no-cache");
			response.setHeader("Pragma", "no-cache");
			response.setHeader("Expires", "0");

			// jQuery FileDownload Event 처리를 위한 Cookie 세팅
			Cookie fileDownloadCookie = new Cookie("neXosFileDownload", "true");
			fileDownloadCookie.setSecure(false);
			fileDownloadCookie.setMaxAge(1000);
			fileDownloadCookie.setPath("/");
			response.addCookie(fileDownloadCookie);

			String xlsFileName = null;
			if (Util.isIE(request.getHeader("User-Agent"))) {
				xlsFileName = URLEncoder.encode(xlsFile.getName(),
						Consts.CHARSET);
			} else {
				xlsFileName = new String(xlsFile.getName().getBytes(
						Consts.CHARSET), "ISO-8859-1");
			}
			response.setHeader("Content-Disposition", "attachment; filename=\""
					+ xlsFileName + "\";");
			response.setHeader("Content-Transfer-Encoding", "binary");

			responseOutput = response.getOutputStream();

			// 파일 기록
			byte[] buffer = new byte[4096];
			int bytesRead = -1;
			while ((bytesRead = xlsFileInput.read(buffer)) != -1) {
				responseOutput.write(buffer, 0, bytesRead);
			}
			responseOutput.flush();
		} catch (Exception e) {
			result = getResponseEntitySubmitError(request,
					"EXCEL 파일 다운로드 중 오류가 발생했습니다.");
		} finally {
			try {
				if (xlsFileInput != null) {
					xlsFileInput.close();
				}
			} catch (Exception e) {
			}
			try {
				if (responseOutput != null) {
					responseOutput.close();
				}
			} catch (Exception e) {
			}
			if (xlsFile != null) {
				try {
					xlsFile.delete();
				} catch (Exception e) {
				}
			}
		}
		return result;
	}

	/**
	 * 팝업 데이터 조회
	 * 
	 * @param queryId
	 * @param queryParams
	 * @return
	 */
	@RequestMapping(value = "/getDataSet.do", method = RequestMethod.POST)
	public ResponseEntity<String> getDataSet(HttpServletRequest request,
			@RequestParam(Consts.PK_QUERY_ID) String queryId,
			@RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

		ResponseEntity<String> result = null;

		Map<String, Object> params = getParameter(queryParams);
		String oMsg = getResultMessage(params);
		if (!Consts.OK.equals(oMsg)) {
			result = getResponseEntityError(request, oMsg);
			return result;
		}

		try {
			result = getResponseEntity(request,
					service.getDataSet(queryId, params));
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	/**
	 * 데이터 암호화(SHA-512)
	 * 
	 * @param queryId
	 * @param queryParams
	 * @return
	 */
	@RequestMapping(value = "/getEncryptHash.do", method = RequestMethod.POST)
	public ResponseEntity<String> getEncryptHash(HttpServletRequest request,
			@RequestParam("P_ENCRYPT_PARAMS") String encryptParams,
			@RequestParam(Consts.PK_USER_ID) String user_Id) {

		ResponseEntity<String> result = null;

		Map<String, Object> params = getParameter(encryptParams);
		String oMsg = getResultMessage(params);
		if (!Consts.OK.equals(oMsg)) {
			result = getResponseEntityError(request, oMsg);
			return result;
		}

		try {
			result = getResponseEntity(request, service.getEncryptHash(params));
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	/**
	 * 데이터 암호화(AES-128)
	 * 
	 * @param queryId
	 * @param queryParams
	 * @return
	 */
	@RequestMapping(value = "/getEncryptString.do", method = RequestMethod.POST)
	public ResponseEntity<String> getEncryptString(HttpServletRequest request,
			@RequestParam("P_ENCRYPT_PARAMS") String encryptParams,
			@RequestParam(Consts.PK_USER_ID) String user_Id) {

		ResponseEntity<String> result = null;

		Map<String, Object> params = getParameter(encryptParams);
		String oMsg = getResultMessage(params);
		if (!Consts.OK.equals(oMsg)) {
			result = getResponseEntityError(request, oMsg);
			return result;
		}

		try {
			result = getResponseEntity(request,
					service.getEncryptString(params));
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	/**
	 * 로그인 처리
	 * 
	 * @param request
	 * @param user_Id
	 * @param user_Pwd
	 * @return
	 */
	@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
	@RequestMapping(value = "/getLogin.do", method = RequestMethod.POST)
	public ResponseEntity<String> getLogin(HttpServletRequest request,
			HttpServletResponse response,
			@RequestParam(Consts.PK_USER_ID) String user_Id,
			@RequestParam("P_USER_PWD") String user_Pwd) {

		// ResponseEntity<String> result = null;
		//
		// Map<String, Object> params = new HashMap<String, Object>();
		// params.put(Consts.PK_USER_ID, user_Id);
		// params.put("P_USER_PWD", user_Pwd);
		//
		// try {
		// result = getResponseEntity(request, service.getLogin(params));
		// HttpSession session = request.getSession();
		// session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY,
		// SecurityContextHolder.getContext());
		// } catch (Exception e) {
		// result = getResponseEntityError(request, e);
		// }
		//
		// return result;
		ResponseEntity<String> result = null;

		ServletRequestAttributes requestAttrib = (ServletRequestAttributes) RequestContextHolder
				.currentRequestAttributes();
		HttpServletRequest req = requestAttrib.getRequest();
		Map<String, Object> params = new HashMap<String, Object>();
		String remoteAddr = req.getLocalAddr();
		params.put(Consts.PK_USER_ID, user_Id);
		params.put("P_USER_PWD", user_Pwd);
		params.put("P_CLIENT_IP", remoteAddr);
		params.put("P_REG_USER_ID", user_Id);

		try {
			Map<String, Object> resultMap = service.login(params);

			// 다른 사용자로 로그인되어 있을 경우 logout후 로그인 처리
			Authentication auth = SecurityContextHolder.getContext()
					.getAuthentication();
			if (auth != null
					&& auth.getPrincipal() instanceof SecurityUserAuthenticationToken) {
				if (!auth.getName().equals(user_Id)) {
					throw new RuntimeException(
							"해당 세션은 다른 사용자로 이미 로그인 되어 있습니다.\n\n로그아웃 후 로그인하십시오.");
				}
			}

			if (auth == null || auth instanceof AnonymousAuthenticationToken) {
				// 신규 로그인 처리
				UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(
						user_Id, user_Pwd);
				auth = authenticationManager.authenticate(authenticationToken);
				SecurityContextHolder.getContext().setAuthentication(auth);
				HttpSession session = request.getSession(true);
				System.out
						.println("login session id: >>>>>>" + session.getId());
				resultMap.put("_LOGIN_SESSION_ID", session.getId());
				SecurityUserAuthenticationToken securityUserToken = (SecurityUserAuthenticationToken) auth
						.getPrincipal();
				securityUserToken.setUserInfo(resultMap);
				sessionAuthenticationStrategy.onAuthentication(auth, request,
						response);
				securityContextRepository.saveContext(
						SecurityContextHolder.getContext(), request, response);
				System.out.println("getInitializeCount: "
						+ String.valueOf(SecurityContextHolder
								.getInitializeCount()));
			} else {
				// 이미 로그인되어 있을 경우 기존 정보 리턴
				resultMap = ((SecurityUserAuthenticationToken) auth
						.getPrincipal()).getUserInfo();
			}

			result = getResponseEntity(request, resultMap);
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	/**
	 * 로그아웃 처리
	 * 
	 * @param params
	 *            조회조건
	 */
	@Secured("IS_AUTHENTICATED_ANONYMOUSLY")
	@RequestMapping(value = "/getLogout.do", method = RequestMethod.POST)
	public ResponseEntity<String> getLogout(HttpServletRequest request,
			HttpServletResponse response,
			@RequestParam(Consts.PK_USER_ID) String user_Id) {

		// ResponseEntity<String> result = null;
		//
		// Map<String, Object> params = new HashMap<String, Object>();
		// params.put(Consts.PK_USER_ID, user_Id);
		//
		// try {
		// result = getResponseEntity(request, service.getLogout(params) ?
		// Consts.YES : Consts.NO);
		// HttpSession session = request.getSession();
		// session.removeAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY);
		// } catch (Exception e) {
		// result = getResponseEntityError(request, e);
		// }
		//
		// return result;
		
		Map<String, Object> params = new HashMap<String, Object>();
		
		ResponseEntity<String> result = null;
		params.put(Consts.PK_USER_ID, user_Id);

		try {
			Authentication auth = SecurityContextHolder.getContext()
					.getAuthentication();
			if (auth != null) {
				new SecurityContextLogoutHandler().logout(request, response,
						auth);
				//service.logout(params);
			}
			result = getResponseEntity(request, Consts.OK);
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	/**
	 * 시스템 정보를 반환하다.
	 * 
	 * @return InetAddress
	 */
	public InetAddress getMachineInfo() {
		try {
			machineInfo = InetAddress.getLocalHost();
		} catch (UnknownHostException e) {
			e.printStackTrace();
		}
		return machineInfo;
	}

	/**
	 * WAS 상태 체크
	 * 
	 * @param request
	 * @param response
	 * @throws Exception
	 */
	@RequestMapping(value = "/getServerStatus.do", method = RequestMethod.POST)
	public ResponseEntity<String> getServerStatus(HttpServletRequest request) {

		ResponseEntity<String> result = null;

		try {
			Authentication auth = SecurityContextHolder.getContext()
					.getAuthentication();
			if (auth != null
					&& auth.getPrincipal() instanceof SecurityUserAuthenticationToken) {
				result = getResponseEntity(request, Consts.OK);
			} else {
				throw new AccessDeniedException("로그인 세션 정보가 없습니다.");
			}
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	@SuppressWarnings("unchecked")
	@RequestMapping(value = "/getSessionUserInfo.do", method = RequestMethod.POST)
	public ResponseEntity<String> getSessionUserInfo(HttpServletRequest request) {

		ResponseEntity<String> result = null;

		try {
			Authentication auth = SecurityContextHolder.getContext()
					.getAuthentication();
			if (auth != null
					&& auth.getPrincipal() instanceof SecurityUserAuthenticationToken) {

				SecurityUserAuthenticationToken securityUserToken = (SecurityUserAuthenticationToken) auth
						.getPrincipal();
				HttpSession session = request.getSession(false);
				if (securityUserToken.getUserInfo().get("_LOGIN_SESSION_ID") == null) {
					if (session != null) {
						securityUserToken.getUserInfo().put(
								"_LOGIN_SESSION_ID", session.getId());
					}
				}

				result = getResponseEntity(request,
						securityUserToken.getUserInfo());
			} else {
				throw new RuntimeException("로그인 세션 정보가 없습니다.");
			}
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	/**
	 * 사용자 메뉴 가져오기
	 * 
	 * @param params
	 *            조회조건
	 */
	@RequestMapping(value = "/getUserProgramBookMark.do", method = RequestMethod.POST)
	public ResponseEntity<String> getUserProgramBookMark(
			HttpServletRequest request,
			@RequestParam(Consts.PK_USER_ID) String user_Id) {

		ResponseEntity<String> result = null;

		Map<String, Object> params = new HashMap<String, Object>();
		params.put(Consts.PK_USER_ID, user_Id);

		try {
			result = getResponseEntity(request,
					service.getUserProgramBookMark(params));
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	/**
	 * 사용자 메뉴 가져오기
	 * 
	 * @param params
	 *            조회조건
	 */
	@RequestMapping(value = "/getUserProgramMenu.do", method = RequestMethod.POST)
	public ResponseEntity<String> getUserProgramMenu(
			HttpServletRequest request,
			@RequestParam(Consts.PK_USER_ID) String user_Id) {

		ResponseEntity<String> result = null;

		Map<String, Object> params = new HashMap<String, Object>();
		params.put(Consts.PK_USER_ID, user_Id);

		try {
			result = getResponseEntity(request,
					service.getUserProgramMenu(params));
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	@RequestMapping(value = "/reloadSqlMap.do", method = RequestMethod.POST)
	public ResponseEntity<String> reloadSqlMap(HttpServletRequest request) {
		ResponseEntity<String> result = null;

		try {
			result = getResponseEntity(request, service.reloadSqlMap());
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	/**
	 * 그리드 컬럼순서 저장
	 * 
	 * @param user_Id
	 * @param program_Id
	 * @param grid_Id
	 * @param column_Position
	 * @param reg_User_Id
	 * @return
	 */
	@RequestMapping(value = "/saveGridColumnOrder.do", method = RequestMethod.POST)
	public ResponseEntity<String> saveGridColumnOrder(
			HttpServletRequest request,
			@RequestParam(Consts.PK_USER_ID) String user_Id,
			@RequestParam("P_PROGRAM_ID") String program_Id,
			@RequestParam("P_GRID_ID") String grid_Id,
			@RequestParam("P_COLUMN_POSITION") String column_Position,
			@RequestParam("P_REG_USER_ID") String reg_User_Id) {

		ResponseEntity<String> result = null;

		Map<String, Object> params = new HashMap<String, Object>();
		;
		params.put(Consts.PK_USER_ID, user_Id);
		params.put("P_PROGRAM_ID", program_Id);
		params.put("P_GRID_ID", grid_Id);
		params.put("P_COLUMN_POSITION", column_Position);
		params.put("P_REG_USER_ID", reg_User_Id);

		try {
			result = getResponseEntity(request,
					service.saveGridColumnOrder(params));
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	/**
	 * 즐겨찾기 추가
	 * 
	 * @param user_Id
	 * @param program_Id
	 * @return
	 */
	@RequestMapping(value = "/saveUserBookMark.do", method = RequestMethod.POST)
	public ResponseEntity<String> saveUserBookMark(HttpServletRequest request,
			@RequestParam(Consts.PK_USER_ID) String user_id,
			@RequestParam("P_PROGRAM_ID") String program_id,
			@RequestParam("P_EXE_LEVEL1") String exe_level1,
			@RequestParam("P_EXE_LEVEL2") String exe_level2,
			@RequestParam("P_EXE_LEVEL3") String exe_level3,
			@RequestParam("P_EXE_LEVEL4") String exe_level4,
			@RequestParam("P_FAVORITE_YN") String favorite_yn,
			@RequestParam("P_REG_USER_ID") String reg_user_id) {

		ResponseEntity<String> result = null;

		Map<String, Object> params = new HashMap<String, Object>();
		params.put(Consts.PK_USER_ID, user_id);
		params.put("P_PROGRAM_ID", program_id);
		params.put("P_EXE_LEVEL1", exe_level1);
		params.put("P_EXE_LEVEL2", exe_level2);
		params.put("P_EXE_LEVEL3", exe_level3);
		params.put("P_EXE_LEVEL4", exe_level4);
		params.put("P_FAVORITE_YN", favorite_yn);
		params.put("P_REG_USER_ID", reg_user_id);
		try {
			result = getResponseEntity(request,
					service.saveUserBookMark(params));
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}

	/**
	 * 사용자 비밀번호 변경
	 * 
	 * @param request
	 * @param user_Id
	 * @param user_Pwd
	 * @return
	 */
	@RequestMapping(value = "/setUserPassword.do", method = RequestMethod.POST)
	public ResponseEntity<String> setUserPassword(HttpServletRequest request,
			@RequestParam(Consts.PK_USER_ID) String user_Id,
			@RequestParam("P_USER_PWD") String user_Pwd) {

		ResponseEntity<String> result = null;

		Map<String, Object> params = new HashMap<String, Object>();
		params.put("P_JOB_SEQ", 1);
		params.put(Consts.PK_USER_ID, user_Id);
		params.put("P_USER_PWD", user_Pwd);
		params.put("P_CLIENT_IP", getMachineInfo().getHostAddress());
		params.put("DEFAULT_PW", "N");
		params.put("P_REG_USER_ID", user_Id);

		try {
			result = getResponseEntity(request, service.setUserPassword(params));
		} catch (Exception e) {
			result = getResponseEntityError(request, e);
		}

		return result;
	}
}
