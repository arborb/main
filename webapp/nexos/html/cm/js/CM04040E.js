/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 상품검색 팝업창 company_id 파라미터
    itemPopupParam: {
      COMPANYID: "", // company_id
      DEALID: "",
      BRAND_NM: ""
    }
  });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();
  grdSubInitialize();

  if ($NC.G_USERINFO.CERTIFY_DIV == '4') {
    $("#btnCopyDeal").hide();
  }

  // 조회조건 - 거래구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      // P_CODE_GRP: "DEAL_YN_DIV",
      P_CODE_GRP: "DEAL_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboDeal_Div_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });

  // 사업부 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  setMallCodeCombo($NC.G_USERINFO.BU_CD);

  // 몰구분
  // $NC.setInitCombo("/WC/getDataSet.do", {
  // P_QUERY_ID: "WC.POP_CMMALL",
  // P_QUERY_PARAMS: $NC.getParams({
  // P_MALL_CD: "%"
  // })
  // }, {
  // selector: "#cboQMall_Cd",
  // codeField: "MALL_CD",
  // nameField: "MALL_NM",
  // fullNameField: "MALL_CD_F",
  // addAll: true
  // });

  // 검색.거래구분에 거래진행 체크
  // $NC.setValue("#chkQDeal_Div1", "Y");

  $("#btnCopyDeal").click(onCopyDeal);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showOwnBranPopup);
  $("#btnQMall_Brand_Cd").click(showSellerPopup);
  $("#btnQDeal_Cd").click(showDealPopup);
  $("#btnQOption_Cd").click(showDealOptionPopup);

  // $("#btnQBrand_Cd").click(showUserBrandPopup);

  G_GRDMASTER.focused = true;
  G_GRDDETAIL.focused = false;
  G_GRDSUB.focused = false;
}

function _OnLoaded() {

  // 스플리터 초기화
  $NC.setInitSplitter("#divSplitArea1", "v", 700);
  $NC.setInitSplitter("#divSplitArea2", "h", 400);
}

function _SetResizeOffset() {

  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  var container = $("#divSplitArea1");
  $NC.resizeContainer(container, clientWidth, clientHeight);

  container = $("#grdMaster").parent();
  // Master Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", container.width(), container.height() - $NC.G_LAYOUT.header);

  // Splitter 컨테이너 크기 조정
  container = $("#divSplitArea2");
  var splitter = container.children(".splitter-bar");
  splitter.width(container.width());

  container = $("#grdDetail").parent();
  // Detail Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", container.width(), container.height() - $NC.G_LAYOUT.header);

  container = $("#grdSub").parent();
  // Sub Grid 사이즈 조정
  $NC.resizeGrid("#grdSub", container.width(), container.height() - $NC.G_LAYOUT.header);
}

/**
 * 조회조건 Change Event - Input, Select Change 시 호출 됨
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
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.getValue("#edtQBu_Cd", true);
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
  case "MALL_BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: BRAND_CD,
        P_SELLER_CD: val
      };
      O_RESULT_DATA = $NP.getSellerInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
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
    /*
    case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getUserBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onUserBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showUserBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onUserBrandPopup, onUserBrandPopup);
    }
    return;
    */
  }

  onChangingCondition();
}

