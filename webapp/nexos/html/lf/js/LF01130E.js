/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {
  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    printOptions: [{
      PRINT_INDEX: 0,
      PRINT_COMMENT: "거래명세서 출력"
    }]
  });

  // 그리드 초기화
  grdT1MasterInitialize();
  grdT1DetailInitialize();

  // 정산처리 버튼 설정
  $("#lbl_Pop_Cd").click(showLblListPopup);
  // 정산처리 버튼 사용불가(조회 후 사용)
  // $NC.setEnable("#lbl_Pop_Cd", false);

  // 위탁사 버튼 설정
  $("#btnQBrand_Cd").click(showBuBrandPopup);
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQFee_Head_Cd").click(showFee_Head_CdPopup);
  $("#btnQFee_Base_Cd").click(showFee_Base_CdPopup);

  // 위탁사 버튼 설정
  $("#btnQOwn_Brand_Cd").click(showOwnBranPopup);

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
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {
  // 화면에 splitter 설정
  $NC.setInitSplitter("#divMasterView", "h", 300);
}

/**
 * 화면 리사이즈 Offset 계산
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

  // Splitter 컨테이너 크기 조정
  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  // Master Grid 사이즈 조정
  $NC.resizeGrid("#grdT1Master", clientWidth, $("#grdT1Master").parent().height() - $NC.G_LAYOUT.header);

  // Detail Grid 사이즈 조정
  $NC.resizeGrid("#grdT1Detail", clientWidth, $("#grdT1Detail").parent().height() - $NC.G_LAYOUT.header);

  // 정산월에 달력이미지 설정
  $NC.setInitMonthPicker("#dtpQAdjust_Month", $NC.G_USERINFO.LOGIN_DATE);
}

function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();

  // 저장
  $NC.setEnable("#lbl_Pop_Cd", permission.canSave && G_GRDT1MASTER.data.getLength() > 0);
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
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
  case "CARRIER_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CARRIER_CD: val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getCarrierInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onCarrierPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showCarrierPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onCarrierPopup, onCarrierPopup);
    }
    return;
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getUserBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onUserBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showUserBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onUserBrandPopup, onUserBrandPopup);
    }
    return;

  case "ADJUST_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "ADJUST_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
  }

  onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var ADJUST_MONTH = $NC.getValue("#dtpQAdjust_Month");
  if ($NC.isNull(ADJUST_MONTH)) {
    alert("정산월을 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Month");
    return;
  }
  ;

  var ADJUST_MONTH1 = ADJUST_MONTH.replace(/\-/g, '');

  var OWN_BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd", true);

  var FEE_BASE_CD = $NC.getValue("#cboQFee_Base_Cd", true);

  var FEE_HEAD_CD = $NC.getValue("#cboQFee_Head_Cd", true);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1MASTER);
  $NC.setInitGridVar(G_GRDT1DETAIL);

  // 파라메터 세팅
  G_GRDT1MASTER.queryParams = $NC.getParams({
    P_BU_CD: BU_CD,
    P_BRAND_CD: OWN_BRAND_CD,
    P_ADJUST_MONTH: ADJUST_MONTH1,
    P_FEE_BASE_CD: FEE_BASE_CD,
    P_FEE_HEAD_CD: FEE_HEAD_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LF01130E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetMasterT1);

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
  var ADJUST_MONTH = $NC.getValue("#dtpQAdjust_Month");
  if ($NC.isNull(ADJUST_MONTH)) {
    alert("정산월을 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Month");
    return;
  }
}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

  var BU_CD = $NC.getValue("#edtQBu_Cd", true);

  var INOUT_DATE1 = $NC.getValue("#dtpQInout_Date1");
  if ($NC.isNull(INOUT_DATE1)) {
    alert("시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQInout_Date1");
    return;
  }
  var INOUT_DATE2 = $NC.getValue("#dtpQInout_Date2");
  if ($NC.isNull(INOUT_DATE2)) {
    alert("종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQInout_Date2");
    return;
  }

  var printOptions = {};
  if (printIndex == 0) {
    printOptions = {
      reportDoc: "lf/RECEIPT_LF05",
      queryId: "WR.RS_RECEIPT_LF05",
      queryParams: {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_ADJUST_MONTH1: INOUT_DATE1,
        P_ADJUST_MONTH2: INOUT_DATE2
      }
    };

    $NC.G_MAIN.showPrintPreview(printOptions);
  }

}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ADJUST_NO",
    field: "ADJUST_NO",
    name: "정산반호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "PAY_CHA_NM",
    field: "PAY_CHA_NM",
    name: "구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "CLOSE_LEVEL_NM",
    field: "CLOSE_LEVEL_NM",
    name: "대상구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "위탁사명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_DATE",
    field: "ADJUST_DATE",
    name: "일자",
    minWidth: 90,
    cssClass: "align-center",
    groupToggler: true,
    band: 0
  });

  $NC.setGridColumn(columns, {
    id: "ADJUST_MONTH",
    field: "ADJUST_MONTH",
    name: "정산월",
    cssClass: "align-center",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_PERIOD",
    field: "ADJUST_PERIOD",
    name: "정산기간",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_FEE_AMT",
    field: "ADJUST_FEE_AMT",
    name: "정산금액",
    cssClass: "align-right",
    minWidth: 90,
    aggregator: "SUM"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상단그리드 초기화
 */
