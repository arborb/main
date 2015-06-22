/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null,
  });

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "ITEM_STATE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboItem_State",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F"
  });

  // 재고팝업에서 상태값 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "ITEM_STATE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQItem_State",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true,
    onComplete: function() {
      $NC.setValue("#cboQItem_State", "X");
    }
  });
  
  
  // 조회조건 - 반품비용부담 구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "SHIP_PRICE_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboRefund_Ship_Price_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.REFUND_SHIP_PRICE_CD = $NC.getValue("#cboRefund_Ship_Price_Cd");
      } else {
        $NC.setValue("#cboRefund_Ship_Price_Cd", $NC.G_VAR.masterData.REFUND_SHIP_PRICE_CD);
      }
    }
  });

  // $NC.setInitCombo("/WC/getDataSet.do", {
  // P_QUERY_ID: "WC.POP_CMCODE",
  // P_QUERY_PARAMS: $NC.getParams({
  // P_CODE_GRP: "IN_TRANS_DIV",
  // P_CODE_CD: "%",
  // P_SUB_CD1: "",
  // P_SUB_CD2: "",
  // P_SUB_CD3: ""
  // })
  // }, {
  // selector: "#cboTrans_Div",
  // codeField: "CODE_CD",
  // nameField: "CODE_NM",
  // fullNameField: "CODE_CD_F",
  // onComplete: function() {
  // if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
  // $NC.G_VAR.masterData.CAR_NO = $NC.getValue("#cboTrans_Div");
  // } else {
  // $NC.setValue("#cboTrans_Div", $NC.G_VAR.masterData.CAR_NO);
  // }
  // }
  // });

  $("#btnVendor_Cd").click(showVendorPopup);
  $("#btnBrand_Cd").click(showOwnBranPopup);
  $("#btnDelivery_Zip_Cd").click(showPostPopup);

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel); // 닫기버튼
  $("#btnEntryNew").click(_New); // 그리드 행 추가 버튼
  $("#btnEntryDelete").click(_Delete); // 그리드 행 삭제버튼
  $("#btnEntrySave").click(_Save); // 저장 버튼
  $("#btnStateSwap").click(StateSwap); // 상품상태 일괄변경 버튼

  $("#btnStockPopup").click(showStockSelOverlay);// 재고에서 선택버튼 클릭
  $("#btnStockSearch").click(_Inquiry); // 재고팝업에서 조회버튼클릭
  $("#btnStockSel").click(addItemToGrid); // 재고팝업에서 확인버튼클릭
  $("#btnStockSelClose").click(function() { // 재고에서 선택 창 닫기
    $("#divStockSelInfoView").hide();
  });

  $("#btnQBrand_Cd").click(showBuBrandStockPopup); // 브랜드검색 버튼 클릭
  $("#btnQItem_Cd").click(showItemStockPopup); // 상품검색 버튼 클릭

  $NC.setInitDatePicker("#dtpOrder_Date"); // 예정일자

  // 그리드 초기화
  grdDetailInitialize();
  grdStockSelMasterInitialize();

}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {


  $NC.setEnable("#edtQBrand_Cd", false);
  // 출고예정등록 전표생성 가능여부 N -> 출고예정등록시 신규, 수정 불가능
  if ($NC.G_VAR.userData.P_POLICY_RO110 !== "Y") {
    $NC.setEnable("#btnEntryNew", false);
    $NC.setEnable("#btnEntryDelete", false);
    $NC.setEnable("#btnEntrySave", false);
  }

  $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
  $NC.setValue("#edtCenter_Cd", $NC.G_VAR.userData.P_CENTER_CD);
  $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);
  $NC.setValue("#edtBrand_Cd", $NC.G_VAR.userData.P_BRAND_CD);
  $NC.setValue("#edtBrand_Nm", $NC.G_VAR.userData.P_BRABD_NM);
  $NC.setValue("#edtCust_Cd", $NC.G_VAR.userData.P_CUST_CD);
  $NC.setValue("#dtpOrder_Date", $NC.G_VAR.userData.P_ORDER_DATE);

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {

    var ORDER_DATE = $NC.getValue("#dtpOrder_Date");
    var INOUT_CD = $NC.getValue("#cboInout_Cd");
    
    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      ORDER_DATE: ORDER_DATE,
      ORDER_NO: "",
      INOUT_CD: INOUT_CD,
      OUTBOUND_STATE: "10",
      CUST_CD: $NC.G_VAR.userData.P_CUST_CD,
      VENDOR_CD: "",
      BU_DATE: "",
      BU_NO: "",
      CAR_NO: "",
      REMARK1: "",
      SHIP_TYPE:"1",
      CARRIER_DIV:"",
      REFUND_PRICE_TYPE:"",
      CARRIER_PRICE:"",
      ENTRY_CARRIER_CD:"",
      ENTRY_WB_NO:"",
      REFUND_SHIP_PRICE_CD:"",
      CRUD: "C"
    };

    // 온라인 데이터 세팅
    $NC.G_VAR.subData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      ORDER_DATE: ORDER_DATE,
      DELIVERY_NM: "",
      DELIVERY_TEL1: "",
      DELIVERY_HP1: "",
      DELIVERY_ZIP_CD: "",
      DELIVERY_ADDR_BASIC1: "",
      DELIVERY_ADDR_DETAIL1: "",
      DELIVERY_ADDR_BASIC: "",
      DELIVERY_ADDR_DETAIL: "",
      DELIVERY_TEL: "",
      DELIVERY_HP: "",
    
      CRUD: "C"
    };
    
    $NC.setFocus("#edtVendor_Cd");

  } else {

    // 예정 -> 등록, 등록 수정
    var CRUD = "R";
    // 마스터 데이터 세팅
    var masterDS = $NC.G_VAR.userData.P_MASTER_DS;

    $NC.setValue("#dtpOrder_Date", masterDS.ORDER_DATE);
    $NC.setValue("#edtOrder_No", masterDS.ORDER_NO);
    $NC.setValue("#edtVendor_Cd", masterDS.VENDOR_CD);
    $NC.setValue("#edtVendor_Nm", masterDS.VENDOR_NM);
    $NC.setValue("#cboInout_Cd", masterDS.INOUT_CD);
    $NC.setValue("#cboTrans_Div", masterDS.CAR_NO);
    $NC.setValue("#edtRemark1", masterDS.REMARK1);
    $NC.setValue("#edtBu_Date", masterDS.BU_DATE);
    $NC.setValue("#edtBu_No", masterDS.BU_NO);

    
    $NC.setValue("#edtDelivery_Nm", masterDS.SHIPPER_NM);
    $NC.setValue("#edtDelivery_Tel", masterDS.SHIPPER_TEL);
    $NC.setValue("#edtDelivery_Tel1", masterDS.SHIPPER_TEL);
    $NC.setValue("#edtDelivery_Hp", masterDS.SHIPPER_HP);
    $NC.setValue("#edtDelivery_Hp1", masterDS.SHIPPER_HP);
    $NC.setValue("#edtDelivery_Addr_Basic01", masterDS.SHIPPER_ADDR_BASIC1);
    $NC.setValue("#edtDelivery_Addr_Detail01", masterDS.SHIPPER_ADDR_DETAIL1);
    $NC.setValue("#edtDelivery_Addr_Basic", masterDS.SHIPPER_ADDR_BASIC1);
    $NC.setValue("#edtDelivery_Addr_Detail",masterDS.SHIPPER_ADDR_DETAIL1);
    $NC.setValue("#edtDelivery_Zip_Cd", masterDS.SHIPPER_ZIP_CD);
    $NC.setValue("#edtCarrier_Price", masterDS.SHIP_PRICE);
    $NC.setValue("#cboCarrier_Div", masterDS.SHIP_PRICE_TYPE);

    $NC.getValue("#cboRefund_Price_Type", masterDS.REFUND_SHIP_PRICE_CD);
    $NC.setValue("#cboCarrier_Cd", masterDS.ENTRY_CARRIER_CD);
    $NC.setValue("#edtWb_No", masterDS.ENTRY_WB_NO);
    
    $NC.G_VAR.masterData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      ORDER_DATE: masterDS.ORDER_DATE,
      ORDER_NO: masterDS.ORDER_NO,
      INOUT_CD: masterDS.INOUT_CD,
      OUTBOUND_STATE: "10",
      CUST_CD: masterDS.CUST_CD,
      VENDOR_CD: masterDS.VENDOR_CD,
      BU_DATE: masterDS.BU_DATE,
      BU_NO: masterDS.BU_NO,
      CAR_NO: masterDS.CAR_NO,
      REMARK1: masterDS.REMARK1,
      SHIP_TYPE: masterDS.SHIP_TYPE,
      PLANED_DATETIME: masterDS.PLANED_DATETIME,
      CARRIER_DIV: masterDS.SHIP_PRICE_TYPE,
      REFUND_PRICE_TYPE: masterDS.REFUND_PRICE_TYPE,
      CARRIER_PRICE: masterDS.SHIP_PRICE,
      ENTRY_CARRIER_CD: masterDS.ENTRY_CARRIER_CD,
      ENTRY_WB_NO: masterDS.ENTRY_WB_NO,
      REFUND_SHIP_PRICE_CD:masterDS.REFUND_SHIP_PRICE_CD,
      CRUD: CRUD
    };


    
    if ( $NC.isNull(masterDS.SHIPPER_NM) ){
      masterDS.SHIPPER_NM = ' ';
    }
    if ( $NC.isNull(masterDS.SHIPPER_TEL) ){
      masterDS.SHIPPER_TEL = ' ';
    }    
    if ( $NC.isNull(masterDS.SHIPPER_HP) ){
      masterDS.SHIPPER_HP = ' ';
    }    
    if ( $NC.isNull(masterDS.SHIPPER_TEL1) ){
      masterDS.SHIPPER_TEL1 = ' ';
    }    
    if ( $NC.isNull(masterDS.SHIPPER_HP1) ){
      masterDS.SHIPPER_HP1 = ' ';
    }    
    if ( $NC.isNull(masterDS.SHIPPER_ADDR_BASIC1) ){
      masterDS.SHIPPER_ADDR_BASIC1 = ' ';
    }    

    if ( $NC.isNull(masterDS.SHIPPER_ADDR_DETAIL1) ){
      masterDS.SHIPPER_ADDR_DETAIL1 = ' ';
    }    

    if ( $NC.isNull(masterDS.SHIPPER_ADDR_BASIC) ){
      masterDS.SHIPPER_ADDR_BASIC = ' ';
    }    

    if ( $NC.isNull(masterDS.SHIPPER_ADDR_DETAIL) ){
      masterDS.SHIPPER_ADDR_DETAIL = ' ';
    }    

    
    var ORDER_DATE = masterDS.OUTBOUND_DATE;
    var ORDER_NO = masterDS.OUTBOUND_NO;
    // 온라인 데이터 세팅
    $NC.G_VAR.subData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      ORDER_DATE: ORDER_DATE,
      ORDER_NO: ORDER_NO,
      DELIVERY_NM: masterDS.SHIPPER_NM,
      DELIVERY_TEL1: masterDS.SHIPPER_TEL,
      DELIVERY_HP1: masterDS.SHIPPER_HP,
      DELIVERY_TEL: masterDS.SHIPPER_TEL1,
      DELIVERY_HP: masterDS.SHIPPER_HP1,
      DELIVERY_ZIP_CD: masterDS.SHIPPER_ZIP_CD,
      DELIVERY_ADDR_BASIC1: masterDS.SHIPPER_ADDR_BASIC1,
      DELIVERY_ADDR_DETAIL1: masterDS.SHIPPER_ADDR_DETAIL1,
      DELIVERY_ADDR_BASIC: masterDS.SHIPPER_ADDR_BASIC,
      DELIVERY_ADDR_DETAIL: masterDS.SHIPPER_ADDR_DETAIL,
      REMARK1: "",
      CRUD: CRUD
    };
    // 디테일 데이터 세팅
    var detailDS = $NC.G_VAR.userData.P_DETAIL_DS;
    var rowData;
    G_GRDDETAIL.data.beginUpdate();
    try {
      for ( var row in detailDS) {
        rowData = detailDS[row];
        var ORDER_QTY = Number(rowData.ORDER_QTY);
        if (ORDER_QTY > 0) {
          var newRowData = {
            CENTER_CD: rowData.CENTER_CD,
            BU_CD: rowData.BU_CD,
            ORDER_DATE: rowData.ORDER_DATE,
            ORDER_NO: rowData.ORDER_NO,
            LINE_NO: rowData.LINE_NO,
            OUTBOUND_STATE: "10",
            BRAND_CD: rowData.BRAND_CD,
            BRAND_NM: rowData.BRAND_NM,
            ITEM_CD: rowData.ITEM_CD,
            ITEM_NM: rowData.ITEM_NM,
            ITEM_STATE: rowData.ITEM_STATE,
            ITEM_STATE_F: rowData.ITEM_STATE_F,
            ITEM_LOT: rowData.ITEM_LOT,
            VALID_DATE: rowData.VALID_DATE,
            BATCH_NO: rowData.BATCH_NO,
            QTY_IN_BOX: rowData.QTY_IN_BOX,
            ORDER_QTY: rowData.ORDER_QTY,
            ORDER_EA: rowData.ORDER_EA,
            ORDER_BOX: rowData.ORDER_BOX,
            ORDER_WEIGHT: rowData.ORDER_WEIGHT,
            BOX_WEIGHT: rowData.BOX_WEIGHT,
            SUPPLY_PRICE: rowData.SUPPLY_PRICE,
            DC_PRICE: rowData.DC_PRICE,
            APPLY_PRICE: rowData.APPLY_PRICE,
            SUPPLY_AMT: rowData.SUPPLY_AMT,
            VAT_AMT: rowData.VAT_AMT,
            DC_AMT: rowData.DC_AMT,
            TOTAL_AMT: rowData.TOTAL_AMT,
            BU_LINE_NO: rowData.BU_LINE_NO,
            BU_KEY: rowData.BU_KEY,
            RETURN_DIV: rowData.RETURN_DIV,
            RETURN_DIV_F: rowData.RETURN_DIV_F,
            RETURN_COMMENT: rowData.RETURN_COMMENT,
            REMARK1: rowData.REMARK1,
            VAT_YN: rowData.VAT_YN,
            CHK: "Y",
            id: $NC.getGridNewRowId(),
            CRUD: CRUD
          };
          G_GRDDETAIL.data.addItem(newRowData);
        }
      }
    } finally {
      G_GRDDETAIL.data.endUpdate();
    }
    for (; row < G_GRDDETAIL.data.getLength(); row++) {
      gridDetailCheckPSTOCK(row, true);
    }

    // 수정일 경우 입력불가 항목 비활성화 처리
    $NC.setEnable("#cboInout_Cd", false);
    $NC.setEnable("#edtDelivery_Cd", false);
    $NC.setEnable("#btnDelivery_Cd", false);
    $NC.setEnable("#dtpOrder_Date", false);

    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }
  
  
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "WMP_CARRIER_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboCarrier_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.ENTRY_CARRIER_CD = $NC.getValue("#cboCarrier_Cd");
      } else {
        $NC.setValue("#cboCarrier_Cd", $NC.G_VAR.masterData.ENTRY_CARRIER_CD);
      }
    }
  });
  
  
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "TRANS_FEE_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboCarrier_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.CARRIER_DIV = $NC.getValue("#cboCarrier_Div");
      } else {
        $NC.setValue("#cboCarrier_Div", $NC.G_VAR.masterData.CARRIER_DIV);
      }
    }
  });

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "D30",
      P_SUB_CD1: "D3",
      P_SUB_CD2: "%"
    })
  }, {
    selector: "#cboInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? "F" : null,
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
      } else {
        $NC.setValue("#cboInout_Cd", $NC.G_VAR.masterData.INOUT_CD);
      }
    }
  });

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "IN_TRANS_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: "",
      P_SUB_CD3: ""
    })
  }, {
    selector: "#cboTrans_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.SHIP_TYPE = $NC.getValue("#cboTrans_Div");
      } else {
        $NC.setValue("#cboTrans_Div", $NC.G_VAR.masterData.SHIP_TYPE);
      }
    }
  });

 

  // 검색구분에 초기값 설정
  $NC.setEnable("#rgbQView_Div2", $NC.G_VAR.userData.P_POLICY_RO250 == "2");
  $NC.setValue("#rgbQView_Div1", true);
  

}

