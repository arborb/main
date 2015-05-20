/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();

  // 버튼 클릭 이벤트 연결
  $("#btnBoxMerge").click(onBtnBoxMerge); // 용기병합 버튼 클릭
  $("#btnBoxDelete").click(onBtnBoxDelete); // 용기삭제
  $("#btnCancel").click(onCancel); // 닫기 버튼
  $("#divButtons").show();

  $("#edtBoxScan").css("ime-mode", "disabled");

  $("#divMasterView").mousedown(function(e) {
    e.stopImmediatePropagation();
    e.preventDefault();

    setTimeout(function() {
      setFocusScan();
    }, 100);
  });
  setTimeout(function() {
    setFocusScan();
  }, 100);
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  _Inquiry();

  G_GRDMASTER.view.focus();
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.leftViewWidth = 200;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.tabHeader = $("#divMasterView").children(".ui-tabs-nav:first").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1 * 2; /* 탭일 경우는 좌우 */
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_LAYOUT.border1 - 56;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight + 36);

  clientHeight -= $NC.G_OFFSET.tabHeader + $NC.G_LAYOUT.border1;
  $NC.G_OFFSET.leftViewWidth = 300;
  clientWidth -= $NC.G_OFFSET.leftViewWidth + $NC.G_LAYOUT.nonClientWidth;

  $NC.resizeContainer("#divLeftView", $NC.G_OFFSET.leftViewWidth, clientHeight);
  $NC.resizeContainer("#divRightView", clientWidth, clientHeight);
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", $NC.G_OFFSET.leftViewWidth, clientHeight - $NC.G_LAYOUT.header);
  $NC.resizeGrid("#grdDetail", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
var CENTER_CD
  ,BU_CD
  ,OUTBOUND_DATE
  ,OUTBOUND_NO
  ,PICK_SEQ;
function _Inquiry() {

  CENTER_CD = $NC.G_VAR.userData.P_CENTER_CD;
  BU_CD = $NC.G_VAR.userData.P_BU_CD;
  OUTBOUND_DATE = $NC.G_VAR.userData.P_OUTBOUND_DATE;
  OUTBOUND_NO = $NC.G_VAR.userData.P_OUTBOUND_NO;
  PICK_SEQ = $NC.G_VAR.userData.P_PICK_SEQ;

  // 데이터 조회
  $NC.serviceCallAndWait("/LOM7110E/getDataSet.do", {
    P_QUERY_ID: "LOM7110E.RS_DETAIL",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_PICK_SEQ: PICK_SEQ
    })
  }, onGetMaster, onError);
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
 * 닫기,취소버튼 클릭 이벤트
 */
function onCancel() {

  $NC.setPopupCloseAction("CANCEL");
  $NC.onPopupClose();
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

  if (args.grid == "grdMaster") {

    if (G_GRDMASTER.view.getEditorLock().isActive()) {
      G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
    }

    $NC.setGridSelectRow(G_GRDMASTER, args.row);

    var rowData = G_GRDMASTER.data.getItem(args.row);

    if (args.cell == G_GRDMASTER.view.getColumnIndex("CHECK_YN")) {
      rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
    }

    G_GRDMASTER.data.updateItem(rowData.id, rowData);

    var checkedRows = $NC.getGridSearchRows(G_GRDMASTER, {
      searchKey: "CHECK_YN",
      searchVal: "Y"
    });
    if (checkedRows.length > 1) {
      $NC.setEnable('#btnBoxMerge');
    } else {
      $NC.setEnable('#btnBoxMerge', false);
    }
  }
}


function onError(ajaxData) {
  console.log(ajaxData);
}

/**
 * 그리드 초기값 설정
 */
function grdMasterInitialize() {

  var options = {
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.BOXING_YN === "N") {
          return "specialrow4";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "LOM7110E.RS_T1_MASTER",
    sortCol: "BOX_NO",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
}

/**
 * 그리드 초기값 컬럼 설정
 */
function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 60,
    maxWidth: 60,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "PICK_BOX_NO",
    field: "PICK_BOX_NO",
    name: "용기번호",
    minWidth: 100,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterOnAfterScroll(e, args) {
  var row = args.rows[0];

  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdMaster", row + 1);
  var rowData = G_GRDMASTER.data.getItem(row);
  getDataDetail(rowData);
}

function grdMasterOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTER.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDMASTER.view.getEditorLock().isActive() && !G_GRDMASTER.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDMASTER.data.getLength();
      var rowData;
      G_GRDMASTER.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDMASTER.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDMASTER.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTER.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastRow)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, G_GRDMASTER.lastRow);
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
  rowLength = G_GRDMASTER.data.getLength();
  if (rowLength > 1) {
    $NC.setEnable('#btnBoxMerge');
  } else {
    $NC.setEnable('#btnBoxMerge', false);
  }
}

