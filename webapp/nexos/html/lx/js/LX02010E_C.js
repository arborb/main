function inquiryC(con) {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTERC);

  G_GRDMASTERC.queryParams = $NC.getParams({
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
  $NC.serviceCall("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERC), onGetMasterC);
}

function saveC() {

  var masetrRowData = G_GRDMASTERC.data.getItem(G_GRDMASTERC.lastRow);
  var XDOCK_TYPE = masetrRowData.XDOCK_TYPE;
  var grdObject, process_Cd, beforePostFunc;
  if (XDOCK_TYPE == "1") { // 처리유형 일반
    process_Cd = "C";
    grdObject = G_GRDDETAILC1;
    beforePostFunc = grdDetailC1OnBeforePost;
  } else { // 처리유형 ASN
    process_Cd = "C1";
    grdObject = G_GRDSUBC2;
    beforePostFunc = grdSubC2OnBeforePost;
  }

  // 현재 수정모드면
  if (grdObject.view.getEditorLock().isActive()) {
    grdObject.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (grdObject.lastRow != null) {
    if (!beforePostFunc(grdObject.lastRow)) {
      return;
    }
  }
  
  // onCellChange 이벤트에서 에러 발생했는지 체크
  if($NC.G_VAR.isErrorC) {
    $NC.G_VAR.isErrorC = false;
    return;
  }

  var saveDS = [ ];
  var rowData = {};
  var rowCount = grdObject.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    rowData = grdObject.data.getItem(row);
    // if (rowData.CRUD == "U" && rowData.XDOCK_STATE == $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
    if (rowData.CRUD == "U") {
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_XDOCK_DATE: rowData.XDOCK_DATE,
        P_XDOCK_NO: rowData.XDOCK_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_XDOCK_TYPE: XDOCK_TYPE,
        P_DELIVERY_BATCH: "",
        P_DELIVERY_CD: "",
        P_RDELIVERY_CD: "",
        P_ASN_NO: XDOCK_TYPE == "1" ? "" : rowData.ASN_NO,
        P_INSPECT_QTY: rowData.INSPECT_QTY,
        P_BUY_AMT: XDOCK_TYPE == "1" ? rowData.BUY_AMT : "",
        P_SUPPLY_AMT: XDOCK_TYPE == "1" ? "" : rowData.SUPPLY_AMT,
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
      P_PROCESS_CD: process_Cd,
      P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
      P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSaveC, onSaveErrorE);
  } else {
    alert("저장할 데이터가 없습니다.");
  }
}

function onProcessPreC1() {

  var rowCount = G_GRDMASTERC.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("검수 취소 처리하시겠습니까?");
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
      if (rowData.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_XDOCK_DATE: rowData.XDOCK_DATE,
          P_XDOCK_NO: rowData.XDOCK_NO,
          P_LINE_NO: "",
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
    alert("검수 취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 검수 취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "C",
    P_DIRECTION: "BW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveC, onSaveErrorC, 2);
}

function onProcessNxtC1() {

  var rowCount = G_GRDMASTERC.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("검수 처리하시겠습니까?");
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
      if (rowData.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_XDOCK_DATE: rowData.XDOCK_DATE,
          P_XDOCK_NO: rowData.XDOCK_NO,
          P_LINE_NO: "",
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
    alert("검수 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 검수 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "C",
    P_DIRECTION: "FW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveC, onSaveErrorC, 2);
}

function onProcessPreC2() {

  var rowCount = G_GRDDETAILC1.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("검수 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDDETAILC1.view.getEditorLock().isActive()) {
    G_GRDDETAILC1.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAILC1.data.getItem(row);
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
    alert("검수 취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 검수 취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "C",
    P_DIRECTION: "BW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveC, onSaveErrorC, 2);
}

function onProcessNxtC2() {

  var rowCount = G_GRDDETAILC1.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("검수 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDDETAILC1.view.getEditorLock().isActive()) {
    G_GRDDETAILC1.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAILC1.data.getItem(row);
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
    alert("검수 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 검수 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "C",
    P_DIRECTION: "FW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveC, onSaveErrorC, 2);
}

function onProcessPreC3() {

  var rowCount = G_GRDDETAILC2.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("검수 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDDETAILC2.view.getEditorLock().isActive()) {
    G_GRDDETAILC2.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAILC2.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      if (rowData.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_XDOCK_DATE: rowData.XDOCK_DATE,
          P_XDOCK_NO: rowData.XDOCK_NO,
          P_LINE_NO: "",
          P_ASN_NO: rowData.ASN_NO,
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
    alert("검수 취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 검수 취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "C",
    P_DIRECTION: "BW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveC, onSaveErrorC, 2);
}

function onProcessNxtC3() {

  var rowCount = G_GRDDETAILC2.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("검수 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDDETAILC2.view.getEditorLock().isActive()) {
    G_GRDDETAILC2.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAILC2.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      if (rowData.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_XDOCK_DATE: rowData.XDOCK_DATE,
          P_XDOCK_NO: rowData.XDOCK_NO,
          P_LINE_NO: "",
          P_ASN_NO: rowData.LINE_NO,
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
    alert("검수 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 검수 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "C",
    P_DIRECTION: "FW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveC, onSaveErrorC, 2);
}

function grdMasterCOnGetColumns() {

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
 * 출고등록 마스터 그리드 초기화
 */
function grdMasterCInitialize() {

  var options = {
    frozenColumn: 6
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterC", {
    columns: grdMasterCOnGetColumns(),
    queryId: "LX02010E.RS_T2_MASTER",
    sortCol: "XDOCK_NO",
    gridOptions: options
  });

  G_GRDMASTERC.view.onSelectedRowsChanged.subscribe(grdMasterCOnAfterScroll);
  G_GRDMASTERC.view.onHeaderClick.subscribe(grdMasterCOnHeaderClick);
  G_GRDMASTERC.view.onClick.subscribe(grdMasterCOnClick);
  G_GRDMASTERC.view.onDblClick.subscribe(grdMasterCOnDblClick);

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
  switch (rowData.XDOCK_TYPE) {
  case "1": // 일반

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAILC1);
    onGetDetailC1({
      data: null
    });

    // sub그리드 숨김
    $("#divSubC").show();
    $("#divSplitterC2").hide();

    // 요청 파라미터 셋팅
    G_GRDDETAILC1.queryParams = $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_XDOCK_DATE: rowData.XDOCK_DATE,
      P_XDOCK_NO: rowData.XDOCK_NO
    });

    // 디테일 데이터 조회
    $NC.serviceCall("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILC1), onGetDetailC1);

    break;
  case "2": // ASN

    $NC.setInitGridVar(G_GRDDETAILC2);
    onGetDetailC2({
      data: null
    });

    // sub 그리드 표시
    $("#divSubC").hide();
    $("#divSplitterC2").show();

    // 추가 스플리터 컨트롤
    if ($NC.isSplitter("#divSplitterC2")) {
      $("#divSplitterC2").trigger("resize");
    } else {
      $NC.setInitSplitter("#divSplitterC2", "v", 500);
    }

    // 요청 파라미터 셋팅
    G_GRDDETAILC2.queryParams = $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_XDOCK_DATE: rowData.XDOCK_DATE,
      P_XDOCK_NO: rowData.XDOCK_NO
    });

    // 디테일 데이터 조회
    $NC.serviceCall("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILC2), onGetDetailC2);

    break;
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterC", row + 1);
}

function grdMasterCOnHeaderClick(e, args) {

  grdOnHeaderCheckBoxClick(G_GRDMASTERC, e, args);
}

function grdMasterCOnClick(e, args) {

  grdOnCheckBoxClick(G_GRDMASTERC, e, args);
}

function grdMasterCOnDblClick(e, args) {

}

function grdDetailC1OnGetColumns(policyLI420) {

  if ($NC.isNull(policyLI420)) {
    policyLI420 = "1";
  }

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
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_BOX",
    field: "INSPECT_BOX",
    name: "검수BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_EA",
    field: "INSPECT_EA",
    name: "검수EA",
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
    id: "INSPECT_WEIGHT",
    field: "INSPECT_WEIGHT",
    name: "검수중량",
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
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_USER_ID",
    field: "INSPECT_USER_ID",
    name: "검수사용자ID",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_DATETIME",
    field: "INSPECT_DATETIME",
    name: "검수일시",
    minWidth: 130,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailC1Initialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 7
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailC1", {
    columns: grdDetailC1OnGetColumns(),
    queryId: "LX02010E.RS_T2A_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDDETAILC1.view.onSelectedRowsChanged.subscribe(grdDetailC1OnAfterScroll);
  G_GRDDETAILC1.view.onHeaderClick.subscribe(grdDetailC1OnHeaderClick);
  G_GRDDETAILC1.view.onClick.subscribe(grdDetailC1OnClick);
  G_GRDDETAILC1.view.onDblClick.subscribe(grdDetailC1OnDblClick);

  G_GRDDETAILC1.view.onBeforeEditCell.subscribe(grdDetailC1OnBeforeEditCell);
  G_GRDDETAILC1.view.onCellChange.subscribe(grdDetailC1OnCellChange);

  $NC.setGridColumnHeaderCheckBox(G_GRDDETAILC1, "CHECK_YN");
}

function grdDetailC1OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAILC1.lastRow != null) {
    if (row == G_GRDDETAILC1.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdDetailC1OnBeforePost(G_GRDDETAILC1.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailC1", row + 1);
}

function grdDetailC1OnCalc(rowData, inspect_Qty) {

  if (!$NC.isNull(inspect_Qty)) {
    rowData.INSPECT_QTY = Number(inspect_Qty);
  }

  rowData.INSPECT_BOX = $NC.getB_Box(rowData.INSPECT_QTY, rowData.QTY_IN_BOX);
  rowData.INSPECT_EA = $NC.getB_Ea(rowData.INSPECT_QTY, rowData.QTY_IN_BOX);
  rowData.INSPECT_WEIGHT = $NC.getWeight(rowData.INSPECT_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);

  var params = {
    ITEM_PRICE: rowData.BUY_PRICE,// 매입단가 또는 공급단가
    APPLY_PRICE: rowData.APPLY_PRICE,// 적용단가
    ITEM_QTY: rowData.INSPECT_QTY,// 상품수량
    ITEM_AMT: rowData.BUY_AMT,// 매입금액 또는 공급금액
    VAT_YN: rowData.VAT_YN,// 과세여부가 NULL일 경우는 부가세금액이 있는지로 체크
    VAT_AMT: rowData.VAT_AMT,// 부가세
    DC_AMT: rowData.DC_AMT,// 할인금액
    TOTAL_AMT: rowData.TOTAL_AMT,// 합계금액
    POLICY_VAL: $NC.G_VAR.policyVal.LI190
  };

  rowData.BUY_AMT = $NC.getItem_Amt(params);
  // rowData.SUPPLY_AMT = $NC.getItem_Amt(params);
  rowData.VAT_AMT = $NC.getVat_Amt(params);
  rowData.TOTAL_AMT = $NC.getTotal_Amt(params);

  return rowData;
}

function grdDetailC1OnHeaderClick(e, args) {

  grdOnHeaderCheckBoxClick(G_GRDDETAILC1, e, args);
}

function grdDetailC1OnClick(e, args) {

  grdOnCheckBoxClick(G_GRDDETAILC1, e, args);
}

function grdDetailC1OnDblClick(e, args) {

  var rowData = G_GRDDETAILC1.data.getItem(args.row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUBC1);

  G_GRDSUBC1.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_XDOCK_DATE: rowData.XDOCK_DATE,
    P_XDOCK_NO: rowData.XDOCK_NO
  });

  // 데이터 조회
  $NC.serviceCallAndWait("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDSUBC1), onGetSubC1);

  clearTimeout($NC.G_VAR.onSubC1ViewTimeout);

  var divSubC1View = $("#divSubC1");

  if (divSubC1View.is(":hidden")) {

    refloatSubLayer(divSubC1View, $NC.G_OFFSET.subC1Width, $NC.G_OFFSET.subC1Height);

    G_GRDSUBC1.view.resetActiveCell();
    divSubC1View.show("fast", function() {
      G_GRDSUBC1.view.focus();
      $NC.resizeGrid("#grdSubC1", divSubC1View.width(), divSubC1View.height() - $NC.G_LAYOUT.header);
      G_GRDSUBC1.view.invalidate();
      $NC.setGridSelectRow(G_GRDSUBC1, 0);
    });
  } else {
    G_GRDSUBC1.view.resetActiveCell();
    setTimeout(function() {
      G_GRDSUBC1.view.focus();
      G_GRDSUBC1.view.invalidate();
      $NC.setGridSelectRow(G_GRDSUBC1, 0);
    }, 50);
  }
}

function grdDetailC1OnBeforePost(row) {

  if (!G_GRDDETAILC1.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAILC1.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.INSPECT_QTY)) {

      alert("검수수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAILC1, {
        selectRow: row,
        activeCell: G_GRDDETAILC1.view.getColumnIndex("INSPECT_QTY"),
        editMode: true
      });
      return false;
    } else {

      var INSPECT_QTY = Number(rowData.INSPECT_QTY);
      if (INSPECT_QTY < 1) {
        alert("검수수량이 1보다 작을 수 없습니다.");
        rowData = grdDetailC1OnCalc(rowData, rowData.ENTRY_QTY);
        G_GRDDETAILC1.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDDETAILC1, {
          selectRow: row,
          activeCell: G_GRDDETAILC1.view.getColumnIndex("INSPECT_QTY"),
          editMode: true
        });
        return false;
      }

      // 입고등록 수량 허용기준 2 -> 입고예정 수량 초과등록 불가능
      if (Number(rowData.ENTRY_QTY) < INSPECT_QTY) {
        alert("검수수량이 등록수량을 초과할 수 없습니다.");
        rowData = grdDetailC1OnCalc(rowData, rowData.ENTRY_QTY);
        G_GRDDETAILC1.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDDETAILC1, {
          selectRow: row,
          activeCell: G_GRDDETAILC1.view.getColumnIndex("INSPECT_QTY"),
          editMode: true
        });
        return false;
      }
    }
  }

  return true;
}

function grdDetailC1OnBeforeEditCell(e, args) {

  var rowData = args.item;
  if (args.column.field === "INSPECT_QTY") {
    if (rowData.XDOCK_STATE != "20") {
      return false;
    }
  }
  return true;
}

function grdDetailC1OnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDDETAILC1.view.getColumnField(args.cell)) {
  case "INSPECT_QTY":
    rowData = grdDetailC1OnCalc(rowData);
    $NC.G_VAR.isErrorC = false;
    var INSPECT_QTY = Number(rowData.INSPECT_QTY);
    if (INSPECT_QTY < 1) {
      alert("검수수량이 1보다 작을 수 없습니다.");
      rowData = grdDetailC1OnCalc(rowData, rowData.ENTRY_QTY);
      G_GRDDETAILC1.data.updateItem(rowData.id, rowData);
      $NC.G_VAR.isErrorC = true;
    }

    // 입고등록 수량 허용기준 2 -> 입고예정 수량 초과등록 불가능
    if (Number(rowData.ENTRY_QTY) < INSPECT_QTY) {
      alert("검수수량이 등록수량을 초과할 수 없습니다.");
      rowData = grdDetailC1OnCalc(rowData, rowData.ENTRY_QTY);
      G_GRDDETAILC1.data.updateItem(rowData.id, rowData);
      $NC.G_VAR.isErrorC = true;
    }
    
    // 에러체크
    if ($NC.G_VAR.isErrorC) {
      setTimeout(function() {
        $NC.setGridSelectRow(G_GRDDETAILC1, {
          selectRow: args.row,
          activeCell: G_GRDDETAILC1.view.getColumnIndex("INSPECT_QTY"),
          editMode: true
        });
        $NC.G_VAR.isErrorC = false;
      }, 300);
    }   
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAILC1.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAILC1.lastRowModified = true;
}

function grdSubC1OnGetColumns() {

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
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
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

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubC1Initialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSubC1", {
    columns: grdSubC1OnGetColumns(),
    queryId: "LX02010E.RS_T2A_SUB",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDSUBC1.view.onSelectedRowsChanged.subscribe(grdSubC1OnAfterScroll);

  var divSubC1View = $("#divSubC1");
  divSubC1View.children().click(function(e) {
    G_GRDSUBC1.view.focus();
  });
  var grdSubC1 = $("#grdSubC1");
  grdSubC1.find("div.grid-focus").blur(function(e) {
    clearTimeout($NC.G_VAR.onSubC1ViewTimeout);
    $NC.G_VAR.onSubC1ViewTimeout = setTimeout(function() {
      divSubC1View.hide("fast", function() {
        divSubC1View.css({
          "display": "none"
        });
      });
    }, 500);
  });
  grdSubC1.find("div.grid-focus,div.grid-canvas,div.slick-viewport").focus(function(e) {
    clearTimeout($NC.G_VAR.onSubC1ViewTimeout);
    G_GRDSUBC1.view.focus();
  });
}

function grdSubC1OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUBC1.lastRow != null) {
    if (row == G_GRDSUBC1.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSubC1", row + 1);
}

function grdDetailC2OnGetColumns() {

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
    id: "XDOCK_STATE_D",
    field: "XDOCK_STATE_D",
    name: "진행상태",
    minWidth: 70,
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
    id: "ASN_NO",
    field: "ASN_NO",
    name: "ASN번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CNT",
    field: "ITEM_CNT",
    name: "총상품수",
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
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailC2Initialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailC2", {
    columns: grdDetailC2OnGetColumns(),
    queryId: "LX02010E.RS_T2B_DETAIL",
    sortCol: "RDELIVERY_CD",
    gridOptions: options
  });

  G_GRDDETAILC2.view.onSelectedRowsChanged.subscribe(grdDetailC2OnAfterScroll);
  G_GRDDETAILC2.view.onHeaderClick.subscribe(grdDetailC2OnHeaderClick);
  G_GRDDETAILC2.view.onClick.subscribe(grdDetailC2OnClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDDETAILC2, "CHECK_YN");
}

function grdDetailC2OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAILC2.lastRow != null) {
    if (row == G_GRDDETAILC2.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUBC2);
  onGetSubC2({
    data: null
  });

  var rowData = G_GRDDETAILC2.data.getItem(row);

  // 요청 파라미터 셋팅
  G_GRDSUBC2.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_XDOCK_DATE: rowData.XDOCK_DATE,
    P_XDOCK_NO: rowData.XDOCK_NO,
    P_ASN_NO: rowData.ASN_NO
  });

  // 디테일 데이터 조회
  $NC.serviceCall("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDSUBC2), onGetSubC2);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailC2", row + 1);
}

function grdDetailC2OnHeaderClick(e, args) {

  grdOnHeaderCheckBoxClick(G_GRDDETAILC2, e, args);
}

function grdDetailC2OnClick(e, args) {

  grdOnCheckBoxClick(G_GRDDETAILC2, e, args);
}

function grdSubC2OnGetColumns() {

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
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubC2Initialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSubC2", {
    columns: grdSubC2OnGetColumns(),
    queryId: "LX02010E.RS_T2B_SUB",
    sortCol: "XDOCK_NO",
    gridOptions: options
  });

  G_GRDSUBC2.view.onSelectedRowsChanged.subscribe(grdSubC2OnAfterScroll);

  G_GRDSUBC2.view.onBeforeEditCell.subscribe(grdSubC2OnBeforeEditCell);
  G_GRDSUBC2.view.onCellChange.subscribe(grdSubC2OnCellChange);
}

function grdSubC2OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUBC2.lastRow != null) {
    if (row == G_GRDSUBC2.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSubC2", row + 1);
}

function grdSubC2OnBeforePost(row) {

  if (!G_GRDSUBC2.lastRowModified) {
    return true;
  }

  var rowData = G_GRDSUBC2.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.INSPECT_QTY)) {

      alert("검수수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUBC2, {
        selectRow: row,
        activeCell: G_GRDSUBC2.view.getColumnIndex("INSPECT_QTY"),
        editMode: true
      });
      return false;
    } else {

      var INSPECT_QTY = Number(rowData.INSPECT_QTY);
      if (INSPECT_QTY < 1) {
        alert("검수수량이 1보다 작을 수 없습니다.");
        rowData = grdDetailC1OnCalc(rowData, rowData.ENTRY_QTY);
        G_GRDSUBC2.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDSUBC2, {
          selectRow: row,
          activeCell: G_GRDSUBC2.view.getColumnIndex("INSPECT_QTY"),
          editMode: true
        });
        return false;
      }

      // 입고등록 수량 허용기준 2 -> 입고예정 수량 초과등록 불가능
      if (Number(rowData.ENTRY_QTY) < INSPECT_QTY) {
        alert("검수수량이 등록수량을 초과할 수 없습니다.");
        rowData = grdDetailC1OnCalc(rowData, rowData.ENTRY_QTY);
        G_GRDSUBC2.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDSUBC2, {
          selectRow: row,
          activeCell: G_GRDSUBC2.view.getColumnIndex("INSPECT_QTY"),
          editMode: true
        });
        return false;
      }

    }
  }

  return true;
}

