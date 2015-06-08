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

  $("#edtOutbound_No").prop("readonly", true); // 출고번호 readonly
  $("#edtLine_No").prop("readonly", true); // 출고순번 readonly
  $("#edtItem_Cd").prop("readonly", true); // 상품코드 readonly
  $("#edtItem_Nm").prop("readonly", true); // 상품명 readonly
  $("#edtItem_Spec").prop("readonly", true); // 규격 readonly
  $("#edtEntry_Qty").prop("readonly", true); // 등록수량 readonly
  $("#edtTotal_Entry_Qty").prop("readonly", true); // 분할수량합계 readonly

  // 그리드 초기화
  grdDetailInitialize();

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewWidth = 320;
  $NC.G_OFFSET.clientHeight = 230;
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtOutbound_No", $NC.G_VAR.userData.P_OUTBOUND_NO);
  $NC.setValue("#edtLine_No", $NC.G_VAR.userData.P_LINE_NO);
  $NC.setValue("#edtItem_Cd", $NC.G_VAR.userData.P_ITEM_CD);
  $NC.setValue("#edtItem_Nm", $NC.G_VAR.userData.P_ITEM_NM);
  $NC.setValue("#edtItem_Spec", $NC.G_VAR.userData.P_ITEM_SPEC);
  $NC.setValue("#edtEntry_Qty", $NC.G_VAR.userData.P_ENTRY_QTY);
  $NC.setValue("#edtTotal_Entry_Qty", "0");

  // 마스터 데이터 세팅
  $NC.G_VAR.masterData = {
    CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
    BU_CD: $NC.G_VAR.userData.P_BU_CD,
    OUTBOUND_DATE: $NC.G_VAR.userData.P_OUTBOUND_DATE,
    OUTBOUND_NO: $NC.G_VAR.userData.P_OUTBOUND_NO,
    LINE_NO: $NC.G_VAR.userData.P_LINE_NO,
    ITEM_CD: $NC.G_VAR.userData.P_ITEM_CD,
    ENTRY_QTY: $NC.G_VAR.userData.P_ENTRY_QTY,
    CRUD: "R"
  };

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - ($NC.G_LAYOUT.border1 * 2);

  $NC.resizeContainer("#divMasterView", $NC.G_OFFSET.masterViewWidth, $NC.G_OFFSET.clientHeight);
  $NC.resizeContainer("#divDetailView", clientWidth - $NC.G_OFFSET.masterViewWidth - 5, $NC.G_OFFSET.clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth - $NC.G_OFFSET.masterViewWidth - 5, $NC.G_OFFSET.clientHeight
      - $NC.G_LAYOUT.header);
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

  var entry_Qty = Number($NC.getValue("#edtEntry_Qty"));
  var total_Entry_Qty = getTotalEntryQty();
  if (entry_Qty <= total_Entry_Qty) {
    alert("이미 등록수량만큼 분할되어 있습니다.");
    $NC.setGridSelectRow(G_GRDDETAIL, {
      selectRow: G_GRDDETAIL.lastRow,
      activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
      editMode: true
    });
    return;
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
    BU_CD: $NC.G_VAR.masterData.BU_CD,
    OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
    OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
    LINE_NO: $NC.G_VAR.masterData.LINE_NO,
    ENTRY_QTY: 1,
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };

  G_GRDDETAIL.data.addItem(newRowData);

  $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.data.getLength() - 1);

  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;

  // 신규 데이터 생성 후 이벤트 호출
  grdDetailOnNewRecord({
    row: G_GRDDETAIL.data.getLength() - 1,
    rowData: newRowData
  });
}

/**
 * 저장
 */
function _Save() {

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("전표 분할 후 저장하십시오.");
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

  var TOTAL_ENTRY_QTY = Number($NC.getValue("#edtEntry_Qty"));
  if (TOTAL_ENTRY_QTY == getTotalEntryQty()) {
    alert("분할수량이 등록수량과 동일합니다.\n\n분할수량합계가 등록수량보다 작아야 처리가 됩니다.");
    $NC.setGridSelectRow(G_GRDDETAIL, {
      selectRow: G_GRDDETAIL.lastRow,
      activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
      editMode: true
    });
    return;
  }

  var detailDS = [ ];
  var rowCount = G_GRDDETAIL.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAIL.data.getItem(row);
    var saveData = {
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_OUTBOUND_DATE: $NC.G_VAR.masterData.OUTBOUND_DATE,
      P_OUTBOUND_NO: $NC.G_VAR.masterData.OUTBOUND_NO,
      P_LINE_NO: $NC.G_VAR.masterData.LINE_NO,
      P_ENTRY_QTY: rowData.ENTRY_QTY,
      P_CRUD: rowData.CRUD
    };
    detailDS.push(saveData);
  }

  $NC.serviceCall("/LD01010E/saveSplitOrder.do", {
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
  G_GRDDETAIL.data.deleteItem(rowData.id);

  // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
  if (G_GRDDETAIL.lastRow > 1) {
    $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.lastRow - 1);
  } else {
    G_GRDDETAIL.lastRow = null;
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

  $NC.setValue("#edtTotal_Entry_Qty", getTotalEntryQty());
  // 마지막 선택 Row 수정 상태 복원
  G_GRDDETAIL.lastRowModified = false;
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "분할수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number
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
    sortCol: "ITEM_CD",
    gridOptions: options,
    canExportExcel: false
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdDetailOnNewRecord(args) {
  $NC.setValue("#edtTotal_Entry_Qty", getTotalEntryQty());

  // 신규 추가 후 포커싱
  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"), true);
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

  // 수량 체크
  // 수량 null 체크
  if ($NC.isNull(rowData.ENTRY_QTY)) {
    alert("분할수량을 입력하십시오.");
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
      alert("분할수량이 1보다 작을 수 없습니다.");

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
        alert("분할수량 합계가 등록수량을 초과할 수 없습니다.");
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
  }

  $NC.setValue("#edtTotal_Entry_Qty", getTotalEntryQty());
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
  for ( var i = 0; i < rowCount; i++) {
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
