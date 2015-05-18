/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 버튼 이벤트 연결

  $("#btnQBu_Cd").click(showUserBuPopup);
  $("#btnDownload").click(onBtnDownloadClick);
  $("#btnModify").click(onBtnModifyClick);
  $("#btnReadUserId").click(onBtnReadUserId);
  $("#btnEntryReply").click(onBtnEntryReplyClick);
  $("#btnModifyReply").click(onBtnModifyReplyClick);
  $("#btnDeleteReply").click(onBtnDeleteReplyClick);

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();

  // 프로그램 사용 권한 설정
  setUserProgramPermission();
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.rightViewWidth = 0;
  $NC.G_OFFSET.replyGridHeight = 100;
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.rightViewMinHeight = $("#divMasterInfoView").outerHeight(true) + $NC.G_LAYOUT.header
      + $NC.G_OFFSET.nonClientHeight + $NC.G_LAYOUT.margin2;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {
  var scrollOffset = parent.height() < $NC.G_OFFSET.rightViewMinHeight ? $NC.G_LAYOUT.scroll.width : 0;
  var clientWidth = parent.width() - $NC.G_OFFSET.rightViewWidth
      - ($NC.G_OFFSET.rightViewWidth > 0 ? $NC.G_LAYOUT.nonClientWidth + scrollOffset : $NC.G_LAYOUT.border1);
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Container 사이즈 조정
  $NC.resizeContainer("#divLeftView", clientWidth, clientHeight);
  $NC.resizeContainer("#divRightView", $NC.G_OFFSET.rightViewWidth + scrollOffset, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
  $NC.resizeGrid("#grdDetail", $("#grdDetail").parent().width(), $NC.G_OFFSET.replyGridHeight);
}

/**
 * 프로그램 사용 권한 설정
 */
function setUserProgramPermission() {

  var permission = $NC.getProgramPermission();

  // 저장
  $NC.setEnable("#btnModify", permission.canSave);
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change
  var id = view.prop("id").substr(4).toUpperCase();
  switch (id) {
  // 브랜드 값 변경시 마스터체크
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

  // 화면클리어
  onChangingCondition();
}

function onChangingCondition() {

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);

  // 조회시 전역 변수 값 초기화
  $NC.clearGridData(G_GRDMASTER);

  setInputValue("#grdMaster");
  $("#divRightView").hide();
  $NC.G_OFFSET.rightViewWidth = 0;
  _OnResize($(window));
}

/**
 * Input, Select Change Event 처리
 * 
 * @param e
 *          이벤트 핸들러
 * @param view
 *          대상 Object
 */
function _OnInputChange(e, view, val) {

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var BU_CD = $NC.getValue("#edtQBu_Cd", true);
  var NOTICE_TITLE = $NC.getValue("#edtQNotice_Title", true);
  var CONTENT_TEXT = $NC.getValue("#edtQContent_Text", false);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 데이터 조회
  G_GRDMASTER.queryParams = $NC.getParams({
    P_BU_CD: BU_CD,
    P_NOTICE_TITLE: NOTICE_TITLE,
    P_CONTENT_TEXT: CONTENT_TEXT,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });
  $NC.serviceCall("/CS01000E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "CS01001P",
    PROGRAM_NM: "공지사항등록/수정",
    url: "cs/CS01001P.html",
    width: 700,
    height: 430,
    userData: {
      P_PROCESS_CD: "N",
      P_BU_CD: $NC.getValue("#edtQBu_Cd"),
      P_BU_NM: $NC.getValue("#edtQBu_Nm"),
    },
    onOk: function() {
      _Inquiry();
    }
  });
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {
  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  // 그룹코드 수정 데이터
  var saveDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_WRITE_NO: rowData.WRITE_NO,
        P_CENTER_CD: rowData.CENTER_CD,
        P_BU_CD: rowData.BU_CD,
        P_USER_ID: rowData.USER_ID,
        P_NOTICE_DIV: rowData.NOTICE_DIV,
        P_NOTICE_TITLE: rowData.NOTICE_TITLE,
        P_CONTENT_HTML: rowData.CONTENT_HTML,
        P_CONTENT_TEXT: rowData.CONTENT_TEXT,
        P_NOTICE_FROM_DATE: rowData.NOTICE_FROM_DATE,
        P_NOTICE_TO_DATE: rowData.NOTICE_TO_DATE,
        P_FILE_NM: rowData.FILE_NM,
        P_FILE_SIZE: rowData.FILE_SIZE,
        P_ORG_FILE_NM: rowData.ORG_FILE_NM,
        P_ORG_FILE_SIZE: rowData.ORG_FILE_SIZE,
        P_CRUD: rowData.CRUD
      };
      saveDS.push(saveData);
    }
  }

  if (saveDS.length > 0) {
    $NC.serviceCall("/CS01000E/saveMaster.do", {
      P_DS_MASTER: $NC.toJson(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var result = confirm("공지사항을 삭제 하시겠습니까?");
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
        $NC.setGridSelectRow(G_GRDMASTER, 0);
      }
    } else {
      rowData.CRUD = "D";
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
      _Save();
    }
  }
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

function onBtnDownloadClick() {

  if (G_GRDMASTER.data.getLength() === 0) {
    alert("첨부파일 다운로드할 대상을 선택하십시오.");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if ($NC.isNull(rowData.FILE_NM)) {
    alert("첨부파일이 없는 공지사항입니다.");
    return;
  }

  $NC.G_MAIN.fileDownload("/CS01000E/attachmentDownload.do", {
    P_FILE_NM: rowData.FILE_NM
  });
}

function onBtnModifyClick() {

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "CS01001P",
    PROGRAM_NM: "공지사항등록/수정",
    url: "cs/CS01001P.html",
    width: 700,
    height: 430,
    userData: {
      P_PROCESS_CD: "U",
      P_WRITE_NO: rowData.WRITE_NO,
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_USER_ID: rowData.USER_ID,
      P_NOTICE_DIV: rowData.NOTICE_DIV,
      P_NOTICE_TITLE: rowData.NOTICE_TITLE,
      P_CONTENT_HTML: rowData.CONTENT_HTML,
      P_CONTENT_TEXT: rowData.CONTENT_TEXT,
      P_NOTICE_FROM_DATE: rowData.NOTICE_FROM_DATE,
      P_NOTICE_TO_DATE: rowData.NOTICE_TO_DATE,
      P_FILE_NM: rowData.FILE_NM,
      P_FILE_SIZE: rowData.FILE_SIZE,
      P_ORG_FILE_NM: rowData.ORG_FILE_NM,
      P_ORG_FILE_SIZE: rowData.ORG_FILE_SIZE
    },
    onOk: function() {
      var lastKeyVal = rowData.WRITE_NO;
      _Inquiry();
      G_GRDMASTER.lastKeyVal = lastKeyVal;
    }
  });
}

