/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 체크할 정책 값
    policyVal: {
      CM210: "" // 재고 제공사업부 관리 정책
    }
  });

  // 사업부구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "BU_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboBu_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboBu_Div", -1);
    }
  });


  $("#btnQBu_Cd").click(showUserBuPopup);

  $("#btnZip_Cd").click(showPostPopup);
  // 그리드 초기화
  grdMasterInitialize();
  

  // 정책값 설정
  setPolicyValInfo();

  // 에디터 Disable
  $NC.setEnableGroup("#divDetailInfoView", false);
}

/**
 * 화면 리사이즈 Offset 계산
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.fixedRightWidth = 500;
  $NC.G_OFFSET.fixedCenterWidth = 50;
  $NC.G_OFFSET.fixedDetailHeight = 300;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $("#divBottomView").outerHeight()
      + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  // 마스터 그리드 사이즈 조정.
  var clientWidth = parent.width() - $NC.G_OFFSET.fixedRightWidth - $NC.G_LAYOUT.margin1 + 1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  // Grid 높이 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);

  // 디테일 view 사이즈 조정.
  clientWidth = $NC.G_OFFSET.fixedRightWidth - $NC.G_LAYOUT.margin1;
  $NC.resizeContainer("#divDetailView", clientWidth, clientHeight);
  $NC.resizeContainer("#divDetailInfoView", clientWidth - ($NC.G_LAYOUT.margin1 * 2), $NC.G_OFFSET.fixedDetailHeight);




}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  // 위탁사 Key 입력
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
  }

  onChangingCondition();
}

function grdMasterOnCellChange(e, args) {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (rowData) {
    switch (args.col) {
  
    case "BU_CD":
      var searchIndex = $NC.getGridSearchVal(G_GRDMASTER, {
        searchKey: ["BU_CD"],
        searchVal: [args.val]
      });
      if (searchIndex > -1) {
        alert("중복사업부 입니다.");
        $NC.setValue("#edtBu_Cd");
        $NC.setFocus("#edtBu_Cd");
        return;
      }
      rowData.BU_CD = args.val;
      break;
    case "BU_NM":
      rowData.BU_NM = args.val;
      if ($NC.isNull(rowData.BU_FULL_NM)) {
        rowData.BU_FULL_NM = rowData.BU_NM;
        $NC.setValue("#edtBu_Full_Nm", rowData.BU_FULL_NM);
      }
      break;
    case "BU_FULL_NM":
      rowData.BU_FULL_NM = args.val;
      break;
    case "BU_DIV":
      rowData.BU_DIV = args.val;
      rowData.BU_DIV_F = $NC.getValueCombo(args.view, "F");
      break;
    case "ZIP_CD":
      rowData.ZIP_CD = args.val;
      break;
    case "ADDR_BASIC":
      rowData.ADDR_BASIC = args.val;
      break;
    case "ADDR_DETAIL":
      rowData.ADDR_DETAIL = args.val;
      break;
    case "CHARGE_NM":
      rowData.CHARGE_NM = args.val;
      break;
    case "TEL_NO":
      rowData.TEL_NO = args.val;
      break;
    case "REMARK1":
      rowData.REMARK1 = args.val;
      break;
    }
    if (rowData.CRUD === "R") {
      rowData.CRUD = "U";
    }
    G_GRDMASTER.data.updateItem(rowData.id, rowData);

    // 마지막 선택 Row 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;
  }

}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {
  var id = view.prop("id").substr(3).toUpperCase();
  grdMasterOnCellChange(e, {
    view: view,
    col: id,
    val: val
  });
}

/**
 * 검색항목 값 변경시 화면 클리어
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

  // 사업부상세정보 컴퍼넌트 초기화.
  setInputValue("#grdMaster");
  // 에디터 Disable
  $NC.setEnableGroup("#divDetailInfoView", false);
}

function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  
  // 사업부 정보 조회
  G_GRDMASTER.queryParams = $NC.getParams({
    P_BU_CD: $NC.getValue("#edtQBu_Cd",true),
  });
  $NC.serviceCall("/CM03060E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

function _OnLoaded() {
  // Safari에서 그리드의 Viewport 위치가 정상적으로 표시되지 않아서 Resize 호출
  _OnResize($(window));
}

function _New() {

  // 현재 수정모드면
  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDMASTER.lastRow != null) {
    if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
      return;
    }
  }

  var rowCount = G_GRDMASTER.data.getLength();
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDMASTER.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      $NC.setFocus("#edtBu_Cd");
      return;
    }
  }
  

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    BU_CD: null,
    BU_NM: null,
    BU_DIV: "01",
    BU_DIV_F: $NC.getValueCombo("#cboBu_Div", {
      searchVal: "01",
      returnVal: "F"
    }),
    BU_FULL_NM: null,
    CUST_CD: null,
    REG_USER_ID: null,
    REG_DATETIME: null,
    ZIP_CD: null,
    ADDR_BASIC: null,
    ADDR_DETAIL: null,
    CHARGE_NM: null,
    TEL_NO: null,
    REMARK1: null,
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };
  G_GRDMASTER.data.addItem(newRowData);

  $NC.setGridSelectRow(G_GRDMASTER, rowCount);

  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;

  // 이전 데이터가 한건도 없었으면 에디터 Enable
  if (rowCount == 0) {
    $NC.setEnableGroup("#divDetailInfoView", true);
  }

  // 신규 데이터 생성 이벤트 호출
  grdMasterOnNewRecord({
    row: rowCount,
    rowData: newRowData
  });



  $NC.setEnable("#edtBu_Cd", true);
}

/**
 * 신규 데이터 생성 후 포커싱.
 * 
 * @param args
 */
