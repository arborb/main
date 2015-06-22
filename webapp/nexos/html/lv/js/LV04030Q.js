/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  $NC.setInitDatePicker("#dtpQAgg_Date1", null, "F");
  $NC.setInitDatePicker("#dtpQAgg_Date2");

  // 차트 초기화
  barChartInitialize("chtAreaCallCnt");
  barChartInitialize("chtAreaOutQty");
  barChartInitialize("chtDeliveryCdCallCnt");
  barChartInitialize("chtDeliveryCdOutQty");

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
  
  /*
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  */
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
  $NC.setValue("#edtQCust_Nm", $NC.G_USERINFO.CUST_NM);

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
  resizeChartContainer("#chtAreaCallCnt", leftChartWidth, topChartHeight);
  resizeChartContainer("#chtAreaOutQty", leftChartWidth, bottomChartHeight);
  resizeChartContainer("#chtDeliveryCdCallCnt", rightChartWidth, topChartHeight);
  resizeChartContainer("#chtDeliveryCdOutQty", rightChartWidth, bottomChartHeight);
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
  case "AGG_DATE1":
    $NC.setValueDatePicker(view, val, "검색 시작일자를 정확히 입력하십시오.");
    break;
  case "AGG_DATE2":
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

  var CUST_CD = $NC.getValue("#edtQCust_Cd");
  if ($NC.isNull(CUST_CD)) {
    alert("위탁사를 선택하십시오.");
    $NC.setValue("#edtQBu_Cd");
    $NC.setFocus("#edtQCust_Cd");
    return;
  }

  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);

  var AGG_DATE1 = $NC.getValue("#dtpQAgg_Date1");
  if ($NC.isNull(AGG_DATE1)) {
    alert("검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQAgg_Date1");
    return;
  }

  var AGG_DATE2 = $NC.getValue("#dtpQAgg_Date2");
  if ($NC.isNull(AGG_DATE2)) {
    alert("검색 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpQAgg_Date2");
    return;
  }

  if (AGG_DATE1 > AGG_DATE2) {
    alert("조회일자 범위 입력오류입니다.");
    $NC.setFocus("#dtpQAgg_Date1");
    return;
  }
  
  var P_QUERY_PARAMS = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_CUST_CD: CUST_CD,
    P_BU_CD: BU_CD,
    P_BRAND_CD: BRAND_CD,
    P_AGG_DATE1: AGG_DATE1,
    P_AGG_DATE2: AGG_DATE2
  });

  // 권역별 콜수, 권역별 출고수량
  $NC.serviceCall("/LV04030Q/getDataSet.do", {
    P_QUERY_ID: "LV04030Q.RS_MASTER",
    P_QUERY_PARAMS: P_QUERY_PARAMS
  }, onGetMaster);
  
  // 배송처별 콜수
  $NC.serviceCall("/LV04030Q/getDataSet.do", {
    P_QUERY_ID: "LV04030Q.RS_DETAIL",
    P_QUERY_PARAMS: P_QUERY_PARAMS
  }, onGetDetail01);
  
  // 배송처별 출고수량
  $NC.serviceCall("/LV04030Q/getDataSet.do", {
    P_QUERY_ID: "LV04030Q.RS_DETAIL",
    P_QUERY_PARAMS: P_QUERY_PARAMS
  }, onGetDetail02);

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

function barChartInitialize(chartId) {

  var chtObject = $.jqplot(chartId, [[["", 0]]], {
    seriesDefaults: {
      renderer: $.jqplot.BarRenderer,
      rendererOptions: {
        barPadding: -5,
        barWidth: 10,
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
      color: "rgba(29, 162, 224, .9)",
      pointLabels: {
        seriesLabelIndex: 1,
        location: "n"
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

function clearBarChart() {

  window["G_CHTAREACALLCNT"].replot({
    data: [[["", 0]]]
  });
  window["G_CHTAREAOUTQTY"].replot({
    data: [[["", 0]]]
  });

  window["G_CHTDELIVERYCDCALLCNT"].replot({
    data: [[["", 0]]]
  });
  window["G_CHTDELIVERYCDOUTQTY"].replot({
    data: [[["", 0]]]
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

function onGetMaster(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData) && resultData.length) {
    var seriesDS01 = [[ ]];
    var seriesDS02 = [[ ]];
    var rowData;
    for (var i = 0, resultCount = resultData.length; i < resultCount; i++) {
      rowData = resultData[i];
      seriesDS01[0].push([rowData.AREA_NM, rowData.CALL_CNT, rowData]);
      seriesDS02[0].push([rowData.AREA_NM, rowData.OUT_QTY, rowData]);
      if (i == 0) {
        var CENTER_CD = rowData.CENTER_CD;
        var CUST_CD = rowData.CUST_CD;
        var BU_CD = rowData.BU_CD;
        var BRAND_CD = rowData.BRAND_CD;
        var AGG_DATE1 = rowData.AGG_DATE1;
        var AGG_DATE2 = rowData.AGG_DATE2;
        var AREA_CD = rowData.AREA_CD;
        var QUERY_PARAMS = $NC.getParams({
          P_CENTER_CD: CENTER_CD,
          P_CUST_CD: CUST_CD,
          P_BU_CD: BU_CD,
          P_BRAND_CD: BRAND_CD,
          P_AGG_DATE1: AGG_DATE1,
          P_AGG_DATE2: AGG_DATE2,
          P_AREA_CD: AREA_CD
        });

        $NC.serviceCall("/LV04030Q/getDataSet.do", {
          P_QUERY_ID: "LV04030Q.RS_DETAIL",
          P_QUERY_PARAMS: QUERY_PARAMS
        }, onGetDetail01);
        $NC.serviceCall("/LV04030Q/getDataSet.do", {
          P_QUERY_ID: "LV04030Q.RS_DETAIL",
          P_QUERY_PARAMS: QUERY_PARAMS
        }, onGetDetail02);
      }
    }
    window["G_CHTAREACALLCNT"].replot({
      data: seriesDS01
    });
    window["G_CHTAREAOUTQTY"].replot({
      data: seriesDS02
    });
  }
}

function onGetDetail01(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData) && resultData.length) {
    var seriesDS = [[ ]];
    var rowData;
    for (var i = 0, resultCount = resultData.length; i < resultCount; i++) {
      rowData = resultData[i];
      seriesDS[0].push([rowData.DELIVERY_NM, rowData.CALL_CNT]);
    }
    window["G_CHTDELIVERYCDCALLCNT"].replot({
      data: seriesDS
    });
  }
}
function onGetDetail02(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData) && resultData.length) {
    var seriesDS = [[ ]];
    var rowData;
    for (var i = 0, resultCount = resultData.length; i < resultCount; i++) {
      rowData = resultData[i];
      seriesDS[0].push([rowData.DELIVERY_NM, rowData.OUT_QTY]);
    }
    window["G_CHTDELIVERYCDOUTQTY"].replot({
      data: seriesDS
    });
  }
}
