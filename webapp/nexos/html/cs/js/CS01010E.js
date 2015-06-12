/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    isPasswordChanged: null
  });
  $NC.G_USERINFO2 = {};

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
    selector: "#cboCertify_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    addAll: true,
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

  
  // 공지사항 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "GROUP_NOTICE_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboGroup_Notice_Div",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboGroup_Notice_Div", -1);
    }
  });

  // 계정활성화 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "USER_ENABLE",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboUser_Enable",
    codeField: "CODE_CD",
    fullNameField: "CODE_CD_F",
    onComplete: function() {
      $NC.setValue("#cboUser_Enable", -1);
    }
  });

  $NC.setValue("#edtQCust_Cd", $NC.G_USERINFO.CUST_CD);
  
  // 버튼 이벤트 연결
  $("#btnEntryUser").click(onEntryUser);
  // 사용자간편등록 사용불가(조회 후 사용)
  $NC.setEnable("#btnEntryUser", false);

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnAddBu").click(onBtnAddBu);
  $("#btnDeleteBu").click(onBtnDeleteBu);
  $("#btnAddCenter").click(onBtnAddCenter);
  $("#btnDeleteCenter").click(onBtnDeleteCenter);

//  $("#btnBrand_Cd").click(showBrandPopup);
  $("#btnQUser_Id").click(showUseridPopup);
  $("#btnOwn_Brand_Cd").click(showOwnBrandPopup);
  

  $("#btnAddMd").click(onBtnAddMd);
  $("#btnDeleteMd").click(onBtnDeleteMd);
  $("#Inquiry_Md").click(Inquiry_Md);
  
  // 그리드 초기화
  grdMasterInitialize();
  // 물류센터
  grdDetail1Initialize();
  grdDetail2Initialize();
  // 브랜드
  grdDetail3Initialize();
  grdDetail4Initialize();

  // 판매사
  grdDetail5Initialize();
  grdDetail6Initialize();

  // 프로그램 사용 권한 설정
  setUserProgramPermission();

  // 에디터 Disable
  $NC.setEnableGroup("#divDetailInfoView", false);
}

