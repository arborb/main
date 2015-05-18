/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({
  // });

  // 그리드 초기화
  grdT1MasterInitialize();
  grdT1DetailInitialize();
  grdT1SubInitialize();
  grdT2MasterInitialize();

  // 탭 초기화
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
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

  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();
  
  // 조회조건 - 사업부 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  // 조회조건 - 공급처 초기값 설정
  $NC.setValue("#edtQVendor_Cd");
  $NC.setValue("#edtQVendor_Nm");

  // 조회조건 - 입고일자에 달력이미지 설정
  $NC.setInitDatePicker("#dtpQInbound_Date1");
  $NC.setInitDatePicker("#dtpQInbound_Date2");

  // 조회조건 - 상품 초기값 설정
  $NC.setValue("#edtQItem_Cd");
  $NC.setValue("#edtQItem_Nm");

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showBuBrandPopup);
  $("#btnQVendor_Cd").click(showVendorPopup);
}

function _OnLoaded() {
  // 미처리/오류 내역 탭 화면에 splitter 설정
  $NC.setInitSplitter("#divT1SubView", "h", 300);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.bottomRightViewWidth = 300;
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

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientWidth -= $NC.G_LAYOUT.border1;
  clientHeight = parent.height() - $NC.G_OFFSET.subViewHeightOffset;

  $NC.resizeContainer("#divT1TabSheetView", clientWidth, clientHeight);
  $NC.resizeContainer("#divT2TabSheetView", clientWidth, clientHeight);

  // 입고중량등록 탭
  if ($("#divMasterView").tabs("option", "active") === 0) {

    // Splitter 컨테이너 크기 조정
    var container = $("#divT1SubView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", clientWidth, $("#grdT1Master").parent().height() - $NC.G_LAYOUT.header);

    clientWidth -= $NC.G_OFFSET.bottomRightViewWidth + $NC.G_LAYOUT.border1 + $NC.G_LAYOUT.margin1;
    clientHeight = $("#divBottom").height();
    $NC.resizeContainer("#divBottom_Left", clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Detail", clientWidth, $("#grdT1Detail").parent().height() - $NC.G_LAYOUT.header);

    $NC.resizeContainer("#divBottom_Right", $NC.G_OFFSET.bottomRightViewWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Sub", $NC.G_OFFSET.bottomRightViewWidth, $("#grdT1Sub").parent().height()
        - $NC.G_LAYOUT.header);

  } else {
    clientHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset;

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Master", clientWidth, clientHeight);

  }
}

/**
 * Input, Select Change Event 처리
 * 
 * @param e
 *          이벤트 핸들러
 * @param view
 *          대상 Object
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
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_BU_CD: BU_CD,
        P_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getBuBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBuBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showBuBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBuBrandPopup, onBuBrandPopup);
    }
    return;
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
  case "INBOUND_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "INBOUND_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
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

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부코드를 입력하십시오.");
    $NC.setFocus("#edtQBrand_Cd");
    return;
  }

  var INBOUND_DATE1 = $NC.getValue("#dtpQInbound_Date1");
  if ($NC.isNull(INBOUND_DATE1)) {
    alert("시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQInbound_Date1");
    return;
  }

  var INBOUND_DATE2 = $NC.getValue("#dtpQInbound_Date2");
  if ($NC.isNull(INBOUND_DATE2)) {
    alert("종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQInbound_Date2");
    return;
  }
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);

  // 입고중량등록 탭
  if ($("#divMasterView").tabs("option", "active") === 0) {
    // 조회시 값 초기화
    $NC.clearGridData(G_GRDT1MASTER);
    $NC.clearGridData(G_GRDT1DETAIL);
    $NC.clearGridData(G_GRDT1SUB);

    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INBOUND_DATE1: INBOUND_DATE1,
      P_INBOUND_DATE2: INBOUND_DATE2,
      P_VENDOR_CD: VENDOR_CD,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM
    });

    // 데이터 조회
    $NC.serviceCall("/LI05020E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

    // 입고중량내역 탭
  } else {
    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);

    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INBOUND_DATE1: INBOUND_DATE1,
      P_INBOUND_DATE2: INBOUND_DATE2,
      P_VENDOR_CD: VENDOR_CD,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM
    });

    // 데이터 조회
    $NC.serviceCall("/LI05020E/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
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
    if ($NC.isSplitter("#divT1SubView")) {
      // 스필리터를 통한 _OnResize 호출
      $("#divT1SubView").trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter("#divT1SubView", "h");
    }

  } else {

    _OnResize($(window));
  }
}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "INBOUND_DATE",
    field: "INBOUND_DATE",
    name: "입고일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INBOUND_NO",
    field: "INBOUND_NO",
    name: "입고번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INBOUND_STATE_D",
    field: "INBOUND_STATE_D",
    name: "진행상태",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "입고구분",
    minWidth: 120
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
    id: "CAR_NO",
    field: "CAR_NO",
    name: "차량번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_NO",
    field: "ORDER_NO",
    name: "예정번호",
    minWidth: 70,
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
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_ID_CNT",
    field: "LOCATION_ID_CNT",
    name: "로케이션ID수",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PLANED_DATETIME",
    field: "PLANED_DATETIME",
    name: "도착예정일시",
    minWidth: 130,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 입고중량등록탭의 상단그리드 초기화
 */
function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LI05020E.RS_T1_MASTER",
    sortCol: "INBOUND_NO",
    gridOptions: options
  });

  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

