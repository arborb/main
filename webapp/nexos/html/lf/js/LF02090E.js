/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    FEE_HEAD_CD: "300",
    CHARGE_UNIT_DIV: null,
    CENTER_FUNC_DIV: null
  });

  // 기간구분
  $NC.serviceCallAndWait("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "CENTER_FUNC_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, function(ajaxData) {
    $NC.G_VAR.CENTER_FUNC_DIV = $NC.toArray(ajaxData);
  });

  // 정산단위구분
  $NC.serviceCallAndWait("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "CHARGE_UNIT_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, function(ajaxData) {
    $NC.G_VAR.CHARGE_UNIT_DIV = $NC.toArray(ajaxData);
  });

  // 그리드 초기화
  grdMasterInitialize();

  // 조회조건 - 사업부 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  // 사업부 검색 이미지 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnCopy").click(onCopyOwnBrand);

  $("#btnQOwnBrand_Cd").click(showOwnBranPopup);
  $("#btnQFee_Head_Cd").click(showFee_Head_CdPopup);
  $("#btnQFee_Base_Cd").click(showFee_Base_CdPopup);
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

  $NC.resizeContainer("#divCenterView", clientWidth, clientHeight);

  var height = clientHeight - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, height);
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();

  // 사업부 값 변경시 마스터체크
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
  case "OWNBRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
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
  case "FEE_HEAD_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_CENTER_FUNC_DIV: '1',
        P_FEE_HEAD_CD: val
      };
      O_RESULT_DATA = $NP.getFee_Head_CdInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onHeadPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showFee_Head_CdPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onHeadPopup, onHeadPopup);
    }
    return;
  case "FEE_BASE_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    var FEE_HEAD_CD = $NC.getValue("#edtQFee_Head_Cd");
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_FEE_HEAD_CD: FEE_HEAD_CD,
        P_FEE_BASE_CD: val
      };
      O_RESULT_DATA = $NP.getFee_Base_CdInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBasePopup(O_RESULT_DATA[0]);
    } else {
      $NP.showFee_Base_CdPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBasePopup, onBasePopup);
    }
    return;
  }

  // 화면클리어
  onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var OWN_BRAND_CD = $NC.getValue("#edtQOwnBrand_Cd", true);

  var FEE_HEAD_CD = $NC.getValue("#edtQFee_Head_Cd", true);
  var FEE_BASE_CD = $NC.getValue("#edtQFee_Base_Cd", true);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: OWN_BRAND_CD,
    P_FEE_HEAD_CD: FEE_HEAD_CD,
    P_FEE_BASE_CD: FEE_BASE_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LF02090E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
    var rowData = G_GRDMASTER.data.getItem(rowCount - 1);
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    if (rowData.CRUD == "N") {
      $NC.setFocusGrid(G_GRDMASTER, rowCount - 1, 0, true);
      return;
    }
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CENTER_CD: 'G1',
    BU_CD: $NC.getValue("#edtQBu_Cd"),
    FEE_HEAD_CD: null,
    FEE_BASE_CD: null,
    CONTRACT_START_DATE: $NC.getFirstDate($NC.G_USERINFO.LOGIN_DATE),
    KEEP_DIV: "0",
    DEPART_CD: "000000000",
    LINE_CD: "000000000",
    CLASS_CD: "000000000",
    BRAND_CD: null,
    ITEM_CD_T: "0",
    PERIOD_DIV: null,
    CHARGE_UNIT_DIV: null,
    CHARGE_PRICE: "0",
    EXTRA_PRICE: "0",
    CALC_QTY_DIV: "10",
    CALC_AMT_DIV: "10",
    CONTRACT_END_DATE: null,
    CARRIER_CD: "0",
    CENTER_FUNC_DIV: "1",
    BOX_DIV: "0",
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

  var BU_CD = $NC.getValue("#edtQBu_Cd");

  var saveMasterDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: 'G1',
        P_BU_CD: BU_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
        P_FEE_BASE_CD: rowData.FEE_BASE_CD,
        P_CONTRACT_START_DATE: $NC.G_USERINFO.LOGIN_DATE,
        P_KEEP_DIV: rowData.KEEP_DIV,
        P_DEPART_CD: rowData.DEPART_CD,
        P_LINE_CD: rowData.LINE_CD,
        P_CLASS_CD: rowData.CLASS_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_PERIOD_DIV: rowData.PERIOD_DIV,
        P_CHARGE_UNIT_DIV: rowData.CHARGE_UNIT_DIV,
        P_CHARGE_PRICE: rowData.CHARGE_PRICE,
        // P_EXTRA_PRICE: rowData.EXTRA_PRICE,
        P_CALC_QTY_DIV: rowData.CALC_QTY_DIV,
        P_CALC_AMT_DIV: rowData.CALC_AMT_DIV,

        P_CARRIER_CD: "0",
        P_PAY_CHA_DIV: rowData.CENTER_FUNC_DIV,
        P_BOX_DIV: "0",
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveMasterDS.push(saveData);
    }
  }

  if (saveMasterDS.length > 0) {
    $NC.serviceCall("/LF02090E/save.do", {
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
    selectKey: ["FEE_HEAD_CD", "FEE_BASE_CD", "CONTRACT_START_DATE"],
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
    id: "BU_CD",
    field: "BU_CD",
    name: "사업구분",
    minWidth: 180
  // groupToggler: true
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "위탁사코드",
    minWidth: 100,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdMasterOnPopup,
      isKeyField: true
    }
  // groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "위탁사명",
    minWidth: 180
  // groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "FEE_HEAD_CD",
    field: "FEE_HEAD_CD",
    name: "정산그룹코드",
    minWidth: 60,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdMasterOnPopup,
      isKeyField: true
    },
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "FEE_HEAD_NM",
    field: "FEE_HEAD_NM",
    name: "정산그룹명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "FEE_BASE_CD",
    field: "FEE_BASE_CD",
    name: "정산항목",
    minWidth: 60,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdMasterOnPopup,
      isKeyField: true
    },
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "FEE_BASE_NM",
    field: "FEE_BASE_NM",
    name: "정산항목명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD_T",
    field: "ITEM_CD_T",
    name: "상세기준",
    minWidth: 90,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdMasterOnPopup,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM_T",
    field: "ITEM_NM_T",
    name: "상세단가명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "CHARGE_UNIT_DIV_F",
    field: "CHARGE_UNIT_DIV_F",
    name: "단위구분",
    minWidth: 120,
    editor: Slick.Editors.ComboBox,
    editorOptions: {
      codeField: "CHARGE_UNIT_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      data: $NC.G_VAR.CHARGE_UNIT_DIV,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "CHARGE_PRICE",
    field: "CHARGE_PRICE",
    name: "기준단가",
    minWidth: 60,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true
  };

  // Data Grouping
  /*
  var dataGroupOptions = {
    getter: function(rowData) {
      return $NC.lPad(rowData.BU_CD, 10) + "|" + $NC.lPad(rowData.BRAND_CD, 20);
    }
  };
  */

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LF02090E.RS_MASTER",
    sortCol: "FEE_BASE_CD",
    gridOptions: options
  // dataGroupOptions: dataGroupOptions
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
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
    if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

