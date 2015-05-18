function inquiryB(con) {

  if ($NC.isNull(con.ORDER_DATE1)) {
    alert("예정일자를 입력하십시오.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }

  if (con.ORDER_DATE1 > con.ORDER_DATE2) {
    alert("검색 예정일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQOrder_Date1");
    return;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTERB);

  G_GRDMASTERB.queryParams = $NC.getParams({
    P_CENTER_CD: con.CENTER_CD,
    P_BU_CD: con.BU_CD,
    P_XDOCK_DATE: con.XDOCK_DATE,
    P_ORDER_DATE1: con.ORDER_DATE1,
    P_ORDER_DATE2: con.ORDER_DATE2,
    P_BU_NO: con.BU_NO,
    P_VENDOR_CD: con.VENDOR_CD,
    P_BRAND_CD: con.BRAND_CD,
    P_ITEM_CD: con.ITEM_CD,
    P_ITEM_NM: con.ITEM_NM,
    P_STATE_PRE_YN: con.STATE_PRE_YN,
    P_STATE_CUR_YN: con.STATE_CUR_YN
  });

  // 데이터 조회
  $NC.serviceCall("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERB), onGetMasterB);
}

function saveB(saveDS) {

}

function onProcessPreB() {

  var rowCount = G_GRDMASTERB.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("등록 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDMASTERB.view.getEditorLock().isActive()) {
    G_GRDMASTERB.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERB.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 출고등록 상태인 전표만 대상
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
    alert("등록 취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 등록 취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "B",
    P_DIRECTION: "BW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveB, onSaveErrorB, 2);
}

function onProcessNxtB() {

  var rowCount = G_GRDMASTERB.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("등록 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDMASTERB.view.getEditorLock().isActive()) {
    G_GRDMASTERB.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERB.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 예정 상태인 전표만 대상 "10"
      if (rowData.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_XDOCK_DATE: rowData.ORDER_DATE,
          P_XDOCK_NO: rowData.ORDER_NO,
          P_LINE_NO: "",
          P_ASN_NO: "",
          P_XDOCK_TYPE: "",
          P_DELIVERY_BATCH: "",
          P_DELIVERY_CD: "",
          P_RDELIVERY_CD: "",
          P_XDOCK_DATE_P: $NC.getValue("#dtpQXDock_Date")
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("등록 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 등록 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LX02010E/callLXProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "B",
    P_DIRECTION: "FW",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveB, onSaveErrorB, 2);
}

function grdMasterBOnGetColumns() {

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
    id: "TOT_ENTRY_QTY",
    field: "TOT_ENTRY_QTY",
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
    id: "CAR_CD",
    field: "CAR_CD",
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
function grdMasterBInitialize() {

  var options = {
    frozenColumn: 6
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterB", {
    columns: grdMasterBOnGetColumns(),
    queryId: "LX02010E.RS_T1_MASTER",
    sortCol: "XDOCK_NO",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDMASTERB.view.onSelectedRowsChanged.subscribe(grdMasterBOnAfterScroll);
  G_GRDMASTERB.view.onHeaderClick.subscribe(grdMasterBOnHeaderClick);
  G_GRDMASTERB.view.onClick.subscribe(grdMasterBOnClick);
  G_GRDMASTERB.view.onDblClick.subscribe(grdMasterBOnDblClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERB, "CHECK_YN");
}

function grdMasterBOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERB.lastRow != null) {
    if (row == G_GRDMASTERB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAILB);
  onGetDetailB({
    data: null
  });

  var rowData = G_GRDMASTERB.data.getItem(row);

  G_GRDDETAILB.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_ORDER_DATE: rowData.ORDER_DATE,
    P_ORDER_NO: rowData.ORDER_NO,
    P_XDOCK_DATE: rowData.XDOCK_DATE,
    P_XDOCK_NO: rowData.XDOCK_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILB), onGetDetailB);

  // 디테일 그리드 컬럼타이틀 변경
  if (rowData.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
    G_GRDDETAILB.view.updateColumnHeader("ENTRY_BOX", "등록BOX");
    G_GRDDETAILB.view.updateColumnHeader("ENTRY_EA", "등록EA");
    G_GRDDETAILB.view.updateColumnHeader("ENTRY_WEIGHT", "등록중량");
  } else {
    G_GRDDETAILB.view.updateColumnHeader("ENTRY_BOX", "예정BOX");
    G_GRDDETAILB.view.updateColumnHeader("ENTRY_EA", "예정EA");
    G_GRDDETAILB.view.updateColumnHeader("ENTRY_WEIGHT", "예정중량");
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterB", row + 1);
}

function grdMasterBOnHeaderClick(e, args) {

  grdOnHeaderCheckBoxClick(G_GRDMASTERB, e, args);
}

function grdMasterBOnClick(e, args) {

  grdOnCheckBoxClick(G_GRDMASTERB, e, args);
}

function grdMasterBOnDblClick(e, args) {

  var masterRowData = G_GRDMASTERB.data.getItem(args.row);
  if (!masterRowData) {
    return;
  }

  // 예정이 아닐경우 리턴
  if (masterRowData.XDOCK_STATE !== $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
    alert("예정 데이터만 수정 가능합니다.")
    return;
  }

  var permission = $NC.getProgramPermission();
  // 저장
  if (!permission.canSave) {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  var PROCESS_CD, XDOCK_DATE, XDOCK_NO;
  // 예정일 경우
  if (masterRowData.XDOCK_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
    PROCESS_CD = "A";
    XDOCK_DATE = masterRowData.ORDER_DATE;
    XDOCK_NO = masterRowData.ORDER_NO;
  } else {
    // 등록일 경우
    PROCESS_CD = "B";
    XDOCK_DATE = masterRowData.XDOCK_DATE;
    XDOCK_NO = masterRowData.XDOCK_NO;
  }
  getXDockState({
    P_CENTER_CD: masterRowData.CENTER_CD,
    P_BU_CD: masterRowData.BU_CD,
    P_XDOCK_DATE: XDOCK_DATE,
    P_XDOCK_NO: XDOCK_NO,
    P_LINE_NO: "",
    P_XDOCK_TYPE: "",
    P_DELIVERY_BATCH: "",
    P_DELIVERY_CD: "",
    P_RDELIVERY_CD: "",
    P_PROCESS_CD: PROCESS_CD, // 프로세스코드([A]예정, [B]등록)
    P_STATE_DIV: "1" // 상태구분([1]MIN, [2]MAX)
  }, function(ajaxData) {

    var resultData = $NC.toArray(ajaxData);
    if (!$NC.isNull(resultData)) {
      if (resultData.O_MSG === "OK") {
        if (masterRowData.XDOCK_STATE !== resultData.O_XDOCK_STATE) {
          alert("[진행상태 : " + resultData.O_XDOCK_STATE + "] 데이터가 변경되었습니다.\n다시 조회 후 데이터를 확인하십시오.");
          return;
        }
      } else {
        alert(resultData.O_MSG);
        return;
      }
    } else {
      alert("진행상태를 확인하지 못했습니다.\n다시 처리하십시오.");
      return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CENTER_CD_F = $("#cboQCenter_Cd option:selected").text();
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    var CUST_CD = $NC.getValue("#edtQCust_Cd");

    $NC.G_MAIN.showProgramSubPopup({
      PROGRAM_ID: "LX02011P",
      PROGRAM_NM: "수정",
      url: "lx/LX02011P.html",
      width: 1024,
      height: 600,
      userData: {
        P_PROCESS_CD: PROCESS_CD,
        P_CENTER_CD: CENTER_CD,
        P_CENTER_CD_F: CENTER_CD_F,
        P_BU_CD: BU_CD,
        P_BU_NM: BU_NM,
        P_CUST_CD: CUST_CD,
        P_POLICY_LI190: $NC.G_VAR.policyVal.LI190,
        P_POLICY_LI210: $NC.G_VAR.policyVal.LI210,
        P_POLICY_LI420: $NC.G_VAR.policyVal.LI420,
        P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
        P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
        P_MASTER_DS: masterRowData,
        P_DETAIL_DS: G_GRDDETAILB.data.getItems()
      },
      onOk: function() {
        _Inquiry();
      }
    });
  });
}

function grdDetailBOnGetColumns(policyLI420) {

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
    id: "ENTRY_USER_ID",
    field: "ENTRY_USER_ID",
    name: "등록사용자ID",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_DATETIME",
    field: "ENTRY_DATETIME",
    name: "등록일시",
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

function grdDetailBInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailB", {
    columns: grdDetailBOnGetColumns(),
    queryId: "LX02010E.RS_T1_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDDETAILB.view.onSelectedRowsChanged.subscribe(grdDetailBOnAfterScroll);
  G_GRDDETAILB.view.onDblClick.subscribe(grdDetailBOnDblClick);

  //G_GRDDETAILB.view.onBeforeEditCell.subscribe(grdDetailBOnBeforeEditCell);
  //G_GRDDETAILB.view.onCellChange.subscribe(grdDetailBOnCellChange);
}

function grdDetailBOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAILB.lastRow != null) {
    if (row == G_GRDDETAILB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdDetailBOnBeforePost(G_GRDDETAILB.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailB", row + 1);
}

function grdDetailBOnBeforePost(row) {

  if (!G_GRDDETAILB.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAILB.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  return true;
}

function grdDetailBOnDblClick(e, args) {

  var rowData = G_GRDDETAILB.data.getItem(args.row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUBB);

  G_GRDSUBB.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_ORDER_DATE: rowData.ORDER_DATE,
    P_ORDER_NO: rowData.ORDER_NO,
    P_XDOCK_DATE: rowData.XDOCK_DATE,
    P_XDOCK_NO: rowData.XDOCK_NO
  });

  // 데이터 조회
  $NC.serviceCallAndWait("/LX02010E/getDataSet.do", $NC.getGridParams(G_GRDSUBB), onGetSubB);

  clearTimeout($NC.G_VAR.onSubBViewTimeout);

  var divSubBView = $("#divSubB");

  if (divSubBView.is(":hidden")) {
    refloatSubLayer(divSubBView, $NC.G_OFFSET.subBWidth, $NC.G_OFFSET.subBHeight);

    G_GRDSUBB.view.resetActiveCell();
    divSubBView.show("fast", function() {
      G_GRDSUBB.view.focus();
      $NC.resizeGrid("#grdSubB", divSubBView.width(), divSubBView.height() - $NC.G_LAYOUT.header);
      G_GRDSUBB.view.invalidate();
      $NC.setGridSelectRow(G_GRDSUBB, 0);
    });
  } else {
    G_GRDSUBB.view.resetActiveCell();
    setTimeout(function() {
      G_GRDSUBB.view.focus();
      G_GRDSUBB.view.invalidate();
      $NC.setGridSelectRow(G_GRDSUBB, 0);
    }, 50);
  }
}

function grdDetailBOnBeforeEditCell(e, args) {

  var rowData = args.item;

  if (args.column.field === "ENTRY_QTY") {
    if (rowData.XDOCK_STATE != "10") {
      return false;
    }
  }
  return true;
}

function grdDetailBOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDDETAILB.view.getColumnField(args.cell)) {
  case "ENTRY_QTY":
    rowData = grdDetailBOnCalc(rowData);
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAILB.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAILB.lastRowModified = true;
}

function grdSubBOnGetColumns() {

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

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdSubBInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSubB", {
    columns: grdSubBOnGetColumns(),
    queryId: "LX02010E.RS_T1_SUB",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDSUBB.view.onSelectedRowsChanged.subscribe(grdSubBOnAfterScroll);

  var divSubBView = $("#divSubB");
  divSubBView.children().click(function(e) {
    G_GRDSUBB.view.focus();
  });
  var grdSubB = $("#grdSubB");
  grdSubB.find("div.grid-focus").blur(function(e) {
    clearTimeout($NC.G_VAR.onSubBViewTimeout);
    $NC.G_VAR.onSubBViewTimeout = setTimeout(function() {
      divSubBView.hide("fast", function() {
        divSubBView.css({
          "display": "none"
        });
      });
    }, 500);
  });
  grdSubB.find("div.grid-focus,div.grid-canvas,div.slick-viewport").focus(function(e) {
    clearTimeout($NC.G_VAR.onSubBViewTimeout);
    G_GRDSUBB.view.focus();
  });
}

function grdSubBOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUBB.lastRow != null) {
    if (row == G_GRDSUBB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSubB", row + 1);
}

function onGetMasterB(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERB, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERB, "CHECK_YN");
  if (G_GRDMASTERB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTERB.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTERB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERB, {
        selectKey: ["ORDER_DATE", "ORDER_NO", "XDOCK_DATE", "XDOCK_NO"],
        selectVal: G_GRDMASTERB.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMasterB", 0, 0);

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDDETAILB);
    onGetDetailB({
      data: null
    });
  }

  // 전표 건수 정보 업데이트
  setMasterSummaryInfo();

  // 공통 버튼 활성화
  setTopButtons();
}

function onGetDetailB(ajaxData) {

  $NC.setInitGridData(G_GRDDETAILB, ajaxData);

  if (G_GRDDETAILB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAILB.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAILB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAILB, {
        selectKey: ["ORDER_DATE", "ORDER_NO", "ORDER_LINE_NO", "XDOCK_DATE", "XDOCK_NO", "LINE_NO"],
        selectVal: G_GRDDETAILB.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetailB", 0, 0);

    // Sub 초기화
    $NC.setInitGridVar(G_GRDSUBB);
    onGetSubB({
      data: null
    });
  }
}

function onGetSubB(ajaxData) {

  $NC.setInitGridData(G_GRDSUBB, ajaxData);

  if (G_GRDSUBB.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDSUBB, 0);
  } else {
    $NC.setGridDisplayRows("#grdSubB", 0, 0);
  }
}

function onSaveB(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }

  var lastKeyValMaster = $NC.getGridLastKeyVal(G_GRDMASTERB, {
    selectKey: ["ORDER_DATE", "ORDER_NO", "XDOCK_DATE", "XDOCK_NO"]
  });
  var lastKeyValDetail = $NC.getGridLastKeyVal(G_GRDMASTERB, {
    selectKey: ["ORDER_DATE", "ORDER_NO", "ORDER_LINE_NO", "XDOCK_DATE", "XDOCK_NO", "LINE_NO"]
  });
  _Inquiry();
  G_GRDMASTERB.lastKeyVal = lastKeyValMaster;
  G_GRDDETAILB.lastKeyVal = lastKeyValDetail;
}

function onSaveErrorB(ajaxData) {

  $NC.onError(ajaxData);
  setMasterSummaryInfo();
}

function grdDetailBOnCalc(rowData, entry_Qty) {

  if (!$NC.isNull(entry_Qty)) {
    rowData.ENTRY_QTY = Number(entry_Qty);
  }

  rowData.ENTRY_BOX = $NC.getB_Box(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
  rowData.ENTRY_EA = $NC.getB_Ea(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
  rowData.ENTRY_WEIGHT = $NC.getWeight(rowData.ENTRY_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);

  var params = {
    ITEM_PRICE: rowData.SUPPLY_PRICE,// 매입단가 또는 공급단가
    APPLY_PRICE: rowData.APPLY_PRICE,// 적용단가
    ITEM_QTY: rowData.ENTRY_QTY,// 상품수량
    ITEM_AMT: rowData.SUPPLY_AMT,// 매입금액 또는 공급금액
    VAT_YN: rowData.VAT_YN,// 과세여부가 NULL일 경우는 부가세금액이 있는지로 체크
    VAT_AMT: rowData.VAT_AMT,// 부가세
    DC_AMT: rowData.DC_AMT,// 할인금액
    TOTAL_AMT: rowData.TOTAL_AMT,// 합계금액
    POLICY_VAL: $NC.G_VAR.policyVal.LI190
  };

  rowData.SUPPLY_AMT = $NC.getItem_Amt(params);
  rowData.VAT_AMT = $NC.getVat_Amt(params);
  rowData.TOTAL_AMT = $NC.getTotal_Amt(params);

  return rowData;
}