/**
 * 화면 리사이즈 Offset 계산
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 310;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.stockViewHeight = $("#divDspStock").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_LAYOUT.border1 - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, $NC.G_OFFSET.masterViewHeight);
  $NC.resizeContainer("#divDetailView", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight
      - $NC.G_LAYOUT.margin1);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - $NC.G_LAYOUT.header
      - $NC.G_OFFSET.stockViewHeight - $NC.G_LAYOUT.margin1);
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

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();
  // 브랜드 Key 입력
  switch (id) {
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
        P_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getBuBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBuBrandStockPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showBuBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBuBrandStockPopup, onBuBrandStockPopup);
    }
    return;
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
        P_ITEM_CD: val,
        P_BRAND_CD: BRAND_CD,
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
      onItemStockPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemStockPopup, onItemStockPopup);
    }
    return;
  case "ITEM_STATE":
    $NC.clearGridData(G_GRDSTOCKSELMASTER);
    return;
  case "VIEW_DIV1":
  case "VIEW_DIV2":
    G_GRDSTOCKSELMASTER.view.setColumns(grdStockSelMasterOnGetColumns());
    $NC.clearGridData(G_GRDSTOCKSELMASTER);
    return;
  }
  
  // 온라인 데이터의 값 변경
  if (view.is(".sub-table-data")) {
    id = view.prop("id").substr(3).toUpperCase();
    subDataOnChange(e, {
      col: id,
      val: val,
      view: view
    });
    return;
  }
  
  var id = view.prop("id").substr(3).toUpperCase();
  masterDataOnChange(e, {
    col: id,
    val: val,
    view: view
  });
}

/**
 * 조회
 */
