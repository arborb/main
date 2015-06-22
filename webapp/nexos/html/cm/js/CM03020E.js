/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });
  // 그리드 초기화
  grdMasterInitialize();
  
  
  $NC.setValue("#chkQDeal_Div1", "Y");
  $NC.setValue("#chkQDeal_Div2", "Y");
  
  // 사업구분 초기값 설정
//  $NC.setValue("#edtBu_Cd", $NC.G_USERINFO.BU_CD);
//  $NC.setValue("#edtBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtCust_Cd", $NC.G_USERINFO.CUST_CD);

  
  
  $("#edtQbtnCust").click(showQCustPopup);
  $("#btnBu_Cd").click(showUserBuPopup);
  // $("#btnManager").click(showManagerPopup);
  $("#btnSalesman").click(showSalesmanPopup);
  $("#btnZip_Cd").click(showPostPopup);
//  $("#btnQBrand_Cd").click(showBrandPopup);
  $("#btnCreateOwnBrand").click(onBtnCreateOwnBrandClick);

  $NC.setInitDatePicker("#dtpOpen_Date", null, "N");
  $NC.setInitDatePicker("#dtpClose_Date", null, "N");

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
/*
  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      
      P_QUERY_PARAMS = {
          P_BRAND_CD: val,
          P_VIEW_DIV: '3'
      };
      O_RESULT_DATA = $NP.getBrandInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBrandPopup, onBrandPopup);
    }
    return;
  }
  */

  onChangingCondition();
}

