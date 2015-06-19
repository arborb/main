/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    CLIENT1: ""
  });



  

  // 합포장가능여부 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "PASS_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboPass_Div",
    codeField: "CODE_CD",
    nameField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboPass_Div");
    }
  });
  
  // 합포장가능여부 콤보
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "SESSION_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboSession_item_Reference",
    codeField: "CODE_CD",
    nameField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboSession_item_Reference");
      
      
      _Inquiry();
      
    }
  });


  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.nonClientHeight = $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {
  var id = view.prop("id").substr(3).toUpperCase();
  masterOnCellChange(e, {
    view: view,
    col: id,
    val: val
  });
}

function masterOnCellChange(e, args) {

  var col = args.col.split("_");
  if (col[3] == "2") {
    return;
  }

  switch (args.col) {
  case "PASS_DIV":
    $NC.G_VAR.CLIENT1.PASS_DIV = args.val;
    break;
  case "PASS_ITEM_REFERENCE":
    $NC.G_VAR.CLIENT1.PASS_ITEM_REFERENCE = args.val;
    break;
  case "SESSION_ITEM_REFERENCE":
    $NC.G_VAR.CLIENT1.SESSION_ITEM_REFERENCE = args.val;
    break;
  }

  if ($NC.G_VAR.CLIENT1.CRUD === "R") {
    $NC.G_VAR.CLIENT1.CRUD = "U";
  }
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 데이터 조회
  $NC.serviceCall("/CS01080E/getDataSet.do", {
    P_QUERY_ID: "CS01080E.RS_MASTER",
    P_QUERY_PARAMS: $NC.getParams({
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onGetClientIp);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  
  
  var CLIENT1_CRUD;

  if ($NC.isNull($NC.G_VAR.CLIENT1.PASS_ITEM_REFERENCE)) {
    alert("숫자를 입력하세요.");
    $NC.setFocus("#edtPass_Item_Reference");
    return;
  }
  
  if ($NC.isNull($NC.G_VAR.CLIENT1)) {
    CLIENT1_CRUD = "C";
  } else {
    CLIENT1_CRUD = "U";
  }

  var saveDS = [ ];
  var subDS = [ ];
  var saveData;
  if ($NC.G_VAR.CLIENT1.CRUD !== "R") {
    saveData = {
      P_USER_ID: $NC.G_USERINFO.USER_ID,
      P_PRINT_LI_BILL: $NC.G_VAR.CLIENT1.PASS_DIV,
      P_PRINT_LO_BILL: $NC.G_VAR.CLIENT1.PASS_ITEM_REFERENCE,
      P_PRINT_RI_BILL: $NC.G_VAR.CLIENT1.SESSION_ITEM_REFERENCE,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    };
    saveDS.push(saveData);
  }

  saveData = {
    
    P_PASS_DIV: $NC.getValue("#cboPass_Div"),
    P_PASS_ITEM_REFERENCE: $NC.getValue("#edtPass_Item_Reference"),
    P_SESSION_ITEM_REFERENCE: $NC.getValue("#cboSession_item_Reference"),
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_CRUD: CLIENT1_CRUD
  };
  subDS.push(saveData);

  $NC.serviceCall("/CS01080E/save.do", {
    P_DS_MASTER: $NC.toJson(saveDS),
    P_DS_SUB: $NC.toJson(subDS),
    P_REG_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave);
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

}

function onGetClientIp(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    $NC.G_VAR.CLIENT1 = resultData[0];
    //$NC.G_VAR.CLIENT1 = resultData[1];

    if ($NC.G_VAR.CLIENT1) {
      $NC.setValue("#cboPass_Div", $NC.G_VAR.CLIENT1.PASS_DIV);
      $NC.setValue("#edtPass_Item_Reference", $NC.G_VAR.CLIENT1.PASS_ITEM_REFERENCE);
      $NC.setValue("#cboSession_item_Reference", $NC.G_VAR.CLIENT1.SESSION_ITEM_REFERENCE);
    }

  }
}

function onSave(ajaxData) {

  _Inquiry();
}




function onlyNumber(event) {
    var key = window.event ? event.keyCode : event.which;    

    if ((event.shiftKey == false) && ((key  > 47 && key  < 58) || (key  > 95 && key  < 106)
    || key  == 35 || key  == 36 || key  == 37 || key  == 39  // 방향키 좌우,home,end  
    || key  == 8  || key  == 46 ) 
    ) {
        return true;
    }else {
        return false;
    }    
};

