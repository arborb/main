/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });
  
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
  
  // 바차트 초기화
  barChartInitialize("chtEmptyLocReport");
  barChartHorizonInitialize("chtEmptyLocBankReport");
  barChartInitialize("chtPutAwayReport");
  barChartHorizonInitialize("chtPutAwayBankReport");
  
  // 메타차트 초기화
  meterChartInitialize("chtEmptyLocMeter");
  meterChartInitialize("chtEmptyLocBankMeter");
  meterChartInitialize("chtPutAwayMeter");
  meterChartInitialize("chtPutAwayBankMeter");
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.meterChtWidth = 130;
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
  var leftChartWidth01 = $NC.G_OFFSET.meterChtWidth;
  var leftChartWidth02 = leftChartWidth - leftChartWidth01 - $NC.G_LAYOUT.margin1;
  var rightChartWidth = rightWidth - $NC.G_LAYOUT.margin2  - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1;
  var rightChartWidth01 = $NC.G_OFFSET.meterChtWidth;
  var rightChartWidth02 = rightChartWidth - rightChartWidth01 - $NC.G_LAYOUT.margin1;
  var topChartHeight = topHeight - $NC.G_OFFSET.gboxHeight - $NC.G_LAYOUT.margin1 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1; 
  var bottomChartHeight = bottomHeight - $NC.G_OFFSET.gboxHeight - $NC.G_LAYOUT.margin2 - $NC.G_LAYOUT.padding2 - $NC.G_LAYOUT.border1;
  
  chtPointLabelHideZeros(false); // 포인트 라벨 HideZeros 옵션 false(관련버그있음)
  resizeChartContainer("#chtEmptyLocReport", leftChartWidth02, topChartHeight);
  resizeChartContainer("#chtEmptyLocBankReport", leftChartWidth02, bottomChartHeight);
  resizeChartContainer("#chtPutAwayReport", rightChartWidth02, topChartHeight);
  resizeChartContainer("#chtPutAwayBankReport", rightChartWidth02, bottomChartHeight);
  
  resizeChartContainer("#chtEmptyLocMeter", leftChartWidth01, topChartHeight);
  resizeChartContainer("#chtEmptyLocBankMeter", leftChartWidth01, bottomChartHeight);
  resizeChartContainer("#chtPutAwayMeter", rightChartWidth01, topChartHeight);
  resizeChartContainer("#chtPutAwayBankMeter", rightChartWidth01, bottomChartHeight);
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
  
  if((/Meter/i).test(selector)){
    window["G_" + view.prop("id").toUpperCase()].replot({
      resetAxes: true,
      seriesDefaults: {
        pointLabels: {
          hideZeros: true
        }
      },
      gridPadding: {
        top: 50,
        bottom: $NC.getTruncVal(height/2) - $NC.getTruncVal(width/4),
        left: 0,
        right: 0
      }
    });
  } else {
    window["G_" + view.prop("id").toUpperCase()].replot({
      resetAxes: true,
      seriesDefaults: {
        pointLabels: {
          hideZeros: true
        }
      }
    });
  }
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
  
  // 공셀 View, 적재율 View
  $NC.serviceCall("/LV01000Q/getDataSet.do", {
    P_QUERY_ID: "LV01000Q.RS_EMPTYLOC",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD
    })
  }, onGetMasterReport);
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
 * 바차트 초기화
 */
