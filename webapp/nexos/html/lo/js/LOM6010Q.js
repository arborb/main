/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    printOptions: [{
      PRINT_INDEX: 0,
      PRINT_COMMENT: "적재팔레트내역서 출력"
    }],
    PRINTER_NAME: $NC.G_USERINFO.PRINT_SHIP_ID,
    O_SHIP_ID1: "", // 시작팔레트ID
    O_SHIP_ID2: "", // 종료팔레트ID
  });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();

  // 조회조건 - 사업부 초기화
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  // 조회조건 - 출고일자 초기화
  $NC.setInitDatePicker("#dtpQOutbound_Date");

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
      // 출고차수 콤보 설정
      setOutboundBatchCombo();
    }
  });

  $("#btnQBu_Cd").click(showUserBuPopup); // 사업부 버튼 클릭 이벤트
  $("#btnQOutbound_Batch").click(setOutboundBatchCombo); // 출고차수 새로고침 버튼 클릭 이벤트
  $("#btnShip_Id_Gen").click(onBtnShipIdGen); // 적재팔레트 발행 버튼 클릭 이벤트
}

/**
 * IFrame이 로드가 완료되었을 경우 자동 호출 됨
 */

function _OnLoaded() {
  // 스플리터 초기화
  $NC.setInitSplitter("#divMasterView", "v", $NC.G_OFFSET.leftViewWidth, 300, 400);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.leftViewWidth = 500;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $("#divTopView").outerHeight(true);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 * 
 * @param parent
 *          상위 view, 기본은 contentWindow
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  var container = $("#divMasterView");
  $NC.resizeContainer(container, clientWidth, clientHeight);

  // Grid 사이즈 조정
  var parent = $("#grdMaster").parent();
  $NC.resizeGrid("#grdMaster", parent.width(), parent.height() - $NC.G_LAYOUT.header);
  parent = $("#grdDetail").parent();
  $NC.resizeGrid("#grdDetail", parent.width(), parent.height() - $NC.G_LAYOUT.header);
}

/**
 * Input, Select Change Event - 조회 조건이 변경되었을 경우 호출 됨
 * 
 * @param e
 *          이벤트 핸들러
 * @param view
 *          대상 Object
 * @param val
 *          변경된 값
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "CENTER_CD":
    setOutboundBatchCombo();
    break;
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
  case "OUTBOUND_DATE":
    $NC.setValueDatePicker(view, val, "검색 출고일자를 정확히 입력하십시오.");
    setOutboundBatchCombo();
    break;
  }

  // 화면클리어
  onChangingCondition();
}

function onChangingCondition() {

  $NC.clearGridData(G_GRDDETAIL);
  $NC.clearGridData(G_GRDMASTER);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view) {

  var id = view.prop("id").substr(3).toUpperCase();

  switch (id) {
  case "SHIP_ID_CNT":
    $NC.setFocus("#btnShip_Id_Gen");
    break;
  }
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

  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDMASTER, args.row);

  var rowData = G_GRDMASTER.data.getItem(args.row);

  if (args.cell == G_GRDMASTER.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  G_GRDMASTER.data.updateItem(rowData.id, rowData);

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

  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("출고일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date");
    return;
  }

  var OUTBOUND_BATCH = $NC.getValue("#cboQOutbound_Batch", true);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: OUTBOUND_DATE,
    P_OUTBOUND_BATCH: OUTBOUND_BATCH
  });

  // 데이터 조회
  $NC.serviceCall("/RI01010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

  var saveDS = [ ];
  var saveData = {
    P_PRINT_YN: "Y",
    P_SHIP_ID1: $NC.G_VAR.O_SHIP_ID1,
    P_SHIP_ID2: $NC.G_VAR.O_SHIP_ID2,
    P_CRUD: "U"
  };
  saveDS.push(saveData);

  $NC.serviceCall("/LOM6010Q/save.do", {
    P_DS_MASTER: $NC.toJson(saveDS),
    P_REG_USER_ID: $NC.G_USERINFO.USER_ID
  });
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

  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }

  // 조회조건 체크
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  if ($NC.isNull(BU_NM)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("출고일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date");
    return;
  }

  var checkedValueDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      checkedValueDS.push(rowData.SHIP_ID);
    }
  }
  if (checkedValueDS.length == 0) {
    alert("출력할 데이터를 선택하십시오.");
    return;
  }

  var printOptions = {};
  if (printIndex == 0) {
    printOptions = {
      reportDoc: "lo/PAPER_SHIP_ID01",
      queryId: "WR.RS_PAPER_SHIP_ID01",
      queryParams: {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE
      },
      checkedValue: checkedValueDS.toString()
    };
  }

  $NC.G_MAIN.showPrintPreview(printOptions);

}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 40,
    maxWidth: 40,
    cssClass: "align-center",
    sortable: false,
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "SHIP_ID",
    field: "SHIP_ID",
    name: "적재팔레트ID",
    minWidth: 150,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_SEQ",
    field: "SHIP_SEQ",
    name: "일련번호",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "BOX_CNT",
    field: "BOX_CNT",
    name: "박스수",
    minWidth: 80,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LOM6010Q.RS_MASTER",
    sortCol: "SHIP_ID",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
  G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

function grdMasterOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDMASTER.view.getEditorLock().isActive() && !G_GRDMASTER.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDMASTER.data.getLength();
      var rowData;
      G_GRDMASTER.data.beginUpdate();
      for (var row = 0; row < rowCount; row++) {
        rowData = G_GRDMASTER.data.getItem(row);
        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;
          G_GRDMASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTER.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
  }
}

function grdMasterOnClick(e, args) {

  if (args.cell === G_GRDMASTER.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTER.view.getEditorLock().isActive() && !G_GRDMASTER.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDMASTER.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {
        rowData.CHECK_YN = checkVal;
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
      }
    }
  }
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 디테일 변수 초기화
  $NC.setInitGridVar(G_GRDDETAIL);

  onGetDetail({
    data: null
  });

  var rowData = G_GRDMASTER.data.getItem(row);

  if (rowData.CRUD !== "C" && rowData.CRUD !== "N") {
    // 파라메터 세팅
    G_GRDDETAIL.queryParams = $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
      P_OUTBOUND_BATCH: rowData.OUTBOUND_BATCH,
      P_SHIP_ID: rowData.SHIP_ID
    });

    // 디테일 조회
    $NC.serviceCall("/LOM6010Q/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "WB_NO",
    field: "WB_NO",
    name: "운송장번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "상품수",
    minWidth: 80,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "LOM6010Q.RS_DETAIL",
    sortCol: "OUTBOUND_NO",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

function grdDetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL.lastRow != null) {
    if (row == G_GRDDETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);

}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "SHIP_ID",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    onGetDetail({
      data: null
    });
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  if (G_GRDMASTER.data.getLength() > 0) {

    $NC.setGridSelectRow(G_GRDMASTER, 0);
    // 프린트버튼 활성화
    $NC.G_VAR.buttons._print = "1";
    $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);

  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
}

function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "OUTBOUND_NO",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
}

/**
 * 적재팔레트 발행 버튼 클릭
 */
