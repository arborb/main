/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 탭 초기화
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();

  // 그리드 초기화
  grdMasterT1Initialize();
  grdT1DetailInitialize();
  grdMasterT2Initialize();
  grdSubInitialize();

  // 조회조건 - 사업부 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $NC.setInitDatePicker("#dtpQHas_Date");

  $("#Ts1").click(TS1);
  //$("#Ts2").click(TS2);
  $("#btnERPSend").click(sendEsErpStock);
 // $("#btnReConfrim").click(onReConfrim);

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

}

function _OnLoaded() {

  $NC.setInitSplitter("#divDetailViewT1", "v", 1300);
  $NC.setInitSplitter("#divDetailViewT3", "h", 400);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.leftViewWidth = 1300;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.tabHeaderHeight = $("#divMasterView").children(".ui-tabs-nav:first").outerHeight();

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {


  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_OFFSET.tabHeaderHeight ;
  
 // var clientWidth = parent.width() - $NC.G_LAYOUT.border1 * 2; /* 탭일 경우는 좌우 */
//  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_LAYOUT.border1;

 // $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  //clientWidth -= $NC.G_LAYOUT.border1;
 // clientHeight -= ($NC.G_OFFSET.tabHeaderHeight + $NC.G_LAYOUT.border1);

  switch ($("#divMasterView").tabs("option", "active")) {
  case 0:
    // Splitter 컨테이너 크기 조정
    //var container = $("#divDetailViewT1");
    //$NC.resizeContainer(container, clientWidth, clientHeight);
    // Grid 사이즈 조정
   // $NC.resizeGrid("#grdMasterT1", $("#grdMasterT1").parent().width(), clientHeight - $NC.G_LAYOUT.header);
    // Grid 사이즈 조정
   // $NC.resizeGrid("#grdT1Detail", $("#grdT1Detail").parent().width(), clientHeight - $NC.G_LAYOUT.header);
    //break;
    
    
    var container = $("#divDetailViewT1");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdMasterT1").parent();
    // Master Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterT1", container.width(), container.height() - $NC.G_LAYOUT.header);

    // Splitter 컨테이너 크기 조정
    container = $("#divDetailViewT3");
    var splitter = container.children(".splitter-bar");
    splitter.width(container.width());

    container = $("#grdT1Detail").parent();
    // Detail Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Detail", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#grdSub").parent();
    // Sub Grid 사이즈 조정
    $NC.resizeGrid("#grdSub", container.width(), container.height() - $NC.G_LAYOUT.header);
    break;
  case 1:
    $NC.resizeGrid("#grdMasterT2", clientWidth, clientHeight);
    break;
  }
}

function _OnInputChange(e, view, val) {
  var id = view.prop("id").substr(3).toUpperCase();
  grdMasterOnCellChange(e, {
    col: id,
    val: val
  });
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
  var END_YN_DIV = $NC.getValue("#cboQEnd_Yn");
  if ($NC.isNull(END_YN_DIV)) {
    alert("작업구분을 선택 입력하십시오.");
    $NC.setFocus("#cboQEnd_Yn");
    return;
  }

  var BU_NO = $NC.getValue("#edtQHas_No");
  var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm");
  var SHIPPER_NM = $NC.getValue("#edtShipper_Nm");
  var HASLOCATION_CD = $NC.getValue("#edtQHaslocation_Cd");

  // 상품별 출고내역 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERT1);
   // $NC.setInitGridVar(G_GRDT1DETAIL);
    // $NC.setInitGridVar(RS_SUB);

    $NC.setInitGridVar(G_GRDT1DETAIL);
    $NC.setInitGridData(G_GRDT1DETAIL);
    $NC.setGridDisplayRows("#grdT1Detail", 0, 0);

    
    $NC.setInitGridVar(G_GRDSUB);
    $NC.setInitGridData(G_GRDSUB);
    $NC.setGridDisplayRows("#grdSub", 0, 0);
    /* 
     $NC.serviceCall("/LOM9110E/getDataSet.do", {
       P_QUERY_ID: "LOM9110E.RS_SUB",
       P_QUERY_PARAMS: $NC.getParams({
         P_CENTER_CD: CENTER_CD,
         P_BU_CD: BU_CD,
         P_HAS_DATE: HAS_DATE,
         P_BU_NO: BU_NO,
         P_ORDERER_NM: ORDERER_NM,
         P_SHIPPER_NM: SHIPPER_NM,
         P_END_YN: END_YN_DIV,
         P_LOCATION_CD: HASLOCATION_CD
       })
     }, onGetNonSendCnt);
     
    */
    G_GRDMASTERT1.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_HAS_DATE: HAS_DATE,
      P_BU_NO: BU_NO,
      P_ORDERER_NM: ORDERER_NM,
      P_SHIPPER_NM: SHIPPER_NM,
      P_END_YN: END_YN_DIV,
      P_LOCATION_CD: HASLOCATION_CD
    });

    // 데이터 조회
    $NC.serviceCall("/LOM9110E/getDataSet.do", $NC.getGridParams(G_GRDMASTERT1), onGetMasterT1);

  } else {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERT2);

    G_GRDMASTERT2.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_HAS_DATE: HAS_DATE,
      P_BU_NO: BU_NO,
      P_ORDERER_NM: ORDERER_NM,
      P_SHIPPER_NM: SHIPPER_NM,
      P_END_YN: END_YN_DIV,
      P_LOCATION_CD: HASLOCATION_CD
    });

    // 데이터 조회
    $NC.serviceCall("/LOM9110E/getDataSet.do", $NC.getGridParams(G_GRDMASTERT2), onGetMasterT2);

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