function _Inquiry() {

  // 재고조회
  var CENTER_CD = $NC.G_VAR.userData.P_CENTER_CD;
  var BU_CD = $NC.G_VAR.userData.P_BU_CD;
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var ITEM_STATE = $NC.getValue("#cboQItem_State", true);
  var POLICY_VAL = "";
  if ($NC.getValue("#rgbQView_Div1") === "1") {
    POLICY_VAL = "1";
  } else {
    POLICY_VAL = "2";
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSTOCKSELMASTER);

  G_GRDSTOCKSELMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: ITEM_CD,
    P_ITEM_STATE: ITEM_STATE,
    P_POLICY_VAL: POLICY_VAL
  });

  // 데이터 조회
  $NC.serviceCall("/RO01010E/getDataSet.do", $NC.getGridParams(G_GRDSTOCKSELMASTER), onGetStockSelMaster);
}

/**
 * 신규
 */
function _New() {

  var BRAND_CD = $NC.getValue("edtBrand_Cd");
  if ($NC.isNull(BRAND_CD)) {
    alert("먼저 위탁사 코드를 입력하십시오.");
    $NC.setFocus("#edtBrand_Cd");
    return;
  }
  // 현재 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }

  var rowCount = G_GRDDETAIL.data.getLength();
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDDETAIL.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      $NC.setFocusGrid(G_GRDDETAIL, rowCount - 1, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
      return;
    }
  }
  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
    BU_CD: $NC.G_VAR.masterData.BU_CD,
    ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
    ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
    LINE_NO: "",
    OUTBOUND_STATE: $NC.G_VAR.masterData.OUTBOUND_STATE,
    BRAND_CD: "",
    BRAND_NM: "",
    ITEM_CD: "",
    ITEM_NM: "",
    ITEM_STATE: $NC.G_VAR.userData.P_POLICY_RO240,
    ITEM_STATE_F: $NC.getGridComboName(G_GRDDETAIL, {
      colFullNameField: "ITEM_STATE_F",
      searchVal: $NC.G_VAR.userData.P_POLICY_RO240,
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    }),
    ITEM_LOT: "00",
    VALID_DATE: "",
    BATCH_NO: "",
    QTY_IN_BOX: 1,
    ORDER_QTY: 0,
    ORDER_WEIGHT: 0,
    ENTRY_QTY: 0,
    BOX_WEIGHT: 0,
    SUPPLY_PRICE: 0,
    DC_PRICE: 0,
    APPLY_PRICE: 0,
    SUPPLY_AMT: 0,
    VAT_AMT: 0,
    DC_AMT: 0,
    TOTAL_AMT: 0,
    BU_LINE_NO: "",
    BU_KEY: "",
    RETURN_DIV: "99",
    RETURN_DIV_F: $NC.getGridComboName(G_GRDDETAIL, {
      colFullNameField: "RETURN_DIV_F",
      searchVal: "99",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    }),
    RETURN_COMMENT: "",
    REMARK1: "",
    VAT_YN: "",
    CHK: "Y",
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };

  G_GRDDETAIL.data.addItem(newRowData);
  $NC.setGridSelectRow(G_GRDDETAIL, rowCount);
  if (rowCount === 0) {
    $NC.setGridDisplayRows("#grdDetail", rowCount + 1, G_GRDDETAIL.data.getLength());
  }

  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;

  // 신규 데이터 생성 후 이벤트 호출
  grdDetailOnNewRecord({
    row: rowCount,
    rowData: newRowData
  });
}

/**
 * 저장
 */
function _Save() {

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
    alert("물류센터가 지정되어 있지 않습니다. 다시 작업하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
    alert("사업부가 지정되어 있지 않습니다. 다시 작업하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.ORDER_DATE)) {
    alert("먼저 예정일자를 입력하십시오.");
    $NC.setFocus("#dtpOrder_Date");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
    alert("먼저 반출구분을 선택하십시오.");
    $NC.setFocus("#cboInout_Cd");
    return;
  }

  if ($NC.isNull($NC.G_VAR.subData.DELIVERY_NM)) {
    alert("배송처가 지정되어 있지 않습니다.");
    return;
  }
  if ($NC.isNull($NC.G_VAR.subData.DELIVERY_TEL1)) {
    alert("배송처TEL를 입력하십시요.");
    return;
  }
  if ($NC.isNull($NC.G_VAR.subData.DELIVERY_ZIP_CD)) {
    alert("우편번호를 입력하세요.");
    return;
  }
  if ($NC.isNull($NC.G_VAR.subData.DELIVERY_ADDR_BASIC)) {
    alert("기본주소를 입력하세요.");
    return;
  }
  if ($NC.isNull($NC.G_VAR.subData.DELIVERY_ADDR_DETAIL)) {
    alert("상세주소를 입력하세요.");
    return;
  }
  
  if ($NC.isNull($NC.G_VAR.masterData.SHIP_TYPE)) {
    alert("반출배송유형를 선택하세요.");
    return;
  }
  
  if ($NC.G_VAR.masterData.SHIP_TYPE =="1"){
   

    if ($NC.isNull($NC.G_VAR.masterData.CARRIER_DIV)) {
      alert("운송비구분 선택하세요.");
      return;
    }
    
    if ($NC.isNull($NC.G_VAR.masterData.ENTRY_CARRIER_CD)) {
      alert("운송사를 선택하세요.");
      return;
    }
    
  }
  
  // 현재 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }

  var d_DS = [ ];
  var cu_DS = [ ];
  var rows = G_GRDDETAIL.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
        P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_OUTBOUND_STATE: rowData.OUTBOUND_STATE,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_VALID_DATE: rowData.VALID_DATE,
        P_BATCH_NO: rowData.BATCH_NO,
        P_ORDER_QTY: rowData.ORDER_QTY,
        P_ENTRY_QTY: rowData.ENTRY_QTY,
        P_SUPPLY_PRICE: rowData.SUPPLY_PRICE,
        P_DC_PRICE: rowData.DC_PRICE,
        P_APPLY_PRICE: rowData.APPLY_PRICE,
        P_SUPPLY_AMT: rowData.SUPPLY_AMT,
        P_VAT_YN: rowData.VAT_YN,
        P_VAT_AMT: rowData.VAT_AMT,
        P_DC_AMT: rowData.DC_AMT,
        P_TOTAL_AMT: rowData.TOTAL_AMT,
        P_BU_LINE_NO: rowData.BU_LINE_NO,
        P_BU_KEY: rowData.BU_KEY,
        P_RETURN_DIV: rowData.RETURN_DIV,
        P_RETURN_COMMENT: rowData.RETURN_COMMENT,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      if (rowData.CRUD === "D") {
        d_DS.push(saveData);
      } else {
        cu_DS.push(saveData);
      }
    }
  }
  var detailDS = d_DS.concat(cu_DS);

  if ( $NC.isNull($NC.G_VAR.subData.DELIVERY_NM) ){
    $NC.G_VAR.subData.DELIVERY_NM = ' ';
  }    
  if ( $NC.isNull($NC.G_VAR.subData.DELIVERY_TEL1) ){
    $NC.G_VAR.subData.DELIVERY_TEL1 = ' ';
  }    

  if ( $NC.isNull($NC.G_VAR.subData.DELIVERY_HP1) ){
    $NC.G_VAR.subData.DELIVERY_HP1 = ' ';
  }    

  if ( $NC.isNull($NC.G_VAR.subData.DELIVERY_ADDR_BASIC) ){
    $NC.G_VAR.subData.DELIVERY_ADDR_BASIC = ' ';
  }    

  if ( $NC.isNull($NC.G_VAR.subData.DELIVERY_ADDR_DETAIL) ){
    $NC.G_VAR.subData.DELIVERY_ADDR_DETAIL = ' ';
  }    
  


  $NC.serviceCall("/RO01010E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
      P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
      P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
      P_OUTBOUND_STATE: $NC.G_VAR.masterData.OUTBOUND_STATE,
      P_CUST_CD: $NC.G_VAR.masterData.CUST_CD,
      P_VENDOR_CD: $NC.G_VAR.masterData.VENDOR_CD,
      P_BU_DATE: $NC.G_VAR.masterData.BU_DATE,
      P_BU_NO: $NC.G_VAR.masterData.BU_NO,
      P_CAR_NO: $NC.G_VAR.masterData.CAR_NO,
      P_REMARK1: $NC.G_VAR.masterData.REMARK1,
      P_SHIP_TYPE: $NC.G_VAR.masterData.SHIP_TYPE,
      P_SHIP_PRICE_TYPE: $NC.G_VAR.masterData.CARRIER_DIV,
      P_SHIP_PRICE : $NC.G_VAR.masterData.CARRIER_PRICE,
      P_ENTRY_CARRIER_CD: $NC.G_VAR.masterData.ENTRY_CARRIER_CD,
      P_ENTRY_WB_NO: $NC.G_VAR.masterData.ENTRY_WB_NO,

      P_REFUND_SHIP_PRICE_CD: $NC.G_VAR.masterData.REFUND_SHIP_PRICE_CD,
      P_CRUD: $NC.G_VAR.masterData.CRUD
    }), 
    P_DS_SUB: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.subData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.subData.BU_CD,
      P_ORDER_DATE: $NC.G_VAR.subData.ORDER_DATE,
      P_ORDER_NO: $NC.G_VAR.subData.ORDER_NO,
      P_SHIPPER_NM: $NC.G_VAR.subData.DELIVERY_NM,
      P_SHIPPER_TEL: $NC.G_VAR.subData.DELIVERY_TEL1,
      P_SHIPPER_HP: $NC.G_VAR.subData.DELIVERY_HP1,
      P_SHIPPER_ZIP_CD: $NC.G_VAR.subData.DELIVERY_ZIP_CD,
      P_SHIPPER_ADDR_BASIC: $NC.G_VAR.subData.DELIVERY_ADDR_BASIC,
      P_SHIPPER_ADDR_DETAIL: $NC.G_VAR.subData.DELIVERY_ADDR_DETAIL,
      P_REMARK1: "",
      P_CRUD: $NC.G_VAR.subData.CRUD
    }),
    P_DS_DETAIL: $NC.toJson(detailDS),
    P_PROCESS_CD: $NC.G_VAR.userData.P_PROCESS_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
    
  }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

  // 신규 데이터일 경우 그냥 삭제
  if (rowData.CRUD === "C" || rowData.CRUD === "N") {
    G_GRDDETAIL.data.deleteItem(rowData.id);
  } else {
    rowData.CRUD = "D";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
    G_GRDDETAIL.data.refresh();
  }
  // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
  if (G_GRDDETAIL.lastRow > 1) {
    $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.lastRow - 1);
  } else {
    G_GRDDETAIL.lastRow = null;
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

  // 마지막 선택 Row 수정 상태 복원
  G_GRDDETAIL.lastRowModified = false;
}

