/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null,
    INOUT_IN: "E",
    INOUT_OUT: "D",
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
  $("#btnNew").click(_New); // 출고지시 그리드 행 추가 버튼
  $("#btnDelete").click(_Delete); // 출고지시 그리드 행 삭제버튼
  $("#btnNewItem").click(_New); // 입고지시 그리드 상품추가버튼 클릭
  $("#btnDeleteItem").click(_Delete); // 입고지시 그리드 상품삭제버튼 클릭
  $("#btnSave").click(_Save); // 지시내역 저장 버튼
  $("#btnQLocation").click(showQLocationPopup); // 현재고 검색시 사용되는 로케이션 검색 버튼 클릭
  $("#btnLocation").click(showLocationPopup); // 입고지시 그리드의 로케이션 값 설정에 사용되는 로케이션 검색 버튼
  $("#btnSearchStock").click(_Inquiry); // 현재고검색 버튼 클릭
  $("#btnQItemPopup").click(showQItemPopup); // 현재고 검색의 상품검색 버튼 클릭
//  $("#btnQBrand_Cd").click(showBuBrandPopup);

  $("#edtCenter_Cd_F").prop("readonly", true); // 물류센터 readonly
  $("#edtBu_Cd").prop("readonly", true); // 사업부 readonly
  $NC.setEnable("#edtEtc_No", false); // 입출고번호 비활성화

  $("#divSub1View").show(); // 출고지시내역 표시
  $("#divSub2View").hide(); // 입고지시내역 비표시

  $NC.setInitDatePicker("#dtpEtc_Date"); // 입출고일자
//  $NC.setInitDatePicker("#dtpQValid_Date", null, "N"); // 유통기한
  $NC.setInitDatePicker("#dtpQStock_Date", null, "N"); // 재고입고일자

  // 그리드 초기화
  grdDetailInitialize();
  grdSub1Initialize();
  grdSub2Initialize();

  // 현재고 검색 조건.상품상태 콤보 세팅
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

  $NC.setValue("#edtCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
  $NC.setValue("#edtCenter_Cd", $NC.G_VAR.userData.P_CENTER_CD);
  $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);
  $NC.setValue("#dtpEtc_Date", $NC.G_VAR.userData.P_ETC_DATE);

  var isDisabled = true;

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {

    isDisabled = false;

    var ETC_DATE = $NC.getValue("#dtpEtc_Date");
    // var INOUT_CD = $NC.getValue("#cboInout_Cd");
    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      INOUT_CD: "", // INOUT_CD,
      ETC_DATE: ETC_DATE,
      ETC_NO: "",
      REMARK1: "",
      CRUD: "C"
    };
  } else {

    isDisabled = true;

    // 예정 -> 등록, 등록 수정
    var CRUD = "R";
    // 마스터 데이터 세팅
    var masterDS = $NC.G_VAR.userData.P_MASTER_DS;
    $NC.setValue("#dtpEtc_Date", masterDS.ETC_DATE);
    $NC.setValue("#edtEtc_No", masterDS.ETC_NO);
    $NC.setValue("#edtRemark1", $NC.isNull(masterDS.REMARK1) ? "" : masterDS.REMARK1);
    // $NC.setValue("#cboInout_Cd", masterDS.INOUT_CD);

    $NC.G_VAR.masterData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      INOUT_CD: masterDS.INOUT_CD,
      ETC_DATE: masterDS.ETC_DATE,
      ETC_NO: masterDS.ETC_NO,
      REMARK1: $NC.getValue("#edtRemark1"),
      CRUD: CRUD
    }, setTimeout(function() {
      setInoutView(masterDS.INOUT_CD);
    }, 200);

    // SUB 데이터 세팅
    var inout_div = masterDS.INOUT_CD.substring(0, 1);
    var grdObject;
    if (inout_div == $NC.G_VAR.INOUT_IN) {
      grdObject = G_GRDSUB2; // 입고지시
    } else {
      grdObject = G_GRDSUB1; // 출고지시
    }
    var subDS = $NC.G_VAR.userData.P_SUB_DS;
    var rowData;
    grdObject.data.beginUpdate();
    try {
      for ( var row in subDS) {
        rowData = subDS[row];
        var CONFIRM_QTY = Number(rowData.CONFIRM_QTY);
        if (CONFIRM_QTY > 0) {
          var newRowData = {
            CENTER_CD: rowData.CENTER_CD,
            BU_CD: rowData.BU_CD,
            ETC_DATE: rowData.ETC_DATE,
            ETC_NO: rowData.ETC_NO,
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
            LOCATION_ID: "",
            CONFIRM_QTY: rowData.CONFIRM_QTY,
            ETC_DIV: rowData.ETC_DIV,
            ETC_DIV_F: rowData.ETC_DIV_F,
            ETC_COMMENT: rowData.ETC_COMMENT,
            QTY_IN_BOX: rowData.QTY_IN_BOX,
            PSTOCK_QTY: "",
            id: $NC.getGridNewRowId(),
            CRUD: CRUD
          };
          grdObject.data.addItem(newRowData);
        }
      }
    } finally {
      grdObject.data.endUpdate();
    }

    $("#dtpEtc_Date").datepicker("disable");

    $NC.setGridSelectRow(grdObject, 0);
  }

  // 수정일 경우 비활성화
  $NC.setEnable("#cboInout_Cd", !isDisabled);
  $NC.setEnable("#edtRemark1", !isDisabled);

  // 조회조건 - 입출고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "EZ",
      P_SUB_CD2: "DZ"
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
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $("#divSub1Input").outerHeight()
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
  $NC.resizeGrid("#grdSub1", clientWidth, clientHeight - $NC.G_OFFSET.stockGridHeight - $NC.G_LAYOUT.margin1
      - $NC.G_LAYOUT.border1);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdSub2", clientWidth, clientHeight);
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
        P_ITEM_CD: val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getItemInfo({
        queryId: "LC08010E.RS_POP_SUB3",
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onQItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        requestUrl: "/LC08010E/getDataSet.do",
        queryId: "LC08010E.RS_POP_SUB3",
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onQItemPopup, onQItemPopup);
    }
    break;
    /*
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
      onQItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onQItemPopup, onQItemPopup);
    }
    break;
    */
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BU_CD = $NC.getValue("#edtBu_Cd");
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
    return;
  case "VALID_DATE":
    if (!$NC.isNull(val)) {
      $NC.setValueDatePicker(view, val, "유통기한를 정확히 입력하십시오.");
    }
    return;
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
 * 현재고 조회
 */
