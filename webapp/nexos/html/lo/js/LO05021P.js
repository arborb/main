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
  $("#btnClose").click(onClose); // 닫기버튼

  $("#btnEntryNew").click(_New); // 그리드 행 추가 버튼
  $("#btnEntryDelete").click(_Delete); // 그리드 행 삭제버튼
  $("#btnEntrySave").click(_Save); // 저장 버튼

  $("#edtItem_Cd").prop("readonly", true); // 상품코드 readonly
  $("#edtItem_Nm").prop("readonly", true); // 상품명 readonly
  $("#edtItem_Spec").prop("readonly", true); // 규격 readonly
  $("#edtEntry_Qty").prop("readonly", true); // 등록수량 readonly

  // 그리드 초기화
  grdDetailInitialize();

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 70;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtBrand_Cd", $NC.G_VAR.userData.P_BRAND_CD);
  $NC.setValue("#edtBrand_Nm", $NC.G_VAR.userData.P_BRAND_NM);
  $NC.setValue("#edtItem_Cd", $NC.G_VAR.userData.P_ITEM_CD);
  $NC.setValue("#edtItem_Nm", $NC.G_VAR.userData.P_ITEM_NM);
  $NC.setValue("#edtItem_Spec", $NC.G_VAR.userData.P_ITEM_SPEC);
  $NC.setValue("#edtEntry_Qty", $NC.getDisplayNumber($NC.G_VAR.userData.P_ENTRY_QTY));

  var CRUD = "R";

  // 마스터 데이터 세팅
  $NC.G_VAR.masterData = {
    CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
    BU_CD: $NC.G_VAR.userData.P_BU_CD,
    OUTBOUND_DATE: $NC.G_VAR.userData.P_OUTBOUND_DATE,
    OUTBOUND_NO: $NC.G_VAR.userData.P_OUTBOUND_NO,
    BRAND_CD: $NC.G_VAR.userData.P_BRAND_CD,
    ITEM_CD: $NC.G_VAR.userData.P_ITEM_CD,
    ITEM_NM: $NC.G_VAR.userData.P_ITEM_NM,
    ITEM_SPEC: $NC.G_VAR.userData.P_ITEM_SPEC,
    ENTRY_QTY: $NC.G_VAR.userData.P_ENTRY_QTY,
    CRUD: CRUD
  };

  // 디테일 데이터 세팅
  var detailDS = $NC.G_VAR.userData.P_SUB_DS;
  var rowData;
  if (detailDS) {
    G_GRDDETAIL.data.beginUpdate();
    try {
      for ( var row in detailDS) {
        rowData = detailDS[row];
        var newRowData = {
          // ITEM_CD: rowData.ITEM_CD,
          // ITEM_NM: rowData.ITEM_NM,
          // ITEM_SPEC: rowData.ITEM_SPEC,
          ENTRY_QTY: rowData.ENTRY_QTY,
          ITEM_WEIGHT: rowData.ITEM_WEIGHT,
          REMARK1: rowData.REMARK1,
          id: $NC.getGridNewRowId(),
          CRUD: CRUD
        };
        G_GRDDETAIL.data.addItem(newRowData);
      }
    } finally {
      G_GRDDETAIL.data.endUpdate();
    }

    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, $NC.G_OFFSET.masterViewHeight);
  $NC.resizeContainer("#divDetailView", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - 9);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - $NC.G_LAYOUT.border1
      - $NC.G_LAYOUT.header - 8);

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
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }

  var ITEM_CD = $NC.getValue("#edtItem_Cd");

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
    BU_CD: $NC.G_VAR.masterData.BU_CD,
    OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
    OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
    BRAND_CD: $NC.G_VAR.masterData.BRAND_CD,
    ITEM_CD: ITEM_CD,
    ENTRY_QTY: 0,
    ITEM_WEIGHT: 0,
    REMARK1: "",
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };

  G_GRDDETAIL.data.addItem(newRowData);

  $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.data.getLength() - 1);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", G_GRDDETAIL.data.getLength(), G_GRDDETAIL.data.getLength());

  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;

  // 신규 데이터 생성 후 이벤트 호출
  grdDetailOnNewRecord({
    row: G_GRDDETAIL.lastRow,
    rowData: newRowData
  });
}

/**
 * 저장
 */
