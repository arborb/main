/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null,
    SUM_PUTAWAY_QTY: 0,

  });

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel); // 닫기버튼
  $("#btnEntryNew").click(_New); // 그리드 행 추가 버튼
  $("#btnEntryDelete").click(_Delete); // 그리드 행 삭제버튼
  $("#btnEntrySave").click(_Save); // 저장 버튼
  $("#btnSave").click(btnSave); // 저장 버튼

  // 그리드 초기화
  grdSubEInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  SUM_PUTAWAY_QTY: 0;
  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "R") {
    $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
    $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);
    $NC.setValue("#edtInbound_Date", $NC.G_VAR.userData.P_INBOUND_DATE);
    $NC.setValue("#edtInbound_No", $NC.G_VAR.userData.P_INBOUND_NO);
    $NC.setValue("#edtItem_Cd", $NC.G_VAR.userData.P_ITEM_CD);
    $NC.setValue("#edtItem_Nm", $NC.G_VAR.userData.P_ITEM_NM);
    $NC.setValue("#edtItem_State", $NC.G_VAR.userData.P_ITEM_STATE_F);
    $NC.setValue("#edtTot_Putaway_Qty", $NC.G_VAR.userData.P_TOTAL_PUTAWAY_QTY);
    // 디테일 데이터 세팅
    var subDS = $NC.G_VAR.userData.P_RDSUBE_DS;
    var rowData;
    G_GRDSUBE.data.beginUpdate();
    try {
      for ( var row in subDS) {
        rowData = subDS[row];
        var PUTAWAY_QTY = Number(rowData.PUTAWAY_QTY);
        if (PUTAWAY_QTY > 0) {
          var newRowData = {
            CENTER_CD: rowData.CENTER_CD,
            BU_CD: rowData.BU_CD,
            INBOUND_DATE: rowData.INBOUND_DATE,
            INBOUND_DATE: rowData.INBOUND_NO,
            LINE_NO: '',
            PUTAWAY_LOCATION_CD_D: rowData.PUTAWAY_LOCATION_CD_D,
            ITEM_CD: rowData.ITEM_CD,
            ITEM_LOT: $NC.G_VAR.userData.P_ITEM_LOT,
            ITEM_NM: $NC.getValue("#edtItem_Nm"),
            ITEM_STATE: $NC.getValue("#edtItem_State"),
            VALID_DATE: rowData.VALID_DATE,
            CONFIRM_QTY: rowData.PUTAWAY_QTY,
            BU_LINE_NO: rowData.BU_LINE_NO,
            PUTAWAY_QTY: rowData.PUTAWAY_QTY,
            PUTAWAY_YN: rowData.PUTAWAY_YN,
            CRUD: $NC.G_VAR.userData.P_PROCESS_CD,
            id: $NC.getGridNewRowId(),
          };
          G_GRDSUBE.data.addItem(newRowData);
        }
      }
    } finally {
      G_GRDSUBE.data.endUpdate();
    }
    ;

    $NC.setGridSelectRow(G_GRDSUBE, 0);
  }
}
/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 110;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.topOffset;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_LAYOUT.border1 - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, $NC.G_OFFSET.masterViewHeight);
  $NC.resizeContainer("#divsubView", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - 9);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdSubE", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - $NC.G_LAYOUT.header - 9);
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
 * 조회
 */
function _Inquiry() {

}

/**
 * 신규
 */
function _New() {

  // 현재 수정모드면
  if (G_GRDSUBE.view.getEditorLock().isActive()) {
    G_GRDSUBE.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDSUBE.lastRow != null) {
    if (!grdSubEOnBeforePost(G_GRDSUBE.lastRow)) {
      return;
    }
  }

  var rowCount = G_GRDSUBE.data.getLength();
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDSUBE.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      $NC.setFocusGrid(G_GRDSUBE, rowCount - 1, G_GRDSUBE.view.getColumnIndex("PUTAWAY_LOCATION_CD_D"), true);
      return;
    }
  }
  var newRowData = {
    CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
    BU_CD: $NC.G_VAR.userData.P_BU_CD,
    INBOUND_DATE: $NC.G_VAR.userData.P_INBOUND_DATE,
    INBOUND_NO: $NC.G_VAR.userData.P_INBOUND_NO,
    LINE_NO: "",
    ITEM_CD: $NC.getValue("#edtItem_Cd"),
    ITEM_NM: $NC.getValue("#edtItem_Nm"),
    ITEM_STATE: $NC.getValue("#edtItem_State"),
    ITEM_LOT: "00",
    VALID_DATE: "",
    CONFIRM_QTY: 0,
    PUTAWAY_QTY: 0,
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };

  G_GRDSUBE.data.addItem(newRowData);
  $NC.setGridSelectRow(G_GRDSUBE, rowCount);
  if (rowCount === 0) {
    $NC.setGridDisplayRows("#grdSubE", rowCount + 1, G_GRDSUBE.data.getLength());
  }

  // 수정 상태로 변경
  G_GRDSUBE.lastRowModified = true;

  // 신규 데이터 생성 후 이벤트 호출
  grdSubEOnNewRecord({
    row: rowCount,
    rowData: newRowData
  });
}

