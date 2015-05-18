/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
   $NC.setGlobalVar({ 
     printOptions: [{
       PRINT_INDEX: 0,
       PRINT_COMMENT: "거래명세서 출력"
     }]
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
      $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
    }
  });

  // 조회조건 - 운송사 세팅
  $NC.setValue("#edtQCarrier_Cd");
  $NC.setValue("#edtQCarrier_Nm");

  // 정산월에 달력이미지 설정
  $NC.setInitMonthPicker("#dtpQAdjust_Month", $NC.G_USERINFO.LOGIN_DATE);

  // 사업부 검색 이미지 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);

  $("#btnQBrand_Cd").click(showBuBrandPopup);
  // 운송사 검색 이미지 클릭
  $("#btnQCarrier").click(showCarrierPopup);
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
  // 운송사 값 변경시 마스터체크
  case "CARRIER_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CARRIER_CD: val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getCarrierInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onCarrierPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showCarrierPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onCarrierPopup, onCarrierPopup);
    }
    return;
  case "ADJUST_MONTH":
    $NC.setValueMonthPicker(view, val, "정산월을 정확히 입력하십시오.");
    break;
  }

  // 화면클리어
  onChangingCondition();
}

function onChangingCondition() {

  // 전역 변수 값 초기화
  $NC.clearGridData(G_GRDMASTER);


  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "1";

  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 조회조건 체크
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd", true);
  var ADJUST_MONTH = $NC.getValue("#dtpQAdjust_Month");
  if ($NC.isNull(ADJUST_MONTH)) {
    alert("정산월을 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Month");
    return;
  };

  var BRAND_CD = $NC.getValue("#edtQBrand_Cd");

 
  
  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_ADJUST_MONTH :ADJUST_MONTH
  });

  // 데이터 조회
  $NC.serviceCall("/LF06040Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
  

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

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  
  var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd", true);
  
  var ADJUST_MONTH = $NC.getValue("#dtpQAdjust_Month");
  if ($NC.isNull(ADJUST_MONTH)) {
    alert("정산월을 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Month");
    return;
  }
  
  var printOptions = {};
  if (printIndex == 0) {
    printOptions = {
      reportDoc: "lf/RECEIPT_LF04",
      queryId: "WR.RS_RECEIPT_LF04",
      queryParams: {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_CARRIER_CD: CARRIER_CD,
        P_ADJUST_MONTH: ADJUST_MONTH
      }
    };
  } 

  $NC.G_MAIN.showPrintPreview(printOptions);
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "업체명",
    minWidth: 80,
    cssClass: "align-center",
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 80,
    cssClass: "align-center",
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 120,
    cssClass: "align-center",
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "QTY1",
    field: "QTY1",
    name: "건",
    minWidth: 50,
    cssClass: "align-right",
    band: 1
  });
  $NC.setGridColumn(columns, {
    id: "AMT1",
    field: "AMT1",
    name: "(건*2,500)",
    minWidth: 100,
    cssClass: "align-right",
    band: 1
  });
  $NC.setGridColumn(columns, {
    id: "QTY2",
    field: "QTY2",
    name: "건",
    minWidth: 50,
    cssClass: "align-right",
    band: 2
  });
  $NC.setGridColumn(columns, {
    id: "AMT2",
    field: "AMT2",
    name: "(건*2,500)",
    minWidth: 100,
    cssClass: "align-right",
    band: 2
  });
  $NC.setGridColumn(columns, {
    id: "QTY3",
    field: "QTY3",
    name: "건",
    minWidth: 50,
    cssClass: "align-right",
    band: 3
  });
  $NC.setGridColumn(columns, {
    id: "AMT3",
    field: "AMT3",
    name: "(건*2,500)",
    minWidth: 100,
    cssClass: "align-right",
    band: 3
  });
  $NC.setGridColumn(columns, {
    id: "BOX_QTY1",
    field: "BOX_QTY1",
    name: "3.5호",
    minWidth: 50,
    cssClass: "align-right",
    band: 4
  });
  $NC.setGridColumn(columns, {
    id: "BOX_AMT1",
    field: "BOX_AMT1",
    name: "건수*120",
    minWidth: 100,
    cssClass: "align-right",
    band: 4
  });
  $NC.setGridColumn(columns, {
    id: "BOX_QTY2",
    field: "BOX_QTY2",
    name: "4호",
    cssClass: "align-right",
    minWidth: 50,
    band: 4
  });  
  $NC.setGridColumn(columns, {
    id: "BOX_AMT2",
    field: "BOX_AMT2",
    name: "건수*200",
    cssClass: "align-right",
    minWidth: 100,
    band: 4
  });  
  $NC.setGridColumn(columns, {
    id: "BOX_QTY3",
    field: "BOX_QTY3",
    name: "5호",
    cssClass: "align-right",
    minWidth: 50,
    band: 4
  });
  $NC.setGridColumn(columns, {
    id: "BOX_AMT3",
    field: "BOX_AMT3",
    name: "건수*280",
    cssClass: "align-right",
    minWidth: 100,
    band: 4
  });
  $NC.setGridColumn(columns, {
    id: "BOX_QTY4",
    field: "BOX_QTY4",
    name: "6호",
    cssClass: "align-right",
    minWidth: 50,
    band: 4
  });
  $NC.setGridColumn(columns, {
    id: "BOX_AMT4",
    field: "BOX_AMT4",
    name: "건수*300",
    cssClass: "align-right",
    minWidth: 100,
    band: 4
  });

  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "A+B+C+D+E",
    cssClass: "align-right",
    minWidth: 120,
    band: 5
  });



  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 지급수수료 합계내역
 */
function grdMasterInitialize() {

  var options = {
    frozenColumn: 2,
    summaryRow: {
      visible: true
    },
    showBandRow: true,
    bands: ["기본정보", "주문 택배발송(A)", "반품 (B)", "C.S 재출고(C)", "자재비", "딜별 총 청구금액"],
    
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LF06040Q.RS_MASTER",
    sortCol: "CARRIER_CD",
    gridOptions: options
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

/**
 * 지급수수료 합계내역 조회
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
  $NC.G_VAR.buttons._print = "1";

  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
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

function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 운송사 검색 이미지 클릭
 */
function showCarrierPopup() {

  $NP.showCarrierPopup({
    queryParams: {
      P_CARRIER_CD: "%",
      P_VIEW_DIV: "2"
    }
  }, onCarrierPopup, function() {
    $NC.setFocus("#edtQCarrier_Cd", true);
  });
}

function onCarrierPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQCarrier_Cd", resultInfo.CARRIER_CD);
    $NC.setValue("#edtQCarrier_Nm", resultInfo.CARRIER_NM);
  } else {
    $NC.setValue("#edtQCarrier_Cd");
    $NC.setValue("#edtQCarrier_Nm");
    $NC.setFocus("#edtQCarrier_Cd", true);
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