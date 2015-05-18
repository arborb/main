/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.leftViewWidth = 600;
  $NC.G_OFFSET.nonClientHeight = $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 데이터 조회
  $NC.serviceCall("/CS03010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  // grdMaster에 포커스가 있을 경우
  // 현재 수정모드면
  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDMASTER.lastRow != null) {
    if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
      return;
    }
  }

  var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var rowCount = G_GRDMASTER.data.getLength();
  var rowData = null;
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    rowData = G_GRDMASTER.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      $NC.setFocusGrid(G_GRDMASTER, rowCount - 1, 0, true);
      return;
    }
  }
  var PROCESS_GRP;
  if (lastRowData) {
    PROCESS_GRP = lastRowData.PROCESS_GRP;
  } else {
    PROCESS_GRP = "LI";
  }
  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    PROCESS_GRP: PROCESS_GRP,
    PROCESS_CD: null,
    PROCESS_NM: null,
    START_PROCESS_YN: "N",
    END_PROCESS_YN: "N",
    PROCESS_STATE: null,
    PROCESS_STATE_D: null,
    REG_DATETIME: null,
    id: $NC.getGridNewRowId(),
    CRUD: "N",
    PROCESS_GRP_F: $NC.getGridComboName(G_GRDMASTER, {
      colFullNameField: "PROCESS_GRP_F",
      searchVal: PROCESS_GRP,
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    })
  };
  G_GRDMASTER.data.addItem(newRowData);
  $NC.setGridSelectRow(G_GRDMASTER, rowCount);

  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;

  // 신규 데이터 생성 후 이벤트 호출
  grdMasterOnNewRecord({
    row: rowCount,
    rowData: newRowData
  });
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }
  // 현재 수정모드면
  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDMASTER.lastRow != null) {
    if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
      return;
    }
  }

  // 프로세스 수정 데이터
  var saveMasterDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_PROCESS_GRP: rowData.PROCESS_GRP,
        P_PROCESS_CD: rowData.PROCESS_CD,
        P_PROCESS_NM: rowData.PROCESS_NM,
        P_PROCESS_STATE: rowData.PROCESS_STATE,
        P_START_PROCESS_YN: rowData.START_PROCESS_YN,
        P_END_PROCESS_YN: rowData.END_PROCESS_YN,
        P_CRUD: rowData.CRUD
      };
      saveMasterDS.push(saveData);
    }
  }

  // 하위프로세스 수정 데이터
  var saveDetailDS = [ ];
  if (saveMasterDS.length > 0) {
    $NC.serviceCall("/CS03010E/save.do", {
      P_DS_MASTER: $NC.toJson(saveMasterDS),
      P_DS_DETAIL: $NC.toJson(saveDetailDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var result = confirm("프로세스를 삭제 하시겠습니까?");
  if (result) {
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    // 신규 데이터일 경우 그냥 삭제
    if (rowData.CRUD === "C" || rowData.CRUD === "N") {
      // 마지막 선택 Row 수정 상태 복원
      G_GRDMASTER.lastRowModified = false;

      G_GRDMASTER.data.deleteItem(rowData.id);
      // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
      if (G_GRDMASTER.lastRow > 1) {
        $NC.setGridSelectRow(G_GRDMASTER, G_GRDMASTER.lastRow - 1);
      } else {
        $NC.setGridSelectRow(G_GRDMASTER, 0);
      }
    } else {
      rowData.CRUD = "D";
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
      _Save();
    }
  }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: ["PROCESS_GRP", "PROCESS_CD"],
    isCancel: true
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
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
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          grid, row, cell, val
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDMASTER, args.row);

  var rowData = G_GRDMASTER.data.getItem(args.row);

  if (args.cell == G_GRDMASTER.view.getColumnIndex("START_PROCESS_YN")) {
    rowData.START_PROCESS_YN = args.val === "Y" ? "N" : "Y";
  }

  if (args.cell == G_GRDMASTER.view.getColumnIndex("END_PROCESS_YN")) {
    rowData.END_PROCESS_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "PROCESS_GRP_F",
    field: "PROCESS_GRP_F",
    name: "프로세스그룹",
    minWidth: 100,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "PROCESS_GRP",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "PROCESS_GRP",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "PROCESS_CD",
    field: "PROCESS_CD",
    name: "프로세스코드",
    minWidth: 100,
    cssClass: "align-center",
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "PROCESS_NM",
    field: "PROCESS_NM",
    name: "프로세스명",
    minWidth: 100,
    cssClass: "align-center",
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "START_PROCESS_YN",
    field: "START_PROCESS_YN",
    name: "시작가능여부",
    minWidth: 90,
    maxWidth: 90,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "END_PROCESS_YN",
    field: "END_PROCESS_YN",
    name: "종료가능여부",
    minWidth: 90,
    maxWidth: 90,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "PROCESS_STATE_F",
    field: "PROCESS_STATE_F",
    name: "프로세스상태",
    minWidth: 150,
    cssClass: "align-left",
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/CS03010E/getDataSet.do", {
      P_QUERY_ID: "CS03010E.RS_REF1",
      P_QUERY_PARAMS: $NC.getParams({
        P_PROCESS_GRP: "LI"
      })
    }, {
      codeField: "PROCESS_STATE",
      dataCodeField: "PROCESS_STATE",
      dataFullNameField: "PROCESS_STATE_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "REG_DATETIME",
    field: "REG_DATETIME",
    name: "최종등록일시",
    minWidth: 180,
    cssClass: "align-center",
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CS03010E.RS_MASTER",
    sortCol: "PROCESS_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

function grdMasterOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDMASTER, args.row, 0, true);
}

function grdMasterOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  var rowData = G_GRDMASTER.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      if (args.column.field === "PROCESS_GRP_F" || args.column.field === "PROCESS_CD") {
        return false;
      }
    }
  }
  return true;
}

