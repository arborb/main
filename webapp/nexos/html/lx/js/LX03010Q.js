/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 체크할 정책 값
    /*
    policyVal: {
      LO510: "" // 배송처 표시 정책
    },
    */
    // 현재 액티브된 상세 탭의 뷰 및 그리드 정보
    activeView: {
      container: "#divT2SubViewA",
      master: null,
      grdMaster: null,
      detail: null,
      grdDetail: null,
      sub: null,
      grdSub: null,
      PROCESS_CD: "A"
    }
  });

  // 출고예정일자 라벨 숨김
  $("#lblQOrder_Date").hide();

  // 탭 초기화
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 그리드 초기화
  grdT1MasterInitialize();

  grdT2MasterAInitialize();
  grdT2DetailAInitialize();
  grdT2SubAInitialize();
  grdT2MasterBInitialize();
  grdT2DetailBInitialize();
  grdT2SubBInitialize();
  grdT2MasterCInitialize();
  grdT2DetailCInitialize();
  grdT2SubCInitialize();
  grdT2MasterDInitialize();
  grdT2DetailDInitialize();
  grdT2SubDInitialize();
  grdT2MasterEInitialize();
  grdT2DetailEInitialize();
  grdT2SubEInitialize();
  grdT2MasterFInitialize();
  grdT2DetailFInitialize();
  grdT2SubFInitialize();

  $NC.G_VAR.activeView.master = "#grdT2MasterA";
  $NC.G_VAR.activeView.grdMaster = G_GRDT2MASTERA;
  $NC.G_VAR.activeView.detail = "#grdT2DetailA";
  $NC.G_VAR.activeView.grdDetail = G_GRDT2DETAILA;
  $NC.G_VAR.activeView.sub = "#grdT2SubA";
  $NC.G_VAR.activeView.grdSub = G_GRDT2SUBA;
  $("#btnProcessA").addClass("ui-clr-selected");

  // 프로세스 버튼 클릭 이벤트 연결
  $("#divT2DetailInfoView input[type=button]").bind("click", function(e) {
    var view = $(this);
    onSubViewChange(e, view);
  });

  $("#btnQBu_Cd").click(showUserBuPopup);

  $NC.setInitDatePicker("#dtpQXDock_Date1");
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

  // 정책코드 취득
  setPolicyValInfo();
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  // 화면 리사이즈 Offset 계산
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $NC.G_LAYOUT.border1;
  $NC.G_OFFSET.gridHeightOffset = $NC.G_LAYOUT.tabHeader + $NC.G_LAYOUT.header + $NC.G_OFFSET.nonClientHeight
      + ($NC.G_LAYOUT.border1 * 3);
  $NC.G_OFFSET.subViewHeightOffset = $NC.G_LAYOUT.tabHeader + $NC.G_OFFSET.nonClientHeight + ($NC.G_LAYOUT.border1 * 3);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border2;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientWidth -= $NC.G_LAYOUT.border1;
  // 입고진행현황 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {
    clientHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset;

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", clientWidth, clientHeight);
  } else {
    
    var container;
    var process_Cd = $NC.G_VAR.activeView.PROCESS_CD;
    
    clientHeight = parent.height() - $NC.G_OFFSET.subViewHeightOffset - $("#divT2DetailInfoView").outerHeight();
    
    container = $($NC.G_VAR.activeView.container);
    $NC.resizeContainer(container, clientWidth, clientHeight);
    
    container = $("#divT2Splitter" + process_Cd + "1");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdT2Master" + process_Cd).parent();
    $NC.resizeGrid("#grdT2Master" + process_Cd, container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#divT2Splitter" + process_Cd + "2");
    $NC.resizeContainer(container, clientWidth - $("#grdT2Master" + process_Cd).parent().width() - 8, clientHeight);

    container = $("#grdT2Detail" + process_Cd).parent();
    $NC.resizeGrid("#grdT2Detail" + process_Cd, container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#grdT2Sub" + process_Cd).parent();
    $NC.resizeGrid("#grdT2Sub" + process_Cd, container.width(), container.height() - $NC.G_LAYOUT.header);
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
 * Sub View Button Click 시 호출 됨
 */
function onSubViewChange(e, view) {

  var viewId = view.prop("id");
  if ($NC.G_VAR.activeView.container.substr(1) === viewId) {
    return;
  }
  var process_Cd;
  for (var i = 0; i < 6; i++) {
    process_Cd = String.fromCharCode(65 + i);
    $("#btnProcess" + process_Cd).removeClass("ui-clr-selected");
    $("#divT2SubView" + process_Cd).hide();
  }

  // btnProcessA ---> A
  process_Cd = viewId.substr(10).toUpperCase();

  view.addClass("ui-clr-selected");
  $("#divT2SubView" + process_Cd).show();
  $NC.G_VAR.activeView.container = "#divT2SubView" + process_Cd;
  $NC.G_VAR.activeView.master = "#grdT2Master" + process_Cd;
  $NC.G_VAR.activeView.grdMaster = window["G_GRDT2MASTER" + process_Cd];
  $NC.G_VAR.activeView.detail = "#grdT2Detail" + process_Cd;
  $NC.G_VAR.activeView.grdDetail = window["G_GRDT2DETAIL" + process_Cd];
  $NC.G_VAR.activeView.sub = "#grdT2Sub" + process_Cd;
  $NC.G_VAR.activeView.grdSub = window["G_GRDT2SUB" + process_Cd];
  $NC.G_VAR.activeView.PROCESS_CD = process_Cd;

  if ($NC.G_VAR.activeView.PROCESS_CD === "A") {
    $("#lblQXDock_Date").hide();
    $("#lblQOrder_Date").show();
  } else {
    $("#lblQXDock_Date").show();
    $("#lblQOrder_Date").hide();
  }
  
  // 스플리터 컨트롤
  setT2Splitter();
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
  var XDOCK_TYPE = $NC.getValue("#cboQXDock_Type");
  if ($NC.isNull(XDOCK_TYPE)) {
    alert("처리유형을 선택하십시오.");
    $NC.setFocus("#cboQXDock_Type");
    return;
  }

  var BU_CD = $NC.getValue("#edtQBu_Cd", true);

  // CD진행현황 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1MASTER);

    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_XDOCK_DATE1: XDOCK_DATE1,
      P_XDOCK_DATE2: XDOCK_DATE2,
      P_XDOCK_TYPE: XDOCK_TYPE,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LX03010Q/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

  } else {
    setSubSummaryInfo();

    // 상세CD진행현황 화면
    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar($NC.G_VAR.activeView.grdMaster);

    $NC.G_VAR.activeView.grdMaster.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_XDOCK_DATE1: XDOCK_DATE1,
      P_XDOCK_DATE2: XDOCK_DATE2,
      P_XDOCK_TYPE: XDOCK_TYPE,
      P_PROCESS_CD: $NC.G_VAR.activeView.PROCESS_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID,
    });

    // 데이터 조회
    $NC.serviceCall("/LX03010Q/getDataSet.do", $NC.getGridParams($NC.G_VAR.activeView.grdMaster), onGetT2Master);
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
  if (id === "TAB1") {
    $("#lblQXDock_Date").show();
    $("#lblQOrder_Date").hide();
    _OnResize($(window));
  } else {

    if ($NC.G_VAR.activeView.PROCESS_CD === "A") {
      $("#lblQXDock_Date").hide();
      $("#lblQOrder_Date").show();
    } else {
      $("#lblQXDock_Date").show();
      $("#lblQOrder_Date").hide();
    }

    // 스플리터 컨트롤
    setT2Splitter();
  }
}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CUST_CD",
    field: "CUST_CD",
    name: "위탁사",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CUST_NM",
    field: "CUST_NM",
    name: "위탁사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "사업부",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업부명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_DIV",
    field: "XDOCK_DIV",
    name: "구분",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BILL_A",
    field: "BILL_A",
    name: "CD예정",
    minWidth: 120,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "BILL_B",
    field: "BILL_B",
    name: "CD등록",
    minWidth: 120,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "BILL_C",
    field: "BILL_C",
    name: "CD검수",
    minWidth: 120,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "BILL_D",
    field: "BILL_D",
    name: "CD분배",
    minWidth: 120,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "BILL_E",
    field: "BILL_E",
    name: "CD확정",
    minWidth: 120,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "BILL_F",
    field: "BILL_F",
    name: "CD배송",
    minWidth: 120,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdT1MasterInitialize() {

  var options = {
    specialRow: {
      compareKey: "NO",
      compareVal: 1,
      compareOperator: "==",
      cssClass: "specialrow4"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LX03010Q.RS_T1_MASTER",
    sortCol: "CUST_CD",
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

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Master", row + 1);
}

function grdT2MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if ($NC.G_VAR.activeView.grdMaster.lastRow != null) {
    if (row == $NC.G_VAR.activeView.grdMaster.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = $NC.G_VAR.activeView.grdMaster.data.getItem(row);

  var ORDER_DATE = "";
  var ORDER_NO = "";
  var XDOCK_DATE = "";
  var XDOCK_NO = "";

  if ($NC.G_VAR.activeView.PROCESS_CD === "A") {
    ORDER_DATE = rowData.ORDER_DATE;
    ORDER_NO = rowData.ORDER_NO;
  } else {
    XDOCK_DATE = rowData.XDOCK_DATE;
    XDOCK_NO = rowData.XDOCK_NO;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar($NC.G_VAR.activeView.grdDetail);
  onGetT2Detail({
    data: null
  });

  $NC.G_VAR.activeView.grdDetail.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_ORDER_DATE: ORDER_DATE,
    P_ORDER_NO: ORDER_NO,
    P_XDOCK_DATE: XDOCK_DATE,
    P_XDOCK_NO: XDOCK_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LX03010Q/getDataSet.do", $NC.getGridParams($NC.G_VAR.activeView.grdDetail), onGetT2Detail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows($NC.G_VAR.activeView.master, row + 1);
}

function grdT2DetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if ($NC.G_VAR.activeView.grdDetail.lastRow != null) {
    if (row == $NC.G_VAR.activeView.grdDetail.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  
  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar($NC.G_VAR.activeView.grdSub);
  onGetT2Sub({
    data: null
  });
  
  var rowData = $NC.G_VAR.activeView.grdDetail.data.getItem(row);

  $NC.G_VAR.activeView.grdSub.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_ORDER_DATE: rowData.ORDER_DATE,
    P_ORDER_NO: rowData.ORDER_NO,
    P_XDOCK_DATE: rowData.XDOCK_DATE,
    P_XDOCK_NO: rowData.XDOCK_NO,
    P_LINE_NO: rowData.LINE_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LX03010Q/getDataSet.do", $NC.getGridParams($NC.G_VAR.activeView.grdSub), onGetT2Sub);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows($NC.G_VAR.activeView.detail, row + 1);
}

function grdT2SubOnAfterScroll(e, args) {
  
  var row = args.rows[0];
  if ($NC.G_VAR.activeView.grdSub.lastRow != null) {
    if (row == $NC.G_VAR.activeView.grdSub.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows($NC.G_VAR.activeView.sub, row + 1);
}

function grdT2MasterAOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "사업부",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업부명",
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
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_TYPE_D",
    field: "XDOCK_TYPE_D",
    name: "처리유형",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CNT",
    field: "ITEM_CNT",
    name: "상품수",
    minWidth: 80,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "BILL_QTY",
    field: "BILL_QTY",
    name: "CD총수량",
    minWidth: 80,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "총금액",
    minWidth: 100,
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
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "PLANED_DATETIME",
    field: "PLANED_DATETIME",
    name: "납품예정일시",
    minWidth: 130
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterAInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2MasterA", {
    columns: grdT2MasterAOnGetColumns(),
    queryId: "LX03010Q.RS_T2_MASTER",
    sortCol: "ORDER_DATE",
    gridOptions: options
  });

  G_GRDT2MASTERA.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
  $("#grdT2MasterA").height(200);
}

function grdT2DetailAOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
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
    minWidth: 180
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
    minWidth: 80,
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
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_BOX",
    field: "ORDER_BOX",
    name: "예정BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_EA",
    field: "ORDER_EA",
    name: "예정EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_WEIGHT",
    field: "ORDER_WEIGHT",
    name: "예정중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_AMT",
    field: "BUY_AMT",
    name: "매입금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VAT_AMT",
    field: "VAT_AMT",
    name: "부가세액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_AMT",
    field: "DC_AMT",
    name: "할인금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdT2DetailAInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2DetailA", {
    columns: grdT2DetailAOnGetColumns(),
    queryId: "LX03010Q.RS_T2_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDT2DETAILA.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT2SubAOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "배송처",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_NM",
    field: "DELIVERY_NM",
    name: "배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_CD",
    field: "RDELIVERY_CD",
    name: "실배송처",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_NM",
    field: "RDELIVERY_NM",
    name: "실배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_BOX",
    field: "ORDER_BOX",
    name: "예정BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_EA",
    field: "ORDER_EA",
    name: "예정EA",
    minWidth: 70,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2SubAInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2SubA", {
    columns: grdT2SubAOnGetColumns(),
    queryId: "LX03010Q.RS_T2_SUB",
    sortCol: "RDELIVERY_CD",
    gridOptions: options
  });

  G_GRDT2SUBA.view.onSelectedRowsChanged.subscribe(grdT2SubOnAfterScroll);
}

function grdT2MasterBOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "사업부",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업부명",
    minWidth: 120
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
    id: "XDOCK_TYPE_D",
    field: "XDOCK_TYPE_D",
    name: "처리유형",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CNT",
    field: "ITEM_CNT",
    name: "상품수",
    minWidth: 80,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "BILL_QTY",
    field: "BILL_QTY",
    name: "CD총수량",
    minWidth: 80,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "총금액",
    minWidth: 100,
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
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "PLANED_DATETIME",
    field: "PLANED_DATETIME",
    name: "납품예정일시",
    minWidth: 130,
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

function grdT2MasterBInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2MasterB", {
    columns: grdT2MasterBOnGetColumns(),
    queryId: "LX03010Q.RS_T2_MASTER",
    sortCol: "XDOCK_DATE",
    gridOptions: options
  });

  G_GRDT2MASTERB.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
  $("#grdT2MasterB").height(200);
}

