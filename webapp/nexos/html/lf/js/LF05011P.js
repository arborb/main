/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null
  });

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel); // 닫기버튼
  $("#btnEntryNew").click(_New); // 그리드 행 추가 버튼
  $("#btnEntryDelete").click(_Delete); // 그리드 행 삭제 버튼
  $("#btnEntrySave").click(_Save); // 그리드 행 저장 버튼

  $("#btnVendor_Cd").click(showVendorPopup); // 공급처 검색 버튼
  $("#btnDelivery_Cd").click(showDeliveryPopup); // 배송처 검색 버튼
  $("#btnCar_Cd").click(showCarPopup); // 차량 검색 버튼

  $NC.setEnable("#edtCenter_Cd_F", false);
  $NC.setEnable("#edtBu_Cd", false);
  $NC.setEnable("#dtpDelivery_No", false); // 운송번호 비활성화

  $NC.setInitDatePicker("#dtpDelivery_Date"); // 운송일자

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
  $NC.setValue("#dtpDelivery_Date", $NC.G_VAR.userData.P_DELIVERY_DATE);

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {

    var DELIVERY_DATE = $NC.getValue("#dtpDelivery_Date");
    // var DELIVERY_JOB_DIV = $NC.getValue("#cboDelivery_Job_Div");

    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      DELIVERY_DATE: DELIVERY_DATE,
      DELIVERY_NO: "",
      DELIVERY_JOB_DIV: "",
      CUST_CD: $NC.G_VAR.userData.P_CUST_CD,
      CAR_CD: "",
      VENDOR_CD: "",
      DELIVERY_CD: "",
      REMARK1: "",
      CRUD: "C"
    };
  } else {
    // 예정 -> 등록, 등록 수정
    var CRUD = "R";
    // 마스터 데이터 세팅
    var masterDS = $NC.G_VAR.userData.P_MASTER_DS;
    $NC.setValue("#dtpDelivery_Date", masterDS.DELIVERY_DATE);
    $NC.setValue("#dtpDelivery_No", masterDS.DELIVERY_NO);
    // $NC.setValue("#cboDelivery_Job_Div", masterDS.DELIVERY_JOB_DIV);
    $NC.setValue("#edtCar_Cd", masterDS.CAR_CD);
    $NC.setValue("#edtCar_Nm", masterDS.CAR_NM);
    $NC.setValue("#edtVendor_Cd", masterDS.VENDOR_CD);
    $NC.setValue("#edtVendor_Nm", masterDS.VENDOR_NM);
    $NC.setValue("#edtDelivery_Cd", masterDS.DELIVERY_CD);
    $NC.setValue("#edtDelivery_Nm", masterDS.DELIVERY_NM);
    $NC.setValue("#edtRemark1", masterDS.REMARK1);

    $NC.G_VAR.masterData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      DELIVERY_DATE: masterDS.DELIVERY_DATE,
      DELIVERY_NO: masterDS.DELIVERY_NO,
      DELIVERY_JOB_DIV: masterDS.DELIVERY_JOB_DIV,
      CUST_CD: masterDS.CUST_CD,
      CAR_CD: masterDS.CAR_CD,
      VENDOR_CD: masterDS.VENDOR_CD,
      DELIVERY_CD: masterDS.DELIVERY_CD,
      REMARK1: masterDS.REMARK1,
      CRUD: CRUD
    };

    // 디테일 데이터 세팅
    var detailDS = $NC.G_VAR.userData.P_DETAIL_DS;
    var rowData;
    G_GRDDETAIL.data.beginUpdate();
    try {
      for ( var row in detailDS) {
        rowData = detailDS[row];
        var DELIVERY_QTY = Number(rowData.DELIVERY_QTY);
        if (DELIVERY_QTY > 0) {
          var newRowData = {
            CENTER_CD: rowData.CENTER_CD,
            BU_CD: rowData.BU_CD,
            DELIVERY_DATE: rowData.DELIVERY_DATE,
            DELIVERY_NO: rowData.DELIVERY_NO,
            LINE_NO: rowData.LINE_NO,
            ITEM_CD: rowData.ITEM_CD,
            ITEM_NM: rowData.ITEM_NM,
            BRAND_CD: rowData.BRAND_CD,
            BRAND_NM: rowData.BRAND_NM,
            DELIVERY_QTY: rowData.DELIVERY_QTY,
            DELIVERY_WEIGHT: rowData.DELIVERY_WEIGHT,
            DELIVERY_CBM: rowData.DELIVERY_CBM,
            CHARGE_AMT: rowData.CHARGE_AMT,
            PAY_AMT: rowData.PAY_AMT,
            BU_DATE: rowData.BU_DATE,
            BU_NO: rowData.BU_DATE,
            BU_LINE_NO: rowData.BU_LINE_NO,
            REMARK1: rowData.REMARK1,
            id: $NC.getGridNewRowId(),
            CRUD: CRUD
          };
          G_GRDDETAIL.data.addItem(newRowData);
        }
      }
    } finally {
      G_GRDDETAIL.data.endUpdate();
    }

    // 수정일 경우 입력불가 항목 비활성화 처리
    $NC.setEnable("#cboDelivery_Job_Div", false);
    $NC.setEnable("#dtpDelivery_Date", false);

    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

  // 조회조건 - 정산항목 세팅
  $NC.setInitCombo("/LF05010E/getDataSet.do", {
    P_QUERY_ID: "LF05010E.RS_SUB1",
    P_QUERY_PARAMS: $NC.getParams("{}")
  }, {
    selector: "#cboDelivery_Job_Div",
    codeField: "FEE_BASE_CD",
    nameField: "FEE_BASE_NM",
    fullNameField: "FEE_BASE_CD_F",
    selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? "F" : null,
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.DELIVERY_JOB_DIV = $NC.getValue("#cboDelivery_Job_Div");
      } else {
        $NC.setValue("#cboDelivery_Job_Div", $NC.G_VAR.masterData.DELIVERY_JOB_DIV);
      }
    }
  });

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.clientHeight = 130;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_LAYOUT.border1 - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, $NC.G_OFFSET.clientHeight);
  $NC.resizeContainer("#divDetailView", clientWidth, clientHeight - $NC.G_OFFSET.clientHeight - $NC.G_LAYOUT.margin1);

  // Grid 높이 조정
  $NC.resizeGrid("#grdDetail", clientWidth, clientHeight - $NC.G_OFFSET.clientHeight - $NC.G_LAYOUT.header
      - $NC.G_LAYOUT.margin1);
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

  var rowCount = G_GRDDETAIL.data.getLength();
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDDETAIL.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      $NC.setFocusGrid(G_GRDDETAIL, rowCount - 1, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
      return;
    }
  }
  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
    BU_CD: $NC.G_VAR.masterData.BU_CD,
    DELIVERY_DATE: $NC.G_VAR.masterData.DELIVERY_DATE,
    DELIVERY_NO: $NC.G_VAR.masterData.DELIVERY_NO,
    LINE_NO: "",
    ITEM_CD: "",
    ITEM_NM: "",
    BRAND_CD: "",
    BRAND_NM: "",
    DELIVERY_QTY: 0,
    DELIVERY_WEIGHT: 0,
    DELIVERY_CBM: 0,
    CHARGE_AMT: 0,
    PAY_AMT: 0,
    BU_DATE: "",
    BU_NO: "",
    BU_LINE_NO: "",
    REMARK1: "",
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };

  G_GRDDETAIL.data.addItem(newRowData);
  $NC.setGridSelectRow(G_GRDDETAIL, rowCount);
  if (rowCount === 0) {
    $NC.setGridDisplayRows("#grdDetail", rowCount + 1, G_GRDDETAIL.data.getLength());
  }

  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;

  // 신규 데이터 생성 후 이벤트 호출
  grdDetailOnNewRecord({
    row: rowCount,
    rowData: newRowData
  });
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
    alert("물류센터를 입력하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.DELIVERY_DATE)) {
    alert("먼저 운송일자를 입력하십시오.");
    $NC.setFocus("#dtpDelivery_Date");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.DELIVERY_JOB_DIV)) {
    alert("먼저 운송구분을 선택하십시오.");
    $NC.setFocus("#cboDelivery_Job_Div");
    return;
  }
  if ($NC.isNull($NC.G_VAR.masterData.CAR_CD)) {
    alert("먼저 차량을 선택하십시오.");
    $NC.setFocus("#edtCar_Cd");
    return;
  }
  if ($NC.isNull($NC.G_VAR.masterData.VENDOR_CD)) {
    alert("먼저 공급처를 선택하십시오.");
    $NC.setFocus("#edtVendor_Cd");
    return;
  }
  if ($NC.isNull($NC.G_VAR.masterData.DELIVERY_CD)) {
    alert("먼저 배송처를 선택하십시오.");
    $NC.setFocus("#edtDelivery_Cd");
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

  var d_DS = [ ];
  var cu_DS = [ ];
  var rows = G_GRDDETAIL.data.getItems();
  var rowCount = rows.length;
  for (var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_DELIVERY_DATE: $NC.G_VAR.masterData.DELIVERY_DATE,
        P_DELIVERY_NO: $NC.G_VAR.masterData.DELIVERY_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_DELIVERY_QTY: rowData.DELIVERY_QTY,
        P_DELIVERY_WEIGHT: rowData.DELIVERY_WEIGHT,
        P_DELIVERY_CBM: rowData.DELIVERY_CBM,
        P_CHARGE_AMT: rowData.CHARGE_AMT,
        P_PAY_AMT: rowData.PAY_AMT,
        P_BU_DATE: rowData.BU_DATE,
        P_BU_NO: rowData.BU_NO,
        P_BU_LINE_NO: rowData.BU_LINE_NO,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      if (rowData.CRUD === "D") {
        d_DS.push(saveData);
      } else {
        cu_DS.push(saveData);
      }
    }
  }
  var detailDS = d_DS.concat(cu_DS);
  if ($NC.G_VAR.masterData.CRUD === "R" && detailDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/LF05010E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_DELIVERY_DATE: $NC.G_VAR.masterData.DELIVERY_DATE,
      P_DELIVERY_NO: $NC.G_VAR.masterData.DELIVERY_NO,
      P_DELIVERY_JOB_DIV: $NC.G_VAR.masterData.DELIVERY_JOB_DIV,
      P_CUST_CD: $NC.G_VAR.masterData.CUST_CD,
      P_VENDOR_CD: $NC.G_VAR.masterData.VENDOR_CD,
      P_DELIVERY_CD: $NC.G_VAR.masterData.DELIVERY_CD,
      P_CAR_CD: $NC.G_VAR.masterData.CAR_CD,
      P_REMARK1: $NC.G_VAR.masterData.REMARK1,
      P_CRUD: $NC.G_VAR.masterData.CRUD
    }),
    P_DS_DETAIL: $NC.toJson(detailDS),
    P_PROCESS_CD: $NC.G_VAR.userData.P_PROCESS_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

  // 신규 데이터일 경우 그냥 삭제
  if (rowData.CRUD === "C" || rowData.CRUD === "N") {
    G_GRDDETAIL.data.deleteItem(rowData.id);
  } else {
    rowData.CRUD = "D";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
    G_GRDDETAIL.data.refresh();
  }
  // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
  if (G_GRDDETAIL.lastRow > 1) {
    $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.lastRow - 1);
  } else {
    G_GRDDETAIL.lastRow = null;
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

  // 마지막 선택 Row 수정 상태 복원
  G_GRDDETAIL.lastRowModified = false;
}

