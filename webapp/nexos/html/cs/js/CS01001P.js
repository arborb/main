/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null,
    USER_GROUP: ""
  });

  $NC.setInitDatePicker("#dtpNotice_From_Date");
  $NC.setInitDatePicker("#dtpNotice_To_Date");

  // 버튼 클릭 이벤트 연결

  $("#btnReadUserId1").click(onBtnReadUserId1);
  $("#btnClose").click(onCancel);
  $("#btnSave").click(_Save);
  $("#btnBu_Cd").click(showUserBuPopup);
  $("#btnFileAttachment").click(onBtnAttachmentSelect);
  $("#btnFileRemove").click(onBtnAttachmentRemove);
  
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $("#btnReadUserId1").hide();
  // 신규 등록
  if ($NC.G_VAR.userData.P_PROCESS_CD === "N") {
    $NC.setValue("#edtBu_Cd", $NC.G_VAR.userData.P_BU_CD);
    $NC.setValue("#edtBu_Nm", $NC.G_VAR.userData.P_BU_NM);

    var NOTICE_FROM_DATE = $NC.getValue("#dtpNotice_From_Date");
    var NOTICE_TO_DATE = $NC.getValue("#dtpNotice_To_Date");
    // var NOTICE_DIV = $NC.getValue("#cboNotice_Div");

    // 마스터 데이터 세팅
    $NC.G_VAR.masterData = {
      WRITE_NO: "",
      CENTER_CD: "",
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      USER_ID: $NC.G_USERINFO.USER_ID,
      NOTICE_DIV: "",// NOTICE_DIV,
      NOTICE_TITLE: "",
      CONTENT_HTML: "",
      CONTENT_TEXT: "",
      NOTICE_FROM_DATE: NOTICE_FROM_DATE,
      NOTICE_TO_DATE: NOTICE_TO_DATE,
      FILE_NM: "",
      FILE_SIZE: "",
      ORG_FILE_NM: "",
      ORG_FILE_SIZE: "",
      CRUD: "C"
    };
    $NC.setEnable("#btnFileRemove", false);

    $NC.setFocus("#edtNotice_Title");
  } else {
    // 등록 수정
    $NC.G_VAR.masterData = {
      WRITE_NO: $NC.G_VAR.userData.P_WRITE_NO,
      CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      BU_CD: $NC.G_VAR.userData.P_BU_CD,
      USER_ID: $NC.G_VAR.userData.P_USER_ID,
      NOTICE_DIV: $NC.G_VAR.userData.P_NOTICE_DIV,
      NOTICE_TITLE: $NC.G_VAR.userData.P_NOTICE_TITLE,
      CONTENT_HTML: $NC.G_VAR.userData.P_CONTENT_HTML,
      CONTENT_TEXT: $NC.G_VAR.userData.P_CONTENT_TEXT,
      NOTICE_FROM_DATE: $NC.G_VAR.userData.P_NOTICE_FROM_DATE,
      NOTICE_TO_DATE: $NC.G_VAR.userData.P_NOTICE_TO_DATE,
      FILE_NM: $NC.G_VAR.userData.P_FILE_NM,
      FILE_SIZE: $NC.G_VAR.userData.P_FILE_SIZE,
      ORG_FILE_NM: $NC.G_VAR.userData.P_ORG_FILE_NM,
      ORG_FILE_SIZE: $NC.G_VAR.userData.P_ORG_FILE_SIZE,
      CRUD: "R"
    };

    $NC.setValue("#edtWrite_No", $NC.G_VAR.masterData.WRITE_NO);
    $NC.setValue("#edtBu_Cd", $NC.G_VAR.masterData.BU_CD);
    $NC.setValue("#edtBu_Nm", $NC.G_VAR.masterData.BU_NM);
    // $NC.setValue("#cboNotice_Div", $NC.G_VAR.masterData.NOTICE_DIV);
    $NC.setValue("#dtpNotice_From_Date", $NC.G_VAR.masterData.NOTICE_FROM_DATE);
    $NC.setValue("#dtpNotice_To_Date", $NC.G_VAR.masterData.NOTICE_TO_DATE);
    $NC.setValue("#edtFile_Nm", $NC.G_VAR.masterData.FILE_NM);
    $NC.setValue("#edtNotice_Title", $NC.G_VAR.masterData.NOTICE_TITLE);
    $NC.setValue("#edtContent_Text", $NC.G_VAR.masterData.CONTENT_TEXT);
    $NC.setEnable("#btnFileRemove", !$NC.isNull($NC.G_VAR.masterData.FILE_NM));

    // 등록수정
    $NC.setFocus("#edtContent_Text");
  }

  // 조회조건 - 공지사항구분 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMCODE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CODE_GRP: "NOTICE_DIV",
      P_CODE_CD: "%",
      P_SUB_CD1: "",
      P_SUB_CD2: ""
    })
  }, {
    selector: "#cboNotice_Div",
    codeField: "CODE_CD",
    nameField: "CODE_NM",
    fullNameField: "CODE_CD_F",
    selectOption: $NC.G_VAR.userData.P_PROCESS_CD == "N" ? "F" : null,
    onComplete: function() {
      if ($NC.G_VAR.userData.P_PROCESS_CD == "N") {
        $NC.G_VAR.masterData.NOTICE_DIV = $NC.getValue("#cboNotice_Div");
      } else {
        $NC.setValue("#cboNotice_Div", $NC.G_VAR.masterData.NOTICE_DIV);
      }
      ;
    }
  });
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.topOffset;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var editorWidth = parent.width() - 117;
  var editorHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $("#edtContent_Text").offset().top
      - $NC.G_LAYOUT.margin2 - $NC.G_LAYOUT.border2;

  $("#edtNotice_Title").width(editorWidth);
  $("#edtContent_Text").width(editorWidth).height(editorHeight);
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
    view: view,
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

}

