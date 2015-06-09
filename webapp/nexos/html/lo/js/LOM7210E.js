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
      LO460: ""
    },
    CARRIER_CD: "",
    BARCD_DATA_DIV: "-",
    NEWORDER_CHK: "",// 주문취소
    ORDERCAN_CHK: "",// 주문취소
    ORDERHOLD_CHK: "",
    SUM_ENTRY_QTY: 0,
    SUM_CONFIRM_QTY: 0,
    SUM_INSPECT_QTY: 0,
    ORDER_DIV: "",
    CANCEL_YN: "N",
    INSPECT_YN: "N",
    INSPECT_CHK: false,
    BOX_TYPE: null,
    lastProductCode: null,
    LAST_SCAN_TOTAL: null,
    LAST_SCAN_PICKING: null,
    LAST_SCAN_BOX: null,
    LAST_SCAN_PRODUCT: null,
    LAST_SCAN_QUANTITY: null,
    PICK_SEQ: null,
    isLabelScan: null,
    scan: null
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
    "minHeight": 560
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
  $("#btnQCarrier_Cd").click(showCarrierPopup);

  $("#btnDeliveryChange").click(onBtnDeliveryChange);
  $("#btnBoxComplete").click(onBtnBoxComplete);
  $("#btnBoxManage").click(onBtnBoxManage);
  // $("#btnFWScanConfirm").click(onBtnFWScanConfirm);
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

  setEnableButton("#btnBoxComplete", false);
  setEnableButton("#btnBoxManage", false);
  setEnableButton("#btnFWScanConfirm", false);
  setEnableButton("#btnBWScanConfirm", false);
  setEnableButton("#btnDeliveryChange", false);
  setEnableButton("#btnBoxCancel", false);

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

  // 조회조건 - 배송유형 세팅
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
    fullNameField: "CODE_CD_F",
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
  $NC.G_OFFSET.masterInfoMaxLine = 4;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $("#divBottomView").outerHeight(true)
      + $NC.G_LAYOUT.nonClientHeight - 1;
  $NC.G_OFFSET.subConditionHeight = $("#divSubConditionView").outerHeight();
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
  var resizeVal = Math.max(Math.min($NC.getTruncVal((clientHeight - 500) / 20) * 10, 100), 0);
  var resizeView = $("#edtBox_No");
  if (resizeVal != resizeView.data("resizeVal")) {
    resizeView.css({
      "height": 70 + resizeVal,
      //"font-size": 20 + resizeVal
      "font-size": 70
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
    resizeView.find("tr:gt(" + (resizeVal) + ")").hide();
    resizeView.data("resizeVal", resizeVal);

    $("#divMasterInfoExpender").hide();
  }

  // Grid 높이 조정
  $NC.resizeGrid("#grdMaster", detailViewWidth, clientHeight
      - ($NC.G_LAYOUT.header + $NC.G_LAYOUT.border1 + $NC.G_OFFSET.subConditionHeight));
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
 * 스캔검수 스캔방식
 * 1. 피킹라벨   : OPG1-5000-20150507-10001  (형식 및 자릿수 FIX)
 * 2. 용기번호   : YB0001      (형식 및 자릿수 FIX)
 * 3. 상품코드 : 10006662      (7자리, 8자리의 숫자)
 * 3. 상품바코드  : 887350132953      (상품코드와 동일하거나 88코드로 시작하는 숫자형 바코드)
 * 4. 수량입력   : 2       (7자리 이하의 숫자)

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
      var scanVal = $NC.getValue(view).toUpperCase() || $NC.G_VAR.lastProductCode
        ,scanType = scanValueType(scanVal);

      onScan(scanVal, scanType);
      e.stopImmediatePropagation();
      return false;
    }
  }
}

