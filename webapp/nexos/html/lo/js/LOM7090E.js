var CENTER_CD       // 물류센터
  ,BU_CD            // 사업구분
  ,ORDER_DATE1      // 예정(출고)일자 시작
  ,ORDER_DATE2      // 예정(출고)일자 종료
  ,OUTBOUND_DATE    // 출고일자 // 예정에만.
  ,OUTBOUND_BATCH   // 출고차수 // 지시에서만.

  ,DEAL_ID          // 딜ID
  ,OWN_BRAND_CD     // 위탁사
  ,BRAND_CD         // 판매사
  ,BU_TIME          // 주문시간
  ,BU_TIME1         // 주문시간 시작
  ,BU_TIME2         // 주문시간 종료

  ,BU_NO            // 주문번호
  ,DELIVERY_TYPE    // 배송유형
  ,MALL_CD          // 몰구분
  ,INOUT_CD         // 입출고구분

  ,SHIPPER_NM       // 수령자명
  ,ORDERER_NM       // 주문자명
  ,ITEM_CD          // 상품코드
  ,ITEM_NM          // 상품명
  ,SHIP_TYPE        // 운송구분
  ,INORDER_TYPE     // 매입형태
  ,DELIVERY_TYPE2   // 배송지역구분
  ,SHIP_PRICE_TYPE  // 운송비구분
  ,HOLD_YN          // 보류여부
  ,IS_ALL_DATE = false;     // 전체날짜로 조회

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨.
 */
function _Initialize() {
  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 현재 액티브된 뷰 정보
    activeView: {
      container: "",
      PROCESS_CD: ""
    },
 // 체크할 정책 값
    policyVal: {
      LO220: "", //출고등록시 부족재고 조정기준 정책
    },
    // 프로세스별 확정/취소 처리가능 진행상태
    // 0: A, 1: B, 2 : C, 3 : D, 4: E
    stateFWBW: {
      A: {
        CONFIRM: "",
        CANCEL: ""
      },
      B: {
        CONFIRM: "",
        CANCEL: ""
      },
      C: {
        CONFIRM: "",
        CANCEL: ""
      },
      D: {
        CONFIRM: "",
        CANCEL: ""
      },
      E: {
        CONFIRM: "",
        CANCEL: ""
      }
    }
  });

  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();

  // 탭 초기화
  $NC.setInitTab("#divTabView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 그리드 초기화
  grdT1MasterInitialize(); 
  grdT1DetailInitialize();
  grdT1SubInitialize();
  grdT2MasterInitialize();
  grdT2DetailInitialize();
  grdT2SubInitialize();
  grdT3MasterInitialize();
  grdT3DetailInitialize();
  grdT3SubInitialize();
  grdT4MasterInitialize();
  grdT4DetailInitialize();
  grdT4SubInitialize();


  // 부족재고 조정기준 정책
  $NC.serviceCall("/LOM7090E/callSP.do", {
    P_QUERY_ID: "WF.GET_POLICY_VAL",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
      P_BU_CD: $NC.G_USERINFO.BU_CD,
      P_POLICY_CD: "LO220"
    })
  }, function(ajaxData) {
    var resultData = $NC.toArray(ajaxData);
    if (!$NC.isNull(resultData)) {
      if (resultData.O_MSG === "OK") {
        $NC.G_VAR.policyVal.LO220 =  resultData.O_POLICY_VAL;
      }
    }
  });
  // 부족재고 조정기준 정책
  $NC.serviceCall("/LOM7090E/callSP.do", {
    P_QUERY_ID: "WF.GET_POLICY_VAL",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
      P_BU_CD: $NC.G_USERINFO.BU_CD,
      P_POLICY_CD: "LO190"
    })
  }, function(ajaxData) {
    var resultData = $NC.toArray(ajaxData);
    if (!$NC.isNull(resultData)) {
      if (resultData.O_MSG === "OK") {
        $NC.G_VAR.policyVal.LO190 =  resultData.O_POLICY_VAL;
      }
    }
  });
  // 부족재고 조정기준 정책
  $NC.serviceCall("/LOM7090E/callSP.do", {
    P_QUERY_ID: "WF.GET_POLICY_VAL",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
      P_BU_CD: $NC.G_USERINFO.BU_CD,
      P_POLICY_CD: "LO210"
    })
  }, function(ajaxData) {
    var resultData = $NC.toArray(ajaxData);
    if (!$NC.isNull(resultData)) {
      if (resultData.O_MSG === "OK") {
        $NC.G_VAR.policyVal.LO210 =  resultData.O_POLICY_VAL;
      }
    }
  });
  // 부족재고 조정기준 정책
  $NC.serviceCall("/LOM7090E/callSP.do", {
    P_QUERY_ID: "WF.GET_POLICY_VAL",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
      P_BU_CD: $NC.G_USERINFO.BU_CD,
      P_POLICY_CD: "LO221"
    })
  }, function(ajaxData) {
    var resultData = $NC.toArray(ajaxData);
    if (!$NC.isNull(resultData)) {
      if (resultData.O_MSG === "OK") {
        $NC.G_VAR.policyVal.LO221 =  resultData.O_POLICY_VAL;
      }
    }
  });
  // 부족재고 조정기준 정책
  $NC.serviceCall("/LOM7090E/callSP.do", {
    P_QUERY_ID: "WF.GET_POLICY_VAL",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
      P_BU_CD: $NC.G_USERINFO.BU_CD,
      P_POLICY_CD: "LO250"
    })
  }, function(ajaxData) {
    var resultData = $NC.toArray(ajaxData);
    if (!$NC.isNull(resultData)) {
      if (resultData.O_MSG === "OK") {
        $NC.G_VAR.policyVal.LO250 =  resultData.O_POLICY_VAL;
      }
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
    selector: "#cboQCenter_Cd",
    codeField: "CENTER_CD",
    nameField: "CENTER_NM",
    onComplete: function() {
      $("#cboQCenter_Cd").val($NC.G_USERINFO.CENTER_CD);
    }
  });

  // 조회조건 - 사업구분 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $("#btnQBu_Cd").click(showUserBuPopup);
  // 조회조건 - 위탁사
  $("#btnQOwn_Brand_Cd").click(showOwnBrandPopup);

  // 조회조건 - 입출고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "DM",
      P_SUB_CD2: ""
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
  // 조회조건 - 보류여부 세팅
  $NC.setInitCombo("/LOM7090E/getDataSet.do", {
    P_QUERY_ID: "LOM7090E.GET_HOLD_YN",
    P_QUERY_PARAMS: $NC.getParams({})
  }, {
    selector: "#cboQHold_Yn",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    addAll: true
  });

  // 조회조건 - 출고차수 세팅
  // 출고지시 화면의 출고차수 새로고침
  $("#btnQOutbound_Batch").click(function() {
    setOutboundBatchCombo("#cboQOutbound_Batch", true);
  });
  setOutboundBatchCombo("#cboQOutbound_Batch", true);

  // 조회조건 - T1 상품주문구분
  $NC.setInitCombo("/LOM7090E/getDataSet.do", {
    P_QUERY_ID: "LOM7090E.GET_ORDER_TYPE",
    P_QUERY_PARAMS: $NC.getParams({})
  }, {
    selector: ["#cboQT1Order_Div", "#cboQT2Order_Div", "#cboQT3Order_Div", "#cboQT4Order_Div"],
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    addAll: true,
    onComplete: function() {
      // 출고전표/수량 정보 세팅, 프로세스 정보, ※ 조회 조건이 모두 세팅이 되는 시점
      setTimeout(function() {
        setProcessStateInfo();
        _Inquiry();
      }, 200);
    }
  });
  // 조회조건 - T1 배송유형
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "DELIVERY_TYPE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: ["#cboQDelivery_Type", "#cboQT1Delivery_TypeB", "#cboQT2Delivery_TypeB", "#cboQT3Delivery_TypeB"],
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    addAll: true,
    onComplete: function(a, b, c){
      $('#cboQT1Delivery_TypeB option')[0].innerText = '';
      $('#cboQT2Delivery_TypeB option')[0].innerText = '';
      $('#cboQT3Delivery_TypeB option')[0].innerText = '';
    }
  });

  // 조회조건 - T1
  //예정일자
  $NC.setInitDatePicker("#dtpQOrder_Date1");
  $NC.setInitDatePicker("#dtpQOrder_Date2");
  $NC.setValue("#dtpQOrder_Date1", $NC.addDay($NC.getValue("#dtpQOrder_Date2"), -2));
  $NC.setInitDatePicker("#dtpQOutbound_Date");

  // 출고일자 - T2
  $NC.setInitDatePicker("#dtpQOutbound_Date1");
  $NC.setInitDatePicker("#dtpQOutbound_Date2");
  $NC.setValue("#dtpQOutbound_Date1", $NC.addDay($NC.getValue("#dtpQOutbound_Date2"), -2));
  $("#btnMasterOrder").click(setT2MasterOrder); // 출고등록 멀티셀렉트
  // 출고일자 - T3
  $NC.setInitDatePicker("#dtpQOutbound_Date3");
  $NC.setInitDatePicker("#dtpQOutbound_Date4");
  $NC.setValue("#dtpQOutbound_Date3", $NC.addDay($NC.getValue("#dtpQOutbound_Date4"), -2));

  // 출고확정/취소 버튼 권한 체크 및 클릭 이벤트 연결
  setUserProgramPermission();

  $("#btnT1Proc_InvnoLine").click(setT1OrderDiv); // 주문유형 리마킹 SP 버튼 클릭(개별등록탭)
  $("#btnT2Proc_InvnoLine").click(setT2OrderDiv); // 주문유형 리마킹 SP 버튼 클릭(개별등록탭)
  $("#btnT3Proc_InvnoLine").click(setT3OrderDiv); // 주문유형 리마킹 SP 버튼 클릭(개별등록탭)
  $("#btnT4Proc_InvnoLine").click(setT4OrderDiv); // 주문유형 리마킹 SP 버튼 클릭(개별등록탭)
  // 지시탭에서 라벨출력
  $("#btnPrintLabel").click(function(){
    _Print(0, '라벨출력');
  });
  $("#btnPrintPaper").click(function(){
    _Print(1, '지시서출력');
  });
  
  $("#btnT1Order_Adjust").click(setOrder_Adjustment); // 출고할당량 부족재고 조정
  $("#chkQDate_Yn").click(function(e) {
    if ($(this).is(':checked')) {
      IS_ALL_DATE = true;
      $NC.setEnable("#dtpQOrder_Date1", false);
      $NC.setEnable("#dtpQOrder_Date2", false);
    } else {
      IS_ALL_DATE = false;
      $NC.setEnable("#dtpQOrder_Date1", true);
      $NC.setEnable("#dtpQOrder_Date2", true);
    }
  });
  _OnConditionChange();
  
  //추후 사용 할 가능성이 있어 숨겨놓음.
  $('#btnT1Order_Adjust').hide();
  $NC.setValue('#chkQDate_Yn', true);
  IS_ALL_DATE = true;
  $NC.setEnable("#dtpQOrder_Date1", false);
  $NC.setEnable("#dtpQOrder_Date2", false);
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {
  $("#T2Option").hide();
  $("#T3Option").hide();
  $("#T4Option").hide();
  $('#divT2ProcessingInfo').hide();
  $('#divT3ProcessingInfo').hide();
  $('#divT4ProcessingInfo').hide();

  // 스플리터 초기화
  $NC.setInitSplitter("#divT1DetailView", "v", $NC.G_OFFSET.leftViewWidth);
  $NC.setInitSplitter("#divT1SplitArea", "h", $NC.G_OFFSET.rightViewHeight);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.leftViewWidth = 550;
  $NC.G_OFFSET.rightViewHeight = 250;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.tabHeaderHeight = $("#divTabView").children(".ui-tabs-nav:first").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1 * 2; /* 탭일 경우는 좌우 */
  clientWidth -= $NC.G_LAYOUT.border1;
  
  if ($("#divTabView").tabs("option", "active") === 0) {
    var hiddenOption = 15;
    var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_LAYOUT.border1 + hiddenOption;
    $NC.resizeContainer("#divTabView", clientWidth, clientHeight+38);  
    clientHeight -= ($NC.G_OFFSET.tabHeaderHeight + $NC.G_LAYOUT.border1);

    var container = $("#divT1DetailView");
    $NC.resizeContainer(container, clientWidth, clientHeight);
    
    container = $("#grdT1Master").parent();
    // Master Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", container.width(), container.height() - $NC.G_LAYOUT.header-45);
    
    // Grid 사이즈 조정
    container = $("#grdT1Detail").parent();
    $NC.resizeGrid("#grdT1Detail", $("#grdT1Detail").parent().width(), container.height() - $NC.G_LAYOUT.header);
    container = $("#grdT1Sub").parent();
    $NC.resizeGrid("#grdT1Sub", $("#grdT1Detail").parent().width(), container.height() - $NC.G_LAYOUT.header-45);
    return false;
  }
  if ($("#divTabView").tabs("option", "active") === 1) {
    var hiddenOption = 15;
    var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_LAYOUT.border1 + hiddenOption;
    $NC.resizeContainer("#divTabView", clientWidth, clientHeight+38);  
    clientHeight -= ($NC.G_OFFSET.tabHeaderHeight + $NC.G_LAYOUT.border1);

    var container = $("#divT2DetailView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdT2Master").parent();
    // Master Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Master", container.width(), container.height() - $NC.G_LAYOUT.header-15);
    
    // Grid 사이즈 조정
    container = $("#grdT2Detail").parent();
    $NC.resizeGrid("#grdT2Detail", $("#grdT2Detail").parent().width(), container.height() - $NC.G_LAYOUT.header);
    container = $("#grdT2Sub").parent();
    $NC.resizeGrid("#grdT2Sub", $("#grdT2Detail").parent().width(), container.height() - $NC.G_LAYOUT.header-15);
    return false;
  }
  if ($("#divTabView").tabs("option", "active") === 2) {
    var hiddenOption = 15;
    var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_LAYOUT.border1 + hiddenOption;
    $NC.resizeContainer("#divTabView", clientWidth, clientHeight);  
    clientHeight -= ($NC.G_OFFSET.tabHeaderHeight + $NC.G_LAYOUT.border1);

    var container = $("#divT3DetailView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdT3Master").parent();
    // Master Grid 사이즈 조정
    $NC.resizeGrid("#grdT3Master", container.width(), container.height() - $NC.G_LAYOUT.header-15);
    
    // Grid 사이즈 조정
    container = $("#grdT3Detail").parent();
    $NC.resizeGrid("#grdT3Detail", $("#grdT3Detail").parent().width(), container.height() - $NC.G_LAYOUT.header);
    container = $("#grdT3Sub").parent();
    $NC.resizeGrid("#grdT3Sub", $("#grdT3Detail").parent().width(), container.height() - $NC.G_LAYOUT.header-15);
    return false;
  }
  if ($("#divTabView").tabs("option", "active") === 3) {
    var hiddenOption = 15;
    var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_LAYOUT.border1 + hiddenOption;
    $NC.resizeContainer("#divTabView", clientWidth, clientHeight);  
    clientHeight -= ($NC.G_OFFSET.tabHeaderHeight + $NC.G_LAYOUT.border1);

    var container = $("#divT4DetailView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdT4Master").parent();
    // Master Grid 사이즈 조정
    $NC.resizeGrid("#grdT4Master", container.width(), container.height() - $NC.G_LAYOUT.header-15);
    
    // Grid 사이즈 조정
    container = $("#grdT4Detail").parent();
    $NC.resizeGrid("#grdT4Detail", $("#grdT4Detail").parent().width(), container.height() - $NC.G_LAYOUT.header);
    container = $("#grdT4Sub").parent();
    $NC.resizeGrid("#grdT4Sub", $("#grdT4Detail").parent().width(), container.height() - $NC.G_LAYOUT.header-15);
    return false;
  }
}

