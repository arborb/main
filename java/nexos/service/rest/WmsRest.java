package nexos.service.rest;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;

import org.json.JSONException;

@Path("/state")
public class WmsRest {


	private static Connection dBconnect;
	static int RecvStatus = 0;
/*---------------------------------------------------------------*/
//  Date --> ��ȯó��.
  // private static java.sql.Date getCurrentDate() {
  // java.util.Date today = new java.util.Date();
  // return new java.sql.Date(today.getTime());
  // }
/*-----------------------------------------------------------------*/

	
	@GET
	@Path("/{param}")
	@Produces("application/json")
	public String getMsg(@PathParam("param") String state) {
		String stateDetails = null;
		if (state.equals("KL")) {
			//
			 org.json.JSONObject parentObj = new org.json.JSONObject();
			 org.json.JSONObject childObj = new org.json.JSONObject();
			 org.json.JSONArray jArray = new org.json.JSONArray();

			 System.out.println("JDBC Setting-woo ......: " + '\t');
			 //운영기 --
			 //String DBurl      = "jdbc:oracle:thin:@172.20.50.11:31521:WMSORA";
			 //개발기--
      String DBurl = "jdbc:oracle:thin:@192.168.0.35:1521:WMS11G";
			 String userName   = "WMS_USER";
			 String passwd     = "WMS_PWD";

			PreparedStatement pstmt = null;
			ResultSet rs = null;
			try {
				//System.out.println("JDBC Setting-woo ......: 00" + '\t');
				Class.forName("oracle.jdbc.driver.OracleDriver");
			} catch (ClassNotFoundException e1) {
				// TODO Auto-generated catch block
				e1.printStackTrace();
			}
			Connection connect = null;


			try {
				String Send_WmpQuery = "SELECT "
						+ " IF_ORDER_NO AS ORDER_ID, "
						+ " IF_BOX_NO AS PACKAGE_NO, "
						+ " DATA_DIV AS DATA_TYPE,"
						+ " WB_NO AS INVOICE_NO, "
						+ " CARRIER_CD AS COURIER_COMPANY, "
						+ " '' AS TRACE_CODE,"
						+ " '' AS TRACE_TITLE,"
						+ " SEND_BU_CD AS MALL_CODE, "
						+ " BU_NO AS BU_NO, "
						+ " EDI_DIV AS EDI_DIV, "
						+ " DEFINE_NO AS DEFINE_NO, "
						+ " SEND_NO AS SEND_NO, "
						+ " SEND_SEQ AS SEND_SEQ, "
						+ " BU_CD AS BU_CD "
						+ " FROM ESLOORDER "
						+ " 	WHERE BU_CD IN ('5000','5200') "
						+ "		AND ERROR_DIV = '4' "
						+ "		AND DATA_DIV IN ('1','2') "
						+ "		AND CONFIRM_DATETIME IS NOT NULL "
						+ "		AND ROWNUM < 11 "
						+ "		ORDER BY BU_CD,EDI_DIV,DEFINE_NO,SEND_DATE	,SEND_NO,SEND_SEQ ";


				dBconnect = DriverManager.getConnection(DBurl, userName, passwd);
				pstmt = dBconnect.prepareStatement(Send_WmpQuery);
				rs = pstmt.executeQuery();

			while (rs.next()) {
				/*
				System.out.println("################################################"+'\t');
				System.out.println("ORDER_ID        : " 	+ '\t' 	+ rs.getString(1));
				System.out.println("PACKAGE_NO      : " 	+ '\t' 	+ rs.getString(2));
				System.out.println("DATA_TYPE       : " 	+ '\t' 	+ rs.getString(3));
				System.out.println("INVOICE_NO      : " 	+ '\t'	+ rs.getString(4));
				System.out.println("COURIER_COMPANY : " 	+ '\t' 	+ rs.getString(5));
				System.out.println("TRACE_CODE      : " 	+ '\t'	+ rs.getString(6));
				System.out.println("TRACE_TITLE     : " 	+ '\t' 	+ rs.getString(7));
				System.out.println("MALL_CODE       : " 	+ '\t'	+ rs.getString(8));
				System.out.println("################################################"+'\t');
				System.out.println("BU_NO        	: " 	+ '\t'	+ rs.getString(9));
				System.out.println("EDI_DIV        	: " 	+ '\t'	+ rs.getString(10));
				System.out.println("DEFINE_NO       : " 	+ '\t'	+ rs.getString(11));
				System.out.println("SEND_NO        	: " 	+ '\t'	+ rs.getString(12));
				System.out.println("SEND_SEQ        : " 	+ '\t'	+ rs.getString(13));
				System.out.println("BU_CD           : " 	+ '\t'	+ rs.getString(14));
				System.out.println("SEND_DATE       : " 	+ getCurrentDate());  //woo

				System.out.println("################################################"+'\t');
				*/

				try {

					childObj.put("order_id", 			rs.getString(1) == null ? "" : rs.getString(1));
					childObj.put("package_no", 		    rs.getString(2) == null ? "" : rs.getString(2));
					childObj.put("data_type", 			rs.getString(3) == null ? "" : rs.getString(3));
					childObj.put("invoice_no", 		    rs.getString(4) == null ? "" : rs.getString(4));
					childObj.put("courier_company", 	rs.getString(5) == null ? "" : rs.getString(5));
					childObj.put("trace_code", 		    rs.getString(6) == null ? "" : rs.getString(6));
					childObj.put("trace_tile", 		    rs.getString(7) == null ? "" : rs.getString(7));
					childObj.put("mall_code", 		    rs.getString(8) == null ? "" : rs.getString(8));
					childObj.put("bu_cd"    ,           rs.getString(14) == null? "" : rs.getString(14));

				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}

				//System.out.println("WooList 1- " + childObj);

				jArray.put(childObj);
				System.out.println(childObj);
				//stateDetails = childObj.toString();
				//System.out.println("WooList 2- " + stateDetails);
				if(rs.getRow() == 0){
					System.out.println(" Send Data Count : " + '\t'  	+ rs.getRow());
					return "99";
				}

				try {
					parentObj.put("Entry", jArray);
					String SendData = ((Object) parentObj).toString();
					System.out.println(" 송신건수 : [ " + rs.getRow() + "] " + '\t');
					stateDetails = SendData;

				} catch (JSONException e) {
					// TODO Auto-generated catch block
					e.printStackTrace();
				}
			}

			} catch (SQLException e) {
				System.out.println("2.Exception" + e.getErrorCode() + "::"
						+ e.getMessage());
				e.printStackTrace();
			}finally {
				try {
					if (pstmt != null) {
            pstmt.close();
          }
					if (connect != null) {
            connect.close();
          }
				} catch (SQLException ex) {
					System.out.println("2.Exception" + ex.getErrorCode() + "::"
							+ ex.getMessage());
				}
			}

			//
			//stateDetails = "";
		} else if (state.equals("KA")) {
			//stateDetails = "";
		} else if (state.equals("TN")) {
			//stateDetails = "";
		} else {
			//stateDetails = "Data not found";
		}
		return stateDetails;
	}
	}