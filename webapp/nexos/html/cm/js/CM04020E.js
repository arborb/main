/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨

 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  var pageItems = 500;

  $NC.setGlobalVar({
    P_PAGE_COUNT: 0,
    P_PAGE_ITEMS: pageItems,
    P_CONTENT_HEIGHT:0,
    P_LOAD_CONTENT: true
  });

  $NC.setGlobalVar({
    divMasterInfoView: {
      ITEMCD: "",
      BRAND_CD:"",
      TEST:""
    }
  });
  
  // 그리드 초기화
  grdMasterInitialize();

  // 공급처, 합포장가능여부, 거래구분, 거래일자, 비고 div width를 100px로 설정
  viewExpandWidth();


  // 합포장가능여부 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "BOXING_YN_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboBoxing_Yn",
    codeField: "CODE_CD",
    nameField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboBoxing_Yn");
    }
  });
 
  
  // 당일배송가능여부 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "DELIVERY_YN_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboDelivery_Yn",
    // codeField: "CODE_NM",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboDelivery_Yn");
    }
  });
  
  // 검색조건 상품구분 콤보, 상품구분 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "ITEM_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: ["#cboQItem_Div", "#cboItem_Div"],
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    addAll: true,
    onComplete: function() {
      $NC.setValue("#cboQItem_Div", 0);
      $NC.setValue("#cboItem_Div");
    }
  });
  // 보관구분 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "KEEP_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboKeep_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboKeep_Div");
    }
  });
  // 팔레트분할구분 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "PLT_SPLIT_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboPlt_Split_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboPlt_Split_Div");
    }
  });
  // 유통기한구분 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "VALID_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboValid_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboValid_Div");
    }
  });
  // 유통기한적용단위 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "TERM_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboTerm_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboTerm_Div");
    }
  });
  // 입고단위 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "IN_UNIT_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboIn_Unit_Cd",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboIn_Unit_Cd");
    }
  });
 

  
  // 출고단위 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "OUT_UNIT_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboOut_Unit_Cd",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboOut_Unit_Cd");
    }
  });
/*--------------------------*/
  
  // 기본배송박스 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP:"BOX_TYPE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboDelivery_Box",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboDelivery_Box");
    }
  });

  // 배송구분 [대물] 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "ITEM_SIZE_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboDelivery_Type1",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboDelivery_Type1");
    }
  });

  // 배송구분 [세트]
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "WB_PRINT_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboDelivery_Type2",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboDelivery_Type2");
    }
  });

  $NC.setInitDatePicker("#dtpOpen_Date", null, "N");
  $NC.setInitDatePicker("#dtpClose_Date", null, "N");

  $NC.setValue("#edtQBrand_Cd", $NC.G_USERINFO.BRAND_CD);
  $NC.setValue("#edtQBrand_Nm", $NC.G_USERINFO.BRAND_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $("#btnQBrand_Cd").click(showOwnBranPopup);
//  $("#btnVendor_Cd").click(showVendorPopup);
  $("#btnBrand_Cd").click(showOwnBran2Popup);

  $("#btnQBu_Cd").click(showUserBuPopup);

  // 검색.거래구분에 거래진행 체크
  $NC.setValue("#chkQDeal_Div1", "Y");

  // 에디터 Disable
  $NC.setEnableGroup("#divMasterInfoView", false);
  
  $NC.setFocus("#edtQBrand_Cd");
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.rightViewWidth = 640;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.rightViewMinHeight = $("#divMasterInfoView").outerHeight(true) + $NC.G_LAYOUT.header
      + $NC.G_OFFSET.nonClientHeight + $NC.G_LAYOUT.margin2;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var scrollOffset = parent.height() < $NC.G_OFFSET.rightViewMinHeight ? $NC.G_LAYOUT.scroll.width : 0;
  var clientWidth = parent.width() - $NC.G_OFFSET.rightViewWidth - $NC.G_LAYOUT.nonClientWidth - scrollOffset;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Container 사이즈 조정
  $NC.resizeContainer("#divLeftView", clientWidth, clientHeight);
  $NC.resizeContainer("#divRightView", $NC.G_OFFSET.rightViewWidth + scrollOffset, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * 조회조건이 변경될 때 호출
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
      var BU_CD = $NC.getValue("#edtQBu_Cd",true);
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
    var value = val.substr(0, 1);
    var value1 = val.substr(-1, 1);
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      if (value == '%' || value1 == '%') {
        P_QUERY_PARAMS = {
          P_USER_ID: $NC.G_USERINFO.USER_ID,
          P_BRAND_CD: '000000'
        };
        O_RESULT_DATA = $NP.getUserBrandInfo({
          queryParams: P_QUERY_PARAMS
        });
      } else {
        P_QUERY_PARAMS = {
          P_USER_ID: $NC.G_USERINFO.USER_ID,
          P_BRAND_CD: val
        };
        O_RESULT_DATA = $NP.getUserBrandInfo({
          queryParams: P_QUERY_PARAMS
        });
      }
    }

    if (O_RESULT_DATA.length <= 1) {
      onUserBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showUserBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onUserBrandPopup, onUserBrandPopup);
    }
    return;
    */
  }

  onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

  var id = view.prop("id").substr(3).toUpperCase();
  grdMasterOnCellChange(e, {
    col: id,
    val: val,
    view: view
  });
}
/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  loadContents();

//   if ($NC.isNull(BRAND_CD)) {
//     alert("위탁사를 선택후 조회하십시오.");
//     $NC.setFocus("#edtQBrand_Cd");
//     return;
//   }
   
}

/**
 * 콘텐츠 읽어오기
 * @return 
 */