/**
 * 그리드의 편집 셀 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnCellChange(e, args) {

  var rowData = args.item
  switch (G_GRDMASTER.view.getColumnField(args.cell)) {
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.BRAND_CD)) {
      P_QUERY_PARAMS = {
        P_CUST_CD: $NC.G_USERINFO.CUST_CD,
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_OWN_BRAND_CD: rowData.BRAND_CD
      };
      O_RESULT_DATA = $NP.getOwnBrand_lfInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrand1Popup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBran_lfPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrand1Popup, onOwnBrand1Popup);
    }
    return;
  case "ITEM_CD_T":
    if ($NC.isNull(rowData.FEE_BASE_CD)) {
      alert("세부코드을 먼저 선택하시기 바랍니다.");
      rowData.ITEM_CD_T = "";
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("FEE_BASE_CD"), true, true);
      return;
    }
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.ITEM_CD_T)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_OWN_BRAND_CD: rowData.BRAND_CD,
        P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
        P_FEE_BASE_CD: rowData.FEE_BASE_CD,
        P_CODE_CD: rowData.ITEM_CD_T,
        P_USER_ID: $NC.G_USERINFO.USER_ID,
      };
      O_RESULT_DATA = $NP.getItem_LfInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onGridItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItem_LfPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onGridItemPopup, onGridItemPopup);
    }
    return;
  case "FEE_HEAD_CD":
    if ($NC.isNull(rowData.BRAND_CD)) {
      alert("위탁사를 먼저 선택하시기 바랍니다.");
      rowData.FEE_HEAD_CD = "";
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("BRAND_CD"), true, true);
      return;
    }
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];

    if (!$NC.isNull(rowData.FEE_HEAD_CD)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
        P_CENTER_FUNC_DIV: "1"
      };
      O_RESULT_DATA = $NP.getFee_Head_CdInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onHead1Popup(O_RESULT_DATA[0]);
    } else {
      $NP.showFee_Head_CdPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onHead1Popup, onHead1Popup);
    }
    return;
  case "FEE_BASE_CD":
    if ($NC.isNull(rowData.FEE_HEAD_CD)) {
      alert("정산그룹을 먼저 선택하시기 바랍니다.");
      rowData.FEE_HEAD_CD = "";
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("FEE_HEAD_CD"), true, true);
      return;
    }
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.FEE_BASE_CD)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
        P_FEE_BASE_CD: rowData.FEE_BASE_CD
      };
      O_RESULT_DATA = $NP.getFee_Base_CdInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBase1Popup(O_RESULT_DATA[0]);
    } else {
      $NP.showFee_Base_CdPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBase1Popup, onBase1Popup);
    }
    return;

  }
  if (!$NC.isNull(rowData.CONTRACT_START_DATE)) {
    if (!$NC.isDate(rowData.CONTRACT_START_DATE)) {
      alert("계약시작일자를 정확히 입력하십시오.");
      rowData.CONTRACT_START_DATE = "";
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: args.row,
        activeCell: G_GRDMASTER.view.getColumnIndex("CONTRACT_START_DATE"),
        editMode: true
      });
      return false;
    } else if (args.cell === G_GRDMASTER.view.getColumnIndex("CONTRACT_START_DATE")) {
      rowData.CONTRACT_START_DATE = $NC.getFirstDate(rowData.CONTRACT_START_DATE);
    }
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

function grdMasterOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "BRAND_CD" && args.column.field !== "FEE_HEAD_CD" && args.column.field !== "FEE_BASE_CD"
      && args.column.field !== "ITEM_CD_T") {
    return true;
  }

  var rowData = G_GRDMASTER.data.getItem(args.row);
  if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
    if (args.column.field == "FEE_HEAD_CD") {
      return false;
    }
    if (args.column.field == "FEE_BASE_CD") {
      return false;
    }
    if (args.column.field == "BRAND_CD") {
      return false;
    }
    if (args.column.field == "ITEM_CD") {
      return false;
    }

  }

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "BRAND_CD") {
    return true;
  }
  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "FEE_BASE_CD" && args.column.field !== "FEE_BASE_CD") {
    return true;
  }

  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      return false;
    }
  }
  return true;
}

/**
 * 그리드 입력 체크
 * 
 * @param row
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
    if ($NC.isNull(rowData.FEE_BASE_CD) || $NC.isNull(rowData.CONTRACT_START_DATE)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.FEE_BASE_CD)) {
      alert("임대수수료구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("FEE_BASE_CD_F"), true);
      return false;
    }

  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdMasterOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDMASTER, args.row, 0, true);
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["FEE_HEAD_CD", "FEE_BASE_CD", "CONTRACT_START_DATE"],
        selectVal: G_GRDMASTER.lastKeyVal,
        activeCell: true
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

function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: ["FEE_HEAD_CD", "FEE_BASE_CD", "CONTRACT_START_DATE"]
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

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  // 전역 변수 값 초기화
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
 * 검색조건의 사업부 검색 이미지 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQBu_Cd", true);
  });
}

function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");

  $NP.showOwnBranPopup({
    P_CUST_CD: '0000',
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQOwnBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQOwnBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQOwnBrand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQOwnBrand_Cd");
    $NC.setValue("#edtQOwnBrand_Nm");
    $NC.setFocus("#edtQOwnBrand_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 정산항목 검색 이미지 클릭
 */
