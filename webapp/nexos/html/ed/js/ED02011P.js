/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null,
    TIME_DATA_DIV: ":",
    REPEAT_DATA_DIV: ","
  });

  $("#data-cycle-div1").show();
  $("#data-cycle-div2").hide();

  // 그리드 초기화
  grdDetailInitialize();
  // 그리드 초기화
  grdSubInitialize();

  // 버튼 클릭 이벤트 연결
  $("#btnClose").click(onCancel); // 닫기버튼
  $("#btnEntrySave").click(_Save); // 저장 버튼
  $("#btnSub3").click(OnBtnSub3Click); // 수신항목 전체추가 버튼

  $("#edtBu_Cd").prop("readonly", true); // 사업부 readonly
  $NC.setEnable("#edtOrder_No", false); // 예정번호 비활성화

  $("#btnEntryNew").click(_New); // 특정수신구주기추가
  $("#btnEntryDelete").click(_Delete); // 특정수신구주기추가
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.masterHeight = 344;
  $NC.G_OFFSET.subGridWidth = 205;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight
      + $NC.G_LAYOUT.margin1 + $NC.G_LAYOUT.border1;

}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;
  $NC.resizeContainer("#divMasterView", clientWidth, $NC.G_OFFSET.masterHeight);
  $NC.resizeContainer("#divDetailView", clientWidth, clientHeight - $NC.G_OFFSET.masterHeight);

  var height = clientHeight - $NC.G_OFFSET.masterHeight - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdDetail", clientWidth, height);

  clientWidth = $NC.G_OFFSET.subGridWidth;
  clientHeight = $("#tdSub").height() - $NC.G_LAYOUT.border1;
  height = clientHeight - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdSub", clientWidth, height);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
  $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);

  var masterDS;

  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {

    var EDI_DIV = $NC.G_VAR.userData.P_EDI_DIV === "%" ? "" : $NC.G_VAR.userData.P_EDI_DIV;

    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      EDI_DIV: EDI_DIV,
      DEFINE_NO: "",
      DEFINE_NM: "",
      DATA_DIV: "01",
      DEFINE_DIV: "1",
      LINK_DB_NM: "",
      LINK_TABLE_NM: "",
      LINK_WHERE_TEXT: "",
      XLS_FIRST_ROW: "",
      TXT_DELIMETER_YN: "N",
      TXT_COL_DELIMETER: "",
      XML_TAG_ROOT: "",
      XML_TAG_BUNCH: "",
      XML_TAG_SUB_BUNCH: "",
      PREFIX_FILE_NM: "",
      AUTO_EXEC_YN: "N",
      REMOTE_DIV: "",
      REMOTE_IP: "",
      REMOTE_PORT: "",
      REMOTE_PASSIVE_YN: "N",
      REMOTE_USER_ID: "",
      REMOTE_USER_PWD: "",
      REMOTE_CHARSET: "",
      REMOTE_DIR: "",
      EDI_DIR: "",
      WEBSERVICE_URL: "",
      WEBSERVICE_METHOD: "",
      DATA_CYCLE_DIV: "",
      REPEAT_EXEC_TIME: "",
      REMARK1: "",
      CRUD: "C"
    };

    // 마스터 데이터 세팅
    masterDS = $NC.G_VAR.masterData;

    $NC.setEnable("#edtLink_Db_Nm", false);
    $NC.setEnable("#edtLink_Table_Nm", false);
    // $NC.setEnable("#edtLink_Where_Text", false);
    $NC.setEnable("#chkTxt_Delimeter_Yn", false);
    $NC.setEnable("#edtTxt_Col_Delimeter", false);
    $NC.setEnable("#edtXml_Tag_Root", false);
    $NC.setEnable("#edtXml_Tag_Bunch", false);
    $NC.setEnable("#edtXml_Tag_Sub_Bunch", false);
    $NC.setEnable("#edtXls_First_Row", false);
    $NC.setValue("#edtPrefix_File_Nm");
    $NC.setValue("#chkAuto_Exec_Yn");
    $NC.setValue("#edtRemote_Ip");
    $NC.setValue("#edtRemote_Port");
    $NC.setValue("#edtRemote_User_Id");
    $NC.setValue("#edtRemote_User_Pwd");
    $NC.setValue("#edtRemote_Edi_Dir");
    $NC.setValue("#edtEdi_Dir");
    $NC.setValue("#edtRemote_Charset");
    $NC.setValue("#edtWebService_Url");
    $NC.setValue("#edtWebService_Method");
    $NC.setValue("#edtRemark1");
    $NC.setFocus("#cboEdi_Div");

  } else {
    var CRUD = "R";
    // 마스터 데이터 세팅
    masterDS = $NC.G_VAR.userData.P_MASTER_DS;

    $NC.setValue("#edtDefine_No", masterDS.DEFINE_NO);
    $NC.setValue("#edtDefine_Nm", masterDS.DEFINE_NM);
    $NC.setValue("#edtLink_Db_Nm", masterDS.LINK_DB_NM);
    $NC.setValue("#edtLink_Table_Nm", masterDS.LINK_TABLE_NM);
    $NC.setValue("#edtLink_Where_Text", masterDS.LINK_WHERE_TEXT);
    $NC.setValue("#chkTxt_Delimeter_Yn", masterDS.TXT_DELIMETER_YN);
    $NC.setValue("#chkRemote_Passive_Yn", masterDS.REMOTE_PASSIVE_YN);
    $NC.setValue("#edtTxt_Col_Delimeter", masterDS.TXT_COL_DELIMETER);
    $NC.setValue("#edtXml_Tag_Root", masterDS.XML_TAG_ROOT);
    $NC.setValue("#edtXml_Tag_Bunch", masterDS.XML_TAG_BUNCH);
    $NC.setValue("#edtXml_Tag_Sub_Bunch", masterDS.XML_TAG_SUB_BUNCH);
    $NC.setValue("#edtXls_First_Row", masterDS.XLS_FIRST_ROW);
    $NC.setValue("#edtPrefix_File_Nm", masterDS.PREFIX_FILE_NM);
    $NC.setValue("#chkAuto_Exec_Yn", masterDS.AUTO_EXEC_YN);
    $NC.setValue("#edtRemote_Ip", masterDS.REMOTE_IP);
    $NC.setValue("#edtRemote_Port", masterDS.REMOTE_PORT);
    $NC.setValue("#edtRemote_User_Id", masterDS.REMOTE_USER_ID);
    $NC.setValue("#edtRemote_User_Pwd", masterDS.REMOTE_USER_PWD);
    $NC.setValue("#edtRemote_Dir", masterDS.REMOTE_DIR);
    $NC.setValue("#edtRemote_Charset", masterDS.REMOTE_CHARSET);
    $NC.setValue("#edtEdi_Dir", masterDS.EDI_DIR);
    $NC.setValue("#edtWebService_Url", masterDS.WEBSERVICE_URL);
    $NC.setValue("#edtWebService_Method", masterDS.WEBSERVICE_METHOD);
    $NC.setValue("#edtRemark1", masterDS.REMARK1);

    var REPEAT_TIME = null;
    var strRepeat_Time = "";
    switch (masterDS.DATA_CYCLE_DIV) {
    case "1":
      strRepeat_Time = masterDS.REPEAT_EXEC_TIME;
      REPEAT_TIME = strRepeat_Time.split($NC.G_VAR.REPEAT_DATA_DIV);
      G_GRDSUB.data.beginUpdate();
      try {
        for ( var row in REPEAT_TIME) {
          var newRowData = {
            REPEAT_TIME: REPEAT_TIME[row],
            id: $NC.getGridNewRowId(),
            CRUD: CRUD
          };
          G_GRDSUB.data.addItem(newRowData);
        }
      } finally {
        G_GRDSUB.data.endUpdate();
      }
      break;
    case "2":
      strRepeat_Time = masterDS.REPEAT_EXEC_TIME;
      REPEAT_TIME = strRepeat_Time.split($NC.G_VAR.REPEAT_DATA_DIV);
      if (REPEAT_TIME.length == "3") {
        $NC.setValue("#edtStart_Time", REPEAT_TIME[0]);
        $NC.setValue("#edtEnd_Time", REPEAT_TIME[1]);
        $NC.setValue("#edtRepeat_Time", REPEAT_TIME[2]);
      } else {
        $NC.setValue("#edtRepeat_Time", REPEAT_TIME[0]);
      }
      break;
    }

    $NC.G_VAR.masterData = {
      BU_CD: masterDS.BU_CD,
      EDI_DIV: masterDS.EDI_DIV,
      DEFINE_NO: masterDS.DEFINE_NO,
      DEFINE_NM: masterDS.DEFINE_NM,
      DATA_DIV: masterDS.DATA_DIV,
      DEFINE_DIV: masterDS.DEFINE_DIV,
      LINK_DB_NM: masterDS.LINK_DB_NM,
      LINK_TABLE_NM: masterDS.LINK_TABLE_NM,
      LINK_WHERE_TEXT: masterDS.LINK_WHERE_TEXT,
      XLS_FIRST_ROW: masterDS.XLS_FIRST_ROW,
      TXT_DELIMETER_YN: masterDS.TXT_DELIMETER_YN,
      TXT_COL_DELIMETER: masterDS.TXT_COL_DELIMETER,
      XML_TAG_ROOT: masterDS.XML_TAG_ROOT,
      XML_TAG_BUNCH: masterDS.XML_TAG_BUNCH,
      XML_TAG_SUB_BUNCH: masterDS.XML_TAG_SUB_BUNCH,
      PREFIX_FILE_NM: masterDS.PREFIX_FILE_NM,
      AUTO_EXEC_YN: masterDS.AUTO_EXEC_YN,
      REMOTE_DIV: masterDS.REMOTE_DIV,
      REMOTE_IP: masterDS.REMOTE_IP,
      REMOTE_PORT: masterDS.REMOTE_PORT,
      REMOTE_PASSIVE_YN: masterDS.REMOTE_PASSIVE_YN,
      REMOTE_USER_ID: masterDS.REMOTE_USER_ID,
      REMOTE_USER_PWD: masterDS.REMOTE_USER_PWD,
      REMOTE_DIR: masterDS.REMOTE_DIR,
      REMOTE_CHARSET: masterDS.REMOTE_CHARSET,
      EDI_DIR: masterDS.EDI_DIR,
      WEBSERVICE_URL: masterDS.WEBSERVICE_URL,
      WEBSERVICE_METHOD: masterDS.WEBSERVICE_METHOD,
      DATA_CYCLE_DIV: masterDS.DATA_CYCLE_DIV,
      REPEAT_EXEC_TIME: masterDS.REPEAT_EXEC_TIME,
      REMARK1: masterDS.REMARK1,
      CRUD: CRUD
    };

    G_GRDDETAIL.view.setColumns(grdDetailOnGetColumns(masterDS.DATA_DIV));

    // 디테일 데이터 세팅
    var detailDS = $NC.G_VAR.userData.P_DETAIL_DS;
    var rowData;
    G_GRDDETAIL.data.beginUpdate();
    try {
      for ( var row in detailDS) {
        rowData = detailDS[row];
        var newRowData = {
          BU_CD: rowData.BU_CD,
          EDI_DIV: rowData.EDI_DIV,
          DEFINE_NO: rowData.DEFINE_NO,
          COLUMN_NM: rowData.COLUMN_NM,
          COLUMN_ID: rowData.COLUMN_ID,
          DATA_TYPE: rowData.DATA_TYPE,
          DATA_NULL_YN: rowData.DATA_NULL_YN,
          DATA_DEFAULT: rowData.DATA_DEFAULT,
          DATE_FORMAT_DIV: rowData.DATE_FORMAT_DIV,
          DATE_INPUT_DIV: rowData.DATE_INPUT_DIV,
          IF_CODE_GRP: rowData.IF_CODE_GRP,
          LINK_COLUMN_NM: rowData.LINK_COLUMN_NM,
          TXT_POSITION: rowData.TXT_POSITION,
          TXT_LENGTH: rowData.TXT_LENGTH,
          XLS_COLUMN_NM: rowData.XLS_COLUMN_NM,
          XML_TAG_NM: rowData.XML_TAG_NM,
          XML_TAG_ATTR: rowData.XML_TAG_ATTR,
          DATA_TYPE_F: rowData.DATA_TYPE_F,
          DATE_FORMAT_DIV_F: rowData.DATE_FORMAT_DIV_F,
          DATE_INPUT_DIV_F: rowData.DATE_INPUT_DIV_F,
          IF_CODE_GRP_D: rowData.IF_CODE_GRP_D,
          REMARK1: rowData.REMARK1,
          id: $NC.getGridNewRowId(),
          CRUD: CRUD
        };
        G_GRDDETAIL.data.addItem(newRowData);
      }
    } finally {
      G_GRDDETAIL.data.endUpdate();
    }

    // 수정일 경우 입력불가 항목 비활성화 처리
    $NC.setEnable("#cboEdi_Div", false);
    $NC.setEnable("#edtDefine_No", false);
    $NC.setEnable("#edtDefine_Nm", false);
    $NC.setEnable("#cboData_Div", false);

    $NC.setGridSelectRow(G_GRDDETAIL, 0);
  }

  // DBLINK일 경우
  if (masterDS.DATA_DIV == "01") {
    $NC.setEnable("#edtLink_Db_Nm");
    $NC.setEnable("#edtLink_Table_Nm");
    // $NC.setEnable("#edtLink_Where_Text");
    $NC.setEnable("#chkTxt_Delimeter_Yn", false);
    $NC.setEnable("#edtTxt_Col_Delimeter", false);
    $NC.setEnable("#edtXml_Tag_Root", false);
    $NC.setEnable("#edtXml_Tag_Bunch", false);
    $NC.setEnable("#edtXml_Tag_Sub_Bunch", false);
    $NC.setEnable("#edtXls_First_Row", false);

    $NC.setValue("#chkTxt_Delimeter_Yn", "N");
    $NC.setValue("#edtTxt_Col_Delimeter");
    $NC.setValue("#edtXml_Tag_Root");
    $NC.setValue("#edtXml_Tag_Bunch");
    $NC.setValue("#edtXml_Tag_Sub_Bunch");
    $NC.setValue("#edtXls_First_Row");

  }
  // EXCEL일 경우
  if (masterDS.DATA_DIV == "02") {
    $NC.setEnable("#edtLink_Db_Nm", false);
    $NC.setEnable("#edtLink_Table_Nm", false);
    // $NC.setEnable("#edtLink_Where_Text", false);
    $NC.setEnable("#chkTxt_Delimeter_Yn", false);
    $NC.setEnable("#edtTxt_Col_Delimeter", false);
    $NC.setEnable("#edtXml_Tag_Root", false);
    $NC.setEnable("#edtXml_Tag_Bunch", false);
    $NC.setEnable("#edtXml_Tag_Sub_Bunch", false);
    $NC.setEnable("#edtXls_First_Row");

    $NC.setValue("#edtLink_Db_Nm");
    $NC.setValue("#edtLink_Table_Nm");
    $NC.setValue("#edtLink_Where_Text");
    $NC.setValue("#chkTxt_Delimeter_Yn", "N");
    $NC.setValue("#edtTxt_Col_Delimeter");
    $NC.setValue("#edtXml_Tag_Root");
    $NC.setValue("#edtXml_Tag_Bunch");
    $NC.setValue("#edtXml_Tag_Sub_Bunch");

  }
  // TEXT일 경우
  if (masterDS.DATA_DIV == "03") {
    $NC.setEnable("#edtLink_Db_Nm", false);
    $NC.setEnable("#edtLink_Table_Nm", false);
    // $NC.setEnable("#edtLink_Where_Text", false);
    $NC.setEnable("#chkTxt_Delimeter_Yn");
    $NC.setEnable("#edtTxt_Col_Delimeter", $NC.G_VAR.masterData.TXT_DELIMETER_YN == "Y");
    $NC.setEnable("#edtXml_Tag_Root", false);
    $NC.setEnable("#edtXml_Tag_Bunch", false);
    $NC.setEnable("#edtXml_Tag_Sub_Bunch", false);
    $NC.setEnable("#edtXls_First_Row", false);

    $NC.setValue("#edtLink_Db_Nm");
    $NC.setValue("#edtLink_Table_Nm");
    $NC.setValue("#edtLink_Where_Txt");
    $NC.setValue("#edtXml_Tag_Root");
    $NC.setValue("#edtXml_Tag_Bunch");
    $NC.setValue("#edtXml_Tag_Sub_Bunch");
    $NC.setValue("#edtXls_First_Row");
  }
  // XML일 경우
  if (masterDS.DATA_DIV == "04") {
    $NC.setEnable("#edtLink_Db_Nm", false);
    $NC.setEnable("#edtLink_Table_Nm", false);
    // $NC.setEnable("#edtLink_Where_Text", false);
    $NC.setEnable("#chkTxt_Delimeter_Yn", false);
    $NC.setEnable("#edtTxt_Col_Delimeter", false);
    $NC.setEnable("#edtXml_Tag_Root");
    $NC.setEnable("#edtXml_Tag_Bunch");
    $NC.setEnable("#edtXml_Tag_Sub_Bunch");
    $NC.setEnable("#edtXls_First_Row", false);

    $NC.setValue("#edtLink_Db_Nm");
    $NC.setValue("#edtLink_Table_Nm");
    $NC.setValue("#edtLink_Where_Txt");
    $NC.setValue("#edtXls_First_Row");
    $NC.setValue("#chkTxt_Delimeter_Yn", "N");
    $NC.setValue("#edtTxt_Col_Delimeter");
  }

  // 자동실행여부에 따른 활성화/비활성화
  $NC.setEnable("#cboData_Cycle_Div", masterDS.AUTO_EXEC_YN == "Y");

  if (masterDS.DATA_CYCLE_DIV == "1") {
    $("#data-cycle-div1").show();
    $("#data-cycle-div2").hide();
  } else if (masterDS.DATA_CYCLE_DIV == "2") {
    $("#data-cycle-div1").hide();
    $("#data-cycle-div2").show();
  } else {
    $("#data-cycle-div1").hide();
    $("#data-cycle-div2").hide();
  }

  // 수신구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "EDI_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "1",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboEdi_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? "F" : null,
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N" && ($NC.isNull($NC.G_VAR.masterData.EDI_DIV))) {
        $NC.G_VAR.masterData.EDI_DIV = $NC.getValue("#cboEdi_Div");
      } else {
        $NC.setValue("#cboEdi_Div", $NC.G_VAR.masterData.EDI_DIV);
      }
    }
  });

  // 수신처리구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "DATA_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboData_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? "F" : null,
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.DATA_DIV = $NC.getValue("#cboData_Div");
      } else {
        $NC.setValue("#cboData_Div", $NC.G_VAR.masterData.DATA_DIV);
      }
    }
  });

  // 수신주기구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "DATA_CYCLE_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboData_Cycle_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    // selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? null : null,
    onComplete: function() {
      // if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
      // $NC.G_VAR.masterData.DATA_CYCLE_DIV = $NC.getValue("#cboData_Cycle_Div");
      // } else {
      $NC.setValue("#cboData_Cycle_Div", $NC.G_VAR.masterData.DATA_CYCLE_DIV);
      // }
    }
  });

  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "REMOTE_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboRemote_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    addEmpty: true,
    // selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? null : null,
    onComplete: function() {
      // if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
      // $NC.G_VAR.masterData.REMOTE_DIV = $NC.getValue("#cboRemote_Div");
      // } else {
      $NC.setValue("#cboRemote_Div", $NC.G_VAR.masterData.REMOTE_DIV);
      // }
    }
  });

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

  var id = view.prop("id").substr(3).toUpperCase();
  masterDataOnChange(e, {
    col: id,
    val: val
  });
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

  // 현재 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }

  // 현재 수정모드면
  if (G_GRDSUB.view.getEditorLock().isActive()) {
    G_GRDSUB.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDSUB.lastRow != null) {
    if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
      return;
    }
  }

  var rowCount = G_GRDSUB.data.getLength();
  if (rowCount > 0) {
    // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
    var rowData = G_GRDSUB.data.getItem(rowCount - 1);
    if (rowData.CRUD == "N") {
      $NC.setFocusGrid(G_GRDSUB, rowCount - 1, G_GRDSUB.view.getColumnIndex("REPEAT_TIME"), true);
      return;
    }
  }

  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    REPEAT_TIME: "",
    id: $NC.getGridNewRowId(),
    CRUD: "N"
  };

  G_GRDSUB.data.addItem(newRowData);
  $NC.setGridSelectRow(G_GRDSUB, rowCount);
  if (rowCount === 0) {
    $NC.setGridDisplayRows("#grdSub", rowCount + 1, G_GRDSUB.data.getLength());
  }

  // 수정 상태로 변경
  G_GRDSUB.lastRowModified = true;

  // 신규 데이터 생성 후 이벤트 호출
  grdSubOnNewRecord({
    row: rowCount,
    rowData: newRowData
  });
}

