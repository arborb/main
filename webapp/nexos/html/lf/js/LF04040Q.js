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
  grdMasterInitialize();

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
  
  setMallCodeCombo($NC.G_USERINFO.BU_CD);
  
  // 정산월에 달력이미지 설정
  $NC.setInitMonthPicker("#dtpQAdjust_Month", $NC.G_USERINFO.LOGIN_DATE);


  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQOwn_Brand_Cd").click(showOwnBranPopup);


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
//  $NC.setInitSplitter("#divMasterView", "h", 300);
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

  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
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
  case "ADJUST_MONTH":
    $NC.setValueMonthPicker(view, val, "정산월을 정확히 입력하십시오.");
    break;
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
  var MALL_CD = $NC.getValue("#cboQMall_Cd");
  var OWN_BRAND_CD = $NC.getValue("#edtQOwn_Brand_Cd", true);
  var ADJUST_MONTH = $NC.getValue("#dtpQAdjust_Month");
  if ($NC.isNull(ADJUST_MONTH)) {
    alert("정산월을 입력하십시오.");
    $NC.setFocus("#dtpQAdjust_Month");
    return;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: OWN_BRAND_CD,
    P_ADJUST_MONTH: ADJUST_MONTH,
    P_MALL_CD: MALL_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LF04040Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

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



function grdMasterOnGetColumns() {

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
    id: "OWN_BRAND_NM",
    field: "OWN_BRAND_NM",
    name: "위탁사",
    minWidth: 100,
//    groupDisplay: true,
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
    id: "QTY5",
    field: "QTY5",
    name: "반품출고",
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
function grdMasterInitialize() {

  var options = {
    frozenColumn: 2,
    summaryRow: {
      visible: true
    },

    showBandRow: true,
    bands: ["기본정보", "출고건수"],
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
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LF04040Q.RS_MASTER",
    sortCol: "ADJUST_DATE",
    gridOptions: options,
    dataGroupOptions: dataGroupOptions
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onDblClick.subscribe(grdMasterOnDblClick);
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

/**
 * 상단그리드 더블 클릭
 */
function grdMasterOnDblClick(e, args) {

  if (G_GRDMASTER.data.getLength() == 0) {
    return;
  }

  var masterRowData = G_GRDMASTER.data.getItem(args.row);
  if (masterRowData) {
    if(args.cell === 3){
      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LF04041P",
        PROGRAM_NM: "판매출고상세내역",
        url: "lf/LF04041P.html",
        width: 1024,
        height: 600,
        userData: {
          P_PROCESS_CD: "U",
          P_BU_CD: masterRowData.BU_CD,
          P_ADJUST_DATE: masterRowData.ADJUST_DATE,
          P_ADJUST_DATE1: masterRowData.ADJUST_DATE1,
          
          P_ADJUST_MONTH: masterRowData.ADJUST_MONTH,
          P_BRAND_CD: masterRowData.BRAND_CD,
          P_OWN_BRAND_NM: masterRowData.OWN_BRAND_NM,
          P_MALL_CD: masterRowData.MALL_CD,
          P_MALL_NM: masterRowData.MALL_NM,
          P_MASTER_DS: masterRowData,
        },
        onOk: function() {
          var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
          G_GRDMASTER.lastKeyVal = new Array(lastRowData.BU_CD, lastRowData.BRAND_CD, lastRowData.MALL_CD);
        }
      });      
    } else if(args.cell === 4){
      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LF04042P",
        PROGRAM_NM: "추가송장상세내역",
        url: "lf/LF04042P.html",
        width: 1024,
        height: 600,
        userData: {
          P_PROCESS_CD: "U",
          P_BU_CD: masterRowData.BU_CD,
          P_ADJUST_DATE: masterRowData.ADJUST_DATE,
          P_ADJUST_MONTH: masterRowData.ADJUST_MONTH,
          P_BRAND_CD: masterRowData.BRAND_CD,
          P_OWN_BRAND_NM: masterRowData.OWN_BRAND_NM,
          P_MALL_CD: masterRowData.MALL_CD,
          P_MALL_NM: masterRowData.MALL_NM,
          P_MASTER_DS: masterRowData,
        },
        onOk: function() {
          var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
          G_GRDMASTER.lastKeyVal = new Array(lastRowData.BU_CD, lastRowData.BRAND_CD, lastRowData.MALL_CD);
        }
      });
    } else if(args.cell === 5){
      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LF04043P",
        PROGRAM_NM: "CS출고상세내역",
        url: "lf/LF04043P.html",
        width: 1024,
        height: 600,
        userData: {
          P_PROCESS_CD: "U",
          P_BU_CD: masterRowData.BU_CD,
          P_ADJUST_DATE: masterRowData.ADJUST_DATE,
          P_ADJUST_MONTH: masterRowData.ADJUST_MONTH,
          P_BRAND_CD: masterRowData.BRAND_CD,
          P_OWN_BRAND_NM: masterRowData.OWN_BRAND_NM,
          P_MALL_CD: masterRowData.MALL_CD,
          P_MALL_NM: masterRowData.MALL_NM,
          P_MASTER_DS: masterRowData,
        },
        onOk: function() {
          var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
          G_GRDMASTER.lastKeyVal = new Array(lastRowData.BU_CD, lastRowData.BRAND_CD, lastRowData.MALL_CD);
        }
      });
    } else if(args.cell === 6){
      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LF04044P",
        PROGRAM_NM: "반품입고상세내역",
        url: "lf/LF04044P.html",
        width: 1024,
        height: 600,
        userData: {
          P_PROCESS_CD: "U",
          P_BU_CD: masterRowData.BU_CD,
          P_ADJUST_DATE: masterRowData.ADJUST_DATE,
          P_ADJUST_MONTH: masterRowData.ADJUST_MONTH,
          P_BRAND_CD: masterRowData.BRAND_CD,
          P_OWN_BRAND_NM: masterRowData.OWN_BRAND_NM,
          P_MALL_CD: masterRowData.MALL_CD,
          P_MALL_NM: masterRowData.MALL_NM,
          P_MASTER_DS: masterRowData,
        },
        onOk: function() {
          var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
          G_GRDMASTER.lastKeyVal = new Array(lastRowData.BU_CD, lastRowData.BRAND_CD, lastRowData.MALL_CD);
        }
      });
    } else if(args.cell === 7){
      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LF04045P",
        PROGRAM_NM: "반품출고상세내역",
        url: "lf/LF04045P.html",
        width: 1024,
        height: 600,
        userData: {
          P_PROCESS_CD: "U",
          P_BU_CD: masterRowData.BU_CD,
          P_ADJUST_DATE: masterRowData.ADJUST_DATE,
          P_ADJUST_MONTH: masterRowData.ADJUST_MONTH,
          P_BRAND_CD: masterRowData.BRAND_CD,
          P_OWN_BRAND_NM: masterRowData.OWN_BRAND_NM,
          P_MALL_CD: masterRowData.MALL_CD,
          P_MALL_NM: masterRowData.MALL_NM,
          P_MASTER_DS: masterRowData,
        },
        onOk: function() {
          var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
          G_GRDMASTER.lastKeyVal = new Array(lastRowData.BU_CD, lastRowData.BRAND_CD, lastRowData.MALL_CD);
        }
      });
    }
  }
}


/**
 * 일자별 수불내역 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("grdMaster", 0, 0);
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
 * 검색조건의 위탁사 검색 팝업 클릭
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
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  
  setMallCodeCombo($NC.getValue("#edtQBu_Cd"));

  // 브랜드 초기화
  $NC.setValue("#edtQOwn_Brand_Cd");
  $NC.setValue("#edtQOwn_Brand_Nm");

  onChangingCondition();
}
