/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  //$NC.setGlobalVar({
  //  CUST_CD: ""
  //});
  
  
  // 탭 초기화
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 그리드 초기화
  grdT1MasterInitialize();
  grdT1DetailInitialize();
  grdT2MasterInitialize();

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showOwnBranPopup);

  $NC.setInitDatePicker("#dtpQEtc_Date1");
  $NC.setInitDatePicker("#dtpQEtc_Date2");

  // 기타입출고 확정/취소 버튼 권한 체크 및 클릭 이벤트 연결
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
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {
  // 미처리/오류 내역 탭 화면에 splitter 설정
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
  // 기타입출고등록 탭
  if ($("#divMasterView").tabs("option", "active") === 0) {
    clientHeight = parent.height() - $NC.G_OFFSET.subViewHeightOffset;

    // Splitter 컨테이너 크기 조정
    var container = $("#divT1TabSheetView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", clientWidth, $("#grdT1Master").parent().height() - $NC.G_LAYOUT.header);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Detail", clientWidth, $("#grdT1Detail").parent().height() - $NC.G_LAYOUT.header);

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
  case "ETC_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "ETC_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
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
  var ETC_DATE1 = $NC.getValue("#dtpQEtc_Date1");
  if ($NC.isNull(ETC_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQEtc_Date1");
    return;
  }
  var ETC_DATE2 = $NC.getValue("#dtpQEtc_Date2");
  if ($NC.isNull(ETC_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQEtc_Date2");
    return;
  }
  if (ETC_DATE1 > ETC_DATE2) {
    alert("입출고일자 검색 범위 오류입니다.");
    $NC.setFocus("#dtpQEtc_Date1");
    return;
  }

  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  var ITEM_NM = $NC.getValue("#edtQItem_Nm");

  // 기타입출고등록 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {

    // 그리드 클리어
    $NC.setInitGridVar(G_GRDT1MASTER);
    $NC.setInitGridVar(G_GRDT1DETAIL);

    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_ETC_DATE1: ETC_DATE1,
      P_ETC_DATE2: ETC_DATE2,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LC02010E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetMasterT1);

  } else {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);

    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_ETC_DATE1: ETC_DATE1,
      P_ETC_DATE2: ETC_DATE2,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_NM: ITEM_NM,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LC02010E/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetMasterT2);

  }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {
  // 기타입출고등록 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CENTER_CD_F = $("#cboQCenter_Cd option:selected").text();
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");
    var ETC_DATE = $NC.getValue("#dtpQEtc_Date2");
    $NC.G_MAIN.showProgramSubPopup({
      PROGRAM_ID: "LC02011P",
      PROGRAM_NM: "상태변환 등록",
      url: "lc/LC02011P.html",
      width: 1024,
      height: 600,
      userData: {
        P_PROCESS_CD: "N",
        P_CENTER_CD: CENTER_CD,
        P_CENTER_CD_F: CENTER_CD_F,
        P_BU_CD: BU_CD,
        P_BU_NM: BU_NM,
        P_ETC_DATE: ETC_DATE,
        P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
        P_MASTER_DS: {},
        P_SUB_DS: [ ]
      },
      onOk: function() {
        onSave();
      }
    });
  }
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
  // 기타입출고등록 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {

    if (G_GRDT1MASTER.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }
    if (G_GRDT1MASTER.lastRow == null) {
      alert("삭제할 데이터를 선택하십시오.");
      return;
    }

    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

    if (rowData.CONFIRM_YN == "Y") {
      alert("취소처리 후 삭제 하십시오.");
      return;
    }

    var result = confirm("삭제 하시겠습니까?");
    if (result) {
      $NC.serviceCall("/LC02010E/callLCProcessing.do", {
        P_PROCESS_DIV: "DEL",
        P_QUERY_PARAMS: $NC.getParams({
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_ETC_DATE: rowData.ETC_DATE,
          P_ETC_NO: rowData.ETC_NO,
          P_LINK_CENTER_CD: rowData.LINK_CENTER_CD,
          P_LINK_BU_CD: rowData.LINK_BU_CD,
          P_LINK_ETC_DATE: rowData.LINK_ETC_DATE,
          P_LINK_ETC_NO: rowData.LINK_ETC_NO,
          P_USER_ID: $NC.G_USERINFO.USER_ID
        })
      }, onExecSP, onSaveError);

    }
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

  var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

  if (printIndex === 2) {

    var printOptions = {
      reportDoc: "lc/PAPER_CHANGE01",
      queryId: "WR.RS_PAPER_CHANGE01",
      queryParams: {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_ETC_DATE: rowData.ETC_DATE,
        P_ETC_NO: rowData.ETC_NO,
        P_LINK_CENTER_CD: rowData.LINK_CENTER_CD,
        P_LINK_BU_CD: rowData.LINK_BU_CD,
        P_LINK_ETC_DATE: rowData.LINK_ETC_DATE,
        P_LINK_ETC_NO: rowData.LINK_ETC_NO
      }
    };

    $NC.G_MAIN.showPrintPreview(printOptions);
  } else if (printIndex === 0) {

    var printOptions = {
      reportDoc: "common/LABEL_LOCATION_ID",
      queryId: "WR.RS_LABEL_LOCATION_ID02",
      queryParams: {
        P_CENTER_CD: rowData.LINK_CENTER_CD,
        P_BU_CD: rowData.LINK_BU_CD,
        P_INBOUND_DATE: rowData.LINK_ETC_DATE,
        P_INBOUND_NO: rowData.LINK_ETC_NO,
        P_PROCESS_GRP: "LC"
      }
    };

    $NC.G_MAIN.showPrintPreview(printOptions);
  } else if (printIndex === 1) {

    var printOptions = {
      reportDoc: "common/LABEL_PALLET",
      queryId: "WR.RS_LABEL_PALLET02",
      queryParams: {
        P_CENTER_CD: rowData.LINK_CENTER_CD,
        P_BU_CD: rowData.LINK_BU_CD,
        P_INBOUND_DATE: rowData.LINK_ETC_DATE,
        P_INBOUND_NO: rowData.LINK_ETC_NO,
        P_LINE_NO: "",
        P_PROCESS_GRP: "LC"
      }
    };

    $NC.G_MAIN.showPrintPreview(printOptions);

  }
}

