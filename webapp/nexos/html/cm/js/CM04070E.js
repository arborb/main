function _Initialize() {
  
  grdMasterInitialize();
  grdDetailInitialize();
  
  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showOwnBranPopup);
  setUserProgramPermission();
  
  

  $NC.setInitDatePicker("#dtpQReq_Date1");
  $NC.setInitDatePicker("#dtpQReq_Date2");
}
  
function _OnLoaded() {
  
  $NC.setInitSplitter("#divMasterView", "h", 300);
  
}

function _SetResizeOffset() {
  
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;

}

function _OnResize(parent) {
  
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;
  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);
  $NC.resizeGrid("#grdMaster", clientWidth, $("#grdMaster").parent().height() - $NC.G_LAYOUT.header);
  $NC.resizeGrid("#grdDetail", clientWidth, $("#grdDetail").parent().height() - $NC.G_LAYOUT.header);
  
}

function _OnConditionChange(e, view, val) {
  
  var id = view.prop("id").substr(4).toUpperCase();
  
  switch (id) { 
  case "BU_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: val
      };
      O_RESULT_DATA = $NP.getUserBuInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onUserBuPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showUserBuPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onUserBuPopup, onUserBuPopup);
    }
    return;
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.G_USERINFO.BRAND_CD;
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBranPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup, onOwnBrandPopup);
    }
    return;
  case "ITEM_NM":
    break;
  case "REQ_DATE":
    $NC.setValueDatePicker(view, val, "요청일자를 정확히 입력하십시오.");
    break;
  }
}

function _Inquiry() {

  var BU_CD = $NC.getValue("#edtQBu_Cd",true);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
//  if ($NC.isNull(BRAND_CD)) {
//    alert("판매사를 선택하십시오.");
//    $NC.setFocus("#edtQBrand_Cd");
//    return;
//  }

  
  
  var REQ_DATE1 = $NC.getValue("#dtpQReq_Date1");
  if ($NC.isNull(REQ_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQReq_Date1");
    return;
  }

  var REQ_DATE2 = $NC.getValue("#dtpQReq_Date2");
  if ($NC.isNull(REQ_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQReq_Date2");
    return;
  }

  if (REQ_DATE1 > REQ_DATE1) {
    alert("요청일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQReq_Date1");
    return;
  }
  
  
  
  var ITEM_NM = $NC.getValue("#edtQItem_Nm");
  var CREATE_YN_DIV = $(':radio[name="rgbQCreate_Yn_Div"]:checked').val();

  $NC.clearGridData(G_GRDMASTER);
  $NC.clearGridData(G_GRDDETAIL);
  
  G_GRDMASTER.queryParams = $NC.getParams({
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_NM: ITEM_NM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });
  
  $NC.serviceCall("/CM04070E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
  G_GRDDETAIL.queryParams = $NC.getParams({
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_REQ_DATE1: REQ_DATE1,
    P_REQ_DATE2: REQ_DATE2,
    P_ITEM_NM: ITEM_NM,
    P_CREATE_YN: CREATE_YN_DIV,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });
  $NC.serviceCall("/CM04070E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
}

function _New() {
  
}

function _Save() {
  
}

function onSave(ajaxData) {
  
  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: new Array("ORDER_DATE", "ORDER_NO")
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
  
}

function onSaveError(ajaxData) {
  
  $NC.onError(ajaxData);
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (rowData.CRUD === "D") {
    rowData.CRUD = "U";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
    G_GRDMASTER.lastRowModified = true;
  }
}

function _Delete() {
  
}

function _Cancel() {
  
}

function _Print(printIndex, printName) {
  
}

function grdMasterOnGetColumns() {
  
  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "판매사코드",
    minWidth: 80,
    cssClass: "align-center"
  });  
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "판매사명",
    minWidth: 100
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
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_FULL_NM",
    field: "ITEM_FULL_NM",
    name: "정식명칭",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_DIV_F",
    field: "ITEM_DIV_F",
    name: "상품구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "KEEP_DIV_F",
    field: "KEEP_DIV_F",
    name: "보관구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_BAR_CD",
    field: "ITEM_BAR_CD",
    name: "상품바코드",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "BOXING_YN",
    field: "BOXING_YN",
    name: "합포장가능여부",
    minWidth: 100,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_DIV_F",
    field: "DEAL_DIV_F",
    name: "거래구분",
    minWidth: 120,
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

function grdMasterInitialize() {
  
  var options = {
    frozenColumn: 3
  };
  
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CM04070E.RS_MASTER",
    sortCol: "ITEM_CD",
    gridOptions: options
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {
  
  var row = args.rows[0];
  
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdDetailOnGetColumns() {
  
  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "REQ_NO",
    field: "REQ_NO",
    name: "요청순번",
    minWidth: 120
  });
  
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "브랜드코드",
    minWidth: 100,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdDetailOnPopup
    }
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "판매사명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 150,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_FULL_NM",
    field: "ITEM_FULL_NM",
    name: "정식명칭",
    minWidth: 150,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 100,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_DIV_F",
    field: "ITEM_DIV_F",
    name: "상품구분",
    minWidth: 120,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "ITEM_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "ITEM_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "KEEP_DIV_F",
    field: "KEEP_DIV_F",
    name: "보관구분",
    minWidth: 120,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "KEEP_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "KEEP_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_BAR_CD",
    field: "ITEM_BAR_CD",
    name: "상품바코드",
    minWidth: 120,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "IN_UNIT_CD_F",
    field: "IN_UNIT_CD_F",
    name: "입고단위",
    minWidth: 120,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "IN_UNIT_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "IN_UNIT_CD",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "OUT_UNIT_CD_F",
    field: "OUT_UNIT_CD_F",
    name: "출고단위",
    minWidth: 120,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "OUT_UNIT_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "OUT_UNIT_CD",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "CREATE_YN",
    field: "CREATE_YN",
    name: "승인여부",
    minWidth: 100,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {
  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3
  };
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "CM04070E.RS_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options,
    onFilter: grdDetailOnFilter
  });
  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

function grdDetailOnBeforeEditCell(e, args) {
  
  var rowData = args.item;
  
  if (args.column.field === "ITEM_NM") {
    if (rowData) {
      if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
        return false;
      }
    }
  }
  if (args.column.field === "CREATE_YN" || rowData.CREATE_YN === "Y") {
    
    return false;
    
  }
  
  return true;
}

