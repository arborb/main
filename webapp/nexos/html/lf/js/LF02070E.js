/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 체크할 정책 값
    policyVal: {
      LI420: ""  // 재고 관리 기준
    },
    printOptions: [{
      PRINT_INDEX: 0,
      PRINT_COMMENT: "입고라벨 출력"
    }],
    // 오른쪽 하단 그리드 NEW버튼 클릭시마다 1씩 증가
    SEQ_NO: 0
  });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();
  grdSubInitialize();
  grdSub1Initialize();

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
      $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
      // 정책코드 취득
      setPolicyValInfo();
    }
  });
  // 조회조건 - 입고구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "INOUT_CD",
      P_CODE_CD: "%",
      P_SUB_CD1: "E1",
      P_SUB_CD2: "E2"
    })
  }, {
    selector: "#cboQInout_Cd",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addAll: true
  });
  // 추가 조회조건 사용
  $NC.setInitAdditionalCondition();
  // 브랜드 초기값 설정
  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnQBrand_Cd").click(showBuBrandPopup);
  $("#btnQVendor_Cd").click(showVendorPopup);
  // 브랜드의 위탁사 코드 값 설정
  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);

  // 분할구분 초기값 설정 (체크)
  $NC.setValue("#rgbQSplit_Div1", "1");

  // 출고일자에 달력이미지 설정
  $NC.setInitDatePicker("#dtpQInbound_Date");
  

  // 자동분할 클릭 이벤트
  $("#btnAutoSplit").click(autoSplit);
  // 저장권한이 있는 경우만 자동분할 가능
  var permission = $NC.getProgramPermission();
  $NC.setEnable("#btnAutoSplit", permission.canSave);
}

function _OnLoaded() {
 // $NC.setInitSplitter("#divRightView", "h", 200);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.leftViewWidth = 800;

  $NC.G_OFFSET.RightViewHeight = 100;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  //$NC.G_OFFSET.rightBottomHeightOffset = $("#divSplitInfo").outerHeight();
 // $NC.G_OFFSET.rightBottom1HeightOffset = $("#divSplitInfo").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_OFFSET.leftViewWidth - $NC.G_LAYOUT.nonClientWidth;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;
  var testHeight = Math.ceil(clientHeight / 3);

  $NC.resizeContainer("#divLeftView", $NC.G_OFFSET.leftViewWidth, clientHeight);
  $NC.resizeContainer("#divRightView", clientWidth, testHeight * 3 );

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", $NC.G_OFFSET.leftViewWidth, clientHeight - $NC.G_LAYOUT.header);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, testHeight  - $NC.G_LAYOUT.header );

 var test1 =  $NC.G_LAYOUT.header  - 10 + 'px';
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdSub1", clientWidth, testHeight  - $NC.G_LAYOUT.header 
      );
  
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdSub", clientWidth, testHeight - $NC.G_LAYOUT.header 
      );

}