function grdSubC2OnCalc(rowData, inspect_Qty) {

  if (!$NC.isNull(inspect_Qty)) {
    rowData.INSPECT_QTY = Number(inspect_Qty);
  }

  rowData.INSPECT_BOX = $NC.getB_Box(rowData.INSPECT_QTY, rowData.QTY_IN_BOX);
  rowData.INSPECT_EA = $NC.getB_Ea(rowData.INSPECT_QTY, rowData.QTY_IN_BOX);
  rowData.INSPECT_WEIGHT = $NC.getWeight(rowData.INSPECT_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);

  var params = {
    ITEM_PRICE: rowData.SUPPLY_PRICE,// 매입단가 또는 공급단가
    APPLY_PRICE: rowData.APPLY_PRICE,// 적용단가
    ITEM_QTY: rowData.INSPECT_QTY,// 상품수량
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

function grdSubC2OnBeforeEditCell(e, args) {

  // var rowData = args.item;
  if (args.column.field === "INSPECT_QTY") {

    var detailC2RowData = G_GRDDETAILC2.data.getItem(G_GRDDETAILC2.lastRow);

    if (detailC2RowData.XDOCK_STATE != "20") {
      return false;
    }
  }
  return true;
}

function grdSubC2OnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDSUBC2.view.getColumnField(args.cell)) {
  case "INSPECT_QTY":
    rowData = grdSubC2OnCalc(rowData);
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUBC2.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUBC2.lastRowModified = true;
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
        selectKey: ["XDOCK_DATE", "XDOCK_NO"],
        selectVal: G_GRDMASTERC.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMasterC", 0, 0);

    // 디테일1 초기화
    $NC.setInitGridVar(G_GRDDETAILC1);
    onGetDetailC1({
      data: null
    });

    // 디테일2 초기화
    $NC.setInitGridVar(G_GRDDETAILC2);
    onGetDetailC2({
      data: null
    });
  }

  // 전표 건수 정보 업데이트
  setMasterSummaryInfo();

  // 공통 버튼 활성화
  setTopButtons();
}

