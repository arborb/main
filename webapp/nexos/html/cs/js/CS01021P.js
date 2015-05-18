/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 버튼 클릭 이벤트 연결
  $("#btnCancel").click(onCancel);
  $("#btnSave").click(_Save);
  $("#btnDeleteUserProgram").click(_Delete);
  $("#btnAddUserProgram").click(_New);

  // 그리드 초기화
  grdSub1Initialize();
  grdSub2Initialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtQProgram_Id", $NC.G_VAR.userData.P_PROGRAM_ID);
  $NC.setValue("#edtQProgram_Nm", $NC.G_VAR.userData.P_PROGRAM_NM);

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
    addAll: true,
    onComplete: function() {
      _Inquiry();
    }
  });
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.fixedLeftWidth = 300;
  $NC.G_OFFSET.fixedCenterWidth = 50;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $("#divMasterView").outerHeight()
      + $("#divBottomView").outerHeight() + $NC.G_LAYOUT.topOffset;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width();
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divSubView", clientWidth, clientHeight);

  clientWidth = $NC.G_OFFSET.fixedLeftWidth;
  clientHeight -= $NC.G_LAYOUT.border1;
  $NC.resizeContainer("#divLeftView", clientWidth, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdSub1", clientWidth, clientHeight - $NC.G_LAYOUT.header);

  clientWidth = $NC.G_OFFSET.fixedCenterWidth - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.border1;
  $NC.resizeContainer("#divCenterView", clientWidth, clientHeight);

  clientWidth = parent.width()
      - ($NC.G_OFFSET.fixedLeftWidth + $NC.G_OFFSET.fixedCenterWidth + $NC.G_LAYOUT.border1 + $NC.G_LAYOUT.margin1);
  $NC.resizeContainer("#divRightView", clientWidth, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdSub2", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

  $NC.setPopupCloseAction("CANCEL");
  $NC.onPopupClose();
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

  $NC.setPopupCloseAction("OK");
  $NC.onPopupClose();
}

/**
 * 조회
 */
function _Inquiry() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var PROGRAM_ID = $NC.getValue("#edtQProgram_Id");

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUB1);

  // 데이터 조회
  G_GRDSUB1.queryParams = $NC.getParams({
    P_PROGRAM_ID: PROGRAM_ID,
    P_CENTER_CD: CENTER_CD
  });
  $NC.serviceCall("/CS01020E/getDataSet.do", $NC.getGridParams(G_GRDSUB1), onGetSub1);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUB2);

  G_GRDSUB2.queryParams = $NC.getParams({
    P_PROGRAM_ID: PROGRAM_ID,
    P_CENTER_CD: CENTER_CD
  });
  $NC.serviceCall("/CS01020E/getDataSet.do", $NC.getGridParams(G_GRDSUB2), onGetSub2);
}

/**
 * 신규
 */
function _New() {

  if (G_GRDSUB1.data.getLength() === 0) {
    return;
  }

  var selectedRows = G_GRDSUB1.view.getSelectedRows();
  if (selectedRows.length === 0) {
    alert("등록할 사용자를 선택하십시오.");
    return;
  }

  var EXE_LEVEL1 = "N";
  var EXE_LEVEL2 = "N";
  var EXE_LEVEL3 = "N";
  var EXE_LEVEL4 = "N";
  var PROGRAM_ID = $NC.G_VAR.userData.P_PROGRAM_ID;

  // if ($NC.G_VAR.userData.P_PROGRAM_DIV === "E") {
  EXE_LEVEL1 = $NC.getValue("#chkExe_Level1");
  EXE_LEVEL2 = $NC.getValue("#chkExe_Level2");
  EXE_LEVEL3 = $NC.getValue("#chkExe_Level3");
  EXE_LEVEL4 = $NC.getValue("#chkExe_Level4");
  // }

  G_GRDSUB1.data.beginUpdate();
  G_GRDSUB2.data.beginUpdate();
  try {
    for ( var i in selectedRows) {
      // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
      var rowData = G_GRDSUB1.data.getItem(selectedRows[i]);
      var newRowData = {
        USER_ID: rowData.USER_ID,
        USER_NM: rowData.USER_NM,
        PROGRAM_ID: PROGRAM_ID,
        EXE_LEVEL1: EXE_LEVEL1,
        EXE_LEVEL2: EXE_LEVEL2,
        EXE_LEVEL3: EXE_LEVEL3,
        EXE_LEVEL4: EXE_LEVEL4,
        FAVORITE_YN: "N",
        id: $NC.getGridNewRowId(),
        CRUD: "C"
      };

      G_GRDSUB2.data.addItem(newRowData);

      rowData.CRUD = "D";
      G_GRDSUB1.data.updateItem(rowData.id, rowData);
    }
  } finally {
    G_GRDSUB1.data.endUpdate();
    G_GRDSUB2.data.endUpdate();
  }
  G_GRDSUB1.data.refresh();
  G_GRDSUB2.data.refresh();

  var rowCount = G_GRDSUB1.data.getLength();
  if (rowCount === 0) {
    $NC.setGridDisplayRows("#grdSub1", 0, 0);
  } else {
    $NC.setGridSelectRow(G_GRDSUB1, 0);
  }
  $NC.setGridSelectRow(G_GRDSUB2, 0);

  _Save();
}

