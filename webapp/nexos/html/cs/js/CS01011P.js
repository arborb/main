/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 버튼 클릭 이벤트 연결
  $("#btnCancel").click(onCancel);
  $("#btnCopy").click(_Save);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtFrom_User_Id", $NC.G_VAR.userData.P_USER_ID);
  $NC.setValue("#edtFrom_User_Nm", $NC.G_VAR.userData.P_USER_NM);

  $NC.setFocus("#edtUser_Id");
}

/**
 * 화면 리사이즈 Offset 계산
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.leftViewWidth = 300;
  $NC.G_OFFSET.bottomViewHeight = $("#divBottomView").outerHeight(true);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width();
  var clientHeight = parent.height() - $NC.G_OFFSET.bottomViewHeight - $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientWidth = $NC.G_OFFSET.leftViewWidth;
  clientHeight -= $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divLeftView", clientWidth, clientHeight);
  $NC.resizeContainer("#divRightView", clientWidth + 1, clientHeight);
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

  var USER_ID = $NC.getValue("#edtUser_Id");
  if ($NC.isNull(USER_ID)) {
    alert("사용자ID를 입력하십시오.");
    $NC.setFocus("#edtUser_Id");
    return;
  }

  var USER_NM = $NC.getValue("#edtUser_Nm");
  if ($NC.isNull(USER_NM)) {
    alert("사용자명을 입력하십시오.");
    $NC.setFocus("#edtUser_Nm");
    return;
  }

  var USER_PWD = $NC.getValue("#edtUser_Pwd");
  if ($NC.isNull(USER_PWD)) {
    alert("비밀번호를 입력하십시오.");
    $NC.setFocus("#edtUser_Pwd");
    return;
  }

  var FROM_USER_ID = $NC.getValue("#edtFrom_User_Id");
  if ($NC.isNull(FROM_USER_ID)) {
    alert("복사대상 사용자를 선택하십시오.");
    $NC.setFocus("#edtFrom_User_Id");
    return;
  }

  $NC.serviceCall("/CS01010E/callUserCopy.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_USER_ID: USER_ID,
      P_USER_NM: USER_NM,
      P_USER_PWD: USER_PWD,
      P_FROM_USER_ID: FROM_USER_ID,
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
  case "FROM_USER_ID":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      P_QUERY_PARAMS = {
        P_USER_ID: args.val,
        P_CERTIFY_DIV: "%"
      };
      O_RESULT_DATA = $NP.getUserInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onUserPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showUserPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onUserPopup, onUserPopup);
    }
    break;
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
 * 사용자 검색 이미지 클릭
 */
function showUserPopup() {
  $NP.showUserPopup({
    P_USER_ID: "%",
    P_CERTIFY_DIV: "%"
  }, onUserPopup, function() {
    $NC.setFocus("#edtFrom_User_Id", true);
  });
}

/**
 * 사용자 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onUserPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtFrom_User_Id", resultInfo.USER_ID);
    $NC.setValue("#edtFrom_User_Nm", resultInfo.USER_NM);
  } else {
    $NC.setValue("#edtFrom_User_Id");
    $NC.setValue("#edtFrom_User_Nm");
    $NC.setFocus("#edtFrom_User_Id", true);
  }
}
