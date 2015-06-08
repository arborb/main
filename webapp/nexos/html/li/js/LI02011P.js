/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 예정이 존재하는 데이터인지...
    existOrder: false,
    // 마스터 데이터
    masterData: null
  });

  $NC.setInitDatePicker("#dtpInbound_Date");
  
  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel);
  $("#btnVendor_Cd").click(showVendorPopup);
  $("#btnOwn_Brand_Cd").click(showOwnBranPopup);
  $("#btnEntryNew").click(_New);
  $("#btnEntryDelete").click(_Delete);
  $("#btnEntrySave").click(_Save);

  // 그리드 초기화
  grdDetailInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  // 입고등록 전표생성 가능여부 N -> 입고등록시 신규, 수정 불가능
  if ($NC.G_VAR.userData.P_POLICY_LI210 !== "Y") {
    $NC.setEnable("#btnEntryNew", false);
    $NC.setEnable("#btnEntryDelete", false);
  }

  // 로케이션ID 사용기준 3 -> 로케이션ID 사용 함 - 사용자 수작업 매핑
  if ($NC.G_VAR.userData.P_POLICY_LI230 === "3") {
    $("#lblLocation_Id_Cnt").show();
    $("#edtLocation_Id_Cnt").show();
  }

  
  $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
  $NC.setValue("#edtCenter_Cd", $NC.G_VAR.userData.P_CENTER_CD);
  $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);
  $NC.setValue("#edtCust_Cd", $NC.G_VAR.userData.P_CUST_CD);
  $NC.setValue("#edtOwn_Brand_Cd", $NC.G_VAR.userData.P_BRAND_CD);
  $NC.setValue("#edtOwn_Brand_Nm", $NC.G_VAR.userData.P_BRAND_NM);

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {

    var INBOUND_DATE = $NC.getValue("#dtpInbound_Date");
    // var INOUT_CD = $NC.getValue("#cboInout_Cd");
    var SHIP_TYPE = $NC.getValue("#cboShip_type_Cd");
    var SHIP_PRICE_TYPE = $NC.getValue("#cboShip_price_type_Cd");
    var INORDER_TYPE = $NC.getValue("#cboInorder_type_Cd");
    var CARRIER_CD = $NC.getValue("#cboCarrier_Cd");
    
    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      INBOUND_DATE: INBOUND_DATE,
      INBOUND_NO: "",
      INOUT_CD: "",// INOUT_CD,
      INBOUND_STATE: "20",
      CUST_CD: $NC.G_VAR.userData.P_CUST_CD,
      VENDOR_CD: "",
      CAR_NO: "",
      PLANED_DATETIME: "",
      LOCATION_ID_CNT: "",
      REMARK1: "",
      REMARK2: "",
      ORDER_DATE: "",
      ORDER_NO: "",
      SHIP_TYPE: SHIP_TYPE,
      SHIP_PRICE_TYPE: SHIP_PRICE_TYPE,
      SHIP_PRICE: "",
      CARRIER_CD: CARRIER_CD,
      INBOUND_WB_NO: "",
      INORDER_TYPE: INORDER_TYPE,
      OWN_BRAND_CD: "",
      REFUND_SHIP_PRICE_CD: "",
      CRUD: "C"
    };

    $NC.setFocus("#edtVendor_Cd");
  } else {
    // 예정 -> 등록, 등록 수정
    var INBOUND_DATE;
    var INBOUND_NO;
    var INBOUND_STATE;
    var CRUD;
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

    // 마스터 데이터 세팅
    $NC.setValue("#edtVendor_Cd", masterDS.VENDOR_CD);
    $NC.setValue("#edtVendor_Nm", masterDS.VENDOR_NM);
    // $NC.setValue("#cboInout_Cd", masterDS.INOUT_CD);
    $NC.setValue("#edtCar_No", masterDS.CAR_NO);
    $NC.setValue("#edtRemark1", masterDS.REMARK1);
    $NC.setValue("#edtRemark2", masterDS.REMARK2);
    $NC.setValue("#edtLocation_Id_Cnt", masterDS.LOCATION_ID_CNT);

    $NC.setValue("#edtOrder_Date", masterDS.ORDER_DATE);
    $NC.setValue("#edtOrder_No", masterDS.ORDER_NO);
    $NC.setValue("#edtBu_Date", masterDS.BU_DATE);
    $NC.setValue("#edtBu_No", masterDS.BU_NO);

    $NC.setValue("#cboShip_type_Cd", masterDS.SHIP_TYPE);
    $NC.setValue("#cboShip_price_type_Cd", masterDS.SHIP_PRICE_TYPE);
    $NC.setValue("#edtShip_Price", masterDS.SHIP_PRICE);
    $NC.setValue("#cboInorder_type_Cd", masterDS.INORDER_TYPE);
    $NC.setValue("#cboCarrier_Cd", masterDS.CARRIER_CD);
    $NC.setValue("#edtInbound_Wb_No", masterDS.INBOUND_WB_NO);
    $NC.getValue("#cboRefund_Price_Type", masterDS.REFUND_SHIP_PRICE_CD);

    $NC.G_VAR.masterData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      INBOUND_DATE: INBOUND_DATE,
      INBOUND_NO: INBOUND_NO,
      INOUT_CD: masterDS.INOUT_CD,
      INBOUND_STATE: INBOUND_STATE,
      CUST_CD: masterDS.CUST_CD,
      VENDOR_CD: masterDS.VENDOR_CD,
      CAR_NO: masterDS.CAR_NO,
      PLANED_DATETIME: masterDS.PLANED_DATETIME,
      LOCATION_ID_CNT: masterDS.LOCATION_ID_CNT,
      REMARK1: masterDS.REMARK1,
      REMARK2: masterDS.REMARK2,
      ORDER_DATE: masterDS.ORDER_DATE,
      ORDER_NO: masterDS.ORDER_NO,
      SHIP_TYPE: masterDS.SHIP_TYPE,
      SHIP_PRICE_TYPE: masterDS.SHIP_PRICE_TYPE,
      SHIP_PRICE: masterDS.SHIP_PRICE,
      CARRIER_CD: masterDS.CARRIER_CD,
      INBOUND_WB_NO: masterDS.INBOUND_WB_NO,
      INORDER_TYPE: masterDS.INORDER_TYPE,
      REFUND_SHIP_PRICE_CD: masterDS.REFUND_SHIP_PRICE_CD,
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
              INBOUND_DATE: rowData.INBOUND_DATE,
              INBOUND_NO: rowData.INBOUND_NO,
              LINE_NO: "",
              INBOUND_STATE: "20",
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
              ENTRY_BOX: $NC.getB_Box(ORDER_QTY, rowData.QTY_IN_BOX),
              ENTRY_EA: $NC.getB_Ea(ORDER_QTY, rowData.QTY_IN_BOX),
              CONFIRM_QTY: ORDER_QTY,
              PUTAWAY_QTY: ORDER_QTY,
              BOX_WEIGHT: rowData.BOX_WEIGHT,
              ENTRY_WEIGHT: $NC.getWeight(ORDER_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT),
              BUY_PRICE: rowData.BUY_PRICE,
              DC_PRICE: rowData.DC_PRICE,
              APPLY_PRICE: rowData.APPLY_PRICE,
              BUY_AMT: rowData.BUY_AMT,
              VAT_YN: rowData.VAT_YN,
              VAT_AMT: rowData.VAT_AMT,
              DC_AMT: rowData.DC_AMT,
              TOTAL_AMT: rowData.TOTAL_AMT,
              ORDER_DATE: rowData.ORDER_DATE,
              ORDER_NO: rowData.ORDER_NO,
              ORDER_LINE_NO: rowData.ORDER_LINE_NO,
              BU_DATE: masterDS.BU_DATE,
              BU_NO: masterDS.BU_NO,
              BU_LINE_NO: rowData.BU_LINE_NO,
              BU_KEY: rowData.BU_KEY,
              REMARK1: rowData.REMARK1,
              VAT_YN: rowData.VAT_YN,
              id: $NC.getGridNewRowId(),
              CRUD: CRUD
            };
            G_GRDDETAIL.data.addItem(newRowData);
          }
        }
      } else {
         for( var row in detailDS ) {
          rowData = detailDS[row];
          var newRowData = {
            CENTER_CD: rowData.CENTER_CD,
            BU_CD: rowData.BU_CD,
            INBOUND_DATE: rowData.INBOUND_DATE,
            INBOUND_NO: rowData.INBOUND_NO,
            LINE_NO: rowData.LINE_NO,
            INBOUND_STATE: null,// rowData.INBOUND_STATE,
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
            ORDER_DATE: rowData.ORDER_DATE,
            ORDER_NO: rowData.ORDER_NO,
            ORDER_LINE_NO: rowData.ORDER_LINE_NO,
            BU_DATE: rowData.BU_DATE,
            BU_NO: rowData.BU_NO,
            BU_LINE_NO: rowData.BU_LINE_NO,
            BU_KEY: rowData.BU_KEY,
            REMARK1: rowData.REMARK1,
            VAT_YN: rowData.VAT_YN,
            id: $NC.getGridNewRowId(),
            CRUD: CRUD
          };
          G_GRDDETAIL.data.addItem(newRowData);
        }
      }
    } finally {
      G_GRDDETAIL.data.endUpdate();
    }

    // 예정으로 등록/ 등록수정
    $NC.setEnable("#cboInout_Cd", false);
    $NC.setEnable("#edtVendor_Cd", false);
    $NC.setEnable("#btnVendor_Cd", false);
    $NC.setEnable("#edtOwn_Brand_Cd", false);
    $NC.setEnable("#btnOwn_Brand_Cd", false);
    // $NC.setEnable("#edtLocation_Id_Cnt", false);
    // $NC.setEnable("#cboInorder_type_Cd", false);
    // 예정으로 등록
    if ($NC.G_VAR.userData.P_PROCESS_CD == "A") {
      // 예정으로 등록 시 추가/삭제 허용 기준
      // NN - 추가/삭제 불가능
      // NY - 삭제만 가능
      // YN - 추가만 가능
      // YY - 추가/삭제 가능
      var POLICY_221 = $NC.G_VAR.userData.P_POLICY_LI221.match(/N|Y/gi);
      if ($NC.isNull(POLICY_221)) {
        POLICY_221 = ["N", "N"];
      }
      $NC.setEnable("#btnEntryNew", POLICY_221[0] == "Y");
      $NC.setEnable("#btnEntryDelete", POLICY_221[1] == "Y");
    }
    // 등록수정
    else if ($NC.G_VAR.userData.P_PROCESS_CD == "B") {
      $NC.setEnable("#dtpInbound_Date", false);
    }

    setLocationIdCnt();

    $NC.G_VAR.existOrder = !$NC.isNull($NC.getValue("#edtOrder_No"));
    $NC.setFocus("#edtCar_No");

    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

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
  
  // 조회조건 - 운송사구분 세팅

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
  
  // 조회조건 - 입고운송구분 세팅
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
    selector: "#cboShip_type_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.SHIP_TYPE = $NC.getValue("#cboShip_type_Cd");
      } else {
        $NC.setValue("#cboShip_type_Cd", $NC.G_VAR.masterData.SHIP_TYPE);
      }
    }
  });

  // 조회조건 - 운송비구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "TRANS_FEE_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: "",
      P_SUB_CD3: ""
    })
  }, {
    selector: "#cboShip_price_type_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.SHIP_PRICE_TYPE = $NC.getValue("#cboShip_price_type_Cd");
      } else {
        $NC.setValue("#cboShip_price_type_Cd", $NC.G_VAR.masterData.SHIP_PRICE_TYPE);
      }
    }
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
    selector: "#cboInorder_type_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.INORDER_TYPE = $NC.getValue("#cboInorder_type_Cd");
      } else {
        $NC.setValue("#cboInorder_type_Cd", $NC.G_VAR.masterData.INORDER_TYPE);
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
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 300;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_OFFSET.masterViewHeight
      - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divMasterView", clientWidth, $NC.G_OFFSET.masterViewHeight);
  $NC.resizeContainer("#divDetailView", clientWidth, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, clientHeight - $NC.G_LAYOUT.header);
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
  masterDataOnChange(e, {
    view: view,
    col: id,
    val: val
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

  var VENDOR_CD = $NC.getValue("#edtVendor_Cd");
  if ($NC.isNull(VENDOR_CD)) {
    alert("먼저 공급처 코드를 입력하십시오.");
    $NC.setFocus("#edtVendor_Cd");
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

    INBOUND_DATE: $NC.G_VAR.masterData.INBOUND_DATE,
    INBOUND_NO: $NC.G_VAR.masterData.INBOUND_NO,
    LINE_NO: "",
    INBOUND_STATE: $NC.G_VAR.masterData.INBOUND_STATE || "20",
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
    QTY_IN_BOX: 1,
    VALID_DATE: "",
    BATCH_NO: "",
    ORDER_QTY: 0,
    ENTRY_QTY: 0,
    ENTRY_BOX: 0,
    ENTRY_EA: 0,
    CONFIRM_QTY: 0,
    PUTAWAY_QTY: 0,
    BOX_WEIGHT: 0,
    ENTRY_WEIGHT: 0,
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
    BU_DATE: $NC.G_VAR.masterData.BU_DATE,
    BU_NO: $NC.G_VAR.masterData.BU_NO,
    BU_LINE_NO: "",
    BU_KEY: "",
    REMARK1: "",
    VAT_YN: "N",
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

  if ($NC.isNull($NC.G_VAR.masterData.INBOUND_DATE)) {
    alert("먼저 입고일자를 입력하십시오.");
    $NC.setFocus("#dtpInbound_Date");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.VENDOR_CD)) {
    alert("먼저 공급처 코드를 입력하십시오.");
    $NC.setFocus("#edtVendor_Cd");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
    alert("먼저 입고구분을 선택하십시오.");
    $NC.setFocus("#cboInout_Cd");
    return;
  }

  if ($NC.G_VAR.userData.P_POLICY_LI230 === "3") {
    if ($NC.isNull($NC.G_VAR.masterData.LOCATION_ID_CNT)) {
      alert("먼저 로케이션ID수를 입력하십시오.");
      $NC.setFocus("#edtLocation_Id_Cnt");
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
        P_INBOUND_DATE: $NC.G_VAR.masterData.INBOUND_DATE,
        P_INBOUND_NO: $NC.G_VAR.masterData.INBOUND_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_INBOUND_STATE: rowData.INBOUND_STATE,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE, 
        P_BRAND_CD: rowData.BRAND_CD,
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
        P_VAT_YN: rowData.VAT_YN,
        P_DC_AMT: rowData.DC_AMT,
        P_TOTAL_AMT: rowData.TOTAL_AMT,
        P_ORDER_DATE: rowData.ORDER_DATE,
        P_ORDER_NO: rowData.ORDER_NO,
        P_ORDER_LINE_NO: rowData.ORDER_LINE_NO,
        P_BU_DATE: rowData.BU_DATE,
        P_BU_NO: rowData.BU_NO,
        P_BU_LINE_NO: rowData.BU_LINE_NO,
        P_BU_KEY: rowData.BU_KEY,
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
  if ($NC.G_VAR.masterData.CRUD === "R" && detailDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }
  
  $NC.serviceCall("/LI02010E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      // P_BRAND_CD: $NC.G_VAR.rowData.BRAND_CD,
      P_INBOUND_DATE: $NC.G_VAR.masterData.INBOUND_DATE,
      P_INBOUND_NO: $NC.G_VAR.masterData.INBOUND_NO,
      P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
      P_INBOUND_STATE: $NC.G_VAR.masterData.INBOUND_STATE,
      P_CUST_CD: $NC.G_VAR.masterData.CUST_CD,
      P_VENDOR_CD: $NC.G_VAR.masterData.VENDOR_CD,
      P_CAR_NO: $NC.G_VAR.masterData.CAR_NO,
      P_PLANED_DATETIME: $NC.G_VAR.masterData.PLANED_DATETIME,
      P_LOCATION_ID_CNT: $NC.G_VAR.masterData.LOCATION_ID_CNT,
      P_REMARK1: $NC.G_VAR.masterData.REMARK1,
      P_REMARK2: $NC.G_VAR.masterData.REMARK2,
      P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
      P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
      P_SHIP_TYPE: $NC.G_VAR.masterData.SHIP_TYPE,
      P_SHIP_PRICE_TYPE: $NC.G_VAR.masterData.SHIP_PRICE_TYPE,
      P_SHIP_PRICE: $NC.G_VAR.masterData.SHIP_PRICE,
      P_CARRIER_CD: $NC.G_VAR.masterData.CARRIER_CD,
      P_INBOUND_WB_NO: $NC.G_VAR.masterData.INBOUND_WB_NO,
      P_INORDER_TYPE: $NC.G_VAR.masterData.INORDER_TYPE,
      P_REFUND_SHIP_PRICE_CD: $NC.G_VAR.masterData.REFUND_SHIP_PRICE_CD,
      P_CRUD: $NC.G_VAR.masterData.CRUD
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
  case "OWN_BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      var CUST_CD = $NC.getValue("#edtCust_Cd");
      var BU_CD = $NC.getValue("#edtBu_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: args.val
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
  case "VENDOR_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      var CUST_CD = $NC.getValue("#edtCust_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
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
  case "INOUT_CD":
    // 수송입고는 신규 등록 불가
    if (args.val === "E20") {
      if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {
        alert("수송입고는 신규로 등록할 수 없습니다.");
        $NC.setValue(args.view, "E10");
        $NC.setFocus(args.view);
      }
    }
    $NC.G_VAR.masterData.INOUT_CD = args.val;
    break;
  case "INBOUND_DATE":
    $NC.setValueDatePicker(args.view, args.val, "입고일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.INBOUND_DATE = $NC.getValue(args.view);
    break;
  case "CAR_NO":
  case "REMARK1":
  case "REMARK2":
  case "LOCATION_ID_CNT":
    $NC.G_VAR.masterData[args.col] = args.val;
    break;
  case "SHIP_TYPE_CD":
    if(args.val !== '1') {
      $("#lblCarrier_Type").hide();
      $("#cboCarrier_Cd").hide();
      $("#lblInbound_Wb_No").hide();
      $("#edtInbound_Wb_No").hide(); 

      $NC.setValue("#cboCarrier_Cd");
      $NC.setValue("#edtInbound_Wb_No");
      $NC.G_VAR.masterData.CARRIER_CD = "";
      $NC.G_VAR.masterData.INBOUND_WB_NO = "";
    } else {
      $("#lblCarrier_Type").show();
      $("#cboCarrier_Cd").show();
      $("#lblInbound_Wb_No").show();
      $("#edtInbound_Wb_No").show();
      
      $NC.setValue("#cboCarrier_Cd", 0);
      $NC.G_VAR.masterData.CARRIER_CD = $NC.getValue("#cboCarrier_Cd");;
    }
    $NC.G_VAR.masterData.SHIP_TYPE = args.val;
    break;
  case "SHIP_PRICE_TYPE_CD":
    $NC.G_VAR.masterData.SHIP_PRICE_TYPE = args.val;
    break;
  case "SHIP_PRICE":
    $NC.G_VAR.masterData.SHIP_PRICE = args.val;
    break;
  case "INBOUND_WB_NO":
    $NC.G_VAR.masterData.INBOUND_WB_NO = args.val;
    break;
  case "CARRIER_CD":
    $NC.G_VAR.masterData.CARRIER_CD = args.val;
    break;
  case "INORDER_TYPE_CD":
    $NC.G_VAR.masterData.INORDER_TYPE = args.val;
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
    editor: Slick.Editors.Popup,
    editorOptions: {
      isKeyField: true,
      onPopup: grdDetailOnPopup
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
    name: "브랜드",
    minWidth: 80
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
  if ($NC.G_VAR.userData.P_POLICY_LI420 == "2") {
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
    minWidth: 80
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

  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
}

function grdDetailOnBeforeEditCell(e, args) {

  // 입고등록 전표생성 가능여부 N -> 입고등록시 신규, 수정 불가능
  if ($NC.G_VAR.userData.P_POLICY_LI210 !== "Y") {
    return false;
  }
  var rowData = args.item;
  // 신규 데이터일 때만 수정 가능한 컬럼
  if (args.column.field === "ITEM_CD") {
    if (rowData) {
      // 신규 데이터가 아니면 코드 수정 불가
      if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
        return false;
      }
    }
  }

  switch (args.column.field) {
  case "ITEM_CD":
  case "ITEM_STATE_F":
  case "ITEM_LOT":
    return $NC.isNull(rowData.ORDER_LINE_NO);
  case "VALID_DATE":
  case "BATCH_NO":
    // 재고관리 기준 - 입고일자, 유효일자, 배치번호별 관리
    return $NC.G_VAR.userData.P_POLICY_LI420 === "2";
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
        P_BRAND_CD: $NC.getValue("#edtOwn_Brand_Cd",true),
        P_ITEM_CD: rowData.ITEM_CD,
        P_VIEW_DIV: "1",
        P_DEPART_CD: "%",
        P_LINE_CD: "%",
        P_CLASS_CD: "%",
        P_VENDOR_CD: ""
      };
      O_RESULT_DATA = $NP.getItemVendorInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopupWithVendorCd({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemPopup, onItemPopup);
    }
    return;
  case "ENTRY_QTY":
    rowData = grdDetailOnCalc(rowData);
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
      if ($NC.G_VAR.existOrder && $NC.G_VAR.userData.P_POLICY_LI220 !== "1") {
        if (Number(rowData.ORDER_QTY) < ENTRY_QTY) {
          alert("등록수량이 예정수량을 초과할 수 없습니다.");

          rowData = grdDetailOnCalc(rowData, rowData.ORDER_QTY);
          G_GRDDETAIL.data.updateItem(rowData.id, rowData);
          $NC.setGridSelectRow(G_GRDDETAIL, {
            selectRow: row,
            activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
            editMode: true
          });
          return false;
        }
      }
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
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

  switch (args.column.field) {
  case "ITEM_CD":
    $NP.showItemPopupWithVendorCd({
      P_BU_CD: rowData.BU_CD,
      P_BRAND_CD: $NC.getValue("#edtOwn_Brand_Cd"),
      P_ITEM_CD: "%",
      P_VIEW_DIV: "1",
      P_DEPART_CD: "%",
      P_LINE_CD: "%",
      P_CLASS_CD: "%",
      P_VENDOR_CD: ""
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

  var params = {
    ITEM_PRICE: rowData.BUY_PRICE,// 매입단가 또는 공급단가
    APPLY_PRICE: rowData.APPLY_PRICE,// 적용단가
    ITEM_QTY: rowData.ENTRY_QTY,// 상품수량
    ITEM_AMT: rowData.BUY_AMT,// 매입금액 또는 공급금액
    VAT_YN: rowData.VAT_YN,// 과세여부가 NULL일 경우는 부가세금액이 있는지로 체크
    VAT_AMT: rowData.VAT_AMT,// 부가세
    DC_AMT: rowData.DC_AMT,// 할인금액
    TOTAL_AMT: rowData.TOTAL_AMT,// 합계금액
    POLICY_VAL: $NC.G_VAR.userData.P_POLICY_LI190
  };

  rowData.BUY_AMT = $NC.getItem_Amt(params);
  rowData.VAT_AMT = $NC.getVat_Amt(params);
  rowData.TOTAL_AMT = $NC.getTotal_Amt(params);

  rowData.CONFIRM_QTY = rowData.ENTRY_QTY;
  rowData.PUTAWAY_QTY = rowData.ENTRY_QTY;

  return rowData;
}


/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {

  var BU_CD = $NC.getValue("#edtBu_Cd");
  var CUST_CD = $NC.getValue("#edtCust_Cd");

  $NP.showOwnBranPopup({
    P_CUST_CD:  CUST_CD,   
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtOwn_Brand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {

    $NC.G_VAR.masterData.OWN_BRAND_CD = resultInfo.OWN_BRAND_CD;
    $NC.setValue("#edtOwn_Brand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtOwn_Brand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtOwn_Brand_Cd");
    $NC.setValue("#edtOwn_Brand_Nm");
    $NC.setFocus("#edtOwn_Brand_Cd", true);
  }
  onChangingCondition();
}


function showVendorPopup() {

  var CUST_CD = $NC.getValue("#edtCust_Cd");

  $NP.showVendorPopup({
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
    rowData.ITEM_CD = resultInfo.ITEM_CD;
    rowData.ITEM_NM = resultInfo.ITEM_NM;
    rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
    rowData.BRAND_CD = resultInfo.BRAND_CD;
    rowData.BRAND_NM = resultInfo.BRAND_NM;
    rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;
    rowData.BOX_WEIGHT = resultInfo.BOX_WEIGHT;
    rowData.BUY_PRICE = resultInfo.BUY_PRICE;
    if ($NC.G_VAR.userData.P_POLICY_LI190 == "2") {
      rowData.APPLY_PRICE = resultInfo.BUY_PRICE;
    }
    rowData.VAT_YN = resultInfo.VAT_YN;
    rowData.VALID_DATE = "";
    rowData.BATCH_NO = "";
    rowData = grdDetailOnCalc(rowData);

    focusCol = G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY");
  } else {
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";
    rowData.ITEM_SPEC = "";
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
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

function onGetLocationIdCnt(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
      $NC.setValue("#edtLocation_Id_Cnt", resultData.O_LOCATION_ID_CNT);
    } else {
      $NC.setValue("#edtLocation_Id_Cnt", "1");
    }

    $NC.G_VAR.masterData.LOCATION_ID_CNT = $NC.getValue("#edtLocation_Id_Cnt");
  }
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

  // 데이터 조회
  $NC.serviceCall("/LI02010E/callSP.do", {
    P_QUERY_ID: "LI_POLICY_LOCID_GETCNT",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_ORDER_DATE: ORDER_DATE,
      P_ORDER_NO: ORDER_NO,
      P_IN_GRP: IN_GRP,
      P_POLICY_LI230: "",
      P_POLICY_LI330: "",
      P_POLICY_LI420: ""
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