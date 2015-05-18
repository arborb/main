/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    CLIENT1: "",
    CLIENT2: ""
  });

  _Inquiry();

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "0";
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
  case "PRINT_LI_BILL_1":
    $NC.G_VAR.CLIENT1.PRINT_LI_BILL = args.val;
    break;
  case "PRINT_LO_BILL_1":
    $NC.G_VAR.CLIENT1.PRINT_LO_BILL = args.val;
    break;
  case "PRINT_RI_BILL_1":
    $NC.G_VAR.CLIENT1.PRINT_RI_BILL = args.val;
    break;
  case "PRINT_RO_BILL_1":
    $NC.G_VAR.CLIENT1.PRINT_RO_BILL = args.val;
    break;
  case "PRINT_INBOUND_SEQ_1":
    $NC.G_VAR.CLIENT1.PRINT_INBOUND_SEQ = args.val;
    break;
  case "PRINT_LOCATION_ID_1":
    $NC.G_VAR.CLIENT1.PRINT_LOCATION_ID = args.val;
    break;
  case "PRINT_SHIP_ID_1":
    $NC.G_VAR.CLIENT1.PRINT_SHIP_ID = args.val;
    break;
  case "PRINT_WB_NO_1":
    $NC.G_VAR.CLIENT1.PRINT_WB_NO = args.val;
    break;
  case "PRINT_LO_BOX_1":
    $NC.G_VAR.CLIENT1.PRINT_LO_BOX = args.val;
    break;
  case "PRINT_CARD_1":
    $NC.G_VAR.CLIENT1.PRINT_CARD = args.val;
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
  $NC.serviceCall("/CS01050E/getDataSet.do", {
    P_QUERY_ID: "CS01050E.RS_MASTER",
    P_QUERY_PARAMS: $NC.getParams({
      P_USER_ID: $NC.G_USERINFO.USER_ID,
      P_CLIENT_IP: $NC.G_USERINFO.CLIENT_IP
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

  var CLIENT2_CRUD;

  if ($NC.isNull($NC.G_VAR.CLIENT2)) {
    CLIENT2_CRUD = "C";
  } else {
    CLIENT2_CRUD = "U";
  }

  var saveDS = [ ];
  var subDS = [ ];
  var saveData;
  if ($NC.G_VAR.CLIENT1.CRUD !== "R") {
    saveData = {
      P_USER_ID: $NC.G_USERINFO.USER_ID,
      P_CLIENT_IP: $NC.G_USERINFO.CLIENT_IP,
      P_PRINT_LI_BILL: $NC.G_VAR.CLIENT1.PRINT_LI_BILL,
      P_PRINT_LO_BILL: $NC.G_VAR.CLIENT1.PRINT_LO_BILL,
      P_PRINT_RI_BILL: $NC.G_VAR.CLIENT1.PRINT_RI_BILL,
      P_PRINT_RO_BILL: $NC.G_VAR.CLIENT1.PRINT_RO_BILL,
      P_PRINT_INBOUND_SEQ: $NC.G_VAR.CLIENT1.PRINT_INBOUND_SEQ,
      P_PRINT_LOCATION_ID: $NC.G_VAR.CLIENT1.PRINT_LOCATION_ID,
      P_PRINT_SHIP_ID: $NC.G_VAR.CLIENT1.PRINT_SHIP_ID,
      P_PRINT_WB_NO: $NC.G_VAR.CLIENT1.PRINT_WB_NO,
      P_PRINT_LO_BOX: $NC.G_VAR.CLIENT1.PRINT_LO_BOX,
      P_PRINT_CARD: $NC.G_VAR.CLIENT1.PRINT_CARD,
      P_CRUD: $NC.G_VAR.CLIENT1.CRUD
    };
    saveDS.push(saveData);
  }

  saveData = {
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_CLIENT_IP: "0.0.0.0",
    P_PRINT_LI_BILL: $NC.getValue("#edtPrint_Li_Bill_2"),
    P_PRINT_LO_BILL: $NC.getValue("#edtPrint_Lo_Bill_2"),
    P_PRINT_RI_BILL: $NC.getValue("#edtPrint_Ri_Bill_2"),
    P_PRINT_RO_BILL: $NC.getValue("#edtPrint_Ro_Bill_2"),
    P_PRINT_INBOUND_SEQ: $NC.getValue("#edtPrint_Inbound_Seq_2"),
    P_PRINT_LOCATION_ID: $NC.getValue("#edtPrint_Location_Id_2"),
    P_PRINT_SHIP_ID: $NC.getValue("#edtPrint_Ship_Id_2"),
    P_PRINT_WB_NO: $NC.getValue("#edtPrint_Wb_No_2"),
    P_PRINT_LO_BOX: $NC.getValue("#edtPrint_Lo_Box_2"),
    P_PRINT_CARD: $NC.getValue("#edtPrint_Card_2"),
    P_CRUD: CLIENT2_CRUD
  };
  subDS.push(saveData);

  $NC.serviceCall("/CS01050E/save.do", {
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
    $NC.G_VAR.CLIENT2 = resultData[1];

    if ($NC.G_VAR.CLIENT1) {
      $NC.setValue("#edtPrint_Li_Bill_1", $NC.G_VAR.CLIENT1.PRINT_LI_BILL);
      $NC.setValue("#edtPrint_Lo_Bill_1", $NC.G_VAR.CLIENT1.PRINT_LO_BILL);
      $NC.setValue("#edtPrint_Ri_Bill_1", $NC.G_VAR.CLIENT1.PRINT_RI_BILL);
      $NC.setValue("#edtPrint_Ro_Bill_1", $NC.G_VAR.CLIENT1.PRINT_RO_BILL);
      $NC.setValue("#edtPrint_Inbound_Seq_1", $NC.G_VAR.CLIENT1.PRINT_INBOUND_SEQ);
      $NC.setValue("#edtPrint_Location_Id_1", $NC.G_VAR.CLIENT1.PRINT_LOCATION_ID);
      $NC.setValue("#edtPrint_Ship_Id_1", $NC.G_VAR.CLIENT1.PRINT_SHIP_ID);
      $NC.setValue("#edtPrint_Wb_No_1", $NC.G_VAR.CLIENT1.PRINT_WB_NO);
      $NC.setValue("#edtPrint_Lo_Box_1", $NC.G_VAR.CLIENT1.PRINT_LO_BOX);
      $NC.setValue("#edtPrint_Card_1", $NC.G_VAR.CLIENT1.PRINT_CARD);
    }

    if ($NC.G_VAR.CLIENT2) {
      $NC.setValue("#edtPrint_Li_Bill_2", $NC.G_VAR.CLIENT2.PRINT_LI_BILL);
      $NC.setValue("#edtPrint_Lo_Bill_2", $NC.G_VAR.CLIENT2.PRINT_LO_BILL);
      $NC.setValue("#edtPrint_Ri_Bill_2", $NC.G_VAR.CLIENT2.PRINT_RI_BILL);
      $NC.setValue("#edtPrint_Ro_Bill_2", $NC.G_VAR.CLIENT2.PRINT_RO_BILL);
      $NC.setValue("#edtPrint_Inbound_Seq_2", $NC.G_VAR.CLIENT2.PRINT_INBOUND_SEQ);
      $NC.setValue("#edtPrint_Location_Id_2", $NC.G_VAR.CLIENT2.PRINT_LOCATION_ID);
      $NC.setValue("#edtPrint_Ship_Id_2", $NC.G_VAR.CLIENT2.PRINT_SHIP_ID);
      $NC.setValue("#edtPrint_Wb_No_2", $NC.G_VAR.CLIENT2.PRINT_WB_NO);
      $NC.setValue("#edtPrint_Lo_Box_2", $NC.G_VAR.CLIENT2.PRINT_LO_BOX);
      $NC.setValue("#edtPrint_Card_2", $NC.G_VAR.CLIENT2.PRINT_CARD);
    }
  }
}

function onSave(ajaxData) {

  _Inquiry();
}
