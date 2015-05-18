/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();

  // 사업부 검색 버튼 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);

  $("#btnStartScheduler").click(onBtnStartScheduler);
  $("#btnStopScheduler").click(onBtnStopScheduler);

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

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
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

  // 사업부 값 변경시 마스터체크
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
  }
  // 화면클리어
  onChangingCondition();
}

function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDMASTER);

  $NC.setValue("#lblQSchedulerStartedYN", "스케줄실행여부: 미확인");

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
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 조회조건 체크
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_BU_CD: BU_CD
  });

  // 데이터 조회
  $NC.serviceCall("/ED02030E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

  // 스케줄 동작여부
  onStartStopScheduler();
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
    id: "BU_NM_F",
    field: "BU_NM_F",
    name: "사업부",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "EDI_DIV_D",
    field: "EDI_DIV_D",
    name: "송수신구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "DEFINE_NO",
    field: "DEFINE_NO",
    name: "정의번호",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "DEFINE_NM",
    field: "DEFINE_NM",
    name: "정의명칭",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "DATA_DIV_D",
    field: "DATA_DIV_D",
    name: "데이터처리구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "AUTO_EXEC_YN",
    field: "AUTO_EXEC_YN",
    name: "자동수행여부",
    cssClass: "align-center",
    minWidth: 90,
    maxWidth: 90,
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "REMOTE_DIV_D",
    field: "REMOTE_DIV_D",
    name: "원격송수신구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "DATA_CYCLE_DIV_D",
    field: "DATA_CYCLE_DIV_D",
    name: "송수신주기구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "LAST_EXEC_TIME",
    field: "LAST_EXEC_TIME",
    name: "최종수행시각",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "REPEAT_EXEC_TIME",
    field: "REPEAT_EXEC_TIME",
    name: "수행주기",
    minWidth: 120
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 수신처리 내역
 */
function grdMasterInitialize() {

  var options = {
    frozenColumn: 0,
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "ED02030E.RS_MASTER",
    sortCol: "BU_CD",
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
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);

}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

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
 * 검색조건의 사업부 검색 이미지 클릭
 */

function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQBu_Cd", true);
  });
}

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}

function onBtnStartScheduler() {

  // 저장권한
  if (!$NC.getProgramPermission().canSave) {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("조회 후 시작 처리하십시오.");
    return;
  }

  $NC.serviceCall("/ED02030E/startScheduler.do", {
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onStartStopScheduler);
}

function onStartStopScheduler(ajaxData) {

  $NC.serviceCall("/ED02030E/getSchedulerStartedYN.do", null, onGetSchedulerStartedYN);
}

function onBtnStopScheduler() {

  // 저장권한
  if (!$NC.getProgramPermission().canSave) {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("조회 후 종료 처리하십시오.");
    return;
  }

  $NC.serviceCall("/ED02030E/stopScheduler.do", {
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onStartStopScheduler);
}

function onGetSchedulerStartedYN(ajaxData) {

  var result = $NC.toArray(ajaxData);

  if (result.RESULT_DATA == "Y") {
    $NC.setValue("#lblQSchedulerStartedYN", "스케줄실행여부: 실행중");
  } else {
    $NC.setValue("#lblQSchedulerStartedYN", "스케줄실행여부: 중지중");
  }
}