/**
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          grid, row, cell, val
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {
  //if ($NC.isNull($NC.G_VAR.activeView.PROCESS_CD)) {
  //  return;
  //}
  var grdDetail;
  if ($("#divTabView").tabs("option", "active") === 0) {
    if (args.grid == "grdT1Master") {
      grdDetail = window["G_GRDT1MASTER"];
    }else if(args.grid == "grdT1Detail"){
      grdDetail = window["G_GRDT1DETAIL"];  
    }
  } else if ($("#divTabView").tabs("option", "active") === 1) {
    if (args.grid == "grdT2Master") {
      grdDetail = window["G_GRDT2MASTER"];
    }else if(args.grid == "grdT2Detail"){
      grdDetail = window["G_GRDT2DETAIL"];  
    }
  } else if ($("#divTabView").tabs("option", "active") === 2) {
    if (args.grid == "grdT3Master") {
      grdDetail = window["G_GRDT3MASTER"];
    }else if(args.grid == "grdT3Detail"){
      grdDetail = window["G_GRDT3DETAIL"];  
    }
  } else if ($("#divTabView").tabs("option", "active") === 3) {
    if (args.grid == "grdT4Master") {
      grdDetail = window["G_GRDT4MASTER"];
    }else if(args.grid == "grdT4Detail"){
      grdDetail = window["G_GRDT4DETAIL"];  
    }
  }

  if (grdDetail.view.getEditorLock().isActive()) {
    grdDetail.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(grdDetail, args.row);

  var rowData = grdDetail.data.getItem(args.row);

  if (args.cell == grdDetail.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  grdDetail.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  grdDetail.lastRowModified = true;
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {
  $("#divOrderDate").show(); // 출고예정일자 표시
  $("#tdQDsp_Time_Type").show(); // 예정시간 표시
  $("#divOutboundBatch").hide(); // 출고차수 비표시
  
  $("#tdQDsp_Brand_Cd").show(); // 판매사(일괄출고) 비표시
  $("#tdQDsp_Order_TypeC").hide(); // 주문구분(지시) 비표시
  $("#tdQDsp_Item_Cnt_Div").parent().hide(); // 합품여부
  $("#tdQMall_Cd").show().parent().show(); // 몰구분 비표시
  $("#tdQInorder_Type").show().parent().show(); // 매입형태 비표시
  $("#tdQShip_Type").show().parent().show(); // 운송구분 비표시
  $("#tdQShip_Price_Type").show().parent().show(); // 운송비구분 비표시
  $("#tdQHold_Yn").show().parent().show(); // 보류여부 비표시

  //검색항목 값 변경시 화면 클리어
  if ($("#divTabView").tabs("option", "active") === 0) {
    $("#T1Option").show();
    $("#divT1ProcessingInfo").show();
    $("#T2Option").hide();
    $("#divT2ProcessingInfo").hide();
    $("#T3Option").hide();
    $("#divT3ProcessingInfo").hide();

    $('#tdDirectHidden').show();
    $('#lblQOrder_Date').text('예정일자');
    $('#tdOutboundHidden').show();
    $('#tdQDsp_Outbound_Batch').hide();
    $('#tdQHold_Yn').show();
    return false;
  }
  if ($("#divTabView").tabs("option", "active") === 1) {
    $("#T1Option").hide();
    $("#divT1ProcessingInfo").hide();
    $("#T2Option").show();
    $("#divT2ProcessingInfo").show();
    $("#T3Option").hide();
    $("#divT3ProcessingInfo").hide();

    $('#tdDirectHidden').show();
    $('#lblQOrder_Date').text('출고일자');
    $('#tdOutboundHidden').hide();
    $('#tdQDsp_Outbound_Batch').hide();
    $('#tdQHold_Yn').hide();
    return false;
  }
  if ($("#divTabView").tabs("option", "active") === 2) {
    $("#T1Option").hide();
    $("#divT1ProcessingInfo").hide();
    $("#T2Option").hide();
    $("#divT2ProcessingInfo").hide();
    $("#T3Option").show(); 
    $("#divT3ProcessingInfo").show();

    $('#tdDirectHidden').show();
    $('#lblQOrder_Date').text('출고일자');
    $('#tdOutboundHidden').hide();
    $('#tdQDsp_Outbound_Batch').show();
    $('#tdQHold_Yn').hide();
    return false;
  }
  if ($("#divTabView").tabs("option", "active") === 3) {
    $("#T1Option").hide();
    $("#divT1ProcessingInfo").hide();
    $("#T2Option").hide();
    $("#divT2ProcessingInfo").hide();
    $("#T4Option").show(); 
    $("#divT4ProcessingInfo").show();

    $('#tdDirectHidden').show();
    $('#lblQOrder_Date').text('출고일자');
    $('#tdOutboundHidden').hide();
    $('#tdQDsp_Outbound_Batch').show();
    $('#tdQHold_Yn').hide();
    return false;
  }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {
  var id = $('#divTabView').tabs('option', 'active');
  if (id === 0) {
    getDataT1Master();
  } else if (id === 1) {
    getDataT2Master();
  } else if (id === 2) {
    getDataT3Master();
  } else if (id === 3) {
    getDataT4Master();
  }
  getCountAndQty();
  _OnConditionChange();
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

function _Print(printIndex, printName) {

  var reportDoc;
  var queryId;

  if ($("#divTabView").tabs("option", "active") != 2) {
    return false;
  }

  reportDoc = "lo/LABEL_LOM_LABLE";
  queryId = "WR.RS_LABEL_LOM_LABEL1";

  var checkedValueLabel = [ ];
  var saveDs = [ ];
  var rowCount = G_GRDT3MASTER.data.getLength();
  var checkCnt = 0;
  
  PRINT_DIV = "1";
  
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT3MASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y"){
      
      checkCnt++;
      
      //피킹라벨 & 토탈피킹지시서
      checkedValueLabel.push(rowData.OUTBOUND_DATE + ";" + rowData.OUTBOUND_BATCH + ";" + rowData.ORDER_TYPE);
      
      //출고이력 저장
      var saveData = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_BATCH: rowData.OUTBOUND_BATCH,
        P_ORDER_TYPE: rowData.ORDER_TYPE
      };
      saveDs.push(saveData); 
      
      if (rowData.PRINT_DIV === "2"){
        PRINT_DIV = "2";
      }

      if (printIndex == '0' && rowData.PRINT_YN == "Y") {
        if (!confirm('이미 출력 되었습니다.\n\n출력 하시겠습니까?.\n\n[출고차수 : ' +rowData.OUTBOUND_BATCH+ ']')) {
          return false;
        }
      }
    }
  }
  
  if (checkCnt == 0){
    alert("출력할 데이터를 선택하세요.");
    return false;
  }
  
  var queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD
  };
  
  if (printIndex == '0') {
    //출고이력 저장.
    cksave(saveDs);
    
    // 미리보기
    $NC.G_MAIN.showPrintPreview({
      reportDoc: reportDoc,
      queryId: queryId,
      queryParams: queryParams,
      checkedValue: checkedValueLabel.toString(),
      internalQueryYn: "N",
      //printFn: exeSilentPrint,
      //print_div: PRINT_DIV
    });
  } else if (printIndex == '1') {
    $NC.G_MAIN.showPrintPreview({
      reportDoc: "lo/PAPER_LOM02_3",
      queryId: "WR.RS_PAPER_LOM02_4",
      queryParams: queryParams,
      checkedValue: checkedValueLabel.toString(),
      internalQueryYn: "N",
      //printFn: exeSilentPrint,
      //print_div: PRINT_DIV
    });
  }
  

  // 미리보기 후 출력하기 PRINT_DIV == '2'일 경우에만 실행
  /*function exeSilentPrint() {
    if (PRINT_DIV == "1") {
      return false;
    }
    
    $NC.G_MAIN.silentPrint({
      printParams: [{
        reportDoc: "lo/PAPER_LOM02_3",
        queryId: "WR.RS_PAPER_LOM02_4",
        queryParams: queryParams,
        checkedValue: checkedValueLabel.toString(),
        iFrameNo: 1,
        silentPrinterName: $NC.G_USERINFO.PRINT_CARD,
        internalQueryYn: "N"
      }],
      onAfterPrint: function() {
        //_Inquiry();
      }
    });
    
  }*/
}

/**
 * 출력여부
 */
