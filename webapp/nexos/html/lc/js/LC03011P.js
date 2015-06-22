/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null,
    detailData: null,
    // 체크할 정책 값
    policyVal: {
      CM120: "", // 로케이션표시정책
      CM121: "", // 로케이션 존 길이
      CM122: "", // 로케이션 행 길이
      CM123: "", // 로케이션 열 길이
      CM124: "", // 로케이션 단 길이
    },
    CONSTS_DIV_LOC: "_____",// '_' 다섯개
    STOP: ""// '_' 다섯개

  });

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel);
  // 닫기버튼
  $("#btnEntryNew").click(_New);
  // 그리드 행 추가 버튼
  $("#btnEntryDelete").click(_Delete);
  // 그리드 행 삭제버튼
  $("#btnSave").click(_Save);

  $("#btnUpdate").click(_Update);
  // 저장 버튼
  $("#btnQItem_Cd").click(showItemPopup); // 현재고 검색의 상품검색 버튼 클릭

  $("#btnQLocation").click(showQLocationPopup);
  $("#btnLocation").click(showLocationPopup);
  $("#btnSearchStock").click(_Inquiry);
  $("#btnQBrand_Cd").click(showOwnBranPopup);
  // 현재고검색 버튼 클릭

  $NC.setInitDatePicker("#dtpMove_Date");
  // 이동일자
  $NC.setInitDatePicker("#dtpQValid_Date", null, "N");
  // 유효기한
  $NC.setInitDatePicker("#dtpQStock_Date", null, "N");
  // 재고일자

  // 그리드 초기화
  grdDetailInitialize();
  grdSubInitialize();

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

  // 로케이션 정책
  setPolicyValInfo();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setEnable("#edtCenter_Cd_F", false);
  $NC.setEnable("#edtBu_Cd", false);
  $NC.setEnable("#edtMove_No", false);

  $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
  $NC.setValue("#edtCenter_Cd", $NC.G_VAR.userData.P_CENTER_CD);
  $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {

    var MOVE_DATE = $NC.getValue("#dtpMove_Date");
    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      MOVE_DIV: "",
      MOVE_DATE: MOVE_DATE,
      MOVE_NO: "",
      CRUD: "C"
    };

    $NC.setEnable("#btnUpdate", false);
  } else {
    $NC.setEnable("#dtpMove_Date", false);
    $NC.setEnable("#btnSearchStock", false);
    $NC.setEnable("#btnEntryNew", false);
    $NC.setEnable("#btnSave", false);
    // 예정 -> 등록, 등록 수정

    var CRUD = "R";
    // 마스터 데이터 세팅
    var masterDS = $NC.G_VAR.userData.P_MASTER_DS;
    $NC.setValue("#dtpMove_Date", masterDS.MOVE_DATE);
    $NC.setValue("#edtMove_No", masterDS.MOVE_NO);
    $NC.setValue("#dtpMove_Start_Date", masterDS.MOVE_START_DATE);
    $NC.setValue("#dtpMove_End_Date", masterDS.MOVE_END_DATE);
    $NC.setValue("#edtManager_Id", masterDS.MANAGER_ID);
    $NC.setValue("#edtManager_Nm", masterDS.MANAGER_NM);
    $NC.setValue("#edtRemark1", masterDS.REMARK1);

    $NC.G_VAR.masterData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      MOVE_DATE: masterDS.MOVE_DATE,
      MOVE_NO: masterDS.MOVE_NO,
      MOVE_DIV: masterDS.MOVE_DIV,
      MOVE_DIV_F: masterDS.MOVE_DIV_F,
      MOVE_START_DATE: masterDS.MOVE_START_DATE,
      MOVE_END_DATE: masterDS.MOVE_END_DATE,
      MANAGER_ID: masterDS.MANAGER_ID,
      MANAGER_NM: masterDS.MANAGER_NM,
      REMARK1: masterDS.REMARK1,
      CRUD: CRUD
    };

    // 디테일 데이터 세팅
    var detailDS = $NC.G_VAR.userData.P_DETAIL_DS;
    var rowData;
    G_GRDSUB.data.beginUpdate();
    try {
      for ( var row in detailDS) {
        rowData = detailDS[row];
        var newRowData = $NC.getParams({
          CENTER_CD: rowData.CENTER_CD,
          BU_CD: rowData.BU_CD,
          MOVE_DATE: rowData.MOVE_DATE,
          MOVE_NO: rowData.MOVE_NO,
          LINE_NO: rowData.LINE_NO,
          LOCATION_CD: rowData.LOCATION_CD,
          STOCK_DATE: rowData.STOCK_DATE,
          STOCK_IN_GRP: rowData.STOCK_IN_GRP,
          STOCK_ID: rowData.STOCK_ID,
          MOVE_DIV: rowData.MOVE_DIV,
          BRAND_CD: rowData.BRAND_CD,
          BRAND_NM: rowData.BRAND_NM,
          ITEM_CD: rowData.ITEM_CD,
          ITEM_STATE: rowData.ITEM_STATE,
          ITEM_LOT: rowData.ITEM_LOT,
          VALID_DATE: rowData.VALID_DATE,
          BATCH_NO: rowData.BATCH_NO,
          LOCATION_ID: rowData.LOCATION_ID,
          OUT_WAIT_QTY: rowData.OUT_WAIT_QTY,
          STOCK_QTY: rowData.STOCK_QTY,
          MLOCATION_CD: rowData.MLOCATION_CD,
          MSTOCK_ID: rowData.MSTOCK_ID,
          MLOCATION_ID: rowData.MLOCATION_ID,
          MSTOCK_QTY: rowData.MSTOCK_QTY,
          ITEM_NM: rowData.ITEM_NM,
          ITEM_SPEC: rowData.ITEM_SPEC,
          ITEM_STATE_F: rowData.ITEM_STATE_F,
          QTY_IN_BOX: rowData.QTY_IN_BOX,
          BOX_WEIGHT: rowData.BOX_WEIGHT,
          MSTOCK_BOX: rowData.MSTOCK_BOX,
          MSTOCK_EA: rowData.MSTOCK_EA,
          MSTOCK_WEIGHT: rowData.MSTOCK_WEIGHT,
          id: $NC.getGridNewRowId(),
          CRUD: CRUD
        }, false);
        G_GRDSUB.data.addItem(newRowData);
      }
    } finally {
      G_GRDSUB.data.endUpdate();
    }

    $NC.setGridSelectRow(G_GRDSUB, 0);
  }
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.masterViewHeight = 165;
  $NC.G_OFFSET.stockGridHeight = 170;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $("#tblLocInput").outerHeight()
      + $NC.G_OFFSET.masterViewHeight + $NC.G_LAYOUT.nonClientHeight + $NC.G_LAYOUT.header + $NC.G_LAYOUT.margin1
      + $NC.G_LAYOUT.border1;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, $NC.G_OFFSET.masterViewHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, $NC.G_OFFSET.stockGridHeight - $NC.G_LAYOUT.header);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdSub", clientWidth, clientHeight - $NC.G_OFFSET.stockGridHeight - $NC.G_LAYOUT.margin1
      - $NC.G_LAYOUT.border1);
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
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.getValue("#edtBu_Cd"),
        P_BRAND_CD: $NC.getValue("#edtQBrand_Cd", true),
        P_ITEM_CD: val,
        P_VIEW_DIV: "2",
        P_DEPART_CD: "%",
        P_LINE_CD: "%",
        P_CLASS_CD: "%"
      };
      O_RESULT_DATA = $NP.getItemInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemPopup, onItemPopup);
    }
    break;
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.getValue("#edtBu_Cd");
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
    break;
  case "ZONE_CD":
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
  case "BANK_CD":
    if (!val) {
      break;
    }
    if (val.length !== Number($NC.G_VAR.policyVal.CM122)) {
      alert("로케이션 행코드 길이(" + $NC.G_VAR.policyVal.CM122 + "자리) 를 정확히 입력하여 주십시오 ");
      $NC.setValue("#edtQBank_Cd");
      $NC.setFocus("#edtQBank_Cd", true);
    }
    break;
  case "BAY_CD":
    if (!val) {
      break;
    }
    if (val.length !== Number($NC.G_VAR.policyVal.CM123)) {
      alert("로케이션 열코드 길이(" + $NC.G_VAR.policyVal.CM123 + "자리) 를 정확히 입력하여 주십시오 ");
      $NC.setValue("#edtQBay_Cd");
      $NC.setFocus("#edtQBay_Cd", true);
    }
    break;
  case "LEV_CD":
    if (!val) {
      break;
    }
    if (val.length !== Number($NC.G_VAR.policyVal.CM124)) {
      alert("로케이션 단코드 길이(" + $NC.G_VAR.policyVal.CM124 + "자리) 를 정확히 입력하여 주십시오 ");
      $NC.setValue("#edtQLev_Cd");
      $NC.setFocus("#edtQLev_Cd", true);
    }
    break;
  case "STOCK_DATE":
    if (!$NC.isNull(val)) {
      $NC.setValueDatePicker(view, val, "입고일자를 정확히 입력하십시오.");
    }
    break;
  case "VALID_DATE":
    if (!$NC.isNull(val)) {
      $NC.setValueDatePicker(view, val, "유통기한를 정확히 입력하십시오.");
    }
    break;
  }

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

  // 현재 수정모드면
  if (G_GRDSUB.view.getEditorLock().isActive()) {
    G_GRDSUB.view.getEditorLock().commitCurrentEdit();
  }

  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  var ITEM_STATE = $NC.getValue("#cboQItem_State");
  var ITEM_LOT = $NC.getValue("#edtQItem_Lot");
  var VALID_DATE = $NC.getValue("#dtpQValid_Date");
  var BATCH_NO = $NC.getValue("#edtQBatch_No");
  var STOCK_DATE = $NC.getValue("#dtpQStock_Date");
  var ZONE_CD = $NC.getValue("#edtQZone_Cd");
  var BANK_CD = $NC.getValue("#edtQBank_Cd");
  var BAY_CD = $NC.getValue("#edtQBay_Cd");
  var LEV_CD = $NC.getValue("#edtQLev_Cd");

  if ((BRAND_CD == "%") && $NC.isNull(ITEM_CD) && $NC.isNull(ITEM_LOT) && $NC.isNull(VALID_DATE)
      && $NC.isNull(BATCH_NO) && $NC.isNull(STOCK_DATE) && $NC.isNull(ZONE_CD) && $NC.isNull(BANK_CD)
      && $NC.isNull(BAY_CD) && $NC.isNull(LEV_CD)) {
    alert("검색조건 중 하나는 반드시 입력 하셔야 합니다.");
    return;
  }

  var LOCATION_CD = "";
  if ($NC.isNull(ZONE_CD)) {
    // ZONE_CD = $NC.G_VAR.CONSTS_DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM121);
    LOCATION_CD = "";
  } else {
    LOCATION_CD = ZONE_CD + "-" + BANK_CD + "-" + BAY_CD + "-" + LEV_CD;
  }
  /*
    if ($NC.isNull(ZONE_CD)) {
      ZONE_CD = $NC.G_VAR.CONSTS_DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM121);
    }

    if ($NC.isNull(BANK_CD)) {
      BANK_CD = $NC.G_VAR.CONSTS_DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM122);
    }

    if ($NC.isNull(BAY_CD)) {
      BAY_CD = $NC.G_VAR.CONSTS_DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM123);
    }

    if ($NC.isNull(LEV_CD)) {
      LEV_CD = $NC.G_VAR.CONSTS_DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM124);
    }

    var LOCATION_CD = "";
    // 1:XX-XX-XX-XX
    switch ($NC.G_VAR.policyVal.CM120) {
    case "1":
      LOCATION_CD = ZONE_CD + "-" + BANK_CD + "-" + BAY_CD + "-" + LEV_CD;
      break;
    // 2:XXXX-XX-XX,
    case "2":
      LOCATION_CD = ZONE_CD + BANK_CD + "-" + BAY_CD + "-" + LEV_CD;
      break;
    // 3:XXXXXXXX
    case "3":
      LOCATION_CD = ZONE_CD + BANK_CD + BAY_CD + LEV_CD;
      break;
    }
  */
  $NC.setInitGridVar(G_GRDDETAIL);
  // 데이터 조회
  $NC.serviceCall("/LC03010E/getDataSet.do", {
    P_QUERY_ID: "LC03010E.RS_POP_SUB1",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_STATE: ITEM_STATE,
      P_ITEM_LOT: ITEM_LOT,
      P_VALID_DATE: VALID_DATE,
      P_BATCH_NO: BATCH_NO,
      P_LOCATION_CD: LOCATION_CD,
      P_STOCK_DATE: STOCK_DATE,
      P_USER_ID: $NC.G_USERINFO.USER_ID

    })
  }, onGetDetail);
}

