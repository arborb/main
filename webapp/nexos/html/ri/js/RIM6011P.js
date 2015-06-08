/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null
  });
  
  // 그리드 초기화
  grdDetailInitialize();
  
  // 사업부 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
  
  $NC.setInitDatePicker("#dtpQInbound_Date");

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel); // 닫기버튼
  $("#btnSave").click(_Save); // 지시내역 저장 버튼
  $("#btnSearchInfo").click(_Inquiry); // 현재고검색 버튼 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);
    
  // 조회조건 - 물류센터 세팅
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
    }
  });

}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

}
/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.subViewHeight = 40;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight()
      + $NC.G_OFFSET.subViewHeight + $NC.G_LAYOUT.nonClientHeight + $NC.G_LAYOUT.header + $NC.G_LAYOUT.margin1
      + $NC.G_LAYOUT.border1;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, clientHeight);
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
function onClose(resultInfo) {

  $NC.setPopupCloseAction("OK", resultInfo );
  $NC.onPopupClose();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "ORDERER_NM":
    break;
  }
}

/**
 * 반품내역 조회
 */
function _Inquiry() {

  $NC.setInitGridVar(G_GRDDETAIL);

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var INBOUND_DATE = $NC.getValue("#dtpQInbound_Date");
  var ORDERER_NM = $NC.getValue("#edtQOrderer_Nm");

  G_GRDDETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_INBOUND_DATE: INBOUND_DATE,
    P_ORDERER_NM: ORDERER_NM
  });
  
  // 데이터 조회
  $NC.serviceCall("/RIM6010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

}

/**
 * New 처리
 */
function _New() {
  
}

/**
 * 반품내역 검색후 처리
 * 
 * @param ajaxData
 */
function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: new Array("INBOUND_DATE", "INBOUND_NO"),
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }

}

/**
 * 저장버튼 클릭 이벤트 처리
 */
function _Save() {

  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }

  var paramDs = [ ];
  var chkCnt = 0;
  for (var row = 0; row < G_GRDDETAIL.data.getLength(); row++) {
    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      paramDs.push(rowData);
      chkCnt++;
    }
  }

  if (chkCnt == 0) {
    alert("반품내역 정보를 선택하시기바랍니다.");
    return;
  }

  if (paramDs.length == 0) {
    alert("추가할 반품내역정보가 없습니다.");
    return;
  }

  var rowCount = G_GRDDETAIL.data.getLength();
  if (rowCount == 0) {
    G_GRDDETAIL.lastRow = null; // 출고예정등록 상세정보 그리드의 length가 0일 경우 현재고에 0이 표시되는것 막기 위해 추가
  }
  /*
  for ( var row in paramDs) {
    rowData = paramDs[row];

    var newRowData = {
      CENTER_CD: rowData.CENTER_CD,
      BU_CD: rowData.BU_CD,
      ORDER_DATE: rowData.INBOUND_DATE,
      ORDER_NO: rowData.INBOUND_NO,
      INBOUND_DATE: rowData.INBOUND_DATE,
      INBOUND_NO: rowData.INBOUND_NO,
      LINE_NO: rowData.LINE_NO,
      REFUND_PRICE_TYPE: rowData.REFUND_PRICE_TYPE,
      REFUND_SHIP_PRICE_CD: rowData.REFUND_SHIP_PRICE_CD,
      SHIP_PRICE: rowData.SHIP_PRICE,
      CARRIER_DIV: rowData.CARRIER_DIV,
      REFUND_WB_NO: rowData.REFUND_WB_NO,
      ORDERER_NM: rowData.ORDERER_NM,
      BU_KEY: rowData.BU_KEY,
      BU_NO: rowData.BU_NO,
      REMARK1: rowData.REMARK1,
      ITEM_CD: rowData.ITEM_CD,
      ITEM_BAR_CD: rowData.ITEM_BAR_CD,
      ITEM_NM: rowData.ITEM_NM,
      BRAND_NM: rowData.BRAND_NM,
      DEAL_ID: rowData.DEAL_ID,
      OPTION_ID: rowData.OPTION_ID,
      ITEM_STATE: rowData.ITEM_STATE,
      ITEM_STATE_F:rowData.ITEM_STATE_F,
      QTY_IN_BOX: rowData.QTY_IN_BOX,
      ENTRY_QTY: rowData.ENTRY_QTY,
      INSPECT_QTY: rowData.INSPECT_QTY,
      RETURN_DIV: rowData.REMAIN_QTY,
      RETURN_TEXT: rowData.REMAIN_QTY,
      RETURN_COMMENT: rowData.REMAIN_QTY,
      REMAIN_QTY: rowData.REMAIN_QTY,
      id: $NC.getGridNewRowId(),
      CRUD: "C"
    };
//    resultDs.data.addItem(newRowData);
  }

//  $NC.setGridSelectRow(G_GRDDETAIL, rowCount);
//  $NC.setGridDisplayRows("#grdDetail", rowCount + 1, G_GRDDETAIL.data.getLength());

  // 수정 상태로 변경
//  G_GRDDETAIL.lastRowModified = true;
*/
  onClose(paramDs);
}

