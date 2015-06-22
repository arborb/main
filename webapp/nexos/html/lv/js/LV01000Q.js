/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  grdNoConfirmInitialize();
  grdNoticeInitialize();

  $("#divMoreNotice").hide();
  $NC.setInitDatePicker("#dtpQInout_Date");

  // 차트 초기화
  barChartInitialize("chtEmptyLocReport");
  barChartInitialize("chtPutAwayReport");

  meterChartInitialize("chtEmptyLocMeter");
  meterChartInitialize("chtPutAwayMeter");

  donutChartInitialize("chtLIMasterReport");
  donutChartInitialize("chtLIDetailReport");
  donutChartInitialize("chtLICntReport");

  donutChartInitialize("chtLOMasterReport");
  donutChartInitialize("chtLODetailReport");
  donutChartInitialize("chtLOCntReport");

  donutChartInitialize("chtRIMasterReport");
  donutChartInitialize("chtRIDetailReport");
  donutChartInitialize("chtRICntReport");

  donutChartInitialize("chtROMasterReport");
  donutChartInitialize("chtRODetailReport");
  donutChartInitialize("chtROCntReport");

  pieChartInitialize("chtLOSumMasterReport");
  pieChartInitialize("chtLOSumDetailReport");
  pieChartInitialize("chtLOSumCntReport");

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
      // _Inquiry();
    }
  });

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#divMoreNotice").click(function() {
    $NC.G_MAIN.showProgramPopup("CS01000E");
  });
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.noticeGridHeight = 100;
  $NC.G_OFFSET.noConfirmGridHeight = 76;
  $NC.G_OFFSET.meterWidth = 100;
  $NC.G_OFFSET.perBarWidth = 30;
  $NC.G_OFFSET.gboxHeight = $("#divMasterView .ui-gbox-title:first").outerHeight();
  $NC.G_OFFSET.leftChartHeightOffset = $NC.G_OFFSET.noticeGridHeight + $NC.G_OFFSET.noConfirmGridHeight
      + ($NC.G_OFFSET.gboxHeight * 4) + ($NC.G_LAYOUT.margin1 * 10) + ($NC.G_LAYOUT.border1 * 3);
  $NC.G_OFFSET.rightChartHeightOffset = ($NC.G_OFFSET.gboxHeight * 5) + ($NC.G_LAYOUT.margin1 * 19)
      + ($NC.G_LAYOUT.border1 * 5);
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

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);
  $NC.resizeContainer("#divLeftView", leftWidth, clientHeight);
  $NC.resizeContainer("#divRightView", rightWidth, clientHeight);

  leftWidth -= ($NC.G_LAYOUT.margin2 * 2) + $NC.G_LAYOUT.border2;
  $NC.resizeGrid("#grdNotice", leftWidth + $NC.G_LAYOUT.border1 + $NC.G_LAYOUT.padding2, $NC.G_OFFSET.noticeGridHeight
      - $NC.G_LAYOUT.border1);
  // 컬럼 헤더 숨김으로 사이즈 재조정...
  $("#grdNotice .slick-viewport,#grdNotice .slick-pane-top").css({
    "height": $NC.G_OFFSET.noticeGridHeight
  });
  $NC.resizeGrid("#grdNoConfirm", leftWidth + $NC.G_LAYOUT.border1 + $NC.G_LAYOUT.padding2,
      $NC.G_OFFSET.noConfirmGridHeight);

  var chartAreaHeight = clientHeight - $NC.G_OFFSET.leftChartHeightOffset;
  var chartHeight = $NC.getTruncVal(chartAreaHeight / 2);
  var chartWidth = 0;
  var lastChartWidth = 0;

  resizeChartContainer("#chtEmptyLocReport", leftWidth - $NC.G_OFFSET.meterWidth, chartHeight);
  resizeChartContainer("#chtEmptyLocMeter", $NC.G_OFFSET.meterWidth, chartHeight);
  resizeChartContainer("#chtPutAwayReport", leftWidth - $NC.G_OFFSET.meterWidth, chartAreaHeight - chartHeight);
  resizeChartContainer("#chtPutAwayMeter", $NC.G_OFFSET.meterWidth, chartAreaHeight - chartHeight);

  chartAreaHeight = clientHeight - $NC.G_OFFSET.rightChartHeightOffset;
  chartHeight = $NC.getTruncVal(chartAreaHeight / 11) * 2;

  rightWidth -= ($NC.G_LAYOUT.margin1 * 7) + $NC.G_LAYOUT.border2;
  chartWidth = $NC.getTruncVal(rightWidth / 3) + $NC.G_LAYOUT.border1;
  lastChartWidth = rightWidth - (chartWidth * 2) - $NC.G_OFFSET.perBarWidth;
  chartWidth -= $NC.G_OFFSET.perBarWidth;

  resizeChartContainer("#chtLIMasterReport", chartWidth, chartHeight);
  resizeChartContainer("#chtLIDetailReport", chartWidth, chartHeight);
  resizeChartContainer("#chtLICntReport", lastChartWidth, chartHeight);
  $("#chtLIMasterReport").parent().find(".ui-percent-bar").css({
    "width": $NC.G_OFFSET.perBarWidth,
    "height": chartHeight - $NC.G_LAYOUT.border1
  });

  resizeChartContainer("#chtLOMasterReport", chartWidth, chartHeight);
  resizeChartContainer("#chtLODetailReport", chartWidth, chartHeight);
  resizeChartContainer("#chtLOCntReport", lastChartWidth, chartHeight);
  $("#chtLOMasterReport").parent().find(".ui-percent-bar").css({
    "width": $NC.G_OFFSET.perBarWidth,
    "height": chartHeight - $NC.G_LAYOUT.border1
  });

  resizeChartContainer("#chtRIMasterReport", chartWidth, chartHeight);
  resizeChartContainer("#chtRIDetailReport", chartWidth, chartHeight);
  resizeChartContainer("#chtRICntReport", lastChartWidth, chartHeight);
  $("#chtRIMasterReport").parent().find(".ui-percent-bar").css({
    "width": $NC.G_OFFSET.perBarWidth,
    "height": chartHeight - $NC.G_LAYOUT.border1
  });

  resizeChartContainer("#chtROMasterReport", chartWidth, chartHeight);
  resizeChartContainer("#chtRODetailReport", chartWidth, chartHeight);
  resizeChartContainer("#chtROCntReport", lastChartWidth, chartHeight);
  $("#chtROMasterReport").parent().find(".ui-percent-bar").css({
    "width": $NC.G_OFFSET.perBarWidth,
    "height": chartHeight - $NC.G_LAYOUT.border1
  });

  chartHeight = chartAreaHeight - (chartHeight * 4);
  chartWidth += $NC.G_OFFSET.perBarWidth;
  lastChartWidth += $NC.G_OFFSET.perBarWidth;
  resizeChartContainer("#chtLOSumMasterReport", chartWidth, chartHeight);
  resizeChartContainer("#chtLOSumDetailReport", chartWidth, chartHeight);
  resizeChartContainer("#chtLOSumCntReport", lastChartWidth, chartHeight);
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
    break;
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
  case "INOUT_DATE":
    $NC.setValueDatePicker(view, val, "입출고일자를 정확히 입력하십시오.");
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
    alert("사업부를 선택하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var INOUT_DATE = $NC.getValue("#dtpQInout_Date");
  if ($NC.isNull(INOUT_DATE)) {
    alert("입출고일자를 입력하십시오.");
    $NC.setFocus("#dtpQInout_Date");
    return;
  }

  // 공지사항
  $NC.serviceCall("/LV01000Q/getDataSet.do", {
    P_QUERY_ID: "LV01000Q.RS_NOTICE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_LIST_CNT: 5
    })
  }, onGetNotice);

  // 공셀 현황
  $NC.serviceCall("/LV01000Q/getDataSet.do", {
    P_QUERY_ID: "LV01000Q.RS_EMPTYLOC",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD
    })
  }, onGetEmptyLocReport);

  // 지시 후 미확정 전표
  $NC.serviceCall("/LV01000Q/getDataSet.do", {
    P_QUERY_ID: "LV01000Q.RS_NOCONFIRM",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE: INOUT_DATE
    })
  }, onGetNoConfirm);

  // 입고진행 현황
  $NC.serviceCall("/LV01000Q/getDataSet.do", {
    P_QUERY_ID: "LV01000Q.RS_LIPROCESS",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE: INOUT_DATE
    })
  }, onGetLiProcessReport);

  // 출고진행 현황
  $NC.serviceCall("/LV01000Q/getDataSet.do", {
    P_QUERY_ID: "LV01000Q.RS_LOPROCESS",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE: INOUT_DATE
    })
  }, onGetLoProcessReport);

  // 반입진행 현황
  $NC.serviceCall("/LV01000Q/getDataSet.do", {
    P_QUERY_ID: "LV01000Q.RS_RIPROCESS",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE: INOUT_DATE
    })
  }, onGetRiProcessReport);

  // 반출진행 현황
  $NC.serviceCall("/LV01000Q/getDataSet.do", {
    P_QUERY_ID: "LV01000Q.RS_ROPROCESS",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE: INOUT_DATE
    })
  }, onGetRoProcessReport);

  // 출고요약(차수별)
  $NC.serviceCall("/LV01000Q/getDataSet.do", {
    P_QUERY_ID: "LV01000Q.RS_LOABSTRACT",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_INOUT_DATE: INOUT_DATE
    })
  }, onGetSumProcessReport);
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

function grdNoticeOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "WRITE_NO",
    field: "WRITE_NO",
    name: "공지번호",
    minWidth: 40,
    maxWidth: 40,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "NOTICE_TITLE",
    field: "NOTICE_TITLE",
    name: "제목",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "UPD_DATETIME",
    field: "UPD_DATETIME",
    name: "수정일시",
    minWidth: 140,
    maxWidth: 140,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdNoticeInitialize() {

  var options = {
    frozenColumn: -1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdNotice", {
    columns: grdNoticeOnGetColumns(),
    queryId: "LV01000Q.GET_NOTICE_LIST",
    sortCol: "",
    gridOptions: options
  });

  G_GRDNOTICE.view.onSelectedRowsChanged.subscribe(grdNoticeOnAfterScroll);

  // Grid 컬럼 헤더 숨김
  $NC.hideGridColumnHeader("#grdNotice");
  // Grid 가로 스크롤바 숨김
  $NC.hideGridHorzScroller("#grdNotice");
}

function grdNoticeOnAfterScroll(e, args) {

}

function grdNoConfirmOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "SW",
    field: "SW",
    name: "구분",
    minWidth: 90,
    cssClass: "align-center",
    sortable: false
  });
  $NC.setGridColumn(columns, {
    id: "LI_CNT",
    field: "LI_CNT",
    name: "입고",
    minWidth: 80,
    cssClass: "align-right",
    sortable: false
  });
  $NC.setGridColumn(columns, {
    id: "LO_CNT",
    field: "LO_CNT",
    name: "출고",
    minWidth: 80,
    cssClass: "align-right",
    sortable: false
  });
  $NC.setGridColumn(columns, {
    id: "RI_CNT",
    field: "RI_CNT",
    name: "반입",
    minWidth: 80,
    cssClass: "align-right",
    sortable: false
  });
  $NC.setGridColumn(columns, {
    id: "RO_CNT",
    field: "RO_CNT",
    name: "반출",
    minWidth: 80,
    cssClass: "align-right",
    sortable: false
  });
  $NC.setGridColumn(columns, {
    id: "EI_CNT",
    field: "EI_CNT",
    name: "기타입고",
    minWidth: 80,
    cssClass: "align-right",
    sortable: false
  });
  $NC.setGridColumn(columns, {
    id: "EO_CNT",
    field: "EO_CNT",
    name: "기타출고",
    minWidth: 80,
    cssClass: "align-right",
    sortable: false
  });
  $NC.setGridColumn(columns, {
    id: "MV_CNT",
    field: "MV_CNT",
    name: "LOC이동",
    minWidth: 80,
    cssClass: "align-right",
    sortable: false
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdNoConfirmInitialize() {

  var options = {
    frozenColumn: -1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdNoConfirm", {
    columns: grdNoConfirmOnGetColumns(),
    queryId: "LV01000Q.RS_MASTER",
    sortCol: "",
    gridOptions: options
  });

  G_GRDNOCONFIRM.view.onSelectedRowsChanged.subscribe(grdNoConfirmOnAfterScroll);
}

function grdNoConfirmOnAfterScroll(e, args) {

}

function barChartInitialize(chartId) {

  var chtObject = $.jqplot(chartId, [[["", 0]], [["", 0]]], {
    // animate: true,
    // animateReplot: true,
    seriesDefaults: {
      renderer: $.jqplot.BarRenderer,
      rendererOptions: {
        barPadding: -20,
        barWidth: 20,
        shadow: true,
        shadowColor: "#939393",
        shadowWidth: 1,
        shadowDepth: 1,
        shadowAlpha: 0.3
      },
      pointLabels: {
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
}

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
    grid: {
      background: "#fbfbfb",
      drawBorder: false,
      shadowOffset: 0,
      shadowAngle: 90,
      shadowWidth: 2,
      shadowDepth: 1
    },
    gridPadding: {
      top: 2,
      bottom: 0,
      left: 2,
      right: 2
    }
  });

  window["G_" + chartId.toUpperCase()] = chtObject;
}

function donutChartInitialize(chartId) {

  var chtObject = $.jqplot(chartId, [["", 0]], {
    title: {
      rendererOptions: {
        paddingBottom: 5,
        position: "bottom"
      }
    },
    seriesDefaults: {
      renderer: $.jqplot.DonutRenderer,
      rendererOptions: {
        sliceMargin: 2,
        startAngle: 90,
        padding: 5,
        showDataLabels: true,
        labelPosition: "bottom",
        shadowDepth: 1,
        dataLabels: "value",
        innerDiameter: 5,
        semiCircular: true
      }
    },
    grid: {
      background: "#fbfbfb",
      drawBorder: false,
      shadowOffset: 0,
      shadowAngle: 90,
      shadowWidth: 2,
      shadowDepth: 1
    },
    gridPadding: {
      top: 2,
      bottom: 0,
      left: 2,
      right: 2
    }
  });

  window["G_" + chartId.toUpperCase()] = chtObject;
}

function meterChartInitialize(chartId) {

  var chtObject = $.jqplot(chartId, [[0]], {
    seriesDefaults: {
      renderer: $.jqplot.MeterGaugeRenderer,
      rendererOptions: {
        label: "",
        labelPosition: "bottom",
        background: "#1da2e0",
        ringColor: "#e8e8e8",
        needleColor: "#d3394d",
        needleRingColor: "#ea3f56",
        tickColor: "#e8e8e8",
        shadowDepth: 3,
        ticks: [0, 25, 50, 75, 100],
        intervals: [ ]
      }
    },
    gridPadding: {
      top: 0,
      bottom: 30,
      left: 0,
      right: 0
    }
  });

  window["G_" + chartId.toUpperCase()] = chtObject;
}

function onGetNoConfirm(ajaxData) {

  $NC.setInitGridData(G_GRDNOCONFIRM, ajaxData);
  if (G_GRDNOCONFIRM.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDNOCONFIRM, 0);
  } else {
    $NC.setGridDisplayRows("#grdNoConfirm", 0, 0);
  }
}

function onChangingCondition() {

  // 그리드 초기화
  $NC.clearGridData(G_GRDNOTICE);
  $("#divMoreNotice").hide();
  $NC.clearGridData(G_GRDNOCONFIRM);

  // 차트 초기화
  clearBarChart();
  clearPieChart("LI");
  clearPieChart("LO");
  clearPieChart("RI");
  clearPieChart("RO");
  clearPieChart("LOSUM");

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
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");
  onChangingCondition();
}

function onGetNotice(ajaxData) {

  $("#divMoreNotice").hide();
  $NC.setInitGridData(G_GRDNOTICE, ajaxData);
  var rowCount = G_GRDNOTICE.data.getLength();
  if (rowCount > 0) {
    if (rowCount == 5) {
      $("#divMoreNotice").show();
      G_GRDNOTICE.data.deleteItem(G_GRDNOTICE.data.getItem(4).id);
    }
    $NC.setGridSelectRow(G_GRDNOTICE, 0);
  } else {
    $NC.setGridDisplayRows("#grdNotice", 0, 0);
  }
}
/**
 * 공셀현황 및 적재현황 BAR차트 검색결과 업데이트
 * 
 * @param ajaxData
 */
function onGetEmptyLocReport(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData) && resultData.length) {
    var seriesDS01 = [[ ], [ ]];
    var seriesDS02 = [[ ], [ ]];
    var rowData;
    for (var i = 0, resultCount = resultData.length; i < resultCount; i++) {
      rowData = resultData[i];
      seriesDS01[0].push([rowData.ZONE_NM, rowData.LOC_CNT]);
      seriesDS01[1].push([rowData.ZONE_NM, rowData.EMPTY_LOC_CNT]);
      seriesDS02[0].push([rowData.ZONE_NM, rowData.LOC_PLT_QTY]);
      seriesDS02[1].push([rowData.ZONE_NM, rowData.STOCK_PLT_QTY]);
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
          label: "공셀율(" + rowData.EMPTY_LOC_RATE + "%)"
        }
      }
    });
    window["G_CHTPUTAWAYMETER"].replot({
      data: [[rowData.USING_RATE]],
      seriesDefaults: {
        rendererOptions: {
          label: "적재율(" + rowData.USING_RATE + "%)"
        }
      }
    });
  }
}

