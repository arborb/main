/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null,
    // 온라인 데이터
    subData: null,
    onStockInfoViewTimeout: null
  });

  $NC.setInitDatePicker("#dtpOrder_Date"); // 예정일자
  $NC.setInitDatePicker("#dtpBu_Date"); // 전표일자

  // 현재고 검색 조건.상품상태 콤보 세팅
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
    addAll: true
  });

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel); // 닫기버튼
//  $("#btnDelivery_Cd").click(showDeliveryPopup); // 온라인몰 검색 버튼
  $("#btnShipper_Zip_Cd").click(showPostPopup); // 우편번호검색 버튼 클릭

  $("#btnEntryNew").click(_New); // 그리드 행 추가 버튼
  $("#btnEntryDelete").click(_Delete); // 그리드 행 삭제버튼
  $("#btnEntrySave").click(_Save); // 저장 버튼

  $("#btnStockPopup").click(showStockSelOverlay);// 재고에서 선택버튼 클릭
  $("#btnStockSel").click(addItemToGrid); // 재고팝업에서 확인버튼클릭
  $("#btnStockSearch").click(_Inquiry); // 재고팝업에서 조회버튼클릭
  $("#btnStockSelClose").click(function() { // 재고에서 선택 창 닫기
    $("#divStockSelInfoView").hide();
  });

  $("#btnQBrand_Cd").click(showBuBrandStockPopup); // 브랜드검색 버튼 클릭
  $("#btnQItem_Cd").click(showItemStockPopup); // 상품검색 버튼 클릭
  $("#btnMall_Brand_Cd").click(showMallBrandPopup);

  // 재고에서 선택 임시로 막음
  $NC.setEnable("#btnStockPopup", false);

  // 그리드 초기화
  grdDetailInitialize();
  grdStockSelMasterInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  // 출고예정등록 전표생성 가능여부 N -> 출고예정등록시 신규, 수정 불가능
  if ($NC.G_VAR.userData.P_POLICY_LO110 !== "Y") {
    $NC.setEnable("#btnEntryNew", false);
    $NC.setEnable("#btnEntryDelete", false);
    $NC.setEnable("#btnEntrySave", false);
  }

  $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
  $NC.setValue("#edtCenter_Cd", $NC.G_VAR.userData.P_CENTER_CD);
  $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);
  $NC.setValue("#edtCust_Cd", $NC.G_VAR.userData.P_CUST_CD);

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {

    var ORDER_DATE = $NC.getValue("#dtpOrder_Date");
    var BU_DATE = $NC.getValue("#dtpBu_Date");
    // var INOUT_CD = $NC.getValue("#cboInout_Cd");
    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      ORDER_DATE: ORDER_DATE,
      ORDER_NO: "",
      INOUT_CD: "", // INOUT_CD,
      ORDER_DIV: "1",
      MALL_CD: "",
      INORDER_TYPE: "9",
      SHIP_TYPE: "",
      SHIP_PRICE_TYPE: "",
      SHIP_PRICE: "",
      DELIVERY_TYPE: "",
      OUTBOUND_STATE: "10",
      CUST_CD: $NC.G_VAR.userData.P_CUST_CD,
      DELIVERY_CD: "1111",
      DELIVERY_NM: "",
      RDELIVERY_CD: "1111",
      RDELIVERY_NM: "",
      MALL_BRAND_CD: "",
      MALL_BRAND_NM: "",
      DELIVERY_TYPE2: "",
      BU_DATE: BU_DATE,
      BU_NO: "",
      REMARK1: "",
      CRUD: "C"
    };

    // 온라인 데이터 세팅
    $NC.G_VAR.subData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      ORDER_DATE: ORDER_DATE,
      ORDER_NO: "",
      MALL_MSG: "",
      ORDERER_CD: "",
      ORDERER_NM: "",
      ORDERER_TEL: "",
      ORDERER_HP: "",
      ORDERER_EMAIL: "",
      ORDERER_MSG: "",
      SHIPPER_NM: "",
      SHIPPER_TEL: "",
      SHIPPER_HP: "",
      SHIPPER_ZIP_CD: "",
      SHIPPER_ADDR_BASIC: "",
      SHIPPER_ADDR_DETAIL: "",
      GIFT_WRAP_YN: "",
      CARD_MSG: "",
      CARD_FROM: "",
      CARD_TO: "",
      REMARK1: "",
      CRUD: "C"
    };

    $NC.setFocus("#edtBu_No");

  } else {
    // 예정 -> 등록, 등록 수정
    var CRUD = "R";
    var masterDS = $NC.G_VAR.userData.P_MASTER_DS;

    $NC.G_VAR.masterData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      ORDER_DATE: masterDS.ORDER_DATE,
      ORDER_NO: masterDS.ORDER_NO,
      INOUT_CD: masterDS.INOUT_CD,
      ORDER_DIV: masterDS.ORDER_DIV,
      MALL_CD: masterDS.MALL_CD,
      INORDER_TYPE: masterDS.INORDER_TYPE,
      SHIP_TYPE: masterDS.SHIP_TYPE,
      SHIP_PRICE_TYPE: masterDS.SHIP_PRICE_TYPE,
      SHIP_PRICE: masterDS.SHIP_PRICE,
      DELIVERY_TYPE: masterDS.DELIVERY_TYPE,
      OUTBOUND_STATE: "10",
      CUST_CD: masterDS.CUST_CD,
      DELIVERY_CD: masterDS.DELIVERY_CD,
      DELIVERY_NM: masterDS.DELIVERY_NM,
      RDELIVERY_CD: masterDS.DELIVERY_CD,
      RDELIVERY_NM: masterDS.DELIVERY_NM,
      MALL_BRAND_CD: masterDS.BRAND_CD_D,
      MALL_BRAND_NM: masterDS.BRAND_NM_D,
      DELIVERY_TYPE2: masterDS.DELIVERY_TYPE2,
      BU_DATE: masterDS.BU_DATE,
      BU_NO: masterDS.BU_NO,
      REMARK1: masterDS.REMARK1,
      CRUD: CRUD
    };

    // 온라인 데이터 세팅
    $NC.G_VAR.subData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      ORDER_DATE: masterDS.ORDER_DATE,
      ORDER_NO: masterDS.ORDER_NO,
      MALL_MSG: masterDS.MALL_MSG,
      ORDERER_CD: masterDS.ORDERER_CD,
      ORDERER_NM: masterDS.ORDERER_NM,
      ORDERER_TEL: masterDS.ORDERER_TEL,
      ORDERER_HP: masterDS.ORDERER_HP,
      ORDERER_EMAIL: masterDS.ORDERER_EMAIL,
      ORDERER_MSG: masterDS.ORDERER_MSG,
      SHIPPER_NM: masterDS.SHIPPER_NM,
      SHIPPER_TEL: masterDS.SHIPPER_TEL,
      SHIPPER_HP: masterDS.SHIPPER_HP,
      SHIPPER_ZIP_CD: masterDS.SHIPPER_ZIP_CD,
      SHIPPER_ADDR_BASIC: masterDS.SHIPPER_ADDR_BASIC,
      SHIPPER_ADDR_DETAIL: masterDS.SHIPPER_ADDR_DETAIL,
      GIFT_WRAP_YN: masterDS.GIFT_WRAP_YN,
      CARD_MSG: masterDS.CARD_MSG,
      CARD_FROM: masterDS.CARD_FROM,
      CARD_TO: masterDS.CARD_TO,
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
            ITEM_SPEC: rowData.ITEM_SPEC,
            ITEM_STATE: rowData.ITEM_STATE,
            ITEM_STATE_F: rowData.ITEM_STATE_F,
            ITEM_LOT: rowData.ITEM_LOT,
            QTY_IN_BOX: rowData.QTY_IN_BOX,
            VALID_DATE: rowData.VALID_DATE,
            BATCH_NO: rowData.BATCH_NO,
            ORDER_QTY: rowData.ORDER_QTY,
            ORDER_BOX: rowData.ORDER_BOX,
            ORDER_EA: rowData.ORDER_EA,
            ORDER_WEIGHT: rowData.ORDER_WEIGHT,
            BOX_WEIGHT: rowData.BOX_WEIGHT,
            SUPPLY_PRICE: rowData.SUPPLY_PRICE,
            DC_PRICE: rowData.DC_PRICE,
            APPLY_PRICE: rowData.APPLY_PRICE,
            SUPPLY_AMT: rowData.SUPPLY_AMT,
            VAT_AMT: rowData.VAT_AMT,
            DC_AMT: rowData.DC_AMT,
            TOTAL_AMT: rowData.TOTAL_AMT,
            ITEM_ORDER_DIV: rowData.ITEM_ORDER_DIV,
            ITEM_ORDER_DIV_F: rowData.ITEM_ORDER_DIV_F,
            BU_LINE_NO: rowData.BU_LINE_NO,
            BU_KEY: rowData.BU_KEY,
            DEAL_ID: rowData.DEAL_ID,
            DEAL_NM: rowData.DEAL_NM,
            OPTION_ID: rowData.OPTION_ID,
            OPTION_VALUE: rowData.OPTION_VALUE,
            OPTION_QTY: rowData.OPTION_QTY,
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
    for (var row = 0; row < G_GRDDETAIL.data.getLength(); row++) {
      gridDetailCheckPSTOCK(row, true);
    }

    $NC.setValue("#dtpOrder_Date", $NC.G_VAR.masterData.ORDER_DATE);
    $NC.setValue("#edtOrder_No", $NC.G_VAR.masterData.ORDER_NO);
    $NC.setValue("#edtShip_Price", $NC.G_VAR.masterData.SHIP_PRICE);
    // $NC.setValue("#cboInout_Cd", $NC.G_VAR.masterData.INOUT_CD);
    // $NC.setValue("#cboOrder_Div", $NC.G_VAR.masterData.ORDER_DIV);
    $NC.setValue("#edtRemark1", $NC.G_VAR.masterData.REMARK1);
