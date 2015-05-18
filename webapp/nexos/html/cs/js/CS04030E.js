/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();
  grdSubInitialize();

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
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {
  // 스플리터 초기화
  $NC.setInitSplitter("#divSubView", "h", 300);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.gridMasterWidth = 450;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  var container = $("#divSubView");
  $NC.resizeContainer(container, clientWidth, clientHeight);

  var splitTopAreaHeight = $("#grdSub").parent().height();
  var height = splitTopAreaHeight - $NC.G_LAYOUT.header;

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdSub", clientWidth, height);

  var splitBottomAreaHeight = $("#divMaster").parent().height();
  var width = clientWidth - $NC.G_OFFSET.gridMasterWidth - $NC.G_LAYOUT.border1 - $NC.G_LAYOUT.margin1;

  $NC.resizeContainer("#divMaster", $NC.G_OFFSET.gridMasterWidth, splitBottomAreaHeight);
  $NC.resizeContainer("#divDetail", width, splitBottomAreaHeight);

  height = splitBottomAreaHeight - $NC.G_LAYOUT.header;

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", $NC.G_OFFSET.gridMasterWidth, height);
  $NC.resizeGrid("#grdDetail", width, height);
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  onChangingCondition();
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {
  // 초기화
  $NC.clearGridData(G_GRDMASTER);
  $NC.clearGridData(G_GRDDETAIL);
  $NC.clearGridData(G_GRDSUB);

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
 *          row, cell, value
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDDETAIL, args.row);

  var rowData = G_GRDDETAIL.data.getItem(args.row);

  if (args.cell == G_GRDDETAIL.view.getColumnIndex("SELECT_YN")) {
    rowData.SELECT_YN = args.val === "Y" ? "N" : "Y";

    if (rowData.SELECT_YN == "Y") {
      // 정책상세 그리드의 권장여부는 한 행만 "Y"이어야 한다.
      var rowCount = G_GRDDETAIL.data.getLength();
      for ( var row = 0; row < rowCount; row++) {
        var subRowData = G_GRDDETAIL.data.getItem(row);
        if (subRowData.SELECT_YN == "Y" && args.row !== row) {
          subRowData.SELECT_YN = "N";
          if (subRowData.CRUD === "R") {
            subRowData.CRUD = "U";
          }
          G_GRDDETAIL.data.updateItem(subRowData.id, subRowData);
        }
      }
    }
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
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

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  $NC.setInitGridData(G_GRDMASTER);
  $NC.setInitGridVar(G_GRDDETAIL);
  $NC.setInitGridData(G_GRDDETAIL);
  $NC.setInitGridVar(G_GRDSUB);
  $NC.setInitGridData(G_GRDSUB);

  // 데이터 조회
  $NC.serviceCall("/CS04030E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

  // 파라메터 세팅
  G_GRDSUB.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD
  });

  // 데이터 조회
  $NC.serviceCall("/CS04030E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
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
  if (G_GRDDETAIL.lastRow == null || G_GRDDETAIL.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var d_DS = [ ];
  var c_DS = [ ];
  var rowCount = G_GRDDETAIL.data.getLength();
  var rowData;
  var selectCount = 0;
  for ( var row = 0; row < rowCount; row++) {
    rowData = G_GRDDETAIL.data.getItem(row);
    // 선택되었을 경우, 기존 등록 데이터가 아니면 생성
    if (rowData.SELECT_YN == "Y") {
      selectCount++;
      if (rowData.ENTRY_YN == "N") {
        var saveData = {
          P_CENTER_CD: CENTER_CD,
          P_POLICY_CD: rowData.POLICY_CD,
          P_POLICY_VAL: rowData.POLICY_VAL,
          P_CRUD: "C"
        };
        c_DS.push(saveData);
      }
    } else {
      // 선택되지 않았을 경우, 기존 등록 데이터면 삭제
      if (rowData.ENTRY_YN == "Y") {
        var saveData = {
          P_CENTER_CD: CENTER_CD,
          P_POLICY_CD: rowData.POLICY_CD,
          P_POLICY_VAL: rowData.POLICY_VAL,
          P_CRUD: "D"
        };
        d_DS.push(saveData);
      }
    }
  }

  if (selectCount > 1) {
    alert("정책 적용값은 하나만 선택하여야 합니다.");
  }

  var saveDS = d_DS.concat(c_DS);
  if (saveDS.length > 0) {
    $NC.serviceCall("/CS04030E/save.do", {
      P_DS_MASTER: $NC.getParams(saveDS),
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
    selectKey: ["POLICY_CD"],
    isCancel: true
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: ["POLICY_CD", "POLICY_VAL"],
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
    id: "POLICY_GRP_F",
    field: "POLICY_GRP_F",
    name: "정책그룹",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_CD",
    field: "POLICY_CD",
    name: "정책코드",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_NM",
    field: "POLICY_NM",
    name: "정책명",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CS04030E.RS_MASTER",
    sortCol: "POLICY_CD",
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

  var rowData = G_GRDMASTER.data.getItem(row);
  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL);

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");

  // 파라메터 세팅
  G_GRDDETAIL.queryParams = $NC.getParams({
    P_POLICY_CD: rowData.POLICY_CD,
    P_CENTER_CD: CENTER_CD
  });

  // 데이터 조회
  $NC.serviceCall("/CS04030E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}
function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "POLICY_VAL",
    field: "POLICY_VAL",
    name: "정책값",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_VAL_NM",
    field: "POLICY_VAL_NM",
    name: "정책값명",
    minWidth: 250
  });
  $NC.setGridColumn(columns, {
    id: "RECOMMEND_YN",
    field: "RECOMMEND_YN",
    name: "권장여부",
    minWidth: 70,
    maxWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "SELECT_YN",
    field: "SELECT_YN",
    name: "선택여부",
    minWidth: 70,
    maxWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "CS04030E.RS_DETAIL",
    sortCol: "POLICY_VAL",
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
function grdSubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "POLICY_GRP_F",
    field: "POLICY_GRP_F",
    name: "정책그룹",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_CD",
    field: "POLICY_CD",
    name: "정책코드",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_NM",
    field: "POLICY_NM",
    name: "정책명",
    minWidth: 250
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_VAL",
    field: "POLICY_VAL",
    name: "정책값",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_VAL_NM",
    field: "POLICY_VAL_NM",
    name: "정책값명",
    minWidth: 250
  });
  $NC.setGridColumn(columns, {
    id: "RECOMMEND_YN",
    field: "RECOMMEND_YN",
    name: "권장정책여부",
    minWidth: 90,
    maxWidth: 90,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "REG_USER_ID",
    field: "REG_USER_ID",
    name: "최종등록자",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REG_DATETIME",
    field: "REG_DATETIME",
    name: "최종등록일시",
    minWidth: 120,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: "CS04030E.RS_SUB1",
    sortCol: "PROCESS_CD",
    gridOptions: options
  });

  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
}

function grdSubOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUB.lastRow != null) {
    if (row == G_GRDSUB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub", row + 1);
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
        selectKey: ["POLICY_CD"],
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
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  var rowCount = G_GRDDETAIL.data.getLength();
  if (rowCount > 0) {
    // 기존 선택값 복사
    var rowData;
    for ( var row = 0; row < rowCount; row++) {
      rowData = G_GRDDETAIL.data.getItem(row);
      rowData["ENTRY_YN"] = rowData.SELECT_YN;
      G_GRDDETAIL.data.updateItem(rowData.id, rowData);
    }
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: ["POLICY_CD", "POLICY_VAL"],
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetSub(ajaxData) {

  $NC.setInitGridData(G_GRDSUB, ajaxData);
  if (G_GRDSUB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDSUB.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSUB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSUB, {
        selectKey: "POLICY_CD",
        selectVal: G_GRDSUB.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdSub", 0, 0);
  }
}

function onSave(ajaxData) {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: ["POLICY_CD"]
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: ["POLICY_CD", "POLICY_VAL"],
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL.lastKeyVal = lastKeyVal2;
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}
