/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 탭 초기화
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 그리드 초기화
  grdMasterT1Initialize();
  grdMasterT2Initialize();
  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQOwn_Brand_Cd").click(showOwnBrandPopup);
  $("#btnQDepart_Cd").click(showItemGroupDepartPopup);
  $("#btnQLine_Cd").click(showItemGroupLinePopup);
  $("#btnQClass_Cd").click(showItemGroupClassPopup);

  $NC.setInitDatePicker("#dtpQInbound_Date1");
  $NC.setInitDatePicker("#dtpQInbound_Date2");

  // 시스템일 -2일 설정
  $NC.setValue("#dtpQInbound_Date1", $NC.addDay($NC.getValue("#dtpQInbound_Date1"), -2));

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

  // 조회조건 - 입고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "E1",
      P_SUB_CD2: "E2"
    })
  }, {
    selector: "#cboQInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });
  // 검색구분에 전체를 선택
  $NC.setValue("#rgbQView_Div1", "1");

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $NC.G_LAYOUT.border1;
  $NC.G_OFFSET.subViewHeightOffset = $NC.G_OFFSET.nonClientHeight + $NC.G_LAYOUT.header + $NC.G_LAYOUT.tabHeader
      + ($NC.G_LAYOUT.border1 * 3);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border2;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientWidth -= $NC.G_LAYOUT.border1;
  clientHeight = parent.height() - $NC.G_OFFSET.subViewHeightOffset;
  // 미입고사유등록 탭
  if ($("#divMasterView").tabs("option", "active") === 0) {
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterT1", clientWidth, clientHeight);
    // 기간별 미입고 내역 탭
  } else {
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdMasterT2", clientWidth, clientHeight);
  }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();
  var grdMaster2_refresh = true;

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
  case "OWN_BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CUST_CD: $NC.G_USERINFO.CUST_CD,
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_OWN_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd")
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup, onOwnBrandPopup);
    }
    return;
  case "DEPART_CD":
    var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd");
    if ($NC.isNull(BRAND_CD)) {
      alert("위탁사 코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocus("#edtQOwn_Brand_Cd", true);
      $NC.setValue("edtQDepart_Cd", null);
      return;
    }

    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd")
      };
      O_RESULT_DATA = $NP.getItemGroupDepartInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemGroupDepartPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemGroupDepartPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemGroupDepartPopup, onItemGroupDepartPopup);
    }
    return;
  case "LINE_CD":
    var DEPART_CD = $NC.getValue("#edtQDepart_Cd");
    if ($NC.isNull(DEPART_CD)) {
      alert("대분류 코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocus("#edtQDepart_Cd", true);
      $NC.setValue("edtQLine_Cd", null);
      return;
    }

    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
        P_DEPART_CD: $NC.getValue("#edtQDepart_Cd")
      };
      O_RESULT_DATA = $NP.getItemGroupLineInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemGroupLinePopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemGroupLinePopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemGroupLinePopup, onItemGroupLinePopup);
    }
    return;
  case "CLASS_CD":
    var LINE_CD = $NC.getValue("#edtQLine_Cd");
    if ($NC.isNull(LINE_CD)) {
      alert("중분류 코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocus("#edtQLine_Cd", true);
      $NC.setValue("edtQClass_Cd", null);
      return;
    }

    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
        P_DEPART_CD: $NC.getValue("#edtQDepart_Cd"),
        P_LINE_CD: $NC.getValue("#edtQLine_Cd")
      };
      O_RESULT_DATA = $NP.getItemGroupClassInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemGroupClassPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemGroupClassPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemGroupClassPopup, onItemGroupClassPopup);
    }
    return;
  case "INBOUND_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "INBOUND_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
  case "VIEW_DIV0":
  case "VIEW_DIV1":
    grdMaster2_refresh = false;
    break;
  }
  onChangingCondition(grdMaster2_refresh);
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
    alert("사업구분 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var INBOUND_DATE1 = $NC.getValue("#dtpQInbound_Date1");
  if ($NC.isNull(INBOUND_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQInbound_Date1");
    return;
  }
  var INBOUND_DATE2 = $NC.getValue("#dtpQInbound_Date2");
  if ($NC.isNull(INBOUND_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQInbound_Date2");
    return;
  }
  if (INBOUND_DATE1 > INBOUND_DATE2) {
    alert("입고일자 검색 범위 오류입니다.");
    $NC.setFocus("#dtpQInbound_Date1");
    return;
  }
  var INOUT_CD = $NC.getValue("#cboQInout_Cd");
  if ($NC.isNull(INOUT_CD)) {
    alert("입고구분을 선택하십시오.");
    $NC.setFocus("#cboQInout_Cd");
    return;
  }

  var VIEW_DIV = $(':radio[name="rgbQView_Div"]:checked').val();

  var VENDOR_CD = $NC.getValue("#edtQVendor_Cd");
  if ($NC.isNull(VENDOR_CD)) {
    VENDOR_CD = "%";
  }

  var VENDOR_NM = $NC.getValue("#edtQVendor_Nm");
  if ($NC.isNull(VENDOR_NM)) {
    VENDOR_NM = "%";
  }
  var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd", true);
  var DEPART_CD = $NC.getValue("#edtQDepart_Cd", true);
  var LINE_CD = $NC.getValue("#edtQLine_Cd", true);
  var CLASS_CD = $NC.getValue("#edtQClass_Cd", true);

  // 상품별 입고내역 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERT1);

    G_GRDMASTERT1.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INBOUND_DATE1: INBOUND_DATE1,
      P_INBOUND_DATE2: INBOUND_DATE2,
      P_VIEW_DIV: VIEW_DIV,
      P_INOUT_CD: INOUT_CD,
      P_VENDOR_CD: VENDOR_CD,
      P_VENDOR_NM: VENDOR_NM,
      P_BRAND_CD: BRAND_CD,
      P_DEPART_CD: DEPART_CD,
      P_LINE_CD: LINE_CD,
      P_CLASS_CD: CLASS_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LI04010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERT1), onGetMasterT1);

  } else {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTERT2);

    G_GRDMASTERT2.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INBOUND_DATE1: INBOUND_DATE1,
      P_INBOUND_DATE2: INBOUND_DATE2,
      P_VIEW_DIV: VIEW_DIV,
      P_INOUT_CD: INOUT_CD,
      P_VENDOR_CD: VENDOR_CD,
      P_VENDOR_NM: VENDOR_NM,
      P_BRAND_CD: BRAND_CD,
      P_DEPART_CD: DEPART_CD,
      P_LINE_CD: LINE_CD,
      P_CLASS_CD: CLASS_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LI04010E/getDataSet.do", $NC.getGridParams(G_GRDMASTERT2), onGetMasterT2);

  }
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

  if (G_GRDMASTERT1.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  // 현재 수정모드면
  if (G_GRDMASTERT1.view.getEditorLock().isActive()) {
    G_GRDMASTERT1.view.getEditorLock().commitCurrentEdit();
  }

  // 현재 선택된 로우 Validation 체크
  if (G_GRDMASTERT1.lastRow != null) {
    if (!grdMaster1OnBeforePost(G_GRDMASTERT1.lastRow)) {
      return;
    }
  }

  var saveMasterDS = [ ];
  var rowCount = G_GRDMASTERT1.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERT1.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_UNPAID_DIV: rowData.UNPAID_DIV,
        P_UNPAID_COMMENT: rowData.UNPAID_COMMENT,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveMasterDS.push(saveData);
    }
  }

  if (saveMasterDS.length > 0) {
    $NC.serviceCall("/LI04010E/save.do", {
      P_DS_MASTER: $NC.toJson(saveMasterDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
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
  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERT1, {
    selectKey: new Array("INBOUND_DATE", "VENDOR_CD", "INBOUND_NO", "LINE_NO"),
  });
  _Inquiry();
  G_GRDMASTERT1.lastKeyVal = lastKeyVal;
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

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERT1, {
    selectKey: new Array("INBOUND_DATE", "VENDOR_CD", "INBOUND_NO", "LINE_NO"),
  });
  _Inquiry();
  G_GRDMASTERT1.lastKeyVal = lastKeyVal;
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
function tabOnActivate(event, ui) {
  var id = ui.newTab.prop("id").substr(3).toUpperCase();

  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  if (id === "TAB1") {
    $("#divViewDiv").show();
    if (G_GRDMASTERT1.data.getLength() > 0) {
      $NC.G_VAR.buttons._save = "1";
      $NC.G_VAR.buttons._cancel = "1";
    }
  } else {
    $("#divViewDiv").hide();
  }
  $NC.setInitTopButtons($NC.G_VAR.buttons);
  _OnResize($(window));
}

function grdMasterT1OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "INBOUND_DATE",
    field: "INBOUND_DATE",
    name: "입고일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_CD",
    field: "VENDOR_CD",
    name: "공급처",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "INBOUND_NO",
    field: "INBOUND_NO",
    name: "입고번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 50,
    cssClass: "align-right"
  });
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
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });

  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "UNPAID_QTY",
    field: "UNPAID_QTY",
    name: "미입고수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "UNPAID_DIV_F",
    field: "UNPAID_DIV_F",
    name: "미입고사유",
    minWidth: 150,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "UNPAID_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "UNPAID_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "UNPAID_COMMENT",
    field: "UNPAID_COMMENT",
    name: "미입고사유내역",
    minWidth: 200,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_CD_F",
    field: "INOUT_CD_F",
    name: "입고구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdMasterT1Initialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 7
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterT1", {
    columns: grdMasterT1OnGetColumns(),
    queryId: "LI04010E.RS_T1_MASTER",
    sortCol: "INBOUND_DATE",
    gridOptions: options
  });

  G_GRDMASTERT1.view.onSelectedRowsChanged.subscribe(grdMasterT1OnAfterScroll);
  G_GRDMASTERT1.view.onBeforeEditCell.subscribe(grdMaster1OnBeforeEditCell);
  G_GRDMASTERT1.view.onCellChange.subscribe(grdMaster1OnCellChange);

}