function scanValueType(scanVal) {
  if (scanVal.substr(0, 2) === 'TP') {
    return $NC.G_CONSTS.SCAN_TOTAL; // 0
  }
  if (scanVal.substr(0, 2) === 'OP') {
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

var CENTER_CD
  ,BU_CD
  ,OUTBOUND_DATE
  ,OUTBOUND_NO
  ,PICK_SEQ;

function onScan(scanVal, flag) {
  if (!scanVal) {
    scanVal = $NC.G_VAR.lastProductCode;
  }
  $NC.G_VAR.scan = scanVal;
  CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  BU_CD = $NC.getValue("#edtQBu_Cd");
  OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");

  if ($NC.isNull(CENTER_CD)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }

  if ($NC.isNull(BU_CD)) {
    showMessage({
      message: "사업구분 코드를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }

  if ($NC.isNull(OUTBOUND_DATE)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }

  // 0. 토탈피킹
  if (flag == $NC.G_CONSTS.SCAN_TOTAL) {
    var SCAN_DATA = scanVal.substr(2).split($NC.G_VAR.BARCD_DATA_DIV)
      ,SCAN_CENTER_CD = SCAN_DATA[0]
      ,SCAN_BU_CD = SCAN_DATA[1]
      ,SCAN_OUTBOUND_DATE = $NC.getDate(SCAN_DATA[2])
      ,SCAN_PICK_SEQ = SCAN_DATA[3];
    $NC.G_VAR.LAST_SCAN_TOTAL = scanVal;
    if (G_GRDMASTER.data.getLength() > 0 && $NC.G_VAR.INSPECT_YN === "N") {
      showMessage({
        message: "검수중인 상품이 있습니다. 계속 진행하시겠습니까?",
        onYesFn: function() {
          $NC.serviceCall("/LOM7210E/callBWScanConfirm.do", {
            P_QUERY_PARAMS: $NC.getParams({
              P_CENTER_CD: CENTER_CD,
              P_BU_CD: BU_CD,
              P_OUTBOUND_DATE: OUTBOUND_DATE,
              P_OUTBOUND_NO: OUTBOUND_NO,
              P_USER_ID: $NC.G_USERINFO.USER_ID
            })
          }, scanTotal, onError, null, 'LOM7210E_CANCEL');
        },
        onNoFn: function() {
          setFocusScan();
        }
      });
      return false;
    }

    if (!isWorkingScan()) {
      showMessage({
        message: "스캔한 정보가 상단의 조회조건 정보와 다릅니다. 계속 진행하시겠습니까?",
        onYesFn: function() {
          scanTotal();
        },
        onNoFn: function() {
          setFocusScan();
        }
      });
      return false;
    }
    // 피킹스캔실시
    function scanTotal() {
      // 초기화
      onChangingCondition();

      $NC.setValue("#cboQCenter_Cd", SCAN_CENTER_CD);
      $NC.setValue("#edtQBu_Cd", SCAN_BU_CD);
      $NC.setValue("#dtpQOutbound_Date", SCAN_OUTBOUND_DATE);
      
      $NC.G_VAR.PICK_SEQ = SCAN_PICK_SEQ;

      _Inquiry();
      setFocusScan();
    }
    scanTotal();
    return false;
  }
  // 1. 피킹라벨
  if (flag == $NC.G_CONSTS.SCAN_PICKING) {
    $NC.G_VAR.isLabelScan = $NC.G_CONSTS.SCAN_PICKING;
    $NC.G_VAR.LAST_SCAN_PICKING = scanVal;
    var SCAN_DATA = scanVal.substr(2).split($NC.G_VAR.BARCD_DATA_DIV)
      ,SCAN_CENTER_CD = SCAN_DATA[0]
      ,SCAN_BU_CD = SCAN_DATA[1]
      ,SCAN_OUTBOUND_DATE = $NC.getDate(SCAN_DATA[2])
      ,SCAN_PICK_SEQ = SCAN_DATA[3];
    
    if (G_GRDMASTER.data.getLength() > 0 && $NC.G_VAR.INSPECT_YN === "N") {
      showMessage({
        message: "검수중인 상품이 있습니다. 계속 진행하시겠습니까?",
        onYesFn: function() {
          $NC.serviceCall("/LOM7210E/callBWScanConfirm.do", {
            P_QUERY_PARAMS: $NC.getParams({
              P_CENTER_CD: CENTER_CD,
              P_BU_CD: BU_CD,
              P_OUTBOUND_DATE: OUTBOUND_DATE,
              P_OUTBOUND_NO: OUTBOUND_NO,
              P_USER_ID: $NC.G_USERINFO.USER_ID
            })
          }, scanPicking, onError, null, 'LOM7210E_CANCEL');
        },
        onNoFn: function() {
          setFocusScan();
        }
      });
      return false;
    }

    if (!isWorkingScan()) {
      showMessage({
        message: "스캔한 정보가 상단의 조회조건 정보와 다릅니다. 계속 진행하시겠습니까?",
        onYesFn: function() {
          scanPicking();
        },
        onNoFn: function() {
          setFocusScan();
        }
      });
      return false;
    }

    // 피킹스캔실시
    function scanPicking() {
      // 초기화
      onChangingCondition();

      $NC.setValue("#cboQCenter_Cd", SCAN_CENTER_CD);
      $NC.setValue("#edtQBu_Cd", SCAN_BU_CD);
      $NC.setValue("#dtpQOutbound_Date", SCAN_OUTBOUND_DATE);
      
      $NC.G_VAR.PICK_SEQ = SCAN_PICK_SEQ;

      //_Inquiry();
      G_GRDMASTER.queryParams = $NC.getParams({
        P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date"),
        P_PICK_SEQ: $NC.G_VAR.PICK_SEQ
      });

      G_GRDMASTER.queryId = "LOM7210E.RS_MASTER";
      $NC.serviceCall("/LOM7210E/getDataSet.do", 
        $NC.getGridParams(G_GRDMASTER), onGetMaster, onError, null, 'LOM7210E_RS_MASTER');

      setFocusScan();
    }
    scanPicking();
    return false;
  }
  
  // 2. 용기번호
  if (flag == $NC.G_CONSTS.SCAN_BOX) {
    $NC.G_VAR.isLabelScan = $NC.G_CONSTS.SCAN_BOX;
    $NC.G_VAR.LAST_SCAN_BOX = scanVal;
    if (G_GRDMASTER.data.getLength() > 0 && $NC.G_VAR.INSPECT_YN === "N") {
      showMessage({
        message: "검수중인 상품이 있습니다. 계속 진행하시겠습니까?",
        onYesFn: function() {
          $NC.serviceCall("/LOM7210E/callBWScanConfirm.do", {
            P_QUERY_PARAMS: $NC.getParams({
              P_CENTER_CD: CENTER_CD,
              P_BU_CD: BU_CD,
              P_OUTBOUND_DATE: OUTBOUND_DATE,
              P_OUTBOUND_NO: OUTBOUND_NO,
              P_USER_ID: $NC.G_USERINFO.USER_ID
            })
          }, scanBox, onError, null, 'LOM7210E_CANCEL');
        },
        onNoFn: function() {
          setFocusScan();
        }
      });
    } else {
      scanBox();
    }
    function scanBox() {
      // 초기화
      onChangingCondition();
      $NC.G_VAR.lastProductCode = scanVal;
      $NC.serviceCallAndWait("/LOM7210E/getDataSet.do", {
          P_QUERY_ID: "LOM7210E.RS_MASTER1",
          P_QUERY_PARAMS: $NC.getParams({
            P_CENTER_CD: CENTER_CD,
            P_BU_CD: BU_CD,
            P_OUTBOUND_DATE: OUTBOUND_DATE,
            P_PICK_BOX_NO: $NC.G_VAR.scan
          })
        }, onGetMaster, onError, null, 'LOM7210E_BOX_SCAN');
      setFocusScan();
    }
    return false;
  }
  
  // 3. 상품코드
  if (flag == $NC.G_CONSTS.SCAN_PRODUCT) {
    $NC.G_VAR.LAST_SCAN_PRODUCT = scanVal;
    // 스캔 가능여부 체크
    if (!onValidateScan(false)) {
      return false;
    }
    OUTBOUND_NO = $NC.getValue("#edtQOutbound_No");
    if ($NC.isNull(OUTBOUND_NO)) {
      showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
      return;
    }
    $NC.serviceCallAndWait("/LOM7210E/callSP.do", {
      P_QUERY_ID: "LOM7210E.GET_ITEM_INFO",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_OUTBOUND_NO: OUTBOUND_NO,
        P_ITEM_BAR_CD: $NC.G_VAR.scan
      })
    }, onGetItemInfo, onError, null, 'LOM7210E_PRODUCT');
    return false;
  }

  // 4. 수량입력
  if (flag == $NC.G_CONSTS.SCAN_QUANTITY) {
    $NC.G_VAR.LAST_SCAN_QUANTITY = scanVal;
    // 스캔 가능여부 체크
    if (!onValidateScan(true)) {
      return false;
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

    var scanLen = $NC.G_VAR.scan.length;
    // / Key 입력은 수량 전체 검수
    if (scanLen == 0) {
      ITEM_QTY = ENTRY_QTY - CONFIRM_QTY - INSPECT_QTY;
    } else {
      // 숫자 + / Key 입력은 검수수량을 입력 값으로 변경
      INSPECT_QTY = 0;
      ITEM_QTY = Number($NC.G_VAR.scan);
    }

    if (isNaN(ITEM_QTY)) {
      showMessage("수량을 정확히 입력하십시오.");
      return;
    }

    if (ENTRY_QTY < INSPECT_QTY + CONFIRM_QTY + ITEM_QTY) {
      showMessage("등록수량을 초과해서 검수할 수 없습니다.\n\n수량을 다시 입력하십시오.");
      return;
    }
    var policyVal460 = parseInt($NC.G_VAR.policyVal.LO460, 10);
    if (ENTRY_QTY <= policyVal460) {
      showMessage("유효하지 않은 상품바코드 입니다.");
      return false;
    }

    rowData.INSPECT_QTY = INSPECT_QTY + ITEM_QTY;
    rowData.REMAIN_QTY = ENTRY_QTY - CONFIRM_QTY - INSPECT_QTY - ITEM_QTY;
    $NC.setValue("#edtInspect_Qty", rowData.INSPECT_QTY);

    if (rowData.CRUD === "R") {
      rowData.CRUD = "U";
    }
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
    G_GRDMASTER.lastRowModified = true;

    setProgressBar(rowData.INSPECT_QTY - ORG_INSPECT_QTY);
    // 자동완료 = 1 , 수동완료=0
    _Save(ITEM_QTY, "1");
    return false;
  }
  // 5. 오류
  if (flag == $NC.G_CONSTS.SCAN_ERROR) {
    alert('정상적인 SCAN 값이 아닙니다.\n라벨번호, 용기번호, 상품바코드를 스캔하세요.');
    return false;
  }

  // 스캔데이터와 현재 조건 비교
  function isWorkingScan() {
    if (SCAN_CENTER_CD == CENTER_CD && 
      SCAN_BU_CD == BU_CD && 
      SCAN_OUTBOUND_DATE == OUTBOUND_DATE
      ) {
        return true;
    }
    return false;
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
    return false;
    break;
  case "DELIVERY_TYPE":
    return false;
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
  $NC.G_VAR.NEWORDER_CHK = "N";
  $NC.G_VAR.ORDERCAN_CHK = "N";
  $NC.G_VAR.ORDERHOLD_CHK = "N";
  $NC.G_VAR.INSPECT_CHK = false;
  $NC.G_VAR.BOX_TYPE = "";
  $NC.G_VAR.lastProductCode = "";

  $NC.setEnable("#cboQCenter_Cd");
  $NC.setEnable("#edtQBu_Cd");
  $NC.setEnable("#btnQBu_Cd");
  $NC.setEnable("#edtQOrder_Date");
  $NC.setEnable("#edtQOrder_No");
  $NC.setEnable("#dtpQOutbound_Date");
  //$NC.setEnable("#edtQPick_Seq");
  $NC.setValue("#edtQOutbound_No");
  //$NC.setValue("#edtQPick_Seq");

  setOrderInfoValue();
  setItemInfoValue();

  $NC.setValue("#edtBox_No");

  $NC.setValue("#divProgressVal", "0 / 0 [ 0 %]");
  $("#divProgressbar").progressbar("value", 0);

  setEnableButton("#btnBoxComplete", false);
  setEnableButton("#btnBoxManage", false);
  setEnableButton("#btnFWScanConfirm", false);
  setEnableButton("#btnBWScanConfirm", true);
  setEnableButton("#btnDeliveryChange", false);
  
  setFocusScan();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  BU_CD = $NC.getValue("#edtQBu_Cd");
  OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(CENTER_CD)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }

  if ($NC.isNull(BU_CD)) {
    showMessage({
      message: "사업구분 코드를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }

  if ($NC.isNull(OUTBOUND_DATE)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }

  // OPG1 : master //1
  // 용기번호 : master1 //2
  if ($NC.G_VAR.isLabelScan == $NC.G_CONSTS.SCAN_PICKING) { //1
    PICK_SEQ = $NC.G_VAR.PICK_SEQ;
    G_GRDMASTER.queryId = "LOM7210E.RS_MASTER";
    G_GRDMASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_PICK_SEQ: PICK_SEQ
    });
    mockId = 'LOM7210E_RS_MASTER';
  } else if ($NC.G_VAR.isLabelScan == $NC.G_CONSTS.SCAN_BOX) {  //2
    G_GRDMASTER.queryId = "LOM7210E.RS_MASTER1";
    G_GRDMASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_PICK_BOX_NO: $NC.G_VAR.LAST_SCAN_BOX
    });
    mockId = 'LOM7210E_RS_MASTER1';
  }
  
  $NC.serviceCall("/LOM7210E/getDataSet.do", 
    $NC.getGridParams(G_GRDMASTER), onGetMaster, onError, null, mockId);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */

function _Save(ITEM_QTY, procType) {

  CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(CENTER_CD)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }

  if ($NC.isNull(BU_CD)) {
    showMessage({
      message: "사업구분 코드를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
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

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (procType === "1") {
    // 상품코드 검수후 저장
    $NC.serviceCall("/LOM7210E/callScanBoxSave.do", {
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_ITEM_CD: rowData.ITEM_CD,
        P_CARRIER_CD: CARRIER_CD,
        P_SCAN_QTY: ITEM_QTY,
        P_BOX_TYPE: "01",
        P_PROC_TYPE: procType,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      })
    }, onSave, onError, null, 'LOM7210E_SAVE1');
  } else if (procType === "2") {
    // 박스완료후 저장
    $NC.serviceCall("/LOM7210E/callScanBoxComplete.do", {
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_OUTBOUND_NO: rowData.OUTBOUND_NO,
        P_ITEM_CD: rowData.ITEM_CD,
        P_CARRIER_CD: CARRIER_CD,
        P_SCAN_QTY: ITEM_QTY,
        P_BOX_TYPE: "01",
        P_PROC_TYPE: procType,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      })
    }, onSave, onError, null, 'LOM7210E_SAVE2');
  }

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
    selectKey: new Array("BRAND_CD", "OUTBOUND_DATE", "LINE_NO", "ITEM_CD"),
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

function grdMasterInitialize() {

  var options = {
    //frozenColumn: 3,
    rowHeight: 32,
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.INSPECT_YN === "Y") {
          return "specialrow3";
        }
        if (rowData.REMAIN_QTY == 0) {
          return "specialrow4";
        }
        if (rowData.INSPECT_QTY == rowData.ENTRY_QTY) {
          return "specialrow4";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LOM7210E.RS_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 230
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
  /*$NC.setGridColumn(columns, {
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "현검수수량",
    minWidth: 85,
    cssClass: "align-right"
  });*/
  $NC.setGridColumn(columns, {
    id: "REMAIN_QTY",
    field: "REMAIN_QTY",
    name: "미검수수량",
    minWidth: 85,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_BAR_CD",
    field: "ITEM_BAR_CD",
    name: "상품바코드",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
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

  _Save(0, "2");
  $NC.showMessage('박스 완료했습니다.');
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


  CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  BU_CD = $NC.getValue("#edtQBu_Cd");
  OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  OUTBOUND_NO = $NC.getValue("#edtQOutbound_No");

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  
  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LOM7211P",
    PROGRAM_NM: "박스관리",
    url: "lo/LOM7211P.html",
    width: 870,
    height: 450,
    userData: {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: OUTBOUND_NO,
      //P_CARRIER_CD: $NC.G_VAR.CARRIER_CD,
      P_CARRIER_CD: rowData.DELIVERY_TYPE,
      P_POLICY_LO450: $NC.G_VAR.policyVal.LO450,
      P_INSPECT_YN: $NC.G_VAR.INSPECT_YN === "Y" ? false : true,
      P_CARD_MSG_YN: $NC.isNull($NC.getValue("#edtCard_Msg")) === true ? false : true,
      P_PICK_BOX_NO: $NC.G_VAR.LAST_SCAN_BOX,
      P_PICK_SEQ: $NC.G_VAR.PICK_SEQ,
      P_ISLABELSCAN:$NC.G_VAR.isLabelScan
    },
    onCancel: function() {
      if ($NC.G_VAR.INSPECT_YN == "Y") {
        return;
      }
      var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
        selectKey: new Array("BRAND_CD", "OUTBOUND_DATE", "ITEM_CD"),
      });

      _Inquiry();

      G_GRDMASTER.lastKeyVal = lastKeyVal;
    }
  });

}

/**
 * 검수완료 버튼 리스너
 */
function onBtnFWScanConfirm(e) {

  if (e != undefined && $(e.target).hasClass("disabled")) {
    return;
  }
  completeScan();
}

/**
 * 검수완료 
 */
function completeScan() {
  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }

  if ($NC.G_VAR.SUM_INSPECT_QTY > 0 && $NC.G_VAR.SCANCOMPLETE) {
    showMessage("박스완료하지 않은 검수내역이 존재합니다.\n\n박스완료 후 검수완료 처리하십시오.");
    return;
  }

  CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  BU_CD = $NC.getValue("#edtQBu_Cd");
  OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  OUTBOUND_NO = $NC.getValue("#edtQOutbound_No");
  if ($NC.isNull(CENTER_CD)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }

  if ($NC.isNull(BU_CD)) {
    showMessage({
      message: "사업구분 코드를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }

  if ($NC.isNull(OUTBOUND_DATE)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }

  if ($NC.isNull(OUTBOUND_NO)) {
    showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }

  var message = "";
  if ($NC.G_VAR.SUM_ENTRY_QTY > $NC.G_VAR.SUM_CONFIRM_QTY + $NC.G_VAR.SUM_INSPECT_QTY) {
    message = "미검수 상품이 존재합니다.\n\n검수완료 처리하시겠습니까?";
  }
  // message += "검수완료 처리하시겠습니까?";

  if (message == "" || message == undefined) {

    // 검수수량이 100%일 경우 메세지없이 검수완료
    $NC.serviceCall("/LOM7210E/callFWScanConfirm.do", {
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
        $NC.serviceCall("/LOM7210E/callFWScanConfirm.do", {
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
}

function onBtnDeliveryChange(e) {

  if ($(e.target).hasClass("disabled")) {
    return;
  }

  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  var DIRECTION_INVNO = $NC.getValue("#cboQDelivery_Type");

  if (rowData.DELIVERY_TYPE == DIRECTION_INVNO) {
    alert("동일한 배송유형으로 변경 처리하실 수 없습니다");
    setFocusScan();
    return;
  }

  showMessage({
    message: "배송유형변경 처리하시겠습니까?",
    onYesFn: function() {

      // 데이터 조회
      $NC.serviceCall("/LOM7210E/callSP.do", {
        P_QUERY_ID: "LO_FW_DIRECTIONS_INVNO_PROC2",
        P_QUERY_PARAMS: $NC.getParams({
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_OUTBOUND_NO: rowData.OUTBOUND_NO,
          P_WB_NO: rowData.WB_NO,
          P_DIRECTION_INVNO: DIRECTION_INVNO,
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

function onBtnBWScanConfirm(e) {

  if ($(e.target).hasClass("disabled")) {
    return;
  }

  if (G_GRDMASTER.data.getLength() == 0) {
    setFocusScan();
    return;
  }

  CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  BU_CD = $NC.getValue("#edtQBu_Cd");
  OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  OUTBOUND_NO = $NC.getValue("#edtQOutbound_No");
  if ($NC.isNull(CENTER_CD)) {
    showMessage({
      message: "물류센터를 선택하십시오.",
      focusSelector: "#cboQCenter_Cd"
    });
    return;
  }

  if ($NC.isNull(BU_CD)) {
    showMessage({
      message: "사업구분 코드를 입력하십시오.",
      focusSelector: "#edtQBu_Cd"
    });
    return;
  }

  if ($NC.isNull(OUTBOUND_DATE)) {
    showMessage({
      message: "출고일자를 입력하십시오.",
      focusSelector: "#dtpQOutbound_Date"
    });
    return;
  }

  if ($NC.isNull(OUTBOUND_NO)) {
    showMessage("출고번호를 확인할 수 없습니다.\n\n전표를 다시 스캔하십시오.");
    return;
  }

  showMessage({
    message: "검수취소 처리하시겠습니까?",
    onYesFn: function() {
      // 데이터 조회
      $NC.serviceCall("/LOM7210E/callBWScanConfirm.do", {
        P_QUERY_PARAMS: $NC.getParams({
          P_CENTER_CD: CENTER_CD,
          P_BU_CD: BU_CD,
          P_OUTBOUND_DATE: OUTBOUND_DATE,
          P_OUTBOUND_NO: OUTBOUND_NO,
          P_USER_ID: $NC.G_USERINFO.USER_ID
        })
      }, onBWScanConfirm, onError, null, 'LOM7210E_CANCEL');
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
          $NC.serviceCall("/LOM7210E/callBWScanConfirm.do", {
            P_QUERY_PARAMS: $NC.getParams({
              P_CENTER_CD: CENTER_CD,
              P_BU_CD: BU_CD,
              P_OUTBOUND_DATE: OUTBOUND_DATE,
              P_OUTBOUND_NO: OUTBOUND_NO,
              P_USER_ID: $NC.G_USERINFO.USER_ID
            })
          }, processFn, onError, null, 'LOM7210E_CANCEL');
        },
        onNoFn: function() {
          setFocusScan();
        }
      });
    }
    return;
  }
  setFocusScan();
  $NC.showMessage('초기화 되었습니다.');
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {

    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["BRAND_CD", "OUTBOUND_DATE", "LINE_NO", "ITEM_CD"],
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
    showMessage("일반/혼합주문이 아니거나 유효하지 않은 전표입니다.\n대물주문은 출고대물검수에서 작업하세요.");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(0);
  setOrderInfoValue(rowData);
  onCalcSummary();

  // 검수완료,합포장대상,주문취소 체크
  $NC.G_VAR.INSPECT_YN = rowData.INSPECT_YN;// 검수완료
  $NC.G_VAR.NEWORDER_CHK = rowData.ORDER_CHK;// 추가주문 체크
  $NC.G_VAR.ORDERCAN_CHK = rowData.ORDER_CAN;// 주문취소
  $NC.G_VAR.ORDERHOLD_CHK = rowData.ORDER_HOLD;// 주문보류
  
  // 주문취소
  if ($NC.G_VAR.ORDERCAN_CHK == "Y") {
    if (rowData.ORDER_DIV == "2") {
      alert("합포장 주문에 주문취소 건이 포함되어있습니다.\n\n 피킹라벨과 상품을 함께 사무실로 인계바랍니다.");
    } else {
      alert("주문취소 건입니다.\n\n 피킹라벨과 상품을 함께 사무실로 인계바랍니다.");
    }
    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxManage", false);
    setEnableButton("#btnFWScanConfirm", false);
    setEnableButton("#btnBWScanConfirm", false);
    setEnableButton("#btnDeliveryChange", false);
    setEnableButton("#btnBoxCancel", false);
    $NC.setValue("#edtBox_No", "주문취소");
    $("#edtBox_No").addClass("inspected");
    setUpdateOrderCan(rowData.CENTER_CD, rowData.BU_CD, rowData.OUTBOUND_DATE, rowData.OUTBOUND_NO);
    return;
    // 주문보류
  } else if ($NC.G_VAR.ORDERHOLD_CHK == "Y") {
    alert("주문보류 처리된 전표입니다.\n\n [주문보류관리] 화면에서 해당전표를 확인해 주시기 바랍니다.");
    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxManage", false);
    setEnableButton("#btnFWScanConfirm", false);
    setEnableButton("#btnBWScanConfirm", false);
    setEnableButton("#btnDeliveryChange", false);
    setEnableButton("#btnBoxCancel", false);
    $NC.setValue("#edtBox_No", "주문보류");
    $("#edtBox_No").addClass("inspected");
    return;
    // 검수완료
  } else if ($NC.G_VAR.INSPECT_YN == "Y") {
    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxManage", true);
    setEnableButton("#btnFWScanConfirm", false);
    // setEnableButton("#btnBWScanConfirm", $NC.getProgramPermission().canConfirmCancel);
    setEnableButton("#btnBWScanConfirm", false);
    setEnableButton("#btnDeliveryChange", true);
    setEnableButton("#btnBoxCancel", true);
    var invCnt = '(' + rowData.INV_CNT + ')';
    $NC.setValue("#edtBox_No", "검수완료" + invCnt);
    $("#edtBox_No").addClass("inspected");
    return;
    // 추가주문
  } else if ($NC.G_VAR.NEWORDER_CHK == "Y") {
    alert("합포장대상 전표입니다.\n\n 동일한 수령자의 다른 주문전표를 확인해 주시기 바랍니다.");
    setEnableButton("#btnBoxComplete", false);
    setEnableButton("#btnBoxManage", false);
    setEnableButton("#btnFWScanConfirm", false);
    setEnableButton("#btnBWScanConfirm", false);
    setEnableButton("#btnDeliveryChange", false);
    setEnableButton("#btnBoxCancel", false);
    $NC.setValue("#edtBox_No", "합포장대상 ");
    $("#edtBox_No").addClass("inspected");
    return;
  } else {
    $NC.setValue("#edtBox_No", rowData.BOX_NO);
    $("#edtBox_No").removeClass("inspected");
  }

  setEnableButton("#btnBoxComplete", true);
  setEnableButton("#btnBoxManage", true);
  setEnableButton("#btnFWScanConfirm", false);
  // setEnableButton("#btnFWScanConfirm", true);
  setEnableButton("#btnBWScanConfirm", true);
  setEnableButton("#btnDeliveryChange", false);
  setEnableButton("#btnBoxCancel", true);
  setFocusScan();
}

function doPrint1() {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  var checkedValueDS = [ ];

  checkedValueDS.push($NC.getValue("#edtBox_No"));

  // 택배송장출력
  //if ($NC.G_VAR.CARRIER_CD == '0020') {
  if (rowData.DELIVERY_TYPE == '1') {

    // 출력 호출
    $NC.G_MAIN.silentPrint({
      printParams: [{
        //reportDoc: "lo/LABEL_LOM08",
        reportDoc: "lo/LABEL_LOM08_NEW",
        queryId: "WR.RS_LABEL_LOM03_A",
        queryParams: {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_PICK_SEQ: rowData.PICK_SEQ
        },
        iFrameNo: 1,
        checkedValue: checkedValueDS.toString(),
        silentPrinterName: $NC.G_USERINFO.PRINT_WB_NO,
        internalQueryYn: "N"
      }],
      onAfterPrint: function() {
        // if(rowData.SHIP_TYPE !== "1"){
        // alert("[" + rowData.SHIP_TYPE_D + "] 상품입니다.\n\n 포장 후 사무실로 전달바랍니다.");
        // }
        setFocusScan();
      }
    });
  } else {

    // 출력 호출
    $NC.G_MAIN.silentPrint({
      printParams: [{
        //reportDoc: "lo/LABEL_LOM08",
        reportDoc: "lo/LABEL_LOM08_NEW",
        queryId: "WR.RS_LABEL_LOM02_A",
        queryParams: {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_PICK_SEQ: rowData.PICK_SEQ
        },
        iFrameNo: 1,
        checkedValue: '1',// checkedValueDS.toString(),
        silentPrinterName: $NC.G_USERINFO.PRINT_WB_NO,
        internalQueryYn: "N"
      }],
      onAfterPrint: function() {
        setFocusScan();
      }
    });

  }
}

function onSave(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      showMessage(resultData.O_MSG);
      return;
    }
    //onScanItem(undefined, 'BOX');
    if (resultData.O_RESULT == "Y") {
      doPrint1();
    }
  }
  onCalcSummary();
  if (checkScanCompleteAll()) {
    //onScanItem(undefined, 'BOX');
  }
  _Cancel();
  
  setFocusScan();
}

/**
 * 모든 상품이 검수완료인지 체크
 */
function checkScanCompleteAll() {
  var items = G_GRDMASTER.data.getItems();
  for (var i in items) {
    if (items[i].INSPECT_QTY != items[i].ENTRY_QTY) {
      return false;
    }
  }
  return true;
}

function onBoxComplete(ajaxData) {

  if ($NC.G_VAR.INSPECT_CHK) {
    onBtnFWScanConfirm();
  } else {
    doPrint1();

    _Cancel();
  }

}

function onFWScanConfirm(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      showMessage(resultData.O_MSG);
      return;
    }
  }
  doPrint1();

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

function onDeliveryChangeSucess(ajaxData) {

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

  if ($NC.G_VAR.SUM_ENTRY_QTY === $NC.G_VAR.SUM_CONFIRM_QTY + $NC.G_VAR.SUM_INSPECT_QTY) {
    $NC.G_VAR.SCANCOMPLETE = false;
    $NC.G_VAR.INSPECT_CHK = true;
    if (!$NC.isNull($NC.G_USERINFO.PRINT_WB_NO) && !$NC.isNull($NC.G_USERINFO.PRINT_LO_BILL)
        && !$NC.isNull($NC.G_USERINFO.PRINT_CARD)) {

    } else {
      alert("설정한 프린터가 없습니다.\n\n자동출력프린터를 먼저 등록하십시오.");
      return;
    }
    return;
  }

  $NC.G_VAR.SCANCOMPLETE = true;
  $NC.G_VAR.INSPECT_CHK = false;
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
  $NC.G_VAR.policyVal.LO460 = "";

  CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  BU_CD = $NC.getValue("#edtQBu_Cd");

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCallAndWait("/LOM7210E/callSP.do", {
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

function onValidateScan(isQty) {

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

  onScanItemCounting(resultData.O_ITEM_CD, resultData.O_COLUMN_NM, resultData.O_ITEM_CD);
}

/**
 * 그리드 해당 행 선택
 * 
 * @param ajaxData
 */
function onScanItemCounting(scanVal, column_Nm, item_Cd) {

  var searchIndex = [ ];
  var rowData;
  var completeInspect = false;

  // 컬럼 지정 검색(DB 검색 후)
  if (!$NC.isNull(column_Nm)) {
    searchIndex = $NC.getGridSearchRows(G_GRDMASTER, {
      searchKey: column_Nm,
      searchVal: scanVal
    });
  } else {
    // 상품코드, 상품바코드, 박스바코드, 케이스바코드에서 검색
    for (var i = 0, rowCount = G_GRDMASTER.data.getLength(); i < rowCount; i++) {
      rowData = G_GRDMASTER.data.getItem(i);
      if (rowData.REMAIN_QTY > "0") {
        if ((rowData.ITEM_CD === scanVal || rowData.ITEM_BAR_CD === scanVal || rowData.BOX_BAR_CD === scanVal || rowData.CASE_BAR_CD === scanVal)
            && rowData.ENTRY_QTY !== rowData.CONFIRM_QTY) {
          searchIndex = i;
          break;
        }
      }
    }
  }

  if (searchIndex.length == 0) {
    showMessage("검수가 완료되었거나 전표에 존재하지 않는 상품입니다. \n\n다른 상품을 스캔하십시오.");
    return false;
  }

  for (var i in searchIndex) {
    $NC.setGridSelectRow(G_GRDMASTER, searchIndex[i]);
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
      completeInspect = true;
    } else {
      completeInspect = false;
      break;
    }
  }

  if (completeInspect) {
    showMessage("검수가 완료된 상품입니다. 다른 상품을 스캔하십시오.");
    return true;
  }

  rowData.INSPECT_QTY++;
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  $NC.setValue("#edtConfirm_Qty", rowData.CONFIRM_QTY);
  $NC.setValue("#edtInspect_Qty", rowData.INSPECT_QTY);
  // 자동완료 = 1 , 수동완료=0
  _Save(ITEM_QTY, "1");

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

/**
 * 주문취소 ERROR_DIV 업데이트
 */
function setUpdateOrderCan(center_Cd, bu_Cd, outbound_Date, outbound_No) {

  $NC.serviceCallAndWait("/LOM7210E/callSP.do", {
    P_QUERY_ID: "LOM7210E.SET_ERLOSTATUS_INFO",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: center_Cd,
      P_BU_CD: bu_Cd,
      P_OUTBOUND_DATE: outbound_Date,
      P_OUTBOUND_NO: outbound_No
    })
  }, onGetUpdateOrderCan, onError);
}

/**
 * 주문취소 ERROR_DIV 업데이트 후 처리
 * 
 * @param ajaxData
 */
function onGetUpdateOrderCan(ajaxData) {

  var resultData = $NC.toArray(ajaxData.data);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
    }
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
  $NC.setValue("#edtOutbound_No", rowData.OUTBOUND_NO);
  $NC.setValue("#edtQOutbound_No", rowData.OUTBOUND_NO);
  $NC.setValue("#edtBu_No", rowData.BU_NO);
  if (rowData.DELIVERY_TYPE == "1") {
    $NC.G_VAR.CARRIER_CD = "0020";
  } else {
    $NC.G_VAR.CARRIER_CD = "0010";
  }
}

function setOrderInfoValue(rowData) {

  // 전표정보 세팅
  if ($NC.isNull(rowData)) {
    rowData = {};
  }

  $NC.setValue("#edtOrderer_Nm", rowData.ORDERER_NM);
  $NC.setValue("#chkGift_Wrap_Yn", rowData.GIFT_WRAP_YN);
  $NC.setValue("#edtCard_From", rowData.BU_KEY);
  $NC.setValue("#edtCard_To", rowData.CARD_TO);
  $NC.setValue("#edtCard_Msg", rowData.CARD_MSG);
  $NC.setValue("#edtOrderer_Msg", rowData.ORDERER_MSG);
  $NC.setValue("#edtDelivery_Type", rowData.DELIVERY_TYPE_D);
  $NC.setValue("#edtShip_Type", rowData.SHIP_TYPE_D);

  $NC.setValue("edtOutbound_No", rowData.OUTBOUND_NO);
  $NC.setValue("edtOutbound_Type", rowData.ORDER_DIV_NM);
  $NC.setValue("edtInout_Nm", rowData.INOUT_NM);
  $NC.setValue("edtBu_No", rowData.BU_NO);
  $NC.setValue("#edtRemark1", rowData.REMARK1);

  if (rowData.SHIP_TYPE !== "1" && !$NC.isNull(rowData.SHIP_TYPE) && rowData.INSPECT_YN == 'N') {
    alert("[" + rowData.SHIP_TYPE_D + "] 상품입니다.\n\n 포장 후 사무실로 전달바랍니다.");
    setFocusScan();
  }
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
  _Inquiry();
}