function onChangingCondition() {

  $NC.clearGridData(G_GRDMASTER);

  $NC.setEnableGroup("#divMasterInfoView", false);
  setInputValue("#grdMaster");

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

  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var BRAND_NM = $NC.getValue("#edtQBrand_Nm", true);
  var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
  var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
  var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CUST_CD: $NC.G_USERINFO.CUST_CD,
    P_BRAND_CD: BRAND_CD,
    P_BRAND_NM: BRAND_NM,
    P_DEAL_DIV1: DEAL_DIV1,
    P_DEAL_DIV2: DEAL_DIV2,
    P_DEAL_DIV3: DEAL_DIV3,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });

  // 데이터 조회
  $NC.serviceCall("/CM03020E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
      $NC.setFocus("#edtBrand_Cd");
      return;
    }
  }

  var Cust_Cd = $NC.G_USERINFO.CUST_CD;
  var Cust_Nm = $NC.G_USERINFO.CUST_NM;

  if ($NC.isNull(Cust_Cd) || Cust_Cd === "" || Cust_Cd === "%") {
    Cust_Cd = "";
    Cust_Nm = "";
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    BRAND_CD: null,
    BRAND_NM: null,
    BRAND_FULL_NM: null,
    BRAND_DIV: 1,
    CUST_CD: Cust_Cd,
    CUST_NM: Cust_Nm,
    MANAGER_ID: null, // 이부분 확인하기
    SALESMAN_ID: null,
    DEAL_DIV: "1",
    OPEN_DATE: null,
    CLOSE_DATE: null,
    ZIP_CD: null,
    ADDR_BASIC: null,
    ADDR_DETAIL: null,
    CHARGE_NM: null,
    TEL_NO: null,
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

  $NC.setFocus("#edtBrand_Cd");
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
        P_BRAND_CD: rowData.SELLER_CD,
        P_BRAND_NM: rowData.SELLER_NM,
        P_BRAND_FULL_NM: rowData.BRAND_FULL_NM,
        P_BRAND_DIV: rowData.BRAND_DIV,
        P_CUST_CD: $NC.G_USERINFO.CUST_CD,
        P_MANAGER_ID: rowData.MANAGER_ID,
        P_SALESMAN_ID: rowData.SALESMAN_ID,
        P_DEAL_DIV: rowData.DEAL_DIV,
        P_OPEN_DATE: rowData.OPEN_DATE,
        P_CLOSE_DATE: rowData.CLOSE_DATE,
        P_ZIP_CD: rowData.ZIP_CD,
        P_ADDR_BASIC: rowData.ADDR_BASIC,
        P_ADDR_DETAIL: rowData.ADDR_DETAIL,
        P_CHARGE_NM: rowData.CHARGE_NM,
        P_TEL_NO: rowData.TEL_NO,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveDS.push(saveData);
    }
  }
  if (saveDS.length > 0) {
    $NC.serviceCall("/CM03020E/save.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave,onSaveError);
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
    selectKey: "BRAND_CD",
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
    if ($NC.isNull(rowData.SELLER_CD)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.SELLER_CD)) {
      alert("판매사코드를 입력하십시오.");
      $NC.setFocus("#edtBrand_Cd");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.SELLER_NM)) {
      alert("판매사명을 입력하십시오.");
      $NC.setFocus("#edtBrand_Nm");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.DEAL_DIV)) {
      alert("거래구분을 선택하십시오.");
      $NC.setFocus("#rgbDeal_Div");
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
    id: "SELLER_CD",
    field: "SELLER_CD",
    name: "판매사코드",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "SELLER_NM",
    field: "SELLER_NM",
    name: "판매사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_FULL_NM",
    field: "BRAND_FULL_NM",
    name: "판매사정식명칭",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "REMARK12",
    field: "REMARK1",
    name: "판매사ID",
    minWidth: 150
  });
  /*
  $NC.setGridColumn(columns, {
    id: "MANAGER_ID",
    field: "MANAGER_ID",
    name: "관리책임자ID",
    minWidth: 110
  });
  $NC.setGridColumn(columns, {
    id: "MANAGER_NM",
    field: "MANAGER_NM",
    name: "관리책임자명",
    minWidth: 110
  });
  */
  $NC.setGridColumn(columns, {
    id: "SALESMAN_ID",
    field: "SALESMAN_ID",
    name: "영업담당자ID",
    minWidth: 110
  });
  $NC.setGridColumn(columns, {
    id: "SALESMAN_NM",
    field: "SALESMAN_NM",
    name: "영업담당자명",
    minWidth: 110
  });
  $NC.setGridColumn(columns, {
    id: "OPEN_DATE",
    field: "OPEN_DATE",
    name: "거래시작일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CLOSE_DATE",
    field: "CLOSE_DATE",
    name: "거래종료일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ZIP_CD",
    field: "ZIP_CD",
    name: "우편번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_BASIC",
    field: "ADDR_BASIC",
    name: "기본주소",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_DETAIL",
    field: "ADDR_DETAIL",
    name: "상세주소",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "CHARGE_NM",
    field: "CHARGE_NM",
    name: "담당자명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "TEL_NO",
    field: "TEL_NO",
    name: "대표전화번호",
    minWidth: 90
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
    queryId: "CM03020E.RS_MASTER",
    sortCol: "BRAND_CD",
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
    case "BRAND_CD":
      rowData.SELLER_CD = args.val;
      break;
    case "BRAND_NM":
      rowData.SELLER_NM = args.val;
      if ($NC.isNull(rowData.VENDOR_FULL_NM)) {
        rowData.BRAND_FULL_NM = rowData.SELLER_NM;
        $NC.setValue("#edtBrand_Full_Nm", rowData.BRAND_FULL_NM);
      }
      break;
    case "BU_CD":
      var P_QUERY_PARAMS;
      var O_RESULT_DATA = [ ];
      if (!$NC.isNull(args.val)) {
        P_QUERY_PARAMS = {
          P_USER_ID: $NC.G_USERINFO.USER_ID,
          P_BU_CD: args.val
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
    case "BRAND_FULL_NM":
      rowData.BRAND_FULL_NM = args.val;
      break;
    case "MANAGER_ID":
      var O_RESULT_DATA = [ ];
      if (!$NC.isNull(args.val)) {
        P_QUERY_PARAMS = {
          P_USER_ID: args.val,
          P_CERTIFY_DIV: "%"
        };
        O_RESULT_DATA = $NP.getUserInfo({
          queryParams: P_QUERY_PARAMS
        });
      }
      if (O_RESULT_DATA.length <= 1) {
        onManagerPopup(O_RESULT_DATA[0]);
      } else {
        $NP.showUserPopup({
          queryParams: P_QUERY_PARAMS,
          queryData: O_RESULT_DATA
        }, onManagerPopup, onManagerPopup);
      }
      return;
    case "SALESMAN_ID":
      var O_RESULT_DATA = [ ];
      if (!$NC.isNull(args.val)) {
        O_RESULT_DATA = $NP.getUserInfo({
          queryParams: P_QUERY_PARAMS
        });
      }
      if (O_RESULT_DATA.length <= 1) {
        onSalesmanPopup(O_RESULT_DATA[0]);
      } else {
        $NP.showUserPopup({
          queryParams: P_QUERY_PARAMS,
          queryData: O_RESULT_DATA
        }, onSalesmanPopup, onSalesmanPopup);
      }
      return;
    case "DEAL_DIV":
      rowData.DEAL_DIV = args.val;
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
    case "ZIP_CD":
      rowData.ZIP_CD = args.val;
      break;
    case "ADDR_BASIC":
      rowData.ADDR_BASIC = args.val;
      break;
    case "ADDR_DETAIL":
      rowData.ADDR_DETAIL = args.val;
      break;
    case "CHARGE_NM":
      rowData.CHARGE_NM = args.val;
      break;
    case "TEL_NO":
      rowData.TEL_NO = args.val;
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
    if ( $NC.G_USERINFO.CERTIFY_DIV !== '4'){
    $NC.setEnableGroup("#divMasterInfoView", true);
    }
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "BRAND_CD",
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
  $NC.G_VAR.buttons._new = "1";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "BRAND_CD"
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
function setInputValue(grdSelector, rowData) {

  if (grdSelector === "#grdMaster") {

    if ($NC.isNull(rowData)) {
      // 초기화시 기본값 지정
      rowData = {
        CRUD: "R"
      };
    }
    // Row 데이터로 에디터 세팅
    // 선택된 로우 데이터로 에디터 세팅
    $NC.setValue("#edtBrand_Cd", rowData.SELLER_CD);
    $NC.setValue("#edtBrand_Nm", rowData.SELLER_NM);
    $NC.setValue("#edtBrand_Full_Nm", rowData.BRAND_FULL_NM);
    $NC.setValue("#cboBrand_Div", rowData.BRAND_DIV);
    $NC.setValue("#edtCust_Cd", rowData.CUST_CD);
    $NC.setValue("#edtCust_Nm", rowData.CUST_NM);
    $NC.setValue("#edtManager_Id", rowData.BUSINESS_NO);
    $NC.setValue("#edtManager_Nm", rowData.MANAGER_NM);
    $NC.setValue("#edtSalesman_Id", rowData.SALESMAN_ID);
    $NC.setValue("#edtSalesman_Nm", rowData.SALESMAN_NM);
    $NC.setValue("#rgbDeal_Div1", rowData.DEAL_DIV === "1");
    $NC.setValue("#rgbDeal_Div2", rowData.DEAL_DIV === "2");
    $NC.setValue("#rgbDeal_Div3", rowData.DEAL_DIV === "3");
    $NC.setValue("#dtpOpen_Date", rowData.OPEN_DATE);
    $NC.setValue("#dtpClose_Date", rowData.CLOSE_DATE);
    $NC.setValue("#edtZip_Cd", rowData.ZIP_CD);
    $NC.setValue("#edtAddr_Basic", rowData.ADDR_BASIC);
    $NC.setValue("#edtAddr_Detail", rowData.ADDR_DETAIL);
    $NC.setValue("#edtCharge_Nm", rowData.CHARGE_NM);
    $NC.setValue("#edtTel_No", rowData.TEL_NO);
    $NC.setValue("#edtRemark1", rowData.REMARK1);
    // 신규 데이터면 판매사코드 수정할 수 있게 함
    if (rowData["CRUD"] == "C" || rowData["CRUD"] == "N") {
      $NC.setEnable("#edtBrand_Cd");
      $NC.setEnable("#edtManager_Id");
    } else {
      $NC.setEnable("#edtBrand_Cd", false);
      $NC.setEnable("#edtManager_Id", false);
    }
  }

}


function onBtnCreateOwnBrandClick() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("생성할 데이터가 없습니다.");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  
  var BU_CD = $NC.getValue("#edtBu_Cd");
  
  if ($NC.isNull(BU_CD)) {
    alert("사업구분값을 입력하신 후 생성해주시기 바랍니다.");
    $NC.setFocus("#edtBu_Cd");
    return;
  }

  $NC.serviceCall("/CM03020E/setOwnBrandCreate.do", {
    P_QUERY_ID: "CM_OWNBRAND_CRE",
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: $NC.getValue("#edtBu_Cd"),
      P_BRAND_CD: rowData.SELLER_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, function() {
    alert("위탁사 정보가 생성되었습니다.");
  });
}

/**
 * 검색조건의 위탁사 검색 이미지 클릭
 */

function showQCustPopup() {
  $NP.showCustPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_CUST_CD: "%"
  }, onQCustPopup, function() {
    $NC.setFocus("#edtQCust_Cd", true);
  });
}



/**
 * 관리책임자 검색 이미지 클릭
 */
function showManagerPopup() {
  $NP.showUserPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_CERTIFY_DIV: "%"
  }, onManagerPopup, function() {
    $NC.setFocus("#edtManager_Id", true);
  });
}

