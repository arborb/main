/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 체크할 정책 값
    policyVal: {
      LO510: "" // 배송처 표시 정책
    }
  });

  /* 추가 조회조건 사용
  $NC.setInitAdditionalCondition();
  */

  // 그리드 초기화
  grdMasterInitialize();

  /* 조회조건 - 물류센터 세팅
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
      $("#cboQCenter_Cd").val($NC.G_USERINFO.CENTER_CD);
    }
  });
  */

  // 초기값 설정
  $NC.setInitDatePicker("#dtpQOut_Date");

  // 초기값 설정 조회조건 - 사업구분 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQOwn_Brand_Cd").click(showOwnBranPopup);
  $("#btnQBrand_Cd").click(showSellerPopup);
  $("#btnQBrandDeal_Id").click(showBrandDealPopup);

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

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  var height = clientHeight - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, height);
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
  case "BRAND_CD":
    var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd");
    if ($NC.isNull(BRAND_CD)) {
      alert("위탁사 코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocus("#edtQOwn_Brand_Cd", true);
      $NC.setValue("edtQBrand_Cd", null);
      return;
    }

    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getBrandInfo({
        queryParams: P_QUERY_PARAMS
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
  case "BRANDDEAL_ID":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd");
      var DEAL_ID = $NC.getValue("#edtQDeal_Id");
      P_QUERY_PARAMS = {
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: BRAND_CD,
        P_SELLER_CD: '%',
        P_DEAL_ID: DEAL_ID
      };
      O_RESULT_DATA = $NP.getBrandDealIdInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBrandDealPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showBrandDealPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBrandDealPopup, onBrandDealPopup);
    }
    return;

  }

  // 조회 조건에 Object Change
  onChangingCondition();
}

/**
 * 조회조건이 변경될 때 호출
 */
function onChangingCondition() {

  // 초기화
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
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */

function _Inquiry() {

  /*
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  */

  // 조회조건 체크
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업구분 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var OUT_DATE = $NC.getValue("#dtpQOut_Date");
  if ($NC.isNull(OUT_DATE)) {
    alert("조회일을 입력하십시오.");
    $NC.setFocus("#dtpQOut_Date");
    return;
  }

  var OWN_BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var DEAL_ID = $NC.getValue("#edtQDail_Id");
  var OUTBOUND_DATE = $NC.getValue("#dtpQOut_Date");

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: OWN_BRAND_CD,
    P_BRAND_CD: BRAND_CD,
    P_DEAL_ID: DEAL_ID,
    P_OUT_DATE: OUTBOUND_DATE,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });

  // 데이터 조회
  $NC.serviceCall("/LS07010Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜코드",
    minWidth: 90,
    cssClass: "align-center",
    formatter: Slick.Formatters.Link
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_ID",
    field: "OPTION_ID",
    name: "옵션코드",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션명",
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
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "OUT_QTY",
    field: "OUT_QTY",
    name: "판매수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY_D",
    field: "STOCK_QTY_D",
    name: "총재고(정상/불량)",
    minWidth: 120,
    cssClass: "align-right",
  // aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "AVG_QTY",
    field: "AVG_QTY",
    name: "일평균판매수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OPEN_DEAL_DATE",
    field: "OPEN_DATE",
    name: "딜시작일자",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "CLOSE_DEAL_DATE",
    field: "CLOSE_DATE",
    name: "딜종료일자",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SAFETY_QTY",
    field: "SAFETY_QTY",
    name: "안전재고수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_DIV",
    field: "DEAL_DIV",
    name: "거래구분",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_CD",
    field: "OWN_BRAND_CD",
    name: "대표위탁사코드",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_NM",
    field: "OWN_BRAND_NM",
    name: "대표위탁사명",
    minWidth: 90
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

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 2
  };

  /*
  var options = {
    frozenColumn: 3,
    summaryRow: {
      visible: true
    }
  };
  */

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LS07010Q.RS_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

/**
 * 재고운영현황 조회
 * 
 * @param ajaxData
 */
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

  $NC.setInitTopButtons($NC.G_VAR.buttons);
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

/**
 * 사업구분 검색 결과
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

  // 브랜드 조회조건 초기화
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");

  onChangingCondition();
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
 * 검색조건의 판매사 검색 팝업 클릭
 */
function showSellerPopup() {
  var CUST_CD = $NC.G_USERINFO.CUST_CD;
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var OWN_BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd");
  if ($NC.isNull(OWN_BRAND_CD)) {
    alert("위탁사 코드를 먼저 선택하시기 바랍니다.");
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
    return;
  }

  $NP.showSellerPopup({
    P_CUST_CD: CUST_CD,
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: OWN_BRAND_CD,
    P_SELLER_CD: '%'
  }, onSellerPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

/**
 * 판매사 검색 결과
 * 
 * @param seletedRowData
 */
function onSellerPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.SELLER_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.SELLER_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 위탁사 > 판매사 > 딜 팝업 이미지 클릭
 */

function showBrandDealPopup() {
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var OWN_BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd");
  var DEAL_ID = $NC.getValue("#edtQBrandDeal_id");

  $NP.showBrandDealPopup({
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: OWN_BRAND_CD,
    P_SELLER_CD: "%",
    P_DEAL_ID: DEAL_ID
  }, onBrandDealPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

function onBrandDealPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrandDeal_Id", resultInfo.DEAL_ID);
    $NC.setValue("#edtQBrandDeal_Nm", resultInfo.DEAL_NM);
  } else {
    $NC.setValue("#edtQBrandDeal_Id");
    $NC.setValue("#edtQBrandDeal_Nm");
    $NC.setFocus("#edtQBrandDeal_Id", true);
  }
  onChangingCondition();
}