/**
 * Input, Select Change Event 처리
 * 
 * @param e
 *          이벤트 핸들러
 * @param view
 *          대상 Object
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "CENTER_CD":
    setPolicyValInfo();
    break;
  //사업부 Key 입력
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
 // 브랜드 Key 입력
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      P_QUERY_PARAMS = {
        P_BU_CD: BU_CD,
        P_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getBuBrandInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onBuBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showBuBrandPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onBuBrandPopup, onBuBrandPopup);
    }
    return;
  case "VENDOR_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.getValue("#edtQCust_Cd");
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_VENDOR_CD: val,
        P_VIEW_DIV: "2"
      };
      O_RESULT_DATA = $NP.getVendorInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onVendorPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showVendorPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onVendorPopup, onVendorPopup);
    }
    return;
  case "INBOUND_DATE":
    $NC.setValueDatePicker(view, val, "검색 입고일자를 정확히 입력하십시오.");
    break;
  }

  // 화면클리어
  onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

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
    alert("사업부코드를 입력하십시오.");
    $NC.setFocus("#edtQBrand_Cd");
    return;
  }

  var INOUND_DATE = $NC.getValue("#dtpQInbound_Date");
  if ($NC.isNull(INOUND_DATE)) {
    alert("입고일자를 입력하십시오.");
    $NC.setFocus("#dtpQInbound_Date");
    return;
  }
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  var VENDOR_CD = $NC.getValue("#edtQVendor_Cd", true);
  var ITEM_CD = $NC.getValue("#edtQItem_Cd", true);
  var ITEM_NM = $NC.getValue("#edtQItem_Nm", true);
  var INOUT_CD = $NC.getValue("#cboQInout_Cd");

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  $NC.setInitGridVar(G_GRDDETAIL);
  $NC.setInitGridVar(G_GRDSUB);

  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_INBOUND_DATE: INOUND_DATE,
    P_INOUT_CD: INOUT_CD,
    P_VENDOR_CD: VENDOR_CD,
    P_BRAND_CD: BRAND_CD,
    P_ITEM_CD: ITEM_CD,
    P_ITEM_NM: ITEM_NM
  });

  // 데이터 조회
  $NC.serviceCall("/LI05010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

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

  if (G_GRDMASTER.data.getLength() === 0 || G_GRDDETAIL.data.getLength() === 0 || G_GRDSUB.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  // 현재 수정모드면
  if (G_GRDSUB.view.getEditorLock().isActive()) {
    G_GRDSUB.view.getEditorLock().commitCurrentEdit();
  }

  var totConfirmQty = 0;
  var rowDetailData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  var saveDS = [ ];
  var rowCount = G_GRDSUB.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDSUB.data.getItem(row);
    totConfirmQty += Number(rowData.CONFIRM_QTY);
    if (rowData.CRUD !== "R") {
      if (!grdSubOnBeforePost(row)) {
        return;
      }
      var saveData = {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_INBOUND_SEQ: rowData.INBOUND_SEQ,
        P_LOCATION_CD: rowData.LOCATION_CD,
        P_ENTRY_QTY: rowData.CONFIRM_QTY,
        P_CONFIRM_QTY: rowData.CONFIRM_QTY,
        P_CRUD: rowData.CRUD
      };
      saveDS.push(saveData);
    }
  }

  if (totConfirmQty != Number(rowDetailData.ENTRY_QTY)) {
    alert("등록수량(" + rowDetailData.ENTRY_QTY + ")과 \n확정수량의 합(" + totConfirmQty + ")이 일치하지 않습니다.");
    return;
  }
  if (saveDS.length > 0) {
    $NC.serviceCall("/LI05010E/save.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
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

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "INBOUND_NO"
  });
  var lastKeyValD = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "LINE_NO"
  });
  var lastKeyValS = $NC.getGridLastKeyVal(G_GRDSUB, {
    selectKey: "INBOUND_SEQ"
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
  G_GRDDETAIL.lastKeyVal = lastKeyValD;
  G_GRDSUB.lastKeyVal = lastKeyValS;

}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

  if (G_GRDDETAIL.data.getLength() == 0 || G_GRDDETAIL.lastRow == null) {
    alert("출력할 데이터를 선택하십시오.");
    return;
  }

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

  // 입고라벨
  if (printIndex == 0) {
    // 출력 호출
    $NC.G_MAIN.showPrintPreview({
      reportDoc: "common/LABEL_PALLET",
      queryId: "WR.RS_LABEL_PALLET02",
      queryParams: {
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_INBOUND_DATE: rowData.INBOUND_DATE,
        P_INBOUND_NO: rowData.INBOUND_NO,
        P_LINE_NO: rowData.LINE_NO,
        P_PROCESS_GRP: "LI"
      }
    });
  }
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "INBOUND_NO",
    field: "INBOUND_NO",
    name: "입고번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "VENDOR_NM",
    field: "VENDOR_NM",
    name: "공급처",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "입고구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_NO",
    field: "ORDER_NO",
    name: "예정번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BUD_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 130
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 왼쪽그리드 초기화
 */
function grdMasterInitialize() {

  var options = {
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LI05010E.RS_MASTER",
    sortCol: "INBOUND_NO",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdDetailOnGetColumns(policyLI420) {

  if ($NC.isNull(policyLI420)) {
    policyLI420 = "1";
  }

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 50,
    cssClass: "align-right"
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
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_LOT",
    field: "ITEM_LOT",
    name: "LOT번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_BOX",
    field: "ENTRY_BOX",
    name: "등록BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_EA",
    field: "ENTRY_EA",
    name: "등록EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_WEIGHT",
    field: "ENTRY_WEIGHT",
    name: "등록중량",
    minWidth: 70,
    cssClass: "align-right"
  });
  if (policyLI420 == "2") {
    $NC.setGridColumn(columns, {
      id: "VALID_DATE",
      field: "VALID_DATE",
      name: "유통기한",
      minWidth: 100,
      cssClass: "align-center"
    });
    $NC.setGridColumn(columns, {
      id: "BATCH_NO",
      field: "BATCH_NO",
      name: "제조배치번호",
      minWidth: 100
    });
  }

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 오른쪽 상단 그리드 초기화
 */
function grdDetailInitialize() {

  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "LI05010E.RS_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);

  G_GRDDETAIL.height = 300;
  $("#grdDetail").height(G_GRDDETAIL.height);
}

function grdSubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "INBOUND_SEQ",
    field: "INBOUND_SEQ",
    name: "입고SEQ",
    minWidth: 150,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 오른쪽 하단 그리드 초기화
 */
function grdSubInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: "LI05010E.RS_SUB1",
    sortCol: "LOCATION_ID",
    gridOptions: options
  });

  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
  G_GRDSUB.view.onBeforeEditCell.subscribe(grdSubOnBeforeEditCell);
  G_GRDSUB.view.onCellChange.subscribe(grdSubOnCellChange);
}

