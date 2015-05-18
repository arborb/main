/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null,
    // 체크할 정책 값
    policyVal: {
      CM120: "", // 로케이션표시정책
      CM121: "", // 로케이션 존 길이
      CM122: "", // 로케이션 행 길이
      CM123: "", // 로케이션 열 길이
      CM124: "", // 로케이션 단 길이
    },
    CONSTS_DIV_LOC: "_____"// '_' 다섯개
  });

  
  $NC.setInitDatePicker("#dtpInvest_Date");
  $NC.setInitDatePicker("#dtpInvest_Start_Date");
  $NC.setInitDatePicker("#dtpInvest_End_Date");
  $NC.setInitDatePicker("#dtpQInout_Date1");
  $NC.setInitDatePicker("#dtpQInout_Date2");

  $NC.setValue("#edtItem_Lot", "00");
  $NC.setInitDatePicker("#dtpValid_Date", null, "N"); // 유통기한

  // 버튼 클릭 이벤트 연결
  $("#btnManager_Id").click(showManagerPopup);
  $("#btnQLocation").click(showQLocationPopup); // 로케이션 검색 버튼

  $("#btnLocation").click(showLocationPopup); // 로케이션 검색 버튼
  $("#btnKItem_Cd").click(showKItemPopup);

  $("#btnClose").click(onCancel);
  $("#btnSave").click(_Save);

  $("#btnAddData").click(_New); // 자료추가 버튼 클릭
  $("#btnEntryDelete").click(_Delete); // 그리드 행 삭제버튼
  $("#btnQBrand_Cd").click(showQBrandPopup);
  $("#btnDBrand_Cd").click(showDBrandPopup);
  // 그리드 초기화
  grdDetailInitialize();

  $("#grpKeyBrandInfo").hide();
  $("#grpConditionBrandInfo").show();
  $("#grpDisplayBrandInfo").hide();

  $("#grpInoutInfo").hide(); // 입출고정보
  $("#grpLocationInfo").hide(); // 로케이션정보
  $("#grpItemGroupInfo").hide(); // 상품그룹정보
  $("#grpItemInfo").hide(); // 상품&로케이션
  $("#grpItemAddInfo").hide();

  $("#grpItemStateInfo").show(); // 상품&로케이션

  // 로케이션 정책
  setPolicyValInfo();
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.masterViewHeight = 245;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_OFFSET.masterViewHeight
      + $NC.G_LAYOUT.nonClientHeight + $NC.G_LAYOUT.margin1 + $NC.G_LAYOUT.border1;

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, $NC.G_OFFSET.masterViewHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * 자료추가 클릭후 하단 그리드에 데이터 표시처리
 */
