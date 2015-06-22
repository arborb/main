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

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel); // 닫기버튼
  $("#btnNew").click(_New); // 그리드 행 추가 버튼
  $("#btnDelete").click(_Delete); // 그리드 행 삭제버튼
  $("#btnSave").click(_Save); // 저장 버튼
  $("#btnQLocation").click(showQLocationPopup); // 현재고 검색시 사용되는 로케이션 검색 버튼 클릭
  $("#btnLocation").click(showLocationPopup); // 입고지시 그리드의 로케이션 값 설정에 사용되는 로케이션 검색 버튼
  $("#btnSearchStock").click(_Inquiry); // 현재고검색 버튼 클릭
  $("#btnQItemPopup").click(showQItemPopup); // 현재고 검색의 상품검색 버튼 클릭
  $("#btnQBrand_Cd").click(showBuBrandPopup);
  $("#btnQBu_Cd_In").click(showUserBuPopup);

  $("#edtCenter_Cd_F").prop("readonly", true); // 물류센터 readonly
  $("#edtBu_Cd_Out").prop("readonly", true); // 사업부 readonly
  $NC.setEnable("#edtEtc_No", false); // 입출고번호 비활성화

  $NC.setInitDatePicker("#dtpEtc_Date"); // 입출고일자
  $NC.setInitDatePicker("#dtpQValid_Date", null, "N"); // 유통기한
  $NC.setInitDatePicker("#dtpQStock_Date", null, "N"); // 재고입고일자

  grdDetailInitialize();
  grdSubInitialize();

  // 상품상태 콤보 세팅
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
    fullNameField: "CODE_CD_F"
  });

  // 로케이션 정책
  setPolicyValInfo();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  var isDisabled = true;

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {
    $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
    $NC.setValue("#edtCenter_Cd", $NC.G_VAR.userData.P_CENTER_CD);
    $NC.setValue("#edtBu_Cd_Out", $NC.G_VAR.userData.P_BU_CD);
    $NC.setValue("#edtBu_Nm_Out", $NC.G_VAR.userData.P_BU_NM);
    $NC.setValue("#dtpEtc_Date", $NC.G_VAR.userData.P_ETC_DATE);

    isDisabled = false;

    var ETC_DATE = $NC.getValue("#dtpEtc_Date");
    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD_OUT: $NC.G_VAR.userData.P_BU_CD,
      BU_CD_IN: "",
      INOUT_CD: "", // INOUT_CD,
      ETC_DATE: ETC_DATE,
      ETC_NO: "",
      REMARK1: "",
      CRUD: "C"
    };
  } else {

    var masterDS = $NC.G_VAR.userData.P_MASTER_DS;

    $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
    $NC.setValue("#edtCenter_Cd", $NC.G_VAR.userData.P_CENTER_CD);
    $NC.setValue("#edtBu_Cd_Out", $NC.G_VAR.userData.P_BU_CD_OUT);
    $NC.setValue("#edtBu_Nm_Out", $NC.G_VAR.userData.P_BU_NM_OUT);
    $NC.setValue("#edtBu_Cd_In", $NC.G_VAR.userData.P_BU_CD_IN);
    $NC.setValue("#edtBu_Nm_In", $NC.G_VAR.userData.P_BU_NM_IN);
    $NC.setValue("#dtpEtc_Date", $NC.G_VAR.userData.P_ETC_DATE);
    $NC.setValue("#edtEtc_No", $NC.G_VAR.userData.P_ETC_NO);

    var ETC_DATE = $NC.getValue("#dtpEtc_Date");

    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {

      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD_OUT: $NC.G_VAR.userData.P_BU_CD_OUT,
      BU_CD_IN: $NC.G_VAR.userData.P_BU_CD_IN,
      INOUT_CD: masterDS.INOUT_CD, // INOUT_CD,
      ETC_DATE: ETC_DATE,
      ETC_NO: $NC.G_VAR.userData.P_ETC_NO,
      REMARK1: "",
      CRUD: $NC.G_VAR.userData.P_CRUD
    };

    // SUB 데이터 세팅
    var detailDS = $NC.G_VAR.userData.P_DETAIL_DS;
    var subDS = $NC.G_VAR.userData.P_SUB_DS;
    var rowData;
    G_GRDSUB.data.beginUpdate();
    try {
      for ( var row in subDS) {
        rowData = subDS[row];
        var newRowData = {
          CENTER_CD: rowData.CENTER_CD,
          BU_CD: rowData.BU_CD,
          ETC_DATE: rowData.ETC_DATE,
          ETC_NO: rowData.ETC_NO,
          LINE_NO: rowData.LINE_NO,
          LINK_CENTER_CD: rowData.LINK_CENTER_CD,
          LINK_BU_CD: rowData.LINK_BU_CD,
          LINK_ETC_DATE: rowData.LINK_ETC_DATE,
          LINK_ETC_NO: rowData.LINK_ETC_NO,
          LINK_LINE_NO: rowData.LINK_LINE_NO,
          LINK_LOCATION_CD: rowData.LINK_LOCATION_CD,
          INBOUND_SEQ: rowData.INBOUND_SEQ,
          LOCATION_CD: rowData.LOCATION_CD,
          BRAND_CD: rowData.BRAND_CD,
          BRAND_NM: rowData.BRAND_NM,
          ITEM_CD: rowData.ITEM_CD,
          ITEM_NM: rowData.ITEM_NM,
          ITEM_STATE: rowData.ITEM_STATE,
          ITEM_STATE_F: rowData.ITEM_STATE_F,
          ITEM_SPEC: rowData.ITEM_SPEC,
          ITEM_LOT: rowData.ITEM_LOT,
          STOCK_DATE: rowData.STOCK_DATE,
          STOCK_IN_GRP: rowData.STOCK_IN_GRP,
          STOCK_ID: rowData.STOCK_ID,
          VALID_DATE: rowData.VALID_DATE,
          BATCH_NO: rowData.BATCH_NO,
          LOCATION_ID: "",
          PSTOCK_QTY: "",
          QTY_IN_BOX: rowData.QTY_IN_BOX,
          CONFIRM_QTY: rowData.CONFIRM_QTY,
          ETC_DIV: rowData.ETC_DIV,
          ETC_DIV_F: rowData.ETC_DIV_F,
          ETC_COMMENT: rowData.ETC_COMMENT,
          id: $NC.getGridNewRowId(),
          CRUD: "R"
        };
        G_GRDSUB.data.addItem(newRowData);

      }
    } finally {
      G_GRDSUB.data.endUpdate();
    }

    $("#dtpEtc_Date").datepicker("disable");

    // 수정일 경우 비활성화
    $NC.setEnable("#edtCenter_Cd_F", !isDisabled);
    $NC.setEnable("#edtBu_Cd_Out", !isDisabled);
    $NC.setEnable("#cboInout_Cd", !isDisabled);
    $NC.setEnable("#edtBu_Cd_In", !isDisabled);
    $NC.setEnable("#btnQBu_Cd_In", !isDisabled);

    $NC.setGridSelectRow(G_GRDSUB, 0);
  }

  // 입출고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "D71",
      P_SUB_CD1: "D7",
      P_SUB_CD2: "D7"
    })
  }, {
    selector: "#cboInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? "F" : null,
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
      } else {
        $NC.setValue("#cboInout_Cd", $NC.G_VAR.masterData.INOUT_CD);
      }
    }
  });

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.masterViewHeight = 200;
  $NC.G_OFFSET.stockGridHeight = 150;
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
        P_BU_CD: $NC.getValue("#edtBu_Cd_Out"),
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
      onQItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onQItemPopup, onQItemPopup);
    }
    break;
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BU_CD = $NC.getValue("#edtBu_Cd_Out");
      P_QUERY_PARAMS = {
        P_BU_CD: BU_CD,
        P_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getBuBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBuBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showBuBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBuBrandPopup, onBuBrandPopup);
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

  $NC.setInitGridVar(G_GRDDETAIL);

  G_GRDDETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
    P_BU_CD: $NC.G_VAR.masterData.BU_CD_OUT,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: ITEM_CD,
    P_ITEM_STATE: ITEM_STATE,
    P_ITEM_LOT: ITEM_LOT,
    P_VALID_DATE: VALID_DATE,
    P_BATCH_NO: BATCH_NO,
    P_LOCATION_CD: LOCATION_CD,
    P_STOCK_DATE: STOCK_DATE,
  });

  // Master 데이터 조회
  $NC.serviceCall("/LC02030E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
}

