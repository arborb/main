/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null,
    SUM_ENTRY_QTY: 0,
    SUM_CHACK_QTY: 0,

  });

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel); // 닫기버튼
  $("#btnStockSearch").click(_Inquiry); // 재고팝업에서 조회버튼클릭
  $("#btnEntrySave").click(_Save); // 저장 버튼
  $("#btnSave").click(btnSave); // 저장 버튼

  // 그리드 초기화
  grdSubEInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  SUM_PUTAWAY_QTY: 0;
  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "R") {

    $NC.setValue("#edtQOutbound_No", $NC.G_VAR.userData.P_OUTBOUND_NO);

    $NC.setValue("#edtQOutbound_Date", $NC.G_VAR.userData.P_OUTBOUND_DATE);

    $NC.setValue("#edtQLine_No", $NC.G_VAR.userData.P_LINE_NO);
    $NC.setValue("#edtQItem_Cd", $NC.G_VAR.userData.P_ITEM_CD);
    $NC.setValue("#edtQItem_Nm", $NC.G_VAR.userData.P_ITEM_NM);
    $NC.setValue("#edtQBrand_Cd", $NC.G_VAR.userData.P_BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", $NC.G_VAR.userData.P_BRAND_NM);
    $NC.setValue("#cboQItem_State", $NC.G_VAR.userData.P_ITEM_STATE_F);
    $NC.setValue("#edtTot_Entry_Qty", $NC.G_VAR.userData.P_TOTAL_ENTRY_QTY);
    $NC.setValue("#edtTot_Chack_Qty", '0');
    
    
    // 디테일 데이터 세팅
    var subDS = $NC.G_VAR.userData.P_RDSUBE_DS;
    var rowData;
    G_GRDSUBE.data.beginUpdate();
    try {
      for ( var row in subDS) {
        rowData = subDS[row];
        var PUTAWAY_QTY = Number(rowData.PUTAWAY_QTY);
        if (PUTAWAY_QTY > 0) {
          var newRowData = {
            CENTER_CD: rowData.CENTER_CD,
            BU_CD: rowData.BU_CD,
            INBOUND_DATE: rowData.INBOUND_DATE,
            INBOUND_DATE: rowData.INBOUND_NO,
            LINE_NO: '',
            PUTAWAY_LOCATION_CD_D: rowData.PUTAWAY_LOCATION_CD_D,
            ITEM_CD: rowData.ITEM_CD,
            ITEM_LOT: $NC.G_VAR.userData.P_ITEM_LOT,
            ITEM_NM: $NC.getValue("#edtItem_Nm"),
            ITEM_STATE: $NC.getValue("#edtItem_State"),
            VALID_DATE: rowData.VALID_DATE,
            CONFIRM_QTY: rowData.PUTAWAY_QTY,
            BU_LINE_NO: rowData.BU_LINE_NO,
            PUTAWAY_QTY: rowData.PUTAWAY_QTY,
            PUTAWAY_YN: rowData.PUTAWAY_YN,
            CRUD: $NC.G_VAR.userData.P_PROCESS_CD,
            id: $NC.getGridNewRowId(),
          };
          G_GRDSUBE.data.addItem(newRowData);
        }
      }
    } finally {
      G_GRDSUBE.data.endUpdate();
    }
    ;

    $NC.setGridSelectRow(G_GRDSUBE, 0);
  }
}
/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 110;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.topOffset;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_LAYOUT.border1 - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, $NC.G_OFFSET.masterViewHeight);
  $NC.resizeContainer("#divsubView", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - 9);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdSubE", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - $NC.G_LAYOUT.header - 9);
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
 * 조회
 */
function _Inquiry() {// 재고조회
  

  
  var CENTER_CD = $NC.G_VAR.userData.P_CENTER_CD;
  var BU_CD = $NC.G_VAR.userData.P_BU_CD;
  var OUTBOUND_DATE = $NC.G_VAR.userData.P_OUTBOUND_DATE;
  var OUTBOUND_NO = $NC.G_VAR.userData.P_OUTBOUND_NO;
  var ITEM_CD = $NC.G_VAR.userData.P_ITEM_CD;
  var ITEM_STATE = $NC.G_VAR.userData.P_ITEM_STATE; 
  var LINE_NO = $NC.G_VAR.userData.P_LINE_NO; 

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUBE);

  G_GRDSUBE.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: OUTBOUND_DATE,
    P_OUTBOUND_NO: OUTBOUND_NO,
    P_LINE_NO: LINE_NO,
    P_ITEM_STATE: ITEM_STATE,
    P_ITEM_CD: ITEM_CD   

  });

  // 데이터 조회
  $NC.serviceCall("/RO02010E/getDataSet.do", $NC.getGridParams(G_GRDSUBE), onGetStockSelMaster);
}


