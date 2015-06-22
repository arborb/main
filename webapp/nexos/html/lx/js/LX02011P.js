/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 예정이 존재하는 데이터인지...
    existOrder: false,
    // 마스터 데이터
    masterData: null
  });

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel);
  $("#btnEntrySave").click(_Save);

  // 그리드 초기화
  grdDetailInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {
  
  $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
  $NC.setValue("#edtCenter_Cd", $NC.G_VAR.userData.P_CENTER_CD);
  $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);
  $NC.setValue("#edtCust_Cd", $NC.G_VAR.userData.P_CUST_CD);

  // 마스터 데이터 세팅
  var masterDS = $NC.G_VAR.userData.P_MASTER_DS;
  var XDOCK_DATE, ENTRY_QTY;
  if ($NC.G_VAR.userData.P_PROCESS_CD == "A") {
    $("#lblXDock_Date").removeClass("ui-lbl-normal").addClass("ui-lbl-key");
    $NC.setEnable("#dtpXDock_Date", true);
    $NC.setInitDatePicker("#dtpXDock_Date");
    XDOCK_DATE = $NC.getValue("#dtpXDock_Date");
  } else {
    $NC.setEnable("#dtpXDock_Date", false);
    $NC.setValue("#dtpXDock_Date", masterDS.XDOCK_DATE);
    XDOCK_DATE = masterDS.XDOCK_DATE;
  }
  $NC.setValue("#edtXDock_No", masterDS.XDOCK_NO);
  $NC.setValue("#edtXDock_Sate_D", masterDS.XDOCK_STATE_D);
  $NC.setValue("#edtVendor_Cd", masterDS.VENDOR_CD);
  $NC.setValue("#edtVendor_Nm", masterDS.VENDOR_NM);
  $NC.setValue("#edtXDock_type" ,masterDS.XDOCK_TYPE_D);
  $NC.setValue("#edtCar_No", masterDS.CAR_NO);
  $NC.setValue("#edtRemark1", masterDS.REMARK1);
  $NC.setValue("#edtLocation_Id_Cnt", masterDS.LOCATION_ID_CNT);

  $NC.setValue("#edtOrder_Date", masterDS.ORDER_DATE);
  $NC.setValue("#edtOrder_No", masterDS.ORDER_NO);
  $NC.setValue("#edtBu_Date", masterDS.BU_DATE);
  $NC.setValue("#edtBu_No", masterDS.BU_NO);

  $NC.G_VAR.masterData = {
    CENTER_CD: masterDS.CENTER_CD,
    BU_CD: masterDS.BU_CD,
    XDOCK_DATE: XDOCK_DATE,
    XDOCK_NO: masterDS.XDOCK_NO,
    XDOCK_STATE: masterDS.XDOCK_STATE,
    VENDOR_CD: masterDS.VENDOR_CD,
    XDOCK_TYPE: masterDS.XDOCK_TYPE,
    CAR_NO: masterDS.CAR_NO,
    BU_DATE: masterDS.BU_DATE,
    BU_NO: masterDS.BU_NO,
    ORDER_DATE: masterDS.ORDER_DATE,
    ORDER_NO: masterDS.ORDER_NO,
    PLANED_DATETIME: masterDS.PLANED_DATETIME,
    REMARK1: masterDS.REMARK1,
    CRUD: "R"
  };

  // 디테일 데이터 세팅
  var detailDS = $NC.G_VAR.userData.P_DETAIL_DS;
  var rowData;
  G_GRDDETAIL.data.beginUpdate();
  try {
    for ( var row in detailDS) {
      rowData = detailDS[row];
      if ($NC.G_VAR.userData.P_PROCESS_CD == "A") {
        // 등록수량 = 예정수량으로 셋팅 및 관련 금액 수정
        rowData = grdDetailOnCalc(rowData, rowData.ORDER_QTY);
      }
      var newRowData = {
        CENTER_CD: rowData.CENTER_CD,
        BU_CD: rowData.BU_CD,
        XDOCK_DATE: rowData.XDOCK_DATE,
        XDOCK_NO: rowData.XDOCK_NO,
        LINE_NO: rowData.LINE_NO,
        BRAND_CD: rowData.BRAND_CD,
        BRAND_NM: rowData.BRAND_NM,
        ITEM_CD: rowData.ITEM_CD,
        ITEM_NM: rowData.ITEM_NM,
        ITEM_SPEC: rowData.ITEM_SPEC,
        ITEM_STATE: rowData.ITEM_STATE,
        ITEM_STATE_F: rowData.ITEM_STATE_F,
        ITEM_LOT: rowData.ITEM_LOT,
        QTY_IN_BOX: rowData.QTY_IN_BOX,
        VALID_DATE: rowData.VALID_DATE,
        BATCH_NO: rowData.BATCH_NO,
        ORDER_QTY: rowData.ORDER_QTY,
        ENTRY_QTY: rowData.ENTRY_QTY,
        ENTRY_BOX: rowData.ENTRY_BOX,
        ENTRY_EA: rowData.ENTRY_EA,
        CONFIRM_QTY: rowData.CONFIRM_QTY,
        PUTAWAY_QTY: rowData.PUTAWAY_QTY,
        BOX_WEIGHT: rowData.BOX_WEIGHT,
        ENTRY_WEIGHT: rowData.ENTRY_WEIGHT,
        BUY_PRICE: rowData.BUY_PRICE,
        DC_PRICE: rowData.DC_PRICE,
        APPLY_PRICE: rowData.APPLY_PRICE,
        BUY_AMT: rowData.BUY_AMT,
        VAT_YN: rowData.VAT_YN,
        VAT_AMT: rowData.VAT_AMT,
        DC_AMT: rowData.DC_AMT,
        TOTAL_AMT: rowData.TOTAL_AMT,
        ORDER_DATE: rowData.ORDER_DATE,
        ORDER_NO: rowData.ORDER_NO,
        ORDER_LINE_NO: rowData.ORDER_LINE_NO,
        BU_DATE: rowData.BU_DATE,
        BU_NO: rowData.BU_NO,
        BU_LINE_NO: rowData.BU_LINE_NO,
        BU_KEY: rowData.BU_KEY,
        REMARK1: rowData.REMARK1,
        VAT_YN: rowData.VAT_YN,
        id: $NC.getGridNewRowId(),
        CRUD: "R"
      };
      G_GRDDETAIL.data.addItem(newRowData);
    }
  } finally {
    G_GRDDETAIL.data.endUpdate();
  }

  $NC.setGridSelectRow(G_GRDDETAIL, 0);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 155;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_OFFSET.masterViewHeight
      - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divMasterView", clientWidth, $NC.G_OFFSET.masterViewHeight);
  $NC.resizeContainer("#divDetailView", clientWidth, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

  $NC.setPopupCloseAction("CANCEL");
  $NC.onPopupClose();
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

  $NC.setPopupCloseAction("OK");
  $NC.onPopupClose();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

  var id = view.prop("id").substr(3).toUpperCase();
  masterDataOnChange(e, {
    view: view,
    col: id,
    val: val
  });
}