/**
 * 저장 /** 저장
 */
function _Save() {

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
    alert("사업부를 입력하십시오.");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.EDI_DIV)) {
    alert("수신구분을 선택하십시오.");
    $NC.setFocus("#cboEdi_Div");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.DEFINE_NO)) {
    alert("정의번호를 입력하십시오.");
    $NC.setFocus("#edtDefine_No");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.DEFINE_NM)) {
    alert("정의명칭을 입력하십시오.");
    $NC.setFocus("#edtDefine_Nm");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.DATA_DIV)) {
    alert("수신처리구분을 선택하십시오.");
    $NC.setFocus("#cboData_Div");
    return;
  }
  // DBLINK
  if ($NC.G_VAR.masterData.DATA_DIV == "01") {
    if ($NC.isNull($NC.G_VAR.masterData.LINK_TABLE_NM)) {
      alert("[DBLINK]테이블명을 입력하십시오.");
      $NC.setFocus("#edtLink_Table_Nm");
      return;
    }

    // EXCEL
  } else if ($NC.G_VAR.masterData.DATA_DIV == "02") {
    if ($NC.isNull($NC.G_VAR.masterData.XLS_FIRST_ROW)) {
      alert("[EXCEL]데이터첫행을 입력하십시오.");
      $NC.setFocus("#edtXls_First_Row");
      return;
    }

    // TEXT
  } else if ($NC.G_VAR.masterData.DATA_DIV == "03") {
    if ($NC.isNull($NC.G_VAR.masterData.TXT_DELIMETER_YN)) {
      alert("[TEXT]구분자사용여부를 선택하십시오.");
      $NC.setFocus("#chkTxt_Delimeter_Yn");
      return;
    }

    if ($NC.G_VAR.masterData.TXT_DELIMETER_YN == "Y" && $NC.isNull($NC.G_VAR.masterData.TXT_COL_DELIMETER)) {
      alert("[TEXT]구분자를 입력하십시오.");
      $NC.setFocus("#edtTxt_Col_Delimeter");
      return;
    }
    // XML
  } else if ($NC.G_VAR.masterData.DATA_DIV == "04") {
    if ($NC.isNull($NC.G_VAR.masterData.XML_TAG_ROOT)) {
      alert("[XML]루트태그를 선택하십시오.");
      $NC.setFocus("#edtXml_Tag_Root");
      return;
    }
  }

  // 현재 수정모드면
  if (G_GRDSUB.view.getEditorLock().isActive()) {
    G_GRDSUB.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDSUB.lastRow != null) {
    if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
      return;
    }
  }

  var REPEAT_EXEC_TIME = "";
  var arrayRepeat_Time = new Array();
  var rowData = null;
  switch ($NC.getValue("#cboData_Cycle_Div")) {
  case "1":
    if (G_GRDSUB.data.getLength() == 0) {
      alert("수행주기 데이터가 없습니다.");
      return;
    }
    for (var row = 0; row < G_GRDSUB.data.getLength(); row++) {
      rowData = G_GRDSUB.data.getItem(row);
      arrayRepeat_Time.push(rowData.REPEAT_TIME);
    }
    arrayRepeat_Time = arrayRepeat_Time.sort();
    REPEAT_EXEC_TIME = arrayRepeat_Time.join();
    break;
  case "2":
    var START_TIME = $NC.getValue("#edtStart_Time");
    var END_TIME = $NC.getValue("#edtEnd_Time");
    var REPEAT_TIME = $NC.getValue("#edtRepeat_Time");
    if ($NC.isNull(START_TIME) && $NC.isNull(END_TIME)) {
      if ($NC.isNull(REPEAT_TIME)) {
        alert("수행주기를 초단위로 입력하십시오.");
        $NC.setFocus("#edtRepeat_Time");
        return;
      }

      REPEAT_EXEC_TIME = REPEAT_TIME;
    } else {
      var strRepeat_Time = "";
      var HOUR_TIME = 0;
      var MINUTE_TIME = 0;
      var ARRAY_TIME = new Array();

      if ($NC.isNull(START_TIME)) {
        alert("시작시각을 입력하십시오.");
        $NC.setFocus("#edtStart_Time");
        return;
      }

      strRepeat_Time = START_TIME;
      ARRAY_TIME = strRepeat_Time.split($NC.G_VAR.TIME_DATA_DIV);
      if (isNaN(ARRAY_TIME[0]) || isNaN(ARRAY_TIME[1])) {
        alert("시작시각을 시분(00:00)형식으로 정확히 입력하십시오.");
        $NC.setFocus("#edtStart_Time", true);
        return;
      }

      HOUR_TIME = parseInt(ARRAY_TIME[0], 10);
      MINUTE_TIME = parseInt(ARRAY_TIME[1], 10);

      if (Number(HOUR_TIME) < 0 || Number(HOUR_TIME) > 23) {
        alert("시간을 정확히 입력하십시오.");
        $NC.setFocus("#edtStart_Time", true);
        return;
      }
      if (Number(MINUTE_TIME) < 0 || Number(MINUTE_TIME) > 59) {
        alert("분을 정확히 입력하십시오.");
        $NC.setFocus("#edtStart_Time", true);
        return;
      }

      START_TIME = $NC.lPad(HOUR_TIME.toString(), 2) + ":" + $NC.lPad(MINUTE_TIME.toString(), 2);

      if ($NC.isNull(END_TIME)) {
        alert("종료시각을 입력하십시오.");
        $NC.setFocus("#edtEnd_Time");
        return;
      }

      strRepeat_Time = END_TIME;
      ARRAY_TIME = strRepeat_Time.split($NC.G_VAR.TIME_DATA_DIV);
      if (isNaN(ARRAY_TIME[0]) || isNaN(ARRAY_TIME[1])) {
        alert("종료시각을 시분(00:00)형식으로 정확히 입력하십시오.");
        $NC.setFocus("#edtEnd_Time", true);
        return;
      }

      HOUR_TIME = parseInt(ARRAY_TIME[0], 10);
      MINUTE_TIME = parseInt(ARRAY_TIME[1], 10);

      if (Number(HOUR_TIME) < 0 || Number(HOUR_TIME) > 23) {
        alert("시간을 정확히 입력하십시오.");
        $NC.setFocus("#edtEnd_Time", true);
        return;
      }
      if (Number(MINUTE_TIME) < 0 || Number(MINUTE_TIME) > 59) {
        alert("분을 정확히 입력하십시오.");
        $NC.setFocus("#edtEnd_Time", true);
        return;
      }

      END_TIME = $NC.lPad(HOUR_TIME.toString(), 2) + ":" + $NC.lPad(MINUTE_TIME.toString(), 2);

      if (START_TIME > END_TIME) {
        alert("수신주기 시작,종료시각 범위 입력오류입니다.");
        $NC.setFocus("#edtEnd_Time");
        return;
      }

      if ($NC.isNull(REPEAT_TIME)) {
        alert("수행주기를 초단위로 입력하십시오.");
        $NC.setFocus("#edtRepeat_Time");
        return;
      }
      REPEAT_EXEC_TIME = START_TIME + $NC.G_VAR.REPEAT_DATA_DIV + END_TIME + $NC.G_VAR.REPEAT_DATA_DIV + REPEAT_TIME;
    }
    break;
  }

  if ($NC.G_VAR.masterData.REMOTE_DIV == "1" || $NC.G_VAR.masterData.REMOTE_DIV == "3") {
    $NC.G_VAR.masterData.WEBSERVICE_URL = "";
    $NC.G_VAR.masterData.WEBSERVICE_METHOD = "";
  } else if ($NC.G_VAR.masterData.REMOTE_DIV == "2") {
    $NC.G_VAR.masterData.REMOTE_IP = "";
    $NC.G_VAR.masterData.REMOTE_PORT = "";
    $NC.G_VAR.masterData.REMOTE_PASSIVE_YN = "";
    $NC.G_VAR.masterData.REMOTE_DIR = "";
    $NC.G_VAR.masterData.EDI_DIR = "";
    $NC.G_VAR.masterData.REMOTE_CHARSET = "";
  } else {
    $NC.G_VAR.masterData.REMOTE_IP = "";
    $NC.G_VAR.masterData.REMOTE_PORT = "";
    $NC.G_VAR.masterData.REMOTE_PASSIVE_YN = "";
    $NC.G_VAR.masterData.REMOTE_USER_ID = "";
    $NC.G_VAR.masterData.REMOTE_USER_PWD = "";
    $NC.G_VAR.masterData.REMOTE_DIR = "";
    $NC.G_VAR.masterData.EDI_DIR = "";
    $NC.G_VAR.masterData.REMOTE_CHARSET = "";
    $NC.G_VAR.masterData.WEBSERVICE_URL = "";
    $NC.G_VAR.masterData.WEBSERVICE_METHOD = "";
  }
  var masterDS = [ ];
  masterDS.push({
    P_BU_CD: $NC.G_VAR.masterData.BU_CD,
    P_EDI_DIV: $NC.G_VAR.masterData.EDI_DIV,
    P_DEFINE_NO: $NC.G_VAR.masterData.DEFINE_NO,
    P_DEFINE_NM: $NC.G_VAR.masterData.DEFINE_NM,
    P_DATA_DIV: $NC.G_VAR.masterData.DATA_DIV,
    P_DEFINE_DIV: $NC.G_VAR.masterData.DEFINE_DIV,
    P_LINK_DB_NM: $NC.G_VAR.masterData.LINK_DB_NM,
    P_LINK_TABLE_NM: $NC.G_VAR.masterData.LINK_TABLE_NM,
    P_LINK_WHERE_TEXT: $NC.G_VAR.masterData.LINK_WHERE_TEXT,
    P_XLS_FIRST_ROW: $NC.G_VAR.masterData.XLS_FIRST_ROW,
    P_TXT_DELIMETER_YN: $NC.G_VAR.masterData.TXT_DELIMETER_YN,
    P_TXT_COL_DELIMETER: $NC.G_VAR.masterData.TXT_COL_DELIMETER,
    P_XML_TAG_ROOT: $NC.G_VAR.masterData.XML_TAG_ROOT,
    P_XML_TAG_BUNCH: $NC.G_VAR.masterData.XML_TAG_BUNCH,
    P_XML_TAG_SUB_BUNCH: $NC.G_VAR.masterData.XML_TAG_SUB_BUNCH,
    P_PREFIX_FILE_NM: $NC.G_VAR.masterData.PREFIX_FILE_NM,
    P_AUTO_EXEC_YN: $NC.G_VAR.masterData.AUTO_EXEC_YN,
    P_REMOTE_DIV: $NC.G_VAR.masterData.REMOTE_DIV,
    P_REMOTE_IP: $NC.G_VAR.masterData.REMOTE_IP,
    P_REMOTE_PORT: $NC.G_VAR.masterData.REMOTE_PORT,
    P_REMOTE_PASSIVE_YN: $NC.G_VAR.masterData.REMOTE_PASSIVE_YN,
    P_REMOTE_USER_ID: $NC.G_VAR.masterData.REMOTE_USER_ID,
    P_REMOTE_USER_PWD: $NC.G_VAR.masterData.REMOTE_USER_PWD,
    P_REMOTE_DIR: $NC.G_VAR.masterData.REMOTE_DIR,
    P_EDI_DIR: $NC.G_VAR.masterData.EDI_DIR,
    P_REMOTE_CHARSET: $NC.G_VAR.masterData.REMOTE_CHARSET,
    P_WEBSERVICE_URL: $NC.G_VAR.masterData.WEBSERVICE_URL,
    P_WEBSERVICE_METHOD: $NC.G_VAR.masterData.WEBSERVICE_METHOD,
    P_DATA_CYCLE_DIV: $NC.G_VAR.masterData.DATA_CYCLE_DIV,
    P_REPEAT_EXEC_TIME: REPEAT_EXEC_TIME,
    P_REMARK1: $NC.G_VAR.masterData.REMARK1,
    P_CRUD: $NC.G_VAR.masterData.CRUD
  });

  // 현재 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }

  var detailDS = [ ];
  var rows = G_GRDDETAIL.data.getItems();
  var rowCount = rows.length;
  for (var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_BU_CD: $NC.G_VAR.masterData.BU_CD,
        P_EDI_DIV: $NC.G_VAR.masterData.EDI_DIV,
        P_DEFINE_NO: $NC.G_VAR.masterData.DEFINE_NO,
        P_COLUMN_NM: rowData.COLUMN_NM,
        P_COLUMN_ID: rowData.COLUMN_ID,
        P_DATA_TYPE: rowData.DATA_TYPE,
        P_DATA_NULL_YN: rowData.DATA_NULL_YN,
        P_DATA_DEFAULT: rowData.DATA_DEFAULT,
        P_DATE_FORMAT_DIV: rowData.DATE_FORMAT_DIV,
        P_DATE_INPUT_DIV: rowData.DATE_INPUT_DIV,
        P_IF_CODE_GRP: rowData.IF_CODE_GRP,
        P_LINK_COLUMN_NM: rowData.LINK_COLUMN_NM,
        P_TXT_POSITION: rowData.TXT_POSITION,
        P_TXT_LENGTH: rowData.TXT_LENGTH,
        P_XLS_COLUMN_NM: rowData.XLS_COLUMN_NM,
        P_XML_TAG_NM: rowData.XML_TAG_NM,
        P_XML_TAG_ATTR: rowData.XML_TAG_ATTR,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      detailDS.push(saveData);
    }
  }

  if ($NC.G_VAR.masterData.CRUD === "R" && detailDS.length === 0) {
    alert("수정 후 저장하십시오.");
    return;
  }

  $NC.serviceCall("/ED02010E/save.do", {
    P_DS_MASTER: $NC.toJson(masterDS),
    P_DS_DETAIL: $NC.toJson(detailDS),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

  if (G_GRDSUB.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }

  var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);

  G_GRDSUB.data.deleteItem(rowData.id);

  // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
  if (G_GRDSUB.lastRow > 1) {
    $NC.setGridSelectRow(G_GRDSUB, G_GRDSUB.lastRow - 1);
  } else {
    G_GRDSUB.lastRow = null;
    $NC.setGridSelectRow(G_GRDSUB, 0);
  }
  // 마지막 선택 Row 수정 상태 복원
  G_GRDSUB.lastRowModified = false;

  if ($NC.G_VAR.masterData.CRUD == "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }

}

/**
 * 마스터 데이터 변경시 처리
 */
function masterDataOnChange(e, args) {

  switch (args.col) {
  case "EDI_DIV":
    $NC.G_VAR.masterData.EDI_DIV = args.val;
    $NC.clearGridData(G_GRDDETAIL);
    break;
  case "DEFINE_NO":
    $NC.G_VAR.masterData.DEFINE_NO = args.val;
    break;
  case "DEFINE_NM":
    $NC.G_VAR.masterData.DEFINE_NM = args.val;
    break;
  case "DATA_DIV":
    $NC.G_VAR.masterData.DATA_DIV = args.val;
    // DBLINK일 경우
    if (args.val == "01") {
      $NC.setEnable("#edtLink_Db_Nm");
      $NC.setEnable("#edtLink_Table_Nm");
      // $NC.setEnable("#edtLink_Where_Text");
      $NC.setEnable("#chkTxt_Delimeter_Yn", false);
      $NC.setEnable("#edtTxt_Col_Delimeter", false);
      $NC.setEnable("#edtXml_Tag_Root", false);
      $NC.setEnable("#edtXml_Tag_Bunch", false);
      $NC.setEnable("#edtXml_Tag_Sub_Bunch", false);
      $NC.setEnable("#edtXls_First_Row", false);

      $NC.setValue("#chkTxt_Delimeter_Yn", "N");
      $NC.setValue("#edtTxt_Col_Delimeter");
      $NC.setValue("#edtXml_Tag_Root");
      $NC.setValue("#edtXml_Tag_Bunch");
      $NC.setValue("#edtXml_Tag_Sub_Bunch");
      $NC.setValue("#edtXls_First_Row");

      $NC.G_VAR.masterData.TXT_DELIMETER_YN = "";
      $NC.G_VAR.masterData.TXT_COL_DELIMETER = "";
      $NC.G_VAR.masterData.XML_TAG_ROOT = "";
      $NC.G_VAR.masterData.XML_TAG_BUNCH = "";
      $NC.G_VAR.masterData.XML_TAG_SUB_BUNCH = "";
      $NC.G_VAR.masterData.XLS_FIRST_ROW = "";

    }
    // EXCEL일 경우
    if (args.val == "02") {
      $NC.setEnable("#edtLink_Db_Nm", false);
      $NC.setEnable("#edtLink_Table_Nm", false);
      // $NC.setEnable("#edtLink_Where_Text", false);
      $NC.setEnable("#chkTxt_Delimeter_Yn", false);
      $NC.setEnable("#edtTxt_Col_Delimeter", false);
      $NC.setEnable("#edtXml_Tag_Root", false);
      $NC.setEnable("#edtXml_Tag_Bunch", false);
      $NC.setEnable("#edtXml_Tag_Sub_Bunch", false);
      $NC.setEnable("#edtXls_First_Row");

      $NC.setValue("#edtLink_Db_Nm");
      $NC.setValue("#edtLink_Table_Nm");
      $NC.setValue("#edtLink_Where_Text");
      $NC.setValue("#chkTxt_Delimeter_Yn", "N");
      $NC.setValue("#edtTxt_Col_Delimeter");
      $NC.setValue("#edtXml_Tag_Root");
      $NC.setValue("#edtXml_Tag_Bunch");
      $NC.setValue("#edtXml_Tag_Sub_Bunch");

      $NC.G_VAR.masterData.LINK_DB_NM = "";
      $NC.G_VAR.masterData.LINK_TABLE_NM = "";
      $NC.G_VAR.masterData.LINK_WHERE_TEXT = "";
      $NC.G_VAR.masterData.TXT_DELIMETER_YN = "";
      $NC.G_VAR.masterData.TXT_COL_DELIMETER = "";
      $NC.G_VAR.masterData.XML_TAG_ROOT = "";
      $NC.G_VAR.masterData.XML_TAG_BUNCH = "";
      $NC.G_VAR.masterData.XML_TAG_SUB_BUNCH = "";

    }
    // TEXT일 경우
    if (args.val == "03") {
      $NC.setEnable("#edtLink_Db_Nm", false);
      $NC.setEnable("#edtLink_Table_Nm", false);
      // $NC.setEnable("#edtLink_Where_Text", false);
      $NC.setEnable("#edtXml_Tag_Root", false);
      $NC.setEnable("#edtXml_Tag_Bunch", false);
      $NC.setEnable("#edtXml_Tag_Sub_Bunch", false);
      $NC.setEnable("#edtXls_First_Row", false);
      $NC.setEnable("#chkTxt_Delimeter_Yn");
      $NC.setEnable("#edtTxt_Col_Delimeter", $NC.G_VAR.masterData.TXT_DELIMETER_YN == "Y");

      $NC.setValue("#edtLink_Db_Nm");
      $NC.setValue("#edtLink_Table_Nm");
      $NC.setValue("#edtLink_Where_Text");
      $NC.setValue("#edtXls_First_Row");
      $NC.setValue("#edtXml_Tag_Root");
      $NC.setValue("#edtXml_Tag_Bunch");
      $NC.setValue("#edtXml_Tag_Sub_Bunch");

      $NC.G_VAR.masterData.LINK_DB_NM = "";
      $NC.G_VAR.masterData.LINK_TABLE_NM = "";
      $NC.G_VAR.masterData.LINK_WHERE_TEXT = "";
      $NC.G_VAR.masterData.XLS_FIRST_ROW = "";
      $NC.G_VAR.masterData.XML_TAG_ROOT = "";
      $NC.G_VAR.masterData.XML_TAG_BUNCH = "";
      $NC.G_VAR.masterData.XML_TAG_SUB_BUNCH = "";
    }
    // XML일 경우
    if (args.val == "04") {
      $NC.setEnable("#edtLink_Db_Nm", false);
      $NC.setEnable("#edtLink_Table_Nm", false);
      // $NC.setEnable("#edtLink_Where_Text", false);
      $NC.setEnable("#chkTxt_Delimeter_Yn", false);
      $NC.setEnable("#edtTxt_Col_Delimeter", false);
      $NC.setEnable("#edtXml_Tag_Root");
      $NC.setEnable("#edtXml_Tag_Bunch");
      $NC.setEnable("#edtXml_Tag_Sub_Bunch");
      $NC.setEnable("#edtXls_First_Row", false);

      $NC.setValue("#edtLink_Db_Nm");
      $NC.setValue("#edtLink_Table_Nm");
      $NC.setValue("#edtLink_Where_Text");
      $NC.setValue("#edtXls_First_Row");
      $NC.setValue("#chkTxt_Delimeter_Yn", "N");
      $NC.setValue("#edtTxt_Col_Delimeter");

      $NC.G_VAR.masterData.LINK_DB_NM = "";
      $NC.G_VAR.masterData.LINK_TABLE_NM = "";
      $NC.G_VAR.masterData.LINK_WHERE_TEXT = "";
      $NC.G_VAR.masterData.XLS_FIRST_ROW = "";
      $NC.G_VAR.masterData.TXT_DELIMETER_YN = "";
      $NC.G_VAR.masterData.TXT_COL_DELIMETER = "";
    }
    $NC.clearGridData(G_GRDDETAIL);
    G_GRDDETAIL.view.setColumns(grdDetailOnGetColumns(args.val));
    break;
  case "DEFINE_DIV":
    $NC.G_VAR.masterData.DEFINE_DIV = args.val;
    break;
  case "LINK_DB_NM":
    $NC.G_VAR.masterData.LINK_DB_NM = args.val;
    break;
  case "LINK_TABLE_NM":
    $NC.G_VAR.masterData.LINK_TABLE_NM = args.val;
    break;
  case "LINK_WHERE_TEXT":
    $NC.G_VAR.masterData.LINK_WHERE_TEXT = args.val;
    break;
  case "XLS_FIRST_ROW":
    if (isNaN(args.val)) {
      alert("숫자만 입력 가능합니다.");
      $NC.setValue("#edtXls_First_Row");
      return;
    }
    $NC.G_VAR.masterData.XLS_FIRST_ROW = args.val;
    break;
  case "TXT_DELIMETER_YN":
    $NC.G_VAR.masterData.TXT_DELIMETER_YN = args.val === "Y" ? args.val : "N";
    $NC.setEnable("#edtTxt_Col_Delimeter", $NC.G_VAR.masterData.TXT_DELIMETER_YN == "Y");
    if ($NC.G_VAR.masterData.TXT_DELIMETER_YN !== "Y") {
      $NC.setValue("#edtTxt_Col_Delimeter");
      $NC.G_VAR.masterData.TXT_COL_DELIMETER = "";
    }
    break;
  case "TXT_COL_DELIMETER":
    $NC.G_VAR.masterData.TXT_COL_DELIMETER = args.val;
    break;
  case "XML_TAG_ROOT":
    $NC.G_VAR.masterData.XML_TAG_ROOT = args.val;
    break;
  case "XML_TAG_BUNCH":
    $NC.G_VAR.masterData.XML_TAG_BUNCH = args.val;
    break;
  case "XML_TAG_SUB_BUNCH":
    $NC.G_VAR.masterData.XML_TAG_SUB_BUNCH = args.val;
    break;
  case "PREFIX_FILE_NM":
    $NC.G_VAR.masterData.PREFIX_FILE_NM = args.val;
    break;
  case "AUTO_EXEC_YN":
    $NC.G_VAR.masterData.AUTO_EXEC_YN = args.val === "Y" ? args.val : "N";
    if (args.val == "Y") {
      $NC.setEnable("#cboData_Cycle_Div");
      $NC.setValue("#cboData_Cycle_Div", "1");
      $NC.G_VAR.masterData.DATA_CYCLE_DIV = "1";
      $("#data-cycle-div1").show();
      $("#data-cycle-div2").hide();
    } else {
      $NC.setEnable("#cboData_Cycle_Div", false);
      $NC.setValue("#cboData_Cycle_Div");
      $NC.G_VAR.masterData.DATA_CYCLE_DIV = "";
      $NC.G_VAR.masterData.REPEAT_EXEC_TIME = "";
      $NC.clearGridData(G_GRDSUB);
      $("#data-cycle-div1").hide();
      $("#data-cycle-div2").hide();
    }
    break;
  case "REMOTE_DIV":
    $NC.G_VAR.masterData.REMOTE_DIV = args.val;
    break;
  case "REMOTE_IP":
    $NC.G_VAR.masterData.REMOTE_IP = args.val;
    break;
  case "REMOTE_PORT":
    $NC.G_VAR.masterData.REMOTE_PORT = args.val;
    break;
  case "REMOTE_PASSIVE_YN":
    $NC.G_VAR.masterData.REMOTE_PASSIVE_YN = args.val;
    break;
  case "REMOTE_USER_ID":
    $NC.G_VAR.masterData.REMOTE_USER_ID = args.val;
    break;
  case "REMOTE_USER_PWD":
    $NC.G_VAR.masterData.REMOTE_USER_PWD = args.val;
    break;
  case "REMOTE_DIR":
    $NC.G_VAR.masterData.REMOTE_DIR = args.val;
    break;
  case "REMOTE_CHARSET":
    $NC.G_VAR.masterData.REMOTE_CHARSET = args.val;
    break;
  case "EDI_DIR":
    $NC.G_VAR.masterData.EDI_DIR = args.val;
    break;
  case "WEBSERVICE_URL":
    $NC.G_VAR.masterData.WEBSERVICE_URL = args.val;
    break;
  case "WEBSERVICE_METHOD":
    $NC.G_VAR.masterData.WEBSERVICE_METHOD = args.val;
    break;
  case "DATA_CYCLE_DIV":
    $NC.G_VAR.masterData.DATA_CYCLE_DIV = args.val;
    if (args.val == "1") {
      $("#data-cycle-div1").show();
      $("#data-cycle-div2").hide();
    } else if (args.val == "2") {
      $("#data-cycle-div1").hide();
      $("#data-cycle-div2").show();
    } else {
      $("#data-cycle-div1").hide();
      $("#data-cycle-div2").hide();
    }
    break;
  case "START_TIME":
    if ($NC.isNull(args.val)) {
      break;
    }
    var strRepeat_Time = args.val;
    var REPEAT_TIME = strRepeat_Time.split($NC.G_VAR.TIME_DATA_DIV);
    if (isNaN(REPEAT_TIME[0]) || isNaN(REPEAT_TIME[1])) {
      alert("시작시각을 시분(00:00)형식으로 정확히 입력하십시오.");
      $NC.setFocus("#edtStart_Time", true);
      return;
    }

    var HOUR_TIME = parseInt(REPEAT_TIME[0], 10);
    var MINUTE_TIME = parseInt(REPEAT_TIME[1], 10);

    if (Number(HOUR_TIME) < 0 || Number(HOUR_TIME) > 23) {
      alert("시간을 정확히 입력하십시오.");
      $NC.setFocus("#edtStart_Time", true);
      return;
    }
    if (Number(MINUTE_TIME) < 0 || Number(MINUTE_TIME) > 59) {
      alert("분을 정확히 입력하십시오.");
      $NC.setFocus("#edtStart_Time", true);
      return;
    }
    $NC.setValue("#edtStart_Time", $NC.lPad(HOUR_TIME.toString(), 2) + ":" + $NC.lPad(MINUTE_TIME.toString(), 2));
    break;
  case "END_TIME":
    if ($NC.isNull(args.val)) {
      break;
    }
    var strRepeat_Time = args.val;
    var REPEAT_TIME = strRepeat_Time.split($NC.G_VAR.TIME_DATA_DIV);
    if (isNaN(REPEAT_TIME[0]) || isNaN(REPEAT_TIME[1])) {
      alert("종료시각을 시분(00:00)형식으로 정확히 입력하십시오.");
      $NC.setFocus("#edtEnd_Time", true);
      return;
    }

    var HOUR_TIME = parseInt(REPEAT_TIME[0], 10);
    var MINUTE_TIME = parseInt(REPEAT_TIME[1], 10);

    if (Number(HOUR_TIME) < 0 || Number(HOUR_TIME) > 23) {
      alert("시간을 정확히 입력하십시오.");
      $NC.setFocus("#edtEnd_Time", true);
      return;
    }
    if (Number(MINUTE_TIME) < 0 || Number(MINUTE_TIME) > 59) {
      alert("분을 정확히 입력하십시오.");
      $NC.setFocus("#edtEnd_Time", true);
      return;
    }
    $NC.setValue("#edtEnd_Time", $NC.lPad(HOUR_TIME.toString(), 2) + ":" + $NC.lPad(MINUTE_TIME.toString(), 2));
    break;
  case "REMARK1":
    $NC.G_VAR.masterData.REMARK1 = args.val;
    break;
  }

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }

}