/**
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

  switch (args.col) {
  case "INOUT_CD":
    $NC.G_VAR.masterData.INOUT_CD = args.val;
    break;
  case "ORDER_DATE":
    $NC.setValueDatePicker(args.view, args.val, "반출일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.ORDER_DATE = $NC.getValue("#dtpOutOrder_Date");

    $NC.G_VAR.subData.ORDER_DATE = $NC.G_VAR.masterData.ORDER_DATE;
    if ($NC.G_VAR.subData.CRUD === "R") {
      $NC.G_VAR.subData.CRUD = "U";
    }
    break;
   case "BU_DATE":
    $NC.G_VAR.masterData.BU_DATE = args.val;
    break;
  case "VENDOR_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      var CUST_CD = $NC.G_VAR.userData.P_CUST_CD;
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_VENDOR_CD: args.val,
        P_VIEW_DIV: "1"
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
    
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD =  $NC.getValue("#edtBu_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: args.val,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      O_RESULT_DATA = $NP.getOwnBrand_roInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBran_roPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup, onOwnBrandPopup);
    }
    return;
  case "DELIVERY_ZIP_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      P_QUERY_PARAMS = {
        P_ADDR_NM: args.val
      };
      O_RESULT_DATA = $NP.getPostInfo({
        queryParams: P_QUERY_PARAMS,
        queryCanAll: true,
        errorMessage: "등록되어 있지 않은 온라인몰입니다."
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onPostPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showPostPopup({
        title: "우편번호 검색",
        columnTitle: ["우편번호", "주소"],
        queryParams: P_QUERY_PARAMS,
        queryCanAll: true,
        queryData: O_RESULT_DATA
      }, onPostPopup, onPostPopup);
    }
    return;
  case "BU_NO":
    $NC.G_VAR.masterData.BU_NO = args.val;
    break;
  case "CARRIER_DIV":
    $NC.G_VAR.masterData.CARRIER_DIV = args.val;
    break;
  case "CARRIER_CD":
    $NC.G_VAR.masterData.ENTRY_CARRIER_CD = args.val;
    break;
  case "CARRIER_PRICE":
    $NC.G_VAR.masterData.CARRIER_PRICE = args.val;
    break;
  case "TRANS_DIV":
    if(args.val !== '1') {
      $("#lbledtCarrier_Cd").hide();
      $("#cboCarrier_Cd").hide();
      $("#lblWb_No").hide();
      $("#edtWb_No").hide();

      $NC.setValue("#cboCarrier_Cd");
      $NC.setValue("#edtWb_No");
    } else {
      $("#lbledtCarrier_Cd").show();
      $("#cboCarrier_Cd").show();
      $("#lblWb_No").show();
      $("#edtWb_No").show(); 
    }
    $NC.G_VAR.masterData.SHIP_TYPE = args.val;
    break;  
  case "WB_NO":
    $NC.G_VAR.masterData.ENTRY_WB_NO = args.val;
    $NC.G_VAR.subData.ENTRY_WB_NO = args.val;
    break;
  case "DELIVERY_NM":
    $NC.G_VAR.subData.DELIVERY_NM = args.val;
    break;
  case "DELIVERY_TEL1":
    $NC.G_VAR.subData.DELIVERY_TEL1 = args.val;
    break;
  case "DELIVERY_HP1":
    $NC.G_VAR.subData.DELIVERY_HP1 = args.val;
    break;
  case "DELIVERY_ADDR_BASIC":
    $NC.G_VAR.subData.DELIBERY_ADDR_BASIC1 = args.val;
    break;
  case "DELIVERY_ADDR_DETAIL":
    $NC.G_VAR.subData.DELIVERY_ADDR_DETAIL1 = args.val;
    break;
  case "REMARK1":
    $NC.G_VAR.masterData.REMARK1 = args.val;
    break;
  case "REFUND_PRICE_TYPE":
    $NC.G_VAR.masterData.REFUND_PRICE_TYPE = args.val;
    break;
  case "REFUND_SHIP_PRICE_CD":
    $NC.G_VAR.masterData.REFUND_SHIP_PRICE_CD = args.val;
    break;
  }

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }

}

function grdDetailOnGetColumns() {

  if ($NC.isNull($NC.G_VAR.userData.P_POLICY_RO250)) {
    $NC.G_VAR.userData.P_POLICY_RO250 = "1";
  }
  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 50,
    cssClass: "align-right"
  });
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {
    $NC.setGridColumn(columns, {
      id: "ITEM_CD",
      field: "ITEM_CD",
      name: "상품코드",
      minWidth: 100,
      editor: Slick.Editors.Popup,
      editorOptions: {
        onPopup: grdDetailOnPopup,
        isKeyField: true
      }
    });
  } else {
    $NC.setGridColumn(columns, {
      id: "ITEM_CD",
      field: "ITEM_CD",
      name: "상품코드",
      minWidth: 100
    });
  }
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
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 80,
    cssClass: "align-center",
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "ITEM_STATE",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "ITEM_STATE",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  // 정책에 따른 컬럼 표시
  if ($NC.G_VAR.userData.P_POLICY_RO250 == "2") {
    $NC.setGridColumn(columns, {
      id: "VALID_DATE",
      field: "VALID_DATE",
      name: "유통기한",
      minWidth: 100,
      editor: Slick.Editors.Date
    });
    $NC.setGridColumn(columns, {
      id: "BATCH_NO",
      field: "BATCH_NO",
      name: "제조배치번호",
      minWidth: 100,
      editor: Slick.Editors.Text
    });
  }
  $NC.setGridColumn(columns, {
    id: "RETURN_DIV_F",
    field: "RETURN_DIV_F",
    name: "반출사유",
    minWidth: 160,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "RO.RETURN_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "RETURN_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "RETURN_COMMENT",
    field: "RETURN_COMMENT",
    name: "반출내역",
    minWidth: 100,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "SUPPLY_PRICE",
    field: "SUPPLY_PRICE",
    name: "공급단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_PRICE",
    field: "DC_PRICE",
    name: "할인단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "APPLY_PRICE",
    field: "APPLY_PRICE",
    name: "적용단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUPPLY_AMT",
    field: "SUPPLY_AMT",
    name: "공급금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VAT_AMT",
    field: "VAT_AMT",
    name: "부가세액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_AMT",
    field: "DC_AMT",
    name: "할인금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3,
    specialRow: {
      compareKey: "CHK",
      compareVal: "N",
      compareOperator: "==",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: null,
    sortCol: "LINE_NO",
    gridOptions: options,
    canExportExcel: false,
    onFilter: grdDetailOnFilter
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

/**
 * grdDetail 데이터 필터링 이벤트
 */
