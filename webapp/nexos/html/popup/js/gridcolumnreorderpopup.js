/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();

  $("#btnOk").click(_Save);
  $("#btnCancel").click(onCancel);
  $("#btnColumnUp").click(onBtnColumnUpClick);
  $("#btnColumnDown").click(onBtnColumnDownClick);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divTopView").outerHeight() + $("#divBottomView").outerHeight()
      + $NC.G_LAYOUT.border1;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Container 사이즈 조정
  $NC.resizeContainer("#divCenterView", clientWidth, clientHeight);
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * Load Complete Event
 */
function _OnPopupOpen() {

  // 데이터를 넘겨 받으면 데이터 그냥 표시
  if ($NC.G_VAR.userData) {
    $NC.setValue("#edtProgram_Nm", $NC.G_VAR.userData.programTitle);
    $NC.setValue("#edtGrid_Nm", $NC.G_VAR.userData.gridTitle);

    $NC.setGridSelectRow(G_GRDMASTER, 0);
    // Grid onSort Event 추가 바인딩
    // 데이터가 정렬 되었을 경우 (현)컬럼순서 재조정
    G_GRDMASTER.view.onSort.subscribe(function(e, args) {

      var sortGrid = window["G_" + args.grid.getContainerNode().id.toUpperCase()];

      for ( var row = 0, rowCount = sortGrid.data.getLength(); row < rowCount; row++) {
        var rowData = sortGrid.data.getItem(row);
        rowData.COLUMN_NO = row + 1;

        if (rowData.CRUD === "R") {
          rowData.CRUD = "U";
        }
        sortGrid.data.updateItem(rowData.id, rowData);
      }
    });
  }
}

function onCancel() {

  $NC.setPopupCloseAction("CANCEL");

  var onAfterCancel = $NC.G_VAR.userData.onCancel;
  $NC.onPopupClose();
  if (onAfterCancel) {
    onAfterCancel();
  }
}

function onClose() {

  $NC.setPopupCloseAction("OK");
  var onOk = $NC.G_VAR.userData.onOk;
  var args = {
    gridId: $NC.G_VAR.userData.gridObject.view.getContainerNode().id.toUpperCase(),
    columnPosition: $NC.G_VAR.P_COLUMN_POSITION
  };
  if (onOk) {
    $NC.onPopupClose();
    onOk(args);
  } else {
    $NC.onPopupClose();
  }
}

/**
 * 저장
 */
