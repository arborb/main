/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });
  // 추가 조회조건 사용

  // 상단그리드 초기화
  grdMasterInitialize();
  // 하단그리드 초기화
  grdDetailInitialize();
  

  $NC.setInitDatePicker("#dtpQOutbound_Date1");
  $NC.setInitDatePicker("#dtpQOutbound_Date2");
  $NC.setInitDatePicker("#edtQBu_Date", $NC.G_USERINFO.LOGIN_DATE, "N");
  $NC.setInitDatePicker("#dtpQOutbound_Date", $NC.G_USERINFO.LOGIN_DATE, "N");
  $NC.setInitDatePicker("#dtpQInspect_Date", $NC.G_USERINFO.LOGIN_DATE, "N");
  $NC.setInitDatePicker("#dtpQClose_date", $NC.G_USERINFO.LOGIN_DATE, "N");
  $NC.setInitDatePicker("#dtpQHold_date", $NC.G_USERINFO.LOGIN_DATE, "N");
  $NC.setInitDatePicker("#dtpQDelivery_Date", $NC.G_USERINFO.LOGIN_DATE, "N");

  // 브랜드 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $NC.setValue("#edtQCarrier_Cd");
  $NC.setValue("#edtQCarrier_Nm");

  $("#btnQBu_Cd").click(showUserBuPopup);
  // $("#btnQBrand_Cd").click(showBuBrandPopup);
  $("#btnQOwn_Brand_Cd").click(showOwnBranPopup);
  $("#btnQCarrier_Cd").click(showQCarrierPopup);
  $("#btnQItem_Cd").click(showItemPopup);
//  $("#btnQDeal_Id").click(showDealPopup);
  $("#btnProcess").click(onBtnProcessClick);
  $("#btnCancel").click(onBtnCancelClick);
  $("#btnProcBw").click(onBtnProcBwClick);
  $("#btnProcExecCancel").click(onBtnProcExecCancelClick);
  $("#btnProcBwCancel").click(onBtnProcBwCancelClick);
  $("#btnQOutbound_Batch").click(setOutboundBatchCombo);

  // 진행상태 콤보박스 세팅
  var cboObj = $("#cboQOutbound_State").empty();
  var optionStr = "";
  optionStr += "<option value='%'>% - 전체</option>";
  optionStr += "<option value='10'>10 - 예정</option>";
  optionStr += "<option value='20'>20 - 등록</option>";
  optionStr += "<option value='30'>30 - 지시</option>";
  optionStr += "<option value='40'>40 - 확정</option>";
  optionStr += "<option value='50'>50 - 배송완료</option>";
  optionStr += "<option value='99'>99 - 취소(종결)</option>";
  cboObj.append(optionStr);
  $NC.setValue("#cboQOutbound_State", 0);

  // 진행상태 콤보박스 세팅
  var cboObjCancel = $("#cboQCancel_State").empty();
  var optionStrC = "";
  optionStrC += "<option value='%'>% - 전체</option>";
  optionStrC += "<option value='93'>93 - 취소대기</option>";
  optionStrC += "<option value='9'>9 - 취소확인</option>";
  optionStrC += "<option value='4'>4 - 취소완료</option>";
  cboObjCancel.append(optionStrC);
  $NC.setValue("#cboQCancel_State", 0);

  // 조회조건 - 보류여부 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "HOLD_YN_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboHold_Yn_Cd",
    codeField: "CODE_NM",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });

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
      setOutboundBatchCombo();
    }
  });

  // 조회조건 - 배송유형 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "DELIVERY_TYPE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQDelivery_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });

