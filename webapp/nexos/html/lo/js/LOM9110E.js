/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    ROWCHAK: "",
    LAST_YN: ""
  });

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

  grdT3MasterInitialize();
  grdT3DetailInitialize();

  grdSubInitialize();
  // 조회조건 - 사업부 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $NC.setInitDatePicker("#dtpQHas_Date");

  $("#RePrint").click(doPrint4);
  $("#Ts1").click(TS1);
  $("#btnERPSend").click(Hassend);

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
  // 조회조건 - 입출고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "HAS_END_YN",
      P_CODE_CD: "",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQEnd_Yn",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });
  
  // 조회조건 - 입출고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "FLOOR_DIV",
      P_CODE_CD: "",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQFloor_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
      onComplete: function() {
        $NC.setValue("#cboQFloor_Div");
      }
  });
}



function _OnLoaded() {
  $NC.setInitSplitter("#divT1DetailView", "v", 800);
  $NC.setInitSplitter("#test", "h", 200);
  // 미처리/오류 내역 탭 화면에 splitter 설정
  $NC.setInitSplitter("#divT2DetailView", "v", 800);
  $NC.setInitSplitter("#divT3DetailView", "v", 700);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

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

  // 기타입출고등록 탭
  if ($("#divMasterView").tabs("option", "active") === 0) {

    // var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
    // var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

    // Splitter 컨테이너 크기 조정
    var container = $("#divT1DetailView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdT1Master").parent();
    // Master Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", container.width(), container.height() - $NC.G_LAYOUT.header);

    // Splitter 컨테이너 크기 조정
    container = $("#test");
    var splitter = container.children(".splitter-bar");
    splitter.width(container.width());

    container = $("#grdT1Detail").parent();
    // Detail Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Detail", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#grdSub").parent();
    // Sub Grid 사이즈 조정
    $NC.resizeGrid("#grdSub", container.width(), container.height() - $NC.G_LAYOUT.header);
    /*--------------------------------------*/

    // Splitter 컨테이너 크기 조정
    /*
    var container = $("#divT1DetailView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", $("#grdT1Master").parent().width(), clientHeight - $NC.G_LAYOUT.header);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Detail", $("#grdT1Detail").parent().width(), clientHeight - $NC.G_LAYOUT.header);
    */
  } else if ($("#divMasterView").tabs("option", "active") === 1) {

    // Splitter 컨테이너 크기 조정
    var container = $("#divT2DetailView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Master", $("#grdT2Master").parent().width(), clientHeight - $NC.G_LAYOUT.header);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Detail", $("#grdT2Detail").parent().width(), clientHeight - $NC.G_LAYOUT.header);

  } else if ($("#divMasterView").tabs("option", "active") === 2) {
    // Splitter 컨테이너 크기 조정
    var container = $("#divT3DetailView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT3Master", $("#grdT3Master").parent().width(), clientHeight - $NC.G_LAYOUT.header);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT3Detail", $("#grdT3Detail").parent().width(), clientHeight - $NC.G_LAYOUT.header);

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
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBranPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup, onOwnBrandPopup);
    }
    return;
  case "HASLOCATION_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      CENTER_CD = $NC.getValue("#cboQCenter_Cd");
      P_QUERY_PARAMS = {
        P_CENTER_CD: CENTER_CD,
        P_ZONE_CD: "",
        P_BANK_CD: "",
        P_BAY_CD: "",
        P_LEV_CD: "",
        P_HASLOCATION_CD: val
      };
      O_RESULT_DATA = $NP.getLocation01Info({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onLocationPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showLocation01Popup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onLocationPopup, onLocationPopup);
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
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var HAS_DATE = $NC.getValue("#dtpQHas_Date");
  if ($NC.isNull(HAS_DATE)) {
    alert("합포장일자를 입력하십시오.");
    $NC.setFocus("#dtpQHas_Date");
    return;
  }

  var FLOOR_DIV = $NC.getValue("#cboQFloor_Div");
  if ($NC.isNull(FLOOR_DIV)) {
    alert("합포장존구분을 선택하십시요.");
    $NC.setFocus("#cboQFloor_Div");
    return;
  }

  
  
  var END_YN_DIV = $NC.getValue("#cboQEnd_Yn");
  var OUTBOUND_NO = $NC.getValue("#edtOutbound_No");

  var BU_NO = $NC.getValue("#edtQHas_No");
  var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm");
  var SHIPPER_NM = $NC.getValue("#edtShipper_Nm");
  var HASLOCATION_CD = $NC.getValue("#edtQHaslocation_Cd");

  // 상품별 출고내역 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1MASTER);
    // $NC.setInitGridVar(G_GRDT1DETAIL);
    // $NC.setInitGridVar(RS_SUB);

    $NC.setInitGridVar(G_GRDT1DETAIL);
    $NC.setInitGridData(G_GRDT1DETAIL);
    $NC.setGridDisplayRows("#grdT1Detail", 0, 0);

    $NC.setInitGridVar(G_GRDSUB);
    $NC.setInitGridData(G_GRDSUB);
    $NC.setGridDisplayRows("#grdSub", 0, 0);

    $NC.serviceCall("/LOM9110E/getDataSet.do", {
      P_QUERY_ID: "LOM9110E.RS_SUB",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
      })
    }, onGetNonSendCnt);
    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_HAS_DATE: HAS_DATE,
      P_BU_NO: BU_NO,
      P_ORDERER_NM: ORDERER_NM,
      P_SHIPPER_NM: SHIPPER_NM,
      P_END_YN: '%',
      P_LOCATION_CD: HASLOCATION_CD,
      P_OUTBOUND_NO: OUTBOUND_NO,
      P_FLOOR_DIV: FLOOR_DIV
    });

    // 데이터 조회
    $NC.serviceCall("/LOM9110E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

  } else if ($("#divMasterView").tabs("option", "active") === 1) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);

    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_HAS_DATE: HAS_DATE,
      P_BU_NO: BU_NO,
      P_ORDERER_NM: ORDERER_NM,
      P_SHIPPER_NM: SHIPPER_NM,
      P_END_YN: END_YN_DIV,
      P_LOCATION_CD: HASLOCATION_CD,
      P_FLOOR_DIV: FLOOR_DIV
    });

    // 데이터 조회
    $NC.serviceCall("/LOM9110E/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
  } else {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT3MASTER);

    G_GRDT3MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_HAS_DATE: HAS_DATE,
      P_BU_NO: BU_NO,
      P_ORDERER_NM: ORDERER_NM,
      P_SHIPPER_NM: SHIPPER_NM,
      P_END_YN: END_YN_DIV,
      P_LOCATION_CD: HASLOCATION_CD,
      P_FLOOR_DIV: FLOOR_DIV
    });

    // 데이터 조회
    $NC.serviceCall("/LOM9110E/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetT3Master);

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

function tabOnActivate(event, ui) {

  _OnResize($(window));
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
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    width: 30,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "HAS_DATE",
    field: "HAS_DATE",
    name: "합포장일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션코드",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "HAS_NO",
    field: "HAS_NO",
    name: "합포장번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "END_YN",
    field: "END_YN",
    name: "처리구분",
    minWidth: 60,
    cssClass: "align-center"
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
    id: "FLOOR_DIV_F",
    field: "FLOOR_DIV_F",
    name: "LOC구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "HAS_DATETIME",
    field: "HAS_DATETIME",
    name: "합포장분류시간",
    minWidth: 160
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 3,
    specialRow: {
      compareKey: "END_YN1",
      compareVal: "D",
      compareOperator: "==",
      cssClass: "specialrow3"
    }
  };

  // Grid DataView 생성 및 초기화
  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LOM9110E.RS_T1_MASTER",
    sortCol: "HAS_DATE",
    gridOptions: options
  });

  G_GRDT1MASTER.view.onClick.subscribe(grdMasterOnClick);
  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdMasterT1OnAfterScroll);
  G_GRDT1MASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT1MASTER, "CHECK_YN");
}

