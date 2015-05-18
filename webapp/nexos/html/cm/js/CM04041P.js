/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 버튼 클릭 이벤트 연결
  $("#btnFrom_Deal_Id").click(showDealPopup);
  $("#btnCancel").click(onCancel);
  $("#btnCopy").click(_Save);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtFrom_Deal_Id", $NC.G_VAR.userData.P_DEAL_ID);
  $NC.setValue("#edtFrom_Deal_Nm", $NC.G_VAR.userData.P_DEAL_NM);

  $NC.setFocus("#edtDeal_Id");
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

  var TO_DEAL_ID = $NC.getValue("#edtDeal_Id");
  if ($NC.isNull(TO_DEAL_ID)) {
    alert("신규 딜ID를 입력하십시오.");
    $NC.setFocus("#edtDeal_Id");
    return;
  }

  var FROM_DEAL_ID = $NC.getValue("#edtFrom_Deal_Id");
  if ($NC.isNull(FROM_DEAL_ID)) {
    alert("복사대상 딜ID를 선택하십시오.");
    $NC.setFocus("#edtFrom_Deal_Id");
    return;
  }

  $NC.serviceCall("/CM04040E/callSP.do", {
    P_QUERY_ID: "CM_DEAL_COPY",
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_FR_DEAL_ID: FROM_DEAL_ID,
      P_TO_DEAL_ID: TO_DEAL_ID,
      P_USER_ID: $NC.G_USERINFO.USER_ID
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
  case "FROM_DEAL_ID":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      P_QUERY_PARAMS = {
        P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
        P_DEAL_ID: args.val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getDealInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onDealPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showDealPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onDealPopup, onDealPopup);
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
function showDealPopup() {
  $NP.showDealPopup({
    P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
    P_DEAL_ID: "%",
    P_VIEW_DIV: "2"
  }, onDealPopup, function() {
    $NC.setFocus("#edtFrom_Deal_Id", true);
  });
}

/**
 * 사용자 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onDealPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtFrom_Deal_Id", resultInfo.DEAL_ID);
    $NC.setValue("#edtFrom_Deal_Nm", resultInfo.DEAL_NM);
  } else {
    $NC.setValue("#edtFrom_Deal_Id");
    $NC.setValue("#edtFrom_Deal_Nm");
    $NC.setFocus("#edtFrom_Deal_Id", true);
  }
}