function grdDetailOnFilter(item) {

  return item.CRUD !== "D";
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdDetailOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
}

/**
 * 그리드에 출고예정등록 전표 생성 가능여부가 N일경우 편집 불가로 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdDetailOnBeforeEditCell(e, args) {

  // 출고예정등록 전표생성 가능여부 N -> 출고예정등록시 신규, 수정 불가능
  if ($NC.G_VAR.userData.P_POLICY_RO110 !== "Y") {
    return false;
  }

  return true;
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.ITEM_CD)) {
      P_QUERY_PARAMS = {
        P_BU_CD: rowData.BU_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_VIEW_DIV: "1",
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
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemPopup, onItemPopup);
    }
    return;
  case "ITEM_STATE_F":
    gridDetailCheckPSTOCK(args.row, null);
    break;
  case "ITEM_LOT":
    gridDetailCheckPSTOCK(args.row, null);
    break;
  case "ORDER_QTY":
    rowData = grdDetailOnCalc(rowData);
    gridDetailCheckPSTOCK(args.row, true);
    break;
  case "VALID_DATE":
    if (!$NC.isNull(rowData.VALID_DATE)) {
      if (!$NC.isDate(rowData.VALID_DATE)) {
        alert("유통기한을 정확히 입력하십시오.");
        rowData.VALID_DATE = "";
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: args.row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("VALID_DATE"),
          editMode: true
        });
        return false;
      } else {
        rowData.VALID_DATE = $NC.getDate(rowData.VALID_DATE);
      }
    }
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
}

/**
 * 저장시 그리드 입력 체크
 */
function grdDetailOnBeforePost(row) {

  if (!G_GRDDETAIL.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAIL.data.getItem(row);
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
      G_GRDDETAIL.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL, row - 1);
        setTimeout(function() {
          $NC.setGridDisplayRows("#grdDetail", row, G_GRDDETAIL.data.getLength());
        }, 300);
      }
      return true;
    }
  }
  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.ITEM_CD) || $NC.isNull(rowData.ITEM_NM)) {
      alert("상품코드를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ITEM_CD"),
        editMode: true
      });
      return false;
    }

    if ($NC.isNull(rowData.ITEM_STATE)) {
      alert("상태를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ITEM_STATE"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.ITEM_LOT)) {
      alert("LOT번호를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ITEM_LOT"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.ORDER_QTY)) {
      alert("예정수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ORDER_QTY"),
        editMode: true
      });
      return false;
    } else {
      var ORDER_QTY = Number(rowData.ORDER_QTY);
      if (ORDER_QTY < 1) {
        alert("예정수량은 1보다 작을 수 없습니다.");

        rowData = grdDetailOnCalc(rowData, rowData.ORDER_QTY);
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("ORDER_QTY"),
          editMode: true
        });
        return false;
      }
    }

    if ($NC.isNull(rowData.RETURN_DIV)) {
      alert("반출사유를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("RETURN_DIV_F"),
        editMode: true
      });
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  }
  return true;
}

/**
 * 그리드 행 선택 변경 했을 경우
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

    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 현재고 표시
  gridDetailCheckPSTOCK(row, false);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

/**
 * 그리드의 상품 팝업 처리
 */
function grdDetailOnPopup(e, args) {

  var rowData = args.item;

  switch (args.column.field) {
  case "ITEM_CD":
    $NP.showItemPopupWithVendorCd({
      P_BU_CD: rowData.BU_CD,
      P_BRAND_CD: $NC.getValue("#edtBrand_Cd"),
      P_ITEM_CD: "%",
      P_VIEW_DIV: "1",
      P_DEPART_CD: "%",
      P_LINE_CD: "%",
      P_CLASS_CD: "%",
      P_VENDOR_CD:""
    }, onItemPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
    });
    /*
    $NP.showItemPopup({
      P_BU_CD: rowData.BU_CD,
      P_ITEM_CD: "%",
      P_VIEW_DIV: "1",
      P_DEPART_CD: "%",
      P_LINE_CD: "%",
      P_CLASS_CD: "%"
    }, onItemPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
    });
    */
    break;
  }
}

function showVendorPopup() {

  var CUST_CD = $NC.getValue("#edtCust_Cd");

  $NP.showVendor_roPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_VENDOR_CD: "%",
      P_VIEW_DIV: "1"
    }
  }, onVendorPopup, function() {
    $NC.setFocus("#edtVendor_Cd", true);
  });
}

function onVendorPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.masterData.VENDOR_CD = resultInfo.VENDOR_CD;
    $NC.G_VAR.masterData.VENDOR_NM = resultInfo.VENDOR_NM;
    $NC.G_VAR.subData.DELIVERY_CD = resultInfo.VENDOR_CD;
    $NC.G_VAR.subData.DELIVERY_NM = resultInfo.VENDOR_NM;
    $NC.G_VAR.subData.DELIVERY_TEL1 = resultInfo.TEL_NO;
    $NC.G_VAR.subData.DELIVERY_ZIP_CD = resultInfo.ZIP_CD;
    $NC.G_VAR.subData.DELIVERY_ADDR_BASIC1 = resultInfo.ADDR_BASIC;
    $NC.G_VAR.subData.DELIVERY_ADDR_DETAIL1 = resultInfo.ADDR_DETAIL;
    
    $NC.setValue("#edtDelivery_Nm", resultInfo.VENDOR_NM);
    $NC.setValue("#edtDelivery_Tel", resultInfo.TEL_NO);
    $NC.setValue("#edtDelivery_Tel1", resultInfo.TEL_NO);
    $NC.setValue("#edtDelivery_Zip_Cd", resultInfo.ZIP_CD);
    $NC.setValue("#edtDelivery_Addr_Basic01", resultInfo.ADDR_BASIC);
    $NC.setValue("#edtDelivery_Addr_Detail01", resultInfo.ADDR_DETAIL);
    $NC.setValue("#edtDelivery_Addr_Basic", resultInfo.ADDR_BASIC);
    $NC.setValue("#edtDelivery_Addr_Detail", resultInfo.ADDR_DETAIL);
    
    $NC.setValue("#edtVendor_Cd", resultInfo.VENDOR_CD);
    $NC.setValue("#edtVendor_Nm", resultInfo.VENDOR_NM);
    $NC.setFocus("#edtCar_No", true);
  } else {
    $NC.G_VAR.masterData.VENDOR_CD = "";
    $NC.setValue("#edtVendor_Cd");
    $NC.setValue("#edtVendor_Nm");
    $NC.setFocus("#edtVendor_Cd", true);
  }
  if ($NC.G_VAR.masterData.CRUD == "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}


function onItemPopup(resultInfo) {

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    if ($NC.G_VAR.userData.P_POLICY_RO190 === "2") {
      rowData.BRAND_CD = resultInfo.BRAND_CD;
      rowData.BRAND_NM = resultInfo.BRAND_NM;
      rowData.ITEM_CD = resultInfo.ITEM_CD;
      rowData.ITEM_NM = resultInfo.ITEM_NM;
      rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
      rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;
      rowData.BOX_WEIGHT = resultInfo.BOX_WEIGHT;
      rowData.SUPPLY_PRICE = resultInfo.SUPPLY_PRICE;
      rowData.APPLY_PRICE = resultInfo.SUPPLY_PRICE;
      rowData.VAT_YN = resultInfo.VAT_YN;
      rowData = grdDetailOnCalc(rowData);
    } else {
      rowData.BRAND_CD = resultInfo.BRAND_CD;
      rowData.BRAND_NM = resultInfo.BRAND_NM;
      rowData.ITEM_CD = resultInfo.ITEM_CD;
      rowData.ITEM_NM = resultInfo.ITEM_NM;
      rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
      rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;
      rowData.BOX_WEIGHT = resultInfo.BOX_WEIGHT;
      rowData.SUPPLY_PRICE = resultInfo.SUPPLY_PRICE;
      rowData.VAT_YN = resultInfo.VAT_YN;
      rowData = grdDetailOnCalc(rowData);
    }

    gridDetailCheckPSTOCK(G_GRDDETAIL.lastRow, null);
    focusCol = G_GRDDETAIL.view.getColumnIndex("ORDER_QTY");
  } else {
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";
    rowData.ITEM_SPEC = "";
    rowData.QTY_IN_BOX = 1;
    rowData.ORDER_QTY = 0;
    rowData.BOX_WEIGHT = 0;
    rowData.ORDER_WEIGHT = 0;
    rowData.SUPPLY_PRICE = 0;
    rowData.SUPPLY_AMT = 0;
    rowData.VAT_AMT = 0;
    rowData.DC_AMT = 0;
    rowData.TOTAL_AMT = 0;
    rowData.VAT_YN = "N";

    focusCol = G_GRDDETAIL.view.getColumnIndex("ITEM_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
}

function grdDetailOnCalc(rowData, order_Qty) {

  if (!$NC.isNull(order_Qty)) {
    rowData.ORDER_QTY = Number(order_Qty);
  }
  rowData.ORDER_BOX = $NC.getB_Box(rowData.ORDER_QTY, rowData.QTY_IN_BOX);
  rowData.ORDER_EA = $NC.getB_Ea(rowData.ORDER_QTY, rowData.QTY_IN_BOX);
  rowData.ORDER_WEIGHT = $NC.getWeight(rowData.ORDER_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);

  rowData.SUPPLY_AMT = $NC.getItem_Amt({
    ITEM_PRICE: rowData.SUPPLY_PRICE,
    APPLY_PRICE: $NC.G_VAR.userData.P_POLICY_RO190 == "2" ? (rowData.SUPPLY_PRICE - rowData.DC_PRICE) : 0,
    ITEM_QTY: rowData.ORDER_QTY,
    ITEM_AMT: rowData.SUPPLY_AMT,
    POLICY_VAL: $NC.G_VAR.userData.P_POLICY_RO190
  });
  rowData.VAT_AMT = $NC.getVat_Amt({
    ITEM_PRICE: rowData.SUPPLY_PRICE,
    APPLY_PRICE: $NC.G_VAR.userData.P_POLICY_RO190 == "2" ? (rowData.SUPPLY_PRICE - rowData.DC_PRICE) : 0,
    ITEM_QTY: rowData.ORDER_QTY,
    ITEM_AMT: rowData.SUPPLY_AMT,
    VAT_YN: rowData.VAT_YN,
    VAT_AMT: rowData.VAT_AMT,
    POLICY_VAL: $NC.G_VAR.userData.P_POLICY_RO190
  });
  rowData.DC_AMT = 0;
  rowData.TOTAL_AMT = $NC.getTotal_Amt({
    ITEM_AMT: rowData.SUPPLY_AMT,
    VAT_AMT: rowData.VAT_AMT,
    DC_AMT: rowData.DC_AMT,
    TOTAL_AMT: rowData.TOTAL_AMT,
    POLICY_VAL: $NC.G_VAR.userData.P_POLICY_RO190
  });

  return rowData;
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  onClose();
}

/**
 * 상품상태 일괄변경
 */

function StateSwap() {

  var FR_STATE = $NC.getValue("#cboItem_State");
  for ( var row = 0; row < G_GRDDETAIL.data.getLength(); row++) {
    var rowData = G_GRDDETAIL.data.getItem(row);
    rowData.ITEM_STATE = FR_STATE;
    if (FR_STATE == "X") {
      rowData.ITEM_STATE_F = "X - 불량";
      rowData.ITEM_STATE = "X";
    } else {
      rowData.ITEM_STATE_F = "A - 정상";
      rowData.ITEM_STATE = "A";
    }
    if (rowData.CRUD == "R") {
      rowData.CRUD = "U";
    }

    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
    gridDetailCheckPSTOCK(row, true);

  }
  G_GRDDETAIL.data.refresh();

  // 현재고 표시
  gridDetailCheckPSTOCK(G_GRDDETAIL.lastRow, null);
}

/**
 * 출고가능량 체크하기
 * 
 * @param params
 * @param onSuccess
 */
function gridDetailCheckPSTOCK(row, isCheckOnly) {
  var rowData = G_GRDDETAIL.data.getItem(row);
  if (rowData) {
    // 데이터 조회
    $NC.serviceCall("/RO01010E/callSP.do", {
      P_QUERY_ID: "WF.GET_PSTOCK_QTY",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_POLICY_LO310: "",
        P_POLICY_LO320: ""
      })
    }, function(ajaxData) {

      var resultData = $NC.toArray(ajaxData);
      if (!$NC.isNull(resultData)) {
        if (resultData.O_MSG === "OK") {
          if (isCheckOnly == null || isCheckOnly == undefined) {
            if (Number(resultData.O_PSTOCK_QTY) < Number(rowData.ORDER_QTY)) {
              rowData.CHK = "N"; // 'N'이면 반출 가능량 부족.
            } else {
              rowData.CHK = "Y"; // 'Y'이면 반출 가능량 만족.
            }
            G_GRDDETAIL.data.updateItem(rowData.id, rowData);

            $NC.setValue("#edtStock_Qty", $NC.getDisplayNumber(resultData.O_STOCK_QTY));
            $NC.setValue("#edtVirtual_Qty", $NC.getDisplayNumber(resultData.O_VIRTUAL_QTY));
            $NC.setValue("#edtOut_Wait_Qty", $NC.getDisplayNumber(resultData.O_OUT_WAIT_QTY));
            $NC.setValue("#edtPstock_Qty", $NC.getDisplayNumber(resultData.O_PSTOCK_QTY));
          } else {
            if (isCheckOnly) {
              if (Number(resultData.O_PSTOCK_QTY) < Number(rowData.ORDER_QTY)) {
                rowData.CHK = "N"; // 'N'이면 반출 가능량 부족.
              } else {
                rowData.CHK = "Y"; // 'Y'이면 반출 가능량 만족.
              }
              G_GRDDETAIL.data.updateItem(rowData.id, rowData);
            } else {
              $NC.setValue("#edtStock_Qty", $NC.getDisplayNumber(resultData.O_STOCK_QTY));
              $NC.setValue("#edtVirtual_Qty", $NC.getDisplayNumber(resultData.O_VIRTUAL_QTY));
              $NC.setValue("#edtOut_Wait_Qty", $NC.getDisplayNumber(resultData.O_OUT_WAIT_QTY));
              $NC.setValue("#edtPstock_Qty", $NC.getDisplayNumber(resultData.O_PSTOCK_QTY));
            }
          }
        } else {
          alert(resultData.O_MSG);
          return;
        }
      } else {
        alert("재고정보취득에 실패했습니다. 관리자에게 문의하십시오.");
        return;
      }
    });
  } else {
    $NC.setValue("#edtStock_Qty");
    $NC.setValue("#edtVirtual_Qty");
    $NC.setValue("#edtOut_Wait_Qty");
    $NC.setValue("#edtPstock_Qty");
  }
}