function grdMasterOnClick(e, args) {

  G_GRDT1MASTER.view.getCanvasNode().focus();

  if (args.cell === G_GRDT1MASTER.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDT1MASTER.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {
        rowData.CHECK_YN = checkVal;
        G_GRDT1MASTER.data.updateItem(rowData.id, rowData);
      }
    }
  }
}

function grdMasterT1OnAfterScroll(e, args) {

  var row = args.rows[0];

  var rowData = G_GRDT1MASTER.data.getItem(row);
  if (G_GRDT1MASTER.lastRow != null) {
    if (row == G_GRDT1MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setInitGridVar(G_GRDT1DETAIL);
  $NC.setInitGridVar(G_GRDSUB);

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  G_GRDT1DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_HAS_DATE: rowData.HAS_DATE,
    P_HAS_NO: rowData.HAS_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LOM9110E/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Master", row + 1);

}

function grdMasterOnHeaderClick(e, args) {

  G_GRDT1MASTER.view.getCanvasNode().focus();

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDT1MASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT1MASTER.data.getLength();
      var rowData;
      G_GRDT1MASTER.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDT1MASTER.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDT1MASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT1MASTER.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

function grdT1DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    width: 30,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "합포장순번",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "END_YN",
    field: "END_YN",
    name: "처리구분",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    cssClass: "align-center",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ZONE_CD",
    field: "ZONE_CD",
    name: "존코드",
    minWidth: 40,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "HAS_DATETIME",
    field: "HAS_DATETIME",
    name: "합포장분류시간",
    minWidth: 120
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailInitialize() {

  var options = {
    frozenColumn: 3,
    specialRow: {
      compareKey: "END_YN",
      compareVal: "주문취소",
      compareOperator: "==",
      cssClass: "specialrow3"
    }

  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Detail", {
    columns: grdT1DetailOnGetColumns(),
    queryId: "LOM9110E.RS_DETAIL1",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDT1DETAIL.view.onClick.subscribe(grdT1DetailOnClick);
  G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);

  G_GRDT1DETAIL.view.onHeaderClick.subscribe(grdT1DetailOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT1DETAIL, "CHECK_YN");
}

function grdT1DetailOnClick(e, args) {

  G_GRDT1DETAIL.focused = true;

}

/**
 * 입고중량등록탭 하단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
function grdT1DetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  var rowData = G_GRDT1DETAIL.data.getItem(row);

  if (G_GRDT1DETAIL.lastRow != null) {
    if (row == G_GRDT1DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  $NC.setInitGridVar(G_GRDSUB);

  $NC.setInitGridData(G_GRDSUB);
  $NC.setGridDisplayRows("#grdSub", 0, 0);
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  G_GRDSUB.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
    P_OUTBOUND_NO: rowData.OUTBOUND_NO,
    P_ZONE_CD: rowData.ZONE_CD,
  });

  // 데이터 조회
  $NC.serviceCall("/LOM9110E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Detail", row + 1);
}

function grdT1DetailOnHeaderClick(e, args) {

  G_GRDT1DETAIL.view.getCanvasNode().focus();

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDT1DETAIL.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT1DETAIL.data.getLength();
      var rowData;
      G_GRDT1DETAIL.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDT1DETAIL.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          if (rowData.LINE_NO !== '000000') {
            rowData.CHECK_YN = checkVal;
            G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);
          } else if (rowData.LINE_NO == '000000') {
            // alert("합포장대상은 선택 할 수없습니다.");
            // return;
          }
        }
      }
      G_GRDT1DETAIL.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

function grdT2MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "HAS_DATE",
    field: "HAS_DATE",
    name: "합포장일자",
    minWidth: 90,
    cssClass: "align-center"
  });

  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션코드",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "HAS_NO",
    field: "HAS_NO",
    name: "합포장번호",
    minWidth: 70,
    cssClass: "align-center"
  });
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
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "END_YN",
    field: "END_YN",
    name: "처리구분",
    minWidth: 60,
    cssClass: "align-center"
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
    id: "FLOOR_DIV_F",
    field: "FLOOR_DIV_F",
    name: "LOC구분",
    minWidth: 80
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 배송처별 입고내역탭의 그리드 초기값 설정
 */
function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LOM9110E.RS_T2_MASTER",
    sortCol: "HAS_DATE",
    gridOptions: options
  });
  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdMasterT2OnAfterScroll);

}

