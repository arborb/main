/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 입출고서브구분
    INOUT_SUB_CD1: "DM",
    INOUT_SUB_CD2: ""
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
  $NC.setInitDatePicker("#dtpQOutbound_Date");

  $NC.setEnable("#btnProcBw", false);
  // 사업부 검색 이미지 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);

//  $("#btnShip").click(onBtnShip);

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
  var resizeView = $("#edtBox_No");
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
      $NC.setValue("#edtScan", scanVal);

      onWbUpdateProc();

      // 송장번호 바코드 스캔

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
  case "OUTBOUND_DATE":
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
//  var BU_CD = $NC.getValue("#edtQBu_Cd");
//  if ($NC.isNull(BU_CD)) {
//    alert("사업부 코드를 입력하십시오.");
//    $NC.setFocus("#edtQBu_Cd");
//    return;
//  }
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("출고예정 검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date");
    return;
  }

  var PARAM_WB_NO = $NC.getValue("#edtScan");
  if ($NC.isNull(PARAM_WB_NO)) {
    alert("송장번호를 스캔하십시오.");
    $NC.setFocus("#edtScan");
    return;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: "5000",
    P_OUTBOUND_DATE: OUTBOUND_DATE,
    P_WB_NO: PARAM_WB_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LOM9030E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
    id: "WB_NO",
    field: "WB_NO",
    name: "송장번호",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BOX_NO",
    field: "BOX_NO",
    name: "박스번호",
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
    id: "SHIPPER_HP",
    field: "SHIPPER_HP",
    name: "휴대폰번호",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR",
    field: "SHIPPER_ADDR",
    name: "주소",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "WB_CHK_YN",
    field: "WB_CHK_YN",
    name: "상차여부",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "WB_RECV_DATETIME",
    field: "WB_RECV_DATETIME",
    name: "상차검수일시",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_MSG",
    field: "ORDERER_MSG",
    name: "배송메시지",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_YN",
    field: "INSPECT_YN",
    name: "검수여부",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_TEL",
    field: "SHIPPER_TEL",
    name: "전화번호",
    minWidth: 100
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 4,
    rowHeight: 32,
    specialRow: {
      compareKey: "WB_CHK_YN",
      compareVal: "Y",
      compareOperator: "==",
      cssClass: "specialrow1"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LOM9030E.RS_MASTER",
    sortCol: ["ITEM_CD", "BRAND_CD"],
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
//    $NC.setEnable("#btnShip", false);
//    $NC.setEnable("#lblShip_Yn", false);
  } else if (rowData.ORDER_STATUS_YN == 'Y') {
//    $NC.setEnable("#btnShip", true);
//    $NC.setEnable("#lblShip_Yn", false);
  }
  // Row 데이터로 에디터 세팅
  $NC.setValue("#edtOrderer_Nm", rowData.ORDERER_NM);
  $NC.setValue("#edtShipper_Nm", rowData.SHIPPER_NM);
  $NC.setValue("#edtShipper_Tel", rowData.SHIPPER_TEL);
  $NC.setValue("#edtShipper_Hp", rowData.SHIPPER_HP);
  $NC.setValue("#edtWb_No", rowData.WB_NO);
  $NC.setValue("#edtWb_Chk_Yn", rowData.WB_CHK_YN);
  $NC.setValue("#edtOutbound_No", rowData.OUTBOUND_NO);
  $NC.setValue("#edtBox_No", rowData.BOX_NO);
  $NC.setValue("#edtMall_Msg", rowData.MALL_MSG);
  $NC.setValue("#edtOrderer_Msg", rowData.ORDERER_MSG);
  $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);
  $NC.setValue("#edtShipper_Addr", rowData.SHIPPER_ADDR);
  $NC.setValue("#edtShip_Type", rowData.SHIP_TYPE_D);
  
  $NC.setValue("#edtQBoxY", rowData.Y_BOX_CNT);
  $NC.setValue("#edtQBoxN", rowData.N_BOX_CNT);
  
  if(rowData.WB_CHK_YN && rowData.SHIP_TYPE !== "1"){
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
//  var BU_CD = $NC.getValue("#edtQBu_Cd");
//  if ($NC.isNull(BU_CD)) {
//    alert("사업부 코드를 입력하십시오.");
//    $NC.setFocus("#edtQBu_Cd");
//    return;
//  }
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("출고예정 검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date");
    return;
  }

  var PARAM_WB_NO = $NC.getValue("#edtScan");
  if ($NC.isNull(PARAM_WB_NO)) {
    alert("송장번호를 스캔하십시오.");
    $NC.setFocus("#edtScan");
    return;
  }

  $NC.serviceCall("/LOM9030E/callWbProc.do", {
    P_QUERY_ID: "LO_WB_CHK_UPDATE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: '5000',
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_WB_NO: PARAM_WB_NO,
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
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("출고예정 검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (rowData.ORDER_STATUS_YN == 'Y') {
    $NC.serviceCall("/LOM9030E/Ship_cancel.do", {
      P_QUERY_ID: "LO_BW_ORDER_PROC",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      })
    }, onSave, onSaveE);
  }
}

function onSave(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
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