/**
 * 상품별입고내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterT1OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERT1.lastRow != null) {
    if (row == G_GRDMASTERT1.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterT1", row + 1);
}

/**
 * 공급처별입고내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterT2OnAfterScroll(e, args) {

  var row = args.rows[0];

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterT2", row + 1);
}

function grdMaster1OnBeforeEditCell(e, args) {

  var rowData = G_GRDMASTERT1.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.UNPAID_QTY > "0") {
      return true;
    } else {
      return false;
    }
  }
  return true;
}

/**
 * 그리드의 입력항목 값 변경
 */
function grdMaster1OnCellChange(e, args) {

  var rowData = args.item;

  if (G_GRDMASTERT1.lastRow == null) {
    return;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTERT1.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTERT1.lastRowModified = true;

}

function grdMasterT2OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "INBOUND_DATE",
    field: "INBOUND_DATE",
    name: "입고일자",
    minWidth: 80,
    cssClass: "align-center",
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_CD",
    field: "VENDOR_CD",
    name: "공급처",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "INBOUND_NO",
    field: "INBOUND_NO",
    name: "입고번호",
    minWidth: 70,
    cssClass: "align-center"
  });
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
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "UNPAID_QTY",
    field: "UNPAID_QTY",
    name: "미입고수량",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "UNPAID_DIV_F",
    field: "UNPAID_DIV_F",
    name: "미입고사유",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "UNPAID_COMMENT",
    field: "UNPAID_COMMENT",
    name: "미입고사유내역",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_CD_F",
    field: "INOUT_CD_F",
    name: "입고구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 공급처별 입고내역탭의 그리드 초기값 설정
 */
