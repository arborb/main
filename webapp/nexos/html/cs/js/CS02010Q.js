/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();
}

function _SetResizeOffset() {

  $NC.G_OFFSET.gridMasterWidth = 400;
  $NC.G_OFFSET.nonClientHeight = $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_OFFSET.gridMasterWidth - $NC.G_LAYOUT.nonClientWidth;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Container 사이즈 조정
  $NC.resizeContainer("#divLeftView", $NC.G_OFFSET.gridMasterWidth, clientHeight);
  $NC.resizeContainer("#divRightView", clientWidth, clientHeight);

  var gridHeight = clientHeight - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", $NC.G_OFFSET.gridMasterWidth, gridHeight);
  $NC.resizeGrid("#grdDetail", clientWidth, gridHeight);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  // 데이터 조회
  $NC.serviceCall("/CS02010Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "TABLE_NAME",
    field: "TABLE_NAME",
    name: "테이블명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "COMMENTS",
    field: "COMMENTS",
    name: "테이블설명",
    minWidth: 220
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CS02010Q.RS_MASTER",
    sortCol: "TABLE_NAME",
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

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL);
  // 파라메터 세팅
  var rowData = G_GRDMASTER.data.getItem(row);
  G_GRDDETAIL.queryParams = $NC.getParams({
    P_TABLE_NAME: rowData.TABLE_NAME
  });
  // 데이터 조회
  $NC.serviceCall("/CS02010Q/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "COLUMN_ID",
    field: "COLUMN_ID",
    name: "ID",
    minWidth: 40,
    cssClass: "align-right",
  });
  $NC.setGridColumn(columns, {
    id: "COLUMN_NAME",
    field: "COLUMN_NAME",
    name: "컬럼명",
    minWidth: 160,
  });
  $NC.setGridColumn(columns, {
    id: "DATA_TYPE",
    field: "DATA_TYPE",
    name: "타입",
    minWidth: 90,
  });
  $NC.setGridColumn(columns, {
    id: "DATA_LENGTH",
    field: "DATA_LENGTH",
    name: "길이",
    minWidth: 50,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "NULLABLE",
    field: "NULLABLE",
    name: "NULL허용?",
    minWidth: 80,
    formatter: Slick.Formatters.CheckBox,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DATA_DEFAULT",
    field: "DATA_DEFAULT",
    name: "기본값",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "COMMENTS",
    field: "COMMENTS",
    name: "컬럼설명",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

  var options = {
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "CS02010Q.RS_DETAIL",
    sortCol: "COLUMN_ID",
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

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "CODE_CD",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
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