/**
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          grid, row, cell, val
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDDETAIL, args.row);

  var rowData = G_GRDDETAIL.data.getItem(args.row);
  if (args.cell == G_GRDDETAIL.view.getColumnIndex("DATA_NULL_YN")) {
    rowData.DATA_NULL_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
}

function grdDetailOnGetColumns(data_Div) {

  if ($NC.isNull(data_Div)) {
    data_Div = "01";
  }
  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "COLUMN_ID",
    field: "COLUMN_ID",
    name: "ID",
    minWidth: 40,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "COLUMN_NM",
    field: "COLUMN_NM",
    name: "컬럼명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "컬럼설명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "DATA_TYPE_F",
    field: "DATA_TYPE_F",
    name: "수신컬럼타입",
    minWidth: 120,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "DATA_TYPE",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "DATA_TYPE",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      addEmpty: true
    })
  });
  if (data_Div == '01') {
    $NC.setGridColumn(columns, {
      id: "LINK_COLUMN_NM",
      field: "LINK_COLUMN_NM",
      name: "수신컬럼명",
      minWidth: 140,
      editor: Slick.Editors.Text,
      editorOptions: {
        isKeyField: true
      }
    });
  } else if (data_Div == '02') {
    $NC.setGridColumn(columns, {
      id: "XLS_COLUMN_NM",
      field: "XLS_COLUMN_NM",
      name: "엑셀컬럼명",
      minWidth: 90,
      editor: Slick.Editors.Text,
      cssClass: "align-center",
      editorOptions: {
        isKeyField: true
      }
    });
  } else if (data_Div == '03') {
    $NC.setGridColumn(columns, {
      id: "TXT_POSITION",
      field: "TXT_POSITION",
      name: "텍스트시작위치",
      minWidth: 120,
      editor: Slick.Editors.Text,
      cssClass: "align-right",
      editorOptions: {
        isKeyField: true
      }
    });
    $NC.setGridColumn(columns, {
      id: "TXT_LENGTH",
      field: "TXT_LENGTH",
      name: "텍스트컬럼길이",
      minWidth: 120,
      editor: Slick.Editors.Text,
      cssClass: "align-right",
    });
  } else if (data_Div == '04') {
    $NC.setGridColumn(columns, {
      id: "XML_TAG_NM",
      field: "XML_TAG_NM",
      name: "[XML]태그명",
      minWidth: 100,
      editor: Slick.Editors.Text,
    });
    $NC.setGridColumn(columns, {
      id: "XML_TAG_ATTR",
      field: "XML_TAG_ATTR",
      name: "[XML]태그속성",
      minWidth: 100,
      editor: Slick.Editors.Text
    });
  }
  $NC.setGridColumn(columns, {
    id: "DATA_NULL_YN",
    field: "DATA_NULL_YN",
    name: "널허용여부",
    minWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "DATA_DEFAULT",
    field: "DATA_DEFAULT",
    name: "기본값",
    minWidth: 80,
    editor: Slick.Editors.Text
  });
  $NC.setGridColumn(columns, {
    id: "DATE_FORMAT_DIV_F",
    field: "DATE_FORMAT_DIV_F",
    name: "날짜포맷구분",
    minWidth: 150,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "DATE_FORMAT_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "DATE_FORMAT_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      addEmpty: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "DATE_INPUT_DIV_F",
    field: "DATE_INPUT_DIV_F",
    name: "날짜입력구분",
    minWidth: 90,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "DATE_INPUT_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "DATE_INPUT_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      addEmpty: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "IF_CODE_GRP",
    field: "IF_CODE_GRP",
    name: "변환코드그룹",
    minWidth: 90,
    editor: Slick.Editors.Popup,
    editorOptions: {
      onPopup: grdDetailOnPopup
    }
  });
  $NC.setGridColumn(columns, {
    id: "IF_CODE_GRP_D",
    field: "IF_CODE_GRP_D",
    name: "변환코드그룹명",
    minWidth: 120
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdDetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "ED02010E.RS_DETAIL",
    sortCol: "COLUMN_ID",
    gridOptions: options
  });
  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

/**
 * grdDetail 데이터 필터링 이벤트
 */