function grdT2DetailBOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
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
    minWidth: 180
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
    minWidth: 80,
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
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_BOX",
    field: "ENTRY_BOX",
    name: "등록BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_EA",
    field: "ENTRY_EA",
    name: "등록EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_WEIGHT",
    field: "ENTRY_WEIGHT",
    name: "등록중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_AMT",
    field: "BUY_AMT",
    name: "매입금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VAT_AMT",
    field: "VAT_AMT",
    name: "부가세액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_AMT",
    field: "DC_AMT",
    name: "할인금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdT2DetailBInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2DetailB", {
    columns: grdT2DetailBOnGetColumns(),
    queryId: "LX03010Q.RS_T2_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDT2DETAILB.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT2SubBOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "배송처",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_NM",
    field: "DELIVERY_NM",
    name: "배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_CD",
    field: "RDELIVERY_CD",
    name: "실배송처",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_NM",
    field: "RDELIVERY_NM",
    name: "실배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ASN_NO",
    field: "ASN_NO",
    name: "ASN번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_BOX",
    field: "ENTRY_BOX",
    name: "등록BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_EA",
    field: "ENTRY_EA",
    name: "등록EA",
    minWidth: 70,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2SubBInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2SubB", {
    columns: grdT2SubBOnGetColumns(),
    queryId: "LX03010Q.RS_T2_SUB",
    sortCol: "RDELIVERY_CD",
    gridOptions: options
  });

  G_GRDT2SUBB.view.onSelectedRowsChanged.subscribe(grdT2SubOnAfterScroll);
}

