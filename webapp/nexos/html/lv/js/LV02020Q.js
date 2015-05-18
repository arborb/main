/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    chtColors: ["#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#0099C6", "#3366CC", "#DC3912", "#FF9900",
        "#109618", "#990099", "#0099C6", "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099", "#0099C6", "#3366CC",
        "#DC3912", "#FF9900", "#109618", "#990099", "#0099C6"]
  });
  
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
  
  // 검색 이미지 클릭 이벤트
  $("#btnQCust").click(showCustPopup);
  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showBuBrandPopup);
  
  // 사업부 조회 조건 초기값 셋팅
  /*
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  */
  
  // 조회일자 셋팅
  $NC.setInitDatePicker("#dtpQAgg_Date1");
  $NC.setInitDatePicker("#dtpQAgg_Date2");
  $NC.setValue("#dtpQAgg_Date1", $NC.addDay($NC.getValue("#dtpQAgg_Date1"), -20));
  
  // 콤보 셋팅
  rotateDayCboSet();
  longTermCboSet();
  validCboSet();
  
  //차트 초기화
  barChartInitialize("chtBarPutawayReport");
  barChartInitialize("chtBarLongTermReport");
  barChartInitialize("chtBarRotateReport");
  barChartInitialize("chtBarValidReport");
  pieChartInitialize("chtPiePutawayReport");
  pieChartInitialize("chtPieLongTermReport");
  pieChartInitialize("chtPieRotateReport");
  pieChartInitialize("chtPieValidReport");
  
  // 콤보 체인지 이벤트
  $("#cboQHigh_Rotate_Day").on("change", function() {
    inquiryRotate(getConditionParam());
  });
  $("#cboQLong_Term_Month").on("change", function() {
    inquiryLongterm(getConditionParam());
  });
  $("#cboQImpend_Day").on("change", function() {
    inquiryValid(getConditionParam());
  });
  
  // legend 마우스 오버 이벤트
  $("div.legend").hover(
    function(){
      $(this).children("div.legendBox").css({
        "white-space": "pre-line",
        "position": "absolute",
        "z-index": "3",
        "min-width": $(this).children("div.legendBox").width()
      });
      $(this).children("div.legendBox").children("span").css({
        "display": "inline-block",
      });
    },
    function(){
      $(this).children("div.legendBox").css({
        "white-space": "",
        "position": "",
        "z-index": "",
        "min-width": "",
      });
      $(this).children("div.legendBox").children("span").css({
        "display": "inline",
      });
    }
  );
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.pieChtPer = 0.35;
  $NC.G_OFFSET.gboxHeight = $("#divMasterView .ui-gbox-title:first").outerHeight();
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  var leftWidth = $NC.getTruncVal(clientWidth / 2);
  var rightWidth = clientWidth - leftWidth - $NC.G_LAYOUT.margin1;
  var topHeight = $NC.getTruncVal(clientHeight / 2);
  var bottomHeight = clientHeight - topHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);
  $NC.resizeContainer("#divLeftView", leftWidth, clientHeight);
  $NC.resizeContainer("#divRightView", rightWidth, clientHeight);
  
  var leftChartWidth = leftWidth - $NC.G_LAYOUT.margin2  - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1;
  var leftChartWidth01 = $NC.getTruncVal(leftChartWidth*$NC.G_OFFSET.pieChtPer);
  var leftChartWidth02 = leftChartWidth - leftChartWidth01;
  var rightChartWidth = rightWidth - $NC.G_LAYOUT.margin2  - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1;
  var rightChartWidth01 = $NC.getTruncVal(rightChartWidth*$NC.G_OFFSET.pieChtPer);
  var rightChartWidth02 = rightChartWidth - rightChartWidth01;
  var topChartHeight = topHeight - $NC.G_OFFSET.gboxHeight - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1; 
  var bottomChartHeight = bottomHeight - $NC.G_OFFSET.gboxHeight - $NC.G_LAYOUT.margin2 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1;
  
  chtPointLabelHideZeros(false); // 포인트 라벨 HideZeros 옵션 false(관련버그있음)
  resizeChartContainer("#chtPiePutawayReport", leftChartWidth01, topChartHeight);
  resizeChartContainer("#chtBarPutawayReport", leftChartWidth02, topChartHeight);
  resizeChartContainer("#chtPieLongTermReport", leftChartWidth01, bottomChartHeight);
  resizeChartContainer("#chtBarLongTermReport", leftChartWidth02, bottomChartHeight);
  resizeChartContainer("#chtPieRotateReport", rightChartWidth01, topChartHeight);
  resizeChartContainer("#chtBarRotateReport", rightChartWidth02, topChartHeight);
  resizeChartContainer("#chtPieValidReport", rightChartWidth01, bottomChartHeight);
  resizeChartContainer("#chtBarValidReport", rightChartWidth02, bottomChartHeight);
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
    resetAxes: true,
    seriesDefaults: {
      pointLabels: {
        hideZeros: true
      }
    }
  });
}