function _Save() {

  if (G_GRDDETAIL.data.getItems().length == 0) {
    alert("저장할 데이터가 없습니다.");
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

  // 등록수량 합계 체크.(수량 합계 체크를 위해 별도로 다시 체크)
  var entry_Qty = Number($NC.getValue("#edtEntry_Qty"));
  if (G_GRDDETAIL.data.getLength() > 0) {
    if (entry_Qty > getTotalEntryQty()) {
      alert("전표의 등록수량만큼 입력되지 않았습니다.");
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
        P_OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
        P_OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
        P_BRAND_CD: $NC.G_VAR.masterData.BRAND_CD,
        P_ITEM_CD: $NC.G_VAR.masterData.ITEM_CD,
        P_ITEM_WEIGHT: rowData.ITEM_WEIGHT,
        P_ENTRY_QTY: rowData.ENTRY_QTY,
        P_REMARK1: rowData.REMARK1,
        P_REG_USER_ID: "",
        P_REG_DATETIME: "",
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

  $NC.serviceCall("/LO05020E/save.do", {
    P_DS_MASTER: $NC.toJson(detailDS),
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

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_WEIGHT",
    field: "ITEM_WEIGHT",
    name: "등록중량(Kg)",
    minWidth: 80,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      numberType: "D",
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
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
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: null,
    sortCol: "ITEM_WEIGHT",
    gridOptions: options,
    canExportExcel: false,
    onFilter: grdDetailOnFilter
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

/**
 * 수정데이터일 경우 중량 컬럼은 수정불가.
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdDetailOnBeforeEditCell(e, args) {

  var rowData = G_GRDDETAIL.data.getItem(args.row);
  if (rowData) {
    if (args.cell === G_GRDDETAIL.view.getColumnIndex("ITEM_WEIGHT")) {
      if (rowData.CRUD === "R") {
        return false;
      }
    }
  }
  return true;
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
  // 신규 추가 후 포커싱
  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_WEIGHT"), true);
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnCellChange(e, args) {

  var rowData = args.item;

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
  // 중량 체크
  // 중량 null 체크
  if ($NC.isNull(rowData.ITEM_WEIGHT)) {
    alert("등록중량을 입력하십시오.");
    $NC.setGridSelectRow(G_GRDDETAIL, {
      selectRow: row,
      activeCell: G_GRDDETAIL.view.getColumnIndex("ITEM_WEIGHT"),
      editMode: true
    });
    return false;
    // 중량 0 체크
  } else {
    var ITEM_WEIGHT = Number(rowData.ITEM_WEIGHT);
    if (ITEM_WEIGHT <= 0) {
      alert("등록중량은 0보다 작을 수 없습니다.");

      G_GRDDETAIL.data.updateItem(rowData.id, rowData);
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ITEM_WEIGHT"),
        editMode: true
      });
      return false;
    }
  }
  // 수량 체크
  // 수량 null 체크
  if ($NC.isNull(rowData.ENTRY_QTY)) {
    alert("등록수량을 입력하십시오.");
    $NC.setGridSelectRow(G_GRDDETAIL, {
      selectRow: row,
      activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
      editMode: true
    });
    return false;
    // 수량 0 체크
  } else {
    var ENTRY_QTY = Number(rowData.ENTRY_QTY);
    if (ENTRY_QTY < 1) {
      alert("등록수량은 1보다 작을 수 없습니다.");

      G_GRDDETAIL.data.updateItem(rowData.id, rowData);
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
        editMode: true
      });
      return false;
    } else {
      // 등록수량 합계 체크.
      var entry_Qty = Number($NC.getValue("#edtEntry_Qty"));
      if (entry_Qty < getTotalEntryQty()) {
        alert("전표의 등록수량을 초과할 수 없습니다.");
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
          editMode: true
        });
        return false;
      }
    }
  }

  if (rowData.CRUD === "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  } else if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  }
  return true;
}

/**
 * 등록수량 합계 체크
 */
function getTotalEntryQty() {
  // 수량 합계 체크
  var rowCount = G_GRDDETAIL.data.getLength();
  var result = 0;
  var rowData;
  for (var i = 0; i < rowCount; i++) {
    rowData = G_GRDDETAIL.data.getItem(i);
    result += Number(rowData.ENTRY_QTY);
  }
  return result;
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
