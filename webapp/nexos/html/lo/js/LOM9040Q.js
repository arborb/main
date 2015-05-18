/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 체크할 정책 값
    policyVal: {
      LO450: "", // 송장 공급자 표시 기준
    }

  });

  // 탭 초기화
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 그리드 초기화
  grdMasterT1Initialize();
  grdMasterT2Initialize();

  // 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQOwn_Brand_Cd").click(showOwnBranPopup);
  // $("#btnQBrand_Cd").click(showBuBrandPopup);
  // $("#btnPrintInvoice").click(onBtnPrintInvoice);
  $("#btnQOutbound_Batch").click(setOutboundBatchCombo);

  // $NC.setInitDatePicker("#dtpQOutbound_Date1", null, "F"); // 당월의 첫쨋날 취득
  // $NC.setInitDatePicker("#dtpQOutbound_Date2");
  $NC.setInitDatePicker("#dtpQOutbound_Date");

  // 조회조건 - 물류센터 초기화
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
      setOutboundBatchCombo();
    }
  });

  // 조회조건 - 출고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "DM",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true,
    onComplete: null
  });

  // 조회조건 - 배송유형 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "DELIVERY_TYPE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQDelivery_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
  });
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $NC.G_LAYOUT.border1;
  $NC.G_OFFSET.gridHeightOffset = $NC.G_OFFSET.nonClientHeight + $NC.G_LAYOUT.header + $NC.G_LAYOUT.tabHeader
      + $("#divConditionViewT1").outerHeight() + ($NC.G_LAYOUT.border1 * 3);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border2;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientWidth -= $NC.G_LAYOUT.border1;
  // 입고진행현황 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {
    clientHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset;

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterT1", clientWidth, clientHeight);

  } else {
    clientHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset;

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterT2", clientWidth, clientHeight);
  }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  // 브랜드 Key 입력
  switch (id) {
  case "CENTER_CD":
    setPolicyValInfo();
    setOutboundBatchCombo();
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
    /*
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
    */
  case "OWN_BRAND_CD":
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
  case "OUTBOUND_DATE":
    $NC.setValueDatePicker(view, val, "출고일자를 정확히 입력하십시오.");
    setOutboundBatchCombo();
    break;
  }

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
    alert("사업구분 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("출고일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date");
    return;
  }

  // var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
  var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd");
  var BU_NO = $NC.getValue("#edtQBu_No", true);
  var SHIPPER_NM = $NC.getValue("#edtQShipper_Nm", true);
  var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch", true);
  var WB_NO = $NC.getValue("#edtQWb_No", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var DEAL_ID = $NC.getValue("#edtQDeal_Id", true);
  var DELIVERY_TYPE = $NC.getValue("#cboQDelivery_Type");

  // 상품별 출고내역 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERT1);

    G_GRDMASTERT1.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_BATCH: OUTBOUND_BATCH,
      P_BRAND_CD: BRAND_CD,
      P_BU_NO: BU_NO,
      P_SHIPPER_NM: SHIPPER_NM,
      P_WB_NO: WB_NO,
      P_ITEM_CD: ITEM_CD,
      P_DEAL_ID: DEAL_ID,
      P_DELIVERY_TYPE: DELIVERY_TYPE,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LOM9040Q/getDataSet.do", $NC.getGridParams(G_GRDMASTERT1), onGetMasterT1);

  } else {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERT2);

    G_GRDMASTERT2.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_BATCH: OUTBOUND_BATCH,
      P_BRAND_CD: BRAND_CD,
      P_BU_NO: BU_NO,
      P_SHIPPER_NM: SHIPPER_NM,
      P_WB_NO: WB_NO,
      P_ITEM_CD: ITEM_CD,
      P_DEAL_ID: DEAL_ID,
      P_DELIVERY_TYPE: DELIVERY_TYPE,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LOM9040Q/getDataSet.do", $NC.getGridParams(G_GRDMASTERT2), onGetMasterT2);

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

  var CARRIER_CD = "";
  var CENTER_CD = "";
  var BU_CD = "";
  var OUTBOUND_DATE = "";
  var GRID_MASTER;
  var internalQueryYn = "";

  var reportDoc;
  var queryId;

  if ($("#divMasterView").tabs("option", "active") == 0) {
    var rowData = G_GRDMASTERT1.data.getItem(G_GRDMASTERT1.lastRow);
    CENTER_CD = rowData.CENTER_CD;
    BU_CD = rowData.BU_CD;
    OUTBOUND_DATE = rowData.OUTBOUND_DATE;
    CARRIER_CD = rowData.CARRIER_CD;

    if (CARRIER_CD == "0020") {
      reportDoc = "lo/LABEL_LOM09";
      queryId = "WR.RS_LABEL_LOM05";
    } else {
      reportDoc = "lo/LABEL_LOM09";
      queryId = "WR.RS_LABEL_LOM06";
    }

    GRID_MASTER = G_GRDMASTERT1;
    internalQueryYn = "N";
  } else {
    var rowData = G_GRDMASTERT2.data.getItem(G_GRDMASTERT2.lastRow);
    CENTER_CD = rowData.CENTER_CD;
    BU_CD = rowData.BU_CD;
    OUTBOUND_DATE = rowData.OUTBOUND_DATE;
    CARRIER_CD = rowData.CARRIER_CD;

    if (CARRIER_CD == "0020") {
      reportDoc = "lo/LABEL_LOM08";
      queryId = "WR.RS_LABEL_LOM04";
    } else {
      reportDoc = "lo/LABEL_LOM08";
      queryId = "WR.RS_LABEL_LOM07";
    }

    GRID_MASTER = G_GRDMASTERT2;
    internalQueryYn = "N";

  }

  var checkedValueDS = [ ];
  var saveDs = [ ];
  var checkCnt = 0;
  var rowCount = GRID_MASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = GRID_MASTER.data.getItem(row);
    if (rowData.CHECK_YN === "Y") {
      checkCnt++;
      checkedValueDS.push(rowData.WB_NO);
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_ORDER_DATE: rowData.ORDER_DATE,
        P_ORDER_NO: rowData.ORDER_NO,
        P_WB_NO: rowData.WB_NO
      };

      saveDs.push(saveData);
    }
  }

  if (checkCnt === 0) {
    alert("출력할 데이터를 선택하십시오.");
    return;
  }
  if (checkedValueDS.length == 0) {
    alert("출력 가능한 데이터를 선택하십시오.");
    return;
  }

  $NC.serviceCallAndWait("/LOM9040Q/Cksave.do", {
    P_DS_DETAIL: $NC.toJson(saveDs),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSavePrintYn);

  var queryParams = {
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: OUTBOUND_DATE,
    P_PRINT_YN: "(재)"
  };

  // 출력 호출
  $NC.G_MAIN.showPrintPreview({
    reportDoc: reportDoc,
    queryId: queryId,
    queryParams: queryParams,
    checkedValue: checkedValueDS.toString(),
    internalQueryYn: internalQueryYn
  });

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

  _OnResize($(window));
  _Inquiry();
}