/**
 * 상품추가 버튼 클릭 이벤트 처리
 */
function _New() {

  // 현재 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }

  // 현재 선택된 로우 Validation 체크
  if (G_GRDSUB.lastRow != null) {
    if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
      return;
    }
  }

  var detailDs = [ ];
  var chkCnt = 0;
  var rows = $NC.getGridSearchRows(G_GRDDETAIL, {
    searchKey: "CHECK_YN",
    searchVal: "Y"
  });

  // 현재 선택된 로우 Validation 체크
  if (rows.length == 0) {
    alert("추가할 재고내역 데이터를 선택하십시오.");
    return;
  }

  var searchKey = ["BRAND_CD", "ITEM_CD", "ITEM_STATE", "ITEM_LOT", "VALID_DATE", "BATCH_NO", "LOCATION_CD",
      "STOCK_DATE", "STOCK_IN_GRP", "LOCATION_ID"];
  for (var row = 0; row < rows.length; row++) {
    var rowSubData = G_GRDDETAIL.data.getItem(rows[row]);
    var searchVal = [rowSubData.BRAND_CD, rowSubData.ITEM_CD, rowSubData.ITEM_STATE, rowSubData.ITEM_LOT,
        rowSubData.VALID_DATE, rowSubData.BATCH_NO, rowSubData.LOCATION_CD, rowSubData.STOCK_DATE,
        rowSubData.STOCK_IN_GRP, rowSubData.LOCATION_ID];
    if ($NC.getGridSearchVal(G_GRDSUB, {
      searchKey: searchKey,
      searchVal: searchVal
    }) === -1) {
      detailDs.push(rowSubData);
      chkCnt++;
    }
  }

  if (chkCnt == 0) {
    alert("선택한 상품은 이미 추가된 재고내역입니다.");
    return;
  }

  var rowCount = G_GRDSUB.data.getLength();
  var LOCATION_CD = $NC.getValue("#edtLocation_Cd");
  for ( var row in detailDs) {
    var rowData = detailDs[row];
    var newRowData = {
      CENTER_CD: rowData.CENTER_CD,
      BU_CD: rowData.BU_CD,
      LOCATION_CD: rowData.LOCATION_CD,
      LINK_LOCATION_CD: $NC.isNull(LOCATION_CD) ? rowData.LOCATION_CD : LOCATION_CD,
      BRAND_CD: rowData.BRAND_CD,
      BRAND_NM: rowData.BRAND_NM,
      ITEM_CD: rowData.ITEM_CD,
      ITEM_NM: rowData.ITEM_NM,
      ITEM_STATE: rowData.ITEM_STATE,
      ITEM_STATE_F: rowData.ITEM_STATE_F,
      ITEM_SPEC: rowData.ITEM_SPEC,
      ITEM_LOT: rowData.ITEM_LOT,
      STOCK_DATE: rowData.STOCK_DATE,
      STOCK_IN_GRP: rowData.STOCK_IN_GRP,
      STOCK_ID: rowData.STOCK_ID,
      LOCATION_ID: rowData.LOCATION_ID,
      VALID_DATE: rowData.VALID_DATE,
      BATCH_NO: rowData.BATCH_NO,
      LOCATION_ID: rowData.LOCATION_ID,
      PSTOCK_QTY: rowData.PSTOCK_QTY,
      OUT_WAIT_QTY: rowData.OUT_WAIT_QTY,
      QTY_IN_BOX: rowData.QTY_IN_BOX,
      CONFIRM_QTY: rowData.PSTOCK_QTY, // 이동수량
      ETC_DIV: "99",
      ETC_DIV_F: $NC.getGridComboName(G_GRDSUB, {
        colFullNameField: "ETC_DIV_F",
        searchVal: "99",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
      ETC_COMMENT: "",
      id: $NC.getGridNewRowId(),
      LINK_BRAND_CD: "",
      LINK_ITEM_CD: "",
      LINK_ITEM_STATE: "",
      LINK_ITEM_LOT: "",
      LINK_CONFIRM_QTY: "",
      REMARK1: "",
      CRUD: "C"
    };
    G_GRDSUB.data.addItem(newRowData);
  }

  $NC.setGridSelectRow(G_GRDSUB, rowCount);
  $NC.setGridDisplayRows("#grdSub", rowCount + 1, G_GRDSUB.data.getLength());
  // 수정 상태로 변경
  G_GRDSUB.lastRowModified = true;

}

/**
 * 현재고 검색후 처리
 * 
 * @param ajaxData
 */
function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: new Array("VALID_DATE", "STOCK_DATE", "LOCATION_CD", "STOCK_ID"),
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
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

  if ($NC.isNull($NC.G_VAR.masterData.BU_CD_OUT)) {
    alert("출고사업부를 입력하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.BU_CD_IN)) {
    alert("입고사업부를 입력하십시오.");
    $NC.setFocus("#edtBu_Cd_In");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
    alert("먼저 입출고구분을 선택하십시오.");
    $NC.setFocus("#cboInout_Cd");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.ETC_DATE)) {
    alert("먼저 입출고일자를 입력하십시오.");
    $NC.setFocus("#dtpEtc_Date");
    return;
  }

  var d_DS = [ ];
  var cu_DS = [ ];
  var subRows = G_GRDSUB.data.getItems();
  var rowCount = subRows.length;
  for (var row = 0; row < rowCount; row++) {
    var detailRow = subRows[row];
    if (detailRow.CRUD == "R") {
      continue;
    }
    if (!chkSubParameter(row, detailRow)) {
      return;
    }
    var saveData = {
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD_OUT,
      P_LINK_BU_CD: $NC.G_VAR.masterData.BU_CD_IN,
      P_ETC_DATE: $NC.G_VAR.masterData.ETC_DATE,
      P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
      P_ETC_NO: $NC.G_VAR.masterData.ETC_NO,
      P_REMARK1: $NC.G_VAR.masterData.REMARK1,
      P_LINE_NO: detailRow.LINE_NO,
      P_LOCATION_CD: detailRow.LOCATION_CD,
      P_LINK_LOCATION_CD: detailRow.LINK_LOCATION_CD,
      P_STOCK_DATE: detailRow.STOCK_DATE,
      P_STOCK_IN_GRP: detailRow.STOCK_IN_GRP,
      P_STOCK_ID: detailRow.STOCK_ID,
      P_BRAND_CD: detailRow.BRAND_CD,
      P_ITEM_CD: detailRow.ITEM_CD,
      P_ITEM_STATE: detailRow.ITEM_STATE,
      P_ITEM_LOT: detailRow.ITEM_LOT,
      P_VALID_DATE: $NC.isNull(detailRow.VALID_DATE) ? "" : detailRow.VALID_DATE,
      P_BATCH_NO: $NC.isNull(detailRow.BATCH_NO) ? "" : detailRow.BATCH_NO,
      P_CONFIRM_QTY: detailRow.CONFIRM_QTY,
      P_QTY_IN_BOX: detailRow.QTY_IN_BOX,
      P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
      P_STOCK_QTY: detailRow.STOCK_QTY,
      P_LOCATION_ID: detailRow.LOCATION_ID,
      P_ETC_DIV: detailRow.ETC_DIV,
      P_ETC_COMMENT: $NC.isNull(detailRow.ETC_COMMENT) ? "" : detailRow.ETC_COMMENT,
      P_LINK_BRAND_CD: detailRow.LINK_BRAND_CD,
      P_LINK_CENTER_CD: detailRow.LINK_CENTER_CD,
      P_LINK_ETC_DATE: detailRow.LINK_ETC_DATE,
      P_LINK_ETC_NO: detailRow.LINK_ETC_NO,
      P_LINK_LINE_NO: detailRow.LINK_LINE_NO,
      P_LINK_ITEM_CD: detailRow.LINK_ITEM_CD,
      P_LINK_ITEM_STATE: detailRow.LINK_ITEM_STATE,
      P_LINK_ITEM_LOT: detailRow.LINK_ITEM_LOT,
      P_LINK_CONFIRM_QTY: detailRow.LINK_CONFIRM_QTY,
      P_REMARK1: detailRow.REMARK1,
      P_CRUD: detailRow.CRUD
    };
    if (detailRow.CRUD == "D") {
      d_DS.push(saveData);
    } else {
      cu_DS.push(saveData);
    }
  }

  var saveDS = d_DS.concat(cu_DS);
  if (saveDS.length == 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/LC02030E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD_OUT,
      P_ETC_DATE: $NC.G_VAR.masterData.ETC_DATE,
      P_ETC_NO: $NC.G_VAR.masterData.ETC_NO,
      P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
      P_CRUD: $NC.G_VAR.masterData.CRUD
    }),
    P_DS_SUB: $NC.toJson(saveDS),
    P_PROCESS_CD: $NC.G_VAR.userData.P_PROCESS_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave);
}

