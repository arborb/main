/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetail1Initialize();
  grdDetail2Initialize();

  // 조회조건 - 사업부 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  // 수신일자에 달력이미지 설정
  $NC.setInitDatePicker("#dtpQRecv_Date1");
  $NC.setInitDatePicker("#dtpQRecv_Date2");

  // 조회조건 - 수신정의 세팅
  onGetDefineNo();

  // 조회조건에 오류수신내역 선택
  $NC.setValue("#rgbQView_Div1", "1");

  // 사업부 검색 이미지 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);

  $("#btnRecv").click(onBtnRecvClick);
  $("#btnErrorProcess").click(onBtnErrorProcAndColseClick);
  $("#btnClose").click(onBtnErrorProcAndColseClick);

}

function _OnLoaded() {

  // 스플리터 초기화
  $NC.setInitSplitter("#divMasterView", "h", 200);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_LAYOUT.gridDetail2Width = 400;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $("#divTopView").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  var container = $("#divMasterView");
  $NC.resizeContainer(container, clientWidth, clientHeight);

  var splitTopAreaHeight = $("#grdMaster").parent().height();
  var height = splitTopAreaHeight - $NC.G_LAYOUT.header;

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, height);

  var splitBottomAreaHeight = $("#grdDetail1").parent().parent().height() - 1;
  var width = clientWidth - $NC.G_OFFSET.gridDetail2Width - $NC.G_LAYOUT.border1 - 5;

  $NC.resizeContainer("#divDetail1", width, splitBottomAreaHeight);
  $NC.resizeContainer("#divDetail2", $NC.G_OFFSET.gridDetail2Width, splitBottomAreaHeight);

  height = splitBottomAreaHeight - $NC.G_LAYOUT.header;

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail1", width, height);
  $NC.resizeGrid("#grdDetail2", $NC.G_OFFSET.gridDetail2Width, height);
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
  case "RECV_DATE1":
    $NC.setValueDatePicker(view, val, "수신 시작일자를 정확히 입력하십시오.");
    break;
  case "RECV_DATE2":
    $NC.setValueDatePicker(view, val, "수신 종료일자를 정확히 입력하십시오.");
    break;
  }
  // 화면클리어
  onChangingCondition();
}

