/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({ // 현재 액티브된 뷰 및 그리드 정보
    activeView: {
      container: "",
      master: null,
      grdMaster: null,
    },
    // 체크할 정책 값
    policyVal: {
      CM110: "", // 고정로케이션 상품할당 기준
      CM120: "" // 로케이션 표시
    },
    // 권장로케이션 현재 작업 버튼 id
    buttonId: null
  });

  $NC.G_JWINDOW.set("minWidth", 1050);

  // 탭 초기화
  $NC.setInitTab("#divTabView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });

  // 그리드 초기화
  grdT1MasterInitialize();
  grdT1ZoneInitialize();
  grdT1BankInitialize();
  grdT1BayInitialize();
  grdT1LevInitialize();
  grdT1DepartInitialize();
  grdT1LineInitialize();
  grdT1ClassInitialize();
  grdT1ItemInitialize();
  grdT2MasterInitialize();
  grdT2ZoneInitialize();
  grdT2BankInitialize();
  grdT2BayInitialize();
  grdT2LevInitialize();
  grdT2ItemInitialize();
  grdT3MasterInitialize();

  $NC.setEnableGroup("#divT1ItemCondition", false);
  $NC.setEnableGroup("#divT2ItemCondition", false);
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  // 권장 로케이션 상품 이미지 클릭시 처리
  $("#btnT1Refresh").click(onBtnT1RefreshClick);
  // 고정 로케이션 상품 이미지 클릭시 처리
  $("#btnT2Refresh").click(onBtnT2RefreshClick);

  $("#btnQBrand_Cd").click(showOwnBranPopup);

  // 권장로케이션 지정 버튼 클릭 이벤트 연결
  $("#divTab1Button .button-group").bind("click", function(e) {
    var view = $(this);
    onSubViewChange(e, view);
  });

  $("#btnT1Confirm").click(onBtnT1ConfirmClick);
  $("#btnT2Confirm").click(onBtnT2ConfirmClick);

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

  // 조회조건 - 상품상태 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "ITEM_STATE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQItem_State",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboQItem_State", "A");
    }
  });

  // 조회조건 - 상품로케이션구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "ITEM_LOC_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "1",
      P_SUB_CD2: "2"
    })
  }, {
    selector: "#cboQItem_Loc_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true,
    onComplete: function() {
      $NC.setValue("#cboQItem_Loc_Div", "%");
    }
  });
  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();
  $("div[id^='divAdditionalCondition']").hide();
}

function _OnLoaded() {

  // 스플리터 초기화
  $NC.setInitSplitter("#divSplitterT1", "h", 300);

  $NC.G_VAR.activeView.master = "#grdT1Master";
  $NC.G_VAR.activeView.grdMaster = G_GRDT1MASTER;
  $NC.G_VAR.buttonId = "btnBrand";

  onSubViewChange(null, $("#btnBrand"));
}

