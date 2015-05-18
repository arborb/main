function inquiryF(con) {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTERF);

  G_GRDMASTERF.queryParams = $NC.getParams({
    P_CENTER_CD: con.CENTER_CD,
    P_BU_CD: con.BU_CD,
    P_XDOCK_DATE: con.XDOCK_DATE,
    P_XDOCK_TYPE: con.XDOCK_TYPE,
    P_BU_NO: con.BU_NO,
    P_VENDOR_CD: con.VENDOR_CD,
    P_DELIVERY_BATCH: con.DELIVERY_BATCH,
    P_DELIVERY_CD: con.DELIVERY_CD,
    P_RDELIVERY_CD: con.RDELIVERY_CD,
    P_BRAND_CD: con.BRAND_CD,
    P_ITEM_CD: con.ITEM_CD,
    P_ITEM_NM: con.ITEM_NM,
    P_STATE_PRE_YN: con.STATE_PRE_YN,
    P_STATE_CUR_YN: con.STATE_CUR_YN
  });

  // 데이터 조회
  $NC.serviceCall("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERF), onGetMasterF);
}

function saveF() {

  var grdObject = G_GRDDETAILF;

  // 현재 수정모드면
  if (grdObject.view.getEditorLock().isActive()) {
    grdObject.view.getEditorLock().commitCurrentEdit();
  }
  
  // 현재 선택된 로우 Validation 체크
  if (grdObject.lastRow != null) {
    if (!grdDetailFOnBeforePost(grdObject.lastRow)) {
      return;
    }
  }
  // onCellChange 이벤트에서 에러 발생했는지 체크
  if($NC.G_VAR.isErrorF) {
    $NC.G_VAR.isErrorF = false;
    return;
  }

  var saveDS = [ ];
  var rowData = {};
  var rowCount = grdObject.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    rowData = grdObject.data.getItem(row);
    if (rowData.CRUD == "U" && rowData.XDOCK_STATE == $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_XDOCK_DATE: rowData.XDOCK_DATE,
        P_XDOCK_NO: rowData.XDOCK_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_XDOCK_TYPE: "",
        P_DELIVERY_BATCH: "",
        P_DELIVERY_CD: rowData.DELIVERY_CD,
        P_RDELIVERY_CD: rowData.RDELIVERY_CD,
        P_ASN_NO: "",
        P_DELIVERY_QTY: rowData.DELIVERY_QTY,
        P_MISSED_DIV: rowData.MISSED_DIV,
        P_MISSED_COMMENT: rowData.MISSED_COMMENT,
        P_SUPPLY_AMT: rowData.SUPPLY_AMT,
        P_VAT_AMT: rowData.VAT_AMT,
        P_TOTAL_AMT: rowData.TOTAL_AMT,
        P_CRUD: rowData.CRUD
      };
      saveDS.push(saveData);
    }
  }

  if (saveDS.length > 0) {
    $NC.serviceCall("/LX02010E/save.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_PROCESS_CD: "F",
      P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
      P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSaveF, onSaveErrorE);
  } else {
    alert("저장할 데이터가 없습니다.");
  }
}

