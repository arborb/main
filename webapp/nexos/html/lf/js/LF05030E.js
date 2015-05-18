/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    CUST_CD: "",
    UNIT_PRICE: 0
  });

  // 탭 초기화
  // $NC.setInitTab("#divMasterView", {
  // tabIndex: 0,
  // onActivate: tabOnActivate
  // });

  // 그리드 초기화
  grdT1MasterInitialize();

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showBuBrandPopup);

  $NC.setInitDatePicker("#dtpQAdjust_Date1", $NC.G_USERINFO.LOGIN_DATE, "F");
  $NC.setInitDatePicker("#dtpQAdjust_Date2");

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
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $NC.G_LAYOUT.border1;
  $NC.G_OFFSET.gridHeightOffset = $NC.G_LAYOUT.header + $NC.G_OFFSET.nonClientHeight + ($NC.G_LAYOUT.border1 * 3);
  $NC.G_OFFSET.subViewHeightOffset = $NC.G_OFFSET.nonClientHeight + ($NC.G_LAYOUT.border1 * 3);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border2;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  // $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientWidth -= $NC.G_LAYOUT.border1;

  // Splitter 컨테이너 크기 조정
  clientHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset;

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdT1Master", clientWidth, clientHeight);

}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  // 사업부 Key 입력
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
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_BU_CD: BU_CD,
        P_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getBuBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBuBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showBuBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBuBrandPopup, onBuBrandPopup);
    }
    return;
  case "ADJUST_DATE1":
    $NC.setValueDatePicker(view, val, "기준 시작일자를 정확히 입력하십시오.");
    break;
  case "ADJUST_DATE2":
    $NC.setValueDatePicker(view, val, "기준 종료일자를 정확히 입력하십시오.");
    break;
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
  var ADJUST_DATE1 = $NC.getValue("#dtpQAdjust_Date1");
  if ($NC.isNull(ADJUST_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Date1");
    return;
  }
  var ADJUST_DATE2 = $NC.getValue("#dtpQAdjust_Date2");
  if ($NC.isNull(ADJUST_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Date2");
    return;
  }
  if (ADJUST_DATE1 > ADJUST_DATE2) {
    alert("일자 검색 범위 오류입니다.");
    $NC.setFocus("#dtpQAdjust_Date1");
    return;

  }
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1MASTER);

  // 데이터 조회 파라메터 세팅
  G_GRDT1MASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_ADJUST_DATE1: ADJUST_DATE1,
    P_ADJUST_DATE2: ADJUST_DATE2
  });

  // 데이터 조회
  $NC.serviceCall("/LF05030E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetMasterT1);

}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var CENTER_CD_F = $("#cboQCenter_Cd option:selected").text();
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  var ADJUST_DATE = $NC.getValue("#dtpQAdjust_Date2");
  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LF05031P",
    PROGRAM_NM: "일자별작업수수료등록/수정",
    url: "lf/LF05031P.html",
    width: 1024,
    height: 600,
    userData: {
      P_PROCESS_CD: "N",
      P_CENTER_CD: CENTER_CD,
      P_CENTER_CD_F: CENTER_CD_F,
      P_BU_CD: BU_CD,
      P_BU_NM: BU_NM,
      P_ADJUST_DATE: ADJUST_DATE,
      P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
      P_MASTER_DS: {},
      P_DETAIL_DS: [ ]
    },
    onOk: function() {
      onSave();
    }
  });
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {
  



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
 

  var saveDS = [ ];
  var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
  var saveData = {
    
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_ADJUST_DATE: rowData.ADJUST_DATE,
      P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
      P_FEE_BASE_CD: rowData.FEE_BASE_CD,
      P_CUST_CD: rowData.CUST_CD,
      P_BRAND_CD: rowData.BRAND_CD,
      P_MALL_CD: "",
      P_ITEM_CD: rowData.ITEM_CD,
      P_UNIT_PRICE: rowData.UNIT_PRICE,
      P_FEE_QTY: rowData.FEE_QTY,
      P_FEE_AMT: rowData.FEE_AMT,
      P_REMARK1: rowData.REMARK1,  
      P_CRUD: rowData.CRUD
  };
  saveDS.push(saveData);
  if (saveDS.length > 0) {
    $NC.serviceCall("/LF05030E/save1.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
  return;
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  if (G_GRDT1MASTER.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }
  if (G_GRDT1MASTER.lastRow == null) {
    alert("삭제할 데이터를 선택하십시오.");
    return;
  }

  var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

  var result = confirm("예외운송비 등록 정보를 삭제 하시겠습니까?");
  if (result) {
    rowData.CRUD = "D";
    G_GRDT1MASTER.data.updateItem(rowData.id, rowData);
    _Save();
  }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {
  _Inquiry();
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
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  var lastRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
  _Inquiry();
  if (lastRowData) G_GRDT1MASTER.lastKeyVal = [lastRowData.DELIVERY_DATE, lastRowData.DELIVERY_NO];
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
 * Tab Active Event
 * 
 * @param event
 * @param ui
 *          newTab: The tab that was just activated.<br>
 *          oldTab: The tab that was just deactivated.<br>
 *          newPanel: The panel that was just activated.<br>
 *          oldPanel: The panel that was just deactivated
 */
// function tabOnActivate(event, ui) {
// var id = ui.newTab.prop("id").substr(3).toUpperCase();
// if (id === "TAB1") {
// 스플리터가 초기화가 되어 있으면 _OnResize 호출
// if ($NC.isSplitter("#divT1TabSheetView")) {
// 스필리터를 통한 _OnResize 호출
// $("#divT1TabSheetView").trigger("resize");
// } else {
// 스플리터 초기화
// $NC.setInitSplitter("#divT1TabSheetView", "h");
// }
// } else {
// _OnResize($(window));
// }
// 화면상단의 공통 메뉴 버튼 이미지 표시 : true인 경우는 조회 버튼만 활성화 한다.
// setTopButton();
// }
function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ADJUST_DATE",
    field: "ADJUST_DATE",
    name: "정산일자",
    minWidth: 80,
    cssClass: "align-center",
  });
  $NC.setGridColumn(columns, {
    id: "FEE_HEAD_CD_F",
    field: "FEE_HEAD_CD_F",
    name: "정산항목코드",
    minWidth: 100,
  });

  $NC.setGridColumn(columns, {
    id: "FEE_BASE_CD_F",
    field: "FEE_BASE_CD_F",
    name: "정산기준코드",
    minWidth: 120,
  });

  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "브랜드코드",
    minWidth: 80,
    cssClass: "align-center"
  });

  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100,
 cssClass: "align-center"
  });