function grdMasterOnNewRecord(args) {
  $NC.setFocus("#edtBu_Cd");
}

function grdMasterOnBeforePost(row) {

  if (!G_GRDMASTER.lastRowModified) {
    return true;
  }

  var rowData = G_GRDMASTER.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }

  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N" || rowData.CRUD == "C") {
    if ($NC.isNull(rowData.BU_CD)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    // 신규일 때 사업부 코드가 없으면 신규 취소
    if ($NC.isNull(rowData.BU_CD)) {
      alert("사업부를 입력하십시오.");
      $NC.setFocus("#edtBu_Cd");
      return false;
    }
    if ($NC.isNull(rowData.BU_NM)) {
      alert("사업부명을 입력하십시오.");
      $NC.setFocus("#edtBu_Nm");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.BU_DIV)) {
      alert("사업부구분을 선택하십시오.");
      $NC.setFocus("#cboBu_Div");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }
  return true;
}

/*
**
* Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
*/
function _Save() {
  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  // 사업부 마스터
  var masterDS = [ ];
  var d_DS = [ ];
  var cu_DS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      if ($NC.isNull(rowData.BU_CD)) {
        alert("사업부를 입력하십시오.");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        $NC.setFocus("#edtBu_Cd");
        return;
      }
      if ($NC.isNull(rowData.BU_NM)) {
        alert("사업부명을 입력하십시오.");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        $NC.setFocus("#edtBu_Nm");
        return;
      }
      if ($NC.isNull(rowData.BU_FULL_NM)) {
        alert("정식명칭을 입력하십시오.");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        $NC.setFocus("#edtBu_Full_Nm");
        return;
      }
      if ($NC.isNull(rowData.BU_DIV)) {
        alert("사업부구분을 선택하십시오.");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        $NC.setFocus("#cboBu_Div");
        return;
      }


      var saveData = {
        P_BU_CD: rowData.BU_CD,
        P_BU_NM: rowData.BU_NM,
        P_BU_FULL_NM: rowData.BU_FULL_NM,
        P_BU_DIV: rowData.BU_DIV,
        P_CUST_CD: '0000',
        P_ZIP_CD: rowData.ZIP_CD,
        P_ADDR_BASIC: rowData.ADDR_BASIC,
        P_ADDR_DETAIL: rowData.ADDR_DETAIL,
        P_CHARGE_NM: rowData.CHARGE_NM,
        P_TEL_NO: rowData.TEL_NO,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      if (rowData.CRUD === "D") {
        d_DS.push(saveData);
      } else {
        cu_DS.push(saveData);
      }
    }
  }
  masterDS = d_DS.concat(cu_DS);



  if (masterDS.length == 0 ) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/CM03060E/save.do", {
    P_DS_MASTER: $NC.toJson(masterDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError);

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (rowData.CRUD == "R") {
    $NC.setEnable("#edtBu_Cd", false);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var result = confirm("삭제 하시겠습니까?");
  if (result) {
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    // 신규 데이터일 경우 그냥 삭제
    if (rowData.CRUD === "C" || rowData.CRUD === "N") {
      // 마지막 선택 Row 수정 상태 복원
      G_GRDMASTER.lastRowModified = false;

      G_GRDMASTER.data.deleteItem(rowData.id);
      // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
      if (G_GRDMASTER.lastRow > 1) {
        $NC.setGridSelectRow(G_GRDMASTER, G_GRDMASTER.lastRow - 1);
      } else {
        if (G_GRDMASTER.data.getLength() === 0) {
          $NC.setEnableGroup("#divDetailInfoView", false);
          setInputValue("#grdMaster");
          $NC.setGridDisplayRows("#grdMaster", 0, 0);
        } else {
          $NC.setGridSelectRow(G_GRDMASTER, 0);
        }
      }

    } 
  }
}