function chtPointLabelHideZeros(hide) {
  window["G_CHTBARPUTAWAYREPORT"].options.seriesDefaults.pointLabels.hideZeros = hide;
  window["G_CHTBARLONGTERMREPORT"].options.seriesDefaults.pointLabels.hideZeros = hide;
  window["G_CHTBARROTATEREPORT"].options.seriesDefaults.pointLabels.hideZeros = hide;
  window["G_CHTBARROTATEREPORT"].options.seriesDefaults.pointLabels.hideZeros = hide;
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

  onChangingCondition();
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var param = getConditionParam();
  
  // 로케이션적재 현황
  $NC.serviceCall("/LV02020Q/getDataSet.do", {
    P_QUERY_ID: "LV02020Q.LOCATION_PUTAWAY_REPORT",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: param.CENTER_CD,
      P_CUST_CD: param.CUST_CD,  
      P_BU_CD: param.BU_CD,    
      P_BRAND_CD: param.BRAND_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onGetPutawayReport);
  
  // 회전일수 현황
  inquiryRotate(param);
  // 장기재고 현황
  inquiryLongterm(param);
  // 유통기한 도래 현황
  inquiryValid(param);
}

function getConditionParam() {
  
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return ;
  }
  
  var conditionParam = {
    "CENTER_CD": CENTER_CD,
    "CUST_CD": $NC.getValue("#edtQCust_Cd", true),
    "BU_CD": $NC.getValue("#edtQBu_Cd", true),
    "BRAND_CD": $NC.getValue("#edtQBrand_Cd", true)
  };
  
  return conditionParam;
}

