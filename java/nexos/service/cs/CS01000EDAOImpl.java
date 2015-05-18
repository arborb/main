package nexos.service.cs;

import java.io.File;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.Util;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

/**
 * Class: CS01000EDAOImpl<br>
 * Description: CS01000E DAO (Data Access Object)<br>
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
@Repository("CS01000EDAO")
public class CS01000EDAOImpl implements CS01000EDAO {

  // private final Logger logger = LoggerFactory.getLogger(CS01000EDAOImpl.class);

  @Resource
  private NexosDAO   nexosDAO;

  @Resource
  private Properties globalProps;

  @SuppressWarnings("unchecked")
  @Override
  public void saveMaster(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveMasterDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "CS01000E";
    final String MASTER_TABLE_NM = "CSNOTICE";
    final String DETAIL_TABLE_NM = "CSNOTICEREPLY";
    final String MASTER_INSERT_ID = PRORAM_ID + ".INSERT_" + MASTER_TABLE_NM;
    final String MASTER_UPDATE_ID = PRORAM_ID + ".UPDATE_" + MASTER_TABLE_NM;
    final String MASTER_DELETE_ID = PRORAM_ID + ".DELETE_" + MASTER_TABLE_NM;
    final String DETAIL_DELETE_ID = PRORAM_ID + ".DELETE_" + DETAIL_TABLE_NM;
    final String CS_NOTICE_GETNO_ID = "WT.CS_NOTICE_GETNO";

    String WEB_ROOT_PATH = globalProps.getProperty("webapp.root");
    String noticeAttachmentPath = globalProps.getProperty("noticeAttachment");
    String noticeAttachmentFullPath = WEB_ROOT_PATH + noticeAttachmentPath;
    Object attachmentMultipart = null;

    // DataSet 처리
    int dsCnt = saveMasterDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveMasterDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_C.equals(crud)) {
        Map<String, Object> newParam = new HashMap<String, Object>();
        Map<String, Object> mapResult = nexosDAO.callSP(CS_NOTICE_GETNO_ID, newParam);
        String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
        rowData.put("P_WRITE_NO", mapResult.get("O_WRITE_NO"));
        attachmentMultipart = params.get("P_UPLOAD_FILE");

        if (attachmentMultipart != null) {
          // 서버에 첨부파일 저장
          int write_No = ((Number)rowData.get("P_WRITE_NO")).intValue();
          CommonsMultipartFile attachmentMultipartFile = (CommonsMultipartFile)attachmentMultipart;
          String noticeAttachmentTempFileName = attachmentMultipartFile.getOriginalFilename().replaceAll(" ", "_");
          String noticeAttachmentFileName = write_No + "_" + noticeAttachmentTempFileName;
          String noticeAttachmentFileFullName = noticeAttachmentFullPath + noticeAttachmentFileName;

          deleteAttachmentFile(noticeAttachmentFileFullName);
          File noticeAttachmentUploadFile = new File(noticeAttachmentFileFullName);
          try {
            attachmentMultipartFile.transferTo(noticeAttachmentUploadFile);
          } catch (Exception e) {
            throw new RuntimeException("첨부 파일을 전송하지 못했습니다.");
          }
          rowData.put("P_FILE_NM", noticeAttachmentFileName);
          rowData.put("P_FILE_SIZE", getAttachmentFileSize(noticeAttachmentUploadFile.length()));
        }

        nexosDAO.insert(MASTER_INSERT_ID, rowData);
      } else if (Consts.DV_CRUD_U.equals(crud)) {

        attachmentMultipart = params.get("P_UPLOAD_FILE");
        // 파일이 지정되었고
        if (attachmentMultipart != null) {
          // 서버에 첨부파일 저장
          int write_No = ((Number)rowData.get("P_WRITE_NO")).intValue();
          CommonsMultipartFile attachmentMultipartFile = (CommonsMultipartFile)attachmentMultipart;
          String noticeAttachmentTempFileName = attachmentMultipartFile.getOriginalFilename().replaceAll(" ", "_");
          String noticeAttachmentFileName = write_No + "_" + noticeAttachmentTempFileName;
          String noticeAttachmentFileFullName = noticeAttachmentFullPath + noticeAttachmentFileName;

          deleteAttachmentFile(noticeAttachmentFileFullName);
          File noticeAttachmentUploadFile = new File(noticeAttachmentFileFullName);
          try {
            attachmentMultipartFile.transferTo(noticeAttachmentUploadFile);
          } catch (Exception e) {
            throw new RuntimeException("첨부 파일을 전송하지 못했습니다.");
          }
          rowData.put("P_FILE_NM", noticeAttachmentFileName);
          rowData.put("P_FILE_SIZE", getAttachmentFileSize(noticeAttachmentUploadFile.length()));

          // 이전 첨부 파일 삭제
          String org_File_Nm = (String)rowData.get("P_ORG_FILE_NM");
          if (org_File_Nm != null) {
            deleteAttachmentFile(noticeAttachmentFullPath + org_File_Nm);
          }
        } else if (rowData.get("P_ORG_FILE_NM") != null
          && (rowData.get("P_FILE_NM") == null || Util.isNull((String)rowData.get("P_FILE_NM")))) {
          rowData.put("P_FILE_SIZE", "");
          // 이전 첨부 파일 삭제
          String org_File_Nm = (String)rowData.get("P_ORG_FILE_NM");
          if (org_File_Nm != null) {
            deleteAttachmentFile(noticeAttachmentFullPath + org_File_Nm);
          }
        }

        nexosDAO.update(MASTER_UPDATE_ID, rowData);

      } else if (Consts.DV_CRUD_D.equals(crud)) {
        // 삭제일 경우 덧글 먼저 삭제
        nexosDAO.delete(DETAIL_DELETE_ID, rowData);

        nexosDAO.delete(MASTER_DELETE_ID, rowData);

        if (rowData.get("P_ORG_FILE_NM") != null) {
          // 이전 첨부 파일 삭제
          String org_File_Nm = (String)rowData.get("P_ORG_FILE_NM");
          if (org_File_Nm != null) {
            deleteAttachmentFile(noticeAttachmentFullPath + org_File_Nm);
          }
        }
      }
    }
  }


  @Override
  @SuppressWarnings("unchecked")
  public void saveSub(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_SUB);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "CS01000E";
    final String TABLE_NM = "CSNOTICEGROUP";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
    //final String PROCEDURE_ID = "LI_FW_PUTAWAY_PROC";
    // 상품그룹 소분류 처리
    int dsCnt = saveDS.size();
    
    
    
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put("P_USER_ID", user_Id);  

      nexosDAO.insert(INSERT_ID, rowData);
    }
    
  }
  
  @SuppressWarnings("rawtypes")
  @Override
  public Map callDelete(Map<String, Object> params) throws Exception {

    final String CSNOTICEGROUP_DELETE = "CSNOTICEGROUP_DELETE";

    return nexosDAO.callSP(CSNOTICEGROUP_DELETE, params);
  }
  
  /**
   * 첨부 파일 사이즈 리턴
   * 
   * @param size
   * @return
   */
  public String getAttachmentFileSize(long size) {
    if (size <= 0) {
      return "0 B";
    }
    final String[ ] units = new String[ ] {"B", "KB", "MB", "GB", "TB"};
    int digitGroups = (int)(Math.log10(size) / Math.log10(1024));
    return new DecimalFormat("#,##0.#").format(size / Math.pow(1024, digitGroups)) + " " + units[digitGroups];
  }

  /**
   * 이전 첨부 파일 삭제
   * 
   * @param fileName
   */
  public void deleteAttachmentFile(String fileName) {
    File attachmentFile = new File(fileName);
    if (attachmentFile.exists() && attachmentFile.isFile()) {
      attachmentFile.delete();
    }
  }

  @SuppressWarnings("unchecked")
  @Override
  public void saveDetail(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDetailDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "CS01000E";
    final String TABLE_NM = "CSNOTICEREPLY";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;
    final String CS_NOTICE_GETNO_ID = "WT.CS_NOTICEREPLY_GETNO";

    // DataSet 처리
    int dsCnt = saveDetailDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDetailDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_C.equals(crud)) {
        Map<String, Object> newParam = new HashMap<String, Object>();
        newParam.put("P_WRITE_NO", rowData.get("P_WRITE_NO"));
        newParam.put("P_REPLY_DIV", rowData.get("P_REPLY_DIV"));
        Map<String, Object> mapResult = nexosDAO.callSP(CS_NOTICE_GETNO_ID, newParam);
        String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
        rowData.put("P_REPLY_NO", mapResult.get("O_REPLY_NO"));

        nexosDAO.insert(INSERT_ID, rowData);
      } else if (Consts.DV_CRUD_U.equals(crud)) {
        nexosDAO.update(UPDATE_ID, rowData);
      } else if (Consts.DV_CRUD_D.equals(crud)) {
        nexosDAO.delete(DELETE_ID, rowData);
      }
    }
  }

  @SuppressWarnings({"unchecked", "rawtypes"})
  @Override
  public void readNotice(Map<String, Object> params) throws Exception {

    final String PRORAM_ID = "CS01000E";
    final String TABLE_NM = "CSNOTICEREPLY";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    final String SELECT_ID = PRORAM_ID + ".RS_SUB1";
    final String CS_NOTICE_GETNO_ID = "WT.CS_NOTICEREPLY_GETNO";

    int reply_No = 0;
    List list = nexosDAO.list(SELECT_ID, params);
    if ((list != null) && (list.size() > 0)) {
      reply_No = ((Number)((HashMap<String, Object>)list.get(0)).get("REPLY_NO")).intValue();
    }
    params.put(Consts.PK_REG_USER_ID, params.get("P_USER_ID"));

    if (reply_No == 0) {
      Map<String, Object> newParam = new HashMap<String, Object>();
      newParam.put("P_WRITE_NO", params.get("P_WRITE_NO"));
      newParam.put("P_REPLY_DIV", params.get("P_REPLY_DIV"));
      Map<String, Object> mapResult = nexosDAO.callSP(CS_NOTICE_GETNO_ID, newParam);
      String oMsg = (String)mapResult.get(Consts.PK_O_MSG);
      if (!Consts.OK.equals(oMsg)) {
        throw new RuntimeException(oMsg);
      }
      params.put("P_REPLY_NO", mapResult.get("O_REPLY_NO"));

      nexosDAO.insert(INSERT_ID, params);
    } else {
      params.put("P_REPLY_NO", reply_No);
      nexosDAO.update(UPDATE_ID, params);
    }
  }
}
