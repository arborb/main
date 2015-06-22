/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 화면 최소 사이즈 조정
  $NC.G_JWINDOW.set("minWidth", 1050);

  // 버튼 이벤트 연결
  $("#btnDisplay_Grp,#btnRemark1").click(onBtnUpdateValue);

  // 그리드 초기화
  grdMasterInitialize();

  $NC.serviceCallAndWait("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "MSG_GRP",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, onGetMsgGrp);

  $NC.serviceCallAndWait("/CM03060E/getDataSet.do", {
    P_QUERY_ID: "CS06020E.RS_REF",
    P_QUERY_PARAMS: $NC.getParams("{}")
  }, onGetDisplayGrp);
}

function _SetResizeOffset() {

  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $("#divTopView").outerHeight(true);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  // Grid 높이 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
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

  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDMASTER, args.row);

  var rowData = G_GRDMASTER.data.getItem(args.row);

  if (args.cell == G_GRDMASTER.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  G_GRDMASTER.data.updateItem(rowData.id, rowData);
}

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

  onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.clearGridData(G_GRDMASTER);

  var MSG_GRP = $NC.getValue("#cboQMsg_Grp");
  var DISPLAY_GRP = $NC.getValue("#cboQDisplay_Grp");
  var MSG_ID = $NC.getValue("#edtQMsg_Id", true);

  G_GRDMASTER.queryParams = $NC.getParams({
    P_MSG_GRP: MSG_GRP,
    P_DISPLAY_GRP: DISPLAY_GRP,
    P_MSG_ID: MSG_ID
  });

  // 데이터 조회
  $NC.serviceCall("/CS06020E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

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
      $NC.setFocusGrid(G_GRDMASTER, rowCount - 1, G_GRDMASTER.view.getColumnIndex("DISPLAY_GRP_F"), true);
      return;
    }
  }
  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    MSG_GRP: "00",
    MSG_GRP_F: $NC.getGridComboName(G_GRDMASTER, {
      colFullNameField: "MSG_GRP_F",
      searchVal: "00",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    }),
    MSG_ID: "",
    DISPLAY_GRP: "00",
    DISPLAY_GRP_F: $NC.getGridComboName(G_GRDMASTER, {
      colFullNameField: "DISPLAY_GRP_F",
      searchVal: "00",
      dataCodeField: "DISPLAY_GRP",
      dataFullNameField: "DISPLAY_GRP_F",
    }),

    MSG_LANG1: "",
    MSG_LANG2: "",
    MSG_LANG3: "",
    MSG_LANG4: "",
    REMARK1: "",
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };

  G_GRDMASTER.data.addItem(newRowData);
  $NC.setGridSelectRow(G_GRDMASTER, rowCount);
  if (rowCount === 0) {
    $NC.setGridDisplayRows("#grdMaster", rowCount + 1, G_GRDMASTER.data.getLength());
  }

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

  if (G_GRDMASTER.data.getLength() == 0) {
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

  var saveMasterDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_MSG_GRP: rowData.MSG_GRP,
        P_MSG_ID: rowData.MSG_ID,
        P_DISPLAY_GRP: rowData.DISPLAY_GRP,
        P_MSG_LANG1: rowData.MSG_LANG1,
        P_MSG_LANG2: rowData.MSG_LANG2,
        P_MSG_LANG3: rowData.MSG_LANG3,
        P_MSG_LANG4: rowData.MSG_LANG4,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveMasterDS.push(saveData);
    }
  }

  if (saveMasterDS.length > 0) {
    $NC.serviceCall("/CS06020E/save.do", {
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
    return;
  }

  var result = confirm("메시지를 삭제 하시겠습니까?");
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
    selectKey: new Array("MSG_GRP", "MSG_ID"),
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
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  // 데이터 초기화
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

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    maxWidth: 30,
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
    id: "MSG_ID",
    field: "MSG_ID",
    name: "메시지ID",
    minWidth: 120,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "MSG_GRP_F",
    field: "MSG_GRP_F",
    name: "메시지그룹",
    minWidth: 100,
    editor: Slick.Editors.ComboBox
  });
  $NC.setGridColumn(columns, {
    id: "DISPLAY_GRP_F",
    field: "DISPLAY_GRP_F",
    name: "화면표시그룹",
    minWidth: 120,
    editor: Slick.Editors.ComboBox
  });
  $NC.setGridColumn(columns, {
    id: "MSG_LANG1",
    field: "MSG_LANG1",
    name: "제1언어",
    minWidth: 100,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "MSG_LANG2",
    field: "MSG_LANG2",
    name: "제2언어",
    minWidth: 100,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "MSG_LANG3",
    field: "MSG_LANG3",
    name: "제3언어",
    minWidth: 100,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "MSG_LANG4",
    field: "MSG_LANG4",
    name: "제4언어",
    minWidth: 100,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 250,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CS06020E.RS_MASTER",
    sortCol: "MSG_GRP_F",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
  G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
  G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
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

function grdMasterOnCellChange(e, args) {

  var rowData = args.item;
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

function grdMasterOnBeforeEditCell(e, args) {

  var rowData = G_GRDMASTER.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      if (args.column.field === "MSG_GRP_F") {
        return false;
      }
      if (args.column.field === "MSG_ID") {
        return false;
      }
    }
  }
  return true;
}

/**
 * 저장시 그리드 입력 체크
 */
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
    if ($NC.isNull(rowData.MSG_ID)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.MSG_GRP)) {
      alert("메시지그룹을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: row,
        activeCell: G_GRDMASTER.view.getColumnIndex("MSG_GRP"),
        editMode: true
      });
      return false;
    }

    if ($NC.isNull(rowData.MSG_ID)) {
      alert("메시지ID를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: row,
        activeCell: G_GRDMASTER.view.getColumnIndex("MSG_ID"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.DISPLAY_GRP)) {
      alert("화면표시그룹을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: row,
        activeCell: G_GRDMASTER.view.getColumnIndex("DISPLAY_GRP"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.MSG_LANG1)) {
      alert("제1언어를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: row,
        activeCell: G_GRDMASTER.view.getColumnIndex("MSG_LANG1"),
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

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdMasterOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDMASTER, args.row, G_GRDMASTER.view.getColumnIndex("MSG_ID"), true);
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["MSG_GRP", "MSG_ID"],
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

  $NC.setInitTopButtons($NC.G_VAR.buttons);

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

function onGetMsgGrp(ajaxData) {

  var resultData = $NC.toArray(ajaxData);

  // 조회조건 - 화면표시그룹 세팅 REF
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "MSG_GRP",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQMsg_Grp",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    data: resultData,
    addAll: true,
    onComplete: function() {
      $NC.setValue("#cboQMsg_Grp", 0);
    }
  });

  var cols = G_GRDMASTER.view.getColumns();
  cols[G_GRDMASTER.view.getColumnIndex("MSG_GRP_F")].editorOptions = {
    codeField: "MSG_GRP",
    dataCodeField: "CODE_CD",
    dataFullNameField: "CODE_CD_F",
    isKeyField: true,
    data: resultData
  };

  G_GRDMASTER.view.setColumns(cols);
}

function onGetDisplayGrp(ajaxData) {

  var resultData = $NC.toArray(ajaxData);

  // 조회조건 - 화면표시그룹 세팅 REF
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "CS06020E.RS_REF",
    P_QUERY_PARAMS: $NC.getParams("{}")
  }, {
    selector: "#cboQDisplay_Grp",
    codeField: "DISPLAY_GRP",
    nameField: "DISPLAY_NM",
    data: resultData,
    addAll: true,
    onComplete: function(resultSet) {
      $NC.setValue("#cboQDisplay_Grp", 0);
    }
  });

  // 조회조건 - 화면표시그룹 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "CS06020E.RS_REF",
    P_QUERY_PARAMS: $NC.getParams("{}")
  }, {
    selector: "#cboDisplay_Grp",
    codeField: "DISPLAY_GRP",
    nameField: "DISPLAY_NM",
    data: resultData,
    onComplete: function() {
      $NC.setValue("#cboDisplay_Grp", 0);
    }
  });

  var cols = G_GRDMASTER.view.getColumns();
  cols[G_GRDMASTER.view.getColumnIndex("DISPLAY_GRP_F")].editorOptions = {
    codeField: "DISPLAY_GRP",
    dataCodeField: "DISPLAY_GRP",
    dataNameField: "DISPLAY_NM",
    isKeyField: true,
    data: resultData
  };
  G_GRDMASTER.view.setColumns(cols);
}