function loadContents() {
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  
  // var BRAND_NM = $NC.getValue("#edtQBrand_Nm");

  var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
  var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
  var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");

  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  var ITEM_NM = $NC.getValue("#edtQItem_Nm");
  var ITEM_DIV = $NC.getValueCombo("cboQItem_Div");
  var ITEM_BAR_CD = $NC.getValue("#edtQItem_Bar_Cd");
  var SAP_ITEM_CD = $NC.getValue("#edtQSap_Item_Cd");

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  G_GRDMASTER.queryParams = $NC.getParams({
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_DEAL_DIV1: DEAL_DIV1,
    P_DEAL_DIV2: DEAL_DIV2,
    P_DEAL_DIV3: DEAL_DIV3,
    P_ITEM_CD: ITEM_CD,
    P_ITEM_NM: ITEM_NM,
    P_ITEM_DIV: ITEM_DIV,
    P_ITEM_BAR_CD: ITEM_BAR_CD,
    P_SAP_ITEM_CD: SAP_ITEM_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_FROM: $NC.G_VAR.P_PAGE_ITEMS * $NC.G_VAR.P_PAGE_COUNT,
    P_TOTAL: $NC.G_VAR.P_PAGE_ITEMS * ($NC.G_VAR.P_PAGE_COUNT+1)
  });

  // 데이터 조회
  $NC.serviceCall("/CM04020E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {



  // 현재 수정모드면
  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDMASTER.lastRow != null) {
    if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
      return;
    }
  }

  var rowCount = G_GRDMASTER.data.getLength();
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDMASTER.data.getItem(rowCount - 1);

    if (rowData.CRUD == "N") {
      $NC.setFocus("#edtItem_Cd");
      return;
    }
  }

  // 상품코드 받아 오기
  $NC.serviceCall("/CM04020E/getDataSet.do", {
    P_QUERY_ID: "CM04020E.GET_NEXTVAL",
    P_QUERY_PARAMS: ""
  }, function(ajaxData) {
    var resultData = $NC.toArray(ajaxData.data);
    var LAST_NUMBER = resultData[0].LAST_NUMBER;
    $NC.G_VAR.divMasterInfoView.ITEMCD = LAST_NUMBER;
    $NC.setValue("#edtItem_Cd", LAST_NUMBER);
  });

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    VENDOR_NM: $NC.getValue("#edtQBrand_Nm"),
    BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
    OWN_BRAND_NM: $NC.getValue("#edtQBrand_Nm"),
    ITEM_CD: null,
    ITEM_NM: null,
    SAP_ITEM_CD: null,
    ITEM_FULL_NM: null,
    ITEM_SPEC: null,
    ITEM_COLOR: null,
    ITEM_MODEL: null,
    ITEM_DIV: null,
    CUST_CD: null,
    VENDOR_CD: $NC.getValue("#edtQBrand_Cd"),
    DEPART_CD: "",
    LINE_CD: "",
    CLASS_CD: "",
    KEEP_DIV: null,
    ITEM_BAR_CD: null,
    CASE_BAR_CD: null,
    BOX_BAR_CD: null,
    IN_UNIT_CD: null,
    OUT_UNIT_CD: null,
    ITEM_WEIGHT: null,
    BOX_WEIGHT: null,
    BOX_WIDTH: null,
    BOX_LENGTH: null,
    BOX_HEIGHT: null,
    BOX_CBM: null,
    QTY_IN_CASE: null,
    QTY_IN_BOX: 1,
    BOX_IN_PLT: 0,
    PLT_STAIR: null,
    PLT_PLACE: null,
    FILL_UNIT_QTY: null,
    PLT_SPLIT_DIV: "9",
    VALID_DIV: null,
    TERM_DIV: null,
    TERM_VAL: "0",
    BUY_PRICE: null,
    SUPPLY_PRICE: null,
    SALE_PRICE: null,
    VAT_YN: "N",
    DEAL_DIV: "1",
    OPEN_DATE: null,
    CLOSE_DATE: null,
    REMARK1: null,
    REG_USER_ID: null,
    REG_DATETIME: null,
    SET_ITEM_YN: "N",
    
    BOXING_YN: null,
    
    DELIVERY_YN: null,
    ITEM_CBM: null,
    DELIVERY_TYPE1: null,
    DELIVERY_TYPE2: null,
    DELIVERY_BOX: null,  
    IN_UNIT_QTY: null,
    OUT_UNIT_QTY: null,
    id: $NC.getGridNewRowId(),
    
    CRUD: "N"
  };

  G_GRDMASTER.data.addItem(newRowData);

  $NC.setGridSelectRow(G_GRDMASTER, rowCount);
  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;

  // 이전 데이터가 한건도 없었으면 에디터 Enable
  if (rowCount == 0) {
    $NC.setEnableGroup("#divMasterInfoView", true);
  }

  // 대분류/중분류/소분류 초기화
  $NC.setValue("#cboDepart_Cd", newRowData.DEPART_CD);
  $("#cboLine_Cd").empty();
  $("#cboClass_Cd").empty();

  // 신규 데이터 생성 이벤트 호출
  grdMasterOnNewRecord({
    row: rowCount,
    rowData: newRowData
  });
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  // 현재 선택된 로우 Validation 체크
  if (G_GRDMASTER.lastRow != null) {
    if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
      return;
    }
  }

  var saveDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();

  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);

    if (rowData.CRUD !== "R") {
      var saveData = {
        P_BRAND_CD: $NC.getValue("#edtBrand_Cd"),
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_NM: rowData.ITEM_NM,
        P_ITEM_FULL_NM: rowData.ITEM_FULL_NM,
        P_ITEM_SPEC: rowData.ITEM_SPEC,
        P_ITEM_COLOR: rowData.ITEM_COLOR,
        P_ITEM_MODEL: rowData.ITEM_MODEL,
        P_ITEM_DIV: rowData.ITEM_DIV,
        P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
        P_DEPART_CD: rowData.DEPART_CD,
        P_LINE_CD: rowData.LINE_CD,
        P_CLASS_CD: rowData.CLASS_CD,
        P_KEEP_DIV: rowData.KEEP_DIV,
        P_ITEM_BAR_CD: rowData.ITEM_BAR_CD,
        P_CASE_BAR_CD: rowData.CASE_BAR_CD,
        P_BOX_BAR_CD: rowData.BOX_BAR_CD,
        P_IN_UNIT_CD: rowData.IN_UNIT_CD,
        P_OUT_UNIT_CD: rowData.OUT_UNIT_CD,
        P_ITEM_WEIGHT: rowData.ITEM_WEIGHT,
        P_BOX_WEIGHT: rowData.BOX_WEIGHT,
        P_BOX_WIDTH: rowData.BOX_WIDTH,
        P_BOX_LENGTH: rowData.BOX_LENGTH,
        P_BOX_HEIGHT: rowData.BOX_HEIGHT,
        P_BOX_CBM: rowData.BOX_CBM,
        P_QTY_IN_CASE: rowData.QTY_IN_CASE,
        P_QTY_IN_BOX: rowData.QTY_IN_BOX,
        P_BOX_IN_PLT: rowData.BOX_IN_PLT,
        P_PLT_STAIR: rowData.PLT_STAIR,
        P_PLT_PLACE: rowData.PLT_PLACE,
        P_FILL_UNIT_QTY: rowData.FILL_UNIT_QTY,
        P_PLT_SPLIT_DIV: rowData.PLT_SPLIT_DIV,
        P_VALID_DIV: rowData.VALID_DIV,
        P_TERM_DIV: rowData.TERM_DIV,
        P_TERM_VAL: rowData.TERM_VAL,
        P_BUY_PRICE: rowData.BUY_PRICE,
        P_SUPPLY_PRICE: rowData.SUPPLY_PRICE,
        P_SALE_PRICE: rowData.SALE_PRICE,
        P_VAT_YN: rowData.VAT_YN,
        P_DEAL_DIV: rowData.DEAL_DIV,
        P_OPEN_DATE: rowData.OPEN_DATE,
        P_CLOSE_DATE: rowData.CLOSE_DATE,
        P_REMARK1: rowData.REMARK1,
        P_SET_ITEM_YN: rowData.SET_ITEM_YN,
        P_BOXING_YN: rowData.BOXING_YN,
        P_DELIVERY_YN: rowData.DELIVERY_YN,
        P_ITEM_CBM: rowData.ITEM_CBM,
        P_DELIVERY_TYPE1: rowData.DELIVERY_TYPE1,
        P_DELIVERY_TYPE2: rowData.DELIVERY_TYPE2,
        P_DELIVERY_BOX: rowData.DELIVERY_BOX,  
        P_IN_UNIT_QTY: rowData.IN_UNIT_QTY,
        P_OUT_UNIT_QTY: rowData.OUT_UNIT_QTY,
        P_CRUD: rowData.CRUD
      };

      saveDS.push(saveData);
    }
  }

  if (saveDS.length > 0) {
    $NC.serviceCall("/CM04020E/save.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
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

  var result = confirm("삭제 하시겠습니까?");
  if (result) {
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    // 신규 데이터일 경우 그냥 삭제
    if (rowData.CRUD === "C" || rowData.CRUD === "N") {
      // 마지막 선택 Row 수정 상태 복원
      G_GRDMASTER.lastRowModified = false;

      G_GRDMASTER.data.deleteItem(rowData.id);
      // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
      if (G_GRDMASTER.lastRow > 1) {
        $NC.setGridSelectRow(G_GRDMASTER, G_GRDMASTER.lastRow - 1);
      } else {
        if (G_GRDMASTER.data.getLength() === 0) {
          $NC.setEnableGroup("#divMasterInfoView", false);
          setInputValue("#grdMaster");
          $NC.setGridDisplayRows("#grdMaster", 0, 0);
        } else {
          $NC.setGridSelectRow(G_GRDMASTER, 0);
        }
      }
    } else {
      rowData.CRUD = "D";
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
      _Save();
    }
  }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "ITEM_CD"
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 */
function _Print(printIndex, printName) {

}

function setInputValue(grdSelector, rowData) {
  if (grdSelector === "#grdMaster") {

    if ($NC.isNull(rowData)) {
      // 초기화시 기본값 지정
      rowData = {
        CRUD: "R"
      };
    }
    // 선택된 로우 데이터로 에디터 세팅
    $NC.setValue("#edtBrand_Cd", rowData.BRAND_CD);
    $NC.setValue("#edtBrand_Nm", rowData.OWN_BRAND_NM);
    $NC.setValue("#edtItem_Cd", rowData.ITEM_CD);
    $NC.setValue("#edtSap_Item_Cd", rowData.SAP_ITEM_CD);
    $NC.setValue("#edtItem_Nm", rowData.ITEM_NM);
    $NC.setValue("#edtItem_Full_Nm", rowData.ITEM_FULL_NM);
    $NC.setValue("#edtItem_Spec", rowData.ITEM_SPEC);
    $NC.setValue("#edtItem_Color", rowData.ITEM_COLOR);
    $NC.setValue("#edtItem_Model", rowData.ITEM_MODEL);
    $NC.setValue("#cboItem_Div", rowData.ITEM_DIV);
    $NC.G_VAR.divMasterInfoView.TEST = rowData.DEPART_CD;
    $NC.setValue("#cboDepart_Cd", $NC.G_VAR.divMasterInfoView.TEST);
    
//    setDepartCombo();
    setLineCombo(rowData.LINE_CD);
    setClassCombo(rowData.LINE_CD, rowData.CLASS_CD);
    $NC.setValue("#cboKeep_Div", rowData.KEEP_DIV);
    $NC.setValue("#edtItem_Bar_Cd", rowData.ITEM_BAR_CD);
    $NC.setValue("#edtCase_Bar_Cd", rowData.CASE_BAR_CD);
    $NC.setValue("#edtBox_Bar_Cd", rowData.BOX_BAR_CD);
    $NC.setValue("#cboIn_Unit_Cd", rowData.IN_UNIT_CD);
    $NC.setValue("#cboOut_Unit_Cd", rowData.OUT_UNIT_CD);
    $NC.setValue("#edtItem_Weight", rowData.ITEM_WEIGHT);
    $NC.setValue("#edtBox_Weight", rowData.BOX_WEIGHT);
    $NC.setValue("#edtBox_Width", rowData.BOX_WIDTH);
    $NC.setValue("#edtBox_Length", rowData.BOX_LENGTH);
    $NC.setValue("#edtBox_Height", rowData.BOX_HEIGHT);
    $NC.setValue("#edtBox_Cbm", rowData.BOX_CBM);
    $NC.setValue("#edtQty_In_Case", rowData.QTY_IN_CASE);
    $NC.setValue("#edtQty_In_Box", rowData.QTY_IN_BOX);
    $NC.setValue("#edtBox_In_Plt", rowData.BOX_IN_PLT);
    $NC.setValue("#edtPlt_Stair", rowData.PLT_STAIR);
    $NC.setValue("#edtPlt_Place", rowData.PLT_PLACE);
    $NC.setValue("#edtFill_Unit_Qty", rowData.FILL_UNIT_QTY);
    $NC.setValue("#cboPlt_Split_Div", rowData.PLT_SPLIT_DIV);
//    $NC.setValue("#edtVendor_Cd", rowData.VENDOR_CD);
    $NC.setValue("#edtVendor_Nm", rowData.VENDOR_NM);
    $NC.setValue("#cboValid_Div", rowData.VALID_DIV);
    $NC.setValue("#edtIn_Unit_Qty", rowData.IN_UNIT_QTY);
    $NC.setValue("#edtOut_Unit_Qty", rowData.OUT_UNIT_QTY);

    $NC.setValue("#cboTerm_Div", rowData.TERM_DIV);
    $NC.setValue("#edtTerm_Val", rowData.TERM_VAL);
    $NC.setValue("#edtBuy_Price", rowData.BUY_PRICE);
    $NC.setValue("#edtSupply_Price", rowData.SUPPLY_PRICE);
    $NC.setValue("#edtSale_Price", rowData.SALE_PRICE);
    $NC.setValue("#chkVat_Yn", rowData.VAT_YN);
    $NC.setValue("#rgbDeal_Div1", rowData.DEAL_DIV === "1");
    $NC.setValue("#rgbDeal_Div2", rowData.DEAL_DIV === "2");
    $NC.setValue("#rgbDeal_Div3", rowData.DEAL_DIV === "3");
    $NC.setValue("#dtpOpen_Date", rowData.OPEN_DATE);
    $NC.setValue("#dtpClose_Date", rowData.CLOSE_DATE);
    $NC.setValue("#edtRemark1", rowData.REMARK1);
    $NC.setValue("#chkSet_Item_Yn", rowData.SET_ITEM_YN);
    $NC.setValue("#cboBoxing_Yn", rowData.BOXING_YN);
    $NC.setValue("#cboDelivery_Yn", rowData.DELIVERY_YN);
    $NC.setValue("#edtItem_Cbm", rowData.ITEM_CBM);
    $NC.setValue("#cboDelivery_Type1", rowData.DELIVERY_TYPE1);
    $NC.setValue("#cboDelivery_Type2", rowData.DELIVERY_TYPE2);
    $NC.setValue("#cboDelivery_Box", rowData.DELIVERY_BOX);

    $("#divTermInfo").show();
    if (rowData.VALID_DIV != "1") {
      $("#divTermInfo").hide();
    }

    // 신규 데이터면 공급처코드 수정할 수 있게 함
    if (rowData.CRUD == "C" || rowData.CRUD == "N") {
      $NC.setEnable("#edtItem_Cd");

      $NC.setEnable("#btnBrand_Cd", true);
      $NC.setEnable("#edtBrand_Cd", true);
      $NC.setEnable("#edtSap_Item_Cd", false);
      
    } else {
      $NC.setEnable("#edtBrand_Cd", false);
      $NC.setEnable("#edtItem_Cd", false);
      $NC.setEnable("#edtSap_Item_Cd", false);
      $NC.setEnable("#btnBrand_Cd", false);
    }
    // 수정일 경우 거래구분 비표시
    // $("#divDealDiv").hide();
    // $("#divDealDivTitle").hide();
  }
}

function grdMasterOnBeforePost(row) {

  if (!G_GRDMASTER.lastRowModified) {
    return true;
  }
  var rowData = G_GRDMASTER.data.getItem(row);
  

  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.ITEM_CD)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.ITEM_CD)) {
      alert("상품코드를 입력하십시오.");
      $NC.setFocus("#edtItem_Cd");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }

    if ($NC.isNull(rowData.ITEM_NM)) {
      alert("상품명을 입력하십시오.");
      $NC.setFocus("#edtItem_Nm");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.DEAL_DIV)) {
      alert("거래구분을 선택하십시오.");
      $NC.setFocus("#rgbDeal_Div");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.QTY_IN_BOX)) {
      alert("박스입수를 입력하십시오.");
      $NC.setFocus("#edtQty_In_Box");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if (Number(rowData.QTY_IN_BOX) < 1) {
      alert("박스입수에 1이상의 정수를 입력하십시오.");
      $NC.setFocus("#edtQty_In_Box");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.BOX_IN_PLT)) {
      alert("팔레트입수를 입력하십시오.");
      $NC.setFocus("#edtBox_In_Plt");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.PLT_SPLIT_DIV)) {
      alert("팔레트분할을 선택하십시오.");
      $NC.setFocus("#cboPlt_Split_Div");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if (!$NC.isNull(rowData.OPEN_DATE)) {
      $NC.setValueDatePicker("#dtpOpen_Date", rowData.OPEN_DATE, "거래일자를 정확히 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
    }
    if (!$NC.isNull(rowData.CLOSE_DATE)) {
      $NC.setValueDatePicker("#dtpClose_Date", rowData.CLOSE_DATE, "종료일자를 정확히 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
    }
    if ($NC.isNull(rowData.ITEM_DIV)) {
      alert("상품구분을 선택하십시오.");
      $NC.setFocus("#cboItem_Div");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }

    if ($NC.isNull(rowData.DELIVERY_TYPE1)) {
        alert("사이즈구분을 선택하십시오.");
        $NC.setFocus("#cboDelivery_Type1");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        return false;
      }
      if ($NC.isNull(rowData.DELIVERY_TYPE2)) {
        alert("송장출력구분을 선택하십시오.");
        $NC.setFocus("#cboDelivery_Type2");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        return false;
      }
      if ($NC.isNull(rowData.BOXING_YN)) {
        alert("합포장가능여부를 선택하십시오.");
        $NC.setFocus("#cboBoxing_Yn");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        return false;
      }
      if ($NC.isNull(rowData.DELIVERY_YN)) {
        alert("당일배송가능여부를 선택하십시오.");
        $NC.setFocus("#cboDelivery_Yn");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        return false;
      }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdMasterOnNewRecord(args) {

  $NC.setValue("#cboPlt_Split_Div", args.rowData.PLT_SPLIT_DIV);
  $NC.setValue("#rgbDeal_Div", args.rowData.DEAL_DIV);

  // $NC.setFocus("#edtItem_Cd");
  $NC.setEnable("#edtItem_Cd", false);
  $NC.setEnable("#edtedtSap_Item_Cd", false);
  $NC.setFocus("#edtBrand_Cd");
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업부명",
    minWidth: 100
  });
  
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_NM",
    field: "OWN_BRAND_NM",
    name: "위탁사명",
    minWidth: 100
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
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_FULL_NM",
    field: "ITEM_FULL_NM",
    name: "상품정식명칭",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_DIV_F",
    field: "ITEM_DIV_F",
    name: "상품구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "KEEP_DIV_F",
    field: "KEEP_DIV_F",
    name: "보관구분",
    minWidth: 120,
  });
  $NC.setGridColumn(columns, {
    id: "SAP_ITEM_CD",
    field: "SAP_ITEM_CD",
    name: "SAP코드",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_BAR_CD",
    field: "ITEM_BAR_CD",
    name: "상품바코드",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "CASE_BAR_CD",
    field: "CASE_BAR_CD",
    name: "소박스바코드",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "BOX_BAR_CD",
    field: "BOX_BAR_CD",
    name: "박스바코드",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "박스입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_CASE",
    field: "QTY_IN_CASE",
    name: "소박스입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_COLOR",
    field: "ITEM_COLOR",
    name: "색상",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_MODEL",
    field: "ITEM_MODEL",
    name: "모델",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_WEIGHT",
    field: "ITEM_WEIGHT",
    name: "상품중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BOX_CBM",
    field: "BOX_CBM",
    name: "박스용적",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BOX_IN_PLT",
    field: "BOX_IN_PLT",
    name: "팔레트입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PLT_PLACE",
    field: "PLT_PLACE",
    name: "팔레트면박스수",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PLT_STAIR",
    field: "PLT_STAIR",
    name: "팔레트단박스수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "FILL_UNIT_QTY",
    field: "FILL_UNIT_QTY",
    name: "보충단위수량",
    minWidth: 110,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VALID_DIV_F",
    field: "VALID_DIV_F",
    name: "유통기한구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "DEPART_NM",
    field: "DEPART_NM",
    name: "대분류",
    minWidth: 130,
    cssClass: "align-center",
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_ITEMGROUP_DEPART",
      P_QUERY_PARAMS: $NC.getParams({
        P_BRAND_CD: "BRAND_CD"
      })
    }, {
      codeField: "DEPART_CD",
      dataCodeField: "DEPART_CD",
      dataFullNameField: "DEPART_NM",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NM",
    field: "LINE_NM",
    name: "중분류",
    minWidth: 130,
    cssClass: "align-center",
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_ITEMGROUP_LINE",
      P_QUERY_PARAMS: $NC.getParams({
        P_BRAND_CD: "BRAND_CD",
        P_DEPART_CD: "DEPART_CD"
      })
    }, {
      codeField: "LINE_CD",
      dataCodeField: "LINE_CD",
      dataFullNameField: "LINE_NM",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "CLASS_NM",
    field: "CLASS_NM",
    name: "소분류",
    minWidth: 130,
    cssClass: "align-center",
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_ITEMGROUP_CLASS",
      P_QUERY_PARAMS: $NC.getParams({
        P_BRAND_CD: "BRAND_CD",
        P_DEPART_CD: "DEPART_CD",
        P_LINE_CD: "LINE_CD"
      })
    }, {
      codeField: "CLASS_CD",
      dataCodeField: "CLASS_CD",
      dataFullNameField: "CLASS_NM",
      isKeyField: true
    })
  });
  /*
  $NC.setGridColumn(columns, {
    id: "DEPART_NM",
    field: "DEPART_NM",
    name: "대분류",
    minWidth: 130,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NM",
    field: "LINE_NM",
    name: "중분류",
    minWidth: 130,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CLASS_NM",
    field: "CLASS_NM",
    name: "소분류",
    minWidth: 130,
    cssClass: "align-center"
  });
  */
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
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
    id: "SALE_PRICE",
    field: "SALE_PRICE",
    name: "판매단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VAT_YN",
    field: "VAT_YN",
    name: "과세여부",
    minWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });  
  $NC.setGridColumn(columns, {
    id: "BOXING_YN",
    field: "BOXING_YN",
    name: "합포장불가여부",
    minWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_YN",
    field: "DELIVERY_YN",
    name: "당일배송불가여부",
    minWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "SET_ITEM_YN",
    field: "SET_ITEM_YN",
    name: "세트상품여부",
    minWidth: 100,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CBM",
    field: "ITEM_CBM",
    name: "박스용적",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_TYPE1_D",
    field: "DELIVERY_TYPE1_D",
    name: "배송구분[대물]",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_TYPE2_D",
    field: "DELIVERY_TYPE2_D",
    name: "배송구분[세트]",
    minWidth: 100,
    cssClass: "align-center"
  });  
  $NC.setGridColumn(columns, {
    id: "DELIVERY_BOX_D",
    field: "DELIVERY_BOX_D",
    name: "기본배송박스",
    minWidth: 120,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 400
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CM04020E.RS_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onScroll.subscribe(grdMasterOnScroll);
}

/**
 * 마스터 그리드 스크롤 이벤트 처리
 * @param  {Object} e    
 * @param  {object} args 
 * @return 
 */
function grdMasterOnScroll(e, args){
  var screenHeight = parseInt($('#grdMaster').css('height'), 10)
    ,contentHeight = $NC.G_VAR.P_CONTENT_HEIGHT
    ,curScroll = args.scrollTop

  if (contentHeight - screenHeight < curScroll && $NC.G_VAR.P_LOAD_CONTENT) {
    $NC.G_VAR.P_LOAD_CONTENT = false;
    loadContents();
  }
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
    if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 에디터 값 세팅
  setInputValue("#grdMaster", G_GRDMASTER.data.getItem(row));

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdMasterOnCellChange(e, args) {
  //$NC.G_VAR.divMasterInfoView.TEST ="";
  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    return;
  }
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (rowData) {
    switch (args.col) {
   
    case "BRAND_CD":
      rowData.BRAND_CD = args.val;
      var P_QUERY_PARAMS;
      var O_RESULT_DATA = [ ];
      if (!$NC.isNull(args.val)) {
        P_QUERY_PARAMS = {
          P_CUST_CD: $NC.G_USERINFO.CUST_CD,
          P_BU_CD: $NC.getValue("#edtQBu_Cd",true),
          P_OWN_BRAND_CD: args.val
        };
        O_RESULT_DATA = $NP.getOwnBrandInfo({
          queryParams: P_QUERY_PARAMS
        });
      }
      if (O_RESULT_DATA.length <= 1) {
        onOwnBrand2Popup(O_RESULT_DATA[0]);
      } else {
        $NP.showOwnBranPopup({
          queryParams: P_QUERY_PARAMS,
          queryData: O_RESULT_DATA
        }, onOwnBrand2Popup, onOwnBrand2Popup);
      }
      break;
    case "SAP_ITEM_CD":
      rowData.SAP_ITEM_CD = args.val;
      break;
    case "ITEM_NM":
      rowData.ITEM_NM = args.val;
      if ($NC.isNull(rowData.ITEM_FULL_NM)) {
        rowData.ITEM_FULL_NM = rowData.ITEM_NM;
        rowData.ITEM_CD = $NC.G_VAR.divMasterInfoView.ITEMCD;
        $NC.setValue("#edtItem_Full_Nm", rowData.ITEM_FULL_NM);
      }
      break;
    case "ITEM_FULL_NM":
      rowData.ITEM_FULL_NM = args.val;
      break;
    case "ITEM_SPEC":
      rowData.ITEM_SPEC = args.val;
      break;
    case "ITEM_COLOR":
      rowData.ITEM_COLOR = args.val;
      break;
    case "ITEM_MODEL":
      rowData.ITEM_MODEL = args.val;
      break;
    case "ITEM_DIV":
      var ITEM_DIV_CHK = rowData.ITEM_DIV;
      if(ITEM_DIV_CHK == "9" && args.val !== "9"){
        rowData.ITEM_DIV = ITEM_DIV_CHK;
        rowData.ITEM_DIV_F = $NC.getValueCombo("#cboItem_Div", "F");
        $NC.setValue("#cboItem_Div", rowData.ITEM_DIV);
        alert("사입 상품 구분값 처리는 ERP 인터페이스로만 처리가능합니다.");
        return;
      } else if (ITEM_DIV_CHK !== "9" && args.val == "9"){
        rowData.ITEM_DIV = ITEM_DIV_CHK;
        rowData.ITEM_DIV_F = $NC.getValueCombo("#cboItem_Div", "F");
        $NC.setValue("#cboItem_Div", rowData.ITEM_DIV);
        alert("사입 상품 구분값 처리는 ERP 인터페이스로만 처리가능합니다.");
        return;
      }
      rowData.ITEM_DIV = args.val;
      rowData.ITEM_DIV_F = $NC.getValueCombo("#cboItem_Div", "F");
      break;
    case "KEEP_DIV":
      rowData.KEEP_DIV = args.val;
      rowData.KEEP_DIV_F = $NC.getValueCombo("#cboKeep_Div", "F");
      break;
      /*
    case "VENDOR_CD":
      var P_QUERY_PARAMS;
      var O_RESULT_DATA = [ ];
      if (!$NC.isNull(args.val)) {
        P_QUERY_PARAMS = {
          P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
          P_VENDOR_CD: args.val,
          P_VIEW_DIV: "2"
        };
        O_RESULT_DATA = $NP.getVendorInfo({
          queryParams: P_QUERY_PARAMS
        });
      }
      if (O_RESULT_DATA.length <= 1) {
        onVendorPopup(O_RESULT_DATA[0]);
      } else {
        $NP.showVendorPopup({
          queryParams: P_QUERY_PARAMS,
          queryData: O_RESULT_DATA
        }, onVendorPopup, onVendorPopup);
      }
      return;
      */
    case "DEPART_CD":
      
      rowData.DEPART_CD = args.val;
      $NC.G_VAR.divMasterInfoView.TEST = args.val;
      rowData.DEPART_NM = $NC.getValueCombo("#cboDepart_Cd", "F");
      rowData.LINE_CD = null;
      rowData.CLASS_CD = null;
      rowData.LINE_NM = null;
      rowData.CLASS_NM = null;
      setLineCombo(rowData.LINE_CD);
      break;
    case "LINE_CD":
      rowData.LINE_CD = args.val;
      rowData.LINE_NM = $NC.getValueCombo("#cboLine_Cd", "F");
      rowData.CLASS_CD = null;
      rowData.CLASS_NM = null;
      setClassCombo(rowData.LINE_CD, rowData.CLASS_CD);
      break;
    case "CLASS_CD":
      rowData.CLASS_CD = args.val;
      rowData.CLASS_NM = $NC.getValueCombo("#cboClass_Cd", "F");
      break;
    case "ITEM_BAR_CD":
      rowData.ITEM_BAR_CD = args.val;
      break;
    case "CASE_BAR_CD":
      rowData.CASE_BAR_CD = args.val;
      break;
    case "BOX_BAR_CD":
      rowData.BOX_BAR_CD = args.val;
      break;
    case "IN_UNIT_CD":
      rowData.IN_UNIT_CD = args.val;
      break;
    case "OUT_UNIT_CD":
      rowData.OUT_UNIT_CD = args.val;
      break;
    case "ITEM_WEIGHT":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtItem_Weight", "0");
        rowData.ITEM_WEIGHT = "0";
      } else {
        rowData.ITEM_WEIGHT = args.val;
      }
      break;
    case "BOX_WEIGHT":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtBox_Weight", "0");
        rowData.BOX_WEIGHT = "0";
      } else {
        rowData.BOX_WEIGHT = args.val;
      }
      rowData.BOX_CBM = setBox_Cbm();
      break;
    case "BOX_WIDTH":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtBox_Width", "0");
        rowData.BOX_WIDTH = "0";
      } else {
        rowData.BOX_WIDTH = args.val;
      }
      rowData.BOX_CBM = setBox_Cbm();
      break;
    case "BOX_LENGTH":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtBox_Length", "0");
        rowData.BOX_LENGTH = "0";
      } else {
        rowData.BOX_LENGTH = args.val;
      }
      break;
    case "BOX_HEIGHT":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtBox_Height", "0");
        rowData.BOX_HEIGHT = "0";
      } else {
        rowData.BOX_HEIGHT = args.val;
      }
      rowData.BOX_CBM = setBox_Cbm();
      break;
    case "BOX_CBM":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtBox_Cbm", "0");
        rowData.BOX_CBM = "0";
      } else {
        rowData.BOX_CBM = args.val;
      }
      break;
    case "QTY_IN_CASE":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtQty_In_Case", "1");
        rowData.QTY_IN_CASE = "1";
      } else {
        rowData.QTY_IN_CASE = args.val;
      }
      break;
    case "QTY_IN_BOX":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtQty_In_Box", "1");
        rowData.QTY_IN_BOX = "1";
      } else {
        rowData.QTY_IN_BOX = args.val;
      }
      break;
    case "BOX_IN_PLT":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtBox_In_Plt", "0");
        rowData.BOX_IN_PLT = "0";
      } else {
        rowData.BOX_IN_PLT = args.val;
      }
      break;
    case "PLT_STAIR":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtPlt_Stair", "0");
        rowData.PLT_STAIR = "0";
      } else {
        rowData.PLT_STAIR = args.val;
      }
      break;
    case "PLT_PLACE":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtPlt_Place", "0");
        rowData.PLT_PLACE = "0";
      } else {
        rowData.PLT_PLACE = args.val;
      }
      break;
    case "FILL_UNIT_QTY":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtFill_Unit_Qty", "0");
        rowData.FILL_UNIT_QTY = "0";
      } else {
        rowData.FILL_UNIT_QTY = args.val;
      }
      break;
    case "PLT_SPLIT_DIV":
      rowData.PLT_SPLIT_DIV = args.val;
      break;
    case "VALID_DIV":
      if (args.val == "1") {
        $("#divTermInfo").show();
      } else {
        $("#divTermInfo").hide();
      }
      rowData.VALID_DIV = args.val;
      rowData.VALID_DIV_F = $NC.getValueCombo("#cboValid_Div", "F");
      break;
    case "TERM_DIV":
      rowData.TERM_DIV = args.val;
      break;
    case "TERM_VAL":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtTerm_Val", "0");
        rowData.TERM_VAL = "0";
      } else {
        rowData.TERM_VAL = args.val;
      }
      break;
    case "BUY_PRICE":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtBuy_Price", "0");
        rowData.BUY_PRICE = "0";
      } else {
        rowData.BUY_PRICE = args.val;
      }
      break;
    case "SUPPLY_PRICE":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtSupply_Price", "0");
        rowData.SUPPLY_PRICE = "0";
      } else {
        rowData.SUPPLY_PRICE = args.val;
      }
      break;
    case "SALE_PRICE":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtSale_Price", "0");
        rowData.SALE_PRICE = "0";
      } else {
        rowData.SALE_PRICE = args.val;
      }
      break;
    case "VAT_YN":
      rowData.VAT_YN = args.val;
      break;
    case "DEAL_DIV1":
    case "DEAL_DIV2":
    case "DEAL_DIV3":
      rowData.DEAL_DIV = args.val;
      break;
    case "OPEN_DATE":
      if (!$NC.isNull(args.val)) {
        $NC.setValueDatePicker(args.view, args.val, "거래일자를 정확히 입력하십시오.");
      }
      rowData.OPEN_DATE = $NC.getValue(args.view);
      break;
    case "CLOSE_DATE":
      if (!$NC.isNull(args.val)) {
        $NC.setValueDatePicker(args.view, args.val, "종료일자를 정확히 입력하십시오.");
      }
      rowData.CLOSE_DATE = $NC.getValue(args.view);
      break;
    case "REMARK1":
      rowData.REMARK1 = args.val;
      break;
    case "SET_ITEM_YN":
      rowData.SET_ITEM_YN = args.val;
      break;
    case "BOXING_YN":
      rowData.BOXING_YN = args.val;
      break;
    case "DELIVERY_YN":
      rowData.DELIVERY_YN = args.val;
      break;
    case "ITEM_CBM":
      if ($NC.isNull(args.val)) {
        $NC.setValue("#edtItem_Cbm", "0");
        rowData.ITEM_CBM = "0";
      } else {
        rowData.ITEM_CBM = args.val;
      }
      break;
    case "DELIVERY_TYPE1":
      rowData.DELIVERY_TYPE1 = args.val;
      break;
      
    case "DELIVERY_TYPE2":
      rowData.DELIVERY_TYPE2 = args.val;
      break;

    case "DELIVERY_BOX":
      rowData.DELIVERY_BOX = args.val;
      break;

    case "IN_UNIT_QTY":
      rowData.IN_UNIT_QTY = args.val;
      break; 
    case "OUT_UNIT_QTY":
      rowData.OUT_UNIT_QTY = args.val;
      break;
    }

    if (rowData.CRUD === "R") {
      rowData.CRUD = "U";
    }
    G_GRDMASTER.data.updateItem(rowData.id, rowData);

    // 마지막 선택 Row 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;
  }
}

