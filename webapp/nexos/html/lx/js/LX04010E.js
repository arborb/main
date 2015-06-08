/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({
  // });

  // 탭 초기화
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 그리드 초기화
  grdT1MasterInitialize();

  // 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQVendor_Cd").click(showVendorPopup);
  $("#btnQDelivery_Cd").click(showDeliveryPopup);
  $("#btnDividePallet").click(dividePallet);

  $NC.setInitDatePicker("#dtpQXDock_Date1", null, "F"); // 당월의 첫쨋날 취득
  $NC.setInitDatePicker("#dtpQXDock_Date2");

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
    }
  });
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $NC.G_LAYOUT.border1;
  $NC.G_OFFSET.gridHeightOffset = $NC.G_OFFSET.nonClientHeight + $NC.G_LAYOUT.header + $NC.G_LAYOUT.tabHeader
      + $("#divTopViewT1").outerHeight() + ($NC.G_LAYOUT.border1 * 3);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border2;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientWidth -= $NC.G_LAYOUT.border1;
  clientHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset;
  switch ($("#divMasterView").tabs("option", "active")) {
  case 0:
    $NC.resizeGrid("#grdT1Master", clientWidth, clientHeight);
    break;
  case 1:
    $NC.resizeGrid("#grdT2Master", clientWidth, clientHeight);
    break;
  }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  // 브랜드 Key 입력
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
  case "XDOCK_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "XDOCK_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
  case "VENDOR_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_VENDOR_CD: val,
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
  }

  onChangingCondition();
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
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var XDOCK_DATE1 = $NC.getValue("#dtpQXDock_Date1");
  if ($NC.isNull(XDOCK_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQXDock_Date1");
    return;
  }
  var XDOCK_DATE2 = $NC.getValue("#dtpQXDock_Date2");
  if ($NC.isNull(XDOCK_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQXDock_Date2");
    return;
  }
  if (XDOCK_DATE1 > XDOCK_DATE2) {
    alert("CD일자 검색 범위 오류입니다.");
    $NC.setFocus("#dtpQXDock_Date1");
    return;
  }

  var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);
  var BU_NO = $NC.getValue("#edtQBu_No");
  var DELIVERY_CD = $NC.getValue("#edtQDelivery_Cd", true);
  var RDELIVERY_CD = $NC.getValue("#edtQRDelivery_Cd", true);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1MASTER);

  G_GRDT1MASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_XDOCK_DATE1: XDOCK_DATE1,
    P_XDOCK_DATE2: XDOCK_DATE2,
    P_VENDOR_CD: VENDOR_CD,
    P_BU_NO: BU_NO,
    P_DELIVERY_CD: DELIVERY_CD,
    P_RDELIVERY_CD: RDELIVERY_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LX04010E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);
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
  
  var process_Cd;
  switch($("#divMasterView").tabs("option", "active")) {
  case "1":
    
    process_Cd = "T1";
    
    // 현재 수정모드면
    if (G_GRDT1MASTER.view.getEditorLock().isActive()) {
      G_GRDT1MASTER.view.getEditorLock().commitCurrentEdit();
    }
    
    var d_DS = [ ];
    var cu_DS = [ ];
    var rowData = {};
    var rowCount = G_GRDT1MASTER.data.getLength();
    for (var row = 0; row < rowCount; row++) {
      rowData = G_GRDT1MASTER.data.getItem(row);
      if (rowData.CRUD !== "R") {
        var saveData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_XDOCK_DATE: rowData.XDOCK_DATE,
          P_XDOCK_NO: rowData.XDOCK_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_DELIVERY_CD: rowData.DELIVERY_CD,
          P_RDELIVERY_CD: rowData.RDELIVERY_CD,
          P_CUST_CD:  rowData.CUST_CD,
          P_ASN_NO: rowData.ASN_NO,
          P_SHIP_ID: rowData.SHIP_ID,
          P_CONFIRM_QTY: rowData.CONFRIM_QTY,
          P_USER_ID: $NC.G_USERINFO.USER_ID,
          P_CRUD: rowData.CRUD
        };
        
        if (rowData.CRUD === "D") {
          d_DS.push(saveData);
        } else {
          cu_DS.push(saveData);
        }
      }
    }
    break;
  }
  
  var saveDS = d_DS.concat(cu_DS);
  if (saveDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }
  
  $NC.serviceCall("/LX04010E/save.do", {
    P_DS_MASTER: $NC.toJson(saveDS),
    P_PROCESS_CD: process_Cd,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveC, onSaveError);
  
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

}