/**
 * 오른쪽 하단그리드의 입력체크 처리
 */
function grdSubOnBeforePost(row) {

  var rowData = G_GRDSUB.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  /*
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    
  }
  */
  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.CONFIRM_QTY) || Number(rowData.CONFIRM_QTY) == 0) {
      alert("확정수량을 정확히 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUB, {
        selectRow: row,
        activeCell: G_GRDSUB.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return false;
    }
  }

  return true;
}

/**
 * 오쪽 른하단그리드 편집불가능
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdSubOnBeforeEditCell(e, args) {

  return true;
}

/**
 * 오른쪽 하단그리드의 셀 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdSubOnCellChange(e, args) {

  var rowData = args.item;
  if ($NC.isNull(rowData.CONFIRM_QTY)) rowData.CONFIRM_QTY = "0";
  if (Number(rowData.CONFIRM_QTY) < 0) {
    alert("확정수량에는 0보다 작은값을 입력할 수 없습니다.");
    rowData.CONFIRM_QTY = 0;
    $NC.setGridSelectRow(G_GRDSUB, {
      selectRow: G_GRDSUB.lastRow,
      activeCell: G_GRDSUB.view.getColumnIndex("CONFIRM_QTY"),
      editMode: true
    });
    return;
  }
  if ($NC.isNull(rowData.CRUD) || rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUB.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUB.lastRowModified = true;

  G_GRDSUB.view.getCanvasNode().focus();
}

/*---------------test-----------------*/



function grdSub1OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "확정수량",
    minWidth: 70,
    cssClass: "align-right",
    editor: Slick.Editors.Number,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "INBOUND_SEQ",
    field: "INBOUND_SEQ",
    name: "입고SEQ",
    minWidth: 150,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 오른쪽 하단 그리드 초기화
 */
function grdSub1Initialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub1", {
    columns: grdSub1OnGetColumns(),
    queryId: "LI05010E.RS_SUB1",
    sortCol: "LOCATION_ID",
    gridOptions: options
  });

}

/**
 * 오른쪽 하단그리드의 입력체크 처리
 */
function grdSub1OnBeforePost(row) {

  var rowData = G_GRDSUB1.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  /*
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    
  }
  */
  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.CONFIRM_QTY) || Number(rowData.CONFIRM_QTY) == 0) {
      alert("확정수량을 정확히 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUB1, {
        selectRow: row,
        activeCell: G_GRDSUB1.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return false;
    }
  }

  return true;
}

/**
 * 오쪽 른하단그리드 편집불가능
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdSub1OnBeforeEditCell(e, args) {

  return true;
}

/**
 * 오른쪽 하단그리드의 셀 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdSub1OnCellChange(e, args) {

  var rowData = args.item;
  if ($NC.isNull(rowData.CONFIRM_QTY)) rowData.CONFIRM_QTY = "0";
  if (Number(rowData.CONFIRM_QTY) < 0) {
    alert("확정수량에는 0보다 작은값을 입력할 수 없습니다.");
    rowData.CONFIRM_QTY = 0;
    $NC.setGridSelectRow(G_GRDSUB, {
      selectRow: G_GRDSUB1.lastRow,
      activeCell: G_GRDSUB1.view.getColumnIndex("CONFIRM_QTY"),
      editMode: true
    });
    return;
  }
  if ($NC.isNull(rowData.CRUD) || rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUB1.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUB1.lastRowModified = true;

  G_GRDSUB1.view.getCanvasNode().focus();
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
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");
  onChangingCondition();
  setPolicyValInfo();
}


/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBuBrandPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");

  $NP.showBuBrandPopup({
    P_BU_CD: BU_CD,
    P_BRAND_CD: "%"
  }, onBuBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}
/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onBuBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  onChangingCondition();
}
/**
 * 검색조건의 배송처 검색 이미지 클릭
 */
function showVendorPopup() {

  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NP.showVendorPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_VENDOR_CD: "%",
      P_VIEW_DIV: "1"
    }
  }, onVendorPopup, function() {
    $NC.setFocus("#edtQVendor_Cd", true);
  });
}

function onVendorPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQVendor_Cd", resultInfo.VENDOR_CD);
    $NC.setValue("#edtQVendor_Nm", resultInfo.VENDOR_NM);
  } else {
    $NC.setValue("#edtQVendor_Cd");
    $NC.setValue("#edtQVendor_Nm");
    $NC.setFocus("#edtQVendor_Cd", true);
  }
  onChangingCondition();
}

