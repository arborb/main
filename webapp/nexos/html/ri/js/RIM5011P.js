/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null
  });

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "SHIP_COST_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: "",
    })
  }, {
    selector: "#cboShip_Cost_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboShip_Cost_Div");
      } else {
        $NC.setValue("#cboShip_Cost_Div", $NC.G_VAR.masterData.SHIP_COST_DIV);
      }
    }

  });

  // 조회조건 - 온라인반입구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "EM",
      P_SUB_CD2: "%"
    })
  }, {
    selector: "#cboInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboInout_Cd");
      } else {
        $NC.setValue("#cboInout_Cd", $NC.G_VAR.masterData.INOUT_CD);
      }
    }
  });

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel);

  $("#btnShipper_Zip_Cd").click(showPostPopup);
  $("#btnCarrier_Cd").click(showCarrierPopup);

  $("#btnEntryNew").click(_New);
  $("#btnEntryDelete").click(_Delete);
  $("#btnEntrySave").click(_Save);

  $NC.setInitDatePicker("#dtpInbound_Date");

  // 그리드 초기화
  grdDetailInitialize();
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

    var INOUT_CD = $NC.getValue("#cboInout_Cd");
    var INBOUND_DATE = $NC.getValue("#dtpInbound_Date");
    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      INBOUND_DATE: INBOUND_DATE,
      INBOUND_NO: "",
      INOUT_CD: INOUT_CD,
      INBOUND_DATE: INBOUND_DATE,
      INBOUND_NO: "",
      SHIPPER_NM: "",
      SHIPPER_TEL: "",
      SHIPPER_HP: "",
      SHIPPER_ZIP_CD: "",
      SHIPPER_ADDR_BASIC: "",
      SHIPPER_ADDR_DETAIL: "",
      CARRIER_CD: "",
      WB_NO: "",
      SHIP_COST_DIV: "1",
      SHIP_COST: "",
      REMARK1: "",
      BU_DATE: "",
      BU_NO: "",
      REMARK1: "",
      ORDER_YN: "N",
      CRUD: "C"
    };

  } else {
    // 마스터 disable여부 설정
    isDisable = true;
    var CRUD = "R";
    // 마스터 데이터 세팅
    var masterDS = $NC.G_VAR.userData.P_MASTER_DS;

    $NC.G_VAR.masterData = {
      CENTER_CD: masterDS.CENTER_CD,
      BU_CD: masterDS.BU_CD,
      INBOUND_DATE: masterDS.INBOUND_DATE,
      INBOUND_NO: masterDS.INBOUND_NO,
      INOUT_CD: masterDS.INOUT_CD,
      SHIPPER_NM: masterDS.SHIPPER_NM,
      SHIPPER_TEL: masterDS.SHIPPER_TEL,
      SHIPPER_HP: masterDS.SHIPPER_HP,
      SHIPPER_ZIP_CD: masterDS.SHIPPER_ZIP_CD,
      SHIPPER_ADDR_BASIC: masterDS.SHIPPER_ADDR_BASIC,
      SHIPPER_ADDR_DETAIL: masterDS.SHIPPER_ADDR_DETAIL,
      CARRIER_CD: masterDS.CARRIER_CD,
      CARRIER_NM: masterDS.CARRIER_NM,
      WB_NO: masterDS.WB_NO,
      SHIP_COST_DIV: masterDS.SHIP_COST_DIV,
      SHIP_COST: masterDS.SHIP_COST,
      BU_DATE: masterDS.BU_DATE,
      BU_NO: masterDS.BU_NO,
      REMARK1: masterDS.REMARK1,
      ORDER_YN: masterDS.ORDER_YN,
      CRUD: CRUD
    };

    $NC.setValue("#dtpInbound_Date", $NC.G_VAR.masterData.INBOUND_DATE);
    $NC.setValue("#edtInbound_No", $NC.G_VAR.masterData.INBOUND_NO);
    $NC.setValue("#cboInout_Cd", $NC.G_VAR.masterData.INOUT_CD);

    $NC.setValue("#edtRemark1", $NC.G_VAR.masterData.REMARK1);
    $NC.setValue("#edtBu_Date", $NC.G_VAR.masterData.BU_DATE);
    $NC.setValue("#edtBu_No", $NC.G_VAR.masterData.BU_NO);

    $NC.setValue("#edtShipper_Nm", $NC.G_VAR.masterData.SHIPPER_NM);
    $NC.setValue("#edtShipper_Tel", $NC.G_VAR.masterData.SHIPPER_TEL);
    $NC.setValue("#edtShipper_Hp", $NC.G_VAR.masterData.SHIPPER_HP);
    $NC.setValue("#edtShipper_Zip_Cd", $NC.G_VAR.masterData.SHIPPER_ZIP_CD);
    $NC.setValue("#edtShipper_Addr_Basic", $NC.G_VAR.masterData.SHIPPER_ADDR_BASIC);
    $NC.setValue("#edtShipper_Addr_Detail", $NC.G_VAR.masterData.SHIPPER_ADDR_DETAIL);

    $NC.setValue("#edtCarrier_Cd", $NC.G_VAR.masterData.CARRIER_CD);
    $NC.setValue("#edtCarrier_Nm", $NC.G_VAR.masterData.CARRIER_NM);
    $NC.setValue("#edtWb_No", $NC.G_VAR.masterData.WB_NO);
    $NC.setValue("#cboShip_Cost_Div", $NC.G_VAR.masterData.SHIP_COST_DIV);
    $NC.setValue("#edtShip_Cost", $NC.G_VAR.masterData.SHIP_COST);

    // 수령자 정보 모두 Disabled
    $("#divMasterView .sub-table-data").prop("disabled", true);
    // 디테일 데이터 세팅
    var detailDS = $NC.G_VAR.userData.P_DETAIL_DS;
    var rowData;
    G_GRDDETAIL.data.beginUpdate();
    try {
      for ( var row in detailDS) {
        rowData = detailDS[row];
        var ENTRY_QTY = Number(rowData.ENTRY_QTY);
        if (ENTRY_QTY > 0) {
          var newRowData = {
            CENTER_CD: rowData.CENTER_CD,
            BU_CD: rowData.BU_CD,
            INBOUND_DATE: rowData.INBOUND_DATE,
            INBOUND_NO: rowData.INBOUND_NO,
            LINE_NO: rowData.LINE_NO,
            BRAND_CD: rowData.BRAND_CD,
            BRAND_NM: rowData.BRAND_NM,
            ITEM_CD: rowData.ITEM_CD,
            ITEM_NM: rowData.ITEM_NM,
            ITEM_SPEC: rowData.ITEM_SPEC,
            ITEM_STATE: rowData.ITEM_STATE,
            ITEM_STATE_F: rowData.ITEM_STATE_F,
            ITEM_LOT: rowData.ITEM_LOT,
            QTY_IN_BOX: rowData.QTY_IN_BOX,
            ENTRY_QTY: rowData.ENTRY_QTY,
            ENTRY_BOX: rowData.ENTRY_BOX,
            ENTRY_EA: rowData.ENTRY_EA,
            ENTRY_WEIGHT: rowData.ENTRY_WEIGHT,
            BOX_WEIGHT: rowData.BOX_WEIGHT,
            BU_LINE_NO: rowData.BU_LINE_NO,
            BU_KEY: rowData.BU_KEY,
            REMARK1: rowData.REMARK1,
            id: $NC.getGridNewRowId(),
            CRUD: CRUD
          };
          G_GRDDETAIL.data.addItem(newRowData);
        }
      }
    } finally {
      G_GRDDETAIL.data.endUpdate();
    }
    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

  // 수정일 경우 입력불가 항목 비활성화 처리
  setMasterDisable(isDisable);
}