function grdMasterT2OnAfterScroll(e, args) {

  var row = args.rows[0];

  var rowData = G_GRDT2MASTER.data.getItem(row);
  if (G_GRDT2MASTER.lastRow != null) {
    if (row == G_GRDT2MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  $NC.setInitGridVar(G_GRDT2DETAIL);
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  G_GRDT2DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
    P_OUTBOUND_NO: rowData.OUTBOUND_NO,
    P_ZONE_CD: rowData.ZONE_CD,
  });

  // 데이터 조회
  $NC.serviceCall("/LOM9110E/getDataSet.do", $NC.getGridParams(G_GRDT2DETAIL), onGetT2Detail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Master", row + 1);

}

function grdT2DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "HAS_TYPE_F",
    field: "HAS_TYPE_F",
    name: "상품물성",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "구성수량",
    minWidth: 70,
    cssClass: "align-right"
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
    queryId: "LOM9110E.RS_DETAIL2",
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
  $NC.clearGridData(G_GRDSUB);

  $NC.clearGridData(G_GRDT2DETAIL);
  $NC.clearGridData(G_GRDT2MASTER);
  $NC.clearGridData(G_GRDT3DETAIL);
  $NC.clearGridData(G_GRDT3MASTER);
  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}
/*------------------------------------------------------*/

