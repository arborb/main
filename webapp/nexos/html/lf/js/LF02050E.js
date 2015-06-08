/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 현재 액티브된 뷰 및 그리드 정보
    activeView: {
      container: "",
      master: null,
      grdMaster: null,
    },
    FEE_BASE_CD: null,
    KEEP_DIV: null,
    PERIOD_DIV: null,
    CHARGE_UNIT_DIV: null,
    CALC_QTY_DIV: null,
    CALC_AMT_DIV: null,
    CENTER_FUNC_DIV: null,
    BOX_DIV: null
  });

  // ///////////////////////////////////////////////////////////////
  // 정산세부항목
  $NC.serviceCallAndWait("/LF02050E/getDataSet.do", {
    P_QUERY_ID: "LF02050E.RS_SUB1",
    P_QUERY_PARAMS: ""
  }, function(ajaxData) {
    $NC.G_VAR.FEE_BASE_CD = $NC.toArray(ajaxData);
  });

  // 보관구분
  $NC.serviceCallAndWait("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "KEEP_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, function(ajaxData) {
    $NC.G_VAR.KEEP_DIV = $NC.toArray(ajaxData);
  });

  // 기간구분
  $NC.serviceCallAndWait("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "PERIOD_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, function(ajaxData) {
    $NC.G_VAR.PERIOD_DIV = $NC.toArray(ajaxData);
  });

  // 정산단위구분
  $NC.serviceCallAndWait("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "CHARGE_UNIT_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, function(ajaxData) {
    $NC.G_VAR.CHARGE_UNIT_DIV = $NC.toArray(ajaxData);
  });

  // 수량계산구분
  $NC.serviceCallAndWait("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "CALC_QTY_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, function(ajaxData) {
    $NC.G_VAR.CALC_QTY_DIV = $NC.toArray(ajaxData);
  });

  // 금액계산구분
  $NC.serviceCallAndWait("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "CALC_AMT_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, function(ajaxData) {
    $NC.G_VAR.CALC_AMT_DIV = $NC.toArray(ajaxData);
  });

  // 기간구분
  $NC.serviceCallAndWait("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "CENTER_FUNC_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, function(ajaxData) {
    $NC.G_VAR.CENTER_FUNC_DIV = $NC.toArray(ajaxData);
  });

  // 배송BOX
  $NC.serviceCallAndWait("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "BOX_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, function(ajaxData) {
    $NC.G_VAR.BOX_DIV = $NC.toArray(ajaxData);
  });

  // ///////////////////////////////////////////////////////////////

  // 그리드 초기화
  grdMasterInitialize();
  grdDetail1Initialize();
  grdDetail2Initialize();
  grdDetail3Initialize();
  grdDetail4Initialize();

  $NC.G_VAR.activeView.master = "#grdMaster";
  $NC.G_VAR.activeView.grdMaster = G_GRDMASTER;

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

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $("#btnQBu_Cd").click(showUserBuPopup);

  $NC.setInitDatePicker("#dtpQContract_Date", $NC.G_USERINFO.LOGIN_DATE, "F");

  G_GRDMASTER.focused = true;
}

function _OnLoaded() {

  // 스플리터 초기화
  $NC.setInitSplitter("#divSplitterArea1", "h", 150, 150, 700);
  $("#divSplitterArea2").children("div:first").width(900);
  $NC.setInitSplitter("#divSplitterArea2", "v", 800);
}

