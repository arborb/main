/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 체크할 정책 값
    policyVal: {
      LC110: "" // 재고실사수량정책
      ,
      LC120: "" // 재고실사 데이터 생성 정책
    }
  });

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
  grdT3MasterInitialize();

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showOwnBranPopup);
  $("#btnERPSend").click(sendEsErpStock);

  $NC.setInitDatePicker("#dtpQInvest_Date1");
  $NC.setInitDatePicker("#dtpQInvest_Date2");

  // 수불발생여부 콤보박스 세팅
  var cboObj = $("#cboQView_Div").empty();
  var optionStr = "";
  optionStr += "<option value='0'>전체</option>";
  optionStr += "<option value='1'>차이분</option>";
  cboObj.append(optionStr);
  $NC.setValue("#cboQView_Div", 1);

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
      setPolicyValInfo();
    }
  });

  // FIXME: 0.3초 이내 service를 2번 호출할수 없기때문에 불가피하게 0.4초 이후에 콤보박스를 호출합니다.
  setTimeout(function(){
    // 조회조건 - 입출고구분 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "GAP_DIV",
        P_CODE_CD: "",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      }),
      arrowPolling: true
    }, {
      selector: "#cboQGap_Div",
      codeField: "CODE_CD",
      nameField: "CODE_NM",
      fullNameField: "CODE_CD_F",
      addAll: true
    });
  }, 500)

  setUserProgramPermission();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {
  $("#divQView_Div").hide();
  $("#divQGap_Div").hide();
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
  // 재고실사등록 탭
  if ($("#divMasterView").tabs("option", "active") === 0) {

    clientHeight = parent.height() - $NC.G_OFFSET.subViewHeightOffset;

    // Splitter 컨테이너 크기 조정
    var container = $("#divT1TabSheetView");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", clientWidth, $("#grdT1Master").parent().height() - $NC.G_LAYOUT.header);

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Detail", clientWidth, $("#grdT1Detail").parent().height() - $NC.G_LAYOUT.header);

  } else if ($("#divMasterView").tabs("option", "active") === 1) {
    clientHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset;

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Master", clientWidth, clientHeight);
  } else {
    clientHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset;

    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT3Master", clientWidth, clientHeight);
  }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  // 사업부 Key 입력
  switch (id) {
  case "CENTER_CD":
    setPolicyValInfo();
    return;
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
  case "INVEST_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "INVEST_DATE2":
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
  var INVEST_DATE1 = $NC.getValue("#dtpQInvest_Date1");
  if ($NC.isNull(INVEST_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQInvest_Date1");
    return;
  }
  var INVEST_DATE2 = $NC.getValue("#dtpQInvest_Date2");
  if ($NC.isNull(INVEST_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQInvest_Date2");
    return;
  }
  if (INVEST_DATE1 > INVEST_DATE2) {
    alert("실사일자 검색 범위 오류입니다.");
    $NC.setFocus("#dtpQInvest_Date1");
    return;
  }

  var VIEW_DIV = $NC.getValue("#cboQView_Div");
  if ($NC.isNull(VIEW_DIV)) {
    alert("차이분여부를 선택하십시오.");
    $NC.setFocus("#cboQView_Div");
    return;
  }

  var GAP_DIV = $NC.getValue("#cboQGap_Div");
  if ($NC.isNull(GAP_DIV)) {
    alert("실사차이사유구분을 선택 입력하십시오.");
    $NC.setFocus("#cboQGap_Div");
    return;
  }
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  // 재고실사등록 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1MASTER);
    $NC.setInitGridVar(G_GRDT1DETAIL);

    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INVEST_DATE1: INVEST_DATE1,
      P_INVEST_DATE2: INVEST_DATE2,
      P_BRAND_CD: BRAND_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });
    $NC.serviceCall("/LC04010E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetMasterT1);

  } else if ($("#divMasterView").tabs("option", "active") === 1) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);

    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_BRAND_CD: BRAND_CD,
      P_INVEST_DATE1: INVEST_DATE1,
      P_INVEST_DATE2: INVEST_DATE2,
      P_GAP_DIV: GAP_DIV,
      P_BRAND_CD: BRAND_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LC04010E/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetMasterT2);

  } else {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT3MASTER);

    G_GRDT3MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_BRAND_CD: BRAND_CD,
      P_INVEST_DATE1: INVEST_DATE1,
      P_INVEST_DATE2: INVEST_DATE2,
      P_VIEW_DIV: VIEW_DIV,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });

    // 데이터 조회
    $NC.serviceCall("/LC04010E/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetMasterT3);

  }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {
  // 재고실사등록 화면
  if ($("#divMasterView").tabs("option", "active") === 0) {

    var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
    var CENTER_CD_F = $NC.getValueCombo("#cboQCenter_Cd", "F");
    var BU_CD = $NC.getValue("#edtQBu_Cd");
    var BU_NM = $NC.getValue("#edtQBu_Nm");

    $NC.G_MAIN.showProgramSubPopup({
      PROGRAM_ID: "LC04011P",
      PROGRAM_NM: "재고실사등록/수정",
      url: "lc/LC04011P.html",
      width: 1024,
      height: 610,
      userData: {
        P_PROCESS_CD: "N",
        P_CENTER_CD: CENTER_CD,
        P_CENTER_CD_F: CENTER_CD_F,
        P_BU_CD: BU_CD,
        P_BU_NM: BU_NM,
        P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
        P_POLICY_LC110: $NC.G_VAR.policyVal.LC110,
        P_POLICY_LC120: $NC.G_VAR.policyVal.LC120,
        P_MASTER_DS: {},
        P_DETAIL_DS: [ ]
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

  if ($("#divMasterView").tabs("option", "active") === 0) {
    if (G_GRDT1DETAIL.data.getLength() == 0) {
      alert("저장할 데이터가 없습니다.");
      return;
    }

    var rowDataMaster = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

    if (rowDataMaster.REFLECT_YN == "Y") {
      alert("이미 재고에 반영된 데이터에 대하여 수정할 수 없습니다.");
      return;
    }
    if (rowDataMaster.CONFIRM_YN == "Y") {
      alert("이미 확정된 데이터에 대하여 수정할 수 없습니다.");
      return;
    }

    // 현재 수정모드면
    if (G_GRDT1DETAIL.view.getEditorLock().isActive()) {
      G_GRDT1DETAIL.view.getEditorLock().commitCurrentEdit();
    }

    var detailDS = [ ];
    var rows = G_GRDT1DETAIL.data.getItems();
    var rowCount = rows.length;
    var rowData;
    var INSPECT_YN = "";
    for (var i = 0; i < rowCount; i++) {
      rowData = rows[i];
      if (rowData.CRUD !== "R") {
        if (rowData.GAP_QTY === 0) {
          INSPECT_YN = "N";
        } else {
          INSPECT_YN = "Y";
        }
        var saveData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_INVEST_DATE: rowData.INVEST_DATE,
          P_INVEST_NO: rowData.INVEST_NO,
          P_LINE_NO: rowData.LINE_NO,
          P_LOCATION_CD: rowData.LOCATION_CD,
          P_INVEST_QTY: rowData.INVEST_QTY,
          P_GAP_DIV: rowData.GAP_DIV,
          P_GAP_COMMENT: rowData.GAP_COMMENT,
          P_INSPECT_YN: INSPECT_YN,
          P_CRUD: rowData.CRUD
        };
        detailDS.push(saveData);
      }
    }

    if (detailDS.length === 0) {
      alert("수정 후 저장하십시오.");
      return;
    }

    $NC.serviceCall("/LC04010E/save.do", {
      // 서버쪽 전표확정여부 확인시 필요- 마스터 Update 제외
      P_DS_MASTER: $NC.toJson({
        P_CENTER_CD: rowDataMaster.CENTER_CD,
        P_BU_CD: rowDataMaster.BU_CD,
        P_INVEST_DATE: rowDataMaster.INVEST_DATE,
        P_INVEST_NO: rowDataMaster.INVEST_NO,
        P_CRUD: "R"
      }),
      P_DS_DETAIL: $NC.toJson(detailDS),
      P_PROCESS_CD: "R",
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
  }

}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {
  // 재고실사 등록 화면
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

    if (rowData.REFLECT_YN == "Y") {
      alert("이미 재고에 반영된 데이터에 대하여 삭제할 수 없습니다.");
      return;
    }

    if (rowData.CONFIRM_YN == "Y") {
      alert("이미 확정된 데이터 입니다. \n취소처리 후 삭제 하십시오.");
      return;
    }

    var saveDS = [ ];
    // 필터링 된 데이터라 전체 데이터를 기준으로 처리
    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
    var saveData = {
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_INVEST_DATE: rowData.INVEST_DATE,
      P_INVEST_NO: rowData.INVEST_NO,
      P_CRUD: "D"
    };
    saveDS.push(saveData);

    var result = confirm("삭제 하시겠습니까?");
    if (result) {
      $NC.serviceCall("/LC04010E/delete.do", {
        P_DS_MASTER: $NC.toJson(saveDS)
      }, onDelete);
    }
  }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
    selectKey: ["INVEST_DATE", "INVEST_NO"]
  });

  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
    selectKey: "LINE_NO"
  });

  _Inquiry();
  G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
  G_GRDT1DETAIL.lastKeyVal = lastKeyVal2;
}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

  if (printIndex === 2) {

    var rowData = G_GRDT3MASTER.data.getItem(G_GRDT3MASTER.lastRow);

    var printOptions = {
      reportDoc: "lc/PAPER_INVEST03",
      queryId: "WR.RS_PAPER_INVEST03",
      queryParams: {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INVEST_DATE: rowData.INVEST_DATE,
        P_INVEST_NO: rowData.INVEST_NO
      }
    };

    $NC.G_MAIN.showPrintPreview(printOptions);
  } else if (printIndex === 0) {
    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

    var printOptions = {
      reportDoc: "lc/PAPER_INVEST01",
      queryId: "WR.RS_PAPER_INVEST01",
      queryParams: {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INVEST_DATE: rowData.INVEST_DATE,
        P_INVEST_NO: rowData.INVEST_NO
      }
    };

    $NC.G_MAIN.showPrintPreview(printOptions);
  } else if (printIndex === 3) {
    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

    var printOptions = {
      reportDoc: "lc/PAPER_INVEST01_1",
      queryId: "WR.RS_PAPER_INVEST01",
      queryParams: {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INVEST_DATE: rowData.INVEST_DATE,
        P_INVEST_NO: rowData.INVEST_NO
      }
    };

    $NC.G_MAIN.showPrintPreview(printOptions);
  } else if (printIndex === 1) {
    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

    var printOptions = {
      reportDoc: "lc/PAPER_INVEST02",
      queryId: "WR.RS_PAPER_INVEST02",
      queryParams: {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INVEST_DATE: rowData.INVEST_DATE,
        P_INVEST_NO: rowData.INVEST_NO
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

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
    selectKey: ["INVEST_DATE", "INVEST_NO"]
  });

  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDT1DETAIL, {
    selectKey: "LINE_NO"
  });

  _Inquiry();
  G_GRDT1MASTER.lastKeyVal = lastKeyVal1;
  G_GRDT1DETAIL.lastKeyVal = lastKeyVal2;

}

