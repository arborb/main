/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({
  // });

  // 탭 초기화
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 그리드 초기화
  grdT1MasterInitialize();
  grdT2MasterInitialize();
  grdT3MasterInitialize();

  // 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showBuBrandPopup);

  $NC.setInitDatePicker("#dtpQXDock_Date1", null, "F"); // 당월의 첫쨋날 취득
  $NC.setInitDatePicker("#dtpQXDock_Date2");

  // 조회조건 - 물류센터 초기화
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
      $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
    }
  });

  // 조회조건 - 처리유형 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "XDOCK_TYPE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQXDock_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    addAll: true
  });
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $NC.G_LAYOUT.border1;
  $NC.G_OFFSET.gridHeightOffset = $NC.G_OFFSET.nonClientHeight + $NC.G_LAYOUT.header + $NC.G_LAYOUT.tabHeader
      + $("#divConditionViewT1").outerHeight() + ($NC.G_LAYOUT.border1 * 3);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border2;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientWidth -= $NC.G_LAYOUT.border1;
  clientHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset;
  switch($("#divMasterView").tabs("option", "active")) {
  case 0 :
    $NC.resizeGrid("#grdT1Master", clientWidth, clientHeight);
    break;
  case 1 :
    $NC.resizeGrid("#grdT2Master", clientWidth, clientHeight);
    break;
  case 2 :
    $NC.resizeGrid("#grdT3Master", clientWidth, clientHeight);
    break;
  }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  // 브랜드 Key 입력
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
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_BU_CD: BU_CD,
        P_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getBuBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBuBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showBuBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBuBrandPopup, onBuBrandPopup);
    }
    return;
  case "XDOCK_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "XDOCK_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
  }

  onChangingCondition();
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
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var XDOCK_DATE1 = $NC.getValue("#dtpQXDock_Date1");
  if ($NC.isNull(XDOCK_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQXDock_Date1");
    return;
  }
  var XDOCK_DATE2 = $NC.getValue("#dtpQXDock_Date2");
  if ($NC.isNull(XDOCK_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQXDock_Date2");
    return;
  }
  if (XDOCK_DATE1 > XDOCK_DATE2) {
    alert("CD일자 검색 범위 오류입니다.");
    $NC.setFocus("#dtpQXDock_Date1");
    return;
  }
  var XDOCK_TYPE = $NC.getValue("#cboQXDock_Type");
  if ($NC.isNull(XDOCK_TYPE)) {
    alert("처리유형을 선택하십시오.");
    $NC.setFocus("#cboQXDock_Type");
    return;
  }

  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var BU_NO = $NC.getValue("#edtQBu_No");
  
  switch($("#divMasterView").tabs("option", "active")) {
  case 0 :
    
    var ITEM_CD = $NC.getValue("#edtQT1_Item_Cd");
    var ITEM_NM = $NC.getValue("#edtQT1_Item_Nm");
    
    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1MASTER);

    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_XDOCK_DATE1: XDOCK_DATE1,
      P_XDOCK_DATE2: XDOCK_DATE2,
      P_XDOCK_TYPE: XDOCK_TYPE,
      P_BRAND_CD: BRAND_CD,
      P_BU_NO: BU_NO,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM
    });

    // 데이터 조회
    $NC.serviceCall("/LX03020Q/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
    break;
  case 1 :
    
    var VENDOR_CD = $NC.getValue("#edtQT2_Vendor_Cd");
    var VENDOR_NM = $NC.getValue("#edtQT2_Vendor_Nm");
    
    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);

    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_XDOCK_DATE1: XDOCK_DATE1,
      P_XDOCK_DATE2: XDOCK_DATE2,
      P_XDOCK_TYPE: XDOCK_TYPE,
      P_BRAND_CD: BRAND_CD,
      P_BU_NO: BU_NO,
      P_VENDOR_CD: VENDOR_CD,
      P_VENDOR_NM: VENDOR_NM
    });

    // 데이터 조회
    $NC.serviceCall("/LX03020Q/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
    break;
  case 2 :
    
    var DELIVERY_CD = $NC.getValue("#edtQT3_Delivery_Cd");
    var DELIVERY_NM = $NC.getValue("#edtQT3_Delivery_Nm");
    var RDELIVERY_CD = $NC.getValue("#edtQT3_RDelivery_Cd");
    var RDELIVERY_NM = $NC.getValue("#edtQT3_RDelivery_Nm");
    
    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT3MASTER);

    G_GRDT3MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_XDOCK_DATE1: XDOCK_DATE1,
      P_XDOCK_DATE2: XDOCK_DATE2,
      P_XDOCK_TYPE: XDOCK_TYPE,
      P_BRAND_CD: BRAND_CD,
      P_BU_NO: BU_NO,
      P_DELIVERY_CD: DELIVERY_CD,
      P_DELIVERY_NM: DELIVERY_NM,
      P_RDELIVERY_CD: RDELIVERY_CD,
      P_RDELIVERY_NM: RDELIVERY_NM
    });

    // 데이터 조회
    $NC.serviceCall("/LX03020Q/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetT3Master);
    break;
  } 
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

/**
 * Tab Active Event
 * 
 * @param event
 * @param ui
 *          newTab: The tab that was just activated.<br>
 *          oldTab: The tab that was just deactivated.<br>
 *          newPanel: The panel that was just activated.<br>
 *          oldPanel: The panel that was just deactivated
 */