function grdT3MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    width: 30,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "HAS_DATE",
    field: "HAS_DATE",
    name: "합포장일자",
    minWidth: 90,
    cssClass: "align-center"
  });

  $NC.setGridColumn(columns, {
    id: "HAS_NO",
    field: "HAS_NO",
    name: "합포장번호",
    minWidth: 70,
    cssClass: "align-center"
  });

  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "END_YN",
    field: "END_YN",
    name: "처리구분",
    minWidth: 60,
    cssClass: "align-center"
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
    id: "FLOOR_DIV_F",
    field: "FLOOR_DIV_F",
    name: "LOC구분",
    minWidth: 80
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 배송처별 입고내역탭의 그리드 초기값 설정
 */
function grdT3MasterInitialize() {

  var options = {
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT3Master", {
    columns: grdT3MasterOnGetColumns(),
    queryId: "LOM9110E.RS_T3_MASTER",
    sortCol: "HAS_DATE",
    gridOptions: options
  });
  G_GRDT3MASTER.view.onSelectedRowsChanged.subscribe(grdMasterT3OnAfterScroll);
  G_GRDT3MASTER.view.onHeaderClick.subscribe(grdMasterT3OnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT3MASTER, "CHECK_YN");
}

function grdMasterT3OnHeaderClick(e, args) {

  G_GRDT3MASTER.view.getCanvasNode().focus();

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDT3MASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT3MASTER.data.getLength();
      var rowData;
      G_GRDT3MASTER.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDT3MASTER.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDT3MASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT3MASTER.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

/**
 * 온라인몰 출고내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterT3OnAfterScroll(e, args) {

  var row = args.rows[0];

  var rowData = G_GRDT3MASTER.data.getItem(row);
  if (G_GRDT3MASTER.lastRow != null) {
    if (row == G_GRDT3MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  $NC.setInitGridVar(G_GRDT3DETAIL);
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  G_GRDT3DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
    P_OUTBOUND_NO: rowData.OUTBOUND_NO,
    P_HAS_NO: rowData.HAS_NO,
    P_HAS_DATE: rowData.HAS_DATE
  });

  // 데이터 조회
  $NC.serviceCall("/LOM9110E/getDataSet.do", $NC.getGridParams(G_GRDT3DETAIL), onGetT3Detail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT3Master", row + 1);
}

/**
 * 온라인 출고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT3(ajaxData) {

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
  $NC.G_VAR.buttons._excel = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function grdT3DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "HAS_TYPE_F",
    field: "HAS_TYPE_F",
    name: "상품물성",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "구성수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 배송처별 입고내역탭의 그리드 초기값 설정
 */
function grdT3DetailInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT3Detail", {
    columns: grdT3DetailOnGetColumns(),
    queryId: "LOM9110E.RS_DETAIL3",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT3DETAIL.view.onSelectedRowsChanged.subscribe(grdT3DetailOnAfterScroll);
}

