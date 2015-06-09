/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 현재 액티브된 뷰 정보
    activeView: {
      container: "",
      PROCESS_CD: ""
    },
    // 체크할 정책 값
    policyVal: {
      LO190: "", // 공급금액 계산 정책
      LO210: "", // 출고등록 전표생성 가능여부
      LO221: "NN", // 예정으로 등록시 추가/삭제 허용 기준
      LO250: "", // 유통기한/제조배치번호 지정 정책
      LO410: "", // 출고확정 수량 수정 가능여부
      LO510: "",//출고배송 수량 수정 가능여부
    },
    // 프로세스별 확정/취소 처리가능 진행상태
    // 0: A, 1: B, 2 : C, 3 : D, 4: E
    stateFWBW: {
      A: {
        CONFIRM: "",
        CANCEL: ""
      },
      B: {
        CONFIRM: "",
        CANCEL: ""
      },
      C: {
        CONFIRM: "",
        CANCEL: ""
      },
      D: {
        CONFIRM: "",
        CANCEL: ""
      },
      E: {
        CONFIRM: "",
        CANCEL: ""
      }
    },
    onStockInfoViewTimeout: null
  });

  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();

  // 프로세스 버튼 클릭 이벤트 연결
  $("#divMasterInfoView input[type=button]").bind("click", function(e) {
    var view = $(this);
    onSubViewChange(e, view);
  });

  $("#btnQBu_Cd").click(showUserBuPopup);
//  $("#btnQBrand_Cd").click(showBuBrandPopup);
  $("#btnQOwn_Brand_Cd").click(showOwnBranPopup);
  $("#btnQDelivery_Cd").click(showDeliveryPopup);
  $("#btnQRDelivery_Cd").click(showRDeliveryPopup);

  // 초기화 및 초기갑 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $NC.setValue("#edtQBu_No");
  $NC.setValue("#edtQItem_Cd");
  $NC.setValue("#edtQItem_Nm");
//  $NC.setValue("#chkQState_Pre_Yn", "Y");
//  $NC.setValue("#chkQState_Cur_Yn", "Y");

  $NC.setValue("#edtQDelivery_Cd");
  $NC.setValue("#edtQDelivery_Nm");
  $NC.setValue("#edtQRDelivery_Cd");
  $NC.setValue("#edtQRDelivery_Nm");

  $NC.setInitDatePicker("#dtpQOutbound_Date");
  $NC.setInitDatePicker("#dtpOutbound_DateBT");
  $NC.setInitDatePicker("#dtpOutbound_DateB");
  $NC.setInitDatePicker("#dtpQOrder_Date1");
  $NC.setInitDatePicker("#dtpQOrder_Date2");

  $NC.setValue("#dtpQOrder_Date1", $NC.addDay($NC.getValue("#dtpQOrder_Date1"), -3));

  // 출고지시 화면의 출고차수 새로고침
  $("#btnQOutbound_BatchC").click(function() {
    setOutboundBatchCombo("#cboQOutbound_BatchC", false);
  });
  // 출고지시 화면(입력용)의 출고차수 새로고침
  $("#btnOutbound_BatchC").click(function() {
    setOutboundBatchCombo("#cboOutbound_BatchC", false);
  });
  // 출고확정의 출고차수 새로고침
  $("#btnQOutbound_BatchD").click(function() {
    // 출고차수 콤보 값 설정
    setOutboundBatchCombo("#cboQOutbound_BatchD", true);
  });
  // 출고등록(개별) 화면의 배송차수 새로고침
  $("#btnDelivery_BatchB").click(function() {
    setDeliveryBatchCombo("B");
  });
  // 출고등록(일괄) 화면의 배송차수 새로고침
  $("#btnDelivery_BatchBT").click(function() {
    setDeliveryBatchCombo("BT");
  });
  $("#btnStockView").click(showStockOverlay); // 출고대기량 조회 버튼 클릭

  // 출고확정/취소 버튼 권한 체크 및 클릭 이벤트 연결
  setUserProgramPermission();

  // 조회조건 - 출고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "D1",
      P_SUB_CD2: "D2"
    })
  }, {
    selector: "#cboQInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });

  // 조회조건 - 물류센터 초기화
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
      // ※ 조회 조건이 모두 세팅이 되는 시점
      setTimeout(function() {
        // 출고차수 콤보 값 설정
        setOutboundBatchCombo("#cboQOutbound_BatchC", false);
        setOutboundBatchCombo("#cboOutbound_BatchC", false);
        setOutboundBatchCombo("#cboQOutbound_BatchD", true);

        // 배송차수 콤보 값 설정
        setDeliveryBatchCombo("B");
        setDeliveryBatchCombo("BT");

        // 출고전표/수량 정보 세팅, 프로세스 정보
        setMasterSummaryInfo();
        setPolicyValInfo();
        setProcessStateInfo();
        setMasterProcessInfo();
      }, 300);
    }
  });

  // 그리드 초기화 - 출고등록
  grdMasterBInitialize();
  grdDetailBInitialize();

  grdMasterBTInitialize();
  grdDetailBTInitialize();
  grdStockMasterInitialize();

  // 그리드 초기화 - 출고지시
  grdMasterCInitialize();
  grdDetailCInitialize();

  // 그리드 초기화 - 출고확정
  grdMasterDInitialize();
  grdDetailDInitialize();
  grdSubDInitialize();

  // 그리드 초기화 - 배송완료
  grdMasterEInitialize();
  grdDetailEInitialize();

}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.leftViewWidth = 500;
  $NC.G_OFFSET.stockMasterViewWidth = 650;
  $NC.G_OFFSET.outboundInfoViewWidth = 220;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.masterInfoViewHeight = $("#divMasterInfoView").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  // 출고단계
  clientHeight -= $NC.G_OFFSET.masterInfoViewHeight;

  var container;
  var splitter;
  // 출고등록
  if ($NC.G_VAR.activeView.PROCESS_CD === "B") {
    container = $($NC.G_VAR.activeView.container);
    $NC.resizeContainer(container, clientWidth, clientHeight);

    clientHeight -= $NC.G_OFFSET.subConditionViewHeight;
    // Splitter 컨테이너 크기 조정
    container = $("#divSplitterB");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdMasterB").parent();
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterB", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#grdDetailB").parent();
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdDetailB", container.width(), container.height() - $NC.G_LAYOUT.header);

    return;
  }

  // 출고등록(일괄)
  if ($NC.G_VAR.activeView.PROCESS_CD === "BT") {
    container = $($NC.G_VAR.activeView.container);
    $NC.resizeContainer(container, clientWidth, clientHeight);

    clientHeight -= $NC.G_OFFSET.subConditionViewHeight;
    container = $("#divOutboundInfoView");
    $NC.resizeContainer(container, $NC.G_OFFSET.outboundInfoViewWidth, clientHeight);

    // Splitter 컨테이너 크기 조정
    container = $("#divSplitterBT");
    $NC.resizeContainer(container, clientWidth - $NC.G_OFFSET.outboundInfoViewWidth - $NC.G_LAYOUT.margin1
        - $NC.G_LAYOUT.border1, clientHeight);

    container = $("#grdMasterBT").parent();
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterBT", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#grdDetailBT").parent();
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdDetailBT", container.width(), container.height() - $NC.G_LAYOUT.header);

    return;
  }

  // 출고지시
  if ($NC.G_VAR.activeView.PROCESS_CD === "C") {
    container = $($NC.G_VAR.activeView.container);
    $NC.resizeContainer(container, clientWidth, clientHeight);

    clientHeight -= $NC.G_OFFSET.subConditionViewHeight;
    // Splitter 컨테이너 크기 조정
    container = $("#divSplitterC");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdMasterC").parent();
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterC", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#grdDetailC").parent();
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdDetailC", container.width(), container.height() - $NC.G_LAYOUT.header);

    return;
  }

  // 출고확정
  if ($NC.G_VAR.activeView.PROCESS_CD === "D") {
    // Splitter 컨테이너 크기 조정
    container = $($NC.G_VAR.activeView.container);
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdMasterD").parent();
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterD", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#divSplitterD");
    clientWidth = container.width();
    splitter = container.children(".splitter-bar");
    splitter.width(clientWidth - $NC.G_LAYOUT.border1);

    container = $("#grdDetailD").parent();
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdDetailD", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#grdSubD").parent();
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdSubD", container.width(), container.height() - $NC.G_LAYOUT.header);

    return;
  }

  // 배송완료
  if ($NC.G_VAR.activeView.PROCESS_CD === "E") {
    // Splitter 컨테이너 크기 조정
    container = $($NC.G_VAR.activeView.container);
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdMasterE").parent();
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterE", container.width(), container.height() - $NC.G_LAYOUT.header);
    container = $("#grdDetailE").parent();
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdDetailE", container.width(), container.height() - $NC.G_LAYOUT.header);
    return;
  }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();
  // 사업부 Key 입력
  switch (id) {
  case "CENTER_CD":
    onChangingCondition();

    setPolicyValInfo();
    setProcessStateInfo();
    setMasterProcessInfo();
    setOutboundBatchCombo("#cboQOutbound_BatchC", false);
    setOutboundBatchCombo("#cboOutbound_BatchC", false);
    setOutboundBatchCombo("#cboQOutbound_BatchD", true);
    setDeliveryBatchCombo("B");
    setDeliveryBatchCombo("BT");
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
  case "OWN_BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: val
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
    /*
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
    */
  case "DELIVERY_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_DELIVERY_CD: val,
        P_DELIVERY_DIV: "%",
        P_VIEW_DIV: "2"
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
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_DELIVERY_CD: val,
        P_DELIVERY_DIV: "%",
        P_VIEW_DIV: "2"
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
  case "OUTBOUND_DATE":
    $NC.setValueDatePicker(view, val, "검색 출고일자를 정확히 입력하십시오.");
    setOutboundBatchCombo("#cboQOutbound_BatchC", false);
    setOutboundBatchCombo("#cboOutbound_BatchC", false);
    setOutboundBatchCombo("#cboQOutbound_BatchD", true);
    break;
  case "ORDER_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "ORDER_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
  case "OUTBOUND_BATCHC":
    _Inquiry();
    break;
  }

  onChangingCondition();
}

