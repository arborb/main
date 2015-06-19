package nexos.service.cm;

import java.io.File;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.Util;
import nexos.common.ibatis.JsonDataSet;
import nexos.service.common.CommonDAO;

import org.apache.commons.io.FileUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Class: CM03070EService<br>
 * Description: 위탁사이미지관리 관리(CM03070E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
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
@Service("CM03070E")
public class CM03070EService {

  // private final Logger logger = LoggerFactory.getLogger(CM03070EService.class);

  /**
   * DAO 주입처리하기
   */
  @Resource
  private CommonDAO  common;

  @Resource
  private Properties globalProps;

  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return common.getJsonDataSet(queryId, params);
  }

  public Map<String, Object> getBIImage(Map<String, Object> params) {

    Map<String, Object> result = new HashMap<String, Object>();

    String WEB_ROOT_PATH = globalProps.getProperty("webapp.root");
    String BIIMAGE_ROOT_PATH = globalProps.getProperty("biRoot");
    String BIIMAGE_PATH = null;
    String BIIMAGE_DIV = (String)params.get("P_BIIMAGE_DIV");
    String BIIMAGE_CD = (String)params.get("P_BIIMAGE_CD");

    if ("CUST".equals(BIIMAGE_DIV)) {
      BIIMAGE_PATH = globalProps.getProperty("biCustImage");
    } else if ("BU".equals(BIIMAGE_DIV)) {
      BIIMAGE_PATH = globalProps.getProperty("biBuImage");
    } else {
      BIIMAGE_PATH = globalProps.getProperty("biBrandImage");
    }

    try {
      String biImageFileFullName = Util.getPathName(WEB_ROOT_PATH, BIIMAGE_PATH) + BIIMAGE_CD;
      File biImageFile = new File(biImageFileFullName);
      if (!biImageFile.exists()) {
        biImageFile = new File(Util.getPathName(WEB_ROOT_PATH, BIIMAGE_ROOT_PATH) + "no_image");
      }

      result.put("P_BIIMAGE", FileUtils.readFileToByteArray(biImageFile));
      result.put(Consts.PK_O_MSG, Consts.OK);
    } catch (Exception e) {
      result.put(Consts.PK_O_MSG, e.getMessage());
    }
    return result;
  }

  public String saveBIImage(Map<String, Object> params) throws Exception {

    String result = Consts.OK;

    String WEB_ROOT_PATH = globalProps.getProperty("webapp.root");
    String BIIMAGE_PATH = null;
    String BIIMAGE_DIV = (String)params.get("P_BIIMAGE_DIV");
    String BIIMAGE_CD = (String)params.get("P_BIIMAGE_CD");

    if ("CUST".equals(BIIMAGE_DIV)) {
      BIIMAGE_PATH = globalProps.getProperty("biCustImage");
    } else if ("BU".equals(BIIMAGE_DIV)) {
      BIIMAGE_PATH = globalProps.getProperty("biBuImage");
    } else {
      BIIMAGE_PATH = globalProps.getProperty("biBrandImage");
    }

    MultipartFile multipartFile = (MultipartFile)params.get("P_UPLOAD_FILE");
    File biImageFile = new File(Util.getPathName(WEB_ROOT_PATH, BIIMAGE_PATH) + BIIMAGE_CD);
    try {
      multipartFile.transferTo(biImageFile);
    } catch (Exception e) {
      throw new RuntimeException("이미지 파일을 전송하지 못했습니다.");
    }

    return result;
  }

  public String removeBIImage(Map<String, Object> params) {

    String result = Consts.OK;

    String WEB_ROOT_PATH = globalProps.getProperty("webapp.root");
    String BIIMAGE_PATH = null;
    String BIIMAGE_DIV = (String)params.get("P_BIIMAGE_DIV");
    String BIIMAGE_CD = (String)params.get("P_BIIMAGE_CD");

    if ("CUST".equals(BIIMAGE_DIV)) {
      BIIMAGE_PATH = globalProps.getProperty("biCustImage");
    } else if ("BU".equals(BIIMAGE_DIV)) {
      BIIMAGE_PATH = globalProps.getProperty("biBuImage");
    } else {
      BIIMAGE_PATH = globalProps.getProperty("biBrandImage");
    }

    File biImageFile = new File(Util.getPathName(WEB_ROOT_PATH, BIIMAGE_PATH) + BIIMAGE_CD);
    if (biImageFile.exists() && biImageFile.isFile()) {
      if (!biImageFile.delete()) {
        throw new RuntimeException("로고이미지 파일을 삭제하지 못했습니다.");
      };
    }

    return result;
  }

}
