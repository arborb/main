/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null
  });

  // $NC.setEnable("#cboRequest_Div", true);
  $NC.setEnable("#cboRequest_Div", false);
  // 조회조건 - 발주구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "REQUEST_DIV",
      P_CODE_CD: "1",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboRequest_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      setTimeout(function() {
        $NC.G_VAR.masterData.REQUEST_DIV = $NC.getValue("#cboRequest_Div");
      }, 300);
    }
  });

  // 조회조건 - 입고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "E1",
      P_SUB_CD2: "%"
    })
  }, {
    selector: "#cboInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      setTimeout(function() {
        $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
      }, 300);
    }
  });

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel); // 닫기버튼
  $("#btnVendor_Cd").click(showVendorPopup); // 공급처 검색 버튼
  $("#btnEntryNew").click(_New); // 그리드 행 추가 버튼
  $("#btnEntryDelete").click(_Delete); // 그리드 행 삭제버튼
  $("#btnEntrySave").click(_Save); // 저장 버튼

  $NC.setInitDatePicker("#dtpRequest_Date"); // 발주일자
  $NC.setInitDatePicker("#dtpDelivery_Req_Date"); // 납품요청일자

  // 그리드 초기화
  grdDetailInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtCenter_Cd", $NC.G_VAR.userData.P_CENTER_CD);
  $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
  $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);
  $NC.setValue("#edtCust_Cd", $NC.G_VAR.userData.P_CUST_CD);
  $NC.setValue("#dtpRequest_Date", $NC.G_VAR.userData.P_REQUEST_DATE);

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {

    var DELIVERY_REQ_DATE = $NC.getValue("#dtpDelivery_Req_Date");
    var REQUEST_DATE = $NC.getValue("#dtpRequest_Date");
    var REQUEST_DIV = $NC.getValue("#cboRequest_Div");
    var INOUT_CD = $NC.getValue("#cboInout_Cd");

    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      CUST_CD: $NC.G_VAR.userData.P_CUST_CD,
      DELIVERY_REQ_DATE: DELIVERY_REQ_DATE,
      REQUEST_DATE: REQUEST_DATE,
      REQUEST_NO: "",
      REQUEST_DIV: REQUEST_DIV,
      INOUT_CD: INOUT_CD,
      APPOINT_STATE: "10",
      VENDOR_CD: "",
      BU_DATE: "",
      BU_NO: "",
      REMARK1: "",
      CRUD: "C"
    };

    $NC.setFocus("#edtVendor_Cd");
  }
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 125;
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

  var VENDOR_CD = $NC.getValue("#edtVendor_Cd");
  if ($NC.isNull(VENDOR_CD)) {
    alert("먼저 공급처 코드를 입력하십시오.");
    $NC.setFocus("#edtVendor_Cd");
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
    REQUEST_DATE: $NC.G_VAR.masterData.REQUEST_DATE,
    REQUEST_NO: $NC.G_VAR.masterData.REQUEST_NO,
    LINE_NO: "",
    APPOINT_STATE: $NC.G_VAR.masterData.APPOINT_STATE,
    BRAND_CD: "",
    BRAND_NM: "",
    ITEM_CD: "",
    ITEM_NM: "",
    ITEM_STATE: "A",
    ITEM_STATE_F: $NC.getGridComboName(G_GRDDETAIL, {
      colFullNameField: "ITEM_STATE_F",
      searchVal: "A",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    }),
    ITEM_LOT: "00",
    QTY_IN_BOX: 1,
    BUY_PIRCE:0,
    ORDER_QTY: 0,
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
    alert("물류센터가 지정되어 있지 않습니다. 다시 작업하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
    alert("사업부가 지정되어 있지 않습니다. 다시 작업하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.REQUEST_DATE)) {
    alert("먼저 발주일자를 입력하십시오.");
    $NC.setFocus("#dtpRequest_Date");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.VENDOR_CD)) {
    alert("먼저 공급처 코드를 입력하십시오.");
    $NC.setFocus("#edtVendor_Cd");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.REQUEST_DIV)) {
    alert("먼저 발주구분을 선택하십시오.");
    $NC.setFocus("#cboRequest_Div");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
    alert("먼저 입고구분을 선택하십시오.");
    $NC.setFocus("#cboInout_Cd");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.DELIVERY_REQ_DATE)) {
    alert("먼저 납품요청일자를 입력하십시오.");
    $NC.setFocus("#dtpDelivery_Req_Date");
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
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if ($NC.isNull(rowData.BUY_PIRCE) || rowData.BUY_PIRCE == 0) {
      rowData.BUY_PIRCE = 1;     
    }
  
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_REQUEST_DATE: $NC.G_VAR.masterData.REQUEST_DATE,
        P_REQUEST_NO: $NC.G_VAR.masterData.REQUEST_NO,
        P_APPOINT_STATE: rowData.APPOINT_STATE,
        P_LINE_NO: rowData.LINE_NO,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_TOTAL_ORDER_QTY: rowData.ORDER_QTY,
        P_ORDER_QTY: rowData.ORDER_QTY,
        P_ADJUST_QTY: rowData.ORDER_QTY,
        P_REQUEST_QTY: rowData.ORDER_QTY,
        P_BUY_PIRCE: rowData.BUY_PIRCE,
        P_ETC_PRICE: rowData.ETC_PRICE,
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

  $NC.serviceCall("/LA01010E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_REQUEST_DATE: $NC.G_VAR.masterData.REQUEST_DATE,
      P_REQUEST_NO: $NC.G_VAR.masterData.REQUEST_NO,
      P_APPOINT_STATE: $NC.G_VAR.masterData.APPOINT_STATE,
      P_REQUEST_DIV: $NC.G_VAR.masterData.REQUEST_DIV,
      P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
      P_CUST_CD: $NC.G_VAR.masterData.CUST_CD,
      P_VENDOR_CD: $NC.G_VAR.masterData.VENDOR_CD,
      P_DELIVERY_REQ_DATE: $NC.G_VAR.masterData.DELIVERY_REQ_DATE,
      P_BU_DATE: $NC.G_VAR.masterData.BU_DATE,
      P_BU_NO: $NC.G_VAR.masterData.BU_NO,
      P_REMARK1: $NC.G_VAR.masterData.REMARK1,
      P_INORDER_TYPE: "0",
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
  case "REQUEST_DIV":
    $NC.G_VAR.masterData.REQUEST_DIV = args.val;
    break;
  case "INOUT_CD":
    $NC.G_VAR.masterData.INOUT_CD = args.val;
    break;
  case "REQUEST_DATE":
    $NC.setValueDatePicker(args.view, args.val, "발주일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.REQUEST_DATE = $NC.getValue(args.view);
    break;
  case "VENDOR_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      var CUST_CD = $NC.getValue("#edtCust_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_VENDOR_CD: args.val,
        P_VIEW_DIV: "2"
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
  case "DELIVERY_REQ_DATE":
    $NC.setValueDatePicker(args.view, args.val, "납품요청일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.DELIVERY_REQ_DATE = $NC.getValue(args.view);
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
    cssClass: "align-center",
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "ITEM_STATE",
        P_CODE_CD: "%",
        P_SUB_CD1: "1",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "ITEM_STATE",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
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
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PIRCE",
    field: "BUY_PIRCE",
    name: "발주단가[EA]",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });

  $NC.setGridColumn(columns, {
    id: "ETC_PRICE",
    field: "ETC_PRICE",
    name: "기타비용",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });

  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 70,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
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
    canExportExcel: false,
    onFilter: grdDetailOnFilter
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
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
        P_CLASS_CD: "%",
        P_VENDOR_CD: $NC.getValue("#edtVendor_Cd")
      };
      O_RESULT_DATA = $NP.getItemVendorInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopupWithVendorCd({
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
    if ($NC.isNull(rowData.ITEM_STATE)) {
      alert("상태를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ITEM_STATE"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.ITEM_LOT)) {
      alert("LOT번호를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ITEM_LOT"),
        editMode: true
      });
      return false;
    }
    if (isNaN(rowData.ORDER_QTY)) {
      rowData.ORDER_QTY = 0;
      G_GRDDETAIL.data.updateItem(rowData.id, rowData);
      alert("예정수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ORDER_QTY"),
        editMode: true
      });
      return false;
    }

    if (rowData.REQUEST_UNIT_DIV === "12") {
      var BOX_QTY = Number(rowData.QTY_IN_BOX) * Number(rowData.REQUEST_UNIT_QTY);
      if (BOX_QTY > Number(rowData.ORDER_QTY)) {
        alert("최소발주단위수량은 " + BOX_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("ORDER_QTY"),
          editMode: true
        });
        return false;
      } else if ((Number(rowData.ORDER_QTY) % Number(rowData.QTY_IN_BOX)) !== 0) {
        alert("발주단위로 조정할 수 있습니다.");
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("ORDER_QTY"),
          editMode: true
        });
        return false;
      }
    } else if (rowData.REQUEST_UNIT_DIV === "13") {
      var PLT_QTY = Number(rowData.QTY_IN_BOX) * Number(rowData.BOX_IN_PLT) * Number(rowData.REQUEST_UNIT_QTY);
      if (PLT_QTY > Number(rowData.ORDER_QTY)) {
        alert("최소발주단위수량은 " + PLT_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("ORDER_QTY"),
          editMode: true
        });
        return false;
      } else if ((Number(rowData.ORDER_QTY) % (Number(rowData.QTY_IN_BOX) * Number(rowData.BOX_IN_PLT))) !== 0) {
        alert("발주단위로 조정할 수 있습니다.");
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("ORDER_QTY"),
          editMode: true
        });
        return false;
      }
    } else {
      if (Number(rowData.REQUEST_UNIT_QTY) > Number(rowData.ORDER_QTY)) {
        alert("최소발주단위수량은 " + rowData.REQUEST_UNIT_QTY + " 입니다.");
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("ORDER_QTY"),
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

function showVendorPopup() {

  var CUST_CD = $NC.getValue("#edtCust_Cd");

  $NP.showVendorPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_VENDOR_CD: "%",
      P_VIEW_DIV: "1"
    }
  }, onVendorPopup, function() {
    $NC.setFocus("#edtVendor_Cd", true);
  });
}

