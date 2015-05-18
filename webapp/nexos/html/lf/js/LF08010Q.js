function _Initialize() {
  
  grdMasterInitialize();
  
  $NC.setInitDatePicker("#edtQEnd_Date");
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showBuBrandPopup);
  $("#btnClose").click(onBtnCloseClick);
  
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
      $("#cboQCenter_Cd").val($NC.G_USERINFO.CENTER_CD);
    }
  });
}

function _OnLoaded() {
  
}

function _SetResizeOffset() {
  // 화면 리사이즈 Offset 계산
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

function _OnResize(parent) {
  
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;
  
  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);
  $NC.resizeGrid("#grdMaster", clientWidth, $("#grdMaster").parent().height() - $NC.G_LAYOUT.header);
}

function _OnConditionChange(e, view, val) {
  var id = view.prop("id").substr(4).toUpperCase();
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
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_BU_CD: BU_CD,
        P_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getBuBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBuBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showBuBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBuBrandPopup, onBuBrandPopup);
    }
    return;
  }
  onChangingCondition();
}
function _Inquiry() {
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var END_DATE = $NC.getValue("#edtQEnd_Date");
  if ($NC.isNull(END_DATE)) {
    alert("마감일자를 입력하십시오.");
    $NC.setFocus("#edtQEnd_Date");
    return;
  }
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  var ITEM_NM = $NC.getValue("#edtQItem_Nm");
  $NC.setInitGridVar(G_GRDMASTER);
  $NC.setInitGridData(G_GRDMASTER);
  
  $NC.setGridDisplayRows("#grdMaster", 0, 0);
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_END_DATE: END_DATE,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: ITEM_CD,
    P_ITEM_NM: ITEM_NM
  });

  $NC.serviceCall("/LF08010Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

function _New() {
  
}

function _Save() {
  
}

function _Delete() {
  
}

function _Cancel() {
  
}

function _Print(printIndex, printName) {
  
}

function grdMasterOnGetColumns() {
  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "END_DATE",
    field: "END_DATE",
    name: "마감일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 140,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "브랜드코드",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 120
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
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE",
    field: "ITEM_STATE",
    name: "상품상태",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_DATE",
    field: "STOCK_DATE",
    name: "재고입고일자",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "HOLD_YN",
    field: "HOLD_YN",
    name: "보류여부",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {
  
  var options = {
    frozenColumn: 4
  };
  
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LF08010Q.RS_MASTER",
    sortCol: "",
    gridOptions: options
  });
}

function grdMasterOnAfterScroll(e, args) {
  
  var row = args.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  
  $NC.setGridDisplayRows("#grdMaster", row + 1);
  
}

function onGetMaster(ajaxData) {
  
  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: new Array("ORDER_DATE", "ORDER_NO"),
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onChangingCondition() {
  
  $NC.clearGridData(G_GRDMASTER);
  
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function showUserBuPopup() {
  
  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQBu_Cd", true);
  });
}

function showBuBrandPopup() {
  
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  $NP.showBuBrandPopup({
    P_BU_CD: BU_CD,
    P_BRAND_CD: "%"
  }, onBuBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

function showVendorPopup() {
  
}

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

function onBuBrandPopup(resultInfo) {
  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  onChangingCondition();
  
}

function onBtnCloseClick() {
  var result = confirm("일마감처리를 하시겠습니까?");
  if (!result) {
    return;
  }
  
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var CLOSE_DATE = $NC.getValue("#edtQEnd_Date");
  if ($NC.isNull(CLOSE_DATE)) {
    alert("마감일자를 입력하십시오.");
    $NC.setFocus("#edtQEnd_Date");
    return;
  }

  $NC.serviceCall("/LF08010Q/callSP.do", {
    P_QUERY_ID: "LS_DAYSTOCK_CREATION",
    P_QUERY_PARAMS: $NC.getParams({
      P_CLOSE_DATE: CLOSE_DATE,
      P_CENTER_CD: CENTER_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, function() {
    alert("일마감처리가 완료되었습니다.");
    _Inquiry();
  });
}

function setPolicyValInfo() {
  $NC.G_VAR.policyVal.LI110 = "";
  $NC.G_VAR.policyVal.LI420 = "";
  
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  
  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    $NC.serviceCall("/LF08010Q/callSP.do", {
      P_QUERY_ID: "WF.GET_POLICY_VAL",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_POLICY_CD: POLICY_CD
      })
    }, onGetPolicyVal);
  }
}

function onGetPolicyVal(ajaxData) {
  
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
      $NC.G_VAR.policyVal[resultData.P_POLICY_CD] = resultData.O_POLICY_VAL;
      if (resultData.P_POLICY_CD != "LI420") {
        return;
      }
      var policyVal = resultData.O_POLICY_VAL;
      G_GRDDETAIL.view.setColumns(grdDetailOnGetColumns(policyVal));
    }
  }
}

function setProcessStateInfo() {
  
  $NC.G_VAR.stateFWBW.CONFIRM = "";
  $NC.G_VAR.stateFWBW.CANCEL = "";
  
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  
  $NC.serviceCall("/LF08010Q/callSP.do", {
    P_QUERY_ID: "WF.GET_PROCESS_STATE_FWBW",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_PROCESS_GRP: "LI",
      P_PROCESS_CD: "A"
    })
  }, onGetProcessState);
}

function onGetProcessState(ajaxData) {
  
  var resultData = $NC.toArray(ajaxData);
  
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
      $NC.G_VAR.stateFWBW.CONFIRM = $NC.nullToDefault(resultData.O_STATE_CONFIRM, "");
      $NC.G_VAR.stateFWBW.CANCEL = $NC.nullToDefault(resultData.O_STATE_CANCEL, "");
    }
  }
}
