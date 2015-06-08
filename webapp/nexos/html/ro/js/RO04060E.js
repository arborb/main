/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    BARCD_DATA_DIV: "-"
  });

  
  /*****/
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

  // 조회조건 - 출고예정일자 달력이미지 설정
  $NC.setInitDatePicker("#dtpQOrder_Date");

  $NC.setEnable("#btnProcBw", false);
  // 사업부 검색 이미지 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);

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

  var masterViewWidth = Math.max($NC.getTruncVal(clientWidth * 0.35), 500);
  var detailViewWidth = clientWidth - masterViewWidth - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divCenterView", clientWidth, clientHeight);
  $NC.resizeContainer("#divDetailView", detailViewWidth, clientHeight);
  $NC.resizeContainer("#divMasterView", masterViewWidth, clientHeight);

  // 박스번호 사이즈를 적당히 조정
  var resizeVal = Math.max(Math.min($NC.getTruncVal((clientHeight - 500) / 20) * 10, 100), 0);
  var resizeView = $("#edtInspect_Chk");
  if (resizeVal != resizeView.data("resizeVal")) {
    resizeView.css({
      "height": 70 + resizeVal,
      "font-size": 20 + resizeVal
    }).data("resizeVal", resizeVal);
  }
  // 마스터 정보 표시 라인수 계산, 현재 Max: 6, Min: 2
  resizeVal = $NC.G_OFFSET.masterInfoMaxLine;
  if (clientHeight < 600) {
    resizeVal = Math.min(Math.max($NC.G_OFFSET.masterInfoMaxLine - Math.ceil((600 - clientHeight) / 35),
        $NC.G_OFFSET.masterInfoMinLine), $NC.G_OFFSET.masterInfoMaxLine);
  }
  resizeView = $("#tblMasterInfoView");
  if (resizeVal != resizeView.data("resizeVal")) {
    resizeView.find("tr:gt(1)").show();
    resizeView.find("tr:gt(" + (resizeVal) + ")").hide();
    resizeView.data("resizeVal", resizeVal);

    $("#divMasterInfoExpender").hide();
    // if (resizeVal < 4) {
    // $("#divMasterInfoExpender").show();
    // } else {
    // $("#divMasterInfoExpender").hide();
    // }
  }

  // Grid 높이 조정
  $NC.resizeGrid("#grdMaster", detailViewWidth, clientHeight
      - ($NC.G_LAYOUT.header + $NC.G_LAYOUT.border1 + $NC.G_OFFSET.subConditionHeight));
}

/**
 * Key Up Event
 * 
 * @param e
 * @param view
 */

function _OnInputKeyUp(e, view) {

  var id = view.prop("id").substr(3).toUpperCase();

  switch (id) {
  case "SCAN":

    var scanVal = "";

    // Enter Key
    if (e.keyCode == 13) {

      scanVal = $NC.getValue(view);
      if ($NC.isNull(scanVal)) {
        e.stopImmediatePropagation();
        return;
      }
      
      // 전표번호 바코드 스캔
      if (scanVal.substr(0, 2) == "RC" && scanVal.match(/-/g).length == 3) {
        onScanOrder(scanVal);
        e.stopImmediatePropagation();
        return;
      } else {
        e.stopImmediatePropagation();
        alert("반품확인서번호를 확인하시고 다시 스캔해주십시오.");
        setFocusScan();
        return;
      }

      e.stopImmediatePropagation();
      return;
    }
    
    if (e.keyCode == 8) {

      $NC.setValue("#edtScan");

      // 송장번호 바코드 스캔
      e.stopImmediatePropagation();
      return;
    }

    break;
  }
}

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
  case "ORDER_DATE":
    if (!$NC.isDate(val)) {
      alert("일자를 정확히 입력하십시오.");
      $NC.setInitDatePicker(view);
      $NC.setFocus(view);
    } else {
      $NC.setValue(view, $NC.getDate(val));
    }
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
  $NC.setValue("#edtQOrder_No");
