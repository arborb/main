/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 탭 초기화
  $NC.setInitTab("#divTabView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 조회조건 - 사업부 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  
  // 사업부 검색 이미지 클릭
//  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQCust").click(showQCustPopup);
  $("#btnQBrand_Cd").click(showCustBrandPopup);

  $("#btnT1AddBrand").click(onBtnAddBrand);
  $("#btnT2AddVendor").click(onBtnAddVendor);

  // 그리드 초기화
  grdT1MasterInitialize();
  grdT1DetailInitialize();
  grdT1SubInitialize();
  grdT2MasterInitialize();
  grdT2DetailInitialize();
  grdT2SubInitialize();
  
  // 조회조건 - 사업부팀 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "ITEMBU_TEAM_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQItemBu_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });

}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {
  // 스플리터 초기화
  $NC.setInitSplitter("#divT1TabSheetView", "h", 300);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.gridT1MasterWidth = 350;
  $NC.G_OFFSET.gridT2MasterWidth = 350;
  $NC.G_OFFSET.detailHeight = $("#divT1Button").outerHeight();
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.tabHeaderHeight = $("#divTabView").children(".ui-tabs-nav:first").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border2; /* 탭일 경우는 좌우 */
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_LAYOUT.border1; /* 탭일 경우는 상하 */

  $NC.resizeContainer("#divTabView", clientWidth, clientHeight);

  clientWidth -= $NC.G_LAYOUT.border1;
  clientHeight -= $NC.G_OFFSET.tabHeaderHeight + $NC.G_LAYOUT.border1;

//  if ($("#divTabView").tabs("option", "active") === 0) {

    // Splitter 컨테이너 크기 조정
    var container = $("#divT1TabSheetView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    var splitTopAreaHeight = $("#grdT1Sub").parent().height();
    var height = splitTopAreaHeight - $NC.G_LAYOUT.header;

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Sub", clientWidth, height);

    var splitBottomAreaHeight = $("#divT1Master").parent().height();
    var width = clientWidth - $NC.G_OFFSET.gridT1MasterWidth - $NC.G_LAYOUT.border1 - $NC.G_LAYOUT.margin1;

    $NC.resizeContainer("#divT1Master", $NC.G_OFFSET.gridT1MasterWidth, splitBottomAreaHeight);
    $NC.resizeContainer("#divT1Detail", width, splitBottomAreaHeight);

    height = splitBottomAreaHeight - $NC.G_LAYOUT.header;

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", $NC.G_OFFSET.gridT1MasterWidth, height);
    $NC.resizeGrid("#grdT1Detail", width, height - $NC.G_OFFSET.detailHeight - 1);
    /*
  } else if ($("#divTabView").tabs("option", "active") === 1) {

    // Splitter 컨테이너 크기 조정
    var container = $("#divT2TabSheetView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    var splitTopAreaHeight = $("#grdT2Sub").parent().height();
    var height = splitTopAreaHeight - $NC.G_LAYOUT.header;

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Sub", clientWidth, height);

    var splitBottomAreaHeight = $("#divT2Master").parent().height();
    var width = clientWidth - $NC.G_OFFSET.gridT2MasterWidth - $NC.G_LAYOUT.border1 - $NC.G_LAYOUT.margin1;

    $NC.resizeContainer("#divT2Master", width, splitBottomAreaHeight);
    $NC.resizeContainer("#divT2Detail", $NC.G_OFFSET.gridT2MasterWidth, splitBottomAreaHeight);

    height = splitBottomAreaHeight - $NC.G_LAYOUT.header;

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Master", width, height);
    $NC.resizeGrid("#grdT2Detail", $NC.G_OFFSET.gridT2MasterWidth, height - $NC.G_OFFSET.detailHeight - 1);
  }
  */

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

  var grdObject = $NC.getGridGlobalVar(args.grid);

  if (grdObject.view.getEditorLock().isActive()) {
    grdObject.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(grdObject, args.row);

  var rowData = grdObject.data.getItem(args.row);

  if (args.cell == grdObject.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  grdObject.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  grdObject.lastRowModified = true;
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();
  switch (id) {
  /*
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
    */
  }

  // 화면클리어
  onChangingCondition();
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDT1MASTER);
  $NC.clearGridData(G_GRDT1DETAIL);
  $NC.clearGridData(G_GRDT1SUB);
  $NC.clearGridData(G_GRDT2MASTER);
  $NC.clearGridData(G_GRDT2DETAIL);
  $NC.clearGridData(G_GRDT2SUB);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var ITEMBU_CD = $NC.getValue("#cboQItemBu_Cd");

  if ($("#divTabView").tabs("option", "active") === 0) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1MASTER);
    $NC.setInitGridVar(G_GRDT1DETAIL);
    $NC.setInitGridVar(G_GRDT1SUB);

    // 파라메터 세팅
    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_ITEMBU_CD: ITEMBU_CD
    });

    // 데이터 조회
    $NC.serviceCall("/CM07030E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
  } else {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);

    // 파라메터 세팅
    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_CUST_CD: CUST_CD,
      P_BRAND_CD: BRAND_CD
    });

    // 데이터 조회
    $NC.serviceCall("/CM07030E/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
  }

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

  if ($("#divTabView").tabs("option", "active") === 0) {

    if (G_GRDT1SUB.lastRow == null || G_GRDT1SUB.data.getLength() === 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    // 현재 수정모드면
    if (G_GRDT1SUB.view.getEditorLock().isActive()) {
      G_GRDT1SUB.view.getEditorLock().commitCurrentEdit();
    }

    var saveDS = [ ];
    var rowCount = G_GRDT1SUB.data.getLength();
    for (var row = 0; row < rowCount; row++) {
      var rowData = G_GRDT1SUB.data.getItem(row);
      if (rowData.CRUD == "U") {
        var saveData = {
          P_BRAND_CD: rowData.BRAND_CD,
          P_ITEM_CD: rowData.ITEM_CD,
          P_CUST_CD: rowData.CUST_CD,
          P_VENDOR_CD: rowData.VENDOR_CD,
          P_BUY_PRICE: rowData.BUY_PRICE,
          P_DEAL_DIV: rowData.DEAL_DIV,
          P_OPEN_DATE: rowData.OPEN_DATE,
          P_CLOSE_DATE: rowData.CLOSE_DATE,
          P_CRUD: rowData.CRUD
        };
        saveDS.push(saveData);
      }
    }

    if (saveDS.length > 0) {
      $NC.serviceCall("/CM07030E/save.do", {
        P_DS_MASTER: $NC.toJson(saveDS),
        P_USER_ID: $NC.G_USERINFO.USER_ID
      }, onSave, onSaveError);
    }
  } else {

    if (G_GRDT2SUB.lastRow == null || G_GRDT2SUB.data.getLength() === 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    // 현재 수정모드면
    if (G_GRDT2SUB.view.getEditorLock().isActive()) {
      G_GRDT2SUB.view.getEditorLock().commitCurrentEdit();
    }

    var saveDS = [ ];
    var rowCount = G_GRDT2SUB.data.getLength();
    for (var row = 0; row < rowCount; row++) {
      var rowData = G_GRDT2SUB.data.getItem(row);
      if (rowData.CRUD == "U") {
        var saveData = {
          P_BRAND_CD: rowData.BRAND_CD,
          P_ITEM_CD: rowData.ITEM_CD,
          P_CUST_CD: rowData.CUST_CD,
          P_VENDOR_CD: rowData.VENDOR_CD,
          P_BUY_PRICE: rowData.BUY_PRICE,
          P_REQUEST_QTY_RATE: rowData.REQUEST_QTY_RATE,
          P_DEAL_DIV: rowData.DEAL_DIV,
          P_OPEN_DATE: rowData.OPEN_DATE,
          P_CLOSE_DATE: rowData.CLOSE_DATE,
          P_CRUD: rowData.CRUD
        };
        saveDS.push(saveData);
      }
    }

    if (saveDS.length > 0) {
      $NC.serviceCall("/CM07030E/save.do", {
        P_DS_MASTER: $NC.toJson(saveDS),
        P_USER_ID: $NC.G_USERINFO.USER_ID
      }, onSave, onSaveError);
    }
  }

}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  if ($("#divTabView").tabs("option", "active") === 0) {

    if (G_GRDT1SUB.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    var saveDS = [ ];
    var chkCnt = 0;
    var rowCount = G_GRDT1SUB.data.getLength();
    for (var row = 0; row < rowCount; row++) {
      var rowData = G_GRDT1SUB.data.getItem(row);
      if (rowData.CHECK_YN == "Y") {
        chkCnt++;

        var saveData = {
          P_ITEMBU_CD: rowData.ITEMBU_CD,
          P_OWN_BRAND_CD: rowData.OWN_BRAND_CD,
          P_CRUD: "D"
        };
        saveDS.push(saveData);
      }
    }

    if (chkCnt == 0) {
      alert("삭제할 데이터를 선택하십시오.");
      return;
    }

    var result = confirm("삭제 하시겠습니까?");
    if (result) {
      $NC.serviceCall("/CM07030E/save.do", {
        P_DS_MASTER: $NC.toJson(saveDS),
        P_USER_ID: $NC.G_USERINFO.USER_ID
      }, onSave, onSaveError);
    }
  } else {

    if (G_GRDT2SUB.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    var saveDS = [ ];
    var chkCnt = 0;
    var rowCount = G_GRDT2SUB.data.getLength();
    for (var row = 0; row < rowCount; row++) {
      var rowData = G_GRDT2SUB.data.getItem(row);
      if (rowData.CHECK_YN == "Y") {
        chkCnt++;

        var saveData = {
          P_BRAND_CD: rowData.BRAND_CD,
          P_ITEM_CD: rowData.ITEM_CD,
          P_CUST_CD: rowData.CUST_CD,
          P_VENDOR_CD: rowData.VENDOR_CD,
          P_CRUD: "D"
        };
        saveDS.push(saveData);
      }
    }

    if (chkCnt == 0) {
      alert("삭제할 데이터를 선택하십시오.");
      return;
    }

    var result = confirm("삭제 하시겠습니까?");
    if (result) {
      $NC.serviceCall("/CM07030E/save.do", {
        P_DS_MASTER: $NC.toJson(saveDS),
        P_USER_ID: $NC.G_USERINFO.USER_ID
      }, onSave, onSaveError);
    }
  }
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

/**
 * Tab Active Event
 * 
 * @param event
 * @param ui
 *          newTab: The tab that was just activated.<br>
 *          oldTab: The tab that was just deactivated.<br>
 *          newPanel: The panel that was just activated.<br>
 *          oldPanel: The panel that was just deactivated
 */
function tabOnActivate(event, ui) {

  var id = ui.newTab.prop("id").substr(3).toUpperCase();
  if (id === "TAB1") {
    $NC.hideView("tblAdditionalConditionView", null, "fast", "blind");
    $("div[id^='divAdditionalCondition']").hide();

    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter("#divT1TabSheetView")) {
      // 스필리터를 통한 _OnResize 호출
      $("#divT1TabSheetView").trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter("#divT1TabSheetView", "h", 300);
    }
  }
  /*
  else if (id === "TAB2") {
    $NC.hideView("tblAdditionalConditionView", null, "fast", "blind");
    $("div[id^='divAdditionalCondition']").hide();

    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter("#divT2TabSheetView")) {
      // 스필리터를 통한 _OnResize 호출
      $("#divT2TabSheetView").trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter("#divT2TabSheetView", "h", 300);
    }
  }*/ 
  else {
    $("div[id^='divAdditionalCondition']").show();
  }
  _OnResize($(window));
  onChangingCondition();
}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEMBU_CD",
    field: "ITEMBU_CD",
    name: "상품사업부",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEMBU_NM",
    field: "ITEMBU_NM",
    name: "상품사업부명",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "CM07030E.RS_T1_MASTER",
    sortCol: "ITEMBU_CD",
    gridOptions: options
  });

  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

