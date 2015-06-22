/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 라인차트 초기화
  lineChartInitialize("chtMaster01");
  lineChartInitialize("chtMaster02");
  lineChartInitialize("chtMaster03");
  lineChartInitialize("chtMaster04");

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
    addAll: true,
    onComplete: function() {
      //$NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
    }
  });
  
  /*
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
  $NC.setValue("#edtQCust_Nm", $NC.G_USERINFO.CUST_NM);
  */
  
  $("#btnQCust_Cd").click(showCustPopup);
  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showBuBrandPopup);

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.leftPer = 0.35;
  $NC.G_OFFSET.topPer = 0.5;
  $NC.G_OFFSET.gboxHeight = $("#divMasterView .ui-gbox-title:first").outerHeight();
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  var leftWidth = $NC.getTruncVal(clientWidth * $NC.G_OFFSET.leftPer);
  var rightWidth = clientWidth - leftWidth - $NC.G_LAYOUT.margin1;
  var topHeight = $NC.getTruncVal(clientHeight * $NC.G_OFFSET.topPer);
  var bottomHeight = clientHeight - topHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);
  $NC.resizeContainer("#divLeftView", leftWidth, clientHeight);
  $NC.resizeContainer("#divRightView", rightWidth, clientHeight);
  
  var leftChartWidth = leftWidth - $NC.G_LAYOUT.margin2  - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1;
  var rightChartWidth = rightWidth - $NC.G_LAYOUT.margin2  - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1;
  var topChartHeight = topHeight - $NC.G_OFFSET.gboxHeight - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1; 
  var bottomChartHeight = bottomHeight - $NC.G_OFFSET.gboxHeight - $NC.G_LAYOUT.margin2 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1;
  
  //chtPointLabelHideZeros(false); // 포인트 라벨 HideZeros 옵션 false(관련버그있음)
  resizeChartContainer("#chtMaster01", leftChartWidth, topChartHeight);
  resizeChartContainer("#chtMaster03", leftChartWidth, bottomChartHeight);
  resizeChartContainer("#chtMaster02", rightChartWidth, topChartHeight);
  resizeChartContainer("#chtMaster04", rightChartWidth, bottomChartHeight);
}

function resizeChartContainer(selector, width, height) {
  var view = $NC.getView(selector);
  if (view.length === 0) {
    return;
  }
  view.css({
    "width": width,
    "height": height
  });

  window["G_" + view.prop("id").toUpperCase()].replot({
    resetAxes: true
  });
}

function _OnLoaded() {

  // 로드시 화면 초기화 처리
  onChangingCondition();
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  // 브랜드 Key 입력
  switch (id) {
  case "CENTER_CD":
    // 위탁사, 사업부, 브랜드 조회조건 초기화
    $NC.setValue("#edtQCust_Cd");
    $NC.setValue("#edtQCust_Nm");
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    break;
  case "CUST_CD":
    // 사업부, 브랜드 조회조건 초기화
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
      if (CENTER_CD == "%") {
        alert("물류센터를 먼저 선택해 주세요.");
        $NC.setValue("#edtQCust_Cd");
        $NC.setFocus("#cboQCenter_Cd");
        return;
      }
      P_QUERY_PARAMS = {
        P_CUST_CD: val
      };
      O_RESULT_DATA = $NP.getCustInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onCustPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showCustPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onCustPopup, onCustPopup);
    }
    return;
  case "BU_CD":
    // 브랜드 조회조건 초기화
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      if ($NC.isNull(CUST_CD)) {
        alert("위탁사를 먼저 선택해 주세요.");
        $NC.setValue("#edtQBu_Cd");
        $NC.setFocus("#edtQCust_Cd");
        return;
      }
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
      if ($NC.isNull(BU_CD)) {
        alert("사업부를 먼저 선택해 주세요.");
        $NC.setValue("#edtQBrand_Cd");
        $NC.setFocus("#edtQBu_Cd");
        return;
      }
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
  }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var CUST_CD = $NC.getValue("#edtQCust_Cd", true);
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  var P_QUERY_PARAMS = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_CUST_CD: CUST_CD,
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });

  $NC.serviceCall("/LV04010Q/getDataSet.do", {
    P_QUERY_ID: "LV04010Q.RS_MASTER01",
    P_QUERY_PARAMS: P_QUERY_PARAMS
  }, onGetMaster01);

  $NC.serviceCall("/LV04010Q/getDataSet.do", {
    P_QUERY_ID: "LV04010Q.RS_MASTER02",
    P_QUERY_PARAMS: P_QUERY_PARAMS
  }, onGetMaster02);

  $NC.serviceCall("/LV04010Q/getDataSet.do", {
    P_QUERY_ID: "LV04010Q.RS_MASTER03",
    P_QUERY_PARAMS: P_QUERY_PARAMS
  }, onGetMaster03);

  $NC.serviceCall("/LV04010Q/getDataSet.do", {
    P_QUERY_ID: "LV04010Q.RS_MASTER04",
    P_QUERY_PARAMS: P_QUERY_PARAMS
  }, onGetMaster04);

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
}

