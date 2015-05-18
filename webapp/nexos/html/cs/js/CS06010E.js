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
 * IFrame이 로드가 완료되었을 경우 자동 호출 됨
 */

function _OnLoaded() {
  // 스플리터 초기화
  $NC.setInitSplitter("#divMasterView", "v", $NC.G_OFFSET.leftViewWidth, 400, 400);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.leftViewWidth = 850;
  $NC.G_OFFSET.nonClientHeight = $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          row, cell, value
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

  var gridDataset = args.grid === "grdMaster" ? G_GRDMASTER : G_GRDDETAIL;

  if (gridDataset.view.getEditorLock().isActive()) {
    gridDataset.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(gridDataset, args.row);

  var rowData = gridDataset.data.getItem(args.row);

  if (args.cell == gridDataset.view.getColumnIndex("DISPLAY_YN")) {
    // 화면표시그룹이 일반일 경우는
    if (rowData.DISPLAY_GRP === "00") {
      gridDataset.data.updateItem(rowData.id, rowData);
      alert("일반 화면표시그룹은 표시를 해제할 수 없습니다.");
      return;
    } else {
      rowData.DISPLAY_YN = args.val === "Y" ? "N" : "Y";
    }
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  gridDataset.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  gridDataset.lastRowModified = true;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 * 
 * @param parent
 *          상위 view, 기본은 contentWindow
 */
function _OnResize(parent) {
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  var container = $("#divMasterView");
  $NC.resizeContainer(container, clientWidth, clientHeight);

  // Grid 사이즈 조정
  var parent = $("#grdMaster").parent();
  $NC.resizeGrid("#grdMaster", parent.width(), parent.height() - $NC.G_LAYOUT.header);
  parent = $("#grdDetail").parent();
  $NC.resizeGrid("#grdDetail", parent.width(), parent.height() - $NC.G_LAYOUT.header);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 데이터 조회
  $NC.serviceCall("/CS06010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  // grdMaster에 포커스가 있을 경우
  if (G_GRDMASTER.focused) {
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

    var rowCount = G_GRDMASTER.data.getLength();
    if (rowCount > 0) {
      // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
      var rowData = G_GRDMASTER.data.getItem(rowCount - 1);
      if (rowData.CRUD == "N") {
        $NC.setFocusGrid(G_GRDMASTER, rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      DISPLAY_GRP: null,
      DISPLAY_NM: null,
      DISPLAY_YN: "N",
      REMARK1: null,
      id: $NC.getGridNewRowId(),
      CRUD: "N"
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
  } else {
    // grdDetail에 포커스가 있을 경우
    if (G_GRDMASTER.data.getLength() == 0) {
      alert("화면표시그룹이 없습니다.\n\n화면표시그룹을 먼저 등록하십시오.");
      return;
    }
    var masterData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    if (masterData.CRUD == "N" || masterData.CRUD == "C") {
      alert("신규 화면표시그룹입니다.\n\n저장 후 메시지그룹을 등록하십시요.");
      return;
    }

    // 일반화면표시그룹일 경우 메시지그룹 추가 방지
    if (masterData.DISPLAY_GRP === "00") {
      alert("일반 화면표시그룹은 메시지그룹을 추가할 수 없습니다.");
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

    var rowCount = G_GRDDETAIL.data.getLength();
    if (rowCount > 0) {
      // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
      var rowData = G_GRDDETAIL.data.getItem(rowCount - 1);
      if (rowData.CRUD == "N") {
        $NC.setFocusGrid(G_GRDDETAIL, rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      DISPLAY_GRP: masterData.DISPLAY_GRP,
      MSG_GRP: null,
      DISPLAY_YN: "N",
      REG_USER_ID: null,
      REG_DATETIME: null,
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
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  if (G_GRDMASTER.focused) {
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
  } else {
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
  }

  // 화면표시그룹 수정 데이터
  var saveMasterDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_DISPLAY_GRP: rowData.DISPLAY_GRP,
        P_DISPLAY_NM: rowData.DISPLAY_NM,
        P_DISPLAY_YN: rowData.DISPLAY_YN,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveMasterDS.push(saveData);
    }
  }

  // 메세지그룹 수정 데이터
  var saveDetailDS = [ ];
  var rowCount = G_GRDDETAIL.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_DISPLAY_GRP: rowData.DISPLAY_GRP,
        P_MSG_GRP: rowData.MSG_GRP,
        P_DISPLAY_YN: rowData.DISPLAY_YN,
        P_CRUD: rowData.CRUD
      };
      saveDetailDS.push(saveData);
    }
  }

  if (saveMasterDS.length > 0 || saveDetailDS.length > 0) {
    $NC.serviceCall("/CS06010E/save.do", {
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

  if (G_GRDMASTER.focused) {

    if (G_GRDMASTER.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    var result = confirm("화면표시그룹을 삭제 하시겠습니까?");
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
  } else {

    if (G_GRDDETAIL.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    var result = confirm("메시지그룹을 삭제 하시겠습니까?");
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
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "DISPLAY_GRP",
    isCancel: true
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "MSG_GRP",
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
    id: "DISPLAY_GRP",
    field: "DISPLAY_GRP",
    name: "화면표시그룹",
    minWidth: 100,
    cssClass: "align-center",
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "DISPLAY_NM",
    field: "DISPLAY_NM",
    name: "화면표시그룹명",
    minWidth: 150,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "DISPLAY_YN",
    field: "DISPLAY_YN",
    name: "표시여부",
    minWidth: 80,
    maxWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CS06010E.RS_MASTER",
    sortCol: "DISPLAY_GRP",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
  $("#grdMaster").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDMASTER.focused) {
      return;
    }
    G_GRDMASTER.focused = true;
    G_GRDDETAIL.focused = false;

    // 디테일 데이터 Post 처리
    if (G_GRDDETAIL.view.getEditorLock().isActive()) {
      G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL.lastRow != null) {
        if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
          G_GRDDETAIL.view.getCanvasNode.focus();
        }
      }
    }
  });
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

  // 조회시 디테일 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL);

  var rowData = G_GRDMASTER.data.getItem(row);
  if (rowData.CRUD == "C" || rowData.CRUD == "N") {
    onGetDetail({
      data: null
    });
  } else {
    G_GRDDETAIL.queryParams = $NC.getParams({
      P_DISPLAY_GRP: rowData.DISPLAY_GRP
    });

    // 디테일 조회
    $NC.serviceCall("/CS06010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdMasterOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "DISPLAY_GRP") {
    return true;
  }
  var rowData = G_GRDMASTER.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      return false;
    }
  }
  return true;
}

function grdMasterOnCellChange(e, args) {

  var rowData = args.item;
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

function grdMasterOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDMASTER, args.row, 0, true);
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
    if ($NC.isNull(rowData.DISPLAY_GRP)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.DISPLAY_GRP)) {
      alert("화면표시그룹을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: row,
        activeCell: G_GRDMASTER.view.getColumnIndex("DISPLAY_GRP"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.DISPLAY_NM)) {
      alert("화면표시그룹명을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: row,
        activeCell: G_GRDMASTER.view.getColumnIndex("DISPLAY_NM"),
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

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "MSG_GRP_F",
    field: "MSG_GRP_F",
    name: "메시지그룹",
    minWidth: 100,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "CS06010E.RS_SUB",
      P_QUERY_PARAMS: $NC.getParams({})
    }, {
      codeField: "MSG_GRP",
      dataCodeField: "CODE_CD",
      dataNameField: "CODE_NM",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "DISPLAY_YN",
    field: "DISPLAY_YN",
    name: "표시여부",
    minWidth: 80,
    maxWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "REG_USER_ID",
    field: "REG_USER_ID",
    name: "최종등록자",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REG_DATETIME",
    field: "REG_DATETIME",
    name: "최종등록일시",
    minWidth: 120,
    cssClass: "align-center"
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
    queryId: "CS06010E.RS_DETAIL",
    sortCol: "DISPLAY_GRP",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
  $("#grdDetail").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDDETAIL.focused) {
      return;
    }
    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = true;

    if (G_GRDMASTER.view.getEditorLock().isActive()) {
      G_GRDMASTER.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDMASTER.lastRow != null) {
        if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
          G_GRDMASTER.view.getCanvasNode.focus();
        }
      }
    }
  });
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

function grdDetailOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "MSG_GRP_F") {
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

function grdDetailOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL, args.row, 0, true);
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
    if ($NC.isNull(rowData.MSG_GRP)) {
      G_GRDDETAIL.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.MSG_GRP)) {
      alert("메시지그룹을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("MSG_GRP"),
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

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "DISPLAY_GRP",
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

function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "MSG_GRP",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
}

function onSave(ajaxData) {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "DISPLAY_GRP"
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "MSG_GRP"
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