function barChartInitialize(chartId) {

  var chtObject = $.jqplot(chartId, [[["", 0]], [["", 0]]], {
    // animate: true,
    // animateReplot: true,
    seriesDefaults: {
      renderer: $.jqplot.BarRenderer,
      rendererOptions: {
        barPadding: -15,
        barWidth: 15,
        shadow: true,
        shadowColor: "#939393",
        shadowWidth: 1,
        shadowDepth: 1,
        shadowAlpha: 0.3
      },
      pointLabels: {
        seriesLabelIndex: 1,
        show: true
      }
    },
    series: [{
      color: "rgba(206, 206, 206, .9)",
      pointLabels: {
        location: "n"
      }
    }, {
      color: "rgba(29, 162, 224, .9)",
      pointLabels: {
        location: "s"
      }
    }],
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
        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
        tickOptions: {
          angle: -25
        }
      },
      yaxis: {
        autoscale: true,
        min: 0,
        tickOptions: {
          formatString: "%'d"
        }
      }
    },
    highlighter: {
      show: true,
      tooltipAxes: "y",
      tooltipLocation: 'ne'
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
      bottom: 50,
      left: 55,
      right: 0
    }
  });

  window["G_" + chartId.toUpperCase()] = chtObject;
  if (window[chartId + "OnDblClick"]) {
    $("#" + chartId).bind("jqplotDblClick", window[chartId + "OnDblClick"]);
  }
}

/**
 * 바차트 초기화(horizontal)
 */
function barChartHorizonInitialize(chartId) {

  var chtObject = $.jqplot(chartId, [[[0, ""]], [[0, ""]]], {
    // animate: true,
    // animateReplot: true,
    seriesDefaults: {
      renderer: $.jqplot.BarRenderer,
      rendererOptions: {
        barPadding: -7,
        barWidth: 7,
        shadow: true,
        shadowColor: "#939393",
        shadowWidth: 1,
        shadowDepth: 1,
        shadowAlpha: 0.3,
        barDirection: "horizontal"
      },
      pointLabels: {
        seriesLabelIndex: 0,
        show: true
      }
    },
    series: [{
      color: "rgba(206, 206, 206, .9)",
      pointLabels: {
        location: "e"
      }
    }, {
      color: "rgba(29, 162, 224, .9)",
      pointLabels: {
        location: "w"
      }
    }],
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
        min: 0,
        tickRenderer: $.jqplot.CanvasAxisTickRenderer,
        tickOptions: {
          angle: -25,
          formatString: "%'d"
        }
      },
      yaxis: {
        autoscale: true,
        renderer: $.jqplot.CategoryAxisRenderer
      }
    },
    highlighter: {
      show: true,
      tooltipAxes: "x",
      tooltipLocation: "ne"
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
      bottom: 50,
      left: 55,
      right: 0
    }
  });

  window["G_" + chartId.toUpperCase()] = chtObject;
  if (window[chartId + "OnDblClick"]) {
    $("#" + chartId).bind("jqplotDblClick", window[chartId + "OnDblClick"]);
  }
}

/**
 * 메타차트 초기화
 */
function meterChartInitialize(chartId) {

  var chtObject = $.jqplot(chartId, [[0]], {
    seriesDefaults: {
      renderer: $.jqplot.MeterGaugeRenderer,
      rendererOptions: {
        label: "",
        labelPosition: "inside",
        background: "#1da2e0",
        ringWidth: 3,
        ringColor: "#e8e8e8",
        needleColor: "#d3394d",
        needleRingColor: "#ea3f56",
        tickColor: "#e8e8e8",
        shadowDepth: 0,
        ticks: [0, 25, 50, 75, 100],
        intervals: [ ]
      }
    },
    gridPadding: {
      top: 0,
      bottom: 40,
      left: 0,
      right: 0
    }
  });

  window["G_" + chartId.toUpperCase()] = chtObject;
}

function chtEmptyLocReportOnDblClick(ev, gridpos, datapos, neighbor, plot) {

  if (!neighbor) {
    return;
  }

  window["G_CHTEMPTYLOCBANKREPORT"].replot({
    data: [[[0, ""]]],
    resetAxes: true
  });
  window["G_CHTEMPTYLOCBANKMETER"].replot({
    data: [[null]],
    seriesDefaults: {
      rendererOptions: {
        label: "<div class=\"zoneNm\"><선택 존 없음></div><div class=\"rate\">공셀율(0%)</div>"
      }
    }
  });

  var QUERY_PARAMS = $NC.getParams({
    P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
    P_ZONE_CD: neighbor.data[2].ZONE_CD
  });
  inquiryEmptyLocBank(QUERY_PARAMS);
}