function onGetDetailC1(ajaxData) {

  $NC.setInitGridData(G_GRDDETAILC1, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDDETAILC1, "CHECK_YN");
  if (G_GRDDETAILC1.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAILC1.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAILC1, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAILC1, {
        selectKey: ["XDOCK_DATE", "XDOCK_NO", "LINE_NO"],
        selectVal: G_GRDDETAILC1.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetailC1", 0, 0);

    // SUB1 초기화
    $NC.setInitGridVar(G_GRDSUBC1);
    onGetSubC1({
      data: null
    });
  }
}

function onGetSubC1(ajaxData) {

  $NC.setInitGridData(G_GRDSUBC1, ajaxData);

  if (G_GRDSUBC1.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDSUBC1, 0);
  } else {
    $NC.setGridDisplayRows("#grdSubC1", 0, 0);
  }
}

function onGetDetailC2(ajaxData) {

  $NC.setInitGridData(G_GRDDETAILC2, ajaxData);

  if (G_GRDDETAILC2.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAILC2.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAILC2, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAILC2, {
        selectKey: ["XDOCK_DATE", "XDOCK_NO", "ASN_NO"],
        selectVal: G_GRDDETAILC2.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetailC2", 0, 0);

    // SUB2 초기화
    $NC.setInitGridVar(G_GRDSUBC2);
    onGetSubC2({
      data: null
    });
  }
}

function onGetSubC2(ajaxData) {

  $NC.setInitGridData(G_GRDSUBC2, ajaxData);

  if (G_GRDSUBC2.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDSUBC2, 0);
  } else {
    $NC.setGridDisplayRows("#grdSubC2", 0, 0);
  }
}

function onSaveC(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }

  var lastKeyValMaster = $NC.getGridLastKeyVal(G_GRDMASTERC, {
    selectKey: ["XDOCK_DATE", "XDOCK_NO"]
  });
  var lastKeyValDetail1 = $NC.getGridLastKeyVal(G_GRDDETAILC1, {
    selectKey: ["XDOCK_DATE", "XDOCK_NO", "LINE_NO"]
  });
  var lastKeyValDetail2 = $NC.getGridLastKeyVal(G_GRDDETAILC2, {
    selectKey: ["XDOCK_DATE", "XDOCK_NO", "ASN_NO"]
  });
  _Inquiry();
  G_GRDMASTERC.lastKeyVal = lastKeyValMaster;
  G_GRDDETAILC1.lastKeyVal = lastKeyValDetail1;
  G_GRDDETAILC2.lastKeyVal = lastKeyValDetail2;
}

function onSaveErrorC(ajaxData) {

  $NC.onError(ajaxData);
  setMasterSummaryInfo();
}