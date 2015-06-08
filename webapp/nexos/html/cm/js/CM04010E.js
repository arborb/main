/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();
  grdSubInitialize();

  $NC.setValue("#edtQBrand_Cd", $NC.G_USERINFO.BRAND_CD);
  $NC.setValue("#edtQBrand_Nm", $NC.G_USERINFO.BRAND_NM);

  $("#btnQBrand_Cd").click(showOwnBranPopup);
}

function _SetResizeOffset() {

  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - ($NC.G_LAYOUT.border1 * 3) - ($NC.G_LAYOUT.margin2);
  var viewWidth = Math.ceil(clientWidth / 3);
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", viewWidth, clientHeight);
  $NC.resizeContainer("#divDetailView", viewWidth, clientHeight);
  $NC.resizeContainer("#divSubView", clientWidth - (viewWidth * 2), clientHeight);

  var height = clientHeight - $NC.G_LAYOUT.header;
  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", viewWidth, height);
  $NC.resizeGrid("#grdDetail", viewWidth, height);
  $NC.resizeGrid("#grdSub", clientWidth - (viewWidth * 2), height);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회조건 체크
  var BRAND_CD = $NC.getValue("#edtQBrand_Cd", true);
  /*
  if ($NC.isNull(BRAND_NM)) {
    alert("판매사를 선택하십시오.");
    $NC.setFocus("#edtQBrand_Cd");
    return;
  }
  */

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
//    P_BRAND_CD: BRAND_CD
    P_BRAND_CD: "W000000"
  });

  // 데이터 조회
  $NC.serviceCall("/CM04010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  // grdMaster에 포커스가 있을 경우
  if (G_GRDMASTER.focused) {
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
        G_GRDMASTER.view.gotoCell(rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      BRAND_CD: "W000000",
//      BRAND_CD: $NC.getValue("#edtQBrand_Cd"),
      DEPART_CD: null,
      LINE_CD: "000000000",
      CLASS_CD: "000000000",
      GROUP_NM: null,
      id: $NC.getGridNewRowId(),
      CRUD: "N"
    };
    G_GRDMASTER.data.addItem(newRowData);

    $NC.setGridSelectRow(G_GRDMASTER, rowCount);
    // 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdMasterOnNewRecord({
      row: rowCount,
      rowData: newRowData
    });
    // grdDetail에 포커스가 있을 경우
  } else if (G_GRDDETAIL.focused) {
    if (G_GRDMASTER.data.getLength() == 0) {
      alert("상품그룹 대분류가 없습니다.\n\n상품그룹 대분류를 먼저 등록하십시오.");
      return;
    }
    var groupData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (groupData.CRUD == "N" || groupData.CRUD == "C") {
      alert("신규 상품그룹 대분류입니다.\n\n저장 후 상품그룹 중분류를 등록하십시요.");
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

    var rowCount = G_GRDDETAIL.data.getLength();
    if (rowCount > 0) {
      // 마지막 데이터가 신규 데이터일 경우 신규 데이터를 다시 만들지 않음
      var rowData = G_GRDDETAIL.data.getItem(rowCount - 1);
      if (rowData.CRUD == "N") {
        G_GRDDETAIL.view.gotoCell(rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      BRAND_CD: groupData.BRAND_CD,
      DEPART_CD: groupData.DEPART_CD,
      LINE_CD: null,
      CLASS_CD: "000000000",
      GROUP_NM: null,
      id: $NC.getGridNewRowId(),
      CRUD: "N"
    };

    G_GRDDETAIL.data.addItem(newRowData);
    $NC.setGridSelectRow(G_GRDDETAIL, rowCount);
    // 수정 상태로 변경
    G_GRDDETAIL.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdDetailOnNewRecord({
      row: rowCount,
      rowData: newRowData
    });
    // grdSub에 포커스가 있을 경우
  } else {
    if (G_GRDMASTER.data.getLength() == 0) {
      alert("상품그룹 대분류가 없습니다.\n\n상품그룹 대분류를 먼저 등록하십시오.");
      return;
    }
    var groupData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (groupData.CRUD == "N" || groupData.CRUD == "C") {
      alert("신규 상품그룹 대분류입니다.\n\n저장 후 상품그룹 중분류를 등록하십시요.");
      return;
    }

    if (G_GRDDETAIL.data.getLength() == 0) {
      alert("상품그룹 중분류가 없습니다.\n\n상품그룹 중분류를 먼저 등록하십시오.");
      return;
    }
    var groupData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);
    if (groupData.CRUD == "N" || groupData.CRUD == "C") {
      alert("신규 상품그룹 중분류입니다.\n\n저장 후 상품그룹 소분류를 등록하십시요.");
      return;
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
        G_GRDSUB.view.gotoCell(rowCount - 1, 0, true);
        return;
      }
    }

    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      BRAND_CD: groupData.BRAND_CD,
      DEPART_CD: groupData.DEPART_CD,
      LINE_CD: groupData.LINE_CD,
      CLASS_CD: null,
      GROUP_NM: null,
      id: $NC.getGridNewRowId(),
      CRUD: "N"
    };

    G_GRDSUB.data.addItem(newRowData);
    $NC.setGridSelectRow(G_GRDSUB, rowCount);
    // 수정 상태로 변경
    G_GRDSUB.lastRowModified = true;

    // 신규 데이터 생성 후 이벤트 호출
    grdSubOnNewRecord({
      row: rowCount,
      rowData: newRowData
    });
  }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }

  if (G_GRDMASTER.focused) {

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
  } else if (G_GRDDETAIL.focused) {

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
  } else {

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
  }

  var saveMasterDS = [ ];
  var saveDetailDS = [ ];
  var saveSubDS = [ ];
  var rowCount;
  var row;
  var rowData;
  var saveData;

  // 상품그룹 대분류 수정 데이터
  rowCount = G_GRDMASTER.data.getLength();
  for (row = 0; row < rowCount; row++) {
    rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      saveData = {
        P_BRAND_CD: rowData.BRAND_CD,
        P_DEPART_CD: rowData.DEPART_CD,
        P_LINE_CD: rowData.LINE_CD,
        P_CLASS_CD: rowData.CLASS_CD,
        P_GROUP_NM: rowData.GROUP_NM,
        P_CRUD: rowData.CRUD
      };
      saveMasterDS.push(saveData);
    }
  }

  // 상품그룹 중분류 수정 데이터
  rowCount = G_GRDDETAIL.data.getLength();
  for (row = 0; row < rowCount; row++) {
    rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD !== "R") {
      saveData = {
        P_BRAND_CD: rowData.BRAND_CD,
        P_DEPART_CD: rowData.DEPART_CD,
        P_LINE_CD: rowData.LINE_CD,
        P_CLASS_CD: rowData.CLASS_CD,
        P_GROUP_NM: rowData.GROUP_NM,
        P_CRUD: rowData.CRUD
      };
      saveDetailDS.push(saveData);
    }
  }

  // 상품그룹 소분류 수정 데이터
  rowCount = G_GRDSUB.data.getLength();
  for (row = 0; row < rowCount; row++) {
    rowData = G_GRDSUB.data.getItem(row);
    if (rowData.CRUD !== "R") {
      saveData = {
        P_BRAND_CD: rowData.BRAND_CD,
        P_DEPART_CD: rowData.DEPART_CD,
        P_LINE_CD: rowData.LINE_CD,
        P_CLASS_CD: rowData.CLASS_CD,
        P_GROUP_NM: rowData.GROUP_NM,
        P_CRUD: rowData.CRUD
      };
      saveSubDS.push(saveData);
    }
  }

  if (saveMasterDS.length > 0 || saveDetailDS.length > 0 || saveSubDS.length > 0) {
    $NC.serviceCall("/CM04010E/save.do", {
      P_DS_MASTER: $NC.toJson(saveMasterDS),
      P_DS_DETAIL: $NC.toJson(saveDetailDS),
      P_DS_SUB: $NC.toJson(saveSubDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  var messageAnswer;

  if (G_GRDMASTER.focused) {

    if (G_GRDMASTER.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    if (G_GRDDETAIL.data.getLength() == 0) {
      messageAnswer = confirm("상품그룹 대분류를 삭제 하시겠습니까?");
    } else {
      messageAnswer = confirm("하위 데이터가 있습니다.\n\n상품그룹 대분류를 삭제 하시겠습니까?");
    }

    if (messageAnswer) {
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
  } else if (G_GRDDETAIL.focused) {

    if (G_GRDDETAIL.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    if (G_GRDDETAIL.data.getLength() == 0) {
      messageAnswer = confirm("상품그룹 중분류를 삭제 하시겠습니까?");
    } else {
      messageAnswer = confirm("하위 데이터가 있습니다.\n\n상품그룹 중분류를 삭제 하시겠습니까?");
    }

    if (messageAnswer) {
      var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

      // 신규 데이터일 경우 그냥 삭제
      if (rowData.CRUD === "C" || rowData.CRUD === "N") {
        // 마지막 선택 Row 수정 상태 복원
        G_GRDDETAIL.lastRowModified = false;

        G_GRDDETAIL.data.deleteItem(rowData.id);
        // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
        if (G_GRDDETAIL.lastRow > 1) {
          $NC.setGridSelectRow(G_GRDDETAIL, G_GRDDETAIL.lastRow - 1);
        } else {
          $NC.setGridSelectRow(G_GRDDETAIL, 0);
        }
      } else {
        rowData.CRUD = "D";
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
        _Save();
      }
    }
  } else {

    if (G_GRDSUB.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    messageAnswer = confirm("상품그룹 소분류를 삭제 하시겠습니까?");
    if (messageAnswer) {
      var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);

      // 신규 데이터일 경우 그냥 삭제
      if (rowData.CRUD === "C" || rowData.CRUD === "N") {
        // 마지막 선택 Row 수정 상태 복원
        G_GRDSUB.lastRowModified = false;

        G_GRDSUB.data.deleteItem(rowData.id);
        // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
        if (G_GRDSUB.lastRow > 1) {
          $NC.setGridSelectRow(G_GRDSUB, G_GRDDETAIL.lastRow - 1);
        } else {
          $NC.setGridSelectRow(G_GRDSUB, 0);
        }
      } else {
        rowData.CRUD = "D";
        G_GRDSUB.data.updateItem(rowData.id, rowData);
        _Save();
      }
    }
  }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "DEPART_CD",
    isCancel: true
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "LINE_CD",
    isCancel: true
  });
  var lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDSUB, {
    selectKey: "CLASS_CD",
    isCancel: true
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL.lastKeyVal = lastKeyVal2;
  G_GRDSUB.lastKeyVal = lastKeyVal3;
}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

}

function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDSUB);
  $NC.clearGridData(G_GRDDETAIL);
  $NC.clearGridData(G_GRDMASTER);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 조회조건이 변경될 때 호출
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  switch (id) {
  case "BRAND_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      var CUST_CD = $NC.G_USERINFO.CUST_CD;
      var BU_CD = $NC.G_USERINFO.BU_CD;
      P_QUERY_PARAMS = {
        P_CUST_CD: CUST_CD,
        P_BU_CD: BU_CD,
        P_OWN_BRAND_CD: val
      };
      O_RESULT_DATA = $NP.getOwnBrandInfo({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      });
    }
    if (O_RESULT_DATA.length <= 1) {
      onOwnBrandPopup(O_RESULT_DATA[0]);
    } else {
      $NP.showOwnBranPopup({
        queryParams: P_QUERY_PARAMS,
        queryData: O_RESULT_DATA
      }, onOwnBrandPopup, onOwnBrandPopup);
    }
    return;
  }

  onChangingCondition();
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "DEPART_CD",
    field: "DEPART_CD",
    name: "대분류코드",
    minWidth: 90,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    },
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "GROUP_NM",
    field: "GROUP_NM",
    name: "대분류명",
    minWidth: 180,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CM04010E.RS_MASTER",
    sortCol: "DEPART_CD",
    gridOptions: options
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
  $("#grdMaster").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDMASTER.focused) {
      return;
    }
    G_GRDMASTER.focused = true;
    G_GRDDETAIL.focused = false;
    G_GRDSUB.focused = false;

    // 중분류 데이터 Post 처리
    if (G_GRDDETAIL.view.getEditorLock().isActive()) {
      G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL.lastRow != null) {
        if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
          G_GRDDETAIL.view.getCanvasNode.focus();
        }
      }
    }

    // 소분류 데이터 Post 처리
    if (G_GRDSUB.view.getEditorLock().isActive()) {
      G_GRDSUB.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDSUB.lastRow != null) {
        if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
          G_GRDSUB.view.getCanvasNode.focus();
        }
      }
    }
  });
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
}

function grdMasterOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDMASTER, args.row, 0, true);
}

function grdMasterOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "DEPART_CD") {
    return true;
  }
  var rowData = G_GRDMASTER.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      return false;
    }
  }
  return true;
}

function grdMasterOnCellChange(e, args) {

  var rowData = args.item;
  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

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
    if ($NC.isNull(rowData.DEPART_CD)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.DEPART_CD)) {
      alert("대분류코드를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("DEPART_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.GROUP_NM)) {
      alert("대분류명을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      G_GRDMASTER.view.gotoCell(row, G_GRDMASTER.view.getColumnIndex("GROUP_NM"), true);
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }
  return true;
}

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

  // 조회시 중분류 변수 초기화
  $NC.setInitGridVar(G_GRDDETAIL);

  onGetDetail({
    data: null
  });

  var rowData = G_GRDMASTER.data.getItem(row);

  if (rowData.CRUD !== "C" && rowData.CRUD !== "N") {
    // 중분류 파라메터 세팅
    G_GRDDETAIL.queryParams = $NC.getParams({
      P_BRAND_CD: rowData.BRAND_CD,
      P_DEPART_CD: rowData.DEPART_CD
    });

    // 중분류 조회
    $NC.serviceCall("/CM04010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_CD",
    field: "LINE_CD",
    name: "중분류코드",
    minWidth: 90,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    },
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "GROUP_NM",
    field: "GROUP_NM",
    name: "중분류명",
    minWidth: 180,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "CM04010E.RS_DETAIL",
    sortCol: "LINE_CD",
    gridOptions: options
  });
  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  $("#grdDetail").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDDETAIL.focused) {
      return;
    }
    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = true;
    G_GRDSUB.focused = false;

    // 대분류 데이터 Post 처리
    if (G_GRDMASTER.view.getEditorLock().isActive()) {
      G_GRDMASTER.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDMASTER.lastRow != null) {
        if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
          return;
        }
      }
    }

    // 소분류 데이터 Post 처리
    if (G_GRDSUB.view.getEditorLock().isActive()) {
      G_GRDSUB.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDSUB.lastRow != null) {
        if (!grdSubOnBeforePost(G_GRDSUB.lastRow)) {
          return;
        }
      }
    }
  });
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
}

function grdDetailOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDDETAIL, args.row, 0, true);
}

function grdDetailOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "LINE_CD") {
    return true;
  }
  var rowData = G_GRDDETAIL.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      return false;
    }
  }
  return true;
}

function grdDetailOnCellChange(e, args) {

  var rowData = args.item;
  if ($NC.isNull(rowData.CRUD) || rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
}

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

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.LINE_CD)) {
      G_GRDDETAIL.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.LINE_CD)) {
      alert("중분류코드를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, row);
      G_GRDDETAIL.view.gotoCell(row, G_GRDDETAIL.view.getColumnIndex("LINE_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.GROUP_NM)) {
      alert("중분류명을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, row);
      G_GRDDETAIL.view.gotoCell(row, G_GRDDETAIL.view.getColumnIndex("GROUP_NM"), true);
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  }
  return true;
}

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
  // 조회시 중분류 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDSUB);

  onGetSub({
    data: null
  });

  var rowData = G_GRDDETAIL.data.getItem(row);

  if (rowData.CRUD !== "C" && rowData.CRUD !== "N") {
    // 소분류 파라메터 세팅
    G_GRDSUB.queryParams = $NC.getParams({
      P_BRAND_CD: rowData.BRAND_CD,
      P_DEPART_CD: rowData.DEPART_CD,
      P_LINE_CD: rowData.LINE_CD
    });

    // 소분류 조회
    $NC.serviceCall("/CM04010E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

function grdSubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CLASS_CD",
    field: "CLASS_CD",
    name: "소분류코드",
    minWidth: 90,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    },
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "GROUP_NM",
    field: "GROUP_NM",
    name: "소분류명",
    minWidth: 180,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: "CM04010E.RS_SUB",
    sortCol: "CLASS_CD",
    gridOptions: options
  });
  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);
  G_GRDSUB.view.onBeforeEditCell.subscribe(grdSubOnBeforeEditCell);
  $("#grdSub").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDSUB.focused) {
      return;
    }
    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = false;
    G_GRDSUB.focused = true;

    // 대분류 데이터 Post 처리
    if (G_GRDMASTER.view.getEditorLock().isActive()) {
      G_GRDMASTER.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDMASTER.lastRow != null) {
        if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
          G_GRDMASTER.view.getCanvasNode.focus();
        }
      }
    }

    // 중분류 데이터 Post 처리
    if (G_GRDDETAIL.view.getEditorLock().isActive()) {
      G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL.lastRow != null) {
        if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
          G_GRDDETAIL.view.getCanvasNode.focus();
        }
      }
    }

  });
  G_GRDSUB.view.onCellChange.subscribe(grdSubOnCellChange);
}

