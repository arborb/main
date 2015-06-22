/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null
  });

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel);
  $("#btnQDeal_Cd").click(showBrandDealPopup);
  // $("#btnQOption_Cd").click(showDealOptionPopup);
//  $("#btnBrand_Cd").click(showOwnBranPopup);

//  $("#btnMall_Brand_Cd").click(showSellerPopup);
  
  $("#btnEntryNew").click(_New);
  $("#btnEntryDelete").click(_Delete);
  $("#btnEntrySave").click(_Save);

//   $NC.setInitDatePicker("#dtpFrom_Date");
//   $NC.setInitDatePicker("#dtpTo_Date");

  // 조회조건 - 이벤트구분 세팅
  /*
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "WMP_EVENT_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQEvent_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true,
    onComplete: function() {
      setTimeout(function() {
        $NC.G_VAR.masterData.INOUT_CD = $NC.getValue("#cboQEvent_Div");
      }, 300);
    }
  });
  */
  
  // 그리드 초기화
  grdDetailInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);
  $NC.setValue("#edtMall_Brand_Cd", $NC.G_VAR.userData.P_BRAND_CD);
  $NC.setValue("#edtMall_Brand_Nm", $NC.G_VAR.userData.P_BRAND_NM);
  $NC.setValue("#edtBrand_Cd", $NC.G_VAR.userData.P_OWN_BRAND_CD);
  $NC.setValue("#edtBrand_Nm", $NC.G_VAR.userData.P_OWN_BRAND_NM);

  // 마스터 disable여부 설정
  var isDisable = false;

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {

    var FROM_DATE = $NC.getValue("#dtpFrom_Date");
    var TO_DATE = $NC.getValue("#dtpTo_Date");
    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      OWN_BRAND_CD: $NC.G_VAR.userData.P_OWN_BRAND_CD,
      BRAND_CD: $NC.G_VAR.userData.P_BRAND_CD,
      // EVENT_CD: "",
      EVENT_NM: "",
      DEAL_ID: "",
      DEAL_NM: "",
      OPTION_CD: "",
      OPTION_VALUE: "",
      FROM_DATE: FROM_DATE,
      TO_DATE: TO_DATE,
      EVENT_DIV: "",
      EVENT_VALUE: "",
      REMARK1: "",
      CRUD: "C"
    };
    
    $NC.setFocus("#edtQDeal_Cd");

  } else {
    // 마스터 disable여부 설정
    isDisable = true;
    var CRUD = "R";
    // 마스터 데이터 세팅
    var masterDS = $NC.G_VAR.userData.P_MASTER_DS;

    $NC.G_VAR.masterData = {
      BU_CD: masterDS.BU_CD,
      OWN_BRAND_CD: masterDS.BRAND_CD,
      BRAND_CD: masterDS.SELLER_CD,
      // EVENT_CD: masterDS.EVENT_CD,
      EVENT_NM: masterDS.EVENT_NM,
      DEAL_ID: masterDS.DEAL_CD,
      DEAL_NM: masterDS.DEAL_NM,
      MALL_CD: masterDS.MALL_CD,
      // OPTION_CD: masterDS.OPTION_CD,
      // OPTION_VALUE: masterDS.OPTION_VALUE,
      FROM_DATE: masterDS.FROM_DATE,
      TO_DATE: masterDS.TO_DATE,
      EVENT_DIV: masterDS.EVENT_DIV,
      EVENT_VALUE: masterDS.EVENT_VALUE,
      REMARK1: masterDS.REMARK1,
      CRUD: CRUD
    };

    $NC.setValue("#dtpFrom_Date", $NC.G_VAR.masterData.FROM_DATE);
    $NC.setValue("#dtpTo_Date", $NC.G_VAR.masterData.TO_DATE);
    $NC.setValue("#edtQDeal_Cd", $NC.G_VAR.masterData.DEAL_ID);
    $NC.setValue("#edtQDeal_Nm", $NC.G_VAR.masterData.DEAL_NM);
    // $NC.setValue("#edtQOption_Cd", $NC.G_VAR.masterData.OPTION_CD);
    // $NC.setValue("#edtQOption_Nm", $NC.G_VAR.masterData.OPTION_VALUE);

    // $NC.setValue("#edtEvent_Cd", $NC.G_VAR.masterData.EVENT_CD);
    $NC.setValue("#edtEvent_Div", $NC.G_VAR.masterData.EVENT_DIV);
    $NC.setValue("#edtEvent_Value", $NC.G_VAR.masterData.EVENT_VALUE);
    $NC.setValue("#edtEvent_Nm", $NC.G_VAR.masterData.EVENT_NM);
    $NC.setValue("#edtRemark1", $NC.G_VAR.masterData.REMARK1);

    // 수령자 정보 모두 Disabled
    $("#divMasterView .sub-table-data").prop("disabled", true);
    // 디테일 데이터 세팅
    var detailDS = $NC.G_VAR.userData.P_DETAIL_DS;

    var rowData;
    G_GRDDETAIL.data.beginUpdate();
    try {
      for ( var row in detailDS) {

        rowData = detailDS[row];

        var EVENT_QTY = Number(rowData.EVENT_QTY);
        if (EVENT_QTY > 0) {
          var newRowData = {
            BU_CD: rowData.BU_CD,
            BRAND_CD: rowData.BRAND_CD,
            BRAND_NM: rowData.BRAND_NM,
            // EVENT_CD: rowData.EVENT_CD,
            OPTION_CD: rowData.OPTION_CD,
            LINE_NO: rowData.LINE_NO,
            ITEM_CD: rowData.ITEM_CD,
            ITEM_NM: rowData.ITEM_NM,
            EVENT_QTY: rowData.EVENT_QTY,
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
  
  // 몰구분
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMMALL",
    P_QUERY_PARAMS: $NC.getParams({
      P_MALL_CD: "%"
    })
  }, {
    selector: "#cboQMall_Cd",
    codeField: "MALL_CD",
    nameField: "MALL_NM",
    fullNameField: "MALL_CD_F",
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.MALL_CD = $NC.getValue("#cboQMall_Cd");
      } else {
        $NC.setValue("#cboQMall_Cd", $NC.G_VAR.masterData.MALL_CD);
      }
    }
  });

  // / 조회조건 - 이벤트구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "WMP_EVENT_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQEvent_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    // addAll: true,
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.EVENT_DIV = $NC.getValue("#cboQEvent_Div");
      } else {
        $NC.setValue("#cboQEvent_Div", $NC.G_VAR.masterData.EVENT_DIV);
      }
      
      var inoutCombo = document.getElementById('cboQEvent_Div');
      for (var i = 0; i < inoutCombo.length;  i++) {
        if (inoutCombo.options[i].value == "6") {
          inoutCombo.remove(i);
        }
      }
    }
  });

  // 수정일 경우 입력불가 항목 비활성화 처리
  setMasterDisable(isDisable);
}