function setMasterDisable(isDisable) {

  // 수정일 경우 입력불가 항목 비활성화 처리
  $NC.setEnable("#cboInout_Cd", !isDisable);
  $NC.setEnable("#dtpInbound_Date", !isDisable);
  $NC.setEnable("#btnShipper_Zip_Cd", !isDisable);
  $NC.setEnable("#edtCarrier_Cd", !isDisable);
  $NC.setEnable("#btnCarrier_Cd", !isDisable);
  $NC.setEnable("#cboShip_Cost_Div", !isDisable);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 325;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_LAYOUT.border1 - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, $NC.G_OFFSET.masterViewHeight);
  $NC.resizeContainer("#divDetailView", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight
      - $NC.G_LAYOUT.margin1);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - $NC.G_LAYOUT.header
      - $NC.G_LAYOUT.margin1);
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

  // 온라인 데이터의 값 변경
  if (view.is(".sub-table-data")) {
    id = view.prop("id").substr(3).toUpperCase();
    masterDataOnChange(e, {
      col: id,
      val: val,
      view: view
    });
  }
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

  var rowCount = G_GRDDETAIL.data.getLength();
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDDETAIL.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      $NC.setFocusGrid(G_GRDDETAIL, rowCount - 1, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
      return;
    }
  }
  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
    BU_CD: $NC.G_VAR.masterData.BU_CD,
    INBOUND_DATE: $NC.G_VAR.masterData.INBOUND_DATE,
    INBOUND_NO: $NC.G_VAR.masterData.INBOUND_NO,
    LINE_NO: "",
    BRAND_CD: "",
    BRAND_NM: "",
    ITEM_CD: "",
    ITEM_NM: "",
    ITEM_SPEC: "",
    ITEM_STATE: $NC.G_VAR.userData.P_POLICY_RI240,
    ITEM_STATE_F: $NC.getGridComboName(G_GRDDETAIL, {
      colFullNameField: "ITEM_STATE_F",
      searchVal: $NC.G_VAR.userData.P_POLICY_RI240,
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F"
    }),
    ITEM_LOT: "00",
    QTY_IN_BOX: 1,
    ENTRY_QTY: 0,
    ENTRY_BOX: 0,
    ENTRY_EA: 0,
    ENTRY_WEIGHT: 0,
    BOX_WEIGHT: 0,
    BU_LINE_NO: "",
    BU_KEY: "",
    REMARK1: "",
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };

  G_GRDDETAIL.data.addItem(newRowData);
  $NC.setGridSelectRow(G_GRDDETAIL, rowCount);
  if (rowCount === 0) {
    $NC.setGridDisplayRows("#grdDetail", rowCount + 1);
  }

  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;

  // 신규 데이터 생성 후 이벤트 호출
  grdDetailOnNewRecord({
    row: rowCount,
    rowData: newRowData
  });
}