function onProcessPreF() {

  var rowCount = G_GRDMASTERF.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("배송 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDMASTERF.view.getEditorLock().isActive()) {
    G_GRDMASTERF.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERF.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      if (rowData.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_XDOCK_DATE: rowData.XDOCK_DATE,
          P_XDOCK_NO: "",
          P_LINE_NO: "",
          P_ASN_NO: "",
          P_XDOCK_TYPE: rowData.XDOCK_TYPE,
          P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
          P_DELIVERY_CD: rowData.DELIVERY_CD,
          P_RDELIVERY_CD: rowData.RDELIVERY_CD
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

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "F",
    P_DIRECTION: "BW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveF, onSaveErrorF, 2);
}

function onProcessNxtF() {

  var rowCount = G_GRDMASTERF.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("배송완료 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDMASTERF.view.getEditorLock().isActive()) {
    G_GRDMASTERF.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERF.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      if (rowData.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_XDOCK_DATE: rowData.XDOCK_DATE,
          P_XDOCK_NO: "",
          P_LINE_NO: "",
          P_ASN_NO: "",
          P_XDOCK_TYPE: rowData.XDOCK_TYPE,
          P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
          P_DELIVERY_CD: rowData.DELIVERY_CD,
          P_RDELIVERY_CD: rowData.RDELIVERY_CD
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

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "F",
    P_DIRECTION: "FW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveF, onSaveErrorF, 2);
}

function grdMasterFOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "XDOCK_STATE_P",
    field: "XDOCK_STATE",
    name: "P",
    minWidth: 30,
    maxWidth: 30,
    sortable: false,
    formatter: processFormatter
  }, false);
  $NC.setGridColumn(columns, {
    id: "XDOCK_STATE_S",
    field: "XDOCK_STATE",
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
    id: "DELIVERY_BATCH",
    field: "DELIVERY_BATCH",
    name: "운송차수",
    minWidth: 80,
    cssClass: "align-center"
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
    id: "XDOCK_STATE_D",
    field: "XDOCK_STATE_D",
    name: "진행상태",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_TYPE_D",
    field: "XDOCK_TYPE_D",
    name: "처리유형",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OUT_SHIP_CNT",
    field: "OUT_SHIP_CNT",
    name: "출고팔레트수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CAR_SHIP_CNT",
    field: "CAR_SHIP_CNT",
    name: "상차팔레트수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CAR_CONFIRM_YN",
    field: "CAR_CONFIRM_YN",
    name: "상차완료여부",
    minWidth: 80,
    cssClass: "align-center",
    sortable: false,
    formatter: Slick.Formatters.CheckBox,
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_USER_ID",
    field: "DELIVERY_USER_ID",
    name: "배송사용자",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_DATETIME",
    field: "DELIVERY_DATETIME",
    name: "배송일시",
    minWidth: 130,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 분배 마스터 그리드 초기화
 */
function grdMasterFInitialize() {

  var options = {
    frozenColumn: 5
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterF", {
    columns: grdMasterFOnGetColumns(),
    queryId: "LX02010E.RS_T5_MASTER",
    sortCol: "RDELIVERY_CD",
    gridOptions: options
  });

  G_GRDMASTERF.view.onSelectedRowsChanged.subscribe(grdMasterFOnAfterScroll);
  G_GRDMASTERF.view.onHeaderClick.subscribe(grdMasterFOnHeaderClick);
  G_GRDMASTERF.view.onClick.subscribe(grdMasterFOnClick);
  G_GRDMASTERF.view.onDblClick.subscribe(grdMasterFOnDblClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERF, "CHECK_YN");
}

function grdMasterFOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERF.lastRow != null) {
    if (row == G_GRDMASTERF.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAILF);
  onGetDetailF({
    data: null
  });

  var rowData = G_GRDMASTERF.data.getItem(row);
  G_GRDDETAILF.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_XDOCK_DATE: rowData.XDOCK_DATE,
    P_XDOCK_TYPE: rowData.XDOCK_TYPE,
    P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
    P_DELIVERY_CD: rowData.DELIVERY_CD,
    P_RDELIVERY_CD: rowData.RDELIVERY_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILF), onGetDetailF);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterF", row + 1);
}

function grdMasterFOnHeaderClick(e, args) {

  grdOnHeaderCheckBoxClick(G_GRDMASTERF, e, args);
}

function grdMasterFOnClick(e, args) {

  grdOnCheckBoxClick(G_GRDMASTERF, e, args);
}

function grdMasterFOnDblClick(e, args) {

}

function grdDetailFOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CAR_CD",
    field: "CAR_CD",
    name: "차량코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CAR_NM",
    field: "CAR_CD",
    name: "차량명",
    minWidth: 100
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
    id: "XDOCK_DATE",
    field: "XDOCK_DATE",
    name: "CD일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_NO",
    field: "XDOCK_NO",
    name: "CD번호",
    minWidth: 90,
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
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ASN_NO",
    field: "ASN_NO",
    name: "ASN번호",
    minWidth: 80
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
    id: "DELIVERY_BOX",
    field: "DELIVERY_BOX",
    name: "배송BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_EA",
    field: "DELIVERY_EA",
    name: "배송EA",
    minWidth: 70,
    cssClass: "align-right"
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

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailFInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 5
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailF", {
    columns: grdDetailFOnGetColumns(),
    queryId: "LX02010E.RS_T5_DETAIL",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDDETAILF.view.onSelectedRowsChanged.subscribe(grdDetailFOnAfterScroll);

  G_GRDDETAILF.view.onBeforeEditCell.subscribe(grdDetailFOnBeforeEditCell);
  G_GRDDETAILF.view.onCellChange.subscribe(grdDetailFOnCellChange);
}

function grdDetailFOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAILF.lastRow != null) {
    if (row == G_GRDDETAILF.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdDetailFOnBeforePost(G_GRDDETAILF.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailF", row + 1);
}

function grdDetailFOnBeforePost(row) {

  if (!G_GRDDETAILF.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAILF.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.DELIVERY_QTY)) {
      alert("배송수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAILF, {
        selectRow: row,
        activeCell: G_GRDDETAILF.view.getColumnIndex("DELIVERY_QTY"),
        editMode: true
      });
      return false;
    }

    if (Number(rowData.DELIVERY_QTY) > Number(rowData.CONFIRM_QTY)) {
      alert("배송수량이 확정수량을 초과할 수 없습니다.");
      $NC.setGridSelectRow(G_GRDDETAILF, {
        selectRow: row,
        activeCell: G_GRDDETAILF.view.getColumnIndex("DELIVERY_QTY"),
        editMode: true
      });
      return false;
    }

    if (Number(rowData.MISSED_QTY) != 0 && $NC.isNull(rowData.MISSED_DIV)) {
      alert("미배송사유를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAILF, {
        selectRow: row,
        activeCell: G_GRDDETAILF.view.getColumnIndex("MISSED_DIV_F"),
        editMode: true
      });
      return false;
    }
  }

  return true;
}

function grdDetailFOnBeforeEditCell(e, args) {

  var rowData = args.item;

  if (args.column.field === "DELIVERY_QTY") {
    if (rowData.XDOCK_STATE != "50") {
      return false;
    }
  }
  return true;
}