function onChangingCondition() {

  var process_Cd;
  for(var i = 1; i < 5; i++) {
    process_Cd = String.fromCharCode(65 + i);

    // 마스터
    $NC.clearGridData(window["G_GRDMASTER" + process_Cd]);
    // 디테일
    $NC.clearGridData(window["G_GRDDETAIL" + process_Cd]);
    // 지시 - 등록 이후
    if (process_Cd === "D") {
      $NC.clearGridData(window["G_GRDSUB" + process_Cd]);
    }
  }

  // 일괄출고등록 초기화
  // 마스터
  $NC.clearGridData(G_GRDMASTERBT);
  // 디테일
  $NC.clearGridData(G_GRDDETAILBT);
  // 출고가능 표시 란 클리어
  $("#divOutboundInfoView input[type='text']").val("");

  setMasterSummaryInfo();

  // 공통 버튼 활성화
  setTopButtons();
}

/**
 * 출고지시 화면에서 출고차수 값 변경시 그리드 클리어 (출기지시 화면만 해당됨)
 */
function _OnInputChange(e, view, val) {

  var id = view.prop("id").substr(3).toUpperCase();

  switch (id) {
  case "OUTBOUND_BATCHC":
    if (val == "000") {
      $NC.setEnable("#edtOutbound_Batch_NmC", true);
    } else {
      $NC.setEnable("#edtOutbound_Batch_NmC", false);
      $NC.setValue("#edtOutbound_Batch_NmC");
    }
    break;
  case "OUTBOUND_DATEBT":
    $NC.setValueDatePicker(view, val, "일괄처리생성정보의 출고일자를 정확히 입력하십시오.");
    setDeliveryBatchCombo("BT");
    break;
  case "OUTBOUND_DATEB":
    $NC.setValueDatePicker(view, val, "출고일자를 정확히 입력하십시오.");
    setDeliveryBatchCombo("B");
    break;
  case "DELIVERY_BATCHB":
    $NC.setEnable("#edtBatch_NmB", val == "000");
    break;
  case "DELIVERY_BATCHBT":
    $NC.setEnable("#edtBatch_NmBT", val == "000");
    break;
  case "QVIEW_DIV0":
  case "QVIEW_DIV1":
    if (G_GRDDETAILBT.view.getEditorLock().isActive()) {
      G_GRDDETAILBT.view.getEditorLock().commitCurrentEdit();
    }

    if (G_GRDDETAILBT["isCellChangeError"] == true) {
      $NC.setValueRadioGroup("rgbQView_Div", val == "0" ? "1" : "0");
      G_GRDDETAILBT["isCellChangeError"] = false;
      return;
    }

    if (!grdDetailBTOnBeforePost(G_GRDDETAILBT.lastRow)) {
      $NC.setValueRadioGroup("rgbQView_Div", val == "0" ? "1" : "0");
      return;
    }

    // 디테일 수정여부 체크, 수정시 자동 저장 처리
    if ($NC.isGridModified(G_GRDDETAILBT)) {
      if (!saveEntryBT()) {
        return;
      }
    }

    $NC.setInitGridVar(G_GRDMASTERBT);
    G_GRDMASTERBT.lastFilterVal = val;
    G_GRDMASTERBT.data.refresh();
    $NC.setGridSelectRow(G_GRDMASTERBT, 0);
    break;
  }
}