function _SetResizeOffset() {

  $NC.G_OFFSET.gridZoneWidth = 250;
  $NC.G_OFFSET.gridBankWidth = 100;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.tabHeaderHeight = $("#divTabView").children(".ui-tabs-nav:first").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border2; /* 탭일 경우는 좌우 */
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_LAYOUT.border1; /* 탭일 경우는 상하 */

  $NC.resizeContainer("#divTabView", clientWidth, clientHeight);

  clientWidth -= $NC.G_LAYOUT.border1;
  clientHeight -= $NC.G_OFFSET.tabHeaderHeight + $NC.G_LAYOUT.border1;

  if ($("#divTabView").tabs("option", "active") === 0) {

    // Splitter 컨테이너 크기 조정
    var container = $("#divSplitterT1");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    var splitTopAreaHeight = $("#grdT1Master").parent().parent().height();
    var height = splitTopAreaHeight - $NC.G_LAYOUT.header;
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Master", clientWidth, height);

    height = $("#grdT1Zone").parent().parent().height() - $NC.G_LAYOUT.border1;
    height -= ($NC.G_LAYOUT.header + $("#divTab1Button").height() + $NC.G_LAYOUT.border1 * 5) - 1;
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT1Zone", $NC.G_OFFSET.gridZoneWidth, height);
    $NC.resizeGrid("#grdT1Bank", $NC.G_OFFSET.gridBankWidth, height);
    $NC.resizeGrid("#grdT1Bay", $NC.G_OFFSET.gridBankWidth, height);
    $NC.resizeGrid("#grdT1Lev", $NC.G_OFFSET.gridBankWidth, height);

    if ($NC.G_VAR.buttonId === "btnItemGroup") {
      height = $("#divT1SubLeftView").parent().height() - $NC.G_LAYOUT.border1;
      height -= $NC.G_LAYOUT.header - 1;
      var width = clientWidth - $NC.G_OFFSET.gridZoneWidth - $NC.G_OFFSET.gridBankWidth * 3 - $NC.G_LAYOUT.border1 * 4
          - 15/*5 = divRightView left margin*/;
      width = width - $NC.G_LAYOUT.border1 * 2 - 15;
      var viewWidth = Math.ceil(width / 3);
      // Grid 사이즈 조정
      $NC.resizeGrid("#grdT1Depart", viewWidth, height);
      $NC.resizeGrid("#grdT1Line", viewWidth, height);
      $NC.resizeGrid("#grdT1Class", width - (viewWidth * 2), height);

    } else if ($NC.G_VAR.buttonId === "btnItem") {
      height = $("#divT1SubLeftView").parent().height() - $NC.G_LAYOUT.border1;
      height -= $NC.G_LAYOUT.header + $("#divT1ItemCondition").outerHeight() - 1;
      var width = clientWidth - $NC.G_OFFSET.gridZoneWidth - $NC.G_OFFSET.gridBankWidth * 3 - $NC.G_LAYOUT.border1 * 4
          - 15/*5 = divRightView left margin*/;
      var viewWidth = width - 5;
      // Grid 사이즈 조정
      $NC.resizeGrid("#grdT1Item", viewWidth, height);
    }

  } else if ($("#divTabView").tabs("option", "active") === 1) {

    // Splitter 컨테이너 크기 조정
    var container = $("#divSplitterT2");
    $NC.resizeContainer(container, clientWidth, clientHeight);

    // Splitter 너비 조정
    var splitter = container.children(".splitter-bar");
    splitter.width(clientWidth - $NC.G_LAYOUT.border1);

    var splitTopAreaHeight = $("#grdT2Master").parent().parent().height();
    var height = splitTopAreaHeight - $NC.G_LAYOUT.header;
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Master", clientWidth, height);

    height = $("#grdT2Zone").parent().parent().height() - $NC.G_LAYOUT.border1;
    height -= ($NC.G_LAYOUT.header + $("#divTab2Button").height() + $NC.G_LAYOUT.border1 * 5) - 1;
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Zone", $NC.G_OFFSET.gridZoneWidth, height);
    $NC.resizeGrid("#grdT2Bank", $NC.G_OFFSET.gridBankWidth, height);
    $NC.resizeGrid("#grdT2Bay", $NC.G_OFFSET.gridBankWidth, height);
    $NC.resizeGrid("#grdT2Lev", $NC.G_OFFSET.gridBankWidth, height);

    height = $("#divT2SubLeftView").parent().height() - $NC.G_LAYOUT.border1;
    height -= $NC.G_LAYOUT.header + $("#divT2ItemCondition").outerHeight() - 1;
    clientWidth = clientWidth - $NC.G_OFFSET.gridZoneWidth - $NC.G_OFFSET.gridBankWidth * 3 - $NC.G_LAYOUT.border1 * 4
        - 15/*5 = divRightView left margin*/;
    var width = clientWidth - 5;
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT2Item", width, height);
  } else if ($("#divTabView").tabs("option", "active") === 2) {

    var height = clientHeight - $NC.G_LAYOUT.header;
    // Grid 사이즈 조정
    $NC.resizeGrid("#grdT3Master", clientWidth, height);
  }
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "CENTER_CD":
    setPolicyValInfo();
    break;
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.G_USERINFO.BU_CD;
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
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
  var BRAND_NM = $NC.getValue("#edtQBrand_Nm");
  if ($NC.isNull(BRAND_NM)) {
    alert("위탁사 코드를 입력하십시오.");
    $NC.setFocus("#edtQBrand_Cd");
    return;
  }
  var ITEM_STATE = $NC.getValue("#cboQItem_State");
  if ($NC.isNull(ITEM_STATE)) {
    alert("상품상태를 선택하십시오.");
    $NC.setFocus("#cboQItem_State");
    return;
  }

  var activeTabIndex = $("#divTabView").tabs("option", "active");
  if (activeTabIndex === 0) {

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1MASTER);
    // 파라메터 세팅
    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_STATE: ITEM_STATE
    });
    // 데이터 조회
    $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetT1Master);

    if (G_GRDT1ZONE.data.getLength() === 0) {

      // 조회시 전역 변수 값 초기화
      $NC.setInitGridVar(G_GRDT1ZONE);
      // 파라메터 세팅
      G_GRDT1ZONE.queryParams = $NC.getParams({
        P_CENTER_CD: CENTER_CD,
      });
      // 로케이션 존 데이터 조회
      $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT1ZONE), onGetT1Zone);
    }

    if (G_GRDT1DEPART.data.getLength() === 0) {

      // 조회시 전역 변수 값 초기화
      $NC.setInitGridVar(G_GRDT1DEPART);
      // 파라메터 세팅
      G_GRDT1DEPART.queryParams = $NC.getParams({
        P_BRAND_CD: BRAND_CD
      });
      // 상품그룹 대분류 데이터 조회
      $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT1DEPART), onGetT1Depart);
    }

    if (G_GRDT1ITEM.data.getLength() === 0) {

      // 조회시 전역 변수 값 초기화
      $NC.setInitGridVar(G_GRDT1ITEM);
      // 파라메터 세팅
      G_GRDT1ITEM.queryParams = $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_STATE: ITEM_STATE,
        P_ITEM_CD: $NC.getValue("#edtT1QItem_Cd"),
        P_ITEM_NM: $NC.getValue("#edtT1QItem_Nm")
      });
      // 상품 데이터 조회
      $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT1ITEM), onGetT1Item);
    }
    $NC.setEnableGroup("#divT1ItemCondition", true);

  } else if (activeTabIndex === 1) {

    // 고정로케이션 상품할당 기준 정책
    setPolicyValInfo();

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);
    // 파라메터 세팅
    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_STATE: ITEM_STATE,
      P_ITEM_CD: "%"
    });
    // 데이터 조회
    $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetT2Master);

    if (G_GRDT2ZONE.data.getLength() === 0) {

      // 조회시 전역 변수 값 초기화
      $NC.setInitGridVar(G_GRDT2ZONE);
      // 파라메터 세팅
      G_GRDT2ZONE.queryParams = $NC.getParams({
        P_CENTER_CD: CENTER_CD,
      });
      // 로케이션 존 데이터 조회
      $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT2ZONE), onGetT2Zone);
    }

    if (G_GRDT2ITEM.data.getLength() === 0) {

      // 조회시 전역 변수 값 초기화
      $NC.setInitGridVar(G_GRDT2ITEM);
      // 파라메터 세팅
      G_GRDT2ITEM.queryParams = $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BRAND_CD: BRAND_CD,
        P_ITEM_STATE: ITEM_STATE,
        P_ITEM_CD: $NC.getValue("#edtT2QItem_Cd"),
        P_ITEM_NM: $NC.getValue("#edtT2QItem_Nm")
      });
      // 상품 데이터 조회
      $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT2ITEM), onGetT2Item);
    }

    $NC.setEnableGroup("#divT2ItemCondition", true);
  } else if (activeTabIndex === 2) {

    var ITEM_LOC_DIV = $NC.getValue("#cboQItem_Loc_Div");
    if ($NC.isNull(ITEM_LOC_DIV)) {
      alert("상품로케이션구분을 선택하십시오.");
      $NC.setFocus("#cboQItem_Loc_Div");
      return;
    }

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT3MASTER);
    // 파라메터 세팅
    G_GRDT3MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_STATE: ITEM_STATE,
      P_ITEM_LOC_DIV: ITEM_LOC_DIV
    });
    // 데이터 조회
    $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT3MASTER), onGetT3Master);
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
  var activeTabIndex = $("#divTabView").tabs("option", "active");
  var GRDDATASET;
  if (activeTabIndex === 0) {
    GRDDATASET = G_GRDT1MASTER;
  } else if (activeTabIndex === 1) {
    GRDDATASET = G_GRDT2MASTER;

    // 수정모드면
    if (GRDDATASET.view.getEditorLock().isActive()) {
      GRDDATASET.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (GRDDATASET.lastRow != null) {
      if (!grdT2MasterOnBeforePost(GRDDATASET.lastRow)) {
        return;
      }
    }

  } else {
    return;
  }

  if (GRDDATASET.lastRow == null || GRDDATASET.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  var saveDS = [ ];
  var rowCount = GRDDATASET.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = GRDDATASET.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_CD: rowData.ITEM_CD,
        P_DEPART_CD: rowData.DEPART_CD,
        P_LINE_CD: rowData.LINE_CD,
        P_CLASS_CD: rowData.CLASS_CD,
        P_ITEM_LOC_DIV: rowData.ITEM_LOC_DIV,
        P_ZONE_CD: rowData.ZONE_CD,
        P_BANK_CD: rowData.BANK_CD,
        P_BAY_CD: rowData.BAY_CD,
        P_LEV_CD: rowData.LEV_CD,
        P_MIN_UNIT_QTY: rowData.MIN_UNIT_QTY,
        P_MAX_UNIT_QTY: rowData.MAX_UNIT_QTY,
        P_FILL_UNIT_QTY: rowData.FILL_UNIT_QTY,
        P_PICK_SAFE_QTY: rowData.PICK_SAFE_QTY,
        P_POLICY_CM110: $NC.G_VAR.policyVal.CM110,
        P_POLICY_CM120: $NC.G_VAR.policyVal.CM120,
        P_CRUD: rowData.CRUD
      };
      saveDS.push(saveData);
    }
  }
  if (saveDS.length > 0) {
    $NC.serviceCall("/CM05010E/save.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }

}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  var activeTabIndex = $("#divTabView").tabs("option", "active");
  var GRDDATASET;
  if (activeTabIndex === 0) {
    GRDDATASET = G_GRDT1MASTER;
  } else if (activeTabIndex === 1) {
    GRDDATASET = G_GRDT2MASTER;
  } else {
    return;
  }

  if (GRDDATASET.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var result = confirm("삭제 하시겠습니까?");
  if (result) {
    var rowData = GRDDATASET.data.getItem(GRDDATASET.lastRow);

    // 신규 데이터일 경우 그냥 삭제
    if (rowData.CRUD === "C" || rowData.CRUD === "N") {
      // 마지막 선택 Row 수정 상태 복원
      GRDDATASET.lastRowModified = false;

      GRDDATASET.data.deleteItem(rowData.id);
      // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
      if (GRDDATASET.lastRow > 1) {
        $NC.setGridSelectRow(GRDDATASET, GRDDATASET.lastRow - 1);
      } else {
        if (GRDDATASET.data.getLength() === 0) {
          $NC.setGridDisplayRows("#grdMaster", 0, 0);
        } else {
          $NC.setGridSelectRow(GRDDATASET, 0);
        }
      }
    } else {
      rowData.CRUD = "D";
      GRDDATASET.data.updateItem(rowData.id, rowData);
      _Save();

      // 삭제 시 상품 등록여부 N으로 변경
      var rowItemData;
      if (activeTabIndex === 0) {
        if (rowData.ITEM_CD !== "0") {
          rowItemData = G_GRDT1ITEM.data.getItem(G_GRDT1ITEM.lastRow);

          rowItemData.ENTRY_YN = "N";
          G_GRDT1ITEM.data.updateItem(rowItemData.id, rowItemData);
        }
      } else if (activeTabIndex === 1) {
        rowItemData = G_GRDT2ITEM.data.getItem(G_GRDT2ITEM.lastRow);

        rowItemData.ENTRY_YN = "N";
        G_GRDT2ITEM.data.updateItem(rowItemData.id, rowItemData);
      }

    }
  }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

  var activeTabIndex = $("#divTabView").tabs("option", "active");
  if (activeTabIndex === 0) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
      selectKey: ["DEPART_CD", "LINE_CD", "CLASS_CD", "ITEM_CD"],
      isCancel: true
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal;

  } else if (activeTabIndex === 1) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT2MASTER, {
      selectKey: ["ZONE_CD", "BANK_CD", "BAY_CD", "LEV_CD", "ITEM_CD"],
      isCancel: true
    });
    _Inquiry();
    G_GRDT2MASTER.lastKeyVal = lastKeyVal;

  } else {
    return;
  }
}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

}

