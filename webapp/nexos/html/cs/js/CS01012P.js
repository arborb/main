/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 버튼 클릭 이벤트 연결
  $("#btnCancel").click(onCancel);
  $("#btnSave").click(_Save);
  $("#btnDeleteUser").click(_Delete);
  $("#btnAddUser").click(_New);

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtQUser_Id", $NC.G_VAR.userData.P_USER_ID);
  $NC.setValue("#edtQUser_Nm", $NC.G_VAR.userData.P_USER_NM);

  _Inquiry();
}

/**
 * 화면 리사이즈 Offset 계산
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
  var clientHeight = parent.height() - $NC.G_LAYOUT.border1 - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divSubView", clientWidth, clientHeight);

  clientWidth = $NC.G_OFFSET.fixedLeftWidth;
  clientHeight -= $NC.G_LAYOUT.border1;
  $NC.resizeContainer("#divLeftView", clientWidth, clientHeight);

  // Grid 높이 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
  // 컬럼 헤더 숨김으로 사이즈 재조정...
  $("#grdMaster .slick-viewport").css({
    "height": clientHeight - $NC.G_LAYOUT.header
  });
  $("#grdMaster .slick-pane-top").css({
    "height": clientHeight - $NC.G_LAYOUT.header
  });

  clientWidth = $NC.G_OFFSET.fixedCenterWidth - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.border1;
  $NC.resizeContainer("#divCenterView", clientWidth, clientHeight);

  clientWidth = parent.width()
      - ($NC.G_OFFSET.fixedLeftWidth + $NC.G_OFFSET.fixedCenterWidth + $NC.G_LAYOUT.border1 + $NC.G_LAYOUT.margin1);
  $NC.resizeContainer("#divRightView", clientWidth, clientHeight);

  clientHeight -= $NC.G_LAYOUT.header;

  // Grid 높이 조정
  $NC.resizeGrid("#grdDetail", clientWidth, clientHeight);
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


function _Inquiry1() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL);

  var USER_ID = $NC.getValue("#edtQUser_Id");

  
  G_GRDDETAIL.queryParams = $NC.getParams({
    P_USER_ID: USER_ID
  });

  $NC.serviceCall("/CS01010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
}

function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  $NC.setInitGridVar(G_GRDDETAIL);

  var USER_ID = $NC.getValue("#edtQUser_Id");
  
  G_GRDMASTER.queryParams = $NC.getParams({
    P_USER_ID: USER_ID
  });
  
  // Master 데이터 조회
  $NC.serviceCall("/CS01020E/getProgramMenu.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

  G_GRDDETAIL.queryParams = $NC.getParams({
    P_USER_ID: USER_ID
  });

  $NC.serviceCall("/CS01010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
}

/**
 * 신규
 */
