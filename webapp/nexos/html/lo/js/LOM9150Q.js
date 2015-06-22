/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({});

  // 상단그리드 초기화
  grdMasterInitialize();

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
    }
  });

  // 사업구분 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $("#btnQBu_Cd").click(showUserBuPopup);

  $NC.setInitDatePicker("#dtpQOutbound_Date1");
  $NC.setInitDatePicker("#dtpQOutbound_Date2");

  //용기매칭

}
//합포장


/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  var height = clientHeight - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, height);
}

/**
 * Input, Select Change Event 처리
 * 
 * @param e
 *          이벤트 핸들러
 * @param view
 *          대상 Object
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
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
  case "OUTBOUND_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "OUTBOUND_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;

  }

  onChangingCondition();
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
    alert("사업구분 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  var OUTBOUND_DATE1 = $NC.getValue("#dtpQOutbound_Date1");
  if ($NC.isNull(OUTBOUND_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date1");
    return;
  }

  var OUTBOUND_DATE2 = $NC.getValue("#dtpQOutbound_Date2");
  if ($NC.isNull(OUTBOUND_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date2");
    return;
  }

  if (OUTBOUND_DATE1 > OUTBOUND_DATE2) {
    alert("출고일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQOutbound_Date1");
    return;
  }
  var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm", true);
  var SHIPPER_NM = $NC.getValue("#edtQShipper_Nm", true);
  var BU_NO = $NC.getValue("#edtQBu_No", true);
  var PICK_SEQ = $NC.getValue("#edtQPick_Seq", true);
  var PICK_BOX_NO = $NC.getValue("#edtQPick_Box_No", true);
  var PICK_BOX_YN = $NC.getValue("#chkQPick_Box_Yn");
  var HAS_PROC_YN = $NC.getValue("#chkQHas_Proc_Yn");
  var INSPECT_YN = $NC.getValue("#chkQInspect_Yn");
  var WB_CHK_YN = $NC.getValue("#chkQWb_Chk_Yn");
  

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE1: OUTBOUND_DATE1,
    P_OUTBOUND_DATE2: OUTBOUND_DATE2,
    P_BU_NO: BU_NO,
    P_ORDERER_NM: ORDERER_NM,
    P_SHIPPER_NM: SHIPPER_NM,
    P_PICK_SEQ: PICK_SEQ,
    P_PICK_BOX_NO: PICK_BOX_NO,
    P_PICK_BOX_YN: PICK_BOX_YN,
    P_HAS_PROC_YN: HAS_PROC_YN,
    P_INSPECT_YN: INSPECT_YN,
    P_WB_CHK_YN: WB_CHK_YN
  });

  // 데이터 조회
  $NC.serviceCall("/LOM9150Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

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

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_BATCH",
    field: "OUTBOUND_BATCH",
    name: "출고차수",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DIV_NM",
    field: "ORDER_DIV_NM",
    name: "주문구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "PRINT_YN",
    field: "PRINT_YN",
    name: "출력여부",
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "PRINT_USER_ID",
    field: "PRINT_USER_ID",
    name: "출력자",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "PRINT_DATETIME",
    field: "PRINT_DATETIME",
    name: "출력일시",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "PICK_SEQ",
    field: "PICK_SEQ",
    name: "라벨번호",
    minWidth: 80,
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATETIME",
    field: "BU_DATETIME",
    name: "주문일시",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "주문일자",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "주문번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "PICK_BOX_YN",
    field: "PICK_BOX_YN",
    name: "용기매칭여부",
    minWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "PICK_BOX_NO",
    field: "PICK_BOX_NO",
    name: "용기번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "PICK_USER_ID",
    field: "PICK_USER_ID",
    name: "용기피킹자",
    minWidth: 80,
  });
  $NC.setGridColumn(columns, {
    id: "PICK_DATETIME",
    field: "PICK_DATETIME",
    name: "용기매칭일시",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "HAS_BOXING_YN",
    field: "HAS_BOXING_YN",
    name: "합포장대상여부",
    minWidth: 100,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "CON_SCAN_DATE",
    field: "CON_SCAN_DATE",
    name: "켄베이어작업일자",
    cssClass: "align-center",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "CON_SCAN_INFO",
    field: "CON_SCAN_INFO",
    name: "켄베이어스캔정보",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "CON_SCAN_S_TIME",
    field: "CON_SCAN_S_TIME",
    name: "켄베이어시작일시",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "CON_SCAN_E_TIME",
    field: "CON_SCAN_E_TIME",
    name: "켄베이어종료일시",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "HAS_DATE",
    field: "HAS_DATE",
    name: "합포장일자",
    minWidth: 90,
    cssClass: "align-center",
  });
  $NC.setGridColumn(columns, {
    id: "HAS_NO",
    field: "HAS_NO",
    name: "합포장번호",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "HAS_PROC_YN",
    field: "HAS_PROC_YN",
    name: "합포장완료여부",
    minWidth: 100,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "HAS_USER_ID",
    field: "HAS_USER_ID",
    name: "합포장작업자",
    minWidth: 80,
  });
  $NC.setGridColumn(columns, {
    id: "HAS_DATETIME",
    field: "HAS_DATETIME",
    name: "합포장일시",
    cssClass: "align-center",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_YN",
    field: "INSPECT_YN",
    name: "합포장검수여부",
    minWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_USER_ID",
    field: "INSPECT_USER_ID",
    name: "합포장검수자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_DATETIME",
    field: "INSPECT_DATETIME",
    name: "검수일시",
    minWidth: 140,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_NM",
    field: "CARRIER_NM",
    name: "운송사",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "WB_NO",
    field: "WB_NO",
    name: "운송장번호",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "WB_CHK_YN",
    field: "WB_CHK_YN",
    name: "상차검수여부",
    minWidth: 80,
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "WB_CHK_DATETIME",
    field: "WB_CHK_DATETIME",
    name: "상차검수일시",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_NO",
    field: "ORDER_NO",
    name: "예정번호",
    minWidth: 80
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 상단그리드 초기화
 */
function grdMasterInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LOM9150Q.RS_MASTER",
    sortCol: "OUTBOUND_DATE",
    gridOptions: options,
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

/**
 * 검색조건의 사업구분 검색 이미지 클릭
 */
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

  onChangingCondition();
}

/**
 * 상단그리드 행 클릭시 이벤트 처리
 * 
 * @param e
 * @param args
 */
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
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: new Array("OUTBOUND_DATE", "OUTBOUND_NO"),
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDMASTER);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}
