/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    CARRIER_CD: "",
    BARCD_DATA_DIV: "-",
    SUM_ENTRY_QTY: 0,
    SUM_CONFIRM_QTY: 0,
    SUM_INSPECT_QTY: 0,
    INSPECT_YN: "N",
    SCANCOMPLETE: true, // 자동으로 박스완료처리
  });

  // 추가 조회조건 사용
//  $NC.setInitAdditionalCondition();

  $NC.G_JWINDOW.set({
    "minWidth": 1050,
    "minHeight": 560
  });
  var oldOnFocus = $NC.G_JWINDOW.get("onFocus");
  $NC.G_JWINDOW.set("onFocus", function() {
    oldOnFocus.call(this, $NC.G_JWINDOW);
    //setFocusScan();
  });

  // 그리드 초기화
  grdMasterInitialize();

  
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
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboRefund_Price_Type");
    }
  });
  
   
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "SHIP_PRICE_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboShip_Price_Cd",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboShip_Price_Cd");
    }
  });  
  
  
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "WMP_CARRIER_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboCarrier_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboCarrier_Div");
    }
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
    selector: "#cboItemState_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboItemState_Div", 0);
    }
  });
  
  
  // 사업부 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $NC.setInitDatePicker("#dtpQInbound_Date");
  $("#divProgressbar").progressbar();

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQCarrier_Cd").click(showCarrierPopup);

//  $("#btnFWScanConfirm").click(_Save);
  $("#btnFWScanConfirm").click(onBtnFWScanUpdate);
  $("#btnInfoSearch").click(onInfoPopup);
  $("#btnInit").click(onBtnInit);
  $("#edtScan").css("ime-mode", "disabled");
  /*
  $("#divMasterInfoExpender").mouseenter(function(e) {
    var resizeVal = $("#tblMasterInfoView").data("resizeVal");
    if (resizeVal == $NC.G_OFFSET.masterInfoMaxLine) {
      return;
    }
    $("#tblMasterInfoView").find("tr").show();
  }).mouseleave(function(e) {
    var resizeVal = $("#tblMasterInfoView").data("resizeVal");
    if (resizeVal == $NC.G_OFFSET.masterInfoMaxLine) {
      return;
    }
    $("#tblMasterInfoView").find("tr:gt(" + (resizeVal - 1) + ")").hide();
  }).hide();

*/
  var resizeVal = $("#tblMasterInfoView").data("resizeVal");
  if (resizeVal == $NC.G_OFFSET.masterInfoMaxLine) {
    return;
  }
  $("#tblMasterInfoView").find("tr").show();
  
  setEnableButton("#btnBoxComplete", false);
  setEnableButton("#btnBoxSave", false);
  setEnableButton("#btnBoxManage", false);
  setEnableButton("#btnFWScanConfirm", false);
  setEnableButton("#btnBWScanConfirm", false);

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

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "0";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);

  setFocusScan();
  // 최대화
  /*
  $NC.G_JWINDOW.maximise(function() {
    setFocusScan();
  });
*/
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

}

function _SetResizeOffset() {

  $NC.G_OFFSET.masterInfoMinLine = 2;
  $NC.G_OFFSET.masterInfoMaxLine = 6;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $("#divBottomView").outerHeight(true)
      + $NC.G_LAYOUT.nonClientHeight - 1;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;
  var gridMasterHeight = clientHeight - ($("#uiGboxConditionView").outerHeight() + $("#uiGboxTitleView").outerHeight());

  var masterViewWidth = Math.max($NC.getTruncVal(clientWidth * 0.35), 500);
  var detailViewWidth = clientWidth - masterViewWidth - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divCenterView", clientWidth, clientHeight);
  $NC.resizeContainer("#divDetailView", detailViewWidth, clientHeight);
  $NC.resizeContainer("#divMasterView", masterViewWidth, clientHeight);

  // 박스번호 사이즈를 적당히 조정
  /*
  var resizeVal = Math.max(Math.min($NC.getTruncVal((clientHeight - 600) / 20) * 10, 100), 0);
  var resizeView = $("#edtBox_No");
  if (resizeVal != resizeView.data("resizeVal")) {
    resizeView.css({
      "height": 50 + resizeVal,
      "font-size": 20 + resizeVal
    }).data("resizeVal", resizeVal);
  }
  // 마스터 정보 표시 라인수 계산, 현재 Max: 6, Min: 2
  resizeVal = $NC.G_OFFSET.masterInfoMaxLine;
  if (clientHeight < 600) {
    resizeVal = Math.min(Math.max($NC.G_OFFSET.masterInfoMaxLine - Math.ceil((600 - clientHeight) / 35),
        $NC.G_OFFSET.masterInfoMinLine), $NC.G_OFFSET.masterInfoMaxLine);
  }
  resizeView = $("#tblMasterInfoView");
  if (resizeVal != resizeView.data("resizeVal")) {
    resizeView.find("tr:gt(1)").show();
    resizeView.find("tr:gt(" + (resizeVal - 1) + ")").hide();
    resizeView.data("resizeVal", resizeVal);

    if (resizeVal < 6) {
      $("#divMasterInfoExpender").show();
    } else {
      $("#divMasterInfoExpender").hide();
    }
  }

*/
  // Grid 높이 조정
  $NC.resizeGrid("#grdMaster", detailViewWidth, gridMasterHeight - ($NC.G_LAYOUT.header + ($NC.G_LAYOUT.border1) * 6));
//  $NC.resizeGrid("#grdMaster", detailViewWidth, clientHeight - ($NC.G_LAYOUT.header + $NC.G_LAYOUT.border1));
}

/**
 * Key Down Event
 * 
 * @param e
 * @param view
 */
function _OnInputKeyDown(e, view) {

  var id = view.prop("id").substr(3).toUpperCase();

  switch (id) {
  case "SCAN":
    // TAB Key 무시
    if (e.keyCode == 9) {
      e.stopImmediatePropagation();
      return;
    }

    var scanVal = "";
    var scanLen = 0;

    // 오른쪽 키패드 + Key
    if (e.keyCode == 107) {

      scanVal = $NC.getValue(view);

      // 입력 값 길이
      scanLen = scanVal.length;

      // 현재 입력된 값이 숫자인지 체크
      if (isNaN(Number(scanVal) || scanLen.length == 0)) {
        e.stopImmediatePropagation();
        showMessage("검수수량을 정확히 입력하십시오.");
        return;
      }

      onScanFnNumAdd(scanVal);
      onChkFWScanConfirm();
      e.stopImmediatePropagation();
      return;
    }

    // 오른쪽 키패드 - Key
    if (e.keyCode == 109) {

      scanVal = $NC.getValue(view);

      // 현재 입력된 값이 숫자인지 체크
      if (isNaN(Number(scanVal)) || scanLen.length == 0) {
        e.stopImmediatePropagation();
        showMessage("검수수량을 정확히 입력하십시오.");
        return;
      }

      onScanFnNumSubtract(scanVal);
      e.stopImmediatePropagation();
      return;
    }

    // 오른쪽 키패드 / 키
    /*
    if (e.keyCode == 111) {

      scanVal = $NC.getValue(view);

      // 현재 입력된 값이 숫자인지 체크
      if (isNaN(Number(scanVal))) {
        e.stopImmediatePropagation();
        showMessage("검수수량을 정확히 입력하십시오.");
        return;
      }

      onScanFnNumDivide(scanVal);
      onChkFWScanConfirm();
      e.stopImmediatePropagation();
      return;
    }
    */

    break;
  }
}
/**
 * Key Up Event
 * 
 * @param e
 * @param view
 */