//조회조건 - 보류여부 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "DM",
      P_SUB_CD2: "%"
    })
  }, {
    selector: "#cboQInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });
  
  // 입력조건 - 취소사유 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "SHORTAGE_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboShortage_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F"
  });
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {
  // 미처리/오류 내역 탭 화면에 splitter 설정
  $NC.setInitSplitter("#divMasterView", "h", 300);
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

  // Splitter 컨테이너 크기 조정
  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, $("#grdMaster").parent().height() - $NC.G_LAYOUT.header);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, $("#grdDetail").parent().height() - $NC.G_LAYOUT.header);

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
  case "CENTER_CD":
    setOutboundBatchCombo();
    onChangingCondition();
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
  case "OUTBOUND_DATE":
    $NC.setValueDatePicker(view, val, "출고일자를 정확히 입력하십시오.");
    setOutboundBatchCombo();
    break;
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd", true),
        P_ITEM_CD: val,
        P_VIEW_DIV: "2",
        P_DEPART_CD: "%",
        P_LINE_CD: "%",
        P_CLASS_CD: "%"
      };
      O_RESULT_DATA = $NP.getItemInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        queryId: "WC.POP_CMBRANDITEM",
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemPopup, onItemPopup);
    }
    return;
    /*
  case "DEAL_ID":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_DEAL_ID: val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getDealInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onDealPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showDealPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onDealPopup, onDealPopup);
    }
    return;
    */
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
      onQCarrierPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showCarrierPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onQCarrierPopup, onQCarrierPopup);
    }
    return;
  }

  // 화면클리어
  // onChangingCondition();
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

  var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
  if ($NC.isNull(OUTBOUND_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date1");
    return;
  }

  var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
  if ($NC.isNull(OUTBOUND_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date2");
    return;
  }

  if (OUTBOUND_DATE1 > OUTBOUND_DATE2) {
    alert("검색일자 범위 오류입니다.");
    $NC.setFocus("#dtpQOutbound_Date1");
    return;
  }

  // var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var DEAL_ID = $NC.getValue("#edtQDeal_Id");
  var BU_NO = $NC.getValue("#edtQBu_No");
  var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm", true);
  var SHIPPER_NM = $NC.getValue("#edtShipper_Nm", true);
  var HOLD_YN = $NC.getValue("#cboHold_Yn_Cd");
  var BU_DATE = $NC.getValue("#edtQBu_Date");
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  var WB_NO = $NC.getValue("#edtQWb_No");
  var DELIVERY_TYPE = $NC.getValue("#cboQDelivery_Type");
  var CLOSE_DATE = $NC.getValue("#dtpQClose_date");
  var HOLD_DATE = $NC.getValue("#dtpQHold_date");
  var DELIVERY_DATE = $NC.getValue("#dtpQDelivery_Date");
  var INSPECT_DATE = $NC.getValue("#dtpQInspect_Date");
  var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch");
  var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd", true);
  var OUTBOUND_STATE = $NC.getValue("#cboQOutbound_State");
  var BU_KEY = $NC.getValue("#edtQBu_Key");
  var CANCEL_STATE = $NC.getValue("#cboQCancel_State");
  var PACKING_BATCH = $NC.getValue("#edtQBox_No");
  var INOUT_CD = $NC.getValue("#cboQInout_Cd");
  var SCAN_DATA = PACKING_BATCH.substr(2).split("-");

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  $NC.setInitGridData(G_GRDMASTER);
  $NC.setGridDisplayRows("#grdMaster", 0, 0);

  $NC.setInitGridVar(G_GRDDETAIL);
  $NC.setInitGridData(G_GRDDETAIL);
  $NC.setGridDisplayRows("#grdDetail", 0, 0);

  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE1: OUTBOUND_DATE1,
    P_OUTBOUND_DATE2: OUTBOUND_DATE2,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: ITEM_CD,
    P_DEAL_ID: DEAL_ID,
    P_BU_NO: BU_NO,
    P_ORDERER_NM: ORDERER_NM,
    P_SHIPPER_NM: SHIPPER_NM,
    P_HOLD_YN: HOLD_YN,
    P_OUTBOUND_BATCH: OUTBOUND_BATCH,
    P_BU_DATE: BU_DATE,
    P_OUTBOUND_DATE: OUTBOUND_DATE,
    P_INSPECT_DATE: INSPECT_DATE,
    P_DELIVERY_DATE: DELIVERY_DATE,
    P_DELIVERY_TYPE: DELIVERY_TYPE,
    P_CLOSE_DATE: CLOSE_DATE,
    P_WB_NO: WB_NO,
    P_HOLDE_DATE: HOLD_DATE,
    P_CARRIER_CD: CARRIER_CD,
    P_OUTBOUND_STATE: OUTBOUND_STATE,
    P_PACKING_BATCH: SCAN_DATA[3],
    P_BU_KEY: BU_KEY,
    P_CANCEL_STATE: CANCEL_STATE,
    P_INOUT_CD: INOUT_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });

  // 데이터 조회
  $NC.serviceCall("/LOM8010Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 40,
    maxWidth: 40,
    cssClass: "align-center",
    sortable: false,
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, { // 상용코드 새로 등록해야 할지 확인하기
    id: "OUTBOUND_STATE",
    field: "OUTBOUND_STATE",
    name: "상태",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CLOSE_STATE",
    field: "CLOSE_STATE",
    name: "취소상태",
    minWidth: 80,
    cssClass: "align-center"
  });

  $NC.setGridColumn(columns, {
    id: "ORDER_REMARK",
    field: "ORDER_REMARK",
    name: "취소(종결)",
    minWidth: 160,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "입출고구분",
    minWidth: 90,
    cssClass: "align-center"
  });
  
 
  $NC.setGridColumn(columns, {
    id: "HOLD_YN",
    field: "HOLD_YN",
    name: "보류여부",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_BATCH",
    field: "OUTBOUND_BATCH",
    name: "출고차수",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "MALL_NM",
    field: "MALL_NM",
    name: "MALL명",
    cssClass: "align-center",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_TYPE_NM",
    field: "DELIVERY_TYPE_NM",
    name: "배송유형",
    cssClass: "align-center",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_NM",
    field: "CARRIER_NM",
    name: "택배사명",
    cssClass: "align-center",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_NO",
    field: "ORDER_NO",
    name: "예정번호",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "IF_CHECK",
    field: "IF_CHECK",
    name: "I/F수신여부",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "주문일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "주문번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BU_KEY",
    field: "BU_KEY",
    name: "결제번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "WB_NO",
    field: "WB_NO",
    name: "송장번호",
    minWidth: 110,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 80
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
    id: "SHIPPER_ADDR",
    field: "SHIPPER_ADDR",
    name: "주소",
    minWidth: 250
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_MSG",
    field: "ORDERER_MSG",
    name: "배송메시지",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "CANCEL_MSG",
    field: "CANCEL_MSG",
    name: "보류/취소내용",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATETIME",
    field: "ORDER_DATETIME",
    name: "예정일시",
    minWidth: 130,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CLOSE_DATE",
    field: "CLOSE_DATE",
    name: "취소일자",
    minWidth: 130,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CLOSE_USER",
    field: "CLOSE_USER",
    name: "취소작업자",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "HOLD_DATETIME",
    field: "HOLD_DATETIME",
    name: "보류일자",
    minWidth: 130,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "HOLD_USER",
    field: "HOLD_USER",
    name: "보류작업자",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "PROC_DATETIME",
    field: "PROC_DATETIME",
    name: "취소수신일자",
    minWidth: 130,
    cssClass: "align-center"
  });
  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 상단그리드 초기화
 */
function grdMasterInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LOM8010Q.RS_MASTER",
    sortCol: ["BU_DATE", "BU_NO"],
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
  G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

function grdMasterOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDMASTER.view.getEditorLock().isActive() && !G_GRDMASTER.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDMASTER.data.getLength();
      var rowData;
      G_GRDMASTER.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDMASTER.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDMASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTER.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdMasterOnClick(e, args) {

  if (args.cell === G_GRDMASTER.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTER.view.getEditorLock().isActive() && !G_GRDMASTER.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDMASTER.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {

        if (rowData.CRUD === "R") {
          rowData.CRUD = "U";
        }

        G_GRDMASTER.data.updateItem(rowData.id, rowData);
      }
      // e.stopPropagation();
      // e.stopImmediatePropagation();
    }
    return;
  }
}

function grdDetailOnGetColumns(policyLI420) {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 80,
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_ID",
    field: "OPTION_ID",
    name: "옵션코드",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "주문순번",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 80,
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE",
    field: "ITEM_STATE",
    name: "상품상태",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "판매사코드",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "판매사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 하단그리드 초기화
 */
function grdDetailInitialize() {

  var options = {
  // frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "LOM8010Q.RS_DETAIL",
    sortCol: "OPTION_CD",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

/**
 * 상단그리드 행 클릭시 이벤트 처리
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

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL);
  onGetDetail({
    data: null
  });

  var rowData = G_GRDMASTER.data.getItem(row);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var DEAL_ID = $NC.getValue("#edtQDeal_Id");
  G_GRDDETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_ORDER_DATE: rowData.ORDER_DATE,
    P_ORDER_NO: rowData.ORDER_NO,
    P_ITEM_CD: ITEM_CD,
    P_DEAL_ID: DEAL_ID,
    P_WB_NO: rowData.WB_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LOM8010Q/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);

}

/**
 * 상단그리드 더블 클릭 : 팝업 표시
 */
function grdMasterOnDblClick(e, args) {

}

/**
 * 하단그리드 행 클릭시 이벤트 처리
 * 
 * @param e
 * @param args
 */
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
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: new Array("ORDER_DATE", "ORDER_NO"),
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
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
 * 상단그리드 행 클릭후 하단 그리드에 데이터 표시처리
 */
function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "OPTION_ID",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
  // G_GRDDETAIL.view.getCanvasNode().focus();
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  // 조회시 전역 변수 값 초기화
  $NC.clearGridData(G_GRDMASTER);
  // 조회시 전역 변수 값 초기화
  $NC.clearGridData(G_GRDDETAIL);

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
 * 검색조건의 사업구분 검색 팝업 클릭
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
 * 사업구분 검색 결과
 * 
 * @param seletedRowData
 */
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

  setOutboundBatchCombo();
  onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
/*
function showBuBrandPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");

  $NP.showBuBrandPopup({
    P_BU_CD: BU_CD,
    P_BRAND_CD: "%"
  }, onBuBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}
*/

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
/*
function onBuBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  $NC.setValue("#edtQItem_Cd");
  $NC.setValue("#edtQItem_Nm");
  onChangingCondition();
}
*/

/**
 * 검색조건의 브랜드 검색 팝업 클릭
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
 * 브랜드 검색 결과
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
 * 검색조건의 운송사 검색 팝업 클릭
 */
function showQCarrierPopup() {
  var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd", true);
  $NP.showCarrierPopup({
    queryParams: {
      P_CARRIER_CD: CARRIER_CD,
      P_VIEW_DIV: "2"
    }
  }, onQCarrierPopup, function() {
    $NC.setFocus("#edtQCarrier_Cd", true);
  });
}

function onQCarrierPopup(resultInfo) {
  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQCarrier_Cd", resultInfo.CARRIER_CD);
    $NC.setValue("#edtQCarrier_Nm", resultInfo.CARRIER_NM);
  } else {
    $NC.setValue("#edtQCarrier_Cd");
    $NC.setValue("#edtQCarrier_Nm");
  }
  onChangingCondition();
}

/**
 * 상품 검색 팝업 표시
 */
function showItemPopup() {

  P_QUERY_PARAMS = {
    P_BU_CD: $NC.getValue("#edtQBu_Cd"),
    P_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd", true),
    P_ITEM_CD: "%",
    P_VIEW_DIV: "2",
    P_DEPART_CD: "%",
    P_LINE_CD: "%",
    P_CLASS_CD: "%"
  };
  $NP.showItemPopup({
    queryParams: P_QUERY_PARAMS,
  }, onItemPopup, function() {
    $NC.setFocus("#edtQItem_Cd", true);
  });

}

function onItemPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQItem_Cd", resultInfo.ITEM_CD);
    $NC.setValue("#edtQItem_Nm", resultInfo.ITEM_NM);
  } else {
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");
    $NC.setFocus("#edtQItem_Cd", true);
  }
  onChangingCondition();
}

