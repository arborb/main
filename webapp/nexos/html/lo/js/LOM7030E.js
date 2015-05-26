/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 체크할 정책 값
    policyVal: {
      LO420: "", // 출고 스캔검수 검수수량 입력 허용 기준
      LO440: "", // 출고 스캔검수 기본택배사
      LO450: "", // 송장 공급자 표시 기준
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
    lastProductCode: null,
    LAST_SCAN_TOTAL: null,
    LAST_SCAN_PICKING: null,
    LAST_SCAN_BOX: null,
    LAST_SCAN_PRODUCT: null,
    LAST_SCAN_QUANTITY: null,
    PICK_SEQ: null,
    SCANCOMPLETE: true, // 자동으로 박스완료처리
  });

  $NC.G_CONSTS.SCAN_TOTAL    = 0;  //0. 토탈피킹
  $NC.G_CONSTS.SCAN_PICKING  = 1;  //1. 피킹라벨
  $NC.G_CONSTS.SCAN_BOX      = 2;  //2. 용기번호
  $NC.G_CONSTS.SCAN_PRODUCT  = 3;  //3. 상품코드
  $NC.G_CONSTS.SCAN_QUANTITY = 4;  //4. 수량입력
  $NC.G_CONSTS.SCAN_ERROR    = 5;  //5. 오류

  // 추가 조회조건 사용
  // $NC.setInitAdditionalCondition();

  $NC.G_JWINDOW.set({
    "minWidth": 1050,
    "minHeight": 550
  });
  var oldOnFocus = $NC.G_JWINDOW.get("onFocus");
  $NC.G_JWINDOW.set("onFocus", function() {
    oldOnFocus.call(this, $NC.G_JWINDOW);
    setFocusScan();
  });

  // 그리드 초기화
  grdMasterInitialize();

  // 사업구분 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $NC.setInitDatePicker("#dtpQOutbound_Date");
//  $("#divProgressbar").progressbar();

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQCarrier_Cd").click(showCarrierPopup);

  // $("#btnBoxSave").click(onBtnBoxSave);
//  $("#btnBoxComplete").click(onBtnBoxComplete);
  $("#btnBoxManage").click(onBtnBoxManage);
//  $("#btnBoxCancel").click(onBtnBoxCancelExec);
  /*
  $("#btnFWScanConfirm").click(function() {
    onBtnBoxComplete();
    onBtnFWScanConfirm();
  });
  */
  $("#btnBWScanConfirm").click(onBtnBWScanConfirm);
  $("#btnInit").click(onBtnInit);
  $("#edtScan").css("ime-mode", "disabled");
  $("#divMasterView,#divGridBox,#divBottomView").mousedown(function(e) {
    e.stopImmediatePropagation();
    e.preventDefault();

    setTimeout(function() {
      setFocusScan();
    }, 100);
  });

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

//  setEnableButton("#btnBoxComplete", false);
//  setEnableButton("#btnBoxSave", false);
  setEnableButton("#btnBoxManage", false);
//  setEnableButton("#btnBoxCancel", false);
//  setEnableButton("#btnFWScanConfirm", false);
//  setEnableButton("#btnBWScanConfirm", false);

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
/*
  // 조회조건 - 박스유형 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "BOX_TYPE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboBox_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
  });
*/
  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "0";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);

  // 최대화
  $NC.G_JWINDOW.maximise(function() {
    setFocusScan();
  });

  // _OnResize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {
  // _OnResize();
}

function _SetResizeOffset() {

  $NC.G_OFFSET.masterInfoMinLine = 2;
  $NC.G_OFFSET.masterInfoMaxLine = 4;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $("#divBottomView").outerHeight(true)
      + $NC.G_LAYOUT.nonClientHeight - 1;
//  $NC.G_OFFSET.subConditionHeight = $("#divSubConditionView").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  var masterViewWidth = Math.max($NC.getTruncVal(clientWidth * 0.35), 800);
  var detailViewWidth = clientWidth - masterViewWidth - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divCenterView", clientWidth, clientHeight);
  $NC.resizeContainer("#divDetailView", detailViewWidth, clientHeight);
  $NC.resizeContainer("#divMasterView", masterViewWidth, clientHeight);

  // 박스번호 사이즈를 적당히 조정
  var resizeVal = Math.max(Math.min($NC.getTruncVal((clientHeight - 700) / 20) * 10, 100), 0);
  var resizeView = $("#edtBox_No");
  if (resizeVal != resizeView.data("resizeVal")) {
    resizeView.css({
      "height": 46 + resizeVal,
      "font-size": 20 + resizeVal
    }).data("resizeVal", resizeVal);
  }
  // 마스터 정보 표시 라인수 계산, 현재 Max: 6, Min: 2
  resizeVal = $NC.G_OFFSET.masterInfoMaxLine;
  if (clientHeight < 700) {
    resizeVal = Math.min(Math.max($NC.G_OFFSET.masterInfoMaxLine - Math.ceil((700 - clientHeight) / 35),
        $NC.G_OFFSET.masterInfoMinLine), $NC.G_OFFSET.masterInfoMaxLine);
  }
  resizeView = $("#tblMasterInfoView");
  if (resizeVal != resizeView.data("resizeVal")) {
    resizeView.find("tr:gt(1)").show();
    resizeView.find("tr:gt(" + (resizeVal) + ")").hide();
    resizeView.data("resizeVal", resizeVal);

    $("#divMasterInfoExpender").hide();
    // if (resizeVal < 4) {
    // $("#divMasterInfoExpender").show();
    // } else {
    // $("#divMasterInfoExpender").hide();
    // }
  }

  // Grid 높이 조정
  $NC.resizeGrid("#grdMaster", detailViewWidth, clientHeight
      - ($NC.G_LAYOUT.header + $NC.G_LAYOUT.border1));
//  - ($NC.G_LAYOUT.header + $NC.G_LAYOUT.border1 + $NC.G_OFFSET.subConditionHeight));
}

/**
 * Key Down Event
 * 
 * @param e
 * @param view
 */
function _OnInputKeyDown(e, view) {
}
/**
 * Key Up Event
 * 
 * @param e
 * @param view
 * 0. 토탈피킹   : $NC.G_CONSTS.SCAN_TOTAL
 * 1. 피킹라벨   : $NC.G_CONSTS.SCAN_PICKING
 * 2. 용기번호   : $NC.G_CONSTS.SCAN_BOX
 * 3. 상품코드   : $NC.G_CONSTS.SCAN_PRODUCT
 * 4. 수량입력   : $NC.G_CONSTS.SCAN_QUANTITY
 * 5. 오류      : $NC.G_CONSTS.SCAN_ERROR
 */