/**
 * 저장
 */
function btnSave() {

  $NC.serviceCall("/LI02010E/callLi_Fw_Putaway_Proc.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_INBOUND_DATE: $NC.G_VAR.userData.P_INBOUND_DATE,
      P_INTBOUND_NO: $NC.G_VAR.userData.P_INBOUND_NO,
      P_USER_ID: $NC.G_USERINFO.USER_ID,
    })
  }, onPutawaySave);
}
/**
 * 저장
 */
function _Save() {

  if (G_GRDSUBE.data.getLength() == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  // 현재 수정모드면
  if (G_GRDSUBE.view.getEditorLock().isActive()) {
    G_GRDSUBE.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDSUBE.lastRow != null) {
    if (!grdSubEOnBeforePost(G_GRDSUBE.lastRow)) {
      return;
    }
  }

  onCalcSummary();

  // 현재 선택된 로우 Validation 체크
  if ($NC.G_VAR.SUM_PUTAWAY_QTY > $NC.G_VAR.userData.P_TOTAL_PUTAWAY_QTY) {

    alert("적치수량을 초과하여 등록할 수 없습니다.");
    return;
  } else if ($NC.G_VAR.SUM_PUTAWAY_QTY < $NC.G_VAR.userData.P_TOTAL_PUTAWAY_QTY) {

    alert("적치수량 미달로  등록할 수 없습니다.");
    return;
  }

  $NC.serviceCall("/LI02010E/callDelete.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_INBOUND_DATE: $NC.G_VAR.userData.P_INBOUND_DATE,
      P_INBOUND_NO: $NC.G_VAR.userData.P_INBOUND_NO,
      P_LINE_NO: $NC.G_VAR.userData.P_LINE_NO,
    })
  });


  
  var d_DS = [ ];
  var subDS = [ ];
  var rows = G_GRDSUBE.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    var saveData = {
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_INBOUND_DATE: $NC.G_VAR.userData.P_INBOUND_DATE,
      P_INBOUND_NO: $NC.G_VAR.userData.P_INBOUND_NO,
      P_LINE_NO: $NC.G_VAR.userData.P_LINE_NO,
      P_LOCATION_CD: rowData.PUTAWAY_LOCATION_CD_D,
      P_PUTAWAY_LOCATION_CD: rowData.PUTAWAY_LOCATION_CD_D,
      P_ITEM_CD: rowData.ITEM_CD,
      P_ITEM_STATE: $NC.G_VAR.userData.P_ITEM_STATE,
      P_ITEM_LOT: rowData.ITEM_LOT,
      P_VALID_DATE: '',
      P_CONFIRM_QTY: rowData.PUTAWAY_QTY,
      P_PUTAWAY_QTY: rowData.PUTAWAY_QTY
    };
    subDS.push(saveData);

  }

  $NC.serviceCall("/LI02010E/save1.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_INBOUND_DATE: $NC.G_VAR.userData.P_INBOUND_DATE,
      P_INBOUND_NO: $NC.G_VAR.userData.P_INBOUND_NO,
      P_LINE_NO: $NC.G_VAR.userData.P_LINE_NO,
    }),
    P_DS_SUB: $NC.toJson(subDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave1);
}
/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave1(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onPutawaySave(ajaxData) {

  onClose();
}
/**
 * 삭제
 */
function _Delete() {

  if (G_GRDSUBE.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var rowData = G_GRDSUBE.data.getItem(G_GRDSUBE.lastRow);

  // 신규 데이터일 경우 그냥 삭제
  if (rowData.CRUD === "C" || rowData.CRUD === "N") {
    G_GRDSUBE.data.deleteItem(rowData.id);
  } else {
    rowData.CRUD = "D";
    G_GRDSUBE.data.updateItem(rowData.id, rowData);
    G_GRDSUBE.data.refresh();
  }
  // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
  if (G_GRDSUBE.lastRow > 1) {
    $NC.setGridSelectRow(G_GRDSUBE, G_GRDSUBE.lastRow - 1);
  } else {
    G_GRDSUBE.lastRow = null;
    $NC.setGridSelectRow(G_GRDSUBE, 0);
  }

  // 마지막 선택 Row 수정 상태 복원
  G_GRDSUBE.lastRowModified = false;
}

function grdSubEOnGetColumns() {

  var columns = [ ];

  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE",
    field: "ITEM_STATE",
    name: "상태",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_LOCATION_CD_D",
    field: "PUTAWAY_LOCATION_CD_D",
    name: "적치로케이션",
    minWidth: 100,
    cssClass: "align-center",
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdSubEOnPopup
    }
  });

  $NC.setGridColumn(columns, {
    id: "PUTAWAY_QTY",
    field: "PUTAWAY_QTY",
    name: "적치수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  // 정책에 따른 컬럼 표시
  if ($NC.G_VAR.userData.P_POLICY_LI420 == "2") {
    $NC.setGridColumn(columns, {
      id: "VALID_DATE",
      field: "VALID_DATE",
      name: "유통기한",
      minWidth: 100,
      editor: Slick.Editors.Date
    });
    $NC.setGridColumn(columns, {
      id: "BATCH_NO",
      field: "BATCH_NO",
      name: "제조배치번호",
      minWidth: 100,
      editor: Slick.Editors.Text
    });
  }

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 그리드 초기값 설정
 */
function grdSubEInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSubE", {
    columns: grdSubEOnGetColumns(),
    queryId: null,
    sortCol: "LINE_NO",
    gridOptions: options,
    canExportExcel: false,
    onFilter: grdSubEOnFilter
  });

  G_GRDSUBE.view.onSelectedRowsChanged.subscribe(grdSubEOnAfterScroll);
  G_GRDSUBE.view.onBeforeEditCell.subscribe(grdSubEOnBeforeEditCell);
  G_GRDSUBE.view.onCellChange.subscribe(grdSubEOnCellChange);

}

