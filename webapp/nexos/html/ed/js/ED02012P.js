/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null
  });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel); // 닫기버튼
  $("#btnEntry").click(onBtnEntryClick); // 수신체크 등록버튼
  $("#btnDelete").click(onBtnDeleteClick); // 수신체크 삭제버튼
}

function _SetResizeOffset() {

  // 화면 리사이즈 Offset 계산
  $NC.G_OFFSET.buttonHeight = $("#divButton").outerHeight(true);
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  var container = $("#divSplitterArea");
  $NC.resizeContainer(container, clientWidth, clientHeight);

  var splitTopAreaHeight = $("#grdMaster").parent().height();
  splitTopAreaHeight = splitTopAreaHeight < 200 ? 200 : splitTopAreaHeight;

  var height = splitTopAreaHeight - $NC.G_LAYOUT.header;
  var width = clientWidth;

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", width, height);

  var splitBottomAreaHeight = $("#grdDetail").parent().height();
  height = splitBottomAreaHeight - $NC.G_LAYOUT.header - $NC.G_OFFSET.buttonHeight;

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", width, height);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  // 스플리터 초기화
  $NC.setInitSplitter("#divSplitterArea", "h", 200, 100, 150);

  // 수신체크 세팅
  var masterDS = $NC.G_VAR.userData.P_MASTER_DS;
  var rowData;
  G_GRDMASTER.data.beginUpdate();
  try {
    for ( var row in masterDS) {
      rowData = masterDS[row];
      var newRowData = {
        BU_CD: rowData.BU_CD,
        EDI_DIV: rowData.EDI_DIV,
        DEFINE_NO: rowData.DEFINE_NO,
        CHECK_NO: rowData.CHECK_NO,
        CHECK_NM: rowData.CHECK_NM,
        REMARK1: rowData.REMARK1,
        id: $NC.getGridNewRowId(),
        CRUD: "R"
      };
      G_GRDMASTER.data.addItem(newRowData);
    }
  } finally {
    G_GRDMASTER.data.endUpdate();
  }

  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

  var EDI_DIV = $NC.G_VAR.userData.P_EDI_DIV;
  // 데이터 조회
  $NC.serviceCall("/ED02010E/getDataSet.do", {
    P_QUERY_ID: "ED02010E.RS_SUB4",
    P_QUERY_PARAMS: $NC.getParams({
      P_EDI_DIV: EDI_DIV
    })
  }, onGetDetail);

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
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

}

/**
 * 조회
 */
function _Inquiry() {

}

/**
 * 신규
 */
function _New() {

}

/**
 * 저장
 */
function _Save() {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  var masterDS = [ ];
  var rows = G_GRDMASTER.data.getItems();
  var rowCount = rows.length;
  for (var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_BU_CD: rowData.BU_CD,
        P_EDI_DIV: rowData.EDI_DIV,
        P_DEFINE_NO: rowData.DEFINE_NO,
        P_CHECK_NO: rowData.CHECK_NO,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      masterDS.push(saveData);
    }
  }

  $NC.serviceCall("/ED02010E/saveBuCheck.do", {
    P_DS_MASTER: $NC.toJson(masterDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

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

  if (args.cell == gridDataset.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  gridDataset.data.updateItem(rowData.id, rowData);
}

function grdMasterOnGetColumns() {

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
  }, false);
  $NC.setGridColumn(columns, {
    id: "CHECK_NO",
    field: "CHECK_NO",
    name: "수신체크번호",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CHECK_NM",
    field: "CHECK_NM",
    name: "수신체크명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 400,
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdMasterInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "ED02010E.RS_SUB2",
    sortCol: "CHECK_NO",
    gridOptions: options
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
  G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
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
}

function grdMasterOnHeaderClick(e, args) {

  G_GRDMASTER.view.getCanvasNode().focus();

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDMASTER.data.getLength();
      var rowData;
      G_GRDMASTER.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDMASTER.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDMASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTER.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

function grdMasterOnClick(e, args) {

  G_GRDMASTER.view.getCanvasNode().focus();

  if (args.cell === G_GRDMASTER.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDMASTER.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {
        rowData.CHECK_YN = checkVal;
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
      }
    }
  }
}

function grdDetailOnGetColumns() {

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
    id: "CHECK_NO",
    field: "CHECK_NO",
    name: "수신체크번호",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CHECK_NM",
    field: "CHECK_NM",
    name: "수신체크명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 400,
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "ED02010E.RS_SUB4",
    sortCol: "CHECK_NO",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onHeaderClick.subscribe(grdDetailOnHeaderClick);
  G_GRDDETAIL.view.onClick.subscribe(grdDetailOnClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDDETAIL, "CHECK_YN");
}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
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

function grdDetailOnHeaderClick(e, args) {

  G_GRDDETAIL.view.getCanvasNode().focus();

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDDETAIL.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDDETAIL.data.getLength();
      var rowData;
      G_GRDDETAIL.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDDETAIL.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDDETAIL.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

function grdDetailOnClick(e, args) {

  G_GRDDETAIL.view.getCanvasNode().focus();

  if (args.cell === G_GRDDETAIL.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDDETAIL.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {
        rowData.CHECK_YN = checkVal;
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
      }
    }
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

function onBtnEntryClick() {

  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }

  // var rowCountM = G_GRDMASTER.data.getLength();
  var rowCount = G_GRDDETAIL.data.getLength();
  var checkCount = 0;

  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      checkCount++;
      if ($NC.getGridSearchVal(G_GRDMASTER, {
        searchKey: "CHECK_NO",
        searchVal: rowData.CHECK_NO
      }) > -1) {
        continue;
      }

      var newRowData = {
        BU_CD: $NC.G_VAR.userData.P_BU_CD,
        EDI_DIV: $NC.G_VAR.userData.P_EDI_DIV,
        DEFINE_NO: $NC.G_VAR.userData.P_DEFINE_NO,
        CHECK_NO: rowData.CHECK_NO,
        CHECK_NM: rowData.CHECK_NM,
        REMARK1: rowData.REMARK1,
        id: $NC.getGridNewRowId(),
        CRUD: "C"
      };
      G_GRDMASTER.data.addItem(newRowData);
    }
  }

  if (checkCount == 0) {
    alert("정의된 수신체크내역을 1건 이상 선택해주십시요.");
    return;
  }

  _Save();
}

function onBtnDeleteClick() {

  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }

  var rowCount = G_GRDMASTER.data.getLength();
  var checkCount = 0;

  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      checkCount++;

      rowData.CRUD = "D";
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
    }
  }

  if (checkCount == 0) {
    alert("수신체크를 1건 이상 선택해주십시요.");
    return;
  }
  _Save();
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  onClose();
}
