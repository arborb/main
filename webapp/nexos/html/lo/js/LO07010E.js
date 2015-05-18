/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 체크할 정책 값
    policyVal: {
      LO420: ""
    },
    BARCD_DATA_DIV: "-",
    PRINTER_NAME: "FinePrint",
    SUM_ENTRY_QTY: 0,
    SUM_CONFIRM_QTY: 0,
    SUM_INSPECT_QTY: 0,
    INSPECT_YN: "N"
  });

  $NC.G_JWINDOW.set({
    "minWidth": 1050,
    "minHeight": 690
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
  $("#divProgressbar").progressbar();

  $("#btnQBu_Cd").click(showUserBuPopup);

  $("#btnBoxComplete").click(onBtnBoxComplete);
  $("#btnBoxSave").click(onBtnBoxSave);
  $("#btnBoxManage").click(onBtnBoxManage);
  $("#btnFWScanConfirm").click(onBtnFWScanConfirm);
  $("#btnBWScanConfirm").click(onBtnBWScanConfirm);
  $("#btnInit").click(onBtnInit);
  $("#edtScan").css("ime-mode", "disabled");
  $("#divMasterView,#divDetailView,#divBottomView").mousedown(function(e) {
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

}

function _SetResizeOffset() {

  $NC.G_OFFSET.masterInfoMinLine = 2;
  $NC.G_OFFSET.masterInfoMaxLine = 5;
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
  var resizeVal = Math.max(Math.min($NC.getTruncVal((clientHeight - 600) / 20) * 10, 100), 0);
  var resizeView = $("#edtBox_No");
  if (resizeVal != resizeView.data("resizeVal")) {
    resizeView.css({
      "height": 50 + resizeVal,
      "font-size": 35 + resizeVal
    }).data("resizeVal", resizeVal);
  }
  // 마스터 정보 표시 라인수 계산, 현재 Max: 5, Min: 2
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

    if (resizeVal < 5) {
      $("#divMasterInfoExpender").show();
    } else {
      $("#divMasterInfoExpender").hide();
    }
  }

  // Grid 높이 조정
  $NC.resizeGrid("#grdMaster", detailViewWidth, clientHeight - ($NC.G_LAYOUT.header + $NC.G_LAYOUT.border1));
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
    if (e.keyCode == 111) {

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

      // 입력 값 체크
      // 전표번호 스캔 체크
      // 시작문자: OP == 개별 피킹
      // 입력문자길이: 23, ex) OPA1-1100-20140205-0001
      // 전표번호 스캔 체크 실패시 상품바코드 스캔으로 인식

      // 전표번호 바코드 스캔
      if (scanVal.substr(0, 2) == "OP" && scanVal.match(/-/g).length == 3) {

        onScanOrder(scanVal);
        e.stopImmediatePropagation();
        return;
      }

      // 상품 바코드 스캔
      onScanItem(scanVal);
      e.stopImmediatePropagation();
      return;
    }

    break;
  }
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

  $NC.setEnable("#cboQCenter_Cd");
  $NC.setEnable("#edtQBu_Cd");
  $NC.setEnable("#btnQBu_Cd");
  $NC.setEnable("#dtpQOutbound_Date");
  $NC.setValue("#edtQOutbound_No");

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

  var OUTBOUND_NO = $NC.getValue("#edtQOutbound_No");
  if ($NC.isNull(OUTBOUND_NO)) {
    showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: OUTBOUND_DATE,
    P_OUTBOUND_NO: OUTBOUND_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LO07010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onError);

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

  var OUTBOUND_NO = $NC.getValue("#edtQOutbound_No");
  if ($NC.isNull(OUTBOUND_NO)) {
    showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }

  var BOX_NO = $NC.getValue("#edtBox_No");
  if ($NC.isNull(BOX_NO)) {
    showMessage("박스번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }

  var detailDS = [ ];
  var saveData;
  var rowData;
  for (var i = 0, rowCount = G_GRDMASTER.data.getLength(); i < rowCount; i++) {
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

  $NC.serviceCall("/LO07010E/save.do", {
    P_DS_MASTER: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: OUTBOUND_NO,
      P_BOX_NO: BOX_NO,
      P_BOX_TYPE: "",
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }),
    P_DS_DETAIL: $NC.toJson(detailDS),
    P_COMPLETE_YN: COMPLETE_YN
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
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 60,
    cssClass: "align-right"
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

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 2,
    rowHeight: 32,
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.INSPECT_YN === "Y") {
          return "specialrow3";
        }
        if (rowData.REMAIN_QTY == 0) {
          return "specialrow4";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LO07010E.RS_MASTER",
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

  if ($(e.target).hasClass("disabled")) {
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

  if ($(e.target).hasClass("disabled")) {
    return;
  }

  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }

  if ($NC.G_VAR.SUM_INSPECT_QTY > 0) {
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

  var OUTBOUND_NO = $NC.getValue("#edtQOutbound_No");
  if ($NC.isNull(OUTBOUND_NO)) {
    showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }

  var message = "";
  if ($NC.G_VAR.SUM_ENTRY_QTY > $NC.G_VAR.SUM_CONFIRM_QTY + $NC.G_VAR.SUM_INSPECT_QTY) {
    message = "미검수 상품이 존재합니다.\n\n";
  }
  message += "검수완료 처리하시겠습니까?";

  showMessage({
    message: message,
    onYesFn: function() {

      // 데이터 조회
      $NC.serviceCall("/LO07010E/callFWScanConfirm.do", {
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

  var OUTBOUND_NO = $NC.getValue("#edtQOutbound_No");
  if ($NC.isNull(OUTBOUND_NO)) {
    showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }

  showMessage({
    message: "검수취소 처리하시겠습니까?",
    onYesFn: function() {

      // 데이터 조회
      $NC.serviceCall("/LO07010E/callBWScanConfirm.do", {
        P_QUERY_PARAMS: $NC.getParams({
          P_CENTER_CD: CENTER_CD,
          P_BU_CD: BU_CD,
          P_OUTBOUND_DATE: OUTBOUND_DATE,
          P_OUTBOUND_NO: OUTBOUND_NO,
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
    $NC.setEnable("#dtpQOutbound_Date");

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
    $NC.setEnable("#dtpQOutbound_Date", false);

  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);

    // $NC.setEnable("#cboQCenter_Cd");
    // $NC.setEnable("#edtQBu_Cd");
    // $NC.setEnable("#btnQBu_Cd");
    // $NC.setEnable("#dtpQOutbound_Date");

    showMessage("존재하지 않는 출고전표입니다. 확인 후 작업하십시오.");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(0);
  setOrderInfoValue(rowData);
  onCalcSummary();

  $NC.G_VAR.INSPECT_YN = rowData.INSPECT_YN;
  if ($NC.G_VAR.INSPECT_YN == "Y") {
    setEnableButton("#btnBoxManage", true);
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
  setFocusScan();
}

function doPrint() {

  $NC.G_MAIN.silentPrint({
    printParams: [{
      reportDoc: "lo/PAPER_LO02",
      queryId: "WR.RS_PAPER_LO02",
      queryParams: {
        P_CENTER_CD: "A1",
        P_BU_CD: "1100",
        P_OUTBOUND_DATE: "2014-02-05",
        P_OUTBOUND_BATCH: "001",
      },
      iFrameNo: 1,
      silentPrinterName: $NC.G_VAR.PRINTER_NAME
    }, {
      reportDoc: "lo/PAPER_LO03",
      queryId: "WR.RS_PAPER_LO03",
      queryParams: {
        P_CENTER_CD: "A1",
        P_BU_CD: "1100",
        P_OUTBOUND_DATE: "2014-02-05",
        P_OUTBOUND_BATCH: "001",
      },
      iFrameNo: 2,
      silentPrinterName: $NC.G_VAR.PRINTER_NAME
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

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LO07011P",
    PROGRAM_NM: "박스통합",
    url: "lo/LO07011P.html",
    width: 870,
    height: 450,
    userData: {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: OUTBOUND_NO,
      P_INSPECT_YN: $NC.G_VAR.INSPECT_YN
    },
    onCancel: function() {
      if ($NC.G_VAR.INSPECT_YN == "Y") {
        return;
      }
      var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: new Array("BRAND_CD", "ITEM_CD"),
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

  doPrint();
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

  _Inquiry();
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

  $NC.G_VAR.policyVal.LO510 = "";

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCall("/LO07010E/callSP.do", {
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
  }
}

function onScanOrder(scanVal) {

  var processFn = function() {

    // 초기화
    onChangingCondition();

    // 바코드 파싱
    var SCAN_DATA = scanVal.substr(2).split($NC.G_VAR.BARCD_DATA_DIV);

    var SCAN_CENTER_CD = SCAN_DATA[0];
    var SCAN_BU_CD = SCAN_DATA[1];
    var SCAN_OUTBOUND_DATE = $NC.getDate(SCAN_DATA[2]);
    var SCAN_OUTBOUND_NO = SCAN_DATA[3];

    if (SCAN_CENTER_CD != $NC.getValue("#cboQCenter_Cd")) {
      showMessage("작업중인 물류센터의 전표가 아닙니다.\n\n확인 후 작업하십시오.");
      return;
    }

    if (SCAN_BU_CD != $NC.getValue("#edtQBu_Cd")) {
      showMessage("작업중인 사업부의 전표가 아닙니다.\n\n확인 후 작업하십시오.");
      return;
    }

    $NC.setValue("#dtpQOutbound_Date", SCAN_OUTBOUND_DATE);
    $NC.setValue("#edtQOutbound_No", SCAN_OUTBOUND_NO);

    _Inquiry();
  };

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.G_VAR.INSPECT_YN == "N") {
      showMessage({
        message: "현재 검수 작업 중 입니다.\n\n데이터를 다시 가져오시겠습니까?",
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

  // ???????????????????????
  // if (scanVal.length < 8) {
  // showMessage("상품바코드 형식이 아닙니다.");
  // return;
  // }
  //

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

  var OUTBOUND_NO = $NC.getValue("#edtQOutbound_No");
  if ($NC.isNull(OUTBOUND_NO)) {
    showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }

  // 데이터 조회
  $NC.serviceCallAndWait("/LO07010E/callSP.do", {
    P_QUERY_ID: "LO07010E.GET_ITEM_INFO",
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
  $NC.setValue("#edtInspect_Qty", rowData.INSPECT_QTY);

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  G_GRDMASTER.lastRowModified = true;

  // 수량변경이 있을 경우에 저장버튼 활성화
  setEnableButton("#btnBoxSave", true);
  setProgressBar(rowData.INSPECT_QTY - ORG_INSPECT_QTY);
  setFocusScan();
}

function onValidateScan(isQty) {

  if (G_GRDMASTER.data.getLength() == 0) {
    showMessage("현재 검수 중이 아닙니다.\n\n전표를 먼저 스캔하십시오.");
    return false;
  }

  if ($NC.G_VAR.INSPECT_YN == "Y") {
    showMessage("검수완료 처리된 전표입니다. 수정할 수 없습니다.");
    return false;
  }

  if (isQty) {
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

    var summary = $NC.getGridSumVal(G_GRDMASTER, {
      sumKey: ["ENTRY_QTY", "CONFIRM_QTY", "INSPECT_QTY"]
    });

    $NC.G_VAR.SUM_ENTRY_QTY = summary.ENTRY_QTY;
    $NC.G_VAR.SUM_INSPECT_QTY = summary.INSPECT_QTY;
    $NC.G_VAR.SUM_CONFIRM_QTY = summary.CONFIRM_QTY;
    var TOTAL_INSPECT_QTY = summary.CONFIRM_QTY + summary.INSPECT_QTY;
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
    searchIndex = $NC.getGridSearchRow({
      searchKey: column_Nm,
      searchVal: scanVal
    });
  } else {
    // 상품코드, 상품바코드, 박스바코드, 케이스바코드에서 검색
    for (var i = 0, rowCount = G_GRDMASTER.data.getLength(); i < rowCount; i++) {
      rowData = G_GRDMASTER.data.getItem(i);
      if (rowData.ITEM_CD === scanVal || rowData.ITEM_BAR_CD === scanVal || rowData.BOX_BAR_CD === scanVal
          || rowData.CASE_BAR_CD === scanVal) {
        searchIndex = i;
        break;
      }
    }
  }

  if (searchIndex == -1) {
    return false;
  }

  $NC.setGridSelectRow(G_GRDMASTER, searchIndex);

  rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  // 컬럼 지정 검색(DB 검색 후)일 경우 스캔 바코드 값을 데이터에 입력
  if (!$NC.isNull(column_Nm)) {
    rowData[column_Nm] = scanVal;
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
  $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);
  $NC.setValue("#edtInspect_Qty", rowData.INSPECT_QTY);
}

function setOrderInfoValue(rowData) {

  // 전표정보 세팅
  if ($NC.isNull(rowData)) {
    rowData = {};
  }

  $NC.setValue("edtDelivery_Cd", rowData.DELIVERY_CD);
  $NC.setValue("edtDelivery_Nm", rowData.DELIVERY_NM);
  $NC.setValue("edtRDelivery_Cd", rowData.RDELIVERY_CD);
  $NC.setValue("edtRDelivery_Nm", rowData.RDELIVERY_NM);

  // $NC.setValue("edtOutbound_Date", rowData.OUTBOUND_DATE);
  $NC.setValue("edtOutbound_No", rowData.OUTBOUND_NO);
  $NC.setValue("edtInout_Nm", rowData.INOUT_NM);
  $NC.setValue("edtBu_No", rowData.BU_NO);
  $NC.setValue("edtRemark1", rowData.REMARK1);
}

function setProgressBar(val) {

  if ($NC.isNull(val)) {
    val = 0;
  }

  $NC.G_VAR.SUM_INSPECT_QTY = $NC.G_VAR.SUM_INSPECT_QTY + Number(val);
  var TOTAL_INSPECT_QTY = $NC.G_VAR.SUM_CONFIRM_QTY + $NC.G_VAR.SUM_INSPECT_QTY;
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