/**
 * Sub View Button Click 시 호출 됨
 */
function onSubViewChange(e, view) {

  // btnProcessA ---> A
  var process_Cd = view.prop("id").substr(10).toUpperCase();
  if ($NC.G_VAR.activeView.PROCESS_CD == process_Cd) {
    return;
  }
  for(var i = 0; i < 5; i++) {
    var initProcess_Cd = String.fromCharCode(65 + i);
    $("#btnProcess" + initProcess_Cd).removeClass("ui-clr-selected");
    $("#divSubView" + initProcess_Cd).hide();
  }
  $("#divSubViewBT").hide();
  $("#btnProcessBT").removeClass("ui-clr-selected");

  view.addClass("ui-clr-selected");
  $("#divSubView" + process_Cd).show();
  $NC.G_VAR.activeView.container = "#divSubView" + process_Cd;
  $NC.G_VAR.activeView.PROCESS_CD = process_Cd;

  // $("#divProcessingInfoC").hide();
  $("#tdDirectHidden").show();
  // 출고 등록
  if ($NC.G_VAR.activeView.PROCESS_CD === "B") {
    $("#btnProcessB").removeClass("ui-clr-selected");
    $("#btnProcessB").addClass("ui-clr-selected");
    $("#divOrderDate").show(); // 출고예정일자 표시
    $("#divOutboundBatch").hide(); // 출고차수 비표시
    $("#divViewDiv").hide(); // 처리대상 비 표시
    $("#tdQDsp_Outbound_BatchC").hide(); // 출고차수(지시) 비표시
//    $("#divStateYn").show(); // 검색구분표시
    $NC.G_OFFSET.subConditionViewHeight = $("#divProcessingInfoB").outerHeight();

    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter("#divSplitterB")) {
      // 스필리터를 통한 _OnResize 호출
      $("#divSplitterB").trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter("#divSplitterB", "h", 250);
    }
    setDeliveryBatchCombo("B");
    // 공통 버튼 활성화
    // setTopButtons();
    _Inquiry();
    return;
  }

  // 출고 등록(일괄)
  if ($NC.G_VAR.activeView.PROCESS_CD === "BT") {
    $("#btnProcessBT").removeClass("ui-clr-selected");
    $("#btnProcessBT").addClass("ui-clr-selected");
    $("#divOrderDate").show(); // 출고예정일자 표시
    $("#divOutboundBatch").hide(); // 출고차수 비표시
    $("#divViewDiv").show(); // 처리대상 표시
//    $("#divStateYn").hide(); // 검색구분비표시
    $("#tdQDsp_Outbound_BatchC").hide(); // 출고차수(지시) 비표시
    $NC.G_OFFSET.subConditionViewHeight = $("#divProcessingInfoBT").outerHeight();

    $("#lblReal_PStock_Qty").removeClass("ui-lbl-key");
    $("#edtReal_PStock_Qty").removeClass("ui-edt-key");
    $("#lblReal_PStock_Qty").addClass("ui-lbl-normal");
    $("#edtReal_PStock_Qty").addClass("ui-edt-normal");

    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter("#divSplitterBT")) {
      // 스필리터를 통한 _OnResize 호출
      $("#divSplitterBT").trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter("#divSplitterBT", "h", 250);
    }

    // 공통 버튼 활성화
    // setTopButtons();
    // _Inquiry();
    // 일괄출고등록 초기화
    // 마스터
    var grdSelector = "#grdMasterBT";
    var grdObject = G_GRDMASTERBT;

    grdObject.lastRow = null;
    $NC.setInitGridData(grdObject);
    $NC.setGridDisplayRows(grdSelector, 0, 0);

    // 디테일
    grdSelector = "#grdDetailBT";
    grdObject = G_GRDDETAILBT;

    grdObject.lastRow = null;
    $NC.setInitGridData(grdObject);
    $NC.setGridDisplayRows(grdSelector, 0, 0);
    // 출고가능 표시 란 클리어
    $("#divOutboundInfoView input[type='text']").val("");
    return;
  }

  // var subContainer;
  if ($NC.G_VAR.activeView.PROCESS_CD === "C") {// 출고 지시
    $("#divOrderDate").hide(); // 출고예정일자 비표시
    $("#divOutboundBatch").hide(); // 출고차수 비표시
    // $("#divProcessingInfoC").show();
    $("#divViewDiv").hide(); // 처리대상 비 표시
//    $("#divStateYn").show(); // 검색구분표시
    $("#tdDirectHidden").hide();
    // subContainer = $("#divSubViewCDetail");
    $("#tdQDsp_Outbound_BatchC").show(); // 출고차수(지시) 표시
    setOutboundBatchCombo("#cboQOutbound_BatchC", false, "first");
    $NC.setValue("#cboQOutbound_BatchC", "000");
    $NC.G_OFFSET.subConditionViewHeight = $("#divProcessingInfoC").outerHeight();

    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter("#divSplitterC")) {
      // 스필리터를 통한 _OnResize 호출
      $("#divSplitterC").trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter("#divSplitterC", "v", $NC.G_OFFSET.leftViewWidth, 270, 400);
    }

    // 공통 버튼 활성화
    // setTopButtons();
    _Inquiry();
    return;
  }

  if ($NC.G_VAR.activeView.PROCESS_CD === "D") {// 출고 확정
    $("#divOrderDate").hide(); // 출고예정일자 비표시
    $("#divOutboundBatch").show().css("display", "inline-block"); // 출고차수 표시
    $("#divViewDiv").hide(); // 처리대상 비 표시
//    $("#divStateYn").show(); // 검색구분표시
    $("#tdQDsp_Outbound_BatchC").hide(); // 출고차수(지시) 비표시
    setOutboundBatchCombo("#cboQOutbound_BatchD", true, "first");
    $NC.G_OFFSET.subConditionViewHeight = 0;

    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
      // 스필리터를 통한 _OnResize 호출
      $($NC.G_VAR.activeView.container).trigger("resize");
      $("#divSplitterD").trigger("resize");

    } else {
      // 스플리터 초기화
      $NC.setInitSplitter($NC.G_VAR.activeView.container, "v", $NC.G_OFFSET.leftViewWidth, 270, 400);
      $NC.setInitSplitter("#divSplitterD", "h", 400);
    }

    // 공통 버튼 활성화
    // setTopButtons();
    _Inquiry();
    return;
  }

  if ($NC.G_VAR.activeView.PROCESS_CD === "E") {// 배송완료
    $("#divOrderDate").hide(); // 출고예정일자 비표시
    $("#divOutboundBatch").show().css("display", "inline-block"); // 출고차수 표시
    $("#divViewDiv").hide(); // 처리대상 비 표시
//    $("#divStateYn").show(); // 검색구분표시
    $("#tdQDsp_Outbound_BatchC").hide(); // 출고차수(지시) 비표시
    $NC.G_OFFSET.subConditionViewHeight = 0;

    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
      // 스필리터를 통한 _OnResize 호출
      $($NC.G_VAR.activeView.container).trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter($NC.G_VAR.activeView.container, "h", 250);
    }

    // 공통 버튼 활성화
    // setTopButtons();
    _Inquiry();
    return;
  }

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
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
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("출고일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date");
    return;
  }
  var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
  if ($NC.isNull(ORDER_DATE1)) {
    alert("출고예정 검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }
  var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
  if ($NC.isNull(ORDER_DATE2)) {
    alert("출고예정 검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date2");
    return;
  }
  var INOUT_CD = $NC.getValue("#cboQInout_Cd");
  if ($NC.isNull(INOUT_CD)) {
    alert("출고구분을 선택하십시오.");
    $NC.setFocus("#cboQInout_Cd");
    return;
  }
  var BU_NO = $NC.getValue("#edtQBu_No", true);
//  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);

  var OUTBOUND_BATCHC = $NC.getValue("#cboQOutbound_BatchC");
  var OUTBOUND_BATCHD = $NC.getValue("#cboQOutbound_BatchD");

  var STATE_PRE_YN = "Y";
  var STATE_CUR_YN = "Y";
//  if (STATE_PRE_YN === "N" && STATE_CUR_YN === "N") {
//    alert("검색구분을 선택하십시오.");
//    $NC.setFocus("#chkQState_Pre_Yn");
//    return;
//  }

  var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
  var RDELIVERY_CD = $NC.getValue("#edtQRDelivery_Cd", true);

  // 출고등록
  if ($NC.G_VAR.activeView.PROCESS_CD === "B") {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERB);

    G_GRDMASTERB.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_ORDER_DATE1: ORDER_DATE1,
      P_ORDER_DATE2: ORDER_DATE2,
      P_STATE_PRE_YN: STATE_PRE_YN,
      P_STATE_CUR_YN: STATE_CUR_YN,
      P_INOUT_CD: INOUT_CD,
      P_BU_NO: BU_NO,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_DELIVERY_CD: DELIVERY_CD,
      P_RDELIVERY_CD: RDELIVERY_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LO02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERB), onGetMasterB);

    return;
  }

  // 출고등록(일괄)
  if ($NC.G_VAR.activeView.PROCESS_CD === "BT") {

    // 출고가능 표시 란 클리어
    $("#divOutboundInfoView input[type='text']").val("");
    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERBT);

    G_GRDMASTERBT.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_ORDER_DATE1: ORDER_DATE1,
      P_ORDER_DATE2: ORDER_DATE2,
      P_INOUT_CD: INOUT_CD,
      P_BU_NO: BU_NO,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_OUTBOUND_DIV: "1", // 1: 기본출고
      P_DELIVERY_CD: DELIVERY_CD,
      P_RDELIVERY_CD: RDELIVERY_CD,
      P_REF_CUST_CD: "",
      P_ORDERER_NM: "",
      P_SHIPPER_NM: "",
      P_BU_TIME: "",
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LO02010E/getDataSetEntryBT.do", $NC.getGridParams(G_GRDMASTERBT), onGetMasterBT, null, 2);
    return;
  }

  // 출고지시
  if ($NC.G_VAR.activeView.PROCESS_CD === "C") {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERC);

    G_GRDMASTERC.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_STATE_PRE_YN: STATE_PRE_YN,
      P_STATE_CUR_YN: STATE_CUR_YN,
      P_INOUT_CD: INOUT_CD,
      P_BU_NO: BU_NO,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_OUTBOUND_BATCH: OUTBOUND_BATCHC,
      P_DELIVERY_CD: DELIVERY_CD,
      P_RDELIVERY_CD: RDELIVERY_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LO02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERC), onGetMasterC);

    return;
  }

  // 출고확정
  if ($NC.G_VAR.activeView.PROCESS_CD === "D") {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERD);

    G_GRDMASTERD.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_STATE_PRE_YN: STATE_PRE_YN,
      P_STATE_CUR_YN: STATE_CUR_YN,
      P_INOUT_CD: INOUT_CD,
      P_BU_NO: BU_NO,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_OUTBOUND_BATCH: OUTBOUND_BATCHD,
      P_DELIVERY_CD: DELIVERY_CD,
      P_RDELIVERY_CD: RDELIVERY_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LO02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERD), onGetMasterD);

    return;
  }

  // 배송완료
  if ($NC.G_VAR.activeView.PROCESS_CD === "E") {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERE);

    G_GRDMASTERE.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_STATE_PRE_YN: STATE_PRE_YN,
      P_STATE_CUR_YN: STATE_CUR_YN,
      P_INOUT_CD: INOUT_CD,
      P_BU_NO: BU_NO,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_OUTBOUND_BATCH: OUTBOUND_BATCHD,
      P_DELIVERY_CD: DELIVERY_CD,
      P_RDELIVERY_CD: RDELIVERY_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LO02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERE), onGetMasterE);

    return;
  }

}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  if ($NC.G_VAR.activeView.PROCESS_CD !== "B") {
    return;
  }
  if ($NC.G_VAR.policyVal.LO210 !== "Y") {
    alert("출고등록 신규처리가 불가능한 사업부입니다.");
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LO02011P",
    PROGRAM_NM: "출고등록/수정",
    url: "lo/LO02011P.html",
    width: 1024,
    height: 600,
    userData: {
      P_PROCESS_CD: "N",
      P_CENTER_CD: CENTER_CD,
      P_CENTER_CD_F: CENTER_CD_F,
      P_BU_CD: BU_CD,
      P_BU_NM: BU_NM,
      P_CUST_CD: CUST_CD,
      P_POLICY_LO190: $NC.G_VAR.policyVal.LO190,
      P_POLICY_LO210: $NC.G_VAR.policyVal.LO210,
      P_POLICY_LO221: $NC.G_VAR.policyVal.LO221,
      P_POLICY_LO250: $NC.G_VAR.policyVal.LO250,
      P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
      P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
      P_MASTER_DS: {},
      P_DETAIL_DS: [ ]
    },
    onOk: function() {
      setDeliveryBatchCombo("B"); // 배송차수 콤보 재생성
      _Inquiry();
    }
  });
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  // 출고확정
  if ($NC.G_VAR.activeView.PROCESS_CD === "D") {

    if (G_GRDSUBD.lastRow == null || G_GRDSUBD.data.getLength() === 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }
    // 현재 수정모드면
    if (G_GRDMASTERD.view.getEditorLock().isActive()) {
      G_GRDMASTERD.view.getEditorLock().commitCurrentEdit();
    }
    if (G_GRDSUBD.view.getEditorLock().isActive()) {
      G_GRDSUBD.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (G_GRDSUBD.lastRow != null) {
      if (!grdSubDOnBeforePost(G_GRDSUBD.lastRow)) {
        return;
      }
    }

    var mstRow = G_GRDMASTERD.data.getItem(G_GRDMASTERD.lastRow);
    var strRemark = "";
    if (mstRow.CRUD !== "R") {
      strRemark = mstRow.REMARK1;
    }

    var saveDS = [ ];
    // var rowCount = G_GRDSUBD.data.getLength();
    // 필터링 된 데이터라 전체 데이터를 기준으로 처리
    var rows = G_GRDSUBD.data.getItems();
    var rowCount = rows.length;
    for(var row = 0; row < rowCount; row++) {
      var rowData = rows[row];
      if (rowData.CRUD !== "R") {
        var saveData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_OUTBOUND_NO: rowData.OUTBOUND_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_LOCATION_CD: rowData.LOCATION_CD,
          P_STOCK_DATE: rowData.STOCK_DATE,
          P_STOCK_IN_GRP: rowData.STOCK_IN_GRP,
          P_STOCK_ID: rowData.STOCK_ID,
          P_CONFIRM_QTY: rowData.CONFIRM_QTY,
          P_CRUD: rowData.CRUD
        };
        saveDS.push(saveData);
      }
    }
    if (saveDS.length > 0 || mstRow.CRUD !== "R") {
      $NC.serviceCall("/LO02010E/saveConfirms.do", {
        P_DS_MASTER: $NC.getParams({
          P_CENTER_CD: mstRow.CENTER_CD,
          P_BU_CD: mstRow.BU_CD,
          P_OUTBOUND_DATE: mstRow.OUTBOUND_DATE,
          P_OUTBOUND_NO: mstRow.OUTBOUND_NO,
          P_LINE_NO: "",
          P_PROCESS_CD: "B", // [B]등록
          P_STATE_DIV: "1", // [1]MIN 값
          P_CHECK_STATE: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
          P_REMARK1: strRemark,
          P_CRUD: mstRow.CRUD
        // 진행상태 체크 30
        }),
        P_DS_SUB: $NC.toJson(saveDS),
        P_USER_ID: $NC.G_USERINFO.USER_ID
      }, onSaveD);
    }
    return;
  }

  // 배송완료
  if ($NC.G_VAR.activeView.PROCESS_CD === "E") {
    if (G_GRDMASTERE.data.getLength() === 0 || G_GRDDETAILE.data.getLength() === 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    // 현재 수정모드면
    if (G_GRDDETAILE.view.getEditorLock().isActive()) {
      G_GRDDETAILE.view.getEditorLock().commitCurrentEdit();
    }

    // 현재 선택된 로우 Validation 체크
    if (G_GRDDETAILE.lastRow != null) {
      if (!grdDetailEOnBeforePost(G_GRDDETAILE.lastRow)) {
        return;
      }
    }

    var saveDS = [ ];
    var rowCount = G_GRDDETAILE.data.getLength();
    for(var row = 0; row < rowCount; row++) {
      var rowData = G_GRDDETAILE.data.getItem(row);
      if (rowData.CRUD !== "R"
          && rowData.OUTBOUND_STATE == $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
        if (!grdDetailEOnBeforePost(row)) {
          return;
        }
        var saveData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_OUTBOUND_NO: rowData.OUTBOUND_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_DELIVERY_QTY: rowData.DELIVERY_QTY,
          P_MISSED_DIV: rowData.MISSED_DIV,
          P_MISSED_COMMENT: rowData.MISSED_COMMENT,
          P_OUTBOUND_STATE: rowData.OUTBOUND_STATE,
          P_CUR_STATE: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
          P_CRUD: rowData.CRUD
        };
        saveDS.push(saveData);
      }
    }

    if (saveDS.length > 0) {
      $NC.serviceCall("/LO02010E/saveDelivery.do", {
        P_DS_MASTER: $NC.toJson(saveDS),
        P_USER_ID: $NC.G_USERINFO.USER_ID
      }, onSaveE, onSaveErrorE);
    }
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

}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

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
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("출고일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date");
    return;
  }
  var OUTBOUND_BATCH = "";
  var checkedValueDS = [ ];
  var checkCnt = 0;
  var internalQueryYn = "N";

  // 대상 그리드 선택
  switch ($NC.G_VAR.activeView.PROCESS_CD) {
  case "B":
    OUTBOUND_BATCH = "000";
    break;
  case "C":
    OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_BatchC");
    if ($NC.isNull(OUTBOUND_BATCH)) {
      alert("출고차수를 선택하십시오.");
      $NC.setFocus("#cboQOutbound_BatchC");
      return;
    }
    break;
  case "D":
  case "E":
    OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_BatchD");
    if ($NC.isNull(OUTBOUND_BATCH)) {
      alert("출고차수를 선택하십시오.");
      $NC.setFocus("#cboQOutbound_BatchD");
      return;
    }
    break;
  default:
    alert("해당 프로세스는 출력물이 없습니다.");
    return;
  }

  var grdObject = window["G_GRDMASTER" + $NC.G_VAR.activeView.PROCESS_CD];
  if (grdObject.view.getEditorLock().isActive()) {
    grdObject.view.getEditorLock().commitCurrentEdit();
  }

  // 출력 데이터 Array 담기
  // 지시서, 거래명세서
  if (printIndex == 0) {
    var rowCount = grdObject.data.getLength();
    for(var row = 0; row < rowCount; row++) {
      var rowData = grdObject.data.getItem(row);
      if (rowData.CHECK_YN === "Y") {
        checkCnt++;
        if (rowData.OUTBOUND_STATE >= "30") {
          checkedValueDS.push(rowData.OUTBOUND_NO);
        }
      }
    }
  }

  // 출력 데이터 Array 담기
  // 지시서, 거래명세서
  if (printIndex == 5 || printIndex == 6) {
    var rowCount = grdObject.data.getLength();
    for(var row = 0; row < rowCount; row++) {
      var rowData = grdObject.data.getItem(row);
      if (rowData.CHECK_YN === "Y") {
        checkCnt++;
        if (rowData.OUTBOUND_STATE >= "40") {
          checkedValueDS.push(rowData.OUTBOUND_NO);
        }
      }
    }
  }
  // 파라메터 세팅
  var reportDoc = "";
  var queryId = "";
  var queryParams = {};
  switch (printIndex) {
  // 오더피킹지시서
  case 0:
    reportDoc = "lo/PAPER_LO01";
    queryId = "WR.RS_PAPER_LO01";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE
    };
    break;
  // 토탈피킹지시서
  case 1:
    reportDoc = "lo/PAPER_LO02";
    queryId = "WR.RS_PAPER_LO02";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_BATCH: OUTBOUND_BATCH
    };
    break;
  // 배분작업지시서
  case 2:
    reportDoc = "lo/PAPER_LO03";
    queryId = "WR.RS_PAPER_LO03";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_BATCH: OUTBOUND_BATCH
    };
    break;
  // 차량별 토탈피킹지시서
  case 3:
    reportDoc = "lo/PAPER_LO04";
    queryId = "WR.RS_PAPER_LO04";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_BATCH: OUTBOUND_BATCH

    };
    break;
  // 차량별 배분작업지시서
  case 4:
    reportDoc = "lo/PAPER_LO05";
    queryId = "WR.RS_PAPER_LO05";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_BATCH: OUTBOUND_BATCH
    };
    break;
  // 거래명세서
  case 5:
    reportDoc = "lo/RECEIPT_LO01";
    queryId = "WR.RS_RECEIPT_LO01";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE
    };
    break;
  // 거래명세서
  case 6:
    reportDoc = "common/RECEIPT_COMMON";
    queryId = "WR.RS_RECEIPT_LO02";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE: OUTBOUND_DATE,
      P_PROCESS_CD: "LO"
    };
    internalQueryYn = "Y";
    break;
  }

  if (printIndex == 0 || printIndex == 5 || printIndex == 6) {
    // 선택 건수 체크
    if (checkCnt == 0) {
      alert("[" + printName + "]출력할 데이터를 선택하십시오.");
      return;
    }
    if (checkedValueDS.length == 0) {
      alert("[" + printName + "]출력 가능한 데이터를 선택하십시오.");
      return;
    }
  }

  // 출력 호출
  $NC.G_MAIN.showPrintPreview({
    reportDoc: reportDoc,
    queryId: queryId,
    queryParams: queryParams,
    checkedValue: checkedValueDS.toString(),
    internalQueryYn: internalQueryYn
  });
}

