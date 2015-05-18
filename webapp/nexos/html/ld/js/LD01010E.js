/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    carChangeType: "",
    onCarInfoViewTimeout: null,
    printOptions: [{
      PRINT_INDEX: 0,
      PRINT_COMMENT: "상차지시서"
    }]
  });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();
  grdSubInitialize();
  grdCarMasterInitialize();

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
  $("#btnChangeCar_Car").click(showCarMasterOverlay); // 차량변경
  $("#btnChangeCar_Outbound").click(showCarMasterOverlay); // 전표단위 차량변경
  $("#btnChangeCar_Line").click(showCarMasterOverlay); // 상품단위 차량변경
  $("#btnSplitOrder").click(onSplitOrder); // 전표분할
  $("#btnCarSelect").click(function(e) {
    grdCarMasterOnDblClick(e, G_GRDCARMASTER.view.getActiveCell());
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

  $NC.setInitGridData(G_GRDCARMASTER);
  $NC.setGridDisplayRows("#grdCarMaster", 0, 0);

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
  $NC.serviceCall("/LD01010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDCARMASTER);

  G_GRDCARMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_CAR_CD: ""
  });

  // 데이터 조회
  $NC.serviceCall("/LD01010E/getDataSet.do", $NC.getGridParams(G_GRDCARMASTER), onGetCarMaster);
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
      checkedValueDS.push(rowData.CAR_CD);
    }
  }
  if (checkedValueDS.length == 0) {
    alert("출력할 데이터를 선택하십시오.");
    return;
  }

  var printOptions = {
    reportDoc: "ld/PAPER_LD01",
    queryId: "WR.RS_PAPER_LD01",
    queryParams: {
      P_CENTER_CD: CENTER_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_DELIVERY_BATCH: DELIVERY_BATCH,
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
    id: "CALL_CNT",
    field: "CALL_CNT",
    name: "콜수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CAR_TON_DIV_D",
    field: "CAR_TON_DIV_D",
    name: "차량톤수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUM_WEIGHT",
    field: "SUM_WEIGHT",
    name: "총중량",
    minWidth: 70,
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CAR_CAPA",
    field: "CAR_CAPA",
    name: "적재용적",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUM_CBM",
    field: "SUM_CBM",
    name: "총CBM",
    minWidth: 70,
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TRANS_DIV_D",
    field: "TRANS_DIV_D",
    name: "운송구분",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CAR_KEEP_DIV_D",
    field: "CAR_KEEP_DIV_D",
    name: "차량보관구분",
    minWidth: 80,
    cssClass: "align-center"
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
  $NC.setGridColumn(columns, {
    id: "SUM_EA",
    field: "SUM_EA",
    name: "총EA",
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
    frozenColumn: 2,
    specialRow: {
      compareKey: "FULL_YN",
      compareVal: "Y",
      compareOperator: "==",
      cssClass: "specialrow3"
    }
};

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LD01010E.RS_MASTER",
    sortCol: "AREA_CD",
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
    P_CAR_CD: rowData.CAR_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LD01010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

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
    id: "DELIVERY_ROUTE",
    field: "DELIVERY_ROUTE",
    name: "배송루트",
    minWidth: 60,
    cssClass: "align-right"
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
    minWidth: 100
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
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_CD",
    field: "RDELIVERY_CD",
    name: "실배송처",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "RDELIVERY_NM",
    field: "RDELIVERY_NM",
    name: "실배송처명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SUM_WEIGHT",
    field: "SUM_WEIGHT",
    name: "중량",
    minWidth: 70,
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUM_CBM",
    field: "SUM_CBM",
    name: "CBM",
    minWidth: 70,
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    cssClass: "align-right"
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
    id: "SUM_EA",
    field: "SUM_EA",
    name: "EA수량",
    minWidth: 70,
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DISTANCE_DIV",
    field: "DISTANCE_DIV",
    name: "거리등급",
    minWidth: 70,
    cssClass: "align-right"
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
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "LD01010E.RS_DETAIL",
    sortCol: "AREA_CD",
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

  var rowData = G_GRDDETAIL.data.getItem(row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUB);
  
  onGetSub({
    data: null
  });

  G_GRDSUB.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
    P_CAR_CD: rowData.CAR_CD,
    P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
    P_DELIVERY_CD: rowData.DELIVERY_CD,
    P_RDELIVERY_CD: rowData.RDELIVERY_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LD01010E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

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
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 40,
    maxWidth: 40,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 200
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
    id: "SUM_WEIGHT",
    field: "SUM_WEIGHT",
    name: "중량",
    minWidth: 70,
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUM_CBM",
    field: "SUM_CBM",
    name: "CBM",
    minWidth: 70,
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    cssClass: "align-right"
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
    id: "SUM_EA",
    field: "SUM_EA",
    name: "EA수량",
    minWidth: 70,
    formatter: Slick.Formatters.Number,
    formatterOptions: {
      numberType: "D"
    },
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BOX_IN_PLT",
    field: "BOX_IN_PLT",
    name: "팔레트입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "박스입수",
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
    id: "BOX_CBM",
    field: "BOX_CBM",
    name: "박스CBM",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "KEEP_DIV_F",
    field: "KEEP_DIV_F",
    name: "보관유형",
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
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 80
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdSubInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: "LD01010E.RS_SUB",
    sortCol: "ITEM_CD",
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

function grdCarMasterOnGetColumns() {

  var columns = [ ];
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

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdCarMasterInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdCarMaster", {
    columns: grdCarMasterOnGetColumns(),
    queryId: "LD01010E.RS_SUB1",
    sortCol: "CAR_CD",
    gridOptions: options
  });

  G_GRDCARMASTER.view.onSelectedRowsChanged.subscribe(grdCarMasterOnAfterScroll);
  G_GRDCARMASTER.view.onDblClick.subscribe(grdCarMasterOnDblClick);

  var divCarInfoView = $("#divCarInfoView");
  divCarInfoView.children().click(function(e) {
    G_GRDCARMASTER.view.focus();
  });
  var grdCarMaster = $("#grdCarMaster");
  grdCarMaster.find("div.grid-focus").blur(function(e) {
    clearTimeout($NC.G_VAR.onCarInfoViewTimeout);
    $NC.G_VAR.onCarInfoViewTimeout = setTimeout(function() {
      divCarInfoView.hide("fast", function() {
        divCarInfoView.css({
          "display": "none"
        });
      });
    }, 1000);
  });
  grdCarMaster.find("div.grid-focus,div.grid-canvas,div.slick-viewport").focus(function(e) {
    clearTimeout($NC.G_VAR.onCarInfoViewTimeout);
  });
}

function grdCarMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDCARMASTER.lastRow != null) {
    if (row == G_GRDCARMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdCarMaster", row + 1);
}

function grdCarMasterOnDblClick(e, args) {

  var rowData = G_GRDCARMASTER.data.getItem(args.row);
  if (rowData) {
    $("#divCarInfoView").hide();
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
      changeCar(grdObject, rowData.CAR_CD, $NC.G_VAR.carChangeType);
    }
  }
}