/**
 * 브랜드 코드 검색 결과
 */
function onGetUserBrand(ajaxData) {

  var arrayData = $NC.toArray(ajaxData);
  // 검색한 데이터가 1건일 경우
  if (arrayData.length === 1) {
    $NC.setValue("#edtQBrand_Cd", arrayData[0].BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", arrayData[0].BRAND_NM);
    setDepartCombo();
    // 검색한 데이터가 0건일 경우
  } else if (arrayData.length === 0) {
    alert("등록되어 있지 않은 위탁사입니다.");
    setDepartCombo();
//    onBrandPopupCancel();
  } else {

    _ShowUserBrandPopup({
      queryParams: {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd")
      },
      queryData: arrayData
    }, onBrandPopupSelect, function() {
      setDepartCombo();
//      onBrandPopupCancel();
      onChangingCondition();
    });
    return;
  }

  onChangingCondition();
  // 브랜드 값 변경시 대분류 재 설정
  setDepartCombo();

}
function setDepartCombo1() {

  $("#cboDepart_Cd").empty();
  // 대분류 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_ITEMGROUP_DEPART",
    P_QUERY_PARAMS: $NC.getParams({
    P_BRAND_CD: $NC.getValue("#edtBrand_Cd")
    })
  }, {
    selector: "#cboDepart_Cd",
    codeField: "DEPART_CD",
    fullNameField: "DEPART_CD_F",
    onComplete: function() {
      $NC.setValue("#cboDepart_Cd");
    }
  });
  //$("#cboLine_Cd").empty(); // 중분류 초기화
  //$("#cboClass_Cd").empty(); // 소분류 초기화
}
/**
 * 대분류 combobox 설정
 */
