/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();

  $("#btnOk").click(onClose);
  $("#btnCancel").click(onCancel);

  // 전체 조회가 불가능하면 필수로 CSS 변경
  if (!$NC.G_VAR.userData.queryCanAll) {
    $("#edtSearchVal").removeClass("ui-edt-normal").addClass("ui-edt-key");
  }
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divTopView").outerHeight() + $("#divBottomView").outerHeight()
      + $NC.G_LAYOUT.border1;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Container 사이즈 조정
  $NC.resizeContainer("#divCenterView", clientWidth, clientHeight);
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * Load Complete Event
 */
function _OnPopupOpen() {

  G_GRDMASTER.queryParams = $NC.getParams($NC.G_VAR.userData.queryParams);
  // 데이터를 넘겨 받으면 데이터 그냥 표시
  if ($NC.G_VAR.userData.queryData) {
    try {
      $NC.showProgressMessage();
      onGetDataSet({
        data: $NC.G_VAR.userData.queryData
      });

      $NC.setValue("#edtSearchVal", $NC.G_VAR.userData.queryParams[$NC.G_VAR.userData.querySearchParam]);
      $NC.setFocus("#edtSearchVal");
    } finally {
      $NC.hideProgressMessage();
    }
  } else {
    // 자동 조회
    if ($NC.G_VAR.userData.autoInquiry) {
      // 조회 파라메터 값 읽기
      var value = $NC.G_VAR.userData.queryParams[$NC.G_VAR.userData.querySearchParam];

      // 전체 조회를 할 수 없을 경우 파라메터 값이 전체면 조회 안함
      if (($NC.isNull(value) || value == "%") && !$NC.G_VAR.userData.queryCanAll) {
        return;
      }
      btnSearchOnClick();
    } else {
      $NC.setFocus("#edtSearchVal");
    }
  }
}

function _OnInputKeyUp(e, view) {
  if (e.which !== 13) {
    return;
  }

  if (view[0].id === "edtSearchVal") {
    $("#btnSearch").click();
  }
}

function btnSearchOnClick() {

  var searchVal = $NC.getValue("#edtSearchVal");
  // 값이 없으면 %
  if ($NC.isNull(searchVal)) {
    searchVal = "%";
  }

  // 전체 조회를 할 수 없을 경우 파라메터 값이 전체면 조회 안함
  if (searchVal == "%" && !$NC.G_VAR.userData.queryCanAll) {
//    alert("검색 값을 입력해야 조회할 수 있습니다.");
    $NC.setFocus("#edtSearchVal");
    return;
  }

  // 검색 값 입력
  if ($NC.G_VAR.userData.queryParams) {
    $NC.G_VAR.userData.queryParams[$NC.G_VAR.userData.querySearchParam] = searchVal;
  }

  var queryParams = $.extend(true, {}, $NC.G_VAR.userData.queryParams);
  delete queryParams.columnTitle;
  G_GRDMASTER.queryParams = $NC.getParams(queryParams);

  // 데이터 조회
  $NC.serviceCall($NC.G_VAR.userData.requestUrl, $NC.getGridParams(G_GRDMASTER), onGetDataSet);
}

function onCancel() {

  $NC.setPopupCloseAction("CANCEL");

  var onAfterCancel = $NC.G_VAR.userData.onCancel;
  $NC.onPopupClose();
  if (onAfterCancel) {
    onAfterCancel();
  }
}

function onClose() {

  if (G_GRDMASTER.lastRow == null) {
    alert("선택한 데이터가 없습니다.");
    $NC.setFocus("#edtSearchVal");
    return;
  }

  $NC.setPopupCloseAction("OK");

  var onSelect = $NC.G_VAR.userData.onSelect;
  if (onSelect) {
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    $NC.onPopupClose();
    onSelect(rowData);
  } else {
    $NC.onPopupClose();
  }
}

function grdMasterInitialize() {

  var options = {};

  $NC.setValue("#divTitle_grdMaster", $NC.G_VAR.userData.title.replace(" 검색", ""));
  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: $NC.G_VAR.userData.columns,
    queryId: $NC.G_VAR.userData.queryId,
    sortCol: $NC.G_VAR.userData.columns[0].field,
    gridOptions: options
  });

  // Grid 더블클릭 이벤트
  G_GRDMASTER.view.onDblClick.subscribe(function(e, args) {
    $("#btnOk").click();
  });
  // Grid 로우체인지 이벤트
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

function onGetDataSet(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }
  $NC.setFocus("#edtSearchVal");
}