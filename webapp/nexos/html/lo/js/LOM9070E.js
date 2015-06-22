/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 입출고서브구분
    INOUT_SUB_CD1: "DM",
    INOUT_SUB_CD2: "",
    SCAN_CD: "",
    INQUIRY_DIV: "",
    BARCD_DATA_DIV: "-"
  });

  $NC.G_JWINDOW.set({
    "minWidth": 1050,
    "minHeight": 690
  });
  var oldOnFocus = $NC.G_JWINDOW.get("onFocus");
  $NC.G_JWINDOW.set("onFocus", function() {
    oldOnFocus.call(this, $NC.G_JWINDOW);
    setFocusScan();
  });

  // 그리드 초기화
  grdMasterInitialize();

  // 조회조건 - 물류센터 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CSUSERCENTER",
    P_QUERY_PARAMS: $NC.getParams({
      P_USER_ID: $NC.G_USERINFO.USER_ID,
      P_CENTER_CD: "%"
    })
  }, {
    selector: "#cboQCenter_Cd",
    codeField: "CENTER_CD",
    nameField: "CENTER_NM",
    onComplete: function() {
      $("#cboQCenter_Cd").val($NC.G_USERINFO.CENTER_CD);
    }
  });

  // 조회조건 - 사업부 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQBoxY");
  $NC.setValue("#edtQBoxN");

  // 조회조건 - 출고예정일자 달력이미지 설정
  $NC.setInitDatePicker("#dtpQHas_Date");
  // $NC.setInitDatePicker1("#dtpQHas_Date1");

  $NC.setEnable("#dtpQHas_Date1", false);
  $NC.setEnable("#btnProcBw", false);
  $("#dtpQHas_Date1").hide();
  // 사업부 검색 이미지 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);

  // $("#btnShip").click(onBtnShip);

  $("#divMasterView").mousedown(function(e) {
    e.stopImmediatePropagation();
    e.preventDefault();

    setTimeout(function() {
      setFocusScan();
    }, 100);
  });

  onChangingCondition();
  // 최대화
  $NC.G_JWINDOW.maximise(function() {
    setFocusScan();
  });
  setFocusScan();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

}

function _SetResizeOffset() {

  $NC.G_OFFSET.masterInfoMinLine = 2;
  $NC.G_OFFSET.masterInfoMaxLine = 4;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $("#divBottomView").outerHeight(true)
      + $NC.G_LAYOUT.nonClientHeight - 1;
  $NC.G_OFFSET.subConditionHeight = $("#divSubConditionView").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // var masterViewWidth = Math.max($NC.getTruncVal(clientWidth * 0.35), 500);
  // var detailViewWidth = clientWidth - masterViewWidth - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divCenterView", clientWidth, clientHeight);
  // $NC.resizeContainer("#divDetailView", detailViewWidth, clientHeight);
  // $NC.resizeContainer("#divMasterView", masterViewWidth, clientHeight);

  // 박스번호 사이즈를 적당히 조정
  // var resizeVal = Math.max(Math.min($NC.getTruncVal((clientHeight - 400) / 20) * 10, 100), 0);
  // var resizeView = $("#edtLocation_Cd");

  /**
   * if (resizeVal != resizeView.data("resizeVal")) { resizeView.css({ "height": 90 + resizeVal, "font-size": 2 +
   * resizeVal }).data("resizeVal", resizeVal); }
   */
  // 마스터 정보 표시 라인수 계산, 현재 Max: 6, Min: 2
  resizeVal = $NC.G_OFFSET.masterInfoMaxLine;
  if (clientHeight < 600) {
    resizeVal = Math.min(Math.max($NC.G_OFFSET.masterInfoMaxLine - Math.ceil((600 - clientHeight) / 35),
        $NC.G_OFFSET.masterInfoMinLine), $NC.G_OFFSET.masterInfoMaxLine);
  }
  resizeView = $("#tblMasterInfoView");
  // if (resizeVal != resizeView.data("resizeVal")) {
  // resizeView.find("tr:gt(1)").show();
  // resizeView.find("tr:gt(" + (resizeVal) + ")").hide();
  // resizeView.data("resizeVal", resizeVal);

  // $("#divMasterInfoExpender").hide();
  // if (resizeVal < 4) {
  // $("#divMasterInfoExpender").show();
  // } else {
  // $("#divMasterInfoExpender").hide();
  // }
  // }

  // Grid 높이 조정
  // $NC.resizeGrid("#grdMaster", detailViewWidth, clientHeight
  // - ($NC.G_LAYOUT.header + $NC.G_LAYOUT.border1 + $NC.G_OFFSET.subConditionHeight));
}