function _OnInputKeyUp(e, view) {
  if (e.keyCode == 13) {
    var id = view.prop("id").substr(3).toUpperCase();
    if (id === 'SCAN') {
      var scanVal = $NC.getValue(view).toUpperCase()
        ,scanType = scanValueType(scanVal)

      if (scanType == $NC.G_CONSTS.SCAN_TOTAL) {
        //onScanOrder(scanVal, scanType);
        e.stopImmediatePropagation();
        return false;
      }
      if (scanType == $NC.G_CONSTS.SCAN_PICKING) {
        onScanOrder(scanVal, scanType);
        e.stopImmediatePropagation();
        return false;
      }
      if (scanType == $NC.G_CONSTS.SCAN_QUANTITY) {
        onChkFWScanConfirm();
        e.stopImmediatePropagation();
        return;
      }
      if (scanType == $NC.G_CONSTS.SCAN_PRODUCT) {
        onScanItem(scanVal);
        e.stopImmediatePropagation();
        return;
      }
    }
  }
}

/**
 * 스캔라벨 타입을 리턴한다.
 */
function scanValueType(scanVal) {
  var scanArr = scanVal.split('-')
  if (scanVal.substr(0, 2) === 'TP' && scanArr.length == 5) {
    $NC.G_VAR.LAST_SCAN_TOTAL = scanVal;
    $NC.G_VAR.PICK_SEQ = scanArr[scanArr.length-1];
    return $NC.G_CONSTS.SCAN_TOTAL; // 0
  }
  if (scanVal.substr(0, 2) === 'OP' && scanArr.length == 4) {
    $NC.G_VAR.LAST_SCAN_PICKING = scanVal;
    $NC.G_VAR.PICK_SEQ = scanArr[scanArr.length-1];
    return $NC.G_CONSTS.SCAN_PICKING; // 1
  }
  if (isNaN(Number(scanVal)) && scanVal.length === 6 ||
      isNaN(Number(scanVal)) && scanVal.length === 7
    ) {
      return $NC.G_CONSTS.SCAN_BOX; // 2
  }
  if (scanVal.length >= 7) {
    return $NC.G_CONSTS.SCAN_PRODUCT; // 3
  }
  if (Number(scanVal) && scanVal.length < 7) {
    return $NC.G_CONSTS.SCAN_QUANTITY; // 3
  }
  return $NC.G_CONSTS.SCAN_ERROR; // 5
}

/**
 * 조회조건 Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();
  // 사업구분 Key 입력
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
  $NC.setValue("#edtQHas_Qty", 0);
  $NC.setValue("#cboQOutbound_Batch");

  setOrderInfoValue();
  setItemInfoValue();

  $NC.setValue("#edtBox_No");

//  $NC.setValue("#divProgressVal", "0 / 0 [ 0 %]");
//  $("#divProgressbar").progressbar("value", 0);

  // setEnableButton("#btnBoxSave", false);
//  setEnableButton("#btnBoxComplete", false);
   setEnableButton("#btnBoxManage", false);
//   setEnableButton("#btnBoxCancel", false);
//  setEnableButton("#btnFWScanConfirm", false);
//  setEnableButton("#btnBWScanConfirm", false);

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
      message: "사업구분 코드를 입력하십시오.",
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
  
  var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch");
  if ($NC.isNull(OUTBOUND_BATCH)) {
    showMessage("단품주문건이 해당하는 출고차수가 없습니다.");
    return;
  }

  var ITEM_BAR_CD = $NC.getValue("#edtQItem_Barcd");

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
     P_CENTER_CD: CENTER_CD
    ,P_BU_CD: BU_CD
    ,P_OUTBOUND_DATE: OUTBOUND_DATE
    ,P_PICK_SEQ: $NC.G_VAR.PICK_SEQ
  });

  G_GRDMASTER.queryId = "LOM7030E.RS_MASTER1";
  // 데이터 조회
  $NC.serviceCall("/LOM7030E/getDataSet.do", 
      $NC.getGridParams(G_GRDMASTER), onGetMaster, onError, null, '7030E_GET_ITEM_INFO');

}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save(saveType) {

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
      message: "사업구분 코드를 입력하십시오.",
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
  /*
    var OUTBOUND_NO = $NC.getValue("#edtQOutbound_No");
    if ($NC.isNull(OUTBOUND_NO)) {
      showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
      return;
    }
  */
  var BOX_NO = $NC.getValue("#edtBox_No");
  if ($NC.isNull(BOX_NO)) {
    showMessage("박스번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }

//  var BOX_TYPE = $NC.getValue("#cboBox_Type");

  var detailDS = [ ];
  var saveData;
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (rowData.CRUD == "U") {
    saveData = {
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
      P_OUTBOUND_NO: rowData.OUTBOUND_NO,
      P_BOX_NO: rowData.BOX_NO,
      P_BRAND_CD: rowData.BRAND_CD,
      P_ITEM_CD: rowData.ITEM_CD,
      P_ITEM_STATE: rowData.ITEM_STATE,
      P_ITEM_LOT: rowData.ITEM_LOT,
      P_CONFIRM_QTY: rowData.INSPECT_QTY
    };
    detailDS.push(saveData);
  }

  /*
  for ( var i = 0, rowCount = G_GRDMASTER.data.getLength(); i < rowCount; i++) {
    rowData = G_GRDMASTER.data.getItem(i);
    if (rowData.CRUD == "U") {
      saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_BOX_NO: BOX_NO,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_CONFIRM_QTY: rowData.INSPECT_QTY
      };
      detailDS.push(saveData);
    }
  }
  */

  var COMPLETE_YN = "N";
  var onSucessFn;
  switch (saveType) {
  case "onBoxComplete":
    if (detailDS.length === 0 && $NC.G_VAR.SUM_INSPECT_QTY == 0) {
      showMessage("검수 후 박스완료 처리하십시오.");
      return;
    }

    COMPLETE_YN = "Y";
    onSucessFn = onBoxComplete;
    break;
  case "onBoxSave":
    if (detailDS.length === 0) {
      showMessage("검수 후 박스저장 처리하십시오.");
      return;
    }

    onSucessFn = onBoxSave;
    break;
  case "onShowBoxManage":
    if (detailDS.length === 0) {
      onShowBoxManage();
      return;
    }

    onSucessFn = onShowBoxManage;
    break;
  default:
    return;
  }

  $NC.serviceCallAndWait("/LOM7030E/save.do", {
    P_DS_MASTER: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
      P_OUTBOUND_NO: rowData.OUTBOUND_NO,
      P_BOX_NO: rowData.BOX_NO,
      P_BOX_TYPE: "01",
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }),
    P_DS_DETAIL: $NC.toJson(detailDS),
    P_COMPLETE_YN: COMPLETE_YN,
    P_CARRIER_CD: $NC.G_VAR.CARRIER_CD
  }, onSucessFn, onError);
  /*  
    $NC.serviceCallAndWait("/LOM7030E/save.do", {
      P_DS_MASTER: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_OUTBOUND_NO: OUTBOUND_NO,
        P_BOX_NO: BOX_NO,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      }),
      P_DS_DETAIL: $NC.toJson(detailDS),
      P_COMPLETE_YN: COMPLETE_YN,
      P_CARRIER_CD: $NC.G_VAR.CARRIER_CD
    }, onSucessFn, onError);
    */
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
    // selectKey: new Array("BRAND_CD", "ITEM_CD"),
    selectKey: new Array("OUTBOUND_NO", "SHIPPER_NM"),
  });
  setTimeout(function() {
    G_GRDMASTER.lastKeyVal = lastKeyVal;
    _Inquiry();
  }, 400);
  // _Inquiry();