function cksave(saveDS) {

  if (saveDS.length > 0) {
    $NC.serviceCallAndWait("/LOM7090E/Cksave.do", {
      P_DS_DETAIL: $NC.toJson(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSavePrintYn, null, null, '7090E_RS_T4_CK_SAVE');
  }
}

// 출력 여부
function onSavePrintYn(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }
  _Inquiry();
}

/**
 * Tab Active Event
 * 
 * @param event
 * @param ui
 *          newTab: The tab that was just activated.<br>
 *          oldTab: The tab that was just deactivated.<br>
 *          newPanel: The panel that was just activated.<br>
 *          oldPanel: The panel that was just deactivated
 */
function tabOnActivate(event, ui) {
  var id = ui.newTab.prop("id").substr(3).toUpperCase();
  var container, splitArea;
  if (id === "TAB1") {
    container = "#divT1DetailView";
    splitArea = "#divT1SplitArea";
    getDataT1Master();
  } else if (id === "TAB2") {
    container = "#divT2DetailView";
    splitArea = "#divT2SplitArea";
    getDataT2Master();
  } else if (id === "TAB3") {
    container = "#divT3DetailView";
    splitArea = "#divT3SplitArea";
    getDataT3Master();
  } else if (id === "TAB4") {
    container = "#divT4DetailView";
    splitArea = "#divT4SplitArea";
    getDataT4Master();
  }

  if ($NC.isSplitter(container)) {
    // 스필리터를 통한 _OnResize 호출
    $(container).trigger("resize");
  } else {
    // 스플리터 초기화
    $NC.setInitSplitter(container, "v", $NC.G_OFFSET.leftViewWidth);
    $NC.setInitSplitter(splitArea, "h", $NC.G_OFFSET.rightViewHeight);
  }
  _OnConditionChange();
  _OnResize($(window));
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {
  if ($("#divTabView").tabs("option", "active") === 0) {
    $("#T1Option").show();
    $("#T2Option").hide();
    $("#T3Option").hide();
    $("#T4Option").hide();
    return false;
  }
  if ($("#divTabView").tabs("option", "active") === 1) {
    $("#T1Option").hide();
    $("#T2Option").show();
    $("#T3Option").hide();
    $("#T4Option").hide();
    return false;
  }
  if ($("#divTabView").tabs("option", "active") === 2) {
    $("#T1Option").hide();
    $("#T2Option").hide();
    $("#T3Option").show();
    $("#T4Option").hide();
    return false;
  }
  if ($("#divTabView").tabs("option", "active") === 3) {
    $("#T1Option").hide();
    $("#T2Option").hide();
    $("#T3Option").hide();
    $("#T4Option").show();
    return false;
  }
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

  setMallCodeCombo($NC.getValue("#edtQBu_Cd"));
  onChangingCondition();
}

/**
 * 검색조건의 위탁사 검색 이미지 클릭
 */
function showOwnBrandPopup() {
  $NP.showOwnBrandPopup({
    P_CUST_CD: $NC.G_USERINFO.CUST_CD,
    P_BU_CD: $NC.getValue("#edtQBu_Cd"),
    P_OWN_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd")
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
  });
}

/**
 * 위탁사 검색 결과 / 검색 실패 했을 경우(not found)
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

/*
 * Tab1 Left
 */
function grdT1MasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LOM7090E.RS_T1_MASTER",
    sortCol: "VENDOR_CD",
    gridOptions: options
  });

  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
  //G_GRDT1MASTER.view.onBeforeEditCell.subscribe(grdT1MasterOnBeforeEditCell);
  //G_GRDT1MASTER.view.onCellChange.subscribe(grdT1MasterOnCellChange);
}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ORDER_TYPE_NM",
    field: "ORDER_TYPE_NM",
    name: "주문구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "CNT_A",
    field: "CNT_A",
    name: "총건수",
    minWidth: 80,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterOnAfterScroll(e, args) {
  var row = args.rows[0];
  if (G_GRDT1MASTER.lastRow != null) {
    if (row == G_GRDT1MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdT1Master", row + 1);
  var rowData = G_GRDT1MASTER.data.getItem(row);
  // CNT_A: 2, CRUD: "R", ORDER_DATE: "2015-02-13" ,ORDER_TYPE: "11", ORDER_TYPE_NM: "일반주문-당일", id: "id_1"
  getDataT1Detail(rowData);
}

/*
 * Tab1 Right-Top
 */
function grdT1DetailInitialize() {
  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Detail", {
    columns: grdT1DetailOnGetColumns(),
    queryId: "LOM7090E.RS_T1_DETAIL",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
  G_GRDT1DETAIL.view.onDblClick.subscribe(grdT1DetailOnDblClick);
  
  G_GRDT1DETAIL.view.onHeaderClick.subscribe(grdT1DetailOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT1DETAIL, "CHECK_YN");
}

function grdT1DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    maxWidth: 30,
    resizable: false,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "출고구분",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "TOT_ENTRY_QTY",
    field: "TOT_ENTRY_QTY",
    name: "총수량",
    cssClass: "align-right",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_NO",
    field: "ORDER_NO",
    name: "예정번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "주문일자",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATETIME1",
    field: "BU_DATETIME",
    name: "주문시간",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "주문번호",
    minWidth: 80
  });
  /*$NC.setGridColumn(columns, {
    id: "HOLD_YN",
    field: "HOLD_YN",
    name: "보류여부",
    minWidth: 80,
    cssClass: "align-center"
  });*/
  $NC.setGridColumn(columns, {
    id: "HOLD_YN",
    field: "HOLD_YN",
    name: "보류여부",
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    minWidth: 80
  });
  /*$NC.setGridColumn(columns, {
    id: "ADJUST_YN",
    field: "ADJUST_YN",
    name: "재고부족여부",
    minWidth: 80,
    cssClass: "align-center"
  });*/
  $NC.setGridColumn(columns, {
    id: "ADJUST_YN",
    field: "ADJUST_YN",
    name: "재고부족여부",
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    minWidth: 80
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailOnAfterScroll(e, args) {
  var row = args.rows[0];
  if (G_GRDT1DETAIL.lastRow != null) {
    if (row == G_GRDT1DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdT1Detail", row + 1);
  var rowData = G_GRDT1DETAIL.data.getItem(row);
  getDataT1Sub(rowData);
}

/**
 * T1 디테일 더블클릭 이벤트 리스너
 */
function grdT1DetailOnDblClick(e, args) {
  var rowData = G_GRDT1DETAIL.data.getItem(args.row);

  var permission = $NC.getProgramPermission();
  // 저장
  if (!permission.canSave) {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  if (rowData) {

    if (rowData.HOLD_YN === "Y") {
      alert("보류상태인 전표는 팝업화면에서 작업하실 수 없습니다.");
      return;
    }
    
    if (rowData.ENTRY_USER_ID === "WMS_JOB" || rowData.ENTRY_USER_ID === "INTERFACE") {
      alert("인터페이스로 수신된 예정전표는 수정하실 수 없습니다.");
      return;
    }
    var PROCESS_CD = 'A';
    var data = {
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_OUTBOUND_DATE: rowData.ORDER_DATE,
      P_OUTBOUND_NO: rowData.ORDER_NO,
      P_LINE_NO: "",
      P_PROCESS_CD: PROCESS_CD, // 프로세스코드([A]예정, [B]등록)
      P_STATE_DIV: "1" // 상태구분([1]MIN, [2]MAX)
    }
    $NC.serviceCall("/LOM7090E/callSP.do", {
      P_QUERY_ID: "WF.GET_LO_OUTBOUND_STATE",
      P_QUERY_PARAMS: $NC.getParams(data)
    }, onSuccessT1Pop);
}

function onSuccessT1Pop(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
    if (!$NC.isNull(resultData)) {
      if (resultData.O_MSG === "OK") {
        if (rowData.OUTBOUND_STATE !== resultData.O_OUTBOUND_STATE) {
          alert("[진행상태 : " + resultData.O_OUTBOUND_STATE + "] 데이터가 변경되었습니다.\n다시 조회 후 데이터를 확인하십시오.");
          return;
        }
      } else {
        alert(resultData.O_MSG);
        return;
      }
    } else {
      alert("출고진행상태를 확인하지 못했습니다.\n다시 처리하십시오.");
      return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CENTER_CD_F = $("#cboQCenter_Cd option:selected").text();
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NC.G_MAIN.showProgramSubPopup({
      PROGRAM_ID: "LOM7090P",
      PROGRAM_NM: "출고등록/수정",
      url: "lo/LOM7090P.html",
      width: 1024,
      // height: 600,
      height: 750,
      userData: {
        P_PROCESS_CD: PROCESS_CD,
        P_CENTER_CD: CENTER_CD,
        P_CENTER_CD_F: CENTER_CD_F,
        P_BU_CD: BU_CD,
        P_BU_NM: BU_NM,
        P_CUST_CD: CUST_CD,
        P_POLICY_LO190: $NC.G_VAR.policyVal.LO190,
        P_POLICY_LO210: $NC.G_VAR.policyVal.LO210,
        P_POLICY_LO221: $NC.G_VAR.policyVal.LO221,
        P_POLICY_LO250: $NC.G_VAR.policyVal.LO250,
        P_PROCESS_STATE_BW: '20',//$NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
        P_PROCESS_STATE_FW: '10',//$NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
        P_MASTER_DS: rowData,
        P_DETAIL_DS: G_GRDT1SUB.data.getItems()
      },
      onOk: function() {
        //setDeliveryBatchCombo("B"); // 배송차수 콤보 재생성
        _Inquiry();
      }
    });
  };
}

/*
 * Tab1 Right-Bottom
 */
function grdT1SubInitialize() {
  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Sub", {
    columns: grdT1SubOnGetColumns(),
    queryId: "LOM7090E.RS_T1_SUB",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT1SUB.view.onSelectedRowsChanged.subscribe(grdT1SubOnAfterScroll);
}

function grdT1SubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 40,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "위탁사",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "위탁사명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션명",
    minWidth: 180
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
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE",
    field: "ITEM_STATE",
    name: "상태",
    minWidth: 40
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 50,
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
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "주문순번",
    minWidth: 80,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1SubOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1SUB.lastRow != null) {
    if (row == G_GRDT1SUB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Sub", row + 1);
}


/*
 * Tab2 Left
 */
function grdT2MasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LOM7090E.RS_T2_MASTER",
    sortCol: "VENDOR_CD",
    gridOptions: options
  });

  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
  G_GRDT2MASTER.view.onHeaderClick.subscribe(grdT2MasterOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT2MASTER, "CHECK_YN");  
}

function grdT2MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    maxWidth: 30,
    resizable: false,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "ORDER_TYPE_NM",
    field: "ORDER_TYPE_NM",
    name: "주문구분",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "예정일자",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CNT_A",
    field: "CNT_A",
    name: "총건수",
    minWidth: 80,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2MASTER.lastRow != null) {
    if (row == G_GRDT2MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdT2Master", row + 1);
  var rowData = G_GRDT2MASTER.data.getItem(row);
  getDataT2Detail(rowData);
}

/*
 * Tab2 Right-Top
 */
function grdT2DetailInitialize() {
  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Detail", {
    columns: grdT2DetailOnGetColumns(),
    queryId: "LOM7090E.RS_T2_DETAIL",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT2DETAIL.view.onSelectedRowsChanged.subscribe(grdT2DetailOnAfterScroll);
  
  G_GRDT2DETAIL.view.onHeaderClick.subscribe(grdT2DetailOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT2DETAIL, "CHECK_YN");
}

function grdT2DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    maxWidth: 30,
    resizable: false,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "출고구분",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_USER_ID2",
    field: "ENTRY_USER_ID",
    name: "등록자",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_DATETIME2",
    field: "ENTRY_DATETIME",
    name: "등록시간",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "TOT_ENTRY_QTY",
    field: "TOT_ENTRY_QTY",
    name: "총수량",
    cssClass: "align-right",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "주문일지",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATETIME1",
    field: "BU_DATETIME",
    name: "주문시간",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "주문번호",
    minWidth: 80
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2DetailOnAfterScroll(e, args) {
  var row = args.rows[0];
  if (G_GRDT2DETAIL.lastRow != null) {
    if (row == G_GRDT2DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdT2Detail", row + 1);
  var rowData = G_GRDT2DETAIL.data.getItem(row);
  getDataT2Sub(rowData);
}

/*
 * Tab2 Right-Bottom
 */
function grdT2SubInitialize() {
  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Sub", {
    columns: grdT2SubOnGetColumns(),
    queryId: "LOM7090E.RS_T2_SUB",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT2SUB.view.onSelectedRowsChanged.subscribe(grdT2SubOnAfterScroll);
}

function grdT2SubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 40,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "위탁사",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "위탁사명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션명",
    minWidth: 180
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
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 50,
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
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_LINE_NO",
    field: "ORDER_LINE_NO",
    name: "주문순번",
    minWidth: 80,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2SubOnAfterScroll(e, args) {
  var row = args.rows[0];
  if (G_GRDT2SUB.lastRow != null) {
    if (row == G_GRDT2SUB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdT2Sub", row + 1);
}


/*
 * Tab3 Left
 */
function grdT3MasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT3Master", {
    columns: grdT3MasterOnGetColumns(),
    queryId: "LOM7090E.RS_T3_MASTER",
    sortCol: "VENDOR_CD",
    gridOptions: options
  });

  G_GRDT3MASTER.view.onSelectedRowsChanged.subscribe(grdT3MasterOnAfterScroll);
  //G_GRDT3MASTER.view.onBeforeEditCell.subscribe(grdT3MasterOnBeforeEditCell);
  //G_GRDT3MASTER.view.onCellChange.subscribe(grdT3MasterOnCellChange);
  G_GRDT3MASTER.view.onHeaderClick.subscribe(grdT3MasterOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT3MASTER, "CHECK_YN");  
}

function grdT3MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    width: 30,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    //editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });  
  $NC.setGridColumn(columns, {
    id: "ORDER_TYPE_NM",
    field: "ORDER_TYPE_NM",
    name: "주문구분",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_BATCH",
    field: "OUTBOUND_BATCH",
    name: "출고지시차수",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CNT_A",
    field: "CNT_A",
    name: "총건수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PRINT_TYPE",
    field: "PRINT_TYPE",
    name: "출력구분",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "PRINT_YN",
    field: "PRINT_YN",
    name: "출력여부",
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    minWidth: 80,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT3MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT3MASTER.lastRow != null) {
    if (row == G_GRDT3MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdT3Master", row + 1);
  var rowData = G_GRDT3MASTER.data.getItem(row);
  getDataT3Detail(rowData);
}

/*
 * Tab2 Right-Top
 */
function grdT3DetailInitialize() {
  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT3Detail", {
    columns: grdT3DetailOnGetColumns(),
    queryId: "LOM7090E.RS_T3_DETAIL",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT3DETAIL.view.onSelectedRowsChanged.subscribe(grdT3DetailOnAfterScroll);
  
  G_GRDT3DETAIL.view.onHeaderClick.subscribe(grdT3DetailOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT3DETAIL, "CHECK_YN");
}

function grdT3DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    width: 30,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    //editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "출고구분",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "DIRECTIONS_USER_ID2",
    field: "DIRECTIONS_USER_ID",
    name: "지시자",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "DIRECTIONS_DATETIME2",
    field: "DIRECTIONS_DATETIME",
    name: "지시시간",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "TOT_ENTRY_QTY",
    field: "TOT_ENTRY_QTY",
    name: "총수량",
    cssClass: "align-right",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "주문일지",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATETIME1",
    field: "BU_DATETIME",
    name: "주문시간",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "주문번호",
    minWidth: 80
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT3DetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT3DETAIL.lastRow != null) {
    if (row == G_GRDT3DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdT3Detail", row + 1);
  var rowData = G_GRDT3DETAIL.data.getItem(row);
  getDataT3Sub(rowData);

}

/*
 * Tab2 Right-Bottom
 */
function grdT3SubInitialize() {
  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT3Sub", {
    columns: grdT3SubOnGetColumns(),
    queryId: "LOM7090E.RS_T3_SUB",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT3SUB.view.onSelectedRowsChanged.subscribe(grdT3SubOnAfterScroll);
}

function grdT3SubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 40,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "위탁사",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "위탁사명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_OPTION_NM",
    field: "DEAL_OPTION_NM",
    name: "옵션명",
    minWidth: 180
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
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 50,
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
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_LINE_NO",
    field: "ORDER_LINE_NO",
    name: "주문순번",
    minWidth: 80,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT3SubOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT3SUB.lastRow != null) {
    if (row == G_GRDT3SUB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdT3Sub", row + 1);
}


/*
 * Tab4 Left
 */
function grdT4MasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT4Master", {
    columns: grdT4MasterOnGetColumns(),
    queryId: "LOM7090E.RS_T4_MASTER",
    sortCol: "VENDOR_CD",
    gridOptions: options
  });

  G_GRDT4MASTER.view.onSelectedRowsChanged.subscribe(grdT4MasterOnAfterScroll);
  //G_GRDT4MASTER.view.onBeforeEditCell.subscribe(grdT4MasterOnBeforeEditCell);
  //G_GRDT4MASTER.view.onCellChange.subscribe(grdT4MasterOnCellChange);
  G_GRDT4MASTER.view.onHeaderClick.subscribe(grdT4MasterOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT4MASTER, "CHECK_YN");  
}

function grdT4MasterOnGetColumns() {

  var columns = [ ]; 
  $NC.setGridColumn(columns, {
    id: "ORDER_TYPE_NM",
    field: "ORDER_TYPE_NM",
    name: "주문구분",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_BATCH",
    field: "OUTBOUND_BATCH",
    name: "출고지시차수",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CNT_A",
    field: "CNT_A",
    name: "총건수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_STATE_NM",
    field: "OUTBOUND_STATE_NM",
    name: "진행상태",
    minWidth: 100
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT4MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT4MASTER.lastRow != null) {
    if (row == G_GRDT4MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdT4Master", row + 1);
  var rowData = G_GRDT4MASTER.data.getItem(row);
  getDataT4Detail(rowData);
}

/*
 * Tab2 Right-Top
 */
function grdT4DetailInitialize() {
  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT4Detail", {
    columns: grdT4DetailOnGetColumns(),
    queryId: "LOM7090E.RS_T4_DETAIL",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT4DETAIL.view.onSelectedRowsChanged.subscribe(grdT4DetailOnAfterScroll);
  
  G_GRDT4DETAIL.view.onHeaderClick.subscribe(grdT4DetailOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDT4DETAIL, "CHECK_YN");
}

function grdT4DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "출고구분",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_USER_ID",
    field: "CONFIRM_USER_ID",
    name: "확정작업자",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_DATETIME",
    field: "CONFIRM_DATETIME",
    name: "확정일시",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_USER_ID",
    field: "DELIVERY_USER_ID",
    name: "배송작업자",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_DATETIME",
    field: "DELIVERY_DATETIME",
    name: "배송일시",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "TOT_ENTRY_QTY",
    field: "TOT_ENTRY_QTY",
    name: "총수량",
    cssClass: "align-right",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "주문일지",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATETIME1",
    field: "BU_DATETIME",
    name: "주문시간",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "주문번호",
    minWidth: 80
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT4DetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT4DETAIL.lastRow != null) {
    if (row == G_GRDT4DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdT4Detail", row + 1);
  var rowData = G_GRDT4DETAIL.data.getItem(row);
  getDataT4Sub(rowData);

}

/*
 * Tab2 Right-Bottom
 */
function grdT4SubInitialize() {
  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT4Sub", {
    columns: grdT4SubOnGetColumns(),
    queryId: "LOM7090E.RS_T4_SUB",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDT4SUB.view.onSelectedRowsChanged.subscribe(grdT4SubOnAfterScroll);
}

function grdT4SubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 40,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "위탁사",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "위탁사명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_OPTION_NM",
    field: "DEAL_OPTION_NM",
    name: "옵션명",
    minWidth: 180
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
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 50,
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
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_LINE_NO",
    field: "ORDER_LINE_NO",
    name: "주문순번",
    minWidth: 80,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT4SubOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT4SUB.lastRow != null) {
    if (row == G_GRDT4SUB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdT4Sub", row + 1);
}

/**
 * 검색조건 데이터 검증
 */
/*
<예정>
물류센터  사업구분  예정일자2       출고일자1   
center    bu        tdDirectHidden  tdOutboundHidden

<등록>
물류센터  사업구분  예정일자2(출고)
center    bu        tdDirectHidden

<지시>
물류센터  사업구분  예정일자2(출고)  출고차수
center    bu        tdDirectHidden   tdQDsp_Outbound_Batch
*/
function searchValidataion(flag) {
  CENTER_CD        = $NC.getValue("#cboQCenter_Cd");
  BU_CD            = $NC.getValue("#edtQBu_Cd");
//  if (IS_ALL_DATE) {
//    ORDER_DATE1      = '';
//    ORDER_DATE2      = '';
//  } else {
//    ORDER_DATE1      = $NC.getValue("#dtpQOrder_Date1");
//    ORDER_DATE2      = $NC.getValue("#dtpQOrder_Date2");
//  }
  
  ORDER_DATE1      = $NC.getValue("#dtpQOrder_Date1");
  ORDER_DATE2      = $NC.getValue("#dtpQOrder_Date2"); 
  OUTBOUND_DATE    = $NC.getValue("#dtpQOutbound_Date");
  OUTBOUND_BATCH   = $NC.getValue("#cboQOutbound_Batch");

  DEAL_ID          = $NC.getValue('#edtQDeal_Id');
  OWN_BRAND_CD     = $NC.getValue('#edtQOwn_Brand_Cd');
  BRAND_CD         = $NC.getValue('#edtQBrand_Cd');
  BU_TIME1         = $NC.getValue('#edtQBu_Time1');
  BU_TIME2         = $NC.getValue('#edtQBu_Time2');
  BU_TIME          = BU_TIME1 + '' + BU_TIME2;

  BU_NO            = $NC.getValue('#edtQBu_No');
  DELIVERY_TYPE    = $NC.getValue('#cboQDelivery_Type');
  MALL_CD          = $NC.getValue('#cboQMall_Cd');
  INOUT_CD         = $NC.getValue('#cboQInout_Cd');

  SHIPPER_NM       = $NC.getValue('#edtQShipper_Nm');
  ORDERER_NM       = $NC.getValue('#edtQOrderer_Nm');
  ITEM_CD          = $NC.getValue('#edtQItem_Cd');
  ITEM_NM          = $NC.getValue('#edtQItem_Nm');
  SHIP_TYPE        = $NC.getValue('#cboQShip_Type');
  INORDER_TYPE     = $NC.getValue('#cboQInorder_Type');
  DELIVERY_TYPE2   = $NC.getValue('#cboQDelivery_Type2');
  SHIP_PRICE_TYPE  = $NC.getValue('#cboQShip_Price_Type');
  HOLD_YN          = $NC.getValue('#cboQHold_Yn');

  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return false;
  }
  if ($NC.isNull(BU_CD)) {
    alert("사업구분 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return false;
  }

  if (!IS_ALL_DATE && flag == 'T1') {
    if ($NC.isNull(ORDER_DATE1)) {
      alert("예정 시작일자를 입력하십시오.");
      $NC.setFocus("#dtpQOrder_Date1");
      return false;
    }
    if ($NC.isNull(ORDER_DATE2)) {
      alert("예정 종료일자를 입력하십시오.");
      $NC.setFocus("#dtpQOrder_Date2");
      return false;
    }
    if (ORDER_DATE1 > ORDER_DATE2) {
      alert("예정일자 범위 입력오류입니다.");
      $NC.setFocus("#dtpQOrder_Date1");
      return false;
    }
    if ($NC.isNull(OUTBOUND_DATE)) {
      alert("출고일자를 입력하십시오.");
      $NC.setFocus("#dtpQOutbound_Date");
      return false;
    }
  }

  if (!IS_ALL_DATE && flag == 'T2') {
    if ($NC.isNull(ORDER_DATE1)) {
      alert("출고 시작일자를 입력하십시오.");
      $NC.setFocus("#dtpQOrder_Date1");
      return false;
    }
    if ($NC.isNull(ORDER_DATE2)) {
      alert("출고 종료일자를 입력하십시오.");
      $NC.setFocus("#dtpQOrder_Date2");
      return false;
    }
    if (ORDER_DATE1 > ORDER_DATE2) {
      alert("출고일자 범위 입력오류입니다.");
      $NC.setFocus("#dtpQOrder_Date1");
      return false;
    }
  }

  if (flag == 'T3') {
    if ($NC.isNull(ORDER_DATE1)) {
      alert("출고 시작일자를 입력하십시오.");
      $NC.setFocus("#dtpQOrder_Date1");
      return false;
    }
    if ($NC.isNull(ORDER_DATE2)) {
      alert("출고 종료일자를 입력하십시오.");
      $NC.setFocus("#dtpQOrder_Date2");
      return false;
    }
    if (ORDER_DATE1 > ORDER_DATE2) {
      alert("출고일자 범위 입력오류입니다.");
      $NC.setFocus("#dtpQOrder_Date1");
      return false;
    }
    if ($NC.isNull(OUTBOUND_BATCH)) {
      alert("출고차수를 입력하십시오.");
      $NC.setFocus("#dtpQOutbound_Batch");
      return false;
    }
  }
  if (flag == 'T4') {
    /*if ($NC.isNull(ORDER_DATE1)) {
      alert("출고 시작일자를 입력하십시오.");
      $NC.setFocus("#dtpQOrder_Date1");
      return false;
    }
    if ($NC.isNull(ORDER_DATE2)) {
      alert("출고 종료일자를 입력하십시오.");
      $NC.setFocus("#dtpQOrder_Date2");
      return false;
    }
    if (ORDER_DATE1 > ORDER_DATE2) {
      alert("출고일자 범위 입력오류입니다.");
      $NC.setFocus("#dtpQOrder_Date1");
      return false;
    }
    if ($NC.isNull(OUTBOUND_BATCH)) {
      alert("출고차수를 입력하십시오.");
      $NC.setFocus("#dtpQOutbound_Batch");
      return false;
    }*/
  }
  return true;
}

/**
 * T1Master
 */
function getDataT1Master() {
  if(!searchValidataion('T1')) {
    return false;
  }
  // T1 Master 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1MASTER);
  $NC.setInitGridVar(G_GRDT1DETAIL);
  $NC.setInitGridVar(G_GRDT1SUB);
  
  if (IS_ALL_DATE) {
    ORDER_DATE1 = "";
    ORDER_DATE2 = "";
  } else {
    ORDER_DATE1 = $NC.getValue('#dtpQOrder_Date1');
    ORDER_DATE2 = $NC.getValue('#dtpQOrder_Date2');
  }

  // 파라메터 세팅
  G_GRDT1MASTER.queryParams = $NC.getParams({
     P_CENTER_CD        : CENTER_CD         // 물류센터
    ,P_BU_CD            : BU_CD             // 사업구분
    ,P_ORDER_DATE1      : ORDER_DATE1       // 예정(출고)일자 시작
    ,P_ORDER_DATE2      : ORDER_DATE2       // 예정(출고)일자 종료
    //,P_OUTBOUND_DATE    : OUTBOUND_DATE     // 출고일자
    //,P_OUTBOUND_BATCH   : OUTBOUND_BATCH    // 출고차수
    ,P_INOUT_CD         : INOUT_CD          // 입출고구분
    ,P_BU_NO            : BU_NO             // 주문번호
    ,P_BRAND_CD         : BRAND_CD          // 판매사
    ,P_ITEM_CD          : ITEM_CD           // 상품코드
    ,P_ITEM_NM          : ITEM_NM           // 상품명
    ,P_ORDERER_NM       : ORDERER_NM        // 주문자명
    ,P_SHIPPER_NM       : SHIPPER_NM        // 수령자명
    ,P_MALL_CD          : MALL_CD           // 몰구분
    ,P_INORDER_TYPE     : INORDER_TYPE      // 매입형태
    ,P_SHIP_TYPE        : SHIP_TYPE         // 운송구분
    ,P_SHIP_PRICE_TYPE  : SHIP_PRICE_TYPE   // 운송비구분
    ,P_HOLD_YN          : HOLD_YN           // 보류여부
    ,P_DEAL_ID          : DEAL_ID           // 딜ID
    ,P_DELIVERY_TYPE    : DELIVERY_TYPE     // 배송유형
    ,P_BU_TIME          : BU_TIME           // 주문시간 시작
    ,P_DELIVERY_TYPE2   : DELIVERY_TYPE2    // 배송지역구분
    ,P_OWN_BRAND_CD     : OWN_BRAND_CD      // 위탁사
    ,P_USER_ID          : $NC.G_USERINFO.USER_ID
  });
  // T1 MASTER 데이터 조회
  $NC.serviceCall("/LOM7090E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master, null, null, '7090E_RS_T1_MASTER');
}

/**
 * T1Detail
 * rowData// CNT_A: 2, CRUD: "R", ORDER_DATE: "2015-02-13" ,ORDER_TYPE: "11", ORDER_TYPE_NM: "일반주문-당일", id: "id_1"
 */
function getDataT1Detail(rowData) {
  if(!searchValidataion('T1')) {
    return false;
  }
  // T1 DETAIL 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1DETAIL);

  if (IS_ALL_DATE) {
    ORDER_DATE1 = "";
    ORDER_DATE2 = "";
  } else {
    ORDER_DATE1 = $NC.getValue('#dtpQOrder_Date1');
    ORDER_DATE2 = $NC.getValue('#dtpQOrder_Date2');
  }
  
  G_GRDT1DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD         : CENTER_CD         // 물류센터
    ,P_BU_CD            : BU_CD             // 사업구분
    ,P_ORDER_DATE1      : ORDER_DATE1       // 예정(출고)일자 시작
    ,P_ORDER_DATE2      : ORDER_DATE2       // 예정(출고)일자 종료
    //,P_OUTBOUND_DATE    : OUTBOUND_DATE     // 출고일자
    //,P_OUTBOUND_BATCH   : OUTBOUND_BATCH    // 출고차수
    ,P_INOUT_CD         : INOUT_CD          // 입출고구분
    ,P_BU_NO            : BU_NO             // 주문번호
    ,P_BRAND_CD         : BRAND_CD          // 판매사
    ,P_ITEM_CD          : ITEM_CD           // 상품코드
    ,P_ITEM_NM          : ITEM_NM           // 상품명
    ,P_ORDERER_NM       : ORDERER_NM        // 주문자명
    ,P_SHIPPER_NM       : SHIPPER_NM        // 수령자명
    ,P_MALL_CD          : MALL_CD           // 몰구분
    ,P_INORDER_TYPE     : INORDER_TYPE      // 매입형태
    ,P_SHIP_TYPE        : SHIP_TYPE         // 운송구분
    ,P_SHIP_PRICE_TYPE  : SHIP_PRICE_TYPE   // 운송비구분
    ,P_HOLD_YN          : HOLD_YN           // 보류여부
    ,P_DEAL_ID          : DEAL_ID           // 딜ID
    ,P_DELIVERY_TYPE    : DELIVERY_TYPE     // 배송유형
    ,P_BU_TIME          : BU_TIME           // 주문시간 시작
    ,P_DELIVERY_TYPE2   : DELIVERY_TYPE2    // 배송지역구분
    ,P_OWN_BRAND_CD     : OWN_BRAND_CD      // 위탁사
    ,P_USER_ID          : $NC.G_USERINFO.USER_ID
    ,P_ORDER_TYPE       : rowData['ORDER_TYPE']
  });

  // 데이터 조회
  $NC.serviceCall("/LOM7090E/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetT1Detail, null, null, '7090E_RS_T1_DETAIL');
}

/**
 * T1Sub
 */
function getDataT1Sub(rowData) {
  if(!searchValidataion('T1')) {
    return false;
  }
  // T1 DETAIL 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1SUB);

  G_GRDT1SUB.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_ORDER_DATE: rowData['ORDER_DATE'],
    P_ORDER_NO: rowData['ORDER_NO']
  });

  // 데이터 조회
  $NC.serviceCall("/LOM7090E/getDataSet.do", $NC.getGridParams(G_GRDT1SUB), onGetT1Sub, null, null, '7090E_RS_T1_SUB');
}

/**
 * T2Master 데이터 요청
 */
function getDataT2Master() {
  if(!searchValidataion('T2')) {
    return false;
  }
  //var ORDER_TYPE = $NC.getValue("#cboQOrder_Div");
  // T2 Master 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT2MASTER);
  $NC.setInitGridVar(G_GRDT2DETAIL);
  $NC.setInitGridVar(G_GRDT2SUB);
  
  // 파라메터 세팅
  if (IS_ALL_DATE) {
    ORDER_DATE1 = "";
    ORDER_DATE2 = "";
  } else {
    ORDER_DATE1 = $NC.getValue('#dtpQOrder_Date1');
    ORDER_DATE2 = $NC.getValue('#dtpQOrder_Date2');
  }

  G_GRDT2MASTER.queryParams = $NC.getParams({
     P_CENTER_CD        : CENTER_CD         // 물류센터
    ,P_BU_CD            : BU_CD             // 사업구분
    ,P_ORDER_DATE1      : ORDER_DATE1       // 예정(출고)일자 시작
    ,P_ORDER_DATE2      : ORDER_DATE2       // 예정(출고)일자 종료
    //,P_OUTBOUND_DATE    : OUTBOUND_DATE     // 출고일자
    //,P_OUTBOUND_BATCH   : OUTBOUND_BATCH    // 출고차수
    ,P_INOUT_CD         : INOUT_CD          // 입출고구분
    ,P_BU_NO            : BU_NO             // 주문번호
    ,P_BRAND_CD         : BRAND_CD          // 판매사
    ,P_ITEM_CD          : ITEM_CD           // 상품코드
    ,P_ITEM_NM          : ITEM_NM           // 상품명
    ,P_ORDERER_NM       : ORDERER_NM        // 주문자명
    ,P_SHIPPER_NM       : SHIPPER_NM        // 수령자명
    ,P_MALL_CD          : MALL_CD           // 몰구분
    ,P_INORDER_TYPE     : INORDER_TYPE      // 매입형태
    ,P_SHIP_TYPE        : SHIP_TYPE         // 운송구분
    ,P_SHIP_PRICE_TYPE  : SHIP_PRICE_TYPE   // 운송비구분
    //,P_HOLD_YN          : HOLD_YN           // 보류여부
    ,P_DEAL_ID          : DEAL_ID           // 딜ID
    ,P_DELIVERY_TYPE    : DELIVERY_TYPE     // 배송유형
    ,P_BU_TIME          : BU_TIME           // 주문시간 시작
    ,P_DELIVERY_TYPE2   : DELIVERY_TYPE2    // 배송지역구분
    ,P_OWN_BRAND_CD     : OWN_BRAND_CD      // 위탁사
    ,P_USER_ID          : $NC.G_USERINFO.USER_ID
  });
  // T2 MASTER 데이터 조회
  $NC.serviceCall("/LOM7090E/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master, null, null, '7090E_RS_T2_MASTER');
}

/**
 * T2 Detail 데이터 조회
 */
function getDataT2Detail(rowData) {
  if(!searchValidataion('T2')) {
    return false;
  }
  // T1 DETAIL 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT2DETAIL);
  
  if(rowData['ORDER_TYPE']==="%" && IS_ALL_DATE ) {
    ORDER_DATE1 = "";
    ORDER_DATE2 = "";
  } else if (rowData['ORDER_TYPE']==="%"){
    ORDER_DATE1 = $NC.getValue('#dtpQOrder_Date1');
    ORDER_DATE2 = $NC.getValue('#dtpQOrder_Date2');
  } else {
    ORDER_DATE1 = rowData['OUTBOUND_DATE'];
    ORDER_DATE2 = rowData['OUTBOUND_DATE'];
  }
  
  G_GRDT2DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD         : CENTER_CD         // 물류센터
    ,P_BU_CD            : BU_CD             // 사업구분
    ,P_ORDER_DATE1      : ORDER_DATE1       // 예정(출고)일자 시작
    ,P_ORDER_DATE2      : ORDER_DATE2       // 예정(출고)일자 종료
    //,P_OUTBOUND_DATE    : OUTBOUND_DATE     // 출고일자
    //,P_OUTBOUND_BATCH   : OUTBOUND_BATCH    // 출고차수
    ,P_INOUT_CD         : INOUT_CD          // 입출고구분
    ,P_BU_NO            : BU_NO             // 주문번호
    ,P_BRAND_CD         : BRAND_CD          // 판매사
    ,P_ITEM_CD          : ITEM_CD           // 상품코드
    ,P_ITEM_NM          : ITEM_NM           // 상품명
    ,P_ORDERER_NM       : ORDERER_NM        // 주문자명
    ,P_SHIPPER_NM       : SHIPPER_NM        // 수령자명
    ,P_MALL_CD          : MALL_CD           // 몰구분
    ,P_INORDER_TYPE     : INORDER_TYPE      // 매입형태
    ,P_SHIP_TYPE        : SHIP_TYPE         // 운송구분
    ,P_SHIP_PRICE_TYPE  : SHIP_PRICE_TYPE   // 운송비구분
    //,P_HOLD_YN          : HOLD_YN           // 보류여부
    ,P_DEAL_ID          : DEAL_ID           // 딜ID
    ,P_DELIVERY_TYPE    : DELIVERY_TYPE     // 배송유형
    ,P_BU_TIME          : BU_TIME           // 주문시간 시작
    ,P_DELIVERY_TYPE2   : DELIVERY_TYPE2    // 배송지역구분
    ,P_OWN_BRAND_CD     : OWN_BRAND_CD      // 위탁사
    ,P_USER_ID          : $NC.G_USERINFO.USER_ID
    ,P_ORDER_TYPE       : rowData['ORDER_TYPE']
  });

  // 데이터 조회
  $NC.serviceCall("/LOM7090E/getDataSet.do", $NC.getGridParams(G_GRDT2DETAIL), onGetT2Detail, 
    null, null, '7090E_RS_T2_DETAIL');
}

/**
 * T2 Sub
 */
function getDataT2Sub(rowData) {
  if(!searchValidataion('T2')) {
    return false;
  }
  // T1 DETAIL 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT2SUB);

  //{"P_CENTER_CD": "G1","P_BU_CD": "5000","P_OUTBOUND_DATE": "2015-03-17","P_OUTBOUND_NO": "000001" }
  G_GRDT2SUB.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: rowData['OUTBOUND_DATE'],
    P_OUTBOUND_NO: rowData['OUTBOUND_NO']
  });

  // 데이터 조회
  $NC.serviceCall("/LOM7090E/getDataSet.do", $NC.getGridParams(G_GRDT2SUB), onGetT2Sub, null, null, '7090E_RS_T2_SUB');
}

/**
 * T3 Master
 */
function getDataT3Master() {
  if(!searchValidataion('T3')) {
    return false;
  }
  //var ORDER_TYPE = '11'//$NC.getValue("#cboQOrder_Type");

  // T1 Master 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT3MASTER);
  $NC.setInitGridVar(G_GRDT3DETAIL);
  $NC.setInitGridVar(G_GRDT3SUB);

  // 파라메터 세팅
  if (IS_ALL_DATE) {
    ORDER_DATE1 = "";
    ORDER_DATE2 = "";
  } else {
    ORDER_DATE1 = $NC.getValue('#dtpQOrder_Date1');
    ORDER_DATE2 = $NC.getValue('#dtpQOrder_Date2');
  }
  
  // 파라메터 세팅
  G_GRDT3MASTER.queryParams = $NC.getParams({
     P_CENTER_CD        : CENTER_CD         // 물류센터
    ,P_BU_CD            : BU_CD             // 사업구분
    ,P_ORDER_DATE1      : ORDER_DATE1       // 예정(출고)일자 시작
    ,P_ORDER_DATE2      : ORDER_DATE2       // 예정(출고)일자 종료
    //,P_OUTBOUND_DATE    : OUTBOUND_DATE     // 출고일자
    ,P_OUTBOUND_BATCH   : OUTBOUND_BATCH    // 출고차수

    ,P_DEAL_ID          : DEAL_ID           // 딜ID
    ,P_OWN_BRAND_CD     : OWN_BRAND_CD      // 위탁사
    ,P_BRAND_CD         : BRAND_CD          // 판매사
    ,P_BU_TIME          : BU_TIME           // 주문시간 시작

    ,P_BU_NO            : BU_NO             // 주문번호
    ,P_DELIVERY_TYPE    : DELIVERY_TYPE     // 배송유형
    ,P_MALL_CD          : MALL_CD           // 몰구분
    ,P_INOUT_CD         : INOUT_CD          // 입출고구분

    ,P_SHIPPER_NM       : SHIPPER_NM        // 수령자명
    ,P_ORDERER_NM       : ORDERER_NM        // 주문자명
    ,P_ITEM_CD          : ITEM_CD           // 상품코드
    ,P_ITEM_NM          : ITEM_NM           // 상품명
    ,P_SHIP_TYPE        : SHIP_TYPE         // 운송구분
    ,P_INORDER_TYPE     : INORDER_TYPE      // 매입형태
    ,P_DELIVERY_TYPE2   : DELIVERY_TYPE2    // 배송지역구분
    ,P_SHIP_PRICE_TYPE  : SHIP_PRICE_TYPE   // 운송비구분
    //,P_HOLD_YN          : HOLD_YN           // 보류여부
    ,P_USER_ID          : $NC.G_USERINFO.USER_ID
  });
  // T1 MASTER 데이터 조회
  $NC.serviceCall("/LOM7090E/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetT3Master, null, null, '7090E_RS_T3_MASTER');
}

/**
 * T3 Detail
 */
function getDataT3Detail(rowData) {
  if(!searchValidataion('T3')) {
    return false;
  }
  //var ORDER_TYPE = '11'//$NC.getValue("#cboQOrder_Type");
  // T1 DETAIL 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT3DETAIL);

  //{"P_CENTER_CD": "G1","P_BU_CD": "5000","P_OUTBOUND_DATE": "2015-01-14","P_INOUT_CD": "","P_OWN_BRAND_CD": "%",
  // "P_USER_ID": "WMS7","P_DEAL_ID": "%","P_ORDER_TYPE": "11" }
  G_GRDT3DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD        : CENTER_CD         // 물류센터
    ,P_BU_CD            : BU_CD             // 사업구분
    ,P_OUTBOUND_DATE    : rowData['OUTBOUND_DATE']     // 출고일자
    ,P_OUTBOUND_BATCH   : rowData['OUTBOUND_BATCH']    // 출고차수

    ,P_DEAL_ID          : DEAL_ID           // 딜ID
    ,P_OWN_BRAND_CD     : OWN_BRAND_CD      // 위탁사
    ,P_BRAND_CD         : BRAND_CD          // 판매사
    ,P_BU_TIME          : BU_TIME           // 주문시간 시작

    ,P_BU_NO            : BU_NO             // 주문번호
    ,P_DELIVERY_TYPE    : DELIVERY_TYPE     // 배송유형
    ,P_MALL_CD          : MALL_CD           // 몰구분
    ,P_INOUT_CD         : INOUT_CD          // 입출고구분

    ,P_SHIPPER_NM       : SHIPPER_NM        // 수령자명
    ,P_ORDERER_NM       : ORDERER_NM        // 주문자명
    ,P_ITEM_CD          : ITEM_CD           // 상품코드
    ,P_ITEM_NM          : ITEM_NM           // 상품명
    ,P_SHIP_TYPE        : SHIP_TYPE         // 운송구분
    ,P_INORDER_TYPE     : INORDER_TYPE      // 매입형태
    ,P_DELIVERY_TYPE2   : DELIVERY_TYPE2    // 배송지역구분
    ,P_SHIP_PRICE_TYPE  : SHIP_PRICE_TYPE   // 운송비구분
    //,P_HOLD_YN          : HOLD_YN           // 보류여부
    ,P_USER_ID          : $NC.G_USERINFO.USER_ID    
    ,P_ORDER_TYPE       : rowData['ORDER_TYPE']
  });

  // 데이터 조회
  $NC.serviceCall("/LOM7090E/getDataSet.do", $NC.getGridParams(G_GRDT3DETAIL), onGetT3Detail, null, null, '7090E_RS_T3_DETAIL');
}

