function onProcessPreC() {

  var rowCount = G_GRDMASTERC.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("입고지시 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  var chkProcessState = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERC.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 입고지시 상태인 전표만 대상
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
    alert("입고지시 취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 입고지시 취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LI02010E/callLIProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "C",
    P_DIRECTION: "BW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveC, onSaveErrorC, 2);
}

function onProcessNxtC() {

  var rowCount = G_GRDMASTERC.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("입고지시 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if ($NC.isGridModified(G_GRDSUBC)) {
    alert("데이터가 수정되었습니다. 저장 후 입고지시 처리하십시오.");
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  var chkProcessState = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERC.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 입고등록 상태인 전표만 대상
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
    alert("입고지시 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 입고지시 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LI02010E/callLIProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "C",
    P_DIRECTION: "FW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveC, onSaveErrorC, 2);
}

function onNewLocationIdC() {

  var rowCount = G_GRDMASTERC.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("새 로케이션ID를 생성하시겠습니까?");
  if (!result) {
    return;
  }

  var masterRowData = G_GRDMASTERC.data.getItem(G_GRDMASTERC.lastRow);
  var detailRowData = G_GRDDETAILC.data.getItem(0);

  $NC.serviceCall("/LI02010E/callSP.do", {
    P_QUERY_ID: "WT.CM_LOCATIONID_GETNO",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: masterRowData.CENTER_CD,
      P_BU_CD: masterRowData.BU_CD,
      P_INBOUND_DATE: masterRowData.INBOUND_DATE,
      P_INBOUND_NO: masterRowData.INBOUND_NO,
      P_INOUT_CD: masterRowData.INOUT_CD,
      P_CUST_CD: masterRowData.CUST_CD,
      P_VENDOR_CD: masterRowData.VENDOR_CD,
      P_BRAND_CD: detailRowData.BRAND_CD,
      P_ITEM_CD: detailRowData.ITEM_CD,
      P_CREATE_DATE: "",
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onGetNewLocationIdC);
}

function onGetNewLocationIdC(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {

      var rowData = G_GRDMASTERC.data.getItem(G_GRDMASTERC.lastRow);

      // 로케이션ID 조회
      $NC.serviceCall("/LI02010E/getDataSet.do", {
        P_QUERY_ID: "LI02010E.RS_T2_SUB1",
        P_QUERY_PARAMS: $NC.getParams({
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_INBOUND_DATE: rowData.INBOUND_DATE,
          P_INBOUND_NO: rowData.INBOUND_NO,
          P_INOUT_CD: rowData.INOUT_CD
        })
      }, function(ajaxData) {
        G_GRDLOCATIONIDC.lastKeyVal = resultData.O_LOCATION_ID;
        onGetLocationIdC(ajaxData);
        G_GRDLOCATIONIDC.lastKeyVal = "";
      });
    } else {
      alert(resultData.O_MSG);
    }
  }
}

function onNewDirectionsC() {

  var rowCount = G_GRDMASTERC.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  rowCount = G_GRDLOCATIONIDC.data.getLength();
  if (rowCount === 0) {
    alert("신규 로케이션ID를 먼저 생성 후 처리하십시오.");
    return;
  }

  // 현재 수정모드면
  if (G_GRDSUBC.view.getEditorLock().isActive()) {
    G_GRDSUBC.view.getEditorLock().commitCurrentEdit();
  }
  if (!grdSubCOnBeforePost(G_GRDSUBC.lastRow)) {
    return;
  }
  var locationIdRowData = G_GRDLOCATIONIDC.data.getItem(G_GRDLOCATIONIDC.lastRow);
  var detailRowData = G_GRDDETAILC.data.getItem(G_GRDDETAILC.lastRow);

  if (detailRowData.ENTRY_QTY === detailRowData.DIRECTIONS_QTY) {
    alert("추가하려는 상품은 이미 등록수량만큼 지시 처리되었습니다.");
    return;
  }

  var rowData;
  rowCount = G_GRDSUBC.data.getLength();
  if (rowCount > 0) {
    // 같은 상품이 존재하는지 체크
    for ( var row = 0; row < rowCount; row++) {
      rowData = G_GRDSUBC.data.getItem(row);
      if (rowData.LINE_NO === detailRowData.LINE_NO) {
        alert("추가하려는 상품은 해당 로케이션ID에 이미 추가되어 있습니다.");
        $NC.setGridSelectRow(G_GRDSUBC, {
          selectRow: row,
          activeCell: G_GRDSUBC.view.getColumnIndex("ENTRY_QTY"),
          editMode: true
        });
        return;
      }
    }

    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDSUBC.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      $NC.setGridSelectRow(G_GRDSUBC, {
        selectRow: rowCount - 1,
        activeCell: G_GRDSUBC.view.getColumnIndex("ENTRY_QTY"),
        editMode: true
      });
      return;
    }
  }

  var REMAIN_QTY = Number(detailRowData.ENTRY_QTY) - Number(detailRowData.DIRECTIONS_QTY);
  var masterRowData = G_GRDMASTERC.data.getItem(G_GRDMASTERC.lastRow);

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CENTER_CD: masterRowData.CENTER_CD,
    BU_CD: masterRowData.BU_CD,
    INBOUND_DATE: masterRowData.INBOUND_DATE,
    INBOUND_NO: masterRowData.INBOUND_NO,
    LINE_NO: detailRowData.LINE_NO,
    INBOUND_SEQ: "",
    LOCATION_CD: "",
    PUTAWAY_LOCATION_CD: "",
    IN_GRP: masterRowData.INOUT_SUB_CD,
    INOUT_CD: masterRowData.INOUT_CD,
    CUST_CD: masterRowData.CUST_CD,
    VENDOR_CD: masterRowData.VENDOR_CD,
    // BU_CD: detailRowData.BU_CD,
    BRAND_CD: detailRowData.BRAND_CD,
    ITEM_CD: detailRowData.ITEM_CD,
    ITEM_STATE: detailRowData.ITEM_STATE,
    ITEM_LOT: detailRowData.ITEM_LOT,
    VALID_DATE: detailRowData.VALID_DATE,
    BATCH_NO: detailRowData.BATCH_NO,
    LOCATION_ID: locationIdRowData.LOCATION_ID,
    STOCK_ID: "",
    ENTRY_QTY: REMAIN_QTY,
    CONFIRM_QTY: REMAIN_QTY,
    PUTAWAY_QTY: REMAIN_QTY,
    DIRECTIONS_USER_ID: "",
    DIRECTIONS_DATETIME: "",

    ITEM_NM: detailRowData.ITEM_NM,
    ITEM_SPEC: detailRowData.ITEM_SPEC,
    QTY_IN_BOX: detailRowData.QTY_IN_BOX,
    BOX_WEIGHT: detailRowData.BOX_WEIGHT,
    ENTRY_BOX: $NC.getB_Box(REMAIN_QTY, detailRowData.QTY_IN_BOX),
    ENTRY_EA: $NC.getB_Ea(REMAIN_QTY, detailRowData.QTY_IN_BOX),
    ENTRY_WEIGHT: $NC.getWeight(REMAIN_QTY, detailRowData.QTY_IN_BOX, detailRowData.BOX_WEIGHT),
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };
  G_GRDSUBC.data.addItem(newRowData);

  $NC.setGridSelectRow(G_GRDSUBC, rowCount);
  if (rowCount === 0) {
    $NC.setGridDisplayRows("#grdSubC", rowCount + 1, G_GRDSUBC.data.getLength());
  }
  // 수정 상태로 변경
  G_GRDSUBC.lastRowModified = true;

  // 신규 데이터 생성 후 이벤트 호출
  grdSubCOnNewRecord({
    row: rowCount,
    rowData: newRowData
  });
}

function onDeleteDirectionsC() {

  var rowCount = G_GRDSUBC.data.getLength();
  if (rowCount === 0) {
    alert("삭제하려는 데이터를 선택하십시오.");
    return;
  }

  // 마지막 데이터가 신규 데이터일 경우 data에서 삭제하고 등록된 데이터면 CRUD만 "D"로 변경
  var rowData = G_GRDSUBC.data.getItem(G_GRDSUBC.lastRow);
  if (rowData.CRUD == "N" || rowData.CRUD == "C") {
    G_GRDSUBC.data.deleteItem(rowData.id);
  } else {
    rowData.CRUD = "D";
    G_GRDSUBC.data.updateItem(rowData.id, rowData);
    G_GRDSUBC.data.refresh();
  }
  // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
  var lastRow = G_GRDSUBC.lastRow;
  G_GRDSUBC.lastRow = null;
  // 마지막 선택 Row 수정 상태 복원
  G_GRDSUBC.lastRowModified = false;
  if (lastRow > 1) {
    $NC.setGridSelectRow(G_GRDSUBC, lastRow - 1);
  } else {
    $NC.setGridSelectRow(G_GRDSUBC, 0);
  }

  // 디테일 지시수량 업데이트
  var S0_ENTRY_QTY = 0;
  // 입고지시 전체 데이터를 기준으로 지시수량 SUM
  var rows = G_GRDSUBC.data.getItems();
  for ( var i in rows) {
    if (rows[i].CRUD !== "D" && rows[i].LINE_NO === rowData.LINE_NO) {
      S0_ENTRY_QTY += Number(rows[i].ENTRY_QTY);
    }
  }

  // 디테일에 해당 LINE_NO를 검색하여 등록 수량 가져오기
  rowCount = G_GRDDETAILC.data.getLength();
  var detailRowData;
  for ( var i = 0; i < rowCount; i++) {
    detailRowData = G_GRDDETAILC.data.getItem(i);
    if (rowData.LINE_NO === detailRowData.LINE_NO) {
      break;
    }
  }
  detailRowData.DIRECTIONS_QTY = S0_ENTRY_QTY;
  G_GRDDETAILC.data.updateItem(detailRowData.id, detailRowData);
}

function grdMasterCOnGetColumns() {

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
    id: "TOT_ENTRY_QTY",
    field: "TOT_ENTRY_QTY",
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
  /*
  $NC.setGridColumn(columns, {
    id: "LOCATION_ID_CNT",
    field: "LOCATION_ID_CNT",
    name: "로케이션ID수",
    minWidth: 100,
    cssClass: "align-right"
  });
  */
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdMasterCInitialize() {

  var options = {
    frozenColumn: 3,
    specialRow: {
      compareKey: "INBOUND_STATE",
      compareVal: "30",
      compareOperator: ">=",
      cssClass: "specialrow1"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterC", {
    columns: grdMasterCOnGetColumns(),
    queryId: "LI02010E.RS_T2_MASTER",
    sortCol: "INBOUND_NO",
    gridOptions: options
  });

  G_GRDMASTERC.view.onSelectedRowsChanged.subscribe(grdMasterCOnAfterScroll);
  G_GRDMASTERC.view.onHeaderClick.subscribe(grdMasterCOnHeaderClick);
  G_GRDMASTERC.view.onClick.subscribe(grdMasterCOnClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERC, "CHECK_YN");
}

function grdMasterCOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERC.lastRow != null) {
    if (row == G_GRDMASTERC.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDMASTERC.data.getItem(row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAILC);
  // 파라메터 세팅
  G_GRDDETAILC.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_INBOUND_DATE: rowData.INBOUND_DATE,
    P_INBOUND_NO: rowData.INBOUND_NO
  });
  // 데이터 조회
  $NC.serviceCall("/LI02010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILC), onGetDetailC);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDLOCATIONIDC);
  // 파라메터 세팅
  G_GRDLOCATIONIDC.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_INBOUND_DATE: rowData.INBOUND_DATE,
    P_INBOUND_NO: rowData.INBOUND_NO,
    P_INOUT_CD: rowData.INOUT_CD
  });
  // 데이터 조회
  $NC.serviceCall("/LI02010E/getDataSet.do", $NC.getGridParams(G_GRDLOCATIONIDC), onGetLocationIdC);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUBC);
  // 파라메터 세팅
  G_GRDSUBC.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_INBOUND_DATE: rowData.INBOUND_DATE,
    P_INBOUND_NO: rowData.INBOUND_NO
  });
  // 데이터 조회
  $NC.serviceCall("/LI02010E/getDataSet.do", $NC.getGridParams(G_GRDSUBC), onGetSubC);

  // 입고지시 수정 가능 여부 -> 진행상태: 20
  var canEdit = rowData.INBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
  G_GRDSUBC.view.setOptions({
    editable: canEdit,
    autoEdit: canEdit
  });

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
      for ( var row = 0; row < rowCount; row++) {
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

function grdDetailCOnGetColumns(policyLI420) {

  if ($NC.isNull(policyLI420)) {
    policyLI420 = "1";
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
    id: "ITEM_DIV",
    field: "ITEM_DIV",
    name: "매입구분",
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
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_BOX",
    field: "ENTRY_BOX",
    name: "등록BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_EA",
    field: "ENTRY_EA",
    name: "등록EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DIRECTIONS_QTY",
    field: "DIRECTIONS_QTY",
    name: "지시수량",
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
    id: "ENTRY_WEIGHT",
    field: "ENTRY_WEIGHT",
    name: "등록중량",
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

function grdDetailCInitialize() {

  var options = {
    frozenColumn: 3,
    specialRow: {
      compareKey: "ENTRY_QTY",
      compareCol: "DIRECTIONS_QTY",
      compareOperator: ">",
      cssClass: "specialrow2"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailC", {
    columns: grdDetailCOnGetColumns(),
    queryId: "LI02010E.RS_T2_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDDETAILC.view.onSelectedRowsChanged.subscribe(grdDetailCOnAfterScroll);
  G_GRDDETAILC.view.onDblClick.subscribe(grdDetailCOnDblClick);
}

function grdDetailCOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAILC.lastRow != null) {
    if (row == G_GRDDETAILC.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    // 지시 수정 체크
    if (!grdSubCOnBeforePost(G_GRDSUBC.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  if ($NC.G_VAR.policyVal.LI230 == "1") {
    var rowData = G_GRDDETAILC.data.getItem(row);

    $NC.setInitGridVar(G_GRDSUBC);
    G_GRDSUBC.lastFilterVal = rowData.LINE_NO;
    G_GRDSUBC.data.refresh();
    $NC.setGridSelectRow(G_GRDSUBC, 0);
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailC", row + 1);
}

function grdDetailCOnDblClick(e, args) {
  if ($NC.G_VAR.policyVal.LI230 == "1") {
    return;
  }
  var rowData = G_GRDDETAILC.data.getItem(args.row);
  if (rowData) {
    onNewDirectionsC();
  }
}

function grdSubCOnGetColumns() {

  var columns = [ ];
  /*
  $NC.setGridColumn(columns, {
    id: "LOCATION_ID",
    field: "LOCATION_ID",
    name: "로케이션ID",
    minWidth: 120,
    cssClass: "align-center"
  });
  */
  $NC.setGridColumn(columns, {
    id: "INBOUND_SEQ",
    field: "INBOUND_SEQ",
    name: "입고SEQ",
    minWidth: 120,
    cssClass: "align-center"
  });
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
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 70
  }, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "지시수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_BOX",
    field: "ENTRY_BOX",
    name: "지시BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_EA",
    field: "ENTRY_EA",
    name: "지시EA",
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
    id: "ENTRY_WEIGHT",
    field: "ENTRY_WEIGHT",
    name: "등록중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DIRECTIONS_USER_ID",
    field: "DIRECTIONS_USER_ID",
    name: "지시자ID",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DIRECTIONS_DATETIME",
    field: "DIRECTIONS_DATETIME",
    name: "지시일시",
    minWidth: 140,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}
function grdSubCInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSubC", {
    columns: grdSubCOnGetColumns(),
    queryId: "LI02010E.RS_T2_SUB2",
    sortCol: "INBOUND_SEQ",
    gridOptions: options
  });
  G_GRDSUBC.view.onSelectedRowsChanged.subscribe(grdSubCOnAfterScroll);
  G_GRDSUBC.view.onBeforeEditCell.subscribe(grdSubCOnBeforeEditCell);
  G_GRDSUBC.view.onCellChange.subscribe(grdSubCOnCellChange);
}

/**
 * grdSubC 데이터 필터링 이벤트
 */
function grdSubCOnFilter(item) {

  if ($NC.G_VAR.policyVal.LI230 == "1") {
    return item.CRUD != "D" && G_GRDSUBC.lastFilterVal == item.LINE_NO;
  } else {
    return item.CRUD != "D" && G_GRDSUBC.lastFilterVal == item.LOCATION_ID;
  }
}

/**
 * @param args
 *          row: activeRow, rowData: item
 */
function grdSubCOnNewRecord(args) {

  $NC.setGridSelectRow(G_GRDSUBC, {
    selectRow: args.row,
    activeCell: G_GRDSUBC.view.getColumnIndex("ENTRY_QTY"),
    editMode: true
  });
}

/**
 * @param e
 * @param args
 *          row: activeRow, cell: activeCell, item: item
 */
function grdSubCOnCellChange(e, args) {

  var rowData = args.item;

  switch (G_GRDSUBC.view.getColumnField(args.cell)) {
  case "ENTRY_QTY":
    rowData.ENTRY_BOX = $NC.getB_Box(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
    rowData.ENTRY_EA = $NC.getB_Ea(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
    rowData.ENTRY_WEIGHT = $NC.getWeight(rowData.ENTRY_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUBC.data.updateItem(rowData.id, rowData);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUBC.lastRowModified = true;
}

function grdSubCOnBeforePost(row) {

  if (!G_GRDSUBC.lastRowModified) {
    return true;
  }
  var rowData = G_GRDSUBC.data.getItem(row);
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
  */

  if (rowData.CRUD != "R") {

    var ENTRY_QTY = Number(rowData.ENTRY_QTY);
    if (ENTRY_QTY < 0) {
      alert("지시수량이 0보다 작을 수 없습니다.");

      rowData.ENTRY_QTY = 0;
      rowData.ENTRY_BOX = 0;
      rowData.ENTRY_EA = 0;
      rowData.ENTRY_WEIGHT = 0;

      $NC.setGridSelectRow(G_GRDSUBC, {
        selectRow: row,
        activeCell: G_GRDSUBC.view.getColumnIndex("ENTRY_QTY"),
        editMode: true
      });
      return false;
    }

    // 디테일에 해당 LINE_NO를 검색하여 등록 수량 가져오기
    var dIndex = $NC.getGridSearchVal(G_GRDDETAILC, {
      searchKey: "LINE_NO",
      searchVal: rowData.LINE_NO
    });
    if (dIndex == -1) {
      alert("상세정보에서 해당 상품을 검색하지 못해 지시수량을 반영하지 못했습니다.");

      rowData.ENTRY_QTY = 0;
      rowData.ENTRY_BOX = 0;
      rowData.ENTRY_EA = 0;
      rowData.ENTRY_WEIGHT = 0;

      G_GRDSUBC.data.updateItem(rowData.id, rowData);

      $NC.setGridSelectRow(G_GRDSUBC, {
        selectRow: row,
        activeCell: G_GRDSUBC.view.getColumnIndex("ENTRY_QTY"),
        editMode: true
      });
      return false;
    }

    var detailRowData = G_GRDDETAILC.data.getItem(dIndex);
    var D_ENTRY_QTY = Number(detailRowData.ENTRY_QTY);
    // 입고지시 전체 데이터를 기준으로 지시수량 SUM
    var S0_ENTRY_QTY = $NC.getGridSumVal(G_GRDSUBC, {
      searchKey: ["LINE_NO", "CRUD"],
      searchVal: [rowData.LINE_NO, ["C", "U", "R", "N"]],
      sumKey: "ENTRY_QTY",
      isAllData: true
    });

    if (D_ENTRY_QTY < S0_ENTRY_QTY) {
      alert("지시수량이 등록수량보다 클 수 없습니다.");

      rowData.ENTRY_QTY = D_ENTRY_QTY - (S0_ENTRY_QTY - ENTRY_QTY);

      if (rowData.ENTRY_QTY < 0) {
        rowData.ENTRY_QTY = 0;
        rowData.ENTRY_BOX = 0;
        rowData.ENTRY_EA = 0;
        rowData.ENTRY_WEIGHT = 0;
      } else {
        rowData.ENTRY_BOX = $NC.getB_Box(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
        rowData.ENTRY_EA = $NC.getB_Ea(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
        rowData.ENTRY_WEIGHT = $NC.getWeight(rowData.ENTRY_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);
      }
      G_GRDSUBC.data.updateItem(rowData.id, rowData);

      // 디테일 지시수량을 지시수량과 동일하게
      detailRowData.DIRECTIONS_QTY = detailRowData.ENTRY_QTY;
      G_GRDDETAILC.data.updateItem(detailRowData.id, detailRowData);

      $NC.setGridSelectRow(G_GRDSUBC, {
        selectRow: row,
        activeCell: G_GRDSUBC.view.getColumnIndex("ENTRY_QTY"),
        editMode: true
      });
      return false;
    }

    // 디테일 지시수량 업데이트
    detailRowData.DIRECTIONS_QTY = S0_ENTRY_QTY;
    if (Number(detailRowData.ENTRY_QTY) < detailRowData.DIRECTIONS_QTY) {
      detailRowData.DIRECTIONS_QTY = detailRowData.ENTRY_QTY;
    }
    G_GRDDETAILC.data.updateItem(detailRowData.id, detailRowData);
  }

  // 입고지시 CRUD 업데이트
  if (rowData.CRUD === "N") {
    rowData.CRUD = "C";
    G_GRDSUBC.data.updateItem(rowData.id, rowData);
  }
  return true;
}

/**
 * @param e
 *          Event Handler
 * @param args
 *          row: activeRow, cell: activeCell, item: item, column: columnDef
 */
function grdSubCOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field === "ENTRY_QTY") {
    return $NC.G_VAR.policyVal.LI230 != "1";
    ;
  }
  return false;
}

function grdSubCOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUBC.lastRow != null) {
    if (row == G_GRDSUBC.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdSubCOnBeforePost(G_GRDSUBC.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSubC", row + 1);
}

function grdLocationIdCOnGetColumns(policyLO510) {

  var columns = [ ];
  /*
  $NC.setGridColumn(columns, {
    id: "LOCATION_ID",
    field: "LOCATION_ID",
    name: "로케이션ID",
    minWidth: 120,
    cssClass: "align-center"
  });
*/
  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdLocationIdCInitialize() {

  var options = {};

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdLocationIdC", {
    columns: grdLocationIdCOnGetColumns(),
    queryId: "LI02010E.RS_T2_SUB1",
    sortCol: "LOCATION_ID",
    gridOptions: options
  });
  G_GRDLOCATIONIDC.view.onSelectedRowsChanged.subscribe(grdLocationIdCOnAfterScroll);
}

function grdLocationIdCOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDLOCATIONIDC.lastRow != null) {
    if (row == G_GRDLOCATIONIDC.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    // 지시 수정 체크
    if (!grdSubCOnBeforePost(G_GRDSUBC.lastRow)) {
      $NC.setGridSelectRow(G_GRDLOCATIONIDC, G_GRDLOCATIONIDC.lastRow);
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDLOCATIONIDC.data.getItem(row);

  $NC.setInitGridVar(G_GRDSUBC);
  G_GRDSUBC.lastFilterVal = rowData.LOCATION_ID;
  G_GRDSUBC.data.refresh();
  $NC.setGridSelectRow(G_GRDSUBC, 0);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdLocationIdC", row + 1);
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
        selectKey: "INBOUND_NO",
        selectVal: G_GRDMASTERC.lastKeyVal
      });
    }
  } else {
    // 디테일 초기화
    $NC.clearGridData(G_GRDDETAILC);

    // 로케이션ID 초기화
    $NC.clearGridData(G_GRDLOCATIONIDC);

    // 입고지시 초기화
    $NC.clearGridData(G_GRDSUBC);
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

function onGetSubC(ajaxData) {

  G_GRDSUBC.lastFilterVal = null;
  if ($NC.G_VAR.policyVal.LI230 == "1") {
    var rowData = G_GRDDETAILC.data.getItem(G_GRDDETAILC.lastRow);
    if (rowData) {
      G_GRDSUBC.lastFilterVal = rowData.LINE_NO;
    }
  } else {
    var rowData = G_GRDLOCATIONIDC.data.getItem(G_GRDLOCATIONIDC.lastRow);
    if (rowData) {
      G_GRDSUBC.lastFilterVal = rowData.LOCATION_ID;
    }
  }
  $NC.setInitGridData(G_GRDSUBC, ajaxData, grdSubCOnFilter);

  if (G_GRDSUBC.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDSUBC, 0);
  } else {
    $NC.setGridDisplayRows("#grdSubC", 0, 0);
  }
}

function onGetLocationIdC(ajaxData) {

  $NC.setInitGridData(G_GRDLOCATIONIDC, ajaxData);

  if (G_GRDLOCATIONIDC.data.getLength() > 0) {
    if ($NC.isNull(G_GRDLOCATIONIDC.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDLOCATIONIDC, 0);
    } else {
      $NC.setGridSelectRow(G_GRDLOCATIONIDC, {
        selectKey: "LOCATION_ID",
        selectVal: G_GRDLOCATIONIDC.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdLocationIdC", 0, 0);
  }
}

function onSaveC(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERC, {
    selectKey: "INBOUND_NO"
  });
  _Inquiry();
  G_GRDMASTERC.lastKeyVal = lastKeyVal;
}

function onSaveErrorC(ajaxData) {

  $NC.onError(ajaxData);
  setMasterSummaryInfo();
}