function _SetResizeOffset() {

  // 화면 리사이즈 Offset 계산
  $NC.G_OFFSET.gridDetail1Height = 220;
  $NC.G_OFFSET.gridDetail3Height = 220;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  var container = $("#divSplitterArea1");
  $NC.resizeContainer(container, clientWidth, clientHeight);

  var splitTopAreaHeight = $("#grdMaster").parent().height();
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, splitTopAreaHeight - $NC.G_LAYOUT.header);

  var splitBottomAreaHeight = $("#grdDetail3").parent().height();
  var splitBottomLeftAreaWidth = $("#grdDetail1").parent().width();
  var splitBottomRightAreaWidth = $("#grdDetail3").parent().width();
  clientHeight = splitBottomAreaHeight;

  // Splitter 높이 조정
  container = $("#divSplitterArea2");

  var height = $NC.G_OFFSET.gridDetail1Height - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail1", splitBottomLeftAreaWidth, height);

  height = splitBottomAreaHeight - $NC.G_OFFSET.gridDetail1Height - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail2", splitBottomLeftAreaWidth, height);

  var height1 = $NC.G_OFFSET.gridDetail3Height - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail3", splitBottomRightAreaWidth, height1);

  // height = splitBottomAreaHeight - $NC.G_OFFSET.gridDetail1Height - $NC.G_LAYOUT.header;
  height1 = splitBottomAreaHeight - $NC.G_OFFSET.gridDetail1Height - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail4", splitBottomRightAreaWidth, height1);
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

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
  case "CONTRACT_DATE":
    if (!$NC.isNull(val)) {
      $NC.setValueDatePicker(view, val, "계약일자를 정확히 입력하십시오.");
    }
    break;
  }

  onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  $NC.setInitGridVar(G_GRDDETAIL1);
  $NC.setInitGridVar(G_GRDDETAIL2);
  $NC.setInitGridVar(G_GRDDETAIL3);

  // 조회조건 체크
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var BU_NM = $NC.getValue("#edtQBu_Nm");
  if ($NC.isNull(BU_NM)) {
    alert("사업부 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var CONTRACT_DATE = $NC.getValue("#dtpQContract_Date");
  if (!$NC.isNull(CONTRACT_DATE)) {
    if (!$NC.isDate(CONTRACT_DATE)) {
      alert("계약일자를 정확히 입력하십시요.");
      $NC.setFocus("#dtpQContract_Date");
      return;
    }
  }

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_CONTRACT_DATE: CONTRACT_DATE
  });

  // 데이터 조회
  $NC.serviceCall("/LF02050E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {
  // grdMaster에 포커스가 있을 경우
  if (G_GRDMASTER.focused) {
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
        $NC.setFocusGrid(G_GRDMASTER, rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
      BU_CD: $NC.getValue("#edtQBu_Cd"),
      FEE_HEAD_CD: null,
      FEE_BASE_CD: null,
      CONTRACT_START_DATE: $NC.getFirstDate($NC.G_USERINFO.LOGIN_DATE),
      KEEP_DIV: "0",
      DEPART_CD: "000000000",
      LINE_CD: "000000000",
      CLASS_CD: "000000000",
      BRAND_CD: null,
      ITEM_CD: "0",
      PERIOD_DIV: null,
      CHARGE_UNIT_DIV: null,
      CHARGE_PRICE: "0",
      EXTRA_PRICE: "0",
      CALC_QTY_DIV: "10",
      CALC_QTY_DIV_F: $NC.getGridComboName(G_GRDMASTER, {
        colFullNameField: "CALC_QTY_DIV_F",
        searchVal: "10",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
      CALC_AMT_DIV: "10",
      CALC_AMT_DIV_F: $NC.getGridComboName(G_GRDMASTER, {
        colFullNameField: "CALC_AMT_DIV_F",
        searchVal: "10",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
      CONTRACT_END_DATE: null,
      CARRIER_CD: "0",
      CENTER_FUNC_DIV: null,
      BOX_DIV: "0",
      REMARK1: null,
      id: $NC.getGridNewRowId(),
      CRUD: "N"
    };
    G_GRDMASTER.data.addItem(newRowData);

    $NC.setGridSelectRow(G_GRDMASTER, rowCount);
    // 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdMasterOnNewRecord({
      row: rowCount,
      rowData: newRowData
    });
    // grdDetail1에 포커스가 있을 경우
  } else if (G_GRDDETAIL1.focused) {
    if (G_GRDMASTER.data.getLength() == 0) {
      alert("기본수수료가 없습니다.\n\n기본수수료를 먼저 등록하십시오.");
      return;
    }
    var groupData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (groupData.CRUD == "N" || groupData.CRUD == "C") {
      alert("신규 기본수수료입니다.\n\n저장 후 보관유형별 수수료를 등록하십시요.");
      return;
    }

    // 현재 수정모드면
    if (G_GRDDETAIL1.view.getEditorLock().isActive()) {
      G_GRDDETAIL1.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (G_GRDDETAIL1.lastRow != null) {
      if (!grdDetail1OnBeforePost(G_GRDDETAIL1.lastRow)) {
        return;
      }
    }

    var rowCount = G_GRDDETAIL1.data.getLength();
    if (rowCount > 0) {
      // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
      var rowData = G_GRDDETAIL1.data.getItem(rowCount - 1);
      if (rowData.CRUD == "N") {
        $NC.setFocusGrid(G_GRDDETAIL1, rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      CENTER_CD: groupData.CENTER_CD,
      BU_CD: groupData.BU_CD,
      FEE_HEAD_CD: groupData.FEE_HEAD_CD,
      FEE_BASE_CD: groupData.FEE_BASE_CD,
      CONTRACT_START_DATE: groupData.CONTRACT_START_DATE,
      KEEP_DIV: null,
      DEPART_CD: "000000000",
      LINE_CD: "000000000",
      CLASS_CD: "000000000",
      BRAND_CD: groupData.BRAND_CD,
      ITEM_CD: "0",
      PERIOD_DIV: groupData.PERIOD_DIV,
      CHARGE_UNIT_DIV: groupData.CHARGE_UNIT_DIV,
      CHARGE_PRICE: "0",
      EXTRA_PRICE: "0",
      CALC_QTY_DIV: groupData.CALC_QTY_DIV,
      CALC_AMT_DIV: groupData.CALC_AMT_DIV,
      CARRIER_CD: "0",
      CENTER_FUNC_DIV: groupData.CENTER_FUNC_DIV,
      BOX_DIV: "0",
      REMARK1: null,
      id: $NC.getGridNewRowId(),
      CRUD: "N"
    };

    G_GRDDETAIL1.data.addItem(newRowData);
    $NC.setGridSelectRow(G_GRDDETAIL1, rowCount);
    // 수정 상태로 변경
    G_GRDDETAIL1.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdDetail1OnNewRecord({
      row: rowCount,
      rowData: newRowData
    });

    // grdDetail2에 포커스가 있을 경우
  } else if (G_GRDDETAIL2.focused) {
    if (G_GRDMASTER.data.getLength() == 0) {
      alert("기본수수료가 없습니다.\n\n기본수수료를 먼저 등록하십시오.");
      return;
    }
    var groupData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (groupData.CRUD == "N" || groupData.CRUD == "C") {
      alert("신규 기본수수료입니다.\n\n저장 후 보관유형별 수수료를 등록하십시요.");
      return;
    }

    // 현재 수정모드면
    if (G_GRDDETAIL2.view.getEditorLock().isActive()) {
      G_GRDDETAIL2.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (G_GRDDETAIL2.lastRow != null) {
      if (!grdDetail2OnBeforePost(G_GRDDETAIL2.lastRow)) {
        return;
      }
    }

    var rowCount = G_GRDDETAIL2.data.getLength();
    if (rowCount > 0) {
      // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
      var rowData = G_GRDDETAIL2.data.getItem(rowCount - 1);
      if (rowData.CRUD == "N") {
        $NC.setFocusGrid(G_GRDDETAIL2, rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      CENTER_CD: groupData.CENTER_CD,
      BU_CD: groupData.BU_CD,
      FEE_HEAD_CD: groupData.FEE_HEAD_CD,
      FEE_BASE_CD: groupData.FEE_BASE_CD,
      CONTRACT_START_DATE: groupData.CONTRACT_START_DATE,
      KEEP_DIV: "0",
      DEPART_CD: null,
      LINE_CD: null,
      CLASS_CD: null,
      BRAND_CD: groupData.BRAND_CD,
      ITEM_CD: "0",
      PERIOD_DIV: groupData.PERIOD_DIV,
      CHARGE_UNIT_DIV: groupData.CHARGE_UNIT_DIV,
      CHARGE_PRICE: "0",
      EXTRA_PRICE: "0",
      CALC_QTY_DIV: groupData.CALC_QTY_DIV,
      CALC_AMT_DIV: groupData.CALC_AMT_DIV,
      REMARK1: null,
      CARRIER_CD: "0",
      CENTER_FUNC_DIV: groupData.CENTER_FUNC_DIV,
      BOX_DIV: "0",
      id: $NC.getGridNewRowId(),
      CRUD: "N"
    };

    G_GRDDETAIL2.data.addItem(newRowData);
    $NC.setGridSelectRow(G_GRDDETAIL2, rowCount);
    // 수정 상태로 변경
    G_GRDDETAIL2.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdDetail2OnNewRecord({
      row: rowCount,
      rowData: newRowData
    });

    // grdDetail3에 포커스가 있을 경우
  } else if (G_GRDDETAIL3.focused) {
    if (G_GRDMASTER.data.getLength() == 0) {
      alert("기본수수료가 없습니다.\n\n기본수수료를 먼저 등록하십시오.");
      return;
    }
    var groupData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (groupData.CRUD == "N" || groupData.CRUD == "C") {
      alert("신규 기본수수료입니다.\n\n저장 후 보관유형별 수수료를 등록하십시요.");
      return;
    }

    // 현재 수정모드면
    if (G_GRDDETAIL3.view.getEditorLock().isActive()) {
      G_GRDDETAIL3.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (G_GRDDETAIL3.lastRow != null) {
      if (!grdDetail3OnBeforePost(G_GRDDETAIL3.lastRow)) {
        return;
      }
    }

    var rowCount = G_GRDDETAIL3.data.getLength();
    if (rowCount > 0) {
      // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
      var rowData = G_GRDDETAIL3.data.getItem(rowCount - 1);
      if (rowData.CRUD == "N") {
        $NC.setFocusGrid(G_GRDDETAIL3, rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      CENTER_CD: groupData.CENTER_CD,
      BU_CD: groupData.BU_CD,
      FEE_HEAD_CD: groupData.FEE_HEAD_CD,
      FEE_BASE_CD: groupData.FEE_BASE_CD,
      CONTRACT_START_DATE: groupData.CONTRACT_START_DATE,
      KEEP_DIV: "0",
      DEPART_CD: "000000000",
      LINE_CD: "000000000",
      CLASS_CD: "000000000",
      BRAND_CD: groupData.BRAND_CD,
      ITEM_CD: "0",
      PERIOD_DIV: groupData.PERIOD_DIV,
      CHARGE_UNIT_DIV: groupData.CHARGE_UNIT_DIV,
      CHARGE_PRICE: "0",
      EXTRA_PRICE: "0",
      CALC_QTY_DIV: groupData.CALC_QTY_DIV,
      CALC_AMT_DIV: groupData.CALC_AMT_DIV,
      REMARK1: null,
      CARRIER_CD: null,
      CENTER_FUNC_DIV: groupData.CENTER_FUNC_DIV,
      BOX_DIV: null,
      id: $NC.getGridNewRowId(),
      CRUD: "N"
    };

    G_GRDDETAIL3.data.addItem(newRowData);
    $NC.setGridSelectRow(G_GRDDETAIL3, rowCount);
    // 수정 상태로 변경
    G_GRDDETAIL3.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdDetail3OnNewRecord({
      row: rowCount,
      rowData: newRowData
    });
  } else {
    if (G_GRDMASTER.data.getLength() == 0) {
      alert("기본수수료가 없습니다.\n\n기본수수료를 먼저 등록하십시오.");
      return;
    }
    var groupData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (groupData.CRUD == "N" || groupData.CRUD == "C") {
      alert("신규 기본수수료입니다.\n\n저장 후 보관유형별 수수료를 등록하십시요.");
      return;
    }

    // 현재 수정모드면
    if (G_GRDDETAIL4.view.getEditorLock().isActive()) {
      G_GRDDETAIL4.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (G_GRDDETAIL4.lastRow != null) {
      if (!grdDetail4OnBeforePost(G_GRDDETAIL4.lastRow)) {
        return;
      }
    }

    var rowCount = G_GRDDETAIL4.data.getLength();
    if (rowCount > 0) {
      // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
      var rowData = G_GRDDETAIL4.data.getItem(rowCount - 1);
      if (rowData.CRUD == "N") {
        $NC.setFocusGrid(G_GRDDETAIL4, rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      CENTER_CD: groupData.CENTER_CD,
      BU_CD: groupData.BU_CD,
      FEE_HEAD_CD: groupData.FEE_HEAD_CD,
      FEE_BASE_CD: groupData.FEE_BASE_CD,
      CONTRACT_START_DATE: groupData.CONTRACT_START_DATE,
      KEEP_DIV: "0",
      DEPART_CD: "000000000",
      LINE_CD: "000000000",
      CLASS_CD: "000000000",
      BRAND_CD: groupData.BRAND_CD,
      ITEM_CD: null,
      PERIOD_DIV: groupData.PERIOD_DIV,
      CHARGE_UNIT_DIV: groupData.CHARGE_UNIT_DIV,
      CHARGE_PRICE: "0",
      EXTRA_PRICE: "0",
      CALC_QTY_DIV: groupData.CALC_QTY_DIV,
      CALC_AMT_DIV: groupData.CALC_AMT_DIV,
      CARRIER_CD: "0",
      CENTER_FUNC_DIV: groupData.CENTER_FUNC_DIV,
      BOX_DIV: "0",
      REMARK1: null,
      id: $NC.getGridNewRowId(),
      CRUD: "N"
    };

    G_GRDDETAIL4.data.addItem(newRowData);
    $NC.setGridSelectRow(G_GRDDETAIL4, rowCount);
    // 수정 상태로 변경
    G_GRDDETAIL4.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdDetail4OnNewRecord({
      row: rowCount,
      rowData: newRowData
    });
  }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }
  if (G_GRDMASTER.focused) {
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
  } else if (G_GRDDETAIL1.focused) {
    // 현재 수정모드면
    if (G_GRDDETAIL1.view.getEditorLock().isActive()) {
      G_GRDDETAIL1.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (G_GRDDETAIL1.lastRow != null) {
      if (!grdDetail1OnBeforePost(G_GRDDETAIL1.lastRow)) {
        return;
      }
    }
  } else if (G_GRDDETAIL2.focused) {
    // 현재 수정모드면
    if (G_GRDDETAIL2.view.getEditorLock().isActive()) {
      G_GRDDETAIL2.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (G_GRDDETAIL2.lastRow != null) {
      if (!grdDetail2OnBeforePost(G_GRDDETAIL2.lastRow)) {
        return;
      }
    }
  } else if (G_GRDDETAIL3.focused) {
    // 현재 수정모드면
    if (G_GRDDETAIL3.view.getEditorLock().isActive()) {
      G_GRDDETAIL3.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (G_GRDDETAIL3.lastRow != null) {
      if (!grdDetail3OnBeforePost(G_GRDDETAIL3.lastRow)) {
        return;
      }
    }
  } else {
    // 현재 수정모드면
    if (G_GRDDETAIL4.view.getEditorLock().isActive()) {
      G_GRDDETAIL4.view.getEditorLock().commitCurrentEdit();
    }
    // 현재 선택된 로우 Validation 체크
    if (G_GRDDETAIL4.lastRow != null) {
      if (!grdDetail4OnBeforePost(G_GRDDETAIL4.lastRow)) {
        return;
      }
    }

  }

  // 기준수수료 수정 데이터
  var saveMasterDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
        P_FEE_BASE_CD: rowData.FEE_BASE_CD,
        P_CONTRACT_START_DATE: rowData.CONTRACT_START_DATE,
        P_KEEP_DIV: rowData.KEEP_DIV,
        P_DEPART_CD: rowData.DEPART_CD,
        P_LINE_CD: rowData.LINE_CD,
        P_CLASS_CD: rowData.CLASS_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_PERIOD_DIV: rowData.PERIOD_DIV,
        P_CHARGE_UNIT_DIV: rowData.CHARGE_UNIT_DIV,
        P_CHARGE_PRICE: rowData.CHARGE_PRICE,
        // P_EXTRA_PRICE: rowData.EXTRA_PRICE,
        P_CALC_QTY_DIV: rowData.CALC_QTY_DIV,
        P_CALC_AMT_DIV: rowData.CALC_AMT_DIV,

        P_CARRIER_CD: "0",
        P_PAY_CHA_DIV: rowData.CENTER_FUNC_DIV,
        P_BOX_DIV: "0",
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveMasterDS.push(saveData);
    }
  }

  // 보관유형별 / 상품그룹별 / 상품별 수수료 수정 데이터
  var saveDetailDS = [ ];
  var rowCount = G_GRDDETAIL1.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAIL1.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
        P_FEE_BASE_CD: rowData.FEE_BASE_CD,
        P_CONTRACT_START_DATE: rowData.CONTRACT_START_DATE,
        P_KEEP_DIV: rowData.KEEP_DIV,
        P_DEPART_CD: rowData.DEPART_CD,
        P_LINE_CD: rowData.LINE_CD,
        P_CLASS_CD: rowData.CLASS_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_PERIOD_DIV: rowData.PERIOD_DIV,
        P_CHARGE_UNIT_DIV: rowData.CHARGE_UNIT_DIV,
        P_CHARGE_PRICE: rowData.CHARGE_PRICE,
        // P_EXTRA_PRICE: rowData.EXTRA_PRICE,
        P_CALC_QTY_DIV: rowData.CALC_QTY_DIV,
        P_CALC_AMT_DIV: rowData.CALC_AMT_DIV,
        P_CARRIER_CD: "0",
        P_PAY_CHA_DIV: rowData.CENTER_FUNC_DIV,
        P_BOX_DIV: "0",
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveDetailDS.push(saveData);
    }
  }
  rowCount = G_GRDDETAIL2.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAIL2.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
        P_FEE_BASE_CD: rowData.FEE_BASE_CD,
        P_CONTRACT_START_DATE: rowData.CONTRACT_START_DATE,
        P_KEEP_DIV: rowData.KEEP_DIV,
        P_DEPART_CD: rowData.DEPART_CD,
        P_LINE_CD: rowData.LINE_CD,
        P_CLASS_CD: rowData.CLASS_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_PERIOD_DIV: rowData.PERIOD_DIV,
        P_CHARGE_UNIT_DIV: rowData.CHARGE_UNIT_DIV,
        P_CHARGE_PRICE: rowData.CHARGE_PRICE,
        // P_EXTRA_PRICE: rowData.EXTRA_PRICE,
        P_CALC_QTY_DIV: rowData.CALC_QTY_DIV,
        P_CALC_AMT_DIV: rowData.CALC_AMT_DIV,
        P_CARRIER_CD: "0",
        P_PAY_CHA_DIV: rowData.CENTER_FUNC_DIV,
        P_BOX_DIV: "0",
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveDetailDS.push(saveData);
    }
  }
  rowCount = G_GRDDETAIL3.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAIL3.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
        P_FEE_BASE_CD: rowData.FEE_BASE_CD,
        P_CONTRACT_START_DATE: rowData.CONTRACT_START_DATE,
        P_KEEP_DIV: rowData.KEEP_DIV,
        P_DEPART_CD: rowData.DEPART_CD,
        P_LINE_CD: rowData.LINE_CD,
        P_CLASS_CD: rowData.CLASS_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_PERIOD_DIV: rowData.PERIOD_DIV,
        P_CHARGE_UNIT_DIV: rowData.CHARGE_UNIT_DIV,
        P_CHARGE_PRICE: rowData.CHARGE_PRICE,
        // P_EXTRA_PRICE: rowData.EXTRA_PRICE,
        P_CALC_QTY_DIV: rowData.CALC_QTY_DIV,
        P_CALC_AMT_DIV: rowData.CALC_AMT_DIV,
        P_CARRIER_CD: rowData.CARRIER_CD,
        P_PAY_CHA_DIV: rowData.CENTER_FUNC_DIV,
        P_BOX_DIV: rowData.BOX_DIV,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveDetailDS.push(saveData);
    }
  }

  rowCount = G_GRDDETAIL4.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAIL4.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
        P_FEE_BASE_CD: rowData.FEE_BASE_CD,
        P_CONTRACT_START_DATE: rowData.CONTRACT_START_DATE,
        P_KEEP_DIV: rowData.KEEP_DIV,
        P_DEPART_CD: rowData.DEPART_CD,
        P_LINE_CD: rowData.LINE_CD,
        P_CLASS_CD: rowData.CLASS_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_PERIOD_DIV: rowData.PERIOD_DIV,
        P_CHARGE_UNIT_DIV: rowData.CHARGE_UNIT_DIV,
        P_CHARGE_PRICE: rowData.CHARGE_PRICE,
        // P_EXTRA_PRICE: rowData.EXTRA_PRICE,
        P_CALC_QTY_DIV: rowData.CALC_QTY_DIV,
        P_CALC_AMT_DIV: rowData.CALC_AMT_DIV,
        P_CARRIER_CD: rowData.CARRIER_CD,
        P_PAY_CHA_DIV: rowData.CENTER_FUNC_DIV,
        P_BOX_DIV: rowData.BOX_DIV,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveDetailDS.push(saveData);
    }
  }
  if (saveMasterDS.length > 0 || saveDetailDS.length > 0) {
    $NC.serviceCall("/LF02050E/save.do", {
      P_DS_MASTER: $NC.getParams(saveMasterDS),
      P_DS_DETAIL: $NC.getParams(saveDetailDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  if (G_GRDMASTER.focused) {

    if (G_GRDMASTER.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    var result = confirm("사업부별 기준수수료를 삭제 하시겠습니까?");
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
          $NC.setGridSelectRow(G_GRDMASTER, 0);
        }
      } else {
        rowData.CRUD = "D";
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
        _Save();
      }
    }
  } else if (G_GRDDETAIL1.focused) {

    if (G_GRDDETAIL1.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    var result = confirm("보관유형별 수수료기준을 삭제 하시겠습니까?");
    if (result) {
      var rowData = G_GRDDETAIL1.data.getItem(G_GRDDETAIL1.lastRow);

      // 신규 데이터일 경우 그냥 삭제
      if (rowData.CRUD === "C" || rowData.CRUD === "N") {
        // 마지막 선택 Row 수정 상태 복원
        G_GRDDETAIL1.lastRowModified = false;

        G_GRDDETAIL1.data.deleteItem(rowData.id);
        // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
        if (G_GRDDETAIL1.lastRow > 1) {
          $NC.setGridSelectRow(G_GRDDETAIL1, G_GRDDETAIL1.lastRow - 1);
        } else {
          $NC.setGridSelectRow(G_GRDDETAIL1, 0);
        }
      } else {
        rowData.CRUD = "D";
        G_GRDDETAIL1.data.updateItem(rowData.id, rowData);
        _Save();
      }
    }
  } else if (G_GRDDETAIL2.focused) {

    if (G_GRDDETAIL2.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    var result = confirm("상품그룹별 수수료기준을 삭제 하시겠습니까?");
    if (result) {
      var rowData = G_GRDDETAIL2.data.getItem(G_GRDDETAIL2.lastRow);

      // 신규 데이터일 경우 그냥 삭제
      if (rowData.CRUD === "C" || rowData.CRUD === "N") {
        // 마지막 선택 Row 수정 상태 복원
        G_GRDDETAIL2.lastRowModified = false;

        G_GRDDETAIL2.data.deleteItem(rowData.id);
        // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
        if (G_GRDDETAIL2.lastRow > 1) {
          $NC.setGridSelectRow(G_GRDDETAIL2, G_GRDDETAIL2.lastRow - 1);
        } else {
          $NC.setGridSelectRow(G_GRDDETAIL2, 0);
        }
      } else {
        rowData.CRUD = "D";
        G_GRDDETAIL2.data.updateItem(rowData.id, rowData);
        _Save();
      }
    }
  } else if (G_GRDDETAIL3.focused) {

    if (G_GRDDETAIL3.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    var result = confirm("운송사 수수료기준을 삭제 하시겠습니까?");
    if (result) {
      var rowData = G_GRDDETAIL3.data.getItem(G_GRDDETAIL3.lastRow);

      // 신규 데이터일 경우 그냥 삭제
      if (rowData.CRUD === "C" || rowData.CRUD === "N") {
        // 마지막 선택 Row 수정 상태 복원
        G_GRDDETAIL3.lastRowModified = false;

        G_GRDDETAIL3.data.deleteItem(rowData.id);
        // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
        if (G_GRDDETAIL3.lastRow > 1) {
          $NC.setGridSelectRow(G_GRDDETAIL3, G_GRDDETAIL3.lastRow - 1);
        } else {
          $NC.setGridSelectRow(G_GRDDETAIL3, 0);
        }
      } else {
        rowData.CRUD = "D";
        G_GRDDETAIL3.data.updateItem(rowData.id, rowData);
        _Save();
      }
    }
  } else {

    if (G_GRDDETAIL4.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    var result = confirm("상품별 수수료기준을 삭제 하시겠습니까?");
    if (result) {
      var rowData = G_GRDDETAIL4.data.getItem(G_GRDDETAIL3.lastRow);

      // 신규 데이터일 경우 그냥 삭제
      if (rowData.CRUD === "C" || rowData.CRUD === "N") {
        // 마지막 선택 Row 수정 상태 복원
        G_GRDDETAIL4.lastRowModified = false;

        G_GRDDETAIL4.data.deleteItem(rowData.id);
        // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
        if (G_GRDDETAIL4.lastRow > 1) {
          $NC.setGridSelectRow(G_GRDDETAIL4, G_GRDDETAIL3.lastRow - 1);
        } else {
          $NC.setGridSelectRow(G_GRDDETAIL4, 0);
        }
      } else {
        rowData.CRUD = "D";
        G_GRDDETAIL4.data.updateItem(rowData.id, rowData);
        _Save();
      }
    }
  }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: ["FEE_BASE_CD", "CONTRACT_START_DATE"],
    isCancel: true
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL1, {
    selectKey: "KEEP_DIV",
    isCancel: true
  });
  var lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDDETAIL2, {
    selectKey: ["BRAND_CD", "DEPART_CD", "LINE_CD", "CLASS_CD"],
    isCancel: true
  });
  var lastKeyVal4 = $NC.getGridLastKeyVal(G_GRDDETAIL3, {
    selectKey: "CARRIER_CD",
    isCancel: true
  });
  var lastKeyVal5 = $NC.getGridLastKeyVal(G_GRDDETAIL3, {
    selectKey: ["BRAND_CD", "ITEM_CD"],
    isCancel: true
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL1.lastKeyVal = lastKeyVal2;
  G_GRDDETAIL2.lastKeyVal = lastKeyVal3;
  G_GRDDETAIL3.lastKeyVal = lastKeyVal4;
  G_GRDDETAIL4.lastKeyVal = lastKeyVal5;
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

  // 전역 변수 값 초기화
  $NC.clearGridData(G_GRDMASTER);
  $NC.clearGridData(G_GRDDETAIL1);
  $NC.clearGridData(G_GRDDETAIL2);
  $NC.clearGridData(G_GRDDETAIL3);
  $NC.clearGridData(G_GRDDETAIL4);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "위탁사코드",
    minWidth: 100,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdMasterOnPopup,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "위탁사명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "CENTER_FUNC_DIV_F",
    field: "CENTER_FUNC_DIV_F",
    name: "구분",
    minWidth: 50,
    editor: Slick.Editors.ComboBox,
    editorOptions: {
      codeField: "CENTER_FUNC_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      data: $NC.G_VAR.CENTER_FUNC_DIV,
      isKeyField: true
    },
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "FEE_HEAD_CD",
    field: "FEE_HEAD_CD",
    name: "정산그룹코드",
    minWidth: 60,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdMasterOnPopup,
      isKeyField: true
    },
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "FEE_HEAD_NM",
    field: "FEE_HEAD_NM",
    name: "정산그룹명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "FEE_BASE_CD",
    field: "FEE_BASE_CD",
    name: "정산항목",
    minWidth: 60,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdMasterOnPopup,
      isKeyField: true
    },
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "FEE_BASE_NM",
    field: "FEE_BASE_NM",
    name: "정산항목명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "PERIOD_DIV_F",
    field: "PERIOD_DIV_F",
    name: "기간구분",
    minWidth: 120,
    editor: Slick.Editors.ComboBox,
    editorOptions: {
      codeField: "PERIOD_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      data: $NC.G_VAR.PERIOD_DIV,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "CHARGE_UNIT_DIV_F",
    field: "CHARGE_UNIT_DIV_F",
    name: "단위구분",
    minWidth: 120,
    editor: Slick.Editors.ComboBox,
    editorOptions: {
      codeField: "CHARGE_UNIT_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      data: $NC.G_VAR.CHARGE_UNIT_DIV,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "CHARGE_PRICE",
    field: "CHARGE_PRICE",
    name: "기준단가",
    minWidth: 60,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  /*
  $NC.setGridColumn(columns, {
    id: "EXTRA_PRICE",
    field: "EXTRA_PRICE",
    name: "할증단가",
    minWidth: 60,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  */
  $NC.setGridColumn(columns, {
    id: "CALC_QTY_DIV_F",
    field: "CALC_QTY_DIV_F",
    name: "수량계산구분",
    minWidth: 90,
    editor: Slick.Editors.ComboBox,
    editorOptions: {
      codeField: "CALC_QTY_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      data: $NC.G_VAR.CALC_QTY_DIV,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "CALC_AMT_DIV_F",
    field: "CALC_AMT_DIV_F",
    name: "금액계산구분",
    minWidth: 90,
    editor: Slick.Editors.ComboBox,
    editorOptions: {
      codeField: "CALC_AMT_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      data: $NC.G_VAR.CALC_AMT_DIV,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "CONTRACT_START_DATE",
    field: "CONTRACT_START_DATE",
    name: "계약시작일자",
    minWidth: 100,
    cssClass: "align-center",
    editor: Slick.Editors.Date,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 180,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LF02050E.RS_MASTER",
    sortCol: "BRAND_CD",
    gridOptions: options
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
  $("#grdMaster").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDMASTER.focused) {
      return;
    }
    G_GRDMASTER.focused = true;
    G_GRDDETAIL1.focused = false;
    G_GRDDETAIL2.focused = false;
    G_GRDDETAIL3.focused = false;

    // 보관유형별 수수료 Post 처리
    if (G_GRDDETAIL1.view.getEditorLock().isActive()) {
      G_GRDDETAIL1.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL1.lastRow != null) {
        if (!grdDetail1OnBeforePost(G_GRDDETAIL1.lastRow)) {
          $NC.setFocusGrid(G_GRDDETAIL1, G_GRDDETAIL1.lastRow, G_GRDDETAIL1.view.getColumnIndex("KEEP_DIV_F"), true);
        }
      }
    }

    // 상품그룹별 수수료 Post 처리
    if (G_GRDDETAIL2.view.getEditorLock().isActive()) {
      G_GRDDETAIL2.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL2.lastRow != null) {
        if (!grdDetail2OnBeforePost(G_GRDDETAIL2.lastRow)) {
          $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("DEPART_CD"), true);
        }
      }
    }

    // 상품별 수수료 Post 처리
    if (G_GRDDETAIL3.view.getEditorLock().isActive()) {
      G_GRDDETAIL3.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL3.lastRow != null) {
        if (!grdDetail3OnBeforePost(G_GRDDETAIL3.lastRow)) {
          $NC.setFocusGrid(G_GRDDETAIL3, G_GRDDETAIL3.lastRow, G_GRDDETAIL3.view.getColumnIndex("CARRIER_CD"), true);
        }
      }
    }

    // 상품별 수수료 Post 처리
    if (G_GRDDETAIL4.view.getEditorLock().isActive()) {
      G_GRDDETAIL4.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL4.lastRow != null) {
        if (!grdDetail4OnBeforePost(G_GRDDETAIL4.lastRow)) {
          $NC.setFocusGrid(G_GRDDETAIL4, G_GRDDETAIL4.lastRow, G_GRDDETAIL4.view.getColumnIndex("ITEM_CD"), true);
        }
      }
    }
  });
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
  var rowData = G_GRDMASTER.data.getItem(row);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL4);
  $NC.setInitGridVar(G_GRDDETAIL3);
  $NC.setInitGridVar(G_GRDDETAIL2);
  $NC.setInitGridVar(G_GRDDETAIL1);

  if (rowData.CRUD == "C" || rowData.CRUD == "N") {
    onGetDetail1({
      data: null
    });
    onGetDetail2({
      data: null
    });
    onGetDetail3({
      data: null
    });

    onGetDetail4({
      data: null
    });
  } else {
    /* 보관유형별 수수료 */
    // 파라메터 세팅
    G_GRDDETAIL1.queryParams = $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_BRAND_CD: rowData.BRAND_CD,
      P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
      P_FEE_BASE_CD: rowData.FEE_BASE_CD,
      P_CONTRACT_START_DATE: rowData.CONTRACT_START_DATE
    });
    // 데이터 조회
    $NC.serviceCall("/LF02050E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL1), onGetDetail1);

    /* 상품그룹별 수수료 */
    // 파라메터 세팅
    G_GRDDETAIL2.queryParams = $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_BRAND_CD: rowData.BRAND_CD,
      P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
      P_FEE_BASE_CD: rowData.FEE_BASE_CD,
      P_CONTRACT_START_DATE: rowData.CONTRACT_START_DATE
    });
    // 데이터 조회
    $NC.serviceCall("/LF02050E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL2), onGetDetail2);

    /* 상품별 수수료 */
    // 파라메터 세팅
    G_GRDDETAIL3.queryParams = $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_BRAND_CD: rowData.BRAND_CD,
      P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
      P_FEE_BASE_CD: rowData.FEE_BASE_CD,
      P_CONTRACT_START_DATE: rowData.CONTRACT_START_DATE
    });
    // 데이터 조회
    $NC.serviceCall("/LF02050E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL3), onGetDetail3);

    /* 상품별 수수료 */
    // 파라메터 세팅
    G_GRDDETAIL4.queryParams = $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_BRAND_CD: rowData.BRAND_CD,
      P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
      P_FEE_BASE_CD: rowData.FEE_BASE_CD,
      P_CONTRACT_START_DATE: rowData.CONTRACT_START_DATE
    });
    // 데이터 조회
    $NC.serviceCall("/LF02050E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL4), onGetDetail4);

  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdMasterOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "CENTER_FUNC_DIV_F" && args.column.field !== "BRAND_CD" && args.column.field !== "FEE_HEAD_CD" && args.column.field !== "FEE_BASE_CD"
      && args.column.field !== "CONTRACT_START_DATE") {
    return true;
  }

  var rowData = G_GRDMASTER.data.getItem(args.row);
  if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
    if (args.column.field == "FEE_HEAD_CD") {
      return false;
    }
    if (args.column.field == "FEE_BASE_CD") {
      return false;
    }
    if (args.column.field == "BRAND_CD") {
      return false;
    }
    if (args.column.field == "CENTER_FUNC_DIV_F") {
      return false;
    }
  }

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "BRAND_CD" && args.column.field !== "CONTRACT_START_DATE") {
    return true;
  }
  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "FEE_BASE_CD" && args.column.field !== "FEE_BASE_CD"
      && args.column.field !== "CONTRACT_START_DATE") {
    return true;
  }

  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      return false;
    }
  }
  return true;
}