function onGetDetail(ajaxData) {

  var isFristData = false;
  var lastRow = G_GRDDETAIL.lastRow;
  var length = 0;
  if (G_GRDDETAIL.data.getLength() == 0) {
    isFristData = true;
  }

  var resultRows = $NC.toArray(ajaxData);
  var resultRowCount = resultRows.length;
  var searchKey = ["LOCATION_CD", "BRAND_CD", "ITEM_CD", "ITEM_STATE", "ITEM_LOT", "VALID_DATE", "BATCH_NO"];

  G_GRDDETAIL.data.beginUpdate();
  try {
    var resultData = "";
    for ( var i = 0; i < resultRowCount; i++) {
      resultData = resultRows[i];
      resultData.CRUD = "C";
      resultData.LINE_NO = "";
      resultData.INVEST_QTY = resultData.STOCK_QTY;

      var searchVal = [resultData.LOCATION_CD, resultData.BRAND_CD, resultData.ITEM_CD, resultData.ITEM_STATE,
          resultData.ITEM_LOT, resultData.VALID_DATE, resultData.BATCH_NO];
      if ($NC.getGridSearchVal(G_GRDDETAIL, {
        searchKey: searchKey,
        searchVal: searchVal
      }) === -1) {
        resultData.id = $NC.getGridNewRowId();
        G_GRDDETAIL.data.addItem(resultData);
      }
    }
  } finally {
    G_GRDDETAIL.data.endUpdate();
  }
  length = G_GRDDETAIL.data.getLength();
  if (isFristData) {
    lastRow = 0;
    if (G_GRDDETAIL.data.getLength() > 0) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      length = 0;
    }
  }
  $NC.setGridDisplayRows("#grdDetail", lastRow + 1, length);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
  $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);

  // 마스터 disable여부 설정
  var isDisable = false;

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {

    var INVEST_DATE = $NC.getValue("#dtpInvest_Date");
    $NC.setValue("#edtManager_Id", $NC.G_USERINFO.USER_ID);
    $NC.setValue("#edtManager_Nm", $NC.G_USERINFO.USER_NM);
    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      INVEST_DATE: INVEST_DATE,
      INVEST_NO: "",
      INVEST_DIV: "",
      INVEST_START_DATE: INVEST_DATE,
      INVEST_END_DATE: INVEST_DATE,
      MANAGER_ID: $NC.G_USERINFO.USER_ID,
      MANAGER_NM: $NC.G_USERINFO.USER_NM,
      REMARK1: "",
      CRUD: "C"
    };

    $NC.setFocus("#edtRemark1");
  } else {
    // 마스터 disable여부 설정
    isDisable = true;
    // 예정 -> 등록, 등록 수정
    var CRUD = "R";
    // 마스터 데이터 세팅
    var masterDS = $NC.G_VAR.userData.P_MASTER_DS;
    $NC.setValue("#dtpInvest_Date", masterDS.INVEST_DATE);
    $NC.setValue("#edtInvest_No", masterDS.INVEST_NO);
    $NC.setValue("#dtpInvest_Start_Date", masterDS.INVEST_START_DATE);
    $NC.setValue("#dtpInvest_End_Date", masterDS.INVEST_END_DATE);

    $NC.setValue("#edtManager_Id", masterDS.MANAGER_ID);
    $NC.setValue("#edtManager_Nm", masterDS.MANAGER_NM);

    $NC.setValue("#edtRemark1", masterDS.REMARK1);

    $("#grpInoutInfo").hide(); // 입출고정보
    $("#grpLocationInfo").hide(); // 로케이션정보
    $("#grpItemGroupInfo").hide(); // 상품그룹정보
    $("#grpItemInfo").hide(); // 상품&로케이션
    $("#grpItemStateInfo").hide(); // 상품&로케이션

    $NC.G_VAR.masterData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      INVEST_DATE: masterDS.INVEST_DATE,
      INVEST_NO: masterDS.INVEST_NO,
      INVEST_DIV: null,
      INVEST_DIV_F: null,
      INVEST_START_DATE: null,
      INVEST_END_DATE: null,
      MANAGER_ID: null,
      MANAGER_NM: null,
      REMARK1: masterDS.REMARK1,
      CRUD: CRUD
    };

    // 디테일 데이터 세팅
    var detailDS = $NC.G_VAR.userData.P_DETAIL_DS;
    var rowData;
    G_GRDDETAIL.data.beginUpdate();
    try {
      for ( var row in detailDS) {
        rowData = detailDS[row];
        var newRowData = {
          CENTER_CD: rowData.CENTER_CD,
          BU_CD: rowData.BU_CD,
          INVEST_DATE: rowData.INVEST_DATE,
          INVEST_NO: rowData.INVEST_NO,
          LINE_NO: rowData.LINE_NO,
          LOCATION_CD: rowData.LOCATION_CD,
          BRAND_CD: rowData.BRAND_CD,
          BRAND_NM: rowData.BRAND_NM,
          ITEM_CD: rowData.ITEM_CD,
          ITEM_NM: rowData.ITEM_NM,
          ITEM_SPEC: rowData.ITEM_SPEC,
          ITEM_STATE: rowData.ITEM_STATE,
          ITEM_STATE_F: rowData.ITEM_STATE_F,
          ITEM_LOT: rowData.ITEM_LOT,
          VALID_DATE: rowData.VALID_DATE,
          BATCH_NO: rowData.BATCH_NO,
          STOCK_QTY: rowData.STOCK_QTY,
          INVEST_QTY: rowData.INVEST_QTY,
          id: $NC.getGridNewRowId(),
          CRUD: CRUD
        };
        G_GRDDETAIL.data.addItem(newRowData);
      }
    } finally {
      G_GRDDETAIL.data.endUpdate();
    }
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INVEST_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "1",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboInvest_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.INVEST_DIV = $NC.getValue("#cboInvest_Div");
      } else {
        $NC.setValue("#cboInvest_Div", $NC.G_VAR.userData.P_MASTER_DS.INVEST_DIV);
      }
    }
  });

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
    addAll: true
  });

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "ITEM_STATE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboItem_State",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F"
  });

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMZONE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_ZONE_CD: "%"
    })
  }, {
    selector: "#cboQZone_Cd1",
    codeField: "ZONE_CD",
    fullNameField: "ZONE_CD_F",
    addEmpty: true
  });

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMZONE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_ZONE_CD: "%"
    })
  }, {
    selector: "#cboQZone_Cd2",
    codeField: "ZONE_CD",
    fullNameField: "ZONE_CD_F",
    addEmpty: true
  });

  // 수정일 경우 입력불가 항목 비활성화 처리
  setMasterDisable(isDisable);
}

function setMasterDisable(isDisable) {

  $NC.setEnable("#edtCenter_Cd_F", false);
  $NC.setEnable("#edtBu_Cd", false);
  $NC.setEnable("#edtInvest_No", false);

  // 수정일 경우 입력불가 항목 비활성화 처리
  $NC.setEnable("#dtpInvest_Date", !isDisable);

  $NC.setEnable("#dtpInvest_Start_Date", !isDisable);
  $NC.setEnable("#dtpInvest_End_Date", !isDisable);

  $NC.setEnable("#edtManager_Id", false);
  $NC.setEnable("#edtManager_Nm", false);
  $NC.setEnable("#btnManager_Id", false);

  $NC.setEnable("#cboInvest_Div", true);
  $NC.setEnable("#btnAddData", true);

}