function onChangingCondition() {
  // 초기화
  $NC.clearGridData(G_GRDSUB);
  $NC.clearGridData(G_GRDDETAIL);
  $NC.clearGridData(G_GRDMASTER);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  // var DEAL_DIV1 = $NC.getValue("#chkQDeal_Div1");
  // var DEAL_DIV2 = $NC.getValue("#chkQDeal_Div2");
  // var DEAL_DIV3 = $NC.getValue("#chkQDeal_Div3");

  var SELLER_CD = $NC.getValue("#edtQMall_Brand_Cd", true);
  var MALL_CD = $NC.getValue("#cboQMall_Cd");
  var DEAL_ID = $NC.getValue("#edtQDeal_Cd");
  var DEAL_NM = $NC.getValue("#edtQDeal_Nm");
  var DEAL_DIV_CD = $NC.getValue("#cboDeal_Div_Cd");

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  $NC.setInitGridVar(G_GRDDETAIL);
  $NC.setInitGridVar(G_GRDSUB);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_SELLER_CD: SELLER_CD,
    P_DEAL_DIV_CD: DEAL_DIV_CD,
    // P_DEAL_DIV2: DEAL_DIV2,
    // P_DEAL_DIV3: DEAL_DIV3,
    P_DEAL_CD: DEAL_ID,
    P_DEAL_NM: DEAL_NM,
    P_MALL_CD: MALL_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });

  // 데이터 조회
  $NC.serviceCall("/CM04040E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  // grdMaster에 포커스가 있을 경우
  if (G_GRDMASTER.focused) {

    var BRAND_CD = $NC.getValue("#edtQMall_Brand_Cd");

    if ($NC.isNull(BRAND_CD)) {
      alert("판매사를 입력하고 검색하신 후 딜 신규등록을 하십시오.");
      $NC.setFocus("#edtQMall_Brand_Cd");
      return;
    }

    var MALL_CD = $NC.getValue("#cboQMall_Cd");

    if (MALL_CD == "%") {
      alert("하나의 MALL구분을 선택하고 딜 신규등록을 하십시오.");
      $NC.setFocus("#cboQMall_Cd");
      return;
    }
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
        G_GRDMASTER.view.gotoCell(rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      SELLER_NM: $NC.getValue("#edtQMall_Brand_Nm"),
      BRAND_CD: $NC.getValue("#edtQMall_Brand_Cd"),
      COMPANY_ID: $NC.getValue("#edtQMall_Brand_Cd"),
      MALL_CD: MALL_CD,
      MALL_NM: $NC.getValueCombo("#cboQMall_Cd", "N"),
      BU_CD: $NC.getValue("#edtQBu_Cd"),
      DEAL_ID: null,
      DEAL_NM: null,
      DEAL_DIV: "1",
      RESALE_DEAL_YN: "0",
      OPEN_DATE: "",
      CLOSE_DATE: "",
      REMARK1: null,
      RESALE_DEAL_YN_F: $NC.getGridComboName(G_GRDMASTER, {
        colFullNameField: "RESALE_DEAL_YN_F",
        searchVal: "0",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
      DEAL_DIV_F: $NC.getGridComboName(G_GRDMASTER, {
        colFullNameField: "DEAL_DIV_F",
        searchVal: "1",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
      CENTER_DIV_F: $NC.getGridComboName(G_GRDMASTER, {
        colFullNameField: "CENTER_DIV_F",
        searchVal: "1",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
      P_REG_USER_ID: $NC.G_USERINFO.USER_ID,
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
    // grdDetail에 포커스가 있을 경우
  } else if (G_GRDDETAIL.focused) {
    if (G_GRDMASTER.data.getLength() == 0) {
      alert("딜이 없습니다.\n\n딜를 먼저 등록하십시오.");
      return;
    }
    var groupData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    if (groupData.CRUD == "N" || groupData.CRUD == "C") {
      alert("신규 딜입니다.\n\n저장 후 딜옵션을 등록하십시요.");
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
        G_GRDDETAIL.view.gotoCell(rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      BU_CD: groupData.BU_CD,
      MALL_CD: groupData.MALL_CD,
      DEAL_ID: groupData.DEAL_ID,
      OPTION_ID: null,
      OPTION_VALUE: null,
      OPTION_CNT: null,
      P_REG_USER_ID: $NC.G_USERINFO.USER_ID,
      id: $NC.getGridNewRowId(),
      CRUD: "N"
    };

    G_GRDDETAIL.data.addItem(newRowData);
    $NC.setGridSelectRow(G_GRDDETAIL, rowCount);
    // 수정 상태로 변경
    G_GRDDETAIL.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdDetailOnNewRecord({
      row: rowCount,
      rowData: newRowData
    });
    // grdSub에 포커스가 있을 경우
  } else {
    if (G_GRDMASTER.data.getLength() == 0) {
      alert("딜이 없습니다.\n\n딜를 먼저 등록하십시오.");
      return;
    }
    if (G_GRDDETAIL.data.getLength() == 0) {
      alert("딜옵션이 없습니다.\n\n딜옵션을 먼저 등록하십시오.");
      return;
    }
    var groupData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    var groupDataM = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (groupData.CRUD == "N" || groupData.CRUD == "C") {
      alert("신규 딜옵션입니다.\n\n저장 후 딜상품을 등록하십시요.");
      return;
    }

    $NC.serviceCall("/CM04040E/callSP.do", {
      P_QUERY_ID: "WF.ROLE_BRAND_MATCHING",
      P_QUERY_PARAMS: $NC.getParams({
        P_DEAL_ID: groupData.DEAL_ID
      })  
    }, function(ajaxData) {
      var resultData = $NC.toArray(ajaxData);
      if (!$NC.isNull(resultData)) {
        if (resultData.O_MSG === "OK") {
          if (resultData.O_DEAL_MESSEGE === "N") {
            alert("판매사" + "[" + groupDataM.BRAND_CD + "]" + "  "+ groupDataM.SELLER_NM  + "  " +"의 위탁사를 등록해주시기 바랍니다..");
            _Cancel();
      return;
    }
        }
      }
    });

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

    var rowCount = G_GRDSUB.data.getLength();

    if (rowCount > 0) {
      // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
      var rowData = G_GRDSUB.data.getItem(rowCount - 1);
      if (rowData.CRUD == "N") {
        G_GRDSUB.view.gotoCell(rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      BU_CD: groupData.BU_CD,
      MALL_CD: groupData.MALL_CD,
      DEAL_ID: groupData.DEAL_ID,
      OPTION_ID: groupData.OPTION_ID,
      OWN_BRAND_CD: groupData.OWN_BRAND_CD,
      BRAND_NM: groupData.OWN_BRAND_NM,
      BRAND_CD: null,
      DEAL_ITEM_CD: null,
      DEAL_ITEM_NM: null,
      DEAL_ITEM_SPEC: null,
      DEAL_ITEM_QTY: "0",
      P_REG_USER_ID: $NC.G_USERINFO.USER_ID,
      id: $NC.getGridNewRowId(),
      CRUD: "N"
    };

    G_GRDSUB.data.addItem(newRowData);
    $NC.setGridSelectRow(G_GRDSUB, rowCount);
    // 수정 상태로 변경
    G_GRDSUB.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdSubOnNewRecord({
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
  } else if (G_GRDDETAIL.focused) {

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
  } else {

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
  }

  var saveMasterDS = [ ];
  var saveDetailDS = [ ];
  var saveSubDS = [ ];
  var saveSubDS1 = [ ];
  var rowCount;
  var rowCheck;
  var row;
  var rowData;
  var saveData;

  rowCount = G_GRDSUB.data.getLength();
  rowCheck = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
  if (!$NC.isNull(rowCheck)) {
    if (rowCheck.CRUD !== "D") {
      for (row = 0; row < rowCount; row++) {
        rowData = G_GRDSUB.data.getItem(row);
        if (rowData.DEAL_ITEM_QTY >= 2) {
          var result = confirm("구성수량을 2보다 큰 수를 입력하셨습니다.\n\n 저장하시겠습니까?");
          if (!result) {
            $NC.setGridSelectRow(G_GRDSUB, row);
            G_GRDSUB.view.gotoCell(row, G_GRDSUB.view.getColumnIndex("DEAL_ITEM_QTY"), true);
            return;
          } else {
            break;
          }
        }
      }
    }
  }

  // 딜 수정 데이터
  // var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
  rowCount = G_GRDMASTER.data.getLength();
  for (row = 0; row < rowCount; row++) {
    rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      saveData = {
        P_BU_CD: rowData.BU_CD,
        P_DEAL_ID: rowData.DEAL_ID,
        P_DEAL_NM: rowData.DEAL_NM,
        P_DEAL_DIV: rowData.DEAL_DIV,
        P_RESALE_DEAL_YN: rowData.RESALE_DEAL_YN,
        // P_CIRCULATION_ID: rowData.CIRCULATION_ID,
        P_OUT_CENTER_CD: rowData.OUT_CENTER_CD,
        P_MALL_CD: rowData.MALL_CD,
        P_BRAND_CD: rowData.BRAND_CD,
        P_COMPANY_ID: rowData.COMPANY_ID,
        P_OPEN_DATE: rowData.OPEN_DATE,
        P_CLOSE_DATE: rowData.CLOSE_DATE,
        P_REG_USER_ID: rowData.REG_USER_ID,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveMasterDS.push(saveData);
    }
  }

  // 딜옵션 수정 데이터
  rowCount = G_GRDDETAIL.data.getLength();
  for (row = 0; row < rowCount; row++) {
    rowData = G_GRDDETAIL.data.getItem(row);

    if (rowData.CRUD !== "R") {
      saveData = {
        P_BU_CD: rowData.BU_CD,
        P_MALL_CD: rowData.MALL_CD,
        P_DEAL_ID: rowData.DEAL_ID,
        P_OPTION_ID: rowData.OPTION_ID,
        P_OPTION_VALUE: rowData.OPTION_VALUE,
        P_OPTION_CNT: rowData.OPTION_CNT,
        P_REMARK1: rowData.REMARK1,
        P_REG_USER_ID: rowData.REG_USER_ID,
        P_CRUD: rowData.CRUD
      };
      saveDetailDS.push(saveData);
    }
  }

  // 딜상품 수정 데이터
  rowCount = G_GRDSUB.data.getLength();
  for (row = 0; row < rowCount; row++) {
    rowData = G_GRDSUB.data.getItem(row);
    if (rowData.CRUD !== "R") {
      saveData = {
        P_BU_CD: rowData.BU_CD,
        P_MALL_CD: rowData.MALL_CD,
        P_DEAL_ID: rowData.DEAL_ID,
        P_OPTION_ID: rowData.OPTION_ID,
        P_BRAND_CD: rowData.BRAND_CD,
        P_DEAL_ITEM_CD: rowData.DEAL_ITEM_CD,
        P_DEAL_ITEM_QTY: rowData.DEAL_ITEM_QTY,
        P_HOLD_YN: rowData.HOLD_YN,
        P_REG_USER_ID: rowData.REG_USER_ID,
        P_CRUD: rowData.CRUD
      };
      saveSubDS.push(saveData);
    }
  }
  rowCount = G_GRDSUB.data.getLength();
  for (row = 0; row < rowCount; row++) {
    rowData = G_GRDSUB.data.getItem(row);
    saveData1 = {
      P_BU_CD: rowData.BU_CD,
      P_MALL_CD: rowData.MALL_CD,
      P_DEAL_ID: rowData.DEAL_ID,
      P_OPTION_ID: rowData.OPTION_ID,
      P_BRAND_CD: rowData.BRAND_CD,
      P_DEAL_ITEM_CD: rowData.DEAL_ITEM_CD
    };
    saveSubDS1.push(saveData1);
  }
  $NC.serviceCall("/CM04040E/callInsert.do", {
    P_DS_MASTER: $NC.toJson(saveSubDS1)
  });

  if (saveMasterDS.length > 0 || saveDetailDS.length > 0 || saveSubDS.length > 0) {
    $NC.serviceCall("/CM04040E/save.do", {
      P_DS_MASTER: $NC.toJson(saveMasterDS),
      P_DS_DETAIL: $NC.toJson(saveDetailDS),
      P_DS_SUB: $NC.toJson(saveSubDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  var messageAnswer;

  if (G_GRDMASTER.focused) {

    if (G_GRDMASTER.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    if (G_GRDDETAIL.data.getLength() == 0) {
      messageAnswer = confirm("딜을 삭제 하시겠습니까?");
    } else {
      messageAnswer = confirm("하위 데이터가 있습니다.\n\n그래도 딜을 삭제 하시겠습니까?");
    }

    if (messageAnswer) {
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
  } else if (G_GRDDETAIL.focused) {

    if (G_GRDDETAIL.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    if (G_GRDSUB.data.getLength() == 0) {
      messageAnswer = confirm("딜옵션을 삭제 하시겠습니까?");
    } else {
      messageAnswer = confirm("하위 데이터가 있습니다.\n\n그래도 딜옵션을 삭제 하시겠습니까?");
    }

    if (messageAnswer) {
      var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

      // 신규 데이터일 경우 그냥 삭제
      if (rowData.CRUD === "C" || rowData.CRUD === "N") {
        // 마지막 선택 Row 수정 상태 복원
        G_GRDDETAIL.lastRowModified = false;

        G_GRDDETAIL.data.deleteItem(rowData.id);
        // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
        if (G_GRDDETAIL.lastRow > 1) {
          $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.lastRow - 1);
        } else {
          $NC.setGridSelectRow(G_GRDDETAIL, 0);
        }
      } else {
        rowData.CRUD = "D";
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        _Save();
      }
    }
  } else {

    if (G_GRDSUB.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    messageAnswer = confirm("딜구성상품을 삭제 하시겠습니까?");
    if (messageAnswer) {
      var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);

      // 신규 데이터일 경우 그냥 삭제
      if (rowData.CRUD === "C" || rowData.CRUD === "N") {
        // 마지막 선택 Row 수정 상태 복원
        G_GRDSUB.lastRowModified = false;

        G_GRDSUB.data.deleteItem(rowData.id);
        // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
        if (G_GRDSUB.lastRow > 1) {
          $NC.setGridSelectRow(G_GRDSUB, G_GRDDETAIL.lastRow - 1);
        } else {
          $NC.setGridSelectRow(G_GRDSUB, 0);
        }
      } else {
        rowData.CRUD = "D";
        G_GRDSUB.data.updateItem(rowData.id, rowData);
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
    selectKey: "DEAL_ID",
    isCancel: true
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "OPTION_ID",
    isCancel: true
  });
  var lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDSUB, {
    selectKey: "DEAL_ITEM_CD",
    isCancel: true
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL.lastKeyVal = lastKeyVal2;
  G_GRDSUB.lastKeyVal = lastKeyVal3;
}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "MALL_NM",
    field: "MALL_NM",
    name: "MALL명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SELLER_NM",
    field: "SELLER_NM",
    name: "판매사명",
    minWidth: 100
  });
  if ($NC.G_USERINFO.CERTIFY_DIV !== '4') {
    $NC.setGridColumn(columns, {
      id: "DEAL_ID",
      field: "DEAL_ID",
      name: "딜코드",
      minWidth: 60,
      editor: Slick.Editors.Text,
      editorOptions: {
        isKeyField: true
      }
    });
    $NC.setGridColumn(columns, {
      id: "DEAL_NM",
      field: "DEAL_NM",
      name: "딜명",
      minWidth: 150,
      editor: Slick.Editors.Text,
      editorOptions: {
        isKeyField: true
      }
    });
    
    $NC.setGridColumn(columns, {
      id: "RESALE_DEAL_YN_F",
      field: "RESALE_DEAL_YN_F",
      name: "재판매여부",
      minWidth: 90,
      editor: Slick.Editors.ComboBox,
      editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: $NC.getParams({
          P_CODE_GRP: "RESALE_DEAL_YN",
          P_CODE_CD: "%",
          P_SUB_CD1: "",
          P_SUB_CD2: ""
        })
      }, {
        codeField: "RESALE_DEAL_YN",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F",
        isKeyField: true
      })
    });

    

    $NC.setGridColumn(columns, {
      id: "DEAL_DIV_F",
      field: "DEAL_DIV_F",
      name: "거래구분",
      minWidth: 90,
      editor: Slick.Editors.ComboBox,
      editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: $NC.getParams({
          P_CODE_GRP: "DEAL_DIV",
          P_CODE_CD: "%",
          P_SUB_CD1: "",
          P_SUB_CD2: ""
        })
      }, {
        codeField: "DEAL_DIV",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F",
        isKeyField: true
      })
    });

    $NC.setGridColumn(columns, {
      id: "CENTER_DIV_F",
      field: "CENTER_DIV_F",
      name: "담당물류센터",
      minWidth: 150,
      editor: Slick.Editors.ComboBox,
      editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CMCODE",
        P_QUERY_PARAMS: $NC.getParams({
          P_CODE_GRP: "CENTER_DIV",
          P_CODE_CD: "%",
          P_SUB_CD1: "",
          P_SUB_CD2: ""
        })
      }, {
        codeField: "OUT_CENTER_CD",
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F",
        isKeyField: true
      })
    });

    $NC.setGridColumn(columns, {
      id: "REMARK1",
      field: "REMARK1",
      name: "비고",
      minWidth: 180,
      editor: Slick.Editors.Text
    });
    $NC.setGridColumn(columns, {
      id: "OPEN_DATE",
      field: "OPEN_DATE",
      name: "거래일자",
      minWidth: 100,
      editor: Slick.Editors.Date
    });
    $NC.setGridColumn(columns, {
      id: "CLOSE_DATE",
      field: "CLOSE_DATE",
      name: "종료일자",
      minWidth: 100,
      editor: Slick.Editors.Date
    });
  } else if ($NC.G_USERINFO.CERTIFY_DIV == '4') {
    $NC.setGridColumn(columns, {
      id: "DEAL_ID",
      field: "DEAL_ID",
      name: "딜코드",
      minWidth: 60
    });
    $NC.setGridColumn(columns, {
      id: "DEAL_NM",
      field: "DEAL_NM",
      name: "딜명",
      minWidth: 150
    });

    $NC.setGridColumn(columns, {
      id: "DEAL_DIV_F",
      field: "DEAL_DIV_F",
      name: "거래구분",
      minWidth: 90
    });
    $NC.setGridColumn(columns, {
      id: "CENTER_DIV_F",
      field: "CENTER_DIV_F",
      name: "거래구분",
      minWidth: 150
    });
    $NC.setGridColumn(columns, {
      id: "REMARK1",
      field: "REMARK1",
      name: "비고",
      minWidth: 180
    });
    $NC.setGridColumn(columns, {
      id: "OPEN_DATE",
      field: "OPEN_DATE",
      name: "거래일자",
      minWidth: 100
    });
    $NC.setGridColumn(columns, {
      id: "CLOSE_DATE",
      field: "CLOSE_DATE",
      name: "종료일자",
      minWidth: 100
    });
  }

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {


  
  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1,    
    specialRow: {
      compareFn: function(specialRow, rowData) {

        if (rowData.RESALE_DEAL_YN_F == '0 - 미지정') {
          return "specialrow3";
        } 
        
        if ($NC.isNull(rowData.CENTER_DIV_F)) {
          return "specialrow3";
        } 
        
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CM04040E.RS_MASTER",
    sortCol: "DEAL_ID",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);

  $("#grdMaster").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    G_GRDMASTER.focused = true;
    G_GRDDETAIL.focused = false;
    G_GRDSUB.focused = false;

    // 디테일 데이터 Post 처리
    if (G_GRDDETAIL.view.getEditorLock().isActive()) {
      G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL.lastRow != null) {
        if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
          G_GRDDETAIL.view.getCanvasNode.focus();
        }
      }
    }

    // 서브 데이터 Post 처리
    if (G_GRDSUB.view.getEditorLock().isActive()) {
      G_GRDSUB.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDSUB.lastRow != null) {
        if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
          G_GRDSUB.view.getCanvasNode.focus();
        }
      }
    }

  });
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  $NC.G_VAR.itemPopupParam.COMPANYID = G_GRDMASTER.data.getItem(row).COMPANY_ID;
  $NC.G_VAR.itemPopupParam.BRAND_NM = G_GRDMASTER.data.getItem(row).BRAND_NM;

  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 딜옵션 초기화
  $NC.setInitGridVar(G_GRDDETAIL);
  onGetDetail({
    data: null
  });

  // 딜옵션 조회
  var rowData = G_GRDMASTER.data.getItem(row);

  if (rowData.CRUD !== "C" && rowData.CRUD !== "N") {
    G_GRDDETAIL.queryParams = $NC.getParams({
      P_BU_CD: rowData.BU_CD,
      P_MALL_CD: rowData.MALL_CD,
      P_DEAL_CD: rowData.DEAL_ID
    });

    $NC.serviceCall("/CM04040E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdMasterOnBeforeEditCell(e, args) {

  var rowData = args.item;
  // 신규 데이터일 때만 수정 가능한 컬럼
  if (args.column.field === "DEAL_ID") {
    if (rowData) {
      // 신규 데이터가 아니면 코드 수정 불가
      if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
        return false;
      }
    }
  }

  return true;
}

function grdMasterOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDMASTER.view.getColumnField(args.cell)) {
  case "OPEN_DATE":
    if (!$NC.isNull(rowData.OPEN_DATE)) {
      if (!$NC.isDate(rowData.OPEN_DATE)) {
        alert("거래일자를 정확히 입력하십시오.");
        rowData.OPEN_DATE = "";
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDMASTER, {
          selectRow: args.row,
          activeCell: G_GRDMASTER.view.getColumnIndex("OPEN_DATE"),
          editMode: true
        });
        return false;
      } else {
        rowData.OPEN_DATE = $NC.getDate(rowData.OPEN_DATE);
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
      }
    }
    break;
  case "CLOSE_DATE":
    if (!$NC.isNull(rowData.CLOSE_DATE)) {
      if (!$NC.isDate(rowData.CLOSE_DATE)) {
        alert("종료일자를 정확히 입력하십시오.");
        rowData.CLOSE_DATE = "";
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
        $NC.setGridSelectRow(G_GRDMASTER, {
          selectRow: args.row,
          activeCell: G_GRDMASTER.view.getColumnIndex("CLOSE_DATE"),
          editMode: true
        });
        return false;
      } else {
        rowData.CLOSE_DATE = $NC.getDate(rowData.CLOSE_DATE);
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
      }
    }
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

function grdMasterOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDMASTER, args.row, 0, true);
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
    if ($NC.isNull(rowData.DEAL_ID)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.DEAL_ID)) {
      alert("딜코드를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("DEAL_ID"), true);
      return false;
    }
    if ($NC.isNull(rowData.DEAL_NM)) {
      alert("딜명을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("DEAL_NM"), true);
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜코드",
    minWidth: 70,
  });

  if ($NC.G_USERINFO.CERTIFY_DIV !== '4') {
    $NC.setGridColumn(columns, {
      id: "OPTION_ID",
      field: "OPTION_ID",
      name: "옵션코드",
      minWidth: 70,
      editor: Slick.Editors.Text,
      editorOptions: {
        isKeyField: true
      }
    });
    $NC.setGridColumn(columns, {
      id: "OPTION_VALUE",
      field: "OPTION_VALUE",
      name: "옵션명",
      minWidth: 180,
      editor: Slick.Editors.Text
    });
    // OPTION_CNT
    $NC.setGridColumn(columns, {
      id: "OPTION_CNT",
      field: "OPTION_CNT",
      name: "옵션수량",
      minWidth: 60,
      cssClass: "align-right",
      editor: Slick.Editors.Number
    });
  } else if ($NC.G_USERINFO.CERTIFY_DIV == '4') {
    $NC.setGridColumn(columns, {
      id: "OPTION_ID",
      field: "OPTION_ID",
      name: "옵션코드",
      minWidth: 70
    });
    $NC.setGridColumn(columns, {
      id: "OPTION_VALUE",
      field: "OPTION_VALUE",
      name: "옵션명",
      minWidth: 180
    });
    // OPTION_CNT
    $NC.setGridColumn(columns, {
      id: "OPTION_CNT",
      field: "OPTION_CNT",
      name: "옵션수량",
      minWidth: 60,
      cssClass: "align-right"
    });
  }
  $NC.setGridColumn(columns, {
    id: "REG_USER_ID",
    field: "REG_USER_ID",
    name: "등록자ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REG_DATETIME",
    field: "REG_DATETIME",
    name: "등록일시",
    minWidth: 140,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "CM04040E.RS_DETAIL",
    sortCol: "OPTION_ID",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);

  $("#grdDetail").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = true;
    G_GRDSUB.focused = false;

    // 마스터 데이터 Post 처리
    if (G_GRDMASTER.view.getEditorLock().isActive()) {
      G_GRDMASTER.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDMASTER.lastRow != null) {
        if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
          G_GRDMASTER.view.getCanvasNode.focus();
        }
      }
    }
    // 서브 데이터 Post 처리
    if (G_GRDSUB.view.getEditorLock().isActive()) {
      G_GRDSUB.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDSUB.lastRow != null) {
        if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
          G_GRDSUB.view.getCanvasNode.focus();
        }
      }
    }
  });
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

  // 딜옵션상품 초기화
  $NC.setInitGridVar(G_GRDSUB);
  onGetSub({
    data: null
  });

  // 딜옵션상품 조회
  var rowData = G_GRDDETAIL.data.getItem(row);
  if (rowData.CRUD !== "C" && rowData.CRUD !== "N") {
    G_GRDSUB.queryParams = $NC.getParams({
      P_BU_CD: rowData.BU_CD,
      P_MALL_CD: rowData.MALL_CD,
      P_DEAL_CD: rowData.DEAL_ID,
      P_OPTION_CD: rowData.OPTION_ID
    });
    $NC.serviceCall("/CM04040E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

function grdDetailOnBeforeEditCell(e, args) {

  var rowData = G_GRDDETAIL.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      if (args.column.field === "OPTION_ID") {
        return false;
      }
    }
  }
  return true;
}

function grdDetailOnCellChange(e, args) {

  var rowData = G_GRDDETAIL.data.getItem(args.row);

  switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
  case "OPTION_ID":
    // rowData.DEAL_ID = rowData.DEAL_ID + rowData.OPTION_ID;
    rowData.DEAL_ID = rowData.DEAL_ID;
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
}

function grdDetailOnNewRecord(args) {

  G_GRDDETAIL.view.gotoCell(args.row, 0, true);
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
    if ($NC.isNull(rowData.OPTION_ID)) {
      G_GRDDETAIL.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.OPTION_ID)) {
      alert("딜옵션코드를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, row);
      G_GRDDETAIL.view.gotoCell(row, G_GRDDETAIL.view.getColumnIndex("OPTION_ID"), true);
      return false;
    }
    /*
    if ($NC.isNull(rowData.DEAL_OPTION_NM)) {
      alert("딜옵션명을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, row);
      G_GRDDETAIL.view.gotoCell(row, G_GRDDETAIL.view.getColumnIndex("DEAL_OPTION_NM"), true);
      return false;
    }
    */
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdSubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BRAND_NM1",
    field: "BRAND_NM",
    name: "위탁사명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ITEM_CD",
    field: "DEAL_ITEM_CD",
    name: "상품코드",
    minWidth: 90,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdSubOnPopup,
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ITEM_NM",
    field: "DEAL_ITEM_NM",
    name: "상품명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ITEM_SPEC",
    field: "DEAL_ITEM_SPEC",
    name: "규격",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ITEM_QTY",
    field: "DEAL_ITEM_QTY",
    name: "구성수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "HOLD_YN",
    field: "HOLD_YN",
    name: "보류여부",
    minWidth: 60,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: "CM04040E.RS_SUB",
    sortCol: "DEAL_ITEM_CD",
    gridOptions: options
  });

  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
  G_GRDSUB.view.onBeforeEditCell.subscribe(grdSubOnBeforeEditCell);
  G_GRDSUB.view.onCellChange.subscribe(grdSubOnCellChange);

  $("#grdSub").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = false;
    G_GRDSUB.focused = true;

    // 마스터 데이터 Post 처리
    if (G_GRDMASTER.view.getEditorLock().isActive()) {
      G_GRDMASTER.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDMASTER.lastRow != null) {
        if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
          G_GRDMASTER.view.getCanvasNode.focus();
        }
      }
    }
    // 디테일 데이터 Post 처리
    if (G_GRDDETAIL.view.getEditorLock().isActive()) {
      G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL.lastRow != null) {
        if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
          G_GRDDETAIL.view.getCanvasNode.focus();
        }
      }
    }
  });
}

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