function showFee_Head_CdPopup() {
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  $NP.showFee_Head_CdPopup({
    P_BU_CD: BU_CD,
    P_CENTER_FUNC_DIV: '1',
    P_FEE_HEAD_CD: '%'
  }, onHeadPopup, function() {
    $NC.setFocus("#edtQFee_Head_Cd", true);
  });
}

function onHeadPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQFee_Head_Cd", resultInfo.FEE_HEAD_CD);
    $NC.setValue("#edtQFee_Head_Nm", resultInfo.FEE_HEAD_NM);

    $NC.setValue("#edtQFee_Base_Cd");
    $NC.setValue("#edtQFee_Base_Nm");
  } else {
    $NC.setValue("#edtQFee_Head_Cd");
    $NC.setValue("#edtQFee_Head_Nm");
    $NC.setFocus("#edtQFee_Head_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 세부코드 검색 이미지 클릭
 */
function showFee_Base_CdPopup() {

  var FEE_HEAD_CD = $NC.getValue("#edtQFee_Head_Cd");

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  $NP.showFee_Base_CdPopup({
    P_BU_CD: BU_CD,
    P_FEE_HEAD_CD: FEE_HEAD_CD,
    P_FEE_BASE_CD: "%"
  }, onBasePopup, function() {
    $NC.setFocus("#edtQFee_Base_Cd", true);
  });
}

function onBasePopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQFee_Base_Cd", resultInfo.FEE_BASE_CD);
    $NC.setValue("#edtQFee_Base_Nm", resultInfo.FEE_BASE_NM);

  } else {
    $NC.setValue("#edtQFee_Base_Cd");
    $NC.setValue("#edtQFee_Base_Nm");
    $NC.setFocus("#edtQFee_Base_Cd", true);
  }
  onChangingCondition();
}