function inquiryRotate(param) {
  
  $NC.serviceCall("/LV02020Q/getDataSet.do", {
    P_QUERY_ID: "LV02020Q.ROTATE_DAY_REPORT",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: param.CENTER_CD,
      P_CUST_CD: param.CUST_CD,  
      P_BU_CD: param.BU_CD,    
      P_BRAND_CD: param.BRAND_CD,
      P_HIGH_ROTATE_DAY: $NC.getValue("#cboQHigh_Rotate_Day"),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onGetRotateReport);
}

function inquiryLongterm(param) {
  
  $NC.serviceCall("/LV02020Q/getDataSet.do", {
    P_QUERY_ID: "LV02020Q.LONG_TERM_REPORT",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: param.CENTER_CD,
      P_CUST_CD: param.CUST_CD,  
      P_BU_CD: param.BU_CD,    
      P_BRAND_CD: param.BRAND_CD,
      P_LONG_TERM_MONTH: $NC.getValue("#cboQLong_Term_Month"),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onGetLongtermReport);
}

function inquiryValid(param) {
  $NC.serviceCall("/LV02020Q/getDataSet.do", {
    P_QUERY_ID: "LV02020Q.VALID_DATE_REPORT",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: param.CENTER_CD,
      P_CUST_CD: param.CUST_CD,  
      P_BU_CD: param.BU_CD,    
      P_BRAND_CD: param.BRAND_CD,
      P_IMPEND_DAY: $NC.getValue("#cboQImpend_Day"),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onGetValidReport);
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

/**
 * 파이차트 초기화
 */
function pieChartInitialize(chartId) {

  var chtObject = $.jqplot(chartId, [["", 0]], {
    title: {
      rendererOptions: {
        paddingLeft: 3,
        paddingBottom: 3,
        position: "bottom",
        textAlign: "left"
      }
    },
    seriesDefaults: {
      renderer: $.jqplot.PieRenderer,
      rendererOptions: {
        sliceMargin: 2,
        startAngle: 90,
        padding: 5,
        showDataLabels: true,
        shadowDepth: 1,
        dataLabels: "value"
      }
    },
    seriesColors: $NC.G_VAR.chtColors,
    grid: {
      background: "#fbfbfb",
      drawBorder: true,
      borderColor: "#fbfbfb",
      borderWidth: 3,
      shadow: false
    },
    gridPadding: {
      top: 2,
      bottom: 35,
      left: 2,
      right: 2
    }
  });

  window["G_" + chartId.toUpperCase()] = chtObject;
}

/**
 * 바차트 초기화
 */
function barChartInitialize(chartId) {
  
  var chtObject = $.jqplot(chartId, [[[0, ""]]], {
    stackSeries: true,
    seriesDefaults: {
      renderer: $.jqplot.BarRenderer,
      rendererOptions: {
        barWidth: 30,
        shadow: true,
        shadowColor: "#939393",
        shadowWidth: 1,
        shadowDepth: 1,
        shadowAlpha: 0.3,
        barDirection: 'horizontal'
      },
      pointLabels: {
        show: true,
        hideZeros: true
      }
    },
    seriesColors: $NC.G_VAR.chtColors,
    axesDefaults: {
      syncTicks : true,
      rendererOptions: {
        drawBaseline: false
      },
      tickOptions: {       
        fontFamily: "'NanumGothic', 'Malgun Gothic', GulimChe, 'Lucida Grande', 'Lucida Sans', Arial, sans-serif"
      }
    },
    legend: {
      show: false
    },
    axes: {
      xaxis: {
        autoscale: true,
        min: 0,
        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
        tickOptions: {
          fontSize: "11px",
          angle: -25,
          formatString: "%'d"
        }
      },
      yaxis: {
        autoscale: true,
        renderer: $.jqplot.CategoryAxisRenderer,
        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
        tickOptions: {
          fontSize: "11px",
          angle: -30
        }
      }
    },
    highlighter: {
      show: true,
      showTooltip: true,
      tooltipAxes: "x",
      sizeAdjust: 1,
      tooltipLocation: "nw"
    },
    grid: {
      gridLineColor: "#e2e2e2",
      background: "#fff",
      borderColor: "#dbdbdb",
      borderWidth: 1,
      shadow: false
    },
    gridPadding: {
      top: 5,
      bottom: 70,
      left: 75,
      right: 0
    }
  });

  window["G_" + chartId.toUpperCase()] = chtObject;
}

function onChangingCondition() {

  // 차트 초기화
  clearChart("putaway");
  clearChart("rotate");
  clearChart("longterm");
  clearChart("valid");

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
    P_CUST_CD: $NC.getValue("#edtQCust_Cd")
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

function onGetPutawayReport(ajaxData) {
  
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData) && resultData.length) {
    var seriesPieDS = [[ ]];
    var seriesBarDS = [];
    var ZONE_CD = [];
    var ZONE_NM = [];
    var ticksCD = [];
    var ticks = [];
    var label = [];
    var totalQty = 0;
    var rowData;
    for (var i = 0, resultCount = resultData.length; i < resultCount; i++) {
      rowData = resultData[i];
      if ($.inArray(rowData.ZONE_CD, ZONE_CD) < 0) {
        ZONE_CD.push(rowData.ZONE_CD);
        ZONE_NM.push(rowData.ZONE_NM);
        seriesBarDS.push([ ]);
      }
      if ($.inArray(rowData.COL_CD, ticksCD) < 0) {
        ticksCD.push(rowData.COL_CD);
        ticks.push(rowData.COL_NM);
        label.push('<div class="ui-lbl-pie">' + rowData.COL_NM + '(' + $NC.getDisplayNumber(rowData.TOTAL_STOCK_QTY) + ')</div>');
        seriesPieDS[0].push(rowData.TOTAL_STOCK_QTY);
        totalQty += rowData.TOTAL_STOCK_QTY;
      }
    }
    for (var i = 0, resultCount = resultData.length; i < resultCount; i++) {
      rowData = resultData[i];
      seriesBarDS[$.inArray(rowData.ZONE_CD, ZONE_CD)].push(rowData.STOCK_QTY);
    }
    
    // legend 생성
    setLegend("#putawayLegend > div.legendBox", ZONE_NM);
    
    // 보유재고
    $("#putawayTotalQty > span").html($NC.getDisplayNumber(totalQty));
    
    window["G_CHTPIEPUTAWAYREPORT"].replot({
      data: seriesPieDS,
      seriesDefaults: {
        rendererOptions: {
          dataLabels: label
        }
      }
    });
    window["G_CHTBARPUTAWAYREPORT"].replot({
      data: seriesBarDS,
      axes: {
        yaxis: {
            ticks: ticks
        }
      }
    });
  } else {
    clearChart("putaway");
  }
}

function onGetRotateReport(ajaxData) {
  
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData) && resultData.length) {
    var seriesPieDS = [[ ]];
    var seriesBarDS = [[ ], [ ], [ ], [ ]];
    var ticksCD = [];
    var ticks = [];
    var label = [];
    var totalQty = 0;
    var rowData;
    for (var i = 0, resultCount = resultData.length; i < resultCount; i++) {
      rowData = resultData[i];
      seriesBarDS[0].push(rowData.CNT_10_LESS);
      seriesBarDS[1].push(rowData.CNT_20_LESS);
      seriesBarDS[2].push(rowData.CNT_30_LESS);
      seriesBarDS[3].push(rowData.CNT_30_BETTER);
      if ($.inArray(rowData.COL_CD, ticksCD) < 0) {
        ticksCD.push(rowData.COL_CD);
        ticks.push(rowData.COL_NM);
        label.push('<div class="ui-lbl-pie">' + rowData.COL_NM + '(' + $NC.getDisplayNumber(rowData.CNT_HIGH) + ')</div>');
        seriesPieDS[0].push(rowData.CNT_HIGH);
        totalQty += rowData.CNT_HIGH;
      }
    }
    
    // legend 생성
    setLegend("#rotateLegend > div.legendBox", ["10일 이하", "20일 이하", "30일 이하", "30일 초과"]);
    
    // 고회전 상품수
    $("#rotateTotalQty > span").html($NC.getDisplayNumber(totalQty));
    
    window["G_CHTPIEROTATEREPORT"].replot({
      data: seriesPieDS,
      seriesDefaults: {
        rendererOptions: {
          dataLabels: label
        }
      }
    });
    window["G_CHTBARROTATEREPORT"].replot({
      data: seriesBarDS,
      axes: {
        yaxis: {
            ticks: ticks
        }
      }
    });
  } else {
    clearChart("rotate");
  }
}

function onGetLongtermReport(ajaxData) {
  
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData) && resultData.length) {
    var seriesPieDS = [[ ]];
    var seriesBarDS = [[ ], [ ], [ ]];
    var ticksCD = [];
    var ticks = [];
    var label = [];
    var totalQty = 0;
    var rowData;
    for (var i = 0, resultCount = resultData.length; i < resultCount; i++) {
      rowData = resultData[i];
      seriesBarDS[0].push(rowData.STOCK_QTY01);
      seriesBarDS[1].push(rowData.STOCK_QTY13);
      seriesBarDS[2].push(rowData.STOCK_QTY03);
      if ($.inArray(rowData.COL_CD, ticksCD) < 0) {
        ticksCD.push(rowData.COL_CD);
        ticks.push(rowData.COL_NM);
        label.push('<div class="ui-lbl-pie">' + rowData.COL_NM + '(' + $NC.getDisplayNumber(rowData.LONG_TERM_STOCK_QTY) + ')</div>');
        seriesPieDS[0].push(rowData.LONG_TERM_STOCK_QTY);
        totalQty += rowData.LONG_TERM_STOCK_QTY;
      }
    }
    
    // legend 생성
    setLegend("#longtermLegend > div.legendBox", ["1개월 이하", "1개월~3개월", "3개월 이상"]);
    
    // 장기재고
    $("#longtermTotalQty > span").html($NC.getDisplayNumber(totalQty));
    
    window["G_CHTPIELONGTERMREPORT"].replot({
      data: seriesPieDS,
      seriesDefaults: {
        rendererOptions: {
          dataLabels: label
        }
      }
    });
    window["G_CHTBARLONGTERMREPORT"].replot({
      data: seriesBarDS,
      axes: {
        yaxis: {
            ticks: ticks
        }
      }
    });
  } else {
    clearChart("longterm");
  }
}

