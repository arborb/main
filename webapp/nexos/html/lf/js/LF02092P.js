/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 버튼 클릭 이벤트 연결
  $("#btnCancel").click(onCancel);
  $("#btnCopy").click(_Save);

  $("#btnCarrier_Cd1").click(showCarrierPopup1);

  $("#btnCarrier_Cd2").click(showCarrierPopup2);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtCarrier_Cd1", $NC.G_VAR.userData.P_CARRIER_CD);
  $NC.setValue("#edtCarrier_Nm1", $NC.G_VAR.userData.P_CARRIER_NM);

  $NC.setFocus("#edtCarrier_Cd2");
}

/**
 * 화면 리사이즈 Offset 계산
 */
function _SetResizeOffset() {
  // $NC.G_OFFSET.leftViewWidth = 300;
  // $NC.G_OFFSET.bottomViewHeight = $("#divBottomView").outerHeight(true);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  // var clientWidth = parent.width();
  // var clientHeight = parent.height() - $NC.G_OFFSET.bottomViewHeight - $NC.G_LAYOUT.border1;

  // $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  // clientWidth = $NC.G_OFFSET.leftViewWidth;
  // clientHeight -= $NC.G_LAYOUT.border1;

  // $NC.resizeContainer("#divLeftView", clientWidth, clientHeight);
  // $NC.resizeContainer("#divRightView", clientWidth + 1, clientHeight);
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

/**
 * 조회
 */
function _Inquiry() {
}

/**
 * 신규
 */
function _New() {
}

/**
 * 저장
 */
function _Save() {
  var CARRIER_CD1 = $NC.getValue("#edtCarrier_Cd1");
  if ($NC.isNull(CARRIER_CD1)) {
    alert("기준운송사를 선택하십시오.");
    $NC.setFocus("#edtCarrier_Cd1");
    return;
  }
  var CARRIER_CD2 = $NC.getValue("#edtCarrier_Cd2");
  if ($NC.isNull(CARRIER_CD2)) {
    alert("대상운송사를 선택하십시오.");
    $NC.setFocus("#edtCarrier_Cd2");
    return;
  }

  $NC.serviceCall("/LF02091E/callBrandCopy.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_FROM_CARRIER_CD: CARRIER_CD1,
      P_TO_CARRIER_CD: CARRIER_CD2,
      P_REG_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onSave, onSaveError);
}

/**
 * 삭제
 */
function _Delete() {
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "CARRIER_CD1":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {

        P_CARRIER_CD1: val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getCarrierInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onCarrierPopup1(O_RESULT_DATA[0]);
    } else {
      $NP.showCarrierPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onCarrierPopup1, onCarrierPopup1);
    }
    return;
  case "CARRIER_CD2":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CARRIER_CD2: val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getCarrierInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onCarrierPopup2(O_RESULT_DATA[0]);
    } else {
      $NP.showCarrierPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onCarrierPopup2, onCarrierPopup2);
    }
    return;

  }

}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {
  var id = view.prop("id").substr(3).toUpperCase();
  grdMasterOnCellChange(e, {
    col: id,
    val: val
  });
}

/**
 * 사용자정보 데이터 변경 시.
 * 
 * @param e
 * @param args
 */
function grdMasterOnCellChange(e, args) {

  switch (args.col) {
  case "CARRIER_CD1":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {

        P_CARRIER_CD1: val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getCarrierInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onCarrierPopup1(O_RESULT_DATA[0]);
    } else {
      $NP.showCarrierPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onCarrierPopup1, onCarrierPopup1);
    }
    return;
  case "CARRIER_CD2":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_CARRIER_CD2: val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getCarrierInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onCarrierPopup2(O_RESULT_DATA[0]);
    } else {
      $NP.showCarrierPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onCarrierPopup2, onCarrierPopup2);
    }
    return;

  }
}

/**
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {
  onClose();
}

/**
 * 저장에 실패 했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showCarrierPopup1() {


  $NP.showCarrierPopup({
    P_CARRIER_CD: "%",
    P_VIEW_DIV: "2"
  }, onCarrierPopup1, function() {
    $NC.setFocus("#btnOwnBrand_Cd1", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onCarrierPopup1(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtCarrier_Cd1", resultInfo.CARRIER_CD);
    $NC.setValue("#edtCarrier_Nm1", resultInfo.CARRIER_NM);
  } else {
    $NC.setValue("#edtCarrier_Cd1");
    $NC.setValue("#edtCarrier_Nm1");
    $NC.setFocus("#edtCarrier_Cd1", true);
  }
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showCarrierPopup2() {


  $NP.showCarrierPopup({
    P_CARRIER_CD: "%",
    P_VIEW_DIV: "2"
  }, onCarrierPopup2, function() {
    $NC.setFocus("#edtCarrier_Cd2", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onCarrierPopup2(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtCarrier_Cd2", resultInfo.CARRIER_CD);
    $NC.setValue("#edtCarrier_Nm2", resultInfo.CARRIER_NM);
  } else {
    $NC.setValue("#edtCarrier_Cd2");
    $NC.setValue("#edtCarrier_Nm2");
    $NC.setFocus("#edtCarrier_Cd2", true);
  }
}
