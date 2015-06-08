/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null,
    canInsert: true,
    canDelete: true
  });


  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel);
//  $("#btnDelivery_Cd").click(showDeliveryPopup);
  $("#btnShipper_Zip_Cd").click(showPostPopup);
  $("#btnOrderer_Zip_Cd").click(showOrderPostPopup);

  $("#btnEntryNew").click(_New);
  $("#btnEntryDelete").click(_Delete);
  $("#btnEntrySave").click(_Save);
  
  $("#btnMall_Brand_Cd").click(showMallBrandPopup);

  $NC.setInitDatePicker("#dtpInbound_Date");
  $NC.setInitDatePicker("#dtpBu_Date");

  if (!$NC.isNull($NC.G_VAR.userData.P_POLICY_RI221)) {
    $NC.G_VAR.canInsert = ($NC.G_VAR.userData.P_POLICY_RI221.substr(0, 1) == "Y");
    $NC.G_VAR.canDelete = ($NC.G_VAR.userData.P_POLICY_RI221.substr(1, 1) == "Y");
  }

  // 그리드 초기화
  grdDetailInitialize();

  // $("#lblLocation_Id_Cnt").show();
  // $("#edtLocation_Id_Cnt").show();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  // 반입등록 전표생성 가능여부 N -> 반입등록시 신규, 수정 불가능
  if ($NC.G_VAR.userData.P_POLICY_RI210 !== "Y") {
    $NC.setEnable("#btnEntryNew", false);
    $NC.setEnable("#btnEntryDelete", false);
    $NC.setEnable("#btnEntrySave", false);
  }

  var isDisable = false;
  $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
  $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);
  $NC.setValue("#edtCust_Cd", $NC.G_VAR.userData.P_CUST_CD);

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {

    var INBOUND_DATE = $NC.getValue("#dtpInbound_Date");
    var BU_DATE = $NC.getValue("#dtpBu_Date");
    var CARRIER_CD = $NC.getValue("#cboCarrier_Cd");
    var REFUND_SHIP_PRICE_CD = $NC.getValue("#cboPrice_Cd");
    var REFUND_PRICE_TYPE = $NC.getValue("#cboRefund_Price_Type");
    
    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      INBOUND_DATE: INBOUND_DATE,
      INBOUND_NO: "",
      INOUT_CD: "",
      INBOUND_STATE: "20",
      CUST_CD: $NC.G_VAR.userData.P_CUST_CD,
      MALL_CD: "",
      DELIVERY_CD: "1111",
      RDELIVERY_CD: "1111",
      CAR_CD: "",
      CAR_NM: "",
      PLANED_DATETIME: "",
      LOCATION_ID_CNT: "",
      REMARK1: "",
      ORDER_DATE: "",
      ORDER_NO: "",
      BU_DATE: BU_DATE,
      BU_NO: "",
      MALL_BRAND_CD: "",
      MALL_BRAND_NM: "",
      REFUND_WB_NO: "",
      CARRIER_CD: CARRIER_CD,
      REFUND_SHIP_PRICE_CD: REFUND_SHIP_PRICE_CD,
      REFUND_SHIP_PRICE: "",
      REFUND_PRICE_TYPE: REFUND_PRICE_TYPE,
      RETURN_STATUS:"62",
      CRUD: "C"
    };

    $NC.G_VAR.subData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      INBOUND_DATE: INBOUND_DATE,
      INBOUND_NO: INBOUND_NO,
      // 온라인고객내역
      MALL_MSG: "",
      ORDERER_CD: "",
      ORDERER_NM: "",
      ORDERER_TEL: "",
      ORDERER_HP: "",
      ORDERER_EMAIL: "",
      ORDERER_MSG: "",
      ORDERER_ZIP_CD: "",
      ORDERER_ADDR_BASIC: "",
      ORDERER_ADDR_DETAIL: "",
      SHIPPER_NM: "",
      SHIPPER_TEL: "",
      SHIPPER_HP: "",
      SHIPPER_ZIP_CD: "",
      SHIPPER_ADDR_BASIC: "",
      SHIPPER_ADDR_DETAIL: "",
      REMARK1: "",
      CRUD: CRUD
    };

    $NC.setFocus("#edtBu_No");
  } else {
    // 마스터 disable여부 설정
    isDisable = true;
    // 예정 -> 등록, 등록 수정
    var INBOUND_DATE;
    var INBOUND_NO;
    var INBOUND_STATE;
    var CRUD = "R";
    var masterDS = $NC.G_VAR.userData.P_MASTER_DS;
    if ($NC.G_VAR.userData.P_PROCESS_CD === "A") {
      INBOUND_DATE = $NC.getValue("#dtpInbound_Date");
      INBOUND_NO = "";
      INBOUND_STATE = "20";
      CRUD = "C";
    } else {
      INBOUND_DATE = masterDS.INBOUND_DATE;
      INBOUND_NO = masterDS.INBOUND_NO;
      INBOUND_STATE = null;// masterDS.INBOUND_STATE;
      CRUD = "R";
      $NC.setValue("#dtpInbound_Date", INBOUND_DATE);
      $NC.setValue("#edtInbound_No", INBOUND_NO);
    }

    $NC.G_VAR.masterData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      INBOUND_DATE: INBOUND_DATE,
      INBOUND_NO: INBOUND_NO,
      INOUT_CD: masterDS.INOUT_CD,
      INBOUND_STATE: INBOUND_STATE,
      CUST_CD: masterDS.CUST_CD,
      MALL_CD: masterDS.MALL_CD,
      DELIVERY_CD: masterDS.DELIVERY_CD,
      DELIVERY_NM: masterDS.DELIVERY_NM,
      RDELIVERY_CD: masterDS.RDELIVERY_CD,
      CAR_CD: masterDS.CAR_CD,
      CAR_NM: masterDS.CAR_NM,
      LOCATION_ID_CNT: masterDS.LOCATION_ID_CNT,
      REMARK1: masterDS.REMARK1,
      PLANED_DATETIME: masterDS.PLANED_DATETIME,
      ORDER_DATE: masterDS.ORDER_DATE,
      ORDER_NO: masterDS.ORDER_NO,
      BU_DATE: masterDS.BU_DATE,
      BU_NO: masterDS.BU_NO,
      REFUND_WB_NO: masterDS.REFUND_WB_NO,
      MALL_BRAND_CD: masterDS.BRAND_CD_D,
      MALL_BRAND_NM: masterDS.BRAND_NM_D,
      CARRIER_CD: masterDS.CARRIER_CD,
      REFUND_SHIP_PRICE_CD: masterDS.REFUND_SHIP_PRICE_CD,
      REFUND_SHIP_PRICE: masterDS.REFUND_SHIP_PRICE,
      REFUND_PRICE_TYPE: masterDS.REFUND_PRICE_TYPE,
      RETURN_STATUS: masterDS.RETURN_STATUS,
      CRUD: CRUD
    };

    $NC.G_VAR.subData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      INBOUND_DATE: INBOUND_DATE,
      INBOUND_NO: INBOUND_NO,
      // 온라인고객내역
      ORDERER_CD: masterDS.ORDERER_CD,
      ORDERER_NM: masterDS.ORDERER_NM,
      ORDERER_TEL: masterDS.ORDERER_TEL,
      ORDERER_HP: masterDS.ORDERER_HP,
      ORDERER_EMAIL: masterDS.ORDERER_EMAIL,
      ORDERER_MSG: masterDS.ORDERER_MSG,
      ORDERER_ZIP_CD: masterDS.ORDERER_ZIP_CD,
      ORDERER_ADDR_BASIC: masterDS.ORDERER_ADDR_BASIC,
      ORDERER_ADDR_DETAIL: masterDS.ORDERER_ADDR_DETAIL,
      SHIPPER_NM: masterDS.SHIPPER_NM,
      SHIPPER_TEL: masterDS.SHIPPER_TEL,
      SHIPPER_HP: masterDS.SHIPPER_HP,
      SHIPPER_ZIP_CD: masterDS.SHIPPER_ZIP_CD,
      SHIPPER_ADDR_BASIC: masterDS.SHIPPER_ADDR_BASIC,
      SHIPPER_ADDR_DETAIL: masterDS.SHIPPER_ADDR_DETAIL,
      REFUND_WB_NO: masterDS.REFUND_WB_NO,
      CARRIER_CD: masterDS.CARRIER_CD,
      CRUD: CRUD
    };

    // 마스터 데이터 세팅
    $NC.setValue("#edtDelivery_Cd", $NC.G_VAR.masterData.DELIVERY_CD);
    $NC.setValue("#edtDelivery_Nm", $NC.G_VAR.masterData.DELIVERY_NM);
    $NC.setValue("#cboInout_Cd", $NC.G_VAR.masterData.INOUT_CD);
    $NC.setValue("#edtRemark1", $NC.G_VAR.masterData.REMARK1);
    $NC.setValue("#cboPrice_Cd", $NC.G_VAR.masterData.REFUND_SHIP_PRICE_CD);
    $NC.setValue("#edtRefund_Ship_Price", $NC.G_VAR.masterData.REFUND_SHIP_PRICE);
    $NC.setValue("#cboCarrier_Cd", $NC.G_VAR.masterData.CARRIER_CD);
    $NC.setValue("#edtRefund_Wb_No", $NC.G_VAR.masterData.REFUND_WB_NO);

    $NC.setValue("#edtOrder_Date", $NC.G_VAR.masterData.ORDER_DATE);
    $NC.setValue("#edtOrder_No", $NC.G_VAR.masterData.ORDER_NO);
    $NC.setValue("#dtpBu_Date", $NC.G_VAR.masterData.BU_DATE);
    // $NC.setValue("#edtBu_Date", $NC.G_VAR.masterData.BU_DATE);
    $NC.setValue("#edtBu_No", $NC.G_VAR.masterData.BU_NO);
    $NC.setValue("#edtMall_Brand_Cd", $NC.G_VAR.masterData.MALL_BRAND_CD);
    $NC.setValue("#edtMall_Brand_Nm", $NC.G_VAR.masterData.MALL_BRAND_NM);

    // 온라인 데이터 세팅
    $NC.setValue("#edtOrderer_Cd", $NC.G_VAR.subData.ORDERER_CD);
    $NC.setValue("#edtOrderer_Nm", $NC.G_VAR.subData.ORDERER_NM);
    $NC.setValue("#edtOrderer_Tel", $NC.G_VAR.subData.ORDERER_TEL);
    $NC.setValue("#edtOrderer_Hp", $NC.G_VAR.subData.ORDERER_HP);
    $NC.setValue("#edtOrderer_Email", $NC.G_VAR.subData.ORDERER_EMAIL);
    $NC.setValue("#edtOrderer_Msg", $NC.G_VAR.subData.ORDERER_MSG);
    $NC.setValue("#edtOrderer_Zip_Cd", $NC.G_VAR.subData.ORDERER_ZIP_CD);
    $NC.setValue("#edtOrderer_Addr_Basic", $NC.G_VAR.subData.ORDERER_ADDR_BASIC);
    $NC.setValue("#edtOrderer_Addr_Detail", $NC.G_VAR.subData.ORDERER_ADDR_DETAIL);
    $NC.setValue("#edtShipper_Nm", $NC.G_VAR.subData.SHIPPER_NM);
    $NC.setValue("#edtShipper_Tel", $NC.G_VAR.subData.SHIPPER_TEL);
    $NC.setValue("#edtShipper_Hp", $NC.G_VAR.subData.SHIPPER_HP);
    $NC.setValue("#edtShipper_Zip_Cd", $NC.G_VAR.subData.SHIPPER_ZIP_CD);
    $NC.setValue("#edtShipper_Addr_Basic", $NC.G_VAR.subData.SHIPPER_ADDR_BASIC);
    $NC.setValue("#edtShipper_Addr_Detail", $NC.G_VAR.subData.SHIPPER_ADDR_DETAIL);

    // 주문/수령자 정보 모두 Disabled
    $("#divMasterView .sub-table-data").prop("disabled", true);
    $NC.setEnable("#cboMall_Cd", false);
    $NC.setEnable("#btnMall_Brand_Cd", false);
    $NC.setEnable("#edtMall_Brand_Nm", false);
    $NC.setEnable("#edtMall_Brand_Cd", false);

    // 디테일 데이터 세팅
    var detailDS = $NC.G_VAR.userData.P_DETAIL_DS;
    var rowData;
    G_GRDDETAIL.data.beginUpdate();
    try {
      for ( var row in detailDS) {
        rowData = detailDS[row];

        if ($NC.G_VAR.userData.P_PROCESS_CD === "A") {
          rowData.INBOUND_DATE = INBOUND_DATE;
          rowData.INBOUND_NO = "";
          rowData.INBOUND_STATE = "20";
          rowData.LINE_NO = "";
          rowData.ENTRY_QTY = rowData.ORDER_QTY;
          rowData.CONFIRM_QTY = rowData.ORDER_QTY;
          rowData.PUTAWAY_QTY = rowData.ORDER_QTY;
          rowData.BU_DATE = masterDS.BU_DATE;
          rowData.BU_NO = masterDS.BU_NO;
          isDisable = true;
          CRUD = "C";
        } else {
          rowData.BU_DATE = rowData.BU_DATE;
          rowData.BU_NO = rowData.BU_NO;
          rowData.INBOUND_STATE = null;
          CRUD = "R";
        }

        var newRowData = {
          CENTER_CD: rowData.CENTER_CD,
          BU_CD: rowData.BU_CD,
          INBOUND_DATE: rowData.INBOUND_DATE,
          INBOUND_NO: rowData.INBOUND_NO,
          LINE_NO: rowData.LINE_NO,
          INBOUND_STATE: INBOUND_STATE,
          BRAND_CD: rowData.OWN_BRAND_CD,
          BRAND_NM: rowData.OWN_BRAND_NM,
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
          ENTRY_BOX: rowData.ENTRY_BOX,
          ENTRY_EA: rowData.ENTRY_EA,
          CONFIRM_QTY: rowData.CONFIRM_QTY,
          PUTAWAY_QTY: rowData.PUTAWAY_QTY,
          BOX_WEIGHT: rowData.BOX_WEIGHT,
          ENTRY_WEIGHT: rowData.ENTRY_WEIGHT,
          BUY_PRICE: rowData.BUY_PRICE,
          DC_PRICE: rowData.DC_PRICE,
          APPLY_PRICE: rowData.APPLY_PRICE,
          BUY_AMT: rowData.BUY_AMT,
          VAT_YN: rowData.VAT_YN,
          VAT_AMT: rowData.VAT_AMT,
          DC_AMT: rowData.DC_AMT,
          TOTAL_AMT: rowData.TOTAL_AMT,
          RETURN_DIV: rowData.RETURN_DIV,
          RETURN_DIV_F: rowData.RETURN_DIV_F,
          RETURN_COMMENT: rowData.RETURN_COMMENT,
          ORDER_DATE: rowData.ORDER_DATE,
          ORDER_NO: rowData.ORDER_NO,
          ORDER_LINE_NO: rowData.ORDER_LINE_NO,
          DEAL_ID: rowData.DEAL_ID,
          DEAL_NM: rowData.DEAL_NM,
          OPTION_ID: rowData.OPTION_ID,
          OPTION_VALUE: rowData.OPTION_VALUE,
          OPTION_QTY: rowData.OPTION_QTY,
          BU_DATE: rowData.BU_DATE,
          BU_NO: rowData.BU_NO,
          BU_LINE_NO: rowData.BU_LINE_NO,
          BU_KEY: rowData.BU_KEY,
          REMARK1: rowData.REMARK1,
          IF_DEAL_ID: rowData.IF_DEAL_ID,
          IF_OPTION_ID: rowData.IF_OPTION_ID,
          RETURN_TEXT: rowData.RETURN_TEXT,
          id: $NC.getGridNewRowId(),
          CRUD: CRUD
        };
        G_GRDDETAIL.data.addItem(newRowData);
      }
    } finally {
      G_GRDDETAIL.data.endUpdate();
    }

    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

  // 조회조건 - 반입구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "EM",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {

      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
      } else {
        $NC.setValue("#cboInout_Cd", $NC.G_VAR.masterData.INOUT_CD);
      }
    }
  });
  
  //조회조건 - 운송사구분 세팅
  $NC.setInitCombo("/RIM2010E/getDataSet.do", {
    P_QUERY_ID: "RIM2010E.RS_SUB",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "WMPC08"
    })
  }, {
    selector: "#cboCarrier_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.CARRIER_CD = $NC.getValue("#cboCarrier_Cd");
      } else {
        $NC.setValue("#cboCarrier_Cd", $NC.G_VAR.masterData.CARRIER_CD);
      }
    }
  });
  
  // 조회조건 - 운송사구분 세팅
  /*
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
        $NC.G_VAR.masterData.CARRIER_CD = $NC.getValue("#cboCarrier_Cd");
      } else {
        $NC.setValue("#cboCarrier_Cd", $NC.G_VAR.masterData.CARRIER_CD);
      }
    }
  });
  */
  
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
  
  // 조회조건 - 반품비구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "REFUND_PRICE_TYPE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboRefund_Price_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.REFUND_PRICE_TYPE = $NC.getValue("#cboRefund_Price_Type");
      } else {
        $NC.setValue("#cboRefund_Price_Type", $NC.G_VAR.masterData.REFUND_PRICE_TYPE);
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
    selector: "#cboPrice_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.REFUND_SHIP_PRICE_CD = $NC.getValue("#cboPrice_Cd");
      } else {
        $NC.setValue("#cboPrice_Cd", $NC.G_VAR.masterData.REFUND_SHIP_PRICE_CD);
      }
    }
  });

  setLocationIdCnt();

  // 수정일 경우 입력불가 항목 비활성화 처리
  setMasterDisable(isDisable);

}

