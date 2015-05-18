/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();

  // 차트 초기화
  chartInitialize("chtMaster", ["오차율", "오차건수"]);

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showBuBrandPopup);

  $NC.setInitDatePicker("#dtpQInvest_Date1");
  $NC.setInitDatePicker("#dtpQInvest_Date2");

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
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.gridWidth = 450;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $NC.G_LAYOUT.border1;
  $NC.G_OFFSET.gridHeightOffset = $NC.G_LAYOUT.header + $NC.G_OFFSET.nonClientHeight + ($NC.G_LAYOUT.border1 * 3);
  $NC.G_OFFSET.subViewHeightOffset = $NC.G_OFFSET.nonClientHeight + ($NC.G_LAYOUT.border1 * 3);
  $NC.G_OFFSET.chartHeightOffset = $NC.G_LAYOUT.header + $("#divDisplayDivView").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight + 1);

  var grdSelector = "#grdMaster";
  var chtSelector = "#chtMaster";
  var chtObject = window["G_CHTMASTER"];

  clientWidth -= $NC.G_LAYOUT.border1;
  clientHeight = parent.height() - $NC.G_OFFSET.subViewHeightOffset + 6;

  var grdParent = $("#grdMaster").parent();
  $NC.resizeContainer(grdParent, $NC.G_OFFSET.gridWidth, clientHeight);
  // Grid 사이즈 조정
  $NC.resizeGrid(grdSelector, grdParent.innerWidth(), grdParent.innerHeight() - $NC.G_LAYOUT.header);

  clientWidth -= $NC.G_OFFSET.gridWidth + $NC.G_LAYOUT.border1 + 5;
  $NC.resizeContainer($(chtSelector).parent(), clientWidth, clientHeight);

  clientHeight -= $NC.G_OFFSET.chartHeightOffset;
  var yaxisWidth = 80; // CSS
  $(chtSelector).css({
    "margin-left": yaxisWidth,
    "min-width": clientWidth - 20 - yaxisWidth,
    "max-width": clientWidth - 20 - yaxisWidth,
    "min-height": clientHeight - 20,
    "max-height": clientHeight - 20
  });
  chtObject.replot();
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
  case "INVEST_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "INVEST_DATE2":
    $NC.setValueDatePicker(view, val, "검색 종료일자를 정확히 입력하십시오.");
    break;
  }

  onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

  if (val === "N") {
    if ($NC.isNull($NC.getValueCheckGroup("DISPLAY_DIV"))) {
      alert("표시항목은 하나 이상 선택해야 됩니다.");
      $NC.setValue(view, true);
      return;
    }
  }
  var grdSelector = "#grdMaster";
  var grdObject = $NC.getGridGlobalVar(grdSelector);
  if (grdObject.data.getLength() > 0) {
    chartDataInitialize();
  }
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
    alert("사업부 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
  }
  var INVEST_DATE1 = $NC.getValue("#dtpQInvest_Date1");
  if ($NC.isNull(INVEST_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQInvest_Date1");
    return;
  }
  var INVEST_DATE2 = $NC.getValue("#dtpQInvest_Date2");
  if ($NC.isNull(INVEST_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQInvest_Date2");
    return;
  }
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_INVEST_DATE1: INVEST_DATE1,
    P_INVEST_DATE2: INVEST_DATE2
  });
  // 데이터 조회
  $NC.serviceCall("/LK04010Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

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

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "INVEST_DATE",
    field: "INVEST_DATE",
    name: "실사월",
    minWidth: 90,
    cssClass: "align-center",
    summaryTitle: "[전체합계]"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_CNT",
    field: "TOTAL_CNT",
    name: "실사건수",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_CNT",
    field: "ERROR_CNT",
    name: "오차건수",
    minWidth: 80,
    cssClass: "align-right",
    aggregator: "SUM"
  });
  $NC.setGridColumn(columns, {
    id: "ERROR_RATE",
    field: "ERROR_RATE",
    name: "오차율",
    minWidth: 80,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 0,
    summaryRow: {
      visible: true,
      resultFn: function(field, summary) {
        if (field == "ERROR_RATE") {
          var result = Math.round((summary.ERROR_CNT / summary.TOTAL_CNT) * 10000) / 100;
          return isNaN(result) ? 0 : result;
        } else {
          return summary[field];
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LK04010Q.RS_MASTER",
    sortCol: "INVEST_DATE",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
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

function chartDataInitialize() {

  var grdSelector = "#grdMaster";
  var grdObject = $NC.getGridGlobalVar(grdSelector);
  var chtObject = window["G_CHTMASTER"];
  var chk1Selector = "#chkQT1_Display_Div1";
  var chk2Selector = "#chkQT1_Display_Div2";

  var rowCount = grdObject.data.getLength();
  var seriesDS = [[ ], [ ]];
  if (rowCount === 0) {
    seriesDS[0].push([null]);
    seriesDS[1].push([null]);
  } else {

    var rowData;
    for (var row = 0; row < rowCount; row++) {
      rowData = grdObject.data.getItem(row);
      seriesDS[0].push([rowData.INVEST_DATE, rowData.ERROR_RATE]);
      seriesDS[1].push([rowData.INVEST_DATE, rowData.ERROR_CNT]);
    }
  }

  chtObject.replot({
    series: [{
      show: $NC.getValue(chk1Selector) === "Y"
    }, {
      show: $NC.getValue(chk2Selector) === "Y"
    }],
    data: seriesDS
  });
}

function chartInitialize(chartId, seriesTitle) {

  var series = [ ];
  for ( var index in seriesTitle) {
    series.push({
      label: seriesTitle[index]
    });
  }

  var chtObject = $.jqplot(chartId, [[[null]], [[null]]], {
    highlighter: {
      show: true,
      sizeAdjust: 10,
      tooltipOffset: 9
    },
    grid: {
      borderWidth: 1,
      background: "#fbfbfb",
      borderColor: "#a6c9e2",
      shadowOffset: 1,
      shadowWidth: 2,
      shadowDepth: 2
    },
    legend: {
      show: true,
      placement: "inside"
    },
    series: series,
    axesDefaults: {
      rendererOptions: {
        baselineWidth: 1.5,
        baselineColor: "#888888",
        drawBaseline: true
      }
    },
    axes: {
      xaxis: {
        renderer: $.jqplot.DateAxisRenderer,
        tickOptions: {
          formatString: "%y/%m"
        }
      },
      yaxis: {
        min: 0,
        tickOptions: {
          formatString: "%d"
        }
      }
    }
  });

  window["G_" + chartId.toUpperCase()] = chtObject;
}

function onGetMaster(ajaxData) {

  var grdSelector = "#grdMaster";
  var grdObject = $NC.getGridGlobalVar(grdSelector);

  $NC.setInitGridData(grdObject, ajaxData);
  if (grdObject.data.getLength() > 0) {
    $NC.setGridSelectRow(grdObject, 0);
  } else {
    $NC.setGridDisplayRows(grdSelector, 0, 0);
  }

  chartDataInitialize();

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onChangingCondition() {

  // 첫번째 탭이 아닌 탭에서 초기화시 첫번째 탭 차트에서 오류... 원인불명
  // 첫번째 탭으로 이동 후 초기화하고 원래 탭으로 이동
  var grdSelector = "#grdMaster";
  var grdObject = $NC.getGridGlobalVar(grdSelector);
  $NC.clearGridData(grdObject);

  var chtObject = window["G_CHTMASTER"];
  chtObject.replot({
    data: [[[null]], [[null]]]
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