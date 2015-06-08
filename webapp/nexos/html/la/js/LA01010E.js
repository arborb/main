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

  // 그리드 초기화
  grdT1MasterInitialize();
  grdT1DetailInitialize();
  grdT2MasterInitialize();

  
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $("#lblQRequest_Div").hide();
  $("#cboQRequest_Div").hide();
  
  $NC.setInitDatePicker("#dtpQRequest_Date");

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQVendor_Cd").click(showVendorPopup);
  $("#btnQItem_Cd").click(showItemPopup);
  // 발주생성 버튼클릭
  $("#btnRequestCreate").click(onBtnRequestCreate);

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

  // 조회조건 - 발주구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "REQUEST_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQRequest_Div",
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

  $("#tdQDsp_Item_Cd").hide();
  $NC.setInitSplitter("#divT1TabSheetView", "h", 300);
}

function _SetResizeOffset() {

  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $NC.G_LAYOUT.border1;
  $NC.G_OFFSET.gridHeightOffset = $NC.G_LAYOUT.tabHeader + $NC.G_LAYOUT.header + $NC.G_OFFSET.nonClientHeight
      + ($NC.G_LAYOUT.border1 * 3);
  $NC.G_OFFSET.subViewHeightOffset = $NC.G_LAYOUT.tabHeader + $NC.G_OFFSET.nonClientHeight + ($NC.G_LAYOUT.border1 * 3);

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border2;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divTabView", clientWidth, clientHeight);

  clientWidth -= $NC.G_LAYOUT.border1;

  if ($("#divTabView").tabs("option", "active") === 0) {

    clientHeight = parent.height() - $NC.G_OFFSET.subViewHeightOffset;

    // Splitter 컨테이너 크기 조정
    var container = $("#divT1TabSheetView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", clientWidth, $("#grdT1Master").parent().height() - $NC.G_LAYOUT.header);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Detail", clientWidth, $("#grdT1Detail").parent().height() - $NC.G_LAYOUT.header);

  } else {

    clientHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset;

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Master", clientWidth, clientHeight);
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

  if (G_GRDT1MASTER.view.getEditorLock().isActive()) {
    G_GRDT1MASTER.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDT1MASTER, args.row);

  var rowData = G_GRDT1MASTER.data.getItem(args.row);

  if (args.cell == G_GRDT1MASTER.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDT1MASTER.data.updateItem(rowData.id, rowData);

  G_GRDT1MASTER.lastModified = true;
}

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();

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
  case "REQUEST_DATE":
    $NC.setValueDatePicker(view, val, "발주일자를 정확히 입력하십시오.");
    break;
  case "VENDOR_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_VENDOR_CD: val,
        P_VIEW_DIV: "2"
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
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_BU_CD: BU_CD,
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
      onItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemPopup, onItemPopup);
    }
    return;
  }

  // 화면클리어
  onChangingCondition();
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  if ($("#divTabView").tabs("option", "active") === 0) {
    $("#tdQDsp_Vendor_Cd").show();
    $("#tdQDsp_Item_Cd").hide();
    $("#btnRequestCreate").show();
  } else {
    $("#tdQDsp_Vendor_Cd").hide();
    $("#tdQDsp_Item_Cd").show();
    $("#btnRequestCreate").hide();
  }

  // 데이터 초기화
  $NC.clearGridData(G_GRDT1DETAIL);
  $NC.clearGridData(G_GRDT1MASTER);
  $NC.clearGridData(G_GRDT2MASTER);

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
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

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

  var REQUEST_DATE = $NC.getValue("#dtpQRequest_Date");
  if ($NC.isNull(REQUEST_DATE)) {
    alert("발주일자를 입력하십시오.");
    $NC.setFocus("#dtpQRequest_Date");
    return;
  }

  var REQUEST_DIV = $NC.getValue("#cboQRequest_Div");

  if ($("#divTabView").tabs("option", "active") === 0) {

    var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1MASTER);

    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_REQUEST_DATE: REQUEST_DATE,
      P_VENDOR_CD: VENDOR_CD,
      P_REQUEST_DIV: REQUEST_DIV
    });

    // 데이터 조회
    $NC.serviceCall("/LA01010E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
  } else {

    var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);

    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_REQUEST_DATE: REQUEST_DATE,
      P_ITEM_CD: ITEM_CD,
      P_REQUEST_DIV: REQUEST_DIV
    });

    // 데이터 조회
    $NC.serviceCall("/LA01010E/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
  }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  var CUST_CD = $NC.getValue("#edtQCust_Cd");
  var REQUEST_DATE = $NC.getValue("#dtpQRequest_Date");

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LA01011P",
    PROGRAM_NM: "발주등록/수정",
    url: "la/LA01011P.html",
    width: 1024,
    height: 600,
    userData: {
      P_PROCESS_CD: "N",
      P_CENTER_CD: CENTER_CD,
      P_CENTER_CD_F: CENTER_CD_F,
      P_BU_CD: BU_CD,
      P_BU_NM: BU_NM,
      P_CUST_CD: CUST_CD,
      P_REQUEST_DATE: REQUEST_DATE,
      P_MASTER_DS: {},
      P_DETAIL_DS: [ ]
    },
    onOk: function() {
      _Inquiry();
    }
  });
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  if ($("#divTabView").tabs("option", "active") === 0) {

    if (G_GRDT1DETAIL.lastRow == null || G_GRDT1DETAIL.data.getLength() === 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    // 현재 수정모드면
    if (G_GRDT1DETAIL.view.getEditorLock().isActive()) {
      G_GRDT1DETAIL.view.getEditorLock().commitCurrentEdit();
    }

    // 현재 선택된 로우 Validation 체크
    if (G_GRDT1DETAIL.lastRow != null) {
      if (!grdT1DetailOnBeforePost(G_GRDT1DETAIL.lastRow)) {
        return;
      }
    }

    var saveDS = [ ];
    var rowCount = G_GRDT1DETAIL.data.getLength();
    for (var row = 0; row < rowCount; row++) {
      var rowData = G_GRDT1DETAIL.data.getItem(row);
      if (rowData.CRUD !== "R") {
        var saveData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_REQUEST_DATE: rowData.REQUEST_DATE,
          P_REQUEST_NO: rowData.REQUEST_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_ADJUST_QTY: rowData.ADJUST_QTY,
          P_REQUEST_QTY: rowData.ADJUST_QTY,
          P_CRUD: rowData.CRUD
        };
        saveDS.push(saveData);
      }
    }

    if (saveDS.length > 0) {
      $NC.serviceCall("/LA01010E/saveAdjust.do", {
        P_DS_MASTER: $NC.toJson(saveDS),
        P_USER_ID: $NC.G_USERINFO.USER_ID
      }, onSave, onSaveError);
    }
  } else {

    if (G_GRDT2MASTER.lastRow == null || G_GRDT2MASTER.data.getLength() === 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    // 현재 수정모드면
    if (G_GRDT2MASTER.view.getEditorLock().isActive()) {
      G_GRDT2MASTER.view.getEditorLock().commitCurrentEdit();
    }

    // 현재 선택된 로우 Validation 체크
    if (G_GRDT2MASTER.lastRow != null) {
      if (!grdT2MasterOnBeforePost(G_GRDT2MASTER.lastRow)) {
        return;
      }
    }

    var saveDS = [ ];
    var rowCount = G_GRDT2MASTER.data.getLength();
    for (var row = 0; row < rowCount; row++) {
      var rowData = G_GRDT2MASTER.data.getItem(row);
      if (rowData.CRUD !== "R") {
        var saveData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_REQUEST_DATE: rowData.REQUEST_DATE,
          P_REQUEST_NO: rowData.REQUEST_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_ADJUST_QTY: rowData.ADJUST_QTY,
          P_REQUEST_QTY: rowData.ADJUST_QTY,
          P_CRUD: rowData.CRUD
        };
        saveDS.push(saveData);
      }
    }

    if (saveDS.length > 0) {
      $NC.serviceCall("/LA01010E/saveAdjust.do", {
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

  if (G_GRDT1MASTER.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }
  
  
  var saveDS = [ ];
  var chkCnt = 0;
  var rowCount = G_GRDT1MASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT1MASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;

      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_REQUEST_DATE: rowData.REQUEST_DATE,
        P_REQUEST_NO: rowData.REQUEST_NO,
        P_CRUD: "D"
      };
      saveDS.push(saveData);
    }
  }

  if (chkCnt == 0) {
    alert("삭제할 발주전표를 선택하십시오.");
    return;
  }

  var result = confirm("발주전표를 삭제하시겠습니까?");
  if (result) {
    $NC.serviceCall("/LA01010E/delete.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
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

    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter("#divT1TabSheetView")) {
      // 스필리터를 통한 _OnResize 호출
      $("#divT1TabSheetView").trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter("#divT1TabSheetView", "h");
    }
  } else {

    _OnResize($(window));
  }
  onChangingCondition();

}

