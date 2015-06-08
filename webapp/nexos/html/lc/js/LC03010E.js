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
  
  
  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();

  // 그리드 초기화
  grdT1MasterInitialize();
  grdT1DetailInitialize();
  grdT2MasterInitialize();

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showOwnBranPopup);

  $NC.setInitDatePicker("#dtpQMove_Date1");
  $NC.setInitDatePicker("#dtpQMove_Date2");
  $NC.setInitDatePicker("#dtpOutbound_Date");
  
  // 진행상태 콤보박스 세팅
  var cboObj = $("#cboQConfirm_Check").empty();
  var optionStr = "";
  optionStr += "<option value='%'>% - 전체</option>";
  optionStr += "<option value='Y'>Y - 확정</option>";
  optionStr += "<option value='N'>N - 미확정</option>";
  cboObj.append(optionStr);
  $NC.setValue("#cboQConfirm_Check", 0);

  // 로케이션이동 확정/취소 버튼 권한 체크 및 클릭 이벤트 연결
  setUserProgramPermission();

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

  // 조회조건 - 입출고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "MOVE_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "1",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQMove_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });

}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {
  $NC.setInitSplitter("#divT1TabSheetView", "h", 300);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $NC.G_LAYOUT.border1;
  $NC.G_OFFSET.gridHeightOffset = $NC.G_LAYOUT.tabHeader + $NC.G_LAYOUT.header + $NC.G_OFFSET.nonClientHeight
      + ($NC.G_LAYOUT.border1 * 3);
  $NC.G_OFFSET.subViewHeightOffset = $NC.G_LAYOUT.tabHeader + $NC.G_OFFSET.nonClientHeight + ($NC.G_LAYOUT.border1 * 3);
  $NC.G_OFFSET.nonSubViewHeight = $("#divProcessingInfo").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border2;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientWidth -= $NC.G_LAYOUT.border1;
  // 재고이동등록 탭
  if ($("#divMasterView").tabs("option", "active") === 0) {
    clientHeight = parent.height() - $NC.G_OFFSET.subViewHeightOffset;

    // Splitter 컨테이너 크기 조정
    var container = $("#divT1TabSheetView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", clientWidth, $("#grdT1Master").parent().height() - $NC.G_LAYOUT.header
        - $NC.G_OFFSET.nonSubViewHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Detail", clientWidth, $("#grdT1Detail").parent().height() - $NC.G_LAYOUT.header);
    $("#tdQDsp_Confirm_Check").show();

  } else {

    clientHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset;

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Master", clientWidth, clientHeight);
  }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  // 사업부 Key 입력
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
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBranPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup, onOwnBrandPopup);
    }
    return;
  case "MOVE_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "MOVE_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
  }

  onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

  var id = view.prop("id").substr(3).toUpperCase();

  switch (id) {
  case "OUTBOUND_DATE":
    $NC.setValueDatePicker(view, val, "출고일자를 정확히 입력하십시오.");
    break;
  }
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
  var MOVE_DATE1 = $NC.getValue("#dtpQMove_Date1");
  if ($NC.isNull(MOVE_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQMove_Date1");
    return;
  }
  var MOVE_DATE2 = $NC.getValue("#dtpQMove_Date2");
  if ($NC.isNull(MOVE_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQMove_Date2");
    return;
  }
  if (MOVE_DATE1 > MOVE_DATE2) {
    alert("이동일자 검색 범위 오류입니다.");
    $NC.setFocus("#dtpQMove_Date1");
    return;
  }

  var MOVE_DIV = $NC.getValue("#cboQMove_Div");
  if ($NC.isNull(MOVE_DIV)) {
    alert("이동구분을 선택하십시오.");
    $NC.setFocus("#cboQMove_Div");
    return;
  }

  var BRAND_CD = $NC.getValue("#edtQBrand_Cd") + "%";
  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  var ITEM_NM = $NC.getValue("#edtQItem_Nm");
  var CONFIRM_CHK = $NC.getValue("#cboQConfirm_Check");

  // 로케이션이동등록 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {

    $NC.setInitGridVar(G_GRDT1MASTER);
    $NC.setInitGridVar(G_GRDT1DETAIL);

    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_MOVE_DATE1: MOVE_DATE1,
      P_MOVE_DATE2: MOVE_DATE2,
      P_MOVE_DIV: MOVE_DIV,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_CONFIRM_CHK: CONFIRM_CHK,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });
    $NC.serviceCall("/LC03010E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

  } else {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);

    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_MOVE_DATE1: MOVE_DATE1,
      P_MOVE_DATE2: MOVE_DATE2,
      P_MOVE_DIV: MOVE_DIV,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LC03010E/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);
  }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {
  // 로케이션이동등록 화면
  if ($("#divMasterView").tabs("option", "active") != 0) {
    return;
  }

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LC03011P",
    PROGRAM_NM: "재고이동등록/수정",
    url: "lc/LC03011P.html",
    width: 1024,
    height: 610,
    userData: {
      P_PROCESS_CD: "N",
      P_CENTER_CD: CENTER_CD,
      P_CENTER_CD_F: CENTER_CD_F,
      P_BU_CD: BU_CD,
      P_BU_NM: BU_NM,
      P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
      P_MASTER_DS: {},
      P_DETAIL_DS: [ ]
    },
    onOk: function() {
      _Inquiry();
    }
  });
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
  // 재고이동등록 화면
  if ($("#divMasterView").tabs("option", "active") != 0) {
    return;
  }

  if (G_GRDT1MASTER.data.getLength() == 0 && G_GRDT1MASTER.lastRow == null) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

  if (rowData.CONFIRM_YN == "Y") {
    alert("이미 확정한 데이터는 삭제할수 없습니다.");
    return;
  }

  var result = confirm("삭제 하시겠습니까?");
  if (result) {
    $NC.serviceCall("/LC03010E/callLcBwMoveEntry.do", {
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_MOVE_DATE: rowData.MOVE_DATE,
        P_MOVE_NO: rowData.MOVE_NO,
        P_LINE_NO: null,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      })
    }, onDelete);

  }
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

  if (printIndex === 2) {
    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

    var printOptions = {
      reportDoc: "lc/PAPER_MOVE01",
      queryId: "WR.RS_PAPER_MOVE01",
      queryParams: {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_MOVE_DATE: rowData.MOVE_DATE,
        P_MOVE_NO: rowData.MOVE_NO
      }
    };

    $NC.G_MAIN.showPrintPreview(printOptions);
  }
}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "MOVE_DATE",
    field: "MOVE_DATE",
    name: "이동일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "MOVE_NO",
    field: "MOVE_NO",
    name: "이동번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "MOVE_DIV_F",
    field: "MOVE_DIV_F",
    name: "이동구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_USER_ID",
    field: "ENTRY_USER_ID",
    name: "최종등록자",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_DATETIME",
    field: "ENTRY_DATETIME",
    name: "최종등록일시",
    minWidth: 120,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_YN",
    field: "CONFIRM_YN",
    name: "확정여부",
    minWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_USER_ID",
    field: "CONFIRM_USER_ID",
    name: "확정자",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_DATETIME",
    field: "CONFIRM_DATETIME",
    name: "확정일시",
    minWidth: 120,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 2,
    specialRow: {
      compareKey: "CONFIRM_YN",
      compareVal: "Y",
      compareOperator: "===",
      cssClass: "specialrow1"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LC03010E.RS_T1_MASTER",
    sortCol: "MOVE_DATE",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
  G_GRDT1MASTER.view.onDblClick.subscribe(grdT1MasterOnDblClick);
}