function grdT1DetailOnGetColumns() {

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
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_BOX",
    field: "ENTRY_BOX",
    name: "등록BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_EA",
    field: "ENTRY_EA",
    name: "등록EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_WEIGHT",
    field: "ENTRY_WEIGHT",
    name: "등록중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 입고중량등록탭의 하단그리드 초기화
 */
function grdT1DetailInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Detail", {
    columns: grdT1DetailOnGetColumns(),
    queryId: "LI05020E.RS_T1_DETAIL",
    sortCol: "ITEM_CD",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDT1DETAIL.view.onClick.subscribe(grdT1DetailOnClick);
  G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
  G_GRDT1DETAIL.view.onDblClick.subscribe(grdT1DetailOnDblClick);
}

/**
 * 상단그리드 더블 클릭 : 팝업 표시
 */
function grdT1DetailOnDblClick(e, args) {

  if (!$NC.getProgramPermission().canSave) {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  if (G_GRDT1DETAIL.lastRow == null || G_GRDT1DETAIL.data.getLength() === 0) {
    return;
  }

  var rowData = G_GRDT1DETAIL.data.getItem(args.row);

  if (rowData) {
    $NC.G_MAIN.showProgramSubPopup({
      PROGRAM_ID: "LI05021P",
      PROGRAM_NM: "입고중량등록/수정",
      url: "li/LI05021P.html",
      width: 650,
      height: 450,
      userData: {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_NM: rowData.ITEM_NM,
        P_ITEM_SPEC: rowData.ITEM_SPEC,
        P_ENTRY_QTY: rowData.ENTRY_QTY,
        P_SUB_DS: G_GRDT1SUB.data.getItems()
      },
      onOk: function() {
        popUpOnOk();
      }
    });
  }
}

/**
 * 입고중량 등록 팝업 호출 후
 */
function popUpOnOk() {

  var rowData = G_GRDT1DETAIL.data.getItem(G_GRDT1DETAIL.lastRow);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1SUB);

  G_GRDT1SUB.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_INBOUND_DATE: rowData.INBOUND_DATE,
    P_INBOUND_NO: rowData.INBOUND_NO,
    P_BRAND_CD: rowData.BRAND_CD,
    P_ITEM_CD: rowData.ITEM_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LI05020E/getDataSet.do", $NC.getGridParams(G_GRDT1SUB), onGetT1Sub);
}

function grdT1SubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_WEIGHT",
    field: "ITEM_WEIGHT",
    name: "상품중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 100
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 입고중량등록탭의 하단그리드 초기화
 */
function grdT1SubInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Sub", {
    columns: grdT1SubOnGetColumns(),
    queryId: "LI05020E.RS_T1_SUB",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT1SUB.view.onClick.subscribe(grdT1SubOnClick);
  G_GRDT1SUB.view.onSelectedRowsChanged.subscribe(grdT1SubOnAfterScroll);
}

function grdT2MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "INBOUND_DATE",
    field: "INBOUND_DATE",
    name: "입고일자",
    minWidth: 100,
    cssClass: "align-center",
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "INBOUND_NO",
    field: "INBOUND_NO",
    name: "입고번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_CD",
    field: "VENDOR_CD",
    name: "공급처",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처명",
    minWidth: 150
  });
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
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_WEIGHT",
    field: "ITEM_WEIGHT",
    name: "상품중량",
    minWidth: 70,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "WEIGHT_QTY",
    field: "WEIGHT_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_CD_F",
    field: "INOUT_CD_F",
    name: "입고구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 입고중량내역 탭의 그리드 초기화
 */
function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 6,
    summaryRow: {
      visible: true
    }   
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LI05020E.RS_T2_MASTER",
    sortCol: "INBOUND_NO",
    gridOptions: options
  });

  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

/**
 * 입고중량등록 탭 하단 그리드 행 클릭시
 * 
 * @param e
 * @param args
 */
function grdT1DetailOnClick(e, args) {

  G_GRDT1DETAIL.focused = true;

}

/**
 * 입고중량등록 탭 하단 그리드 행 클릭시
 * 
 * @param e
 * @param args
 */
function grdT1SubOnClick(e, args) {

  G_GRDT1SUB.focused = true;

}