/**
 * Key Up Event
 * 
 * @param e
 * @param view
 */

function _OnInputKeyUp(e, view) {
  // onChangingCondition();

  // grdMasterInitialize();
  var id = view.prop("id").substr(3).toUpperCase();

  switch (id) {
  case "SCAN":
    // $NC.clearGridData(G_GRDMASTER);
    // var scanVal = "";
    // $NC.G_VAR.SCAN_CD = "";
    // $NC.G_VAR.INQUIRY_DIV = "";
    // Enter Key
    if (e.keyCode == 13) {

      var scanVal = "";
      $NC.G_VAR.SCAN_CD = "";
      $NC.G_VAR.INQUIRY_DIV = "";
      $NC.setValue("#edtMessage");
      scanVal = $NC.getValue(view);

      scanVal = scanVal.toUpperCase();
      if ($NC.isNull(scanVal)) {
        e.stopImmediatePropagation();
        return;
      }
      $NC.setValue("#edtScan", scanVal);

      onWbUpdateProc();

      // 송장번호 바코드 스캔

      e.stopImmediatePropagation();
      return;
    }

    if (e.keyCode == 8) {

      $NC.setValue("#edtScan");
      $NC.setValue("#edtMessage");
      // 송장번호 바코드 스캔
      e.stopImmediatePropagation();
      return;
    }

    break;
  }
}

/*
function  Chk_Text(scanVal){
  var scan = scanVal;
  var evt = window.event;
  if(evt.keyCode >47 && evt.keyCode <58){
  if(evt.keyCode == 48){
  if(document.form.value == scan )evt.returnValue=false;
  else return;
  }else return;
  }else{
  evt.returnValue=false;
  }
  }
  */
/*
function Chk_Text(scanVal ,re){
  var scan = scanVal;
  var ChkText=/(^[a-zA-Z0-9\-_]+$)/;

  if(ChkText.test(scan)==false){
          alert("'"+scanVal + "' 는 사용이 불가능 합니다. \n 영문문자나 숫자 아이디만 사용이 가능합니다.");
          setFocusScan();
          onChangingCondition();
     
          return false;
    }
  
}
*/
/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "CENTER_CD":
    break;
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
  case "HAS_DATE":
    if (!$NC.isDate(val)) {
      alert("일자를 정확히 입력하십시오.");
      $NC.setInitDatePicker(view);
      $NC.setFocus(view);
    } else {
      $NC.setValue(view, $NC.getDate(val));
    }
    break;
  case "WB_SCAN":
    break;
  }

  // 조회 조건에 Object Change
  onChangingCondition();
}

/**
 * 조회조건이 변경될 때 호출
 */
