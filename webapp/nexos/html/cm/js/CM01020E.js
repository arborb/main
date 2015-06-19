/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 체크할 정책 값
    policyVal: {
      CM121: "", // 로케이션 존 길이
    }
  });

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
      // 정책
      setPolicyValInfo();
    }
  });

  // 그리드 초기화
  grdMasterInitialize();
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
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
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();
  switch (id) {
  case "CENTER_CD":
    setPolicyValInfo();
    break;
  }
  onChangingCondition();
}

function onChangingCondition() {

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);

  // 초기화
  $NC.clearGridData(G_GRDMASTER);
}

/**
 * Input, Select Change Event 처리
 * 
 * @param e
 *          이벤트 핸들러
 * @param view
 *          대상 Object
 */
function _OnInputChange(e, view, val) {

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

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 데이터 조회
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD
  });
  $NC.serviceCall("/CM01020E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

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
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: rowCount - 1,
        activeCell: G_GRDMASTER.view.getColumnIndex("ZONE_CD"),
        editMode: true
      });
      return;
    }
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CENTER_CD: null,
    ZONE_CD: null,
    ZONE_NM: null,
    ZONE_DIV: "1",
    FLOOR_DIV: "00",
    ZONE_ORDER: 0,
    MANAGER_ID: null,
    REMARK1: null,
    REG_USER_ID: null,
    REG_DATETIME: null,
    ZONE_DIV_F: $NC.getGridComboName(G_GRDMASTER, {
      colFullNameField: "ZONE_DIV_F",
      searchVal: "1",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    }),    
    FLOOR_DIV_F: $NC.getGridComboName(G_GRDMASTER, {
      colFullNameField: "FLOOR_DIV_F",
      searchVal: "00",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    }),
    MANAGER_NM: null,
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

  // 물류센터코드는 저장시 선택된 물류센터로 입력
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");

  var saveMasterDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: CENTER_CD,
        P_ZONE_CD: rowData.ZONE_CD,
        P_ZONE_NM: rowData.ZONE_NM,
        P_ZONE_DIV: rowData.ZONE_DIV,
        P_FLOOR_DIV: rowData.FLOOR_DIV,
        P_ZONE_ORDER: rowData.ZONE_ORDER,
        P_MANAGER_ID: rowData.MANAGER_ID,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveMasterDS.push(saveData);
    }
  }

  if (saveMasterDS.length > 0) {
    $NC.serviceCall("/CM01020E/save.do", {
      P_DS_MASTER: $NC.toJson(saveMasterDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  var result = confirm("물류센터존을 삭제 하시겠습니까?");
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
    selectKey: "ZONE_CD",
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
    id: "ZONE_CD",
    field: "ZONE_CD",
    name: "존코드",
    minWidth: 90,
    cssClass: "align-center",
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "ZONE_NM",
    field: "ZONE_NM",
    name: "존이름",
    minWidth: 160,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "ZONE_DIV_F",
    field: "ZONE_DIV_F",
    name: "존구분",
    minWidth: 120,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "ZONE_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "ZONE_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "FLOOR_DIV_F",
    field: "FLOOR_DIV_F",
    name: "합포장존구분",
    minWidth: 120,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "FLOOR_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "FLOOR_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  
  $NC.setGridColumn(columns, {
    id: "ZONE_ORDER",
    field: "ZONE_ORDER",
    name: "존순위",
    minWidth: 60,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MANAGER_ID",
    field: "MANAGER_ID",
    name: "관리책임자ID",
    minWidth: 100,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdMasterOnPopup
    }
  });
  $NC.setGridColumn(columns, {
    id: "MANAGER_NM",
    field: "MANAGER_NM",
    name: "관리책임자명",
    minWidth: 100,
  });
  $NC.setGridColumn(columns, {
    id: "REG_USER_ID",
    field: "REG_USER_ID",
    name: "등록자ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REG_DATETIME",
    field: "REG_DATETIME",
    name: "등록일시",
    minWidth: 140,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 180,
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
    queryId: "CM01020E.RS_MASTER",
    sortCol: "ZONE_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

function grdMasterOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDMASTER, args.row, G_GRDMASTER.view.getColumnIndex("ZONE_CD"), true);
}

/**
 * @param e
 * @param args
 *          cell, column, grid, item, row
 * @returns {Boolean}
 */
function grdMasterOnBeforeEditCell(e, args) {

  // 신규 데이터일 때만 수정 가능한 컬럼
  if (args.column.field === "ZONE_CD") {

    var rowData = G_GRDMASTER.data.getItem(args.row);
    if (rowData) {
      // 신규 데이터가 아니면 코드 수정 불가
      if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
        return false;
      }
    }
  }
  return true;
}

function grdMasterOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDMASTER.view.getColumnField(args.cell)) {
  case "ZONE_CD":
    /*
    if (rowData.ZONE_CD.length !== Number($NC.G_VAR.policyVal.CM121)) {
      alert("존코드 길이를 " + $NC.G_VAR.policyVal.CM121 + "로 하셔야 합니다.");
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("ZONE_CD"), true);
    }
    */
    rowData.ZONE_CD = rowData.ZONE_CD.toUpperCase();
    break;
  case "ZONE_ORDER":
    rowData.ZONE_ORDER = rowData.ZONE_ORDER;
    break;
  case "MANAGER_ID":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.MANAGER_ID)) {
      P_QUERY_PARAMS = {
        P_USER_ID: rowData.MANAGER_ID,
        P_CERTIFY_DIV: "%"
      };
      O_RESULT_DATA = $NP.getUserInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onManagerPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showUserPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onManagerPopup, onManagerPopup);
    }
    return;
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
    if ($NC.isNull(rowData.ZONE_CD)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.ZONE_CD)) {
      alert("존코드를 입력하십시오.");
      $NC.setFocusGrid(G_GRDMASTER, row, G_GRDMASTER.view.getColumnIndex("ZONE_CD"), true);
      return false;
    }
    /*
    if (rowData.ZONE_CD.length !== Number($NC.G_VAR.policyVal.CM121)) {
      alert("존코드 길이를 " + $NC.G_VAR.policyVal.CM121 + "로 하셔야 합니다.");
      $NC.setFocusGrid(G_GRDMASTER, row, G_GRDMASTER.view.getColumnIndex("ZONE_CD"), true);
      return false;
    }
    */
    if ($NC.isNull(rowData.ZONE_NM)) {
      alert("존이름을 입력하십시오.");
      $NC.setFocusGrid(G_GRDMASTER, row, G_GRDMASTER.view.getColumnIndex("ZONE_NM"), true);
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

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdMasterOnPopup(e, args) {

  if (args.column.field === "MANAGER_ID") {
    $NP.showUserPopup({
      P_USER_ID: "%",
      P_CERTIFY_DIV: "%"
    }, onManagerPopup, function() {
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("MANAGER_ID"), true, true);

    });
  }
}

function onManagerPopup(resultInfo) {

  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().cancelCurrentEdit();
  }
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.MANAGER_ID = resultInfo.USER_ID;
    rowData.MANAGER_NM = resultInfo.USER_NM;
    focusCol = G_GRDMASTER.view.getColumnIndex("REMARK1");
  } else {
    rowData.MANAGER_ID = "";
    rowData.MANAGER_NM = "";
    focusCol = G_GRDMASTER.view.getColumnIndex("MANAGER_ID");
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;

  $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true);
}

/**
 * 정책정보 취득
 */
function setPolicyValInfo() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  $NC.G_VAR.policyVal.CM121 = "";

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCall("/CM01020E/callSP.do", {
      P_QUERY_ID: "WF.GET_POLICY_VAL",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: null,
        P_POLICY_CD: POLICY_CD
      })
    }, onGetPolicyVal);
  }
}

/**
 * 정책정보 취득후 처리
 * 
 * @param ajaxData
 */
function onGetPolicyVal(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
      $NC.G_VAR.policyVal[resultData.P_POLICY_CD] = resultData.O_POLICY_VAL;
    }
  }
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "ZONE_CD",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
  G_GRDMASTER.view.getCanvasNode().focus();

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "1";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "ZONE_CD"
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