function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDT1MASTER);
  // 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1ZONE);
  $NC.setInitGridData(G_GRDT1ZONE);
  $NC.setInitGridVar(G_GRDT1BANK);
  $NC.setInitGridData(G_GRDT1BANK);
  $NC.setInitGridVar(G_GRDT1BAY);
  $NC.setInitGridData(G_GRDT1BAY);
  $NC.setInitGridVar(G_GRDT1LEV);
  $NC.setInitGridData(G_GRDT1LEV);
  $NC.setInitGridVar(G_GRDT1DEPART);
  $NC.setInitGridData(G_GRDT1DEPART);
  $NC.setInitGridVar(G_GRDT1LINE);
  $NC.setInitGridData(G_GRDT1LINE);
  $NC.setInitGridVar(G_GRDT1CLASS);
  $NC.setInitGridData(G_GRDT1CLASS);
  $NC.setInitGridVar(G_GRDT1ITEM);
  $NC.setInitGridData(G_GRDT1ITEM);

  // 초기화
  $NC.clearGridData(G_GRDT2MASTER);
  // 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT2ZONE);
  $NC.setInitGridData(G_GRDT2ZONE);
  $NC.setInitGridVar(G_GRDT2BANK);
  $NC.setInitGridData(G_GRDT2BANK);
  $NC.setInitGridVar(G_GRDT2BAY);
  $NC.setInitGridData(G_GRDT2BAY);
  $NC.setInitGridVar(G_GRDT2LEV);
  $NC.setInitGridData(G_GRDT2LEV);
  $NC.setInitGridVar(G_GRDT2ITEM);
  $NC.setInitGridData(G_GRDT2ITEM);

  // 전역 변수 값 초기화
  $NC.clearGridData(G_GRDT3MASTER);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function setTopButtons() {

  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  var activeTabIndex = $("#divTabView").tabs("option", "active");
  if (activeTabIndex === 0) {
    // 버튼 활성화 처리
    if (G_GRDT1MASTER.data.getLength() > 0) {
      $NC.G_VAR.buttons._inquiry = "1";
      $NC.G_VAR.buttons._new = "0";
      $NC.G_VAR.buttons._save = "0";
      $NC.G_VAR.buttons._cancel = "0";
      $NC.G_VAR.buttons._delete = "1";
      $NC.G_VAR.buttons._print = "0";
    }
  } else if (activeTabIndex === 1) {
    // 버튼 활성화 처리
    if (G_GRDT2MASTER.data.getLength() > 0) {
      $NC.G_VAR.buttons._inquiry = "1";
      $NC.G_VAR.buttons._new = "0";
      $NC.G_VAR.buttons._save = "1";
      $NC.G_VAR.buttons._cancel = "1";
      $NC.G_VAR.buttons._delete = "1";
      $NC.G_VAR.buttons._print = "0";
    }
  } else if (activeTabIndex === 2) {
    // 버튼 활성화 처리
    if (G_GRDT2MASTER.data.getLength() > 0) {
      $NC.G_VAR.buttons._inquiry = "1";
      $NC.G_VAR.buttons._new = "0";
      $NC.G_VAR.buttons._save = "0";
      $NC.G_VAR.buttons._cancel = "0";
      $NC.G_VAR.buttons._delete = "0";
      $NC.G_VAR.buttons._print = "0";
    }
  }
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * Sub View Button Click 시 호출 됨
 */
function onSubViewChange(e, view) {

  $("#divT1ItemView").hide();
  $("#divT1ItemGroupView").hide();

  $NC.setEnable("#btnBrand");
  $NC.setEnable("#btnItemGroup");
  $NC.setEnable("#btnItem");
  $NC.setEnable(view, false);

  $NC.G_VAR.buttonId = view.prop("id");

  if ($NC.G_VAR.buttonId === "btnItemGroup") {
    $("#divT1ItemGroupView").show();
  } else if ($NC.G_VAR.buttonId === "btnItem") {
    $("#divT1ItemView").show();
  }
  _OnResize($(window));
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
    $NC.hideView("tblAdditionalConditionView", null, "fast", "blind");
    $("div[id^='divAdditionalCondition']").hide();

    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter("#divSplitterT1")) {
      // 스필리터를 통한 _OnResize 호출
      $("#divSplitterT1").trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter("#divSplitterT1", "h", 300);
    }
  } else if (id === "TAB2") {
    $NC.hideView("tblAdditionalConditionView", null, "fast", "blind");
    $("div[id^='divAdditionalCondition']").hide();

    // 스플리터가 초기화가 되어 있으면 _OnResize 호출
    if ($NC.isSplitter("#divSplitterT2")) {
      // 스필리터를 통한 _OnResize 호출
      $("#divSplitterT2").trigger("resize");
    } else {
      // 스플리터 초기화
      $NC.setInitSplitter("#divSplitterT2", "h", 300);
    }
  } else {
    $("div[id^='divAdditionalCondition']").show();
  }
  _OnResize($(window));
  setTopButtons();
}

