/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    carChangeType: "",
    onDockInfoViewTimeout: null,
    printOptions: [{
      PRINT_INDEX: 0,
      PRINT_COMMENT: "출하지시서"
    }],
    saveDockNo: ""
  });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();
  grdSubInitialize();
  grdDockMasterInitialize();

  $NC.setInitDatePicker("#dtpQOutbound_Date");

  // 조회조건 - 물류센터 초기화
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CSUSERCENTER",
    P_QUERY_PARAMS: $NC.getParams({
      P_USER_ID: $NC.G_USERINFO.USER_ID,
      P_CENTER_CD: "%"
    })
  }, {
    selector: "#cboQCenter_Cd",
    codeField: "CENTER_CD",
    nameField: "CENTER_NM",
    onComplete: function() {
      $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
      // 출고차수 콤보 값 설정
      refreshDeliveryBatchCombo();
    }
  });

  // 버튼 이벤트 연결
  $("#btnChangeDock_Dock").click(showDockMasterOverlay); // 도크변경
  $("#btnChangeDock_Outbound").click(showDockMasterOverlay); // 배송처별 도크변경
  $("#btnChangeDock_Delivery").click(showDockMasterOverlay); // 도크 미지정 배송처에 도크 설정
  $("#btnDockSelect").click(function(e) {
    grdDockMasterOnDblClick(e, G_GRDDOCKMASTER.view.getActiveCell());
  });

  // 출고확정의 출고차수 다시보기 이미지 클릭시 처리
  $("#btnQDelivery_Batch").click(function() {
    // 출고차수 콤보 값 설정
    refreshDeliveryBatchCombo();
  });

  // 프로그램 권한 설정
  setUserProgramPermission();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {

  // 스플리터 초기화
  $NC.setInitSplitter("#divMasterView", "v", 500);
  $NC.setInitSplitter("#divSubViewDetail", "h", 350);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.carMasterViewWidth = 400;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.detailInfoViewHeight = $("#divSubViewInfoS").outerHeight();
  $NC.G_OFFSET.masterInfoViewHeight = $("#divSubViewInfoM").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  var container = $("#divMasterView");
  $NC.resizeContainer(container, clientWidth, clientHeight);

  clientHeight -= $NC.G_LAYOUT.border1;

  var masterOffset = container.children("div:first").width();

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", masterOffset, $("#grdMaster").parent().height() - $NC.G_OFFSET.masterInfoViewHeight
      - $NC.G_LAYOUT.header - 1);

  var container = $("#divSubViewDetail");
  clientWidth = container.width();

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, $("#grdDetail").parent().height() - $NC.G_LAYOUT.header
      - $NC.G_OFFSET.detailInfoViewHeight - 1);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdSub", clientWidth, $("#grdSub").parent().height() - $NC.G_LAYOUT.header
      - $NC.G_OFFSET.detailInfoViewHeight - 1);
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();
  // 사업부 Key 입력
  switch (id) {
  case "CENTER_CD":
    refreshDeliveryBatchCombo();
    break;
  case "OUTBOUND_DATE":
    $NC.setValueDatePicker(view, val, "출고일자를 정확히 입력하십시오.");
    refreshDeliveryBatchCombo();
    break;
  case "DELIVERY_BATCH":
    break;
  }

  onChangingCondition();
}