function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDDETAIL2);
  $NC.clearGridData(G_GRDDETAIL1);
  $NC.clearGridData(G_GRDMASTER);

  // 오류내역 그리드 초기화
  $NC.G_OFFSET.gridDetail2Width = 400;
  $("#divDetail2").show();
  _OnResize($(window));

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
  $NC.setInitGridVar(G_GRDDETAIL2);
  $NC.setInitGridVar(G_GRDDETAIL1);
  $NC.setInitGridVar(G_GRDMASTER);

  // 조회조건 체크
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  if ($NC.isNull(BU_NM)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var DEFINE_NO = $NC.getValueCombo("#cboQDefine_No");
  if ($NC.isNull(DEFINE_NO)) {
    alert("수신정의를 선택하십시오.");
    $NC.setFocus("#cboQDefine_No");
    return;
  }
  var RECV_DATE1 = $NC.getValue("#dtpQRecv_Date1");
  if ($NC.isNull(RECV_DATE1)) {
    alert("수신 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQRecv_Date1");
    return;
  }
  var RECV_DATE2 = $NC.getValue("#dtpQRecv_Date2");
  if ($NC.isNull(RECV_DATE2)) {
    alert("수신 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQRecv_Date2");
    return;
  }
  var VIEW_DIV = $NC.getValueRadioGroup("VIEW_DIV");

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_BU_CD: BU_CD,
    P_DEFINE_NO: DEFINE_NO,
    P_RECV_DATE1: RECV_DATE1,
    P_RECV_DATE2: RECV_DATE2,
    P_VIEW_DIV: VIEW_DIV
  });

  // 데이터 조회
  $NC.serviceCall("/ED03110E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
    id: "RECV_DATE",
    field: "RECV_DATE",
    name: "수신일자",
    cssClass: "align-center",
    minWidth: 90,
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "RECV_NO",
    field: "RECV_NO",
    name: "수신번호",
    cssClass: "align-center",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CLOSING_YN",
    field: "CLOSING_YN",
    name: "처리완료여부",
    cssClass: "align-center",
    minWidth: 90,
    maxWidth: 90,
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "RECV_CNT",
    field: "RECV_CNT",
    name: "총수신건수",
    cssClass: "align-right",
    minWidth: 90,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "RECV_CNT0",
    field: "RECV_CNT0",
    name: "생성오류건수",
    cssClass: "align-right",
    minWidth: 90,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "RECV_CNT1",
    field: "RECV_CNT1",
    name: "컬럼값오류건수",
    cssClass: "align-right",
    minWidth: 90,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "RECV_CNT2",
    field: "RECV_CNT2",
    name: "미처리건수",
    cssClass: "align-right",
    minWidth: 90,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "RECV_CNT3",
    field: "RECV_CNT3",
    name: "처리오류건수",
    cssClass: "align-right",
    minWidth: 90,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "RECV_CNT4",
    field: "RECV_CNT4",
    name: "정상처리건수",
    cssClass: "align-right",
    minWidth: 90,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "RECV_CNT9",
    field: "RECV_CNT9",
    name: "종결처리건수",
    cssClass: "align-right",
    minWidth: 90,
    aggregator: "SUM"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 수신처리 내역
 */
function grdMasterInitialize() {

  var options = {
    summaryRow: {
      visible: true
    },
    specialRow: {
      compareKey: "CLOSING_YN",
      compareVal: "N",
      compareOperator: "==",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "ED03110E.RS_MASTER",
    sortCol: "RECV_DATE",
    gridOptions: options
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

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

  var rowData = G_GRDMASTER.data.getItem(row);
  var VIEW_DIV = $NC.getValueRadioGroup("VIEW_DIV");
  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL2);
  $NC.setInitGridVar(G_GRDDETAIL1);
  // 파라메터 세팅
  G_GRDDETAIL1.queryParams = $NC.getParams({
    P_BU_CD: rowData.BU_CD,
    P_DEFINE_NO: rowData.DEFINE_NO,
    P_RECV_DATE: rowData.RECV_DATE,
    P_RECV_NO: rowData.RECV_NO,
    P_VIEW_DIV: VIEW_DIV
  });
  // 데이터 조회
  $NC.serviceCall("/ED03110E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL1), onGetDetail1);

  if (rowData.CLOSING_YN === "Y") {
    $NC.G_OFFSET.gridDetail2Width = -$NC.G_LAYOUT.border1 - 5;
    $("#divDetail2").hide();

  } else {
    $NC.G_OFFSET.gridDetail2Width = 400;
    $("#divDetail2").show();
  }
  _OnResize($(window));
}

function grdDetail1OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "RECV_SEQ",
    field: "RECV_SEQ",
    name: "순번",
    cssClass: "align-right",
    width: 60,
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "RECV_USER_ID",
    field: "RECV_USER_ID",
    name: "수신자ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "RECV_DATETIME",
    field: "RECV_DATETIME",
    name: "수신일시",
    cssClass: "align-center",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_DIV",
    field: "ERROR_DIV",
    name: "오류구분",
    cssClass: "align-center",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DATA_DIV",
    field: "DATA_DIV",
    name: "수신처리구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "CUST_CD",
    field: "CUST_CD",
    name: "위탁사코드",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 100,
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "COMPANY_ID",
    field: "DEAL_ID",
    name: "업체고유번호",
    minWidth: 120,
  });
  $NC.setGridColumn(columns, {
    id: "SALE_TYPE",
    field: "SALE_TYPE",
    name: "판매유형",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "PRICE",
    field: "PRICE",
    name: "판매가격",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_PRICE_TYPE",
    field: "SHIP_PRICE_TYPE",
    name: "배송비타입",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "PRICE_SHIP",
    field: "PRICE_SHIP",
    name: "배송비",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "QTY_SHIP_LIMIT",
    field: "QTY_SHIP_LIMIT",
    name: "박스맥스수량",
    minWidth: 100,
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
    id: "OPEN_DATE",
    field: "OPEN_DATE",
    name: "거래시작일자",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CLOSE_DATE",
    field: "CLOSE_DATE",
    name: "거래종료일자",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REG_TIME",
    field: "REG_TIME",
    name: "등록일시",
    minWidth: 160,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "COURIER_COMPANY",
    field: "COURIER_COMPANY",
    name: "배송회사",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_FLAG",
    field: "OPTION_FLAG",
    name: "옵션유무",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "EVENT_FLAG",
    field: "EVENT_FLAG",
    name: "이벤트유무",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_MEMO",
    field: "SHIP_MEMO",
    name: "배송메모",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BUNDLE_SHIP_FLAG",
    field: "BUNDLE_SHIP_FLAG",
    name: "묶음배송여부",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "APPROVAL_STATUS",
    field: "APPROVAL_STATUS",
    name: "심사상태",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "UPDATE_TIME",
    field: "UPDATE_TIME",
    name: "등록시간",
    minWidth: 160,
    cssClass: "align-center"
  });
  /*
  $NC.setGridColumn(columns, {
    id: "MD_EVENT_FLAG",
    field: "MD_EVENT_FLAG",
    name: "이벤트유무",   // 컬럼명이 없음
    minWidth: 90,
    cssClass: "align-center"
  });
   */
  $NC.setGridColumn(columns, {
    id: "DEAL_GROUP_ID",
    field: "DEAL_GROUP_ID",
    name: "상품군(카데고리)ID",
    minWidth: 120,
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_TYPE",
    field: "SHIP_TYPE",
    name: "배송타입",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "QUICK_SHIP_TIME",
    field: "QUICK_SHIP_TIME",
    name: "빠른배송마감시간",
    minWidth: 160,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CIRCULATION_ID",
    field: "CIRCULATION_ID",
    name: "담당물류센터",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REFUND_PRICE_TYPE",
    field: "REFUND_PRICE_TYPE",
    name: "반품배송비타입",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REFUND_PRICE_SHIP",
    field: "REFUND_PRICE_SHIP",
    name: "반품배송비",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "EXCHANGE_PRICE_TYPE",
    field: "EXCHANGE_PRICE_TYPE",
    name: "교환배송비타입",
    minWidth: 120,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "EXCHANGE_PRICE_SHIP",
    field: "EXCHANGE_PRICE_SHIP",
    name: "교환배송비",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_CD",
    field: "OPTION_CD",
    name: "옵션코드",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_KIND",
    field: "OPTION_KIND",
    name: "옵션종류",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션내용",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_CNT",
    field: "OPTION_CNT",
    name: "옵션수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_PRICE_SALE",
    field: "OPTION_PRICE_SALE",
    name: "옵션판매가격",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MD_NAME",
    field: "MD_NAME",
    name: "담당MD",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "MD_MOBILE",
    field: "MD_MOBILE",
    name: "담당MD연락처",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SETTLEMENT_TIME",
    field: "SETTLEMENT_TIME",
    name: "3차정산일",
    minWidth: 160,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 수신내역
 */
function grdDetail1Initialize() {

  var options = {
    frozenColumn: 2,
    specialRow: {
      compareKey: "ERROR_DIV",
      compareVal: "4",
      compareOperator: "!==",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail1", {
    columns: grdDetail1OnGetColumns(),
    queryId: "ED03110E.RS_DETAIL",
    sortCol: "RECV_SEQ",
    gridOptions: options
  });
  G_GRDDETAIL1.view.onSelectedRowsChanged.subscribe(grdDetail1OnAfterScroll);

}

function grdDetail1OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL1.lastRow != null) {
    if (row == G_GRDDETAIL1.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail1", row + 1);

  var rowData = G_GRDDETAIL1.data.getItem(row);
  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL2);
  // 파라메터 세팅
  G_GRDDETAIL2.queryParams = $NC.getParams({
    P_BU_CD: rowData.BU_CD,
    P_EDI_DIV: rowData.EDI_DIV,
    P_DEFINE_NO: rowData.DEFINE_NO,
    P_RECV_DATE: rowData.RECV_DATE,
    P_RECV_NO: rowData.RECV_NO,
    P_RECV_SEQ: rowData.RECV_SEQ
  });
  // 데이터 조회
  $NC.serviceCall("/ED03110E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL2), onGetDetail2);
}

function grdDetail2OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ERROR_CD",
    field: "ERROR_CD",
    name: "오류코드",
    sortable: false,
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_NM",
    field: "ERROR_NM",
    name: "오류명",
    sortable: false,
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    sortable: false,
    minWidth: 160
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 오류내역
 */
function grdDetail2Initialize() {

  var options = {};

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail2", {
    columns: grdDetail2OnGetColumns(),
    queryId: "ED03110E.RS_SUB",
    sortCol: "ERROR_CD",
    gridOptions: options
  });
  G_GRDDETAIL2.view.onSelectedRowsChanged.subscribe(grdDetail2OnAfterScroll);
}

function grdDetail2OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL2.lastRow != null) {
    if (row == G_GRDDETAIL2.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail2", row + 1);
}

/**
 * 수신처리 내역
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["RECV_DATE", "RECV_NO"],
        selectVal: G_GRDMASTER.lastKeyVal,
        activeCell: true
      });
    }
  } else {
    $NC.clearGridData(G_GRDDETAIL2);
    $NC.clearGridData(G_GRDDETAIL1);
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
}

/**
 * 수신내역
 */
function onGetDetail1(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL1, ajaxData);

  if (G_GRDDETAIL1.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAIL1, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetail1", 0, 0);
  }
}

