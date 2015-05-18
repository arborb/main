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
      RI190: "",// 매입금액 계산정책
      RI210: "", // 반품입고등록 전표생성 가능여부
      RI221: "", // 예정으로 등록 시 추가/삭제 허용 기준
      RI230: "", // 로케이션ID 사용기준
      RI320: "", // 재고 로케이션 생성 기준
      RI240: "", // 반품입고시 기준 상품상태
      RI410: "", // 반품입고확정 수량수정 가능여부
      RI420: "" // 재고 관리 기준
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
    }
  });

  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();

  $("#btnProcessB").addClass("ui-clr-selected");

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

  // 반입확정/취소 버튼 권한 체크 및 클릭 이벤트 연결
  setUserProgramPermission();

  // 초기화 및 초기갑 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $NC.setValue("#edtQDelivery_Cd");
  $NC.setValue("#edtQDelivery_Nm");
  $NC.setValue("#edtQRDelivery_Cd");
  $NC.setValue("#edtQRDelivery_Nm");
  $NC.setValue("#edtQBu_No");
  $NC.setValue("#edtQItem_Cd");
  $NC.setValue("#edtQItem_Nm");
  $NC.setValue("#chkQState_Pre_Yn", "Y");
  $NC.setValue("#chkQState_Cur_Yn", "Y");

  $NC.setInitDatePicker("#dtpQInbound_Date");
  $NC.setInitDatePicker("#dtpQOrder_Date1");
  $NC.setInitDatePicker("#dtpQOrder_Date2");

  $NC.setValue("#dtpQOrder_Date1", $NC.addDay($NC.getValue("#dtpQOrder_Date1"), -3));

  // 조회조건 - 반입구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "E3",
      P_SUB_CD2: "E8"
    })
  }, {
    selector: "#cboQInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true,
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
      // 반입전표/수량 정보 세팅, 프로세스 정보, ※ 조회 조건이 모두 세팅이 되는 시점
      setTimeout(function() {
        setMasterSummaryInfo();
        setMasterProcessInfo();
        setPolicyValInfo();
        setProcessStateInfo();
      }, 300);
    }
  });

  // 그리드 초기화 - 반입등록
  grdMasterBInitialize();
  grdDetailBInitialize();

  // 그리드 초기화 - 반입지시
  grdMasterCInitialize();
  grdLocationIdCInitialize();
  grdDetailCInitialize();
  grdSubCInitialize();

  // 그리드 초기화 - 반입확정
  grdMasterDInitialize();
  grdDetailDInitialize();
  grdSubDInitialize();

  // 그리드 초기화 - 반입적치
  grdMasterEInitialize();
  grdDetailEInitialize();
  grdSubEInitialize();
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.leftViewWidth = 500;
  $NC.G_OFFSET.locIdViewWidth = 250;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientHeight -= $("#divMasterInfoView").outerHeight();

  var container;
  var splitter;
  // 입고등록
  if ($NC.G_VAR.activeView.PROCESS_CD === "B") {
    // Splitter 컨테이너 크기 조정
    container = $($NC.G_VAR.activeView.container);
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterB", clientWidth, $("#grdMasterB").parent().height() - $NC.G_LAYOUT.header);
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdDetailB", clientWidth, $("#grdDetailB").parent().height() - $NC.G_LAYOUT.header);
    return;
  }

  // 입고지시
  if ($NC.G_VAR.activeView.PROCESS_CD === "C") {
    // Splitter 컨테이너 크기 조정
    container = $($NC.G_VAR.activeView.container);
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterC", container.children("div:first").width(), $("#grdMasterC").parent().height()
        - $NC.G_LAYOUT.header);

    container = $("#divSubViewCDetail");
    splitter = container.children(".splitter-bar");
    splitter.width(container.width() - $NC.G_LAYOUT.border1);
    clientWidth = container.width();

    clientHeight = container.children("div:first").height();

    $NC.resizeContainer("#divGrdLocationIdCView", $NC.G_OFFSET.locIdViewWidth, clientHeight);

    // LocationId Grid 사이즈 조정
    $NC.resizeGrid("#grdLocationIdC", $NC.G_OFFSET.locIdViewWidth, clientHeight - $NC.G_LAYOUT.header);

    var subWidth = clientWidth - $NC.G_OFFSET.locIdViewWidth - $NC.G_LAYOUT.border1
        - ($NC.G_OFFSET.locIdViewWidth > 0 ? $NC.G_LAYOUT.margin1 : -$NC.G_LAYOUT.border1);
    $NC.resizeContainer("#divGrdDetailCView", subWidth, clientHeight);

    // Detail Grid 사이즈 조정
    $NC.resizeGrid("#grdDetailC", subWidth, clientHeight - $NC.G_LAYOUT.header);

    // Sub Grid 사이즈 조정
    $NC.resizeGrid("#grdSubC", clientWidth, $("#grdSubC").parent().height() - $NC.G_LAYOUT.header);
    return;
  }

  // 입고확정
  if ($NC.G_VAR.activeView.PROCESS_CD === "D") {
    // Splitter 컨테이너 크기 조정
    container = $($NC.G_VAR.activeView.container);
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Master Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterD", container.children("div:first").width(), $("#grdMasterD").parent().height()
        - $NC.G_LAYOUT.header);

    // Splitter 컨테이너 크기 조정
    container = $("#divSubViewDDetail");
    splitter = container.children(".splitter-bar");
    splitter.width(container.width() - $NC.G_LAYOUT.border1);

    clientWidth = container.width();

    // Detail Grid 사이즈 조정
    $NC.resizeGrid("#grdDetailD", clientWidth, $("#grdDetailD").parent().height() - $NC.G_LAYOUT.header);

    // Sub Grid 사이즈 조정
    $NC.resizeGrid("#grdSubD", clientWidth, $("#grdSubD").parent().height() - $NC.G_LAYOUT.header);
    return;
  }

  // 입고적치
  if ($NC.G_VAR.activeView.PROCESS_CD === "E") {
    // Splitter 컨테이너 크기 조정
    container = $($NC.G_VAR.activeView.container);
    container.css({
      "min-width": clientWidth,
      "max-width": clientWidth,
      "min-height": clientHeight,
      "max-height": clientHeight
    });

    // Master Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterE", container.children("div:first").width(), $("#grdMasterE").parent().height()
        - $NC.G_LAYOUT.header);

    // Splitter 컨테이너 크기 조정
    container = $("#divSubViewEDetail");
    splitter = container.children(".splitter-bar");
    splitter.width(container.width() - $NC.G_LAYOUT.border1);
    clientWidth = container.width();

    // Detail Grid 사이즈 조정
    $NC.resizeGrid("#grdDetailE", clientWidth, $("#grdDetailE").parent().height() - $NC.G_LAYOUT.header);

    // Sub Grid 사이즈 조정
    $NC.resizeGrid("#grdSubE", clientWidth, $("#grdSubE").parent().height() - $NC.G_LAYOUT.header);
    return;
  }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  // 브랜드 Key 입력
  switch (id) {
  case "CENTER_CD":
    onChangingCondition();
    setMasterProcessInfo();
    setPolicyValInfo();
    setProcessStateInfo();
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
  case "INBOUND_DATE":
    $NC.setValueDatePicker(view, val, "반입일자를 정확히 입력하십시오.");
    break;
  case "ORDER_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "ORDER_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
  }
  onChangingCondition();
}