function onChangingCondition() {

  $NC.setInitGridData(G_GRDMASTER);
  $NC.setGridDisplayRows("#grdMaster", 0, 0);

  $NC.setInitGridData(G_GRDDETAIL);
  $NC.setGridDisplayRows("#grdDetail", 0, 0);

  $NC.setInitGridData(G_GRDSUB);
  $NC.setGridDisplayRows("#grdSub", 0, 0);

  $NC.setInitGridData(G_GRDDOCKMASTER);
  $NC.setGridDisplayRows("#grdDockMaster", 0, 0);

  // 수량정보 필드 readOnly
  $NC.setValue("#edtDetail_Plt", "0");
  $NC.setValue("#edtDetail_Box", "0");
  $NC.setValue("#edtDetail_Weight", "0");
  $NC.setValue("#edtDetail_Cbm", "0");

  $NC.setValue("#edtSub_Plt", "0");
  $NC.setValue("#edtSub_Box", "0");
  $NC.setValue("#edtSub_Weight", "0");
  $NC.setValue("#edtSub_Cbm", "0");

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("출고일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date");
    return;
  }

  var DELIVERY_BATCH = $NC.getValue("#cboQDelivery_Batch");
  if ($NC.isNull(DELIVERY_BATCH)) {
    alert("배송차수를 선택하십시오.");
    $NC.setFocus("#cboQDelivery_Batch");
    return;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_OUTBOUND_DATE: OUTBOUND_DATE,
    P_DELIVERY_BATCH: DELIVERY_BATCH,
  });

  // 데이터 조회
  $NC.serviceCall("/LD02010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDOCKMASTER);

  G_GRDDOCKMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LD02010E/getDataSet.do", $NC.getGridParams(G_GRDDOCKMASTER), onGetDockMaster);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUB);

  G_GRDSUB.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_OUTBOUND_DATE: OUTBOUND_DATE,
    P_DELIVERY_BATCH: DELIVERY_BATCH
  });

  // 데이터 조회
  $NC.serviceCall("/LD02010E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("출고일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date");
    return;
  }

  var DELIVERY_BATCH = $NC.getValue("#cboQDelivery_Batch");
  if ($NC.isNull(DELIVERY_BATCH)) {
    alert("배송차수를 선택하십시오.");
    $NC.setFocus("#cboQDelivery_Batch");
    return;
  }

  var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
  var DELIVERY_BATCH_F = $NC.getValueCombo("#cboQDelivery_Batch", "F");

  var checkedValueDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHK_YN == "Y") {
      checkedValueDS.push(rowData.DOCK_NO);
    }
  }
  if (checkedValueDS.length == 0) {
    alert("출력할 데이터를 선택하십시오.");
    return;
  }

  var printOptions = {
    reportDoc: "ld/PAPER_LD02",
    queryId: "WR.RS_PAPER_LD02",
    queryParams: {
      P_CENTER_CD: CENTER_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_P_DELIVERY_BATCH: DELIVERY_BATCH,
      P_CENTER_CD_F: CENTER_CD_F,
      P_DELIVERY_BATCH_F: DELIVERY_BATCH_F
    },
    checkedValue: checkedValueDS.toString()

  };

  $NC.G_MAIN.showPrintPreview(printOptions);
}

/**
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          grid, row, cell, val
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

  var grdObject = $NC.getGridGlobalVar(args.grid);

  if (grdObject.view.getEditorLock().isActive()) {
    grdObject.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(grdObject, args.row);

  var rowData = grdObject.data.getItem(args.row);

  if (args.cell == grdObject.view.getColumnIndex("CHK_YN")) {
    rowData.CHK_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  grdObject.data.updateItem(rowData.id, rowData);

  // 수량정보 세팅.
  setSummaryInfo(args.grid, rowData.CHK_YN, args.row);

  // 마지막 선택 Row 수정 상태로 변경
  grdObject.lastRowModified = true;
}

/**
 * 수량정보 세팅
 */
function setSummaryInfo(grdSelector, checkValue, row) {

  var grdObject = $NC.getGridGlobalVar(grdSelector);
  var rowData = grdObject.data.getItem(row);
  var viewPrefix = "#edt" + grdSelector.replace("#", "").substr(3);

  var sumPlt = Number($NC.getValue(viewPrefix + "_Plt"));
  var sumBox = Number($NC.getValue(viewPrefix + "_Box"));
  var sumWeight = Number($NC.getValue(viewPrefix + "_Weight"));
  var sumCbm = Number($NC.getValue(viewPrefix + "_Cbm"));

  if (checkValue === "Y") {
    sumPlt += Number(rowData.SUM_PLT);
    sumBox += Number(rowData.SUM_BOX);
    sumWeight += Number(rowData.SUM_WEIGHT);
    sumCbm += Number(rowData.SUM_CBM);
  } else {
    sumPlt -= Number(rowData.SUM_PLT);
    sumBox -= Number(rowData.SUM_BOX);
    sumWeight -= Number(rowData.SUM_WEIGHT);
    sumCbm -= Number(rowData.SUM_CBM);

  }
  $NC.setValue(viewPrefix + "_Plt", Math.round(sumPlt * 1000) / 1000);
  $NC.setValue(viewPrefix + "_Box", Math.round(sumBox * 1000) / 1000);
  $NC.setValue(viewPrefix + "_Weight", Math.round(sumWeight * 1000) / 1000);
  $NC.setValue(viewPrefix + "_Cbm", Math.round(sumCbm * 1000) / 1000);
}