function grdMasterT2Initialize() {

  var options = {
    frozenColumn: 7,
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterT2", {
    columns: grdMasterT2OnGetColumns(),
    queryId: "LI04010E.RS_T2_MASTER",
    sortCol: "INBOUND_DATE",
    gridOptions: options
  });

  G_GRDMASTERT2.view.onSelectedRowsChanged.subscribe(grdMasterT2OnAfterScroll);
}

/**
 * 상품별입고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT1(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERT1, ajaxData);
  if (G_GRDMASTERT1.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTERT1.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTERT1, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERT1, {
        selectKey: new Array("INBOUND_DATE", "VENDOR_CD", "INBOUND_NO", "LINE_NO"),
        selectVal: G_GRDMASTERT1.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMasterT1", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 공급처별입고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT2(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERT2, ajaxData);

  if (G_GRDMASTERT2.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTERT2, 0);
  } else {
    $NC.setGridDisplayRows("#grdMasterT2", 0, 0);
  }

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
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition(grdMaster2_refresh) {

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._excel = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);

  // 상품별 입고내역 화면
  $NC.clearGridData(G_GRDMASTERT1);

  // 미입고사유등록 탭의 검색구분 변경 되어도 기간별 미입고 내역 탭의 그리드는 클리어 하지 않는다.
  if (grdMaster2_refresh) {
    // 공급처별 입고내역 화면
    G_GRDMASTERT1.lastRow = null;
    $NC.clearGridData(G_GRDMASTERT2);
  }

}

/**
 * 검색조건의 사업구분 검색 팝업 클릭
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
 * 사업구분 검색 결과
 * 
 * @param seletedRowData
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 위탁사 검색 이미지 클릭
 */