/**
 * 차량마스터 데이터 필터 - 현재 선택한 차량 제외
 */
function grdCarMasterOnFilter(item) {

  if ($.isArray(G_GRDCARMASTER.lastFilterVal)) {
    var canDisplay = true;
    for ( var i in G_GRDCARMASTER.lastFilterVal) {
      if (G_GRDCARMASTER.lastFilterVal[i] == item.CAR_CD) {
        canDisplay = false;
        break;
      }
    }
    return canDisplay;
  } else {
    return G_GRDCARMASTER.lastFilterVal != item.CAR_CD;
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
        selectKey: "AREA_CD",
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

  // 수량정보 초기화
  $NC.setValue("#edtDetail_Plt", "0");
  $NC.setValue("#edtDetail_Box", "0");
  $NC.setValue("#edtDetail_Weight", "0");
  $NC.setValue("#edtDetail_Cbm", "0");

  if (G_GRDDETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
    
    // 서브 초기화
    $NC.setInitGridVar(G_GRDSUB);
    onGetSub({
      data: null
    });
  }
}

function onGetSub(ajaxData) {

  $NC.setInitGridData(G_GRDSUB, ajaxData);
  // 체크 컬럼 헤더 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDSUB, "CHK_YN");
  // 수량정보 초기화
  $NC.setValue("#edtSub_Plt", "0");
  $NC.setValue("#edtSub_Box", "0");
  $NC.setValue("#edtSub_Weight", "0");
  $NC.setValue("#edtSub_Cbm", "0");

  if (G_GRDSUB.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDSUB, 0);
  } else {
    $NC.setGridDisplayRows("#grdSub", 0, 0);
  }
}