/**
 * Tab Active Event
 * 
 * @param event
 * @param ui
 *          newTab: The tab that was just activated.<br>
 *          oldTab: The tab that was just deactivated.<br>
 *          newPanel: The panel that was just activated.<br>
 *          oldPanel: The panel that was just deactivated
 */
function tabOnActivate(event, ui) {

  _OnResize($(window));
}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "VENDOR_CD",
    field: "VENDOR_CD",
    name: "공급처",
    minWidth: 70,
    formatter: isFirstFormatter
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처명",
    minWidth: 120,
    formatter: isFirstFormatter
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_DATE",
    field: "XDOCK_DATE",
    name: "CD일자",
    minWidth: 90,
    cssClass: "align-center",
    formatter: isFirstFormatter
  });
  $NC.setGridColumn(columns, {
    id: "XDOCK_NO",
    field: "XDOCK_NO",
    name: "CD번호",
    minWidth: 90,
    cssClass: "align-center",
    formatter: isFirstFormatter
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90,
    formatter: isFirstFormatter
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 150,
    formatter: isFirstFormatter
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80,
    formatter: isFirstFormatter
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100,
    formatter: isFirstFormatter
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right",
    formatter: isFirstFormatter
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_CD",
    field: "DELIVERY_CD",
    name: "배송처",
    minWidth: 80,
    formatter: isFirstFormatter
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_NM",
    field: "DELIVERY_NM",
    name: "배송처명",
    minWidth: 150,
    formatter: isFirstFormatter
  });
  $NC.setGridColumn(columns, {
    id: "OUT_QTY",
    field: "OUT_QTY",
    name: "출고수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: isFirstFormatter
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_ID",
    field: "SHIP_ID",
    name: "팔레트 번호",
    minWidth: 100,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "PLT출고수량",
    minWidth: 100,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80,
    cssClass: "align-center",
    formatter: isFirstFormatter
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 80,
    formatter: isFirstFormatter
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LX04010E.RS_T1_MASTER",
    sortCol: "RDELIVERY_CD",
    gridOptions: options
  });

  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
  G_GRDT1MASTER.view.onCellChange.subscribe(grdT1MasterOnCellChange);
}

