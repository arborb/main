package nexos.service.common;

import java.io.File;
import java.io.FileOutputStream;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.Util;
import nexos.common.ibatis.NexosDAO;
import nexos.common.spring.security.CommonEncryptor;

import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.orm.ibatis.SqlMapClientFactoryBean;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.PlatformTransactionManager;

import com.penta.scpdb.ScpDbAgent;

/**
 * Class: WCDAOImpl<br>
 * Description: WMS Common DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 * 
 * <pre style="font-family: NanumGothicCoding, GulimChe">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2013-01-01    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 * </pre>
 */
@Repository("WCDAO")
public class WCDAOImpl implements WCDAO {

  private final Logger               logger = LoggerFactory.getLogger(WCDAOImpl.class);

  @Resource
  private NexosDAO                   nexosDAO;

  @Resource
  private CommonEncryptor            commonEncryptor;

  @Resource
  private Properties                 globalProps;

  @Resource
  private PlatformTransactionManager transactionManager;

  private String getEncryptUserPwd(String user_Pwd) {

    String result = user_Pwd;

    if (result == null) {
      throw new RuntimeException("비밀번호가 지정되지 않았습니다.");
    }

    try {
      result = "ENC(" + commonEncryptor.encryptHASH(result) + ")";
    } catch (Exception e) {
    }

    return result;
  }