/**
 * grdSubE 데이터 필터링 이벤트
 */
function grdSubEOnFilter(item) {

  return item.CRUD !== "D";
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdSubEOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDSUBE, args.row, G_GRDSUBE.view.getColumnIndex("PUTAWAY_LOCATION_CD_D"), true);
}

/**
 * 그리드에 입고예정등록 전표 생성 가능여부가 N일경우 편집 불가로 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdSubEOnBeforeEditCell(e, args) {

  return true;
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdSubEOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDSUBE.view.getColumnField(args.cell)) {
/*
  case "PUTAWAY_QTY":
    rowData = grdSubEOnCalc(rowData);
    break;
*/
  case "PUTAWAY_LOCATION_CD_D":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.PUTAWAY_LOCATION_CD_D)) {
      P_QUERY_PARAMS = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_ZONE_CD: "",
        P_BANK_CD: "",
        P_BAY_CD: "",
        P_LEV_CD: "",
        P_LOCATION_CD: rowData.PUTAWAY_LOCATION_CD_D
      };
      O_RESULT_DATA = $NP.getLocationInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onLocationPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showLocationPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onLocationPopup, onLocationPopup);
    }
    return;

  case "VALID_DATE":
    if (!$NC.isNull(rowData.VALID_DATE)) {
      if (!$NC.isDate(rowData.VALID_DATE)) {
        alert("유통기한을 정확히 입력하십시오.");
        rowData.VALID_DATE = "";
        G_GRDSUBE.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDSUBE, {
          selectRow: args.row,
          activeCell: G_GRDSUBE.view.getColumnIndex("VALID_DATE"),
          editMode: true
        });
        return false;
      } else {
        rowData.VALID_DATE = $NC.getDate(rowData.VALID_DATE);
        G_GRDSUBE.data.updateItem(rowData.id, rowData);
      }
    }
    break;
  }

  G_GRDSUBE.data.updateItem(rowData.id, rowData);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUBE.lastRowModified = true;
}

/**
 * 저장시 그리드 입력 체크
 */