function grdDetailOnCellChange(e, args) {
  
  var rowData = args.item;
  
  switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
  
  case "REQ_NO":
    break;
  case "ITEM_NM":
    break;
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.BRAND_CD)) {
      P_QUERY_PARAMS = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
       ,P_BRAND_CD: rowData.BRAND_CD,
      };
      O_RESULT_DATA = $NP.getUserBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onUserBrandPopup1(O_RESULT_DATA[0]);
    } else {
      $NP.showUserBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onUserBrandPopup1, onUserBrandPopup1);
    }
    return;
  }
  
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  G_GRDDETAIL.lastRowModified = true;
  
}

function grdDetailOnPopup(e, args) {

  if (args.column.field === "BRAND_CD") {
    $NP.showUserBrandPopup({
      P_USER_ID: $NC.G_USERINFO.USER_ID
     ,P_BRAND_CD: "%",
    }, onUserBrandPopup1, function() {
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("BRAND_CD"), true, true);

    });
  }
}

function grdDetailOnFilter(item) {
  
  return item.CRUD !== "D";
  
}

function grdDetailOnNewRecord(args) {
  
  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("BRAND_CD"), true);
  
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
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

function grdDetailOnBeforePost(row) {
  
  if (!G_GRDDETAIL.lastRowModified) {  
    return true;
  }
  
  var rowData = G_GRDDETAIL.data.getItem(row);
  
  if ($NC.isNull(rowData)) {
    return true;
  }
  
  if (rowData.CRUD == "D") {
    return true;
  }
  
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.ITEM_NM)) {
      G_GRDDETAIL.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL, row- 1);
        setTimeout(function() {
          $NC.setGridDisplayRows("#grdDetail", row, G_GRDDETAIL.data.getLength());
        }, 300);
      }
      return true;
    }
  }
  
  if (rowData.CRUD != "R") {
  }
  
  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function onGetMaster(ajaxData) {
  
  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  
  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
  
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
  
}

function onGetDetail(ajaxData) {
  
  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: ["BRAND_CD", "ITEM_NM", "REQ_DATE", "REQ_NO"],
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
}


function onUserBrandPopup1(resultInfo) {

  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().cancelCurrentEdit();
  }
  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.BRAND_CD = resultInfo.BRAND_CD;
    rowData.BRAND_NM = resultInfo.BRAND_NM;
    rowData.CUST_CD  = $NC.G_USERINFO.CUST_CD;
  } else {
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    rowData.CUST_CD = "";
    focusCol = G_GRDDETAIL.view.getColumnIndex("BRAND_CD");
  }

  G_GRDDETAIL.data.updateItem(rowData.id, rowData);

  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;

  $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true);
}

