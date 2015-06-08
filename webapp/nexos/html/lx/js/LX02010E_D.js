function inquiryD(con) {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTERD);

  G_GRDMASTERD.queryParams = $NC.getParams({
    P_CENTER_CD: con.CENTER_CD,
    P_BU_CD: con.BU_CD,
    P_XDOCK_DATE: con.XDOCK_DATE,
    P_XDOCK_TYPE: con.XDOCK_TYPE,
    P_BU_NO: con.BU_NO,
    P_VENDOR_CD: con.VENDOR_CD,
    P_BRAND_CD: con.BRAND_CD,
    P_ITEM_CD: con.ITEM_CD,
    P_ITEM_NM: con.ITEM_NM,
    P_STATE_PRE_YN: con.STATE_PRE_YN,
    P_STATE_CUR_YN: con.STATE_CUR_YN
  });

  // 데이터 조회
  $NC.serviceCall("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERD), onGetMasterD);
}

function saveD() {

  var grdObject = G_GRDSUBD;

  // 현재 수정모드면
  if (grdObject.view.getEditorLock().isActive()) {
    grdObject.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (grdObject.lastRow != null) {
    if (!grdSubDOnBeforePost(grdObject.lastRow)) {
      return;
    }
  }
  
  // onCellChange 이벤트에서 에러 발생했는지 체크
  if($NC.G_VAR.isErrorD) {
    $NC.G_VAR.isErrorD = false;
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
        P_ASN_NO: rowData.ASN_NO,
        P_DISTRIBUTE_QTY: rowData.DISTRIBUTE_QTY,
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
      P_PROCESS_CD: "D",
      P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
      P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSaveD, onSaveErrorE);
  } else {
    alert("저장할 데이터가 없습니다.");
  }
}

