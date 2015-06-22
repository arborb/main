/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 체크할 정책 값
    policyVal: {
      LI110: "", // 입고예정생성가능여부
      LI420: "", // 재고 관리 기준
      LI190: ""
    },
    // 진행가능/불가 값
    stateFWBW: {
      CONFIRM: "",// 진행가능
      CANCEL: "" // 진행불가
    }
  });
  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();
  // 상단그리드 초기화
  grdMasterInitialize();
  // 하단그리드 초기화
  grdDetailInitialize();

  // 브랜드 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
  
  if($NC.G_USERINFO.CERTIFY_DIV === "1"){
    $NC.setEnable("#btnProcClose", true);
  } else {
    $NC.setEnable("#btnProcClose", false);
  }

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQOwnBrand_Cd").click(showOwnBranPopup);
  $("#btnQVendor_Cd").click(showVendorBrandPopup);
  $("#btnProcClose").click(onBtnProcCloseClick);

  $NC.setInitDatePicker("#dtpQOrder_Date1");
  $NC.setInitDatePicker("#dtpQOrder_Date2");
  
  // 진행상태 콤보박스 세팅
  var cboObj = $("#cboQInbound_State").empty();
  var optionStr = "";
  optionStr += "<option value='%'>% - 전체</option>";
  optionStr += "<option value='10'>10 - 예정</option>";
  optionStr += "<option value='20'>20 - 등록</option>";
  optionStr += "<option value='30'>30 - 지시</option>";
  optionStr += "<option value='40'>40 - 확정</option>";
  optionStr += "<option value='50'>50 - 적치</option>";
  cboObj.append(optionStr);
  $NC.setValue("#cboQInbound_State", 1);

  // 조회조건 - 입고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "E1",
      P_SUB_CD2: "E2"
    })
  }, {
    selector: "#cboQInout_Cd",
    codeField: "CODE_CD",
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
      $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
      // 정책코드 취득
      setPolicyValInfo();
      // 진행불가/가능 취득
      setProcessStateInfo();
    }
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
    setPolicyValInfo();
    setProcessStateInfo();
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
  case "OWNBRAND_CD":
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
  case "ORDER_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "ORDER_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
  case "VENDOR_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_VENDOR_CD: val,
        P_VIEW_DIV: "2",
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      O_RESULT_DATA = $NP.getVendorBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onVendorBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showVendorBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onVendorBrandPopup, onVendorBrandPopup);
    }
    return;
  }

  // 화면클리어
  onChangingCondition();
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

  var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
  if ($NC.isNull(ORDER_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }

  var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
  if ($NC.isNull(ORDER_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date2");
    return;
  }

  if (ORDER_DATE1 > ORDER_DATE2) {
    alert("입고예정일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }
  

  var BU_NO = $NC.getValue("#edtQBu_No", true);
  var BRAND_CD = $NC.getValue("#edtQOwnBrand_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);
  var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);
  var INOUT_CD = $NC.getValue("#cboQInout_Cd");
  var INBOUND_STATE = $NC.getValue("#cboQInbound_State");

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
    P_ORDER_DATE1: ORDER_DATE1,
    P_ORDER_DATE2: ORDER_DATE2,
    P_INOUT_CD: INOUT_CD,
    P_VENDOR_CD: VENDOR_CD,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: ITEM_CD,
    P_ITEM_NM: ITEM_NM,
    P_INBOUND_STATE: INBOUND_STATE,
    P_BU_NO:  BU_NO,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });

  // 데이터 조회
  $NC.serviceCall("/LI01010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  // 입고예정생성가능여부가 "Y"일때만 신규등록 가능
  if ($NC.G_VAR.policyVal.LI110 !== "Y") {
    alert("입고예정정보 신규등록/수정이 불가능한 브랜드입니다.");
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  var CUST_CD = $NC.getValue("#edtQCust_Cd");
  var ORDER_DATE = $NC.getValue("#dtpQOrder_Date2");

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LI01011P",
    PROGRAM_NM: "입고예정등록/수정",
    url: "li/LI01011P.html",
    width: 1035,
    height: 600,
    userData: {
      P_PROCESS_CD: "N",
      P_CENTER_CD: CENTER_CD,
      P_CENTER_CD_F: CENTER_CD_F,
      P_BU_CD: BU_CD,
      P_BU_NM: BU_NM,
      P_CUST_CD: CUST_CD,
      P_ORDER_DATE: ORDER_DATE,
      P_CUST_CD: CUST_CD,
      P_POLICY_LI190: $NC.G_VAR.policyVal.LI190,
      P_POLICY_LI110: $NC.G_VAR.policyVal.LI110,
      P_POLICY_LI420: $NC.G_VAR.policyVal.LI420,
      P_MASTER_DS: {},
      P_DETAIL_DS: [ ]
    },
    onOk: function() {
      _Inquiry();
    }
  });

}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  var saveDS = [ ];
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var saveData = {
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_ORDER_DATE: rowData.ORDER_DATE,
    P_ORDER_NO: rowData.ORDER_NO,
    P_CRUD: rowData.CRUD
  };
  saveDS.push(saveData);
  if (saveDS.length > 0) {
    $NC.serviceCall("/LI01010E/delete.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: new Array("ORDER_DATE", "ORDER_NO"),
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 저장시 에러 발생 했을 경우 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (rowData.CRUD === "D") {
    rowData.CRUD = "U";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
    // 마지막 선택 Row 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  if (G_GRDMASTER.lastRow == null) {
    alert("삭제할 전표를 선택하십시오.");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if ($NC.G_VAR.stateFWBW.CANCEL != rowData.INBOUND_STATE) {
    alert("삭제가 불가능한 전표입니다.");
    return;
  }

  var result = confirm("예정전표를 삭제하시겠습니까?");
  if (result) {
    rowData.CRUD = "D";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
    _Save();
  }

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

  var processFormatter = function(row, cell, value, columnDef, dataContext) {
    if (dataContext.INBOUND_STATE === $NC.G_VAR.stateFWBW.CONFIRM) {
      return "<span class='ui-icon-next'>&nbsp;</span>";
    }
    return "<span class='ui-icon-prior'>&nbsp;</span>";
  };
  var grdStateFormatter = function(row, cell, value, columnDef, dataContext) {
    return "<span class='ui-icon-state-" + dataContext.INBOUND_STATE + "'>&nbsp;</span>";
  };

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "INBOUND_STATE_P",
    field: "INBOUND_STATE",
    name: "P",
    minWidth: 30,
    maxWidth: 30,
    sortable: false,
    formatter: processFormatter
  }, false);
  $NC.setGridColumn(columns, {
    id: "INBOUND_STATE_S",
    field: "INBOUND_STATE",
    name: "S",
    minWidth: 30,
    maxWidth: 30,
    sortable: false,
    formatter: grdStateFormatter
  }, false);
  $NC.setGridColumn(columns, {
    id: "INBOUND_STATE_D",
    field: "INBOUND_STATE_D",
    name: "진행상태",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_NO",
    field: "ORDER_NO",
    name: "예정번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "입고구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "INBOUND_DATE",
    field: "INBOUND_DATE",
    name: "입고일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INBOUND_NO",
    field: "INBOUND_NO",
    name: "입고번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_CD",
    field: "VENDOR_CD",
    name: "공급처",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "TOT_ORDER_QTY",
    field: "TOT_ORDER_QTY",
    name: "총예정수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CAR_NO",
    field: "CAR_NO",
    name: "차량번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_TYPE_NM",
    field: "SHIP_TYPE_NM",
    name: "입고운송구분",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_CD_NM",
    field: "CARRIER_CD_NM",
    name: "운송사구분",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "INBOUND_WB_NO",
    field: "INBOUND_WB_NO",
    name: "입고운송장",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_PRICE_TYPE_NM",
    field: "SHIP_PRICE_TYPE_NM",
    name: "운송비구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REFUND_SHIP_PRICE_CD_D",
    field: "REFUND_SHIP_PRICE_CD_D",
    name: "반품비부담자",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_PRICE",
    field: "SHIP_PRICE",
    name: "운송비금액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INORDER_TYPE_NM",
    field: "INORDER_TYPE_NM",
    name: "매입형태",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "PLANED_DATETIME",
    field: "PLANED_DATETIME",
    name: "도착예정일시",
    minWidth: 180,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "APPOINT_NO",
    field: "APPOINT_NO",
    name: "납품예약번호",
    minWidth: 80,
    cssClass: "align-center"
  });

  $NC.setGridColumn(columns, {
    id: "APPOINT_DATE",
    field: "APPOINT_DATE",
    name: "납품예약일자",
    minWidth: 120,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_USER_ID",
    field: "ORDER_USER_ID",
    name: "예정전표생성ID",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATETIME",
    field: "ORDER_DATETIME",
    name: "최종예정일시",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "REMARK2",
    field: "REMARK2",
    name: "비고",
    minWidth: 200
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
    queryId: "LI01010E.RS_MASTER",
    sortCol: "ORDER_DATE",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onDblClick.subscribe(grdMasterOnDblClick);
}

function grdDetailOnGetColumns(policyLI420) {

  if ($NC.isNull(policyLI420)) {
    policyLI420 = "1";
  }

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 50,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_DIV",
    field: "ITEM_DIV",
    name: "매입구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 80
  });
//  $NC.setGridColumn(columns, {
//    id: "ITEM_LOT",
//    field: "ITEM_LOT",
//    name: "LOT번호",
//    minWidth: 100
//  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REMAIN_QTY",
    field: "REMAIN_QTY",
    name: "미처리예정수량",
    minWidth: 110,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REMAIN_BOX",
    field: "REMAIN_BOX",
    name: "미처리예정BOX",
    minWidth: 110,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REMAIN_EA",
    field: "REMAIN_EA",
    name: "미처리예정EA",
    minWidth: 110,
    cssClass: "align-right"
  });
  if (policyLI420 == "2") {
    $NC.setGridColumn(columns, {
      id: "VALID_DATE",
      field: "VALID_DATE",
      name: "유통기한",
      minWidth: 100,
      cssClass: "align-center"
    });
//    $NC.setGridColumn(columns, {
//      id: "BATCH_NO",
//      field: "BATCH_NO",
//      name: "제조배치번호",
//      minWidth: 100
//    });
  }
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_WEIGHT",
    field: "ORDER_WEIGHT",
    name: "예정중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REMAIN_WEIGHT",
    field: "REMAIN_WEIGHT",
    name: "미처리예정중량",
    minWidth: 110,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_AMT",
    field: "BUY_AMT",
    name: "매입금액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VAT_AMT",
    field: "VAT_AMT",
    name: "부가세액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "APPOINT_LINE_NO",
    field: "APPOINT_LINE_NO",
    name: "납품예약순번",
    minWidth: 90
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 하단그리드 초기화
 */
function grdDetailInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "LI01010E.RS_DETAIL",
    sortCol: "LINE_NO",
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

  var rowData = G_GRDMASTER.data.getItem(row);
  G_GRDDETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_ORDER_DATE: rowData.ORDER_DATE,
    P_ORDER_NO: rowData.ORDER_NO,
    P_INBOUND_DATE: rowData.INBOUND_DATE,
    P_INBOUND_NO: rowData.INBOUND_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LI01010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);

}

/**
 * 상단그리드 더블 클릭 : 팝업 표시
 */
function grdMasterOnDblClick(e, args) {
//  if ($NC.G_USERINFO.CERTIFY_DIV !== '4') {
    if (G_GRDDETAIL.data.getLength() == 0) {
      return;
    }

    var permission = $NC.getProgramPermission();
    // 저장
    if (!permission.canSave) {
      alert("해당 프로그램의 저장권한이 없습니다.");
      return;
    }

    var masterRowData = G_GRDMASTER.data.getItem(args.row);
    
    if (masterRowData.INBOUND_STATE !== "10") {
      alert("진행상태가 [10 : 예정] 인 전표만 수정가능합니다. ");
      return;
    }
    
//    if (masterRowData.ORDER_USER_ID === "WMS_JOB" || masterRowData.ORDER_USER_ID === "INTERFACE") {
//      alert("인터페이스로 수신된 예정전표는 수정하실 수 없습니다.");
//      return;
//    }

    if (masterRowData) {
      // 조회후 상태가 바뀌었는지 한번더 상태 체크
      getInboundState({
        P_CENTER_CD: masterRowData.CENTER_CD,
        P_BU_CD: masterRowData.BU_CD,
        P_INBOUND_DATE: masterRowData.ORDER_DATE,
        P_INBOUND_NO: masterRowData.ORDER_NO,
        P_LINE_NO: "",
        P_PROCESS_CD: "A", // 프로세스코드([A]예정)
        P_STATE_DIV: "1" // 상태구분([1]MIN, [2]MAX)
      }, function(ajaxData) {

        var resultData = $NC.toArray(ajaxData);
        if (!$NC.isNull(resultData)) {
          if (resultData.O_MSG === "OK") {
            if (masterRowData.INBOUND_STATE !== resultData.O_INBOUND_STATE) {
              alert("[진행상태 : " + resultData.O_INBOUND_STATE + "] 데이터가 변경되었습니다.\n다시 조회 후 데이터를 확인하십시오.");
              return;
            }
          } else {
            alert(resultData.O_MSG);
            return;
          }
        } else {
          alert("입고진행상태를 확인하지 못했습니다.\n다시 처리하십시오.");
          return;
        }

        var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
        var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
        var BU_CD = $NC.getValue("#edtQBu_Cd");
        var BU_NM = $NC.getValue("#edtQBu_Nm");
        var CUST_CD = $NC.getValue("#edtQCust_Cd");

        var lastRowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
        var T = lastRowData.BRAND_CD;
        var C = lastRowData.BRAND_NM;

        $NC.G_MAIN.showProgramSubPopup({
          PROGRAM_ID: "LI01011P",
          PROGRAM_NM: "입고예정등록/수정",
          url: "li/LI01011P.html",
          width: 1024,
          height: 600,
          userData: {
            P_PROCESS_CD: "U",
            P_CENTER_CD: CENTER_CD,
            P_CENTER_CD_F: CENTER_CD_F,
            P_BU_CD: BU_CD,
            P_BU_NM: BU_NM,
            P_BRAND_CD: T,
            P_BRAND_NM: C,
            P_CUST_CD: CUST_CD,
            P_POLICY_LI190: $NC.G_VAR.policyVal.LI190,
            P_POLICY_LI110: $NC.G_VAR.policyVal.LI110,
            P_POLICY_LI420: $NC.G_VAR.policyVal.LI420,
            P_MASTER_DS: masterRowData,
            P_DETAIL_DS: G_GRDDETAIL.data.getItems()
          },
          onOk: function() {
            var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
            G_GRDMASTER.lastKeyVal = new Array(lastRowData.ORDER_DATE, lastRowData.ORDER_NO);
            onSave();
          }
        });
      });
    }
//  } else if ($NC.G_USERINFO.CERTIFY_DIV == '4') {
//    alert("신규 등록/수정 권한이 없습니다.");
//    return;
//  }
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
  $NC.G_VAR.buttons._new = "1";
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
        selectKey: "LINE_NO",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
  G_GRDDETAIL.view.getCanvasNode().focus();
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
 * 검색조건의 공급처 검색 팝업 클릭
 */
function showVendorBrandPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NP.showVendorBrandPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_VENDOR_CD: "%",
      P_VIEW_DIV: "2",
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }
  }, onVendorBrandPopup, function() {
    $NC.setFocus("#edtQVendor_Cd", true);
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
  onChangingCondition();
  setPolicyValInfo();
  setProcessStateInfo();
}