/**
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

  $NC.setPopupCloseAction("CANCEL");
  $NC.onPopupClose();
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

  $NC.setPopupCloseAction("OK");
  $NC.onPopupClose();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

  var id = view.prop("id").substr(3).toUpperCase();
  masterDataOnChange(e, {
    col: id,
    val: val,
    view: view
  });
}

/**
 * 조회
 */
function _Inquiry() {

}

/**
 * 신규
 */
function _New() {

  var CENTER_CD = $NC.G_VAR.userData.P_CENTER_CD;
  var QBRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  switch ($NC.getValue("#cboInvest_Div")) {
  case "1":

    // 전체재고 조회
    var ITEM_STATE = $NC.getValue("#cboQItem_State");

    $NC.serviceCall("/LC04020E/getDataSet.do", {
      P_QUERY_ID: "LC04020E.RS_POP_SUB1",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BRAND_CD: QBRAND_CD,
        P_ITEM_STATE: ITEM_STATE,
        P_POLICY_LC110: $NC.G_VAR.userData.P_POLICY_LC110,
        P_POLICY_LC120: $NC.G_VAR.userData.P_POLICY_LC120,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      })
    }, onGetDetail);
    break;
  case "2":
    // 로케이션별 조회
    var ITEM_STATE = $NC.getValue("#cboQItem_State");

    var ZONE_CD1 = $NC.getValue("#cboQZone_Cd1");
    var BANK_CD1 = $NC.getValue("#edtQBank_Cd1");
    var BAY_CD1 = $NC.getValue("#edtQBay_Cd1");
    var LEV_CD1 = $NC.getValue("#edtQLev_Cd1");

    var ZONE_CD2 = $NC.getValue("#cboQZone_Cd2");
    var BANK_CD2 = $NC.getValue("#edtQBank_Cd2");
    var BAY_CD2 = $NC.getValue("#edtQBay_Cd2");
    var LEV_CD2 = $NC.getValue("#edtQLev_Cd2");

    if ($NC.isNull(ZONE_CD1) && $NC.isNull(BANK_CD1) && $NC.isNull(BAY_CD1) && $NC.isNull(LEV_CD1)
        && $NC.isNull(ZONE_CD2) && $NC.isNull(BANK_CD2) && $NC.isNull(BAY_CD2) && $NC.isNull(LEV_CD2)) {
      alert("검색조건 중 하나는 반드시 입력 하셔야 합니다.");
      return;
    }
    // 로케이션 조회
    $NC.serviceCall("/LC04020E/getDataSet.do", {
      P_QUERY_ID: "LC04020E.RS_POP_SUB2",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BRAND_CD: QBRAND_CD,
        P_ITEM_STATE: ITEM_STATE,
        P_ZONE_CD1: ZONE_CD1,
        P_BANK_CD1: BANK_CD1,
        P_BAY_CD1: BAY_CD1,
        P_LEV_CD1: LEV_CD1,
        P_ZONE_CD2: ZONE_CD2,
        P_BANK_CD2: BANK_CD2,
        P_BAY_CD2: BAY_CD2,
        P_LEV_CD2: LEV_CD2,
        P_POLICY_LC110: $NC.G_VAR.userData.P_POLICY_LC110,
        P_POLICY_LC120: $NC.G_VAR.userData.P_POLICY_LC120,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      })
    }, onGetDetail);
    break;
  case "3":

    // 고정로케이션 조회
    $NC.serviceCall("/LC04020E/getDataSet.do", {
      P_QUERY_ID: "LC04020E.RS_POP_SUB3",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BRAND_CD: QBRAND_CD,
        P_POLICY_LC110: $NC.G_VAR.userData.P_POLICY_LC110,
        P_POLICY_LC120: $NC.G_VAR.userData.P_POLICY_LC120,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      })
    }, onGetDetail);

    break;
  case "9":
    var LOCATION_CD = $NC.getValue("#edtLocation_Cd");
    var BRAND_CD = $NC.getValue("#edtDBrand_Cd");
    var BRAND_NM = $NC.getValue("#edtDBrand_Nm");
    var ITEM_CD = $NC.getValue("#edtKItem_Cd");
    var ITEM_NM = $NC.getValue("#edtKItem_Nm");
    var ITEM_SPEC = $NC.getValue("#edtItem_Sepc");
    var QTY_IN_BOX = $NC.getValue("#edtQty_In_Box");
    var ITEM_STATE = $NC.getValue("#cboItem_State");
    var ITEM_STATE_F = $NC.getValueCombo("#cboItem_State", "F");
    var ITEM_LOT = $NC.getValue("#edtItem_Lot");

    var VALID_DATE = $NC.getValue("#dtpValid_Date");
    var BATCH_NO = $NC.getValue("#edtBatch_No");

    if ($NC.isNull(ITEM_CD)) {
      alert("추가할 상품을 입력하십시오.");
      $NC.setFocus("#edtKItem_Cd", true);
      return;
    }

    if ($NC.isNull(ITEM_STATE)) {
      alert("추가할 상품상태을 입력하십시오.");
      $NC.setFocus("#cboItem_State", true);
      return;
    }

    if ($NC.isNull(ITEM_LOT)) {
      alert("추가할 LOT번호를 입력하십시오.");
      $NC.setFocus("#edtItem_Lot", true);
      return;
    }

    if ($NC.isNull(LOCATION_CD)) {
      alert("추가할 상품 로케이션을 입력하십시오.");
      $NC.setFocus("#edtLocation_Cd", true);
      return;
    }

    var resultData = {};
    resultData.LOCATION_CD = LOCATION_CD;
    resultData.BRAND_CD = BRAND_CD;
    resultData.BRAND_NM = BRAND_NM;
    resultData.ITEM_CD = ITEM_CD;
    resultData.ITEM_STATE = ITEM_STATE;
    resultData.ITEM_LOT = ITEM_LOT;
    resultData.VALID_DATE = VALID_DATE;
    resultData.BATCH_NO = BATCH_NO;
    resultData.ITEM_NM = ITEM_NM;
    resultData.ITEM_SPEC = ITEM_SPEC;
    resultData.ITEM_STATE_F = ITEM_STATE_F;
    resultData.QTY_IN_BOX = QTY_IN_BOX;
    resultData.STOCK_QTY = 0;
    resultData.INVEST_QTY = 0;
    resultData.CRUD = "C";
    resultData.LINE_NO = "";
    resultData.id = $NC.getGridNewRowId();

    G_GRDDETAIL.data.beginUpdate();
    try {

      var searchKey = ["LOCATION_CD", "BRAND_CD", "ITEM_CD", "ITEM_STATE", "ITEM_LOT", "VALID_DATE", "BATCH_NO"];

      var searchVal = [resultData.LOCATION_CD, resultData.BRAND_CD, resultData.ITEM_CD, resultData.ITEM_STATE,
          resultData.ITEM_LOT, resultData.VALID_DATE, resultData.BATCH_NO];
      if ($NC.getGridSearchVal(G_GRDDETAIL, {
        searchKey: searchKey,
        searchVal: searchVal
      }) === -1) {
        G_GRDDETAIL.data.addItem(resultData);
      }
    } finally {
      G_GRDDETAIL.data.endUpdate();
      G_GRDDETAIL.data.refresh();
    }

    $NC.setGridDisplayRows("#grdDetail", 0, G_GRDDETAIL.data.getLength());
    break;
  }
}

