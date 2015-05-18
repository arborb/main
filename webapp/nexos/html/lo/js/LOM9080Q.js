/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
   $NC.setGlobalVar({ });
   
  setInterval(function() {
    _Save();
  }, 10000);
  
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.qtyBoxWidth = 102;
  $NC.G_OFFSET.qtyBoxHeight = 52;
  $NC.G_OFFSET.gboxHeight = $("#divMasterView .ui-gbox-title:first").outerHeight();
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}



/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  var leftWidth = $NC.getTruncVal(clientWidth / 2);
  var rightWidth = clientWidth - leftWidth - $NC.G_LAYOUT.margin1;
//  var topHeight = $NC.getTruncVal(clientHeight / 2);
//  var bottomHeight = clientHeight - topHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);
  $NC.resizeContainer("#divLeftView", leftWidth, clientHeight);
  $NC.resizeContainer("#divRightView", rightWidth, clientHeight);
  
//  var leftChartWidth = leftWidth - $NC.G_LAYOUT.margin2  - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1 - $NC.G_OFFSET.qtyBoxWidth;
//  var rightChartWidth = rightWidth - $NC.G_LAYOUT.margin2  - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1 - $NC.G_OFFSET.qtyBoxWidth;
//  var topChartHeight = topHeight - $NC.G_OFFSET.gboxHeight - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1; 
//  var bottomChartHeight = bottomHeight - $NC.G_OFFSET.gboxHeight - $NC.G_LAYOUT.margin2 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1;
  
//  chtPointLabelHideZeros(false); // 포인트 라벨 HideZeros 옵션 false(관련버그있음)
//  resizeChartContainer("#masterTotalQty", leftChartWidth, topChartHeight);
//  resizeChartContainer("#cntTotalQty", leftChartWidth, bottomChartHeight);
//  resizeChartContainer("#detailTotalQty", rightChartWidth, topChartHeight);
//  resizeChartContainer("#AnalTotalQty", rightChartWidth, bottomChartHeight);
}

function _OnLoaded() {

  // 로드시 화면 초기화 처리
  onChangingCondition();
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {
/*
  var id = view.prop("id").substr(4).toUpperCase();

  // 브랜드 Key 입력
  switch (id) {
  case "CENTER_CD":
    // 위탁사, 사업부, 브랜드 조회조건 초기화
    $NC.setValue("#edtQCust_Cd");
    $NC.setValue("#edtQCust_Nm");
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    break;
  case "CUST_CD":
    // 사업부, 브랜드 조회조건 초기화
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
      if (CENTER_CD == "%") {
        alert("물류센터를 먼저 선택해 주세요.");
        $NC.setValue("#edtQCust_Cd");
        $NC.setFocus("#cboQCenter_Cd");
        return;
      }
      P_QUERY_PARAMS = {
        P_CUST_CD: val
      };
      O_RESULT_DATA = $NP.getCustInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onCustPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showCustPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onCustPopup, onCustPopup);
    }
    return;
  case "BU_CD":
    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      if ($NC.isNull(CUST_CD)) {
        alert("위탁사를 먼저 선택해 주세요.");
        $NC.setValue("#edtQBu_Cd");
        $NC.setFocus("#edtQCust_Cd");
        return;
      }
      P_QUERY_PARAMS = {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: val,
        P_CUST_CD: CUST_CD
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
      if ($NC.isNull(BU_CD)) {
        alert("사업부를 먼저 선택해 주세요.");
        $NC.setValue("#edtQBrand_Cd");
        $NC.setFocus("#edtQBu_Cd");
        return;
      }
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
  case "AGG_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "AGG_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
  }

  onChangingCondition();
  */
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
  var AGG_DATE1 = $NC.getValue("#dtpQAgg_Date1");
  if ($NC.isNull(AGG_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQAgg_Date1");
    return;
  }
  var AGG_DATE2 = $NC.getValue("#dtpQAgg_Date2");
  if ($NC.isNull(AGG_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQAgg_Date2");
    return;
  }
  
  if (AGG_DATE1 > AGG_DATE2) {
    alert("조회일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQAgg_Date1");
    return;
  }
  
  var CUST_CD = $NC.getValue("#edtQCust_Cd", true);
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  */
  // 공지사항
  $NC.serviceCall("/LOM9080Q/getDataSet.do", {
    P_QUERY_ID: "LOM9080Q.RS_MASTER",
    P_QUERY_PARAMS: $NC.getParams({
    })
  }, onGetReport);
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

  $NC.serviceCall("/LOM9080Q/callSP.do", {
    P_QUERY_ID: "UPD_WMS_LOTOTAL",
    P_QUERY_PARAMS: $NC.getParams({
    })
  }, onSave, onSaveError);
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
 * 전표수, 라인수, 수량, 주문분석 차트 업데이트
 * 
 * @param ajaxData
 */
function onGetReport(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData) && resultData.length) {
//    var countDS = [];
//    var ticks = [];
//    var qty = [0, 0, 0, 0];
    var rowData;
    
    rowData = resultData[0];
    $NC.setValue("#edtW1_Qty",rowData.TOTAL_W_1);
    $NC.setValue("#edtW2_Qty",rowData.TOTAL_W_2);
    $NC.setValue("#edtW3_Qty",rowData.TOTAL_W_3);
    $NC.setValue("#edtW4_Qty",rowData.TOTAL_W_4);
    $NC.setValue("#edtW5_Qty",rowData.TOTAL_W_5);
    $NC.setValue("#edtW6_Qty",rowData.TOTAL_W_6);
    $NC.setValue("#edtW7_Qty",rowData.TOTAL_W_7);
    $NC.setValue("#edtZ1_Qty",rowData.TOTAL_Q_1);
    $NC.setValue("#edtZ2_Qty",rowData.TOTAL_Q_2);
    $NC.setValue("#edtZ3_Qty",rowData.TOTAL_Q_3);
    $NC.setValue("#edtZ4_Qty",rowData.TOTAL_Q_4);
    $NC.setValue("#edtZ5_Qty",rowData.TOTAL_Q_5);
    $NC.setValue("#edtZ6_Qty",rowData.TOTAL_Q_6);
    $NC.setValue("#edtZ7_Qty",rowData.TOTAL_Q_7);
//      qty[0] += rowData.ORDER_CNT;
//      qty[1] += rowData.LINE_CNT;
//      qty[2] += rowData.ORDER_QTY;
//      qty[3] += rowData.ORDER_CNT1;
//      qty[3] += rowData.ORDER_CNT2;
//      qty[3] += rowData.ORDER_CNT3;
//      qty[3] += rowData.ORDER_CNT4;
//      qty[3] += rowData.ORDER_CNT5;
//      qty[3] += rowData.ORDER_CNT6;
    
  } 
}

function setTimer() {

  setInterval(function() {
    _Save();
  }, 10000);
}

/**
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {
  _Inquiry();
}

/**
 * 저장에 실패 했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}

function onChangingCondition() {


  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}



