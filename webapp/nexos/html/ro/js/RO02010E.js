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
      RO190: "", // 공급금액 계산정책
      RO210: "", // 반출등록 전표생성 가능여부
      RO220: "", // 반출등록 수량 허용기준
      RO221: "", // 예정으로 등록시 추가/삭제 허용
      RO240: "", // 반출 기존 상품상태 기준
      RO410: "", // 반출확정 수량 수정 가능여부
      RO250: "" // 유통기한/제조배치번호 지정 정책
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
      D: {
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
  $("#btnQBrand_Cd").click(showOwnBranPopup);
  //$("#btnQBrand_Cd").click(showBuBrandPopup);
  $("#btnWbSave").click(callWbSaveProc); // 송장등록 버튼 클릭
  $("#btnWbPrint").click(callWbPrint); // 송장출력 버튼 클릭

  // 반출확정/취소 버튼 권한 체크 및 클릭 이벤트 연결
  setUserProgramPermission();

  // 초기화 및 초기값 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $NC.setValue("#edtQVendor_Cd");
  $NC.setValue("#edtQVendor_Nm");
  $NC.setValue("#chkQState_Pre_Yn", "Y");
  $NC.setValue("#chkQState_Cur_Yn", "Y");

  $NC.setInitDatePicker("#dtpQOutbound_Date");
  $NC.setInitDatePicker("#dtpQOrder_Date1");
  $NC.setInitDatePicker("#dtpQOrder_Date2");

  $NC.setValue("#dtpQOrder_Date1", $NC.addDay($NC.getValue("#dtpQOrder_Date1"), -3));

  // 조회조건 - 반출구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "D3",
      P_SUB_CD2: ""
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
      // 반출전표/수량 정보 세팅, 프로세스 정보, ※ 조회 조건이 모두 세팅이 되는 시점
      setTimeout(function() {
        setMasterSummaryInfo();
        setMasterProcessInfo();
        setPolicyValInfo();
        setProcessStateInfo();
      }, 300);
    }
  });

  // 그리드 초기화 - 반출등록
  grdMasterBInitialize();
  grdDetailBInitialize();

  // 그리드 초기화 - 반출확정
  grdMasterDInitialize();
  grdDetailDInitialize();
  grdSubDInitialize();

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
  // 반출등록
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

  // 반출확정
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
    
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.G_USERINFO.BRAND_CD;
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
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
  
  case "OUTBOUND_DATE":
    $NC.setValueDatePicker(view, val, "검색 반출일자를 정확히 입력하십시오.");
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
  for (var i = 1; i < 4; i++) {
    process_Cd = String.fromCharCode(65 + i);

    if (process_Cd == "C") {
      continue;
    }

    // 마스터
    $NC.clearGridData(window["G_GRDMASTER" + process_Cd]);
    // 디테일
    $NC.clearGridData(window["G_GRDDETAIL" + process_Cd]);

    // 지시 - 등록 이후
    if (process_Cd === "D") {
      $NC.clearGridData(window["G_GRDSUB" + process_Cd]);
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

  var viewId = view.prop("id");
  if ($NC.G_VAR.activeView.container.substr(1) === viewId) {
    return;
  }
  var process_Cd;
  for (var i = 0; i <= 4; i++) {
    process_Cd = String.fromCharCode(65 + i);
    if (process_Cd == "C") {
      continue;
    }

    $("#btnProcess" + process_Cd).removeClass("ui-clr-selected");
    $("#divSubView" + process_Cd).hide();
  }

  // btnProcessA ---> A
  process_Cd = viewId.substr(10).toUpperCase();

  view.addClass("ui-clr-selected");
  $("#divSubView" + process_Cd).show();
  $NC.G_VAR.activeView.container = "#divSubView" + process_Cd;
  $NC.G_VAR.activeView.PROCESS_CD = process_Cd;

  // 반출 등록
  if ($NC.G_VAR.activeView.PROCESS_CD === "B") {
    $("#tdQOrder_Date").show(); // 반출예정일자 표시
    $("#divWbPrintView").hide();
    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
      // 스필리터를 통한 _OnResize 호출
      $($NC.G_VAR.activeView.container).trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter($NC.G_VAR.activeView.container, "h");
    }

    // 공통 버튼 활성화
    _Inquiry();
    return;
  }

  var subContainer;
  if ($NC.G_VAR.activeView.PROCESS_CD === "D") {// 반출 확정
    $("#tdQOrder_Date").hide(); // 반출예정일자 비표시
    $("#divSubViewCAddSearch").hide();
    $("#divWbPrintView").show();
    subContainer = $("#divSubViewDDetail");
  }

  // 스플리터가 초기화가 되어 있으면 _OnResize 호출
  if ($NC.isSplitter($NC.G_VAR.activeView.container)) {
    // 스필리터를 통한 _OnResize 호출
    $($NC.G_VAR.activeView.container).trigger("resize");
  } else {
    // 스플리터 초기화 - Vertical 스플리터일 경우 그리드 사이즈 조정으로는 기본 위치가 지정되지 않음
    // $($NC.G_VAR.activeView.container).children("div:first").width($NC.G_OFFSET.leftViewWidth);
    $NC.setInitSplitter($NC.G_VAR.activeView.container, "v", $NC.G_OFFSET.leftViewWidth, 270, 400);
    $NC.setInitSplitter(subContainer, "h", 400);
  }

  // 스플리터가 초기화가 되어 있으면 _OnResize 호출
  if ($NC.isSplitter(subContainer)) {
    // 스필리터를 통한 _OnResize 호출
    subContainer.trigger("resize");
  } else {
    // 스플리터 초기화
    $NC.setInitSplitter(subContainer, "h", 400);
  }

  // 공통 버튼 활성화
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
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("반출일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date");
    return;
  }
  var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
  if ($NC.isNull(ORDER_DATE1)) {
    alert("반출예정 검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }
  var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
  if ($NC.isNull(ORDER_DATE2)) {
    alert("반출예정 검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date2");
    return;
  }
  if (ORDER_DATE1 > ORDER_DATE2) {
    alert("반출예정일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }
  var INOUT_CD = $NC.getValue("#cboQInout_Cd");
  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  var ITEM_NM = $NC.getValue("#edtQItem_Nm");
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  var STATE_PRE_YN = $NC.getValue("#chkQState_Pre_Yn");
  var STATE_CUR_YN = $NC.getValue("#chkQState_Cur_Yn");
  if (STATE_PRE_YN === "N" && STATE_CUR_YN === "N") {
    alert("검색구분을 선택하십시오.");
    $NC.setFocus("#chkQState_Pre_Yn");
    return;
  }

  // 반출등록
  if ($NC.G_VAR.activeView.PROCESS_CD === "B") {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERB);

    G_GRDMASTERB.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_ORDER_DATE1: ORDER_DATE1,
      P_ORDER_DATE2: ORDER_DATE2,
      P_INOUT_CD: INOUT_CD,
      P_VENDOR_CD: "",
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_STATE_PRE_YN: STATE_PRE_YN,
      P_STATE_CUR_YN: STATE_CUR_YN,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/RO02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERB), onGetMasterB);

    return;
  }

  // 반출확정
  if ($NC.G_VAR.activeView.PROCESS_CD === "D") {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERD);

    G_GRDMASTERD.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_INOUT_CD: INOUT_CD,
      P_VENDOR_CD: "",
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_STATE_PRE_YN: STATE_PRE_YN,
      P_STATE_CUR_YN: STATE_CUR_YN,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/RO02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERD), onGetMasterD);
  }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  if ($NC.G_VAR.activeView.PROCESS_CD !== "B") {
    return;
  }
  if ($NC.G_VAR.policyVal.RO210 !== "Y") {
    alert("반출등록 신규처리가 불가능한 브랜드입니다.");
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "RO02011P",
    PROGRAM_NM: "반출등록/수정",
    url: "ro/RO02011P.html",
    width: 1024,
    height: 800,
    userData: {
      P_PROCESS_CD: "N",
      P_CENTER_CD: CENTER_CD,
      P_CENTER_CD_F: CENTER_CD_F,
      P_BU_CD: BU_CD,
      P_BU_NM: BU_NM,
      P_CUST_CD: CUST_CD,
      P_POLICY_RO190: $NC.G_VAR.policyVal.RO190,
      P_POLICY_RO210: $NC.G_VAR.policyVal.RO210,
      P_POLICY_RO220: $NC.G_VAR.policyVal.RO220,
      P_POLICY_RO221: $NC.G_VAR.policyVal.RO221,
      P_POLICY_RO240: $NC.G_VAR.policyVal.RO240,
      P_POLICY_RO250: $NC.G_VAR.policyVal.RO250,
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

  // 반출확정
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
      $NC.serviceCall("/RO02010E/saveConfirms.do", {
        P_DS_MASTER: $NC.getParams({
          P_CENTER_CD: mstRow.CENTER_CD,
          P_BU_CD: mstRow.BU_CD,
          P_OUTBOUND_DATE: mstRow.OUTBOUND_DATE,
          P_OUTBOUND_NO: mstRow.OUTBOUND_NO,
          P_INOUT_CD: mstRow.INOUT_CD,
          P_LINE_NO: "",
          P_PROCESS_CD: "B", // [B]등록
          P_STATE_DIV: "1", // [1]MIN 값
          P_CHECK_STATE: "20", // 진행상태 체크
          P_REMARK1: strRemark,
          P_CRUD: mstRow.CRUD
        }),
        P_DS_SUB: $NC.toJson(saveDS),
        P_USER_ID: $NC.G_USERINFO.USER_ID
      }, onSaveD);
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
  var grdObject;
  var checkedValueDS = [ ];
  var checkCnt = 0;

  // 대상 그리드 선택
  switch ($NC.G_VAR.activeView.PROCESS_CD) {
  case "B":
    grdObject = window["G_GRDMASTER" + $NC.G_VAR.activeView.PROCESS_CD];
    break;
  case "D":
    grdObject = window["G_GRDMASTER" + $NC.G_VAR.activeView.PROCESS_CD];
    break;
  default:
    alert("해당 프로세스는 출력물이 없습니다.");
    return;
  }

  // 출력 데이터 Array 담기
  if (printIndex == 0) {
    var rowCount = grdObject.data.getLength();
    for (var row = 0; row < rowCount; row++) {
      var rowData = grdObject.data.getItem(row);
      if (rowData.CHECK_YN === "Y") {
        checkCnt++;
        if (rowData.OUTBOUND_STATE >= "20") {
          checkedValueDS.push(rowData.OUTBOUND_NO);
        }
      }
    }
  }

  // 출력 데이터 Array 담기
  if (printIndex == 5 || printIndex == 6) {
    var rowCount = grdObject.data.getLength();
    for (var row = 0; row < rowCount; row++) {
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
  var reportDoc;
  var queryId;
  var queryParams;
  var internalQueryYn = "N";
  switch (printIndex) {
  // 오더피킹지시서
  case 0:
    reportDoc = "ro/PAPER_RO01";
    queryId = "WR.RS_PAPER_RO01";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE
    };
    break;
  // 거래명세서
  case 5:
    reportDoc = "ro/RECEIPT_RO01";
    queryId = "WR.RS_RECEIPT_RO01";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE
    };
    break;
  // 거래명세서(삼우)
  case 6:
    reportDoc = "common/RECEIPT_COMMON_RO";
    queryId = "WR.RS_RECEIPT_LO02";
    queryParams = {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE: OUTBOUND_DATE,
      P_PROCESS_CD: "RO"
    };
    internalQueryYn = "Y";
    break;
  }

  if (printIndex == 0 || printIndex == 5 || printIndex == 6) {
    // 선택 건수 체크
    if (checkCnt === 0) {
      alert("[" + printName + "]출력할 데이터를 선택하십시오.");
      return;
    }
    if (checkedValueDS.length == 0) {
      alert("[" + printName + "]출력 가능한 데이터를 선택하십시오.");
      return;
    }
    // 출력 호출
    $NC.G_MAIN.showPrintPreview({
      reportDoc: reportDoc,
      queryId: queryId,
      queryParams: queryParams,
      checkedValue: checkedValueDS.toString(),
      internalQueryYn: internalQueryYn
    });
    return;
  }

  // 출력 호출
  $NC.G_MAIN.showPrintPreview({
    reportDoc: reportDoc,
    queryId: queryId,
    queryParams: queryParams
  });
}

/**
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          row, cell, value
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

  // 확정
  if (permission.canConfirm) {
    $("#btnProcessNxtB").click(onProcessNxtB);
    $("#btnProcessNxtD").click(onProcessNxtD);
    $("#btnLocationE").click(onSubGetButtonE);
  }
  $NC.setEnable("#btnProcessNxtB", permission.canConfirm);
  $NC.setEnable("#btnProcessNxtD", permission.canConfirm);

  // 취소
  if (permission.canConfirmCancel) {
    $("#btnProcessPreB").click(onProcessPreB);
    $("#btnProcessPreD").click(onProcessPreD);
  }
  $NC.setEnable("#btnProcessPreB", permission.canConfirmCancel);
  $NC.setEnable("#btnProcessPreD", permission.canConfirmCancel);
}

function setTopButtons(isInquiry) {

  // 기본값
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.G_VAR.printOptions = [ ];

  if (isInquiry == undefined) {
    isInquiry = false;
  }
  // 출고 등록
  if ($NC.G_VAR.activeView.PROCESS_CD === "B") {
    // 버튼 활성화 처리
    if ($NC.G_VAR.policyVal.RO210 === "Y") {
      $NC.G_VAR.buttons._new = "1";
    } else {
      $NC.G_VAR.buttons._new = "0";
    }
  } else if ($NC.G_VAR.activeView.PROCESS_CD === "D") {// 반출 확정
    // 버튼 활성화 처리
    if (G_GRDMASTERD.data.getLength() > 0) {
      $NC.G_VAR.buttons._save = "1";
      $NC.G_VAR.buttons._print = "1";

      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 0,
        PRINT_COMMENT: "반출오더피킹지시서"
      });
      // $NC.G_VAR.printOptions.push({
      // PRINT_INDEX: 5,
      // PRINT_COMMENT: "거래명세서"
      // });
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 5,
        // PRINT_COMMENT: "거래명세서(삼우)"
        PRINT_COMMENT: "반출전표"
      });
      $NC.G_VAR.printOptions.push({
        PRINT_INDEX: 6,
        // PRINT_COMMENT: "거래명세서(삼우)"
        PRINT_COMMENT: "반출 확인서"
      });
    }
  }
  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
}

function onGetMasterSummary(ajaxData) {

  var rows = $NC.toArray(ajaxData);
  if (rows.length === 0) {
    for (var i = 0; i < 4; i++) {
      $NC.setValue("#divProcessCnt" + String.fromCharCode(65 + i), "0 / 0");
    }
  } else {
    var rowData = rows[0];
    var process_Cd, process_Cnt, process_Qty;
    for (var i = 0; i < 4; i++) {
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
  for (var i = 0; i < 4; i++) {
    var process_Cd = String.fromCharCode(65 + i);
    if (process_Cd == "C") {
      continue;
    }

    $NC.setEnable("#btnProcess" + process_Cd, false);
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
    for (var i = 0; i < 4; i++) {
      process_Cd = String.fromCharCode(65 + i);
      if (process_Cd == "C") {
        continue;
      }

      if ($("#btnProcess" + process_Cd).prop("disabled") === false) {
        $("#btnProcess" + process_Cd).click();
        return;
      }
    }
  }
  // 프로세스 정보를 가져오지 못했거나 사용할 수 있는 프로세스 View가 없을 경우 강제적으로 반출등록 View를 표시
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
  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  var ITEM_NM = $NC.getValue("#edtQItem_Nm");
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  // 데이터 조회
  $NC.serviceCall("/RO02010E/getDataSet.do", {
    P_QUERY_ID: "RO02010E.RS_MASTER",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_ORDER_DATE1: ORDER_DATE1,
      P_ORDER_DATE2: ORDER_DATE2,
      P_INOUT_CD: INOUT_CD,
      P_VENDOR_CD: "",
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
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
      P_PROCESS_GRP: "RO"
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
    $NC.serviceCall("/RO02010E/callSP.do", {
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
      if (resultData.P_POLICY_CD != "RO250") {
        return;
      }
      var policyVal = resultData.O_POLICY_VAL;
      G_GRDDETAILB.view.setColumns(grdDetailBOnGetColumns(policyVal));
      G_GRDSUBD.view.setColumns(grdSubDOnGetColumns(policyVal));
    }
  }
}

function getOutboundState(params, onSuccess) {

  // 데이터 조회
  $NC.serviceCall("/RO02010E/callSP.do", {
    P_QUERY_ID: "WF.GET_RO_OUTBOUND_STATE",
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
function showOwnBranPopup() {

  $NP.showOwnBranPopup({
    P_CUST_CD: $NC.G_USERINFO.CUST_CD,
    P_BU_CD: $NC.G_USERINFO.BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  onChangingCondition();
}


/**
 * 검색조건의 공급처 검색 이미지 클릭
 */

function setProcessStateInfo() {

  for ( var PROCESS_CD in $NC.G_VAR.stateFWBW) {
    $NC.G_VAR.stateFWBW[PROCESS_CD].CONFIRM = "";
    $NC.G_VAR.stateFWBW[PROCESS_CD].CANCEL = "";
  }

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var PROCESS_GRP = "RO";

  // 데이터 조회
  $NC.serviceCall("/RO02010E/getDataSet.do", {
    P_QUERY_ID: "WC.GET_PROCESS_STATE_FWBW",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_PROCESS_GRP: PROCESS_GRP,
      P_PROCESS_CD: PROCESS_CD
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