/**
 * T1Sub
 */
function getDataT3Sub(rowData) {
  if(!searchValidataion('T3')) {
    return false;
  }
  // T1 DETAIL 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT3SUB);

  //{"P_CENTER_CD": "G1","P_BU_CD": "5000","P_OUTBOUND_DATE": "2015-01-14","P_OUTBOUND_NO": "000001" }
  G_GRDT3SUB.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: rowData['OUTBOUND_DATE'],
    P_OUTBOUND_NO: rowData['OUTBOUND_NO']
  });

  // 데이터 조회
  $NC.serviceCall("/LOM7090E/getDataSet.do", $NC.getGridParams(G_GRDT3SUB), onGetT3Sub, null, null, '7090E_RS_T3_SUB');
}


/**
 * T4 Master
 */
function getDataT4Master() {
  if(!searchValidataion('T3')) {
    return false;
  }
  //var ORDER_TYPE = '11'//$NC.getValue("#cboQOrder_Type");

  // T4 Master 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT4MASTER);
  $NC.setInitGridVar(G_GRDT4DETAIL);
  $NC.setInitGridVar(G_GRDT4SUB);

  // 파라메터 세팅
  if (IS_ALL_DATE) {
    ORDER_DATE1 = "";
    ORDER_DATE2 = "";
  } else {
    ORDER_DATE1 = $NC.getValue('#dtpQOrder_Date1');
    ORDER_DATE2 = $NC.getValue('#dtpQOrder_Date2');
  }
  
  // 파라메터 세팅
  G_GRDT4MASTER.queryParams = $NC.getParams({
     P_CENTER_CD        : CENTER_CD         // 물류센터
    ,P_BU_CD            : BU_CD             // 사업구분
    ,P_ORDER_DATE1      : ORDER_DATE1       // 예정(출고)일자 시작
    ,P_ORDER_DATE2      : ORDER_DATE2       // 예정(출고)일자 종료
    //,P_OUTBOUND_DATE    : OUTBOUND_DATE     // 출고일자
    ,P_OUTBOUND_BATCH   : OUTBOUND_BATCH    // 출고차수

    ,P_DEAL_ID          : DEAL_ID           // 딜ID
    ,P_OWN_BRAND_CD     : OWN_BRAND_CD      // 위탁사
    ,P_BRAND_CD         : BRAND_CD          // 판매사
    ,P_BU_TIME          : BU_TIME           // 주문시간 시작

    ,P_BU_NO            : BU_NO             // 주문번호
    ,P_DELIVERY_TYPE    : DELIVERY_TYPE     // 배송유형
    ,P_MALL_CD          : MALL_CD           // 몰구분
    ,P_INOUT_CD         : INOUT_CD          // 입출고구분

    ,P_SHIPPER_NM       : SHIPPER_NM        // 수령자명
    ,P_ORDERER_NM       : ORDERER_NM        // 주문자명
    ,P_ITEM_CD          : ITEM_CD           // 상품코드
    ,P_ITEM_NM          : ITEM_NM           // 상품명
    ,P_SHIP_TYPE        : SHIP_TYPE         // 운송구분
    ,P_INORDER_TYPE     : INORDER_TYPE      // 매입형태
    ,P_DELIVERY_TYPE2   : DELIVERY_TYPE2    // 배송지역구분
    ,P_SHIP_PRICE_TYPE  : SHIP_PRICE_TYPE   // 운송비구분
    //,P_HOLD_YN          : HOLD_YN           // 보류여부
    ,P_USER_ID          : $NC.G_USERINFO.USER_ID
  });
  // T1 MASTER 데이터 조회
  $NC.serviceCall("/LOM7090E/getDataSet.do", $NC.getGridParams(G_GRDT4MASTER), onGetT4Master, null, null, '7090E_RS_T4_MASTER');
}