function chtPutAwayReportOnDblClick(ev, gridpos, datapos, neighbor, plot) {

  if (!neighbor) {
    return;
  }

  window["G_CHTPUTAWAYBANKREPORT"].replot({
    data: [[[0, ""]]],
    resetAxes: true
  });
  window["G_CHTPUTAWAYBANKMETER"].replot({
    data: [[null]],
    seriesDefaults: {
      rendererOptions: {
        label: "<div class=\"zoneNm\"><선택 존 없음></div><div class=\"rate\">적재율(0%)</div>"
      }
    }
  });
  
  var QUERY_PARAMS = $NC.getParams({
    P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
    P_ZONE_CD: neighbor.data[2].ZONE_CD
  });
  inquiryPutAwayBank(QUERY_PARAMS);
}

function onChangingCondition() {

  // 차트 초기화
  clearChart();

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
  onChangingCondition();
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
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setFocus("#edtQBu_Cd", true);
  }
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

function inquiryEmptyLocBank (QUERY_PARAMS) {
  $NC.serviceCall("/LV02010Q/getDataSet.do", {
    P_QUERY_ID: "LV02010Q.RS_EMPTYLOCBANK",
    P_QUERY_PARAMS: QUERY_PARAMS
  }, onGetEmptyLocBank);
}

function inquiryPutAwayBank (QUERY_PARAMS) {
  $NC.serviceCall("/LV02010Q/getDataSet.do", {
    P_QUERY_ID: "LV02010Q.RS_PUTAWAYBANK",
    P_QUERY_PARAMS: QUERY_PARAMS
  }, onGetPutAwayBank);
}

/**
 * 공셀 View, 적재율 View 차트 업데이트
 * 
 * @param ajaxData
 */
function onGetMasterReport(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData) && resultData.length) {
    var seriesDS01 = [[ ], [ ]];
    var seriesDS02 = [[ ], [ ]];
    var rowData;
    for (var i = 0, resultCount = resultData.length; i < resultCount; i++) {
      rowData = resultData[i];
      seriesDS01[0].push([rowData.ZONE_NM, rowData.LOC_CNT, rowData]);
      seriesDS01[1].push([rowData.ZONE_NM, rowData.EMPTY_LOC_CNT, rowData]);
      seriesDS02[0].push([rowData.ZONE_NM, rowData.LOC_PLT_QTY, rowData]);
      seriesDS02[1].push([rowData.ZONE_NM, rowData.STOCK_PLT_QTY, rowData]);
      if (i == 0) {
        var QUERY_PARAMS = $NC.getParams({
          P_CENTER_CD: $NC.getValue("#cboQCenter_Cd"),
          P_ZONE_CD: rowData.ZONE_CD
        });
        inquiryEmptyLocBank(QUERY_PARAMS);
        inquiryPutAwayBank(QUERY_PARAMS);
      }
    }
    window["G_CHTEMPTYLOCREPORT"].replot({
      data: seriesDS01
    });
    window["G_CHTPUTAWAYREPORT"].replot({
      data: seriesDS02
    });
    window["G_CHTEMPTYLOCMETER"].replot({
      data: [[rowData.EMPTY_LOC_RATE]],
      seriesDefaults: {
        rendererOptions: {
          label: "<div class=\"rate\">공셀율(" + rowData.EMPTY_LOC_RATE + "%)</div>"
        }
      }
    });
    window["G_CHTPUTAWAYMETER"].replot({
      data: [[rowData.USING_RATE]],
      seriesDefaults: {
        rendererOptions: {
          label: "<div class=\"rate\">적재율(" + rowData.USING_RATE + "%)</div>"
        }
      }
    });
  } else {
    clearChart();
  }
}

