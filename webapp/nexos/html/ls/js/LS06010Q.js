/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 현재 액티브된 뷰 및 그리드 정보
    activeView: {
      container: "",
      master: null,
      grdMaster: null,
    }
  });


  // 탭 초기화
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // ///////////////////////////////////////////////////////////////

  // 그리드 초기화
  grdMasterInitialize();
  grdDetail3Initialize();
  grdDetail1Initialize();
  grdDetail2Initialize();

  grdT2MasterInitialize();

  grdT3MasterInitialize();
  grdT2DetailInitialize();

  $NC.G_VAR.activeView.master = "#grdMaster";
  $NC.G_VAR.activeView.grdMaster = G_GRDMASTER;

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

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  
  


  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showOwnBranPopup);
  $("#btnQMall_Brand_Cd").click(showSellerPopup);
  $("#btnQDeal_Id").click(showBrandDealPopup);
  $("#btnExcel").click(Onexcel);
  
  
  $NC.setInitDatePicker("#dtpQOutbound_Date");

  $NC.setEnable("#dtpQOutbound_Date", false);
  
  $NC.setInitDatePicker("#dtpQContract_Date", $NC.G_USERINFO.LOGIN_DATE, "F");

  G_GRDMASTER.focused = true;
}

function _OnLoaded() {

  // 스플리터 초기화
  $NC.setInitSplitter("#divSplitterArea1", "h", 400, 100, 100);
  $("#divSplitterArea2").children("div:first").width(100);
  $NC.setInitSplitter("#divSplitterArea2", "v", 300);

  $NC.setInitSplitter("#divT2DetailView", "v",  1000);
}

function _SetResizeOffset() {

  // 화면 리사이즈 Offset 계산
  $NC.G_OFFSET.gridDetail1Height = 250;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
    $NC.G_OFFSET.tabHeaderHeight = $("#divMasterView").children(".ui-tabs-nav:first").outerHeight();

}

/**
 * Window Resize Event - Window Size 조정시호출 됨
 */
function _OnResize(parent) {

  if ($("#divMasterView").tabs("option", "active") === 0) {
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  var container = $("#divSplitterArea1");
  $NC.resizeContainer(container, clientWidth, clientHeight);

  var splitTopAreaHeight = $("#grdMaster").parent().height();
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, splitTopAreaHeight - $NC.G_LAYOUT.header);


  var splitBottomAreaHeight = $("#grdDetail3").parent().height();
  var splitBottomLeftAreaWidth = $("#grdDetail1").parent().width();

  var splitBottomRightAreaWidth = $("#grdDetail3").parent().width();
  clientHeight = splitBottomAreaHeight;

  // Splitter 높이 조정
  container = $("#divSplitterArea2");
  var height = $NC.G_OFFSET.gridDetail1Height - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail1", splitBottomLeftAreaWidth, height);

  height = splitBottomAreaHeight - $NC.G_OFFSET.gridDetail1Height - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail2", splitBottomLeftAreaWidth, height);

  height = splitBottomAreaHeight - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail3", splitBottomRightAreaWidth, height);
  } else{

    var clientWidth1 = parent.width() - $NC.G_LAYOUT.border1 * 2; /* 탭일 경우는 좌우 */
    var clientHeight1 = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_LAYOUT.border1;

    $NC.resizeContainer("#divMasterView", clientWidth1, clientHeight1);

    clientWidth1 -= $NC.G_LAYOUT.border1;
    clientHeight1 -= ($NC.G_OFFSET.tabHeaderHeight + $NC.G_LAYOUT.border1);



    // Splitter 컨테이너 크기 조정
    var container = $("#divT2DetailView");
    $NC.resizeContainer(container, clientWidth1, clientHeight1);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Master", $("#grdT2Master").parent().width(), clientHeight1 - $NC.G_LAYOUT.header);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Detail", $("#grdT2Detail").parent().width(), clientHeight1 - $NC.G_LAYOUT.header);
  }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

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
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.getValue("#edtQBu_Cd", true);
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
  case "MALL_BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: BRAND_CD,
        P_SELLER_CD: val
      };
      O_RESULT_DATA = $NP.getSellerInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onSellerPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showSellerPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onSellerPopup, onSellerPopup);
    }
    return;
  case "DEAL_ID":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BU_CD = $NC.getValue("#edtQBu_Cd", true);
      var OWN_BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
      var SELLER_CD = $NC.getValue("#edtQMall_Brand_Cd", true);
      
      P_QUERY_PARAMS = {
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: OWN_BRAND_CD,
        P_SELLER_CD: SELLER_CD,
        P_DEAL_ID: val
      };
      O_RESULT_DATA = $NP.getBrandDealInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBrandDealPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showBrandDealPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBrandDealPopup, onBrandDealPopup);
    }
    return;
  case "CONTRACT_DATE":
    if (!$NC.isNull(val)) {
      $NC.setValueDatePicker(view, val, "계약일자를 정확히 입력하십시오.");
    }
    break;
  }

  onChangingCondition();
}

