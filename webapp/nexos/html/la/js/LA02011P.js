/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null,
    DELIVERY_TIME_DIV: ""
  });

  // 조회조건 - 발주구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "DELIVERY_TIME_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboDelivery_Time_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_NM",
    addEmpty: true
  });

  $NC.setInitDatePicker("#dtpOrder_Date"); // 납품예정일자
  $NC.setInitDatePicker("#dtpAppoint_Date"); // 예약일자
  $NC.setEnable("#dtpAppoint_Date", false);

  // 그리드 초기화
  grdDetailInitialize();

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel); // 닫기버튼
  $("#btnEntrySave").click(_Save); // 저장 버튼
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  // 마스터 데이터 세팅
  var masterDS = $NC.G_VAR.userData.P_MASTER_DS;

  $NC.setValue("#edtCenter_Nm", masterDS.CENTER_NM);
  $NC.setValue("#edtBu_Cd", masterDS.BU_CD);
  $NC.setValue("#edtBu_Nm", masterDS.BU_NM);
  $NC.setValue("#edtRequest_Date", masterDS.REQUEST_DATE);
  $NC.setValue("#edtRequest_No", masterDS.REQUEST_NO);
  $NC.setValue("#edtVendor_Cd", masterDS.VENDOR_CD);
  $NC.setValue("#edtVendor_Nm", masterDS.VENDOR_NM);
  $NC.setValue("#edtDelivery_Req_Date", masterDS.DELIVERY_REQ_DATE);
  $NC.setValue("#edtRequest_Div", masterDS.REQUEST_DIV_F);
  $NC.setValue("#edtAppoint_No", masterDS.APPOINT_NO);
  $NC.setValue("#edtBu_Date", masterDS.BU_DATE);
  $NC.setValue("#edtBu_No", masterDS.BU_NO);
  $NC.setValue("#edtRemark1", masterDS.REMARK1);

  $NC.G_VAR.masterData = {
    CENTER_CD: masterDS.CENTER_CD,
    BU_CD: masterDS.BU_CD,
    REQUEST_DATE: masterDS.REQUEST_DATE,
    REQUEST_NO: masterDS.REQUEST_NO,
    CUST_CD: $NC.G_VAR.userData.P_CUST_CD,
    VENDOR_CD: masterDS.VENDOR_CD,
    DELIVERY_REQ_DATE: masterDS.DELIVERY_REQ_DATE,
    ORDER_DATE: $NC.getValue("#dtpOrder_Date"),
    DCTC_DIV: masterDS.DCTC_DIV,
    REQUEST_DIV: masterDS.REQUEST_DIV,
    REQUEST_DIV_F: masterDS.REQUEST_DIV_F,
    INOUT_CD: masterDS.INOUT_CD,
    APPOINT_DATE: $NC.getValue("#dtpAppoint_Date"),
    APPOINT_NO: masterDS.APPOINT_NO,
    BU_DATE: masterDS.BU_DATE,
    BU_NO: masterDS.BU_NO,
    REMARK1: masterDS.REMARK1,
    CRUD: masterDS.CRUD
  };

  // 디테일 데이터 세팅
  var detailDS = $NC.G_VAR.userData.P_DETAIL_DS;
  var rowData;
  G_GRDDETAIL.data.beginUpdate();
  try {
    for ( var row in detailDS) {
      rowData = detailDS[row];
      var REQUEST_QTY = Number(rowData.REQUEST_QTY);
      if (REQUEST_QTY > 0) {
        var newRowData = {
          CENTER_CD: rowData.CENTER_CD,
          BU_CD: rowData.BU_CD,
          REQUEST_DATE: rowData.REQUEST_DATE,
          REQUEST_NO: rowData.REQUEST_NO,
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
          REQUEST_UNIT_DIV: rowData.REQUEST_UNIT_DIV,
          REQUEST_UNIT_DIV_F: rowData.REQUEST_UNIT_DIV_F,
          REQUEST_UNIT_QTY: rowData.REQUEST_UNIT_QTY,
          REQUEST_QTY: rowData.REQUEST_QTY,
          APPOINT_QTY: rowData.APPOINT_QTY,
          INPUT_QTY: Number(rowData.REQUEST_QTY) - Number(rowData.APPOINT_QTY),
          BUY_PRICE: rowData.BUY_PRICE,
          BUY_AMT: (Number(rowData.REQUEST_QTY) - Number(rowData.APPOINT_QTY)) * Number(rowData.BUY_PRICE),
          BU_LINE_NO: rowData.BU_LINE_NO,
          CRUD: rowData.CRUD,
          id: $NC.getGridNewRowId()
        };
        G_GRDDETAIL.data.addItem(newRowData);
      }
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
  $NC.G_OFFSET.masterViewHeight = 150;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.topOffset;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_LAYOUT.border1 - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, $NC.G_OFFSET.masterViewHeight);
  $NC.resizeContainer("#divDetailView", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - 9);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - $NC.G_LAYOUT.header - 9);
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
    col: id,
    val: val,
    view: view
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

  if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
    alert("물류센터가 지정되어 있지 않습니다. 다시 작업하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
    alert("사업부가 지정되어 있지 않습니다. 다시 작업하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.REQUEST_DATE)) {
    alert("발주일자가 지정되어 있지 않습니다. 다시 작업하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.REQUEST_NO)) {
    alert("발주번호가 지정되어 있지 않습니다. 다시 작업하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.ORDER_DATE)) {
    alert("먼저 납품예정일자를 입력하십시오.");
    $NC.setFocus("#dtpOrder_Date");
    return;
  }

  if ($NC.isNull($NC.G_VAR.DELIVERY_TIME_DIV)) {
    alert("먼저 납품예정시간을 선택하십시오.");
    $NC.setFocus("#cboDelivery_Time_Div");
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

  var detailDS = [ ];
  var rows = G_GRDDETAIL.data.getItems();
  var rowCount = rows.length;
  for (var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    var INPUT_QTY = Number(rowData.INPUT_QTY);
    if (INPUT_QTY > 0) {
      var saveData = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_REQUEST_DATE: $NC.G_VAR.masterData.REQUEST_DATE,
        P_REQUEST_NO: $NC.G_VAR.masterData.REQUEST_NO,
        P_APPOINT_DATE: $NC.G_VAR.masterData.APPOINT_DATE,
        P_REQUEST_LINE_NO: rowData.LINE_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_REQUEST_QTY: rowData.REQUEST_QTY,
        P_APPOINT_QTY: rowData.INPUT_QTY,
        P_CONFIRM_QTY: rowData.INPUT_QTY,
        P_INPUT_QTY: rowData.INPUT_QTY,
        P_BUY_PRICE: rowData.BUY_PRICE,
        P_BU_LINE_NO: rowData.BU_LINE_NO,
        P_CRUD: "C"
      };
      detailDS.push(saveData);
    }
  }

  if ($NC.G_VAR.masterData.CRUD === "R" && detailDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/LA02010E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_REQUEST_DATE: $NC.G_VAR.masterData.REQUEST_DATE,
      P_REQUEST_NO: $NC.G_VAR.masterData.REQUEST_NO,
      P_CUST_CD: $NC.G_VAR.masterData.CUST_CD,
      P_VENDOR_CD: $NC.G_VAR.masterData.VENDOR_CD,
      P_DELIVERY_REQ_DATE: $NC.G_VAR.masterData.DELIVERY_REQ_DATE,
      P_DCTC_DIV: $NC.G_VAR.masterData.DCTC_DIV,
      P_REQUEST_DIV: $NC.G_VAR.masterData.REQUEST_DIV,
      P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
      P_ORDER_DATE: $NC.G_VAR.masterData.ORDER_DATE,
      P_DELIVERY_TIME_DIV: $NC.G_VAR.DELIVERY_TIME_DIV,
      P_APPOINT_DATE: $NC.G_VAR.masterData.APPOINT_DATE,
      P_APPOINT_NO: $NC.G_VAR.masterData.APPOINT_NO,
      P_BU_DATE: $NC.G_VAR.masterData.BU_DATE,
      P_BU_NO: $NC.G_VAR.masterData.BU_NO,
      P_REMARK1: $NC.G_VAR.masterData.REMARK1,
      P_INORDER_TYPE: "0",
      P_CRUD: $NC.G_VAR.masterData.CRUD
    }),
    P_DS_DETAIL: $NC.toJson(detailDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

}

/**
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

  switch (args.col) {
  case "ORDER_DATE":
    $NC.setValueDatePicker(args.view, args.val, "납품예정일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.ORDER_DATE = $NC.getValue(args.view);
    break;
  case "DELIVERY_TIME_DIV":
    $NC.G_VAR.DELIVERY_TIME_DIV = args.val;
    break;
  case "REMARK1":
    $NC.G_VAR.masterData.REMARK1 = args.val;
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
    minWidth: 50,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 100
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
    id: "REQUEST_UNIT_DIV_F",
    field: "REQUEST_UNIT_DIV_F",
    name: "발주단위구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_UNIT_QTY",
    field: "REQUEST_UNIT_QTY",
    name: "최소발주단위수량",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_QTY",
    field: "REQUEST_QTY",
    name: "발주수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "APPOINT_QTY",
    field: "APPOINT_QTY",
    name: "예약수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INPUT_QTY",
    field: "INPUT_QTY",
    name: "입력수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_AMT",
    field: "BUY_AMT",
    name: "매입금액",
    minWidth: 80,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
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
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);

}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
  case "INPUT_QTY":
    rowData.BUY_AMT = rowData.BUY_PRICE * rowData.INPUT_QTY;
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
}

/**
 * 저장시 그리드 입력 체크
 */
function grdDetailOnBeforePost(row) {

  if (!G_GRDDETAIL.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAIL.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  if (rowData.CRUD != "R") {
    if (isNaN(rowData.INPUT_QTY)) {
      rowData.INPUT_QTY = 0;
      G_GRDDETAIL.data.updateItem(rowData.id, rowData);
      alert("예약수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("INPUT_QTY"),
        editMode: true
      });
      return false;
    } else {
      var APPOINT_QTY = Number(rowData.REQUEST_QTY) - Number(rowData.APPOINT_QTY);
      if (APPOINT_QTY < Number(rowData.INPUT_QTY)) {
        alert("입력수량이 예약가능한 수량을 초과하였습니다.");
        rowData.INPUT_QTY = APPOINT_QTY;
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("INPUT_QTY"),
          editMode: true
        });
        return false;
      }
    }

    if (rowData.REQUEST_UNIT_DIV === "12") {
      var BOX_QTY = Number(rowData.QTY_IN_BOX) * Number(rowData.REQUEST_UNIT_QTY);
      if (BOX_QTY > Number(rowData.INPUT_QTY)) {
        alert("최소발주단위수량은 " + BOX_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("INPUT_QTY"),
          editMode: true
        });
        return false;
      } else if ((Number(rowData.INPUT_QTY) % Number(rowData.QTY_IN_BOX)) !== 0) {
        alert("발주단위로 조정할 수 있습니다.");
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("INPUT_QTY"),
          editMode: true
        });
        return false;
      }
    } else if (rowData.REQUEST_UNIT_DIV === "13") {
      var PLT_QTY = Number(rowData.QTY_IN_BOX) * Number(rowData.BOX_IN_PLT) * Number(rowData.REQUEST_UNIT_QTY);
      if (PLT_QTY > Number(rowData.INPUT_QTY)) {
        alert("최소발주단위수량은 " + PLT_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("INPUT_QTY"),
          editMode: true
        });
        return false;
      } else if ((Number(rowData.INPUT_QTY) % (Number(rowData.QTY_IN_BOX) * Number(rowData.BOX_IN_PLT))) !== 0) {
        alert("발주단위로 조정할 수 있습니다.");
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("INPUT_QTY"),
          editMode: true
        });
        return false;
      }
    } else {
      if (Number(rowData.REQUEST_UNIT_QTY) > Number(rowData.INPUT_QTY)) {
        alert("최소발주단위수량은 " + rowData.REQUEST_UNIT_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("INPUT_QTY"),
          editMode: true
        });
        return false;
      }
    }
  }

  return true;
}

/**
 * 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
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

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
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