function grdDetailOnGetColumns() {
  var columns = [ ];
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
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "기검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL.lastRow != null) {
    if (row == G_GRDDETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }
  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

/**
 * 용기관리탭의 상품별 검수내역 그리드 초기값 설정
 */
function grdDetailInitialize() {

  var options = {};

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "LOM7111E.RS_T1_DETAIL",
    sortCol: "ITEM_CD",
    gridOptions: options,
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

/**
 * 디테일 그리드 가져오기
 */
function getDataDetail(rowData) {
  $NC.serviceCallAndWait("/LOM7110E/getDataSet.do", {
    P_QUERY_ID: "LOM7110E.RS_DETAIL1",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: rowData.CENTER_CD,
      P_BU_CD: rowData.BU_CD,
      P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
      P_PICK_BOX_NO: rowData.PICK_BOX_NO
    })
  }, onGetDetail, onError);
}
function onGetDetail(ajaxData) {
  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastRow)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.lastRow);
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
}



/**
 * Key Up Event
 * 
 * @param e
 * @param view
 */
function _OnInputKeyUp(e, view) {
  var id = view.prop("id").substr(3).toUpperCase();
  var scanVal = "";
  var scanLen = 0;
  scanVal = $NC.getValue(view);
  // 입력 값 길이
  scanLen = scanVal.length;
  if (scanLen == 0) {
    e.stopImmediatePropagation();
    return;
  }
  scanVal = scanVal.toUpperCase();

  switch (id) {
  case "BOXSCAN":
    if (e.keyCode == 13) {
      // 용기스캔
      onScanItem(scanVal);
    }
  break;
  }
  e.stopImmediatePropagation();
}

/**
 * 용기스캔
 * 
 * @param scanVal
 */
function onScanItem(scanVal) {

  // 그리드 데이터에서 해당 행 선택
  if (!checkScanCode(scanVal)) {
    return false;
  }
  
  // 데이터 조회
  $NC.setValue('#edtBox_No');
  $NC.serviceCallAndWait("/LOM7110E/callSP.do", {
    P_QUERY_ID: "LO_PICK_SCAN_BOX_ADD",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: OUTBOUND_NO,
      P_PICK_BOX_NO: scanVal,
      P_PICK_SEQ: "",
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onGetItemInfo, onError);
}

/**
 * 용기추가
 * 
 * @param ajaxData
 */
function onGetItemInfo(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if ($NC.isNull(resultData)) {
    return false;
  }

  if (resultData.O_MSG !== "OK") {
    showMessage(resultData.O_MSG);
    return false;
  }

  if (G_GRDMASTER.data.getLength() === 0) {
    $NC.setInitGridData(G_GRDMASTER, ajaxData);
  } else {
    var resultArray = $NC.toArray(ajaxData);
    resultArray.id = 'id_' + G_GRDMASTER.data.getLength();
    resultArray.PICK_BOX_NO2 = resultData.P_PICK_BOX_NO2;
    G_GRDMASTER.data.addItem(resultArray);
  }
  
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, G_GRDMASTER.data.getLength()-1);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: ["OUTBOUND_NO", "SHIPPER_NM"],
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
    showMessage("조회된 데이터가 없습니다. 확인 후 작업하십시오.");
    rowData = G_GRDMASTER.data.getItem(0);
  }
  setFocusScan();
}

/**
 * 중복스캔 확인
 * 
 * @param ajaxData
 */
function checkScanCode(scanVal) {
  var rowDatas = G_GRDMASTER.data.getItems();
  for (var i in rowDatas) {
    var pickbox = rowDatas[i].PICK_BOX_NO ? rowDatas[i].PICK_BOX_NO.toUpperCase() : rowDatas[i].PICK_BOX_NO;
    if (pickbox == scanVal.toUpperCase()) {
      alert('해당 스캔용기가 존재합니다.');
      setFocusScan();
      return false;
    }
  }
  return true;
}

/**
 * 용기병합 버튼 클릭
 */
