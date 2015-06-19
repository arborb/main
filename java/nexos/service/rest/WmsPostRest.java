package nexos.service.rest;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Scanner;

import javax.ws.rs.Consumes;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.core.MediaType;

import org.json.JSONException;

@Path("/")

public class WmsPostRest {

	private static Connection dBconnect;
	static int RecvStatus = 0;
	static String CompanyId = null;
	static String CenterCd = null;
	static String ItemState = null;
	static String ItemNm = null;
	static String CheckYn = null;
	static String ItemCd = null;
	static String LogWriteGubn = null;
//	static String Send_WmpQuery = null;
	
	static String MULTIPART_BODY = null;

	
	static String SetResponseData = null;
	static String SetResSultData = null;
	static String SetResponseErrData = null;
	static String SetResSultErrData = null;
	static String WmpRestSeqNo = null;
	static long StartTime;
	static long EndTime;
	static String AirTime;
	static int page_start_position = 1;
	static int page_end_position = 0;
	static int page_total_cnt = 0;
	static String page_total_Check_cnt = null;
	static String PageHdNum = null;
	
/*---------------------------------------------------------------*/
//  Date --> .	
	private static java.sql.Date getCurrentDate() {
	    java.util.Date today = new java.util.Date();
	    return new java.sql.Date(today.getTime());
	}		
/*-----------------------------------------------------------------*/
	/*-----------------------------------------------------------------*/ 
  public static String ResultSendCntCheck( String CompanyId
                                          ,String CenterCd
                                          ,String ItemState
                                          ,String ItemCd
                                          ,String ItemNm) throws SQLException {
    PreparedStatement  pstmtCnt = null;
    ResultSet rsCnt = null;
    Connection DBconnCnt = null;
    
    try {
    //
    //JDBC Connect
    //WmpRestSeqNo
    //운영기  
    //String url9      = "jdbc:oracle:thin:@172.20.50.11:31521:WMSORA";
    //개발기--
      
      String PageCnturl      = "jdbc:oracle:thin:@172.20.50.11:31521:WMSORA";  
      String PageCntuserName = "WMS_USER";
      String PageCntpasswd   = "WMS_PWD";
      
      try {
        Class.forName("oracle.jdbc.driver.OracleDriver");
      } catch (ClassNotFoundException e) {
        // TODO Auto-generated catch block
        e.printStackTrace();
      }
      System.out.println("\n #################################"  + '\t' + '\n');
      System.out.println("\n ResultSendCntCheck CenterCd: " + CenterCd + '\t'+ '\n');
      System.out.println("\n ResultSendCntCheck CenterCd: " + CompanyId + '\t'+ '\n');
      System.out.println("\n ResultSendCntCheck CenterCd: " + CenterCd + '\t'+ '\n');
      System.out.println("\n ResultSendCntCheck ItemState: " + ItemState + '\t'+ '\n');
      System.out.println("\n ResultSendCntCheck ItemState: " + ItemNm + '\t'+ '\n');
      System.out.println("\n ResultSendCntCheck ItemCd: " + ItemCd + '\t'+ '\n');
      System.out.println("\n ResultSendCntCheck CheckYn: " + CheckYn + '\t'+ '\n');
      
      
      DBconnCnt = DriverManager.getConnection(PageCnturl, PageCntuserName, PageCntpasswd);
      if(CheckYn.equals("N")){
        System.out.println("\n  ResultSendCntCheck Page_Query : [ N ]" + '\n');  
      String Page_Query = "SELECT MIN(PAGE),MAX(PAGE),COUNT(*)                                                                                      "+
        "FROM (                                                                                                                   "+
        "SELECT FLOOR((ROWNUM - 1)/10 +1) PAGE, ROWNUM  AS RNUM  ,A.*                                                             "+
        "FROM(                                                                                                                    "+
        "SELECT CENTER_CD,BU_CD,BU_NM,OWN_BRAND_CD,ITEM_CD,ITEM_NM,ITEM_LOT,ITEM_STATE,ITEM_STATE_F,STOCK_QTY,BRAND_CD            "+
        "FROM (                                                                                                                   "+
        "SELECT /* INDEX(M1 LS010NM_IDXPK) */                                                                                     "+
        "                                       M1.CENTER_CD                                                                      "+
        "                                      ,M1.BU_CD                                                                          "+
        "                                      ,C1.BU_NM                                                                          "+
        "                                      ,M1.BRAND_CD                                AS OWN_BRAND_CD                        "+
        "                                      ,M1.ITEM_CD                                                                        "+
        "                                      ,(SELECT ITEM_NM FROM CMITEM WHERE ITEM_CD = M1.ITEM_CD)  AS ITEM_NM               "+
        "                                      ,M1.ITEM_LOT                                                                       "+
        "                                      ,M1.ITEM_STATE                                                                     "+
        "                                      ,WF.DSP_COMBO (M1.ITEM_STATE ,C6.CODE_NM)   AS ITEM_STATE_F                        "+
        "                                      ,SUM(M1.STOCK_QTY)                          AS STOCK_QTY                           "+
        "                                      ,C7.BRAND_CD                                                                       "+
        "                                  FROM LS010NM M1                                                                        "+
        "                                       JOIN CMBU     C1   ON C1.BU_CD        = M1.BU_CD                                  "+
        "                                       JOIN CMCODE   C6   ON C6.CODE_CD      = M1.ITEM_STATE                             "+
        "                                                         AND C6.CODE_GRP     = WF.GET_CODE_GRP('ITEM_STATE')             "+
        "                                       JOIN CMROLE   C7   ON C7.CUST_CD      = '0000'                                    "+
        "                                                         AND C7.BU_CD        = M1.BU_CD                                  "+
        "                                                         AND C7.OWN_BRAND_CD = M1.BRAND_CD                               "+
        "                                                         AND C7.BRAND_CD     = (                                         "+
        "                                                                                SELECT /* INDEX(C1 CMBRAND_IDXPK) */     "+
        "                                                                                       C1.BRAND_CD                       "+
        "                                                                                  FROM CMBRAND C1                        "+
        "                                                                                 WHERE C1.REMARK1 = ?            "+
        "                                                                               )                                         "+
        "                                  WHERE M1.CENTER_CD   LIKE ? || '%'                                                  "+
        "                                    AND M1.BU_CD         <> '6000'                                                       "+
        "                                    AND M1.ITEM_STATE  LIKE UPPER(?) || '%'                                            "+
        "                                    AND M1.ITEM_CD     LIKE  ?  || '%'                                            "+
        "                                  GROUP BY M1.CENTER_CD                                                                  "+
        "                                          ,M1.BU_CD                                                                      "+
        "                                          ,C1.BU_NM                                                                      "+
        "                                          ,M1.BRAND_CD                                                                   "+
        "                                          ,M1.ITEM_CD                                                                    "+
        "                                          ,M1.ITEM_LOT                                                                   "+
        "                                          ,M1.ITEM_STATE                                                                 "+
        "                                          ,C6.CODE_NM                                                                    "+
        "                                          ,C7.BRAND_CD                                                                   "+
        "                                  ORDER BY M1.CENTER_CD                                                                  "+
        "                                          ,M1.BU_CD                                                                      "+
        "                                          ,C1.BU_NM                                                                      "+
        "                                          ,M1.BRAND_CD                                                                   "+
        "                                          ,M1.ITEM_CD                                                                    "+
        "                                          ,M1.ITEM_STATE                                                                 "+
        "                                          ,C6.CODE_NM                                                                    "+
        "        )                                                                                                                "+
        "                WHERE ITEM_NM LIKE '%' || ? || '%'                                                                     "+
        "    )A                                                                                                                   "+
        "    )                                                                                                                    ";
      //System.out.println("\n  ResultSendCntCheck Page_Query : " + Page_Query + '\n');
      pstmtCnt = DBconnCnt.prepareStatement(Page_Query);
      
      pstmtCnt.setString(1, CompanyId);
      pstmtCnt.setString(2, CenterCd);
      pstmtCnt.setString(3, ItemState);
      pstmtCnt.setString(4, ItemCd);
      pstmtCnt.setString(5, ItemNm);
      
      }else{
        System.out.println("\n  ResultSendCntCheck Page_Query : [ Y ]" + '\n');
        String Page_Query = "SELECT MIN(PAGE),MAX(PAGE),COUNT(*)                                                                            "+
          "                                                  FROM (                                                       "+
          "                SELECT FLOOR((ROWNUM - 1)/10+1) PAGE, ROWNUM  AS RNUM  ,A.*                                    "+
          "                 FROM                                                                                          "+
          "                 (                                                                                             "+
          "        WITH T_LO010NMD AS(                                                                                    "+
          "         SELECT /* INDEX(M2 LO010ND_IDX01)  */                                                                 "+
          "                M1.CENTER_CD                                                                                   "+
          "               ,M1.BU_CD                                                                                       "+
          "               ,M2.BRAND_CD                                                                                    "+
          "               ,M2.ITEM_CD                                                                                     "+
          "               ,M2.ITEM_STATE                                                                                  "+
          "               ,M2.ITEM_LOT                                                                                    "+
          "               ,SUM(M2.ORDER_QTY)    AS OUT_ORDER_QTY                                                          "+
          "           FROM LO010NM M1                                                                                     "+
          "                JOIN LO010ND M2 ON M2.CENTER_CD    = M1.CENTER_CD                                              "+
          "                               AND M2.BU_CD        = M1.BU_CD                                                  "+
          "                               AND M2.ORDER_DATE   = M1.ORDER_DATE                                             "+
          "                               AND M2.ORDER_NO     = M1.ORDER_NO                                               "+
          "                JOIN CMROLE  C1 ON C1.CUST_CD      = '0000'                                                    "+
          "                               AND C1.BU_CD        = M2.BU_CD                                                  "+
          "                               AND C1.OWN_BRAND_CD = M2.BRAND_CD                                               "+
          "                JOIN CMBRAND C2 ON C2.BRAND_CD     = C1.BRAND_CD                                               "+
          "                               AND C2.REMARK1      = ?                                                 "+
          "          WHERE M1.CENTER_CD   LIKE ? || '%'                                                                  "+
          "            AND M1.BU_CD         <> '6000'                                                                     "+
          "            AND M1.OUTBOUND_STATE = WD.C_STATE_ORDER                                                           "+
          "            AND M2.ITEM_CD     LIKE  ? ||'%'                                                            "+
          "          GROUP BY M1.CENTER_CD,M1.BU_CD,M2.BRAND_CD,M2.ITEM_CD,M2.ITEM_STATE,M2.ITEM_LOT                      "+
          "        ),                                                                                                     "+
          "         T_LO020NMD AS(                                                                                        "+
          "          SELECT M1.CENTER_CD                                                                                  "+
          "                ,M1.BU_CD                                                                                      "+
          "                ,M2.BRAND_CD                                                                                   "+
          "                ,M2.ITEM_CD                                                                                    "+
          "                ,M2.ITEM_STATE                                                                                 "+
          "                ,M2.ITEM_LOT                                                                                   "+
          "                ,SUM(M2.ENTRY_QTY)    AS OUT_WAIT_QTY1                                                         "+
          "            FROM LO020NM M1                                                                                    "+
          "                 JOIN LO020ND M2 ON M2.CENTER_CD      = M1.CENTER_CD                                           "+
          "                                AND M2.BU_CD          = M1.BU_CD                                               "+
          "                                AND M2.OUTBOUND_DATE  = M1.OUTBOUND_DATE                                       "+
          "                                AND M2.OUTBOUND_NO    = M1.OUTBOUND_NO                                         "+
          "                 JOIN CMROLE  C1 ON C1.CUST_CD        = '0000'                                                 "+
          "                                AND C1.BU_CD          = M2.BU_CD                                               "+
          "                                AND C1.OWN_BRAND_CD   = M2.BRAND_CD                                            "+
          "                 JOIN CMBRAND C2 ON C2.BRAND_CD       = C1.BRAND_CD                                            "+
          "                                AND C2.REMARK1        = ?                                              "+
          "           WHERE M1.CENTER_CD    LIKE ? || '%'                                                                "+
          "             AND M1.BU_CD          <> '6000'                                                                   "+
          "             AND M1.OUTBOUND_STATE IN (WD.C_STATE_ENTRY, WD.C_STATE_DIRECTIONS)                                "+
          "             AND M2.ITEM_CD      LIKE  ? ||'%'                                                          "+
          "           GROUP BY M1.CENTER_CD,M1.BU_CD,M2.BRAND_CD,M2.ITEM_CD,M2.ITEM_STATE,M2.ITEM_LOT                     "+
          "        )                                                                                                      "+
          "        SELECT L2.*                                                                                            "+
          "              ,NVL(L2.STOCK_QTY,0) - NVL(T1.OUT_ORDER_QTY,0) - NVL(T2.OUT_WAIT_QTY1,0) AS OUT_QTY1             "+
          "              ,T1.OUT_ORDER_QTY, T2.OUT_WAIT_QTY1                                                              "+
          "          FROM (                                                                                               "+
          "                SELECT /* INDEX(C3 CMOWNBRAND_IDXPK) */                                                        "+
          "                       L1.*                                                                                    "+
          "                      ,C1.CENTER_NM                                                                            "+
          "                      ,C3.OWN_BRAND_NM                                                                         "+
          "                      ,C2.ITEM_NM                                                                              "+
          "                      ,C2.ITEM_SPEC                                                                            "+
          "                      ,C2.ITEM_DIV                                                                             "+
          "                      ,C5.CODE_NM              AS ITEM_DIV_D                                                   "+
          "                  FROM (                                                                                       "+
          "                        SELECT /* INDEX(M1 LS010NM_IDXPK) */                                                   "+
          "                               M1.CENTER_CD                                                                    "+
          "                              ,M1.BU_CD                                                                        "+
          "                              ,C1.BU_NM                                                                        "+
          "                              ,M1.BRAND_CD                                AS OWN_BRAND_CD                      "+
          "                              ,M1.ITEM_CD                                                                      "+
          "                              ,M1.ITEM_LOT                                                                     "+
          "                              ,M1.ITEM_STATE                                                                   "+
          "                              ,WF.DSP_COMBO (M1.ITEM_STATE ,C6.CODE_NM)   AS ITEM_STATE_F                      "+
          "                              ,SUM(M1.STOCK_QTY)                          AS STOCK_QTY                         "+
          "                              ,C7.BRAND_CD                                                                     "+
          "                          FROM LS010NM M1                                                                      "+
          "                               JOIN CMBU     C1   ON C1.BU_CD        = M1.BU_CD                                "+
          "                               JOIN CMCODE   C6   ON C6.CODE_CD      = M1.ITEM_STATE                           "+
          "                                                 AND C6.CODE_GRP     = WF.GET_CODE_GRP('ITEM_STATE')           "+
          "                               JOIN CMROLE   C7   ON C7.CUST_CD      = '0000'                                  "+
          "                                                 AND C7.BU_CD        = M1.BU_CD                                "+
          "                                                 AND C7.OWN_BRAND_CD = M1.BRAND_CD                             "+
          "                                                 AND C7.BRAND_CD     = (                                       "+
          "                                                                        SELECT /* INDEX(C1 CMBRAND_IDXPK) */   "+
          "                                                                               C1.BRAND_CD                     "+
          "                                                                          FROM CMBRAND C1                      "+
          "                                                                         WHERE C1.REMARK1 = ?          "+
          "                                                                       )                                       "+
          "                          WHERE M1.CENTER_CD   LIKE ? || '%'                                                  "+
          "                            AND M1.BU_CD         <> '6000'                                                     "+
          "                            AND M1.ITEM_STATE  LIKE UPPER(?) || '%'                                           "+
          "                            AND M1.ITEM_CD     LIKE ? ||'%'                                                    "+
          "                          GROUP BY M1.CENTER_CD                                                                "+
          "                                  ,M1.BU_CD                                                                    "+
          "                                  ,C1.BU_NM                                                                    "+
          "                                  ,M1.BRAND_CD                                                                 "+
          "                                  ,M1.ITEM_CD                                                                  "+
          "                                  ,M1.ITEM_LOT                                                                 "+
          "                                  ,M1.ITEM_STATE                                                               "+
          "                                  ,C6.CODE_NM                                                                  "+
          "                                  ,C7.BRAND_CD                                                                 "+
          "                          ORDER BY M1.CENTER_CD                                                                "+
          "                                  ,M1.BU_CD                                                                    "+
          "                                  ,C1.BU_NM                                                                    "+
          "                                  ,M1.BRAND_CD                                                                 "+
          "                                  ,M1.ITEM_CD                                                                  "+
          "                                  ,M1.ITEM_STATE                                                               "+
          "                                  ,C6.CODE_NM                                                                  "+
          "                 ) L1                                                                                          "+
          "                       JOIN CMCENTER   C1 ON C1.CENTER_CD    = L1.CENTER_CD                                    "+
          "                       JOIN CMITEM     C2 ON C2.BRAND_CD     = L1.OWN_BRAND_CD                                 "+
          "                                         AND C2.ITEM_CD      = L1.ITEM_CD                                      "+
          "                       JOIN CMOWNBRAND C3 ON C3.BU_CD        = L1.BU_CD                                        "+
          "                                         AND C3.OWN_BRAND_CD = L1.OWN_BRAND_CD                                 "+
          "                       JOIN CMCODE     C5 ON C5.CODE_CD      = C2.ITEM_DIV                                     "+
          "                                         AND C5.CODE_GRP     = 'ITEM02'                                        "+
          "               ) L2                                                                                            "+
          "                LEFT JOIN T_LO010NMD T1 ON T1.CENTER_CD   = L2.CENTER_CD                                       "+
          "                                       AND T1.BU_CD       = L2.BU_CD                                           "+
          "                                       AND T1.BRAND_CD    = L2.OWN_BRAND_CD                                    "+
          "                                       AND T1.ITEM_CD     = L2.ITEM_CD                                         "+
          "                                       AND T1.ITEM_STATE  = L2.ITEM_STATE                                      "+
          "                                       AND T1.ITEM_LOT    = L2.ITEM_LOT                                        "+
          "                LEFT JOIN T_LO020NMD T2 ON T2.CENTER_CD   = L2.CENTER_CD                                       "+
          "                                       AND T2.BU_CD       = L2.BU_CD                                           "+
          "                                       AND T2.BRAND_CD    = L2.OWN_BRAND_CD                                    "+
          "                                       AND T2.ITEM_CD     = L2.ITEM_CD                                         "+
          "                                       AND T2.ITEM_STATE  = L2.ITEM_STATE                                      "+
          "                                       AND T2.ITEM_LOT    = L2.ITEM_LOT                                        "+
          "          WHERE L2.ITEM_NM     LIKE '%'|| ? || '%'                                                            "+
          "            AND NVL(L2.STOCK_QTY,0) - NVL(T1.OUT_ORDER_QTY,0) - NVL(T2.OUT_WAIT_QTY1,0) <= 10                 "+
          "          ORDER BY L2.CENTER_CD                                                                                "+
          "                  ,L2.BU_CD                                                                                    "+
          "                  ,L2.OWN_BRAND_CD                                                                             "+
          "                  ,L2.ITEM_CD                                                                                  "+
          "                  ,L2.ITEM_STATE                                                                               "+
          "        )A                                                                                                     "+
          "        )                                                                                                      "+
          "        ORDER BY 2                                                                                             ";
        
        //System.out.println("\n  ResultSendCntCheck Page_Query : " + Page_Query + '\n');
        pstmtCnt = DBconnCnt.prepareStatement(Page_Query);
        
        pstmtCnt.setString(1, CompanyId);
        pstmtCnt.setString(2, CenterCd);
        pstmtCnt.setString(3, ItemCd);
        pstmtCnt.setString(4, CompanyId);
        pstmtCnt.setString(5,CenterCd);
        pstmtCnt.setString(6, ItemCd);
        pstmtCnt.setString(7, CompanyId);
        pstmtCnt.setString(8, CenterCd);
        pstmtCnt.setString(9, ItemState);
        pstmtCnt.setString(10, ItemCd);
        pstmtCnt.setString(11, ItemNm);
        
      }
       
       
       System.out.println("\n  ResultSendCntCheck Setting Parameter : " + '\n');
       System.out.println("\n ############################################"  + '\t');
       System.out.println("\n ResultSendCntCheck CenterCd: " + CenterCd + '\t'+ '\n');
       System.out.println("\n ResultSendCntCheck CompanyId: " + CompanyId + '\t'+ '\n');
       System.out.println("\n ResultSendCntCheck CenterCd: " + CenterCd + '\t'+ '\n');
       System.out.println("\n ResultSendCntCheck CenterCd: " + CenterCd + '\t'+ '\n');
       System.out.println("\n ResultSendCntCheck ItemState: " + ItemState + '\t'+ '\n');
       System.out.println("\n ResultSendCntCheck ItemNm: " + ItemNm + '\t'+ '\n');
       System.out.println("\n ResultSendCntCheck ItemCd: " + ItemCd + '\t'+ '\n');
       System.out.println("\n ############################################"  + '\t');
       /*
       pstmtCnt.setString(1, "G1");
       pstmtCnt.setString(2, "G1");
       pstmtCnt.setString(3, "kwk0627");
       pstmtCnt.setString(4, "G1");
       pstmtCnt.setString(5, "A");
       pstmtCnt.setString(6, "");
       pstmtCnt.setString(7, "10006758");
       pstmtCnt.setString(1, CompanyId);
       pstmtCnt.setString(2, CenterCd);
       pstmtCnt.setString(3, ItemState);
       pstmtCnt.setString(4, ItemCd);
       pstmtCnt.setString(5, ItemNm);
       */
       /*
       pstmtCnt.setString(3, ItemCd);
       pstmtCnt.setString(4, CompanyId);
       pstmtCnt.setString(5,CenterCd);
       pstmtCnt.setString(6, ItemCd);
       pstmtCnt.setString(7, CompanyId);
       pstmtCnt.setString(8, CenterCd);
       pstmtCnt.setString(9, ItemState);
       pstmtCnt.setString(10, ItemNm);
       */
       
       rsCnt = pstmtCnt.executeQuery();
       
     while(rsCnt.next()){
       page_start_position = (int)rsCnt.getLong(1);
       page_end_position = (int)rsCnt.getLong(2);
       page_total_cnt = (int)rsCnt.getLong(3);
     }
     int Sendcount = page_total_cnt;
     
     
     //System.out.println("\n  page_start_position : " + page_start_position + '\t' + '\n');
     //System.out.println("\n  page_end_position   :" + page_end_position + '\t' + '\n');
     //System.out.println("\n  page_total_cnt   :" + page_total_cnt + '\t' + '\n');
     //System.out.println("\n  Sendcount   :" + Sendcount + '\t' + '\n');
     System.out.println("송신 대상 건수  : [ " + page_total_cnt + " ]" + '\t' + '\n');
     
     } catch (SQLException e) {
         
        System.out.println(e.getMessage());
    
      } finally {
    
        if (pstmtCnt != null ) {
          pstmtCnt.close();
        }
    
        if (dBconnect != null) {
          dBconnect.close();
        }
        
        if (pstmtCnt != null ) {
          pstmtCnt.close();
        }
    
        if (DBconnCnt != null) {
          DBconnCnt.close();
        }

      }
    
     return String.valueOf(page_total_cnt);
}
  
/*-----------------------------------------------------------------*/	
	
/*-----------------------------------------------------------------*/	
	public static void ResultProcess() throws SQLException {
		PreparedStatement pstmtLog = null;
		PreparedStatement  pstmt1 = null;
		ResultSet rs1 = null;
		Connection connect = null;
		Connection DBconn = null;
		
		//
		//JDBC Connect
		//WmpRestSeqNo
		//운영기  
		//String url9      = "jdbc:oracle:thin:@172.20.50.11:31521:WMSORA";
    //개발기--
    //String DBurl      = "jdbc:oracle:thin:@192.168.0.35:1521:WMS11G";

		  String url9      = "jdbc:oracle:thin:@172.20.50.11:31521:WMSORA";  
		  String userName9 = "WMS_USER";
		  String passwd9   = "WMS_PWD";
		  
		  try {
			Class.forName("oracle.jdbc.driver.OracleDriver");
		} catch (ClassNotFoundException e1) {
			// TODO Auto-generated catch block
			e1.printStackTrace();
		}
		  
		  DBconn = DriverManager.getConnection(url9, userName9, passwd9);
		  
			String REST_SEQ_NO = "SELECT WMP_REST_SEQ_NO.NEXTVAL FROM DUAL "; 
		   pstmt1 = DBconn.prepareStatement(REST_SEQ_NO);
		   rs1 = pstmt1.executeQuery();
		 while(rs1.next()){ 
			 WmpRestSeqNo = rs1.getString(1);
		 }
		 pstmt1.clearParameters();
		 
		 System.out.println("\n  WmpRestSeqNo : " + WmpRestSeqNo + '\t');
		 System.out.println("\n  Sequence 채번 End.." + '\t');
		
		try {
			//운영기 
		    //String DBurl    = "jdbc:oracle:thin:@172.20.50.11:31521:WMSORA";
		    //개발기--
		    //String DBurl      = "jdbc:oracle:thin:@192.168.0.35:1521:WMS11G";
			  String DBurl      = "jdbc:oracle:thin:@172.20.50.11:31521:WMSORA";
		    String userName = "WMS_USER";
		    String passwd   = "WMS_PWD";
		
		try {
			Class.forName("oracle.jdbc.driver.OracleDriver");
		} catch (ClassNotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		
					String Send_Query = ( "INSERT INTO REST_HISTORY "
								+ " (COMPANY_ID,SEQ_NO,START_DATE,END_DATE,AIR_TIME,REG_DATE,ITEM_CD,ITEM_NM,ITEM_STATE,CENTER_CD,SEND_CNT ) VALUES "
								+ " (NVL(?,'00000'),?,?,?,?,SYSDATE,?,?,?,?,?)");
					
					  //System.out.println("\n Send_WmpQuery : " + Send_Query + '\t');
				    connect = DriverManager.getConnection(DBurl, userName, passwd);
				    pstmtLog = connect.prepareStatement(Send_Query);
					  pstmtLog.setString(1, CompanyId);		//COMPANY_ID								
					  pstmtLog.setString(2, WmpRestSeqNo);	//SEQ_NO								
					  pstmtLog.setLong(3, StartTime);			//START_DATE								
					  pstmtLog.setLong(4, EndTime);	        //SEND_DATE								
					  pstmtLog.setString(5, AirTime);			//AIR_TIME
					  //SYSDATE								//REG_DATE
					  pstmtLog.setString(6, ItemCd);     //ITEM_CD
					  pstmtLog.setString(7, ItemNm);      //ITEM_NM
					  pstmtLog.setString(8, ItemState);      //ITEM_STATE
					  pstmtLog.setString(9, CenterCd);      //CENTER_CD
					  pstmtLog.setString(10, page_total_Check_cnt);      //SEND_CNT
					  
					rs1 = pstmtLog.executeQuery();
		
		 } catch (SQLException e) {
				 
				System.out.println(e.getMessage());
		
			} finally {
		
				if (pstmtLog != null ) {
					pstmtLog.close();
				}
		
				if (dBconnect != null) {
					pstmtLog.close();
				}
				
				if (pstmt1 != null ) {
					pstmt1.close();
				}
		
				if (DBconn != null) {
					pstmt1.close();
				}

			}
		
		System.out.println("ResultProcess Setting Finished ......: " +'\t'); 
		
}
/*-----------------------------------------------------------------*/	
	  @Path("stock")
	  @POST
	  @Consumes(MediaType.APPLICATION_JSON)
	  //Params(필수) : 1.company_id(필수) 
	  //Params(옵션) : 2.물류센터구분 3.상태 4.상품명 5.출고가능수량 10건미만인 상품
	  public String StockInfo( String RequestStr)	throws JSONException, ClassNotFoundException, SQLException {  

	  // Start time
	  long startTime = System.currentTimeMillis();  
    StartTime = startTime;
    System.out.println("\n 요청시작시간  :  " + StartTime  + '\n');
    
    //CompanyId 
    //MULTIPART
    MULTIPART_BODY = RequestStr;
    
    System.out.println("Value input >>>>>>>>>>>>> : " + RequestStr + '\n' + '\t');
    
    String strreplace1 = MULTIPART_BODY.replaceAll("\r\n\r\n", "|");
    
    //Header Parse
    Scanner scan = new Scanner(strreplace1);
    String message = scan.nextLine();
    
    String CustStr = MULTIPART_BODY.replace(message,"");
    
    //Body Parse
    String scn1str = CustStr.replaceAll("Content-Disposition: form-data; name=", "");
    
    String FinalStr = scn1str.replace("\"", "");
    
    String FinalStr1 = FinalStr.replace(message.trim(), "");
    
    String FinalStr2 = FinalStr1.replaceAll("\r\n\r\n", ",");
    
    final String[] result0 = FinalStr2.split(",");
    
    System.out.println("\n 입력 값 >>>>>>>>>>>> company_id : [ " + result0[1] + " ] "+'\n');
    System.out.println("\n 입력 값 >>>>>>>>>>>> center_cd  : [ " + result0[3] + " ] "+'\n');
    System.out.println("\n 입력 값 >>>>>>>>>>>> item_state : [ " + result0[5] + " ] "+'\n');
    System.out.println("\n 입력 값 >>>>>>>>>>>> item_nm    : [ " + result0[7] + " ] "+'\n');
    System.out.println("\n 입력 값 >>>>>>>>>>>> chek_yn    : [ " + result0[9] + " ] "+'\n');
    System.out.println("\n 입력 값 >>>>>>>>>>>> item_cd    : [ " + result0[11].replace("--", "").trim() + " ] "+'\n');
    
    //
    
    CompanyId = result0[1].trim();
    CenterCd = result0[3].trim(); 
    ItemState = result0[5].trim(); 
    ItemNm =   result0[7].trim(); 
    CheckYn = result0[9].trim();
    ItemCd  = result0[11].replace("--", "").trim();  //body end 파싱
    
    System.out.println("\n ########[Server Param Setting]" + '\n');
    System.out.println("\n #################################" + '\n');
    System.out.println("\n Value in CompanyId : " + CompanyId + '\n');
    System.out.println("\n Value in CenterCd  : " + CenterCd + '\n');
    System.out.println("\n Value in ItemState : " + ItemState + '\n');
    System.out.println("\n Value in ItemNm    : " + ItemNm + '\n');
    System.out.println("\n Value in CheckYn   : " + CheckYn + '\n');
    System.out.println("\n Value in ItemCd    : " + ItemCd + '\n');
    System.out.println("#################################" + '\n');
    
		//Page 관련 정보 시작
		/*
		try {
      ResultPage(CompanyId);
    } catch (SQLException e1) {
      // TODO Auto-generated catch block 
      e1.printStackTrace();
    }
    //Page 관련 정보 종료
    */
		//
    System.out.println("param 값  :  " + CompanyId);
    
    if(CompanyId.equals("")){

      org.json.JSONObject ErrchildObj = new org.json.JSONObject();
      org.json.JSONObject ErrparentObj = new org.json.JSONObject();
      org.json.JSONArray ErrArray = new org.json.JSONArray();
      //{"result":{"code":200,"message":"Success"}}
      ErrchildObj.put("code",   "100");
      ErrchildObj.put("message",   "판매사 ID 가 없습니다.");
      ErrArray.put(ErrchildObj);
      ErrparentObj.put("result", ErrchildObj);
      String SetResponseErrData = ((Object) ErrparentObj).toString();
      SetResSultErrData = SetResponseErrData;
      System.out.println("\n Send Data Err: [ " + SetResSultErrData + "] " + '\t');
      // End time
      long endTime = System.currentTimeMillis();
      EndTime = endTime;
      System.out.println("\n 요청종료시간  :  " + endTime);
      
      long lTime = endTime - startTime;
      AirTime = lTime/1000.0f +"초";
      System.out.println("TIME : " + lTime + "(ms)");
      /*
      try {
        ResultProcess();
      } catch (SQLException e) {
        // TODO Auto-generated catch block 
        e.printStackTrace();
      }
      */
      return SetResSultErrData;
    }
		
		System.out.println("\n ResultSendCntCheck Start ################: " + '\n');
    System.out.println("\n Value in CompanyId : " + CompanyId + '\n');
    System.out.println("\n Value in CenterCd  : " + CenterCd + '\n');
    System.out.println("\n Value in ItemState : " + ItemState + '\n');
    System.out.println("\n Value in ItemNm    : " + ItemNm + '\n');
    System.out.println("\n Value in CheckYn   : " + CheckYn + '\n');
    System.out.println("\n Value in ItemCd    : " + ItemCd + '\n');
    
    page_total_Check_cnt = ResultSendCntCheck(CompanyId,CenterCd,ItemState,ItemCd,ItemNm);
    System.out.println("\n ResultSendCntCheck End ################: "  + page_total_Check_cnt + '\n');
    
     if(Integer.parseInt(page_total_Check_cnt) == 0){
       
       
     org.json.JSONObject NochildObj = new org.json.JSONObject();
     org.json.JSONObject NoparentObj = new org.json.JSONObject();
     org.json.JSONArray NoArray = new org.json.JSONArray();
     
     try {
      NochildObj.put("code",   "900");
      NochildObj.put("message",   "판매사 ID : [ " + CompanyId + "]" + " 송신 DATA 없습니다.");
      NoArray.put(NochildObj);
      NoparentObj.put("result", NochildObj);
      String SetResponseErrData = ((Object) NoparentObj).toString();
      SetResSultErrData = SetResponseErrData;
     } catch (JSONException e1) {
      // TODO Auto-generated catch block
      e1.printStackTrace();
     }
     
     System.out.println("\n Send Data Err: [ " + SetResSultErrData + "] " + '\t');
     // End time
     long endTime = System.currentTimeMillis();
     EndTime = endTime;
     System.out.println("\n 요청종료시간  :  " + endTime);
     
     long lTime = endTime - StartTime;
     AirTime = lTime/1000.0f +"초"; 
     System.out.println("TIME : " + lTime + "(ms)");
     
     try {
       ResultProcess();
     } catch (SQLException e) {
       // TODO Auto-generated catch block
       e.printStackTrace();
     }
     
     return SetResSultErrData;
    }
    //
		 
	  org.json.JSONObject parentObj = new org.json.JSONObject();
		org.json.JSONArray jArray = new org.json.JSONArray();
		org.json.JSONArray jArray1 = new org.json.JSONArray();
		
	    System.out.println("######################" + '\t');
	    System.out.println("[ Make Data Start ] " + '\t');
	    System.out.println("######################" + '\t');
	//For Start
	//for(int i=1; i < page_end_position ; i++){    
	try {
		  //운영기 
	    //String DBurl    = "jdbc:oracle:thin:@172.20.50.11:31521:WMSORA";
	    //개발기--
		  String DBurl    = "jdbc:oracle:thin:@172.20.50.11:31521:WMSORA";
	    String userName = "WMS_USER";
	    String passwd   = "WMS_PWD";
	    
		PreparedStatement pstmt = null;
		ResultSet rs = null;
		Connection connect = null;
    
		/////////////////////////////////////////////////////////////////////////////////

		Class.forName("oracle.jdbc.driver.OracleDriver");
		
    if(CheckYn.equals("Y")){
      System.out.println("\n ###################### Y" + '\t' + '\n');
      System.out.println("\n 10개 이하  " + '\n');
      System.out.println("\n ###################### Y" + '\t' + '\n');
      
      String Send_WmpQuery = "SELECT PAGE,RNUM,DECODE(CENTER_CD,'G1','광주물류센터','G2','김포물류센터') AS CENTER_CD,BU_CD,BU_NM,OWN_BRAND_CD,OWN_BRAND_NM,ITEM_CD,ITEM_LOT,ITEM_NM,ITEM_STATE,ITEM_SPEC,ITEM_STATE_F,STOCK_QTY,ITEM_DIV,ITEM_DIV_D,OUT_ORDER_QTY,OUT_WAIT_QTY1,OUT_QTY1 "+
        "                                          FROM (                                                                                                                                                                                                            "+
        "        SELECT FLOOR((ROWNUM - 1)/10 +1) PAGE, ROWNUM  AS RNUM  ,A.*                                                                                                                                                                                        "+
        "         FROM                                                                                                                                                                                                                                               "+
        "         (                                                                                                                                                                                                                                                  "+
        "WITH T_LO010NMD AS(                                                                                                                                                                                                                          "+
        " SELECT /*+ INDEX(M2 LO010ND_IDX01)  */                                                                                                                                                                                                        "+
        "        M1.CENTER_CD                                                                                                                                                                                                                         "+
        "       ,M1.BU_CD                                                                                                                                                                                                                             "+
        "       ,M2.BRAND_CD                                                                                                                                                                                                                          "+
        "       ,M2.ITEM_CD                                                                                                                                                                                                                           "+
        "       ,M2.ITEM_STATE                                                                                                                                                                                                                        "+
        "       ,M2.ITEM_LOT                                                                                                                                                                                                                          "+
        "       ,SUM(M2.ORDER_QTY)    AS OUT_ORDER_QTY                                                                                                                                                                                                "+
        "   FROM LO010NM M1                                                                                                                                                                                                                           "+
        "        JOIN LO010ND M2 ON M2.CENTER_CD    = M1.CENTER_CD                                                                                                                                                                                    "+
        "                       AND M2.BU_CD        = M1.BU_CD                                                                                                                                                                                        "+
        "                       AND M2.ORDER_DATE   = M1.ORDER_DATE                                                                                                                                                                                   "+
        "                       AND M2.ORDER_NO     = M1.ORDER_NO                                                                                                                                                                                     "+
        "        JOIN CMROLE  C1 ON C1.CUST_CD      = '0000'                                                                                                                                                                                          "+
        "                       AND C1.BU_CD        = M2.BU_CD                                                                                                                                                                                        "+
        "                       AND C1.OWN_BRAND_CD = M2.BRAND_CD                                                                                                                                                                                     "+
        "        JOIN CMBRAND C2 ON C2.BRAND_CD     = C1.BRAND_CD                                                                                                                                                                                     "+
        "                       AND C2.REMARK1      = ?                                                                                                                                                                                               "+
        "  WHERE M1.CENTER_CD   LIKE ? || '%'                                                                                                                                                                                                            "+
        "    AND M1.BU_CD         <> '6000'                                                                                                                                                                                                           "+
        "    AND M1.OUTBOUND_STATE = WD.C_STATE_ORDER                                                                                                                                                                                                 "+
        "    AND M2.ITEM_CD     LIKE  ? ||'%'                                                                                                                                                                                                   "+
        "  GROUP BY M1.CENTER_CD,M1.BU_CD,M2.BRAND_CD,M2.ITEM_CD,M2.ITEM_STATE,M2.ITEM_LOT                                                                                                                                                            "+
        "),                                                                                                                                                                                                                                           "+
        " T_LO020NMD AS(                                                                                                                                                                                                                              "+
        "  SELECT M1.CENTER_CD                                                                                                                                                                                                                        "+
        "        ,M1.BU_CD                                                                                                                                                                                                                            "+
        "        ,M2.BRAND_CD                                                                                                                                                                                                                         "+
        "        ,M2.ITEM_CD                                                                                                                                                                                                                          "+
        "        ,M2.ITEM_STATE                                                                                                                                                                                                                       "+
        "        ,M2.ITEM_LOT                                                                                                                                                                                                                         "+
        "        ,SUM(M2.ENTRY_QTY)    AS OUT_WAIT_QTY1                                                                                                                                                                                               "+
        "    FROM LO020NM M1                                                                                                                                                                                                                          "+
        "         JOIN LO020ND M2 ON M2.CENTER_CD      = M1.CENTER_CD                                                                                                                                                                                 "+
        "                        AND M2.BU_CD          = M1.BU_CD                                                                                                                                                                                     "+
        "                        AND M2.OUTBOUND_DATE  = M1.OUTBOUND_DATE                                                                                                                                                                             "+
        "                        AND M2.OUTBOUND_NO    = M1.OUTBOUND_NO                                                                                                                                                                               "+
        "         JOIN CMROLE  C1 ON C1.CUST_CD        = '0000'                                                                                                                                                                                       "+
        "                        AND C1.BU_CD          = M2.BU_CD                                                                                                                                                                                     "+
        "                        AND C1.OWN_BRAND_CD   = M2.BRAND_CD                                                                                                                                                                                  "+
        "         JOIN CMBRAND C2 ON C2.BRAND_CD       = C1.BRAND_CD                                                                                                                                                                                  "+
        "                        AND C2.REMARK1        = ?                                                                                                                                                                                    "+
        "   WHERE M1.CENTER_CD    LIKE ? || '%'                                                                                                                                                                                                            "+
        "     AND M1.BU_CD          <> '6000'                                                                                                                                                                                                         "+
        "     AND M1.OUTBOUND_STATE IN (WD.C_STATE_ENTRY, WD.C_STATE_DIRECTIONS)                                                                                                                                                                      "+
        "     AND M2.ITEM_CD      LIKE  ? ||'%'                                                                                                                                                                                                 "+
        "   GROUP BY M1.CENTER_CD,M1.BU_CD,M2.BRAND_CD,M2.ITEM_CD,M2.ITEM_STATE,M2.ITEM_LOT                                                                                                                                                           "+
        ")                                                                                                                                                                                                                                            "+
        "SELECT L2.*                                                                                                                                                                                                                                  "+
        "      ,NVL(L2.STOCK_QTY,0) - NVL(T1.OUT_ORDER_QTY,0) - NVL(T2.OUT_WAIT_QTY1,0) AS OUT_QTY1                                                                                                                                                                        "+
        "      ,T1.OUT_ORDER_QTY, T2.OUT_WAIT_QTY1                                                                                                                                                                         "+
        "  FROM (                                                                                                                                                                                                                                     "+
        "        SELECT /*+ INDEX(C3 CMOWNBRAND_IDXPK) */                                                                                                                                                                                             "+
        "               L1.*                                                                                                                                                                                                                          "+
        "              ,C1.CENTER_NM                                                                                                                                                                                                                  "+
        "              ,C3.OWN_BRAND_NM                                                                                                                                                                                                               "+
        "              ,C2.ITEM_NM                                                                                                                                                                                                                    "+
        "              ,C2.ITEM_SPEC                                                                                                                                                                                                                  "+
        "              ,C2.ITEM_DIV                                                                                                                                                                                                                   "+
        "              ,C5.CODE_NM              AS ITEM_DIV_D                                                                                                                                                                                         "+
        "          FROM (                                                                                                                                                                                                                             "+
        "                SELECT /*+ INDEX(M1 LS010NM_IDXPK) */                                                                                                                                                                                        "+
        "                       M1.CENTER_CD                                                                                                                                                                                                          "+
        "                      ,M1.BU_CD                                                                                                                                                                                                              "+
        "                      ,C1.BU_NM                                                                                                                                                                                                              "+
        "                      ,M1.BRAND_CD                                AS OWN_BRAND_CD                                                                                                                                                            "+
        "                      ,M1.ITEM_CD                                                                                                                                                                                                            "+
        "                      ,M1.ITEM_LOT                                                                                                                                                                                                           "+
        "                      ,M1.ITEM_STATE                                                                                                                                                                                                         "+
        "                      ,WF.DSP_COMBO (M1.ITEM_STATE ,C6.CODE_NM)   AS ITEM_STATE_F                                                                                                                                                            "+
        "                      ,SUM(M1.STOCK_QTY)                          AS STOCK_QTY                                                                                                                                                               "+
        "                      ,C7.BRAND_CD                                                                                                                                                                                                           "+
        "                  FROM LS010NM M1                                                                                                                                                                                                            "+
        "                       JOIN CMBU     C1   ON C1.BU_CD        = M1.BU_CD                                                                                                                                                                      "+
        "                       JOIN CMCODE   C6   ON C6.CODE_CD      = M1.ITEM_STATE                                                                                                                                                                 "+
        "                                         AND C6.CODE_GRP     = WF.GET_CODE_GRP('ITEM_STATE')                                                                                                                                                 "+
        "                       JOIN CMROLE   C7   ON C7.CUST_CD      = '0000'                                                                                                                                                                        "+
        "                                         AND C7.BU_CD        = M1.BU_CD                                                                                                                                                                      "+
        "                                         AND C7.OWN_BRAND_CD = M1.BRAND_CD                                                                                                                                                                   "+
        "                                         AND C7.BRAND_CD     = (                                                                                                                                                                             "+
        "                                                                SELECT /*+ INDEX(C1 CMBRAND_IDXPK) */                                                                                                                                        "+
        "                                                                       C1.BRAND_CD                                                                                                                                                           "+
        "                                                                  FROM CMBRAND C1                                                                                                                                                               "+
        "                                                                 WHERE C1.REMARK1 = ?                                                                                                                                                        "+
        "                                                               )                                                                                                                                                                             "+
        "                  WHERE M1.CENTER_CD   LIKE ? || '%'                                                                                                                                                                                         "+
        "                    AND M1.BU_CD         <> '6000'                                                                                                                                                                                           "+
        "                    AND M1.ITEM_STATE  LIKE UPPER(?) || '%'                                                                                                                                                                                  "+
        "                    AND M1.ITEM_CD     LIKE ? ||'%'                                                    "+
        "                  GROUP BY M1.CENTER_CD                                                                                                                                                                                                      "+
        "                          ,M1.BU_CD                                                                                                                                                                                                          "+
        "                          ,C1.BU_NM                                                                                                                                                                                                          "+
        "                          ,M1.BRAND_CD                                                                                                                                                                                                       "+
        "                          ,M1.ITEM_CD                                                                                                                                                                                                        "+
        "                          ,M1.ITEM_LOT                                                                                                                                                                                                       "+
        "                          ,M1.ITEM_STATE                                                                                                                                                                                                     "+
        "                          ,C6.CODE_NM                                                                                                                                                                                                        "+
        "                          ,C7.BRAND_CD                                                                                                                                                                                                       "+
        "                  ORDER BY M1.CENTER_CD                                                                                                                                                                                                      "+
        "                          ,M1.BU_CD                                                                                                                                                                                                          "+
        "                          ,C1.BU_NM                                                                                                                                                                                                          "+
        "                          ,M1.BRAND_CD                                                                                                                                                                                                       "+
        "                          ,M1.ITEM_CD                                                                                                                                                                                                        "+
        "                          ,M1.ITEM_STATE                                                                                                                                                                                                     "+
        "                          ,C6.CODE_NM                                                                                                                                                                                                        "+
        "         ) L1                                                                                                                                                                                                                                "+
        "               JOIN CMCENTER   C1 ON C1.CENTER_CD    = L1.CENTER_CD                                                                                                                                                                          "+
        "               JOIN CMITEM     C2 ON C2.BRAND_CD     = L1.OWN_BRAND_CD                                                                                                                                                                       "+
        "                                 AND C2.ITEM_CD      = L1.ITEM_CD                                                                                                                                                                            "+
        "               JOIN CMOWNBRAND C3 ON C3.BU_CD        = L1.BU_CD                                                                                                                                                                              "+
        "                                 AND C3.OWN_BRAND_CD = L1.OWN_BRAND_CD                                                                                                                                                                       "+
        "               JOIN CMCODE     C5 ON C5.CODE_CD      = C2.ITEM_DIV                                                                                                                                                                           "+
        "                                 AND C5.CODE_GRP     = 'ITEM02'                                                                                                                                                                              "+
        "       ) L2                                                                                                                                                                                                                                  "+
        "        LEFT JOIN T_LO010NMD T1 ON T1.CENTER_CD   = L2.CENTER_CD                                                                                                                                                                             "+
        "                               AND T1.BU_CD       = L2.BU_CD                                                                                                                                                                                 "+
        "                               AND T1.BRAND_CD    = L2.OWN_BRAND_CD                                                                                                                                                                          "+
        "                               AND T1.ITEM_CD     = L2.ITEM_CD                                                                                                                                                                               "+
        "                               AND T1.ITEM_STATE  = L2.ITEM_STATE                                                                                                                                                                            "+
        "                               AND T1.ITEM_LOT    = L2.ITEM_LOT                                                                                                                                                                              "+
        "        LEFT JOIN T_LO020NMD T2 ON T2.CENTER_CD   = L2.CENTER_CD                                                                                                                                                                             "+
        "                               AND T2.BU_CD       = L2.BU_CD                                                                                                                                                                                 "+
        "                               AND T2.BRAND_CD    = L2.OWN_BRAND_CD                                                                                                                                                                          "+
        "                               AND T2.ITEM_CD     = L2.ITEM_CD                                                                                                                                                                               "+
        "                               AND T2.ITEM_STATE  = L2.ITEM_STATE                                                                                                                                                                                 "+
        "                               AND T2.ITEM_LOT    = L2.ITEM_LOT                                                                                                                                                                                          "+
        "  WHERE L2.ITEM_NM     LIKE '%'|| ? || '%'                                                                                                                                                                                                               "+
        "    AND NVL(L2.STOCK_QTY,0) - NVL(T1.OUT_ORDER_QTY,0) - NVL(T2.OUT_WAIT_QTY1,0) <= 10 "+
        "  ORDER BY L2.CENTER_CD                                                                                                                                                                                                                      "+
        "          ,L2.BU_CD                                                                                                                                                                                                                          "+
        "          ,L2.OWN_BRAND_CD                                                                                                                                                                                                                   "+
        "          ,L2.ITEM_CD                                                                                                                                                                                                                        "+
        "          ,L2.ITEM_STATE                                                                                                                                                                                                                     "+
        ")A                                                                                                                                                                                                                                                          "+
        ")                                                                                                                                                                                                                                                           "+
        "ORDER BY 2                                                                                                                                                                                                                                                  ";
      
      System.out.println("\n Send_WmpQuery CheckYn -[ Y ]: " + '\t');
      connect = DriverManager.getConnection(DBurl, userName, passwd);
      pstmt = connect.prepareStatement(Send_WmpQuery);
      //System.out.println("\n INPUT Send_WmpQuery: " + Send_WmpQuery + '\t');
      
    }else{
		String Send_WmpQuery = "SELECT PAGE,RNUM,DECODE(CENTER_CD,'G1','광주물류센터','G2','김포물류센터') AS CENTER_CD,BU_CD,BU_NM,OWN_BRAND_CD,OWN_BRAND_NM,ITEM_CD,ITEM_LOT,ITEM_NM,ITEM_STATE,ITEM_SPEC,ITEM_STATE_F,STOCK_QTY,ITEM_DIV,ITEM_DIV_D,OUT_ORDER_QTY,OUT_WAIT_QTY1,OUT_QTY1 "+
      "                                          FROM (                                                                                                                                                                                                            "+
      "        SELECT FLOOR((ROWNUM - 1)/10 +1) PAGE, ROWNUM  AS RNUM  ,A.*                                                                                                                                                                                        "+
      "         FROM                                                                                                                                                                                                                                               "+
      "         (                                                                                                                                                                                                                                                  "+
      "WITH T_LO010NMD AS(                                                                                                                                                                                                                          "+
      " SELECT /*+ INDEX(M2 LO010ND_IDX01)  */                                                                                                                                                                                                        "+
      "        M1.CENTER_CD                                                                                                                                                                                                                         "+
      "       ,M1.BU_CD                                                                                                                                                                                                                             "+
      "       ,M2.BRAND_CD                                                                                                                                                                                                                          "+
      "       ,M2.ITEM_CD                                                                                                                                                                                                                           "+
      "       ,M2.ITEM_STATE                                                                                                                                                                                                                        "+
      "       ,M2.ITEM_LOT                                                                                                                                                                                                                          "+
      "       ,SUM(M2.ORDER_QTY)    AS OUT_ORDER_QTY                                                                                                                                                                                                "+
      "   FROM LO010NM M1                                                                                                                                                                                                                           "+
      "        JOIN LO010ND M2 ON M2.CENTER_CD    = M1.CENTER_CD                                                                                                                                                                                    "+
      "                       AND M2.BU_CD        = M1.BU_CD                                                                                                                                                                                        "+
      "                       AND M2.ORDER_DATE   = M1.ORDER_DATE                                                                                                                                                                                   "+
      "                       AND M2.ORDER_NO     = M1.ORDER_NO                                                                                                                                                                                     "+
      "        JOIN CMROLE  C1 ON C1.CUST_CD      = '0000'                                                                                                                                                                                          "+
      "                       AND C1.BU_CD        = M2.BU_CD                                                                                                                                                                                        "+
      "                       AND C1.OWN_BRAND_CD = M2.BRAND_CD                                                                                                                                                                                     "+
      "        JOIN CMBRAND C2 ON C2.BRAND_CD     = C1.BRAND_CD                                                                                                                                                                                     "+
      "                       AND C2.REMARK1      = ?                                                                                                                                                                                               "+
      "  WHERE M1.CENTER_CD   LIKE ? || '%'                                                                                                                                                                                                            "+
      "    AND M1.BU_CD         <> '6000'                                                                                                                                                                                                           "+
      "    AND M1.OUTBOUND_STATE = WD.C_STATE_ORDER                                                                                                                                                                                                 "+
      "    AND M2.ITEM_CD     LIKE '%' || ? ||'%'                                                                                                                                                                                                   "+
      "  GROUP BY M1.CENTER_CD,M1.BU_CD,M2.BRAND_CD,M2.ITEM_CD,M2.ITEM_STATE,M2.ITEM_LOT                                                                                                                                                            "+
      "),                                                                                                                                                                                                                                           "+
      " T_LO020NMD AS(                                                                                                                                                                                                                              "+
      "  SELECT M1.CENTER_CD                                                                                                                                                                                                                        "+
      "        ,M1.BU_CD                                                                                                                                                                                                                            "+
      "        ,M2.BRAND_CD                                                                                                                                                                                                                         "+
      "        ,M2.ITEM_CD                                                                                                                                                                                                                          "+
      "        ,M2.ITEM_STATE                                                                                                                                                                                                                       "+
      "        ,M2.ITEM_LOT                                                                                                                                                                                                                         "+
      "        ,SUM(M2.ENTRY_QTY)    AS OUT_WAIT_QTY1                                                                                                                                                                                               "+
      "    FROM LO020NM M1                                                                                                                                                                                                                          "+
      "         JOIN LO020ND M2 ON M2.CENTER_CD      = M1.CENTER_CD                                                                                                                                                                                 "+
      "                        AND M2.BU_CD          = M1.BU_CD                                                                                                                                                                                     "+
      "                        AND M2.OUTBOUND_DATE  = M1.OUTBOUND_DATE                                                                                                                                                                             "+
      "                        AND M2.OUTBOUND_NO    = M1.OUTBOUND_NO                                                                                                                                                                               "+
      "         JOIN CMROLE  C1 ON C1.CUST_CD        = '0000'                                                                                                                                                                                       "+
      "                        AND C1.BU_CD          = M2.BU_CD                                                                                                                                                                                     "+
      "                        AND C1.OWN_BRAND_CD   = M2.BRAND_CD                                                                                                                                                                                  "+
      "         JOIN CMBRAND C2 ON C2.BRAND_CD       = C1.BRAND_CD                                                                                                                                                                                  "+
      "                        AND C2.REMARK1        = ?                                                                                                                                                                                    "+
      "   WHERE M1.CENTER_CD    LIKE ? || '%'                                                                                                                                                                                                            "+
      "     AND M1.BU_CD          <> '6000'                                                                                                                                                                                                         "+
      "     AND M1.OUTBOUND_STATE IN (WD.C_STATE_ENTRY, WD.C_STATE_DIRECTIONS)                                                                                                                                                                      "+
      "     AND M2.ITEM_CD      LIKE  ? ||'%'                                                                                                                                                                                                 "+
      "   GROUP BY M1.CENTER_CD,M1.BU_CD,M2.BRAND_CD,M2.ITEM_CD,M2.ITEM_STATE,M2.ITEM_LOT                                                                                                                                                           "+
      ")                                                                                                                                                                                                                                            "+
      "SELECT L2.*                                                                                                                                                                                                                                  "+
      "      ,NVL(L2.STOCK_QTY,0) - NVL(T1.OUT_ORDER_QTY,0) - NVL(T2.OUT_WAIT_QTY1,0) AS OUT_QTY1                                                                                                                                                                        "+
      "      ,T1.OUT_ORDER_QTY , T2.OUT_WAIT_QTY1                                                                                                                                                                         "+
      "  FROM (                                                                                                                                                                                                                                     "+
      "        SELECT /*+ INDEX(C3 CMOWNBRAND_IDXPK) */                                                                                                                                                                                             "+
      "               L1.*                                                                                                                                                                                                                          "+
      "              ,C1.CENTER_NM                                                                                                                                                                                                                  "+
      "              ,C3.OWN_BRAND_NM                                                                                                                                                                                                               "+
      "              ,C2.ITEM_NM                                                                                                                                                                                                                    "+
      "              ,C2.ITEM_SPEC                                                                                                                                                                                                                  "+
      "              ,C2.ITEM_DIV                                                                                                                                                                                                                   "+
      "              ,C5.CODE_NM              AS ITEM_DIV_D                                                                                                                                                                                         "+
      "          FROM (                                                                                                                                                                                                                             "+
      "                SELECT /*+ INDEX(M1 LS010NM_IDXPK) */                                                                                                                                                                                        "+
      "                       M1.CENTER_CD                                                                                                                                                                                                          "+
      "                      ,M1.BU_CD                                                                                                                                                                                                              "+
      "                      ,C1.BU_NM                                                                                                                                                                                                              "+
      "                      ,M1.BRAND_CD                                AS OWN_BRAND_CD                                                                                                                                                            "+
      "                      ,M1.ITEM_CD                                                                                                                                                                                                            "+
      "                      ,M1.ITEM_LOT                                                                                                                                                                                                           "+
      "                      ,M1.ITEM_STATE                                                                                                                                                                                                         "+
      "                      ,WF.DSP_COMBO (M1.ITEM_STATE ,C6.CODE_NM)   AS ITEM_STATE_F                                                                                                                                                            "+
      "                      ,SUM(M1.STOCK_QTY)                          AS STOCK_QTY                                                                                                                                                               "+
      "                      ,C7.BRAND_CD                                                                                                                                                                                                           "+
      "                  FROM LS010NM M1                                                                                                                                                                                                            "+
      "                       JOIN CMBU     C1   ON C1.BU_CD        = M1.BU_CD                                                                                                                                                                      "+
      "                       JOIN CMCODE   C6   ON C6.CODE_CD      = M1.ITEM_STATE                                                                                                                                                                 "+
      "                                         AND C6.CODE_GRP     = WF.GET_CODE_GRP('ITEM_STATE')                                                                                                                                                 "+
      "                       JOIN CMROLE   C7   ON C7.CUST_CD      = '0000'                                                                                                                                                                        "+
      "                                         AND C7.BU_CD        = M1.BU_CD                                                                                                                                                                      "+
      "                                         AND C7.OWN_BRAND_CD = M1.BRAND_CD                                                                                                                                                                   "+
      "                                         AND C7.BRAND_CD     = (                                                                                                                                                                             "+
      "                                                                SELECT /*+ INDEX(C1 CMBRAND_IDXPK) */                                                                                                                                        "+
      "                                                                       C1.BRAND_CD                                                                                                                                                           "+
      "                                                                  FROM CMBRAND C1                                                                                                                                                               "+
      "                                                                 WHERE C1.REMARK1 = ?                                                                                                                                                        "+
      "                                                               )                                                                                                                                                                             "+
      "                  WHERE M1.CENTER_CD   LIKE ? || '%'                                                                                                                                                                                         "+
      "                    AND M1.BU_CD         <> '6000'                                                                                                                                                                                           "+
      "                    AND M1.ITEM_STATE  LIKE UPPER(?) || '%'                                                                                                                                                                                  "+
      "                    AND M1.ITEM_CD     LIKE ? ||'%'                                                    "+
      "                  GROUP BY M1.CENTER_CD                                                                                                                                                                                                      "+
      "                          ,M1.BU_CD                                                                                                                                                                                                          "+
      "                          ,C1.BU_NM                                                                                                                                                                                                          "+
      "                          ,M1.BRAND_CD                                                                                                                                                                                                       "+
      "                          ,M1.ITEM_CD                                                                                                                                                                                                        "+
      "                          ,M1.ITEM_LOT                                                                                                                                                                                                       "+
      "                          ,M1.ITEM_STATE                                                                                                                                                                                                     "+
      "                          ,C6.CODE_NM                                                                                                                                                                                                        "+
      "                          ,C7.BRAND_CD                                                                                                                                                                                                       "+
      "                  ORDER BY M1.CENTER_CD                                                                                                                                                                                                      "+
      "                          ,M1.BU_CD                                                                                                                                                                                                          "+
      "                          ,C1.BU_NM                                                                                                                                                                                                          "+
      "                          ,M1.BRAND_CD                                                                                                                                                                                                       "+
      "                          ,M1.ITEM_CD                                                                                                                                                                                                        "+
      "                          ,M1.ITEM_STATE                                                                                                                                                                                                     "+
      "                          ,C6.CODE_NM                                                                                                                                                                                                        "+
      "         ) L1                                                                                                                                                                                                                                "+
      "               JOIN CMCENTER   C1 ON C1.CENTER_CD    = L1.CENTER_CD                                                                                                                                                                          "+
      "               JOIN CMITEM     C2 ON C2.BRAND_CD     = L1.OWN_BRAND_CD                                                                                                                                                                       "+
      "                                 AND C2.ITEM_CD      = L1.ITEM_CD                                                                                                                                                                            "+
      "               JOIN CMOWNBRAND C3 ON C3.BU_CD        = L1.BU_CD                                                                                                                                                                              "+
      "                                 AND C3.OWN_BRAND_CD = L1.OWN_BRAND_CD                                                                                                                                                                       "+
      "               JOIN CMCODE     C5 ON C5.CODE_CD      = C2.ITEM_DIV                                                                                                                                                                           "+
      "                                 AND C5.CODE_GRP     = 'ITEM02'                                                                                                                                                                              "+
      "       ) L2                                                                                                                                                                                                                                  "+
      "        LEFT JOIN T_LO010NMD T1 ON T1.CENTER_CD   = L2.CENTER_CD                                                                                                                                                                             "+
      "                               AND T1.BU_CD       = L2.BU_CD                                                                                                                                                                                 "+
      "                               AND T1.BRAND_CD    = L2.OWN_BRAND_CD                                                                                                                                                                          "+
      "                               AND T1.ITEM_CD     = L2.ITEM_CD                                                                                                                                                                               "+
      "                               AND T1.ITEM_STATE  = L2.ITEM_STATE                                                                                                                                                                            "+
      "                               AND T1.ITEM_LOT    = L2.ITEM_LOT                                                                                                                                                                              "+
      "        LEFT JOIN T_LO020NMD T2 ON T2.CENTER_CD   = L2.CENTER_CD                                                                                                                                                                             "+
      "                               AND T2.BU_CD       = L2.BU_CD                                                                                                                                                                                 "+
      "                               AND T2.BRAND_CD    = L2.OWN_BRAND_CD                                                                                                                                                                          "+
      "                               AND T2.ITEM_CD     = L2.ITEM_CD                                                                                                                                                                               "+
      "                               AND T2.ITEM_STATE  = L2.ITEM_STATE                                                                                                                                                                                 "+
      "                               AND T2.ITEM_LOT    = L2.ITEM_LOT                                                                                                                                                                                          "+
      "  WHERE L2.ITEM_NM     LIKE '%'|| ? || '%'                                                                                                                                                                                                               "+
      "  ORDER BY L2.CENTER_CD                                                                                                                                                                                                                      "+
      "          ,L2.BU_CD                                                                                                                                                                                                                          "+
      "          ,L2.OWN_BRAND_CD                                                                                                                                                                                                                   "+
      "          ,L2.ITEM_CD                                                                                                                                                                                                                        "+
      "          ,L2.ITEM_STATE                                                                                                                                                                                                                     "+
      ")A                                                                                                                                                                                                                                                          "+
      ")                                                                                                                                                                                                                                                           "+
      "ORDER BY 2                                                                                                                                                                                                                                                  ";
    
		//System.out.println("\n Send_WmpQuery CheckYn -[ N ]: " + Send_WmpQuery + '\t');
    connect = DriverManager.getConnection(DBurl, userName, passwd);
    pstmt = connect.prepareStatement(Send_WmpQuery);
    //System.out.println("\n INPUT Send_WmpQuery: " + Send_WmpQuery + '\t');
    }
		
		////////////////////////////////////////////////////////////////////////////////
		 
      System.out.println("\n 대상 생성 조건 Param  " + '\t' + '\n');
      System.out.println("\n INPUT CompanyId: " + CompanyId + '\t'+ '\n');
      System.out.println("\n INPUT CenterCd : " + CenterCd + '\t'+ '\n');
      System.out.println("\n INPUT CompanyId: " + ItemCd + '\t'+ '\n');
      System.out.println("\n INPUT CompanyId: " + CompanyId + '\t'+ '\n');
			System.out.println("\n INPUT CenterCd : " + CenterCd + '\t'+ '\n');
			System.out.println("\n INPUT CenterCd: " + CenterCd + '\t'+ '\n');
			System.out.println("\n INPUT ItemState: " + ItemState + '\t'+ '\n');
			System.out.println("\n INPUT ItemNm   : " + ItemNm + '\t'+ '\n');
			System.out.println("\n INPUT CheckYn  : " + CheckYn + '\t'+ '\n');
			
			pstmt.setString(1, CompanyId);
      pstmt.setString(2, CenterCd);
      pstmt.setString(3, ItemCd);
      pstmt.setString(4, CompanyId);
      pstmt.setString(5,CenterCd);
      pstmt.setString(6, ItemCd);
      pstmt.setString(7, CompanyId);
      pstmt.setString(8, CenterCd);
      pstmt.setString(9, ItemState);
      pstmt.setString(10, ItemCd);
      pstmt.setString(11, ItemNm);
      
			
			//pstmt.setLong(2, i);
			rs = pstmt.executeQuery();
			
			while (rs.next()) {
				org.json.JSONObject childObj = new org.json.JSONObject();
				
				/*
				System.out.println("# item_cd " 			+ rs.getString(9) + '\t');
				System.out.println("# own_brand_cd " 	+ rs.getString(4) + '\t');
				System.out.println("# own_brand_nm " 	+ rs.getString(5) + '\t'); 
				System.out.println("# item_cd " 		+ rs.getString(6) + '\t');
				System.out.println("# item_lot " 		+ rs.getString(7) + '\t');
				System.out.println("# item_nm " 		+ rs.getString(8) + '\t');
				System.out.println("# item_state " 		+ rs.getString(9) + '\t');
				System.out.println("# item_spec " 		+ rs.getString(10) + '\t');
				System.out.println("# item_state_f " 	+ rs.getString(11) + '\t'); 
				System.out.println("# stock_qty " 		+ rs.getString(12) + '\t');
				System.out.println("# item_div " 		+ rs.getString(13) + '\t');
				System.out.println("# item_div_d " 		+ rs.getString(14) + '\t');
				System.out.println("# out_order_qty " 	+ rs.getString(15) + '\t');
				System.out.println("# out_wait_qty1 " 	+ rs.getString(14) + '\t');
				System.out.println("# out_qty1 " 		+ rs.getString(15) + '\t');
				*/
				//int pageNo = 0;
				//System.out.println("\n pageNo 0 : "    + rs.getString(1) + '\t');
				//pageNo = (int)rs.getLong(1);
				//System.out.println("\n pageNo 1 : "    + pageNo + '\t');
        //Page 단위로 Response
				System.out.println("\n # page_end_position "     + page_end_position + '\t' + '\n');
				System.out.println("\n # page_total_cnt "    + page_total_cnt + '\t' + '\n');

        //System.out.println("\n pageNo Start i: "    + i + '\t');
				//for(int j=0; j < 10 ; j++){
				//  System.out.println("\n pageNo Start j: "    + j + '\t');
				try {
				  childObj.put("page_num",          (rs.getString(1) == null) ? "" : rs.getString(1));  /**/
				  childObj.put("pagesub_num",        (rs.getString(2) == null) ? "" : rs.getString(2));  /**/
				  childObj.put("center_cd",    	(rs.getString(3) == null) ? "" : rs.getString(3));  /**/
					//childObj.put("bu_cd",    	 	(rs.getString(4) == null) ? "" : rs.getString(4));  /**/
					//childObj.put("bu_nm",    	 	(rs.getString(5) == null) ? "" : rs.getString(5));  /**/
					//childObj.put("own_brand_cd",    (rs.getString(6) == null) ? "" : rs.getString(6));  /**/
					//childObj.put("own_brand_nm",    (rs.getString(7) == null) ? "" : rs.getString(7));  /**/
					childObj.put("item_cd",    	 	(rs.getString(8) == null) ? "" : rs.getString(8));  /**/
					//childObj.put("item_lot",    	(rs.getString(9) == null) ? "" : rs.getString(9));  /**/
					childObj.put("item_nm",    		(rs.getString(10) == null) ? "" : rs.getString(10));  /**/
					//childObj.put("item_state",    	(rs.getString(11) == null) ? "" : rs.getString(11));  /**/
					childObj.put("item_spec",    	(rs.getString(12) == null) ? "" : rs.getString(12)); /**/
					childObj.put("item_state_f",    (rs.getString(13) == null) ? "" : rs.getString(13)); /**/
					childObj.put("stock_qty",    	(rs.getString(14) == null) ? "" : rs.getString(14)); /**/
					//childObj.put("item_div",        (rs.getString(15) == null) ? "" : rs.getString(15)); /**/
					//childObj.put("item_div_d",    	(rs.getString(16) == null) ? "" : rs.getString(16)); /**/
					childObj.put("out_order_qty",   (rs.getString(17) == null) ? "" : rs.getString(17)); /**/
					childObj.put("out_wait_qty1",   (rs.getString(18) == null) ? "" : rs.getString(18)); /**/
					childObj.put("out_qty1",        (rs.getString(19) == null) ? "" : rs.getString(19)); /**/
					//page_total_Check_cnt = rs.getString(20);
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
				
        jArray.put(childObj);
        
			 }
      
      try {
        System.out.println("송신 대상 건수  0: [ " + page_total_Check_cnt + " ]" + '\t');
        System.out.println("송신 대상 건수  0: [ " + page_total_Check_cnt + " ]" + '\t');
          parentObj.put("TotalCnt",page_total_Check_cnt);
          parentObj.put("Entry", jArray);
          
          String SetResponseData = ((Object) parentObj).toString(); 
          SetResSultData = SetResponseData;
          System.out.println("Send Data : [ " + SetResponseData + "] " + '\t');
          
        } catch (JSONException e) {
          // TODO Auto-generated catch block 
          e.printStackTrace();
        }
			 //송신 대상 정보 확인
			 // System.out.println("송신 대상 건수  0: [ " + rs.getRow() + " ]" + '\t');
			 /* 
			 if(rs.getRow() == 0){
        System.out.println("송신 대상 건수  1: [ " + rs.getRow() + " ]" + '\t');
        
        org.json.JSONObject NochildObj = new org.json.JSONObject();
        org.json.JSONObject NoparentObj = new org.json.JSONObject();
        org.json.JSONArray NoArray = new org.json.JSONArray();
        
        NochildObj.put("code",   "900");
        NochildObj.put("message",   "판매사 ID : [ " + CompanyId + "]" + " 송신 DATA 없습니다.");
        NoArray.put(NochildObj);
        NoparentObj.put("result", NochildObj);
        String SetResponseErrData = ((Object) NoparentObj).toString();
        SetResSultErrData = SetResponseErrData;
        
        System.out.println("\n Send Data Err: [ " + SetResSultErrData + "] " + '\t');
        // End time
        long endTime = System.currentTimeMillis();
        EndTime = endTime;
        System.out.println("\n 요청종료시간  :  " + endTime);
        
        long lTime = endTime - startTime;
        AirTime = lTime/1000.0f +"초"; 
        System.out.println("TIME : " + lTime + "(ms)");
        
        try {
          ResultProcess();
        } catch (SQLException e) {
          // TODO Auto-generated catch block
          e.printStackTrace();
        }
        if (pstmt != null){
            pstmt.clearParameters();
            pstmt.close();
            connect.close();
        }
        return SetResSultErrData;
       }
       */
			/* woo  
		  for(int i=1; i < page_end_position ; i++)
		  {
				try {
				  parentObj.put("Page",i);
          parentObj.put("Entry", jArray);
          String SetResponseData = ((Object) parentObj).toString(); 
          SetResSultData = SetResponseData;
					//System.out.println("Send Data : [ " + SetResponseData + "] " + '\t'); 
				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
		  }
		  */
				//System.out.println("송신 대상 건수  1: [ " + page_total_cnt + " ]" + '\t');
				
		  if (pstmt != null){
    			pstmt.clearParameters();
    			pstmt.close();
    			connect.close();
		  }
	 
		} catch (SQLException e) {
			// TODO Auto-generated catch block 
			e.printStackTrace();
		}
  
	  //System.out.println("\n Send Data : [ " + SetResSultData + "] " + '\t');
	 // End time
	 long endTime = System.currentTimeMillis();
	 EndTime = endTime;
	 System.out.println("\n 요청종료시간  :  " + endTime);
	
	long lTime = endTime - startTime;
	AirTime = lTime/1000.0f +"초";
	System.out.println("TIME : " + lTime + "(ms)");
	 
	try {
		ResultProcess();
	} catch (SQLException e) {
		// TODO Auto-generated catch block
		e.printStackTrace();
	}
	
 //}//FOR END
	
	return SetResSultData;
	

	}
  
	}