function grdDetailOnFilter(item) {

  return item.CRUD !== "D";
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdDetailOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL, args.row, G_GRDDETAIL.view.getColumnIndex("DATA_TYPE_F"), true);
}

/**
 * 그리드에 셀 입력전
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdDetailOnBeforeEditCell(e, args) {

  switch ($NC.G_VAR.masterData.DATA_DIV) {
  case "01": // DB LINK
    switch (args.column.id) {
    case "TXT_POSITION":
    case "TXT_LENGTH":
    case "XLS_COLUMN_NM":
      return false;
      break;
    }
    break;
  case "02": // EXCEL
    switch (args.column.id) {
    case "TXT_POSITION":
    case "TXT_LENGTH":
      return false;
      break;
    }
    break;
  case "03": // TEXT
    switch (args.column.id) {
    case "LINK_COLUMN_NM":
    case "XLS_COLUMN_NM":
      return false;
      break;
    }
    break;
  }

  return true;
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdDetailOnCellChange(e, args) {

  var rowData = args.item;
  switch (G_GRDDETAIL.view.getColumnField(args.cell)) {
  case "IF_CODE_GRP":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(rowData.IF_CODE_GRP)) {
      P_QUERY_PARAMS = {
        P_CODE_GRP: "IF_CODE_GRP",
        P_CODE_CD: rowData.IF_CODE_GRP,
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      };
      O_RESULT_DATA = $NP.getCodeInfo({
        queryParams: P_QUERY_PARAMS
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onIfCodeGrpPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showCodePopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onIfCodeGrpPopup, onIfCodeGrpPopup);
    }
    return;
  case "TXT_POSITION":
    if (!$NC.isNull(rowData.TXT_POSITION)) {
      if (Number(rowData.TXT_POSITION) < 1) {
        alert("텍스트시작위치에 0보다 큰 수자를 입력하십시오.");
        rowData.TXT_POSITION = "";
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: args.row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("TXT_POSITION"),
          editMode: true
        });
        return;
      }
    }
    if (isNaN(rowData.TXT_POSITION)) {
      alert("텍스트시작위치에 0보다 큰 수자를 입력하십시오.");
      rowData.TXT_POSITION = "";
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: args.row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("TXT_POSITION"),
        editMode: true
      });
      return;
    }
    break;
  case "TXT_LENGTH":
    if (!$NC.isNull(rowData.TXT_LENGTH)) {
      if (Number(rowData.TXT_LENGTH) < 1) {
        alert("텍스트컬럼길이 0보다 큰 수자를 입력하십시오.");
        rowData.TXT_LENGTH = "";
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: args.row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("TXT_LENGTH"),
          editMode: true
        });
        return;
      }
    } else {
      break;
    }
    if (isNaN(rowData.TXT_LENGTH)) {
      alert("텍스트컬럼길이 0보다 큰 수자를 입력하십시오.");
      rowData.TXT_LENGTH = "";
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: args.row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("TXT_LENGTH"),
        editMode: true
      });
      return;
    }
    break;
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
}

/**
 * 저장시 그리드 입력 체크
 */