function _OnInputKeyUp(e, view) {

  var id = view.prop("id").substr(3).toUpperCase();

  switch (id) {
  case "SCAN":

    var scanVal = "";
    var scanLen = 0;

    // Enter Key
    if (e.keyCode == 13) {

      scanVal = $NC.getValue(view);
      // 입력 값 길이
      scanLen = scanVal.length;

      if (scanLen == 0) {
        e.stopImmediatePropagation();
        return;
      }

      // 대문자로 변환 ????????????????
      scanVal = scanVal.toUpperCase();
      
      if (scanLen < 4) {

        scanVal = $NC.getValue(view);

        // 현재 입력된 값이 숫자인지 체크
        if (isNaN(Number(scanVal))) {
          e.stopImmediatePropagation();
          showMessage("검수수량을 정확히 입력하십시오.");
          return;
        }

        onScanFnNumDivide(scanVal);
        e.stopImmediatePropagation();
        return;
      }
        
      var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
      if ($NC.isNull(CENTER_CD)) {
        showMessage({
          message: "물류센터를 선택하십시오.",
          focusSelector: "#cboQCenter_Cd"
        });
        return;
      }

      var BU_CD = $NC.getValue("#edtQBu_Cd");
      if ($NC.isNull(BU_CD)) {
        showMessage({
          message: "사업부를 입력하십시오.",
          focusSelector: "#edtQBu_Cd"
        });
        return;
      }

      var INBOUND_DATE = $NC.getValue("#dtpQInbound_Date");
      if ($NC.isNull(INBOUND_DATE)) {
        showMessage({
          message: "출고일자를 입력하십시오.",
          focusSelector: "#dtpQInbound_Date"
        });
        return;
      }
      var INBOUND_NO = "";
      
      $NC.serviceCallAndWait("/RIM6010E/callSP.do", {
        P_QUERY_ID: "RIM6010E.GET_ITEM_INFO",
        P_QUERY_PARAMS: $NC.getParams({
          P_CENTER_CD: CENTER_CD,
          P_BU_CD: BU_CD,
          P_INBOUND_DATE: INBOUND_DATE,
          P_INBOUND_NO: INBOUND_NO,
          P_ITEM_BAR_CD: scanVal
        })
      }, onGetItemCd, onError);
//        onScanOrder(scanVal);
//        onChangingCondition();
//        $NC.setValue("#edtQWb_No", scanVal);
//        _Inquiry();
//      e.stopImmediatePropagation();
//      return;
      /*
      if (scanLen < 4) {

        scanVal = $NC.getValue(view);

        // 현재 입력된 값이 숫자인지 체크
        if (isNaN(Number(scanVal))) {
          e.stopImmediatePropagation();
          showMessage("검수수량을 정확히 입력하십시오.");
          return;
        }

        onScanFnNumDivide(scanVal);
        e.stopImmediatePropagation();
        return;
      }
*/
      // 상품 바코드 스캔
//      onScanItem(scanVal);
//      onChkFWScanConfirm();
//      e.stopImmediatePropagation();
//      return;
    }

    break;
  }
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



function masterDataOnChange(e, args) {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    return;
  }
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (rowData) {
    switch (args.col) {
    case "SHIP_PRICE":
      rowData.SHIP_PRICE = args.val;
      break;
    case "REFUND_WB_NO":
      rowData.REFUND_WB_NO = args.val;
      break;
    case "REMARK1":
      rowData.REMARK1 = args.val;
      break;
    case "CARRIER_DIV":
      rowData.CARRIER_DIV = args.val;
      rowData.CARRIER_DIV_F = $NC.getValueCombo("#cboCarrier_Div", "F");
      break;
    case "SHIP_PRICE_CD":
      rowData.REFUND_SHIP_PRICE_CD = args.val;
      rowData.REFUND_SHIP_PRICE_CD_DIV_F = $NC.getValueCombo("#cboShip_Price_Cd", "F");
      break;
    case "REFUND_PRICE_TYPE":
      rowData.REFUND_PRICE_TYPE = args.val;
      rowData.REFUND_PRICE_TYPE_F = $NC.getValueCombo("#cboRefund_Price_Type", "F");
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
 * 조회조건 Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();
  // 사업부 Key 입력
  switch (id) {
  case "CENTER_CD":
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
  case "CARRIER_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CARRIER_CD: val,
        P_VIEW_DIV: "1"
      };
      O_RESULT_DATA = $NP.getCarrierInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onCarrierPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showCarrierPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onCarrierPopup, onCarrierPopup);
    }
    return;
  case "INBOUND_DATE":
    $NC.setValueDatePicker(view, val, "출고일자를 정확히 입력하십시오.");
    break;
  }

  // 화면클리어
  onChangingCondition();
}

