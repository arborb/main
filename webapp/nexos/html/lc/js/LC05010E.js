/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    policyVal: {
      LI420: ""
    }
  });

  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();

  // 그리드 초기화
  grdMasterInitialize();

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  
  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showBuBrandPopup);
  $("#btnQItemPopup").click(showQItemPopup); // 현재고 검색의 상품검색 버튼 클릭

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
      setPolicyValInfo();
    }
  });

  // 조회조건 - 상품상태 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "ITEM_STATE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQItem_State",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true,
    onComplete: function() {
      $NC.setValue("#cboQItem_State", 0);
    }
  });

  // 조회조건 - 존코드 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMZONE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
      P_ZONE_CD: "%"
    })
  }, {
    selector: "#cboQZone_Cd",
    codeField: "ZONE_CD",
    nameField: "ZONE_NM",
    fullNameField: "ZONE_CD_F",
    addAll: true
  });

  $("#btnUpdate1").click(updateValue1);
  $("#btnUpdate2").click(updateValue2);
  $("#btnUpdate3").click(updateValue3);
  $("#btnUpdate4").click(updateValue4);
  $("#btnUpdate5").click(updateValue5);

  $NC.setInitDatePicker("#dtpValid_Date");
  $NC.setValue("#dtpValid_Date");

  $NC.setValue("#rgbHold_Yn2", "N");

}