function showDealPopup() {
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var DEAL_ID = $NC.getValue("#edtQDeal_Id", true);

  $NP.showDealPopup({
    P_BU_CD: BU_CD,
    P_DEAL_ID: DEAL_ID,
    P_VIEW_DIV: "2",
  }, onDealPopup, function() {
    $NC.setFocus("#edtQOption_Cd", true);
  });
}

function onDealPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQDeal_Id", resultInfo.DEAL_ID);
    $NC.setValue("#edtQDeal_Nm", resultInfo.DEAL_NM);
  } else {
    $NC.setValue("#edtQDeal_Id");
    $NC.setValue("#edtQDeal_Nm");
    $NC.setFocus("#edtQDeal_Id", true);
  }
  onChangingCondition();
}

/**
 * 배송처 검색 결과
 * 
 * @param seletedRowData
 */
function onVendorPopup(resultInfo) {

}

function onBtnProcessClick() {

  var rowCount = G_GRDMASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
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
    alert("사업구분 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date1");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("출고일자를 선택하십시오.");
    $NC.setFocus("#dtpQOutbound_Date1");
    return;
  }
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var DEAL_ID = $NC.getValue("#edtQDeal_Id");

  var SHORTAGE_DIV = $NC.getValueCombo("#cboShortage_Div", "N");
  if ($NC.isNull(SHORTAGE_DIV)) {
    alert("보류/취소 사유를 입력하십시오.");
    $NC.setFocus("#cboShortage_Div");
    return;
  }

  var CLOSE_MSG = $NC.getValue("#edtClose_Msg");
  if ($NC.isNull(CLOSE_MSG)) {
    alert("보류/취소 내용을 입력하십시오.");
    $NC.setFocus("#edtClose_Msg");
    return;
  }

  // var CLOSE_COMMENT = $NC.getValueCombo("#cboShortage_Div", "N") + " :: " +$NC.getValue("#edtClose_Msg");
  var CLOSE_COMMENT = SHORTAGE_DIV + " :: " + CLOSE_MSG;

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y" && rowData.HOLD_YN == "N") {
      chkCnt++;
      var processData = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_ORDER_DATE: rowData.BU_DATE,
        P_ORDER_NO: rowData.BU_NO,
        P_ITEM_CD: ITEM_CD,
        P_DEAL_ID: DEAL_ID,
        P_CLOSE_COMMENT: CLOSE_COMMENT
      };
      processDS.push(processData);
    }
  }
  if (chkCnt == 0) {
    alert("보류처리할 데이터를 선택하십시오.");
    return;
  }

  $NC.serviceCall("/LOM8010Q/callOrderHold.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_DIRECTION: "FW",
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError, 2);
}