/**
 * 입고중량등록탭 상단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
function grdT1MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  var rowData = G_GRDT1MASTER.data.getItem(row);

  if (G_GRDT1MASTER.lastRow != null) {
    if (row == G_GRDT1MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 값 초기화
  $NC.setInitGridVar(G_GRDT1DETAIL);
  $NC.setInitGridData(G_GRDT1DETAIL);
  $NC.setGridDisplayRows("#grdT1Detail", 0, 0);

  $NC.setInitGridVar(G_GRDT1SUB);
  $NC.setInitGridData(G_GRDT1SUB);
  $NC.setGridDisplayRows("#grdT1Sub", 0, 0);

  G_GRDT1DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_INBOUND_DATE: rowData.INBOUND_DATE,
    P_INBOUND_NO: rowData.INBOUND_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LI05020E/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Master", row + 1);
}

/**
 * 입고중량내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT2MasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDT2MASTER.lastRow != null) {
    if (row == G_GRDT2MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Master", row + 1);
}

/**
 * 입고중량등록탭 하단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
function grdT1DetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  var rowData = G_GRDT1DETAIL.data.getItem(row);

  if (G_GRDT1DETAIL.lastRow != null) {
    if (row == G_GRDT1DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 값 초기화
  $NC.setInitGridVar(G_GRDT1SUB);
  $NC.setInitGridData(G_GRDT1SUB);
  $NC.setGridDisplayRows("#grdT1Sub", 0, 0);

  G_GRDT1SUB.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_INBOUND_DATE: rowData.INBOUND_DATE,
    P_INBOUND_NO: rowData.INBOUND_NO,
    P_BRAND_CD: rowData.BRAND_CD,
    P_ITEM_CD: rowData.ITEM_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LI05020E/getDataSet.do", $NC.getGridParams(G_GRDT1SUB), onGetT1Sub);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Detail", row + 1);
}

/**
 * 입고중량등록탭 하단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
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

/**
 * 입고중량등록 탭 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT1Master(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);

  if (G_GRDT1MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1MASTER, {
        selectKey: "INBOUND_NO",
        selectVal: G_GRDT1MASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT1Master", 0, 0);
  }
}

/**
 * 입고중량내역 탭 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetT2Master(ajaxData) {

  $NC.setInitGridData(G_GRDT2MASTER, ajaxData);

  if (G_GRDT2MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT2MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT2MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT2MASTER, {
        selectKey: "INBOUND_NO",
        selectVal: G_GRDT2MASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT2Master", 0, 0);
  }
}

/**
 * 입고중량등록 탭 하단 그리드에 데이터 표시처리
 */
function onGetT1Detail(ajaxData) {

  $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);

  if (G_GRDT1DETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1DETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1DETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1DETAIL, {
        selectKey: "ITEM_CD",
        selectVal: G_GRDT1DETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT1Detail", 0, 0);
  }
  G_GRDT1DETAIL.view.getCanvasNode().focus();
}

/**
 * 입고중량등록 탭 하단 그리드에 데이터 표시처리
 */
function onGetT1Sub(ajaxData) {

  $NC.setInitGridData(G_GRDT1SUB, ajaxData);

  if (G_GRDT1SUB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1SUB.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1SUB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1SUB, {
        selectKey: "ITEM_CD",
        selectVal: G_GRDT1SUB.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT1Sub", 0, 0);
  }
  G_GRDT1SUB.view.getCanvasNode().focus();
}

/**
 * 저장 처리 성공 했을 경우 처리
 */
function onSave(ajaxData) {

  var lastRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
  _Inquiry();
  G_GRDT1MASTER.lastKeyVal = lastRowData.INBOUND_NO;

}

/**
 * 저장 처리 실패 했을 경우 처리
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);

}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  $NC.setInitGridVar(G_GRDT1MASTER);
  $NC.setInitGridData(G_GRDT1MASTER);
  $NC.setGridDisplayRows("#grdT1Master", 0, 0);

  $NC.setInitGridVar(G_GRDT1DETAIL);
  $NC.setInitGridData(G_GRDT1DETAIL);
  $NC.setGridDisplayRows("#grdT1Detail", 0, 0);

  $NC.setInitGridVar(G_GRDT1SUB);
  $NC.setInitGridData(G_GRDT1SUB);
  $NC.setGridDisplayRows("#grdT1Sub", 0, 0);

  $NC.setInitGridVar(G_GRDT2MASTER);
  $NC.setInitGridData(G_GRDT2MASTER);
  $NC.setGridDisplayRows("#grdT2Master", 0, 0);
}

/**
 * 검색조건의 사업부 검색 팝업 클릭
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

  $NP.showBuBrandPopup({
    P_BU_CD: BU_CD,
    P_BRAND_CD: "%"
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
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");
  onChangingCondition();
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onBuBrandPopup(resultInfo) {

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
 * 검색조건의 공급처 검색 이미지 클릭
 */
function showVendorPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd");
  
  $NP.showVendorPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_VENDOR_CD: "%",
      P_VIEW_DIV: "1"
    }
  }, onVendorPopup, function() {
    $NC.setFocus("#edtQVendor_Cd", true);
  });
}

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