function grdT1MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DEPART_CD",
    field: "DEPART_CD",
    name: "대분류",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DEPART_NM",
    field: "DEPART_NM",
    name: "대분류명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "LINE_CD",
    field: "LINE_CD",
    name: "중분류",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NM",
    field: "LINE_NM",
    name: "중분류명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "CLASS_CD",
    field: "CLASS_CD",
    name: "소분류",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CLASS_NM",
    field: "CLASS_NM",
    name: "소분류명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 70
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
    id: "ZONE_CD",
    field: "ZONE_CD",
    name: "존",
    minWidth: 30,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BANK_CD",
    field: "BANK_CD",
    name: "행",
    minWidth: 30,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BAY_CD",
    field: "BAY_CD",
    name: "열",
    minWidth: 30,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LEV_CD",
    field: "LEV_CD",
    name: "단",
    minWidth: 30,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    frozenColumn: 6
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "CM05010E.RS_T1_MASTER",
    sortCol: "DEPART_CD",
    gridOptions: options
  });
  G_GRDT1MASTER.view.onSelectedRowsChanged.subscribe(grdT1MasterOnAfterScroll);
}

function grdT1MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1MASTER.lastRow != null) {
    if (row == G_GRDT1MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT1Master", row + 1, totalRow);
}

function grdZoneOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ZONE_CD",
    field: "ZONE_CD",
    name: "존코드",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ZONE_NM",
    field: "ZONE_NM",
    name: "존명",
    minWidth: 100
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdBankOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BANK_CD_D",
    field: "BANK_CD_D",
    name: "행",
    minWidth: 30,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdBayOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BAY_CD_D",
    field: "BAY_CD_D",
    name: "열",
    minWidth: 30,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdLevOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LEV_CD_D",
    field: "LEV_CD_D",
    name: "단",
    minWidth: 30,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1ZoneInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Zone", {
    columns: grdZoneOnGetColumns(),
    queryId: "CM05010E.RS_T1_SUB1",
    sortCol: "ZONE_CD",
    gridOptions: options
  });
  G_GRDT1ZONE.view.onSelectedRowsChanged.subscribe(grdT1ZoneOnAfterScroll);
}

function grdT1ZoneOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1ZONE.lastRow != null) {
    if (row == G_GRDT1ZONE.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  G_GRDT1ZONE.lastRow = row;
  var rowData = G_GRDT1ZONE.data.getItem(row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1BANK);

  // 파라메터 세팅
  G_GRDT1BANK.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_ZONE_CD: rowData.ZONE_CD
  });
  // 데이터 조회
  $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT1BANK), onGetT1Bank);
}

function grdT1BankInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Bank", {
    columns: grdBankOnGetColumns(),
    queryId: "CM05010E.RS_T1_SUB2",
    sortCol: "BANK_CD_D",
    gridOptions: options
  });
  G_GRDT1BANK.view.onSelectedRowsChanged.subscribe(grdT1BankOnAfterScroll);
}

function grdT1BankOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1BANK.lastRow != null) {
    if (row == G_GRDT1BANK.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  G_GRDT1BANK.lastRow = row;
  var rowData = G_GRDT1BANK.data.getItem(row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1BAY);
  // 파라메터 세팅
  G_GRDT1BAY.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_ZONE_CD: rowData.ZONE_CD,
    P_BANK_CD: rowData.BANK_CD
  });
  // 데이터 조회
  $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT1BAY), onGetT1Bay);
}

function grdT1BayInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Bay", {
    columns: grdBayOnGetColumns(),
    queryId: "CM05010E.RS_T1_SUB3",
    sortCol: "BAY_CD_D",
    gridOptions: options
  });
  G_GRDT1BAY.view.onSelectedRowsChanged.subscribe(grdT1BayOnAfterScroll);
}

function grdT1BayOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1BAY.lastRow != null) {
    if (row == G_GRDT1BAY.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  G_GRDT1BAY.lastRow = row;
  var rowData = G_GRDT1BAY.data.getItem(row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1LEV);
  // 파라메터 세팅
  G_GRDT1LEV.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_ZONE_CD: rowData.ZONE_CD,
    P_BANK_CD: rowData.BANK_CD,
    P_BAY_CD: rowData.BAY_CD
  });
  // 데이터 조회
  $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT1LEV), onGetT1Lev);
}

function grdT1LevInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    specialRow: {
      compareKey: "LOC_DIV",
      compareVal: "1",
      compareOperator: "==",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Lev", {
    columns: grdLevOnGetColumns(),
    queryId: "CM05010E.RS_T1_SUB4",
    sortCol: "LEV_CD_D",
    gridOptions: options
  });
  G_GRDT1LEV.view.onSelectedRowsChanged.subscribe(grdT1LevOnAfterScroll);
}

function grdT1LevOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1LEV.lastRow != null) {
    if (row == G_GRDT1LEV.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  G_GRDT1LEV.lastRow = row;
}

function grdT1DepartOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DEPART_CD",
    field: "DEPART_CD",
    name: "대분류",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "DEPART_NM",
    field: "DEPART_NM",
    name: "대분류명",
    minWidth: 120
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1DepartInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Depart", {
    columns: grdT1DepartOnGetColumns(),
    queryId: "CM05010E.RS_T1_SUB5",
    sortCol: "DEPART_CD",
    gridOptions: options
  });
  G_GRDT1DEPART.view.onSelectedRowsChanged.subscribe(grdT1DepartOnAfterScroll);
}

function grdT1DepartOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1DEPART.lastRow != null) {
    if (row == G_GRDT1DEPART.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  G_GRDT1DEPART.lastRow = row;
  var rowData = G_GRDT1DEPART.data.getItem(row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1LINE);
  onGetT1Line({
    data: null
  });

  // 파라메터 세팅
  G_GRDT1LINE.queryParams = $NC.getParams({
    P_BRAND_CD: rowData.BRAND_CD,
    P_DEPART_CD: rowData.DEPART_CD
  });
  // 데이터 조회
  $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT1LINE), onGetT1Line);
}

function grdT1LineOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_CD",
    field: "LINE_CD",
    name: "중분류",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NM",
    field: "LINE_NM",
    name: "중분류명",
    minWidth: 120
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1LineInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Line", {
    columns: grdT1LineOnGetColumns(),
    queryId: "CM05010E.RS_T1_SUB6",
    sortCol: "LINE_CD",
    gridOptions: options
  });
  G_GRDT1LINE.view.onSelectedRowsChanged.subscribe(grdT1LineOnAfterScroll);
}

function grdT1LineOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1LINE.lastRow != null) {
    if (row == G_GRDT1LINE.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  G_GRDT1LINE.lastRow = row;
  var rowData = G_GRDT1LINE.data.getItem(row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT1CLASS);
  onGetT1Class({
    data: null
  });

  // 파라메터 세팅
  G_GRDT1CLASS.queryParams = $NC.getParams({
    P_BRAND_CD: rowData.BRAND_CD,
    P_DEPART_CD: rowData.DEPART_CD,
    P_LINE_CD: rowData.LINE_CD
  });
  // 데이터 조회
  $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT1CLASS), onGetT1Class);
}

function grdT1ClassOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CLASS_CD",
    field: "CLASS_CD",
    name: "소분류",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CLASS_NM",
    field: "CLASS_NM",
    name: "소분류명",
    minWidth: 120
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1ClassInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Class", {
    columns: grdT1ClassOnGetColumns(),
    queryId: "CM05010E.RS_T1_SUB7",
    sortCol: "CLASS_CD",
    gridOptions: options
  });
  G_GRDT1CLASS.view.onSelectedRowsChanged.subscribe(grdT1ClassOnAfterScroll);
}

