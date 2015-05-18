/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });
  // 조회조건 - 배송유형 세팅

  // 조회조건 - 박스유형 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "BOX_TYPE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboBox_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboBox_Type");
    }
  });
  
  var oldOnFocus = $NC.G_JWINDOW.get("onFocus");
  $NC.G_JWINDOW.set("onFocus", function() {
    oldOnFocus.call(this, $NC.G_JWINDOW);
    setFocusScan();
  });
  //$("#edtScan").css("ime-mode", "disabled");
  $("#divMasterView,#divGridBox,#divBottomView").mousedown(function(e) {
    e.stopImmediatePropagation();
    e.preventDefault();

    setTimeout(function() {
      setFocusScan();
    }, 100);
  });
  // 버튼 클릭 이벤트 연결
  $("#btnCancel").click(onCancel);
  $("#btnCopy").click(_Save);

}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {



  $NC.setFocus("#edtScan");
}

/**
 * 화면 리사이즈 Offset 계산
 */
function _SetResizeOffset() {
  //$NC.G_OFFSET.leftViewWidth = 300;
  //$NC.G_OFFSET.bottomViewHeight = $("#divBottomView").outerHeight(true);
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  //var clientWidth = parent.width();
  //var clientHeight = parent.height() - $NC.G_OFFSET.bottomViewHeight - $NC.G_LAYOUT.border1;

 // $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  //clientWidth = $NC.G_OFFSET.leftViewWidth;
  //clientHeight -= $NC.G_LAYOUT.border1;

 // $NC.resizeContainer("#divLeftView", clientWidth, clientHeight);
  //$NC.resizeContainer("#divRightView", clientWidth + 1, clientHeight);
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

    var scanVal = "";
    var scanLen = 0;

    // Enter Key
    if (e.keyCode == 13) {

      scanVal = $NC.getValue(view);
      // 입력 값 길이
      scanLen = scanVal.length;

      if (scanLen == 0) {
        e.stopImmediatePropagation();
        return;
      }

      // 상품 바코드 스캔
      onScanBoxType(scanVal);

    }

    break;
  }
}



function onScanBoxType(scanVal) {

  var BOX_TYPE = scanVal;

  // 조회조건 - 박스유형 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "BOX_TYPE",
      P_CODE_CD: "%",
      P_SUB_CD1: BOX_TYPE,
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboBox_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",    
    onComplete: function() {
      var BOX_TYPE = $NC.getValue("#cboBox_Type");

      if (BOX_TYPE == "") {
        alert("존재하지 않는 BOX코드 입니다.");
        setFocusScan();
        return;
      } else {

        var BOX_TYPE1 = $NC.getValue("#cboBox_Type");
        if ($NC.isNull(BOX_TYPE1)) {
          alert("BOX유형을 입력하십시오.");
          $NC.setFocus("#cboBox_Type");
          
          return;
        }
        var paramDs1 = BOX_TYPE1;
        onClose(paramDs1);
        
      }
    }
  });

}

function setFocusScan() {
  // 조회조건 - 박스유형 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "BOX_TYPE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboBox_Type",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboBox_Type");
    }
  });
  $NC.setFocus("#edtScan");
  $NC.setValue("#edtScan");
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
function onClose(resultInfo) {

  $NC.setPopupCloseAction("OK", resultInfo );
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

  var BOX_TYPE = $NC.getValue("#cboBox_Type");
  if ($NC.isNull(BOX_TYPE)) {
    alert("BOX유형을 입력하십시오.");

    $NC.setFocus("#edtScan");
    $NC.setValue("#edtScan");
    return;
  }

  var paramDs = BOX_TYPE;

  onClose(paramDs);

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
/*
  switch (args.col) {
  case "BOX_TYPE":
    
    // 조회조건 - 박스유형 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "BOX_TYPE",
        P_CODE_CD: args.val,
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      selector: "#cboBox_Type",
      codeField: "CODE_CD",
      nameField: "CODE_NM",
      fullNameField: "CODE_CD_F",
    });
    break;
  }
  */
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
