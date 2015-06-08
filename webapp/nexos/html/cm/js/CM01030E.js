/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  
  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 체크할 정책 값
    policyVal: {
      CM120: "", // 로케이션 표시
      CM121: "", // 로케이션 존 길이
      CM122: "", // 로케이션 행 길이
      CM123: "", // 로케이션 열 길이
      CM124: "", // 로케이션 단 길이
    }
  });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();
  grdSubInitialize();

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

  $("#btnSetLoc_Order").click(onBtnSetLoc_OrderClick);
  $("#btnCreate").click(onBtnCreateClick);
  $NC.setEnable("#btnSetLoc_Order", false);
  $NC.setEnable("#btnCreate", false);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.gridMasterWidth = 250;
  $NC.G_OFFSET.gridDetailWidth = 250;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - ($NC.G_LAYOUT.border1 * 3) - ($NC.G_LAYOUT.margin2);
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;
  var subViewWidth = clientWidth - $NC.G_OFFSET.gridMasterWidth - $NC.G_OFFSET.gridDetailWidth;

  // Container 사이즈 조정
  $NC.resizeContainer("#divMasterView", $NC.G_OFFSET.gridMasterWidth, clientHeight);
  $NC.resizeContainer("#divDetailView", $NC.G_OFFSET.gridDetailWidth, clientHeight);
  $NC.resizeContainer("#divSubView", subViewWidth, clientHeight);

  var height = clientHeight - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", $NC.G_OFFSET.gridMasterWidth, height);
  $NC.resizeGrid("#grdDetail", $NC.G_OFFSET.gridDetailWidth, height);
  $NC.resizeGrid("#grdSub", subViewWidth, height);
}

function onChangingCondition() {
  // 초기화
  $NC.clearGridData(G_GRDSUB);
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
  $NC.setEnable("#btnSetLoc_Order", false);
  $NC.setEnable("#btnCreate", false);
}