function grdT1ClassOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1CLASS.lastRow != null) {
    if (row == G_GRDT1CLASS.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  G_GRDT1CLASS.lastRow = row;
}

function grdItemOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 70
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1ItemInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    frozenColumn: 0,
    specialRow: {
      compareKey: "ENTRY_YN",
      compareVal: "Y",
      compareOperator: "==",
      cssClass: "specialrow1"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Item", {
    columns: grdItemOnGetColumns(),
    queryId: "CM05010E.RS_T1_SUB8",
    sortCol: "ITEM_CD",
    gridOptions: options
  });
  G_GRDT1ITEM.view.onSelectedRowsChanged.subscribe(grdT1ItemOnAfterScroll);
  G_GRDT1ITEM.view.onClick.subscribe(grdT1ItemOnClick);
}

function grdT1ItemOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT1ITEM.lastRow != null) {
    if (row == G_GRDT1ITEM.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  G_GRDT1ITEM.lastRow = row;
}

function grdT1ItemOnClick(e, args) {

  var rowData = G_GRDT1ITEM.data.getItem(args.row);

  var searchIndex = $NC.getGridSearchVal(G_GRDT1MASTER, {
    searchKey: "ITEM_CD",
    searchVal: rowData.ITEM_CD
  });
  if (searchIndex > -1) {
    $NC.setGridSelectRow(G_GRDT1MASTER, searchIndex);
  }
}

function grdT2MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ZONE_CD",
    field: "ZONE_CD",
    name: "존",
    minWidth: 30,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BANK_CD",
    field: "BANK_CD",
    name: "행",
    minWidth: 30,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BAY_CD",
    field: "BAY_CD",
    name: "열",
    minWidth: 30,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LEV_CD",
    field: "LEV_CD",
    name: "단",
    minWidth: 30,
    cssClass: "align-center"
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
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "MIN_UNIT_QTY",
    field: "MIN_UNIT_QTY",
    name: "최소적재수량",
    minWidth: 80,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MAX_UNIT_QTY",
    field: "MAX_UNIT_QTY",
    name: "최대적재수량",
    minWidth: 80,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "FILL_UNIT_QTY",
    field: "FILL_UNIT_QTY",
    name: "단위보충수량",
    minWidth: 80,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT2MasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "CM05010E.RS_T2_MASTER",
    sortCol: "ZONE_CD",
    gridOptions: options
  });
  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
  G_GRDT2MASTER.view.onCellChange.subscribe(grdT2MasterOnCellChange);
}

function grdT2MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2MASTER.lastRow != null) {
    if (row == G_GRDT2MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
    if (!grdT2MasterOnBeforePost(G_GRDT2MASTER.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Master", row + 1);
}

function grdT2MasterOnCellChange(e, args) {

  var rowData = args.item;

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDT2MASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDT2MASTER.lastRowModified = true;
}

function grdT2MasterOnBeforePost(row) {

  if (!G_GRDT2MASTER.lastRowModified) {
    return true;
  }

  var rowData = G_GRDT2MASTER.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.MIN_UNIT_QTY)) {
      alert("최소적재수량를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDT2MASTER, row);
      G_GRDT2MASTER.view.gotoCell(row, G_GRDT2MASTER.view.getColumnIndex("MIN_UNIT_QTY"), true);
      return false;
    }
    if (Number(rowData.MIN_UNIT_QTY) < 0) {
      alert("최소적재수량에 0이상의 정수를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDT2MASTER, row);
      G_GRDT2MASTER.view.gotoCell(row, G_GRDT2MASTER.view.getColumnIndex("MIN_UNIT_QTY"), true);
      return false;
    }

    if ($NC.isNull(rowData.MAX_UNIT_QTY)) {
      alert("최대적재수량를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDT2MASTER, row);
      G_GRDT2MASTER.view.gotoCell(row, G_GRDT2MASTER.view.getColumnIndex("MAX_UNIT_QTY"), true);
      return false;
    }
    if (Number(rowData.MAX_UNIT_QTY) < 0) {
      alert("최대적재수량에 0이상의 정수를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDT2MASTER, row);
      G_GRDT2MASTER.view.gotoCell(row, G_GRDT2MASTER.view.getColumnIndex("MAX_UNIT_QTY"), true);
      return false;
    }

    if ($NC.isNull(rowData.FILL_UNIT_QTY)) {
      alert("단위보충수량를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDT2MASTER, row);
      G_GRDT2MASTER.view.gotoCell(row, G_GRDT2MASTER.view.getColumnIndex("FILL_UNIT_QTY"), true);
      return false;
    }
    if (Number(rowData.FILL_UNIT_QTY) < 0) {
      alert("단위보충수량에 0이상의 정수를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDT2MASTER, row);
      G_GRDT2MASTER.view.gotoCell(row, G_GRDT2MASTER.view.getColumnIndex("FILL_UNIT_QTY"), true);
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdT2ZoneInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Zone", {
    columns: grdZoneOnGetColumns(),
    queryId: "CM05010E.RS_T2_SUB1",
    sortCol: "ZONE_CD",
    gridOptions: options
  });
  G_GRDT2ZONE.view.onSelectedRowsChanged.subscribe(grdT2ZoneOnAfterScroll);
}

function grdT2ZoneOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2ZONE.lastRow != null) {
    if (row == G_GRDT2ZONE.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  G_GRDT2ZONE.lastRow = row;
  var rowData = G_GRDT2ZONE.data.getItem(row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT2BANK);
  onGetT2Bank({
    data: null
  });

  // 파라메터 세팅
  G_GRDT2BANK.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_ZONE_CD: rowData.ZONE_CD
  });
  // 데이터 조회
  $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT2BANK), onGetT2Bank);
}

function grdT2BankInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Bank", {
    columns: grdBankOnGetColumns(),
    queryId: "CM05010E.RS_T2_SUB2",
    sortCol: "BANK_CD_D",
    gridOptions: options
  });
  G_GRDT2BANK.view.onSelectedRowsChanged.subscribe(grdT2BankOnAfterScroll);
}

function grdT2BankOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2BANK.lastRow != null) {
    if (row == G_GRDT2BANK.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  G_GRDT2BANK.lastRow = row;
  var rowData = G_GRDT2BANK.data.getItem(row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT2BAY);
  onGetT2Bay({
    data: null
  });

  // 파라메터 세팅
  G_GRDT2BAY.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_ZONE_CD: rowData.ZONE_CD,
    P_BANK_CD: rowData.BANK_CD
  });
  // 데이터 조회
  $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT2BAY), onGetT2Bay);
}

function grdT2BayInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Bay", {
    columns: grdBayOnGetColumns(),
    queryId: "CM05010E.RS_T2_SUB3",
    sortCol: "BAY_CD_D",
    gridOptions: options
  });
  G_GRDT2BAY.view.onSelectedRowsChanged.subscribe(grdT2BayOnAfterScroll);
}