function onChangingCondition() {

  var process_Cd;
  for (var i = 1; i < 5; i++) {
    process_Cd = String.fromCharCode(65 + i);

    // 마스터
    $NC.clearGridData(window["G_GRDMASTER" + process_Cd]);
    // 디테일
    $NC.clearGridData(window["G_GRDDETAIL" + process_Cd]);

    // 지시 - 등록 이후
    if (process_Cd > "B") {
      $NC.clearGridData(window["G_GRDSUB" + process_Cd]);
    }
    // 로케이션ID - 반입지시
    if (process_Cd = "C") {
      $NC.clearGridData(window["G_GRDLOCATIONID" + process_Cd]);
    }
  }

  setMasterSummaryInfo();

  // 공통 버튼 활성화
  setTopButtons();
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

  for (var i = 0; i <= 5; i++) {
    var initProcess_Cd = String.fromCharCode(65 + i);
    $("#btnProcess" + initProcess_Cd).removeClass("ui-clr-selected");
    $("#divSubView" + initProcess_Cd).hide();
  }

  view.addClass("ui-clr-selected");
  $("#divSubView" + process_Cd).show();
  $NC.G_VAR.activeView.container = "#divSubView" + process_Cd;
  $NC.G_VAR.activeView.PROCESS_CD = process_Cd;

  // 입고 등록
  if ($NC.G_VAR.activeView.PROCESS_CD === "B") {
    $("#tdQOrder_Date").show(); // 예정일자 표시
    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
      // 스필리터를 통한 _OnResize 호출
      $($NC.G_VAR.activeView.container).trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter($NC.G_VAR.activeView.container, "h");
    }

    // 공통 버튼 활성화
    // setTopButtons();
    _Inquiry();
    return;
  }

  $("#tdQOrder_Date").hide(); // 예정일자 표시
  var subContainer = null;
  if ($NC.G_VAR.activeView.PROCESS_CD === "C") {// 입고 지시
    subContainer = $("#divSubViewCDetail");
  } else if ($NC.G_VAR.activeView.PROCESS_CD === "D") {// 입고 확정
    subContainer = $("#divSubViewDDetail");
  } else if ($NC.G_VAR.activeView.PROCESS_CD === "E") {// 입고 적치
    subContainer = $("#divSubViewEDetail");
  }

  // 스플리터가 초기화가 되어 있으면 _OnResize 호출
  if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
    // 스필리터를 통한 _OnResize 호출
    $($NC.G_VAR.activeView.container).trigger("resize");
    subContainer.trigger("resize");
  } else {
    $NC.setInitSplitter($NC.G_VAR.activeView.container, "v", $NC.G_OFFSET.leftViewWidth, 270, 400);
    $NC.setInitSplitter(subContainer, "h", 400);
  }

  // 공통 버튼 활성화
  // setTopButtons();
  _Inquiry();
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
  var INBOUND_DATE = $NC.getValue("#dtpQInbound_Date");
  if ($NC.isNull(INBOUND_DATE)) {
    alert("반입일자를 입력하십시오.");
    $NC.setFocus("#dtpQInbound_Date");
    return;
  }
  var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
  if ($NC.isNull(ORDER_DATE1)) {
    alert("반입예정 검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }
  var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
  if ($NC.isNull(ORDER_DATE2)) {
    alert("반입예정 검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date2");
    return;
  }
  if (ORDER_DATE1 > ORDER_DATE2) {
    alert("반입예정일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }
  var INOUT_CD = $NC.getValue("#cboQInout_Cd");
  var BU_NO = $NC.getValue("#edtQBu_No");
  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  var ITEM_NM = $NC.getValue("#edtQItem_Nm");
  var STATE_PRE_YN = $NC.getValue("#chkQState_Pre_Yn");
  var STATE_CUR_YN = $NC.getValue("#chkQState_Cur_Yn");
  if (STATE_PRE_YN === "N" && STATE_CUR_YN === "N") {
    alert("검색구분을 선택하십시오.");
    $NC.setFocus("#chkQState_Pre_Yn");
    return;
  }
  var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
  var RDELIVERY_CD = $NC.getValue("#edtQRDelivery_Cd", true);
//  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd", true);

  // 반입등록
  if ($NC.G_VAR.activeView.PROCESS_CD === "B") {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERB);
    // 파라메터 세팅
    G_GRDMASTERB.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INBOUND_DATE: INBOUND_DATE,
      P_ORDER_DATE1: ORDER_DATE1,
      P_ORDER_DATE2: ORDER_DATE2,
      P_INOUT_CD: INOUT_CD,
      P_BRAND_CD: BRAND_CD,
      P_BU_NO: BU_NO,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_DELIVERY_CD: DELIVERY_CD,
      P_RDELIVERY_CD: RDELIVERY_CD,
      P_STATE_PRE_YN: STATE_PRE_YN,
      P_STATE_CUR_YN: STATE_CUR_YN,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });
    // 데이터 조회
    $NC.serviceCall("/RI02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERB), onGetMasterB);
    return;
  }

  // 반입지시
  if ($NC.G_VAR.activeView.PROCESS_CD === "C") {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERC);
    // 파라메터 세팅
    G_GRDMASTERC.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INBOUND_DATE: INBOUND_DATE,
      P_INOUT_CD: INOUT_CD,
      P_BRAND_CD: BRAND_CD,
      P_BU_NO: BU_NO,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_DELIVERY_CD: DELIVERY_CD,
      P_RDELIVERY_CD: RDELIVERY_CD,
      P_STATE_PRE_YN: STATE_PRE_YN,
      P_STATE_CUR_YN: STATE_CUR_YN,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });
    // 데이터 조회
    $NC.serviceCall("/RI02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERC), onGetMasterC);

    return;
  }

  // 반입확정
  if ($NC.G_VAR.activeView.PROCESS_CD === "D") {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERD);
    // 파라메터 세팅
    G_GRDMASTERD.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INBOUND_DATE: INBOUND_DATE,
      P_INOUT_CD: INOUT_CD,
      P_BRAND_CD: BRAND_CD,
      P_BU_NO: BU_NO,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_DELIVERY_CD: DELIVERY_CD,
      P_RDELIVERY_CD: RDELIVERY_CD,
      P_STATE_PRE_YN: STATE_PRE_YN,
      P_STATE_CUR_YN: STATE_CUR_YN,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });
    // 데이터 조회
    $NC.serviceCall("/LI02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERD), onGetMasterD);
    return;
  }

  // 반입적치
  if ($NC.G_VAR.activeView.PROCESS_CD === "E") {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERE);
    // 파라메터 세팅
    G_GRDMASTERE.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INBOUND_DATE: INBOUND_DATE,
      P_INOUT_CD: INOUT_CD,
      P_BRAND_CD: BRAND_CD,
      P_BU_NO: BU_NO,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_DELIVERY_CD: DELIVERY_CD,
      P_RDELIVERY_CD: RDELIVERY_CD,
      P_STATE_PRE_YN: STATE_PRE_YN,
      P_STATE_CUR_YN: STATE_CUR_YN,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });
    // 데이터 조회
    $NC.serviceCall("/LI02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERE), onGetMasterE);
    return;

  }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  if ($NC.G_VAR.policyVal.RI210 !== "Y") {
    return;
  }
  if ($NC.G_VAR.activeView.PROCESS_CD !== "B") {
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "RI02011P",
    PROGRAM_NM: "반입등록/수정",
    url: "ri/RI02011P.html",
    width: 1024,
    height: 600,
    userData: {
      P_PROCESS_CD: "N",
      P_CENTER_CD: CENTER_CD,
      P_CENTER_CD_F: CENTER_CD_F,
      P_BU_CD: BU_CD,
      P_BU_NM: BU_NM,
      P_CUST_CD: CUST_CD,
      P_POLICY_RI190: $NC.G_VAR.policyVal.RI190,
      P_POLICY_RI210: $NC.G_VAR.policyVal.RI210,
      P_POLICY_RI221: $NC.G_VAR.policyVal.RI221,
      P_POLICY_RI240: $NC.G_VAR.policyVal.RI240,
      P_POLICY_RI230: $NC.G_VAR.policyVal.RI230,
      P_POLICY_RI420: $NC.G_VAR.policyVal.RI420,
      P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
      P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
      P_MASTER_DS: {},
      P_DETAIL_DS: [ ]
    },
    onOk: function() {
      _Inquiry();
    }
  });
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  // 반입지시
  if ($NC.G_VAR.activeView.PROCESS_CD === "C") {

    var rowCount = G_GRDMASTERC.data.getItems().length;
    if (rowCount === 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    // 현재 수정모드면
    if (G_GRDSUBC.view.getEditorLock().isActive()) {
      G_GRDSUBC.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (G_GRDSUBC.lastRow != null) {
      if (!grdSubCOnBeforePost(G_GRDSUBC.lastRow)) {
        return;
      }
    }

    if ($NC.G_VAR.policyVal.RI230 == "1") {
      var saveDS = [ ];
      // 필터링 된 데이터라 전체 데이터를 기준으로 처리
      var rows = G_GRDSUBC.data.getItems();
      var rowCount = rows.length;
      for (var row = 0; row < rowCount; row++) {
        var rowData = rows[row];
        if (rowData.CRUD !== "R") {
          var saveData = {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_INBOUND_DATE: rowData.INBOUND_DATE,
            P_INBOUND_NO: rowData.INBOUND_NO,
            P_LINE_NO: rowData.LINE_NO,
            P_INBOUND_SEQ: rowData.INBOUND_SEQ,
            P_VALID_DATE: rowData.VALID_DATE,
            P_BATCH_NO: rowData.BATCH_NO,
            P_ENTRY_QTY: rowData.ENTRY_QTY,
            P_CONFIRM_QTY: rowData.ENTRY_QTY,
            P_PUTAWAY_QTY: rowData.ENTRY_QTY,
            P_INSPECT_YN: "N",
            P_CRUD: rowData.CRUD
          };
          saveDS.push(saveData);
        }
      }

      if (saveDS.length > 0) {
        $NC.serviceCall("/RI02010E/saveDirections.do", {
          P_DS_MASTER: $NC.getParams({
            P_CENTER_CD: saveDS[0].P_CENTER_CD,
            P_BU_CD: saveDS[0].P_BU_CD,
            P_INBOUND_DATE: saveDS[0].P_INBOUND_DATE,
            P_INBOUND_NO: saveDS[0].P_INBOUND_NO,
            P_LINE_NO: "",
            P_PROCESS_CD: "B", // [B]등록
            P_STATE_DIV: "1", // [1]MIN 값
            P_CHECK_STATE: "20" // 진행상태 체크
          }),
          P_DS_SUB: $NC.toJson(saveDS),
          P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSaveC);
      }
    } else {
      var d_DS = [ ];
      var cu_DS = [ ];
      // var rowCount = G_GRDSUBC.data.getLength();
      // 필터링 된 데이터라 전체 데이터를 기준으로 처리
      var rows = G_GRDSUBC.data.getItems();
      var rowCount = rows.length;
      for (var row = 0; row < rowCount; row++) {
        var rowData = rows[row];
        if (rowData.CRUD !== "R") {
          var saveData = {
            P_CENTER_CD: rowData.CENTER_CD,
            P_BU_CD: rowData.BU_CD,
            P_INBOUND_DATE: rowData.INBOUND_DATE,
            P_INBOUND_NO: rowData.INBOUND_NO,
            P_LINE_NO: rowData.LINE_NO,
            P_LOCATION_ID: rowData.LOCATION_ID,
            P_INBOUND_SEQ: rowData.INBOUND_SEQ,
            P_ENTRY_QTY: rowData.ENTRY_QTY,
            P_CRUD_FLAG: rowData.CRUD
          };
          if (rowData.CRUD === "D") {
            d_DS.push(saveData);
          } else {
            cu_DS.push(saveData);
          }
        }
      }
      var saveDS = d_DS.concat(cu_DS);
      if (saveDS.length > 0) {
        $NC.serviceCall("/RI02010E/saveDirectionsLocId.do", {
          P_DS_SUB: $NC.toJson(saveDS),
          P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onSaveC);
      }
    }
    return;
  }

  // 반입확정
  if ($NC.G_VAR.activeView.PROCESS_CD === "D") {

    if (G_GRDSUBD.lastRow == null || G_GRDSUBD.data.getLength() === 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }
    // 현재 수정모드면
    if (G_GRDSUBD.view.getEditorLock().isActive()) {
      G_GRDSUBD.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (G_GRDSUBD.lastRow != null) {
      if (!grdSubDOnBeforePost(G_GRDSUBD.lastRow)) {
        return;
      }
    }

    // 확정탭의 비고란에 값 입력 위해 수정
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
    for (var row = 0; row < rowCount; row++) {
      var rowData = rows[row];
      if (rowData.CRUD !== "R") {
        var saveData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_INBOUND_DATE: rowData.INBOUND_DATE,
          P_INBOUND_NO: rowData.INBOUND_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_INBOUND_SEQ: rowData.INBOUND_SEQ,
          P_VALID_DATE: rowData.VALID_DATE,
          P_BATCH_NO: rowData.BATCH_NO,
          P_CONFIRM_QTY: rowData.CONFIRM_QTY,
          P_PUTAWAY_QTY: rowData.CONFIRM_QTY,
          P_INSPECT_YN: "Y",
          P_CRUD: rowData.CRUD
        };
        saveDS.push(saveData);
      }
    }
    if (saveDS.length > 0 || mstRow.CRUD !== "R") {
      $NC.serviceCall("/RI02010E/saveDirections.do", {
        P_DS_MASTER: $NC.getParams({
          P_CENTER_CD: mstRow.CENTER_CD,
          P_BU_CD: mstRow.BU_CD,
          P_INBOUND_DATE: mstRow.INBOUND_DATE,
          P_INBOUND_NO: mstRow.INBOUND_NO,
          P_INOUT_CD: mstRow.INOUT_CD,
          P_LINE_NO: "",
          P_PROCESS_CD: "B", // [B]등록
          P_STATE_DIV: "1", // [1]MIN 값
          P_CHECK_STATE: "30", // 진행상태 체크
          P_REMARK1: strRemark,
          P_CRUD: mstRow.CRUD
        }),
        P_DS_SUB: $NC.toJson(saveDS),
        P_USER_ID: $NC.G_USERINFO.USER_ID
      }, onSaveD);
    }
    return;
  }

  // 반입적치
  if ($NC.G_VAR.activeView.PROCESS_CD === "E") {

    if (G_GRDSUBE.lastRow == null || G_GRDSUBE.data.getLength() === 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }
    // 현재 수정모드면
    if (G_GRDSUBE.view.getEditorLock().isActive()) {
      G_GRDSUBE.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (G_GRDSUBE.lastRow != null) {
      if (!grdSubDOnBeforePost(G_GRDSUBE.lastRow)) {
        return;
      }
    }

    var saveDS = [ ];
    // var rowCount = G_GRDSUBE.data.getLength();
    // 필터링 된 데이터라 전체 데이터를 기준으로 처리
    var rows = G_GRDSUBE.data.getItems();
    var rowCount = rows.length;
    for (var row = 0; row < rowCount; row++) {
      var rowData = rows[row];
      if (rowData.CRUD !== "R") {
        var saveData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_INBOUND_DATE: rowData.INBOUND_DATE,
          P_INBOUND_NO: rowData.INBOUND_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_INBOUND_SEQ: rowData.INBOUND_SEQ,
          P_PUTAWAY_LOCATION_CD: rowData.PUTAWAY_LOCATION_CD,
          P_PUTAWAY_QTY: rowData.PUTAWAY_QTY,
          P_PUTAWAY_YN: "Y",
          P_CRUD: rowData.CRUD
        };
        saveDS.push(saveData);
      }
    }
    if (saveDS.length > 0) {
      $NC.serviceCall("/RI02010E/saveDirections.do", {
        P_DS_MASTER: $NC.getParams({
          P_CENTER_CD: saveDS[0].P_CENTER_CD,
          P_BU_CD: saveDS[0].P_BU_CD,
          P_INBOUND_DATE: saveDS[0].P_INBOUND_DATE,
          P_INBOUND_NO: saveDS[0].P_INBOUND_NO,
          P_LINE_NO: "",
          P_PROCESS_CD: "B", // [B]등록
          P_STATE_DIV: "1", // [1]MIN 값
          P_CHECK_STATE: "40" // 진행상태 체크
        }),
        P_DS_SUB: $NC.toJson(saveDS),
        P_USER_ID: $NC.G_USERINFO.USER_ID
      }, onSaveE);
    }
    return;
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
 * @param printName
 *          선택한 출력물 명칭
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
  var INBOUND_DATE = $NC.getValue("#dtpQInbound_Date");
  if ($NC.isNull(INBOUND_DATE)) {
    alert("반입일자를 입력하십시오.");
    $NC.setFocus("#dtpQInbound_Date");
    return;
  }

  var grdObject;
  var checkedValueDS = [ ];
  var checkCnt = 0;

  // 대상 그리드 선택
  switch ($NC.G_VAR.activeView.PROCESS_CD) {
  case "B":
  case "C":
  case "D":
  case "E":
    grdObject = window["G_GRDMASTER" + $NC.G_VAR.activeView.PROCESS_CD];
    break;
  default:
    alert("해당 프로세스는 출력물이 없습니다.");
    return;
  }

  // 출력 데이터 Array 담기
  // 로케이션ID
  if (printIndex == 1) {
    var rowCount = grdObject.data.getLength();
    for (var row = 0; row < rowCount; row++) {
      var rowData = grdObject.data.getItem(row);
      if (rowData.CHECK_YN === "Y") {
        checkCnt++;
        if (rowData.INBOUND_STATE !== "10") {
          checkedValueDS.push(rowData.INBOUND_NO);
        }
      }
    }
  } else if (printIndex == 0 || printIndex == 2) {
    // 반입라벨, 반입지시
    var rowCount = grdObject.data.getLength();
    for (var row = 0; row < rowCount; row++) {
      var rowData = grdObject.data.getItem(row);
      if (rowData.CHECK_YN === "Y") {
        checkCnt++;
        if (rowData.INBOUND_STATE >= "30") {
          checkedValueDS.push(rowData.INBOUND_NO);
        }
      }
    }
  } else if (printIndex == 3 || printIndex == 4) {
    // 거래명세서
    var rowCount = grdObject.data.getLength();
    for (var row = 0; row < rowCount; row++) {
      var rowData = grdObject.data.getItem(row);
      if (rowData.CHECK_YN === "Y") {
        checkCnt++;
        if (rowData.INBOUND_STATE >= "40") {
          checkedValueDS.push(rowData.INBOUND_NO);
        }
      }
    }
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
  // var queryIdvar;
  var queryParams;
  var internalQueryYn = "N";
  var queryId = "";
  switch (printIndex) {
  // 반입라벨
  case 0:
    reportDoc = "common/LABEL_PALLET";
    queryId = "WR.RS_LABEL_PALLET01";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INBOUND_DATE: INBOUND_DATE,
      P_PROCESS_GRP: "RI"
    };
    break;
  // 로케이션ID
  case 1:
    reportDoc = "common/LABEL_LOCATION_ID";
    queryId = "WR.RS_LABEL_LOCATION_ID01";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INBOUND_DATE: INBOUND_DATE,
      P_PROCESS_GRP: "RI"
    };
    break;
  // 반입지시
  case 2:
    reportDoc = "ri/PAPER_RI";
    queryId = "WR.RS_PAPER_RI01";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INBOUND_DATE: INBOUND_DATE
    };
    break;
  // 거래명세서
  case 3:
    reportDoc = "ri/RECEIPT_RI01";
    queryId = "WR.RS_RECEIPT_RI01";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INBOUND_DATE: INBOUND_DATE
    };
    break;
  // 거래명세서 삼우
  case 4:
    reportDoc = "common/RECEIPT_COMMON";
    queryId = "WR.RS_RECEIPT_LO02";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE: INBOUND_DATE,
      P_PROCESS_CD: "RI"
    };
    internalQueryYn = "Y";
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
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
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

  return "<span class='ui-icon-state-" + dataContext.INBOUND_STATE + "'>&nbsp;</span>";
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();

  // 저장
  if (permission.canSave) {
    $("#btnNewLocationIdC").click(onNewLocationIdC);
    $("#btnNewDirectionsC").click(onNewDirectionsC);
    $("#btnDeleteDirectionsC").click(onDeleteDirectionsC);
  }
  $NC.setEnable("#btnNewLocationIdC", permission.canSave);
  $NC.setEnable("#btnNewDirectionsC", permission.canSave);
  $NC.setEnable("#btnDeleteDirectionsC", permission.canSave);

  // 확정
  if (permission.canConfirm) {
    $("#btnProcessNxtB").click(onProcessNxtB);
    $("#btnProcessNxtC").click(onProcessNxtC);
    $("#btnProcessNxtD").click(onProcessNxtD);
    $("#btnProcessNxtE").click(onProcessNxtE);
  }
  $NC.setEnable("#btnProcessNxtB", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtC", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtD", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtE", permission.canConfirm);

  // 취소
  if (permission.canConfirmCancel) {
    $("#btnProcessPreB").click(onProcessPreB);
    $("#btnProcessPreC").click(onProcessPreC);
    $("#btnProcessPreD").click(onProcessPreD);
    $("#btnProcessPreE").click(onProcessPreE);
  }
  $NC.setEnable("#btnProcessPreB", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreC", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreD", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreE", permission.canConfirmCancel);
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

  // 반입 등록
  if ($NC.G_VAR.activeView.PROCESS_CD === "B") {
    if ($NC.G_VAR.policyVal.RI210 === "Y") {
      $NC.G_VAR.buttons._new = "1";
    }
    // 버튼 활성화 처리
    if (G_GRDMASTERB.data.getLength() > 0) {
      $NC.G_VAR.buttons._print = "1";

      if ($NC.G_VAR.policyVal.RI230 !== "1") {
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 1,
          PRINT_COMMENT: "로케이션ID라벨"
        });
      }

      if ($("#btnProcessC").prop("disabled")) {
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 0,
          PRINT_COMMENT: "반입라벨"
        });
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 2,
          PRINT_COMMENT: "반입지시서"
        });
      }

      if ($("#btnProcessD").prop("disabled")) {
        // $NC.G_VAR.printOptions.push({
        // PRINT_INDEX: 3,
        // PRINT_COMMENT: "거래명세서"
        // });
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 4,
          PRINT_COMMENT: "반입전표"
        });
      }
    }
  } else if ($NC.G_VAR.activeView.PROCESS_CD === "C") {// 반입 지시
    // 버튼 활성화 처리
    if (G_GRDMASTERC.data.getLength() > 0) {
      $NC.G_VAR.buttons._save = "1";
      $NC.G_VAR.buttons._print = "1";

      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 0,
        PRINT_COMMENT: "반입라벨"
      });
      if ($NC.G_VAR.policyVal.RI230 !== "1") {
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 1,
          PRINT_COMMENT: "로케이션ID라벨"
        });
      }
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 2,
        PRINT_COMMENT: "반입지시서"
      });
      if ($("#btnProcessD").prop("disabled")) {
        // $NC.G_VAR.printOptions.push({
        // PRINT_INDEX: 3,
        // PRINT_COMMENT: "거래명세서"
        // });
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 4,
          PRINT_COMMENT: "반입전표"
        // PRINT_COMMENT: "거래명세서(삼우)"
        });
      }
    }
  } else if ($NC.G_VAR.activeView.PROCESS_CD === "D") {// 반입 확정
    // 버튼 활성화 처리
    if (G_GRDMASTERD.data.getLength() > 0) {
      $NC.G_VAR.buttons._save = "1";
      $NC.G_VAR.buttons._print = "1";

      // $NC.G_VAR.printOptions.push({
      // PRINT_INDEX: 3,
      // PRINT_COMMENT: "거래명세서"
      // });

      // 이전단계의 출력물도 인쇄되도록 수정
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 0,
        PRINT_COMMENT: "반입라벨"
      });
      if ($NC.G_VAR.policyVal.RI230 !== "1") {
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 1,
          PRINT_COMMENT: "로케이션ID라벨"
        });
      }
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 2,
        PRINT_COMMENT: "반입지시서"
      });

      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 3,
        PRINT_COMMENT: "반입전표"
      // PRINT_COMMENT: "거래명세서(삼우)"
      });
    }
  } else if ($NC.G_VAR.activeView.PROCESS_CD === "E") {// 반입 적치
    // 버튼 활성화 처리
    if (G_GRDMASTERE.data.getLength() > 0) {
      $NC.G_VAR.buttons._save = "1";
      $NC.G_VAR.buttons._print = "1";

      // 이전단계의 출력물도 인쇄되도록 수정
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 0,
        PRINT_COMMENT: "반입라벨"
      });
      if ($NC.G_VAR.policyVal.RI230 !== "1") {
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 1,
          PRINT_COMMENT: "로케이션ID라벨"
        });
      }
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 2,
        PRINT_COMMENT: "반입지시서"
      });

      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 3,
        PRINT_COMMENT: "반입전표"
      // PRINT_COMMENT: "거래명세서(삼우)"
      });

    }
  }
  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
}

