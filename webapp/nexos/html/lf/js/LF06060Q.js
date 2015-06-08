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



  // 그리드 초기화
  grdT1MasterInitialize();
  grdT2MasterInitialize();

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  // 정산일자에 달력이미지 설정
  $NC.setInitDatePicker("#dtpQAdjust_Date1", $NC.G_USERINFO.LOGIN_DATE, "F");
  $NC.setInitDatePicker("#dtpQAdjust_Date2");

  $("#btnQBu_Cd").click(showUserBuPopup);
  //$("#btnQBrand_Cd").click(showUserBrandPopup);

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
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */

function _OnLoaded() {
  // 화면에 splitter 설정
  $NC.setInitSplitter("#divMasterView", "h", 300);
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

  // Splitter 컨테이너 크기 조정
  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  // Master Grid 사이즈 조정
  $NC.resizeGrid("#grdT1Master", clientWidth, $("#grdT1Master").parent().height() - $NC.G_LAYOUT.header);

  // Detail Grid 사이즈 조정
  $NC.resizeGrid("#grdT2Master", clientWidth, $("#grdT2Master").parent().height() - $NC.G_LAYOUT.header);
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

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
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BU_CD = $NC.getValue("#edtQBu_Cd");
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
  case "ADJUST_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "ADJUST_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
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
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var ADJUST_DATE1 = $NC.getValue("#dtpQAdjust_Date1");
  if ($NC.isNull(ADJUST_DATE1)) {
    alert("정산 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Date1");
    return;
  }
  var ADJUST_DATE2 = $NC.getValue("#dtpQAdjust_Date2");
  if ($NC.isNull(ADJUST_DATE2)) {
    alert("정산 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Date2");
    return;
  }
 

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT1MASTER);

    // 파라메터 세팅
    G_GRDT1MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_ADJUST_START_DATE :ADJUST_DATE1,
      P_ADJUST_END_DATE :ADJUST_DATE2
    });

    // 데이터 조회
    $NC.serviceCall("/LF06060Q/getDataSet.do", $NC.getGridParams(G_GRDT1MASTER), onGetMasterT1);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDT2MASTER);

    // 파라메터 세팅
    G_GRDT2MASTER.queryParams = $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_ADJUST_START_DATE :ADJUST_DATE1,
      P_ADJUST_END_DATE :ADJUST_DATE2
    });

    // 데이터 조회
    $NC.serviceCall("/LF06060Q/getDataSet.do", $NC.getGridParams(G_GRDT2MASTER), onGetMasterT2);


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
  
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
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