/**
 * 물류센터/사업부/출고일자 값 변경시 출고차수 콤보 재설정
 */
function refreshDeliveryBatchCombo() {

  // 조회조건 - 출고차수 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_DELIVERY_BATCH",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
      P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date")
    })
  }, {
    selector: "#cboQDelivery_Batch",
    codeField: "DELIVERY_BATCH",
    nameField: "DELIVERY_BATCH",
    fullNameField: "DELIVERY_BATCH_F"
  });
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHK_YN",
    field: "CHK_YN",
    minWidth: 40,
    maxWidth: 40,
    resizable: false,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "DOCK_NO",
    field: "DOCK_NO",
    name: "도크번호",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "KEEP_DIV_D",
    field: "KEEP_DIV_D",
    name: "접안차량구분",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "MAX_TON_DIV_D",
    field: "MAX_TON_DIV_D",
    name: "최대접안톤구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CALL_CNT",
    field: "CALL_CNT",
    name: "콜수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUM_PLT",
    field: "SUM_PLT",
    name: "총PLT",
    minWidth: 70,
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUM_BOX",
    field: "SUM_BOX",
    name: "총BOX",
    minWidth: 70,
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 1,
    specialRow: {
      compareKey: "CALL_CNT",
      compareVal: "0",
      compareOperator: ">",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LD02010E.RS_MASTER",
    sortCol: "DOCK_NO",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHK_YN");
}