function grdT1MasterOnGetColumns() {

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
    id: "REQUEST_DATE",
    field: "REQUEST_DATE",
    name: "발주일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_NO",
    field: "REQUEST_NO",
    name: "발주번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_CD",
    field: "VENDOR_CD",
    name: "공급처",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_DIV_F",
    field: "VENDOR_DIV_F",
    name: "공급처구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_USER_ID",
    field: "ORDER_USER_ID",
    name: "예정자ID",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATETIME",
    field: "ORDER_DATETIME",
    name: "예정일시",
    minWidth: 140,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_YN",
    field: "REQUEST_YN",
    name: "발주여부",
    minWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_USER_ID",
    field: "REQUEST_USER_ID",
    name: "발주자ID",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_DATETIME",
    field: "REQUEST_DATETIME",
    name: "발주일시",
    minWidth: 140,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 3,
    specialRow: {
      compareKey: "REQUEST_YN",
      compareVal: "Y",
      compareOperator: "==",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LA01010E.RS_T1_MASTER",
    sortCol: "REQUEST_NO",
    gridOptions: options
  });

  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
  G_GRDT1MASTER.view.onHeaderClick.subscribe(grdT1MasterOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT1MASTER, "CHECK_YN");
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdT1MasterOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDT1MASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDT1MASTER.view.getEditorLock().isActive() && !G_GRDT1MASTER.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT1MASTER.data.getLength();
      var rowData;
      G_GRDT1MASTER.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDT1MASTER.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDT1MASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT1MASTER.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdT1MasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDT1MASTER.lastRow != null) {
    if (row == G_GRDT1MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 디테일 변수 초기화
  $NC.setInitGridVar(G_GRDT1DETAIL);
  onGetT1Detail({
    data: null
  });

  // 디테일 파라메터 세팅
  var rowData = G_GRDT1MASTER.data.getItem(row);
  G_GRDT1DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_REQUEST_DATE: rowData.REQUEST_DATE,
    P_REQUEST_NO: rowData.REQUEST_NO
  });

  // 디테일 데이터 조회
  $NC.serviceCall("/LA01010E/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Master", row + 1);
}

