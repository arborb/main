/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 버튼 클릭 이벤트 연결
  $("#btnOk").click(_Save);
  $("#btnCancel").click(onCancel);
  $("#btnLogout").click(onLogout);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtUser_Id", $NC.G_USERINFO.USER_ID);
  $NC.setValue("#edtUser_Nm", $NC.G_USERINFO.USER_NM);

  $NC.setFocus("#edtUser_Pwd");
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.clientHeight = 175;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  $NC.resizeContainer("#divMasterView", parent.width() - $NC.G_LAYOUT.border1, $NC.G_OFFSET.clientHeight);
}

/**
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

  $NC.setPopupCloseAction("CANCEL");
  $NC.onPopupClose();
}

/**
 * 로그아웃 버튼 클릭 이벤트
 */
function onLogout() {
  $NC.serviceCall("/WC/getLogout.do", {
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, function(){
    parent.location.reload();
  });
  $NC.G_USERINFO = null;
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose() {

  $NC.setPopupCloseAction("OK");
  $NC.onPopupClose();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

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

  var USER_PWD = $NC.getValue("#edtUser_Pwd");
  if ($NC.isNull(USER_PWD)) {
    alert("현재 비밀번호를 입력하십시오.");
    $NC.setFocus("#edtUser_Pwd");
    return;
  }

  var SAVED_USER_PWD = $NC.G_USERINFO.USER_PWD;
  if (SAVED_USER_PWD.substr(0, 4) == "ENC(" && SAVED_USER_PWD.substr(SAVED_USER_PWD.length - 1) == ")") {
    var USER_PWD_SHA = new jsSHA(USER_PWD, "TEXT");
    var ENC_USER_PWD = "ENC(" + USER_PWD_SHA.getHash("SHA-512", "HEX") + ")";
    if (SAVED_USER_PWD !== ENC_USER_PWD) {
      alert("현재 비밀번호가 잘못되었습니다.\n\n다시 입력하십시오.");
      $NC.setFocus("#edtUser_Pwd");
      return;
    }
  } else {
    if (USER_PWD !== $NC.G_USERINFO.USER_PWD) {
      alert("현재 비밀번호가 잘못되었습니다.\n\n다시 입력하십시오.");
      $NC.setFocus("#edtUser_Pwd");
      return;
    }
  }

  var NEW_USER_PWD1 = $NC.getValue("#edtNew_User_Pwd1");
  if ($NC.isNull(NEW_USER_PWD1)) {
    alert("변경 비밀번호를 입력하십시오.");
    $NC.setFocus("#edtNew_User_Pwd1");
    return;
  }
  if (USER_PWD === NEW_USER_PWD1) {
    alert("현재 비밀번호와 변경 비밀번호가 같습니다.\n\n다시 입력하십시오.");
    $NC.setFocus("#edtNew_User_Pwd1");
    return;
  }
  var NEW_USER_PWD2 = $NC.getValue("#edtNew_User_Pwd2");
  if ($NC.isNull(NEW_USER_PWD1)) {
    alert("확인 비밀번호를 입력하십시오.");
    $NC.setFocus("#edtNew_User_Pwd2");
    return;
  }
  if (NEW_USER_PWD1 !== NEW_USER_PWD2) {
    alert("변경 비밀번호와 확인 비밀번호가 다릅니다.\n\n다시 입력하십시오.");
    $NC.setFocus("#edtNew_User_Pwd2");
    return;
  }

  // 비밀번호 유효성 검사
  if (!devMode) {
    var varidPw = $NC.varidationPw(NEW_USER_PWD1); 
    if (!varidPw) {
      return false;
    }
  }
  $NC.serviceCall("/WC/setUserPassword.do", {
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_USER_PWD: NEW_USER_PWD1

  }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

}

function onSave() {
  $NC.serviceCall("/WC/getLogout.do", {
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onGetLogout);
}

function onGetLogout(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }
  onClose();
}