/**
 * 상품추가 버튼 클릭 이벤트 처리
 */
function _New() {

  if (G_GRDDETAIL.data.getLength() == 0 || G_GRDDETAIL.lastRow == null) {
    alert("추가할 재고 데이터를 선택하십시오.");
    return;
  }

  // 현재 수정모드면
  if (G_GRDSUB.view.getEditorLock().isActive()) {
    G_GRDSUB.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDSUB.lastRow != null) {
    if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
      return;
    }
  }

  var LOCATION_CD = $NC.getValue("#edtLocation_Cd");
  if ($NC.isNull(LOCATION_CD)) {
    alert("상품추가 시 먼저 이동할 로케이션을 선택하십시오.");
    $NC.setFocus("#edtLocation_Cd");
    return;
  }

  var chkLocation = 0;
  var rowCount = G_GRDDETAIL.data.getLength();

  var rowsDetailData = [ ];
  for ( var row = 0; row < rowCount; row++) {
    var rowDetailData = G_GRDDETAIL.data.getItem(row);
    if (rowDetailData.CHECK_YN != "Y") {
      continue;
    }
    if (LOCATION_CD == rowDetailData.LOCATION_CD) {
      chkLocation++;
    }

    var rowSubData = $NC.getParams({
      LINE_NO: "",
      LOCATION_CD: rowDetailData.LOCATION_CD,
      BRAND_CD: rowDetailData.BRAND_CD,
      BRAND_NM: rowDetailData.BRAND_NM,
      ITEM_CD: rowDetailData.ITEM_CD,
      ITEM_STATE: rowDetailData.ITEM_STATE,
      ITEM_LOT: rowDetailData.ITEM_LOT,
      VALID_DATE: rowDetailData.VALID_DATE,
      BATCH_NO: rowDetailData.BATCH_NO,
      LOCATION_ID: rowDetailData.LOCATION_ID,
      STOCK_QTY: rowDetailData.STOCK_QTY,
      PSTOCK_QTY: rowDetailData.PSTOCK_QTY,
      // MSTOCK_QTY: rowDetailData.PSTOCK_QTY,
      MSTOCK_QTY: 1,
      ITEM_NM: rowDetailData.ITEM_NM,
      ITEM_SPEC: rowDetailData.ITEM_SPEC,
      QTY_IN_BOX: rowDetailData.QTY_IN_BOX,
      MLOCATION_CD: LOCATION_CD,
      ITEM_STATE_F: rowDetailData.ITEM_STATE_F,
      id: $NC.getGridNewRowId(),
      CRUD: "C"
    }, false);

    rowsDetailData.push(rowSubData);

  }

  // if (rowsDetailData.length < 1) {
  // alert("이동할 상품을 선택하여 주십시오.");
  // return;
  // }

  if (chkLocation > 0) {
    alert("이동할 상품의 적치로케이션과 이동하려는 로케이션은 같을 수 없습니다.");
    return;
  }
  var insCnt = 0;

  var rows = $NC.getGridSearchRows(G_GRDDETAIL, {
    searchKey: "CHECK_YN",
    searchVal: "Y"
  });

  // 현재 선택된 로우 Validation 체크
  if (rows.length == 0) {
    alert("추가할 재고내역 데이터를 선택하십시오.");
    return;
  }

  /* 2014/12/08 디테일 그리드 내역 서브그리드로 추가시 searchKey값과 동일한 값 체크 주석처리
  var searchKey = ["LOCATION_CD", "BRAND_CD", "ITEM_CD", "ITEM_STATE", "ITEM_LOT", "VALID_DATE", "BATCH_NO"];

  G_GRDSUB.data.beginUpdate();
  try {
    for ( var i = 0; i < rowsDetailData.length; i++) {
      var rowSubData = rowsDetailData[i];
      var searchVal = [rowSubData.LOCATION_CD, rowSubData.BRAND_CD, rowSubData.ITEM_CD, rowSubData.ITEM_STATE,
          rowSubData.ITEM_LOT, rowSubData.VALID_DATE, rowSubData.BATCH_NO];
      if ($NC.getGridSearchVal(G_GRDSUB, {
        searchKey: searchKey,
        searchVal: searchVal
      }) === -1) {

        G_GRDSUB.data.addItem(rowSubData);
        insCnt++;
      }

    }
  } finally {
    G_GRDSUB.data.endUpdate();
  }

  if (insCnt == 0) {
    alert("선택한 상품은 이미 추가된 재고내역입니다.");
    return;
  }
  */

  G_GRDSUB.data.beginUpdate();
  try {
    for ( var i = 0; i < rowsDetailData.length; i++) {
      var rowSubData = rowsDetailData[i];

      G_GRDSUB.data.addItem(rowSubData);
      insCnt++;

    }
  } finally {
    G_GRDSUB.data.endUpdate();
  }

  onCalcSummary(rowsDetailData);
  G_GRDSUB.lastRow = null;
  $NC.setGridSelectRow(G_GRDSUB, G_GRDSUB.data.getLength() - 1);
}

