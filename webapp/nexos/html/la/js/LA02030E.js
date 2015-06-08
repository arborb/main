/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();
  // 상단그리드 초기화
  grdMasterInitialize();
  // 하단그리드 초기화
  grdDetailInitialize();

  
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
    addAll: true
  });

  // 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQVendor_Cd").click(showVendorPopup);

  $NC.setInitDatePicker("#dtpQAppoint_Date1", $NC.G_USERINFO.LOGIN_DATE, "F");
  $NC.setInitDatePicker("#dtpQAppoint_Date2");

  setUserProgramPermission();

}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {
  // 미처리/오류 내역 탭 화면에 splitter 설정
  $NC.setInitSplitter("#divMasterView", "h", 300);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, $("#grdMaster").parent().height() - $NC.G_LAYOUT.header);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, $("#grdDetail").parent().height() - $NC.G_LAYOUT.header);

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

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  G_GRDMASTER.lastModified = true;
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();

  // 확정
  if (permission.canConfirm) {
    $("#btnProcessNxt").click(onProcessNxt);

  }
  $NC.setEnable("#btnProcessNxt", permission.canConfirm);

  // 취소
  if (permission.canConfirmCancel) {
    $("#btnProcessPre").click(onProcessPre);
  }
  $NC.setEnable("#btnProcessPre", permission.canConfirmCancel);
}

/**
 * Input, Select Change Event 처리
 * 
 * @param e
 *          이벤트 핸들러
 * @param view
 *          대상 Object
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();

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
  case "APPOINT_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "APPOINT_DATE2":
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

  // 화면클리어
  onChangingCondition();
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  // 초기화
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
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var APPOINT_DATE1 = $NC.getValue("#dtpQAppoint_Date1");
  if ($NC.isNull(APPOINT_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQAppoint_Date1");
    return;
  }

  var APPOINT_DATE2 = $NC.getValue("#dtpQAppoint_Date2");
  if ($NC.isNull(APPOINT_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQAppoint_Date2");
    return;
  }

  if (APPOINT_DATE1 > APPOINT_DATE2) {
    alert("출고예정일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQAppoint_Date1");
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_APPOINT_DATE1: APPOINT_DATE1,
    P_APPOINT_DATE2: APPOINT_DATE2,
    P_VENDOR_CD: VENDOR_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LA02030E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

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
    id: "APPOINT_STATE_NM",
    field: "APPOINT_STATE_NM",
    name: "진행상태",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "APPOINT_DATE",
    field: "APPOINT_DATE",
    name: "예약일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "APPOINT_NO",
    field: "APPOINT_NO",
    name: "예약번호",
    minWidth: 80,
    cssClass: "align-center"
  });

  $NC.setGridColumn(columns, {
    id: "VENDOR_CD",
    field: "VENDOR_CD",
    name: "공급처",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "CENTER_CD",
    field: "CENTER_CD",
    name: "발주센터",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CENTER_NM",
    field: "CENTER_NM",
    name: "발주센터명",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "납품예정일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_TIME_DIV_NM",
    field: "DELIVERY_TIME_DIV_NM",
    name: "납품예정시간",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_DATE",
    field: "REQUEST_DATE",
    name: "발주일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_NO",
    field: "REQUEST_NO",
    name: "발주번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_USER_ID",
    field: "CONFIRM_USER_ID",
    name: "승인자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_DATETIME",
    field: "CONFIRM_DATETIME",
    name: "승인일시",
    minWidth: 140
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
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고1",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상단그리드 초기화
 */
function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 4,
    specialRow: {
      compareKey: "APPOINT_STATE",
      compareVal: "30",
      compareOperator: "==",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LA02030E.RS_MASTER",
    sortCol: "CENTER_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

/**
 * 상단그리드 행 클릭시 이벤트 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL);
  onGetDetail({
    data: null
  });

  var rowData = G_GRDMASTER.data.getItem(row);
  G_GRDDETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_APPOINT_DATE: rowData.APPOINT_DATE,
    P_APPOINT_NO: rowData.APPOINT_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LA02030E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);

}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
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

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDMASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTER.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
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

        if (rowData.CRUD === "R") {
          rowData.CRUD = "U";
        }

        G_GRDMASTER.data.updateItem(rowData.id, rowData);
      }
      // e.stopPropagation();
      // e.stopImmediatePropagation();
    }
    return;
  }
}

function grdDetailOnGetColumns() {

  var columns = [ ];
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
    minWidth: 100
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
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_UNIT_DIV_F",
    field: "REQUEST_UNIT_DIV_F",
    name: "발주단위",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_UNIT_QTY",
    field: "REQUEST_UNIT_QTY",
    name: "최소발주단위수량",
    minWidth: 100,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REQUEST_QTY",
    field: "REQUEST_QTY",
    name: "발주수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "APPOINT_QTY",
    field: "APPOINT_QTY",
    name: "예약수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BUY_AMT",
    field: "BUY_AMT",
    name: "매입금액",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 90
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 하단그리드 초기화
 */
function grdDetailInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "LA02030E.RS_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);

}

/**
 * 하단그리드 행 클릭시 이벤트 처리
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
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["CENTER_CD", "BU_CD", "APPOINT_DATE", "APPOINT_NO"],
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

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 상단그리드 행 클릭후 하단 그리드에 데이터 표시처리
 */
function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "LINE_NO",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
  G_GRDDETAIL.view.getCanvasNode().focus();
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

  onChangingCondition();
}

/**
 * 검색조건의 공급처 검색 팝업 클릭
 */
function showVendorPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd");

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

/**
 * 공급처 검색 결과
 * 
 * @param seletedRowData
 */
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

function onProcessPre() {

  var rowCount = G_GRDMASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("납품예악승인 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 승인 상태인 전표만 대상
      if (rowData.APPOINT_STATE === "30") {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_APPOINT_DATE: rowData.APPOINT_DATE,
          P_APPOINT_NO: rowData.APPOINT_NO
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("납품예악승인 취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 납품예약 승인 취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LA02030E/callApprovalCancel.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError, 2);
}

function onProcessNxt() {

  var rowCount = G_GRDMASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("납품예약 승인 처리하시겠습니까?");
  if (!result) {
    return;
  }

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 예약 상태인 전표만 대상
      if (rowData.APPOINT_STATE === "20") {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_APPOINT_DATE: rowData.APPOINT_DATE,
          P_APPOINT_NO: rowData.APPOINT_NO,
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("입고예약 승인 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 납품예약 승인 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LA02030E/callApprovalConfirm.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError, 2);
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {
  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: ["CENTER_CD", "BU_CD", "APPOINT_DATE", "APPOINT_NO"],
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 저장시 에러 발생 했을 경우 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
  _Inquiry();
}