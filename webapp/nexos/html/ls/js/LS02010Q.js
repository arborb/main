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

  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();

  // 그리드 초기화
  grdT1MasterInitialize();
  grdT2MasterInitialize();
  grdT3MasterInitialize();

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  $NC.setInitDatePicker("#dtpQInout_Date1", null, "F");
  $NC.setInitDatePicker("#dtpQInout_Date2");

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQOwn_Brand_Cd").click(showOwnBrandPopup);
//  $("#btnQDepart_Cd").click(showItemGroupDepartPopup);
//  $("#btnQLine_Cd").click(showItemGroupLinePopup);
//  $("#btnQClass_Cd").click(showItemGroupClassPopup);

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

  // 수불발생여부 콤보박스 세팅
  var cboObj = $("#cboQView_Div").empty();
  var optionStr = "";
  optionStr += "<option value='1'>전체</option>";
  optionStr += "<option value='2'>수불발생상품</option>";
  cboObj.append(optionStr);
  $NC.setValue("#cboQView_Div", 0);

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
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

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
  clientHeight -= ($NC.G_OFFSET.tabHeaderHeight + $NC.G_LAYOUT.header + $NC.G_LAYOUT.border1);
  // 수신현황 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", clientWidth, clientHeight);

    // 송신현황 화면
  } else if ($("#divMasterView").tabs("option", "active") === 1) {
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Master", clientWidth, clientHeight);
  } else {
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT3Master", clientWidth, clientHeight);
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
    return;
  case "DEPART_CD":
    var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd");
    if ($NC.isNull(BRAND_CD)) {
      alert("위탁사 코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocus("#edtQOwn_Brand_Cd", true);
      $NC.setValue("edtQDepart_Cd", null);
      return;
    }

    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd")
      };
      O_RESULT_DATA = $NP.getItemGroupDepartInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemGroupDepartPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemGroupDepartPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemGroupDepartPopup, onItemGroupDepartPopup);
    }
    return;
  case "LINE_CD":
    var DEPART_CD = $NC.getValue("#edtQDepart_Cd");
    if ($NC.isNull(DEPART_CD)) {
      alert("대분류 코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocus("#edtQDepart_Cd", true);
      $NC.setValue("edtQLine_Cd", null);
      return;
    }

    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
        P_DEPART_CD: $NC.getValue("#edtQDepart_Cd")
      };
      O_RESULT_DATA = $NP.getItemGroupLineInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemGroupLinePopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemGroupLinePopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemGroupLinePopup, onItemGroupLinePopup);
    }
    return;
  case "CLASS_CD":
    var LINE_CD = $NC.getValue("#edtQLine_Cd");
    if ($NC.isNull(LINE_CD)) {
      alert("중분류 코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocus("#edtQLine_Cd", true);
      $NC.setValue("edtQClass_Cd", null);
      return;
    }

    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
        P_DEPART_CD: $NC.getValue("#edtQDepart_Cd"),
        P_LINE_CD: $NC.getValue("#edtQLine_Cd")
      };
      O_RESULT_DATA = $NP.getItemGroupClassInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemGroupClassPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemGroupClassPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemGroupClassPopup, onItemGroupClassPopup);
    }
    return;
  case "INOUT_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "INOUT_DATE2":
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
    alert("사업구분 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var INOUT_DATE1 = $NC.getValue("#dtpQInout_Date1");
  if ($NC.isNull(INOUT_DATE1)) {
    alert("수불 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQInout_Date1");
    return;
  }
  var INOUT_DATE2 = $NC.getValue("#dtpQInout_Date2");
  if ($NC.isNull(INOUT_DATE2)) {
    alert("수불 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQInout_Date2");
    return;
  }
  if (INOUT_DATE1 > INOUT_DATE2) {
    alert("수불일자 검색 범위 오류입니다.");
    $NC.setFocus("#dtpQInout_Date1");
    return;
  }

  var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd", true);
//  var DEPART_CD = $NC.getValue("#edtQDepart_Cd", true);
//  var LINE_CD = $NC.getValue("#edtQLine_Cd", true);
//  var CLASS_CD = $NC.getValue("#edtQClass_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  var ITEM_NM = $NC.getValue("#edtQItem_Nm");
  var ITEM_STATE = $NC.getValue("#cboQItem_State");
  var VIEW_DIV = $NC.getValue("#cboQView_Div");
  if ($NC.isNull(VIEW_DIV)) {
    alert("수불발생상품여부를 선택하십시오.");
    $NC.setFocus("#cboQView_Div");
  }

  // 입출고 수불내역 조회
  if ($("#divMasterView").tabs("option", "active") === 0) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1MASTER);

    // 파라메터 세팅
    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE1: INOUT_DATE1,
      P_INOUT_DATE2: INOUT_DATE2,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_ITEM_STATE: ITEM_STATE,
      P_VIEW_DIV: VIEW_DIV,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LS02010Q/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetMasterT1);

    // 일자별 수불내역 조회
  } else if ($("#divMasterView").tabs("option", "active") === 1) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);

    // 파라메터 세팅
    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE1: INOUT_DATE1,
      P_INOUT_DATE2: INOUT_DATE2,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_ITEM_STATE: ITEM_STATE,
      P_VIEW_DIV: VIEW_DIV,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LS02010Q/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetMasterT2);

    // 기간별 수불내역 조회
  } else {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT3MASTER);

    // 파라메터 세팅
    G_GRDT3MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE1: INOUT_DATE1,
      P_INOUT_DATE2: INOUT_DATE2,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_ITEM_STATE: ITEM_STATE,
      P_VIEW_DIV: VIEW_DIV,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LS02010Q/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetMasterT3);
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
  $NC.G_VAR.activeTabName = "T" + id.substr(3);

  _OnResize($(window));
}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100,
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
    minWidth: 80,
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100,
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_D",
    field: "ITEM_STATE_D",
    name: "상태",
    minWidth: 70,
    cssClass: "align-center",
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 60,
    cssClass: "align-right",
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_DATE",
    field: "INOUT_DATE",
    name: "수불일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "입출고구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BSTOCK_QTY",
    field: "BSTOCK_QTY",
    name: "기초재고",
    minWidth: 90,
    cssClass: "align-right specialcol5",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E1_QTY",
    field: "E1_QTY",
    name: "일반(입고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E2_QTY",
    field: "E2_QTY",
    name: "수송(입고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E3_QTY",
    field: "E3_QTY",
    name: "반품(입고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E9_QTY",
    field: "E9_QTY",
    name: "기타(입고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E0_QTY",
    field: "E0_QTY",
    name: "합계(입고)",
    minWidth: 80,
    cssClass: "align-right specialcol5",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D1_QTY",
    field: "D1_QTY",
    name: "일반(출고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D2_QTY",
    field: "D2_QTY",
    name: "수송(출고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D3_QTY",
    field: "D3_QTY",
    name: "반품(출고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D9_QTY",
    field: "D9_QTY",
    name: "기타(출고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D0_QTY",
    field: "D0_QTY",
    name: "합계(출고)",
    minWidth: 80,
    cssClass: "align-right specialcol5",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "NSTOCK_QTY1",
    field: "NSTOCK_QTY",
    name: "기말재고",
    minWidth: 80,
    cssClass: "align-right specialcol5",
    aggregator: "SUM",
    groupDisplay: true
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 입출고 수불내역탭의 그리드 초기값 설정
 */