function grdT3DetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT3DETAIL.lastRow != null) {
    if (row == G_GRDT3DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT3Detail", row + 1);
}
/*----------------------------------------------------------*/

function grdSubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "HAS_TYPE_F",
    field: "HAS_TYPE_F",
    name: "상품물성",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "구성수량",
    minWidth: 70,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: "LOM9110E.RS_SUB1",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);

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

/*----------------------------------------------------*/
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
 * 로케이션별 재고현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT3Master(ajaxData) {

  $NC.setInitGridData(G_GRDT3MASTER, ajaxData);

  if (G_GRDT3MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT3MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT3Master", 0, 0);

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDT3DETAIL);

    onGetT3Detail({
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
    if ($NC.isNull(G_GRDT1DETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1DETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1DETAIL, {
        selectKey: "ITEM_CD",
        selectVal: G_GRDT1DETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT1Detail", 0, 0);
  }
  G_GRDT1DETAIL.view.getCanvasNode().focus();

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
 * 로케이션별 재고현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT3Detail(ajaxData) {

  $NC.setInitGridData(G_GRDT3DETAIL, ajaxData);

  if (G_GRDT3DETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT3DETAIL, 0);
  } else {
    $NC.setGridDisplayRows("#grdT3Detail", 0, 0);
  }
}
function onGetSub(ajaxData) {

  $NC.setInitGridData(G_GRDSUB, ajaxData);
  if (G_GRDSUB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDSUB.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSUB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSUB, {
        selectKey: "ITEM_CD",
        selectVal: G_GRDSUB.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdSub", 0, 0);
  }
}

/**
 * 검색조건의 로케이션 검색 이미지 클릭
 */
function showLocationPopup() {
  CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  $NP.showLocation01Popup({
    P_CENTER_CD: CENTER_CD,
    P_ZONE_CD: "",
    P_BANK_CD: "",
    P_BAY_CD: "",
    P_LEV_CD: "",
    P_LOCATION_CD: "%"
  }, onLocationPopup, function() {
    $NC.setFocus("#edtQHaslocation_Cd", true);
  });
}

/**
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
function onLocationPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQHaslocation_Cd", resultInfo.LOCATION_CD);
  } else {
    $NC.setValue("#edtQHaslocation_Cd");
    $NC.setFocus("#edtQHaslocation_Cd", true);
  }
  onChangingCondition();
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

/**
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
    $NC.setFocus("#dtpQInvest_Date1", true);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NP.showOwnBranPopup({
    P_CUST_CD: CUST_CD,
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
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

function TS4() {

  var rowData = G_GRDT1DETAIL.data.getItems();
  var rowCount = G_GRDT1DETAIL.data.getLength();
  if (rowData.length === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("분류취소 처리 하시겠습니까?");
  if (!result) {
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var HAS_DATE = $NC.getValue("#dtpQHas_Date");
  closingDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT1DETAIL.data.getItem(row);
    var lastRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (rowData.CHECK_YN == "Y") {
      if (rowData.LINE_NO !== "0") {
        chkCnt++;
        var Ms = {
          P_CENTER_CD: CENTER_CD,
          P_BU_CD: BU_CD,
          P_HAS_DATE: HAS_DATE,
          P_HAS_NO: lastRowData.HAS_NO,
          P_LINE_NO: rowData.LINE_NO
        };
        closingDS.push(Ms);
      }
    }
  }
  if (chkCnt == 0) {
    alert("처리대상이 없습니다. 선택하십시오.");
    return;
  }

  $NC.serviceCall("/LOM9110E/callProc_Bw.do", {
    P_DS_MASTER: $NC.getParams(closingDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, Ts1, onSaveError);
}

function Ts1(ajaxData) {

  var resultData = $NC.toArray(ajaxData);

  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA === "OK") {

      alert("삭제처리되었습니다.");
      doPrint3();
    } else {
      alert(resultData.RESULT_DATA);
      return;
    }
  }
}

function Hassend() {
  var rowCount = G_GRDT1MASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  closingDS = [ ];
  closingDS1 = [ ];
  var chkCnt = 0;
  var chkCnt1 = 0;
  var End_Yn_D = '';
  var End_Yn_N = '';
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT1MASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      if (rowData.END_YN1 == "D") {
        chkCnt++;
        var Ms = {
          P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
          P_BU_CD: $NC.getValue("#edtQBu_Cd"),
          P_HAS_DATE: rowData.HAS_DATE,
          P_HAS_NO: rowData.HAS_NO,
          P_PROC_GUBN: "1"
        };
        closingDS.push(Ms);
        End_Yn_D = 'D';

      } else {
        chkCnt1++;
        var Ms = {
          P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
          P_BU_CD: $NC.getValue("#edtQBu_Cd"),
          P_HAS_DATE: rowData.HAS_DATE,
          P_HAS_NO: rowData.HAS_NO,
        };
        closingDS1.push(Ms);
        End_Yn_N = 'N';

      }
    }
  }
  if (chkCnt == 0 && chkCnt1 == 0) {
    alert("처리대상이 없습니다. 선택하십시오.");
    return;
  }

  if (End_Yn_D == "D") {
    $NC.serviceCall("/LOM9110E/callPorpertiesUpdate.do", {
      P_DS_MASTER: $NC.getParams(closingDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onExecSP, onSaveError);
  } else if (End_Yn_N == "N") {

    var result = confirm("합포장분할 처리시 재합포장 처리할수 없습니다. 그래도 하시겠습니까?");
    if (!result) {
      return;
    }

    $NC.serviceCall("/LOM9110E/callLineproc.do", {
      P_DS_MASTER: $NC.getParams(closingDS1),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, OnSaveHas, onSaveError);

  }
  /*

  
  */
}

function OnSaveHas(ajaxData) {

  var resultData = $NC.toArray(ajaxData);

  var resultData1 = resultData.RESULT_DATA;

  var resultData2 = resultData1.substring(1);
  var resultData3 = resultData1.substring(1, 4);

  var TEST = "-";
  // var RESULT_DATA1 = resultData1.split(TEST);
  var O_HAS_NO = resultData2;
  // var O_HAS_NO = RESULT_DATA1[1];

  if (O_HAS_NO !== "") {
    if (resultData3 == 'HAS') {
      alert(O_HAS_NO);
      return;
    } else {
      doPrint2(O_HAS_NO);
    }
  } else {

    return;
  }
}

function onExecSP(ajaxData) {

  var resultData = $NC.toArray(ajaxData);

  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
    }

  }

  doPrint1();
}

function doPrint1() {

  if (G_GRDT1MASTER.view.getEditorLock().isActive()) {
    G_GRDT1MASTER.view.getEditorLock().commitCurrentEdit();
  }

  var center_Cd = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(center_Cd)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var checkedValueDS = [ ];
  var rowCount = G_GRDT1MASTER.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT1MASTER.data.getItem(row);
    if (rowData.CHECK_YN === "Y") {
      checkedValueDS.push(rowData.HAS_NO);
    }
  }
  if (checkedValueDS.length == 0) {
    alert("출력할 데이터를 선택하십시오.");
    return;
  }
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var HAS_DATE = $NC.getValue("#dtpQHas_Date");

  $NC.G_MAIN.silentPrint({
    printParams: [{
      reportDoc: "lo/LABEL_LOM12",
      queryId: "WR.RS_LABEL_LOM13",
      queryParams: {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_HAS_DATE: HAS_DATE
      },
      checkedValue: checkedValueDS.toString(),
      iFrameNo: 1,
      silentPrinterName: $NC.G_USERINFO.PRINT_CARD
    }],
    onAfterPrint: function() {
      _Inquiry();
    }
  });

  // $NC.G_MAIN.silentPrint(printOptions);
}

function doPrint2(resultData) {

  var center_Cd = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(center_Cd)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var HAS_DATE = $NC.getValue("#dtpQHas_Date");

  $NC.G_MAIN.silentPrint({

    printParams: [{
      reportDoc: "lo/LABEL_LOM14",
      queryId: "WR.RS_LABEL_LOM13",
      queryParams: {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_HAS_DATE: HAS_DATE
      },
      checkedValue: resultData,
      iFrameNo: 1,
      silentPrinterName: $NC.G_USERINFO.PRINT_CARD
    }],
    onAfterPrint: function() {
      _Inquiry();
    }
  });
}

function doPrint3() {

  if (G_GRDT1DETAIL.view.getEditorLock().isActive()) {
    G_GRDT1DETAIL.view.getEditorLock().commitCurrentEdit();
  }

  var center_Cd = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(center_Cd)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var checkedValueDS = [ ];
  var rowCount = G_GRDT1DETAIL.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT1DETAIL.data.getItem(row);
    var lastRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (rowData.CHECK_YN === "Y") {
      checkedValueDS.push(lastRowData.HAS_NO + "" + String(rowData.OUTBOUND_NO));
    }
  }
  if (checkedValueDS.length == 0) {
    alert("출력할 데이터를 선택하십시오.");
    return;
  }
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var HAS_DATE = $NC.getValue("#dtpQHas_Date");

  $NC.G_MAIN.silentPrint({
    printParams: [{
      reportDoc: "lo/LABEL_LOM15",
      queryId: "WR.RS_LABEL_LOM16",
      queryParams: {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_HAS_DATE: HAS_DATE
      },
      checkedValue: checkedValueDS.toString(),
      iFrameNo: 1,
      silentPrinterName: $NC.G_USERINFO.PRINT_CARD
    }],
    onAfterPrint: function() {
      _Inquiry();
    }
  });
}