function onGetStockSelMaster(ajaxData) {

  $NC.setInitGridData(G_GRDSUBE, ajaxData);
  if (G_GRDSUBE.data.getLength() > 0) {

    $NC.setValue("#edtTot_Chack_Qty", $NC.G_VAR.userData.P_TOTAL_ENTRY_QTY);
    if ($NC.isNull(G_GRDSUBE.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSUBE, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSUBE, {
        selectKey: "ITEM_CD",
        selectVal: G_GRDSUBE.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdSubE", 0, 0);
  }
}
/**
 * 신규
 */
function _New() {}

/**
 * 저장
 */
function btnSave() {
  $NC.serviceCall("/RO02010E/callLi_Fw_Directions_Proc.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_OUTBOUND_DATE: $NC.G_VAR.userData.P_OUTBOUND_DATE,
      P_OUTBOUND_NO: $NC.G_VAR.userData.P_OUTBOUND_NO,
      P_USER_ID: $NC.G_USERINFO.USER_ID,
    })
  }, onPutawaySave);
}
/**
 * 저장
 */
function _Save() {

  if (G_GRDSUBE.data.getLength() == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  if (G_GRDSUBE.view.getEditorLock().isActive()) {
    G_GRDSUBE.view.getEditorLock().commitCurrentEdit();
  }

  var itemDs = [ ];
  var chkCnt = 0;
  for (var row = 0; row < G_GRDSUBE.data.getLength(); row++) {
    var rowData = G_GRDSUBE.data.getItem(row);

      if (Number(rowData.PROC_QTY) < 0) {
        alert("등록수량이 0보다 작을 수 없습니다.");
        $NC.setFocusGrid(G_GRDSUBE, row, G_GRDSUBE.view.getColumnIndex("PROC_QTY"), true);
        return false;
      }
      itemDs.push(rowData);
      chkCnt++;
    }

  if (chkCnt == 0) {
    alert("출고등록할 재고를 선택하십시오.");
    return;
  }

  if (itemDs.length == 0) {
    return;
  }
  var TOT_CHACK_QTY = Number($NC.getValue("#edtTot_Chack_Qty"));
  var TOT_ENTRY_QTY = Number($NC.getValue("#edtTot_Entry_Qty"));
  // 현재 선택된 로우 Validation 체크
  if (TOT_CHACK_QTY > TOT_ENTRY_QTY) {

    alert("적치수량을 초과하여 등록할 수 없습니다.");
    return;
  } else if (TOT_CHACK_QTY < TOT_ENTRY_QTY) {

    alert("적치수량 미달로  등록할 수 없습니다.");
    return;
  }

  $NC.serviceCall("/RO02010E/callDelete.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_OUTBOUND_DATE: $NC.G_VAR.userData.P_OUTBOUND_DATE,
      P_OUTBOUND_NO: $NC.G_VAR.userData.P_OUTBOUND_NO,
      P_LINE_NO: $NC.G_VAR.userData.P_LINE_NO,
    })
  });

  
  
  var subDS = [ ];
  var rows = G_GRDSUBE.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    var saveData = {
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_OUTBOUND_DATE: $NC.G_VAR.userData.P_OUTBOUND_DATE,
      P_OUTBOUND_NO: $NC.G_VAR.userData.P_OUTBOUND_NO,
      P_LINE_NO: $NC.G_VAR.userData.P_LINE_NO,
      P_LOCATION_CD :rowData.LOCATION_CD,       
      P_STOCK_DATE :rowData.STOCK_DATE,         
      P_STOCK_IN_GRP :rowData.STOCK_IN_GRP,       
      P_STOCK_ID :rowData.STOCK_ID,          
      P_ITEM_CD :rowData.ITEM_CD,          
      P_ITEM_STATE :rowData.ITEM_STATE,        
      P_ITEM_LOT :rowData.ITEM_LOT,         
      P_VALID_DATE :rowData.VALID_DATE,         
      P_BATCH_NO :rowData.BATCH_NO,        
      P_LOCATION_ID :rowData.LOCATION_ID,        
      P_CONFIRM_QTY :rowData.PROC_QTY,  
    };
    subDS.push(saveData);
  }

  $NC.serviceCall("/RO02010E/save1.do", {
    P_DS_SUB: $NC.toJson(subDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave1);
}
/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave1(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onPutawaySave(ajaxData) {

  onClose();
}

function grdSubEOnGetColumns() {

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
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_DATE",
    field: "STOCK_DATE",
    name: "재고일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "현재고",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PSTOCK_QTY_D",
    field: "PSTOCK_QTY_D",
    name: "출고가능량",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PROC_QTY",
    field: "PROC_QTY",
    name: "등록수량",
    minWidth: 60,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });


  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 그리드 초기값 설정
 */
function grdSubEInitialize() {

  var options = {
      editable: true,
      autoEdit: true,
      frozenColumn: 5
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSubE", {
    columns: grdSubEOnGetColumns(),
    sortCol: "LINE_NO",
    queryId: "WC.POP_RO_LS010NM",
    sortCol: "ITEM_LOT",
    gridOptions: options
  });

  G_GRDSUBE.view.onSelectedRowsChanged.subscribe(grdStockSelMasterOnAfterScroll);
  G_GRDSUBE.view.onCellChange.subscribe(grdStockSelMasterOnCellChange);

}


function grdStockSelMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUBE.lastRow != null) {
    if (row == G_GRDSUBE.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSubE", row + 1);
}




function grdStockSelMasterOnCellChange(e, args) {

  var rowData = args.item;
  if (args.cell === G_GRDSUBE.view.getColumnIndex("PROC_QTY")) {


    
    var rowData1 = G_GRDSUBE.data.getItem(G_GRDSUBE.lastRow);
    var PROC_QTY = Number(rowData1.PROC_QTY);
    var STOCK_QTY = Number(rowData1.STOCK_QTY);
    // var PSTOCK_QTY = Number(rowData1.PSTOCK_QTY);
    
    if (isNaN(PROC_QTY)) {
      alert("수량을 정확히 입력하십시오.");
     
      return;
    }

    if (PROC_QTY > STOCK_QTY) {
      focusCol = G_GRDSUBE.view.getColumnIndex("PROC_QTY");
      
      //rowData.PROC_QTY = PROC_QTY1;
      
      $NC.setFocusGrid(G_GRDSUBE, G_GRDSUBE.lastRow, focusCol, true, true);

      alert("등록수량을 초과해서 검수할 수 없습니다.\n\n수량을 다시 입력하십시오.");
      return;
    }
    
    rowData.PSTOCK_QTY_D =  STOCK_QTY - PROC_QTY;
    
  }


  var summary = $NC.getGridSumVal(G_GRDSUBE, {
    sumKey: ["PROC_QTY"]
  });

  $NC.G_VAR.SUM_CHACK_QTY = summary.PROC_QTY;
  $NC.setValue("#edtTot_Chack_Qty",$NC.G_VAR.SUM_CHACK_QTY);
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }

  G_GRDSUBE.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUBE.lastRowModified = true;
}


/**
 * 저장시 그리드 입력 체크
 */
function grdSubEOnBeforePost(row) {

  if (!G_GRDSUBE.lastRowModified) {
    return true;
  }

  var rowData = G_GRDSUBE.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  if (rowData.CRUD != "R") {

    if ($NC.isNull(rowData.PUTAWAY_LOCATION_CD_D)) {
      alert("적치 로케이션을 지정하십시오.");
      $NC.setGridSelectRow(G_GRDSUBE, {
        selectRow: row,
        activeCell: G_GRDSUBE.view.getColumnIndex("PUTAWAY_LOCATION_CD_D"),
        editMode: true
      });
      return false;
    }

    if ($NC.isNull(rowData.PUTAWAY_QTY)) {
      alert("젝치수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUBE, {
        selectRow: row,
        activeCell: G_GRDSUBE.view.getColumnIndex("PUTAWAY_QTY"),
        editMode: true
      });
      return false;
    } else {
      var PUTAWAY_QTY = Number(rowData.PUTAWAY_QTY);
      if (PUTAWAY_QTY < 1) {
        alert("예정수량은 1보다 작을 수 없습니다.");

        rowData = grdSubEOnCalc(rowData, rowData.PUTAWAY_QTY);
        G_GRDSUBE.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDSUBE, {
          selectRow: row,
          activeCell: G_GRDSUBE.view.getColumnIndex("PUTAWAY_QTY"),
          editMode: true
        });
        return false;
      }
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDSUBE.data.updateItem(rowData.id, rowData);
  }
  return true;
}


