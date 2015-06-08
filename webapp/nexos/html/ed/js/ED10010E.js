/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    socketSeverState: "OFF" // 소켓서버 상태
  });
  
  
 // 검색기간 달력이미지 설정
  $NC.setInitDatePicker("#dtpQEdi_Date1");
  $NC.setInitDatePicker("#dtpQEdi_Date2");
 
  $('#lblQRecv1_Div').hide();
  $('#lblQRecv2_Div').hide();
  
  // 그리드 초기화
  grdMasterInitialize();

  //woo
  $('#edtQDeal_id').hide();
  // 조회조건 - 사업부 세팅
  $NC.setValue("#edtQBu_Cd",  $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  // 클릭 이벤트 부여
  //
  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnRecv").click(btnRecvProc);
  $("#btnSocketServer").click(btnSocketServer);
  $("#btnStateRefresh").click(function() {
    socketServerControl("getState");
  });
  $("#cboQQRecv_Div").click(ComboSelect);
  
    // 소켓서버 상태 체크
  socketServerControl("getState");
  // 수신구분 콥보 셋팅
  setRecvDivCombo();
  
    var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
 //
 var EDI_DATE1 = $NC.getValue("#dtpQEdi_Date1");
  if ($NC.isNull(EDI_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQEdi_Date1");
    return;
  }
  var EDI_DATE2 = $NC.getValue("#dtpQEdi_Date2");
  if ($NC.isNull(EDI_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQEdi_Date2");
    return;
  }
  EDI_DATE3 = $NC.getValue("#dtpQEdi_Date1");
  EDI_DATE4 = $NC.getValue("#dtpQEdi_Date1");

  // 조회조건 - 수신구분 세팅
  
  $NC.setInitCombo("/ED10010E/getDataSet.do", {
    P_QUERY_ID: "ED10010E.RS_DETAIL",
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: "",
      P_EDI_DATE1: EDI_DATE1,
      P_EDI_DATE2: EDI_DATE2
    })
  }, {
    selector: "#cboQQNum_Div",
    codeField: "PAGE",
    //nameField: "PAGE",
    fullNameField: "PAGE",
    addAll: true,
    onComplete: function() {
      $NC.setValue("#cboQQNum_Div","%");
    }
  });
  
//    

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  
  $NC.G_OFFSET.stockGridHeight = 150;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $("#divTopView").outerHeight() ;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);
  
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMaster", clientWidth, $("#grdMaster").parent().height() - $NC.G_LAYOUT.header);
    
}

/**
 * Key Up Event
 * 
 * @param e
 * @param view
 */

function _OnInputKeyUp(e, view) {
}

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

  
 // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();
  
  switch (id) {
  case "BU_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: val
      };
      O_RESULT_DATA = $NP.getUserBuInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onUserBuPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showUserBuPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onUserBuPopup, onUserBuPopup);
    }
    return;
  }
  
  // 조회 조건에 Object Change
  onChangingCondition();
}

/**
 * 조회조건이 변경될 때 호출
 */
function onChangingCondition() {
  // 초기화
  var EDI_DATE1 = $NC.getValue("#dtpQEdi_Date1");
  var EDI_DATE2 = $NC.getValue("#dtpQEdi_Date2");
  
  
  $NC.clearGridData(G_GRDMASTER);
  
  if(EDI_DATE1 != EDI_DATE3) {
  //
  $NC.setInitCombo("/ED10010E/getDataSet.do", {
    P_QUERY_ID: "ED10010E.RS_DETAIL",
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: "",
      P_EDI_DATE1: EDI_DATE1,
      P_EDI_DATE2: EDI_DATE2
    })
  }, {
    selector: "#cboQQNum_Div",
    codeField: "PAGE",
    //nameField: "PAGE",
    fullNameField: "PAGE",
    addAll: true,
    onComplete: function() {
      $NC.setValue("#cboQQNum_Div","%");
    }
  });
//    
  }

  if(EDI_DATE2 != EDI_DATE4){
//
$NC.setInitCombo("/ED10010E/getDataSet.do", {
    P_QUERY_ID: "ED10010E.RS_DETAIL",
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: "",
      P_EDI_DATE1: EDI_DATE1,
      P_EDI_DATE2: EDI_DATE2
    })
  }, {
    selector: "#cboQQNum_Div",
    codeField: "PAGE",
    //nameField: "PAGE",
    fullNameField: "PAGE",
    addAll: true,
    onComplete: function() {
      $NC.setValue("#cboQQNum_Div","%");
    }
  });