function grdSubOnNewRecord(args) {

  $NC.setFocusGrid(G_GRDSUB, args.row, 0, true);
}

function grdSubOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  if (args.column.field !== "CLASS_CD") {
    return true;
  }
  var rowData = G_GRDSUB.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      return false;
    }
  }
  return true;
}

function grdSubOnCellChange(e, args) {

  var rowData = args.item;
  if ($NC.isNull(rowData.CRUD) || rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDSUB.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDSUB.lastRowModified = true;
}

function grdSubOnBeforePost(row) {

  if (!G_GRDSUB.lastRowModified) {
    return true;
  }

  var rowData = G_GRDSUB.data.getItem(row);
  if ($NC.isNull(rowData)) {
    return true;
  }
  // 삭제 데이터면 Return
  if (rowData.CRUD == "D") {
    return true;
  }

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.CLASS_CD)) {
      G_GRDSUB.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.CLASS_CD)) {
      alert("소분류코드를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUB, row);
      G_GRDSUB.view.gotoCell(row, G_GRDSUB.view.getColumnIndex("CLASS_CD"), true);
      return false;
    }
    if ($NC.isNull(rowData.GROUP_NM)) {
      alert("소분류명을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDSUB, row);
      G_GRDSUB.view.gotoCell(row, G_GRDSUB.view.getColumnIndex("GROUP_NM"), true);
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDSUB.data.updateItem(rowData.id, rowData);
  }
  return true;
}

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

function showBrandPopup() {
  _ShowUserBrandPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BRNAD_CD: "%"
  }, onBrandPopupSelect, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

function onBrandPopupSelect(seletedRowData) {

  $NC.setValue("#edtQBrand_Cd", seletedRowData.BRAND_CD);
  $NC.setValue("#edtQBrand_Nm", seletedRowData.BRAND_NM);

  onChangingCondition();
}

function onBrandPopupCancel() {

  $NC.setValue("#edtQBrand_Cd");
  $NC.setValue("#edtQBrand_Nm");

  $NC.setFocus("#edtQBrand_Cd", true);
}

function onGetBrand(ajaxData) {

  var arrayData = $NC.toArray(ajaxData);
  if (arrayData.length === 1) {
    $("#edtQBrand_Cd").val(arrayData[0].BRAND_CD);
    $("#edtQBrand_Nm").val(arrayData[0].BRAND_NM);
  } else if (arrayData.length === 0) {
    alert("등록되어 있지 않은 위탁사입니다.");
    onBrandPopupCancel();
  } else {
    _ShowUserBrandPopup({
      queryParams: {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BRNAD_CD: $NC.getValue("#edtQBrand_Cd")
      },
      queryData: arrayData
    }, onBrandPopupSelect, function() {
      onBrandPopupCancel();
      onChangingCondition();
    });
    return;
  }

  onChangingCondition();
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "DEPART_CD",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);

    // 중분류 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDDETAIL);
    onGetDetail({
      data: null
    });
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

function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "LINE_CD",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);

    // 소분류 전역 변수 값 초기화
    $NC.setInitGridVar(G_GRDSUB);
    onGetSub({
      data: null
    });
  }
}