/**
 * 저장버튼 클릭 이벤트 처리
 */
function _Save() {

  if (G_GRDSUB.data.getLength() == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  // 현재 수정모드면
  if (G_GRDSUB.view.getEditorLock().isActive()) {
    G_GRDSUB.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDSUB.lastRow != null) {
    if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
      return;
    }
  }

  if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
    alert("물류센터를 입력하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.MOVE_DATE)) {
    alert("먼저 이동일자를 입력하십시오.");
    $NC.setFocus("#dtpMove_Date");
    return;
  }

  var d_DS = [ ];
  var cu_DS = [ ];
  var rows = G_GRDSUB.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD == "R") {
      continue;
    }

    if (!chkSubParameter(row, rowData)) {
      return;
    }
    var saveData = {
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_MOVE_DATE: $NC.getValue("#dtpMove_Date"),
      P_MOVE_NO: $NC.getValue("#edtMove_No"),
      P_LINE_NO: rowData.LINE_NO,
      P_MOVE_DIV: "1",
      P_LOCATION_CD: rowData.LOCATION_CD,
      P_BRAND_CD: rowData.BRAND_CD,
      P_ITEM_CD: rowData.ITEM_CD,
      P_ITEM_STATE: rowData.ITEM_STATE,
      P_ITEM_LOT: rowData.ITEM_LOT,
      P_VALID_DATE: rowData.VALID_DATE,
      P_BATCH_NO: rowData.BATCH_NO,
      P_STOCK_QTY: rowData.STOCK_QTY,
      P_MSTOCK_QTY: rowData.MSTOCK_QTY,
      P_MLOCATION_CD: rowData.MLOCATION_CD,
      P_CRUD: rowData.CRUD
    };
    if (rowData.CRUD == "D") {
      d_DS.push(saveData);
    } else {
      cu_DS.push(saveData);
    }
  }

  // 생성된 로케이션ID를 그대로 사용하기 위해
  // 삭제할 데이터를 마지막에 추가
  var saveDS = cu_DS.concat(d_DS);
  if (saveDS.length == 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/LC03010E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_MOVE_DATE: $NC.G_VAR.masterData.MOVE_DATE,
      P_MOVE_NO: $NC.G_VAR.masterData.MOVE_NO,
      P_CRUD: $NC.G_VAR.masterData.CRUD
    }),
    P_DS_SUB: $NC.toJson(saveDS),
    P_PROCESS_CD: $NC.G_VAR.userData.P_PROCESS_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError, 2);
}

