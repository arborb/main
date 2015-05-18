/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

}
  
/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width();
  var clientHeight = parent.height();
  $("#divProgressBar").css({
    "top": Math.ceil((clientHeight - 8) / 2),
    "left": Math.ceil((clientWidth - 378) / 2),
  }).progressbar({
    value: false
  }).children().css("background-color", "#e6e6e6");
  $("#divProgress").css({
    "top": Math.ceil((clientHeight - 30) / 2),
    "left": Math.ceil((clientWidth - 400) / 2)
  });
}

/**
 * Load Complete Event
 */
function _OnPopupOpen() {

  var params = {
    P_REPORT_FILE: $NC.G_VAR.userData.reportDoc,
    P_QUERY_ID: $NC.G_VAR.userData.queryId,
    P_QUERY_PARAMS: "",
    P_CHECKED_VALUE: "",
    P_PRINTER_NM: "",
    P_SILENT_PRINTER_NM: "",
    P_INTERNAL_QUERY_YN: "N",
    P_PRINT_COPY: 1,
    P_CHECKED_VALUE: "",
    P_OTHER_TEMPO: "",
    P_SILENT_PRINT_YN: "N",
    PRINT_DIV: $NC.G_VAR.userData.PRINT_DIV
  };

  if (!$NC.isNull($NC.G_VAR.userData.checkedValue)) {
    params.P_CHECKED_VALUE = $NC.G_VAR.userData.checkedValue;
  }

  if (!$NC.isNull($NC.G_VAR.userData.otherTempo)) {
    params.P_OTHER_TEMPO = $NC.G_VAR.userData.otherTempo;
  }

  if (!$NC.isNull($NC.G_VAR.userData.printerName)) {
    params.P_PRINTER_NM = $NC.G_VAR.userData.printerName;
  }

  if (!$NC.isNull($NC.G_VAR.userData.silentPrinterName)) {
    params.P_SILENT_PRINTER_NM = $NC.G_VAR.userData.silentPrinterName;
  }

  if (!$NC.isNull($NC.G_VAR.userData.queryParams)) {
    params.P_QUERY_PARAMS = $NC.getParams($NC.G_VAR.userData.queryParams);
  }

  if (!$NC.isNull($NC.G_VAR.userData.internalQueryYn)) {
    params.P_INTERNAL_QUERY_YN = $NC.G_VAR.userData.internalQueryYn;
  }

  if (!$NC.isNull($NC.G_VAR.userData.printCopy)) {
    params.P_PRINT_COPY = $NC.G_VAR.userData.printCopy;
  }

  params.P_USER_ID = $NC.G_USERINFO.USER_ID;
  params.P_USER_NM = $NC.G_USERINFO.USER_NM;

  params.P_PRINT_LI_BILL = $NC.G_USERINFO.PRINT_LI_BILL;
  params.P_PRINT_LO_BILL = $NC.G_USERINFO.PRINT_LO_BILL;
  params.P_PRINT_RI_BILL = $NC.G_USERINFO.PRINT_RI_BILL;
  params.P_PRINT_RO_BILL = $NC.G_USERINFO.PRINT_RO_BILL;
  params.P_PRINT_LO_BOX = $NC.G_USERINFO.PRINT_LO_BOX;
  params.P_PRINT_WB_NO = $NC.G_USERINFO.PRINT_WB_NO;
  params.P_PRINT_CARD = $NC.G_USERINFO.PRINT_CARD;
  params.P_PRINT_SHIP_ID = $NC.G_USERINFO.PRINT_SHIP_ID;
  params.P_PRINT_LOCATION_ID = $NC.G_USERINFO.PRINT_LOCATION_ID;
  params.P_PRINT_INBOUND_SEQ = $NC.G_USERINFO.PRINT_INBOUND_SEQ;

  params = $NC.getParams(params, false);

  // IE 문제로 body 크기지정
  $("body").css({
    width: $NC.G_JWINDOW.get("width"),
    height: $NC.G_JWINDOW.get("height")
  });

  reportPopupName = "reportPreviewIFrame";
  var reportForm = $("#reportForm");
  reportForm.empty().attr({
    method: "post",
    action: "/report.do",
    target: reportPopupName
  });
  for ( var paramName in params) {
    var paramValue = params[paramName];
    $("<input/>", {
      id: paramName,
      type: "hidden",
      name: paramName,
      value: paramValue
    }).appendTo(reportForm);
  }

  reportForm.submit();

  if ($.browser.msie && $.browser.versionNumber < 11) {
    $("#reportPreviewIFrame")[0].onreadystatechange = function() {
      var localIFrame = $("#reportPreviewIFrame");
      var readyState = localIFrame[0].readyState;
      if (readyState != "loading" && readyState != "uninitialized") {
        localIFrame[0].onreadystatechange = null;
        $("#divProgressBar").progressbar("destroy").remove();
        $("#divProgress").remove();
        var ajaxData = null;
        try {
          $(localIFrame[0].contentDocument.body).css("color", "gray").text();
        } catch (e) {
        }
        if (!$NC.isNull(ajaxData)) {
          $NC.onError(ajaxData);
          setTimeout(function() {
            onCancel();
          }, 500);
        }
      }
    };
  } else {
    $("#reportPreviewIFrame").bind(
        "load",
        function() {
          $("#divProgressBar").progressbar("destroy").remove();
          $("#divProgress").remove();
          var ajaxData = null;
          try {
            ajaxData = $($("#reportPreviewIFrame")[0].contentDocument.body).css("color", "gray").text();
          } catch (e) {
          }
          if (!$NC.isNull(ajaxData)) {
            $NC.onError(ajaxData);
            setTimeout(function() {
              onCancel();
            }, 500);
          }
          $NC.resizeContainer("#reportPreviewIFrame", $("#ifraCommonPopupPrintPreview").width(), $(
              "#ifraCommonPopupPrintPreview").height());
        });
  }

  // 라벨출력시 출력버튼 표시
  if ($NC.G_VAR.userData.print_div == '2') {
    $('#btnPrint').parent().show().on('click', function(){
      $NC.G_VAR.userData.printFn();
    })
  }
}

/**
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

  $NC.setPopupCloseAction("CANCEL");
  $NC.onPopupClose();
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

  $NC.setPopupCloseAction("OK");
  $NC.onPopupClose();
}