/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  $NC.setValue("#chkSunDay", "Y");

  // 버튼 클릭 이벤트 연결
  $("#btnOk").click(onWorkDateCreate);
  $("#btnCancel").click(onCancel);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setFocus("#edtTo_Bu_Cd");
}

function _SetResizeOffset() {

  $NC.G_OFFSET.bootomHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.bootomHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);
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

}

/**
 * 삭제
 */
function _Delete() {

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

function onWorkDateCreate() {

  var HOLIDAY_WEEK = ($NC.isNull($NC.getValue("#chkSunDay")) ? "0" : "1")
      + ($NC.isNull($NC.getValue("#chkMonDay")) ? "0" : "1") + ($NC.isNull($NC.getValue("#chkTueDay")) ? "0" : "1")
      + ($NC.isNull($NC.getValue("#chkWedDay")) ? "0" : "1") + ($NC.isNull($NC.getValue("#chkThuDay")) ? "0" : "1")
      + ($NC.isNull($NC.getValue("#chkFriDay")) ? "0" : "1") + ($NC.isNull($NC.getValue("#chkSatDay")) ? "0" : "1");

  $NC.serviceCall("/CM09010E/setWorkCalenderCreate.do", {
    P_QUERY_ID: "CM_WORKCALENDER_CREATE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_INOUT_MONTH: $NC.G_VAR.userData.P_INOUT_MONTH,
      P_HOLIDAY_WEEK: HOLIDAY_WEEK,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, function() {
    onClose();
  });
}