function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 4,
    summaryRow: {
      visible: true,
      compareFn: function(field, rowData) {
        if (field == "BSTOCK_QTY" && rowData.DATA_GRP != "1") {
          return false;
        }
        if (field == "NSTOCK_QTY" && rowData.DATA_GRP != "1") {
          return false;
        }
        return true;
      }
    }
  };

  // Data Grouping
  var dataGroupOptions = {
    getter: function(rowData) {
      return $NC.lPad(rowData.ITEM_CD, 30) + "|" + $NC.lPad(rowData.BRAND_CD, 20) + "|" + rowData.ITEM_STATE + "|"
          + $NC.lPad(rowData.ITEM_LOT, 20);
    },
    resultFn: function(field, summary) {
      if (field == "INOUT_DATE") {
        return "[상품별합계]";
      }

      if (field == "INOUT_NM") {
        return "[전체]";
      }

      return summary[field];
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LS02010Q.RS_T1_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options,
    dataGroupOptions: dataGroupOptions,
    canDblClick: true
  });

  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
  G_GRDT1MASTER.view.onDblClick.subscribe(onGridMasterDblClick);
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

function grdT2MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100,
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
    minWidth: 80,
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100,
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_D",
    field: "ITEM_STATE_D",
    name: "상태",
    minWidth: 70,
    cssClass: "align-center",
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 60,
    cssClass: "align-right",
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_DATE",
    field: "INOUT_DATE",
    name: "수불일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BSTOCK_QTY",
    field: "BSTOCK_QTY",
    name: "기초재고",
    minWidth: 90,
    cssClass: "align-right specialcol5",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E1_QTY",
    field: "E1_QTY",
    name: "일반(입고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E2_QTY",
    field: "E2_QTY",
    name: "수송(입고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E3_QTY",
    field: "E3_QTY",
    name: "반품(입고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E9_QTY",
    field: "E9_QTY",
    name: "기타(입고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E0_QTY",
    field: "E0_QTY",
    name: "합계(입고)",
    minWidth: 80,
    cssClass: "align-right specialcol5",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D1_QTY",
    field: "D1_QTY",
    name: "일반(출고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D2_QTY",
    field: "D2_QTY",
    name: "수송(출고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D3_QTY",
    field: "D3_QTY",
    name: "반품(출고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D9_QTY",
    field: "D9_QTY",
    name: "기타(출고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D0_QTY",
    field: "D0_QTY",
    name: "합계(출고)",
    minWidth: 80,
    cssClass: "align-right specialcol5",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "NSTOCK_QTY1",
    field: "NSTOCK_QTY",
    name: "기말재고",
    minWidth: 80,
    cssClass: "align-right specialcol5",
    aggregator: "SUM"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 일자별 수불내역탭의 그리드 초기값 설정
 */