function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDMASTER);

  $NC.G_VAR.SUM_ENTRY_QTY = 0;
  $NC.G_VAR.SUM_CONFIRM_QTY = 0;
  $NC.G_VAR.SUM_INSPECT_QTY = 0;
  $NC.G_VAR.INSPECT_YN = "N";
  $NC.G_VAR.SCANCOMPLETE = true;

  $NC.setEnable("#cboQCenter_Cd");
  $NC.setEnable("#edtQBu_Cd");
  $NC.setEnable("#btnQBu_Cd");
  $NC.setEnable("#dtpQInbound_Date");
  $NC.setValue("#edtQInbound_No");

  setMasterInfoValue();
  setOrderInfoValue();
  setItemInfoValue();

  $NC.setValue("#edtBox_No");

  $NC.setValue("#divProgressVal", "0 / 0 [ 0 %]");
  $("#divProgressbar").progressbar("value", 0);

  setEnableButton("#btnBoxSave", false);
  setEnableButton("#btnBoxComplete", false);
  setEnableButton("#btnBoxManage", false);
  setEnableButton("#btnFWScanConfirm", false);
  setEnableButton("#btnBWScanConfirm", false);
  $NC.setEnable("#cboCarrier_Div", false);
  $NC.setEnable("#cboRefund_Price_Type", false);
  $NC.setEnable("#edtShip_Price", false);
  $NC.setEnable("#cboShip_Price_Cd", false);
  $NC.setEnable("#edtRefund_Wb_No", false);
  $NC.setEnable("#edtRemark1", false);

  setFocusScan();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    showMessage({
      message: "사업부를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }

  var INBOUND_DATE = $NC.getValue("#dtpQInbound_Date");
  if ($NC.isNull(INBOUND_DATE)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQInbound_Date"
    });
    return;
  }
  /*
    var OUTBOUND_NO = $NC.getValue("#edtQOutbound_No");
    if ($NC.isNull(OUTBOUND_NO)) {
      showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
      return;
    }
  */
  var WB_NO = $NC.getValue("#edtQWb_No");
  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_INBOUND_DATE: INBOUND_DATE,
    P_WB_NO: WB_NO
  });

  // 데이터 조회
  $NC.serviceCall("/RIM6010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onError);

}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New(scanValue, returnValue) {
  
  // 현재 수정모드면
  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }
    
  var rowCount = G_GRDMASTER.data.getLength();
  /*
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDMASTER.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      return;
    }
  }
  */
  
  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
    BU_CD: $NC.getValue("#edtQBu_Cd"),
    ORDER_DATE: $NC.getValue("#edtQInbound_Date"),
    ORDER_NO: $NC.getValue("#edtQInbound_No"),
    INBOUND_DATE: $NC.getValue("#edtQInbound_Date"),
    INBOUND_NO: $NC.getValue("#edtQInbound_No"),
    LINE_NO: "",
    REFUND_PRICE_TYPE: $NC.getValue("#cboRefund_Price_Type"),
    REFUND_SHIP_PRICE_CD: $NC.getValue("#cboShip_Price_Cd"),
    SHIP_PRICE: $NC.getValue("#edtShip_Price"),
    CARRIER_DIV: $NC.getValue("#cboCarrier_Div"),
    REFUND_WB_NO: $NC.getValue("#edtRefund_Wb_No"),
    ORDERER_NM: $NC.getValue("#edtOrderer_Nm"),
    BU_KEY: $NC.getValue("#edtBu_Key"),
    BU_NO: $NC.getValue("#edtBu_No"),
    INOUT_NM: $NC.getValue("#edtInout_Nm"),
    REMARK1: $NC.getValue("#edtRemark1"),
    ITEM_CD: scanValue,
    ITEM_BAR_CD: scanValue,
    ITEM_NM: returnValue,
    BRAND_NM: "",
    DEAL_ID: "",
    OPTION_ID: "",
    ITEM_STATE: $NC.getValue("#cboItemState_Div"),
    ITEM_STATE_F:  $NC.getValueCombo("#cboItemState_Div", "F"),
    QTY_IN_BOX: 1,
    ENTRY_QTY: 0,
    INSPECT_QTY: 0,
    ITEM_QTY: 1,
    REMAIN_QTY: 0,
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };

  G_GRDMASTER.data.addItem(newRowData);
  $NC.setGridSelectRow(G_GRDMASTER, rowCount);
  if (rowCount === 0) {
    $NC.setGridDisplayRows("#grdMaster", rowCount + 1, G_GRDMASTER.data.getLength());
  }

  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    showMessage({
      message: "사업부를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }
/*
  var INBOUND_DATE = $NC.getValue("#dtpQInbound_Date");
  if ($NC.isNull(INBOUND_DATE)) {
    showMessage({
      message: "입고일자를 입력하십시오.",
      focusSelector: "#dtpQInbound_Date"
    });
    return;
  }

  var INBOUND_NO = $NC.getValue("#edtQInbound_No");
  if ($NC.isNull(INBOUND_NO)) {
    showMessage("입고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }
*/
  var detailDS = [ ];
  var chkCnt = 0;
  var saveData;
  var rowData;
  for ( var i = 0, rowCount = G_GRDMASTER.data.getLength(); i < rowCount; i++) {
    rowData = G_GRDMASTER.data.getItem(i);
 /*   
    if(rowData.INSPECT_QTY == 0){
      chkCnt++;
    }
    */
    if(rowData.ENTRY_QTY > rowData.INSPECT_QTY ){
      chkCnt++;
    }
    saveData = {
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_ORDER_DATE: rowData.INBOUND_DATE,
      P_ORDER_NO: rowData.INBOUND_NO,
      P_ITEM_CD: rowData.ITEM_CD,
      P_ITEM_STATE: rowData.ITEM_STATE,
      P_LINE_NO: rowData.LINE_NO,
      P_DEAL_ID: rowData.DEAL_ID,
      P_OPTION_ID: rowData.OPTION_ID,
      P_INSPECT_QTY: rowData.INSPECT_QTY
    };
    detailDS.push(saveData);
  }
   
  if(chkCnt > 0){
    var result = confirm("검수되지 않은 상품이 있습니다.\n\n완료하시겠습니까?");
    if (!result) {
      return;
    } else {
    }
  }

  $NC.serviceCallAndWait("/RIM6010E/save.do", {
    P_DS_MASTER: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_ORDER_DATE: $NC.getValue("#edtQInbound_Date"),
      P_ORDER_NO: $NC.getValue("#edtQInbound_No"),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }),
    P_DS_DETAIL: $NC.toJson(detailDS),
  }, onBoxSave, onError);
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

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: new Array("BRAND_CD", "ITEM_CD"),
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BU_KEY",
    field: "BU_KEY",
    name: "주문번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60
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
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 85,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "현검수수량",
    minWidth: 85,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REMAIN_QTY",
    field: "REMAIN_QTY",
    name: "미검수수량",
    minWidth: 85,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_BAR_CD",
    field: "ITEM_BAR_CD",
    name: "상품바코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 60,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 3,
    rowHeight: 32,
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.INSPECT_YN === "Y") {
          return "specialrow3";
        }
        if (rowData.REMAIN_QTY <= 0) {
          return "specialrow4";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "RIM6010E.RS_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
//  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  setOrderInfoValue(G_GRDMASTER.data.getItem(row));
  setItemInfoValue(G_GRDMASTER.data.getItem(row));

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);

  setFocusScan();
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
/*
function grdMasterOnCellChange(e, args) {

  var rowData = args.item;

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}
*/

function onBtnFWScanUpdate(e) {

  
  if (e != undefined && $(e.target).hasClass("disabled")) {
    return;
  }

  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }
  
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    showMessage("물류센터를 선택하십시오.");
    return;
  }

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    showMessage("사업부를 선택하십시오.");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    
//  var CARRIER_CD = rowData.CARRIER_DIV;
  var CARRIER_CD = $NC.getValue("#cboCarrier_Div");
  if ($NC.isNull(CARRIER_CD)) {
    showMessage("운송사 구분을 선택하십시오.");
    return;
  }
  
//  var SHIP_PRICE = rowData.SHIP_PRICE;
  var SHIP_PRICE = $NC.getValue("#edtShip_Price");
  if ($NC.isNull(SHIP_PRICE)) {
    showMessage("반품비를 입력하십시오.");
    return;
  }
  
//  var REFUND_SHIP_PRICE_CD = rowData.REFUND_SHIP_PRICE_CD;
  var REFUND_SHIP_PRICE_CD = $NC.getValue("#cboShip_Price_Cd");
  if ($NC.isNull(REFUND_SHIP_PRICE_CD)) {
    showMessage("비용부담구분을 선택하십시오.");
    return;
  }
  
//  var REFUND_WB_NO = rowData.REFUND_WB_NO;
  var REFUND_WB_NO = $NC.getValue("#edtRefund_Wb_No");
  if ($NC.isNull(REFUND_WB_NO)) {
    showMessage("송장번호를 입력하십시오.");
    return;
  }
  
//  var REFUND_PRICE_TYPE = rowData.REFUND_PRICE_TYPE;
  var REFUND_PRICE_TYPE = $NC.getValue("#cboRefund_Price_Type");
  if ($NC.isNull(REFUND_PRICE_TYPE)) {
    showMessage("반품비구분을 선택하십시오.");
    return;
  }
  
  if (rowData.INBOUND_STATE === "20") {
    showMessage("수정 불가능 상태입니다.");
    return;
  }
      
  $NC.serviceCall("/RIM6010E/callFWScanUpdate.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_ORDER_DATE: rowData.INBOUND_DATE,
      P_ORDER_NO: rowData.INBOUND_NO,
      
      P_REFUND_PRICE_TYPE: REFUND_PRICE_TYPE,
      P_REFUND_SHIP_PRICE_CD: REFUND_SHIP_PRICE_CD,
      P_REFUND_SHIP_PRICE : SHIP_PRICE,
      P_CARRIER_CD : CARRIER_CD,
      P_REFUND_WB_NO: REFUND_WB_NO,
      P_REMARK1: $NC.getValue("#edtRemark1"),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onFWScanUpdate, onError);

}