/**
 * 화면 리사이즈 Offset 계산
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.fixedRightWidth = 650;
  $NC.G_OFFSET.fixedCenterWidth = 50;
  $NC.G_OFFSET.fixedDetailHeight = 133;
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
  var viewHeight = Math.ceil(clientHeight / 2);
  var viewHeight1 = Math.ceil(clientHeight / 2);
  var viewHeight2 = Math.ceil(clientHeight / 2);
  // 중앙 버튼 사이즈 조정.
  $("#divBtnCenter").css({
    "width": $NC.G_OFFSET.fixedCenterWidth,
    "height": 50,
    "margin-top": (viewHeight - $NC.G_LAYOUT.margin1) / 2 - 90 + "px"
  });
  $("#divBtnBu").css({
    "width": $NC.G_OFFSET.fixedCenterWidth,
    "height": 50,
    "margin-top": (viewHeight - $NC.G_LAYOUT.margin1) / 2 - 70 + "px"
  });
  $("#divBtnMd").css({
    "width": $NC.G_OFFSET.fixedCenterWidth,
    "height": 90,
    "margin-top": (viewHeight - $NC.G_LAYOUT.margin1) / 2 - 70 + "px"
  });
  $("#test").css({
    "width": $NC.G_OFFSET.fixedCenterWidth,
    "height": 90,
    "margin-top": (viewHeight - $NC.G_LAYOUT.margin1) / 2 - 70 + "px"
  });
  $NC.resizeContainer("#divSubView1", clientWidth - viewWidth, clientHeight - viewHeight - 130);
  // Grid 높이 조정
  $NC.resizeGrid("#grdDetail1", clientWidth - viewWidth, clientHeight - viewHeight - $NC.G_LAYOUT.header - 130);

  $NC.resizeContainer("#divSubView2", viewWidth, clientHeight - viewHeight - 130);
  // Grid 높이 조정
  $NC.resizeGrid("#grdDetail2", viewWidth, clientHeight - viewHeight - $NC.G_LAYOUT.header - 130);

  $NC.resizeContainer("#divSubView3", clientWidth - viewWidth, clientHeight - viewHeight1 - 130);
  // Grid 높이 조정
  $NC.resizeGrid("#grdDetail3", clientWidth - viewWidth, clientHeight - viewHeight1 - $NC.G_LAYOUT.header - 130);

  $NC.resizeContainer("#divSubView4", viewWidth, clientHeight - viewHeight1 - 130);
  // Grid 높이 조정
  $NC.resizeGrid("#grdDetail4", viewWidth, clientHeight - viewHeight1 - $NC.G_LAYOUT.header - 130);

  $NC.resizeContainer("#divSubView5", clientWidth - viewWidth, clientHeight - viewHeight2 - 120);
  // Grid 높이 조정
  $NC.resizeGrid("#grdDetail5", clientWidth - viewWidth, clientHeight - viewHeight2 - $NC.G_LAYOUT.header - 120);

  $NC.resizeContainer("#divSubView6", viewWidth, clientHeight - viewHeight2 - 120);
  // Grid 높이 조정
  $NC.resizeGrid("#grdDetail6", viewWidth, clientHeight - viewHeight2 - $NC.G_LAYOUT.header - 120);
  
  

  $NC.resizeContainer("#divSubView7", viewWidth, clientHeight - viewHeight2 - 330);
  

  $NC.resizeContainer("#divSubView8", viewWidth, clientHeight - viewHeight2 - 330);
  /*
    $NC.resizeContainer("#divSubView5", viewWidth, viewHeight + 2);
    // Grid 높이 조정
    $NC.resizeGrid("#grdDetail5", viewWidth, viewHeight - $NC.G_LAYOUT.header + 2);
    

    $NC.resizeContainer("#divSubView6", viewWidth, viewHeight + 2);
    // Grid 높이 조정
    $NC.resizeGrid("#grdDetail6", viewWidth, viewHeight - $NC.G_LAYOUT.header + 2);
  */
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();

  // 저장
  $NC.setEnable("#btnEntryUser", permission.canSave && G_GRDMASTER.data.getLength() > 0);
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
  case "USER_ID":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
          P_USER_ID: val,
          P_CERTIFY_DIV: "%"
      };
      O_RESULT_DATA = $NP.getUserInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onUseridPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showUserPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onUseridPopup, onUseridPopup);
    }
    return;
  }

  onChangingCondition();
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {
  var id = view.prop("id").substr(3).toUpperCase();
  switch (id) {
  case "OWN_BRAND_CD":
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
      O_RESULT_DATA = $NP.getOwnBrand_allInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBrand_allPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup, onOwnBrandPopup);
    }
    break;
    /*
    case "BRAND_CD":
      var P_QUERY_PARAMS;
      var O_RESULT_DATA = [ ];
      if (!$NC.isNull(val)) {
        P_QUERY_PARAMS = {
          P_BRAND_CD: val,
          P_VIEW_DIV: '2'
        };
        O_RESULT_DATA = $NP.getBrandInfo({
          queryParams: P_QUERY_PARAMS
        });
      }
      if (O_RESULT_DATA.length <= 1) {
        onBrandPopup(O_RESULT_DATA[0]);
      } else {
        $NP.showBrandPopup({
          queryParams: P_QUERY_PARAMS,
          queryData: O_RESULT_DATA
        }, onBrandPopup, onBrandPopup);
      }
      break; 
      */ 
  }
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
  $NC.clearGridData(G_GRDDETAIL1);
  $NC.clearGridData(G_GRDDETAIL2);
  $NC.clearGridData(G_GRDDETAIL3);
  $NC.clearGridData(G_GRDDETAIL4);
  $NC.clearGridData(G_GRDDETAIL5);
  $NC.clearGridData(G_GRDDETAIL6);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);

  // 사용자상세정보 컴퍼넌트 초기화.
  setInputValue("#grdMaster");
  // 에디터 Disable
  $NC.setEnableGroup("#divDetailInfoView", false);
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
    // 기본브랜드
  } else if (args.grid === "grdDetail3") {
    grdObject = G_GRDDETAIL3;
    selectorCd = "#edtBu_Cd";
    selectorNm = "#edtBu_Nm";
  } else if (args.grid === "grdDetail5") {
    return false;
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

    for ( var row = 0; row < rowCount; row++) {
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
          // 기본브랜드
        } else if (grdObject === G_GRDDETAIL3) {
          var valueCust_Cd = null;
          var valueCust_Nm = null;
          if (checkVal === "Y") {
            valueCd = rowData.BU_CD;
            valueNm = rowData.BU_NM;
            valueCust_Cd = rowData.CUST_CD;
            valueCust_Nm = rowData.CUST_NM;
          } else {
            valueCd = "";
            valueNm = "";
            valueCust_Cd = "";
            valueCust_Nm = "";
          }

          mRow.BU_CD = valueCd;
          mRow.BU_NM = valueNm;
          mRow.CUST_CD = valueCust_Cd;
          mRow.CUST_NM = valueCust_Nm;
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

  // 기본물류센터(브랜드) 값 세팅.
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
  $NC.setInitGridVar(G_GRDDETAIL3);
  $NC.setInitGridVar(G_GRDDETAIL4);

  $NC.setInitGridVar(G_GRDDETAIL5);
  $NC.setInitGridVar(G_GRDDETAIL6);

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var CERTIFY_DIV = $NC.getValue("#cboQCertify_Div", true);
  var USER_ID = $NC.getValue("#edtQUser_Id", true);

  // User Center 데이터 조회
  $NC.serviceCallAndWait("/CS01010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL1), onGetDetail1);
//User Center 데이터 조회
  $NC.serviceCallAndWait("/CS01010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL5), onGetDetail5);

  // User Bu 데이터 조회
  $NC.serviceCall("/CS01010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL3), onGetDetail3);

  G_GRDDETAIL2.queryParams = $NC.getParams({
    P_CENTER_CD: "%",
  });

  // Center 데이터 조회
  $NC.serviceCallAndWait("/CS01010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL2), onGetDetail2);

  G_GRDDETAIL4.queryParams = $NC.getParams({
    P_BU_CD: "%",
    P_VIEW_DIV: "2",
  });
  // Bu 데이터 조회
  $NC.serviceCall("/CS01010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL4), onGetDetail4);

 
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD,
    P_CERTIFY_DIV: CERTIFY_DIV,
    P_USER_ID: USER_ID
  });

  // 사용자 정보 조회
  $NC.serviceCall("/CS01010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

function _OnLoaded() {
  // Safari에서 관리물류센터, 물류센터 그리드의 Viewport 위치가 정상적으로 표시되지 않아서 Resize 호출
  _OnResize($(window));
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
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
      $NC.setFocus("#edtUser_Id");
      return;
    }
  }

  var CERTIFY_DIV = $NC.getValue(cboQCertify_Div);
  CERTIFY_DIV = CERTIFY_DIV === "%" ? "1" : CERTIFY_DIV;

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    USER_ID: null,
    USER_NM: null,
    USER_PWD: null,
    CERTIFY_DIV: CERTIFY_DIV,
    CENTER_CD: null,
    BU_CD: null,
    SYS_LANG: "1",
    REG_USER_ID: null,
    REG_DATETIME: null,
    CERTIFY_DIV_F: $NC.getValueCombo("cboCertify_Div", {
      searchVal: CERTIFY_DIV,
      returnVal: "F"
    }),
    SYS_LANG_F: $NC.getValueCombo("cboSys_Lang", {
      searchVal: "1",
      returnVal: "F"
    }),
    
    CENTER_NM: null,
    BU_NM: null,
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
  if (G_GRDDETAIL1.data.getLength() === 0) {
    $NC.setGridDisplayRows("#grdDetail1", 0, 0);
  }
  if (G_GRDDETAIL3.data.getLength() === 0) {
    $NC.setGridDisplayRows("#grdDetail3", 0, 0);
  }
}

/**
 * 신규 데이터 생성 후 포커싱.
 * 
 * @param args
 */
function grdMasterOnNewRecord(args) {
  $NC.setFocus("#edtUser_Id");
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

  if (rowData.CRUD != "R") {
    // 신규일 때 차량 코드가 없으면 신규 취소
    if ($NC.isNull(rowData.USER_ID)) {
      alert("사용자ID를 입력하십시오.");
      $NC.setFocus("#edtUser_Id");
      return false;
    }
    if ($NC.isNull(rowData.USER_NM)) {
      alert("사용자명을 입력하십시오.");
      $NC.setFocus("#edtUser_Nm");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.CERTIFY_DIV)) {
      alert("사용자구분을 선택하십시오.");
      $NC.setFocus("#cboCertify_Div");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.USER_PWD)) {
      alert("패스워드를 입력하십시오.");
      $NC.setFocus("#edtUser_Pwd");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.CENTER_CD)) {
      alert("기본물류센터를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.BU_CD)) {
      alert("기본사업부를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.SYS_LANG)) {
      alert("기본언어를 선택하십시오.");
      $NC.setFocus("#cboSys_Lang");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      return false;
    }
    if ($NC.isNull(rowData.GROUP_NOTICE_DIV)) {
      alert("공지그룹를 선택하십시오.");
      $NC.setFocus("#cboGroup_Notice_Div");
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
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {

      if ($NC.isNull(rowData.USER_ID)) {
        alert("사용자ID를 입력하십시오.");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        $NC.setFocus("#edtUser_Id");
        return;
      }
      if ($NC.isNull(rowData.USER_NM)) {
        alert("사용자명을 입력하십시오.");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        $NC.setFocus("#edtUser_Nm");
        return;
      }
      if ($NC.isNull(rowData.USER_PWD)) {
        alert("패스워드를 입력하십시오.");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        $NC.setFocus("#edtUser_Pwd");
        return;
      }

      if ($NC.G_VAR.isPasswordChanged) {
        // 비밀번호을 수정함
        if (typeof devMode == 'undefined') {
          var varidPw = $NC.varidationPw(rowData.USER_PWD, $NC.G_USERINFO2);
          if (!varidPw) {
            return false;
          }
        }
      }
      
      if ($NC.isNull(rowData.CERTIFY_DIV)) {
        alert("사용자구분을 선택하십시오.");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        $NC.setFocus("#cboCertify_Div");
        return;
      }
      if ($NC.isNull(rowData.CENTER_CD)) {
        alert("기본물류센터를 선택하십시오.");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        $NC.setFocus("#grdDetail1");
        return;
      }

      if ($NC.isNull(rowData.SYS_LANG)) {
        alert("기본언어를 선택하십시오.");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        $NC.setFocus("#cboSys_Lang");
        return;
      }
      
      if ($NC.isNull(rowData.GROUP_NOTICE_DIV)) {
        alert("공지그룹 를 선택하십시오.");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        $NC.setFocus("#cboGroup_Notice_Div");
        return;
      }

      if ($NC.isNull(rowData.ENABLE)) {
        alert("계정활성화를 선택하십시오.");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        $NC.setFocus("#cboUser_Enable");
        return;
      }

      var saveData = {
        P_USER_ID: rowData.USER_ID,
        P_USER_NM: rowData.USER_NM,
        P_USER_PWD: rowData.USER_PWD,
        P_CERTIFY_DIV: rowData.CERTIFY_DIV,
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_SYS_LANG: rowData.SYS_LANG,
        P_GROUP_NOTICE_DIV: rowData.GROUP_NOTICE_DIV,
        P_USER_ENABLE: rowData.ENABLE,
        P_PW_CHANGED: $NC.G_VAR.isPasswordChanged ? 'Y' : 'N',
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
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_USER_ID: rowData.USER_ID,
        P_CENTER_CD: rowData.CENTER_CD,
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

  // 사용자별운영브랜드 마스터
  var subDS = [ ];
  var d_DS = [ ];
  var cu_DS = [ ];
  // 필터링 된 데이터라 전체 데이터를 기준으로 처리
  var rows = G_GRDDETAIL3.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_USER_ID: rowData.USER_ID,
        P_BU_CD: rowData.BU_CD,
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
  subDS = d_DS.concat(cu_DS);

  // 사용자별운영브랜드 마스터
  var subDS1 = [ ];
  var d_DS1 = [ ];
  var cu_DS1 = [ ];
  // 필터링 된 데이터라 전체 데이터를 기준으로 처리
  var rows = G_GRDDETAIL5.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_USER_ID: rowData.USER_ID,
        P_BRAND_CD: rowData.BRAND_CD,
        P_REG_USER_ID: null,
        P_REG_DATETIME: null,
        P_CRUD: rowData.CRUD
      };
      if (rowData.CRUD === "D") {
        d_DS1.push(saveData);
      } else {
        cu_DS1.push(saveData);
      }
    }
  }
  subDS1 = d_DS1.concat(cu_DS1);

  if (masterDS.length == 0 && detailDS.length == 0 && subDS.length == 0 && subDS1.length == 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/CS01010E/save.do", {
    P_DS_MASTER: $NC.toJson(masterDS),
    P_DS_DETAIL: $NC.toJson(detailDS),
    P_DS_SUB: $NC.toJson(subDS),
    P_DS_SUB1: $NC.toJson(subDS1),
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
          $NC.setEnableGroup("#divDetailInfoView", false);
          setInputValue("#grdMaster");
          $NC.setGridDisplayRows("#grdMaster", 0, 0);
        } else {
          $NC.setGridSelectRow(G_GRDMASTER, 0);
        }
      }

      var USER_ID = rowData.USER_ID;

      // 해당USER의 관리 물류센터 전체 삭제.
      var detailRow = G_GRDDETAIL1.data.getItems();
      var rowCount = detailRow.length;
      for ( var i = 0; i < rowCount; i++) {
        var dsRow = detailRow[i];
        if (dsRow.USER_ID === USER_ID) {
          G_GRDDETAIL1.data.deleteItem(dsRow.id);
        }
      }

      // 해당USER의 관리 브랜드 전체 삭제.
      var subRow = G_GRDDETAIL3.data.getItems();
      var rowCount = subRow.length;
      for ( var j = 0; j < rowCount; j++) {
        var ssRow = subRow[j];
        if (ssRow.USER_ID === USER_ID) {
          G_GRDDETAIL3.data.deleteItem(ssRow.id);
        }
      }

      // 해당USER의 관리 브랜드 전체 삭제.
      var subRow = G_GRDDETAIL5.data.getItems();
      var rowCount = subRow.length;
      for ( var j = 0; j < rowCount; j++) {
        var ssRow = subRow[j];
        if (ssRow.USER_ID === USER_ID) {
          G_GRDDETAIL5.data.deleteItem(ssRow.id);
        }
      }
    } else {
      rowData.CRUD = "D";
      G_GRDMASTER.data.updateItem(rowData.id, rowData);

      $NC.serviceCall("/CS01010E/callUserDelete.do", {
        P_QUERY_PARAMS: $NC.getParams({
          P_DELETE_USER_ID: rowData.USER_ID,
          P_USER_ID: $NC.G_USERINFO.USER_ID
        })
      }, onSave, onSaveError);
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

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

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
  $NC.setGridColumn(columns, {
    id: "USER_ENABLE",
    field: "ENABLE",
    name: "계정활성화",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "GROUP_NOTICE_DIV_F",
    field: "GROUP_NOTICE_DIV_F",
    name: "공지그룹",
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
    queryId: "CS01010E.RS_MASTER",
    sortCol: "USER_ID",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onDblClick.subscribe(grdMasterOnDblClick);
}

/**
 * 상단그리드 더블 클릭 : 팝업 표시
 */
function grdMasterOnDblClick(e, args) {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    return;
  }

  var permission = $NC.getProgramPermission();
  // 저장
  if (!permission.canSave) {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  var result = confirm("현재 선택한 사용자의 프로그램을 등록 하시겠습니까?");
  if (result) {
    var masterRowData = G_GRDMASTER.data.getItem(args.row);

    if (masterRowData) {

      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "CS01012P",
        PROGRAM_NM: "사용자별 프로그램 등록",
        url: "cs/CS01012P.html",
        width: 950,
        height: 600,
        userData: {
          P_USER_ID: masterRowData.USER_ID,
          P_USER_NM: masterRowData.USER_NM
        },
        onOk: function() {
          _Inquiry();
        }
      });
    }
  }
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
  $NC.G_USERINFO2 = G_GRDMASTER.data.getItem(row);
  $NC.G_VAR.isPasswordChanged = null;
  // 에디터 값 세팅
  setInputValue("#grdMaster", rowData);

  // 관리물류센터 필터링
  $NC.setInitGridVar(G_GRDDETAIL1);
  G_GRDDETAIL1.lastFilterVal = rowData.USER_ID;
  G_GRDDETAIL1.data.refresh();
  $NC.setGridSelectRow(G_GRDDETAIL1, 0);

  // 관리브랜드 필터링
  $NC.setInitGridVar(G_GRDDETAIL3);
  G_GRDDETAIL3.lastFilterVal = rowData.USER_ID;
  G_GRDDETAIL3.data.refresh();
  $NC.setGridSelectRow(G_GRDDETAIL3, 0);

  
  // MD브랜드 필터링
  $NC.setInitGridVar(G_GRDDETAIL5);
  G_GRDDETAIL5.lastFilterVal = rowData.USER_ID;
  G_GRDDETAIL5.data.refresh();
  $NC.setGridSelectRow(G_GRDDETAIL5, 0);
  
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
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
    $NC.setValue("#edtUser_Id", rowData.USER_ID);
    $NC.setValue("#edtUser_Nm", rowData.USER_NM);
    $NC.setValue("#edtUser_Pwd", rowData.USER_PWD);
    $NC.setValue("#cboCertify_Div", rowData.CERTIFY_DIV);
    $NC.setValue("#edtCenter_Cd", rowData.CENTER_CD);
    $NC.setValue("#edtCenter_Nm", rowData.CENTER_NM);
    $NC.setValue("#edtBu_Cd", rowData.BU_CD);
    $NC.setValue("#edtBu_Nm", rowData.BU_NM);
    $NC.setValue("#cboSys_Lang", rowData.SYS_LANG);
    $NC.setValue("#cboGroup_Notice_Div", rowData.GROUP_NOTICE_DIV);
    $NC.setValue("#cboUser_Enable", rowData.ENABLE);

    // 신규 데이터면 공급처코드 수정할 수 있게 함
    if (rowData.CRUD == "C" || rowData.CRUD == "N") {
      $NC.setEnable("#edtUser_Id");
    } else {
      $NC.setEnable("#edtUser_Id", false);
    }
  }
}

/**
 * 사용자정보 데이터 변경 시.
 * 
 * @param e
 * @param args
 */
function grdMasterOnCellChange(e, args) {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (rowData) {
    switch (args.col) {
    case "USER_ID":
      var searchIndex = $NC.getGridSearchVal(G_GRDMASTER, {
        searchKey: ["USER_ID"],
        searchVal: [args.val]
      });
      if (searchIndex > -1) {
        alert("중복사용자ID 입니다.");
        $NC.setValue("#edtUser_Id");
        $NC.setFocus("#edtUser_Id");
        return;
      }
      rowData.USER_ID = args.val;
      break;
  
    case "USER_NM":
      rowData.USER_NM = args.val;
      break;
    case "USER_PWD":
      rowData.USER_PWD = args.val;
      $NC.G_VAR.isPasswordChanged = true;
      break;
    case "CERTIFY_DIV":
      rowData.CERTIFY_DIV = args.val;
      rowData.CERTIFY_DIV_F = $NC.getValueCombo(args.view, "F");
      break;
    case "CENTER_CD":
      rowData.CENTER_CD = args.val;
      break;
    case "CENTER_NM":
      rowData.CENTER_NM = args.val;
      break;
    case "BU_CD":
      rowData.BU_CD = args.val;
      break;
    case "BU_NM":
      rowData.BU_NM = args.val;
      break;
    case "SYS_LANG":
      rowData.SYS_LANG = args.val;
      rowData.SYS_LANG_F = $NC.getValueCombo(args.view, "F");
      break;
    case "GROUP_NOTICE_DIV":
      rowData.GROUP_NOTICE_DIV = args.val;
      rowData.GROUP_NOTICE_DIV_F = $NC.getValueCombo(args.view, "F");
      break;
    case "USER_ENABLE":
      rowData.ENABLE = args.val;
      rowData.ENABLE_F = $NC.getValueCombo(args.view, "F");
      break;    }
    

    if (rowData.CRUD == "R") {
      rowData.CRUD = "U";
    }
    G_GRDMASTER.data.updateItem(rowData.id, rowData);

    // 마지막 선택 Row 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;
  }
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
    id: "CENTER_CD",
    field: "CENTER_CD",
    name: "코드",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CENTER_NM",
    field: "CENTER_NM",
    name: "명칭",
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
    queryId: "CS01010E.RS_SUB1",
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
    id: "CENTER_CD",
    field: "CENTER_CD",
    name: "코드",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "CENTER_NM",
    field: "CENTER_NM",
    name: "명칭",
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

function grdDetail3OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHK_YN",
    field: "CHK_YN",
    minWidth: 40,
    maxWidth: 40,
    resizable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "코드",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "명칭",
    minWidth: 120
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 관리사업부 그리드 초기화.
 */
function grdDetail3Initialize() {

  var options = {
    multiSelect: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail3", {
    columns: grdDetail3OnGetColumns(),
    queryId: "CS01010E.RS_SUB2",
    sortCol: "BU_CD",
    gridOptions: options
  });

  G_GRDDETAIL3.view.onSelectedRowsChanged.subscribe(grdDetail3OnAfterScroll);
}

/**
 * grdDetail3 데이터 필터링 이벤트
 */
function grdDetail3OnFilter(item) {
  return G_GRDDETAIL3.lastFilterVal === item.USER_ID && item.CRUD !== "D";
}

/**
 * Row Change Event.
 * 
 * @param e
 * @param args
 */
function grdDetail3OnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDDETAIL3.lastRow != null) {
    if (row == G_GRDDETAIL3.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
    if ($NC.isNull(row)) {
      e.stopImmediatePropagation();
      $NC.setGridSelectRow(G_GRDDETAIL3, G_GRDDETAIL3.lastRow);
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail3", row + 1);
}

function grdDetail4OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "코드",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "명칭",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "CUST_NM",
    field: "CUST_NM",
    name: "위탁사명",
    minWidth: 100
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 브랜드 그리드 초기화.
 */
function grdDetail4Initialize() {

  var options = {
    multiSelect: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail4", {
    columns: grdDetail4OnGetColumns(),
    queryId: "WC.POP_CMBU",
    sortCol: "BU_CD",
    gridOptions: options
  });

  G_GRDDETAIL4.view.onSelectedRowsChanged.subscribe(grdDetail4OnAfterScroll);
}

/**
 * Row Change Event.
 * 
 * @param e
 * @param args
 */
function grdDetail4OnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDDETAIL4.lastRow != null) {
    if (row == G_GRDDETAIL4.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
    if ($NC.isNull(row)) {
      e.stopImmediatePropagation();
      $NC.setGridSelectRow(G_GRDDETAIL4, G_GRDDETAIL4.lastRow);
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail4", row + 1);
}

function grdDetail5OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHK_YN",
    field: "CHK_YN",
    minWidth: 40,
    maxWidth: 40,
    resizable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "판매사",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "명칭",
    minWidth: 120
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 관리사업부 그리드 초기화.
 */
function grdDetail5Initialize() {

  var options = {
    multiSelect: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail5", {
    columns: grdDetail5OnGetColumns(),
    queryId: "CS01010E.RS_SUB4",
    sortCol: "BRAND_CD",
    gridOptions: options
  });

  G_GRDDETAIL5.view.onSelectedRowsChanged.subscribe(grdDetail5OnAfterScroll);
}

/**
 * grdDetail5 데이터 필터링 이벤트
 */
function grdDetail5OnFilter(item) {
  return G_GRDDETAIL5.lastFilterVal === item.USER_ID && item.CRUD !== "D";
}

/**
 * Row Change Event.
 * 
 * @param e
 * @param args
 */
function grdDetail5OnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDDETAIL5.lastRow != null) {
    if (row == G_GRDDETAIL5.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
    if ($NC.isNull(row)) {
      e.stopImmediatePropagation();
      $NC.setGridSelectRow(G_GRDDETAIL5, G_GRDDETAIL5.lastRow);
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail5", row + 1);
}

function grdDetail6OnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_CD",
    field: "OWN_BRAND_CD",
    name: "위탁사",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OWN_BRAND_NM",
    field: "OWN_BRAND_NM",
    name: "위탁사명",
    minWidth: 150
  });
//  $NC.setGridColumn(columns, {
//    id: "CUST_NM",
//    field: "CUST_NM",
//    name: "위탁사명",
//    minWidth: 100
//  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 브랜드 그리드 초기화.
 */
function grdDetail6Initialize() {

  var options = {
    multiSelect: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail6", {
    columns: grdDetail6OnGetColumns(),
    queryId: "WC.POP_OWNBRAND_CD_ALL",
    sortCol: "OWN_BRAND_CD",
    gridOptions: options
  });

  G_GRDDETAIL6.view.onSelectedRowsChanged.subscribe(grdDetail6OnAfterScroll);
}

