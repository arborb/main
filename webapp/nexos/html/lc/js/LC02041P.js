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
  $("#btnSave").click(_Save); // 저장 버튼
  $("#btnSearchStock").click(_Inquiry); // 현재고검색 버튼 클릭
  $("#btnLocation").click(showLocationPopup);
  $("#btnQBrand_Cd").click(showBuBrandPopup); // 조회조건 브랜드 검색팝업
  $("#btnQSetItemPopup").click(showSetItemPopup); // 조회조건 상품 검색팝업

  
  $NC.setInitDatePicker("#dtpEtc_Date"); // 입출고일자
  $NC.setInitDatePicker("#dtpValid_Date", null, "N"); // 유통기한일자
  $NC.setValue("#rgbSet_Item1", "1");

  // 상품상태 콤보 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "ITEM_STATE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQItem_State",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F"
  });

  // 조회조건 - 정산항목 세팅
  $NC.setInitCombo("/LC02040E/getDataSet.do", {
    P_QUERY_ID: "LC02040E.RS_POP_SUB4",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD
    })
  }, {
    selector: "#cboQZone_Cd",
    codeField: "ZONE_CD",
    nameField: "ZONE_NM",
    fullNameField: "ZONE_CD_F"
  });

  grdDetailInitialize();
  grdSubInitialize();

}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
  $NC.setValue("#edtCenter_Cd", $NC.G_VAR.userData.P_CENTER_CD);
  $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);
  $NC.setValue("#dtpEtc_Date", $NC.G_VAR.userData.P_ETC_DATE);

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {

    var ETC_DATE = $NC.getValue("#dtpEtc_Date");
    var SET_ITEM_DIV = $NC.getValueRadioGroup("rgbSet_Item_Div");
    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      INOUT_CD: "", // INOUT_CD,
      ETC_DATE: ETC_DATE,
      ETC_NO: "",
      SET_ITEM_DIV: SET_ITEM_DIV,
      LOCATION: "",
      VALID_DATE: "",
      BATCH_NO: "",
      ITEM_LOT: "",
      REMARK1: "",
      CRUD: "C"
    };
  }

  // 입출고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "D4",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? "F" : null,
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
      } else {
        $NC.setValue("#cboInout_Cd", $NC.G_VAR.masterData.INOUT_CD);
      }
    }
  });

  // 스플리터 초기화
  $NC.setInitSplitter("#divSplitter", "v", $NC.G_OFFSET.DetailViewWidth);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.masterViewHeight = 120;
  $NC.G_OFFSET.DetailViewWidth = 600;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $("#tbSetItem").outerHeight()
      + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_OFFSET.masterViewHeight
      - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.border1;

  var container = $("#divSplitter");
  $NC.resizeContainer(container, clientWidth, clientHeight);

  container = $("#grdDetail").parent();
  $NC.resizeGrid("#grdDetail", container.width(), container.height() - $NC.G_LAYOUT.header);

  container = $("#grdSub").parent();
  $NC.resizeGrid("#grdSub", container.width(), container.height() - $NC.G_LAYOUT.header);
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();
  switch (id) {
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BU_CD = $NC.getValue("#edtBu_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: $NC.G_USERINFO.CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBuBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBranPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBuBrandPopup, onBuBrandPopup);
    }
    return;
  case "SET_ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
        P_ITEM_CD: val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getItemInfo({
        queryId: "LC02040E.RS_POP_SUB3",
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onSetItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        requestUrl: "/LC02040E/getDataSet.do",
        queryId: "LC02040E.RS_POP_SUB3",
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onSetItemPopup, onSetItemPopup);
    }
    return;
  case "ZONE_CD":
    onChangingCondition();
    break;
  case "ITEM_STATE":
    onChangingCondition();
    break;
  }

  var id = view.prop("id").substr(3).toUpperCase();
  masterDataOnChange(e, {
    col: id,
    val: val,
    view: view
  });
}