function onDelete(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }
  _Inquiry();
}

function onExecSP(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG !== "OK") {
      alert(resultData.O_MSG);
      return;
    }
  }

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
    selectKey: ["INVEST_DATE", "INVEST_NO"]
  });

  _Inquiry();
  G_GRDT1MASTER.lastKeyVal = lastKeyVal;

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
    $("#divQView_Div").hide();
    $("#divQGap_Div").hide();
    $("#divButtonTop").show();
  } else if (id === "TAB2") {
    $("#divQView_Div").hide();
    $("#divQGap_Div").show();
    $("#divButtonTop").hide();

    _OnResize($(window));
  } else {
    $("#divQView_Div").show();
    $("#divQGap_Div").hide();
    $("#divButtonTop").hide();
    _OnResize($(window));
  }
  // 화면상단의 공통 메뉴 버튼 이미지 표시 : true인 경우는 조회 버튼만 활성화 한다.
  setTopButton();
}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "INVEST_DATE",
    field: "INVEST_DATE",
    name: "실사일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INVEST_NO",
    field: "INVEST_NO",
    name: "실사번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INVEST_DIV_F",
    field: "INVEST_DIV_F",
    name: "실사구분",
    minWidth: 100,
  });
  $NC.setGridColumn(columns, {
    id: "INVEST_START_DATE",
    field: "INVEST_START_DATE",
    name: "실사시작일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INVEST_END_DATE",
    field: "INVEST_END_DATE",
    name: "실사종료일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "MANAGER_ID",
    field: "MANAGER_ID",
    name: "실사당당자ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "MANAGER_NM",
    field: "MANAGER_NM",
    name: "실사당당자명",
    minWidth: 120
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
    minWidth: 150,
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
    minWidth: 150,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REFLECT_YN",
    field: "REFLECT_YN",
    name: "재고반영여부",
    minWidth: 90,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "REFLECT_USER_ID",
    field: "REFLECT_USER_ID",
    name: "재고반영자",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REFLECT_DATETIME",
    field: "REFLECT_DATETIME",
    name: "재고반영일시",
    minWidth: 150,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 2,
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.REFLECT_YN == "Y") {
          return "specialrow4";
        }
        if (rowData.CONFIRM_YN == "Y") {
          return "specialrow3";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LC04010E.RS_T1_MASTER",
    sortCol: "INVEST_DATE",
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

  var masterRowData = G_GRDT1MASTER.data.getItem(args.row);
  if (masterRowData.REFLECT_YN == "Y") {
    alert("이미 재고에 반영된 데이터 입니다.");
    return;
  }
  if (masterRowData.CONFIRM_YN == "Y") {
    alert("이미 확정처리된 전표입니다.");
    return;
  }

  if (masterRowData) {
    // 조회후 상태가 바뀌었는지 한번더 상태 체크
    $NC.serviceCall("/LC03020E/getConfirmYn.do", {
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: masterRowData.CENTER_CD,
        P_BU_CD: masterRowData.BU_CD,
        P_ETC_DATE: masterRowData.INVEST_DATE,
        P_ETC_NO: masterRowData.INVEST_NO,
        P_TABLE_DIV: "C" // 테이블구분([A]기타입출고, [B]재고이동, [C]재고실사)
      })
    }, function(ajaxData) {

      var resultData = $NC.toArray(ajaxData);
      if (!$NC.isNull(resultData)) {
        if (resultData.O_MSG === "OK") {
          if (resultData.O_CONFIRM_YN !== "N") {
            alert("이미 확정처리된 전표입니다.\n다시 조회 후 데이터를 확인하십시오.");
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
//      var BU_CD = $NC.getValue("#edtQBu_Cd");
//      var BU_NM = $NC.getValue("#edtQBu_Nm");
      var BU_CD = masterRowData.BU_CD;
      var BU_NM = masterRowData.BU_NM;

      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LC04011P",
        PROGRAM_NM: "재고실사등록/수정",
        url: "lc/LC04011P.html",
        width: 1024,
        height: 610,
        userData: {
          P_PROCESS_CD: "U",
          P_CENTER_CD: CENTER_CD,
          P_CENTER_CD_F: CENTER_CD_F,
          P_BU_CD: BU_CD,
          P_BU_NM: BU_NM,
          P_CUST_CD: $NC.getValue("#edtQCust_Cd"),
          P_MASTER_DS: masterRowData,
          P_POLICY_LC110: $NC.G_VAR.policyVal.LC110,
          P_POLICY_LC120: $NC.G_VAR.policyVal.LC120,
          P_DETAIL_DS: G_GRDT1DETAIL.data.getItems()
        },
        onOk: function() {
          var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
            selectKey: ["INVEST_DATE", "INVEST_NO"]
          });

          _Inquiry();
          G_GRDT1MASTER.lastKeyVal = lastKeyVal;
        }
      });
    });
  }
}