/**
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

  switch (args.col) {
  case "DELIVERY_JOB_DIV":
    $NC.G_VAR.masterData.DELIVERY_JOB_DIV = args.val;
    break;
  case "DELIVERY_DATE":
    if (!$NC.isDate(args.val)) {
      alert("운송일자를 정확히 입력하십시오.");
      $NC.setInitDatePicker(args.view);
      $NC.setFocus(args.view);
    } else {
      $NC.setValue(args.view, $NC.getDate(args.val));
    }
    $NC.G_VAR.masterData.DELIVERY_DATE = $NC.getValue(args.view);
    break;
  case "VENDOR_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      var CUST_CD = $NC.G_VAR.userData.P_CUST_CD;
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_VENDOR_CD: args.val,
        P_VIEW_DIV: "1"
      };
      O_RESULT_DATA = $NP.getVendorInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onVendorPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showVendorPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onVendorPopup, onVendorPopup);
    }
    return;
  case "DELIVERY_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      var CUST_CD = $NC.G_VAR.userData.P_CUST_CD;
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_DELIVERY_CD: args.val,
        P_DELIVERY_DIV: "%",
        P_VIEW_DIV: "1"
      };
      O_RESULT_DATA = $NP.getDeliveryInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onDeliveryPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showDeliveryPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onDeliveryPopup, onDeliveryPopup);
    }
    return;
  case "CAR_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      P_QUERY_PARAMS = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_CAR_CD: args.val,
        P_VIEW_DIV: "1"
      };
      O_RESULT_DATA = $NP.getCarInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onCarPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showCarPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onCarPopup, onCarPopup);
    }
    return;
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
    minWidth: 100,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdDetailOnPopup,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_QTY",
    field: "DELIVERY_QTY",
    name: "배송수량",
    minWidth: 100,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_WEIGHT",
    field: "DELIVERY_WEIGHT",
    name: "배송중량",
    minWidth: 100,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      numberType: "D",
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CBM",
    field: "DELIVERY_CBM",
    name: "배송CBM",
    minWidth: 110,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      numberType: "D",
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "CHARGE_AMT",
    field: "CHARGE_AMT",
    name: "청구금액",
    minWidth: 100,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "PAY_AMT",
    field: "PAY_AMT",
    name: "지급금액",
    minWidth: 100,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200,
    editor: Slick.Editors.Text
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
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: null,
    sortCol: "LINE_NO",
    gridOptions: options,
    canExportExcel: false,
    onFilter: grdDetailOnFilter
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  // G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);

}

/**
 * grdDetail 데이터 필터링 이벤트
 */