/**
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  var lastRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
  _Inquiry();
  if (lastRowData) G_GRDT1MASTER.lastKeyVal = new Array(lastRowData.ETC_DATE, lastRowData.ETC_NO);
}

function onExecSP(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  var lastRowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
  _Inquiry();
  if (lastRowData) G_GRDT1MASTER.lastKeyVal = new Array(lastRowData.ETC_DATE, lastRowData.ETC_NO);

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
  if (id === "TAB1") {

    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter("#divT1TabSheetView")) {
      // 스필리터를 통한 _OnResize 호출
      $("#divT1TabSheetView").trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter("#divT1TabSheetView", "h");
    }
  } else {

    _OnResize($(window));
  }
  // 화면상단의 공통 메뉴 버튼 이미지 표시 : true인 경우는 조회 버튼만 활성화 한다.
  setTopButton();
}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ETC_DATE",
    field: "ETC_DATE",
    name: "상태변환일자",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ETC_NO",
    field: "ETC_NO",
    name: "상태변환번호",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "상태변환구분",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "LINK_ETC_NO",
    field: "LINK_ETC_NO",
    name: "상대입출고번호",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 150
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
    minWidth: 130,
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
      compareOperator: "==",
      cssClass: "specialrow1"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LC02010E.RS_T1_MASTER",
    sortCol: "ETC_DATE",
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

  if (G_GRDT1DETAIL.data.getLength() == 0) {
    return;
  }

  var masterRowData = G_GRDT1MASTER.data.getItem(args.row);
  // 확정처리된 전표는 수정불가함.
  if (masterRowData.CONFIRM_YN == "Y") {
    alert("확정 된 전표입니다.");
    return;
  }

  // 조회후 상태가 바꾸었는지 한번더 상태 체크
  $NC.serviceCall("/LC02010E/getConfirmYn.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: masterRowData.CENTER_CD,
      P_BU_CD: masterRowData.BU_CD,
      P_ETC_DATE: masterRowData.ETC_DATE,
      P_ETC_NO: masterRowData.ETC_NO,
      P_TABLE_DIV: "A" // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
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

    if (masterRowData) {
      var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
      var CENTER_CD_F = $("#cboQCenter_Cd option:selected").text();
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      var BU_NM = $NC.getValue("#edtQBu_Nm");

      // 데이터 조회 - 하단그리드
      $NC.serviceCall("/LC02010E/getDataSet.do", {
        P_QUERY_ID: "LC02010E.RS_POP_SUB2",
        P_QUERY_PARAMS: $NC.getParams({
          P_CENTER_CD: masterRowData.CENTER_CD,
          P_BU_CD: masterRowData.BU_CD,
          P_ETC_DATE: masterRowData.ETC_DATE,
          P_ETC_NO: masterRowData.ETC_NO
        })
      }, function(ajaxData) {
        var subDS = $NC.toArray(ajaxData);
        $NC.G_MAIN.showProgramSubPopup({
          PROGRAM_ID: "LC02011P",
          PROGRAM_NM: "상태변환 등록",
          url: "lc/LC02011P.html",
          width: 1024,
          height: 600,
          userData: {
            P_PROCESS_CD: "U",
            P_CENTER_CD: CENTER_CD,
            P_CENTER_CD_F: CENTER_CD_F,
            P_BU_CD: BU_CD,
            P_BU_NM: BU_NM,
            P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
            P_MASTER_DS: masterRowData,
            P_DETAIL_DS: G_GRDT1DETAIL.data.getItems(),
            P_SUB_DS: subDS
          },
          onOk: function() {
            G_GRDT1MASTER.lastKeyVal = new Array(masterRowData.ETC_DATE, masterRowData.ETC_NO);
            onSave();
          }
        });
      });
    }
  });
}

/**
 * 상품별입고내역 탭의 그리드 행 클릭시 처리
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

  var rowData = G_GRDT1MASTER.data.getItem(row);
  G_GRDT1DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_ETC_DATE: rowData.ETC_DATE,
    P_ETC_NO: rowData.ETC_NO,
    P_LINK_CENTER_CD: $NC.isNull(rowData.LINK_CENTER_CD) ? "" : rowData.LINK_CENTER_CD,
    P_LINK_BU_CD: $NC.isNull(rowData.LINK_BU_CD) ? "" : rowData.LINK_BU_CD,
    P_LINK_ETC_DATE: $NC.isNull(rowData.LINK_ETC_DATE) ? "" : rowData.LINK_ETC_DATE,
    P_LINK_ETC_NO: $NC.isNull(rowData.LINK_ETC_NO) ? "" : rowData.LINK_ETC_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LC02010E/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetDetailT1);

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
  G_GRDT1DETAIL.view.getCanvasNode().focus();
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
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "기준상태",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINK_ITEM_STATE_F",
    field: "LINK_ITEM_STATE_F",
    name: "변환상태",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_BOX",
    field: "CONFIRM_BOX",
    name: "확정BOX",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_EA",
    field: "CONFIRM_EA",
    name: "확정EA",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_WEIGHT",
    field: "CONFIRM_WEIGHT",
    name: "확정중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ETC_DIV_F",
    field: "ETC_DIV_F",
    name: "사유구분",
    minWidth: 130
  });
  $NC.setGridColumn(columns, {
    id: "ETC_COMMENT",
    field: "ETC_COMMENT",
    name: "사유내역",
    minWidth: 150
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
    queryId: "LC02010E.RS_T1_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
}

/**
 * 기타입출고등록 탭의 하단그리드 행 클릭시 처리
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

function grdT2MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ETC_DATE",
    field: "ETC_DATE",
    name: "상태변환일자",
    minWidth: 100,
    cssClass: "align-center",
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "ETC_NO",
    field: "ETC_NO",
    name: "상태변환번호",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "상태변환구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "LINK_ETC_NO",
    field: "LINK_ETC_NO",
    name: "상대입출고번호",
    minWidth: 100,
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
    minWidth: 80
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
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "기준상태",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINK_ITEM_STATE_F",
    field: "LINK_ITEM_STATE_F",
    name: "변환상태",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_BOX",
    field: "CONFIRM_BOX",
    name: "확정BOX",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_EA",
    field: "CONFIRM_EA",
    name: "확정EA",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_WEIGHT",
    field: "CONFIRM_WEIGHT",
    name: "확정중량",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ETC_DIV_F",
    field: "ETC_DIV_F",
    name: "사유구분",
    minWidth: 130
  });
  $NC.setGridColumn(columns, {
    id: "ETC_COMMENT",
    field: "ETC_COMMENT",
    name: "사유내역",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 기타입출고내역탭의 그리드 초기값 설정
 */
