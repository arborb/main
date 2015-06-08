function _Initialize() {
  $NC.setGlobalVar({
    policyVal: {
      LO420: "",
      LO440: "",
      LO450: ""
    },
    CARRIER_CD: "",
    COMPARE_SCAN: "",
    BARCD_DATA_DIV: "-",
    NEWORDER_CHK: "",
    ORDERCAN_CHK: "",
    ORDERHOLD_CHK: "",
    SUM_ENTRY_QTY: 0,
    SUM_CONFIRM_QTY: 0,
    SUM_INSPECT_QTY: 0,
    SUM_NONINSPECT_QTY: 0,
    SUM_CANCEL_QTY: 0,
    CANCEL_YN: "N",
    INSPECT_YN: "N",
    SCANCOMPLETE: true
  });
  $NC.G_JWINDOW.set({
    minWidth: 1050,
    minHeight: 550
  });
  var a = $NC.G_JWINDOW.get("onFocus");
  $NC.G_JWINDOW.set("onFocus", function() {
    a.call(this, $NC.G_JWINDOW);
    setFocusScan();
  });
  grdMasterInitialize();
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
  $NC.setInitDatePicker("#dtpQOutbound_Date");
  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQCarrier_Cd").click(showCarrierPopup);
  $("#btnBoxManage").click(onBtnBoxManage);
  $("#btnBWScanConfirm").click(onBtnBWScanConfirm);
  $("#btnInit").click(onBtnInit);
  $("#edtScan").css("ime-mode", "disabled");
  $("#divMasterView,#divGridBox,#divBottomView").mousedown(function(b) {
    b.stopImmediatePropagation();
    b.preventDefault();
    setTimeout(function() {
      setFocusScan();
    }, 100);
  });
  $("#divMasterInfoExpender").mouseenter(function(c) {
    var b = $("#tblMasterInfoView").data("resizeVal");
    if (b == $NC.G_OFFSET.masterInfoMaxLine) {
      return;
    }
    $("#tblMasterInfoView").find("tr").show();
  }).mouseleave(function(c) {
    var b = $("#tblMasterInfoView").data("resizeVal");
    if (b == $NC.G_OFFSET.masterInfoMaxLine) {
      return;
    }
    $("#tblMasterInfoView").find("tr:gt(" + (b - 1) + ")").hide();
  }).hide();
  setEnableButton("#btnBoxManage", false);
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
      setPolicyValInfo();
    }
  });
  $NC.G_VAR.buttons._inquiry = "0";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
  $NC.G_JWINDOW.maximise(function() {
    setFocusScan();
  });
}
function _OnLoaded() {
}
function _SetResizeOffset() {
  $NC.G_OFFSET.masterInfoMinLine = 2;
  $NC.G_OFFSET.masterInfoMaxLine = 4;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $("#divBottomView").outerHeight(true)
      + $NC.G_LAYOUT.nonClientHeight - 1;
}
function _OnResize(f) {
  var g = f.width() - $NC.G_LAYOUT.border1;
  var c = f.height() - $NC.G_OFFSET.nonClientHeight;
  var e = Math.max($NC.getTruncVal(g * 0.35), 500);
  var d = g - e - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.border1;
  $NC.resizeContainer("#divCenterView", g, c);
  $NC.resizeContainer("#divDetailView", d, c);
  $NC.resizeContainer("#divMasterView", e, c);
  var a = Math.max(Math.min($NC.getTruncVal((c - 700) / 20) * 10, 100), 0);
  var b = $("#edtBox_No");
  if (a != b.data("resizeVal")) {
    b.css({
      height: 46 + a,
      "font-size": 20 + a
    }).data("resizeVal", a);
  }
  a = $NC.G_OFFSET.masterInfoMaxLine;
  if (c < 700) {
    a = Math.min(Math.max($NC.G_OFFSET.masterInfoMaxLine - Math.ceil((700 - c) / 35), $NC.G_OFFSET.masterInfoMinLine),
        $NC.G_OFFSET.masterInfoMaxLine);
  }
  b = $("#tblMasterInfoView");
  if (a != b.data("resizeVal")) {
    b.find("tr:gt(1)").show();
    b.find("tr:gt(" + (a) + ")").hide();
    b.data("resizeVal", a);
    $("#divMasterInfoExpender").hide();
  }
  $NC.resizeGrid("#grdMaster", d, c - ($NC.G_LAYOUT.header + $NC.G_LAYOUT.border1));
}
function _OnInputKeyDown(b, a) {
}
function _OnInputKeyUp(d, b) {
  var f = b.prop("id").substr(3).toUpperCase();
  switch (f) {
  case "SCAN":
    var a = "";
    var c = 0;
    if (d.keyCode == 13) {
      a = $NC.getValue(b);
      c = a.length;
      if (c == 0) {
        d.stopImmediatePropagation();
        return;
      }
      a = a.toUpperCase();
      if (a.substr(0, 2) == "TP" && a.match(/-/g).length == 4) {
        onScanOrder(a);
        d.stopImmediatePropagation();
        return;
      }
      if (G_GRDMASTER.data.getLength() > 0 && $NC.G_VAR.COMPARE_SCAN !== a) {
        if (a.length < 7) {
          setFocusScan();
          d.stopImmediatePropagation();
          return;
        }
      }
      onScanItem(a);
      d.stopImmediatePropagation();
      return;
    }
    break;
  }
}
function _OnConditionChange(c, a, f) {
  var g = a.prop("id").substr(4).toUpperCase();
  switch (g) {
  case "CENTER_CD":
    setPolicyValInfo();
    break;
  case "BU_CD":
    var d;
    var b = [ ];
    if (!$NC.isNull(f)) {
      d = {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: f
      };
      b = $NP.getUserBuInfo({
        queryParams: d
      });
    }
    if (b.length <= 1) {
      onUserBuPopup(b[0]);
    } else {
      $NP.showUserBuPopup({
        queryParams: d,
        queryData: b
      }, onUserBuPopup, onUserBuPopup);
    }
    return;
  case "CARRIER_CD":
    var d;
    var b = [ ];
    if (!$NC.isNull(f)) {
      d = {
        P_CARRIER_CD: f,
        P_VIEW_DIV: "1"
      };
      b = $NP.getCarrierInfo({
        queryParams: d
      });
    }
    if (b.length <= 1) {
      onCarrierPopup(b[0]);
    } else {
      $NP.showCarrierPopup({
        queryParams: d,
        queryData: b
      }, onCarrierPopup, onCarrierPopup);
    }
    return;
  case "OUTBOUND_DATE":
    $NC.setValueDatePicker(a, f, "출고일자를 정확히 입력하십시오.");
    break;
  }
  onChangingCondition();
}
function onChangingCondition() {
  $NC.clearGridData(G_GRDMASTER);
  $NC.G_VAR.SUM_ENTRY_QTY = 0;
  $NC.G_VAR.SUM_CONFIRM_QTY = 0;
  $NC.G_VAR.SUM_INSPECT_QTY = 0;
  $NC.G_VAR.INSPECT_YN = "N";
  $NC.G_VAR.SCANCOMPLETE = true;
  $NC.setEnable("#cboQCenter_Cd");
  $NC.setEnable("#edtQBu_Cd");
  $NC.setEnable("#btnQBu_Cd");
  $NC.setEnable("#dtpQOutbound_Date");
  $NC.setEnable("#cboQOutbound_Batch");
  $NC.setEnable("#btnQOutbound_Batch");
  $NC.setValue("#edtQEntry_Qty", 0);
  $NC.setValue("#edtQInspect_Qty", 0);
  $NC.setValue("#edtQNonInspect_Qty", 0);
  $NC.setValue("#edtQCancel_Qty", 0);
  $NC.setValue("#edtQOutbound_No");
  $NC.setValue("#edtQPaper_No");
  $NC.setValue("#edtQItem_Barcd");
  $NC.setValue("#cboQOutbound_Batch");
  setOrderInfoValue();
  setItemInfoValue();
  $NC.setValue("#edtBox_No");
  setEnableButton("#btnBoxManage", false);
  setFocusScan();
}
function _Inquiry() {
  $NC.setInitGridVar(G_GRDMASTER);
  var e = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(e)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }
  var c = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(c)) {
    showMessage({
      message: "사업구분 코드를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }
  var a = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(a)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }
  var b = $NC.getValue("#cboQOutbound_Batch");
  if ($NC.isNull(b)) {
    showMessage("단품주문건이 해당하는 출고차수가 없습니다.");
    return;
  }
  var d = $NC.getValue("#edtQItem_Barcd");
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: e,
    P_BU_CD: c,
    P_OUTBOUND_DATE: a,
    P_OUTBOUND_BATCH: b,
    P_ITEM_BAR_CD: d
  });
  G_GRDMASTER.queryId = "LOM7030E.RS_MASTER";
  $NC.serviceCall("/LOM7030E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onError);
}
function _New() {
}
function _Save(i) {
  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }
  var h = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(h)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }
  var g = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(g)) {
    showMessage({
      message: "사업구분 코드를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }
  var b = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(b)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }
  var f = $NC.getValue("#edtBox_No");
  if ($NC.isNull(f)) {
    showMessage("박스번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }
  var j = [ ];
  var e;
  var d = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (d.CRUD == "U") {
    e = {
      P_CENTER_CD: d.CENTER_CD,
      P_BU_CD: d.BU_CD,
      P_OUTBOUND_DATE: d.OUTBOUND_DATE,
      P_OUTBOUND_NO: d.OUTBOUND_NO,
      P_BOX_NO: d.BOX_NO,
      P_BRAND_CD: d.BRAND_CD,
      P_ITEM_CD: d.ITEM_CD,
      P_ITEM_STATE: d.ITEM_STATE,
      P_ITEM_LOT: d.ITEM_LOT,
      P_CONFIRM_QTY: d.INSPECT_QTY
    };
    j.push(e);
  }
  var c = "N";
  var a;
  switch (i) {
  case "onBoxComplete":
    if (j.length === 0 && $NC.G_VAR.SUM_INSPECT_QTY == 0) {
      showMessage("검수 후 박스완료 처리하십시오.");
      return;
    }
    c = "Y";
    a = onBoxComplete;
    break;
  case "onBoxSave":
    if (j.length === 0) {
      showMessage("검수 후 박스저장 처리하십시오.");
      return;
    }
    a = onBoxSave;
    break;
  case "onShowBoxManage":
    if (j.length === 0) {
      onShowBoxManage();
      return;
    }
    a = onShowBoxManage;
    break;
  default:
    return;
  }
  $NC.serviceCallAndWait("/LOM7030E/save.do", {
    P_DS_MASTER: $NC.getParams({
      P_CENTER_CD: d.CENTER_CD,
      P_BU_CD: d.BU_CD,
      P_OUTBOUND_DATE: d.OUTBOUND_DATE,
      P_OUTBOUND_NO: d.OUTBOUND_NO,
      P_BOX_NO: d.BOX_NO,
      P_BOX_TYPE: "01",
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }),
    P_DS_DETAIL: $NC.toJson(j),
    P_COMPLETE_YN: c,
    P_CARRIER_CD: $NC.G_VAR.CARRIER_CD
  }, a, onError);
}
function _Delete() {
}
function _Cancel() {
  var a = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: new Array("OUTBOUND_NO", "SHIPPER_NM")
  });
  setTimeout(function() {
    G_GRDMASTER.lastKeyVal = a;
    _Inquiry();
  }, 400);
}
function _Print(a, b) {
}
function grdMasterOnGetColumns() {
  var a = [ ];
  $NC.setGridColumn(a, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자",
    minWidth: 100
  });
  $NC.setGridColumn(a, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 85,
    cssClass: "align-right"
  });
  $NC.setGridColumn(a, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "기검수수량",
    minWidth: 85,
    cssClass: "align-right"
  });
  $NC.setGridColumn(a, {
    id: "REMAIN_QTY",
    field: "REMAIN_QTY",
    name: "미검수수량",
    minWidth: 85,
    cssClass: "align-right"
  });
  $NC.setGridColumn(a, {
    id: "CANCEL_QTY",
    field: "CANCEL_QTY",
    name: "취소수량",
    minWidth: 85,
    cssClass: "align-right"
  });
  $NC.setGridColumn(a, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 100
  });
  $NC.setGridColumn(a, {
    id: "BU_KEY",
    field: "BU_KEY",
    name: "결제번호",
    minWidth: 80
  });
  $NC.setGridColumn(a, {
    id: "BU_NO",
    field: "BU_NO",
    name: "주문번호",
    minWidth: 100
  });
  $NC.setGridColumn(a, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자",
    minWidth: 100
  });
  $NC.setGridColumn(a, {
    id: "BRAND_NM1",
    field: "BRAND_NM",
    name: "위탁사명",
    minWidth: 90
  });
  return $NC.setGridColumnDefaultFormatter(a);
}
function grdMasterInitialize() {
  var a = {
    rowHeight: 32,
    specialRow: {
      compareFn: function(b, c) {
        if (c.INSPECT_YN === "Y") {
          return "specialrow3";
        }
        if (c.CANCEL_QTY > 0) {
          return "specialrow4";
        }
      }
    }
  };
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LOM7030E.RS_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: a
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}
function grdMasterOnAfterScroll(b, a) {
  var c = a.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (c == G_GRDMASTER.lastRow) {
      b.stopImmediatePropagation();
      return;
    }
  }
  setItemInfoValue(G_GRDMASTER.data.getItem(c));
  setOrderInfoValue(G_GRDMASTER.data.getItem(c));
  $NC.setGridDisplayRows("#grdMaster", c + 1);
  setFocusScan();
}
function onBtnBoxSave(a) {
  if ($(a.target).hasClass("disabled")) {
    return;
  }
  _Save("onBoxSave");
}
function onBtnBoxComplete(a) {
  if (a != undefined && $(a.target).hasClass("disabled")) {
    return;
  }
  if ($NC.isNull($NC.G_VAR.CARRIER_CD)) {
    showMessage("운송사 선택 후 박스완료 처리하십시오.");
    return;
  }
  if ($NC.isNull($NC.G_USERINFO.PRINT_WB_NO) || $NC.isNull($NC.G_USERINFO.PRINT_LO_BILL)
      || $NC.isNull($NC.G_USERINFO.PRINT_CARD)) {
    alert("설정하신 프린터가 없습니다.\n\n자동출력프린터를 먼저 등록하십시오.");
    return;
  }
  _Save("onBoxComplete");
}
function onBtnBoxManage(a) {
  if ($(a.target).hasClass("disabled")) {
    return;
  }
  _Save("onShowBoxManage");
}
function onBtnFWScanConfirm(g) {
  if (g != undefined && $(g.target).hasClass("disabled")) {
    return;
  }
  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }
  var c = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(c)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }
  var b = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(b)) {
    showMessage({
      message: "사업구분 코드를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }
  var a = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(a)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }
  var d = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var f = d.OUTBOUND_NO;
  $NC.serviceCall("/LOM7030E/callFWScanConfirm.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: c,
      P_BU_CD: b,
      P_OUTBOUND_DATE: a,
      P_OUTBOUND_NO: f,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onFWScanConfirm, onError);
}
function onBtnBWScanConfirm(f) {
  if ($(f.target).hasClass("disabled")) {
    return;
  }
  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }
  var c = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(c)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }
  var b = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(b)) {
    showMessage({
      message: "사업구분 코드를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }
  var a = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(a)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }
  var d = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  showMessage({
    message: "검수취소 처리하시겠습니까?",
    onYesFn: function() {
      $NC.serviceCall("/LOM7030E/callBWScanConfirm.do", {
        P_QUERY_PARAMS: $NC.getParams({
          P_CENTER_CD: d.CENTER_CD,
          P_BU_CD: d.BU_CD,
          P_OUTBOUND_DATE: d.OUTBOUND_DATE,
          P_OUTBOUND_NO: d.OUTBOUND_NO,
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
function onBtnInit(b) {
  if ($(b.target).hasClass("disabled")) {
    return;
  }
  var a = function() {
    onChangingCondition();
    $NC.setEnable("#cboQCenter_Cd");
    $NC.setEnable("#edtQBu_Cd");
    $NC.setEnable("#btnQBu_Cd");
    $NC.setEnable("#dtpQOutbound_Date");
    $NC.setEnable("#cboQOutbound_Batch");
    $NC.setEnable("#btnQOutbound_Batch");
    $NC.G_VAR.NEWORDER_CHK = "";
    $NC.G_VAR.ORDERCAN_CHK = "";
    $NC.G_VAR.ORDERHOLD_CHK = "";
    setFocusScan();
  };
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.G_VAR.INSPECT_YN == "Y") {
      a.call(this);
    } else {
      showMessage({
        message: "현재 검수 작업 중 입니다.\n\n초기화 하시겠습니까?",
        onYesFn: function() {
          a.call(this);
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
function onGetMaster(a) {
  $NC.setInitGridData(G_GRDMASTER, a);
  var b;
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["OUTBOUND_NO", "SHIPPER_NM"],
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
    b = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    setOrderInfoValue(b);
    onCalcSummary();
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
    showMessage("조회된 데이터가 없습니다. 확인 후 작업하십시오.");
    b = G_GRDMASTER.data.getItem(0);
    setOrderInfoValue(b);
    onCalcSummary();
    return;
  }
  $NC.G_VAR.ORDERCAN_CHK = b.ORDER_CAN;
  $NC.G_VAR.ORDERHOLD_CHK = b.ORDER_HOLD;
  if ($NC.G_VAR.ORDERCAN_CHK == "Y") {
    setEnableButton("#btnBoxSave", false);
    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxManage", false);
    setEnableButton("#btnFWScanConfirm", false);
    setEnableButton("#btnBWScanConfirm", false);
    setEnableButton("#btnDeliveryChange", false);
    $NC.setValue("#edtBox_No", "주문취소");
    $("#edtBox_No").addClass("inspected");
    return;
  } else {
    if ($NC.G_VAR.ORDERCAN_CHK == "Z") {
      setEnableButton("#btnBoxSave", false);
      setEnableButton("#btnBoxComplete", false);
      setEnableButton("#btnBoxManage", false);
      setEnableButton("#btnFWScanConfirm", false);
      setEnableButton("#btnBWScanConfirm", false);
      setEnableButton("#btnDeliveryChange", false);
      $NC.setValue("#edtBox_No", "취소확인");
      $("#edtBox_No").addClass("inspected");
      return;
    } else {
      if ($NC.G_VAR.ORDERHOLD_CHK == "Y") {
        setEnableButton("#btnBoxSave", false);
        setEnableButton("#btnBoxComplete", false);
        setEnableButton("#btnBoxManage", false);
        setEnableButton("#btnFWScanConfirm", false);
        setEnableButton("#btnBWScanConfirm", false);
        setEnableButton("#btnDeliveryChange", false);
        $NC.setValue("#edtBox_No", "주문보류");
        $("#edtBox_No").addClass("inspected");
        return;
      } else {
        if (b.INSPECT_YN == "Y") {
          setEnableButton("#btnBoxManage", true);
          setEnableButton("#btnFWScanConfirm", false);
          setEnableButton("#btnBWScanConfirm", $NC.getProgramPermission().canConfirmCancel);
          $NC.setValue("#edtBox_No", "검수완료");
          $("#edtBox_No").addClass("inspected");
          return;
        } else {
          $NC.setValue("#edtBox_No", b.BOX_NO);
          $("#edtBox_No").removeClass("inspected");
        }
      }
    }
  }
  setFocusScan();
}
function doPrint1() {
  var a = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var b = [ ];
  b.push($NC.getValue("#edtBox_No"));
  if ($NC.G_VAR.CARRIER_CD == "0020") {
    /*var reportDoc = "lo/LABEL_LOM09_1";
    var queryId = "WR.RS_LABEL_LOM03_1";
    var queryParams = {
      P_CENTER_CD: a.CENTER_CD,
      P_BU_CD: a.BU_CD,
      P_OUTBOUND_DATE: a.OUTBOUND_DATE,
      P_OUTBOUND_NO: a.OUTBOUND_NO,
      P_ITEM_CD: a.ITEM_CD,
      P_PRINT_YN: ""
    };

    // 출력 호출
    $NC.G_MAIN.showPrintPreview({
      reportDoc: reportDoc,
      queryId: queryId,
      queryParams: queryParams,
      iFrameNo: 1,
      checkedValue: b.toString(),
      silentPrinterName: $NC.G_USERINFO.PRINT_WB_NO,
      internalQueryYn: "N"
    });*/
    $NC.G_MAIN.silentPrint({
      printParams: [{
        reportDoc: "lo/LABEL_LOM09_1",
        queryId: "WR.RS_LABEL_LOM03_1",
        queryParams: {
          P_CENTER_CD: a.CENTER_CD,
          P_BU_CD: a.BU_CD,
          P_OUTBOUND_DATE: a.OUTBOUND_DATE,
          P_OUTBOUND_NO: a.OUTBOUND_NO,
          P_ITEM_CD: a.ITEM_CD,
          P_PRINT_YN: ""
        },
        iFrameNo: 1,
        checkedValue: b.toString(),
        silentPrinterName: $NC.G_USERINFO.PRINT_WB_NO,
        internalQueryYn: "N"
      }],
      onAfterPrint: function() {
        setFocusScan();
      }
    });
  } else {
    /*var reportDoc = "lo/LABEL_LOM09_1";
    var queryId = "WR.RS_LABEL_LOM02_1";
    var queryParams = {
      P_CENTER_CD: a.CENTER_CD,
      P_BU_CD: a.BU_CD,
      P_OUTBOUND_DATE: a.OUTBOUND_DATE,
      P_OUTBOUND_NO: a.OUTBOUND_NO,
      P_ITEM_CD: a.ITEM_CD,
      P_PRINT_YN: ""
    };

    // 출력 호출
    $NC.G_MAIN.showPrintPreview({
      reportDoc: reportDoc,
      queryId: queryId,
      queryParams: queryParams,
      iFrameNo: 1,
      checkedValue: b.toString(),
      silentPrinterName: $NC.G_USERINFO.PRINT_WB_NO,
      internalQueryYn: "N"
    });*/
    $NC.G_MAIN.silentPrint({
      printParams: [{
        reportDoc: "lo/LABEL_LOM09_1",
        queryId: "WR.RS_LABEL_LOM02_1",
        queryParams: {
          P_CENTER_CD: a.CENTER_CD,
          P_BU_CD: a.BU_CD,
          P_OUTBOUND_DATE: a.OUTBOUND_DATE,
          P_OUTBOUND_NO: a.OUTBOUND_NO,
          P_ITEM_CD: a.ITEM_CD,
          P_PRINT_YN: ""
        },
        iFrameNo: 1,
        checkedValue: b.toString(),
        silentPrinterName: $NC.G_USERINFO.PRINT_WB_NO,
        internalQueryYn: "N"
      }],
      onAfterPrint: function() {
        setFocusScan();
      }
    });
  }
}
function doPrint2() {
  var b = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var a = {
    printParams: [{
      reportDoc: "lo/RECEIPT_LOM01",
      queryId: "WR.RS_RECEIPT_LOM01",
      queryParams: {
        P_CENTER_CD: b.CENTER_CD,
        P_BU_CD: b.BU_CD,
        P_OUTBOUND_DATE: b.OUTBOUND_DATE,
        P_OUTBOUND_NO: b.OUTBOUND_NO,
        P_POLICY_LO450: $NC.G_VAR.policyVal.LO450
      },
      iFrameNo: 2,
      silentPrinterName: $NC.G_USERINFO.PRINT_LO_BILL
    }],
    onAfterPrint: function() {
      setFocusScan();
    }
  };
  if (!$NC.isNull($NC.getValue("#edtCard_Msg"))) {
    a.printParams.push({
      reportDoc: "lo/CARD_LOM" + b.BRAND_CD,
      queryId: "WR.RS_CARD_LOM01",
      queryParams: {
        P_CENTER_CD: b.CENTER_CD,
        P_BU_CD: b.BU_CD,
        P_OUTBOUND_DATE: b.OUTBOUND_DATE,
        P_OUTBOUND_NO: b.OUTBOUND_NO
      },
      iFrameNo: 3,
      silentPrinterName: $NC.G_USERINFO.PRINT_CARD
    });
  }
  $NC.G_MAIN.silentPrint(a);
  //$NC.G_MAIN.showPrintPreview(a)
}
function doPrint3() {
  /*var a = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var reportDoc = "lo/LABEL_LOM09_2";
  var queryId = "WR.RS_LABEL_LOM02_2";
  var queryParams = {
    P_CENTER_CD: a.CENTER_CD,
    P_BU_CD: a.BU_CD,
    P_OUTBOUND_DATE: a.OUTBOUND_DATE,
    P_OUTBOUND_NO: a.OUTBOUND_NO,
    P_ITEM_CD: a.ITEM_CD,
    P_PRINT_YN: ""
  };

  // 출력 호출
  $NC.G_MAIN.showPrintPreview({
    reportDoc: reportDoc,
    queryId: queryId,
    queryParams: queryParams,
    iFrameNo: 1,
    silentPrinterName: $NC.G_USERINFO.PRINT_WB_NO,
    internalQueryYn: "N"
  });*/
  $NC.G_MAIN.silentPrint({
    printParams: [{
      reportDoc: "lo/LABEL_LOM09_2",
      queryId: "WR.RS_LABEL_LOM02_2",
      queryParams: {
        P_CENTER_CD: a.CENTER_CD,
        P_BU_CD: a.BU_CD,
        P_OUTBOUND_DATE: a.OUTBOUND_DATE,
        P_OUTBOUND_NO: a.OUTBOUND_NO,
        P_ITEM_CD: a.ITEM_CD,
        P_PRINT_YN: ""
      },
      iFrameNo: 1,
      silentPrinterName: $NC.G_USERINFO.PRINT_WB_NO,
      internalQueryYn: "N"
    }],
    onAfterPrint: function() {
      setFocusScan();
    }
  });
}
function onShowBoxManage(a) {
  if (!$NC.isNull(a)) {
    var e = $NC.toArray(a);
    if (e.O_MSG !== "OK") {
      showMessage(e.O_MSG);
      return;
    }
  }
  var f = $NC.getValue("#cboQCenter_Cd");
  var c = $NC.getValue("#edtQBu_Cd");
  var b = $NC.getValue("#dtpQOutbound_Date");
  var g = $NC.getValue("#edtQOutbound_No");
  var d = $NC.getValue("#edtQItem_Barcd");
  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LOM7031P",
    PROGRAM_NM: "박스통합",
    url: "lo/LOM7031P.html",
    width: 870,
    height: 450,
    userData: {
      P_CENTER_CD: f,
      P_BU_CD: c,
      P_OUTBOUND_DATE: b,
      P_OUTBOUND_NO: g,
      P_ITEM_CD: d,
      P_CARRIER_CD: $NC.G_VAR.CARRIER_CD,
      P_POLICY_LO450: $NC.G_VAR.policyVal.LO450,
      P_INSPECT_YN: $NC.G_VAR.INSPECT_YN === "Y" ? false : true,
      P_CARD_MSG_YN: $NC.isNull($NC.getValue("#edtCard_Msg")) === true ? false : true
    },
    onCancel: function() {
      if ($NC.G_VAR.INSPECT_YN == "Y") {
        return;
      }
      var h = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: new Array("OUTBOUND_NO", "SHIPPER_NM")
      });
      _Inquiry();
      G_GRDMASTER.lastKeyVal = h;
    }
  });
}
function onBoxSave(a) {
  _Cancel();
}
function onBoxComplete(a) {
  doPrint1();
  _Cancel();
}
function onFWScanConfirm(a) {
  var e = $NC.toArray(a);
  if (!$NC.isNull(e)) {
    if (e.O_MSG !== "OK") {
      showMessage(e.O_MSG);
      return;
    }
  }
  var f = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(f)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }
  var c = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(c)) {
    showMessage({
      message: "사업구분 코드를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }
  var b = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(b)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }
  var d = $NC.getValue("#edtQItem_Barcd");
  $NC.serviceCallAndWait("/LOM7010E/callSP.do", {
    P_QUERY_ID: "LOM7030E.GET_INQUERY_YN",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: f,
      P_BU_CD: c,
      P_OUTBOUND_DATE: b,
      P_OUTBOUND_BATCH: OUTBOUND_BATCH,
      P_ITEM_BAR_CD: d
    })
  }, onGetInquery_Yn);
}
function onGetInquery_Yn(a) {
  var b = $NC.toArray(a);
  if (!$NC.isNull(b)) {
    if (b.O_MSG !== "OK") {
      showMessage(b.O_MSG);
      return;
    }
  }
  if (b.O_INQUERY_YN == "Y") {
    _Inquiry();
    return;
  }
  onChangingCondition();
}
function onBWScanConfirm(a) {
  var b = $NC.toArray(a);
  if (!$NC.isNull(b)) {
    if (b.O_MSG !== "OK") {
      showMessage(b.O_MSG);
      return;
    }
  }
  onChangingCondition();
}
function onChkFWScanConfirm() {
  if (!onValidateScan(true)) {
    return;
  }
  var a = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (a.ORDER_CAN == "Y" || a.INSPECT_YN == "Y") {
    setFocusScan();
    return;
  }
  if (a.REMAIN_QTY == 0 && (a.ENTRY_QTY == a.INSPECT_QTY + a.CONFIRM_QTY)) {
    $NC.G_VAR.SCANCOMPLETE = false;
    if (!$NC.isNull($NC.G_USERINFO.PRINT_WB_NO) && !$NC.isNull($NC.G_USERINFO.PRINT_LO_BILL)
        && !$NC.isNull($NC.G_USERINFO.PRINT_CARD)) {
      doPrint1();
      _Cancel();
    } else {
      alert("설정하신 프린터가 없습니다.\n\n자동출력프린터를 먼저 등록하십시오.");
      return;
    }
    return;
  }
  $NC.G_VAR.SCANCOMPLETE = true;
  setFocusScan();
}
function setUpdateOrderCan(d, a, c, e, b) {
  if ($NC.isNull($NC.G_USERINFO.PRINT_WB_NO) || $NC.isNull($NC.G_USERINFO.PRINT_LO_BILL)
      || $NC.isNull($NC.G_USERINFO.PRINT_CARD)) {
    alert("설정하신 프린터가 없습니다.\n\n자동출력프린터를 먼저 등록하십시오.");
    return;
  }
  $NC.serviceCallAndWait("/LOM7030E/callSP.do", {
    P_QUERY_ID: "LO_FW_SCAN_ORDER_TP2",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: d,
      P_BU_CD: a,
      P_OUTBOUND_DATE: c,
      P_OUTBOUND_NO: e,
      P_ITEM_CD: b,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onGetUpdateOrderCan, onError);
}
function onGetUpdateOrderCan(a) {
  var b = $NC.toArray(a.data);
  if (!$NC.isNull(b)) {
    if (b.O_MSG !== "OK") {
      showMessage(b.O_MSG);
      return;
    }
  }
  doPrint3();
  _Cancel();
}
function showUserBuPopup() {
  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    setFocusScan();
  });
}
function onUserBuPopup(a) {
  if (!$NC.isNull(a)) {
    $NC.setValue("#edtQBu_Cd", a.BU_CD);
    $NC.setValue("#edtQBu_Nm", a.BU_NM);
    $NC.setValue("#edtQCust_Cd", a.CUST_CD);
    setFocusScan();
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
  setPolicyValInfo();
}
function showCarrierPopup() {
  var a = $NC.getValue("#edtQCarrier_Cd");
  $NP.showCarrierPopup({
    queryParams: {
      P_CARRIER_CD: a,
      P_VIEW_DIV: "1"
    }
  }, onCarrierPopup, function() {
    $NC.setFocus("#edtQCarrier_Cd", true);
  });
}
function onCarrierPopup(a) {
  if (!$NC.isNull(a)) {
    $NC.setValue("#edtQCarrier_Cd", a.CARRIER_CD);
    $NC.setValue("#edtQCarrier_Nm", a.CARRIER_NM);
  } else {
    $NC.setValue("#edtQCarrier_Cd");
    $NC.setValue("#edtQCarrier_Nm");
    $NC.setFocus("#edtQCarrier_Cd", true);
  }
}
function setPolicyValInfo() {
  $NC.G_VAR.policyVal.LO420 = "";
  $NC.G_VAR.policyVal.LO440 = "";
  $NC.G_VAR.policyVal.LO450 = "";
  var c = $NC.getValue("#cboQCenter_Cd");
  var b = $NC.getValue("#edtQBu_Cd");
  for ( var a in $NC.G_VAR.policyVal) {
    $NC.serviceCallAndWait("/LOM7030E/callSP.do", {
      P_QUERY_ID: "WF.GET_POLICY_VAL",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: c,
        P_BU_CD: b,
        P_POLICY_CD: a
      })
    }, onGetPolicyVal, onError);
  }
}
function onGetPolicyVal(a) {
  var b = $NC.toArray(a.data);
  if (!$NC.isNull(b)) {
    if (b.O_MSG === "OK") {
      $NC.G_VAR.policyVal[b.P_POLICY_CD] = b.O_POLICY_VAL;
    }
    var c = [ ];
    if (b.P_POLICY_CD == "LO440") {
      $NC.G_VAR.CARRIER_CD = b.O_POLICY_VAL;
      c = $NP.getCarrierInfo({
        queryParams: {
          P_CARRIER_CD: $NC.G_VAR.CARRIER_CD,
          P_VIEW_DIV: "1"
        }
      });
      onCarrierPopup(c[0]);
    }
  }
}
function onScanOrder(a) {
  var b = function() {
    onChangingCondition();
    var d = a.substr(2).split($NC.G_VAR.BARCD_DATA_DIV);
    var c = d[0];
    var h = d[1];
    var f = $NC.getDate(d[2]);
    var g = d[3];
    var e = d[4];
    $NC.G_VAR.COMPARE_SCAN = d[4];
    $NC.setValue("#cboQCenter_Cd", c);
    $NC.setValue("#edtQBu_Cd", h);
    $NC.setValue("#dtpQOutbound_Date", f);
    $NC.setValue("#cboQOutbound_Batch", g);
    $NC.setValue("#edtQItem_Barcd", e);
    _Inquiry();
  };
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.G_VAR.INSPECT_YN == "N") {
      showMessage({
        message: "현재 검수 작업 중 입니다.\n\n데이터를 다시 가져오시겠습니까?",
        onYesFn: function() {
          b.call(this);
        },
        onNoFn: function() {
          setFocusScan();
        }
      });
    } else {
      b.call(this);
    }
    return;
  }
  b.call(this);
}
function onScanItem(a) {
  if (!onValidateScan(false)) {
    return;
  }
  if (onScanItemCounting(a)) {
    return;
  }
  var d = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(d)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }
  var c = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(c)) {
    showMessage({
      message: "사업구분 코드를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }
  var b = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(b)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }
  var e = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var f = e.OUTBOUND_NO;
  $NC.serviceCallAndWait("/LOM7030E/callSP.do", {
    P_QUERY_ID: "LOM7030E.GET_ITEM_INFO",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: d,
      P_BU_CD: c,
      P_OUTBOUND_DATE: b,
      P_OUTBOUND_NO: f,
      P_ITEM_BAR_CD: a
    })
  }, onGetItemInfo, onError);
}
function onScanFnButton(a) {
}
function onScanFnNumAdd(a) {
  if (!onValidateScan(true)) {
    return;
  }
  var f = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (f.INSPECT_YN == "Y") {
    showMessage("검수가 완료된 상품입니다.");
    return;
  }
  if ($NC.G_VAR.ORDERCAN_CHK == "Y") {
    f.ORDER_CAN = "Y";
    $NC.setValue("#edtBox_No", "주문취소");
    $("#edtBox_No").addClass("inspected");
    return true;
  } else {
    f.ORDER_CAN = "N";
    $NC.setValue("#edtBox_No", f.BOX_NO);
    $("#edtBox_No").removeClass("inspected");
  }
  if (!f) {
    showMessage("상품이 선택되지 않았습니다.\n\n상품 선택 또는 스캔 후 입력하십시오.");
    return;
  }
  var e = Number(f.ENTRY_QTY);
  var b = Number(f.CONFIRM_QTY);
  var c = Number(f.INSPECT_QTY);
  var d = Number(a);
  if (isNaN(d) || d == 0) {
    showMessage("수량을 정확히 입력하십시오.");
    return;
  }
  if (e < c + b + d) {
    showMessage("등록수량을 초과해서 검수할 수 없습니다.\n\n수량을 다시 입력하십시오.");
    return;
  }
  f.INSPECT_QTY = c + d;
  f.REMAIN_QTY = e - b - c - d;
  $NC.setValue("#edtQOutbound_No", f.OUTBOUND_NO);
  if (f.CRUD === "R") {
    f.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(f.id, f);
  G_GRDMASTER.lastRowModified = true;
  setFocusScan();
}
function onScanFnNumSubtract(a) {
  if (!onValidateScan(true)) {
    return;
  }
  var f = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (!f) {
    showMessage("상품이 선택되지 않았습니다.\n\n상품 선택 또는 스캔 후 입력하십시오.");
    return;
  }
  if (f.INSPECT_YN == "Y") {
    showMessage("검수가 완료된 상품입니다.");
    return;
  }
  var e = Number(f.ENTRY_QTY);
  var b = Number(f.CONFIRM_QTY);
  var c = Number(f.INSPECT_QTY);
  var d = Number(a);
  if (isNaN(d) || d == 0) {
    showMessage("수량을 정확히 입력하십시오.");
    return;
  }
  if (c < d) {
    showMessage("현검수수량이 0보다 작을 수 없습니다\n\n수량을 다시 입력하십시오.");
    return;
  }
  f.INSPECT_QTY = c - d;
  f.REMAIN_QTY = e - b - c + d;
  if (f.CRUD === "R") {
    f.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(f.id, f);
  G_GRDMASTER.lastRowModified = true;
  setFocusScan();
}
function onScanFnNumDivide(a) {
  if (!onValidateScan(true)) {
    return;
  }
  var g = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (!g) {
    showMessage("상품이 선택되지 않았습니다.\n\n상품 선택 또는 스캔 후 입력하십시오.");
    return;
  }
  var f = Number(g.ENTRY_QTY);
  var b = Number(g.CONFIRM_QTY);
  var d = Number(g.INSPECT_QTY);
  var h = d;
  var e = 0;
  var c = a.length;
  if (c == 0) {
    e = f - b - d;
  } else {
    d = 0;
    e = Number(a);
  }
  if (isNaN(e)) {
    showMessage("수량을 정확히 입력하십시오.");
    return;
  }
  if (f < d + b + e) {
    showMessage("등록수량을 초과해서 검수할 수 없습니다.\n\n수량을 다시 입력하십시오.");
    return;
  }
  g.INSPECT_QTY = d + e;
  g.REMAIN_QTY = f - b - d - e;
  if (g.CRUD === "R") {
    g.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(g.id, g);
  G_GRDMASTER.lastRowModified = true;
  setFocusScan();
}
function onValidateScan(a) {
  if (G_GRDMASTER.data.getLength() == 0) {
    showMessage("현재 검수 중이 아닙니다.\n\n전표를 먼저 스캔하십시오.");
    return false;
  }
  if (a) {
    if ($NC.G_VAR.policyVal.LO420 !== "Y") {
      showMessage("정책 설정에 의해 검수수량을 직접 입력할 수 없습니다.\n\n스캔을 통해 검수 처리하삽시오.");
      return false;
    }
  }
  return true;
}
function onCalcSummary() {
  var a = 0;
  if (G_GRDMASTER.data.getLength() == 0) {
    $NC.G_VAR.SUM_ENTRY_QTY = 0;
    $NC.G_VAR.SUM_CONFIRM_QTY = 0;
    $NC.G_VAR.SUM_INSPECT_QTY = 0;
    $NC.G_VAR.SUM_NONINSPECT_QTY = 0;
    $NC.G_VAR.SUM_CANCEL_QTY = 0;
    a = 0;
  } else {
    var b = $NC.getGridSumVal(G_GRDMASTER, {
      sumKey: ["ENTRY_QTY", "CONFIRM_QTY", "INSPECT_QTY", "REMAIN_QTY"]
    });
    var c = $NC.getGridSumVal(G_GRDMASTER, {
      searchKey: "ORDER_CAN",
      searchVal: ["Y", "Z"],
      sumKey: ["ENTRY_QTY"]
    });
    $NC.G_VAR.SUM_ENTRY_QTY = b.ENTRY_QTY;
    $NC.G_VAR.SUM_INSPECT_QTY = b.INSPECT_QTY;
    $NC.G_VAR.SUM_CONFIRM_QTY = b.CONFIRM_QTY;
    $NC.G_VAR.SUM_CANCEL_QTY = (c.ENTRY_QTY === "" ? 0 : c.ENTRY_QTY);
    a = b.CONFIRM_QTY + b.INSPECT_QTY;
    $NC.G_VAR.SUM_NONINSPECT_QTY = b.REMAIN_QTY;
  }
  $NC.setValue("#edtQEntry_Qty", $NC.G_VAR.SUM_ENTRY_QTY);
  $NC.setValue("#edtQInspect_Qty", a);
  $NC.setValue("#edtQNonInspect_Qty", $NC.G_VAR.SUM_NONINSPECT_QTY);
  $NC.setValue("#edtQCancel_Qty", $NC.G_VAR.SUM_CANCEL_QTY);
}
function onGetItemInfo(a) {
  var b = $NC.toArray(a);
  if ($NC.isNull(b)) {
    return;
  }
  if (b.O_MSG !== "OK") {
    showMessage(b.O_MSG);
    return;
  }
  onScanItemCounting(b.P_ITEM_BARCD, b.O_COLUMN_NM, b.O_ITEM_CD);
}
function onScanItemCounting(j, a, b) {
  var h = -1;
  var c;
  if (!$NC.isNull(a)) {
    h = $NC.getGridSearchRow(G_GRDMASTER, {
      searchKey: a,
      searchVal: j
    });
  } else {
    for (var d = 0, g = G_GRDMASTER.data.getLength(); d < g; d++) {
      c = G_GRDMASTER.data.getItem(d);
      if (c.ITEM_CD === j || c.ITEM_BAR_CD === j || c.BOX_BAR_CD === j || c.CASE_BAR_CD === j) {
        if (c.INSPECT_YN == "N") {
          if (c.ORDER_CAN !== "Z") {
            h = d;
            break;
          }
        }
      }
    }
  }
  if (h == -1) {
    setFocusScan();
    return false;
  }
  $NC.setGridSelectRow(G_GRDMASTER, h);
  c = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (c.BAR_CNT == "Y") {
    showMessage("중복된 바코드 상품이 존재하여 검수 할 수 없습니다.");
    return true;
  }
  if (c.INSPECT_YN == "Y") {
    showMessage("검수가 완료된 상품입니다.");
    return true;
  }
  if (!$NC.isNull(a)) {
    c[a] = j;
  }
  if (c.ORDER_CAN == "Y") {
    setUpdateOrderCan(c.CENTER_CD, c.BU_CD, c.OUTBOUND_DATE, c.OUTBOUND_NO, c.ITEM_CD);
    return true;
  }
  var e = 1;
  var f = Number(c.ENTRY_QTY);
  var l = Number(c.CONFIRM_QTY);
  var k = Number(c.INSPECT_QTY);
  if (f < k + l + e) {
    showMessage("검수가 완료된 상품입니다. 다른 상품을 스캔하십시오.");
    return true;
  }
  c.INSPECT_QTY = k + e;
  c.REMAIN_QTY = f - l - k - e;
  $NC.setValue("#edtQOutbound_No", c.OUTBOUND_NO);
  if (c.CRUD === "R") {
    c.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(c.id, c);
  G_GRDMASTER.lastRowModified = true;
  if ($NC.isNull(c.ORDER_CAN) || c.ORDER_CAN == "N") {
    onBtnBoxComplete();
  }
  setFocusScan();
  return true;
}
function setFocusScan() {
  $NC.setFocus("#edtScan");
  $NC.setValue("#edtScan");
}
function setEnableButton(a, c) {
  var b = $NC.getView(a);
  if (b.length == 0) {
    return;
  }
  if ($NC.isNull(c)) {
    c = true;
  }
  if (c) {
    b.removeClass("disabled");
  } else {
    b.addClass("disabled");
  }
}
function setItemInfoValue(a) {
  if ($NC.isNull(a)) {
    a = {};
  }
  $NC.setValue("edtOrderer_Msg", a.ORDERER_MSG);
  $NC.setValue("edtRemark1", a.REMARK1);
  $NC.setValue("#edtItem_Barcd", a.ITEM_BAR_CD);
  $NC.setValue("#edtItem_Cd", a.ITEM_CD);
  $NC.setValue("#edtItem_Nm", a.ITEM_NM);
  $NC.setValue("#edtItem_Spec", a.ITEM_SPEC);
  $NC.setValue("#edtQty_In_Box", a.QTY_IN_BOX);
  $NC.setValue("#edtQPaper_No", a.PAPER_NO);
  if (a.DELIVERY_TYPE == "1") {
    $NC.G_VAR.CARRIER_CD = "0020";
  } else {
    $NC.G_VAR.CARRIER_CD = "0010";
  }
  if (a.INSPECT_YN == "Y") {
    setEnableButton("#btnBoxManage", true);
    setEnableButton("#btnFWScanConfirm", false);
    setEnableButton("#btnBWScanConfirm", $NC.getProgramPermission().canConfirmCancel);
    $NC.setValue("#edtBox_No", "검수완료");
    $("#edtBox_No").addClass("inspected");
    return;
  } else {
    setEnableButton("#btnBoxManage", false);
    setEnableButton("#btnFWScanConfirm", false);
    setEnableButton("#btnBWScanConfirm", false);
    if (a.ORDER_CAN == "Y") {
      $NC.setValue("#edtBox_No", "주문취소");
      $("#edtBox_No").addClass("inspected");
    } else {
      if (a.ORDER_CAN == "Z") {
        $NC.setValue("#edtBox_No", "취소확인");
        $("#edtBox_No").addClass("inspected");
      } else {
        $NC.setValue("#edtBox_No", a.BOX_NO);
        $("#edtBox_No").removeClass("inspected");
      }
    }
  }
}
function setOrderInfoValue(a) {
  if ($NC.isNull(a)) {
    a = {};
  }
  $NC.setValue("#edtShipper_Nm", a.SHIPPER_NM);
  $NC.setValue("#edtOrderer_Msg", a.ORDERER_MSG);
  $NC.setValue("#edtPacking_Batch", a.PACKING_BATCH);
  $NC.setValue("#edtDelivery_Type", a.DELIVERY_TYPE_D);
  $NC.setValue("#edtShip_Type", a.SHIP_TYPE_D);
  $NC.setValue("#edtOutbound_No", a.OUTBOUND_NO);
  $NC.setValue("#edtQOutbound_No", a.OUTBOUND_NO);
  $NC.setValue("#edtBu_No", a.BU_NO);
  $NC.setValue("#edtRemark1", a.REMARK1);
}
function onBtnBoxCancelExec(b) {
  if ($(b.target).hasClass("disabled")) {
    return;
  }
  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }
  var a = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  showMessage({
    message: "취소확인 처리하시겠습니까?",
    onYesFn: function() {
      $NC.serviceCall("/LOM7030E/callSP.do", {
        P_QUERY_ID: "LO_FW_SCAN_ORDER_TP",
        P_QUERY_PARAMS: $NC.getParams({
          P_CENTER_CD: a.CENTER_CD,
          P_BU_CD: a.BU_CD,
          P_OUTBOUND_DATE: a.OUTBOUND_DATE,
          P_OUTBOUND_BATCH: a.OUTBOUND_BATCH,
          P_ITEM_CD: a.ITEM_CD,
          P_USER_ID: $NC.G_USERINFO.USER_ID
        })
      }, onBoxCancelExecSucess, onError);
      setFocusScan();
    },
    onNoFn: function() {
      setFocusScan();
    }
  });
}
function onBoxCancelExecSucess(a) {
  var b = $NC.toArray(a);
  if (!$NC.isNull(b)) {
    if (b.O_MSG !== "OK") {
      showMessage(b.O_MSG);
      return;
    }
  }
  alert("취소확인처리 되었습니다.\n\n주문보류/취소관리 화면에서 취소처리하시기 바랍니다.");
  _Inquiry();
}
function setProgressBar(b) {
  if ($NC.isNull(b)) {
    b = 0;
  }
  $NC.G_VAR.SUM_INSPECT_QTY = $NC.G_VAR.SUM_INSPECT_QTY + Number(b);
  var a = $NC.G_VAR.SUM_CONFIRM_QTY + $NC.G_VAR.SUM_INSPECT_QTY;
  var c = $NC.getRoundVal((a / $NC.G_VAR.SUM_ENTRY_QTY) * 100);
}
function showMessage(b, a) {
  if ($NC.isNull(b)) {
    return;
  }
  if ($NC.isNull(a)) {
    a = false;
  }
  if (typeof b == "string") {
    $NC.G_MAIN.showMessage({
      message: b,
      buttons: {
        "확인": function() {
          $NC.G_MAIN.setFocusActiveWindow();
          setFocusScan();
        }
      },
      hideFocus: a
    });
    return;
  }
  if ($NC.isNull(b.buttons) && !$NC.isNull(b.focusSelector)) {
    $NC.G_MAIN.showMessage({
      message: b,
      buttons: {
        "확인": function() {
          $NC.G_MAIN.setFocusActiveWindow();
          $NC.setFocus(b.focusSelector);
        }
      },
      hideFocus: a
    });
    return;
  }
  var c = {};
  if (b.onYesFn) {
    c["예"] = function() {
      $NC.G_MAIN.setFocusActiveWindow();
      b.onYesFn.call(this);
    };
  }
  if (b.onNoFn) {
    c["아니오"] = function() {
      $NC.G_MAIN.setFocusActiveWindow();
      b.onNoFn.call(this);
    };
  }
  $NC.G_MAIN.showMessage({
    message: b.message,
    buttons: c,
    hideFocus: a
  });
}
function onError(a) {
  var b = $NC.getErrorMessage(a);
  switch (b.RESULT_CD) {
  case $NC.G_CONSTS.RESULT_CD_ERROR:
    $NC.G_MAIN.showMessage({
      message: b.RESULT_MSG,
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
    alert(b.RESULT_MSG);
    $NC.G_MAIN.showLoginPopup(1);
    break;
  case $NC.G_CONSTS.RESULT_CD_ERROR_HTML:
    $NC.G_MAIN.showMessage({
      title: "오류",
      message: b.RESULT_MSG,
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