/**
 * 재고실사등록 탭의 그리드 행 클릭시 처리
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

  var rowData = G_GRDT1MASTER.data.getItem(row);

  // 프린트 설정
  if (rowData.CONFIRM_YN === "N") {
    $NC.G_VAR.printOptions = [ ];
    $NC.G_VAR.printOptions.push({
      PRINT_INDEX: 0,
      PRINT_COMMENT: "재고실사표"
    });
//    $NC.G_VAR.printOptions.push({
//      PRINT_INDEX: 3,
//      PRINT_COMMENT: "재고실사표(재고수량 제외)"
//    });
  } else if (rowData.CONFIRM_YN === "Y") {
    $NC.G_VAR.printOptions = [{
      PRINT_INDEX: 1,
      PRINT_COMMENT: "재고실사내역"
    }];
  }
  $NC.setInitTopButtons($NC.G_VAR.buttons);
  // 프린트 설정

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1DETAIL);
  onGetDetailT1({
    data: null
  });

  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  G_GRDT1DETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_INVEST_DATE: rowData.INVEST_DATE,
    P_INVEST_NO: rowData.INVEST_NO,
    P_BRAND_CD: BRAND_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID,
  });
  // 데이터 조회
  $NC.serviceCall("/LC04010E/getDataSet.do", $NC.getGridParams(G_GRDT1DETAIL), onGetDetailT1);
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

function grdT1DetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
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
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INVEST_QTY",
    field: "INVEST_QTY",
    name: "실사수량",
    minWidth: 90,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });
  $NC.setGridColumn(columns, {
    id: "GAP_QTY",
    field: "GAP_QTY",
    name: "차이수량",
    minWidth: 90,
    cssClass: "align-right"
  });
  if ($NC.G_VAR.policyVal.LC120 == "2") {
    $NC.setGridColumn(columns, {
      id: "VALID_DATE",
      field: "VALID_DATE",
      name: "유통기한",
      minWidth: 90,
      cssClass: "align-center"
    });
    $NC.setGridColumn(columns, {
      id: "BATCH_NO",
      field: "BATCH_NO",
      name: "제조배치번호",
      minWidth: 90
    });
  }
  $NC.setGridColumn(columns, {
    id: "GAP_DIV_F",
    field: "GAP_DIV_F",
    name: "실사차이사유구분",
    minWidth: 110,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "GAP_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      }),
      arrowPolling: true
    }, {
      codeField: "GAP_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
    })
  });
  $NC.setGridColumn(columns, {
    id: "GAP_COMMENT",
    field: "GAP_COMMENT",
    name: "실사차이사유내역",
    minWidth: 120,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_YN",
    field: "INSPECT_YN",
    name: "실사여부",
    minWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_USER_ID",
    field: "INSPECT_USER_ID",
    name: "실사자",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_DATETIME",
    field: "INSPECT_DATETIME",
    name: "실사일시",
    minWidth: 150,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 5,
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.GAP_QTY != 0) {
          return "specialrow3";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Detail", {
    columns: grdT1DetailOnGetColumns(),
    queryId: "LC04010E.RS_T1_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDT1DETAIL.view.onSelectedRowsChanged.subscribe(grdT1DetailOnAfterScroll);
  G_GRDT1DETAIL.view.onCellChange.subscribe(grdT1DetailOnCellChange);
  G_GRDT1DETAIL.view.onBeforeEditCell.subscribe(grdT1DetailOnBeforeEditCell);
}

/**
 * 재고실사등록 탭의 하단그리드 행 클릭시 처리
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
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdT1DetailOnCellChange(e, args) {

  var rowData = args.item;

  if (args.cell === G_GRDT1DETAIL.view.getColumnIndex("INVEST_QTY")) {
    var Gap_Qty = Number(rowData.INVEST_QTY) - Number(rowData.STOCK_QTY);
    rowData.GAP_QTY = Gap_Qty;

    if (Gap_Qty === 0) {
      rowData.GAP_DIV = "";
      rowData.GAP_DIV_F = "";
      rowData.GAP_COMMENT = "";
    } else {
      rowData.GAP_DIV = "99";
      rowData.GAP_DIV_F = $NC.getGridComboName(G_GRDT1DETAIL, {
        colFullNameField: "GAP_DIV_F",
        searchVal: "99",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      });
    }
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDT1DETAIL.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDT1DETAIL.lastRowModified = true;
}

function grdT1DetailOnBeforeEditCell(e, args) {

  var rowDataMaster = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

  if (rowDataMaster.CONFIRM_YN == "Y") {
    return false;
  }

  var rowData = G_GRDT1DETAIL.data.getItem(args.row);
  if (rowData) {
    if (args.column.field === "INVEST_QTY") {
      return true;
    }
    if (Number(rowData.GAP_QTY) === 0) {
      return false;
    }
  }
  return true;
}

function grdT2MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "INVEST_DATE",
    field: "INVEST_DATE",
    name: "실사일자",
    minWidth: 90,
    cssClass: "align-center",
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "INVEST_NO",
    field: "INVEST_NO",
    name: "실사번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "INVEST_DIV_F",
    field: "INVEST_DIV_F",
    name: "실사구분",
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
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 100,
    cssClass: "align-center"
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
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "INVEST_QTY",
    field: "INVEST_QTY",
    name: "실사수량",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "GAP_QTY",
    field: "GAP_QTY",
    name: "차이수량",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "GAP_BOX",
    field: "GAP_BOX",
    name: "차이BOX",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "GAP_EA",
    field: "GAP_EA",
    name: "차이EA",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 70,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "GAP_WEIGHT",
    field: "GAP_WEIGHT",
    name: "차이중량",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "GAP_DIV_F",
    field: "GAP_DIV_F",
    name: "실사차이사유구분",
    minWidth: 110,
  });
  $NC.setGridColumn(columns, {
    id: "GAP_COMMENT",
    field: "GAP_COMMENT",
    name: "실사차이사유내역",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "VALID_DATE",
    field: "VALID_DATE",
    name: "유통기한",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BATCH_NO",
    field: "BATCH_NO",
    name: "제조배치번호",
    minWidth: 90
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 재고실사내역탭의 그리드 초기값 설정
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
    queryId: "LC04010E.RS_T2_MASTER",
    sortCol: "INVEST_DATE",
    gridOptions: options
  });

  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

/**
 * 사유관리별입고내역 탭의 그리드 행 클릭시 처리
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

function grdT3MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "INVEST_DATE",
    field: "INVEST_DATE",
    name: "실사일자",
    minWidth: 90,
    cssClass: "align-center",
    summaryTitle: "[합계]"
  });
  $NC.setGridColumn(columns, {
    id: "INVEST_NO",
    field: "INVEST_NO",
    name: "실사번호",
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
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 100,
    cssClass: "align-center"
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
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "INVEST_QTY",
    field: "INVEST_QTY",
    name: "실사수량",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "GAP_QTY",
    field: "GAP_QTY",
    name: "차이수량",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "GAP_BOX",
    field: "GAP_BOX",
    name: "차이BOX",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "GAP_EA",
    field: "GAP_EA",
    name: "차이EA",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "GAP_WEIGHT",
    field: "GAP_WEIGHT",
    name: "차이중량",
    minWidth: 100,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "VALID_DATE",
    field: "VALID_DATE",
    name: "유통기한",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BATCH_NO",
    field: "BATCH_NO",
    name: "제조배치번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_YN",
    field: "INSPECT_YN",
    name: "실사여부",
    minWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_USER_ID",
    field: "INSPECT_USER_ID",
    name: "실사자",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "INSPECT_DATETIME",
    field: "INSPECT_DATETIME",
    name: "실사일시",
    minWidth: 120,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 재고실사내역탭의 그리드 초기값 설정
 */
