/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 탭 초기화
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 그리드 초기화
  grdMasterT1Initialize();
  grdMasterT2Initialize();

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
    }
  });

  // 조회조건 - 사업부 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  // 조회조건 - 검색기간 달력이미지 설정
  $NC.setInitDatePicker("#dtpQEdi_Date1");
  $NC.setInitDatePicker("#dtpQEdi_Date2");

  // 사업부 검색 이미지 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.gridZoneWidth = 250;
  $NC.G_OFFSET.gridBankWidth = 100;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.tabHeaderHeight = $("#divMasterView").children(".ui-tabs-nav:first").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border2; /* 탭일 경우는 좌우 */
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientWidth -= $NC.G_LAYOUT.border1;
  clientHeight -= ($NC.G_OFFSET.tabHeaderHeight + $NC.G_LAYOUT.header + $NC.G_LAYOUT.border1);
  // 수신현황 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterT1", clientWidth, clientHeight);

    // 송신현황 화면
  } else {
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterT2", clientWidth, clientHeight);
  }
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  // 전역 변수 값 초기화
  $NC.clearGridData(G_GRDMASTERT1);
  $NC.clearGridData(G_GRDMASTERT2);

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

  // 사업부 Key 입력
  switch (id) {
  case "BU_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: val
      };
      O_RESULT_DATA = $NP.getUserBuName({
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
  case "EDI_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "EDI_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
  }

  onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

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
  var EDI_DATE1 = $NC.getValue("#dtpQEdi_Date1");
  if ($NC.isNull(EDI_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQEdi_Date1");
    return;
  }
  var EDI_DATE2 = $NC.getValue("#dtpQEdi_Date2");
  if ($NC.isNull(EDI_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQEdi_Date2");
    return;
  }

  // 수신현황 조회
  if ($("#divMasterView").tabs("option", "active") === 0) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERT1);

    // 파라메터 세팅
    G_GRDMASTERT1.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_EDI_DATE1: EDI_DATE1,
      P_EDI_DATE2: EDI_DATE2
    });

    // 데이터 조회
    $NC.serviceCall("/ED05010Q/getDataSet.do", $NC.getGridParams(G_GRDMASTERT1), onGetMasterT1);

    // 송신현황 조회
  } else {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERT2);

    // 파라메터 세팅
    G_GRDMASTERT2.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_EDI_DATE1: EDI_DATE1,
      P_EDI_DATE2: EDI_DATE2
    });

    // 데이터 조회
    $NC.serviceCall("/ED05010Q/getDataSet.do", $NC.getGridParams(G_GRDMASTERT2), onGetMasterT2);
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
}

function grdMasterT1OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "EDI_DIV_F",
    field: "EDI_DIV_F",
    name: "수신구분",
    minWidth: 190,
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "DEFINE_NO_F",
    field: "DEFINE_NO_F",
    name: "수신정의",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "EDI_DATE",
    field: "EDI_DATE",
    name: "수신일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REC_CNT",
    field: "REC_CNT",
    name: "총수신건수",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "EDI_CNT",
    field: "EDI_CNT",
    name: "수신횟수",
    minWidth: 70,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_DIV0_CNT",
    field: "ERROR_DIV0_CNT",
    name: "생성오류건수",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_DIV1_CNT",
    field: "ERROR_DIV1_CNT",
    name: "컬럼값오류건수",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_DIV2_CNT",
    field: "ERROR_DIV2_CNT",
    name: "미처리건수",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_DIV3_CNT",
    field: "ERROR_DIV3_CNT",
    name: "처리오류건수",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_DIV4_CNT",
    field: "ERROR_DIV4_CNT",
    name: "정상처리건수",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 수신현황 탭 그리드 초기값 설정
 */
function grdMasterT1Initialize() {

  var options = {
    frozenColumn: 1,
    summaryRow: {
      visible: true
    },
    specialRow: {
      compareKey: "ERROR_YN",
      compareVal: "Y",
      compareOperator: "==",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterT1", {
    columns: grdMasterT1OnGetColumns(),
    queryId: "ED05010Q.RS_T1_MASTER",
    sortCol: "EDI_DIV_F",
    gridOptions: options
  });
  G_GRDMASTERT1.view.onSelectedRowsChanged.subscribe(grdMasterT1OnAfterScroll);
}

function grdMasterT2OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "EDI_DIV_F",
    field: "EDI_DIV_F",
    name: "송신구분",
    minWidth: 190,
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "DEFINE_NO_F",
    field: "DEFINE_NO_F",
    name: "송신정의",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "EDI_DATE",
    field: "EDI_DATE",
    name: "송신일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REC_CNT",
    field: "REC_CNT",
    name: "총송신건수",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "EDI_CNT",
    field: "EDI_CNT",
    name: "송신횟수",
    minWidth: 70,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_DIV0_CNT",
    field: "ERROR_DIV0_CNT",
    name: "생성오류건수",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_DIV1_CNT",
    field: "ERROR_DIV1_CNT",
    name: "컬럼값오류건수",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_DIV2_CNT",
    field: "ERROR_DIV2_CNT",
    name: "미처리건수",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_DIV3_CNT",
    field: "ERROR_DIV3_CNT",
    name: "처리오류건수",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_DIV4_CNT",
    field: "ERROR_DIV4_CNT",
    name: "정상처리건수",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 송신현황 탭 그리드 초기값 설정
 */
function grdMasterT2Initialize() {

  var options = {
    frozenColumn: 1,
    summaryRow: {
      visible: true
    },
    specialRow: {
      compareKey: "ERROR_YN",
      compareVal: "Y",
      compareOperator: "==",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterT2", {
    columns: grdMasterT2OnGetColumns(),
    queryId: "ED05010Q.RS_T2_MASTER",
    sortCol: "EDI_DIV_F",
    gridOptions: options
  });
  G_GRDMASTERT2.view.onSelectedRowsChanged.subscribe(grdMasterT2OnAfterScroll);
}

/**
 * 수신현황 그리드 행 선택 변경 했을 경우
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
 * 송신현황 그리드 행 선택 변경 했을 경우
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

/**
 * 수신현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT1(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERT1, ajaxData);

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
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 송신현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT2(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERT2, ajaxData);

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
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
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

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
 */
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