function grdSubOnBeforeEditCell(e, args) {

  var rowData = G_GRDSUB.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      if (args.column.field === "DEAL_ITEM_CD") {
        return false;
      }
    }
  }
  return true;
}

function grdSubOnCellChange(e, args) {

  var rowData = args.item;
  $NC.G_VAR.itemPopupParam.DEALID = rowData.DEAL_ID;

  switch (G_GRDSUB.view.getColumnField(args.cell)) {
  case "DEAL_ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.DEAL_ITEM_CD)) {
      P_QUERY_PARAMS = {
        P_BU_CD: rowData.BU_CD,
        P_BRAND_CD: rowData.OWN_BRAND_CD,
        P_ITEM_CD: rowData.DEAL_ITEM_CD,
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
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUB.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUB.lastRowModified = true;
}

function grdSubOnNewRecord(args) {

  G_GRDSUB.view.gotoCell(args.row, 0, true);
}

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

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.DEAL_ITEM_CD)) {
      G_GRDSUB.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDSUB, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.DEAL_ITEM_CD)) {
      alert("구성상품을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUB, row);
      G_GRDSUB.view.gotoCell(row, G_GRDSUB.view.getColumnIndex("DEAL_ITEM_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.DEAL_ITEM_QTY)) {
      alert("구성수량을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUB, row);
      G_GRDSUB.view.gotoCell(row, G_GRDSUB.view.getColumnIndex("DEAL_ITEM_QTY"), true);
      return false;
    }
    if (rowData.DEAL_ITEM_QTY < 1) {
      alert("구성수량을 1보다 큰 수를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUB, row);
      G_GRDSUB.view.gotoCell(row, G_GRDSUB.view.getColumnIndex("DEAL_ITEM_QTY"), true);
      return false;
    }
    /*
    if (rowData.DEAL_ITEM_QTY >= 2) {
      var result = confirm("구성수량을 2보다 큰수를 입력하셧습니다.\n\n 저장하시겠습니까?");
      if (!result) {
        $NC.setGridSelectRow(G_GRDSUB, row);
        G_GRDSUB.view.gotoCell(row, G_GRDSUB.view.getColumnIndex("DEAL_ITEM_QTY"), true);
        return false;
      }
    }
    */
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDSUB.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function grdSubOnPopup(e, args) {

  var rowData = args.item;
  /*
    var BRAND_CD = $NC.G_VAR.itemPopupParam.COMPANYID;
    var BRAND_NM = $NC.G_VAR.itemPopupParam.BRAND_NM;

    var STR1 = "사입";
    var STR2 = "나무인터넷";

    if (BRAND_NM.indexOf(STR1) >= 0 || BRAND_NM.indexOf(STR2) >= 0) {
      BRAND_CD = "000000";
    } else {
      BRAND_CD = $NC.G_VAR.itemPopupParam.COMPANYID;
  }
  */
  switch (args.column.field) {
  case "DEAL_ITEM_CD":
        $NP.showItemPopup({
          P_BU_CD: rowData.BU_CD,
          P_BRAND_CD: rowData.OWN_BRAND_CD,
          P_ITEM_CD: "%",
          P_VIEW_DIV: "1",
          P_DEPART_CD: "%",
          P_LINE_CD: "%",
          P_CLASS_CD: "%"
        }, onItemPopup, function(ajaxData) {
          $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, G_GRDSUB.view.getColumnIndex("DEAL_ITEM_CD"), true, true);
        });
        break;
  }
}

/**
 * 딜ID 복사등록 버튼 호출.
 */
function onCopyDeal() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    return;
  }
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "CM04041P",
    PROGRAM_NM: "딜번호 복사등록",
    url: "cm/CM04041P.html",
    width: 610,
    height: 130,
    userData: {
      P_BU_CD: rowData.BU_CD,
      P_DEAL_ID: rowData.DEAL_ID,
      P_DEAL_NM: rowData.DEAL_NM
    },
    onOk: function() {
      _Inquiry();
    }
  });
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "DEAL_ID",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
    // 딜옵션 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    onGetDetail({
      data: null
    });
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

