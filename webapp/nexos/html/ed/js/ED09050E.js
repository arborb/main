/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    nonSendCnt: 0
  });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();

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

  // 송신일자에 달력이미지 설정
  $NC.setInitDatePicker("#dtpQSend_Date");
  $NC.setInitDatePicker("#dtpOutbound_Date");

  // 조회조건 - 송신정의 세팅
  onGetDefineNo();

  // 사업부 검색 이미지 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnSend").click(onBtnSendClick);

  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();
}

function _OnLoaded() {

  // 스플리터 초기화
  $NC.setInitSplitter("#divMasterView", "h", 200);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

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

  var splitBottomAreaHeight = $("#grdDetail").parent().parent().height() - 1;
  var width = clientWidth - $NC.G_OFFSET.gridDetail2Width - $NC.G_LAYOUT.border1 - 5;

  $NC.resizeContainer("#divDetail", width, splitBottomAreaHeight);

  height = splitBottomAreaHeight - $NC.G_LAYOUT.header;

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", width, height);
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
  case "OUTBOUND_DATE1":
    $NC.setValueDatePicker(view, val, "출고 시작일자를 정확히 입력하십시오.");
    break;
  case "OUTBOUND_DATE2":
    $NC.setValueDatePicker(view, val, "출고 종료일자를 정확히 입력하십시오.");
    break;
  }

  // 화면클리어
  onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

  var id = view.prop("id").substr(3).toUpperCase();
  switch (id) {
  }
}

