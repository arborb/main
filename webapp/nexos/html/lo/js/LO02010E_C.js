function onProcessPreC() {

  var rowCount = G_GRDMASTERC.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("출고지시 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDMASTERC.view.getEditorLock().isActive()) {
    G_GRDMASTERC.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERC.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 출고지시 상태인 전표만 대상
      if (rowData.OUTBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_OUTBOUND_NO: rowData.OUTBOUND_NO
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("출고지시 취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 출고지시 취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LO02010E/callLOProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "C",
    P_DIRECTION: "BW",
    P_OUTBOUND_BATCH: "",
    P_OUTBOUND_BATCH_NM: "",
    P_DELIVERY_BATCH_CD: "",
    P_DELIVERY_BATCH_NM: "",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSavePreC, onSaveErrorC, 2);
}

function onProcessNxtC() {

  var rowCount = G_GRDMASTERC.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("출고지시 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDMASTERC.view.getEditorLock().isActive()) {
    G_GRDMASTERC.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERC.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 출고등록 상태인 전표만 대상
      if (rowData.OUTBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_OUTBOUND_NO: rowData.OUTBOUND_NO,
          P_CRUD: "U"
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("출고지시 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 출고지시 처리 가능한 데이터가 없습니다.");
    return;
  }

  var OUTBOUND_BATCH = $NC.getValue("#cboOutbound_BatchC");
  var OUTBOUND_BATCH_NM = $NC.getValue("#edtOutbound_Batch_NmC");

  $NC.serviceCall("/LO02010E/callLOProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "C",
    P_DIRECTION: "FW",
    P_OUTBOUND_BATCH: OUTBOUND_BATCH,
    P_OUTBOUND_BATCH_NM: OUTBOUND_BATCH_NM,
    P_DELIVERY_BATCH_CD: "",
    P_DELIVERY_BATCH_NM: "",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveNxtC, onSaveErrorC, 2);
}

function grdMasterCOnGetColumns() {

  var processFormatter = function(row, cell, value, columnDef, dataContext) {
    if (dataContext.OUTBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
      return "<span class='ui-icon-prior'>&nbsp;</span>";
    }
    return "<span class='ui-icon-next'>&nbsp;</span>";
  };

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_STATE_P",
    field: "OUTBOUND_STATE",
    name: "P",
    minWidth: 30,
    maxWidth: 30,
    sortable: false,
    formatter: processFormatter
  }, false);
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_STATE_S",
    field: "OUTBOUND_STATE",
    name: "S",
    minWidth: 30,
    maxWidth: 30,
    formatter: grdStateFormatter
  }, false);
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    maxWidth: 30,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "출고구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_CD",
    field: "OWN_BRAND_CD",
    name: "위탁사",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_NM",
    field: "OWN_BRAND_NM",
    name: "위탁사명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "배송처",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_NM",
    field: "DELIVERY_NM",
    name: "배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_CD",
    field: "RDELIVERY_CD",
    name: "실배송처",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_NM",
    field: "RDELIVERY_NM",
    name: "실배송처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DIV_D",
    field: "ORDER_DIV_D",
    name: "주문구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "TOT_ENTRY_QTY",
    field: "TOT_ENTRY_QTY",
    name: "총수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "총금액",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_STATE_D",
    field: "OUTBOUND_STATE_D",
    name: "진행상태",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_NO",
    field: "ORDER_NO",
    name: "예정번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 출고지시 마스터 그리드 초기화
 */
function grdMasterCInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterC", {
    columns: grdMasterCOnGetColumns(),
    queryId: "LO02010E.RS_T2_MASTER",
    sortCol: "OUTBOUND_NO",
    gridOptions: options
  });

  G_GRDMASTERC.view.onSelectedRowsChanged.subscribe(grdMasterCOnAfterScroll);
  G_GRDMASTERC.view.onBeforeEditCell.subscribe(grdMasterCOnBeforeEditCell);
  G_GRDMASTERC.view.onCellChange.subscribe(grdMasterCOnCellChange);
  G_GRDMASTERC.view.onHeaderClick.subscribe(grdMasterCOnHeaderClick);
  G_GRDMASTERC.view.onClick.subscribe(grdMasterCOnClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERC, "CHECK_YN");
}

function grdMasterCOnCellChange(e, args) {

  var rowData = args.item;
  var row = args.row;

  if (G_GRDMASTERC.lastRow != null) {
    if (row == G_GRDMASTERC.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTERC.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTERC.lastRowModified = true;
}

/**
 * @param e
 *          Event Handler
 * @param args
 *          row: activeRow, cell: activeCell, item: item, column: columnDef
 */
function grdMasterCOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field === "CHECK_YN") {
    return true;
  }
  return false;
}

function grdMasterCOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERC.lastRow != null) {
    if (row == G_GRDMASTERC.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAILC);
  onGetDetailC({
    data: null
  });

  var rowData = G_GRDMASTERC.data.getItem(row);
  G_GRDDETAILC.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
    P_OUTBOUND_NO: rowData.OUTBOUND_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LO02010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILC), onGetDetailC);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterC", row + 1);
}

function grdMasterCOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTERC.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDMASTERC.view.getEditorLock().isActive() && !G_GRDMASTERC.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDMASTERC.data.getLength();
      var rowData;
      G_GRDMASTERC.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDMASTERC.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDMASTERC.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTERC.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdMasterCOnClick(e, args) {

  if (args.cell === G_GRDMASTERC.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTERC.view.getEditorLock().isActive() && !G_GRDMASTERC.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDMASTERC.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {

        if (rowData.CRUD === "R") {
          rowData.CRUD = "U";
        }

        G_GRDMASTERC.data.updateItem(rowData.id, rowData);
      }
      // e.stopPropagation();
      // e.stopImmediatePropagation();
    }
    return;
  }
}

function grdDetailCOnGetColumns(policyLO250) {

  if ($NC.isNull(policyLO250)) {
    policyLO250 = "1";
  }

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PICK_QTY",
    field: "PICK_QTY",
    name: "피킹수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PICK_BOX",
    field: "PICK_BOX",
    name: "피킹BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PICK_EA",
    field: "PICK_EA",
    name: "피킹EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  if (policyLO250 == "2") {
    $NC.setGridColumn(columns, {
      id: "VALID_DATE",
      field: "VALID_DATE",
      name: "유통기한",
      minWidth: 100,
      cssClass: "align-center"
    });
  }
  $NC.setGridColumn(columns, {
    id: "SUPPLY_PRICE",
    field: "SUPPLY_PRICE",
    name: "공급단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_PRICE",
    field: "DC_PRICE",
    name: "할인단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "APPLY_PRICE",
    field: "APPLY_PRICE",
    name: "적용단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUPPLY_AMT",
    field: "SUPPLY_AMT",
    name: "공급금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VAT_AMT",
    field: "VAT_AMT",
    name: "부가세액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_AMT",
    field: "DC_AMT",
    name: "할인금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_ORDER_DIV_F",
    field: "ITEM_ORDER_DIV_F",
    name: "상품주문유형",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailCInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailC", {
    columns: grdDetailCOnGetColumns(),
    queryId: "LO02010E.RS_T2_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDDETAILC.view.onSelectedRowsChanged.subscribe(grdDetailCOnAfterScroll);
}

function grdDetailCOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAILC.lastRow != null) {
    if (row == G_GRDDETAILC.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailC", row + 1);
}

function onGetMasterC(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERC, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERC, "CHECK_YN");
  if (G_GRDMASTERC.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTERC.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTERC, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERC, {
        selectKey: "OUTBOUND_NO",
        selectVal: G_GRDMASTERC.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMasterC", 0, 0);
    
    // 디테일 초기화
    $NC.setInitGridVar(G_GRDDETAILC);
    onGetDetailC({
      data: null
    });
  }

  // 전표 건수 정보 업데이트
  setMasterSummaryInfo();
  // 공통 버튼 활성화
  setTopButtons();
}

function onGetDetailC(ajaxData) {

  $NC.setInitGridData(G_GRDDETAILC, ajaxData);

  if (G_GRDDETAILC.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAILC, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetailC", 0, 0);
  }
}

/**
 * 확정 처리 후 처리 1. 차수구분을 신규차수로, 확정처리 했을 경우, 출고차수콤보의 마지막행 표시 하여 검색 처리 2. 출고차수를 기존차수로, 확정처리 했을 경우, 출고차수콤보를 기존출고차수행 표시하여 검색처리
 * 
 * @param ajaxData
 */
function onSaveNxtC(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  // 신규차수 선택했을 경우
  var outbound_exist_batch = $NC.getValue("#cboOutbound_BatchC");
  if (outbound_exist_batch == "000") {
    setOutboundBatchCombo("#cboQOutbound_BatchC", false, "last");
    $NC.setValue("#edtOutbound_Batch_NmC");
  } else {
    setOutboundBatchCombo("#cboQOutbound_BatchC", false, outbound_exist_batch);
  }
  setTimeout(function() {
    var lastRowData = G_GRDMASTERC.data.getItem(G_GRDMASTERC.lastRow);
    _Inquiry();
    G_GRDMASTERC.lastKeyVal = lastRowData.OUTBOUND_NO;
  }, 300);
  // 출고차수(입력용) 재설정
  setOutboundBatchCombo("#cboOutbound_BatchC", false);
}

/**
 * 취소 처리 후 처리 출고차수콤보를 첫행(신규) 표시하여 검색처리
 * 
 * @param ajaxData
 */
function onSavePreC(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }
  // 취소햇을 경우는 출고차수 콤보의 첫행(신규)선택하여 검색처리한다.
  setOutboundBatchCombo("#cboQOutbound_BatchC", false, "first");
  setTimeout(function() {
    var lastRowData = G_GRDMASTERC.data.getItem(G_GRDMASTERC.lastRow);
    _Inquiry();
    G_GRDMASTERC.lastKeyVal = lastRowData.OUTBOUND_NO;
  }, 300);
  // 출고차수(입력용) 재설정
  setOutboundBatchCombo("#cboOutbound_BatchC", false);
}

/**
 * 확정처리/ 취소처리시 오류 발생했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSaveErrorC(ajaxData) {

  $NC.onError(ajaxData);
  setMasterSummaryInfo();
}
