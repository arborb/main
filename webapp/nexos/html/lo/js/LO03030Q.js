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

  // 그리드 초기화
  grdMasterInitialize();

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
      $("#cboQCenter_Cd").val($NC.G_USERINFO.CENTER_CD);
    }
  });

  // 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $("#btnQBu_Cd").click(showUserBuPopup);
  // $("#btnQBrand_Cd").click(showBuBrandPopup);
  $("#btnQOwn_Brand_Cd").click(showOwnBranPopup);
  // 상품그룹 대,중,소 검색 이미지 클릭
  $("#btnQDepart_Cd").click(showItemGroupDepartPopup);
  $("#btnQLine_Cd").click(showItemGroupLinePopup);
  $("#btnQClass_Cd").click(showItemGroupClassPopup);

  // 조회조건 - 출고예정일자 달력이미지 설정
  $NC.setInitDatePicker("#dtpQOrder_Date1");
  $NC.setInitDatePicker("#dtpQOrder_Date2");

  // 조회조건 - 출고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "D1",
      P_SUB_CD2: "D2"
    })
  }, {
    selector: "#cboQInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });
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
  case "CENTER_CD":
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
  case "DEPART_CD":
    var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd");
    if ($NC.isNull(BRAND_CD)) {
      alert("위탁사 코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocus("#edtQOwn_Brand_Cd", true);
      $NC.setValue("edtQDepart_Cd", null);
      return;
    }

    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd")
      };
      O_RESULT_DATA = $NP.getItemGroupDepartInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemGroupDepartPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemGroupDepartPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemGroupDepartPopup, onItemGroupDepartPopup);
    }
    return;
  case "LINE_CD":
    var DEPART_CD = $NC.getValue("#edtQDepart_Cd");
    if ($NC.isNull(DEPART_CD)) {
      alert("대분류 코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocus("#edtQDepart_Cd", true);
      $NC.setValue("edtQLine_Cd", null);
      return;
    }

    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd"),
        P_DEPART_CD: $NC.getValue("#edtQDepart_Cd")
      };
      O_RESULT_DATA = $NP.getItemGroupLineInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemGroupLinePopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemGroupLinePopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemGroupLinePopup, onItemGroupLinePopup);
    }
    return;
  case "CLASS_CD":
    var LINE_CD = $NC.getValue("#edtQLine_Cd");
    if ($NC.isNull(LINE_CD)) {
      alert("중분류 코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocus("#edtQLine_Cd", true);
      $NC.setValue("edtQClass_Cd", null);
      return;
    }

    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd"),
        P_DEPART_CD: $NC.getValue("#edtQDepart_Cd"),
        P_LINE_CD: $NC.getValue("#edtQLine_Cd")
      };
      O_RESULT_DATA = $NP.getItemGroupClassInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemGroupClassPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemGroupClassPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemGroupClassPopup, onItemGroupClassPopup);
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
  case "ORDER_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "ORDER_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
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
  var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
  if ($NC.isNull(ORDER_DATE1)) {
    alert("출고예정 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }
  var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
  if ($NC.isNull(ORDER_DATE2)) {
    alert("출고예정 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date2");
    return;
  }
  if (ORDER_DATE1 > ORDER_DATE2) {
    alert("출고예정 검색 범위 오류입니다.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }
  var INOUT_CD = $NC.getValue("#cboQInout_Cd");
  if ($NC.isNull(INOUT_CD)) {
    alert("출고구분을 선택하십시오.");
    $NC.setFocus("#cboQInout_Cd");
    return;
  }

  var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd", true);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_ORDER_DATE1: ORDER_DATE1,
    P_ORDER_DATE2: ORDER_DATE2,
    P_INOUT_CD: INOUT_CD,
    P_BRAND_CD: BRAND_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });

  // 데이터 조회
  $NC.serviceCall("/LO03030Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 80,
    cssClass: "align-center",
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "배송처",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_NM",
    field: "DELIVERY_NM",
    name: "배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_CD",
    field: "RDELIVERY_CD",
    name: "실배송처",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_NM",
    field: "RDELIVERY_NM",
    name: "실배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "위탁사",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "위탁사명",
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
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "출고수량",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "QTY_RATE",
    field: "QTY_RATE",
    name: "출고율(%)",
    minWidth: 90,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.DATA_GRP.substr(rowData.DATA_GRP.length - 1) == "1") {
          return "specialrow4";
        }
      }
    },
    summaryRow: {
      visible: true,
      compareFn: function(field, rowData) {
        if (rowData.DATA_GRP.substr(rowData.DATA_GRP.length - 1) == "1") {
          return false;
        }
        return true;
      },
      resultFn: function(field, summary) {
        if (field == "QTY_RATE") {
          var result = Number((summary.CONFIRM_QTY / summary.ORDER_QTY * 100).toFixed(2));
          return isNaN(result) ? 0 : result;
        } else {
          return summary[field];
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LO03030Q.RS_MASTER",
    sortCol: "ORDER_DATE",
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
 * 예정대비출고현황 조회
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
 * 검색조건의 상품그룹 대분류 검색 이미지 클릭
 */
function showItemGroupDepartPopup() {
  var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd");
  if ($NC.isNull(BRAND_CD)) {
    alert("위탁사 코드를 먼저 선택하시기 바랍니다.");
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
    return;
  }

  $NP.showItemGroupDepartPopup({
    P_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd")
  }, onItemGroupDepartPopup, function() {
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
  });
}

/**
 * 상품그룹 대분류 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onItemGroupDepartPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQDepart_Cd", resultInfo.DEPART_CD);
    $NC.setValue("#edtQDepart_Nm", resultInfo.DEPART_NM);
  } else {
    $NC.setValue("#edtQDepart_Cd");
    $NC.setValue("#edtQDepart_Nm");
    $NC.setFocus("#edtQDepart_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 상품그룹 중분류 검색 이미지 클릭
 */
function showItemGroupLinePopup() {
  var DEPART_CD = $NC.getValue("#edtQDepart_Cd");
  if ($NC.isNull(DEPART_CD)) {
    alert("대분류 코드를 먼저 선택하시기 바랍니다.");
    $NC.setFocus("#edtQDepart_Cd", true);
    return;
  }

  $NP.showItemGroupLinePopup({
    P_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd"),
    P_DEPART_CD: $NC.getValue("#edtQDepart_Cd")
  }, onItemGroupLinePopup, function() {
    $NC.setFocus("#edtQLine_Cd", true);
  });
}

/**
 * 상품그룹 중분류 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onItemGroupLinePopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQLine_Cd", resultInfo.LINE_CD);
    $NC.setValue("#edtQLine_Nm", resultInfo.LINE_NM);
  } else {
    $NC.setValue("#edtQLine_Cd");
    $NC.setValue("#edtQLine_Nm");
    $NC.setFocus("#edtQLine_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 상품그룹 소분류 검색 이미지 클릭
 */
function showItemGroupClassPopup() {
  var LINE_CD = $NC.getValue("#edtQLine_Cd");
  if ($NC.isNull(LINE_CD)) {
    alert("중분류 코드를 먼저 선택하시기 바랍니다.");
    $NC.setFocus("#edtQLine_Cd", true);
    return;
  }

  $NP.showItemGroupClassPopup({
    P_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd"),
    P_DEPART_CD: $NC.getValue("#edtQDepart_Cd"),
    P_LINE_CD: $NC.getValue("#edtQLine_Cd")
  }, onItemGroupClassPopup, function() {
    $NC.setFocus("#edtQClass_Cd", true);
  });
}

/**
 * 상품그룹 소분류 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onItemGroupClassPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQClass_Cd", resultInfo.CLASS_CD);
    $NC.setValue("#edtQClass_Nm", resultInfo.CLASS_NM);
  } else {
    $NC.setValue("#edtQClass_Cd");
    $NC.setValue("#edtQClass_Nm");
    $NC.setFocus("#edtQClass_Cd", true);
  }
  onChangingCondition();
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