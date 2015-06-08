/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    printOptions: [{
      PRINT_INDEX: 0,
      PRINT_COMMENT: "납품예약 거래명세서 출력"
    }]
  });

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

  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $NC.setInitDatePicker("#dtpQRequest_Date1");
  $NC.setInitDatePicker("#dtpQRequest_Date2");
  $NC.setInitDatePicker("#dtpQAppoint_Date1", $NC.G_USERINFO.LOGIN_DATE, "F");
  $NC.setInitDatePicker("#dtpQAppoint_Date2");
  $NC.setValue("#rgbQAppoint_Div1", "1");

  if ($NC.G_USERINFO.CERTIFY_DIV === "3") {
    $NC.setEnable("#edtQVendor_Cd", false);
    $NC.setEnable("#btnQVendor_Cd", false);
    $NC.setValue("#edtQVendor_Cd", $NC.G_USERINFO.VENDOR_CD);
    $NC.setValue("#edtQVendor_Nm", $NC.G_USERINFO.VENDOR_NM);
  } else {
    $("#btnQVendor_Cd").click(showVendorPopup);
  }

  $("#btnQItem_Cd").click(showItemPopup);

  // 예약취소 버튼 권한 체크 및 클릭 이벤트 연결
  setUserProgramPermission();

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
    addAll: true
  });

}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {

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

  if (G_GRDT2MASTER.view.getEditorLock().isActive()) {
    G_GRDT2MASTER.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDT2MASTER, args.row);

  var rowData = G_GRDT2MASTER.data.getItem(args.row);

  if (args.cell == G_GRDT2MASTER.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDT2MASTER.data.updateItem(rowData.id, rowData);

  G_GRDT2MASTER.lastModified = true;
}

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "REQUEST_DATE1":
    $NC.setValueDatePicker(view, val, "발주 시작일자를 정확히 입력하십시오.");
    break;
  case "REQUEST_DATE2":
    $NC.setValueDatePicker(view, val, "발주 종료일자를 정확히 입력하십시오.");
    break;
  case "APPOINT_DATE1":
    $NC.setValueDatePicker(view, val, "예약 시작일자를 정확히 입력하십시오.");
    break;
  case "APPOINT_DATE2":
    $NC.setValueDatePicker(view, val, "예약 종료일자를 정확히 입력하십시오.");
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
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.G_USERINFO.BU_CD,
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
    $("#tdRequest_Date").show();
    $("#tdAppoint_Date").hide();
    $("#tdAppoint_Div").hide();
  } else {
    $("#tdRequest_Date").hide();
    $("#tdAppoint_Date").show();
    $("#tdAppoint_Div").show();
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

  // 취소
  if (permission.canConfirmCancel) {
    $("#btnProcessPre").click(onProcessPre);
  }
  $NC.setEnable("#btnProcessPre", permission.canConfirmCancel);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);

  if ($("#divTabView").tabs("option", "active") === 0) {

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

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1MASTER);

    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_REQUEST_DATE1: REQUEST_DATE1,
      P_REQUEST_DATE2: REQUEST_DATE2,
      P_VENDOR_CD: VENDOR_CD,
      P_ITEM_CD: ITEM_CD
    });

    // 데이터 조회
    $NC.serviceCall("/LA02010E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
  } else if ($("#divTabView").tabs("option", "active") === 1) {

    var APPOINT_DATE1 = $NC.getValue("#dtpQAppoint_Date1");
    if ($NC.isNull(APPOINT_DATE1)) {
      alert("검색 시작일자를 입력하십시오.");
      $NC.setFocus("#dtpQAppoint_Date1");
      return;
    }

    var APPOINT_DATE2 = $NC.getValue("#dtpQAppoint_Date2");
    if ($NC.isNull(APPOINT_DATE2)) {
      alert("검색 종료일자를 입력하십시오.");
      $NC.setFocus("#dtpQAppoint_Date2");
      return;
    }

    if (APPOINT_DATE1 > APPOINT_DATE2) {
      alert("예약일자 범위 입력오류입니다.");
      $NC.setFocus("#dtpQAppoint_Date1");
      return;
    }

    var APPOINT_DIV = $NC.getValueRadioGroup("rgbQAppoint_Div");

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);

    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_APPOINT_DATE1: APPOINT_DATE1,
      P_APPOINT_DATE2: APPOINT_DATE2,
      P_VENDOR_CD: VENDOR_CD,
      P_ITEM_CD: ITEM_CD,
      P_APPOINT_DIV: APPOINT_DIV
    });

    // 데이터 조회
    $NC.serviceCall("/LA02010E/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
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

  var checkedValueDS = [ ];
  var rowCount = G_GRDT2MASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT2MASTER.data.getItem(row);
    if (rowData.CHECK_YN === "Y") {
      checkedValueDS.push(rowData.APPOINT_NO);
    }
  }
  if (checkedValueDS.length == 0) {
    alert("출력할 데이터를 선택하십시오.");
    return;
  }

  var rowData = G_GRDT2MASTER.data.getItem(G_GRDT2MASTER.lastRow);
  var printOptions = {
    reportDoc: "la/PAPER_LA",
    queryId: "WR.RS_PAPER_LA01",
    queryParams: {
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_APPOINT_DATE: rowData.APPOINT_DATE,
    },
    checkedValue: checkedValueDS.toString()

  };

  $NC.G_MAIN.showPrintPreview(printOptions);
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
    $("#tdRequest_Date").show();
    $("#tdAppoint_Date").hide();
    $("#tdAppoint_Div").hide();
    $NC.G_VAR.buttons._print = "0";
  } else {
    container = "#divT2MasterView";
    $("#tdRequest_Date").hide();
    $("#tdAppoint_Date").show();
    $("#tdAppoint_Div").show();
    if (G_GRDT2MASTER.data.getLength() > 0) {
      $NC.G_VAR.buttons._print = "1";
    } else {
      $NC.G_VAR.buttons._print = "0";
    }
  }
  // 스플리터가 초기화가 되어 있으면 _OnResize 호출
  if ($NC.isSplitter(container)) {
    // 스필리터를 통한 _OnResize 호출
    $(container).trigger("resize");
  } else {
    // 스플리터 초기화
    $NC.setInitSplitter(container, "h", $NC.G_OFFSET.viewHeight);
  }

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function grdT1MasterOnGetColumns() {

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
    id: "CENTER_NM",
    field: "CENTER_NM",
    name: "센터명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업부명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_REQ_DATE",
    field: "DELIVERY_REQ_DATE",
    name: "납품요청일자",
    minWidth: 140,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "TOT_REQUEST_QTY",
    field: "TOT_REQUEST_QTY",
    name: "총발주수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOT_APPOINT_QTY",
    field: "TOT_APPOINT_QTY",
    name: "총예약수량",
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
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LA02010E.RS_T1_MASTER",
    sortCol: "REQUEST_DATE",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
  G_GRDT1MASTER.view.onDblClick.subscribe(grdT1MasterOnDblClick);

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
  $NC.serviceCall("/LA02010E/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Master", row + 1);
}