function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 8,
    summaryRow: {
      visible: true
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LC02010E.RS_T2_MASTER",
    sortCol: "ETC_DATE",
    gridOptions: options
  });

  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

/**
 * 기타입출고등록 탭 조회 버튼 클릭후 처리
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
        selectKey: new Array("ETC_DATE", "ETC_NO"),
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
 * 기타입출고내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT2(ajaxData) {

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

  // 기타입출고등록 화면
  $NC.clearGridData(G_GRDT1MASTER, ["queryParams"]);
  // 기타입출고등록 화면
  $NC.clearGridData(G_GRDT1DETAIL);
  // 기타입출고내역 화면
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
    $NC.setFocus("#dtpQEtc_Date1", true);
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
 * 취소처리
 */
function onProcessPre() {

  var rowCount = G_GRDT1MASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

  if (rowData.CONFIRM_YN == "N") {
    alert("확정된 전표만 취소 할 수 있습니다.");
    return;
  }

  var result = confirm("취소 처리 하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDT1MASTER.lastRow == null) {
    alert("기타입출고등록 취소 처리할 데이터를 선택하십시오.");
    return;
  }

  $NC.serviceCall("/LC02010E/callLCProcessing.do", {
    P_PROCESS_DIV: "BW",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_ETC_DATE: rowData.ETC_DATE,
      P_ETC_NO: rowData.ETC_NO,
      P_LINK_CENTER_CD: rowData.LINK_CENTER_CD,
      P_LINK_BU_CD: rowData.LINK_BU_CD,
      P_LINK_ETC_DATE: rowData.LINK_ETC_DATE,
      P_LINK_ETC_NO: rowData.LINK_ETC_NO,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onExecSP, onSaveError);
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

  var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

  if (rowData.CONFIRM_YN == "Y") {
    alert("확정 된 전표입니다.");
    return;
  }

  var result = confirm("확정 처리 하시겠습니까?");
  if (!result) {
    return;
  }

  $NC.serviceCall("/LC02010E/callLCProcessing.do", {
    P_PROCESS_DIV: "FW",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_ETC_DATE: rowData.ETC_DATE,
      P_ETC_NO: rowData.ETC_NO,
      P_LINK_CENTER_CD: rowData.LINK_CENTER_CD,
      P_LINK_BU_CD: rowData.LINK_BU_CD,
      P_LINK_ETC_DATE: rowData.LINK_ETC_DATE,
      P_LINK_ETC_NO: rowData.LINK_ETC_NO,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onExecSP, onSaveError);
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
  // 기타입출고등록 탭
  if ($("#divMasterView").tabs("option", "active") === 0) {
    if (!$NC.isNull(G_GRDT1MASTER.queryParams)) {
      $NC.G_VAR.buttons._new = "1";
      $NC.G_VAR.buttons._delete = "1";
      if (G_GRDT1MASTER.data.getLength() > 0) {
        $NC.G_VAR.buttons._print = "1";
        $NC.G_VAR.printOptions = [{
          PRINT_INDEX: 2,
          PRINT_COMMENT: "상태변환 작업지시서"
        }];
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 1,
          PRINT_COMMENT: "입고라벨"
        });
        $NC.G_VAR.printOptions.push({
          PRINT_INDEX: 0,
          PRINT_COMMENT: "로케이션ID라벨"
        });
      }
    }
  }
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}