function onBtnFWScanConfirm(e) {

  if (e != undefined && $(e.target).hasClass("disabled")) {
    return;
  }

  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }

  if ($NC.G_VAR.SUM_INSPECT_QTY > 0 && $NC.G_VAR.SCANCOMPLETE) {
    showMessage("박스완료하지 않은 검수내역이 존재합니다.\n\n박스완료 후 검수완료 처리하십시오.");
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    showMessage({
      message: "사업부를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }

  var INBOUND_DATE = $NC.getValue("#dtpQInbound_Date");
  if ($NC.isNull(INBOUND_DATE)) {
    showMessage({
      message: "반품일자를 입력하십시오.",
      focusSelector: "#dtpQInbound_Date"
    });
    return;
  }
  /*
    var INBOUND_NO = $NC.getValue("#edtQInbound_No");
    if ($NC.isNull(INBOUND_NO)) {
      showMessage("반품번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
      return;
    }
    */
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  $NC.serviceCall("/RIM6010E/callFWScanConfirm.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_ORDER_DATE: rowData.INBOUND_DATE,
      P_ORDER_NO: rowData.INBOUND_NO,
      P_LINE_NO: rowData.LINE_NO,
      P_ENTRY_QTY: rowData.INSPECT_QTY,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onFWScanConfirm, onError);

  /*
  var message = "";
  if ($NC.G_VAR.SUM_ENTRY_QTY > $NC.G_VAR.SUM_INSPECT_QTY) {
    message = "미검수 상품이 존재합니다.\n\n검수완료 처리하시겠습니까?";
  }
  // message += "검수완료 처리하시겠습니까?";

  if (message == "" || message == undefined) {

    // 검수수량이 100%일 경우 메세지없이 검수완료
    $NC.serviceCall("/RIM6010E/callFWScanConfirm.do", {
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_INBOUND_DATE: INBOUND_DATE,
        P_INBOUND_NO: INBOUND_NO,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      })
    }, onFWScanConfirm, onError);
  } else {

    showMessage({
      message: message,
      onYesFn: function() {

        // 데이터 조회
        $NC.serviceCall("/RIM6010E/callFWScanConfirm.do", {
          P_QUERY_PARAMS: $NC.getParams({
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_INBOUND_DATE: INBOUND_DATE,
            P_INBOUND_NO: INBOUND_NO,
            P_USER_ID: $NC.G_USERINFO.USER_ID
          })
        }, onFWScanConfirm, onError);
      },
      onNoFn: function() {
        setFocusScan();
      }
    });
  }*/
}

function onBtnBWScanConfirm(e) {

  if ($(e.target).hasClass("disabled")) {
    return;
  }

  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    showMessage({
      message: "사업부를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }

  var INBOUND_DATE = $NC.getValue("#dtpQInbound_Date");
  if ($NC.isNull(INBOUND_DATE)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQInbound_Date"
    });
    return;
  }

  var INBOUND_NO = $NC.getValue("#edtQInbound_No");
  if ($NC.isNull(INBOUND_NO)) {
    showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }

  showMessage({
    message: "검수취소 처리하시겠습니까?",
    onYesFn: function() {

      // 데이터 조회
      $NC.serviceCall("/RIM6010E/callBWScanConfirm.do", {
        P_QUERY_PARAMS: $NC.getParams({
          P_CENTER_CD: CENTER_CD,
          P_BU_CD: BU_CD,
          P_INBOUND_DATE: INBOUND_DATE,
          P_INBOUND_NO: INBOUND_NO,
          P_USER_ID: $NC.G_USERINFO.USER_ID
        })
      }, onBWScanConfirm, onError);

      setFocusScan();
    },
    onNoFn: function() {
      setFocusScan();
    }
  });
}

/**
 * 화면초기화
 */
function onBtnInit(e) {

  if ($(e.target).hasClass("disabled")) {
    return;
  }

  var processFn = function() {

    onChangingCondition();
    $NC.setEnable("#cboQCenter_Cd");
    $NC.setEnable("#edtQBu_Cd");
    $NC.setEnable("#btnQBu_Cd");
    $NC.setEnable("#dtpQInbound_Date");

    setFocusScan();
  };

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.G_VAR.INSPECT_YN == "Y") {
      processFn.call(this);
    } else {
      showMessage({
        message: "현재 검수 작업 중 입니다.\n\n초기화 하시겠습니까?",
        onYesFn: function() {
          processFn.call(this);
        },
        onNoFn: function() {
          setFocusScan();
        }
      });
    }
    return;
  }
  setFocusScan();
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  
  if (G_GRDMASTER.data.getLength() > 0) {

    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["BRAND_CD", "ITEM_CD"],
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
    
     
    $NC.setEnable("#cboQCenter_Cd", false);
    $NC.setEnable("#edtQBu_Cd", false);
    $NC.setEnable("#btnQBu_Cd", false);
    $NC.setEnable("#dtpQInbound_Date", false);
  
 
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
    onChangingCondition();
    // showMessage("존재하지 않는 출고전표입니다. 확인 후 작업하십시오.");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow); 
  if (rowData.INBOUND_STATE === "10") {
    $NC.setEnableGroup("#divMasterView", true);
    $NC.setEnableGroup("#tblMasterFixView", true);
//    $NC.setEnableGroup("#tblMasterInfoView", true);
    
  }
  
  var rowData = G_GRDMASTER.data.getItem(0);
  setMasterInfoValue(rowData);
  onCalcSummary();
  /*

    $NC.G_VAR.INSPECT_YN = rowData.INSPECT_YN;
    if ($NC.G_VAR.INSPECT_YN == "Y") {
      setEnableButton("#btnBoxSave", false);
      setEnableButton("#btnBoxComplete", false);
      setEnableButton("#btnBoxManage", true);
      setEnableButton("#btnFWScanConfirm", false);
      setEnableButton("#btnBWScanConfirm", true);
      $NC.setValue("#edtBox_No", "검수완료");
      $("#edtBox_No").addClass("inspected");
      return;
    } else {
      $NC.setValue("#edtBox_No", rowData.BOX_NO);
      $("#edtBox_No").removeClass("inspected");
    }

    setEnableButton("#btnBoxSave", rowData.BOXING_YN == "N");
    setEnableButton("#btnBoxComplete", true);
    setEnableButton("#btnBoxManage", true);
    setEnableButton("#btnFWScanConfirm", true);
    setEnableButton("#btnBWScanConfirm", false);
    */
  setFocusScan();
}

function doPrint1() {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  var checkedValueDS = [ ];

  checkedValueDS.push($NC.getValue("#edtBox_No"));

  // 택배송장출력
  $NC.G_MAIN.silentPrint({
    printParams: [{
      reportDoc: "lo/LABEL_LOM02",
      queryId: "WR.RS_LABEL_LOM02",
      queryParams: {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO,
        P_POLICY_LO450: $NC.G_VAR.policyVal.LO450
      },
      iFrameNo: 1,
      checkedValue: checkedValueDS.toString(),
      silentPrinterName: $NC.G_USERINFO.PRINT_WB_NO
    }],
    onAfterPrint: function() {
      setFocusScan();
    }
  });
}

function doPrint2() {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  var printOptions = {
    printParams: [{
      // 거래명세서 출력
      reportDoc: "lo/RECEIPT_LOM01",
      queryId: "WR.RS_RECEIPT_LOM01",
      queryParams: {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO,
        P_POLICY_LO450: $NC.G_VAR.policyVal.LO450
      },
      iFrameNo: 2,
      silentPrinterName: $NC.G_USERINFO.PRINT_LO_BILL
    }],
    onAfterPrint: function() {
      setFocusScan();
    }
  };

  // 카드메세지출력
  if (!$NC.isNull($NC.getValue("#edtCard_Msg"))) {
    printOptions.printParams.push({
      reportDoc: "lo/CARD_LOM" + rowData.BRAND_CD,
      queryId: "WR.RS_CARD_LOM01",
      queryParams: {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO
      },
      iFrameNo: 3,
      silentPrinterName: $NC.G_USERINFO.PRINT_CARD
    });
  }

  $NC.G_MAIN.silentPrint(printOptions);

}

function onBoxSave(ajaxData) {

  _Cancel();
}

function onFWScanConfirm(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      showMessage(resultData.O_MSG);
      return;
    }
  }
  // doPrint2();
  _Inquiry();
}