//  G_GRDMASTER.lastKeyVal = lastKeyVal;
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
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 85,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "기검수수량",
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
    id: "CANCEL_QTY",
    field: "CANCEL_QTY",
    name: "취소수량",
    minWidth: 85,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_KEY",
    field: "BU_KEY",
    name: "결제번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "주문번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM1",
    field: "BRAND_NM",
    name: "위탁사명",
    minWidth: 90
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    rowHeight: 32,
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.INSPECT_YN === "Y") {
          return "specialrow3";
        }
        if (rowData.CANCEL_QTY > 0) {
          return "specialrow4";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LOM7030E.RS_MASTER",
    sortCol: "ITEM_CD",
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
  setItemInfoValue(G_GRDMASTER.data.getItem(row));
  setOrderInfoValue(G_GRDMASTER.data.getItem(row));

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);

  setFocusScan();
}

/**
 * 박스저장 버튼 클릭
 * 
 * @param e
 *          event handler
 */
function onBtnBoxSave(e) {

  if ($(e.target).hasClass("disabled")) {
    return;
  }

  _Save("onBoxSave");
}

/**
 * 박스완료 버튼 클릭
 * 
 * @param e
 *          event handler
 */
function onBtnBoxComplete(e) {

  if (e != undefined && $(e.target).hasClass("disabled")) {
    return;
  }

  // $NC.G_VAR.CARRIER_CD = $NC.getValue("#edtQCarrier_Cd");
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

/**
 * 박스관리 버튼 클릭
 * 
 * @param e
 *          event handler
 */
function onBtnBoxManage(e) {

  if ($(e.target).hasClass("disabled")) {
    return;
  }

  _Save("onShowBoxManage");
}

function onBtnFWScanConfirm(e) {

  if (e != undefined && $(e.target).hasClass("disabled")) {
    return;
  }

  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }
  /*
    if ($NC.G_VAR.SUM_INSPECT_QTY > 0 && $NC.G_VAR.SCANCOMPLETE) {
      showMessage("박스완료하지 않은 검수내역이 존재합니다.\n\n박스완료 후 검수완료 처리하십시오.");
      return;
    }
  */
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
      message: "사업구분 코드를 입력하십시오.",
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

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var OUTBOUND_NO = rowData.OUTBOUND_NO;
  /*
    if ($NC.isNull(OUTBOUND_NO)) {
      showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
      return;
    }

    var message = "";
    if ($NC.G_VAR.SUM_ENTRY_QTY > $NC.G_VAR.SUM_CONFIRM_QTY + $NC.G_VAR.SUM_INSPECT_QTY) {
      message = "미검수 상품이 존재합니다.\n\n검수완료 처리하시겠습니까?";
    }
    // message += "검수완료 처리하시겠습니까?";
  */
  // rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  $NC.serviceCall("/LOM7030E/callFWScanConfirm.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: OUTBOUND_NO,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onFWScanConfirm, onError);
  /*
  if (message == "" || message == undefined) {

    // 검수수량이 100%일 경우 메세지없이 검수완료
    $NC.serviceCall("/LOM7030E/callFWScanConfirm.do", {
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_OUTBOUND_NO: OUTBOUND_NO,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      })
    }, onFWScanConfirm, onError);
  } else {

    showMessage({
      message: message,
      onYesFn: function() {

        // 데이터 조회
        $NC.serviceCall("/LOM7030E/callFWScanConfirm.do", {
          P_QUERY_PARAMS: $NC.getParams({
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE: OUTBOUND_DATE,
            P_OUTBOUND_NO: OUTBOUND_NO,
            P_USER_ID: $NC.G_USERINFO.USER_ID
          })
        }, onFWScanConfirm, onError);
      },
      onNoFn: function() {
        setFocusScan();
      }
    });
  }
  */
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
      message: "사업구분 코드를 입력하십시오.",
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
  /*
    var OUTBOUND_NO = $NC.getValue("#edtQOutbound_No");
    if ($NC.isNull(OUTBOUND_NO)) {
      showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
      return;
    }
  */
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  showMessage({
    message: "검수취소 처리하시겠습니까?",
    onYesFn: function() {

      $NC.serviceCall("/LOM7030E/callBWScanConfirm.do", {
        P_QUERY_PARAMS: $NC.getParams({
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_OUTBOUND_NO: rowData.OUTBOUND_NO,
          P_USER_ID: $NC.G_USERINFO.USER_ID
        })
      }, onBWScanConfirm, onError);
      // 데이터 조회
      /*
            $NC.serviceCall("/LOM7030E/callBWScanConfirm.do", {
              P_QUERY_PARAMS: $NC.getParams({
                P_CENTER_CD: CENTER_CD,
                P_BU_CD: BU_CD,
                P_OUTBOUND_DATE: OUTBOUND_DATE,
                P_OUTBOUND_NO: OUTBOUND_NO,
                P_USER_ID: $NC.G_USERINFO.USER_ID
              })
            }, onBWScanConfirm, onError);
      */
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
      processFn.call(this);
    } else {
      showMessage("현재 검수 작업 중 입니다.");
    }
    return;
  }
  setFocusScan();
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  var rowData;
  if (G_GRDMASTER.data.getLength() > 0) {

    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        // selectKey: ["BRAND_CD", "ITEM_CD"],
        selectKey: ["OUTBOUND_NO", "SHIPPER_NM"],
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
    rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    setOrderInfoValue(rowData);
    onCalcSummary();
    /*
        $NC.setEnable("#cboQCenter_Cd", false);
        $NC.setEnable("#edtQBu_Cd", false);
        $NC.setEnable("#btnQBu_Cd", false);
        $NC.setEnable("#dtpQOutbound_Date", false);
        $NC.setEnable("#cboQOutbound_Batch", false);
        $NC.setEnable("#btnQOutbound_Batch", false);
    */
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);

//    onChangingCondition();
    // showMessage("존재하지 않는 출고전표입니다. 확인 후 작업하십시오.");
    showMessage("조회된 데이터가 없습니다. 확인 후 작업하십시오.");
    rowData = G_GRDMASTER.data.getItem(0);
    setOrderInfoValue(rowData);
    onCalcSummary();
    return;
  }
  
  $NC.G_VAR.ORDERCAN_CHK = rowData.ORDER_CAN;
  $NC.G_VAR.ORDERHOLD_CHK = rowData.ORDER_HOLD;
  
  if ($NC.G_VAR.ORDERCAN_CHK == "Y") {
    setEnableButton("#btnBoxSave", false);
    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxManage", false);
    setEnableButton("#btnFWScanConfirm", false);
    setEnableButton("#btnBWScanConfirm", false);
    setEnableButton("#btnDeliveryChange", false);
//    setEnableButton("#btnBoxCancel", true);
    $NC.setValue("#edtBox_No", "주문취소");
    $("#edtBox_No").addClass("inspected");
    return;
  } else if ($NC.G_VAR.ORDERCAN_CHK == "Z") {
    setEnableButton("#btnBoxSave", false);
    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxManage", false);
    setEnableButton("#btnFWScanConfirm", false);
    setEnableButton("#btnBWScanConfirm", false);
    setEnableButton("#btnDeliveryChange", false);
    $NC.setValue("#edtBox_No", "취소확인");
    $("#edtBox_No").addClass("inspected");
    return;
  } else if ($NC.G_VAR.ORDERHOLD_CHK == "Y") {
//    alert("주문보류 처리된 전표입니다.\n\n [주문보류관리] 화면에서 해당전표를 확인해 주시기 바랍니다.");
    setEnableButton("#btnBoxSave", false);
    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxManage", false);
    setEnableButton("#btnFWScanConfirm", false);
    setEnableButton("#btnBWScanConfirm", false);
    setEnableButton("#btnDeliveryChange", false);
//    setEnableButton("#btnBoxCancel", false);
    $NC.setValue("#edtBox_No", "주문보류");
    $("#edtBox_No").addClass("inspected");
    return;
  } else if (rowData.INSPECT_YN == "Y") {
    setEnableButton("#btnBoxManage", true);
//    setEnableButton("#btnBoxCancel", false);
    setEnableButton("#btnFWScanConfirm", false);
    setEnableButton("#btnBWScanConfirm", $NC.getProgramPermission().canConfirmCancel);
    // $NC.setEnable("#edtScan", false);
    $NC.setValue("#edtBox_No", "검수완료");
    $("#edtBox_No").addClass("inspected");
    $NC.G_VAR.INSPECT_YN = "Y";
    return;
  } else {
    $NC.setValue("#edtBox_No", rowData.BOX_NO);
    $("#edtBox_No").removeClass("inspected");
  }

  setFocusScan();
}