function showOwnBrandPopup() {
  $NP.showOwnBrandPopup({
    P_CUST_CD: $NC.G_USERINFO.CUST_CD,
    P_BU_CD: $NC.getValue("#edtQBu_Cd"),
    P_OWN_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd")
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
  });
}

/**
 * 위탁사 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQOwn_Brand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQOwn_Brand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQOwn_Brand_Cd");
    $NC.setValue("#edtQOwn_Brand_Nm");
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 상품그룹 대분류 검색 이미지 클릭
 */
function showItemGroupDepartPopup() {
  var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd");
  if ($NC.isNull(BRAND_CD)) {
    alert("위탁사 코드를 먼저 선택하시기 바랍니다.");
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
    return;
  }

  $NP.showItemGroupDepartPopup({
    P_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd")
  }, onItemGroupDepartPopup, function() {
    $NC.setFocus("#edtQDeptart_Cd", true);
  });
}

/**
 * 상품그룹 대분류 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onItemGroupDepartPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQDepart_Cd", resultInfo.DEPART_CD);
    $NC.setValue("#edtQDepart_Nm", resultInfo.DEPART_NM);
  } else {
    $NC.setValue("#edtQDepart_Cd");
    $NC.setValue("#edtQDepart_Nm");
    $NC.setFocus("#edtQDepart_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 상품그룹 중분류 검색 이미지 클릭
 */
function showItemGroupLinePopup() {
  var DEPART_CD = $NC.getValue("#edtQDepart_Cd");
  if ($NC.isNull(DEPART_CD)) {
    alert("대분류 코드를 먼저 선택하시기 바랍니다.");
    $NC.setFocus("#edtQDepart_Cd", true);
    return;
  }

  $NP.showItemGroupLinePopup({
    P_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd"),
    P_DEPART_CD: $NC.getValue("#edtQDepart_Cd")
  }, onItemGroupLinePopup, function() {
    $NC.setFocus("#edtQLine_Cd", true);
  });
}

/**
 * 상품그룹 중분류 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onItemGroupLinePopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQLine_Cd", resultInfo.LINE_CD);
    $NC.setValue("#edtQLine_Nm", resultInfo.LINE_NM);
  } else {
    $NC.setValue("#edtQLine_Cd");
    $NC.setValue("#edtQLine_Nm");
    $NC.setFocus("#edtQLine_Cd", true);
  }
  onChangingCondition();
}

/**
 * 검색조건의 상품그룹 소분류 검색 이미지 클릭
 */
function showItemGroupClassPopup() {
  var LINE_CD = $NC.getValue("#edtQLine_Cd");
  if ($NC.isNull(LINE_CD)) {
    alert("중분류 코드를 먼저 선택하시기 바랍니다.");
    $NC.setFocus("#edtQLine_Cd", true);
    return;
  }

  $NP.showItemGroupClassPopup({
    P_BRAND_CD: $NC.getValue("#edtQOwn_Brand_Cd"),
    P_DEPART_CD: $NC.getValue("#edtQDepart_Cd"),
    P_LINE_CD: $NC.getValue("#edtQLine_Cd")
  }, onItemGroupClassPopup, function() {
    $NC.setFocus("#edtQClass_Cd", true);
  });
}

/**
 * 상품그룹 소분류 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onItemGroupClassPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQClass_Cd", resultInfo.CLASS_CD);
    $NC.setValue("#edtQClass_Nm", resultInfo.CLASS_NM);
  } else {
    $NC.setValue("#edtQClass_Cd");
    $NC.setValue("#edtQClass_Nm");
    $NC.setFocus("#edtQClass_Cd", true);
  }
  onChangingCondition();
}

/**
 * 미입고사유등록 그리드의 입력값 체크
 */
function grdMaster1OnBeforePost(row) {

  if (!G_GRDMASTERT1.lastRowModified) {
    return true;
  }

  var rowData = G_GRDMASTERT1.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.UNPAID_DIV)) {
      alert("미입고사유를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTERT1, {
        selectRow: row,
        activeCell: G_GRDMASTERT1.view.getColumnIndex("UNPAID_DIV_F"),
        editMode: true
      });
      return false;
    }
  }
  return true;
}