function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDMASTER);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "0";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);

  $NC.setValue("#edtQBoxY");
  $NC.setValue("#edtQBoxN");

  // Row 데이터로 에디터 세팅
  $NC.setValue("#edtOrderer_Nm");
  $NC.setValue("#edtShipper_Nm");
  $NC.setValue("#edtShipper_Tel");
  $NC.setValue("#edtShipper_Hp");
  // $NC.setValue("#edtWb_No", rowData.WB_NO);
  // $NC.setValue("#edtWb_Chk_Yn", rowData.WB_CHK_YN);
  $NC.setValue("#edtHas_No");
  $NC.setValue("#edtLocation_Cd");
  $NC.setValue("#edtShipper_Addr");
  $NC.setValue("#edtShip_Type");
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry(Inquiry_Div) {


  var INQUIRY_DIV = Inquiry_Div;

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_SCAN_INFO: $NC.getValue("#edtScan"),
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_INQUIRY_DIV: INQUIRY_DIV,
    
  });

  // 데이터 조회
  $NC.serviceCall("/LOM9070E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "HAS_NO",
    field: "HAS_NO",
    name: "HAS처리번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "HAS처리순번",
    minWidth: 40,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_TEL",
    field: "SHIPPER_TEL",
    name: "전화번호",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_HP",
    field: "SHIPPER_HP",
    name: "휴대폰번호",
    minWidth: 150,
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ZIP_CD",
    field: "SHIPPER_ZIP_CD",
    name: "수령자우편호",
    minWidth: 110,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_BASIC",
    field: "SHIPPER_ADDR_BASIC",
    name: "수령자주소",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_DETAIL",
    field: "SHIPPER_ADDR_DETAIL",
    name: "수령자상세주소",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "ZONE_CD",
    field: "ZONE_CD",
    name: "존코드",
    minWidth: 40,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "LOC",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "END_YN",
    field: "END_YN",
    name: "처리여부",
    minWidth: 80,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 4,
    rowHeight: 32,
    specialRow: {
      compareKey: "END_YN",
      compareVal: "Y",
      compareOperator: "==",
      cssClass: "specialrow1"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LOM9070E.RS_MASTER",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  setItemInfoValue(G_GRDMASTER.data.getItem(row));

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function setItemInfoValue(rowData) {

  // 상품 정보 세팅
  if ($NC.isNull(rowData)) {
    rowData = {};
  }

  if (rowData.ORDER_STATUS_YN == 'N' && rowData.ORDER_HOLD_YN == 'N' && rowData.ORDER_YN == 'N') {
    // $NC.setEnable("#btnShip", false);
    // $NC.setEnable("#lblShip_Yn", false);
  } else if (rowData.ORDER_STATUS_YN == 'Y') {
    // $NC.setEnable("#btnShip", true);
    // $NC.setEnable("#lblShip_Yn", false);
  }
  // Row 데이터로 에디터 세팅
  $NC.setValue("#edtOrderer_Nm", rowData.ORDERER_NM);
  $NC.setValue("#edtShipper_Nm", rowData.SHIPPER_NM);
  $NC.setValue("#edtShipper_Tel", rowData.SHIPPER_TEL);
  $NC.setValue("#edtShipper_Hp", rowData.SHIPPER_HP);
  // $NC.setValue("#edtWb_No", rowData.WB_NO);
  // $NC.setValue("#edtWb_Chk_Yn", rowData.WB_CHK_YN);
  $NC.setValue("#edtHas_No", rowData.HAS_NO);
  $NC.setValue("#edtLocation_Cd", rowData.LOCATION_CD);
  $NC.setValue("#edtShipper_Addr", rowData.SHIPPER_ADDR);
  $NC.setValue("#edtShip_Type", rowData.SHIP_TYPE_D);
  $NC.setValue("#edtQScan", $NC.G_VAR.SCAN_CD);

  // $NC.setValue("#edtQBoxY", rowData.Y_BOX_CNT);
  // $NC.setValue("#edtQBoxN", rowData.N_BOX_CNT);

  if (rowData.WB_CHK_YN && rowData.SHIP_TYPE !== "1") {
    alert("[" + rowData.SHIP_TYPE_D + "] 상품입니다.\n\n 포장 후 사무실로 전달바랍니다.");
  }

}

function onWbUpdateProc() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var PARAM_WB_NO = $NC.getValue("#edtScan");
  $NC.G_VAR.SCAN_CD = $NC.getValue("#edtScan");
  if ($NC.isNull(PARAM_WB_NO)) {
    alert("송장번호를 스캔하십시오.");
    $NC.setFocus("#edtScan");
    return;
  }
  
  // 바코드 파싱
 
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  var ChkText = /(^[a-zA-Z0-9\-_]+$)/;

  if (ChkText.test(PARAM_WB_NO) == false) {
    alert("'" + PARAM_WB_NO + "' 는 사용이 불가능 합니다. \n 영문문자나 숫자 만 입력 가능합니다.");
    setFocusScan();
    onChangingCondition();

    return;
  }

  if (PARAM_WB_NO.substr(0, 2) == "OP") {
    $NC.serviceCall("/LOM9070E/callWbProc1.do", {
      P_QUERY_ID: "LO_HAS_CALL_PROC_T1",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_SCAN_INFO: PARAM_WB_NO,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      })
    }, onExecSP1, onSaveError);

  } else {
    $NC.serviceCall("/LOM9070E/callWbProc1.do", {
      P_QUERY_ID: "LO_HAS_CALL_PROC_T2",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_SCAN_INFO: PARAM_WB_NO,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      })
    }, onExecSP2, onSaveError);
  }
}