/**
 * 삭제 버튼 클릭 이벤트 처리(지시내역 그리드 행 삭제)
 */
function _Delete() {

  if (G_GRDSUB.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);

  // 신규 데이터일 경우 그냥 삭제
  if (rowData.CRUD === "C" || rowData.CRUD === "N") {
    G_GRDSUB.data.deleteItem(rowData.id);
  } else {
    rowData.CRUD = "D";
    G_GRDSUB.data.updateItem(rowData.id, rowData);
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
  case "ETC_DATE":
    $NC.setValueDatePicker(args.view, args.val, "입출고일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.ETC_DATE = $NC.getValue("#dtpEtc_Date");
    break;
  case "BU_CD_IN":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      P_QUERY_PARAMS = {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: args.val,
        P_CUST_CD: $NC.G_VAR.userData.P_CUST_CD
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
    break;
  }

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }

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
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "VALID_DATE",
    field: "VALID_DATE",
    name: "유통기한",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BATCH_NO",
    field: "BATCH_NO",
    name: "제조배치번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    cssClass: "align-right",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    cssClass: "align-right",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "PSTOCK_QTY",
    field: "PSTOCK_QTY",
    name: "가용재고",
    cssClass: "align-right",
    minWidth: 60
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
    editable: true,
    autoEdit: true,
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "LC02030E.RS_POP_SUB1",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onHeaderClick.subscribe(grdDetailOnHeaderClick);
  G_GRDDETAIL.view.onClick.subscribe(grdDetailOnClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDDETAIL, "CHECK_YN");
  $("#grdDetail").height(150);
}

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
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
      for (var row = 0; row < rowCount; row++) {
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
 * 상단 그리드의 행 체크 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnClick(e, args) {

  if (args.cell === G_GRDDETAIL.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDDETAIL.view.getEditorLock().isActive() && !G_GRDDETAIL.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDDETAIL.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {

        if (rowData.CRUD === "R") {
          rowData.CRUD = "U";
        }

        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
      }
    }
    return;
  }
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

  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDDETAIL, args.row);

  var rowData = G_GRDDETAIL.data.getItem(args.row);

  if (args.cell == G_GRDDETAIL.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  // G_GRDMASTER.lastRowModified = true;
}

/**
 * 지시내역 그리드 입력 체크
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

  if ($NC.isNull(rowData.CONFIRM_QTY) || Number(rowData.CONFIRM_QTY) < 1) {
    alert("출고수량에 0보다 큰 수량을 입력하십시오.");
    $NC.setGridSelectRow(G_GRDSUB, {
      selectRow: row,
      activeCell: G_GRDSUB.view.getColumnIndex("CONFIRM_QTY"),
      editMode: true
    });
    return false;
  }
  if (rowData.CRUD == "C" && Number(rowData.PSTOCK_QTY) < Number(rowData.CONFIRM_QTY)) {
    alert("재고수량 보다 많은 수량을 입력하실 수 없습니다.");
    rowData.CONFIRM_QTY = "0";
    $NC.setGridSelectRow(G_GRDSUB, {
      selectRow: row,
      activeCell: G_GRDSUB.view.getColumnIndex("CONFIRM_QTY"),
      editMode: true
    });
    return false;
  }
  if (rowData.CRUD == "C" && $NC.isNull(rowData.LINK_LOCATION_CD)) {
    alert("이동로케이션을 입력하세요.");
    $NC.setGridSelectRow(G_GRDSUB, {
      selectRow: row,
      activeCell: G_GRDSUB.view.getColumnIndex("LINK_LOCATION_CD"),
      editMode: true
    });
    return false;
  }
  if ($NC.isNull(rowData.ETC_DIV)) {
    alert("사유구분을 선택하십시오.");
    $NC.setGridSelectRow(G_GRDSUB, {
      selectRow: row,
      activeCell: G_GRDSUB.view.getColumnIndex("ETC_DIV_F"),
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
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "VALID_DATE",
    field: "VALID_DATE",
    name: "유통기한",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BATCH_NO",
    field: "BATCH_NO",
    name: "제조배치번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PSTOCK_QTY",
    field: "PSTOCK_QTY",
    name: "재고수량",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "출고수량",
    minWidth: 60,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });
  $NC.setGridColumn(columns, {
    id: "LINK_LOCATION_CD",
    field: "LINK_LOCATION_CD",
    name: "이동로케이션",
    minWidth: 100,
    cssClass: "align-center",
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdSubOnPopup
    }
  });
  $NC.setGridColumn(columns, {
    id: "ETC_DIV_F",
    field: "ETC_DIV_F",
    name: "사유구분",
    minWidth: 150,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "ETC_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "ETC_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "ETC_COMMENT",
    field: "ETC_COMMENT",
    name: "사유내역",
    minWidth: 180,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "재고로케이션",
    minWidth: 100,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 현재고 데이터 그리드 초기값 설정
 */
function grdSubInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 5
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    sortCol: "LINE_NO",
    gridOptions: options,
    onFilter: grdSubOnFilter
  });

  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
  G_GRDSUB.view.onBeforeEditCell.subscribe(grdSubOnBeforeEditCell);
  G_GRDSUB.view.onCellChange.subscribe(grdSubOnCellChange);
}

