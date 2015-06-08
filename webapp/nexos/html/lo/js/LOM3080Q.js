/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({

  });


  // 상단그리드 초기화
  grdMasterInitialize();
  // 하단그리드 초기화
  grdDetailInitialize();

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
  
  // 조회조건 - 물류센터 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CSUSERCENTER",
    P_QUERY_PARAMS: $NC.getParams({
      P_USER_ID: $NC.G_USERINFO.USER_ID,
      P_CENTER_CD: "%"
    })
  }, {
    selector: "#cboQCenter_Cd_To",
    codeField: "CENTER_CD",
    nameField: "CENTER_NM",
    onComplete: function() {
      $NC.setValue("#cboQCenter_Cd_To", $NC.G_USERINFO.CENTER_CD);
    }
  });

  // 조회조건 - 출고구분 세팅
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

  // 조회조건 - 몰구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMMALL",
    P_QUERY_PARAMS: $NC.getParams({
      P_MALL_CD: "%"
    })
  }, {
    selector: "#cboQMall_Cd",
    codeField: "MALL_CD",
    nameField: "MALL_NM",
    fullNameField: "MALL_CD_F",
    addAll: true
  });

  // 조회조건 - 매입형태 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "BUY_TYPE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQInorder_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });

  // 조회조건 - 배송지역구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "DELIVERY_ROUTE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQDelivery_Type2",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });

  // 조회조건 - 운송구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "IN_TRANS_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQShip_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });

  // 조회조건 - 운송비구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "TRANS_FEE_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQShip_Price_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
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

  // 입력조건 - 종결사유 세팅
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
    fullNameField: "CODE_CD_F",    
    onComplete: function() {
      $NC.setValue("#cboShortage_Div");
    }
      
  });
  
  // 사업구분 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnChangeCenter").click(Center_Ch);
  $("#btnQOwn_Brand_Cd").click(showOwnBranPopup);
  $("#btnQBrand_Cd").click(showBrandPopup);

  $NC.setInitDatePicker("#dtpQOrder_Date1");
  $NC.setInitDatePicker("#dtpQOrder_Date2");

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
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBrandPopup, onBrandPopup);
    }
    return;
  case "ORDER_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "ORDER_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
  case "DELIVERY_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_DELIVERY_CD: val,
        P_DELIVERY_DIV: "92",// 92 - 온라인몰
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getDeliveryInfo({
        queryParams: P_QUERY_PARAMS,
        errorMessage: "등록되어 있지 않은 온라인몰입니다."
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onDeliveryPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showDeliveryPopup({
        title: "온라인몰 검색",
        columnTitle: ["온라인몰코드", "온라인몰명"],
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onDeliveryPopup, onDeliveryPopup);
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
    alert("출고예정일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }

  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);
  // var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
  var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm", true);
  var SHIPPER_NM = $NC.getValue("#edtQShipper_Nm", true);
  var BU_NO = $NC.getValue("#edtQBu_No", true);
  var OWN_BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var DEAL_ID = $NC.getValue("#edtQDeal_Id", true);

  // 그리드 클리어
  $NC.setInitGridData(G_GRDMASTER);
  $NC.setGridDisplayRows("#grdMaster", 0, 0);
  $NC.setInitGridData(G_GRDDETAIL);
  $NC.setGridDisplayRows("#grdDetail", 0, 0);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  $NC.setInitGridVar(G_GRDDETAIL);

  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_ORDER_DATE1: ORDER_DATE1,
    P_ORDER_DATE2: ORDER_DATE2,
    P_INOUT_CD: $NC.getValue("#cboQInout_Cd"),
    P_BU_NO: BU_NO,
    P_OWN_BRAND_CD: OWN_BRAND_CD,
    P_ITEM_CD: ITEM_CD,
    P_ITEM_NM: ITEM_NM,
    // P_DELIVERY_CD: DELIVERY_CD,
    P_ORDERER_NM: ORDERER_NM,
    P_SHIPPER_NM: SHIPPER_NM,
    P_MALL_CD: $NC.getValue("#cboQMall_Cd"),
    P_INORDER_TYPE: '%',//$NC.getValue("#cboQInorder_Type"),
    P_SHIP_TYPE: '%',//$NC.getValue("#cboQShip_Type"),
    P_SHIP_PRICE_TYPE: '%',// $NC.getValue("#cboQShip_Price_Type"),
    P_DEAL_ID: DEAL_ID,
    P_DELIVERY_TYPE: '%',//$NC.getValue("#cboQDelivery_Type"),
    P_DELIVERY_TYPE2: '%',//$NC.getValue("#cboQDelivery_Type2"),
    P_BRAND_CD: BRAND_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });

  // 데이터 조회
  $NC.serviceCall("/LOM3080Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

}




function grdMasterOnGetColumns() {


  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    width: 30,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
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
    name: "출고구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_STATE_D",
    field: "OUTBOUND_STATE_D",
    name: "진행상태",
    minWidth: 80
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
    id: "ORDER_DIV_D",
    field: "ORDER_DIV_D",
    name: "주문구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "TOT_ORDER_QTY",
    field: "TOT_ORDER_QTY",
    name: "총예정수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "총금액",
    minWidth: 100,
    cssClass: "align-right"
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
    id: "BU_KEY",
    field: "BU_KEY",
    name: "전표ID",
    minWidth: 90
  });

  $NC.setGridColumn(columns, {
    id: "BRAND_CD_D",
    field: "BRAND_CD_D",
    name: "판매사코드",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM_D",
    field: "BRAND_NM_D",
    name: "판매사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "MALL_CD_D",
    field: "MALL_CD_D",
    name: "MALL명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_TYPE2_D",
    field: "DELIVERY_TYPE2_D",
    name: "배송지역구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_TYPE_D",
    field: "SHIP_TYPE_D",
    name: "운송구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_PRICE_TYPE_D",
    field: "SHIP_PRICE_TYPE_D",
    name: "운송비구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_PRICE",
    field: "SHIP_PRICE",
    name: "운송비",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_TYPE_D",
    field: "DELIVERY_TYPE_D",
    name: "배송유형",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MALL_MSG",
    field: "MALL_MSG",
    name: "온라인몰메시지",
    minWidth: 140
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
    id: "SHIPPER_ADDR",
    field: "SHIPPER_ADDR",
    name: "주소",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_MSG",
    field: "ORDERER_MSG",
    name: "배송메시지",
    minWidth: 130
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
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

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 상단그리드 초기화
 */
function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 4,
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.BACKORDER_YN == "Y") {
          return "specialrow4";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LOM3080Q.RS_MASTER",
    sortCol: "ORDER_DATE",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);

  G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
  
}



