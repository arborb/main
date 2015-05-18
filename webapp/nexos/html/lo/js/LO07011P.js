/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 탭 초기화
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 그리드 초기화
  grdMasterT1Initialize();
  grdDetailT1Initialize();

  grdMasterT2Initialize();
  grdDetailT2Initialize();

  grdMasterT3Initialize();
  grdDetailT3Initialize();

  // 버튼 클릭 이벤트 연결
  $("#btnCancel").click(onCancel); // 닫기 버튼
  $("#btnBoxDelete").click(onBtnBoxDelete); // 박스삭제 버튼 클릭
  $("#btnBoxMerge").click(onBtnBoxMerge); // 박스병합 버튼 클릭
  $("#btnSaveT2").click(_Save);
  $("#btnSaveT3").click(_Save);

  $("#btnPrintBoxLabel").click(onBtnPrintBoxLabel); // 박스라벨출력 버튼 클릭
  $("#btnPrintBoxBill").click(onBtnPrintBoxBill); // 박스내역서출력 버튼 클릭

  $NC.setEnable("#btnBoxDelete", $NC.G_VAR.userData.P_INSPECT_YN);
  $NC.setEnable("#btnBoxMerge", $NC.G_VAR.userData.P_INSPECT_YN);
  $NC.setEnable("#btnSaveT2", $NC.G_VAR.userData.P_INSPECT_YN);
  $NC.setEnable("#btnSaveT3", $NC.G_VAR.userData.P_INSPECT_YN);
  $("#divButtons").show();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  _Inquiry();

  G_GRDMASTERT1.view.focus();
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.leftViewWidth = 180;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.tabHeader = $("#divMasterView").children(".ui-tabs-nav:first").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1 * 2; /* 탭일 경우는 좌우 */
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientHeight -= $NC.G_OFFSET.tabHeader + $NC.G_LAYOUT.border1;

  var tabIndex = $("#divMasterView").tabs("option", "active");
  if (tabIndex === 0) {

    $NC.G_OFFSET.leftViewWidth = 240;
    clientWidth -= $NC.G_OFFSET.leftViewWidth + $NC.G_LAYOUT.nonClientWidth;

    $NC.resizeContainer("#divLeftViewT1", $NC.G_OFFSET.leftViewWidth, clientHeight);
    $NC.resizeContainer("#divRightViewT1", clientWidth, clientHeight);
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterT1", $NC.G_OFFSET.leftViewWidth, clientHeight - $NC.G_LAYOUT.header);
    $NC.resizeGrid("#grdDetailT1", clientWidth, clientHeight - $NC.G_LAYOUT.header);
    return;

  }

  if (tabIndex === 1) {

    $NC.G_OFFSET.leftViewWidth = 510;
    clientWidth -= $NC.G_OFFSET.leftViewWidth + $NC.G_LAYOUT.nonClientWidth;

    $NC.resizeContainer("#divLeftViewT2", $NC.G_OFFSET.leftViewWidth, clientHeight);
    $NC.resizeContainer("#divRightViewT2", clientWidth, clientHeight);
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterT2", $NC.G_OFFSET.leftViewWidth, clientHeight - $NC.G_LAYOUT.header);
    $NC.resizeGrid("#grdDetailT2", clientWidth, clientHeight - $NC.G_LAYOUT.header);
    return;
  }

  $NC.G_OFFSET.leftViewWidth = 200;
  clientWidth -= $NC.G_OFFSET.leftViewWidth + $NC.G_LAYOUT.nonClientWidth;

  $NC.resizeContainer("#divLeftViewT3", $NC.G_OFFSET.leftViewWidth, clientHeight);
  $NC.resizeContainer("#divRightViewT3", clientWidth, clientHeight);
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMasterT3", $NC.G_OFFSET.leftViewWidth, clientHeight - $NC.G_LAYOUT.header);
  $NC.resizeGrid("#grdDetailT3", clientWidth, clientHeight - $NC.G_LAYOUT.header);

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var CENTER_CD = $NC.G_VAR.userData.P_CENTER_CD;
  var BU_CD = $NC.G_VAR.userData.P_BU_CD;
  var OUTBOUND_DATE = $NC.G_VAR.userData.P_OUTBOUND_DATE;
  var OUTBOUND_NO = $NC.G_VAR.userData.P_OUTBOUND_NO;

  var queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: OUTBOUND_DATE,
    P_OUTBOUND_NO: OUTBOUND_NO
  });

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERT1, "CHECK_YN");
  $NC.setInitGridVar(G_GRDMASTERT1);
  // 파라메터 세팅
  G_GRDMASTERT1.queryParams = queryParams;
  // 데이터 조회
  $NC.serviceCall("/LO07010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERT1), onGetMasterT1);

  $NC.setInitGridVar(G_GRDDETAILT1);
  // 파라메터 세팅
  G_GRDDETAILT1.queryParams = queryParams;
  // 데이터 조회
  $NC.serviceCall("/LO07010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILT1), onGetDetailT1);

  $NC.setInitGridVar(G_GRDMASTERT2);
  // 파라메터 세팅
  G_GRDMASTERT2.queryParams = queryParams;
  // 데이터 조회
  $NC.serviceCall("/LO07010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERT2), onGetMasterT2);

  $NC.setInitGridVar(G_GRDDETAILT2);
  // 파라메터 세팅
  G_GRDDETAILT2.queryParams = queryParams;
  // 데이터 조회
  $NC.serviceCall("/LO07010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILT2), onGetDetailT2);

  $NC.setInitGridVar(G_GRDMASTERT3);
  // 파라메터 세팅
  G_GRDMASTERT3.queryParams = queryParams;
  // 데이터 조회
  $NC.serviceCall("/LO07010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERT3), onGetMasterT3);

  $NC.setInitGridVar(G_GRDDETAILT3);
  // 파라메터 세팅
  G_GRDDETAILT3.queryParams = queryParams;
  // 데이터 조회
  $NC.serviceCall("/LO07010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILT3), onGetDetailT3);
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

  var grdObject;
  var tabIndex = $("#divMasterView").tabs("option", "active");

  if (tabIndex === 1) {

    // 현재 수정모드면
    if (G_GRDDETAILT2.view.getEditorLock().isActive()) {
      G_GRDDETAILT2.view.getEditorLock().commitCurrentEdit();
    }

    // 현재 선택된 로우 Validation 체크
    if (G_GRDDETAILT2.lastRow != null) {
      if (!grdDetailT2OnBeforePost(G_GRDDETAILT2.lastRow)) {
        return;
      }
    }
    grdObject = G_GRDDETAILT2;

  } else if (tabIndex === 2) {

    // 현재 수정모드면
    if (G_GRDDETAILT3.view.getEditorLock().isActive()) {
      G_GRDDETAILT3.view.getEditorLock().commitCurrentEdit();
    }

    // 현재 선택된 로우 Validation 체크
    if (G_GRDDETAILT3.lastRow != null) {
      if (!grdDetailT3OnBeforePost(G_GRDDETAILT3.lastRow)) {
        return;
      }
    }
    grdObject = G_GRDDETAILT3;

  } else {
    return;
  }

  var detailDS = [ ];
  var masterDS = [ ];
  var rows = grdObject.data.getItems();
  var rowCount = rows.length;
  var rowData;
  // 필터링 된 데이터라 전체 데이터를 기준으로 처리
  for (var i = 0; i < rowCount; i++) {
    rowData = rows[i];
    if (rowData.CRUD == "U") {
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_BOX_NO: rowData.BOX_NO,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_CONFIRM_QTY: rowData.CONFIRM_QTY
      };

      detailDS.push(saveData);
      masterDS.push(saveData);
    }
  }

  if (detailDS.length === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LO07010E/save.do", {
    P_DS_MASTER: $NC.getParams({
      P_CENTER_CD: "",
      P_BU_CD: "",
      P_OUTBOUND_DATE: "",
      P_OUTBOUND_NO: "",
      P_BOX_NO: "",
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }),
    P_DS_DETAIL: $NC.toJson(detailDS),
    P_PROCESS_CD: "N"
  }, onSave);
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
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

  $NC.setPopupCloseAction("CANCEL");
  $NC.onPopupClose();
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

  if (args.grid == "grdMasterT1") {

    if (G_GRDMASTERT1.view.getEditorLock().isActive()) {
      G_GRDMASTERT1.view.getEditorLock().commitCurrentEdit();
    }

    $NC.setGridSelectRow(G_GRDMASTERT1, args.row);

    var rowData = G_GRDMASTERT1.data.getItem(args.row);

    if (args.cell == G_GRDMASTERT1.view.getColumnIndex("CHECK_YN")) {
      rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
    }

    G_GRDMASTERT1.data.updateItem(rowData.id, rowData);
  }
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

  var id = ui.newTab.prop("id").substr(3).toUpperCase();
  $NC.G_VAR.activeTabName = "T" + id.substr(3);

  _OnResize($(window));

  if ($("#divMasterView").tabs("option", "active") === 0) {
    $("#divButtons").show();
  } else {
    $("#divButtons").hide();
  }
}

function onGetMasterT1(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERT1, ajaxData);

  if (G_GRDMASTERT1.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTERT1.lastRow)) {
      $NC.setGridSelectRow(G_GRDMASTERT1, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERT1, G_GRDMASTERT1.lastRow);
    }

  } else {
    $NC.setGridDisplayRows("#grdMasterT1", 0, 0);
  }
}