/**
 * 저장
 */
function _Save() {

  if (G_GRDSUB2.data.getItems().length == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  // 현재 수정모드면
  if (G_GRDSUB2.view.getEditorLock().isActive()) {
    G_GRDSUB2.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDSUB2.lastRow != null) {
    if (!grdSub2OnBeforePost(G_GRDSUB2.lastRow)) {
      return;
    }
  }

  var rows = G_GRDSUB2.data.getItems();
  var rowCount = rows.length;
  var saveDS = [ ];
  // 필터링 된 데이터라 전체 데이터를 기준으로 처리
  for (var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_USER_ID: rowData.USER_ID,
        P_PROGRAM_ID: rowData.PROGRAM_ID,
        P_EXE_LEVEL1: rowData.EXE_LEVEL1,
        P_EXE_LEVEL2: rowData.EXE_LEVEL2,
        P_EXE_LEVEL3: rowData.EXE_LEVEL3,
        P_EXE_LEVEL4: rowData.EXE_LEVEL4,
        P_FAVORITE_YN: rowData.FAVORITE_YN,
        P_CRUD: rowData.CRUD
      };
      saveDS.push(saveData);
    }
  }

  if (saveDS.length > 0) {
    $NC.serviceCall("/CS01020E/saveUserProgram.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
  }
}

/**
 * 삭제
 */
function _Delete() {

  if (G_GRDSUB2.data.getLength() === 0) {
    return;
  }

  var selectedRows = G_GRDSUB2.view.getSelectedRows();
  if (selectedRows.length === 0) {
    alert("삭제할 사용자를 선택하십시오.");
    return;
  }

  G_GRDSUB1.data.beginUpdate();
  G_GRDSUB2.data.beginUpdate();
  try {
    for ( var i in selectedRows) {
      var rowDataD = G_GRDSUB2.data.getItem(selectedRows[i]);
      // 신규 데이터일 경우 그냥 삭제
      if (rowDataD.CRUD === "C" || rowDataD.CRUD === "N") {
        G_GRDSUB2.data.deleteItem(rowDataD.id);
      } else {
        rowDataD.CRUD = "D";
        G_GRDSUB2.data.updateItem(rowDataD.id, rowDataD);

        var rowsU = G_GRDSUB1.data.getItems();
        for ( var rowU in rowsU) {
          var rowDataU = rowsU[rowU];
          if (rowDataD.USER_ID === rowDataU.USER_ID) {
            rowDataU.CRUD = "R";
            rowDataU.EXIST_YN = "N";
            G_GRDSUB1.data.updateItem(rowDataU.id, rowDataU);
            break;
          }
        }
      }
    }
  } finally {
    G_GRDSUB1.data.endUpdate();
    G_GRDSUB2.data.endUpdate();
  }
  G_GRDSUB1.data.refresh();
  G_GRDSUB2.data.refresh();
  var rowCount = G_GRDSUB2.data.getLength();
  if (rowCount === 0) {
    $NC.setGridDisplayRows("#grdSub2", 0, 0);
  } else {
    $NC.setGridSelectRow(G_GRDSUB2, 0);
  }
  $NC.setGridSelectRow(G_GRDSUB1, 0);

  _Save();
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  _Inquiry();
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

  if (G_GRDSUB2.view.getEditorLock().isActive()) {
    G_GRDSUB2.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDSUB2, args.row);

  var rowData = G_GRDSUB2.data.getItem(args.row);

  // 등록 프로그램만 권한설정
  /*
  if ($NC.G_VAR.userData.P_PROGRAM_DIV !== "E") {
    if (args.cell == G_GRDSUB2.view.getColumnIndex("EXE_LEVEL1")) {
      rowData.EXE_LEVEL1 = "N";
    } else if (args.cell == G_GRDSUB2.view.getColumnIndex("EXE_LEVEL2")) {
      rowData.EXE_LEVEL2 = "N";
    } else if (args.cell == G_GRDSUB2.view.getColumnIndex("EXE_LEVEL3")) {
      rowData.EXE_LEVEL3 = "N";
    } else if (args.cell == G_GRDSUB2.view.getColumnIndex("EXE_LEVEL4")) {
      rowData.EXE_LEVEL4 = "N";
    }
    if (rowData.CRUD === "R") {
      rowData.CRUD = "U";
    }
    G_GRDSUB2.data.updateItem(rowData.id, rowData);
    // 마지막 선택 Row 수정 상태로 변경
    G_GRDSUB2.lastRowModified = true;
    return;
  }
  */

  if (args.cell == G_GRDSUB2.view.getColumnIndex("EXE_LEVEL1")) {
    rowData.EXE_LEVEL1 = args.val === "Y" ? "N" : "Y";
  } else if (args.cell == G_GRDSUB2.view.getColumnIndex("EXE_LEVEL2")) {
    rowData.EXE_LEVEL2 = args.val === "Y" ? "N" : "Y";
  } else if (args.cell == G_GRDSUB2.view.getColumnIndex("EXE_LEVEL3")) {
    rowData.EXE_LEVEL3 = args.val === "Y" ? "N" : "Y";
  } else if (args.cell == G_GRDSUB2.view.getColumnIndex("EXE_LEVEL4")) {
    rowData.EXE_LEVEL4 = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUB2.data.updateItem(rowData.id, rowData);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUB2.lastRowModified = true;
}

function grdSub1OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "USER_ID",
    field: "USER_ID",
    name: "사용자ID",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "USER_NM",
    field: "USER_NM",
    name: "사용자명",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}