function grdMasterOnCellChange(e, args) {

  var rowData = args.item;

  switch (G_GRDMASTER.view.getColumnField(args.cell)) {
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.BRAND_CD)) {
      P_QUERY_PARAMS = {
        P_CUST_CD: $NC.G_USERINFO.CUST_CD,
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_OWN_BRAND_CD: rowData.BRAND_CD
      };
      O_RESULT_DATA = $NP.getOwnBrand_lfInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBran_lfPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup, onOwnBrandPopup);
    }
    return;
  case "FEE_HEAD_CD":
    if ($NC.isNull(rowData.CENTER_FUNC_DIV_F)) {
      alert("구분코드를 먼저 선택하시기 바랍니다.");
      rowData.FEE_HEAD_CD = "";
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("CENTER_FUNC_DIV_F"), true,
          true);
      return;
    }
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];

    if (!$NC.isNull(rowData.FEE_HEAD_CD)) {
      P_QUERY_PARAMS = {
        P_CUST_CD: $NC.G_USERINFO.CUST_CD,
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_OWN_BRAND_CD: rowData.BRAND_CD
      };
      O_RESULT_DATA = $NP.getFee_Head_CdInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onHeadPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showFee_Head_CdPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onHeadPopup, onHeadPopup);
    }
    return;
  case "FEE_BASE_CD":
    if ($NC.isNull(rowData.FEE_HEAD_CD)) {
      alert("정산그룹을 먼저 선택하시기 바랍니다.");
      rowData.FEE_HEAD_CD = "";
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("FEE_HEAD_CD"), true, true);
      return;
    }
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.FEE_BASE_CD)) {
      P_QUERY_PARAMS = {
        P_CUST_CD: $NC.G_USERINFO.CUST_CD,
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_OWN_BRAND_CD: rowData.BRAND_CD
      };
      O_RESULT_DATA = $NP.getFee_Base_CdInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBasePopup(O_RESULT_DATA[0]);
    } else {
      $NP.showFee_Base_CdPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBasePopup, onBasePopup);
    }
    return;

  }

  if (args.cell === G_GRDMASTER.view.getColumnIndex("CONTRACT_START_DATE")) {
    rowData.CONTRACT_START_DATE = $NC.getFirstDate(rowData.CONTRACT_START_DATE);
  } else if (args.cell === G_GRDMASTER.view.getColumnIndex("CHARGE_PRICE")) {

    rowData.CHARGE_PRICE = rowData.CHARGE_PRICE;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

function grdMasterOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDMASTER, args.row, G_GRDMASTER.view.getColumnIndex("FEE_BASE_CD_F"), true);
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
    // 정산항목, 정산세부항목, 계약시작일자
    if ($NC.isNull(rowData.FEE_BASE_CD) || $NC.isNull(rowData.CONTRACT_START_DATE)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.FEE_BASE_CD)) {
      alert("정산세부항목을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("FEE_BASE_CD_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CONTRACT_START_DATE)) {
      alert("계약시작일자을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("CONTRACT_START_DATE"), true);
      return false;
    }
    if ($NC.isNull(rowData.PERIOD_DIV)) {
      alert("기간구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("PERIOD_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CHARGE_UNIT_DIV)) {
      alert("단위구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("CHARGE_UNIT_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CHARGE_PRICE)) {
      alert("기준단가를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("CHARGE_PRICE"), true);
      return false;
    }
    if ($NC.isNull(rowData.EXTRA_PRICE)) {
      alert("할증단가를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("EXTRA_PRICE"), true);
      return false;
    }
    if ($NC.isNull(rowData.CALC_QTY_DIV)) {
      alert("수량계산구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("CALC_QTY_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CALC_AMT_DIV)) {
      alert("금액계산구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("CALC_AMT_DIV_F"), true);
      return false;
    }

  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdDetail1OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "KEEP_DIV_F",
    field: "KEEP_DIV_F",
    name: "보관구분",
    minWidth: 120,
    editor: Slick.Editors.ComboBox,
    editorOptions: {
      codeField: "KEEP_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      data: $NC.G_VAR.KEEP_DIV,
      isKeyField: true
    }
  });

  $NC.setGridColumn(columns, {
    id: "CHARGE_PRICE",
    field: "CHARGE_PRICE",
    name: "기준단가",
    minWidth: 60,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 80,
    width: 180,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetail1Initialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail1", {
    columns: grdDetail1OnGetColumns(),
    queryId: "LF02050E.RS_DETAIL1",
    sortCol: "KEEP_DIV_F",
    gridOptions: options
  });
  G_GRDDETAIL1.view.onSelectedRowsChanged.subscribe(grdDetail1OnAfterScroll);
  G_GRDDETAIL1.view.onBeforeEditCell.subscribe(grdDetail1OnBeforeEditCell);
  G_GRDDETAIL1.view.onCellChange.subscribe(grdDetail1OnCellChange);
  $("#grdDetail1").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDDETAIL1.focused) {
      return;
    }
    G_GRDMASTER.focused = false;
    G_GRDDETAIL1.focused = true;
    G_GRDDETAIL2.focused = false;
    G_GRDDETAIL3.focused = false;
    G_GRDDETAIL4.focused = false;

    // 기준 수수료 Post 처리
    if (G_GRDMASTER.view.getEditorLock().isActive()) {
      G_GRDMASTER.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDMASTER.lastRow != null) {
        if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
          G_GRDMASTER.view.getCanvasNode.focus();
        }
      }
    }

    // 상품그룹별 수수료 Post 처리
    if (G_GRDDETAIL2.view.getEditorLock().isActive()) {
      G_GRDDETAIL2.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL2.lastRow != null) {
        if (!grdDetail2OnBeforePost(G_GRDDETAIL2.lastRow)) {
          G_GRDDETAIL2.view.getCanvasNode.focus();
        }
      }
    }

    // 상품별 수수료 Post 처리
    if (G_GRDDETAIL3.view.getEditorLock().isActive()) {
      G_GRDDETAIL3.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL3.lastRow != null) {
        if (!grdDetail3OnBeforePost(G_GRDDETAIL3.lastRow)) {
          G_GRDDETAIL3.view.getCanvasNode.focus();
        }
      }
    }
  });

  $("#grdDetail1").height(200);
}

