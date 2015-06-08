/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null
  });

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel); // 닫기버튼
  $("#btnEntryNew").click(_New); // 그리드 행 추가 버튼
  $("#btnEntryDelete").click(_Delete); // 그리드 행 삭제 버튼
  $("#btnEntrySave").click(_Save); // 그리드 행 저장 버튼

  $NC.setInitDatePicker("#dtpProceed_Date"); // 유통가공일자

  // 그리드 초기화
  grdDetailInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
  $NC.setValue("#edtCenter_Cd", $NC.G_VAR.userData.P_CENTER_CD);
  $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);
  $NC.setValue("#dtpProceed_Date", $NC.G_VAR.userData.P_PROCEED_DATE);

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {

    var PROCEED_DATE = $NC.getValue("#dtpProceed_Date");
    var PROCEED_JOB_DIV = $NC.getValue("#cboProceed_Job_Div");

    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      PROCEED_DATE: PROCEED_DATE,
      PROCEED_NO: "",
      PROCEED_JOB_DIV: PROCEED_JOB_DIV,
      REMARK1: "",
      CRUD: "C"
    };
  } else {
    // 예정 -> 등록, 등록 수정
    var CRUD = "R";
    // 마스터 데이터 세팅
    var masterDS = $NC.G_VAR.userData.P_MASTER_DS;
    $NC.setValue("#dtpProceed_Date", masterDS.PROCEED_DATE);
    $NC.setValue("#dtpProceed_No", masterDS.PROCEED_NO);
    $NC.setValue("#cboProceed_Job_Div", masterDS.PROCEED_JOB_DIV);
    $NC.setValue("#edtRemark1", masterDS.REMARK1);

    $NC.G_VAR.masterData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      PROCEED_DATE: masterDS.PROCEED_DATE,
      PROCEED_NO: masterDS.PROCEED_NO,
      PROCEED_JOB_DIV: masterDS.PROCEED_JOB_DIV,
      REMARK1: masterDS.REMARK1,
      CRUD: CRUD
    };

    // 디테일 데이터 세팅
    var detailDS = $NC.G_VAR.userData.P_DETAIL_DS;
    var rowData;
    G_GRDDETAIL.data.beginUpdate();
    try {
      for ( var row in detailDS) {
        rowData = detailDS[row];
        var PROCEED_QTY = Number(rowData.PROCEED_QTY);
        if (PROCEED_QTY > 0) {
          var newRowData = {
            CENTER_CD: rowData.CENTER_CD,
            BU_CD: rowData.BU_CD,
            PROCEED_DATE: rowData.PROCEED_DATE,
            PROCEED_NO: rowData.PROCEED_NO,
            LINE_NO: rowData.LINE_NO,
            ITEM_CD: rowData.ITEM_CD,
            ITEM_NM: rowData.ITEM_NM,
            BRAND_CD: rowData.BRAND_CD,
            BRAND_NM: rowData.BRAND_NM,
            PROCEED_QTY: rowData.PROCEED_QTY,
            PROCEED_WEIGHT: rowData.PROCEED_WEIGHT,
            PROCEED_CBM: rowData.PROCEED_CBM,
            REMARK1: rowData.REMARK1,
            FEE_AMT: rowData.FEE_AMT,
            id: $NC.getGridNewRowId(),
            CRUD: CRUD
          };
          G_GRDDETAIL.data.addItem(newRowData);
        }
      }
    } finally {
      G_GRDDETAIL.data.endUpdate();
    }

    // 수정일 경우 입력불가 항목 비활성화 처리
    $NC.setEnable("#cboProceed_Job_Div", false);
    $NC.setEnable("#dtpProceed_Date", false);

    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

  // 조회조건 - 정산항목 세팅
  $NC.setInitCombo("/LC06010E/getDataSet.do", {
    P_QUERY_ID: "LC06010E.RS_SUB1",
    P_QUERY_PARAMS: $NC.getParams("{}")
  }, {
    selector: "#cboProceed_Job_Div",
    codeField: "FEE_BASE_CD",
    nameField: "FEE_BASE_NM",
    fullNameField: "FEE_BASE_CD_F",
    selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? "F" : null,
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.PROCEED_JOB_DIV = $NC.getValue("#cboProceed_Job_Div");
      } else {
        $NC.setValue("#cboProceed_Job_Div", $NC.G_VAR.masterData.PROCEED_JOB_DIV);
      }
    }
  });

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 100;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.topOffset;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_LAYOUT.border1 - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, $NC.G_OFFSET.masterViewHeight);
  $NC.resizeContainer("#divDetailView", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight
      - $NC.G_LAYOUT.margin1);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - $NC.G_LAYOUT.header
      - $NC.G_LAYOUT.margin1);
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

  var id = view.prop("id").substr(3).toUpperCase();
  masterDataOnChange(e, {
    col: id,
    val: val,
    view: view
  });
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
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }

  var rowCount = G_GRDDETAIL.data.getLength();
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDDETAIL.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      $NC.setFocusGrid(G_GRDDETAIL, rowCount - 1, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
      return;
    }
  }
  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
    BU_CD: $NC.G_VAR.masterData.BU_CD,
    PROCEED_DATE: $NC.G_VAR.masterData.PROCEED_DATE,
    PROCEED_NO: $NC.G_VAR.masterData.PROCEED_NO,
    LINE_NO: "",
    ITEM_CD: "",
    ITEM_NM: "",
    BRAND_CD: "",
    BRAND_NM: "",
    PROCEED_QTY: 0,
    PROCEED_WEIGHT: 0,
    PROCEED_CBM: 0,
    FEE_AMT: 0,
    REMARK1: "",
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };

  G_GRDDETAIL.data.addItem(newRowData);
  $NC.setGridSelectRow(G_GRDDETAIL, rowCount);
  if (rowCount === 0) {
    $NC.setGridDisplayRows("#grdDetail", rowCount + 1, G_GRDDETAIL.data.getLength());
  }

  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;

  // 신규 데이터 생성 후 이벤트 호출
  grdDetailOnNewRecord({
    row: rowCount,
    rowData: newRowData
  });
}