/**
 * 저장
 */
function _Save() {

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
    alert("물류센터가 지정되어 있지 않습니다. 다시 작업하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
    alert("사업부가 지정되어 있지 않습니다. 다시 작업하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.INBOUND_DATE)) {
    alert("먼저 반입일자를 입력하십시오.");
    $NC.setFocus("#dtpInbound_Date");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.INOUT_CD)) {
    alert("먼저 반입구분을 선택하십시오.");
    $NC.setFocus("#cboInout_Cd");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.SHIPPER_NM)) {
    alert("먼저 수령자를 선택하십시오.");
    $NC.setFocus("#edtShipper_Nm");
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

  var d_DS = [ ];
  var cu_DS = [ ];
  // var rowCount = G_GRDSUBC.data.getLength();
  // 필터링 된 데이터라 전체 데이터를 기준으로 처리
  var rows = G_GRDDETAIL.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_INBOUND_DATE: $NC.G_VAR.masterData.INBOUND_DATE,
        P_INBOUND_NO: $NC.G_VAR.masterData.INBOUND_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_BRAND_CD: rowData.BRAND_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_ITEM_STATE: rowData.ITEM_STATE,
        P_ITEM_LOT: rowData.ITEM_LOT,
        P_ENTRY_QTY: rowData.ENTRY_QTY,
        P_BU_LINE_NO: rowData.BU_LINE_NO,
        P_BU_KEY: rowData.BU_KEY,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      if (rowData.CRUD === "D") {
        d_DS.push(saveData);
      } else {
        cu_DS.push(saveData);
      }
    }
  }
  var detailDS = d_DS.concat(cu_DS);
  if ($NC.G_VAR.masterData.CRUD === "R" && detailDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/RIM5010E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_INBOUND_DATE: $NC.G_VAR.masterData.INBOUND_DATE,
      P_INBOUND_NO: $NC.G_VAR.masterData.INBOUND_NO,
      P_INOUT_CD: $NC.G_VAR.masterData.INOUT_CD,
      P_SHIPPER_NM: $NC.G_VAR.masterData.SHIPPER_NM,
      P_SHIPPER_TEL: $NC.G_VAR.masterData.SHIPPER_TEL,
      P_SHIPPER_HP: $NC.G_VAR.masterData.SHIPPER_HP,
      P_SHIPPER_ZIP_CD: $NC.G_VAR.masterData.SHIPPER_ZIP_CD,
      P_SHIPPER_ADDR_BASIC: $NC.G_VAR.masterData.SHIPPER_ADDR_BASIC,
      P_SHIPPER_ADDR_DETAIL: $NC.G_VAR.masterData.SHIPPER_ADDR_DETAIL,
      P_CARRIER_CD: $NC.G_VAR.masterData.CARRIER_CD,
      P_WB_NO: $NC.G_VAR.masterData.WB_NO,
      P_SHIP_COST_DIV: $NC.G_VAR.masterData.SHIP_COST_DIV,
      P_SHIP_COST: $NC.G_VAR.masterData.SHIP_COST,
      P_BU_DATE: $NC.G_VAR.masterData.BU_DATE,
      P_BU_NO: $NC.G_VAR.masterData.BU_NO,
      P_REMARK1: $NC.G_VAR.masterData.REMARK1,
      P_ORDER_YN: $NC.G_VAR.masterData.ORDER_YN,
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

function masterDataOnChange(e, args) {

  switch (args.col) {
  case "CARRIER_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      P_QUERY_PARAMS = {
        P_CARRIER_CD: args.val,
        P_VIEW_DIV: "%"
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
  case "INOUT_CD":
    $NC.G_VAR.masterData.INOUT_CD = args.val;
    break;
  case "INBOUND_DATE":
    $NC.setValueDatePicker(args.view, args.val, "등록일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.INBOUND_DATE = $NC.getValue("#dtpInbound_Date");
    break;
  case "REMARK1":
    $NC.G_VAR.masterData.REMARK1 = args.val;
    break;
  case "SHIPPER_NM":
  case "SHIPPER_TEL":
  case "SHIPPER_HP":
  case "SHIPPER_ZIP_CD":
  case "SHIPPER_ADDR_BASIC":
  case "SHIPPER_ADDR_DETAIL":
    $NC.G_VAR.masterData[args.col] = args.val;
    break;
  case "WB_NO":
    $NC.G_VAR.masterData.WB_NO = args.val;
    break;
  case "SHIP_COST_DIV":
    $NC.G_VAR.masterData.SHIP_COST_DIV = args.val;
    break;
  case "SHIP_COST":
    $NC.G_VAR.masterData.SHIP_COST = args.val;
    break;
  }

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdDetailOnPopup,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 180
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
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_BOX",
    field: "ENTRY_BOX",
    name: "등록BOX",
    minWidth: 70,
    cssClass: "align-right",
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_EA",
    field: "ENTRY_EA",
    name: "등록EA",
    minWidth: 70,
    cssClass: "align-right",
  });
  $NC.setGridColumn(columns, {
    id: "BOX_WEIGHT",
    field: "BOX_WEIGHT",
    name: "박스중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_WEIGHT",
    field: "ENTRY_WEIGHT",
    name: "등록중량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 90,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_KEY",
    field: "BU_KEY",
    name: "전표키",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

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
    sortCol: "LINE_NO",
    gridOptions: options,
    canExportExcel: false,
    onFilter: grdDetailOnFilter
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);

}

/**
 * grdDetail 데이터 필터링 이벤트
 */
function grdDetailOnFilter(item) {

  return item.CRUD !== "D";
}

function grdDetailOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true);
}

