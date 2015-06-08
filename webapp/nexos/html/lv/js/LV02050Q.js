/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({});

  // 그리드 초기화
  grdMasterInitialize();
  pieChartInitialize("chtMaster");

  // 팝업 클릭 이벤트
  $("#btnQBrand_Cd").click(showBrandPopup);
  $("#btnQItem_Cd").click(showItemPopup);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.ChartHeightOffset = 250;
  $NC.G_OFFSET.ChartWidthOffset = 200;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width();
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  var leftWidth = $NC.G_OFFSET.ChartWidthOffset;
  var rightWidth = clientWidth - $NC.G_OFFSET.ChartWidthOffset - $NC.G_LAYOUT.margin2;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);
  $NC.resizeContainer("#divLeftView", leftWidth, clientHeight  - $NC.G_LAYOUT.border1);
  $NC.resizeContainer("#divRightView", rightWidth, clientHeight - $NC.G_LAYOUT.border1);
  $NC.resizeGrid("#grdMaster", rightWidth, clientHeight - $NC.G_LAYOUT.header);
  resizeChartContainer("#chtMaster", leftWidth, $NC.G_OFFSET.ChartHeightOffset);

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

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_BRAND_CD: val,
        P_VIEW_DIV: '2'
      };
      O_RESULT_DATA = $NP.getBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBrandPopup, onBrandPopup);
    }
    return;
  case "ITEM_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
      if ($NC.isNull(BRAND_CD)) {
        alert("브랜드를 먼저 선택하십시오.");
        $NC.setValue("#edtQItem_Cd");
        $NC.setFocus("#edtQBrand_Cd");
        return;
      }

      P_QUERY_PARAMS = {
        P_BRAND_CD: BRAND_CD,
        P_ITEM_CD: val,
        P_VIEW_DIV: "2",
        P_DEPART_CD: "%",
        P_LINE_CD: "%",
        P_CLASS_CD: "%"
      };
      O_RESULT_DATA = $NP.getItemInfo({
        queryId: "WC.POP_CMBRANDITEM",
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onItemPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showItemPopup({
        queryId: "WC.POP_CMBRANDITEM",
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onItemPopup, onItemPopup);
    }
    return;
  }

  // 조회 조건에 Object Change
  onChangingCondition();
}

/**
 * 조회조건이 변경될 때 호출
 */
function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDMASTER);
  clearPieChart();

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

  var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
  if ($NC.isNull(BRAND_CD)) {
    alert("브랜드를 선택하십시오.");
    $NC.setFocus("#edtQBrand_Cd");
    return;
  }
  var ITEM_CD = $NC.getValue("#edtQItem_Cd");
  if ($NC.isNull(ITEM_CD)) {
    alert("상품을 선택하십시오.");
    $NC.setFocus("#edtQItem_Cd");
    return;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: ITEM_CD
  });

  // 데이터 조회
  $NC.serviceCall("/LV02050Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

function pieChartInitialize(chartId) {

  var chtObject = $.jqplot(chartId, [["", 0]], {
    title: {
      rendererOptions: {
        position: "bottom",
        textAlign: "center"
      }
    },
    series: [{
      color: "rgba(29, 162, 224, .9)",
      pointLabels: {
        location: "s"
      }
    }],
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
      background: "#fff",
      drawBorder: false,
      shadow: false
    },
    gridPadding: {
      top: 0,
      bottom: 0,
      left: 5,
      right: 5
    }
  // seriesDefaults: {
  // renderer: $.jqplot.PieRenderer,
  // rendererOptions: {
  // sliceMargin: 2,
  // startAngle: 90,
  // padding: 5,
  // showDataLabels: true,
  // shadowDepth: 1,
  // dataLabels: "value"
  // }
  // },
  // grid: {
  // background: "#fbfbfb",
  // drawBorder: false,
  // shadowOffset: 0,
  // shadowAngle: 90,
  // shadowWidth: 2,
  // shadowDepth: 1
  // },
  //
  // gridPadding: {
  // top: 2,
  // bottom: 0,
  // left: 2,
  // right: 2
  // }
  });

  window["G_" + chartId.toUpperCase()] = chtObject;
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CENTER_CD_NM",
    field: "CENTER_NM",
    name: "물류센터",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "VALID_DATE",
    field: "VALID_DATE",
    name: "유통기한",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BATCH_NO",
    field: "BATCH_NO",
    name: "제조배치번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "INBOUND_DATE",
    field: "INBOUND_DATE",
    name: "입고일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "STOCK_QTY",
    field: "STOCK_QTY",
    name: "재고수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "PSTOCK_QTY",
    field: "PSTOCK_QTY",
    name: "가용재고",
    minWidth: 80,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LV02050Q.RS_MASTER",
    sortCol: "CENTER_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTER, 0);
    var TOTAL_STOCK_QTY = 0;
    var seriesDS = [[ ]];
    var label = [ ];

    var rowData;
    for (var i = 0; i < G_GRDMASTER.data.getLength(); i++) {
      rowData = G_GRDMASTER.data.getItem(i);
      if (rowData.FIRST_YN == "Y") {
        seriesDS[0].push([rowData.CENTER_NM, rowData.SUM_STOCK_QTY]);
        label.push('<div class="ui-lbl-pie">' + rowData.CENTER_NM + ' : ' + rowData.SUM_STOCK_QTY + '</div>');
        TOTAL_STOCK_QTY += rowData.SUM_STOCK_QTY;
      }
    }

    $("#divTotalQty").html("보유재고 : " + TOTAL_STOCK_QTY);
    window["G_CHTMASTER"].replot({
      data: seriesDS,
      seriesDefaults: {
        rendererOptions: {
          dataLabels: label
        }
      }
    });
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
    clearPieChart();
  }

}

function clearPieChart() {

  window["G_CHTMASTER"].replot({
    data: [['', 0]],
    seriesDefaults: {
      rendererOptions: {
        dataLabels: null
      }
    }
  });

  $("#divTotalQty").html("");
}

/**
 * 검색조건의 브랜드 검색 이미지 클릭
 */
function showBrandPopup() {

  $NP.showBrandPopup({
    P_BRAND_CD: "%",
    P_VIEW_DIV: '2'
  }, onBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

function onBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  
  $NC.setValue("#edtQItem_Cd");
  $NC.setValue("#edtQItem_Nm");

  onChangingCondition();
}

/**
 * 상품 검색 팝업 표시
 */
function showItemPopup() {

  var BRAND_CD = $NC.getValue("#edtQBrand_Cd");
  if ($NC.isNull(BRAND_CD)) {
    alert("브랜드를 먼저 선택하십시오.");
    $NC.setValue("#edtQBrand_Cd");
    $NC.setFocus("#edtQBrand_Cd");
    return;
  }

  P_QUERY_PARAMS = {
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: "%",
    P_VIEW_DIV: "2",
    P_DEPART_CD: "%",
    P_LINE_CD: "%",
    P_CLASS_CD: "%"
  };
  $NP.showItemPopup({
    queryId: "WC.POP_CMBRANDITEM",
    queryParams: P_QUERY_PARAMS,
  }, onItemPopup, function() {
    $NC.setFocus("#edtQItem_Cd", true);
  });

}

function onItemPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQItem_Cd", resultInfo.ITEM_CD);
    $NC.setValue("#edtQItem_Nm", resultInfo.ITEM_NM);
  } else {
    $NC.setValue("#edtQItem_Cd");
    $NC.setValue("#edtQItem_Nm");
    $NC.setFocus("#edtQItem_Cd", true);
  }
  onChangingCondition();
}