function tabOnActivate(event, ui) {
  var id = ui.newTab.prop("id").substr(3).toUpperCase();
  var container;
  if (id === "TAB1") {
    container = "#divT1DetailView";
  } else {
    container = "#divT2DetailView";

    // 스플리터 초기화
    $NC.setInitSplitter(container, "v", 600);
  }
  // 스플리터가 초기화가 되어 있으면 _OnResize 호출
  if ($NC.isSplitter(container)) {
    // 스필리터를 통한 _OnResize 호출
    $(container).trigger("resize");
  } else {
  }

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */


function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  $NC.setInitGridVar(G_GRDDETAIL1);
  $NC.setInitGridVar(G_GRDDETAIL2);
  $NC.setInitGridVar(G_GRDDETAIL3);

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var OWN_BRAND_CD = $NC.getValue("#edtQBrand_Cd");
  var BRAND_CD = $NC.getValue("#edtQMall_Brand_Cd");
  var DEAL_ID = $NC.getValue("#edtQDeal_Id");
  var OUT_DATE = $NC.getValue("#dtpQOutbound_Date");

  // 상품별 입고내역 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {
  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
     P_BU_CD: BU_CD             
    ,P_OWN_BRAND_CD: OWN_BRAND_CD                 
    ,P_BRAND_CD: BRAND_CD     
    ,P_DEAL_ID:  DEAL_ID           
    ,P_OUT_DATE: OUT_DATE                    
    ,P_USER_ID: $NC.G_USERINFO.USER_ID
      });
  // 데이터 조회
  $NC.serviceCall("/LS06010Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
  } else {
    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_BU_CD: BU_CD             
     ,P_OWN_BRAND_CD: OWN_BRAND_CD                 
     ,P_BRAND_CD: BRAND_CD     
     ,P_DEAL_ID:  DEAL_ID           
     ,P_OUT_DATE: OUT_DATE                    
     ,P_USER_ID: $NC.G_USERINFO.USER_ID
       });
   // 데이터 조회
    $NC.serviceCall("/LS06010Q/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
    
    
    G_GRDT3MASTER.queryParams = $NC.getParams({
      P_BU_CD: BU_CD             
     ,P_OWN_BRAND_CD: OWN_BRAND_CD                 
     ,P_BRAND_CD: BRAND_CD     
     ,P_DEAL_ID:  DEAL_ID           
     ,P_OUT_DATE: OUT_DATE                    
     ,P_USER_ID: $NC.G_USERINFO.USER_ID
       });
   // 데이터 조회
    $NC.serviceCall("/LS06010Q/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetT3Master);
    
  }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

}