function _New() {

  if (G_GRDMASTER.data.getLength() === 0) {
    return;
  }

  var selectedRows = G_GRDMASTER.view.getSelectedRows();
  if (selectedRows.length === 0) {
    alert("등록할 프로그램를 선택하십시오.");
    return;
  }

  var EXE_LEVEL1 = $NC.getValue("#chkExe_Level1");
  var EXE_LEVEL2 = $NC.getValue("#chkExe_Level2");
  var EXE_LEVEL3 = $NC.getValue("#chkExe_Level3");
  var EXE_LEVEL4 = $NC.getValue("#chkExe_Level4");

  var detailRowCount;
  var canAdd = false;
  var masterRowData;
  var detailRowData;
  G_GRDDETAIL.data.beginUpdate();
  try {
    var USER_ID = $NC.getValue("#edtQUser_Id");

    for (i in selectedRows) {
      canAdd = true;
      masterRowData = G_GRDMASTER.data.getItem(selectedRows[i]);
      if (masterRowData.PROGRAM_ID === "MENU") {
        canAdd = false;
      } else {
        // 메뉴이면서 접혀 있으면 addSubProgramMenu 에서 처리
        if (masterRowData.PROGRAM_DIV == "M" && masterRowData._collapsed) {
          addSubProgramMenu(USER_ID, masterRowData, EXE_LEVEL1, EXE_LEVEL2, EXE_LEVEL3, EXE_LEVEL4);
          canAdd = false;
        } else {
          detailRowCount = G_GRDDETAIL.data.getLength();
          for (var j = 0; j < detailRowCount; j++) {
            detailRowData = G_GRDDETAIL.data.getItem(j);
            if (detailRowData.PROGRAM_ID === masterRowData.PROGRAM_ID) {
              // alert("이미 등록되어 있는 프로그램입니다.");
              // return;
              canAdd = false;
              break;
            }
          }
        }
      }
      if (!canAdd) {
        continue;
      }

      var newRowData;
      /*
      if (masterRowData.PROGRAM_DIV != "E") {
        newRowData = {
          USER_ID: USER_ID,
          PROGRAM_ID: masterRowData.PROGRAM_ID,
          PROGRAM_NM: masterRowData.PROGRAM_NM,
          EXE_LEVEL1: "N",
          EXE_LEVEL2: "N",
          EXE_LEVEL3: "N",
          EXE_LEVEL4: "N",
          FAVORITE_YN: "N",
          id: $NC.getGridNewRowId(),
          CRUD: "C"
        };
      } else {
      */
      newRowData = {
        USER_ID: USER_ID,
        PROGRAM_ID: masterRowData.PROGRAM_ID,
        PROGRAM_NM: masterRowData.PROGRAM_NM,
        EXE_LEVEL1: EXE_LEVEL1,
        EXE_LEVEL2: EXE_LEVEL2,
        EXE_LEVEL3: EXE_LEVEL3,
        EXE_LEVEL4: EXE_LEVEL4,
        FAVORITE_YN: "N",
        id: $NC.getGridNewRowId(),
        CRUD: "C"
      };
      // }
      G_GRDDETAIL.data.addItem(newRowData);
    }
  } finally {
    G_GRDDETAIL.data.endUpdate();
  }
  G_GRDDETAIL.data.refresh();

  $NC.setGridSelectRow(G_GRDDETAIL, 0);

  _Save();
}

/**
 * 저장
 */
function _Save() {
/*
  if (G_GRDDETAIL.data.getItems().length == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }
*/
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

  var rows = G_GRDDETAIL.data.getItems();
  var rowCount = rows.length;
  var saveDS = [ ];
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
    $NC.serviceCall("/CS01010E/saveUserProgram.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_REG_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
  }
}

/**
 * 삭제
 */
