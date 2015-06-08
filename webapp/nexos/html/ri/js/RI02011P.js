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

  $NC.setInitDatePicker("#dtpInbound_Date");

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel);
  $("#btnDelivery_Cd").click(showDeliveryPopup);
  $("#btnRDelivery_Cd").click(showRDeliveryPopup);
  $("#btnCar_Cd").click(showCarPopup);
  $("#btnOwn_Brand_Cd").click(showOwnBranPopup);

  $("#btnEntryNew").click(_New);
  $("#btnEntryDelete").click(_Delete);
  $("#btnEntrySave").click(_Save);

  $NC.setInitDatePicker("#dtpInbound_Date");

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
    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      INBOUND_DATE: INBOUND_DATE,
      INBOUND_NO: "",
      INOUT_CD: "",
      INBOUND_STATE: "20",
      CUST_CD: $NC.G_VAR.userData.P_CUST_CD,
      DELIVERY_CD: "",
      RDELIVERY_CD: "",
      CAR_CD: "",
      CAR_NM: "",
      OWN_BRAND_CD: "",
      PLANED_DATETIME: "",
      LOCATION_ID_CNT: "",
      REMARK1: "",
      ORDER_DATE: "",
      ORDER_NO: "",
      BU_DATE: "",
      BU_NO: "",
      CRUD: "C"
    };

    $NC.setFocus("#edtOwn_Brand_Cd");
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

    // 마스터 데이터 세팅
    $NC.setValue("#edtDelivery_Cd", masterDS.DELIVERY_CD);
    $NC.setValue("#edtDelivery_Nm", masterDS.DELIVERY_NM);
    $NC.setValue("#edtRDelivery_Cd", masterDS.RDELIVERY_CD);
    $NC.setValue("#edtRDelivery_Nm", masterDS.RDELIVERY_NM);
    $NC.setValue("#edtOwn_Brand_Cd", masterDS.OWN_BRAND_CD);
    $NC.setValue("#edtOwn_Brand_Nm", masterDS.OWN_BRAND_NM);
    $NC.setValue("#edtCar_Cd", masterDS.CAR_CD);
    $NC.setValue("#edtCar_Nm", masterDS.CAR_NM);
//    $NC.setValue("#edtLocation_Id_Cnt", masterDS.LOCATION_ID_CNT);
    $NC.setValue("#edtOrder_Date", masterDS.ORDER_DATE);
    $NC.setValue("#edtOrder_No", masterDS.ORDER_NO);
    $NC.setValue("#edtBu_Date", masterDS.BU_DATE);
    $NC.setValue("#edtBu_No", masterDS.BU_NO);
    $NC.setValue("#edtRemark1", masterDS.REMARK1);

    $NC.G_VAR.masterData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      INBOUND_DATE: INBOUND_DATE,
      INBOUND_NO: INBOUND_NO,
      INOUT_CD: masterDS.INOUT_CD,
      INBOUND_STATE: INBOUND_STATE,
      CUST_CD: masterDS.CUST_CD,
      DELIVERY_CD: masterDS.DELIVERY_CD,
      DELIVERY_NM: masterDS.DELIVERY_NM,
      RDELIVERY_CD: masterDS.RDELIVERY_CD,
      RDELIVERY_NM: masterDS.RDELIVERY_NM,
      OWN_BRAND_CD: masterDS.OWN_BRAND_CD,
      CAR_CD: masterDS.CAR_CD,
      CAR_NM: masterDS.CAR_NM,
      LOCATION_ID_CNT: masterDS.LOCATION_ID_CNT,
      REMARK1: masterDS.REMARK1,
      PLANED_DATETIME: masterDS.PLANED_DATETIME,
      ORDER_DATE: masterDS.ORDER_DATE,
      ORDER_NO: masterDS.ORDER_NO,
      BU_DATE: masterDS.BU_DATE,
      BU_NO: masterDS.BU_NO,
      CRUD: CRUD
    };

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
          isDisable = true;
          CRUD = "C";
        } else {
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
          RETURN_DIV: rowData.RETURN_DIV,
          RETURN_DIV_F: rowData.RETURN_DIV_F,
          RETURN_COMMENT: rowData.RETURN_COMMENT,
          ORDER_DATE: rowData.ORDER_DATE,
          ORDER_NO: rowData.ORDER_NO,
          ORDER_LINE_NO: rowData.ORDER_LINE_NO,
          BU_DATE: masterDS.BU_DATE,
          BU_NO: masterDS.BU_NO,
          BU_LINE_NO: rowData.BU_LINE_NO,
          BU_KEY: rowData.BU_KEY,
          REMARK1: rowData.REMARK1,
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
      P_SUB_CD1: "E3",
      P_SUB_CD2: "%"
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

//  setLocationIdCnt();

  // 수정일 경우 입력불가 항목 비활성화 처리
  setMasterDisable(isDisable);

}