function grdDetailOnFilter(item) {

  return item.CRUD !== "D";
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdDetailOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
}

/**
 * 그리드에 입고예정등록 전표 생성 가능여부가 N일경우 편집 불가로 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
// function grdDetailOnBeforeEditCell(e, args) {
// return true;
// }
/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.ITEM_CD)) {
      P_QUERY_PARAMS = {
        P_BU_CD: rowData.BU_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_VIEW_DIV: "1",
        P_DEPART_CD: "%",
        P_LINE_CD: "%",
        P_CLASS_CD: "%"
      };
      O_RESULT_DATA = $NP.getItemInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemPopup, onItemPopup);
    }
    return;
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
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.ITEM_CD)) {
      G_GRDDETAIL.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL, row - 1);
        setTimeout(function() {
          $NC.setGridDisplayRows("#grdDetail", row, G_GRDDETAIL.data.getLength());
        }, 300);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.ITEM_CD) || $NC.isNull(rowData.ITEM_NM)) {
      alert("상품코드를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ITEM_CD"),
        editMode: true
      });
      return false;
    }

    if ($NC.isNull(rowData.DELIVERY_QTY)) {
      alert("배송수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("DELIVERY_QTY"),
        editMode: true
      });
      return false;
    } else {
      var DELIVERY_QTY = Number(rowData.DELIVERY_QTY);
      if (DELIVERY_QTY < 1) {
        alert("배송수량은 1보다 작을 수 없습니다.");

        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("DELIVERY_QTY"),
          editMode: true
        });
        return false;
      }
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
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
 * 그리드의 상품 팝업 처리
 */