/**
 * 출고예정내역 조회
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {

    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        // selectKey: ["BRAND_CD", "ITEM_CD"],
        selectKey: ["ORDERER_NM", "WB_NO"],
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
    // $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "0";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";

  doPrint1();
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

/**
 * 스캔 포인트 포커스 이동, 초기화
 */
function setFocusScan() {

  $NC.setFocus("#edtScan");
  $NC.setValue("#edtScan");
}

function onExecSP1(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  var TTTT = resultData.RESULT_DATA;

  var cl2 = TTTT.substr(0, 1);
  if (cl2 == 2) {
    $NC.setValue("#edtMessage", '비대상');
    $("#edtMessage").css("color", "red").text();

    $NC.G_VAR.INQUIRY_DIV = '3';

    onChangingCondition();
    _Inquiry($NC.G_VAR.INQUIRY_DIV);

    // setFocusScan();
    return;
  } else if (cl2 == 3) {
    $NC.setValue("#edtMessage", '취소주문');
    onChangingCondition();

    doPrint1();
    setFocusScan();
    return;

  } else if (cl2 == 4) {

    $("#edtMessage").css("font-size", "17px").size();
    $NC.setValue("#edtMessage", resultData.RESULT_DATA );
   // alert(resultData.RESULT_DATA);
    onChangingCondition();
    setFocusScan();
    return;

  } else if (cl2 == 1) {
    $NC.setValue("#edtMessage", '대상');
    $("#edtMessage").css("color", "black").text();
    if (!$NC.isNull(cl2)) {
      if (cl2 !== "1" && cl2 !== "2" && cl2 !== "3") {
        onChangingCondition();
        alert(resultData.RESULT_DATA);
        return;
      }
    }
    $NC.G_VAR.INQUIRY_DIV = '1';
    _Inquiry($NC.G_VAR.INQUIRY_DIV);

  } else {
    $("#edtMessage").css("font-size", "17px").text();
    $NC.setValue("#edtMessage", resultData.RESULT_DATA );
    //alert(resultData.RESULT_DATA);
    setFocusScan();
    return;
  }

}


