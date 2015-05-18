/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    // 마스터 데이터
    masterData: null,

  });


  $("#btnSave").click(_Save); // 저장 버튼
  $("#btnClose").click(PopupClose); // 저장 버튼
  // 그리드 초기화
  grdSubEInitialize();
}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {


  $NC.serviceCall("/CS01000E/getDataSet.do", $NC.getGridParams(G_GRDSUBE), onGetSubE);

}
/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.masterViewHeight = 1;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.topOffset;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_LAYOUT.border1 - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divsubView", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdSubE", clientWidth, clientHeight - $NC.G_OFFSET.masterViewHeight - $NC.G_LAYOUT.header);
}

/**
 * 저장,확인버튼 클릭 이벤트
 */
function onClose(resultInfo) {

  $NC.setPopupCloseAction("OK", resultInfo );
  $NC.onPopupClose();
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

  if (G_GRDSUBE.data.getLength() == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  // 현재 수정모드면
  if (G_GRDSUBE.view.getEditorLock().isActive()) {
    G_GRDSUBE.view.getEditorLock().commitCurrentEdit();
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDSUBE.lastRow != null) {
    if (!grdSubEOnBeforePost(G_GRDSUBE.lastRow)) {
      return;
    }
  }

  var group = [ ];
  var chkCnt = 0;
  var rows = G_GRDSUBE.data.getItems();
  var rowCount = rows.length;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CHECK_YN == "Y") {
      var saveData = {     
        P_NOTICE_GROUP_CD: rowData.NOTICE_GROUP_CD,
        P_NOTICE_GROUP_NM: rowData.NOTICE_GROUP_NM,
        P_NOTICE_FROM_DATE: $NC.G_VAR.userData.P_NOTICE_FROM_DATE,
        P_CHECK_YN: rowData.CHECK_YN
      };
      group.push(saveData);
      chkCnt++;
    }
  }


  if (chkCnt == 0) {
    alert("그룹 정보를 선택하시기바랍니다.");
    return;
  }


  var rowCount = G_GRDSUBE.data.getLength();
  if (rowCount == 0) {
    G_GRDSUBE.lastRow = null; // 출고예정등록 상세정보 그리드의 length가 0일 경우 현재고에 0이 표시되는것 막기 위해 추가
  }
 
  onClose(group);
}
/**
 * 저장후 처리
 * 
 * @param ajaxData
 */
function onSave1(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
      return;
    }
  }
  onClose();
}



function grdSubEOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 40,
    maxWidth: 40,
    cssClass: "align-center",
    sortable: false,
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "NOTICE_GROUP_CD",
    field: "NOTICE_GROUP_CD",
    name: "공지그룹코드",
    minWidth: 100
  });

  $NC.setGridColumn(columns, {
    id: "NOTICE_GROUP_NM",
    field: "NOTICE_GROUP_NM",
    name: "공지그룹명",
    minWidth: 100
  });

  return $NC.setGridColumnDefaultFormatter(columns);

}

/**
 * 그리드 초기값 설정
 */
function grdSubEInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSubE", {
    columns: grdSubEOnGetColumns(),
    queryId: "CS01000E.RS_SUB4",
    sortCol: "NOTICE_GROUP_CD",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDSUBE.view.onSelectedRowsChanged.subscribe(grdSubEOnAfterScroll);
  G_GRDSUBE.view.onHeaderClick.subscribe(grdSubEOnHeaderClick);
  G_GRDSUBE.view.onClick.subscribe(grdSubEOnClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDSUBE, "CHECK_YN");

}






function grdSubEOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUBE.lastRow != null) {
    if (row == G_GRDSUBE.lastRow) {
      e.stopImmediatePropagation();
      return;
    }

    if (!grdSubEOnBeforePost(G_GRDSUBE.lastRow)) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSubE", row + 1);
}




/**
 * 저장시 그리드 입력 체크
 */
function grdSubEOnBeforePost(row) {

  if (!G_GRDSUBE.lastRowModified) {
    return true;
  }

  var rowData = G_GRDSUBE.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }


  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDSUBE.data.updateItem(rowData.id, rowData);
  }
  return true;
}
/**
 * 그리드에서 상품 선택/취소했을 경우 처리
 * 
 * @param seletedRowData
 */
/*
function grdSubEOnCalc(rowData, Putaway_Qty) {

  if (!$NC.isNull(Putaway_Qty)) {
    rowData.PUTAWAY_QTY = Number(Putaway_Qty);
  }

  var params = {
    TOTAL_AMT: rowData.TOTAL_AMT,// 합계금액
    POLICY_VAL: $NC.G_VAR.userData.P_POLICY_LI190
  };

  rowData.BUY_AMT = $NC.getItem_Amt(params);
  rowData.VAT_AMT = $NC.getVat_Amt(params);
  rowData.TOTAL_AMT = $NC.getTotal_Amt(params);

  return rowData;
}
*/

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

  if (G_GRDSUBE.view.getEditorLock().isActive()) {
    G_GRDSUBE.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDSUBE, args.row);

  var rowData = G_GRDSUBE.data.getItem(args.row);

  if (args.cell == G_GRDSUBE.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  G_GRDSUBE.data.updateItem(rowData.id, rowData);
}


function grdSubEOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDSUBE.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDSUBE.view.getEditorLock().isActive() && !G_GRDSUBE.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDSUBE.data.getLength();
      var rowData;
      G_GRDSUBE.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDSUBE.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDSUBE.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDSUBE.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdSubEOnClick(e, args) {

  if (args.cell === G_GRDSUBE.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDSUBE.view.getEditorLock().isActive() && !G_GRDSUBE.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDSUBE.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {

        if (rowData.CRUD === "R") {
          rowData.CRUD = "U";
        }

        G_GRDSUBE.data.updateItem(rowData.id, rowData);
      }
    }
    return;
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
 * 신규
 */
function PopupClose() {
  onClose();
}

/**
 * 로케이션별 재고현황 탭 조회 버튼 클릭후 처리
 * 
 * @param ajaxData
 */
function onGetSubE(ajaxData) {

  $NC.setInitGridData(G_GRDSUBE, ajaxData);

  if (G_GRDSUBE.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDSUBE, 0);
  } else {
    $NC.setGridDisplayRows("#grdSubE", 0, 0);

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDSUBE);

    onGetT2Detail({
      data: null
    });
  }
}