function grdDetailFOnCellChange(e, args) {

  var rowData = args.item;

  if (args.cell == G_GRDDETAILF.view.getColumnIndex("DELIVERY_QTY")) {
    
    $NC.G_VAR.isErrorF = false;
    if ($NC.isNull(rowData.DELIVERY_QTY)) {
      rowData.DELIVERY_QTY = 0;
    }

    if (Number(rowData.DELIVERY_QTY) < 0) {
      alert("배송수량에 0보다 작은값을 입력할 수 없습니다.");
      rowData.DELIVERY_QTY = 0;
      rowData.MISSED_QTY = rowData.CONFIRM_QTY;
      $NC.G_VAR.isErrorF = true;
    } else if (Number(rowData.CONFIRM_QTY) < Number(rowData.DELIVERY_QTY)) {
      alert("배송수량이 확정수량을 초과할 수 없습니다.");
      rowData.DELIVERY_QTY = rowData.CONFIRM_QTY;
      rowData.MISSED_QTY = 0;
      $NC.G_VAR.isErrorF = true;
    } else {
      rowData.MISSED_QTY = Number(rowData.CONFIRM_QTY) - Number(rowData.DELIVERY_QTY);
    }
    rowData = grdDetailFOnCalc(rowData);

    if (rowData.MISSED_QTY == 0) {
      rowData.MISSED_DIV = "";
      rowData.MISSED_DIV_F = "";
      rowData.MISSED_COMMENT = "";
    }

    if ($NC.G_VAR.isErrorF) {
      setTimeout(function() {
        $NC.setGridSelectRow(G_GRDDETAILF, {
          selectRow: args.row,
          activeCell: G_GRDDETAILF.view.getColumnIndex("DELIVERY_QTY"),
          editMode: true
        });
        $NC.G_VAR.isErrorF = false;
      }, 300);
    } else if (Number(rowData.MISSED_QTY) > 0) {
      setTimeout(function() {
        $NC.setGridSelectRow(G_GRDDETAILF, {
          selectRow: args.row,
          activeCell: G_GRDDETAILF.view.getColumnIndex("MISSED_DIV_F"),
          editMode: true
        });
      }, 300);
    }
  }

  if (rowData.CRUD == "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAILF.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAILF.lastRowModified = true;
}

function grdDetailFOnCalc(rowData, delivery_Qty) {

  if (!$NC.isNull(delivery_Qty)) {
    rowData.DELIVERY_QTY = Number(delivery_Qty);
  }

  rowData.DELIVERY_BOX = $NC.getB_Box(rowData.DELIVERY_QTY, rowData.QTY_IN_BOX);
  rowData.DELIVERY_EA = $NC.getB_Ea(rowData.DELIVERY_QTY, rowData.QTY_IN_BOX);
  rowData.DELIVERY_WEIGHT = $NC.getWeight(rowData.DELIVERY_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);

  var params = {
    ITEM_PRICE: rowData.SUPPLY_PRICE,// 매입단가 또는 공급단가
    APPLY_PRICE: rowData.APPLY_PRICE,// 적용단가
    ITEM_QTY: rowData.DELIVERY_QTY,// 상품수량
    ITEM_AMT: rowData.SUPPLY_AMT,// 매입금액 또는 공급금액
    VAT_YN: rowData.VAT_YN,// 과세여부가 NULL일 경우는 부가세금액이 있는지로 체크
    VAT_AMT: rowData.VAT_AMT,// 부가세
    DC_AMT: rowData.DC_AMT,// 할인금액
    TOTAL_AMT: rowData.TOTAL_AMT,// 합계금액
    POLICY_VAL: $NC.G_VAR.policyVal.LO190
  };

  rowData.SUPPLY_AMT = $NC.getItem_Amt(params);
  rowData.VAT_AMT = $NC.getVat_Amt(params);
  rowData.TOTAL_AMT = $NC.getTotal_Amt(params);

  return rowData;
}

function onGetMasterF(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERF, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERF, "CHECK_YN");
  if (G_GRDMASTERF.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTERF.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTERF, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERF, {
        selectKey: ["DELIVERY_BATCH", "DELIVERY_CD"],
        selectVal: G_GRDMASTERF.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMasterF", 0, 0);

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDDETAILF);
    onGetDetailF({
      data: null
    });
  }

  // 전표 건수 정보 업데이트
  setMasterSummaryInfo();

  // 공통 버튼 활성화
  setTopButtons();
}

function onGetDetailF(ajaxData) {

  $NC.setInitGridData(G_GRDDETAILF, ajaxData);

  if (G_GRDDETAILF.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAILF.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAILF, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAILF, {
        selectKey: ["CAR_NO", "BU_NO", "BRAND_CD", "ITEM_CD"],
        selectVal: G_GRDDETAILF.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetailF", 0, 0);
  }
}

function onSaveF(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }

  var lastKeyValMaster = $NC.getGridLastKeyVal(G_GRDMASTERF, {
    selectKey: ["DELIVERY_BATCH", "DELIVERY_CD"]
  });
  var lastKeyValDetail = $NC.getGridLastKeyVal(G_GRDMASTERF, {
    selectKey: ["CAR_NO", "BU_NO", "BRAND_CD", "ITEM_CD"]
  });
  _Inquiry();
  G_GRDMASTERF.lastKeyVal = lastKeyValMaster;
  G_GRDDETAILF.lastKeyVal = lastKeyValDetail;
}

function onSaveErrorF(ajaxData) {

  $NC.onError(ajaxData);
  setMasterSummaryInfo();
}