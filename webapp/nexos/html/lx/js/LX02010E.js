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
      LI190: "", // 매입금액 계산정책
      LI210: "", // 입고 신규등록 정책
      LI420: "", // 입고 재고관리 기준
      LO190: ""  // 공급금액 계산정책
    },
    // 프로세스별 확정/취소 처리가능 진행상태
    // 0: A, 1: B, 2 : C, 3 : D, 4: E, 5: F
    stateFWBW: {
      A: {
        CONFIRM: "",
        CANCEL: ""
      },
      B: {
        CONFIRM: "10",
        CANCEL: "20"
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
      },
      F: {
        CONFIRM: "",
        CANCEL: ""
      }
    },
    isErrorC: false, // 검수수량 수정 체인지 이벤트 에러 제어용(임시 차후 수정할것)
    isErrorD: false, // 분배수량 수정 체인지 이벤트 에러 제어용(임시 차후 수정할것)
    isErrorF: false, // 배송수량 수정 체인지 이벤트 에러 제어용(임시 차후 수정할것)
    onSubBViewTimeout: null,
    onSubC1ViewTimeout: null
  });

  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();

  // 프로세스 버튼 클릭 이벤트 연결
  $("#divMasterInfoView input[type=button]").bind("click", function(e) {
    var view = $(this);
    onSubViewChange(e, view);
  });

  // 팝업 클릭 이벤트 세팅
  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQVendor_Cd").click(showVendorPopup);
  $("#btnQDelivery_Cd").click(showDeliveryPopup);
  $("#btnQRDelivery_Cd").click(showRDeliveryPopup);
  $("#btnQBrand_Cd").click(showBuBrandPopup);

  // 초기화 및 초기갑 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
  $NC.setValue("#chkQState_Pre_Yn", "Y");
  $NC.setValue("#chkQState_Cur_Yn", "Y");

  // 일자 세팅
  $NC.setInitDatePicker("#dtpQXDock_Date");
  $NC.setInitDatePicker("#dtpQOrder_Date1");
  $NC.setInitDatePicker("#dtpQOrder_Date2");
  $NC.setValue("#dtpQOrder_Date1", $NC.addDay($NC.getValue("#dtpQOrder_Date1"), -100));

  // 출고확정/취소 버튼 권한 체크 및 클릭 이벤트 연결
  setUserProgramPermission();

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
        // 출고전표/수량 정보 세팅, 프로세스 정보
        setMasterSummaryInfo();
        setPolicyValInfo();
        setProcessStateInfo();
        setMasterProcessInfo();

        // 운송차수 콤보 값 설정
        setDeliveryBatchCombo();
      }, 300);
    }
  });

  //조회조건 - 처리유형 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "XDOCK_TYPE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQXDock_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    addAll: true
  });

  // 그리드 초기화 - 등록
  grdMasterBInitialize();
  grdDetailBInitialize();
  grdSubBInitialize();

  // 그리드 초기화 - 검수
  grdMasterCInitialize();
  grdDetailC1Initialize();
  grdDetailC2Initialize();
  grdSubC1Initialize();
  grdSubC2Initialize();

  // 그리드 초기화 - 분배
  grdMasterDInitialize();
  grdDetailDInitialize();
  grdSubDInitialize();

  // 그리드 초기화 - 확정
  grdMasterEInitialize();
  grdDetailEInitialize();

  // 그리드 초기화 - 배송
  grdMasterFInitialize();
  grdDetailFInitialize();
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
  $NC.G_OFFSET.subBWidth = 1024;
  $NC.G_OFFSET.subBHeight = 600;
  $NC.G_OFFSET.subC1Width = 1024;
  $NC.G_OFFSET.subC1Height = 600;
  $NC.G_OFFSET.subConditionViewHeight = $("#divMasterInfoView").outerHeight();
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  var container;
  switch ($NC.G_VAR.activeView.PROCESS_CD) {
  case "B":
    container = $($NC.G_VAR.activeView.container);
    $NC.resizeContainer(container, clientWidth, clientHeight);

    clientHeight -= $NC.G_OFFSET.subConditionViewHeight;
    container = $("#divSplitterB");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdMasterB").parent();
    $NC.resizeGrid("#grdMasterB", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#grdDetailB").parent();
    $NC.resizeGrid("#grdDetailB", container.width(), container.height() - $NC.G_LAYOUT.header);

    refloatSubLayer($("#divSubB"), $NC.G_OFFSET.subBWidth, $NC.G_OFFSET.subBHeight);
    break;
  case "C":
    container = $($NC.G_VAR.activeView.container);
    $NC.resizeContainer(container, clientWidth, clientHeight);

    clientHeight -= $NC.G_OFFSET.subConditionViewHeight;
    container = $("#divSplitterC1");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdMasterC").parent();
    $NC.resizeGrid("#grdMasterC", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#grdDetailC1").parent().parent();
    $NC.resizeGrid("#grdDetailC1", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#divSplitterC2");
    $NC.resizeContainer(container, clientWidth, clientHeight - $("#grdMasterC").parent().height() - 8);

    container = $("#grdDetailC2").parent();
    $NC.resizeGrid("#grdDetailC2", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#grdSubC2").parent();
    $NC.resizeGrid("#grdSubC2", container.width(), container.height() - $NC.G_LAYOUT.header);

    refloatSubLayer($("#divSubC1"), $NC.G_OFFSET.subC1Width, $NC.G_OFFSET.subC1Height);
    break;
  case "D":
    container = $($NC.G_VAR.activeView.container);
    $NC.resizeContainer(container, clientWidth, clientHeight);

    clientHeight -= $NC.G_OFFSET.subConditionViewHeight;
    container = $("#divSplitterD1");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdMasterD").parent();
    $NC.resizeGrid("#grdMasterD", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#divSplitterD2");
    $NC.resizeContainer(container, clientWidth - $("#grdMasterD").parent().width() - 8, clientHeight);

    container = $("#grdDetailD").parent();
    $NC.resizeGrid("#grdDetailD", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#grdSubD").parent();
    $NC.resizeGrid("#grdSubD", container.width(), container.height() - $NC.G_LAYOUT.header);
    break;
  case "E":
    container = $($NC.G_VAR.activeView.container);
    $NC.resizeContainer(container, clientWidth, clientHeight);

    clientHeight -= $NC.G_OFFSET.subConditionViewHeight;
    container = $("#divSplitterE");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdMasterE").parent();
    $NC.resizeGrid("#grdMasterE", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#grdDetailE").parent();
    $NC.resizeGrid("#grdDetailE", container.width(), container.height() - $NC.G_LAYOUT.header);
    break;
  case "F":
    container = $($NC.G_VAR.activeView.container);
    $NC.resizeContainer(container, clientWidth, clientHeight);

    clientHeight -= $NC.G_OFFSET.subConditionViewHeight;
    container = $("#divSplitterF");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    container = $("#grdMasterF").parent();
    $NC.resizeGrid("#grdMasterF", container.width(), container.height() - $NC.G_LAYOUT.header);

    container = $("#grdDetailF").parent();
    $NC.resizeGrid("#grdDetailF", container.width(), container.height() - $NC.G_LAYOUT.header);
    break;
  }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();
  switch (id) {
  case "CENTER_CD":
    setPolicyValInfo();
    setProcessStateInfo();
    setMasterProcessInfo();
    // 운송차수 콤보 값 설정
    setDeliveryBatchCombo();
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
  case "VENDOR_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_VENDOR_CD: val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getVendorInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onVendorPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showVendorPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onVendorPopup, onVendorPopup);
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
  case "XDOCK_DATE":
    $NC.setValueDatePicker(view, val, "검색 작업일자를 정확히 입력하십시오.");
    // 운송차수 콤보 값 설정
    setDeliveryBatchCombo();
    break;
  case "XDOCK_TYPE":
    //_Inquiry();
    return;
  case "ORDER_DATE1":
    $NC.setValueDatePicker(view, val, "검색 예정일자를 정확히 입력하십시오.");
    break;
  case "ORDER_DATE2":
    $NC.setValueDatePicker(view, val, "검색 예정일자를 정확히 입력하십시오.");
    break;
  }

  onChangingCondition();
}

function onChangingCondition() {

  var process_Cd;
  for (var i = 1; i < 6; i++) {
    process_Cd = String.fromCharCode(65 + i);
    $NC.clearGridData(window["G_GRDMASTER" + process_Cd]);
    if (process_Cd === "C") {
      $NC.clearGridData(window["G_GRDDETAIL" + process_Cd + "1"]);
      $NC.clearGridData(window["G_GRDDETAIL" + process_Cd + "2"]);
      $NC.clearGridData(window["G_GRDSUB" + process_Cd + "1"]);
      $NC.clearGridData(window["G_GRDSUB" + process_Cd + "2"]);
    } else {
      $NC.clearGridData(window["G_GRDDETAIL" + process_Cd]);
    }
    if (process_Cd === "D") {
      $NC.clearGridData(window["G_GRDSUB" + process_Cd]);
    }
  }
  setMasterSummaryInfo();
  // 공통 버튼 활성화
  setTopButtons();
}

/**
 * 서브 조회조건 변경 이벤트 제어
 */
function _OnInputChange(e, view, val) {

}

/**
 * Sub View Button Click 시 호출 됨
 */
function onSubViewChange(e, view) {
  // 현재 선택된 탭 or 예정
  var process_Cd = view.prop("id").substr(10).toUpperCase();
  if ($NC.G_VAR.activeView.PROCESS_CD == process_Cd || process_Cd == "A") {
    return;
  }

  // 전체 탭 초기화
  for (var i = 0; i < 6; i++) {
    var initProcess_Cd = String.fromCharCode(65 + i);
    $("#btnProcess" + initProcess_Cd).removeClass("ui-clr-selected");
    $("#divSubView" + initProcess_Cd).hide();
  }

  // 선택 탭 정보 변경
  $NC.G_VAR.activeView.container = "#divSubView" + process_Cd;
  $NC.G_VAR.activeView.PROCESS_CD = process_Cd;

  // 조회조건 숨김처리 컨트롤
  setConditionHide();

  // 해당 탭 컨테이너 노출
  $($NC.G_VAR.activeView.container).show();

  // 탭 별 제어
  switch ($NC.G_VAR.activeView.PROCESS_CD) {
  case "B":
    $("#btnProcessB").addClass("ui-clr-selected");

    // 스플리터 컨트롤
    if ($NC.isSplitter("#divSplitterB")) {
      $("#divSplitterB").trigger("resize");
    } else {
      $NC.setInitSplitter("#divSplitterB", "h", 250);
    }

    // 그리드 초기화
    $NC.clearGridData(G_GRDMASTERB);
    $NC.clearGridData(G_GRDDETAILB);
    break;
  case "C":
    $("#btnProcessC").addClass("ui-clr-selected");

    if ($NC.isSplitter("#divSplitterC1")) {
      $("#divSplitterC1").trigger("resize");
    } else {
      $NC.setInitSplitter("#divSplitterC1", "h", 250);
    }

    // SUBC, 두번째 스플리터 숨김
    $("#divSubC").show();
    $("#divSplitterC2").hide();

    // 그리드 초기화
    $NC.clearGridData(G_GRDMASTERC);
    $NC.clearGridData(G_GRDDETAILC1);
    $NC.clearGridData(G_GRDDETAILC2);
    //$NC.clearGridData(G_GRDSUBC1);
    $NC.clearGridData(G_GRDSUBC2);
    break;
  case "D":
    $("#btnProcessD").addClass("ui-clr-selected");

    // 스플리터 컨트롤
    if ($NC.isSplitter("#divSplitterD1")) {
      $("#divSplitterD1").trigger("resize");
      $("#divSplitterD2").trigger("resize");
    } else {
      $NC.setInitSplitter("#divSplitterD1", "v", 600);
      $NC.setInitSplitter("#divSplitterD2", "h", 300);
    }

    // 그리드 초기화
    $NC.clearGridData(G_GRDMASTERD);
    $NC.clearGridData(G_GRDDETAILD);
    $NC.clearGridData(G_GRDSUBD);
    break;
  case "E":
    $("#btnProcessE").addClass("ui-clr-selected");

    // 스플리터 컨트롤
    if ($NC.isSplitter("#divSplitterE")) {
      $("#divSplitterE").trigger("resize");
    } else {
      $NC.setInitSplitter("#divSplitterE", "h", 250);
    }

    // 그리드 초기화
    $NC.clearGridData(G_GRDMASTERE);
    $NC.clearGridData(G_GRDDETAILE);
    break;
  case "F":
    $("#btnProcessF").addClass("ui-clr-selected");

    // 스플리터 컨트롤
    if ($NC.isSplitter("#divSplitterF")) {
      $("#divSplitterF").trigger("resize");
    } else {
      $NC.setInitSplitter("#divSplitterF", "h", 250);
    }

    // 그리드 초기화
    $NC.clearGridData(G_GRDMASTERF);
    $NC.clearGridData(G_GRDDETAILF);
    break;
  }

  _Inquiry();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var con = getConditionParam();

  if ($NC.isNull(con.CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  if ($NC.isNull(con.BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  if ($NC.isNull(con.XDOCK_DATE)) {
    alert("작업일자를 입력하십시오.");
    $NC.setFocus("#dtpQXDock_Date");
    return;
  }
  if (con.STATE_PRE_YN === "N" && con.STATE_CUR_YN === "N") {
    alert("검색구분을 선택하십시오.");
    $NC.setFocus("#chkQState_Pre_Yn");
    return;
  }

  switch ($NC.G_VAR.activeView.PROCESS_CD) {
  case "A":
    break;
  case "B":
    inquiryB(con);
    break;
  case "C":
    inquiryC(con);
    break;
  case "D":
    inquiryD(con);
    break;
  case "E":
    inquiryE(con);
    break;
  case "F":
    inquiryF(con);
    break;
  }
}

function getConditionParam() {

  var con = new Object();

  con.CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  con.BU_CD = $NC.getValue("#edtQBu_Cd");
  con.XDOCK_DATE = $NC.getValue("#dtpQXDock_Date");
  con.ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
  con.ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
  con.XDOCK_TYPE = $NC.getValue("#cboQXDock_Type");
  con.BU_NO = $NC.getValue("#edtQBu_No", true);
  con.VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);
  con.DELIVERY_BATCH = $NC.getValue("#cboQDelivery_Batch", true);
  con.DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
  con.RDELIVERY_CD = $NC.getValue("#edtQRDelivery_Cd", true);
  con.BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  con.ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  con.ITEM_NM = $NC.getValue("#edtQItem_NM", true);
  con.STATE_PRE_YN = $NC.getValue("#chkQState_Pre_Yn");
  con.STATE_CUR_YN = $NC.getValue("#chkQState_Cur_Yn");

  return con;
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {
  
  switch ($NC.G_VAR.activeView.PROCESS_CD) {
  case "A":
    break;
  case "B":
    saveB();
    break;
  case "C":
    saveC();
    break;
  case "D":
    saveD();
    break;
  case "E":
    saveE();
    break;
  case "F":
    saveF();
    break;
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
    alert("사업부 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var XDOCK_DATE = $NC.getValue("#dtpQXDock_Date");
  if ($NC.isNull(XDOCK_DATE)) {
    alert("CD일자를 입력하십시오.");
    $NC.setFocus("#dtpQXDock_Date");
    return;
  }
  
  var grdObject;
  var checkedValueDS = [ ];
  var checkCnt = 0;

  switch(printIndex) {
  case "1": // 입고작업 지시서(등록)
    grdObject = G_GRDMASTERB;
    var rowCount = grdObject.data.getLength();
    for ( var row = 0; row < rowCount; row++) {
      var rowData = grdObject.data.getItem(row);
      if (rowData.CHECK_YN === "Y") {
        checkCnt++;
        if (rowData.XDOCK_STATE == "20") {
          checkedValueDS.push(rowData.XDOCK_NO);
        }
      }
    }
    break;
  case "2": // 입고확정 리포트(검수 일반)
    grdObject = G_GRDMASTERC;
    var rowCount = grdObject.data.getLength();
    for ( var row = 0; row < rowCount; row++) {
      var rowData = grdObject.data.getItem(row);
      if (rowData.CHECK_YN === "Y") {
        checkCnt++;
        if (rowData.XDOCK_STATE == "30" && rowData.XDOCK_TYPE == "1") {
          checkedValueDS.push(rowData.XDOCK_NO);
        }
      }
    }
    break;
  case "3": // 입고확정 리포트(검수 ASN)
    grdObject = G_GRDMASTERC;
    var rowCount = grdObject.data.getLength();
    for ( var row = 0; row < rowCount; row++) {
      var rowData = grdObject.data.getItem(row);
      if (rowData.CHECK_YN === "Y") {
        checkCnt++;
        if (rowData.XDOCK_STATE == "30" && rowData.XDOCK_TYPE == "2") {
          checkedValueDS.push(rowData.XDOCK_NO);
        }
      }
    }
    break;
  case "4": // 분배 지시서(분배 일반)
    grdObject = G_GRDMASTERC;
    var rowCount = grdObject.data.getLength();
    for ( var row = 0; row < rowCount; row++) {
      var rowData = grdObject.data.getItem(row);
      if (rowData.CHECK_YN === "Y") {
        checkCnt++;
        if (rowData.XDOCK_STATE == "30" && rowData.XDOCK_TYPE == "1") {
          checkedValueDS.push(rowData.XDOCK_NO);
        }
      }
    }
    break;
  case "5": // 분배 지시서(분배 ASN)
    grdObject = G_GRDMASTERC;
    var rowCount = grdObject.data.getLength();
    for ( var row = 0; row < rowCount; row++) {
      var rowData = grdObject.data.getItem(row);
      if (rowData.CHECK_YN === "Y") {
        checkCnt++;
        if (rowData.XDOCK_STATE == "30" && rowData.XDOCK_TYPE == "2") {
          checkedValueDS.push(rowData.XDOCK_NO);
        }
      }
    }
    break;  
  }

  // 선택 건수 체크
  if (checkCnt === 0) {
    alert("[" + printName + "]출력할 데이터를 선택하십시오.");
    return;
  }
  if (checkedValueDS.length == 0) {
    alert("[" + printName + "]출력 가능한 데이터를 선택하십시오.");
    return;
  }

  // 파라메터 세팅
  var reportDoc;
  var queryId, queryParams;
  var internalQueryYn = "N";

  switch (printIndex) {
  case "1": // 입고작업 지시서(등록)
    reportDoc = "lx/PAPER_LX01";
    queryId = "WR.RS_PAPER_LX01";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_XDOCK_DATE: XDOCK_DATE,
      P_PROCESS_GRP: "LX"
    };
    break;
  case "2": // 입고확정 리포트(검수 일반)
    reportDoc = "lx/PAPER_LX02";
    queryId = "WR.RS_PAPER_LX02";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_XDOCK_DATE: XDOCK_DATE,
      P_PROCESS_GRP: "LX"
    };
    break;
  case "3": // 입고확정 리포트(검수 ASN)
    reportDoc = "lx/PAPER_LX03";
    queryId = "WR.RS_PAPER_LX03";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_XDOCK_DATE: XDOCK_DATE,
      P_PROCESS_GRP: "LX"
    };
    break;
  case "4": // 분배 지시서(검수 일반)
    reportDoc = "lx/PAPER_LX04";
    queryId = "WR.RS_PAPER_LX04";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_XDOCK_DATE: XDOCK_DATE,
      P_PROCESS_GRP: "LX"
    };
    break;  
  case "5": // 분배 지시서(검수 ASN)
    reportDoc = "lx/PAPER_LX05";
    queryId = "WR.RS_PAPER_LX05";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_XDOCK_DATE: XDOCK_DATE,
      P_PROCESS_GRP: "LX"
    };
    break; 
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

  var grdObject = $NC.getGridGlobalVar(args.grid);

  if (grdObject.view.getEditorLock().isActive()) {
    grdObject.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(grdObject, args.row);

  var rowData = grdObject.data.getItem(args.row);

  if (args.cell == grdObject.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  grdObject.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  grdObject.lastRowModified = true;

}

/**
 * Grid Column 중 진행상태의 Fomatter
 */
function grdStateFormatter(row, cell, value, columnDef, dataContext) {

  return "<span class='ui-icon-state-" + dataContext.XDOCK_STATE + "'>&nbsp;</span>";
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();

  // 저장
  if (permission.canSave) {

  }

  // 삭제
  if (permission.canDelete) {

  }

  // 확정
  if (permission.canConfirm) {
    $("#btnProcessNxtB").click(onProcessNxtB);
    $("#btnProcessNxtC1").click(onProcessNxtC1);
    $("#btnProcessNxtC2").click(onProcessNxtC2);
    $("#btnProcessNxtC3").click(onProcessNxtC3);
    $("#btnProcessNxtD1").click(onProcessNxtD1);
    $("#btnProcessNxtD2").click(onProcessNxtD2);
    $("#btnProcessNxtE").click(onProcessNxtE);
    $("#btnProcessNxtF").click(onProcessNxtF);
  }
  $NC.setEnable("#btnProcessNxtB", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtC1", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtC2", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtC3", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtD1", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtD2", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtE", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtF", permission.canConfirm);

  // 확정취소
  if (permission.canConfirmCancel) {
    $("#btnProcessPreB").click(onProcessPreB);
    $("#btnProcessPreC1").click(onProcessPreC1);
    $("#btnProcessPreC2").click(onProcessPreC2);
    $("#btnProcessPreC3").click(onProcessPreC3);
    $("#btnProcessPreD1").click(onProcessPreD1);
    $("#btnProcessPreD2").click(onProcessPreD2);
    $("#btnProcessPreE").click(onProcessPreE);
    $("#btnProcessPreF").click(onProcessPreF);
  }
  $NC.setEnable("#btnProcessPreB", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreC1", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreC2", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreC3", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreD1", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreD2", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreE", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreF", permission.canConfirmCancel);
}

function setTopButtons() {

  // 기본값
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.printOptions = [ ];
  switch($NC.G_VAR.activeView.PROCESS_CD) {
  case "A" :
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";
    break;
  case "B" :
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    if (G_GRDMASTERB.data.getLength() > 0) {
      $NC.G_VAR.buttons._print = "1";
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: "1",
        PRINT_COMMENT: "입고작업 지시서"
      });
    }
    break;
  case "C" :
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    if (G_GRDMASTERC.data.getLength() > 0) {
      $NC.G_VAR.buttons._print = "1";
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: "2",
        PRINT_COMMENT: "입고확정 리포트(일반)"
      });
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: "3",
        PRINT_COMMENT: "입고확정 리포트(ASN)"
      });
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: "4",
        PRINT_COMMENT: "분배 지시서(일반)"
      });
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: "5",
        PRINT_COMMENT: "분배 지시서(ASN)"
      });
    }
    break;
  case "D" :
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";
    break;
  case "E" :
    $NC.G_VAR.buttons._save = "0";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";
    break;
  case "F" :
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._cancel = "0";
    $NC.G_VAR.buttons._delete = "0";
    $NC.G_VAR.buttons._print = "0";
    break;
  }

  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
}

function onGetMasterSummary(ajaxData) {

  var rows = $NC.toArray(ajaxData);
  if (rows.length === 0) {
    for (var i = 0; i < 6; i++) {
      $NC.setValue("#divProcessCnt" + String.fromCharCode(65 + i) + " > div.tabNum", "0 / 0");
    }
  } else {
    var rowData = rows[0];
    var process_Cd, process_Cnt, process_Qty;
    for (var i = 0; i < 6; i++) {
      process_Cd = String.fromCharCode(65 + i);
      process_Cnt = rowData["CNT_" + process_Cd];
      process_Qty = rowData["QTY_" + process_Cd];
      if ($NC.isNull(process_Cnt)) {
        process_Cnt = "0";
      }
      if ($NC.isNull(process_Qty)) {
        process_Qty = "0";
      }
      $NC.setValue("#divProcessCnt" + process_Cd + " > div.tabNum", $NC.getDisplayNumber(process_Cnt) + " / "
          + $NC.getDisplayNumber(process_Qty));
    }
  }
}

function onGetProcessInfo(ajaxData) {
  // 버튼 전체 비활성화
  for (var i = 0; i < 6; i++) {
    $("#btnProcess" + String.fromCharCode(65 + i)).prop("disabled", true);
  }
  var resultDS = $NC.toArray(ajaxData);
  var resultDSCnt = resultDS.length;
  if (resultDSCnt > 0) {
    var resultData;
    // 프로세스 사용 가능여부 세팅
    for (var i = 0; i < resultDSCnt; i++) {
      resultData = resultDS[i];
      $("#btnProcess" + resultData.PROCESS_CD).prop("disabled", resultData.EXEC_PROCESS_YN === "N");
    }

    if ($("#btnProcess" + $NC.G_VAR.activeView.PROCESS_CD).prop("disabled") === false) {
      return;
    }
    // 현재 선택된 프로세스 View가 사용 가능하지 않으면 사용가능한 첫번째 뷰 선택
    var process_Cd;
    for (var i = 0; i < 6; i++) {
      process_Cd = String.fromCharCode(65 + i);
      if ($("#btnProcess" + process_Cd).prop("disabled") === false) {
        $("#btnProcess" + process_Cd).click();
        return;
      }
    }
  }

  $("#btnProcess" + $NC.G_VAR.activeView.PROCESS_CD).removeClass("ui-clr-selected");
  $("#divSubView" + $NC.G_VAR.activeView.PROCESS_CD).hide();
  alert("수행 가능한 프로세스가 없습니다.\n사업부별 프로세스관리에서 수행 프로세스를 등록하십시오.");
  $NC.G_VAR.activeView.PROCESS_CD = "";
  $("#btnProcessB").trigger("click");
}

/**
 * 처리단계 별 PO/수량 셋팅
 */
function setMasterSummaryInfo() {

  var con = getConditionParam();

  // 데이터 조회
  $NC.serviceCall("/LX02010E/getDataSet.do", {
    P_QUERY_ID: "LX02010E.RS_MASTER",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: con.CENTER_CD,
      P_BU_CD: con.BU_CD,
      P_XDOCK_DATE: con.XDOCK_DATE,
      P_ORDER_DATE1: con.ORDER_DATE1,
      P_ORDER_DATE2: con.ORDER_DATE2,
      P_XDOCK_TYPE: con.XDOCK_TYPE,
      P_BU_NO: con.BU_NO,
      P_VENDOR_CD: con.VENDOR_CD,
      P_DELIVERY_CD: con.DELIVERY_CD,
      P_RDELIVERY_CD: con.RDELIVERY_CD,
      P_BRAND_CD: con.BRAND_CD,
      P_ITEM_CD: con.ITEM_CD,
      P_ITEM_NM: con.ITEM_NM
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
      P_PROCESS_GRP: "LX"
    })
  }, onGetProcessInfo);
}