/**
 * 저장
 */
function _Save() {

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
    alert("물류센터를 입력하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.PROCEED_DATE)) {
    alert("먼저 유통가공일자를 입력하십시오.");
    $NC.setFocus("#dtpProceed_Date");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.PROCEED_JOB_DIV)) {
    alert("먼저 유통가공구분을 선택하십시오.");
    $NC.setFocus("#cboProceed_Job_Div");
    return;
  }

  // 현재 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }

  var d_DS = [ ];
  var cu_DS = [ ];
  var rows = G_GRDDETAIL.data.getItems();
  var rowCount = rows.length;
  for (var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_PROCEED_DATE: $NC.G_VAR.masterData.PROCEED_DATE,
        P_PROCEED_NO: $NC.G_VAR.masterData.PROCEED_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_PROCEED_QTY: String(rowData.PROCEED_QTY),
        P_PROCEED_WEIGHT: rowData.PROCEED_WEIGHT,
        P_PROCEED_CBM: rowData.PROCEED_CBM,
        P_REMARK1: rowData.REMARK1,
        P_FEE_AMT: rowData.FEE_AMT,
        P_CRUD: rowData.CRUD
      };
      if (rowData.CRUD === "D") {
        d_DS.push(saveData);
      } else {
        cu_DS.push(saveData);
      }
    }
  }
  var detailDS = d_DS.concat(cu_DS);
  if ($NC.G_VAR.masterData.CRUD === "R" && detailDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/LC06010E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_PROTECT_DATE: $NC.G_VAR.masterData.PROCEED_DATE,
      P_PROCEED_DATE: $NC.G_VAR.masterData.PROCEED_DATE,
      P_PROCEED_NO: $NC.G_VAR.masterData.PROCEED_NO,
      P_PROCEED_JOB_DIV: $NC.G_VAR.masterData.PROCEED_JOB_DIV,
      P_REMARK1: $NC.G_VAR.masterData.REMARK1,
      P_CRUD: $NC.G_VAR.masterData.CRUD
    }),
    P_DS_DETAIL: $NC.toJson(detailDS),
    P_PROCESS_CD: $NC.G_VAR.userData.P_PROCESS_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

  // 신규 데이터일 경우 그냥 삭제
  if (rowData.CRUD === "C" || rowData.CRUD === "N") {
    G_GRDDETAIL.data.deleteItem(rowData.id);
  } else {
    rowData.CRUD = "D";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
    G_GRDDETAIL.data.refresh();
  }
  // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
  if (G_GRDDETAIL.lastRow > 1) {
    $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.lastRow - 1);
  } else {
    G_GRDDETAIL.lastRow = null;
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

  // 마지막 선택 Row 수정 상태 복원
  G_GRDDETAIL.lastRowModified = false;
}

