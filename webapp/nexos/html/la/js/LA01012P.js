/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 버튼 클릭 이벤트 연결
  $("#btnRequestInquiry").click(_Inquiry);
  $("#btnRequestCreate").click(onRequestCreate);
  $("#btnClose").click(onCancel); // 닫기버튼

  $("#btnVendor_Cd").click(showVendorPopup);
  $("#btnBrand_Cd").click(showBuBrandPopup);
  $("#btnItem_Cd").click(showItemPopup);

  // 그리드 초기화
  grdDetailInitialize();

}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  // 생성조건 - 발주구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "REQUEST_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboRequest_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboRequest_Div", "2");
    }
  });

  // 생성조건 - 입고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "E1",
      P_SUB_CD2: "%"
    })
  }, {
    selector: "#cboInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F"
  });

  $NC.setValue("#edtCust_Cd", $NC.G_VAR.userData.P_CUST_CD);
  $NC.setInitDatePicker("#dtpRequest_Date");
  $NC.setValue("#rgbCreate_Yn1", "1");

  $NC.setFocus("#edtVendor_Cd");
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 150;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.topOffset;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_LAYOUT.border1 - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, $NC.G_OFFSET.masterViewHeight);
  $NC.resizeContainer("#divDetailView", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - 9);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - $NC.G_LAYOUT.header - 9);
}

/**
 * 조회
 */
function _Inquiry() {

  var REQUEST_DATE = $NC.getValue("#dtpRequest_Date");
  if ($NC.isNull(REQUEST_DATE)) {
    alert("발주생성일자를 입력하십시오.");
    $NC.setFocus("#dtpRequest_Date");
    return;
  }
  var VENDOR_CD = $NC.getValue("#edtVendor_Cd", true);
  var BRAND_CD = $NC.getValue("#edtBrand_Cd", true);
  var ITEM_CD = $NC.getValue("#edtItem_Cd", true);
  var QTY_DIV = $NC.getValueRadioGroup("rgbCreate_Yn");

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL);

  G_GRDDETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
    P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
    P_REQUEST_DATE: REQUEST_DATE,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: ITEM_CD,
    P_VENDOR_CD: VENDOR_CD,
    P_QTY_DIV: QTY_DIV
  });

  // 데이터 조회
  $NC.serviceCall("/LA01010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
}

/**
 * 신규
 */
function _New() {

}

/**
 * 저장
 */
function _Save() {

}

/**
 * 삭제
 */
function _Delete() {

}

/**
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

  $NC.setPopupCloseAction("CANCEL");
  $NC.onPopupClose();
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

  $NC.setPopupCloseAction("OK");
  $NC.onPopupClose();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

  var id = view.prop("id").substr(3).toUpperCase();
  switch (id) {
  case "VENDOR_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtCust_Cd");
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
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BU_CD = $NC.G_VAR.userData.P_BU_CD;
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
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BU_CD = $NC.G_VAR.userData.P_BU_CD;
      var BRAND_CD = $NC.getValue("#edtBrand_Cd", true);
      P_QUERY_PARAMS = {
        P_BU_CD: BU_CD,
        P_BRAND_CD: BRAND_CD,
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
    break;
  case "REQUEST_DATE":
    $NC.setValueDatePicker(view, val, "발주생성일자를 정확히 입력하십시오.");
    break;
  }

  // 화면클리어
  onChangingCondition();
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  // 데이터 초기화
  $NC.clearGridData(G_GRDDETAIL);

}

function grdDetailOnGetColumns() {

  var columns = [ ];
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
    id: "TOTAL_REQUEST_CALC_QTY",
    field: "TOTAL_REQUEST_CALC_QTY",
    name: "총발주수량(계산)",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_CALC_QTY",
    field: "REQUEST_CALC_QTY",
    name: "발주수량(계산)",
    minWidth: 100,
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
    id: "TOTAL_REQUEST_QTY",
    field: "TOTAL_REQUEST_QTY",
    name: "총발주수량(최종)",
    minWidth: 100,
    cssClass: "align-right specialcol4"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_QTY",
    field: "REQUEST_QTY",
    name: "발주수량(최종)",
    minWidth: 100,
    cssClass: "align-right specialcol4"
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
    id: "PREORDER_QTY",
    field: "PREORDER_QTY",
    name: "기발주수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CUR_STOCK_QTY",
    field: "CUR_STOCK_QTY",
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

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "LA01010E.RS_DETAIL",
    sortCol: "VENDOR_CD",
    gridOptions: options,
    canExportExcel: false
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);

}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdDetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL.lastRow != null) {
    if (row == G_GRDDETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);

  if (G_GRDDETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
}

/**
 * 공급처 검색 팝업 클릭
 */