/**
 * 상품별출고내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT1MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1MASTER.lastRow != null) {
    if (row == G_GRDT1MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Master", row + 1);
}

function grdT1MasterOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDT1MASTER.view.getColumnField(args.cell)) {
  case "SHIP_ID":

    break;
  case "CONFIRM_QTY":

    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDT1MASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDT1MASTER.lastRowModified = true;
}

function grdT2MasterOnBeforePost(row) {

  if (!G_GRDT2MASTER.lastRowModified) {
    return true;
  }

  var rowData = G_GRDT2MASTER.data.getItem(row);
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
      if (ENTRY_QTY < 0) {
        alert("등록수량이 0보다 작을 수 없습니다.");

        rowData.ENTRY_QTY = rowData.ORDER_QTY;
        rowData = grdDetailOnCalc(rowData, rowData.ENTRY_QTY);
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
          editMode: true
        });
        return false;
      }

      // 그리드.ORDER_LINE_NO > 0 && 출고구분 != "D20" && 등록수량>예정수량일 경우 에러
      if (Number(rowData.ORDER_LINE_NO) > 0 && $NC.getValue("#cboInout_Cd") != "D20") {
        if (Number(rowData.ORDER_QTY) < ENTRY_QTY) {
          alert("등록수량이 예정수량을 초과할 수 없습니다.");

          rowData.ENTRY_QTY = rowData.ORDER_QTY;
          rowData = grdDetailOnCalc(rowData, rowData.ENTRY_QTY);

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
    if (Number(rowData.ORDER_QTY) > ENTRY_QTY && $NC.isNull(rowData.SHORTAGE_DIV)) {
      alert("미출고사유를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("SHORTAGE_DIV_F"),
        editMode: true
      });
      return false;
    }
    // 출고수량 = 예정수량 일때 미출고사유 초기화
    if (Number(rowData.ORDER_QTY) == ENTRY_QTY) {
      rowData.SHORTAGE_DIV_F = "";
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  }
  return true;
}

/**
 * 상품별출고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT1Master(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);

  if (G_GRDT1MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT1MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT1Master", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);

  // 초기화
  $NC.clearGridData(G_GRDT1MASTER);
  $NC.clearGridData(G_GRDT2MASTER);

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

  // 브랜드 조회조건 초기화
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");

  onChangingCondition();
}

/**
 * 공급처 검색 결과
 * 
 * @param seletedRowData
 */
function showVendorPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd", true);

  $NP.showVendorPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_VENDOR_CD: "%",
      P_VIEW_DIV: "2"
    }
  }, onVendorPopup, function() {
    $NC.setFocus("#edtQVendor_Cd", true);
  });
}

function onVendorPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQVendor_Cd", resultInfo.VENDOR_CD);
    $NC.setValue("#edtQVendor_Nm", resultInfo.VENDOR_NM);
  } else {
    $NC.setValue("#edtQVendor_Cd");
    $NC.setValue("#edtQVendor_Nm");
    $NC.setFocus("#edtQVendor_Cd", true);
  }
  onChangingCondition();
}

function showDeliveryPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NP.showDeliveryPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_DELIVERY_CD: "%",
      P_DELIVERY_DIV: "%",
      P_VIEW_DIV: "2"
    }
  }, onDeliveryPopup, function() {
    $NC.setFocus("#edtQDelivery_Cd", true);
  });
}

function onDeliveryPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQDelivery_Cd", resultInfo.DELIVERY_CD);
    $NC.setValue("#edtQDelivery_Nm", resultInfo.DELIVERY_NM);
  } else {
    $NC.setValue("#edtQDelivery_Cd");
    $NC.setValue("#edtQDelivery_Nm");
    $NC.setFocus("#edtQDelivery_Cd", true);
  }
  onChangingCondition();
}