function onExecSP2(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  var TTTT = resultData.RESULT_DATA;

  var cl2 = TTTT.substr(0, 1);
  if (cl2 == 2) {
    $NC.setValue("#edtMessage", '비대상');
    $("#edtMessage").css("color", "red").text();

    $NC.G_VAR.INQUIRY_DIV = '4';

    onChangingCondition();
    _Inquiry($NC.G_VAR.INQUIRY_DIV);

    // setFocusScan();
    return;
  } else if (cl2 == 3) {
    $NC.setValue("#edtMessage", '취소주문');
    onChangingCondition();

    doPrint1();
    setFocusScan();
    return;

    
  } else if (cl2 == 4) {

    $("#edtMessage").css("font-size", "17px").size();
    $NC.setValue("#edtMessage", resultData.RESULT_DATA );
   // alert(resultData.RESULT_DATA);
    onChangingCondition();
    setFocusScan();
    return;

  } else if (cl2 == 1) {
    $NC.setValue("#edtMessage", '대상');
    $("#edtMessage").css("color", "black").text();
    
    if (!$NC.isNull(cl2)) {
      if (cl2 !== "1" && cl2 !== "2" && cl2 !== "3") {
        onChangingCondition();
        alert(resultData.RESULT_DATA);
        return;
      }
    }
    $NC.G_VAR.INQUIRY_DIV = '2';
    _Inquiry($NC.G_VAR.INQUIRY_DIV);

  } else {

    $("#edtMessage").css("font-size", "17px").text();
    $NC.setValue("#edtMessage", resultData.RESULT_DATA );
    //alert(resultData.RESULT_DATA);
    setFocusScan();
    return;
  }

}
/*
function onBtnShip(e) {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
//  var BU_CD = $NC.getValue("#edtQBu_Cd");
//  if ($NC.isNull(BU_CD)) {
//    alert("사업부 코드를 입력하십시오.");
//    $NC.setFocus("#edtQBu_Cd");
//    return;
//  }
  var HAS_DATE = $NC.getValue("#dtpQHas_Date");
  if ($NC.isNull(HAS_DATE)) {
    alert("출고예정 검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQHas_Date");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (rowData.ORDER_STATUS_YN == 'Y') {
    $NC.serviceCall("/LOM9070E/Ship_cancel.do", {
      P_QUERY_ID: "LO_BW_ORDER_PROC",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_HAS_DATE: rowData.HAS_DATE,
        P_HAS_NO: rowData.HAS_NO,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      })
    }, onSave, onSaveE);
  }
}


*/
function onSave(ajaxData) {

  var resultData = (ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      alert(resultData.O_MSG);
    } else {
      alert("취소처리가 완료되었습니다.");
    }
  }
  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: ["WB_NO", "BOX_NO", "ORDERER_NM"]
  });
  G_GRDMASTER.lastKeyVal = lastKeyVal;

}

function onSaveE(ajaxData) {

  $NC.onError(ajaxData);
}

/**
 * 저장에 실패 했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}

function doPrint1() {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if ($NC.G_VAR.INQUIRY_DIV == '1') {

    $NC.G_MAIN.silentPrint({

      printParams: [{
        reportDoc: "lo/LABEL_LOM12_1",
        queryId: "WR.RS_LABEL_LOM12_1",
        queryParams: {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_HAS_DATE: rowData.HAS_DATE,
          P_HAS_NO: rowData.HAS_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_PICK_SEQ: rowData.PICK_SEQ
        },
        iFrameNo: 1,
        silentPrinterName: $NC.G_USERINFO.PRINT_CARD,
        internalQueryYn: "Y"
      }],
      onAfterPrint: function() {
        setFocusScan();
      }
    });

  } else if ($NC.G_VAR.INQUIRY_DIV == '2') {


    $NC.G_MAIN.silentPrint({

      printParams: [{
        reportDoc: "lo/LABEL_LOM12",
        queryId: "WR.RS_LABEL_LOM12",
        queryParams: {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_HAS_DATE: rowData.HAS_DATE,
          P_HAS_NO: rowData.HAS_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_PICK_BOX_NO: rowData.PICK_BOX_NO
        },
        iFrameNo: 1,
        silentPrinterName: $NC.G_USERINFO.PRINT_CARD,
        internalQueryYn: "Y"
      }],
      onAfterPrint: function() {
        setFocusScan();
      }
    });
   } else {
     setFocusScan();
  }

  // $NC.G_MAIN.silentPrint(printOptions);
}