function grdDetailOnBeforePost(row) {

  if (!G_GRDDETAIL.lastRowModified) {
    return true;
  }

  var rowData = G_GRDDETAIL.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  /*
  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    
  }
  */

  // 데이터타입의 값이 있으면 해당컬럼을 사용하는 것으로 봄
  if (rowData.CRUD != "R" && !$NC.isNull(rowData.DATA_TYPE)) {

    var dataType = rowData.DATA_TYPE;

    if ($NC.isNull(rowData.DATA_NULL_YN)) {
      alert("널허용여부를 선택하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("DATA_NULL_YN"),
        editMode: true
      });
      return false;
    }

    // 데이터타입이 날짜인 경우
    if (dataType == "2") {
      if ($NC.isNull(rowData.DATE_FORMAT_DIV)) {
        alert("날짜포맷구분을 선택하십시오.");
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("DATE_FORMAT_DIV_F"),
          editMode: true
        });
        return false;
      }

      if ($NC.isNull(rowData.DATE_INPUT_DIV)) {
        alert("날짜입력구분을 선택하십시오.");
        $NC.setGridSelectRow(G_GRDDETAIL, {
          selectRow: row,
          activeCell: G_GRDDETAIL.view.getColumnIndex("DATE_INPUT_DIV_F"),
          editMode: true
        });
        return false;
      }
    }

    // var DATA_DIV = $NC.getValue("#cboData_Div");
    // //수신처리구분이 DBLINK일 경우
    // if (DATA_DIV == "01") {
    // if ($NC.isNull(rowData.LINK_COLUMN_NM)) {
    // alert("수신컬럼명을 입력하십시오.");
    // $NC.setGridSelectRow(G_GRDDETAIL, {
    // selectRow: row,
    // activeCell: G_GRDDETAIL.view.getColumnIndex("LINK_COLUMN_NM"),
    // editMode: true
    // });
    // return false;
    // }
    // //수신처리구분이 EXCEL일 경우
    // } else if (DATA_DIV == "02") {
    // if ($NC.isNull(rowData.XLS_COLUMN_NM)) {
    // alert("엑셀컬럼명을 입력하십시오.");
    // $NC.setGridSelectRow(G_GRDDETAIL, {
    // selectRow: row,
    // activeCell: G_GRDDETAIL.view.getColumnIndex("XLS_COLUMN_NM"),
    // editMode: true
    // });
    // return false;
    // }
    // //수신처리구분이 TEXT일 경우
    // } else if (DATA_DIV == "02") {
    // if ($NC.isNull(rowData.TXT_POSITION)) {
    // alert("텍스트시작위치를 입력하십시오.");
    // $NC.setGridSelectRow(G_GRDDETAIL, {
    // selectRow: row,
    // activeCell: G_GRDDETAIL.view.getColumnIndex("TXT_POSITION"),
    // editMode: true
    // });
    // return false;
    // }
    // if ($NC.isNull(rowData.TXT_LENGTH)) {
    // alert("텍스트컬럼길이를 입력하십시오.");
    // $NC.setGridSelectRow(G_GRDDETAIL, {
    // selectRow: row,
    // activeCell: G_GRDDETAIL.view.getColumnIndex("TXT_LENGTH"),
    // editMode: true
    // });
    // return false;
    // }
    // }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  }
  return true;
}

