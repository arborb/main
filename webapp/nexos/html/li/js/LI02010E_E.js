function onProcessPreE() {

  var rowCount = G_GRDMASTERE.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("입고적치취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  var chkProcessState = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERE.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 적치확정 상태인 전표만 대상
      if (rowData.INBOUND_STATE === chkProcessState) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          // P_BRAND_CD: rowData.BRAND_CD,
          P_INBOUND_DATE: rowData.INBOUND_DATE,
          P_INBOUND_NO: rowData.INBOUND_NO
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("입고적치취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 입고적치취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LI02010E/callLIProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "E",
    P_DIRECTION: "BW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveE, onSaveErrorE, 2);
}

function onProcessNxtE() {

  var rowCount = G_GRDMASTERE.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("입고적치 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if ($NC.isGridModified(G_GRDSUBD)) {
    alert("데이터가 수정되었습니다. 저장 후 입고적치 처리하십시오.");
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  var chkProcessState = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERE.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 입고확정 상태인 전표만 대상
      if (rowData.INBOUND_STATE === chkProcessState) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          // P_BRAND_CD: rowData.BRAND_CD,
          P_INBOUND_DATE: rowData.INBOUND_DATE,
          P_INBOUND_NO: rowData.INBOUND_NO
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("입고적치 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 입고적치처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LI02010E/callLIProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "E",
    P_DIRECTION: "FW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveE, onSaveErrorE, 2);
}

function grdMasterEOnGetColumns() {

  var processFormatter = function(row, cell, value, columnDef, dataContext) {

    if (dataContext.INBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
      return "<span class='ui-icon-prior'>&nbsp;</span>";
    }
    return "<span class='ui-icon-next'>&nbsp;</span>";
  };

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "INBOUND_STATE_P",
    field: "INBOUND_STATE",
    name: "P",
    minWidth: 30,
    maxWidth: 30,
    sortable: false,
    formatter: processFormatter
  }, false);
  $NC.setGridColumn(columns, {
    id: "INBOUND_STATE_S",
    field: "INBOUND_STATE",
    name: "S",
    minWidth: 30,
    maxWidth: 30,
    formatter: grdStateFormatter
  }, false);
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 40,
    maxWidth: 40,
    cssClass: "align-center",
    sortable: false,
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "INBOUND_NO",
    field: "INBOUND_NO",
    name: "입고번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "입고구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_CD",
    field: "VENDOR_CD",
    name: "공급처",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "TOT_CONFIRM_QTY",
    field: "TOT_CONFIRM_QTY",
    name: "총수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INBOUND_STATE_D",
    field: "INBOUND_STATE_D",
    name: "진행상태",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CAR_NO",
    field: "CAR_NO",
    name: "차량번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 80,
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
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_TYPE_NM",
    field: "SHIP_TYPE_NM",
    name: "입고운송구분",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "REFUND_SHIP_PRICE_CD_D",
    field: "REFUND_SHIP_PRICE_CD_D",
    name: "운송비부담자",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_CD_NM",
    field: "CARRIER_CD_NM",
    name: "운송사구분",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "INBOUND_WB_NO",
    field: "INBOUND_WB_NO",
    name: "입고운송장",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_PRICE_TYPE_NM",
    field: "SHIP_PRICE_TYPE_NM",
    name: "운송비구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_PRICE",
    field: "SHIP_PRICE",
    name: "운송비금액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INORDER_TYPE_NM",
    field: "INORDER_TYPE_NM",
    name: "매입형태",
    minWidth: 80
  });
//  $NC.setGridColumn(columns, {
//    id: "LOCATION_ID_CNT",
//    field: "LOCATION_ID_CNT",
//    name: "로케이션ID수",
//    minWidth: 100,
//    cssClass: "align-right"
//  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_DATETIME",
    field: "PUTAWAY_DATETIME",
    name: "최종적치일시",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterEInitialize() {

  var options = {
    frozenColumn: 3,
    specialRow: {
      compareKey: "INBOUND_STATE",
      compareVal: "50",
      compareOperator: ">=",
      cssClass: "specialrow1"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterE", {
    columns: grdMasterEOnGetColumns(),
    queryId: "LI02010E.RS_T4_MASTER",
    sortCol: "INBOUND_NO",
    gridOptions: options
  });

  G_GRDMASTERE.view.onSelectedRowsChanged.subscribe(grdMasterEOnAfterScroll);
  G_GRDMASTERE.view.onHeaderClick.subscribe(grdMasterEOnHeaderClick);
  G_GRDMASTERE.view.onClick.subscribe(grdMasterEOnClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERE, "CHECK_YN");
}

function grdMasterEOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERE.lastRow != null) {
    if (row == G_GRDMASTERE.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDMASTERE.data.getItem(row);
  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAILE);
  // 파라메터 세팅
  G_GRDDETAILE.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_INBOUND_DATE: rowData.INBOUND_DATE,
    P_INBOUND_NO: rowData.INBOUND_NO
  });
  // 데이터 조회
  $NC.serviceCall("/LI02010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILE), onGetDetailE);


  // 입고지시 수정 가능 여부
  var canEdit = rowData.INBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
  G_GRDSUBE.view.setOptions({
    editable: canEdit,
    autoEdit: canEdit
  });

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterE", row + 1);
}

function grdMasterEOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTERE.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDMASTERE.view.getEditorLock().isActive() && !G_GRDMASTERE.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDMASTERE.data.getLength();
      var rowData;
      G_GRDMASTERE.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDMASTERE.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDMASTERE.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTERE.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdMasterEOnClick(e, args) {

  if (args.cell === G_GRDMASTERE.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTERE.view.getEditorLock().isActive() && !G_GRDMASTERE.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDMASTERE.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {

        if (rowData.CRUD === "R") {
          rowData.CRUD = "U";
        }

        G_GRDMASTERE.data.updateItem(rowData.id, rowData);
      }
      // e.stopPropagation();
      // e.stopImmediatePropagation();
    }
    return;
  }
}

function grdDetailEOnGetColumns() {

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
    id: "ITEM_DIV",
    field: "ITEM_DIV",
    name: "매입구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
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
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  }, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_QTY",
    field: "PUTAWAY_QTY",
    name: "적치수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_BOX",
    field: "PUTAWAY_BOX",
    name: "적치BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_EA",
    field: "PUTAWAY_EA",
    name: "적치EA",
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
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_WEIGHT",
    field: "PUTAWAY_WEIGHT",
    name: "적치중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_AMT",
    field: "BUY_AMT",
    name: "매입금액",
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
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 70,
    cssClass: "align-right"
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

function grdDetailEInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailE", {
    columns: grdDetailEOnGetColumns(),
    queryId: "LI02010E.RS_T4_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDDETAILE.view.onSelectedRowsChanged.subscribe(grdDetailEOnAfterScroll);
}

function grdDetailEOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAILE.lastRow != null) {
    if (row == G_GRDDETAILE.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    // 지시 수정 체크
    if (!grdSubEOnBeforePost(G_GRDSUBE.lastRow)) {
      $NC.setGridSelectRow(G_GRDDETAILE, G_GRDDETAILE.lastRow);
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDDETAILE.data.getItem(row);
  


  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUBE);
  // 파라메터 세팅
  G_GRDSUBE.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_INBOUND_DATE: rowData.INBOUND_DATE,
    P_INBOUND_NO: rowData.INBOUND_NO,
    P_LINE_NO: rowData.LINE_NO
  });

// 데이터 조회
  $NC.serviceCall("/LI02010E/getDataSet.do", $NC.getGridParams(G_GRDSUBE), onGetSubE);


  $NC.setInitGridVar(G_GRDSUBE);
  
  G_GRDSUBE.lastFilterVal = rowData.LINE_NO;
  G_GRDSUBE.data.refresh();
  $NC.setGridSelectRow(G_GRDSUBE, 0);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailE", row + 1);
}