function grdMasterOnHeaderClick(e, args) {

  if (args.column.id == "CHK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDMASTER.view.getEditorLock().isActive() && !G_GRDMASTER.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDMASTER.data.getLength();
      var rowData;
      G_GRDMASTER.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDMASTER.data.getItem(row);

        if (rowData.CHK_YN !== checkVal) {
          rowData.CHK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDMASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTER.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDMASTER.data.getItem(row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL);
  onGetDetail({
    data: null
  });

  G_GRDDETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
    P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
    P_DOCK_NO: rowData.DOCK_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LD02010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHK_YN",
    field: "CHK_YN",
    minWidth: 40,
    maxWidth: 40,
    resizable: false,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "AREA_CD",
    field: "AREA_CD",
    name: "권역",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "AREA_NM",
    field: "AREA_NM",
    name: "권역명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CAR_CD",
    field: "CAR_CD",
    name: "차량",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "CAR_NM",
    field: "CAR_NM",
    name: "차량명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "사업부",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업부명",
    minWidth: 120
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
    id: "SUM_PLT",
    field: "SUM_PLT",
    name: "PLT수량",
    minWidth: 70,
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUM_BOX",
    field: "SUM_BOX",
    name: "BOX수량",
    minWidth: 70,
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ZIP_CD",
    field: "ZIP_CD",
    name: "우편번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_NM",
    field: "ADDR_NM",
    name: "주소",
    minWidth: 250
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailInitialize() {

  var options = {
    frozenColumn: 5
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "LD02010E.RS_DETAIL",
    sortCol: "DELIVERY_CD",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onHeaderClick.subscribe(grdDetailOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDDETAIL, "CHK_YN");
}

function grdDetailOnHeaderClick(e, args) {

  if (args.column.id == "CHK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDDETAIL.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDDETAIL.view.getEditorLock().isActive() && !G_GRDDETAIL.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDDETAIL.data.getLength();
      var rowData;
      G_GRDDETAIL.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDDETAIL.data.getItem(row);

        if (rowData.CHK_YN !== checkVal) {
          rowData.CHK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDDETAIL.data.updateItem(rowData.id, rowData);

          // 수량정보 세팅.
          setSummaryInfo("#grdDetail", checkVal, row);
        }

      }
      G_GRDDETAIL.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdDetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL.lastRow != null) {
    if (row == G_GRDDETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

function grdSubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHK_YN",
    field: "CHK_YN",
    minWidth: 40,
    maxWidth: 40,
    resizable: false,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "AREA_CD",
    field: "AREA_CD",
    name: "권역",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "AREA_NM",
    field: "AREA_NM",
    name: "권역명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CAR_CD",
    field: "CAR_CD",
    name: "차량",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "CAR_NM",
    field: "CAR_NM",
    name: "차량명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "사업부",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업부명",
    minWidth: 120
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
    id: "SUM_PLT",
    field: "SUM_PLT",
    name: "PLT수량",
    minWidth: 70,
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUM_BOX",
    field: "SUM_BOX",
    name: "BOX수량",
    minWidth: 70,
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ZIP_CD",
    field: "ZIP_CD",
    name: "우편번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_NM",
    field: "ADDR_NM",
    name: "주소",
    minWidth: 250
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdSubInitialize() {

  var options = {
    frozenColumn: 5
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: "LD02010E.RS_SUB",
    sortCol: "DELIVERY_CD",
    gridOptions: options
  });

  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
  G_GRDSUB.view.onHeaderClick.subscribe(grdSubOnHeaderClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDSUB, "CHK_YN");
}

function grdSubOnHeaderClick(e, args) {

  if (args.column.id == "CHK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDSUB.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDSUB.view.getEditorLock().isActive() && !G_GRDSUB.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDSUB.data.getLength();
      var rowData;
      G_GRDSUB.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDSUB.data.getItem(row);

        if (rowData.CHK_YN !== checkVal) {
          rowData.CHK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDSUB.data.updateItem(rowData.id, rowData);

          // 수량정보 세팅.
          setSummaryInfo("#grdSub", checkVal, row);
        }
      }
      G_GRDSUB.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdSubOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUB.lastRow != null) {
    if (row == G_GRDSUB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub", row + 1);
}

function grdDockMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DOCK_NO",
    field: "DOCK_NO",
    name: "도크번호",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "KEEP_DIV_D",
    field: "KEEP_DIV_D",
    name: "접안차량구분",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "MAX_TON_DIV_D",
    field: "MAX_TON_DIV_D",
    name: "최대접안톤구분",
    minWidth: 100
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDockMasterInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDockMaster", {
    columns: grdDockMasterOnGetColumns(),
    queryId: "LD02010E.RS_SUB1",
    sortCol: "DOCK_NO",
    gridOptions: options
  });

  G_GRDDOCKMASTER.view.onSelectedRowsChanged.subscribe(grdDockMasterOnAfterScroll);
  G_GRDDOCKMASTER.view.onDblClick.subscribe(grdDockMasterOnDblClick);

  var divDockInfoView = $("#divDockInfoView");
  divDockInfoView.children().click(function(e) {
    G_GRDDOCKMASTER.view.focus();
  });
  var grdDockMaster = $("#grdDockMaster");
  grdDockMaster.find("div.grid-focus").blur(function(e) {
    clearTimeout($NC.G_VAR.onDockInfoViewTimeout);
    $NC.G_VAR.onDockInfoViewTimeout = setTimeout(function() {
      divDockInfoView.hide("fast", function() {
        divDockInfoView.css({
          "display": "none"
        });
      });
    }, 1000);
  });
  grdDockMaster.find("div.grid-focus,div.grid-canvas,div.slick-viewport").focus(function(e) {
    clearTimeout($NC.G_VAR.onDockInfoViewTimeout);
  });
}

function grdDockMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDOCKMASTER.lastRow != null) {
    if (row == G_GRDDOCKMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDockMaster", row + 1);
}

function grdDockMasterOnDblClick(e, args) {

  var rowData = G_GRDDOCKMASTER.data.getItem(args.row);
  if (rowData) {
    $("#divDockInfoView").hide();
    var grdObject;
    switch ($NC.G_VAR.carChangeType) {
    case "1":
      grdObject = G_GRDMASTER;
      break;
    case "2":
      grdObject = G_GRDDETAIL;
      break;
    case "3":
      grdObject = G_GRDSUB;
      break;
    }
    if (!$NC.isNull(grdObject)) {
      changeDock(grdObject, rowData.DOCK_NO, $NC.G_VAR.carChangeType);
    }
  }
}

/**
 * 도크마스터 데이터 필터 - 현재 선택한 도크 제외
 */
function grdDockMasterOnFilter(item) {

  if ($.isArray(G_GRDDOCKMASTER.lastFilterVal)) {
    var canDisplay = true;
    for ( var i in G_GRDDOCKMASTER.lastFilterVal) {
      if (G_GRDDOCKMASTER.lastFilterVal[i] == item.DOCK_NO) {
        canDisplay = false;
        break;
      }
    }
    return canDisplay;
  } else {
    return G_GRDDOCKMASTER.lastFilterVal != item.DOCK_NO;
  }
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHK_YN");

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "DOCK_NO",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }

  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
    
    // 디테일 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    onGetDetail({
      data: null
    });
  }
  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "1";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  // 체크 컬럼 헤더 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDDETAIL, "CHK_YN");

  if (G_GRDDETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
}

