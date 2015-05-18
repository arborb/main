/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {
  // 단위화면에서 사용될 일반 전역 변수 정의

  // 탭 초기화
  $NC.setInitTab("#divTabView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 그리드 초기화
  grdT1MasterInitialize();
  grdT1DetailInitialize();
  grdT2MasterInitialize();
  grdT2DetailInitialize();

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $NC.setInitDatePicker("#dtpQRequest_Date1");
  $NC.setInitDatePicker("#dtpQRequest_Date2");
  $NC.setValue("#rgbQRequest_Yn1", "1");

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQVendor_Cd").click(showVendorPopup);
  $("#btnQItem_Cd").click(showItemPopup);

  // 발주확정/취소 버튼 권한 체크 및 클릭 이벤트 연결
  setUserProgramPermission();

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
  $NC.setInitSplitter("#divT1MasterView", "h", $NC.G_OFFSET.viewHeight);
}

function _SetResizeOffset() {

  $NC.G_OFFSET.viewHeight = 300;
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
  clientHeight = parent.height() - $NC.G_OFFSET.subViewHeightOffset;

  if ($("#divTabView").tabs("option", "active") === 0) {

    $NC.resizeContainer("#divT1MasterView", clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", clientWidth, $("#grdT1Master").parent().height() - $NC.G_LAYOUT.header);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Detail", clientWidth, $("#grdT1Detail").parent().height() - $NC.G_LAYOUT.header);
  } else if ($("#divTabView").tabs("option", "active") === 1) {

    $NC.resizeContainer("#divT2MasterView", clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Master", clientWidth, $("#grdT2Master").parent().height() - $NC.G_LAYOUT.header);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Detail", clientWidth, $("#grdT2Detail").parent().height() - $NC.G_LAYOUT.header);
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
  case "REQUEST_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "REQUEST_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
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
  } else {
    $("#tdQDsp_Vendor_Cd").hide();
    $("#tdQDsp_Item_Cd").show();
  }

  // 데이터 초기화
  $NC.clearGridData(G_GRDT1DETAIL);
  $NC.clearGridData(G_GRDT1MASTER);
  $NC.clearGridData(G_GRDT2DETAIL);
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
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();

  // 확정
  if (permission.canConfirm) {
    $("#btnT1ProcessNxt").click(onT1ProcessNxt);

  }
  $NC.setEnable("#btnT1ProcessNxt", permission.canConfirm);

  // 취소
  if (permission.canConfirmCancel) {
    $("#btnT1ProcessPre").click(onT1ProcessPre);
  }
  $NC.setEnable("#btnT1ProcessPre", permission.canConfirmCancel);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  var REQUEST_DATE1 = $NC.getValue("#dtpQRequest_Date1");
  if ($NC.isNull(REQUEST_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQRequest_Date1");
    return;
  }

  var REQUEST_DATE2 = $NC.getValue("#dtpQRequest_Date2");
  if ($NC.isNull(REQUEST_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQRequest_Date2");
    return;
  }

  if (REQUEST_DATE1 > REQUEST_DATE2) {
    alert("발주일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQRequest_Date1");
    return;
  }

  var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var REQUEST_DIV = $NC.getValue("#cboQRequest_Div");
  var REQUEST_YN = $NC.getValueRadioGroup("rgbQRequest_Yn");

  if ($("#divTabView").tabs("option", "active") === 0) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1MASTER);

    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_BU_CD: BU_CD,
      P_REQUEST_DATE1: REQUEST_DATE1,
      P_REQUEST_DATE2: REQUEST_DATE2,
      P_VENDOR_CD: VENDOR_CD,
      P_REQUEST_DIV: REQUEST_DIV,
      P_REQUEST_YN: REQUEST_YN
    });

    // 데이터 조회
    $NC.serviceCall("/LA01020E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
  } else if ($("#divTabView").tabs("option", "active") === 1) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);

    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_BU_CD: BU_CD,
      P_REQUEST_DATE1: REQUEST_DATE1,
      P_REQUEST_DATE2: REQUEST_DATE2,
      P_ITEM_CD: ITEM_CD,
      P_REQUEST_DIV: REQUEST_DIV,
      P_REQUEST_YN: REQUEST_YN
    });

    // 데이터 조회
    $NC.serviceCall("/LA01020E/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
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
          P_REQUEST_QTY: rowData.REQUEST_QTY,
          P_CRUD: rowData.CRUD
        };
        saveDS.push(saveData);
      }
    }

    if (saveDS.length > 0) {
      $NC.serviceCall("/LA01020E/save.do", {
        P_DS_MASTER: $NC.toJson(saveDS),
        P_USER_ID: $NC.G_USERINFO.USER_ID
      }, onSave, onSaveError);
    }
  } else if ($("#divTabView").tabs("option", "active") === 1) {

    if (G_GRDT2DETAIL.lastRow == null || G_GRDT2DETAIL.data.getLength() === 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    // 현재 수정모드면
    if (G_GRDT2DETAIL.view.getEditorLock().isActive()) {
      G_GRDT2DETAIL.view.getEditorLock().commitCurrentEdit();
    }

    // 현재 선택된 로우 Validation 체크
    if (G_GRDT2DETAIL.lastRow != null) {
      if (!grdT2DetailOnBeforePost(G_GRDT2DETAIL.lastRow)) {
        return;
      }
    }

    var saveDS = [ ];
    var rowCount = G_GRDT2DETAIL.data.getLength();
    for (var row = 0; row < rowCount; row++) {
      var rowData = G_GRDT2DETAIL.data.getItem(row);
      if (rowData.CRUD !== "R") {
        var saveData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_REQUEST_DATE: rowData.REQUEST_DATE,
          P_REQUEST_NO: rowData.REQUEST_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_REQUEST_QTY: rowData.REQUEST_QTY,
          P_CRUD: rowData.CRUD
        };
        saveDS.push(saveData);
      }
    }

    if (saveDS.length > 0) {
      $NC.serviceCall("/LA01020E/save.do", {
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
  var container;
  if (id === "TAB1") {
    container = "#divT1MasterView";
  } else {
    container = "#divT2MasterView";
  }
  // 스플리터가 초기화가 되어 있으면 _OnResize 호출
  if ($NC.isSplitter(container)) {
    // 스필리터를 통한 _OnResize 호출
    $(container).trigger("resize");
  } else {
    // 스플리터 초기화
    $NC.setInitSplitter(container, "h", $NC.G_OFFSET.viewHeight);
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
    id: "CENTER_CD",
    field: "CENTER_CD",
    name: "센터코드",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "CENTER_NM",
    field: "CENTER_NM",
    name: "센터명",
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
    frozenColumn: 5,
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
    queryId: "LA01020E.RS_T1_MASTER",
    sortCol: "CENTER_CD",
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
  $NC.serviceCall("/LA01020E/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

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
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_QTY",
    field: "REQUEST_QTY",
    name: "발주수량",
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
    queryId: "LA01020E.RS_T1_DETAIL",
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

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field === "REQUEST_QTY") {
    return rowData.REQUEST_YN === "N";
  }
  return false;
}

function grdT1DetailOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDT1DETAIL.view.getColumnField(args.cell)) {
  case "REQUEST_QTY":
    if (isNaN(rowData.REQUEST_QTY)) {
      rowData.REQUEST_QTY = "0";
    }
    rowData.BUY_AMT = rowData.BUY_PRICE * rowData.REQUEST_QTY;
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
    if (isNaN(rowData.REQUEST_QTY)) {
      rowData.REQUEST_QTY = 0;
      G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);
      alert("발주수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDT1DETAIL, row);
      $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("REQUEST_QTY"), true);
      return false;
    } else {
      if (Number(rowData.ADJUST_QTY) < Number(rowData.REQUEST_QTY)) {
        alert("발주수량이 조정수량을 초과할수 없습니다.");
        $NC.setGridSelectRow(G_GRDT1DETAIL, row);
        $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("REQUEST_QTY"), true);
        return false;
      }
    }

    if (rowData.REQUEST_UNIT_DIV === "12") {
      var BOX_QTY = Number(rowData.QTY_IN_BOX) * Number(rowData.REQUEST_UNIT_QTY);
      if (BOX_QTY > Number(rowData.REQUEST_QTY)) {
        alert("최소발주단위수량은 " + BOX_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDT1DETAIL, row);
        $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("REQUEST_QTY"), true);
        return false;
      } else if ((Number(rowData.REQUEST_QTY) % Number(rowData.QTY_IN_BOX)) !== 0) {
        alert("발주단위로 조정할 수 있습니다.");
        $NC.setGridSelectRow(G_GRDT1DETAIL, row);
        $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("REQUEST_QTY"), true);
        return false;
      }
    } else if (rowData.REQUEST_UNIT_DIV === "13") {
      var PLT_QTY = Number(rowData.QTY_IN_BOX) * Number(rowData.BOX_IN_PLT) * Number(rowData.REQUEST_UNIT_QTY);
      if (PLT_QTY > Number(rowData.REQUEST_QTY)) {
        alert("최소발주단위수량은 " + PLT_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDT1DETAIL, row);
        $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("REQUEST_QTY"), true);
        return false;
      } else if ((Number(rowData.REQUEST_QTY) % (Number(rowData.QTY_IN_BOX) * Number(rowData.BOX_IN_PLT))) !== 0) {
        alert("발주단위로 조정할 수 있습니다.");
        $NC.setGridSelectRow(G_GRDT1DETAIL, row);
        $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("REQUEST_QTY"), true);
        return false;
      }
    } else {
      if (Number(rowData.REQUEST_UNIT_QTY) > Number(rowData.REQUEST_QTY)) {
        alert("최소발주단위수량은 " + rowData.REQUEST_UNIT_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDT1DETAIL, row);
        $NC.setFocusGrid(G_GRDT1DETAIL, G_GRDT1DETAIL.lastRow, G_GRDT1DETAIL.view.getColumnIndex("REQUEST_QTY"), true);
        return false;
      }
    }
  }

  return true;
}