function _Inquiry() {

  // 현재 수정모드면
  if (G_GRDSUB1.view.getEditorLock().isActive()) {
    G_GRDSUB1.view.getEditorLock().commitCurrentEdit();
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
    if ($NC.isNull(BANK_CD)) {
      // BANK_CD = $NC.G_VAR.CONSTS_DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM122);
      BANK_CD = "";
    }

    if ($NC.isNull(BAY_CD)) {
      // BAY_CD = $NC.G_VAR.CONSTS_DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM123);
      BAY_CD = "";
    }

    if ($NC.isNull(LEV_CD)) {
      // LEV_CD = $NC.G_VAR.CONSTS_DIV_LOC.substring(0, $NC.G_VAR.policyVal.CM124);
      LEV_CD = "";
    }

  //  var LOCATION_CD = "";
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
  $NC.serviceCall("/LC08010E/getDataSet.do", {
    P_QUERY_ID: "LC08010E.RS_POP_SUB1",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
//      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_STATE: ITEM_STATE,
//      P_ITEM_LOT: ITEM_LOT,
//      P_VALID_DATE: VALID_DATE,
//      P_BATCH_NO: BATCH_NO,
      P_LOCATION_CD: LOCATION_CD,
      P_STOCK_DATE: STOCK_DATE,
      P_USER_ID: $NC.G_USERINFO.USER_ID,
    })
  }, onGetDetail);

}

/**
 * 기타출고 지시내역 화면의 추가 버튼 클릭 이벤트 처리
 */