function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LF01130E.RS_MASTER",
    sortCol: "FEE_HEAD_CD",
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

  var FEE_BASE_CD = $NC.getValue("#cboQFee_Base_Cd", true);

  var FEE_HEAD_CD = $NC.getValue("#cboQFee_Head_Cd", true);
  var rowData = G_GRDT1MASTER.data.getItem(row);

  var ADJUST_MONTH1 = rowData.ADJUST_MONTH.replace(/\-/g, '');

  // 파라메터 세팅
  G_GRDT1DETAIL.queryParams = $NC.getParams({
    P_BU_CD: rowData.BU_CD,
    P_BRAND_CD: rowData.BRAND_CD,
    P_ADJUST_MONTH: ADJUST_MONTH1,
    P_ADJUST_DATE: rowData.ADJUST_DATE,
    P_ADJUST_NO: rowData.ADJUST_NO,
    P_FEE_BASE_CD: FEE_BASE_CD,
    P_FEE_HEAD_CD: FEE_HEAD_CD,
    P_PAY_CHA_DIV: rowData.PAY_CHA_DIV
  });

  // 데이터 조회
  $NC.serviceCall("/LF01130E/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetMasterT2);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Master", row + 1);
}

function grdT1DetailOnGetColumns() {

  var columns = [ ];

  $NC.setGridColumn(columns, {
    id: "FEE_HEAD_CD",
    field: "FEE_HEAD_CD",
    name: "정산코드",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "FEE_HEAD_NM",
    field: "FEE_HEAD_NM",
    name: "정산항목명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "FEE_BASE_CD",
    field: "FEE_BASE_CD",
    name: "세부코드",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "FEE_BASE_NM",
    field: "FEE_BASE_NM",
    name: "세부항목명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "UNIT_DIV_NM",
    field: "UNIT_DIV_NM",
    name: "단가기준",
    minWidth: 180
  });

  $NC.setGridColumn(columns, {
    id: "UNIT_PRICE",
    field: "UNIT_PRICE",
    name: "단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "FEE_QTY",
    field: "FEE_QTY",
    name: "수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "FEE_AMT",
    field: "FEE_AMT",
    name: "금액",
    minWidth: 80,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 일자별 수불내역탭의 그리드 초기값 설정
 */
function grdT1DetailInitialize() {

  var options = {
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Detail", {
    columns: grdT1DetailOnGetColumns(),
    queryId: "LF01130E.RS_DETAIL",
    sortCol: "ADJUST_DATE",
    gridOptions: options
  });

  G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);

  G_GRDT1DETAIL.view.onDblClick.subscribe(grdT1DetailOnDblClick);
  G_GRDT1DETAIL.view.onBeforeEditCell.subscribe(grdT1DetailOnBeforeEditCell);
  G_GRDT1DETAIL.view.onCellChange.subscribe(grdT1DetailOnCellChange);
}


/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdT1DetailOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDT1DETAIL.view.getColumnField(args.cell)) {
  case "UNIT_PRICE":
    rowData.UNIT_PRICE = rowData.UNIT_PRICE;
    rowData.FEE_QTY = "";
    break;
  case "FEE_QTY":
    rowData = grdDetailOnCalc(rowData);
    break;
  case "FEE_HEAD_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    var lastMasterData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (!$NC.isNull(rowData.FEE_HEAD_CD)) {
      P_QUERY_PARAMS = {
        P_BU_CD: lastMasterData.BU_CD,
        P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
        P_CENTER_FUNC_DIV: "1"
      };
      O_RESULT_DATA = $NP.getFee_Head_CdInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onHeadPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showFee_Head_CdPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onHeadPopup, onHeadPopup);
    }
    return;
  case "FEE_BASE_CD":
    if ($NC.isNull(rowData.FEE_HEAD_CD)) {
      alert("정산그룹을 먼저 선택하시기 바랍니다.");
      rowData.FEE_HEAD_CD = "";
      $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("FEE_HEAD_CD"), true,
          true);
      return;
    }
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    var lastMasterData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    if (!$NC.isNull(rowData.FEE_BASE_CD)) {
      P_QUERY_PARAMS = {
        P_BU_CD: lastMasterData.BU_CD,
        P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
        P_FEE_BASE_CD: rowData.FEE_BASE_CD
      };
      O_RESULT_DATA = $NP.getFee_Base_CdInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBasePopup(O_RESULT_DATA[0]);
    } else {
      $NP.showFee_Base_CdPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBasePopup, onBasePopup);
    }
    return;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDT1DETAIL.lastRowModified = true;
}