function grdDetail1OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL1.lastRow != null) {
    if (row == G_GRDDETAIL1.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
    if (!grdDetail1OnBeforePost(G_GRDDETAIL1.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail1", row + 1);
}

function grdDetail1OnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "KEEP_DIV_F") {
    return true;
  }
  var rowData = G_GRDDETAIL1.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      return false;
    }
  }
  return true;
}

function grdDetail1OnCellChange(e, args) {

  var rowData = args.item;

  if (args.cell === G_GRDDETAIL1.view.getColumnIndex("CHARGE_PRICE")) {
    if (rowData.CHARGE_PRICE > rowData.EXTRA_PRICE) {
      rowData.EXTRA_PRICE = rowData.CHARGE_PRICE;
    }
  } else if (args.cell === G_GRDDETAIL1.view.getColumnIndex("EXTRA_PRICE")) {
    if (rowData.CHARGE_PRICE > rowData.EXTRA_PRICE) {
      alert("할증단가가 기준단가보다 작습니다. 확인하십시요.");
      $NC.setFocusGrid(G_GRDDETAIL1, args.row, G_GRDDETAIL1.view.getColumnIndex("EXTRA_PRICE"), true);
    }
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL1.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL1.lastRowModified = true;
}

function grdDetail1OnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL1, args.row, G_GRDDETAIL1.view.getColumnIndex("BRAND_CD"), true);
}