function onBtnShipIdGen() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var SHIP_ID_CNT = $NC.getValue("#edtShip_Id_Cnt");
  if ($NC.isNull(SHIP_ID_CNT)) {
    alert("적재팔레트 발행매수를 입력하십시오.");
    $NC.setFocus("#edtShip_Id_Cnt");
    return;
  }

  $NC.serviceCall("/LOM6010Q/callShipIdGetNo.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_CREATE_DATE: "",
      P_SHIP_ID_CNT: SHIP_ID_CNT,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onGetShipIdGen);
}

function onGetShipIdGen(ajaxData) {

  var resultData = $NC.toArray(ajaxData);

  $NC.G_VAR.O_SHIP_ID1 = resultData.O_SHIP_ID1;
  $NC.G_VAR.O_SHIP_ID2 = resultData.O_SHIP_ID2;

  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      alert(resultData.O_MSG);
      return;
    }
  }

  doPrint();
}

/**
 * 자동 출력
 */
function doPrint() {

  if ($NC.isNull($NC.G_USERINFO.PRINT_SHIP_ID)) {
    alert("설정하신 프린터가 없습니다.\n\n자동출력프린터를 먼저 등록하십시오.");
    return;
  }

  $NC.G_MAIN.silentPrint({
    printParams: [{
      reportDoc: "lo/LABEL_SHIP_ID01",
      queryId: "WR.RS_LABEL_SHIP_ID01",
      queryParams: {
        P_SHIP_ID1: $NC.G_VAR.O_SHIP_ID1,
        P_SHIP_ID2: $NC.G_VAR.O_SHIP_ID2
      },
      iFrameNo: 1,
      silentPrinterName: $NC.G_VAR.PRINTER_NAME
    }],
    onAfterPrint: function() {
      _Save();
    }
  });
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

  setOutboundBatchCombo();
  onChangingCondition();
}

/**
 * 물류센터/사업부/출고일자 값 변경시 출고차수 콤보 재설정
 */
function setOutboundBatchCombo() {

  // 조회조건 - 출고차수 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_OUTBOUND_BATCH",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_OUTBOUND_DATE: $NC.getValue("#dtpQOutbound_Date"),
      P_OUTBOUND_DIV: "2" // 출고작업구분(1:기본출고, 2:온라인출고)
    })
  }, {
    selector: "#cboQOutbound_Batch",
    codeField: "OUTBOUND_BATCH",
    nameField: "OUTBOUND_BATCH",
    fullNameField: "OUTBOUND_BATCH_F",
    addAll: true
  });
}