function setDepartCombo() {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  $("#cboDepart_Cd").empty();
  // 대분류 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_ITEMGROUP_DEPART",
    P_QUERY_PARAMS: $NC.getParams({
      P_BRAND_CD: rowData.BRAND_CD
//      P_BRAND_CD: $NC.getValue("#edtQBrand_Cd")
    })
  }, {
    selector: "#cboDepart_Cd",
    codeField: "DEPART_CD",
//    fullNameField: "DEPART_CD_F",
    fullNameField: "DEPART_NM",
    onComplete: function() {
      $NC.setValue("#cboDepart_Cd",rowData.DEPART_CD);
    }
  });
  
  //$("#cboLine_Cd").empty(); // 중분류 초기화
  //$("#cboClass_Cd").empty(); // 소분류 초기화
}

/**
 * 중분류 combobox 설정
 */
function setLineCombo(LINE_CD) {

  $("#cboLine_Cd").empty();
  $("#cboClass_Cd").empty();

  var DEPART_CD = $NC.G_VAR.divMasterInfoView.TEST;
  if ($NC.isNull(DEPART_CD)) {
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  // 중분류 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_ITEMGROUP_LINE",
    P_QUERY_PARAMS: $NC.getParams({
      P_BRAND_CD: $NC.getValue("#edtBrand_Cd"),
      P_DEPART_CD: DEPART_CD
    })
  }, {
    selector: "#cboLine_Cd",
    codeField: "LINE_CD",
//    fullNameField: "LINE_CD_F",
    fullNameField: "LINE_NM",
    onComplete: function() {
      $NC.setValue("#cboLine_Cd", LINE_CD);
    }
  });
}

