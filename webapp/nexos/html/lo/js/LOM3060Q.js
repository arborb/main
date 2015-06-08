/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 탭 초기화
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 그리드 초기화
  grdT1MasterInitialize();
  grdT1DetailInitialize();
  grdT2MasterInitialize();
  grdT2DetailInitialize();

  $("#btnQBrand_Cd").click(showBrandPopup);

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

  // 조회조건 - 상품상태 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "ITEM_STATE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQItem_State",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true,
    onComplete: function() {
      $NC.setValue("#cboQItem_State", 0);
    }
  });

  // 조회조건 - 존코드 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMZONE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
      P_ZONE_CD: "%"
    })
  }, {
    selector: "#cboQZone_Cd",
    codeField: "ZONE_CD",
    nameField: "ZONE_NM",
    fullNameField: "ZONE_CD_F",
    addAll: true
  });
}

function _OnLoaded() {

  // 미처리/오류 내역 탭 화면에 splitter 설정
  $NC.setInitSplitter("#divT1DetailView", "v", $NC.G_OFFSET.leftViewWidth);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.perBarheight = 70;
  $NC.G_OFFSET.leftViewWidth = 625;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.tabHeaderHeight = $("#divMasterView").children(".ui-tabs-nav:first").outerHeight();

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1 * 2; /* 탭일 경우는 좌우 */
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientWidth -= $NC.G_LAYOUT.border1;
  clientHeight -= ($NC.G_OFFSET.tabHeaderHeight + $NC.G_LAYOUT.border1);
 // clientHeight1 = clientHeight/2;
  
  // 기타입출고등록 탭 /
  if ($("#divMasterView").tabs("option", "active") === 0) {

    // Splitter 컨테이너 크기 조정
    var container = $("#divT1DetailView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", $("#grdT1Master").parent().width(), clientHeight - $NC.G_LAYOUT.header - $NC.G_OFFSET.perBarheight);
  //  $NC.resizeGrid("#divBottomView", $("#divBottomView").parent().width(), clientHeight1 - $NC.G_LAYOUT.header /2 );

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Detail", $("#grdT1Detail").parent().width(), clientHeight - $NC.G_LAYOUT.header);

  } else {

    // Splitter 컨테이너 크기 조정
    var container = $("#divT2DetailView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Master", $("#grdT2Master").parent().width(), clientHeight - $NC.G_LAYOUT.header - $NC.G_OFFSET.perBarheight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Detail", $("#grdT2Detail").parent().width(), clientHeight - $NC.G_LAYOUT.header);
  }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  // 브랜드 Key 입력
  switch (id) {
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: val,
        P_VIEW_DIV: '2'
      };
      O_RESULT_DATA = $NP.getBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBrandPopup, onBrandPopup);
    }
    return;
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

  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  var ITEM_NM = $NC.getValue("#edtQItem_Nm");
  var ITEM_STATE = $NC.getValue("#cboQItem_State");
  var ITEM_LOT = $NC.getValue("#edtQItem_Lot");
  var ZONE_CD = $NC.getValue("#cboQZone_Cd");
  var BANK_CD = $NC.getValue("#edtQBank_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  // 상품별 입고내역 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {

    $NC.setInitGridVar(G_GRDT1MASTER);

    // 파라메터 세팅
    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_ITEM_STATE: ITEM_STATE,
      P_ITEM_LOT: ITEM_LOT,
      P_ZONE_CD: ZONE_CD,
      P_BANK_CD: BANK_CD
    });

    // 데이터 조회
    $NC.serviceCall("/LS01020Q/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

  } else {

    $NC.setInitGridVar(G_GRDT2MASTER);

    // 파라메터 세팅
    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_ITEM_STATE: ITEM_STATE,
      P_ITEM_LOT: ITEM_LOT,
      P_ZONE_CD: ZONE_CD,
      P_BANK_CD: BANK_CD
    });

    // 데이터 조회
    $NC.serviceCall("/LS01020Q/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);

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
  var id = ui.newTab.prop("id").substr(3).toUpperCase();
  var container;
  if (id === "TAB1") {
    container = "#divT1DetailView";
  } else {
    container = "#divT2DetailView";
  }
  // 스플리터가 초기화가 되어 있으면 _OnResize 호출
  if ($NC.isSplitter(container)) {
    // 스필리터를 통한 _OnResize 호출
    $(container).trigger("resize");
  } else {
    // 스플리터 초기화
    $NC.setInitSplitter(container, "v", $NC.G_OFFSET.leftViewWidth);
  }
}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "",
    field: "",
    name: "항목",
    minWidth: 100
    });
  $NC.setGridColumn(columns, {
    id: "",
    field: "",
    name: "전체",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "",
    field: "",
    name: "보류",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "",
    field: "",
    name: "진행",
    minWidth: 100
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 3,
    specialRow: {
      compareKey: "SAFETY_YN",
      compareVal: "N",
      compareOperator: "==",
      cssClass: "specialrow3"
    },
    summaryRow: {
      visible: true,

    }
  };

  // Grid DataView 생성 및 초기화
  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LS01020Q.RS_T1_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

function grdT1MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1MASTER.lastRow != null) {
    if (row == G_GRDT1MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 디테일 초기화
  $NC.setInitGridVar(G_GRDT1DETAIL);

  onGetT1Detail({
    data: null
  });

  var rowData = G_GRDT1MASTER.data.getItem(row);
  // 파라메터 세팅
  G_GRDT1DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BRAND_CD: rowData.BRAND_CD,
    P_ITEM_CD: rowData.ITEM_CD,
    P_ITEM_STATE: rowData.ITEM_STATE,
    P_ITEM_LOT: rowData.ITEM_LOT,
    P_ZONE_CD: rowData.ZONE_CD,
    P_BANK_CD: rowData.BANK_CD
  });
  // 데이터 조회
  $NC.serviceCall("/LS01020Q/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Master", row + 1);

}