/**
 * 상단그리드 더블 클릭 : 팝업 표시
 */
function grdT1MasterOnDblClick(e, args) {

  var rowData = G_GRDT1MASTER.data.getItem(args.row);
  if ($NC.isNull(rowData)) {
    return;
  }

  if (rowData.MOVE_DIV == '3') {
    alert("긴급보충이동 데이터에 대하여 수정할 수 없습니다.");
    return;
  }

  if (rowData.CONFIRM_YN == "Y") {
    alert("이미 확정처리된 전표입니다.");
    return;
  }
  // 조회후 상태가 바뀌었는지 한번더 상태 체크
  $NC.serviceCall("/LC03020E/getConfirmYn.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_ETC_DATE: rowData.MOVE_DATE,
      P_ETC_NO: rowData.MOVE_NO,
      P_TABLE_DIV: "B" // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
    })
  }, function(ajaxData) {

    var resultData = $NC.toArray(ajaxData);
    if (!$NC.isNull(resultData)) {
      if (resultData.O_MSG === "OK") {
        if (resultData.O_CONFIRM_YN !== "N") {
          alert("이미 확정처리된 데이터입니다.\n다시 조회 후 데이터를 확인하십시오.");
          return;
        }
      } else {
        alert(resultData.O_MSG);
        return;
      }
    } else {
      alert("확정여부를 확인하지 못했습니다.\n다시 처리하십시오.");
      return;
    }

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");

    $NC.G_MAIN.showProgramSubPopup({
      PROGRAM_ID: "LC03011P",
      PROGRAM_NM: "재고이동등록/수정",
      url: "lc/LC03011P.html",
      width: 1024,
      height: 610,
      userData: {
        P_PROCESS_CD: "U",
        P_CENTER_CD: CENTER_CD,
        P_CENTER_CD_F: CENTER_CD_F,
        P_BU_CD: BU_CD,
        P_BU_NM: BU_NM,
        P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
        P_MASTER_DS: rowData,
        P_DETAIL_DS: G_GRDT1DETAIL.data.getItems()
      },
      onOk: function() {
        var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
          selectKey: ["MOVE_DATE", "MOVE_NO"]
        });

        _Inquiry();
        G_GRDT1MASTER.lastKeyVal = lastKeyVal;
      }
    });
  });
}