/**
 * 공급처 검색 결과
 * 
 * @param seletedRowData
 */
function onVendorBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQVendor_Cd", resultInfo.VENDOR_CD);
    $NC.setValue("#edtQVendor_Nm", resultInfo.VENDOR_NM);
  } else {
    $NC.setValue("#edtQVendor_Cd");
    $NC.setValue("#edtQVendor_Nm");
    $NC.setFocus("#edtQVendor_Cd", true);
  }
  onChangingCondition();
}

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
    $NC.setFocus("#edtQOwnBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQOwnBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQOwnBrand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQOwnBrand_Cd");
    $NC.setValue("#edtQOwnBrand_Nm");
    $NC.setFocus("#edtQOwnBrand_Cd", true);
  }
  onChangingCondition();
}

/**
 * 정책정보 취득
 */
function setPolicyValInfo() {

  $NC.G_VAR.policyVal.LI110 = "";
  $NC.G_VAR.policyVal.LI420 = "";

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCall("/LI01010E/callSP.do", {
      P_QUERY_ID: "WF.GET_POLICY_VAL",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_POLICY_CD: POLICY_CD
      })
    }, onGetPolicyVal);
  }
}

/**
 * 정책정보 취득후 처리
 * 
 * @param ajaxData
 */
function onGetPolicyVal(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
      $NC.G_VAR.policyVal[resultData.P_POLICY_CD] = resultData.O_POLICY_VAL;
      if (resultData.P_POLICY_CD != "LI420") {
        return;
      }
      // 재고관리기준에 따라 유효일자/배치번호별 표시/비표시
      var policyVal = resultData.O_POLICY_VAL;
      G_GRDDETAIL.view.setColumns(grdDetailOnGetColumns(policyVal));
    }
  }
}

