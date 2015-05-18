package nexos.controller.ed;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.ObjectOutputStream;
import java.net.InetAddress;
import java.net.Socket;
import java.net.UnknownHostException;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;

import nexos.common.Consts;
import nexos.controller.common.CommonController;
import nexos.service.ed.ED03110EService;

import org.json.simple.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.commons.CommonsMultipartFile;

/**
 * Class: [수신]공급처마스터 관리<br>
 * Description: [수신]공급처마스터 관리 Controller<br>
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
@Controller
@RequestMapping("/ED03110E")
public class ED03110EController extends CommonController {

  @Resource
  private ED03110EService service;

  /**
   * 데이터 조회
   * 
   * @param request HttpServletRequest
   * @param queryId 쿼리ID
   * @param queryParams 쿼리 호출 파라메터
   * @return
   */
  @RequestMapping(value = "/getDataSet.do", method = RequestMethod.POST)
  public ResponseEntity<String> getDataSet(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_ID) String queryId, @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.getDataSet(queryId, params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * DBLink 수신 처리
   * 
   * @param request
   * @param queryId
   * @param queryParams
   * @return
   */
  @RequestMapping(value = "/recvDBLink.do", method = RequestMethod.POST)
  public ResponseEntity<String> recvDBLink(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_ID) String queryId, @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }
    params.put(Consts.PK_QUERY_ID, queryId);

    try {
      result = getResponseEntity(request, service.recvProcessing(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * File(Excel, Text) 수신 처리
   * 
   * @param request
   * @param ediFile
   * @param queryId
   * @param queryParams
   * @return
   */
  @RequestMapping(value = "/recvFile.do", method = RequestMethod.POST)
  public ResponseEntity<String> recvFile(HttpServletRequest request,
    @RequestParam("P_UPLOAD_FILE") CommonsMultipartFile ediFile, @RequestParam(Consts.PK_QUERY_ID) String queryId,
    @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      if (ediFile.isEmpty()) {
        throw new RuntimeException("빈 파일입니다. 다른 파일을 선택하십시오.");
      }
      params.put(Consts.PK_QUERY_ID, queryId);
      params.put("P_UPLOAD_FILE", ediFile);
      params.put("P_FILE_DIV", "2"); // "2" - FILE_DIV_ATTACHMENT

      result = getResponseEntity(request, service.recvProcessing(params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * SP 처리 - 종료 수신처리
   * 
   * @param params
   * 조회조건
   */
  @RequestMapping(value = "/callERProcessing.do", method = RequestMethod.POST)
  public ResponseEntity<String> callERProcessing(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_ID) String queryId, @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    Map<String, Object> params = getParameter(queryParams);
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      result = getResponseEntity(request, service.callERProcessing(queryId, params));
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  /**
   * Socket통신 수신 처리
   * 
   * @param request
   * @return
   */
  @RequestMapping(value = "/recvSocket.do", method = RequestMethod.POST)
  public ResponseEntity<String> recvSocket(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_ID) String queryId, @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;
    Socket requestSocket = null;
    ObjectOutputStream oos = null;
    BufferedReader in = null;
    String pId;
    String strPid = null;

    Map<String, Object> params = getParameter(queryParams);
    String jarFileName = (String)params.get("P_COMMAND");
    
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    try {
      InetAddress host = InetAddress.getLocalHost();
      Socket socket = new Socket(host.getHostName(), 5000);
      oos = new ObjectOutputStream(socket.getOutputStream());
      in = new BufferedReader(new InputStreamReader(socket.getInputStream(), "UTF-8"));
      oos.writeObject("java -jar " + jarFileName);
      pId = in.readLine();
      strPid = pId.split("@")[1];

    } catch (UnknownHostException e) {
      e.printStackTrace();
    } catch (IOException e) {
      e.printStackTrace();
    } catch (Exception e) {
      e.printStackTrace();
    } finally {
      try {
        if (in != null)
          in.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
      try {
        if (oos != null)
          oos.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
      try {
        if (requestSocket != null)
          requestSocket.close();
      } catch (IOException e) {
        e.printStackTrace();
      }
    }

    try {
//      result = getResponseEntity(request, (JsonDataSet)jsonObj.put("RESULT", "success"));
      result = getResponseEntity(request, "0");
    } catch (Exception e) {
      result = getResponseEntityError(request, e);
    }

    return result;
  }

  private void sendMessage(String msg, ObjectOutputStream out) {
    try {

      System.out.println("===========================  msg =================");
      System.out.println(msg);
      out.writeObject(msg);
      out.flush();
    } catch (IOException e) {
      e.printStackTrace();
    }
  }

  @RequestMapping(value = "/executeShellCommand.do", method = RequestMethod.POST)
  public ResponseEntity<String> executeShellCommand(HttpServletRequest request,
    @RequestParam(Consts.PK_QUERY_ID) String queryId, @RequestParam(Consts.PK_QUERY_PARAMS) String queryParams) {

    ResponseEntity<String> result = null;

    System.out.println("==============    executeShellCommand   ==================");
    System.out.println("queryId:   " + queryId);

    Map<String, Object> params = getParameter(queryParams);
    System.out.println("P_COMMAND:  " + (String)params.get("P_COMMAND"));
    String oMsg = getResultMessage(params);
    if (!Consts.OK.equals(oMsg)) {
      result = getResponseEntityError(request, oMsg);
      return result;
    }

    System.out.println("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
    ED03110EController controller = new ED03110EController();
    // java -jar /opt/TEST_QA/JOB/DaemonServer.jar start
    // controller.executeCommand((String)params.get("P_COMMAND"));
    // System.out.println("111: " + controller.executeCommand((String)params.get("P_COMMAND")));
    // controller.executeCommand((String)params.get("P_COMMAND"));
    controller.executeCommand2((String)params.get("P_COMMAND"));
    result = getResponseEntity(request, "");
    // result = getResponseEntity(request, controller.executeCommand((String)params.get("P_COMMAND")));
    System.out.println("###############################################");

    // result = getResponseEntity(request, "");
    System.out.println("result:  " + result);

    return result;
  }

  
  public void shellCmd(String command) throws Exception {
    Runtime runtime = Runtime.getRuntime();
    Process process = runtime.exec(command);
    InputStream is = process.getInputStream();
    InputStreamReader isr = new InputStreamReader(is);
    BufferedReader br = new BufferedReader(isr);
    String line;
    while((line = br.readLine()) != null) {
             System.out.println(line);
    }
}
  public void executeCommand2(String command) {
    String result = "";
    String s = "";
    try {
      Process oProcess = new ProcessBuilder(command).start();
      BufferedReader stdOut = new BufferedReader(new InputStreamReader(oProcess.getInputStream()));
      BufferedReader stdError = new BufferedReader(new InputStreamReader(oProcess.getErrorStream()));

      // "표준 출력"과 "표준 에러 출력"을 출력
      while ((s = stdOut.readLine()) != null)
        System.out.println(s);
      while ((s = stdError.readLine()) != null)
        System.err.println(s);

      // 외부 프로그램 반환값 출력 (이 부분은 필수가 아님)
      System.out.println("Exit Code: " + oProcess.exitValue());
      System.exit(oProcess.exitValue());
    } catch (IOException e) {
      System.err.println("에러! 외부 명령 실행에 실패했습니다.\n" + e.getMessage());
      System.exit(-1);
    }

    // return result;
  }

  public JSONObject executeCommand(String command) {

    System.out.println("==============   커맨드 ================");
    JSONObject resultJson = new JSONObject();
    Process process = null;

    try {
      System.out.println("=============   커맨드 실행 전  ==================");
      process = Runtime.getRuntime().exec(command);
      System.out.println(" ====================  커맨드 실행 후 =========");

      // try {
      // int wf = process.waitFor();
      // System.err.println(wf);
      // } catch (InterruptedException e) {
      // }

      System.out.println("11111111111111111111");
      // process.waitFor();
      // try {
      // int ev = process.exitValue();
      // System.err.println("EV: " + ev + " " + process);
      // } catch (IllegalThreadStateException ile) {
      // System.err.println("X: " + ile);
      // }

      System.out.println("222222222222222222222222222222");

      // System.out.println("1111111111111111");
      // process.destroy();
      // System.out.println("222222222222222222");
      // process.exitValue();
      // System.out.println("===========   exitValue:     " + process.exitValue());
      // int exitValue = process.exitValue();
      // System.out.println("333333333333333");
      // System.out.println("exitValue:   " + exitValue);
      // if (exitValue == 0) {
      // resultJson.put("RESULT", "success");
      // } else {
      // resultJson.put("RESULT", "fail");
      // }

      System.out.println("끝끝끝끝끝끝끝끝끝끝끝끝끝끝끝끝끝끝끝끝끝끝끝끝끝끝끝끝");
    } catch (IOException e) {
      e.printStackTrace();
      // } catch (InterruptedException e) {
      // e.printStackTrace();
    } finally {
      if (process != null) {
        System.out.println("============   디스트로이 전 =====================");
        process.destroy();
        System.out.println("============   디스트로이 후 =====================");
      }
    }
    // System.exit(0);
    return resultJson;
  }

  // class DaemonServer implements Daemon {
  //
  // private static final String COMMAND_SHUTDOWN = "shutdown";
  // private static final int COMMAND_PORT = 2044;
  //
  // private boolean started;
  // private Random random;
  // private Timer timer;
  // private String command;
  //
  // public JSONObject resultJson;
  //
  // private ED03110EController controller;
  //
  // private DaemonServer(String command) {
  // this.started = false;
  // this.random = null;
  // this.timer = null;
  // this.command = command;
  // this.controller = new ED03110EController();
  // }
  //
  // @Override
  // public void destroy() {
  // }
  //
  // @Override
  // public void init(DaemonContext arg0) throws DaemonInitException, Exception {
  // }
  //
  // @Override
  // public void start() throws Exception {
  // // this.timer = new Timer();
  // //
  // // timer.scheduleAtFixedRate(new TimerTask() {
  // //
  // // @Override
  // // public void run() {
  // // if (started) {
  // //
  // // // ED03110EController controller = new ED03110EController();
  // // // if(!command.equals("") || command != null){
  // // // resultJson = controller.executeCommand(command);
  // // // }
  // //
  // // if(!command.equals("") || command != null){
  // // if(!command.equals("shutdown")){
  // //
  // // }
  // // }
  // //
  // // }
  // // }
  // // }, new Date(), 1000 * 3);
  // System.out.println("================ run  =================");
  //
  // await();
  // }
  //
  // protected void await() {
  // System.out.println("===============   await   ===================");
  // String cmd = "";
  // try {
  // ServerSocket serverSocket = null;
  // try {
  // serverSocket = new ServerSocket(COMMAND_PORT, 1, InetAddress.getByName("14.32.68.207"));
  // started = true;
  // } catch (IOException e) {
  // e.printStackTrace();
  // }
  // while (started) {
  //
  // System.out.println("================= while  ======================");
  // Socket socket = null;
  // InputStream stream = null;
  // try {
  // System.out.println("==========================   Before Socket   ===========================");
  // socket = serverSocket.accept();
  // System.out.println("socket.getChannel:      " + socket.getChannel());
  // //socket.isBound()
  // // socket.setSoTimeout(10 * 1000); // 타임아웃 10초... 나중에 실제 시간으로 바꿔야 함.
  // stream = socket.getInputStream();
  // } catch (AccessControlException e) {
  // continue;
  // } catch (IOException e) {
  // System.exit(1);
  // }
  //
  // BufferedReader in = new BufferedReader(new InputStreamReader(stream));
  // cmd = in.readLine();
  //
  // System.out.println("cmd:   " + cmd);
  //
  // if(!cmd.equals("shutdown")){
  // controller.executeCommand(cmd);
  // }
  //
  // try {
  // socket.close();
  // } catch (IOException ignore) {
  // }
  //
  // // String cmd = command.toString();
  //
  // if (!cmd.equals("") || cmd != null) {
  // break;
  // }
  // }
  // try {
  // serverSocket.close();
  // } catch (IOException ignore) {
  // }
  // } catch (Throwable t) {
  // t.printStackTrace();
  // } finally {
  // try {
  // if(cmd.equals("shutdown")) stop();
  // } catch (Throwable ignore) {
  // }
  // }
  // }
  //
  // @Override
  // public void stop() throws Exception {
  // this.timer.cancel();
  // this.timer = null;
  // }
  // }
}

class SystemUtils {

  private SystemUtils() {
  }

  public static long getPID() {
    String processName = java.lang.management.ManagementFactory.getRuntimeMXBean().getName();
    return Long.parseLong(processName.split("@")[0]);
  }
}
