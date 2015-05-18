/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 체크할 정책 값
    policyVal: {
      LO440: "", // 출고 스캔검수 기본택배사
    },
    CARRIER_CD: "",
    O_SHIP_ID: "",
    O_WB_NO: "",
    O_BOX_NO: "",
    O_OUTBOUND_NO: "",
    O_SHIPPER_NM: "",
  });

  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();

  $NC.G_JWINDOW.set({
    "minWidth": 1050,
    "minHeight": 690
  });

  // 그리드 초기화
  grdMasterInitialize();

  // 사업부 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
  $NC.setInitDatePicker("#dtpQOutbound_Date");

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQCarrier_Cd").click(showCarrierPopup);

  $("#btnInit").click(onBtnInit);
  $("#edtShipScan").css("ime-mode", "disabled");
  $("#edtWbScan").css("ime-mode", "disabled");

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
      setPolicyValInfo();
    }
  });

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "0";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);

}

function _SetResizeOffset() {

  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight - 1;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  var masterViewWidth = Math.max($NC.getTruncVal(clientWidth * 0.35), 500);
  var detailViewWidth = clientWidth - masterViewWidth - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divCenterView", clientWidth, clientHeight);
  $NC.resizeContainer("#divDetailView", detailViewWidth, clientHeight);
  $NC.resizeContainer("#divMasterView", masterViewWidth, clientHeight);

  // Grid 높이 조정
  $NC.resizeGrid("#grdMaster", detailViewWidth, clientHeight - ($NC.G_LAYOUT.header + $NC.G_LAYOUT.border1));
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
  case "SHIPSCAN":

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

      // 대문자로 변환
      scanVal = scanVal.toUpperCase();

      // 팔레트 바코드 스캔
      if (scanLen == 6) {

        onScanOrderNo(scanVal);
        e.stopImmediatePropagation();
        return;
      }

      if (scanLen == 14) {

        onScanOrder(scanVal);
        e.stopImmediatePropagation();
        return;
      } else {
        $NC.setValue("#edtShipScan");
      }
    }
    break;

  case "WBSCAN":

    var scanVal = "";
    var scanLen = 0;

    if (e.keyCode == 13) {

      scanVal = $NC.getValue(view);
      // 입력 값 길이
      scanLen = scanVal.length;

      if (scanLen == 0) {
        e.stopImmediatePropagation();
        return;
      }

      if ($NC.isNull($NC.G_VAR.O_SHIP_ID)) {
        alert("적재 가능한 팔레트번호를 먼저 SCAN하세요. ");
        $NC.setFocus("#edtShipScan");
        $NC.setValue("#edtWbScan");
        return;
      }

      if (scanLen == 12) {
        // 운송장 바코드 스캔
        onScanWb(scanVal);
        e.stopImmediatePropagation();
        return;
      } else {
        $NC.setValue("#edtWbScan");
      }
    }
    break;

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
    setPolicyValInfo();
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
  case "OUTBOUND_DATE":
    $NC.setValueDatePicker(view, val, "출고일자를 정확히 입력하십시오.");
    break;
  }

  // 화면클리어
  onChangingCondition();
}