function grdSubEOnBeforePost(row) {

  if (!G_GRDSUBE.lastRowModified) {
    return true;
  }

  var rowData = G_GRDSUBE.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  if (rowData.CRUD != "R") {

    if ($NC.isNull(rowData.PUTAWAY_LOCATION_CD_D)) {
      alert("적치 로케이션을 지정하십시오.");
      $NC.setGridSelectRow(G_GRDSUBE, {
        selectRow: row,
        activeCell: G_GRDSUBE.view.getColumnIndex("PUTAWAY_LOCATION_CD_D"),
        editMode: true
      });
      return false;
    }

    if ($NC.isNull(rowData.PUTAWAY_QTY)) {
      alert("젝치수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUBE, {
        selectRow: row,
        activeCell: G_GRDSUBE.view.getColumnIndex("PUTAWAY_QTY"),
        editMode: true
      });
      return false;
    } else {
      var PUTAWAY_QTY = Number(rowData.PUTAWAY_QTY);
      if (PUTAWAY_QTY < 1) {
        alert("예정수량은 1보다 작을 수 없습니다.");

        rowData = grdSubEOnCalc(rowData, rowData.PUTAWAY_QTY);
        G_GRDSUBE.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDSUBE, {
          selectRow: row,
          activeCell: G_GRDSUBE.view.getColumnIndex("PUTAWAY_QTY"),
          editMode: true
        });
        return false;
      }
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDSUBE.data.updateItem(rowData.id, rowData);
  }
  return true;
}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdSubEOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUBE.lastRow != null) {
    if (row == G_GRDSUBE.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdSubEOnBeforePost(G_GRDSUBE.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSubE", row + 1);
}

/**
 * 그리드에서 상품 선택/취소했을 경우 처리
 * 
 * @param seletedRowData
 */
/*
function grdSubEOnCalc(rowData, Putaway_Qty) {

  if (!$NC.isNull(Putaway_Qty)) {
    rowData.PUTAWAY_QTY = Number(Putaway_Qty);
  }

  var params = {
    TOTAL_AMT: rowData.TOTAL_AMT,// 합계금액
    POLICY_VAL: $NC.G_VAR.userData.P_POLICY_LI190
  };

  rowData.BUY_AMT = $NC.getItem_Amt(params);
  rowData.VAT_AMT = $NC.getVat_Amt(params);
  rowData.TOTAL_AMT = $NC.getTotal_Amt(params);

  return rowData;
}
*/
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

function grdSubEOnPopup(e, args) {

  switch (args.column.field) {
  case "PUTAWAY_LOCATION_CD_D":
    $NP.showLocationPopup({
      P_CENTER_CD: G_GRDSUBE.data.getItem(G_GRDSUBE.lastRow).CENTER_CD,
      P_ZONE_CD: "",
      P_BANK_CD: "",
      P_BAY_CD: "",
      P_LEV_CD: "",
      P_LOCATION_CD: "%"
    }, onLocationPopup, function() {
      $NC.setFocusGrid(G_GRDSUBE, G_GRDSUBE.lastRow, G_GRDSUBE.view.getColumnIndex("PUTAWAY_LOCATION_CD_D"), true, true);
    });
    return;
  }
}

function onLocationPopup(resultInfo) {

  var rowData1 = G_GRDSUBE.data.getItem(G_GRDSUBE.lastRow);
  if ($NC.isNull(rowData1)) {
    return;
  }

  var focusCol;
  var rows = G_GRDSUBE.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (!$NC.isNull(resultInfo)) {
      if (resultInfo.LOCATION_CD == rowData.PUTAWAY_LOCATION_CD_D) {
        alert("중복로케이션 입니다.");
        focusCol = G_GRDSUBE.view.getColumnIndex("PUTAWAY_LOCATION_CD_D");
        rowData1.ZONE_CD = "";
        rowData1.ZONE_NM = "";
        rowData1.BANK_CD = "";
        rowData1.BAY_CD = "";
        rowData1.LEV_CD = "";
        rowData1.PUTAWAY_LOCATION_CD_D = "";
        $NC.setFocusGrid(G_GRDSUBE, G_GRDSUBE.lastRow, focusCol, true, true);
        return;
      }
    }
  }

  if (!$NC.isNull(resultInfo)) {
    rowData1.ZONE_CD = resultInfo.ZONE_CD;
    rowData1.ZONE_NM = resultInfo.ZONE_NM;
    rowData1.BANK_CD = resultInfo.BANK_CD;
    rowData1.BAY_CD = resultInfo.BAY_CD;
    rowData1.LEV_CD = resultInfo.LEV_CD;
    rowData1.PUTAWAY_LOCATION_CD_D = resultInfo.LOCATION_CD;

  } else {
    rowData1.ZONE_CD = "";
    rowData1.ZONE_NM = "";
    rowData1.BANK_CD = "";
    rowData1.BAY_CD = "";
    rowData1.LEV_CD = "";
    rowData1.PUTAWAY_LOCATION_CD_D = "";
    focusCol = G_GRDSUBE.view.getColumnIndex("PUTAWAY_LOCATION_CD_D");
    $NC.setFocusGrid(G_GRDSUBE, G_GRDSUBE.lastRow, focusCol, true, true);
    return;
  }
  focusCol = G_GRDSUBE.view.getColumnIndex("PUTAWAY_QTY");
  if (rowData1.CRUD === "R") {
    rowData1.CRUD = "U";
  }
  G_GRDSUBE.data.updateItem(rowData1.id, rowData1);
  // 수정 상태로 변경
  G_GRDSUBE.lastRowModified = true;
  $NC.setFocusGrid(G_GRDSUBE, G_GRDSUBE.lastRow, focusCol, true, true);
}

function onCalcSummary() {

  if (G_GRDSUBE.data.getLength() == 0) {

    $NC.G_VAR.SUM_PUTAWAY_QTY = 0;

  } else {

    var summary = $NC.getGridSumVal(G_GRDSUBE, {
      sumKey: ["PUTAWAY_QTY"]
    });

    $NC.G_VAR.SUM_PUTAWAY_QTY = summary.PUTAWAY_QTY;
  }
}