function onBtnCancelClick() {

  var rowCount = G_GRDMASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
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
    alert("사업구분 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date1");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("출고일자를 선택하십시오.");
    $NC.setFocus("#dtpQOutbound_Date1");
    return;
  }
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var DEAL_ID = $NC.getValue("#edtQDeal_Id");

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y" && rowData.HOLD_YN == "Y") {
      chkCnt++;
      var processData = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_ORDER_DATE: rowData.BU_DATE,
        P_ORDER_NO: rowData.BU_NO,
        P_ITEM_CD: ITEM_CD,
        P_DEAL_ID: DEAL_ID
      };
      processDS.push(processData);
    }
  }
  if (chkCnt == 0) {
    alert("보류해지할 데이터를 선택하십시오.");
    return;
  }

  $NC.serviceCall("/LOM8010Q/callOrderHold.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_DIRECTION: "BW",
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError, 2);
}

function onBtnProcExecCancelClick() {

  var rowCount = G_GRDMASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
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
    alert("사업구분 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  var SHORTAGE_DIV = $NC.getValueCombo("#cboShortage_Div", "N");
  if ($NC.isNull(SHORTAGE_DIV)) {
    alert("보류/취소 사유를 입력하십시오.");
    $NC.setFocus("#cboShortage_Div");
    return;
  }

  var CLOSE_MSG = $NC.getValue("#edtClose_Msg");
  if ($NC.isNull(CLOSE_MSG)) {
    alert("보류/취소 내용을 입력하십시오.");
    $NC.setFocus("#edtClose_Msg");
    return;
  }

  // var CLOSE_COMMENT = $NC.getValueCombo("#cboShortage_Div", "N") + " :: " +$NC.getValue("#edtClose_Msg");
  var CLOSE_COMMENT = SHORTAGE_DIV + " :: " + CLOSE_MSG;

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      var processData = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_CLOSE_COMMENT: CLOSE_COMMENT
      };
      processDS.push(processData);
    }
  }
  if (chkCnt == 0) {
    alert("취소처리할 데이터를 선택하십시오.");
    return;
  }

  if (chkCnt > 0) {
    var result = confirm("취소처리하시겠습니까?.");
    if (!result) {
      return;
    } else {
    }
  }

  $NC.serviceCall("/LOM8010Q/callOrderHold.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_DIRECTION: "CE",
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError, 2);
}