/**
 * T4 Detail
 */
function getDataT4Detail(rowData) {
  if(!searchValidataion('T4')) {
    return false;
  }
  //var ORDER_TYPE = '11'//$NC.getValue("#cboQOrder_Type");
  // T1 DETAIL 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT4DETAIL);

  //{"P_CENTER_CD": "G1","P_BU_CD": "5000","P_OUTBOUND_DATE": "2015-01-14","P_INOUT_CD": "","P_OWN_BRAND_CD": "%",
  // "P_USER_ID": "WMS7","P_DEAL_ID": "%","P_ORDER_TYPE": "11" }
  G_GRDT4DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD        : CENTER_CD         // 물류센터
    ,P_BU_CD            : BU_CD             // 사업구분
    ,P_OUTBOUND_DATE    : rowData['OUTBOUND_DATE']     // 출고일자
    ,P_OUTBOUND_BATCH   : rowData['OUTBOUND_BATCH']    // 출고차수

    ,P_DEAL_ID          : DEAL_ID           // 딜ID
    ,P_OWN_BRAND_CD     : OWN_BRAND_CD      // 위탁사
    ,P_BRAND_CD         : BRAND_CD          // 판매사
    ,P_BU_TIME          : BU_TIME           // 주문시간 시작

    ,P_BU_NO            : BU_NO             // 주문번호
    ,P_DELIVERY_TYPE    : DELIVERY_TYPE     // 배송유형
    ,P_MALL_CD          : MALL_CD           // 몰구분
    ,P_INOUT_CD         : INOUT_CD          // 입출고구분

    ,P_SHIPPER_NM       : SHIPPER_NM        // 수령자명
    ,P_ORDERER_NM       : ORDERER_NM        // 주문자명
    ,P_ITEM_CD          : ITEM_CD           // 상품코드
    ,P_ITEM_NM          : ITEM_NM           // 상품명
    ,P_SHIP_TYPE        : SHIP_TYPE         // 운송구분
    ,P_INORDER_TYPE     : INORDER_TYPE      // 매입형태
    ,P_DELIVERY_TYPE2   : DELIVERY_TYPE2    // 배송지역구분
    ,P_SHIP_PRICE_TYPE  : SHIP_PRICE_TYPE   // 운송비구분
    //,P_HOLD_YN          : HOLD_YN           // 보류여부
    ,P_USER_ID          : $NC.G_USERINFO.USER_ID    
    ,P_ORDER_TYPE       : rowData['ORDER_TYPE']
  });

  // 데이터 조회
  $NC.serviceCall("/LOM7090E/getDataSet.do", $NC.getGridParams(G_GRDT4DETAIL), onGetT4Detail, null, null, '7090E_RS_T4_DETAIL');
}