/**
 * 재고이동등록 탭의 그리드 행 클릭시 처리
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

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1DETAIL);
  onGetDetailT1({
    data: null
  });

  // 데이터 조회 - 하단그리드
  var rowData = G_GRDT1MASTER.data.getItem(row);
  G_GRDT1DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_MOVE_DATE: rowData.MOVE_DATE,
    P_MOVE_NO: rowData.MOVE_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LC03010E/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetDetailT1);
}

/**
 * 상단그리드 행 클릭후 하단 그리드에 데이터 표시처리
 */
function onGetDetailT1(ajaxData) {

  $NC.setInitGridData(G_GRDT1DETAIL, ajaxData);
  if (G_GRDT1DETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1DETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1DETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1DETAIL, {
        selectKey: "LINE_NO",
        selectVal: G_GRDT1DETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT1Detail", 0, 0);
  }
}

/**
 * 공급처별입고내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT2MasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDT2MASTER.lastRow != null) {
    if (row == G_GRDT2MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Master", row + 1);
}

function grdT1DetailOnGetColumns() {

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
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 160
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
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "재고로케이션",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MLOCATION_CD",
    field: "MLOCATION_CD",
    name: "이동로케이션",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MSTOCK_QTY",
    field: "MSTOCK_QTY",
    name: "이동수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MSTOCK_BOX",
    field: "MSTOCK_BOX",
    name: "박스수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MSTOCK_EA",
    field: "MSTOCK_EA",
    name: "이동EA",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_YN",
    field: "INSPECT_YN",
    name: "이동여부",
    minWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_USER_ID",
    field: "INSPECT_USER_ID",
    name: "이동자",
    minWidth: 100,
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_DATETIME",
    field: "INSPECT_DATETIME",
    name: "이동일시",
    minWidth: 120,
    cssClass: "align-center",
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Detail", {
    columns: grdT1DetailOnGetColumns(),
    queryId: "LC03010E.RS_T1_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
}

/**
 * 재고이동등록 탭의 하단그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT1DetailOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDT1DETAIL.lastRow != null) {
    if (row == G_GRDT1DETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Detail", row + 1);
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
  if (id === "TAB1") {

    $("#divButtonTop").show();
    $("#tdQDsp_Confirm_Check").show();
    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter("#divT1TabSheetView")) {
      // 스필리터를 통한 _OnResize 호출
      $("#divT1TabSheetView").trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter("#divT1TabSheetView", "h");
    }
  } else {
    $("#divButtonTop").hide();
    $("#tdQDsp_Confirm_Check").hide();
    _OnResize($(window));
  }
  // 화면상단의 공통 메뉴 버튼 이미지 표시 : true인 경우는 조회 버튼만 활성화 한다.
  setTopButton();
}

function grdT2MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "MOVE_DATE",
    field: "MOVE_DATE",
    name: "이동일자",
    minWidth: 90,
    cssClass: "align-center",
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "MOVE_NO",
    field: "MOVE_NO",
    name: "이동번호",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "MOVE_DIV_F",
    field: "MOVE_DIV_F",
    name: "이동구분",
    minWidth: 120
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
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 160
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
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "재고로케이션",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "MLOCATION_CD",
    field: "MLOCATION_CD",
    name: "이동로케이션",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "MSTOCK_QTY",
    field: "MSTOCK_QTY",
    name: "이동수량",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "MSTOCK_BOX",
    field: "MSTOCK_BOX",
    name: "이동BOX",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "MSTOCK_EA",
    field: "MSTOCK_EA",
    name: "이동EA",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MSTOCK_WEIGHT",
    field: "MSTOCK_WEIGHT",
    name: "이동중량",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_USER_ID",
    field: "CONFIRM_USER_ID",
    name: "확정자",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_DATETIME",
    field: "CONFIRM_DATETIME",
    name: "확정일시",
    minWidth: 150,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 재고이동내역탭의 그리드 초기값 설정
 */
function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 7,
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LC03010E.RS_T2_MASTER",
    sortCol: "MOVE_DATE",
    gridOptions: options
  });

  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

