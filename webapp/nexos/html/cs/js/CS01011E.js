/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 조회조건 - 물류센터 초기화
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
    addAll: true,
    onComplete: function() {
      $NC.setValue("#cboQCenter_Cd", "%");
    }
  });

  // 조회조건 - 사용자구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "CERTIFY_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboQCertify_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    addAll: true,
    onComplete: function() {
      $NC.setValue("#cboQCertify_Div", "%");
    }
  });

  // 사용자구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "CERTIFY_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboCertify_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboCertify_Div", -1);
    }
  });

  // 기본언어 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "SYS_LANG",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboSys_Lang",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboSys_Lang", -1);
    }
  });

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnAddCenter").click(onBtnAddCenter);
  $("#btnDeleteCenter").click(onBtnDeleteCenter);
  $("#btnVendor_Cd").click(showVendorPopup);
  $("#btnCarrier_Cd").click(showCarrierPopup);

  // 그리드 초기화
  grdMasterInitialize();
  // 물류센터
  grdDetail1Initialize();
  grdDetail2Initialize();
 

  // 프로그램 사용 권한 설정
  setUserProgramPermission();

}

/**
 * 화면 리사이즈 Offset 계산
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.fixedRightWidth = 600;
  $NC.G_OFFSET.fixedCenterWidth = 50;
  $NC.G_OFFSET.fixedDetailHeight = 5;
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

  // 디테일 그리드 사이즈 조정.
  clientHeight -= $NC.G_OFFSET.fixedDetailHeight + $NC.G_LAYOUT.header + $NC.G_LAYOUT.margin2;

  $NC.resizeContainer("#divGrdView", clientWidth, clientHeight);

  clientWidth -= $NC.G_OFFSET.fixedCenterWidth + $NC.G_LAYOUT.border1;
  var viewWidth = Math.ceil(clientWidth / 2);

  clientHeight -= $NC.G_LAYOUT.margin1 + $NC.G_LAYOUT.border2;
  var viewHeight = Math.ceil(clientHeight/ 6 );

  // 중앙 버튼 사이즈 조정.
  $("#divBtnCenter").css({
    "width": $NC.G_OFFSET.fixedCenterWidth,
    "height": 50,
    "margin-top": (viewHeight - $NC.G_LAYOUT.margin1) / 2 
  });
  $("#divBtnBu").css({
    "width": $NC.G_OFFSET.fixedCenterWidth,
    "height": 50,
    "margin-top": (viewHeight - $NC.G_LAYOUT.margin1) / 2 
  });

  $NC.resizeContainer("#divSubView1", clientWidth - viewWidth, clientHeight - viewHeight);
  // Grid 높이 조정
  $NC.resizeGrid("#grdDetail1", clientWidth - viewWidth, clientHeight - viewHeight - $NC.G_LAYOUT.header);

  $NC.resizeContainer("#divSubView2", viewWidth, clientHeight - viewHeight);
  // Grid 높이 조정
  $NC.resizeGrid("#grdDetail2", viewWidth, clientHeight - viewHeight - $NC.G_LAYOUT.header);

}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();
  $NC.setEnable("#btnAddBu", permission.canSave);
  $NC.setEnable("#btnDeleteBu", permission.canSave);
  $NC.setEnable("#btnAddCenter", permission.canSave);
  $NC.setEnable("#btnDeleteCenter", permission.canSave);
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  // 사업부 Key 입력
  case "BU_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: val
      };
      O_RESULT_DATA = $NP.getBuInfo({
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


/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {
  // 초기화
  $NC.clearGridData(G_GRDMASTER);
  $NC.clearGridData(G_GRDDETAIL1);
  $NC.clearGridData(G_GRDDETAIL2);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);

}

/**
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          row, cell, value
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

  var grdObject = null;
  var selectorCd = null;
  var selectorNm = null;
  var valueCd = null;
  var valueNm = null;

  // 기본물류센터
  if (args.grid === "grdDetail1") {
    grdObject = G_GRDDETAIL1;
    selectorCd = "#edtCenter_Cd";
    selectorNm = "#edtCenter_Nm";
    // 기본사업부
  } 

  if (grdObject.view.getEditorLock().isActive()) {
    grdObject.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(grdObject, args.row);
  var checkVal = $(e.target).is(":checked") ? "Y" : "N";
  var rowDataCheck = grdObject.data.getItem(args.row);
  var rowCount = grdObject.data.getLength();
  var mRow = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (args.cell == grdObject.view.getColumnIndex("CHK_YN")) {
    var rowData;
    grdObject.data.beginUpdate();

    for (var row = 0; row < rowCount; row++) {
      rowData = grdObject.data.getItem(row);

      if (rowDataCheck.id !== rowData.id) {
        rowData.CHK_YN = "N";
      } else {
        rowData.CHK_YN = checkVal;
        // 기본물류센터
        if (grdObject === G_GRDDETAIL1) {
          if (checkVal === "Y") {
            valueCd = rowData.CENTER_CD;
            valueNm = rowData.CENTER_NM;
          } else {
            valueCd = "";
            valueNm = "";
          }

          mRow.CENTER_CD = valueCd;
          mRow.CENTER_NM = valueNm;
          // 기본사업부
        }

        if (mRow.CRUD === "R") {
          mRow.CRUD = "U";
        } else if (mRow.CRUD === "N") {
          mRow.CRUD = "C";
        }
        G_GRDMASTER.data.updateItem(mRow.id, mRow);
      }

      grdObject.data.updateItem(rowData.id, rowData);
    }

    grdObject.data.endUpdate();

  }

  // 마지막 선택 Row 수정 상태로 변경
  grdObject.lastRowModified = true;

  // 기본물류센터(사업부) 값 세팅.
  $NC.setValue(selectorCd, valueCd);
  $NC.setValue(selectorNm, valueNm);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  $NC.setInitGridVar(G_GRDDETAIL1);
  $NC.setInitGridVar(G_GRDDETAIL2);

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var CERTIFY_DIV = $NC.getValue("#cboQCertify_Div", true);

  // User Center 데이터 조회
  $NC.serviceCallAndWait("/CS01011E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL1), onGetDetail1);

  G_GRDDETAIL2.queryParams = $NC.getParams({
    P_CENTER_CD: "%",
  });
  // Center 데이터 조회
  $NC.serviceCallAndWait("/CS01011E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL2), onGetDetail2);


  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_CERTIFY_DIV: CERTIFY_DIV,
  });

  // 사용자 정보 조회
  $NC.serviceCall("/CS01011E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

function _OnLoaded() {
  // Safari에서 관리물류센터, 물류센터 그리드의 Viewport 위치가 정상적으로 표시되지 않아서 Resize 호출
  _OnResize($(window));
}



/**
 * 현재 선택된 row Validation 체크.
 * 
 * @param row
 * @returns {Boolean}
 */
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
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.USER_ID)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }


  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }
  return true;
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  // 사용자 마스터
  var masterDS = [ ];
  var d_DS = [ ];
  var cu_DS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {

      var saveData = {
        P_USER_ID: rowData.USER_ID,
        P_USER_NM: rowData.USER_NM,
        P_USER_PWD: rowData.USER_PWD,
        P_CERTIFY_DIV: rowData.CERTIFY_DIV,
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_CUST_CD: rowData.CUST_CD,
        P_VENDOR_CD: rowData.VENDOR_CD,
        P_CARRIER_CD: rowData.CARRIER_CD,
        P_SYS_LANG: rowData.SYS_LANG,
        P_REG_USER_ID: null,
        P_REG_DATETIME: null,
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

  // 사용자별운영센터 마스터
  var detailDS = [ ];
  var d_DS = [ ];
  var cu_DS = [ ];
  // 필터링 된 데이터라 전체 데이터를 기준으로 처리
  var rows = G_GRDDETAIL1.data.getItems();
  var rowCount = rows.length;
  for (var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_USER_ID: rowData.USER_ID,
        P_USER_NOTICE_GROUP_CD: rowData.USER_NOTICE_GROUP_CD,
        P_REG_USER_ID: null,
        P_REG_DATETIME: null,
        P_CRUD: rowData.CRUD
      };
      if (rowData.CRUD === "D") {
        d_DS.push(saveData);
      } else {
        cu_DS.push(saveData);
      }
    }
  }
  detailDS = d_DS.concat(cu_DS);


  subDS = d_DS.concat(cu_DS);

  if (masterDS.length == 0 && detailDS.length == 0 && subDS.length == 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/CS01011E/save.do", {
    P_DS_DETAIL: $NC.toJson(detailDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError);
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
          $NC.setGridDisplayRows("#grdMaster", 0, 0);
        } else {
          $NC.setGridSelectRow(G_GRDMASTER, 0);
        }
      }

      var USER_ID = rowData.USER_ID;

      // 해당USER의 관리 물류센터 전체 삭제.
      var detailRow = G_GRDDETAIL1.data.getItems();
      var rowCount = detailRow.length;
      for (var i = 0; i < rowCount; i++) {
        var dsRow = detailRow[i];
        if (dsRow.USER_ID === USER_ID) {
          G_GRDDETAIL1.data.deleteItem(dsRow.id);
        }
      }
    } 
  }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "USER_ID",
    isCancel: true
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}


