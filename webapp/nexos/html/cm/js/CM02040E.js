/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    GRDSUB_CLEAR: true
  });

  // 상단그리드 초기화
  grdMasterInitialize();
  // 하단그리드 초기화
  grdSubInitialize();

  // 조회조건 - 물류센터 세팅
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
    onComplete: function() {
      $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
    }
  });

  // 차량등록 버튼 클릭 이벤트 연결
  $("#btnReg").click(setDataToGridMaster);
  $("#btnQArea_Cd").click(showDeliveryAreaQPopup);
  $("#btnArea_Cd").click(showDeliveryAreaPopup);

}

function _OnLoaded() {
  $NC.setInitSplitter("#divMasterView", "h", 300);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.centerSearchViewHeight = $("#divAreaCd").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, $("#grdMaster").parent().height() - $NC.G_LAYOUT.header);

  $NC.resizeGrid("#grdSub", clientWidth, $("#grdSub").parent().height() - $NC.G_LAYOUT.header
      - $NC.G_OFFSET.centerSearchViewHeight);
}

/**
 * Input, Select Change Event 처리
 * 
 * @param e
 *          이벤트 핸들러
 * @param view
 *          대상 Object
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();
  $NC.G_VAR.GRDSUB_CLEAR = true;
  switch (id) {
  case "AREA_CD":
    $NC.G_VAR.GRDSUB_CLEAR = false;
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_AREA_CD: val
      };
      O_RESULT_DATA = $NP.getDeliveryAreaInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onDeliveryAreaQPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showDeliveryAreaPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onDeliveryAreaQPopup, onDeliveryAreaQPopup);
    }
    return;
  case "CENTER_CD":
    $NC.setValue("#edtQArea_Cd");
    $NC.setValue("#edtQArea_Nm");
    $NC.setValue("#edtArea_Cd");
    $NC.setValue("#edtArea_Nm");
    break;
  }

  // 화면클리어
  onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

  // 하단그리드 위의 윤송권역 검색 값 변경 했을 경우
  var id = view.prop("id").substr(3).toUpperCase();
  if (id === "AREA_CD") {
    $NC.G_VAR.GRDSUB_CLEAR = false;
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_AREA_CD: val
      };
      O_RESULT_DATA = $NP.getDeliveryAreaInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onDeliveryAreaPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showDeliveryAreaPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onDeliveryAreaPopup, onDeliveryAreaPopup);
    }
    return;
  }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var AREA_CD = $NC.getValue("#edtQArea_Cd", true);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_AREA_CD: AREA_CD
  });

  // 데이터 조회
  $NC.serviceCall("/CM02040E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUB);

  G_GRDSUB.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD
  });

  // 데이터 조회
  $NC.serviceCall("/CM02040E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

  $NC.setGridColumnHeaderCheckBox(G_GRDSUB, "CHECK_YN");
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

  if (G_GRDMASTER.data.getLength() === 0) {
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

  // 물류센터코드는 저장시 선택된 물류센터로 입력
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");

  var saveMasterDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: CENTER_CD,
        P_CAR_CD: rowData.CAR_CD,
        P_AREA_CD: rowData.AREA_CD,
        P_CHARGE_YN: rowData.CHARGE_YN,
        P_PAY_YN: rowData.PAY_YN,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveMasterDS.push(saveData);
    }
  }

  if (saveMasterDS.length > 0) {
    $NC.serviceCall("/CM02040E/save.do", {
      P_DS_MASTER: $NC.toJson(saveMasterDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var result = confirm("삭제 하시겠습니까?");
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
        if (G_GRDMASTER.data.getLength() === 0) {
          $NC.setGridDisplayRows("#grdMaster", 0, 0);
        } else {
          $NC.setGridSelectRow(G_GRDMASTER, 0);
        }
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
    selectKey: "CAR_CD",
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

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CAR_CD",
    field: "CAR_CD",
    name: "차량코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CAR_NM",
    field: "CAR_NM",
    name: "차량명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "CAR_TON_DIV_F",
    field: "CAR_TON_DIV_F",
    name: "차량톤수",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "CAR_KEEP_DIV_F",
    field: "CAR_KEEP_DIV_F",
    name: "차량보관구분",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "CAR_CAPA",
    field: "CAR_CAPA",
    name: "차량용적",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "AREA_CD",
    field: "AREA_CD",
    name: "운송권역",
    minWidth: 100,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdMasterOnPopup
    }
  });
  $NC.setGridColumn(columns, {
    id: "AREA_NM",
    field: "AREA_NM",
    name: "운송권역명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "CHARGE_YN",
    field: "CHARGE_YN",
    name: "청구수수료발생여부",
    minWidth: 130,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "PAY_YN",
    field: "PAY_YN",
    name: "지급수수료발생여부",
    minWidth: 130,
    sortable: false,
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
    minWidth: 150,
    sortable: true,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상단그리드 초기화
 */