function grdT2MasterCOnGetColumns() {
  
  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "사업부",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업부명",
    minWidth: 120
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
    id: "XDOCK_TYPE_D",
    field: "XDOCK_TYPE_D",
    name: "처리유형",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CNT",
    field: "ITEM_CNT",
    name: "상품수",
    minWidth: 80,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "BILL_QTY",
    field: "BILL_QTY",
    name: "CD총수량",
    minWidth: 80,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "총금액",
    minWidth: 100,
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
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "PLANED_DATETIME",
    field: "PLANED_DATETIME",
    name: "납품예정일시",
    minWidth: 130,
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

function grdT2MasterCInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2MasterC", {
    columns: grdT2MasterCOnGetColumns(),
    queryId: "LX03010Q.RS_T2_MASTER",
    sortCol: "XDOCK_DATE",
    gridOptions: options
  });

  G_GRDT2MASTERC.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
  $("#grdT2MasterC").height(200);
}

function grdT2DetailCOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
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
    minWidth: 180
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
    minWidth: 80,
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
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_BOX",
    field: "INSPECT_BOX",
    name: "검수BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_EA",
    field: "INSPECT_EA",
    name: "검수EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_WEIGHT",
    field: "INSPECT_WEIGHT",
    name: "검수중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_AMT",
    field: "BUY_AMT",
    name: "매입금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VAT_AMT",
    field: "VAT_AMT",
    name: "부가세액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_AMT",
    field: "DC_AMT",
    name: "할인금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdT2DetailCInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2DetailC", {
    columns: grdT2DetailCOnGetColumns(),
    queryId: "LX03010Q.RS_T2_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDT2DETAILC.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT2SubCOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "배송처",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_NM",
    field: "DELIVERY_NM",
    name: "배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_CD",
    field: "RDELIVERY_CD",
    name: "실배송처",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_NM",
    field: "RDELIVERY_NM",
    name: "실배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ASN_NO",
    field: "ASN_NO",
    name: "ASN번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_BOX",
    field: "INSPECT_BOX",
    name: "검수BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_EA",
    field: "INSPECT_EA",
    name: "검수EA",
    minWidth: 70,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2SubCInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2SubC", {
    columns: grdT2SubCOnGetColumns(),
    queryId: "LX03010Q.RS_T2_SUB",
    sortCol: "RDELIVERY_CD",
    gridOptions: options
  });

  G_GRDT2SUBC.view.onSelectedRowsChanged.subscribe(grdT2SubOnAfterScroll);
}