  private boolean equalUserPwd(String user_Pwd, String saved_User_Pwd) {

    boolean result = false;

    if (user_Pwd == null) {
      throw new RuntimeException("비밀번호를 입력하십시오.");
    }

    // 암호화 되어 있는 비밀번호일 경우는 입력한 비밀번호를 암호화하여 비교
    if (saved_User_Pwd.startsWith("ENC(") && saved_User_Pwd.endsWith(")")) {
      String enc_User_Pwd = getEncryptUserPwd(user_Pwd);
      result = saved_User_Pwd.equals(enc_User_Pwd);
    } else {
      result = saved_User_Pwd.equals(user_Pwd);
    }

    return result;
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
  @Override
  public Map getLogin(Map<String, Object> params) {

    Map<String, String> resultMap = null;

    // 사용자정보 조회
    List listResult = nexosDAO.list("WC.GET_LOGIN", params);

    if (listResult.size() == 0) {
      throw new RuntimeException("등록된 사용자 정보가 없습니다.");
    }

    // 비밀번호 비교.
    resultMap = (Map<String, String>)listResult.get(0);

    String strUser_Pwd = (String)params.get("P_USER_PWD");
    if (!equalUserPwd(strUser_Pwd, resultMap.get("USER_PWD"))) {
      throw new RuntimeException("비밀번호가 틀립니다. 확인하십시오.");
    }

    return resultMap;
  }

  @SuppressWarnings({"rawtypes"})
  @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
  @Override
  public List getCSUserSysInfo(String userId, String clientIP) {
    Map<String, Object> params = new HashMap<String, Object>();
    params.put("P_USER_ID", userId);
    params.put("P_CLIENT_IP", clientIP);

    return nexosDAO.list("WC.GET_CSUSERSYSINFO", params);
  }

  @Secured("IS_AUTHENTICATED_ANONYMOUSLY")
  @Override
  public void updateLoginInfo(String userId, String clientIP, String regUserId) {

    Map<String, Object> params = new HashMap<String, Object>();
    params.put("P_USER_ID", userId);
    params.put("P_CLIENT_IP", clientIP);
    params.put("P_REG_USER_ID", regUserId);

    int update = nexosDAO.update("WC.UPDATE_CSUSERSYSINFO_LOGIN", params);

    // 로그인기록 수정하기
    if (update == 0) {
      nexosDAO.insert("WC.INSERT_CSUSERSYSINFO", params);
    }
  }

  /**
   * 사용자 비밀번호 변경
   * 
   * @param params
   * @throws Exception
   */
  @Override
  public void updateUserPassword(Map<String, Object> params) {

    params.put("P_USER_PWD", getEncryptUserPwd((String)params.get("P_USER_PWD")));

    int update = nexosDAO.update("WC.UPDATE_CSUSER_PASSWORD", params);

    if (update == 0) {
      throw new RuntimeException("사용자ID가 존재하지 않습니다.");
    }
  }

  /**
   * sqlMap reload
   * 
   * @param factory
   */
  @Override
  public String reloadSqlMap(SqlMapClientFactoryBean factory) {
    String result = Consts.ERROR;

    try {
      factory.afterPropertiesSet();

      nexosDAO.getSqlMapClientTemplate().setSqlMapClient(factory.getObject());

      result = Consts.OK;
    } catch (Exception e) {
      return e.getMessage();
    }

    return result;
  }

  @SuppressWarnings("rawtypes")
  @Override
  public List getUserProgramMenu(Map<String, Object> params) {
    return nexosDAO.list("WC.GET_CSUSERPROGRAM", params);
  }

  @Override
  @SuppressWarnings({"rawtypes", "unchecked"})
  public List getUserProgramMenuTree(List list) {

    List result = new ArrayList();
    if (list == null || list.size() == 0) {
      return result;
    }

    Iterator iterator = list.iterator();
    Map<String, Object> rowData = null;

    /*
     * Tree 데이터 구조
     * [{ "id": "id_1", "PROGRAM_ID": "CS00000M", .. , "EXE_LEVEL4": "Y", indent:"0", parent:"" },
     * { "id": "id_2", "PROGRAM_ID": "CS01010E", .. , "EXE_LEVEL4": "Y", indent:"1", parent:"1" },
     * { "id": "id_3", "PROGRAM_ID": "CM00000M", .. , "EXE_LEVEL4": "Y", indent:"0", parent:"" },
     * { "id": "id_4", "PROGRAM_ID": "CM01010E", .. , "EXE_LEVEL4": "Y", indent:"1", parent:"3" },
     * { "id": "id_5", "PROGRAM_ID": "CM01020E", .. , "EXE_LEVEL4": "Y", indent:"1", parent:"3" }
     * ]
     */
    while (iterator.hasNext()) {
      rowData = (HashMap)iterator.next();

      Map<String, Object> menuData = new HashMap<String, Object>();

      menuData.put(Consts.DK_ID, Consts.DV_ID_PREFIX + String.valueOf(rowData.get("ROW_ID")));
      menuData.put("PROGRAM_ID", rowData.get("PROGRAM_ID"));
      menuData.put("PROGRAM_NM", rowData.get("PROGRAM_NM"));
      menuData.put("PROGRAM_GRP1", rowData.get("PROGRAM_GRP1"));
      menuData.put("PROGRAM_GRP2", rowData.get("PROGRAM_GRP2"));
      menuData.put("PROGRAM_GRP3", rowData.get("PROGRAM_GRP3"));
      menuData.put("PROGRAM_GRP4", rowData.get("PROGRAM_GRP4"));
      menuData.put("PROGRAM_DIV", rowData.get("PROGRAM_DIV"));
      menuData.put("WIDE_YN", rowData.get("WIDE_YN"));
      menuData.put("WEB_URL", rowData.get("WEB_URL"));
      menuData.put("EXE_LEVEL1", rowData.get("EXE_LEVEL1"));
      menuData.put("EXE_LEVEL2", rowData.get("EXE_LEVEL2"));
      menuData.put("EXE_LEVEL3", rowData.get("EXE_LEVEL3"));
      menuData.put("EXE_LEVEL4", rowData.get("EXE_LEVEL4"));
      menuData.put("FAVORITE_YN", rowData.get("FAVORITE_YN"));
      menuData.put("MENU_SHOW_YN", rowData.get("MENU_SHOW_YN"));
      menuData.put("indent", String.valueOf(rowData.get("MENU_INDENT")));
      String parent = String.valueOf(rowData.get("PARENT_ID"));
      if (!Util.isNull(parent)) {
        parent = Consts.DV_ID_PREFIX + parent;
      } else {
        parent = "";
      }
      menuData.put("parent", parent);
      menuData.put("_collapsed", true);

      result.add(menuData);
    }

    return result;
  }

  @Override
  public void insertCheckedValue(Map<String, Object> params) {

    if (params.isEmpty()) {
      return;
    }
    String checkedValue = (String)params.get("P_CHECKED_VALUE");
    if (Util.isNull(checkedValue)) {
      return;
    }

    final String PK_PARAM_KEY = "P_CHECK_VALUE";
    String queryId = "WC.INSERT_CTCHECKVALUE";;

    try {
      String other_tempo = (String)params.get("P_OTHER_TEMPO");

      if (!Util.isNull(other_tempo)) {
        queryId += "_" + other_tempo;
      }

      // 구분자는 ","로 주고 배열로 변환
      String[ ] paramValues = checkedValue.split(",");
      int paramCount = paramValues.length;
      String paramValue = null;
      params.clear();

      for (int i = 0; i < paramCount; i++) {
        paramValue = paramValues[i];
        if (paramValue == null) {
          continue;
        }
        params.put(PK_PARAM_KEY, paramValue);

        nexosDAO.insert(queryId, params);
      }
    } catch (Exception e) {
      throw new RuntimeException("선택 값 저장 중 오류가 발생했습니다.\r" + e.getMessage());
    }
  }

  @SuppressWarnings({"unchecked", "rawtypes"})
  @Override
  public Map excelExport(Map<String, Object> params) throws Exception {

    HashMap<String, Object> resultMap = new HashMap<String, Object>();

    final String PK_XLS_FILE_FULL_NM = "O_XLS_FILE_FULL_NM";
    final String XLS_DEFAULT_TITLE = "EXPORT";

    // 파라메터 값 읽기
    String WEB_ROOT_PATH = globalProps.getProperty("webapp.root");
    // String CONTEXT_URL = (String)params.get("P_CONTEXT_URL");
    String XLS_EXPORT_PATH = globalProps.getProperty("excelExport");
    String xlsTitle = (String)params.get("P_EXCEL_TITLE");
    String xlsExportType = (String)params.get("P_EXPORT_TYPE");
    if (xlsTitle == null || xlsTitle.equals("")) {
      xlsTitle = XLS_DEFAULT_TITLE;
    }
    String queryId = (String)params.get(Consts.PK_QUERY_ID);
    Map<String, Object> queryParams = (HashMap<String, Object>)params.get(Consts.PK_QUERY_PARAMS);
    List<Map<String, Object>> columnInfo = null;
    if (params.get("P_COLUMN_INFO") != null) {
      columnInfo = (List<Map<String, Object>>)params.get("P_COLUMN_INFO");
    }
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    // 서버 파일명 지정
    String xlsFileName = user_Id + "_" + xlsTitle + "_" + Util.getNowDate("yyyyMMddHHmmss") + ".xls";
    String xlsExportFullPath = WEB_ROOT_PATH + XLS_EXPORT_PATH;
    String xlsFileFullName = xlsExportFullPath + xlsFileName;

    // 이전 Export 파일 삭제
    deleteExcelExportFiles(xlsExportFullPath);

    // 엑셀 관련 Object 생성
    FileOutputStream xlsFile = null;
    HSSFWorkbook xlsWorkbook = new HSSFWorkbook();
    try {
      xlsFile = new FileOutputStream(xlsFileFullName);
      
      ScpDbAgent agt = new ScpDbAgent();
      String iniFilePath = "/usr/scp/scpdb_agent_unix.ini";
      String outKey = agt.ScpExportKey( iniFilePath, "KEY1", "" );
        //
        //System.out.println("\n outKey : " +outKey );
        
        queryParams.put("P_SCPKEY", outKey);
      
      int listCount = nexosDAO.listToExcel(queryId, queryParams, xlsWorkbook, columnInfo, xlsExportType, xlsTitle);
      if (listCount == 0) {
        resultMap.put(Consts.PK_O_MSG, "EXCEL 파일을 생성할 데이터가 존재하지 않습니다.");
        return resultMap;
      }

      // Excel 쓰기
      xlsWorkbook.write(xlsFile);
      resultMap.put(PK_XLS_FILE_FULL_NM, xlsFileFullName);
      resultMap.put(Consts.PK_O_MSG, Consts.OK);
    } catch (Exception e) {
      logger.error(e.getMessage());
      resultMap.put(Consts.PK_O_MSG, e.getMessage());
    } finally {
      try {
        xlsWorkbook = null;
        if (xlsFile != null) {
          xlsFile.close();
          xlsFile = null;
        }
      } catch (Exception e) {
        logger.error(e.getMessage());
      }
    }
    return resultMap;
  }

  /**
   * Excel Export 파일 삭제 - 2시간 전에 생성된 파일
   * 
   * @throws Exception
   */
  private void deleteExcelExportFiles(String exportPath) throws Exception {
    try {
      File exportDir = new File(exportPath);
      if (exportDir.exists()) {
        File[ ] exportFiles = exportDir.listFiles();

        long currentTime = System.currentTimeMillis();
        for (int i = 0; i < exportFiles.length; i++) {
          if (currentTime - exportFiles[i].lastModified() > 7200000) {
            exportFiles[i].delete();
          }
        }
      } else {
        exportDir.mkdirs();
      }
    } catch (Exception e) {
      logger.error(e.getMessage());
    }
  }

  @SuppressWarnings({"rawtypes", "unchecked"})
  @Override
  public Map getSysDate() {
    HashMap<String, Object> mapResult = null;

    final String GET_SYSDATE_ID = "WC.GET_SYSDATE";

    try {
      List list = nexosDAO.list(GET_SYSDATE_ID);
      if (list == null || list.size() == 0) {
        throw new RuntimeException("수신일자를 가져오지 못했습니다. 다시 처리하십시오.");
      }
      mapResult = (HashMap<String, Object>)list.get(0);
      mapResult.put(Consts.PK_O_MSG, Consts.OK);
    } catch (Exception e) {
      mapResult = new HashMap<String, Object>();
      mapResult.put(Consts.PK_O_MSG, e.getMessage());
    }
    return mapResult;
  }

  @Override
  public void saveGridColumnOrder(Map<String, Object> params) {

    final String PRORAM_ID = "WC";
    final String TABLE_NM = "CSUSERPROGRAMLAYOUT";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    // final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;

    int update = nexosDAO.update(UPDATE_ID, params);
    if (update == 0) {
      nexosDAO.insert(INSERT_ID, params);
    }
  }
}
