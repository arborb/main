function inquiryE(con) {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTERE);

  G_GRDMASTERE.queryParams = $NC.getParams({
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
  $NC.serviceCall("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERE), onGetMasterE);
}

function onProcessPreE() {

  var rowCount = G_GRDMASTERE.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("확정 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDMASTERE.view.getEditorLock().isActive()) {
    G_GRDMASTERE.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERE.data.getItem(row);
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
    alert("확정 취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 확정 취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
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

  var result = confirm("확정 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDMASTERE.view.getEditorLock().isActive()) {
    G_GRDMASTERE.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERE.data.getItem(row);
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
    alert("확정 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 확정 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "E",
    P_DIRECTION: "FW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveD, onSaveErrorD, 2);
}

function grdMasterEOnGetColumns() {

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
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "OUTCONFIRM_USER_ID",
    field: "OUTCONFIRM_USER_ID",
    name: "확정사용자",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "OUTCONFIRM_DATETIME",
    field: "OUTCONFIRM_DATETIME",
    name: "확정일시",
    minWidth: 130,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 분배 마스터 그리드 초기화
 */
function grdMasterEInitialize() {

  var options = {
    frozenColumn: 5
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterE", {
    columns: grdMasterEOnGetColumns(),
    queryId: "LX02010E.RS_T4_MASTER",
    sortCol: "RDELIVERY_CD",
    gridOptions: options
  });

  G_GRDMASTERE.view.onSelectedRowsChanged.subscribe(grdMasterEOnAfterScroll);
  G_GRDMASTERE.view.onHeaderClick.subscribe(grdMasterEOnHeaderClick);
  G_GRDMASTERE.view.onClick.subscribe(grdMasterEOnClick);
  G_GRDMASTERE.view.onDblClick.subscribe(grdMasterEOnDblClick);

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

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAILE);
  onGetDetailE({
    data: null
  });

  var rowData = G_GRDMASTERE.data.getItem(row);
  G_GRDDETAILE.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_XDOCK_DATE: rowData.XDOCK_DATE,
    P_XDOCK_TYPE: rowData.XDOCK_TYPE,
    P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
    P_DELIVERY_CD: rowData.DELIVERY_CD,
    P_RDELIVERY_CD: rowData.RDELIVERY_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILE), onGetDetailE);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterE", row + 1);
}

function grdMasterEOnHeaderClick(e, args) {

  grdOnHeaderCheckBoxClick(G_GRDMASTERE, e, args);
}

function grdMasterEOnClick(e, args) {

  grdOnCheckBoxClick(G_GRDMASTERE, e, args);
}

function grdMasterEOnDblClick(e, args) {

}

function grdDetailEOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "XDOCK_STATE_S",
    field: "XDOCK_STATE",
    name: "S",
    minWidth: 30,
    maxWidth: 30,
    formatter: grdStateFormatter
  }, false);
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
    id: "DISTRIBUTE_QTY",
    field: "DISTRIBUTE_QTY",
    name: "분배수량",
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
    id: "CAR_CD",
    field: "CAR_CD",
    name: "차량코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CAR_NM",
    field: "CAR_NM",
    name: "차량명",
    minWidth: 100
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailEInitialize() {

  var options = {
    frozenColumn: 5
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailE", {
    columns: grdDetailEOnGetColumns(),
    queryId: "LX02010E.RS_T4_DETAIL",
    sortCol: "ITEM_CD",
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
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailE", row + 1);
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
        selectKey: ["DELIVERY_BATCH", "DELIVERY_CD"],
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
        selectKey: ["BU_NO", "BRAND_CD", "ITEM_CD"],
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

  var lastKeyValMaster = $NC.getGridLastKeyVal(G_GRDMASTERE, {
    selectKey: ["DELIVERY_BATCH", "DELIVERY_CD"]
  });
  var lastKeyValDetail = $NC.getGridLastKeyVal(G_GRDMASTERE, {
    selectKey: ["BU_NO", "BRAND_CD", "ITEM_CD"]
  });
  _Inquiry();
  G_GRDMASTERE.lastKeyVal = lastKeyValMaster;
  G_GRDDETAILE.lastKeyVal = lastKeyValDetail;
}

function onSaveErrorE(ajaxData) {

  $NC.onError(ajaxData);
  setMasterSummaryInfo();
}