function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 6,
    summaryRow: {
      visible: true,
      compareFn: function(field, rowData) {
        if (field == "BSTOCK_QTY" && rowData.BSTOCK_YN == "N") {
          return false;
        }
        if (field == "NSTOCK_QTY" && rowData.NSTOCK_YN == "N") {
          return false;
        }
        return true;
      }
    }
  };

  // Data Grouping
  var dataGroupOptions = {
    getter: function(rowData) {
      return $NC.lPad(rowData.ITEM_CD, 30) + "|" + $NC.lPad(rowData.BRAND_CD, 20) + "|" + rowData.ITEM_STATE + "|"
          + $NC.lPad(rowData.ITEM_LOT, 20);
    },
    resultFn: function(field, summary) {
      if (field == "INOUT_DATE") {
        return "[상품별합계]";
      } else {
        return summary[field];
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LS02010Q.RS_T2_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options,
    dataGroupOptions: dataGroupOptions,
    canDblClick: true
  });

  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
  G_GRDT2MASTER.view.onDblClick.subscribe(onGridMasterDblClick);
}

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

function grdT3MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100,
    summaryTitle: "[합계]"
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
    id: "ITEM_STATE_D",
    field: "ITEM_STATE_D",
    name: "상태",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BSTOCK_QTY",
    field: "BSTOCK_QTY",
    name: "기초재고",
    minWidth: 90,
    cssClass: "align-right specialcol5",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E1_QTY",
    field: "E1_QTY",
    name: "일반(입고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E2_QTY",
    field: "E2_QTY",
    name: "수송(입고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E3_QTY",
    field: "E3_QTY",
    name: "반품(입고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E9_QTY",
    field: "E9_QTY",
    name: "기타(입고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "E0_QTY",
    field: "E0_QTY",
    name: "합계(입고)",
    minWidth: 80,
    cssClass: "align-right specialcol5",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D1_QTY",
    field: "D1_QTY",
    name: "일반(출고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D2_QTY",
    field: "D2_QTY",
    name: "수송(출고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D3_QTY",
    field: "D3_QTY",
    name: "반품(출고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D9_QTY",
    field: "D9_QTY",
    name: "기타(출고)",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "D0_QTY",
    field: "D0_QTY",
    name: "합계(출고)",
    minWidth: 80,
    cssClass: "align-right specialcol5",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "NSTOCK_QTY1",
    field: "NSTOCK_QTY",
    name: "기말재고",
    minWidth: 80,
    cssClass: "align-right specialcol5",
    aggregator: "SUM"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 기간별 수불내역탭의 그리드 초기값 설정
 */
