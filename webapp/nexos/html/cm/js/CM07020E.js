/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({});

  // 그리드 초기화
  grdMasterInitialize();

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "HDC_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "Y",
      P_SUB_CD2: "",
    })
  }, {
    selector: "#cboHdc_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboHdc_Div", -1);
    }
  });

  $NC.setValue("#edtQCarrier_Cd");
  $NC.setValue("#edtQCarrier_Nm");

  $("#btnQCarrier_Cd").click(showQCarrierPopup);
  $("#btnCarrier_Cd").click(showCarrierPopup);
  $("#btnWb_No").click(onBtnWb_NoClick);
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

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CARRIER_CD: CARRIER_CD
  });

  // 데이터 조회
  $NC.serviceCall("/CM07020E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
      $NC.setFocus("#edtQCarrier_Cd");
      return;
    }
  }

  var CARRIER_CD = $NC.getValue("#edtQCarrier_Cd");
  var CARRIER_NM = $NC.getValue("#edtQCarrier_Nm");

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CARRIER_CD: CARRIER_CD,
    CARRIER_NM: CARRIER_NM,
    LINE_NO: null,
    WB_NO_CONST: null,
    WB_NO_BEGIN: null,
    WB_NO_END: null,
    HDC_DIV: "01",
    HDC_DIV_F: $NC.getValueCombo("#cboHdc_Div", {
      searchVal: "01",
      returnVal: "F"
    }),
    REMARK1: $NC.G_VAR.REMARK1,
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

  $NC.setValue("#cboHdc_Div", args.rowData.HDC_DIV);

  $NC.setFocus("#edtCarrier_Cd");

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
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CARRIER_CD: rowData.CARRIER_CD,
        P_LINE_NO: rowData.LINE_NO,
        P_WB_NO_CONST: rowData.WB_NO_CONST,
        P_WB_NO_BEGIN: rowData.WB_NO_BEGIN,
        P_WB_NO_END: rowData.WB_NO_END,
        P_HDC_DIV: rowData.HDC_DIV,
        P_HD_CUST_ID: rowData.HD_CUST_ID,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveDS.push(saveData);
    }
  }
  if (saveDS.length > 0) {
    $NC.serviceCall("/CM07020E/save.do", {
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
    selectKey: ["CARRIER_CD", "LINE_NO"],
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
    $NC.setValue("#edtCarrier_Cd", rowData["CARRIER_CD"]);
    $NC.setValue("#edtCarrier_Nm", rowData["CARRIER_NM"]);
    $NC.setValue("#edtLine_No", rowData["LINE_NO"]);
    $NC.setValue("#edtWb_No_Const", rowData["WB_NO_CONST"]);
    $NC.setValue("#edtWb_No_Begin", rowData["WB_NO_BEGIN"]);
    $NC.setValue("#edtWb_No_End", rowData["WB_NO_END"]);
    $NC.setValue("#cboHdc_Div", rowData["HDC_DIV"]);
    $NC.setValue("#edtHd_Cust_Id", rowData["HD_CUST_ID"]);
    $NC.setValue("#edtRemark1", rowData["REMARK1"]);

    // 신규 데이터면 차량코드 수정할 수 있게 함
    if (rowData.CRUD == "C" || rowData.CRUD == "N") {
      $NC.setEnable("#edtCarrier_Cd");
      $NC.setEnable("#btnCarrier_Cd");

      $NC.setEnable("#cboHdc_Div");
      $NC.setEnable("#edtWb_No_Const");
      $NC.setEnable("#edtWb_No_Begin");
      $NC.setEnable("#edtWb_No_End");
    } else {
      $NC.setEnable("#edtCarrier_Cd", false);
      $NC.setEnable("#btnCarrier_Cd", false);

      // 운송장이 발생되었으면 수정불가
      if ($NC.isNull(rowData.WB_NO_CNT) || Number(rowData.WB_NO_CNT) == 0) {
        $NC.setEnable("#cboHdc_Div");
        $NC.setEnable("#edtWb_No_Const");
        $NC.setEnable("#edtWb_No_Begin");
        $NC.setEnable("#edtWb_No_End");
      } else {
        $NC.setEnable("#cboHdc_Div", false);
        $NC.setEnable("#edtWb_No_Const", false);
        $NC.setEnable("#edtWb_No_Begin", false);
        $NC.setEnable("#edtWb_No_End", false);
      }
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
    if ($NC.isNull(rowData.CARRIER_CD)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.CARRIER_CD)) {
      alert("운송사코드를 입력하십시오.");
      $NC.setFocus("#edtCarrier_Cd");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.WB_NO_CONST)) {
      alert("운송장번호 상수값을 입력하십시오.");
      $NC.setFocus("#edtWb_No_Const");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.WB_NO_BEGIN)) {
      alert("운송장번호 시작값을 입력하십시오.");
      $NC.setFocus("#edtWb_No_Begin");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.WB_NO_END)) {
      alert("운송장번호 종료값을 입력하십시오.");
      $NC.setFocus("#edtWb_No_End");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.HDC_DIV)) {
      alert("택배사구분을 입력하십시오.");
      $NC.setFocus("#cboHdc_Div");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
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
    id: "CARRIER_CD",
    field: "CARRIER_CD",
    name: "운송사",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_NM",
    field: "CARRIER_NM",
    name: "운송사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "HDC_DIV_F",
    field: "HDC_DIV_F",
    name: "택배사구분",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "HD_CUST_ID",
    field: "HD_CUST_ID",
    name: "택배고객사ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "WB_NO_CNT",
    field: "WB_NO_CNT",
    name: "잔여운송장수량",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "WB_NO_CONST",
    field: "WB_NO_CONST",
    name: "운송장번호 상수값",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "WB_NO_BEGIN",
    field: "WB_NO_BEGIN",
    name: "운송장번호 시작값",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "WB_NO_END",
    field: "WB_NO_END",
    name: "운송장번호 종료값",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 160
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
    queryId: "CM07020E.RS_MASTER",
    sortCol: "CARRIER_CD",
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
    case "WB_NO_CONST":
      rowData.WB_NO_CONST = args.val;
      break;
    case "WB_NO_BEGIN":
      rowData.WB_NO_BEGIN = args.val;
      break;
    case "WB_NO_END":
      rowData.WB_NO_END = args.val;
      break;
    case "CARRIER_NM":
      rowData.CARRIER_NM = args.val;
      break;
    case "LINE_NO":
      rowData.LINE_NO = args.val;
      break;
    case "HDC_DIV":
      rowData.HDC_DIV = args.val;
      rowData.HDC_DIV_F = $NC.getValueCombo("#cboHdc_Div", "F");
      break;
    case "HD_CUST_ID":
      rowData.HD_CUST_ID = args.val;
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
        selectKey: ["CARRIER_CD", "LINE_NO"],
        selectVal: G_GRDMASTER.lastKeyVal,
        activeCell: true
      });
    }
  } else {
    $NC.setEnableGroup("#divMasterInfoView", false);
    setInputValue("#grdMaster");
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
    
    if (G_GRDMASTER.data.getLength() === 0) {
      $NC.setEnable("#cboHdc_Div", false);
      $NC.setEnable("#edtHd_Cust_Id", false);
      $NC.setEnable("#edtWb_No_Const", false);
      $NC.setEnable("#edtWb_No_Begin", false);
      $NC.setEnable("#edtWb_No_End", false);
    }
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
    selectKey: ["CARRIER_CD", "LINE_NO"]
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
    $NC.setFocus("#cboHdc_Div", true);

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
}
/**
 * 운송장번호 마스터 반영
 */
function onBtnWb_NoClick() {

  var rowCount = G_GRDMASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  if (G_GRDMASTER.lastRow == null) {
    alert("처리할 데이터를 선택하십시오.");
    return;
  }
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  $NC.serviceCall("/CM07020E/callWb_No.do", {
    P_QUERY_ID: "WB.SET_WBNO_CREATE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CARRIER_CD: rowData.CARRIER_CD,
      P_LINE_NO: rowData.LINE_NO,
      P_HDC_DIV: rowData.HDC_DIV,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, function() {
    alert('운송장번호가 생성되었습니다.');
    _Inquiry();
  });
}
