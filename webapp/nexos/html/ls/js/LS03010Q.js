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
  grdT4MasterInitialize();
  grdT4DetailInitialize();
  grdT5MasterInitialize();
  grdT6MasterInitialize();

  // Init시 경과일 hide, 기준일 표시
  // 기준일자 표시
  $("#divTab1Search").show();
  $("#divTab1Search1").show();
  // 기준일자From-to 비표시
  $("#divTab2Search").hide();
  // 경과일 초기화
  $NC.setValue("#edtQMonth_Qty", "0");

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  $NC.setInitDatePicker("#dtpQInout_Date");
  $NC.setInitDatePicker("#dtpQInout_Date1", null, "F");
  $NC.setInitDatePicker("#dtpQInout_Date2");

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQOwn_Brand_Cd").click(showOwnBrandPopup);
  $("#btnQDepart_Cd").click(showItemGroupDepartPopup);
  $("#btnQLine_Cd").click(showItemGroupLinePopup);
  $("#btnQClass_Cd").click(showItemGroupClassPopup);

  // 조회조건 - 물류센터 초기화
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CSUSERCENTER",
    P_QUERY_PARAMS: $NC.toJson({
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

  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function _OnLoaded() {

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
  clientHeight -= ($NC.G_OFFSET.tabHeaderHeight + $NC.G_LAYOUT.border1);

  switch ($("#divMasterView").tabs("option", "active")) {
  case 0:
    // Grid 높이 조정
    $NC.resizeGrid("#grdT1Master", clientWidth, clientHeight - $NC.G_LAYOUT.header);
    break;
  case 1:
    $NC.resizeGrid("#grdT2Master", clientWidth, clientHeight - $NC.G_LAYOUT.header);
    break;
  case 2:
    $NC.resizeGrid("#grdT3Master", clientWidth, clientHeight - $NC.G_LAYOUT.header);
    break;
  case 3:

    // Splitter 컨테이너 크기 조정
    var container = $("#divT4DetailView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT4Master", clientWidth, $("#grdT4Master").parent().height() - $NC.G_LAYOUT.header);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT4Detail", clientWidth, $("#grdT4Detail").parent().height() - $NC.G_LAYOUT.header);

    break;
  case 4:
    $NC.resizeGrid("#grdT5Master", clientWidth, clientHeight - $NC.G_LAYOUT.header);
    break;
  case 5:
    $NC.resizeGrid("#grdT6Master", clientWidth, clientHeight - $NC.G_LAYOUT.header);
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
  case "INOUT_DATE":
    $NC.setValueDatePicker(view, val, "기준일자를 정확히 입력하십시오.");
    break;
  case "INOUT_DATE1":
    $NC.setValueDatePicker(view, val, "기준 시작일자를 정확히 입력하십시오.");
    break;
  case "INOUT_DATE2":
    $NC.setValueDatePicker(view, val, "기준 종료일자를 정확히 입력하십시오.");
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

  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  var ITEM_NM = $NC.getValue("#edtQItem_Nm");
  var ITEM_STATE = $NC.getValue("#cboQItem_State");
  var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd", true);
  var DEPART_CD = $NC.getValue("#edtQDepart_Cd", true);
  var LINE_CD = $NC.getValue("#edtQLine_Cd", true);
  var CLASS_CD = $NC.getValue("#edtQClass_Cd", true);

  switch ($("#divMasterView").tabs("option", "active")) {
  case 0:

    var BASE_DATE = $NC.getValue("#dtpQInout_Date");
    if ($NC.isNull(BASE_DATE)) {
      alert("기준일자를 입력하십시오.");
      $NC.setFocus("#dtpQInout_Date");
      return;
    }

    var MONTH_QTY = $NC.getValue("#edtQMonth_Qty");
    if ($NC.isNull(MONTH_QTY)) {
      MONTH_QTY = "0";
    }

    $NC.setInitGridVar(G_GRDT1MASTER);

    // 파라메터 세팅
    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_BASE_DATE: BASE_DATE,
      P_MONTH_QTY: MONTH_QTY,
      P_BRAND_CD: BRAND_CD,
      P_DEPART_CD: DEPART_CD,
      P_LINE_CD: LINE_CD,
      P_CLASS_CD: CLASS_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_ITEM_STATE: ITEM_STATE,
      P_USER_ID: $NC.G_USERINFO.USER_ID

    });

    // 데이터 조회
    $NC.serviceCall("/LS03010Q/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetMasterT1);
    break;
  case 1:

    var BASE_DATE = $NC.getValue("#dtpQInout_Date");
    if ($NC.isNull(BASE_DATE)) {
      alert("기준일자를 입력하십시오.");
      $NC.setFocus("#dtpQInout_Date");
      return;
    }

    var MONTH_QTY = $NC.getValue("#edtQMonth_Qty");
    if ($NC.isNull(MONTH_QTY)) {
      MONTH_QTY = "0";
    }

    $NC.setInitGridVar(G_GRDT2MASTER);

    // 파라메터 세팅
    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_BASE_DATE: BASE_DATE,
      P_MONTH_QTY: MONTH_QTY,
      P_BRAND_CD: BRAND_CD,
      P_DEPART_CD: DEPART_CD,
      P_LINE_CD: LINE_CD,
      P_CLASS_CD: CLASS_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_ITEM_STATE: ITEM_STATE,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LS03010Q/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetMasterT2);

    break;
  case 2:

    var INOUT_DATE1 = $NC.getValue("#dtpQInout_Date1");
    if ($NC.isNull(INOUT_DATE1)) {
      alert("기준 시작일자를 입력하십시오.");
      $NC.setFocus("#dtpQInout_Date1");
      return;
    }

    var INOUT_DATE2 = $NC.getValue("#dtpQInout_Date2");
    if ($NC.isNull(INOUT_DATE2)) {
      alert("기준 종료일자를 입력하십시오.");
      $NC.setFocus("#dtpQInout_Date2");
      return;
    }

    if (INOUT_DATE1 > INOUT_DATE2) {
      alert("기준일자 검색 범위 오류입니다.");
      $NC.setFocus("#dtpQInout_Date1");
      return;
    }

    $NC.setInitGridVar(G_GRDT3MASTER);

    // 파라메터 세팅
    G_GRDT3MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE1: INOUT_DATE1,
      P_INOUT_DATE2: INOUT_DATE2,
      P_BRAND_CD: BRAND_CD,
      P_DEPART_CD: DEPART_CD,
      P_LINE_CD: LINE_CD,
      P_CLASS_CD: CLASS_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_ITEM_STATE: ITEM_STATE,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LS03010Q/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetMasterT3);

    break;
  case 3:

    var INOUT_DATE1 = $NC.getValue("#dtpQInout_Date1");
    if ($NC.isNull(INOUT_DATE1)) {
      alert("기준 시작일자를 입력하십시오.");
      $NC.setFocus("#dtpQInout_Date1");
      return;
    }

    var INOUT_DATE2 = $NC.getValue("#dtpQInout_Date2");
    if ($NC.isNull(INOUT_DATE2)) {
      alert("기준 종료일자를 입력하십시오.");
      $NC.setFocus("#dtpQInout_Date2");
      return;
    }

    if (INOUT_DATE1 > INOUT_DATE2) {
      alert("기준일자 검색 범위 오류입니다.");
      $NC.setFocus("#dtpQInout_Date1");
      return;
    }

    $NC.setInitGridVar(G_GRDT4MASTER);

    // 파라메터 세팅
    G_GRDT4MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE1: INOUT_DATE1,
      P_INOUT_DATE2: INOUT_DATE2,
      P_BRAND_CD: BRAND_CD,
      P_DEPART_CD: DEPART_CD,
      P_LINE_CD: LINE_CD,
      P_CLASS_CD: CLASS_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_ITEM_STATE: ITEM_STATE,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LS03010Q/getDataSet.do", $NC.getGridParams(G_GRDT4MASTER), onGetMasterT4);
    break;
  case 4:

    var INOUT_DATE1 = $NC.getValue("#dtpQInout_Date1");
    if ($NC.isNull(INOUT_DATE1)) {
      alert("기준 시작일자를 입력하십시오.");
      $NC.setFocus("#dtpQInout_Date1");
      return;
    }

    var INOUT_DATE2 = $NC.getValue("#dtpQInout_Date2");
    if ($NC.isNull(INOUT_DATE2)) {
      alert("기준 종료일자를 입력하십시오.");
      $NC.setFocus("#dtpQInout_Date2");
      return;
    }

    if (INOUT_DATE1 > INOUT_DATE2) {
      alert("기준일자 검색 범위 오류입니다.");
      $NC.setFocus("#dtpQInout_Date1");
      return;
    }

    $NC.setInitGridVar(G_GRDT5MASTER);

    // 파라메터 세팅
    G_GRDT5MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE1: INOUT_DATE1,
      P_INOUT_DATE2: INOUT_DATE2,
      P_BRAND_CD: BRAND_CD,
      P_DEPART_CD: DEPART_CD,
      P_LINE_CD: LINE_CD,
      P_CLASS_CD: CLASS_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_ITEM_STATE: ITEM_STATE,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LS03010Q/getDataSet.do", $NC.getGridParams(G_GRDT5MASTER), onGetMasterT5);

    break;
  case 5:

    var INOUT_DATE1 = $NC.getValue("#dtpQInout_Date1");
    if ($NC.isNull(INOUT_DATE1)) {
      alert("기준 시작일자를 입력하십시오.");
      $NC.setFocus("#dtpQInout_Date1");
      return;
    }

    var INOUT_DATE2 = $NC.getValue("#dtpQInout_Date2");
    if ($NC.isNull(INOUT_DATE2)) {
      alert("기준 종료일자를 입력하십시오.");
      $NC.setFocus("#dtpQInout_Date2");
      return;
    }

    if (INOUT_DATE1 > INOUT_DATE2) {
      alert("기준일자 검색 범위 오류입니다.");
      $NC.setFocus("#dtpQInout_Date1");
      return;
    }

    $NC.setInitGridVar(G_GRDT6MASTER);

    // 파라메터 세팅
    G_GRDT6MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE1: INOUT_DATE1,
      P_INOUT_DATE2: INOUT_DATE2,
      P_BRAND_CD: BRAND_CD,
      P_DEPART_CD: DEPART_CD,
      P_LINE_CD: LINE_CD,
      P_CLASS_CD: CLASS_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_ITEM_STATE: ITEM_STATE,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LS03010Q/getDataSet.do", $NC.getGridParams(G_GRDT6MASTER), onGetMasterT6);

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
  var TAB = ui.newTab.prop("id").substr(3).toUpperCase();

  switch (TAB) {
  case "TAB1":
    // 경과일 초기화
    $NC.setValue("#edtQMonth_Qty", "0");
    $("#divTab1Search").show();
    $("#divTab1Search1").show();
    $("#divTab2Search").hide();
    break;
  case "TAB2":
    $NC.setValue("#edtQMonth_Qty", "3");
    $("#divTab1Search").show();
    $("#divTab1Search1").show();
    $("#divTab2Search").hide();
    break;
  case "TAB3":
  case "TAB4":
  case "TAB5":
  case "TAB6":
    $("#divTab1Search").hide();
    $("#divTab1Search1").hide();
    $("#divTab2Search").show();
    break;
  }

  if (TAB == "TAB4") {
    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter("#divT4DetailView")) {
      // 스필리터를 통한 _OnResize 호출
      $("#divT4DetailView").trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter("#divT4DetailView", "h");
    }
  } else {
    _OnResize($(window));
  }
}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90,
    band: 0,
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 150,
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80,
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100,
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 70,
    cssClass: "align-center",
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 70,
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 60,
    cssClass: "align-right",
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 90,
    cssClass: "align-right",
    band: 1,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_BOX",
    field: "STOCK_BOX",
    name: "재고BOX",
    minWidth: 70,
    cssClass: "align-right",
    band: 1,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_EA",
    field: "STOCK_EA",
    name: "재고EA",
    minWidth: 70,
    cssClass: "align-right",
    band: 1,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY01",
    field: "STOCK_QTY01",
    name: "재고수량",
    minWidth: 90,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    band: 2,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_01_BOX",
    field: "STOCK_01_BOX",
    name: "재고BOX",
    minWidth: 70,
    cssClass: "align-right",
    band: 2,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_01_EA",
    field: "STOCK_01_EA",
    name: "재고EA",
    minWidth: 70,
    cssClass: "align-right",
    band: 2,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY13",
    field: "STOCK_QTY13",
    name: "재고수량",
    minWidth: 90,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    band: 3,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_13_BOX",
    field: "STOCK_13_BOX",
    name: "재고BOX",
    minWidth: 70,
    cssClass: "align-right",
    band: 3,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_13_EA",
    field: "STOCK_13_EA",
    name: "재고EA",
    minWidth: 70,
    cssClass: "align-right",
    band: 3,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY36",
    field: "STOCK_QTY36",
    name: "재고수량",
    minWidth: 90,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    band: 4,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_36_BOX",
    field: "STOCK_36_BOX",
    name: "재고BOX",
    minWidth: 70,
    cssClass: "align-right",
    band: 4,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_36_EA",
    field: "STOCK_36_EA",
    name: "재고EA",
    minWidth: 70,
    cssClass: "align-right",
    band: 4,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY60",
    field: "STOCK_QTY60",
    name: "재고수량",
    minWidth: 90,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    band: 5,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_60_BOX",
    field: "STOCK_60_BOX",
    name: "재고BOX",
    minWidth: 70,
    cssClass: "align-right",
    band: 5,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_60_EA",
    field: "STOCK_60_EA",
    name: "재고EA",
    minWidth: 70,
    cssClass: "align-right",
    band: 5,
    aggregator: "SUM"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 장기재고분석 그리드
 */
