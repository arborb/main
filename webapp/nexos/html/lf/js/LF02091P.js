/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 버튼 클릭 이벤트 연결
  $("#btnCancel").click(onCancel);
  $("#btnCopy").click(_Save);

  $("#btnOwnBrand_Cd1").click(showOwnBranPopup1);

  $("#btnOwnBrand_Cd2").click(showOwnBranPopup2);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtOwnBrand_Cd1", $NC.G_VAR.userData.P_OWN_BRAND_CD);
  $NC.setValue("#edtOwnBrand_Nm1", $NC.G_VAR.userData.P_OWN_BRAND_NM);
  
  $NC.setFocus("#edtOwnBrand_Cd2");
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

  var BRAND_CD1 = $NC.getValue("#edtOwnBrand_Cd1");
  if ($NC.isNull(BRAND_CD1)) {
    alert("기준위탁사를 선택하십시오.");
    $NC.setFocus("#edtOwnBrand_Cd1");
    return;
  }
  var BRAND_CD2 = $NC.getValue("#edtOwnBrand_Cd2");
  if ($NC.isNull(BRAND_CD2)) {
    alert("대상위탁사를 선택하십시오.");
    $NC.setFocus("#edtOwnBrand_Cd2");
    return;
  }

  $NC.serviceCall("/LF02090E/callBrandCopy.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_FROM_BRAND_CD: BRAND_CD1,
      P_TO_BRAND_CD: BRAND_CD2,
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
  case "OWNBRAND_CD1":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup1(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBranPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup1, onOwnBrandPopup1);
    }
    return;
  case "OWNBRAND_CD2":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup2(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBranPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup2, onOwnBrandPopup2);
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
  case "OWNBRAND_CD1":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup1(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBranPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup1, onOwnBrandPopup1);
    }
    return;
  case "OWNBRAND_CD2":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup2(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBranPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup2, onOwnBrandPopup2);
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
function showOwnBranPopup1() {

  var BU_CD = $NC.G_VAR.userData.P_BU_CD;

  $NP.showOwnBranPopup({
    P_CUST_CD: '0000',
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup1, function() {
    $NC.setFocus("#btnOwnBrand_Cd1", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onOwnBrandPopup1(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtOwnBrand_Cd1", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtOwnBrand_Nm1", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtOwnBrand_Cd1");
    $NC.setValue("#edtOwnBrand_Nm1");
    $NC.setFocus("#edtOwnBrand_Cd1", true);
  }
}

/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup2() {

  var BU_CD = $NC.G_VAR.userData.P_BU_CD;

  $NP.showOwnBranPopup({
    P_CUST_CD: '0000',
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup2, function() {
    $NC.setFocus("#edtOwnBrand_Cd2", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onOwnBrandPopup2(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtOwnBrand_Cd2", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtOwnBrand_Nm2", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtOwnBrand_Cd2");
    $NC.setValue("#edtOwnBrand_Nm2");
    $NC.setFocus("#edtOwnBrand_Cd2", true);
  }
}
