package nexos.service.cs;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;
import nexos.common.spring.security.CommonEncryptor;

import org.springframework.stereotype.Repository;

/**
 * Class: CS01010EDAOImpl<br>
 * Description: CS01010E DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
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
@Repository("CS01010EDAO")
public class CS01010EDAOImpl implements CS01010EDAO {

	// private final Logger logger =
	// LoggerFactory.getLogger(CM02020EDAOImpl.class);

	@Resource
	private NexosDAO nexosDAO;

	@Resource
	private CommonEncryptor commonEncryptor;

	private InetAddress machineInfo;

	@SuppressWarnings("rawtypes")
	@Override
	public Map callUserCopy(Map<String, Object> params) throws Exception {

		final String CS_USER_COPY_ID = "CS_USER_COPY";

		// 비밀번호 암호화 처리
		if (params.containsKey("P_USER_PWD")) {
			params.put("P_USER_PWD",
					getEncryptUserPwd((String) params.get("P_USER_PWD")));
		}

		return nexosDAO.callSP(CS_USER_COPY_ID, params);
	}

	@SuppressWarnings("rawtypes")
	@Override
	public Map callUserDelete(Map<String, Object> params) throws Exception {

		final String CS_USER_COPY_ID = "CS_USER_DELETE";

		return nexosDAO.callSP(CS_USER_COPY_ID, params);
	}

	private String getEncryptUserPwd(String user_Pwd) {

		String result = user_Pwd;

		if (result == null) {
			throw new RuntimeException("비밀번호가 지정되지 않았습니다.");
		}

		// 암호화 되어 있는 비밀번호일 경우는 암호화 처리하지 않음
		if (result.startsWith("ENC(") && result.endsWith(")")) {
			return result;
		}

		try {
			result = "ENC(" + commonEncryptor.encryptHASH(result) + ")";
		} catch (Exception e) {
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

	@SuppressWarnings("unchecked")
	@Override
	public void save(Map<String, Object> params) throws Exception {

		List<Map<String, Object>> masterDS = (List<Map<String, Object>>) params
				.get(Consts.PK_DS_MASTER);
		List<Map<String, Object>> detailDS = (List<Map<String, Object>>) params
				.get(Consts.PK_DS_DETAIL);
		List<Map<String, Object>> subDS = (List<Map<String, Object>>) params
				.get(Consts.PK_DS_SUB);
		List<Map<String, Object>> subDS1 = (List<Map<String, Object>>) params
				.get(Consts.PK_DS_SUB1);

		String user_Id = (String) params.get(Consts.PK_REG_USER_ID);

		final String PRORAM_ID = "CS01010E";

		final String USER_TABLE_NM = "CSUSER"; // 사용자마스터
		final String CENTER_TABLE_NM = "CSUSERCENTER"; // 사용자별운영센터마스터
		final String BU_TABLE_NM = "CSUSERBU"; // 사용자별운영브랜드마스터
		final String MD_TABLE_NM = "CSUSERBRAND"; // 사용자별운영브랜드마스터

		final String USER_INSERT_ID = PRORAM_ID + ".INSERT_" + USER_TABLE_NM;
		final String USER_UPDATE_ID = PRORAM_ID + ".UPDATE_" + USER_TABLE_NM;
		final String USER_DELETE_ID = PRORAM_ID + ".DELETE_" + USER_TABLE_NM;

		final String CENTER_INSERT_ID = PRORAM_ID + ".INSERT_"
				+ CENTER_TABLE_NM;
		final String CENTER_DELETE_ID = PRORAM_ID + ".DELETE_"
				+ CENTER_TABLE_NM;

		final String BU_INSERT_ID = PRORAM_ID + ".INSERT_" + BU_TABLE_NM;
		final String BU_DELETE_ID = PRORAM_ID + ".DELETE_" + BU_TABLE_NM;

		final String MD_INSERT_ID = PRORAM_ID + ".INSERT_" + MD_TABLE_NM;
		final String MD_DELETE_ID = PRORAM_ID + ".DELETE_" + MD_TABLE_NM;
		int msCnt = masterDS.size();
		if (msCnt > 0) {
			for (int i = 0; i < msCnt; i++) {
				Map<String, Object> rowData = masterDS.get(i);
				rowData.put(Consts.PK_REG_USER_ID, user_Id);

				String crud = (String) rowData.get(Consts.PK_CRUD);
				if (Consts.DV_CRUD_C.equals(crud)) {
					if (rowData.containsKey("P_USER_PWD")) {
						rowData.put("P_USER_PWD",
								getEncryptUserPwd((String) rowData
										.get("P_USER_PWD")));
					}
					nexosDAO.insert(USER_INSERT_ID, rowData);
				} else if (Consts.DV_CRUD_U.equals(crud)) {
					if (rowData.containsKey("P_USER_PWD")) {
						rowData.put("P_USER_PWD",
								getEncryptUserPwd((String) rowData
										.get("P_USER_PWD")));
					}

					// 1년이내 같은 같은 비밀번호가 있는지 조회
					Map<String, String> resultMap = null;
					List listResult = nexosDAO.list("WC.GET_PASSHISTORY",
							masterDS.get(0));
					resultMap = (Map<String, String>) listResult.get(0);
					if (!String.valueOf(resultMap.get("PWD_COUNT")).equals("0")) {
						throw new RuntimeException("1년내 사용한 비밀번호는 재사용이 불가합니다.");
					}

					nexosDAO.update(USER_UPDATE_ID, rowData);

					// 사용자 비밀번호 내역에 저장한다.
					rowData.put("P_CLIENT_IP", getMachineInfo()
							.getHostAddress());
					rowData.put("P_CLIENT_NAME", getMachineInfo().getHostName());
					nexosDAO.insert("WC.INSERT_CSUSERPASSINFO", rowData);

					// 관리자가 사용자의 비번을 변경시 DEFAULT_PW를 "Y"로 변경하여 초기화 되었음을 알린다.
					HashMap<String, Object> resetMap = new HashMap<String, Object>();
					resetMap.put("DEFAULT_PW", "Y");
					resetMap.put("P_USER_ID", rowData.get("P_USER_ID"));
					nexosDAO.update("WC.UPDATE_CSUSERPWRESET", resetMap);
				} else if (Consts.DV_CRUD_D.equals(crud)) {
					nexosDAO.delete(USER_DELETE_ID, rowData);
				}
			}
		}

		int dsCnt = detailDS.size();
		if (dsCnt > 0) {
			for (int i = 0; i < dsCnt; i++) {
				Map<String, Object> rowData = detailDS.get(i);
				rowData.put(Consts.PK_REG_USER_ID, user_Id);

				String crud = (String) rowData.get(Consts.PK_CRUD);
				if (Consts.DV_CRUD_C.equals(crud)) {
					nexosDAO.insert(CENTER_INSERT_ID, rowData);
				} else if (Consts.DV_CRUD_D.equals(crud)) {
					nexosDAO.delete(CENTER_DELETE_ID, rowData);
				}
			}
		}

		int ssCnt = subDS.size();
		if (ssCnt > 0) {
			for (int i = 0; i < ssCnt; i++) {
				Map<String, Object> rowData = subDS.get(i);
				rowData.put(Consts.PK_REG_USER_ID, user_Id);

				String crud = (String) rowData.get(Consts.PK_CRUD);
				if (Consts.DV_CRUD_C.equals(crud)) {
					nexosDAO.insert(BU_INSERT_ID, rowData);
				} else if (Consts.DV_CRUD_D.equals(crud)) {
					nexosDAO.delete(BU_DELETE_ID, rowData);
				}
			}
		}

		int ss1Cnt = subDS1.size();
		if (ss1Cnt > 0) {
			for (int i = 0; i < ss1Cnt; i++) {
				Map<String, Object> rowData = subDS1.get(i);
				rowData.put(Consts.PK_REG_USER_ID, user_Id);

				String crud = (String) rowData.get(Consts.PK_CRUD);
				if (Consts.DV_CRUD_C.equals(crud)) {
					nexosDAO.insert(MD_INSERT_ID, rowData);
				} else if (Consts.DV_CRUD_D.equals(crud)) {
					nexosDAO.delete(MD_DELETE_ID, rowData);
				}
			}
		}

	}

	@SuppressWarnings("unchecked")
	@Override
	public void saveUserProgram(Map<String, Object> params) throws Exception {

		List<Map<String, Object>> masterDS = (List<Map<String, Object>>) params
				.get(Consts.PK_DS_MASTER);

		String user_Id = (String) params.get(Consts.PK_REG_USER_ID);

		final String PRORAM_ID = "CS01010E";

		final String TABLE_NM = "CSUSERPROGRAM"; // 사용자별프로그램마스터

		final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
		final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
		final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;

		int msCnt = masterDS.size();
		if (msCnt > 0) {
			for (int i = 0; i < msCnt; i++) {
				Map<String, Object> rowData = masterDS.get(i);
				rowData.put(Consts.PK_REG_USER_ID, user_Id);

				String crud = (String) rowData.get(Consts.PK_CRUD);
				if (Consts.DV_CRUD_C.equals(crud)) {
					nexosDAO.insert(INSERT_ID, rowData);
				} else if (Consts.DV_CRUD_U.equals(crud)) {
					nexosDAO.update(UPDATE_ID, rowData);
				} else if (Consts.DV_CRUD_D.equals(crud)) {
					nexosDAO.delete(DELETE_ID, rowData);
				}
			}
		}
	}

}