function setPolicyValInfo() {

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    $NC.G_VAR.policyVal[POLICY_CD] = "";
  }

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCallAndWait("/LX02010E/callSP.do", {
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

      var policyVal = resultData.O_POLICY_VAL;
      // 재고관리 기준 정책(유통기한, 제조배치 칼럼 표시 제어)
      if (resultData.P_POLICY_CD == "LI420") {
        G_GRDDETAILB.view.setColumns(grdDetailBOnGetColumns(policyVal));
        G_GRDDETAILC1.view.setColumns(grdDetailC1OnGetColumns(policyVal));
      }
    }
  }
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

  // 브랜드 조회조건 초기화
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");

  onChangingCondition();
  setPolicyValInfo();
  setProcessStateInfo();
  setMasterProcessInfo();
}

/**
 * 공급처 검색 결과
 * 
 * @param seletedRowData
 */
function showVendorPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd", true);

  $NP.showVendorPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_VENDOR_CD: "%",
      P_VIEW_DIV: "2"
    }
  }, onVendorPopup, function() {
    $NC.setFocus("#edtQVendor_Cd", true);
  });
}

function onVendorPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQVendor_Cd", resultInfo.VENDOR_CD);
    $NC.setValue("#edtQVendor_Nm", resultInfo.VENDOR_NM);
  } else {
    $NC.setValue("#edtQVendor_Cd");
    $NC.setValue("#edtQVendor_Nm");
    $NC.setFocus("#edtQVendor_Cd", true);
  }
  onChangingCondition();
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

