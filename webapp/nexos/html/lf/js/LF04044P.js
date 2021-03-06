/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();

  $("#btnClose").click(onCancel); // 닫기버튼
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {
  
  $NC.setValue("#edtQOwn_Brand_Nm", $NC.G_VAR.userData.P_OWN_BRAND_NM);
  $NC.setValue("#edtQAdjust_Date", $NC.G_VAR.userData.P_ADJUST_DATE1);
  $NC.setValue("#edtQAdjust_Month", $NC.G_VAR.userData.P_ADJUST_MONTH);

  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
    P_OWN_BRAND_CD: $NC.G_VAR.userData.P_BRAND_CD,
    P_ADJUST_MONTH: $NC.G_VAR.userData.P_ADJUST_MONTH,
    P_FEE_HEAD_CD: "200",
    P_FEE_BASE_CD: "030",
    P_MALL_CD: $NC.G_VAR.userData.P_MALL_CD,
  });

  // 데이터 조회
  $NC.serviceCall("/LF04040Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
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

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CUST_CD",
    field: "CUST_CD",
    name: "위탁사코드",
    minWidth: 90
  });

  $NC.setGridColumn(columns, {
    id: "CUST_NM",
    field: "CUST_NM",
    name: "위탁사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "WB_NO",
    field: "WB_NO",
    name: "송장번호",
    minWidth: 130
  });
  
  $NC.setGridColumn(columns, {
    id: "CARRIER_NM",
    field: "CARRIER_NM",
    name: "운송사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자",
    minWidth: 80
  });
  
  $NC.setGridColumn(columns, {
    id: "REFUND_SHIP_PRICE_NM",
    field: "REFUND_SHIP_PRICE_NM",
    name: "배송부담주체",
    minWidth: 140
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
    minWidth: 140
  }); 
  $NC.setGridColumn(columns, {
    id: "BU_KEY",
    field: "BU_KEY",
    name: "결제번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LF04040Q.RS_SUB4",
    sortCol: "ADJUST_DATE",
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
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
}