function grdMasterT1OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 40,
    maxWidth: 40,
    cssClass: "align-center",
    sortable: false,
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 80
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
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "판매사코드",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "판매사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_TYPE_D",
    field: "DELIVERY_TYPE_D",
    name: "배송유형",
    cssClass: "align-center",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_CD",
    field: "CARRIER_CD",
    name: "운송사코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_NM",
    field: "CARRIER_NM",
    name: "운송사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "WB_NO",
    field: "WB_NO",
    name: "운송장번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_HP",
    field: "ORDERER_HP",
    name: "주문자휴대폰",
    minWidth: 100
  });

  $NC.setGridColumn(columns, {
    id: "SHIPPER_HP",
    field: "SHIPPER_HP",
    name: "수령자휴대폰",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ZIP_CD",
    field: "SHIPPER_ZIP_CD",
    name: "수령자우편번호",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_BASIC",
    field: "SHIPPER_ADDR_BASIC",
    name: "수령자기본주소",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_DETAIL",
    field: "SHIPPER_ADDR_DETAIL",
    name: "수령자상세주소",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_BATCH",
    field: "OUTBOUND_BATCH",
    name: "출고번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "PRINT_YN",
    field: "PRINT_YN",
    name: "출력여부",
    minWidth: 80,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdMasterT1Initialize() {

  var options = {
    frozenColumn: 4
  // ,summaryRow: {
  // visible: true
  // }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterT1", {
    columns: grdMasterT1OnGetColumns(),
    queryId: "LOM9040Q.RS_T1_MASTER",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDMASTERT1.view.onSelectedRowsChanged.subscribe(grdMasterT1OnAfterScroll);
  G_GRDMASTERT1.view.onHeaderClick.subscribe(grdMasterT1OnHeaderClick);
  G_GRDMASTERT1.view.onClick.subscribe(grdMasterT1OnClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERT1, "CHECK_YN");
}

/**
 * 상품별출고내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterT1OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERT1.lastRow != null) {
    if (row == G_GRDMASTERT1.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterT1", row + 1);
}

/**
 * 온라인몰 출고내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterT2OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERT2.lastRow != null) {
    if (row == G_GRDMASTERT2.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterT2", row + 1);
}

function grdMasterT2OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 40,
    maxWidth: 40,
    cssClass: "align-center",
    sortable: false,
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 80
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
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "판매사코드",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "판매사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_TYPE_D",
    field: "DELIVERY_TYPE_D",
    name: "배송유형",
    cssClass: "align-center",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_CD",
    field: "CARRIER_CD",
    name: "운송사코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_NM",
    field: "CARRIER_NM",
    name: "운송사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "WB_NO",
    field: "WB_NO",
    name: "운송장번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_HP",
    field: "ORDERER_HP",
    name: "주문자휴대폰",
    minWidth: 100
  });

  $NC.setGridColumn(columns, {
    id: "SHIPPER_HP",
    field: "SHIPPER_HP",
    name: "수령자휴대폰",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ZIP_CD",
    field: "SHIPPER_ZIP_CD",
    name: "수령자우편번호",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_BASIC",
    field: "SHIPPER_ADDR_BASIC",
    name: "수령자기본주소",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_DETAIL",
    field: "SHIPPER_ADDR_DETAIL",
    name: "수령자상세주소",
    minWidth: 160
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 온라인몰 출고내역탭의 그리드 초기값 설정
 */
function grdMasterT2Initialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterT2", {
    columns: grdMasterT2OnGetColumns(),
    queryId: "LOM9040Q.RS_T2_MASTER",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDMASTERT2.view.onSelectedRowsChanged.subscribe(grdMasterT2OnAfterScroll);
  G_GRDMASTERT2.view.onHeaderClick.subscribe(grdMasterT2OnHeaderClick);
  G_GRDMASTERT2.view.onClick.subscribe(grdMasterT2OnClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERT2, "CHECK_YN");
}

/**
 * 상품별출고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT1(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERT1, ajaxData);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERT1, "CHECK_YN");

  if (G_GRDMASTERT1.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTERT1, 0);
  } else {
    $NC.setGridDisplayRows("#grdMasterT1", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._excel = "1";
  $NC.G_VAR.buttons._print = "1";

  $NC.G_VAR.printOptions = [ ];
  $NC.G_VAR.printOptions.push({
    PRINT_INDEX: 0,
    PRINT_COMMENT: "합포장불가상품"
  });
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 온라인 출고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT2(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERT2, ajaxData);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERT2, "CHECK_YN");

  if (G_GRDMASTERT2.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTERT2, 0);
  } else {
    $NC.setGridDisplayRows("#grdMasterT2", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._excel = "1";
  $NC.G_VAR.buttons._print = "1";

  $NC.G_VAR.printOptions = [ ];
  $NC.G_VAR.printOptions.push({
    PRINT_INDEX: 0,
    PRINT_COMMENT: "송장재발행"
  });

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function _OnGridCheckBoxFormatterClick(e, view, args) {
  var GRID_MASTER;
  if ($("#divMasterView").tabs("option", "active") == 0) {
    GRID_MASTER = G_GRDMASTERT1;
  } else {
    GRID_MASTER = G_GRDMASTERT2;
  }

  if (GRID_MASTER.view.getEditorLock().isActive()) {
    GRID_MASTER.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(GRID_MASTER, args.row);

  var rowData = GRID_MASTER.data.getItem(args.row);

  if (args.cell == GRID_MASTER.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  GRID_MASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  GRID_MASTER.lastRowModified = true;
}

function grdMasterT1OnHeaderClick(e, args) {

  G_GRDMASTERT1.view.getCanvasNode().focus();

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTERT1.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDMASTERT1.data.getLength();
      var rowData;
      G_GRDMASTERT1.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDMASTERT1.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDMASTERT1.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTERT1.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

function grdMasterT2OnHeaderClick(e, args) {

  G_GRDMASTERT2.view.getCanvasNode().focus();

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTERT2.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDMASTERT2.data.getLength();
      var rowData;
      G_GRDMASTERT2.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDMASTERT2.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDMASTERT2.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTERT2.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

function grdMasterT1OnClick(e, args) {

  G_GRDMASTERT1.view.getCanvasNode().focus();

  if (args.cell === G_GRDMASTERT1.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDMASTERT1.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {
        rowData.CHECK_YN = checkVal;
        G_GRDMASTERT1.data.updateItem(rowData.id, rowData);
      }
    }
  }
}

function grdMasterT2OnClick(e, args) {

  G_GRDMASTERT2.view.getCanvasNode().focus();

  if (args.cell === G_GRDMASTERT2.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDMASTERT2.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {
        rowData.CHECK_YN = checkVal;
        G_GRDMASTERT2.data.updateItem(rowData.id, rowData);
      }
    }
  }
}

/**
 * 정책정보 취득
 */
function setPolicyValInfo() {

  // $NC.G_VAR.policyVal.LO420 = "";
  // $NC.G_VAR.policyVal.LO440 = "";
  $NC.G_VAR.policyVal.LO450 = "";

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCallAndWait("/LOM7010E/callSP.do", {
      P_QUERY_ID: "WF.GET_POLICY_VAL",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
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

  var resultData = $NC.toArray(ajaxData.data);

  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
      $NC.G_VAR.policyVal[resultData.P_POLICY_CD] = resultData.O_POLICY_VAL;
    }
    // 출고 스캔검수 기본 택배사 설정
    // var O_RESULT_DATA = [ ];
    // if (resultData.P_POLICY_CD == "LO440") {
    // $NC.G_VAR.CARRIER_CD = resultData.O_POLICY_VAL;
    // O_RESULT_DATA = $NP.getCarrierInfo({
    // queryParams: {
    // P_CARRIER_CD: $NC.G_VAR.CARRIER_CD,
    // P_VIEW_DIV: "1"
    // }
    // });
    // // onCarrierPopup(O_RESULT_DATA[0]);
    // }
  }
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._excel = "0";
  $NC.G_VAR.buttons._print = "1";

  $NC.setInitTopButtons($NC.G_VAR.buttons);

  // 초기화
  $NC.clearGridData(G_GRDMASTERT1);
  $NC.clearGridData(G_GRDMASTERT2);
}

/**
 * 검색조건의 사업구분 검색 이미지 클릭
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
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }

  // 위탁사 조회조건 초기화
  $NC.setValue("#edtQOwn_Brand_Cd");
  $NC.setValue("#edtQOwn_Brand_Nm");
  // $NC.setValue("#edtQBrand_Cd");
  // $NC.setValue("#edtQBrand_Nm");

  onChangingCondition();
  setPolicyValInfo();
  setOutboundBatchCombo();
}

// 출력 여부
function onSavePrintYn(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }
  _Inquiry();
}

/**
 * 물류센터/사업구분/출고일자 값 변경시 출고차수 콤보 재설정
 */
function setOutboundBatchCombo() {

  // 조회조건 - 출고차수 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_OUTBOUND_BATCH_LO",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date"),
      P_OUTBOUND_DIV: "2" // 출고작업구분(1:기본출고, 2:온라인출고)
    })
  }, {
    selector: "#cboQOutbound_Batch",
    codeField: "OUTBOUND_BATCH",
    nameField: "OUTBOUND_BATCH",
    fullNameField: "OUTBOUND_BATCH_F",
    addAll: true
  });
}

/**
 * 검색조건의 위탁사 검색 팝업 클릭
 */

function showOwnBranPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NP.showOwnBranPopup({
    P_CUST_CD: CUST_CD,
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
  });
}

/**
 * 위탁사 검색 결과
 * 
 * @param seletedRowData
 */

function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {

    $NC.setValue("#edtQOwn_Brand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQOwn_Brand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQOwn_Brand_Cd");
    $NC.setValue("#edtQOwn_Brand_Nm");
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
/*
function showBuBrandPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");

  $NP.showBuBrandPopup({
    P_BU_CD: BU_CD,
    P_BRAND_CD: "%"
  }, onBuBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}
*/

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
/*
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
*/