/**
 * 저장
 */
function _Save() {

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  // 현재 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }

  var detailDS = [ ];
  var rows = G_GRDDETAIL.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    var GAP_DIV = "";
    if (rowData.CRUD !== "R") {
      if (rowData.STOCK_QTY != rowData.INVEST_QTY) {
        GAP_DIV = "99";
      }
      var saveData = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: '0',
        P_INVEST_DATE: $NC.G_VAR.masterData.INVEST_DATE,
        P_INVEST_NO: $NC.G_VAR.masterData.INVEST_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_LOCATION_CD: rowData.LOCATION_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_VALID_DATE: rowData.VALID_DATE,
        P_BATCH_NO: rowData.BATCH_NO,
        P_STOCK_QTY: rowData.STOCK_QTY,
        P_INVEST_QTY: rowData.INVEST_QTY,
        P_GAP_DIV: GAP_DIV,
        P_CRUD: rowData.CRUD
      };
      detailDS.push(saveData);
    }
  }

  if ($NC.G_VAR.masterData.CRUD === "R" && detailDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/LC04020E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: '0',
      P_INVEST_DATE: $NC.G_VAR.masterData.INVEST_DATE,
      P_INVEST_NO: $NC.G_VAR.masterData.INVEST_NO,
      P_INVEST_DIV: $NC.G_VAR.masterData.INVEST_DIV,
      P_INVEST_START_DATE: $NC.G_VAR.masterData.INVEST_START_DATE,
      P_INVEST_END_DATE: $NC.G_VAR.masterData.INVEST_END_DATE,
      P_MANAGER_ID: $NC.G_VAR.masterData.MANAGER_ID,
      P_REMARK1: $NC.G_VAR.masterData.REMARK1,
      P_CRUD: $NC.G_VAR.masterData.CRUD
    }),
    P_DS_DETAIL: $NC.toJson(detailDS),
    P_PROCESS_CD: $NC.G_VAR.userData.P_PROCESS_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

  // 신규 데이터일 경우 그냥 삭제
  if (rowData.CRUD === "C" || rowData.CRUD === "N") {
    G_GRDDETAIL.data.deleteItem(rowData.id);
  } else {
    rowData.CRUD = "D";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
    G_GRDDETAIL.data.refresh();
  }
  // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
  if (G_GRDDETAIL.lastRow > 1) {
    $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.lastRow - 1);
  } else {
    G_GRDDETAIL.lastRow = null;
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

  // 마지막 선택 Row 수정 상태 복원
  G_GRDDETAIL.lastRowModified = false;
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
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "재고로케이션",
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
    minWidth: 180
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
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "INVEST_QTY",
    field: "INVEST_QTY",
    name: "실사수량",
    minWidth: 80,
    editor: Slick.Editors.Number,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: null,
    sortCol: "ITEM_CD",
    gridOptions: options,
    canExportExcel: false,
    onFilter: grdDetailOnFilter
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

/**
 * 그리드 행 선택 변경 했을 경우
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
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

function grdDetailOnCellChange(e, args) {

  var rowData = args.item;

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
}

function grdDetailOnBeforePost(row) {

  if (!G_GRDDETAIL.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAIL.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  if (!$NC.isNull(rowData.INVEST_QTY)) {
    var INVEST_QTY = Number(rowData.INVEST_QTY);
    if (INVEST_QTY < 0) {
      alert("실사수량은 0보다 작을 수 없습니다.");

      G_GRDDETAIL.data.updateItem(rowData.id, rowData);
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("INVEST_QTY"),
        editMode: true
      });
      return false;
    }
  }
  return true;
}

/**
 * grdDetail 데이터 필터링 이벤트
 */
function grdDetailOnFilter(item) {

  return item.CRUD !== "D";
}

function masterDataOnChange(e, args) {

  switch (args.col) {
  case "MANAGER_ID":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      P_QUERY_PARAMS = {
        P_USER_ID: $NC.getValue("#edtManager_Id"),
        P_CERTIFY_DIV: "%"
      };
      O_RESULT_DATA = $NP.getUserInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onCSUserManagerPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showUserPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onCSUserManagerPopup, onCSUserManagerPopup);
    }
    break;
  case "INVEST_DIV":
    $NC.G_VAR.masterData.INVEST_DIV = args.val;

    switch (args.val) {
    case "1":
      $("#grpKeyBrandInfo").hide();
      $("#grpConditionBrandInfo").show();
      $("#grpDisplayBrandInfo").hide();

      clearBrandInfo();

      $("#grpInoutInfo").hide(); // 입출고정보
      $("#grpLocationInfo").hide(); // 로케이션정보
      $("#grpItemGroupInfo").hide(); // 상품그룹정보
      $("#grpItemInfo").hide(); // 상품&로케이션
      $("#grpItemAddInfo").hide(); // 상품상품추가

      $("#grpItemStateInfo").show(); // 상품&로케이션
      break;
    case "2":
      $("#grpKeyBrandInfo").hide();
      $("#grpConditionBrandInfo").show();
      $("#grpDisplayBrandInfo").hide();

      clearBrandInfo();

      $("#grpInoutInfo").hide(); // 입출고정보
      $("#grpLocationInfo").show(); // 로케이션정보
      $("#grpItemGroupInfo").hide(); // 상품그룹정보
      $("#grpItemInfo").hide(); // 상품&로케이션
      $("#grpItemAddInfo").hide(); // 상품상품추가

      $("#grpItemStateInfo").show(); // 상품&로케이션
      break;
    case "3":
      $("#grpKeyBrandInfo").hide();
      $("#grpConditionBrandInfo").show();
      $("#grpDisplayBrandInfo").hide();

      clearBrandInfo();

      $("#grpInoutInfo").hide(); // 입출고정보
      $("#grpLocationInfo").hide(); // 로케이션정보
      $("#grpItemGroupInfo").hide(); // 상품그룹정보
      $("#grpItemInfo").hide(); // 상품&로케이션
      $("#grpItemAddInfo").hide(); // 상품상품추가

      $("#grpItemStateInfo").hide(); // 상품&로케이션

      break;
    case "9":
      $("#grpKeyBrandInfo").hide();
      $("#grpConditionBrandInfo").hide();
      $("#grpDisplayBrandInfo").show();

      clearBrandInfo();

      $("#grpInoutInfo").hide(); // 입출고정보
      $("#grpLocationInfo").hide(); // 로케이션정보
      $("#grpItemGroupInfo").hide(); // 상품그룹정보
      $("#grpItemInfo").hide(); // 상품&로케이션
      $("#grpItemAddInfo").show(); // 상품상품추가

      $("#grpItemStateInfo").hide(); // 상품&로케이션

      break;
    }
    break;
  case "INVEST_DATE":
    $NC.setValueDatePicker(args.view, args.val, "실사일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.OUTBOUND_DATE = $NC.getValue("#dtpInvest_Date");
    break;
  case "INVEST_START_DATE":
    $NC.setValueDatePicker(args.view, args.val, "실사기간 시작일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.OUTBOUND_DATE = $NC.getValue("#dtpInvest_Start_Date");
    break;
  case "INVEST_END_DATE":
    $NC.setValueDatePicker(args.view, args.val, "실사기간 종료일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.OUTBOUND_DATE = $NC.getValue("#dtpInvest_End_Date");
    break;
  case "REMARK1":
    $NC.G_VAR.masterData.REMARK1 = args.val;
    break;

  }

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }

}

function clearBrandInfo() {
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");
  $NC.setValue("#edtDBrand_Cd");
  $NC.setValue("#edtDBrand_Nm");
}
/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(3).toUpperCase();

  switch (id) {
  case "QDEPART_CD":
    setLineCombo();
    break;
  case "QLINE_CD":
    setClassCombo();
    break;
  case "QCLASS_CD":
    break;
  case "QZONE_CD":
    if ($NC.isNull(val)) {
      $NC.setValue("#edtQZone_Nm");
      break;
    }

    if (val.length !== Number($NC.G_VAR.policyVal.CM121)) {
      alert("로케이션 존코드 길이(" + $NC.G_VAR.policyVal.CM121 + "자리) 를 정확히 입력하여 주십시오 ");
      $NC.setValue("#edtQZone_Cd");
      $NC.setValue("#edtQZone_Nm");
      $NC.setFocus("#edtQZone_Cd", true);
      break;
    }

    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];

    P_QUERY_PARAMS = {
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_ZONE_CD: val,
      P_BANK_CD: "",
      P_BAY_CD: "",
      P_LEV_CD: "",
      P_LOCATION_CD: ""
    };
    O_RESULT_DATA = $NP.getZoneInfo({
      queryParams: P_QUERY_PARAMS
    });

    if (O_RESULT_DATA.length <= 1) {
      onQLocationPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showZonePopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onQLocationPopup, onQLocationPopup);
    }
    break;
  case "QBANK_CD":
    if (!val) {
      break;
    }
    if (val.length !== Number($NC.G_VAR.policyVal.CM122)) {
      alert("로케이션 행코드 길이(" + $NC.G_VAR.policyVal.CM122 + "자리) 를 정확히 입력하여 주십시오 ");
      $NC.setValue("#edtQBank_Cd");
      $NC.setFocus("#edtQBank_Cd", true);
    }
    break;
  case "QBAY_CD":
    if (!val) {
      break;
    }
    if (val.length !== Number($NC.G_VAR.policyVal.CM123)) {
      alert("로케이션 열코드 길이(" + $NC.G_VAR.policyVal.CM123 + "자리) 를 정확히 입력하여 주십시오 ");
      $NC.setValue("#edtQBay_Cd");
      $NC.setFocus("#edtQBay_Cd", true);
    }
    break;
  case "QLEV_CD":
    if (!val) {
      break;
    }
    if (val.length !== Number($NC.G_VAR.policyVal.CM124)) {
      alert("로케이션 단코드 길이(" + $NC.G_VAR.policyVal.CM124 + "자리) 를 정확히 입력하여 주십시오 ");
      $NC.setValue("#edtQLev_Cd");
      $NC.setFocus("#edtQLev_Cd", true);
    }
    break;
  case "QBANK_CD1":
    if (!val) {
      break;
    }
    if (val.length !== Number($NC.G_VAR.policyVal.CM122)) {
      alert("로케이션 행코드 길이(" + $NC.G_VAR.policyVal.CM122 + "자리) 를 정확히 입력하여 주십시오 ");
      $NC.setValue("#edtQBank_Cd1");
      $NC.setFocus("#edtQBank_Cd1", true);
    }
    break;
  case "QBAY_CD1":
    if (!val) {
      break;
    }
    if (val.length !== Number($NC.G_VAR.policyVal.CM123)) {
      alert("로케이션 열코드 길이(" + $NC.G_VAR.policyVal.CM123 + "자리) 를 정확히 입력하여 주십시오 ");
      $NC.setValue("#edtQBay_Cd1");
      $NC.setFocus("#edtQBay_Cd1", true);
    }
    break;
  case "QLEV_CD1":
    if (!val) {
      break;
    }
    if (val.length !== Number($NC.G_VAR.policyVal.CM124)) {
      alert("로케이션 단코드 길이(" + $NC.G_VAR.policyVal.CM124 + "자리) 를 정확히 입력하여 주십시오 ");
      $NC.setValue("#edtQLev_Cd1");
      $NC.setFocus("#edtQLev_Cd1", true);
    }
    break;
  case "QBANK_CD2":
    if (!val) {
      break;
    }
    if (val.length !== Number($NC.G_VAR.policyVal.CM122)) {
      alert("로케이션 행코드 길이(" + $NC.G_VAR.policyVal.CM122 + "자리) 를 정확히 입력하여 주십시오 ");
      $NC.setValue("#edtQBank_Cd2");
      $NC.setFocus("#edtQBank_Cd2", true);
    }
    break;
  case "QBAY_CD2":
    if (!val) {
      break;
    }
    if (val.length !== Number($NC.G_VAR.policyVal.CM123)) {
      alert("로케이션 열코드 길이(" + $NC.G_VAR.policyVal.CM123 + "자리) 를 정확히 입력하여 주십시오 ");
      $NC.setValue("#edtQBay_Cd2");
      $NC.setFocus("#edtQBay_Cd2", true);
    }
    break;
  case "QLEV_CD2":
    if (!val) {
      break;
    }
    if (val.length !== Number($NC.G_VAR.policyVal.CM124)) {
      alert("로케이션 단코드 길이(" + $NC.G_VAR.policyVal.CM124 + "자리) 를 정확히 입력하여 주십시오 ");
      $NC.setValue("#edtQLev_Cd2");
      $NC.setFocus("#edtQLev_Cd2", true);
    }
    break;
  case "QBRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CUST_CD: $NC.G_USERINFO.CUST_CD,
        P_BU_CD: $NC.G_USERINFO.BU_CD,
        P_OWN_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onQBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBranPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onQBrandPopup, onQBrandPopup);
    }
    break;
  case "DBRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CUST_CD: $NC.G_USERINFO.CUST_CD,
        P_BU_CD: $NC.G_USERINFO.BU_CD,
        P_OWN_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onDBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBranPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onDBrandPopup, onDBrandPopup);
    }
    break;
  case "KITEM_CD":
    var BU_CD = $NC.getValue("#edtDBrand_Cd");
    if ($NC.isNull(BU_CD)) {
      alert("브랜드를 입력하십시오.");
      $NC.setValue("#edtKItem_Cd");
      $NC.setFocus("#edtDBrand_Cd");
      return;
    }
    var BRAND_CD = $NC.getValue("#edtDBrand_Cd");
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: val,
        P_VIEW_DIV: "2",
        P_DEPART_CD: "%",
        P_LINE_CD: "%",
        P_CLASS_CD: "%"
      };
      O_RESULT_DATA = $NP.getItemInfo({
        queryId: "WC.POP_CMBRANDITEM",
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onKItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        queryId: "WC.POP_CMBRANDITEM",
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onKItemPopup, onKItemPopup);
    }
    break;
  case "LOCATION_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
        P_ZONE_CD: "",
        P_BANK_CD: "",
        P_BAY_CD: "",
        P_LEV_CD: "",
        P_LOCATION_CD: val
      };
      O_RESULT_DATA = $NP.getLocationInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onLocationPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showLocationPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onLocationPopup, onLocationPopup);
    }
    break;
  case "QINOUT_DATE1":
    $NC.setValueDatePicker(view, val, "기간 시작일자를 정확히 입력하십시오.");
    break;
  case "QINOUT_DATE2":
    $NC.setValueDatePicker(view, val, "기간 종료일자를 정확히 입력하십시오.");
    break;
  }

}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  onClose();
}