function onProcessPreD1() {

  var rowCount = G_GRDDETAILD.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("분배 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDDETAILD.view.getEditorLock().isActive()) {
    G_GRDDETAILD.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAILD.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      if (rowData.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_XDOCK_DATE: rowData.XDOCK_DATE,
          P_XDOCK_NO: rowData.XDOCK_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_ASN_NO: "",
          P_XDOCK_TYPE: "",
          P_DELIVERY_BATCH: "",
          P_DELIVERY_CD: "",
          P_RDELIVERY_CD: ""
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("분배 취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 분배 취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "D",
    P_DIRECTION: "BW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveD, onSaveErrorD, 2);
}

function onProcessNxtD1() {

  var rowCount = G_GRDDETAILD.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("분배 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDDETAILD.view.getEditorLock().isActive()) {
    G_GRDDETAILD.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAILD.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      if (rowData.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_XDOCK_DATE: rowData.XDOCK_DATE,
          P_XDOCK_NO: rowData.XDOCK_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_ASN_NO: "",
          P_XDOCK_TYPE: "",
          P_DELIVERY_BATCH: "",
          P_DELIVERY_CD: "",
          P_RDELIVERY_CD: ""
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("분배 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 분배 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "D",
    P_DIRECTION: "FW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveD, onSaveErrorD, 2);
}

function onProcessPreD2() {
  var rowCount = G_GRDSUBD.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("분배 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDSUBD.view.getEditorLock().isActive()) {
    G_GRDSUBD.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDSUBD.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      if (rowData.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_XDOCK_DATE: rowData.XDOCK_DATE,
          P_XDOCK_NO: rowData.XDOCK_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_ASN_NO: rowData.ASN_NO,
          P_XDOCK_TYPE: "",
          P_DELIVERY_BATCH: "",
          P_DELIVERY_CD: rowData.DELIVERY_CD,
          P_RDELIVERY_CD: rowData.RDELIVERY_CD
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("분배 취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 분배 취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "D",
    P_DIRECTION: "BW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveD, onSaveErrorD, 2);
}

function onProcessNxtD2() {

  var rowCount = G_GRDSUBD.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("분배 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDSUBD.view.getEditorLock().isActive()) {
    G_GRDSUBD.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDSUBD.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      if (rowData.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_XDOCK_DATE: rowData.XDOCK_DATE,
          P_XDOCK_NO: rowData.XDOCK_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_ASN_NO: rowData.ASN_NO,
          P_XDOCK_TYPE: "",
          P_DELIVERY_BATCH: "",
          P_DELIVERY_CD: rowData.DELIVERY_CD,
          P_RDELIVERY_CD: rowData.RDELIVERY_CD
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("분배 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 분배 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "D",
    P_DIRECTION: "FW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveD, onSaveErrorD, 2);
}

function grdMasterDOnGetColumns() {

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
    id: "XDOCK_STATE_D",
    field: "XDOCK_STATE_D",
    name: "진행상태",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_CD",
    field: "VENDOR_CD",
    name: "공급처",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_TYPE_D",
    field: "XDOCK_TYPE_D",
    name: "처리유형",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "TOT_CONFIRM_QTY",
    field: "TOT_CONFIRM_QTY",
    name: "총수량",
    minWidth: 80,
    cssClass: "align-right"
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
    id: "CAR_NO",
    field: "CAR_NO",
    name: "차량번호",
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
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 분배 마스터 그리드 초기화
 */
function grdMasterDInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterD", {
    columns: grdMasterDOnGetColumns(),
    queryId: "LX02010E.RS_T3_MASTER",
    sortCol: "XDOCK_NO",
    gridOptions: options
  });

  G_GRDMASTERD.view.onSelectedRowsChanged.subscribe(grdMasterDOnAfterScroll);
  G_GRDMASTERD.view.onClick.subscribe(grdMasterDOnClick);
}

function grdMasterDOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERD.lastRow != null) {
    if (row == G_GRDMASTERD.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAILD);
  onGetDetailD({
    data: null
  });

  var rowData = G_GRDMASTERD.data.getItem(row);

  G_GRDDETAILD.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_XDOCK_DATE: rowData.XDOCK_DATE,
    P_XDOCK_NO: rowData.XDOCK_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILD), onGetDetailD);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterD", row + 1);
}

function grdMasterDOnClick(e, args) {

}

function grdDetailDOnGetColumns() {

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
    id: "XDOCK_STATE_D",
    field: "XDOCK_STATE_D",
    name: "진행상태",
    minWidth: 70,
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
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "검수수량",
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
    id: "DISTRIBUTE_BOX",
    field: "DISTRIBUTE_BOX",
    name: "분배BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_EA",
    field: "DISTRIBUTE_EA",
    name: "분배EA",
    minWidth: 70,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailDInitialize() {

  var options = {
    frozenColumn: 7
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailD", {
    columns: grdDetailDOnGetColumns(),
    queryId: "LX02010E.RS_T3_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDDETAILD.view.onSelectedRowsChanged.subscribe(grdDetailDOnAfterScroll);
  G_GRDDETAILD.view.onHeaderClick.subscribe(grdDetailDOnHeaderClick);
  G_GRDDETAILD.view.onClick.subscribe(grdDetailDOnClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDDETAILD, "CHECK_YN");
}

function grdDetailDOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAILD.lastRow != null) {
    if (row == G_GRDDETAILD.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUBD);
  onGetSubD({
    data: null
  });

  var rowData = G_GRDDETAILD.data.getItem(row);

  // 요청 파라미터 셋팅
  G_GRDSUBD.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_XDOCK_DATE: rowData.XDOCK_DATE,
    P_XDOCK_NO: rowData.XDOCK_NO,
    P_LINE_NO: rowData.LINE_NO
  });

  // 디테일 데이터 조회
  $NC.serviceCall("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDSUBD), onGetSubD);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailD", row + 1);
}

function grdDetailDOnHeaderClick(e, args) {

  grdOnHeaderCheckBoxClick(G_GRDDETAILD, e, args);
}

function grdDetailDOnClick(e, args) {

  grdOnCheckBoxClick(G_GRDDETAILD, e, args);
}

function grdSubDOnGetColumns() {

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
    id: "ASN_NO",
    field: "ASN_NO",
    name: "ASN번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_STATE_D",
    field: "XDOCK_STATE_D",
    name: "진행상태",
    minWidth: 70,
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
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_QTY",
    field: "DISTRIBUTE_QTY",
    name: "분배수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_BOX",
    field: "DISTRIBUTE_BOX",
    name: "분배BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_EA",
    field: "DISTRIBUTE_EA",
    name: "분배EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_USER_ID",
    field: "DISTRIBUTE_USER_ID",
    name: "분배사용자ID",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DISTRIBUTE_DATETIME",
    field: "DISTRIBUTE_DATETIME",
    name: "분배일시",
    minWidth: 130,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubDInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSubD", {
    columns: grdSubDOnGetColumns(),
    queryId: "LX02010E.RS_T3_SUB",
    sortCol: "RDELIVERY_CD",
    gridOptions: options
  });

  G_GRDSUBD.view.onSelectedRowsChanged.subscribe(grdSubDOnAfterScroll);
  G_GRDSUBD.view.onHeaderClick.subscribe(grdSubDOnHeaderClick);
  G_GRDSUBD.view.onClick.subscribe(grdSubDOnClick);

  G_GRDSUBD.view.onBeforeEditCell.subscribe(grdSubDOnBeforeEditCell);
  G_GRDSUBD.view.onCellChange.subscribe(grdSubDOnCellChange);

  $NC.setGridColumnHeaderCheckBox(G_GRDSUBD, "CHECK_YN");
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

function grdSubDOnHeaderClick(e, args) {

  grdOnHeaderCheckBoxClick(G_GRDSUBD, e, args);
}

function grdSubDOnClick(e, args) {

  grdOnCheckBoxClick(G_GRDSUBD, e, args);
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
    if ($NC.isNull(rowData.DISTRIBUTE_QTY)) {

      alert("분배수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUBD, {
        selectRow: row,
        activeCell: G_GRDSUBD.view.getColumnIndex("DISTRIBUTE_QTY"),
        editMode: true
      });
      return false;
    } else {

      var DISTRIBUTE_QTY = Number(rowData.DISTRIBUTE_QTY);
      if (DISTRIBUTE_QTY < 1) {
        alert("분배수량이 1보다 작을 수 없습니다.");
        rowData = grdSubDOnCalc(rowData, rowData.INSPECT_QTY);
        G_GRDSUBD.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDSUBD, {
          selectRow: row,
          activeCell: G_GRDSUBD.view.getColumnIndex("DISTRIBUTE_QTY"),
          editMode: true
        });
        return false;
      }

      // 입고등록 수량 허용기준 2 -> 입고예정 수량 초과등록 불가능
      if (Number(rowData.INSPECT_QTY) < DISTRIBUTE_QTY) {
        alert("분배수량이 검수수량을 초과할 수 없습니다.");
        rowData = grdSubDOnCalc(rowData, rowData.INSPECT_QTY);
        G_GRDSUBD.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDSUBD, {
          selectRow: row,
          activeCell: G_GRDSUBD.view.getColumnIndex("DISTRIBUTE_QTY"),
          editMode: true
        });
        return false;
      }

    }
  }

  return true;
}

function grdSubDOnBeforeEditCell(e, args) {

  var rowData = args.item;
  if (args.column.field === "DISTRIBUTE_QTY") {
    if (rowData.XDOCK_STATE != "30") {
      return false;
    }
  }
  return true;
}

function grdSubDOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDSUBD.view.getColumnField(args.cell)) {
  case "DISTRIBUTE_QTY":
    rowData = grdSubDOnCalc(rowData);
    $NC.G_VAR.isErrorD = false;
    var DISTRIBUTE_QTY = Number(rowData.DISTRIBUTE_QTY);
    if (DISTRIBUTE_QTY < 1) {
      alert("분배수량이 1보다 작을 수 없습니다.");
      rowData = grdSubDOnCalc(rowData, rowData.INSPECT_QTY);
      G_GRDSUBD.data.updateItem(rowData.id, rowData);
      $NC.G_VAR.isErrorD = true;
    }

    // 입고등록 수량 허용기준 2 -> 입고예정 수량 초과등록 불가능
    if (Number(rowData.INSPECT_QTY) < DISTRIBUTE_QTY) {
      alert("분배수량이 검수수량을 초과할 수 없습니다.");
      rowData = grdSubDOnCalc(rowData, rowData.INSPECT_QTY);
      G_GRDSUBD.data.updateItem(rowData.id, rowData);
      $NC.G_VAR.isErrorD = true;
    }
    
    // 에러체크
    if ($NC.G_VAR.isErrorD) {
      setTimeout(function() {
        $NC.setGridSelectRow(G_GRDSUBD, {
          selectRow: args.row,
          activeCell: G_GRDSUBD.view.getColumnIndex("DISTRIBUTE_QTY"),
          editMode: true
        });
        $NC.G_VAR.isErrorD = false;
      }, 300);
    }
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUBD.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUBD.lastRowModified = true;
}