function onSave(ajaxData) {
  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: new Array("MSG_GRP", "MSG_ID"),
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}

/**
 * 데이터 수정
 */
function onBtnUpdateValue(e) {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("수정할 데이터가 없습니다.");
    return;
  }

  var id = e.target.id.substr(3).toUpperCase();

  var updateFunc = function(name1, value1, name2, value2) {
    var checkRows = $NC.getGridSearchRows(G_GRDMASTER, {
      searchKey: "CHECK_YN",
      searchVal: "Y"
    });
    if (checkRows.length == 0) {
      alert("수정할 데이터를 선택하십시오.");
      return;
    }
    var rowData = null;
    for (var row = 0, rowCount = checkRows.length; row < rowCount; row++) {
      rowData = G_GRDMASTER.data.getItem(checkRows[row]);
      rowData[name1] = value1;
      if (name2) {
        rowData[name2] = value2;
      }
      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
    }
  };

  switch (id) {
  case "DISPLAY_GRP":
    var DISPLAY_GRP = $NC.getValue("#cboDisplay_Grp");
    var DISPLAY_GRP_F = $NC.getValueCombo("#cboDisplay_Grp", "F");

    updateFunc("DISPLAY_GRP", DISPLAY_GRP, "DISPLAY_GRP_F", DISPLAY_GRP_F);
    break;
  case "REMARK1":
    var REMARK1 = $NC.getValue("#edtRemark1");
    updateFunc("REMARK1", REMARK1);
    break;
  }
}
