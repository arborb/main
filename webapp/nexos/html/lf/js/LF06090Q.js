/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {
  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({ 
    printOptions: [{
      PRINT_INDEX: 0,
      PRINT_COMMENT: "거래명세서 출력"
    }]
  });

   
  // 조회조건 - 정산항목 세팅
  $NC.setInitCombo("/LF04010Q/getDataSet.do", {
    P_QUERY_ID: "LF04010Q.RS_SUB1",
    P_QUERY_PARAMS: $NC.getParams("{}")
  }, {
    selector: "#cboQFee_Head_Cd",
    codeField: "FEE_HEAD_CD",
    nameField: "FEE_HEAD_NM",
    fullNameField: "FEE_HEAD_CD_F",
    addAll: true,
    onComplete: function() {
      // 조회조건 - 정산세부 세팅
      onGetFeeBaseCd();
    }
  });
  
  // 조회조건 - 물류센터 세팅
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

  // 그리드 초기화
  grdMasterInitialize();

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  $("#btnQBu_Cd").click(showUserBuPopup);

  // 위탁사 버튼 설정
  $("#btnQOwn_Brand_Cd").click(showOwnBranPopup);

  // 정산항목 버튼 설정  
  $("#btnQFee_Head_Cd").click(showFee_Head_CdPopup);
  $("#btnQFee_Base_Cd").click(showFee_Base_CdPopup);
  
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
 * 화면 리사이즈 Offset 계산
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;
  var height = clientHeight - $NC.G_LAYOUT.header;
  
  // Splitter 컨테이너 크기 조정
  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  // Master Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, height); 
  
  // 위탁사 버튼 설정
  $("#btnQBrand_Cd").click(showBuBrandPopup);
  
  //정산월에 달력이미지 설정
  $NC.setInitMonthPicker("#dtpQAdjust_Month", $NC.G_USERINFO.LOGIN_DATE);  
}