function dividePallet() {

  // 현재 수정모드면
  if (G_GRDT1MASTER.view.getEditorLock().isActive()) {
    G_GRDT1MASTER.view.getEditorLock().commitCurrentEdit();
  }

  var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
  if (!rowData.SHIP_ID) {
    alert("팔레트 번호를 먼저 입력해주세요.");
    $NC.setGridSelectRow(G_GRDT1MASTER, {
      selectRow: G_GRDT1MASTER.lastRow,
      activeCell: G_GRDT1MASTER.view.getColumnIndex("SHIP_ID"),
      editMode: true
    });
    return;
  }

  if (!rowData.CONFIRM_QTY) {
    alert("확정수량을 먼저 입력해주세요.");
    $NC.setGridSelectRow(G_GRDT1MASTER, {
      selectRow: G_GRDT1MASTER.lastRow,
      activeCell: G_GRDT1MASTER.view.getColumnIndex("CONFIRM_QTY"),
      editMode: true
    });
    return;

  } else {

    if (rowData.OUT_QTY < rowData.CONFIRM_QTY) {
      alert("확정수량이 출고수량보다 많습니다.");
      $NC.setGridSelectRow(G_GRDT1MASTER, {
        selectRow: G_GRDT1MASTER.lastRow,
        activeCell: G_GRDT1MASTER.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return;
    }

    if (rowData.OUT_QTY == rowData.CONFIRM_QTY) {
      alert("확정수량을 조정한후 분할 하세요.");
      $NC.setGridSelectRow(G_GRDT1MASTER, {
        selectRow: G_GRDT1MASTER.lastRow,
        activeCell: G_GRDT1MASTER.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return;
    }

  }

  var CONFIRM_QTY = getRemainConfirmQty(rowData);
  if (CONFIRM_QTY < 1) {
    alert("분할 할 수 없습니다.");
    return;
  }

  var newRowData = {
    FIRST_YN: "N",
    VENDOR_CD: rowData.VENDOR_CD,
    VENDOR_NM: rowData.VENDOR_NM,
    XDOCK_DATE: rowData.XDOCK_DATE,
    XDOCK_NO: rowData.XDOCK_NO,
    ITEM_CD: rowData.ITEM_CD,
    ITEM_NM: rowData.ITEM_NM,
    ITEM_SPEC: rowData.ITEM_SPEC,
    BRAND_CD: rowData.BRAND_CD,
    BRAND_NM: rowData.BRAND_NM,
    QTY_IN_BOX: rowData.QTY_IN_BOX,
    DELIVERY_CD: rowData.DELIVERY_CD,
    DELIVERY_NM: rowData.DELIVERY_NM,
    RDELIVERY_CD: rowData.RDELIVERY_CD,
    RDELIVERY_NM: rowData.RDELIVERY_NM,
    OUT_QTY: rowData.OUT_QTY,
    SHIP_ID: Number(rowData.SHIP_ID) + 1,
    CONFIRM_QTY: CONFIRM_QTY,
    BU_DATE: rowData.BU_DATE,
    BU_NO: rowData.BU_NO,
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };
  G_GRDT1MASTER.data.insertItem(G_GRDT1MASTER.lastRow + 1, newRowData);

  $NC.setGridSelectRow(G_GRDT1MASTER, {
    selectRow: G_GRDT1MASTER.lastRow + 1,
    activeCell: G_GRDT1MASTER.view.getColumnIndex("CONFIRM_QTY"),
    editMode: true
  });
}

function isFirstFormatter(row, cell, value, columnDef, dataContext) {
  if (dataContext.FIRST_YN === "Y") {
    return value;
  } else {
    return null;
  }
}

function getRemainConfirmQty(rowData) {

  return rowData.OUT_QTY
      - $NC.getGridSumVal(G_GRDT1MASTER, {
        searchKey: ["VENDOR_CD", "XDOCK_DATE", "XDOCK_NO", "ITEM_CD", "BRAND_CD", "DELIVERY_CD", "RDELIVERY_CD"],
        searchVal: [rowData.VENDOR_CD, rowData.XDOCK_DATE, rowData.XDOCK_NO, rowData.ITEM_CD, rowData.BRAND_CD,
            rowData.DELIVERY_CD, rowData.RDELIVERY_CD],
        sumKey: "CONFIRM_QTY"
      });
}

function onSave(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }

  var lastKeyValMaster = $NC.getGridLastKeyVal(G_GRDMASTERC, {
    selectKey: ["XDOCK_DATE", "XDOCK_NO"]
  });
  var lastKeyValDetail1 = $NC.getGridLastKeyVal(G_GRDDETAILC1, {
    selectKey: ["XDOCK_DATE", "XDOCK_NO", "LINE_NO"]
  });
  var lastKeyValDetail2 = $NC.getGridLastKeyVal(G_GRDDETAILC2, {
    selectKey: ["XDOCK_DATE", "XDOCK_NO", "ASN_NO"]
  });
  _Inquiry();
  G_GRDMASTERC.lastKeyVal = lastKeyValMaster;
  G_GRDDETAILC1.lastKeyVal = lastKeyValDetail1;
  G_GRDDETAILC2.lastKeyVal = lastKeyValDetail2;
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}