function onVendorPopup(resultInfo) {

  var rowCount = G_GRDDETAIL.data.getLength();
  if (rowCount > 0) {
    // 현재 수정모드면
    if (G_GRDDETAIL.view.getEditorLock().isActive()) {
      G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
    }
    var result = confirm("작업중인 상품내역이 존재합니다.\n\n공급처를 변경하시면 작업내역이 삭제됩니다.\n\n공급처를 변경 하시겠습니까?");
    if (result) {
      $NC.clearGridData(G_GRDDETAIL);
    } else {
      $NC.setValue("#edtVendor_Cd", $NC.G_VAR.masterData.VENDOR_CD);
      return;
    }
  }

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.masterData.VENDOR_CD = resultInfo.VENDOR_CD;
    $NC.setValue("#edtVendor_Cd", resultInfo.VENDOR_CD);
    $NC.setValue("#edtVendor_Nm", resultInfo.VENDOR_NM);
    $NC.setFocus("#edtRemark", true);
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
 * 그리드의 상품 팝업 처리
 */
function grdDetailOnPopup(e, args) {

  var rowData = args.item;


  switch (args.column.field) {
  case "ITEM_CD":
    $NP.showItemPopupWithVendorCd({
      P_BU_CD: rowData.BU_CD,
      P_ITEM_CD: "%",
      P_VIEW_DIV: "1",
      P_DEPART_CD: "%",
      P_LINE_CD: "%",
      P_CLASS_CD: "%",
      P_VENDOR_CD: $NC.getValue("#edtVendor_Cd")
    }, onItemPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
    });
    break;
  }
}