function _New() {

  // 기타입고지시 화면의 상품추가 버튼 클릭 시
  if ($NC.G_VAR.masterData.INOUT_CD.substring(0, 1) == $NC.G_VAR.INOUT_IN) {

    // 현재 수정모드면
    if (G_GRDSUB2.view.getEditorLock().isActive()) {
      G_GRDSUB2.view.getEditorLock().commitCurrentEdit();
    }

    // 현재 선택된 로우 Validation 체크
    if (G_GRDSUB2.lastRow != null) {
      if (!grdSub2OnBeforePost(G_GRDSUB2.lastRow)) {
        return;
      }
    }

    var rowCount = G_GRDSUB2.data.getLength();
    if (rowCount > 0) {
      // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
      var rowData = G_GRDSUB2.data.getItem(rowCount - 1);
      if (rowData.CRUD == "N") {
        $NC.setFocusGrid(G_GRDSUB2, rowCount - 1, G_GRDSUB2.view.getColumnIndex("ITEM_CD"), true);
        return;
      }
    }

    var loc = $NC.getValue("#edtLocation_Cd").split("-");
    // 지시내역 그리드 설정할 로케이션 선택했을 경우
    var newRowData = {
      CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      BU_CD: $NC.G_VAR.masterData.BU_CD,
      LOCATION_CD: $NC.getValue("#edtLocation_Cd"),
      ZONE_CD: loc[0],
      BANK_CD: loc[1],
      BAY_CD: loc[2],
      LEV_CD: loc[3],
      BRAND_CD: "",
      BRAND_NM: "",
      ITEM_CD: "",
      ITEM_NM: "",
      ITEM_STATE: "A",
      ITEM_STATE_F: $NC.getGridComboName(G_GRDSUB2, {
        colFullNameField: "ITEM_STATE_F",
        searchVal: "A",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
      ITEM_SPEC: "",
      ITEM_LOT: "00",
      VALID_DATE: "",
      BATCH_NO: "",
      LOCATION_ID: "",
      PSTOCK_QTY: "0",
      OUT_WAIT_QTY: "0",
      QTY_IN_BOX: "1",
      CONFIRM_QTY: "0",
      ETC_DIV: "99",
      ETC_DIV_F: $NC.getGridComboName(G_GRDSUB2, {
        colFullNameField: "ETC_DIV_F",
        searchVal: "99",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
      ETC_COMMENT: "",
      id: $NC.getGridNewRowId(),
      CRUD: "N"
    };
    G_GRDSUB2.data.addItem(newRowData);
    $NC.setGridSelectRow(G_GRDSUB2, rowCount);
    if (rowCount === 0) {
      $NC.setGridDisplayRows("#grdSub2", rowCount + 1, G_GRDSUB2.data.getLength());
    }

    // 수정 상태로 변경
    G_GRDSUB2.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdSub2OnNewRecord({
      row: rowCount,
      rowData: newRowData
    });
    // 부자재출고지시 화면의 추가 버튼 클릭 시
    return;
  }

  // 부자재출고지시 화면의 상품추가 버튼 클릭 시
  if ($NC.G_VAR.masterData.INOUT_CD.substring(0, 1) == $NC.G_VAR.INOUT_OUT) {
    // 현재 수정모드면
    if (G_GRDDETAIL.view.getEditorLock().isActive()) {
      G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
    }

    // 현재 선택된 로우 Validation 체크
    if (G_GRDSUB1.lastRow != null) {
      if (!grdSub1OnBeforePost(G_GRDSUB1.lastRow)) {
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
    var searchKey = ["BRAND_CD", "ITEM_CD", "ITEM_STATE", "ITEM_LOT", "VALID_DATE", "BATCH_NO", "LOCATION_CD"];
    for ( var row = 0; row < rows.length; row++) {
      var rowSubData = G_GRDDETAIL.data.getItem(rows[row]);

      var searchVal = [rowSubData.BRAND_CD, rowSubData.ITEM_CD, rowSubData.ITEM_STATE, rowSubData.ITEM_LOT,
          rowSubData.VALID_DATE, rowSubData.BATCH_NO, rowSubData.LOCATION_CD];
      if ($NC.getGridSearchVal(G_GRDSUB1, {
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

    // 선택한 행이 모두 이미 지시내역 그리드에 존재할 경우
    if (detailDs.length == 0) {
      return;
    }

    var rowCount = G_GRDSUB1.data.getLength();
    // 지시내역 그리드 설정할 로케이션 선택했을 경우
    for ( var row in detailDs) {
      rowData = detailDs[row];
      var loc = rowData.LOCATION_CD.split("-");
      var newRowData = {
        CENTER_CD: rowData.CENTER_CD,
        BU_CD: rowData.BU_CD,
        LOCATION_CD: rowData.LOCATION_CD,
        ZONE_CD: loc[0],
        BANK_CD: loc[1],
        BAY_CD: loc[2],
        LEV_CD: loc[3],
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
        LOCATION_ID: rowData.LOCATION_ID,
        PSTOCK_QTY: rowData.PSTOCK_QTY,
        OUT_WAIT_QTY: rowData.OUT_WAIT_QTY,
        QTY_IN_BOX: rowData.QTY_IN_BOX,
        CONFIRM_QTY: rowData.PSTOCK_QTY, // 이동수량
        ETC_DIV: "99",
        ETC_DIV_F: $NC.getGridComboName(G_GRDSUB1, {
          colFullNameField: "ETC_DIV_F",
          searchVal: "99",
          dataCodeField: "CODE_CD",
          dataFullNameField: "CODE_CD_F"
        }),
        ETC_COMMENT: "",
        id: $NC.getGridNewRowId(),
        CRUD: "C"
      };
      G_GRDSUB1.data.addItem(newRowData);
    }
    $NC.setGridSelectRow(G_GRDSUB1, rowCount);
    $NC.setGridDisplayRows("#grdSub1", rowCount + 1, G_GRDSUB1.data.getLength());

    // 수정 상태로 변경
    G_GRDSUB1.lastRowModified = true;
    return;
  }

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

  var grdObject;
  if ($NC.G_VAR.masterData.INOUT_CD.substring(0, 1) == $NC.G_VAR.INOUT_IN) {
    grdObject = G_GRDSUB2;
  } else {
    grdObject = G_GRDSUB1;
  }

  if (grdObject.data.getLength() == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
    alert("물류센터를 입력하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
    alert("먼저 출고구분을 선택하십시오.");
    $NC.setFocus("#cboInout_Cd");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.ETC_DATE)) {
    alert("먼저 입출고일자를 입력하십시오.");
    $NC.setFocus("#dtpEtc_Date");
    return;
  }

  if (grdObject.data.getLength() == 0) {
    alert("기타출고 지시내역을 입력하십시오.");
    return;
  }

  // 현재 수정모드면
  if (grdObject.view.getEditorLock().isActive()) {
    grdObject.view.getEditorLock().commitCurrentEdit();
  }

  // 현재 선택된 로우 Validation 체크
  if (grdObject.lastRow != null) {
    if (!grdSubOnBeforePost(grdObject.lastRow)) {
      return;
    }
  }

  // 지시내역 그리드 저장
  var d_DS = [ ];
  var c_DS = [ ];
  var rows = grdObject.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      if (Number(rowData.CONFIRM_QTY) > 0) {
        var saveData = {
          P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
          P_BU_CD: $NC.G_VAR.masterData.BU_CD,
          P_ETC_DATE: $NC.G_VAR.masterData.ETC_DATE,
          P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
          P_ETC_NO: $NC.G_VAR.masterData.ETC_NO,
          P_ETC_DIV: rowData.ETC_DIV,
          P_ETC_COMMENT: $NC.isNull(rowData.ETC_COMMENT) ? "" : rowData.ETC_COMMENT,
          P_LOCATION_CD: rowData.LOCATION_CD,
          P_BRAND_CD: rowData.BRAND_CD,
          P_ITEM_CD: rowData.ITEM_CD,
          P_ITEM_STATE: rowData.ITEM_STATE,
          P_ITEM_LOT: rowData.ITEM_LOT,
          P_VALID_DATE: $NC.isNull(rowData.VALID_DATE) ? "" : rowData.VALID_DATE,
          P_BATCH_NO: $NC.isNull(rowData.BATCH_NO) ? "" : rowData.BATCH_NO,
          P_CONFIRM_QTY: rowData.CONFIRM_QTY,
          P_LINE_NO: rowData.LINE_NO, // 삭제시에 사용
          P_CRUD: rowData.CRUD
        };
        if (rowData.CRUD === "D") {
          d_DS.push(saveData);
        } else {
          c_DS.push(saveData);
        }
      }
    }
  }

  // 에러방지 위해, 신규 + 삭제 순으로 DS 구성
  var subDS = c_DS.concat(d_DS);

  if ($NC.G_VAR.masterData.CRUD !== "C" && subDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  if ($NC.G_VAR.masterData.CRUD === "C" && subDS.length === 0) {
    alert("저장할 지시내역 정보가 없습니다.");
    return;
  }

  $NC.serviceCall("/LC08010E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_ETC_DATE: $NC.G_VAR.masterData.ETC_DATE,
      P_ETC_NO: $NC.G_VAR.masterData.ETC_NO,
      P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
      P_REMARK1: $NC.G_VAR.masterData.REMARK1,
      P_CRUD: $NC.G_VAR.masterData.CRUD
    }),
    P_DS_SUB: $NC.toJson(subDS),
    P_PROCESS_CD: $NC.G_VAR.userData.P_PROCESS_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError);
}

/**
 * 삭제 버튼 클릭 이벤트 처리
 */
function _Delete() {

  var grdObject;
  if ($NC.G_VAR.masterData.INOUT_CD.substring(0, 1) == $NC.G_VAR.INOUT_IN) {
    grdObject = G_GRDSUB2;
  } else {
    grdObject = G_GRDSUB1;
  }

  if (grdObject.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  if (grdObject.lastRow == null) {
    alert("삭제할 데이터를 선택하십시오");
    return;
  }

  // SUB1 / SUB2 그리드 삭
  var rowData = grdObject.data.getItem(grdObject.lastRow);
  // 신규 데이터일 경우 그냥 삭제
  if (rowData.CRUD === "C" || rowData.CRUD === "N") {
    grdObject.data.deleteItem(rowData.id);
  } else {
    rowData.CRUD = "D";
    grdObject.data.updateItem(rowData.id, rowData);
    grdObject.data.refresh();
  }

  // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
  if (grdObject.lastRow > 1) {
    $NC.setGridSelectRow(grdObject, grdObject.lastRow - 1);
  } else {
    grdObject.lastRow = null;
    $NC.setGridSelectRow(grdObject, 0);
  }

  // 마지막 선택 Row 수정 상태 복원
  grdObject.lastRowModified = false;
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
  case "INOUT_CD":
    setInoutView(args.val);
    $NC.G_VAR.masterData.INOUT_CD = args.val;
    break;
  case "ETC_NO":
    $NC.G_VAR.masterData.ETC_NO = args.val;
    break;
  case "REMARK1":
    $NC.G_VAR.masterData.REMARK1 = args.val;
    break;
  }

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }

}

/**
 * 입출고구분에 따라 화면 표시 변환
 * 
 * @param inout_cd
 */
function setInoutView(inout_cd) {
  if (inout_cd.substring(0, 1) == $NC.G_VAR.INOUT_IN) {
    $("#divDetailView").hide();
    $("#divSub1View").hide();
    $NC.setEnable("#divItemSearch :input", false);
    $NC.setEnable("#btnSearchStock", false);
    $("#divSub2View").show();
    G_GRDSUB2.view.resizeCanvas();
  } else {
    $("#divDetailView").show();
    $("#divSub1View").show();
    $NC.setEnable("#divItemSearch :input");
    $NC.setEnable("#btnSearchStock");
    $("#divSub2View").hide();
  }
  $NC.setEnable("#edtQZone_Nm", false);
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 40,
    maxWidth: 40,
    resizable: false,
    sortable: false,
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
    minWidth: 90,
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
    minWidth: 100,
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
    queryId: null,
    sortCol: "LINE_NO",
    gridOptions: options,
    canExportExcel: false
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onHeaderClick.subscribe(grdDetailOnHeaderClick);
  G_GRDDETAIL.view.onClick.subscribe(grdDetailOnClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDDETAIL, "CHECK_YN");
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
 * grdSub2 데이터(기타입출고 지시 데이터) 필터링 이벤트
 */
function grdSub1OnFilter(item) {

  return item.CRUD !== "D";
}

/**
 * grdSub2 데이터(기타입출고 지시 데이터) 필터링 이벤트
 */
function grdSub2OnFilter(item) {

  return item.CRUD !== "D";
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdSub1OnNewRecord(args) {

  $NC.setFocusGrid(G_GRDSUB1, args.row, G_GRDSUB1.view.getColumnIndex("CONFIRM_QTY"), true);
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdSub2OnNewRecord(args) {

  $NC.setFocusGrid(G_GRDSUB2, args.row, G_GRDSUB2.view.getColumnIndex("ITEM_CD"), true);
}

/**
 * 그리드의 입력 체크
 */
function grdSubOnBeforePost(row) {

  // 입고지시 내역일 경우
  if ($NC.G_VAR.masterData.INOUT_CD.substring(0, 1) == $NC.G_VAR.INOUT_IN) {
    return grdSub2OnBeforePost(row);
    // 출고지시 내역일 경우
  } else {
    return grdSub1OnBeforePost(row);
  }

}

/**
 * 현재고 그리드 입력 체크
 */
function grdSub1OnBeforePost(row) {

  if (!G_GRDSUB1.lastRowModified) {
    return true;
  }

  var rowData = G_GRDSUB1.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.ITEM_CD)) {
      G_GRDSUB1.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDSUB1, row - 1);
        setTimeout(function() {
          $NC.setGridDisplayRows("#grdSub1", row, G_GRDSUB1.data.getLength());
        }, 300);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.CONFIRM_QTY)) {
      alert("등록수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUB1, {
        selectRow: row,
        activeCell: G_GRDSUB1.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return false;
    }
    if (rowData.CRUD != "U" && Number(rowData.PSTOCK_QTY) < Number(rowData.CONFIRM_QTY)) {
      alert("재고수량 보다 많은 수량을 입력하실 수 없습니다.");
      rowData.CONFIRM_QTY = "0";
      $NC.setGridSelectRow(G_GRDSUB1, {
        selectRow: row,
        activeCell: G_GRDSUB1.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDSUB1.data.updateItem(rowData.id, rowData);
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

function grdSub2OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 95,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdSub2OnPopup,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 140
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
    cssClass: "align-center",
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "ITEM_STATE",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "ITEM_STATE",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 70,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 100,
    editor: Slick.Editors.Popup,
    cssClass: "align-center",
    editorOptions: {
      onPopup: grdSub2OnPopup,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "VALID_DATE",
    field: "VALID_DATE",
    name: "유통기한",
    minWidth: 95,
    cssClass: "align-center",
    editor: Slick.Editors.Date
  });
  $NC.setGridColumn(columns, {
    id: "BATCH_NO",
    field: "BATCH_NO",
    name: "제조배치번호",
    minWidth: 100,
    editor: Slick.Editors.Text
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
    minWidth: 150,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 기타입고 지시 데이터 그리드 초기값 설정
 */
function grdSub2Initialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub2", {
    columns: grdSub2OnGetColumns(),
    queryId: null,
    sortCol: "LINE_NO",
    gridOptions: options,
    canExportExcel: false,
    onFilter: grdSub2OnFilter
  });

  G_GRDSUB2.view.onSelectedRowsChanged.subscribe(grdSub2OnAfterScroll);
  G_GRDSUB2.view.onBeforeEditCell.subscribe(grdSub2OnBeforeEditCell);
  G_GRDSUB2.view.onCellChange.subscribe(grdSub2OnCellChange);
}

/**
 * 기타입출고 지시 데이터 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdSub2OnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDSUB2.lastRow != null) {
    if (row == G_GRDSUB2.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
    if (!grdSub2OnBeforePost(G_GRDSUB2.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub2", row + 1);
}

/**
 * 기타입출고 지시 데이터 그리드 수정일 경우 편집 불가 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdSub2OnBeforeEditCell(e, args) {

  var rowData = args.item;
  if (rowData.CRUD == "R" || rowData.CRUD == "U") {
    if (args.cell === G_GRDSUB2.view.getColumnIndex("ETC_DIV_F")
        || args.cell === G_GRDSUB2.view.getColumnIndex("ETC_COMMENT")) {
      return true;
    } else {
      return false;
    }
  }

  return true;
}

/**
 * 기타입출고 지시 데이터 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdSub2OnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDSUB2.view.getColumnField(args.cell)) {
  case "LOCATION_CD":
    if (!$NC.isNull(rowData.LOCATION_CD)) {
      var P_QUERY_PARAMS;
      var O_RESULT_DATA = [ ];
      if (!$NC.isNull(rowData.LOCATION_CD)) {
        // 데이터 조회
        P_QUERY_PARAMS = {
          P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
          P_ZONE_CD: "",
          P_BANK_CD: "",
          P_BAY_CD: "",
          P_LEV_CD: "",
          P_LOCATION_CD: rowData.LOCATION_CD
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
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.ITEM_CD)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.getValue("#edtBu_Cd"),
        P_ITEM_CD: rowData.ITEM_CD,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getItemInfo({
        queryId: "LC08010E.RS_POP_SUB3",
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onGridItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        requestUrl: "/LC08010E/getDataSet.do",
        queryId: "LC08010E.RS_POP_SUB3",
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onGridItemPopup, onGridItemPopup);
    }
    break;
    /*
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.ITEM_CD)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.getValue("#edtBu_Cd"),
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
    */
  case "VALID_DATE":
    if (!$NC.isNull(rowData.VALID_DATE)) {
      if (!$NC.isDate(rowData.VALID_DATE)) {
        alert("유통기한을 정확히 입력하십시오.");
        rowData.VALID_DATE = "";
        G_GRDSUB2.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDSUB2, {
          selectRow: args.row,
          activeCell: G_GRDSUB2.view.getColumnIndex("VALID_DATE"),
          editMode: true
        });
        return false;
      } else {
        rowData.VALID_DATE = $NC.getDate(rowData.VALID_DATE);
        G_GRDSUB2.data.updateItem(rowData.id, rowData);
      }
    }
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUB2.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUB2.lastRowModified = true;
}

function grdSub1OnGetColumns() {

  var columns = [ ];
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
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 140
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
    minWidth: 60,
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
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PSTOCK_QTY",
    field: "PSTOCK_QTY",
    name: "재고수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
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
    minWidth: 150,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 현재고 데이터 그리드 초기값 설정
 */
function grdSub1Initialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub1", {
    columns: grdSub1OnGetColumns(),
    queryId: null,
    sortCol: "LINE_NO",
    gridOptions: options,
    canExportExcel: false,
    onFilter: grdSub1OnFilter
  });

  G_GRDSUB1.view.onSelectedRowsChanged.subscribe(grdSub1OnAfterScroll);
  G_GRDSUB1.view.onBeforeEditCell.subscribe(grdSub1OnBeforeEditCell);
  G_GRDSUB1.view.onCellChange.subscribe(grdSub1OnCellChange);
}

/**
 * 현재고 데이터 그리드 행 선택 변경 했을 경우
 * 
 * @param e
 * @param args
 */
function grdSub1OnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDSUB1.lastRow != null) {
    if (row == G_GRDSUB1.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdSub1OnBeforePost(G_GRDSUB1.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub1", row + 1);
}

/**
 * 현재고 데이터 그리드 편집 불가 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdSub1OnBeforeEditCell(e, args) {

  var rowData = args.item;
  if (rowData.CRUD == "R" || rowData.CRUD == "U") {
    if (args.cell === G_GRDSUB1.view.getColumnIndex("ETC_DIV_F")
        || args.cell === G_GRDSUB1.view.getColumnIndex("ETC_COMMENT")) {
      return true;
    } else {
      return false;
    }
  }

  if (!G_GRDSUB1.lastRowModified) {
    return true;
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDSUB1.data.updateItem(rowData.id, rowData);
  }

  return true;
}

/**
 * 현재고 데이터 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdSub1OnCellChange(e, args) {

  var rowData = args.item;

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUB1.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUB1.lastRowModified = true;
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
    $NC.serviceCallAndWait("/LC08010E/callSP.do", {
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
 * 기타입고 지시내역 그리드의 로케이션 검색 팝업창에서 행 클릭 혹은 취소 했을 경우 처리
 * 
 * @param resultInfo
 */

function onGridLocationPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {

    if (G_GRDSUB2.view.getEditorLock().isActive()) {
      G_GRDSUB2.view.getEditorLock().cancelCurrentEdit();
    }

    var rowData = G_GRDSUB2.data.getItem(G_GRDSUB2.lastRow);
    if (rowData) {
      rowData.LOCATION_CD = resultInfo.LOCATION_CD;

      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDSUB2.data.updateItem(rowData.id, rowData);

      // 수정 상태로 변경
      G_GRDSUB2.lastRowModified = true;

      $NC.setFocusGrid(G_GRDSUB2, G_GRDSUB2.lastRow, G_GRDSUB2.view.getColumnIndex("CONFIRM_QTY"), true, true);
    }
  } else {
    var rowData = G_GRDSUB2.data.getItem(G_GRDSUB2.lastRow);
    if (rowData) {
      rowData.LOCATION_CD = "";

      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDSUB2.data.updateItem(rowData.id, rowData);

      // 수정 상태로 변경
      G_GRDSUB2.lastRowModified = true;

      $NC.setFocusGrid(G_GRDSUB2, G_GRDSUB2.lastRow, G_GRDSUB2.view.getColumnIndex("LOCATION_CD"), true, true);
    }
  }
}

/**
 * 그리드의 로케이션 / 상품의 검색 버튼 클릭시 처리
 */
function grdSub2OnPopup(e, args) {

  switch (args.column.field) {
  case "LOCATION_CD":
    $NP.showLocationPopup({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_ZONE_CD: "",
      P_BANK_CD: "",
      P_BAY_CD: "",
      P_LEV_CD: "",
      P_LOCATION_CD: "%"
    }, onGridLocationPopup, function() {
      $NC.setFocusGrid(G_GRDSUB2, G_GRDSUB2.lastRow, G_GRDSUB2.view.getColumnIndex("LOCATION_CD"), true, true);
    });
    break;
  case "ITEM_CD":
    $NP.showItemPopup({
      requestUrl: "/LC08010E/getDataSet.do",
      queryId: "LC08010E.RS_POP_SUB3",
      queryParams: {
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_ITEM_CD: "%",
      P_VIEW_DIV: "2",
      }
    }, onGridItemPopup, function() {
      $NC.setFocusGrid(G_GRDSUB2, G_GRDSUB2.lastRow, G_GRDSUB2.view.getColumnIndex("ITEM_CD"), true, true);
    });
    /*
    $NP.showItemPopup({
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_ITEM_CD: "%",
      P_VIEW_DIV: "1",
      P_DEPART_CD: "%",
      P_LINE_CD: "%",
      P_CLASS_CD: "%"
    }, onGridItemPopup, function() {
      $NC.setFocusGrid(G_GRDSUB2, G_GRDSUB2.lastRow, G_GRDSUB2.view.getColumnIndex("ITEM_CD"), true, true);
    });
    */
    break;
  }
}

/**
 * 기타입고 지시내역 그리드 입력 체크
 */
function grdSub2OnBeforePost(row) {

  if (!G_GRDSUB2.lastRowModified) {
    return true;
  }
  var rowData = G_GRDSUB2.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.ITEM_CD)) {
      G_GRDSUB2.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDSUB2, row - 1);
        setTimeout(function() {
          $NC.setGridDisplayRows("#grdSub2", row, G_GRDSUB2.data.getLength());
        }, 300);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.ITEM_CD)) {
      alert("상품코드를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDSUB2, {
        selectRow: row,
        activeCell: G_GRDSUB2.view.getColumnIndex("ITEM_CD"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.ITEM_STATE)) {
      alert("상태를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDSUB2, {
        selectRow: row,
        activeCell: G_GRDSUB2.view.getColumnIndex("ITEM_STATE_F"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.ITEM_LOT)) {
      alert("LOT번호를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUB2, {
        selectRow: row,
        activeCell: G_GRDSUB2.view.getColumnIndex("ITEM_LOT"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.LOCATION_CD)) {
      alert("로케이션을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUB2, {
        selectRow: row,
        activeCell: G_GRDSUB2.view.getColumnIndex("LOCATION_CD"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.CONFIRM_QTY) || Number(rowData.CONFIRM_QTY) == 0) {
      alert("등록수량에 0보다 큰 수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUB2, {
        selectRow: row,
        activeCell: G_GRDSUB2.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.ETC_DIV)) {
      alert("사유구분을 선택하십시오.");
      $NC.setGridSelectRow(G_GRDSUB2, {
        selectRow: row,
        activeCell: G_GRDSUB2.view.getColumnIndex("ETC_DIV_F"),
        editMode: true
      });
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDSUB2.data.updateItem(rowData.id, rowData);
  }
  return true;
}

/**
 * 상품 검색 팝업 표시
 */
function showQItemPopup() {

  $NP.showItemPopup({
    requestUrl: "/LC08010E/getDataSet.do",
    queryId: "LC08010E.RS_POP_SUB3",
    queryParams: {
    P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
    P_ITEM_CD: "%",
    P_VIEW_DIV: "2",
    }
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
 * (그리드) 상품 검색 팝업에서 상품선택 혹은 취소 했을 경우
 */
function onGridItemPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    if (G_GRDSUB2.view.getEditorLock().isActive()) {
      G_GRDSUB2.view.getEditorLock().cancelCurrentEdit();
    }
    var rowData = G_GRDSUB2.data.getItem(G_GRDSUB2.lastRow);
    if (rowData) {
      rowData.ITEM_CD = resultInfo.ITEM_CD;
      rowData.ITEM_NM = resultInfo.ITEM_NM;
      rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
      rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;
      rowData.BRAND_CD = resultInfo.BRAND_CD;
      rowData.BRAND_NM = resultInfo.BRAND_NM;
      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDSUB2.data.updateItem(rowData.id, rowData);
      // 수정 상태로 변경
      G_GRDSUB2.lastRowModified = true;
      // alert(G_GRDSUB2.view.getColumnIndex("ITEM_CD"));
      $NC.setFocusGrid(G_GRDSUB2, G_GRDSUB2.lastRow, G_GRDSUB2.view.getColumnIndex("LOCATION_CD"), true, true);

    }
  } else {
    var rowData = G_GRDSUB2.data.getItem(G_GRDSUB2.lastRow);
    if (rowData) {
      rowData.ITEM_CD = "";
      rowData.ITEM_NM = "";
      rowData.QTY_IN_BOX = "1";
      rowData.BRAND_CD = "";
      rowData.BRAND_NM = "";

      if (rowData.CRUD === "R") {
        rowData.CRUD = "U";
      }
      G_GRDSUB2.data.updateItem(rowData.id, rowData);

      // 수정 상태로 변경
      G_GRDSUB2.lastRowModified = true;

      $NC.setFocusGrid(G_GRDSUB2, G_GRDSUB2.lastRow, G_GRDSUB2.view.getColumnIndex("ITEM_CD"), true, true);
    }
  }
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

  var BU_CD = $NC.getValue("#edtBu_Cd");

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