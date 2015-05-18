/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();

  // 조회조건 - 사업부 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  // 조회조건 - 송신구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "EDI_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "2",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQEdi_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true,
    onComplete: function() {
      $NC.setValue("#cboQEdi_Div", 0);
    }
  });

  // 사업부 검색 이미지 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {

  // 스플리터 초기화
  $NC.setInitSplitter("#divMasterView", "h", 200, 200);
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

  // Splitter 컨테이너 크기 조정
  var container = $("#divMasterView");
  $NC.resizeContainer(container, clientWidth, clientHeight);

  var splitTopAreaHeight = $("#grdMaster").parent().height();
  var height = splitTopAreaHeight - $NC.G_LAYOUT.header;

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, height);

  var splitBottomAreaHeight = $("#grdDetail").parent().height();
  height = splitBottomAreaHeight - $NC.G_LAYOUT.header - 1;
  var width = clientWidth;

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", width, height);
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDDETAIL);
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

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  // 사업부 Key 입력
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
  onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  if ($NC.isNull(BU_NM)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  var EDI_DIV = $NC.getValue("#cboQEdi_Div");
  if ($NC.isNull(EDI_DIV)) {
    alert("송신구분을 선택하십시오.");
    $NC.setFocus("#cboQEdi_Div");
    return;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 데이터 조회
  $NC.serviceCall("/ED02020E/getDataSet.do", {
    P_QUERY_ID: "ED02020E.RS_MASTER",
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: BU_CD,
      P_EDI_DIV: EDI_DIV
    })
  }, onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  if ($NC.isNull(BU_NM)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  var EDI_DIV = $NC.getValue("#cboQEdi_Div");
  if ($NC.isNull(EDI_DIV)) {
    alert("송신구분을 선택하십시오.");
    $NC.setFocus("#cboQEdi_Div");
    return;
  }

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "ED02021P",
    PROGRAM_NM: "송신정의등록/수정",
    url: "ed/ED02021P.html",
    width: 1024,
    height: 600,
    userData: {
      P_PROCESS_CD: "N",
      P_BU_CD: BU_CD,
      P_BU_NM: BU_NM,
      P_EDI_DIV: EDI_DIV,
      P_MASTER_DS: {},
      P_DETAIL_DS: [ ]
    },
    onOk: function() {
      onSave();
    }
  });
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  var saveDS = [ ];
  // 필터링 된 데이터라 전체 데이터를 기준으로 처리
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var saveData = {
    P_BU_CD: rowData.BU_CD,
    P_EDI_DIV: rowData.EDI_DIV,
    P_DEFINE_NO: rowData.DEFINE_NO,
    P_CRUD: rowData.CRUD
  };
  saveDS.push(saveData);
  if (saveDS.length > 0) {
    $NC.serviceCall("/ED02020E/save.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_DS_DETAIL: null,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
  return;
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }
  if (G_GRDMASTER.lastRow == null) {
    alert("삭제할 송신정의를 선택하십시요.");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  var result = confirm("선택한 송신정의를 삭제하시겠습니까?");
  if (result) {
    rowData.CRUD = "D";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
    _Save();
  }
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
    id: "EDI_DIV",
    field: "EDI_DIV",
    name: "수신코드",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "EDI_DIV_D",
    field: "EDI_DIV_D",
    name: "수신코드구분",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "DEFINE_NO",
    field: "DEFINE_NO",
    name: "정의번호",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DEFINE_NM",
    field: "DEFINE_NM",
    name: "송신정의명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "DATA_DIV_D",
    field: "DATA_DIV_D",
    name: "송신처리구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "LINK_DB_NM",
    field: "LINK_DB_NM",
    name: "데이터베이스명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "LINK_TABLE_NM",
    field: "LINK_TABLE_NM",
    name: "테이블명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "LINK_WHERE_TEXT",
    field: "LINK_WHERE_TEXT",
    name: "송신추가조건절",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "XLS_FIRST_ROW",
    field: "XLS_FIRST_ROW",
    name: "엑셀데이터첫행",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TXT_DELIMETER_YN",
    field: "TXT_DELIMETER_YN",
    name: "텍스트구분자사용여부",
    minWidth: 160,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "TXT_COL_DELIMETER",
    field: "TXT_COL_DELIMETER",
    name: "텍스트컬럼구분자",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "XML_TAG_ROOT",
    field: "XML_TAG_ROOT",
    name: "[XML]루트태그",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "XML_TAG_BUNCH",
    field: "XML_TAG_BUNCH",
    name: "[XML]단위태그",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "XML_TAG_SUB_BUNCH",
    field: "XML_TAG_SUB_BUNCH",
    name: "[XML]하위단위태그",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "PREFIX_FILE_NM",
    field: "PREFIX_FILE_NM",
    name: "파일명접두사",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "AUTO_EXEC_YN",
    field: "AUTO_EXEC_YN",
    name: "자동실행여부",
    minWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "REMOTE_IP",
    field: "REMOTE_IP",
    name: "원격서버IP",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "REMOTE_PORT",
    field: "REMOTE_PORT",
    name: "원격서버포트",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REMOTE_PASSIVE_YN",
    field: "REMOTE_PASSIVE_YN",
    name: "패시브모드",
    minWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "REMOTE_USER_ID",
    field: "REMOTE_USER_ID",
    name: "원격사용자ID",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "REMOTE_DIR",
    field: "REMOTE_DIR",
    name: "원격서버경로",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "EDI_DIR",
    field: "EDI_DIR",
    name: "서버파일경로",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "WEBSERVICE_URL",
    field: "WEBSERVICE_URL",
    name: "웹서비스URL",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "WEBSERVICE_METHOD",
    field: "WEBSERVICE_METHOD",
    name: "웹서비스메소드",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "DATA_CYCLE_DIV_D",
    field: "DATA_CYCLE_DIV_D",
    name: "실행주기구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REPEAT_EXEC_TIME",
    field: "REPEAT_EXEC_TIME",
    name: "실행주기",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 260
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상단그리드 초기화
 */
function grdMasterInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "ED02020E.RS_MASTER",
    sortCol: "DEFINE_NO",
    gridOptions: options,
    canDblClick: true
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onDblClick.subscribe(grdMasterOnDblClick);
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

  var rowData = G_GRDMASTER.data.getItem(row);
  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL);
  // 파라메터 세팅
  G_GRDDETAIL.queryParams = $NC.getParams({
    P_BU_CD: rowData.BU_CD,
    P_EDI_DIV: rowData.EDI_DIV,
    P_DEFINE_NO: rowData.DEFINE_NO
  });
  // 데이터 조회
  $NC.serviceCall("/ED02020E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
}

function grdMasterOnDblClick(e, args) {

  if (G_GRDMASTER.data.getLength() == 0) {
    return;
  }

  // 저장권한
  if (!$NC.getProgramPermission().canSave) {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  var BU_NM = $NC.getValue("#edtQBu_Nm");
  var masterRowData = G_GRDMASTER.data.getItem(args.row);
  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "ED02021P",
    PROGRAM_NM: "송신정의등록/수정",
    url: "ed/ED02021P.html",
    width: 1024,
    height: 600,
    userData: {
      P_PROCESS_CD: "U",
      P_BU_CD: masterRowData.BU_CD,
      P_BU_NM: BU_NM,
      P_EDI_DIV: masterRowData.EDI_DIV,
      P_MASTER_DS: masterRowData,
      P_DETAIL_DS: G_GRDDETAIL.data.getItems()
    },
    onOk: function() {
      onSave();
    }
  });
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "COLUMN_ID",
    field: "COLUMN_ID",
    name: "ID",
    minWidth: 40,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "COLUMN_NM",
    field: "COLUMN_NM",
    name: "컬럼명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "컬럼설명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "DATA_TYPE_F",
    field: "DATA_TYPE_F",
    name: "송신컬럼타입",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "LINK_COLUMN_NM",
    field: "LINK_COLUMN_NM",
    name: "송신컬럼명",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "XLS_COLUMN_NM",
    field: "XLS_COLUMN_NM",
    name: "엑셀컬럼명",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "TXT_POSITION",
    field: "TXT_POSITION",
    name: "텍스트시작위치",
    minWidth: 120,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TXT_LENGTH",
    field: "TXT_LENGTH",
    name: "텍스트컬럼길이",
    minWidth: 120,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "XML_TAG_NM",
    field: "XML_TAG_NM",
    name: "[XML]태그명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "XML_TAG_ATTR",
    field: "XML_TAG_ATTR",
    name: "[XML]태그속성",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DATA_NULL_YN",
    field: "DATA_NULL_YN",
    name: "널허용여부",
    minWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "DATA_DEFAULT",
    field: "DATA_DEFAULT",
    name: "기본값",
    minWidth: 50
  });
  $NC.setGridColumn(columns, {
    id: "DATE_FORMAT_DIV_F",
    field: "DATE_FORMAT_DIV_F",
    name: "날짜포맷구분",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "IF_CODE_GRP",
    field: "IF_CODE_GRP",
    name: "변환코드그룹",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "IF_CODE_GRP_D",
    field: "IF_CODE_GRP_D",
    name: "변환코드그룹명",
    minWidth: 120
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 하단그리드 초기화
 */
function grdDetailInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "ED02020E.RS_DETAIL",
    sortCol: "COLUMN_ID",
    gridOptions: options
  });
  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

function grdDetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL.lastRow != null) {
    if (row == G_GRDDETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

/**
 * 송신정의 조회
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "DEFINE_NO",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "1";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 송신정의 상세내역 조회
 * 
 * @param ajaxData
 */
function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);

  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "COLUMN_ID",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
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

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "DEFINE_NO"
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 저장시 에러 발생 했을 경우 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (rowData.CRUD === "D") {
    rowData.CRUD = "U";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
    // 마지막 선택 Row 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;
  }
}