/**
 * 관리책임자 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onManagerPopup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (!$NC.isNull(resultInfo)) {

    $NC.setValue("#edtManager_Id", resultInfo.USER_ID);
    $NC.setValue("#edtManager_Nm", resultInfo.USER_NM);

    rowData.BUSINESS_NO = resultInfo.USER_ID;
    rowData.MANAGER_NM = resultInfo.USER_NM;
  } else {
    $NC.setValue("#edtManager_Id");
    $NC.setValue("#edtManager_Nm");
    $NC.setFocus("#edtManager_Id", true);

    rowData.BUSINESS_NO = "";
    rowData.MANAGER_NM = "";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

/**
 * 영업담당자 검색 이미지 클릭
 */
function showSalesmanPopup() {
  $NP.showUserPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_CERTIFY_DIV: "%"
  }, onSalesmanPopup, function() {
    $NC.setFocus("#edtSalesman_Id", true);
  });
}

/**
 * 영업담당자 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onSalesmanPopup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtSalesman_Id", resultInfo.USER_ID);
    $NC.setValue("#edtSalesman_Nm", resultInfo.USER_NM);

    rowData.SALESMAN_ID = resultInfo.USER_ID;
    rowData.SALESMAN_NM = resultInfo.USER_NM;
  } else {
    $NC.setValue("#edtSalesman_Id");
    $NC.setValue("#edtSalesman_Nm");
    $NC.setFocus("#edtSalesman_Id", true);

    rowData.SALESMAN_ID = "";
    rowData.SALESMAN_NM = "";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

/**
 * 검색조건의 우편번호 검색 이미지 클릭
 */