/**
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          grid, row, cell, val
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

  if ($NC.isNull($NC.G_VAR.activeView.PROCESS_CD)) {
    return;
  }
  var grdMaster = window["G_GRDMASTER" + $NC.G_VAR.activeView.PROCESS_CD];

  if (grdMaster.view.getEditorLock().isActive()) {
    grdMaster.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(grdMaster, args.row);

  var rowData = grdMaster.data.getItem(args.row);

  if (args.cell == grdMaster.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  grdMaster.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  grdMaster.lastRowModified = true;
}

/**
 * Grid Column 중 진행상태의 Fomatter
 */
function grdStateFormatter(row, cell, value, columnDef, dataContext) {

  return "<span class='ui-icon-state-" + dataContext.OUTBOUND_STATE + "'>&nbsp;</span>";
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();

  // 저장

  // 행추가 하는 이벤트 없음
  // 확정
  if (permission.canConfirm) {
    $("#btnProcessNxtB").click(onProcessNxtB);
    $("#btnProcessNxtC").click(onProcessNxtC);
    $("#btnProcessNxtD").click(onProcessNxtD);
    $("#btnProcessNxtE").click(onProcessNxtE);
    $("#btnProcessNxtBT").click(onProcessNxtBT);

  }
  $NC.setEnable("#btnProcessNxtB", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtC", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtD", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtE", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtBT", permission.canConfirm);

  // 취소
  if (permission.canConfirmCancel) {
    $("#btnProcessPreB").click(onProcessPreB);
    $("#btnProcessPreC").click(onProcessPreC);
    $("#btnProcessPreD").click(onProcessPreD);
    $("#btnProcessPreE").click(onProcessPreE);
    $("#btnProcessPreBT").click(onProcessPreBT);
  }
  $NC.setEnable("#btnProcessPreB", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreC", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreD", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreE", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreBT", permission.canConfirmCancel);
}