function _SetResizeOffset() {

  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.topConditionViewHeight = $("#divTopView").outerHeight(true);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_OFFSET.topConditionViewHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  var height = clientHeight - $NC.G_LAYOUT.header;

  // Grid 높이 조정
  $NC.resizeGrid("#grdMaster", clientWidth, height);
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

  var id = view.prop("id").substr(3).toUpperCase();
  switch (id) {
  case "VALID_DATE":
    $NC.setValueDatePicker(view, val, "유통기한을 정확히 입력하십시오.");
    break;
  }
}

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();

  // 브랜드 값 변경시 마스터체크
  switch (id) {
  case "CENTER_CD":
    setPolicyValInfo();
    break;
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
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: $NC.G_USERINFO.CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBuBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBranPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBuBrandPopup, onBuBrandPopup);
    }
    return;
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd", true),
        P_ITEM_CD: val,
        P_VIEW_DIV: "2",
        P_DEPART_CD: "%",
        P_LINE_CD: "%",
        P_CLASS_CD: "%"
      };
      O_RESULT_DATA = $NP.getItemInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onQItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onQItemPopup, onQItemPopup);
    }
    break;
  }

  // 화면클리어
  onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  $NC.setInitGridVar(G_GRDMASTER);

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var ITEM_STATE = $NC.getValue("#cboQItem_State", true);
  var ITEM_LOT = $NC.getValue("#edtQItem_Lot", true);
  var ZONE_CD = $NC.getValue("#cboQZone_Cd");
  var BANK_CD = $NC.getValue("#edtQBank_Cd", true);
  var BAY_CD = $NC.getValue("#edtQBay_Cd", true);
  var LEV_CD = $NC.getValue("#edtQLev_Cd", true);

  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: ITEM_CD,
    P_ITEM_STATE: ITEM_STATE,
    P_ITEM_LOT: ITEM_LOT,
    P_ZONE_CD: ZONE_CD,
    P_BANK_CD: BANK_CD,
    P_BAY_CD: BAY_CD,
    P_LEV_CD: LEV_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });

  // 데이터 조회
  $NC.serviceCall("/LC05010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

  $NC.setValue("#all_check_yn", "N"); // 하단그리드 헤더의 전체선택 체크 박스 선택해제
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

  var rowCount = G_GRDMASTER.data.getLength();

  if (rowCount == null || rowCount === 0) {
    alert("재고속성을 변경할 데이터가 없습니다.");
    return;
  }

  // 현재 수정모드면 grid Editor Lock
  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }

  var result = confirm("재고속성을 변경하시겠습니까?");
  if (!result) {
    return;
  }

  // 물류센터코드는 저장시 선택된 물류센터로 입력

  var spCallDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    // if (rowData.CHECK_YN == "Y") {
    if (rowData.CRUD == "U") {
      chkCnt++;

      var spData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_LOCATION_CD: rowData.LOCATION_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_STOCK_DATE: rowData.STOCK_DATE,
        P_STOCK_IN_GRP: rowData.STOCK_IN_GRP,
        P_STOCK_ID: rowData.STOCK_ID,
        P_VALID_DATE: rowData.VALID_DATE,
        P_BATCH_NO: rowData.BATCH_NO,
        P_HOLD_YN: rowData.HOLD_YN,
        P_OUT_ORDER: rowData.OUT_ORDER,
        P_REMARK1: rowData.REMARK1
      };
      spCallDS.push(spData);
    }
  }

  if (chkCnt == 0) {
    alert("속성을 변경할 재고를 선택하십시오.");
    return;
  }

  $NC.serviceCall("/LC05010E/callPorpertiesUpdate.do", {
    P_DS_MASTER: $NC.getParams(spCallDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError);
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
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "상품규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_BOX",
    field: "STOCK_BOX",
    name: "재고BOX",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_EA",
    field: "STOCK_EA",
    name: "재고EA",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_DATE",
    field: "STOCK_DATE",
    name: "입고일자",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "VALID_DATE",
    field: "VALID_DATE",
    name: "유통기한",
    minWidth: 100,
    editor: Slick.Editors.Date,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BATCH_NO",
    field: "BATCH_NO",
    name: "제조배치번호",
    minWidth: 110,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "HOLD_YN",
    field: "HOLD_YN",
    name: "보류여부",
    minWidth: 60,
    maxWidth: 60,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "OUT_ORDER",
    field: "OUT_ORDER",
    name: "출고우선순위",
    minWidth: 120,
    editor: Slick.Editors.Text,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "IN_ORDER",
    field: "IN_ORDER",
    name: "입고우선순위",
    minWidth: 120,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 6
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LC05010E.RS_MASTER",
    sortCol: "ITEM_CD",
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
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdMasterOnBeforeEditCell(e, args) {

  // 정책옵션에 따라 컬럼 수정 불가하도록 처리
  if ($NC.G_VAR.policyVal.LI420 !== "2") {
    if (args.column.field === "VALID_DATE" || args.column.field === "BATCH_NO") {
      return false;
    }
  } else {
    return true;
  }
}

function grdMasterOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDMASTER.view.getColumnField(args.cell)) {
  case "VALID_DATE":
    if (!$NC.isNull(rowData.VALID_DATE)) {
      if (!$NC.isDate(rowData.VALID_DATE)) {
        alert("유통기한을 정확히 입력하십시오.");
        rowData.VALID_DATE = "";
        $NC.setGridSelectRow(G_GRDMASTER, {
          selectRow: args.row,
          activeCell: G_GRDMASTER.view.getColumnIndex("VALID_DATE"),
          editMode: true
        });
        return false;
      } else {
        rowData.VALID_DATE = $NC.getDate(rowData.VALID_DATE);
      }
    }
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["ITEM_CD", "ITEM_STATE", "ITEM_LOT", "LOCATION_CD", "VALID_DATE", "BATCH_NO"],
        // selectKey: "ITEM_CD",
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
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);

}

