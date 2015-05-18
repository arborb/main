/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 버튼 이벤트 연결
  $("#btnDownload").click(onBtnDownloadClick);
  $("#btnEntryReply").click(onBtnEntryReplyClick);
  $("#btnModifyReply").click(onBtnModifyReplyClick);
  $("#btnDeleteReply").click(onBtnDeleteReplyClick);
  $("#btnRefresh").click(_Inquiry);
  $("#btnClose").click(onCancel);

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setInitGridData(G_GRDMASTER, $NC.G_VAR.userData.P_NITICE_DS);
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
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.centerViewHeight = 0;
  $NC.G_OFFSET.centerGridHeight = 172;
  $NC.G_OFFSET.bottomViewHeight = $("#divBottomView").outerHeight();
  $NC.G_OFFSET.topViewHeightOffset = $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.gridHeightOffset = $NC.G_LAYOUT.header + $NC.G_OFFSET.topViewHeightOffset;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.topViewHeightOffset - $NC.G_OFFSET.centerViewHeight
      - $NC.G_OFFSET.bottomViewHeight;
  var gridHeight = parent.height() - $NC.G_OFFSET.gridHeightOffset - $NC.G_OFFSET.centerViewHeight
      - $NC.G_OFFSET.bottomViewHeight;

  $NC.resizeContainer("#divTopView", clientWidth, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, gridHeight);

  if ($NC.G_OFFSET.centerViewHeight > 0) {
    $NC.resizeContainer("#divCenterView", clientWidth, $NC.G_OFFSET.centerViewHeight - $NC.G_LAYOUT.border1
        - $NC.G_LAYOUT.margin1);

    $NC.resizeGrid("#grdDetail", $("#grdDetail").parent().width(), $NC.G_OFFSET.centerGridHeight - $NC.G_LAYOUT.header);
  }
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

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

}

/**
 * 조회
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 데이터 조회
  G_GRDMASTER.queryParams = $NC.getParams({
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });
  $NC.serviceCall("/WC/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

function grdMasterInitialize() {
  var columns = [{
    id: "WRITE_NO",
    field: "WRITE_NO",
    name: "공지번호",
    minWidth: 70,
    maxWidth: 70,
    cssClass: "align-right"
  }, {
    id: "BU_CD_F",
    field: "BU_CD_F",
    name: "사업부",
    minWidth: 80
  }, {
    id: "NOTICE_TITLE",
    field: "NOTICE_TITLE",
    name: "제목",
    minWidth: 200
  }, {
    id: "READ_CNT",
    field: "READ_CNT",
    name: "읽은수",
    minWidth: 60,
    cssClass: "align-right"
  }, {
    id: "REPLY_CNT",
    field: "REPLY_CNT",
    name: "덧글수",
    minWidth: 60,
    cssClass: "align-right"
  }, {
    id: "NEW_NOTICE_YN",
    field: "NEW_NOTICE_YN",
    name: "신규여부",
    minWidth: 60,
    maxWidth: 60,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  }, {
    id: "NOTICE_FROM_DATE",
    field: "NOTICE_FROM_DATE",
    name: "공지시작일자",
    minWidth: 90,
    cssClass: "align-center"
  }, {
    id: "NOTICE_TO_DATE",
    field: "NOTICE_TO_DATE",
    name: "공지종료일자",
    minWidth: 90,
    cssClass: "align-center"
  }, {
    id: "USER_NM",
    field: "USER_NM",
    name: "등록자",
    minWidth: 70
  }, {
    id: "UPD_DATETIME",
    field: "UPD_DATETIME",
    name: "수정일시",
    minWidth: 150,
    cssClass: "align-center"
  }, {
    id: "REG_DATETIME",
    field: "REG_DATETIME",
    name: "등록일시",
    minWidth: 150,
    cssClass: "align-center"
  }];

  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: columns,
    queryId: "WC.POP_CSNOTICE",
    sortCol: "WRITE_NO",
    gridOptions: options
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

  if ($NC.G_OFFSET.centerViewHeight > 0) {
    $("#divCenterView").hide();
    $NC.G_OFFSET.centerViewHeight = 0;
    $NC.G_OFFSET.bottomViewHeight = $("#divBottomView").outerHeight();
    _OnResize($(window));
    $("#divBottomView").show();
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdMasterOnDblClick(e, args) {

  var rowData = G_GRDMASTER.data.getItem(args.row);
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

    $NC.G_OFFSET.centerViewHeight = 270;
    $NC.G_OFFSET.bottomViewHeight = 0;
    $("#divBottomView").hide();
    $("#divCenterView").show();
    _OnResize($(window));
    $("#divCenterView").hide();
    $("#divCenterView").show("slow");

    $NC.setFocus("#edtReply_Content_Text");
  } else {
    setInputValue("#grdMaster");
  }
}

function grdDetailInitialize() {
  var columns = [{
    id: "REPLY_NO",
    field: "REPLY_NO",
    name: "순번",
    minWidth: 40,
    maxWidth: 40,
    cssClass: "align-right"
  }, {
    id: "USER_NM",
    field: "USER_NM",
    name: "등록자",
    minWidth: 70
  }, {
    id: "CONTENT_TEXT",
    field: "CONTENT_TEXT",
    name: "덧글",
    minWidth: 250
  }, {
    id: "UPD_DATETIME",
    field: "UPD_DATETIME",
    name: "수정일시",
    minWidth: 150,
    cssClass: "align-center"
  }];

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
    columns: columns,
    queryId: "CS01000E.RS_DETAIL",
    sortCol: "REPLY_NO",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

function grdDetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL.lastRow != null) {
    if (row == G_GRDDETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

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
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
}

function onGetDetail(ajaxData) {

  var masterRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  var canEntry = masterRowData.NOTICE_TO_DATE >= $NC.G_USERINFO.LOGIN_DATE;

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.data.getLength() - 1);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "REPLY_NO",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
    $NC.setFocus("#edtReply_Content_Text");
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

  var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastRowData.WRITE_NO;
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
    $NC.setValue("#edtFile_Nm", rowData["FILE_NM"]);
    $NC.setValue("#edtFile_Size", rowData["FILE_SIZE"]);
    $NC.setValue("#edtNotice_Title", rowData["NOTICE_TITLE"]);
    $NC.setValue("#edtContent_Text", rowData["CONTENT_TEXT"]);

    $NC.setEnable("#btnModify", rowData["USER_ID"] == $NC.G_USERINFO.USER_ID);
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