function grdSubDOnCalc(rowData, distribute_Qty) {

  if (!$NC.isNull(distribute_Qty)) {
    rowData.DISTRIBUTE_QTY = Number(distribute_Qty);
  }

  rowData.DISTRIBUTE_BOX = $NC.getB_Box(rowData.DISTRIBUTE_QTY, rowData.QTY_IN_BOX);
  rowData.DISTRIBUTE_EA = $NC.getB_Ea(rowData.DISTRIBUTE_QTY, rowData.QTY_IN_BOX);
  rowData.DISTRIBUTE_WEIGHT = $NC.getWeight(rowData.DISTRIBUTE_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);

  var params = {
    ITEM_PRICE: rowData.SUPPLY_PRICE,// 매입단가 또는 공급단가
    APPLY_PRICE: rowData.APPLY_PRICE,// 적용단가
    ITEM_QTY: rowData.DISTRIBUTE_QTY,// 상품수량
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

function onGetMasterD(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERD, ajaxData);
  if (G_GRDMASTERD.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTERD.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTERD, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERD, {
        selectKey: ["XDOCK_DATE", "XDOCK_NO"],
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
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDDETAILD, "CHECK_YN");
  if (G_GRDDETAILD.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAILD.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAILD, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAILD, {
        selectKey: ["BRAND_CD", "ITEM_CD"],
        selectVal: G_GRDDETAILD.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetailD", 0, 0);

    // SUBD 초기화
    $NC.setInitGridVar(G_GRDSUBD);
    onGetSubD({
      data: null
    });
  }
}

function onGetSubD(ajaxData) {

  $NC.setInitGridData(G_GRDSUBD, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDSUBD, "CHECK_YN");
  if (G_GRDSUBD.data.getLength() > 0) {
    if ($NC.isNull(G_GRDSUBD.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSUBD, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSUBD, {
        selectKey: ["DELIVERY_CD"],
        selectVal: G_GRDSUBD.lastKeyVal
      });
    }
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

  var lastKeyValMaster = $NC.getGridLastKeyVal(G_GRDMASTERD, {
    selectKey: ["XDOCK_DATE", "XDOCK_NO"]
  });
  var lastKeyValDetail = $NC.getGridLastKeyVal(G_GRDDETAILD, {
    selectKey: ["BRAND_CD", "ITEM_CD"]
  });
  var lastKeyValSub = $NC.getGridLastKeyVal(G_GRDSUBD, {
    selectKey: ["DELIVERY_CD"]
  });
  _Inquiry();
  G_GRDMASTERD.lastKeyVal = lastKeyValMaster;
  G_GRDDETAILD.lastKeyVal = lastKeyValDetail;
  G_GRDSUBD.lastKeyVal = lastKeyValSub;
}

function onSaveErrorD(ajaxData) {

  $NC.onError(ajaxData);
  setMasterSummaryInfo();
}