function lineChartInitialize(chartId) {

  var chtObject = $.jqplot(chartId, [[[null]], [[null]]], {
    seriesDefaults: {
      lineWidth: 1.5,
      markerOptions: {
        size: 7.0
      }
    },
    axesDefaults: {
      rendererOptions: {
        drawBaseline: false
      },
      tickOptions: {
        fontSize: "11px",
        fontFamily: "'NanumGothic', 'Malgun Gothic', GulimChe, 'Lucida Grande', 'Lucida Sans', Arial, sans-serif"
      }
    },
    axes: {
      xaxis: {
        autoscale: true,
        renderer: $.jqplot.CategoryAxisRenderer,
        tickRenderer: $.jqplot.CanvasAxisTickRenderer
      },
      yaxis: {
        min: 0,
        autoscale: true,
        tickOptions: {
          formatString: "%'d"
        }
      }
    },
    highlighter: {
      show: true,
      tooltipAxes: "y",
      tooltipLocation: "ne",
    },
    grid: {
      gridLineColor: "#e2e2e2",
      background: "#fff",
      borderColor: "#dbdbdb",
      gridLineWidth: 1.0,
      borderWidth: 1,
      shadow: false
    },
    gridPadding: {
      top: 5,
      bottom: 35,
      left: 65,
      right: 0
    },
    legend: {
      show: true,
      placement: "inside"
    }
  });

  window["G_" + chartId.toUpperCase()] = chtObject;
}

function clearBarChart() {

  window["G_CHTMASTER01"].replot({
    series: [[[null]], [[null]]],
    data: [[[null]], [[null]]]
  });
  window["G_CHTMASTER02"].replot({
    series: [[[null]], [[null]]],
    data: [[[null]], [[null]]]
  });

  window["G_CHTMASTER03"].replot({
    series: [[[null]], [[null]]],
    data: [[[null]], [[null]]]
  });
  window["G_CHTMASTER04"].replot({
    series: [[[null]], [[null]]],
    data: [[[null]], [[null]]]
  });
}

/**
 * 주간 일자별 출고량 검색 결과
 * 
 * @param seletedRowData
 */
function onGetMaster01(ajaxData) {

  var rowDatas = $NC.toArray(ajaxData);
  var rowCount = rowDatas.length;
  var seriesDS = [ ];
  var seriesDate = [ ];
  var series = [ ];
  if (rowCount === 0) {
    //seriesDS[0].push([null]);
    //seriesDS[1].push([null]);
  } else {
    var rowData;
    for (var row = 0; row < rowCount; row++) {
      rowData = rowDatas[row];
      series.push({
        SHOW: true,
        label: rowData.COL_NM
      });
      seriesDate = new Array();
      seriesDate.push([rowData.DAY_DISP1, rowData.OUT_QTY1]);
      seriesDate.push([rowData.DAY_DISP2, rowData.OUT_QTY2]);
      seriesDate.push([rowData.DAY_DISP3, rowData.OUT_QTY3]);
      seriesDate.push([rowData.DAY_DISP4, rowData.OUT_QTY4]);
      seriesDate.push([rowData.DAY_DISP5, rowData.OUT_QTY5]);
      seriesDate.push([rowData.DAY_DISP6, rowData.OUT_QTY6]);
      seriesDate.push([rowData.DAY_DISP7, rowData.OUT_QTY7]);
      seriesDS.push(seriesDate);
    }
  }
  window["G_CHTMASTER01"].replot({
    series: series,
    data: seriesDS
  });
}