/**
 * 미입고 종결처리 버튼
 */
function onBtnProcCloseClick(e) {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }
  
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  
  var result = confirm("[예정일자 : " + rowData.ORDER_DATE +"] [예정번호 : " + rowData.ORDER_NO + "]\n해당 전표를 종결처리하시겠습니까?");
  if (!result) {
    return;
  }

  $NC.serviceCall("/LI01010E/callSP.do", {
    P_QUERY_ID: "LI_BW_ORDER_CLOSE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_ORDER_DATE: rowData.ORDER_DATE,
      P_ORDER_NO: rowData.ORDER_NO,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onCloseSuccess);
}

function onCloseSuccess(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      alert(resultData.O_MSG);
    } else {
      alert("종결처리가 완료되었습니다.");
    }
  }

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: new Array("ORDER_DATE", "ORDER_NO")
  });

  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;

}

/**
 * 진행불가/가능 정보 취득
 */
function setProcessStateInfo() {

  $NC.G_VAR.stateFWBW.CONFIRM = "";
  $NC.G_VAR.stateFWBW.CANCEL = "";

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  // 데이터 조회
  $NC.serviceCall("/LI01010E/callSP.do", {
    P_QUERY_ID: "WF.GET_PROCESS_STATE_FWBW",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_PROCESS_GRP: "LI",
      P_PROCESS_CD: "A"
    })
  }, onGetProcessState);
}

/**
 * 진행불가/가능 정보 취득 후 처리
 * 
 * @param ajaxData
 */
function onGetProcessState(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
      $NC.G_VAR.stateFWBW.CONFIRM = $NC.nullToDefault(resultData.O_STATE_CONFIRM, "");
      $NC.G_VAR.stateFWBW.CANCEL = $NC.nullToDefault(resultData.O_STATE_CANCEL, "");
    }
  }
}

/**
 * 입고상태 조회
 * 
 * @param params
 * @param onSuccess
 */
function getInboundState(params, onSuccess) {

  // 데이터 조회
  $NC.serviceCall("/LI01010E/callSP.do", {
    P_QUERY_ID: "WF.GET_LI_INBOUND_STATE",
    P_QUERY_PARAMS: $NC.getParams(params)
  }, onSuccess);
}