function onGetMasterSummary(ajaxData) {

  var rows = $NC.toArray(ajaxData);
  if (rows.length === 0) {
    for (var i = 0; i < 5; i++) {
      $NC.setValue("#divProcessCnt" + String.fromCharCode(65 + i), "0 / 0");
    }
  } else {
    var rowData = rows[0];
    var process_Cd, process_Cnt, process_Qty;
    for (var i = 0; i < 5; i++) {
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
  for (var i = 0; i < 5; i++) {
    $NC.setEnable("#btnProcess" + String.fromCharCode(65 + i), false);
  }
  var resultDS = $NC.toArray(ajaxData);
  var resultDSCnt = resultDS.length;
  if (resultDSCnt > 0) {
    var resultData;
    // 프로세스 사용 가능여부 세팅
    for (var i = 0; i < resultDSCnt; i++) {
      resultData = resultDS[i];
      $NC.setEnable("#btnProcess" + resultData.PROCESS_CD, resultData.EXEC_PROCESS_YN == "Y");
    }

    if ($("#btnProcess" + $NC.G_VAR.activeView.PROCESS_CD).prop("disabled") === false) {
      return;
    }
    // 현재 선택된 프로세스 View가 사용 가능하지 않으면 사용가능한 첫번째 뷰 선택
    var process_Cd;
    for (var i = 0; i < 5; i++) {
      process_Cd = String.fromCharCode(65 + i);
      if ($("#btnProcess" + process_Cd).prop("disabled") === false) {
        $("#btnProcess" + process_Cd).click();
        return;
      }
    }
  }
  // 프로세스 정보를 가져오지 못했거나 사용할 수 있는 프로세스 View가 없을 경우 강제적으로 입고등록 View를 표시
  // $("#btnProcessB").prop("disabled", false);
  // if ($NC.G_VAR.activeView.PROCESS_CD !== "B") {
  // $("#btnProcessB").click();
  // }
  $("#btnProcess" + $NC.G_VAR.activeView.PROCESS_CD).removeClass("ui-clr-selected");
  $("#divSubView" + $NC.G_VAR.activeView.PROCESS_CD).hide();
  alert("수행 가능한 프로세스가 없습니다.\n브랜드별 프로세스관리에서 수행 프로세스를 등록하십시오.");
  $NC.G_VAR.activeView.PROCESS_CD = "";
}

function setMasterSummaryInfo() {

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var INBOUND_DATE = $NC.getValue("#dtpQInbound_Date");
  var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
  var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
  var INOUT_CD = $NC.getValue("#cboQInout_Cd");

  var BU_NO = $NC.getValue("#edtQBu_No");
  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  var ITEM_NM = $NC.getValue("#edtQItem_Nm");
//  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd", true);
  var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
  var RDELIVERY_CD = $NC.getValue("#edtQRDelivery_Cd", true);

  // 데이터 조회
  $NC.serviceCall("/RI02010E/getDataSet.do", {
    P_QUERY_ID: "RI02010E.RS_MASTER",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INBOUND_DATE: INBOUND_DATE,
      P_ORDER_DATE1: ORDER_DATE1,
      P_ORDER_DATE2: ORDER_DATE2,
      P_INOUT_CD: INOUT_CD,
      P_BRAND_CD: BRAND_CD,
      P_BU_NO: BU_NO,
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
      P_PROCESS_GRP: "RI"
    })
  }, onGetProcessInfo);
}