function setMasterDisable(isDisable) {

  // 수정불가
//  $NC.setEnable("#edtLocation_Id_Cnt", false);

  // 수정일 경우 입력불가 항목 비활성화 처리
  if ($NC.G_VAR.userData.P_PROCESS_CD === "B") {
    $NC.setEnable("#dtpInbound_Date", false);
  }

  $NC.setEnable("#cboInout_Cd", !isDisable);
  $NC.setEnable("#edtDelivery_Cd", !isDisable);
  $NC.setEnable("#btnDelivery_Cd", !isDisable);
  $NC.setEnable("#edtOwn_Brand_Cd", !isDisable);
  $NC.setEnable("#btnOwn_Brand_Cd", !isDisable);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 155;
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

  var DELIVERY_CD = $NC.getValue("#edtDelivery_Cd");
  if ($NC.isNull(DELIVERY_CD)) {
    alert("먼저 거래처 코드를 입력하십시오.");
    $NC.setFocus("#edtDelivery_Cd");
    return;
  }

  var RDELIVERY_CD = $NC.getValue("#edtRDelivery_Cd");
  if ($NC.isNull(RDELIVERY_CD)) {
    alert("먼저 실거래처 코드를 입력하십시오.");
    $NC.setFocus("#edtRDelivery_Cd");
    return;
  }
  
  var OWN_BRAND_CD = $NC.getValue("#edtOwn_Brand_Cd");
  if ($NC.isNull(OWN_BRAND_CD)) {
    alert("먼저 위탁사를 입력하십시오.");
    $NC.setFocus("#edtOwn_Brand_Cd");
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
    VALID_DATE: "",
    BATCH_NO: "",
    ENTRY_WEIGHT: 0,
    ENTRY_BOX: 0,
    ENTRY_EA: 0,
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

  if ($NC.isNull($NC.G_VAR.masterData.INBOUND_DATE)) {
    alert("먼저 반입일자를 입력하십시오.");
    $NC.setFocus("#dtpInbound_Date");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
    alert("먼저 반입구분을 선택하십시오.");
    $NC.setFocus("#cboInout_Cd");
    return;
  }
  
  if ($NC.isNull($NC.G_VAR.masterData.OWN_BRAND_CD)) {
    alert("먼저 위탁사 코드를 입력하십시오.");
    $NC.setFocus("#edtOwn_Brand_Cd");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.DELIVERY_CD)) {
    alert("먼저 거래처 코드를 입력하십시오.");
    $NC.setFocus("#edtDelivery_Cd");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.RDELIVERY_CD)) {
    alert("먼저 실거래처 코드를 입력하십시오.");
    $NC.setFocus("#edtRDelivery_Cd");
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

  $NC.serviceCall("/RI02010E/save.do", {
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
      P_CAR_CD: $NC.G_VAR.masterData.CAR_CD,
      P_LOCATION_ID_CNT: $NC.G_VAR.masterData.LOCATION_ID_CNT,
      P_REMARK1: $NC.G_VAR.masterData.REMARK1,
      P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
      P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
      P_PLANED_DATETIME: $NC.G_VAR.masterData.PLANED_DATETIME,
      P_BU_DATE: $NC.G_VAR.masterData.BU_DATE,
      P_BU_NO: $NC.G_VAR.masterData.BU_NO,
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
        P_DELIVERY_DIV: "%",
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
  case "RDELIVERY_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      var CUST_CD = $NC.getValue("#edtCust_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_DELIVERY_CD: args.val,
        P_DELIVERY_DIV: "%",
        P_VIEW_DIV: "1"
      };
      O_RESULT_DATA = $NP.getDeliveryInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onRDeliveryPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showDeliveryPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onRDeliveryPopup, onRDeliveryPopup);
    }
    return;
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
  case "CAR_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      var CENTER_CD = $NC.G_VAR.userData.P_CENTER_CD;
      P_QUERY_PARAMS = {
        P_CENTER_CD: CENTER_CD,
        P_CAR_CD: args.val,
        P_VIEW_DIV: "1"
      };
      O_RESULT_DATA = $NP.getCarInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onCarPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showCarPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onCarPopup, onCarPopup);
    }
    return;
  case "INOUT_CD":
    $NC.G_VAR.masterData.INOUT_CD = args.val;
    break;
  case "INBOUND_DATE":
    $NC.setValueDatePicker(args.view, args.val, "반입일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.INBOUND_DATE = $NC.getValue(args.view);
    break;
  case "REMARK1":
    $NC.G_VAR.masterData.REMARK1 = args.val;
    break;
  case "LOCATION_ID_CNT":
    $NC.G_VAR.masterData.LOCATION_ID_CNT = args.val;
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
    id: "BUY_AMT",
    field: "BUY_AMT",
    name: "매입금액",
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

  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
}

