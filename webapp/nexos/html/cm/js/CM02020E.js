/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    INIT_TRANS_DIV: "1",
    INIT_CAR_TON_DIV: "000",
    INIT_CAR_KEEP_DIV: "10"
  });

  // 그리드 초기화
  grdMasterInitialize();

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "CAR_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: "",
    })
  }, {
    selector: "#cboCar_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboCar_Div", -1);
    }
  });

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "TRANS_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: "",
    })
  }, {
    selector: "#cboTrans_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboTrans_Div", -1);
    }
  });

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "CAR_TON_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: "",
    })
  }, {
    selector: "#cboCar_Ton_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboCar_Ton_Div", -1);
    }
  });

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "CAR_KEEP_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: "",
    })
  }, {
    selector: "#cboCar_Keep_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboCar_Keep_Div", -1);
    }
  });

  $NC.setValue("#edtQCarrier_Cd");
  $NC.setValue("#edtQCarrier_Nm");

  $NC.setValue("#chkQDeal_Div1", true);
  $NC.setValue("#chkQDeal_Div2", true);

  $NC.setInitDatePicker("#dtpOpen_Date", null, "N");
  $NC.setInitDatePicker("#dtpClose_Date", null, "N");

  $("#btnQCarrier_Cd").click(showQCarrierPopup);
  $("#btnCarrier_Cd").click(showCarrierPopup);
  // 에디터 Disable
  $NC.setEnableGroup("#divMasterInfoView", false);
}

function _SetResizeOffset() {

  $NC.G_OFFSET.rightViewWidth = 450;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.rightViewMinHeight = $("#divMasterInfoView").outerHeight(true) + $NC.G_LAYOUT.header
      + $NC.G_OFFSET.nonClientHeight + $NC.G_LAYOUT.margin2;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var scrollOffset = parent.height() < $NC.G_OFFSET.rightViewMinHeight ? $NC.G_LAYOUT.scroll.width : 0;
  var clientWidth = parent.width() - $NC.G_OFFSET.rightViewWidth - $NC.G_LAYOUT.nonClientWidth - scrollOffset;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Container 사이즈 조정
  $NC.resizeContainer("#divLeftView", clientWidth, clientHeight);
  $NC.resizeContainer("#divRightView", $NC.G_OFFSET.rightViewWidth + scrollOffset, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * 조회조건 Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "CARRIER_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CARRIER_CD: val,
        P_VIEW_DIV: "1"
      };
      O_RESULT_DATA = $NP.getCarrierInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onQCarrierPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showCarrierPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onQCarrierPopup, onQCarrierPopup);
    }
    return;
  }

  onChangingCondition();
}

function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDMASTER);

  setInputValue("#grdMaster");
  $NC.setEnableGroup("#divMasterInfoView", false);

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
function _OnInputChange(e, view, val) {

  var id = view.prop("id").substr(3).toUpperCase();
  grdMasterOnCellChange(e, {
    col: id,
    val: val
  });
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd", true);
  var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
  var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
  var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CARRIER_CD: CARRIER_CD,
    P_DEAL_DIV1: DEAL_DIV1,
    P_DEAL_DIV2: DEAL_DIV2,
    P_DEAL_DIV3: DEAL_DIV3
  });

  // 데이터 조회
  $NC.serviceCall("/CM02020E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  // 현재 수정모드면
  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDMASTER.lastRow != null) {
    if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
      return;
    }
  }

  var rowCount = G_GRDMASTER.data.getLength();
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDMASTER.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      $NC.setFocus("#edtCar_Cd");
      return;
    }
  }

  var Carrier_Cd = $NC.getValue("#edtQCarrier_Cd", true);
  var Carrier_Nm = $NC.getValue("#edtQCarrier_Nm");

  if ($NC.isNull(Carrier_Cd) || Carrier_Cd === "" || Carrier_Cd === "%") {
    Carrier_Cd = "";
    Carrier_Nm = "";
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CAR_CD: null,
    CAR_NM: null,
    CAR_DIV: null,
    CARRIER_CD: Carrier_Cd,
    CARRIER_NM: Carrier_Nm,
    TRANS_DIV: $NC.G_VAR.INIT_TRANS_DIV,
    CAR_TON_DIV: $NC.G_VAR.INIT_CAR_TON_DIV,
    CAR_KEEP_DIV: $NC.G_VAR.INIT_CAR_KEEP_DIV,
    CAR_CAPA: "0",
    DRIVER_NM: null,
    DRIVER_HP: null,
    DEAL_DIV: "1",
    OPEN_DATE: null,
    CLOSE_DATE: null,
    MANAGER_NM: null,
    REMARK1: null,
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };
  G_GRDMASTER.data.addItem(newRowData);

  $NC.setGridSelectRow(G_GRDMASTER, rowCount);
  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;

  // 이전 데이터가 한건도 없었으면 에디터 Enable
  if (rowCount == 0) {
    $NC.setEnableGroup("#divMasterInfoView", true);
  }

  // 신규 데이터 생성 이벤트 호출
  grdMasterOnNewRecord({
    row: rowCount,
    rowData: newRowData
  });
}