/**
 * 그리드의 위탁사 팝업 처리
 */
function grdMasterOnPopup(e, args) {

  var rowData = args.item;

  switch (args.column.field) {
  case "BRAND_CD":
    $NP.showOwnBran_lfPopup({
      P_CUST_CD: $NC.G_USERINFO.CUST_CD,
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_OWN_BRAND_CD: rowData.BRAND_CD
    }, onOwnBrand1Popup, function() {
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("BRAND_CD"), true, true);
    });
    break;
  case "FEE_HEAD_CD":
    if ($NC.isNull(rowData.BRAND_CD)) {
      alert("위탁사코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("BRAND_CD"), true, true);
      return;
    }
    $NP.showFee_Head_CdPopup({
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_CENTER_FUNC_DIV: rowData.CENTER_FUNC_DIV,
      P_FEE_HEAD_CD: rowData.FEE_HEAD_CD
    }, onHead1Popup, function() {
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("FEE_HEAD_CD"), true, true);
    });
    break;
  case "FEE_BASE_CD":
    if ($NC.isNull(rowData.FEE_HEAD_CD)) {
      alert("정산그룹을 먼저 선택하시기 바랍니다.");
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("FEE_HEAD_CD"), true, true);
      return;
    }
    $NP.showFee_Base_CdPopup({
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
      P_FEE_BASE_CD: rowData.FEE_BASE_CD
    }, onBase1Popup, function() {
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("FEE_BASE_CD"), true, true);
    });
    break;
  case "ITEM_CD_T":
    if ($NC.isNull(rowData.FEE_BASE_CD)) {
      alert("세부코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("FEE_BASE_CD"), true, true);
      return;
    }
    $NP.showItem_LfPopup({
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_OWN_BRAND_CD: rowData.BRAND_CD,
      P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
      P_FEE_BASE_CD: rowData.FEE_BASE_CD,
      P_CODE_CD: "%",
      P_USER_ID: $NC.G_USERINFO.USER_ID,
    }, onGridItemPopup, function() {
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("ITEM_CD_T"), true, true);
    });
    break;

  }
}

/**
 * 그리드에서 위탁사 선택/취소 했을 경우 처리
 * 
 * @param seletedRowData
 */
function onOwnBrand1Popup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.BRAND_CD = resultInfo.OWN_BRAND_CD;
    rowData.BRAND_NM = resultInfo.OWN_BRAND_NM;

    focusCol = G_GRDMASTER.view.getColumnIndex("FEE_BASE_CD");
  } else {
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    focusCol = G_GRDMASTER.view.getColumnIndex("BRAND_CD");
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
 * 그리드에서 위탁사 선택/취소 했을 경우 처리
 * 
 * @param seletedRowData
 */
function onHead1Popup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.FEE_HEAD_CD = resultInfo.FEE_HEAD_CD;
    rowData.FEE_HEAD_NM = resultInfo.FEE_HEAD_NM;

    focusCol = G_GRDMASTER.view.getColumnIndex("FEE_BASE_CD");
  } else {
    rowData.FEE_HEAD_CD = "";
    rowData.FEE_HEAD_NM = "";
    focusCol = G_GRDMASTER.view.getColumnIndex("FEE_HEAD_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
  $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}

function onBase1Popup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.FEE_BASE_CD = resultInfo.FEE_BASE_CD;
    rowData.FEE_BASE_NM = resultInfo.FEE_BASE_NM;

    focusCol = G_GRDMASTER.view.getColumnIndex("PERIOD_DIV_F");
  } else {
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    focusCol = G_GRDMASTER.view.getColumnIndex("FEE_HEAD_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
  $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}

function onCopyOwnBrand() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    return;
  }
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LF02091P",
    PROGRAM_NM: "위탁사 단가 복사",
    url: "lf/LF02091P.html",
    width: 360,
    height: 160,
    userData: {
      P_OWN_BRAND_CD: rowData.BRAND_CD,
      P_OWN_BRAND_NM: rowData.BRAND_NM,
      P_BU_CD: rowData.BU_CD,
      P_CUST_CD: $NC.getValue("#edtQCust_Cd")

    },
    onOk: function() {
      _Inquiry();
    }
  });
}

function onGridItemPopup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.ITEM_CD_T = resultInfo.CODE_CD;
    rowData.ITEM_NM_T = resultInfo.CODE_NM;


    focusCol = G_GRDMASTER.view.getColumnIndex("CHARGE_UNIT_DIV_F");
  } else {
    rowData.ITEM_CD_T = "";
    rowData.ITEM_NM_T = "";


    focusCol = G_GRDMASTER.view.getColumnIndex("ITEM_CD_T");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
  $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}