function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "USER_ID",
    field: "USER_ID",
    name: "사용자ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "USER_NM",
    field: "USER_NM",
    name: "사용자명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "CERTIFY_DIV_F",
    field: "CERTIFY_DIV_F",
    name: "사용자구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "CENTER_CD_B",
    field: "CENTER_CD",
    name: "기본물류센터",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CENTER_NM_B",
    field: "CENTER_NM",
    name: "기본물류센터명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "CUST_CD",
    field: "CUST_CD",
    name: "위탁사",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CUST_NM",
    field: "CUST_NM",
    name: "위탁사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "BU_CD_B",
    field: "BU_CD",
    name: "기본사업부",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM_B",
    field: "BU_NM",
    name: "기본사업부명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SYS_LANG_F",
    field: "SYS_LANG_F",
    name: "기본언어",
    minWidth: 120
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 사용자정보 그리드 초기화.
 */
function grdMasterInitialize() {

  var options = {
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CS01011E.RS_MASTER",
    sortCol: "USER_ID",
    gridOptions: options,
    canDblClick: true
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

  // 관리물류센터 필터링
  $NC.setInitGridVar(G_GRDDETAIL1);
  G_GRDDETAIL1.lastFilterVal = rowData.USER_ID;
  G_GRDDETAIL1.data.refresh();
  $NC.setGridSelectRow(G_GRDDETAIL1, 0);



  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}



function grdDetail1OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHK_YN",
    field: "CHK_YN",
    minWidth: 40,
    maxWidth: 40,
    resizable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "USER_NOTICE_GROUP_CD",
    field: "USER_NOTICE_GROUP_CD",
    name: "공지그룹코드",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "USER_NOTICE_GROUP_NM",
    field: "USER_NOTICE_GROUP_NM",
    name: "공지그룹명",
    minWidth: 120
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 관리물류센터 그리드 초기화.
 */
function grdDetail1Initialize() {

  var options = {
    multiSelect: true
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail1", {
    columns: grdDetail1OnGetColumns(),
    queryId: "CS01011E.RS_SUB1",
    sortCol: "CENTER_CD",
    gridOptions: options
  });

  G_GRDDETAIL1.view.onSelectedRowsChanged.subscribe(grdDetail1OnAfterScroll);
}