/**
 * 저장버튼 클릭 이벤트 처리
 */
function _Update() {
  $NC.G_VAR.STOP = '';
  if (G_GRDSUB.data.getLength() == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  // 현재 수정모드면
  if (G_GRDSUB.view.getEditorLock().isActive()) {
    G_GRDSUB.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDSUB.lastRow != null) {
    if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
      return;
    }
  }

  if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
    alert("물류센터를 입력하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.MOVE_DATE)) {
    alert("먼저 이동일자를 입력하십시오.");
    $NC.setFocus("#dtpMove_Date");
    return;
  }

  var d_DS = [ ];
  var cu_DS = [ ];
  var rows = G_GRDSUB.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {

    $NC.G_VAR.STOP = '';
    var rowData = rows[row];
    // 조회후 상태가 바꾸었는지 한번더 상태 체크
    $NC.serviceCallAndWait("/LC03010E/getMoveoutwaitqty.do", {
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_MOVE_DATE: $NC.G_VAR.masterData.MOVE_DATE,
        P_MOVE_NO: $NC.G_VAR.masterData.MOVE_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_LOCATION_CD: rowData.LOCATION_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_VALID_DATE: rowData.VALID_DATE,
        P_BATCH_NO: rowData.BATCH_NO,
        P_MSTOCK_QTY: rowData.MSTOCK_QTY

      })
    }, function(ajaxData) {

      var resultData = $NC.toArray(ajaxData);
      if (!$NC.isNull(resultData)) {
        if (resultData.O_MSG === "OK") {
          if (resultData.O_OUTWAIT_YN == "N") {
            $NC.setFocusGrid(G_GRDSUB, row, G_GRDSUB.view.getColumnIndex("MSTOCK_QTY"), true);

            alert("재고이동 가능한 가용재고 수량이 이동수량 보다 적습니다.");
            $NC.G_VAR.STOP = 'STOP';
            return;
          }
        }
      }
    });

    if ($NC.G_VAR.STOP == 'STOP') {
      return;
    }

    var rowData = rows[row];
    if (rowData.CRUD == "R") {
      continue;
    }

    if (!chkSubParameter(row, rowData)) {
      return;
    }
    var saveData = {
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_MOVE_DATE: $NC.G_VAR.masterData.MOVE_DATE,
      P_MOVE_NO: $NC.G_VAR.masterData.MOVE_NO,
      P_LINE_NO: rowData.LINE_NO,
      P_LOCATION_CD: rowData.LOCATION_CD,
      P_BRAND_CD: rowData.BRAND_CD,
      P_ITEM_CD: rowData.ITEM_CD,
      P_ITEM_STATE: rowData.ITEM_STATE,
      P_ITEM_LOT: rowData.ITEM_LOT,
      P_VALID_DATE: rowData.VALID_DATE,
      P_BATCH_NO: rowData.BATCH_NO,
      P_STOCK_QTY: rowData.STOCK_QTY,
      P_MSTOCK_QTY: rowData.MSTOCK_QTY,
      P_CRUD: rowData.CRUD
    };
    if (rowData.CRUD == "D") {
      d_DS.push(saveData);
    } else {
      cu_DS.push(saveData);
    }
  }

  // 생성된 로케이션ID를 그대로 사용하기 위해
  // 삭제할 데이터를 마지막에 추가
  var saveDS = cu_DS.concat(d_DS);
  if (saveDS.length == 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/LC03010E/save1.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_MOVE_DATE: $NC.G_VAR.masterData.MOVE_DATE,
      P_MOVE_NO: $NC.G_VAR.masterData.MOVE_NO,
      P_CRUD: $NC.G_VAR.masterData.CRUD
    }),
    P_DS_SUB: $NC.toJson(saveDS),
    P_PROCESS_CD: $NC.G_VAR.userData.P_PROCESS_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError, 2);
}
/**
 * 상품삭제 버튼 클릭 이벤트 처리
 */