function grdSubEOnGetColumns(policyLI420) {

  if ($NC.isNull(policyLI420)) {
    policyLI420 = "1";
  }

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "INBOUND_SEQ",
    field: "INBOUND_SEQ",
    name: "입고SEQ",
    minWidth: 120,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_LOCATION_CD",
    field: "PUTAWAY_LOCATION_CD",
    name: "로케이션",
    minWidth: 100,
    cssClass: "align-center",
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdSubEOnPopup
    }
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_QTY",
    field: "PUTAWAY_QTY",
    name: "적치수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_BOX",
    field: "PUTAWAY_BOX",
    name: "적치BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_EA",
    field: "PUTAWAY_EA",
    name: "적치EA",
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
  if (policyLI420 == "2") {
    $NC.setGridColumn(columns, {
      id: "VALID_DATE",
      field: "VALID_DATE",
      name: "유통기한",
      minWidth: 100,
      cssClass: "align-center"
    });
    $NC.setGridColumn(columns, {
      id: "BATCH_NO",
      field: "BATCH_NO",
      name: "제조배치번호",
      minWidth: 100
    });
  }
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_WEIGHT",
    field: "PUTAWAY_WEIGHT",
    name: "적치중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_YN",
    field: "PUTAWAY_YN",
    name: "적치여부",
    minWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_ID",
    field: "LOCATION_ID",
    name: "로케이션ID",
    minWidth: 120,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_USER_ID",
    field: "PUTAWAY_USER_ID",
    name: "적치자ID",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "PUTAWAY_DATETIME",
    field: "PUTAWAY_DATETIME",
    name: "적치일시",
    minWidth: 140,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubEInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSubE", {
    columns: grdSubEOnGetColumns(),
    queryId: "LI02010E.RS_T4_SUB1",
    sortCol: "INBOUND_SEQ",
    gridOptions: options
  });

  G_GRDSUBE.view.onSelectedRowsChanged.subscribe(grdSubEOnAfterScroll);
  G_GRDSUBE.view.onBeforeEditCell.subscribe(grdSubEOnBeforeEditCell);
  G_GRDSUBE.view.onCellChange.subscribe(grdSubEOnCellChange);
}

/**
 * grdSubC 데이터 필터링 이벤트
 */
function grdSubEOnFilter(item) {

  return G_GRDSUBE.lastFilterVal === item.LINE_NO;
}
/**
 * @param e
 * @param args
 *          row: activeRow, cell: activeCell, item: item
 */
function grdSubEOnCellChange(e, args) {

  var rowData = args.item;

  switch (G_GRDSUBE.view.getColumnField(args.cell)) {
  case "PUTAWAY_QTY":
    rowData.PUTAWAY_BOX = $NC.getB_Box(rowData.PUTAWAY_QTY, rowData.QTY_IN_BOX);
    rowData.PUTAWAY_EA = $NC.getB_Ea(rowData.PUTAWAY_QTY, rowData.QTY_IN_BOX);
    rowData.PUTAWAY_WEIGHT = $NC.getWeight(rowData.PUTAWAY_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);
    break;
  case "PUTAWAY_LOCATION_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.PUTAWAY_LOCATION_CD)) {
      P_QUERY_PARAMS = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_ZONE_CD: "",
        P_BANK_CD: "",
        P_BAY_CD: "",
        P_LEV_CD: "",
        P_LOCATION_CD: rowData.PUTAWAY_LOCATION_CD
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
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUBE.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUBE.lastRowModified = true;
}

function grdSubEOnBeforePost(row) {

  if (!G_GRDSUBE.lastRowModified) {
    return true;
  }
  var rowData = G_GRDSUBE.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.PUTAWAY_LOCATION_CD)) {
      alert("적치 로케이션을 지정하십시오.");
      $NC.setGridSelectRow(G_GRDSUBE, {
        selectRow: row,
        activeCell: G_GRDSUBE.view.getColumnIndex("PUTAWAY_LOCATION_CD"),
        editMode: true
      });
      return false;
    }
  }
  return true;
}

/**
 * @param e
 *          Event Handler
 * @param args
 *          row: activeRow, cell: activeCell, item: item, column: columnDef
 */
function grdSubEOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field === "PUTAWAY_LOCATION_CD") {
    return true;
  }
  return false;
}