function showPostPopup() {

  $NP.showPostPopup({
    P_ADDR_NM: $NC.G_USERINFO.ZIP_CD
  }, onPostPopup, function() {
  });
}

/**
 * 검색조건의 사업구분 검색 이미지 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtBu_Cd", true);
  });
}

function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtBu_Nm", resultInfo.BU_NM);
    $NC.setValue("#edtCust_Cd", resultInfo.CUST_CD);
  } else {
    $NC.setValue("#edtBu_Cd");
    $NC.setValue("#edtBu_Nm");
    $NC.setValue("#edtCust_Cd");
    $NC.setFocus("#edtBu_Cd", true);
  }

}


/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */

function showBrandPopup() {
  $NP.showBrandPopup({
    P_BRAND_CD: '%',
    P_VIEW_DIV: '3'
  }, onBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  // onChangingCondition();
}

/**
 * 우편번호 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onPostPopup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtZip_Cd", resultInfo.ZIP_CD);
    $NC.setValue("#edtAddr_Basic", resultInfo.ADDR_NM_REAL);

    rowData.ZIP_CD = resultInfo.ZIP_CD;
    rowData.ADDR_BASIC = resultInfo.ADDR_NM_REAL;
  } else {
    $NC.setValue("#edtZip_Cd");
    $NC.setValue("#edtAddr_Basic");
    $NC.setFocus("#edtZip_Cd", true);

    rowData.ZIP_CD = "";
    rowData.ADDR_BASIC = "";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}