function grdMasterT1OnGetColumns() {

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
  /*
  $NC.setGridColumn(columns, {
    id: "HAS_NO",
    field: "HAS_NO",
    name: "합포장슌번",
    minWidth: 70,
    cssClass: "align-center"
  });
  */
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
    id: "SHIPPER_TEL",
    field: "SHIPPER_TEL",
    name: "전화번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_HP",
    field: "SHIPPER_HP",
    name: "휴대폰번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ZIP_CD",
    field: "SHIPPER_ZIP_CD",
    name: "수령자우편호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_BASIC",
    field: "SHIPPER_ADDR_BASIC",
    name: "수령자주소",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_DETAIL",
    field: "SHIPPER_ADDR_DETAIL",
    name: "수령자상세주소",
    minWidth: 160
  });

  return $NC.setGridColumnDefaultFormatter(columns);

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
    name: "합포장처리순번",
    minWidth: 60,
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

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 입고중량등록탭의 하단그리드 초기화
 */

/**
 * 입고중량등록탭의 하단그리드 초기화
 */
function grdT1DetailInitialize() {

  var options = {
    frozenColumn: 3,
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.END_YN == "C") {
          return "specialrow4";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Detail", {
    columns: grdT1DetailOnGetColumns(),
    queryId: "LOM9110E.RS_DETAIL1",
    sortCol: "LINE_NO",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDT1DETAIL.view.onClick.subscribe(grdT1DetailOnClick);
  G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);

  G_GRDT1DETAIL.view.onHeaderClick.subscribe(grdT1DetailOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT1DETAIL, "CHECK_YN");
}

/**
 * 입고중량등록 탭 하단 그리드 행 클릭시
 * 
 * @param e
 * @param args
 */
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
  // 조회시 값 초기화
  // $NC.setInitGridVar(G_GRDT1DETAIL);
  // $NC.setInitGridData(G_GRDT1DETAIL);
  // $NC.setGridDisplayRows("#grdT1Detail", 0, 0);
  var rowData1 = G_GRDMASTERT1.data.getItem(row);  
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  G_GRDSUB.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
    P_OUTBOUND_NO: rowData.OUTBOUND_NO
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
          rowData.CHECK_YN = checkVal;
          G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT1DETAIL.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