/*
  $NC.setGridColumn(columns, {
    id: "MALL_CD",
    field: "MALL_CD",
    name: "몰코드",
    minWidth: 80,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "MALL_NM",
    field: "MALL_NM",
    name: "몰명",
    minWidth: 110,
  });
  */
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 60,
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 130,
  });
  $NC.setGridColumn(columns, {
    id: "FEE_QTY",
    field: "FEE_QTY",
    name: "정산수량",
    minWidth: 90,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });
  $NC.setGridColumn(columns, {
    id: "UNIT_PRICE",
    field: "UNIT_PRICE",
    name: "정산기준단가",
    minWidth: 90,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });

  $NC.setGridColumn(columns, {
    id: "FEE_AMT",
    field: "FEE_AMT",
    name: "기본운임",
    minWidth: 90,
    cssClass: "align-right",
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 110,
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LF05030E.RS_MASTER",
    sortCol: "ADJUST_DATE",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
  G_GRDT1MASTER.view.onCellChange.subscribe(grdT1MasterOnCellChange);

}

function grdT1MasterOnCellChange(e, args) {

  var rowData = args.item;
  if (args.cell === G_GRDT1MASTER.view.getColumnIndex("FEE_QTY")) {
    var rowData1 = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    var FEE_QTY = Number(rowData1.FEE_QTY);
    if ($NC.isNull(rowData1.UNIT_PRICE) || rowData1.UNIT_PRICE == 0) {
      $NC.G_VAR.UNIT_PRICE = Number(0);
    } else {
      $NC.G_VAR.UNIT_PRICE = Number(rowData1.UNIT_PRICE);
    }
    if (isNaN(FEE_QTY)) {
      alert("수량을 정확히 입력하십시오.");
      return;
    }
    rowData.UNIT_PRICE = $NC.G_VAR.UNIT_PRICE;
    rowData.FEE_AMT = FEE_QTY * $NC.G_VAR.UNIT_PRICE;
  }

  if (args.cell === G_GRDT1MASTER.view.getColumnIndex("UNIT_PRICE")) {
    var rowData1 = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    var FEE_QTY = Number(rowData1.FEE_QTY);
    var UNIT_PRICE = Number(rowData1.UNIT_PRICE);
    if (isNaN(FEE_QTY)) {
      alert("수량을 정확히 입력하십시오.");
      return;
    }
    rowData.FEE_AMT = FEE_QTY * UNIT_PRICE;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }

  G_GRDT1MASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDT1MASTER.lastRowModified = true;
}

/**
 * 예외운송비등록 마스터 그리드 클릭시 처리
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

/**
 * 유통가공등록 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT1(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
  if (G_GRDT1MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1MASTER, {
        selectKey: ["DELIVERY_DATE", "DELIVERY_NO"],
        selectVal: G_GRDT1MASTER.lastKeyVal
      });
    }
  } else {

    $NC.setGridDisplayRows("#grdT1Master", 0, 0);
  }

  setTopButton();
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  $NC.clearGridData(G_GRDT1MASTER, ["queryParams"]);

  setTopButton();

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
    $NC.setValue("##edtQCust_Cd", resultInfo.CUST_CD);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("##edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");

  $NP.showBuBrandPopup({
    P_BU_CD: BU_CD,
    P_BRAND_CD: "%"
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
    $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  onChangingCondition();
}

/**
 * 상단 공통 버튼 제어
 */
function setTopButton() {

  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.G_VAR.printOptions = [ ];
  // 유통가공등록 탭
  // if ($("#divMasterView").tabs("option", "active") === 0) {
  if (!$NC.isNull(G_GRDT1MASTER.queryParams)) {
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._delete = "1";
  }
  // }

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}