/**
 * 삭제 버튼 클릭 이벤트 처리
 */
function _Delete() {

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

  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDDETAIL, args.row);

  var rowData = G_GRDDETAIL.data.getItem(args.row);

  if (args.cell == G_GRDDETAIL.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  // G_GRDDETAIL.lastRowModified = true;
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdDetailOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    maxWidth: 30,
    resizable: false,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "INBOUND_NO",
    field: "INBOUND_NO",
    name: "주문번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_HP",
    field: "ORDERER_HP",
    name: "주문자휴대폰",
    minWidth: 110,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "주문번호",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_KEY",
    field: "BU_KEY",
    name: "주문ID",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 40,
    cssClass: "align-center"
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
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 85,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 기타입고 지시 데이터 그리드 초기값 설정
 */
function grdDetailInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "RIM6010E.RS_MASTER1",
    sortCol: "INBOUND_NO",
    gridOptions: options,
    canExportExcel: false
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onHeaderClick.subscribe(grdDetailOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDDETAIL, "CHECK_YN");
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDDETAIL.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDDETAIL.view.getEditorLock().isActive()
          && !G_GRDDETAIL.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDDETAIL.data.getLength();
      var rowData;
      G_GRDDETAIL.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDDETAIL.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDDETAIL.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

/**
 * 반품예정내역 데이터 그리드 행 선택 변경 했을 경우
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
 * 반품예정내역 데이터 그리드 수정일 경우 편집 불가 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdDetailOnBeforeEditCell(e, args) {

  var rowData = args.item;
  if (rowData.CRUD == "R" || rowData.CRUD == "U") {
    if (args.cell === G_GRDDETAIL.view.getColumnIndex("ETC_DIV_F")
        || args.cell === G_GRDDETAIL.view.getColumnIndex("ETC_COMMENT")) {
      return true;
    } else {
      return false;
    }
  }

  return true;
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
 * 그리드의 로케이션 / 상품의 검색 버튼 클릭시 처리
 */
function grdDetailOnPopup(e, args) {

  switch (args.column.field) {
  case "LOCATION_CD":
    $NP.showLocationPopup({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_ZONE_CD: "",
      P_BANK_CD: "",
      P_BAY_CD: "",
      P_LEV_CD: "",
      P_LOCATION_CD: "%"
    }, onGridLocationPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("LOCATION_CD"), true, true);
    });
    break;
  case "ITEM_CD":
    $NP.showItemPopup({
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_ITEM_CD: "%",
      P_VIEW_DIV: "1",
      P_DEPART_CD: "%",
      P_LINE_CD: "%",
      P_CLASS_CD: "%"
    }, onGridItemPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
    });
    break;
  }
}

/**
 *  반품예정내역 그리드 입력 체크
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
    if ($NC.isNull(rowData.ITEM_CD)) {
      alert("상품코드를 선택하십시오.");
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
        activeCell: G_GRDDETAIL.view.getColumnIndex("ITEM_STATE_F"),
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
    if ($NC.isNull(rowData.LOCATION_CD)) {
      alert("로케이션을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("LOCATION_CD"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.CONFIRM_QTY) || Number(rowData.CONFIRM_QTY) == 0) {
      alert("등록수량에 0보다 큰 수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.ETC_DIV)) {
      alert("사유구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ETC_DIV_F"),
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

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQBu_Cd", true);
  });

}

/**
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
function onUserBuPopup(seletedRowData) {

  if (!$NC.isNull(seletedRowData)) {
    $NC.setValue("#edtQBu_Cd", seletedRowData.BU_CD);
    $NC.setValue("#edtQBu_Nm", seletedRowData.BU_NM);
    $NC.setValue("#edtQCust_Cd", seletedRowData.CUST_CD);
    setFocusScan();
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }

}