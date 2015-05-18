/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {
  
  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();
  
  // 조회조건 - 브랜드 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  
  grdMasterInitialize();
  
  onGetDefineNo();

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

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnSaveXls").click(onBtnSaveClick);
  $("#btnQOutbound_Batch").click(setOutboundBatchCombo);

  // 조회조건 - 브랜드 세팅
//  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
//  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
//  
//  onGetDefineNo();

  $NC.setInitDatePicker("#dtpQUpload_Date");
  
  // 처리여부 콤보박스 세팅
  var cboObj = $("#cboQSave_Yn").empty();
  var optionStr = "";
  optionStr += "<option value='Y'>완료포함</option>";
  optionStr += "<option value='N'>미완료</option>";
  cboObj.append(optionStr);
  $NC.setValue("#cboQSave_Yn", 0);

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
      setOutboundBatchCombo();
    }
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
    setOutboundBatchCombo();
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
  case "OUTBOUND_DATE":
    $NC.setValueDatePicker(view, val, "출고일자를 정확히 입력하십시오.");
    setOutboundBatchCombo();
    break;
  case "DEFINE_NO":
    grdMasterInitialize();
    break;
  case "SAVE_YN":
    _Inquiry();
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
    alert("사업부 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  var UPLOAD_DATE = $NC.getValue("#dtpQUpload_Date");
  if ($NC.isNull(UPLOAD_DATE)) {
    alert("주문 업로드일자를 입력하십시오.");
    $NC.setFocus("#dtpQUpload_Date");
    return;
  }

  var DEFINE_NO = $NC.getValueCombo("#cboQDefine_No");
  if ($NC.isNull(DEFINE_NO)) {
    alert("송신정의를 선택하십시오.");
    $NC.setFocus("#cboQDefine_No");
    return;
  }
  
  var DEAL_ID = $NC.getValue("#edtQDeal_Id", true);
  var BU_NO = $NC.getValue("#edtQBu_No");
  var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm");
  var SHIPPER_NM = $NC.getValue("#edtQShipper_Nm");
  var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch");

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_UPLOAD_DATE: UPLOAD_DATE,
    P_DEFINE_NO: DEFINE_NO,
    P_DEAL_ID: DEAL_ID,
    P_BU_NO: BU_NO,
    P_OUTBOUND_BATCH: OUTBOUND_BATCH,
    P_ORDERER_NM: ORDERER_NM,
    P_SHIPPER_NM: SHIPPER_NM
  });

  var SAVE_YN = $NC.getValue("#cboQSave_Yn");
  if (SAVE_YN == "Y"){
    G_GRDMASTER.queryId = "ED04060E.RS_MASTER";
  } else {
    G_GRDMASTER.queryId = "ED04060E.RS_MASTER2";
  }
  // 데이터 조회
  $NC.serviceCall("/ED04060E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
  
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
  var DEFINE_NO = $NC.getValueCombo("#cboQDefine_No");
//  위메프(협력사)
  if(DEFINE_NO =="EX01"){
    $NC.setGridColumn(columns, {
      id: "BU_NO",
      field: "BU_NO",
      name: "주문번호",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "DEAL_ID",
      field: "DEAL_ID",
      cssClass: "align-right",
      name: "딜번호",
      minWidth: 60
    });
    $NC.setGridColumn(columns, {
      id: "DEAL_NM",
      field: "DEAL_NM",
      name: "딜명",
      minWidth: 60
    });
    $NC.setGridColumn(columns, {
      id: "BRAND_NM",
      field: "BRAND_NM",
      name: "업체명",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_NM",
      field: "ORDERER_NM",
      name: "구매자이름",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_ID",
      field: "ORDERER_ID",
      name: "아이디",
      minWidth: 120
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_HP",
      field: "ORDERER_HP",
      name: "구매자휴대폰",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "OPTION_QTY",
      field: "OPTION_QTY",
      name: "수량",
      cssClass: "align-center",
      minWidth: 90,
    });
    $NC.setGridColumn(columns, {
      id: "BOX_COUNT",
      field: "BOX_COUNT",
      name: "박스",
      cssClass: "align-right",
      minWidth: 60
    });
    $NC.setGridColumn(columns, {
      id: "BU_DATETIME",
      field: "BU_DATETIME",
      name: "주문일시",
      cssClass: "align-center",
      minWidth: 160
    });
    $NC.setGridColumn(columns, {
      id: "ORDER_TYPE",
      field: "ORDER_TYPE",
      name: "주문유형",
      minWidth: 60
    });
    $NC.setGridColumn(columns, {
      id: "ORDER_STATUS",
      field: "ORDER_STATUS",
      name: "주문상태",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_NM",
      field: "SHIPPER_NM",
      name: "받는분이름",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_HP",
      field: "SHIPPER_HP",
      name: "받는분휴대폰",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_ZIP_CD",
      field: "SHIPPER_ZIP_CD",
      name: "우편번호",
      cssClass: "align-center",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_ADDR_BASIC",
      field: "SHIPPER_ADDR_BASIC",
      name: "주소",
      minWidth: 160
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_MSG",
      field: "ORDERER_MSG",
      name: "배송메시지",
      minWidth: 160
    });
    $NC.setGridColumn(columns, {
      id: "OPTION_VALUE",
      field: "OPTION_VALUE",
      name: "옵션",
      minWidth: 180
    });
    $NC.setGridColumn(columns, {
      id: "WB_UPLOAD",
      field: "WB_UPLOAD",
      name: "운송장번호",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "GIFT_NO",
      field: "GIFT_NO",
      name: "선물주문번호",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_CD",
      field: "ORDERER_CD",
      name: "구매자MID",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "WB_UPDATETIME",
      field: "WB_UPDATETIME",
      name: "송장번호등록시간",
      minWidth: 120
    });
    $NC.setGridColumn(columns, {
      id: "BOX_DIV",
      field: "BOX_DIV",
      name: "박스구분",
      minWidth: 60
    });
//    티몬    
  } else if(DEFINE_NO =="EX02"){
    $NC.setGridColumn(columns, {
      id: "DEAL_ID",
      field: "DEAL_ID",
      cssClass: "align-right",
      name: "딜번호",
      minWidth: 60
    });
    $NC.setGridColumn(columns, {
      id: "BU_NO",
      field: "BU_NO",
      name: "주문번호",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "DELIVERY_NM",
      field: "DELIVERY_NM",
      name: "택배사",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "WB_UPLOAD",
      field: "WB_UPLOAD",
      name: "운송장번호",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "DELIVERY_DATE",
      field: "DELIVERY_DATE",
      name: "발송예정일",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "DELAY_DELIVERY_DATE",
      field: "DELAY_DELIVERY_DATE",
      name: "지연발송예정일",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "DELAY_MSG",
      field: "DELAY_MSG",
      name: "지연사유",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "DELAY_MSG_DETAIL",
      field: "DELAY_MSG_DETAIL",
      name: "지연사유상세",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "DELAY_DATETIME",
      field: "DELAY_DATETIME",
      name: "지연신고일",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "WB_UPDATETIME",
      field: "WB_UPDATETIME",
      name: "송장등록시점",
      cssClass: "align-center",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_NM",
      field: "ORDERER_NM",
      name: "주문자명",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_CD",
      field: "ORDERER_CD",
      name: "아이디",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "DEAL_NM",
      field: "DEAL_NM",
      name: "상품명",
      minWidth: 60
    });
    $NC.setGridColumn(columns, {
      id: "OPTION_VALUE",
      field: "OPTION_VALUE",
      name: "옵션명",
      minWidth: 180
    });
    $NC.setGridColumn(columns, {
      id: "APPLY_PRICE",
      field: "APPLY_PRICE",
      name: "판매단가",
      cssClass: "align-center",
      minWidth: 90,
    });
    $NC.setGridColumn(columns, {
      id: "ORDER_QTY",
      field: "ORDER_QTY",
      name: "구매수량",
      cssClass: "align-center",
      minWidth: 90,
    });
    $NC.setGridColumn(columns, {
      id: "TOTAL_AMT",
      field: "TOTAL_AMT",
      name: "판매금액",
      cssClass: "align-center",
      minWidth: 90,
    });
    $NC.setGridColumn(columns, {
      id: "BU_DATETIME",
      field: "BU_DATETIME",
      name: "결제완료일",
      cssClass: "align-center",
      minWidth: 130
    });
    $NC.setGridColumn(columns, {
      id: "GIFT_NO",
      field: "GIFT_NO",
      name: "추가문구",
      minWidth: 70
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_NM",
      field: "SHIPPER_NM",
      name: "수취인명",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "ID_NO",
      field: "ID_NO",
      name: "주민번호",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_HP",
      field: "SHIPPER_HP",
      name: "수령자휴대폰",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_ADDR_BASIC",
      field: "SHIPPER_ADDR_BASIC",
      name: "수령자기본주소",
      minWidth: 160
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_ZIP_CD",
      field: "SHIPPER_ZIP_CD",
      name: "수령자우편번호",
      cssClass: "align-center",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_MSG",
      field: "ORDERER_MSG",
      name: "배송요청사항",
      minWidth: 160
    });
    $NC.setGridColumn(columns, {
      id: "SECRET_VALID_DATE",
      field: "SECRET_VALID_DATE",
      name: "안심번호기간",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "DELIVERY_STATUS",
      field: "DELIVERY_STATUS",
      name: "배송상태",
      minWidth: 60
    });
    $NC.setGridColumn(columns, {
      id: "COMPLETE_DATETIME",
      field: "COMPLETE_DATETIME",
      name: "최종처리일",
      cssClass: "align-center",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "PARTNER_CODE1",
      field: "PARTNER_CODE1",
      name: "파트너코드1",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "PARTNER_CODE2",
      field: "PARTNER_CODE2",
      name: "파트너코드2",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "PARTNER_CODE3",
      field: "PARTNER_CODE3",
      name: "파트너코드3",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "PARTNER_CODE4",
      field: "PARTNER_CODE4",
      name: "파트너코드4",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "PARTNER_CODE5",
      field: "PARTNER_CODE5",
      name: "파트너코드5",
      minWidth: 80
    });
//    쿠팡
  } else if(DEFINE_NO =="EX04"){
    
    $NC.setGridColumn(columns, {
      id: "EX_LINE_NO",
      field: "EX_LINE_NO",
      cssClass: "align-right",
      name: "번호",
      minWidth: 50
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_CD",
      field: "ORDERER_CD",
      name: "합포장번호",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "DEAL_ID",
      field: "DEAL_ID",
      name: "딜번호",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "BU_NO",
      field: "BU_NO",
      name: "주문번호",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "WB_UPLOAD",
      field: "WB_UPLOAD",
      name: "송장번호",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "BU_DATETIME",
      field: "BU_DATETIME",
      name: "주문일",
      minWidth: 120
    });
    $NC.setGridColumn(columns, {
      id: "TOTAL_AMT",
      field: "TOTAL_AMT",
      name: "결제액",
      cssClass: "align-center",
      minWidth: 70
    });
    $NC.setGridColumn(columns, {
      id: "DELIVERY_AMT",
      field: "DELIVERY_AMT",
      name: "배송비",
      cssClass: "align-center",
      minWidth: 70
    });
    $NC.setGridColumn(columns, {
      id: "ORDER_QTY",
      field: "ORDER_QTY",
      name: "구매수",
      cssClass: "align-center",
      minWidth: 70
    });
    $NC.setGridColumn(columns, {
      id: "APPLY_PRICE",
      field: "APPLY_PRICE",
      name: "옵션판매가",
      cssClass: "align-center",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "OPTION_VALUE",
      field: "OPTION_VALUE",
      name: "상품이름",
      minWidth: 180
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_EMAIL",
      field: "ORDERER_EMAIL",
      name: "구매자이메일",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_NM",
      field: "ORDERER_NM",
      name: "구매자",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_HP",
      field: "ORDERER_HP",
      name: "구매자전화번호",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_NM",
      field: "SHIPPER_NM",
      name: "수취인이름",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_HP",
      field: "SHIPPER_HP",
      name: "수취인전화번호",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_ZIP_CD",
      field: "SHIPPER_ZIP_CD",
      name: "우편번호",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_ADDR_BASIC",
      field: "SHIPPER_ADDR_BASIC",
      name: "주소",
      minWidth: 150
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_MSG",
      field: "ORDERER_MSG",
      name: "배송메시지",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "BRAND_ITEM_CD",
      field: "BRAND_ITEM_CD",
      name: "업체상품코드",
      minWidth: 90
    });
//    위메프주문서(큐)
  } else if(DEFINE_NO =="EX05"){
    
    $NC.setGridColumn(columns, {
      id: "BU_NO",
      field: "BU_NO",
      name: "전표번호",
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
      id: "ORDERER_CD",
      field: "ORDERER_CD",
      name: "합포장번호",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "DELIVERY_NM",
      field: "DELIVERY_NM",
      name: "택배사",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "WB_UPLOAD",
      field: "WB_UPLOAD",
      name: "운송장번호",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "WB_UPDATETIME",
      field: "WB_UPDATETIME",
      name: "운송장등록일시",
      minWidth: 120
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_NM",
      field: "ORDERER_NM",
      name: "주문자명",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_EMAIL",
      field: "ORDERER_EMAIL",
      name: "아이디",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "DEAL_ID",
      field: "DEAL_ID",
      cssClass: "align-right",
      name: "상품ID",
      minWidth: 60
    });
    $NC.setGridColumn(columns, {
      id: "DEAL_NM",
      field: "DEAL_NM",
      name: "상품명",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "GIFT_NO",
      field: "GIFT_NO",
      name: "옵션ID",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "OPTION_VALUE",
      field: "OPTION_VALUE",
      name: "옵션명",
      minWidth: 140
    });
    $NC.setGridColumn(columns, {
      id: "OPTION_QTY",
      field: "OPTION_QTY",
      name: "옵션수량",
      cssClass: "align-center",
      minWidth: 90,
    });
    $NC.setGridColumn(columns, {
      id: "TOTAL_AMT",
      field: "TOTAL_AMT",
      name: "구매금액",
      cssClass: "align-center",
      minWidth: 90,
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_NM",
      field: "SHIPPER_NM",
      name: "받는분이름",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_HP",
      field: "SHIPPER_HP",
      name: "받는분휴대폰",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_ZIP_CD",
      field: "SHIPPER_ZIP_CD",
      name: "우편번호",
      cssClass: "align-center",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_ADDR_BASIC",
      field: "SHIPPER_ADDR_BASIC",
      name: "주소",
      minWidth: 150
    });
    $NC.setGridColumn(columns, {
      id: "DELIVERY_STATUS",
      field: "DELIVERY_STATUS",
      cssClass: "align-right",
      name: "배송비유형",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "BRAND_NM",
      field: "BRAND_NM",
      cssClass: "align-right",
      name: "업체명",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_MSG",
      field: "ORDERER_MSG",
      name: "배송메시지",
      minWidth: 120
    });
    $NC.setGridColumn(columns, {
      id: "ID_NO",
      field: "ID_NO",
      name: "구매자MID",
      minWidth: 60
    });
    $NC.setGridColumn(columns, {
      id: "PARTNER_CODE1",
      field: "PARTNER_CODE1",
      name: "특이사항",
      minWidth: 80
    });
//    그외 양식
  } else{
    $NC.setGridColumn(columns, {
      id: "BU_NO",
      field: "BU_NO",
      name: "주문번호",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "DEAL_ID",
      field: "DEAL_ID",
      cssClass: "align-right",
      name: "딜번호",
      minWidth: 60
    });
    $NC.setGridColumn(columns, {
      id: "DEAL_NM",
      field: "DEAL_NM",
      name: "딜명",
      minWidth: 60
    });
    $NC.setGridColumn(columns, {
      id: "BRAND_NM",
      field: "BRAND_NM",
      name: "업체명",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_NM",
      field: "ORDERER_NM",
      name: "구매자이름",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_ID",
      field: "ORDERER_ID",
      name: "아이디",
      minWidth: 120
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_HP",
      field: "ORDERER_HP",
      name: "주문자휴대폰",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "OPTION_QTY",
      field: "OPTION_QTY",
      name: "수량",
      cssClass: "align-center",
      minWidth: 90,
    });
    $NC.setGridColumn(columns, {
      id: "BOX_COUNT",
      field: "BOX_COUNT",
      name: "박스",
      cssClass: "align-right",
      minWidth: 60
    });
    $NC.setGridColumn(columns, {
      id: "BU_DATETIME",
      field: "BU_DATETIME",
      name: "주문일시",
      cssClass: "align-center",
      minWidth: 160
    });
    $NC.setGridColumn(columns, {
      id: "ORDER_TYPE",
      field: "ORDER_TYPE",
      name: "주문유형",
      minWidth: 60
    });
    $NC.setGridColumn(columns, {
      id: "ORDER_STATUS",
      field: "ORDER_STATUS",
      name: "주문상태",
      minWidth: 80
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_NM",
      field: "SHIPPER_NM",
      name: "받는분이름",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_HP",
      field: "SHIPPER_HP",
      name: "받는분휴대폰",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_ZIP_CD",
      field: "SHIPPER_ZIP_CD",
      name: "우편번호",
      cssClass: "align-center",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "SHIPPER_ADDR_BASIC",
      field: "SHIPPER_ADDR_BASIC",
      name: "주소",
      minWidth: 160
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_MSG",
      field: "ORDERER_MSG",
      name: "배송메시지",
      minWidth: 160
    });
    $NC.setGridColumn(columns, {
      id: "OPTION_VALUE",
      field: "OPTION_VALUE",
      name: "옵션",
      minWidth: 180
    });
    $NC.setGridColumn(columns, {
      id: "WB_UPLOAD",
      field: "WB_UPLOAD",
      name: "운송장번호",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "GIFT_NO",
      field: "GIFT_NO",
      name: "선물주문번호",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "ORDERER_CD",
      field: "ORDERER_CD",
      name: "구매자MID",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "WB_UPDATETIME",
      field: "WB_UPDATETIME",
      name: "송장번호등록시간",
      minWidth: 120
    });
    $NC.setGridColumn(columns, {
      id: "BOX_DIV",
      field: "BOX_DIV",
      name: "박스구분",
      minWidth: 60
    });
  }


  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {
    
  var options = {
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "ED04060E.RS_MASTER",
    sortCol: "RECV_NO",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function onBtnSaveClick(e) {
  
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  var UPLOAD_DATE = $NC.getValue("#dtpQUpload_Date");
  if ($NC.isNull(UPLOAD_DATE)) {
    alert("주문 업로드일자를 입력하십시오.");
    $NC.setFocus("#dtpQUpload_Date");
    return;
  }

  var DEFINE_NO = $NC.getValueCombo("#cboQDefine_No");
  if ($NC.isNull(DEFINE_NO)) {
    alert("송신정의를 선택하십시오.");
    $NC.setFocus("#cboQDefine_No");
    return;
  }

  if (G_GRDMASTER.data.getLength() === 0) {
    alert("처리할 대상이 없습니다.");
    return;
  }

  // ER_PROCESSING 호출
  $NC.serviceCall("/ED04060E/callSaveXls.do", {
    P_QUERY_ID: "ES_LO_ORDER_XLS_REAL",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_UPLOAD_DATE: UPLOAD_DATE,
      P_DEFINE_NO: DEFINE_NO,
    })
  }, onSaveSucess, onSaveError);
}

/**
 * 처리버튼 결과
 */
function onSaveSucess(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  _Inquiry();
}

/**
 * 처리 실패 했을 경우 처리
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}

/**
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
//조회조건 - 송신정의 세팅
  setOutboundBatchCombo();
  onGetDefineNo();
}

/**
 * 물류센터/사업부/출고일자 값 변경시 출고차수 콤보 재설정
 */
function setOutboundBatchCombo() {

  // 조회조건 - 출고차수 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_OUTBOUND_BATCH",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_OUTBOUND_DATE: $NC.getValue("#dtpQUpload_Date"),
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
 * 조회조건 - 송신정의 세팅
 */
function onGetDefineNo() {

  $NC.setInitCombo("/ED04060E/getDataSet.do", {
    P_QUERY_ID: "ED04060E.RS_SUB",
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: $("#edtQBu_Cd").val()
    })
  }, {
    selector: "#cboQDefine_No",
    codeField: "DATA_DIV",
    fullNameField: "DEFINE_NO_F",
    onComplete: function() {
      $NC.setValue("#cboQDefine_No", 0);
      // 그리드 초기화
      $NC.clearGridData(G_GRDMASTER);
      grdMasterInitialize();
    }
  });
}