function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "OPTION_ID",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);

    // 딜상품 초기화
    $NC.setInitGridVar(G_GRDSUB);
    onGetSub({
      data: null
    });
  }
}

function onGetSub(ajaxData) {

  $NC.setInitGridData(G_GRDSUB, ajaxData);
  if (G_GRDSUB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDSUB.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSUB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSUB, {
        selectKey: "DEAL_ITEM_CD",
        selectVal: G_GRDSUB.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdSub", 0, 0);
  }
}

function onSave(ajaxData) {
  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "DEAL_ID"
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "OPTION_ID",
  });
  var lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDSUB, {
    selectKey: "DEAL_ITEM_CD",
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL.lastKeyVal = lastKeyVal2;
  G_GRDSUB.lastKeyVal = lastKeyVal3;

}
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);

  var grdView = null;

  if (G_GRDMASTER.focused) {
    grdView = G_GRDMASTER;
  } else if (G_GRDDETAIL.focused) {
    grdView = G_GRDDETAIL;
  } else {
    grdView = G_GRDSUB;
  }

  var rowData = grdView.data.getItem(grdView.lastRow);
  if (rowData.CRUD === "D") {
    rowData.CRUD = "U";
    grdView.data.updateItem(rowData.id, rowData);
    // 마지막 선택 Row 수정 상태로 변경
    grdView.lastRowModified = true;
  }
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
    $NC.setFocus("#edtQBu_Cd", true);
  }
  setMallCodeCombo($NC.getValue("#edtQBu_Cd"));
  onChangingCondition();
}