function onFWScanUpdate(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      showMessage(resultData.O_MSG);
      return;
    }
  }
  _Save();
}


function onBWScanConfirm(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      showMessage(resultData.O_MSG);
      return;
    }
  }

  _Inquiry();
}

/**
 * 검수가 100% 될 경우 자동으로 검수완료
 */
function onChkFWScanConfirm() {

  // 스캔 가능여부 체크
  if (!onValidateScan(true)) {
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (rowData.INSPECT_YN === "Y") {
    return;
  }
  // if ($NC.G_VAR.SUM_ENTRY_QTY === $NC.G_VAR.SUM_INSPECT_QTY) {
  if (rowData.REMAIN_QTY == 0 && (rowData.ENTRY_QTY === rowData.INSPECT_QTY)) {
    $NC.G_VAR.SCANCOMPLETE = false;
    if (!$NC.isNull($NC.G_USERINFO.PRINT_WB_NO) && !$NC.isNull($NC.G_USERINFO.PRINT_LO_BILL)
        && !$NC.isNull($NC.G_USERINFO.PRINT_CARD)) {
    } else {
      alert("설정하신 프린터가 없습니다.\n\n자동출력프린터를 먼저 등록하십시오.");
      return;
    }
    return;
  }

  $NC.G_VAR.SCANCOMPLETE = true;
  setFocusScan();
}

function onInfoPopup() {

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "RIM6011P",
    PROGRAM_NM: "주문내역 검색",
    url: "ri/RIM6011P.html",
    width: 1170,
    height: 550,
    onCancel: function() {
      if ($NC.G_VAR.INSPECT_YN == "Y") {
        return;
      }
      var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: new Array("BRAND_CD", "OUTBOUND_DATE", "ITEM_CD"),
      });

      _Inquiry();

      G_GRDMASTER.lastKeyVal = lastKeyVal;
    },
    onOk: function(resultInfo) {
      if(resultInfo){
      $NC.clearGridData(G_GRDMASTER);
      
      for ( var row in resultInfo) {
        rowData = resultInfo[row];

        var newRowData = {
          CENTER_CD: rowData.CENTER_CD,
          BU_CD: rowData.BU_CD,
          ORDER_DATE: rowData.INBOUND_DATE,
          ORDER_NO: rowData.INBOUND_NO,
          INBOUND_DATE: rowData.INBOUND_DATE,
          INBOUND_NO: rowData.INBOUND_NO,
          INBOUND_STATE: rowData.INBOUND_STATE,
          LINE_NO: rowData.LINE_NO,
          REFUND_PRICE_TYPE: rowData.REFUND_PRICE_TYPE,
          REFUND_SHIP_PRICE_CD: rowData.REFUND_SHIP_PRICE_CD,
          SHIP_PRICE: rowData.SHIP_PRICE,
          CARRIER_DIV: rowData.CARRIER_DIV,
          REFUND_WB_NO: rowData.REFUND_WB_NO,
          ORDERER_NM: rowData.ORDERER_NM,
          ORDERER_HP: rowData.ORDERER_HP,
          BU_KEY: rowData.BU_KEY,
          BU_NO: rowData.BU_NO,
          REMARK1: rowData.REMARK1,
          ITEM_CD: rowData.ITEM_CD,
          ITEM_BAR_CD: rowData.ITEM_BAR_CD,
          ITEM_NM: rowData.ITEM_NM,
          BRAND_NM: rowData.BRAND_NM,
          DEAL_ID: rowData.DEAL_ID,
          OPTION_ID: rowData.OPTION_ID,
          ITEM_STATE: rowData.ITEM_STATE,
          ITEM_STATE_F:rowData.ITEM_STATE_F,
          QTY_IN_BOX: rowData.QTY_IN_BOX,
          ENTRY_QTY: rowData.ENTRY_QTY,
          INSPECT_QTY: rowData.INSPECT_QTY,
          RETURN_DIV: rowData.REMAIN_QTY,
          RETURN_TEXT: rowData.REMAIN_QTY,
          RETURN_COMMENT: rowData.REMAIN_QTY,
          REMAIN_QTY: rowData.REMAIN_QTY,
          id: $NC.getGridNewRowId(),
          CRUD: "C"
        };
        G_GRDMASTER.data.addItem(newRowData);
      }
      $NC.setGridSelectRow(G_GRDMASTER, 0);
      var rowCount = G_GRDMASTER.data.getLength();
      if (rowCount === 0) {
        $NC.setGridDisplayRows("#grdMaster", rowCount + 1, G_GRDMASTER.data.getLength());
      }

      // 수정 상태로 변경
      G_GRDMASTER.lastRowModified = true;
       
      $NC.setEnable("#cboQCenter_Cd", false);
      $NC.setEnable("#edtQBu_Cd", false);
      $NC.setEnable("#btnQBu_Cd", false);
      $NC.setEnable("#dtpQInbound_Date", false);
      
      var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow); 
      if (rowData.INBOUND_STATE === "10") {
        $NC.setEnableGroup("#divMasterView", true);
        $NC.setEnableGroup("#tblMasterFixView", true);
//        $NC.setEnableGroup("#tblMasterInfoView", true);
      }
      
      var rowData = G_GRDMASTER.data.getItem(0);
      setMasterInfoValue(rowData);
      onCalcSummary();
      }else{
      }
    }
  });
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    setFocusScan();
  });

}

/**
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
function onUserBuPopup(seletedRowData) {

  if (!$NC.isNull(seletedRowData)) {
    $NC.setValue("#edtQBu_Cd", seletedRowData.BU_CD);
    $NC.setValue("#edtQBu_Nm", seletedRowData.BU_NM);
    $NC.setValue("#edtQCust_Cd", seletedRowData.CUST_CD);
    setFocusScan();
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }

  onChangingCondition();
}

/**
 * 검색조건의 운송사 검색 이미지 클릭
 */