function onBtnBoxMerge() {

  if (G_GRDMASTER.data.getLength() == 0) {
    return;
  }

  var checkedRows = $NC.getGridSearchRows(G_GRDMASTER, {
    searchKey: "CHECK_YN",
    searchVal: "Y"
  });

  if (checkedRows.length != 2) {
    alert("용기병합할 2개의 용기번호를 선택하십시오.");
    return;
  }

  var rowData1 = G_GRDMASTERT1.data.getItem(checkedRows[0]);
  var rowData2 = G_GRDMASTERT1.data.getItem(checkedRows[1]);
  var CENTER_CD = $NC.G_VAR.userData.P_CENTER_CD;
  var BU_CD = $NC.G_VAR.userData.P_BU_CD;
  var OUTBOUND_DATE = $NC.G_VAR.userData.P_OUTBOUND_DATE;
  var OUTBOUND_NO = $NC.G_VAR.userData.P_OUTBOUND_NO;
  var BOX_NO_FROM;
  var BOX_NO_TO;

  if (rowData1.BOX_NO > rowData2.BOX_NO) {
    BOX_NO_TO = rowData2.BOX_NO;
    BOX_NO_FROM = rowData1.BOX_NO;
  } else {
    BOX_NO_TO = rowData1.BOX_NO;
    BOX_NO_FROM = rowData2.BOX_NO;
  }

  if (!confirm("[" + BOX_NO_FROM + "]번 용기를 [" + BOX_NO_TO + "]번 용기로 병합하시겠습니까?")) {
    return;
  }

  $NC.serviceCall("/LOM7010E/callScanBoxMerge.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: CENTER_CD,
      P_BU_CD: BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: OUTBOUND_NO,
      P_OLD_BOX_NO: BOX_NO_TO,
      P_NEW_BOX_NO: BOX_NO_FROM,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onSave);
}

/**
 * 용기삭제 버튼 클릭
 */
function onBtnBoxDelete() {

  if (G_GRDMASTER.data.getLength() == 0) {
    return;
  }

  var masterDS = [ ];
  // 필터링 된 데이터라 전체 데이터를 기준으로 처리
  for ( var i = 0; i < G_GRDMASTER.data.getLength(); i++) {
    var rowData = G_GRDMASTER.data.getItem(i);
    if (rowData.CHECK_YN == "Y") {
      var saveData = {
        P_CENTER_CD: CENTER_CD,
        P_BU_CD: BU_CD,
        P_OUTBOUND_DATE: OUTBOUND_DATE,
        P_PICK_BOX_NO: rowData.PICK_BOX_NO2,
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      masterDS.push(saveData);
    }
  }

  if (masterDS.length === 0) {
    alert("삭제할 용기번호를 선택하십시오.");
    return;
  }

  if (!confirm("선택한 용기번호를 삭제하시겠습니까?")) {
    return;
  }
  
  $NC.serviceCall("/LOM7110E/callBoxDelete.do", {
    P_DS_MASTER: $NC.toJson(masterDS)
  }, onSave);

}

/**
 * 스캔 포인트 포커스 이동, 초기화
 */
function setFocusScan() {
  $NC.setFocus("#edtBoxScan");
  $NC.setValue("#edtBoxScan");
}

function onSave(ajaxData) {
  var resultData = $NC.toArray(ajaxData);
  if ($NC.isNull(resultData)) {
    return false;
  }

  if (resultData.RESULT_DATA !== "OK") {
    showMessage(resultData.RESULT_DATA);
    return false;
  }
  $NC.clearGridData(G_GRDMASTER)
  setFocusScan();
  _Inquiry();
}

/**
 * 메세지창보기
 */
function showMessage(options, hideFocus) {

  if ($NC.isNull(options)) {
    return;
  }

  if ($NC.isNull(hideFocus)) {
    hideFocus = false;
  }

  if (typeof options == "string") {
    $NC.G_MAIN.showMessage({
      message: options,
      buttons: {
        "확인": function() {
          $NC.G_MAIN.setFocusActiveWindow();
          setFocusScan();
        }
      },
      hideFocus: hideFocus
    });
    return;
  }

  if ($NC.isNull(options.buttons) && !$NC.isNull(options.focusSelector)) {
    $NC.G_MAIN.showMessage({
      message: options,
      buttons: {
        "확인": function() {
          $NC.G_MAIN.setFocusActiveWindow();
          $NC.setFocus(options.focusSelector);
        }
      },
      hideFocus: hideFocus
    });
    return;
  }

  var buttons = {};
  if (options.onYesFn) {
    buttons["예"] = function() {
      $NC.G_MAIN.setFocusActiveWindow();
      options.onYesFn.call(this);
    };
  }
  if (options.onNoFn) {
    buttons["아니오"] = function() {
      $NC.G_MAIN.setFocusActiveWindow();
      options.onNoFn.call(this);
    };
  }

  $NC.G_MAIN.showMessage({
    message: options.message,
    buttons: buttons,
    hideFocus: hideFocus
  });
}