/**
 * 상품 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onItemPopup(resultInfo) {

  var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }

  /*
  $NC.serviceCall("/CM04040E/callSP.do", {
    P_QUERY_ID: "WF.GET_DEALITEM_ENTRY_YN",
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_DEAL_ID: $NC.G_VAR.itemPopupParam.DEALID,
      P_DEAL_ITEM_CD: resultInfo.ITEM_CD
    })
  }, function(ajaxData) {
    var resultData = $NC.toArray(ajaxData.data);
    var O_ENTRY_YN = resultData["O_ENTRY_YN"];
    if (O_ENTRY_YN == "Y" && !$NC.isNull(O_ENTRY_YN)) {
      var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);
      alert("선택한 상품은 중복선택된 상품입니다.\n상품을 다시 선택해주십시오.");
      rowData.BRAND_NM = "";
      rowData.BRAND_NM = "";
      rowData.DEAL_ITEM_CD = "";
      rowData.DEAL_ITEM_NM = "";
      G_GRDSUB.data.updateItem(rowData.id, rowData);
      G_GRDSUB.view.gotoCell(G_GRDSUB.lastRow, G_GRDSUB.view.getColumnIndex("DEAL_ITEM_CD"), true);
      $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, G_GRDSUB.view.getColumnIndex("DEAL_ITEM_CD"), true, true);
    return;
  }
  });
  */

  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.BRAND_CD = resultInfo.BRAND_CD;
    rowData.BRAND_NM = resultInfo.BRAND_NM;
    rowData.DEAL_ITEM_CD = resultInfo.ITEM_CD;
    rowData.DEAL_ITEM_NM = resultInfo.ITEM_NM;
    rowData.DEAL_ITEM_SPEC = resultInfo.ITEM_SPEC;
    focusCol = G_GRDSUB.view.getColumnIndex("DEAL_ITEM_QTY");
  } else {
    rowData.BRAND_CD = "";
    rowData.BRAND_NM = "";
    rowData.DEAL_ITEM_CD = "";
    rowData.DEAL_ITEM_NM = "";
    rowData.DEAL_ITEM_SPEC = "";
    focusCol = G_GRDSUB.view.getColumnIndex("DEAL_ITEM_CD");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUB.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDSUB.lastRowModified = true;
  $NC.setFocusGrid(G_GRDSUB, G_GRDSUB.lastRow, focusCol, true, true);
}