//  $NC.setValue("#edtInspect_Chk");
  
  setItemInfoValue();

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "0";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  
  var ORDER_DATE = $NC.getValue("#dtpQOrder_Date");
  if ($NC.isNull(ORDER_DATE)) {
    alert("출고예정 검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date");
    return;
  }
  
  var ORDER_NO = $NC.getValue("#edtQOrder_No");

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_ORDER_DATE: ORDER_DATE,
    P_ORDER_NO: ORDER_NO
  });

  // 데이터 조회
  $NC.serviceCall("/RO04060E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
    id: "OWN_BRAND_NM",
    field: "OWN_BRAND_NM",
    name: "위탁사명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 230
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 85,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "주문번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_YN",
    field: "INSPECT_YN",
    name: "확정여부",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_DATETIME",
    field: "INSPECT_DATETIME",
    name: "확정처리일시",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    rowHeight: 32,
    specialRow: {
      compareKey: "INSPECT_YN",
      compareVal: "Y",
      compareOperator: "==",
      cssClass: "specialrow1"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "RO04060E.RS_MASTER",
    sortCol: ["BRAND_CD","ITEM_CD"],
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
  
  // Row 데이터로 에디터 세팅
  $NC.setValue("#edtBu_No", rowData.BU_NO);
  $NC.setValue("#edtInspect_Yn", rowData.INSPECT_YN);
  $NC.setValue("#edtOrder_No", rowData.ORDER_NO);
  $NC.setValue("#edtInspect_Chk", rowData.BOX_NO);
  $NC.setValue("#edtOrderer_Msg", rowData.ORDERER_MSG);
  $NC.setValue("#edtSum_Order_Qty", rowData.SUM_ORDER_QTY);
//  $NC.setValue("#edtShip_Type", rowData.SHIP_TYPE_D);

}

function onScanOrder(scanVal) {

  var processFn = function() {

    // 초기화
    onChangingCondition();

    // 바코드 파싱
    var SCAN_DATA = scanVal.substr(2).split($NC.G_VAR.BARCD_DATA_DIV);

    var SCAN_CENTER_CD = SCAN_DATA[0];
    var SCAN_BU_CD = SCAN_DATA[1];
    var SCAN_ORDER_DATE = $NC.getDate(SCAN_DATA[2]);
    var SCAN_ORDER_NO = SCAN_DATA[3];
    
    $NC.setValue("#cboQCenter_Cd", SCAN_CENTER_CD);
    $NC.setValue("#edtQBu_Cd", SCAN_BU_CD);
    $NC.setValue("#dtpQOrder_Date", SCAN_ORDER_DATE);
    $NC.setValue("#edtQOrder_No", SCAN_ORDER_NO);

    _Inquiry();
  };

  if (G_GRDMASTER.data.getLength() > 0) {
    processFn.call(this);
    return;
  }

  processFn.call(this);
}

function onConfirmExecProc(center_Cd, bu_Cd, order_Date, order_No) {

  $NC.serviceCall("/RO04060E/callRoScanConfirm.do", {
    P_QUERY_ID: "RO_SCAN_LT_STEP4",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: center_Cd,
      P_BU_CD: bu_Cd,
      P_ORDER_DATE: order_Date,
      P_ORDER_NO: order_No,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onExecSP, onSaveError);
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
        selectKey: ["BRAND_CD","ITEM_CD"],
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
    // $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
    onChangingCondition();
    alert("존재하지 않는 출고전표입니다. 확인 후 작업하십시오.");
    setFocusScan();
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(0);
  if (rowData.INSPECT_YN == "Y"){
    $NC.setValue("#edtInspect_Chk", "집하완료");
    $("#edtInspect_Chk").addClass("inspected");
    setFocusScan();
    return;
  } else {
    $NC.setValue("#edtInspect_Chk", "미집하");
    $("#edtInspect_Chk").removeClass("inspected");
    onConfirmExecProc(rowData.CENTER_CD, rowData.BU_CD, rowData.ORDER_DATE, rowData.ORDER_NO);
  }

  setFocusScan();
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

function onExecSP(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  _Inquiry();

}

/**
 * 저장에 실패 했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}