function setTopButtons() {

  // 기본값
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.G_VAR.printOptions = [ ];

  // 출고 등록
  if ($NC.G_VAR.activeView.PROCESS_CD === "B") {
    // 버튼 활성화 처리
    if ($NC.G_VAR.policyVal.LO210 === "Y") {
      $NC.G_VAR.buttons._new = "1";
    } else {
      $NC.G_VAR.buttons._new = "0";
    }
    if (G_GRDMASTERB.data.getLength() > 0) {
      if ($("#btnProcessC").prop("disabled")) {
        $NC.G_VAR.buttons._print = "1";

        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 0,
          PRINT_COMMENT: "오더피킹지시서"
        });
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 1,
          PRINT_COMMENT: "토탈피킹지시서"
        });
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 2,
          PRINT_COMMENT: "배분작업지시서"
        });
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 3,
          PRINT_COMMENT: "차량별 토탈피킹지시서"
        });
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 4,
          PRINT_COMMENT: "차량별 배분작업지시서"
        });

      }
      if ($("#btnProcessD").prop("disabled")) {
        // $NC.G_VAR.printOptions.push({
        // PRINT_INDEX: 5,
        // PRINT_COMMENT: "거래명세서"
        // });
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 6,
          // PRINT_COMMENT: "거래명세서(삼우)"
          PRINT_COMMENT: "출고전표"
        });
      }

    }

  } else if ($NC.G_VAR.activeView.PROCESS_CD === "BT") {

  } else if ($NC.G_VAR.activeView.PROCESS_CD === "C") {// 출고 지시
    // 버튼 활성화 처리
    if (G_GRDMASTERC.data.getLength() > 0) {
      $NC.G_VAR.buttons._save = "0";
      $NC.G_VAR.buttons._print = "1";

      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 0,
        PRINT_COMMENT: "오더피킹지시서"
      });
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 1,
        PRINT_COMMENT: "토탈피킹지시서"
      });
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 2,
        PRINT_COMMENT: "배분작업지시서"
      });
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 3,
        PRINT_COMMENT: "차량별 토탈피킹지시서"
      });
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 4,
        PRINT_COMMENT: "차량별 배분작업지시서"
      });
      if ($("#btnProcessD").prop("disabled")) {
        // $NC.G_VAR.printOptions.push({
        // PRINT_INDEX: 5,
        // PRINT_COMMENT: "거래명세서"
        // });
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 6,
          // PRINT_COMMENT: "거래명세서(삼우)"
          PRINT_COMMENT: "출고전표"
        });
      }
    }

  } else if ($NC.G_VAR.activeView.PROCESS_CD === "D") {// 출고 확
    // 버튼 활성화 처리
    if (G_GRDMASTERD.data.getLength() > 0) {
      $NC.G_VAR.buttons._save = "1";
      $NC.G_VAR.buttons._print = "1";

      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 0,
        PRINT_COMMENT: "오더피킹지시서"
      });
      // 출고확정단계에서는 출고지시단계에 출력물중 오더피킹지시서만 표시되도록 수정
      // $NC.G_VAR.printOptions.push({
      // PRINT_INDEX: 1,
      // PRINT_COMMENT: "토탈피킹지시서"
      // });
      // $NC.G_VAR.printOptions.push({
      // PRINT_INDEX: 2,
      // PRINT_COMMENT: "배분작업지시서"
      // });
      // $NC.G_VAR.printOptions.push({
      // PRINT_INDEX: 3,
      // PRINT_COMMENT: "차량별 토탈피킹지시서"
      // });
      // $NC.G_VAR.printOptions.push({
      // PRINT_INDEX: 4,
      // PRINT_COMMENT: "차량별 배분작업지시서"
      // });

      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 6,
        // PRINT_COMMENT: "거래명세서(삼우)"
        PRINT_COMMENT: "출고전표"
      });
    }
  } else if ($NC.G_VAR.activeView.PROCESS_CD === "E") {// 배송완료
    // 버튼 활성화 처리
    if (G_GRDMASTERE.data.getLength() > 0) {
      $NC.G_VAR.buttons._save = "1";
      $NC.G_VAR.buttons._print = "1";

      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 0,
        PRINT_COMMENT: "오더피킹지시서"
      });
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 6,
        PRINT_COMMENT: "출고전표"
      });
    }
  }
  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
}