/**
 * 오류내역
 */
function onGetDetail2(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL2, ajaxData);

  if (G_GRDDETAIL2.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAIL2, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetail2", 0, 0);
  }
}

function onGetRecvProc(ajaxData) {

  _Inquiry();
}
/**
 * 오류내역처리버튼 처리내역
 */
function onGetRecvError(ajaxData) {

  var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  _Inquiry();
  G_GRDMASTER.lastKeyVal = [lastRowData.RECV_DATE, lastRowData.RECV_NO];

}

/**
 * 종결처리버튼 처리내역
 */
function onGetRecvClose(ajaxData) {

  var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  _Inquiry();
  G_GRDMASTER.lastKeyVal = [lastRowData.RECV_DATE, lastRowData.RECV_NO];
  alert("정상적으로 종결처리 되었습니다");

}

/**
 * 수신 처리 실패 했을 경우 처리
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
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
  // 조회조건 - 수신정의 세팅
  onGetDefineNo();
}

function onSuccessForJar(ajaxData) {

  alert("수신처리가 완료되었습니다.");
}

function onBtnRecvClick(e) {

  var DATA_DIV = $NC.getValue("#cboQDefine_No");

  if (DATA_DIV == "06") {
    $NC.serviceCall("/ED03110E/recvSocket.do", {
      P_QUERY_ID: "",
      P_QUERY_PARAMS: ""
    }, onSuccessForJar);
  } else {
    // 저장권한
    if (!$NC.getProgramPermission().canSave) {
      alert("해당 프로그램의 저장권한이 없습니다.");
      return;
    }

    var BU_CD = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(BU_CD)) {
      alert("사업부를 입력하십시오.");
      return;
    }
    var DATA_DIV = $NC.getValue("#cboQDefine_No");
    if ($NC.isNull(DATA_DIV)) {
      alert("수신정의를 먼저 선택하십시오.");
      return;
    }
    var DEFINE_NO = $NC.getValueCombo("#cboQDefine_No");

    // DBLink 가 아니면 파일 선택

    if (DATA_DIV !== "01") {
      $NC.G_MAIN.uploadFileSelect(function(view, fileName) {

        var fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
        if (DATA_DIV === "02") {
          if (fileExt !== "xlsx" && fileExt !== "xls") {
            alert("엑셀 파일(*.xls, *.xlsx) 파일을 선택하십시오.");
            return;
          }
        } else if (DATA_DIV === "04") {
          if (fileExt != "xml") {
            alert("XML 파일(*.xml) 파일을 선택하십시오.");
            return;
          }
        } else {
          if (fileExt != "txt") {
            alert("텍스트 파일(*.txt) 파일을 선택하십시오.");
            return;
          }
        }

        $NC.G_MAIN.fileUpload("/ED03110E/recvFile.do", {
          P_QUERY_ID: "ER_PROCESSING",
          P_QUERY_PARAMS: $NC.getParams({
            P_BU_CD: BU_CD,
            P_EDI_DIV: "RCM70",
            P_DEFINE_NO: DEFINE_NO,
            P_RECV_DATE: null,
            P_RECV_NO: null,
            P_PROCESS_CD: "A",
            P_DATA_DIV: DATA_DIV,
            P_USER_ID: $NC.G_USERINFO.USER_ID
          })
        }, function(ajaxData) {
          var resultData = null;
          try {
            resultData = $NC.toArray(ajaxData);
          } catch (e) {
            alert(ajaxData);
            return;
          }
          if (!$NC.isNull(resultData.RESULT_CD)) {
            if (resultData.RESULT_CD != "0") {
              $NC.onError(ajaxData);
            } else {
              onGetRecvProc();
            }
          } else {
            if (resultData.O_MSG && resultData.O_MSG !== "OK") {
              alert(resultData.O_MSG);
            }
            onGetRecvProc();
          }
        });
      });
    } else {
      $NC.serviceCall("/ED03110E/recvDBLink.do", {
        P_QUERY_ID: "ER_PROCESSING",
        P_QUERY_PARAMS: $NC.getParams({
          P_BU_CD: BU_CD,
          P_EDI_DIV: "RCM70",
          P_DEFINE_NO: DEFINE_NO,
          P_RECV_DATE: null,
          P_RECV_NO: null,
          P_PROCESS_CD: "A",
          P_DATA_DIV: DATA_DIV,
          P_USER_ID: $NC.G_USERINFO.USER_ID
        })
      }, onGetRecvProc);
    }
  }
}

function onBtnErrorProcAndColseClick(e) {

  // 저장권한
  if (!$NC.getProgramPermission().canSave) {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  if (G_GRDMASTER.data.getLength() === 0) {
    alert("처리할 대상을 선택하십시오.");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (Number(rowData.RECV_CNT0) + Number(rowData.RECV_CNT1) + Number(rowData.RECV_CNT2) + Number(rowData.RECV_CNT3) == 0) {
    alert("정상 수신 데이터입니다. 오류 데이터를 선택하십시오.");
    return;
  }

  var PROCESS_CD;
  var onSuccess;
  if (e.target.id === "btnErrorProcess") {
    // 오류내역처리
    PROCESS_CD = "B";
    onSuccess = onGetRecvError;
  } else {
    // 종결처리
    PROCESS_CD = "D";
    onSuccess = onGetRecvClose;
  }

  // ER_PROCESSING 호출
  $NC.serviceCall("/ED03110E/callERProcessing.do", {
    P_QUERY_ID: "ER_PROCESSING",
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: rowData.BU_CD,
      P_EDI_DIV: rowData.EDI_DIV,
      P_DEFINE_NO: rowData.DEFINE_NO,
      P_RECV_DATE: rowData.RECV_DATE,
      P_RECV_NO: rowData.RECV_NO,
      P_PROCESS_CD: PROCESS_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onSuccess, onSaveError);
}

/**
 * 조회조건 - 수신정의 세팅
 */
function onGetDefineNo() {

  $NC.setInitCombo("/ED03110E/getDataSet.do", {
    P_QUERY_ID: "ED03110E.RS_SUB1",
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: $("#edtQBu_Cd").val()
    })
  }, {
    selector: "#cboQDefine_No",
    codeField: "DATA_DIV",
    dataCodeField: "DEFINE_NO",
    fullNameField: "DEFINE_NO_F",
    onComplete: function() {
      $NC.setValue("#cboQDefine_No", 0);
    }
  });
}