function showOwnBranPopup() {

  var CUST_CD = $NC.G_USERINFO.CUST_CD;

  $NP.showOwnBranPopup({
    P_CUST_CD: $NC.G_USERINFO.CUST_CD,
    P_BU_CD: $NC.G_USERINFO.BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
}

function setUserProgramPermission() {
  
  var permission = $NC.getProgramPermission();
  
  if (permission.canSave) {
    $("#btnReqNew").click(reqNew);
    $("#btnReqSave").click(reqSave);
  }
  
  $NC.setEnable("#btnReqNew", permission.canSave);
  $NC.setEnable("#btnReqSave", permission.canSave);
  
  if (permission.canDelete) {
    $("#btnReqDelete").click(reqDelete);
  }
  $NC.setEnable("#btnReqDelete", permission.canDelete);
  
  if (permission.canConfirm) {
    
  }
}





function reqNew() {
  
  /*
  if ($NC.isNull(BRAND_CD)) {
    alert("판매사를 선택하십시오.");
    $NC.setFocus("#edtQBrand_Cd");
    return;
  }
  */
  
  var REQ_DATE1 = $NC.getValue("#dtpQReq_Date1");
  
  if ($NC.isNull(REQ_DATE1)) {
    alert("요청일자를 입력하십시오.");
    $NC.setFocus("#dtpQReq_Date1");
    return;
  }
  
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }
  var rowCount = G_GRDDETAIL.data.getLength();
  if (rowCount > 0) {
    var rowData = G_GRDDETAIL.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      $NC.setFocusGrid(G_GRDDETAIL, rowCount - 1, G_GRDDETAIL.view.getColumnIndex("ITEM_NM"), true);
      return;
    }
  }
  
  var newRowData = {
    BRAND_CD: "",
    ITEM_NM: "",
    REQ_DATE:  $NC.setInitDatePicker(),
    REQ_NO: "",
    ITEM_FULL_NM: "",
    ITEM_SPEC: "",
    ITEM_DIV: "",
    ITEM_DIV_F: "",
    CUST_CD: $NC.G_USERINFO.CUST_CD,
    KEEP_DIV: "",
    KEEP_DIV_F: "",
    ITEM_BAR_CD: "",
    IN_UNIT_CD: "",
    IN_UNIT_CD_F: "",
    OUT_UNIT_CD: "",
    OUT_UNIT_CD_F: "",
    CREATE_YN: "N",
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };
  G_GRDDETAIL.data.addItem(newRowData);
  $NC.setGridSelectRow(G_GRDDETAIL, rowCount);
  
  if (rowCount === 0) {
    $NC.setGridDisplayRows("#grdDetail", rowCount + 1, G_GRDDETAIL.data.getLength());
  }
  
  G_GRDDETAIL.lastRowModified = true;
  
  grdDetailOnNewRecord({
    row: rowCount,
    rowData: newRowData
  });
}

function reqSave() {
  
  
  var REQ_DATE = $NC.getValue("#dtpQReq_Date1");
  
  if ($NC.isNull(REQ_DATE1)) {
    alert("요청일자를 입력하십시오.");
    $NC.setFocus("#dtpQReq_Date1");
    return;
  }
  
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  
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
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_NM: rowData.ITEM_NM,
        P_REQ_DATE: rowData.REQ_DATE,
        P_REQ_NO: rowData.REQ_NO,
        P_ITEM_FULL_NM: rowData.ITEM_FULL_NM,
        P_ITEM_SPEC: rowData.ITEM_SPEC,
        P_ITEM_DIV: rowData.ITEM_DIV,
        P_CUST_CD: $NC.G_USERINFO.CUST_CD,
        P_KEEP_DIV: rowData.KEEP_DIV,
        P_ITEM_BAR_CD: rowData.ITEM_BAR_CD,
        P_IN_UNIT_CD: rowData.IN_UNIT_CD,
        P_OUT_UNIT_CD: rowData.OUT_UNIT_CD,
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
  
  if (detailDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }
  
  $NC.serviceCall("/CM04070E/save.do", {
    P_DS_MASTER: $NC.toJson(detailDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave);
}

function reqDelete() {
  
  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }
  
  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  
  if (rowData.CRUD === "C" || rowData.CRUD === "N") {
    G_GRDDETAIL.data.deleteItem(rowData.id);
  } else {
    if (rowData.CREATE_YN === "Y") {
      return;
    }
    rowData.CRUD = "D";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
    G_GRDDETAIL.data.refresh();
  }
  
  if (G_GRDDETAIL.lastRow > 1) {
    $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.lastRow - 1);
  } else {
    G_GRDDETAIL.lastRow = null;
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }
  G_GRDDETAIL.lastRowModified = false;
}


/**
 * 검색조건의 사업부 검색 팝업 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BRAND_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQBu_Cd", true);
  });
}

/**
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }

  // 브랜드 초기화
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");

  onChangingCondition();
}