/**
 * 월간 일자별 출고량 검색 결과
 * 
 * @param seletedRowData
 */
function onGetMaster02(ajaxData) {

  var rowDatas = $NC.toArray(ajaxData);
  var rowCount = rowDatas.length;
  var seriesDS = [ ];
  var seriesDate = [ ];
  var series = [ ];
  if (rowCount === 0) {
    //seriesDS[0].push([null]);
    //seriesDS[1].push([null]);
    var rowData;
    for (var row = 0; row < rowCount; row++) {
      rowData = rowDatas[row];
      series.push({
        label: rowData.COL_NM
      });
      seriesDate = new Array();
      seriesDate.push([1, rowData.OUT_QTY1]);
      seriesDate.push([2, rowData.OUT_QTY2]);
      seriesDate.push([3, rowData.OUT_QTY3]);
      seriesDate.push([4, rowData.OUT_QTY4]);
      seriesDate.push([5, rowData.OUT_QTY5]);
      seriesDate.push([6, rowData.OUT_QTY6]);
      seriesDate.push([7, rowData.OUT_QTY7]);
      seriesDate.push([8, rowData.OUT_QTY8]);
      seriesDate.push([9, rowData.OUT_QTY9]);
      seriesDate.push([10, rowData.OUT_QTY10]);
      seriesDate.push([11, rowData.OUT_QTY11]);
      seriesDate.push([12, rowData.OUT_QTY12]);
      seriesDate.push([13, rowData.OUT_QTY13]);
      seriesDate.push([14, rowData.OUT_QTY14]);
      seriesDate.push([15, rowData.OUT_QTY15]);
      seriesDate.push([16, rowData.OUT_QTY16]);
      seriesDate.push([17, rowData.OUT_QTY17]);
      seriesDate.push([18, rowData.OUT_QTY18]);
      seriesDate.push([19, rowData.OUT_QTY19]);
      seriesDate.push([20, rowData.OUT_QTY20]);
      seriesDate.push([21, rowData.OUT_QTY21]);
      seriesDate.push([22, rowData.OUT_QTY22]);
      seriesDate.push([23, rowData.OUT_QTY23]);
      seriesDate.push([24, rowData.OUT_QTY24]);
      seriesDate.push([25, rowData.OUT_QTY25]);
      seriesDate.push([26, rowData.OUT_QTY26]);
      seriesDate.push([27, rowData.OUT_QTY27]);
      seriesDate.push([28, rowData.OUT_QTY28]);
      if (rowData.DAY_CNT >= 29) {
        seriesDate.push([29, rowData.OUT_QTY29]);
      }
      if (rowData.DAY_CNT >= 30) {
        seriesDate.push([30, rowData.OUT_QTY30]);
      }
      if (rowData.DAY_CNT == 31) {
        seriesDate.push([31, rowData.OUT_QTY31]);
      }
      seriesDS.push(seriesDate);
    }
  }
  window["G_CHTMASTER02"].replot({
    series: series,
    data: seriesDS
  });
}

/**
 * 년간 분기별 출고량 검색 결과
 * 
 * @param seletedRowData
 */