function grdDetailOnBeforeEditCell(e, args) {

  // 신규 데이터일 때만 수정 가능한 컬럼
  if (args.column.field === "ITEM_CD") {

    var rowData = G_GRDDETAIL.data.getItem(args.row);
    if (rowData) {
      // 신규 데이터가 아니면 코드 수정 불가
      if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
        return false;
      }
    }
  }

  return true;
}

function grdDetailOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.ITEM_CD)) {
      P_QUERY_PARAMS = {
        P_BU_CD: rowData.BU_CD,
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
      onItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemPopup, onItemPopup);
    }
    return;
  case "ENTRY_QTY":
    rowData = grdDetailOnCalc(rowData);
    break;
  }

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
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.ITEM_CD)) {
      G_GRDDETAIL.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL, row - 1);
        setTimeout(function() {
          $NC.setGridDisplayRows("#grdDetail", row, G_GRDDETAIL.data.getLength());
        }, 300);
      }
      return true;
    }
  }
  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.ITEM_CD) || $NC.isNull(rowData.ITEM_NM)) {
      alert("상품코드를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ITEM_CD"),
        editMode: true
      });
      return false;
    }

    if ($NC.isNull(rowData.ITEM_STATE)) {
      alert("상태를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ITEM_STATE_F"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.ITEM_LOT)) {
      alert("LOT번호를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ITEM_LOT"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.ENTRY_QTY)) {
      alert("등록수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
        editMode: true
      });
      return false;
    } else {
      var ENTRY_QTY = Number(rowData.ENTRY_QTY);
      if (ENTRY_QTY < 1) {
        alert("등록수량은 1보다 작을 수 없습니다.");
        rowData = grdDetailOnCalc(rowData, rowData.ENTRY_QTY);
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("ENTRY_QTY"),
          editMode: true
        });
        return false;
      }
    }

  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  }
  return true;
}

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