function doPrint4() {

  if (G_GRDT3MASTER.view.getEditorLock().isActive()) {
    G_GRDT3MASTER.view.getEditorLock().commitCurrentEdit();
  }

  var center_Cd = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(center_Cd)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var checkedValueDS = [ ];
  var rowCount = G_GRDT3MASTER.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT3MASTER.data.getItem(row);
    if (rowData.CHECK_YN === "Y") {
      checkedValueDS.push(rowData.HAS_NO + "" + rowData.END_YN1);
    }
  }
  if (checkedValueDS.length == 0) {
    alert("출력할 데이터를 선택하십시오.");
    return;
  }
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var HAS_DATE = $NC.getValue("#dtpQHas_Date");

  $NC.G_MAIN.silentPrint({
    printParams: [{
      reportDoc: "lo/LABEL_LOM12",
      queryId: "WR.RS_LABEL_LOM17",
      queryParams: {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_HAS_DATE: HAS_DATE
      },
      checkedValue: checkedValueDS.toString(),
      iFrameNo: 1,
      silentPrinterName: $NC.G_USERINFO.PRINT_CARD
    }],
    onAfterPrint: function() {
      _Inquiry();
    }
  });

}

function _OnGridCheckBoxFormatterClick(e, view, args) {

  if (args.grid == "grdT1Master") {
    if (G_GRDT1MASTER.view.getEditorLock().isActive()) {
      G_GRDT1MASTER.view.getEditorLock().commitCurrentEdit();
    }

    $NC.setGridSelectRow(G_GRDT1MASTER, args.row);

    var rowData = G_GRDT1MASTER.data.getItem(args.row);

    if (args.cell == G_GRDT1MASTER.view.getColumnIndex("CHECK_YN")) {
      rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
    }

    G_GRDT1MASTER.data.updateItem(rowData.id, rowData);
  }
  if (args.grid == "grdT3Master") {
    if (G_GRDT3MASTER.view.getEditorLock().isActive()) {
      G_GRDT3MASTER.view.getEditorLock().commitCurrentEdit();
    }

    $NC.setGridSelectRow(G_GRDT3MASTER, args.row);

    var rowData = G_GRDT3MASTER.data.getItem(args.row);

    if (args.cell == G_GRDT3MASTER.view.getColumnIndex("CHECK_YN")) {
      rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
    }

    G_GRDT3MASTER.data.updateItem(rowData.id, rowData);
  }

  if (args.grid == "grdT1Detail") {

    if (G_GRDT1DETAIL.view.getEditorLock().isActive()) {
      G_GRDT1DETAIL.view.getEditorLock().commitCurrentEdit();
    }

    $NC.setGridSelectRow(G_GRDT1DETAIL, args.row);

    var rowData = G_GRDT1DETAIL.data.getItem(args.row);

    if (args.cell == G_GRDT1DETAIL.view.getColumnIndex("CHECK_YN")) {
      rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
      if (rowData.LINE_NO !== "000000") {
        G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);
      } else if (rowData.LINE_NO == "000000") {
        rowData.CHECK_YN = "N";
        G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);
      }
    }
  }
}