/**
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

  switch (args.col) {
  case "LOCATION_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      P_QUERY_PARAMS = {
        P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
        P_LOCATION_CD: args.val
      };
      O_RESULT_DATA = $NP.getLocationInfo({
        queryId: "LC02040E.RS_POP_SUB5",
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onLocationPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showLocationPopup({
        requestUrl: "/LC02040E/getDataSet.do",
        queryId: "LC02040E.RS_POP_SUB5",
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onLocationPopup, onLocationPopup);
    }
    break;
  case "ETC_DATE":
    $NC.setValueDatePicker(args.view, args.val, "입출고일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.ETC_DATE = $NC.getValue("#dtpEtc_Date");
    break;
  case "VALID_DATE":
    $NC.setValueDatePicker(args.view, args.val, "유통기한일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.VALID_DATE = $NC.getValue("#dtpValid_Date");
    break;
  case "INOUT_CD":
    $NC.G_VAR.masterData.INOUT_CD = args.val;
    break;
  case "BATCH_NO":
    $NC.G_VAR.masterData.BATCH_NO = args.val;
    break;
  case "ITEM_LOT":
    $NC.G_VAR.masterData.ITEM_LOT = args.val;
    break;
  case "REMARK1":
    $NC.G_VAR.masterData.REMARK1 = args.val;
    break;
  case "SET_ITEM1":
    onChangingSetItem();
    break;
  case "SET_ITEM2":
    onChangingSetItem();
    break;
  }

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "C";
  }
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  // 구성상품내역 초기화
  $NC.clearGridData(G_GRDSUB);
  // 재고내역 초기화
  $NC.clearGridData(G_GRDDETAIL);
}

/**
 * 세트작업구분 값 변경 되었을 경우의 처리
 */
function onChangingSetItem() {

  var SET_PROC_DIV = $NC.getValueRadioGroup("rgbSet_Item_Div");
  var rowCount = G_GRDDETAIL.data.getLength();
  if (rowCount > 0) {
    var result = confirm("작업구분를 변경하시면 작업중인 데이터가 초기화됩니다.\n\n작업구분를 변경하시겠습니까?");
    if (!result) {
      if (SET_PROC_DIV === "2") {
        $NC.setValue("#rgbSet_Item1", "1");
      } else {
        $NC.setValue("#rgbSet_Item2", "2");
      }
      return;
    }
  }

  // 등록,검색조건 초기화
  $NC.setValue("#edtLocation_Cd");
  $NC.setValue("#dtpValid_Date");
  $NC.setValue("#edtBatch_No");
  $NC.setValue("#edtItem_Lot");
  $NC.setValue("#edtRemark1");
  $NC.setValue("#edtQItem_Lot");
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");
  $NC.setValue("#edtQSet_Item_Cd");
  $NC.setValue("#edtQSet_Item_Nm");

  // 구성상품내역 초기화
  $NC.clearGridData(G_GRDSUB);
  // 재고내역 초기화
  $NC.clearGridData(G_GRDDETAIL);

}

/**
 * 조회
 */
function _Inquiry() {

  // 현재 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }

  var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
  if ($NC.isNull(BRAND_CD)) {
    alert("브랜드를 입력하십시오.");
    $NC.setFocus("#edtQBrand_Cd");
    return;
  }

  var ITEM_CD = $NC.getValue("#edtQSet_Item_Cd");
  if ($NC.isNull(ITEM_CD)) {
    alert("세트상품을 입력하십시오.");
    $NC.setFocus("#edtQSet_Item_Cd");
    return;
  }

  var ZONE_CD = $NC.getValue("#cboQZone_Cd");
  if ($NC.isNull(ZONE_CD)) {
    alert("존을 선택하십시오.");
    $NC.setFocus("#cboQZone_Cd");
    return;
  }

  var ITEM_LOT = $NC.getValue("#edtQItem_Lot");
  var ITEM_STATE = $NC.getValue("#cboQItem_State");
  var SET_PROC_DIV = $NC.getValueRadioGroup("rgbSet_Item_Div");

  $NC.setInitGridVar(G_GRDDETAIL);

  // 데이터 조회
  $NC.serviceCall("/LC02040E/getDataSet.do", {
    P_QUERY_ID: "LC02040E.RS_POP_SUB1",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_STATE: ITEM_STATE,
      P_ITEM_LOT: ITEM_LOT,
      P_ZONE_CD: ZONE_CD,
      P_SET_PROC_DIV: SET_PROC_DIV
    })
  }, onGetDetail);
}

/**
 * 상품추가 버튼 클릭 이벤트 처리
 */
function _New() {

}

