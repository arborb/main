/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    printOptions: [{
      PRINT_INDEX: 0,
      PRINT_COMMENT: "청구거래명세서 출력"
    }, {
      PRINT_INDEX: 1,
      PRINT_COMMENT: "위탁청구내역서 출력"
    }, {
      PRINT_INDEX: 2,
      PRINT_COMMENT: "배송청구내역서 출력"
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
      $("#cboQCenter_Cd").val($NC.G_USERINFO.CENTER_CD);
    }
  });

  // 조회조건 - 사업부 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  // 정산월에 달력이미지 설정
  $NC.setInitMonthPicker("#dtpQAdjust_Month", $NC.G_USERINFO.LOGIN_DATE);

  // 사업부 검색 이미지 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);

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
  $NC.setInitTopButtons($NC.G_VAR.buttons);
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
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  if ($NC.isNull(BU_NM)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var ADJUST_MONTH = $NC.getValue("#dtpQAdjust_Month");
  if ($NC.isNull(ADJUST_MONTH)) {
    alert("정산월을 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Month");
    return;
  }

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_ADJUST_MONTH: ADJUST_MONTH
  });

  // 데이터 조회
  $NC.serviceCall("/LF06010Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

  // 조회조건 체크
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  if ($NC.isNull(BU_NM)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var ADJUST_MONTH = $NC.getValue("#dtpQAdjust_Month");
  if ($NC.isNull(ADJUST_MONTH)) {
    alert("정산월을 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Month");
    return;
  }

  var printOptions = {};
  if (printIndex == 0) {
    printOptions = {
      reportDoc: "lf/RECEIPT_LF01",
      queryId: "WR.RS_RECEIPT_LF01",
      queryParams: {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_ADJUST_MONTH: ADJUST_MONTH
      }
    };
  } else if (printIndex == 1) {
    printOptions = {
      reportDoc: "lf/RECEIPT_LF02",
      queryId: "WR.RS_RECEIPT_LF02",
      queryParams: {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_ADJUST_MONTH: ADJUST_MONTH
      }
    };
  } else if (printIndex == 2) {
    printOptions = {
      reportDoc: "lf/RECEIPT_LF03",
      queryId: "WR.RS_RECEIPT_LF03",
      queryParams: {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_ADJUST_MONTH: ADJUST_MONTH
      }
    };
  }

  $NC.G_MAIN.showPrintPreview(printOptions);
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "FEE_HEAD_CD_F",
    field: "FEE_HEAD_CD_F",
    name: "정산항목",
    minWidth: 110,
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "FEE_BASE_CD_F",
    field: "FEE_BASE_CD_F",
    name: "정산세부항목",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "PERIOD_DIV_F",
    field: "PERIOD_DIV_F",
    name: "정산기간",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "FEE_AMT",
    field: "FEE_AMT",
    name: "청구정산금액",
    cssClass: "align-right",
    minWidth: 90,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_FEE_AMT",
    field: "ADJUST_FEE_AMT",
    name: "최종청구정산금액",
    cssClass: "align-right",
    minWidth: 90,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_COMMENT",
    field: "ADJUST_COMMENT",
    name: "조정사유내역",
    minWidth: 120
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 청구수수료 합계내역
 */
function grdMasterInitialize() {

  var options = {
    frozenColumn: 1,
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LF06010Q.RS_MASTER",
    sortCol: "FEE_HEAD_CD_F",
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
 * 청구수수료 합계내역 조회
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "1";

  if (G_GRDMASTER.data.getLength() > 0) {

    $NC.setGridSelectRow(G_GRDMASTER, 0);
    // 프린트버튼 활성화
    $NC.G_VAR.buttons._print = "1";
    $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);

  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

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