function onGetMasterSummary(ajaxData) {

  var rows = $NC.toArray(ajaxData);
  if (rows.length === 0) {
    for(var i = 0; i < 5; i++) {
      $NC.setValue("#divProcessCnt" + String.fromCharCode(65 + i), "0 / 0");
    }
  } else {
    var rowData = rows[0];
    var process_Cd, process_Cnt, process_Qty;
    for(var i = 0; i < 5; i++) {
      process_Cd = String.fromCharCode(65 + i);
      process_Cnt = rowData["CNT_" + process_Cd];
      process_Qty = rowData["QTY_" + process_Cd];
      if ($NC.isNull(process_Cnt)) {
        process_Cnt = "0";
      }
      if ($NC.isNull(process_Qty)) {
        process_Qty = "0";
      }
      $NC.setValue("#divProcessCnt" + process_Cd, $NC.getDisplayNumber(process_Cnt) + " / "
          + $NC.getDisplayNumber(process_Qty));
    }
  }
}

function onGetProcessInfo(ajaxData) {

  // 버튼 전체 비활성화
  for(var i = 0; i < 5; i++) {
    $NC.setEnable("#btnProcess" + String.fromCharCode(65 + i), false);
  }
  $NC.setEnable("#btnProcessBT", false);

  var resultDS = $NC.toArray(ajaxData);
  var resultDSCnt = resultDS.length;
  if (resultDSCnt > 0) {
    var resultData;
    // 프로세스 사용 가능여부 세팅
    for(var i = 0; i < resultDSCnt; i++) {
      resultData = resultDS[i];
      $NC.setEnable("#btnProcess" + resultData.PROCESS_CD, resultData.EXEC_PROCESS_YN == "Y");
    }
    $NC.setEnable("#btnProcessBT", $NC.getEnable("#btnProcessB"));

    if ($("#btnProcess" + $NC.G_VAR.activeView.PROCESS_CD).prop("disabled") === false) {
      return;
    }
    // 현재 선택된 프로세스 View가 사용 가능하지 않으면 사용가능한 첫번째 뷰 선택
    var process_Cd;
    for(var i = 0; i < 5; i++) {
      process_Cd = String.fromCharCode(65 + i);
      if ($("#btnProcess" + process_Cd).prop("disabled") === false) {
        $("#btnProcess" + process_Cd).click();
        return;
      }
    }
  }
  // 프로세스 정보를 가져오지 못했거나 사용할 수 있는 프로세스 View가 없을 경우 강제적으로 출고등록 View를 표시
  // $NC.setEnable("#btnProcessB");
  // if ($NC.G_VAR.activeView.PROCESS_CD !== "B") {
  // $("#btnProcessB").click();
  // }
  $("#btnProcess" + $NC.G_VAR.activeView.PROCESS_CD).removeClass("ui-clr-selected");
  $("#divSubView" + $NC.G_VAR.activeView.PROCESS_CD).hide();
  alert("수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록하십시오.");
  $NC.G_VAR.activeView.PROCESS_CD = "";
}