/**
 * 상단그리드 더블 클릭 : 팝업 표시
 */
function grdT1MasterOnDblClick(e, args) {

  if (G_GRDT1DETAIL.data.getLength() == 0) {
    return;
  }

  var permission = $NC.getProgramPermission();
  // 저장
  if (!permission.canSave) {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  var masterRowData = G_GRDT1MASTER.data.getItem(args.row);

  if (masterRowData) {
    $NC.G_MAIN.showProgramSubPopup({
      PROGRAM_ID: "LA02011P",
      PROGRAM_NM: "예약등록팝업",
      url: "la/LA02011P.html",
      width: 1024,
      height: 600,
      userData: {
        P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
        P_MASTER_DS: masterRowData,
        P_DETAIL_DS: G_GRDT1DETAIL.data.getItems()
      },
      onOk: function() {
        _Inquiry();
      }
    });
  }
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
    id: "REQUEST_QTY",
    field: "REQUEST_QTY",
    name: "발주수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "APPOINT_QTY",
    field: "APPOINT_QTY",
    name: "예약수량",
    minWidth: 80,
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
    frozenColumn: 3,
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
  $NC.setInitGridObject("#grdT1Detail", {
    columns: grdT1DetailOnGetColumns(),
    queryId: "LA02010E.RS_T1_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);

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

function grdT2MasterOnGetColumns() {

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
    id: "APPOINT_STATE_F",
    field: "APPOINT_STATE_F",
    name: "상태",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "APPOINT_DATE",
    field: "APPOINT_DATE",
    name: "예약일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "APPOINT_NO",
    field: "APPOINT_NO",
    name: "예약번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CENTER_NM",
    field: "CENTER_NM",
    name: "센터명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업부명",
    minWidth: 150
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
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "납품예정일자",
    minWidth: 140,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_TIME_DIV",
    field: "DELIVERY_TIME_DIV",
    name: "납품예정시간",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "TOT_CONFIRM_QTY",
    field: "TOT_CONFIRM_QTY",
    name: "총수량",
    minWidth: 90,
    cssClass: "align-right"
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

function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 4,
    specialRow: {
      compareKey: "APPOINT_STATE",
      compareVal: "30",
      compareOperator: "==",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LA02010E.RS_T2_MASTER",
    sortCol: "CENTER_CD",
    gridOptions: options
  });

  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
  G_GRDT2MASTER.view.onHeaderClick.subscribe(grdT2MasterOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT2MASTER, "CHECK_YN");

}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdT2MasterOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDT2MASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDT2MASTER.view.getEditorLock().isActive() && !G_GRDT2MASTER.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT2MASTER.data.getLength();
      var rowData;
      G_GRDT2MASTER.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDT2MASTER.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDT2MASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT2MASTER.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
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
    P_APPOINT_DATE: rowData.APPOINT_DATE,
    P_APPOINT_NO: rowData.APPOINT_NO
  });

  // 디테일 데이터 조회
  $NC.serviceCall("/LA02010E/getDataSet.do", $NC.getGridParams(G_GRDT2DETAIL), onGetT2Detail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Master", row + 1);
}

function grdT2DetailOnGetColumns() {

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
    id: "REQUEST_QTY",
    field: "REQUEST_QTY",
    name: "발주수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "APPOINT_QTY",
    field: "APPOINT_QTY",
    name: "예약수량",
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
    id: "REQUEST_LINE_NO",
    field: "REQUEST_LINE_NO",
    name: "발주순번",
    minWidth: 60,
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

function grdT2DetailInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Detail", {
    columns: grdT2DetailOnGetColumns(),
    queryId: "LA02010E.RS_T2_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDT2DETAIL.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
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

function onGetT1Master(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);

  if (G_GRDT1MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1MASTER, {
        selectKey: ["CENTER_CD", "BU_CD", "REQUEST_DATE", "REQUEST_NO"],
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
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

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
    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    $NC.G_VAR.CONFIRM_YN = rowData.CONFIRM_YN;
  } else {
    $NC.setGridDisplayRows("#grdT1Detail", 0, 0);
  }
}

function onGetT2Master(ajaxData) {

  $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDT2MASTER, "CHECK_YN");

  if (G_GRDT2MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT2MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT2MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT2MASTER, {
        selectKey: ["CENTER_CD", "BU_CD", "APPOINT_DATE", "APPOINT_NO"],
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
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  if (G_GRDT2MASTER.data.getLength() > 0) {
    $NC.G_VAR.buttons._print = "1";
  }

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetT2Detail(ajaxData) {

  $NC.setInitGridData(G_GRDT2DETAIL, ajaxData);

  if (G_GRDT2DETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT2DETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT2DETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT2DETAIL, {
        selectKey: "LINE_NO",
        selectVal: G_GRDT2DETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT2Detail", 0, 0);
  }
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

  $NP.showItemPopup({
    P_BU_CD: $NC.G_USERINFO.BU_CD,
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

function onProcessPre() {

  var rowCount = G_GRDT2MASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("예약취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT2MASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      if (rowData.APPOINT_STATE === "20") {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_APPOINT_DATE: rowData.APPOINT_DATE,
          P_APPOINT_NO: rowData.APPOINT_NO,
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("예약취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 예약취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LA02010E/callAppointMentCancel.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError, 2);
}

function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT2MASTER, {
    selectKey: ["CENTER_CD", "BU_CD", "APPOINT_DATE", "APPOINT_NO"]
  });
  _Inquiry();
  G_GRDT2MASTER.lastKeyVal = lastKeyVal;
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}