function showStockSelOverlay(e) {


  var BRAND_NM = $NC.getValue("edtBrand_Nm");
  
  var BRAND_CD = $NC.getValue("edtBrand_Cd");
  if ($NC.isNull(BRAND_CD)) {
    alert("먼저 위타가 코드를 입력하십시오.");
    $NC.setFocus("#edtBrand_Cd");
    return;
  }

  $NC.setValue("#edtQBrand_Cd", BRAND_CD);
  $NC.setValue("#edtQBrand_Nm", BRAND_NM); 

  // 현재 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }

  $NC.setValue("#edtQItem_Cd");
  $NC.setValue("#edtQItem_Nm");

  // 초기화
  $NC.clearGridData(G_GRDSTOCKSELMASTER);

  clearTimeout($NC.G_VAR.onStockSelInfoViewTimeout);
  var divStockInfoPopup = $("#divStockSelInfoView").hide();
  var view = $(e.target);
  var offset = view.offset();
  divStockInfoPopup.css({
    "position": "absolute",
    "top": 0,
    "left": 0,
    "z-index": 1000,
    "width": "100%",
    "height": "100%"
  });

  G_GRDSTOCKSELMASTER.view.resetActiveCell();
  divStockInfoPopup.show("fast", function() {
    G_GRDSTOCKSELMASTER.view.focus();
    $NC.resizeGrid("#grdStockSelMaster", divStockInfoPopup.width(), divStockInfoPopup.height() - $NC.G_LAYOUT.header
        - $("#divStockSelInfoBottomView").outerHeight() - $("#divStockSelConditionView").outerHeight() - 1);
    G_GRDSTOCKSELMASTER.view.invalidate();
    $NC.setGridDisplayRows("#grdStockSelMaster", 0, 0);
    $NC.setFocus("#edtQItem_Cd");
  });
}

function onGetStockSelMaster(ajaxData) {

  $NC.setInitGridData(G_GRDSTOCKSELMASTER, ajaxData);
  if (G_GRDSTOCKSELMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDSTOCKSELMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSTOCKSELMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSTOCKSELMASTER, {
        selectKey: "ITEM_CD",
        selectVal: G_GRDSTOCKSELMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdStockSelMaster", 0, 0);
  }
}

function grdStockSelMasterOnGetColumns() {

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
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
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
    minWidth: 130
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 60
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
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  // 정책에 따른 컬럼 표시
  if ($NC.getValue("#rgbQView_Div2")) {
    $NC.setGridColumn(columns, {
      id: "VALID_DATE",
      field: "VALID_DATE",
      name: "유통기한",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "BATCH_NO",
      field: "BATCH_NO",
      name: "제조배치번호",
      minWidth: 100
    });
  }
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "현재고",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PSTOCK_QTY",
    field: "PSTOCK_QTY",
    name: "출고가능량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PSTOCK_BOX",
    field: "PSTOCK_BOX",
    name: "출고가능BOX",
    minWidth: 85,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PSTOCK_EA",
    field: "PSTOCK_EA",
    name: "출고가능EA",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INPUT_QTY",
    field: "INPUT_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdStockSelMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 5
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdStockSelMaster", {
    columns: grdStockSelMasterOnGetColumns(),
    queryId: "WC.POP_LS010NM",
    sortCol: "ITEM_LOT",
    gridOptions: options
  });

  G_GRDSTOCKSELMASTER.view.onSelectedRowsChanged.subscribe(grdStockSelMasterOnAfterScroll);
  G_GRDSTOCKSELMASTER.view.onHeaderClick.subscribe(grdStockSelMasterOnHeaderClick);
  G_GRDSTOCKSELMASTER.view.onCellChange.subscribe(grdStockSelMasterOnCellChange);
  $NC.setGridColumnHeaderCheckBox(G_GRDSTOCKSELMASTER, "CHECK_YN");

}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdStockSelMasterOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDSTOCKSELMASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDSTOCKSELMASTER.view.getEditorLock().isActive()
          && !G_GRDSTOCKSELMASTER.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDSTOCKSELMASTER.data.getLength();
      var rowData;
      G_GRDSTOCKSELMASTER.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDSTOCKSELMASTER.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDSTOCKSELMASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDSTOCKSELMASTER.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdStockSelMasterOnCellChange(e, args) {

  var rowData = args.item;
  if (args.cell === G_GRDSTOCKSELMASTER.view.getColumnIndex("INPUT_QTY")) {

    if (rowData.CHECK_YN != "Y") {
      rowData.CHECK_YN = "Y";

      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }

      G_GRDSTOCKSELMASTER.data.updateItem(rowData.id, rowData);
    }
  }

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSTOCKSELMASTER.lastRowModified = true;
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

  if (G_GRDSTOCKSELMASTER.view.getEditorLock().isActive()) {
    G_GRDSTOCKSELMASTER.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDSTOCKSELMASTER, args.row);

  var rowData = G_GRDSTOCKSELMASTER.data.getItem(args.row);

  if (args.cell == G_GRDSTOCKSELMASTER.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSTOCKSELMASTER.data.updateItem(rowData.id, rowData);

  G_GRDSTOCKSELMASTER.lastModified = true;

}

function grdStockSelMasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdStockSelMaster", row + 1);
}

/**
 * 재고팝업에서 선택한 상품을 그리드에 추가
 */
function addItemToGrid() {

  if (G_GRDSTOCKSELMASTER.view.getEditorLock().isActive()) {
    G_GRDSTOCKSELMASTER.view.getEditorLock().commitCurrentEdit();
  }

  var itemDs = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < G_GRDSTOCKSELMASTER.data.getLength(); row++) {
    var rowData = G_GRDSTOCKSELMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      if (Number(rowData.INPUT_QTY) == 0) {
        alert("예정수량은 1보다 작을 수 없습니다.");
        $NC.setFocusGrid(G_GRDSTOCKSELMASTER, row, G_GRDSTOCKSELMASTER.view.getColumnIndex("INPUT_QTY"), true);
        return false;
      }
      itemDs.push(rowData);
      chkCnt++;
    }
  }

  if (chkCnt == 0) {
    alert("재고내역 정보를 선택하십시오.");
    return;
  }

  if (itemDs.length == 0) {
    return;
  }

  var rowCount = G_GRDDETAIL.data.getLength();
  if (rowCount == 0) {
    G_GRDDETAIL.lastRow = null; // 출고예정등록 상세정보 그리드의 length가 0일 경우 현재고에 0이 표시되는것 막기 위해 추가
  }
  for ( var row in itemDs) {
    rowData = itemDs[row];

    grdDetailOnCalc(rowData, rowData.INPUT_QTY);
    if ($NC.G_VAR.userData.P_POLICY_RO190 === "2") {
      var newRowData = {
        CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        BU_CD: $NC.G_VAR.masterData.BU_CD,
        ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
        ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
        LINE_NO: "",
        OUTBOUND_STATE: $NC.G_VAR.masterData.OUTBOUND_STATE,
        BRAND_CD: rowData.BRAND_CD,
        BRAND_NM: rowData.BRAND_NM,
        ITEM_CD: rowData.ITEM_CD,
        ITEM_NM: rowData.ITEM_NM,
        ITEM_STATE: rowData.ITEM_STATE,
        ITEM_STATE_F: rowData.ITEM_STATE_F,
        ITEM_LOT: rowData.ITEM_LOT,
        ITEM_SPEC: rowData.ITEM_SPEC,
        VALID_DATE: $NC.getValue("#rgbQView_Div2") == "1" ? "" : rowData.VALID_DATE,
        BATCH_NO: $NC.getValue("#rgbQView_Div2") == "1" ? "" : rowData.BATCH_NO,
        QTY_IN_BOX: rowData.QTY_IN_BOX,
        ORDER_QTY: rowData.INPUT_QTY,
        ORDER_BOX: rowData.ORDER_BOX,
        ORDER_EA: rowData.ORDER_EA,
        ORDER_WEIGHT: rowData.ORDER_WEIGHT,
        ENTRY_QTY: 0,
        BOX_WEIGHT: rowData.BOX_WEIGHT,
        SUPPLY_PRICE: rowData.SUPPLY_PRICE,
        DC_PRICE: 0,
        APPLY_PRICE: rowData.SUPPLY_PRICE,
        SUPPLY_AMT: rowData.SUPPLY_AMT,
        VAT_AMT: rowData.VAT_AMT,
        DC_AMT: 0,
        TOTAL_AMT: rowData.TOTAL_AMT,
        BU_LINE_NO: "",
        BU_KEY: "",
        REMARK1: "",
        VAT_YN: rowData.VAT_YN,
        CHK: Number(rowData.PSTOCK_QTY) < Number(rowData.INPUT_QTY) ? "N" : "Y",
        id: $NC.getGridNewRowId(),
        CRUD: "C"
      };
    } else {
      var newRowData = {
        CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        BU_CD: $NC.G_VAR.masterData.BU_CD,
        ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
        ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
        LINE_NO: "",
        OUTBOUND_STATE: $NC.G_VAR.masterData.OUTBOUND_STATE,
        BRAND_CD: rowData.BRAND_CD,
        BRAND_NM: rowData.BRAND_NM,
        ITEM_CD: rowData.ITEM_CD,
        ITEM_NM: rowData.ITEM_NM,
        ITEM_STATE: rowData.ITEM_STATE,
        ITEM_STATE_F: rowData.ITEM_STATE_F,
        ITEM_LOT: rowData.ITEM_LOT,
        ITEM_SPEC: rowData.ITEM_SPEC,
        VALID_DATE: $NC.getValue("#rgbQView_Div2") == "1" ? "" : rowData.VALID_DATE,
        BATCH_NO: $NC.getValue("#rgbQView_Div2") == "1" ? "" : rowData.BATCH_NO,
        QTY_IN_BOX: rowData.QTY_IN_BOX,
        ORDER_QTY: rowData.INPUT_QTY,
        ORDER_BOX: rowData.ORDER_BOX,
        ORDER_EA: rowData.ORDER_EA,
        ORDER_WEIGHT: rowData.ORDER_WEIGHT,
        ENTRY_QTY: 0,
        BOX_WEIGHT: rowData.BOX_WEIGHT,
        SUPPLY_PRICE: rowData.SUPPLY_PRICE,
        DC_PRICE: 0,
        APPLY_PRICE: 0,
        SUPPLY_AMT: rowData.SUPPLY_AMT,
        VAT_AMT: rowData.VAT_AMT,
        DC_AMT: 0,
        TOTAL_AMT: rowData.TOTAL_AMT,
        BU_LINE_NO: "",
        BU_KEY: "",
        REMARK1: "",
        VAT_YN: rowData.VAT_YN,
        CHK: Number(rowData.PSTOCK_QTY) < Number(rowData.INPUT_QTY) ? "N" : "Y",
        id: $NC.getGridNewRowId(),
        CRUD: "C"
      };
    }
    G_GRDDETAIL.data.addItem(newRowData);
  }

  $NC.setGridSelectRow(G_GRDDETAIL, rowCount);
  $NC.setGridDisplayRows("#grdDetail", rowCount + 1, G_GRDDETAIL.data.getLength());

  // 예정수량과 가용재고량과 비교하기 위해 아래 로직 추가
  for ( var row = 0; row < G_GRDDETAIL.data.getLength(); row++) {
    gridDetailCheckPSTOCK(row, true);
  }

  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;

  $("#divStockSelInfoView").hide();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandStockPopup() {

  var BU_CD = $NC.G_VAR.userData.P_BU_CD;

  $NP.showBuBrandPopup({
    P_BU_CD: BU_CD,
    P_BRAND_CD: "%"
  }, onBuBrandStockPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onBuBrandStockPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }

  // 상품 조건 초기화
  $NC.setValue("#edtQItem_Cd");
  $NC.setValue("#edtQItem_Nm");

  $NC.clearGridData(G_GRDSTOCKSELMASTER);
}

