/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();

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
    selector: ["#cboQCenter_Cd", "#cboQCenter_Cd"],
    codeField: "CENTER_CD",
    nameField: "CENTER_NM",
    onComplete: function() {
      $("#cboQCenter_Cd").val($NC.G_USERINFO.CENTER_CD);
      $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
//      setOutboundBatchCombo();
    }
  });

  // 사업구분 검색 이미지 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);
  // 출고차수 refresh 이미지클릭
//  $("#btnQOutbound_Batch").click(setOutboundBatchCombo);
  // 사업구분 위탁사 검색 이미지 클릭
  $("#btnQOwn_Brand_Cd").click(showOwnBrandPopup);

  // 조회조건 - 브랜드 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $NC.setInitDatePicker("#dtpQScan_Date1");
//  $NC.setInitDatePicker("#dtpQOrder_Date2");
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  var height = clientHeight - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, height);
}

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "CENTER_CD":
//    setOutboundBatchCombo();
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
  case "OWN_BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CUST_CD: $NC.G_USERINFO.CUST_CD,
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_OWN_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd")
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup, onOwnBrandPopup);
    }
  case "SCAN_DATE1":
    $NC.setValueDatePicker(view, val, "반입일자를 정확히 입력하십시오.");
//    setOutboundBatchCombo();
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
  $NC.G_VAR.buttons._inquiry = "1";
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
    alert("사업구분 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  var SCAN_DATE = $NC.getValue("#dtpQScan_Date1");
  if ($NC.isNull(SCAN_DATE)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQScan_Date1");
    return;
  }
  /*
  var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
  if ($NC.isNull(ORDER_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }
  
  if (ORDER_DATE1 > ORDER_DATE2) {
    alert("검색일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }
  */

  var OWN_BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd", true);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_SCAN_DATE: SCAN_DATE,
    P_OWN_BRAND_CD: OWN_BRAND_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID

  });

  // 데이터 조회
  $NC.serviceCall("/LOM8030Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

}

function grdMasterOnGetColumns() {

  var columns = [ ];
  
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_NM",
    field: "OWN_BRAND_NM",
    name: "지점",
    minWidth: 100,
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "SELLER_CD",
    field: "SELLER_CD",
    name: "매장코드",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "SELLER_NM",
    field: "SELLER_NM",
    name: "매장명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_NO",
    field: "ORDER_NO",
    name: "예정번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "PAPER_NO",
    field: "PAPER_NO",
    name: "주문확인서번호",
    minWidth: 200,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_STATE_NM",
    field: "OUTBOUND_STATE_NM",
    name: "진행상태",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "주문번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_KEY",
    field: "BU_KEY",
    name: "결제번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATETIME1",
    field: "BU_DATETIME",
    name: "결제일시",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM1",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM1",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_ID",
    field: "OPTION_ID",
    name: "옵션ID",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션명",
    minWidth: 170
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_QTY",
    field: "OPTION_QTY",
    name: "구매수량",
    minWidth: 80,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "LT_INSPECT_DATETIME",
    field: "LT_INSPECT_DATETIME",
    name: "출력일시",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "LT_INSPECT_USER_ID",
    field: "LT_INSPECT_USER_ID",
    name: "출력자ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_DATETIME1",
    field: "INSPECT_DATETIME",
    name: "입고스캔일시",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_USER_ID1",
    field: "INSPECT_USER_ID",
    name: "입고스캔ID",
    minWidth: 100
  });
  
  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.DATA_GRP.substr(rowData.DATA_GRP.length - 1) == "1") {
          return "specialrow4";
        }
      }
    },
    summaryRow: {
      visible: true,
      compareFn: function(field, rowData) {
        if (rowData.DATA_GRP.substr(rowData.DATA_GRP.length - 1) == "1") {
          return false;
        }
        return true;
      },
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LOM8030Q.RS_MASTER",
    sortCol: "SELLER_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

/**
 * @param ajaxData
 */
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
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 물류센터/사업구분/출고일자 값 변경시 출고차수 콤보 재설정
 */

/*
function setOutboundBatchCombo() {

  // 조회조건 - 출고차수 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_OUTBOUND_BATCH",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_OUTBOUND_DATE: $NC.getValue("#dtpQOrder_Date1"),
      P_OUTBOUND_DIV: "2" // 출고작업구분(1:기본출고, 2:온라인출고)
    })
  }, {
    selector: "#cboQOutbound_Batch",
    codeField: "OUTBOUND_BATCH",
    nameField: "OUTBOUND_BATCH",
    fullNameField: "OUTBOUND_BATCH_F",
    addAll: true
  });
}
*/

/**
 * 검색조건의 사업구분 검색 이미지 클릭
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
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }

  onChangingCondition();
//  setOutboundBatchCombo();
}

/**
 * 검색조건의 위탁사 검색 이미지 클릭
 */
function showOwnBrandPopup() {
  $NP.showOwnBrandPopup({
    P_CUST_CD: $NC.G_USERINFO.CUST_CD,
    P_BU_CD: $NC.getValue("#edtQBu_Cd"),
    P_OWN_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd")
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
  });
}

/**
 * 위탁사 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQOwn_Brand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQOwn_Brand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQOwn_Brand_Cd");
    $NC.setValue("#edtQOwn_Brand_Nm");
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
  }
  onChangingCondition();
}