function setPolicyValInfo() {

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    $NC.G_VAR.policyVal[POLICY_CD] = "";
  }

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCallAndWait("/LC04020E/callSP.do", {
      P_QUERY_ID: "WF.GET_POLICY_VAL",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
        P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
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

function showManagerPopup() {

  $NP.showUserPopup({
    queryParams: {
      P_USER_ID: "%",
      P_CERTIFY_DIV: "%"
    }
  }, onCSUserManagerPopup, function() {
    $NC.setFocus("#edtManager_Id", true);
  });
}

function onCSUserManagerPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtManager_Id", resultInfo.USER_ID);
    $NC.setValue("#edtManager_Nm", resultInfo.USER_NM);
    $NC.G_VAR.masterData.MANAGER_ID = resultInfo.USER_ID;
  } else {
    $NC.setValue("#edtManager_Id");
    $NC.setValue("#edtManager_Nm");
    $NC.G_VAR.masterData.MANAGER_ID = "";
  }

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
  $NC.setFocus("#edtRemark1", true);
}

/**
 * 대분류 combobox 설정
 */
function setDepartCombo() {

  $NC.setValue("#cboQDepart_Cd");
  // 대분류 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_ITEMGROUP_DEPART",
    P_QUERY_PARAMS: $NC.getParams({
      P_BRAND_CD: $NC.getValue("#edtKBrand_Cd", true),
    })
  }, {
    selector: "#cboQDepart_Cd",
    codeField: "DEPART_CD",
    fullNameField: "DEPART_CD_F",
    onComplete: function() {
      $NC.setValue("#cboQDepart_Cd");
    }
  });

  $NC.setValue("#cboQLine_Cd");
  $NC.setValue("#cboQClass_Cd");
}

