/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();
}

/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _OnLoaded() {
  // 스플리터 초기화
  $NC.setInitSplitter("#divMasterView", "v", $NC.G_OFFSET.leftViewWidth, 300, 400);
}

/**
 * 화면 리사이즈 Offset 계산
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.leftViewWidth = 500;
  $NC.G_OFFSET.nonClientHeight = $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Splitter 컨테이너 크기 조정
  var container = $("#divMasterView");
  $NC.resizeContainer(container, clientWidth, clientHeight);

  // Grid 사이즈 조정
  var parent = $("#grdMaster").parent();
  $NC.resizeGrid("#grdMaster", parent.width(), parent.height() - $NC.G_LAYOUT.header);
  parent = $("#grdDetail").parent();
  $NC.resizeGrid("#grdDetail", parent.width(), parent.height() - $NC.G_LAYOUT.header);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 데이터 조회
  $NC.serviceCall("/CS04010E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);

}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  // grdMaster에 포커스가 있을 경우 (왼쪽그리드)
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

    // 정책그룹 기본값
    var lastRowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    var POLICY_DIV = "3"; // 사업부정책이 기본값
    var POLICY_GRP;
    if (lastRowData) {
      POLICY_GRP = lastRowData.POLICY_GRP;
    } else {
      POLICY_GRP = "CM";
    }
    // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
    var newRowData = {
      POLICY_CD: null,
      POLICY_NM: null,
      POLICY_DIV: POLICY_DIV,
      POLICY_DIV_F: $NC.getGridComboName(G_GRDMASTER, {
        colFullNameField: "POLICY_DIV_F",
        searchVal: POLICY_DIV,
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
      POLICY_GRP: POLICY_GRP,
      POLICY_GRP_F: $NC.getGridComboName(G_GRDMASTER, {
        colFullNameField: "POLICY_GRP_F",
        searchVal: POLICY_GRP,
        dataCodeField: "CODE_CD",
        dataFullNameField: "CODE_CD_F"
      }),
      REMARK1: null,
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
  } else {
    // grdDetail에 포커스가 있을 경우
    if (G_GRDMASTER.data.getLength() == 0) {
      alert("정책코드가 없습니다.\n\n정책코드를 먼저 등록하십시오.");
      return;
    }
    var masterData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (masterData.CRUD == "N" || masterData.CRUD == "C") {
      alert("신규 정책코드입니다.\n\n저장 후 정책 상세정보를 등록하십시요.");
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
      POLICY_CD: masterData.POLICY_CD,
      POLICY_VAL: null,
      POLICY_VAL_NM: null,
      RECOMMEND_YN: "N",
      REMARK1: null,
      REG_USER_ID: null,
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
  } else {
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
  }

  // 정책코드 수정 데이터
  var saveMasterDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_POLICY_CD: rowData.POLICY_CD,
        P_POLICY_NM: rowData.POLICY_NM,
        P_POLICY_DIV: rowData.POLICY_DIV,
        P_POLICY_GRP: rowData.POLICY_GRP,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveMasterDS.push(saveData);
    }
  }

  // 정책값 수정 데이터
  var saveDetailDS = [ ];
  var rowCount = G_GRDDETAIL.data.getLength();
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDDETAIL.data.getItem(row);
    if (rowData.CRUD !== "R") {
      var saveData = {
        P_POLICY_CD: rowData.POLICY_CD,
        P_POLICY_VAL: rowData.POLICY_VAL,
        P_POLICY_VAL_NM: rowData.POLICY_VAL_NM,
        P_RECOMMEND_YN: rowData.RECOMMEND_YN,
        P_REMARK1: rowData.REMARK1,
        P_CRUD: rowData.CRUD
      };
      saveDetailDS.push(saveData);
    }
  }

  if (saveMasterDS.length > 0 || saveDetailDS.length > 0) {
    $NC.serviceCall("/CS04010E/save.do", {
      P_DS_MASTER: $NC.toJson(saveMasterDS),
      P_DS_DETAIL: $NC.toJson(saveDetailDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  if (G_GRDMASTER.focused) {

    if (G_GRDMASTER.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    var result = confirm("정책을 삭제 하시겠습니까?");
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
        // 신규일 경우는 정책 상세 그리드 클리어
        $NC.setGridDisplayRows("#grdDetail", 0, 0);

      } else {
        rowData.CRUD = "D";
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
        _Save();
      }
    }
  } else {

    if (G_GRDDETAIL.data.getLength() == 0) {
      alert("삭제할 데이터가 없습니다.");
      return;
    }

    var result = confirm("정책 상세정보를 삭제 하시겠습니까?");
    if (result) {
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

          // 정책마스터 신규 행 추가후, 정책 상세의 모든 행을 삭제 했을 경우, 정책마스터의 레코드도 삭제
          if (G_GRDDETAIL.data.getLength() == 0) {
            // 마지막 선택 Row 수정 상태 복원
            G_GRDMASTER.lastRowModified = false;
            var tmpData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
            G_GRDMASTER.data.deleteItem(tmpData.id);
            // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
            if (G_GRDMASTER.lastRow > 1) {
              $NC.setGridSelectRow(G_GRDMASTER, G_GRDMASTER.lastRow - 1);
            } else {
              $NC.setGridSelectRow(G_GRDMASTER, 0);
            }
            // 신규일 경우는 정책 상세 그리드 클리어
            $NC.setGridDisplayRows("#grdDetail", 0, 0);
          }
        }
      } else {
        rowData.CRUD = "D";
        G_GRDDETAIL.data.updateItem(rowData.id, rowData);
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
    selectKey: "POLICY_CD",
    isCancel: true
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "POLICY_VAL",
    isCancel: true
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL.lastKeyVal = lastKeyVal2;
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
 * Grid에서 CheckBox Formatter를 사용할 경우 CheckBox Click 이벤트 처리
 * 
 * @param e *
 * @param view
 *          대상 Object
 * @param args
 *          row, cell, value
 */
