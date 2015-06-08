/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();

  $NC.setValue("#edtQBrand_Cd", $NC.G_USERINFO.BRAND_CD);
  $NC.setValue("#edtQBrand_Nm", $NC.G_USERINFO.BRAND_NM);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showOwnBranPopup);
}

function _SetResizeOffset() {
  $NC.G_OFFSET.leftViewWidth = 420;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_OFFSET.leftViewWidth - $NC.G_LAYOUT.nonClientWidth;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Container 사이즈 조정
  $NC.resizeContainer("#divLeftView", $NC.G_OFFSET.leftViewWidth, clientHeight);
  $NC.resizeContainer("#divRightView", clientWidth, clientHeight);

  var gridHeight = clientHeight - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", $NC.G_OFFSET.leftViewWidth, gridHeight);
  $NC.resizeGrid("#grdDetail", clientWidth, gridHeight);

}

/**
 * 조회조건 Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {  
  case "BU_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: val
      };
      O_RESULT_DATA = $NP.getUserBuInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onUserBuPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showUserBuPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onUserBuPopup, onUserBuPopup);
    }
    return;
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBranPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup, onOwnBrandPopup);
    }
    return;
  }

  onChangingCondition();
}

function onChangingCondition() {
  // 초기화
  $NC.clearGridData(G_GRDDETAIL);
  $NC.clearGridData(G_GRDMASTER);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var BRAND_CD = $NC.getValue("#edtQBrand_Cd",true);
  var BU_CD = $NC.getValue("#edtQBu_Cd",true);

  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  var ITEM_NM = $NC.getValue("#edtQItem_Nm");

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: ITEM_CD,
    P_ITEM_NM: ITEM_NM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });

  // 데이터 조회
  $NC.serviceCall("/CM04030E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

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

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("세트상품 내역이 없습니다.\n\n세트상품을 먼저 등록하십시오.");
    return;
  }
  var groupData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var rowCount = G_GRDDETAIL.data.getLength();
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDDETAIL.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      G_GRDDETAIL.view.gotoCell(rowCount - 1, 0, true);
      return;
    }
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    BRAND_CD: groupData.BRAND_CD,
    ITEM_CD: groupData.ITEM_CD,
    SET_ITEM_CD: null,
    SET_ITEM_QTY: 0,
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

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("마스터 데이터가 없습니다.");
    return;
  }
  if (G_GRDDETAIL.lastRow == null || G_GRDDETAIL.data.getLength() === 0) {
    alert("저장할 디테일 데이터가 없습니다.");
    return;
  }

  // 구성상품 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }

  // 상용코드 수정 데이터
  var saveDetailDS = [ ];
  var rowCount = G_GRDDETAIL.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_SET_ITEM_CD: rowData.SET_ITEM_CD,
        P_SET_ITEM_QTY: rowData.SET_ITEM_QTY,
        P_CRUD: rowData.CRUD
      };
      saveDetailDS.push(saveData);
    }
  }

  if (saveDetailDS.length > 0) {
    $NC.serviceCall("/CM04030E/save.do", {
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

  var result = confirm("삭제 하시겠습니까?");
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
    selectKey: "ITEM_CD",
    isCancel: true
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "SET_ITEM_CD",
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
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90,
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 160,
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
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
    queryId: "CM04030E.RS_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  $("#grdMaster").find("div.grid-focus,div.grid-canvas").focus(function(e) {
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
  }
  // 조회시 디테일 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL);

  var rowData = G_GRDMASTER.data.getItem(row);

  G_GRDDETAIL.queryParams = $NC.getParams({
    P_BRAND_CD: rowData.BRAND_CD,
    P_ITEM_CD: rowData.ITEM_CD
  });

  // 디테일 조회
  $NC.serviceCall("/CM04030E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "SET_ITEM_CD",
    field: "SET_ITEM_CD",
    name: "구성상품코드",
    minWidth: 100,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdDetailOnPopup,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SET_ITEM_QTY",
    field: "SET_ITEM_QTY",
    name: "기준수량",
    minWidth: 180,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
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
    queryId: "CM04030E.RS_DETAIL",
    sortCol: "SET_ITEM_CD",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  $("#grdDetail").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = true;
  });
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

function grdDetailOnNewRecord(args) {

  G_GRDDETAIL.view.gotoCell(args.row, 0, true);
}

function grdDetailOnBeforeEditCell(e, args) {

  var rowData = G_GRDDETAIL.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      if (args.column.field === "SET_ITEM_CD") {
        return false;
      }
    }
  }
  return true;
}

function grdDetailOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
  case "SET_ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.SET_ITEM_CD)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.G_USERINFO.BU_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.SET_ITEM_CD,
        P_VIEW_DIV: "1",
        P_DEPART_CD: "%",
        P_LINE_CD: "%",
        P_CLASS_CD: "%"
      };
      O_RESULT_DATA = $NP.getItemInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemPopup, onItemPopup);
    }
    return;
  }

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
    if ($NC.isNull(rowData.SET_ITEM_CD)) {
      G_GRDDETAIL.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.SET_ITEM_CD)) {
      alert("구성상품을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, row);
      G_GRDDETAIL.view.gotoCell(row, G_GRDDETAIL.view.getColumnIndex("SET_ITEM_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.SET_ITEM_QTY)) {
      alert("구성수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, row);
      G_GRDDETAIL.view.gotoCell(row, G_GRDDETAIL.view.getColumnIndex("SET_ITEM_QTY"), true);
      return false;
    }
    if (rowData.SET_ITEM_QTY < 1) {
      alert("구성수량을 1보다 큰수를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, row);
      G_GRDDETAIL.view.gotoCell(row, G_GRDDETAIL.view.getColumnIndex("SET_ITEM_QTY"), true);
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
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "ITEM_CD",
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
        selectKey: "SET_ITEM_CD",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
}

function onSave(ajaxData) {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "ITEM_CD"
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "SET_ITEM_CD",
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

function grdDetailOnPopup(e, args) {

  var rowData = args.item;

  switch (args.column.field) {
  case "SET_ITEM_CD":
    $NP.showItemPopup({
      P_BU_CD: $NC.G_USERINFO.BU_CD,
      P_BRAND_CD: rowData.BRAND_CD,
      P_ITEM_CD: "%",
      P_VIEW_DIV: "1",
      P_DEPART_CD: "%",
      P_LINE_CD: "%",
      P_CLASS_CD: "%"
    }, onItemPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("SET_ITEM_CD"), true, true);
    });
    break;
  }
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {

  var CUST_CD = $NC.G_USERINFO.CUST_CD;

  $NP.showOwnBranPopup({
    P_CUST_CD:  CUST_CD,   
    P_BU_CD: $NC.getValue("#edtQBu_Cd",true),
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  onChangingCondition();
}

/**
 * 상품 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onItemPopup(resultInfo) {
  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.SET_ITEM_CD = resultInfo.ITEM_CD;
    rowData.ITEM_NM = resultInfo.ITEM_NM;
    rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
    focusCol = G_GRDDETAIL.view.getColumnIndex("SET_ITEM_QTY");
  } else {
    rowData.SET_ITEM_CD = "";
    rowData.ITEM_NM = "";
    rowData.ITEM_SPEC = "";
    focusCol = G_GRDDETAIL.view.getColumnIndex("SET_ITEM_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
}




/**
 * 검색조건의 사업부 검색 팝업 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQBu_Cd");
  });
}
/**
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}