function clearBarChart() {
  window["G_CHTEMPTYLOCREPORT"].replot({
    data: [[["", 0]], [["", 0]]]
  });
  window["G_CHTPUTAWAYREPORT"].replot({
    data: [[["", 0]], [["", 0]]]
  });
  window["G_CHTEMPTYLOCMETER"].replot({
    data: [0],
    seriesDefaults: {
      rendererOptions: {
        label: "공셀율"
      }
    }
  });
  window["G_CHTPUTAWAYMETER"].replot({
    data: [0],
    seriesDefaults: {
      rendererOptions: {
        label: "적재율"
      }
    }
  });
}

function onGetLiProcessReport(ajaxData) {

  onGetPieReport("LI", ajaxData);
}

function onGetLoProcessReport(ajaxData) {

  onGetPieReport("LO", ajaxData);
}

function onGetRiProcessReport(ajaxData) {

  onGetPieReport("RI", ajaxData);
}

function onGetRoProcessReport(ajaxData) {

  onGetPieReport("RO", ajaxData);
}

function onGetSumProcessReport(ajaxData) {

  onGetPieReport("LOSUM", ajaxData);
}

function onGetPieReport(process, ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData) && resultData.length) {
    var SUM_ORDER_QTY = 0;
    var SUM_LINE_QTY = 0;
    var SUM_QTY = 0;
    var SUM_ORDER_QTY40 = 0;
    var SUM_LINE_QTY40 = 0;
    var SUM_QTY40 = 0;

    var seriesDS = [[[ ]], [[ ]], [[ ]]];
    var label = [[ ], [ ], [ ]];

    var rowData;
    for (var i = 0, resultCount = resultData.length; i < resultCount; i++) {

      rowData = resultData[i];
      seriesDS[0][0].push([rowData.STATE_NM, rowData.ORDER_QTY]);
      seriesDS[1][0].push([rowData.STATE_NM, rowData.LINE_QTY]);
      seriesDS[2][0].push([rowData.STATE_NM, rowData.QTY]);

      label[0].push('<div class="ui-lbl-pie">' + rowData.STATE_NM + '(' + rowData.ORDER_QTY + ')</div>');
      label[1].push('<div class="ui-lbl-pie">' + rowData.STATE_NM + '(' + rowData.LINE_QTY + ')</div>');
      label[2].push('<div class="ui-lbl-pie">' + rowData.STATE_NM + '(' + rowData.QTY + ')</div>');

      SUM_ORDER_QTY += rowData.ORDER_QTY;
      SUM_LINE_QTY += rowData.LINE_QTY;
      SUM_QTY += rowData.QTY;

      if (rowData.STATE >= "40") {
        SUM_ORDER_QTY40 += rowData.ORDER_QTY;
        SUM_LINE_QTY40 += rowData.LINE_QTY;
        SUM_QTY40 += rowData.QTY;
      }
    }
    window["G_CHT" + process + "MASTERREPORT"].replot({
      title: "전표(" + SUM_ORDER_QTY + ")",
      data: seriesDS[0],
      seriesDefaults: {
        rendererOptions: {
          dataLabels: label[0]
        }
      }
    });
    var perVal = $NC.getTruncVal(SUM_ORDER_QTY40 / SUM_ORDER_QTY * 100);
    setOneBarChart($("#cht" + process + "MasterPerBar"), perVal);
    window["G_CHT" + process + "DETAILREPORT"].replot({
      title: "라인(" + SUM_LINE_QTY + ")",
      data: seriesDS[1],
      seriesDefaults: {
        rendererOptions: {
          dataLabels: label[1]
        }
      }
    });
    perVal = $NC.getTruncVal(SUM_LINE_QTY40 / SUM_LINE_QTY * 100);
    setOneBarChart($("#cht" + process + "DetailPerBar"), perVal);
    window["G_CHT" + process + "CNTREPORT"].replot({
      title: "수량(" + SUM_QTY + ")",
      data: seriesDS[2],
      seriesDefaults: {
        rendererOptions: {
          dataLabels: label[2]
        }
      }
    });
    perVal = $NC.getTruncVal(SUM_QTY40 / SUM_QTY * 100);
    setOneBarChart($("#cht" + process + "CntPerBar"), perVal);
  } else {
    clearPieChart(process);
  }
}

function clearPieChart(process) {

  window["G_CHT" + process + "MASTERREPORT"].replot({
    title: "전표(0)",
    data: [['', 0]],
    seriesDefaults: {
      rendererOptions: {
        dataLabels: null
      }
    }
  });
  setOneBarChart($("#cht" + process + "MasterPerBar"), 0);
  window["G_CHT" + process + "DETAILREPORT"].replot({
    title: "라인(0)",
    data: [['', 0]],
    seriesDefaults: {
      rendererOptions: {
        dataLabels: null
      }
    }
  });
  setOneBarChart($("#cht" + process + "DetailPerBar"), 0);
  window["G_CHT" + process + "CNTREPORT"].replot({
    title: "수량(0)",
    data: [['', 0]],
    seriesDefaults: {
      rendererOptions: {
        dataLabels: null
      }
    }
  });
  setOneBarChart($("#cht" + process + "CntPerBar"), 0);
}

function setOneBarChart(selector, perVal) {
  $(selector).empty();
  $(
      "<span class='ui-percent-text'>" + perVal + "%</span><span class='ui-percent-val' style='height: " + perVal
          + "%;'></span>").appendTo(selector);
}