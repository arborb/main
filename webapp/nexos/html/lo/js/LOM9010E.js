/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 입출고서브구분
    INOUT_SUB_CD1: "DM",
    INOUT_SUB_CD2: ""
  });

  // 그리드 초기화
  grdMasterInitialize();

  // 조회조건 - 물류센터 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CSUSERCENTER",
    P_QUERY_PARAMS: $NC.getParams({
      P_USER_ID: $NC.G_USERINFO.USER_ID,
      P_CENTER_CD: "%"
    })
  }, {
    selector: "#cboQCenter_Cd",
    codeField: "CENTER_CD",
    nameField: "CENTER_NM",
    onComplete: function() {
      $("#cboQCenter_Cd").val($NC.G_USERINFO.CENTER_CD);
    }
  });
  
  // 입력조건 - 취소사유 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "SHORTAGE_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboShortage_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboShortage_Div");
    }
  });

  // 조회조건 - 사업부 세팅
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $NC.setValue("#edtQCancelYn");

  // 조회조건 - 출고예정일자 달력이미지 설정
  $NC.setInitDatePicker("#dtpQOutbound_Date");

  $NC.setEnable("#btnProcBw", false);
  // 사업부 검색 이미지 클릭
  $("#btnQBu_Cd").click(showUserBuPopup);

  // 출고 취소처리 버튼
  $("#btnProcBw").click(onBtnProcBwClick);

}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  var height = clientHeight - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, height);
}

/**
 * Key Up Event
 * 
 * @param e
 * @param view
 */
/*
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

      // 대문자로 변환
      scanVal = scanVal.toUpperCase();

      
      if (G_GRDMASTER.data.getLength() == 0 || scanVal.match(/-/g).length == 3) {
        e.stopImmediatePropagation();
        return;
      }
      

      // 송장번호 바코드 스캔

      e.stopImmediatePropagation();
      return;
    }

    break;
  }
}
*/

/**
 * Input, Select Change Event 처리
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "CENTER_CD":
    onChangingCondition();
    break;
  case "BU_CD":
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
  case "OUTBOUND_DATE":
    if (!$NC.isDate(val)) {
      alert("일자를 정확히 입력하십시오.");
      $NC.setInitDatePicker(view);
      $NC.setFocus(view);
    } else {
      $NC.setValue(view, $NC.getDate(val));
    }
    onChangingCondition();
    break;
  case "WB_SCAN":
  case "BU_SCAN":
    break;
  }

  // 조회 조건에 Object Change
//  onChangingCondition();
}

/**
 * 조회조건이 변경될 때 호출
 */
function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDMASTER);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);

  $NC.setValue("#edtQCancelYn");
  $NC.setEnable("#btnProcBw", false);

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }
  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부 코드를 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }
  var OUTBOUND_DATE = $NC.getValue("#dtpQOutbound_Date");
  if ($NC.isNull(OUTBOUND_DATE)) {
    alert("출고예정 검색 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpQOutbound_Date");
    return;
  }

  var PARAM_WB_NO = $NC.getValue("#edtQWb_Scan");
  var SCAN_INFO = $NC.getValue("#edtQBu_Scan");
  if ($NC.isNull(PARAM_WB_NO) && $NC.isNull(SCAN_INFO)) {
    alert("송장번호나 전표정보중 하나를 입력하십시오.");
    $NC.setFocus("#edtQWb_No");
    return;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_OUTBOUND_DATE: OUTBOUND_DATE,
    P_WB_NO: PARAM_WB_NO,
    P_SCAN_INFO: SCAN_INFO,
  });

  // 데이터 조회
  $NC.serviceCall("/LOM9010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
 */
function _Print(printIndex, printName) {

}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BUNO_CHK",
    field: "BUNO_CHK",
    name: "취소대상",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "주문번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "주문순번",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BU_KEY",
    field: "BU_KEY",
    name: "주문ID",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_ID",
    field: "OPTION_ID",
    name: "옵션ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_TEL",
    field: "SHIPPER_TEL",
    name: "전화번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_HP",
    field: "SHIPPER_HP",
    name: "휴대폰번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR",
    field: "SHIPPER_ADDR",
    name: "주소",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "MALL_MSG",
    field: "MALL_MSG",
    name: "온라인몰메시지",
    minWidth: 140
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_MSG",
    field: "ORDERER_MSG",
    name: "배송메시지",
    minWidth: 130
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 4
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LOM9010E.RS_MASTER",
    sortCol: ["ITEM_CD", "BRAND_CD"],
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  setItemInfoValue(G_GRDMASTER.data.getItem(row));

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

/**
 * 출고예정내역 조회
 * 
 * @param ajaxData
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {

    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        // selectKey: ["BRAND_CD", "ITEM_CD"],
        selectKey: ["BRAND_CD", "ITEM_CD"],
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
    // $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";

}

function setItemInfoValue(rowData) {

  // 상품 정보 세팅
  if ($NC.isNull(rowData)) {
    rowData = {};
  }

  if (rowData.BUNO_CHK == 'N') {
    $NC.setValue("#edtQCancelYn", '대상아님');
    $NC.setEnable("#btnProcBw", false);
  } else if (rowData.BUNO_CHK == 'Y') {
    $NC.setValue("#edtQCancelYn", '취소대상');
    $NC.setEnable("#btnProcBw", true);
  } else {
    $NC.setValue("#edtQCancelYn");
    $NC.setEnable("#btnProcBw", false);
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
    $NC.setFocus("#edtQBu_Cd", true);
  });
}

function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setFocus("#edtQBu_Cd", true);
  }

  onChangingCondition();
}

function onBtnProcBwClick() {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  
  var CLOSE_COMMENT = $NC.getValueCombo("#cboShortage_Div", "N");
  
  var result = confirm("취소사유 : "+ CLOSE_COMMENT +"\n해당 전표를 취소처리하시겠습니까?");
  if (!result) {
    return;
  }

  $NC.serviceCall("/LOM9010E/callLoCancel.do", {
    P_QUERY_ID: "LO_BW_ORDER_PROC",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
      P_OUTBOUND_NO: rowData.OUTBOUND_NO,
      P_CLOSE_COMMENT: CLOSE_COMMENT,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onExecSP, onSaveError);
}

function onExecSP(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }
  alert("출고 취소처리가 완료되었습니다.");
  _Inquiry();

}

/**
 * 저장에 실패 했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
}
