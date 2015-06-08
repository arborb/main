function onProcessPreBT() {

  
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var OUTBOUND_DATE_BT = $NC.getValue("#dtpOutbound_DateBT");
  if ($NC.isNull(OUTBOUND_DATE_BT)) {
    alert("출고일자를 입력하십시오.");
    $NC.setFocus("#dtpOutbound_DateBT");
    return;
  }
  var INOUT_CD = $NC.getValue("#cboQInout_Cd");
  if ($NC.isNull(INOUT_CD)) {
    alert("출고구분을 선택하십시오.");
    $NC.setFocus("#cboQInout_Cd");
    return;
  }

  var result = confirm("출고등록 일괄 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  var BU_NO = $NC.getValue("#edtQBu_No", true);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);

  var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
  var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm", true);
  var SHIPPER_NM = $NC.getValue("#edtQShipper_Nm", true);

  var DELIVERY_BATCH = $NC.getValue("#cboDelivery_BatchBT");

  var processDS = [ ];
  var processData = {
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: OUTBOUND_DATE_BT,
    P_DELIVERY_BATCH: DELIVERY_BATCH,
    P_INOUT_CD: INOUT_CD,
    P_BU_NO: BU_NO,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: ITEM_CD,
    P_ITEM_NM: ITEM_NM,
    P_OUTBOUND_DIV: "2", // 2: 온라인출고
    P_DELIVERY_CD: DELIVERY_CD,
    P_RDELIVERY_CD: "",
    P_ORDERER_NM: ORDERER_NM,
    P_SHIPPER_NM: SHIPPER_NM,
  };
  processDS.push(processData);

  $NC.serviceCall("/LOM2010E/callLOProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "BT",
    P_DIRECTION: "BW",
    P_OUTBOUND_BATCH: "",
    P_OUTBOUND_BATCH_NM: "",
    P_DELIVERY_BATCH_CD: "",
    P_DELIVERY_BATCH_NM: "",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD.substr(0, 1)].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD.substr(0, 1)].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onEntryBatchSuccess, onEntryBatchError, 2);
}

function onProcessNxtBT() {

  if (G_GRDMASTERBT.data.getItems().length == 0) {
    alert("일괄등록 처리할 대상이 없습니다.");
    return;
  }

  if (G_GRDDETAILBT.view.getEditorLock().isActive()) {
    G_GRDDETAILBT.view.getEditorLock().commitCurrentEdit();
  }

  if (G_GRDDETAILBT["isCellChangeError"] == true) {
    G_GRDDETAILBT["isCellChangeError"] = false;
    return;
  }

  if (!grdDetailBTOnBeforePost(G_GRDDETAILBT.lastRow)) {
    return;
  }

  // 디테일 수정여부 체크, 수정시 자동 저장 처리
  if ($NC.isGridModified(G_GRDDETAILBT)) {
    if (!saveEntryBT()) {
      return;
    }
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var ORDER_DATE1 = $NC.getValue("#dtpQOrder_Date1");
  if ($NC.isNull(ORDER_DATE1)) {
    alert("출고예정 검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }
  var ORDER_DATE2 = $NC.getValue("#dtpQOrder_Date2");
  if ($NC.isNull(ORDER_DATE2)) {
    alert("출고예정 검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date2");
    return;
  }
  var OUTBOUND_DATE_BT = $NC.getValue("#dtpOutbound_DateBT");
  if ($NC.isNull(OUTBOUND_DATE_BT)) {
    alert("출고일자를 입력하십시오.");
    $NC.setFocus("#dtpOutbound_DateBT");
    return;
  }
  var INOUT_CD = $NC.getValue("#cboQInout_Cd");
  if ($NC.isNull(INOUT_CD)) {
    alert("출고구분을 선택하십시오.");
    $NC.setFocus("#cboQInout_Cd");
    return;
  }

  var result = confirm("출고등록 일괄 처리하시겠습니까?");
  if (!result) {
    return;
  }

  var BU_NO = $NC.getValue("#edtQBu_No", true);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);

  var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
  var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm", true);
  var SHIPPER_NM = $NC.getValue("#edtQShipper_Nm", true);

  var DELIVERY_BATCH_NM = $NC.getValue("#edtBatch_NmBT");
  if ($NC.isNull(DELIVERY_BATCH_NM)) {
    DELIVERY_BATCH_NM = "";
  }

  var DELIVERY_BATCH = $NC.getValue("#cboDelivery_BatchBT");
  if ($NC.isNull(DELIVERY_BATCH)) {
    DELIVERY_BATCH = "000";
    DELIVERY_BATCH_NM = "";
  }
  
  var BU_TIME1 = $NC.getValue("#edtQBu_Time1");
  var BU_TIME2 = $NC.getValue("#edtQBu_Time2");
  var BU_TIME = BU_TIME1 + BU_TIME2;

  var processDS = [ ];
  var processData = {
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_ORDER_DATE1: ORDER_DATE1,
    P_ORDER_DATE2: ORDER_DATE2,
    P_INOUT_CD: INOUT_CD,
    P_BU_NO: BU_NO,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: ITEM_CD,
    P_ITEM_NM: ITEM_NM,
    P_OUTBOUND_DIV: "2", // 2: 온라인출고
    P_DELIVERY_CD: DELIVERY_CD,
    P_RDELIVERY_CD: "",
    P_ORDERER_NM: ORDERER_NM,
    P_SHIPPER_NM: SHIPPER_NM,
    P_OUTBOUND_DATE: OUTBOUND_DATE_BT,
    P_DELIVERY_BATCH: DELIVERY_BATCH,
    P_DELIVERY_BATCH_NM: DELIVERY_BATCH_NM,
    P_BU_TIME: BU_TIME
  };
  processDS.push(processData);

  $NC.serviceCall("/LOM2010E/callLOProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "BT",
    P_DIRECTION: "FW",
    P_OUTBOUND_BATCH: "",
    P_OUTBOUND_BATCH_NM: "",
    P_DELIVERY_BATCH_CD: "",
    P_DELIVERY_BATCH_NM: "",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD.substr(0, 1)].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD.substr(0, 1)].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onEntryBatchSuccess, onEntryBatchError, 2);
}

