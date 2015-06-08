function onProcessPreD() {

  var rowCount = G_GRDMASTERD.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("반입확정취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  var chkProcessState = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERD.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 반입확정 상태인 전표만 대상
      if (rowData.INBOUND_STATE === chkProcessState) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_INBOUND_DATE: rowData.INBOUND_DATE,
          P_INBOUND_NO: rowData.INBOUND_NO
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("반입확정취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 반입확정취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/RIM2010E/callRIProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "D",
    P_DIRECTION: "BW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveD, onSaveErrorD, 2);
}

function onProcessNxtD() {

  var rowCount = G_GRDMASTERD.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("반입확정 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if ($NC.isGridModified(G_GRDSUBD)) {
    alert("데이터가 수정되었습니다. 저장 후 반입확정 처리하십시오.");
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  var chkProcessState = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERD.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 반입지시 상태인 전표만 대상
      if (rowData.INBOUND_STATE === chkProcessState) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_INBOUND_DATE: rowData.INBOUND_DATE,
          P_INBOUND_NO: rowData.INBOUND_NO
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("반입확정 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 반입확정처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/RIM2010E/callRIProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "D",
    P_DIRECTION: "FW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveD, onSaveErrorD, 2);
}

function grdMasterDOnGetColumns() {

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
    resizable: false,
    formatter: processFormatter
  }, false);
  $NC.setGridColumn(columns, {
    id: "INBOUND_STATE_S",
    field: "INBOUND_STATE",
    name: "S",
    minWidth: 30,
    maxWidth: 30,
    sortable: false,
    resizable: false,
    formatter: grdStateFormatter
  }, false);
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 40,
    maxWidth: 40,
    cssClass: "align-center",
    sortable: false,
    resizable: false,
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
    name: "반입번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "반입구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 90
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
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_NO",
    field: "ORDER_NO",
    name: "예번번호",
    minWidth: 80
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
    id: "BU_KEY",
    field: "BU_KEY",
    name: "전표ID",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CAR_CD",
    field: "CAR_CD",
    name: "반품번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD_D",
    field: "BRAND_CD_D",
    name: "판매사코드",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM_D",
    field: "BRAND_NM_D",
    name: "판매사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_CD_D",
    field: "CARRIER_CD_D",
    name: "택배사구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REFUND_WB_NO",
    field: "REFUND_WB_NO",
    name: "반품송장번호",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "EXCHANGE_TYPE",
    field: "EXCHANGE_TYPE",
    name: "교환구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REFUND_PRICE_TYPE",
    field: "REFUND_PRICE_TYPE",
    name: "반품비구분",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_PRICE_CD_D",
    field: "SHIP_PRICE_CD_D",
    name: "반품비부담자",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_PRICE",
    field: "SHIP_PRICE",
    name: "반품비",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "MALL_MSG",
    field: "MALL_MSG",
    name: "온라인몰메시지",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_TEL",
    field: "ORDERER_TEL",
    name: "주문자전화번호",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_HP",
    field: "ORDERER_HP",
    name: "주문자휴대폰번호",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_ADDR",
    field: "ORDERER_ADDR",
    name: "주문자주소",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_TEL",
    field: "SHIPPER_TEL",
    name: "전화번호",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_HP",
    field: "SHIPPER_HP",
    name: "휴대폰번호",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR",
    field: "SHIPPER_ADDR",
    name: "주소",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_MSG",
    field: "ORDERER_MSG",
    name: "배송메시지",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_ID_CNT",
    field: "LOCATION_ID_CNT",
    name: "로케이션ID수",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdMasterDInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3,
    specialRow: {
      compareKey: "INBOUND_STATE",
      compareVal: "40",
      compareOperator: ">=",
      cssClass: "specialrow1"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterD", {
    columns: grdMasterDOnGetColumns(),
    queryId: "RIM2010E.RS_T3_MASTER",
    sortCol: "INBOUND_NO",
    gridOptions: options
  });

  G_GRDMASTERD.view.onSelectedRowsChanged.subscribe(grdMasterDOnAfterScroll);
  G_GRDMASTERD.view.onHeaderClick.subscribe(grdMasterDOnHeaderClick);
  G_GRDMASTERD.view.onClick.subscribe(grdMasterDOnClick);

  G_GRDMASTERD.view.onBeforeEditCell.subscribe(grdMasterDOnBeforeEditCell);
  G_GRDMASTERD.view.onCellChange.subscribe(grdMasterDOnCellChange);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERD, "CHECK_YN");
}

function grdMasterDOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERD.lastRow != null) {
    if (row == G_GRDMASTERD.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 디테일 초기화
  $NC.setInitGridVar(G_GRDDETAILD);
  onGetDetailD({
    data: null
  });

  // 조회시 반입지시 초기화
  $NC.setInitGridVar(G_GRDSUBD);
  onGetSubD({
    data: null
  });

  var rowData = G_GRDMASTERD.data.getItem(row);

  // 파라메터 세팅
  G_GRDDETAILD.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_INBOUND_DATE: rowData.INBOUND_DATE,
    P_INBOUND_NO: rowData.INBOUND_NO
  });
  // 데이터 조회
  $NC.serviceCall("/RIM2010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILD), onGetDetailD);

  // 파라메터 세팅
  G_GRDSUBD.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_INBOUND_DATE: rowData.INBOUND_DATE,
    P_INBOUND_NO: rowData.INBOUND_NO
  });
  // 데이터 조회
  $NC.serviceCall("/RIM2010E/getDataSet.do", $NC.getGridParams(G_GRDSUBD), onGetSubD);

  // 반입지시 수정 가능 여부 -> 진행상태: 30, 정책(RI410: 확정수량 수정 가능여부): Y
  var canEdit = rowData.INBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM
      && $NC.G_VAR.policyVal.RI410 === "Y";
  G_GRDSUBD.view.setOptions({
    editable: canEdit,
    autoEdit: canEdit
  });

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterD", row + 1);
}

function grdMasterDOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTERD.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDMASTERD.view.getEditorLock().isActive() && !G_GRDMASTERD.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDMASTERD.data.getLength();
      var rowData;
      G_GRDMASTERD.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDMASTERD.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDMASTERD.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTERD.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdMasterDOnClick(e, args) {

  if (args.cell === G_GRDMASTERD.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTERD.view.getEditorLock().isActive() && !G_GRDMASTERD.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDMASTERD.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {

        if (rowData.CRUD === "R") {
          rowData.CRUD = "U";
        }

        G_GRDMASTERD.data.updateItem(rowData.id, rowData);
      }
      // e.stopPropagation();
      // e.stopImmediatePropagation();
    }
    return;
  }
}

/**
 * @param e
 *          Event Handler
 * @param args
 *          row: activeRow, cell: activeCell, item: item, column: columnDef
 */
function grdMasterDOnBeforeEditCell(e, args) {

  if (args.column.field === "REMARK1") {
    return true;
  }
  return false;
}

function grdMasterDOnCellChange(e, args) {

  var rowData = args.item;

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTERD.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTERD.lastRowModified = true;
}

function grdDetailDOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_CD",
    field: "OWN_BRAND_CD",
    name: "위탁사",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_NM",
    field: "OWN_BRAND_NM",
    name: "위탁사명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_ID",
    field: "OPTION_ID",
    name: "옵션ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션명",
    minWidth: 150
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
    id: "OPTION_QTY",
    field: "OPTION_QTY",
    name: "옵션수량",
    minWidth: 80,
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
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_BOX",
    field: "CONFIRM_BOX",
    name: "확정BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_EA",
    field: "CONFIRM_EA",
    name: "확정EA",
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
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
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
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_KEY",
    field: "BU_KEY",
    name: "전표키",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailDInitialize() {

  var options = {
    frozenColumn: 3,
    specialRow: {
      compareKey: "ENTRY_QTY",
      compareCol: "CONFIRM_QTY",
      compareOperator: ">",
      cssClass: "specialrow2"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailD", {
    columns: grdDetailDOnGetColumns(),
    queryId: "RIM2010E.RS_T3_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDDETAILD.view.onSelectedRowsChanged.subscribe(grdDetailDOnAfterScroll);
}

function grdDetailDOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAILD.lastRow != null) {
    if (row == G_GRDDETAILD.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    // 지시 수정 체크
    if (!grdSubDOnBeforePost(G_GRDSUBD.lastRow)) {
      $NC.setGridSelectRow(G_GRDDETAILD, G_GRDDETAILD.lastRow);
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDDETAILD.data.getItem(row);

  $NC.setInitGridVar(G_GRDSUBD);
  G_GRDSUBD.lastFilterVal = rowData.LINE_NO;
  G_GRDSUBD.data.refresh();
  $NC.setGridSelectRow(G_GRDSUBD, 0);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailD", row + 1);
}

function grdSubDOnGetColumns(policyRI420) {

  if ($NC.isNull(policyRI420)) {
    policyRI420 = "1";
  }

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "INBOUND_SEQ",
    field: "INBOUND_SEQ",
    name: "반입SEQ",
    minWidth: 120,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 100,
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
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_BOX",
    field: "CONFIRM_BOX",
    name: "확정BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_EA",
    field: "CONFIRM_EA",
    name: "확정EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  if (policyRI420 == "2") {
    $NC.setGridColumn(columns, {
      id: "VALID_DATE",
      field: "VALID_DATE",
      name: "유통기한",
      minWidth: 100,
      editor: Slick.Editors.Date,
      cssClass: "align-center"
    });
  }
  $NC.setGridColumn(columns, {
    id: "INSPECT_YN",
    field: "INSPECT_YN",
    name: "검수여부",
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
    id: "INSPECT_USER_ID",
    field: "INSPECT_USER_ID",
    name: "검수자ID",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_DATETIME",
    field: "INSPECT_DATETIME",
    name: "검수일시",
    minWidth: 140,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdSubDInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3,
    specialRow: {
      compareKey: "ENTRY_QTY",
      compareCol: "CONFIRM_QTY",
      compareOperator: ">",
      cssClass: "specialrow2"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSubD", {
    columns: grdSubDOnGetColumns(),
    queryId: "RIM2010E.RS_T3_SUB1",
    sortCol: "INBOUND_SEQ",
    gridOptions: options
  });

  G_GRDSUBD.view.onSelectedRowsChanged.subscribe(grdSubDOnAfterScroll);
  G_GRDSUBD.view.onBeforeEditCell.subscribe(grdSubDOnBeforeEditCell);
  G_GRDSUBD.view.onCellChange.subscribe(grdSubDOnCellChange);
}

/**
 * grdSubC 데이터 필터링 이벤트
 */
function grdSubDOnFilter(item) {

  return G_GRDSUBD.lastFilterVal === item.LINE_NO;
}

/**
 * @param e
 * @param args
 *          row: activeRow, cell: activeCell, item: item
 */
function grdSubDOnCellChange(e, args) {

  var rowData = args.item;

  if (args.cell === G_GRDSUBD.view.getColumnIndex("CONFIRM_QTY")) {
    rowData.CONFIRM_BOX = $NC.getB_Box(rowData.CONFIRM_QTY, rowData.QTY_IN_BOX);
    rowData.CONFIRM_EA = $NC.getB_Ea(rowData.CONFIRM_QTY, rowData.QTY_IN_BOX);
    rowData.CONFIRM_WEIGHT = $NC.getWeight(rowData.CONFIRM_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUBD.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUBD.lastRowModified = true;
}

function grdSubDOnBeforePost(row) {

  if (!G_GRDSUBD.lastRowModified) {
    return true;
  }
  var rowData = G_GRDSUBD.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  if (rowData.CRUD != "R") {

    var CONFIRM_QTY = Number(rowData.CONFIRM_QTY);

    /*
    if (Number(rowData.ENTRY_QTY) < CONFIRM_QTY) {
      alert("확정수량이 등록수량보다 클 수 없습니다.");
      rowData.CONFIRM_QTY = rowData.ENTRY_QTY;
      G_GRDSUBD.data.updateItem(rowData.id, rowData);
      $NC.setGridSelectRow(G_GRDSUBD, {
        selectRow: row,
        activeCell: G_GRDSUBD.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return false;
    }
    */

    if (CONFIRM_QTY < 0) {
      alert("확정수량이 0보다 작을 수 없습니다.");
      rowData.CONFIRM_QTY = rowData.ENTRY_QTY;
      G_GRDSUBD.data.updateItem(rowData.id, rowData);
      $NC.setGridSelectRow(G_GRDSUBD, {
        selectRow: row,
        activeCell: G_GRDSUBD.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return false;
    }

    if (!$NC.isNull(rowData.VALID_DATE)) {
      if (!$NC.isDate(rowData.VALID_DATE)) {
        alert("유통기한을 정확히 입력하십시오.");
        rowData.VALID_DATE = "";
        G_GRDSUBD.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDSUBD, {
          selectRow: row,
          activeCell: G_GRDSUBD.view.getColumnIndex("VALID_DATE"),
          editMode: true
        });
        return false;
      } else {
        rowData.VALID_DATE = $NC.getDate(rowData.VALID_DATE);
        G_GRDSUBD.data.updateItem(rowData.id, rowData);
      }
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
function grdSubDOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field === "CONFIRM_QTY") {
    return true;
  }
  // 재고관리 기준 - 반입일자, 유효일자, 제조배치번호별 관리
  if (args.column.field === "VALID_DATE") {
    return $NC.G_VAR.policyVal.RI420 === "2";
  }

  if (args.column.field === "BATCH_NO") {
    return $NC.G_VAR.policyVal.RI420 === "2";
  }
  return false;
}

function grdSubDOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUBD.lastRow != null) {
    if (row == G_GRDSUBD.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdSubDOnBeforePost(G_GRDSUBD.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSubD", row + 1);
}

function onGetMasterD(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERD, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERD, "CHECK_YN");
  if (G_GRDMASTERD.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTERD.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTERD, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERD, {
        selectKey: "INBOUND_NO",
        selectVal: G_GRDMASTERD.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMasterD", 0, 0);

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDDETAILD);
    onGetDetailD({
      data: null
    });

    // 반입지시 초기화
    $NC.setInitGridVar(G_GRDSUBD);
    onGetSubD({
      data: null
    });
  }
  // 전표 건수 정보 업데이트
  setMasterSummaryInfo();

  // 공통 버튼 활성화
  setTopButtons();
}

function onGetDetailD(ajaxData) {

  $NC.setInitGridData(G_GRDDETAILD, ajaxData);

  if (G_GRDDETAILD.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAILD, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetailD", 0, 0);
  }
}

function onGetSubD(ajaxData) {

  $NC.setInitGridVar(G_GRDSUBD);
  var rowData = G_GRDDETAILD.data.getItem(G_GRDDETAILD.lastRow);
  if (rowData) {
    G_GRDSUBD.lastFilterVal = rowData.LINE_NO;
  }
  $NC.setInitGridData(G_GRDSUBD, ajaxData, grdSubDOnFilter);

  if (G_GRDSUBD.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDSUBD, 0);
  } else {
    $NC.setGridDisplayRows("#grdSubD", 0, 0);
  }
}

function onSaveD(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERD, {
    selectKey: "INBOUND_NO"
  });
  _Inquiry();
  G_GRDMASTERD.lastKeyVal = lastKeyVal;
}

function onSaveErrorD(ajaxData) {

  $NC.onError(ajaxData);
  setMasterSummaryInfo();
}