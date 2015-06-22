/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 버튼 클릭 이벤트 연결
  $("#btnOk").click(onLocationCreate);
  $("#btnCancel").click(onCancel);

}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMZONE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_ZONE_CD: "%"
    })
  }, {
    selector: "#cboZone_Cd",
    codeField: "ZONE_CD",
    fullNameField: "ZONE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboZone_Cd", $NC.G_VAR.userData.P_ZONE_CD);
    }
  });

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "LOC_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboLoc_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboLoc_Div", "1");
    }
  });

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "CELL_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboCell_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboCell_Div", "01");
    }
  });

  $NC.setValue("#edtLoc_Order", "1");
  $NC.setValue("#edtPlt_Qty", "1");
  $NC.setValue("#edtCell_Length", "0");
  $NC.setValue("#edtCell_Width", "0");
  $NC.setValue("#edtCell_Height", "0");
  $NC.setValue("#edtCell_Weight", "0");

  $NC.setFocus("#edtBank_Cd1");
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.centerHeight = $NC.G_LAYOUT.nonClientHeight + $NC.G_LAYOUT.padding2;
  $NC.G_OFFSET.bootomHeight = $NC.G_LAYOUT.topOffset + $("#divBottomView").height() + $NC.G_OFFSET.centerHeight + 15 /* top margin */;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.padding2;
  var clientHeight = parent.height() - $NC.G_OFFSET.bootomHeight;

  // Container 사이즈 조정
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

