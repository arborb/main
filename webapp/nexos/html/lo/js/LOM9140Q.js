/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 탭 초기화
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  var cboObj = $("#cboQProc_Yn").empty();
  var optionStr = "";
  optionStr += "<option value='%'>% - 전체</option>";
  optionStr += "<option value='0'>0 - SCAN에러</option>";
  optionStr += "<option value='1'>1 - 대상</option>";
  optionStr += "<option value='2'>2 - 비대상</option>";
  optionStr += "<option value='3'>3 - 취소주문</option>";
  optionStr += "<option value='4'>4 - LOC없음</option>";
  cboObj.append(optionStr);
  $NC.setValue("#cboQProc_Yn", 0);

  $NC.setInitDatePicker("#dtpQScan_Date1");
  $NC.setInitDatePicker("#dtpQScan_Date2");

  // 그리드 초기화
  grdT1MasterInitialize();
  grdT2MasterInitialize();
  grdT3MasterInitialize();

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
  // 입고진행현황 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {
    clientHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset;

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", clientWidth, clientHeight);

  } else if ($("#divMasterView").tabs("option", "active") === 1) {
    clientHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset;

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Master", clientWidth, clientHeight);
  } else {
    clientHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset;

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
  case "SCAN_DATE1":
    $NC.setValueDatePicker(view, val, "작업일자 검색 시작일자를 정확히 입력하십시오.");
    break;
  case "SCAN_DATE2":
    $NC.setValueDatePicker(view, val, "작업일자 검색 종료일자를 정확히 입력하십시오.");
    break;
  }

  onChangingCondition();
}
/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  $NC.clearGridData(G_GRDT1MASTER);
  $NC.clearGridData(G_GRDT2MASTER);
  $NC.clearGridData(G_GRDT3MASTER);

}
/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var SCAN_DATE1 = $NC.getValue("#dtpQScan_Date1");
  if ($NC.isNull(SCAN_DATE1)) {
    alert("작업일자 검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQScan_Date1");
    return;
  }
  var SCAN_DATE2 = $NC.getValue("#dtpQScan_Date2");
  if ($NC.isNull(SCAN_DATE2)) {
    alert("작업일자 검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQScan_Date2");
    return;
  }

  if (SCAN_DATE1 > SCAN_DATE2) {
    alert("작업일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }

  if ($("#divMasterView").tabs("option", "active") === 0) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1MASTER);

    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_SCAN_DATE1: SCAN_DATE1,
      P_SCAN_DATE2: SCAN_DATE2,
      P_PROC_YN: $NC.getValue("#cboQProc_Yn")
    });

    // 데이터 조회
    $NC.serviceCall("/LOM9140Q/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
  }
  if ($("#divMasterView").tabs("option", "active") === 1) {
    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);

    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_SCAN_DATE1: SCAN_DATE1,
      P_SCAN_DATE2: SCAN_DATE2,
      P_PROC_YN: $NC.getValue("#cboQProc_Yn")
    });

    // 데이터 조회
    $NC.serviceCall("/LOM9140Q/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);

  } else {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT3MASTER);

    G_GRDT3MASTER.queryParams = $NC.getParams({
      P_SCAN_DATE1: SCAN_DATE1,
      P_SCAN_DATE2: SCAN_DATE2,
      P_PROC_YN: $NC.getValue("#cboQProc_Yn")
    });

    // 데이터 조회
    $NC.serviceCall("/LOM9140Q/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetT3Master);

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
    id: "SCAN_DATE",
    field: "SCAN_DATE",
    name: "스캔일자",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CALL_SEQ",
    field: "CALL_SEQ",
    name: "요청순번",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SCAN_INFO",
    field: "SCAN_INFO",
    name: "스캔전문",
    minWidth: 140
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
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_NO",
    field: "ORDER_NO",
    name: "예정번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "PACKING_BATCH",
    field: "PACKING_BATCH",
    name: "포장차수",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SCAN_DATETIME",
    field: "SCAN_DATETIME",
    name: "시작일시",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "END_DATETIME",
    field: "END_DATETIME",
    name: "종료일시",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 140
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LOM9140Q.RS_T1_MASTER",
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
    id: "SCAN_DATE",
    field: "SCAN_DATE",
    name: "스캔일자",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CALL_SEQ",
    field: "CALL_SEQ",
    name: "요청순번",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SCAN_INFO",
    field: "SCAN_INFO",
    name: "스캔전문",
    minWidth: 140
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
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_NO",
    field: "ORDER_NO",
    name: "예정번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "PACKING_BATCH",
    field: "PACKING_BATCH",
    name: "포장차수",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SCAN_DATETIME",
    field: "SCAN_DATETIME",
    name: "시작일시",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "END_DATETIME",
    field: "END_DATETIME",
    name: "종료일시",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 140
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LOM9140Q.RS_T2_MASTER",
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
    id: "SCAN_DATE",
    field: "SCAN_DATE",
    name: "스캔일자",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CALL_SEQ",
    field: "CALL_SEQ",
    name: "요청순번",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SCAN_INFO",
    field: "SCAN_INFO",
    name: "스캔전문",
    minWidth: 140
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
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_NO",
    field: "ORDER_NO",
    name: "예정번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "PACKING_BATCH",
    field: "PACKING_BATCH",
    name: "포장차수",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SCAN_DATETIME",
    field: "SCAN_DATETIME",
    name: "시작일시",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "END_DATETIME",
    field: "END_DATETIME",
    name: "종료일시",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 140
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT3MasterInitialize() {

  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT3Master", {
    columns: grdT3MasterOnGetColumns(),
    queryId: "LOM9140Q.RS_T3_MASTER",
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

function onGetT1Master(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);

  if (G_GRDT1MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT1MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT1Master", 0, 0);
  }

}

function onGetT2Master(ajaxData) {

  $NC.setInitGridData(G_GRDT2MASTER, ajaxData);

  if (G_GRDT2MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT2MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT2Master", 0, 0);
  }
}

function onGetT3Master(ajaxData) {

  $NC.setInitGridData(G_GRDT3MASTER, ajaxData);

  if (G_GRDT3MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT3MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT3Master", 0, 0);
  }

}