//    
  
  } 
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
 //
 var EDI_DATE1 = $NC.getValue("#dtpQEdi_Date1");
  if ($NC.isNull(EDI_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQEdi_Date1");
    return;
  }
  var EDI_DATE2 = $NC.getValue("#dtpQEdi_Date2");
  if ($NC.isNull(EDI_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQEdi_Date2");
    return;
  }
 
 //
  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  
  var index_send = $("#cboQQNum_Div option").index($("#cboQQNum_Div option:selected"));
  
 if(index_send == 0){
  alert(" [전체] 조회 는 불가 합니다. [페이지번호] 를 선택하세요."); 
}
//
// 조회조건 - 수신구분 세팅
/*
  $NC.setInitCombo("/ED10010E/getDataSet.do", {
    P_QUERY_ID: "ED10010E.RS_DETAIL",
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: "",
      P_EDI_DATE1: EDI_DATE1,
      P_EDI_DATE2: EDI_DATE2
    })
  }, {
    selector: "#cboQQNum_Div",
    codeField: "PAGE",
    //nameField: "PAGE",
    fullNameField: "PAGE",
    addAll: true,
    onComplete: function() {
      $NC.setValue("#cboQQNum_Div","%");
    }
  });
//
*/
  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
      P_BU_CD: index_send,
      P_EDI_DATE1: EDI_DATE1,
      P_EDI_DATE2: EDI_DATE2    
  });
 

 
   // 데이터 조회
    var index = $("#cboQQNum_Div option").index($("#cboQQRecv_Div option:selected"));
    
    $NC.serviceCall("/ED10010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
    
    
 
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 */
function _Print(printIndex, printName) {

}
//

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "RNUM",
    field: "RNUM",
    name: "순번",
    minWidth: 30,
    cssClass: "align-center"
  });
  
  $NC.setGridColumn(columns, {
    id: "GUBUN",
    field: "GUBUN",
    name: "구분",
    minWidth: 50,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "RECV_CODE",
    field: "RECV_CODE",
    name: "수신코드",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "RECV_CODE_NM",
    field: "RECV_CODE_NM",
    name: "수신코드명",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OPEN_DATE",
    field: "OPEN_DATE",
    name: "OPEN_DATE",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CLOSE_DATE",
    field: "CLOSE_DATE",
    name: "CLOSE_DATE ",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DEATIL_RECV_CODE",
    field: "DEATIL_RECV_CODE",
    name: "수신코드 관련 정보",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DEATIL_RECV_CODE_NM",
    field: "DEATIL_RECV_CODE_NM",
    name: "수신코드 관련 정보",
    minWidth: 80,
    cssClass: "align-center"
  });  
  $NC.setGridColumn(columns, {
    id: "RECV_DATETIME",
    field: "RECV_DATETIME",
    name: "수신정보 일시",
    minWidth: 80,
    cssClass: "align-center"
  });   
  
  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "ED10010E.RS_MASTER",
    sortCol: "RECV_DATETIME",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdSubInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: "ED10010E.RS_SUB",
    sortCol: "BRAND_CD",
    gridOptions: options
  });

G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
}

function grdSub1Initialize() {

  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub1", {
    columns: grdSub1OnGetColumns(),
    queryId: "ED10010E.RS_SUB1",
    sortCol: "VENDOR_CD",
    gridOptions: options
  });

G_GRDSUB1.view.onSelectedRowsChanged.subscribe(grdSub1OnAfterScroll);
}

function grdDetailInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "ED10010E.RS_DETAIL",
    sortCol: "BRAND_CD",
    gridOptions: options
  });

G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  var Wrow = G_GRDMASTER.lastRow;

  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트-lee
  $NC.setGridDisplayRows("#grdMaster", row + 1);
  
  var grdRowCount = $("#divRowCount_grdMaster");
  
}

function grdSubOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDSUB.lastRow != null) {
    if (row == G_GRDSUB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub", row + 1);
}

function grdSub1OnAfterScroll(e, args) {

  var row = args.rows[0];
  
  if (G_GRDSUB1.lastRow != null) {
    if (row == G_GRDSUB1.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub1", row + 1);
}


function grdDetailOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDDETAIL.lastRow != null) {
    if (row == G_GRDDETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

function onGetMaster(ajaxData) {

 $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
}

function onGetSub(ajaxData) {

 $NC.setInitGridData(G_GRDSUB, ajaxData);

  if (G_GRDSUB.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDSUB, 0);
  } else {
    $NC.setGridDisplayRows("#grdSub", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
}

function onGetSub1(ajaxData) {
  
     var options = {
             frozenColumn: 2
       };

      gridOptions: options  

 $NC.setInitGridData(G_GRDSUB1, ajaxData,options);
 
 
/*
  if (G_GRDSUB1.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDSUB1, 0);
  } else {
    $NC.setGridDisplayRows("#grdSub1", 0, 0);
  }
*/
if (G_GRDSUB1.data.getLength() > 0) {
    if ($NC.isNull(G_GRDSUB1.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSUB1, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSUB1, {
        selectKey: new Array("VENDOR_CD", "VENDOR_NM", "RECV_DATETIME"),
        selectVal: G_GRDSUB1.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdSub1", 0, 0);
  }
  
  // 버튼 활성화 처리
/*  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
*/  
}

function onGetMaster1(ajaxData) {

    var options = {
    frozenColumn: 4
  };

      gridOptions: options  
//
  $NC.setInitGridData(G_GRDDETAIL, ajaxData,options);
  

  
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: new Array("BRAND_CD", "BRAND_NM", "BRAND_FULL_NM", "MANAGER_ID"),
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }

}

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQBu_Cd", true);
  });
}

//woo
function ComboSelect() {

   //alert("wooooooo"); 
   //select box ID로 접근하여 선택된 값 읽기
   var index = $("#cboQQRecv_Div option").index($("#cboQQRecv_Div option:selected"));
   //alert("woo : " + index);
   if(index == 0){  //전체 딜옵션 수신
     $('#edtQDeal_id').hide();
   }
    if(index == 1){   //전체 판매사 수신
     $('#edtQDeal_id').hide();
   } 
  if(index == 2){  //특정딜정보 수신
     $('#edtQDeal_id').show();
   }
   if(index == 3){  ////SAP ITEM 정보 수신
     $('#edtQDeal_id').hide();
   }
  
   if(index == 4){  //SAP Vendor 정보 수신
     $('#edtQDeal_id').hide();
   }       
   
}

function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}

function btnRecvProc() {
  //
  var index_send = $("#cboQQRecv_Div option").index($("#cboQQRecv_Div option:selected"));
  
  if(index_send == 2){
    var input = $("#edtQDeal_id").val();
    
  }else{
    var input = "";
  }
  //
  $NC.serviceCall("/ED10010E/recvSocket.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_COMMAND: $NC.getValue("#cboQQRecv_Div") + ' ' + input
      
    })
  }, onRecvProc);
}

function onRecvProc(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA === "OK") {
      alert("정상작동 되었습니다.");
    } else if (resultData.RESULT_DATA == "0") {
      $("#SocketServerState").val("서버 OFF").css("color", "#cacaca");
      $("#btnSocketServer").val("서버시작");
      $NC.G_VAR.socketSeverState = "OFF";
      alert("소켓서버가 종료되었습니다.\n서버시작 후 수신처리 하십시오");
    } else {
      alert(resultData.RESULT_DATA);
    }
  }
}

function setRecvDivCombo() {
  var recvJson = {
    "RecvApiDeal_test.jar": "[수신:딜_옵션]",
    "RecvApiBrand_test.jar": "[수신:판매사]",    
    "RecvApiDealOne_test.jar": "[수신:(특정)딜_옵션]",
    "GetCmItemOne_real.jar": "[즉시수신(SAP):ITEM정보]",
    "GetCmVendorOne_real.jar": "[즉시수신(SAP):Vendor정보]"
  };
  optionStr = "";
  for ( var key in recvJson) {
    optionStr += "<option value=\"" + key + "\">" + recvJson[key] + "</option>";
  }
  $("#cboQQRecv_Div").html(optionStr);
  
}

function socketServerControl(cmd) {
  $NC.serviceCall("/ED10010E/socketServerControl.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_COMMAND: cmd
    })
  }, onSocketServerControl);
}

function onSocketServerControl(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {

    if (resultData.socketState == "ON") {
      $("#SocketServerState").val("서버 ON").css("color", "#ff9900");
      $("#btnSocketServer").val("서버종료");
    } else {
      $("#SocketServerState").val("서버 OFF").css("color", "#cacaca");
      $("#btnSocketServer").val("서버시작");
    }
    $NC.G_VAR.socketSeverState = resultData.socketState;
  }
}

function btnSocketServer() {
  var cmd;
  if ($NC.G_VAR.socketSeverState == "ON") {
    cmd = "exit";
  } else {
    cmd = "start";
  }
  socketServerControl(cmd);
}