/**
 * T1Sub
 */
function getDataT4Sub(rowData) {
  if(!searchValidataion('T4')) {
    return false;
  }
  // T1 DETAIL 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT4SUB);

  //{"P_CENTER_CD": "G1","P_BU_CD": "5000","P_OUTBOUND_DATE": "2015-01-14","P_OUTBOUND_NO": "000001" }
  G_GRDT4SUB.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: rowData['OUTBOUND_DATE'],
    P_OUTBOUND_NO: rowData['OUTBOUND_NO']
  });

  // 데이터 조회
  $NC.serviceCall("/LOM7090E/getDataSet.do", $NC.getGridParams(G_GRDT4SUB), onGetT4Sub, null, null, '7090E_RS_T4_SUB');
}

/**
 * T1 Master 
 */
function onGetT1Master(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
  
  //console.log('T1 Master: ', G_GRDT1MASTER.data.getItems());
  var total = 0;
  if (G_GRDT1MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT1MASTER, 0);
    // 그리드의 확정수량의 합계 계산
    var items = G_GRDT1MASTER.data.getItems();
    for ( var i = 0; i < items.length; i++) {
      total = total + Number(items[i].CONFIRM_QTY);
    }
  } else {
    $NC.setGridDisplayRows("#grdT1Master", 0, 0);
    onGetT1Detail({
      data: null
    });
  }
  // 그리드의 확정수량의 합계를 전체합계란에 표시
  //$NC.setValue("#edtQStock_Qty1", $NC.getDisplayNumber(total));

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._excel = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * T1 Detail
 */
function onGetT1Detail(ajaxData) {
  $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
  $NC.setGridColumnHeaderCheckBox(G_GRDT1DETAIL, "CHECK_YN");
  
  //console.log('T1 Detail: ', G_GRDT1DETAIL.data.getItems());
  var total = 0;
  if (G_GRDT1DETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT1DETAIL, 0);
    // 그리드의 확정수량의 합계 계산
    var items = G_GRDT1DETAIL.data.getItems();
    for ( var i = 0; i < items.length; i++) {
      total = total + Number(items[i].CONFIRM_QTY);
    }
  } else {
    $NC.setGridDisplayRows("#grdT1Detail", 0, 0);
    onGetT1Sub({
      data: null
    });
  }
}

/**
 * T1 Detail
 */
function onGetT1Sub(ajaxData) {
  $NC.setInitGridData(G_GRDT1SUB, ajaxData);
  if (G_GRDT1SUB.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT1SUB, 0);
  } else {
    $NC.setGridDisplayRows("#grdT1Sub", 0, 0);
  }
  //console.log('T1 Sub: ', G_GRDT1SUB.data.getItems())
}

/**
 * T2 Master 응답
 */
function onGetT2Master(ajaxData) {
  $NC.setInitGridData(G_GRDT2MASTER, ajaxData);
  //console.log('T2 Master: ', G_GRDT2MASTER.data.getItems());

  var total = 0;
  if (G_GRDT2MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT2MASTER, 0);
    // 그리드의 확정수량의 합계 계산
    var items = G_GRDT2MASTER.data.getItems();
    for ( var i = 0; i < items.length; i++) {
      total = total + Number(items[i].CONFIRM_QTY);
    }
  } else {
    $NC.setGridDisplayRows("#grdT2Master", 0, 0);
    onGetT2Detail({
      data: null
    });
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._excel = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * T2 Detail 응답
 */
function onGetT2Detail(ajaxData) {
  $NC.setInitGridData(G_GRDT2DETAIL, ajaxData);
  $NC.setGridColumnHeaderCheckBox(G_GRDT2DETAIL, "CHECK_YN");
  //console.log('T2 Detail: ', G_GRDT2DETAIL.data.getItems());
  if (G_GRDT2DETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT2DETAIL, 0);
  } else {
    $NC.setGridDisplayRows("#grdT2Detail", 0, 0);
    onGetT2Sub({
      data: null
    });
  }
}

function setT2MasterOrder() {
  var rowCount = G_GRDT2MASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 먼저 후 처리하십시오.");
    return;
  }

  var result = confirm("출고지시 처리하시겠습니까?");
  if (!result) {
    return;
  }
  
  var masterData = G_GRDT2MASTER.data.getItems();
  var chkCnt = 0;
  var processDS = [ ];
  for (var i in masterData) {
    if (masterData[i].CHECK_YN === 'Y') {
      chkCnt++;
      var processData = {
          P_CENTER_CD: CENTER_CD,
          P_BU_CD: BU_CD,
          P_OUTBOUND_DATE: masterData[i].OUTBOUND_DATE,
          P_ORDER_TYPE: masterData[i].ORDER_TYPE
        };
        processDS.push(processData);      
    }
  }

  if (chkCnt == 0) {
    alert("출고지시 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 출고지시 처리 가능한 데이터가 없습니다.");
    return;
  }
  
  $NC.serviceCall("/LOM7090E/callOrderType.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: 'C',
    P_DIRECTION: 'FW',
    P_OUTBOUND_BATCH: '000',
    P_PROCESS_STATE_BW: '30',
    P_PROCESS_STATE_FW: '20',
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveT2Confirm, onSaveErrorT2Confirm, 2);
}

/**
 * T2 Sub
 */
function onGetT2Sub(ajaxData) {
  //console.log('T2 Sub: ', G_GRDT2SUB.data.getItems())
  $NC.setInitGridData(G_GRDT2SUB, ajaxData);
  if (G_GRDT2SUB.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT2SUB, 0);
  } else {
    $NC.setGridDisplayRows("#grdT1Sub", 0, 0);
  }
}

/**
 * T3 Master 
 */
function onGetT3Master(ajaxData) {
  $NC.setInitGridData(G_GRDT3MASTER, ajaxData);
  $NC.setGridColumnHeaderCheckBox(G_GRDT3MASTER, "CHECK_YN");
  //console.log('T3 Master: ', G_GRDT3MASTER.data.getItems());

  var total = 0;
  if (G_GRDT3MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT3MASTER, 0);
    // 그리드의 확정수량의 합계 계산
    var items = G_GRDT3MASTER.data.getItems();
    for ( var i = 0; i < items.length; i++) {
      total = total + Number(items[i].CONFIRM_QTY);
    }
  } else {
    $NC.setGridDisplayRows("#grdT3Master", 0, 0);
    onGetT3Detail({
      data: null
    });
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._excel = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.G_VAR.printOptions = [ ];
  $NC.G_VAR.printOptions.push(
    {
      PRINT_INDEX: 0,
      PRINT_COMMENT: "라벨출력"
    }
//   ,{
//      PRINT_INDEX: 1,
//      PRINT_COMMENT: "존별오더피킹지시서"
//    }
  );
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * T3 Detail
 */
function onGetT3Detail(ajaxData) {
  $NC.setInitGridData(G_GRDT3DETAIL, ajaxData);
  $NC.setGridColumnHeaderCheckBox(G_GRDT3DETAIL, "CHECK_YN");
  //console.log('T3 Detail: ', G_GRDT3DETAIL.data.getItems());
  var total = 0;
  if (G_GRDT3DETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT3DETAIL, 0);
    // 그리드의 확정수량의 합계 계산
    var items = G_GRDT3DETAIL.data.getItems();
    for ( var i = 0; i < items.length; i++) {
      total = total + Number(items[i].CONFIRM_QTY);
    }
  } else {
    $NC.setGridDisplayRows("#grdT3Detail", 0, 0);
    onGetT3Sub({
      data: null
    });
  }
}

/**
 * T3 Sub
 */
function onGetT3Sub(ajaxData) {
  $NC.setInitGridData(G_GRDT3SUB, ajaxData);
  if (G_GRDT3SUB.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT3SUB, 0);
  } else {
    $NC.setGridDisplayRows("#grdT3Sub", 0, 0);
  }
}




/**
 * T4 Master 
 */
function onGetT4Master(ajaxData) {
  $NC.setInitGridData(G_GRDT4MASTER, ajaxData);
  $NC.setGridColumnHeaderCheckBox(G_GRDT4MASTER, "CHECK_YN");
  //console.log('T4 Master: ', G_GRDT4MASTER.data.getItems());

  var total = 0;
  if (G_GRDT4MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT4MASTER, 0);
    // 그리드의 확정수량의 합계 계산
    var items = G_GRDT4MASTER.data.getItems();
    for ( var i = 0; i < items.length; i++) {
      total = total + Number(items[i].CONFIRM_QTY);
    }
  } else {
    $NC.setGridDisplayRows("#grdT4Master", 0, 0);
    onGetT4Detail({
      data: null
    });
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._excel = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.G_VAR.printOptions = [ ];
  $NC.G_VAR.printOptions.push(
    {
      PRINT_INDEX: 0,
      PRINT_COMMENT: "라벨출력"
    }
//   ,{
//      PRINT_INDEX: 1,
//      PRINT_COMMENT: "존별오더피킹지시서"
//    }
  );
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * T4 Detail
 */
function onGetT4Detail(ajaxData) {
  $NC.setInitGridData(G_GRDT4DETAIL, ajaxData);
  $NC.setGridColumnHeaderCheckBox(G_GRDT4DETAIL, "CHECK_YN");
  //console.log('T4 Detail: ', G_GRDT4DETAIL.data.getItems());
  var total = 0;
  if (G_GRDT4DETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT4DETAIL, 0);
    // 그리드의 확정수량의 합계 계산
    var items = G_GRDT4DETAIL.data.getItems();
    for ( var i = 0; i < items.length; i++) {
      total = total + Number(items[i].CONFIRM_QTY);
    }
  } else {
    $NC.setGridDisplayRows("#grdT4Detail", 0, 0);
    onGetT4Sub({
      data: null
    });
  }
}

/**
 * T4 Sub
 */
function onGetT4Sub(ajaxData) {
  $NC.setInitGridData(G_GRDT4SUB, ajaxData);
  if (G_GRDT4SUB.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT4SUB, 0);
  } else {
    $NC.setGridDisplayRows("#grdT4Sub", 0, 0);
  }
}


/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {
  var permission = $NC.getProgramPermission();
  // 등록
  if (permission.canConfirm) {
    $("#btnProcessNxtAM").click(onProcessNxtAM);  // 예정-마스터 처리
    $("#btnProcessNxtA").click(onProcessNxtA);    // 예정-디테일 처리
    $("#btnProcessNxtBM").click(onProcessNxtBM);  // 등록-마스터 처리
    $("#btnProcessNxtB").click(onProcessNxtB);    // 등록-디테일 처리
  }
  $NC.setEnable("#btnProcessNxtAM", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtA", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtBM", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtB", permission.canConfirm);

  // 취소
  if (permission.canConfirmCancel) {
    $("#btnProcessPreBM").click(onProcessPreBM);  // 등록-마스터 취소
    $("#btnProcessPreB").click(onProcessPreB);    // 등록-디테일 취소
    $("#btnProcessPreCM").click(onProcessPreCM);  // 지시-마스터 취소
    $("#btnProcessPreC").click(onProcessPreC);    // 지시-디테일 취소
  }
  $NC.setEnable("#btnProcessPreBM", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreB", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreCM", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreC", permission.canConfirmCancel);
}

/**
 * 프로세스 불러오기
 */
function setProcessStateInfo() {

  for ( var PROCESS_CD in $NC.G_VAR.stateFWBW) {
    $NC.G_VAR.stateFWBW[PROCESS_CD].CONFIRM = "";
    $NC.G_VAR.stateFWBW[PROCESS_CD].CANCEL = "";
  }

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var PROCESS_GRP = "LO";

  // 데이터 조회
  $NC.serviceCall("/LOM7090E/getDataSet.do", {
    P_QUERY_ID: "WC.GET_PROCESS_STATE_FWBW",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_PROCESS_GRP: PROCESS_GRP
    })
  }, onGetProcessState);
}

function onGetProcessState(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    var rowData;
    for (var row = 0, rowCount = resultData.length; row < rowCount; row++) {
      rowData = resultData[row];
      $NC.G_VAR.stateFWBW[rowData.PROCESS_CD].CONFIRM = rowData.PROCESS_STATE_CONFIRM;
      $NC.G_VAR.stateFWBW[rowData.PROCESS_CD].CANCEL = rowData.PROCESS_STATE_CANCEL;
    }
  }
}

/**
 * T1 예정 - 마스터확정
 */
function onProcessNxtAM() {

  var rowCount = G_GRDT1MASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 먼저 후 처리하십시오.");
    return;
  }

  var result = confirm("출고등록 처리하시겠습니까?");
  if (!result) {
    return;
  }
  $NC.G_VAR.activeView.container = "#divT1DetailView";
  $NC.G_VAR.activeView.PROCESS_CD = "B";

  var processDS = [ ];
  var chkCnt = 0;
  var outboundDate = $NC.getValue("#dtpQOutbound_Date");

  var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
  chkCnt++;
  var processData = {
    P_CENTER_CD : $NC.getValue('#cboQCenter_Cd'),
    P_BU_CD : $NC.getValue('#edtQBu_Cd'),
    P_OUTBOUND_DATE1 : $('#chkQDate_Yn').is(':checked') ? '' : $NC.getValue('#dtpQOrder_Date1'),
    P_OUTBOUND_DATE2 : $('#chkQDate_Yn').is(':checked') ? '' : $NC.getValue('#dtpQOrder_Date2'),
    P_OUTBOUND_BATCH : "000",
    P_ORDER_TYPE : rowData.ORDER_TYPE,
    P_ENTRY_DATE : outboundDate
  };
  processDS.push(processData);

  if (chkCnt == 0) {
    alert("출고등록 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 출고등록 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM7090E/callOrderType.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_DIRECTION : 'FW',
    P_PROCESS_CD : 'B1',
    P_PROCESS_STATE_BW : $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW : $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID : $NC.G_USERINFO.USER_ID
    ,P_INOUT_CD         : INOUT_CD          // 입출고구분
    ,P_BU_NO            : BU_NO             // 주문번호
    ,P_BRAND_CD         : BRAND_CD          // 판매사
    ,P_ITEM_CD          : ITEM_CD           // 상품코드
    ,P_ITEM_NM          : ITEM_NM           // 상품명
    ,P_ORDERER_NM       : ORDERER_NM        // 주문자명
    ,P_SHIPPER_NM       : SHIPPER_NM        // 수령자명
    ,P_MALL_CD          : MALL_CD           // 몰구분
    ,P_INORDER_TYPE     : INORDER_TYPE      // 매입형태
    ,P_SHIP_TYPE        : SHIP_TYPE         // 운송구분
    ,P_SHIP_PRICE_TYPE  : SHIP_PRICE_TYPE   // 운송비구분
    ,P_HOLD_YN          : HOLD_YN           // 보류여부
    ,P_DEAL_ID          : DEAL_ID           // 딜ID
    ,P_DELIVERY_TYPE    : DELIVERY_TYPE     // 배송유형
    ,P_BU_TIME          : BU_TIME           // 주문시간 시작
    ,P_DELIVERY_TYPE2   : DELIVERY_TYPE2    // 배송지역구분
    ,P_OWN_BRAND_CD     : OWN_BRAND_CD      // 위탁사
  }, onSaveT1Confirm, onSaveErrorT1Confirm, 2);
}