function showCarrierPopup() {

  var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd");
  $NP.showCarrierPopup({
    queryParams: {
      P_CARRIER_CD: CARRIER_CD,
      P_VIEW_DIV: "1"
    }
  }, onCarrierPopup, function() {
    $NC.setFocus("#edtQCarrier_Cd", true);
  });
}

/**
 * 운송사 검색 결과
 * 
 * @param seletedRowData
 */
function onCarrierPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQCarrier_Cd", resultInfo.CARRIER_CD);
    $NC.setValue("#edtQCarrier_Nm", resultInfo.CARRIER_NM);
  } else {
    $NC.setValue("#edtQCarrier_Cd");
    $NC.setValue("#edtQCarrier_Nm");
    $NC.setFocus("#edtQCarrier_Cd", true);
  }

}

function onScanOrder(scanVal) {

  var processFn = function() {

  // 초기화
  onChangingCondition();

  $NC.setValue("#edtQWb_No", scanVal);

  _Inquiry();
  };

  if (G_GRDMASTER.data.getLength() > 0) {
    showMessage({
      message: "[상품 마스터에 존재하지 않는 바코드]\n\n현재 검수 작업 중 입니다.\n데이터를 다시 가져오시겠습니까?",
      onYesFn: function() {
        processFn.call(this);
      },
      onNoFn: function() {
        setFocusScan();
      }
    });
  } else {
    processFn.call(this);
  }
  return;
  
}