function onChangingCondition() {

  // 전역 변수 값 초기화
  $NC.clearGridData(G_GRDMASTER);
  $NC.clearGridData(G_GRDDETAIL1);
  $NC.clearGridData(G_GRDDETAIL2);
  $NC.clearGridData(G_GRDDETAIL3);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_CD",
    field: "OWN_BRAND_CD",
    name: "위탁사",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_NM",
    field: "OWN_BRAND_NM",
    name: "위탁사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "판매사",
    minWidth: 100
  });

  $NC.setGridColumn(columns, {
    id: "BRAND_NM1",
    field: "BRAND_NM",
    name: "판매사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_DIV",
    field: "DEAL_DIV",
    name: "거래구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OPEN_DATE",
    field: "OPEN_DATE",
    name: "거래시작일자",
    minWidth: 120,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CLOSE_DATE",
    field: "CLOSE_DATE",
    name: "거래종료일자",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 90,
    cssClass: "align-right"
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LS06010Q.RS_MASTER",
    sortCol: "DEAL_ID",
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
  var rowData = G_GRDMASTER.data.getItem(row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL1);
  $NC.setInitGridVar(G_GRDDETAIL2);
  $NC.setInitGridVar(G_GRDDETAIL3);
    onGetDetail1({
      data: null
    });
    onGetDetail2({
      data: null
    });
    onGetDetail3({
      data: null
    });

    
    /* 보관유형별 수수료 */
    // 파라메터 세팅
    G_GRDDETAIL1.queryParams = $NC.getParams({
      P_BU_CD: rowData.BU_CD,
      P_OWN_BRAND_CD: rowData.OWN_BRAND_CD,
      P_BRAND_CD: rowData.BRAND_CD,
      P_DEAL_ID: rowData.DEAL_ID,
      P_OPTION_ID: rowData.OPTION_ID,
      P_OUT_DATE: OUT_DATE,
      P_USER_ID:  $NC.G_USERINFO.USER_ID,
    });
    // 데이터 조회
    $NC.serviceCall("/LS06010Q/getDataSet.do", $NC.getGridParams(G_GRDDETAIL1), onGetDetail1);

    
    var OUT_DATE = $NC.getValue("#dtpQOutbound_Date");
    // 파라메터 세팅
    G_GRDDETAIL3.queryParams = $NC.getParams({
      P_BU_CD: rowData.BU_CD,
      P_OWN_BRAND_CD: rowData.OWN_BRAND_CD,
      P_BRAND_CD: rowData.BRAND_CD,
      P_DEAL_ID: rowData.DEAL_ID,
      P_OUT_DATE: rowData.OUT_DATE,
      P_USER_ID: $NC.G_USERINFO.USER_ID,
      
    });
    // 데이터 조회
    $NC.serviceCall("/LS06010Q/getDataSet.do", $NC.getGridParams(G_GRDDETAIL3), onGetDetail3);



  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}


function grdDetail1OnGetColumns() {

  var columns = [ ];
 
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 80,
    width: 100,
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 80,
    width: 100,
  });
  $NC.setGridColumn(columns, {
    id: "ABLE_QTY",
    field: "ABLE_QTY",
    name: "판매가능수량",
    minWidth: 80,
    width: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 80,
    width: 100,
    cssClass: "align-right"
  });

  $NC.setGridColumn(columns, {
    id: "SAFETY_QTY",
    field: "SAFETY_QTY",
    name: "안전재고수량",
    minWidth: 80,
    width: 100,
    cssClass: "align-right"
  });

  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "출고진행수량",
    minWidth: 80,
    width: 100,
    cssClass: "align-right"
  });

  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "금일출고수량",
    minWidth: 80,
    width: 100,
    cssClass: "align-right"
  });

  $NC.setGridColumn(columns, {
    id: "OUT_CNT",
    field: "OUT_CNT",
    name: "출고진행량",
    minWidth: 80,
    width: 100,
    cssClass: "align-right"
  });

  $NC.setGridColumn(columns, {
    id: "AVG_QTY",
    field: "AVG_QTY",
    name: "일평균수량",
    minWidth: 80,
    width: 100,
    cssClass: "align-right"
  });

  $NC.setGridColumn(columns, {
    id: "DEAL_CNT_GUBN",
    field: "DEAL_CNT_GUBN",
    name: "중복할당표시",
    minWidth: 80,
    width: 100,
    cssClass: "align-right"
  });
  
  

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetail1Initialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail1", {
    columns: grdDetail1OnGetColumns(),
    queryId: "LS06010Q.RS_DETAIL2",
    sortCol: "KEEP_DIV_F",
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

  var rowData = G_GRDDETAIL1.data.getItem(row);
  
//파라메터 세팅
  G_GRDDETAIL2.queryParams = $NC.getParams({
    P_BU_CD: $NC.getValue("#edtQBu_Cd"),
    P_ITEM_CD: rowData.ITEM_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });
  // 데이터 조회
  $NC.serviceCall("/LS06010Q/getDataSet.do", $NC.getGridParams(G_GRDDETAIL2), onGetDetail2);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail1", row + 1);
}



function grdDetail2OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_ID",
    field: "OPTION_ID",
    name: "딜옵션코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션내용",
    minWidth: 100
  });


  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetail2Initialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail2", {
    columns: grdDetail2OnGetColumns(),
    queryId: "LS06010Q.RS_DETAIL3",
    sortCol: "DEAL_ID",
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