function grdDetail1OnBeforePost(row) {

  if (!G_GRDDETAIL1.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAIL1.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.KEEP_DIV)) {
      G_GRDDETAIL1.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL1, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.KEEP_DIV)) {
      alert("정산항목을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL1, row);
      $NC.setFocusGrid(G_GRDDETAIL1, G_GRDDETAIL1.lastRow, G_GRDDETAIL1.view.getColumnIndex("KEEP_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.PERIOD_DIV)) {
      alert("기간구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL1, row);
      $NC.setFocusGrid(G_GRDDETAIL1, G_GRDDETAIL1.lastRow, G_GRDDETAIL1.view.getColumnIndex("PERIOD_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CHARGE_UNIT_DIV)) {
      alert("단위구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL1, row);
      $NC.setFocusGrid(G_GRDDETAIL1, G_GRDDETAIL1.lastRow, G_GRDDETAIL1.view.getColumnIndex("CHARGE_UNIT_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CHARGE_PRICE)) {
      alert("기준단가를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL1, row);
      $NC.setFocusGrid(G_GRDDETAIL1, G_GRDDETAIL1.lastRow, G_GRDDETAIL1.view.getColumnIndex("CHARGE_PRICE"), true);
      return false;
    }
    if ($NC.isNull(rowData.EXTRA_PRICE)) {
      alert("할증단가를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL1, row);
      $NC.setFocusGrid(G_GRDDETAIL1, G_GRDDETAIL1.lastRow, G_GRDDETAIL1.view.getColumnIndex("EXTRA_PRICE"), true);
      return false;
    }
    if ($NC.isNull(rowData.CALC_QTY_DIV)) {
      alert("수량계산구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL1, row);
      $NC.setFocusGrid(G_GRDDETAIL1, G_GRDDETAIL1.lastRow, G_GRDDETAIL1.view.getColumnIndex("CALC_QTY_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CALC_AMT_DIV)) {
      alert("금액계산구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL1, row);
      $NC.setFocusGrid(G_GRDDETAIL1, G_GRDDETAIL1.lastRow, G_GRDDETAIL1.view.getColumnIndex("CALC_AMT_DIV_F"), true);
      return false;
    }

  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL1.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdDetail2OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DEPART_CD",
    field: "DEPART_CD",
    name: "대분류코드",
    minWidth: 90,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdDetail2OnPopup,
      isKeyField: true
    },
    cssClass: "align-center"
  });

  $NC.setGridColumn(columns, {
    id: "DEPART_NM",
    field: "DEPART_NM",
    name: "대분류명",
    minWidth: 100
  });

  $NC.setGridColumn(columns, {
    id: "LINE_CD",
    field: "LINE_CD",
    name: "중분류",
    minWidth: 90,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdDetail2OnPopup,
      isKeyField: true
    },
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LINE_NM",
    field: "LINE_NM",
    name: "중분류명",
    minWidth: 100
  });

  $NC.setGridColumn(columns, {
    id: "CLASS_CD",
    field: "CLASS_CD",
    name: "소분류",
    minWidth: 90,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdDetail2OnPopup,
      isKeyField: true
    },
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CLASS_NM",
    field: "CLASS_NM",
    name: "소분류명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CHARGE_PRICE",
    field: "CHARGE_PRICE",
    name: "기준단가",
    cssClass: "align-right",
    minWidth: 60,
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 80,
    width: 180,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetail2Initialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail2", {
    columns: grdDetail2OnGetColumns(),
    queryId: "LF02050E.RS_DETAIL2",
    sortCol: "DEPART_CD",
    gridOptions: options
  });
  G_GRDDETAIL2.view.onSelectedRowsChanged.subscribe(grdDetail2OnAfterScroll);
  G_GRDDETAIL2.view.onBeforeEditCell.subscribe(grdDetail2OnBeforeEditCell);
  G_GRDDETAIL2.view.onCellChange.subscribe(grdDetail2OnCellChange);
  $("#grdDetail2").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDDETAIL2.focused) {
      return;
    }
    G_GRDMASTER.focused = false;
    G_GRDDETAIL1.focused = false;
    G_GRDDETAIL2.focused = true;
    G_GRDDETAIL3.focused = false;
    G_GRDDETAIL4.focused = false;

    // 기준 수수료 Post 처리
    if (G_GRDMASTER.view.getEditorLock().isActive()) {
      G_GRDMASTER.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDMASTER.lastRow != null) {
        if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
          G_GRDMASTER.view.getCanvasNode.focus();
        }
      }
    }

    // 보관유형별 수수료 Post 처리
    if (G_GRDDETAIL1.view.getEditorLock().isActive()) {
      G_GRDDETAIL1.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL1.lastRow != null) {
        if (!grdDetail1OnBeforePost(G_GRDDETAIL1.lastRow)) {
          G_GRDDETAIL1.view.getCanvasNode.focus();
        }
      }
    }

    // 상품별 수수료 Post 처리
    if (G_GRDDETAIL3.view.getEditorLock().isActive()) {
      G_GRDDETAIL3.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL3.lastRow != null) {
        if (!grdDetail3OnBeforePost(G_GRDDETAIL3.lastRow)) {
          G_GRDDETAIL3.view.getCanvasNode.focus();
        }
      }
    }
  });

  $("#grdDetail2").height(200);
}

function grdDetail2OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL2.lastRow != null) {
    if (row == G_GRDDETAIL2.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
    if (!grdDetail2OnBeforePost(G_GRDDETAIL2.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail2", row + 1);
}

function grdDetail2OnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "DEPART_CD" && args.column.field !== "LINE_CD" && args.column.field !== "CLASS_CD") {
    return true;
  }

  var rowData = G_GRDDETAIL2.data.getItem(args.row);

  if (args.column.field === "LINE_CD") {
    if ($NC.isNull(rowData.DEPART_CD)) {
      return false;
    }
  }
  if (args.column.field === "CLASS_CD") {
    if ($NC.isNull(rowData.LINE_CD)) {
      return false;
    }
  }

  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      return false;
    }
  }
  return true;
}