function onGetValidReport(ajaxData) {
  
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData) && resultData.length) {
    var seriesPieDS = [[ ]];
    var seriesBarDS = [[ ], [ ], [ ], [ ]];
    var ticksCD = [];
    var ticks = [];
    var label = [];
    var totalQty = 0;
    var rowData;
    for (var i = 0, resultCount = resultData.length; i < resultCount; i++) {
      rowData = resultData[i];
      seriesBarDS[0].push(rowData.STOCK_QTY01);
      seriesBarDS[1].push(rowData.STOCK_QTY13);
      seriesBarDS[2].push(rowData.STOCK_QTY03);
      seriesBarDS[3].push(rowData.STOCK_QTY00);
      if ($.inArray(rowData.COL_CD, ticksCD) < 0) {
        ticksCD.push(rowData.COL_CD);
        ticks.push(rowData.COL_NM);
        label.push('<div class="ui-lbl-pie">' + rowData.COL_NM + '(' + $NC.getDisplayNumber(rowData.IMPEND_STOCK_QTY) + ')</div>');
        seriesPieDS[0].push(rowData.IMPEND_STOCK_QTY);
        totalQty += rowData.IMPEND_STOCK_QTY;
      }
    }
    
    // legend 생성
    setLegend("#validLegend > div.legendBox", ["1개월 이하", "1개월~3개월", "3개월 이상", "미지정"]);
    
    // 장기재고
    $("#validTotalQty > span").html($NC.getDisplayNumber(totalQty));
    
    window["G_CHTPIEVALIDREPORT"].replot({
      data: seriesPieDS,
      seriesDefaults: {
        rendererOptions: {
          dataLabels: label
        }
      }
    });
    window["G_CHTBARVALIDREPORT"].replot({
      data: seriesBarDS,
      axes: {
        yaxis: {
            ticks: ticks
        }
      }
    });
  } else {
    clearChart("valid");
  }
}