/**
 * 재고이동등록 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT1Master(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);
  if (G_GRDT1MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1MASTER, {
        selectKey: new Array("MOVE_DATE", "MOVE_NO"),
        selectVal: G_GRDT1MASTER.lastKeyVal
      });
    }
  } else {
    $NC.setInitGridVar(G_GRDT1DETAIL);
    onGetDetailT1({
      data: null
    });
    $NC.setGridDisplayRows("#grdT1Master", 0, 0);

  }
  setTopButton();
}

/**
 * 재고이동내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetT2Master(ajaxData) {

  $NC.setInitGridData(G_GRDT2MASTER, ajaxData);

  if (G_GRDT2MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT2MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT2Master", 0, 0);
  }

  setTopButton();
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  // 재고이동등록 화면
  $NC.clearGridData(G_GRDT1MASTER, ["queryParams"]);
  // 재고이동등록 화면
  $NC.clearGridData(G_GRDT1DETAIL);
  // 재고이동내역 화면
  $NC.clearGridData(G_GRDT2MASTER);

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

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");

  $NP.showOwnBranPopup({
    P_CUST_CD:  $NC.G_USERINFO.CUST_CD,   
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
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
    $NC.setFocus("#dtpQMove_Date1", true);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}


/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  onChangingCondition();
}

/**
 * 상단 공통 버튼 제어
 * 
 * @param isClear
 */
function setTopButton() {

  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.G_VAR.printOptions = [ ];

  if ($("#divMasterView").tabs("option", "active") == 0) {
    if (!$NC.isNull(G_GRDT1MASTER.queryParams)) {
      $NC.G_VAR.buttons._new = "1";
      $NC.G_VAR.buttons._delete = "1";
      if (G_GRDT1MASTER.data.getLength() > 0) {
        $NC.G_VAR.buttons._print = "1";
        $NC.G_VAR.printOptions = [{
          PRINT_INDEX: 2,
          PRINT_COMMENT: "재고이동 작업지시서"
        }];
      }
    }
  }
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();

  // 저장
  if (permission.canSave) {
    $("#btnEmergencyEnter").click(onEmergencyEnter);
    $("#btnSafetyEnter").click(onSafetyEnter);
  }
  $NC.setEnable("#btnEmergencyEnter", permission.canSave);
  $NC.setEnable("#btnSafetyEnter", permission.canSave);

  // 확정
  if (permission.canConfirm) {
    $("#btnProcessNxt").click(onProcessNxt);
  }
  $NC.setEnable("#btnProcessNxt", permission.canConfirm);
}

/**
 * 확정처리
 */
function onProcessNxt() {

  var rowCount = G_GRDT1MASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  if (G_GRDT1MASTER.lastRow == null) {
    alert("재고이동 처리할 데이터를 선택하십시오.");
    return;
  }
  var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

  if (rowData.CONFIRM_YN == "Y") {
    alert("이미 확정 처리한 데이터입니다.");
    return;
  }

  var result = confirm("확정 처리하시겠습니까?");
  if (!result) {
    return;
  }

  $NC.serviceCall("/LC03010E/callLcMoveConfirm.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_MOVE_DATE: rowData.MOVE_DATE,
      P_MOVE_NO: rowData.MOVE_NO,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onSave, onSaveError);
}

/**
 * 긴급보충
 */
function onEmergencyEnter() {

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

  var MOVE_DATE = $NC.getValue("#dtpOutbound_Date");
  if ($NC.isNull(MOVE_DATE)) {
    alert("출고일자를 입력하십시오.");
    $NC.setFocus("#dtpOutbound_Date");
    return;
  }

  var result = confirm("긴급보충내역을 생성 하시겠습니까?");
  if (!result) {
    return;
  }

  $NC.serviceCall("/LC03010E/callLcFWFillupEmergencyEntry.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_MOVE_DATE: MOVE_DATE,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onSave, onSaveError);
}

/**
 * 피킹존안전재고보충
 */
function onSafetyEnter() {

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

  var MOVE_DATE = $NC.getValue("#dtpOutbound_Date");
  if ($NC.isNull(MOVE_DATE)) {
    alert("출고일자를 입력하십시오.");
    $NC.setFocus("#dtpOutbound_Date");
    return;
  }

  var result = confirm("피킹안전재고보충을 생성 하시겠습니까?");
  if (!result) {
    return;
  }

  $NC.serviceCall("/LC03010E/callLcFWFillupSafetyEntry.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_MOVE_DATE: MOVE_DATE,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onSave, onSaveError);
}

/**
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      alert(resultData.O_MSG);
      return;
    }
  }

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
    selectKey: ["MOVE_DATE", "MOVE_NO"]
  });

  _Inquiry();
  G_GRDT1MASTER.lastKeyVal = lastKeyVal;

}

function onDelete(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      alert(resultData.O_MSG);
      return;
    }
  }

  _Inquiry();
}

/**
 * 저장에 실패 했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}