/**
 * 소분류 combobox 설정
 */
function setClassCombo(LINE_CD, CLASS_CD) {

  $("#cboClass_Cd").empty();

  var DEPART_CD = $NC.G_VAR.divMasterInfoView.TEST;
  if ($NC.isNull($NC.G_VAR.divMasterInfoView.TEST) || $NC.isNull(LINE_CD)) {
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  
  // 소분류 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_ITEMGROUP_CLASS",
    P_QUERY_PARAMS: $NC.getParams({
      //P_BRAND_CD: rowData.BRAND_CD,
      P_BRAND_CD: $NC.getValue("#edtBrand_Cd"),
      P_DEPART_CD: DEPART_CD,
      P_LINE_CD: LINE_CD
    })
  }, {
    selector: "#cboClass_Cd",
    codeField: "CLASS_CD",
//    fullNameField: "CLASS_CD_F",
    fullNameField: "CLASS_NM",
    onComplete: function() {
      $NC.setValue("#cboClass_Cd", CLASS_CD);
    }
  });
}

/**
 * 용적 계산
 */
function setBox_Cbm() {
  var cbm = 0;
  var width = $NC.getValue("#edtBox_Width").replace(",", "");
  var length = $NC.getValue("#edtBox_Length").replace(",", "");
  var height = $NC.getValue("#edtBox_Height").replace(",", "");
  cbm = width * length * height / 1000000000;
  $NC.setValue("#edtBox_Cbm", cbm);
  return cbm;

}