function onBtnEntryReplyClick() {
  if (G_GRDMASTER.data.getLength() == 0) {
    alert("덧글을 등록할 공지사항이 없습니다.");
    return;
  }
  var CONTENT_TEXT = $NC.getValue("#edtReply_Content_Text");
  if ($NC.isNull(CONTENT_TEXT)) {
    alert("덧글을 입력하십시오.");
    $NC.setFocus("#edtReply_Content_Text");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  var saveDetailDS = [ ];
  saveDetailDS.push({
    P_WRITE_NO: rowData.WRITE_NO,
    P_REPLY_DIV: "1",
    P_REPLY_NO: "",
    P_CONTENT_HTML: "",
    P_CONTENT_TEXT: CONTENT_TEXT,
    P_CRUD: "C"
  });

  $NC.serviceCall("/CS01000E/saveDetail.do", {
    P_DS_DETAIL: $NC.toJson(saveDetailDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError);
}

function onBtnModifyReplyClick() {
  if (G_GRDMASTER.data.getLength() == 0) {
    alert("덧글을 수정할 공지사항이 없습니다.");
    return;
  }

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("수정할 덧글이 없습니다.");
    return;
  }

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if (rowData.USER_ID != $NC.G_USERINFO.USER_ID) {
    alert("다른 사용자가 등록한 덧글입니다.");
    return;
  }

  var CONTENT_TEXT = $NC.getValue("#edtReply_Content_Text");
  if ($NC.isNull(CONTENT_TEXT)) {
    alert("덧글을 입력하십시오.");
    $NC.setFocus("#edtReply_Content_Text");
    return;
  }

  var saveDetailDS = [ ];
  saveDetailDS.push({
    P_WRITE_NO: rowData.WRITE_NO,
    P_REPLY_DIV: rowData.REPLY_DIV,
    P_REPLY_NO: rowData.REPLY_NO,
    P_CONTENT_HTML: "",
    P_CONTENT_TEXT: CONTENT_TEXT,
    P_CRUD: "U"
  });

  $NC.serviceCall("/CS01000E/saveDetail.do", {
    P_DS_DETAIL: $NC.toJson(saveDetailDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave, onSaveError);
}

function onBtnDeleteReplyClick() {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("덧글을 수정할 공지사항이 없습니다.");
    return;
  }

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("수정할 덧글이 없습니다.");
    return;
  }

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if (rowData.USER_ID != $NC.G_USERINFO.USER_ID) {
    alert("다른 사용자가 등록한 덧글입니다.");
    return;
  }

  var result = confirm("덧글을 삭제 하시겠습니까?");
  if (result) {
    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

    var saveDetailDS = [ ];
    saveDetailDS.push({
      P_WRITE_NO: rowData.WRITE_NO,
      P_REPLY_DIV: rowData.REPLY_DIV,
      P_REPLY_NO: rowData.REPLY_NO,
      P_CRUD: "D"
    });

    $NC.serviceCall("/CS01000E/saveDetail.do", {
      P_DS_DETAIL: $NC.toJson(saveDetailDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}
function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "WRITE_NO",
    field: "WRITE_NO",
    name: "공지번호",
    minWidth: 60,
    maxWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BU_CD_F",
    field: "BU_CD_F",
    name: "사업부",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "NOTICE_TITLE",
    field: "NOTICE_TITLE",
    name: "제목",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "NOTICE_DIV_D",
    field: "NOTICE_DIV_D",
    name: "공지구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "READ_CNT",
    field: "READ_CNT",
    name: "읽은수",
    minWidth: 50,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "REPLY_CNT",
    field: "REPLY_CNT",
    name: "덧글수",
    minWidth: 50,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "NEW_NOTICE_YN",
    field: "NEW_NOTICE_YN",
    name: "신규여부",
    minWidth: 60,
    maxWidth: 60,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "NOTICE_FROM_DATE",
    field: "NOTICE_FROM_DATE",
    name: "공지시작일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "NOTICE_TO_DATE",
    field: "NOTICE_TO_DATE",
    name: "공지종료일자",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "USER_NM",
    field: "USER_NM",
    name: "등록자",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "UPD_DATETIME",
    field: "UPD_DATETIME",
    name: "수정일시",
    minWidth: 150,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REG_DATETIME",
    field: "REG_DATETIME",
    name: "등록일시",
    minWidth: 150,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 2,
    specialRow: {
      compareKey: "IMPORTANT_NOTICE",
      compareVal: "1",
      compareOperator: "==",
      cssClass: "specialrow4"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CS01000E.RS_MASTER",
    sortCol: "WRITE_NO",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onDblClick.subscribe(grdMasterOnDblClick);
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  if ($NC.G_OFFSET.rightViewWidth > 0) {
    $("#divRightView").hide();
    $NC.G_OFFSET.rightViewWidth = 0;
    _OnResize($(window));
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdMasterOnDblClick(e, args) {

  var rowData = G_GRDMASTER.data.getItem(args.row);
  
  /*
  if(rowData.NOTICE_DIV !== '10'){
    $NC.setEnable("#btnReadUserId", false);
  } else {
    $NC.setEnable("#btnReadUserId", true);
  }
  */
  
  
  if (rowData) {
    // 에디터 값 세팅
    setInputValue("#grdMaster", rowData);

    // 조회시 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);

    // 데이터 조회
    G_GRDDETAIL.queryParams = $NC.getParams({
      P_WRITE_NO: rowData.WRITE_NO
    });
    $NC.serviceCall("/CS01000E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

    $NC.setInitCombo("/CS01000E/getDataSet.do", {
      P_QUERY_ID: "CS01000E.RS_SUB2",
      P_QUERY_PARAMS: $NC.getParams({
        P_WRITE_NO: rowData.WRITE_NO
      })
    }, {
      selector: "#cboReadUser",
      codeField: "USER_ID",
      fullNameField: "USER_ID_F"
    });

    $("#divRightView").show();
    _SetResizeOffset();
    $NC.G_OFFSET.rightViewWidth = 450;
    _OnResize($(window));
  } else {
    setInputValue("#grdMaster");
  }
}
function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "REPLY_NO",
    field: "REPLY_NO",
    name: "순번",
    minWidth: 50,
    maxWidth: 50,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "USER_NM",
    field: "USER_NM",
    name: "등록자",
    minWidth: 70
  });
  $NC.setGridColumn(columns, {
    id: "CONTENT_TEXT",
    field: "CONTENT_TEXT",
    name: "덧글",
    minWidth: 300
  });
  $NC.setGridColumn(columns, {
    id: "UPD_DATETIME",
    field: "UPD_DATETIME",
    name: "수정일시",
    minWidth: 150,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REG_DATETIME",
    field: "REG_DATETIME",
    name: "등록일시",
    minWidth: 150,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

  var options = {
    frozenColumn: 1,
    specialRow: {
      compareKey: "USER_ID",
      compareVal: $NC.G_USERINFO.USER_ID,
      compareOperator: "==",
      cssClass: "specialrow2"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "CS01000E.RS_DETAIL",
    sortCol: "REPLY_NO",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

function grdDetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  var masterRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var detailRowData = G_GRDDETAIL.data.getItem(row);

  var canEntry = masterRowData.NOTICE_TO_DATE >= $NC.G_USERINFO.LOGIN_DATE;
  $NC.setEnable("#btnEntryReply", canEntry);
  $NC.setEnable("#edtReply_Content_Text", canEntry);
  $NC.setEnable("#btnModifyReply", canEntry);
  $NC.setEnable("#btnDeleteReply", canEntry);

  if (canEntry) {
    var canModify = detailRowData.USER_ID == $NC.G_USERINFO.USER_ID;
    $NC.setEnable("#btnModifyReply", canModify);
    $NC.setEnable("#btnDeleteReply", canModify);
  }

  if (detailRowData.USER_ID == $NC.G_USERINFO.USER_ID) {
    $NC.setValue("#edtReply_Content_Text", detailRowData.CONTENT_TEXT);
  } else {
    $NC.setValue("#edtReply_Content_Text");
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "WRITE_NO",
        selectVal: G_GRDMASTER.lastKeyVal
      });

      grdMasterOnDblClick(null, {
        row: G_GRDMASTER.lastRow
      });
    }
  } else {
    if ($NC.G_OFFSET.rightViewWidth > 0) {
      $("#divRightView").hide();
      $NC.G_OFFSET.rightViewWidth = 0;
      _OnResize($(window));
    }

    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "1";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "1";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetDetail(ajaxData) {

  var masterRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var canEntry = masterRowData.NOTICE_TO_DATE >= $NC.G_USERINFO.LOGIN_DATE;

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "REPLY_NO",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setEnable("#btnEntryReply", canEntry);
    $NC.setEnable("#edtReply_Content_Text", canEntry);

    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }

  if (canEntry) {
    $NC.serviceCall("/CS01000E/readNotice.do", {
      P_QUERY_PARAMS: $NC.getParams({
        P_WRITE_NO: masterRowData.WRITE_NO,
        P_REPLY_DIV: "2",
        P_USER_ID: $NC.G_USERINFO.USER_ID
      })
    });
  }
}

function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "WRITE_NO"
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  if (rowData.CRUD === "D") {
    rowData.CRUD = "U";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
    // 마지막 선택 Row 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;
  }
}

function setInputValue(grdSelector, rowData) {

  if (grdSelector === "#grdMaster") {

    if ($NC.isNull(rowData)) {
      // 초기화시 기본값 지정
      rowData = {
        CRUD: "R"
      };
    }
    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtWrite_No", rowData["WRITE_NO"]);
    $NC.setValue("#edtBu_Cd", rowData["BU_CD"]);
    $NC.setValue("#edtBu_Nm", rowData["BU_NM"]);
    $NC.setValue("#edtNotice_Div", rowData["NOTICE_DIV_D"]);
    $NC.setValue("#edtUser_Id", rowData["USER_ID"]);
    $NC.setValue("#edtUser_Nm", rowData["USER_NM"]);
    $NC.setValue("#edtReg_Datetime", rowData["REG_DATETIME"]);
    $NC.setValue("#edtFile_Nm", rowData["FILE_NM"]);
    $NC.setValue("#edtFile_Size", rowData["FILE_SIZE"]);
    $NC.setValue("#edtNotice_Title", rowData["NOTICE_TITLE"]);
    $NC.setValue("#edtContent_Text", rowData["CONTENT_TEXT"]);

    $NC.setEnable("#btnModify", rowData["USER_ID"] == $NC.G_USERINFO.USER_ID && $NC.getProgramPermission().canSave);
    $NC.setEnable("#btnReadUserId", rowData["USER_ID"] == $NC.G_USERINFO.USER_ID && $NC.getProgramPermission().canSave);
    
    $NC.setEnable("#btnDownload", !$NC.isNull(rowData["FILE_NM"]));

    // 덧글 데이터 초기화
    $NC.setInitGridData(G_GRDDETAIL);
    $NC.setEnable("#btnEntryReply", false);
    $NC.setEnable("#btnModifyReply", false);
    $NC.setEnable("#btnDeleteReply", false);
    $NC.setEnable("#edtReply_Content_Text", false);
    $NC.setValue("#edtReply_Content_Text");
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


function onBtnReadUserId() {

  var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  
  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "CS01002P",
    PROGRAM_NM: "공지사항그룹등록/수정",
    url: "cs/CS01002P.html",
    width: 700,
    height: 430,
    userData: {
      P_WRITE_NO : lastRowData.WRITE_NO,
      P_NOTICE_DIV : lastRowData.NOTICE_DIV,
      P_NOTICE_FROM_DATE : lastRowData.NOTICE_FROM_DATE
    },
    onOk: function() {
      _Inquiry();
    }
  });
}