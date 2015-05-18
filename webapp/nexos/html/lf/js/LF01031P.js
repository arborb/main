/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null
  });

  // 버튼 클릭 이벤트 연결
  $("#btnAdjustInsertA").click(onAdjustInsertA); // 미처리내역 처리
  // 버튼 클릭 이벤트 연결
  $("#btnAdjustInsertB").click(onAdjustInsertB); // 정산내역 생성
  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel); // 닫기버튼
  $("#btnOwn_Brand_Cd").click(showOwnBranPopup);

  // 정산일자에 달력이미지 설정
  $NC.setInitDatePicker("#dtpQAdjust_Date1");
  $NC.setInitDatePicker("#dtpQAdjust_Date2");

  // 정산월에 달력이미지 설정
  $NC.setInitMonthPicker("#dtpQAdjust_Month");

  $("#btnBu_Cd").click(showUserBuPopup);

//조회조건 - 물류센터 세팅
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
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 220;
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
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

  $NC.setPopupCloseAction("CANCEL");
  $NC.onPopupClose();
}

/**
 * 미처리내역 처리
 */
function onAdjustInsertA() {

  var BRAND_CD = $NC.getValue("#edtOwn_Brand_Cd");
  if ($NC.isNull(BRAND_CD)) {
    alert("위탁사를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  var ADJUST_DATE1 = $NC.getValue("#dtpQAdjust_Date1");
  if ($NC.isNull(ADJUST_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Date1");
    return;
  }

  var ADJUST_DATE2 = $NC.getValue("#dtpQAdjust_Date2");
  if ($NC.isNull(ADJUST_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Date2");
    return;
  }

  if (ADJUST_DATE1 > ADJUST_DATE2) {
    alert("정산일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQAdjust_Date1");
    return;
  }

  var ADJUST_MONTH = $NC.getValue("#dtpQAdjust_Month");
  if ($NC.isNull(ADJUST_MONTH)) {
    alert("정산월을 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Month");
    return;
  };

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtBu_Cd");

  $NC.serviceCall("/LF01030E/callAdjustInsert.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_BRAND_CD: BRAND_CD,
      P_CLOSE_START_DATE: ADJUST_DATE1,
      P_CLOSE_END_DATE: ADJUST_DATE2,
      P_CLOSE_MONTH: ADJUST_MONTH,
      P_CLOSE_GUBN: '2',
      P_PAY_CHA_DIV: '1',
      P_REG_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onSave, onSaveError);
}

/**
 * 미처리내역 처리
 */
function onAdjustInsertB() {

  var BRAND_CD = $NC.getValue("#edtOwn_Brand_Cd");
  if ($NC.isNull(BRAND_CD)) {
    alert("위탁사를 입력하십시오.");
    $NC.setFocus("#edtOwn_Brand_Cd");
    return;
  }

  var ADJUST_DATE1 = $NC.getValue("#dtpQAdjust_Date1");
  if ($NC.isNull(ADJUST_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Date1");
    return;
  }

  var ADJUST_DATE2 = $NC.getValue("#dtpQAdjust_Date2");
  if ($NC.isNull(ADJUST_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Date2");
    return;
  }

  if (ADJUST_DATE1 > ADJUST_DATE2) {
    alert("정산일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQAdjust_Date1");
    return;
  }

  var ADJUST_MONTH = $NC.getValue("#dtpQAdjust_Month");
  if ($NC.isNull(ADJUST_MONTH)) {
    alert("정산월을 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Month");
    return;
  };
  

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");

  var BU_CD = $NC.getValue("#edtBu_Cd");

  $NC.serviceCall("/LF01030E/callAdjustInsert.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_BRAND_CD: BRAND_CD,
      P_CLOSE_START_DATE: ADJUST_DATE1,
      P_CLOSE_END_DATE: ADJUST_DATE2,
      P_CLOSE_MONTH: ADJUST_MONTH,
      P_CLOSE_GUBN: '1',
      P_PAY_CHA_DIV: '1',
      P_REG_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onSave, onSaveError);

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
  masterDataOnChange(e, {
    col: id,
    val: val,
    view: view
  });
}

/**
 * 조회
 */
function _Inquiry() {
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
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

  switch (args.col) {
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
    if (!$NC.isNull(args.val)) {
      var CUST_CD = $NC.getValue("#edtCust_Cd");
      var BU_CD = $NC.getValue("#edtBu_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: args.val
      };
      O_RESULT_DATA = $NP.getOwnBrand_lfInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBran_lfPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup, onOwnBrandPopup);
    }
    return;
  }

}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {

  var BU_CD = $NC.getValue("#edtBu_Cd");
  var CUST_CD = '0000';

  $NP.showOwnBran_lfPopup({
    P_CUST_CD: CUST_CD,
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtOwn_Brand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {

    $NC.setValue("#edtOwn_Brand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtOwn_Brand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtOwn_Brand_Cd");
    $NC.setValue("#edtOwn_Brand_Nm");
    $NC.setFocus("#edtOwn_Brand_Cd", true);
  }
}

/**
 * 검색조건의 공급처 검색 팝업 클릭
 */
function showVendorBrandPopup() {

  var CUST_CD = $NC.getValue("#edtCust_Cd");

  $NP.showVendorPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_VENDOR_CD: "%",
      P_VIEW_DIV: "1"
    }
  }, onVendorBrandPopup, function() {
    $NC.setFocus("#edtVendor_Cd", true);
  });
}

/**
 * 배송처 검색 결과
 * 
 * @param seletedRowData
 */
function onVendorBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.masterData.VENDOR_CD = resultInfo.VENDOR_CD;
    $NC.setValue("#edtVendor_Cd", resultInfo.VENDOR_CD);
    $NC.setValue("#edtVendor_Nm", resultInfo.VENDOR_NM);
  } else {
    $NC.G_VAR.masterData.VENDOR_CD = "";
    $NC.setValue("#edtVendor_Cd");
    $NC.setValue("#edtVendor_Nm");
    $NC.setFocus("#edtVendor_Cd", true);
  }
  if ($NC.G_VAR.masterData.CRUD == "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}
/*
function onVendorBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.masterData.VENDOR_CD = resultInfo.VENDOR_CD;
    $NC.setValue("#edtVendor_Cd", resultInfo.VENDOR_CD);
    $NC.setValue("#edtVendor_Nm", resultInfo.VENDOR_NM);
    $NC.setFocus("#edtCar_No", true);
  } else {
    $NC.G_VAR.masterData.VENDOR_CD = "";
    $NC.setValue("#edtVendor_Cd");
    $NC.setValue("#edtVendor_Nm");
    $NC.setFocus("#edtVendor_Cd", true);
  }
  if ($NC.G_VAR.masterData.CRUD == "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}
*/
/**
 * 그리드에서 상품 선택/취소했을 경우 처리
 * 
 * @param seletedRowData
 */
function onItemPopup(resultInfo) {

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

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
    rowData.BOX_WEIGHT = resultInfo.BOX_WEIGHT;
    rowData.BUY_PRICE = resultInfo.BUY_PRICE;
    if ($NC.G_VAR.userData.P_POLICY_LI190 == "2") {
      rowData.APPLY_PRICE = resultInfo.BUY_PRICE;
    }
    rowData.TOTAL_AMT = rowData.BUY_AMT;
    rowData.VAT_YN = resultInfo.VAT_YN;
    rowData = grdDetailOnCalc(rowData);

    focusCol = G_GRDDETAIL.view.getColumnIndex("ORDER_QTY");
  } else {
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";
    rowData.ITEM_SPEC = "";
    rowData.QTY_IN_BOX = 1;
    rowData.ORDER_QTY = 0;
    rowData.BOX_WEIGHT = 0;
    rowData.ORDER_WEIGHT = 0;
    rowData.BUY_PRICE = 0;
    rowData.BUY_AMT = 0;
    rowData.VAT_AMT = 0;
    rowData.DC_AMT = 0;
    rowData.TOTAL_AMT = 0;
    rowData.VAT_YN = "N";

    focusCol = G_GRDDETAIL.view.getColumnIndex("ITEM_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
}

function grdDetailOnCalc(rowData, order_Qty) {

  if (!$NC.isNull(order_Qty)) {
    rowData.ORDER_QTY = Number(order_Qty);
  }
  rowData.ORDER_BOX = $NC.getB_Box(rowData.ORDER_QTY, rowData.QTY_IN_BOX);
  rowData.ORDER_EA = $NC.getB_Ea(rowData.ORDER_QTY, rowData.QTY_IN_BOX);
  rowData.ORDER_WEIGHT = $NC.getWeight(rowData.ORDER_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);

  var params = {
    ITEM_PRICE: rowData.BUY_PRICE,// 매입단가 또는 공급단가
    APPLY_PRICE: rowData.APPLY_PRICE,// 적용단가
    ITEM_QTY: rowData.ORDER_QTY,// 상품수량
    ITEM_AMT: rowData.BUY_AMT,// 매입금액 또는 공급금액
    VAT_YN: rowData.VAT_YN,// 과세여부가 NULL일 경우는 부가세금액이 있는지로 체크
    VAT_AMT: rowData.VAT_AMT,// 부가세
    DC_AMT: rowData.DC_AMT,// 할인금액
    TOTAL_AMT: rowData.TOTAL_AMT,// 합계금액
    POLICY_VAL: $NC.G_VAR.userData.P_POLICY_LI190
  };

  rowData.BUY_AMT = $NC.getItem_Amt(params);
  rowData.VAT_AMT = $NC.getVat_Amt(params);
  rowData.TOTAL_AMT = $NC.getTotal_Amt(params);

  return rowData;
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  onClose();
}

/**
 * 검색조건의 사업부 검색 팝업 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BRAND_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtBu_Cd", true);
  });
}

/**
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtBu_Nm", resultInfo.BU_NM);
  } else {
    $NC.setValue("#edtBu_Cd");
    $NC.setValue("#edtBu_Nm");
    $NC.setFocus("#edtBu_Cd", true);
  }

  // 브랜드 초기화
  $NC.setValue("#edtBrand_Cd");
  $NC.setValue("#edtBrand_Nm");

}

/**
 * 수신 처리 실패 했을 경우 처리
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}