/**
 * 저장
 */
function _Save() {

  if ($NC.G_VAR.masterData.CRUD == "R") {
    alert("수정 후 저장하십시오.");
    $NC.setFocus("#edtContent_Text");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.NOTICE_DIV)) {
    alert("공지사항 구분을 입력하십시오.");
    $NC.setFocus("#cboNotice_Div");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.NOTICE_FROM_DATE)) {
    alert("공지사항 게시 시작일자를 입력하십시오.");
    $NC.setFocus("#dtpNotice_From_Date");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.NOTICE_DIV)) {
    alert("공지사항 게시 종료일자를 입력하십시오.");
    $NC.setFocus("#dtpNotice_To_Date");
    return;
  }

  if ($NC.isNull($NC.G_VAR.masterData.NOTICE_TITLE)) {
    alert("공지사항 제목을 입력하십시오.");
    $NC.setFocus("#edtNotice_Title");
    return;
  }

  /*
  if ($NC.isNull($NC.G_VAR.masterData.CONTENT_TEXT)) {
    alert("공지사항 내용을 입력하십시오.");
    $NC.setFocus("#edtContent_Text");
    return;
  }
  */

  var cu_DS = [ ];
  var rows = $NC.G_VAR.USER_GROUP;
  var rowCount = rows.length;
  for (var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
      var saveData = {
          P_NOTICE_DIV: $NC.G_VAR.masterData.NOTICE_DIV,
          P_NOTICE_GROUP_CD: rowData.NOTICE_GROUP_CD,
          P_NOTICE_GROUP_NM: rowData.NOTICE_GROUP_NM,
          P_NOTICE_FROM_DATE: $NC.G_VAR.masterData.NOTICE_FROM_DATE,
          P_CHECK_YN: rowData.CHECK_YN
      };
        cu_DS.push(saveData);
  }
  var detailDS = cu_DS;

  
  if ($NC.isNull($NC.G_VAR.masterData.CENTER_CD)) {
    $NC.G_VAR.masterData.CENTER_CD = "*";
  }

  if ($NC.isNull($NC.G_VAR.masterData.BU_CD)) {
    $NC.G_VAR.masterData.BU_CD = "*";
  }

  var saveData = {
    P_WRITE_NO: $NC.G_VAR.masterData.WRITE_NO,
    P_CENTER_CD: $NC.G_VAR.masterData.CENTER_CD,
    P_BU_CD: $NC.G_VAR.masterData.BU_CD,
    P_USER_ID: $NC.G_VAR.masterData.USER_ID,
    P_NOTICE_DIV: $NC.G_VAR.masterData.NOTICE_DIV,
    P_NOTICE_TITLE: $NC.G_VAR.masterData.NOTICE_TITLE,
    P_CONTENT_HTML: $NC.G_VAR.masterData.CONTENT_HTML,
    P_CONTENT_TEXT: $NC.G_VAR.masterData.CONTENT_TEXT,
    P_NOTICE_FROM_DATE: $NC.G_VAR.masterData.NOTICE_FROM_DATE,
    P_NOTICE_TO_DATE: $NC.G_VAR.masterData.NOTICE_TO_DATE,
    P_FILE_NM: $NC.G_VAR.masterData.FILE_NM,
    P_FILE_SIZE: $NC.G_VAR.masterData.FILE_SIZE,
    P_ORG_FILE_NM: $NC.G_VAR.masterData.ORG_FILE_NM,
    P_ORG_FILE_SIZE: $NC.G_VAR.masterData.ORG_FILE_SIZE,
    P_CRUD: $NC.G_VAR.masterData.CRUD
  };
  if ($NC.isNull($NC.G_VAR.masterData.FILE_NM) || $NC.G_VAR.masterData.FILE_NM == $NC.G_VAR.masterData.ORG_FILE_NM) {
    $NC.serviceCall("/CS01000E/saveMaster.do", {
      P_DS_MASTER: $NC.toJson([saveData]),
      //P_DS_SUB: $NC.toJson(detailDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave);
  } else {
    $NC.G_MAIN.fileUpload("/CS01000E/saveMasterAttachment.do", {
      P_DS_MASTER: $NC.toJson([saveData]),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
      var resultData = null;
      try {
        resultData = $NC.toArray(ajaxData);
      } catch (e) {
        alert(ajaxData);
        return;
      }
      if (!$NC.isNull(resultData.RESULT_CD)) {
        if (resultData.RESULT_CD != "0") {
          $NC.onError(ajaxData);
        } else {
          onClose();
        }
      } else {
        if (resultData.O_MSG && resultData.O_MSG !== "OK") {
          alert(resultData.O_MSG);
        }
      }
    });
  }
  
}

/**
 * 삭제
 */
function _Delete() {

}

function masterDataOnChange(e, args) {

  switch (args.col) {
  case "BU_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(args.val)) {
      P_QUERY_PARAMS = {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: args.val
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
  case "NOTICE_DIV":
    $NC.G_VAR.masterData.NOTICE_DIV = args.val;
    break;
  case "NOTICE_TITLE":
    $NC.G_VAR.masterData.NOTICE_TITLE = args.val;
    break;
  case "CONTENT_TEXT":
    $NC.G_VAR.masterData.CONTENT_TEXT = args.val;
    break;
  case "NOTICE_FROM_DATE":
    $NC.setValueDatePicker(args.view, args.val, "공지 게시 시작일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.NOTICE_FROM_DATE = $NC.getValue(args.view);
    break;
  case "NOTICE_TO_DATE":
    $NC.setValueDatePicker(args.view, args.val, "공지 게시 종료일자를 정확히 입력하십시오.");
    $NC.G_VAR.masterData.NOTICE_TO_DATE = $NC.getValue(args.view);
    break;
  }

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}

function onBtnAttachmentSelect() {

  $NC.G_MAIN.uploadFileSelect(function(view, fileFullName, fileName) {

    $NC.G_VAR.masterData.FILE_NM = fileName;
    $NC.G_VAR.masterData.FILE_SIZE = "";

    if ($NC.G_VAR.masterData.CRUD === "R") {
      $NC.G_VAR.masterData.CRUD = "U";
    }

    $NC.setValue("#edtFile_Nm", fileName);
  });
}

function onBtnAttachmentRemove() {

  if ($NC.isNull($NC.G_VAR.masterData.FILE_NM)) {
    return;
  }
  $NC.G_VAR.masterData.FILE_NM = "";
  $NC.G_VAR.masterData.FILE_SIZE = "";

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }

  $NC.setValue("#edtFile_Nm");
}

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
 * 검색조건의 사업부 검색 이미지 클릭
 */

function showUserBuPopup() {
  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtBu_Cd", true);
  });
}

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtBu_Nm", resultInfo.BU_NM);

    $NC.G_VAR.masterData.BU_CD = resultInfo.BU_CD;
  } else {
    $NC.setValue("#edtBu_Cd");
    $NC.setValue("#edtBu_Nm");
    $NC.setFocus("#edtBu_Cd", true);

    $NC.G_VAR.masterData.BU_CD = "";
  }

  if ($NC.G_VAR.masterData.CRUD === "R") {
    $NC.G_VAR.masterData.CRUD = "U";
  }
}
function onBtnReadUserId1() {

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "CS01003P",
    PROGRAM_NM: "공지사항그룹등록/수정",
    url: "cs/CS01003P.html",
    width: 700,
    height: 430,
    onOk: function(resultInfo) {
      if (resultInfo) {
        var paramDs = [ ];
        for ( var row in resultInfo) {
          rowData = resultInfo[row];

          var newRowData = {
            NOTICE_GROUP_CD: rowData.P_NOTICE_GROUP_CD,
            NOTICE_GROUP_NM: rowData.P_NOTICE_GROUP_NM,
            CHECK_YN: rowData.P_CHECK_YN
          };
          paramDs.push(newRowData);
        }
        $NC.G_VAR.USER_GROUP =  paramDs;
      }
    }

  });
}