/**
 * grdSub 데이터 필터링 이벤트
 */
function grdSubOnFilter(item) {

  return item.CRUD !== "D";
}

/**
 * 현재고 데이터 그리드 행 선택 변경 했을 경우
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
 * 현재고 데이터 그리드 편집 불가 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdSubOnBeforeEditCell(e, args) {
  var rowData = G_GRDSUB.data.getItem(args.row);
  if (rowData.CRUD == "R" || rowData.CRUD == "U") {
    if (args.cell === G_GRDSUB.view.getColumnIndex("ETC_DIV_F")
        || args.cell === G_GRDSUB.view.getColumnIndex("ETC_COMMENT")) {
      return true;
    } else {
      return false;
    }
  }
}

/**
 * 현재고 데이터 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdSubOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDSUB.view.getColumnField(args.cell)) {
  case "LINK_LOCATION_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.LINK_LOCATION_CD)) {
      P_QUERY_PARAMS = {
        P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
        P_ZONE_CD: "",
        P_BANK_CD: "",
        P_BAY_CD: "",
        P_LEV_CD: "",
        P_LOCATION_CD: rowData.LINK_LOCATION_CD
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

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUB.lastRowModified = true;
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
    $NC.serviceCallAndWait("/LC02030E/callSP.do", {
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
 * 현재고 검색의 로케이션 검색 이미지 클릭
 */
