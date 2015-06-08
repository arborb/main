/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
  });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();
  grdSubInitialize();

  // 초기화 및 초기값 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $NC.setValue("#edtQVendor_Cd");
  $NC.setValue("#edtQVendor_Nm");
  $NC.setValue("#chkQState_Pre_Yn", "Y");
  $NC.setValue("#chkQState_Cur_Yn", "Y");

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showOwnBranPopup);
  $("#btnWbdelete").click(onWbdelete);
  $("#btnWbSave").click(callWbSaveProc); // 송장등록 버튼 클릭
  $("#btnWbPrint").click(callWbPrint); // 송장출력 버튼 클릭

  $NC.setInitDatePicker("#dtpQOutbound_Date");
  $NC.setInitDatePicker("#dtpQOrder_Date1");
  $NC.setInitDatePicker("#dtpQOrder_Date2");

  $NC.setValue("#dtpQOrder_Date1", $NC.addDay($NC.getValue("#dtpQOrder_Date1"), -3));

  // 조회조건 - 반출구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "D3",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });

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
      // 반출전표/수량 정보 세팅, 프로세스 정보, ※ 조회 조건이 모두 세팅이 되는 시점
    }
  });

  G_GRDMASTER.focused = true;
  G_GRDDETAIL.focused = false;
  G_GRDSUB.focused = false;
}

function _OnLoaded() {

  // 스플리터 초기화
  $NC.setInitSplitter("#divSplitArea1", "v", 700);
  $NC.setInitSplitter("#divSplitArea2", "h", 400);
}

function _SetResizeOffset() {

  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  var container = $("#divSplitArea1");
  $NC.resizeContainer(container, clientWidth, clientHeight);

  container = $("#grdMaster").parent();
  // Master Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", container.width(), container.height() - $NC.G_LAYOUT.header);

  // Splitter 컨테이너 크기 조정
  container = $("#divSplitArea2");
  var splitter = container.children(".splitter-bar");
  splitter.width(container.width());

  container = $("#grdDetail").parent();
  // Detail Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", container.width(), container.height() - $NC.G_LAYOUT.header);

  container = $("#grdSub").parent();
  // Sub Grid 사이즈 조정
  $NC.resizeGrid("#grdSub", container.width(), container.height() - $NC.G_LAYOUT.header);
}

/**
 * 조회조건 Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "CENTER_CD":
    onChangingCondition();
    setMasterProcessInfo();
    setPolicyValInfo();
    setProcessStateInfo();
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

  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.G_USERINFO.BRAND_CD;
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
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

  case "OUTBOUND_DATE":
    $NC.setValueDatePicker(view, val, "검색 반출일자를 정확히 입력하십시오.");
    break;
  case "ORDER_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "ORDER_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
  }

  onChangingCondition();
}

function onChangingCondition() {
  // 초기화
  $NC.clearGridData(G_GRDSUB);
  $NC.clearGridData(G_GRDDETAIL);
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
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("반출일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date");
    return;
  }
  var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
  if ($NC.isNull(ORDER_DATE1)) {
    alert("반출예정 검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }
  var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
  if ($NC.isNull(ORDER_DATE2)) {
    alert("반출예정 검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date2");
    return;
  }
  if (ORDER_DATE1 > ORDER_DATE2) {
    alert("반출예정일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  var INOUT_CD = $NC.getValue("#cboQInout_Cd");
  var STATE_PRE_YN = $NC.getValue("#chkQState_Pre_Yn");
  var STATE_CUR_YN = $NC.getValue("#chkQState_Cur_Yn");
  if (STATE_PRE_YN === "N" && STATE_CUR_YN === "N") {
    alert("검색구분을 선택하십시오.");
    $NC.setFocus("#chkQState_Pre_Yn");
    return;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  $NC.setInitGridVar(G_GRDDETAIL);
  $NC.setInitGridVar(G_GRDSUB);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: OUTBOUND_DATE,
    P_INOUT_CD: INOUT_CD,
    P_VENDOR_CD: "",
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: "%",
    P_ITEM_NM: "%",
    P_STATE_PRE_YN: STATE_PRE_YN,
    P_STATE_CUR_YN: STATE_CUR_YN,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });
  // 데이터 조회
  $NC.serviceCall("/RO04040E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

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
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "반출번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "반출구분",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "TOT_CONFIRM_QTY",
    field: "TOT_CONFIRM_QTY",
    name: "총수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_STATE_D",
    field: "OUTBOUND_STATE_D",
    name: "진행상태",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {


  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "RO04040E.RS_MASTER",
    sortCol: "OUTBOUND_NO",
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

  // 딜옵션 초기화
  $NC.setInitGridVar(G_GRDDETAIL);
  onGetDetail({
    data: null
  });

  var rowData = G_GRDMASTER.data.getItem(row);

  // 파라메터 세팅
  G_GRDDETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
    P_OUTBOUND_NO: rowData.OUTBOUND_NO
  });
  // 데이터 조회
  $NC.serviceCall("/RO04040E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

  // 파라메터 세팅
  G_GRDSUB.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
    P_OUTBOUND_NO: rowData.OUTBOUND_NO
  });
  // 데이터 조회
  $NC.serviceCall("/RO04040E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdMasterOnBeforePost(row) {

  if (!G_GRDMASTER.lastRowModified) {
    return true;
  }

  var rowData = G_GRDMASTER.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  return true;
}

function grdDetailOnGetColumns() {

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
    name: "등록중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUPPLY_PRICE",
    field: "SUPPLY_PRICE",
    name: "공급단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_PRICE",
    field: "DC_PRICE",
    name: "할인단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "APPLY_PRICE",
    field: "APPLY_PRICE",
    name: "적용단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUPPLY_AMT",
    field: "SUPPLY_AMT",
    name: "공급금액",
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
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "RO04040E.RS_DETAIL",
    sortCol: "OPTION_ID",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);

}

function grdDetailOnAfterScroll(e, args) {
  var row = args.rows[0];

  if (G_GRDDETAIL.lastRow != null) {
    if (row == G_GRDDETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

function grdDetailOnNewRecord(args) {

  G_GRDDETAIL.view.gotoCell(args.row, 0, true);
}

function grdDetailOnBeforePost(row) {

  if (!G_GRDDETAIL.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAIL.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  return true;
}

function grdSubOnGetColumns() {

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
    id: "ENTRY_CARRIER_CD_D",
    field: "ENTRY_CARRIER_CD_D",
    name: "운송사",
    minWidth: 100
  });
/*
  $NC.setGridColumn(columns, {
    id: "SHIP_TYPE_D",
    field: "SHIP_TYPE_D",
    name: "운송구분",
    minWidth: 100
  });
 */
  $NC.setGridColumn(columns, {
    id: "SHIP_PRICE_TYPE_D",
    field: "SHIP_PRICE_TYPE_D",
    name: "운송비구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_TYPE_D",
    field: "SHIP_TYPE_D",
    name: "BOX구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "WB_NO",
    field: "WB_NO",
    name: "송장번호",
    minWidth: 100
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubInitialize() {

  var options = {
      frozenColumn:0
    };


  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: "RO04040E.RS_SUB",
    gridOptions: options
  });

  G_GRDSUB.view.onClick.subscribe(grdT1SubOnClick);
  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdT1SubOnAfterScroll);
  G_GRDSUB.view.onHeaderClick.subscribe(grdT1SubOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDSUB, "CHECK_YN");
}