function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDDETAIL);
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
  $NC.setInitGridVar(G_GRDDETAIL);
  $NC.setInitGridVar(G_GRDMASTER);

  var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm", true);
  var SHIPPER_NM = $NC.getValue("#edtQShipper_Nm", true);

  // 조회조건 체크
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var OUTBOUND_DATE = $NC.getValue("#dtpOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("송신 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpOutbound_Date");
    return;
  }
  var SEND_DATE = $NC.getValue("#dtpQSend_Date");
  if ($NC.isNull(SEND_DATE)) {
    alert("송신 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQSend_Date");
    return;
  }
  // 데이터 조회 - 미송신건수
  $NC.serviceCall("/ED09050E/getDataSet.do", {
    P_QUERY_ID: "ED09050E.RS_SUB1",
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: BU_CD,
    })
  });
  var DEFINE_NO = $NC.getValueCombo("#cboQDefine_No");
  if ($NC.isNull(DEFINE_NO)) {
    alert("송신정의를 선택하십시오.");
    $NC.setFocus("#cboQDefine_No");
    return;
  }
  var BU_NO = $NC.getValue("#edtQBu_No", true);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_DEFINE_NO: DEFINE_NO,
    P_SEND_DATE: SEND_DATE,
    P_OUTBOUND_DATE: OUTBOUND_DATE,
    P_BU_NO: BU_NO,
    P_ORDERER_NM: ORDERER_NM,
    P_SHIPPER_NM: SHIPPER_NM,
  });

  // 데이터 조회
  $NC.serviceCall("/ED09050E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
    id: "SEND_DATE",
    field: "SEND_DATE",
    name: "송신일자",
    cssClass: "align-center",
    minWidth: 90,
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "SEND_NO",
    field: "SEND_NO",
    name: "송신번호",
    cssClass: "align-center",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SEND_DATETIME",
    field: "SEND_DATETIME",
    name: "송신일시",
    cssClass: "align-center",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "FILE_NM",
    field: "FILE_NM",
    name: "파일명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "CENTER_CD",
    field: "CENTER_CD",
    name: "물류센터코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    cssClass: "align-center",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "브랜드코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "배송처코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_CD",
    field: "RDELIVERY_CD",
    name: "실배송처코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_CD",
    field: "ORDERER_CD",
    name: "주문자코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_TEL",
    field: "ORDERER_TEL",
    name: "주문자전화번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_HP",
    field: "ORDERER_HP",
    name: "주문자휴대폰",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_EMAIL",
    field: "ORDERER_EMAIL",
    name: "주문자메일",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_MSG",
    field: "ORDERER_MSG",
    name: "배송요청사항",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_TEL",
    field: "SHIPPER_TEL",
    name: "수령자전화번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_HP",
    field: "SHIPPER_HP",
    name: "수령자휴대폰",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ZIP_CD",
    field: "SHIPPER_ZIP_CD",
    name: "수령자우편번호",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_BASIC",
    field: "SHIPPER_ADDR_BASIC",
    name: "수령자기본주소",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_DETAIL",
    field: "SHIPPER_ADDR_DETAIL",
    name: "수령자상세주소",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "GIFT_WRAP_YN",
    field: "GIFT_WRAP_YN",
    name: "선물포장여부",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CARD_MSG",
    field: "CARD_MSG",
    name: "카드메시지",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "CARD_FROM",
    field: "CARD_FROM",
    name: "카드보내는분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CARD_TO",
    field: "CARD_TO",
    name: "카드받는분",
    minWidth: 100
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 송신처리 내역
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
    queryId: "ED09050E.RS_MASTER",
    sortCol: "SEND_DATE",
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
  $NC.setInitGridVar(G_GRDDETAIL);
  // 파라메터 세팅
  G_GRDDETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_DEFINE_NO: rowData.DEFINE_NO,
    P_SEND_DATE: rowData.SEND_DATE,
    P_SEND_NO: rowData.SEND_NO
  });
  // 데이터 조회
  $NC.serviceCall("/ED09050E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "SEND_SEQ",
    field: "SEND_SEQ",
    name: "순번",
    cssClass: "align-right",
    width: 60,
    minWidth: 60,
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_DIV_D",
    field: "ERROR_DIV_D",
    name: "오류구분",
    cssClass: "align-center",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "CENTER_CD",
    field: "CENTER_CD",
    name: "물류센터코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    cssClass: "align-right",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    cssClass: "align-center",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    cssClass: "align-right",
    name: "전표순번",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BU_KEY",
    field: "BU_KEY",
    cssClass: "align-right",
    name: "전표키",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATETIME",
    field: "BU_DATETIME",
    name: "전표일시",
    cssClass: "align-center",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "WMS_NO",
    field: "WMS_NO",
    name: "WMS전표번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SEND_CENTER_CD",
    field: "SEND_CENTER_CD",
    name: "송신물류센터코드",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SEND_BU_CD",
    field: "SEND_BU_CD",
    name: "송신사업부코드",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SEND_OUTBOUND_DATE",
    field: "SEND_OUTBOUND_DATE",
    name: "송신출고일자",
    cssClass: "align-center",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SEND_OUTBOUND_NO",
    field: "SEND_OUTBOUND_NO",
    name: "송신출고번호",
    cssClass: "align-center",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_CD",
    field: "INOUT_CD",
    name: "출고구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "CUST_CD",
    field: "CUST_CD",
    name: "위탁사코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "배송처코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_CD",
    field: "RDELIVERY_CD",
    name: "실배송처코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_BATCH",
    field: "DELIVERY_BATCH",
    name: "배송차수",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_BATCH",
    field: "OUTBOUND_BATCH",
    name: "출고차수",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DIV",
    field: "ORDER_DIV",
    name: "주문구분",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "CAR_CD",
    field: "CAR_CD",
    name: "차량코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "PLANED_DATETIME",
    field: "PLANED_DATETIME",
    name: "납품예정일시",
    cssClass: "align-center",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "전표별비고",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "SEND_LINE_NO",
    field: "SEND_LINE_NO",
    name: "송신순번",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "브랜드코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE",
    field: "ITEM_STATE",
    name: "상품상태",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "VALID_DATE",
    field: "VALID_DATE",
    name: "유통기한",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "BATCH_NO",
    field: "BATCH_NO",
    name: "제조/배치번호",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    cssClass: "align-right",
    minWidth: 80,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    cssClass: "align-right",
    minWidth: 80,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    cssClass: "align-right",
    minWidth: 80,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "SUPPLY_PRICE",
    field: "SUPPLY_PRICE",
    cssClass: "align-right",
    name: "공급단가",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "DC_PRICE",
    field: "DC_PRICE",
    cssClass: "align-right",
    name: "할인단가",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "APPLY_PRICE",
    field: "APPLY_PRICE",
    cssClass: "align-right",
    name: "적용단가",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SUPPLY_AMT",
    field: "SUPPLY_AMT",
    name: "공급금액",
    cssClass: "align-right",
    minWidth: 90,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "VAT_YN",
    field: "VAT_YN",
    name: "부가세여부",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "VAT_AMT",
    field: "VAT_AMT",
    name: "부가세금액",
    cssClass: "align-right",
    minWidth: 90,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "DC_AMT",
    field: "DC_AMT",
    cssClass: "align-right",
    name: "할인금액",
    minWidth: 90,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    cssClass: "align-right",
    name: "합계금액",
    minWidth: 90,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_ORDER_DIV",
    field: "ITEM_ORDER_DIV",
    name: "상품주문유형",
    cssClass: "align-center",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHORTAGE_DIV",
    field: "SHORTAGE_DIV",
    name: "결품사유구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SHORTAGE_COMMENT",
    field: "SHORTAGE_COMMENT",
    name: "결품사유내역",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "MISSED_DIV",
    field: "MISSED_DIV",
    name: "미배송사유구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "MISSED_COMMENT",
    field: "MISSED_COMMENT",
    name: "미배송사유내역",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "REMARK2",
    field: "REMARK2",
    name: "순번별비고",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "MALL_MSG",
    field: "MALL_MSG",
    name: "몰요청사항",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_CD",
    field: "ORDERER_CD",
    name: "주문자코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_TEL",
    field: "ORDERER_TEL",
    name: "주문자전화번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_HP",
    field: "ORDERER_HP",
    name: "주문자휴대폰",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_EMAIL",
    field: "ORDERER_EMAIL",
    name: "주문자메일",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_MSG",
    field: "ORDERER_MSG",
    name: "배송요청사항",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_TEL",
    field: "SHIPPER_TEL",
    name: "수령자전화번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_HP",
    field: "SHIPPER_HP",
    name: "수령자휴대폰",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ZIP_CD",
    field: "SHIPPER_ZIP_CD",
    name: "수령자우편번호",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_BASIC",
    field: "SHIPPER_ADDR_BASIC",
    name: "수령자기본주소",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_DETAIL",
    field: "SHIPPER_ADDR_DETAIL",
    name: "수령자상세주소",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "GIFT_WRAP_YN",
    field: "GIFT_WRAP_YN",
    name: "선물포장여부",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CARD_MSG",
    field: "CARD_MSG",
    name: "카드메시지",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "CARD_FROM",
    field: "CARD_FROM",
    name: "카드보내는분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CARD_TO",
    field: "CARD_TO",
    name: "카드받는분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REMARK3",
    field: "REMARK3",
    name: "온라인고객비고",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_USER_ID",
    field: "ENTRY_USER_ID",
    name: "등록사용자ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_DATETIME",
    field: "ENTRY_DATETIME",
    name: "등록일시",
    cssClass: "align-center",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "DIRECTIONS_USER_ID",
    field: "DIRECTIONS_USER_ID",
    name: "지시사용자ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DIRECTIONS_DATETIME",
    field: "DIRECTIONS_DATETIME",
    name: "지시일시",
    cssClass: "align-center",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_USER_ID",
    field: "CONFIRM_USER_ID",
    name: "확정사용자ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_DATETIME",
    field: "CONFIRM_DATETIME",
    name: "확정일시",
    cssClass: "align-center",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_USER_ID",
    field: "DELIVERY_USER_ID",
    name: "배송사용자ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_DATETIME",
    field: "DELIVERY_DATETIME",
    name: "배송완료일시",
    cssClass: "align-center",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "SEND_USER_ID",
    field: "SEND_USER_ID",
    name: "송신자ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SEND_DATETIME",
    field: "SEND_DATETIME",
    name: "송신일시",
    cssClass: "align-center",
    minWidth: 160
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 송신내역
 */
function grdDetailInitialize() {

  var options = {
    frozenColumn: 2,
    summaryRow: {
      visible: true
    },
    specialRow: {
      compareKey: "ERROR_DIV",
      compareVal: "4",
      compareOperator: "!==",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "ED09050E.RS_DETAIL",
    sortCol: "SEND_SEQ",
    gridOptions: options
  });
  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

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

/**
 * 송신처리 내역
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
        selectKey: ["SEND_DATE", "SEND_NO"],
        selectVal: G_GRDMASTER.lastKeyVal,
        activeCell: true
      });
    }
  } else {
    $NC.clearGridData(G_GRDDETAIL);
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
}

/**
 * 송신내역
 */
function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);

  if (G_GRDDETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
}

/**
 * 송신처리버튼 처리내역
 */
function onGetSendProc(ajaxData) {

  _Inquiry();
}

/**
 * 오류내역처리버튼 처리내역
 */
function onGetSendError(ajaxData) {

  var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  _Inquiry();
  G_GRDMASTER.lastKeyVal = [lastRowData.SEND_DATE, lastRowData.SEND_NO];

}

/**
 * 송신 처리 실패 했을 경우 처리
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
  // 조회조건 - 송신정의 세팅
  onGetDefineNo();
}

function onBtnSendClick(e) {

  // 저장권한
  if (!$NC.getProgramPermission().canSave) {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 입력하십시오.");
    return;
  }
  var DEFINE_NO = $NC.getValue("#cboQDefine_No");
  if ($NC.isNull(DEFINE_NO)) {
    alert("송신정의를 먼저 선택하십시오.");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var SEND_DATE = rowData.SEND_DATE;
  var SEND_NO = rowData.SEND_NO;
  var checkedValue = BU_CD + ";" + "SLO10" + ";" + DEFINE_NO + ";" + SEND_DATE + ";" + SEND_NO + ";"
      + $NC.G_USERINFO.USER_ID;

  // 송신처리
  // ES_PROCESSING 호출
  $NC.serviceCall("/ED09050E/callReSendLo.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: BU_CD,
      P_EDI_DIV: "SLO10",
      P_DEFINE_NO: DEFINE_NO,
      P_SEND_DATE: SEND_DATE,
      P_USER_ID: $NC.G_USERINFO.USER_ID,
      P_CHECKED_VALUE: checkedValue
    })
  }, onGetSendProc, onSaveError);
}

/**
 * 조회조건 - 송신정의 세팅
 */
function onGetDefineNo() {

  $NC.setInitCombo("/ED09050E/getDataSet.do", {
    P_QUERY_ID: "ED09050E.RS_SUB1",
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: $("#edtQBu_Cd").val()
    })
  }, {
    selector: "#cboQDefine_No",
    codeField: "DEFINE_NO",
    fullNameField: "DEFINE_NO_F",
    onComplete: function() {
      $NC.setValue("#cboQDefine_No", 0);
    }
  });
}