/**
 * 그리드에서 상품 선택/취소했을 경우 처리
 * 
 * @param seletedRowData
 */
function onItemPopup(resultInfo) {

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.BRAND_CD = resultInfo.BRAND_CD;
    rowData.BRAND_NM = resultInfo.BRAND_NM;
    rowData.ITEM_CD = resultInfo.ITEM_CD;
    rowData.ITEM_NM = resultInfo.ITEM_NM;
    rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
    rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;
    rowData.BOX_IN_PLT = resultInfo.BOX_IN_PLT;
    rowData.REQUEST_UNIT_DIV = resultInfo.REQUEST_UNIT_DIV;
    rowData.REQUEST_UNIT_DIV_F = resultInfo.REQUEST_UNIT_DIV_F;
    rowData.REQUEST_UNIT_QTY = resultInfo.REQUEST_UNIT_QTY;
    focusCol = G_GRDDETAIL.view.getColumnIndex("ORDER_QTY");
  } else {
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";
    rowData.ITEM_SPEC = "";
    rowData.QTY_IN_BOX = 1;
    rowData.BOX_IN_PLT = 1;
    rowData.REQUEST_UNIT_DIV = "";
    rowData.REQUEST_UNIT_DIV_F = "";
    rowData.REQUEST_UNIT_QTY = "";
    rowData.ORDER_QTY = 0;
    rowData.BUY_PIRCE = 0;
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