function onGetNonSendCnt(ajaxData) {
  var resultRows = $NC.toArray(ajaxData);
  if (resultRows.length > 0) {
    $NC.setValue("#lblLo_Cnt_A", "총 셀 : " + resultRows[0].TOTAL_LOC_CNT + "수");
    $NC.setValue("#lblLo_Cnt_B", "사용중 셀  : " + resultRows[0].HAS_CNT + "수");
    $NC.setValue("#lblLo_Cnt_C", "빈 셀  : " + resultRows[0].REMAIN_CNT + "수");

  } else {
    $NC.setValue("#lblLo_Cnt_A", "총 셀  : ");
    $NC.setValue("#lblLo_Cnt_B", "사용중 셀  : ");
    $NC.setValue("#lblLo_Cnt_C", "빈 셀  : ");
  }
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}

function TS1() {
  var rowData = G_GRDT1DETAIL.data.getItems();
  var rowCount = G_GRDT1DETAIL.data.getLength();
  if (rowData.length === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("취소 처리시 재합포장 처리할수 없습니다. 그래도 하시겠습니까?");
  if (!result) {
    return;
  }

  var spCallDs1 = [ ];
  var chkCnt1 = 0;
  var rowData = G_GRDT1DETAIL.data.getItems();
  // for ( var row = 0; row < chkCnt1; row++) {
  for ( var i = 0; i < rowCount; i++) {
    // CHECK_YN === 'Y' 이면 checkSameDate() 함수에서 spCallDs1 배열에 같은 값이 있는지 체크한다.
    if (rowData[i].CHECK_YN === 'Y' && checkSameDate(rowData[i], i)) {
      chkCnt1++;
      // 중복값이 없으면 spCallDs1에 push한다.
      spCallDs1.push(rowData[i]);
    }
  }
  ;
  // private 지역함수를 만든다.
  function checkSameDate(row, i) {
    for (i in spCallDs1) {
      // BU_CD, BU_NO가 같으면 false를 반환한다.
      if (row.CENTER_CD == spCallDs1[i].CENTER_CD && row.BU_NO == spCallDs1[i].BU_NO
          && row.OUTBOUND_DATE == spCallDs1[i].OUTBOUND_DATE && row.OUTBOUND_NO == spCallDs1[i].OUTBOUND_NO) {
        return false;
      }
    }
    return true;
  }

   console.log(spCallDs1);

  spCallDS = [ ];
  var chkCnt = 0;

  var lastRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
  for ( var row = 0; row < chkCnt1; row++) {
    chkCnt++;
    var rowData1 = spCallDs1;

    var Ms = {
      P_CENTER_CD: rowData1[row].CENTER_CD,
      P_BU_CD: rowData1[row].BU_CD,
      P_HAS_DATE: lastRowData.HAS_DATE,
      P_HAS_NO: lastRowData.HAS_NO,
      P_LINE_NO: rowData1[row].LINE_NO

    };
    spCallDS.push(Ms);
  }
  if (chkCnt == 0) {
    alert("처리대상이 없습니다. 선택하십시오.");
    return;
  }
  $NC.serviceCall("/LOM9110E/callProc_Bw.do", {
    P_DS_MASTER: $NC.getParams(spCallDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, Ts1, onSaveError);
}