function showDealPopup() {
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var DEAL_ID = $NC.getValue("#edtQDeal_Cd", true);

  $NP.showDealPopup({
    P_BU_CD: BU_CD,
    P_DEAL_ID: DEAL_ID,
    P_VIEW_DIV: "2",
  }, onDealPopup, function() {
    $NC.setFocus("#edtQOption_Cd", true);
  });
}

function showDealOptionPopup() {
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var DEAL_ID = $NC.getValue("#edtQDeal_Cd", true);

  if ($NC.isNull(DEAL_ID)) {
    alert("먼저 딜코드를 입력하십시오.");
    $NC.setFocus("#edtQDeal_Cd");
    return;
  }

  $NP.showDealOptionPopup({
    P_BU_CD: BU_CD,
    P_DEAL_ID: DEAL_ID,
    P_OPTION_ID: "%"
  }, onDealOptionPopup, function() {
    $NC.setFocus("#edtEvent_Cd", true);
  });
}

function onDealPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQDeal_Cd", resultInfo.DEAL_ID);
    $NC.setValue("#edtQDeal_Nm", resultInfo.DEAL_NM);
  } else {
    $NC.setValue("#edtQDeal_Cd");
    $NC.setValue("#edtQDeal_Nm");
    $NC.setFocus("#edtQOption_Cd", true);
  }
  onChangingCondition();
}

function onDealOptionPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQOption_Cd", resultInfo.OPTION_ID);
    $NC.setValue("#edtQOption_Nm", resultInfo.OPTION_VALUE);
  } else {
    $NC.setValue("#edtQOption_Cd");
    $NC.setValue("#edtQOption_Nm");
    $NC.setFocus("#edtEvent_Cd", true);
  }
  onChangingCondition();
}

/**
 * MALL 브랜드 검색 팝업 클릭
 */

function showMallBrandPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var MALL_CD = $NC.getValue("#cboQMall_Cd");
  if ($NC.isNull(MALL_CD)) {
    alert("먼저 몰구분을 선택하십시오.");
    $NC.setFocus("#cboQMall_Cd");
    return;
  }

  $NP.showMallBrandPopup({
    P_BU_CD: BU_CD,
    P_MALL_CD: MALL_CD,
    P_BRAND_CD: '%'
  }, onMallBrandPopup, function() {
    $NC.setFocus("#edtQMall_Brand_Cd", true);
  });
}

/**
 * MALL 브랜드 검색 결과
 * 
 * @param seletedRowData
 */

function onMallBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {

    $NC.setValue("#edtQMall_Brand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQMall_Brand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.setValue("#edtQMall_Brand_Cd");
    $NC.setValue("#edtQMall_Brand_Nm");
    $NC.setFocus("#edtQMall_Brand_Cd", true);
  }
}