/**
 * 상품 검색 팝업 표시
 */
function showItemStockPopup() {
  var BU_CD = $NC.G_VAR.userData.P_BU_CD;
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  $NP.showItemPopup({
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: "%",
    P_VIEW_DIV: "2",
    P_DEPART_CD: "%",
    P_LINE_CD: "%",
    P_CLASS_CD: "%"
  }, onItemStockPopup, function() {
    $NC.setFocus("#edtQItem_Cd", true);
  });
}

function onItemStockPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQItem_Cd", resultInfo.ITEM_CD);
    $NC.setValue("#edtQItem_Nm", resultInfo.ITEM_NM);
  } else {
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");
    $NC.setFocus("#edtQItem_Cd", true);
  }

  $NC.clearGridData(G_GRDSTOCKSELMASTER);
}


/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {

  var CUST_CD = $NC.G_USERINFO.CUST_CD;

  var BU_CD =  $NC.getValue("#edtBu_Cd");
  $NP.showOwnBran_roPopup({
    P_CUST_CD:  CUST_CD,   
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%',
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    
    $NC.G_VAR.masterData.BRAND_CD = resultInfo.OWN_BRAND_CD;
    $NC.G_VAR.masterData.BRAND_NM = resultInfo.OWN_BRAND_NM;
    $NC.G_VAR.subData.DELIVERY_CD = resultInfo.OWN_BRAND_CD;
    $NC.G_VAR.subData.DELIVERY_NM = resultInfo.OWN_BRAND_NM;
    $NC.G_VAR.subData.DELIVERY_TEL1 = resultInfo.TEL_NO;
    $NC.G_VAR.subData.DELIVERY_TEL = resultInfo.TEL_NO;
    $NC.G_VAR.subData.DELIVERY_ZIP_CD = resultInfo.ZIP_CD;
    $NC.G_VAR.subData.DELIVERY_ADDR_BASIC1 = resultInfo.ADDR_BASIC;
    $NC.G_VAR.subData.DELIVERY_ADDR_DETAIL1 = resultInfo.ADDR_DETAIL;
    $NC.G_VAR.subData.DELIVERY_ADDR_BASIC = resultInfo.ADDR_BASIC;
    $NC.G_VAR.subData.DELIVERY_ADDR_DETAIL = resultInfo.ADDR_DETAIL;
    
    $NC.setValue("#edtDelivery_Nm", resultInfo.OWN_BRAND_NM);
    $NC.setValue("#edtDelivery_Tel", resultInfo.TEL_NO);
    $NC.setValue("#edtDelivery_Tel1", resultInfo.TEL_NO);
    $NC.setValue("#edtDelivery_Zip_Cd", resultInfo.ZIP_CD);
    $NC.setValue("#edtDelivery_Addr_Basic01", resultInfo.ADDR_BASIC);
    $NC.setValue("#edtDelivery_Addr_Detail01", resultInfo.ADDR_DETAIL);
    $NC.setValue("#edtDelivery_Addr_Basic", resultInfo.ADDR_BASIC);
    $NC.setValue("#edtDelivery_Addr_Detail", resultInfo.ADDR_DETAIL);
    $NC.setValue("#edtBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtBrand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.G_VAR.masterData.BRAND_CD = "";
    $NC.setValue("#edtBrand_Cd");
    $NC.setValue("#edtBrand_Nm");
    $NC.setFocus("#edtBrand_Cd", true);
  }
  if ($NC.G_VAR.masterData.CRUD == "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}
function showPostPopup() {

  $NP.showPostPopup({
    queryParams: {
      P_ADDR_NM: "%"
    }
  }, onPostPopup, onPostPopup);
}

function onPostPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.subData.DELIVERY_ZIP_CD = resultInfo.ZIP_CD;
    $NC.G_VAR.subData.DELIVERY_ADDR_BASIC = resultInfo.ADDR_NM_REAL;
    $NC.setValue("#edtDelivery_Zip_Cd", resultInfo.ZIP_CD);
    $NC.setValue("#edtDelivery_Addr_Basic", resultInfo.ADDR_NM_REAL);
  }
  $NC.setFocus("#edtShipper_Addr_Detail", true);
  if ($NC.G_VAR.masterData.CRUD == "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}


function subDataOnChange(e, args) {
  // 온라인 데이터 변경에 대한 처리만 추가
  // Popup, DatePicker 같은 것이 없으므로 해당 값만 입력하도록 처리
  switch (args.col) {   
  case "DELIVERY_NM":
  case "DELIVERY_TEL1":
  case "DELIVERY_HP1":
  case "DELIVERY_ZIP_CD":
  case "DELIVERY_ADDR_BASIC":
  case "DELIVERY_ADDR_DETAIL":
  case "DELIVERY_ADDR_BASIC1":
  case "DELIVERY_ADDR_DETAIL1":
  case "DELIVERY_TEL":
  case "DELIVERY_HP":
  case "REMARK1":
    $NC.G_VAR.subData[args.col] = args.val;
    break;
  }

  // 주문자 => 수령자 정보로 자동입력
  switch (args.col) {
  case "ORDERER_NM":
    if ($NC.isNull($NC.G_VAR.subData["SHIPPER_NM"])) {
      $NC.G_VAR.subData["SHIPPER_NM"] = args.val;
      $NC.setValue("#edtShipper_Nm", args.val);
    }
    break;
  case "ORDERER_TEL":
    if ($NC.isNull($NC.G_VAR.subData["SHIPPER_TEL"])) {
      $NC.G_VAR.subData["SHIPPER_TEL"] = args.val;
      $NC.setValue("#edtShipper_Tel", args.val);
    }
    break;
  case "ORDERER_HP":
    if ($NC.isNull($NC.G_VAR.subData["SHIPPER_HP"])) {
      $NC.G_VAR.subData["SHIPPER_HP"] = args.val;
      $NC.setValue("#edtShipper_Hp", args.val);
    }
    break;
  }

  if ($NC.G_VAR.subData.CRUD === "R") {
    $NC.G_VAR.subData.CRUD = "U";
  }
}