function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();

  // 저장
  $NC.setEnable("#lbl_Pop_Cd", permission.canSave && G_GRDMASTER.data.getLength() > 0);
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();

  // 브랜드 Key 입력
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
  case "OWN_BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
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
    
  case "FEE_HEAD_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_CENTER_FUNC_DIV: '%',
        P_FEE_HEAD_CD: val
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
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    var FEE_HEAD_CD = $NC.getValue("#edtQFee_Head_Cd");
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.getValue("#edtQBu_Cd"),
        P_FEE_HEAD_CD: FEE_HEAD_CD,
        P_FEE_BASE_CD: val 
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

  onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {


  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var ADJUST_MONTH = $NC.getValue("#dtpQAdjust_Month");
  if ($NC.isNull(ADJUST_MONTH)) {
    alert("정산월을 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Month");
    return;
  };
  var ADJUST_MONTH1 = ADJUST_MONTH.replace(/\-/g, '');
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }  

  var BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd",true);
  //var FEE_HEAD_NM = $NC.getValue("#cboQFee_Head_Nm");
  var FEE_HEAD_CD = $NC.getValue("#edtQFee_Head_Cd",true);
  //var FEE_BASE_NM = $NC.getValue("#cboQFee_Base_Nm");
  var FEE_BASE_CD = $NC.getValue("#edtQFee_Base_Cd",true);
  
    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDMASTER);


    G_GRDMASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_ADJUST_MONTH: ADJUST_MONTH1,
      P_OWN_BRAND_CD: BRAND_CD,
      P_FEE_HEAD_CD: FEE_HEAD_CD,
      P_FEE_BASE_CD: FEE_BASE_CD
    });
    // 데이터 조회
    $NC.serviceCall("/LF06090Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

    /*
    // 파라메터 세팅
    G_GRDMASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      //P_FEE_HEAD_NM: FEE_HEAD_NM,
      P_FEE_HEAD_CD: FEE_HEAD_CD,
      //P_FEE_BASE_CD: FEE_BASE_NM,
      P_FEE_BASE_CD: FEE_BASE_CD,
      P_ADJUST_MONTH: ADJUST_MONTH
    });
    
    // 데이터 조회
    $NC.serviceCall("/LF06090Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
   */
 
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

}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {
  var ADJUST_MONTH = $NC.getValue("#dtpQAdjust_Month");
  if ($NC.isNull(ADJUST_MONTH)) {
    alert("정산월을 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Month");
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
  
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  

  var INOUT_DATE1 = $NC.getValue("#dtpQInout_Date1");
  if ($NC.isNull(INOUT_DATE1)) {
    alert("시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQInout_Date1");
    return;
  }
  var INOUT_DATE2 = $NC.getValue("#dtpQInout_Date2");
  if ($NC.isNull(INOUT_DATE2)) {
    alert("종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQInout_Date2");
    return;
  }
  
  var printOptions = {};
  if (printIndex == 0) {
    printOptions = {
      reportDoc: "lf/RECEIPT_LF05",
      queryId: "WR.RS_RECEIPT_LF05",
      queryParams: {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_ADJUST_MONTH1: INOUT_DATE1,
        P_ADJUST_MONTH2: INOUT_DATE2
      }
    };
    
    $NC.G_MAIN.showPrintPreview(printOptions);
  } 

}

function grdMasterOnGetColumns() {

  var columns = [ ];

  $NC.setGridColumn(columns, {
    id: "FEE_HEAD_CD",
    field: "FEE_HEAD_CD",
    name: "정산코드",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "FEE_HEAD_NM",
    field: "FEE_HEAD_NM",
    name: "정산항목명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "FEE_BASE_CD",
    field: "FEE_BASE_CD",
    name: "세부코드",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "FEE_BASE_NM",
    field: "FEE_BASE_NM",
    name: "세부항목명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "위탁사코드",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "위탁사명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "입출고구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 80
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
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "TOT_ENTRY_QTY",
    field: "TOT_ENTRY_QTY",
    name: "총수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "WB_NO",
    field: "WB_NO",
    name: "송장번호",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_KEY",
    field: "BU_KEY",
    name: "전표ID",
    minWidth: 90
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 상단그리드 초기화
 */
function grdMasterInitialize() {

  var options = {
    frozenColumn: 3,
    summaryRow: {
      visible: true
    }
  };


  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LF06090Q.RS_MASTER",
    sortCol: "FEE_HEAD_CD",
    gridOptions: options
  });

}


/**
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  // 입출고 수불내역
  $NC.clearGridData(G_GRDMASTER);


  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "1";


  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
}



/**
 * 검색조건의 사업부 검색 팝업 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BRAND_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQBu_Cd", true);
  });
}


/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");

  $NP.showBuBrandPopup({
    P_BU_CD: BU_CD,
    P_BRAND_CD: "%"
  }, onBuBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}


/**
 * 조회조건 - 정산세부 세팅
 */
function onGetFeeBaseCd() {

  $NC.setInitCombo("/LF04010Q/getDataSet.do", {
    P_QUERY_ID: "LF04010Q.RS_SUB2",
    P_QUERY_PARAMS: $NC.getParams({
      P_FEE_HEAD_CD: $NC.getValue("#cboQFee_Head_Cd")
    })
  }, {
    selector: "#cboQFee_Base_Cd",
    codeField: "FEE_BASE_CD",
    nameField: "FEE_BASE_NM",
    fullNameField: "FEE_BASE_CD_F",
    addAll: true
  });
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */

function showOwnBranPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NP.showOwnBranPopup({
    P_CUST_CD: CUST_CD,
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
  });
}

/**
 * 위탁사 검색 결과
 * 
 * @param seletedRowData
 */
function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {

    $NC.setValue("#edtQOwn_Brand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQOwn_Brand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQOwn_Brand_Cd");
    $NC.setValue("#edtQOwn_Brand_Nm");
    $NC.setFocus("#edtQOwn_Brand_Cd", true);
  }
  onChangingCondition();
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
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setFocus("#edtQBu_Cd", true);
  }

  // 브랜드 초기화
  $NC.setValue("#edtQOwn_Brand_Cd");
  $NC.setValue("#edtQOwn_Brand_Nm");  

  onChangingCondition();
}

/**
 * 상품별 반출내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
}

/**
 * 검색조건의 정산항목 검색 이미지 클릭
 */
function showFee_Head_CdPopup() {

  $NP.showFee_Head_CdPopup({
    P_BU_CD: $NC.getValue("#edtQBu_Cd"),
    P_CENTER_FUNC_DIV: '%',
    P_FEE_HEAD_CD: '%'
  }, onHeadPopup, function() {
    $NC.setFocus("#edtQFee_Head_Cd", true);
  });
}

/**
 * 검색조건의 세부코드 검색 이미지 클릭
 */
function showFee_Base_CdPopup() {

  var FEE_HEAD_CD = $NC.getValue("#edtQFee_Head_Cd");

  $NP.showFee_Base_CdPopup({
    P_BU_CD: $NC.getValue("#edtQBu_Cd"),
    P_FEE_HEAD_CD: FEE_HEAD_CD,
    P_FEE_BASE_CD: "%"
  }, onBasePopup, function() {
    $NC.setFocus("#edtQFee_Base_Cd", true);
  });
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

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQFee_Base_Cd", resultInfo.FEE_BASE_CD);
    $NC.setValue("#edtQFee_Base_Nm", resultInfo.FEE_BASE_NM);
  } else {
    $NC.setValue("#edtQFee_Base_Cd");
    $NC.setValue("#edtQFee_Base_Nm");
    $NC.setFocus("#edtQFee_Base_Cd", true);
  }
  //onChangingCondition();
}