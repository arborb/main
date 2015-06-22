//package nexos;
//
//import java.io.BufferedReader;
//import java.io.IOException;
//import java.io.InputStreamReader;
//import java.io.OutputStream;
//import java.net.HttpURLConnection;
//import java.net.MalformedURLException;
//import java.net.URL;
//import java.sql.Connection;
//import java.sql.SQLException;
//
//import org.json.JSONObject;
//
//public class WmsRestPost_TEST {
//
//private static Connection dBconnect;
//
//static int RecvStatus = 0;
//
//
//
//	/*---------------------------------------------------------------*/
////  Date --> ��ȯó��.
//	private static java.sql.Date getCurrentDate() {
//	    java.util.Date today = new java.util.Date();
//	    return new java.sql.Date(today.getTime());
//	}
///*-----------------------------------------------------------------*/
//
//public static void JOBLog_Send(JSONObject parentObj) throws SQLException {}
//
//	public static void main(String[] args) {
//
//
//	    org.json.JSONObject parentObj = new org.json.JSONObject();
//	    org.json.JSONObject parentObj_result = new org.json.JSONObject();
//
//	    org.json.JSONArray jArray = new org.json.JSONArray();
//
//		try {
//			System.out.println("Rest Post Start   ...: " + '\t');
//
//			URL url = new URL("http://121.135.236.70:8080/rest/stock/");
//			//URL url = new URL("http://localhost:8080/WmsWebService/rest/stock/");
//
//			HttpURLConnection conn = (HttpURLConnection) url.openConnection();
//			conn.setDoOutput(true);
//			conn.setRequestMethod("POST");
//			conn.setRequestProperty("Content-Type", "application/json");
////wmpp83936
//			String input = "wmpp13999";
//			System.out.println("WMP Input ......: " + input + '\t');
//
//			OutputStream os = conn.getOutputStream();
//			System.out.println(input.getBytes());
//			os.write(input.getBytes());
//			os.flush();
//
//			BufferedReader br = new BufferedReader(new InputStreamReader(
//					conn.getInputStream()));
//
//			String output;
//			System.out.println("Output from Server .... \n");
//			while ((output = br.readLine()) != null) {
//				System.out.println("Message : [ " + output + " ]" + '\t');
//			}
//
//			RecvStatus = conn.getResponseCode();
//
//
//			System.out.println("RecvStatus : " +RecvStatus);
//
//			if (conn.getResponseCode() == 200) {
//				System.out.println("Connection OK at the [ url ] : " + url
//						+ 't');
//				System.out
//						.println("------------------------------------------- ------- ");
//				try {
//					ResultUpdate(parentObj_result);
//				} catch (SQLException e) {
//					// TODO Auto-generated catch block
//					e.printStackTrace();
//				}
//			} else {
//				System.out.println("Connection failed");
//			}
//
//
//			conn.disconnect();
//
//		} catch (MalformedURLException e) {
//
//			e.printStackTrace();
//
//		} catch (IOException e) {
//
//			e.printStackTrace();
//
//		}
//
//	}
//
//
///*----------------------------------------------------------------*/
//
//	public static void ResultUpdate(JSONObject parentObj_result) throws SQLException
//	  {}
//
//}