function _Delete() {

  if (G_GRDSUB.data.getLength() == 0 || G_GRDSUB.lastRow == null) {
    alert("이동할 데이터를 선택하십시오.");
    return;
  }

  var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);

  // 신규 데이터일 경우 그냥 삭제
  if (rowData.CRUD === "C") {
    G_GRDSUB.data.deleteItem(rowData.id);
  } else {
    rowData.CRUD = "D";
    G_GRDSUB.data.updateItem(rowData.id, rowData);
    G_GRDSUB.data.refresh();
  }
  // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
  if (G_GRDSUB.lastRow > 1) {
    $NC.setGridSelectRow(G_GRDSUB, G_GRDSUB.lastRow - 1);
  } else {
    G_GRDSUB.lastRow = null;
    $NC.setGridSelectRow(G_GRDSUB, 0);
  }

  // 마지막 선택 Row 수정 상태 복원
  G_GRDSUB.lastRowModified = false;

  if (G_GRDSUB.data.getLength() == 0) {
    // 상단 현재로우/총건수 업데이트
    $NC.setGridDisplayRows("#grdSub", 0, 0);
  }
}

/**
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

  switch (args.col) {
  case "LOCATION_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      P_QUERY_PARAMS = {
        P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
        P_ZONE_CD: "",
        P_BANK_CD: "",
        P_BAY_CD: "",
        P_LEV_CD: "",
        P_LOCATION_CD: args.val
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
  case "MOVE_DATE":
    $NC.setValueDatePicker(args.view, args.val, "이동일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.MOVE_DATE = $NC.getValue("#dtpMove_Date");
    break;
  }

}

/**
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          row, cell, value
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDDETAIL, args.row);

  var rowData = G_GRDDETAIL.data.getItem(args.row);

  if (args.cell == G_GRDDETAIL.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  G_GRDDETAIL.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 40,
    maxWidth: 40,
    resizable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
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
    minWidth: 70
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
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PSTOCK_QTY",
    field: "PSTOCK_QTY",
    name: "가용재고",
    cssClass: "align-right",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 90,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상단그리드(상품정보) 초기값 설정
 */
function grdDetailInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: null,
    sortCol: "ITEM_CD",
    gridOptions: options,
    canExportExcel: false
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onHeaderClick.subscribe(grdDetailOnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDDETAIL, "CHECK_YN");
}

function grdDetailOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDDETAIL.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDDETAIL.view.getEditorLock().isActive() && !G_GRDDETAIL.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDDETAIL.data.getLength();
      var rowData;
      G_GRDDETAIL.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDDETAIL.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDDETAIL.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

/**
 * grdSub 데이터(로케이션이동 지시 데이터) 필터링 이벤트
 */
function grdSubOnFilter(item) {

  return item.CRUD !== "D";
}

/**
 * 현재고 그리드 입력 체크
 */
function grdSubOnBeforePost(row) {

  if (!G_GRDSUB.lastRowModified) {
    return true;
  }

  var rowData = G_GRDSUB.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  if (rowData.CRUD != "R") {
    if (!chkSubParameter(row, rowData)) {
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDSUB.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function chkSubParameter(row, rowData) {

  if ($NC.isNull(rowData.MLOCATION_CD)) {
    alert("이동할 로케이션을 선택하십시오.");
    $NC.setGridSelectRow(G_GRDSUB, {
      selectRow: row,
      activeCell: G_GRDSUB.view.getColumnIndex("MLOCATION_CD"),
      editMode: true
    });
    return false;
  }
  if ($NC.isNull(rowData.MSTOCK_QTY) || Number(rowData.MSTOCK_QTY) < 1) {
    alert("이동수량에 0보다 큰 수량을 입력하십시오.");
    $NC.setGridSelectRow(G_GRDSUB, {
      selectRow: row,
      activeCell: G_GRDSUB.view.getColumnIndex("MSTOCK_QTY"),
      editMode: true
    });
    return false;
  }
  if (rowData.CRUD !== "R" && Number(rowData.PSTOCK_QTY) < Number(rowData.MSTOCK_QTY)) {
    alert("재고수량 보다 많은 수량을 입력하실 수 없습니다.");
    rowData.MSTOCK_QTY = rowData.PSTOCK_QTY;
    G_GRDSUB.data.updateItem(rowData.id, rowData);
    $NC.setGridSelectRow(G_GRDSUB, {
      selectRow: row,
      activeCell: G_GRDSUB.view.getColumnIndex("MSTOCK_QTY"),
      editMode: true
    });
    return false;
  }

  return true;
}
/**
 * 상단 그리드 행 선택 변경 했을 경우
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

  var rowData = G_GRDDETAIL.data.getItem(row);
  $NC.setValue("#edtLocation_Cd", rowData.LOCATION_CD_M);
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

function grdSubOnGetColumns() {

  var columns = [ ];
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
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100
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
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OUT_WAIT_QTY",
    field: "OUT_WAIT_QTY",
    name: "가용재고",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MSTOCK_QTY",
    field: "MSTOCK_QTY",
    name: "이동수량",
    minWidth: 80,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });
  $NC.setGridColumn(columns, {
    id: "MLOCATION_CD",
    field: "MLOCATION_CD",
    name: "이동로케이션",
    minWidth: 100,
    /*
      editor: Slick.Editors.Popup,
      editorOptions: {
        onPopup: grdSubOnPopup,
        isKeyField: true
      },
      */
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "VALID_DATE",
    field: "VALID_DATE",
    name: "유통기한",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "재고로케이션",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 70
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 로케이션이동 지시 데이터 그리드 초기값 설정
 */
function grdSubInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 4

  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: null,
    sortCol: "LOCATION_CD",
    gridOptions: options,
    canExportExcel: false,
    onFilter: grdSubOnFilter
  });

  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
  G_GRDSUB.view.onBeforeEditCell.subscribe(grdSubOnBeforeEditCell);
  G_GRDSUB.view.onCellChange.subscribe(grdSubOnCellChange);

}