function grdT2MasterDOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "사업부",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업부명",
    minWidth: 120
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
    id: "XDOCK_TYPE_D",
    field: "XDOCK_TYPE_D",
    name: "처리유형",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CNT",
    field: "ITEM_CNT",
    name: "상품수",
    minWidth: 80,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "BILL_QTY",
    field: "BILL_QTY",
    name: "CD총수량",
    minWidth: 80,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "총금액",
    minWidth: 100,
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
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "PLANED_DATETIME",
    field: "PLANED_DATETIME",
    name: "납품예정일시",
    minWidth: 130,
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

function grdT2MasterDInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2MasterD", {
    columns: grdT2MasterDOnGetColumns(),
    queryId: "LX03010Q.RS_T2_MASTER",
    sortCol: "XDOCK_DATE",
    gridOptions: options
  });

  G_GRDT2MASTERD.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
  $("#grdT2MasterD").height(200);
}

function grdT2DetailDOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
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
    minWidth: 180
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
    minWidth: 80,
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
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_QTY",
    field: "DISTRIBUTE_QTY",
    name: "분배수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_BOX",
    field: "DISTRIBUTE_BOX",
    name: "분배BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_EA",
    field: "DISTRIBUTE_EA",
    name: "분배EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_WEIGHT",
    field: "DISTRIBUTE_WEIGHT",
    name: "분배중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_AMT",
    field: "BUY_AMT",
    name: "매입금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VAT_AMT",
    field: "VAT_AMT",
    name: "부가세액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_AMT",
    field: "DC_AMT",
    name: "할인금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdT2DetailDInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2DetailD", {
    columns: grdT2DetailDOnGetColumns(),
    queryId: "LX03010Q.RS_T2_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDT2DETAILD.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT2SubDOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "배송처",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_NM",
    field: "DELIVERY_NM",
    name: "배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_CD",
    field: "RDELIVERY_CD",
    name: "실배송처",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_NM",
    field: "RDELIVERY_NM",
    name: "실배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ASN_NO",
    field: "ASN_NO",
    name: "ASN번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_QTY",
    field: "DISTRIBUTE_QTY",
    name: " 분배수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_BOX",
    field: "DISTRIBUTE_BOX",
    name: "분배BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_EA",
    field: "DISTRIBUTE_EA",
    name: "분배EA",
    minWidth: 70,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2SubDInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2SubD", {
    columns: grdT2SubDOnGetColumns(),
    queryId: "LX03010Q.RS_T2_SUB",
    sortCol: "RDELIVERY_CD",
    gridOptions: options
  });

  G_GRDT2SUBD.view.onSelectedRowsChanged.subscribe(grdT2SubOnAfterScroll);
}


