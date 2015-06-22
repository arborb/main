/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 예정이 존재하는 데이터인지...
    existOrder: false,
    // 마스터 데이터
    masterData: null,
    subData: null,
    canInsert: true,
    canDelete: true
  });

  $NC.setInitDatePicker("#dtpOutbound_Date");

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
  
  
 
  
  
  

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel);
  
  $("#btnBrand_Cd").click(showOwnBranPopup);
  $("#btnDelivery_Zip_Cd").click(showPostPopup);

  $("#btnEntryNew").click(_New);
  $("#btnEntryDelete").click(_Delete);
  $("#btnEntrySave").click(_Save);

  $("#btnStockPopup").click(showStockSelOverlay);// 재고에서 선택버튼 클릭
  $("#btnStockSearch").click(_Inquiry); // 재고팝업에서 조회버튼클릭
  $("#btnStockSel").click(addItemToGrid); // 재고팝업에서 확인버튼클릭
  $("#btnStockSelClose").click(function() { // 재고에서 선택 창 닫기
    $("#divStockSelInfoView").hide();
  });

  $("#btnQBrand_Cd").click(showBuBrandStockPopup); // 브랜드검색 버튼 클릭
  $("#btnQItem_Cd").click(showItemStockPopup); // 상품검색 버튼 클릭

  $("#btnStockView").click(showStockOverlay); // 출고대기량 조회 버튼 클릭

  // 그리드 초기화
  grdDetailInitialize();
  grdStockMasterInitialize();
  grdStockSelMasterInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setEnable("#edtQBrand_Cd", false);
  // 반출등록 전표생성 가능여부 N -> 반출등록시 신규, 수정 불가능
  if ($NC.G_VAR.userData.P_POLICY_RO210 !== "Y") {
    $NC.setEnable("#btnEntryNew", false);
    $NC.setEnable("#btnEntryDelete", false);
    $NC.setEnable("#btnEntrySave", false);
  }

  if (!$NC.isNull($NC.G_VAR.userData.P_POLICY_RO221)) {
    $NC.G_VAR.canInsert = ($NC.G_VAR.userData.P_POLICY_RO221.substr(0, 1) == "Y");
    $NC.G_VAR.canDelete = ($NC.G_VAR.userData.P_POLICY_RO221.substr(1, 1) == "Y");
  }

  $NC.setEnable("#btnStockPopup", $NC.G_VAR.canInsert);

  var isDisable = false;
  $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
  $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);
  $NC.setValue("#edtCust_Cd", $NC.G_VAR.userData.P_CUST_CD);

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {

    var OUTBOUND_DATE = $NC.getValue("#dtpOutbound_Date");
    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      OUTBOUND_DATE: OUTBOUND_DATE,
      OUTBOUND_NO: "",
      INOUT_CD: "",
      OUTBOUND_STATE: "20",
      CUST_CD: $NC.G_VAR.userData.P_CUST_CD,
      SHIP_TYPE:"1",
      CAR_NO: "",
      REMARK1: "",
      ORDER_DATE: "",
      ORDER_NO: "",
      PLANED_DATETIME: "",
      CARRIER_DIV:"",
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
      OUTBOUND_DATE: OUTBOUND_DATE,
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

    $NC.setFocus("#edtBrand_Cd");
  } else {
    // 마스터 disable여부 설정
    isDisable = true;

    // 예정 -> 등록, 등록 수정
    var OUTBOUND_DATE;
    var OUTBOUND_NO;
    var CRUD = "R";
    var masterDS = $NC.G_VAR.userData.P_MASTER_DS;
    if ($NC.G_VAR.userData.P_PROCESS_CD === "A") {
      OUTBOUND_DATE = $NC.getValue("#dtpOutbound_Date");
      OUTBOUND_NO = "";
      CRUD = "C";
    } else {
      OUTBOUND_DATE = masterDS.OUTBOUND_DATE;
      OUTBOUND_NO = masterDS.OUTBOUND_NO;
      CRUD = "R";
      $NC.setValue("#dtpOutbound_Date", OUTBOUND_DATE);
      $NC.setValue("#edtOutbound_No", OUTBOUND_NO);
    }

    // 마스터 데이터 세팅
    $NC.setValue("#edtVendor_Nm", masterDS.VENDOR_NM);
    $NC.setValue("#cboTrans_Div", masterDS.SHIP_TYPE);
    $NC.setValue("#edtOrder_Date", masterDS.ORDER_DATE);
    $NC.setValue("#edtOrder_No", masterDS.ORDER_NO);
    $NC.setValue("#edtBu_Date", masterDS.BU_DATE);
    $NC.setValue("#edtBu_No", masterDS.BU_NO);
    $NC.setValue("#edtBrand_Cd", $NC.G_VAR.userData.P_BRAND_CD);
    $NC.setValue("#edtBrand_Nm", $NC.G_VAR.userData.P_BRAND_NM);

    $NC.setValue("#edtDelivery_Nm", masterDS.SHIPPER_NM);
    $NC.setValue("#edtDelivery_Tel", masterDS.SHIPPER_TEL);
    $NC.setValue("#edtDelivery_Tel1", masterDS.SHIPPER_TEL);
    $NC.setValue("#edtDelivery_Hp", masterDS.SHIPPER_HP);
    $NC.setValue("#edtDelivery_Hp1", masterDS.SHIPPER_HP);
    
    $NC.setValue("#cboInout_Cd", masterDS.INOUT_CD);
    $NC.setValue("#edtDelivery_Addr_Basic01", masterDS.SHIPPER_ADDR_BASIC1);
    $NC.setValue("#edtDelivery_Addr_Detail01", masterDS.SHIPPER_ADDR_DETAIL1);
    $NC.setValue("#edtDelivery_Addr_Basic", masterDS.SHIPPER_ADDR_BASIC1);
    $NC.setValue("#edtDelivery_Addr_Detail",masterDS.SHIPPER_ADDR_DETAIL1);
    $NC.setValue("#edtDelivery_Zip_Cd", masterDS.SHIPPER_ZIP_CD);
    $NC.setValue("#edtCarrier_Price", masterDS.SHIP_PRICE);
    $NC.setValue("#cboCarrier_Div", masterDS.SHIP_PRICE_TYPE);
    $NC.setValue("#cboCarrier_Cd", masterDS.ENTRY_CARRIER_CD);
    $NC.setValue("#edtWb_No", masterDS.ENTRY_WB_NO);

    $NC.getValue("#cboRefund_Price_Type", masterDS.REFUND_SHIP_PRICE_CD);
    
    $NC.setValue("#edtRemark1", masterDS.REMARK1);

    $NC.G_VAR.masterData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      OUTBOUND_DATE: OUTBOUND_DATE,
      OUTBOUND_NO: OUTBOUND_NO,
      INOUT_CD: masterDS.INOUT_CD,
      OUTBOUND_STATE: "20",
      CUST_CD: masterDS.CUST_CD,
      SHIP_TYPE: masterDS.SHIP_TYPE,
      REMARK1: masterDS.REMARK1,
      ORDER_DATE: masterDS.ORDER_DATE,
      ORDER_NO: masterDS.ORDER_NO,
      PLANED_DATETIME: masterDS.PLANED_DATETIME,
      CARRIER_DIV: masterDS.SHIP_PRICE_TYPE,
      CARRIER_PRICE: masterDS.SHIP_PRICE,
      ENTRY_CARRIER_CD: masterDS.ENTRY_CARRIER_CD,
      ENTRY_WB_NO: masterDS.ENTRY_WB_NO,
      REFUND_SHIP_PRICE_CD:masterDS.REFUND_SHIP_PRICE_CD,
      CRUD: CRUD
    };
    
    // 온라인 데이터 세팅
    $NC.G_VAR.subData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      OUTBOUND_DATE: OUTBOUND_DATE,
      OUTBOUND_NO: OUTBOUND_NO,
      DELIVERY_NM: masterDS.SHIPPER_NM,
      DELIVERY_TEL: masterDS.SHIPPER_TEL,
      DELIVERY_HP: masterDS.SHIPPER_HP,
      DELIVERY_TEL1: masterDS.SHIPPER_TEL1,
      DELIVERY_HP1: masterDS.SHIPPER_HP1,
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
      if ($NC.G_VAR.userData.P_PROCESS_CD === "A") {
        for ( var row in detailDS) {
          rowData = detailDS[row];
          var ORDER_QTY = Number(rowData.ORDER_QTY);
          if (ORDER_QTY > 0) {
            var newRowData = {
              CENTER_CD: rowData.CENTER_CD,
              BU_CD: rowData.BU_CD,
              OUTBOUND_DATE: rowData.OUTBOUND_DATE,
              OUTBOUND_NO: rowData.OUTBOUND_NO,
              LINE_NO: "",
              OUTBOUND_STATE: "20",
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
              ORDER_QTY: ORDER_QTY,
              ENTRY_QTY: ORDER_QTY,
              OLD_ENTRY_QTY: 0,
              ENTRY_BOX: $NC.getB_Box(ORDER_QTY, rowData.QTY_IN_BOX),
              ENTRY_EA: $NC.getB_Ea(ORDER_QTY, rowData.QTY_IN_BOX),
              CONFIRM_QTY: ORDER_QTY,
              BOX_WEIGHT: rowData.BOX_WEIGHT,
              ENTRY_WEIGHT: $NC.getWeight(ORDER_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT),
              SUPPLY_PRICE: rowData.SUPPLY_PRICE,
              DC_PRICE: rowData.DC_PRICE,
              APPLY_PRICE: rowData.APPLY_PRICE,
              SUPPLY_AMT: rowData.SUPPLY_AMT,
              VAT_AMT: rowData.VAT_AMT,
              DC_AMT: rowData.DC_AMT,
              TOTAL_AMT: rowData.TOTAL_AMT,
              RETURN_DIV: rowData.RETURN_DIV,
              RETURN_DIV_F: rowData.RETURN_DIV_F,
              RETURN_COMMENT: rowData.RETURN_COMMENT,
              ORDER_DATE: rowData.ORDER_DATE,
              ORDER_NO: rowData.ORDER_NO,
              ORDER_LINE_NO: rowData.ORDER_LINE_NO,
              // 예정데이터에는 전표일자,전표번호 없으므로 마스터 취득
              BU_DATE: masterDS.BU_DATE,
              BU_NO: masterDS.BU_NO,
              CHK: "Y",
              SUM_ENTRY_QTY: 0,
              BU_LINE_NO: rowData.BU_LINE_NO,
              BU_KEY: rowData.BU_KEY,
              REMARK1: rowData.REMARK1,
              id: $NC.getGridNewRowId(),
              CRUD: CRUD
            };
            G_GRDDETAIL.data.addItem(newRowData);
          }
        }
      } else {
        for( var row in detailDS) {
          rowData = detailDS[row];
          var newRowData = {
            CENTER_CD: rowData.CENTER_CD,
            BU_CD: rowData.BU_CD,
            OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            OUTBOUND_NO: rowData.OUTBOUND_NO,
            LINE_NO: rowData.LINE_NO,
            OUTBOUND_STATE: "20",
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
            ENTRY_QTY: rowData.ENTRY_QTY,
            OLD_ENTRY_QTY: rowData.ENTRY_QTY,
            ENTRY_BOX: rowData.ENTRY_BOX,
            ENTRY_EA: rowData.ENTRY_EA,
            CONFIRM_QTY: rowData.CONFIRM_QTY,
            BOX_WEIGHT: rowData.BOX_WEIGHT,
            ENTRY_WEIGHT: $NC.getWeight(rowData.ENTRY_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT),
            SUPPLY_PRICE: rowData.SUPPLY_PRICE,
            DC_PRICE: rowData.DC_PRICE,
            APPLY_PRICE: rowData.APPLY_PRICE,
            SUPPLY_AMT: rowData.SUPPLY_AMT,
            VAT_AMT: rowData.VAT_AMT,
            DC_AMT: rowData.DC_AMT,
            TOTAL_AMT: rowData.TOTAL_AMT,
            RETURN_DIV: rowData.RETURN_DIV,
            RETURN_DIV_F: rowData.RETURN_DIV_F,
            RETURN_COMMENT: rowData.RETURN_COMMENT,
            ORDER_DATE: rowData.ORDER_DATE,
            ORDER_NO: rowData.ORDER_NO,
            ORDER_LINE_NO: rowData.ORDER_LINE_NO,
            BU_DATE: rowData.BU_DATE,
            BU_NO: rowData.BU_NO,
            BU_LINE_NO: rowData.BU_LINE_NO,
            BU_KEY: rowData.BU_KEY,
            REMARK1: rowData.REMARK1,
            SUM_ENTRY_QTY: 0,
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

    $NC.G_VAR.existOrder = !$NC.isNull($NC.getValue("#edtOrder_No"));

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
  // 조회조건 - 반출구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "D3",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F"
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
  // 검색구분에 초기값 설정
  $NC.setEnable("#rgbQView_Div2", $NC.G_VAR.userData.P_POLICY_RO250 == "2");
  $NC.setValue("#rgbQView_Div1", true);

  setMasterDisable(isDisable);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.stockMasterViewWidth = 650;
  $NC.G_OFFSET.masterViewHeight = 325;
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

  // Grid 높이 조정
  $NC.resizeGrid("#grdDetail", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - $NC.G_LAYOUT.header
      - $NC.G_OFFSET.stockViewHeight - $NC.G_LAYOUT.margin1);
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
    if (rowData.ITEM_CD === "" || rowData.ITEM_STATE === "" || rowData.ITEM_LOT === "") {
      return;
    }
    // 데이터 조회
    $NC.serviceCall("/RO02010E/callSP.do", {
      P_QUERY_ID: "WF.GET_RO_PSTOCK_QTY",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_POLICY_LO310: "",
        P_POLICY_LO320: "",
        P_OUTBOUND_DATE: $NC.isNull($NC.getValue("#edtOutbound_No")) ? "" : $NC.getValue("#dtpOutbound_Date"),
        P_OUTBOUND_NO: $NC.isNull($NC.getValue("#edtOutbound_No")) ? "" : $NC.getValue("#edtOutbound_No")
      })
    }, function(ajaxData) {

      var resultData = $NC.toArray(ajaxData);
      if (!$NC.isNull(resultData)) {

        var pstock_qty = Number(resultData.O_PSTOCK_QTY);
        var out_wait_qty = Number(resultData.O_OUT_WAIT_QTY);

        // 추가
        var optionsSum = {
          searchKey: ["ITEM_CD", "ITEM_STATE", "ITEM_LOT", "CRUD"],
          searchVal: [rowData.ITEM_CD, rowData.ITEM_STATE, rowData.ITEM_LOT, ["C", "N", "R", "U"]],
          sumKey: "ENTRY_QTY",
          isAllData: false
        };
        var sumEntry_Qty = $NC.getGridSumVal(G_GRDDETAIL, optionsSum);

        if (resultData.O_MSG === "OK") {
          rowData.SUM_ENTRY_QTY = sumEntry_Qty;
          if (isCheckOnly == null || isCheckOnly == undefined) {
            if (pstock_qty < Number(sumEntry_Qty)) {
              rowData.CHK = "N"; // 'N'이면 출고 가능량 부족.
            } else {
              rowData.CHK = "Y"; // 'Y'이면 출고 가능량 만족.
            }
            G_GRDDETAIL.data.updateItem(rowData.id, rowData);

            $NC.setValue("#edtStock_Qty", $NC.getDisplayNumber(resultData.O_STOCK_QTY));
            $NC.setValue("#edtVirtual_Qty", $NC.getDisplayNumber(resultData.O_VIRTUAL_QTY));
            $NC.setValue("#edtOut_Wait_Qty", $NC.getDisplayNumber(out_wait_qty));
            $NC.setValue("#edtPstock_Qty", $NC.getDisplayNumber(pstock_qty));

          } else {
            if (isCheckOnly) {
              if (pstock_qty < Number(sumEntry_Qty)) {
                rowData.CHK = "N"; // 'N'이면 출고 가능량 부족.
              } else {
                rowData.CHK = "Y"; // 'Y'이면 출고 가능량 만족.
              }
              G_GRDDETAIL.data.updateItem(rowData.id, rowData);
            } else {
              $NC.setValue("#edtStock_Qty", $NC.getDisplayNumber(resultData.O_STOCK_QTY));
              $NC.setValue("#edtVirtual_Qty", $NC.getDisplayNumber(resultData.O_VIRTUAL_QTY));
              $NC.setValue("#edtOut_Wait_Qty", $NC.getDisplayNumber(out_wait_qty));
              $NC.setValue("#edtPstock_Qty", $NC.getDisplayNumber(pstock_qty));
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

// 수정일 경우 입력불가 항목 비활성화 처리
function setMasterDisable(isDisable) {

  // 수정일 경우 입력불가 항목 비활성화 처리
  if ($NC.G_VAR.userData.P_PROCESS_CD === "B") {
    $NC.setEnable("#dtpOutbound_Date", false);
  }

  $NC.setEnable("#cboInout_Cd", !isDisable);
  $NC.setEnable("#cboTrans_Div", !isDisable);
  $NC.setEnable("#cboCarrier_Div", !isDisable);
  $NC.setEnable("#cboCarrier_Cd", !isDisable);
  $NC.setEnable("#edtCarrier_Price", !isDisable);
  $NC.setEnable("#edtBrand_Cd", !isDisable);
  $NC.setEnable("#edtWb_No", !isDisable);
  $NC.setEnable("#cboRefund_Ship_Price_Cd", !isDisable);
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
  $NC.serviceCall("/RO02010E/getDataSet.do", $NC.getGridParams(G_GRDSTOCKSELMASTER), onGetStockSelMaster);
}

/**
 * 신규
 */
function _New() {

  // 예정으로 등록시 추가 허용 체크
  if (!$NC.isNull($NC.getValue("#edtOrder_Date")) && !$NC.G_VAR.canInsert) {
    alert("해당 사업부에서는 신규 추가처리를 하실수 없습니다. \n사업부정책(RO221)을 확인하십시오.");
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
    OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
    OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
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
    QTY_IN_BOX: 1,
    VALID_DATE: "",
    BATCH_NO: "",
    ORDER_QTY: 0,
    ENTRY_QTY: 0,
    OLD_ENTRY_QTY: 0,
    ENTRY_BOX: 0,
    ENTRY_EA: 0,
    CONFIRM_QTY: 0,
    PUTAWAY_QTY: 0,
    BOX_WEIGHT: 0,
    ENTRY_WEIGHT: 0,
    SUPPLY_PRICE: 0,
    DC_PRICE: 0,
    APPLY_PRICE: 0,
    SUPPLY_AMT: 0,
    VAT_AMT: 0,
    DC_AMT: 0,
    TOTAL_AMT: 0,
    RETURN_DIV: "99",
    RETURN_DIV_F: $NC.getGridComboName(G_GRDDETAIL, {
      colFullNameField: "RETURN_DIV_F",
      searchVal: "99",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    }),
    RETURN_COMMENT: "",
    ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
    ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
    ORDER_LINE_NO: "",
    BU_DATE: $NC.G_VAR.masterData.BU_DATE,
    BU_NO: $NC.G_VAR.masterData.BU_NO,
    BU_LINE_NO: "",
    BU_KEY: "",
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
  
/*
  if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
    alert("사업부가 지정되어 있지 않습니다. 다시 작업하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.OUTBOUND_DATE)) {
    alert("먼저 반출일자를 입력하십시오.");
    $NC.setFocus("#dtpOutbound_Date");
    return;
  }
*/
 /* 
  if ($NC.isNull($NC.G_VAR.masterData.VENDOR_CD)) {
    alert("먼저 공급처 코드를 입력하십시오.");
    $NC.setFocus("#edtVendor_Cd");
    return;
  }
*/
  /*
  if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
    $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
  }
  */

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

  // 재고체크
  var chkCount = 0;
  for (var row = 0; row < G_GRDDETAIL.data.getLength(); row++) {
    gridDetailCheckPSTOCK(row, true);
    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CHK == "N") {
      chkCount++;
    }
  }
  if (chkCount > 0) {
    alert("반출가능량이 부족한 상품이 있습니다.");
    return;
  }

  var d_DS = [ ];
  var cu_DS = [ ];
  // var rowCount = G_GRDSUBC.data.getLength();
  // 필터링 된 데이터라 전체 데이터를 기준으로 처리
  var rows = G_GRDDETAIL.data.getItems();
  var rowCount = rows.length;
  for (var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
        P_OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
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
        P_OLD_ENTRY_QTY: rowData.OLD_ENTRY_QTY,
        P_CONFIRM_QTY: rowData.ENTRY_QTY,
        P_SUPPLY_PRICE: rowData.SUPPLY_PRICE,
        P_DC_PRICE: rowData.DC_PRICE,
        P_APPLY_PRICE: rowData.APPLY_PRICE,
        P_SUPPLY_AMT: rowData.SUPPLY_AMT,
        P_VAT_YN: rowData.VAT_YN,
        P_VAT_AMT: rowData.VAT_AMT,
        P_DC_AMT: rowData.DC_AMT,
        P_TOTAL_AMT: rowData.TOTAL_AMT,
        P_RETURN_DIV: rowData.RETURN_DIV,
        P_RETURN_COMMENT: rowData.RETURN_COMMENT,
        P_ORDER_DATE: rowData.ORDER_DATE,
        P_ORDER_NO: rowData.ORDER_NO,
        P_ORDER_LINE_NO: rowData.ORDER_LINE_NO,
        P_BU_DATE: rowData.BU_DATE,
        P_BU_NO: rowData.BU_NO,
        P_BU_LINE_NO: rowData.BU_LINE_NO,
        P_BU_KEY: rowData.BU_KEY,
        P_REMARK1: rowData.REMARK1,
        P_SUM_ENTRY_QTY: rowData.SUM_ENTRY_QTY,
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
  if ($NC.G_VAR.masterData.CRUD === "R" && detailDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/RO02010E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
      P_OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
      P_INOUT_CD: "D30",//$NC.G_VAR.masterData.INOUT_CD,
      P_OUTBOUND_STATE: $NC.G_VAR.masterData.OUTBOUND_STATE,
      P_CUST_CD: $NC.G_VAR.masterData.CUST_CD,
      P_CAR_NO: $NC.G_VAR.masterData.SHIP_TYPE,
      P_REMARK1: $NC.G_VAR.masterData.REMARK1,
      P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
      P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
      P_PLANED_DATETIME: $NC.G_VAR.masterData.PLANED_DATETIME,
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
      P_OUTBOUND_DATE: $NC.G_VAR.subData.OUTBOUND_DATE,
      P_OUTBOUND_NO: $NC.G_VAR.subData.OUTBOUND_NO,
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
    P_PROCESS_STATE_BW: $NC.G_VAR.userData.P_PROCESS_STATE_BW,
    P_PROCESS_STATE_FW: $NC.G_VAR.userData.P_PROCESS_STATE_FW,
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

  // 예정으로 등록시 삭제 허용 체크
  if (Number(rowData.ORDER_QTY) > 0 && !$NC.G_VAR.canDelete) {
    alert("해당 사업부에서는 삭제처리를 하실수 없습니다. \n사업부정책(RO221)을 확인하십시오.");
    return;
  }
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

function masterDataOnChange(e, args) {

  switch (args.col) {
  
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
  case "INOUT_CD":
    $NC.G_VAR.masterData.INOUT_CD = args.val;
    break;
  case "OUTBOUND_DATE":
    $NC.setValueDatePicker(args.view, args.val, "반출일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.OUTBOUND_DATE = $NC.getValue("#dtpOutbound_Date");

    $NC.G_VAR.subData.OUTBOUND_DATE = $NC.G_VAR.masterData.OUTBOUND_DATE;
    if ($NC.G_VAR.subData.CRUD === "R") {
      $NC.G_VAR.subData.CRUD = "U";
    }
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
    $NC.G_VAR.subData.DELIVERY_ADDR_BASIC1 = args.val;
    break;
  case "DELIVERY_ADDR_DETAIL":
    $NC.G_VAR.subData.DELIVERY_ADDR_DETAIL1 = args.val;
    break;
  case "REFUND_SHIP_PRICE_CD":
    $NC.G_VAR.masterData.REFUND_SHIP_PRICE_CD = args.val;
    break;
  case "REMARK1":
    $NC.G_VAR.masterData.REMARK1 = args.val;
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
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90,
    formatter: gridDetailStyleFunction,
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
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_BOX",
    field: "ENTRY_BOX",
    name: "등록BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_EA",
    field: "ENTRY_EA",
    name: "등록EA",
    minWidth: 70,
    cssClass: "align-right"
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
    name: "반품사유구분",
    minWidth: 100,
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
    name: "반품사유내역",
    minWidth: 130,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "SUPPLY_PRICE",
    field: "SUPPLY_PRICE",
    name: "매입단가",
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
    name: "매입금액",
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
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 100,
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

function grdDetailOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
}

function grdDetailOnBeforeEditCell(e, args) {

  var rowData = args.item;
  // 반출등록 전표생성 가능여부 N -> 반출등록시 신규, 수정 불가능
  if ($NC.G_VAR.userData.P_POLICY_RO210 !== "Y") {
    return false;
  }

  if (args.column.field === "ITEM_CD" || args.column.field === "ITEM_STATE_F" || args.column.field === "ITEM_LOT") {
    return $NC.isNull(rowData.ORDER_LINE_NO);
  }
  return true;
}

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

  case "ENTRY_QTY":
    rowData = grdDetailOnCalc(rowData);
    gridDetailCheckPSTOCK(args.row, true);
    break;
  case "ITEM_LOT":
    gridDetailCheckPSTOCK(args.row, false);
    break;
  case "ITEM_STATE_F":
    gridDetailCheckPSTOCK(args.row, false);
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
    if ($NC.isNull(rowData.ENTRY_QTY)) {
      alert("등록수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
        editMode: true
      });
      return false;
    } else {
      var CHECK_QTY = $NC.isNull(rowData.ORDER_LINE_NO) ? 1 : 0;
      var ENTRY_QTY = Number(rowData.ENTRY_QTY);
      if (ENTRY_QTY < CHECK_QTY) {
        alert("등록수량이 " + CHECK_QTY + "보다 작을 수 없습니다.");

        rowData = grdDetailOnCalc(rowData, rowData.ORDER_QTY);
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
          editMode: true
        });
        return false;
      }

      // 입고등록 수량 허용기준 2 -> 입고예정 수량 초과등록 불가능
      if ($NC.G_VAR.existOrder && $NC.G_VAR.userData.P_POLICY_RO220 !== "1") {
        if (Number(rowData.ORDER_QTY) < ENTRY_QTY) {
          alert("등록수량이 예정수량을 초과할 수 없습니다.");

          rowData = grdDetailOnCalc(rowData, rowData.ORDER_QTY);
          G_GRDDETAIL.data.updateItem(rowData.id, rowData);

          gridDetailCheckPSTOCK(row, true);

          $NC.setGridSelectRow(G_GRDDETAIL, {
            selectRow: row,
            activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
            editMode: true
          });
          return false;
        }
      }
    }

    if ($NC.isNull(rowData.RETURN_DIV)) {
      alert("반품사유구분을 입력하십시오.");
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
    break;
  }
}

function grdDetailOnCalc(rowData, entry_Qty) {

  if (!$NC.isNull(entry_Qty)) {
    rowData.ENTRY_QTY = Number(entry_Qty);
  }
  rowData.ENTRY_BOX = $NC.getB_Box(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
  rowData.ENTRY_EA = $NC.getB_Ea(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
  rowData.ENTRY_WEIGHT = $NC.getWeight(rowData.ENTRY_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);

  rowData.SUPPLY_AMT = $NC.getItem_Amt({
    ITEM_PRICE: rowData.SUPPLY_PRICE,
    APPLY_PRICE: $NC.G_VAR.userData.P_POLICY_RO190 == "2" ? (rowData.SUPPLY_PRICE - rowData.DC_PRICE) : 0,
    ITEM_QTY: rowData.ENTRY_QTY,
    ITEM_AMT: rowData.SUPPLY_AMT,
    POLICY_VAL: $NC.G_VAR.userData.P_POLICY_RO190
  });
  rowData.VAT_AMT = $NC.getVat_Amt({
    ITEM_PRICE: rowData.SUPPLY_PRICE,
    APPLY_PRICE: $NC.G_VAR.userData.P_POLICY_RO190 == "2" ? (rowData.SUPPLY_PRICE - rowData.DC_PRICE) : 0,
    ITEM_QTY: rowData.ENTRY_QTY,
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

  rowData.CONFIRM_QTY = rowData.ENTRY_QTY;
  return rowData;
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
    focusCol = G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY");
  } else {
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";
    rowData.ITEM_SPEC = "";
    rowData.QTY_IN_BOX = 1;
    rowData.ENTRY_QTY = 0;
    rowData.ENTRY_BOX = 0;
    rowData.ENTRY_EA = 0;
    rowData.CONFIRM_QTY = 0;
    rowData.PUTAWAY_QTY = 0;
    rowData.BOX_WEIGHT = 0;
    rowData.ENTRY_WEIGHT = 0;
    rowData.SUPPLY_PRICE = 0;
    rowData.SUPPLY_AMT = 0;
    rowData.VAT_AMT = 0;
    rowData.DC_AMT = 0;
    rowData.TOTAL_AMT = 0, rowData.VAT_YN = "N";

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
 * 재고 부족일 경우 그리드에 붉은색으로 표시
 * 
 * @param row
 * @param cell
 * @param value
 * @param columnDef
 * @param dataContext
 * @returns
 */
function gridDetailStyleFunction(row, cell, value, columnDef, dataContext) {
  var rowData = G_GRDDETAIL.data.getItem(row);
  value = $NC.isNull(value) ? "" : value;
  if (rowData.CHK === "N") {
    return "<span class='red-uline'>" + value + "</span>";
  } else {
    return value;
  }
}

function grdStockMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_CD_F",
    field: "INOUT_CD_F",
    name: "출고구분",
    minWidth: 130
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "출고처",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_NM",
    field: "DELIVERY_NM",
    name: "출고처명",
    minWidth: 130
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 20,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "출고대기수량",
    minWidth: 90,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdStockMasterInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdStockMaster", {
    columns: grdStockMasterOnGetColumns(),
    queryId: "RO02010E.RS_SUB1",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDSTOCKMASTER.view.onSelectedRowsChanged.subscribe(grdStockMasterOnAfterScroll);

  var divStockInfoView = $("#divStockInfoView");
  divStockInfoView.children().click(function(e) {
    G_GRDSTOCKMASTER.view.focus();
  });
  var grdStockMaster = $("#grdStockMaster");
  grdStockMaster.find("div.grid-focus").blur(function(e) {
    clearTimeout($NC.G_VAR.onCarInfoViewTimeout);
    $NC.G_VAR.onStockInfoViewTimeout = setTimeout(function() {
      divStockInfoView.hide("fast", function() {
        divStockInfoView.css({
          "display": "none"
        });
      });
    }, 500);
  });
  grdStockMaster.find("div.grid-focus,div.grid-canvas,div.slick-viewport").focus(function(e) {
    clearTimeout($NC.G_VAR.onStockInfoViewTimeout);
  });
}

function grdStockMasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdStockMaster", row + 1);
}

function showStockOverlay(e) {

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("조회할 상품을 그리드에서 선택하십시오.");
    return;
  }

  if (G_GRDDETAIL.lastRow == null) {
    alert("조회할 상품을 그리드에서 선택하십시오.");
    return;
  }

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if (rowData) {
    var CENTER_CD = $NC.G_VAR.userData.P_CENTER_CD;
    var BU_CD = $NC.G_VAR.userData.P_BU_CD;
    var OUTBOUND_DATE = $NC.getValue("#dtpOutbound_Date");
    var OUTBOUND_NO = $NC.getValue("#edtOutbound_No");
    var BRAND_CD = rowData.BRAND_CD;
    var ITEM_CD = rowData.ITEM_CD;
    var ITEM_STATE = rowData.ITEM_STATE;
    var ITEM_LOT = rowData.ITEM_LOT;

    if ($NC.isNull(ITEM_CD)) {
      alert("조회할 상품을 입력하십시오.");
      return;
    }

    if ($NC.isNull(ITEM_STATE)) {
      alert("조회할 상품의 상태를 입력하십시오.");
      return;
    }

    if ($NC.isNull(ITEM_LOT)) {
      alert("조회할 상품의 LOT번호를 입력하십시오.");
      return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSTOCKMASTER);

    G_GRDSTOCKMASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: OUTBOUND_NO,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_STATE: ITEM_STATE,
      P_ITEM_LOT: ITEM_LOT
    });

    // 데이터 조회
    $NC.serviceCall("/LO02010E/getDataSet.do", $NC.getGridParams(G_GRDSTOCKMASTER), onGetStockMaster);

    clearTimeout($NC.G_VAR.onStockInfoViewTimeout);
    var divStockInfoView = $("#divStockInfoView").hide();
    var view = $(e.target);
    var offset = view.offset();
    var clientHeight = Math.max(G_GRDSTOCKMASTER.data.getLength() * 25 - $NC.G_LAYOUT.header, 350);
    divStockInfoView.css({
      "position": "absolute",
      "top": offset.top,
      "left": offset.left - $NC.G_OFFSET.stockMasterViewWidth - 5,
      "z-index": 1000,
      "width": $NC.G_OFFSET.stockMasterViewWidth,
      "height": clientHeight
    });

    G_GRDSTOCKMASTER.view.resetActiveCell();
    divStockInfoView.show("fast", function() {
      G_GRDSTOCKMASTER.view.focus();
      $NC.resizeGrid("#grdStockMaster", $NC.G_OFFSET.stockMasterViewWidth, clientHeight - $NC.G_LAYOUT.header
          - $("#divStockInfoBottomView").outerHeight() - 1);
      G_GRDSTOCKMASTER.view.invalidate();
      $NC.setGridSelectRow(G_GRDSTOCKMASTER, 0);
    });
  }

}

function onGetStockMaster(ajaxData) {

  $NC.setInitGridData(G_GRDSTOCKMASTER, ajaxData);
  if (G_GRDSTOCKMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDSTOCKMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSTOCKMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSTOCKMASTER, {
        selectKey: "OUTBOUND_DATE",
        selectVal: G_GRDSTOCKMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdStockMaster", 0, 0);
  }
}

function showStockSelOverlay(e) {

  var BRAND_CD = $NC.getValue("edtBrand_Cd");

  var BRAND_NM = $NC.getValue("edtBrand_Nm");
  if ($NC.isNull(BRAND_CD)) {
    alert("먼저 위탁사 코드를 입력하십시오.");
    $NC.setFocus("#edtBrand_Cd");
    return;
  } else {

    $NC.setValue("#edtQBrand_Cd", BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", BRAND_NM);       
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

  // 초기화
  $NC.clearGridData(G_GRDSTOCKSELMASTER);

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
  if ($NC.getValue("#rgbQView_Div2")) {
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
    name: "등록수량",
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
      if (Number(rowData.INPUT_QTY) < 0) {
        alert("등록수량이 0보다 작을 수 없습니다.");
        $NC.setFocusGrid(G_GRDSTOCKSELMASTER, row, G_GRDSTOCKSELMASTER.view.getColumnIndex("INPUT_QTY"), true);
        return false;
      }
      itemDs.push(rowData);
      chkCnt++;
    }
  }

  if (chkCnt == 0) {
    alert("출고등록할 재고를 선택하십시오.");
    return;
  }

  if (itemDs.length == 0) {
    return;
  }

  var rowCount = G_GRDDETAIL.data.getLength();
  if (rowCount == 0) {
    G_GRDDETAIL.lastRow = null; // 출고등록 상세정보 그리드의 length가 0일 경우 현재고에 0이 표시되는것 막기 위해 추가
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
        OUTBOUND_STATE: $NC.G_VAR.masterData.OUTBOUND_STATE || "20",
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
        ORDER_QTY: 0,
        ENTRY_QTY: rowData.INPUT_QTY,
        ENTRY_BOX: rowData.ENTRY_BOX,
        ENTRY_EA: rowData.ENTRY_EA,
        ENTRY_WEIGHT: rowData.ENTRY_WEIGHT,
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
        SUM_ENTRY_QTY: 0,
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
        OUTBOUND_STATE: $NC.G_VAR.masterData.OUTBOUND_STATE || "20",
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
        ORDER_QTY: 0,
        ENTRY_QTY: rowData.INPUT_QTY,
        ENTRY_BOX: rowData.ENTRY_BOX,
        ENTRY_EA: rowData.ENTRY_EA,
        ENTRY_WEIGHT: rowData.ENTRY_WEIGHT,
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
        SUM_ENTRY_QTY: 0,
        CHK: Number(rowData.PSTOCK_QTY) < Number(rowData.INPUT_QTY) ? "N" : "Y",
        id: $NC.getGridNewRowId(),
        CRUD: "C"
      };
    }
    G_GRDDETAIL.data.addItem(newRowData);
  }
  $NC.setGridSelectRow(G_GRDDETAIL, rowCount);
  $NC.setGridDisplayRows("#grdDetail", rowCount + 1, G_GRDDETAIL.data.getLength());

  // 같은 상품이 그리드에 있을 경우, 해당 상품의 합과 가용재고량과 비교하기 위해 아래 로직 추가
  for (var row = 0; row < G_GRDDETAIL.data.getLength(); row++) {
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
  var BU_CD =  $NC.getValue("#edtBu_Cd");
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
    $NC.G_VAR.subData.DELIVERY_ADDR_BASIC1 = resultInfo.ADDR_NM_REAL;
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
  case "DELIVERY_TEL":
  case "DELIVERY_HP":
  case "DELIVERY_ZIP_CD":
  case "DELIVERY_ADDR_BASIC":
  case "DELIVERY_ADDR_DETAIL":
  case "DELIVERY_ADDR_BASIC1":
  case "DELIVERY_ADDR_DETAIL1":
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