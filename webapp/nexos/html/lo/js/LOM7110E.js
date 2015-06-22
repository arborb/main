/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    labelList: []
  });

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
  setEnableButton('#btnDeliveryChange', false);
  setEnableButton('#btnBoxCancel', false);

  $NC.setInitDatePicker("#dtpQOutbound_Date");

  $("#btnDeliveryChange").click(onBtnDeliveryChange);
  $("#btnBoxCancel").click(onBtnCancel);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnInit").click(onBtnInit);
  $("#edtBoxScan").css("ime-mode", "disabled");
  $("#edtLabelScan").css("ime-mode", "disabled");
  $("#divMasterView,#divGridBox,#divBottomView").mousedown(function(e) {
    e.stopImmediatePropagation();
    e.preventDefault();

    setTimeout(function() {
      setFocusScan(e.target.id);
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
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);

  // 최대화
  $NC.G_JWINDOW.maximise(function() {
    setFocusScan();
  });
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

  // 박스번호 사이즈를 적당히 조정
  var resizeVal = Math.max(Math.min($NC.getTruncVal((clientHeight - 700) / 20) * 10, 100), 0);
  var resizeView = $("#edtBox_No");
  if (resizeVal != resizeView.data("resizeVal")) {
    resizeView.css({
      "height": 150 + resizeVal,
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
  }

  // Grid 높이 조정
  $NC.resizeGrid("#grdMaster", detailViewWidth, clientHeight
      - ($NC.G_LAYOUT.header + $NC.G_LAYOUT.border1) - 138);
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
 */
function _OnInputKeyUp(e, view) {
  var id = view.prop("id").substr(3).toUpperCase();
  var scanVal = "";
  var scanLen = 0;
  scanVal = $NC.getValue(view);
  // 입력 값 길이
  scanLen = scanVal.length;
  if (scanLen == 0) {
    e.stopImmediatePropagation();
    return;
  }
  scanVal = scanVal.toUpperCase();

  switch (id) {
  case "BOXSCAN":
    if (e.keyCode == 13) {
      // 용기스캔
      onScanItem(scanVal);
    }
  break;
  case "LABELSCAN":
    if (e.keyCode == 13) {
      var labels = $NC.G_VAR.labelList;
      for (var i in labels) {
        if (labels[i] == scanVal) {
          alert('이미 스캔한 라벨입니다.');
          setFocusScan();
          return false;
        }
      }
      // 바코드 형식
      var labelValue = validateLabelScanCode(scanVal);
      if (labelValue) {
        onScanLabel(labelValue);
      } else {
        alert('스캔코드 형식이 잘못되었습니다.');
      }
    }
  break;
  }
  e.stopImmediatePropagation();
}

/**
 * 라벨코드 형식을 검증한다.
 */
function validateLabelScanCode(scanVal) {
  var scan = scanVal.split('-');
  if (scanVal.length != 24 || 
      scan.length != 4 ||
      scanVal.substr(0, 2) != 'OP' ||
      scanVal.substr(4,1) != '-' || 
      scanVal.substr(9,1) != '-' || 
      scanVal.substr(18,1) != '-'
  ) {
    return false;
  }
  var outboundDate = scan[2].substr(0, 4) + '-' + scan[2].substr(4,2) + '-' + scan[2].substr(6);
  return {
    center: scan[0].substr(2),
    bu: scan[1],
    outboundDate: outboundDate,
    pickSeq: scan[3]
  };
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
    var P_QUERY_PARAMS1;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS1 = {
        P_CARRIER_CD: val,
        P_VIEW_DIV: "1"
      };
      O_RESULT_DATA = $NP.getCarrierInfo({
        queryParams: P_QUERY_PARAMS1
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onCarrierPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showCarrierPopup({
        queryParams: P_QUERY_PARAMS1,
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
  $NC.setValue("#edtQOutbound_No");
  $NC.setValue("#edtQItem_Barcd");

  setItemInfoValue();

  $NC.setValue("#edtBox_No");

  setFocusScan();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {
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

  var BOX_NO = $NC.getValue("#edtBox_No");
  if ($NC.isNull(BOX_NO)) {
    showMessage("박스번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }

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

  $NC.serviceCallAndWait("/LOM7110E/save.do", {
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
}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

}

/**
 * 마스터 그리드 최기화
 */
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
    queryId: "LOM7110E.RS_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnGetColumns() {

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
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "PICK_SEQ",
    field: "PICK_SEQ",
    name: "라벨번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "PICK_YN2",
    field: "PICK_YN",
    cssClass: "align-center",
    name: "피킹검수여부",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY2",
    field: "CONFIRM_QTY",
    name: "검수수량",
    cssClass: "align-right",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    cssClass: "align-right",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_BAR_CD",
    field: "ITEM_BAR_CD",
    name: "상품바코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CUST_NM",
    field: "CUST_NM",
    name: "위탁사명",
    minWidth: 90
  });

  return $NC.setGridColumnDefaultFormatter(columns);
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

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
  setFocusScan();
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
    setEnableButton('#btnDeliveryChange', false);
    setEnableButton('#btnBoxCancel', false);

    $NC.G_VAR.NEWORDER_CHK = "";
    $NC.G_VAR.ORDERCAN_CHK = "";
    $NC.G_VAR.ORDERHOLD_CHK = "";

    var rateString = '0 / 0[ 0%]';
    $NC.setValue('#divProgressVal', rateString);
    $( "#divProgressbar" ).progressbar({
      value: 0
    });
    $NC.G_VAR.labelList.length = 0;

    setFocusScan();
  };

  //if (G_GRDMASTER.data.getLength() > 0) {
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
  //}
  setFocusScan();
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
 * 정책정보 취득
 */
function setPolicyValInfo() {

  //$NC.G_VAR.policyVal.LO420 = "";
  //$NC.G_VAR.policyVal.LO440 = "";
  //$NC.G_VAR.policyVal.LO450 = "";

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCallAndWait("/LOM7110E/callSP.do", {
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

/**
 * 용기스캔
 * 
 * @param scanVal
 */
function onScanItem(scanVal) {

  // 그리드 데이터에서 해당 행 선택
  if (onScanItemCounting(scanVal)) {
    return false;
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
  
  // 데이터 조회
  $NC.setValue('#edtBox_No');
  $NC.serviceCallAndWait("/LOM7110E/callSP.do", {
    P_QUERY_ID: "LOM7110E.GET_PICK_BOX_INFO",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_PICK_BOX_NO: scanVal
    })
  }, onGetItemInfo, onError);
}

/**
 * 라벨스캔
 * 
 * @param scanVal
 */
function onScanLabel(scanVal) {
  $NC.serviceCallAndWait("/LOM7110E/getDataSet.do", {
    P_QUERY_ID: "LOM7110E.RS_MASTER",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: scanVal.center,
      P_BU_CD: scanVal.bu,
      P_OUTBOUND_DATE: scanVal.outboundDate,
      P_PICK_SEQ: scanVal.pickSeq,
      P_PICK_BOX_NO: $NC.getValue('#edtBox_No'),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onGetLabelInfo, onError);
}

/**
 * 라벨스캔 리스너
 * 
 * @param ajaxData
 */
function onGetLabelInfo(ajaxData) {
  var rowData;
  $NC.G_VAR.labelList.push($('#edtLabelScan').val());
  if (G_GRDMASTER.data.getLength() === 0) {
    $NC.setInitGridData(G_GRDMASTER, ajaxData);
  } else {
    var resultArray = $NC.toArray(ajaxData);
    for (var i in resultArray) {
      resultArray[i].id = 'id_' + G_GRDMASTER.data.getLength();
      G_GRDMASTER.data.addItem(resultArray[i]);
    }
  }
  
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, G_GRDMASTER.data.getLength()-1);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["OUTBOUND_NO", "SHIPPER_NM"],
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
    rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
    showMessage("조회된 데이터가 없습니다. 확인 후 작업하십시오.");
    rowData = G_GRDMASTER.data.getItem(0);
  }
  if (rowData.CONFIRM_YN === 'Y') {
    alert('피킹검수가 완료되었습니다.');
  }
  setProgressBar(G_GRDMASTER.data.getLength(), rowData.PICK_CNT);
  setItemInfoValue(rowData);
  onCalcSummary();
  
  $NC.G_VAR.ORDERCAN_CHK = rowData.ORDER_CAN;
  $NC.G_VAR.ORDERHOLD_CHK = rowData.ORDER_HOLD;
  setEnableButton('#btnDeliveryChange', true);
  
  if ($NC.G_VAR.ORDERCAN_CHK == "Y") {
    setEnableButton("#btnDeliveryChange", false);
    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxCancel", false);
    return;
  } else if ($NC.G_VAR.ORDERCAN_CHK == "Z") {
    setEnableButton("#btnDeliveryChange", false);
    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxCancel", false);
  } else if ($NC.G_VAR.ORDERHOLD_CHK == "Y") {
    setEnableButton("#btnDeliveryChange", false);
    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxCancel", false);
  } else if (rowData.INSPECT_YN == "Y") {
    setEnableButton("#btnDeliveryChange", false);
    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxCancel", false);
  } else {
    //setEnableButton("#btnDeliveryChange", false);
    //setEnableButton("#btnBoxComplete", false);
    //setEnableButton("#btnBoxCancel", false);
    //$NC.setValue("#edtBox_No", rowData.BOX_NO);
    //$("#edtBox_No").removeClass("inspected");
  }

  setFocusScan();
}

function onCalcSummary() {

  var TOTAL_INSPECT_QTY = 0;
  
  if (G_GRDMASTER.data.getLength() == 0) {

    $NC.G_VAR.SUM_ENTRY_QTY = 0;
    $NC.G_VAR.SUM_CONFIRM_QTY = 0;
    $NC.G_VAR.SUM_INSPECT_QTY = 0;
    $NC.G_VAR.SUM_NONINSPECT_QTY = 0;
    $NC.G_VAR.SUM_CANCEL_QTY = 0;
    TOTAL_INSPECT_QTY = 0;
    
  } else {

    var summary = $NC.getGridSumVal(G_GRDMASTER, {
      sumKey: ["ENTRY_QTY", "CONFIRM_QTY", "INSPECT_QTY","REMAIN_QTY"]
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
    
  }
  $NC.setValue("#edtQEntry_Qty",$NC.G_VAR.SUM_ENTRY_QTY);
  $NC.setValue("#edtQInspect_Qty",TOTAL_INSPECT_QTY);
  $NC.setValue("#edtQNonInspect_Qty",$NC.G_VAR.SUM_NONINSPECT_QTY);
  $NC.setValue("#edtQCancel_Qty",$NC.G_VAR.SUM_CANCEL_QTY);
}

/**
 * 상품정보 취득(by상품바코드) - callSp
 * 
 * @param ajaxData
 */
function onGetItemInfo(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if ($NC.isNull(resultData)) {
    return false;
  }

  if (resultData.O_MSG !== "OK") {
    showMessage(resultData.O_MSG);
    return false;
  }

  $NC.setValue("#edtBox_No", resultData.P_PICK_BOX_NO);
  setFocusScan();
  //onScanItemCounting(resultData.P_PICK_BOX_NO, resultData.O_COLUMN_NM, resultData.O_ITEM_CD);
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
            searchIndex = i;
            break;
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
function setFocusScan(element) {
  if ($NC.getValue("#edtBox_No") == '' || element == 'edtBoxScan') {
    $NC.setFocus("#edtBoxScan");
    $NC.setValue("#edtBoxScan");
    return false;
  }
  $NC.setFocus("#edtLabelScan");
  $NC.setValue("#edtLabelScan");
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

/**
 * 그리드에서 선택된 상품상세보기 설정
 * 
 * @param rowData
 */
function setItemInfoValue(rowData) {

  // 상품 정보 세팅
  if ($NC.isNull(rowData)) {
    rowData = {};
  }
  $NC.setValue("#edtItem_Cd", rowData.ITEM_CD);
  $NC.setValue("#edtItem_Nm", rowData.ITEM_NM);
  $NC.setValue("#edtItem_Spec", rowData.ITEM_SPEC);
  $NC.setValue("#edtEntry_Qty", rowData.ENTRY_QTY);
  $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);
  $NC.setValue("#edtShipper_Nm", rowData.ORDERER_NM);
  $NC.setValue("#edtBu_No", rowData.BU_NO);
  $NC.setValue("#edtOutbound_No", rowData.OUTBOUND_NO);
  $NC.setValue("#edtOrder_Div", rowData.ORDER_DIV_NM);
  $NC.setValue("#edtOutbound_Batch", rowData.OUTBOUND_BATCH);
  
  if (rowData.CANCEL_YN == "Y") {
    setEnableButton('#btnBoxCancel', true);
  } else {
    setEnableButton('#btnBoxCancel', false);
  }
}

function setProgressBar(val, total) {
  var rate = Math.floor(val/total * 1000) / 10
    ,rateString = val + ' / ' + total + '[ ' + rate + '%]';
  $NC.setValue('#divProgressVal', rateString);
  $( "#divProgressbar" ).progressbar({
    value: rate
  });
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

/**
 * 용기추가
 */
function onBtnDeliveryChange(e) {
  if ($(e.target).hasClass("disabled")) {
    return;
  }
  _Save("onShowBoxManage");
}

/**
 * 검수취소
 */
function onBtnCancel(e) {
  if ($(e.target).hasClass("disabled")) {
    return;
  }
  var selectedRow = G_GRDMASTER.view.getSelectedRows()[0];
  var rowData = G_GRDMASTER.data.getItem(selectedRow);

  $NC.serviceCall("/LOM7110E/callBWScanConfirm.do", {
    P_DS_MASTER: $NC.getParams([{
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
      P_PICK_BOX_NO: rowData.OUTBOUND_NO
    }])
  }, onCancel, onError);
  
}

function onCancel(ajaxData) {
  console.log(ajax);
}

/**
 * 용기 추가 팝업창 보기
 */
function onShowBoxManage(ajaxData) {

  if (!$NC.isNull(ajaxData)) {
    var resultData = $NC.toArray(ajaxData);
    if (resultData.O_MSG !== "OK") {
      showMessage(resultData.O_MSG);
      return;
    }
  }
  var selectedRow = G_GRDMASTER.view.getSelectedRows()[0];
  var rowData = G_GRDMASTER.data.getItem(selectedRow);
  var CENTER_CD = rowData.CENTER_CD;
  var BU_CD = rowData.BU_CD;
  var OUTBOUND_DATE = rowData.OUTBOUND_DATE;
  var OUTBOUND_NO = rowData.OUTBOUND_NO;
  var PICK_SEQ = rowData.PICK_SEQ;

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LOM7111P",
    PROGRAM_NM: "용기추가",
    url: "lo/LOM7111P.html",
    width: 306,
    height: 450,
    userData: {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: OUTBOUND_NO,
      P_PICK_SEQ: PICK_SEQ
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