function grdT3MasterInitialize() {

  var options = {
    frozenColumn: 4,
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT3Master", {
    columns: grdT3MasterOnGetColumns(),
    queryId: "LS02010Q.RS_T3_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDT3MASTER.view.onSelectedRowsChanged.subscribe(grdT3MasterOnAfterScroll);
  G_GRDT3MASTER.view.onDblClick.subscribe(onGridMasterDblClick);
}

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

function onGridMasterDblClick(e, args) {

  var row = args.row;
  var rowData;

  // 입출고 수불내역 조회
  if ($("#divMasterView").tabs("option", "active") === 0) {

    rowData = G_GRDT1MASTER.data.getItem(row);
    // 일자별 수불내역 조회
  } else if ($("#divMasterView").tabs("option", "active") === 1) {

    rowData = G_GRDT2MASTER.data.getItem(row);
    // 기간별 수불내역 조회
  } else {

    rowData = G_GRDT3MASTER.data.getItem(row);
  }

  var isGroup = false;
  if (rowData.__group) {
    rowData = rowData.rows[0];
    isGroup = true;
  }

  var ITEM_CD = rowData.ITEM_CD;
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  var INOUT_DATE = "";
  if (!isGroup) {
    INOUT_DATE = $NC.nullToDefault(rowData.INOUT_DATE, "");
  }

  var INOUT_DATE1 = rowData.INOUT_DATE1;
  var INOUT_DATE2 = rowData.INOUT_DATE2;

  var ITEM_STATE = rowData.ITEM_STATE;
  if ($NC.isNull(ITEM_STATE)) {
    ITEM_STATE = "%";
  }

  var ITEM_LOT = rowData.ITEM_LOT;
  if ($NC.isNull(ITEM_LOT)) {
    ITEM_LOT = "%";
  }

  var INOUT_CD = rowData.INOUT_CD;
  if ($NC.isNull(INOUT_CD) || isGroup) {
    INOUT_CD = "%";
  }

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LS02011P",
    PROGRAM_NM: "입출고상세내역",
    url: "ls/LS02011P.html",
    width: 900,
    height: 500,
    userData: {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE: INOUT_DATE,
      P_INOUT_DATE1: INOUT_DATE1,
      P_INOUT_DATE2: INOUT_DATE2,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_STATE: ITEM_STATE,
      P_ITEM_LOT: ITEM_LOT,
      P_INOUT_CD: INOUT_CD
    }
  });
}