function grdT2MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CENTER_CD",
    field: "CENTER_CD",
    name: "센터코드",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "CENTER_NM",
    field: "CENTER_NM",
    name: "센터명",
    minWidth: 150
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
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_QTY",
    field: "REQUEST_QTY",
    name: "발주수량",
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

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 2,
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.VIEW_DIV == "1") {
          return "specialrow3";
        }
        if (rowData.VIEW_DIV == "2") {
          return "specialrow4";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LA01020E.RS_T2_MASTER",
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

  // 디테일 변수 초기화
  $NC.setInitGridVar(G_GRDT2DETAIL);
  onGetT2Detail({
    data: null
  });

  // 디테일 파라메터 세팅
  var rowData = G_GRDT2MASTER.data.getItem(row);
  G_GRDT2DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_REQUEST_DATE: rowData.REQUEST_DATE,
    P_ITEM_CD: rowData.ITEM_CD
  });

  // 디테일 데이터 조회
  $NC.serviceCall("/LA01020E/getDataSet.do", $NC.getGridParams(G_GRDT2DETAIL), onGetT2Detail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Master", row + 1);
}

function grdT2DetailOnGetColumns() {

  var columns = [ ];
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
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 50,
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
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_QTY",
    field: "REQUEST_QTY",
    name: "발주수량",
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
    id: "REQUEST_YN",
    field: "REQUEST_YN",
    name: "발주여부",
    minWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 90
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2DetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Detail", {
    columns: grdT2DetailOnGetColumns(),
    queryId: "LA01020E.RS_T2_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDT2DETAIL.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
  G_GRDT2DETAIL.view.onBeforeEditCell.subscribe(grdT2DetailOnBeforeEditCell);
  G_GRDT2DETAIL.view.onCellChange.subscribe(grdT2DetailOnCellChange);

}

