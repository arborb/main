package nexos.service.ed;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.ObjectOutputStream;
import java.net.InetAddress;
import java.net.Socket;
import java.util.HashMap;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;

import nexos.common.Consts;
import nexos.common.ibatis.JsonDataSet;
import nexos.service.common.CommonDAO;
import nexos.service.ed.common.EDCommonDAO;

@Service("ED10010E")
public class ED10010EService {

  /**
   * DAO 주입처리하기
   */
  @Resource
  private CommonDAO                  common;

  @Resource
  private EDCommonDAO                edCommon;

  @Resource
  private PlatformTransactionManager transactionManager;

  /**
   * Query 실행 후 조회 데이터를 List 형태로 Return
   */
  public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

    return common.getJsonDataSet(queryId, params);
  }
  
  /**
   * SocketServer 5000번 상태 확인
   */
  public HashMap<String, String> getSocketServerState() {

    HashMap<String, String> mapResult = new HashMap<String, String>();
    
    if(System.getProperty("socketServerPID") != null) {
      mapResult.put("socketState", System.getProperty("socketServerState"));
    } else {
      mapResult.put("socketState", "OFF");
      System.setProperty("socketServerState", "OFF");
      System.setProperty("socketServerPID", "0");
    }
    return mapResult;
  }
  
  /**
   * SocketServer 시작하기
   */
  public HashMap<String, String> socketServerStart() {

    HashMap<String, String> mapResult = new HashMap<String, String>();

    ObjectOutputStream oos = null;
    BufferedReader in = null;
    
    // 소켓서버가 이미 시작됬는지 확인
    mapResult = getSocketServerState();
    if(mapResult.get("socketState").equals("ON")){
      return mapResult;
    };

    try {
      
      System.out.println("------------------소켓서버 스타트 시도----------------------");
      //Runtime.getRuntime().exec("/opt/TEST_QA/WMP/recv/./InterFace_Socket.sh");
      Runtime.getRuntime().exec("java -jar /opt/TEST_QA/WMP/recv/SocketServer.jar");
      //Runtime.getRuntime().exec("java -jar E:\\socketServer.jar");
      System.out.println("------------------소켓서버 스타트 완료----------------------");
      
      this.sleep(2000);
      
      System.out.println("------------------소켓연결 시도----------------------");
      InetAddress host = InetAddress.getLocalHost();
      Socket socket = new Socket(host.getHostName(), 5000);
      oos = new ObjectOutputStream(socket.getOutputStream());
      in = new BufferedReader(new InputStreamReader(socket.getInputStream(), "UTF-8"));
      System.out.println("------------------소켓연결 완료----------------------");

      System.out.println("------------------jar 오브젝트 생성 시작----------------------");
      //oos.writeObject("java -jar socketServer.jar"); // 동작안하는 코드지만 응답을 위해 실행
      oos.writeObject("");
      System.out.println("------------------jar 오브젝트 생성 종료----------------------");

      System.out.println("------------------ PID 추출 시도----------------------");
      String PID = in.readLine().split("@")[1];
      mapResult.put("socketState", "ON");
      System.setProperty("socketServerState", "ON");
      System.setProperty("socketServerPID", PID);
      System.out.println("------------------ PID : " + PID + "----------------------");

    } catch (Exception e) {

      throw new RuntimeException(e.getMessage());

    } finally {
      try {
        if (in != null) {
          in.close();
        }
      } catch (IOException e) {
        throw new RuntimeException(e.getMessage());
      }
      try {
        if (oos != null) {
          oos.close();
        }
      } catch (IOException e) {
        throw new RuntimeException(e.getMessage());
      }
    }
    
    return mapResult;
  }
  
  /**
   * SocketServer 종료하기
   */
  public HashMap<String, String> socketServerExit() {

    HashMap<String, String> mapResult = new HashMap<String, String>();

    try {
      //Runtime.getRuntime().exec("taskkill /F /PID " + System.getProperty("socketServerPID"));
      Runtime.getRuntime().exec("kill -9 " + System.getProperty("socketServerPID"));
    } catch (IOException e) {
      throw new RuntimeException(e.getMessage());
    }

    mapResult.put("socketState", "OFF");
    System.setProperty("socketServerState", "OFF");
    System.setProperty("socketServerPID", "0");
    
    return mapResult;
  }
  
  /**
   * SocketServer 컨트롤
   */
  public HashMap<String, String> socketServerControl(Map<String, Object> params) {
    
    HashMap<String, String> mapResult = new HashMap<String, String>();
    String COMMAND = (String)params.get("P_COMMAND");
    
    if(COMMAND.equals("start")){ // 소켓서버 시작
      mapResult = socketServerStart();
    } else if(COMMAND.equals("exit")) { // 소켓서버 종료
      mapResult = socketServerExit();
    } else if(COMMAND.equals("getState")) { // 소켓서버 상태 정보
      mapResult = getSocketServerState();
    }
    
    return mapResult;
  }
  
  /**
   * SocketServer 와 통신
   */
  public String recvSocket(Map<String, Object> params) {

    String result;
    String cmd = (String)params.get("P_COMMAND");

    ObjectOutputStream oos = null;
    BufferedReader in = null;
    
    // 소켓서버가 시작됬는지 확인
    HashMap<String, String> mapResult = new HashMap<String, String>();
    mapResult = getSocketServerState();
    if(mapResult.get("socketState").equals("OFF")){
      result = "0"; // 소켓서버 종료된 상태
      return result;
    };

    try {
      
      System.out.println("------------------소켓연결 시도----------------------");
      InetAddress host = InetAddress.getLocalHost();
      Socket socket = new Socket(host.getHostName(), 5000);
      oos = new ObjectOutputStream(socket.getOutputStream());
      in = new BufferedReader(new InputStreamReader(socket.getInputStream(), "UTF-8"));
      System.out.println("------------------소켓연결 완료----------------------");

      System.out.println("------------------jar 오브젝트 생성 시작----------------------");
      //oos.writeObject("java -jar " + cmd + ".jar");
      oos.writeObject("java -jar /opt/TEST_QA/WMP/recv/" + cmd + ".jar");
      System.out.println("------------------jar 오브젝트 생성 종료----------------------");

    } catch (Exception e) {

      throw new RuntimeException(e.getMessage());

    } finally {
      try {
        if (in != null) {
          in.close();
        }
      } catch (IOException e) {
        throw new RuntimeException(e.getMessage());
      }
      try {
        if (oos != null) {
          oos.close();
        }
      } catch (IOException e) {
        throw new RuntimeException(e.getMessage());
      }
    }
    result = Consts.OK;
    return result;
  }
  
  public void sleep(int time) {
    try {
      Thread.sleep(time);
    } catch (InterruptedException e) {}
  }
  
}