/**
 * 그리드 행 선택 변경 했을 경우
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
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

/**
 * 그리드의 변환코드그룹 팝업 처리
 */
function grdDetailOnPopup(e, args) {

  var rowData = args.item;

  switch (args.column.field) {
  case "IF_CODE_GRP":
    $NP.showCodePopup({
      P_CODE_GRP: "IF_CODE_GRP",
      P_CODE_CD: rowData.IF_CODE_GRP,
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    }, onIfCodeGrpPopup, function() {
      $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, G_GRDDETAIL.view.getColumnIndex("IF_CODE_GRP"), true, true);
    });
    break;
  }
}

function grdSubOnGetColumns(data_Div) {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "REPEAT_TIME",
    field: "REPEAT_TIME",
    name: "특정 수신주기",
    minWidth: 100,
    editor: Slick.Editors.Text,
    cssClass: "align-center",
    editorOptions: {
      isKeyField: true
    }
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 그리드 초기값 설정
 */
function grdSubInitialize() {

  var options = {
    editable: true,
    autoEdit: true
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    sortCol: "REPEAT_TIME",
    gridOptions: options
  });
  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
  G_GRDSUB.view.onCellChange.subscribe(grdSubOnCellChange);
}

/**
 * 그리드 행 선택 변경 했을 경우
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
    if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub", row + 1);
}

/**
 * 그리드의 편집 셀의 값 변경시 처리
 * 
 * @param e
 * @param args
 */