function grdT1DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 80,
    cssClass: "align-right",
    summable: true
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_BOX",
    field: "STOCK_BOX",
    name: "재고BOX",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_EA",
    field: "STOCK_EA",
    name: "재고EA",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PSTOCK_QTY",
    field: "PSTOCK_QTY",
    name: "가용재고",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "VALID_DATE",
    field: "VALID_DATE",
    name: "유통기한",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BATCH_NO",
    field: "BATCH_NO",
    name: "제조배치번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_DATE",
    field: "STOCK_DATE",
    name: "입고일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_WEIGHT",
    field: "STOCK_WEIGHT",
    name: "재고중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_ID",
    field: "LOCATION_ID",
    name: "로케이션ID",
    minWidth: 120,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailInitialize() {

  var options = {
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Detail", {
    columns: grdT1DetailOnGetColumns(),
    queryId: "LS01020Q.RS_T1_DETAIL",
    sortCol: "LOCATION_CD",
    gridOptions: options
  });

  G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
}

function grdT1DetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1DETAIL.lastRow != null) {
    if (row == G_GRDT1DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Detail", row + 1);
}

function grdT2MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 90,
    cssClass: "align-center",
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_RBOX",
    field: "STOCK_RBOX",
    name: "재고BOX",
    minWidth: 90,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "PSTOCK_QTY",
    field: "PSTOCK_QTY",
    name: "가용재고",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_WEIGHT",
    field: "STOCK_WEIGHT",
    name: "재고중량",
    minWidth: 100,
    cssClass: "align-right",
    aggregator: "SUM"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 배송처별 입고내역탭의 그리드 초기값 설정
 */
function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 0,
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LS01020Q.RS_T2_MASTER",
    sortCol: "LOCATION_CD",
    gridOptions: options
  });
  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);

}

function grdT2MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2MASTER.lastRow != null) {
    if (row == G_GRDT2MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 디테일 초기화
  $NC.setInitGridVar(G_GRDT2DETAIL);

  onGetT2Detail({
    data: null
  });

  var rowData = G_GRDT2MASTER.data.getItem(row);
  // 파라메터 세팅
  G_GRDT2DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_LOCATION_CD: rowData.LOCATION_CD,
    P_BRAND_CD: rowData.BRAND_CD,
    P_ITEM_CD: rowData.ITEM_CD,
    P_ITEM_NM: rowData.ITEM_NM,
    P_ITEM_STATE: rowData.ITEM_STATE,
    P_ITEM_LOT: rowData.ITEM_LOT
  });
  // 데이터 조회
  $NC.serviceCall("/LS01020Q/getDataSet.do", $NC.getGridParams(G_GRDT2DETAIL), onGetT2Detail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Master", row + 1);
}

function grdT2DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 80
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
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_BOX",
    field: "STOCK_BOX",
    name: "재고BOX",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_EA",
    field: "STOCK_EA",
    name: "재고EA",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PSTOCK_QTY",
    field: "PSTOCK_QTY",
    name: "가용재고",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VALID_DATE",
    field: "VALID_DATE",
    name: "유통기한",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BATCH_NO",
    field: "BATCH_NO",
    name: "제조배치번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_DATE",
    field: "STOCK_DATE",
    name: "입고일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_WEIGHT",
    field: "STOCK_WEIGHT",
    name: "재고중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_ID",
    field: "LOCATION_ID",
    name: "로케이션ID",
    minWidth: 120,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 배송처별 입고내역탭의 그리드 초기값 설정
 */
function grdT2DetailInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Detail", {
    columns: grdT2DetailOnGetColumns(),
    queryId: "LS01020Q.RS_T2_DETAIL",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT2DETAIL.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT2DetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2DETAIL.lastRow != null) {
    if (row == G_GRDT2DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Detail", row + 1);
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDT1DETAIL);
  $NC.clearGridData(G_GRDT1MASTER);
  $NC.clearGridData(G_GRDT2DETAIL);
  $NC.clearGridData(G_GRDT2MASTER);

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
 * 상품별 재고현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT1Master(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);

  if (G_GRDT1MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT1MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT1Master", 0, 0);

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDT1DETAIL);
    onGetT1Detail({
      data: null
    });
  }
}

/**
 * 로케이션별 재고현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT2Master(ajaxData) {

  $NC.setInitGridData(G_GRDT2MASTER, ajaxData);

  if (G_GRDT2MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT2MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT2Master", 0, 0);

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDT2DETAIL);

    onGetT2Detail({
      data: null
    });
  }
}

/**
 * 상품별 재고현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT1Detail(ajaxData) {

  $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);

  if (G_GRDT1DETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT1DETAIL, 0);
  } else {
    $NC.setGridDisplayRows("#grdT1Detail", 0, 0);
  }
}

/**
 * 로케이션별 재고현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT2Detail(ajaxData) {

  $NC.setInitGridData(G_GRDT2DETAIL, ajaxData);

  if (G_GRDT2DETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT2DETAIL, 0);
  } else {
    $NC.setGridDisplayRows("#grdT2Detail", 0, 0);
  }
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBrandPopup() {

  $NP.showBrandPopup({
    P_BRAND_CD: "%",
    P_VIEW_DIV: '2'
  }, onBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onBrandPopup(resultInfo) {

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