function grdT2MasterEOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "사업부",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업부명",
    minWidth: 120
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
    id: "XDOCK_TYPE_D",
    field: "XDOCK_TYPE_D",
    name: "처리유형",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CNT",
    field: "ITEM_CNT",
    name: "상품수",
    minWidth: 80,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "BILL_QTY",
    field: "BILL_QTY",
    name: "CD총수량",
    minWidth: 80,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "총금액",
    minWidth: 100,
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
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "PLANED_DATETIME",
    field: "PLANED_DATETIME",
    name: "납품예정일시",
    minWidth: 130,
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

function grdT2MasterEInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2MasterE", {
    columns: grdT2MasterEOnGetColumns(),
    queryId: "LX03010Q.RS_T2_MASTER",
    sortCol: "XDOCK_DATE",
    gridOptions: options
  });

  G_GRDT2MASTERE.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
  $("#grdT2MasterE").height(200);
}

function grdT2DetailEOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
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
    minWidth: 180
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
    minWidth: 80,
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
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_QTY",
    field: "DISTRIBUTE_QTY",
    name: "분배수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_BOX",
    field: "CONFIRM_BOX",
    name: "확정BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_EA",
    field: "CONFIRM_EA",
    name: "확정EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_WEIGHT",
    field: "CONFIRM_WEIGHT",
    name: "확정중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_AMT",
    field: "BUY_AMT",
    name: "매입금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VAT_AMT",
    field: "VAT_AMT",
    name: "부가세액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_AMT",
    field: "DC_AMT",
    name: "할인금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });
  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdT2DetailEInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2DetailE", {
    columns: grdT2DetailEOnGetColumns(),
    queryId: "LX03010Q.RS_T2_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDT2DETAILE.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT2SubEOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "배송처",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_NM",
    field: "DELIVERY_NM",
    name: "배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_CD",
    field: "RDELIVERY_CD",
    name: "실배송처",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_NM",
    field: "RDELIVERY_NM",
    name: "실배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ASN_NO",
    field: "ASN_NO",
    name: "ASN번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_QTY",
    field: "DISTRIBUTE_QTY",
    name: " 분배수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_BOX",
    field: "CONFIRM_BOX",
    name: "확정BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_EA",
    field: "CONFIRM_EA",
    name: "확정EA",
    minWidth: 70,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2SubEInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2SubE", {
    columns: grdT2SubEOnGetColumns(),
    queryId: "LX03010Q.RS_T2_SUB",
    sortCol: "RDELIVERY_CD",
    gridOptions: options
  });

  G_GRDT2SUBE.view.onSelectedRowsChanged.subscribe(grdT2SubOnAfterScroll);
}