/**
 * 조회조건 Change Event - Input, Select Change 시 호출 됨
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

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회조건 체크
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD
  });

  // 데이터 조회
  $NC.serviceCall("/CM01030E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("존 내역이 없습니다.\n\n물류센터 존을 먼저 등록하십시오.");
    return;
  }

  // grdMaster 또는 grdDetail에 포커스가 있을 경우
  if (G_GRDMASTER.focused || G_GRDDETAIL.focused) {

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

    var zoneData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
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
      CENTER_CD: zoneData.CENTER_CD,
      ZONE_CD: zoneData.ZONE_CD,
      BANK_CD: null,
      BANK_ORDER: 0,
      DIRECTION_DIV: "1",
      REMARK1: null,
      DIRECTION_DIV_F: $NC.getGridComboName(G_GRDDETAIL, {
        colFullNameField: "DIRECTION_DIV_F",
        searchVal: "1",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
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

    // grdSub에 포커스가 있을 경우
  } else {

    if (G_GRDDETAIL.data.getLength() == 0) {
      alert("행 내역이 없습니다.\n\n행을 먼저 등록하십시오.");
      return;
    }

    var bankData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if (bankData.CRUD == "N" || bankData.CRUD == "C") {
      alert("신규 로케이션 행입니다.\n\n저장 후 로케이션을 등록하십시요.");
      return;
    }
    // 현재 수정모드면
    if (G_GRDSUB.view.getEditorLock().isActive()) {
      G_GRDSUB.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (G_GRDSUB.lastRow != null) {
      if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
        return;
      }
    }

    var rowCount = G_GRDSUB.data.getLength();
    if (rowCount > 0) {
      // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
      var rowData = G_GRDSUB.data.getItem(rowCount - 1);
      if (rowData.CRUD == "N") {
        G_GRDSUB.view.gotoCell(rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      CENTER_CD: bankData.CENTER_CD,
      ZONE_CD: bankData.ZONE_CD,
      BANK_CD: bankData.BANK_CD,
      BAY_CD: null,
      LEV_CD: null,
      LOC_DIV: "1",
      PUTAWAY_AREA: "1",
      CELL_DIV: "01",
      LOCATION_CD: null,
      LOC_ORDER: 0,
      PLT_QTY: 1,
      CELL_LENGTH: 0,
      CELL_WIDTH: 0,
      CELL_HEIGHT: 0,
      CELL_WEIGHT: 0,
      PICK_AREA: null,
      CELL_CHKDIGIT: null,
      ITEM_CBM: 0,
      REMARK1: null,      
      PUTAWAY_AREA_F: $NC.getGridComboName(G_GRDSUB, {
        colFullNameField: "PUTAWAY_AREA_F",
        searchVal: "1",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
      LOC_DIV_F: $NC.getGridComboName(G_GRDSUB, {
        colFullNameField: "LOC_DIV_F",
        searchVal: "1",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
      CELL_DIV_F: $NC.getGridComboName(G_GRDSUB, {
        colFullNameField: "CELL_DIV_F",
        searchVal: "01",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
      id: $NC.getGridNewRowId(),
      CRUD: "N"
    };
    

    G_GRDSUB.data.addItem(newRowData);
    $NC.setGridSelectRow(G_GRDSUB, rowCount);
    // 수정 상태로 변경
    G_GRDSUB.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdSubOnNewRecord({
      row: rowCount,
      rowData: newRowData
    });

  }

}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  if (G_GRDDETAIL.lastRow == null || G_GRDDETAIL.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

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

  // 현재 수정모드면
  if (G_GRDSUB.view.getEditorLock().isActive()) {
    G_GRDSUB.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDSUB.lastRow != null) {
    if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
      return;
    }
  }

  var saveDetailDS = [ ];
  var saveSubDS = [ ];
  var rowCount;
  var row;
  var rowData;
  var saveData;

  // 행 데이터
  rowCount = G_GRDDETAIL.data.getLength();
  for (row = 0; row < rowCount; row++) {
    rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD !== "R") {
      saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_ZONE_CD: rowData.ZONE_CD,
        P_BANK_CD: rowData.BANK_CD,
        P_BANK_ORDER: rowData.BANK_ORDER,
        P_DIRECTION_DIV: rowData.DIRECTION_DIV,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveDetailDS.push(saveData);
    }
  }

  // 로케이션 데이터
  rowCount = G_GRDSUB.data.getLength();
  for (row = 0; row < rowCount; row++) {
    rowData = G_GRDSUB.data.getItem(row);
    if (rowData.CRUD !== "R") {
      saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_ZONE_CD: rowData.ZONE_CD,
        P_BANK_CD: rowData.BANK_CD,
        P_BAY_CD: rowData.BAY_CD,
        P_LEV_CD: rowData.LEV_CD,
        P_LOC_DIV: rowData.LOC_DIV,
        P_PUTAWAY_AREA: rowData.PUTAWAY_AREA,
        P_CELL_DIV: rowData.CELL_DIV,
        P_LOC_ORDER: rowData.LOC_ORDER,
        P_PLT_QTY: rowData.PLT_QTY,
        P_CELL_LENGTH: rowData.CELL_LENGTH,
        P_CELL_WIDTH: rowData.CELL_WIDTH,
        P_CELL_HEIGHT: rowData.CELL_HEIGHT,
        P_CELL_WEIGHT: rowData.CELL_WEIGHT,
        P_PICK_AREA: rowData.PICK_AREA,
        P_CELL_CHKDIGIT: rowData.CELL_CHKDIGIT,
        P_REMARK1: rowData.REMARK1,
        P_ITEM_CBM: rowData.ITEM_CBM,
        P_DSP_LOCATION_POLICY: $NC.G_VAR.policyVal.CM120,
        P_CRUD: rowData.CRUD
      };
      saveSubDS.push(saveData);
    }
  }

  if (saveDetailDS.length > 0 || saveSubDS.length > 0) {
    $NC.serviceCall("/CM01030E/save.do", {
      P_DS_MASTER: $NC.toJson(saveDetailDS),
      P_DS_DETAIL: $NC.toJson(saveSubDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  var messageAnswer;

  if (G_GRDMASTER.focused) {
    alert("삭제할 데이터를 정확히 선택하세요.");
    return;

  } else if (G_GRDDETAIL.focused) {

    if (G_GRDDETAIL.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    if (G_GRDSUB.data.getLength() > 0) {
      alert("해당 행의 로케이션이 있습니다. 삭제할 수 없습니다.");
      return;
    }

    messageAnswer = confirm("로케이션 행을 삭제 하시겠습니까?");
    if (messageAnswer) {
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

  } else {

    if (G_GRDSUB.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    messageAnswer = confirm("로케이션을 삭제 하시겠습니까?");
    if (messageAnswer) {
      var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);

      // 신규 데이터일 경우 그냥 삭제
      if (rowData.CRUD === "C" || rowData.CRUD === "N") {
        // 마지막 선택 Row 수정 상태 복원
        G_GRDSUB.lastRowModified = false;

        G_GRDSUB.data.deleteItem(rowData.id);
        // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
        if (G_GRDSUB.lastRow > 1) {
          $NC.setGridSelectRow(G_GRDSUB, G_GRDSUB.lastRow - 1);
        } else {
          $NC.setGridSelectRow(G_GRDSUB, 0);
        }
      } else {
        rowData.CRUD = "D";
        G_GRDSUB.data.updateItem(rowData.id, rowData);
        _Save();
      }
    }
  }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "ZONE_CD",
    isCancel: true
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "BANK_CD",
    isCancel: true
  });
  var lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDSUB, {
    selectKey: ["BAY_CD", "LEV_CD"],
    isCancel: true
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL.lastKeyVal = lastKeyVal2;
  G_GRDSUB.lastKeyVal = lastKeyVal3;
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
    cssClass: "align-center",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "ZONE_NM",
    field: "ZONE_NM",
    name: "존명",
    minWidth: 160
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {};

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CM01030E.RS_MASTER",
    sortCol: "ZONE_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  $("#grdMaster").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDMASTER.focused) {
      return;
    }
    G_GRDMASTER.focused = true;
    G_GRDDETAIL.focused = false;
    G_GRDSUB.focused = false;

    // 행 데이터 Post 처리
    if (G_GRDDETAIL.view.getEditorLock().isActive()) {
      G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL.lastRow != null) {
        if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
          G_GRDDETAIL.view.getCanvasNode.focus();
        }
      }
    }

    // 로케이션 데이터 Post 처리
    if (G_GRDSUB.view.getEditorLock().isActive()) {
      G_GRDSUB.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDSUB.lastRow != null) {
        if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
          G_GRDSUB.view.getCanvasNode.focus();
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

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL);
  onGetDetail({
    data: null
  });

  var rowData = G_GRDMASTER.data.getItem(row);

  // 기본로케이션 생성 버튼 활성/비활성화
  if (G_GRDMASTER.data.getLength() == 0) {
    $NC.setEnable("#btnSetLoc_Order", false);
    $NC.setEnable("#btnCreate", false);
  } else {
    $NC.setEnable("#btnSetLoc_Order", true);
    $NC.setEnable("#btnCreate", true);
  }

  // 행 데이터 조회
  G_GRDDETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_ZONE_CD: rowData.ZONE_CD
  });
  $NC.serviceCall("/CM01030E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BANK_CD",
    field: "BANK_CD",
    name: "행",
    minWidth: 60,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    },
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BANK_ORDER",
    field: "BANK_ORDER",
    name: "행순위",
    minWidth: 60,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DIRECTION_DIV_F",
    field: "DIRECTION_DIV_F",
    name: "피킹방향구분",
    minWidth: 100,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "DIRECTION_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "DIRECTION_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
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
    queryId: "CM01030E.RS_DETAIL",
    sortCol: "BANK_CD",
    gridOptions: options
  });
  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
  $("#grdDetail").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDDETAIL.focused) {
      return;
    }
    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = true;
    G_GRDSUB.focused = false;

    // 로케이션 데이터 Post 처리
    if (G_GRDSUB.view.getEditorLock().isActive()) {
      G_GRDSUB.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDSUB.lastRow != null) {
        if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
          return;
        }
      }
    }
  });
}

function grdDetailOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL, args.row, 0, true);
}

function grdDetailOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "BANK_CD") {
    return true;
  }
  var rowData = G_GRDDETAIL.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      return false;
    }
  }
  return true;
}

function grdDetailOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
  case "BANK_CD":
    if (rowData.BANK_CD.length !== Number($NC.G_VAR.policyVal.CM122)) {
      alert("행코드 길이를 " + $NC.G_VAR.policyVal.CM122 + "로 하셔야 합니다.");
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("BANK_CD"), true);
    }
    rowData.BANK_CD = rowData.BANK_CD.toUpperCase();
    break;
  }

  var rowData = args.item;
  if ($NC.isNull(rowData.CRUD) || rowData.CRUD === "R") {
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
    if ($NC.isNull(rowData.BANK_CD)) {
      G_GRDDETAIL.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.BANK_CD)) {
      alert("행을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, row);
      G_GRDDETAIL.view.gotoCell(row, G_GRDDETAIL.view.getColumnIndex("BANK_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.DIRECTION_DIV)) {
      alert("피킹방향구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, row);
      G_GRDDETAIL.view.gotoCell(row, G_GRDDETAIL.view.getColumnIndex("DIRECTION_DIV_F"), true);
      return false;
    }
    if (rowData.BANK_CD.length !== Number($NC.G_VAR.policyVal.CM122)) {
      alert("행코드 길이를 " + $NC.G_VAR.policyVal.CM122 + "로 하셔야 합니다.");
      G_GRDDETAIL.view.gotoCell(row, G_GRDDETAIL.view.getColumnIndex("BANK_CD"), true);
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

  // 조회시 중분류 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUB);
  onGetSub({
    data: null
  });

  var rowData = G_GRDDETAIL.data.getItem(row);

  if (rowData.CRUD !== "C" && rowData.CRUD !== "N") {
    // 로케이션 파라메터 세팅
    G_GRDSUB.queryParams = $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_ZONE_CD: rowData.ZONE_CD,
      P_BANK_CD: rowData.BANK_CD
    });

    // 로케이션 조회
    $NC.serviceCall("/CM01030E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

function grdSubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BAY_CD",
    field: "BAY_CD",
    name: "열",
    minWidth: 60,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    },
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LEV_CD",
    field: "LEV_CD",
    name: "단",
    minWidth: 60,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    },
    cssClass: "align-center"
  });  
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_AREA_F",
    field: "PUTAWAY_AREA_F",
    name: "로케이션방향구분",
    minWidth: 130,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "PUTAWAY_AREA",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "PUTAWAY_AREA",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "LOC_DIV_F",
    field: "LOC_DIV_F",
    name: "로케이션구분",
    minWidth: 100,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "LOC_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "LOC_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "CELL_DIV_F",
    field: "CELL_DIV_F",
    name: "셀구분",
    minWidth: 100,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "CELL_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "CELL_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "LOC_ORDER",
    field: "LOC_ORDER",
    name: "셀순위",
    minWidth: 60,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PLT_QTY",
    field: "PLT_QTY",
    name: "적재팔레트수",
    minWidth: 80,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PICK_AREA",
    field: "PICK_AREA",
    name: "피킹구역",
    minWidth: 60,
    editor: Slick.Editors.Text,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CELL_CHKDIGIT",
    field: "CELL_CHKDIGIT",
    name: "체크디지트",
    minWidth: 70,
    editor: Slick.Editors.Text,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CELL_WEIGHT",
    field: "CELL_WEIGHT",
    name: "셀중량",
    minWidth: 70,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CELL_LENGTH",
    field: "CELL_LENGTH",
    name: "장",
    minWidth: 60,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CELL_WIDTH",
    field: "CELL_WIDTH",
    name: "폭",
    minWidth: 60,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CELL_HEIGHT",
    field: "CELL_HEIGHT",
    name: "고",
    minWidth: 60,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CBM",
    field: "ITEM_CBM",
    name: "상품CBM",
    minWidth: 70,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 160,
    editor: Slick.Editors.Text,
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: "CM01030E.RS_SUB",
    sortCol: ["BAY_CD", "LEV_CD"],
    gridOptions: options
  });

  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
  G_GRDSUB.view.onBeforeEditCell.subscribe(grdSubOnBeforeEditCell);
  G_GRDSUB.view.onCellChange.subscribe(grdSubOnCellChange);
  $("#grdSub").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDSUB.focused) {
      return;
    }
    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = false;
    G_GRDSUB.focused = true;

    // 행 데이터 Post 처리
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

function grdSubOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDSUB, args.row, 0, true);
}

function grdSubOnBeforeEditCell(e, args) {

  var rowData = G_GRDSUB.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      if (args.column.field === "BANK_CD" || (args.column.field === "BAY_CD") || (args.column.field === "LEV_CD")) {
        return false;
      }
    }
  }
  return true;
}

function grdSubOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDSUB.view.getColumnField(args.cell)) {
  case "BANK_CD":
    if (rowData.BANK_CD.length !== Number($NC.G_VAR.policyVal.CM122)) {
      alert("행코드 길이를 " + $NC.G_VAR.policyVal.CM122 + "로 하셔야 합니다.");
      $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, G_GRDSUB.view.getColumnIndex("BANK_CD"), true);
    }
    rowData.BANK_CD = rowData.BANK_CD.toUpperCase();
    break;
  case "BAY_CD":
    if (rowData.BAY_CD.length !== Number($NC.G_VAR.policyVal.CM123)) {
      alert("열코드 길이를 " + $NC.G_VAR.policyVal.CM123 + "로 하셔야 합니다.");
      $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, G_GRDSUB.view.getColumnIndex("BAY_CD"), true);
    }
    rowData.BAY_CD = rowData.BAY_CD.toUpperCase();
    break;
  case "LEV_CD":
    if (rowData.LEV_CD.length !== Number($NC.G_VAR.policyVal.CM124)) {
      alert("단코드 길이를 " + $NC.G_VAR.policyVal.CM124 + "로 하셔야 합니다.");
      $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, G_GRDSUB.view.getColumnIndex("LEV_CD"), true);
    }
    rowData.LEV_CD = rowData.LEV_CD.toUpperCase();
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUB.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUB.lastRowModified = true;
}

function grdSubOnBeforePost(row) {

  if (!G_GRDSUB.lastRowModified) {
    return true;
  }

  var rowData = G_GRDSUB.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.BANK_CD) || $NC.isNull(rowData.BAY_CD) || $NC.isNull(rowData.LEV_CD)) {
      G_GRDSUB.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDSUB, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.BANK_CD)) {
      alert("행을 입력하십시오.");
      $NC.setFocusGrid(G_GRDSUB, row, G_GRDSUB.view.getColumnIndex("BANK_CD"), true);
      return false;
    }
    if (rowData.BANK_CD.length !== Number($NC.G_VAR.policyVal.CM122)) {
      alert("행코드 길이를 " + $NC.G_VAR.policyVal.CM122 + "로 하셔야 합니다.");
      $NC.setFocusGrid(G_GRDSUB, row, G_GRDSUB.view.getColumnIndex("BANK_CD"), true);
      return false;
    }

    if ($NC.isNull(rowData.BAY_CD)) {
      alert("열을 입력하십시오.");
      $NC.setFocusGrid(G_GRDSUB, row, G_GRDSUB.view.getColumnIndex("BAY_CD"), true);
      return false;
    }
    if (rowData.BAY_CD.length !== Number($NC.G_VAR.policyVal.CM123)) {
      alert("열코드 길이를 " + $NC.G_VAR.policyVal.CM123 + "로 하셔야 합니다.");
      $NC.setFocusGrid(G_GRDSUB, row, G_GRDSUB.view.getColumnIndex("BAY_CD"), true);
      return false;
    }

    if ($NC.isNull(rowData.LEV_CD)) {
      alert("단을 입력하십시오.");
      $NC.setFocusGrid(G_GRDSUB, row, G_GRDSUB.view.getColumnIndex("LEV_CD"), true);
      return false;
    }
    if (rowData.LEV_CD.length !== Number($NC.G_VAR.policyVal.CM124)) {
      alert("열코드 길이를 " + $NC.G_VAR.policyVal.CM124 + "로 하셔야 합니다.");
      $NC.setFocusGrid(G_GRDSUB, row, G_GRDSUB.view.getColumnIndex("LEV_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.PUTAWAY_AREA)) {
      alert("로케이션구분을 선택하십시오.");
      $NC.setFocusGrid(G_GRDSUB, row, G_GRDSUB.view.getColumnIndex("PUTAWAY_AREA_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.LOC_DIV)) {
      alert("로케이션구분을 선택하십시오.");
      $NC.setFocusGrid(G_GRDSUB, row, G_GRDSUB.view.getColumnIndex("LOC_DIV_F"), true);
      return false;
    }
    
    if ($NC.isNull(rowData.CELL_DIV)) {
      alert("셀구분구분을 선택하십시오.");
      $NC.setFocusGrid(G_GRDSUB, row, G_GRDSUB.view.getColumnIndex("CELL_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.PLT_QTY)) {
      alert("적재팔레트수를 입력하십시오.");
      $NC.setFocusGrid(G_GRDSUB, row, G_GRDSUB.view.getColumnIndex("PLT_QTY"), true);
      return false;
    }

    if ($NC.isNull(rowData.ITEM_CBM)) {
      alert("상품CBM을 입력하십시오.");
      $NC.setFocusGrid(G_GRDSUB, row, G_GRDSUB.view.getColumnIndex("ITEM_CBM"), true);
      return false;
    }
    if (Number(rowData.PLT_QTY) < 1) {
      alert("적재팔레트수에 1이상의 정수를 입력하십시오.");
      $NC.setFocusGrid(G_GRDSUB, row, G_GRDSUB.view.getColumnIndex("PLT_QTY"), true);
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDSUB.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdSubOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUB.lastRow != null) {
    if (row == G_GRDSUB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
    if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub", row + 1);
}

/**
 * 정책정보 취득
 */