function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 6,
    showBandRow: true,
    bands: ["기본정보", "현재고", "1개월이내", "1~3개월", "4~6개월", "6개월이상"],
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LS03010Q.RS_T1_MASTER",
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
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Master", row + 1);
}

function grdT2MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90,
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
    id: "PERIOD_DATE",
    field: "PERIOD_DATE",
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
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_BOX",
    field: "STOCK_BOX",
    name: "재고BOX",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_EA",
    field: "STOCK_EA",
    name: "재고EA",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 유효기간임박 상품분석
 */
function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 6,
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LS03010Q.RS_T2_MASTER",
    sortCol: "ITEM_CD",
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
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Master", row + 1);
}

function grdT3MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90,
    band: 0,
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 150,
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80,
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100,
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 70,
    cssClass: "align-center",
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 80,
    cssClass: "align-right",
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 80,
    cssClass: "align-right",
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "AVG_QTY",
    field: "AVG_QTY",
    name: "재고수량",
    minWidth: 60,
    cssClass: "align-right",
    band: 1
  });
  $NC.setGridColumn(columns, {
    id: "AVG_BOX",
    field: "AVG_BOX",
    name: "재고BOX",
    minWidth: 60,
    cssClass: "align-right",
    band: 1
  });
  $NC.setGridColumn(columns, {
    id: "AVG_EA",
    field: "AVG_EA",
    name: "재고EA",
    minWidth: 60,
    cssClass: "align-right",
    band: 1
  });
  $NC.setGridColumn(columns, {
    id: "AVG_WEIGHT",
    field: "AVG_WEIGHT",
    name: "재고중량",
    minWidth: 60,
    cssClass: "align-right",
    band: 1
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 60,
    cssClass: "align-right",
    band: 2,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_BOX",
    field: "STOCK_BOX",
    name: "재고BOX",
    minWidth: 60,
    cssClass: "align-right",
    band: 2,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_EA",
    field: "STOCK_EA",
    name: "재고EA",
    minWidth: 60,
    cssClass: "align-right",
    band: 2,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_WEIGHT",
    field: "STOCK_WEIGHT",
    name: "재고중량",
    minWidth: 60,
    cssClass: "align-right",
    band: 2,
    aggregator: "SUM"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 일평균재고
 */
function grdT3MasterInitialize() {

  var options = {
    frozenColumn: 6,
    showBandRow: true,
    bands: ["기본정보", "일평균재고", "현재고"],
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT3Master", {
    columns: grdT3MasterOnGetColumns(),
    queryId: "LS03010Q.RS_T3_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT3MASTER.view.onSelectedRowsChanged.subscribe(grdT3MasterOnAfterScroll);
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

function grdT4MasterOnGetColumns() {

  var columns = [ ];
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
    id: "ROTATE_DAY",
    field: "ROTATE_DAY",
    name: "평균재고일수",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "출고수량",
    minWidth: 90,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 평균재고회전율
 */
function grdT4MasterInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT4Master", {
    columns: grdT4MasterOnGetColumns(),
    queryId: "LS03010Q.RS_T4_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT4MASTER.view.onSelectedRowsChanged.subscribe(grdT4MasterOnAfterScroll);
}

function grdT4MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT4MASTER.lastRow != null) {
    if (row == G_GRDT4MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  $NC.setInitGridVar(G_GRDT4DETAIL);
  onGetDetailT4({
    data: null
  });

  var rowData = G_GRDT4MASTER.data.getItem(row);
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var INOUT_DATE1 = $NC.getValue("#dtpQInout_Date1");
  var INOUT_DATE2 = $NC.getValue("#dtpQInout_Date2");

  // 파라메터 세팅
  G_GRDT4DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_INOUT_DATE1: INOUT_DATE1,
    P_INOUT_DATE2: INOUT_DATE2,
    P_BRAND_CD: rowData.BRAND_CD,
    P_ITEM_CD: rowData.ITEM_CD,
    P_ITEM_STATE: rowData.ITEM_STATE
  });

  // 데이터 조회
  $NC.serviceCall("/LS03010Q/getDataSet.do", $NC.getGridParams(G_GRDT4DETAIL), onGetDetailT4);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT4Master", row + 1);
}

function grdT4DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    cssClass: "align-center",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_CD_F",
    field: "INOUT_CD_F",
    name: "출고구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "배송처코드",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_NM",
    field: "DELIVERY_NM",
    name: "배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_DATE",
    field: "STOCK_DATE",
    name: "입고일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_DAY",
    field: "STOCK_DAY",
    name: "재고일수",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "출고수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_BOX",
    field: "CONFIRM_BOX",
    name: "출고BOX",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_EA",
    field: "CONFIRM_EA",
    name: "출고EA",
    minWidth: 90,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/*
 * 평균재고회전율 - 상품별 출고내역
 */
function grdT4DetailInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT4Detail", {
    columns: grdT4DetailOnGetColumns(),
    queryId: "LS03010Q.RS_T4_DETAIL",
    sortCol: "OUTBOUND_DATE",
    gridOptions: options
  });

  G_GRDT4DETAIL.view.onSelectedRowsChanged.subscribe(grdT4DetailOnAfterScroll);
}

