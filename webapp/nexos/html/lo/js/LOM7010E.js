function _Initialize() {
  $NC.setGlobalVar({
    policyVal: {
      LO420: "",
      LO440: "",
      LO450: ""
    },
    CARRIER_CD: "",
    SCAN_CD: "",
    BARCD_DATA_DIV: "-",
    NEWORDER_CHK: "",
    ORDERCAN_CHK: "",
    ORDERHOLD_CHK: "",
    SUM_ENTRY_QTY: 0,
    SUM_CONFIRM_QTY: 0,
    SUM_INSPECT_QTY: 0,
    ORDER_DIV: "",
    ZONE_CD: "",
    CANCEL_YN: "N",
    INSPECT_YN: "N",
    INSPECT_CHK: false,
    BOX_TYPE: null,
    SCANCOMPLETE: true
  });
  $NC.G_JWINDOW.set({
    minWidth: 1050,
    minHeight: 560
  });
  var a = $NC.G_JWINDOW.get("onFocus");
  $NC.G_JWINDOW.set("onFocus", function() {
    a.call(this, $NC.G_JWINDOW);
    setFocusScan();
  });
  grdMasterInitialize();
  grdSubInitialize();
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
  $NC.setInitDatePicker("#dtpQOutbound_Date");
  $("#divProgressbar").progressbar();
  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQCarrier_Cd").click(showCarrierPopup);
  $("#btnDeliveryChange").click(onBtnDeliveryChange);
  $("#btnBoxSave").click(onBtnBoxSave);
  $("#btnBoxComplete").click(onBtnBoxComplete);
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
  setEnableButton("#btnBoxComplete", false);
  setEnableButton("#btnBoxSave", false);
  setEnableButton("#btnBoxManage", false);
  setEnableButton("#btnFWScanConfirm", false);
  setEnableButton("#btnBWScanConfirm", false);
  setEnableButton("#btnDeliveryChange", false);
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
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "DELIVERY_TYPE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQDelivery_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F"
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
  $NC.G_OFFSET.subConditionHeight = $("#divSubConditionView").outerHeight();
}
function _OnResize(f) {
  var g = f.width() - $NC.G_LAYOUT.border1;
  var c = f.height() - $NC.G_OFFSET.nonClientHeight;
  var e = Math.max($NC.getTruncVal(g * 0.35), 500);
  var d = g - e - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.border1;
  $NC.resizeContainer("#divCenterView", g, c);
  $NC.resizeContainer("#divDetailView", d, c);
  $NC.resizeContainer("#divMasterView", e, c);
  var a = Math.max(Math.min($NC.getTruncVal((c - 500) / 20) * 10, 100), 0);
  var b = $("#edtBox_No");
  if (a != b.data("resizeVal")) {
    b.css({
      height: 70 + a,
      "font-size": 20 + a
    }).data("resizeVal", a);
  }
  a = $NC.G_OFFSET.masterInfoMaxLine;
  if (c < 600) {
    a = Math.min(Math.max($NC.G_OFFSET.masterInfoMaxLine - Math.ceil((600 - c) / 35), $NC.G_OFFSET.masterInfoMinLine),
        $NC.G_OFFSET.masterInfoMaxLine);
  }
  b = $("#tblMasterInfoView");
  if (a != b.data("resizeVal")) {
    b.find("tr:gt(1)").show();
    b.find("tr:gt(" + (a) + ")").hide();
    b.data("resizeVal", a);
    $("#divMasterInfoExpender").hide();
  }
  $NC.resizeGrid("#grdMaster", d, c - ($NC.G_LAYOUT.header + $NC.G_LAYOUT.border1 + $NC.G_OFFSET.subConditionHeight));
}
function _OnInputKeyDown(d, b) {
  var f = b.prop("id").substr(3).toUpperCase();
  switch (f) {
  case "SCAN":
    if (d.keyCode == 9) {
      d.stopImmediatePropagation();
      return;
    }
    var a = "";
    var c = 0;
    if (d.keyCode == 192) {
      a = $NC.getValue(b);
      c = a.length;
      if (isNaN(Number(a) || c.length == 0)) {
        d.stopImmediatePropagation();
        showMessage("검수수량을 정확히 입력하십시오.");
        return;
      }
      onScanFnNumAdd(a);
      onChkFWScanConfirm();
      d.stopImmediatePropagation();
      return;
    }
    if (d.keyCode == 109) {
      a = $NC.getValue(b);
      if (isNaN(Number(a)) || c.length == 0) {
        d.stopImmediatePropagation();
        showMessage("검수수량을 정확히 입력하십시오.");
        return;
      }
      onScanFnNumSubtract(a);
      d.stopImmediatePropagation();
      return;
    }
    if (d.keyCode == 111) {
      a = $NC.getValue(b);
      if (isNaN(Number(a))) {
        d.stopImmediatePropagation();
        showMessage("검수수량을 정확히 입력하십시오.");
        return;
      }
      onScanFnNumDivide(a);
      onChkFWScanConfirm();
      d.stopImmediatePropagation();
      return;
    }
    break;
  }
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
      if (a.substr(0, 2) == "OP" && (a.match(/-/g).length == 4 || a.match(/-/g).length == 3)) {
        onScanhas(a);
        d.stopImmediatePropagation();
        return;
      }
      if (a.length == 12 || a.length == 6) {
        onScanWB_NoYn(a);
        d.stopImmediatePropagation();
        return;
      }
      if (a.length < 4) {
        a = $NC.getValue(b);
        if (isNaN(Number(a))) {
          d.stopImmediatePropagation();
          showMessage("검수수량을 정확히 입력하십시오.");
          return;
        }
        onScanFnNumDivide(a);
        onChkFWScanConfirm();
        d.stopImmediatePropagation();
        return;
      }
      onScanItem(a);
      onChkFWScanConfirm();
      d.stopImmediatePropagation();
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
  $NC.G_VAR.NEWORDER_CHK = "N";
  $NC.G_VAR.ORDERCAN_CHK = "N";
  $NC.G_VAR.ORDERHOLD_CHK = "N";
  $NC.G_VAR.SCANCOMPLETE = true;
  $NC.G_VAR.INSPECT_CHK = false;
  $NC.G_VAR.BOX_TYPE = "";
  $NC.G_VAR.SCAN_CD = "";
  $NC.G_VAR.ZONE_CD = "";
  $NC.setEnable("#cboQCenter_Cd");
  $NC.setEnable("#edtQBu_Cd");
  $NC.setEnable("#btnQBu_Cd");
  $NC.setEnable("#dtpQOutbound_Date");
  $NC.setValue("#edtQOutbound_No");
  $NC.setValue("#edtQPacking_Batch");
  setOrderInfoValue();
  setItemInfoValue();
  $NC.setValue("#edtBox_No");
  $NC.setValue("#divProgressVal", "0 / 0 [ 0 %]");
  $("#divProgressbar").progressbar("value", 0);
  setEnableButton("#btnBoxSave", false);
  setEnableButton("#btnBoxComplete", false);
  setEnableButton("#btnBoxManage", false);
  setEnableButton("#btnFWScanConfirm", false);
  setEnableButton("#btnBWScanConfirm", true);
  setEnableButton("#btnDeliveryChange", false);
  setFocusScan();
}
function _Inquiry() {
  $NC.setInitGridVar(G_GRDMASTER);
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
  var d = $NC.getValue("#edtQPacking_Batch");
  if ($NC.isNull(d)) {
    showMessage("묶음차수를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: c,
    P_BU_CD: b,
    P_OUTBOUND_DATE: a,
    P_OUTBOUND_NO: d,
    P_ZONE_CD: $NC.G_VAR.ZONE_CD
  });
  G_GRDMASTER.queryId = "LOM7010E.RS_MASTER";
  $NC.serviceCall("/LOM7010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onError);
}
function _New() {
}
function _Save(n) {
  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }
  var l = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(l)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }
  var k = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(k)) {
    showMessage({
      message: "사업구분 코드를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }
  var c = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(c)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }
  var a = $NC.getValue("#edtQOutbound_No");
  if ($NC.isNull(a)) {
    showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }
  var m = $NC.getValue("#edtQPacking_Batch");
  if ($NC.isNull(m)) {
    showMessage("묶음차수를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }
  var h = $NC.getValue("#edtBox_No");
  if ($NC.isNull(h)) {
    showMessage("박스번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }
  var g = $NC.getValue("#cboBox_Type");
  var p = [ ];
  var f;
  var e;
  for (var j = 0, o = G_GRDMASTER.data.getLength(); j < o; j++) {
    e = G_GRDMASTER.data.getItem(j);
    if (e.CRUD == "U") {
      f = {
        P_CENTER_CD: e.CENTER_CD,
        P_BU_CD: e.BU_CD,
        P_OUTBOUND_DATE: e.OUTBOUND_DATE,
        P_OUTBOUND_NO: e.OUTBOUND_NO,
        P_BOX_NO: h,
        P_BRAND_CD: e.BRAND_CD,
        P_ITEM_CD: e.ITEM_CD,
        P_ITEM_STATE: e.ITEM_STATE,
        P_ITEM_LOT: e.ITEM_LOT,
        P_CONFIRM_QTY: e.INSPECT_QTY
      };
      p.push(f);
    }
  }
  var d = "N";
  var b;
  switch (n) {
  case "onBoxComplete":
    if (p.length === 0 && $NC.G_VAR.SUM_INSPECT_QTY == 0) {
      showMessage("검수 후 박스완료 처리하십시오.");
      return;
    }
    d = "Y";
    b = onBoxComplete;
    break;
  case "onBoxSave":
    if (p.length === 0) {
      showMessage("검수 후 박스저장 처리하십시오.");
      return;
    }
    b = onBoxSave;
    break;
  case "onShowBoxManage":
    if (p.length === 0) {
      onShowBoxManage();
      return;
    }
    b = onShowBoxManage;
    break;
  default:
    return;
  }
  $NC.serviceCallAndWait("/LOM7010E/save.do", {
    P_DS_MASTER: $NC.getParams({
      P_CENTER_CD: l,
      P_BU_CD: k,
      P_OUTBOUND_DATE: c,
      P_OUTBOUND_NO: a,
      P_PACKING_BATCH: m,
      P_CARRIER_CD: $NC.G_VAR.CARRIER_CD,
      P_BOX_NO: h,
      P_BOX_TYPE: $NC.G_VAR.BOX_TYPE,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }),
    P_DS_DETAIL: $NC.toJson(p),
    P_COMPLETE_YN: d,
    P_CARRIER_CD: $NC.G_VAR.CARRIER_CD
  }, b, onError);
}
function _Delete() {
}
function _Cancel() {
  var a = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: new Array("BRAND_CD", "OUTBOUND_DATE", "ITEM_CD")
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = a;
}
function _Print(a, b) {
}
function grdMasterOnGetColumns() {
  var a = [ ];
  $NC.setGridColumn(a, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 230
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
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "현검수수량",
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
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(a, {
    id: "ITEM_BAR_CD",
    field: "ITEM_BAR_CD",
    name: "상품바코드",
    minWidth: 100
  });
  $NC.setGridColumn(a, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100
  });
  $NC.setGridColumn(a, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 90
  });
  return $NC.setGridColumnDefaultFormatter(a);
}
function grdMasterInitialize() {
  var a = {
    frozenColumn: 3,
    rowHeight: 32,
    specialRow: {
      compareFn: function(b, c) {
        if (c.INSPECT_YN === "Y") {
          return "specialrow3";
        }
        if (c.REMAIN_QTY == 0) {
          return "specialrow4";
        }
      }
    }
  };
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LOM7010E.RS_MASTER",
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
  $NC.G_VAR.BOX_TYPE = "01";
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
  if ($NC.G_VAR.SUM_INSPECT_QTY > 0 && $NC.G_VAR.SCANCOMPLETE) {
    showMessage("박스완료하지 않은 검수내역이 존재합니다.\n\n박스완료 후 검수완료 처리하십시오.");
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
  var f = $NC.getValue("#edtQOutbound_No");
  if ($NC.isNull(f)) {
    showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }
  var h = $NC.getValue("#edtQPacking_Batch");
  if ($NC.isNull(h)) {
    showMessage("묶음차수를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }
  var c = "";
  if ($NC.G_VAR.SUM_ENTRY_QTY > $NC.G_VAR.SUM_CONFIRM_QTY + $NC.G_VAR.SUM_INSPECT_QTY) {
    c = "미검수 상품이 존재합니다.\n\n검수완료 처리하시겠습니까?";
  }
  if (c == "" || c == undefined) {
    $NC.serviceCall("/LOM7010E/callFWScanConfirm.do", {
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: d,
        P_BU_CD: b,
        P_OUTBOUND_DATE: a,
        P_PACKING_BATCH: h,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      })
    }, onFWScanConfirm, onError);
  } else {
    showMessage({
      message: c,
      onYesFn: function() {
        $NC.serviceCall("/LOM7010E/callFWScanConfirm.do", {
          P_QUERY_PARAMS: $NC.getParams({
            P_CENTER_CD: d,
            P_BU_CD: b,
            P_OUTBOUND_DATE: a,
            P_PACKING_BATCH: h,
            P_USER_ID: $NC.G_USERINFO.USER_ID
          })
        }, onFWScanConfirm, onError);
      },
      onNoFn: function() {
        setFocusScan();
      }
    });
  }
}
function onBtnDeliveryChange(c) {
  if ($(c.target).hasClass("disabled")) {
    return;
  }
  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }
  var b = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var a = $NC.getValue("#cboQDelivery_Type");
  if (b.DELIVERY_TYPE == a) {
    alert("동일한 배송유형으로 변경 처리하실 수 없습니다");
    setFocusScan();
    return;
  }
  showMessage({
    message: "배송유형변경 처리하시겠습니까?",
    onYesFn: function() {
      $NC.serviceCall("/LOM7010E/callSP.do", {
        P_QUERY_ID: "LO_FW_DIRECTIONS_INVNO_PROC2",
        P_QUERY_PARAMS: $NC.getParams({
          P_CENTER_CD: b.CENTER_CD,
          P_BU_CD: b.BU_CD,
          P_OUTBOUND_DATE: b.OUTBOUND_DATE,
          P_OUTBOUND_NO: b.OUTBOUND_NO,
          P_WB_NO: b.WB_NO,
          P_DIRECTION_INVNO: a,
          P_USER_ID: $NC.G_USERINFO.USER_ID
        })
      }, onDeliveryChangeSucess, onError);
      setFocusScan();
    },
    onNoFn: function() {
      setFocusScan();
    }
  });
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
  var d = $NC.getValue("#edtQOutbound_No");
  if ($NC.isNull(d)) {
    showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }
  var g = $NC.getValue("#edtQPacking_Batch");
  if ($NC.isNull(g)) {
    showMessage("묶음차수를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }
  showMessage({
    message: "검수취소 처리하시겠습니까?",
    onYesFn: function() {
      $NC.serviceCall("/LOM7010E/callBWScanConfirm.do", {
        P_QUERY_PARAMS: $NC.getParams({
          P_CENTER_CD: c,
          P_BU_CD: b,
          P_OUTBOUND_DATE: a,
          P_OUTBOUND_NO: d,
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
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["BRAND_CD", "OUTBOUND_DATE", "ITEM_CD"],
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
    $NC.setEnable("#cboQCenter_Cd", false);
    $NC.setEnable("#edtQBu_Cd", false);
    $NC.setEnable("#btnQBu_Cd", false);
    $NC.setEnable("#dtpQOutbound_Date", false);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
    onChangingCondition();
    showMessage("존재하지 않는 출고전표입니다. 확인 후 작업하십시오.");
    return;
  }
  var b = G_GRDMASTER.data.getItem(0);
  setOrderInfoValue(b);
  onCalcSummary();
  $NC.G_VAR.INSPECT_YN = b.INSPECT_YN;
  $NC.G_VAR.NEWORDER_CHK = b.ORDER_CHK;
  $NC.G_VAR.ORDERCAN_CHK = b.ORDER_CAN;
  $NC.G_VAR.ORDERHOLD_CHK = b.ORDER_HOLD;
  if ($NC.G_VAR.ORDERCAN_CHK == "Y") {
    if (b.ORDER_DIV == "2") {
      alert("합포장 주문에 주문취소 건이 포함되어있습니다.\n\n 피킹지시서와 상품을 함께 사무실로 인계바랍니다.");
    } else {
      alert("주문취소 건입니다.\n\n 피킹지시서와 상품을 함께 사무실로 인계바랍니다.");
    }
    setEnableButton("#btnBoxSave", false);
    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxManage", false);
    setEnableButton("#btnFWScanConfirm", false);
    setEnableButton("#btnBWScanConfirm", false);
    setEnableButton("#btnDeliveryChange", false);
    $NC.setValue("#edtBox_No", "주문취소");
    $("#edtBox_No").addClass("inspected");
    setUpdateOrderCan(b.CENTER_CD, b.BU_CD, b.OUTBOUND_DATE, b.OUTBOUND_NO);
    return;
  } else {
    if ($NC.G_VAR.ORDERHOLD_CHK == "Y") {
      alert("주문보류 처리된 전표입니다.\n\n [주문보류관리] 화면에서 해당전표를 확인해 주시기 바랍니다.");
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
      if ($NC.G_VAR.INSPECT_YN == "Y") {
        setEnableButton("#btnBoxSave", false);
        setEnableButton("#btnBoxComplete", false);
        setEnableButton("#btnBoxManage", true);
        setEnableButton("#btnFWScanConfirm", false);
        setEnableButton("#btnBWScanConfirm", false);
        setEnableButton("#btnDeliveryChange", true);
        $NC.setValue("#edtBox_No", "검수완료");
        $("#edtBox_No").addClass("inspected");
        return;
      } else {
        if ($NC.G_VAR.NEWORDER_CHK == "Y") {
          alert("합포장대상 전표입니다.\n\n 동일한 수령자의 다른 주문전표를 확인해 주시기 바랍니다.");
          setEnableButton("#btnBoxSave", false);
          setEnableButton("#btnBoxComplete", false);
          setEnableButton("#btnBoxManage", false);
          setEnableButton("#btnFWScanConfirm", false);
          setEnableButton("#btnBWScanConfirm", false);
          setEnableButton("#btnDeliveryChange", false);
          $NC.setValue("#edtBox_No", "합포장대상 ");
          $("#edtBox_No").addClass("inspected");
          return;
        } else {
          $NC.setValue("#edtBox_No", b.BOX_NO);
          $("#edtBox_No").removeClass("inspected");
        }
      }
    }
  }
  setEnableButton("#btnBoxSave", b.BOXING_YN == "N");
  setEnableButton("#btnBoxComplete", true);
  setEnableButton("#btnBoxManage", true);
  setEnableButton("#btnFWScanConfirm", false);
  setEnableButton("#btnBWScanConfirm", false);
  setEnableButton("#btnDeliveryChange", false);
  setFocusScan();
}
function onGetMasterByWb_No(a) {
  $NC.setInitGridData(G_GRDMASTER, a);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["BRAND_CD", "OUTBOUND_DATE", "ITEM_CD"],
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
    var f = G_GRDMASTER.data.getItem(0);
    var b = f.CENTER_CD;
    var e = f.BU_CD;
    var d = f.OUTBOUND_DATE;
    var c = f.OUTBOUND_NO;
    if (b != $NC.getValue("#cboQCenter_Cd")) {
      showMessage("작업중인 물류센터의 전표가 아닙니다.\n\n확인 후 작업하십시오.");
      return;
    }
    $NC.setValue("#edtQBu_Cd", e);
    $NC.setValue("#dtpQOutbound_Date", d);
    $NC.setValue("#edtQOutbound_No", c);
    $NC.setValue("#edtQPacking_Batch", c);
    $NC.setEnable("#cboQCenter_Cd", false);
    $NC.setEnable("#edtQBu_Cd", false);
    $NC.setEnable("#btnQBu_Cd", false);
    $NC.setEnable("#dtpQOutbound_Date", false);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
    onChangingCondition();
    showMessage("현재 스캔검수를 진행한 내역이 없습니다. 확인 후 작업하십시오.");
    return;
  }
  var f = G_GRDMASTER.data.getItem(0);
  setOrderInfoValue(f);
  onCalcSummary();
  $NC.G_VAR.INSPECT_YN = f.INSPECT_YN;
  $NC.G_VAR.NEWORDER_CHK = f.ORDER_CHK;
  $NC.G_VAR.ORDERCAN_CHK = f.ORDER_CAN;
  $NC.G_VAR.ORDERHOLD_CHK = f.ORDER_HOLD;
  if ($NC.G_VAR.ORDERCAN_CHK == "Y") {
    if (f.ORDER_DIV == "2") {
      alert("합포장 주문에 주문취소 건이 포함되어있습니다.\n\n 피킹지시서와 상품을 함께 사무실로 인계바랍니다.");
    } else {
      alert("주문취소 건입니다.\n\n 피킹지시서와 상품을 함께 사무실로 인계바랍니다.");
    }
    setEnableButton("#btnBoxSave", false);
    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxManage", false);
    setEnableButton("#btnFWScanConfirm", false);
    setEnableButton("#btnDeliveryChange", false);
    $NC.setValue("#edtBox_No", "주문취소");
    $("#edtBox_No").addClass("inspected");
    setUpdateOrderCan(f.CENTER_CD, f.BU_CD, f.OUTBOUND_DATE, f.OUTBOUND_NO);
    return;
  } else {
    if ($NC.G_VAR.INSPECT_YN == "Y") {
      setEnableButton("#btnBoxSave", false);
      setEnableButton("#btnBoxComplete", false);
      setEnableButton("#btnBoxManage", true);
      setEnableButton("#btnFWScanConfirm", false);
      setEnableButton("#btnBWScanConfirm", false);
      setEnableButton("#btnDeliveryChange", true);
      $NC.setValue("#edtBox_No", "검수완료");
      $("#edtBox_No").addClass("inspected");
      return;
    } else {
      if ($NC.G_VAR.NEWORDER_CHK == "Y") {
        alert("합포장대상 전표입니다.\n\n 동일한 수령자의 다른 주문전표를 확인해 주시기 바랍니다.");
        setEnableButton("#btnBoxSave", false);
        setEnableButton("#btnBoxComplete", false);
        setEnableButton("#btnBoxManage", false);
        setEnableButton("#btnFWScanConfirm", false);
        setEnableButton("#btnBWScanConfirm", false);
        setEnableButton("#btnFWScanConfirm", true);
        $NC.setValue("#edtBox_No", "합포장대상 ");
        $("#edtBox_No").addClass("inspected");
        return;
      } else {
        if ($NC.G_VAR.ORDERHOLD_CHK == "Y") {
          alert("주문보류 처리된 전표입니다.\n\n [주문보류관리] 화면에서 해당전표를 확인해 주시기 바랍니다.");
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
          $NC.setValue("#edtBox_No", f.BOX_NO);
          $("#edtBox_No").removeClass("inspected");
        }
      }
    }
  }
  setEnableButton("#btnBoxSave", f.BOXING_YN == "N");
  setEnableButton("#btnBoxComplete", true);
  setEnableButton("#btnBoxManage", true);
  setEnableButton("#btnFWScanConfirm", false);
  setEnableButton("#btnBWScanConfirm", false);
  setEnableButton("#btnDeliveryChange", false);
  setFocusScan();
}
function doPrint1() {
  var a = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var b = [ ];
  b.push($NC.getValue("#edtBox_No"));
  if ($NC.G_VAR.CARRIER_CD == "0020") {
    var reportDoc = "lo/LABEL_LOM08";
    var queryId = "WR.RS_LABEL_LOM03";
    var queryParams = {
      P_CENTER_CD: a.CENTER_CD,
      P_BU_CD: a.BU_CD,
      P_OUTBOUND_DATE: a.OUTBOUND_DATE,
      P_OUTBOUND_NO: a.OUTBOUND_NO,
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
    });
    /*$NC.G_MAIN.silentPrint({
      printParams: [{
        reportDoc: "lo/LABEL_LOM08",
        queryId: "WR.RS_LABEL_LOM03",
        queryParams: {
          P_CENTER_CD: a.CENTER_CD,
          P_BU_CD: a.BU_CD,
          P_OUTBOUND_DATE: a.OUTBOUND_DATE,
          P_OUTBOUND_NO: a.OUTBOUND_NO,
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
    });*/
  } else {
    var reportDoc = "lo/LABEL_LOM08";
    var queryId = "WR.RS_LABEL_LOM02";
    var queryParams = {
      P_CENTER_CD: a.CENTER_CD,
      P_BU_CD: a.BU_CD,
      P_OUTBOUND_DATE: a.OUTBOUND_DATE,
      P_OUTBOUND_NO: a.OUTBOUND_NO,
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
    });

    /*$NC.G_MAIN.silentPrint({
      printParams: [{
        reportDoc: "lo/LABEL_LOM08",
        queryId: "WR.RS_LABEL_LOM02",
        queryParams: {
          P_CENTER_CD: a.CENTER_CD,
          P_BU_CD: a.BU_CD,
          P_OUTBOUND_DATE: a.OUTBOUND_DATE,
          P_OUTBOUND_NO: a.OUTBOUND_NO,
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
    });*/
  }
}
function onShowBoxManage(a) {
  if (!$NC.isNull(a)) {
    var d = $NC.toArray(a);
    if (d.O_MSG !== "OK") {
      showMessage(d.O_MSG);
      return;
    }
  }
  var e = $NC.getValue("#cboQCenter_Cd");
  var c = $NC.getValue("#edtQBu_Cd");
  var b = $NC.getValue("#dtpQOutbound_Date");
  var f = $NC.getValue("#edtQOutbound_No");
  var g = $NC.getValue("#edtQPacking_Batch");
  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LOM7011P",
    PROGRAM_NM: "박스통합",
    url: "lo/LOM7011P.html",
    width: 870,
    height: 450,
    userData: {
      P_CENTER_CD: e,
      P_BU_CD: c,
      P_OUTBOUND_DATE: b,
      P_OUTBOUND_NO: f,
      P_PACKING_BATCH: g,
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
        selectKey: new Array("BRAND_CD", "OUTBOUND_DATE", "ITEM_CD")
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
  if ($NC.G_VAR.INSPECT_CHK) {
    onBtnFWScanConfirm();
  } else {
    doPrint1();
    _Cancel();
  }
}
function onFWScanConfirm(a) {
  var b = $NC.toArray(a);
  if (!$NC.isNull(b)) {
    if (b.O_MSG !== "OK") {
      showMessage(b.O_MSG);
      return;
    }
  }
  doPrint1();
  _Inquiry();
}
function onBWScanConfirm(a) {
  var b = $NC.toArray(a);
  if (!$NC.isNull(b)) {
    if (b.O_MSG !== "OK") {
      showMessage(b.O_MSG);
      return;
    }
  }
  _Inquiry();
}
function onDeliveryChangeSucess(a) {
  var b = $NC.toArray(a);
  if (!$NC.isNull(b)) {
    if (b.O_MSG !== "OK") {
      showMessage(b.O_MSG);
      return;
    }
  }
  _Inquiry();
}
function onChkFWScanConfirm() {
  if (!onValidateScan(true)) {
    return;
  }
  if ($NC.G_VAR.SUM_ENTRY_QTY === $NC.G_VAR.SUM_CONFIRM_QTY + $NC.G_VAR.SUM_INSPECT_QTY) {
    $NC.G_VAR.SCANCOMPLETE = false;
    $NC.G_VAR.INSPECT_CHK = true;
    if (!$NC.isNull($NC.G_USERINFO.PRINT_WB_NO) && !$NC.isNull($NC.G_USERINFO.PRINT_LO_BILL)
        && !$NC.isNull($NC.G_USERINFO.PRINT_CARD)) {
      onBtnBoxComplete();
    } else {
      alert("설정하신 프린터가 없습니다.\n\n자동출력프린터를 먼저 등록하십시오.");
      return;
    }
    return;
  }
  $NC.G_VAR.SCANCOMPLETE = true;
  $NC.G_VAR.INSPECT_CHK = false;
  setFocusScan();
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
    $NC.serviceCallAndWait("/LOM7010E/callSP.do", {
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
function onScanhas(a) {
  var b = function() {
    onChangingCondition();
    var c = a.substr(2).split($NC.G_VAR.BARCD_DATA_DIV);
    var d = a;
    $NC.G_VAR.SCAN_CD = a;
//    $NC.serviceCall("/LOM9070E/callWbProc.do", {
//      P_QUERY_ID: "LO_HAS_SCAN_CHK",
//      P_QUERY_PARAMS: $NC.getParams({
//        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
//        P_HAS_DATE: $NC.G_USERINFO.LOGIN_DATE,
//        P_WB_NO: d,
//        P_USER_ID: $NC.G_USERINFO.USER_ID
//      })
//    }, onExecSP, onSaveError);
    onScanOrder($NC.G_VAR.SCAN_CD);
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
function onScanOrder(a) {
  var b = function() {
    onChangingCondition();
    var e = a.substr(2).split($NC.G_VAR.BARCD_DATA_DIV);
    var c = e[0];
    var g = e[1];
    var f = $NC.getDate(e[2]);
    var d = e[3];
    if (!$NC.isNull(e[4])) {
      $NC.G_VAR.ZONE_CD = e[4];
    } else {
      $NC.G_VAR.ZONE_CD = "";
    }
    $NC.setValue("#cboQCenter_Cd", c);
    $NC.setValue("#edtQBu_Cd", g);
    $NC.setValue("#dtpQOutbound_Date", f);
    $NC.setValue("#edtQPacking_Batch", d);
    _Inquiry();
  };
  b.call(this);
}
function onScanWB_NoYn(a) {
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
  $NC.serviceCallAndWait("/LOM7010E/callSP.do", {
    P_QUERY_ID: "LOM7010E.GET_WB_NO_YN",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: d,
      P_BU_CD: c,
      P_OUTBOUND_DATE: b,
      P_WB_NO: a
    })
  }, onGetScanWB_NoYn);
}
function onGetScanWB_NoYn(a) {
  var b = $NC.toArray(a);
  if ($NC.isNull(b)) {
    return;
  }
  if (b.O_MSG !== "OK") {
    showMessage(b.O_MSG);
    return;
  }
  if (b.O_WB_NO_YN == "Y") {
    onScanOrderByWB_No(b.P_WB_NO);
    return;
  } else {
    if (G_GRDMASTER.data.getLength() > 0) {
      onScanItem(b.P_WB_NO);
      onChkFWScanConfirm();
      return;
    }
  }
  setFocusScan();
}
function onScanOrderByWB_No(a) {
  var b = function() {
    onChangingCondition();
    var e = $NC.getValue("#cboQCenter_Cd");
    if ($NC.isNull(e)) {
      showMessage({
        message: "물류센터를 선택하십시오.",
        focusSelector: "#cboQCenter_Cd"
      });
      return;
    }
    var d = $NC.getValue("#edtQBu_Cd");
    if ($NC.isNull(d)) {
      showMessage({
        message: "사업구분 코드를 입력하십시오.",
        focusSelector: "#edtQBu_Cd"
      });
      return;
    }
    var c = $NC.getValue("#dtpQOutbound_Date");
    if ($NC.isNull(c)) {
      showMessage({
        message: "출고일자를 입력하십시오.",
        focusSelector: "#dtpQOutbound_Date"
      });
      return;
    }
    G_GRDMASTER.queryParams = $NC.getParams({
      P_CENTER_CD: e,
      P_BU_CD: d,
      P_OUTBOUND_DATE: c,
      P_WB_NO: a
    });
    G_GRDMASTER.queryId = "LOM7010E.RS_MASTER1";
    $NC.serviceCall("/LOM7010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMasterByWb_No, onError);
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
  var e = $NC.getValue("#edtQOutbound_No");
  if ($NC.isNull(e)) {
    showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }
  $NC.serviceCallAndWait("/LOM7010E/callSP.do", {
    P_QUERY_ID: "LOM7010E.GET_ITEM_INFO",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: d,
      P_BU_CD: c,
      P_OUTBOUND_DATE: b,
      P_OUTBOUND_NO: e,
      P_ITEM_BAR_CD: a
    })
  }, onGetItemInfo, onError);
}
function onScanBoxType(a) {
  if (!onValidateScan(false)) {
    return;
  }
  var b = a;
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "",
      P_CODE_CD: "%",
      P_SUB_CD1: b,
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboBox_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      var c = $NC.getValue("#cboBox_Type");
      if (c == "") {
        alert("존재하지 않는 BOX코드 입니다.");
        return;
      }
    }
  });
}
function onScanFnButton(a) {
}
function onScanFnNumAdd(a) {
  if (!onValidateScan(true)) {
    return;
  }
  var f = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
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
  $NC.setValue("#edtInspect_Qty", f.INSPECT_QTY);
  if (f.CRUD === "R") {
    f.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(f.id, f);
  G_GRDMASTER.lastRowModified = true;
  setEnableButton("#btnBoxSave", true);
  setProgressBar(d);
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
  $NC.setValue("#edtInspect_Qty", f.INSPECT_QTY);
  if (f.CRUD === "R") {
    f.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(f.id, f);
  G_GRDMASTER.lastRowModified = true;
  setEnableButton("#btnBoxSave", true);
  setProgressBar(d * -1);
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
  $NC.setValue("#edtInspect_Qty", g.INSPECT_QTY);
  if (g.CRUD === "R") {
    g.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(g.id, g);
  G_GRDMASTER.lastRowModified = true;
  setEnableButton("#btnBoxSave", true);
  setProgressBar(g.INSPECT_QTY - h);
  setFocusScan();
}
function onValidateScan(a) {
  if (G_GRDMASTER.data.getLength() == 0) {
    showMessage("현재 검수 중이 아닙니다.\n\n전표를 먼저 스캔하십시오.");
    return false;
  }
  if ($NC.G_VAR.INSPECT_YN == "Y") {
    showMessage("검수완료 처리된 전표입니다. 수정할 수 없습니다.");
    return false;
  }
  if ($NC.G_VAR.NEWORDER_CHK == "Y") {
    showMessage("합포장 대상 전표입니다. 수정할 수 없습니다.");
    return false;
  }
  if ($NC.G_VAR.ORDERCAN_CHK == "Y") {
    showMessage("주문취소 처리된 전표입니다. 수정할 수 없습니다.");
    return false;
  }
  if ($NC.G_VAR.ORDERHOLD_CHK == "Y") {
    showMessage("주문보류 처리된 전표입니다. 수정할 수 없습니다.");
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
  if (G_GRDMASTER.data.getLength() == 0) {
    $NC.G_VAR.SUM_ENTRY_QTY = 0;
    $NC.G_VAR.SUM_CONFIRM_QTY = 0;
    $NC.G_VAR.SUM_INSPECT_QTY = 0;
    $NC.setValue("#divProgressVal", "0 / 0 [ 0 %]");
    $("#divProgressbar").progressbar("value", 0);
  } else {
    var b = $NC.getGridSumVal(G_GRDMASTER, {
      sumKey: ["ENTRY_QTY", "CONFIRM_QTY", "INSPECT_QTY"]
    });
    $NC.G_VAR.SUM_ENTRY_QTY = b.ENTRY_QTY;
    $NC.G_VAR.SUM_INSPECT_QTY = b.INSPECT_QTY;
    $NC.G_VAR.SUM_CONFIRM_QTY = b.CONFIRM_QTY;
    var a = b.CONFIRM_QTY + b.INSPECT_QTY;
    var c = $NC.getRoundVal((a / b.ENTRY_QTY) * 100);
    $NC.setValue("#divProgressVal", a + " / " + b.ENTRY_QTY + " [ " + c + "%]");
    $("#divProgressbar").progressbar("value", c);
  }
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
      if (c.REMAIN_QTY > "0") {
        if (c.ITEM_CD === j || c.ITEM_BAR_CD === j || c.BOX_BAR_CD === j || c.CASE_BAR_CD === j) {
          h = d;
          break;
        }
      }
    }
  }
  if (h == -1) {
    showMessage("검수가 완료되었거나 전표에 존재하지 않는 상품입니다. \n\n다른 상품을 스캔하십시오.");
    return false;
  }
  $NC.setGridSelectRow(G_GRDMASTER, h);
  c = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (!$NC.isNull(a)) {
    c[a] = j;
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
  $NC.setValue("#edtInspect_Qty", c.INSPECT_QTY);
  if (c.CRUD === "R") {
    c.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(c.id, c);
  G_GRDMASTER.lastRowModified = true;
  setEnableButton("#btnBoxSave", true);
  setProgressBar(e);
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
function setUpdateOrderCan(c, a, b, d) {
  $NC.serviceCallAndWait("/LOM7010E/callSP.do", {
    P_QUERY_ID: "LOM7010E.SET_ERLOSTATUS_INFO",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: c,
      P_BU_CD: a,
      P_OUTBOUND_DATE: b,
      P_OUTBOUND_NO: d
    })
  }, onGetUpdateOrderCan, onError);
}
function onGetUpdateOrderCan(a) {
  var b = $NC.toArray(a.data);
  if (!$NC.isNull(b)) {
    if (b.O_MSG === "OK") {
    }
  }
}
function setItemInfoValue(a) {
  if ($NC.isNull(a)) {
    a = {};
  }
  $NC.setValue("#edtItem_Cd", a.ITEM_CD);
  $NC.setValue("#edtItem_Nm", a.ITEM_NM);
  $NC.setValue("#edtItem_Spec", a.ITEM_SPEC);
  $NC.setValue("#edtQty_In_Box", a.QTY_IN_BOX);
  $NC.setValue("#edtEntry_Qty", a.ENTRY_QTY);
  $NC.setValue("#edtConfirm_Qty", a.CONFIRM_QTY);
  $NC.setValue("#edtInspect_Qty", a.INSPECT_QTY);
  $NC.setValue("#edtOutbound_No", a.OUTBOUND_NO);
  $NC.setValue("#edtQOutbound_No", a.OUTBOUND_NO);
  $NC.setValue("#edtBu_No", a.BU_NO);
  if (a.DELIVERY_TYPE == "1") {
    $NC.G_VAR.CARRIER_CD = "0020";
  } else {
    $NC.G_VAR.CARRIER_CD = "0010";
  }
}
function setOrderInfoValue(a) {
  if ($NC.isNull(a)) {
    a = {};
  }
  $NC.setValue("#edtOrderer_Nm", a.ORDERER_NM);
  $NC.setValue("#chkGift_Wrap_Yn", a.GIFT_WRAP_YN);
  $NC.setValue("#edtCard_From", a.BU_KEY);
  $NC.setValue("#edtCard_To", a.CARD_TO);
  $NC.setValue("#edtCard_Msg", a.CARD_MSG);
  $NC.setValue("#edtOrderer_Msg", a.ORDERER_MSG);
  $NC.setValue("#edtPacking_Batch", a.PACKING_BATCH);
  $NC.setValue("#edtDelivery_Type", a.DELIVERY_TYPE_D);
  $NC.setValue("#edtShip_Type", a.SHIP_TYPE_D);
  $NC.setValue("#edtQPacking_Batch", a.PACKING_BATCH);
  $NC.setValue("#edtRemark1", a.REMARK1);
  if (a.SHIP_TYPE !== "1" && !$NC.isNull(a.SHIP_TYPE) && a.INSPECT_YN == "N") {
    alert("[" + a.SHIP_TYPE_D + "] 상품입니다.\n\n 포장 후 사무실로 전달바랍니다.");
    setFocusScan();
  }
}
function setProgressBar(b) {
  if ($NC.isNull(b)) {
    b = 0;
  }
  $NC.G_VAR.SUM_INSPECT_QTY = $NC.G_VAR.SUM_INSPECT_QTY + Number(b);
  var a = $NC.G_VAR.SUM_CONFIRM_QTY + $NC.G_VAR.SUM_INSPECT_QTY;
  var c = $NC.getRoundVal((a / $NC.G_VAR.SUM_ENTRY_QTY) * 100);
  $NC.setValue("#divProgressVal", a + " / " + $NC.G_VAR.SUM_ENTRY_QTY + " [ " + c + "%]");
  $("#divProgressbar").progressbar("value", c);
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
  _Inquiry();
}
function grdSubOnGetColumns() {
  var a = [ ];
  $NC.setGridColumn(a, {
    id: "HAS_NO",
    field: "HAS_NO",
    name: "HAS처리번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(a, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "HAS처리순번",
    minWidth: 40,
    cssClass: "align-center"
  });
  $NC.setGridColumn(a, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    minWidth: 140
  });
  $NC.setGridColumn(a, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 80
  });
  $NC.setGridColumn(a, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 80
  });
  $NC.setGridColumn(a, {
    id: "SHIPPER_TEL",
    field: "SHIPPER_TEL",
    name: "전화번호",
    minWidth: 150
  });
  $NC.setGridColumn(a, {
    id: "SHIPPER_HP",
    field: "SHIPPER_HP",
    name: "휴대폰번호",
    minWidth: 150
  });
  $NC.setGridColumn(a, {
    id: "SHIPPER_ZIP_CD",
    field: "SHIPPER_ZIP_CD",
    name: "수령자우편호",
    minWidth: 110,
    cssClass: "align-center"
  });
  $NC.setGridColumn(a, {
    id: "SHIPPER_ADDR_BASIC",
    field: "SHIPPER_ADDR_BASIC",
    name: "수령자주소",
    minWidth: 160
  });
  $NC.setGridColumn(a, {
    id: "SHIPPER_ADDR_DETAIL",
    field: "SHIPPER_ADDR_DETAIL",
    name: "수령자상세주소",
    minWidth: 160
  });
  $NC.setGridColumn(a, {
    id: "ZONE_CD",
    field: "ZONE_CD",
    name: "존코드",
    minWidth: 40,
    cssClass: "align-center"
  });
  $NC.setGridColumn(a, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "LOC",
    minWidth: 90
  });
  $NC.setGridColumn(a, {
    id: "END_YN",
    field: "END_YN",
    name: "처리여부",
    minWidth: 80,
    cssClass: "align-center"
  });
  return $NC.setGridColumnDefaultFormatter(a);
}
function grdSubInitialize() {
  var a = {
    frozenColumn: 4,
    rowHeight: 32,
    specialRow: {
      compareKey: "END_YN",
      compareVal: "Y",
      compareOperator: "==",
      cssClass: "specialrow1"
    }
  };
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: "LOM7010E.RS_SUB",
    gridOptions: a
  });
  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
}
function grdSubOnAfterScroll(b, a) {
  var c = a.rows[0];
  if (G_GRDSUB.lastRow != null) {
    if (c == G_GRDSUB.lastRow) {
      b.stopImmediatePropagation();
      return;
    }
  }
  setItemInfoValue(G_GRDSUB.data.getItem(c));
  $NC.setGridDisplayRows("#grdSub", c + 1);
}
function onExecSP(b) {
  var d = $NC.toArray(b);
  var c = d.RESULT_DATA;
  var a = c.substr(0, 1);
  if (a == 2) {
    onScanOrder($NC.G_VAR.SCAN_CD);
    onChangingCondition();
    return;
  } else {
    if (a == 3) {
      onScanOrder($NC.G_VAR.SCAN_CD);
      onChangingCondition();
      return;
    } else {
      if (a == 4) {
        onScanOrder($NC.G_VAR.SCAN_CD);
        onChangingCondition();
        return;
      } else {
        if (a == "O") {
          onScanOrder($NC.G_VAR.SCAN_CD);
          return;
        } else {
          if (a == 1) {
            $NC.setValue("#edtBox_No", "합포장대상");
            if (!$NC.isNull(a)) {
              if (a !== "1" && a !== "2" && a !== "3") {
                onChangingCondition();
                alert(d.RESULT_DATA);
                return;
              }
            }
            _Inquiry1();
          }
        }
      }
    }
  }
}
function _Inquiry1() {
  var b = $NC.getValue("#cboQCenter_Cd");
  var a = $NC.G_USERINFO.LOGIN_DATE;
  $NC.setInitGridVar(G_GRDMASTER);
  $NC.setInitGridVar(G_GRDSUB);
  G_GRDSUB.queryParams = $NC.getParams({
    P_CENTER_CD: b,
    P_HAS_DATE: a,
    P_WB_NO: $NC.G_VAR.SCAN_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });
  $NC.serviceCall("/LOM7010E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
}
function onGetSub(a) {
  $NC.setInitGridData(G_GRDSUB, a);
  if (G_GRDSUB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDSUB.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSUB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSUB, {
        selectKey: ["ORDERER_NM", "WB_NO"],
        selectVal: G_GRDSUB.lastKeyVal
      });
    }
    doPrint2();
  } else {
    $NC.setGridDisplayRows("#grdSub", 0, 0);
    $NC.setValue("#edtBox_No", "");
  }
  $NC.G_VAR.buttons._inquiry = "0";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  setFocusScan();
}
function doPrint2() {
  var a = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
  var reportDoc = "lo/LABEL_LOM12";
  var queryId = "WR.RS_LABEL_LOM12";
  var queryParams = {
    P_CENTER_CD: a.CENTER_CD,
    P_BU_CD: a.BU_CD,
    P_HAS_DATE: a.HAS_DATE,
    P_HAS_NO: a.HAS_NO,
    P_LINE_NO: a.LINE_NO
  };

  // 출력 호출
  $NC.G_MAIN.showPrintPreview({
    reportDoc: reportDoc,
    queryId: queryId,
    queryParams: queryParams,
    iFrameNo: 1,
    silentPrinterName: $NC.G_USERINFO.PRINT_WB_NO
  });
  /*$NC.G_MAIN.silentPrint({
    printParams: [{
      reportDoc: "lo/LABEL_LOM12",
      queryId: "WR.RS_LABEL_LOM12",
      queryParams: {
        P_CENTER_CD: a.CENTER_CD,
        P_BU_CD: a.BU_CD,
        P_HAS_DATE: a.HAS_DATE,
        P_HAS_NO: a.HAS_NO,
        P_LINE_NO: a.LINE_NO
      },
      iFrameNo: 1,
      silentPrinterName: $NC.G_USERINFO.PRINT_WB_NO
    }],
    onAfterPrint: function() {
      setFocusScan();
    }
  });*/
}
function onSaveError(a) {
  $NC.onError(a);
  setFocusScan();
}