function grdDetail3OnGetColumns() {

  var columns = [ ];
 
  $NC.setGridColumn(columns, {
    id: "OPTION_ID",
    field: "OPTION_ID",
    name: "옵션코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션내용",
    minWidth: 100
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetail3Initialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail3", {
    columns: grdDetail3OnGetColumns(),
    queryId: "LS06010Q.RS_DETAIL1",
    sortCol: "ITEM_CD",
    gridOptions: options
  });
  G_GRDDETAIL3.view.onSelectedRowsChanged.subscribe(grdDetail3OnAfterScroll);

}

function grdDetail3OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL3.lastRow != null) {
    if (row == G_GRDDETAIL3.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  
  var rowData = G_GRDDETAIL3.data.getItem(row);

  $NC.setInitGridVar(G_GRDDETAIL1);
  $NC.setInitGridVar(G_GRDDETAIL2);

    onGetDetail1({
      data: null
    });
    onGetDetail2({
      data: null
    });
    

    var OUT_DATE = $NC.getValue("#dtpQOutbound_Date");
  /* 보관유형별 수수료 */
  // 파라메터 세팅
  G_GRDDETAIL1.queryParams = $NC.getParams({
    P_BU_CD: rowData.BU_CD,
    P_OWN_BRAND_CD: rowData.OWN_BRAND_CD,
    P_BRAND_CD: rowData.BRAND_CD,
    P_DEAL_ID: rowData.DEAL_ID,
    P_OPTION_ID: rowData.OPTION_ID,
    P_OUT_DATE: OUT_DATE,
    P_USER_ID:  $NC.G_USERINFO.USER_ID,
  });
  // 데이터 조회
  $NC.serviceCall("/LS06010Q/getDataSet.do", $NC.getGridParams(G_GRDDETAIL1), onGetDetail1);

 
  
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail3", row + 1);
}



function grdT2MasterOnGetColumns() {

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
    id: "BU_CD",
    field: "BU_CD",
    name: "사업부",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜코드",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_CD",
    field: "OWN_BRAND_CD",
    name: "위탁사",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_NM",
    field: "OWN_BRAND_NM",
    name: "위탁사명",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD1",
    field: "BRAND_CD1",
    name: "판매사",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM1",
    field: "BRAND_NM1",
    name: "판매사명",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_DIV_NM",
    field: "DEAL_DIV_NM",
    name: "딜구분",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OPEN_DATE",
    field: "OPEN_DATE",
    name: "시작일자",
    minWidth: 90,
    cssClass: "align-right"
  });  
  $NC.setGridColumn(columns, {
    id: "CLOSE_DATE",
    field: "CLOSE_DATE",
    name: "종료일자",
    minWidth: 90,
    cssClass: "align-right"
  });

  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 90,
    cssClass: "align-right"
  });
  

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 0,
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LS06010Q.RS_DETAIL4",
    sortCol: "LOCATION_CD",
    gridOptions: options
  });
  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
  G_GRDT2MASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT2MASTER, "CHECK_YN");

}