function setPolicyValInfo() {

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    $NC.G_VAR.policyVal[POLICY_CD] = "";
  }

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.isNull($NC.getValue("#cboQCenter_Cd")) ? $NC.G_USERINFO.CENTER_CD : $NC
      .getValue("#cboQCenter_Cd");
  var BU_CD = $NC.isNull($NC.getValue("#edtQBu_Cd")) ? $NC.G_USERINFO.BU_CD : $NC.getValue("#edtQBu_Cd");

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCallAndWait("/RI02010E/callSP.do", {
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
      if (resultData.P_POLICY_CD != "RI230" && resultData.P_POLICY_CD != "RI420") {
        return;
      }
      var policyVal = resultData.O_POLICY_VAL;
      if (resultData.P_POLICY_CD == "RI230") {
        if (resultData.O_POLICY_VAL == "1") {
          $NC.G_OFFSET.locIdViewWidth = 0;
          $("#divGrdDetailCView").css({
            "margin-left": "0",
            "border-width": "0 0 0 0"
          });
          $("#divGrdLocationIdCView").css({
            "border-width": "0 0 0 0"
          });
          $("#btnNewDirectionsC").hide();
          $("#btnDeleteDirectionsC").hide();
        } else {
          $NC.G_OFFSET.locIdViewWidth = 250;
          $("#divGrdLocationIdCView").css({
            "border-width": "0 1px 0 0"
          });
          $("#divGrdDetailCView").css({
            "margin-left": "5px",
            "border-width": "0 0 0 1px"
          });
          $("#btnNewDirectionsC").show();
          $("#btnDeleteDirectionsC").show();
        }
        if ($NC.G_VAR.activeView.PROCESS_CD == "C") {
          _OnResize($(window));
        }
      } else if (resultData.P_POLICY_CD == "RI420") {
        G_GRDDETAILB.view.setColumns(grdDetailBOnGetColumns(policyVal));
        $NC.setGridColumnHeaderCheckBox(G_GRDDETAILB, "CHECK_YN");
        G_GRDDETAILC.view.setColumns(grdDetailCOnGetColumns(policyVal));
        G_GRDSUBD.view.setColumns(grdSubDOnGetColumns(policyVal));
        $NC.setGridColumnHeaderCheckBox(G_GRDSUBD, "CHECK_YN");
        G_GRDSUBE.view.setColumns(grdSubEOnGetColumns(policyVal));
        $NC.setGridColumnHeaderCheckBox(G_GRDSUBE, "CHECK_YN");
      }
    }
  }
}