function _OnGridCheckBoxFormatterClick(e, view, args) {

  if (G_GRDDETAIL.view.getEditorLock().isActive()) {
    G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();
  }

  $NC.setGridSelectRow(G_GRDDETAIL, args.row);

  var rowData = G_GRDDETAIL.data.getItem(args.row);

  if (args.cell == G_GRDDETAIL.view.getColumnIndex("RECOMMEND_YN")) {
    rowData.RECOMMEND_YN = args.val === "Y" ? "N" : "Y";

    if (rowData.RECOMMEND_YN == "Y") {
      // 정책상세 그리드의 권장여부는 한 행만 "Y"이어야 한다.
      var rowCount = G_GRDDETAIL.data.getLength();
      for (var row = 0; row < rowCount; row++) {
        var subRowData = G_GRDDETAIL.data.getItem(row);
        if (subRowData.RECOMMEND_YN == "Y" && args.row !== row) {
          subRowData.RECOMMEND_YN = "N";
          if (subRowData.CRUD === "R") {
            subRowData.CRUD = "U";
          }
          G_GRDDETAIL.data.updateItem(subRowData.id, subRowData);
        }
      }
    }
  }

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "POLICY_GRP_F",
    field: "POLICY_GRP_F",
    name: "정책그룹",
    minWidth: 80,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "POLICY_GRP",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "POLICY_GRP",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_CD",
    field: "POLICY_CD",
    name: "정책코드",
    minWidth: 60,
    cssClass: "align-center",
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_NM",
    field: "POLICY_NM",
    name: "정책명",
    minWidth: 200,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_DIV_F",
    field: "POLICY_DIV_F",
    name: "정책구분",
    minWidth: 120,
    editor: Slick.Editors.ComboBox,
    editorOptions: $NC.getGridComboEditorOptions("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMCODE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CODE_GRP: "POLICY_DIV",
        P_CODE_CD: "%",
        P_SUB_CD1: "",
        P_SUB_CD2: ""
      })
    }, {
      codeField: "POLICY_DIV",
      dataCodeField: "CODE_CD",
      dataFullNameField: "CODE_CD_F",
      isKeyField: true
    })
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 정책(왼쪽그리드) 그리드 초기값 설정
 */