function grdT2BayOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2BAY.lastRow != null) {
    if (row == G_GRDT2BAY.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  G_GRDT2BAY.lastRow = row;
  var rowData = G_GRDT2BAY.data.getItem(row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDT2LEV);
  onGetT2Lev({
    data: null
  });

  // 파라메터 세팅
  G_GRDT2LEV.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_ZONE_CD: rowData.ZONE_CD,
    P_BANK_CD: rowData.BANK_CD,
    P_BAY_CD: rowData.BAY_CD
  });
  // 데이터 조회
  $NC.serviceCall("/CM05010E/getDataSet.do", $NC.getGridParams(G_GRDT2LEV), onGetT2Lev);
}

function grdT2LevInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    specialRow: {
      compareKey: "LOC_DIV",
      compareVal: "2",
      compareOperator: "==",
      cssClass: "specialrow3"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Lev", {
    columns: grdLevOnGetColumns(),
    queryId: "CM05010E.RS_T2_SUB4",
    sortCol: "LEV_CD_D",
    gridOptions: options
  });
  G_GRDT2LEV.view.onSelectedRowsChanged.subscribe(grdT2LevOnAfterScroll);
}

function grdT2LevOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2LEV.lastRow != null) {
    if (row == G_GRDT2LEV.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  G_GRDT2LEV.lastRow = row;
}

function grdT2ItemInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    frozenColumn: 0,
    specialRow: {
      compareKey: "ENTRY_YN",
      compareVal: "Y",
      compareOperator: "==",
      cssClass: "specialrow1"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Item", {
    columns: grdItemOnGetColumns(),
    queryId: "CM05010E.RS_T2_SUB8",
    sortCol: "ITEM_CD",
    gridOptions: options
  });
  G_GRDT2ITEM.view.onSelectedRowsChanged.subscribe(grdT2ItemOnAfterScroll);
  G_GRDT2ITEM.view.onClick.subscribe(grdT2ItemOnClick);
}

function grdT2ItemOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2ITEM.lastRow != null) {
    if (row == G_GRDT2ITEM.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  G_GRDT2ITEM.lastRow = row;
}

function grdT2ItemOnClick(e, args) {

  var rowData = G_GRDT2ITEM.data.getItem(args.row);

  var searchIndex = $NC.getGridSearchVal(G_GRDT2MASTER, {
    searchKey: "ITEM_CD",
    searchVal: rowData.ITEM_CD
  });
  if (searchIndex > -1) {
    $NC.setGridSelectRow(G_GRDT2MASTER, searchIndex);
  }
}

function grdT3MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_LOC_DIV_F",
    field: "ITEM_LOC_DIV_F",
    name: "로케이션구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 120,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "MIN_UNIT_QTY",
    field: "MIN_UNIT_QTY",
    name: "최소적재수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MAX_UNIT_QTY",
    field: "MAX_UNIT_QTY",
    name: "최대적재수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "FILL_UNIT_QTY",
    field: "FILL_UNIT_QTY",
    name: "단위보충수량",
    minWidth: 80,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT3MasterInitialize() {

  var options = {
    editable: false,
    autoEdit: false,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT3Master", {
    columns: grdT3MasterOnGetColumns(),
    queryId: "CM05010E.RS_T3_MASTER",
    sortCol: "ITEM_LOC_DIV_F",
    gridOptions: options
  });
  G_GRDT3MASTER.view.onSelectedRowsChanged.subscribe(grdT3MasterOnAfterScroll);
}

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

function onGetT1Master(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);

  if (G_GRDT1MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1MASTER, {
        selectKey: ["DEPART_CD", "LINE_CD", "CLASS_CD", "ITEM_CD"],
        selectVal: G_GRDT1MASTER.lastKeyVal,
        activeCell: true
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT1Master", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetT1Zone(ajaxData) {

  $NC.setInitGridData(G_GRDT1ZONE, ajaxData);

  if (G_GRDT1ZONE.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1ZONE.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1ZONE, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1ZONE, {
        selectKey: "ZONE_CD",
        selectVal: G_GRDT1ZONE.lastKeyVal,
        activeCell: true
      });
    }
  }
}

function onGetT1Bank(ajaxData) {

  $NC.setInitGridData(G_GRDT1BANK, ajaxData);

  if (G_GRDT1BANK.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1BANK.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1BANK, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1BANK, {
        selectKey: "BANK_CD",
        selectVal: G_GRDT1BANK.lastKeyVal,
        activeCell: true
      });
    }
  }
}

function onGetT1Bay(ajaxData) {

  $NC.setInitGridData(G_GRDT1BAY, ajaxData);

  if (G_GRDT1BAY.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1BAY.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1BAY, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1BAY, {
        selectKey: "BAY_CD",
        selectVal: G_GRDT1BAY.lastKeyVal,
        activeCell: true
      });
    }
  }
}

function onGetT1Lev(ajaxData) {

  $NC.setInitGridData(G_GRDT1LEV, ajaxData);

  if (G_GRDT1LEV.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1LEV.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1LEV, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1LEV, {
        selectKey: "LEV_CD",
        selectVal: G_GRDT1LEV.lastKeyVal,
        activeCell: true
      });
    }
  }
}

function onGetT1Depart(ajaxData) {

  $NC.setInitGridData(G_GRDT1DEPART, ajaxData);

  if (G_GRDT1DEPART.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1DEPART.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1DEPART, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1DEPART, {
        selectKey: "DEPART_CD",
        selectVal: G_GRDT1DEPART.lastKeyVal,
        activeCell: true
      });
    }
  }
}

function onGetT1Line(ajaxData) {

  $NC.setInitGridData(G_GRDT1LINE, ajaxData);

  if (G_GRDT1LINE.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1LINE.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1LINE, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1LINE, {
        selectKey: "LINE_CD",
        selectVal: G_GRDT1LINE.lastKeyVal,
        activeCell: true
      });
    }
  }
}

function onGetT1Class(ajaxData) {

  $NC.setInitGridData(G_GRDT1CLASS, ajaxData);

  if (G_GRDT1CLASS.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1CLASS.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1CLASS, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1CLASS, {
        selectKey: "CLASS_CD",
        selectVal: G_GRDT1CLASS.lastKeyVal,
        activeCell: true
      });
    }
  }
}

function onGetT1Item(ajaxData) {

  $NC.setInitGridData(G_GRDT1ITEM, ajaxData);

  if (G_GRDT1ITEM.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT1ITEM.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT1ITEM, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT1ITEM, {
        selectKey: "ITEM_CD",
        selectVal: G_GRDT1ITEM.lastKeyVal,
        activeCell: true
      });
    }
  }
}

function onGetT2Master(ajaxData) {

  $NC.setInitGridData(G_GRDT2MASTER, ajaxData);

  if (G_GRDT2MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT2MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT2MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT2MASTER, {
        selectKey: ["ZONE_CD", "BANK_CD", "BAY_CD", "LEV_CD", "ITEM_CD"],
        selectVal: G_GRDT2MASTER.lastKeyVal,
        activeCell: true
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT2Master", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetT2Zone(ajaxData) {

  $NC.setInitGridData(G_GRDT2ZONE, ajaxData);

  if (G_GRDT2ZONE.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT2ZONE.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT2ZONE, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT2ZONE, {
        selectKey: "ZONE_CD",
        selectVal: G_GRDT2ZONE.lastKeyVal,
        activeCell: true
      });
    }
  }
}

function onGetT2Bank(ajaxData) {

  $NC.setInitGridData(G_GRDT2BANK, ajaxData);

  if (G_GRDT2BANK.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT2BANK.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT2BANK, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT2BANK, {
        selectKey: "BANK_CD",
        selectVal: G_GRDT2BANK.lastKeyVal,
        activeCell: true
      });
    }
  }
}