function grdT1DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 50,
    cssClass: "align-right"
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
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_UNIT_DIV_F",
    field: "REQUEST_UNIT_DIV_F",
    name: "발주단위",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_UNIT_QTY",
    field: "REQUEST_UNIT_QTY",
    name: "최소발주단위수량",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_ORDER_QTY",
    field: "TOTAL_ORDER_QTY",
    name: "총예정수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_QTY_RATE",
    field: "REQUEST_QTY_RATE",
    name: "발주비율(%)",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_QTY",
    field: "ADJUST_QTY",
    name: "조정수량",
    minWidth: 80,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE_D",
    field: "BUY_PRICE_D",
    name: "발주단가[EA]",
    minWidth: 80,
    cssClass: "align-right"
  });
  
  $NC.setGridColumn(columns, {
    id: "ETC_PRICE",
    field: "ETC_PRICE",
    name: "기타비용",
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
    id: "BUY_AMT",
    field: "BUY_AMT",
    name: "매입금액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PRE_REQUEST_QTY",
    field: "PRE_REQUEST_QTY",
    name: "기발주수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "IN_WAIT_QTY",
    field: "IN_WAIT_QTY",
    name: "입고대기수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OUT_WAIT_QTY",
    field: "OUT_WAIT_QTY",
    name: "출고대기수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 90
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Detail", {
    columns: grdT1DetailOnGetColumns(),
    queryId: "LA01010E.RS_T1_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
  G_GRDT1DETAIL.view.onBeforeEditCell.subscribe(grdT1DetailOnBeforeEditCell);
  G_GRDT1DETAIL.view.onCellChange.subscribe(grdT1DetailOnCellChange);

}

function grdT1DetailOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDT1DETAIL.lastRow != null) {
    if (row == G_GRDT1DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdT1DetailOnBeforePost(G_GRDT1DETAIL.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Detail", row + 1);
}

/**
 * @param e
 *          Event Handler
 * @param args
 *          row: activeRow, cell: activeCell, item: item, column: columnDef
 */
function grdT1DetailOnBeforeEditCell(e, args) {

  var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

  if (args.column.field === "ADJUST_QTY") {
    return rowData.REQUEST_YN === "N";
  }
  return false;
}

function grdT1DetailOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDT1DETAIL.view.getColumnField(args.cell)) {
  case "ADJUST_QTY":
    if (isNaN(rowData.ADJUST_QTY)) {
      rowData.ADJUST_QTY = "0";
    }
    rowData.BUY_AMT = rowData.BUY_PRICE * rowData.ADJUST_QTY;
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDT1DETAIL.lastRowModified = true;
}

/**
 * 저장시 그리드 입력 체크
 */
function grdT1DetailOnBeforePost(row) {

  if (!G_GRDT1DETAIL.lastRowModified) {
    return true;
  }

  var rowData = G_GRDT1DETAIL.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  if (rowData.CRUD != "R") {
    if (isNaN(rowData.ADJUST_QTY)) {
      rowData.ADJUST_QTY = 0;
      G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);
      alert("조정수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDT1DETAIL, row);
      $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("ADJUST_QTY"), true);
      return false;
    } else {
      if (Number(rowData.ORDER_QTY) < Number(rowData.ADJUST_QTY)) {
        alert("조정수량이 예정수량을 초과할수 없습니다.");
        $NC.setGridSelectRow(G_GRDT1DETAIL, row);
        $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("ADJUST_QTY"), true);
        return false;
      }
    }

    if (rowData.REQUEST_UNIT_DIV === "12") {
      var BOX_QTY = Number(rowData.QTY_IN_BOX) * Number(rowData.REQUEST_UNIT_QTY);
      if (BOX_QTY > Number(rowData.ADJUST_QTY)) {
        alert("최소발주단위수량은 " + BOX_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDT1DETAIL, row);
        $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("ADJUST_QTY"), true);
        return false;
      } else if ((Number(rowData.ADJUST_QTY) % Number(rowData.QTY_IN_BOX)) !== 0) {
        alert("발주단위로 조정할 수 있습니다.");
        $NC.setGridSelectRow(G_GRDT1DETAIL, row);
        $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("ADJUST_QTY"), true);
        return false;
      }
    } else if (rowData.REQUEST_UNIT_DIV === "13") {
      var PLT_QTY = Number(rowData.QTY_IN_BOX) * Number(rowData.BOX_IN_PLT) * Number(rowData.REQUEST_UNIT_QTY);
      if (PLT_QTY > Number(rowData.ADJUST_QTY)) {
        alert("최소발주단위수량은 " + PLT_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDT1DETAIL, row);
        $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("ADJUST_QTY"), true);
        return false;
      } else if ((Number(rowData.ADJUST_QTY) % (Number(rowData.QTY_IN_BOX) * Number(rowData.BOX_IN_PLT))) !== 0) {
        alert("발주단위로 조정할 수 있습니다.");
        $NC.setGridSelectRow(G_GRDT1DETAIL, row);
        $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("ADJUST_QTY"), true);
        return false;
      }
    } else {
      if (Number(rowData.REQUEST_UNIT_QTY) > Number(rowData.ADJUST_QTY)) {
        alert("최소발주단위수량은 " + rowData.REQUEST_UNIT_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDT1DETAIL, row);
        $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("ADJUST_QTY"), true);
        return false;
      }
    }
  }

  return true;
}