function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 1
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CS04010E.RS_MASTER",
    sortCol: "POLICY_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onBeforeEditCell.subscribe(grdMasterOnBeforeEditCell);
  G_GRDMASTER.view.onCellChange.subscribe(grdMasterOnCellChange);
  $("#grdMaster").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDMASTER.focused) {
      return;
    }
    G_GRDMASTER.focused = true;
    G_GRDDETAIL.focused = false;

    // 디테일 데이터 Post 처리
    if (G_GRDDETAIL.view.getEditorLock().isActive()) {
      // 서브 데이터 Post 처리
      G_GRDDETAIL.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDDETAIL.lastRow != null) {
        if (!grdDetailOnBeforePost(G_GRDDETAIL.lastRow)) {
          G_GRDDETAIL.view.getCanvasNode.focus();
        }
      }
    }
  });
}

/**
 * New버튼 클릭시 추가한 행의 첫번째 셀로 포커스 이동
 * 
 * @param args
 */
function grdMasterOnNewRecord(args) {

  G_GRDMASTER.view.gotoCell(args.row, 0, true);
}

/**
 * 정책(왼쪽그리드) 그리드: 신규일 경우만 정책코드 편집 가능하도록 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdMasterOnBeforeEditCell(e, args) {

  var rowData = G_GRDMASTER.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      if (args.column.field === "POLICY_CD" || args.column.field === "POLICY_GRP_F"
          || args.column.field === "POLICY_DIV_F") {
        return false;
      }
    }
  }
  return true;
}

/**
 * 정책(왼쪽그리드) 그리드의 셀 값 변경 되었을 경우 처리
 * 
 * @param e
 * @param args
 *          row: activeRow, cell: activeCell, item: item
 */
function grdMasterOnCellChange(e, args) {

  var rowData = args.item;

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDMASTER.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;
}

/**
 * 정책(왼쪽그리드) 그리드의 입력값 체크
 */
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
    if ($NC.isNull(rowData.POLICY_CD)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R" || rowData.CRUD != "D") {
    if ($NC.isNull(rowData.POLICY_CD)) {
      alert("정책코드를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: row,
        activeCell: G_GRDMASTER.view.getColumnIndex("POLICY_CD"),
        editMode: true
      });
      return false;
    }
    if ($NC.isNull(rowData.POLICY_NM)) {
      alert("정책명을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectRow: row,
        activeCell: G_GRDMASTER.view.getColumnIndex("POLICY_NM"),
        editMode: true
      });
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }

  // 정책의 중복체크
  if (rowData.CRUD == "C") {
    var rowMasterCount = G_GRDMASTER.data.getLength();
    for (var i = 0; i < rowMasterCount; i++) {
      var data = G_GRDMASTER.data.getItem(i);
      if (data.POLICY_GRP == rowData.POLICY_GRP && data.POLICY_CD == rowData.POLICY_CD) {
        if (i != row) {
          alert("정책코드 중복입니다. 확인 후 다시 입력하십시오.");
          $NC.setGridSelectRow(G_GRDMASTER, row);
          G_GRDMASTER.view.gotoCell(row, 0, true);
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * 정책(왼쪽그리드) 그리드의 행 클릭시 처리
 * 
 * @param e
 * @param args
 */
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

  // 조회시 디테일 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAIL);

  var rowData = G_GRDMASTER.data.getItem(row);
  if (rowData.CRUD == "C" || rowData.CRUD == "N") {
    onGetDetail({
      data: null
    });
  } else {
    G_GRDDETAIL.queryParams = $NC.getParams({
      P_POLICY_CD: rowData.POLICY_CD
    });

    // 디테일 조회
    $NC.serviceCall("/CS04010E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMaster", row + 1);

}
function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "POLICY_VAL",
    field: "POLICY_VAL",
    name: "정책값",
    minWidth: 60,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_VAL_NM",
    field: "POLICY_VAL_NM",
    name: "정책값명",
    minWidth: 200,
    editor: Slick.Editors.Text,
    editorOptions: {
      isKeyField: true
    }
  });
  $NC.setGridColumn(columns, {
    id: "RECOMMEND_YN",
    field: "RECOMMEND_YN",
    name: "권장여부",
    minWidth: 70,
    maxWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 170,
    editor: Slick.Editors.Text
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

/**
 * 정책상세(오른쪽 그리드)의 초기값 설정
 */
function grdDetailInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "CS04010E.RS_DETAIL",
    sortCol: "POLICY_VAL",
    gridOptions: options
  });

  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
  G_GRDDETAIL.view.onBeforeEditCell.subscribe(grdDetailOnBeforeEditCell);
  G_GRDDETAIL.view.onCellChange.subscribe(grdDetailOnCellChange);
  $("#grdDetail").find("div.grid-focus,div.grid-canvas").focus(function(e) {
    if (G_GRDDETAIL.focused) {
      return;
    }
    G_GRDMASTER.focused = false;
    G_GRDDETAIL.focused = true;

    // 디테일 데이터 Post 처리
    if (G_GRDMASTER.view.getEditorLock().isActive()) {
      // 서브 데이터 Post 처리
      G_GRDMASTER.view.getEditorLock().commitCurrentEdit();

      // 현재 선택된 로우 Validation 체크
      if (G_GRDMASTER.lastRow != null) {
        if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
          G_GRDMASTER.view.getCanvasNode.focus();
        }
      }
    }
  });
}