function onGetMaster(ajaxData) {

  if (G_GRDMASTER.data.getLength() === 0) {
    $NC.setInitGridData(G_GRDMASTER, ajaxData);
  } else {
    var resultArray = $NC.toArray(ajaxData);
    for (var i in resultArray) {
      resultArray[i].id = 'id_' + (parseInt(($NC.G_VAR.P_PAGE_ITEMS * $NC.G_VAR.P_PAGE_COUNT)) + parseInt(i));
      G_GRDMASTER.data.addItem(resultArray[i]);
    }
  }
  $NC.G_VAR.P_PAGE_COUNT++;
  $NC.G_VAR.P_CONTENT_HEIGHT = ($NC.G_VAR.P_PAGE_ITEMS * $NC.G_VAR.P_PAGE_COUNT) * 25;
  $NC.G_VAR.P_TOTAL = $NC.G_VAR.P_PAGE_ITEMS * $NC.G_VAR.P_PAGE_COUNT;
  $NC.G_VAR.P_LOAD_CONTENT = true;

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.G_USERINFO.CERTIFY_DIV !== '4') {
      $NC.setEnableGroup("#divMasterInfoView", true);
    }
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      if ($NC.G_VAR.P_PAGE_COUNT == 1) {
        $NC.setGridSelectRow(G_GRDMASTER, 0);
        setDepartCombo();
      }
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: new Array("BRAND_CD", "ITEM_CD"),
        //selectKey: "ITEM_CD",
        selectVal: G_GRDMASTER.lastKeyVal,
        activeCell: true
      });
    }
  } else {
    $NC.setEnableGroup("#divMasterInfoView", false);
    setInputValue("#grdMaster");
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "1";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "ITEM_CD"
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (rowData.CRUD === "D") {
    rowData.CRUD = "U";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
    // 마지막 선택 Row 수정 상태로 변경
    G_GRDMASTER.lastRowModified = false;
  }
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  // 조회시 전역 변수 값 초기화
  $NC.clearGridData(G_GRDMASTER);

  //setInputValue("#grdMaster");
  $NC.setEnableGroup("#divMasterInfoView", false);

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
 * 검색조건의 브랜드 검색 이미지 클릭
 */
function showUserBrandPopup() {
  $NP.showUserBrandPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BRAND_CD: "%"
  }, onUserBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onUserBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  onChangingCondition();
  // 브랜드 값 변경시 대분류 재 설정
  //setDepartCombo();
}