/**
 * T1 예정 - 디테일확정
 */
function onProcessNxtA() {

  var rowCount = G_GRDT1DETAIL.data.getLength();
  if (rowCount === 0) {
    alert("조회 먼저 후 처리하십시오.");
    return;
  }

  var result = confirm("출고등록 처리하시겠습니까?");
  if (!result) {
    return;
  }
  $NC.G_VAR.activeView.container = "#divT1DetailView";
  $NC.G_VAR.activeView.PROCESS_CD = "B";

  var processDS = [ ];
  var chkCnt = 0;
  var outboundDate = $NC.getValue("#dtpQOutbound_Date");
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT1DETAIL.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      var processData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.ORDER_DATE,
        P_OUTBOUND_NO: rowData.ORDER_NO
      };
      processDS.push(processData);
    }
  }
  if (chkCnt == 0) {
    alert("출고등록 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 출고등록 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM7090E/callLOProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "B1",
    P_ENTRY_DATE: outboundDate,
    P_DIRECTION: "FW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveT1Confirm, onSaveErrorT1Confirm, 2);
}

function onSaveT1Confirm(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }
  $NC.hideProgressMessage();
  _Inquiry();
}

function onSaveErrorT1Confirm(ajaxData) {
  $NC.onError(ajaxData);
}

/**
 * T2 등록-마스터 확정
 */
function onProcessNxtBM() {

  var rowCount = G_GRDT2MASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 먼저 후 처리하십시오.");
    return;
  }

  var result = confirm("출고지시 처리하시겠습니까?");
  if (!result) {
    return;
  }
  $NC.G_VAR.activeView.container = "#divT2DetailView";
  $NC.G_VAR.activeView.PROCESS_CD = "C";

  var processDS = [ ];
  var chkCnt = 0;
  var chkProcessState = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
  
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT2MASTER.data.getItem(row); 

    if (rowData.CHECK_YN == "Y") { 
      chkCnt++;
      var processData = {
          P_CENTER_CD : $NC.getValue('#cboQCenter_Cd'),
          P_BU_CD : $NC.getValue('#edtQBu_Cd'),
          P_OUTBOUND_DATE1 : rowData.OUTBOUND_DATE,
          P_OUTBOUND_DATE2 : rowData.OUTBOUND_DATE,
          P_OUTBOUND_BATCH : rowData.OUTBOUND_BATCH,
          P_ORDER_TYPE : rowData.ORDER_TYPE,
          P_ENTRY_DATE : ""
      };
      processDS.push(processData);
    }
  }
  if (chkCnt == 0) {
    alert("출고지시 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 출고지시 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM7090E/callOrderType.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "C",
    P_DIRECTION: "FW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
    ,P_INOUT_CD         : INOUT_CD          // 입출고구분
    ,P_BU_NO            : BU_NO             // 주문번호
    ,P_BRAND_CD         : BRAND_CD          // 판매사
    ,P_ITEM_CD          : ITEM_CD           // 상품코드
    ,P_ITEM_NM          : ITEM_NM           // 상품명
    ,P_ORDERER_NM       : ORDERER_NM        // 주문자명
    ,P_SHIPPER_NM       : SHIPPER_NM        // 수령자명
    ,P_MALL_CD          : MALL_CD           // 몰구분
    ,P_INORDER_TYPE     : INORDER_TYPE      // 매입형태
    ,P_SHIP_TYPE        : SHIP_TYPE         // 운송구분
    ,P_SHIP_PRICE_TYPE  : SHIP_PRICE_TYPE   // 운송비구분
    ,P_HOLD_YN          : HOLD_YN           // 보류여부
    ,P_DEAL_ID          : DEAL_ID           // 딜ID
    ,P_DELIVERY_TYPE    : DELIVERY_TYPE     // 배송유형
    ,P_BU_TIME          : BU_TIME           // 주문시간 시작
    ,P_DELIVERY_TYPE2   : DELIVERY_TYPE2    // 배송지역구분
    ,P_OWN_BRAND_CD     : OWN_BRAND_CD      // 위탁사
  }, onSaveT2Confirm, onSaveErrorT2Confirm, 2);
}

/**
 * T2 등록-마스터 취소
 */
function onProcessPreBM() {

  var rowCount = G_GRDT2MASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 먼저 후 처리하십시오.");
    return;
  }

  
  var result = confirm("출고등록 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }
  $NC.G_VAR.activeView.container = "#divT2DetailView";
  $NC.G_VAR.activeView.PROCESS_CD = "B";

  var processDS = [ ];
  var chkCnt = 0;
  var chkProcessState = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT2MASTER.data.getItem(row);

    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      var processData = {
          P_CENTER_CD : $NC.getValue('#cboQCenter_Cd'),
          P_BU_CD : $NC.getValue('#edtQBu_Cd'),
          P_OUTBOUND_DATE1 : rowData.OUTBOUND_DATE,
          P_OUTBOUND_DATE2 : rowData.OUTBOUND_DATE,
          P_OUTBOUND_BATCH : rowData.OUTBOUND_BATCH,
          P_ORDER_TYPE : rowData.ORDER_TYPE,
          P_ENTRY_DATE : ""
      };
      processDS.push(processData);
    }
  }
  
  if (chkCnt == 0) {
    alert("출고등록 취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 출고등록 취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM7090E/callOrderType.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "B",
    P_DIRECTION: "BW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
    ,P_INOUT_CD         : INOUT_CD          // 입출고구분
    ,P_BU_NO            : BU_NO             // 주문번호
    ,P_BRAND_CD         : BRAND_CD          // 판매사
    ,P_ITEM_CD          : ITEM_CD           // 상품코드
    ,P_ITEM_NM          : ITEM_NM           // 상품명
    ,P_ORDERER_NM       : ORDERER_NM        // 주문자명
    ,P_SHIPPER_NM       : SHIPPER_NM        // 수령자명
    ,P_MALL_CD          : MALL_CD           // 몰구분
    ,P_INORDER_TYPE     : INORDER_TYPE      // 매입형태
    ,P_SHIP_TYPE        : SHIP_TYPE         // 운송구분
    ,P_SHIP_PRICE_TYPE  : SHIP_PRICE_TYPE   // 운송비구분
    ,P_HOLD_YN          : HOLD_YN           // 보류여부
    ,P_DEAL_ID          : DEAL_ID           // 딜ID
    ,P_DELIVERY_TYPE    : DELIVERY_TYPE     // 배송유형
    ,P_BU_TIME          : BU_TIME           // 주문시간 시작
    ,P_DELIVERY_TYPE2   : DELIVERY_TYPE2    // 배송지역구분
    ,P_OWN_BRAND_CD     : OWN_BRAND_CD      // 위탁사
  }, onSaveT2Cancel, onSaveErrorT2Cancel, 2);
}

/**
 * T2 등록-디테일 확정
 */
function onProcessNxtB() {

  var rowCount = G_GRDT2DETAIL.data.getLength();
  if (rowCount === 0) {
    alert("조회 먼저 후 처리하십시오.");
    return;
  }

  var result = confirm("출고지시 처리하시겠습니까?");
  if (!result) {
    return;
  }
  $NC.G_VAR.activeView.container = "#divT2DetailView";
  $NC.G_VAR.activeView.PROCESS_CD = "C";

  var processDS = [ ];
  var chkCnt = 0;
  var chkProcessState = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT2DETAIL.data.getItem(row);

    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      var processData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
      };
      processDS.push(processData);
    }
  }
  if (chkCnt == 0) {
    alert("출고지시 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 출고지시 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM7090E/callLOProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "C",
    P_ENTRY_DATE: "",
    P_DIRECTION: "FW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveT2Confirm, onSaveErrorT2Confirm, 2);
}

function onSaveT2Confirm(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }
  $NC.hideProgressMessage();
  _Inquiry();
}

function onSaveErrorT2Confirm(ajaxData) {
  $NC.onError(ajaxData);
}

/**
 * T2 등록-디테일 취소
 */
function onProcessPreB() {

  var rowCount = G_GRDT2DETAIL.data.getLength();
  if (rowCount === 0) {
    alert("조회 먼저 후 처리하십시오.");
    return;
  }

  
  var result = confirm("출고등록 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }
  $NC.G_VAR.activeView.container = "#divT2DetailView";
  $NC.G_VAR.activeView.PROCESS_CD = "B";

  var processDS = [ ];
  var chkCnt = 0;
  var chkProcessState = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT2DETAIL.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      var processData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
      };
      processDS.push(processData);
    }
  }
  if (chkCnt == 0) {
    alert("출고등록 취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 출고등록 취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM7090E/callLOProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "B",
    P_ENTRY_DATE: "",
    P_DIRECTION: "BW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveT2Cancel, onSaveErrorT2Cancel, 2);
}

function onSaveT2Cancel(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }
  $NC.hideProgressMessage();
  _Inquiry();
}

function onSaveErrorT2Cancel(ajaxData) {
  $NC.onError(ajaxData);
}

/**
 * T3 지시-마스터 취소
 */
function onProcessPreCM() {
  
  var rowDatas = G_GRDT3MASTER.data.getItems();
  for (var i in rowDatas) {
    if (rowDatas[i].PRINT_YN === 'Y') {
      showMessage({
        message: "이미 피킹라벨이 발행되었습니다.\n계속 진행 하시겠습니까?",
        onYesFn: function() {
          initCancel();
        },
        onNoFn: function() {
          
        }
      });
      return false;
    }
  }

  initCancel();
  function initCancel() {
    var rowCount = G_GRDT3MASTER.data.getLength();
    if (rowCount === 0) {
      alert("조회 먼저 후 처리하십시오.");
      return;
    }
    
    //지시취소 에러체크 초기화.
    $NC.serviceCallAndWait("/LOM7090E/callUpdate.do", {
      P_QUERY_PARAMS: $NC.getParams({
        P_ERR_CNT: 0,
      })
    });
    
    $NC.G_VAR.activeView.container = "#divT3DetailView";
    $NC.G_VAR.activeView.PROCESS_CD = "C";

    var processDS = [ ];
    var chkCnt = 0;
    var chkProcessState = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL;
    
    for ( var row = 0; row < rowCount; row++) {
      var rowData = G_GRDT3MASTER.data.getItem(row);

      if (rowData.CHECK_YN == "Y") {
        chkCnt++;
        var processData = {
            P_CENTER_CD : $NC.getValue('#cboQCenter_Cd'),
            P_BU_CD : $NC.getValue('#edtQBu_Cd'),
            P_OUTBOUND_DATE1 : rowData.OUTBOUND_DATE,
            P_OUTBOUND_DATE2 : rowData.OUTBOUND_DATE,
            P_OUTBOUND_BATCH : rowData.OUTBOUND_BATCH,
            P_ORDER_TYPE : rowData.ORDER_TYPE,
            P_ENTRY_DATE : ""
        };
        processDS.push(processData);
      }
    }

    var result = confirm("출고지시 취소 처리하시겠습니까?");
    if (!result) {
      return;
    }
    if (chkCnt == 0) {
      alert("출고지시 취소 처리할 데이터를 선택하십시오.");
      return;
    }
    if (processDS.length == 0) {
      alert("선택한 데이터 중 출고지시 취소 처리 가능한 데이터가 없습니다.");
      return;
    }

    $NC.serviceCallAndWait("/LOM7090E/callOrderType.do", {
      P_DS_MASTER: $NC.getParams(processDS),
      P_PROCESS_CD: "C",
      P_DIRECTION: "BW",
      P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
      P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
      P_USER_ID: $NC.G_USERINFO.USER_ID
      ,P_INOUT_CD         : INOUT_CD          // 입출고구분
      ,P_BU_NO            : BU_NO             // 주문번호
      ,P_BRAND_CD         : BRAND_CD          // 판매사
      ,P_ITEM_CD          : ITEM_CD           // 상품코드
      ,P_ITEM_NM          : ITEM_NM           // 상품명
      ,P_ORDERER_NM       : ORDERER_NM        // 주문자명
      ,P_SHIPPER_NM       : SHIPPER_NM        // 수령자명
      ,P_MALL_CD          : MALL_CD           // 몰구분
      ,P_INORDER_TYPE     : INORDER_TYPE      // 매입형태
      ,P_SHIP_TYPE        : SHIP_TYPE         // 운송구분
      ,P_SHIP_PRICE_TYPE  : SHIP_PRICE_TYPE   // 운송비구분
      ,P_HOLD_YN          : HOLD_YN           // 보류여부
      ,P_DEAL_ID          : DEAL_ID           // 딜ID
      ,P_DELIVERY_TYPE    : DELIVERY_TYPE     // 배송유형
      ,P_BU_TIME          : BU_TIME           // 주문시간 시작
      ,P_DELIVERY_TYPE2   : DELIVERY_TYPE2    // 배송지역구분
      ,P_OWN_BRAND_CD     : OWN_BRAND_CD      // 위탁사      
    }, onSaveT3Cancel, onSaveErrorT3Cancel, 2);
    
    //지시취소 에러체크.
    $NC.serviceCall("/LOM7090E/callSP.do", {
      P_QUERY_ID: "WF.GET_TEMP_LOCNT_30",
      P_QUERY_PARAMS: $NC.getParams({
        P_ERR_CNT: 0,
      })
    }, function(ajaxData) {
      var resultData = $NC.toArray(ajaxData);
      if (!$NC.isNull(resultData)) {
        if (resultData.O_MSG === "OK") {
          alert(resultData.O_CHK_YN);
        }
      }
    });
  }
}

/**
 * T3 지시-디테일 취소
 */
function onProcessPreC() {

  var rowCount = G_GRDT3DETAIL.data.getLength();
  if (rowCount === 0) {
    alert("조회 먼저 후 처리하십시오.");
    return;
  }
  
  $NC.G_VAR.activeView.container = "#divT3DetailView";
  $NC.G_VAR.activeView.PROCESS_CD = "C";

  var processDS = [ ];
  var chkCnt = 0;
  var chkProcessState = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT3DETAIL.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      var processData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
      };
      processDS.push(processData);
    }
    if (rowData.PRINT_YN == "Y") {
      showMessage({
        message: "이미 피킹라벨이 발행되었습니다.\n지시취소 하시겠습니까?",
        onYesFn: function() {
          initCancel();
        },
        onNoFn: function() {
          
        }
      });
      //showMessage("이미 송장발행되었습니다. 취소 할 수 없습니다.");
      return false;
    }
  }
  initCancel();
  function initCancel() {
    var result = confirm("출고지시 취소 처리하시겠습니까?");
    if (!result) {
      return;
    }
    if (chkCnt == 0) {
      alert("출고지시 취소 처리할 데이터를 선택하십시오.");
      return;
    }
    if (processDS.length == 0) {
      alert("선택한 데이터 중 출고지시 취소 처리 가능한 데이터가 없습니다.");
      return;
    }

    $NC.serviceCall("/LOM7090E/callLOProcessing.do", {
      P_DS_MASTER: $NC.getParams(processDS),
      P_PROCESS_CD: "C",
      P_ENTRY_DATE: "",
      P_DIRECTION: "BW",
      P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
      P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSaveT3Cancel, onSaveErrorT3Cancel, 2);
  }
}