function grdT2MasterOnGetColumns() {

  var columns = [ ];
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
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_UNIT_DIV_F",
    field: "REQUEST_UNIT_DIV_F",
    name: "발주단위",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_UNIT_QTY",
    field: "REQUEST_UNIT_QTY",
    name: "최소발주단위수량",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_ORDER_QTY",
    field: "TOTAL_ORDER_QTY",
    name: "총예정수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_QTY_RATE",
    field: "REQUEST_QTY_RATE",
    name: "발주비율(%)",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE_D",
    field: "BUY_PRICE_D",
    name: "발주단가[EA]",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ETC_PRICE",
    field: "ETC_PRICE",
    name: "기타비용",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_QTY",
    field: "ADJUST_QTY",
    name: "조정수량",
    minWidth: 80,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_AMT",
    field: "BUY_AMT",
    name: "매입금액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PRE_REQUEST_QTY",
    field: "PRE_REQUEST_QTY",
    name: "기발주수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "IN_WAIT_QTY",
    field: "IN_WAIT_QTY",
    name: "입고대기수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OUT_WAIT_QTY",
    field: "OUT_WAIT_QTY",
    name: "출고대기수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_CD",
    field: "VENDOR_CD",
    name: "공급처",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_DATE",
    field: "REQUEST_DATE",
    name: "발주일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_NO",
    field: "REQUEST_NO",
    name: "발주번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_DIV_F",
    field: "REQUEST_DIV_F",
    name: "발주구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 50,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 90
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 6,
    specialRow: {
      compareKey: "REQUEST_YN",
      compareVal: "Y",
      compareOperator: "==",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LA01010E.RS_T2_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
  G_GRDT2MASTER.view.onBeforeEditCell.subscribe(grdT2MasterOnBeforeEditCell);
  G_GRDT2MASTER.view.onCellChange.subscribe(grdT2MasterOnCellChange);

}

function grdT2MasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDT2MASTER.lastRow != null) {
    if (row == G_GRDT2MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdT2MasterOnBeforePost(G_GRDT2MASTER.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Master", row + 1);
}

/**
 * @param e
 *          Event Handler
 * @param args
 *          row: activeRow, cell: activeCell, item: item, column: columnDef
 */
function grdT2MasterOnBeforeEditCell(e, args) {

  var rowData = args.item;
  if (args.column.field === "ADJUST_QTY") {
    return rowData.REQUEST_YN === "N";
  }
  return false;
}

function grdT2MasterOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDT2MASTER.view.getColumnField(args.cell)) {
  case "ADJUST_QTY":
    if (isNaN(rowData.ADJUST_QTY)) {
      rowData.ADJUST_QTY = "0";
    }
    rowData.BUY_AMT = rowData.BUY_PRICE * rowData.ADJUST_QTY;
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDT2MASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDT2MASTER.lastRowModified = true;
}

/**
 * 저장시 그리드 입력 체크
 */
function grdT2MasterOnBeforePost(row) {

  if (!G_GRDT2MASTER.lastRowModified) {
    return true;
  }

  var rowData = G_GRDT2MASTER.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  if (rowData.CRUD != "R") {
    if (isNaN(rowData.ADJUST_QTY)) {
      rowData.ADJUST_QTY = 0;
      G_GRDT2MASTER.data.updateItem(rowData.id, rowData);
      alert("조정수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDT2MASTER, row);
      $NC.setFocusGrid(G_GRDT2MASTER, G_GRDT2MASTER.lastRow, G_GRDT2MASTER.view.getColumnIndex("ADJUST_QTY"), true);
      return false;
    } else {
      if (Number(rowData.ORDER_QTY) < Number(rowData.ADJUST_QTY)) {
        alert("조정수량이 예정수량을 초과할수 없습니다.");
        $NC.setGridSelectRow(G_GRDT2MASTER, row);
        $NC.setFocusGrid(G_GRDT2MASTER, G_GRDT2MASTER.lastRow, G_GRDT2MASTER.view.getColumnIndex("ADJUST_QTY"), true);
        return false;
      }
    }

    if (rowData.REQUEST_UNIT_DIV === "12") {
      var BOX_QTY = Number(rowData.QTY_IN_BOX) * Number(rowData.REQUEST_UNIT_QTY);
      if (BOX_QTY > Number(rowData.ADJUST_QTY)) {
        alert("최소발주단위수량은 " + BOX_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDT2MASTER, row);
        $NC.setFocusGrid(G_GRDT2MASTER, G_GRDT2MASTER.lastRow, G_GRDT2MASTER.view.getColumnIndex("ADJUST_QTY"), true);
        return false;
      } else if ((Number(rowData.ADJUST_QTY) % Number(rowData.QTY_IN_BOX)) !== 0) {
        alert("발주단위로 조정할 수 있습니다.");
        $NC.setGridSelectRow(G_GRDT2MASTER, row);
        $NC.setFocusGrid(G_GRDT2MASTER, G_GRDT2MASTER.lastRow, G_GRDT2MASTER.view.getColumnIndex("ADJUST_QTY"), true);
        return false;
      }
    } else if (rowData.REQUEST_UNIT_DIV === "13") {
      var PLT_QTY = Number(rowData.QTY_IN_BOX) * Number(rowData.BOX_IN_PLT) * Number(rowData.REQUEST_UNIT_QTY);
      if (PLT_QTY > Number(rowData.ADJUST_QTY)) {
        alert("최소발주단위수량은 " + PLT_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDT2MASTER, row);
        $NC.setFocusGrid(G_GRDT2MASTER, G_GRDT2MASTER.lastRow, G_GRDT2MASTER.view.getColumnIndex("ADJUST_QTY"), true);
        return false;
      } else if ((Number(rowData.ADJUST_QTY) % (Number(rowData.QTY_IN_BOX) * Number(rowData.BOX_IN_PLT))) !== 0) {
        alert("발주단위로 조정할 수 있습니다.");
        $NC.setGridSelectRow(G_GRDT2MASTER, row);
        $NC.setFocusGrid(G_GRDT2MASTER, G_GRDT2MASTER.lastRow, G_GRDT2MASTER.view.getColumnIndex("ADJUST_QTY"), true);
        return false;
      }
    } else {
      if (Number(rowData.REQUEST_UNIT_QTY) > Number(rowData.ADJUST_QTY)) {
        alert("최소발주단위수량은 " + rowData.REQUEST_UNIT_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDT2MASTER, row);
        $NC.setFocusGrid(G_GRDT2MASTER, G_GRDT2MASTER.lastRow, G_GRDT2MASTER.view.getColumnIndex("ADJUST_QTY"), true);
        return false;
      }
    }
  }

  return true;
}

function onGetT1Master(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDT1MASTER, "CHECK_YN");

  if (G_GRDT1MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1MASTER, {
        selectKey: "REQUEST_NO",
        selectVal: G_GRDT1MASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT1Master", 0, 0);

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDT1DETAIL);
    onGetT1Detail({
      data: null
    });
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "1";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "1";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetT1Detail(ajaxData) {

  $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);

  if (G_GRDT1DETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1DETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1DETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1DETAIL, {
        selectKey: "LINE_NO",
        selectVal: G_GRDT1DETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT1Detail", 0, 0);
  }
}

function onGetT2Master(ajaxData) {

  $NC.setInitGridData(G_GRDT2MASTER, ajaxData);

  if (G_GRDT2MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT2MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT2MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT2MASTER, {
        selectKey: ["ITEM_CD", "VENDOR_CD"],
        selectVal: G_GRDT2MASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT2Master", 0, 0);
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

  if ($("#divTabView").tabs("option", "active") === 0) {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
      selectKey: "REQUEST_NO"
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
      selectKey: "LINE_NO"
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
    G_GRDT1DETAIL.lastKeyVal = lastKeyVal2;
  } else {

    var lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDT2MASTER, {
      selectKey: ["ITEM_CD", "VENDOR_CD"]
    });
    _Inquiry();
    G_GRDT2MASTER.lastKeyVal = lastKeyVal3;
  }
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
  _Inquiry();
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
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 공급처 검색 팝업 클릭
 */
function showVendorPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NP.showVendorPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_VENDOR_CD: "%",
      P_VIEW_DIV: "2"
    }
  }, onVendorPopup, function() {
    $NC.setFocus("#edtQVendor_Cd", true);
  });
}

/**
 * 공급처 검색 결과
 * 
 * @param seletedRowData
 */
function onVendorPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQVendor_Cd", resultInfo.VENDOR_CD);
    $NC.setValue("#edtQVendor_Nm", resultInfo.VENDOR_NM);
  } else {
    $NC.setValue("#edtQVendor_Cd");
    $NC.setValue("#edtQVendor_Nm");
    $NC.setFocus("#edtQVendor_Cd", true);
  }
  onChangingCondition();
}

/**
 * 상품 검색 팝업 표시
 */
function showItemPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  $NP.showItemPopup({
    P_BU_CD: BU_CD,
    P_ITEM_CD: "%",
    P_VIEW_DIV: "2",
    P_DEPART_CD: "%",
    P_LINE_CD: "%",
    P_CLASS_CD: "%"
  }, onItemPopup, function() {
    $NC.setFocus("#edtQItem_Cd", true);
  });
}

/**
 * 상품 검색 팝업에서 상품선택 혹은 취소 했을 경우
 */
function onItemPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQItem_Cd", resultInfo.ITEM_CD);
    $NC.setValue("#edtQItem_Nm", resultInfo.ITEM_NM);

  } else {
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");
    $NC.setFocus("#edtQItem_Cd", true);
  }
  onChangingCondition();
}

function onBtnRequestCreate() {

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

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LA01012P",
    PROGRAM_NM: "발주데이터 생성",
    url: "la/LA01012P.html",
    width: 1024,
    height: 650,
    userData: {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_CUST_CD: $NC.getValue("#edtQCust_Cd")
    },
    onOk: function() {
      _Inquiry();
    }
  });
}