function setPolicyValInfo() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  $NC.G_VAR.policyVal.CM120 = "";
  $NC.G_VAR.policyVal.CM121 = "";
  $NC.G_VAR.policyVal.CM122 = "";
  $NC.G_VAR.policyVal.CM123 = "";
  $NC.G_VAR.policyVal.CM124 = "";

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCall("/CM01030E/callSP.do", {
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

    // 행 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    onGetDetail({
      data: null
    });
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "1";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);

  if (G_GRDMASTER.data.getLength() == 0) {
    $NC.setEnable("#btnSetLoc_Order", false);
    $NC.setEnable("#btnCreate", false);
  }
}

function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "BANK_CD",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
    // 로케이션 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB);
    onGetSub({
      data: null
    });
  }
}

function onGetSub(ajaxData) {

  $NC.setInitGridData(G_GRDSUB, ajaxData);
  if (G_GRDSUB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDSUB.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSUB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSUB, {
        selectKey: ["BAY_CD", "LEV_CD"],
        selectVal: G_GRDSUB.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdSub", 0, 0);
  }
}

function onSave(ajaxData) {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "ZONE_CD"
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "BANK_CD"
  });
  var lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDSUB, {
    selectKey: ["BAY_CD", "LEV_CD"]
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL.lastKeyVal = lastKeyVal2;
  G_GRDSUB.lastKeyVal = lastKeyVal3;
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
  } else if (G_GRDDETAIL.focused) {
    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

    if (rowData.CRUD === "D") {
      rowData.CRUD = "U";
      G_GRDDETAIL.data.updateItem(rowData.id, rowData);
      // 마지막 선택 Row 수정 상태로 변경
      G_GRDDETAIL.lastRowModified = true;
    }
  } else {
    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);

    if (rowData.CRUD === "D") {
      rowData.CRUD = "U";
      G_GRDSUB.data.updateItem(rowData.id, rowData);
      // 마지막 선택 Row 수정 상태로 변경
      G_GRDSUB.lastRowModified = true;
    }
  }
}

