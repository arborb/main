/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null
  });

  // 그리드 초기화
  grdMasterInitialize();

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel); // 닫기버튼
  $("#btnEntryNew").click(_New); // 그리드 행 추가 버튼
  $("#btnEntryDelete").click(_Delete); // 그리드 행 삭제버튼
  $("#btnEntrySave").click(_Save); // 저장 버튼
}

function _SetResizeOffset() {

  // 화면 리사이즈 Offset 계산
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  var height = clientHeight - $NC.G_LAYOUT.header;
  var width = clientWidth;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", width, height);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  // 수신체크 세팅
  var masterDS = $NC.G_VAR.userData.P_MASTER_DS;
  var rowData;
  G_GRDMASTER.data.beginUpdate();
  try {
    for ( var row in masterDS) {
      rowData = masterDS[row];
      var newRowData = {
        BU_CD: rowData.BU_CD,
        EDI_DIV: rowData.EDI_DIV,
        DEFINE_NO: rowData.DEFINE_NO,
        LINK_COLUMN_NM: rowData.LINK_COLUMN_NM,
        LINK_COLUMN_ID: rowData.LINK_COLUMN_ID,
        LINK_DATA_TYPE: rowData.LINK_DATA_TYPE,
        LINK_DATA_TYPE_F: rowData.LINK_DATA_TYPE_F,
        COLUMN_VAL1: rowData.COLUMN_VAL1,
        COLUMN_VAL2: rowData.COLUMN_VAL2,
        COLUMN_VAL3: rowData.COLUMN_VAL3,
        REMARK1: rowData.REMARK1,
        id: $NC.getGridNewRowId(),
        CRUD: "R"
      };
      G_GRDMASTER.data.addItem(newRowData);
    }
  } finally {
    G_GRDMASTER.data.endUpdate();
  }

  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
}

/**
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

  $NC.setPopupCloseAction("CANCEL");
  $NC.onPopupClose();
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

  $NC.setPopupCloseAction("OK");
  $NC.onPopupClose();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

}

/**
 * 조회
 */
function _Inquiry() {

}

/**
 * 신규
 */
function _New() {
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
      $NC.setFocusGrid(G_GRDMASTER, rowCount - 1, G_GRDMASTER.view.getColumnIndex("LINK_COLUMN_ID"), true);
      return;
    }
  }
  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    BU_CD: $NC.G_VAR.userData.P_BU_CD,
    EDI_DIV: $NC.G_VAR.userData.P_EDI_DIV,
    DEFINE_NO: $NC.G_VAR.userData.P_DEFINE_NO,
    LINK_COLUMN_ID: "",
    LINK_COLUMN_NM: "",
    LINK_DATA_TYPE: "",
    COLUMN_VAL1: "",
    COLUMN_VAL2: "",
    COLUMN_VAL3: "",
    REMARK1: "",
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };

  G_GRDMASTER.data.addItem(newRowData);
  $NC.setGridSelectRow(G_GRDMASTER, rowCount);
  if (rowCount === 0) {
    $NC.setGridDisplayRows("#grdMaster", rowCount + 1, G_GRDMASTER.data.getLength());
  }

  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;

  // 신규 데이터 생성 후 이벤트 호출
  grdMasterOnNewRecord({
    row: rowCount,
    rowData: newRowData
  });
}

/**
 * 저장
 */
function _Save() {

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

  var d_DS = [ ];
  var cu_DS = [ ];
  var rows = G_GRDMASTER.data.getItems();
  var rowCount = rows.length;
  for (var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_BU_CD: rowData.BU_CD,
        P_EDI_DIV: rowData.EDI_DIV,
        P_DEFINE_NO: rowData.DEFINE_NO,
        P_LINK_COLUMN_ID: rowData.LINK_COLUMN_ID,
        P_LINK_COLUMN_NM: rowData.LINK_COLUMN_NM,
        P_LINK_DATA_TYPE: rowData.LINK_DATA_TYPE,
        P_COLUMN_VAL1: rowData.COLUMN_VAL1,
        P_COLUMN_VAL2: rowData.COLUMN_VAL2,
        P_COLUMN_VAL3: rowData.COLUMN_VAL3,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      if (rowData.CRUD === "D") {
        d_DS.push(saveData);
      } else {
        cu_DS.push(saveData);
      }
    }
  }
  var masterDS = d_DS.concat(cu_DS);
  if (masterDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/ED02010E/saveIdentifier.do", {
    P_DS_MASTER: $NC.toJson(masterDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  // 신규 데이터일 경우 그냥 삭제
  if (rowData.CRUD === "C" || rowData.CRUD === "N") {
    G_GRDMASTER.data.deleteItem(rowData.id);
  } else {
    rowData.CRUD = "D";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
    G_GRDMASTER.data.refresh();
  }
  // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
  if (G_GRDMASTER.lastRow > 1) {
    $NC.setGridSelectRow(G_GRDMASTER, G_GRDMASTER.lastRow - 1);
  } else {
    G_GRDMASTER.lastRow = null;
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  }

  // 마지막 선택 Row 수정 상태 복원
  G_GRDMASTER.lastRowModified = false;
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINK_COLUMN_ID",
    field: "LINK_COLUMN_ID",
    name: "ID",
    minWidth: 40,
    cssClass: "align-center",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    },
  });
  $NC.setGridColumn(columns, {
    id: "LINK_COLUMN_NM",
    field: "LINK_COLUMN_NM",
    name: "컬럼명",
    minWidth: 140,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "LINK_DATA_TYPE_F",
    field: "LINK_DATA_TYPE_F",
    name: "컬럼타입",
    minWidth: 100,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "LINK_DATA_TYPE",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "LINK_DATA_TYPE",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "COLUMN_VAL1",
    field: "COLUMN_VAL1",
    name: "초기값",
    minWidth: 60,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "COLUMN_VAL2",
    field: "COLUMN_VAL2",
    name: "1차수신결과값",
    minWidth: 120,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "COLUMN_VAL3",
    field: "COLUMN_VAL3",
    name: "최종수신결과값",
    minWidth: 120,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 260,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "ED02010E.RS_SUB3",
    sortCol: "LINK_COLUMN_ID",
    gridOptions: options,
    onFilter: grdMasterOnFilter
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

/**
 * grdMaster 데이터 필터링 이벤트
 */
function grdMasterOnFilter(item) {

  return item.CRUD !== "D";
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdMasterOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDMASTER, args.row, G_GRDMASTER.view.getColumnIndex("LINK_COLUMN_ID"), true);
}

/**
 * 그리드 행 선택 변경 했을 경우
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
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnCellChange(e, args) {

  var rowData = args.item;
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

/**
 * 저장시 그리드 입력 체크
 */
function grdMasterOnBeforePost(row) {

  if (!G_GRDMASTER.lastRowModified) {
    return true;
  }

  var rowData = G_GRDMASTER.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    // 컬럼명
    if ($NC.isNull(rowData.LINK_COLUMN_NM)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  // 일반항목 체크
  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.LINK_COLUMN_ID)) {
      alert("컬럼ID를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("LINK_COLUMN_ID"), true);
      return false;
    }
    if ($NC.isNull(rowData.LINK_COLUMN_NM)) {
      alert("컬럼명을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("LINK_COLUMN_NM"), true);
      return false;
    }
    if ($NC.isNull(rowData.LINK_DATA_TYPE)) {
      alert("컬럼타입을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("LINK_DATA_TYPE_F"), true);
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }
  return true;
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  onClose();
}