function onSaveT3Cancel(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }
  $NC.hideProgressMessage();
  _Inquiry();
}

function onSaveErrorT3Cancel(ajaxData) {
  $NC.onError(ajaxData);
}

function onSaveT4Cancel(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }
  $NC.hideProgressMessage();
  _Inquiry();
}

function onSaveErrorT4Cancel(ajaxData) {
  $NC.onError(ajaxData);
}

/**
 * 조회조건 - T1 주문유형
 */
function setT1OrderDiv() {
  var rowCount = G_GRDT1DETAIL.data.getLength();
  if (rowCount === 0) {
    alert("조회 먼저 후 처리하십시오.");
    return;
  }
  
  var deliveryType = $NC.getValue("#cboQT1Delivery_TypeB");
  if (deliveryType === '%') {
    alert("변경할 배송유형을 선택 해주세요.");
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT1DETAIL.data.getItem(row);
    if (deliveryType === rowData.DELIVERY_TYPE) {
      alert("변경할 배송유형이 같습니다.");
      return;
    }
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      var processData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.ORDER_DATE,
        P_OUTBOUND_NO: rowData.ORDER_NO
      };
      processDS.push(processData);
    }
  }

  var result = confirm("배송유형을 변경 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (chkCnt == 0) {
    alert("처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM7090E/callOrderDiv.do", {
    P_ORDER_DIV: deliveryType,
    P_PROCESS_CD: "A",
    P_DS_MASTER: $NC.getParams(processDS)
  }, onSaveT1OrderDiv, onSaveErrorT1OrderDiv, 2);
}

function onSaveT1OrderDiv(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }
  $NC.hideProgressMessage();
  _Inquiry();
}

function onSaveErrorT1OrderDiv(ajaxData) {
  $NC.onError(ajaxData);
}

/**
 * 조회조건 - T2 주문유형
 */
function setT2OrderDiv() {
  var rowCount = G_GRDT2DETAIL.data.getLength();
  if (rowCount === 0) {
    alert("조회 먼저 후 처리하십시오.");
    return;
  }
  
  var deliveryType = $NC.getValue("#cboQT2Delivery_TypeB");
  if (deliveryType === '%') {
    alert("변경할 배송유형을 선택 해주세요.");
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT2DETAIL.data.getItem(row);
    if (deliveryType === rowData.DELIVERY_TYPE) {
      alert("변경할 배송유형이 같습니다.");
      return;
    }
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      var processData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
      };
      processDS.push(processData);
    }
  }

  var result = confirm("배송유형을 변경 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (chkCnt == 0) {
    alert("처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM7090E/callOrderDiv.do", {
    P_ORDER_DIV: deliveryType,
    P_PROCESS_CD: "B",
    P_DS_MASTER: $NC.getParams(processDS)
  }, onSaveT2OrderDiv, onSaveErrorT2OrderDiv, 2);
}
function onSaveT2OrderDiv(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }
  $NC.hideProgressMessage();
  _Inquiry();
}
function onSaveErrorT2OrderDiv(ajaxData) {
  $NC.onError(ajaxData);
}

/**
 * 조회조건 - T3 주문유형
 */
function setT3OrderDiv() {
  var rowCount = G_GRDT3DETAIL.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }
  
  var deliveryType = $NC.getValue("#cboQT3Delivery_TypeB");
  if (deliveryType === '%') {
    alert("변경할 배송유형을 선택해주세요.");
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT3DETAIL.data.getItem(row);
    if (deliveryType === rowData.DELIVERY_TYPE) {
      alert("변경할 배송유형이 같습니다.");
      return;
    }
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      var processData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
      };
      processDS.push(processData);
    }
  }

  var result = confirm("배송유형을 변경 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (chkCnt == 0) {
    alert("처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM7090E/callOrderDiv.do", {
    P_ORDER_DIV: deliveryType,
    P_PROCESS_CD: "B",
    P_DS_MASTER: $NC.getParams(processDS)
  }, onSaveT3OrderDiv, onSaveErrorT3OrderDiv, 2);
}
function onSaveT3OrderDiv(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }
  $NC.hideProgressMessage();
  _Inquiry();
}
function onSaveErrorT3OrderDiv(ajaxData) {
  $NC.onError(ajaxData);
}


function grdT3MasterOnHeaderClick(e, args) {
  
  G_GRDT3MASTER.view.getCanvasNode().focus();
  
  if (args.column.id == "CHECK_YN") {
    
    if ($(e.target).is(":checkbox")) {
      
      if (G_GRDT3MASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      
      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT3MASTER.data.getLength();
      var rowData;
      G_GRDT3MASTER.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDT3MASTER.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDT3MASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT3MASTER.data.endUpdate(); 
      
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

/**
 * 조회조건 - T4 주문유형
 */
function setT4OrderDiv() {
  var rowCount = G_GRDT4DETAIL.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }
  
  var deliveryType = $NC.getValue("#cboQT4Delivery_TypeB");
  if (deliveryType === '%') {
    alert("변경할 배송유형을 선택해주세요.");
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDT4DETAIL.data.getItem(row);
    if (deliveryType === rowData.DELIVERY_TYPE) {
      alert("변경할 배송유형이 같습니다.");
      return;
    }
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      var processData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
      };
      processDS.push(processData);
    }
  }

  var result = confirm("배송유형을 변경 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (chkCnt == 0) {
    alert("처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM7090E/callOrderDiv.do", {
    P_ORDER_DIV: deliveryType,
    P_PROCESS_CD: "B",
    P_DS_MASTER: $NC.getParams(processDS)
  }, onSaveT4OrderDiv, onSaveErrorT4OrderDiv, 2);
}
function onSaveT4OrderDiv(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }
  $NC.hideProgressMessage();
  _Inquiry();
}
function onSaveErrorT4OrderDiv(ajaxData) {
  $NC.onError(ajaxData);
}


function grdT4MasterOnHeaderClick(e, args) {
  
  G_GRDT4MASTER.view.getCanvasNode().focus();
  
  if (args.column.id == "CHECK_YN") {
    
    if ($(e.target).is(":checkbox")) {
      
      if (G_GRDT4MASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }
      
      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT4MASTER.data.getLength();
      var rowData;
      G_GRDT4MASTER.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDT4MASTER.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDT4MASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT4MASTER.data.endUpdate(); 
      
      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

function grdT2MasterOnHeaderClick(e, args) {
  
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

function grdT3DetailOnHeaderClick(e, args) {

  G_GRDT3DETAIL.view.getCanvasNode().focus();

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDT3DETAIL.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT3DETAIL.data.getLength();
      var rowData;
      G_GRDT3DETAIL.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDT3DETAIL.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDT3DETAIL.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT3DETAIL.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

function grdT4DetailOnHeaderClick(e, args) {

  G_GRDT4DETAIL.view.getCanvasNode().focus();

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDT4DETAIL.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT4DETAIL.data.getLength();
      var rowData;
      G_GRDT4DETAIL.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDT4DETAIL.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDT4DETAIL.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT4DETAIL.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

function grdT2DetailOnHeaderClick(e, args) {

  G_GRDT2DETAIL.view.getCanvasNode().focus();

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDT2DETAIL.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT2DETAIL.data.getLength();
      var rowData;
      G_GRDT2DETAIL.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDT2DETAIL.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDT2DETAIL.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT2DETAIL.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

function grdT1DetailOnHeaderClick(e, args) {

  G_GRDT1DETAIL.view.getCanvasNode().focus();
  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDT1DETAIL.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDT1DETAIL.data.getLength();
      var rowData;
      G_GRDT1DETAIL.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDT1DETAIL.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDT1DETAIL.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

/**
 * 출고할당량 부족재고 조정
 */
function setOrder_Adjustment() {
  var rowCount = G_GRDT1DETAIL.data.getLength();
  if (rowCount === 0) {
    alert("조회 먼저 후 처리하십시오.");
    return;
  }

  var result = confirm("출고할당량 적용 시 결제일자 순으로 재고가 할당됩니다. \n적용하시겠습니까?");
  if (!result) {
    return;
  }
  
  var processDS = [ ];
  var processData = {
      P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_ORDER_DATE1: $NC.getValue("#dtpQOrder_Date1"),
      P_ORDER_DATE2: $NC.getValue("#dtpQOrder_Date2"),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    };
    processDS.push(processData);

  if (processDS.length == 0) {
    alert("처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM7090E/callOrderAdjust.do", {
    P_DS_MASTER: $NC.getParams(processDS)
  }, onSaveOrderAdjust, onSaveErrorOrderAdjust, 2);
}

function onSaveOrderAdjust(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }
  $NC.hideProgressMessage();
  _Inquiry();
}

function onSaveErrorOrderAdjust(ajaxData) {
  $NC.onError(ajaxData);
}

/**
 * 출고일자 값 변경시 출고차수 콤보 재설정
 */
function setOutboundBatchCombo(comboId, isAddAll, setPos) {

  var position;
  if ($NC.isNull(setPos)) {
    position = "first";
  } else {
    position = setPos;
  }
  // 조회조건 - 출고차수 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_OUTBOUND_BATCH",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date"),
      P_OUTBOUND_DIV: "2" // --출고작업구분(1:기본출고, 2:온라인출고)
    })
  }, {
    selector: comboId,
    codeField: "OUTBOUND_BATCH",
    nameField: "OUTBOUND_BATCH",
    fullNameField: "OUTBOUND_BATCH_F",
    addAll: !$NC.isNull(isAddAll) && isAddAll,
    selectOption: position == "first" ? "F" : (position == "last" ? "L" : null),
    selectVal: (position == "first" || position == "last") ? null : position,
    onComplete: function() {
      if (comboId == "#cboOutbound_Batch") { // 출고 지시(입력용)일 경우
        $NC.setEnable("#edtOutbound_Batch_NmC", $NC.getValue(comboId) == "000");
      }
    }
  });
}

function showMessage(options, hideFocus) {

  if ($NC.isNull(options)) {
    return;
  }

  if ($NC.isNull(hideFocus)) {
    hideFocus = false;
  }

  if (typeof options == "string") {
    $NC.G_MAIN.showMessage({
      message: options,
      buttons: {
        "확인": function() {
          $NC.G_MAIN.setFocusActiveWindow();
          setFocusScan();
        }
      },
      hideFocus: hideFocus
    });
    return;
  }

  if ($NC.isNull(options.buttons) && !$NC.isNull(options.focusSelector)) {
    $NC.G_MAIN.showMessage({
      message: options,
      buttons: {
        "확인": function() {
          $NC.G_MAIN.setFocusActiveWindow();
          $NC.setFocus(options.focusSelector);
        }
      },
      hideFocus: hideFocus
    });
    return;
  }

  var buttons = {};
  if (options.onYesFn) {
    buttons["예"] = function() {
      $NC.G_MAIN.setFocusActiveWindow();
      options.onYesFn.call(this);
    };
  }
  if (options.onNoFn) {
    buttons["아니오"] = function() {
      $NC.G_MAIN.setFocusActiveWindow();
      options.onNoFn.call(this);
    };
  }

  $NC.G_MAIN.showMessage({
    message: options.message,
    buttons: buttons,
    hideFocus: hideFocus
  });
}

function setFocusScan() {
  return false;
}

/**
 * 전표수와 수량을 조회한다.
 */
function getCountAndQty() {
  var hasHoldYn = $('#tdQHold_Yn').css('display')
    ,holdYn = HOLD_YN
  if (hasHoldYn === 'none') {
    holdYn = ''
  }

  $NC.serviceCall("/LOM7010E/getDataSet.do", {
    P_QUERY_ID: 'LOM7090E.RS_MASTER',
    P_QUERY_PARAMS: $NC.getParams({
       P_CENTER_CD        : CENTER_CD         // 물류센터
      ,P_BU_CD            : BU_CD             // 사업구분
      ,P_ORDER_DATE1      : ORDER_DATE1       // 예정(출고)일자 시작
      ,P_ORDER_DATE2      : ORDER_DATE2       // 예정(출고)일자 종료
      ,P_INOUT_CD         : INOUT_CD          // 입출고구분
      ,P_BU_NO            : BU_NO             // 주문번호
      ,P_BRAND_CD         : BRAND_CD          // 판매사
      ,P_ITEM_CD          : ITEM_CD           // 상품코드
      ,P_ITEM_NM          : ITEM_NM           // 상품명
      ,P_ORDERER_NM       : ORDERER_NM        // 주문자명
      ,P_SHIPPER_NM       : SHIPPER_NM        // 수령자명
      ,P_MALL_CD          : MALL_CD           // 몰구분
      ,P_INORDER_TYPE     : INORDER_TYPE      // 매입형태
      ,P_SHIP_TYPE        : SHIP_TYPE         // 운송구분
      ,P_SHIP_PRICE_TYPE  : SHIP_PRICE_TYPE   // 운송비구분
      ,P_HOLD_YN          : holdYn            // 보류여부
      ,P_DEAL_ID          : DEAL_ID           // 딜ID
      ,P_DELIVERY_TYPE    : DELIVERY_TYPE     // 배송유형
      ,P_BU_TIME          : BU_TIME           // 주문시간 시작
      ,P_DELIVERY_TYPE2   : DELIVERY_TYPE2    // 배송지역구분
      ,P_OWN_BRAND_CD     : OWN_BRAND_CD      // 위탁사
      ,P_USER_ID          : $NC.G_USERINFO.USER_ID
    })
  }, onCountAndQty);
}

function onCountAndQty (ajaxData) {
  var req = $NC.toArray(ajaxData);
  $('#lblLo_Cnt_A').text('전표수 : ' + req[0].CNT_A);
  $('#lblLo_Qty_A').text('수량 : ' + req[0].QTY_A);
  $('#lblLo_Cnt_B').text('전표수 : ' + req[0].CNT_B);
  $('#lblLo_Qty_B').text('수량 : ' + req[0].QTY_B);
  $('#lblLo_Cnt_C').text('전표수 : ' + req[0].CNT_C);
  $('#lblLo_Qty_C').text('수량 : ' + req[0].QTY_C);
  $('#lblLo_Cnt_D').text('전표수 : ' + req[0].CNT_D);
  $('#lblLo_Qty_D').text('수량 : ' + req[0].QTY_D);
}




