/**
 * 박스관리탭의 상품별 박스내역 그리드 초기값 설정
 */
function grdMasterT1OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 60,
    maxWidth: 60,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "BOX_NO",
    field: "BOX_NO",
    name: "박스번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BOXING_YN",
    field: "BOXING_YN",
    name: "박스완료여부",
    minWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterT1Initialize() {

  var options = {
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.BOXING_YN === "N") {
          return "specialrow4";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterT1", {
    columns: grdMasterT1OnGetColumns(),
    queryId: "LO07010E.RS_T1_MASTER",
    sortCol: "BOX_NO",
    gridOptions: options
  });

  G_GRDMASTERT1.view.onSelectedRowsChanged.subscribe(grdMasterT1OnAfterScroll);
  G_GRDMASTERT1.view.onHeaderClick.subscribe(grdMasterT1OnHeaderClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERT1, "CHECK_YN");
}

function grdMasterT1OnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDMASTERT1.lastRow != null) {
    if (row == G_GRDMASTERT1.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  $NC.setInitGridVar(G_GRDDETAILT1);
  G_GRDDETAILT1.lastFilterVal = G_GRDMASTERT1.data.getItem(row).BOX_NO;
  G_GRDDETAILT1.data.refresh();
  $NC.setGridSelectRow(G_GRDDETAILT1, 0);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterT1", row + 1);
}

function grdMasterT1OnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTERT1.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDMASTERT1.view.getEditorLock().isActive() && !G_GRDMASTERT1.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDMASTERT1.data.getLength();
      var rowData;
      G_GRDMASTERT1.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDMASTERT1.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDMASTERT1.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTERT1.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdDetailT1OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "기검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 박스관리탭의 상품별 검수내역 그리드 초기값 설정
 */
function grdDetailT1Initialize() {

  var options = {};

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailT1", {
    columns: grdDetailT1OnGetColumns(),
    queryId: "LO07010E.RS_T1_DETAIL",
    sortCol: "ITEM_CD",
    gridOptions: options,
  });

  G_GRDDETAILT1.view.onSelectedRowsChanged.subscribe(grdDetailT1OnAfterScroll);
}