function grdT3MasterInitialize() {

  var options = {
    frozenColumn: 6,
    summaryRow: {
      visible: true
    }
  };

  // Grid DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT3Master", {
    columns: grdT3MasterOnGetColumns(),
    queryId: "LC04010E.RS_T3_MASTER",
    sortCol: "INVEST_DATE",
    gridOptions: options
  });

  G_GRDT3MASTER.view.onSelectedRowsChanged.subscribe(grdT3MasterOnAfterScroll);
}

/**
 * 사유관리별입고내역 탭의 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdT3MasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDT3MASTER.lastRow != null) {
    if (row == G_GRDT3MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT3Master", row + 1);
}
/**
 * 재고실사등록 탭 조회 버튼 클릭후 처리
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
        selectKey: new Array("INVEST_DATE", "INVEST_NO"),
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
 * 재고실사내역 탭 조회 버튼 클릭후 처리
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
 * 재고실사내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT3(ajaxData) {

  $NC.setInitGridData(G_GRDT3MASTER, ajaxData);

  if (G_GRDT3MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT3MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT3Master", 0, 0);
  }
  setTopButton();
}

/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  // 재고실사등록 화면
  $NC.clearGridData(G_GRDT1MASTER, ["queryParams"]);
  $NC.clearGridData(G_GRDT1DETAIL);
  // 사유관리내역 화면
  $NC.clearGridData(G_GRDT2MASTER);
  // 재고실사내역 화면
  $NC.clearGridData(G_GRDT3MASTER);

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
    $NC.setFocus("#dtpQInvest_Date1", true);
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

  // 재고실사등록탭
  if ($("#divMasterView").tabs("option", "active") == 0) {

    // 버튼 활성화 처리
    $NC.G_VAR.buttons._new = "1";
    $NC.G_VAR.buttons._save = "1";
    $NC.G_VAR.buttons._delete = "1";

    if (G_GRDT1MASTER.data.getLength() > 0) {
      if (!$NC.isNull(G_GRDT1MASTER.queryParams)) {
        $NC.G_VAR.buttons._print = "1";
        $NC.G_VAR.printOptions = [ ];
        var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);
        if (rowData.CONFIRM_YN === "N") {
          $NC.G_VAR.printOptions = [ ];
          $NC.G_VAR.printOptions.push({
            PRINT_INDEX: 0,
            PRINT_COMMENT: "재고실사표"
          });
//          $NC.G_VAR.printOptions.push({
//            PRINT_INDEX: 3,
//            PRINT_COMMENT: "재고실사표(재고수량 제외)"
//          });
        }
        if (rowData.CONFIRM_YN === "Y") {
          $NC.G_VAR.printOptions = [{
            PRINT_INDEX: 1,
            PRINT_COMMENT: "재고실사내역"
          }];
        }
      }
    }
    // 재고실사내역탭
  } else if ($("#divMasterView").tabs("option", "active") === 2) {

    if (G_GRDT3MASTER.data.getLength() > 0) {
      $NC.G_VAR.buttons._print = "1";
      $NC.G_VAR.printOptions = [ ];
      $NC.G_VAR.printOptions = [{
        PRINT_INDEX: 2,
        PRINT_COMMENT: "재고실사 차이분내역"
      }];
    }
  }

  $NC.setInitTopButtons($NC.G_VAR.buttons);

}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();

  // 확정
  if (permission.canConfirm) {
    $("#btnProcessNxt").click(onProcessNxt);
    $("#btnReConfrim").click(onReConfrim);
  }
  $NC.setEnable("#btnProcessNxt", permission.canConfirm);
  $NC.setEnable("#btnReConfrim", permission.canConfirm);

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
    alert("처리할 데이터가 없습니다.\n 조회 후 처리하십시오.");

    return;
  }

  if (G_GRDT1MASTER.lastRow == null) {
    alert("처리할 데이터를 선택하십시오.");
    return;
  }

  var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

  if (rowData.CONFIRM_YN == "N") {
    alert("확정된 데이터에 대하여 취소 할 수 있습니다.");
    return;
  }

  var result = confirm("취소를 하시겠습니까?");
  if (!result) {
    return;
  }

  $NC.serviceCall("/LC04010E/callLcInvestConfirmBWFW.do", {
    P_QUERY_ID: "LC_BW_INVEST_CONFIRM",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_INVEST_DATE: rowData.INVEST_DATE,
      P_INVEST_NO: rowData.INVEST_NO,
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
    alert("처리할 데이터가 없습니다.\n 조회 후 처리하십시오.");
    return;
  }

  if (G_GRDT1MASTER.lastRow == null) {
    alert("처리할 데이터를 선택하십시오.");
    return;
  }

  var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

  if (rowData.CONFIRM_YN == "Y") {
    alert("확정 된 데이터입니다.");
    return;
  }

  var result = confirm("확정을 하시겠습니까?");
  if (!result) {
    return;
  }

  $NC.serviceCall("/LC04010E/callLcInvestConfirmBWFW.do", {
    P_QUERY_ID: "LC_FW_INVEST_CONFIRM",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_INVEST_DATE: rowData.INVEST_DATE,
      P_INVEST_NO: rowData.INVEST_NO,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onExecSP, onSaveError);
}

/**
 * 재고반영
 */