//    $NC.setValue("#edtBu_Date", $NC.G_VAR.masterData.BU_DATE);
    $NC.setValue("#dtpBu_Date", $NC.G_VAR.masterData.BU_DATE);
    $NC.setValue("#edtBu_No", $NC.G_VAR.masterData.BU_NO);
    $NC.setValue("#edtMall_Brand_Cd", $NC.G_VAR.masterData.MALL_BRAND_CD);
    $NC.setValue("#edtMall_Brand_Nm", $NC.G_VAR.masterData.MALL_BRAND_NM);
    $NC.setValue("#cboDelivery_Route", $NC.G_VAR.masterData.DELIVERY_TYPE2);

    // 온라인데이터 세팅
    $NC.setValue("#edtMall_Msg", $NC.G_VAR.subData.MALL_MSG);
    $NC.setValue("#edtOrderer_Cd", $NC.G_VAR.subData.ORDERER_CD);
    $NC.setValue("#edtOrderer_Nm", $NC.G_VAR.subData.ORDERER_NM);
    $NC.setValue("#edtOrderer_Tel", $NC.G_VAR.subData.ORDERER_TEL);
    $NC.setValue("#edtOrderer_Hp", $NC.G_VAR.subData.ORDERER_HP);
    $NC.setValue("#edtOrderer_Email", $NC.G_VAR.subData.ORDERER_EMAIL);
    $NC.setValue("#edtOrderer_Msg", $NC.G_VAR.subData.ORDERER_MSG);
    $NC.setValue("#edtShipper_Nm", $NC.G_VAR.subData.SHIPPER_NM);
    $NC.setValue("#edtShipper_Tel", $NC.G_VAR.subData.SHIPPER_TEL);
    $NC.setValue("#edtShipper_Hp", $NC.G_VAR.subData.SHIPPER_HP);
    $NC.setValue("#edtShipper_Zip_Cd", $NC.G_VAR.subData.SHIPPER_ZIP_CD);
    $NC.setValue("#edtShipper_Addr_Basic", $NC.G_VAR.subData.SHIPPER_ADDR_BASIC);
    $NC.setValue("#edtShipper_Addr_Detail", $NC.G_VAR.subData.SHIPPER_ADDR_DETAIL);
    $NC.setValue("#chkGift_Wrap_Yn", $NC.G_VAR.subData.GIFT_WRAP_YN);
    $NC.setValue("#edtCard_Msg", $NC.G_VAR.subData.CARD_MSG);
    $NC.setValue("#edtCard_From", $NC.G_VAR.subData.CARD_FROM);
    $NC.setValue("#edtCard_To", $NC.G_VAR.subData.CARD_TO);

    $NC.setEnable("#edtBu_No", false);
    $NC.setEnable("#dtpBu_Date", false);
    // 수정일 경우 입력불가 항목 비활성화 처리
    $NC.setEnable("#cboInout_Cd", false);
    $NC.setEnable("#cboDelivery_Route", false);
    $NC.setEnable("#cboMall_Cd", false);
    $NC.setEnable("#btnMall_Brand_Cd", false);
    $NC.setEnable("#edtMall_Brand_Nm", false);
    // $NC.setEnable("#cboOrder_Div", false);
    $NC.setEnable("#dtpOrder_Date", false);
    $NC.setEnable("#edtMall_Brand_Cd", false);

    // 주문/수령자 정보 모두 Disabled
    $("#divMasterView .sub-table-data").prop("disabled", true);
    $NC.setEnable("#edtShipper_Nm", true);
    $NC.setEnable("#edtShipper_Tel", true);
    $NC.setEnable("#edtShipper_Hp", true);
    $NC.setEnable("#edtShipper_Addr_Detail", true);
    $NC.setEnable("#edtOrderer_Msg", true);
    $NC.setEnable("#edtMall_Msg", true);
    $NC.setEnable("#edtCard_From", true);
    $NC.setEnable("#edtCard_To", true);
    $NC.setEnable("#edtCard_Msg", true);

    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

  // 조회조건 - 출고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "DM",
      P_SUB_CD2: ""
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
    selector: "#cboDelivery_Route",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? "F" : null,
        onComplete: function() {
          if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
            $NC.G_VAR.masterData.DELIVERY_TYPE2 = $NC.getValue("#cboDelivery_Route");
          } else {
            $NC.setValue("#cboDelivery_Route", $NC.G_VAR.masterData.DELIVERY_TYPE2);
          }
        }
  });

  // 몰구분
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMMALL",
    P_QUERY_PARAMS: $NC.getParams({
      P_MALL_CD: "%"
    })
  }, {
    selector: "#cboMall_Cd",
    codeField: "MALL_CD",
    nameField: "MALL_NM",
    fullNameField: "MALL_CD_F",
    selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? "F" : null,
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
//        $NC.G_VAR.masterData.MALL_CD = $NC.getValue("#cboMall_Cd");
        $NC.G_VAR.masterData.MALL_CD = "";
        $NC.setValue("#cboMall_Cd", -1);
      } else {
        $NC.setValue("#cboMall_Cd", $NC.G_VAR.masterData.MALL_CD);
      }
    }
  });
  
  // 운송구분
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "IN_TRANS_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboShip_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? "F" : null,
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.SHIP_TYPE = $NC.getValue("#cboShip_Type");
      } else {
        $NC.setValue("#cboShip_Type", $NC.G_VAR.masterData.SHIP_TYPE);
      }
    }
  });

  // 운송비구분
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "TRANS_FEE_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboShip_Price_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? "F" : null,
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.SHIP_PRICE_TYPE = $NC.getValue("#cboShip_Price_Type");
      } else {
        $NC.setValue("#cboShip_Price_Type", $NC.G_VAR.masterData.SHIP_PRICE_TYPE);
      }
    }
  });

  // 배송유형
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "DELIVERY_TYPE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboDelivery_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? "F" : null,
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.DELIVERY_TYPE = $NC.getValue("#cboDelivery_Type");
      } else {
        $NC.setValue("#cboDelivery_Type", $NC.G_VAR.masterData.DELIVERY_TYPE);
      }
    }
  });

  // 검색구분에 초기값 설정
  $NC.setEnable("#rgbQView_Div2", $NC.G_VAR.userData.P_POLICY_LO250 == "2");
  $NC.setValue("#rgbQView_Div1", true);

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.stockSelMasterViewWidth = 1010;
  // $NC.G_OFFSET.masterViewHeight = 325;
  $NC.G_OFFSET.masterViewHeight = 355;
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

  var id;
  // 재고에서 선택의 값 변경
  if (view.is(".stock-sel-condition")) {
    id = view.prop("id").substr(4).toUpperCase();
    switch (id) {
    case "BRAND_CD":
      var P_QUERY_PARAMS;
      var O_RESULT_DATA = [ ];
      if (!$NC.isNull(val)) {
        var BU_CD = $NC.G_VAR.userData.P_BU_CD;
        P_QUERY_PARAMS = {
          P_BU_CD: BU_CD,
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
        P_QUERY_PARAMS = {
          P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
          P_BRAND_CD: $NC.getValue("#edtQBrand_Cd", true),
          P_ITEM_CD: val,
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
        onItemStockPopup(O_RESULT_DATA[0]);
      } else {
        $NP.showItemPopup({
          queryParams: P_QUERY_PARAMS,
          queryData: O_RESULT_DATA
        }, onItemStockPopup, onItemStockPopup);
      }
      return;
    case "VIEW_DIV1":
    case "VIEW_DIV2":
      G_GRDSTOCKSELMASTER.view.setColumns(grdStockSelMasterOnGetColumns());
    }
    onChangingCondition();
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

  // 출고등록 마스터의 값 변경
  id = view.prop("id").substr(3).toUpperCase();
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
  $NC.serviceCall("/LOM1010E/getDataSet.do", $NC.getGridParams(G_GRDSTOCKSELMASTER), onGetStockSelMaster);

}

/**
 * 신규
 */
function _New() {

  // 마스터 정보 모두 입력 후 디테일 입력하도록 마스터 체크
//  if ($NC.isNull($NC.G_VAR.masterData.DELIVERY_CD)) {
//    alert("먼저 온라인몰 코드를 입력하십시오.");
//    $NC.setFocus("#edtDelivery_Cd");
//    return;
//  }

  if ($NC.isNull($NC.G_VAR.masterData.BU_DATE)) {
    alert("먼저 주문일자를 입력하십시오.");
    $NC.setFocus("#dtpBu_Date");
    return;
  }
  
  if ($NC.isNull($NC.G_VAR.masterData.BU_NO)) {
    alert("먼저 주문번호를 입력하십시오.");
    $NC.setFocus("#edtBu_No");
    return;
  }
  
  if ($NC.isNull($NC.G_VAR.masterData.MALL_CD)) {
    alert("먼저 MALL을 입력하십시오.");
    $NC.setFocus("#cboMall_Cd");
    return;
  }
  
  if ($NC.isNull($NC.G_VAR.masterData.MALL_BRAND_CD)) {
    alert("먼저 위탁사를 입력하십시오.");
    $NC.setFocus("#edtMall_Brand_Cd");
    return;
  }
  
  if ($NC.isNull($NC.G_VAR.subData.ORDERER_NM)) {
    alert("먼저 주문자명을 입력하십시오.");
    $NC.setFocus("#edtOrderer_Nm");
    return;
  }

  if ($NC.isNull($NC.G_VAR.subData.ORDERER_HP)) {
    alert("먼저 주문자 휴대폰번호를 입력하십시오.");
    $NC.setFocus("#edtOrderer_Hp");
    return;
  }

  if ($NC.isNull($NC.G_VAR.subData.SHIPPER_NM)) {
    alert("먼저 수령자명을 입력하십시오.");
    $NC.setFocus("#edtShipper_Nm");
    return;
  }

  if ($NC.isNull($NC.G_VAR.subData.SHIPPER_HP)) {
    alert("먼저 수령자 휴대폰번호를 입력하십시오.");
    $NC.setFocus("#edtShipper_Hp");
    return;
  }

  if ($NC.isNull($NC.G_VAR.subData.SHIPPER_ZIP_CD) 
   || $NC.isNull($NC.G_VAR.subData.SHIPPER_ADDR_BASIC)
   || $NC.isNull($NC.G_VAR.subData.SHIPPER_ADDR_DETAIL)) {
    alert("먼저 수령자 주소를 입력하십시오.");
    $NC.setFocus("#edtShipper_Addr_Detail");
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
      $NC.setFocusGrid(G_GRDDETAIL, rowCount - 1, G_GRDDETAIL.view.getColumnIndex("DEAL_ID"), true);
      // $NC.setFocusGrid(G_GRDDETAIL, rowCount - 1, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
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
    ITEM_STATE: "A",
    ITEM_STATE_F: $NC.getGridComboName(G_GRDDETAIL, {
      colFullNameField: "ITEM_STATE_F",
      searchVal: "A",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    }),
    ITEM_LOT: "00",
    VALID_DATE: "",
    BATCH_NO: "",
    QTY_IN_BOX: 1,
    ORDER_QTY: 0,
    ORDER_BOX: 0,
    ORDER_EA: 0,
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
    ITEM_ORDER_DIV: "01",
    ITEM_ORDER_DIV_F: $NC.getGridComboName(G_GRDDETAIL, {
      colFullNameField: "ITEM_ORDER_DIV_F",
      searchVal: "01",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    }),
    BU_LINE_NO: "",
    BU_KEY: "",
    DEAL_ID: "",
    DEAL_NM: "",
    OPTION_ID: "",
    OPTION_VALUE: "",
    OPTION_QTY: 0,
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
    alert("물류센터를 확인할 수 없습니다. 취소 후 다시 작업하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
    alert("사업부를 확인할 수 없습니다. 취소 후 다시 작업하십시오.");
    return;
  }
  
//  if ($NC.isNull($NC.G_VAR.masterData.BU_DATE)) {
//    alert("먼저 주문일자를 입력하십시오.");
//    $NC.setFocus("#dtpBu_Date");
//    return;
//  }
//  
//  if ($NC.isNull($NC.G_VAR.masterData.BU_NO)) {
//    alert("먼저 주문번호를 입력하십시오.");
//    $NC.setFocus("#edtBu_No");
//    return;
//  }
  
  if ($NC.isNull($NC.G_VAR.masterData.MALL_CD)) {
    alert("먼저 MALL을 입력하십시오.");
    $NC.setFocus("#cboMall_Cd");
    return;
  }
  
  if ($NC.isNull($NC.G_VAR.masterData.MALL_BRAND_CD)) {
    alert("먼저 위탁사를 입력하십시오.");
    $NC.setFocus("#edtMall_Brand_Cd");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.ORDER_DATE)) {
    alert("먼저 예정일자를 입력하십시오.");
    $NC.setFocus("#dtpOrder_Date");
    return;
  }

//  if ($NC.isNull($NC.G_VAR.masterData.DELIVERY_CD)) {
//    alert("먼저 온라인몰 코드를 입력하십시오.");
//    $NC.setFocus("#edtDelivery_Cd");
//    return;
//  }

  if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
    alert("먼저 출고구분을 선택하십시오.");
    $NC.setFocus("#cboInout_Cd");
    return;
  }

  if ($NC.isNull($NC.G_VAR.subData.SHIPPER_NM)) {
    alert("먼저 수령자명을 입력하십시오.");
    $NC.setFocus("#edtShipper_Nm");
    return;
  }

  if ($NC.isNull($NC.G_VAR.subData.SHIPPER_HP)) {
    alert("먼저 수령자 휴대폰번호를 입력하십시오.");
    $NC.setFocus("#edtShipper_Hp");
    return;
  }

  if ($NC.isNull($NC.G_VAR.subData.SHIPPER_ZIP_CD) 
   || $NC.isNull($NC.G_VAR.subData.SHIPPER_ADDR_BASIC)
   || $NC.isNull($NC.G_VAR.subData.SHIPPER_ADDR_DETAIL)) {
    alert("먼저 수령자 주소를 입력하십시오.");
    $NC.setFocus("#edtShipper_Addr_Detail");
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

  var d_DS = [ ];
  var cu_DS = [ ];
  var rows = G_GRDDETAIL.data.getItems();
  var rowCount = rows.length;
  for (var row = 0; row < rowCount; row++) {
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
        P_VAT_AMT: rowData.VAT_AMT,
        P_DC_AMT: rowData.DC_AMT,
        P_TOTAL_AMT: rowData.TOTAL_AMT,
        P_ITEM_ORDER_DIV: rowData.ITEM_ORDER_DIV,
        P_BU_LINE_NO: rowData.BU_LINE_NO,
        P_BU_KEY: rowData.BU_KEY,
        P_DEAL_ID: rowData.DEAL_ID,
        P_OPTION_ID: rowData.OPTION_ID,
        P_OPTION_QTY: rowData.OPTION_QTY,
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
  if ($NC.G_VAR.masterData.CRUD === "R" && $NC.G_VAR.subData.CRUD === "R" && detailDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/LOM1010E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
      P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
      P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
      P_ORDER_DIV: $NC.G_VAR.masterData.ORDER_DIV,
      P_MALL_CD: $NC.G_VAR.masterData.MALL_CD,
      P_INORDER_TYPE: $NC.G_VAR.masterData.INORDER_TYPE,
      P_SHIP_TYPE: $NC.G_VAR.masterData.SHIP_TYPE,
      P_SHIP_PRICE_TYPE: $NC.G_VAR.masterData.SHIP_PRICE_TYPE,
      P_SHIP_PRICE: $NC.G_VAR.masterData.SHIP_PRICE,
      P_DELIVERY_TYPE: $NC.G_VAR.masterData.DELIVERY_TYPE,
      P_OUTBOUND_STATE: $NC.G_VAR.masterData.OUTBOUND_STATE,
      P_CUST_CD: $NC.G_VAR.masterData.CUST_CD,
//      P_DELIVERY_CD: $NC.G_VAR.masterData.DELIVERY_CD,
//      P_RDELIVERY_CD: $NC.G_VAR.masterData.RDELIVERY_CD,
      P_DELIVERY_CD: "1111",
      P_RDELIVERY_CD: "1111",
      P_DELIVERY_TYPE2: $NC.G_VAR.masterData.DELIVERY_TYPE2,
      P_BU_DATE: $NC.G_VAR.masterData.BU_DATE,
      P_BU_NO: $NC.G_VAR.masterData.BU_NO,
      P_REMARK1: $NC.G_VAR.masterData.REMARK1,
      P_CRUD: $NC.G_VAR.masterData.CRUD
    }),
    P_DS_DETAIL: $NC.toJson(detailDS),
    P_DS_SUB: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.subData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.subData.BU_CD,
      P_ORDER_DATE: $NC.G_VAR.subData.ORDER_DATE,
      P_ORDER_NO: $NC.G_VAR.subData.ORDER_NO,
      P_MALL_MSG: $NC.G_VAR.subData.MALL_MSG,
      P_ORDERER_CD: $NC.G_VAR.subData.ORDERER_CD,
      P_ORDERER_NM: $NC.G_VAR.subData.ORDERER_NM,
      P_ORDERER_TEL: $NC.G_VAR.subData.ORDERER_TEL,
      P_ORDERER_HP: $NC.G_VAR.subData.ORDERER_HP,
      P_ORDERER_EMAIL: $NC.G_VAR.subData.ORDERER_EMAIL,
      P_ORDERER_MSG: $NC.G_VAR.subData.ORDERER_MSG,
      P_SHIPPER_NM: $NC.G_VAR.subData.SHIPPER_NM,
      P_SHIPPER_TEL: $NC.G_VAR.subData.SHIPPER_TEL,
      P_SHIPPER_HP: $NC.G_VAR.subData.SHIPPER_HP,
      P_SHIPPER_ZIP_CD: $NC.G_VAR.subData.SHIPPER_ZIP_CD,
      P_SHIPPER_ADDR_BASIC: $NC.G_VAR.subData.SHIPPER_ADDR_BASIC,
      P_SHIPPER_ADDR_DETAIL: $NC.G_VAR.subData.SHIPPER_ADDR_DETAIL,
      P_GIFT_WRAP_YN: $NC.G_VAR.subData.GIFT_WRAP_YN,
      P_CARD_MSG: $NC.G_VAR.subData.CARD_MSG,
      P_CARD_FROM: $NC.G_VAR.subData.CARD_FROM,
      P_CARD_TO: $NC.G_VAR.subData.CARD_TO,
      P_REMARK1: "",
      P_CRUD: $NC.G_VAR.subData.CRUD
    }),
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
  case "DELIVERY_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      var CUST_CD = $NC.getValue("#edtCust_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_DELIVERY_CD: args.val,
        P_DELIVERY_DIV: "92", // 92 - 온라인몰
        P_VIEW_DIV: "1"
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
  case "MALL_BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      var BU_CD = $NC.getValue("#edtBu_Cd");
      var MALL_CD = $NC.getValue("#cboMall_Cd");
      if ($NC.isNull(MALL_CD)) {
        alert("먼저 몰구분을 선택하십시오.");
        $NC.setFocus("#cboMall_Cd");
        return;
      }
      P_QUERY_PARAMS = {
        P_BU_CD: BU_CD,
        P_MALL_CD: MALL_CD,
        P_BRAND_CD: args.val
      };
      O_RESULT_DATA = $NP.getMallBrandInfo({
        queryParams: P_QUERY_PARAMS,
        errorMessage: "MALL과 해당 판매사로 등록된 딜이 없습니다."
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onMallBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showMallBrandPopup({
        title: "판매사 검색",
        columnTitle: ["판매사코드", "판매사명"],
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onMallBrandPopup, onMallBrandPopup);
    }
    return;
  case "SHIPPER_ZIP_CD":
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
  case "INOUT_CD":
    $NC.G_VAR.masterData.INOUT_CD = args.val;
    break;
  case "DELIVERY_ROUTE":
    $NC.G_VAR.masterData.DELIVERY_TYPE2 = args.val;
    break;
  case "ORDER_DIV":
    $NC.G_VAR.masterData.ORDER_DIV = args.val;
    break;
  case "MALL_CD":
    $NC.G_VAR.masterData.MALL_CD = args.val;
    break;
  case "INORDER_TYPE":
    $NC.G_VAR.masterData.INORDER_TYPE = args.val;
    break;
  case "SHIP_TYPE":
    $NC.G_VAR.masterData.SHIP_TYPE = args.val;
    break;
  case "SHIP_PRICE_TYPE":
    $NC.G_VAR.masterData.SHIP_PRICE_TYPE = args.val;
    break;
  case "SHIP_PRICE":
    $NC.G_VAR.masterData.SHIP_PRICE = args.val;
    break;
  case "DELIVERY_TYPE":
    $NC.G_VAR.masterData.DELIVERY_TYPE = args.val;
    break;
  case "BU_DATE":
    $NC.setValueDatePicker(args.view, args.val, "전표일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.BU_DATE = $NC.getValue("#dtpBu_Date");
    break;
  case "BU_NO":
    $NC.G_VAR.masterData.BU_NO = args.val;
    break;
  case "ORDER_DATE":
    $NC.setValueDatePicker(args.view, args.val, "예정일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.ORDER_DATE = $NC.getValue("#dtpOrder_Date");

    $NC.G_VAR.subData.ORDER_DATE = $NC.G_VAR.masterData.ORDER_DATE;
    if ($NC.G_VAR.subData.CRUD === "R") {
      $NC.G_VAR.subData.CRUD = "U";
    }
    break;
  case "REMARK1":
    $NC.G_VAR.masterData.REMARK1 = args.val;
    break;
  }

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }

}

function subDataOnChange(e, args) {

  // 온라인 데이터 변경에 대한 처리만 추가
  // Popup, DatePicker 같은 것이 없으므로 해당 값만 입력하도록 처리
  switch (args.col) {
  case "MALL_MSG":
  case "ORDERER_CD":
  case "ORDERER_NM":
  case "ORDERER_TEL":
  case "ORDERER_HP":
  case "ORDERER_EMAIL":
  case "ORDERER_MSG":
  case "SHIPPER_NM":
  case "SHIPPER_TEL":
  case "SHIPPER_HP":
  case "SHIPPER_ZIP_CD":
  case "SHIPPER_ADDR_BASIC":
  case "SHIPPER_ADDR_DETAIL":
  case "GIFT_WRAP_YN":
  case "CARD_MSG":
  case "CARD_FROM":
  case "CARD_TO":
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
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 100,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdDetailOnPopup,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_ID",
    field: "OPTION_ID",
    name: "옵션ID",
    minWidth: 130,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdDetailOnPopup,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션명",
    minWidth: 120
  });
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
    id: "OPTION_QTY",
    field: "OPTION_QTY",
    name: "옵션수량",
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
  $NC.setGridColumn(columns, {
    id: "ORDER_BOX",
    field: "ORDER_BOX",
    name: "예정BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_EA",
    field: "ORDER_EA",
    name: "예정EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  // 정책에 따른 컬럼 표시
  if ($NC.G_VAR.userData.P_POLICY_LO250 == "2") {
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
    id: "SUPPLY_PRICE",
    field: "SUPPLY_PRICE",
    name: "공급단가",
    minWidth: 100,
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
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VAT_AMT",
    field: "VAT_AMT",
    name: "부가세액",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_AMT",
    field: "DC_AMT",
    name: "할인금액",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_ORDER_DIV_F",
    field: "ITEM_ORDER_DIV_F",
    name: "상품주문유형",
    minWidth: 100,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "ITEM_ORDER_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "ITEM_ORDER_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
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

  // $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("DEAL_ID"), true);
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
  if ($NC.G_VAR.userData.P_POLICY_LO110 !== "Y") {
    return false;
  }

  var rowData = args.item;

  if (args.column.field === "OPTION_ID") {
    if (!rowData.DEAL_ID) {
      alert("딜ID를 먼저 입력해야 합니다.");
      $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("DEAL_ID"), true);
      return false;
    }
  }

  if (args.column.field === "ITEM_CD") {

    if (!rowData.DEAL_ID) {
      alert("딜ID와 옵션ID를 먼저 입력해야 합니다.");
      $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("DEAL_ID"), true);
      return false;
    }
    if (!rowData.OPTION_ID) {
      alert("딜ID와 옵션ID를 먼저 입력해야 합니다.");
      $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("OPTION_ID"), true);
      return false;
    }

    return true;
//    return $NC.isNull(rowData.LINE_NO);
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
  var BRAND_CD = $NC.getValue("#edtMall_Brand_Cd");
  var MALL_CD = $NC.getValue("#cboMall_Cd");
  
  switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
  case "DEAL_ID":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.DEAL_ID)) {
      P_QUERY_PARAMS = {
        P_BU_CD: rowData.BU_CD,
        P_MALL_CD: MALL_CD,
        P_BRAND_CD: BRAND_CD,
        P_DEAL_ID: rowData.DEAL_ID,
        P_VIEW_DIV: "1"
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
  case "OPTION_ID":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (rowData.OPTION_ID == "00"){
      rowData.OPTION_VALUE = "이벤트 상품";
      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDDETAIL.data.updateItem(rowData.id, rowData);
      // 수정 상태로 변경
      G_GRDDETAIL.lastRowModified = true;
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
    } else if (rowData.OPTION_ID == "99"){
      rowData.OPTION_VALUE = "CS 상품";
      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDDETAIL.data.updateItem(rowData.id, rowData);
      // 수정 상태로 변경
      G_GRDDETAIL.lastRowModified = true;
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
    } else {
      if (!$NC.isNull(rowData.OPTION_ID)) {
        P_QUERY_PARAMS = {
          P_BU_CD: rowData.BU_CD,
          P_MALL_CD: MALL_CD,
          P_DEAL_ID: rowData.DEAL_ID,
          P_OPTION_ID: rowData.OPTION_ID
        };
        O_RESULT_DATA = $NP.getDealOptionInfo({
          queryParams: P_QUERY_PARAMS
        });
      }
      if (O_RESULT_DATA.length <= 1) {
        onDealOptionPopup(O_RESULT_DATA[0]);
      } else {
        $NP.showDealOptionPopup({
          queryParams: P_QUERY_PARAMS,
          queryData: O_RESULT_DATA
        }, onDealOptionPopup, onDealOptionPopup);
      }
    }
    return;
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (rowData.OPTION_ID == "00" || rowData.OPTION_ID == "99"){
      if (!$NC.isNull(rowData.ITEM_CD)) {
        P_QUERY_PARAMS = {
            P_BU_CD: rowData.BU_CD,
            P_BRAND_CD: "%",
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
    } else {
      if (!$NC.isNull(rowData.ITEM_CD)) {
        P_QUERY_PARAMS = {
          P_BU_CD: rowData.BU_CD,
          P_MALL_CD: MALL_CD,
          P_BRAND_CD: BRAND_CD,
//          P_BRAND_CD: "%",
          P_DEAL_ID: rowData.DEAL_ID,
          P_OPTION_ID: rowData.OPTION_ID,
          P_ITEM_CD: rowData.ITEM_CD,
          P_VIEW_DIV: "1"
        };
        O_RESULT_DATA = $NP.getDealItemInfo({
          queryParams: P_QUERY_PARAMS
        });
      }
      if (O_RESULT_DATA.length <= 1) {
        onItemPopup(O_RESULT_DATA[0]);
      } else {
        $NP.showDealItemPopup({
          queryParams: P_QUERY_PARAMS,
          queryData: O_RESULT_DATA
        }, onItemPopup, onItemPopup);
      }
    }
    return;
    /*
    case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.ITEM_CD)) {
      P_QUERY_PARAMS = {
          P_BU_CD: rowData.BU_CD,
          P_BRAND_CD: "%",
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
    */
  case "ITEM_STATE_F":
    gridDetailCheckPSTOCK(args.row, null);
    break;
  /*
  case "ITEM_LOT":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.ITEM_LOT)) {
      P_QUERY_PARAMS = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT
      };
      O_RESULT_DATA = $NP.getItemLotInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemLotPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemLotPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemLotPopup, onItemLotPopup);
    }
    gridDetailCheckPSTOCK(args.row, null);
    return;
    */
  case "ORDER_QTY":
    rowData = grdDetailOnCalc(rowData);
    gridDetailCheckPSTOCK(args.row, true);
    break;
  case "VALID_DATE":
    if (!$NC.isNull(rowData.VALID_DATE)) {
      if (!$NC.isDate(rowData.VALID_DATE)) {
        alert("유통기한을 정확히 입력하십시오.");
        rowData.VALID_DATE = "";
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: args.row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("VALID_DATE"),
          editMode: true
        });
        return false;
      } else {
        rowData.VALID_DATE = $NC.getDate(rowData.VALID_DATE);
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
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

    if ($NC.isNull(rowData.DEAL_ID)) {
      alert("딜ID를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("DEAL_ID"),
        editMode: true
      });
      return false;
    }

    if ($NC.isNull(rowData.OPTION_ID)) {
      alert("딜옵션ID를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("OPTION_ID"),
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

  var BRAND_CD = $NC.getValue("#edtMall_Brand_Cd");
  var MALL_CD = $NC.getValue("#cboMall_Cd");
  
  switch (args.column.field) {
  case "DEAL_ID":
    $NP.showDealPopup({
      P_BU_CD: rowData.BU_CD,
      P_MALL_CD: MALL_CD,
      P_BRAND_CD: BRAND_CD,
      P_DEAL_ID: "%",
      P_VIEW_DIV: "1"
    }, onDealPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("DEAL_ID"), true, true);
    });
    break;
  case "OPTION_ID":
      $NP.showDealOptionPopup({
        P_BU_CD: rowData.BU_CD,
        P_MALL_CD: MALL_CD,
        P_DEAL_ID: rowData.DEAL_ID,
        P_OPTION_ID: "%"
      }, onDealOptionPopup, function() {
        $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("OPTION_ID"), true, true);
      });
    break;
  /*
  case "ITEM_CD":
  $NP.showItemPopup({
    P_BU_CD: rowData.BU_CD,
    P_BRAND_CD: "%",
    P_ITEM_CD: "%",
    P_VIEW_DIV: "1",
    P_DEPART_CD: "%",
    P_LINE_CD: "%",
    P_CLASS_CD: "%"
  }, onItemPopup, function() {
    $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
  });
  break;
  */
  case "ITEM_CD":
    if (rowData.OPTION_ID == "00" || rowData.OPTION_ID == "99"){
      $NP.showItemPopup({
        P_BU_CD: rowData.BU_CD,
        P_BRAND_CD: "%",
        P_ITEM_CD: "%",
        P_VIEW_DIV: "1",
        P_DEPART_CD: "%",
        P_LINE_CD: "%",
        P_CLASS_CD: "%"
      }, onItemPopup, function() {
        $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
      });
    } else {
      $NP.showDealItemPopup({
        P_BU_CD: rowData.BU_CD,
        P_MALL_CD: MALL_CD,
        P_BRAND_CD: BRAND_CD,
//        P_BRAND_CD: "%",
        P_DEAL_ID: rowData.DEAL_ID,
        P_OPTION_ID: rowData.OPTION_ID,
        P_ITEM_CD: "%",
        P_VIEW_DIV: "1"
      }, onItemPopup, function() {
        $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
      });
    }
//    $NP.showDealItemPopup({
//      P_BU_CD: rowData.BU_CD,
//      P_BRAND_CD: "%",
//      P_DEAL_ID: rowData.DEAL_ID,
//      P_OPTION_ID: rowData.OPTION_ID,
//      P_ITEM_CD: "%",
//      P_VIEW_DIV: "1"
//    }, onItemPopup, function() {
//      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
//    });
    break;
  case "ITEM_LOT":
    $NP.showItemLotPopup({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_BRAND_CD: rowData.BRAND_CD,
      P_ITEM_CD: rowData.ITEM_CD,
      P_ITEM_STATE: rowData.ITEM_STATE
    }, onItemLotPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_LOT"), true, true);
    });
    break;
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
  if ($NC.getValue("#rgbQView_Div2") == "2") {
    $NC.setGridColumn(columns, {
      id: "VALID_DATE",
      field: "VALID_DATE",
      name: "유통기한",
      minWidth: 90,
      cssClass: "align-center"
    });
    $NC.setGridColumn(columns, {
      id: "BATCH_NO",
      field: "BATCH_NO",
      name: "제조배치번호",
      minWidth: 100
    });
  }
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
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
      for (var row = 0; row < rowCount; row++) {
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
    }
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }

  G_GRDSTOCKSELMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSTOCKSELMASTER.lastRowModified = true;
}

function showDeliveryPopup() {

  var CUST_CD = $NC.getValue("#edtCust_Cd");

  $NP.showDeliveryPopup({
    title: "온라인몰 검색",
    columnTitle: ["온라인몰코드", "온라인몰명"],
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_DELIVERY_CD: "%",
      P_DELIVERY_DIV: "92", // 92 - 온라인몰
      P_VIEW_DIV: "1"
    }
  }, onDeliveryPopup, function() {
    $NC.setFocus("#edtDelivery_Cd", true);
  });
}

function onDeliveryPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.masterData.DELIVERY_CD = resultInfo.DELIVERY_CD;
    $NC.G_VAR.masterData.RDELIVERY_CD = resultInfo.DELIVERY_CD;
    $NC.setValue("#edtDelivery_Cd", resultInfo.DELIVERY_CD);
    $NC.setValue("#edtDelivery_Nm", resultInfo.DELIVERY_NM);
    $NC.setFocus("#edtOrderer_Nm", true);
  } else {
    $NC.G_VAR.masterData.DELIVERY_CD = "";
    $NC.G_VAR.masterData.RDELIVERY_CD = "";
    $NC.setValue("#edtDelivery_Cd");
    $NC.setValue("#edtDelivery_Nm");
    $NC.setFocus("#edtDelivery_Cd", true);
  }
  if ($NC.G_VAR.masterData.CRUD == "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}

/**
 * 우편번호 검색 팝업 표시
 */
function showPostPopup() {

  $NP.showPostPopup({
    queryParams: {
      P_ADDR_NM: "%"
    },
    queryCanAll: true
  }, onPostPopup, onPostPopup);
}

function onPostPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.subData.SHIPPER_ZIP_CD = resultInfo.ZIP_CD;
    $NC.G_VAR.subData.SHIPPER_ADDR_BASIC = resultInfo.ADDR_NM_REAL;
    $NC.setValue("#edtShipper_Zip_Cd", resultInfo.ZIP_CD);
    $NC.setValue("#edtShipper_Addr_Basic", resultInfo.ADDR_NM_REAL);
  }
  $NC.setFocus("#edtShipper_Addr_Detail", true);
  if ($NC.G_VAR.masterData.CRUD == "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}

/**
 * 그리드에서 상품 선택했을 경우 처리
 * 
 * @param seletedRowData
 */

function onItemPopup(resultInfo) {
  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.ITEM_CD = resultInfo.ITEM_CD;
    rowData.ITEM_NM = resultInfo.ITEM_NM;
    rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
    rowData.BRAND_CD = resultInfo.BRAND_CD;
    rowData.BRAND_NM = resultInfo.BRAND_NM;
    rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;
    rowData.BOX_WEIGHT = resultInfo.BOX_WEIGHT;
    rowData.SUPPLY_PRICE = resultInfo.SUPPLY_PRICE;
    rowData.DC_PRICE = 0;
    if ($NC.G_VAR.userData.P_POLICY_LO190 == "2") { // 공금금액 계산정책 기준
      rowData.APPLY_PRICE = rowData.SUPPLY_PRICE - rowData.DC_PRICE;
    } else {
      rowData.APPLY_PRICE = 0;
    }
    rowData.VAT_YN = resultInfo.VAT_YN;
    rowData.OPTION_QTY = resultInfo.DEAL_ITEM_QTY;
    rowData = grdDetailOnCalc(rowData);

    gridDetailCheckPSTOCK(G_GRDDETAIL.lastRow, null);
    focusCol = G_GRDDETAIL.view.getColumnIndex("ORDER_QTY");
  } else {
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";
    rowData.ITEM_SPEC = "";
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
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
    rowData.OPTION_QTY = 0;

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

/**
 * 그리드에서 딜 선택했을 경우 처리
 * 
 * @param seletedRowData
 */
function onDealPopup(resultInfo) {

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.DEAL_ID = resultInfo.DEAL_ID;
    rowData.DEAL_NM = resultInfo.DEAL_NM;
    rowData.OPTION_ID = "";
    rowData.OPTION_VALUE = "";
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";

    gridDetailCheckPSTOCK(G_GRDDETAIL.lastRow, null);
    focusCol = G_GRDDETAIL.view.getColumnIndex("OPTION_ID");
  } else {
    rowData.DEAL_ID = "";
    rowData.DEAL_NM = "";

    focusCol = G_GRDDETAIL.view.getColumnIndex("DEAL_ID");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
}

/**
 * 그리드에서 딜옵션 선택했을 경우 처리
 * 
 * @param seletedRowData
 */
function onDealOptionPopup(resultInfo) {

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.OPTION_ID = resultInfo.OPTION_ID;
    rowData.OPTION_VALUE = resultInfo.OPTION_VALUE;
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";

    gridDetailCheckPSTOCK(G_GRDDETAIL.lastRow, null);
    focusCol = G_GRDDETAIL.view.getColumnIndex("ITEM_CD");
  } else {
    rowData.OPTION_ID = "";
    rowData.OPTION_VALUE = "";

    focusCol = G_GRDDETAIL.view.getColumnIndex("OPTION_ID");
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
  
  if((!$NC.isNull(rowData.OPTION_QTY)) || (rowData.OPTION_QTY > 0)){
    rowData.ORDER_QTY = rowData.OPTION_QTY * rowData.ORDER_QTY;
  } else {
    rowData.ORDER_QTY = rowData.ORDER_QTY;    
  }

  var params = {
    ITEM_PRICE: rowData.SUPPLY_PRICE,// 매입단가 또는 공급단가
    APPLY_PRICE: rowData.APPLY_PRICE,// 적용단가
    ITEM_QTY: rowData.ORDER_QTY,// 상품수량
    ITEM_AMT: rowData.SUPPLY_AMT,// 매입금액 또는 공급금액
    VAT_YN: rowData.VAT_YN,// 과세여부가 NULL일 경우는 부가세금액이 있는지로 체크
    VAT_AMT: rowData.VAT_AMT,// 부가세
    DC_AMT: rowData.DC_AMT,// 할인금액
    TOTAL_AMT: rowData.TOTAL_AMT,// 합계금액
    POLICY_VAL: $NC.G_VAR.userData.P_POLICY_LO190
  };

  rowData.SUPPLY_AMT = $NC.getItem_Amt(params);
  rowData.VAT_AMT = $NC.getVat_Amt(params);
  rowData.TOTAL_AMT = $NC.getTotal_Amt(params);

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

function showStockSelOverlay(e) {

  // 마스터 정보 모두 입력 후 디테일 입력하도록 마스터 체크
//  if ($NC.isNull($NC.G_VAR.masterData.DELIVERY_CD)) {
//    alert("먼저 온라인몰 코드를 입력하십시오.");
//    $NC.setFocus("#edtDelivery_Cd");
//    return;
//  }

  if ($NC.isNull($NC.G_VAR.subData.ORDERER_NM)) {
    alert("먼저 주문자명을 입력하십시오.");
    $NC.setFocus("#edtOrderer_Nm");
    return;
  }

  if ($NC.isNull($NC.G_VAR.subData.ORDERER_HP)) {
    alert("먼저 주문자 휴대폰번호를 입력하십시오.");
    $NC.setFocus("#edtOrderer_Hp");
    return;
  }

  if ($NC.isNull($NC.G_VAR.subData.SHIPPER_NM)) {
    alert("먼저 수령자명을 입력하십시오.");
    $NC.setFocus("#edtShipper_Nm");
    return;
  }

  if ($NC.isNull($NC.G_VAR.subData.SHIPPER_HP)) {
    alert("먼저 수령자 휴대폰번호를 입력하십시오.");
    $NC.setFocus("#edtShipper_Hp");
    return;
  }

  if ($NC.isNull($NC.G_VAR.subData.SHIPPER_ZIP_CD) || $NC.isNull($NC.G_VAR.subData.SHIPPER_ADDR_BASIC)) {
    alert("먼저 수령자 주소를 입력하십시오.");
    $NC.setFocus("#edtShipper_Addr_Detail");
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

  $NC.setValue("#edtQItem_Cd");
  $NC.setValue("#edtQItem_Nm");
  $NC.setValue("#cboQItem_State", "A");

  // 초기화
  $NC.setInitGridVar(G_GRDSTOCKSELMASTER);
  $NC.setInitGridData(G_GRDSTOCKSELMASTER);

  clearTimeout($NC.G_VAR.onStockInfoViewTimeout);
  var divStockInfoPopup = $("#divStockSelInfoView").hide();
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
    $NC.setFocus("#edtQBrand_Cd");
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
  if (G_GRDSTOCKSELMASTER.lastRow != null) {
    if (row == G_GRDSTOCKSELMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

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
  for (var row = 0; row < G_GRDSTOCKSELMASTER.data.getLength(); row++) {
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
    G_GRDDETAIL.lastRow = null;
  }
  for ( var row in itemDs) {
    rowData = itemDs[row];

    rowData.DC_PRICE = 0;
    rowData.APPLY_PRICE = 0;
    if ($NC.G_VAR.userData.P_POLICY_RI190 == "2") {
      rowData.APPLY_PRICE = rowData.SUPPLY_PRICE;
    }
    rowData.SUPPLY_AMT = 0;
    rowData.VAT_YN = rowData.VAT_YN;
    rowData.VAT_AMT = 0;
    rowData.DC_AMT = 0;
    grdDetailOnCalc(rowData, rowData.INPUT_QTY);
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
      ORDER_BOX: $NC.getB_Box(rowData.INPUT_QTY, rowData.QTY_IN_BOX),
      ORDER_EA: $NC.getB_Ea(rowData.INPUT_QTY, rowData.QTY_IN_BOX),
      ORDER_WEIGHT: $NC.getWeight(rowData.INPUT_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT),
      ENTRY_QTY: 0,
      BOX_WEIGHT: rowData.BOX_WEIGHT,
      SUPPLY_PRICE: rowData.SUPPLY_PRICE,
      DC_PRICE: rowData.DC_PRICE,
      APPLY_PRICE: rowData.APPLY_PRICE,
      SUPPLY_AMT: rowData.SUPPLY_AMT,
      VAT_AMT: rowData.VAT_AMT,
      DC_AMT: 0,
      TOTAL_AMT: rowData.TOTAL_AMT,
      ITEM_ORDER_DIV: "01",
      ITEM_ORDER_DIV_F: $NC.getGridComboName(G_GRDDETAIL, {
        colFullNameField: "ITEM_ORDER_DIV_F",
        searchVal: "01",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
      BU_LINE_NO: "",
      BU_KEY: "",
      DEAL_ID: "",
      OPTION_ID: "",
      REMARK1: "",
      VAT_YN: rowData.VAT_YN,
      CHK: Number(rowData.PSTOCK_QTY) < Number(rowData.INPUT_QTY) ? "N" : "Y",
      id: $NC.getGridNewRowId(),
      CRUD: "C"
    };
    G_GRDDETAIL.data.addItem(newRowData);
  }
  $NC.setGridSelectRow(G_GRDDETAIL, rowCount);
  $NC.setGridDisplayRows("#grdDetail", rowCount + 1, G_GRDDETAIL.data.getLength());

  // 예정수량과 가용재고량과 비교하기 위해 아래 로직 추가
  for (var row = 0; row < G_GRDDETAIL.data.getLength(); row++) {
    gridDetailCheckPSTOCK(row, true);
  }

  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;

  $("#divStockSelInfoView").hide();

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
    $NC.serviceCallAndWait("/LOM1010E/callSP.do", {
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
              rowData.CHK = "N"; // 'N'이면 출고 가능량 부족.
            } else {
              rowData.CHK = "Y"; // 'Y'이면 출고 가능량 만족.
            }
            G_GRDDETAIL.data.updateItem(rowData.id, rowData);

            $NC.setValue("#edtStock_Qty", $NC.getDisplayNumber(resultData.O_STOCK_QTY));
            //$NC.setValue("#edtVirtual_Qty", $NC.getDisplayNumber(resultData.O_VIRTUAL_QTY));
            $NC.setValue("#edtOut_Wait_Qty", $NC.getDisplayNumber(resultData.O_OUT_WAIT_QTY));
            $NC.setValue("#edtPstock_Qty", $NC.getDisplayNumber(resultData.O_PSTOCK_QTY));

          } else {
            if (isCheckOnly) {
              if (Number(resultData.O_PSTOCK_QTY) < Number(rowData.ORDER_QTY)) {
                rowData.CHK = "N"; // 'N'이면 출고 가능량 부족.
              } else {
                rowData.CHK = "Y"; // 'Y'이면 출고 가능량 만족.
              }
              G_GRDDETAIL.data.updateItem(rowData.id, rowData);
            } else {
              $NC.setValue("#edtStock_Qty", $NC.getDisplayNumber(resultData.O_STOCK_QTY));
            //  $NC.setValue("#edtVirtual_Qty", $NC.getDisplayNumber(resultData.O_VIRTUAL_QTY));
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
   // $NC.setValue("#edtVirtual_Qty");
    $NC.setValue("#edtOut_Wait_Qty");
    $NC.setValue("#edtPstock_Qty");
  }
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
  onChangingCondition();
}

/**
 * MALL 브랜드 검색 팝업 클릭
 */

function showMallBrandPopup() {

  var BU_CD = $NC.getValue("#edtBu_Cd");
  var MALL_CD = $NC.getValue("#cboMall_Cd");
  if ($NC.isNull(MALL_CD)) {
    alert("먼저 몰구분을 선택하십시오.");
    $NC.setFocus("#cboMall_Cd");
    return;
  }

  $NP.showMallBrandPopup({
    P_BU_CD: BU_CD,
    P_MALL_CD:  MALL_CD,   
    P_BRAND_CD: '%'
  }, onMallBrandPopup, function() {
    $NC.setFocus("#edtMall_Brand_Cd", true);
  });
}

/**
 * MALL 브랜드 검색 결과
 * 
 * @param seletedRowData
 */

function onMallBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    
    $NC.G_VAR.masterData.MALL_BRAND_CD = resultInfo.BRAND_CD;
    $NC.setValue("#edtMall_Brand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtMall_Brand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.G_VAR.masterData.MALL_BRAND_CD = "";
    $NC.setValue("#edtMall_Brand_Cd");
    $NC.setValue("#edtMall_Brand_Nm");
    $NC.setFocus("#edtMall_Brand_Cd", true);
  }
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

  onChangingCondition();
}

function onItemLotPopup(resultInfo) {

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.ITEM_LOT = resultInfo.ITEM_LOT;
    gridDetailCheckPSTOCK(G_GRDDETAIL.lastRow, null);
    focusCol = G_GRDDETAIL.view.getColumnIndex("ORDER_QTY");
  } else {
    rowData.ITEM_LOT = "";
    focusCol = G_GRDDETAIL.view.getColumnIndex("ITEM_LOT");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
}

/**
 * [제고에서선택] 팝업의 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDSTOCKSELMASTER);
}