/**
 * 재고이동 지시 데이터 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdSubOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDSUB.lastRow != null) {
    if (row == G_GRDSUB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub", row + 1);
}

/**
 * 재고이동 지시 데이터 그리드 편집 불가 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdSubOnBeforeEditCell(e, args) {

  // 등록된 데이터로 할 땐 수정불가
  var rowData = G_GRDSUB.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가

    // if (rowData.CRUD === "R") {
    // return false;
    // }
  }
  return true;
}

/**
 * 재고이동 지시 데이터 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdSubOnCellChange(e, args) {

  var rowData = args.item;

  if (args.cell === G_GRDSUB.view.getColumnIndex("MLOCATION_CD")) {

    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.MLOCATION_CD)) {
      P_QUERY_PARAMS = {
        P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
        P_ZONE_CD: "",
        P_BANK_CD: "",
        P_BAY_CD: "",
        P_LEV_CD: "",
        P_LOCATION_CD: rowData.MLOCATION_CD
      };
      O_RESULT_DATA = $NP.getLocationInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onGridLocationPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showLocationPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onGridLocationPopup, onGridLocationPopup);
    }
    return;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUB.data.updateItem(rowData.id, rowData);

  var rows = [ ];
  rows[0] = rowData;
  onCalcSummarySub(rows);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUB.lastRowModified = true;
}

function grdSubOnPopup(e, args) {

  if (args.column.field === "MLOCATION_CD") {
    $NP.showLocationPopup({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_ZONE_CD: "",
      P_BANK_CD: "",
      P_BAY_CD: "",
      P_LEV_CD: "",
      P_LOCATION_CD: G_GRDSUB.data.getItem(G_GRDSUB.lastRow).MLOCATION_CD
    }, onGridLocationPopup, function() {
      $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, G_GRDSUB.view.getColumnIndex("MLOCATION_CD"), true, true);
      rowData.MLOCATION_CD = $NC.getValue("#edtLocation_Cd");
    });
  }
}

function onGridLocationPopup(resultInfo) {

  var locationCd, focusColum;

  if (!$NC.isNull(resultInfo)) {
    if (G_GRDSUB.view.getEditorLock().isActive()) {
      G_GRDSUB.view.getEditorLock().cancelCurrentEdit();
    }

    locationCd = resultInfo.LOCATION_CD;
    focusColum = "MSTOCK_QTY";
  } else {
    locationCd = $NC.getValue("#edtLocation_Cd");
    focusColum = "MLOCATION_CD";
  }

  var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
  if (rowData) {
    rowData.MLOCATION_CD = locationCd;

    G_GRDSUB.data.updateItem(rowData.id, rowData);

    // 수정 상태로 변경
    G_GRDSUB.lastRowModified = true;

    $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, G_GRDSUB.view.getColumnIndex(focusColum), true, true);
  }
}

function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);

  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "LOCATION_CD",
        selectVal: G_GRDDETAIL.lastKeyVal,
        activeCell: true
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
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

  setTimeout(function() {
    onClose();
  }, 500);
}

/**
 * 저장에 실패 했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}

function setPolicyValInfo() {

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    $NC.G_VAR.policyVal[POLICY_CD] = "";
  }

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCallAndWait("/LC03010E/callSP.do", {
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

/**
 * 로케이션 검색 이미지 클릭
 */
function showLocationPopup() {

  $NP.showLocationPopup({
    P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
    P_ZONE_CD: "",
    P_BANK_CD: "",
    P_BAY_CD: "",
    P_LEV_CD: "",
    P_LOCATION_CD: "%"
  }, onLocationPopup, function() {
    $NC.setFocus("#edtLocation_Cd", true);
  });
}

/**
 * 로케이션 검색 팝업에서 행 클릭후 처리
 * 
 * @param seletedRowData
 */
function onLocationPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtLocation_Cd", resultInfo.LOCATION_CD);
  } else {
    $NC.setValue("#edtLocation_Cd");
    $NC.setFocus("#edtLocation_Cd");
  }
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
    P_LOCATION_CD: "%"
  }, onQLocationPopup, function() {
    $NC.setFocus("#edtQZone_Cd");
  });

}

/**
 * 로케이션 검색 팝업에서 행 클릭후 처리
 * 
 * @param seletedRowData
 */
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
 * 상품 검색 팝업 표시
 */
function showItemPopup() {

  $NP.showItemPopup({
    P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
    P_BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
    P_ITEM_CD: "%",
    P_VIEW_DIV: "2",
    P_DEPART_CD: "%",
    P_LINE_CD: "%",
    P_CLASS_CD: "%"
  }, onItemPopup, function() {
    $NC.setFocus("#edtQItem_Cd", true);
  });
}

/**
 * 그리드에서 상품 선택했을 경우 처리
 * 
 * @param seletedRowData
 */
function onItemPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQItem_Cd", resultInfo.ITEM_CD);
    $NC.setValue("#edtQItem_Nm", resultInfo.ITEM_NM);
  } else {
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");
    $NC.setFocus("#edtQItem_Cd", true);
  }
}

