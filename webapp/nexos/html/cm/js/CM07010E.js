/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 택배사구분의 표시여부
    HDC_DIV: {
      YN_01: "N", // CJ대한통운
      YN_02: "N", // 한진택배
      YN_03: "N", // 우체국택배
      YN_04: "N" // GTX택배
    }
  });

  // 택배사구분 표시여부 변수값 세팅
  setHDCValInfo();

  // 그리드 초기화
  grdMasterInitialize();

  // 택배사구분 표시여부 적용
  if ($NC.G_VAR.HDC_DIV.YN_01 == "N") {
    $("#hdrHdc_Div01").hide();
    $("#gboxHdc_Div01").hide();
  }
  if ($NC.G_VAR.HDC_DIV.YN_02 == "N") {
    $("#hdrHdc_Div02").hide();
    $("#gboxHdc_Div02").hide();
  }
  if ($NC.G_VAR.HDC_DIV.YN_03 == "N") {
    $("#hdrHdc_Div03").hide();
    $("#gboxHdc_Div03").hide();
  }
  if ($NC.G_VAR.HDC_DIV.YN_04 == "N") {
    $("#hdrHdc_Div04").hide();
    $("#gboxHdc_Div04").hide();
  }

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
 * 조회조건이 변경될 때 호출
 */
function _OnConditionChange(e, view, val) {

  onChangingCondition();
}