function onReConfrim() {

  var rowCount = G_GRDT1MASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  if (G_GRDT1MASTER.lastRow == null) {
    alert("처리할 데이터를 선택하십시오.");
    return;
  }
  var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

  if (rowData.CONFIRM_YN == "N") {
    alert("확정된 전표만 재고반영 처리할 수 있습니다.");
    return;
  }

  if (rowData.REFLECT_YN == "Y") {
    alert("이미 재고에 반영된 된 데이터입니다.");
    return;
  }

  var result = confirm("재고반영을 하시겠습니까?");
  if (!result) {
    return;
  }

  $NC.serviceCall("/LC04010E/callLcFwInvestReplectConfirm.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_INVEST_DATE: rowData.INVEST_DATE,
      P_INVEST_NO: rowData.INVEST_NO,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onExecSP, onSaveError);
}

function setPolicyValInfo() {

  $NC.G_VAR.policyVal.LC110 = "";
  $NC.G_VAR.policyVal.LC120 = "";

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    $NC.G_VAR.policyVal[POLICY_CD] = "";
  }

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCall("/LC04010E/callSP.do", {
      P_QUERY_ID: "WF.GET_POLICY_VAL",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_POLICY_CD: POLICY_CD
      })
    }, onGetPolicyVal);
  }
}

function onGetPolicyVal(ajaxData) {

  var resultData = $NC.toArray(ajaxData);

  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
      $NC.G_VAR.policyVal[resultData.P_POLICY_CD] = resultData.O_POLICY_VAL;
      G_GRDT1DETAIL.view.setColumns(grdT1DetailOnGetColumns(resultData.O_POLICY_VAL));
    }
  }
}

function sendEsErpStock() {
  var rowCount = G_GRDT1MASTER.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

  if (rowData.CONFIRM_YN == "N") {
    alert("확정된 전표만 전송 처리할 수 있습니다.");
    return;
  }

  var result = confirm("ERP 재고실사를 전송하시겠습니까?");
  if (!result) {
    return;
  }

  $NC.serviceCall("/LC04010E/callEsStErpCreation.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_INVEST_DATE: rowData.INVEST_DATE,
      P_INVEST_NO: rowData.INVEST_NO,
      P_SEND_NO: "0001",
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onExecSP, onSaveError);
}