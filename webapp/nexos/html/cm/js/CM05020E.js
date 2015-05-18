/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({ // 현재 액티브된 뷰 및 그리드 정보
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
      setPolicyValInfo();
    }
  });
}

function _SetResizeOffset() {

  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * 조회조건이 변경될 때 호출
 */
function onChangingCondition() {
  // 초기화
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
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();
  switch (id) {
  case "CENTER_CD":
    var CENTER_CD = val;
    $NC.serviceCall("/CM05020E/getDataSet.do", {
      P_QUERY_ID: "CM05020E.RS_REF2",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: $NC.isNull(CENTER_CD) ? $NC.G_USERINFO.CENTER_CD : CENTER_CD
      })
    }, onGetZoneCombo);
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
    P_CENTER_CD: CENTER_CD,
    P_CUST_CD: $NC.G_USERINFO.CUST_CD
  });

  // 조회조건에 따라 변경할 반품로케이션 그리드 콤보 세팅
  $NC.serviceCall("/CM05020E/getDataSet.do", {
    P_QUERY_ID: "CM05020E.RS_REF1",
    P_QUERY_PARAMS: $NC.getParams({
      P_CUST_CD: $NC.G_USERINFO.CUST_CD
    })
  }, onGetBrandCombo);

  $NC.serviceCall("/CM05020E/getDataSet.do", {
    P_QUERY_ID: "CM05020E.RS_REF2",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD
    })
  }, onGetZoneCombo);

  // 데이터 조회
  $NC.serviceCall("/CM05020E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

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
      G_GRDMASTER.view.gotoCell(rowCount - 1, 0, true);
      return;
    }
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
    CUST_CD: $NC.G_USERINFO.CUST_CD,
    ITEM_STATE: "X",
    BRAND_CD: null,
    VENDOR_CD: "0",
    ZONE_CD: null,
    BANK_CD: null,
    BAY_CD: null,
    LEV_CD: null,
    LOCATION_CD: null,
    BRAND_CD_F: null,
    VENDOR_NM: "전체",
    ITEM_STATE_F: null,
    ITEM_STATE_F: $NC.getGridComboName(G_GRDMASTER, {
      colFullNameField: "ITEM_STATE_F",
      searchVal: "X",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    }),
    ZONE_CD_F: null,
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };
  G_GRDMASTER.data.addItem(newRowData);

  $NC.setGridSelectRow(G_GRDMASTER, rowCount);
  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;

  // 신규 데이터 생성 이벤트 호출
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

  var saveMasterDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_VENDOR_CD: rowData.VENDOR_CD,
        P_CUST_CD: $NC.G_USERINFO.CUST_CD,
        P_ZONE_CD: rowData.ZONE_CD,
        P_BANK_CD: rowData.BANK_CD,
        P_BAY_CD: rowData.BAY_CD,
        P_LEV_CD: rowData.LEV_CD,
        P_LOCATION_CD: rowData.LOCATION_CD,
        P_DSP_LOCATION_POLICY: $NC.G_VAR.policyVal.CM120,
        P_CRUD: rowData.CRUD
      };
      saveMasterDS.push(saveData);
    }
  }

  if (saveMasterDS.length > 0) {
    $NC.serviceCall("/CM05020E/save.do", {
      P_DS_MASTER: $NC.toJson(saveMasterDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

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
    selectKey: ["ITEM_STATE", "BRAND_CD", "FACT_CD", "ZONE_CD", "BANK_CD", "BAY_CD", "LEV_CD"],
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
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상품상태",
    minWidth: 100,
    cssClass: "align-center",
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "ITEM_STATE",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "ITEM_STATE",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD_F",
    field: "BRAND_CD_F",
    name: "판매사",
    minWidth: 160,
    editor: Slick.Editors.ComboBox
  });

  $NC.setGridColumn(columns, {
    id: "VENDOR_CD",
    field: "VENDOR_CD",
    name: "공급처코드",
    minWidth: 100,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdMasterOnPopup,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ZONE_CD_F",
    field: "ZONE_CD_F",
    name: "존",
    minWidth: 160,
    editor: Slick.Editors.ComboBox
  });
  $NC.setGridColumn(columns, {
    id: "BANK_CD",
    field: "BANK_CD",
    name: "행",
    minWidth: 80,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    },
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BAY_CD",
    field: "BAY_CD",
    name: "열",
    minWidth: 80,
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
    minWidth: 80,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    },
    cssClass: "align-center"
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
    queryId: "CM05020E.RS_MASTER",
    sortCol: "ITEM_STATE_F",
    gridOptions: options
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);

}

function grdMasterOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDMASTER, args.row, 0, true);
}

function grdMasterOnBeforeEditCell(e, args) {

  var rowData = G_GRDMASTER.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      return false;
    }
  }
  return true;
}

function grdMasterOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDMASTER.view.getColumnField(args.cell)) {
  case "VENDOR_CD":
    if (rowData.VENDOR_CD === "0") {
      rowData.VENDOR_NM = "전체";
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("ZONE_CD_F"), true);
    } else {
      var P_QUERY_PARAMS;
      var O_RESULT_DATA = [ ];
      if (!$NC.isNull(rowData.VENDOR_CD)) {
        P_QUERY_PARAMS = {
          P_CUST_CD: $NC.G_USERINFO.CUST_CD,
          P_VENDOR_CD: rowData.VENDOR_CD,
          P_VIEW_DIV: "1"
        };
        O_RESULT_DATA = $NP.getVendorInfo({
          queryParams: P_QUERY_PARAMS
        });
      }
      if (O_RESULT_DATA.length <= 1) {
        onVendorPopup(O_RESULT_DATA[0]);
      } else {
        $NP.showVendorPopup({
          queryParams: P_QUERY_PARAMS,
          queryData: O_RESULT_DATA
        }, onVendorPopup, onVendorPopup);
      }
      return;
    }
  case "BANK_CD":
    if (rowData.BANK_CD.length !== Number($NC.G_VAR.policyVal.CM122)) {
      alert("행코드 길이를 " + $NC.G_VAR.policyVal.CM122 + "로 하셔야 합니다.");
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("BANK_CD"), true);
    }
    rowData.BANK_CD = rowData.BANK_CD.toUpperCase();
    break;
  case "BAY_CD":
    if (rowData.BAY_CD.length !== Number($NC.G_VAR.policyVal.CM123)) {
      alert("열코드 길이를 " + $NC.G_VAR.policyVal.CM123 + "로 하셔야 합니다.");
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("BAY_CD"), true);
    }
    rowData.BAY_CD = rowData.BAY_CD.toUpperCase();
    break;
  case "LEV_CD":
    if (rowData.LEV_CD.length !== Number($NC.G_VAR.policyVal.CM124)) {
      alert("단코드 길이를 " + $NC.G_VAR.policyVal.CM124 + "로 하셔야 합니다.");
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("LEV_CD"), true);
    }
    rowData.LEV_CD = rowData.LEV_CD.toUpperCase();
    break;
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
    if ($NC.isNull(rowData.ITEM_STATE)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.BRAND_CD)) {
      alert("위탁사를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("BRAND_CD_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.VENDOR_NM)) {
      alert("공급처를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("VENDOR_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.ZONE_CD)) {
      alert("존을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("ZONE_CD_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.BANK_CD)) {
      alert("행을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("BANK_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.BAY_CD)) {
      alert("열을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("BAY_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.LEV_CD)) {
      alert("단을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("LEV_CD"), true);
      return false;
    }
    if (rowData.BANK_CD.length !== Number($NC.G_VAR.policyVal.CM122)) {
      alert("행코드 길이를 " + $NC.G_VAR.policyVal.CM122 + "로 하셔야 합니다.");
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("BANK_CD"), true);
      return false;
    }
    if (rowData.BAY_CD.length !== Number($NC.G_VAR.policyVal.CM123)) {
      alert("열코드 길이를 " + $NC.G_VAR.policyVal.CM123 + "로 하셔야 합니다.");
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("BAY_CD"), true);
      return false;
    }
    if (rowData.LEV_CD.length !== Number($NC.G_VAR.policyVal.CM124)) {
      alert("단코드 길이를 " + $NC.G_VAR.policyVal.CM124 + "로 하셔야 합니다.");
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("LEV_CD"), true);
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

  var rowData = args.item;

  switch (args.column.field) {
  case "VENDOR_CD":
    $NP.showVendorPopup({
      P_CUST_CD: $NC.G_USERINFO.CUST_CD,
      P_VENDOR_CD: "%",
      P_VIEW_DIV: "1",
    }, onVendorPopup, function() {
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("VENDOR_CD"), true, true);
    });
    break;
  }
}

function onGetBrandCombo(ajaxData) {

  var cols = G_GRDMASTER.view.getColumns();
  cols[G_GRDMASTER.view.getColumnIndex("BRAND_CD_F")].editorOptions = {
    codeField: "BRAND_CD",
    dataCodeField: "BRAND_CD",
    dataFullNameField: "BRAND_CD_F",
    data: $NC.toArray(ajaxData),
    isKeyField: true
  };
  G_GRDMASTER.view.setColumns(cols);
}

function onGetZoneCombo(ajaxData) {

  var cols = G_GRDMASTER.view.getColumns();
  cols[G_GRDMASTER.view.getColumnIndex("ZONE_CD_F")].editorOptions = {
    codeField: "ZONE_CD",
    dataCodeField: "ZONE_CD",
    dataFullNameField: "ZONE_CD_F",
    data: $NC.toArray(ajaxData),
    isKeyField: true
  };
  G_GRDMASTER.view.setColumns(cols);
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: new Array("ITEM_STATE", "BRAND_CD", "FACT_CD", "ZONE_CD", "BANK_CD", "BAY_CD", "LEV_CD"),
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
    selectKey: ["ITEM_STATE", "BRAND_CD", "FACT_CD", "ZONE_CD", "BANK_CD", "BAY_CD", "LEV_CD"]
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

function setPolicyValInfo() {

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  $NC.G_VAR.policyVal.CM120 = "";
  $NC.G_VAR.policyVal.CM121 = "";
  $NC.G_VAR.policyVal.CM122 = "";
  $NC.G_VAR.policyVal.CM123 = "";
  $NC.G_VAR.policyVal.CM124 = "";

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCall("/CM05020E/callSP.do", {
      P_QUERY_ID: "WF.GET_POLICY_VAL",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: null,
        P_POLICY_CD: POLICY_CD
      })
    }, onGetPolicyVal);
  }
}

function onGetPolicyVal(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
      $NC.G_VAR.policyVal[resultData.P_POLICY_CD] = resultData.O_POLICY_VAL;
    }
  }
}


/**
 * 공급처 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onVendorPopup(resultInfo) {
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.VENDOR_CD = resultInfo.VENDOR_CD;
    rowData.VENDOR_NM = resultInfo.VENDOR_NM;
    focusCol = G_GRDMASTER.view.getColumnIndex("ZONE_CD_F");
  } else {
    rowData.VENDOR_CD = "";
    rowData.VENDOR_NM = "";
    focusCol = G_GRDMASTER.view.getColumnIndex("VENDOR_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
  $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}
