/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  $("#btnQBu_Cd").click(showUserBuPopup);

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
    }
  });

  // 버튼 권한 체크 및 클릭 이벤트 연결
  setUserProgramPermission();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {
  // 스플리터 초기화
  $NC.setInitSplitter("#divMasterView", "v", $NC.G_OFFSET.leftViewWidth, 300, 400);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.leftViewWidth = 550;
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

  // Grid 사이즈 조정
  var parent = $("#grdMaster").parent();
  $NC.resizeGrid("#grdMaster", parent.width(), parent.height() - $NC.G_LAYOUT.header);
  parent = $("#grdDetail").parent();
  $NC.resizeGrid("#grdDetail", parent.width(), parent.height() - $NC.G_LAYOUT.header);
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  // 브랜드 Key 입력
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
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  // 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  $NC.setInitGridData(G_GRDMASTER);
  $NC.setInitGridVar(G_GRDDETAIL);
  $NC.setInitGridData(G_GRDDETAIL);

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
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          grid, row, cell, val
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

  if (args.grid != "grdDetail") {
    return;
  }

  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDDETAIL, args.row);

  var rowData = G_GRDDETAIL.data.getItem(args.row);

  if (args.cell == G_GRDDETAIL.view.getColumnIndex("EXEC_PROCESS_YN")) {
    if (rowData.PROCESS_STATE == "20" || rowData.PROCESS_STATE == "40") {
      rowData.EXEC_PROCESS_YN = "Y";
      G_GRDDETAIL.data.updateItem(rowData.id, rowData);

      alert("[" + rowData.PROCESS_NM + "]은 생략할 수 없는 프로세스입니다.");
      return;
    } else {
      rowData.EXEC_PROCESS_YN = args.val === "Y" ? "N" : "Y";
    }
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);

  // 전체 프로세스등록 정보를 삭제하고 등록
  G_GRDDETAIL.lastRowModified = true;
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
    alert("사업부를 먼저 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  $NC.setInitGridVar(G_GRDDETAIL);

  // 데이터 조회
  $NC.serviceCall("/CS03020E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  // grdMaster에 포커스가 있을 경우
  if (G_GRDMASTER.focused) {
    var rowCount = G_GRDMASTER.data.getLength();
    if (rowCount > 0) {
      // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
      var rowData = G_GRDMASTER.data.getItem(rowCount - 1);
      if (rowData.CRUD == "N") {
        G_GRDMASTER.view.gotoCell(rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      PROCESS_GRP: null,
      PROCESS_CD: null,
      PROCESS_NM: null,
      START_PROCESS_YN: "N",
      END_PROCESS_YN: "N",
      PROCESS_STATE: null,
      PROCESS_STATE_D: null,
      REG_DATETIME: null,
      id: $NC.getGridNewRowId(),
      CRUD: "N"
    };
    G_GRDMASTER.data.addItem(newRowData);
    $NC.setGridSelectRow(G_GRDMASTER, rowCount);
    // 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdMasterOnNewRecord({
      row: rowCount,
      rowData: newRowData
    });
  } else {

    // 현재 수정모드면
    if (G_GRDMASTER.view.getEditorLock().isActive()) {
      G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (G_GRDMASTER.lastRow != null) {
      if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
        return;
      }
    }

    var rowCount = G_GRDMASTER.data.getLength();
    if (rowCount > 0) {
      // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
      var rowData = G_GRDMASTER.data.getItem(rowCount - 1);
      if (rowData.CRUD == "N") {
        G_GRDMASTER.view.gotoCell(rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      PROCESS_GRP: G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow).PROCESS_GRP,
      PROCESS_F: null,
      CHILD_PROCESS_F: null,
      REG_USER_ID: null,
      REG_DATETIME: null,
      id: $NC.getGridNewRowId(),
      CRUD: "N"
    };
    G_GRDMASTER.data.addItem(newRowData);
    $NC.setGridSelectRow(G_GRDMASTER, rowCount);
    // 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdMasterOnNewRecord({
      row: rowCount,
      rowData: newRowData
    });
  }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  if (G_GRDDETAIL.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 먼저 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  // 프로세스 수정 데이터
  var saveDS = [ ];
  var rowCount = G_GRDDETAIL.data.getLength();
  var checkCount = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.EXEC_PROCESS_YN == "Y") {
      checkCount++;
    }
    if (rowData.ENTRY_YN == "N") {
      var saveData = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_PROCESS_GRP: rowData.PROCESS_GRP,
        P_PROCESS_CD: rowData.PROCESS_CD,
        P_PARENT_PROCESS_CD: rowData.PARENT_PROCESS_CD,
        P_EXEC_PROCESS_YN: rowData.EXEC_PROCESS_YN,
        P_PROCESS_COMMENT: rowData.PROCESS_COMMENT,
        P_CRUD: "C"
      };
      saveDS.push(saveData);
    } else if (rowData.ENTRY_YN == "Y" && rowData.CRUD != "R") {
      var saveData = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_PROCESS_GRP: rowData.PROCESS_GRP,
        P_PROCESS_CD: rowData.PROCESS_CD,
        P_PARENT_PROCESS_CD: rowData.PARENT_PROCESS_CD,
        P_EXEC_PROCESS_YN: rowData.EXEC_PROCESS_YN,
        P_PROCESS_COMMENT: rowData.PROCESS_COMMENT,
        P_CRUD: "U"
      };
      saveDS.push(saveData);
    }
  }

  if (checkCount == 0) {
    alert("수행 프로세스를 선택하십시오.");
    return;
  }
  if (saveDS.length > 0) {
    $NC.serviceCall("/CS03020E/save.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
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

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: ["PROCESS_GRP", "PROCESS_CD"],
    isCancel: true
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: ["PROCESS_GRP", "PROCESS_CD"],
    isCancel: true
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL.lastKeyVal = lastKeyVal2;
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
    id: "PROCESS_GRP_F",
    field: "PROCESS_GRP_F",
    name: "프로세스그룹",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "PROCESS_CD",
    field: "PROCESS_CD",
    name: "프로세스코드",
    minWidth: 85,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "PROCESS_NM",
    field: "PROCESS_NM",
    name: "프로세스명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "START_PROCESS_YN",
    field: "START_PROCESS_YN",
    name: "시작가능여부",
    minWidth: 85,
    maxWidth: 85,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "END_PROCESS_YN",
    field: "END_PROCESS_YN",
    name: "종료가능여부",
    minWidth: 85,
    maxWidth: 85,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "PROCESS_STATE_F",
    field: "PROCESS_STATE_F",
    name: "프로세스상태",
    minWidth: 90
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CS03020E.RS_MASTER",
    sortCol: "PROCESS_GRP_F",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnBeforePost(row) {

  if (!G_GRDMASTER.lastRowModified) {
    return true;
  }

  var rowData = G_GRDMASTER.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  /*
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    
  }
  
  if (rowData.CRUD != "R") {
    
  }
  */

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
    if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDMASTER.data.getItem(row);
  var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (G_GRDMASTER.lastRow == null || rowData.PROCESS_GRP != lastRowData.PROCESS_GRP) {

    // 조회시 디테일 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");

    G_GRDDETAIL.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_PROCESS_GRP: rowData.PROCESS_GRP
    });

    // 디테일 조회
    $NC.serviceCall("/CS03020E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "PROCESS_GRP_F",
    field: "PROCESS_GRP_F",
    name: "프로세스그룹",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "PROCESS_CD",
    field: "PROCESS_CD",
    name: "프로세스코드",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "PROCESS_NM",
    field: "PROCESS_NM",
    name: "프로세스명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "EXEC_PROCESS_YN",
    field: "EXEC_PROCESS_YN",
    name: "프로세스수행여부",
    minWidth: 120,
    maxWidth: 120,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "PROCESS_STATE_F",
    field: "PROCESS_STATE_F",
    name: "프로세스상태",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "PROCESS_COMMENT",
    field: "PROCESS_COMMENT",
    name: "프로세스설명",
    minWidth: 150,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1,
    specialRow: {
      compareKey: "ENTRY_YN",
      compareVal: "N",
      compareOperator: "==",
      cssClass: "specialrow4"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "CS03020E.RS_DETAIL",
    sortCol: "PROCESS_GRP_F",
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
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["PROCESS_GRP", "PROCESS_CD"],
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 프로세스그룹을 선택하였을 경우 상단 등록프로세스 데이터 표시처리
 */
function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: ["PROCESS_GRP", "PROCESS_CD"],
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
}

function onSave(ajaxData) {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: ["PROCESS_GRP", "PROCESS_CD"]
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: ["PROCESS_GRP", "PROCESS_CD"]
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL.lastKeyVal = lastKeyVal2;
}

function onSaveError(ajaxData) {
  $NC.onError(ajaxData);
}

function onBtnCopyClick() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  if ($NC.isNull(BU_NM)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "CS03021P",
    PROGRAM_NM: "프로세스 복사",
    url: "cs/CS03021P.html",
    width: 610,
    height: 160,
    userData: {
      P_CENTER_CD: CENTER_CD,
      P_CENTER_CD_F: $NC.getValueCombo("#cboQCenter_Cd", "F"),
      P_BU_CD: BU_CD,
      P_BU_NM: BU_NM
    },
    onOk: function() {
      _Inquiry();
    }
  });
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();

  // 저장
  if (permission.canSave) {
    $("#btnCopy").click(onBtnCopyClick);
  }
  $NC.setEnable("#btnCopy", permission.canSave);
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