/**
 * 입출고 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT1(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);

  if (G_GRDT1MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT1MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT1Master", 0, 0);
  }
}

/**
 * 일자별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT2(ajaxData) {

  $NC.setInitGridData(G_GRDT2MASTER, ajaxData);

  if (G_GRDT2MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT2MASTER, 0);
  } else {
    $NC.setGridDisplayRows("grdT2Master", 0, 0);
  }
}

/**
 * 기간별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT3(ajaxData) {

  $NC.setInitGridData(G_GRDT3MASTER, ajaxData);

  if (G_GRDT3MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT3MASTER, 0);
  } else {
    $NC.setGridDisplayRows("grdT3Master", 0, 0);
  }
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  // 입출고 수불내역
  $NC.clearGridData(G_GRDT1MASTER);
  // 일자별 수불내역
  $NC.clearGridData(G_GRDT2MASTER);
  // 기간별 수불내역
  $NC.clearGridData(G_GRDT3MASTER);
}

/**
 * 검색조건의 사업구분 검색 팝업 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BRAND_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQBu_Cd", true);
  });
}

/**
 * 사업구분 검색 결과
 * 
 * @param seletedRowData
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setFocus("#edtQBu_Cd", true);
  }

  // 브랜드 초기화
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");

  onChangingCondition();
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

/**
 * 검색조건의 상품그룹 대분류 검색 이미지 클릭
 */
function showItemGroupDepartPopup() {
  var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd");
  if ($NC.isNull(BRAND_CD)) {
    alert("위탁사 코드를 먼저 선택하시기 바랍니다.");
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
    return;
  }

  $NP.showItemGroupDepartPopup({
    P_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd")
  }, onItemGroupDepartPopup, function() {
    $NC.setFocus("#edtQDeptart_Cd", true);
  });
}

/**
 * 상품그룹 대분류 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onItemGroupDepartPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQDepart_Cd", resultInfo.DEPART_CD);
    $NC.setValue("#edtQDepart_Nm", resultInfo.DEPART_NM);
  } else {
    $NC.setValue("#edtQDepart_Cd");
    $NC.setValue("#edtQDepart_Nm");
    $NC.setFocus("#edtQDepart_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 상품그룹 중분류 검색 이미지 클릭
 */
function showItemGroupLinePopup() {
  var DEPART_CD = $NC.getValue("#edtQDepart_Cd");
  if ($NC.isNull(DEPART_CD)) {
    alert("대분류 코드를 먼저 선택하시기 바랍니다.");
    $NC.setFocus("#edtQDepart_Cd", true);
    return;
  }

  $NP.showItemGroupLinePopup({
    P_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd"),
    P_DEPART_CD: $NC.getValue("#edtQDepart_Cd")
  }, onItemGroupLinePopup, function() {
    $NC.setFocus("#edtQLine_Cd", true);
  });
}

/**
 * 상품그룹 중분류 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onItemGroupLinePopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQLine_Cd", resultInfo.LINE_CD);
    $NC.setValue("#edtQLine_Nm", resultInfo.LINE_NM);
  } else {
    $NC.setValue("#edtQLine_Cd");
    $NC.setValue("#edtQLine_Nm");
    $NC.setFocus("#edtQLine_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 상품그룹 소분류 검색 이미지 클릭
 */
function showItemGroupClassPopup() {
  var LINE_CD = $NC.getValue("#edtQLine_Cd");
  if ($NC.isNull(LINE_CD)) {
    alert("중분류 코드를 먼저 선택하시기 바랍니다.");
    $NC.setFocus("#edtQLine_Cd", true);
    return;
  }

  $NP.showItemGroupClassPopup({
    P_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd"),
    P_DEPART_CD: $NC.getValue("#edtQDepart_Cd"),
    P_LINE_CD: $NC.getValue("#edtQLine_Cd")
  }, onItemGroupClassPopup, function() {
    $NC.setFocus("#edtQClass_Cd", true);
  });
}

/**
 * 상품그룹 소분류 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onItemGroupClassPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQClass_Cd", resultInfo.CLASS_CD);
    $NC.setValue("#edtQClass_Nm", resultInfo.CLASS_NM);
  } else {
    $NC.setValue("#edtQClass_Cd");
    $NC.setValue("#edtQClass_Nm");
    $NC.setFocus("#edtQClass_Cd", true);
  }
  onChangingCondition();
}