function showQLocationPopup() {

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
  }, onQLocationPopup, function() {
    $NC.setFocus("#edtQZone_Cd", true);
  });
}

/**
 * 현재고 검색의 로케이션 검색 팝업창에서 행 클릭 했을 경우 처리
 * 
 * @param resultInfo
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
 * 기타입고 지시내역의 로케이션 검색 이미지 클릭
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

/**
 * 로케이션 검색 팝업창에서 행 클릭 했을 경우 처리
 * 
 * @param resultInfo
 */

function onLocationPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtLocation_Cd", resultInfo.LOCATION_CD);
  } else {
    $NC.setValue("#edtLocation_Cd");
    $NC.setFocus("#edtLocation_Cd", true);
  }
}

/**
 * 지시내역 그리드의 로케이션 검색 팝업창에서 행 클릭 혹은 취소 했을 경우 처리
 * 
 * @param resultInfo
 */

function onGridLocationPopup(resultInfo) {

  var rowData = {};
  if (!$NC.isNull(resultInfo)) {

    if (G_GRDSUB.view.getEditorLock().isActive()) {
      G_GRDSUB.view.getEditorLock().cancelCurrentEdit();
    }

    rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
    if (rowData) {
      rowData.LINK_LOCATION_CD = resultInfo.LOCATION_CD;

      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDSUB.data.updateItem(rowData.id, rowData);

      // 수정 상태로 변경
      G_GRDSUB.lastRowModified = true;

      $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, G_GRDSUB.view.getColumnIndex("ETC_DIV_F"), true, true);
    }
  } else {
    rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
    if (rowData) {
      rowData.LINK_LOCATION_CD = "";

      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDSUB.data.updateItem(rowData.id, rowData);

      // 수정 상태로 변경
      G_GRDSUB.lastRowModified = true;

      $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, G_GRDSUB.view.getColumnIndex("LINK_LOCATION_CD"), true, true);
    }
  }
}

