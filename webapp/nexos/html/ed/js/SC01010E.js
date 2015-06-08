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

/**
 * 화면 리사이즈 Offset 계산
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.gridMasterWidth = 700;
  $NC.G_OFFSET.nonClientHeight = $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_OFFSET.gridMasterWidth - $NC.G_LAYOUT.nonClientWidth;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divLeftView", $NC.G_OFFSET.gridMasterWidth, clientHeight);
  $NC.resizeContainer("#divRightView", clientWidth, clientHeight);

  var height = clientHeight - $NC.G_LAYOUT.header;

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", $NC.G_OFFSET.gridMasterWidth, height);
  $NC.resizeGrid("#grdDetail", clientWidth, height);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  // 파라메터 세팅

  
  G_GRDMASTER.queryParams = $NC.getParams({
    P_SC_DATE: '2015/03/13',
    P_SC_TITLE: '2222',
    P_SC_CONTENT: '3333'
  });

  // 데이터 조회
  $NC.serviceCall("/SC01010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

  
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  // grdDetail에 포커스가 있을 경우
  if (G_GRDMASTER.data.getLength() == 0) {
    alert("조회된 수신구분코드가 없습니다.\n\n수신구분 코드를 먼저 등록하십시오.");
    return;
  }

  var groupData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  // 현재 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }

  var rowCount = G_GRDDETAIL.data.getLength();
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDDETAIL.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: rowCount - 1,
        activeCell: 0,
        editMode: true
      });
      return;
    }
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    // EDI_DIV: null,
    EDI_DIV: groupData.EDI_DIV,
    CHECK_NO: null,
    CHECK_NM: null,
    REMARK1: null,
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };
  G_GRDDETAIL.data.addItem(newRowData);
  $NC.setGridSelectRow(G_GRDDETAIL, rowCount);
  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;

  // 신규 데이터 생성 후 이벤트 호출
  grdDetailOnNewRecord({
    row: rowCount,
    rowData: newRowData
  });
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  if (G_GRDDETAIL.lastRow == null || G_GRDDETAIL.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  // 현재 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }

  // 송수신구분코드 수정 데이터
  var saveDetailDS = [ ];
  var rowCount = G_GRDDETAIL.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_EDI_DIV: rowData.EDI_DIV,
        P_CHECK_NO: rowData.CHECK_NO,
        P_CHECK_NM: rowData.CHECK_NM,
        P_REMARK1: rowData.REMARK1,
        // P_CODE_EX: rowData.CODE_EX,
        P_CRUD: rowData.CRUD
      };
      saveDetailDS.push(saveData);
    }
  }

  if (saveDetailDS.length > 0) {
    $NC.serviceCall("/ED10010E/save.do", {
      P_DS_DETAIL: $NC.toJson(saveDetailDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var result = confirm("해당 수신코드 정보를 삭제 하시겠습니까?");
  if (result) {
    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

    // 신규 데이터일 경우 그냥 삭제
    if (rowData.CRUD === "C" || rowData.CRUD === "N") {
      // 마지막 선택 Row 수정 상태 복원
      G_GRDDETAIL.lastRowModified = false;

      G_GRDDETAIL.data.deleteItem(rowData.id);
      // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
      if (G_GRDDETAIL.lastRow > 1) {
        $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.lastRow - 1);
      } else {
        $NC.setGridSelectRow(G_GRDDETAIL, 0);
      }
    } else {
      rowData.CRUD = "D";
      G_GRDDETAIL.data.updateItem(rowData.id, rowData);
      _Save();
    }
  }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "EDI_DIV",
    isCancel: true
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "CHECK_NO",
    isCancel: true
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL.lastKeyVal = lastKeyVal2;
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
    id: "SC_DATE",
    field: "SC_DATE",
    name: "날짜",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "SC_TITLE",
    field: "SC_TITLE",
    name: "제목",
    minWidth: 160
  });
 

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "SC01010E.RS_MASTER",
    sortCol: "SC_DATE",
    gridOptions: options
  });
  //G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}
/*
function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL);
  // 파라메터 세팅
  var rowData = G_GRDMASTER.data.getItem(row);
  G_GRDDETAIL.queryParams = $NC.getParams({
    P_EDI_DIV: rowData.EDI_DIV
  });
  // 데이터 조회
  $NC.serviceCall("/SC01010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
}
*/
function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "SC_DATE",
    field: "SC_DATE",
    name: "날짜",
    Width: 120,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });


  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "SC01010E.RS_MASTER",
    sortCol: "SC_DATE",
    gridOptions: options
  });
  //G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  //G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  //G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

function grdDetailOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL, args.row, 0, true);
}

function grdDetailOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "CHECK_NO") {
    return true;
  }
  var rowData = G_GRDDETAIL.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      return false;
    }
  }
  return true;
}

function grdDetailOnCellChange(e, args) {

  var rowData = args.item;

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
}

function grdDetailOnBeforePost(row) {

  if (!G_GRDDETAIL.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAIL.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.EDI_DIV)) {
      G_GRDDETAIL.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.EDI_DIV)) {
      alert("수신구분 코드를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("EDI_DIV"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.CHECK_NO)) {
      alert("수신구분 체크번호를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("CHECK_NO"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.CHECK_NM)) {
      alert("수신체크명을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("CHECK_NM"),
        editMode: true
      });
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdDetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL.lastRow != null) {
    if (row == G_GRDDETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
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
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    onGetT1Detail({
      data: null
    });
  }
  
}

function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "CHECK_NO",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
}

function onSave(ajaxData) {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "EDI_DIV"
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "CHECK_NO"
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL.lastKeyVal = lastKeyVal2;
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
  if (G_GRDMASTER.focused) {
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    if (rowData.CRUD === "D") {
      rowData.CRUD = "U";
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
      // 마지막 선택 Row 수정 상태로 변경
      G_GRDMASTER.lastRowModified = true;
    }
  } else {
    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

    if (rowData.CRUD === "D") {
      rowData.CRUD = "U";
      G_GRDDETAIL.data.updateItem(rowData.id, rowData);
      // 마지막 선택 Row 수정 상태로 변경
      G_GRDDETAIL.lastRowModified = true;
    }
  }
}