function onBtnCreateClick() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var ZONE_CD = rowData.ZONE_CD;

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "CM01031P",
    PROGRAM_NM: "기본로케이션 생성",
    url: "cm/CM01031P.html",
    width: 500,
    height: 240,
    userData: {
      P_CENTER_CD: CENTER_CD,
      P_ZONE_CD: ZONE_CD,
      P_POLICY_CM120: $NC.G_VAR.policyVal.CM120, // 로케이션 표시
      P_POLICY_CM122: $NC.G_VAR.policyVal.CM122, // 로케이션 행 길이
      P_POLICY_CM123: $NC.G_VAR.policyVal.CM123, // 로케이션 열 길이
      P_POLICY_CM124: $NC.G_VAR.policyVal.CM124
    },
    onOk: function() {
      _Inquiry();
      G_GRDMASTER.lastKeyVal = ZONE_CD;
    }
  });
}

function onBtnSetLoc_OrderClick() {

  var result = confirm("로케이션 셀순위를 재설정하시겠습니까?");
  if (!result) {
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  $NC.serviceCall("/CM01030E/callSP.do", {
    P_QUERY_ID: "CM_SET_LOC_ORDER",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, function() {
    alert('로케이션 셀순위가 설정되었습니다.');
    _Inquiry();
  });
}