function onGetMaster03(ajaxData) {

  var rowDatas = $NC.toArray(ajaxData);
  var rowCount = rowDatas.length;
  var seriesDS = [ ];
  var seriesDate = [ ];
  var series = [ ];
  if (rowCount === 0) {
    //seriesDS[0].push([null]);
    //seriesDS[1].push([null]);
  } else {
    var rowData;
    for (var row = 0; row < rowCount; row++) {
      rowData = rowDatas[row];
      series.push({
        label: rowData.COL_NM
      });
      seriesDate = new Array();
      seriesDate.push([rowData.QUARTER_DISP1, rowData.OUT_QTY1]);
      seriesDate.push([rowData.QUARTER_DISP2, rowData.OUT_QTY2]);
      seriesDate.push([rowData.QUARTER_DISP3, rowData.OUT_QTY3]);
      seriesDate.push([rowData.QUARTER_DISP4, rowData.OUT_QTY4]);
      seriesDS.push(seriesDate);
    }
  }
  window["G_CHTMASTER03"].replot({
    series: series,
    data: seriesDS
  });
}

/**
 * 년간 월별 출고량 검색 결과
 * 
 * @param seletedRowData
 */
function onGetMaster04(ajaxData) {

  var rowDatas = $NC.toArray(ajaxData);
  var rowCount = rowDatas.length;
  var seriesDS = [ ];
  var seriesDate = [ ];
  var series = [ ];
  if (rowCount === 0) {
    //seriesDS[0].push([null]);
    //seriesDS[1].push([null]);
  } else {
    var rowData;
    for (var row = 0; row < rowCount; row++) {
      rowData = rowDatas[row];
      series.push({
        label: rowData.COL_NM
      });
      seriesDate = new Array();
      seriesDate.push([rowData.MONTH_DISP1, rowData.OUT_QTY1]);
      seriesDate.push([rowData.MONTH_DISP2, rowData.OUT_QTY2]);
      seriesDate.push([rowData.MONTH_DISP3, rowData.OUT_QTY3]);
      seriesDate.push([rowData.MONTH_DISP4, rowData.OUT_QTY4]);
      seriesDate.push([rowData.MONTH_DISP5, rowData.OUT_QTY5]);
      seriesDate.push([rowData.MONTH_DISP6, rowData.OUT_QTY6]);
      seriesDate.push([rowData.MONTH_DISP7, rowData.OUT_QTY7]);
      seriesDate.push([rowData.MONTH_DISP8, rowData.OUT_QTY8]);
      seriesDate.push([rowData.MONTH_DISP9, rowData.OUT_QTY9]);
      seriesDate.push([rowData.MONTH_DISP10, rowData.OUT_QTY10]);
      seriesDate.push([rowData.MONTH_DISP11, rowData.OUT_QTY11]);
      seriesDate.push([rowData.MONTH_DISP12, rowData.OUT_QTY12]);
      seriesDS.push(seriesDate);
    }
  }
  window["G_CHTMASTER04"].replot({
    series: series,
    data: seriesDS
  });
}

function onChangingCondition() {

  clearBarChart();

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
 * 검색조건의 위탁사 검색 이미지 클릭
 */
function showCustPopup() {
  
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if (CENTER_CD == "%") {
    alert("물류센터를 먼저 선택해 주세요.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  
  $NP.showCustPopup({
    P_CUST_CD: "%"
  }, onCustPopup, function() {
    $NC.setFocus("#edtQCust_Cd", true);
  });
}

/**
 * 위탁사 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onCustPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
    $NC.setValue("#edtQCust_Nm", resultInfo.CUST_NM);
  } else {
    $NC.setValue("#edtQCust_Cd");
    $NC.setValue("#edtQCust_Nm");
    $NC.setFocus("#edtQCust_Cd", true);
  }
  //사업부, 브랜드 조회조건 초기화
  $NC.setValue("#edtQBu_Cd");
  $NC.setValue("#edtQBu_Nm");
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");
  
  onChangingCondition();
}

/**
 * 검색조건의 사업부 검색 팝업 클릭
 */
function showUserBuPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd");
  if ($NC.isNull(CUST_CD)) {
    alert("위탁사를 먼저 선택해 주세요.");
    $NC.setFocus("#edtQCust_Cd");
    return;
  }

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%",
    P_CUST_CD: CUST_CD
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
  //브랜드 조회조건 초기화
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");
  
  onChangingCondition();
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 먼저 선택해 주세요.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

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
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  onChangingCondition();
}