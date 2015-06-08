/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });
  // 그리드 초기화
  grdMasterInitialize();

  // 정산월에 달력이미지 설정
  $NC.setInitMonthPicker("#dtpQAdjust_Month", $NC.G_USERINFO.LOGIN_DATE);

  // 사업부 버튼 설정
  $("#btnQBu_Cd").click(showUserBuPopup);

  // 운송사 버튼 설정
  $("#btnQCarrier_Cd").click(showCarrierPopup);



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

  // 사업부 값 변경시 마스터체크
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
  case "FEE_HEAD_CD":
    if (!$NC.isNull(val)) {
      onGetFeeBaseCd();
    }
    break;
  case "CARRIER_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CARRIER_CD: val,
        P_VIEW_DIV: "1"
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
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd", true);
  var ADJUST_MONTH = $NC.getValue("#dtpQAdjust_Month");
  if ($NC.isNull(ADJUST_MONTH)) {
    alert("정산월을 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Month");
    return;
  }

  var ADJUST_MONTH1 = ADJUST_MONTH.replace(/\-/g, '');
  
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업구분를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_BU_CD: BU_CD,
    P_ADJUST_MONTH: ADJUST_MONTH1,
    P_CARRIER_CD: CARRIER_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LF06080Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

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
  var ADJUST_MONTH = $NC.getValue("#dtpQAdjust_Month");
  if ($NC.isNull(ADJUST_MONTH)) {
    alert("정산월을 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Month");
    return;
  }
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CARRIER_CD",
    field: "CARRIER_CD",
    name: "운송사코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CODE_NM",
    field: "CODE_NM",
    name: "운송사명",
    minWidth: 120
  });

  $NC.setGridColumn(columns, {
    id: "DELIVERY_DATE",
    field: "DELIVERY_DATE",
    name: "집하일자",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "WB_NO",
    field: "WB_NO",
    name: "운송장번호",
    minWidth: 100
  });

  $NC.setGridColumn(columns, {
    id: "GUBN",
    field: "GUBN",
    name: "예약구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SENDER_NM",
    field: "SENDER_NM",
    name: "보내는분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SENDER_ADDR",
    field: "SENDER_ADDR",
    name: "보내는분주소",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "받는분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR",
    field: "SHIPPER_ADDR",
    name: "받는분주소",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "FEE_QTY",
    field: "FEE_QTY",
    name: "수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "FEE_AMT",
    field: "FEE_AMT",
    name: "기본운임",
    minWidth: 80,
    cssClass: "align-right",
    
  });
  $NC.setGridColumn(columns, {
    id: "ETC_AMT1",
    field: "ETC_AMT1",
    name: "도선운임",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ETC_AMT2",
    field: "ETC_AMT2",
    name: "제주운임",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ETC_AMT3",
    field: "ETC_AMT3",
    name: "기타운임",
    minWidth: 80,
    cssClass: "align-right"
  });
  
  $NC.setGridColumn(columns, {
    id: "FEE_AMT",
    field: "FEE_AMT",
    name: "총운임",
    minWidth: 80
  });
 

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 위탁수수료 상세내역
 */
function grdMasterInitialize() {

  var options = {
    frozenColumn: 3,
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LF06080Q.RS_MASTER",
    sortCol: "ADJUST_DATE",
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
 * 위탁수수료 상세내역 조회
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
    setFocusScan();
  });

}

/**
 * 사업구분 검색 결과
 * 
 * @param seletedRowData
 */
function onUserBuPopup(seletedRowData) {

  if (!$NC.isNull(seletedRowData)) {
    $NC.setValue("#edtQBu_Cd", seletedRowData.BU_CD);
    $NC.setValue("#edtQBu_Nm", seletedRowData.BU_NM);
    $NC.setValue("#edtQCust_Cd", seletedRowData.CUST_CD);
    setFocusScan();
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }

  onChangingCondition();
  setPolicyValInfo();
}

/**
 * 조회조건 - 정산세부 세팅
 */
function onGetFeeBaseCd() {

  $NC.setInitCombo("/LF06080Q/getDataSet.do", {
    P_QUERY_ID: "LF06080Q.RS_SUB2",
    P_QUERY_PARAMS: $NC.getParams({
      P_FEE_HEAD_CD: $NC.getValue("#cboQFee_Head_Cd")
    })
  }, {
    selector: "#cboQFee_Base_Cd",
    codeField: "FEE_BASE_CD",
    nameField: "FEE_BASE_NM",
    fullNameField: "FEE_BASE_CD_F",
    addAll: true
  });
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
