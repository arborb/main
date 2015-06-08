/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    printOptions: [{
      PRINT_INDEX: 0,
      PRINT_COMMENT: "고정로케이션라벨 출력"
    }]
  });

  // 그리드 초기화
  grdMasterInitialize();

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

  $("#btnQBrand_Cd").click(showOwnBranPopup);

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

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * 조회조건이 변경될 때 호출
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();
  switch (id) {
  // 물류센터 값 변경시 존코드 combobox도 재설정
  case "CENTER_CD":
    $NC.setInitCombo("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMZONE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: val,
        P_ZONE_CD: "%"
      })
    }, {
      selector: "#cboQZone_Cd",
      codeField: "ZONE_CD",
      nameField: "ZONE_NM",
      fullNameField: "ZONE_CD_F",
      addAll: true
    });
    break;
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.G_USERINFO.BU_CD;
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

  // 화면클리어
  onChangingCondition();
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

  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var ZONE_CD = $NC.getValue("#cboQZone_Cd", true);

  var BANK_CD1 = $NC.getValue("#edtQBank_Cd1");
  if ($NC.isNull(BANK_CD1)) {
    BANK_CD1 = "0";
  } else {
    if (BANK_CD1.length < 2) {
      alert("행 첫번째 값을 정확히 입력하십시오.");
      $NC.setFocus("#edtQBank_Cd1");
      return;
    }
  }
  var BANK_CD2 = $NC.getValue("#edtQBank_Cd2");
  if ($NC.isNull(BANK_CD2)) {
    BANK_CD2 = "ZZZ";
  } else {
    if (BANK_CD2.length < 2) {
      alert("행 두번째 값을 정확히 입력하십시오.");
      $NC.setFocus("#edtQBank_Cd2");
      return;
    }
  }
  if (BANK_CD1 > BANK_CD2) {
    alert("행 첫번째 값이 두번째 값보다 클 수 없습니다.");
    $NC.setFocus("#edtQBank_Cd1");
    return;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BRAND_CD: BRAND_CD,
    P_ZONE_CD: ZONE_CD,
    P_BANK_CD1: BANK_CD1,
    P_BANK_CD2: BANK_CD2
  });

  // 데이터 조회
  $NC.serviceCall("/CS05010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
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

  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }

  var center_Cd = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(center_Cd)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var checkedValueDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN === "Y") {
      checkedValueDS.push(rowData.CHECK_VALUE);
    }
  }
  if (checkedValueDS.length == 0) {
    alert("출력할 데이터를 선택하십시오.");
    return;
  }

  var printOptions = {
    reportDoc: "common/LABEL_ITEMLOC",
    queryId: "WR.RS_LABEL_ITEMLOC01",
    queryParams: {
      P_CENTER_CD: center_Cd
    },
    checkedValue: checkedValueDS.toString()

  };

  $NC.G_MAIN.showPrintPreview(printOptions);
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    maxWidth: 30,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "ZONE_CD",
    field: "ZONE_CD",
    name: "존코드",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ZONE_NM",
    field: "ZONE_NM",
    name: "존명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "BANK_CD",
    field: "BANK_CD",
    name: "행",
    minWidth: 50,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BAY_CD",
    field: "BAY_CD",
    name: "열",
    minWidth: 50,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LEV_CD",
    field: "LEV_CD",
    name: "단",
    minWidth: 50,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "판매사",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "판매사명",
    minWidth: 100
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
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 100,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CM05030Q.RS_MASTER",
    sortCol: "ZONE_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
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
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          grid, row, cell, val
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

function grdMasterOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "CHECK_YN") {
    return false;
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
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "1";

  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  // 전역 변수 값 초기화
  $NC.clearGridData(G_GRDMASTER);
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");

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
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {

  var CUST_CD = $NC.G_USERINFO.CUST_CD;
  var BU_CD = $NC.G_USERINFO.BU_CD;

  $NP.showOwnBranPopup({
    P_CUST_CD: CUST_CD,
    P_BU_CD: BU_CD,
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
