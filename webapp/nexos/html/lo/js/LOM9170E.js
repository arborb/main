/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({

  });

  $NC.G_JWINDOW.set({
    "minWidth": 1050,
    "minHeight": 690
  });
  var oldOnFocus = $NC.G_JWINDOW.get("onFocus");
  $NC.G_JWINDOW.set("onFocus", function() {
    oldOnFocus.call(this, $NC.G_JWINDOW);
    setFocusScan();
  });


  $("#divMasterView").mousedown(function(e) {
    e.stopImmediatePropagation();
    e.preventDefault();

    setTimeout(function() {
      setFocusScan();
    }, 100);
  });

  // 최대화
  $NC.G_JWINDOW.maximise(function() {
    setFocusScan();
  });
  setFocusScan();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnLoaded() {

}

function _SetResizeOffset() {

  $NC.G_OFFSET.masterInfoMinLine = 2;
  $NC.G_OFFSET.masterInfoMaxLine = 4;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $("#divBottomView").outerHeight(true)
      + $NC.G_LAYOUT.nonClientHeight - 1;
  $NC.G_OFFSET.subConditionHeight = $("#divSubConditionView").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divCenterView", clientWidth, clientHeight);
  resizeVal = $NC.G_OFFSET.masterInfoMaxLine;
  if (clientHeight < 600) {
    resizeVal = Math.min(Math.max($NC.G_OFFSET.masterInfoMaxLine - Math.ceil((600 - clientHeight) / 35),
        $NC.G_OFFSET.masterInfoMinLine), $NC.G_OFFSET.masterInfoMaxLine);
  }
  resizeView = $("#tblMasterInfoView");
}

/**
 * Key Up Event
 * 
 * @param e
 * @param view
 */

function _OnInputKeyUp(e, view) {

  var id = view.prop("id").substr(3).toUpperCase();

  switch (id) {
  case "SCAN":
    if (e.keyCode == 13) {

      var scanVal = "";
      scanVal = $NC.getValue(view);

      scanVal = scanVal.toUpperCase();
      if ($NC.isNull(scanVal)) {
        e.stopImmediatePropagation();
        return;
      }
      $NC.setValue("#edtScan", scanVal);

      // 송장번호 바코드 스캔

      _Inquiry();
    }

    if (e.keyCode == 8) {

      $NC.setValue("#edtScan");
      $NC.setValue("#edtMessage");
      // 송장번호 바코드 스캔
      e.stopImmediatePropagation();
      return;
    }

    break;
  }
}

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

}

/**
 * 조회조건이 변경될 때 호출
 */

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */

function onGetReport(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData) && resultData.length) {
    
    var rowData;
    
    rowData = resultData[0];
    $NC.setValue("#edtOrder_Info", rowData.ORDER_INFO);
    $NC.setValue("#edtPoc_Result", rowData.POC_RESULT);
    $NC.setValue("#edtShowMessage", rowData.SHOW_MESSAGE);
    $NC.setValue("#edtScan", "");
  } 
 
  if(!resultData.length){
    $NC.setValue("#edtOrder_Info", "존재하지 않는 송장번호 입니다.");
    $NC.setValue("#edtScan", "");
  }
}

function _Inquiry() {

  // 데이터 조회
  $NC.serviceCall("/LOM9080Q/getDataSet.do", {
    P_QUERY_ID: "LOM9170E.RS_MASTER",
    P_QUERY_PARAMS: $NC.getParams({
    P_SCAN_INFO: $NC.getValue("#edtScan")
    })
  }, onGetReport);
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
 */
function _Print(printIndex, printName) {

}




function setItemInfoValue(rowData) {

  // 상품 정보 세팅
  if ($NC.isNull(rowData)) {
    rowData = {};
  }

  if (rowData.ORDER_STATUS_YN == 'N' && rowData.ORDER_HOLD_YN == 'N' && rowData.ORDER_YN == 'N') {
    // $NC.setEnable("#btnShip", false);
    // $NC.setEnable("#lblShip_Yn", false);
  } else if (rowData.ORDER_STATUS_YN == 'Y') {
    // $NC.setEnable("#btnShip", true);
    // $NC.setEnable("#lblShip_Yn", false);
  }
  // Row 데이터로 에디터 세팅
  $NC.setValue("#edtPick_Box_No", rowData.PICK_BOX_NO);
  $NC.setValue("#edtPick_Seq", rowData.PICK_SEQ);
  $NC.setValue("#edtOrder_Info", rowData.ORDER_INFO);
  $NC.setValue("#edtPoc_Reault", rowData.POC_REAULT);
  $NC.setValue("#edtShowMessage", rowData.SHOW_MESSAGE);

}

/**
 * 출고예정내역 조회
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {

    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        // selectKey: ["BRAND_CD", "ITEM_CD"],
        selectKey: "PICK_BOX_NO",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
    // $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

}

/**
 * 스캔 포인트 포커스 이동, 초기화
 */
function setFocusScan() {

  $NC.setFocus("#edtScan");
  $NC.setValue("#edtOrder_Info");
  $NC.setValue("#edtPoc_Result");
  $NC.setValue("#edtShowMessage");
}