function onGetSub(ajaxData) {

  $NC.setInitGridData(G_GRDSUB, ajaxData);
  // 체크 컬럼 헤더 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDSUB, "CHK_YN");

  if (G_GRDSUB.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDSUB, 0);
  } else {
    $NC.setGridDisplayRows("#grdSub", 0, 0);
  }
}

function onGetDockMaster(ajaxData) {

  $NC.setInitGridData(G_GRDDOCKMASTER, ajaxData, grdDockMasterOnFilter);

  if (G_GRDDOCKMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDOCKMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDOCKMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDOCKMASTER, {
        selectKey: "DOCK_NO",
        selectVal: G_GRDDOCKMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDockMaster", 0, 0);
  }
}

function onSave(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "DOCK_NO"
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = ($NC.isNull($NC.G_VAR.saveDockNo) ? lastKeyVal : $NC.G_VAR.saveDockNo);
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}

/**
 * 도크변경조정
 * 
 * @param grdObject
 *          대상 그리드
 * @param dock_No
 *          변경할 도크번호
 * @param changeType
 *          변경타입 (1: 도크단위, 2: 지정 배송처, 3: 미지정 배송처)
 */
function changeDock(grdObject, dock_No, changeType) {

  // 현재 수정모드면
  if (grdObject.view.getEditorLock().isActive()) {
    grdObject.view.getEditorLock().commitCurrentEdit();
  }

  var saveDS = [ ];
  var rowCount = grdObject.data.getLength();
  var row, rowData, saveData;
  
  // 도크
  if (changeType == "1") {
    for ( row = 0; row < rowCount; row++) {
      rowData = grdObject.data.getItem(row);
      if (rowData.CRUD !== "R" && rowData.CHK_YN === "Y") {
        if (rowData.DOCK_NO === dock_No) {
          alert("같은 도크번호로 변경 할 수 없습니다.");
          return;
        }
        if (Number(rowData.CALL_CNT) > 0) {
          saveData = {
            P_CENTER_CD: rowData.CENTER_CD,
            P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
            P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
            P_DOCK_NO: ($NC.isNull(rowData.DOCK_NO) ? "" : rowData.DOCK_NO),
            P_NEW_DOCK_NO: dock_No,
            P_CRUD: rowData.CRUD
          };
          saveDS.push(saveData);
        }
      }
    }
  } else if (changeType >= "2") {
    for (row = 0; row < rowCount; row++) {
      rowData = grdObject.data.getItem(row);
      if (rowData.CRUD !== "R" && rowData.CHK_YN === "Y") {
        if (rowData.DOCK_NO === dock_No) {
          alert("같은 도크번호로 변경 할 수 없습니다.");
          return;
        }
        saveData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_OUTBOUND_NO: rowData.OUTBOUND_NO,
          P_CAR_CD: rowData.CAR_CD,
          P_DOCK_NO: ($NC.isNull(rowData.DOCK_NO) ? "" : rowData.DOCK_NO),
          P_NEW_DOCK_NO: dock_No,
          P_CRUD: rowData.CRUD
        };
        saveDS.push(saveData);
      }
    }
  }

  $NC.G_VAR.saveDockNo = dock_No;

  if (saveDS.length == 0) {
    alert("도크 변경할 데이터를 선택하십시오.");
    return;
  }

  $NC.serviceCall("/LD02010E/save.do", {
    P_DS_MASTER: $NC.toJson(saveDS),
    P_CHANGE_TYPE: changeType,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError);
}

function showDockMasterOverlay(e) {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("도크 변경할 데이터가 없습니다.");
    return;
  }

  clearTimeout($NC.G_VAR.onDockInfoViewTimeout);
  var divDockInfoView = $("#divDockInfoView").hide();

  var view = $(e.target);
  switch (view[0].id) {
  case "btnChangeDock_Dock":
    $NC.G_VAR.carChangeType = "1";

    var rows = $NC.getGridSearchRows(G_GRDMASTER, {
      searchKey: "CHK_YN",
      searchVal: "Y"
    });
    if (rows.length > 1) {
      var result = confirm("여러 도크번호를 다른 도크번호로 변경하시겠습니까?");
      if (!result) {
        return;
      }
    }

    break;
  case "btnChangeDock_Outbound":
    $NC.G_VAR.carChangeType = "2";
    break;
  case "btnChangeDock_Delivery":
    $NC.G_VAR.carChangeType = "3";
    break;
  }

  var rowData;
  if ($NC.G_VAR.carChangeType != "3") {
    rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    G_GRDDOCKMASTER.lastFilterVal = rowData.DOCK_NO;
  } else {
    var rowCount = G_GRDMASTER.data.getLength();
    G_GRDDOCKMASTER.lastFilterVal = [ ];
    for ( var i = 0; i < rowCount; i++) {
      rowData = G_GRDMASTER.data.getItem(i);
      if (rowData.CHK_YN == "Y") {
        G_GRDDOCKMASTER.lastFilterVal.push(rowData.DOCK_NO);
      }
    }
  }
  G_GRDDOCKMASTER.data.refresh();
  if (G_GRDDOCKMASTER.data.getLength() == 0) {
    alert("지정 가능한 도크가 없습니다.");
    return;
  }

  var offset = view.offset();
  var clientHeight = Math.max((G_GRDDOCKMASTER.data.getLength() + 1) * 25 + $NC.G_LAYOUT.header
      + $NC.G_LAYOUT.scroll.height + 1, 200);
  if (clientHeight > $(window).height() - 100) {
    clientHeight = $(window).height() - 100;
  }
  divDockInfoView.css({
    "position": "absolute",
    "top": offset.top + clientHeight > $(window).height() ? $(window).height() - clientHeight - $NC.G_LAYOUT.header
        : offset.top,
    "left": offset.left + view.outerWidth(),
    "z-index": 1000,
    "width": $NC.G_OFFSET.carMasterViewWidth,
    "height": clientHeight
  });

  G_GRDDOCKMASTER.view.resetActiveCell();
  divDockInfoView.show("fast", function() {
    G_GRDDOCKMASTER.view.focus();
    $NC.resizeGrid("#grdDockMaster", $NC.G_OFFSET.carMasterViewWidth, clientHeight - $NC.G_LAYOUT.header);
    G_GRDDOCKMASTER.view.invalidate();
    $NC.setGridSelectRow(G_GRDDOCKMASTER, 0);
  });
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();

  // 저장
  $NC.setEnable("#btnChangeDock_Dock", permission.canSave);
  $NC.setEnable("#btnChangeDock_Outbound", permission.canSave);
  $NC.setEnable("#btnChangeDock_Delivery", permission.canSave);
}