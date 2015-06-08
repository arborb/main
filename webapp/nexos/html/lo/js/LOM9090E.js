/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
 // $NC.setGlobalVar();

  // 그리드 초기화
  grdT1MasterInitialize();
  grdT1DetailInitialize();

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
    }
  });

  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();

  // 조회조건 - 사업부 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  // 조회조건 - 입고일자에 달력이미지 설정
  $NC.setInitDatePicker("#dtpQInbound_Date1");
  $NC.setInitDatePicker("#dtpQInbound_Date2");

  // 조회조건 - 상품 초기값 설정
  $NC.setValue("#edtQItem_Cd");
  $NC.setValue("#edtQItem_Nm");

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQOwn_Brand_Cd").click(showOwnBranPopup);
  $("#btnQHaslocation_Cd").click(showLocationPopup);


  $NC.setInitDatePicker("#dtpQHas_Date1");
  $NC.setInitDatePicker("#dtpQHas_Date2");
  
  $("#btnQBu_Cd").click(showUserBuPopup);

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

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "HAS_END_YN",
      P_CODE_CD: "",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQEnd_Yn",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });

}

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
  $NC.resizeGrid("#grdT1Master", clientWidth, $("#grdT1Master").parent().height() - $NC.G_LAYOUT.header);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdT1Detail", clientWidth, $("#grdT1Detail").parent().height() - $NC.G_LAYOUT.header);

  
 
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
  case "OWN_BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
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
  case "HASLOCATION_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      CENTER_CD = $NC.getValue("#cboQCenter_Cd");
      P_QUERY_PARAMS = {
        P_CENTER_CD: CENTER_CD,
        P_ZONE_CD: "",
        P_BANK_CD: "",
        P_BAY_CD: "",
        P_LEV_CD: "",
        P_HASLOCATION_CD: val
      };
      O_RESULT_DATA = $NP.getLocation01Info({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onLocationPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showLocation01Popup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onLocationPopup, onLocationPopup);
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
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  
  var HAS_DATE1 = $NC.getValue("#dtpQHas_Date1");
  if ($NC.isNull(HAS_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQHas_Date1");
    return;
  }

  var HAS_DATE2 = $NC.getValue("#dtpQHas_Date2");
  if ($NC.isNull(HAS_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQHas_Date2");
    return;
  }

  if (HAS_DATE1 > HAS_DATE2) {
    alert("합포장일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQHas_Date1");
    return;
  }
  
  

  var END_YN_DIV = $NC.getValue("#cboQEnd_Yn");
  if ($NC.isNull(END_YN_DIV)) {
    alert("작업구분을 선택 입력하십시오.");
    $NC.setFocus("#cboQEnd_Yn");
    return;
  }

  var BU_NO = $NC.getValue("#edtQHas_No");
  var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm");
  var SHIPPER_NM = $NC.getValue("#edtShipper_Nm");
  var HASLOCATION_CD = $NC.getValue("#edtQHaslocation_Cd");

  // 조회시 값 초기화
  $NC.clearGridData(G_GRDT1MASTER);
  $NC.clearGridData(G_GRDT1DETAIL);

  G_GRDT1MASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_HAS_DATE1: HAS_DATE1,
    P_HAS_DATE2: HAS_DATE2,
    P_BU_NO: BU_NO,
    P_ORDERER_NM: ORDERER_NM,
    P_SHIPPER_NM: SHIPPER_NM,
    P_END_YN: END_YN_DIV,
    P_LOCATION_CD: HASLOCATION_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LOM9090E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

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

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "HAS_DATE",
    field: "HAS_DATE",
    name: "합포장일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션코드",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "HAS_NO",
    field: "HAS_NO",
    name: "HAS번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "END_YN",
    field: "END_YN",
    name: "처리구분",
    minWidth: 60,
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
    name: "전화번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_HP",
    field: "SHIPPER_HP",
    name: "휴대폰번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ZIP_CD",
    field: "SHIPPER_ZIP_CD",
    name: "수령자우편호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_BASIC",
    field: "SHIPPER_ADDR_BASIC",
    name: "수령자주소",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_DETAIL",
    field: "SHIPPER_ADDR_DETAIL",
    name: "수령자상세주소",
    minWidth: 160
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 입고중량등록탭의 상단그리드 초기화
 */
function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LOM9090E.RS_MASTER",
    sortCol: "HAS_DATE",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);


}


function grdT1DetailOnGetColumns() {

  var columns = [ ];

  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "합포장처리순번",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "END_YN",
    field: "END_YN",
    name: "처리구분",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    cssClass: "align-center",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ZONE_CD",
    field: "ZONE_CD",
    name: "존코드",
    minWidth: 40,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 입고중량등록탭의 하단그리드 초기화
 */
function grdT1DetailInitialize() {

  var options = {
    frozenColumn: 3,
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.END_YN == "C") {
          return "specialrow4";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Detail", {
    columns: grdT1DetailOnGetColumns(),
    queryId: "LOM9090E.RS_DETAIL1",
    sortCol: "LINE_NO",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);

}




/**
 * 입고중량등록탭 상단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
function grdT1MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  var rowData = G_GRDT1MASTER.data.getItem(row);

  if (G_GRDT1MASTER.lastRow != null) {
    if (row == G_GRDT1MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 값 초기화
  $NC.setInitGridVar(G_GRDT1DETAIL);
  $NC.setInitGridData(G_GRDT1DETAIL);
  $NC.setGridDisplayRows("#grdT1Detail", 0, 0);


  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  G_GRDT1DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_HAS_DATE: rowData.HAS_DATE,
    P_HAS_NO: rowData.HAS_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LOM9090E/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail);

  
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Master", row + 1);
}

/**
 * 입고중량등록탭 하단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
function grdT1DetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  var rowData = G_GRDT1DETAIL.data.getItem(row);

  if (G_GRDT1DETAIL.lastRow != null) {
    if (row == G_GRDT1DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Detail", row + 1);
}


function onGetT1Master(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);

  if (G_GRDT1MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1MASTER, {
        selectKey: "INBOUND_NO",
        selectVal: G_GRDT1MASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT1Master", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "1";

  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
}

/**
 * 입고중량등록 탭 하단 그리드에 데이터 표시처리
 */
function onGetT1Detail(ajaxData) {

  $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);

  if (G_GRDT1DETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1DETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1DETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1DETAIL, {
        selectKey: "ITEM_CD",
        selectVal: G_GRDT1DETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT1Detail", 0, 0);
  }
  G_GRDT1DETAIL.view.getCanvasNode().focus();
}


/**
 * 저장 처리 성공 했을 경우 처리
 */
function onSave(ajaxData) {

  var lastRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
  _Inquiry();
  G_GRDT1MASTER.lastKeyVal = lastRowData.INBOUND_NO;

}

/**
 * 저장 처리 실패 했을 경우 처리
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);

}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  $NC.setInitGridVar(G_GRDT1MASTER);
  $NC.setInitGridData(G_GRDT1MASTER);
  $NC.setGridDisplayRows("#grdT1Master", 0, 0);

  $NC.setInitGridVar(G_GRDT1DETAIL);
  $NC.setInitGridData(G_GRDT1DETAIL);
  $NC.setGridDisplayRows("#grdT1Detail", 0, 0);


}

/**
 * 검색조건의 로케이션 검색 이미지 클릭
 */
function showLocationPopup() {
  CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  $NP.showLocation01Popup({
    P_CENTER_CD: CENTER_CD,
    P_ZONE_CD: "",
    P_BANK_CD: "",
    P_BAY_CD: "",
    P_LEV_CD: "",
    P_LOCATION_CD: "%"
  }, onLocationPopup, function() {
    $NC.setFocus("#edtQHaslocation_Cd", true);
  });
}

/**
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
function onLocationPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQHaslocation_Cd", resultInfo.LOCATION_CD);
  } else {
    $NC.setValue("#edtQHaslocation_Cd");
    $NC.setFocus("#edtQHaslocation_Cd", true);
  }
  onChangingCondition();
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
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
    $NC.setFocus("#dtpQInvest_Date1", true);
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



function onGetPolicyVal(ajaxData) {

  var resultData = $NC.toArray(ajaxData);

  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
      $NC.G_VAR.policyVal[resultData.P_POLICY_CD] = resultData.O_POLICY_VAL;
      G_GRDT1DETAIL.view.setColumns(grdT1DetailOnGetColumns(resultData.O_POLICY_VAL));
    }
  }
}


/*------------------------------------------------------------*/
