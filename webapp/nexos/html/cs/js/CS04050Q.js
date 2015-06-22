/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 탭 초기화
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();

  // 그리드 초기화
  grdT1MasterInitialize();
  grdT2MasterInitialize();

  $NC.setInitDatePicker("#dtpQUser_Date1", null, "F");
  $NC.setInitDatePicker("#dtpQUser_Date2");

  // $("#btnQDepart_Cd").click(showItemGroupDepartPopup);
  // $("#btnQLine_Cd").click(showItemGroupLinePopup);
  // $("#btnQClass_Cd").click(showItemGroupClassPopup);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.tabHeaderHeight = $("#divMasterView").children(".ui-tabs-nav:first").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1 * 2; /* 탭일 경우는 좌우 */
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientWidth -= $NC.G_LAYOUT.border1;
  clientHeight -= ($NC.G_OFFSET.tabHeaderHeight + $NC.G_LAYOUT.header + $NC.G_LAYOUT.border1);
  // 수신현황 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", clientWidth, clientHeight);

    // 송신현황 화면
  } else {
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Master", clientWidth, clientHeight);
  }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  // 브랜드 Key 입력
  switch (id) {
  case "USER_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "USER_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
  }

  onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var USER_DATE1 = $NC.getValue("#dtpQUser_Date1");
  if ($NC.isNull(USER_DATE1)) {
    alert("시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQUser_Date1");
    return;
  }
  var USER_DATE2 = $NC.getValue("#dtpQUser_Date2");
  if ($NC.isNull(USER_DATE2)) {
    alert("종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQUser_Date2");
    return;
  }
  if (USER_DATE1 > USER_DATE2) {
    alert("일자 검색 범위 오류입니다.");
    $NC.setFocus("#dtpQUser_Date2");
    return;
  }
  var USER_ID = $NC.getValue("#edtQUser_Id");
  // 입출고 수불내역 조회
  if ($("#divMasterView").tabs("option", "active") === 0) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1MASTER);

    // 파라메터 세팅
    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_USER_ID: USER_ID,
      P_USER_DATE1: USER_DATE1,
      P_USER_DATE2: USER_DATE2
    });

    // 데이터 조회
    $NC.serviceCall("/CS04050Q/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetMasterT1);

    // 일자별 수불내역 조회
  } else if ($("#divMasterView").tabs("option", "active") === 1) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);

    // 파라메터 세팅
    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_USER_ID: USER_ID,
      P_USER_DATE1: USER_DATE1,
      P_USER_DATE2: USER_DATE2
    });

    // 데이터 조회
    $NC.serviceCall("/CS04050Q/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetMasterT2);

    // 기간별 수불내역 조회
  }

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

/**
 * Tab Active Event
 * 
 * @param event
 * @param ui
 *          newTab: The tab that was just activated.<br>
 *          oldTab: The tab that was just deactivated.<br>
 *          newPanel: The panel that was just activated.<br>
 *          oldPanel: The panel that was just deactivated
 */
function tabOnActivate(event, ui) {
  var id = ui.newTab.prop("id").substr(3).toUpperCase();
  $NC.G_VAR.activeTabName = "T" + id.substr(3);

  _OnResize($(window));
}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "USER_ID",
    field: "USER_ID",
    name: "사용자ID",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "CLIENT_IP",
    field: "CLIENT_IP",
    name: "사용자IP",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CLIENT_NAME",
    field: "CLIENT_NAME",
    name: "사용자PC",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "PROCESS_FLAG",
    field: "PROCESS_FLAG",
    name: "접속여부",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_DATE_T",
    field: "INOUT_DATE_T",
    name: "로그인/로그아웃 시간",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 입출고 수불내역탭의 그리드 초기값 설정
 */
function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 4,
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "CS04050Q.RS_T1_MASTER",
    sortCol: "USER_ID",
    gridOptions: options
  });

  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

function grdT1MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1MASTER.lastRow != null) {
    if (row == G_GRDT1MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Master", row + 1);
}

function grdT2MasterOnGetColumns() {

  var columns = [ ];

  $NC.setGridColumn(columns, {
    id: "USER_ID",
    field: "USER_ID",
    name: "사용자ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CLIENT_IP",
    field: "CLIENT_IP",
    name: "사용자IP",
    minWidth: 100
  });

  $NC.setGridColumn(columns, {
    id: "PASS_DATE",
    field: "PASS_DATE",
    name: "사용자패스워드변경시간",
    minWidth: 80
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 일자별 수불내역탭의 그리드 초기값 설정
 */
function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 6,

  };


  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "CS04050Q.RS_T2_MASTER",
    sortCol: "USER_ID",
    gridOptions: options
  });

  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);

}

function grdT2MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2MASTER.lastRow != null) {
    if (row == G_GRDT2MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Master", row + 1);
}

/**
 * 입출고 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT1(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);

  if (G_GRDT1MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT1MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT1Master", 0, 0);
  }
}

/**
 * 일자별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT2(ajaxData) {

  $NC.setInitGridData(G_GRDT2MASTER, ajaxData);

  if (G_GRDT2MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT2MASTER, 0);
  } else {
    $NC.setGridDisplayRows("grdT2Master", 0, 0);
  }
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  // 입출고 수불내역
  $NC.clearGridData(G_GRDT1MASTER);
  // 일자별 수불내역
  $NC.clearGridData(G_GRDT2MASTER);
}