function grdMasterOnNewRecord(args) {

  $NC.setValue("#rgbDeal_Div", args.rowData.DEAL_DIV);

  $NC.setValue("#cboTrans_Div", args.rowData.TRANS_DIV);
  $NC.setValue("#cboCar_Keep_Div", args.rowData.CAR_KEEP_DIV);
  $NC.setValue("#cboCar_Capa", args.rowData.CAR_CAPA);

  $NC.setFocus("#edtCar_Cd");
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDMASTER.lastRow != null) {
    if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
      return;
    }
  }
  var saveDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CAR_CD: rowData.CAR_CD,
        P_CAR_NM: rowData.CAR_NM,
        P_CAR_DIV: rowData.CAR_DIV,
        P_CARRIER_CD: rowData.CARRIER_CD,
        P_TRANS_DIV: rowData.TRANS_DIV,
        P_CAR_TON_DIV: rowData.CAR_TON_DIV,
        P_CAR_KEEP_DIV: rowData.CAR_KEEP_DIV,
        P_CAR_CAPA: rowData.CAR_CAPA,
        P_DRIVER_NM: rowData.DRIVER_NM,
        P_DRIVER_HP: rowData.DRIVER_HP,
        P_DEAL_DIV: rowData.DEAL_DIV,
        P_OPEN_DATE: rowData.OPEN_DATE,
        P_CLOSE_DATE: rowData.CLOSE_DATE,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveDS.push(saveData);
    }
  }
  if (saveDS.length > 0) {
    $NC.serviceCall("/CM02020E/save.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var result = confirm("삭제 하시겠습니까?");
  if (result) {
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    // 신규 데이터일 경우 그냥 삭제
    if (rowData.CRUD === "C" || rowData.CRUD === "N") {
      // 마지막 선택 Row 수정 상태 복원
      G_GRDMASTER.lastRowModified = false;

      G_GRDMASTER.data.deleteItem(rowData.id);
      // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
      if (G_GRDMASTER.lastRow > 1) {
        $NC.setGridSelectRow(G_GRDMASTER, G_GRDMASTER.lastRow - 1);
      } else {
        if (G_GRDMASTER.data.getLength() === 0) {
          $NC.setEnableGroup("#divMasterInfoView", false);
          setInputValue("#grdMaster");
          $NC.setGridDisplayRows("#grdMaster", 0, 0);
        } else {
          $NC.setGridSelectRow(G_GRDMASTER, 0);
        }
      }
    } else {
      rowData.CRUD = "D";
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
      _Save();
    }
  }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "CAR_CD",
    isCancel: true
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

}

function setInputValue(grdSelector, rowData) {

  if (grdSelector === "#grdMaster") {

    if ($NC.isNull(rowData)) {
      // 초기화시 기본값 지정
      rowData = {
        CRUD: "R"
      };
    }
    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtCar_Cd", rowData["CAR_CD"]);
    $NC.setValue("#edtCar_Nm", rowData["CAR_NM"]);
    $NC.setValue("#cboCar_Div", rowData["CAR_DIV"]);
    $NC.setValue("#edtCarrier_Cd", rowData["CARRIER_CD"]);
    $NC.setValue("#edtCarrier_Nm", rowData["CARRIER_NM"]);
    $NC.setValue("#cboTrans_Div", rowData["TRANS_DIV"]);
    $NC.setValue("#cboCar_Ton_Div", rowData["CAR_TON_DIV"]);
    $NC.setValue("#cboCar_Keep_Div", rowData["CAR_KEEP_DIV"]);
    $NC.setValue("#edtCar_Capa", rowData["CAR_CAPA"]);
    $NC.setValue("#edtDriver_Nm", rowData["DRIVER_NM"]);
    $NC.setValue("#edtDriver_Hp", rowData["DRIVER_HP"]);
    $NC.setValue("#rgbDeal_Div1", rowData.DEAL_DIV === "1");
    $NC.setValue("#rgbDeal_Div2", rowData.DEAL_DIV === "2");
    $NC.setValue("#rgbDeal_Div3", rowData.DEAL_DIV === "3");
    $NC.setValue("#dtpOpen_Date", rowData["OPEN_DATE"]);
    $NC.setValue("#dtpClose_Date", rowData["CLOSE_DATE"]);
    $NC.setValue("#edtRemark1", rowData["REMARK1"]);
    // 신규 데이터면 차량코드 수정할 수 있게 함
    if (rowData["CRUD"] == "C" || rowData["CRUD"] == "N") {
      $NC.setEnable("#edtCar_Cd");
    } else {
      $NC.setEnable("#edtCar_Cd", false);
    }
  }
}

function grdMasterOnBeforePost(row) {

  if (!G_GRDMASTER.lastRowModified) {
    return true;
  }
  var rowData = G_GRDMASTER.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.CAR_CD)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.CAR_CD)) {
      alert("차량코드를 입력하십시오.");
      $NC.setFocus("#edtCar_Cd");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.CAR_NM)) {
      alert("차량번호를 입력하십시오.");
      $NC.setFocus("#edtCar_Nm");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }

    if ($NC.isNull(rowData.TRANS_DIV)) {
      alert("운송구분을 선택하십시오.");
      $NC.setFocus("#cboTrans_Div");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }

    if ($NC.isNull(rowData.CAR_TON_DIV)) {
      alert("차량톤수를 선택하십시오.");
      $NC.setFocus("#cboCar_Ton_Div");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }

    if ($NC.isNull(rowData.CAR_KEEP_DIV)) {
      alert("차량보관유형을 선택하십시오.");
      $NC.setFocus("#cboCar_Keep_Div");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.CAR_CAPA)) {
      alert("적재용적을 입력하십시오.");
      $NC.setFocus("#edtCar_Capa");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if (!$NC.isNull(rowData.OPEN_DATE) && !$NC.isDate(rowData.OPEN_DATE)) {
      alert("거래일자를 정확히 입력하십시오.");
      $NC.setFocus("#dtpOpen_Date");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    } else {
      rowData.OPEN_DATE = $NC.getDate(rowData.OPEN_DATE);
      $NC.setValue("#dtpOpen_Date", rowData.OPEN_DATE);
    }
    if (!$NC.isNull(rowData.CLOSE_DATE) && !$NC.isDate(rowData.CLOSE_DATE)) {
      alert("종료일자를 정확히 입력하십시오.");
      $NC.setFocus("#dtpClose_Date");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    } else {
      rowData.CLOSE_DATE = $NC.getDate(rowData.CLOSE_DATE);
      $NC.setValue("#dtpClose_Date", rowData.CLOSE_DATE);
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }
  return true;
}
function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CAR_CD",
    field: "CAR_CD",
    name: "차량코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CAR_NM",
    field: "CAR_NM",
    name: "차량명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "CAR_DIV_F",
    field: "CAR_DIV_F",
    name: "차량구분",
    minWidth: 100,
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_CD",
    field: "CARRIER_CD",
    name: "운송사코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_NM",
    field: "CARRIER_NM",
    name: "운송사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "TRANS_DIV_F",
    field: "TRANS_DIV_F",
    name: "운송구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "CAR_TON_DIV_F",
    field: "CAR_TON_DIV_F",
    name: "차량톤수",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CAR_KEEP_DIV_F",
    field: "CAR_KEEP_DIV_F",
    name: "차량보관유형",
    minWidth: 90,
  });
  $NC.setGridColumn(columns, {
    id: "CAR_CAPA",
    field: "CAR_CAPA",
    name: "적재용적",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DRIVER_NM",
    field: "DRIVER_NM",
    name: "운전자성명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "DRIVER_HP",
    field: "DRIVER_HP",
    name: "운전자휴대전화번호",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_DIV",
    field: "DEAL_DIV",
    name: "거래구분",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OPEN_DATE",
    field: "OPEN_DATE",
    name: "거래일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CLOSE_DATE",
    field: "CLOSE_DATE",
    name: "종료일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150
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
    queryId: "CM02020E.RS_MASTER",
    sortCol: "CAR_CD",
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
    if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 에디터 값 세팅
  setInputValue("#grdMaster", G_GRDMASTER.data.getItem(row));

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdMasterOnCellChange(e, args) {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (rowData) {
    switch (args.col) {
    case "CAR_CD":
      rowData.CAR_CD = args.val;
      break;
    case "CAR_NM":
      rowData.CAR_NM = args.val;
      break;
    case "CAR_DIV":
      rowData.CAR_DIV = args.val;
      rowData.CAR_DIV_F = $NC.getValueCombo("#cboCar_Div", "F");
      break;
    case "CARRIER_CD":
      var P_QUERY_PARAMS;
      var O_RESULT_DATA = [ ];
      if (!$NC.isNull(args.val)) {
        P_QUERY_PARAMS = {
          P_CARRIER_CD: args.val,
          P_VIEW_DIV: "1"
        };
        O_RESULT_DATA = $NP.getCarrierInfo({
          queryParams: P_QUERY_PARAMS
        });
      }
      if (O_RESULT_DATA.length <= 1) {
        onCarrierPopup(O_RESULT_DATA[0]);
      } else {
        $NP.showCarrierPopup({
          queryParams: P_QUERY_PARAMS,
          queryData: O_RESULT_DATA
        }, onCarrierPopup, onCarrierPopup);
      }
      return;
    case "CARRIER_NM":
      rowData.CARRIER_NM = args.val;
      break;
    case "TRANS_DIV":
      rowData.TRANS_DIV = args.val;
      rowData.TRANS_DIV_F = $NC.getValueCombo("#cboTrans_Div", "F");
      break;
    case "CAR_TON_DIV":
      rowData.CAR_TON_DIV = args.val;
      rowData.CAR_TON_DIV_F = $NC.getValueCombo("#cboCar_Ton_Div", "F");
      break;
    case "CAR_KEEP_DIV":
      rowData.CAR_KEEP_DIV = args.val;
      rowData.CAR_KEEP_DIV_F = $NC.getValueCombo("#cboCar_Keep_Div", "F");
      break;
    case "CAR_CAPA":
      rowData.CAR_CAPA = args.val;
      break;
    case "DRIVER_NM":
      rowData.DRIVER_NM = args.val;
      break;
    case "DRIVER_HP":
      rowData.DRIVER_HP = args.val;
      break;
    case "DEAL_DIV1":
    case "DEAL_DIV2":
    case "DEAL_DIV3":
      rowData.DEAL_DIV = args.val;
      break;
    case "OPEN_DATE":
      if (!$NC.isNull(args.val)) {
        $NC.setValueDatePicker("#dtpOpen_Date", args.val, "거래일자를 정확히 입력하십시오.", "N");
      }
      rowData.OPEN_DATE = $NC.getValue("#dtpOpen_Date");
      break;
    case "CLOSE_DATE":
      if (!$NC.isNull(args.val)) {
        $NC.setValueDatePicker("#dtpClose_Date", args.val, "종료일자를 정확히 입력하십시오.", "N");
      }
      rowData.CLOSE_DATE = $NC.getValue("#dtpClose_Date");
      break;
    case "REMARK1":
      rowData.REMARK1 = args.val;
      break;
    }

    if (rowData.CRUD === "R") {
      rowData.CRUD = "U";
    }
    G_GRDMASTER.data.updateItem(rowData.id, rowData);

    // 마지막 선택 Row 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;
  }
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setEnableGroup("#divMasterInfoView", true);
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "CAR_CD",
        selectVal: G_GRDMASTER.lastKeyVal,
        activeCell: true
      });
    }
  } else {
    $NC.setEnableGroup("#divMasterInfoView", false);
    setInputValue("#grdMaster");
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "1";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "CAR_CD"
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
    // 마지막 선택 Row 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;
  }
}