function setMasterDisable(isDisable) {

  // 수정일 경우 입력불가 항목 비활성화 처리
  $NC.setEnable("#dtpFrom_Date", !isDisable);
  $NC.setEnable("#dtpTo_Date", !isDisable);
//  $NC.setEnable("#edtBrand_Cd", !isDisable);
//  $NC.setEnable("#btnBrand_Cd", !isDisable);
//  $NC.setEnable("#edtMall_Brand_Cd", !isDisable);
//  $NC.setEnable("#btnMall_Brand_Cd", !isDisable);
  $NC.setEnable("#cboQMall_Cd", !isDisable);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 150;
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

  var DEAL_ID = $NC.getValue("#edtQDeal_Cd");
  if ($NC.isNull(DEAL_ID)) {
    alert("딜코드를 입력하십시오.");
    $NC.setFocus("#edtQDeal_Cd");
    return;
  }
  // var OPTION_ID = $NC.getValue("#edtQOption_Cd");
  // if ($NC.isNull(OPTION_ID)) {
  // alert("딜옵션을 입력하십시오.");
  // $NC.setFocus("#edtQOption_Cd");
  // return;
  // }
  // var EVENT_CD = $NC.getValue("#edtEvent_Cd");
  // if ($NC.isNull(EVENT_CD)) {
  // alert("이벤트를 입력하십시오.");
  // $NC.setFocus("#edtEvent_Cd");
  // return;
  // }
  var EVENT_NM = $NC.getValue("#edtEvent_Nm");
  if ($NC.isNull(EVENT_NM)) {
    alert("이벤트명을 입력하십시오.");
    $NC.setFocus("#edtEvent_Nm");
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
    BU_CD: $NC.G_VAR.masterData.BU_CD,
    BRAND_CD: $NC.G_VAR.masterData.BRAND_CD,
    OWN_BRAND_CD: $NC.G_VAR.masterData.OWN_BRAND_CD,
    // EVENT_CD: $NC.G_VAR.masterData.EVENT_CD,
    LINE_NO: "",
    OPTION_CD: "",
    ITEM_CD: "",
    ITEM_NM: "",
    EVENT_QTY: 0,
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

  if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
    alert("MALL이 지정되어 있지 않습니다. 다시 작업하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.BRAND_CD)) {
    alert("판매사가 지정되어 있지 않습니다. 다시 작업하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.DEAL_ID)) {
    alert("먼저 딜코드를 입력하십시오.");
    $NC.setFocus("#edtDeal_Cd");
    return;
  }

  // if ($NC.isNull($NC.G_VAR.masterData.OPTION_CD)) {
  // alert("먼저 딜옵션을 입력하십시오.");
  // $NC.setFocus("#edtOption_Cd");
  // return;
  // }

  // if ($NC.isNull($NC.G_VAR.masterData.EVENT_CD)) {
  // alert("먼저 이벤트코드를 선택하십시오.");
  // $NC.setFocus("#edtEvent_Cd");
  // return;
  // }

  if ($NC.isNull($NC.G_VAR.masterData.EVENT_NM)) {
    alert("먼저 이벤트명을 선택하십시오.");
    $NC.setFocus("#edtEvent_Nm");
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
  for (var row = 0; row < rowCount; row++) {
    var rowData = rows[row];

    if (rowData.CRUD !== "R") {
      $NC.G_VAR.masterData.EVENT_DIV = $NC.getValue("#cboQEvent_Div");

      var saveData;
      if ($NC.G_VAR.masterData.EVENT_DIV == "2") {
        saveData = {    
          P_BU_CD: $NC.G_VAR.masterData.BU_CD,
          P_BRAND_CD: $NC.G_VAR.masterData.BRAND_CD,
          P_DEAL_CD: $NC.G_VAR.masterData.DEAL_ID,
          P_OPTION_CD: rowData.OPTION_CD,
          P_LINE_NO: rowData.LINE_NO,
          P_ITEM_CD: rowData.ITEM_CD,
          P_EVENT_QTY: rowData.EVENT_QTY,
          P_REMARK1: rowData.REMARK1,
          P_CRUD: rowData.CRUD
        };
      } else {
        saveData = {
          P_BU_CD: $NC.G_VAR.masterData.BU_CD,
          P_BRAND_CD: $NC.G_VAR.masterData.BRAND_CD,
          // P_EVENT_CD: rowData.EVENT_CD,
          P_DEAL_CD: $NC.G_VAR.masterData.DEAL_ID,
          P_OPTION_CD: rowData.OPTION_CD,
          P_LINE_NO: rowData.LINE_NO,
          P_ITEM_CD: rowData.ITEM_CD,
          // P_TO_DATE: rowData.TO_DATE,
          P_EVENT_QTY: rowData.EVENT_QTY,
          P_REMARK1: rowData.REMARK1,
          P_CRUD: rowData.CRUD
        };
      }
      //      
      // if (rowData.CRUD !== "R") {
      // $NC.G_VAR.masterData.EVENT_DIV = $NC.getValue("#cboQEvent_Div");
      //
      // var saveData;
      // if ($NC.G_VAR.masterData.EVENT_DIV == "2") {
      // saveData = {
      // P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      // P_BRAND_CD: rowData.BRAND_CD,
      // // P_EVENT_CD: rowData.EVENT_CD,
      // P_DEAL_CD: $NC.G_VAR.masterData.DEAL_ID,
      // P_OPTION_CD: rowData.OPTION_CD,
      // P_LINE_NO: rowData.LINE_NO,
      // P_ITEM_CD: rowData.ITEM_CD,
      // // P_TO_DATE: rowData.TO_DATE,
      // P_EVENT_QTY: rowData.EVENT_QTY,
      // P_REMARK1: rowData.REMARK1,
      // P_CRUD: rowData.CRUD
      // };
      // } else {
      // saveData = {
      // P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      // P_BRAND_CD: rowData.BRAND_CD,
      // // P_EVENT_CD: rowData.EVENT_CD,
      // P_DEAL_CD: $NC.G_VAR.masterData.DEAL_ID,
      // P_OPTION_CD: "00",
      // P_LINE_NO: rowData.LINE_NO,
      // P_ITEM_CD: rowData.ITEM_CD,
      // // P_TO_DATE: rowData.TO_DATE,
      // P_EVENT_QTY: rowData.EVENT_QTY,
      // P_REMARK1: rowData.REMARK1,
      // P_CRUD: rowData.CRUD
      // };
      // }
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

  $NC.serviceCall("/CM10020E/save.do", {
    P_DS_MASTER: $NC.toJson({
      P_BU_CD: $NC.G_VAR.masterData.BU_CD,
      P_BRAND_CD: $NC.G_VAR.masterData.BRAND_CD,
      P_DEAL_CD: $NC.G_VAR.masterData.DEAL_ID,
      P_EVENT_DIV: $NC.G_VAR.masterData.EVENT_DIV,
      P_EVENT_NM: $NC.G_VAR.masterData.EVENT_NM,
//      P_EVENT_FROM_DATE: $NC.G_VAR.masterData.FROM_DATE,
//      P_EVENT_TO_DATE: $NC.G_VAR.masterData.TO_DATE,
      P_EVENT_FROM_DATE: "",
      P_EVENT_TO_DATE: "",
      P_EVENT_VALUE: $NC.G_VAR.masterData.EVENT_VALUE,
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

function masterDataOnChange(e, args) {

  switch (args.col) {
  case "BU_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      P_QUERY_PARAMS = {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: args.val
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
    var BU_CD = $NC.getValue("#edtBu_Cd");
    if ($NC.isNull(BU_CD)) {
      alert("사업부 코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocus("#edtBu_Cd", true);
      $NC.setValue("#edtBrand_Cd", null);
      return;
    }
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      var BU_CD = $NC.getValue("#edtBu_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: $NC.G_USERINFO.CUST_CD,  
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: args.val
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS
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
  case "MALL_BRAND_CD":
    var BRAND_CD = $NC.getValue("#edtBrand_Cd");
    if ($NC.isNull(BRAND_CD)) {
      alert("위탁사 코드를 먼저 선택하시기 바랍니다.");
      $NC.setFocus("#edtBrand_Cd", true);
      $NC.setValue("#edtMall_Brand_Cd", null);
      return;
    }

    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {

      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.getValue("#edtBu_Cd");
      var BRAND_CD = $NC.getValue("#edtBrand_Cd");
      P_QUERY_PARAMS = {
          P_CUST_CD: CUST_CD,
          P_BU_CD: BU_CD,
          P_OWN_BRAND_CD: BRAND_CD,
          P_SELLER_CD: args.val
      };
      O_RESULT_DATA = $NP.getSellerInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onSellerPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showSellerPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onSellerPopup, onSellerPopup);
    }
    return;  
  case "QDEAL_CD":
//    var MALL_BRAND_CD = $NC.getValue("#edtMall_Brand_Cd");
//    if ($NC.isNull(MALL_BRAND_CD)) {
//      alert("판매사 코드를 먼저 선택하시기 바랍니다.");
//      $NC.setFocus("#edtMall_Brand_Cd", true);
//      return;
//    }
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      var BU_CD = $NC.getValue("#edtBu_Cd", true);
//      var SELLER_CD = $NC.getValue("#edtMall_Brand_Cd" , true);
      var MALL_CD = $NC.getValue("#cboQMall_Cd");
      
      P_QUERY_PARAMS = {
        P_BU_CD: BU_CD,
        P_MALL_CD: MALL_CD, 
        P_DEAL_ID: args.val,
        P_VIEW_DIV: "1"
      };
      O_RESULT_DATA = $NP.getDealSearchInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBrandDealPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showDealPopupSearch({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBrandDealPopup, onBrandDealPopup);
    }
    break;
  case "FROM_DATE":
    $NC.setValueDatePicker(args.view, args.val, "시작일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.FROM_DATE = $NC.getValue("#dtpFrom_Date");
    break;
  case "TO_DATE":
    $NC.setValueDatePicker(args.view, args.val, "종료일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.TO_DATE = $NC.getValue("#dtpTo_Date");
    break;
  // case "EVENT_CD":
  case "EVENT_NM":
  case "EVENT_VALUE":
  case "QMALL_CD":
  case "QEVENT_DIV":
    $NC.G_VAR.masterData[args.col] = args.val;
    break;
  case "REMARK1":
    $NC.G_VAR.masterData.REMARK1 = args.val;
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
    id: "OPTION_CD",
    field: "OPTION_CD",
    name: "옵션코드",
    minWidth: 90,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdDetailOnPopup,
      isKeyField: true
    }
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
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "판매사명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "EVENT_QTY",
    field: "EVENT_QTY",
    name: "이벤트확정수량",
    minWidth: 80,
    cssClass: "align-right",
    editor: Slick.Editors.Number
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

  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("OPTION_CD"), true);
  // if ($NC.getValue("#cboQEvent_Div") == "2") {
  // $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("OPTION_CD"), true);
  // } else {
  // $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"));
  // }
}

function grdDetailOnBeforeEditCell(e, args) {

  var rowData = G_GRDDETAIL.data.getItem(args.row);

  if (args.column.field === "ITEM_CD" || args.column.field === "OPTION_CD") {

    if (rowData) {
      // 신규 데이터가 아니면 코드 수정 불가
      if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
        return false;
      } else {
        return true;
      }
    }
  }

  // var EVENT_DIV = $NC.getValue("#cboQEvent_Div");
  // var rowData = G_GRDDETAIL.data.getItem(args.row);
  // if (EVENT_DIV == "2") {
  // // 신규 데이터일 때만 수정 가능한 컬럼
  // if (args.column.field === "ITEM_CD" || args.column.field === "OPTION_CD") {
  //
  // if (rowData) {
  // // 신규 데이터가 아니면 코드 수정 불가
  // if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
  // return false;
  // } else {
  // return true;
  // }
  // }
  // }
  // } else {
  // if (args.column.field === "ITEM_CD") {
  // if (rowData) {
  // // 신규 데이터가 아니면 코드 수정 불가
  // if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
  // return false;
  // } else {
  // return true;
  // }
  // }
  // } else if (args.column.field === "OPTION_CD"){
  // return false;
  // }
  // }
  return true;
}

function grdDetailOnCellChange(e, args) {

  var rowData = args.item;

  switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
  case "OPTION_CD":  
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.OPTION_CD) && rowData.OPTION_CD == "00") {
      var rowData1 = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
        rowData1.OPTION_CD = rowData.OPTION_CD;
        $NC.G_VAR.masterData.OPTION_CD = rowData.OPTION_CD;
        focusCol = G_GRDDETAIL.view.getColumnIndex("ITEM_CD");   
        return;
    } else if (!$NC.isNull(rowData.OPTION_CD) && rowData.OPTION_CD !=="00") {
      P_QUERY_PARAMS = {
        P_BU_CD: rowData.BU_CD,
        P_MALL_CD: $NC.getValue("#cboQMall_Cd"),
        P_DEAL_ID: $NC.getValue("#edtQDeal_Cd"),
        P_OPTION_ID: rowData.OPTION_CD
      };
      O_RESULT_DATA = $NP.getDealOptionInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onDealOptionPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showDealOptionPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onDealOptionPopup, onDealOptionPopup);
    }
    return;
  case "ITEM_CD":
      var P_QUERY_PARAMS;
      var O_RESULT_DATA = [ ];
      if (!$NC.isNull(rowData.ITEM_CD)) {
        P_QUERY_PARAMS = {
          P_BU_CD: rowData.BU_CD,
          P_BRAND_CD: rowData.OWN_BRAND_CD,
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
  case "EVENT_QTY":
    break;
    // if ($NC.getValue("#cboQEvent_Div") == "2") {
    // var P_QUERY_PARAMS;
    // var O_RESULT_DATA = [ ];
    // if (!$NC.isNull(rowData.ITEM_CD)) {
    // P_QUERY_PARAMS = {
    // P_BU_CD: rowData.BU_CD,
    // P_BRAND_CD: rowData.BRAND_CD,
    // P_DEAL_ID: $NC.getValue("#edtQDeal_Cd"),
    // P_OPTION_ID: rowData.OPTION_ID,
    // P_ITEM_CD: rowData.ITEM_CD,
    // P_VIEW_DIV: "1"
    // };
    // O_RESULT_DATA = $NP.getDealItemInfo({
    // queryParams: P_QUERY_PARAMS
    // });
    // }
    // if (O_RESULT_DATA.length <= 1) {
    // onItemPopup(O_RESULT_DATA[0]);
    // } else {
    // $NP.showDealItemPopup({
    // queryParams: P_QUERY_PARAMS,
    // queryData: O_RESULT_DATA
    // }, onItemPopup, onItemPopup);
    // }
    // } else {
    //
    // var P_QUERY_PARAMS;
    // var O_RESULT_DATA = [ ];
    // if (!$NC.isNull(rowData.ITEM_CD)) {
    // P_QUERY_PARAMS = {
    // P_BU_CD: rowData.BU_CD,
    // P_ITEM_CD: rowData.ITEM_CD,
    // P_VIEW_DIV: "1",
    // P_DEPART_CD: "%",
    // P_LINE_CD: "%",
    // P_CLASS_CD: "%"
    // };
    // O_RESULT_DATA = $NP.getItemInfo({
    // queryParams: P_QUERY_PARAMS
    // });
    // }
    // if (O_RESULT_DATA.length <= 1) {
    // onItemPopup(O_RESULT_DATA[0]);
    // } else {
    // $NP.showItemPopup({
    // queryParams: P_QUERY_PARAMS,
    // queryData: O_RESULT_DATA
    // }, onItemPopup, onItemPopup);
    // }
    // }
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
    if ($NC.isNull(rowData.EVENT_QTY)) {
      alert("이벤트수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("EVENT_QTY"),
        editMode: true
      });
      return false;
    } else {
      var EVENT_QTY = Number(rowData.EVENT_QTY);
      if (EVENT_QTY < 1) {
        alert("이벤트수량은 1보다 작을 수 없습니다.");
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("EVENT_QTY"),
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
  case "OPTION_CD":
    $NP.showDealOptionPopup({
      P_BU_CD: rowData.BU_CD,
      P_MALL_CD: $NC.getValue("#cboQMall_Cd"),
      P_DEAL_ID: $NC.getValue("#edtQDeal_Cd"),
      P_OPTION_ID: "%"
    }, onDealOptionPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("OPTION_CD"), true, true);
    });
    break;
  case "ITEM_CD":
    if ($NC.getValue("#cboQEvent_Div") == "2") {
      $NP.showDealItemPopup({
        P_BU_CD: rowData.BU_CD,
        P_MALL_CD: $NC.getValue("#cboQMall_Cd"),
        P_BRAND_CD: rowData.OWN_BRAND_CD,
        P_DEAL_ID: $NC.getValue("#edtQDeal_Cd"),
        P_OPTION_ID: rowData.OPTION_CD,
        P_ITEM_CD: rowData.ITEM_CD,
        P_VIEW_DIV: "1"
      }, onItemPopup, function() {
        $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
      });
    } else {
      $NP.showItemPopup({
        P_BU_CD: rowData.BU_CD,
        P_BRAND_CD: rowData.OWN_BRAND_CD,
        P_ITEM_CD: "%",
        P_VIEW_DIV: "1",
        P_DEPART_CD: "%",
        P_LINE_CD: "%",
        P_CLASS_CD: "%"
      }, onItemPopup, function() {
        $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("ITEM_CD"), true, true);
      });
    }
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
    rowData.OWN_BRAND_CD = resultInfo.BRAND_CD;
//    rowData.BRAND_NM = resultInfo.BRAND_NM;
    rowData.ITEM_CD = resultInfo.ITEM_CD;
    rowData.ITEM_NM = resultInfo.ITEM_NM;
    focusCol = G_GRDDETAIL.view.getColumnIndex("EVENT_QTY");
  } else {
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    rowData.ITEM_CD = "";
    rowData.ITEM_NM = "";
    rowData.EVENT_QTY = 0;
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



function showDealOptionPopup() {
  var BU_CD = $NC.getValue("#edtBu_Cd");
  var DEAL_ID = $NC.getValue("#edtQDeal_Cd");
  if ($NC.isNull(DEAL_ID)) {
    alert("딜코드를 선택하십시오.");
    $NC.setFocus("#edtQDeal_Cd");
    return;
  }

  $NP.showDealOptionPopup({
    P_BU_CD: BU_CD,
    P_DEAL_ID: DEAL_ID,
    P_OPTION_ID: "%"
  }, onDealOptionPopup, function() {
    $NC.setFocus("#edtEvent_Value", true);
  });
}


function showBrandDealPopup() {
//  var MALL_BRAND_CD = $NC.getValue("#edtMall_Brand_Cd");
//  if ($NC.isNull(MALL_BRAND_CD)) {
//    alert("판매사 코드를 먼저 선택하시기 바랍니다.");
//    $NC.setFocus("#edtMall_Brand_Cd", true);
//    return;
//  }
  var BU_CD = $NC.getValue("#edtBu_Cd");
  var MALL_CD = $NC.getValue("#cboQMall_Cd");

  $NP.showDealPopupSearch({
    P_BU_CD: BU_CD,
    P_MALL_CD: MALL_CD,
    P_DEAL_ID: "%",
    P_VIEW_DIV: "1"
  }, onBrandDealPopup, function() {
    $NC.setFocus("#edtQOption_Cd", true);
  });
}


function onBrandDealPopup(resultInfo) {
  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQDeal_Cd", resultInfo.DEAL_ID);
    $NC.setValue("#edtQDeal_Nm", resultInfo.DEAL_NM);
    $NC.setValue("#edtBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtBrand_Nm", resultInfo.OWN_BRAND_NM);
    $NC.setValue("#edtMall_Brand_Cd", resultInfo.SELLER_CD);
    $NC.setValue("#edtMall_Brand_Nm", resultInfo.SELLER_NM);

    $NC.G_VAR.masterData.DEAL_ID  = resultInfo.DEAL_ID;
    $NC.G_VAR.masterData.OWN_BRAND_CD = resultInfo.OWN_BRAND_CD;
    $NC.G_VAR.masterData.BRAND_CD = resultInfo.SELLER_CD;
  } else {
    $NC.setValue("#edtQDeal_Cd");
    $NC.setValue("#edtQDeal_Nm");
    $NC.setValue("#edtBrand_Cd");
    $NC.setValue("#edtBrand_Nm");
    $NC.setValue("#edtMall_Brand_Cd");
    $NC.setValue("#edtMall_Brand_Nm");
    
    $NC.G_VAR.masterData.DEAL_ID  = "";
    $NC.G_VAR.masterData.OWN_BRAND_CD = "";
    $NC.G_VAR.masterData.BRAND_CD = "";
    $NC.setFocus("#edtQDeal_Cd", true);
  }
  // onChangingCondition();
}



/**
 * 검색조건의 사업부 검색 팝업 클릭
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
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }


  $NC.setValue("#edtBrand_Cd");
  $NC.setValue("#edtBrand_Nm");
  $NC.setValue("#edtMall_Brand_Cd");
  $NC.setValue("#edtMall_Brand_Nm");
  $NC.setValue("#edtQDeal_Cd");
  $NC.setValue("#edtQDeal_Nm");


  $NC.clearGridData(G_GRDDETAIL);
  $NC.G_VAR.masterData.BRAND_CD = "";
}



/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {
  var BU_CD = $NC.getValue("#edtBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부 코드를 먼저 선택하시기 바랍니다.");
    $NC.setFocus("#edtBu_Cd", true);
    $NC.setValue("#edtBrand_Cd", null);
    return;
  }
  
  var BU_CD = $NC.getValue("#edtBu_Cd");

  $NP.showOwnBranPopup({
    P_CUST_CD: $NC.G_USERINFO.CUST_CD,   
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtBrand_Nm", resultInfo.OWN_BRAND_NM);

  } else {
    $NC.setValue("#edtBrand_Cd");
    $NC.setValue("#edtBrand_Nm");
    $NC.setFocus("#edtBrand_Cd", true);
    $NC.G_VAR.masterData.BRAND_CD = "";
  }  

  $NC.setValue("#edtQDeal_Cd");
  $NC.setValue("#edtQDeal_Nm");
  $NC.setValue("#edtMall_Brand_Cd");
  $NC.setValue("#edtMall_Brand_Nm");


  $NC.clearGridData(G_GRDDETAIL);
}


/**
 * 검색조건의 판매사 검색 팝업 클릭
 */
function showSellerPopup() {
  
  var BRAND_CD = $NC.getValue("#edtBrand_Cd");
  if ($NC.isNull(BRAND_CD)) {
    alert("위탁사 코드를 먼저 선택하시기 바랍니다.");
    $NC.setFocus("#edtBrand_Cd", true);
    $NC.setValue("#edtMall_Brand_Cd", null);
    return;
  }
  
  var CUST_CD = $NC.G_USERINFO.CUST_CD;
  var BU_CD = $NC.getValue("#edtBu_Cd",true);
  var BRAND_CD = $NC.getValue("#edtBrand_Cd",true);

  $NP.showSellerPopup({
    P_CUST_CD: CUST_CD,
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: BRAND_CD,
    P_SELLER_CD: '%'
  }, onSellerPopup, function() {
    $NC.setFocus("#edtMall_Brand_Cd", true);
  });
}

/**
 * 판매사 검색 결과
 * 
 * @param seletedRowData
 */
function onSellerPopup(resultInfo) {

  
  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtMall_Brand_Cd", resultInfo.SELLER_CD);
    $NC.setValue("#edtMall_Brand_Nm", resultInfo.SELLER_NM);

    $NC.G_VAR.masterData.BRAND_CD = resultInfo.SELLER_CD;
  } else {
    $NC.setValue("#edtMall_Brand_Cd");
    $NC.setValue("#edtMall_Brand_Nm");
    $NC.setFocus("#edtMall_Brand_Cd", true);

  }


  $NC.clearGridData(G_GRDDETAIL);
}

function onDealOptionPopup(resultInfo) {
  /*
  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQOption_Cd", resultInfo.OPTION_ID);
    $NC.setValue("#edtQOption_Nm", resultInfo.OPTION_VALUE);

    $NC.G_VAR.masterData.OPTION_ID = resultInfo.OPTION_ID;
  } else {
    $NC.setValue("#edtQOption_Cd");
    $NC.setValue("#edtQOption_Nm");
    // $NC.setFocus("#edtEvent_Cd", true);
  }
  // onChangingCondition();
  */
  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.OPTION_CD = resultInfo.OPTION_ID;
    $NC.G_VAR.masterData.OPTION_CD = resultInfo.OPTION_ID;
    focusCol = G_GRDDETAIL.view.getColumnIndex("ITEM_CD");
  } else {
    rowData.OPTION_CD = "";
    focusCol = G_GRDDETAIL.view.getColumnIndex("OPTION_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
}