function grdDetailT1OnFilter(item) {
  return G_GRDDETAILT1.lastFilterVal === item.BOX_NO;
}

function grdDetailT1OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAILT1.lastRow != null) {
    if (row == G_GRDDETAILT1.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailT1", row + 1);
}

/**
 * 박스관리탭의 상품내역 그리드 초기값 설정
 */
function grdMasterT2OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterT2Initialize() {

  var options = {};

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterT2", {
    columns: grdMasterT2OnGetColumns(),
    queryId: "LO07010E.RS_T2_MASTER",
    sortCol: "BOX_NO",
    gridOptions: options
  });

  G_GRDMASTERT2.view.onSelectedRowsChanged.subscribe(grdMasterT2OnAfterScroll);
}

function grdMasterT2OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERT2.lastRow != null) {
    if (row == G_GRDMASTERT2.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdDetailT2OnBeforePost(G_GRDDETAILT2.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDMASTERT2.data.getItem(row);
  var lastFilterVal = rowData.BRAND_CD + rowData.ITEM_CD + rowData.ITEM_STATE + rowData.ITEM_LOT;

  $NC.setInitGridVar(G_GRDDETAILT2);
  G_GRDDETAILT2.lastFilterVal = lastFilterVal;
  G_GRDDETAILT2.data.refresh();
  $NC.setGridSelectRow(G_GRDDETAILT2, 0);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterT2", args.rows[0] + 1);
}

function grdDetailT2OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BOX_NO",
    field: "BOX_NO",
    name: "박스번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORG_CONFIRM_QTY",
    field: "ORG_CONFIRM_QTY",
    name: "기검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    editor: Slick.Editors.Number
  });
  $NC.setGridColumn(columns, {
    id: "BOXING_YN",
    field: "BOXING_YN",
    name: "박스완료여부",
    minWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 박스관리탭의 박스별 검수내역 그리드 초기값 설정
 */
function grdDetailT2Initialize() {

  var options = {
    editable: true,
    autoEdit: true,
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.BOXING_YN === "N") {
          return "specialrow4";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailT2", {
    columns: grdDetailT2OnGetColumns(),
    queryId: "LO07010E.RS_T2_DETAIL",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDDETAILT2.view.onSelectedRowsChanged.subscribe(grdDetailT2OnAfterScroll);
  G_GRDDETAILT2.view.onBeforeEditCell.subscribe(grdDetailT2OnBeforeEditCell);
  G_GRDDETAILT2.view.onCellChange.subscribe(grdDetailT2OnCellChange);
}

function grdDetailT2OnFilter(item) {
  var lastFilterVal = item.BRAND_CD + item.ITEM_CD + item.ITEM_STATE + item.ITEM_LOT;
  return G_GRDDETAILT2.lastFilterVal === lastFilterVal;
}

function grdDetailT2OnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDDETAILT2.lastRow != null) {
    if (row == G_GRDDETAILT2.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdDetailT2OnBeforePost(G_GRDDETAILT2.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailT2", row + 1);

}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailT2OnCellChange(e, args) {

  var rowData = args.item;

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAILT2.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAILT2.lastRowModified = true;
}

function grdDetailT2OnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if ($NC.G_VAR.userData.P_INSPECT_YN == "Y") {
    return false;
  }
  return true;
}
/**
 * 저장시 그리드 입력 체크
 */
function grdDetailT2OnBeforePost(row) {

  if (!G_GRDDETAILT2.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAILT2.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  // 수량 체크
  // 수량 null 체크
  if ($NC.isNull(rowData.CONFIRM_QTY)) {
    alert("검수수량을 입력하십시오.");
    $NC.setGridSelectRow(G_GRDDETAILT2, {
      selectRow: row,
      activeCell: G_GRDDETAILT2.view.getColumnIndex("CONFIRM_QTY"),
      editMode: true
    });
    return false;
  } else {

    var masterRowData = G_GRDMASTERT2.data.getItem(G_GRDMASTERT2.lastRow);

    var M_ENTRY_QTY = Number(masterRowData.ENTRY_QTY);

    var S_CONFIRM_QTY = $NC.getGridSumVal(G_GRDDETAILT2, {
      searchKey: ["BRAND_CD", "ITEM_CD", "ITEM_STATE", "ITEM_LOT"],
      searchVal: [rowData.BRAND_CD, rowData.ITEM_CD, rowData.ITEM_STATE, rowData.ITEM_LOT],
      sumKey: "CONFIRM_QTY",
      isAllData: true
    });

    if (M_ENTRY_QTY < S_CONFIRM_QTY) {
      rowData.CONFIRM_QTY = rowData.ORG_CONFIRM_QTY;
      var O_MES = "[" + rowData.ITEM_NM + "]의 검수수량을 등록수량보다 많이 수정할 수 없습니다.";
      alert(O_MES);

      G_GRDDETAILT2.data.updateItem(rowData.id, rowData);

      $NC.setGridSelectRow(G_GRDDETAILT2, {
        selectRow: row,
        activeCell: G_GRDDETAILT2.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return false;
    }
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
    G_GRDDETAILT2.data.updateItem(rowData.id, rowData);
  }
  return true;
}

/**
 * 박스관리탭의 박스내역 그리드 초기값 설정
 */
function grdMasterT3OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BOX_NO",
    field: "BOX_NO",
    name: "박스번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BOXING_YN",
    field: "BOXING_YN",
    name: "박스완료여부",
    minWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterT3Initialize() {

  var options = {
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.BOXING_YN === "N") {
          return "specialrow4";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterT3", {
    columns: grdMasterT3OnGetColumns(),
    queryId: "LO07010E.RS_T3_MASTER",
    sortCol: "BOX_NO",
    gridOptions: options
  });

  G_GRDMASTERT3.view.onSelectedRowsChanged.subscribe(grdMasterT3OnAfterScroll);
}

function grdMasterT3OnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDMASTERT3.lastRow != null) {
    if (row == G_GRDMASTERT3.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdDetailT3OnBeforePost(G_GRDDETAILT3.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  $NC.setInitGridVar(G_GRDDETAILT3);
  G_GRDDETAILT3.lastFilterVal = G_GRDMASTERT3.data.getItem(args.rows[0]).BOX_NO;
  G_GRDDETAILT3.data.refresh();
  $NC.setGridSelectRow(G_GRDDETAILT3, 0);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterT3", row + 1);
}

function grdDetailT3OnGetColumns() {

  var columns = [ ];

  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "총검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "OTHER_BOX_QTY",
    field: "OTHER_BOX_QTY",
    name: "타박스검수수량",
    minWidth: 100,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    editor: Slick.Editors.Number
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 박스관리탭의 상품별 검수내역 그리드 초기값 설정
 */
function grdDetailT3Initialize() {

  var options = {
    editable: true,
    autoEdit: true
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailT3", {
    columns: grdDetailT3OnGetColumns(),
    queryId: "LO07010E.RS_T3_DETAIL",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDDETAILT3.view.onSelectedRowsChanged.subscribe(grdDetailT3OnAfterScroll);
  G_GRDDETAILT3.view.onBeforeEditCell.subscribe(grdDetailT3OnBeforeEditCell);
  G_GRDDETAILT3.view.onCellChange.subscribe(grdDetailT3OnCellChange);
}

function grdDetailT3OnFilter(item) {
  return G_GRDDETAILT3.lastFilterVal === item.BOX_NO;
}

function grdDetailT3OnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDDETAILT3.lastRow != null) {
    if (row == G_GRDDETAILT3.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdDetailT3OnBeforePost(G_GRDDETAILT3.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailT3", row + 1);

}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailT3OnCellChange(e, args) {

  var rowData = args.item;

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAILT3.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAILT3.lastRowModified = true;
}

function grdDetailT3OnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if ($NC.G_VAR.userData.P_INSPECT_YN == "Y") {
    return false;
  }
  return true;
}

/**
 * 저장시 그리드 입력 체크
 */
function grdDetailT3OnBeforePost(row) {

  if (!G_GRDDETAILT3.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAILT3.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  // 수량 체크
  // 수량 null 체크
  if ($NC.isNull(rowData.CONFIRM_QTY)) {
    alert("검수수량을 입력하십시오.");
    $NC.setGridSelectRow(G_GRDDETAILT3, {
      selectRow: row,
      activeCell: G_GRDDETAILT3.view.getColumnIndex("CONFIRM_QTY"),
      editMode: true
    });
    return false;
  } else {

    var M_ENTRY_QTY = Number(rowData.ENTRY_QTY);

    var S_CONFIRM_QTY = $NC.getGridSumVal(G_GRDDETAILT3, {
      searchKey: ["BRAND_CD", "ITEM_CD", "ITEM_STATE", "ITEM_LOT"],
      searchVal: [rowData.BRAND_CD, rowData.ITEM_CD, rowData.ITEM_STATE, rowData.ITEM_LOT],
      sumKey: "CONFIRM_QTY",
      isAllData: true
    });

    if (M_ENTRY_QTY < S_CONFIRM_QTY) {
      rowData.CONFIRM_QTY = rowData.ORG_CONFIRM_QTY;
      var O_MES = rowData.ITEM_NM + "의 검수수량을 등록수량보다 많이 수정할 수 없습니다.";
      alert(O_MES);

      G_GRDDETAILT3.data.updateItem(rowData.id, rowData);

      $NC.setGridSelectRow(G_GRDDETAILT3, {
        selectRow: row,
        activeCell: G_GRDDETAILT3.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return false;
    }

  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAILT3.data.updateItem(rowData.id, rowData);

  return true;
}

function onGetDetailT1(ajaxData) {

  G_GRDDETAILT1.lastFilterVal = null;
  var rowData = G_GRDMASTERT1.data.getItem(G_GRDMASTERT1.lastRow);
  if (rowData) {
    G_GRDDETAILT1.lastFilterVal = rowData.BOX_NO;
  }
  $NC.setInitGridData(G_GRDDETAILT1, ajaxData, grdDetailT1OnFilter);

  if (G_GRDDETAILT1.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAILT1, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetailT1", 0, 0);
  }
}

function onGetMasterT2(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERT2, ajaxData);

  if (G_GRDMASTERT2.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTERT2.lastRow)) {
      $NC.setGridSelectRow(G_GRDMASTERT2, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERT2, G_GRDMASTERT2.lastRow);
    }

  } else {
    $NC.setGridDisplayRows("#grdMasterT2", 0, 0);
  }

}

function onGetDetailT2(ajaxData) {

  G_GRDDETAILT2.lastFilterVal = null;
  var rowData = G_GRDMASTERT2.data.getItem(G_GRDMASTERT2.lastRow);
  if (rowData) {
    var lastFilterVal = rowData.BRAND_CD + rowData.ITEM_CD + rowData.ITEM_STATE + rowData.ITEM_LOT;
    G_GRDDETAILT2.lastFilterVal = lastFilterVal;
  }
  $NC.setInitGridData(G_GRDDETAILT2, ajaxData, grdDetailT2OnFilter);

  if (G_GRDDETAILT2.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAILT2, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetailT2", 0, 0);
  }
}

function onGetMasterT3(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERT3, ajaxData);

  if (G_GRDMASTERT3.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTERT3.lastRow)) {
      $NC.setGridSelectRow(G_GRDMASTERT3, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERT3, G_GRDMASTERT3.lastRow);
    }

  } else {
    $NC.setGridDisplayRows("#grdMasterT3", 0, 0);
  }

}

function onGetDetailT3(ajaxData) {

  G_GRDDETAILT3.lastFilterVal = null;
  var rowData = G_GRDMASTERT3.data.getItem(G_GRDMASTERT3.lastRow);
  if (rowData) {
    G_GRDDETAILT3.lastFilterVal = rowData.BOX_NO;
  }
  $NC.setInitGridData(G_GRDDETAILT3, ajaxData, grdDetailT3OnFilter);

  if (G_GRDDETAILT3.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAILT3, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetailT3", 0, 0);
  }
}

/**
 * 박스삭제 버튼 클릭
 */
function onBtnBoxDelete() {

  if (G_GRDMASTERT1.data.getLength() == 0) {
    return;
  }

  if (!confirm("선택한 검수 박스내역 삭제하지겠습니까?")) {
    return;
  }

  var masterDS = [ ];
  // 필터링 된 데이터라 전체 데이터를 기준으로 처리
  for (var i = 0; i < G_GRDMASTERT1.data.getLength(); i++) {
    var rowData = G_GRDMASTERT1.data.getItem(i);
    if (rowData.CHECK_YN == "Y") {
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_BOX_NO: rowData.BOX_NO
      };
      masterDS.push(saveData);
    }
  }

  if (masterDS.length === 0) {
    alert("삭제할 데이터를 선택하십시오.");
    return;
  }

  $NC.serviceCall("/LO07010E/callScanBoxDelete.do", {
    P_DS_MASTER: $NC.toJson(masterDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave);

}

/**
 * 박스병합 버튼 클릭
 */
function onBtnBoxMerge() {

  if (G_GRDMASTERT1.data.getLength() == 0) {
    return;
  }

  var checkedRows = $NC.getGridSearchRows(G_GRDMASTERT1, {
    searchKey: "CHECK_YN",
    searchVal: "Y"
  });

  if (checkedRows.length != 2) {
    alert("박스병합할 2개의 박스번호를 선택하십시오.");
    return;
  }

  var rowData1 = G_GRDMASTERT1.data.getItem(checkedRows[0]);
  var rowData2 = G_GRDMASTERT1.data.getItem(checkedRows[1]);

  if (rowData1.BOXING_YN == "N" || rowData2.BOXING_YN == "N") {
    alert("박스완료되지 않은 박스는 박스병합 처리할 수 없습니다.");
    return;
  }

  var CENTER_CD = $NC.G_VAR.userData.P_CENTER_CD;
  var BU_CD = $NC.G_VAR.userData.P_BU_CD;
  var OUTBOUND_DATE = $NC.G_VAR.userData.P_OUTBOUND_DATE;
  var OUTBOUND_NO = $NC.G_VAR.userData.P_OUTBOUND_NO;
  var BOX_NO_FROM;
  var BOX_NO_TO;

  if (rowData1.BOX_NO > rowData2.BOX_NO) {
    BOX_NO_TO = rowData2.BOX_NO;
    BOX_NO_FROM = rowData1.BOX_NO;
  } else {
    BOX_NO_TO = rowData1.BOX_NO;
    BOX_NO_FROM = rowData2.BOX_NO;
  }

  if (!confirm("[" + BOX_NO_FROM + "]번 박스를 [" + BOX_NO_TO + "]번 박스로 병합하시겠습니까?")) {
    return;
  }

  $NC.serviceCall("/LO07010E/callScanBoxMerge.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: OUTBOUND_NO,
      P_BOX_NO_TO: BOX_NO_TO,
      P_BOX_NO_FROM: BOX_NO_FROM,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onSave);
}

/**
 * 박스완료 버튼 클릭
 */
function onBtnPrintBoxLabel() {

  var CENTER_CD = $NC.G_VAR.userData.P_CENTER_CD;
  var BU_CD = $NC.G_VAR.userData.P_BU_CD;
  var OUTBOUND_DATE = $NC.G_VAR.userData.P_OUTBOUND_DATE;
  var OUTBOUND_NO = $NC.G_VAR.userData.P_OUTBOUND_NO;

  var checkedValueDS = [ ];

  checkedValueDS.push(OUTBOUND_NO);

  var reportDoc = "lo/PAPER_LO01";
  var queryId = "WR.RS_PAPER_LO01";
  var queryParams = {
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: OUTBOUND_DATE
  };

  // 출력 호출
  $NC.G_MAIN.showPrintPreview({
    reportDoc: reportDoc,
    queryId: queryId,
    queryParams: queryParams,
    checkedValue: checkedValueDS.toString()
  });

}

/**
 * 박스완료 버튼 클릭
 */
function onBtnPrintBoxBill() {
  var CENTER_CD = $NC.G_VAR.userData.P_CENTER_CD;
  var BU_CD = $NC.G_VAR.userData.P_BU_CD;
  var OUTBOUND_DATE = $NC.G_VAR.userData.P_OUTBOUND_DATE;
  var OUTBOUND_NO = $NC.G_VAR.userData.P_OUTBOUND_NO;

  var checkedValueDS = [ ];

  checkedValueDS.push(OUTBOUND_NO);

  var reportDoc = "lo/PAPER_LO01";
  var queryId = "WR.RS_PAPER_LO01";
  var queryParams = {
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: OUTBOUND_DATE
  };

  // 출력 호출
  $NC.G_MAIN.showPrintPreview({
    reportDoc: reportDoc,
    queryId: queryId,
    queryParams: queryParams,
    checkedValue: checkedValueDS.toString()
  });
}

function onSave(ajaxData) {

  _Inquiry();
}