function grdMasterOnCellChange(e, args) {

  var rowData = args.item;
  if (args.cell === G_GRDMASTER.view.getColumnIndex("PROCESS_GRP_F")) {

    if (!$NC.isNull(rowData.PROCESS_GRP)) {
      // 데이터 조회
      $NC.serviceCallAndWait("/CS03010E/getDataSet.do", {
        P_QUERY_ID: "CS03010E.RS_REF1",
        P_QUERY_PARAMS: $NC.getParams({
          P_PROCESS_GRP: rowData.PROCESS_GRP
        })
      }, onGetProcessStateCombo);

      rowData.PROCESS_STATE = null;
      rowData.PROCESS_STATE_F = null;

      // return;
    }
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

function grdMasterOnBeforePost(row) {

  if (!G_GRDMASTER.lastRowModified) {
    return true;
  }

  var rowData = G_GRDMASTER.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.PROCESS_GRP)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }

    // 신규일 때 프로세스 코드가 없으면 신규 취소
    if ($NC.isNull(rowData.PROCESS_CD)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.PROCESS_GRP)) {
      alert("프로세스 그룹을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: row,
        activeCell: G_GRDMASTER.view.getColumnIndex("PROCESS_GRP"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.PROCESS_CD)) {
      alert("프로세스 코드를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: row,
        activeCell: G_GRDMASTER.view.getColumnIndex("PROCESS_CD"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.PROCESS_NM)) {
      alert("프로세스 명을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: row,
        activeCell: G_GRDMASTER.view.getColumnIndex("PROCESS_NM"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.PROCESS_STATE)) {
      alert("프로세스 상태를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: row,
        activeCell: G_GRDMASTER.view.getColumnIndex("PROCESS_STATE_F"),
        editMode: true
      });
      return false;
    }

    // 전체 데이터를 기준으로 동일 그룹, 프로세스 체크
    var sameCnt = 0;
    var rows = G_GRDMASTER.data.getItems();
    for ( var row in rows) {
      if (rows[row].PROCESS_GRP === rowData.PROCESS_GRP && rows[row].PROCESS_CD === rowData.PROCESS_CD) {
        sameCnt++;
      }
    }
    if (sameCnt > 1) {
      alert("해당 프로세스 코드는 이미 입력된 코드입니다.\n\n다른 프로세스 코드를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: row,
        activeCell: G_GRDMASTER.view.getColumnIndex("PROCESS_CD"),
        editMode: true
      });
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
    if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDMASTER.data.getItem(row);
  var lastRowData = null;

  if (G_GRDMASTER.lastRow != null) {
    // 신규 데이터에 입력하지 않고 이동할 경우
    if (G_GRDMASTER.lastRow >= G_GRDMASTER.data.getLength()) {
      G_GRDMASTER.lastRow = null;
    } else {
      lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    }
  }
  if (G_GRDMASTER.lastRow != null && rowData.PROCESS_GRP != lastRowData.PROCESS_GRP) {
    $NC.serviceCallAndWait("/CS03010E/getDataSet.do", {
      P_QUERY_ID: "CS03010E.RS_REF1",
      P_QUERY_PARAMS: $NC.getParams({
        P_PROCESS_GRP: rowData.PROCESS_GRP
      })
    }, onGetProcessStateCombo);
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["PROCESS_GRP", "PROCESS_CD"],
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "1";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);

}

function onGetProcessStateCombo(ajaxData) {

  var activeCell = G_GRDMASTER.view.getActiveCell();
  var activeEditing = G_GRDMASTER.view.getEditorLock().isActive();
  var cols = G_GRDMASTER.view.getColumns();
  cols[G_GRDMASTER.view.getColumnIndex("PROCESS_STATE_F")].editorOptions = {
    codeField: "PROCESS_STATE",
    dataCodeField: "PROCESS_STATE",
    dataFullNameField: "PROCESS_STATE_F",
    data: $NC.toArray(ajaxData),
    isKeyField: true
  };
  G_GRDMASTER.view.setColumns(cols);
  if (activeEditing) {
    $NC.setFocusGrid(G_GRDMASTER, activeCell.row, activeCell.cell, true);
  }
}

function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: ["PROCESS_GRP", "PROCESS_CD"]
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (rowData.CRUD === "D") {
    rowData.CRUD = "U";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
    // 마지막 선택 Row 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;
  }
}