function onGetSub(ajaxData) {

  $NC.setInitGridData(G_GRDSUB, ajaxData);
  if (G_GRDSUB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDSUB.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSUB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSUB, {
        selectKey: "CLASS_CD",
        selectVal: G_GRDSUB.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdSub", 0, 0);
  }
}

function onSave(ajaxData) {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "DEPART_CD"
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "LINE_CD"
  });
  var lastKeyVal3 = $NC.getGridLastKeyVal(G_GRDSUB, {
    selectKey: "CLASS_CD"
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL.lastKeyVal = lastKeyVal2;
  G_GRDSUB.lastKeyVal = lastKeyVal3;
}

function onSaveError(ajaxData) {

  $NC.onError(ajaxData);
  if (G_GRDMASTER.focused) {
    var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

    if (rowData.CRUD === "D") {
      rowData.CRUD = "U";
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
      // 마지막 선택 Row 수정 상태로 변경
      G_GRDMASTER.lastRowModified = true;
    }
  } else if (G_GRDDETAIL.focused) {
    var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

    if (rowData.CRUD === "D") {
      rowData.CRUD = "U";
      G_GRDDETAIL.data.updateItem(rowData.id, rowData);
      // 마지막 선택 Row 수정 상태로 변경
      G_GRDDETAIL.lastRowModified = true;
    }
  } else {
    var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);

    if (rowData.CRUD === "D") {
      rowData.CRUD = "U";
      G_GRDSUB.data.updateItem(rowData.id, rowData);
      // 마지막 선택 Row 수정 상태로 변경
      G_GRDSUB.lastRowModified = true;
    }
  }
}


/**
 * 검색조건의 브랜드 검색 팝업 클릭
 */
function showOwnBranPopup() {

  var CUST_CD = $NC.G_USERINFO.CUST_CD;
  var BU_CD = $NC.G_USERINFO.BU_CD;

  $NP.showOwnBranPopup({
    P_CUST_CD:  CUST_CD,   
    P_BU_CD: BU_CD,
    P_OWN_BRAND_CD: '%'
  }, onOwnBrandPopup, function() {
    $NC.setFocus("#edtQBrand_Cd", true);
  });
}

/**
 * 브랜드 검색 결과
 * 
 * @param seletedRowData
 */
function onOwnBrandPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBrand_Cd", resultInfo.OWN_BRAND_CD);
    $NC.setValue("#edtQBrand_Nm", resultInfo.OWN_BRAND_NM);
  } else {
    $NC.setValue("#edtQBrand_Cd");
    $NC.setValue("#edtQBrand_Nm");
    $NC.setFocus("#edtQBrand_Cd", true);
  }
  onChangingCondition();
}

