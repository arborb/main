function onProcessPreE() {

  
  var rowCount = G_GRDMASTERE.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("배송완료 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDMASTERE.view.getEditorLock().isActive()) {
    G_GRDMASTERE.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  var chkProcessState = $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERE.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 적치확정 상태인 전표만 대상
      if (rowData.OUTBOUND_STATE === chkProcessState) {
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
    alert("배송완료 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 배송완료 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM2010E/callLOProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "E",
    P_DIRECTION: "BW",
    P_OUTBOUND_BATCH: "",
    P_OUTBOUND_BATCH_NM: "",
    P_DELIVERY_BATCH_CD: "",
    P_DELIVERY_BATCH_NM: "",
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

  var result = confirm("배송완료 처리하시겠습니까?");
  if (!result) {
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
      if (rowData.OUTBOUND_STATE === chkProcessState) {
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
    alert("배송완료 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 배송완료처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM2010E/callLOProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "E",
    P_DIRECTION: "FW",
    P_OUTBOUND_BATCH: "",
    P_OUTBOUND_BATCH_NM: "",
    P_DELIVERY_BATCH_CD: "",
    P_DELIVERY_BATCH_NM: "",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveE, onSaveErrorE, 2);
}

function grdMasterEOnGetColumns() {

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
    id: "OUTBOUND_STATE_D",
    field: "OUTBOUND_STATE_D",
    name: "진행상태",
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
    minWidth: 70,
    cssClass: "align-center"
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
    id: "SHIPPER_ADDR_BASIC",
    field: "SHIPPER_ADDR_BASIC",
    name: "기본주소",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR_DETAIL",
    field: "SHIPPER_ADDR_DETAIL",
    name: "상세주소",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "PLANED_DATETIME",
    field: "PLANED_DATETIME",
    name: "납품예정일시",
    minWidth: 130,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_USER_ID",
    field: "CONFIRM_USER_ID",
    name: "확정사용자",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_DATETIME",
    field: "CONFIRM_DATETIME",
    name: "확정일시",
    minWidth: 130,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_USER_ID",
    field: "DELIVERY_USER_ID",
    name: "배송완료자",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_DATETIME",
    field: "DELIVERY_DATETIME",
    name: "배송완료일시",
    minWidth: 120,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "MISSED_YN",
    field: "MISSED_YN",
    name: "미배송처리여부",
    minWidth: 120,
    formatter: Slick.Formatters.CheckBox,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdMasterEInitialize() {

  var options = {
    frozenColumn: 5,
    specialRow: {
      compareKey: "OUTBOUND_STATE",
      compareVal: "50",
      compareOperator: ">=",
      cssClass: "specialrow1"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterE", {
    columns: grdMasterEOnGetColumns(),
    queryId: "LOM2010E.RS_T4_MASTER",
    sortCol: "OUTBOUND_NO",
    gridOptions: options
  });

  G_GRDMASTERE.view.onHeaderClick.subscribe(grdMasterEOnHeaderClick);
  G_GRDMASTERE.view.onClick.subscribe(grdMasterEOnClick);
  G_GRDMASTERE.view.onSelectedRowsChanged.subscribe(grdMasterEOnAfterScroll);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERE, "CHECK_YN");
}

/**
 * 배송완료처리탭 상단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
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
  onGetDetailE({
    data: null
  });

  // 파라메터 세팅
  G_GRDDETAILE.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
    P_OUTBOUND_NO: rowData.OUTBOUND_NO
  });
  // 데이터 조회
  $NC.serviceCall("/LOM2010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILE), onGetDetailE);

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
    minWidth: 40,
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
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 80,
    cssClass: "align-center"
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
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_QTY",
    field: "DELIVERY_QTY",
    name: "배송수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "MISSED_QTY",
    field: "MISSED_QTY",
    name: "미배송수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MISSED_DIV_F",
    field: "MISSED_DIV_F",
    name: "미배송사유",
    minWidth: 150,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "MISSED_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "MISSED_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "MISSED_COMMENT",
    field: "MISSED_COMMENT",
    name: "미배송사유내역",
    minWidth: 200,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "SUPPLY_PRICE",
    field: "SUPPLY_PRICE",
    name: "공급단가",
    minWidth: 80,
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
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VAT_AMT",
    field: "VAT_AMT",
    name: "부가세액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_AMT",
    field: "DC_AMT",
    name: "할인금액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_ORDER_DIV_F",
    field: "ITEM_ORDER_DIV_F",
    name: "상품주문유형",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 100,
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
    id: "ORDER_LINE_NO",
    field: "ORDER_LINE_NO",
    name: "예정순번",
    minWidth: 70,
    cssClass: "align-right"
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
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_KEY",
    field: "BU_KEY",
    name: "전표ID",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_MSG",
    field: "OPTION_MSG",
    name: "옵션메시지",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailEInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 5
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailE", {
    columns: grdDetailEOnGetColumns(),
    queryId: "LOM2010E.RS_T4_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDDETAILE.view.onSelectedRowsChanged.subscribe(grdDetailEOnAfterScroll);
  G_GRDDETAILE.view.onBeforeEditCell.subscribe(grdDetailEOnBeforeEditCell);
  G_GRDDETAILE.view.onCellChange.subscribe(grdDetailEOnCellChange);

}

function grdDetailEOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAILE.lastRow != null) {
    if (row == G_GRDDETAILE.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdDetailEOnBeforePost(G_GRDDETAILE.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailE", row + 1);
}

/**
 * 배송완료처리 탭 : 하단그리드 편집불가능
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdDetailEOnBeforeEditCell(e, args) {

  var rowData = G_GRDDETAILE.data.getItem(args.row);
  var canEdit = rowData.OUTBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM
      && $NC.G_VAR.policyVal.LO510 === "1";
  if (rowData) {
    if (rowData.OUTBOUND_STATE == $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
      return false;
    } else if (args.column.field === "DELIVERY_QTY") {
      return canEdit;
    } else if (args.column.field === "MISSED_DIV_F" || args.column.field === "MISSED_COMMENT") {
      return Number(rowData.MISSED_QTY) > 0;
    } else {
      return true;
    }
  }
  return true;
}

/**
 * 배송완료처리 탭 하단그리드의 셀 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailEOnCellChange(e, args) {

  var rowData = args.item;

  if (args.cell == G_GRDDETAILE.view.getColumnIndex("DELIVERY_QTY")) {

    var isError = false;
    if ($NC.isNull(rowData.DELIVERY_QTY)) {
      rowData.DELIVERY_QTY = 0;
    }

    if (Number(rowData.DELIVERY_QTY) < 0) {
      alert("배송수량에 0보다 작은값을 입력할 수 없습니다.");
      rowData.DELIVERY_QTY = 0;
      rowData.MISSED_QTY = rowData.CONFIRM_QTY;
      isError = true;
    } else if (Number(rowData.CONFIRM_QTY) < Number(rowData.DELIVERY_QTY)) {
      alert("배송수량이 확정수량을 초과할 수 없습니다.");
      rowData.DELIVERY_QTY = rowData.CONFIRM_QTY;
      rowData.MISSED_QTY = 0;
      isError = true;
    } else {
      rowData.MISSED_QTY = Number(rowData.CONFIRM_QTY) - Number(rowData.DELIVERY_QTY);
    }

    if (rowData.MISSED_QTY == 0) {
      rowData.MISSED_DIV = "";
      rowData.MISSED_DIV_F = "";
      rowData.MISSED_COMMENT = "";
    }

    if (isError) {
      setTimeout(function() {
        $NC.setGridSelectRow(G_GRDDETAILE, {
          selectRow: args.row,
          activeCell: G_GRDDETAILE.view.getColumnIndex("DELIVERY_QTY"),
          editMode: true
        });
      }, 300);
    } else if (Number(rowData.MISSED_QTY) > 0) {
      setTimeout(function() {
        $NC.setGridSelectRow(G_GRDDETAILE, {
          selectRow: args.row,
          activeCell: G_GRDDETAILE.view.getColumnIndex("MISSED_DIV_F"),
          editMode: true
        });
      }, 300);
    }
  }

  if (rowData.CRUD == "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAILE.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAILE.lastRowModified = true;
}

/**
 * 배송완료처리 탭 하단그리드의 입력체크 처리
 */
function grdDetailEOnBeforePost(row) {

  // 마지막 레코드가 수정되었을 경우만 처리
  if (!G_GRDDETAILE.lastRowModified) {
    return true;
  }
  var rowData = G_GRDDETAILE.data.getItem(row);
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
    if ($NC.isNull(rowData.DELIVERY_QTY)) {
      alert("배송수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAILE, {
        selectRow: row,
        activeCell: G_GRDDETAILE.view.getColumnIndex("DELIVERY_QTY"),
        editMode: true
      });
      return false;
    }

    if (Number(rowData.DELIVERY_QTY) > Number(rowData.CONFIRM_QTY)) {
      alert("배송수량이 확정수량을 초과할 수 없습니다.");
      $NC.setGridSelectRow(G_GRDDETAILE, {
        selectRow: row,
        activeCell: G_GRDDETAILE.view.getColumnIndex("DELIVERY_QTY"),
        editMode: true
      });
      return false;
    }

    if (Number(rowData.MISSED_QTY) != 0 && $NC.isNull(rowData.MISSED_DIV)) {
      alert("미배송사유를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAILE, {
        selectRow: row,
        activeCell: G_GRDDETAILE.view.getColumnIndex("MISSED_DIV_F"),
        editMode: true
      });
      return false;
    }
  }

  return true;
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
    onGetDetailE({
      data: null
    });

    // 입고지시 초기화
  }

  // 전표 건수 정보 업데이트
  setMasterSummaryInfo();

  // 공통 버튼 활성화
  setTopButtons();
}

function onGetDetailE(ajaxData) {

  $NC.setInitGridData(G_GRDDETAILE, ajaxData);

  if (G_GRDDETAILE.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAILE.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAILE, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAILE, {
        selectKey: "LINE_NO",
        selectVal: G_GRDDETAILE.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetailE", 0, 0);
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