function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDMASTER);

  $NC.setEnable("#cboQCenter_Cd");
  $NC.setEnable("#edtQBu_Cd");
  $NC.setEnable("#btnQBu_Cd");
  $NC.setEnable("#dtpQOutbound_Date");

  $NC.setValue("#edtShipScan");
  $NC.setValue("#edtWbScan");
  $NC.setValue("#edtShip_Seq");
  $NC.setValue("#edtBox_Qty");

  $NC.G_VAR.O_SHIP_ID = "";
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

  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: OUTBOUND_DATE,
    P_SHIP_ID: $NC.G_VAR.O_SHIP_ID
  });

  // 데이터 조회
  $NC.serviceCall("/LOM8010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onError);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  var rowCount = G_GRDMASTER.data.getLength();

  var searchIndex = $NC.getGridSearchVal(G_GRDMASTER, {
    searchKey: "WB_NO",
    searchVal: $NC.G_VAR.O_WB_NO
  });
  if (searchIndex > -1) {
    alert("중복송장 입니다.");
    $NC.setValue("#edtWbScan");
    $NC.setFocus("#edtWbScan");
    return;
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    BOX_NO: $NC.G_VAR.O_BOX_NO,
    WB_NO: $NC.G_VAR.O_WB_NO,
    OUTBOUND_NO: $NC.G_VAR.O_OUTBOUND_NO,
    SHIPPER_NM: $NC.G_VAR.O_SHIPPER_NM,
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };
  G_GRDMASTER.data.addItem(newRowData);

  $NC.setGridSelectRow(G_GRDMASTER, rowCount);
  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;

  $NC.setValue("#edtWbScan");
  $NC.setValue("#edtBox_Qty", rowCount + 1);

}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  if ($NC.isNull($NC.G_VAR.O_SHIP_ID)) {
    alert("적재 가능한 팔레트번호를 먼저 SCAN하세요.");
    $NC.setFocus("#edtShipScan");
    return;
  }

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd");

  var saveDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    var saveData = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: rowData.OUTBOUND_NO,
      P_CARRIER_CD: CARRIER_CD,
      P_WB_NO: rowData.WB_NO,
      P_SHIP_ID: $NC.G_VAR.O_SHIP_ID,
      P_CRUD: "U"
    };
    saveDS.push(saveData);
  }
  if (saveDS.length > 0) {
    $NC.serviceCall("/LOM8010E/save.do", {
      P_DS_MASTER: $NC.getParams(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onError);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd");

  var saveDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    var saveData = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: rowData.OUTBOUND_NO,
      P_CARRIER_CD: CARRIER_CD,
      P_WB_NO: rowData.WB_NO,
      P_SHIP_ID: $NC.G_VAR.O_SHIP_ID,
      P_CRUD: "D"
    };
    saveDS.push(saveData);
  }

  var result = confirm("팔레트번호를 삭제하시겠습니까?");
  if (result) {
    $NC.serviceCall("/LOM8010E/save.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onDelete, onError);
  }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

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
    id: "BOX_NO",
    field: "BOX_NO",
    name: "NO",
    minWidth: 80,
    maxWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "WB_NO",
    field: "WB_NO",
    name: "송장번호",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 80
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 1,
    rowHeight: 32
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LOM8010E.RS_MASTER",
    sortCol: "WB_NO",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);

}

/**
 * 화면초기화
 */
function onBtnInit(e) {

  if ($(e.target).hasClass("disabled")) {
    return;
  }

  onChangingCondition();

}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {

    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "WB_NO",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }

    $NC.setEnable("#cboQCenter_Cd", false);
    $NC.setEnable("#edtQBu_Cd", false);
    $NC.setEnable("#btnQBu_Cd", false);
    $NC.setEnable("#dtpQOutbound_Date", false);

    $NC.setValue("#edtBox_Qty", G_GRDMASTER.data.getLength());
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
    return;
  }

}

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQBu_Cd", true);
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
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }

  onChangingCondition();
  setPolicyValInfo();
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

/**
 * 정책정보 취득
 */
function setPolicyValInfo() {

  $NC.G_VAR.policyVal.LO440 = "";

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCallAndWait("/LOM8010E/callSP.do", {
      P_QUERY_ID: "WF.GET_POLICY_VAL",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_POLICY_CD: POLICY_CD
      })
    }, onGetPolicyVal, onError);
  }
}

/**
 * 정책정보 취득후 처리
 * 
 * @param ajaxData
 */
function onGetPolicyVal(ajaxData) {

  var resultData = $NC.toArray(ajaxData.data);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
      $NC.G_VAR.policyVal[resultData.P_POLICY_CD] = resultData.O_POLICY_VAL;
    }
    // 출고 스캔검수 기본 택배사 설정
    var O_RESULT_DATA = [ ];
    if (resultData.P_POLICY_CD == "LO440") {
      $NC.G_VAR.CARRIER_CD = resultData.O_POLICY_VAL;
      O_RESULT_DATA = $NP.getCarrierInfo({
        queryParams: {
          P_CARRIER_CD: $NC.G_VAR.CARRIER_CD,
          P_VIEW_DIV: "1"
        }
      });
      onCarrierPopup(O_RESULT_DATA[0]);
    }
  }
}

