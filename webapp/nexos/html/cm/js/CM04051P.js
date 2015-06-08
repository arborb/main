/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();

  $("#btnSave").click(_Save); // 저장버튼
  $("#btnClose").click(onCancel); // 닫기버튼
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {
  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);

  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * Grid에서 CheckBox Fomatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          grid, row, cell, val
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDMASTER, args.row);

  var rowData = G_GRDMASTER.data.getItem(args.row);

  if (args.cell == G_GRDMASTER.view.getColumnIndex("CHECK_YN")) {
    rowData.CHECK_YN = args.val === "Y" ? "N" : "Y";
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  G_GRDMASTER.lastModified = true;

}

/**
 * 등록팝업 Open 시 호출 됨
 */
function _OnPopupOpen() {

  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
    P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID

  });

  // 데이터 조회
  $NC.serviceCall("/CM04050E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
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

  if (G_GRDMASTER.data.getItems().length == 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  var checkedValueDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      checkedValueDS.push(rowData.ITEM_CD);
    }
  }

  if (checkedValueDS.length == 0) {
    alert("할당할 상품을 선택하십시오.");
    return;
  }

  $NC.serviceCall("/CM04050E/callCenterItemCheckAllocate.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_VAR.userData.P_CENTER_CD,
      P_BU_CD: $NC.G_VAR.userData.P_BU_CD,
      P_USER_ID: $NC.G_USERINFO.USER_ID,
      P_CHECKED_VALUE: checkedValueDS.toString()
    })
  }, onSave);
}

/**
 * 삭제
 */
function _Delete() {

}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 30,
    maxWidth: 30,
    resizable: false,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
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
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "판매사명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BUY_PRICE",
    field: "BUY_PRICE",
    name: "매입단가",
    minWidth: 90,
    cssClass: "align-right"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CM04050E.RS_SUB",
    sortCol: "ITEM_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
  G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
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

/**
 * 상단 그리드의 전체체크 선택시 처리
 * 
 * @param e
 * @param args
 */
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
      for (var row = 0; row < rowCount; row++) {
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

function grdMasterOnClick(e, args) {

  if (args.cell === G_GRDMASTER.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTER.view.getEditorLock().isActive() && !G_GRDMASTER.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDMASTER.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {
        rowData.CHECK_YN = checkVal;

        if (rowData.CRUD === "R") {
          rowData.CRUD = "U";
        }

        G_GRDMASTER.data.updateItem(rowData.id, rowData);
      }
    }
  }
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
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