/**
 * 입고중량등록탭 하단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
/*
function grdT1DetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  var rowData = G_GRDT1DETAIL.data.getItem(row);

  if (G_GRDT1DETAIL.lastRow != null) {
    if (row == G_GRDT1DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Detail", row + 1);
}
*/
function grdMasterT1Initialize() {

  var options = {
    frozenColumn: 3,
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterT1", {
    columns: grdMasterT1OnGetColumns(),
    queryId: "LOM9110E.RS_T1_MASTER",
    sortCol: "HAS_DATE",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDMASTERT1.view.onClick.subscribe(grdMasterOnClick);
  G_GRDMASTERT1.view.onSelectedRowsChanged.subscribe(grdMasterT1OnAfterScroll);
  G_GRDMASTERT1.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERT1, "CHECK_YN");

}

function grdMasterOnClick(e, args) {

  G_GRDMASTERT1.view.getCanvasNode().focus();

  if (args.cell === G_GRDMASTERT1.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDMASTERT1.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {
        rowData.CHECK_YN = checkVal;
        G_GRDMASTERT1.data.updateItem(rowData.id, rowData);
      }
    }
  }
}

function grdMasterOnHeaderClick(e, args) {

  G_GRDMASTERT1.view.getCanvasNode().focus();

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTERT1.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDMASTERT1.data.getLength();
      var rowData;
      G_GRDMASTERT1.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDMASTERT1.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDMASTERT1.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTERT1.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

function _OnGridCheckBoxFormatterClick(e, view, args) {

  if (args.grid == "grdMasterT1") {
    if (G_GRDMASTERT1.view.getEditorLock().isActive()) {
      G_GRDMASTERT1.view.getEditorLock().commitCurrentEdit();
    }

    $NC.setGridSelectRow(G_GRDMASTERT1, args.row);

    var rowData = G_GRDMASTERT1.data.getItem(args.row);

    if (args.cell == G_GRDMASTERT1.view.getColumnIndex("CHECK_YN")) {
      rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
    }

    G_GRDMASTERT1.data.updateItem(rowData.id, rowData);
  }

  if (args.grid == "grdT1Detail") {

    if (G_GRDT1DETAIL.view.getEditorLock().isActive()) {
      G_GRDT1DETAIL.view.getEditorLock().commitCurrentEdit();
    }

    $NC.setGridSelectRow(G_GRDT1DETAIL, args.row);

    var rowData = G_GRDT1DETAIL.data.getItem(args.row);

    if (args.cell == G_GRDT1DETAIL.view.getColumnIndex("CHECK_YN")) {
      rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";

      G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);

    }
  }
}
/**
 * 상품별출고내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterT1OnAfterScroll(e, args) {

  var row = args.rows[0];

  var rowData = G_GRDMASTERT1.data.getItem(row);
  if (G_GRDMASTERT1.lastRow != null) {
    if (row == G_GRDMASTERT1.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setInitGridVar(G_GRDT1DETAIL);
  $NC.setInitGridVar(G_GRDSUB);
  
  // 조회시 값 초기화
  // $NC.setInitGridVar(G_GRDT1DETAIL);
  // $NC.setInitGridData(G_GRDT1DETAIL);
  // $NC.setGridDisplayRows("#grdT1Detail", 0, 0);

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
  $NC.setGridDisplayRows("#grdMasterT1", row + 1);
}

/**
 * 온라인몰 출고내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterT2OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERT2.lastRow != null) {
    if (row == G_GRDMASTERT2.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterT2", row + 1);
}

function grdMasterT2OnGetColumns() {

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
    name: "합포장순번",
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
    id: "SHIPPER_TEL",
    field: "SHIPPER_TEL",
    name: "전화번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_HP",
    field: "SHIPPER_HP",
    name: "휴대폰번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ZIP_CD",
    field: "SHIPPER_ZIP_CD",
    name: "수령자우편호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_BASIC",
    field: "SHIPPER_ADDR_BASIC",
    name: "수령자주소",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_DETAIL",
    field: "SHIPPER_ADDR_DETAIL",
    name: "수령자상세주소",
    minWidth: 160
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 온라인몰 출고내역탭의 그리드 초기값 설정
 */