/**
 * 중분류 combobox 설정
 */
function setLineCombo(LINE_CD) {

  $NC.setValue("#cboQLine_Cd");

  var DEPART_CD = $NC.getValue("#cboQDepart_Cd");
  if ($NC.isNull(DEPART_CD)) return;

  // 중분류 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_ITEMGROUP_LINE",
    P_QUERY_PARAMS: $NC.getParams({
      P_BRAND_CD: $NC.getValue("#edtKBrand_Cd", true),
      P_DEPART_CD: DEPART_CD
    })
  }, {
    selector: "#cboQLine_Cd",
    codeField: "LINE_CD",
    fullNameField: "LINE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboQLine_Cd");
    }
  });

  $NC.setValue("#cboQClass_Cd");
}

/**
 * 소분류 combobox 설정
 */
function setClassCombo(LINE_CD, CLASS_CD) {

  $NC.setValue("#cboQClass_Cd");

  var DEPART_CD = $NC.getValue("#cboQDepart_Cd");
  var LINE_CD = $NC.getValue("#cboQLine_Cd");

  if ($NC.isNull(DEPART_CD) || $NC.isNull(LINE_CD)) return;

  // 소분류 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_ITEMGROUP_CLASS",
    P_QUERY_PARAMS: $NC.getParams({
      P_BRAND_CD: $NC.getValue("#edtKBrand_Cd", true),
      P_DEPART_CD: DEPART_CD,
      P_LINE_CD: LINE_CD
    })
  }, {
    selector: "#cboQClass_Cd",
    codeField: "CLASS_CD",
    fullNameField: "CLASS_CD_F",
    onComplete: function() {
      $NC.setValue("#cboQClass_Cd");
    }
  });
}