/**
 * 그리드의 존구분의 검색 버튼 클릭시 로케이션 검색 창 표시
 */
function grdSubOnPopup(e, args) {

  switch (args.column.field) {
  case "LINK_LOCATION_CD":
    $NP.showLocationPopup({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_ZONE_CD: "",
      P_BANK_CD: "",
      P_BAY_CD: "",
      P_LEV_CD: "",
      P_LOCATION_CD: "%"
    }, onGridLocationPopup, function() {
      $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, G_GRDSUB.view.getColumnIndex("LINK_LOCATION_CD"), true, true);
    });
    break;
  }
}

/**
 * 상품 검색 팝업 표시
 */
function showQItemPopup() {

  $NP.showItemPopup({
    P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
    P_BRAND_CD: $NC.getValue("#edtQBrand_Cd", true),
    P_ITEM_CD: "%",
    P_VIEW_DIV: "2",
    P_DEPART_CD: "%",
    P_LINE_CD: "%",
    P_CLASS_CD: "%"
  }, onQItemPopup, function() {
    $NC.setFocus("#edtQItem_Cd", true);
  });
}

/**
 * 상품 검색 팝업에서 상품선택 혹은 취소 했을 경우
 */
function onQItemPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQItem_Cd", resultInfo.ITEM_CD);
    $NC.setValue("#edtQItem_Nm", resultInfo.ITEM_NM);

  } else {
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");
    $NC.setFocus("#edtQItem_Cd", true);
  }
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%",
    P_CUST_CD: $NC.G_VAR.userData.P_CUST_CD
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtBu_Cd_In", true);
  });
}

/**
 * 사업부 검색 결과
 * 
 * @param resultInfo
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtBu_Cd_In", resultInfo.BU_CD);
    $NC.setValue("#edtBu_Nm_In", resultInfo.BU_NM);
    $NC.G_VAR.masterData.BU_CD_IN = resultInfo.BU_CD;
  } else {
    $NC.setValue("#edtBu_Cd_In");
    $NC.setValue("#edtBu_Nm_In");
    $NC.setFocus("#edtBu_Cd_In", true);
    $NC.G_VAR.masterData.BU_CD_IN = "";
  }
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

  var BU_CD = $NC.getValue("#edtBu_Cd_Out");

  $NP.showBuBrandPopup({
    P_BU_CD: BU_CD,
    P_BRAND_CD: "%"
  }, onBuBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onBuBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);

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