function onGetT2Bay(ajaxData) {

  $NC.setInitGridData(G_GRDT2BAY, ajaxData);

  if (G_GRDT2BAY.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT2BAY.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT2BAY, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT2BAY, {
        selectKey: "BAY_CD",
        selectVal: G_GRDT2BAY.lastKeyVal,
        activeCell: true
      });
    }
  }
}

function onGetT2Lev(ajaxData) {

  $NC.setInitGridData(G_GRDT2LEV, ajaxData);

  if (G_GRDT2LEV.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT2LEV.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT2LEV, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT2LEV, {
        selectKey: "LEV_CD",
        selectVal: G_GRDT2LEV.lastKeyVal,
        activeCell: true
      });
    }
  }
}

function onGetT2Item(ajaxData) {

  $NC.setInitGridData(G_GRDT2ITEM, ajaxData);

  if (G_GRDT2ITEM.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT2ITEM.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT2ITEM, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT2ITEM, {
        selectKey: "ITEM_CD",
        selectVal: G_GRDT2ITEM.lastKeyVal,
        activeCell: true
      });
    }
  }
}

function onGetT3Master(ajaxData) {

  $NC.setInitGridData(G_GRDT3MASTER, ajaxData);

  if (G_GRDT3MASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDT3MASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDT3MASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDT3MASTER, {
        selectKey: ["ITEM_LOC_DIV_F", "ITEM_CD", "LOCATION_CD"],
        selectVal: G_GRDT3MASTER.lastKeyVal,
        activeCell: true
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdT3Master", 0, 0);
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

function onSave(ajaxData) {

  var activeTabIndex = $("#divTabView").tabs("option", "active");
  if (activeTabIndex === 0) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT1MASTER, {
      selectKey: ["DEPART_CD", "LINE_CD", "CLASS_CD", "ITEM_CD"]
    });
    _Inquiry();
    G_GRDT1MASTER.lastKeyVal = lastKeyVal;
    
    var lastKeyValG1Item = $NC.getGridLastKeyVal(G_GRDT1ITEM, {
      selectKey: ["ITEM_CD"]
    });
    onBtnT1RefreshClick();
    G_GRDT1ITEM.lastKeyVal = lastKeyValG1Item;

  } else if (activeTabIndex === 1) {

    var lastKeyVal = $NC.getGridLastKeyVal(G_GRDT2MASTER, {
      selectKey: ["ZONE_CD", "BANK_CD", "BAY_CD", "LEV_CD", "ITEM_CD"]
    });
    _Inquiry();
    G_GRDT2MASTER.lastKeyVal = lastKeyVal;

  } else {
    return;
  }
}

function onSaveError(ajaxData) {

  var activeTabIndex = $("#divTabView").tabs("option", "active");
  if (activeTabIndex === 0) {

    $NC.onError(ajaxData);
    var rowData = G_GRDT1MASTER.data.getItem(G_GRDT1MASTER.lastRow);

    if (rowData.CRUD === "D") {
      rowData.CRUD = "U";
      G_GRDT1MASTER.data.updateItem(rowData.id, rowData);
      // 마지막 선택 Row 수정 상태로 변경
      G_GRDT1MASTER.lastRowModified = false;
    }

  } else if (activeTabIndex === 1) {

    $NC.onError(ajaxData);
    var rowData = G_GRDT2MASTER.data.getItem(G_GRDT2MASTER.lastRow);

    if (rowData.CRUD === "D") {
      rowData.CRUD = "U";
      G_GRDT2MASTER.data.updateItem(rowData.id, rowData);
      // 마지막 선택 Row 수정 상태로 변경
      G_GRDT2MASTER.lastRowModified = false;
    }

  } else {
    return;
  }
}

function onBtnT1RefreshClick() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
  var BRAND_NM = $NC.getValue("#edtQBrand_Nm");
  if ($NC.isNull(BRAND_NM)) {
    alert("위탁사 코드를 입력하십시오.");
    $NC.setFocus("#edtQBrand_Cd");
    return;
  }
  var ITEM_STATE = $NC.getValue("#cboQItem_State");
  if ($NC.isNull(ITEM_STATE)) {
    alert("상품상태를 선택하십시오.");
    $NC.setFocus("#cboQItem_State");
    return;
  }

  // 상품 데이터 조회
  $NC.serviceCall("/CM05010E/getDataSet.do", {
    P_QUERY_ID: "CM05010E.RS_T1_SUB8",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_STATE: ITEM_STATE,
      P_ITEM_CD: $NC.getValue("#edtT1QItem_Cd"),
      P_ITEM_NM: $NC.getValue("#edtT1QItem_Nm")
    })
  }, onGetT1Item);
}

function onBtnT2RefreshClick() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
  var BRAND_NM = $NC.getValue("#edtQBrand_Nm");
  if ($NC.isNull(BRAND_NM)) {
    alert("위탁사 코드를 입력하십시오.");
    $NC.setFocus("#edtQBrand_Cd");
    return;
  }
  var ITEM_STATE = $NC.getValue("#cboQItem_State");
  if ($NC.isNull(ITEM_STATE)) {
    alert("상품상태를 선택하십시오.");
    $NC.setFocus("#cboQItem_State");
    return;
  }

  // 상품 데이터 조회
  $NC.serviceCall("/CM05010E/getDataSet.do", {
    P_QUERY_ID: "CM05010E.RS_T2_SUB8",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_STATE: ITEM_STATE,
      P_ITEM_CD: $NC.getValue("#edtT2QItem_Cd"),
      P_ITEM_NM: $NC.getValue("#edtT2QItem_Nm")
    })
  }, onGetT2Item);
}

function setPolicyValInfo() {

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  $NC.G_VAR.policyVal.CM110 = "";
  $NC.G_VAR.policyVal.CM120 = "";

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCall("/CM05010E/callSP.do", {
      P_QUERY_ID: "WF.GET_POLICY_VAL",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: null,
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
    }
  }
}