function _Delete() {

  if (G_GRDDETAIL.data.getLength() === 0) {
    return;
  }

  var selectedRows = G_GRDDETAIL.view.getSelectedRows();
  if (selectedRows.length === 0) {
    alert("삭제할 프로그램을 선택하십시오.");
    return;
  }

  G_GRDDETAIL.data.beginUpdate();
  try {
    for ( var i in selectedRows) {
      var rowDataD = G_GRDDETAIL.data.getItem(selectedRows[i]);
      // 신규 데이터일 경우 그냥 삭제
      if (rowDataD.CRUD === "C" || rowDataD.CRUD === "N") {
        G_GRDDETAIL.data.deleteItem(rowDataD.id);
      } else {
        rowDataD.CRUD = "D";
        G_GRDDETAIL.data.updateItem(rowDataD.id, rowDataD);
      }
    }
  } finally {
    G_GRDDETAIL.data.endUpdate();
  }

  G_GRDDETAIL.data.refresh();

  var rowCount = G_GRDDETAIL.data.getLength();
  if (rowCount === 0) {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  } else {
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

  _Save();
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  _Inquiry();
}

function addSubProgramMenu(user_Id, rowData, Exe_Level1, Exe_Level2, Exe_Level3, Exe_Level4) {

  // 현재 메뉴 데이터 처리
  var detailRowCount = G_GRDDETAIL.data.getLength();
  var canAdd = true;
  var detailRowData;
  var newRowData;
  for (var j = 0; j < detailRowCount; j++) {
    detailRowData = G_GRDDETAIL.data.getItem(j);
    if (detailRowData.PROGRAM_ID === rowData.PROGRAM_ID) {
      canAdd = false;
      break;
    }
  }
  if (canAdd) {
    newRowData = {
      USER_ID: user_Id,
      PROGRAM_ID: rowData.PROGRAM_ID,
      PROGRAM_NM: rowData.PROGRAM_NM,
      EXE_LEVEL1: "N",
      EXE_LEVEL2: "N",
      EXE_LEVEL3: "N",
      EXE_LEVEL4: "N",
      FAVORITE_YN: "N",
      id: $NC.getGridNewRowId(),
      CRUD: "C"
    };
    G_GRDDETAIL.data.addItem(newRowData);
  }

  // 하위 메뉴 처리
  var masterRows = G_GRDMASTER.data.getItems();
  var masterRowCount = masterRows.length;
  var masterRowData;
  var startRow;
  // 전체 데이터에서 현재 데이터 위치
  for (var i = 0; i < masterRowCount; i++) {
    masterRowData = masterRows[i];
    if (rowData.PROGRAM_ID === masterRowData.PROGRAM_ID) {
      startRow = i;
      break;
    }
  }
  // 현재 데이터 위치부터 1단계 하위 메뉴 추가
  var checkIndent = (Number(rowData.indent) + 1).toString();
  if (!$NC.isNull(startRow)) {
    for (var i = startRow + 1; i < masterRowCount; i++) {
      masterRowData = masterRows[i];
      // 하위 단계 메뉴면 다음
      if (masterRowData.indent > checkIndent) {
        continue;
      }
      // 상위 단계 메뉴면 멈춤
      if (masterRowData.indent < checkIndent) {
        break;
      }

      // 메뉴이면서 접혀 있으면 addSubProgramMenu 에서 처리
      canAdd = true;
      if (masterRowData.PROGRAM_DIV == "M" && masterRowData._collapsed) {
        addSubProgramMenu(user_Id, masterRowData, Exe_Level1, Exe_Level2, Exe_Level3, Exe_Level4);
        canAdd = false;
      } else {
        detailRowCount = G_GRDDETAIL.data.getLength();
        for (var j = 0; j < detailRowCount; j++) {
          detailRowData = G_GRDDETAIL.data.getItem(j);
          if (detailRowData.PROGRAM_ID === masterRowData.PROGRAM_ID) {
            canAdd = false;
            break;
          }
        }
      }
      if (!canAdd) {
        continue;
      }

      /*
      if (masterRowData.PROGRAM_DIV != "E") {
        newRowData = {
          USER_ID: user_Id,
          PROGRAM_ID: masterRowData.PROGRAM_ID,
          PROGRAM_NM: masterRowData.PROGRAM_NM,
          EXE_LEVEL1: "N",
          EXE_LEVEL2: "N",
          EXE_LEVEL3: "N",
          EXE_LEVEL4: "N",
          FAVORITE_YN: "N",
          id: $NC.getGridNewRowId(),
          CRUD: "C"
        };
      } else {
      */
      newRowData = {
        USER_ID: user_Id,
        PROGRAM_ID: masterRowData.PROGRAM_ID,
        PROGRAM_NM: masterRowData.PROGRAM_NM,
        EXE_LEVEL1: Exe_Level1,
        EXE_LEVEL2: Exe_Level2,
        EXE_LEVEL3: Exe_Level3,
        EXE_LEVEL4: Exe_Level4,
        FAVORITE_YN: "N",
        id: $NC.getGridNewRowId(),
        CRUD: "C"
      };
      // }
      G_GRDDETAIL.data.addItem(newRowData);
    }
  }
}

/**
 * grdMaster 데이터 필터링 이벤트
 */
function grdMasterOnFilter(item) {
  if (!$NC.isNull(item.parent)) {
    var rows = G_GRDMASTER.data.getItems();
    var parent = rows[G_GRDMASTER.data.getIdxById(item.parent)];
    while (!$NC.isNull(parent)) {
      if (parent._collapsed) {
        return false;
      }
      parent = rows[G_GRDMASTER.data.getIdxById(parent.parent)];
    }
  }
  return true;
}

function grdMasterOnGetColumns() {
  var groupFormatter = function(row, cell, value, columnDef, dataContext) {
    var spacer = "<span style='display:inline-block;height:1px;width:" + (15 * dataContext["indent"]) + "px'></span>";
    if (dataContext.PROGRAM_DIV === "M") {
      if (dataContext._collapsed) {
        return spacer + " <span class='slick-group-toggle collapsed' style='cursor: pointer;'></span>&nbsp;" + value;
      } else {
        return spacer + " <span class='slick-group-toggle expanded' style='cursor: pointer;'></span>&nbsp;" + value;
      }
    } else {
      return spacer + " <span class='slick-group-toggle" + " ui-icon-" + dataContext.PROGRAM_DIV.toLowerCase()
          + "'></span>&nbsp;" + value;
    }
  };

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "PROGRAM_NM",
    field: "PROGRAM_NM",
    name: "프로그램명",
    width: $NC.G_OFFSET.fixedLeftWidth,
    formatter: groupFormatter
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    multiSelect: true
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CS01020E.RS_MASTER1",
    sortCol: "PROGRAM_ID",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);

  // Grid 클릭 이벤트
  G_GRDMASTER.view.onClick.subscribe(function(e, args) {
    var rowData = G_GRDMASTER.data.getItem(args.row);
    if (rowData) {
      if ($(e.target).hasClass("slick-group-toggle")) {
        // 메뉴
        if (rowData.PROGRAM_DIV === "M") {
          if (!rowData._collapsed) {
            rowData._collapsed = true;
          } else {
            rowData._collapsed = false;
          }

          G_GRDMASTER.data.updateItem(rowData.id, rowData);

          $NC.setGridSelectRow(G_GRDMASTER, args.row);

          e.stopImmediatePropagation();
          return;
        }
      }
    }
  });

  // Grid 더블클릭 이벤트
  G_GRDMASTER.view.onDblClick.subscribe(function(e, args) {
    var rowData = G_GRDMASTER.data.getItem(args.row);
    if (rowData) {
      if ($(e.target).hasClass("slick-cell")) {
        // 메뉴
        if (rowData.PROGRAM_DIV === "M") {
          if (!rowData._collapsed) {
            rowData._collapsed = true;
          } else {
            rowData._collapsed = false;
          }

          G_GRDMASTER.data.updateItem(rowData.id, rowData);

          e.stopImmediatePropagation();
          return;
        }
      }
    }
  });

  // Grid 컬럼 헤더 숨김
  $NC.hideGridColumnHeader("#grdMaster");
  // Grid 가로 스크롤바 숨김
  $NC.hideGridHorzScroller("#grdMaster");
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  G_GRDMASTER.lastRow = row;
  G_GRDMASTER.lastRowModified = false;
}

