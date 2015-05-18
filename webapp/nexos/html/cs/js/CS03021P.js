/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 버튼 클릭 이벤트 연결
  $("#btnOk").click(_Save);
  $("#btnCancel").click(onCancel);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtQCenter_Cd_F", $NC.G_VAR.userData.P_CENTER_CD_F);
  $NC.setValue("#edtQBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_VAR.userData.P_BU_NM);

  $NC.setFocus("#edtTo_Bu_Cd");
}

function _SetResizeOffset() {

  $NC.G_OFFSET.leftViewWidth = 285;
  $NC.G_OFFSET.bottomViewHeight = $("#divBottomView").outerHeight(true);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width();
  var clientHeight = parent.height() - $NC.G_OFFSET.bottomViewHeight - $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  clientHeight -= $NC.G_LAYOUT.border1;

  $NC.resizeContainer("#divLeftView", $NC.G_OFFSET.leftViewWidth, clientHeight);
  clientWidth -= $NC.G_OFFSET.leftViewWidth + $NC.G_LAYOUT.margin2 - 1;
  $NC.resizeContainer("#divRightView", clientWidth, clientHeight);
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

  var TO_BU_CD = $NC.getValue("#edtTo_Bu_Cd");
  if ($NC.isNull(TO_BU_CD)) {
    alert("사업부를 입력하십시오.");
    $NC.setFocus("#edtTo_Bu_Cd");
    return;
  }

  if (TO_BU_CD == $NC.G_VAR.userData.P_BU_CD) {
    alert("기준 사업부와 대상 사업부가 같습니다. 다른 사업부를 선택하십시오.");
    $NC.setFocus("#edtTo_Bu_Cd");
    return;
  }

  $NC.serviceCall("/CS03020E/callBuProcessCopy.do", {
    P_QUERY_ID: "CP_BUPROCESS_COPY",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_TO_BU_CD: TO_BU_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID

    })
  }, onSave);
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

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

  var id = view.prop("id").substr(3).toUpperCase();
  alert(id);
  // 브랜드 Key 입력
  switch (id) {
  case "TO_BU_CD":
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
  }
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */

function showUserBuPopup() {
  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQTo_Bu_Cd", true);
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
/**
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */

function onSave(ajaxData) {
  onClose();
}