function grdT1MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1MASTER.lastRow != null) {
    if (row == G_GRDT1MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDT1MASTER.data.getItem(row);
  var ITEMBU_CD = rowData.ITEMBU_CD;
  var CUST_CD = "0000";

  // 상품마스터 변수 초기화
  $NC.setInitGridVar(G_GRDT1DETAIL);
  onGetT1Detail({
    data: null
  });

  // 상품마스터 파라메터 세팅
  G_GRDT1DETAIL.queryParams = $NC.getParams({
    P_CUST_CD: CUST_CD,
    P_ITEMBU_CD: ITEMBU_CD
  });

  // 데이터 조회
  $NC.serviceCall("/CM07030E/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

  // 공급처별 할당상품 변수 초기화
  $NC.setInitGridVar(G_GRDT1SUB);
  onGetT1Sub({
    data: null
  });

  // 공급처별 할당상품 파라메터 세팅
  G_GRDT1SUB.queryParams = $NC.getParams({
    P_ITEMBU_CD: ITEMBU_CD
  });

  // 데이터 조회
  $NC.serviceCall("/CM07030E/getDataSet.do", $NC.getGridParams(G_GRDT1SUB), onGetT1Sub);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Master", row + 1);
}
function grdT1DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    maxWidth: 30,
    resizable: false,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "사업구분",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업구분명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "CHK",
    field: "CHK",
    name: "매칭여부",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_CD",
    field: "OWN_BRAND_CD",
    name: "위탁사",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_NM",
    field: "OWN_BRAND_NM",
    name: "위탁사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "MANAGER_ID",
    field: "MANAGER_ID",
    name: "책임자ID",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SALESMAN_ID",
    field: "SALESMAN_ID",
    name: "영업담당자ID",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CHARGE_NM",
    field: "CHARGE_NM",
    name: "영업담당자명",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ZIP_CD",
    field: "ZIP_CD",
    name: "우편번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_BASIC",
    field: "ADDR_BASIC",
    name: "기본주소",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_DETAIL",
    field: "ADDR_DETAIL",
    name: "상세주소",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "TEL_NO",
    field: "TEL_NO",
    name: "전화번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 120
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailInitialize() {

  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Detail", {
    columns: grdT1DetailOnGetColumns(),
    queryId: "CM07030E.RS_T1_DETAIL",
    sortCol: "BU_CD",
    gridOptions: options
  });

  G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
  G_GRDT1DETAIL.view.onHeaderClick.subscribe(grdT1DetailOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT1DETAIL, "CHECK_YN");
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdT1DetailOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDT1DETAIL.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDT1DETAIL.view.getEditorLock().isActive() && !G_GRDT1DETAIL.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT1DETAIL.data.getLength();
      var rowData;
      G_GRDT1DETAIL.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDT1DETAIL.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT1DETAIL.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdT1DetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1DETAIL.lastRow != null) {
    if (row == G_GRDT1DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Detail", row + 1);
}

function grdT1SubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    maxWidth: 30,
    resizable: false,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "ITEMBU_CD",
    field: "ITEMBU_CD",
    name: "상품사업부",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEMBU_NM",
    field: "ITEMBU_NM",
    name: "상품사업부명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_CD",
    field: "OWN_BRAND_CD",
    name: "위탁사",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_NM",
    field: "OWN_BRAND_NM",
    name: "위탁사명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "MANAGER_ID",
    field: "MANAGER_ID",
    name: "책임자ID",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SALESMAN_ID",
    field: "SALESMAN_ID",
    name: "영업담당자ID",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CHARGE_NM",
    field: "CHARGE_NM",
    name: "영업담당자명",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ZIP_CD",
    field: "ZIP_CD",
    name: "우편번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_BASIC",
    field: "ADDR_BASIC",
    name: "기본주소",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_DETAIL",
    field: "ADDR_DETAIL",
    name: "상세주소",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "TEL_NO",
    field: "TEL_NO",
    name: "전화번호",
    minWidth: 100
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1SubInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Sub", {
    columns: grdT1SubOnGetColumns(),
    queryId: "CM07030E.RS_T1_SUB",
    sortCol: "ITEMBU_CD",
    gridOptions: options
  });

  G_GRDT1SUB.view.onSelectedRowsChanged.subscribe(grdT1SubOnAfterScroll);
  G_GRDT1SUB.view.onHeaderClick.subscribe(grdT1SubOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT1SUB, "CHECK_YN");
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdT1SubOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDT1SUB.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDT1SUB.view.getEditorLock().isActive() && !G_GRDT1SUB.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT1SUB.data.getLength();
      var rowData;
      G_GRDT1SUB.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDT1SUB.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDT1SUB.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT1SUB.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdT1SubOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1SUB.lastRow != null) {
    if (row == G_GRDT1SUB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Sub", row + 1);
}

function grdT2MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90
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
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "판매사명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "박스입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_CNT",
    field: "VENDOR_CNT",
    name: "복수공급처",
    minWidth: 60,
    cssClass: "align-center",
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "CM07030E.RS_T2_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT2MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2MASTER.lastRow != null) {
    if (row == G_GRDT2MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDT2MASTER.data.getItem(row);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  // 상품마스터 변수 초기화
  $NC.setInitGridVar(G_GRDT2DETAIL);
  onGetT2Detail({
    data: null
  });

  // 상품마스터 파라메터 세팅
  G_GRDT2DETAIL.queryParams = $NC.getParams({
    P_CUST_CD: CUST_CD,
    P_BRAND_CD: rowData.BRAND_CD,
    P_ITEM_CD: rowData.ITEM_CD
  });

  // 데이터 조회
  $NC.serviceCall("/CM07030E/getDataSet.do", $NC.getGridParams(G_GRDT2DETAIL), onGetT2Detail);

  // 공급처별 할당상품 변수 초기화
  $NC.setInitGridVar(G_GRDT2SUB);
  onGetT2Sub({
    data: null
  });

  // 공급처별 할당상품 파라메터 세팅
  G_GRDT2SUB.queryParams = $NC.getParams({
    P_CUST_CD: CUST_CD,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: rowData.ITEM_CD
  });

  // 데이터 조회
  $NC.serviceCall("/CM07030E/getDataSet.do", $NC.getGridParams(G_GRDT2SUB), onGetT2Sub);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Master", row + 1);
}
function grdT2DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    maxWidth: 30,
    resizable: false,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "VENDOR_CD",
    field: "VENDOR_CD",
    name: "공급처",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처명",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2DetailInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Detail", {
    columns: grdT2DetailOnGetColumns(),
    queryId: "CM07030E.RS_T2_DETAIL",
    sortCol: "VENDOR_CD",
    gridOptions: options
  });

  G_GRDT2DETAIL.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
  G_GRDT2DETAIL.view.onHeaderClick.subscribe(grdT2DetailOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT2DETAIL, "CHECK_YN");
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdT2DetailOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDT2DETAIL.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDT2DETAIL.view.getEditorLock().isActive() && !G_GRDT2DETAIL.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT2DETAIL.data.getLength();
      var rowData;
      G_GRDT2DETAIL.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDT2DETAIL.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDT2DETAIL.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT2DETAIL.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdT2DetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2DETAIL.lastRow != null) {
    if (row == G_GRDT2DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Detail", row + 1);
}

function grdT2SubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    maxWidth: 30,
    resizable: false,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "VENDOR_CD",
    field: "VENDOR_CD",
    name: "공급처",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 80,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_QTY_RATE",
    field: "REQUEST_QTY_RATE",
    name: "발주비율",
    minWidth: 80,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_DIV_F",
    field: "DEAL_DIV_F",
    name: "거래구분",
    minWidth: 90,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "DEAL_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "DEAL_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "OPEN_DATE",
    field: "OPEN_DATE",
    name: "거래시작일자",
    minWidth: 90,
    editor: Slick.Editors.Date
  });
  $NC.setGridColumn(columns, {
    id: "CLOSE_DATE",
    field: "CLOSE_DATE",
    name: "거래종료일자",
    minWidth: 90,
    editor: Slick.Editors.Date
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2SubInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Sub", {
    columns: grdT2SubOnGetColumns(),
    queryId: "CM07030E.RS_T2_SUB",
    sortCol: "VENDOR_CD",
    gridOptions: options
  });

  G_GRDT2SUB.view.onSelectedRowsChanged.subscribe(grdT2SubOnAfterScroll);
  G_GRDT2SUB.view.onCellChange.subscribe(grdT2SubOnCellChange);
  G_GRDT2SUB.view.onHeaderClick.subscribe(grdT2SubOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT2SUB, "CHECK_YN");
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdT2SubOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDT2SUB.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDT2SUB.view.getEditorLock().isActive() && !G_GRDT2SUB.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT2SUB.data.getLength();
      var rowData;
      G_GRDT2SUB.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDT2SUB.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDT2SUB.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT2SUB.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdT2SubOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2SUB.lastRow != null) {
    if (row == G_GRDT2SUB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Sub", row + 1);
}

function grdT2SubOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDT2SUB.view.getColumnField(args.cell)) {
  case "OPEN_DATE":
    if (!$NC.isNull(rowData.OPEN_DATE)) {
      if (!$NC.isDate(rowData.OPEN_DATE)) {
        alert("거래일자를 정확히 입력하십시오.");
        rowData.OPEN_DATE = "";
        G_GRDT2SUB.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDT2SUB, {
          selectRow: args.row,
          activeCell: G_GRDT2SUB.view.getColumnIndex("OPEN_DATE"),
          editMode: true
        });
        return false;
      } else {
        rowData.OPEN_DATE = $NC.getDate(rowData.OPEN_DATE);
        G_GRDT2SUB.data.updateItem(rowData.id, rowData);
      }
    }
    break;
  case "CLOSE_DATE":
    if (!$NC.isNull(rowData.CLOSE_DATE)) {
      if (!$NC.isDate(rowData.CLOSE_DATE)) {
        alert("종료일자를 정확히 입력하십시오.");
        rowData.CLOSE_DATE = "";
        G_GRDT2SUB.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDT2SUB, {
          selectRow: args.row,
          activeCell: G_GRDT2SUB.view.getColumnIndex("CLOSE_DATE"),
          editMode: true
        });
        return false;
      } else {
        rowData.CLOSE_DATE = $NC.getDate(rowData.CLOSE_DATE);
        G_GRDT2SUB.data.updateItem(rowData.id, rowData);
      }
    }
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDT2SUB.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDT2SUB.lastRowModified = true;
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT1Master(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);

  if (G_GRDT1MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1MASTER, {
        selectKey: "OWN_BRAND_CD",
        selectVal: G_GRDT1MASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT1Master", 0, 0);

    // 상품마스터 초기화
    $NC.setInitGridVar(G_GRDT1DETAIL);
    onGetT1Detail({
      data: null
    });

    // 공급처별 할당상품 초기화
    $NC.setInitGridVar(G_GRDT1SUB);
    onGetT1Sub({
      data: null
    });
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT1Detail(ajaxData) {

  $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDT1DETAIL, "CHECK_YN");

  if (G_GRDT1DETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT1DETAIL, 0);
  } else {
    $NC.setGridDisplayRows("#grdT1Detail", 0, 0);
  }
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT1Sub(ajaxData) {

  $NC.setInitGridData(G_GRDT1SUB, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDT1SUB, "CHECK_YN");

  if (G_GRDT1SUB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1SUB.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1SUB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1SUB, {
        selectKey: "OWN_BRAND_CD",
        selectVal: G_GRDT1SUB.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT1Sub", 0, 0);
  }
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT2Master(ajaxData) {

  $NC.setInitGridData(G_GRDT2MASTER, ajaxData);

  if (G_GRDT2MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT2MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT2MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT2MASTER, {
        selectKey: "ITEM_CD",
        selectVal: G_GRDT2MASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT2Master", 0, 0);

    // 상품마스터 초기화
    $NC.setInitGridVar(G_GRDT2DETAIL);
    onGetT2Detail({
      data: null
    });

    // 공급처별 할당상품 초기화
    $NC.setInitGridVar(G_GRDT2SUB);
    onGetT2Sub({
      data: null
    });
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
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT2Detail(ajaxData) {

  $NC.setInitGridData(G_GRDT2DETAIL, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDT2DETAIL, "CHECK_YN");

  if (G_GRDT2DETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT2DETAIL, 0);
  } else {
    $NC.setGridDisplayRows("#grdT2Detail", 0, 0);
  }
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT2Sub(ajaxData) {

  $NC.setInitGridData(G_GRDT2SUB, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDT2SUB, "CHECK_YN");

  if (G_GRDT2SUB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT2SUB.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT2SUB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT2SUB, {
        selectKey: ["VENDOR_CD", "ITEM_CD"],
        selectVal: G_GRDT2SUB.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT2Sub", 0, 0);
  }
}

/**
 * 검색조건의 위탁사 검색 이미지 클릭
 */
function showQCustPopup() {

  $NP.showCustPopup({
    P_CUST_CD: "%"
  }, onQCustPopup, function() {
    $NC.setFocus("#edtQCust_Cd", true);
  });
}

/**
 * 위탁사 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onQCustPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
    $NC.setValue("#edtQCust_Nm", resultInfo.CUST_NM);
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
  } else {
    $NC.setValue("#edtQCust_Cd");
    $NC.setValue("#edtQCust_Nm");
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQCust_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showCustBrandPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NP.showCustBrandPopup({
    P_CUST_CD: CUST_CD,
    P_BRAND_CD: "%"
  }, onCustBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onCustBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  onChangingCondition();
}

/**
 * 위탁사 추가
 */
function onBtnAddBrand() {

  if (G_GRDT1DETAIL.data.getLength() === 0) {
    alert("추가할 데이터가 없습니다.");
    return;
  }

  var checkedValueDS = [ ];
  var rowCount = G_GRDT1DETAIL.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT1DETAIL.data.getItem(row);
    if (rowData.CHECK_YN == "Y" && rowData.CHK == "N") {
      checkedValueDS.push(rowData.OWN_BRAND_CD);
    }
  }

  if (checkedValueDS.length == 0) {
    alert("이미 매칭된 위탁사이거나 선택하신 위탁사가 없습니다.");
    return;
  }

  var result = confirm("선택하신 위탁사를 해당상품사업부와 매칭 하시겠습니까?");
  if (result) {
    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

    $NC.serviceCall("/CM07030E/callItemBuMatchOwnBrand.do", {
      P_QUERY_PARAMS: $NC.getParams({
        P_ITEMBU_CD: rowData.ITEMBU_CD,
        P_ITEMBU_NM: rowData.ITEMBU_NM,
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_CHECKED_VALUE: checkedValueDS.toString()
      })
    }, onAddBrand);
  }
}

function onAddBrand(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.O_MSG);
      return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
      selectKey: "ITEMBU_CD"
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal;
  }
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */
/*
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
*/
/**
 * 공급처추가
 */
function onBtnAddVendor() {

  if (G_GRDT2DETAIL.data.getLength() === 0) {
    alert("추가할 데이터가 없습니다.");
    return;
  }

  var checkedValueDS = [ ];
  var rowCount = G_GRDT2DETAIL.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT2DETAIL.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      checkedValueDS.push(rowData.VENDOR_CD);
    }
  }

  if (checkedValueDS.length == 0) {
    alert("추가 상품을 선택하십시오.");
    return;
  }

  var result = confirm("공급처를 추가 하시겠습니까?");
  if (result) {
    var rowData = G_GRDT2MASTER.data.getItem(G_GRDT2MASTER.lastRow);

    $NC.serviceCall("/CM07030E/callVendorItemAddVendor.do", {
      P_QUERY_PARAMS: $NC.getParams({
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_CHECKED_VALUE: checkedValueDS.toString()
      })
    }, onAddVendor);
  }
}

function onAddVendor(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.O_MSG);
      return;
    }

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT2MASTER, {
      selectKey: "ITEM_CD"
    });
    _Inquiry();
    G_GRDT2MASTER.lastKeyVal = lastKeyVal;
  }
}

function onSave(ajaxData) {

  if ($("#divTabView").tabs("option", "active") === 0) {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
      selectKey: "VENDOR_CD"
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1SUB, {
      selectKey: "ITEM_CD"
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
    G_GRDT1SUB.lastKeyVal = lastKeyVal2;
  } else {

    var lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDT2MASTER, {
      selectKey: "ITEM_CD"
    });
    var lastKeyVal4 = $NC.getGridLastKeyVal(G_GRDT2SUB, {
      selectKey: ["VENDOR_CD", "ITEM_CD"]
    });
    _Inquiry();
    G_GRDT2MASTER.lastKeyVal = lastKeyVal3;
    G_GRDT2SUB.lastKeyVal = lastKeyVal4;
  }
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}