/**
 * 그리드에서 상품 선택/취소했을 경우 처리
 * 
 * @param seletedRowData
 */
/*
function grdSubEOnCalc(rowData, Putaway_Qty) {

  if (!$NC.isNull(Putaway_Qty)) {
    rowData.PUTAWAY_QTY = Number(Putaway_Qty);
  }

  var params = {
    TOTAL_AMT: rowData.TOTAL_AMT,// 합계금액
    POLICY_VAL: $NC.G_VAR.userData.P_POLICY_LI190
  };

  rowData.BUY_AMT = $NC.getItem_Amt(params);
  rowData.VAT_AMT = $NC.getVat_Amt(params);
  rowData.TOTAL_AMT = $NC.getTotal_Amt(params);

  return rowData;
}
*/
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

function grdSubEOnPopup(e, args) {

  switch (args.column.field) {
  case "PUTAWAY_LOCATION_CD_D":
    $NP.showLocationPopup({
      P_CENTER_CD: G_GRDSUBE.data.getItem(G_GRDSUBE.lastRow).CENTER_CD,
      P_ZONE_CD: "",
      P_BANK_CD: "",
      P_BAY_CD: "",
      P_LEV_CD: "",
      P_LOCATION_CD: "%"
    }, onLocationPopup, function() {
      $NC.setFocusGrid(G_GRDSUBE, G_GRDSUBE.lastRow, G_GRDSUBE.view.getColumnIndex("PUTAWAY_LOCATION_CD_D"), true, true);
    });
    return;
  }
}

function onLocationPopup(resultInfo) {

  var rowData1 = G_GRDSUBE.data.getItem(G_GRDSUBE.lastRow);
  if ($NC.isNull(rowData1)) {
    return;
  }

  var focusCol;
  var rows = G_GRDSUBE.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (!$NC.isNull(resultInfo)) {
      if (resultInfo.LOCATION_CD == rowData.PUTAWAY_LOCATION_CD_D) {
        alert("중복로케이션 입니다.");
        focusCol = G_GRDSUBE.view.getColumnIndex("PUTAWAY_LOCATION_CD_D");
        rowData1.ZONE_CD = "";
        rowData1.ZONE_NM = "";
        rowData1.BANK_CD = "";
        rowData1.BAY_CD = "";
        rowData1.LEV_CD = "";
        rowData1.PUTAWAY_LOCATION_CD_D = "";
        $NC.setFocusGrid(G_GRDSUBE, G_GRDSUBE.lastRow, focusCol, true, true);
        return;
      }
    }
  }

  if (!$NC.isNull(resultInfo)) {
    rowData1.ZONE_CD = resultInfo.ZONE_CD;
    rowData1.ZONE_NM = resultInfo.ZONE_NM;
    rowData1.BANK_CD = resultInfo.BANK_CD;
    rowData1.BAY_CD = resultInfo.BAY_CD;
    rowData1.LEV_CD = resultInfo.LEV_CD;
    rowData1.PUTAWAY_LOCATION_CD_D = resultInfo.LOCATION_CD;

  } else {
    rowData1.ZONE_CD = "";
    rowData1.ZONE_NM = "";
    rowData1.BANK_CD = "";
    rowData1.BAY_CD = "";
    rowData1.LEV_CD = "";
    rowData1.PUTAWAY_LOCATION_CD_D = "";
    focusCol = G_GRDSUBE.view.getColumnIndex("PUTAWAY_LOCATION_CD_D");
    $NC.setFocusGrid(G_GRDSUBE, G_GRDSUBE.lastRow, focusCol, true, true);
    return;
  }
  focusCol = G_GRDSUBE.view.getColumnIndex("PUTAWAY_QTY");
  if (rowData1.CRUD === "R") {
    rowData1.CRUD = "U";
  }
  G_GRDSUBE.data.updateItem(rowData1.id, rowData1);
  // 수정 상태로 변경
  G_GRDSUBE.lastRowModified = true;
  $NC.setFocusGrid(G_GRDSUBE, G_GRDSUBE.lastRow, focusCol, true, true);
}