function grdDetailOnNewRecord(args) {

  G_GRDDETAIL.view.gotoCell(args.row, 0, true);
}

/**
 * 정책상세(오른쪽그리드)의 셀 값 변경전 처리
 * 
 * @param e
 * @param args
 * @returns {Boolean}
 */
function grdDetailOnBeforeEditCell(e, args) {

  // 수정할 수 없는 컬럼일 경우 수정 모드로 변경하지 않도록 처리
  var rowData = G_GRDDETAIL.data.getItem(args.row);
  if (rowData) {
    // 신규 데이터가 아니면 코드 수정 불가
    if (rowData.CRUD !== "N" && rowData.CRUD !== "C") {
      if (args.column.field === "POLICY_VAL") {
        return false;
      }
    }
  }
  return true;
}

/**
 * 정책상세(오른쪽그리드)의 셀 값 변경시 처리
 * 
 * @param e
 * @param args
 *          row: activeRow, cell: activeCell, item: item
 */
function grdDetailOnCellChange(e, args) {

  var rowData = args.item;

  if (rowData.CRUD === "R") {
    rowData.CRUD = "U";
  }
  G_GRDDETAIL.data.updateItem(rowData.id, rowData);

  // 마지막 선택 Row 수정 상태로 변경
  G_GRDDETAIL.lastRowModified = true;
}

/**
 * 정책상세(오른쪽그리드)의 입력체크 처리
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

  // 신규일 때 키 값이 없으면 신규 취소
  if (rowData.CRUD == "N") {
    if ($NC.isNull(rowData.POLICY_VAL)) {
      G_GRDDETAIL.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDDETAIL, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.POLICY_VAL)) {
      alert("적용값을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectRow: row,
        activeCell: G_GRDDETAIL.view.getColumnIndex("POLICY_VAL"),
        editMode: true
      });
      return false;
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDDETAIL.data.updateItem(rowData.id, rowData);
  }

  // 정책상세의 중복체크
  if (rowData.CRUD == "C") {
    var rowDetailCount = G_GRDDETAIL.data.getLength();
    for (var i = 0; i < rowDetailCount; i++) {
      var data = G_GRDDETAIL.data.getItem(i);
      if (data.POLICY_VAL == rowData.POLICY_VAL) {
        if (i != row) {
          alert("적용값 중복입니다. 확인 후 다시 입력하십시오.");
          $NC.setGridSelectRow(G_GRDDETAIL, row);
          G_GRDDETAIL.view.gotoCell(row, 0, true);
          return false;
        }
      }
    }
  }
  return true;
}

/**
 * 정책상세(오른쪽그리드)에 행 클릭 처리
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
 * 왼쪽그리드(정책)에 데이터 표시 처리
 */
function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "POLICY_CD",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
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

/**
 * 정책상세(오른쪽그리드)에 표시할 데이터를 취득해서 화면에 표시
 */
function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "POLICY_VAL",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }
  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);
  }
}

/**
 * 저장에 성공했을 경우의 처리
 * 
 * @param ajaxData
 */
function onSave(ajaxData) {

  var lastKeyVal1 = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "POLICY_CD"
  });
  var lastKeyVal2 = $NC.getGridLastKeyVal(G_GRDDETAIL, {
    selectKey: "POLICY_VAL"
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal1;
  G_GRDDETAIL.lastKeyVal = lastKeyVal2;
}

/**
 * 저장에 실패 했을 경우의 처리
 * 
 * @param ajaxData
 */
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
  }
}