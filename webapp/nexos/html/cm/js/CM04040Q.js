/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();

  $NC.setInitDatePicker("#dtpQSafety_Date");

  // 조회조건 - 거래구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      // P_CODE_GRP: "DEAL_YN_DIV",
      P_CODE_GRP: "DEAL_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboDeal_Div_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });

  // 사업부 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  setMallCodeCombo($NC.G_USERINFO.BU_CD);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showOwnBranPopup);
  $("#btnQMall_Brand_Cd").click(showSellerPopup);
  $("#btnQDeal_Cd").click(showDealPopup);
  $("#btnQOption_Cd").click(showDealOptionPopup);

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $("#divTopView").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Container 사이즈 조정
  $NC.resizeContainer("#divCenterView", clientWidth, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * 조회조건이 변경될 때 호출
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
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  // 사업부 Key 입력
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
      onUserBuQPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showUserBuPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onUserBuQPopup, onUserBuQPopup);
    }
    return;

  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.getValue("#cboQBu_Cd", true);
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
  case "MALL_BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: BRAND_CD,
        P_SELLER_CD: val
      };
      O_RESULT_DATA = $NP.getSellerInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onSellerPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showSellerPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onSellerPopup, onSellerPopup);
    }
    return;
  }

  onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  // var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
  // var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
  // var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");

  var SELLER_CD = $NC.getValue("#edtQMall_Brand_Cd", true);
  var MALL_CD = $NC.getValue("#cboQMall_Cd");
  var DEAL_ID = $NC.getValue("#edtQDeal_Cd");
  var DEAL_NM = $NC.getValue("#edtQDeal_Nm");
  var DEAL_DIV_CD = $NC.getValue("#cboDeal_Div_Cd");

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_SELLER_CD: SELLER_CD,
    P_DEAL_DIV_CD: DEAL_DIV_CD,
    // P_DEAL_DIV2: DEAL_DIV2,
    // P_DEAL_DIV3: DEAL_DIV3,
    P_DEAL_CD: DEAL_ID,
    P_DEAL_NM: DEAL_NM,
    P_MALL_CD: MALL_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });

  // 데이터 조회
  $NC.serviceCall("/CM04040Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {}




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
    id: "MALL_NM",
    field: "MALL_NM",
    name: "MALL명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_NM",
    field: "OWN_BRAND_NM",
    name: "위탁사",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM_1",
    field: "BRAND_NM_1",
    name: "판매사",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜코드",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 150
  });

  $NC.setGridColumn(columns, {
    id: "DEAL_DIV_F",
    field: "DEAL_DIV_F",
    name: "거래구분",
    minWidth: 90
  });

  $NC.setGridColumn(columns, {
    id: "OPEN_DATE",
    field: "OPEN_DATE",
    name: "거래일자",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CLOSE_DATE",
    field: "CLOSE_DATE",
    name: "종료일자",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_ID",
    field: "OPTION_ID",
    name: "옵션코드",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ITEM_CD",
    field: "DEAL_ITEM_CD",
    name: "상품코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ITEM_NM",
    field: "DEAL_ITEM_NM",
    name: "상품명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ITEM_SPEC",
    field: "DEAL_ITEM_SPEC",
    name: "규격",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "판매사명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ITEM_QTY",
    field: "DEAL_ITEM_QTY",
    name: "구성수량",
    minWidth: 70,
    cssClass: "align-right"
  });

  
  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 4,
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CM04040Q.RS_MASTER",
    sortCol: "MALL_NM",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}





function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];

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
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
}



/**
 * 검색조건의 사업부 검색 팝업 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuQPopup, function() {
    $NC.setFocus("#edtQBu_Cd", true);
  });
}

/**
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
function onUserBuQPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setFocus("#edtQBu_Cd", true);
  }

  // 브랜드 초기화
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");

  onChangingCondition();
}

function onUserBuPopup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.BU_CD = resultInfo.BU_CD;
    rowData.BU_NM = resultInfo.BU_NM;

    focusCol = G_GRDMASTER.view.getColumnIndex("ITEM_CD");
  } else {
    rowData.BU_CD = "";
    rowData.BU_NM = "";
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";
    rowData.ITEM_SPEC = "";
    rowData.QTY_IN_BOX = 1;

    focusCol = G_GRDMASTER.view.getColumnIndex("ITEM_CD");
  }

  rowData = grdMasterOnCalc(rowData);
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
  $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {

  var CUST_CD = $NC.G_USERINFO.CUST_CD;
  var BU_CD = $NC.G_USERINFO.BU_CD;

  $NP.showOwnBranPopup({
    P_CUST_CD: CUST_CD,
    P_BU_CD: $NC.getValue("#cboQBu_Cd", true),
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

function grdMasterOnCalc(rowData, SAFETY_QTY) {

  if (!$NC.isNull(SAFETY_QTY)) {
    rowData.SAFETY_QTY = Number(SAFETY_QTY);
  }
  rowData.SAFETY_BOX = $NC.getB_Box(rowData.SAFETY_QTY, rowData.QTY_IN_BOX);
  rowData.SAFETY_EA = $NC.getB_Ea(rowData.SAFETY_QTY, rowData.QTY_IN_BOX);
  return rowData;
}

function onItemPopup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.BRAND_CD = resultInfo.BRAND_CD;
    rowData.BRAND_NM = resultInfo.BRAND_NM;
    rowData.ITEM_CD = resultInfo.ITEM_CD;
    rowData.ITEM_NM = resultInfo.ITEM_NM;
    rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
    rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;

    focusCol = G_GRDMASTER.view.getColumnIndex("SAFETY_QTY");
  } else {
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";
    rowData.ITEM_SPEC = "";
    rowData.QTY_IN_BOX = 1;

    focusCol = G_GRDMASTER.view.getColumnIndex("ITEM_CD");
  }

  rowData = grdMasterOnCalc(rowData);
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
  $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}

/**
 * 사업부 값 변경시 몰코드 콤보 재설정
 */