/**
 * 상품/배송처정보 저장 처리
 * 
 * @returns {Boolean}
 */
function saveEntryBT() {

  var result = true;
  var saveDS = [ ];
  var rowCount = G_GRDDETAILBT.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAILBT.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_ORDER_DATE: rowData.ORDER_DATE,
        P_ORDER_NO: rowData.ORDER_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_ADJUST_QTY: rowData.ADJUST_QTY,
        P_SHORTAGE_DIV: rowData.SHORTAGE_DIV,
        P_SHORTAGE_COMMENT: rowData.SHORTAGE_COMMENT,
        P_CRUD: rowData.CRUD
      };
      saveDS.push(saveData);
    }
  }

  if (saveDS.length > 0) {
    $NC.serviceCallAndWait("/LOM2010E/saveEntryBT.do", {
      P_DS_DETAIL: $NC.toJson(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, null, function(ajaxData) {
      $NC.onError(ajaxData);
      result = false;
    });
  }

  return result;
}

function grdMasterBTOnGetColumns() {

  var columns = [ ];
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
    minWidth: 70
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
    minWidth: 70,
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
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_BOX",
    field: "ORDER_BOX",
    name: "예정BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_EA",
    field: "ORDER_EA",
    name: "예정EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_QTY",
    field: "ADJUST_QTY",
    name: "출고조정량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_BOX",
    field: "ADJUST_BOX",
    name: "출고조정BOX",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_EA",
    field: "ADJUST_EA",
    name: "출고조정EA",
    minWidth: 90,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 출고등록(일괄) 마스터 그리드 초기화
 */
function grdMasterBTInitialize() {

  var options = {
    specialRow: {
      compareKey: "ADJUST_QTY",
      compareCol: "ORDER_QTY",
      compareOperator: "!=",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterBT", {
    columns: grdMasterBTOnGetColumns(),
    queryId: "LOM2010E.RS_T1B_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options,
    onFilter: grdMasterBTOnFilter
  });

  G_GRDMASTERBT.lastFilterVal = "1";

  G_GRDMASTERBT.view.onSelectedRowsChanged.subscribe(grdMasterBTOnAfterScroll);
}

/**
 * grdMasterBT 데이터 필터링 이벤트
 */
function grdMasterBTOnFilter(item) {

  if ($NC.isNull(G_GRDMASTERBT.lastFilterVal)) {
    return false;
  }
  if (G_GRDMASTERBT.lastFilterVal == "0") {
    return true;
  }
  return Number(item.ORDER_QTY) > Number(item.ADJUST_QTY);
}

function grdMasterBTOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERBT.lastRow != null) {
    if (row == G_GRDMASTERBT.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (G_GRDDETAILBT["isCellChangeError"] == true) {
      $NC.setGridSelectRow(G_GRDMASTERBT, G_GRDMASTERBT.lastRow);
      G_GRDDETAILBT["isCellChangeError"] = false;
      e.stopImmediatePropagation();
      return;
    }

    if (!grdDetailBTOnBeforePost(G_GRDDETAILBT.lastRow)) {
      $NC.setGridSelectRow(G_GRDMASTERBT, G_GRDMASTERBT.lastRow);
      e.stopImmediatePropagation();
      return;
    }
  }

  // 디테일 수정여부 체크, 수정시 자동 저장 처리
  if ($NC.isGridModified(G_GRDDETAILBT)) {
    if (!saveEntryBT()) {
      $NC.setGridSelectRow(G_GRDMASTERBT, G_GRDMASTERBT.lastRow);
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDMASTERBT.data.getItem(row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAILBT);

  if ($NC.isNull(rowData)) {
    onGetDetailBT({
      data: null
    });
  } else {
    var masterParams = $NC.toArray(G_GRDMASTERBT.queryParams);

    G_GRDDETAILBT.queryParams = $NC.getParams({
      P_CENTER_CD: masterParams.P_CENTER_CD,
      P_BU_CD: masterParams.P_BU_CD,
      P_ORDER_DATE1: masterParams.P_ORDER_DATE1,
      P_ORDER_DATE2: masterParams.P_ORDER_DATE2,
      P_INOUT_CD: masterParams.P_INOUT_CD,
      P_BU_NO: masterParams.P_BU_NO,
      P_DELIVERY_CD: masterParams.P_DELIVERY_CD,
      P_ORDERER_NM: masterParams.P_ORDERER_NM,
      P_SHIPPER_NM: masterParams.P_SHIPPER_NM,
      P_BRAND_CD: rowData.BRAND_CD,
      P_ITEM_CD: rowData.ITEM_CD,
      P_ITEM_STATE: rowData.ITEM_STATE,
      P_ITEM_LOT: rowData.ITEM_LOT,
      P_BU_TIME: masterParams.BU_TIME
    });

    // 데이터 조회
    $NC.serviceCall("/LOM2010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILBT), onGetDetailBT);
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterBT", row + 1);
}

function grdDetailBTOnGetColumns() {

  var columns = [ ];
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
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 40,
    cssClass: "align-right"
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
    id: "ORDER_BOX",
    field: "ORDER_BOX",
    name: "예정BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_EA",
    field: "ORDER_EA",
    name: "예정EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_QTY",
    field: "ADJUST_QTY",
    name: "조정수량",
    minWidth: 70,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_BOX",
    field: "ADJUST_BOX",
    name: "조정BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_EA",
    field: "ADJUST_EA",
    name: "조정EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SHORTAGE_DIV_F",
    field: "SHORTAGE_DIV_F",
    name: "미출고사유",
    minWidth: 130,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "SHORTAGE_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "SHORTAGE_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "SHORTAGE_COMMENT",
    field: "SHORTAGE_COMMENT",
    name: "미출고사유내역",
    minWidth: 150,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "출고구분",
    minWidth: 120
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

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailBTInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1,
    specialRow: {
      compareKey: "ADJUST_QTY",
      compareCol: "ORDER_QTY",
      compareOperator: "!=",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailBT", {
    columns: grdDetailBTOnGetColumns(),
    queryId: "LOM2010E.RS_T1B_DETAIL",
    sortCol: "ORDER_DATE",
    gridOptions: options
  });

  G_GRDDETAILBT.view.onSelectedRowsChanged.subscribe(grdDetailBTOnAfterScroll);
  G_GRDDETAILBT.view.onBeforeEditCell.subscribe(grdDetailBTOnBeforeEditCell);
  G_GRDDETAILBT.view.onCellChange.subscribe(grdDetailBTOnCellChange);

}

function grdDetailBTOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAILBT.lastRow != null) {
    if (row == G_GRDDETAILBT.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdDetailBTOnBeforePost(G_GRDDETAILBT.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailBT", row + 1);
}

/**
 * @param e
 *          Event Handler
 * @param args
 *          row: activeRow, cell: activeCell, item: item, column: columnDef
 */
function grdDetailBTOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field === "ADJUST_QTY") {
    return true;
  }
  // 예정수량 > 조정수량일 경우 미출고사유및내역 입력 가능
  var rowData = args.item;
  if (args.column.field === "SHORTAGE_DIV_F" || args.column.field === "SHORTAGE_COMMENT") {
    return (Number(rowData.ORDER_QTY) > Number(rowData.ADJUST_QTY));
  }
  return false;
}

/**
 * @param e
 * @param args
 *          row: activeRow, cell: activeCell, item: item
 */
function grdDetailBTOnCellChange(e, args) {

  var rowData = args.item;
  G_GRDDETAILBT["isCellChangeError"] = false;

  if (args.cell === G_GRDDETAILBT.view.getColumnIndex("ADJUST_QTY")) {

    // 수량조정정보/출고가능정보 표시
    setAdjustQtyInfo(false);

    if (Number(rowData.ORDER_QTY) < Number(rowData.ADJUST_QTY)) {
      alert("조정수량이 예정수량보다 클 수 없습니다.");

      G_GRDDETAILBT["isCellChangeError"] = true;
      rowData.ADJUST_QTY = rowData.ORG_ADJUST_QTY;
      rowData.ADJUST_BOX = $NC.getB_Box(rowData.ADJUST_QTY, rowData.QTY_IN_BOX);
      rowData.ADJUST_EA = $NC.getB_Ea(rowData.ADJUST_QTY, rowData.QTY_IN_BOX);

      setTimeout(function() {
        $NC.setGridSelectRow(G_GRDDETAILBT, {
          selectRow: args.row,
          activeCell: G_GRDDETAILBT.view.getColumnIndex("ADJUST_QTY"),
          editMode: true
        });
      }, 100);

      // 수량조정정보/출고가능정보 표시
      setAdjustQtyInfo(false);
    } else if (Number($NC.getValue("#edtAdjust_Qty")) > Number($NC.getValue("#edtPStock_Qty"))) {
      alert("출고가능량을 초과해서 조정할 수 없습니다.");

      G_GRDDETAILBT["isCellChangeError"] = true;
      rowData.ADJUST_QTY = rowData.ORG_ADJUST_QTY;
      rowData.ADJUST_BOX = $NC.getB_Box(rowData.ADJUST_QTY, rowData.QTY_IN_BOX);
      rowData.ADJUST_EA = $NC.getB_Ea(rowData.ADJUST_QTY, rowData.QTY_IN_BOX);

      setTimeout(function() {
        $NC.setGridSelectRow(G_GRDDETAILBT, {
          selectRow: args.row,
          activeCell: G_GRDDETAILBT.view.getColumnIndex("ADJUST_QTY"),
          editMode: true
        });
      }, 100);

      // 수량조정정보/출고가능정보 표시
      setAdjustQtyInfo(false);
    } else {
      rowData.ADJUST_BOX = $NC.getB_Box(rowData.ADJUST_QTY, rowData.QTY_IN_BOX);
      rowData.ADJUST_EA = $NC.getB_Ea(rowData.ADJUST_QTY, rowData.QTY_IN_BOX);
    }

    var ADJUST_QTY = Number($NC.getValue("#edtAdjust_Qty"));
    var masterRowData = G_GRDMASTERBT.data.getItem(G_GRDMASTERBT.lastRow);
    if (masterRowData && masterRowData.ADJUST_QTY != ADJUST_QTY) {
      masterRowData.ADJUST_QTY = ADJUST_QTY;
      masterRowData.ADJUST_BOX = $NC.getB_Box(masterRowData.ADJUST_QTY, masterRowData.QTY_IN_BOX);
      masterRowData.ADJUST_EA = $NC.getB_Ea(masterRowData.ADJUST_QTY, masterRowData.QTY_IN_BOX);

      G_GRDMASTERBT.data.updateItem(masterRowData.id, masterRowData);
    }

    if (Number(rowData.ORDER_QTY) == Number(rowData.ADJUST_QTY)) {
      rowData.SHORTAGE_DIV = "";
      rowData.SHORTAGE_DIV_F = "";
      rowData.SHORTAGE_COMMENT = "";
    }
    
    // 예정수량 > 등록수량 일때 미출고사유 '01 - 재고부족' 으로 기본셋팅
    if (Number(rowData.ORDER_QTY) > Number(rowData.ADJUST_QTY) && $NC.isNull(rowData.SHORTAGE_DIV)) {
      rowData.SHORTAGE_DIV = "01";
      rowData.SHORTAGE_DIV_F = $NC.getGridComboName(G_GRDDETAILBT, {
        colFullNameField: "SHORTAGE_DIV_F",
        searchVal: "01",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      });
    }
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }

  G_GRDDETAILBT.data.updateItem(rowData.id, rowData);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAILBT.lastRowModified = true;
}

/**
 * 입력체크
 */
function grdDetailBTOnBeforePost(row) {

  G_GRDDETAILBT["isCellChangeError"] = false;
  // 마지막 레코드가 수정되었을 경우만 처리
  if (!G_GRDDETAILBT.lastRowModified) {
    return true;
  }
  var rowData = G_GRDDETAILBT.data.getItem(row);
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

    var ORDER_QTY = Number(rowData.ORDER_QTY);
    var ADJUST_QTY = Number(rowData.ADJUST_QTY);

    if (ORDER_QTY < ADJUST_QTY) {
      alert("조정수량이 예정수량보다 클 수 없습니다.");

      rowData.ADJUST_QTY = rowData.ORG_ADJUST_QTY;
      rowData.ADJUST_BOX = $NC.getB_Box(rowData.ADJUST_QTY, rowData.QTY_IN_BOX);
      rowData.ADJUST_EA = $NC.getB_Ea(rowData.ADJUST_QTY, rowData.QTY_IN_BOX);
      G_GRDDETAILBT.data.updateItem(rowData.id, rowData);

      $NC.setGridSelectRow(G_GRDDETAILBT, {
        selectRow: row,
        activeCell: G_GRDDETAILBT.view.getColumnIndex("ADJUST_QTY"),
        editMode: true
      });

      // 수량조정정보/출고가능정보 표시
      setAdjustQtyInfo(false);
      return false;
    }

    if (Number($NC.getValue("#edtAdjust_Qty")) > Number($NC.getValue("#edtPStock_Qty"))) {
      alert("출고가능량을 초과해서 조정할 수 없습니다.");

      rowData.ADJUST_QTY = rowData.ORG_ADJUST_QTY;
      rowData.ADJUST_BOX = $NC.getB_Box(rowData.ADJUST_QTY, rowData.QTY_IN_BOX);
      rowData.ADJUST_EA = $NC.getB_Ea(rowData.ADJUST_QTY, rowData.QTY_IN_BOX);
      G_GRDDETAILBT.data.updateItem(rowData.id, rowData);

      $NC.setGridSelectRow(G_GRDDETAILBT, {
        selectRow: row,
        activeCell: G_GRDDETAILBT.view.getColumnIndex("ADJUST_QTY"),
        editMode: true
      });

      // 수량조정정보/출고가능정보 표시
      setAdjustQtyInfo(false);
      return false;
    }

    if (ORDER_QTY > ADJUST_QTY && $NC.isNull(rowData.SHORTAGE_DIV)) {
      alert("미출고사유를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAILBT, {
        selectRow: row,
        activeCell: G_GRDDETAILBT.view.getColumnIndex("SHORTAGE_DIV_F"),
        editMode: true
      });
      return false;
    }
  }
  return true;
}

function grdStockMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_CD_F",
    field: "INOUT_CD_F",
    name: "출고구분",
    minWidth: 130
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "출고처",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_NM",
    field: "DELIVERY_NM",
    name: "출고처명",
    minWidth: 130
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 20,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "출고대기수량",
    minWidth: 90,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdStockMasterInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdStockMaster", {
    columns: grdStockMasterOnGetColumns(),
    queryId: "LOM2010E.RS_SUB1",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDSTOCKMASTER.view.onSelectedRowsChanged.subscribe(grdStockMasterOnAfterScroll);

  var divStockInfoView = $("#divStockInfoView");
  divStockInfoView.children().click(function(e) {
    G_GRDSTOCKMASTER.view.focus();
  });
  var grdStockMaster = $("#grdStockMaster");
  grdStockMaster.find("div.grid-focus").blur(function(e) {
    clearTimeout($NC.G_VAR.onCarInfoViewTimeout);
    $NC.G_VAR.onStockInfoViewTimeout = setTimeout(function() {
      divStockInfoView.hide("fast", function() {
        divStockInfoView.css({
          "display": "none"
        });
      });
    }, 500);
  });
  grdStockMaster.find("div.grid-focus,div.grid-canvas,div.slick-viewport").focus(function(e) {
    clearTimeout($NC.G_VAR.onStockInfoViewTimeout);
  });
}

function grdStockMasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdStockMaster", row + 1);
}

/**
 * 수량조정정보 표시
 */
function setAdjustQtyInfo(withPStock) {
  if ($NC.isNull(G_GRDMASTERBT.lastRow)) {
    $NC.setValue("#edtOrder_Qty");
    $NC.setValue("#edtAdjust_Qty");
    $NC.setValue("#edtReal_PStock_Qty");
    $NC.setValue("#edtStock_Qty");
    $NC.setValue("#edtVirtual_Qty");
    $NC.setValue("#edtOut_Wait_Qty");
    $NC.setValue("#edtPStock_Qty");
    return;
  }

  var rowData = G_GRDMASTERBT.data.getItem(G_GRDMASTERBT.lastRow);

  // 수량조정정보 총출고예정 표시
  $NC.setValue("#edtOrder_Qty", rowData.ORDER_QTY);
  var ADJUST_QTY = $NC.getGridSumVal(G_GRDDETAILBT, {
    searchKey: null,
    searchVal: null,
    sumKey: "ADJUST_QTY"
  });
  $NC.setValue("#edtAdjust_Qty", ADJUST_QTY);
  var PSTOCK_QTY = Number(rowData.ORDER_QTY) - ADJUST_QTY;
  $NC.setValue("#edtReal_PStock_Qty", PSTOCK_QTY);

  $("#lblReal_PStock_Qty").removeClass(PSTOCK_QTY > 0 ? "ui-lbl-normal" : "ui-lbl-key");
  $("#edtReal_PStock_Qty").removeClass(PSTOCK_QTY > 0 ? "ui-edt-normal" : "ui-edt-key");
  $("#lblReal_PStock_Qty").addClass(PSTOCK_QTY > 0 ? "ui-lbl-key" : "ui-lbl-normal");
  $("#edtReal_PStock_Qty").addClass(PSTOCK_QTY > 0 ? "ui-edt-key" : "ui-edt-normal");

  if (withPStock || true) {
    // 데이터 조회
    $NC.serviceCallAndWait("/LOM2010E/callSP.do", {
      P_QUERY_ID: "WF.GET_PSTOCK_QTY",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_POLICY_LO310: "",
        P_POLICY_LO320: ""
      })
    }, function(ajaxData) {
      var resultData = $NC.toArray(ajaxData);
      if (resultData.O_MSG === "OK") {
        $NC.setValue("#edtStock_Qty", resultData.O_STOCK_QTY);
        $NC.setValue("#edtVirtual_Qty", resultData.O_VIRTUAL_QTY);
        $NC.setValue("#edtOut_Wait_Qty", resultData.O_OUT_WAIT_QTY);
        $NC.setValue("#edtPStock_Qty", resultData.O_PSTOCK_QTY);
      } else {
        alert("출고가능량 정보를 가져오지 못했습니다.\n데이터를 다시 선택하십시오.");
        $NC.setValue("#edtStock_Qty", "0");
        $NC.setValue("#edtVirtual_Qty", "0");
        $NC.setValue("#edtOut_Wait_Qty", "0");
        $NC.setValue("#edtPStock_Qty", "0");
        return;
      }
    });
  }
}