function grdDetailOnBeforeEditCell(e, args) {

  var rowData = args.item;
  // 반입등록 전표생성 가능여부 N -> 반입등록시 신규, 수정 불가능
  if ($NC.G_VAR.userData.P_POLICY_RI210 !== "Y") {
    return false;
  }
  // 신규 데이터일 때만 수정 가능한 컬럼
  if (args.column.field === "ITEM_CD") {

    var rowData = G_GRDDETAIL.data.getItem(args.row);
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
  
  var OWN_BRAND_CD = $NC.getValue("#edtOwn_Brand_Cd");
  
  switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.ITEM_CD)) {
      P_QUERY_PARAMS = {
        P_BU_CD: rowData.BU_CD,
        P_BRAND_CD: OWN_BRAND_CD,
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
  
  var OWN_BRAND_CD = $NC.getValue("#edtOwn_Brand_Cd");

  switch (args.column.field) {
  case "ITEM_CD":
    $NP.showItemPopup({
      P_BU_CD: rowData.BU_CD,
      P_BRAND_CD: OWN_BRAND_CD,
      P_ITEM_CD: "%",
      P_VIEW_DIV: "1",
      P_DEPART_CD: "%",
      P_LINE_CD: "%",
      P_CLASS_CD: "%"
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
    POLICY_VAL: $NC.G_VAR.userData.P_POLICY_RI190
  };

  rowData.BUY_AMT = $NC.getItem_Amt(params);
  rowData.VAT_AMT = $NC.getVat_Amt(params);
  rowData.TOTAL_AMT = $NC.getTotal_Amt(params);

  rowData.CONFIRM_QTY = rowData.ENTRY_QTY;
  rowData.PUTAWAY_QTY = rowData.ENTRY_QTY;

  return rowData;
}

/**
 * 검색조건의 위탁사 검색 팝업 클릭
 */

function showOwnBranPopup() {

  var BU_CD = $NC.getValue("#edtBu_Cd");
  var CUST_CD = $NC.getValue("#edtCust_Cd");

  $NP.showOwnBranPopup({
    P_CUST_CD:  CUST_CD,   
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
  });
}

/**
 * 위탁사 검색 결과
 * 
 * @param seletedRowData
 */

function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {

    $NC.G_VAR.masterData.OWN_BRAND_CD = resultInfo.OWN_BRAND_CD;
    $NC.setValue("#edtOwn_Brand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtOwn_Brand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.G_VAR.masterData.OWN_BRAND_CD = "";
    $NC.setValue("#edtOwn_Brand_Cd");
    $NC.setValue("#edtOwn_Brand_Nm");
    $NC.setFocus("#edtOwn_Brand_Cd", true);
  }
  onChangingCondition();
}



function showDeliveryPopup() {

  var CUST_CD = $NC.getValue("#edtCust_Cd");

  $NP.showDeliveryPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_DELIVERY_CD: "%",
      P_DELIVERY_DIV: "%",
      P_VIEW_DIV: "1"
    }
  }, onDeliveryPopup, function() {
    $NC.setFocus("#edtDelivery_Cd", true);
  });
}

function onDeliveryPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.masterData.DELIVERY_CD = resultInfo.DELIVERY_CD;
    $NC.setValue("#edtDelivery_Cd", resultInfo.DELIVERY_CD);
    $NC.setValue("#edtDelivery_Nm", resultInfo.DELIVERY_NM);
    if ($NC.isNull($NC.G_VAR.masterData.RDELIVERY_CD) || $("#edtRDelivery_Cd").is(":hidden")) {
      $NC.G_VAR.masterData.RDELIVERY_CD = resultInfo.DELIVERY_CD;
      $NC.setValue("#edtRDelivery_Cd", resultInfo.DELIVERY_CD);
      $NC.setValue("#edtRDelivery_Nm", resultInfo.DELIVERY_NM);
    }
    $NC.setFocus("#edtCar_Cd", true);

  } else {
    $NC.G_VAR.masterData.DELIVERY_CD = "";
    $NC.setValue("#edtDelivery_Cd");
    $NC.setValue("#edtDelivery_Nm");
    if ($("#edtRDelivery_Cd").is(":hidden")) {
      $NC.G_VAR.masterData.RDELIVERY_CD = "";
      $NC.setValue("#edtRDelivery_Cd");
      $NC.setValue("#edtRDelivery_Nm");
    }
    $NC.setFocus("#edtDelivery_Cd", true);
  }
  if ($NC.G_VAR.masterData.CRUD == "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}

function showRDeliveryPopup() {

  var CUST_CD = $NC.getValue("#edtCust_Cd");

  $NP.showDeliveryPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_DELIVERY_CD: "%",
      P_DELIVERY_DIV: "%",
      P_VIEW_DIV: "1"
    }
  }, onRDeliveryPopup, function() {
    $NC.setFocus("#edtRDelivery_Cd", true);
  });
}

function onRDeliveryPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.masterData.RDELIVERY_CD = resultInfo.DELIVERY_CD;
    $NC.setValue("#edtRDelivery_Cd", resultInfo.DELIVERY_CD);
    $NC.setValue("#edtRDelivery_Nm", resultInfo.DELIVERY_NM);
    $NC.setFocus("#edtCar_Cd", true);
  } else {
    $NC.G_VAR.masterData.RDELIVERY_CD = "";
    $NC.setValue("#edtRDelivery_Cd");
    $NC.setValue("#edtRDelivery_Nm");
    $NC.setFocus("#edtRDelivery_Cd", true);
  }
  if ($NC.G_VAR.masterData.CRUD == "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}

function showCarPopup() {

  var CENTER_CD = $NC.G_VAR.userData.P_CENTER_CD;

  $NP.showCarPopup({
    P_CENTER_CD: CENTER_CD,
    P_CAR_CD: "%",
    P_VIEW_DIV: "1"
  }, onCarPopup, function() {
    $NC.setFocus("#edtCar_Cd", true);
  });
}

function onCarPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.masterData.CAR_CD = resultInfo.CAR_CD;
    $NC.setValue("#edtCar_Cd", resultInfo.CAR_CD);
    $NC.setValue("#edtCar_Nm", resultInfo.CAR_NM);
  } else {
    $NC.G_VAR.masterData.CAR_CD = "";
    $NC.setValue("#edtCar_Cd");
    $NC.setValue("#edtCar_Nm");
    $NC.setFocus("#edtCar_Cd", true);
  }
  if ($NC.G_VAR.masterData.CRUD === "R") {
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
    rowData.BRAND_CD = resultInfo.BRAND_CD;
    rowData.BRAND_NM = resultInfo.BRAND_NM;
    rowData.ITEM_CD = resultInfo.ITEM_CD;
    rowData.ITEM_NM = resultInfo.ITEM_NM;
    rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
    rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;
    rowData.BOX_WEIGHT = resultInfo.BOX_WEIGHT;
    rowData.BUY_PRICE = resultInfo.BUY_PRICE;
    rowData.APPLY_PRICE = 0;
    rowData.BUY_PRICE = resultInfo.BUY_PRICE;
    if ($NC.G_VAR.userData.P_POLICY_RI190 == "2") {
      rowData.APPLY_PRICE = resultInfo.BUY_PRICE;
    }
    rowData.DC_PRICE = 0;
    rowData.BUY_AMT = 0;
    rowData.VAT_YN = resultInfo.VAT_YN;
    rowData.VAT_AMT = 0;
    rowData.DC_AMT = 0;
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
  $NC.serviceCall("/RI02010E/callSP.do", {
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