function setMallCodeCombo(setBu_Cd) {

  var BU_CD;
  if ($NC.isNull(setBu_Cd)) {
    BU_CD = "5000";
  } else {
    BU_CD = setBu_Cd;
  }

  if (BU_CD == "5000") {

    // 몰구분
    $NC.setInitCombo("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMMALL",
      P_QUERY_PARAMS: $NC.getParams({
        P_MALL_CD: "M00%"
      })
    }, {
      selector: "#cboQMall_Cd",
      codeField: "MALL_CD",
      nameField: "MALL_NM",
      fullNameField: "MALL_CD_F"
    });
  } else {
    // 몰구분
    $NC.setInitCombo("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMMALL",
      P_QUERY_PARAMS: $NC.getParams({
        P_MALL_CD: "%"
      })
    }, {
      selector: "#cboQMall_Cd",
      codeField: "MALL_CD",
      nameField: "MALL_NM",
      fullNameField: "MALL_CD_F",
      addAll: true
    });
  }
}

function showDealPopup() {
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var DEAL_ID = $NC.getValue("#edtQDeal_Cd", true);

  $NP.showDealPopup({
    P_BU_CD: BU_CD,
    P_DEAL_ID: DEAL_ID,
    P_VIEW_DIV: "2",
  }, onDealPopup, function() {
    $NC.setFocus("#edtQOption_Cd", true);
  });
}

function showDealOptionPopup() {
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var DEAL_ID = $NC.getValue("#edtQDeal_Cd", true);

  if ($NC.isNull(DEAL_ID)) {
    alert("먼저 딜코드를 입력하십시오.");
    $NC.setFocus("#edtQDeal_Cd");
    return;
  }

  $NP.showDealOptionPopup({
    P_BU_CD: BU_CD,
    P_DEAL_ID: DEAL_ID,
    P_OPTION_ID: "%"
  }, onDealOptionPopup, function() {
    $NC.setFocus("#edtEvent_Cd", true);
  });
}

function onDealPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQDeal_Cd", resultInfo.DEAL_ID);
    $NC.setValue("#edtQDeal_Nm", resultInfo.DEAL_NM);
  } else {
    $NC.setValue("#edtQDeal_Cd");
    $NC.setValue("#edtQDeal_Nm");
    $NC.setFocus("#edtQOption_Cd", true);
  }
  onChangingCondition();
}

function onDealOptionPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQOption_Cd", resultInfo.OPTION_ID);
    $NC.setValue("#edtQOption_Nm", resultInfo.OPTION_VALUE);
  } else {
    $NC.setValue("#edtQOption_Cd");
    $NC.setValue("#edtQOption_Nm");
    $NC.setFocus("#edtEvent_Cd", true);
  }
  onChangingCondition();
}

/**
 * MALL 브랜드 검색 팝업 클릭
 */

function showMallBrandPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var MALL_CD = $NC.getValue("#cboQMall_Cd");
  if ($NC.isNull(MALL_CD)) {
    alert("먼저 몰구분을 선택하십시오.");
    $NC.setFocus("#cboQMall_Cd");
    return;
  }

  $NP.showMallBrandPopup({
    P_BU_CD: BU_CD,
    P_MALL_CD: MALL_CD,
    P_BRAND_CD: '%'
  }, onMallBrandPopup, function() {
    $NC.setFocus("#edtQMall_Brand_Cd", true);
  });
}

/**
 * MALL 브랜드 검색 결과
 * 
 * @param seletedRowData
 */

function onMallBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {

    $NC.setValue("#edtQMall_Brand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQMall_Brand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.setValue("#edtQMall_Brand_Cd");
    $NC.setValue("#edtQMall_Brand_Nm");
    $NC.setFocus("#edtQMall_Brand_Cd", true);
  }
}

/**
 * 검색조건의 판매사 검색 팝업 클릭
 */
function showSellerPopup() {
  var CUST_CD = $NC.G_USERINFO.CUST_CD;
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  $NP.showSellerPopup({
    P_CUST_CD: CUST_CD,
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: BRAND_CD,
    P_SELLER_CD: '%'
  }, onSellerPopup, function() {
    $NC.setFocus("#edtQMall_Brand_Cd", true);
  });
}

/**
 * 판매사 검색 결과
 * 
 * @param seletedRowData
 */
function onSellerPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQMall_Brand_Cd", resultInfo.SELLER_CD);
    $NC.setValue("#edtQMall_Brand_Nm", resultInfo.SELLER_NM);
  } else {
    $NC.setValue("#edtQMall_Brand_Cd");
    $NC.setValue("#edtQMall_Brand_Nm");
    $NC.setFocus("#edtQMall_Brand_Cd", true);
  }
  // setDepartCombo();
  onChangingCondition();
}