function _Save() {

  if (G_GRDMASTER.data.getLength() == 0) {
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

  if ($NC.getGridSearchVal(G_GRDMASTER, {
    searchKey: "CRUD",
    searchVal: "U"
  }) == -1) {
    alert("컬럼순서를 조정 후 저장하십시오.");
    return;
  }

  // 컬럼 데이터
  var saveDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    // if (rowData.CRUD !== "R") {
    var saveData = {
      COL_ID: rowData.id,
      FROZEN_YN: rowData.FROZEN_YN,
      FIELD_NM: rowData.FIELD_NM,
      COL_NO: rowData.COLUMN_NO
    // ,
    // P_CRUD: rowData.CRUD
    };
    saveDS.push(saveData);
    // }
  }

  if (saveDS.length > 0) {
    $NC.G_VAR.P_COLUMN_POSITION = $NC.toJson(saveDS);

    var PROGRAM_ID = $NC.G_VAR.userData.programInfo.PROGRAM_ID;
    var GRID_ID = $NC.G_VAR.userData.gridObject.view.getContainerNode().id.toUpperCase();
    $NC.serviceCall("/WC/saveGridColumnOrder.do", {
      P_USER_ID: $NC.G_USERINFO.USER_ID,
      P_PROGRAM_ID: PROGRAM_ID,
      P_GRID_ID: GRID_ID,
      P_COLUMN_POSITION: $NC.G_VAR.P_COLUMN_POSITION,
      P_REG_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
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

  if (args.cell == G_GRDMASTER.view.getColumnIndex("FROZEN_YN")) {
    rowData.FROZEN_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  setColumnReorderCheck(args.row, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

function grdMasterInitialize() {

  var columns = [{
    id: "COLUMN_NM",
    field: "COLUMN_NM",
    name: "컬럼명",
    minWidth: 130
  }, {
    id: "FROZEN_YN",
    field: "FROZEN_YN",
    name: "고정컬럼",
    minWidth: 60,
    maxWidth: 60,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, {
    id: "COLUMN_NO",
    field: "COLUMN_NO",
    name: "(현)컬럼순서",
    minWidth: 80,
    cssClass: "align-center"
  }, {
    id: "DEF_COLUMN_NO",
    field: "DEF_COLUMN_NO",
    name: "(원)컬럼순서",
    minWidth: 80,
    cssClass: "align-center"
  }];

  var srcGrid = $NC.G_VAR.userData.gridObject;
  var srcGridOptions = srcGrid.view.getOptions();
  var srcGridColumns = srcGrid.view.getColumns();
  var srcGridDefColumns = srcGrid.defaultColumns;
  var srcGridGetDefColumnOrder = function(srcColumn) {
    var result;

    for ( var col in srcGridDefColumns) {
      var defColumn = srcGridDefColumns[col];
      if (defColumn.id == srcColumn.id) {
        result = Number(col) + 1;
        break;
      }
    }

    return result;
  };
  var data = [ ];
  for ( var col in srcGridColumns) {
    var column = srcGridColumns[col];
    var columnName = column.name;
    if (columnName.substr(1, 5).toUpperCase() == "INPUT") {
      columnName = "전체선택";
    }
    var rowData = {
      id: column.id,
      DEF_COLUMN_NO: srcGridGetDefColumnOrder(column),
      COLUMN_NM: columnName,
      FROZEN_YN: col <= srcGridOptions.frozenColumn ? "Y" : "N",
      FIELD_NM: column.field,
      COLUMN_NO: Number(col) + 1,
      CRUD: "R"
    };
    data.push(rowData);
  }

  var options = {
    editable: true,
    autoEdit: true,
    enableColumnReorder: true,
    frozenColumn: srcGridOptions.frozenColumn,
    specialRow: {
      compareKey: "FROZEN_YN",
      compareVal: "Y",
      compareOperator: "==",
      cssClass: "specialrow4"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: columns,
    gridOptions: options,
    data: data,
    canExportExcel: false
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

function grdMasterOnBeforeEditCell(e, args) {

  return true;
}

function grdMasterOnCellChange(e, args) {

  var rowData = args.item;

  if (args.cell == G_GRDMASTER.view.getColumnIndex("FROZEN_YN")) {
    setColumnReorderCheck(args.row, rowData);
  } else {
    if (rowData.CRUD === "R") {
      rowData.CRUD = "U";
    }
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }

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
    if ($NC.isNull(rowData.FIELD_NM)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {

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

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function onBtnColumnUpClick() {

  if ($NC.isNull(G_GRDMASTER.lastRow) || G_GRDMASTER.lastRow == 0) {
    return;
  }

  var lastRow = setColumnReorder(G_GRDMASTER.lastRow, true, false);

  $NC.setGridSelectRow(G_GRDMASTER, lastRow.row);
}

function onBtnColumnDownClick() {

  if ($NC.isNull(G_GRDMASTER.lastRow) || G_GRDMASTER.lastRow == G_GRDMASTER.data.getLength() - 1) {
    return;
  }

  var lastRow = setColumnReorder(G_GRDMASTER.lastRow, false, false);

  $NC.setGridSelectRow(G_GRDMASTER, lastRow.row);
}

function setColumnReorderCheck(checkRow, checkRowData) {

  var tarRow;
  if (checkRowData.FROZEN_YN == "Y") {
    tarRow = {
      row: checkRow - 1,
      moved: false
    };
    for ( var row = tarRow.row; row > 0; row--) {
      var tarRowData = G_GRDMASTER.data.getItem(row);
      if (tarRowData.FROZEN_YN == "Y") {
        break;
      }
      tarRow = setColumnReorder(row + 1, true, true);
      row = tarRow.row;
    }
    if (!tarRow.moved) {
      tarRow.row = tarRow.row + 1;
    }
  } else {
    tarRow = {
      row: checkRow + 1,
      moved: false
    };
    for ( var row = tarRow.row, rowCount = G_GRDMASTER.data.getLength(); row < rowCount; row++) {
      var tarRowData = G_GRDMASTER.data.getItem(row);
      if (tarRowData.FROZEN_YN == "N") {
        break;
      }
      tarRow = setColumnReorder(row - 1, false, true);
      row = tarRow.row;
    }
    if (!tarRow.moved) {
      tarRow.row = tarRow.row - 1;
    }
  }

  G_GRDMASTER.lastRow = null;
  $NC.setGridSelectRow(G_GRDMASTER, tarRow.row);
}

function setColumnReorder(row, isUp, isFormatter) {

  var curRow = row;
  var tarRow;
  if (isUp) {
    tarRow = curRow - 1;
  } else {
    tarRow = curRow + 1;
  }

  var curRowData1 = G_GRDMASTER.data.getItem(curRow);
  var tarRowData1 = G_GRDMASTER.data.getItem(tarRow);

  if (!isFormatter) {
    if (curRowData1.FROZEN_YN == "Y" && tarRowData1.FROZEN_YN == "N") {
      return {
        row: curRow,
        moved: false
      };
    }
    if (curRowData1.FROZEN_YN == "N" && tarRowData1.FROZEN_YN == "Y") {
      return {
        row: curRow,
        moved: false
      };
    }
  }

  var curRowData2 = $.extend(true, {}, curRowData1);
  var tarRowData2 = $.extend(true, {}, tarRowData1);

  curRowData2.COLUMN_NO = tarRowData1.COLUMN_NO;
  tarRowData2.COLUMN_NO = curRowData1.COLUMN_NO;

  if (curRowData2.CRUD === "R") {
    curRowData2.CRUD = "U";
  }
  if (tarRowData2.CRUD === "R") {
    tarRowData2.CRUD = "U";
  }

  G_GRDMASTER.data.deleteItem(curRowData1.id);
  G_GRDMASTER.data.deleteItem(tarRowData1.id);

  if (isUp) {
    G_GRDMASTER.data.insertItem(tarRow, tarRowData2);
    G_GRDMASTER.data.insertItem(tarRow, curRowData2);
  } else {
    G_GRDMASTER.data.insertItem(curRow, curRowData2);
    G_GRDMASTER.data.insertItem(curRow, tarRowData2);
  }

  return {
    row: tarRow,
    moved: true
  };
}

function onSave(ajaxData) {

  setTimeout(function() {
    onClose();
  }, 100);
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}