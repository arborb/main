/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });
  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();

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
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  // 조회조건 - 운송사 세팅
  $NC.setValue("#edtQCarrier_Cd");
  $NC.setValue("#edtQCarrier_Nm");

  // 조회조건 - 차량 세팅
  $NC.setValue("#edtQCar_Cd");
  $NC.setValue("#edtQCar_Nm");

  // 조회조건 - 배송처 세팅
  $NC.setValue("#edtQDelivery_Cd");
  $NC.setValue("#edtQDelivery_Nm");

  // 정산일자에 달력이미지 설정
  $NC.setInitDatePicker("#dtpQAdjust_Date1", $NC.G_USERINFO.LOGIN_DATE, "F");
  $NC.setInitDatePicker("#dtpQAdjust_Date2");

  // 조회조건 - 정산항목 세팅
  $NC.setInitCombo("/LF03030E/getDataSet.do", {
    P_QUERY_ID: "LF03030E.RS_SUB1",
    P_QUERY_PARAMS: $NC.getParams("{}")
  }, {
    selector: "#cboQFee_Head_Cd",
    codeField: "FEE_HEAD_CD",
    nameField: "FEE_HEAD_NM",
    fullNameField: "FEE_HEAD_CD_F",
    onComplete: function() {
      // 조회조건 - 정산세부 세팅
      onGetFeeBaseCd();
    }
  });
  
  // 조회조건 - 출고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "DM",
      P_SUB_CD2: "EM"
    })
  }, {
    selector: "#cboQInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true,
    onComplete: null
  });

  // 사업부 검색 이미지 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showBuBrandPopup);
  // 운송사 검색 이미지 클릭
  $("#btnQCarrier").click(showCarrierPopup);
  // 차량 검색 이미지 클릭
  $("#btnQCar").click(showCarPopup);
  // 배송처 검색 이미지 클릭
  $("#btnQDelivery").click(showDeliveryPopup);
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
  case "ADJUST_DATE1":
    $NC.setValueDatePicker(view, val, "정산 시작일자를 정확히 입력하십시오.");
    break;
  case "ADJUST_DATE2":
    $NC.setValueDatePicker(view, val, "정산 종료일자를 정확히 입력하십시오.");
    break;
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
  case "CAR_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_CAR_CD: val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getCarInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onCarPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showCarPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onCarPopup, onCarPopup);
    }
    return;
  case "DELIVERY_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_DELIVERY_CD: val,
        P_DELIVERY_DIV: "%",
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getDeliveryInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onDeliveryPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showDeliveryPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onDeliveryPopup, onDeliveryPopup);
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
  var ADJUST_DATE1 = $NC.getValue("#dtpQAdjust_Date1");
  if ($NC.isNull(ADJUST_DATE1)) {
    alert("정산 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Date1");
    return;
  }
  var ADJUST_DATE2 = $NC.getValue("#dtpQAdjust_Date2");
  if ($NC.isNull(ADJUST_DATE2)) {
    alert("정산 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Date2");
    return;
  }
  var FEE_HEAD_CD = $NC.getValue("#cboQFee_Head_Cd");
  if ($NC.isNull(FEE_HEAD_CD)) {
    alert("정산항목을 선택하십시오.");
    $NC.setFocus("#cboQFee_Head_Cd");
    return;
  }
  var FEE_BASE_CD = $NC.getValue("#cboQFee_Base_Cd");
  if ($NC.isNull(FEE_BASE_CD)) {
    alert("정산세부를 선택하십시오.");
    $NC.setFocus("#cboQFee_Base_Cd");
    return;
  }
  var INOUT_CD = $NC.getValue("#cboQInout_Cd");
  if ($NC.isNull(INOUT_CD)) {
    alert("출고구분을 선택하십시오.");
    $NC.setFocus("#cboQInout_Cd");
    return;
  }
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var DEAL_ID = $NC.getValue("#edtQDeal_Id");
  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  var ITEM_NM = $NC.getValue("#edtQItem_Nm");
  var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd", true);
  var CAR_CD = $NC.getValue("#edtQCar_Cd", true);
  var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);

  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_ADJUST_DATE1: ADJUST_DATE1,
    P_ADJUST_DATE2: ADJUST_DATE2,
    P_FEE_HEAD_CD: FEE_HEAD_CD,
    P_FEE_BASE_CD: FEE_BASE_CD,
    P_CARRIER_CD: CARRIER_CD,
    P_CAR_CD: CAR_CD,
    P_DELIVERY_CD: DELIVERY_CD,
    P_ITEM_CD: ITEM_CD,
    P_ITEM_NM: ITEM_NM,
    P_BRAND_CD: BRAND_CD,
    P_DEAL_ID: DEAL_ID,
    P_INOUT_CD: INOUT_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LF03030E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  // 현재 수정모드면
  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }

  var saveMasterDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CARRIER_CD: rowData.CARRIER_CD,
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_ADJUST_MONTH: rowData.ADJUST_MONTH,
        P_ADJUST_DATE: rowData.ADJUST_DATE,
        P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
        P_FEE_BASE_CD: rowData.FEE_BASE_CD,
        P_CAR_CD: rowData.CAR_CD,
        P_CUST_CD: rowData.CUST_CD,
        P_VENDOR_CD: rowData.VENDOR_CD,
        P_DELIVERY_CD: rowData.DELIVERY_CD,
        P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
        P_KEEP_DIV: rowData.KEEP_DIV,
        P_DEPART_CD: rowData.DEPART_CD,
        P_LINE_CD: rowData.LINE_CD,
        P_PERIOD_DIV: rowData.PERIOD_DIV,
        P_CLASS_CD: rowData.CLASS_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ADJUST_FEE_AMT: rowData.ADJUST_FEE_AMT,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveMasterDS.push(saveData);
    }
  }

  if (saveMasterDS.length > 0) {
    $NC.serviceCall("/LF03030E/save.do", {
      P_DS_MASTER: $NC.toJson(saveMasterDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
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

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: ["ADJUST_DATE", "CAR_CD", "CUST_CD", "DELIVERY_CD", "ITEM_CD", "BRAND_CD"],
    isCancel: true
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
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
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜번호",
    minWidth: 90,
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "출고구분",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "판매사코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "판매사명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "UNIT_DIV_D",
    field: "UNIT_DIV_D",
    name: "정산단위",
    cssClass: "align-right",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "FEE_QTY",
    field: "FEE_QTY",
    name: "정산수량",
    cssClass: "align-right",
    minWidth: 90,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "UNIT_PRICE",
    field: "UNIT_PRICE",
    name: "정산단가",
    cssClass: "align-right",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "FEE_AMT",
    field: "FEE_AMT",
    name: "정산금액",
    cssClass: "align-right",
    minWidth: 90,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_FEE_AMT",
    field: "ADJUST_FEE_AMT",
    name: "최종정산금액",
    cssClass: "align-right",
    minWidth: 90,
    editor: Slick.Editors.Number,
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_CD",
    field: "CARRIER_CD",
    name: "운송사",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_NM",
    field: "CARRIER_NM",
    name: "운송사명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_DATE",
    field: "ADJUST_DATE",
    name: "정산일자",
    cssClass: "align-center",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CAR_CD",
    field: "CAR_CD",
    name: "차량코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CAR_NM",
    field: "CAR_NM",
    name: "차량명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "배송처",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_NM",
    field: "DELIVERY_NM",
    name: "배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 배송청구수수료 상세내역
 */
function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 2,
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LF03030E.RS_MASTER",
    sortCol: "ADJUST_DATE",
    gridOptions: options
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
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
 * 그리드의 편집 셀 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnCellChange(e, args) {

  var rowData = args.item;
  if (G_GRDMASTER.lastRow == null) return;

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;

}

/**
 * 배송수수료 상세내역 조회
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
        selectKey: ["ADJUST_DATE", "CAR_CD", "CUST_CD", "DELIVERY_CD", "ITEM_CD", "BRAND_CD"],
        selectVal: G_GRDMASTER.lastKeyVal,
        activeCell: true
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 조회조건 - 정산세부 세팅
 */
function onGetFeeBaseCd() {

  $NC.setInitCombo("/LF03030E/getDataSet.do", {
    P_QUERY_ID: "LF03030E.RS_SUB2",
    P_QUERY_PARAMS: $NC.getParams({
      P_FEE_HEAD_CD: $NC.getValue("#cboQFee_Head_Cd")
    })
  }, {
    selector: "#cboQFee_Base_Cd",
    codeField: "FEE_BASE_CD",
    nameField: "FEE_BASE_NM",
    fullNameField: "FEE_BASE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboQFee_Base_Cd", 0);
    }
  });
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
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
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
 * 검색조건의 차량 검색 이미지 클릭
 */
function showCarPopup() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");

  $NP.showCarPopup({
    P_CENTER_CD: CENTER_CD,
    P_CAR_CD: "%",
    P_VIEW_DIV: "2"
  }, onCarPopup, function() {
    $NC.setFocus("#edtQCar_Cd", true);
  });
}

function onCarPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQCar_Cd", resultInfo.CAR_CD);
    $NC.setValue("#edtQCar_Nm", resultInfo.CAR_NM);
  } else {
    $NC.setValue("#edtQCar_Cd");
    $NC.setValue("#edtQCar_Nm");
    $NC.setFocus("#edtQCar_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 배송처 검색 이미지 클릭
 */

function showDeliveryPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NP.showDeliveryPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_DELIVERY_CD: "%",
      P_DELIVERY_DIV: "%",
      P_VIEW_DIV: "2"
    }
  }, onDeliveryPopup, function() {
    $NC.setFocus("#edtQDelivery_Cd", true);
  });
}

function onDeliveryPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQDelivery_Cd", resultInfo.DELIVERY_CD);
    $NC.setValue("#edtQDelivery_Nm", resultInfo.DELIVERY_NM);
  } else {
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");
    $NC.setFocus("#edtQDelivery_Cd", true);
  }
  onChangingCondition();
}

/**
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: ["ADJUST_DATE", "CAR_CD", "CUST_CD", "DELIVERY_CD", "ITEM_CD", "BRAND_CD"]
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 저장에 실패 했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);

}
