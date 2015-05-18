/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "REF_CUST_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQRef_Cust_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    addAll: true,
    onComplete: function() {
      $NC.setValue("#cboQRef_Cust_Div", 0);
    }
  });

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "REF_CUST_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboRef_Cust_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboRef_Cust_Div", -1);
    }
  });

  $NC.setValue("#chkQDeal_Div1", "Y");
  $NC.setValue("#chkQDeal_Div2", "Y");

  $("#btnZip_Cd").click(showPostPopup);
  $("#btnManager_Id").click(showManagerPopup);

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
 * 조회조건이 변경될 때 호출
 */
function _OnConditionChange(e, view, val) {

  onChangingCondition();
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

  // 조회조건 체크
  var REF_CUST_DIV = $NC.getValue("#cboQRef_Cust_Div");
  var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
  var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
  var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_REF_CUST_DIV: REF_CUST_DIV,
    P_DEAL_DIV1: DEAL_DIV1,
    P_DEAL_DIV2: DEAL_DIV2,
    P_DEAL_DIV3: DEAL_DIV3
  });

  // 데이터 조회
  $NC.serviceCall("/CM02030E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
      $NC.setFocus("#edtRef_Cust_Cd");
      return;
    }
  }

  var Ref_Cust_Div = $NC.getValue("#cboQRef_Cust_Div");

  if ($NC.isNull(Ref_Cust_Div) || Ref_Cust_Div === "" || Ref_Cust_Div === "%") {
    Ref_Cust_Div = "";
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    REF_CUST_CD: null,
    REF_CUST_NM: null,
    REF_CUST_FULL_NM: null,
    REF_CUST_DIV: Ref_Cust_Div,
    BUSINESS_NO: null,
    CEO_NM: null,
    BUSINESS_KIND: null,
    BUSINESS_TYPE: null,
    IDENTITY_NO: null,
    ZIP_CD: null,
    ADDR_BASIC: null,
    ADDR_DETAIL: null,
    TEL_NO: null,
    FAX_NO: null,
    CHARGE_NM: null,
    CHARGE_DUTY: null,
    CHARGE_TEL: null,
    CHARGE_HP: null,
    EMAIL_ADDR: null,
    MANAGER_ID: null,
    DEAL_DIV: "1",
    OPEN_DATE: null,
    CLOSE_DATE: null,
    REMARK1: null,
    REG_USER_ID: null,
    REG_DATETIME: null,
    MANAGER_NM: null,
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
        P_REF_CUST_CD: rowData.REF_CUST_CD,
        P_REF_CUST_NM: rowData.REF_CUST_NM,
        P_REF_CUST_FULL_NM: rowData.REF_CUST_FULL_NM,
        P_REF_CUST_DIV: rowData.REF_CUST_DIV,
        P_BUSINESS_NO: rowData.BUSINESS_NO,
        P_CEO_NM: rowData.CEO_NM,
        P_BUSINESS_KIND: rowData.BUSINESS_KIND,
        P_BUSINESS_TYPE: rowData.BUSINESS_TYPE,
        P_IDENTITY_NO: rowData.IDENTITY_NO,
        P_ZIP_CD: rowData.ZIP_CD,
        P_ADDR_BASIC: rowData.ADDR_BASIC,
        P_ADDR_DETAIL: rowData.ADDR_DETAIL,
        P_TEL_NO: rowData.TEL_NO,
        P_FAX_NO: rowData.FAX_NO,
        P_CHARGE_NM: rowData.CHARGE_NM,
        P_CHARGE_DUTY: rowData.CHARGE_DUTY,
        P_CHARGE_TEL: rowData.CHARGE_TEL,
        P_CHARGE_HP: rowData.CHARGE_HP,
        P_EMAIL_ADDR: rowData.EMAIL_ADDR,
        P_MANAGER_ID: rowData.MANAGER_ID,
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
    $NC.serviceCall("/CM02030E/save.do", {
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
    selectKey: "REF_CUST_CD",
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

function setInputValue(grdSelector, rowData) {

  if (grdSelector === "#grdMaster") {

    if ($NC.isNull(rowData)) {
      // 초기화시 기본값 지정
      rowData = {
        CRUD: "R"
      };
    }
    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtRef_Cust_Cd", rowData["REF_CUST_CD"]);
    $NC.setValue("#edtRef_Cust_Nm", rowData["REF_CUST_NM"]);
    $NC.setValue("#edtRef_Cust_Full_Nm", rowData["REF_CUST_FULL_NM"]);
    $NC.setValue("#cboRef_Cust_Div", rowData["REF_CUST_DIV"]);
    $NC.setValue("#edtBusiness_No", rowData["BUSINESS_NO"]);
    $NC.setValue("#edtCeo_Nm", rowData["CEO_NM"]);
    $NC.setValue("#edtBusiness_Kind", rowData["BUSINESS_KIND"]);
    $NC.setValue("#edtBusiness_Type", rowData["BUSINESS_TYPE"]);
    $NC.setValue("#edtIdentity_No", rowData["IDENTITY_NO"]);
    $NC.setValue("#edtZip_Cd", rowData["ZIP_CD"]);
    $NC.setValue("#edtAddr_Basic", rowData["ADDR_BASIC"]);
    $NC.setValue("#edtAddr_Detail", rowData["ADDR_DETAIL"]);
    $NC.setValue("#edtTel_No", rowData["TEL_NO"]);
    $NC.setValue("#edtFax_No", rowData["FAX_NO"]);
    $NC.setValue("#edtCharge_Nm", rowData["CHARGE_NM"]);
    $NC.setValue("#edtCharge_Duty", rowData["CHARGE_DUTY"]);
    $NC.setValue("#edtCharge_Tel", rowData["CHARGE_TEL"]);
    $NC.setValue("#edtCharge_Hp", rowData["CHARGE_HP"]);
    $NC.setValue("#edtEmail_Addr", rowData["EMAIL_ADDR"]);
    $NC.setValue("#edtManager_Id", rowData["MANAGER_ID"]);
    $NC.setValue("#edtManager_Nm", rowData["MANAGER_NM"]);
    $NC.setValue("#rgbDeal_Div1", rowData["DEAL_DIV"] === "1");
    $NC.setValue("#rgbDeal_Div2", rowData["DEAL_DIV"] === "2");
    $NC.setValue("#rgbDeal_Div3", rowData["DEAL_DIV"] === "3");
    $NC.setValue("#dtpOpen_Date", rowData["OPEN_DATE"]);
    $NC.setValue("#dtpClose_Date", rowData["CLOSE_DATE"]);
    $NC.setValue("#edtRemark1", rowData["REMARK1"]);
    // 신규 데이터면 관련사코드 수정할 수 있게 함
    if (rowData.CRUD == "C" || rowData.CRUD == "N") {
      $NC.setEnable("#edtRef_Cust_Cd");
    } else {
      $NC.setEnable("#edtRef_Cust_Cd", false);
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
    if ($NC.isNull(rowData.REF_CUST_CD)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.REF_CUST_CD)) {
      alert("관련사코드를 입력하십시오.");
      $NC.setFocus("#edtRef_Cust_Cd");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.REF_CUST_NM)) {
      alert("관련사명을 입력하십시오.");
      $NC.setFocus("#edtRef_Cust_Nm");
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

function grdMasterOnNewRecord(args) {

  $NC.setValue("#cboRef_Cust_Div", args.rowData.REF_CUST_DIV);
  $NC.setValue("#rgbDeal_Div", args.rowData.DEAL_DIV);

  $NC.setFocus("#edtRef_Cust_Cd");
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "REF_CUST_CD",
    field: "REF_CUST_CD",
    name: "관련사코드",
    minWidth: 90,
    sortable: true,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REF_CUST_NM",
    field: "REF_CUST_NM",
    name: "관련사명",
    minWidth: 120,
    sortable: true
  });
  $NC.setGridColumn(columns, {
    id: "REF_CUST_FULL_NM",
    field: "REF_CUST_FULL_NM",
    name: "관련사정식명칭",
    minWidth: 150,
    sortable: true
  });
  $NC.setGridColumn(columns, {
    id: "BUSINESS_NO",
    field: "BUSINESS_NO",
    name: "사업자등록번호",
    minWidth: 100,
    sortable: true,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CEO_NM",
    field: "CEO_NM",
    name: "대표자명",
    minWidth: 90,
    sortable: true
  });
  $NC.setGridColumn(columns, {
    id: "BUSINESS_KIND",
    field: "BUSINESS_KIND",
    name: "업태",
    minWidth: 90,
    sortable: true
  });
  $NC.setGridColumn(columns, {
    id: "BUSINESS_TYPE",
    field: "BUSINESS_TYPE",
    name: "종목",
    minWidth: 90,
    sortable: true
  });
  $NC.setGridColumn(columns, {
    id: "IDENTITY_NO",
    field: "IDENTITY_NO",
    name: "법인번호",
    minWidth: 100,
    sortable: true
  });
  $NC.setGridColumn(columns, {
    id: "ZIP_CD",
    field: "ZIP_CD",
    name: "우편번호",
    minWidth: 70,
    sortable: true,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_BASIC",
    field: "ADDR_BASIC",
    name: "기본주소",
    minWidth: 120,
    sortable: true
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_DETAIL",
    field: "ADDR_DETAIL",
    name: "상세주소",
    minWidth: 120,
    sortable: true
  });
  $NC.setGridColumn(columns, {
    id: "TEL_NO",
    field: "TEL_NO",
    name: "대표전화번호",
    minWidth: 90,
    sortable: true
  });
  $NC.setGridColumn(columns, {
    id: "FAX_NO",
    field: "FAX_NO",
    name: "팩스번호",
    minWidth: 90,
    sortable: true
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
    queryId: "CM02030E.RS_MASTER",
    sortCol: "REF_CUST_CD",
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
    case "REF_CUST_CD":
      rowData.REF_CUST_CD = args.val;
      break;
    case "REF_CUST_NM":
      rowData.REF_CUST_NM = args.val;
      if ($NC.isNull(rowData.REF_CUST_FULL_NM)) {
        rowData.REF_CUST_FULL_NM = rowData.REF_CUST_NM;
        $NC.setValue("#edtRef_Cust_Full_Nm", rowData.REF_CUST_FULL_NM);
      }
      break;
    case "REF_CUST_FULL_NM":
      rowData.REF_CUST_FULL_NM = args.val;
      break;
    case "REF_CUST_DIV":
      rowData.REF_CUST_DIV = args.val;
      break;
    case "BUSINESS_NO":
      rowData.BUSINESS_NO = args.val;
      break;
    case "CEO_NM":
      rowData.CEO_NM = args.val;
      break;
    case "BUSINESS_KIND":
      rowData.BUSINESS_KIND = args.val;
      break;
    case "BUSINESS_TYPE":
      rowData.BUSINESS_TYPE = args.val;
      break;
    case "IDENTITY_NO":
      rowData.IDENTITY_NO = args.val;
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
    case "TEL_NO":
      rowData.TEL_NO = args.val;
      break;
    case "FAX_NO":
      rowData.FAX_NO = args.val;
      break;
    case "CHARGE_NM":
      rowData.CHARGE_NM = args.val;
      break;
    case "CHARGE_DUTY":
      rowData.CHARGE_DUTY = args.val;
      break;
    case "CHARGE_TEL":
      rowData.CHARGE_TEL = args.val;
      break;
    case "CHARGE_HP":
      rowData.CHARGE_HP = args.val;
      break;
    case "EMAIL_ADDR":
      rowData.EMAIL_ADDR = args.val;
      break;
    case "MANAGER_ID":
      var P_QUERY_PARAMS;
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
        selectKey: "REF_CUST_CD",
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
    selectKey: "REF_CUST_CD"
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

    rowData.MANAGER_ID = resultInfo.USER_ID;
    rowData.MANAGER_NM = resultInfo.USER_NM;
  } else {
    $NC.setValue("#edtManager_Id");
    $NC.setValue("#edtManager_Nm");
    $NC.setFocus("#edtManager_Id", true);

    rowData.MANAGER_ID = "";
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
 * 검색조건의 우편번호 검색 이미지 클릭
 */
function showPostPopup() {

  $NP.showPostPopup({
    P_ADDR_NM: $NC.G_USERINFO.ZIP_CD
  }, onPostPopup, function() {
  });
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