function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CM02040E.RS_MASTER",
    sortCol: "CAR_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
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

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.AREA_CD)) {
      alert("운송권역코드를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("AREA_CD"), true);
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdSubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    maxWidth: 30,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "CAR_CD",
    field: "CAR_CD",
    name: "차량코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CAR_NM",
    field: "CAR_NM",
    name: "차량명",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "CAR_TON_DIV_F",
    field: "CAR_TON_DIV_F",
    name: "차량톤수",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CAR_KEEP_DIV_F",
    field: "CAR_KEEP_DIV_F",
    name: "차량보관구분",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "CAR_CAPA",
    field: "CAR_CAPA",
    name: "차량용적",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 350
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}
/**
 * 하단그리드 초기화
 */
function grdSubInitialize() {

  var options = {
    editable: true,
    autoEdit: true
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: "CM02040E.RS_SUB1",
    sortCol: "CAR_CD",
    gridOptions: options
  });

  G_GRDSUB.view.onHeaderClick.subscribe(grdSubOnHeaderClick);
  G_GRDSUB.view.onClick.subscribe(grdSubOnClick);
  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
  $NC.setGridColumnHeaderCheckBox(G_GRDSUB, "CHECK_YN");
}

/**
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

  var rowData = null;

  G_GRDMASTER.focused = false;
  G_GRDSUB.focused = false;
  if (args.cell == G_GRDMASTER.view.getColumnIndex("CHARGE_YN")) {
    rowData = G_GRDMASTER.data.getItem(args.row);
    rowData.CHARGE_YN = args.val === "Y" ? "N" : "Y";
    G_GRDMASTER.focused = true;
  } else if (args.cell == G_GRDMASTER.view.getColumnIndex("PAY_YN")) {
    rowData = G_GRDMASTER.data.getItem(args.row);
    rowData.PAY_YN = args.val === "Y" ? "N" : "Y";
    G_GRDMASTER.focused = true;
  } else if (args.cell == G_GRDSUB.view.getColumnIndex("CHECK_YN")) {
    rowData = G_GRDSUB.data.getItem(args.row);
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
    G_GRDSUB.focused = true;
  }

  if (G_GRDMASTER.focused) {
    if (G_GRDMASTER.view.getEditorLock().isActive()) {
      G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
    }
    if (rowData.CRUD === "R") {
      rowData.CRUD = "U";
    }
    $NC.setGridSelectRow(G_GRDMASTER, args.row);

    G_GRDMASTER.data.updateItem(rowData.id, rowData);

  } else {
    if (G_GRDSUB.view.getEditorLock().isActive()) {
      G_GRDSUB.view.getEditorLock().commitCurrentEdit();
    }

    $NC.setGridSelectRow(G_GRDSUB, args.row);

    G_GRDSUB.data.updateItem(rowData.id, rowData);
  }

}

/**
 * 하단 그리드.헤더의 전체선택 체크박스 클릭
 */
function grdSubOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDSUB.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDSUB.data.getLength();
      var rowData;
      G_GRDSUB.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDSUB.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDSUB.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDSUB.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

function grdSubOnClick(e, args) {

  if (args.cell === G_GRDSUB.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDSUB.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {
        rowData.CHECK_YN = checkVal;
        G_GRDSUB.data.updateItem(rowData.id, rowData);
      }
    }
  }
}

/**
 * 운송권역(검색항목) 검색 팝업 표시
 */
function showDeliveryAreaQPopup() {
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  $NP.showDeliveryAreaPopup({
    queryParams: {
      P_CENTER_CD: CENTER_CD,
      P_AREA_CD: "%"
    }
  }, onDeliveryAreaQPopup, function() {
    $NC.setFocus("#edtQArea_Cd");
  });
}

function onDeliveryAreaQPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQArea_Cd", resultInfo.AREA_CD);
    $NC.setValue("#edtQArea_Nm", resultInfo.AREA_NM);
  } else {
    $NC.setValue("#edtQArea_Cd");
    $NC.setValue("#edtQArea_Nm");
    $NC.setFocus("#edtQArea_Cd", true);
  }
  // 화면 클리어
  onChangingCondition();
}

/**
 * 운송권역(차량등록) 검색 팝업 표시
 */
function showDeliveryAreaPopup() {
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var AREA_CD = $NC.getValue("#edtArea_Cd");
  $NP.showDeliveryAreaPopup({
    queryParams: {
      P_CENTER_CD: CENTER_CD,
      P_AREA_CD: "%"
    }
  }, onDeliveryAreaPopup, function() {
    $NC.setFocus("#edtArea_Cd", true);
  });
}

function onDeliveryAreaPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtArea_Cd", resultInfo.AREA_CD);
    $NC.setValue("#edtArea_Nm", resultInfo.AREA_NM);
  } else {
    $NC.setValue("#edtArea_Cd");
    $NC.setValue("#edtArea_Nm");
    $NC.setFocus("#edtArea_Cd", true);
  }
}

/**
 * 상단그리드의 입력항목 값 변경
 */
function grdMasterOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDMASTER.view.getColumnField(args.cell)) {
  case "AREA_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.AREA_CD)) {
      P_QUERY_PARAMS = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_AREA_CD: rowData.AREA_CD,
      };
      O_RESULT_DATA = $NP.getDeliveryAreaInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onDeliveryAreaGridPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showDeliveryAreaPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onDeliveryAreaGridPopup, onDeliveryAreaGridPopup);
    }
    return;
  }

  if (G_GRDMASTER.lastRow == null) return;

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;

}

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

function grdSubOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUB.lastRow != null) {
    if (row == G_GRDSUB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub", row + 1, G_GRDSUB.data.getLength());
}

/**
 * 그리드의 운송권역 셀의 검색 아이콘 클릭시 팝업창 표시
 */
function grdMasterOnPopup(e, args) {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  switch (args.column.field) {
  case "AREA_CD":
    $NP.showDeliveryAreaPopup({
      P_CENTER_CD: CENTER_CD,
      P_AREA_CD: "%"
    }, onDeliveryAreaGridPopup, function() {
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("AREA_CD"), true, true);
    });
    break;
  }
}

function onDeliveryAreaGridPopup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.AREA_CD = resultInfo.AREA_CD;
    rowData.AREA_NM = resultInfo.AREA_NM;
    focusCol = G_GRDMASTER.view.getColumnIndex("AREA_CD");
  } else {
    rowData.AREA_CD = "";
    rowData.AREA_NM = "";
    focusCol = G_GRDMASTER.view.getColumnIndex("AREA_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
  $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "CAR_CD",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 조회버튼 클릭후 하단 그리드에 데이터 표시처리
 */
function onGetSub(ajaxData) {

  $NC.setInitGridData(G_GRDSUB, ajaxData);
  if (G_GRDSUB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDSUB.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSUB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSUB, {
        selectKey: "AREA_CD",
        selectVal: G_GRDSUB.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdSub", 0, 0);
  }
}

/**
 * 저장 처리 성공 했을 경우 처리
 */
function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "CAR_CD"
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 저장 처리 실패 했을 경우 처리
 */
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

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  // 조회시 전역 변수 값 초기화
  $NC.clearGridData(G_GRDMASTER);
  if ($NC.G_VAR.GRDSUB_CLEAR) {
    $NC.setInitGridData(G_GRDSUB);
    $NC.setGridDisplayRows("#grdSub", 0, 0);
    $NC.setGridColumnHeaderCheckBox(G_GRDSUB, "CHECK_YN");
  }

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
 * 하단 그리드에서 선택한 행을 상단 그리드에 추가
 */
function setDataToGridMaster() {

  if (G_GRDSUB.view.getEditorLock().isActive()) {
    G_GRDSUB.view.getEditorLock().commitCurrentEdit();
  }

  var rowCountM = G_GRDMASTER.data.getLength();
  var rowCountS = G_GRDSUB.data.getLength();
  var checkCount = 0;
  for (var row = 0; row < rowCountS; row++) {
    var rowData = G_GRDSUB.data.getItem(row);
    // 추가하려는 차량이 상단그리드에 존재하는지 체크
    var isNew = ($NC.getGridSearchVal(G_GRDMASTER, {
      searchKey: "CAR_CD",
      searchVal: rowData.CAR_CD
    }) === -1);
    if (rowData.CHECK_YN == "Y") {
      if (isNew) {
        checkCount++;
        var newRowData = {
          CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
          CAR_CD: rowData.CAR_CD,
          CAR_NM: rowData.CAR_NM,
          CAR_TON_DIV_F: rowData.CAR_TON_DIV_F,
          CAR_KEEP_DIV_F: rowData.CAR_KEEP_DIV_F,
          CAR_CAPA: rowData.CAR_CAPA,
          AREA_CD: $NC.getValue("#edtArea_Cd"),
          AREA_NM: $NC.getValue("#edtArea_Nm"),
          id: $NC.getGridNewRowId(),
          CRUD: "C"
        };
        G_GRDMASTER.data.addItem(newRowData);
      }
    }
  }

  if (checkCount == 0) {
    alert("미등록 차량을 선택하십시오.");
    return;
  }
  G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  $NC.setGridSelectRow(G_GRDMASTER, rowCountM);
  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;

}

/**
 * 운송영역 검색 값 변경 되었을 경우
 */
function onChagneDeliverAreaCd(val) {
  var P_QUERY_PARAMS;
  var O_RESULT_DATA = [ ];
  if (!$NC.isNull(val)) {
    P_QUERY_PARAMS = {
      P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
      P_AREA_CD: val
    };
    O_RESULT_DATA = $NP.getDeliveryAreaInfo({
      queryParams: P_QUERY_PARAMS
    });
  }
  if (O_RESULT_DATA.length <= 1) {
    onDeliveryAreaPopup(O_RESULT_DATA[0]);
  } else {
    $NP.showDeliveryAreaPopup({
      queryParams: P_QUERY_PARAMS,
      queryData: O_RESULT_DATA
    }, onDeliveryAreaPopup, onDeliveryAreaPopup);
  }
  return;
}