function onScanItem(scanVal) {

  // 스캔 가능여부 체크
  if (!onValidateScan(false)) {
    return;
  }

  // 그리드 데이터에서 해당 행 선택
  if (onScanItemCounting(scanVal)) {
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    showMessage({
      message: "사업부를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }
  /*
    var INBOUND_DATE = $NC.getValue("#dtpQInbound_Date");
    if ($NC.isNull(INBOUND_DATE)) {
      showMessage({
        message: "출고일자를 입력하십시오.",
        focusSelector: "#dtpQInbound_Date"
      });
      return;
    }

    var INBOUND_NO = $NC.getValue("#edtQInbound_No");
    if ($NC.isNull(INBOUND_NO)) {
      showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
      return;
    }
  */
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var INBOUND_DATE = rowData.INBOUND_DATE;
  var INBOUND_NO = rowData.INBOUND_NO;
  // 데이터 조회
  $NC.serviceCallAndWait("/RIM6010E/callSP.do", {
    P_QUERY_ID: "RIM6010E.GET_ITEM_INFO",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INBOUND_DATE: INBOUND_DATE,
      P_INBOUND_NO: INBOUND_NO,
      P_ITEM_BAR_CD: scanVal
    })
  }, onGetItemInfo, onError);
}

function onScanFnButton(scanVal) {

}

function onScanFnNumAdd(scanVal) {

  // 스캔 가능여부 체크
  if (!onValidateScan(true)) {
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (!rowData) {
    showMessage("상품이 선택되지 않았습니다.\n\n상품 선택 또는 스캔 후 입력하십시오.");
    return;
  }

  if (rowData.INSPECT_YN === "Y") {
    showMessage("검수완료된 상품입니다.\n\n다른상품을 검수해주십시오.");
    return;
  }

  var ENTRY_QTY = Number(rowData.ENTRY_QTY);
  var INSPECT_QTY = Number(rowData.INSPECT_QTY);
  var ITEM_QTY = Number(scanVal);

  if (isNaN(ITEM_QTY) || ITEM_QTY == 0) {
    showMessage("수량을 정확히 입력하십시오.");
    return;
  }

  if (ENTRY_QTY < INSPECT_QTY + ITEM_QTY) {
    showMessage("등록수량을 초과해서 검수할 수 없습니다.\n\n수량을 다시 입력하십시오.");
    return;
  }

  rowData.INSPECT_QTY = INSPECT_QTY + ITEM_QTY;
  rowData.REMAIN_QTY = ENTRY_QTY - INSPECT_QTY - ITEM_QTY;
  $NC.setValue("#edtInspect_Qty", rowData.INSPECT_QTY);

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  G_GRDMASTER.lastRowModified = true;

  // 수량변경이 있을 경우에 저장버튼 활성화
  setEnableButton("#btnBoxSave", true);
  setProgressBar(ITEM_QTY);
  setFocusScan();
}

function onScanFnNumSubtract(scanVal) {

  // 스캔 가능여부 체크
  if (!onValidateScan(true)) {
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (!rowData) {
    showMessage("상품이 선택되지 않았습니다.\n\n상품 선택 또는 스캔 후 입력하십시오.");
    return;
  }

  if (rowData.INSPECT_YN === "Y") {
    showMessage("검수완료된 상품입니다.\n\n다른상품을 검수해주십시오.");
    return;
  }

  var ENTRY_QTY = Number(rowData.ENTRY_QTY);
  var INSPECT_QTY = Number(rowData.INSPECT_QTY);
  var ITEM_QTY = Number(scanVal);

  if (isNaN(ITEM_QTY) || ITEM_QTY == 0) {
    showMessage("수량을 정확히 입력하십시오.");
    return;
  }

  if (INSPECT_QTY < ITEM_QTY) {
    showMessage("현검수수량이 0보다 작을 수 없습니다\n\n수량을 다시 입력하십시오.");
    return;
  }

  rowData.INSPECT_QTY = INSPECT_QTY - ITEM_QTY;
  rowData.REMAIN_QTY = ENTRY_QTY - INSPECT_QTY + ITEM_QTY;
  $NC.setValue("#edtInspect_Qty", rowData.INSPECT_QTY);

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  G_GRDMASTER.lastRowModified = true;

  // 수량변경이 있을 경우에 저장버튼 활성화
  setEnableButton("#btnBoxSave", true);
  setProgressBar(ITEM_QTY * -1);
  setFocusScan();
}

function onScanFnNumDivide(scanVal) {

  // 스캔 가능여부 체크
  if (!onValidateScan(true)) {
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (!rowData) {
    showMessage("상품이 선택되지 않았습니다.\n\n상품 선택 또는 스캔 후 입력하십시오.");
    return;
  }

  var ENTRY_QTY = Number(rowData.ENTRY_QTY);
  var INSPECT_QTY = Number(rowData.INSPECT_QTY);
  var ORG_INSPECT_QTY = INSPECT_QTY;
  var ITEM_QTY = 0;

  var scanLen = scanVal.length;
  // / Key 입력은 수량 전체 검수
  if (scanLen == 0) {
    ITEM_QTY = ENTRY_QTY - INSPECT_QTY;
  } else {
    // 숫자 + / Key 입력은 검수수량을 입력 값으로 변경
    INSPECT_QTY = 0;
    ITEM_QTY = Number(scanVal);
  }

  if (isNaN(ITEM_QTY)) {
    showMessage("수량을 정확히 입력하십시오.");
    return;
  }

  /*
  if (ENTRY_QTY < INSPECT_QTY + CONFIRM_QTY + ITEM_QTY) {
    showMessage("등록수량을 초과해서 검수할 수 없습니다.\n\n수량을 다시 입력하십시오.");
    return;
  }
  */

  rowData.INSPECT_QTY = INSPECT_QTY + ITEM_QTY;
  rowData.REMAIN_QTY = ENTRY_QTY - INSPECT_QTY - ITEM_QTY;
  $NC.setValue("#edtInspect_Qty", rowData.INSPECT_QTY);

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  G_GRDMASTER.lastRowModified = true;

  // 수량변경이 있을 경우에 저장버튼 활성화
  setProgressBar(rowData.INSPECT_QTY - ORG_INSPECT_QTY);
  setFocusScan();
}

function onValidateScan(isQty) {

  if (G_GRDMASTER.data.getLength() == 0) {
    showMessage("현재 검수 중이 아닙니다.\n\n송장을 먼저 스캔하십시오.");
    return false;
  }

  return true;
}

function onCalcSummary() {

  if (G_GRDMASTER.data.getLength() == 0) {

    $NC.G_VAR.SUM_ENTRY_QTY = 0;
    $NC.G_VAR.SUM_CONFIRM_QTY = 0;
    $NC.G_VAR.SUM_INSPECT_QTY = 0;
    $NC.setValue("#divProgressVal", "0 / 0 [ 0 %]");
    $("#divProgressbar").progressbar("value", 0);

  } else {

    var summary = $NC.getGridSumVal(G_GRDMASTER, {
      sumKey: ["ENTRY_QTY", "INSPECT_QTY"]
    });

    $NC.G_VAR.SUM_ENTRY_QTY = summary.ENTRY_QTY;
    $NC.G_VAR.SUM_INSPECT_QTY = summary.INSPECT_QTY;
    $NC.G_VAR.SUM_CONFIRM_QTY = summary.CONFIRM_QTY;
    var TOTAL_INSPECT_QTY = summary.INSPECT_QTY;
    var CONFIRM_RATE = $NC.getRoundVal((TOTAL_INSPECT_QTY / summary.ENTRY_QTY) * 100);
    $NC.setValue("#divProgressVal", TOTAL_INSPECT_QTY + " / " + summary.ENTRY_QTY + " [ " + CONFIRM_RATE + "%]");
    $("#divProgressbar").progressbar("value", CONFIRM_RATE);
  }
}

/**
 * 상품정보 취득(by상품바코드) - callSp
 * 
 * @param ajaxData
 */
function onGetItemInfo(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if ($NC.isNull(resultData)) {
    return;
  }

  if (resultData.O_MSG !== "OK") {
    showMessage(resultData.O_MSG);
    return;
  }

  onScanItemCounting(resultData.P_ITEM_BAR_CD, resultData.O_COLUMN_NM, resultData.O_ITEM_CD);
}

/**
 * 상품정보 마스터에 존재하는지 여부 체크(by상품바코드) - callSp
 * 
 * @param ajaxData
 */
function onGetItemCheck(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if ($NC.isNull(resultData)) {
    return;
  }

  if (resultData.O_MSG !== "OK") {
    showMessage(resultData.O_MSG);
    return;
  }
  
  _New(resultData.P_ITEM_BAR_CD, resultData.O_ITEM_NM);
}

/**
* 상품정보 마스터에 존재하는지 여부 체크(by상품바코드) - callSp
* 
* @param ajaxData
*/
function onGetItemCd(ajaxData) {
  
  var resultData = $NC.toArray(ajaxData);
  
  if (resultData.O_MSG === "OK") {
    onScanItem(resultData.P_ITEM_BAR_CD);
    return;
  }
  
  onScanOrder(resultData.P_ITEM_BAR_CD);
  return;
}

/**
 * 그리드 해당 행 선택
 * 
 * @param ajaxData
 */
function onScanItemCounting(scanVal, column_Nm, item_Cd) {

  var searchIndex = -1;
  var rowData;
  // 컬럼 지정 검색(DB 검색 후)
//  if (!$NC.isNull(column_Nm)) {
//    searchIndex = $NC.getGridSearchRow(G_GRDMASTER, {
//      searchKey: column_Nm,
//      searchVal: scanVal
//    });
//  } else {
    // 상품코드, 상품바코드, 박스바코드, 케이스바코드에서 검색
    for ( var i = 0, rowCount = G_GRDMASTER.data.getLength(); i < rowCount; i++) {
      rowData = G_GRDMASTER.data.getItem(i);
      if ((rowData.ITEM_CD === scanVal || rowData.ITEM_BAR_CD === scanVal || rowData.BOX_BAR_CD === scanVal
          || rowData.CASE_BAR_CD === scanVal) && (rowData.ITEM_STATE ===$NC.getValue("#cboItemState_Div"))
          ) {
        searchIndex = i;
        break;
      }
    }
//  }

  if (searchIndex == -1) {
    
    rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    var CENTER_CD = rowData.CENTER_CD;
    var BU_CD = rowData.BU_CD;
    var INBOUND_DATE = rowData.INBOUND_DATE;
    var INBOUND_NO = rowData.INBOUND_NO;
    $NC.serviceCallAndWait("/RIM6010E/callSP.do", {
      P_QUERY_ID: "RIM6010E.GET_ITEM_INFO",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_INBOUND_DATE: INBOUND_DATE,
        P_INBOUND_NO: INBOUND_NO,
        P_ITEM_BAR_CD: scanVal
      })
    }, onGetItemCheck, onError);
    
//    _New(scanVal);
    searchIndex = G_GRDMASTER.data.getLength() - 1;
    return;
  }

  $NC.setGridSelectRow(G_GRDMASTER, searchIndex);

  rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  // 컬럼 지정 검색(DB 검색 후)일 경우 스캔 바코드 값을 데이터에 입력
  if (!$NC.isNull(column_Nm)) {
    rowData[column_Nm] = scanVal;
  }

  var ITEM_QTY = 1;
  var ENTRY_QTY = Number(rowData.ENTRY_QTY);
  var INSPECT_QTY = Number(rowData.INSPECT_QTY);

  if (rowData.INSPECT_YN === "Y") {
    showMessage("검수완료된 상품입니다.\n\n다른상품을 검수해주십시오.");
    return;
  }

//  if (ENTRY_QTY < INSPECT_QTY + ITEM_QTY) {
//    showMessage("검수 수량이 등록수량을 초과할 수 없습니다.");
//    return true;
//  }

  rowData.INSPECT_QTY = INSPECT_QTY + ITEM_QTY;
  rowData.REMAIN_QTY = ENTRY_QTY - INSPECT_QTY - ITEM_QTY;

  $NC.setValue("#edtInspect_Qty", rowData.INSPECT_QTY);

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  G_GRDMASTER.lastRowModified = true;

  // 수량변경이 있을 경우에 저장버튼 활성화
  setProgressBar(ITEM_QTY);
  setFocusScan();
  return true;
}

/**
 * 스캔 포인트 포커스 이동, 초기화
 */
function setFocusScan() {

  $NC.setFocus("#edtScan");
  $NC.setValue("#edtScan");
}

/**
 * 버튼 DIV Enable/Disable
 * 
 * @param selector
 * @param enable
 */
function setEnableButton(selector, enable) {

  var view = $NC.getView(selector);
  if (view.length == 0) {
    return;
  }

  if ($NC.isNull(enable)) {
    enable = true;
  }
  if (enable) {
    view.removeClass("disabled");
  } else {
    view.addClass("disabled");
  }
}

function setItemInfoValue(rowData) {

  // 상품 정보 세팅
  if ($NC.isNull(rowData)) {
    rowData = {};
  }

  // Row 데이터로 에디터 세팅
  $NC.setValue("#edtItem_Cd", rowData.ITEM_CD);
  $NC.setValue("#edtItem_Nm", rowData.ITEM_NM);
  $NC.setValue("#edtItem_Spec", rowData.ITEM_SPEC);
  $NC.setValue("#edtQty_In_Box", rowData.QTY_IN_BOX);
  $NC.setValue("#edtEntry_Qty", rowData.ENTRY_QTY);
  $NC.setValue("#edtConfirm_Qty", rowData.INSPECT_QTY);
  $NC.setValue("#edtInspect_Qty", rowData.INSPECT_QTY);
  
  

  //$NC.setValue("#cboRefund_Type", rowData.REFUND_PRICE_TYPE_F);
  //$NC.setValue("#cboShip_Price_Cd", rowData.REFUND_SHIP_PRICE_CD_DIV_F);
  //$NC.setValue("#cboCarrier_Div", rowData.CARRIER_DIV_F);
  //$NC.setValue("#edtShip_Price", rowData.SHIP_PRICE);
  //$NC.setValue("#edtRefund_Wb_No", rowData.REFUND_WB_NO);

  if (rowData.INSPECT_YN == "Y") {
    // setEnableButton("#btnBoxSave", false);
    setEnableButton("#btnBoxComplete", false);
    // setEnableButton("#btnBoxManage", true);
    setEnableButton("#btnFWScanConfirm", false);
    // setEnableButton("#btnBWScanConfirm", true);
    $NC.setValue("#edtBox_No", "검수완료");
    $("#edtBox_No").addClass("inspected");
    return;
  } else {
    setEnableButton("#btnBoxComplete", true);
    // setEnableButton("#btnBoxManage", true);
    setEnableButton("#btnFWScanConfirm", true);
    // setEnableButton("#btnBWScanConfirm", false);
    $NC.setValue("#edtBox_No", rowData.BOX_NO);
    $("#edtBox_No").removeClass("inspected");
  }
}

function setMasterInfoValue(rowData) {

  // 전표정보 세팅
  if ($NC.isNull(rowData)) {
    rowData = {};
  }

  $NC.setValue("edtOrderer_Nm", rowData.ORDERER_NM);
  $NC.setValue("edtOrderer_Hp", rowData.ORDERER_HP);
  $NC.setValue("edtReturn_Div", rowData.RETURN_DIV);
  $NC.setValue("edtReturn_Comment", rowData.RETURN_COMMENT);
  $NC.setValue("edtReturn_Text", rowData.RETURN_TEXT);

  $NC.setValue("#edtQInbound_Date", rowData.INBOUND_DATE);
  $NC.setValue("#edtQInbound_No", rowData.INBOUND_NO);
  $NC.setValue("#edtInbound_No", rowData.INBOUND_NO);
  $NC.setValue("#edtBu_Key", rowData.BU_KEY);
  $NC.setValue("#edtInout_Nm", rowData.INOUT_NM);
  $NC.setValue("#edtExchange_Type", rowData.EXCHANGE_TYPE);
  // $NC.setValue("edtInout_Nm", rowData.INOUT_NM);
  $NC.setValue("#edtBu_No", rowData.BU_NO);
  $NC.setValue("#edtRemark1", rowData.REMARK1);
  
  $NC.setValue("#cboValid_Div", rowData.VALID_DIV);
  $NC.setValue("#cboRefund_Price_Type", rowData.REFUND_PRICE_TYPE);
  $NC.setValue("#cboShip_Price_Cd", rowData.REFUND_SHIP_PRICE_CD);
  $NC.setValue("#edtShip_Price", rowData.SHIP_PRICE);
  $NC.setValue("#cboCarrier_Div", rowData.CARRIER_DIV);
  $NC.setValue("#edtRefund_Wb_No", rowData.REFUND_WB_NO);
}

function setOrderInfoValue(rowData) {
  
  // 전표정보 세팅
  if ($NC.isNull(rowData)) {
    rowData = {};
  }
  
  $NC.setValue("edtOrderer_Nm", rowData.ORDERER_NM);
  $NC.setValue("edtOrderer_Hp", rowData.ORDERER_HP);
  $NC.setValue("edtReturn_Div", rowData.RETURN_DIV);
  $NC.setValue("edtReturn_Comment", rowData.RETURN_COMMENT);
  $NC.setValue("edtReturn_Text", rowData.RETURN_TEXT);
  
  $NC.setValue("#edtQInbound_Date", rowData.INBOUND_DATE);
  $NC.setValue("#edtQInbound_No", rowData.INBOUND_NO);
  $NC.setValue("#edtInbound_No", rowData.INBOUND_NO);
  $NC.setValue("#edtBu_Key", rowData.BU_KEY);
  $NC.setValue("#edtInout_Nm", rowData.INOUT_NM);
  $NC.setValue("#edtExchange_Type", rowData.EXCHANGE_TYPE);
  // $NC.setValue("edtInout_Nm", rowData.INOUT_NM);
  $NC.setValue("#edtBu_No", rowData.BU_NO);
//  $NC.setValue("#edtRemark1", rowData.REMARK1);
  
  $NC.setValue("#cboValid_Div", rowData.VALID_DIV);
//  $NC.setValue("#cboRefund_Price_Type", rowData.REFUND_PRICE_TYPE);
//  $NC.setValue("#cboShip_Price_Cd", rowData.REFUND_SHIP_PRICE_CD);
//  $NC.setValue("#edtShip_Price", rowData.SHIP_PRICE);
//  $NC.setValue("#cboCarrier_Div", rowData.CARRIER_DIV);
//  $NC.setValue("#edtRefund_Wb_No", rowData.REFUND_WB_NO);
}


function setProgressBar(val) {

  if ($NC.isNull(val)) {
    val = 0;
  }

  $NC.G_VAR.SUM_INSPECT_QTY = $NC.G_VAR.SUM_INSPECT_QTY + Number(val);
  var TOTAL_INSPECT_QTY = $NC.G_VAR.SUM_INSPECT_QTY;
  var CONFIRM_RATE = $NC.getRoundVal((TOTAL_INSPECT_QTY / $NC.G_VAR.SUM_ENTRY_QTY) * 100);

  $NC.setValue("#divProgressVal", TOTAL_INSPECT_QTY + " / " + $NC.G_VAR.SUM_ENTRY_QTY + " [ " + CONFIRM_RATE + "%]");
  $("#divProgressbar").progressbar("value", CONFIRM_RATE);
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

function onError(ajaxData) {

  var errorData = $NC.getErrorMessage(ajaxData);
  switch (errorData.RESULT_CD) {
  case $NC.G_CONSTS.RESULT_CD_ERROR:
    $NC.G_MAIN.showMessage({
      message: errorData.RESULT_MSG,
      buttons: {
        "확인": function() {
          $NC.G_MAIN.setFocusActiveWindow();
          setFocusScan();
        }
      },
      hideFocus: true
    });
    break;
  case $NC.G_CONSTS.RESULT_CD_ACCESSDENIED:
    alert(errorData.RESULT_MSG);
    $NC.G_MAIN.showLoginPopup(1);
    break;
  case $NC.G_CONSTS.RESULT_CD_ERROR_HTML:
    $NC.G_MAIN.showMessage({
      title: "오류",
      message: errorData.RESULT_MSG,
      width: 700,
      height: 450,
      buttons: {
        "확인": function() {
          $NC.G_MAIN.setFocusActiveWindow();
          setFocusScan();
        }
      },
      hideFocus: true
    });
    break;
  default:
    $NC.G_MAIN.setFocusActiveWindow();
    setFocusScan();
  }
}