function grdT2MasterFOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "사업부",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업부명",
    minWidth: 120
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
    id: "XDOCK_TYPE_D",
    field: "XDOCK_TYPE_D",
    name: "처리유형",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CNT",
    field: "ITEM_CNT",
    name: "상품수",
    minWidth: 80,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "BILL_QTY",
    field: "BILL_QTY",
    name: "CD총수량",
    minWidth: 80,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "총금액",
    minWidth: 100,
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
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "PLANED_DATETIME",
    field: "PLANED_DATETIME",
    name: "납품예정일시",
    minWidth: 130,
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

function grdT2MasterFInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2MasterF", {
    columns: grdT2MasterFOnGetColumns(),
    queryId: "LX03010Q.RS_T2_MASTER",
    sortCol: "XDOCK_DATE",
    gridOptions: options
  });

  G_GRDT2MASTERF.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
  $("#grdT2MasterF").height(200);
}

function grdT2DetailFOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
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
    minWidth: 180
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
    minWidth: 80,
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
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_QTY",
    field: "DELIVERY_QTY",
    name: "배송수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_BOX",
    field: "DELIVERY_BOX",
    name: "배송BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_EA",
    field: "DELIVERY_EA",
    name: "배송EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MISSED_QTY",
    field: "MISSED_QTY",
    name: "미배송수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_WEIGHT",
    field: "DELIVERY_WEIGHT",
    name: "배송중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_AMT",
    field: "BUY_AMT",
    name: "매입금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VAT_AMT",
    field: "VAT_AMT",
    name: "부가세액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_AMT",
    field: "DC_AMT",
    name: "할인금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });
  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdT2DetailFInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2DetailF", {
    columns: grdT2DetailFOnGetColumns(),
    queryId: "LX03010Q.RS_T2_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDT2DETAILF.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT2SubFOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "배송처",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_NM",
    field: "DELIVERY_NM",
    name: "배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_CD",
    field: "RDELIVERY_CD",
    name: "실배송처",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_NM",
    field: "RDELIVERY_NM",
    name: "실배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ASN_NO",
    field: "ASN_NO",
    name: "ASN번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_QTY",
    field: "DELIVERY_QTY",
    name: "배송수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MISSED_QTY",
    field: "MISSED_QTY",
    name: "미배송수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_BOX",
    field: "DELIVERY_BOX",
    name: "배송BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_EA",
    field: "DELIVERY_EA",
    name: "배송EA",
    minWidth: 70,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2SubFInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2SubF", {
    columns: grdT2SubFOnGetColumns(),
    queryId: "LX03010Q.RS_T2_SUB",
    sortCol: "RDELIVERY_CD",
    gridOptions: options
  });

  G_GRDT2SUBF.view.onSelectedRowsChanged.subscribe(grdT2SubOnAfterScroll);
}

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
  $NC.G_VAR.buttons._excel = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetT2Master(ajaxData) {

  $NC.setInitGridData($NC.G_VAR.activeView.grdMaster, ajaxData);

  if ($NC.G_VAR.activeView.grdMaster.data.getLength() > 0) {
    $NC.setGridSelectRow($NC.G_VAR.activeView.grdMaster, 0);
  } else {
    $NC.setGridDisplayRows($NC.G_VAR.activeView.master, 0, 0);
    
    // 디테일 초기화
    $NC.setInitGridVar($NC.G_VAR.activeView.grdDetail);
    onGetT2Detail({
      data: null
    });
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._excel = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetT2Detail(ajaxData) {

  $NC.setInitGridData($NC.G_VAR.activeView.grdDetail, ajaxData);

  if ($NC.G_VAR.activeView.grdDetail.data.getLength() > 0) {
    $NC.setGridSelectRow($NC.G_VAR.activeView.grdDetail, 0);
  } else {
    $NC.setGridDisplayRows($NC.G_VAR.activeView.detail, 0, 0);
    
    // 서브 초기화
    $NC.setInitGridVar($NC.G_VAR.activeView.grdSub);
    onGetT2Sub({
      data: null
    });
  }
}

function onGetT2Sub(ajaxData) {

  $NC.setInitGridData($NC.G_VAR.activeView.grdSub, ajaxData);

  if ($NC.G_VAR.activeView.grdSub.data.getLength() > 0) {
    $NC.setGridSelectRow($NC.G_VAR.activeView.grdSub, 0);
  } else {
    $NC.setGridDisplayRows($NC.G_VAR.activeView.sub, 0, 0);
  }
}

function onGetT2Sub2(ajaxData) {

  var rows = $NC.toArray(ajaxData);
  if (rows.length === 0) {
    for (var i = 0; i < 6; i++) {
      $NC.setValue("#divProcessCnt" + String.fromCharCode(65 + i) + " > div.tabNum", "0 / 0");
    }
  } else {
    var rowData = rows[0];
    var process_Cd, process_Cnt, process_Qty;
    for (var i = 0; i < 6; i++) {
      process_Cd = String.fromCharCode(65 + i);
      process_Cnt = rowData["CNT_" + process_Cd];
      process_Qty = rowData["QTY_" + process_Cd];
      if ($NC.isNull(process_Cnt)) {
        process_Cnt = "0";
      }
      if ($NC.isNull(process_Qty)) {
        process_Qty = "0";
      }
      $NC.setValue("#divProcessCnt" + process_Cd + " > div.tabNum", $NC.getDisplayNumber(process_Cnt) + " / "
          + $NC.getDisplayNumber(process_Qty));
    }
  }
}

function onChangingCondition() {

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._excel = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);

  // 출고진행현황 화면
  G_GRDT1MASTER.lastRow = null;

  $NC.setInitGridData(G_GRDT1MASTER);
  $NC.setGridDisplayRows("#grdT1Master", 0, 0);

  // 출고진행현황 상세화면 전체
  var process_Cd;
  for (var i = 0; i < 6; i++) {
    process_Cd = String.fromCharCode(65 + i);
    $NC.clearGridData(window["G_GRDT2MASTER" + process_Cd]);
    $NC.clearGridData(window["G_GRDT2DETAIL" + process_Cd]);
    $NC.clearGridData(window["G_GRDT2SUB" + process_Cd]);
  }

  setSubSummaryInfo();
}

function setSubSummaryInfo() {

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var XDOCK_DATE1 = $NC.getValue("#dtpQXDock_Date1");
  var XDOCK_DATE2 = $NC.getValue("#dtpQXDock_Date2");
  var XDOCK_TYPE = $NC.getValue("#cboQXDock_Type");

  // 데이터 조회
  $NC.serviceCall("/LX03010Q/getDataSet.do", {
    P_QUERY_ID: "LX03010Q.RS_T2_SUB2",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_XDOCK_DATE1: XDOCK_DATE1,
      P_XDOCK_DATE2: XDOCK_DATE2,
      P_XDOCK_TYPE: XDOCK_TYPE,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onGetT2Sub2);
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
  onChangingCondition();
  setPolicyValInfo();
}

/**
 * 정책정보 취득
 */
function setPolicyValInfo() {

  /*
  var CENTER_CD = $NC.isNull($NC.getValue("#cboQCenter_Cd")) ? $NC.G_USERINFO.CENTER_CD : $NC
      .getValue("#cboQCenter_Cd");
  var BU_CD = $NC.isNull($NC.getValue("#edtQBu_Cd")) ? $NC.G_USERINFO.BU_CD : $NC.getValue("#edtQBu_Cd");
  
  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCall("/LX03010Q/callSP.do", {
      P_QUERY_ID: "WF.GET_POLICY_VAL",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_POLICY_CD: POLICY_CD
      })
    }, onGetPolicyVal);
  }
  */
}

/**
 * 정책정보 취득후 처리
 * 
 * @param ajaxData
 */
function onGetPolicyVal(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
      $NC.G_VAR.policyVal[resultData.P_POLICY_CD] = resultData.O_POLICY_VAL;
    }
  }
}

function setT2Splitter() {
  
  var process_Cd = $NC.G_VAR.activeView.PROCESS_CD;
  // 스플리터 컨트롤
  if ($NC.isSplitter("#divT2Splitter" + process_Cd + "1")) {
    $("#divT2Splitter" + process_Cd + "1").trigger("resize");
    $("#divT2Splitter" + process_Cd + "2").trigger("resize");
  } else {
    $NC.setInitSplitter("#divT2Splitter" + process_Cd + "1", "v", 600);
    $NC.setInitSplitter("#divT2Splitter" + process_Cd + "2", "h", 300);
  }
}