function grdT1MasterOnGetColumns() {

  var columns = [ ];

  $NC.setGridColumn(columns, {
    id: "ADJUST_NM",
    field: "ADJUST_NM",
    name: "출고구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_QTY",
    field: "ADJUST_QTY",
    name: "수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ADJUST_PRICE",
    field: "ADJUST_PRICE",
    name: "단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  
  $NC.setGridColumn(columns, {
    id: "ADJUST_AMT",
    field: "ADJUST_AMT",
    name: "금액",
    minWidth: 80,
    cssClass: "align-right"
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdT1MasterInitialize() {

  var options = {
    frozenColumn: 1,
    summaryRow: {
      visible: true
    }
  };


  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT1Master", {
    columns: grdT1MasterOnGetColumns(),
    queryId: "LF06060Q.RS_MASTER1",
    sortCol: "FEE_HEAD_CD",
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
  $NC.setGridDisplayRows("#grdT1Master", row + 1);
}




function grdT2MasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ADJUST_DATE",
    field: "ADJUST_DATE",
    name: "일자",
    minWidth: 90,
    cssClass: "align-center",
    groupToggler: true,
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "위탁사",
    minWidth: 100,
    groupDisplay: true,
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "MALL_NM",
    field: "MALL_NM",
    name: "몰",
    minWidth: 100,
    summaryTitle: "[합계]",
    band: 0
  });
  $NC.setGridColumn(columns, {
    id: "QTY1",
    field: "QTY1",
    name: "판매출고",
    minWidth: 90,
    cssClass: "align-right",
    aggregator: "SUM",
    band: 1
  });
  $NC.setGridColumn(columns, {
    id: "QTY2",
    field: "QTY2",
    name: "추가송장",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM",
    band: 1
  });
  $NC.setGridColumn(columns, {
    id: "QTY3",
    field: "QTY3",
    name: "CS출고",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM",
    band: 1
  });
  $NC.setGridColumn(columns, {
    id: "QTY4",
    field: "QTY4",
    name: "반품입고",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM",
    band: 1
  });
  $NC.setGridColumn(columns, {
    id: "QTY_TOTAL",
    field: "QTY_TOTAL",
    name: "합계",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM",
    band: 1
  });
  $NC.setGridColumn(columns, {
    id: "SUM_TOTAL",
    field: "SUM_TOTAL",
    name: "금액",
    minWidth: 80,
    cssClass: "align-right specialcol5",
    aggregator: "SUM",
    band: 2
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 일자별 수불내역탭의 그리드 초기값 설정
 */
function grdT2MasterInitialize() {

  var options = {
    frozenColumn: 2,
    summaryRow: {
      visible: true
    },

    showBandRow: true,
    bands: ["기본정보", "출고건수", "VAT포함"],
  };

  
  
  
  // Data Grouping
  var dataGroupOptions = {
    getter: function(rowData) {
      return $NC.lPad(rowData.ADJUST_DATE, 10) ;
    },
    resultFn: function(field, summary) {
      if (field == "ADJUST_DATE") {
        return "[합계]";

      } else {
      }

      return summary[field];
    }
  };

 

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdT2Master", {
    columns: grdT2MasterOnGetColumns(),
    queryId: "LF06060Q.RS_MASTER2",
    sortCol: "ADJUST_DATE",
    gridOptions: options,
    dataGroupOptions: dataGroupOptions
  });

  G_GRDT2MASTER.view.onSelectedRowsChanged.subscribe(grdT2MasterOnAfterScroll);
}

function grdT2MasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDT2MASTER.lastRow != null) {
    if (row == G_GRDT2MASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdT2Master", row + 1);
}

/*

function onGridMasterDblClick(e, args) {

  var row = args.row;
  var rowData;

  // 입출고 수불내역 조회
  if ($("#divMasterView").tabs("option", "active") === 0) {

    rowData = G_GRDT1MASTER.data.getItem(row);
    // 일자별 수불내역 조회
  } else if ($("#divMasterView").tabs("option", "active") === 1) {

    rowData = G_GRDT2MASTER.data.getItem(row);
    // 기간별 수불내역 조회
  } else {

    rowData = G_GRDT3MASTER.data.getItem(row);
  }

  var isGroup = false;
  if (rowData.__group) {
    rowData = rowData.rows[0];
    isGroup = true;
  }

  var ITEM_CD = rowData.ITEM_CD;
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  var INOUT_DATE = "";
  if (!isGroup) {
    INOUT_DATE = $NC.nullToDefault(rowData.INOUT_DATE, "");
  }

  var INOUT_DATE1 = rowData.INOUT_DATE1;
  var INOUT_DATE2 = rowData.INOUT_DATE2;

  var BRAND_CD = rowData.BRAND_CD;




  var INOUT_CD = rowData.INOUT_CD;
  if ($NC.isNull(INOUT_CD) || isGroup) {
    INOUT_CD = "%";
  }

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "LS02011P",
    PROGRAM_NM: "입출고상세내역",
    url: "ls/LS02011P.html",
    width: 900,
    height: 500,
    userData: {
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE: INOUT_DATE,
      P_INOUT_DATE1: INOUT_DATE1,
      P_INOUT_DATE2: INOUT_DATE2,
      P_BRAND_CD: BRAND_CD,
      P_ITEM_CD: ITEM_CD,
      P_ITEM_STATE: ITEM_STATE,
      P_ITEM_LOT: ITEM_LOT,
      P_INOUT_CD: INOUT_CD
    }
  });
}
*/

/**
 * 입출고 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT1(ajaxData) {

  $NC.setInitGridData(G_GRDT1MASTER, ajaxData);

  if (G_GRDT1MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT1MASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdT1Master", 0, 0);
  }
}


/**
 * 일자별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMasterT2(ajaxData) {

  $NC.setInitGridData(G_GRDT2MASTER, ajaxData);

  if (G_GRDT2MASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDT2MASTER, 0);
  } else {
    $NC.setGridDisplayRows("grdT2Master", 0, 0);
  }
  

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
 * 검색조건 값 변경 되었을 경우의 처리
 */
function onChangingCondition() {

  // 입출고 수불내역
  $NC.clearGridData(G_GRDT1MASTER);
  $NC.clearGridData(G_GRDT2MASTER);


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
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");

  onChangingCondition();
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