function grdT1DetailOnBeforeEditCell(e, args) {

  var rowData = args.item;
  // 신규 데이터일 때만 수정 가능한 컬럼
  if (args.column.field === "ITEM_CD") {
    if (rowData) {
      // 신규 데이터가 아니면 코드 수정 불가
      if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
        return false;
      }
    }
  }
  return true;
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

/**
 * 상단그리드 더블 클릭
 */
function grdT1DetailOnDblClick(e, args) {

  if (G_GRDT1DETAIL.data.getLength() == 0) {
    return;
  }

  var masterRowData = G_GRDT1DETAIL.data.getItem(args.row);
  if (masterRowData) {
    if (masterRowData.FEE_HEAD_CD === '100' && masterRowData.FEE_BASE_CD === '010') {
      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LF01032P",
        PROGRAM_NM: "상세내역(출고수수료)",
        url: "lf/LF01032P.html",
        width: 1024,
        height: 600,
        userData: {
          P_PROCESS_CD: "U",
          P_BU_CD: masterRowData.BU_CD,
          P_ADJUST_DATE: masterRowData.ADJUST_DATE,
          P_ADJUST_START_DATE: masterRowData.ADJUST_START_DATE,
          P_ADJUST_END_DATE: masterRowData.ADJUST_END_DATE,
          P_ADJUST_MONTH: masterRowData.ADJUST_MONTH,
          P_ADJUST_NO: masterRowData.ADJUST_NO,
          P_FEE_HEAD_CD: masterRowData.FEE_HEAD_CD,
          P_FEE_BASE_CD: masterRowData.FEE_BASE_CD,
          P_FEE_HEAD_NM: masterRowData.FEE_HEAD_NM,
          P_FEE_BASE_NM: masterRowData.FEE_BASE_NM,
          P_BRAND_CD: masterRowData.BRAND_CD,
          P_BRAND_NM: masterRowData.BRAND_NM,
          P_MASTER_DS: masterRowData
        },
        onOk: function() {
          var lastRowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
          G_GRDT1DETAIL.lastKeyVal = new Array(lastRowData.FEE_HEAD_CD, lastRowData.FEE_BASE_CD,
              lastRowData.UNIT_DIV_NM);
        }
      });
    } else if (masterRowData.FEE_HEAD_CD === '200' && masterRowData.FEE_BASE_CD === '010') {
      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LF01033P",
        PROGRAM_NM: "상세내역(추가수수료-추가송장)",
        url: "lf/LF01033P.html",
        width: 1024,
        height: 600,
        userData: {
          P_PROCESS_CD: "U",
          P_BU_CD: masterRowData.BU_CD,
          P_ADJUST_DATE: masterRowData.ADJUST_DATE,
          P_ADJUST_START_DATE: masterRowData.ADJUST_START_DATE,
          P_ADJUST_END_DATE: masterRowData.ADJUST_END_DATE,
          P_ADJUST_MONTH: masterRowData.ADJUST_MONTH,
          P_ADJUST_NO: masterRowData.ADJUST_NO,
          P_FEE_HEAD_CD: masterRowData.FEE_HEAD_CD,
          P_FEE_BASE_CD: masterRowData.FEE_BASE_CD,
          P_FEE_HEAD_NM: masterRowData.FEE_HEAD_NM,
          P_FEE_BASE_NM: masterRowData.FEE_BASE_NM,
          P_BRAND_CD: masterRowData.BRAND_CD,
          P_BRAND_NM: masterRowData.BRAND_NM,
          P_MASTER_DS: masterRowData
        },
        onOk: function() {
          var lastRowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
          G_GRDT1DETAIL.lastKeyVal = new Array(lastRowData.FEE_HEAD_CD, lastRowData.FEE_BASE_CD,
              lastRowData.UNIT_DIV_NM);
        }
      });
    } else if (masterRowData.FEE_HEAD_CD === '200' && masterRowData.FEE_BASE_CD === '020') {
      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LF01034P",
        PROGRAM_NM: "상세내역(추가수수료-CS출고)",
        url: "lf/LF01034P.html",
        width: 1024,
        height: 600,
        userData: {
          P_PROCESS_CD: "U",
          P_BU_CD: masterRowData.BU_CD,
          P_ADJUST_DATE: masterRowData.ADJUST_DATE,
          P_ADJUST_START_DATE: masterRowData.ADJUST_START_DATE,
          P_ADJUST_END_DATE: masterRowData.ADJUST_END_DATE,
          P_ADJUST_MONTH: masterRowData.ADJUST_MONTH,
          P_ADJUST_NO: masterRowData.ADJUST_NO,
          P_FEE_HEAD_CD: masterRowData.FEE_HEAD_CD,
          P_FEE_BASE_CD: masterRowData.FEE_BASE_CD,
          P_FEE_HEAD_NM: masterRowData.FEE_HEAD_NM,
          P_FEE_BASE_NM: masterRowData.FEE_BASE_NM,
          P_BRAND_CD: masterRowData.BRAND_CD,
          P_BRAND_NM: masterRowData.BRAND_NM,
          P_MASTER_DS: masterRowData
        },
        onOk: function() {
          var lastRowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
          G_GRDT1DETAIL.lastKeyVal = new Array(lastRowData.FEE_HEAD_CD, lastRowData.FEE_BASE_CD,
              lastRowData.UNIT_DIV_NM);
        }
      });
    } else if (masterRowData.FEE_HEAD_CD === '200' && masterRowData.FEE_BASE_CD === '040') {
      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LF01035P",
        PROGRAM_NM: "상세내역(추가수수료-박스비용)",
        url: "lf/LF01035P.html",
        width: 1024,
        height: 600,
        userData: {
          P_PROCESS_CD: "U",
          P_BU_CD: masterRowData.BU_CD,
          P_ADJUST_DATE: masterRowData.ADJUST_DATE,
          P_ADJUST_START_DATE: masterRowData.ADJUST_START_DATE,
          P_ADJUST_END_DATE: masterRowData.ADJUST_END_DATE,
          P_ADJUST_MONTH: masterRowData.ADJUST_MONTH,
          P_ADJUST_NO: masterRowData.ADJUST_NO,
          P_FEE_HEAD_CD: masterRowData.FEE_HEAD_CD,
          P_FEE_BASE_CD: masterRowData.FEE_BASE_CD,
          P_FEE_HEAD_NM: masterRowData.FEE_HEAD_NM,
          P_FEE_BASE_NM: masterRowData.FEE_BASE_NM,
          P_BRAND_CD: masterRowData.BRAND_CD,
          P_BRAND_NM: masterRowData.BRAND_NM,
          P_MASTER_DS: masterRowData
        },
        onOk: function() {
          var lastRowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
          G_GRDT1DETAIL.lastKeyVal = new Array(lastRowData.FEE_HEAD_CD, lastRowData.FEE_BASE_CD,
              lastRowData.UNIT_DIV_NM);
        }
      });
    } else if (masterRowData.FEE_HEAD_CD === '200' && masterRowData.FEE_BASE_CD === '030') {
      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LF01036P",
        PROGRAM_NM: "상세내역(추가수수료-반품입고)",
        url: "lf/LF01036P.html",
        width: 1024,
        height: 600,
        userData: {
          P_PROCESS_CD: "U",
          P_BU_CD: masterRowData.BU_CD,
          P_ADJUST_DATE: masterRowData.ADJUST_DATE,
          P_ADJUST_START_DATE: masterRowData.ADJUST_START_DATE,
          P_ADJUST_END_DATE: masterRowData.ADJUST_END_DATE,
          P_ADJUST_MONTH: masterRowData.ADJUST_MONTH,
          P_ADJUST_NO: masterRowData.ADJUST_NO,
          P_FEE_HEAD_CD: masterRowData.FEE_HEAD_CD,
          P_FEE_BASE_CD: masterRowData.FEE_BASE_CD,
          P_FEE_HEAD_NM: masterRowData.FEE_HEAD_NM,
          P_FEE_BASE_NM: masterRowData.FEE_BASE_NM,
          P_BRAND_CD: masterRowData.BRAND_CD,
          P_BRAND_NM: masterRowData.BRAND_NM,
          P_MASTER_DS: masterRowData
        },
        onOk: function() {
          var lastRowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
          G_GRDT1DETAIL.lastKeyVal = new Array(lastRowData.FEE_HEAD_CD, lastRowData.FEE_BASE_CD,
              lastRowData.UNIT_DIV_NM);
        }
      });
    } else if (masterRowData.FEE_HEAD_CD === '200' && masterRowData.FEE_BASE_CD === '080') {
      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LF01037P",
        PROGRAM_NM: "상세내역(추가수수료-반품출고)",
        url: "lf/LF01037P.html",
        width: 1024,
        height: 600,
        userData: {
          P_PROCESS_CD: "U",
          P_BU_CD: masterRowData.BU_CD,
          P_ADJUST_DATE: masterRowData.ADJUST_DATE,
          P_ADJUST_START_DATE: masterRowData.ADJUST_START_DATE,
          P_ADJUST_END_DATE: masterRowData.ADJUST_END_DATE,
          P_ADJUST_MONTH: masterRowData.ADJUST_MONTH,
          P_ADJUST_NO: masterRowData.ADJUST_NO,
          P_FEE_HEAD_CD: masterRowData.FEE_HEAD_CD,
          P_FEE_BASE_CD: masterRowData.FEE_BASE_CD,
          P_FEE_HEAD_NM: masterRowData.FEE_HEAD_NM,
          P_FEE_BASE_NM: masterRowData.FEE_BASE_NM,
          P_BRAND_CD: masterRowData.BRAND_CD,
          P_BRAND_NM: masterRowData.BRAND_NM,
          P_MASTER_DS: masterRowData
        },
        onOk: function() {
          var lastRowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
          G_GRDT1DETAIL.lastKeyVal = new Array(lastRowData.FEE_HEAD_CD, lastRowData.FEE_BASE_CD,
              lastRowData.UNIT_DIV_NM);
        }
      });
    } else if (masterRowData.FEE_HEAD_CD === '600' && masterRowData.FEE_BASE_CD === '010') {
      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LF01038P",
        PROGRAM_NM: "상세내역(운송비지급수수료-배송수수료)",
        url: "lf/LF01038P.html",
        width: 1024,
        height: 600,
        userData: {
          P_PROCESS_CD: "U",
          P_BU_CD: masterRowData.BU_CD,
          P_ADJUST_DATE: masterRowData.ADJUST_DATE,
          P_ADJUST_START_DATE: masterRowData.ADJUST_START_DATE,
          P_ADJUST_END_DATE: masterRowData.ADJUST_END_DATE,
          P_ADJUST_MONTH: masterRowData.ADJUST_MONTH,
          P_ADJUST_NO: masterRowData.ADJUST_NO,
          P_FEE_HEAD_CD: masterRowData.FEE_HEAD_CD,
          P_FEE_BASE_CD: masterRowData.FEE_BASE_CD,
          P_FEE_HEAD_NM: masterRowData.FEE_HEAD_NM,
          P_FEE_BASE_NM: masterRowData.FEE_BASE_NM,
          P_BRAND_CD: masterRowData.BRAND_CD,
          P_BRAND_NM: masterRowData.BRAND_NM,
          P_MASTER_DS: masterRowData
        },
        onOk: function() {
          var lastRowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
          G_GRDT1DETAIL.lastKeyVal = new Array(lastRowData.FEE_HEAD_CD, lastRowData.FEE_BASE_CD,
              lastRowData.UNIT_DIV_NM);
        }
      });
    } else if (masterRowData.FEE_HEAD_CD === '600' && masterRowData.FEE_BASE_CD === '020') {
      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LF01039P",
        PROGRAM_NM: "상세내역(운송비지급수수료-고객반품입고수수료)",
        url: "lf/LF01039P.html",
        width: 1024,
        height: 600,
        userData: {
          P_PROCESS_CD: "U",
          P_BU_CD: masterRowData.BU_CD,
          P_ADJUST_DATE: masterRowData.ADJUST_DATE,
          P_ADJUST_START_DATE: masterRowData.ADJUST_START_DATE,
          P_ADJUST_END_DATE: masterRowData.ADJUST_END_DATE,
          P_ADJUST_MONTH: masterRowData.ADJUST_MONTH,
          P_ADJUST_NO: masterRowData.ADJUST_NO,
          P_FEE_HEAD_CD: masterRowData.FEE_HEAD_CD,
          P_FEE_BASE_CD: masterRowData.FEE_BASE_CD,
          P_FEE_HEAD_NM: masterRowData.FEE_HEAD_NM,
          P_FEE_BASE_NM: masterRowData.FEE_BASE_NM,
          P_BRAND_CD: masterRowData.BRAND_CD,
          P_BRAND_NM: masterRowData.BRAND_NM,
          P_MASTER_DS: masterRowData
        },
        onOk: function() {
          var lastRowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
          G_GRDT1DETAIL.lastKeyVal = new Array(lastRowData.FEE_HEAD_CD, lastRowData.FEE_BASE_CD,
              lastRowData.UNIT_DIV_NM);
        }
      });
    } else if (masterRowData.FEE_HEAD_CD === '600' && masterRowData.FEE_BASE_CD === '030') {
      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LF01040P",
        PROGRAM_NM: "상세내역(운송비지급수수료-반품출고수수료)",
        url: "lf/LF01040P.html",
        width: 1024,
        height: 600,
        userData: {
          P_PROCESS_CD: "U",
          P_BU_CD: masterRowData.BU_CD,
          P_ADJUST_DATE: masterRowData.ADJUST_DATE,
          P_ADJUST_START_DATE: masterRowData.ADJUST_START_DATE,
          P_ADJUST_END_DATE: masterRowData.ADJUST_END_DATE,
          P_ADJUST_MONTH: masterRowData.ADJUST_MONTH,
          P_ADJUST_NO: masterRowData.ADJUST_NO,
          P_FEE_HEAD_CD: masterRowData.FEE_HEAD_CD,
          P_FEE_BASE_CD: masterRowData.FEE_BASE_CD,
          P_FEE_HEAD_NM: masterRowData.FEE_HEAD_NM,
          P_FEE_BASE_NM: masterRowData.FEE_BASE_NM,
          P_BRAND_CD: masterRowData.BRAND_CD,
          P_BRAND_NM: masterRowData.BRAND_NM,
          P_MASTER_DS: masterRowData
        },
        onOk: function() {
          var lastRowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);
          G_GRDT1DETAIL.lastKeyVal = new Array(lastRowData.FEE_HEAD_CD, lastRowData.FEE_BASE_CD,
              lastRowData.UNIT_DIV_NM);
        }
      });
    }
  }
}