/**
 * 검색조건의 브랜드 검색 이미지 클릭
 */

/*
function showUserBrandPopup() {
  $NP.showUserBrandPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BRAND_CD: "%"
  }, onUserBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}
*/

/**
 * 브랜드 검색 결과 / 검색 실패 했을 경우(not found)
 */
/*
function onUserBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  onChangingCondition();
}
*/

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

  if (G_GRDSUB.view.getEditorLock().isActive()) {
    G_GRDSUB.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDSUB, args.row);

  var rowData = G_GRDSUB.data.getItem(args.row);

  if (args.cell == G_GRDSUB.view.getColumnIndex("HOLD_YN")) {
    rowData.HOLD_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUB.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUB.lastRowModified = true;
}

/**
 * 사업부 값 변경시 몰코드 콤보 재설정
 */
function setMallCodeCombo(setBu_Cd) {

  var BU_CD;
  if ($NC.isNull(setBu_Cd)) {
    BU_CD = "5000";
  } else {
    BU_CD = setBu_Cd;
  }

  if (BU_CD == "5000") {

    // 몰구분
    $NC.setInitCombo("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMMALL",
      P_QUERY_PARAMS: $NC.getParams({
        P_MALL_CD: "M00%"
      })
    }, {
      selector: "#cboQMall_Cd",
      codeField: "MALL_CD",
      nameField: "MALL_NM",
      fullNameField: "MALL_CD_F"
    });
  } else {
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
      addAll: true
    });
  }
}
/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);

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
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  // setDepartCombo();
  onChangingCondition();
}

/**
 * 검색조건의 판매사 검색 팝업 클릭
 */
function showSellerPopup() {
  var CUST_CD = $NC.G_USERINFO.CUST_CD;
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  $NP.showSellerPopup({
    P_CUST_CD: CUST_CD,
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: BRAND_CD,
    P_SELLER_CD: '%'
  }, onSellerPopup, function() {
    $NC.setFocus("#edtQMall_Brand_Cd", true);
  });
}

/**
 * 판매사 검색 결과
 * 
 * @param seletedRowData
 */
function onSellerPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQMall_Brand_Cd", resultInfo.SELLER_CD);
    $NC.setValue("#edtQMall_Brand_Nm", resultInfo.SELLER_NM);
  } else {
    $NC.setValue("#edtQMall_Brand_Cd");
    $NC.setValue("#edtQMall_Brand_Nm");
    $NC.setFocus("#edtQMall_Brand_Cd", true);
  }
  // setDepartCombo();
  onChangingCondition();
}