/**
 * 공급처 검색 결과
 * 
 * @param seletedRowData
 */
function showVendorPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd", true);

  $NP.showVendorPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_VENDOR_CD: "%",
      P_VIEW_DIV: "2"
    }
  }, onVendorPopup, function() {
    $NC.setFocus("#edtVendor_Cd", true);
  });
}

function onVendorPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.setValue("#edtVendor_Cd", resultInfo.VENDOR_CD);
    $NC.setValue("#edtVendor_Nm", resultInfo.VENDOR_NM);

    rowData.VENDOR_CD = resultInfo.VENDOR_CD;
    rowData.VENDOR_NM = resultInfo.VENDOR_NM;
  } else {
    $NC.setValue("#edtVendor_Cd");
    $NC.setValue("#edtVendor_Nm");
    $NC.setFocus("#edtVendor_Cd", true);

    rowData.VENDOR_CD = "";
    rowData.VENDOR_NM = "";

  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}



/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {
  var BU_CD = $NC.getValue("#edtQBu_Cd",true);

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
//  setDepartCombo();
  onChangingCondition();
}


/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBran2Popup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd",true);

  $NP.showOwnBranPopup({
    P_CUST_CD: $NC.G_USERINFO.CUST_CD,   
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrand2Popup, function() {
    $NC.setFocus("#edtBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onOwnBrand2Popup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtBrand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtBrand_Cd");
    $NC.setValue("#edtBrand_Nm");
    $NC.setFocus("#edtBrand_Cd", true);
  }
  //setDepartCombo1();
}


function viewExpandWidth() {
  var viewBrandCd = $NC.getView("#lblPopup_Brand_Cd");
  $(viewBrandCd).css("width", "100px");
//  var viewVendorCd = $NC.getView("#lblPopup_Vendor_Cd");
//  $(viewVendorCd).css("width", "100px");
  var viewBoxingYn = $NC.getView("#lblBoxing_Yn");
  $(viewBoxingYn).css("width", "100px");
  var viewDeal = $NC.getView("#lblDeal_Div");
  $(viewDeal).css("width", "100px");
  var viewOpenDate = $NC.getView("#lblOpen_Date");
  $(viewOpenDate).css("width", "100px");
  var viewRemark = $NC.getView("#lblRemark1");
  $(viewRemark).css("width", "100px");
  var viewRemark = $NC.getView("#lblDelivery_Yn");
  $(viewRemark).css("width", "100px");
}


/**
 * 검색조건의 사업부 검색 팝업 클릭
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
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}