/**
 * 조회
 */
function _Inquiry() {

}

/**
 * 신규
 */
function _New() {

}

/**
 * 저장
 */
function _Save() {

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }
  
  if ($NC.isNull($NC.G_VAR.masterData.XDOCK_DATE)) {
    alert("먼저 CD일자를 입력하십시오.");
    $NC.setFocus("#dtpXDock_Date");
    return;
  }

  // 현재 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }

  var u_DS = [ ];
  var rows = G_GRDDETAIL.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD == "U") {
      var saveData = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_ORDER_DATE: rowData.ORDER_DATE,
        P_ORDER_NO: rowData.ORDER_NO,
        P_ORDER_LINE_NO: rowData.ORDER_LINE_NO,
        P_XDOCK_DATE: rowData.XDOCK_DATE,
        P_XDOCK_NO: rowData.XDOCK_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_ENTRY_QTY: rowData.ENTRY_QTY,
        P_BUY_PRICE: rowData.BUY_PRICE,
        P_DC_PRICE: rowData.DC_PRICE,
        P_APPLY_PRICE: rowData.APPLY_PRICE,
        P_BUY_AMT: rowData.BUY_AMT,
        P_VAT_AMT: rowData.VAT_AMT,
        P_DC_AMT: rowData.DC_AMT,
        P_TOTAL_AMT: rowData.TOTAL_AMT,
        P_CRUD: rowData.CRUD
      };
      u_DS.push(saveData);
    }
  }
  var detailDS = u_DS;
  if ($NC.G_VAR.masterData.CRUD === "R" && detailDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/LX02010E/saveEntry.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
      P_ORDER_NO: $NC.G_VAR.masterData.ORDER_NO,
      P_XDOCK_DATE: $NC.G_VAR.masterData.XDOCK_DATE,
      P_XDOCK_NO: $NC.G_VAR.masterData.XDOCK_NO,
      P_LINE_NO: "",
      P_XDOCK_TYPE: "",
      P_DELIVERY_BATCH: "",
      P_DELIVERY_CD: "",
      P_RDELIVERY_CD: ""
    }),
    P_DS_DETAIL: $NC.toJson(detailDS),
    P_PROCESS_CD: $NC.G_VAR.userData.P_PROCESS_CD,
    P_PROCESS_STATE_BW: $NC.G_VAR.userData.P_PROCESS_STATE_BW,
    P_PROCESS_STATE_FW: $NC.G_VAR.userData.P_PROCESS_STATE_FW,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

}

