package nexos.common;

/**
 * Class: Consts<br>
 * Description: 기본상수관련 Class<br>
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
public class Consts {

  public static final String CHARSET                   = "utf-8";
  public static final String YES                       = "Y";
  public static final String NO                        = "N";
  public static final String OK                        = "OK";
  public static final String T                         = "1";
  public static final String ERROR                     = "ERROR";
  public static final String ERROR_PASSWORD            = "ERROR_PASSWORD";
  public static final String SUCCESS                   = "SUCCESS";
  public static final String SUCCESSFUL                = "SUCCESSFUL";
  public static final String SUCCESS_LOGIN             = "SUCCESS_LOGIN";
  public static final String SUCCESS_LOGOUT            = "SUCCESS_LOGOUT";
  public static final String CRLF                      = System.getProperty("line.separator");

  public static final String DIRECTION_FW              = "FW";
  public static final String DIRECTION_BW              = "BW";

  public static final String PROCESS_GRP_IN            = "LI";
  public static final String PROCESS_GRP_OUT           = "LO";
  public static final String PROCESS_GRP_RTN_IN        = "RI";
  public static final String PROCESS_GRP_RTN_OUT       = "RO";

  public static final String PROCESS_ORDER             = "A";
  public static final String PROCESS_ENTRY             = "B";
  public static final String PROCESS_ENTRY_T1          = "B1";
  public static final String PROCESS_ENTRY_NEW         = "N";
  public static final String PROCESS_DIRECTIONS        = "C";
  public static final String PROCESS_CONFIRM           = "D";
  public static final String PROCESS_PUTAWAY           = "E";
  public static final String PROCESS_DELIVERY          = "E";

  public static final String PROCESS_XINSPECT          = "C";
  public static final String PROCESS_XINSPECT_ASN      = "C1";
  public static final String PROCESS_XDISTRIBUTE       = "D";
  public static final String PROCESS_XCONFIRM          = "E";
  public static final String PROCESS_XDELIVERY         = "F";

  public static final String POLICY_VAL_1              = "1";
  public static final String POLICY_VAL_2              = "2";
  public static final String POLICY_VAL_3              = "3";
  public static final String POLICY_VAL_4              = "4";
  public static final String POLICY_VAL_5              = "5";

  public static final String STATE_ORDER               = "10";
  public static final String STATE_ENTRY               = "20";
  public static final String STATE_DIRECTIONS          = "30";
  public static final String STATE_CONFIRM             = "40";
  public static final String STATE_PUTAWAY             = "50";
  public static final String STATE_DELIVERY            = "50";

  // EDI, TASK 관련 상수
  public static final String DEFINE_DIV_RECV           = "1";
  public static final String DEFINE_DIV_SEND           = "2";

  public static final String DATA_DIV_DBLINK           = "01";
  public static final String DATA_DIV_XLS              = "02";
  public static final String DATA_DIV_TXT              = "03";
  public static final String DATA_DIV_XML              = "04";

  public static final String FILE_DIV_SERVER           = "1";
  public static final String FILE_DIV_ATTACHMENT       = "2";
  public static final String FILE_DIV_DOC              = "3";

  public static final String REMOTE_DIV_FTP            = "1";
  public static final String REMOTE_DIV_SFTP           = "3";
  public static final String REMOTE_DIV_WS             = "2";

  public static final String TRIGER_GROUP              = "neXosEDIJobGroup";
  public static final String BACKUP_DIR                = "BACKUP";

  public static final String SITE_CD_STANDARD          = "0000";

  // 파일 관련 상수
  public static final String FILE_SEPARATOR_UNIX       = "/";
  public static final String FILE_SEPARATOR_WIN        = "\\";

  // 날짜관련
  public static final String DATE_FORMAT               = "yyyy-MM-dd";
  public static final String DATETIME_FORMAT           = "yyyy-MM-dd HH:mm:ss";
  public static final String DATE_SEPARATOR            = "-";
  public static final String DBDATE_FORMAT             = "'YYYY-MM-DD'";
  public static final String DBDATETIME_FORMAT         = "'YYYY-MM-DD HH24:MI:SS'";
  public static final String DBDATE_SEPARATOR          = "'-'";

  // Map 관련 Key, Value 상수
  // DK, DATASET KEY, VALUE
  public static final String DK_ID                     = "id";
  public static final String DV_ID_PREFIX              = "id_";
  public static final String DK_CRUD                   = "CRUD";
  public static final String DV_CRUD_C                 = "C";
  public static final String DV_CRUD_R                 = "R";
  public static final String DV_CRUD_U                 = "U";
  public static final String DV_CRUD_D                 = "D";
  public static final String DV_NULL_TIME              = " 00:00:00";
  public static final String DK_RESULT_CD              = "RESULT_CD";
  public static final String DK_RESULT_TYPE            = "RESULT_TYPE";
  public static final String DK_RESULT_COLUMN          = "RESULT_COLUMN";
  public static final String DK_RESULT_DATA            = "RESULT_DATA";
  public static final String DK_RESULT_DATA_CNT        = "RESULT_DATA_CNT";

  public static final int    DV_RESULT_CD_OK           = 0;
  public static final int    DV_RESULT_CD_ERROR        = 1;
  public static final int    DV_RESULT_CD_INVALIDSESSION = 998;
  public static final int    DV_RESULT_CD_ACCESSDENIED = 999;
  public static final String DV_RESULT_TYPE_STR        = "S";
  public static final String DV_RESULT_TYPE_MAP        = "M";
  public static final String DV_RESULT_TYPE_LIST       = "L";
  public static final String DV_RESULT_TYPE_SLIST      = "SL";
  public static final String DV_RESULT_TYPE_MLIST      = "ML";

  // PK, PARAMETER KEY, VALUE
  public static final String PK_RESULT_MSG             = "O_RESULT_MSG";
  public static final String PK_DS_MASTER              = "P_DS_MASTER";
  public static final String PK_DS_DETAIL              = "P_DS_DETAIL";
  public static final String PK_DS_SUB                 = "P_DS_SUB";
  public static final String PK_DS_SUB1                = "P_DS_SUB1";
  public static final String PK_QUERY_ID               = "P_QUERY_ID";
  public static final String PK_QUERY_PARAMS           = "P_QUERY_PARAMS";
  public static final String PK_CHECKED_VALUE          = "P_CHECKED_VALUE";
  public static final String PK_USER_ID                = "P_USER_ID";
  public static final String PK_WB_CNT                 = "P_WB_CNT";
  public static final String PK_REG_USER_ID            = "P_REG_USER_ID";
  public static final String PK_REG_DATETIME           = "P_REG_DATETIME";
  public static final String PK_CRUD                   = "P_CRUD";
  public static final String PK_MALL_CD                = "P_MALL_CD";
  public static final String PK_O_MSG                  = "O_MSG";
  public static final String PK_O_HAS_NO               = "O_HAS_NO";
}