/**
 * 입출고 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT1(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);

  if (G_GRDT1MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1MASTER, {
        selectKey: "BU_CD",
        selectVal: G_GRDT1MASTER.lastKeyVal
      });
    }
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

  $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);

  if (G_GRDT1DETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT1DETAIL, 0);
  } else {
    $NC.setGridDisplayRows("grdT1Detail", 0, 0);
  }

}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  // 입출고 수불내역
  $NC.clearGridData(G_GRDT1MASTER);
  $NC.clearGridData(G_GRDT1DETAIL);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "1";

  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
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
 * 정산처 팝업 클릭
 */
function showLblListPopup() {

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LF01031P",
    PROGRAM_NM: "정산내역처리 및 생성",
    url: "lf/LF01031P.html",
    width: 350,
    height: 300,
    onOk: function() {
      _Inquiry();
    }
  });
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */

function showOwnBranPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var CUST_CD = '0000';

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

/**
 * 검색조건의 정산항목 검색 이미지 클릭
 */
function showFee_Head_CdPopup() {

  $NP.showFee_Head_CdPopup({
    P_BU_CD: $NC.getValue("#edtQBu_Cd"),
    P_CENTER_FUNC_DIV: '%',
    P_FEE_HEAD_CD: '%'
  }, onHeadPopup, function() {
    $NC.setFocus("#edtQFee_Head_Cd", true);
  });
}

function onHeadPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQFee_Head_Cd", resultInfo.FEE_HEAD_CD);
    $NC.setValue("#edtQFee_Head_Nm", resultInfo.FEE_HEAD_NM);
  } else {
    $NC.setValue("#edtQFee_Head_Cd");
    $NC.setValue("#edtQFee_Head_Nm");
    $NC.setFocus("#edtQFee_Head_Cd", true);
  }
  // onChangingCondition();
}

/**
 * 검색조건의 세부코드 검색 이미지 클릭
 */
function showFee_Base_CdPopup() {

  var FEE_HEAD_CD = $NC.getValue("#edtQFee_Head_Cd");

  $NP.showFee_Base_CdPopup({
    P_BU_CD: $NC.getValue("#edtQBu_Cd"),
    P_FEE_HEAD_CD: FEE_HEAD_CD,
    P_FEE_BASE_CD: "%"
  }, onBasePopup, function() {
    $NC.setFocus("#edtQFee_Base_Cd", true);
  });
}

function onBasePopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQFee_Base_Cd", resultInfo.FEE_BASE_CD);
    $NC.setValue("#edtQFee_Base_Nm", resultInfo.FEE_BASE_NM);
  } else {
    $NC.setValue("#edtQFee_Base_Cd");
    $NC.setValue("#edtQFee_Base_Nm");
    $NC.setFocus("#edtQFee_Base_Cd", true);
  }
  // onChangingCondition();
}