function grdSubOnCellChange(e, args) {

  var rowData = args.item;
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }

  if ($NC.G_VAR.masterData.CRUD == "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }

  G_GRDSUB.data.updateItem(rowData.id, rowData);
  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUB.lastRowModified = true;
}

/**
 * 그리드 신규 추가 버튼 클릭 후 포커스 설정
 * 
 * @param args
 */
function grdSubOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDSUB, args.row, G_GRDSUB.view.getColumnIndex("REPEAT_TIME"), true);
}

/**
 * 저장시 그리드 입력 체크
 */
function grdSubOnBeforePost(row) {

  var rowData = G_GRDSUB.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.REPEAT_TIME)) {
      G_GRDSUB.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDSUB, row - 1);
        setTimeout(function() {
          $NC.setGridDisplayRows("#grdSub", row, G_GRDSUB.data.getLength());
        }, 300);
      }
      return true;
    }
  }

  if (!chkSubRepeatTime(row, rowData)) {
    return false;
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDSUB.data.updateItem(rowData.id, rowData);
  }
  return true;
}

function chkSubRepeatTime(row, rowData) {

  var strRepeat_Time = rowData.REPEAT_TIME;
  var REPEAT_TIME = strRepeat_Time.split($NC.G_VAR.TIME_DATA_DIV);
  if (isNaN(REPEAT_TIME[0]) || isNaN(REPEAT_TIME[1])) {
    alert("특정수신주기가 시분(00:00)형식으로 정확히 입력하십시오.");
    rowData.REPEAT_TIME = "";
    $NC.setGridSelectRow(G_GRDSUB, {
      selectRow: row,
      activeCell: G_GRDSUB.view.getColumnIndex("REPEAT_TIME"),
      editMode: true
    });
    return false;
  }

  var HOUR_TIME = parseInt(REPEAT_TIME[0], 10);
  var MINUTE_TIME = parseInt(REPEAT_TIME[1], 10);

  if (Number(HOUR_TIME) < 0 || Number(HOUR_TIME) > 23) {
    alert("특정수신주기가 시간을 정확히 입력하십시오.");
    $NC.setGridSelectRow(G_GRDSUB, {
      selectRow: row,
      activeCell: G_GRDSUB.view.getColumnIndex("REPEAT_TIME"),
      editMode: true
    });
    return false;
  }
  if (Number(MINUTE_TIME) < 0 || Number(MINUTE_TIME) > 59) {
    alert("특정수신주기가 분을 정확히 입력하십시오.");
    $NC.setGridSelectRow(G_GRDSUB, {
      selectRow: row,
      activeCell: G_GRDSUB.view.getColumnIndex("REPEAT_TIME"),
      editMode: true
    });
    return false;
  }

  rowData.REPEAT_TIME = $NC.lPad(HOUR_TIME.toString(), 2) + ":" + $NC.lPad(MINUTE_TIME.toString(), 2);
  var rows = $NC.getGridSearchRows(G_GRDSUB, {
    searchKey: "REPEAT_TIME",
    searchVal: $NC.lPad(HOUR_TIME.toString(), 2) + ":" + $NC.lPad(MINUTE_TIME.toString(), 2)
  });

  if (rows.length > 1) {
    alert("이미 등록된 [특정수신주기] 입니다.");
    $NC.setGridSelectRow(G_GRDSUB, {
      selectRow: row,
      activeCell: G_GRDSUB.view.getColumnIndex("REPEAT_TIME"),
      editMode: true
    });
    return false;
  }

  return true;
}