function onGetMasterBT(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERBT, ajaxData);
  if (G_GRDMASTERBT.data.getLength() > 0) {

    if ($NC.isNull(G_GRDMASTERBT.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTERBT, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERBT, {
        selectKey: ["ITEM_CD", "ITEM_STATE", "ITEM_LOT"],
        selectVal: G_GRDMASTERBT.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMasterBT", 0, 0);
    
    // 디테일 초기화
    $NC.setInitGridVar(G_GRDDETAILBT);
    onGetDetailBT({
      data: null
    });
  }

  // 공통 버튼 활성화
  setTopButtons();
  setProcessStateInfo();
  setDeliveryBatchCombo();
}

function onGetDetailBT(ajaxData) {

  $NC.setInitGridData(G_GRDDETAILBT, ajaxData);

  if (G_GRDDETAILBT.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAILBT, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetailBT", 0, 0);
  }

  // 수량조정정보/출고가능정보 표시
  setAdjustQtyInfo(true);
}

function onSaveBT(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }

  var lastRowData = G_GRDMASTERBT.data.getItem(G_GRDMASTERBT.lastRow);
  _Inquiry();
  G_GRDMASTERBT.lastKeyVal = [lastRowData.ITEM_CD, lastRowData.ITEM_STATE, lastRowData.ITEM_LOT];
}

function onSaveErrorBT(ajaxData) {

  $NC.onError(ajaxData);
  setMasterSummaryInfo();
}

/**
 * 일괄등록/취소 성공시 처리
 */
function onEntryBatchSuccess(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  $NC.setValue("#edtBatch_NmBT");
  alert("정상적으로 처리 되었습니다.");
  setMasterSummaryInfo();
  _Inquiry();
}

/**
 * 일괄등록/취소 실패시 처리
 */
function onEntryBatchError(ajaxData) {
  $NC.onError(ajaxData);
}

function onGetStockMaster(ajaxData) {

  $NC.setInitGridData(G_GRDSTOCKMASTER, ajaxData);
  if (G_GRDSTOCKMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDSTOCKMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSTOCKMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSTOCKMASTER, {
        selectKey: "OUTBOUND_DATE",
        selectVal: G_GRDSTOCKMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdStockMaster", 0, 0);
  }
}

/**
 * 출고대기량 조회 버튼 클릭 처리
 * 
 * @param e
 */
function showStockOverlay(e) {
  
  if (!$("#divStockInfoView").is(":hidden")) {
    $("#divStockInfoView").hide("fast");
    return;
  }

  if (G_GRDMASTERBT.lastRow == null || G_GRDMASTERBT.data.getLength() == 0) {
    alert("출고대기량을 조회할 상품을 선택하십시오.");
    return;
  }

  var rowData = G_GRDMASTERBT.data.getItem(G_GRDMASTERBT.lastRow);
  if (rowData) {
    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var OUTBOUND_DATE = $NC.getValue("#dtpOutbound_DateBT");
    var OUTBOUND_NO = rowData.OUTBOUND_NO;
    var BRAND_CD = rowData.BRAND_CD;
    var ITEM_CD = rowData.ITEM_CD;
    var ITEM_STATE = rowData.ITEM_STATE;
    var ITEM_LOT = rowData.ITEM_LOT;

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSTOCKMASTER);

    G_GRDSTOCKMASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: OUTBOUND_NO,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_STATE: ITEM_STATE,
      P_ITEM_LOT: ITEM_LOT
    });

    // 데이터 조회
    $NC.serviceCallAndWait("/LOM2010E/getDataSet.do", $NC.getGridParams(G_GRDSTOCKMASTER), onGetStockMaster);

    clearTimeout($NC.G_VAR.onStockInfoViewTimeout);
    var divStockInfoView = $("#divStockInfoView").hide();
    var offset = $("#divOutboundInfoView").offset();
    var clientHeight = Math.max(G_GRDSTOCKMASTER.data.getLength() * 25 - $NC.G_LAYOUT.header, 350);
    divStockInfoView.css({
      "position": "absolute",
      "top": offset.top - 1,
      "left": offset.left - $NC.G_OFFSET.stockMasterViewWidth - 1,
      "z-index": 1000,
      "width": $NC.G_OFFSET.stockMasterViewWidth,
      "height": clientHeight
    });

    G_GRDSTOCKMASTER.view.resetActiveCell();
    divStockInfoView.show("fast", function() {
      G_GRDSTOCKMASTER.view.focus();
      $NC.resizeGrid("#grdStockMaster", $NC.G_OFFSET.stockMasterViewWidth, clientHeight - $NC.G_LAYOUT.header
          - $("#divStockInfoBottomView").outerHeight() - 1);
      G_GRDSTOCKMASTER.view.invalidate();
      $NC.setGridSelectRow(G_GRDSTOCKMASTER, 0);
    });
  }
}