/**
 * 처리단계 사용여부 셋팅
 */
function setProcessStateInfo() {

  for ( var PROCESS_CD in $NC.G_VAR.stateFWBW) {
    $NC.G_VAR.stateFWBW[PROCESS_CD].CONFIRM = "";
    $NC.G_VAR.stateFWBW[PROCESS_CD].CANCEL = "";
  }

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var PROCESS_GRP = "LX";

  // 데이터 조회
  $NC.serviceCall("/LX02010E/getDataSet.do", {
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
    for (var row = 0, rowCount = resultData.length; row < rowCount; row++) {
      rowData = resultData[row];
      $NC.G_VAR.stateFWBW[rowData.PROCESS_CD].CONFIRM = rowData.PROCESS_STATE_CONFIRM;
      $NC.G_VAR.stateFWBW[rowData.PROCESS_CD].CANCEL = rowData.PROCESS_STATE_CANCEL;
    }
  }
}

function grdOnCheckBoxClick(grdObject, e, args) {

  if (args.cell === grdObject.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {
      alert("test");
      if (grdObject.view.getEditorLock().isActive() && !grdObject.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = grdObject.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {

        if (rowData.CRUD === "R") {
          rowData.CRUD = "U";
        }

        grdObject.data.updateItem(rowData.id, rowData);
      }
      // e.stopPropagation();
      // e.stopImmediatePropagation();
    }
    return;
  }
}

function grdOnHeaderCheckBoxClick(grdObject, e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (grdObject.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (grdObject.view.getEditorLock().isActive() && !grdObject.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = grdObject.data.getLength();
      var rowData;
      grdObject.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = grdObject.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          grdObject.data.updateItem(rowData.id, rowData);
        }
      }
      grdObject.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function setConditionHide() {

  // 배열형태로 조회조건 표시여부 프로세스 별로 관리
  var controlArr = {
    "ORDER_DATE": ["B"],
    "XDOCK_TYPE": ["C", "D", "E", "F"],
    "DELIVERY_BATCH": ["E", "F"],
    "DELIVERY_CD": ["E", "F"]
  };

  // 예정일자 조회조건 컨트롤
  if ($.inArray($NC.G_VAR.activeView.PROCESS_CD, controlArr.ORDER_DATE) >= 0) {
    $("#divOrder_Date").show();
  } else {
    $("#divOrder_Date").hide();
  }

  // 처리유형 조회조건 컨트롤
  if ($.inArray($NC.G_VAR.activeView.PROCESS_CD, controlArr.XDOCK_TYPE) >= 0) {
    $("#divXDock_Type").show();
  } else {
    $("#divXDock_Type").hide();
  }

  // 운송차수 추가조회조건 컨트롤
  if ($.inArray($NC.G_VAR.activeView.PROCESS_CD, controlArr.DELIVERY_BATCH) >= 0) {
    $("#tdQDsp_Delivery_Batch").parent().show();
  } else {
    $("#tdQDsp_Delivery_Batch").parent().hide();
  }

  // 배송처, 실배송처 추가조회조건 컨트롤
  if ($.inArray($NC.G_VAR.activeView.PROCESS_CD, controlArr.DELIVERY_CD) >= 0) {
    $("#tdQDsp_Delivery_Cd").parent().show();
    $("#tdQDsp_RDelivery_Cd").parent().show();
  } else {
    $("#tdQDsp_Delivery_Cd").parent().hide();
    $("#tdQDsp_RDelivery_Cd").parent().hide();
  }
}

/**
 * 물류센터/사업부/작업일자 값 변경시 운송차수 콤보 재설정
 */
function setDeliveryBatchCombo() {

  var cboSelector = "#cboQDelivery_Batch";
  // 조회조건 - 배송차수 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_DELIVERY_BATCH",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
      P_OUTBOUND_DATE: $NC.getValue("#dtpXDock_Date")
    })
  }, {
    selector: cboSelector,
    codeField: "DELIVERY_BATCH",
    nameField: "DELIVERY_BATCH",
    fullNameField: "DELIVERY_BATCH_F",
    addCustom: {
      codeFieldVal: "%",
      nameFieldVal: "전체"
    },
    selectOption: "L",
    onComplete: function() {
      //$NC.setEnable("#edtBatch_Nm" + processCd, $NC.getValue(cboSelector) == "000");
    }
  });
}