function grdDetailOnPopup(e, args) {

  var rowData = args.item;

  switch (args.column.field) {
  case "ITEM_CD":
    $NP.showItemPopup({
      P_BU_CD: rowData.BU_CD,
      P_ITEM_CD: "%",
      P_VIEW_DIV: "1",
      P_DEPART_CD: "%",
      P_LINE_CD: "%",
      P_CLASS_CD: "%"
    }, onItemPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
    });
    break;
  }
}

function onItemPopup(resultInfo) {

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.ITEM_CD = resultInfo.ITEM_CD;
    rowData.ITEM_NM = resultInfo.ITEM_NM;

    rowData.BRAND_CD = resultInfo.BRAND_CD;
    rowData.BRAND_NM = resultInfo.BRAND_NM;

    focusCol = G_GRDDETAIL.view.getColumnIndex("DELIVERY_QTY");
  } else {
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";

    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";

    focusCol = G_GRDDETAIL.view.getColumnIndex("ITEM_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
}

/**
 * 검색조건의 공급처 검색 이미지 클릭
 */
function showVendorPopup() {

  var CUST_CD = $NC.G_VAR.userData.P_CUST_CD;

  $NP.showVendorPopup({
    P_CUST_CD: CUST_CD,
    P_VENDOR_CD: "%",
    P_VIEW_DIV: "1"
  }, onVendorPopup, function() {
    $NC.setFocus("#edtVendor_Cd", true);
  });
}

function onVendorPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.masterData.VENDOR_CD = resultInfo.VENDOR_CD;
    $NC.setValue("#edtVendor_Cd", resultInfo.VENDOR_CD);
    $NC.setValue("#edtVendor_Nm", resultInfo.VENDOR_NM);
    $NC.setFocus("#edtDelivery_Cd", true);
  } else {
    $NC.G_VAR.masterData.VENDOR_CD = "";
    $NC.setValue("#edtVendor_Cd");
    $NC.setValue("#edtVendor_Nm");
    $NC.setFocus("#edtVendor_Cd", true);
  }
  if ($NC.G_VAR.masterData.CRUD == "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}

/**
 * 검색조건의 배송처 검색 이미지 클릭
 */
function showDeliveryPopup() {

  var CUST_CD = $NC.G_VAR.userData.P_CUST_CD;

  $NP.showDeliveryPopup({
    P_CUST_CD: CUST_CD,
    P_DELIVERY_CD: "%",
    P_DELIVERY_DIV: "%",
    P_VIEW_DIV: "1"
  }, onDeliveryPopup, function() {
    $NC.setFocus("#edtDelivery_Cd", true);
  });
}

function onDeliveryPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.masterData.DELIVERY_CD = resultInfo.DELIVERY_CD;
    $NC.setValue("#edtDelivery_Cd", resultInfo.DELIVERY_CD);
    $NC.setValue("#edtDelivery_Nm", resultInfo.DELIVERY_NM);
    $NC.setFocus("#edtCar_Cd", true);
  } else {
    $NC.G_VAR.masterData.DELIVERY_CD = "";
    $NC.setValue("#edtDelivery_Cd");
    $NC.setValue("#edtDelivery_Nm");
    $NC.setFocus("#edtDelivery_Cd", true);
  }
  if ($NC.G_VAR.masterData.CRUD == "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}

/**
 * 검색조건의 차량 검색 이미지 클릭
 */
function showCarPopup() {

  var CENTER_CD = $NC.G_VAR.userData.P_CENTER_CD;

  $NP.showCarPopup({
    P_CENTER_CD: CENTER_CD,
    P_CAR_CD: "%",
    P_VIEW_DIV: "1"
  }, onCarPopup, function() {
    $NC.setFocus("#edtCar_Cd", true);
  });
}

function onCarPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.masterData.CAR_CD = resultInfo.CAR_CD;
    $NC.setValue("#edtCar_Cd", resultInfo.CAR_CD);
    $NC.setValue("#edtCar_Nm", resultInfo.CAR_NM);
  } else {
    $NC.G_VAR.masterData.CAR_CD = "";
    $NC.setValue("#edtCar_Cd");
    $NC.setValue("#edtCar_Nm");
    $NC.setFocus("#edtCar_Cd", true);
  }
  if ($NC.G_VAR.masterData.CRUD == "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
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