/**
 * 프로그램 메뉴 조회 완료 후.
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData, grdMasterOnFilter);

  if (G_GRDMASTER.data.getLength() > 0) {

    var rowData = G_GRDMASTER.data.getItem(0);
    if (rowData) {
      // 프로그램 메뉴 펼침
      if (rowData.PROGRAM_ID === "MENU") {
        rowData._collapsed = false;

        G_GRDMASTER.data.updateItem(rowData.id, rowData);
      }
    }
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "PROGRAM_ID",
        selectVal: G_GRDMASTER.lastKeyVal,
        activeCell: 0
      });
    }
  }
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "PROGRAM_ID",
    field: "PROGRAM_ID",
    name: "프로그램ID",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "PROGRAM_NM",
    field: "PROGRAM_NM",
    name: "프로그램명",
    minWidth: 165
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

function grdDetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    multiSelect: true
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "CS01010E.RS_SUB3",
    sortCol: "PROGRAM_ID",
    gridOptions: options,
    onFilter: grdDetailOnFilter
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

/**
 * grdDetail 데이터 필터링 이벤트
 */
function grdDetailOnFilter(item) {
  return item.CRUD !== "D";
}

function grdDetailOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
}

function grdDetailOnBeforeEditCell(e, args) {

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

function grdDetailOnAfterScroll(e, args) {

  // 다중 선택 시 change Event 종료.
  if (args.rows.length > 1) {
    e.stopImmediatePropagation();
    return;
  }

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

    // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
    if ($NC.isNull(row)) {
      e.stopImmediatePropagation();
      $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.lastRow);
      return;
    }
  }

  var rowData = G_GRDDETAIL.data.getItem(row);
  var PROGRAM_DIV = rowData.PROGRAM_DIV;

  // 프로그램 메뉴 선택 시 해당 프로그램 멀티 선택처리.
  if (PROGRAM_DIV === "M") {
    var PROGRAM_GRP1 = rowData.PROGRAM_GRP1;
    var PROGRAM_GRP2 = rowData.PROGRAM_GRP2;
    var PROGRAM_GRP3 = rowData.PROGRAM_GRP3;
    var PROGRAM_GRP4 = rowData.PROGRAM_GRP4;
    var MENU_INDENT = rowData.MENU_INDENT;
    var selectedRows = [ ];

    var rowCount = G_GRDDETAIL.data.getLength();
    var checkRowData;
    for (var i = 0; i < rowCount; i++) {
      checkRowData = G_GRDDETAIL.data.getItem(i);
      switch (MENU_INDENT) {
      case "1": // 1단계 메뉴
        if (checkRowData.PROGRAM_GRP1 == PROGRAM_GRP1) {
          selectedRows.push(i);
        }
        break;
      case "2": // 2단계 메뉴
        if (checkRowData.PROGRAM_GRP1 == PROGRAM_GRP1 && checkRowData.PROGRAM_GRP2 == PROGRAM_GRP2) {
          selectedRows.push(i);
        }
      case "3": // 3단계 메뉴
        if (checkRowData.PROGRAM_GRP1 == PROGRAM_GRP1 && checkRowData.PROGRAM_GRP2 == PROGRAM_GRP2
            && checkRowData.PROGRAM_GRP3 == PROGRAM_GRP3) {
          selectedRows.push(i);
        }
        break;
      /*  
      case "4": // 4단계 메뉴
        if (checkRowData.PROGRAM_GRP1 == PROGRAM_GRP1 && checkRowData.PROGRAM_GRP2 == PROGRAM_GRP2 && checkRowData.PROGRAM_GRP3 == PROGRAM_GRP3 && checkRowData.PROGRAM_GRP4 == PROGRAM_GRP4) {
          selectedRows.push(i);
        }
        break;
        */
      }
    }
    if (selectedRows.length > 1) {
      G_GRDDETAIL.view.setSelectedRows(selectedRows);
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
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

  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDDETAIL, args.row);

  var rowData = G_GRDDETAIL.data.getItem(args.row);

  // 등록 프로그램만 권한설정
  /*
  if (rowData.PROGRAM_DIV !== "E") {
    if (args.cell == G_GRDDETAIL.view.getColumnIndex("EXE_LEVEL1")) {
      rowData.EXE_LEVEL1 = "N";
    } else if (args.cell == G_GRDDETAIL.view.getColumnIndex("EXE_LEVEL2")) {
      rowData.EXE_LEVEL2 = "N";
    } else if (args.cell == G_GRDDETAIL.view.getColumnIndex("EXE_LEVEL3")) {
      rowData.EXE_LEVEL3 = "N";
    } else if (args.cell == G_GRDDETAIL.view.getColumnIndex("EXE_LEVEL4")) {
      rowData.EXE_LEVEL4 = "N";
    }
    if (rowData.CRUD === "R") {
      rowData.CRUD = "U";
    }
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
    // 마지막 선택 Row 수정 상태로 변경
    G_GRDDETAIL.lastRowModified = true;
    return;
  }
  */

  if (args.cell == G_GRDDETAIL.view.getColumnIndex("EXE_LEVEL1")) {
    rowData.EXE_LEVEL1 = args.val === "Y" ? "N" : "Y";
  } else if (args.cell == G_GRDDETAIL.view.getColumnIndex("EXE_LEVEL2")) {
    rowData.EXE_LEVEL2 = args.val === "Y" ? "N" : "Y";
  } else if (args.cell == G_GRDDETAIL.view.getColumnIndex("EXE_LEVEL3")) {
    rowData.EXE_LEVEL3 = args.val === "Y" ? "N" : "Y";
  } else if (args.cell == G_GRDDETAIL.view.getColumnIndex("EXE_LEVEL4")) {
    rowData.EXE_LEVEL4 = args.val === "Y" ? "N" : "Y";
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
}

function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData, grdDetailOnFilter);
  if (G_GRDDETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
}

function onSave(ajaxData) {

  _Inquiry1();
}