function grdT4DetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT4DETAIL.lastRow != null) {
    if (row == G_GRDT4DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT4Detail", row + 1);
}

function grdT5MasterOnGetColumns() {

  var columns = [ ];
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
    id: "HIT_CNT",
    field: "HIT_CNT",
    name: "총히트수",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "HIT_QTY",
    field: "HIT_QTY",
    name: "총피킹수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "WORKDAY_CNT",
    field: "WORKDAY_CNT",
    name: "출고일수",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "HIT_RATE",
    field: "HIT_RATE",
    name: "평균히트율",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "AVG_OUT_QTY",
    field: "AVG_OUT_QTY",
    name: "평균피킹수량(1회)",
    minWidth: 110,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "AVG_DAY_QTY",
    field: "AVG_DAY_QTY",
    name: "평균피킹수량(1일)",
    minWidth: 110,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상품별 평균히트율
 */
function grdT5MasterInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT5Master", {
    columns: grdT5MasterOnGetColumns(),
    queryId: "LS03010Q.RS_T5_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT5MASTER.view.onSelectedRowsChanged.subscribe(grdT5MasterOnAfterScroll);
}

function grdT5MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT5MASTER.lastRow != null) {
    if (row == G_GRDT5MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT5Master", row + 1);
}

function grdT6MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "HIT_CNT",
    field: "HIT_CNT",
    name: "총히트수",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "HIT_QTY",
    field: "HIT_QTY",
    name: "총피킹수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "WORKDAY_CNT",
    field: "WORKDAY_CNT",
    name: "출고일수",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "HIT_RATE",
    field: "HIT_RATE",
    name: "평균히트율",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "AVG_OUT_QTY",
    field: "AVG_OUT_QTY",
    name: "평균피킹수량(1회 )",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "AVG_DAY_QTY",
    field: "AVG_DAY_QTY",
    name: "평균피킹수량(1일)",
    minWidth: 90,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 로케이션별 평균히트율
 */
function grdT6MasterInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT6Master", {
    columns: grdT6MasterOnGetColumns(),
    queryId: "LS03010Q.RS_T6_MASTER",
    sortCol: "LOCATION_CD",
    gridOptions: options
  });

  G_GRDT6MASTER.view.onSelectedRowsChanged.subscribe(grdT6MasterOnAfterScroll);
}