function grdMasterOnHeaderClick(e, args) {

  G_GRDMASTER.view.getCanvasNode().focus();

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDMASTER.data.getLength();
      var rowData;
      G_GRDMASTER.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDMASTER.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDMASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTER.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}


function _OnGridCheckBoxFormatterClick(e, view, args) {

  if (args.grid == "grdMaster") {
    if (G_GRDMASTER.view.getEditorLock().isActive()) {
      G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
    }

    $NC.setGridSelectRow(G_GRDMASTER, args.row);

    var rowData = G_GRDMASTER.data.getItem(args.row);

    if (args.cell == G_GRDMASTER.view.getColumnIndex("CHECK_YN")) {
      rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
    }

    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }
 
}



function grdDetailOnGetColumns() {



  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 50,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "위탁사",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "위탁사명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 80
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
    name: "옵션ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션명",
    minWidth: 150
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
    id: "ITEM_DIV_D",
    field: "ITEM_DIV_D",
    name: "상품구분",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_QTY",
    field: "OPTION_QTY",
    name: "옵션수량",
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
    id: "ORDER_BOX",
    field: "ORDER_BOX",
    name: "예정BOX",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_EA",
    field: "ORDER_EA",
    name: "예정EA",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUPPLY_PRICE",
    field: "SUPPLY_PRICE",
    name: "공급단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_PRICE",
    field: "DC_PRICE",
    name: "할인단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "APPLY_PRICE",
    field: "APPLY_PRICE",
    name: "적용단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUPPLY_AMT",
    field: "SUPPLY_AMT",
    name: "공급금액",
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
    id: "DC_AMT",
    field: "DC_AMT",
    name: "할인금액",
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
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_ORDER_DIV_F",
    field: "ITEM_ORDER_DIV_F",
    name: "상품주문유형",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
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
    queryId: "LOM3080Q.RS_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);

}

/**
 * 상단 그리드 행 클릭시 checkbox 선택/선택해제시 그리드에 값 설정
 * 
 * @param e
 * @param args
 */
function grdMasterOnClick(e, args) {

  G_GRDDETAIL.view.getCanvasNode().focus();

}


/**
 * 검색조건의 사업구분 검색 이미지 클릭
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

  // 브랜드 조회조건 초기화
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");

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
  G_GRDDETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_ORDER_DATE: rowData.ORDER_DATE,
    P_ORDER_NO: rowData.ORDER_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LOM3080Q/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);

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

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    onGetDetail({
      data: null
    });
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

  
  // 초기화
  $NC.clearGridData(G_GRDMASTER);
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
 * 검색조건의 온라인몰 검색 이미지 클릭
 */
function showDeliveryPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NP.showDeliveryPopup({
    title: "온라인몰 검색",
    columnTitle: ["온라인몰코드", "온라인몰명"],
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_DELIVERY_CD: "%",
      P_DELIVERY_DIV: "92",// 92 - 온라인몰
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
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBrandPopup() {
  $NP.showBrandPopup({
    P_BRAND_CD: '%',
    P_VIEW_DIV: '2'
  }, onBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
}



function Center_Ch() {
  
  
  var rowCount = G_GRDMASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }



  closingDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
        chkCnt++;
        var Ms = {
          P_CENTER_CD_FROM: $NC.getValue("#cboQCenter_Cd"),
          P_CENTER_CD_TO: $NC.getValue("#cboQCenter_Cd_To"),
          P_BU_CD: $NC.getValue("#edtQBu_Cd"),
          P_ORDER_DATE: rowData.ORDER_DATE,
          P_ORDER_NO: rowData.ORDER_NO
        };
        closingDS.push(Ms);
    }
  }
  if (chkCnt == 0) {
    alert("처리대상이 없습니다. 선택하십시오.");
    return;
  }

    $NC.serviceCall("/LOM3080Q/callCenterUpdate.do", {
      P_DS_MASTER: $NC.getParams(closingDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onCenterok, onSaveError);
}

function onCenterok(ajaxData) {

  var resultData = $NC.toArray(ajaxData);

  if (!$NC.isNull(resultData)) {
    alert(resultData.RESULT_DATA );
    //return;
  }
  _Inquiry();
}


function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}