function refloatSubLayer(selector, width, height) {

  var layerTop = $NC.getTruncVal(($("body").height() - height) / 2);
  var layerLeft = $NC.getTruncVal(($("body").width() - width) / 2);

  selector.css({
    "position": "absolute",
    "top": layerTop,
    "left": layerLeft,
    "z-index": 1000,
    "width": width,
    "height": height
  });
}

function processFormatter(row, cell, value, columnDef, dataContext) {
  
  if (dataContext.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
    return "<span class='ui-icon-prior'>&nbsp;</span>";
  } else if (dataContext.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
    return "<span class='ui-icon-next'>&nbsp;</span>";
  } else {
    return "<span class='ui-icon-stop'>&nbsp;</span>";
  }
};

function getXDockState(params, onSuccess) {

  // 데이터 조회
  $NC.serviceCall("/LX02010E/callSP.do", {
    P_QUERY_ID: "WF.GET_LX_XDOCK_STATE",
    P_QUERY_PARAMS: $NC.getParams(params)
  }, onSuccess);
}

function getSaveDataCnt(grdObject) {
  
  var rowCount = grdObject.data.getLength();
  var saveDataCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    rowData = grdObject.data.getItem(row);
    if (rowData.CRUD !== "R") {
      saveDataCnt++;
    }
  }
  return saveDataCnt;
}