function showQCarrierPopup() {
  var carrier_Cd = $NC.getValue("#edtQCarrier_Cd", true);
  $NP.showCarrierPopup({
    queryParams: {
      P_CARRIER_CD: carrier_Cd,
      P_VIEW_DIV: "2"
    }
  }, onQCarrierPopup, function() {
    $NC.setFocus("#edtQCarrier_Cd", true);
  });
}

function onQCarrierPopup(resultInfo) {
  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQCarrier_Cd", resultInfo.CARRIER_CD);
    $NC.setValue("#edtQCarrier_Nm", resultInfo.CARRIER_NM);
  } else {
    $NC.setValue("#edtQCarrier_Cd");
    $NC.setValue("#edtQCarrier_Nm");
  }
  onChangingCondition();
}

function showCarrierPopup() {
  var carrier_Cd = $NC.getValue("#edtCarrier_Cd");
  $NP.showCarrierPopup({
    queryParams: {
      P_CARRIER_CD: carrier_Cd,
      P_VIEW_DIV: "1"
    }
  }, onCarrierPopup, function() {
    $NC.setFocus("#edtCarrier_Cd", true);
  });
}

function onCarrierPopup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtCarrier_Cd", resultInfo.CARRIER_CD);
    $NC.setValue("#edtCarrier_Nm", resultInfo.CARRIER_NM);

    rowData.CARRIER_CD = resultInfo.CARRIER_CD;
    rowData.CARRIER_NM = resultInfo.CARRIER_NM;

  } else {
    $NC.setValue("#edtCarrier_Cd");
    $NC.setValue("#edtCarrier_Nm");
    $NC.setFocus("#edtCarrier_Cd", true);

    rowData.CARRIER_CD = "";
    rowData.CARRIER_NM = "";

  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;

  $NC.setFocus("#edtCarrier_Cd", true);
}