/**
 * 검색조건의 운송사 검색 이미지 클릭
 */
function showCarrierPopup() {

  $NP.showCarrierPopup({
    queryParams: {
      P_CARRIER_CD: "%",
      P_VIEW_DIV: "2"
    }
  }, onCarrierPopup, function() {
    $NC.setFocus("#edtQCarrier_Cd", true);
  });
}

function onCarrierPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQCarrier_Cd", resultInfo.CARRIER_CD);
    $NC.setValue("#edtQCarrier_Nm", resultInfo.CARRIER_NM);
  } else {
    $NC.setValue("#edtQCarrier_Cd");
    $NC.setValue("#edtQCarrier_Nm");
    $NC.setFocus("#edtQCarrier_Cd", true);
  }

  onChangingCondition();
}



function grdDetailOnCalc(rowData) {

  rowData.FEE_QTY = Number(rowData);
  rowData.FEE_AMT = rowData.ORDER_QTY * NumBer(rowData.UNIT_PRICE);// 매입단가 또는 공급단가

  return rowData;
}

function onBasePopup(resultInfo) {

  var rowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);

  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.FEE_BASE_CD = resultInfo.FEE_BASE_CD;
    rowData.FEE_BASE_NM = resultInfo.FEE_BASE_NM;

    focusCol = G_GRDT1DETAIL.view.getColumnIndex("FEE_HEAD_CD");
  } else {
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    focusCol = G_GRDT1DETAIL.view.getColumnIndex("FEE_BASE_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDT1DETAIL.lastRowModified = true;
  $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, focusCol, true, true);
}


/**
 * 그리드에서 위탁사 선택/취소 했을 경우 처리
 * 
 * @param seletedRowData
 */
function onHeadPopup(resultInfo) {

  var rowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);

  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.FEE_HEAD_CD = resultInfo.FEE_HEAD_CD;
    rowData.FEE_HEAD_NM = resultInfo.FEE_HEAD_NM;

    focusCol = G_GRDT1DETAIL.view.getColumnIndex("FEE_BASE_CD");
  } else {
    rowData.FEE_HEAD_CD = "";
    rowData.FEE_HEAD_NM = "";
    focusCol = G_GRDT1DETAIL.view.getColumnIndex("FEE_HEAD_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDT1DETAIL.lastRowModified = true;
  $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, focusCol, true, true);
}