function onGetEmptyLocBank (ajaxData){
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData) && resultData.length) {
    var seriesDS = [[ ], [ ]];
    var rowData;
    for (var i = 0, resultCount = resultData.length; i < resultCount; i++) {
      rowData = resultData[i];
      seriesDS[0].push([rowData.LOC_CNT, rowData.BANK_CD]);
      seriesDS[1].push([rowData.EMPTY_LOC_CNT, rowData.BANK_CD]);
    }
    window["G_CHTEMPTYLOCBANKREPORT"].replot({
      data: seriesDS
    });
    window["G_CHTEMPTYLOCBANKMETER"].replot({
      data: [[rowData.EMPTY_LOC_RATE]],
      seriesDefaults: {
        rendererOptions: {
          label: "<div class=\"zoneNm\">&lt;"+rowData.ZONE_NM+"&gt;</div><div class=\"rate\">공셀율(" + rowData.EMPTY_LOC_RATE + "%)</div>"
        }
      }
    });
  }
}

function onGetPutAwayBank (ajaxData){
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData) && resultData.length) {
    var seriesDS = [[ ], [ ]];
    var rowData;
    for (var i = 0, resultCount = resultData.length; i < resultCount; i++) {
      rowData = resultData[i];
      seriesDS[0].push([rowData.LOC_PLT_QTY, rowData.BANK_CD]);
      seriesDS[1].push([rowData.STOCK_PLT_QTY, rowData.BANK_CD]);
    }
    window["G_CHTPUTAWAYBANKREPORT"].replot({
      data: seriesDS
    });
    window["G_CHTPUTAWAYBANKMETER"].replot({
      data: [[rowData.USING_RATE]],
      seriesDefaults: {
        rendererOptions: {
          label: "<div class=\"zoneNm\">&lt;"+rowData.ZONE_NM+"&gt;</div><div class=\"rate\">적재율(" + rowData.USING_RATE + "%)</div>"
        }
      }
    });
  }
}

function clearChart() {
  window["G_CHTEMPTYLOCREPORT"].replot({
    data: [[["", 0]]],
    resetAxes: true
  });
  window["G_CHTEMPTYLOCMETER"].replot({
    data: [[null]],
    seriesDefaults: {
      rendererOptions: {
        label: "<div class=\"rate\">공셀율(0%)</div>"
      }
    }
  });
  window["G_CHTEMPTYLOCBANKREPORT"].replot({
    data: [[[0, ""]]],
    resetAxes: true
  });
  window["G_CHTEMPTYLOCBANKMETER"].replot({
    data: [[null]],
    seriesDefaults: {
      rendererOptions: {
        label: "<div class=\"zoneNm\">&lt;선택 존 없음&gt;</div><div class=\"rate\">공셀율(0%)</div>"
      }
    }
  });
  window["G_CHTPUTAWAYREPORT"].replot({
    data: [[["", 0]]],
    resetAxes: true
  });
  window["G_CHTPUTAWAYMETER"].replot({
    data: [[null]],
    seriesDefaults: {
      rendererOptions: {
        label: "<div class=\"rate\">적재율(0%)</div>"
      }
    }
  });
  window["G_CHTPUTAWAYBANKREPORT"].replot({
    data: [[[0, ""]]],
    resetAxes: true
  });
  window["G_CHTPUTAWAYBANKMETER"].replot({
    data: [[null]],
    seriesDefaults: {
      rendererOptions: {
        label: "<div class=\"zoneNm\">&lt;선택 존 없음&gt;</div><div class=\"rate\">적재율(0%)</div>"
      }
    }
  });
}

function chtPointLabelHideZeros(hide) {
  window["G_CHTEMPTYLOCREPORT"].options.seriesDefaults.pointLabels.hideZeros = hide;
  window["G_CHTEMPTYLOCBANKREPORT"].options.seriesDefaults.pointLabels.hideZeros = hide;
  window["G_CHTPUTAWAYREPORT"].options.seriesDefaults.pointLabels.hideZeros = hide;
  window["G_CHTPUTAWAYBANKREPORT"].options.seriesDefaults.pointLabels.hideZeros = hide;
}