function onBtnProcBwClick() {

  var rowCount = G_GRDMASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
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
    alert("사업구분 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  var chkCloseState = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      if(rowData.IF_CHECK == "Y"){
        alert("인터페이스 수신된 주문은 처리하실 수 없습니다.");
        return;
      }
      if (rowData.CLOSE_CHECK != null || rowData.ORG_OUTBOUND_STATE == "99") {
        chkCloseState++;
      }
      chkCnt++;
      var processData = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: rowData.ORDER_DATE,
        P_OUTBOUND_NO: rowData.ORDER_NO
      };
      processDS.push(processData);
    }
  }
  if (chkCnt == 0) {
    alert("취소등록처리할 데이터를 선택하십시오.");
    return;
  }

  if (chkCloseState > 0) {
    alert("체크 선택하신 건중 \n\n취소등록 또는 취소처리된 건이 있습니다.");
    return;
  }

  if (chkCloseState == 0) {
    if (chkCnt > 0) {
      var result = confirm("취소등록처리하시겠습니까?.\n\n출고지시 이전: 취소 처리 완료 상태로 변경."
          + "\n출고지시 이후: 취소 대상으로 등록. 검수시 안내에 따라 [출고취소처리]화면에서 최종 취소처리하시기 바랍니다.");
      if (!result) {
        return;
      } else {
      }
    }
  }

  $NC.serviceCall("/LOM8010Q/callOrderHold.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_DIRECTION: "CW",
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError, 2);
}

function onBtnProcBwCancelClick() {

  var rowCount = G_GRDMASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
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
    alert("사업구분 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      if(rowData.IF_CHECK == "Y"){
        alert("인터페이스 수신된 주문은 처리하실 수 없습니다.");
        return;
      }
      chkCnt++;
      var processData = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_ORDER_DATE: rowData.ORDER_DATE,
        P_ORDER_NO: rowData.ORDER_NO
      };
      processDS.push(processData);
    }
  }
  if (chkCnt == 0) {
    alert("취소철회할 데이터를 선택하십시오.");
    return;
  }

  $NC.serviceCall("/LOM8010Q/callOrderHold.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_DIRECTION: "CC",
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError, 2);
}

function onSave(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: ["ORDER_DATE", "ORDER_NO"]
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;

}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}

/**
 * 물류센터/사업구분/출고일자 값 변경시 출고차수 콤보 재설정
 */
function setOutboundBatchCombo() {

  // 조회조건 - 출고차수 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_OUTBOUND_BATCH",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date1"),
      P_OUTBOUND_DIV: "2" // 출고작업구분(1:기본출고, 2:온라인출고)
    })
  }, {
    selector: "#cboQOutbound_Batch",
    codeField: "OUTBOUND_BATCH",
    nameField: "OUTBOUND_BATCH",
    fullNameField: "OUTBOUND_BATCH_F",
    addAll: true
  });
}

/**
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          grid, row, cell, val
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDMASTER, args.row);

  var rowData = G_GRDMASTER.data.getItem(args.row);

  if (args.cell == G_GRDMASTER.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  // G_GRDMASTER.lastRowModified = true;
}