function setMasterDisable(isDisable) {

  // 수정일 경우 입력불가 항목 비활성화 처리
  if ($NC.G_VAR.userData.P_PROCESS_CD === "B") {
    $NC.setEnable("#dtpInbound_Date", false);
  }

  $NC.setEnable("#cboInout_Cd", !isDisable);
  $NC.setEnable("#edtDelivery_Cd", !isDisable);
  $NC.setEnable("#btnDelivery_Cd", !isDisable);
  $NC.setEnable("#cboPrice_Cd", !isDisable);
  $NC.setEnable("#btnOrderer_Zip_Cd", !isDisable);
  $NC.setEnable("#btnShipper_Zip_Cd", !isDisable);
  $NC.setEnable("#edtRefund_Wb_No", !isDisable);
  $NC.setEnable("#edtShip_Price", !isDisable);
  $NC.setEnable("#dtpBu_Date", !isDisable);
  $NC.setEnable("#edtBu_No", !isDisable);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 355;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
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
      - $NC.G_LAYOUT.margin1);
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

  var id = view.prop("id").substr(3).toUpperCase();

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

}

/**
 * 신규
 */
function _New() {

  // 예정으로 등록시 추가 허용 체크
  if (!$NC.isNull($NC.getValue("#edtOrder_Date")) && !$NC.G_VAR.canInsert) {
    alert("해당 사업부에서는 신규 추가처리를 하실수 없습니다. \n사업부정책(RI221)을 확인하십시오.");
    return;
  }
  
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
  
  if ($NC.isNull($NC.G_VAR.subData.ORDERER_ZIP_CD)) {
    alert("먼저 주문자 우편번호를 입력하십시오.");
    $NC.setFocus("#edtOrderer_Zip_Cd");
    return;
  }
  
  if ($NC.isNull($NC.G_VAR.subData.ORDERER_ADDR_DETAIL)) {
    alert("먼저 주문자 상세주소를 입력하십시오.");
    $NC.setFocus("#edtOrderer_Addr_Detail");
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
  
  if ($NC.isNull($NC.G_VAR.subData.SHIPPER_ZIP_CD)) {
    alert("먼저 수령자 우편번호를 입력하십시오.");
    $NC.setFocus("#edtShipper_Zip_Cd");
    return;
  }
  
  if ($NC.isNull($NC.G_VAR.subData.SHIPPER_ADDR_DETAIL)) {
    alert("먼저 수령자 상세주소를 입력하십시오.");
    $NC.setFocus("#edtShipper_Addr_Detail");
    return;
  }

//  var DELIVERY_CD = $NC.getValue("#edtDelivery_Cd");
//  if ($NC.isNull(DELIVERY_CD)) {
//    alert("먼저 온라인몰 코드를 입력하십시오.");
//    $NC.setFocus("#edtDelivery_Cd");
//    return;
//  }

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
    INBOUND_DATE: $NC.G_VAR.masterData.INBOUND_DATE,
    INBOUND_NO: $NC.G_VAR.masterData.INBOUND_NO,
    LINE_NO: "",
    INBOUND_STATE: $NC.G_VAR.masterData.INBOUND_STATE || "20",
    BRAND_CD: "",
    BRAND_NM: "",
    ITEM_CD: "",
    ITEM_NM: "",
    ITEM_SPEC: "",
    ITEM_STATE: $NC.G_VAR.userData.P_POLICY_RI240,
    ITEM_STATE_F: $NC.getGridComboName(G_GRDDETAIL, {
      colFullNameField: "ITEM_STATE_F",
      searchVal: $NC.G_VAR.userData.P_POLICY_RI240,
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    }),
    ITEM_LOT: "00",
    QTY_IN_BOX: 1,
    ORDER_QTY: 0,
    ENTRY_QTY: 0,
    CONFIRM_QTY: 0,
    PUTAWAY_QTY: 0,
    ENTRY_WEIGHT: 0,
    ENTRY_BOX: 0,
    ENTRY_EA: 0,
    VALID_DATE: "",
    BATCH_NO: "",
    BOX_WEIGHT: 0,
    BUY_PRICE: 0,
    DC_PRICE: 0,
    APPLY_PRICE: 0,
    BUY_AMT: 0,
    VAT_AMT: 0,
    DC_AMT: 0,
    TOTAL_AMT: 0,
    ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
    ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
    ORDER_LINE_NO: "",
    RETURN_DIV: "7",
    RETURN_DIV_F: $NC.getGridComboName(G_GRDDETAIL, {
      colFullNameField: "RETURN_DIV_F",
      searchVal: "7",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    }),
    RETURN_COMMENT: "",
    BU_DATE: $NC.G_VAR.masterData.BU_DATE,
    BU_NO: $NC.G_VAR.masterData.BU_NO,
    BU_LINE_NO: "",
    BU_KEY: "",
    REMARK1: "",
    DEAL_ID: "",
    DEAL_NM: "",
    OPTION_ID: "",
    OPTION_VALUE: "",
    OPTION_QTY: 0,
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

  if ($NC.isNull($NC.G_VAR.masterData.INBOUND_DATE)) {
    alert("먼저 반입일자를 입력하십시오.");
    $NC.setFocus("#dtpInbound_Date");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
    $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
  }
  if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
    alert("먼저 반입구분을 선택하십시오.");
    $NC.setFocus("#cboInout_Cd");
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
  
  if ($NC.isNull($NC.G_VAR.masterData.REFUND_WB_NO)) {
    alert("먼저 반품송장번호를 입력하십시오.");
    $NC.setFocus("#edtRefund_Wb_No");
    return;
  }
  
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
  
  if ($NC.isNull($NC.G_VAR.masterData.REFUND_PRICE_TYPE)) {
    alert("먼저 반품비구분을 입력하십시오.");
    $NC.setFocus("#cboRefund_Price_Type");
    return;
  }
  
  if ($NC.isNull($NC.G_VAR.masterData.CARRIER_CD)) {
    alert("먼저 운송사구분을 입력하십시오.");
    $NC.setFocus("#cboCarrier_Cd");
    return;
  }
  
  if ($NC.isNull($NC.G_VAR.subData.SHIPPER_ZIP_CD) || $NC.isNull($NC.G_VAR.subData.SHIPPER_ADDR_BASIC)) {
    alert("먼저 수령자 주소를 입력하십시오.");
    $NC.setFocus("#edtShipper_Addr_Detail");
    return;
  }
  
  if ($NC.isNull($NC.G_VAR.subData.ORDERER_ZIP_CD) || $NC.isNull($NC.G_VAR.subData.ORDERER_ADDR_BASIC)) {
    alert("먼저 주문자 주소를 입력하십시오.");
    $NC.setFocus("#edtOrderer_Addr_Detail");
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
  // var rowCount = G_GRDSUBC.data.getLength();
  // 필터링 된 데이터라 전체 데이터를 기준으로 처리
  var rows = G_GRDDETAIL.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_INBOUND_DATE: $NC.G_VAR.masterData.INBOUND_DATE,
        P_INBOUND_NO: $NC.G_VAR.masterData.INBOUND_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_INBOUND_STATE: rowData.INBOUND_STATE,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_VALID_DATE: rowData.VALID_DATE,
        P_BATCH_NO: rowData.BATCH_NO,
        P_ORDER_QTY: rowData.ORDER_QTY,
        P_ENTRY_QTY: rowData.ENTRY_QTY,
        P_CONFIRM_QTY: rowData.CONFIRM_QTY,
        P_PUTAWAY_QTY: rowData.PUTAWAY_QTY,
        P_BUY_PRICE: rowData.BUY_PRICE,
        P_DC_PRICE: rowData.DC_PRICE,
        P_APPLY_PRICE: rowData.APPLY_PRICE,
        P_BUY_AMT: rowData.BUY_AMT,
        P_VAT_AMT: rowData.VAT_AMT,
        P_DC_AMT: rowData.DC_AMT,
        P_TOTAL_AMT: rowData.TOTAL_AMT,
        P_RETURN_DIV: rowData.RETURN_DIV,
        P_RETURN_COMMENT: rowData.RETURN_COMMENT,
        P_ORDER_DATE: rowData.ORDER_DATE,
        P_ORDER_NO: rowData.ORDER_NO,
        P_ORDER_LINE_NO: rowData.ORDER_LINE_NO,
        P_DEAL_ID: rowData.DEAL_ID,
        P_OPTION_ID: rowData.OPTION_ID,
        P_OPTION_QTY: rowData.OPTION_QTY,
        // P_BU_DATE: rowData.BU_DATE,
        // P_BU_NO: rowData.BU_NO,
        P_BU_DATE: $NC.G_VAR.masterData.BU_DATE,
        P_BU_NO: $NC.G_VAR.masterData.BU_NO,
        P_BU_LINE_NO: rowData.BU_LINE_NO,
        P_BU_KEY: rowData.BU_KEY,
        P_REMARK1: rowData.REMARK1,
        P_RETURN_TEXT: rowData.RETURN_TEXT,
        P_IF_DEAL_ID: rowData.IF_DEAL_ID,
        P_IF_OPTION_ID: rowData.IF_OPTION_ID,
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

  $NC.serviceCall("/RIM2010E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_INBOUND_DATE: $NC.G_VAR.masterData.INBOUND_DATE,
      P_INBOUND_NO: $NC.G_VAR.masterData.INBOUND_NO,
      P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
      P_INBOUND_STATE: $NC.G_VAR.masterData.INBOUND_STATE,
      P_CUST_CD: $NC.G_VAR.masterData.CUST_CD,
      P_DELIVERY_CD: $NC.G_VAR.masterData.DELIVERY_CD,
      P_RDELIVERY_CD: $NC.G_VAR.masterData.RDELIVERY_CD,
      P_LOCATION_ID_CNT: $NC.G_VAR.masterData.LOCATION_ID_CNT,
      P_REMARK1: $NC.G_VAR.masterData.REMARK1,
      P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
      P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
      P_PLANED_DATETIME: $NC.G_VAR.masterData.PLANED_DATETIME,
      P_REFUND_WB_NO: $NC.G_VAR.masterData.REFUND_WB_NO,
      P_CARRIER_CD: $NC.G_VAR.masterData.CARRIER_CD,
      P_REFUND_SHIP_PRICE_CD: $NC.G_VAR.masterData.REFUND_SHIP_PRICE_CD,
      P_REFUND_SHIP_PRICE: $NC.G_VAR.masterData.REFUND_SHIP_PRICE,
      P_REFUND_PRICE_TYPE: $NC.G_VAR.masterData.REFUND_PRICE_TYPE,
      P_RETURN_STATUS: $NC.G_VAR.masterData.RETURN_STATUS,
      P_CAR_CD: $NC.G_VAR.masterData.CAR_CD,
      P_CRUD: $NC.G_VAR.masterData.CRUD
    }),
    P_DS_DETAIL: $NC.toJson(detailDS),

    P_DS_SUB: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.subData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.subData.BU_CD,
      P_INBOUND_DATE: $NC.G_VAR.subData.INBOUND_DATE,
      P_INBOUND_NO: $NC.G_VAR.subData.INBOUND_NO,
      P_MALL_MSG: $NC.G_VAR.subData.MALL_MSG,
      P_ORDERER_CD: $NC.G_VAR.subData.ORDERER_CD,
      P_ORDERER_NM: $NC.G_VAR.subData.ORDERER_NM,
      P_ORDERER_TEL: $NC.G_VAR.subData.ORDERER_TEL,
      P_ORDERER_HP: $NC.G_VAR.subData.ORDERER_HP,
      P_ORDERER_EMAIL: $NC.G_VAR.subData.ORDERER_EMAIL,
      P_ORDERER_MSG: $NC.G_VAR.subData.ORDERER_MSG,
      P_ORDERER_ZIP_CD: $NC.G_VAR.subData.ORDERER_ZIP_CD,
      P_ORDERER_ADDR_BASIC: $NC.G_VAR.subData.ORDERER_ADDR_BASIC,
      P_ORDERER_ADDR_DETAIL: $NC.G_VAR.subData.ORDERER_ADDR_DETAIL,
      P_SHIPPER_NM: $NC.G_VAR.subData.SHIPPER_NM,
      P_SHIPPER_TEL: $NC.G_VAR.subData.SHIPPER_TEL,
      P_SHIPPER_HP: $NC.G_VAR.subData.SHIPPER_HP,
      P_SHIPPER_ZIP_CD: $NC.G_VAR.subData.SHIPPER_ZIP_CD,
      P_SHIPPER_ADDR_BASIC: $NC.G_VAR.subData.SHIPPER_ADDR_BASIC,
      P_SHIPPER_ADDR_DETAIL: $NC.G_VAR.subData.SHIPPER_ADDR_DETAIL,
      P_REMARK1: "",
      P_CRUD: $NC.G_VAR.subData.CRUD
    }),

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
    alert("해당 사업부에서는 삭제처리를 하실수 없습니다. \n사업부정책(RI221)을 확인하십시오.");
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
  case "INOUT_CD":
    $NC.G_VAR.masterData.INOUT_CD = args.val;
    break;
  case "INBOUND_DATE":
    $NC.setValueDatePicker(args.view, args.val, "반입일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.INBOUND_DATE = $NC.getValue(args.view);
    $NC.G_VAR.subData.INBOUND_DATE = $NC.getValue(args.view);
    break;
  case "BU_DATE":
    $NC.setValueDatePicker(args.view, args.val, "주문일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.BU_DATE = $NC.getValue("#dtpBu_Date");

    var BU_DATE = $NC.getValue("#dtpBu_Date");
    for ( var row = 0; row < G_GRDDETAIL.data.getLength(); row++) {
      var rowData = G_GRDDETAIL.data.getItem(row);
      rowData.BU_DATE = BU_DATE;
      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDDETAIL.data.updateItem(rowData.id, rowData);
    }
    G_GRDDETAIL.data.refresh();
    break;
  case "BU_NO":
    $NC.G_VAR.masterData.BU_NO = args.val;
    var BU_NO = $NC.getValue("#edtBu_No");
    for ( var row = 0; row < G_GRDDETAIL.data.getLength(); row++) {
      var rowData = G_GRDDETAIL.data.getItem(row);
      rowData.BU_NO = BU_NO;
      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDDETAIL.data.updateItem(rowData.id, rowData);
    }
    G_GRDDETAIL.data.refresh();
    break;
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
      O_RESULT_DATA = $NP.getRIMallBrandInfo({
        queryParams: P_QUERY_PARAMS,
        errorMessage: "MALL과 해당 판매사로 등록된 딜이 없습니다."
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onMallBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showRIMallBrandPopup({
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
  case "ORDERER_ZIP_CD":
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
      onOrderPostPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showPostPopup({
        title: "우편번호 검색",
        columnTitle: ["우편번호", "주소"],
        queryParams: P_QUERY_PARAMS,
        queryCanAll: true,
        queryData: O_RESULT_DATA
      }, onOrderPostPopup, onOrderPostPopup);
    }
    return;
  case "REMARK1":
    $NC.G_VAR.masterData.REMARK1 = args.val;
    break;
  case "MALL_CD":
    $NC.G_VAR.masterData.MALL_CD = args.val;
    break;
  case "LOCATION_ID_CNT":
    $NC.G_VAR.masterData.LOCATION_ID_CNT = args.val;
    break;
  case "REFUND_WB_NO":
    $NC.G_VAR.masterData.REFUND_WB_NO = args.val;
    break;
  case "CARRIER_CD":
    $NC.G_VAR.masterData.CARRIER_CD = args.val;
    break;
  case "REFUND_SHIP_PRICE_CD":
    $NC.G_VAR.masterData.REFUND_SHIP_PRICE_CD = args.val;
    break;
  case "REFUND_SHIP_PRICE":
    $NC.G_VAR.masterData.REFUND_SHIP_PRICE = args.val;
    break;
  case "REFUND_PRICE_TYPE":
    $NC.G_VAR.masterData.REFUND_PRICE_TYPE = args.val;
    break;
  }

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }

}

function subDataOnChange(e, args) {

  // 온라인 데이터 변경에 대한 처리만 추가
  // Popup, DatePicker 같은 것이 없으므로 해당 값만 입력하도록 처리
  // 주문자 => 수령자 정보로 자동입력
  switch (args.col) {
  case "ORDERER_CD":
    $NC.G_VAR.subData.ORDERER_CD = args.val;
    break;
  case "ORDERER_NM":
    $NC.G_VAR.subData.ORDERER_NM = args.val;
    if ($NC.isNull($NC.G_VAR.subData.SHIPPER_NM)) {
      $NC.G_VAR.subData.SHIPPER_NM = args.val;
      $NC.setValue("#edtShipper_Nm", args.val);
    }
    break;
  case "ORDERER_TEL":
    $NC.G_VAR.subData.ORDERER_TEL = args.val;
    if ($NC.isNull($NC.G_VAR.subData.SHIPPER_TEL)) {
      $NC.G_VAR.subData.SHIPPER_TEL = args.val;
      $NC.setValue("#edtShipper_Tel", args.val);
    }
    break;
  case "ORDERER_HP":
    $NC.G_VAR.subData.ORDERER_HP = args.val;
    if ($NC.isNull($NC.G_VAR.subData.SHIPPER_HP)) {
      $NC.G_VAR.subData.SHIPPER_HP = args.val;
      $NC.setValue("#edtShipper_Hp", args.val);
    }
    break;
  case "ORDERER_ADDR_DETAIL":
    $NC.G_VAR.subData.ORDERER_ADDR_DETAIL = args.val;
    if ($NC.isNull($NC.G_VAR.subData.SHIPPER_ADDR_DETAIL)) {
      $NC.G_VAR.subData.SHIPPER_ADDR_DETAIL = args.val;
      $NC.setValue("#edtShipper_Addr_Detail", args.val);
    }
  case "ORDERER_ZIP_CD":
  case "ORDERER_ADDR_BASIC":
  case "ORDERER_EMAIL":
  case "ORDERER_MSG":
  case "MALL_MSG":
  case "SHIPPER_NM":
  case "SHIPPER_TEL":
  case "SHIPPER_HP":
  case "SHIPPER_ZIP_CD":
  case "SHIPPER_ADDR_BASIC":
  case "SHIPPER_ADDR_DETAIL":
  case "REFUND_WB_NO":
  case "CARRIER_CD":
    $NC.G_VAR.subData[args.col] = args.val;
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
    minWidth: 60,
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
    minWidth: 90,
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
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 70,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
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
  if ($NC.G_VAR.userData.P_POLICY_RI420 == "2") {
    $NC.setGridColumn(columns, {
      id: "VALID_DATE",
      field: "VALID_DATE",
      name: "유통기한",
      minWidth: 100,
      cssClass: "align-center",
      editor: Slick.Editors.Date
    });
    $NC.setGridColumn(columns, {
      id: "BATCH_NO",
      field: "BATCH_NO",
      name: "제조배치번호",
      minWidth: 90,
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
        P_CODE_GRP: "RI.RETURN_DIV",
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
    id: "RETURN_TEXT",
    field: "RETURN_TEXT",
    name: "반품상세내역",
    minWidth: 130,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_WEIGHT",
    field: "ENTRY_WEIGHT",
    name: "등록중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 70,
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
    id: "BUY_AMT",
    field: "BUY_AMT",
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
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_KEY",
    field: "BU_KEY",
    name: "전표키",
    minWidth: 100
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
    frozenColumn: 3
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

  // $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("DEAL_ID"), true);
}

function grdDetailOnBeforeEditCell(e, args) {

  // 반입등록 전표생성 가능여부 N -> 반입등록시 신규, 수정 불가능
  if ($NC.G_VAR.userData.P_POLICY_RI210 !== "Y") {
    return false;
  }

  var rowData = G_GRDDETAIL.data.getItem(args.row);
  // 신규 데이터일 때만 수정 가능한 컬럼
  if (args.column.field === "ITEM_CD") {

//    var rowData = G_GRDDETAIL.data.getItem(args.row);
    if (rowData) {
      // 신규 데이터가 아니면 코드 수정 불가
      if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
        return false;
      }
    }
  }

  // 예정정보가 없을 경우 수정 못하게 처리
  if (args.column.field === "ITEM_CD" || args.column.field === "ITEM_STATE_F" || args.column.field === "ITEM_LOT") {
    return $NC.isNull(rowData.ORDER_LINE_NO);
  }
  // 재고관리 기준 - 입고일자, 유효일자, 제조배치번호별 관리
  if (args.column.field === "VALID_DATE") {
    return $NC.G_VAR.userData.P_POLICY_RI420 === "2";
  }

  if (args.column.field === "BATCH_NO") {
    return $NC.G_VAR.userData.P_POLICY_RI420 === "2";
  }

  return true;
}

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
        P_VIEW_DIV: "2"
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
  case "ENTRY_QTY":
    rowData = grdDetailOnCalc(rowData);
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
        rowData.ENTRY_QTY = rowData.ORDER_QTY;
        rowData = grdDetailOnCalc(rowData, rowData.ENTRY_QTY);
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
          editMode: true
        });
        return false;
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

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

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
      P_VIEW_DIV: "2"
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
    break;
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

function grdDetailOnCalc(rowData, entry_Qty) {

if (!$NC.isNull(entry_Qty)) {
  rowData.ENTRY_QTY = Number(entry_Qty);
}
rowData.ENTRY_BOX = $NC.getB_Box(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
rowData.ENTRY_EA = $NC.getB_Ea(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
rowData.ENTRY_WEIGHT = $NC.getWeight(rowData.ENTRY_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);
if((!$NC.isNull(rowData.OPTION_QTY)) || (rowData.OPTION_QTY > 0)){
  rowData.ENTRY_QTY = rowData.OPTION_QTY * rowData.ENTRY_QTY;
} else {
  rowData.ENTRY_QTY = rowData.ENTRY_QTY;    
}
//rowData.ENTRY_QTY = rowData.OPTION_QTY * rowData.ENTRY_QTY;

var params = {
  ITEM_PRICE: rowData.BUY_PRICE,// 매입단가 또는 공급단가
  APPLY_PRICE: rowData.APPLY_PRICE,// 적용단가
  ITEM_QTY: rowData.ENTRY_QTY,// 상품수량
  ITEM_AMT: rowData.BUY_AMT,// 매입금액 또는 공급금액
  VAT_YN: rowData.VAT_YN,// 과세여부가 NULL일 경우는 부가세금액이 있는지로 체크
  VAT_AMT: rowData.VAT_AMT,// 부가세
  DC_AMT: rowData.DC_AMT,// 할인금액
  TOTAL_AMT: rowData.TOTAL_AMT,// 합계금액
  POLICY_VAL: $NC.G_VAR.userData.P_POLICY_RI190
};

rowData.BUY_AMT = $NC.getItem_Amt(params);
rowData.VAT_AMT = $NC.getVat_Amt(params);
rowData.TOTAL_AMT = $NC.getTotal_Amt(params);

rowData.CONFIRM_QTY = rowData.ENTRY_QTY;
rowData.PUTAWAY_QTY = rowData.ENTRY_QTY;

return rowData;
}

function onItemPopup(resultInfo) {

var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
if ($NC.isNull(rowData)) {
  return;
}
var focusCol;
if (!$NC.isNull(resultInfo)) {
  rowData.BRAND_CD = resultInfo.BRAND_CD;
  rowData.BRNAD_NM = resultInfo.BRAND_NM;
  rowData.ITEM_CD = resultInfo.ITEM_CD;
  rowData.ITEM_NM = resultInfo.ITEM_NM;
  rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
  rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;
  rowData.BOX_WEIGHT = resultInfo.BOX_WEIGHT;
  rowData.BUY_PRICE = resultInfo.BUY_PRICE;
  rowData.APPLY_PRICE = 0;
  rowData.BUY_PRICE = resultInfo.BUY_PRICE;
  rowData.OPTION_QTY = resultInfo.DEAL_ITEM_QTY;
  if ($NC.G_VAR.userData.P_POLICY_RI190 == "2") {
    rowData.APPLY_PRICE = resultInfo.BUY_PRICE;
  }
  rowData.DC_PRICE = 0;
  rowData.BUY_AMT = 0;
  rowData.VAT_YN = resultInfo.VAT_YN;
  rowData.VAT_AMT = 0;
  rowData.DC_AMT = 0;
  rowData.VALID_DATE = "";
  rowData.BATCH_NO = "";
  rowData = grdDetailOnCalc(rowData);
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
  rowData.VALID_DATE = "";
  rowData.BATCH_NO = "";
  rowData.BOX_WEIGHT = 0;
  rowData.ENTRY_WEIGHT = 0;
  rowData.BUY_PRICE = 0;
  rowData.DC_PRICE = 0;
  rowData.APPLY_PRICE = 0;
  rowData.BUY_AMT = 0;
  rowData.VAT_AMT = 0;
  rowData.DC_AMT = 0;
  rowData.TOTAL_AMT = 0;
  rowData.VAT_YN = "";
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

function onGetLocationIdCnt(ajaxData) {

var resultData = $NC.toArray(ajaxData);
if (!$NC.isNull(resultData)) {
  if (resultData.O_MSG === "OK") {
    $NC.setValue("#edtLocation_Id_Cnt", resultData.O_LOCATION_ID_CNT);
  } else {
    $NC.setValue("#edtLocation_Id_Cnt", "1");
  }

  $NC.G_VAR.masterData.LOCATION_ID_CNT = $NC.getValue("#edtLocation_Id_Cnt");
  // if ($NC.G_VAR.masterData.CRUD === "R") {
  // $NC.G_VAR.masterData.CRUD = "U";
  // }
}
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

function setLocationIdCnt() {

if ($NC.G_VAR.userData.P_PROCESS_CD !== "A") {
  return;
}

// 값 오류 체크는 안함
var CENTER_CD = $NC.G_VAR.userData.P_MASTER_DS.CENTER_CD;
var BU_CD = $NC.G_VAR.userData.P_MASTER_DS.BU_CD;
var ORDER_DATE = $NC.G_VAR.userData.P_MASTER_DS.ORDER_DATE;
var ORDER_NO = $NC.G_VAR.userData.P_MASTER_DS.ORDER_NO;
var IN_GRP = $NC.G_VAR.userData.P_MASTER_DS.INOUT_SUB_CD;
// var POLICY_RI230 = $NC.G_VAR.userData.P_POLICY_RI230;

// 데이터 조회
$NC.serviceCall("/RIM2010E/callSP.do", {
  P_QUERY_ID: "RI_POLICY_LOCID_GETCNT",
  P_QUERY_PARAMS: $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_ORDER_DATE: ORDER_DATE,
    P_ORDER_NO: ORDER_NO,
    P_IN_GRP: IN_GRP,
    P_POLICY_RI230: ""
  })
}, onGetLocationIdCnt);
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

  $NP.showRIMallBrandPopup({
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

function showDeliveryPopup() {

  var CUST_CD = $NC.getValue("#edtCust_Cd");
  
  $NP.showDeliveryPopup({
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

function showOrderPostPopup() {
  
  $NP.showPostPopup({
    P_ADDR_NM: "%"
  }, onOrderPostPopup, function() {
    $NC.setFocus("#edtOrderer_Addr_Detail", true);
  });
}

function onOrderPostPopup(resultInfo) {
  
  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.subData.ORDERER_ZIP_CD = resultInfo.ZIP_CD;
    $NC.G_VAR.subData.ORDERER_ADDR_BASIC = resultInfo.ADDR_NM_REAL;
    if ($NC.isNull($NC.G_VAR.subData.SHIPPER_ADDR_BASIC)) {
      $NC.G_VAR.subData.SHIPPER_ZIP_CD = resultInfo.ZIP_CD;
      $NC.G_VAR.subData.SHIPPER_ADDR_BASIC = resultInfo.ADDR_NM_REAL;
      $NC.setValue("#edtShipper_Zip_Cd", resultInfo.ZIP_CD);
      $NC.setValue("#edtShipper_Addr_Basic", resultInfo.ADDR_NM_REAL);
    }
    $NC.setValue("#edtOrderer_Zip_Cd", resultInfo.ZIP_CD);
    $NC.setValue("#edtOrderer_Addr_Basic", resultInfo.ADDR_NM_REAL);
  }
  
  $NC.setFocus("#edtOrderer_Addr_Detail", true);
  
  if ($NC.G_VAR.subData.CRUD === "R") {
    $NC.G_VAR.subData.CRUD = "U";
  }
}

function showPostPopup() {

$NP.showPostPopup({
  P_ADDR_NM: "%"
}, onPostPopup, function() {
  $NC.setFocus("#edtShipper_Addr_Detail", true);
});
}

function onPostPopup(resultInfo) {

if (!$NC.isNull(resultInfo)) {
  $NC.G_VAR.subData.SHIPPER_ZIP_CD = resultInfo.ZIP_CD;
  $NC.G_VAR.subData.SHIPPER_ADDR_BASIC = resultInfo.ADDR_NM_REAL;
  $NC.setValue("#edtShipper_Zip_Cd", resultInfo.ZIP_CD);
  $NC.setValue("#edtShipper_Addr_Basic", resultInfo.ADDR_NM_REAL);
}

$NC.setFocus("#edtShipper_Addr_Detail", true);

if ($NC.G_VAR.subData.CRUD === "R") {
  $NC.G_VAR.subData.CRUD = "U";
}
}