function grdDetail2OnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDDETAIL3.view.getColumnField(args.cell)) {
  case "DEPART_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.DEPART_CD)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: rowData.BRAND_CD,
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
    if ($NC.isNull(rowData.DEPART_CD)) {
      alert("대분류를 먼저 선택하시기 바랍니다.");
      rowData.LINE_CD = "";
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("DEPART_CD"), true, true);
      return;
    }
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.LINE_CD)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: rowData.BRAND_CD,
        P_DEPART_CD: rowData.DEPART_CD
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
    if ($NC.isNull(rowData.LINE_CD)) {
      alert("중뷴류를 먼저 선택하시기 바랍니다.");
      rowData.CLASS_CD = "";
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("LINE_CD"), true, true);
      return;
    }
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.CLASS_CD)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: rowData.BRAND_CD,
        P_DEPART_CD: rowData.DEPART_CD,
        P_LINE_CD: rowData.LINE_CD
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
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL2.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL2.lastRowModified = true;
}

function grdDetail2OnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL2, args.row, G_GRDDETAIL2.view.getColumnIndex("BRAND_CD_F"), true);
}

function grdDetail2OnBeforePost(row) {

  if (!G_GRDDETAIL2.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAIL2.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.DEPART_CD) || $NC.isNull(rowData.LINE_CD) || $NC.isNull(rowData.CLASS_CD)) {
      G_GRDDETAIL2.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL2, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.DEPART_CD)) {
      alert("상품그룹 대분류를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL2, row);
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("DEPART_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.LINE_CD)) {
      alert("상품그룹 중분류를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL2, row);
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("LINE_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.CLASS_CD)) {
      alert("상품그룹 소분류를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL2, row);
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("CLASS_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.PERIOD_DIV)) {
      alert("기간구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL2, row);
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("PERIOD_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CHARGE_UNIT_DIV)) {
      alert("단위구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL2, row);
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("CHARGE_UNIT_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CHARGE_PRICE)) {
      alert("기준단가를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL2, row);
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("CHARGE_PRICE"), true);
      return false;
    }
    if ($NC.isNull(rowData.EXTRA_PRICE)) {
      alert("할증단가를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL2, row);
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("EXTRA_PRICE"), true);
      return false;
    }
    if ($NC.isNull(rowData.CALC_QTY_DIV)) {
      alert("수량계산구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL2, row);
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("CALC_QTY_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CALC_AMT_DIV)) {
      alert("금액계산구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL2, row);
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("CALC_AMT_DIV_F"), true);
      return false;
    }

  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL2.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdDetail3OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CARRIER_CD",
    field: "CARRIER_CD",
    name: "운송사코드",
    minWidth: 90,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdDetail3OnPopup,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "CARRIER_NM",
    field: "CARRIER_NM",
    name: "운송사명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "BOX_DIV_F",
    field: "BOX_DIV_F",
    name: "배송BOX",
    minWidth: 120,
    editor: Slick.Editors.ComboBox,
    editorOptions: {
      codeField: "BOX_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      data: $NC.G_VAR.BOX_DIV,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "CHARGE_PRICE",
    field: "CHARGE_PRICE",
    name: "기준단가",
    minWidth: 60,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 80,
    width: 180,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetail3Initialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail3", {
    columns: grdDetail3OnGetColumns(),
    queryId: "LF02050E.RS_DETAIL3",
    sortCol: "ITEM_CD",
    gridOptions: options
  });
  G_GRDDETAIL3.view.onSelectedRowsChanged.subscribe(grdDetail3OnAfterScroll);
  G_GRDDETAIL3.view.onBeforeEditCell.subscribe(grdDetail3OnBeforeEditCell);
  G_GRDDETAIL3.view.onCellChange.subscribe(grdDetail3OnCellChange);
  $("#grdDetail3").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDDETAIL3.focused) {
      return;
    }
    G_GRDMASTER.focused = false;
    G_GRDDETAIL1.focused = false;
    G_GRDDETAIL2.focused = false;
    G_GRDDETAIL3.focused = true;
    G_GRDDETAIL4.focused = false;

    // 기준 수수료 Post 처리
    if (G_GRDMASTER.view.getEditorLock().isActive()) {
      G_GRDMASTER.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDMASTER.lastRow != null) {
        if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
          G_GRDMASTER.view.getCanvasNode.focus();
        }
      }
    }

    // 보관유형별 수수료 Post 처리
    if (G_GRDDETAIL1.view.getEditorLock().isActive()) {
      G_GRDDETAIL1.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL1.lastRow != null) {
        if (!grdDetail1OnBeforePost(G_GRDDETAIL1.lastRow)) {
          G_GRDDETAIL1.view.getCanvasNode.focus();
        }
      }
    }

    // 상품그룹별 수수료 Post 처리
    if (G_GRDDETAIL2.view.getEditorLock().isActive()) {
      G_GRDDETAIL2.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL2.lastRow != null) {
        if (!grdDetail2OnBeforePost(G_GRDDETAIL2.lastRow)) {
          G_GRDDETAIL2.view.getCanvasNode.focus();
        }
      }
    }
  });

}

function grdDetail3OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL3.lastRow != null) {
    if (row == G_GRDDETAIL3.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
    if (!grdDetail3OnBeforePost(G_GRDDETAIL3.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail3", row + 1);
}

function grdDetail3OnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "CARRIER_CD" && args.column.field !== "BOX_DIV_F") {
    return true;
  }
  
  
  var rowData = G_GRDDETAIL3.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      return false;
    }
  }
  return true;
}

function grdDetail3OnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDDETAIL3.view.getColumnField(args.cell)) {
  case "CARRIER_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.CARRIER_CD)) {
      P_QUERY_PARAMS = {
        P_CARRIER_CD: rowData.CARRIER_CD,
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
  case "CHARGE_PRICE":
    if (rowData.CHARGE_PRICE > rowData.EXTRA_PRICE) {
      rowData.EXTRA_PRICE = rowData.CHARGE_PRICE;
    }
    break;
  case "EXTRA_PRICE":
    if (rowData.CHARGE_PRICE > rowData.EXTRA_PRICE) {
      alert("할증단가가 기준단가보다 작습니다. 확인하십시요.");
      $NC.setFocusGrid(G_GRDDETAIL3, args.row, G_GRDDETAIL3.view.getColumnIndex("EXTRA_PRICE"), true);
    }
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL3.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL3.lastRowModified = true;
}

function grdDetail3OnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL3, args.row, G_GRDDETAIL3.view.getColumnIndex("ITEM_CD"), true);
}