function grdT2DetailOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDT2DETAIL.lastRow != null) {
    if (row == G_GRDT2DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdT2DetailOnBeforePost(G_GRDT2DETAIL.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Detail", row + 1);
}

/**
 * @param e
 *          Event Handler
 * @param args
 *          row: activeRow, cell: activeCell, item: item, column: columnDef
 */
function grdT2DetailOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  var rowData = args.item;
  if (args.column.field === "REQUEST_QTY") {
    return rowData.REQUEST_YN === "N";
  }
  return false;
}

function grdT2DetailOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDT2DETAIL.view.getColumnField(args.cell)) {
  case "REQUEST_QTY":
    if (isNaN(rowData.REQUEST_QTY)) {
      rowData.REQUEST_QTY = "0";
    }
    rowData.BUY_AMT = rowData.BUY_PRICE * rowData.REQUEST_QTY;
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDT2DETAIL.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDT2DETAIL.lastRowModified = true;
}

/**
 * 저장시 그리드 입력 체크
 */
function grdT2DetailOnBeforePost(row) {

  if (!G_GRDT2DETAIL.lastRowModified) {
    return true;
  }

  var rowData = G_GRDT2DETAIL.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  if (rowData.CRUD != "R") {
    if (isNaN(rowData.REQUEST_QTY)) {
      rowData.REQUEST_QTY = 0;
      G_GRDT2DETAIL.data.updateItem(rowData.id, rowData);
      alert("확정수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDT2DETAIL, row);
      $NC.setFocusGrid(G_GRDT2DETAIL, G_GRDT2DETAIL.lastRow, G_GRDT2DETAIL.view.getColumnIndex("REQUEST_QTY"), true);
      return false;
    } else {
      if (Number(rowData.ADJUST_QTY) < Number(rowData.REQUEST_QTY)) {
        alert("발주수량이 조정수량을 초과할수 없습니다.");
        $NC.setGridSelectRow(G_GRDT2DETAIL, row);
        $NC.setFocusGrid(G_GRDT2DETAIL, G_GRDT2DETAIL.lastRow, G_GRDT2DETAIL.view.getColumnIndex("REQUEST_QTY"), true);
        return false;
      }
    }

    var rowMasterData = G_GRDT2MASTER.data.getItem(G_GRDT2MASTER.lastRow);
    if (rowMasterData.REQUEST_UNIT_DIV === "12") {
      var BOX_QTY = Number(rowMasterData.QTY_IN_BOX) * Number(rowMasterData.REQUEST_UNIT_QTY);
      if (BOX_QTY > Number(rowData.REQUEST_QTY)) {
        alert("최소발주단위수량은 " + BOX_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDT2DETAIL, row);
        $NC.setFocusGrid(G_GRDT2DETAIL, G_GRDT2DETAIL.lastRow, G_GRDT2DETAIL.view.getColumnIndex("REQUEST_QTY"), true);
        return false;
      } else if ((Number(rowData.REQUEST_QTY) % Number(rowMasterData.QTY_IN_BOX)) !== 0) {
        alert("발주단위로 조정할 수 있습니다.");
        $NC.setGridSelectRow(G_GRDT2DETAIL, row);
        $NC.setFocusGrid(G_GRDT2DETAIL, G_GRDT2DETAIL.lastRow, G_GRDT2DETAIL.view.getColumnIndex("REQUEST_QTY"), true);
        return false;
      }
    } else if (rowMasterData.REQUEST_UNIT_DIV === "13") {
      var PLT_QTY = Number(rowMasterData.QTY_IN_BOX) * Number(rowMasterData.BOX_IN_PLT)
          * Number(rowMasterData.REQUEST_UNIT_QTY);
      if (PLT_QTY > Number(rowData.REQUEST_QTY)) {
        alert("최소발주단위수량은 " + PLT_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDT2DETAIL, row);
        $NC.setFocusGrid(G_GRDT2DETAIL, G_GRDT2DETAIL.lastRow, G_GRDT2DETAIL.view.getColumnIndex("REQUEST_QTY"), true);
        return false;
      } else if ((Number(rowData.REQUEST_QTY) % (Number(rowMasterData.QTY_IN_BOX) * Number(rowMasterData.BOX_IN_PLT))) !== 0) {
        alert("발주단위로 조정할 수 있습니다.");
        $NC.setGridSelectRow(G_GRDT2DETAIL, row);
        $NC.setFocusGrid(G_GRDT2DETAIL, G_GRDT2DETAIL.lastRow, G_GRDT2DETAIL.view.getColumnIndex("REQUEST_QTY"), true);
        return false;
      }
    } else {
      if (Number(rowMasterData.REQUEST_UNIT_QTY) > Number(rowData.REQUEST_QTY)) {
        alert("최소발주단위수량은 " + rowMasterData.REQUEST_UNIT_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDT2DETAIL, row);
        $NC.setFocusGrid(G_GRDT2DETAIL, G_GRDT2DETAIL.lastRow, G_GRDT2DETAIL.view.getColumnIndex("REQUEST_QTY"), true);
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
        selectKey: ["CENTER_CD", "REQUEST_DATE", "REQUEST_NO", "VENDOR_CD"],
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
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";

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
        selectKey: "ITEM_CD",
        selectVal: G_GRDT2MASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT2Master", 0, 0);

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDT2DETAIL);
    onGetT2Detail({
      data: null
    });
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetT2Detail(ajaxData) {

  $NC.setInitGridData(G_GRDT2DETAIL, ajaxData);

  if (G_GRDT2DETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT2DETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT2DETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT2DETAIL, {
        selectKey: ["REQUEST_DATE", "REQUEST_NO", "LINE_NO", "VENDOR_CD"],
        selectVal: G_GRDT2DETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT2Detail", 0, 0);
  }
}

function onSave(ajaxData) {

  if ($("#divTabView").tabs("option", "active") === 0) {

    var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
      selectKey: ["CENTER_CD", "REQUEST_DATE", "REQUEST_NO", "VENDOR_CD"]
    });
    var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
      selectKey: "LINE_NO"
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
    G_GRDT1DETAIL.lastKeyVal = lastKeyVal2;
  } else {

    var lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDT2MASTER, {
      selectKey: "ITEM_CD"
    });
    var lastKeyVal4 = $NC.getGridLastKeyVal(G_GRDT2DETAIL, {
      selectKey: ["REQUEST_DATE", "REQUEST_NO", "LINE_NO", "VENDOR_CD"]
    });
    _Inquiry();
    G_GRDT2MASTER.lastKeyVal = lastKeyVal3;
    G_GRDT2DETAIL.lastKeyVal = lastKeyVal4;
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

function onT1ProcessNxt() {

  var rowCount = G_GRDT1MASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("발주확정 하시겠습니까?");
  if (!result) {
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT1MASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      if (rowData.REQUEST_YN === "N") {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_REQUEST_DATE: rowData.REQUEST_DATE,
          P_REQUEST_NO: rowData.REQUEST_NO,
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("발주확정할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 발주확정 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LA01020E/callRequestConfirm.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_DIRECTION: "FW",
  }, onSave, onSaveError, 2);
}

function onT1ProcessPre() {

  var rowCount = G_GRDT1MASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }
  
  var result = confirm("발주확정 취소 하시겠습니까?");
  if (!result) {
    return;
  }




  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT1MASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      if (rowData.REQUEST_YN === "Y") {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_REQUEST_DATE: rowData.REQUEST_DATE,
          P_REQUEST_NO: rowData.REQUEST_NO,
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("발주확정 취소할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 발주확정 취소 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LA01020E/callRequestConfirm.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_DIRECTION: "BW"
  }, onSave, onSaveError, 2);
}