function showVendorPopup() {

  var CUST_CD = $NC.getValue("#edtCust_Cd");

  $NP.showVendorPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_VENDOR_CD: "%",
      P_VIEW_DIV: "2"
    }
  }, onVendorPopup, function() {
    $NC.setFocus("#edtVendor_Cd", true);
  });
}

/**
 * 공급처 검색 결과
 * 
 * @param seletedRowData
 */
function onVendorPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtVendor_Cd", resultInfo.VENDOR_CD);
    $NC.setValue("#edtVendor_Nm", resultInfo.VENDOR_NM);
  } else {
    $NC.setValue("#edtVendor_Cd");
    $NC.setValue("#edtVendor_Nm");
    $NC.setFocus("#edtVendor_Cd", true);
  }
  onChangingCondition();
}

/**
 * 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

  var BU_CD = $NC.G_VAR.userData.P_BU_CD;

  $NP.showBuBrandPopup({
    P_BU_CD: BU_CD,
    P_BRAND_CD: "%"
  }, onBuBrandPopup, function() {
    $NC.setFocus("#edtBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onBuBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtBrand_Nm", resultInfo.BRAND_NM);

  } else {
    $NC.setValue("#edtBrand_Cd");
    $NC.setValue("#edtBrand_Nm");
    $NC.setFocus("#edtBrand_Cd", true);

    // 상품그룹 초기화
    $NC.setValue("#edtItem_Cd");
    $NC.setValue("#edtItem_Nm");
  }
  onChangingCondition();
}

/**
 * 상품 검색 팝업 표시
 */
function showItemPopup() {

  var BU_CD = $NC.G_VAR.userData.P_BU_CD;
  var BRAND_CD = $NC.getValue("#edtBrand_Cd", true);

  $NP.showItemPopup({
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: "%",
    P_VIEW_DIV: "2",
    P_DEPART_CD: "%",
    P_LINE_CD: "%",
    P_CLASS_CD: "%"
  }, onItemPopup, function() {
    $NC.setFocus("#edtItem_Cd", true);
  });
}

/**
 * 상품 검색 팝업에서 상품선택 혹은 취소 했을 경우
 */
function onItemPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtItem_Cd", resultInfo.ITEM_CD);
    $NC.setValue("#edtItem_Nm", resultInfo.ITEM_NM);

  } else {
    $NC.setValue("#edtItem_Cd");
    $NC.setValue("#edtItem_Nm");
    $NC.setFocus("#edtItem_Cd", true);
  }
  onChangingCondition();
}



function onRequestCreate() {

  if (G_GRDDETAIL.data.getLength() === 0) {
    alert("생성할 데이터가 없습니다.");
    return;
  }

  var REQUEST_DATE = $NC.getValue("#dtpRequest_Date");
  if ($NC.isNull(REQUEST_DATE)) {
    alert("발주생성일자를 입력하십시오.");
    $NC.setFocus("#dtpRequest_Date");
    return;
  }

  var VENDOR_CD = $NC.getValue("#edtVendor_Cd", true);
  var BRAND_CD = $NC.getValue("#edtBrand_Cd", true);
  var ITEM_CD = $NC.getValue("#edtItem_Cd", true);
  var REQUEST_DIV = $NC.getValue("#cboRequest_Div");
  var INOUT_CD = $NC.getValue("#cboInout_Cd");
  var QTY_DIV = $NC.getValueRadioGroup("rgbCreate_Yn");

  var result = confirm("발주데이터를 생성 하시겠습니까?");
  if (result) {
    $NC.serviceCall("/LA01010E/callRequestCreation.do", {
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
        P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
        P_REQUEST_DATE: REQUEST_DATE,
        P_REQUEST_DIV: REQUEST_DIV,
        P_INOUT_CD: INOUT_CD,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: ITEM_CD,
        P_VENDOR_CD: VENDOR_CD,
        P_QTY_DIV: QTY_DIV,
        P_REG_USER_ID: $NC.G_USERINFO.USER_ID
      })
    }, function() {
      onClose();
    });
  }
}
