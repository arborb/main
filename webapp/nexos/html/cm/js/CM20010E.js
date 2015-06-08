/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({

    printOptions: [{
      PRINT_INDEX: 0,
      PRINT_COMMENT: "용기라벨 출력"
    }, ]
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

  var PICK_BOX_NO = $NC.getValue("#edtQPick_Box_No", true);
  var BOX_BARCODE = $NC.getValue("#edtQBox_Barcode", true);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 데이터 조회
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_PICK_BOX_NO: PICK_BOX_NO,
    P_BOX_BARCODE: BOX_BARCODE
  });
  $NC.serviceCall("/CM20010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
        activeCell: G_GRDMASTER.view.getColumnIndex("PICK_BOX_NO"),
        editMode: true
      });
      return;
    }
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CENTER_CD: CENTER_CD,
    PICK_BOX_NO: null,
    BOX_BARCODE: null,
    BOX_TYPE: "1",
    BOX_TYPE_F: $NC.getGridComboName(G_GRDMASTER, {
      colFullNameField: "BOX_TYPE_F",
      searchVal: "1",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    }),
    BOX_SPEC: null,
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
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var saveMasterDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {

      var saveData = {
        P_CENTER_CD: CENTER_CD,
        P_PICK_BOX_NO: rowData.PICK_BOX_NO,
        P_BOX_BARCODE: rowData.BOX_BARCODE,
        P_BOX_TYPE: rowData.BOX_TYPE,
        P_BOX_SPEC: rowData.BOX_SPEC,
        P_REMARK1: rowData.REMARK1,
        P_REG_USER_ID: $NC.G_USERINFO.USER_ID,
        P_CRUD: rowData.CRUD
      };
      saveMasterDS.push(saveData);
    }
  }

  if (saveMasterDS.length > 0) {
    $NC.serviceCall("/CM20010E/save.do", {
      P_DS_MASTER: $NC.toJson(saveMasterDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  var result = confirm("용기를 삭제 하시겠습니까?");
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
    selectKey: "PICK_BOX_NO",
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

  var center_Cd = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(center_Cd)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }

  var checkedValueDS = [ ];
  var saveDs = [ ];
  var checkCnt = 0;
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      checkCnt++;
      checkedValueDS.push(rowData.PICK_BOX_NO);
      var saveData = {
        P_CENTER_CD: center_Cd,
        P_PICK_BOX_NO: rowData.PICK_BOX_NO,
        P_BOX_BARCODE: rowData.BOX_BARCODE,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      saveDs.push(saveData);
    }
  }

  if (checkCnt === 0) {
    alert("출력할 데이터를 선택하십시오.");
    return;
  }
  if (checkedValueDS.length == 0) {
    alert("출력 가능한 데이터를 선택하십시오.");
    return;
  }

  $NC.serviceCallAndWait("/CM20010E/Cksave.do", {
    P_DS_DETAIL: $NC.toJson(saveDs)
  }, onSavePrintYn);

  var printOptions = {
    reportDoc: "common/LABEL_CMPICKNO",
    queryId: "WR.RS_LABEL_CMPICKNO",
    queryParams: {
      P_CENTER_CD: center_Cd
    },
    checkedValue: checkedValueDS.toString()
  };
  $NC.G_MAIN.showPrintPreview(printOptions);

}

// 출력 여부
function onSavePrintYn(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }
  _Inquiry();
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 40,
    maxWidth: 40,
    cssClass: "align-center",
    sortable: false,
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "PICK_BOX_NO",
    field: "PICK_BOX_NO",
    name: "용기ID",
    minWidth: 90,
    cssClass: "align-center",
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "BOX_BARCODE",
    field: "BOX_BARCODE",
    name: "용기바코드",
    minWidth: 100,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "BOX_TYPE_F",
    field: "BOX_TYPE_F",
    name: "존구분",
    minWidth: 120,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "LDIV25",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "BOX_TYPE",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "BOX_SPEC",
    field: "BOX_SPEC",
    name: "용기규격",
    minWidth: 100,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 100,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "REG_USER_ID",
    field: "REG_USER_ID",
    name: "등록자ID",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REG_DATETIME",
    field: "REG_DATETIME",
    name: "등록일시",
    cssClass: "align-center",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "MODIFY_USER_ID",
    field: "MODIFY_USER_ID",
    name: "수정자ID",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "MODIFY_DATETIME",
    field: "MODIFY_DATETIME",
    name: "수정일시",
    cssClass: "align-center",
    minWidth: 150
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
    queryId: "CM20010E.RS_MASTER",
    sortCol: "ZONE_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
  G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
  G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

function grdMasterOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDMASTER.view.getEditorLock().isActive() && !G_GRDMASTER.view.getEditorLock().commitCurrentEdit()) {
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

  if (args.cell === G_GRDMASTER.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTER.view.getEditorLock().isActive() && !G_GRDMASTER.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDMASTER.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {
        rowData.CHECK_YN = checkVal;

        G_GRDMASTER.data.updateItem(rowData.id, rowData);
      }
    }
  }
}
function grdMasterOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDMASTER, args.row, G_GRDMASTER.view.getColumnIndex("PICK_BOX_NO"), true);
}

/**
 * @param e
 * @param args
 *          cell, column, grid, item, row
 * @returns {Boolean}
 */
function grdMasterOnBeforeEditCell(e, args) {

  // 신규 데이터일 때만 수정 가능한 컬럼
  if (args.column.field === "CENTER_CD" || args.column.field === "PICK_BOX_NO" || args.column.field === "BOX_BARCODE") {

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

    if ($NC.isNull(rowData.CENTER_CD) || $NC.isNull(rowData.PICK_BOX_NO) || $NC.isNull(rowData.BOX_BARCODE)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.CENTER_CD)) {
      alert("존코드를 입력하십시오.");
      $NC.setFocusGrid(G_GRDMASTER, row, G_GRDMASTER.view.getColumnIndex("CENTER_CD"), true);
      return false;
    }

    if ($NC.isNull(rowData.PICK_BOX_NO)) {
      alert("존이름을 입력하십시오.");
      $NC.setFocusGrid(G_GRDMASTER, row, G_GRDMASTER.view.getColumnIndex("PICK_BOX_NO"), true);
      return false;
    }

    if ($NC.isNull(rowData.BOX_BARCODE)) {
      alert("존이름을 입력하십시오.");
      $NC.setFocusGrid(G_GRDMASTER, row, G_GRDMASTER.view.getColumnIndex("BOX_BARCODE"), true);
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

function _OnGridCheckBoxFormatterClick(e, view, args) {
  var GRID_MASTER = G_GRDMASTER;

  if (GRID_MASTER.view.getEditorLock().isActive()) {
    GRID_MASTER.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(GRID_MASTER, args.row);

  var rowData = GRID_MASTER.data.getItem(args.row);

  if (args.cell == GRID_MASTER.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  GRID_MASTER.data.updateItem(rowData.id, rowData);

}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "PICK_BOX_NO",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "1";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "1";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "PICK_BOX_NO"
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