function grdMasterOnHeaderClick(e, args) {

  G_GRDT2MASTER.view.getCanvasNode().focus();

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDT2MASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT2MASTER.data.getLength();
      var rowData;
      G_GRDT2MASTER.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDT2MASTER.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDT2MASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT2MASTER.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

function grdT2MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2MASTER.lastRow != null) {
    if (row == G_GRDT2MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 디테일 초기화
  $NC.setInitGridVar(G_GRDT2DETAIL);

  onGetT2Detail({
    data: null
  });
  var OUT_DATE = $NC.getValue("#dtpQOutbound_Date");

  var rowData = G_GRDT2MASTER.data.getItem(row);
  // 파라메터 세팅
  G_GRDT2DETAIL.queryParams = $NC.getParams({
    P_BU_CD: rowData.BU_CD,
    P_OWN_BRAND_CD: rowData.OWN_BRAND_CD,
    P_BRAND_CD: rowData.BRAND_CD,
    P_DEAL_ID: rowData.DEAL_ID,
    P_OUT_DATE: OUT_DATE,
    P_USER_ID: $NC.G_USERINFO.USER_ID,
  });
  // 데이터 조회
  $NC.serviceCall("/LS01010Q/getDataSet.do", $NC.getGridParams(G_GRDT2DETAIL), onGetT2Detail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Master", row + 1);
}

function grdT2DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "OPTION_ID",
    field: "OPTION_ID",
    name: "옵션코드",
    minWidth: 80
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
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ABLE_QTY",
    field: "ABLE_QTY",
    name: "판매가능수량",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "SAFETY_QTY",
    field: "SAFETY_QTY",
    name: "안전재고수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "출고진행수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "금일출고수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OUT_CNT",
    field: "OUT_CNT",
    name: "출고건수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "AVG_QTY",
    field: "AVG_QTY",
    name: "일평균수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_CNT_GUBN",
    field: "DEAL_CNT_GUBN",
    name: "중복할당표시",
    minWidth: 90,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2DetailInitialize() {

  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Detail", {
    columns: grdT2DetailOnGetColumns(),
    queryId: "LS06010Q.RS_DETAIL5",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT2DETAIL.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
}

function grdT2DetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2DETAIL.lastRow != null) {
    if (row == G_GRDT2DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Detail", row + 1);
}





function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["FEE_BASE_CD", "CONTRACT_START_DATE"],
        selectVal: G_GRDMASTER.lastKeyVal,
        activeCell: true
      });
    }
  } else {
    // 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL1);
    onGetDetail1({
      data: null
    });
    $NC.setInitGridVar(G_GRDDETAIL2);
    onGetDetail2({
      data: null
    });
    $NC.setInitGridVar(G_GRDDETAIL3);
    onGetDetail3({
      data: null
    });

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

function onGetDetail1(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL1, ajaxData);

  if (G_GRDDETAIL1.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL1.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL1, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL1, {
        selectKey: "KEEP_DIV",
        selectVal: G_GRDDETAIL1.lastKeyVal,
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail1", 0, 0);
  }
}

function onGetDetail2(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL2, ajaxData);

  if (G_GRDDETAIL2.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL2.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL2, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL2, {
        selectKey: ["BRAND_CD", "DEPART_CD", "LINE_CD", "CLASS_CD"],
        selectVal: G_GRDDETAIL2.lastKeyVal,
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail2", 0, 0);
  }
}

function onGetDetail3(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL3, ajaxData);

  if (G_GRDDETAIL3.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL3.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL3, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL3, {
        selectKey: "DEAL_ID",
        selectVal: G_GRDDETAIL3.lastKeyVal,
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail3", 0, 0);
  }
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
}


/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);

  $NP.showOwnBranPopup({
    P_CUST_CD: $NC.G_USERINFO.CUST_CD,
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  // setDepartCombo();
  onChangingCondition();
}

/**
 * 검색조건의 판매사 검색 팝업 클릭
 */
function showSellerPopup() {
  var CUST_CD = $NC.G_USERINFO.CUST_CD;
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  $NP.showSellerPopup({
    P_CUST_CD: CUST_CD,
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: BRAND_CD,
    P_SELLER_CD: '%'
  }, onSellerPopup, function() {
    $NC.setFocus("#edtQMall_Brand_Cd", true);
  });
}

/**
 * 판매사 검색 결과
 * 
 * @param seletedRowData
 */
function onSellerPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQMall_Brand_Cd", resultInfo.SELLER_CD);
    $NC.setValue("#edtQMall_Brand_Nm", resultInfo.SELLER_NM);
  } else {
    $NC.setValue("#edtQMall_Brand_Cd");
    $NC.setValue("#edtQMall_Brand_Nm");
    $NC.setFocus("#edtQMall_Brand_Cd", true);
  }
  // setDepartCombo();
  onChangingCondition();
}





/**
 * 딜코드 검색 팝업 클릭
 */
function showBrandDealPopup() {
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var OWN_BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var SELLER_CD = $NC.getValue("#edtQMall_Brand_Cd", true);
  
  $NP.showBrandDealPopup({
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: OWN_BRAND_CD,
    P_SELLER_CD: SELLER_CD,
    P_DEAL_ID: "%"
  }, onBrandDealPopup, function() {
    $NC.setFocus("#edtQDeal_Id", true);
  });
}

/**
 * 딜코드 검색 결과
 * 
 * @param seletedRowData
 */
function onBrandDealPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQDeal_Id", resultInfo.DEAL_ID);
    $NC.setValue("#edtQDeal_Nm", resultInfo.DEAL_NM);
  } else {
    $NC.setValue("#edtQDeal_Id");
    $NC.setValue("#edtQDeal_Nm");
    $NC.setFocus("#edtQDeal_Id", true);
  }
  // setDepartCombo();
  onChangingCondition();
}

