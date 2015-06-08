function onProcessPreD() {

  
  var rowCount = G_GRDMASTERD.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("출고확정 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  $NC.serviceCallAndWait("/LOM2010E/callUpdateD.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_ERR_CNT: 0,
    })
  });
  
  if (G_GRDMASTERD.view.getEditorLock().isActive()) {
    G_GRDMASTERD.view.getEditorLock().commitCurrentEdit();
  }
 
  var processDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERD.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 출고확정 상태인 전표만 대상
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
    alert("출고확정취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 출고확정취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCallAndWait("/LOM2010E/callLOProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "D",
    P_DIRECTION: "BW",
    P_OUTBOUND_BATCH: "",
    P_OUTBOUND_BATCH_NM: "",
    P_DELIVERY_BATCH_CD: "",
    P_DELIVERY_BATCH_NM: "",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onProcessD, onSaveErrorD, 2);
  
  $NC.serviceCall("/LOM2010E/callSP.do", {
    P_QUERY_ID: "WF.GET_TEMP_LOCNT_40",
    P_QUERY_PARAMS: $NC.getParams({
      P_ERR_CNT: 0,
    })
  }, function(ajaxData) {
    var resultData = $NC.toArray(ajaxData);
    if (!$NC.isNull(resultData)) {
      if (resultData.O_MSG === "OK") {
        alert(resultData.O_CHK_YN);
      }
    }
  });
}

function onProcessNxtD() {

  var rowCount = G_GRDMASTERD.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("출고확정 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDMASTERD.view.getEditorLock().isActive()) {
    G_GRDMASTERD.view.getEditorLock().commitCurrentEdit();
  }

  if ($NC.isGridModified(G_GRDSUBD)) {
    alert("데이터가 수정되었습니다. 저장 후 출고확정 처리하십시오.");
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERD.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 출고지시 상태인 전표만 대상
      if (rowData.OUTBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
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
    alert("출고확정 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 확정처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM2010E/callLOProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "D",
    P_DIRECTION: "FW",
    P_OUTBOUND_BATCH: "",
    P_OUTBOUND_BATCH_NM: "",
    P_DELIVERY_BATCH_CD: "",
    P_DELIVERY_BATCH_NM: "",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onProcessD, onSaveErrorD, 2);
}

function grdMasterDOnGetColumns() {

  var columns = [ ];
  var processFormatter = function(row, cell, value, columnDef, dataContext) {
    if (dataContext.OUTBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
      return "<span class='ui-icon-prior'>&nbsp;</span>";
    }
    return "<span class='ui-icon-next'>&nbsp;</span>";
  };

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
    id: "ORDER_DIV_D",
    field: "ORDER_DIV_D",
    name: "주문구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "TOT_CONFIRM_QTY",
    field: "TOT_CONFIRM_QTY",
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
    id: "OUTBOUND_BATCH",
    field: "OUTBOUND_BATCH",
    name: "출고차수",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_STATE_D",
    field: "OUTBOUND_STATE_D",
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
    name: "예정번호",
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
    id: "MALL_CD_D",
    field: "MALL_CD_D",
    name: "MALL명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "INORDER_TYPE_D",
    field: "INORDER_TYPE_D",
    name: "매입형태",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_TYPE2_D",
    field: "DELIVERY_TYPE2_D",
    name: "배송지역구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_TYPE_D",
    field: "SHIP_TYPE_D",
    name: "운송구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_PRICE_TYPE_D",
    field: "SHIP_PRICE_TYPE_D",
    name: "운송비구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_PRICE",
    field: "SHIP_PRICE",
    name: "운송비",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_TYPE_D",
    field: "DELIVERY_TYPE_D",
    name: "배송유형",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MALL_MSG",
    field: "MALL_MSG",
    name: "온라인몰메시지",
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
    id: "SHIPPER_ZIP_CD",
    field: "SHIPPER_ZIP_CD",
    name: "우편번호",
    minWidth: 60,
    cssClass: "align-center"
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
    id: "OPTION_MSG",
    field: "OPTION_MSG",
    name: "옵션메시지",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_DATETIME",
    field: "CONFIRM_DATETIME",
    name: "최종확정일시",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdMasterDInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3,
    specialRow: {
      compareKey: "OUTBOUND_STATE",
      compareVal: "40",
      compareOperator: ">=",
      cssClass: "specialrow1"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterD", {
    columns: grdMasterDOnGetColumns(),
    queryId: "LOM2010E.RS_T3_MASTER",
    sortCol: "OUTBOUND_NO",
    gridOptions: options
  });

  G_GRDMASTERD.view.onSelectedRowsChanged.subscribe(grdMasterDOnAfterScroll);
  G_GRDMASTERD.view.onBeforeEditCell.subscribe(grdMasterDOnBeforeEditCell);
  G_GRDMASTERD.view.onCellChange.subscribe(grdMasterDOnCellChange);
  G_GRDMASTERD.view.onHeaderClick.subscribe(grdMasterDOnHeaderClick);
  G_GRDMASTERD.view.onClick.subscribe(grdMasterDOnClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERD, "CHECK_YN");
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

/**
 * @param e
 *          Event Handler
 * @param args
 *          row: activeRow, cell: activeCell, item: item, column: columnDef
 */
function grdMasterDOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field === "REMARK1") {
    return true;
  }
  return false;
}

function grdMasterDOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERD.lastRow != null) {
    if (row == G_GRDMASTERD.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDMASTERD.data.getItem(row);
  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAILD);
  onGetDetailD({
    data: null
  });

  G_GRDDETAILD.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
    P_OUTBOUND_NO: rowData.OUTBOUND_NO
  });
  // 데이터 조회
  $NC.serviceCall("/LOM2010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILD), onGetDetailD);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUBD);

  G_GRDSUBD.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
    P_OUTBOUND_NO: rowData.OUTBOUND_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LOM2010E/getDataSet.do", $NC.getGridParams(G_GRDSUBD), onGetSubD);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterD", row + 1, G_GRDMASTERD.data.getLength());
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
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "위탁사",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
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
    id: "OPTION_QTY",
    field: "OPTION_QTY",
    name: "옵션수량",
    minWidth: 80,
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
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
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
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 80
  });
  
  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailDInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailD", {
    columns: grdDetailDOnGetColumns(),
    queryId: "LOM2010E.RS_T3_DETAIL",
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

function grdSubDOnGetColumns(policyLO250) {

  if ($NC.isNull(policyLO250)) {
    policyLO250 = "1";
  }

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_ID",
    field: "LOCATION_ID",
    name: "로케이션ID",
    minWidth: 130,
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
    id: "PICK_QTY",
    field: "PICK_QTY",
    name: "피킹수량",
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
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_WEIGHT",
    field: "CONFIRM_WEIGHT",
    name: "확정중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PICK_YN",
    field: "PICK_YN",
    name: "피킹여부",
    minWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_YN",
    field: "INSPECT_YN",
    name: "검수여부",
    minWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  if (policyLO250 == "2") {
    $NC.setGridColumn(columns, {
      id: "VALID_DATE",
      field: "VALID_DATE",
      name: "유통기한",
      minWidth: 90,
      cssClass: "align-center"
    });
    $NC.setGridColumn(columns, {
      id: "BATCH_NO",
      field: "BATCH_NO",
      name: "제조배치번호",
      minWidth: 100
    });
  }

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
      compareOperator: "!=",
      cssClass: "specialrow1"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSubD", {
    columns: grdSubDOnGetColumns(),
    queryId: "LOM2010E.RS_T3_SUB1",
    sortCol: "LOCATION_ID",
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

    if (Number(rowData.CONFIRM_QTY) < 0) {
      alert("확정수량이 0보다 작을 수 없습니다.");

      rowData.CONFIRM_QTY = rowData.ENTRY_QTY;
      rowData.CONFIRM_BOX = $NC.getB_Box(rowData.CONFIRM_QTY, rowData.QTY_IN_BOX);
      rowData.CONFIRM_EA = $NC.getB_Ea(rowData.CONFIRM_QTY, rowData.QTY_IN_BOX);
      rowData.CONFIRM_WEIGHT = $NC.getWeight(rowData.CONFIRM_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);
      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDSUBD.data.updateItem(rowData.id, rowData);

      $NC.setGridSelectRow(G_GRDSUBD, {
        selectRow: G_GRDSUBD.lastRow,
        activeCell: G_GRDSUBD.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return;
    }

    if (Number(rowData.ENTRY_QTY) < Number(rowData.CONFIRM_QTY)) {
      alert("확정수량이 등록수량을 초과할 수 없습니다.");

      rowData.CONFIRM_QTY = rowData.ENTRY_QTY;
      rowData.CONFIRM_BOX = $NC.getB_Box(rowData.CONFIRM_QTY, rowData.QTY_IN_BOX);
      rowData.CONFIRM_EA = $NC.getB_Ea(rowData.CONFIRM_QTY, rowData.QTY_IN_BOX);
      rowData.CONFIRM_WEIGHT = $NC.getWeight(rowData.CONFIRM_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);
      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDSUBD.data.updateItem(rowData.id, rowData);

      $NC.setGridSelectRow(G_GRDSUBD, {
        selectRow: G_GRDSUBD.lastRow,
        activeCell: G_GRDSUBD.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return;
    }

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

  // 마지막 레코드가 수정되었을 경우만 처리
  if (!G_GRDSUBD.lastRowModified) {
    return true;
  }
  var rowData = G_GRDSUBD.data.getItem(row);
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
    var CONFIRM_QTY = Number(rowData.CONFIRM_QTY);

    if (Number(rowData.ENTRY_QTY) < CONFIRM_QTY) {
      alert("확정수량이 등록수량을 초과할 수 없습니다.");
      $NC.setGridSelectRow(G_GRDSUBD, {
        selectRow: row,
        activeCell: G_GRDSUBD.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return false;
    }

    if (CONFIRM_QTY < 0) {
      alert("확정수량이 0보다 작을 수 없습니다.");
      $NC.setGridSelectRow(G_GRDSUBD, {
        selectRow: row,
        activeCell: G_GRDSUBD.view.getColumnIndex("CONFIRM_QTY"),
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
function grdSubDOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  var rowData = G_GRDDETAILD.data.getItem(G_GRDDETAILD.lastRow);
  var canEdit = rowData.OUTBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM
      && $NC.G_VAR.policyVal.LO410 === "1";
  if (args.column.field === "CONFIRM_QTY") {
    return canEdit;
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
        selectKey: "OUTBOUND_NO",
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
    $NC.setInitGridVar(G_GRDSUBD);
    onGetSubD({
      data: null
    });
  }
}

function onGetSubD(ajaxData) {

  G_GRDSUBD.lastFilterVal = null;
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

function onProcessD(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  var lastRowData = G_GRDMASTERD.data.getItem(G_GRDMASTERD.lastRow);
  _Inquiry();
  G_GRDMASTERD.lastKeyVal = lastRowData.OUTBOUND_NO;
}

function onSaveD(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERD, {
    selectKey: "OUTBOUND_NO"
  });
  _Inquiry();
  G_GRDMASTERD.lastKeyVal = lastKeyVal;
}

function onSaveErrorD(ajaxData) {

  $NC.onError(ajaxData);
  setMasterSummaryInfo();
}