function grdSub1Initialize() {

  var options = {
    multiSelect: true
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub1", {
    columns: grdSub1OnGetColumns(),
    queryId: "CS01020E.RS_SUB1",
    sortCol: "USER_ID",
    gridOptions: options,
    onFilter: grdSub1OnFilter
  });

  G_GRDSUB1.view.onSelectedRowsChanged.subscribe(grdSub1OnAfterScroll);
}

/**
 * grdSub1 데이터 필터링 이벤트
 */
function grdSub1OnFilter(item) {

  return item.CRUD !== "D" && item.EXIST_YN !== "Y";
}

function grdSub1OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUB1.lastRow != null) {
    if (row == G_GRDSUB1.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
    if ($NC.isNull(row)) {
      e.stopImmediatePropagation();
      $NC.setGridSelectRow(G_GRDSUB1, G_GRDSUB1.lastRow);
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub1", row + 1);
}

function grdSub2OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "USER_ID",
    field: "USER_ID",
    name: "사용자ID",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "USER_NM",
    field: "USER_NM",
    name: "사용자명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "EXE_LEVEL1",
    field: "EXE_LEVEL1",
    name: "저장권한",
    minWidth: 80,
    maxWidth: 80,
    resizable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "EXE_LEVEL2",
    field: "EXE_LEVEL2",
    name: "삭제권한",
    minWidth: 80,
    maxWidth: 80,
    resizable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "EXE_LEVEL3",
    field: "EXE_LEVEL3",
    name: "확정권한",
    minWidth: 80,
    maxWidth: 80,
    resizable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "EXE_LEVEL4",
    field: "EXE_LEVEL4",
    name: "취소권한",
    minWidth: 80,
    maxWidth: 80,
    resizable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}
function grdSub2Initialize() {

  var options = {
    multiSelect: true
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub2", {
    columns: grdSub2OnGetColumns(),
    queryId: "CS01020E.RS_SUB2",
    sortCol: "USER_ID",
    gridOptions: options,
    onFilter: grdSub2OnFilter
  });

  G_GRDSUB2.view.onSelectedRowsChanged.subscribe(grdSub2OnAfterScroll);
  G_GRDSUB2.view.onBeforeEditCell.subscribe(grdSub2OnBeforeEditCell);
  G_GRDSUB2.view.onCellChange.subscribe(grdSub2OnCellChange);
}

/**
 * grdSub2 데이터 필터링 이벤트
 */
function grdSub2OnFilter(item) {

  return item.CRUD !== "D";
}

function grdSub2OnNewRecord(args) {

  $NC.setFocusGrid(G_GRDSUB2, args.row, G_GRDSUB2.view.getColumnIndex("ITEM_CD"), true);
}

function grdSub2OnBeforeEditCell(e, args) {

  return true;
}

function grdSub2OnCellChange(e, args) {

  var rowData = args.item;

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUB2.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUB2.lastRowModified = true;
}

function grdSub2OnBeforePost(row) {

  if (!G_GRDSUB2.lastRowModified) {
    return true;
  }

  /*
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    
  }
  
  if (rowData.CRUD != "R") {
    
  }
  */

  return true;
}

function grdSub2OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUB2.lastRow != null) {
    if (row == G_GRDSUB2.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdSub2OnBeforePost(G_GRDSUB2.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }

    // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
    if ($NC.isNull(row)) {
      e.stopImmediatePropagation();
      $NC.setGridSelectRow(G_GRDSUB2, G_GRDSUB2.lastRow);
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub2", row + 1);
}

function onGetSub1(ajaxData) {

  $NC.setInitGridData(G_GRDSUB1, ajaxData);
  if (G_GRDSUB1.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDSUB1, 0);
  } else {
    $NC.setGridDisplayRows("#grdSub1", 0, 0);
  }
}

function onGetSub2(ajaxData) {

  $NC.setInitGridData(G_GRDSUB2, ajaxData);
  if (G_GRDSUB2.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDSUB2, 0);
  } else {
    $NC.setGridDisplayRows("#grdSub2", 0, 0);
  }
}

function onSave(ajaxData) {

  _Inquiry();
}