function grdT6MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT6MASTER.lastRow != null) {
    if (row == G_GRDT6MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT6Master", row + 1);
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
 * 기간별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT4(ajaxData) {

  $NC.setInitGridData(G_GRDT4MASTER, ajaxData);

  if (G_GRDT4MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT4MASTER, 0);
  } else {
    $NC.setInitGridVar(G_GRDT4DETAIL);
    onGetDetailT4({
      data: null
    });
    $NC.setGridDisplayRows("grdT4Master", 0, 0);
  }

}

/**
 * 평균재고회전율 - 상품별 출고내역
 * 
 * @param ajaxData
 */
function onGetDetailT4(ajaxData) {

  $NC.setInitGridData(G_GRDT4DETAIL, ajaxData);

  if (G_GRDT4DETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT4DETAIL, 0);
  } else {
    $NC.setGridDisplayRows("grdT4Detail", 0, 0);
  }
}

/**
 * 기간별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT5(ajaxData) {

  $NC.setInitGridData(G_GRDT5MASTER, ajaxData);

  if (G_GRDT5MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT5MASTER, 0);
  } else {
    $NC.setGridDisplayRows("grdT5Master", 0, 0);
  }
}

/**
 * 기간별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT6(ajaxData) {

  $NC.setInitGridData(G_GRDT6MASTER, ajaxData);

  if (G_GRDT6MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT6MASTER, 0);
  } else {
    $NC.setGridDisplayRows("grdT6Master", 0, 0);
  }
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  $NC.clearGridData(G_GRDT1MASTER);
  $NC.clearGridData(G_GRDT2MASTER);
  $NC.clearGridData(G_GRDT3MASTER);
  $NC.clearGridData(G_GRDT4MASTER);
  $NC.clearGridData(G_GRDT4DETAIL);
  $NC.clearGridData(G_GRDT5MASTER);
  $NC.clearGridData(G_GRDT6MASTER);
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