function grdDetail3OnBeforePost(row) {

  if (!G_GRDDETAIL3.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAIL3.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    // 정산항목, 정산세부항목, 계약시작일자
    if ($NC.isNull(rowData.CARRIER_CD)) {
      G_GRDDETAIL3.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL3, row - 1);
      }
      return true;
    }
  }

  // 일반항목 체크
  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.CARRIER_CD)) {
      alert("상품을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL3, row);
      $NC.setFocusGrid(G_GRDDETAIL3, G_GRDDETAIL3.lastRow, G_GRDDETAIL3.view.getColumnIndex("ITEM_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.PERIOD_DIV)) {
      alert("기간구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL3, row);
      $NC.setFocusGrid(G_GRDDETAIL3, G_GRDDETAIL3.lastRow, G_GRDDETAIL3.view.getColumnIndex("PERIOD_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CHARGE_UNIT_DIV)) {
      alert("단위구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL3, row);
      $NC.setFocusGrid(G_GRDDETAIL3, G_GRDDETAIL3.lastRow, G_GRDDETAIL3.view.getColumnIndex("CHARGE_UNIT_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CHARGE_PRICE)) {
      alert("기준단가를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL3, row);
      $NC.setFocusGrid(G_GRDDETAIL3, G_GRDDETAIL3.lastRow, G_GRDDETAIL3.view.getColumnIndex("CHARGE_PRICE"), true);
      return false;
    }
    if ($NC.isNull(rowData.EXTRA_PRICE)) {
      alert("할증단가를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL3, row);
      $NC.setFocusGrid(G_GRDDETAIL3, G_GRDDETAIL3.lastRow, G_GRDDETAIL3.view.getColumnIndex("EXTRA_PRICE"), true);
      return false;
    }
    if ($NC.isNull(rowData.CALC_QTY_DIV)) {
      alert("수량계산구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL3, row);
      $NC.setFocusGrid(G_GRDDETAIL3, G_GRDDETAIL3.lastRow, G_GRDDETAIL3.view.getColumnIndex("CALC_QTY_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CALC_AMT_DIV)) {
      alert("금액계산구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL3, row);
      $NC.setFocusGrid(G_GRDDETAIL3, G_GRDDETAIL3.lastRow, G_GRDDETAIL3.view.getColumnIndex("CALC_AMT_DIV_F"), true);
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL3.data.updateItem(rowData.id, rowData);
  }
  return true;
}

/*------------------------------------------*/

function grdDetail4OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdDetail4OnPopup,
      isKeyField: true
    }
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
    name: "상품규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "CHARGE_PRICE",
    field: "CHARGE_PRICE",
    name: "기준단가",
    minWidth: 60,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 80,
    width: 180,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetail4Initialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail4", {
    columns: grdDetail4OnGetColumns(),
    queryId: "LF02050E.RS_DETAIL4",
    sortCol: "ITEM_CD",
    gridOptions: options
  });
  G_GRDDETAIL4.view.onSelectedRowsChanged.subscribe(grdDetail4OnAfterScroll);
  G_GRDDETAIL4.view.onBeforeEditCell.subscribe(grdDetail4OnBeforeEditCell);
  G_GRDDETAIL4.view.onCellChange.subscribe(grdDetail4OnCellChange);
  $("#grdDetail4").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDDETAIL4.focused) {
      return;
    }
    G_GRDMASTER.focused = false;
    G_GRDDETAIL1.focused = false;
    G_GRDDETAIL2.focused = false;
    G_GRDDETAIL3.focused = false;
    G_GRDDETAIL4.focused = true;

    // 기준 수수료 Post 처리
    if (G_GRDMASTER.view.getEditorLock().isActive()) {
      G_GRDMASTER.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDMASTER.lastRow != null) {
        if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
          G_GRDMASTER.view.getCanvasNode.focus();
        }
      }
    }

    // 보관유형별 수수료 Post 처리
    if (G_GRDDETAIL1.view.getEditorLock().isActive()) {
      G_GRDDETAIL1.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL1.lastRow != null) {
        if (!grdDetail1OnBeforePost(G_GRDDETAIL1.lastRow)) {
          G_GRDDETAIL1.view.getCanvasNode.focus();
        }
      }
    }

    // 상품그룹별 수수료 Post 처리
    if (G_GRDDETAIL2.view.getEditorLock().isActive()) {
      G_GRDDETAIL2.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL2.lastRow != null) {
        if (!grdDetail2OnBeforePost(G_GRDDETAIL2.lastRow)) {
          G_GRDDETAIL2.view.getCanvasNode.focus();
        }
      }
    }

    // 상품그룹별 수수료 Post 처리
    if (G_GRDDETAIL3.view.getEditorLock().isActive()) {
      G_GRDDETAIL3.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL3.lastRow != null) {
        if (!grdDetail3OnBeforePost(G_GRDDETAIL3.lastRow)) {
          G_GRDDETAIL3.view.getCanvasNode.focus();
        }
      }
    }
  });

}

function grdDetail4OnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL4.lastRow != null) {
    if (row == G_GRDDETAIL4.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
    if (!grdDetail4OnBeforePost(G_GRDDETAIL4.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail4", row + 1);
}

function grdDetail4OnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "ITEM_CD") {
    return true;
  }
  var rowData = G_GRDDETAIL4.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      return false;
    }
  }
  return true;
}

function grdDetail4OnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDDETAIL4.view.getColumnField(args.cell)) {
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.ITEM_CD)) {
      P_QUERY_PARAMS = {
        P_BU_CD: rowData.BU_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_VIEW_DIV: "1",
        P_DEPART_CD: "%",
        P_LINE_CD: "%",
        P_CLASS_CD: "%"
      };
      O_RESULT_DATA = $NP.getItemInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onGridItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onGridItemPopup, onGridItemPopup);
    }
    return;
  case "CHARGE_PRICE":
    if (rowData.CHARGE_PRICE > rowData.EXTRA_PRICE) {
      rowData.EXTRA_PRICE = rowData.CHARGE_PRICE;
    }
    break;
  case "EXTRA_PRICE":
    if (rowData.CHARGE_PRICE > rowData.EXTRA_PRICE) {
      alert("할증단가가 기준단가보다 작습니다. 확인하십시요.");
      $NC.setFocusGrid(G_GRDDETAIL4, args.row, G_GRDDETAIL4.view.getColumnIndex("EXTRA_PRICE"), true);
    }
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL4.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL4.lastRowModified = true;
}

function grdDetail4OnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL4, args.row, G_GRDDETAIL4.view.getColumnIndex("ITEM_CD"), true);
}

