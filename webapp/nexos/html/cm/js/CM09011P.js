/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 버튼 클릭 이벤트 연결
  $("#btnOk").click(onWorkDateCopy);
  $("#btnCancel").click(onCancel);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setFocus("#edtTo_Bu_Cd");
}

function _SetResizeOffset() {

  $NC.G_OFFSET.centerHeight = $NC.G_LAYOUT.border1 + $NC.G_LAYOUT.padding2;
  $NC.G_OFFSET.bootomHeight = $NC.G_LAYOUT.topOffset + $("#divBottomView").outerHeight() + $NC.G_OFFSET.centerHeight
      + 15 /* top margin */;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.padding2;
  var clientHeight = parent.height() - $NC.G_OFFSET.bootomHeight;

  $NC.resizeContainer("#divCenterView", clientWidth, clientHeight);
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

function onWorkDateCopy() {

  var TO_BU_CD = $NC.getValue("#edtTo_Bu_Cd");
  if ($NC.isNull(TO_BU_CD)) {
    alert("복사대상 사업부를 입력하십시오.");
    $NC.setFocus("#edtTo_Bu_Cd");
    return;
  }

  $NC.serviceCall("/CM09010E/setWorkCalenderCopy.do", {
    P_QUERY_ID: "CM_WORKCALENDER_COPY",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_INOUT_MONTH: $NC.G_VAR.userData.P_INOUT_MONTH,
      P_TO_BU_CD: TO_BU_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, function() {
    onClose();
  });
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

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
}

/**
 * 사업부 검색 이미지 클릭
 */
function showBuPopup() {
  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtTo_Bu_Cd", true);
  });
}

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtTo_Bu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtTo_Bu_Nm", resultInfo.BU_NM);
  } else {
    $NC.setValue("#edtTo_Bu_Cd");
    $NC.setValue("#edtTo_Bu_Nm");
    $NC.setFocus("#edtTo_Bu_Cd", true);
  }
}