function onLocationCreate() {

  var ZONE_CD = $NC.getValue("#cboZone_Cd");
  if ($NC.isNull(ZONE_CD)) {
    alert("로케이션 존을 선택하십시오.");
    $NC.setFocus("#cboZone_Cd");
    return;
  }

  var BANK_CD1 = $NC.getValue("#edtBank_Cd1");
  if ($NC.isNull(BANK_CD1)) {
    alert("시작 행코드를 입력하십시오.");
    $NC.setFocus("#edtBank_Cd1");
    return;
  }
  if (BANK_CD1.length !== Number($NC.G_VAR.userData.P_POLICY_CM122)) {
    alert("시작 행코드 길이를 " + $NC.G_VAR.userData.P_POLICY_CM122 + "로 하셔야 합니다.");
    $NC.setFocus("#edtBank_Cd1");
    return;
  }

  var BANK_CD2 = $NC.getValue("#edtBank_Cd2");
  if ($NC.isNull(BANK_CD2)) {
    alert("종료 행코드를 입력하십시오.");
    $NC.setFocus("#edtBank_Cd2");
    return;
  }
  if (BANK_CD2.length !== Number($NC.G_VAR.userData.P_POLICY_CM122)) {
    alert("종료 행코드 길이를 " + $NC.G_VAR.userData.P_POLICY_CM122 + "로 하셔야 합니다.");
    $NC.setFocus("#edtBank_Cd2");
    return;
  }

  var BAY_CD1 = $NC.getValue("#edtBay_Cd1");
  if ($NC.isNull(BAY_CD1)) {
    alert("시작 열코드를 입력하십시오.");
    $NC.setFocus("#edtBay_Cd1");
    return;
  }
  if (BAY_CD1.length !== Number($NC.G_VAR.userData.P_POLICY_CM123)) {
    alert("시작 열코드 길이를 " + $NC.G_VAR.userData.P_POLICY_CM123 + "로 하셔야 합니다.");
    $NC.setFocus("#edtBay_Cd1");
    return;
  }

  var BAY_CD2 = $NC.getValue("#edtBay_Cd2");
  if ($NC.isNull(BAY_CD2)) {
    alert("종료 열코드를 입력하십시오.");
    $NC.setFocus("#edtBay_Cd2");
    return;
  }
  if (BAY_CD2.length !== Number($NC.G_VAR.userData.P_POLICY_CM123)) {
    alert("종료 열코드 길이를 " + $NC.G_VAR.userData.P_POLICY_CM123 + "로 하셔야 합니다.");
    $NC.setFocus("#edtBay_Cd2");
    return;
  }

  var LEV_CD1 = $NC.getValue("#edtLev_Cd1");
  if ($NC.isNull(LEV_CD1)) {
    alert("시작 단코드를 입력하십시오.");
    $NC.setFocus("#edtLev_Cd1");
    return;
  }
  if (LEV_CD1.length !== Number($NC.G_VAR.userData.P_POLICY_CM124)) {
    alert("시작 단코드 길이를 " + $NC.G_VAR.userData.P_POLICY_CM124 + "로 하셔야 합니다.");
    $NC.setFocus("#edtLev_Cd1");
    return;
  }

  var LEV_CD2 = $NC.getValue("#edtLev_Cd2");
  if ($NC.isNull(LEV_CD2)) {
    alert("종료 단코드를 입력하십시오.");
    $NC.setFocus("#edtLev_Cd2");
    return;
  }
  if (LEV_CD2.length !== Number($NC.G_VAR.userData.P_POLICY_CM124)) {
    alert("종료 단코드 길이를 " + $NC.G_VAR.userData.P_POLICY_CM124 + "로 하셔야 합니다.");
    $NC.setFocus("#edtLev_Cd2");
    return;
  }

  var LOC_DIV = $NC.getValue("#cboLoc_Div");
  if ($NC.isNull(LOC_DIV)) {
    alert("로케이션구분을 선택하십시오.");
    $NC.setFocus("#cboLoc_Div");
    return;
  }

  var CELL_DIV = $NC.getValue("#cboCell_Div");
  if ($NC.isNull(CELL_DIV)) {
    alert("셀구분을 선택하십시오.");
    $NC.setFocus("#cboCell_Div");
    return;
  }

  var PLT_QTY = $NC.getValue("#edtPlt_Qty");
  if ($NC.isNull(PLT_QTY)) {
    alert("적재팔레트수를 입력하십시오.");
    $NC.setFocus("#edtPlt_Qty");
    return;
  }
  if (Number(PLT_QTY) < 1) {
    alert("적재팔레트수에 1이상의 정수를 입력하십시오.");
    $NC.setFocus("#edtQty_In_Box");
    $NC.setGridSelectRow(G_GRDMASTER, row);
    return false;
  }

  var LOC_ORDER = $NC.getValue("#edtLoc_Order");
  var CELL_WEIGHT = $NC.getValue("#edtCell_Weight");
  var CELL_WIDTH = $NC.getValue("#edtCell_Width");
  var CELL_LENGTH = $NC.getValue("#edtCell_Length");
  var CELL_HEIGHT = $NC.getValue("#edtCell_Height");

  $NC.serviceCall("/CM01030E/setLocationCreate.do", {
    P_QUERY_ID: "CM_LOCATION_CREATE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_ZONE_CD: ZONE_CD,
      P_BANK_CD1: BANK_CD1,
      P_BANK_CD2: BANK_CD2,
      P_BAY_CD1: BAY_CD1,
      P_BAY_CD2: BAY_CD2,
      P_LEV_CD1: LEV_CD1,
      P_LEV_CD2: LEV_CD2,
      P_LOC_DIV: LOC_DIV,
      P_CELL_DIV: CELL_DIV,
      P_LOC_ORDER: LOC_ORDER,
      P_PLT_QTY: PLT_QTY,
      P_CELL_WEIGHT: CELL_WEIGHT,
      P_CELL_WIDTH: CELL_WIDTH,
      P_CELL_LENGTH: CELL_LENGTH,
      P_CELL_HEIGHT: CELL_HEIGHT,
      P_POLICY_CM120: $NC.G_VAR.userData.P_POLICY_CM120,
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
  var id = view.prop("id").substr(3).toUpperCase();
  switch (id) {
  case "BANK_CD1":
    if (val.length !== Number($NC.G_VAR.userData.P_POLICY_CM122)) {
      alert("시작 행코드 길이를 " + $NC.G_VAR.userData.P_POLICY_CM122 + "로 하셔야 합니다.");
      $NC.setFocus("#edtBank_Cd1");
    }
    val = val.toUpperCase();
    break;
  case "BANK_CD2":
    if (val.length !== Number($NC.G_VAR.userData.P_POLICY_CM122)) {
      alert("종료 행코드 길이를 " + $NC.G_VAR.userData.P_POLICY_CM122 + "로 하셔야 합니다.");
      $NC.setFocus("#edtBank_Cd2");
    }
    val = val.toUpperCase();
    break;
  case "BAY_CD1":
    if (val.length !== Number($NC.G_VAR.userData.P_POLICY_CM123)) {
      alert("시작 열코드 길이를 " + $NC.G_VAR.userData.P_POLICY_CM123 + "로 하셔야 합니다.");
      $NC.setFocus("#edtBay_Cd1");
    }
    val = val.toUpperCase();
    break;
  case "BAY_CD2":
    if (val.length !== Number($NC.G_VAR.userData.P_POLICY_CM123)) {
      alert("종료 열코드 길이를 " + $NC.G_VAR.userData.P_POLICY_CM123 + "로 하셔야 합니다.");
      $NC.setFocus("#edtBay_Cd2");
    }
    val = val.toUpperCase();
    break;
  case "LEV_CD1":
    if (val.length !== Number($NC.G_VAR.userData.P_POLICY_CM124)) {
      alert("시작 단코드 길이를 " + $NC.G_VAR.userData.P_POLICY_CM124 + "로 하셔야 합니다.");
      $NC.setFocus("#edtLev_Cd1");
    }
    val = val.toUpperCase();
    break;
  case "LEV_CD2":
    if (val.length !== Number($NC.G_VAR.userData.P_POLICY_CM124)) {
      alert("종료 단코드 길이를 " + $NC.G_VAR.userData.P_POLICY_CM124 + "로 하셔야 합니다.");
      $NC.setFocus("#edtLev_Cd2");
    }
    val = val.toUpperCase();
    break;
  }
}