/**
 * 로케이션 검색 이미지 클릭
 */
function showQLocationPopup() {

  $NP.showLocationPopup({
    P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
    P_ZONE_CD: "",
    P_BANK_CD: "",
    P_BAY_CD: "",
    P_LEV_CD: "",
    P_LOCATION_CD: ""
  }, onQLocationPopup, function() {
    $NC.setFocus("#edtQZone_Cd", true);
  });
}

function onQLocationPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQZone_Cd", resultInfo.ZONE_CD);
    $NC.setValue("#edtQZone_Nm", resultInfo.ZONE_NM);
    $NC.setValue("#edtQBank_Cd", resultInfo.BANK_CD);
    $NC.setValue("#edtQBay_Cd", resultInfo.BAY_CD);
    $NC.setValue("#edtQLev_Cd", resultInfo.LEV_CD);
  } else {
    $NC.setValue("#edtQZone_Cd");
    $NC.setValue("#edtQZone_Nm");
    $NC.setFocus("#edtQZone_Cd", true);
  }
}

/**
 * 로케이션 검색 이미지 클릭
 */
function showLocationPopup() {

  // 현재 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }

  $NP.showLocationPopup({
    P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
    P_ZONE_CD: "",
    P_BANK_CD: "",
    P_BAY_CD: "",
    P_LEV_CD: "",
    P_LOCATION_CD: "%"
  }, onLocationPopup, function() {
    $NC.setFocus("#edtZone_Cd", true);
  });
}

function onLocationPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtLocation_Cd", resultInfo.LOCATION_CD);
  } else {
    $NC.setValue("#edtLocation_Cd");
    $NC.setFocus("#edtLocation_Cd", true);
  }
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showDBrandPopup() {

  $NP.showOwnBranPopup({
    P_CUST_CD:  $NC.G_USERINFO.CUST_CD,   
    P_BU_CD: $NC.G_USERINFO.BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onDBrandPopup, function() {
    $NC.setFocus("#edtKBrand_Cd", true);
  });
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showQBrandPopup() {

  $NP.showOwnBranPopup({
    P_CUST_CD:  $NC.G_USERINFO.CUST_CD,   
    P_BU_CD: $NC.G_USERINFO.BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onQBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}
/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onQBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.OWN_BRAND_NM);

    $NC.setValue("#edtQItem_Cd", resultInfo.ITEM_CD);
    $NC.setValue("#edtQItem_Nm", resultInfo.ITEM_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);

    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");
  }
}

/**
 * 브랜드 검색 결과 (실사구분 단일상품)
 * 
 * @param seletedRowData
 */
function onDBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtDBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtDBrand_Nm", resultInfo.OWN_BRAND_NM);

  } else {
    $NC.setValue("#edtDBrand_Cd");
    $NC.setValue("#edtDBrand_Nm");
    $NC.setFocus("#edtDBrand_Cd", true);

  }
}

/**
 * 상품 검색 팝업 표시
 */
function showKItemPopup() {

  $NP.showItemPopup({
    queryId: "WC.POP_CMBRANDITEM",
    queryParams: {
      P_BRAND_CD: $NC.getValue("#edtDBrand_Cd"),
      P_ITEM_CD: "%",
      P_VIEW_DIV: "2",
      P_DEPART_CD: "%",
      P_LINE_CD: "%",
      P_CLASS_CD: "%"
    }
  }, onKItemPopup, function() {
    $NC.setFocus("#edtKItem_Cd", true);
  });
}

/**
 * 상품 검색 팝업에서 브랜드 선택 했을 경우
 */
function onKItemPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtKItem_Cd", resultInfo.ITEM_CD);
    $NC.setValue("#edtKItem_Nm", resultInfo.ITEM_NM);
    $NC.setValue("#edtKItem_Spec", resultInfo.ITEM_SPEC);
    $NC.setValue("#edtKQty_In_Box", resultInfo.QTY_IN_BOX);

    $NC.setValue("#edtDBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtDBrand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.setValue("#edtKItem_Cd");
    $NC.setValue("#edtKItem_Nm");
    $NC.setValue("#edtKItem_Spec");
    $NC.setValue("#edtKQty_In_Box");
    $NC.setFocus("#edtKItem_Cd", true);

    $NC.setValue("#edtDBrand_Cd");
    $NC.setValue("#edtDBrand_Nm");
  }
}