function onCalcSummary(rowData) {

  var rowCount = rowData.length;

  var searchKey = ["LOCATION_CD", "BRAND_CD", "ITEM_CD", "ITEM_STATE", "ITEM_LOT", "VALID_DATE", "BATCH_NO"];

  G_GRDSUB.data.beginUpdate();
  try {
    for ( var row = 0; row < rowCount; row++) {
      var rowSubData = rowData[row];
      var searchVal = [rowSubData.LOCATION_CD, rowSubData.BRAND_CD, rowSubData.ITEM_CD, rowSubData.ITEM_STATE,
          rowSubData.ITEM_LOT, rowSubData.VALID_DATE, rowSubData.BATCH_NO];
      var searchCount = $NC.getGridSearchRows(G_GRDSUB, {
        searchKey: searchKey,
        searchVal: searchVal
      });

      if (!$NC.isNull(searchCount)) {
        var ORG_PSTOCK_QTY = 0;
        var REMAIN_PSTOCK_QTY = 0;
        var SUM_MSTOCK_QTY = 0;
        for ( var i = 0; i < searchCount.length; i++) {
          var rowSub = G_GRDSUB.data.getItem(searchCount[i]);
          if (i == 0) {
            ORG_PSTOCK_QTY = rowSub.PSTOCK_QTY;
            REMAIN_PSTOCK_QTY = ORG_PSTOCK_QTY - rowSub.MSTOCK_QTY;
            SUM_MSTOCK_QTY = SUM_MSTOCK_QTY + rowSub.MSTOCK_QTY;
          } else {
            rowSub.PSTOCK_QTY = REMAIN_PSTOCK_QTY;
            if (rowSub.PSTOCK_QTY <= 0) {
              alert("해당상품의 출고가능량을 넘었습니다.");
              if (rowSub.CRUD === "C") {
                G_GRDSUB.data.deleteItem(rowSub.id);
              } else {
                rowSub.CRUD = "D";
                G_GRDSUB.data.updateItem(rowSub.id, rowSub);
                G_GRDSUB.data.refresh();
              }
            } else {
              REMAIN_PSTOCK_QTY = REMAIN_PSTOCK_QTY - rowSub.MSTOCK_QTY;
              SUM_MSTOCK_QTY = rowSub.MSTOCK_QTY + SUM_MSTOCK_QTY;

              if (rowSub.CRUD === "R") {
                rowSub.CRUD = "U";
              }

              G_GRDSUB.data.updateItem(rowSub.id, rowSub);
            }
          }
        }
      }
    }
  } finally {
    G_GRDSUB.data.endUpdate();
  }
}

function onCalcSummarySub(rowData) {

  var rowCount = rowData.length;

  var searchKey = ["LOCATION_CD", "BRAND_CD", "ITEM_CD", "ITEM_STATE", "ITEM_LOT", "VALID_DATE", "BATCH_NO"];

  G_GRDSUB.data.beginUpdate();
  try {
    for ( var row = 0; row < rowCount; row++) {
      var rowSubData = rowData[row];
      var searchVal = [rowSubData.LOCATION_CD, rowSubData.BRAND_CD, rowSubData.ITEM_CD, rowSubData.ITEM_STATE,
          rowSubData.ITEM_LOT, rowSubData.VALID_DATE, rowSubData.BATCH_NO];
      var searchCount = $NC.getGridSearchRows(G_GRDSUB, {
        searchKey: searchKey,
        searchVal: searchVal
      });

      if (!$NC.isNull(searchCount)) {
        var ORG_PSTOCK_QTY = 0;
        var REMAIN_PSTOCK_QTY = 0;
        var SUM_MSTOCK_QTY = 0;
        for ( var i = 0; i < searchCount.length; i++) {
          var rowSub = G_GRDSUB.data.getItem(searchCount[i]);
          if (i == 0) {
            ORG_PSTOCK_QTY = rowSub.PSTOCK_QTY;
            REMAIN_PSTOCK_QTY = ORG_PSTOCK_QTY - rowSub.MSTOCK_QTY;
            SUM_MSTOCK_QTY = SUM_MSTOCK_QTY + rowSub.MSTOCK_QTY;
          } else {
            // 남은 출고가능량이 0이하인 로우는 화면에서 삭제
            rowSub.PSTOCK_QTY = REMAIN_PSTOCK_QTY;
            if (rowSub.PSTOCK_QTY <= 0) {
              if (rowSub.CRUD === "C") {
                G_GRDSUB.data.deleteItem(rowSub.id);
              } else {
                rowSub.CRUD = "D";
                G_GRDSUB.data.updateItem(rowSub.id, rowSub);
                G_GRDSUB.data.refresh();
              }
            } else {
              REMAIN_PSTOCK_QTY = REMAIN_PSTOCK_QTY - rowSub.MSTOCK_QTY;
              SUM_MSTOCK_QTY = rowSub.MSTOCK_QTY + SUM_MSTOCK_QTY;

              if (rowSub.CRUD === "R") {
                rowSub.CRUD = "U";
              }

              G_GRDSUB.data.updateItem(rowSub.id, rowSub);
            }
          }
        }
      }
    }
  } finally {
    G_GRDSUB.data.endUpdate();
  }
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {

  var BU_CD = $NC.getValue("#edtBu_Cd");

  $NP.showOwnBranPopup({
    P_CUST_CD: $NC.G_USERINFO.CUST_CD,
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