function onGetCarMaster(ajaxData) {

  $NC.setInitGridData(G_GRDCARMASTER, ajaxData, grdCarMasterOnFilter);

  if (G_GRDCARMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDCARMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDCARMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDCARMASTER, {
        selectKey: "CAR_CD",
        selectVal: G_GRDCARMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdCarMaster", 0, 0);
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

  _Inquiry();
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}

/**
 * 전표분할 팝업 호출
 */
function onSplitOrder() {

  if (G_GRDSUB.lastRow == null || G_GRDSUB.data.getLength() === 0) {
    return;
  }

  var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);

  if (rowData.ENTRY_QTY == 1) {
    alert("출고수량이 1인 상품은 분할 할 수 없습니다.");
    return;
  }

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LD01011P",
    PROGRAM_NM: "전표분할",
    url: "ld/LD01011P.html",
    width: 600,
    height: 265,
    userData: {
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
      P_OUTBOUND_NO: rowData.OUTBOUND_NO,
      P_LINE_NO: rowData.LINE_NO,
      P_ITEM_CD: rowData.ITEM_CD,
      P_ITEM_NM: rowData.ITEM_NM,
      P_ITEM_SPEC: rowData.ITEM_SPEC,
      P_ENTRY_QTY: rowData.ENTRY_QTY,
      P_SUB_DS: rowData
    },
    onOk: function() {
      // 조회시 전역 변수 값 초기화
      $NC.setInitGridVar(G_GRDSUB);

      var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
      G_GRDSUB.queryParams = $NC.getParams({
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
        P_CAR_CD: rowData.CAR_CD,
        P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
        P_DELIVERY_CD: rowData.DELIVERY_CD,
        P_RDELIVERY_CD: rowData.RDELIVERY_CD
      });

      // 데이터 조회
      $NC.serviceCall("/LD01010E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
    }
  });
}

/**
 * 차량변경 배차조정
 * 
 * @param grdObject
 *          대상 그리드
 * @param car_Cd
 *          변경할 차량코드
 * @param changeType
 *          변경타입 (1: 차량단위, 2: 배송처단위, 3: 상품단위)
 */
function changeCar(grdObject, car_Cd, changeType) {

  // 현재 수정모드면
  if (grdObject.view.getEditorLock().isActive()) {
    grdObject.view.getEditorLock().commitCurrentEdit();
  }

  var saveDS = [ ];
  var rowCount = grdObject.data.getLength();
  // 차량
  if (changeType == "1") {
    for ( var row = 0; row < rowCount; row++) {
      var rowData = grdObject.data.getItem(row);
      if (rowData.CRUD !== "R" && rowData.CHK_YN === "Y") {
        if (rowData.CAR_CD === car_Cd) {
          alert("같은 차량으로 변경 할 수 없습니다.");
          return;
        }
        var saveData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
          P_CAR_CD: rowData.CAR_CD,
          P_NEW_CAR_CD: car_Cd,
          P_CRUD: rowData.CRUD
        };
        saveDS.push(saveData);
      }
    }
  } else if (changeType == "2") {
    for ( var row = 0; row < rowCount; row++) {
      var rowData = grdObject.data.getItem(row);
      if (rowData.CRUD !== "R" && rowData.CHK_YN === "Y") {
        if (rowData.CAR_CD === car_Cd) {
          alert("같은 차량으로 변경 할 수 없습니다.");
          return;
        }
        var saveData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_DELIVERY_BATCH: rowData.DELIVERY_BATCH,
          P_CAR_CD: rowData.CAR_CD,
          P_CUST_CD: rowData.CUST_CD,
          P_DELIVERY_CD: rowData.DELIVERY_CD,
          P_RDELIVERY_CD: rowData.RDELIVERY_CD,
          P_NEW_CAR_CD: car_Cd,
          P_CRUD: rowData.CRUD
        };
        saveDS.push(saveData);
      }
    }
  } else if (changeType == "3") {
    for ( var row = 0; row < rowCount; row++) {
      var rowData = grdObject.data.getItem(row);
      if (rowData.CRUD !== "R" && rowData.CHK_YN === "Y") {
        if (rowData.CAR_CD === car_Cd) {
          alert("같은 차량으로 변경 할 수 없습니다.");
          return;
        }
        var saveData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_OUTBOUND_NO: rowData.OUTBOUND_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_CAR_CD: rowData.CAR_CD,
          P_NEW_CAR_CD: car_Cd,
          P_CRUD: rowData.CRUD
        };
        saveDS.push(saveData);
      }
    }
  }

  if (saveDS.length == 0) {
    alert("차량 변경할 데이터를 선택하십시오.");
    return;
  }

  $NC.serviceCall("/LD01010E/save.do", {
    P_DS_MASTER: $NC.toJson(saveDS),
    P_CHANGE_TYPE: changeType,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError);
}