function onBtnT1ConfirmClick() {

  var rowCount = G_GRDT1MASTER.data.getLength();
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDT1MASTER.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      return;
    }
  }

  var rowData = G_GRDT1LEV.data.getItem(G_GRDT1LEV.lastRow);

  if (rowData.LOC_DIV !== "1") {
    var result = confirm("일반로케이션이 아닙니다. 그래도 권장로케이션을 등록하시겠습니까?");
    if (!result) {
      return;
    }
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
    BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
    ITEM_STATE: $NC.getValue("#cboQItem_State"),
    ITEM_CD: null,
    ITEM_NM: null,
    ITEM_SPEC: null,
    DEPART_CD: null,
    DEPART_NM: null,
    LINE_CD: null,
    LINE_NM: null,
    CLASS_CD: null,
    CLASS_NM: null,
    ITEM_LOC_DIV: "1",
    ZONE_CD: rowData.ZONE_CD,
    BANK_CD: rowData.BANK_CD,
    BAY_CD: rowData.BAY_CD,
    LEV_CD: rowData.LEV_CD,
    MIN_UNIT_QTY: 0,
    MAX_UNIT_QTY: 0,
    FILL_UNIT_QTY: 0,
    PICK_SAFE_QTY: 0,
    id: $NC.getGridNewRowId(),
    CRUD: "C"
  };

  if ($NC.G_VAR.buttonId === "btnBrand") {

    newRowData.ITEM_CD = "0";
    newRowData.ITEM_NM = "전체상품";
    newRowData.ITEM_SPEC = null;

    newRowData.DEPART_CD = "0000";
    newRowData.DEPART_NM = "전체대분류";
    newRowData.LINE_CD = "0000";
    newRowData.LINE_NM = "전체중분류";
    newRowData.CLASS_CD = "0000";
    newRowData.CLASS_NM = "전체소분류";

  } else if ($NC.G_VAR.buttonId === "btnItemGroup") {

    newRowData.ITEM_CD = "0";
    newRowData.ITEM_NM = "전체상품";
    newRowData.ITEM_SPEC = null;

    var rowItemGroupData = G_GRDT1DEPART.data.getItem(G_GRDT1DEPART.lastRow);
    newRowData.DEPART_CD = rowItemGroupData.DEPART_CD;
    newRowData.DEPART_NM = rowItemGroupData.DEPART_NM;

    rowItemGroupData = G_GRDT1LINE.data.getItem(G_GRDT1LINE.lastRow);
    newRowData.LINE_CD = rowItemGroupData.LINE_CD;
    newRowData.LINE_NM = rowItemGroupData.LINE_NM;

    rowItemGroupData = G_GRDT1CLASS.data.getItem(G_GRDT1CLASS.lastRow);
    newRowData.CLASS_CD = rowItemGroupData.CLASS_CD;
    newRowData.CLASS_NM = rowItemGroupData.CLASS_NM;
  } else {

    var rowItemData = G_GRDT1ITEM.data.getItem(G_GRDT1ITEM.lastRow);
    newRowData.ITEM_CD = rowItemData.ITEM_CD;
    newRowData.ITEM_NM = rowItemData.ITEM_NM;
    newRowData.ITEM_SPEC = rowItemData.ITEM_SPEC;

    newRowData.DEPART_CD = "0000";
    newRowData.DEPART_NM = "전체대분류";
    newRowData.LINE_CD = "0000";
    newRowData.LINE_NM = "전체중분류";
    newRowData.CLASS_CD = "0000";
    newRowData.CLASS_NM = "전체소분류";

//    rowItemData.ENTRY_YN = "Y";
//    G_GRDT1ITEM.data.updateItem(rowItemData.id, rowItemData);
  }

  var searchIndex = $NC.getGridSearchVal(G_GRDT1MASTER, {
    searchKey: ["DEPART_CD", "LINE_CD", "CLASS_CD", "ITEM_CD", "ZONE_CD", "BANK_CD", "BAY_CD", "LEV_CD"],
    searchVal: [newRowData.DEPART_CD, newRowData.LINE_CD, newRowData.CLASS_CD, newRowData.ITEM_CD, newRowData.ZONE_CD,
        newRowData.BANK_CD, newRowData.BAY_CD, newRowData.LEV_CD]
  });
  if (searchIndex > -1) {
    $NC.setGridSelectRow(G_GRDT1MASTER, searchIndex);
    alert("등록된 권장 로케이션이 존재합니다.");
    return;
  }

  G_GRDT1MASTER.data.addItem(newRowData);

  $NC.setGridSelectRow(G_GRDT1MASTER, rowCount);
  // 수정 상태로 변경
  G_GRDT1MASTER.lastRowModified = true;

  _Save();
}

function onBtnT2ConfirmClick() {

  var rowCount = G_GRDT2MASTER.data.getLength();
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDT2MASTER.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      return;
    }
  }

  var rowData = G_GRDT2LEV.data.getItem(G_GRDT2LEV.lastRow);

  if (rowData.LOC_DIV !== "2") {
    var result = confirm("고정로케이션이 아닙니다. 그래도 고정로케이션을 등록하시겠습니까?");
    if (!result) {
      return;
    }
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
    BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
    ITEM_STATE: $NC.getValue("#cboQItem_State"),
    ITEM_CD: null,
    ITEM_NM: null,
    ITEM_SPEC: null,
    DEPART_CD: null,
    DEPART_NM: null,
    LINE_CD: null,
    LINE_NM: null,
    CLASS_CD: null,
    CLASS_NM: null,
    ITEM_LOC_DIV: "2",
    ZONE_CD: rowData.ZONE_CD,
    BANK_CD: rowData.BANK_CD,
    BAY_CD: rowData.BAY_CD,
    LEV_CD: rowData.LEV_CD,
    MIN_UNIT_QTY: 0,
    MAX_UNIT_QTY: 0,
    FILL_UNIT_QTY: 0,
    PICK_SAFE_QTY: 0,
    id: $NC.getGridNewRowId(),
    CRUD: "C"
  };

  var rowItemData = G_GRDT2ITEM.data.getItem(G_GRDT2ITEM.lastRow);
  newRowData.ITEM_CD = rowItemData.ITEM_CD;
  newRowData.ITEM_NM = rowItemData.ITEM_NM;
  newRowData.ITEM_SPEC = rowItemData.ITEM_SPEC;

  newRowData.DEPART_CD = "0000";
  newRowData.DEPART_NM = "전체대분류";
  newRowData.LINE_CD = "0000";
  newRowData.LINE_NM = "전체중분류";
  newRowData.CLASS_CD = "0000";
  newRowData.CLASS_NM = "전체소분류";

  // 고정로케이션 상품할당 기준이 하나의 상품만 할당일 경우
  if ($NC.G_VAR.policyVal.CM110 == "1") {
    var searchIndex = $NC.getGridSearchVal(G_GRDT2MASTER, {
      searchKey: ["ZONE_CD", "BANK_CD", "BAY_CD", "LEV_CD"],
      searchVal: [newRowData.ZONE_CD, newRowData.BANK_CD, newRowData.BAY_CD, newRowData.LEV_CD]
    });
    if (searchIndex > -1) {
      $NC.setGridSelectRow(G_GRDT2MASTER, searchIndex);
      alert("고정로케이션이 등록된 로케이션입니다. 등록할 수 없습니다.");
      return;
    }
  }

  // 해당 상품이 고정로케이션에 등록된 상품인지 체크
  var searchIndex = $NC.getGridSearchVal(G_GRDT2MASTER, {
    searchKey: "ITEM_CD",
    searchVal: newRowData.ITEM_CD
  });
  if (searchIndex > -1) {
    $NC.setGridSelectRow(G_GRDT2MASTER, searchIndex);
    var result = confirm("고정로케이션이 등록된 상품입니다. 변경 하시겠습니까?");
    if (!result) {
      return;
    }

    // CRUD가 "U"일 경우는 서버단에서 삭제 후 신규가 수행
    newRowData.CRUD = "U";
  }

  rowItemData.ENTRY_YN = "Y";
  G_GRDT2ITEM.data.updateItem(rowItemData.id, rowItemData);

  G_GRDT2MASTER.data.addItem(newRowData);

  $NC.setGridSelectRow(G_GRDT2MASTER, rowCount);
  // 수정 상태로 변경
  G_GRDT2MASTER.lastRowModified = true;

  _Save();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {

  var CUST_CD = $NC.G_USERINFO.CUST_CD;
  var BU_CD = $NC.G_USERINFO.BU_CD;

  $NP.showOwnBranPopup({
    P_CUST_CD:  CUST_CD,   
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
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