function OnBtnSub3Click() {

  var EDI_DIV = $NC.getValue("#cboEdi_Div");
  if ($NC.isNull(EDI_DIV)) {
    alert("수신구분을 선택하십시오.");
    $NC.setFocus("#cboEdi_Div");
    return;
  }

  var DEFINE_NO = $NC.getValue("#edtDefine_No");
  if ($NC.isNull(DEFINE_NO)) {
    alert("정의번호를 입력하십시오.");
    $NC.setFocus("#edtDefine_No");
    return;
  }

  var DEFINE_NM = $NC.getValue("#edtDefine_Nm");
  if ($NC.isNull(DEFINE_NM)) {
    alert("정의명칭을 입력하십시오.");
    $NC.setFocus("#edtDefine_Nm");
    return;
  }

  var DATA_DIV = $NC.getValue("#cboData_Div");
  if ($NC.isNull(DATA_DIV)) {
    alert("수신처리구분을 선택하십시오.");
    $NC.setFocus("#cboData_Div");
    return;
  }

  // 데이터 조회
  $NC.serviceCall("/ED02010E/getDataSet.do", {
    P_QUERY_ID: "ED02010E.RS_SUB1",
    P_QUERY_PARAMS: $NC.getParams({
      P_EDI_DIV: EDI_DIV
    })
  }, onGetSub1);
}

function onGetSub1(ajaxData) {

  var BU_CD = $NC.getValue("#edtBu_Cd");
  var EDI_DIV = $NC.getValue("#cboEdi_Div");
  var DEFINE_NO = $NC.getValue("#edtDefine_No");

  var columnData = $NC.toArray(ajaxData);
  var columnCount = columnData.length;

  if (columnCount == 0) {
    alert("수신항목이 없습니다.");
    return;
  }

  // 현재 수정모드면
  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDDETAIL.lastRow != null) {
    if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
      return;
    }
  }

  for (var row = 0; row < columnCount; row++) {
    var rowData = columnData[row];

    if ($NC.getGridSearchVal(G_GRDDETAIL, {
      searchKey: "COLUMN_NM",
      searchVal: rowData.COLUMN_NM
    }) > -1) {
      continue;
    }

    var newRowData = {
      BU_CD: BU_CD,
      EDI_DIV: EDI_DIV,
      DEFINE_NO: DEFINE_NO,
      COLUMN_NM: rowData.COLUMN_NM,
      COLUMN_ID: rowData.COLUMN_ID,
      DATA_TYPE: null,
      DATA_NULL_YN: "Y",
      DATA_DEFAULT: rowData.DATA_DEFAULT,
      DATE_FORMAT_DIV: null,
      DATE_INPUT_DIV: null,
      IF_CODE_GRP: null,
      LINK_COLUMN_NM: null,
      TXT_POSITION: null,
      TXT_LENGTH: null,
      XLS_COLUMN_NM: null,
      XML_TAG_NM: null,
      XML_TAG_ATTR: null,
      REMARK1: rowData.REMARK1,
      id: $NC.getGridNewRowId(),
      CRUD: "C"
    };
    G_GRDDETAIL.data.addItem(newRowData);
  }

  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "COLUMN_ID",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
}

/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }

  onClose();
}

/**
 * 인터페이스코드그룹 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onIfCodeGrpPopup(resultInfo) {
  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
  if ($NC.isNull(rowData)) {
    return;
  }
  var focusCol;
  if (!$NC.isNull(resultInfo)) {
    rowData.IF_CODE_GRP = resultInfo.CODE_CD;
    rowData.IF_CODE_GRP_D = resultInfo.CODE_NM;
    focusCol = G_GRDDETAIL.view.getColumnIndex("DATA_TYPE_F");
  } else {
    rowData.IF_CODE_GRP = "";
    rowData.IF_CODE_GRP_D = "";
    focusCol = G_GRDDETAIL.view.getColumnIndex("IF_CODE_GRP");
  }
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  // 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
  $NC.setFocusGrid(G_GRDDETAIL, G_GRDDETAIL.lastRow, focusCol, true, true);
}