function setProcessStateInfo() {

  for ( var PROCESS_CD in $NC.G_VAR.stateFWBW) {
    $NC.G_VAR.stateFWBW[PROCESS_CD].CONFIRM = "";
    $NC.G_VAR.stateFWBW[PROCESS_CD].CANCEL = "";
  }

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var PROCESS_GRP = "RI";

  // 데이터 조회
  $NC.serviceCall("/RI02010E/getDataSet.do", {
    P_QUERY_ID: "WC.GET_PROCESS_STATE_FWBW",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_PROCESS_GRP: PROCESS_GRP,
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

function getInboundState(params, onSuccess) {

  // 데이터 조회
  $NC.serviceCall("/RI02010E/callSP.do", {
    P_QUERY_ID: "WF.GET_RI_INBOUND_STATE",
    P_QUERY_PARAMS: $NC.getParams(params)
  }, onSuccess);
}

/**
 * 검색조건의 사업부 검색 팝업 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BRAND_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQBu_Cd", true);
  });
}

/**
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
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

  // 브랜드 초기화
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");

  onChangingCondition();
  setMasterProcessInfo();
  setPolicyValInfo();
  setProcessStateInfo();
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


/**
 * 검색조건의 배송처 검색 이미지 클릭
 */
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

/**
 * 검색조건의 실배송처 검색 이미지 클릭
 */
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