function grdMasterT2Initialize() {

  var options = {
    frozenColumn: 1,
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterT2", {
    columns: grdMasterT2OnGetColumns(),
    queryId: "LOM9110E.RS_T2_MASTER",
    sortCol: "HAS_DATE",
    gridOptions: options
  });

  G_GRDMASTERT2.view.onSelectedRowsChanged.subscribe(grdMasterT2OnAfterScroll);
}

/**
 * 상품별출고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT1(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERT1, ajaxData);

  if (G_GRDMASTERT1.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTERT1, 0);
  } else {
    $NC.setGridDisplayRows("#grdMasterT1", 0, 0);
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
 * 온라인 출고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT2(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERT2, ajaxData);

  if (G_GRDMASTERT2.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTERT2, 0);
  } else {
    $NC.setGridDisplayRows("#grdMasterT2", 0, 0);
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
 * 검색조건의 온라인몰 검색 이미지 클릭
 */
function showDeliveryPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NP.showDeliveryPopup({
    title: "온라인몰 검색",
    columnTitle: ["온라인몰코드", "온라인몰명"],
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_DELIVERY_CD: "%",
      P_DELIVERY_DIV: "92", // 92 - 온라인몰
      P_VIEW_DIV: "2"
    }
  }, onDeliveryPopup, function() {
    $NC.setFocus("#edtQDelivery_Cd", true);
  });
}

function onDeliveryPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQDelivery_Cd", resultInfo.DELIVERY_CD);
    $NC.setValue("#edtQDelivery_Nm", resultInfo.DELIVERY_NM);
  } else {
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");
    $NC.setFocus("#edtQDelivery_Cd", true);
  }
  onChangingCondition();
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
  $NC.G_VAR.buttons._excel = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);

  // 초기화
  $NC.clearGridData(G_GRDMASTERT1);
  $NC.clearGridData(G_GRDMASTERT2);
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

/*
function onReConfrim() {

  var rowCount = G_GRDMASTERT1.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  spCallDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERT1.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;

      var Ms = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_HAS_DATE: rowData.HAS_DATE,
        P_HAS_NO: rowData.HAS_NO,
        P_PROC_GUBN: "2"

      };
      spCallDS.push(Ms);
    }
  }
  if (chkCnt == 0) {
    alert("처리대상이 없습니다. 선택하십시오.");
    return;
  }
  if (rowData.END_YN = 'N') {
    $NC.serviceCall("/LOM9110E/callPorpertiesUpdate.do", {
      P_DS_MASTER: $NC.getParams(spCallDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onExecSP, onSaveError);
  } else if (rowData.END_YN = 'D') {
    $NC.serviceCall("/LOM9110E/callPorpertiesUpdate1.do", {
      P_DS_MASTER: $NC.getParams(spCallDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onExecSP, onSaveError);

  }

}

*/

function sendEsErpStock() {
  var rowCount = G_GRDMASTERT1.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  closingDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERT1.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;

      var Ms = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_HAS_DATE: rowData.HAS_DATE,
        P_HAS_NO: rowData.HAS_NO,
        P_PROC_GUBN: "1"
      };
      closingDS.push(Ms);
    }
  }
  if (chkCnt == 0) {
    alert("처리대상이 없습니다. 선택하십시오.");
    return;
  }


  if (rowData.END_YN = 'N') {
     $NC.serviceCall("/LOM9110E/callPorpertiesUpdate.do", {
       P_DS_MASTER: $NC.getParams(spCallDS),
       P_USER_ID: $NC.G_USERINFO.USER_ID
     }, onExecSP, onSaveError);
   } else if (rowData.END_YN = 'D') {
     $NC.serviceCall("/LOM9110E/callPorpertiesUpdate1.do", {
       P_DS_MASTER: $NC.getParams(spCallDS),
       P_USER_ID: $NC.G_USERINFO.USER_ID
     }, onExecSP, onSaveError);

   }
  /*
  $NC.serviceCall("/LOM9110E/callPorpertiesUpdate.do", {
    P_DS_MASTER: $NC.getParams(closingDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onExecSP, onSaveError);
  
  */
}

