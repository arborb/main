/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 상단그리드 초기화
  grdMasterInitialize();

  // 버튼 이벤트 연결
  $("#btnOpenFile").click(onBtnOpenFile);
  $("#btnSaveFile").click(onBtnSaveFile);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.fixedTopHeight = 200;
  $NC.G_OFFSET.fixedTopOffset = $("#divButtonContainer").outerHeight();
  $NC.G_OFFSET.nonClientHeight = $NC.G_LAYOUT.nonClientHeight;
}

function _OnLoaded() {

  // 스플리터 초기화
  $NC.setInitSplitter("#divMasterView", "h", 300);

  $NC.setFocus("#edtQQuery_Text");
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  var edtQQuery_Text = $("#edtQQuery_Text");
  edtQQuery_Text.css({
    "width": clientWidth - 6,
    "height": edtQQuery_Text.parent().height() - $NC.G_LAYOUT.header - $NC.G_OFFSET.fixedTopOffset - 6
  });

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, $("#grdMaster").parent().height() - $NC.G_LAYOUT.header);

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var QUERY_TEXT = $NC.getValue("#edtQQuery_Text");
  if ($NC.isNull(QUERY_TEXT)) {
    alert("검색할 쿼리를 입력하십시오.");
    return;
  }

  // 쿼리 체크
  if (!canExecuteQuery(QUERY_TEXT.trim().toUpperCase())) {
    alert("조회 쿼리만 실행 가능합니다.");
    return;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);
  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_QUERY_TEXT: QUERY_TEXT
  });
  G_GRDMASTER.view.setColumns([ ]);
  // 데이터 조회 - 상단그리드
  $NC.serviceCall("/CS09010Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster, onGetMasterError);
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
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

}

/**
 * 상단그리드 초기화
 */
function grdMasterInitialize() {

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: [ ],
    queryId: "WC.DYNAMIC_SELECT"
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

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdMasterSetColumns(rowData) {

  var columns = [ ];
  if (!$NC.isNull(rowData)) {
    for ( var col in rowData) {
      if (col === "id" || col === "CRUD") {
        continue;
      }
      $NC.setGridColumn(columns, {
        id: col,
        field: col,
        name: col,
        minWidth: col.length * 10
      });
    }
  }

  G_GRDMASTER.view.setColumns(columns);
}

function canExecuteQuery(queryText) {

  var result = false;
  try {
    var checkVal = queryText.substr(0, 2);
    if (checkVal === "--" || checkVal === "/*") {
      var queryLines = queryText.split("\n");
      var lineCount = queryLines.length;
      var blockComment = false;
      for (var i = 0; i < lineCount; i++) {
        var line = queryLines[i].trim();
        if ($NC.isNull(line)) {
          continue;
        }
        if (!blockComment) {
          checkVal = line.substr(0, 2);
          if ((checkVal === "--")) {
            continue;
          }
          if ((checkVal === "/*")) {
            blockComment = true;
            continue;
          }
          if (line.substr(0, 6) === "SELECT" || line.substr(0, 4) === "WITH") {
            result = true;
            break;
          }
        } else {
          if ((line.lastIndexOf("*/") > -1)) {
            blockComment = false;
            continue;
          }
        }
      }
    } else {
      if (queryText.substr(0, 6) === "SELECT" || queryText.substr(0, 4) === "WITH") {
        result = true;
      }
    }
  } catch (e) {
  }
  return result;
}

function onBtnOpenFile() {

  $NC.G_MAIN.uploadFileSelect(function(view, fileName) {

    var fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    if (fileExt != "txt") {
      alert("텍스트 파일(*.txt) 파일을 선택하십시오.");
      return;
    }

    $NC.G_MAIN.fileUpload("/CS09010Q/openQuery.do", {
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, function(ajaxData) {
      var resultData = $NC.toArray(ajaxData);

      // 조회시 전역 변수 값 초기화
      $NC.setInitGridVar(G_GRDMASTER);
      G_GRDMASTER.view.setColumns([ ]);
      $NC.setInitGridData(G_GRDMASTER);

      $NC.setValue("#edtQQuery_Text", resultData.RESULT_DATA);
    });
  });
}

function onBtnSaveFile() {

  var QUERY_TEXT = $NC.getValue("#edtQQuery_Text");
  if ($NC.isNull(QUERY_TEXT)) {
    alert("저장할 쿼리를 입력하십시오.");
    return;
  }

  var result = confirm("쿼리를 파일로 저장하시겠습니까?");
  if (result) {
    $NC.G_MAIN.fileDownload("/CS09010Q/saveQuery.do", {
      P_QUERY_TEXT: QUERY_TEXT,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    });
  }
}

/**
 * 조회버튼 클릭후 상단 그리드에 데이터 표시처리
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  var rowData = null;
  if (G_GRDMASTER.data.getLength() > 0) {
    rowData = G_GRDMASTER.data.getItem(0);
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
  grdMasterSetColumns(rowData);
  try {
    G_GRDMASTER.view.autosizeColumns();
  } catch (e) {
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

function onGetMasterError(ajaxData) {

  grdMasterSetColumns();
  $NC.setInitGridData(G_GRDMASTER);
  $NC.setGridDisplayRows("#grdMaster", 0, 0);

  $NC.onError(ajaxData);
}