function grdDetail4OnBeforePost(row) {

  if (!G_GRDDETAIL4.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAIL4.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    // 정산항목, 정산세부항목, 계약시작일자
    if ($NC.isNull(rowData.ITEM_CD)) {
      G_GRDDETAIL4.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL4, row - 1);
      }
      return true;
    }
  }

  // 일반항목 체크
  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.ITEM_NM)) {
      alert("상품을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL4, row);
      $NC.setFocusGrid(G_GRDDETAIL4, G_GRDDETAIL4.lastRow, G_GRDDETAIL4.view.getColumnIndex("ITEM_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.PERIOD_DIV)) {
      alert("기간구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL4, row);
      $NC.setFocusGrid(G_GRDDETAIL4, G_GRDDETAIL4.lastRow, G_GRDDETAIL4.view.getColumnIndex("PERIOD_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CHARGE_UNIT_DIV)) {
      alert("단위구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL4, row);
      $NC.setFocusGrid(G_GRDDETAIL4, G_GRDDETAIL4.lastRow, G_GRDDETAIL4.view.getColumnIndex("CHARGE_UNIT_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CHARGE_PRICE)) {
      alert("기준단가를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL4, row);
      $NC.setFocusGrid(G_GRDDETAIL4, G_GRDDETAIL4.lastRow, G_GRDDETAIL4.view.getColumnIndex("CHARGE_PRICE"), true);
      return false;
    }
    if ($NC.isNull(rowData.EXTRA_PRICE)) {
      alert("할증단가를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL4, row);
      $NC.setFocusGrid(G_GRDDETAIL4, G_GRDDETAIL4.lastRow, G_GRDDETAIL4.view.getColumnIndex("EXTRA_PRICE"), true);
      return false;
    }
    if ($NC.isNull(rowData.CALC_QTY_DIV)) {
      alert("수량계산구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL4, row);
      $NC.setFocusGrid(G_GRDDETAIL4, G_GRDDETAIL4.lastRow, G_GRDDETAIL4.view.getColumnIndex("CALC_QTY_DIV_F"), true);
      return false;
    }
    if ($NC.isNull(rowData.CALC_AMT_DIV)) {
      alert("금액계산구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL4, row);
      $NC.setFocusGrid(G_GRDDETAIL4, G_GRDDETAIL4.lastRow, G_GRDDETAIL4.view.getColumnIndex("CALC_AMT_DIV_F"), true);
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL4.data.updateItem(rowData.id, rowData);
  }
  return true;
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

function onGridItemPopup(resultInfo) {

  var rowData = G_GRDDETAIL4.data.getItem(G_GRDDETAIL4.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.ITEM_CD = resultInfo.ITEM_CD;
    rowData.ITEM_NM = resultInfo.ITEM_NM;
    rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;

    rowData.BRAND_CD = resultInfo.BRAND_CD;
    rowData.BRAND_NM = resultInfo.BRAND_NM;

    focusCol = G_GRDDETAIL4.view.getColumnIndex("CHARGE_UNIT_DIV_F");
  } else {
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";
    rowData.ITEM_SPEC = "";

    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";

    focusCol = G_GRDDETAIL4.view.getColumnIndex("ITEM_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL4.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL4.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL4, G_GRDDETAIL4.lastRow, focusCol, true, true);
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["FEE_BASE_CD", "CONTRACT_START_DATE"],
        selectVal: G_GRDMASTER.lastKeyVal,
        activeCell: true
      });
    }
  } else {
    // 전역 변수 값 초기화
    // 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL1);
    onGetDetail1({
      data: null
    });
    $NC.setInitGridVar(G_GRDDETAIL2);
    onGetDetail2({
      data: null
    });
    $NC.setInitGridVar(G_GRDDETAIL3);
    onGetDetail3({
      data: null
    });
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

function onGetDetail1(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL1, ajaxData);

  if (G_GRDDETAIL1.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL1.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL1, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL1, {
        selectKey: "KEEP_DIV",
        selectVal: G_GRDDETAIL1.lastKeyVal,
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail1", 0, 0);
  }
}

function onGetDetail2(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL2, ajaxData);

  if (G_GRDDETAIL2.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL2.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL2, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL2, {
        selectKey: ["BRAND_CD", "DEPART_CD", "LINE_CD", "CLASS_CD"],
        selectVal: G_GRDDETAIL2.lastKeyVal,
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail2", 0, 0);
  }
}

function onGetDetail3(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL3, ajaxData);

  if (G_GRDDETAIL3.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL3.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL3, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL3, {
        selectKey: ["BRAND_CD", "ITEM_CD"],
        selectVal: G_GRDDETAIL3.lastKeyVal,
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail3", 0, 0);
  }
}

function onGetDetail4(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL4, ajaxData);

  if (G_GRDDETAIL4.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL4.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL4, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL4, {
        selectKey: ["BRAND_CD", "CARRIER_CD"],
        selectVal: G_GRDDETAIL4.lastKeyVal,
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail4", 0, 0);
  }
}

function onSave(ajaxData) {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: ["FEE_BASE_CD", "CONTRACT_START_DATE"]
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL1, {
    selectKey: "KEEP_DIV"
  });
  var lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDDETAIL2, {
    selectKey: ["BRAND_CD", "DEPART_CD", "LINE_CD", "CLASS_CD"]
  });
  var lastKeyVal4 = $NC.getGridLastKeyVal(G_GRDDETAIL3, {
    selectKey: ["BRAND_CD", "ITEM_CD"]
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL1.lastKeyVal = lastKeyVal2;
  G_GRDDETAIL2.lastKeyVal = lastKeyVal3;
  G_GRDDETAIL3.lastKeyVal = lastKeyVal4;
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
  if (G_GRDMASTER.focused) {
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    if (rowData.CRUD === "D") {
      rowData.CRUD = "U";
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
      // 마지막 선택 Row 수정 상태로 변경
      G_GRDMASTER.lastRowModified = true;
    }
  } else if (G_GRDDETAIL1.focused) {
    var rowData = G_GRDDETAIL1.data.getItem(G_GRDDETAIL1.lastRow);

    if (rowData.CRUD === "D") {
      rowData.CRUD = "U";
      G_GRDDETAIL1.data.updateItem(rowData.id, rowData);
      // 마지막 선택 Row 수정 상태로 변경
      G_GRDDETAIL1.lastRowModified = true;
    }
  } else if (G_GRDDETAIL2.focused) {
    var rowData = G_GRDDETAIL2.data.getItem(G_GRDDETAIL2.lastRow);

    if (rowData.CRUD === "D") {
      rowData.CRUD = "U";
      G_GRDDETAIL2.data.updateItem(rowData.id, rowData);
      // 마지막 선택 Row 수정 상태로 변경
      G_GRDDETAIL2.lastRowModified = true;
    }
  } else {
    var rowData = G_GRDDETAIL3.data.getItem(G_GRDDETAIL3.lastRow);

    if (rowData.CRUD === "D") {
      rowData.CRUD = "U";
      G_GRDDETAIL3.data.updateItem(rowData.id, rowData);
      // 마지막 선택 Row 수정 상태로 변경
      G_GRDDETAIL3.lastRowModified = true;
    }
  }
}

/**
 * 그리드의 위탁사 팝업 처리
 */
function grdMasterOnPopup(e, args) {

  var rowData = args.item;

  switch (args.column.field) {
  case "BRAND_CD":
    $NP.showOwnBran_lfPopup({
      P_CUST_CD: $NC.G_USERINFO.CUST_CD,
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_OWN_BRAND_CD: rowData.BRAND_CD
    }, onOwnBrandPopup, function() {
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("BRAND_CD"), true, true);
    });
    break;
  case "FEE_HEAD_CD":
    if ($NC.isNull(rowData.CENTER_FUNC_DIV_F)) {
      alert("구분코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("CENTER_FUNC_DIV_F"), true,
          true);
      return;
    }
    $NP.showFee_Head_CdPopup({
      P_CENTER_FUNC_DIV: rowData.CENTER_FUNC_DIV,
      P_FEE_HEAD_CD: rowData.FEE_HEAD_CD
    }, onHeadPopup, function() {
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("FEE_HEAD_CD"), true, true);
    });
    break;
  case "FEE_BASE_CD":
    if ($NC.isNull(rowData.FEE_HEAD_CD)) {
      alert("정산그룹을 먼저 선택하시기 바랍니다.");
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("FEE_HEAD_CD"), true, true);
      return;
    }
    $NP.showFee_Base_CdPopup({
      P_FEE_HEAD_CD: rowData.FEE_HEAD_CD,
      P_FEE_BASE_CD: rowData.FEE_BASE_CD
    }, onBasePopup, function() {
      $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, G_GRDMASTER.view.getColumnIndex("FEE_BASE_CD"), true, true);
    });
    break;
  }
}

/**
 * 그리드에서 위탁사 선택/취소 했을 경우 처리
 * 
 * @param seletedRowData
 */
function onOwnBrandPopup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.BRAND_CD = resultInfo.OWN_BRAND_CD;
    rowData.BRAND_NM = resultInfo.OWN_BRAND_NM;

    focusCol = G_GRDMASTER.view.getColumnIndex("CENTER_FUNC_DIV_F");
  } else {
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    focusCol = G_GRDMASTER.view.getColumnIndex("BRAND_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL1.lastRowModified = true;
  $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}

/**
 * 그리드에서 위탁사 선택/취소 했을 경우 처리
 * 
 * @param seletedRowData
 */
function onHeadPopup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.FEE_HEAD_CD = resultInfo.FEE_HEAD_CD;
    rowData.FEE_HEAD_NM = resultInfo.FEE_HEAD_NM;

    focusCol = G_GRDMASTER.view.getColumnIndex("FEE_BASE_CD");
  } else {
    rowData.FEE_HEAD_CD = "";
    rowData.FEE_HEAD_NM = "";
    focusCol = G_GRDMASTER.view.getColumnIndex("FEE_HEAD_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
  $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}

function onBasePopup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.FEE_BASE_CD = resultInfo.FEE_BASE_CD;
    rowData.FEE_BASE_NM = resultInfo.FEE_BASE_NM;

    focusCol = G_GRDMASTER.view.getColumnIndex("PERIOD_DIV_F");
  } else {
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    focusCol = G_GRDMASTER.view.getColumnIndex("FEE_BASE_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL1.lastRowModified = true;
  $NC.setFocusGrid(G_GRDMASTER, G_GRDMASTER.lastRow, focusCol, true, true);
}

/**
 * 그리드의 상품 팝업 처리
 */
function grdDetail3OnPopup(e, args) {

  var rowData = args.item;

  switch (args.column.field) {
  case "CARRIER_CD":
    $NP.showCarrierPopup({
      P_CARRIER_CD: rowData.CARRIER_CD,
      P_VIEW_DIV: "1"

    }, onCarrierPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL3, G_GRDDETAIL3.lastRow, G_GRDDETAIL3.view.getColumnIndex("CARRIER_CD"), true, true);
    });
    break;
  }
}

function onCarrierPopup(resultInfo) {

  var rowData = G_GRDDETAIL3.data.getItem(G_GRDDETAIL3.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.CARRIER_CD = resultInfo.CARRIER_CD;
    rowData.CARRIER_NM = resultInfo.CARRIER_NM;

    focusCol = G_GRDDETAIL3.view.getColumnIndex("BOX_DIV_F");
  } else {
    rowData.CARRIER_CD = "";
    rowData.CARRIER_NM = "";

    focusCol = G_GRDDETAIL3.view.getColumnIndex("CARRIER_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL3.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL3.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL3, G_GRDDETAIL3.lastRow, focusCol, true, true);
}

/**
 * 그리드의 상품 팝업 처리
 */
function grdDetail2OnPopup(e, args) {

  var rowData = args.item;

  switch (args.column.field) {
  case "DEPART_CD":
    $NP.showItemGroupDepartPopup({
      P_BRAND_CD: rowData.BRAND_CD,

    }, onItemGroupDepartPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("CARRIER_CD"), true, true);
    });
    break;
  case "LINE_CD":
    if ($NC.isNull(rowData.DEPART_CD)) {
      alert("대분류를 먼저 선택하시기 바랍니다.");
      rowData.LINE_CD = "";
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("DEPART_CD"), true, true);
      return;
    }
    $NP.showItemGroupLinePopup({
      P_BRAND_CD: rowData.BRAND_CD,
      P_DEPART_CD: rowData.DEPART_CD

    }, onItemGroupLinePopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("CARRIER_CD"), true, true);
    });
    break;
  case "CLASS_CD":
    if ($NC.isNull(rowData.LINE_CD)) {
      alert("중뷴류를 먼저 선택하시기 바랍니다.");
      rowData.CLASS_CD = "";
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("LINE_CD"), true, true);
      return;
    }
    $NP.showItemGroupClassPopup({
      P_BRAND_CD: rowData.BRAND_CD,
      P_DEPART_CD: rowData.DEPART_CD,
      P_LINE_CD: rowData.LINE_CD

    }, onItemGroupClassPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, G_GRDDETAIL2.view.getColumnIndex("CARRIER_CD"), true, true);
    });
    break;
  }
}

function onItemGroupDepartPopup(resultInfo) {

  var rowData = G_GRDDETAIL2.data.getItem(G_GRDDETAIL2.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.DEPART_CD = resultInfo.DEPART_CD;
    rowData.DEPART_NM = resultInfo.DEPART_NM;

    focusCol = G_GRDDETAIL2.view.getColumnIndex("LINE_CD");
  } else {
    rowData.DEPART_CD = "";
    rowData.DEPART_NM = "";

    focusCol = G_GRDDETAIL2.view.getColumnIndex("DEPART_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL2.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL2.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, focusCol, true, true);
}

function onItemGroupLinePopup(resultInfo) {

  var rowData = G_GRDDETAIL2.data.getItem(G_GRDDETAIL2.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.LINE_CD = resultInfo.LINE_CD;
    rowData.LINE_NM = resultInfo.LINE_NM;

    focusCol = G_GRDDETAIL2.view.getColumnIndex("CLASS_CD");
  } else {
    rowData.LINE_CD = "";
    rowData.LINE_NM = "";

    focusCol = G_GRDDETAIL2.view.getColumnIndex("LINE_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL2.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL2.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, focusCol, true, true);
}

function onItemGroupClassPopup(resultInfo) {

  var rowData = G_GRDDETAIL2.data.getItem(G_GRDDETAIL2.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.CLASS_CD = resultInfo.CLASS_CD;
    rowData.CLASS_NM = resultInfo.CLASS_NM;

    focusCol = G_GRDDETAIL2.view.getColumnIndex("CHARGE_PRICE");
  } else {
    rowData.CLASS_CD = "";
    rowData.CLASS_NM = "";

    focusCol = G_GRDDETAIL2.view.getColumnIndex("CLASS_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL2.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL2.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL2, G_GRDDETAIL2.lastRow, focusCol, true, true);
}

/**
 * 그리드의 상품 팝업 처리
 */
function grdDetail4OnPopup(e, args) {

  var rowData = args.item;

  switch (args.column.field) {
  case "ITEM_CD":
    $NP.showItemPopup({
      P_BU_CD: rowData.BU_CD,
      P_BRAND_CD: rowData.BRAND_CD,
      P_ITEM_CD: "%",
      P_VIEW_DIV: "1",
      P_DEPART_CD: "%",
      P_LINE_CD: "%",
      P_CLASS_CD: "%"
    }, onGridItemPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL4, G_GRDDETAIL4.lastRow, G_GRDDETAIL4.view.getColumnIndex("ITEM_CD"), true, true);
    });
    break;
  }
}

function onGridItemPopup(resultInfo) {

  var rowData = G_GRDDETAIL4.data.getItem(G_GRDDETAIL4.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.ITEM_CD = resultInfo.ITEM_CD;
    rowData.ITEM_NM = resultInfo.ITEM_NM;
    rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;

    rowData.BRAND_CD = resultInfo.BRAND_CD;
    rowData.BRAND_NM = resultInfo.BRAND_NM;

    focusCol = G_GRDDETAIL4.view.getColumnIndex("CHARGE_PRICE");
  } else {
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";
    rowData.ITEM_SPEC = "";

    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";

    focusCol = G_GRDDETAIL4.view.getColumnIndex("ITEM_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL4.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL4.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL4, G_GRDDETAIL4.lastRow, focusCol, true, true);
}