/**
 * grdDetail1 데이터 필터링 이벤트
 */
function grdDetail1OnFilter(item) {
  return G_GRDDETAIL1.lastFilterVal === item.USER_ID && item.CRUD !== "D";
}

/**
 * Row Change Event.
 * 
 * @param e
 * @param args
 */
function grdDetail1OnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDDETAIL1.lastRow != null) {
    if (row == G_GRDDETAIL1.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
    if ($NC.isNull(row)) {
      e.stopImmediatePropagation();
      $NC.setGridSelectRow(G_GRDDETAIL1, G_GRDDETAIL1.lastRow);
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail1", row + 1);
}

function grdDetail2OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "USER_NOTICE_GROUP_CD",
    field: "USER_NOTICE_GROUP_CD",
    name: "공지그룹코드",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "USER_NOTICE_GROUP_CD",
    field: "USER_NOTICE_GROUP_CD",
    name: "공지그룹명",
    minWidth: 120
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 물류센터 그리드 초기화.
 */
function grdDetail2Initialize() {

  var options = {
    multiSelect: true
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail2", {
    columns: grdDetail2OnGetColumns(),
    queryId: "WC.POP_CMCENTER",
    sortCol: "CENTER_CD",
    gridOptions: options
  });

  G_GRDDETAIL2.view.onSelectedRowsChanged.subscribe(grdDetail2OnAfterScroll);
}

/**
 * Row Change Event.
 * 
 * @param e
 * @param args
 */
function grdDetail2OnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDDETAIL2.lastRow != null) {
    if (row == G_GRDDETAIL2.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
    if ($NC.isNull(row)) {
      e.stopImmediatePropagation();
      $NC.setGridSelectRow(G_GRDDETAIL2, G_GRDDETAIL2.lastRow);
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail2", row + 1);
}


/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);

  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "USER_ID",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }

  } else {
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
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail1(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL1, ajaxData, grdDetail1OnFilter);

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  G_GRDDETAIL1.lastFilterVal = "";
  if (!$NC.isNull(rowData)) {
    G_GRDDETAIL1.lastFilterVal = rowData.USER_ID;
  }
  G_GRDDETAIL1.data.refresh();
  if (G_GRDDETAIL1.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL1.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL1, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL1, {
        selectKey: "USER_NOTICE_GROUP_CD",
        selectVal: G_GRDDETAIL1.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail1", 0, 0);
  }
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail2(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL2, ajaxData);
  if (G_GRDDETAIL2.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL2.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL2, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL2, {
        selectKey: "CENTER_CD",
        selectVal: G_GRDDETAIL2.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail2", 0, 0);
  }
}



/**
 * 저장 성공시
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "USER_ID"
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
 * 관리물류센터 등록
 */
function onBtnAddCenter() {

  if (G_GRDMASTER.data.getLength() === 0) {
    alert("공지그룹을  추가할 사용자를 선택하십시오.");
    return;
  }

  if (G_GRDDETAIL2.data.getLength() === 0) {
    return;
  }

  var rows = G_GRDDETAIL2.view.getSelectedRows();
  var USER_ID = null;
  var canAdd = false;
  G_GRDDETAIL1.data.beginUpdate();
  try {
    for (var i = 0; i < rows.length; i++) {
      var rowData = G_GRDDETAIL2.data.getItem(rows[i]);
      var rowCount = G_GRDDETAIL1.data.getLength();
      USER_ID = $NC.getValue("#edtUser_Id");
      canAdd = true;
      if (rowCount > 0) {
        for (var j = 0; j < rowCount; j++) {
          var rowCheck = G_GRDDETAIL1.data.getItem(j);
          if (rowCheck.USER_NOTICE_GROUP_CD === rowData.USER_NOTICE_GROUP_CD) {
            // alert("이미 추가되어있는 물류센터입니다.");
            // return;
            canAdd = false;
            break;
          }
        }
      }
      if (!canAdd) {
        continue;
      }
      var newRowData = {
        USER_ID: USER_ID,
        CENTER_CD: rowData.USER_NOTICE_GROUP_CD,
        CENTER_NM: rowData.USER_NOTICE_GROUP_NM,
        REG_USER_ID: null,
        REG_DATETIME: null,
        id: $NC.getGridNewRowId(),
        CRUD: "C"
      };

      G_GRDDETAIL1.data.addItem(newRowData);
    }
  } finally {
    G_GRDDETAIL1.data.endUpdate();
  }

  // 관리물류센터 필터링
  G_GRDDETAIL1.lastFilterVal = USER_ID;
  G_GRDDETAIL1.data.refresh();
  G_GRDDETAIL1.data.sort(G_GRDDETAIL1.onSortCompare, true);

  G_GRDDETAIL1.lastRow = null;
  $NC.setGridSelectRow(G_GRDDETAIL1, 0);
  $NC.setGridSelectRow(G_GRDDETAIL2, rows[rows.length - 1]);
}

/**
 * 관리물류센터 해제
 */
function onBtnDeleteCenter() {
  if (G_GRDDETAIL1.data.getLength() === 0) {
    return;
  }

  var rows = G_GRDDETAIL1.view.getSelectedRows();

  G_GRDDETAIL1.data.beginUpdate();
  for (var i = 0; i < rows.length; i++) {
    var rowData = G_GRDDETAIL1.data.getItem(rows[i]);
    // 기본 물류센터를 삭제 시, 기본물류센터 값 삭제.
    if (rowData.CHK_YN === "Y") {
      $NC.setValue("#edtCenter_Cd");
      $NC.setValue("#edtCenter_Nm");
      var mRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
      if (mRowData.CRUD === "R") {
        mRowData.CRUD = "U";
      }
      mRowData.USER_NOTICE_GROUP_CD = "";
      mRowData.USER_NOTICE_GROUP_NM = "";
      G_GRDMASTER.data.updateItem(mRowData.id, mRowData);
    }

    if (rowData.CRUD === "R") {
      rowData.CRUD = "D";
      G_GRDDETAIL1.data.updateItem(rowData.id, rowData);
    } else {
      G_GRDDETAIL1.data.deleteItem(rowData.id);
    }
  }
  G_GRDDETAIL1.data.endUpdate();

  $NC.setGridSelectRow(G_GRDDETAIL1, G_GRDDETAIL1.data.getLength() - 1);

  if (G_GRDDETAIL1.data.getLength() === 0) {
    $NC.setGridDisplayRows("#grdDetail1", 0, 0);
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

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
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
  onChangingCondition();
}

/**
 * 검색조건의 공급처 검색 이미지 클릭
 */
function showVendorPopup() {

  var CUST_CD = $NC.getValue("#edtCust_Cd");
  if ($NC.isNull(CUST_CD)) {
    alert("기본사업부를 먼저 선택하십시오.");
    return;
  }

  $NP.showVendorPopup({
    queryParams: {
      P_CUST_CD: CUST_CD,
      P_VENDOR_CD: "%",
      P_VIEW_DIV: "2"
    }
  }, onVendorPopup, function() {
    $NC.setFocus("#edtVendor_Cd", true);
  });
}

function onVendorPopup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtVendor_Cd", resultInfo.VENDOR_CD);
    $NC.setValue("#edtVendor_Nm", resultInfo.VENDOR_NM);

    rowData.VENDOR_CD = resultInfo.VENDOR_CD;
    rowData.VENDOR_NM = resultInfo.VENDOR_NM;
  } else {
    $NC.setValue("#edtVendor_Cd");
    $NC.setValue("#edtVendor_Nm");
    $NC.setFocus("#edtVendor_Cd", true);

    rowData.VENDOR_CD = "";
    rowData.VENDOR_NM = "";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

function showCarrierPopup() {

  var CARRIER_CD = $NC.getValue("#edtCarrier_Cd", true);
  $NP.showCarrierPopup({
    queryParams: {
      P_CARRIER_CD: CARRIER_CD,
      P_VIEW_DIV: "2"
    }
  }, onCarrierPopup, function() {
    $NC.setFocus("#edtCarrier_Cd", true);
  });
}

function onCarrierPopup(resultInfo) {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtCarrier_Cd", resultInfo.CARRIER_CD);
    $NC.setValue("#edtCarrier_Nm", resultInfo.CARRIER_NM);

    rowData.CARRIER_CD = resultInfo.CARRIER_CD;
    rowData.CARRIER_NM = resultInfo.CARRIER_NM;
  } else {
    $NC.setValue("#edtCarrier_Cd");
    $NC.setValue("#edtCarrier_Nm");
    $NC.setFocus("#edtCarrier_Cd", true);

    rowData.CARRIER_CD = "";
    rowData.CARRIER_NM = "";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}