function onExecSP(ajaxData) {

  var resultData = $NC.toArray(ajaxData);

  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
    }

  }

  doPrint1();
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}

function doPrint1() {

  if (G_GRDMASTERT1.view.getEditorLock().isActive()) {
    G_GRDMASTERT1.view.getEditorLock().commitCurrentEdit();
  }

  var center_Cd = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(center_Cd)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var checkedValueDS = [ ];
  var rowCount = G_GRDMASTERT1.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERT1.data.getItem(row);
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

/**
 * 미송신내역 건수
 */
function onGetNonSendCnt(ajaxData) {
  var resultRows = $NC.toArray(ajaxData);
  if (resultRows.length > 0) {
    $NC.setValue("#lblLo_Cnt1", "총건수 : " + resultRows[0].LO_CNT1 + "건");
    $NC.setValue("#lblLo_Cnt2", "적치건수 : " + resultRows[0].LO_CNT2 + "건");
    $NC.setValue("#lblLo_Cnt3", "완료건수 : " + resultRows[0].LO_CNT3 + "건");

  } else {
    $NC.setValue("#lblLo_Cnt1", "총건수 : ");
    $NC.setValue("#lblLo_Cnt2", "적치건수 : ");
    $NC.setValue("#lblLo_Cnt3", "완료건수 : ");
  }
}

function TS1() {
  var rowCount = G_GRDT1DETAIL.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }
  
  var result = confirm("취소 처리를 정말 하시겠습니까?");
  if (!result) {
    return;
  }

  closingDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT1DETAIL.data.getItem(row);
    var HAS_DATE = $NC.getValue("#dtpQHas_Date");
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;

      var Ms = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_HAS_DATE: HAS_DATE,
        P_HAS_NO: rowData.HAS_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_PROC_GUBN: "2",
        P_USER_ID: $NC.G_USERINFO.USER_ID,

      };
      closingDS.push(Ms);
    }
  }
  if (chkCnt == 0) {
    alert("처리대상이 없습니다. 선택하십시오.");
    return;
  }

  $NC.serviceCall("/LOM9080E/callLineproc.do", {
    P_DS_MASTER: $NC.getParams(closingDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, Ts11, onSaveError);
}

/*
function TS2() {

  var rowCount = G_GRDT1DETAIL.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  spCallDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT1DETAIL.data.getItem(row);

    var HAS_DATE = $NC.getValue("#dtpQHas_Date");
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;

      var Ms = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_HAS_DATE: HAS_DATE,
        P_HAS_NO: rowData.HAS_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_PROC_GUBN: "1",
        P_USER_ID: $NC.G_USERINFO.USER_ID

      };
      spCallDS.push(Ms);
    }
  }
  if (chkCnt == 0) {
    alert("처리대상이 없습니다. 선택하십시오.");
    return;
  }

  $NC.serviceCall("/LOM9080E/callLineproc.do", {
    P_DS_MASTER: $NC.getParams(spCallDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, Ts2, onSaveError);

}
*/

function Ts11(ajaxData) {

  var resultData = $NC.toArray(ajaxData);

  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA === "OK") {
      alert("합포장작업 취소처리되었습니다.");

      _Inquiry();
    } else {
      alert(resultData.RESULT_DATA);
      return;
    }

    doPrint2();
  }
}

/*
function Ts2(ajaxData) {

  var resultData = $NC.toArray(ajaxData);

  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA === "OK") {

      alert("합포장재작업 처리되었습니다.");
      _Inquiry();
    } else {
      alert(resultData.RESULT_DATA);
      return;
    }
  }
}
*/

/**
 * 입고중량등록 탭 하단 그리드에 데이터 표시처리
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

function doPrint2() {

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
    if (rowData.CHECK_YN === "Y") {
      checkedValueDS.push(rowData.HAS_NO +""+ String(rowData.LINE_NO));
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
      queryId: "WR.RS_LABEL_LOM15",
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
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
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
    if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub", row + 1);
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