function doPrint1() {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  var checkedValueDS = [ ];

  checkedValueDS.push($NC.getValue("#edtBox_No"));

  // 택배송장출력
  if ($NC.G_VAR.CARRIER_CD == '0020') {
    $NC.G_MAIN.silentPrint({
      printParams: [{
        reportDoc: "lo/LABEL_LOM09_1",
        queryId: "WR.RS_LABEL_LOM03_1",
        queryParams: {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_OUTBOUND_NO: rowData.OUTBOUND_NO,
          P_ITEM_CD: rowData.ITEM_CD,
          P_PRINT_YN: ""
        },
        iFrameNo: 1,
        checkedValue: checkedValueDS.toString(),
        silentPrinterName: $NC.G_USERINFO.PRINT_WB_NO,
        internalQueryYn: "N"
      }],
      onAfterPrint: function() {
        setFocusScan();
      }
    });
  } else {
    $NC.G_MAIN.silentPrint({
      printParams: [{
        reportDoc: "lo/LABEL_LOM09_1",
        queryId: "WR.RS_LABEL_LOM02_1",
        queryParams: {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_OUTBOUND_NO: rowData.OUTBOUND_NO,
          P_ITEM_CD: rowData.ITEM_CD,
          P_PRINT_YN: ""
        },
        iFrameNo: 1,
        checkedValue: checkedValueDS.toString(),
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

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  var printOptions = {
    printParams: [{
      // 거래명세서 출력
      reportDoc: "lo/RECEIPT_LOM01",
      queryId: "WR.RS_RECEIPT_LOM01",
      queryParams: {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
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
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO
      },
      iFrameNo: 3,
      silentPrinterName: $NC.G_USERINFO.PRINT_CARD
    });
  }

  $NC.G_MAIN.silentPrint(printOptions);

}

function doPrint3() {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  // 취소송장출력
  $NC.G_MAIN.silentPrint({
    printParams: [{
      reportDoc: "lo/LABEL_LOM09_2",
      queryId: "WR.RS_LABEL_LOM02_2",
      queryParams: {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_ITEM_CD: rowData.ITEM_CD,
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

function onShowBoxManage(ajaxData) {

  if (!$NC.isNull(ajaxData)) {
    var resultData = $NC.toArray(ajaxData);
    if (resultData.O_MSG !== "OK") {
      showMessage(resultData.O_MSG);
      return;
    }
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  var OUTBOUND_NO = $NC.getValue("#edtQOutbound_No");
  var ITEM_CD = $NC.getValue("#edtQItem_Barcd");

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LOM7031P",
    PROGRAM_NM: "박스통합",
    url: "lo/LOM7031P.html",
    width: 870,
    height: 450,
    userData: {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: OUTBOUND_NO,
      P_ITEM_CD: ITEM_CD,
      P_CARRIER_CD: $NC.G_VAR.CARRIER_CD,
      P_POLICY_LO450: $NC.G_VAR.policyVal.LO450,
      P_INSPECT_YN: $NC.G_VAR.INSPECT_YN === "Y" ? false : true,
      P_CARD_MSG_YN: $NC.isNull($NC.getValue("#edtCard_Msg")) === true ? false : true,
    },
    onCancel: function() {
      if ($NC.G_VAR.INSPECT_YN == "Y") {
        return;
      }
      var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        // selectKey: new Array("BRAND_CD", "ITEM_CD"),
        selectKey: new Array("OUTBOUND_NO", "SHIPPER_NM"),
      });

      _Inquiry();

      G_GRDMASTER.lastKeyVal = lastKeyVal;
    }
  });
}

function onBoxSave(ajaxData) {

  _Cancel();
}

function onBoxComplete(ajaxData) {

  //doPrint1();
  //_Cancel();
  
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  
  if (rowData.REMAIN_QTY == 0 && (rowData.ENTRY_QTY == rowData.INSPECT_QTY + rowData.CONFIRM_QTY)) {
    $NC.G_VAR.SCANCOMPLETE = false;
    if (!$NC.isNull($NC.G_USERINFO.PRINT_WB_NO) && !$NC.isNull($NC.G_USERINFO.PRINT_LO_BILL)
        && !$NC.isNull($NC.G_USERINFO.PRINT_CARD)) {
//      onBtnBoxComplete();
//      onBtnFWScanConfirm();
      doPrint1();
      _Cancel();
    } else {
      alert("설정하신 프린터가 없습니다.\n\n자동출력프린터를 먼저 등록하십시오.");
      return;
    }
    return;
  } else {
    _Cancel();
  }

  $NC.G_VAR.SCANCOMPLETE = true;
  setFocusScan();
  
  
}

function onFWScanConfirm(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      showMessage(resultData.O_MSG);
      return;
    }
  }

  // if (G_GRDMASTER.data.getLength() > 1) {
  // return;
  // }

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
      message: "사업구분 코드를 입력하십시오.",
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

  var ITEM_BAR_CD = $NC.getValue("#edtQItem_Barcd");

  // 데이터 조회
  $NC.serviceCallAndWait("/LOM7010E/callSP.do", {
    P_QUERY_ID: "LOM7030E.GET_INQUERY_YN",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_BATCH: OUTBOUND_BATCH,
      P_ITEM_BAR_CD: ITEM_BAR_CD
    })
  }, onGetInquery_Yn);
}

function onGetInquery_Yn(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      showMessage(resultData.O_MSG);
      return;
    }
  }

  if (resultData.O_INQUERY_YN == "Y") {
    _Inquiry();
    return;
  }

  onChangingCondition();
}

function onBWScanConfirm(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      showMessage(resultData.O_MSG);
      return;
    }
  }

  onChangingCondition();
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

  // if ($NC.G_VAR.SUM_ENTRY_QTY === $NC.G_VAR.SUM_CONFIRM_QTY + $NC.G_VAR.SUM_INSPECT_QTY) {
  // if (rowData.ORDER_CHK == "Y") {
  // alert("합포장 대상 전표이므로 상품 검수가 불가능합니다.");
  // return;
  // }
  if (rowData.ORDER_CAN == "Y" || rowData.INSPECT_YN == "Y") {
    // alert("주문취소 전표이므로 상품 검수가 불가능합니다.");
    setFocusScan();
    return;
  }

  if (rowData.REMAIN_QTY == 0 && (rowData.ENTRY_QTY == rowData.INSPECT_QTY + rowData.CONFIRM_QTY)) {
    $NC.G_VAR.SCANCOMPLETE = false;
    if (!$NC.isNull($NC.G_USERINFO.PRINT_WB_NO) && !$NC.isNull($NC.G_USERINFO.PRINT_LO_BILL)
        && !$NC.isNull($NC.G_USERINFO.PRINT_CARD)) {
//      onBtnBoxComplete();
//      onBtnFWScanConfirm();
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

/**
 * 주문취소건 --> 취소확인 ERROR_DIV 업데이트
 */
function setUpdateOrderCan(center_Cd, bu_Cd, outbound_Date, outbound_No, item_Cd) {
  
  if ($NC.isNull($NC.G_USERINFO.PRINT_WB_NO) || $NC.isNull($NC.G_USERINFO.PRINT_LO_BILL)
      || $NC.isNull($NC.G_USERINFO.PRINT_CARD)) {
    alert("설정하신 프린터가 없습니다.\n\n자동출력프린터를 먼저 등록하십시오.");
    return;
  }

  $NC.serviceCallAndWait("/LOM7030E/callSP.do", {
    P_QUERY_ID: "LO_FW_SCAN_ORDER_TP2",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: center_Cd,
      P_BU_CD: bu_Cd,
      P_OUTBOUND_DATE: outbound_Date,
      P_OUTBOUND_NO: outbound_No,
      P_ITEM_CD: item_Cd,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onGetUpdateOrderCan, onError);
}

/**
 * 주문취소건  --> 취소확인 ERROR_DIV 업데이트 후 처리
 * 
 * @param ajaxData
 */
function onGetUpdateOrderCan(ajaxData) {

  var resultData = $NC.toArray(ajaxData.data);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      showMessage(resultData.O_MSG);
      return;
    }
  }
  doPrint3();
  _Cancel();
}


/**
 * 검색조건의 사업구분 검색 이미지 클릭
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
 * 사업구분 검색 결과
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

  $NC.G_VAR.policyVal.LO420 = "";
  $NC.G_VAR.policyVal.LO440 = "";
  $NC.G_VAR.policyVal.LO450 = "";

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCallAndWait("/LOM7030E/callSP.do", {
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


function onScanOrder(scanVal, flag) {

  var processFn = function() {

    // 초기화
    onChangingCondition();

    // 바코드 파싱
    var SCAN_DATA = scanVal.substr(2).split($NC.G_VAR.BARCD_DATA_DIV);

    var SCAN_CENTER_CD = SCAN_DATA[0];
    var SCAN_BU_CD = SCAN_DATA[1];
    var SCAN_OUTBOUND_DATE = $NC.getDate(SCAN_DATA[2]);
    var SCAN_OUTBOUND_BATCH = SCAN_DATA[3];
    var SCAN_ITEM_CD = SCAN_DATA[4];
    $NC.G_VAR.COMPARE_SCAN = SCAN_DATA[4];

    $NC.setValue("#cboQCenter_Cd", SCAN_CENTER_CD);
    $NC.setValue("#edtQBu_Cd", SCAN_BU_CD);
    $NC.setValue("#dtpQOutbound_Date", SCAN_OUTBOUND_DATE);
    $NC.setValue("#cboQOutbound_Batch", SCAN_OUTBOUND_BATCH);
    $NC.setValue("#edtQItem_Barcd", SCAN_ITEM_CD);

    _Inquiry();
  };

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.G_VAR.INSPECT_YN == "N") {
      showMessage("현재 검수 작업 중 입니다.");
    } else {
      processFn.call(this);
    }
    return;
  }

  processFn.call(this);
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
      message: "사업구분 코드를 입력하십시오.",
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
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var OUTBOUND_NO = rowData.OUTBOUND_NO;
  /*
    var OUTBOUND_NO = $NC.getValue("#edtQOutbound_No");
    if ($NC.isNull(OUTBOUND_NO)) {
      showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
      return;
    }
  */
  // 데이터 조회
  $NC.serviceCallAndWait("/LOM7030E/callSP.do", {
    P_QUERY_ID: "LOM7030E.GET_ITEM_INFO",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: OUTBOUND_NO,
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
  if (rowData.INSPECT_YN == "Y") {
    showMessage("검수가 완료된 상품입니다.");
    return;
  }

  // 추가주문으로 인한 합포장대상 체크
  /*

  if ($NC.G_VAR.NEWORDER_CHK == "Y") {
    rowData.ORDER_CHK = "Y";
    $NC.setValue("#edtBox_No", "합포장대상");
    $("#edtBox_No").addClass("inspected");
    return true;
  } else {
    rowData.ORDER_CHK = "N";
    $NC.setValue("#edtBox_No", rowData.BOX_NO);
    $("#edtBox_No").removeClass("inspected");
  }
  */


  if ($NC.G_VAR.ORDERCAN_CHK == "Y") {
    rowData.ORDER_CAN = "Y";
    $NC.setValue("#edtBox_No", "주문취소");
    $("#edtBox_No").addClass("inspected");
    return true;
  } else {
    rowData.ORDER_CAN = "N";
    $NC.setValue("#edtBox_No", rowData.BOX_NO);
    $("#edtBox_No").removeClass("inspected");
  }

  // 주문보류 체크
  /*

  if ($NC.G_VAR.ORDERHOLD_CHK == "Y") {
    rowData.ORDER_HOLD = "Y";
    $NC.setValue("#edtBox_No", "주문보류");
    $("#edtBox_No").addClass("inspected");
    return true;
  } else {
    rowData.ORDER_HOLD = "N";
    $NC.setValue("#edtBox_No", rowData.BOX_NO);
    $("#edtBox_No").removeClass("inspected");
  }
  */

  if (!rowData) {
    showMessage("상품이 선택되지 않았습니다.\n\n상품 선택 또는 스캔 후 입력하십시오.");
    return;
  }

  var ENTRY_QTY = Number(rowData.ENTRY_QTY);
  var CONFIRM_QTY = Number(rowData.CONFIRM_QTY);
  var INSPECT_QTY = Number(rowData.INSPECT_QTY);
  var ITEM_QTY = Number(scanVal);

  if (isNaN(ITEM_QTY) || ITEM_QTY == 0) {
    showMessage("수량을 정확히 입력하십시오.");
    return;
  }

  if (ENTRY_QTY < INSPECT_QTY + CONFIRM_QTY + ITEM_QTY) {
    showMessage("등록수량을 초과해서 검수할 수 없습니다.\n\n수량을 다시 입력하십시오.");
    return;
  }

  rowData.INSPECT_QTY = INSPECT_QTY + ITEM_QTY;
  rowData.REMAIN_QTY = ENTRY_QTY - CONFIRM_QTY - INSPECT_QTY - ITEM_QTY;
//  $NC.setValue("#edtInspect_Qty", rowData.INSPECT_QTY);
  $NC.setValue("#edtQOutbound_No", rowData.OUTBOUND_NO);

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  G_GRDMASTER.lastRowModified = true;

  // 수량변경이 있을 경우에 저장버튼 활성화
  // setEnableButton("#btnBoxSave", true);
//  setProgressBar(ITEM_QTY);
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
  if (rowData.INSPECT_YN == "Y") {
    showMessage("검수가 완료된 상품입니다.");
    return;
  }

  var ENTRY_QTY = Number(rowData.ENTRY_QTY);
  var CONFIRM_QTY = Number(rowData.CONFIRM_QTY);
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
  rowData.REMAIN_QTY = ENTRY_QTY - CONFIRM_QTY - INSPECT_QTY + ITEM_QTY;
//  $NC.setValue("#edtInspect_Qty", rowData.INSPECT_QTY);

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  G_GRDMASTER.lastRowModified = true;

  // 수량변경이 있을 경우에 저장버튼 활성화
  // setEnableButton("#btnBoxSave", true);
//  setProgressBar(ITEM_QTY * -1);
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
  var CONFIRM_QTY = Number(rowData.CONFIRM_QTY);
  var INSPECT_QTY = Number(rowData.INSPECT_QTY);
  var ORG_INSPECT_QTY = INSPECT_QTY;
  var ITEM_QTY = 0;

  var scanLen = scanVal.length;
  // / Key 입력은 수량 전체 검수
  if (scanLen == 0) {
    ITEM_QTY = ENTRY_QTY - CONFIRM_QTY - INSPECT_QTY;
  } else {
    // 숫자 + / Key 입력은 검수수량을 입력 값으로 변경
    INSPECT_QTY = 0;
    ITEM_QTY = Number(scanVal);
  }

  if (isNaN(ITEM_QTY)) {
    showMessage("수량을 정확히 입력하십시오.");
    return;
  }

  if (ENTRY_QTY < INSPECT_QTY + CONFIRM_QTY + ITEM_QTY) {
    showMessage("등록수량을 초과해서 검수할 수 없습니다.\n\n수량을 다시 입력하십시오.");
    return;
  }

  rowData.INSPECT_QTY = INSPECT_QTY + ITEM_QTY;
  rowData.REMAIN_QTY = ENTRY_QTY - CONFIRM_QTY - INSPECT_QTY - ITEM_QTY;
//  $NC.setValue("#edtInspect_Qty", rowData.INSPECT_QTY);

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  G_GRDMASTER.lastRowModified = true;

  // 수량변경이 있을 경우에 저장버튼 활성화
  // setEnableButton("#btnBoxSave", true);
//  setProgressBar(rowData.INSPECT_QTY - ORG_INSPECT_QTY);
  setFocusScan();
}

function onValidateScan(isQty) {

  if (G_GRDMASTER.data.getLength() == 0) {
    showMessage("현재 검수 중이 아닙니다.\n\n전표를 먼저 스캔하십시오.");
    return false;
  }
  /*
    if ($NC.G_VAR.INSPECT_YN == "Y") {
      showMessage("검수완료 처리된 전표입니다. 수정할 수 없습니다.");
      return false;
    }
  */
  if (isQty) {
    if ($NC.G_VAR.policyVal.LO420 !== "Y") {
      showMessage("정책 설정에 의해 검수수량을 직접 입력할 수 없습니다.\n\n스캔을 통해 검수 처리하삽시오.");
      return false;
    }
  }

  return true;
}

function onCalcSummary() {

  var TOTAL_INSPECT_QTY = 0;
  
  if (G_GRDMASTER.data.getLength() == 0) {

    $NC.G_VAR.SUM_ENTRY_QTY = 0;
    $NC.G_VAR.SUM_CONFIRM_QTY = 0;
    $NC.G_VAR.SUM_INSPECT_QTY = 0;
    $NC.G_VAR.SUM_NONINSPECT_QTY = 0;
    $NC.G_VAR.SUM_CANCEL_QTY = 0;
    $NC.G_VAR.SUM_HAS_QTY = 0;
    TOTAL_INSPECT_QTY = 0;
//    $NC.setValue("#divProgressVal", "0 / 0 [ 0 %]");
//    $("#divProgressbar").progressbar("value", 0);
    
  } else {

    var summary = $NC.getGridSumVal(G_GRDMASTER, {
      sumKey: ["ENTRY_QTY", "CONFIRM_QTY", "INSPECT_QTY","REMAIN_QTY","HAS_QTY"]
    });
    
    var summaryCancel = $NC.getGridSumVal(G_GRDMASTER, {
      searchKey: "ORDER_CAN",
      searchVal: ["Y","Z"],
      sumKey: ["ENTRY_QTY"]
    });
   
    $NC.G_VAR.SUM_ENTRY_QTY = summary.ENTRY_QTY;
    $NC.G_VAR.SUM_INSPECT_QTY = summary.INSPECT_QTY;
    $NC.G_VAR.SUM_CONFIRM_QTY = summary.CONFIRM_QTY;
    $NC.G_VAR.SUM_CANCEL_QTY = (summaryCancel.ENTRY_QTY === "" ? 0 : summaryCancel.ENTRY_QTY);
    TOTAL_INSPECT_QTY = summary.CONFIRM_QTY + summary.INSPECT_QTY;
    $NC.G_VAR.SUM_NONINSPECT_QTY = summary.REMAIN_QTY;
    $NC.G_VAR.SUM_HAS_QTY = summary.HAS_QTY;
    
  }
  $NC.setValue("#edtQEntry_Qty",$NC.G_VAR.SUM_ENTRY_QTY);
  $NC.setValue("#edtQInspect_Qty",TOTAL_INSPECT_QTY);
  $NC.setValue("#edtQNonInspect_Qty",$NC.G_VAR.SUM_NONINSPECT_QTY);
  $NC.setValue("#edtQCancel_Qty",$NC.G_VAR.SUM_CANCEL_QTY);
  $NC.setValue("#edtQHas_Qty",$NC.G_VAR.SUM_HAS_QTY);
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

  onScanItemCounting(resultData.P_ITEM_BARCD, resultData.O_COLUMN_NM, resultData.O_ITEM_CD);
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
  if (!$NC.isNull(column_Nm)) {
    searchIndex = $NC.getGridSearchRow(G_GRDMASTER, {
      searchKey: column_Nm,
      searchVal: scanVal
    });
  } else {
    // 상품코드, 상품바코드, 박스바코드, 케이스바코드에서 검색
    for (var i = 0, rowCount = G_GRDMASTER.data.getLength(); i < rowCount; i++) {
      rowData = G_GRDMASTER.data.getItem(i);
     if (rowData.ITEM_CD === scanVal || rowData.ITEM_BAR_CD === scanVal || rowData.BOX_BAR_CD === scanVal
     || rowData.CASE_BAR_CD === scanVal) {
        if (rowData.INSPECT_YN == "N") {
          if (rowData.ORDER_CAN !== "Z") {
//            if (rowData.REMAIN_QTY > 0) {
              searchIndex = i;
              break;
//            }
          }
        }
      }
    }
  }

  if (searchIndex == -1) {
    setFocusScan();
    return false;
  }

  $NC.setGridSelectRow(G_GRDMASTER, searchIndex);

  rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (rowData.BAR_CNT == "Y") {
    showMessage("중복된 바코드 상품이 존재하여 검수 할 수 없습니다.");
    return true;
  }

  if (rowData.INSPECT_YN == "Y") {
    showMessage("검수가 완료된 상품입니다.");
    return true;
  }
  

  /*
  if ($NC.G_VAR.ORDERCAN_CHK == "Y") {
    rowData.ORDER_CAN = "Y";
    $NC.setValue("#edtBox_No", "주문취소");
    $("#edtBox_No").addClass("inspected");
    return true;
  } else {
    rowData.ORDER_CAN = "N";
    $NC.setValue("#edtBox_No", rowData.BOX_NO);
    $("#edtBox_No").removeClass("inspected");
  }
  */
  
  // 컬럼 지정 검색(DB 검색 후)일 경우 스캔 바코드 값을 데이터에 입력
  if (!$NC.isNull(column_Nm)) {
    rowData[column_Nm] = scanVal;
  }
  
  if (rowData.ORDER_CAN == "Y") {
    setUpdateOrderCan(rowData.CENTER_CD, rowData.BU_CD, rowData.OUTBOUND_DATE, rowData.OUTBOUND_NO, rowData.ITEM_CD);
    return true;
  }

  var ITEM_QTY = 1;
  var ENTRY_QTY = Number(rowData.ENTRY_QTY);
  var CONFIRM_QTY = Number(rowData.CONFIRM_QTY);
  var INSPECT_QTY = Number(rowData.INSPECT_QTY);

  if (ENTRY_QTY < INSPECT_QTY + CONFIRM_QTY + ITEM_QTY) {
    showMessage("검수가 완료된 상품입니다. 다른 상품을 스캔하십시오.");
    return true;
  }

  rowData.INSPECT_QTY = INSPECT_QTY + ITEM_QTY;
  rowData.REMAIN_QTY = ENTRY_QTY - CONFIRM_QTY - INSPECT_QTY - ITEM_QTY;

//  $NC.setValue("#edtInspect_Qty", rowData.INSPECT_QTY);
  $NC.setValue("#edtQOutbound_No", rowData.OUTBOUND_NO);

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  G_GRDMASTER.lastRowModified = true;

  // 수량변경이 있을 경우에 저장버튼 활성화
  // setEnableButton("#btnBoxSave", true);
//  setProgressBar(ITEM_QTY);
  if ($NC.isNull(rowData.ORDER_CAN) || rowData.ORDER_CAN == "N") {
    onBtnBoxComplete();
  }
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

  // $NC.setValue("edtShipper_Nm", rowData.SHIPPER_NM);
  $NC.setValue("edtOrderer_Msg", rowData.ORDERER_MSG);

  // $NC.setValue("edtOutbound_No", rowData.OUTBOUND_NO);
  // $NC.setValue("edtInout_Nm", rowData.INOUT_NM);
  // $NC.setValue("edtBu_No", rowData.BU_NO);
  $NC.setValue("edtRemark1", rowData.REMARK1);

  // Row 데이터로 에디터 세팅
  $NC.setValue("#edtItem_Barcd", rowData.ITEM_BAR_CD);
  $NC.setValue("#edtItem_Cd", rowData.ITEM_CD);
  $NC.setValue("#edtItem_Nm", rowData.ITEM_NM);
  $NC.setValue("#edtItem_Spec", rowData.ITEM_SPEC);
  $NC.setValue("#edtQty_In_Box", rowData.QTY_IN_BOX);
  $NC.setValue("#edtQPaper_No", rowData.PAPER_NO);
//  $NC.setValue("#edtEntry_Qty", rowData.ENTRY_QTY);
//  $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);
//  $NC.setValue("#edtInspect_Qty", rowData.INSPECT_QTY);
  if (rowData.DELIVERY_TYPE == "1") {
    $NC.G_VAR.CARRIER_CD = "0020";
  } else {
    $NC.G_VAR.CARRIER_CD = "0010";
  }

  if (rowData.INSPECT_YN == "Y") {
    // setEnableButton("#btnBoxSave", false);
//    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxManage", true);
//    setEnableButton("#btnBoxCancel", false);
    setEnableButton("#btnFWScanConfirm", false);
    setEnableButton("#btnBWScanConfirm", $NC.getProgramPermission().canConfirmCancel);
    // $NC.setEnable("#edtScan", false);
    $NC.setValue("#edtBox_No", "검수완료");
    $("#edtBox_No").addClass("inspected");
    return;
  } else {
//    setEnableButton("#btnBoxCancel", false);
    setEnableButton("#btnBoxManage", false);
    // setEnableButton("#btnFWScanConfirm", true);
    setEnableButton("#btnFWScanConfirm", false);
    setEnableButton("#btnBWScanConfirm", false);
    // $NC.setEnable("#edtScan", true);
    if (rowData.ORDER_CAN == "Y") {
//      setEnableButton("#btnBoxCancel", true);
      $NC.setValue("#edtBox_No", "주문취소");
      $("#edtBox_No").addClass("inspected");
    } else if(rowData.ORDER_CAN == "Z") {
      $NC.setValue("#edtBox_No", "취소확인");
      $("#edtBox_No").addClass("inspected");
    } else {
      $NC.setValue("#edtBox_No", rowData.BOX_NO);
      $("#edtBox_No").removeClass("inspected");
    }
  }
}

function setOrderInfoValue(rowData) {

  // 전표정보 세팅
  if ($NC.isNull(rowData)) {
    rowData = {};
  }

  $NC.setValue("#edtShipper_Nm", rowData.SHIPPER_NM);
  $NC.setValue("#edtOrderer_Msg", rowData.ORDERER_MSG);
  $NC.setValue("#edtPacking_Batch", rowData.PACKING_BATCH);
  $NC.setValue("#edtDelivery_Type", rowData.DELIVERY_TYPE_D);
  $NC.setValue("#edtShip_Type", rowData.SHIP_TYPE_D);
  $NC.setValue("#edtOutbound_No", rowData.OUTBOUND_NO);
  $NC.setValue("#edtQOutbound_No", rowData.OUTBOUND_NO);
  $NC.setValue("#edtBu_No", rowData.BU_NO);

  // $NC.setValue("edtOutbound_No", rowData.OUTBOUND_NO);
  // $NC.setValue("edtInout_Nm", rowData.INOUT_NM);
  // $NC.setValue("edtBu_No", rowData.BU_NO);
  $NC.setValue("#edtRemark1", rowData.REMARK1);
}

function onBtnBoxCancelExec(e) {

  if ($(e.target).hasClass("disabled")) {
    return;
  }

  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  showMessage({
    message: "취소확인 처리하시겠습니까?",
    onYesFn: function() {

      // 데이터 조회
      $NC.serviceCall("/LOM7030E/callSP.do", {
        P_QUERY_ID: "LO_FW_SCAN_ORDER_TP",
        P_QUERY_PARAMS: $NC.getParams({
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_OUTBOUND_BATCH: rowData.OUTBOUND_BATCH,
          P_ITEM_CD: rowData.ITEM_CD,
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

function onBoxCancelExecSucess(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      showMessage(resultData.O_MSG);
      return;
    }
  }
  alert("취소확인처리 되었습니다.\n\n주문보류/취소관리 화면에서 취소처리하시기 바랍니다.");

  _Inquiry();
}

function setProgressBar(val) {

  if ($NC.isNull(val)) {
    val = 0;
  }

  $NC.G_VAR.SUM_INSPECT_QTY = $NC.G_VAR.SUM_INSPECT_QTY + Number(val);
  var TOTAL_INSPECT_QTY = $NC.G_VAR.SUM_CONFIRM_QTY + $NC.G_VAR.SUM_INSPECT_QTY;
  var CONFIRM_RATE = $NC.getRoundVal((TOTAL_INSPECT_QTY / $NC.G_VAR.SUM_ENTRY_QTY) * 100);

//  $NC.setValue("#divProgressVal", TOTAL_INSPECT_QTY + " / " + $NC.G_VAR.SUM_ENTRY_QTY + " [ " + CONFIRM_RATE + "%]");
//  $("#divProgressbar").progressbar("value", CONFIRM_RATE);
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