function tabOnActivate(event, ui) {

  _OnResize($(window));
}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90,
    summaryTitle: "[합계]",
    groupToggler: true
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 150,
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_QTY",
    field: "DISTRIBUTE_QTY",
    name: "분배수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_QTY",
    field: "DELIVERY_QTY",
    name: "배송수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_DATE",
    field: "XDOCK_DATE",
    name: "CD일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_NO",
    field: "XDOCK_NO",
    name: "CD번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_TYPE_D",
    field: "XDOCK_TYPE_D",
    name: "처리유형",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 3,
    summaryRow: {
      visible: true
    }
  };
  
  //  Data Grouping
  var dataGroupOptions = {
    getter: function(rowData) {
      return rowData.ITEM_CD;
    },
    resultFn: function(field, summary) {
      if (field == "ITEM_SPEC") {
        return "[상품별합계]";
      }

      if (field == "BRAND_NM") {
        return "[전체]";
      }

      return summary[field];
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LX03020Q.RS_T1_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options,
    dataGroupOptions: dataGroupOptions
  });

  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

/**
 * 상품별 CD내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT1MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1MASTER.lastRow != null) {
    if (row == G_GRDT1MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Master", row + 1);
}

/**
 * 공급처별 CD내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT2MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2MASTER.lastRow != null) {
    if (row == G_GRDT2MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Master", row + 1);
}

/**
 * 배송처별 CD내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT3MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT3MASTER.lastRow != null) {
    if (row == G_GRDT3MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT3Master", row + 1);
}

function grdT2MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "VENDOR_CD",
    field: "VENDOR_CD",
    name: "공급처",
    minWidth: 100,
    summaryTitle: "[합계]",
    groupToggler: true
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처명",
    minWidth: 120,
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_QTY",
    field: "DISTRIBUTE_QTY",
    name: "분배수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_QTY",
    field: "DELIVERY_QTY",
    name: "배송수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_DATE",
    field: "XDOCK_DATE",
    name: "CD일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_NO",
    field: "XDOCK_NO",
    name: "CD번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_TYPE_D",
    field: "XDOCK_TYPE_D",
    name: "처리유형",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}
/**
 * 공급처별 CD내역탭의 그리드 초기값 설정
 */
function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 1,
    summaryRow: {
      visible: true
    }
  };
  
  // Data Grouping
  var dataGroupOptions = {
    getter: function(rowData) {
      return rowData.VENDOR_CD;
    },
    resultFn: function(field, summary) {
      if (field == "ITEM_CD") {
        return "[공급처별합계]";
      }

      if (field == "ITEM_NM") {
        return "[전체]";
      }

      return summary[field];
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LX03020Q.RS_T2_MASTER",
    sortCol: "VENDOR_CD",
    gridOptions: options,
    dataGroupOptions: dataGroupOptions
  });

  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT3MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "배송처",
    minWidth: 100,
    summaryTitle: "[합계]",
    groupToggler: true
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_NM",
    field: "DELIVERY_NM",
    name: "배송처명",
    minWidth: 120,
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_CD",
    field: "RDELIVERY_CD",
    name: "실배송처",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_NM",
    field: "RDELIVERY_NM",
    name: "실배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_QTY",
    field: "DISTRIBUTE_QTY",
    name: "분배수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_QTY",
    field: "DELIVERY_QTY",
    name: "배송수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_DATE",
    field: "XDOCK_DATE",
    name: "CD일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_NO",
    field: "XDOCK_NO",
    name: "CD번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_TYPE_D",
    field: "XDOCK_TYPE_D",
    name: "처리유형",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}
/**
 * 배송처별 출고내역탭의 그리드 초기값 설정
 */
function grdT3MasterInitialize() {

  var options = {
    frozenColumn: 1,
    summaryRow: {
      visible: true
    }
  };
  
  // Data Grouping
  var dataGroupOptions = {
    getter: function(rowData) {
      return rowData.DELIVERY_CD;
    },
    resultFn: function(field, summary) {
      if (field == "RDELIVERY_CD") {
        return "[배송처별합계]";
      }

      if (field == "RDELIVERY_NM") {
        return "[전체]";
      }

      return summary[field];
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT3Master", {
    columns: grdT3MasterOnGetColumns(),
    queryId: "LX03020Q.RS_T3_MASTER",
    sortCol: "DELIVERY_CD",
    gridOptions: options,
    dataGroupOptions: dataGroupOptions
  });

  G_GRDT3MASTER.view.onSelectedRowsChanged.subscribe(grdT3MasterOnAfterScroll);
}

/**
 * 상품별출고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT1Master(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);

  if (G_GRDT1MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT1MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT1Master", 0, 0);
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
 * 공급처별출고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT2Master(ajaxData) {

  $NC.setInitGridData(G_GRDT2MASTER, ajaxData);

  if (G_GRDT2MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT2MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT2Master", 0, 0);
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
 * 배송처별출고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT3Master(ajaxData) {

  $NC.setInitGridData(G_GRDT3MASTER, ajaxData);

  if (G_GRDT3MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT3MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT3Master", 0, 0);
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
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);

  // 초기화
  $NC.clearGridData(G_GRDT1MASTER);
  $NC.clearGridData(G_GRDT2MASTER);

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
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }

  // 브랜드 조회조건 초기화
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");

  onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");

  $NP.showBuBrandPopup({
    P_BU_CD: BU_CD,
    P_BRAND_CD: "%"
  }, onBuBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onBuBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  onChangingCondition();
}