function onChangingCondition() {

  // 전역 변수 값 초기화
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

  // 조회조건 체크
  var ZIP_CD = $NC.getValue("#edtQZip_Cd");
  var ADDR_NM = $NC.getValue("#edtQAddr_Nm");
  /*  
    if ($NC.isNull(ZIP_CD) && $NC.isNull(ADDR_NM)) {
      alert("검색 주소 값을 입력하십시오.");
      $NC.setFocus("#edtQZip_Cd");
      return;
    }
  */
  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_ZIP_CD: ZIP_CD,
    P_ADDR_NM: ADDR_NM
  });

  // 데이터 조회
  $NC.serviceCall("/CM07010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
      $NC.setFocus("#edtZip_Cd");
      return;
    }
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    ZIP_CD: null,
    ADDR_NM1: null,
    ADDR_NM2: null,
    ADDR_NM3: null,
    ADDR_DETAIL: null,
    CJ_DLV_CD: null,
    CJ_DLV_NM: null,
    CJ_TML_CD: null,
    CJ_TML_SUB_CD: null,
    CJ_TML_NM: null,
    CJ_POSTMAN_NM: null,
    CJ_SHIP_YN: "N",
    CJ_AIR_YN: "N",
    HJ_DLV_NM: null,
    HJ_TML_CD: null,
    HJ_TML_NM: null,
    HJ_FILT_CD: null,
    HJ_SHIP_FARE: null,
    HJ_AIR_FARE: null,
    EP_DLV_NM: null,
    EP_TML_NM: null,
    GTX_SHIP_CODE1: null,
    GTX_SHIP_CODE2: null,
    GTX_ADDR3: null,
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
        P_ZIP_CD: rowData.ZIP_CD,
        P_ADDR_NM1: rowData.ADDR_NM1,
        P_ADDR_NM2: rowData.ADDR_NM2,
        P_ADDR_NM3: rowData.ADDR_NM3,
        P_ADDR_DETAIL: rowData.ADDR_DETAIL,
        P_CJ_DLV_CD: rowData.CJ_DLV_CD,
        P_CJ_DLV_NM: rowData.CJ_DLV_NM,
        P_CJ_TML_CD: rowData.CJ_TML_CD,
        P_CJ_TML_SUB_CD: rowData.CJ_TML_SUB_CD,
        P_CJ_TML_NM: rowData.CJ_TML_NM,
        P_CJ_POSTMAN_NM: rowData.CJ_POSTMAN_NM,
        P_CJ_SHIP_YN: rowData.CJ_SHIP_YN,
        P_CJ_AIR_YN: rowData.CJ_AIR_YN,
        P_HJ_DLV_NM: rowData.HJ_DLV_NM,
        P_HJ_TML_CD: rowData.HJ_TML_CD,
        P_HJ_TML_NM: rowData.HJ_TML_NM,
        P_HJ_FILT_CD: rowData.HJ_FILT_CD,
        P_HJ_SHIP_FARE: rowData.HJ_SHIP_FARE,
        P_HJ_AIR_FARE: rowData.HJ_AIR_FARE,
        P_EP_DLV_NM: rowData.EP_DLV_NM,
        P_EP_TML_NM: rowData.EP_TML_NM,
        P_GTX_SHIP_CODE1: rowData.GTX_SHIP_CODE1,
        P_GTX_SHIP_CODE2: rowData.GTX_SHIP_CODE2,
        P_GTX_ADDR3: rowData.GTX_ADDR3,
        P_CRUD: rowData.CRUD
      };
      saveDS.push(saveData);
    }
  }
  if (saveDS.length > 0) {
    $NC.serviceCall("/CM07010E/save.do", {
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
    selectKey: "ZIP_CD",
    isCancel: true
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 */
function _Print(printIndex, printName) {

}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ZIP_CD",
    field: "ZIP_CD",
    name: "우편번호",
    band: 0,
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_NM1",
    field: "ADDR_NM1",
    name: "시도",
    band: 0,
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_NM2",
    field: "ADDR_NM2",
    name: "시군구",
    band: 0,
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_NM3",
    field: "ADDR_NM3",
    name: "읍면동",
    band: 1,
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_DETAIL",
    field: "ADDR_DETAIL",
    name: "상세주소",
    band: 1,
    minWidth: 180
  });

  if ($NC.G_VAR.HDC_DIV.YN_01 == "Y") {
    $NC.setGridColumn(columns, {
      id: "CJ_DLV_CD",
      field: "CJ_DLV_CD",
      name: "관할점소코드",
      band: 2,
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "CJ_DLV_NM",
      field: "CJ_DLV_NM",
      name: "관할점소명",
      band: 2,
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "CJ_TML_CD",
      field: "CJ_TML_CD",
      name: "도착점코드",
      band: 2,
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "CJ_TML_SUB_CD",
      field: "CJ_TML_SUB_CD",
      name: "서브도착점코드",
      band: 2,
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "CJ_TML_NM",
      field: "CJ_TML_NM",
      name: "도착점명",
      band: 2,
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "CJ_POSTMAN_NM",
      field: "CJ_POSTMAN_NM",
      name: "집배사원명",
      band: 2,
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "CJ_SHIP_YN",
      field: "CJ_SHIP_YN",
      name: "도선여부",
      minWidth: 60,
      band: 2,
      cssClass: "align-center",
      formatter: Slick.Formatters.CheckBox
    });
    $NC.setGridColumn(columns, {
      id: "CJ_AIR_YN",
      field: "CJ_AIR_YN",
      name: "항공여부",
      minWidth: 60,
      band: 2,
      cssClass: "align-center",
      formatter: Slick.Formatters.CheckBox
    });
  }
  if ($NC.G_VAR.HDC_DIV.YN_02 == "Y") {
    $NC.setGridColumn(columns, {
      id: "HJ_DLV_NM",
      field: "HJ_DLV_NM",
      name: "배송점소명",
      band: 3,
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "HJ_TML_CD",
      field: "HJ_TML_CD",
      name: "터미널코드",
      band: 3,
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "HJ_TML_NM",
      field: "HJ_TML_NM",
      name: "터미널명",
      band: 3,
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "HJ_FILT_CD",
      field: "HJ_FILT_CD",
      name: "도착지코드",
      band: 3,
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "HJ_SHIP_FARE",
      field: "HJ_SHIP_FARE",
      name: "도선료",
      band: 3,
      minWidth: 80,
      cssClass: "align-right"
    });
    $NC.setGridColumn(columns, {
      id: "HJ_AIR_FARE",
      field: "HJ_AIR_FARE",
      name: "항공료",
      band: 3,
      minWidth: 80,
      cssClass: "align-right"
    });
  }
  if ($NC.G_VAR.HDC_DIV.YN_03 == "Y") {
    $NC.setGridColumn(columns, {
      id: "EP_DLV_NM",
      field: "EP_DLV_NM",
      name: "우체국배송국명",
      band: 4,
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "EP_TML_NM",
      field: "EP_TML_NM",
      name: "도착집중국명",
      band: 4,
      minWidth: 100
    });
  }
  if ($NC.G_VAR.HDC_DIV.YN_04 == "Y") {
    $NC.setGridColumn(columns, {
      id: "GTX_SHIP_CODE1",
      field: "GTX_SHIP_CODE1",
      name: "터미널코드1",
      band: 5,
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "GTX_SHIP_CODE2",
      field: "GTX_SHIP_CODE2",
      name: "터미널코드2",
      band: 5,
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "GTX_ADDR3",
      field: "GTX_ADDR3",
      name: "배송대리점",
      band: 5,
      minWidth: 100
    });
  }

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 2,
    showBandRow: true,
    bands: ["주소정보", "세부주소", "CJ대한통운", "한진택배", "우체국택배", "GTX택배"]
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CM07010E.RS_MASTER",
    sortCol: "ZIP_CD",
    gridOptions: options
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnNewRecord(args) {

  $NC.setFocus("#edtZip_Cd");
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
    if ($NC.isNull(rowData.ZIP_CD)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.ZIP_CD)) {
      alert("우편번호를 입력하십시오.");
      $NC.setFocus("#edtZip_Cd");
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
    case "ZIP_CD":
      rowData.ZIP_CD = args.val;
      break;
    case "ADDR_NM1":
      rowData.ADDR_NM1 = args.val;
      break;
    case "ADDR_NM2":
      rowData.ADDR_NM2 = args.val;
      break;
    case "ADDR_NM3":
      rowData.ADDR_NM3 = args.val;
      break;
    case "ADDR_DETAIL":
      rowData.ADDR_DETAIL = args.val;
      break;
    case "CJ_DLV_CD":
      rowData.CJ_DLV_CD = args.val;
      break;
    case "CJ_DLV_NM":
      rowData.CJ_DLV_NM = args.val;
      break;
    case "CJ_TML_CD":
      rowData.CJ_TML_CD = args.val;
      break;
    case "CJ_TML_SUB_CD":
      rowData.CJ_TML_SUB_CD = args.val;
      break;
    case "CJ_TML_NM":
      rowData.CJ_TML_NM = args.val;
      break;
    case "CJ_POSTMAN_NM":
      rowData.CJ_POSTMAN_NM = args.val;
      break;
    case "CJ_SHIP_YN":
      rowData.CJ_SHIP_YN = args.val;
      break;
    case "CJ_AIR_YN":
      rowData.CJ_AIR_YN = args.val;
      break;
    case "HJ_DLV_NM":
      rowData.HJ_DLV_NM = args.val;
      break;
    case "HJ_TML_CD":
      rowData.HJ_TML_CD = args.val;
      break;
    case "HJ_TML_NM":
      rowData.HJ_TML_NM = args.val;
      break;
    case "HJ_FILT_CD":
      rowData.HJ_FILT_CD = args.val;
      break;
    case "HJ_SHIP_FARE":
      rowData.HJ_SHIP_FARE = args.val;
      break;
    case "HJ_AIR_FARE":
      rowData.HJ_AIR_FARE = args.val;
      break;
    case "EP_DLV_NM":
      rowData.EP_DLV_NM = args.val;
      break;
    case "EP_TML_NM":
      rowData.EP_TML_NM = args.val;
      break;
    case "GTX_SHIP_CODE1":
      rowData.GTX_SHIP_CODE1 = args.val;
      break;
    case "GTX_SHIP_CODE2":
      rowData.GTX_SHIP_CODE2 = args.val;
      break;
    case "GTX_ADDR3":
      rowData.GTX_ADDR3 = args.val;
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

function setInputValue(grdSelector, rowData) {

  if (grdSelector === "#grdMaster") {

    if ($NC.isNull(rowData)) {
      // 초기화시 기본값 지정
      rowData = {
        CRUD: "R"
      };
    }
    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtZip_Cd", rowData["ZIP_CD"]);
    $NC.setValue("#edtAddr_Nm1", rowData["ADDR_NM1"]);
    $NC.setValue("#edtAddr_Nm2", rowData["ADDR_NM2"]);
    $NC.setValue("#edtAddr_Nm3", rowData["ADDR_NM3"]);
    $NC.setValue("#edtAddr_Detail", rowData["ADDR_DETAIL"]);
    $NC.setValue("#edtCj_Dlv_Cd", rowData["CJ_DLV_CD"]);
    $NC.setValue("#edtCj_Dlv_Nm", rowData["CJ_DLV_NM"]);
    $NC.setValue("#edtCj_Tml_Cd", rowData["CJ_TML_CD"]);
    $NC.setValue("#edtCj_Tml_Sub_Cd", rowData["CJ_TML_SUB_CD"]);
    $NC.setValue("#edtCj_Tml_Nm", rowData["CJ_TML_NM"]);
    $NC.setValue("#edtCj_Postman_Nm", rowData["CJ_POSTMAN_NM"]);
    $NC.setValue("#chkCj_Ship_Yn", rowData["CJ_SHIP_YN"]);
    $NC.setValue("#chkCj_Air_Yn", rowData["CJ_AIR_YN"]);
    $NC.setValue("#edtHj_Dlv_Nm", rowData["HJ_DLV_NM"]);
    $NC.setValue("#edtHj_Tml_Cd", rowData["HJ_TML_CD"]);
    $NC.setValue("#edtHj_Tml_Nm", rowData["HJ_TML_NM"]);
    $NC.setValue("#edtHj_Filt_Cd", rowData["HJ_FILT_CD"]);
    $NC.setValue("#edtHj_Ship_Fare", rowData["HJ_SHIP_FARE"]);
    $NC.setValue("#edtHj_Air_Fare", rowData["HJ_AIR_FARE"]);
    $NC.setValue("#edtEp_Dlv_Nm", rowData["EP_DLV_NM"]);
    $NC.setValue("#edtEp_Tml_Nm", rowData["EP_TML_NM"]);
    $NC.setValue("#edtGtx_Ship_Code1", rowData["GTX_SHIP_CODE1"]);
    $NC.setValue("#edtGtx_Ship_Code2", rowData["GTX_SHIP_CODE2"]);
    $NC.setValue("#edtGtx_Addr3", rowData["GTX_ADDR3"]);

    // 신규 데이터면 우편번호 수정할 수 있게 함
    if (rowData.CRUD == "C" || rowData.CRUD == "N") {
      $NC.setEnable("#edtZip_Cd");
    } else {
      $NC.setEnable("#edtZip_Cd", false);
    }
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
        selectKey: "ZIP_CD",
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
    selectKey: "ZIP_CD"
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
    G_GRDMASTER.lastRowModified = false;
  }
}

function setHDCValInfo() {

  var HDC_DIV;
  for ( var HDC_DIV_YN in $NC.G_VAR.HDC_DIV) {
    HDC_DIV = HDC_DIV_YN.substring(3, 5);
    // 데이터 조회
    $NC.serviceCallAndWait("/CM07010E/callSP.do", {
      P_QUERY_ID: "WB.GET_HDC_DIV_YN",
      P_QUERY_PARAMS: $NC.getParams({
        P_HDC_DIV: HDC_DIV
      })
    }, onGetHDCVal);
  }
}

function onGetHDCVal(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
      $NC.G_VAR.HDC_DIV["YN_" + resultData.P_HDC_DIV] = resultData.O_HDC_DIV_YN;
    }
  }
}