function showCarMasterOverlay(e) {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("차량 변경할 데이터가 없습니다.");
    return;
  }

  clearTimeout($NC.G_VAR.onCarInfoViewTimeout);
  var divCarInfoView = $("#divCarInfoView").hide();

  var view = $(e.target);
  switch (view[0].id) {
  case "btnChangeCar_Car":
    $NC.G_VAR.carChangeType = "1";

    var rows = $NC.getGridSearchRows(G_GRDMASTER, {
      searchKey: "CHK_YN",
      searchVal: "Y"
    });
    if (rows.length > 1) {
      result = confirm("여러 대의 차량을 다른 차량으로 변경하시겠습니까?");
      if (!result) {
        return;
      }
    }

    break;
  case "btnChangeCar_Outbound":
    $NC.G_VAR.carChangeType = "2";
    break;
  case "btnChangeCar_Line":
    $NC.G_VAR.carChangeType = "3";
    break;
  }

  var rowData;
  if ($NC.G_VAR.carChangeType != "1") {
    rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    G_GRDCARMASTER.lastFilterVal = rowData.CAR_CD;
  } else {
    var rowCount = G_GRDMASTER.data.getLength();
    G_GRDCARMASTER.lastFilterVal = [ ];
    for ( var i = 0; i < rowCount; i++) {
      rowData = G_GRDMASTER.data.getItem(i);
      if (rowData.CHK_YN == "Y") {
        G_GRDCARMASTER.lastFilterVal.push(rowData.CAR_CD);
      }
    }
  }
  G_GRDCARMASTER.data.refresh();
  if (G_GRDCARMASTER.data.getLength() == 0) {
    alert("이동 가능한 대상 차량이 없습니다.");
    return;
  }

  var offset = view.offset();
  var clientHeight = Math.max((G_GRDCARMASTER.data.getLength() + 1) * 25 + $NC.G_LAYOUT.header
      + $NC.G_LAYOUT.scroll.height + 1, 200);
  if (clientHeight > $(window).height() - 100) {
    clientHeight = $(window).height() - 100;
  }
  divCarInfoView.css({
    "position": "absolute",
    "top": offset.top + clientHeight > $(window).height() ? $(window).height() - clientHeight - $NC.G_LAYOUT.header
        : offset.top,
    "left": offset.left + view.outerWidth(),
    "z-index": 1000,
    "width": $NC.G_OFFSET.carMasterViewWidth,
    "height": clientHeight
  });

  G_GRDCARMASTER.view.resetActiveCell();
  divCarInfoView.show("fast", function() {
    G_GRDCARMASTER.view.focus();
    $NC.resizeGrid("#grdCarMaster", $NC.G_OFFSET.carMasterViewWidth, clientHeight - $NC.G_LAYOUT.header);
    G_GRDCARMASTER.view.invalidate();
    $NC.setGridSelectRow(G_GRDCARMASTER, 0);
  });
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();

  // 저장
  $NC.setEnable("#btnChangeCar_Car", permission.canSave);
  $NC.setEnable("#btnChangeCar_Outbound", permission.canSave);
  $NC.setEnable("#btnChangeCar_Line", permission.canSave);
  $NC.setEnable("#btnSplitOrder", permission.canSave);
}