function Onexcel() {
  
  var rowCount = G_GRDT2MASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }
  
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var OWN_BRAND_CD = $NC.getValue("#edtQBrand_Cd");
  var BRAND_CD = $NC.getValue("#edtQMall_Brand_Cd");
  var OUT_DATE = $NC.getValue("#dtpQOutbound_Date");
  var TEST = "딜정보테스트";

  $NC.serviceCall("/LS06010Q/callDelete.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_TEST: TEST,
    })
  });
  


  var checkedValueDS = [ ];
  var rowCount = G_GRDT2MASTER.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT2MASTER.data.getItem(row);
    if (rowData.CHECK_YN === "Y") {
      checkedValueDS.push(rowData.DEAL_ID + rowData.OWN_BRAND_CD + rowData.BRAND_CD1);
    }
  }
  
  
 // Excel Export
 $NC.G_MAIN.excelFileDownload_test({
   P_QUERY_ID: "LS06010Q.RS_DETAIL6",
   P_QUERY_PARAMS: $NC.getParams({
     P_BU_CD: '5000',
     P_OUT_DATE: OUT_DATE,
     P_USER_ID: $NC.G_USERINFO.USER_ID,

   }),
   P_CHECKED_VALUE: checkedValueDS.toString(),
  // checkedValue: checkedValueDS.toString(),
   P_COLUMN_INFO: $NC.getGridColumnInfo(G_GRDT3MASTER),
   P_EXCEL_TITLE: "딜상품 ",//TEST.replace(/\/|\[|\]|\s/gi, ""),
   P_EXPORT_TYPE: "1",
 
 });
}

function onGetT2Master(ajaxData) {

  $NC.setInitGridData(G_GRDT2MASTER, ajaxData);

  if (G_GRDT2MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT2MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT2Master", 0, 0);

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDT2DETAIL);

    onGetT2Detail({
      data: null
    });
  }
}


/**
 * 로케이션별 재고현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT2Detail(ajaxData) {

  $NC.setInitGridData(G_GRDT2DETAIL, ajaxData);

  if (G_GRDT2DETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT2DETAIL, 0);
  } else {
    $NC.setGridDisplayRows("#grdT2Detail", 0, 0);
  }
}


function _OnGridCheckBoxFormatterClick(e, view, args) {

  if (G_GRDT2MASTER.view.getEditorLock().isActive()) {
    G_GRDT2MASTER.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDT2MASTER, args.row);

  var rowData = G_GRDT2MASTER.data.getItem(args.row);

  if (args.cell == G_GRDT2MASTER.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  G_GRDT2MASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  // G_GRDMASTER.lastRowModified = true;
}






function grdT3MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "사업부",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜코드",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_CD",
    field: "OWN_BRAND_CD",
    name: "위탁사",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_NM",
    field: "OWN_BRAND_NM",
    name: "위탁사명",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD1",
    field: "BRAND_CD1",
    name: "판매사",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM1",
    field: "BRAND_NM1",
    name: "판매사명",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_DIV",
    field: "DEAL_DIV",
    name: "거래구분",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OPEN_DATE",
    field: "OPEN_DATE",
    name: "시작일자",
    minWidth: 90,
    cssClass: "align-right"
  });  
  $NC.setGridColumn(columns, {
    id: "CLOSE_DATE",
    field: "CLOSE_DATE",
    name: "종료일자",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_ID",
    field: "OPTION_ID",
    name: "옵션코드",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션명",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ITEM_CD",
    field: "DEAL_ITEM_CD",
    name: "ITEM_CD",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ABLE_QTY",
    field: "ABLE_QTY",
    name: "판매가능수량",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "SAFETY_QTY",
    field: "SAFETY_QTY",
    name: "안전재고수량",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "출고진행수량",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "금일출고수량",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OUT_CNT",
    field: "OUT_CNT",
    name: "출고건수",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "AVG_QTY",
    field: "AVG_QTY",
    name: "일평균수량",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_CNT_GUBN",
    field: "DEAL_CNT_GUBN",
    name: "중복할당표시",
    minWidth: 100
  });


  

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT3MasterInitialize() {

  var options = {
    frozenColumn: 0,
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT3Master", {
    columns: grdT3MasterOnGetColumns(),
    queryId: "LS06010Q.RS_DETAIL6",
    sortCol: "LOCATION_CD",
    gridOptions: options
  });

}


function onGetT3Master(ajaxData) {

  $NC.setInitGridData(G_GRDT3MASTER, ajaxData);

  if (G_GRDT3MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT3MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT3Master", 0, 0);

  }
}