/**
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

  switch (args.col) {
  case "PROCEED_JOB_DIV":
    $NC.G_VAR.masterData.PROCEED_JOB_DIV = args.val;
    break;
  case "PROCEED_DATE":
    if (!$NC.isDate(args.val)) {
      alert("유통가공일자를 정확히 입력하십시오.");
      $NC.setInitDatePicker(args.view);
      $NC.setFocus(args.view);
    } else {
      $NC.setValue(args.view, $NC.getDate(args.val));
    }
    $NC.G_VAR.masterData.PROCEED_DATE = $NC.getValue(args.view);
    break;
  case "REMARK1":
    $NC.G_VAR.masterData.REMARK1 = args.val;
    break;
  }

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }

}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 50,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdDetailOnPopup,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "PROCEED_QTY",
    field: "PROCEED_QTY",
    name: "유통가공수량",
    minWidth: 100,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "PROCEED_WEIGHT",
    field: "PROCEED_WEIGHT",
    name: "유통가공중량",
    minWidth: 100,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      numberType: "D",
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "PROCEED_CBM",
    field: "PROCEED_CBM",
    name: "유통가공CBM",
    minWidth: 110,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      numberType: "D",
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "FEE_AMT",
    field: "FEE_AMT",
    name: "수수료금액",
    minWidth: 100,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: null,
    sortCol: "LINE_NO",
    gridOptions: options,
    canExportExcel: false,
    onFilter: grdDetailOnFilter
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);

}

/**
 * grdDetail 데이터 필터링 이벤트
 */
function grdDetailOnFilter(item) {

  return item.CRUD !== "D";
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdDetailOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
}

/**
 * 그리드에 입고예정등록 전표 생성 가능여부가 N일경우 편집 불가로 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
// function grdDetailOnBeforeEditCell(e, args) {
// return true;
// }
/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.ITEM_CD)) {
      P_QUERY_PARAMS = {
        P_BU_CD: rowData.BU_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_VIEW_DIV: "1",
        P_DEPART_CD: "%",
        P_LINE_CD: "%",
        P_CLASS_CD: "%"
      };
      O_RESULT_DATA = $NP.getItemInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemPopup, onItemPopup);
    }
    return;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
}

/**
 * 저장시 그리드 입력 체크
 */
function grdDetailOnBeforePost(row) {

  if (!G_GRDDETAIL.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAIL.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.ITEM_CD)) {
      G_GRDDETAIL.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL, row - 1);
        setTimeout(function() {
          $NC.setGridDisplayRows("#grdDetail", row, G_GRDDETAIL.data.getLength());
        }, 300);
      }
      return true;
    }
  }
  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.ITEM_CD) || $NC.isNull(rowData.ITEM_NM) || $NC.isNull(rowData.BRAND_CD)) {
      alert("상품코드를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ITEM_CD"),
        editMode: true
      });
      return false;
    }

    if ($NC.isNull(rowData.PROCEED_QTY)) {
      alert("유통가공수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("PROCEED_QTY"),
        editMode: true
      });
      return false;
    } else {
      var PROCEED_QTY = Number(rowData.PROCEED_QTY);
      if (PROCEED_QTY < 1) {
        alert("유통가공수량은 1보다 작을 수 없습니다.");

        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("PROCEED_QTY"),
          editMode: true
        });
        return false;
      }
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  }
  return true;
}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdDetailOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDDETAIL.lastRow != null) {
    if (row == G_GRDDETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

/**
 * 그리드의 상품 팝업 처리
 */
function grdDetailOnPopup(e, args) {

  var rowData = args.item;

  switch (args.column.field) {
  case "ITEM_CD":
    $NP.showItemPopup({
      P_BU_CD: rowData.BU_CD,
      P_ITEM_CD: "%",
      P_VIEW_DIV: "1",
      P_DEPART_CD: "%",
      P_LINE_CD: "%",
      P_CLASS_CD: "%"
    }, onItemPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
    });
    break;
  }
}

function onItemPopup(resultInfo) {

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.ITEM_CD = resultInfo.ITEM_CD;
    rowData.ITEM_NM = resultInfo.ITEM_NM;

    rowData.BRAND_CD = resultInfo.BRAND_CD;
    rowData.BRAND_NM = resultInfo.BRAND_NM;

    focusCol = G_GRDDETAIL.view.getColumnIndex("PROCEED_QTY");
  } else {
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";

    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    focusCol = G_GRDDETAIL.view.getColumnIndex("ITEM_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
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