function onScanOrderNo(scanVal) {

  var processFn = function() {

    // 초기화
    onChangingCondition();

    // SHIP_SEQ 여부체크
    onScanShipNo(scanVal);

    _Inquiry();
  };

  if (G_GRDMASTER.data.getLength() > 0) {
    if (!$NC.isNull($NC.G_VAR.O_SHIP_ID)) {
      showMessage({
        message: "현재 작업 중 입니다.\n\n데이터를 다시 가져오시겠습니까?",
        onYesFn: function() {
          processFn.call(this);
        },
        onNoFn: function() {
        }
      });
    } else {
      processFn.call(this);
    }
    return;
  }

  processFn.call(this);
}

function onScanShipNo(scanVal) {

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

  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }

  // 데이터 조회
  $NC.serviceCallAndWait("/LOM8010E/callSP.do", {
    P_QUERY_ID: "LOM8010E.GET_SHIP_INFO",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_SHIP_ID: null,
      P_SHIP_SEQ: scanVal
    })
  }, onGetShipInfo, onError);

}

function onScanOrder(scanVal) {

  var processFn = function() {

    // 초기화
    onChangingCondition();

    // 바코드 파싱
    var SCAN_CENTER_CD = scanVal.substr(0, 2);

    if (SCAN_CENTER_CD != $NC.getValue("#cboQCenter_Cd")) {
      showMessage("작업중인 물류센터의 전표가 아닙니다.\n\n확인 후 작업하십시오.");
      return;
    }

    // SHIP_ID 여부체크
    onScanShip(scanVal);

    _Inquiry();
  };

  if (G_GRDMASTER.data.getLength() > 0) {
    if (!$NC.isNull($NC.G_VAR.O_SHIP_ID)) {
      showMessage({
        message: "현재 작업 중 입니다.\n\n데이터를 다시 가져오시겠습니까?",
        onYesFn: function() {
          processFn.call(this);
        },
        onNoFn: function() {
        }
      });
    } else {
      processFn.call(this);
    }
    return;
  }

  processFn.call(this);
}

function onScanShip(scanVal) {

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

  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }

  // 데이터 조회
  $NC.serviceCallAndWait("/LOM8010E/callSP.do", {
    P_QUERY_ID: "LOM8010E.GET_SHIP_INFO",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_SHIP_ID: scanVal,
      P_SHIP_SEQ: null
    })
  }, onGetShipInfo, onError);

}

function onGetShipInfo(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if ($NC.isNull(resultData)) {
    return;
  }

  if (resultData.O_MSG !== "OK") {
    showMessage(resultData.O_MSG);
    $NC.setValue("#edtShip_Seq");
    return;
  }

  $NC.G_VAR.O_SHIP_ID = resultData.O_SHIP_ID;
  $NC.setValue("#edtShip_Seq", resultData.O_SHIP_SEQ);
}

function onScanWb(scanVal) {

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

  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }

  var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd");
  if ($NC.isNull(CARRIER_CD)) {
    showMessage({
      message: "운송사를 입력하십시오.",
      focusSelector: "#edtQCarrier_Cd"
    });
    return;
  }

  // 데이터 조회
  $NC.serviceCallAndWait("/LOM8010E/callSP.do", {
    P_QUERY_ID: "LOM8010E.GET_WB_INFO",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_CARRIER_CD: CARRIER_CD,
      P_WB_NO: scanVal
    })
  }, onGetWbInfo, onError);

}

function onGetWbInfo(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if ($NC.isNull(resultData)) {
    return;
  }

  if (resultData.O_MSG !== "OK") {
    showMessage(resultData.O_MSG);
    $NC.setValue("#edtWbScan");
    return;
  }

  $NC.G_VAR.O_WB_NO = resultData.O_WB_NO;
  $NC.G_VAR.O_BOX_NO = resultData.O_BOX_NO;
  $NC.G_VAR.O_OUTBOUND_NO = resultData.O_OUTBOUND_NO;
  $NC.G_VAR.O_SHIPPER_NM = resultData.O_SHIPPER_NM;

  _New();
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
        }
      },
      hideFocus: true
    });
    break;
  default:
    $NC.G_MAIN.setFocusActiveWindow();
  }
}

function onSave(ajaxData) {

  $NC.setEnable("#cboQCenter_Cd");
  $NC.setEnable("#edtQBu_Cd");
  $NC.setEnable("#btnQBu_Cd");
  $NC.setEnable("#dtpQOutbound_Date");

  $NC.G_VAR.O_SHIP_ID = "";
}

function onDelete(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  onChangingCondition();
}