function setLegend(selector, legendData) {
  var legendHtml = "";
  for (var i = 0, legendCount = legendData.length; i < legendCount; i++) {
    legendHtml += "<span><div class=\"colorBox\" style=\"background:"+$NC.G_VAR.chtColors[i]+"\">&nbsp;</div>"+legendData[i]+"</span>";
  }
  $(selector).html(legendHtml);
}

function clearChart(kind) {
  
  window["G_CHTBAR"+kind.toUpperCase()+"REPORT"].options.axes.yaxis.ticks = [null];
  window["G_CHTBAR"+kind.toUpperCase()+"REPORT"].replot({
    data: [[[0, ""]]]
  });
  window["G_CHTPIE"+kind.toUpperCase()+"REPORT"].replot({
    data: [[["", 0]]]
  });
  setLegend("#"+kind+"Legend > div.legendBox", ["미지정"]);
  $("#"+kind+"TotalQty > span").html("0");
}

function rotateDayCboSet(select) {
  var cboOptions = "";
  var selected = "";
  select = select ? select : 10;
  for (var i = 1; i < 31; i++) {
    selected = select == i ? " selected" : "";
    cboOptions += "<option value=\""+i+"\""+selected+">"+i+"일 이하</option>";
  }
  $("#cboQHigh_Rotate_Day").html(cboOptions);
}

function longTermCboSet(select) {
  var cboOptions = "";
  var selected = "";
  select = select ? select : 1;
  for (var i = 1; i < 13; i++) {
    selected = select == i ? " selected" : "";
    cboOptions += "<option value=\""+i+"\""+selected+">"+i+"개월 이상</option>";
  }
  $("#cboQLong_Term_Month").html(cboOptions);
}

function validCboSet(select) {
  var cboOptions = "";
  var selected = "";
  var values = [10, 15, 20, 30, 60, 90];
  select = select ? select : 30;
  for (var i = 0; i < values.length; i++) {
    selected = select == values[i] ? " selected" : "";
    cboOptions += "<option value=\""+values[i]+"\""+selected+">"+values[i]+"일 이하</option>";
  }
  $("#cboQImpend_Day").html(cboOptions);
}