/**
 * 왼쪽그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  var rowData = G_GRDMASTER.data.getItem(row);

  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }


  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL);
  
  onGetDetail({
    data: null
  });
  
  G_GRDDETAIL.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_INBOUND_DATE: rowData.INBOUND_DATE,
    P_INBOUND_NO: rowData.INBOUND_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LI05010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);

}

/**
 * 오른쪽 상단 그리드 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDDETAIL.lastRow != null) {
    if (row == G_GRDDETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUB);
  
  onGetSub({
    data: null
  });
  

  var rowData = G_GRDDETAIL.data.getItem(row);

  G_GRDSUB.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_INBOUND_DATE: rowData.INBOUND_DATE,
    P_INBOUND_NO: rowData.INBOUND_NO,
    P_LINE_NO: rowData.LINE_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LI05010E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);

}

/**
 * 오른쪽 하단그리드 행 클릭시 하단그리드 값 취득해서 표시 처리
 * 
 * @param e
 * @param args
 */
function grdSubOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUB.lastRow != null) {
    if (row == G_GRDSUB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub", row + 1);
}

/**
 * 조회버튼 클릭후 왼쪽 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "INBOUND_NO",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);

    // 중분류 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    onGetDetail({
      data: null
    });
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "1";
  $NC.G_VAR.buttons._cancel = "1";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "1";

  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
}

/**
 * 오른쪽 상단 그리드에 데이터 표시처리
 */
function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "LINE_NO",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
    // 소분류 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB);
    onGetSub({
      data: null
    });
  }
  G_GRDDETAIL.view.getCanvasNode().focus();
}

/**
 * 오른쪽 하단 그리드에 데이터 표시처리
 */
function onGetSub(ajaxData) {

  $NC.setInitGridData(G_GRDSUB, ajaxData);
  if (G_GRDSUB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDSUB.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSUB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSUB, {
        selectKey: "INBOUND_SEQ",
        selectVal: G_GRDSUB.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdSub", 0, 0);
  }
  $NC.G_VAR.SEQ_NO = 0;
}

/**
 * 저장 처리 성공 했을 경우 처리
 */
function onSave(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDSUB, {
    selectKey: "INBOUND_SEQ"
  });

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUB);

  G_GRDSUB.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_INBOUND_DATE: rowData.INBOUND_DATE,
    P_INBOUND_NO: rowData.INBOUND_NO,
    P_LINE_NO: rowData.LINE_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LI05010E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

  G_GRDSUB.lastKeyVal = lastKeyVal;
}

/**
 * 저장 처리 실패 했을 경우 처리
 */
function onSaveError(ajaxData) {

  $NC.onError(ajaxData);

}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {

  $NC.clearGridData(G_GRDMASTER);
  $NC.clearGridData(G_GRDDETAIL);
  $NC.clearGridData(G_GRDSUB);

  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "1";

  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
}

/**
 * 자동분할 버튼 클릭 이벤트 처리
 */
function autoSplit() {

  if (G_GRDMASTER.data.getLength() === 0 || G_GRDDETAIL.data.getLength() === 0 || G_GRDSUB.data.getLength() === 0) {
    alert("자동분할 대상 데이터가 없습니다.");
    return;
  }

  var SPLIT_VAL = $NC.getValue("#edtQSplit_Val");
  if ($NC.isNull(SPLIT_VAL) || Number(SPLIT_VAL) == 0) {
    alert("수량를 정확히 입력하십시오.");
    $NC.setFocus("#edtQSplit_Val");
    return;
  }

  var result = confirm("자동분할 하시겠습니까?");
  if (!result) return;

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  var SPLIT_FLAG = $(':radio[name="rgbQSplit_Div"]:checked').val();

  $NC.serviceCall("/LI05010E/setSplitPallet.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_INBOUND_DATE: rowData.INBOUND_DATE,
      P_INBOUND_NO: rowData.INBOUND_NO,
      P_LINE_NO: rowData.LINE_NO,
      P_SPLIT_FLAG: SPLIT_FLAG,
      P_SPLIT_VAL: SPLIT_VAL,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onSave, onSaveError);

}

/**
 * 정책정보 취득
 */
function setPolicyValInfo() {

  $NC.G_VAR.policyVal.LI420 = "";

  // 값 오류 체크는 안함
  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  var BU_CD = $NC.getValue("#edtQBu_Cd");

  for ( var POLICY_CD in $NC.G_VAR.policyVal) {
    // 데이터 조회
    $NC.serviceCall("/LI05010E/callSP.do", {
      P_QUERY_ID: "WF.GET_POLICY_VAL",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
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
      if (resultData.P_POLICY_CD != "LI420") {
        return;
      }
      // 재고관리기준에 따라 유효일자/배치번호별 표시/비표시
      var policyVal = resultData.O_POLICY_VAL;
      G_GRDDETAIL.view.setColumns(grdDetailOnGetColumns(policyVal));
    }
  }
}