/**
 * 저장버튼 클릭 이벤트 처리
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

  if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
    alert("사업부를 입력하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
    alert("먼저 입출고구분을 선택하십시오.");
    $NC.setFocus("#cboInout_Cd");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.ETC_DATE)) {
    alert("먼저 입출고일자를 입력하십시오.");
    $NC.setFocus("#dtpEtc_Date");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.LOCATION_CD)) {
    alert("먼저 로케이션을 입력하십시오.");
    $NC.setFocus("#edtLocation_Cd");
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

  // 재고내역 그리드 저장
  var subDS = [ ];
  var rows = G_GRDDETAIL.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      if (Number(rowData.SET_INPUT_QTY) > 0) {
        var saveData = {
          P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
          P_BU_CD: $NC.G_VAR.masterData.BU_CD,
          P_ETC_DATE: $NC.G_VAR.masterData.ETC_DATE,
          P_ETC_NO: $NC.G_VAR.masterData.ETC_NO,
          P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
          P_IN_LOCATION_CD: $NC.G_VAR.masterData.LOCATION_CD,
          P_IN_ITEM_LOT: $NC.G_VAR.masterData.ITEM_LOT,
          P_REMARK1: $NC.G_VAR.masterData.REMARK1,
          P_BRAND_CD: rowData.BRAND_CD,
          P_ITEM_CD: rowData.ITEM_CD,
          P_ZONE_CD: $NC.getValue("#cboQZone_Cd"),
          P_ITEM_STATE: $NC.getValue("#cboQItem_State"),
          P_ITEM_LOT: $NC.getValue("#edtQItem_Lot"),
          P_VALID_DATE: $NC.G_VAR.masterData.VALID_DATE,
          P_BATCH_NO: $NC.G_VAR.masterData.BATCH_NO,
          P_SET_PROC_DIV: $NC.getValueRadioGroup("rgbSet_Item_Div"),
          P_CONFIRM_QTY: rowData.SET_INPUT_QTY,
          P_CRUD: rowData.CRUD
        };
        subDS.push(saveData);
      }
    }
  }

  if ($NC.G_VAR.masterData.CRUD === "R" && subDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/LC02040E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_ETC_DATE: $NC.G_VAR.masterData.ETC_DATE,
      P_ETC_NO: $NC.G_VAR.masterData.ETC_NO,
      P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
      P_CRUD: $NC.G_VAR.masterData.CRUD
    }),
    P_DS_SUB: $NC.toJson(subDS),
    P_PROCESS_CD: $NC.G_VAR.userData.P_PROCESS_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError);
}

/**
 * 삭제 버튼 클릭 이벤트 처리(지시내역 그리드 행 삭제)
 */
function _Delete() {

}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "SET_STOCK_QTY",
    field: "SET_STOCK_QTY",
    name: "출고가능량",
    cssClass: "align-right",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "SET_INPUT_QTY",
    field: "SET_INPUT_QTY",
    name: "변환수량",
    minWidth: 60,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상단그리드(상품정보) 초기값 설정
 */
function grdDetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: null,
    sortCol: "ITEM_CD",
    gridOptions: options,
    canExportExcel: false
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

/**
 * 상단 그리드 행 선택 변경 했을 경우
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

  // 변수 초기화
  $NC.setInitGridVar(G_GRDSUB);
  onGetSub({
    data: null
  });

  // 파라메터 세팅
  var rowData = G_GRDDETAIL.data.getItem(row);
  G_GRDSUB.queryParams = $NC.getParams({
    P_BRAND_CD: rowData.BRAND_CD,
    P_ITEM_CD: rowData.ITEM_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LA01010E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
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
  case "SET_INPUT_QTY":
    if (isNaN(rowData.SET_INPUT_QTY)) {
      rowData.SET_INPUT_QTY = "0";
    } else {
      if (Number(rowData.SET_STOCK_QTY) < Number(rowData.SET_INPUT_QTY)) {
        alert("변환수량이 가능수량을 초과할수 없습니다.");
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: args.row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("SET_INPUT_QTY"),
          editMode: true
        });
      }
    }

    // 구성상품내역 변환수량 변경
    var rowCount = G_GRDSUB.data.getLength();
    for ( var row = 0; row < rowCount; row++) {
      var rowSubData = G_GRDSUB.data.getItem(row);
      rowSubData.SET_INPUT_QTY = rowSubData.SET_ITEM_QTY * rowData.SET_INPUT_QTY;
      G_GRDSUB.data.updateItem(rowSubData.id, rowSubData);
    }

    // 재고내역 변환수량 그리드 강제로 EditorLock
    setTimeout(function() {
      G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
    }, 150);
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "C";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
}

/**
 * 재고 내역 그리드 입력 체크
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
    if ($NC.isNull(rowData.SET_INPUT_QTY) || Number(rowData.SET_INPUT_QTY) < 1) {
      alert("변환수량에 0보다 큰 수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("SET_INPUT_QTY"),
        editMode: true
      });
      return false;
    }

    if (Number(rowData.SET_STOCK_QTY) < Number(rowData.SET_INPUT_QTY)) {
      alert("변환수량이 가능수량을 초과할수 없습니다.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("SET_INPUT_QTY"),
        editMode: true
      });
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdSubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "SET_ITEM_CD",
    field: "SET_ITEM_CD",
    name: "구성상품코드",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "SET_ITEM_NM",
    field: "SET_ITEM_NM",
    name: "구성상품명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SET_ITEM_QTY",
    field: "SET_ITEM_QTY",
    name: "구성수량",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SET_INPUT_QTY",
    field: "SET_INPUT_QTY",
    name: "변환수량",
    minWidth: 60,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 구성상품 데이터 그리드 초기값 설정
 */
function grdSubInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: "LC02040E.RS_POP_SUB2",
    sortCol: "ITEM_CD",
    gridOptions: options,
    canExportExcel: false
  });

  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
}

/**
 * 구성상품 데이터 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
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

/**
 * 현재고 검색후 처리
 * 
 * @param ajaxData
 */
function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);

    // 변수 초기화
    $NC.setInitGridVar(G_GRDSUB);
    onGetSub({
      data: null
    });

    alert("세트상품작업할 재고가 없습니다.");
  }
}

/**
 * 구성상품내역 검색후 처리
 * 
 * @param ajaxData
 */
function onGetSub(ajaxData) {

  $NC.setInitGridData(G_GRDSUB, ajaxData);
  if (G_GRDSUB.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDSUB, 0);
  } else {
    $NC.setGridDisplayRows("#grdSub", 0, 0);
  }
}

/**
 * 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

  var BU_CD = $NC.getValue("#edtBu_Cd");

  $NP.showOwnBranPopup({
    P_CUST_CD:  $NC.G_USERINFO.CUST_CD,   
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onBuBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onBuBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);

    $NC.setValue("#edtQSet_Item_Cd");
    $NC.setValue("#edtQSet_Item_Nm");
  }

  onChangingCondition();
}

/**
 * 세트상품 검색 팝업 표시
 */
function showSetItemPopup() {

  var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
  if ($NC.isNull(BRAND_CD)) {
    alert("브랜드를 입력하십시오.");
    $NC.setFocus("#edtQBrand_Cd");
    return;
  }

  $NP.showItemPopup({
    requestUrl: "/LC02040E/getDataSet.do",
    queryId: "LC02040E.RS_POP_SUB3",
    queryParams: {
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: "%",
      P_VIEW_DIV: "2"
    }
  }, onSetItemPopup, function() {
    $NC.setFocus("#edtQSet_Item_Cd", true);
  });
}

/**
 * 상품 검색 팝업에서 상품선택 혹은 취소 했을 경우
 */
function onSetItemPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQSet_Item_Cd", resultInfo.ITEM_CD);
    $NC.setValue("#edtQSet_Item_Nm", resultInfo.ITEM_NM);

  } else {
    $NC.setValue("#edtQSet_Item_Cd");
    $NC.setValue("#edtQSet_Item_Nm");
    $NC.setFocus("#edtQSet_Item_Cd", true);
  }

  onChangingCondition();
}

/**
 * 로케이션 검색 이미지 클릭
 */
function showLocationPopup() {

  $NP.showLocationPopup({
    requestUrl: "/LC02040E/getDataSet.do",
    queryId: "LC02040E.RS_POP_SUB5",
    queryParams: {
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_LOCATION_CD: "%"
    }
  }, onLocationPopup, function() {
    $NC.setFocus("#edtLocation_Cd", true);
  });
}

/**
 * 로케이션 검색 팝업창에서 행 클릭 했을 경우 처리
 * 
 * @param resultInfo
 */

function onLocationPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.masterData.LOCATION_CD = resultInfo.LOCATION_CD;
    $NC.setValue("#edtLocation_Cd", resultInfo.LOCATION_CD);
  } else {
    $NC.G_VAR.masterData.LOCATION_CD = "";
    $NC.setValue("#edtLocation_Cd");
    $NC.setFocus("#edtLocation_Cd", true);
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

/**
 * 저장에 실패 했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
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