function setMasterSummaryInfo() {

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
  var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
  var INOUT_CD = $NC.getValue("#cboQInout_Cd");

  var BU_NO = $NC.getValue("#edtQBu_No", true);
//  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);

  var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
  var RDELIVERY_CD = $NC.getValue("#edtQRDelivery_Cd", true);

  // 데이터 조회
  $NC.serviceCall("/LO02010E/getDataSet.do", {
    P_QUERY_ID: "LO02010E.RS_MASTER",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_ORDER_DATE1: ORDER_DATE1,
      P_ORDER_DATE2: ORDER_DATE2,
      P_INOUT_CD: INOUT_CD,
      P_BU_NO: BU_NO,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_DELIVERY_CD: DELIVERY_CD,
      P_RDELIVERY_CD: RDELIVERY_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onGetMasterSummary);
}

function setMasterProcessInfo() {
  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  // 데이터 조회
  $NC.serviceCall("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.GET_PROCESS_INFO",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_PROCESS_GRP: "LO"
    })
  }, onGetProcessInfo);
}

function setPolicyValInfo() {

  for( var POLICY_CD in $NC.G_VAR.policyVal) {
    $NC.G_VAR.policyVal[POLICY_CD] = "";
  }

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  for( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCallAndWait("/LO02010E/callSP.do", {
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
      if (resultData.P_POLICY_CD != "LO250") {
        return;
      }
      // 배송처 표시 정책에 따라 조건 표시 설정
      var policyVal = resultData.O_POLICY_VAL;
      if (resultData.P_POLICY_CD == "LO250") {
        G_GRDDETAILB.view.setColumns(grdDetailBOnGetColumns(policyVal));
        G_GRDDETAILC.view.setColumns(grdDetailCOnGetColumns(policyVal));
        G_GRDSUBD.view.setColumns(grdSubDOnGetColumns(policyVal));
      }
    }
  }
}

function getOutboundState(params, onSuccess) {

  // 데이터 조회
  $NC.serviceCall("/LO02010E/callSP.do", {
    P_QUERY_ID: "WF.GET_LO_OUTBOUND_STATE",
    P_QUERY_PARAMS: $NC.getParams(params)
  }, onSuccess);
}

function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQBu_Cd", true);
  });
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

  // 출고차수 새로고침
  setOutboundBatchCombo("#cboQOutbound_BatchC", false);
  setOutboundBatchCombo("#cboOutbound_BatchC", false);
  setOutboundBatchCombo("#cboQOutbound_BatchD", true);

  // 브랜드 조회조건 초기화
  $NC.setValue("#edtQOwn_Brand_Cd");
  $NC.setValue("#edtQOwn_Brand_Nm");

  onChangingCondition();
  setPolicyValInfo();
  setProcessStateInfo();
  setMasterProcessInfo();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");

  $NP.showBuBrandPopup({
    P_BU_CD: BU_CD,
    P_BRAND_CD: "%"
  }, onBuBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
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

/**
 * 검색조건의 위탁사 검색 팝업 클릭
 */

function showOwnBranPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var CUST_CD = $NC.getValue("#edtQCust_Cd");

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

    $NC.setValue("#edtQOwn_Brand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQOwn_Brand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQOwn_Brand_Cd");
    $NC.setValue("#edtQOwn_Brand_Nm");
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
  }
  onChangingCondition();
}

function showDeliveryPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NP.showDeliveryPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_DELIVERY_CD: "%",
      P_DELIVERY_DIV: "%",
      P_VIEW_DIV: "2"
    }
  }, onDeliveryPopup, function() {
    $NC.setFocus("#edtQDelivery_Cd", true);
  });
}

function onDeliveryPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQDelivery_Cd", resultInfo.DELIVERY_CD);
    $NC.setValue("#edtQDelivery_Nm", resultInfo.DELIVERY_NM);
  } else {
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");
    $NC.setFocus("#edtQDelivery_Cd", true);
  }
  onChangingCondition();
}

function showRDeliveryPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NP.showDeliveryPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_DELIVERY_CD: "%",
      P_DELIVERY_DIV: "%",
      P_VIEW_DIV: "2"
    }
  }, onRDeliveryPopup, function() {
    $NC.setFocus("#edtQRDelivery_Cd", true);
  });
}

function onRDeliveryPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQRDelivery_Cd", resultInfo.DELIVERY_CD);
    $NC.setValue("#edtQRDelivery_Nm", resultInfo.DELIVERY_NM);
  } else {
    $NC.setValue("#edtQRDelivery_Cd");
    $NC.setValue("#edtQRDelivery_Nm");
    $NC.setFocus("#edtQRDelivery_Cd", true);
  }
  onChangingCondition();
}

function setProcessStateInfo() {

  for( var PROCESS_CD in $NC.G_VAR.stateFWBW) {
    $NC.G_VAR.stateFWBW[PROCESS_CD].CONFIRM = "";
    $NC.G_VAR.stateFWBW[PROCESS_CD].CANCEL = "";
  }

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var PROCESS_GRP = "LO";

  // 데이터 조회
  $NC.serviceCall("/LO02010E/getDataSet.do", {
    P_QUERY_ID: "WC.GET_PROCESS_STATE_FWBW",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_PROCESS_GRP: PROCESS_GRP
    })
  }, onGetProcessState);
}

function onGetProcessState(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    var rowData;
    for(var row = 0, rowCount = resultData.length; row < rowCount; row++) {
      rowData = resultData[row];
      $NC.G_VAR.stateFWBW[rowData.PROCESS_CD].CONFIRM = rowData.PROCESS_STATE_CONFIRM;
      $NC.G_VAR.stateFWBW[rowData.PROCESS_CD].CANCEL = rowData.PROCESS_STATE_CANCEL;
    }
  }
}

/**
 * 물류센터/사업부/출고일자 값 변경시 출고차수 콤보 재설정
 */
function setOutboundBatchCombo(comboId, isAddAll, setPos) {

  var position;
  if ($NC.isNull(setPos)) {
    position = "first";
  } else {
    position = setPos;
  }
  // 조회조건 - 출고차수 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_OUTBOUND_BATCH",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date"),
      P_OUTBOUND_DIV: "1" // --출고작업구분(1:기본출고, 2:온라인출고)
    }),
    arrowPolling: true
  }, {
    selector: comboId,
    codeField: "OUTBOUND_BATCH",
    fullNameField: "OUTBOUND_BATCH_F",
    addAll: !$NC.isNull(isAddAll) && isAddAll,
    addCustom: !$NC.isNull(isAddAll) && !isAddAll ? {
      codeFieldVal: "000",
      nameFieldVal: "신규"
    } : null,
    selectOption: position == "first" ? "F" : (position == "last" ? "L" : null),
    selectVal: (position == "first" || position == "last") ? null : position,
    onComplete: function() {
      if (comboId == "#cboOutbound_BatchC") { // 출고 지시(입력용)일 경우
        $NC.setEnable("#edtOutbound_Batch_NmC", $NC.getValue(comboId) == "000");
      }
    }
  });
}

/**
 * 물류센터/사업부/출고일자 값 변경시 배송차수 콤보 재설정
 */
function setDeliveryBatchCombo(processCd) {

  if ($NC.isNull(processCd)) {
    processCd = "BT";
  }
  var cboSelector = "#cboDelivery_Batch" + processCd;
  // 조회조건 - 배송차수 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_DELIVERY_BATCH",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
      P_OUTBOUND_DATE: $NC.getValue("#dtpOutbound_Date" + processCd)
    }),
    arrowPolling: true
  }, {
    selector: cboSelector,
    codeField: "DELIVERY_BATCH",
    nameField: "DELIVERY_BATCH",
    fullNameField: "DELIVERY_BATCH_F",
    addCustom: {
      codeFieldVal: "000",
      nameFieldVal: "신규"
    },
    selectOption: "L",
    onComplete: function() {
      $NC.setEnable("#edtBatch_Nm" + processCd, $NC.getValue(cboSelector) == "000");
    }
  });
}