function _Cancel() {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "BU_CD",
    isCancel: true
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "사업부코드",
    minWidth: 60
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업부명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_FULL_NM",
    field: "BU_FULL_NM",
    name: "정식명칭",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_DIV_F",
    field: "BU_DIV_F",
    name: "사업부구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ZIP_CD",
    field: "ZIP_CD",
    name: "우편번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_BASIC",
    field: "ADDR_BASIC",
    name: "기본주소",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ADDR_DETAIL",
    field: "ADDR_DETAIL",
    name: "상세주소",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "CHARGE_NM",
    field: "CHARGE_NM",
    name: "담당자명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "TEL_NO",
    field: "TEL_NO",
    name: "대표전화번호",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 사업부정보 그리드 초기화.
 */
function grdMasterInitialize() {

  var options = {
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CM03060E.RS_MASTER",
    sortCol: "BU_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

/**
 * Row Change Event.b
 * 
 * @param e
 * @param args
 */
function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
    if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDMASTER.data.getItem(row);

  // 에디터 값 세팅
  setInputValue("#grdMaster", rowData);

 

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);

  if (rowData.CRUD == "N" || rowData.CRUD == "C") {
    $NC.setEnable("#edtBu_Cd", true);
  } 
        $NC.setEnable("#edtBu_Cd", false);


  if (rowData.CRUD == "R") {
    $NC.setEnable("#edtBu_Cd", false);
  }
}

/**
 * 그리드 데이터를 컴퍼넌트로 binding.
 */
function setInputValue(grdSelector, rowData) {

  if (grdSelector === "#grdMaster") {

    if ($NC.isNull(rowData)) {
      // 초기화시 기본값 지정
      rowData = {
        CRUD: "R"
      };
    }
    // 선택된 로우 데이터로 에디터 세팅
    $NC.setValue("#edtBu_Cd", rowData.BU_CD);
    $NC.setValue("#cboBu_Div", rowData.BU_DIV);
    $NC.setValue("#edtBu_Nm", rowData.BU_NM);
    $NC.setValue("#edtBu_Full_Nm", rowData.BU_FULL_NM);
    $NC.setValue("#edtRemark1", rowData.REMARK1);
    $NC.setValue("#edtZip_Cd", rowData.ZIP_CD);
    $NC.setValue("#edtAddr_Basic", rowData.ADDR_BASIC);
    $NC.setValue("#edtAddr_Detail", rowData.ADDR_DETAIL);
    $NC.setValue("#edtCharge_Nm", rowData.CHARGE_NM);
    $NC.setValue("#edtTel_No", rowData.TEL_NO);
    // 신규 데이터면 사업부코드 수정할 수 있게 함
    if (rowData.CRUD == "N") {
      rowData.CRUD = "C";
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
    }
    return true;

  }
}


/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setEnableGroup("#divDetailInfoView", true);
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "BU_CD",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setEnableGroup("#divDetailInfoView", false);
    $NC.setGridDisplayRows("#grdMaster", 0, 0);

  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "1";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}



/**
 * 검색조건의 사업부 검색 팝업 클릭
 */
function showUserBuPopup() {

  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQBu_Cd", true);
  });
}

/**
 * 사업부 검색 결과
 * 
 * @param seletedRowData
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
    $NC.setValue("#edtQCust_Cd", resultInfo.CUST_CD);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setValue("#edtQCust_Cd");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}


/**
 * 저장 성공시
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "BU_CD"
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * 저장 실패시
 * 
 * @param ajaxData
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (rowData.CRUD === "D") {
    rowData.CRUD = "U";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
    // 마지막 선택 Row 수정 상태로 변경
    G_GRDMASTER.lastRowModified = false;
  }
}

/**
 * 정책정보 취득
 */
function setPolicyValInfo() {

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCallAndWait("/LO01010E/callSP.do", {
      P_QUERY_ID: "WF.GET_POLICY_VAL",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: "%",
        P_BU_CD: "%",
        P_POLICY_CD: POLICY_CD
      })
    }, onGetPolicyVal);
  }
}

/**
 * 정책정보 취득후 처리
 * 
 * @param ajaxData
 */
function onGetPolicyVal(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.O_MSG === "OK") {
      $NC.G_VAR.policyVal[resultData.P_POLICY_CD] = resultData.O_POLICY_VAL;

      // 재고 제공사업부 관리 정책 (1:관리안함, 2:관리함)
      if (resultData.P_POLICY_CD == "CM210" && resultData.O_POLICY_VAL == "2") {

        $("#divSubView1").css("border-width", "1px 1px 1px 0px");
        $("#divSubView2").css("border-width", "1px 0px 1px 1px");
        $("#divDsp_provideBu").show();

      }
    }
  }
}

/**
 * 검색조건의 우편번호 검색 이미지 클릭
 */
function showPostPopup() {

  $NP.showPostPopup({
    P_ADDR_NM: $NC.G_USERINFO.ZIP_CD
  }, onPostPopup, function() {
  });
}

/**
 * 우편번호 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onPostPopup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtZip_Cd", resultInfo.ZIP_CD);
    $NC.setValue("#edtAddr_Basic", resultInfo.ADDR_NM_REAL);

    rowData.ZIP_CD = resultInfo.ZIP_CD;
    rowData.ADDR_BASIC = resultInfo.ADDR_NM_REAL;
  } else {
    $NC.setValue("#edtZip_Cd");
    $NC.setValue("#edtAddr_Basic");
    $NC.setFocus("#edtZip_Cd", true);

    rowData.ZIP_CD = "";
    rowData.ADDR_BASIC = "";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}