function onSave(ajaxData) {
  var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  _Inquiry();
  G_GRDMASTER.lastKeyVal = [lastRowData.ITEM_CD, lastRowData.ITEM_STATE, lastRowData.ITEM_LOT, lastRowData.LOCATION_CD,
      lastRowData.VALID_DATE, lastRowData.BATCH_NO];
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
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
  } else if (args.cell === G_GRDMASTER.view.getColumnIndex("HOLD_YN")) {

    if ($(e.target).is(":checkbox")) {

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDMASTER.data.getItem(args.row);
      if (rowData.HOLD_YN !== checkVal) {
        rowData.HOLD_YN = checkVal;
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
      for ( var row = 0; row < rowCount; row++) {
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
  } else if (args.cell == G_GRDMASTER.view.getColumnIndex("HOLD_YN")) {
    rowData.HOLD_YN = args.val === "Y" ? "N" : "Y";
    if (rowData.CRUD === "R") {
      rowData.CRUD = "U";
    }
  }

  G_GRDMASTER.data.updateItem(rowData.id, rowData);
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

/**
 * 유효일자 일괄변경
 */

function updateValue1() {

  var FR_VALID_DATE = $NC.getValue("#dtpValid_Date");
  for ( var row = 0; row < G_GRDMASTER.data.getLength(); row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      rowData.VALID_DATE = FR_VALID_DATE;
      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
    }
  }
  G_GRDMASTER.data.refresh();
}

/**
 * 배치번호 일괄변경
 */

function updateValue2() {

  var FR_BATCH_NO = $NC.getValue("#edtBatch_No");
  for ( var row = 0; row < G_GRDMASTER.data.getLength(); row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      rowData.BATCH_NO = FR_BATCH_NO;
      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
    }
  }
  G_GRDMASTER.data.refresh();
}

/**
 * 보류여부 일괄변경
 */

function updateValue3() {

  var FR_YN_DIV = $(':radio[name="rgbHold_Yn"]:checked').val();
  for ( var row = 0; row < G_GRDMASTER.data.getLength(); row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      rowData.HOLD_YN = FR_YN_DIV;
      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
    }
  }
  G_GRDMASTER.data.refresh();
}

/**
 * 출고우선순위 일괄변경
 */

function updateValue4() {

  var FR_OUT_ORDER = $NC.getValue("#edtOut_Order");
  for ( var row = 0; row < G_GRDMASTER.data.getLength(); row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      rowData.OUT_ORDER = FR_OUT_ORDER;
      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
    }
  }
  G_GRDMASTER.data.refresh();
}

/**
 * 비고사항 일괄변경
 */

function updateValue5() {

  var FR_REMARK1 = $NC.getValue("#edtRemark1");
  for ( var row = 0; row < G_GRDMASTER.data.getLength(); row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      rowData.REMARK1 = FR_REMARK1;
      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
    }
  }
  G_GRDMASTER.data.refresh();
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

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");

  $NP.showOwnBranPopup({
    P_CUST_CD:  $NC.G_USERINFO.CUST_CD,   
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onBuBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
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
    $NC.setFocus("#edtQBrand_Cd", true);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onBuBrandPopup(resultInfo) {

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
 * 상품 검색 팝업 표시
 */
function showQItemPopup() {
  $NP.showItemPopup({
    P_BU_CD: $NC.getValue("#edtQBu_Cd"),
    P_ITEM_CD: "%",
    P_VIEW_DIV: "2",
    P_DEPART_CD: "%",
    P_LINE_CD: "%",
    P_CLASS_CD: "%"
  }, onQItemPopup, function() {
    $NC.setFocus("#edtQItem_Cd", true);
  });
}

/**
 * 상품 검색 팝업에서 상품선택 혹은 취소 했을 경우
 */
function onQItemPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQItem_Cd", resultInfo.ITEM_CD);
    $NC.setValue("#edtQItem_Nm", resultInfo.ITEM_NM);

  } else {
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");
    $NC.setFocus("#edtQItem_Cd", true);
  }
}

function setPolicyValInfo() {

  $NC.G_VAR.policyVal.LI420 = "";

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  for (POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCall("/LC05010E/callSP.do", {
      P_QUERY_ID: "WF.GET_POLICY_VAL",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
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
  var canProcess = $NC.G_VAR.policyVal.LI420 === "2";
  $NC.setEnable("#btnUpdate1", canProcess);
  $NC.setEnable("#btnUpdate2", canProcess);
  $NC.setEnable("#dtpValid_Date", canProcess);
  $NC.setEnable("#edtBatch_No", canProcess);
}