function masterDataOnChange(e, args) {
  
  switch (args.col) {
  case "XDOCK_DATE":
    $NC.G_VAR.masterData[args.col] = args.val;
    break;
  }
  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}

function grdDetailOnGetColumns() {

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
    name: "브랜드",
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
    cssClass: "align-right",
    editor: Slick.Editors.Number
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
  // 정책에 따른 컬럼 표시
  if ($NC.G_VAR.userData.P_POLICY_LI420 == "2") {
    $NC.setGridColumn(columns, {
      id: "VALID_DATE",
      field: "VALID_DATE",
      name: "유통기한",
      minWidth: 100,
      editor: Slick.Editors.Date
    });
    $NC.setGridColumn(columns, {
      id: "BATCH_NO",
      field: "BATCH_NO",
      name: "제조배치번호",
      minWidth: 100,
      editor: Slick.Editors.Text
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
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "APPLY_PRICE",
    field: "APPLY_PRICE",
    name: "적용단가",
    minWidth: 70,
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
    minWidth: 80
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
    editable: true,
    autoEdit: true,
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: null,
    sortCol: "LINE_NO",
    gridOptions: options,
    canExportExcel: false
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);

}

function grdDetailOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
}

function grdDetailOnBeforeEditCell(e, args) {

  // 입고등록 전표생성 가능여부 N -> 입고등록시 신규, 수정 불가능
  if ($NC.G_VAR.userData.P_POLICY_LI210 !== "Y") {
    return false;
  }
}

function grdDetailOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
  
  case "ENTRY_QTY":
    rowData = grdDetailOnCalc(rowData);
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
}

function grdDetailOnBeforePost(row) {

  if (!G_GRDDETAIL.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAIL.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.ENTRY_QTY)) {
      
      alert("등록수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
        editMode: true
      });
      return false;
    } else {
      
      var ENTRY_QTY = Number(rowData.ENTRY_QTY);
      if (ENTRY_QTY < 1) {
        alert("등록수량이 1보다 작을 수 없습니다.");
        rowData = grdDetailOnCalc(rowData, rowData.ORDER_QTY);
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
          editMode: true
        });
        return false;
      }

      // 입고등록 수량 허용기준 2 -> 입고예정 수량 초과등록 불가능
      if (Number(rowData.ORDER_QTY) < ENTRY_QTY) {
        alert("등록수량이 예정수량을 초과할 수 없습니다.");
        rowData = grdDetailOnCalc(rowData, rowData.ORDER_QTY);
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
          editMode: true
        });
        return false;
      }
      
    }
  }

  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  return true;
}

function grdDetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL.lastRow != null) {
    if (row == G_GRDDETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

function grdDetailOnPopup(e, args) {

  var rowData = args.item;

  switch (args.column.field) {
  case "ITEM_CD":
    break;
  }
}

function grdDetailOnCalc(rowData, entry_Qty) {

  if (!$NC.isNull(entry_Qty)) {
    rowData.ENTRY_QTY = Number(entry_Qty);
  }

  rowData.ENTRY_BOX = $NC.getB_Box(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
  rowData.ENTRY_EA = $NC.getB_Ea(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
  rowData.ENTRY_WEIGHT = $NC.getWeight(rowData.ENTRY_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);

  var params = {
    ITEM_PRICE: rowData.BUY_PRICE,// 매입단가 또는 공급단가
    APPLY_PRICE: rowData.APPLY_PRICE,// 적용단가
    ITEM_QTY: rowData.ENTRY_QTY,// 상품수량
    ITEM_AMT: rowData.BUY_AMT,// 매입금액 또는 공급금액
    VAT_YN: rowData.VAT_YN,// 과세여부가 NULL일 경우는 부가세금액이 있는지로 체크
    VAT_AMT: rowData.VAT_AMT,// 부가세
    DC_AMT: rowData.DC_AMT,// 할인금액
    TOTAL_AMT: rowData.TOTAL_AMT,// 합계금액
    POLICY_VAL: $NC.G_VAR.userData.P_POLICY_LI190
  };

  rowData.BUY_AMT = $NC.getItem_Amt(params);
  rowData.VAT_AMT = $NC.getVat_Amt(params);
  rowData.TOTAL_AMT = $NC.getTotal_Amt(params);

  rowData.CONFIRM_QTY = rowData.ENTRY_QTY;

  return rowData;
}

function onSave(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  onClose();
}