function grdDetailOnPopup(e, args) {

  var rowData = args.item;

  switch (args.column.field) {
  case "ITEM_CD":
    $NP.showItemPopup({
      P_BU_CD: rowData.BU_CD,
      P_ITEM_CD: "%",
      P_VIEW_DIV: "1",
      P_DEPART_CD: "%",
      P_LINE_CD: "%",
      P_CLASS_CD: "%"
    }, onItemPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
    });
    break;
  }
}

function onItemPopup(resultInfo) {

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.BRAND_CD = resultInfo.BRAND_CD;
    rowData.BRAND_NM = resultInfo.BRAND_NM;
    rowData.ITEM_CD = resultInfo.ITEM_CD;
    rowData.ITEM_NM = resultInfo.ITEM_NM;
    rowData.ITEM_SPEC = resultInfo.ITEM_SPEC;
    rowData.QTY_IN_BOX = resultInfo.QTY_IN_BOX;
    rowData.BOX_WEIGHT = resultInfo.BOX_WEIGHT;
    focusCol = G_GRDDETAIL.view.getColumnIndex("ENRTY_QTY");
  } else {
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";
    rowData.ITEM_SPEC = "";
    rowData.QTY_IN_BOX = 1;
    rowData.ENTRY_QTY = 0;
    rowData.ENTRY_BOX = 0;
    rowData.ENTRY_EA = 0;
    rowData.BOX_WEIGHT = 0;
    rowData.ENTRY_WEIGHT = 0;
    focusCol = G_GRDDETAIL.view.getColumnIndex("ITEM_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
}

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

function grdDetailOnCalc(rowData, entry_Qty) {

  if (!$NC.isNull(entry_Qty)) {
    rowData.ORDER_QTY = Number(entry_Qty);
  }
  rowData.ENTRY_BOX = $NC.getB_Box(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
  rowData.ENTRY_EA = $NC.getB_Ea(rowData.ENTRY_QTY, rowData.QTY_IN_BOX);
  rowData.ENTRY_WEIGHT = $NC.getWeight(rowData.ENTRY_QTY, rowData.QTY_IN_BOX, rowData.BOX_WEIGHT);

  return rowData;
}

function showCarrierPopup() {
  var carrier_Cd = $NC.getValue("#edtCarrier_Cd");
  $NP.showCarrierPopup({
    queryParams: {
      P_CARRIER_CD: carrier_Cd,
      P_VIEW_DIV: "%"
    }
  }, onCarrierPopup, function() {
    $NC.setFocus("#edtCarrier_Cd", true);
  });
}

function showPostPopup() {

  $NP.showPostPopup({
    P_ADDR_NM: "%"
  }, onPostPopup, function() {
    $NC.setFocus("#edtShipper_Addr_Detail", true);
  });
}

function onCarrierPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.masterData.CARRIER_CD = resultInfo.CARRIER_CD;
    $NC.setValue("#edtCarrier_Cd", resultInfo.CARRIER_CD);
    $NC.setValue("#edtCarrier_Nm", resultInfo.CARRIER_NM);

  } else {
    $NC.G_VAR.masterData.CARRIER_CD = "";
    $NC.G_VAR.masterData.CARRIER_NM = "";
    $NC.setValue("#edtCarrier_Cd");
    $NC.setValue("#edtCarrier_Nm");
    $NC.setFocus("#edtCarrier_Cd", true);

  }
  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}

function onPostPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.G_VAR.masterData.SHIPPER_ZIP_CD = resultInfo.ZIP_CD;
    $NC.G_VAR.masterData.SHIPPER_ADDR_BASIC = resultInfo.ADDR_NM_REAL;
    $NC.setValue("#edtShipper_Zip_Cd", resultInfo.ZIP_CD);
    $NC.setValue("#edtShipper_Addr_Basic", resultInfo.ADDR_NM_REAL);
  }

  $NC.setFocus("#edtShipper_Addr_Detail", true);

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}