/**
 * Row Change Event.
 * 
 * @param e
 * @param args
 */
function grdDetail6OnAfterScroll(e, args) {

  var row = args.rows[0];

  if (G_GRDDETAIL6.lastRow != null) {
    if (row == G_GRDDETAIL6.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    // Grid가 Multi Select가 될 경우 마지막 Row는 선택해제가 안되게 처리
    if ($NC.isNull(row)) {
      e.stopImmediatePropagation();
      $NC.setGridSelectRow(G_GRDDETAIL6, G_GRDDETAIL6.lastRow);
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail6", row + 1);
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
        selectKey: "USER_ID",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }

    // 사용자간편등록 사용 가능
    $NC.setEnable("#btnEntryUser", $NC.getProgramPermission().canSave);
  } else {
    $NC.setEnableGroup("#divDetailInfoView", false);
    $NC.setGridDisplayRows("#grdMaster", 0, 0);

    // 사용자간편등록 사용 불가
    $NC.setEnable("#btnEntryUser", false);
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
        selectKey: "CENTER_CD",
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
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail3(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL3, ajaxData, grdDetail3OnFilter);
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  G_GRDDETAIL3.lastFilterVal = "";
  if (!$NC.isNull(rowData)) {
    G_GRDDETAIL3.lastFilterVal = rowData.USER_ID;
  }
  G_GRDDETAIL3.data.refresh();
  if (G_GRDDETAIL3.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL3.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL3, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL3, {
        selectKey: "BU_CD",
        selectVal: G_GRDDETAIL3.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail3", 0, 0);
  }
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail4(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL4, ajaxData);
  if (G_GRDDETAIL4.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL4.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL4, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL4, {
        selectKey: "BU_CD",
        selectVal: G_GRDDETAIL4.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail4", 0, 0);
  }
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail5(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL5, ajaxData, grdDetail5OnFilter);
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  G_GRDDETAIL5.lastFilterVal = "";
  if (!$NC.isNull(rowData)) {
    G_GRDDETAIL5.lastFilterVal = rowData.USER_ID;
  }
  G_GRDDETAIL5.data.refresh();
  if (G_GRDDETAIL5.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL5.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL5, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL5, {
        selectKey: "BRAND_CD",
        selectVal: G_GRDDETAIL5.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail5", 0, 0);
  }
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetDetail6(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL6, ajaxData);
  if (G_GRDDETAIL6.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL6.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL6, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL6, {
        selectKey: "BRAND_CD",
        selectVal: G_GRDDETAIL6.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail6", 0, 0);
  }
}
/**
 * 저장 성공시
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {
  $NC.G_VAR.isPasswordChanged = null;
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
    alert("관리물류센터를 추가할 사용자를 선택하십시오.");
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
    for ( var i = 0; i < rows.length; i++) {
      var rowData = G_GRDDETAIL2.data.getItem(rows[i]);
      var rowCount = G_GRDDETAIL1.data.getLength();
      USER_ID = $NC.getValue("#edtUser_Id");
      canAdd = true;
      if (rowCount > 0) {
        for ( var j = 0; j < rowCount; j++) {
          var rowCheck = G_GRDDETAIL1.data.getItem(j);
          if (rowCheck.CENTER_CD === rowData.CENTER_CD) {
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
        CENTER_CD: rowData.CENTER_CD,
        CENTER_NM: rowData.CENTER_NM,
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
  for ( var i = 0; i < rows.length; i++) {
    var rowData = G_GRDDETAIL1.data.getItem(rows[i]);
    // 기본 물류센터를 삭제 시, 기본물류센터 값 삭제.
    if (rowData.CHK_YN === "Y") {
      $NC.setValue("#edtCenter_Cd");
      $NC.setValue("#edtCenter_Nm");
      var mRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
      if (mRowData.CRUD === "R") {
        mRowData.CRUD = "U";
      }
      mRowData.CENTER_CD = "";
      mRowData.CENTER_NM = "";
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
 * 관리브랜드 등록
 */
function onBtnAddBu() {

  if (G_GRDMASTER.data.getLength() === 0) {
    alert("관리브랜드를 추가할 사용자를 선택하십시오.");
    return;
  }

  if (G_GRDDETAIL4.data.getLength() === 0) {
    return;
  }

  var rows = G_GRDDETAIL4.view.getSelectedRows();
  var USER_ID = null;
  var canAdd = false;
  G_GRDDETAIL3.data.beginUpdate();
  try {
    for ( var i = 0; i < rows.length; i++) {
      var rowData = G_GRDDETAIL4.data.getItem(rows[i]);
      var rowCount = G_GRDDETAIL3.data.getLength();
      USER_ID = $NC.getValue("#edtUser_Id");
      canAdd = true;
      if (rowCount > 0) {
        for ( var j = 0; j < rowCount; j++) {
          var rowCheck = G_GRDDETAIL3.data.getItem(j);
          if (rowCheck.BU_CD === rowData.BU_CD) {
            // alert("이미 추가되어있는 브랜드입니다.");
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
        BU_CD: rowData.BU_CD,
        BU_NM: rowData.BU_NM,
        REG_USER_ID: null,
        REG_DATETIME: null,
        id: $NC.getGridNewRowId(),
        CRUD: "C"
      };

      G_GRDDETAIL3.data.addItem(newRowData);
    }
  } finally {
    G_GRDDETAIL3.data.endUpdate();
  }

  // 관리브랜드 필터링
  G_GRDDETAIL3.lastFilterVal = USER_ID;
  G_GRDDETAIL3.data.refresh();
  G_GRDDETAIL3.data.sort(G_GRDDETAIL3.onSortCompare, true);

  G_GRDDETAIL3.lastRow = null;
  $NC.setGridSelectRow(G_GRDDETAIL3, 0);
  $NC.setGridSelectRow(G_GRDDETAIL4, rows[rows.length - 1]);

  if (G_GRDDETAIL3.data.getLength() === 0) {
    $NC.setGridDisplayRows("#grdDetail3", 0, 0);
  }
}

/**
 * 관리브랜드 해제
 */
function onBtnDeleteBu() {
  if (G_GRDDETAIL3.data.getLength() === 0) {
    return;
  }

  var rows = G_GRDDETAIL3.view.getSelectedRows();

  G_GRDDETAIL3.data.beginUpdate();
  for ( var i = 0; i < rows.length; i++) {
    var rowData = G_GRDDETAIL3.data.getItem(rows[i]);
    // 기본 물류센터를 삭제 시, 기본물류센터 값 삭제.
    if (rowData.CHK_YN === "Y") {
      $NC.setValue("#edtBu_Cd");
      $NC.setValue("#edtBu_Nm");
      var mRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
      if (mRowData.CRUD === "R") {
        mRowData.CRUD = "U";
      }
      mRowData.BU_CD = "";
      mRowData.BU_NM = "";
      G_GRDMASTER.data.updateItem(mRowData.id, mRowData);
    }

    if (rowData.CRUD === "R") {
      rowData.CRUD = "D";
      G_GRDDETAIL3.data.updateItem(rowData.id, rowData);
    } else {
      G_GRDDETAIL3.data.deleteItem(rowData.id);
    }
  }
  G_GRDDETAIL3.data.endUpdate();

  $NC.setGridSelectRow(G_GRDDETAIL3, G_GRDDETAIL3.data.getLength() - 1);
}

/**
 * DM판매사 등록
 */
function onBtnAddMd() {

  if (G_GRDMASTER.data.getLength() === 0) {
    alert("관리위탁사를 추가할 사용자를 선택하십시오.");
    return;
  }

  if (G_GRDDETAIL6.data.getLength() === 0) {
    return;
  }

  var rows = G_GRDDETAIL6.view.getSelectedRows();
  var USER_ID = null;
//  var canAdd = false;
  G_GRDDETAIL5.data.beginUpdate();
  try {
    for ( var i = 0; i < rows.length; i++) {
      var rowData = G_GRDDETAIL6.data.getItem(rows[i]);
      var rowCount = G_GRDDETAIL5.data.getLength();
      USER_ID = $NC.getValue("#edtUser_Id");
      canAdd = true;
      if (rowCount > 0) {
        for ( var j = 0; j < rowCount; j++) {
          var rowCheck = G_GRDDETAIL5.data.getItem(j);
          if (rowCheck.BRAND_CD === rowData.OWN_BRAND_CD) {
//             alert("이미 추가되어있는 위탁사입니다.");
//             return;
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
        BRAND_CD: rowData.OWN_BRAND_CD,
        BRAND_NM: rowData.OWN_BRAND_NM,
        REG_USER_ID: null,
        REG_DATETIME: null,
        id: $NC.getGridNewRowId(),
        CRUD: "C"
      };

      
      G_GRDDETAIL5.data.addItem(newRowData);
    }
  } finally {
    G_GRDDETAIL5.data.endUpdate();
  }

  // DM판매사 필터링
  G_GRDDETAIL5.lastFilterVal = USER_ID;
  G_GRDDETAIL5.data.refresh();
  G_GRDDETAIL5.data.sort(G_GRDDETAIL5.onSortCompare, true);

  G_GRDDETAIL5.lastRow = null;
  $NC.setGridSelectRow(G_GRDDETAIL5, 0);
  $NC.setGridSelectRow(G_GRDDETAIL6, rows[rows.length - 1]);

  if (G_GRDDETAIL5.data.getLength() === 0) {
    $NC.setGridDisplayRows("#grdDetail5", 0, 0);
  }
}

/**
 * 관리브랜드 해제
 */
function onBtnDeleteMd() {
  if (G_GRDDETAIL5.data.getLength() === 0) {
    return;
  }

  var rows = G_GRDDETAIL5.view.getSelectedRows();

  G_GRDDETAIL5.data.beginUpdate();
  for ( var i = 0; i < rows.length; i++) {
    var rowData = G_GRDDETAIL5.data.getItem(rows[i]);
    // 기본 물류센터를 삭제 시, 기본물류센터 값 삭제.
    if (rowData.CHK_YN === "Y") {
      $NC.setValue("#edtBu_Cd");
      $NC.setValue("#edtBu_Nm");
      var mRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
      if (mRowData.CRUD === "R") {
        mRowData.CRUD = "U";
      }
      G_GRDMASTER.data.updateItem(mRowData.id, mRowData);
    }

    if (rowData.CRUD === "R") {
      rowData.CRUD = "D";
      G_GRDDETAIL5.data.updateItem(rowData.id, rowData);
    } else {
      G_GRDDETAIL5.data.deleteItem(rowData.id);
    }
  }
  G_GRDDETAIL5.data.endUpdate();

  $NC.setGridSelectRow(G_GRDDETAIL5, G_GRDDETAIL5.data.getLength() - 1);
}




function Inquiry_Md() {
  
//  var BRAND_CD = $NC.getValue("#edtBrand_Cd", true);
  var CUST_CD = $NC.getValue("#edtQCust_Cd", true);
  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var OWN_BRAND_CD = $NC.getValue("#edtOwn_Brand_Cd", true);
   
  G_GRDDETAIL6.queryParams = $NC.getParams({
    P_CUST_CD: CUST_CD,
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: OWN_BRAND_CD,
  });
  
  // BRAND 데이터 조회
  $NC.serviceCallAndWait("/CS01010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL6), onGetDetail6);

}
/**
 * 사용자 복사등록 버튼 호출.
 */
function onEntryUser() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    return;
  }
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "CS01011P",
    PROGRAM_NM: "사용자 간편등록",
    url: "cs/CS01011P.html",
    width: 610,
    height: 210,
    userData: {
      P_USER_ID: rowData.USER_ID,
      P_USER_NM: rowData.USER_NM
    },
    onOk: function() {
      _Inquiry();
    }
  });
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
 * 사용자ID 검색 이미지 클릭
 */
function showUseridPopup() {
  $NP.showUserPopup({
    P_USER_ID: "%",
    P_CERTIFY_DIV: "%"
  }, onUseridPopup, function() {
    $NC.setFocus("#edtQUser_Id", true);
  });
}

/**
 * 사용자ID 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onUseridPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQUser_Id", resultInfo.USER_ID);
    $NC.setValue("#edtQUser_Nm", resultInfo.USER_NM);
  } else {
    $NC.setValue("#edtQUser_Id");
    $NC.setValue("#edtQUser_Nm");
    $NC.setFocus("#edtQUser_Id", true);
  }
}


/**
 * 검색조건의 위탁사 검색 팝업 클릭
 */

function showOwnBrandPopup() {

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  var CUST_CD = $NC.getValue("#edtQCust_Cd");

  $NP.showOwnBrand_allPopup({
    P_CUST_CD: CUST_CD,
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtOwn_Brand_Cd", true);
  });
}

/**
 * 위탁사 검색 결과
 * 
 * @param seletedRowData
 */

function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {

    $NC.setValue("#edtOwn_Brand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtOwn_Brand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtOwn_Brand_Cd");
    $NC.setValue("#edtOwn_Brand_Nm");
    $NC.setFocus("#edtOwn_Brand_Cd", true);
  }
//  onChangingCondition();
}


/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showBrandPopup() {
  $NP.showBrandPopup({
    P_BRAND_CD: '%',
    P_VIEW_DIV: '2'
  }, onBrandPopup, function() {
    $NC.setFocus("#edtBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtBrand_Cd", resultInfo.BRAND_CD);
    $NC.setValue("#edtBrand_Nm", resultInfo.BRAND_NM);
  } else {
    $NC.setValue("#edtBrand_Cd");
    $NC.setValue("#edtBrand_Nm");
    $NC.setFocus("#edtBrand_Cd", true);
  }
  // onChangingCondition();
}