/**
 * @param e
 * @param args
 *          grid: SlickGrid, rows: Array
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

function grdSubEOnPopup(e, args) {

  switch (args.column.field) {
  case "PUTAWAY_LOCATION_CD":
    $NP.showLocationPopup({
      P_CENTER_CD: G_GRDSUBE.data.getItem(G_GRDSUBE.lastRow).CENTER_CD,
      P_ZONE_CD: "",
      P_BANK_CD: "",
      P_BAY_CD: "",
      P_LEV_CD: "",
      P_LOCATION_CD: "%"
    }, onLocationPopup, function() {
      $NC.setFocusGrid(G_GRDSUBE, G_GRDSUBE.lastRow, G_GRDSUBE.view.getColumnIndex("PUTAWAY_LOCATION_CD"), true, true);
    });
    return;
  }
}

function onLocationPopup(resultInfo) {

  var rowData = G_GRDSUBE.data.getItem(G_GRDSUBE.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.ZONE_CD = resultInfo.ZONE_CD;
    rowData.ZONE_NM = resultInfo.ZONE_NM;
    rowData.BANK_CD = resultInfo.BANK_CD;
    rowData.BAY_CD = resultInfo.BAY_CD;
    rowData.LEV_CD = resultInfo.LEV_CD;
    rowData.PUTAWAY_LOCATION_CD = resultInfo.LOCATION_CD;
    ;

  } else {
    rowData.ZONE_CD = "";
    rowData.ZONE_NM = "";
    rowData.BANK_CD = "";
    rowData.BAY_CD = "";
    rowData.LEV_CD = "";
    rowData.PUTAWAY_LOCATION_CD = "";
    focusCol = G_GRDSUBE.view.getColumnIndex("ITEM_CD");
  }
  focusCol = G_GRDSUBE.view.getColumnIndex("PUTAWAY_LOCATION_CD");
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUBE.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDSUBE.lastRowModified = true;
  $NC.setFocusGrid(G_GRDSUBE, G_GRDSUBE.lastRow, focusCol, true, true);
}

function onGetMasterE(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERE, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERE, "CHECK_YN");
  if (G_GRDMASTERE.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTERE.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTERE, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERE, {
        selectKey: "INBOUND_NO",
        selectVal: G_GRDMASTERE.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMasterE", 0, 0);

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDDETAILE);
    $NC.setInitGridData(G_GRDDETAILE);
    $NC.setGridDisplayRows("#grdDetailE", 0, 0);

    // 입고지시 초기화
    $NC.setInitGridVar(G_GRDSUBE);
    $NC.setInitGridData(G_GRDSUBE);
    $NC.setGridDisplayRows("#grdSubE", 0, 0);
  }

  // 전표 건수 정보 업데이트
  setMasterSummaryInfo();

  // 공통 버튼 활성화
  setTopButtons();
}

function onGetDetailE(ajaxData) {

  $NC.setInitGridData(G_GRDDETAILE, ajaxData);

  if (G_GRDDETAILE.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAILE, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetailE", 0, 0);
  }
}



function onGetSubE(ajaxData) {
  $NC.setInitGridData(G_GRDSUBE, ajaxData);

  if (G_GRDSUBE.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDSUBE, 0);
  } else {
    $NC.setGridDisplayRows("#grdSubE", 0, 0);
  }

}

function onSaveE(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERE, {
    selectKey: "INBOUND_NO"
  });
  _Inquiry();
  G_GRDMASTERE.lastKeyVal = lastKeyVal;
}

function onSaveErrorE(ajaxData) {

  $NC.onError(ajaxData);
  setMasterSummaryInfo();
}

/**
 * 상단그리드 더블 클릭 : 팝업 표시
 */
function onSubGetButtonE() {

  var lastRowDataM = G_GRDMASTERE.data.getItem(G_GRDMASTERE.lastRow);
  if (G_GRDSUBE.data.getLength() == 0) {
    return;
  }
  
  if (lastRowDataM.INBOUND_STATE =='50'){
    alert("적치완료 된 전표입니다.");
    return;
  }
  
  var lastRowData = G_GRDDETAILE.data.getItem(G_GRDDETAILE.lastRow);
  

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  
  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LI03011P",
    PROGRAM_NM: "입고적치수정",
    url: "li/LI03011P.html",
    width: 1024,
    height: 600,
    userData: {     
      P_PROCESS_CD: "R",
      P_CENTER_CD : lastRowData.CENTER_CD,
      P_BU_CD : BU_CD,
      P_BU_NM : BU_NM,
      P_INBOUND_DATE : lastRowData.INBOUND_DATE,
      P_INBOUND_NO : lastRowData.INBOUND_NO,
      P_ITEM_CD : lastRowData.ITEM_CD,
      P_ITEM_NM : lastRowData.ITEM_NM,
      P_ITEM_LOT : lastRowData.ITEM_LOT,
      P_LINE_NO : lastRowData.LINE_NO,
      P_ITEM_STATE : lastRowData.ITEM_STATE,
      P_ITEM_STATE_F : lastRowData.ITEM_STATE_F,
      P_INBOUND_STATE : lastRowDataM.INBOUND_STATE,
      P_TOTAL_PUTAWAY_QTY : lastRowData.PUTAWAY_QTY,
      P_RDSUBE_DS: G_GRDSUBE.data.getItems()
    },
    onOk: function() {
      _Inquiry();
    }
  });
}