/**
 * 입고중량등록 탭 하단 그리드 행 클릭시
 * 
 * @param e
 * @param args
 */
function grdT1SubOnClick(e, args) {

  G_GRDSUB.focused = true;

}


/**
 * 입고중량등록탭 하단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
function grdT1SubOnAfterScroll(e, args) {

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



/**
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          grid, row, cell, val
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

  if (G_GRDSUB.view.getEditorLock().isActive()) {
    G_GRDSUB.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDSUB, args.row);

  var rowData = G_GRDSUB.data.getItem(args.row);

  if (args.cell == G_GRDSUB.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUB.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUB.lastRowModified = true;
}

function grdT1SubOnHeaderClick(e, args) {

  G_GRDSUB.view.getCanvasNode().focus();

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDSUB.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDSUB.data.getLength();
      var rowData;
      G_GRDSUB.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDSUB.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDSUB.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDSUB.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
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


function onGetMaster(ajaxData) {
  
  
  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "OUTBOUND_NO",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
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

  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
}

function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);

  if (G_GRDDETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);

  }

}


/**
 * 입고중량등록 탭 하단 그리드에 데이터 표시처리
 */
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
  G_GRDSUB.view.getCanvasNode().focus();
}


/**
 * 검색조건의 사업부 검색 팝업 클릭
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
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 사업부 검색 팝업 클릭
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
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
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

  // 브랜드 초기화
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");

  onChangingCondition();
}
function showOwnBranPopup() {

  $NP.showOwnBranPopup({
    P_CUST_CD: $NC.G_USERINFO.CUST_CD,
    P_BU_CD: $NC.G_USERINFO.BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  onChangingCondition();
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

  _Inquiry();
}

function onWbdelete() {
  var rowCount = G_GRDSUB.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  closingDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDSUB.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      var Ms = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_BOX_NO: rowData.BOX_NO
      };
      closingDS.push(Ms);
    }
  }
  if (chkCnt == 0) {
    alert("처리대상이 없습니다. 선택하십시오.");
    return;
  }

  $NC.serviceCall("/RO04040E/callDelete.do", {
    P_DS_MASTER: $NC.getParams(closingDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onExecSP, onSaveError);

}

function callWbSaveProc() {

  var rowCount = G_GRDMASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var WB_CNT = $NC.getValue("#edtWb_Cnt");

  if (WB_CNT <= 0 || $NC.isNull(WB_CNT)) {
    alert("1이상의 전표수를 입력하세요.");
    $NC.setFocus("#edtWb_Cnt");
    return;
  }

  var result = confirm("송장발행 정보를 기록하시겠습니까?");
  if (!result) {
    return;
  }
  var processDS = [ ];
  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var processData = {
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
    P_OUTBOUND_NO: rowData.OUTBOUND_NO,
    P_WB_CNT: WB_CNT,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  };
  processDS.push(processData);

  $NC.serviceCall("/RO04040E/callWbSaveProc.do", {
    P_DS_MASTER: $NC.getParams(processDS)
  }, onGetWbSaveSP);
}

function onGetWbSaveSP(ajaxData) {

  var resultData = $NC.toArray(ajaxData);

  var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }

  setTimeout(function() {
    _Inquiry();
    G_GRDMASTER.lastKeyVal = lastRowData.OUTBOUND_NO;
  }, 300);
}

function callWbPrint() {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var CENTER_CD = rowData.CENTER_CD;
  var BU_CD = rowData.BU_CD;
  var OUTBOUND_DATE = rowData.OUTBOUND_DATE;
  var OUTBOUND_NO = rowData.OUTBOUND_NO;

  var checkedValueDS = [ ];
  checkedValueDS.push(OUTBOUND_NO);

  var queryParams = {
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: OUTBOUND_DATE
    
  };

  // 출력 호출
  $NC.G_MAIN.showPrintPreview({
    reportDoc: "ro/LABEL_RO01",
    queryId: "WR.RS_PAPER_RO01",
    queryParams: queryParams,
    checkedValue: checkedValueDS.toString(),
    internalQueryYn: "Y"
  });
}
