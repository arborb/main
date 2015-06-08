/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();

  // 에디터 Disable
  $NC.setEnableGroup("#divMasterInfoView", false);

  // 버튼 이벤트 연결
  $("#btnEntryUserProgram").click(onEntryUserProgram);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.rightViewWidth = 400;
  $NC.G_OFFSET.nonClientHeight = $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.rightViewMinHeight = $("#divMasterInfoView").outerHeight(true) + $NC.G_LAYOUT.header
      + $NC.G_OFFSET.nonClientHeight + $NC.G_LAYOUT.margin2;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var scrollOffset = parent.height() < $NC.G_OFFSET.rightViewMinHeight ? $NC.G_LAYOUT.scroll.width : 0;
  var clientWidth = parent.width() - $NC.G_OFFSET.rightViewWidth - $NC.G_LAYOUT.nonClientWidth - scrollOffset;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  // Container 사이즈 조정
  $NC.resizeContainer("#divLeftView", clientWidth, clientHeight);
  $NC.resizeContainer("#divRightView", $NC.G_OFFSET.rightViewWidth + scrollOffset, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);

  // 컬럼 헤더 숨김으로 사이즈 재조정...
  $("#grdMaster .slick-viewport").css({
    "height": clientHeight - $NC.G_LAYOUT.header
  });
  $("#grdMaster .slick-pane-top").css({
    "height": clientHeight - $NC.G_LAYOUT.header
  });
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {

  var id = view.prop("id").substr(3).toUpperCase();
  grdMasterOnCellChange(e, {
    col: id,
    val: val
  });
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 데이터 조회
  $NC.serviceCall("/CS01020E/getProgramMenu.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  var rowCount = G_GRDMASTER.data.getLength();
  if (rowCount == 0) {
    alert("조회 후 등록하십시오.");
    return;
  }

  // 현재 선택된 로우 Validation 체크
  var rowData;
  if (G_GRDMASTER.lastRow != null) {
    rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
    if (rowData.CRUD == "N" && $NC.isNull(rowData.PROGRAM_ID)) {
      $NC.setFocus("#edtProgram_Id");
      return;
    } else {
      if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
        return;
      }
    }
  }

  // 현재 선택된 프로그램이 메뉴인지 체크
  var parentMenuData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (parentMenuData.PROGRAM_DIV !== "M") {
    alert("신규 등록할 메뉴의 상위 메뉴를 선택하십시오.");
    return;
  }
  // 메뉴가 닫혀 있으면 펼침
  if (parentMenuData._collapsed) {
    parentMenuData._collapsed = false;

    G_GRDMASTER.data.updateItem(parentMenuData.id, parentMenuData);
  }

  // 다음 메뉴 검색
  rowCount = G_GRDMASTER.data.getLength();
  var parentIndent = parseInt(parentMenuData.indent);
  var groupIndent = (parentIndent + 1) + "";
  var nextMenuData = null;
  var lastGroupMenuData = null;
  for (var i = G_GRDMASTER.lastRow + 1; i < rowCount; i++) {
    var nextRowData = G_GRDMASTER.data.getItem(i);
    if (nextRowData.indent == groupIndent) {
      lastGroupMenuData = nextRowData;
    }
    if (nextRowData.indent <= parentMenuData.indent) {
      nextMenuData = nextRowData;
      break;
    }
  }

  var program_Grp1 = "0";
  var program_Grp2 = "0";
  var program_Grp3 = "0";
  var program_Grp4 = "0";
  if ($NC.isNull(lastGroupMenuData)) {
    if (parentIndent == 0) {
      program_Grp1 = "1";
    } else if (parentIndent == 1) {
      program_Grp1 = parentMenuData.PROGRAM_GRP1;
      program_Grp2 = "1";
    } else if (parentIndent == 2) {
      program_Grp1 = parentMenuData.PROGRAM_GRP1;
      program_Grp2 = parentMenuData.PROGRAM_GRP2;
      program_Grp3 = "1";
    } else if (parentIndent == 3) {
      program_Grp1 = parentMenuData.PROGRAM_GRP1;
      program_Grp2 = parentMenuData.PROGRAM_GRP2;
      program_Grp3 = parentMenuData.PROGRAM_GRP3;
      program_Grp4 = "1";
    }
  } else {
    if (parentIndent == 0) {
      if (lastGroupMenuData.PROGRAM_GRP1 === "9") {
        program_Grp1 = "A";
      } else {
        program_Grp1 = String.fromCharCode(lastGroupMenuData.PROGRAM_GRP1.charCodeAt() + 1);
      }
    } else if (parentIndent == 1) {
      program_Grp1 = lastGroupMenuData.PROGRAM_GRP1;
      if (lastGroupMenuData.PROGRAM_GRP2 === "9") {
        program_Grp2 = "A";
      } else {
        program_Grp2 = String.fromCharCode(lastGroupMenuData.PROGRAM_GRP2.charCodeAt() + 1);
      }
    } else if (parentIndent == 2) {
      program_Grp1 = lastGroupMenuData.PROGRAM_GRP1;
      program_Grp2 = lastGroupMenuData.PROGRAM_GRP2;
      if (lastGroupMenuData.PROGRAM_GRP3 === "9") {
        program_Grp3 = "A";
      } else {
        program_Grp3 = String.fromCharCode(lastGroupMenuData.PROGRAM_GRP3.charCodeAt() + 1);
      }
    } else if (parentIndent == 3) {
      program_Grp1 = lastGroupMenuData.PROGRAM_GRP1;
      program_Grp2 = lastGroupMenuData.PROGRAM_GRP2;
      program_Grp3 = lastGroupMenuData.PROGRAM_GRP3;
      if (lastGroupMenuData.PROGRAM_GRP4 === "9") {
        program_Grp4 = "A";
      } else {
        program_Grp4 = String.fromCharCode(lastGroupMenuData.PROGRAM_GRP4.charCodeAt() + 1);
      }
    }
  }

  var indent = (parentIndent + 1).toString();
  var parent = parentMenuData.id;
  var rowId = $NC.getGridNewRowId();
  // 신규 데이터는 CRUD를 "N"으로 하고 데이터 입력 후 다른 Row로 이동하면 "C"로 변경
  var newRowData = {
    PROGRAM_ID: "",
    PACKAGE_ID: "",
    PROGRAM_NM: "",
    PROGRAM_GRP1: program_Grp1,
    PROGRAM_GRP2: program_Grp2,
    PROGRAM_GRP3: program_Grp3,
    PROGRAM_GRP4: program_Grp4,
    PROGRAM_DIV: "E",
    WIDE_YN: "N",
    WEB_URL: null,

    indent: indent,
    parent: parent,
    _collapsed: false,
    id: rowId,
    CRUD: "N"
  };
  // 현재 메뉴 다음에
  if ($NC.isNull(nextMenuData)) {
    G_GRDMASTER.data.addItem(newRowData);
  } else {
    var nextMenuIndex = G_GRDMASTER.data.getIdxById(nextMenuData.id);
    G_GRDMASTER.data.insertItem(nextMenuIndex, newRowData);
  }

  $NC.setGridSelectRow(G_GRDMASTER, {
    selectKey: "id",
    selectVal: rowId,
    activeCell: 0
  });

  // 수정 상태로 변경
  G_GRDMASTER.lastRowModified = true;

  // 이전 데이터가 한건도 없었으면 에디터 Enable
  // if (rowCount == 0) {
  // $NC.setEnableGroup("#divMasterInfoView", true);
  // }

  var rowIndex = G_GRDMASTER.view.getSelectedRows()[0];

  // 신규 데이터 생성 후 이벤트 호출
  grdMasterOnNewRecord({
    row: rowIndex,
    rowData: newRowData
  });
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }
  // 현재 선택된 로우 Validation 체크
  if (G_GRDMASTER.lastRow != null) {
    if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
      return;
    }
  }
  var saveDS = [ ];
  var rows = G_GRDMASTER.data.getItems();
  var rowCount = rows.length;
  for (var row = 0; row < rowCount; row++) {
    var rowData = rows[row];
    if (rowData.CRUD !== "R") {
      var MENU_LEVEL = rowData.PROGRAM_GRP1 == "0" ? 0 : 1 + rowData.PROGRAM_GRP2 == "0" ? 0
          : 1 + rowData.PROGRAM_GRP3 == "0" ? 0 : 1 + rowData.PROGRAM_GRP4 == "0" ? 0 : 1;
      var saveData = {
        P_PROGRAM_ID: rowData.PROGRAM_ID,
        P_PACKAGE_ID: rowData.PACKAGE_ID,
        P_PROGRAM_NM: rowData.PROGRAM_NM,
        P_PROGRAM_GRP1: rowData.PROGRAM_GRP1,
        P_PROGRAM_GRP2: rowData.PROGRAM_GRP2,
        P_PROGRAM_GRP3: rowData.PROGRAM_GRP3,
        P_PROGRAM_GRP4: rowData.PROGRAM_GRP4,
        P_PROGRAM_DIV: rowData.PROGRAM_DIV,
        P_WIDE_YN: rowData.WIDE_YN,
        P_WEB_URL: rowData.WEB_URL,
        P_MENU_LEVEL: MENU_LEVEL,
        P_CRUD: rowData.CRUD
      };
      saveDS.push(saveData);
    }
  }
  if (saveDS.length > 0) {
    $NC.serviceCall("/CS01020E/saveProgram.do", {
      P_DS_MASTER: $NC.getParams(saveDS),
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onSave, onSaveError);
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("삭제할 데이터가 없습니다.");
    return;
  }
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (rowData.PROGRAM_ID === "MENU") {
    alert("프로그램 메뉴입니다.\n\n삭제할 프로그램을 선택하십시오.");
    return;
  }

  var result = confirm("삭제 하시겠습니까?");
  if (result) {
    // 신규 데이터일 경우 그냥 삭제
    if (rowData.CRUD === "C" || rowData.CRUD === "N") {
      // 마지막 선택 Row 수정 상태 복원
      G_GRDMASTER.lastRowModified = false;

      G_GRDMASTER.data.deleteItem(rowData.id);
      // 데이터가 있을 경우 삭제 Row 이전 데이터 선택
      if (G_GRDMASTER.lastRow > 1) {
        $NC.setGridSelectRow(G_GRDMASTER, G_GRDMASTER.lastRow - 1);
      } else {
        if (G_GRDMASTER.data.getLength() === 0) {
          $NC.setEnableGroup("#divMasterInfoView", false);
          setInputValue("#grdMaster");
          $NC.setGridDisplayRows("#grdMaster", 0, 0);
        } else {
          $NC.setGridSelectRow(G_GRDMASTER, 0);
        }
      }
    } else {
      rowData.CRUD = "D";
      G_GRDMASTER.data.updateItem(rowData.id, rowData);
      _Save();
    }
  }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "PROGRAM_ID",
    isCancel: true
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 * 
 * @param printIndex
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

}

function onEntryUserProgram() {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (rowData.PROGRAM_ID === "MENU") {
    alert("프로그램 메뉴는 사용자 등록할 수 없습니다.");
    return;
  }
  if (rowData.CRUD === "N" || rowData.CRUD === "C") {
    alert("신규 프로그램입니다.\n\n저장 후 프로그램 사용자 등록 처리하십시오.");
    return;
  }

  $NC.G_MAIN.showProgramSubPopup({
    PROGRAM_ID: "CS01021P",
    PROGRAM_NM: "프로그램 사용자 등록",
    url: "cs/CS01021P.html",
    width: 950,
    height: 600,
    userData: {
      P_PROGRAM_ID: rowData.PROGRAM_ID,
      P_PACKAGE_ID: rowData.PACKAGE_ID,
      P_PROGRAM_NM: rowData.PROGRAM_NM,
      P_PROGRAM_GRP1: rowData.PROGRAM_GRP1,
      P_PROGRAM_GRP2: rowData.PROGRAM_GRP2,
      P_PROGRAM_GRP3: rowData.PROGRAM_GRP3,
      P_PROGRAM_GRP4: rowData.PROGRAM_GRP4,
      P_PROGRAM_DIV: rowData.PROGRAM_DIV,
      P_WIDE_YN: rowData.WIDE_YN,
      P_WEB_URL: rowData.WEB_URL
    }
  });
}

function setInputValue(grdSelector, rowData) {

  if (grdSelector === "#grdMaster") {

    if ($NC.isNull(rowData)) {
      // 초기화시 기본값 지정
      rowData = {
        CRUD: "R"
      };
    } else {
      if (rowData["PROGRAM_ID"] === "MENU") {
        $NC.setEnableGroup("#divMasterInfoView", false);
        rowData = {
          CRUD: "R"
        };
      } else {
        $NC.setEnableGroup("#divMasterInfoView", true);
      }
    }

    // Row 데이터로 에디터 세팅
    $NC.setValue("#edtProgram_Id", rowData["PROGRAM_ID"]);
    $NC.setValue("#edtProgram_Nm", rowData["PROGRAM_NM"]);
    $NC.setValue("#edtWeb_Url", rowData["WEB_URL"]);
    $NC.setValue("#rgbProgram_Div_M", rowData["PROGRAM_DIV"] === "M");
    $NC.setValue("#rgbProgram_Div_E", rowData["PROGRAM_DIV"] === "E");
    $NC.setValue("#rgbProgram_Div_Q", rowData["PROGRAM_DIV"] === "Q");
    $NC.setValue("#rgbProgram_Div_R", rowData["PROGRAM_DIV"] === "R");
    $NC.setValue("#rgbWide_Yn_Y", rowData["WIDE_YN"] === "Y");
    $NC.setValue("#rgbWide_Yn_N", rowData["WIDE_YN"] === "N");
    $NC.setValue("#edtProgram_Grp1", rowData["PROGRAM_GRP1"]);
    $NC.setValue("#edtProgram_Grp2", rowData["PROGRAM_GRP2"]);
    $NC.setValue("#edtProgram_Grp3", rowData["PROGRAM_GRP3"]);
    $NC.setValue("#edtProgram_Grp4", rowData["PROGRAM_GRP4"]);

    // 신규 데이터면 프로그램ID 수정할 수 있게 함
    if (rowData["CRUD"] == "C" || rowData["CRUD"] == "N") {
      $NC.setEnable("#edtProgram_Id", true);
    } else {
      $NC.setEnable("#edtProgram_Id", false);
    }

    var permission = $NC.getProgramPermission();
    $NC.setEnable("#btnEntryUserProgram", permission.canSave);
  }
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
    if ($NC.isNull(rowData.PROGRAM_ID)) {
      G_GRDMASTER.data.deleteItem(rowData.id);
      if (row > 0) {
        $NC.setGridSelectRow(G_GRDMASTER, row - 1);
      }
      return true;
    }
  }

  if (rowData.CRUD != "R") {
    if ($NC.isNull(rowData.PROGRAM_ID)) {
      alert("프로그램ID를 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      $NC.setFocus("#edtProgram_Id");
      return false;
    }
    if ($NC.isNull(rowData.PROGRAM_NM)) {
      alert("프로그램명을 입력하십시오.");
      $NC.setGridSelectRow(G_GRDMASTER, row);
      $NC.setFocus("#edtProgram_Nm");
      return false;
    }
    if (rowData.PROGRAM_DIV !== "M") {
      if ($NC.isNull(rowData.WEB_URL)) {
        alert("WEB URL을 입력하십시오.");
        $NC.setGridSelectRow(G_GRDMASTER, row);
        $NC.setFocus("#edtWeb_Url");
        return false;
      }
    } else {
      if (!$NC.isNull(rowData.WEB_URL)) {
        rowData.WEB_URL = "";
        rowData.WIDE_YN = "N";
        G_GRDMASTER.data.updateItem(rowData.id, rowData);
      }
    }
  }

  if (rowData.CRUD == "N") {
    rowData.CRUD = "C";
    G_GRDMASTER.data.updateItem(rowData.id, rowData);
  }
  return true;
}

/**
 * grdMaster 데이터 필터링 이벤트
 */
function grdMasterOnFilter(item) {
  if (!$NC.isNull(item.parent)) {
    var rows = G_GRDMASTER.data.getItems();
    var parent = rows[G_GRDMASTER.data.getIdxById(item.parent)];
    while (!$NC.isNull(parent)) {
      if (parent._collapsed) {
        return false;
      }
      parent = rows[G_GRDMASTER.data.getIdxById(parent.parent)];
    }
  }
  return true;
}

function grdMasterOnGetColumns() {

  var groupFormatter = function(row, cell, value, columnDef, dataContext) {
    var spacer = "<span style='display:inline-block;height:1px;width:" + (15 * dataContext["indent"]) + "px'></span>";
    if (dataContext.PROGRAM_DIV === "M") {
      if (dataContext._collapsed) {
        return spacer + " <span class='slick-group-toggle collapsed' style='cursor: pointer;'></span>&nbsp;" + value;
      } else {
        return spacer + " <span class='slick-group-toggle expanded' style='cursor: pointer;'></span>&nbsp;" + value;
      }
    } else {
      return spacer + " <span class='slick-group-toggle" + " ui-icon-" + dataContext.PROGRAM_DIV.toLowerCase()
          + "'></span>&nbsp;" + value;
    }
  };

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "PROGRAM_NM",
    field: "PROGRAM_NM",
    name: "프로그램명",
    width: 200,
    formatter: groupFormatter
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CS01020E.RS_MASTER",
    sortCol: "PROGRAM_NM"
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);

  // Grid 클릭 이벤트
  G_GRDMASTER.view.onClick.subscribe(function(e, args) {
    var rowData = G_GRDMASTER.data.getItem(args.row);
    if (rowData) {
      if ($(e.target).hasClass("slick-group-toggle")) {

        // 현재 선택된 로우 Validation 체크
        if (G_GRDMASTER.lastRow != null) {
          if (!grdMasterOnBeforePost(G_GRDMASTER.lastRow)) {
            e.stopImmediatePropagation();
            return;
          }
        }

        // 메뉴
        if (rowData.PROGRAM_DIV === "M") {
          if (!rowData._collapsed) {
            rowData._collapsed = true;
          } else {
            rowData._collapsed = false;
          }

          G_GRDMASTER.data.updateItem(rowData.id, rowData);

          $NC.setGridSelectRow(G_GRDMASTER, args.row);

          e.stopImmediatePropagation();
          return;
        }
      }
    }
  });

  // Grid 더블클릭 이벤트
  G_GRDMASTER.view.onDblClick.subscribe(function(e, args) {
    var rowData = G_GRDMASTER.data.getItem(args.row);
    if (rowData) {
      if ($(e.target).hasClass("slick-cell")) {
        // 메뉴
        if (rowData.PROGRAM_DIV === "M") {
          if (!rowData._collapsed) {
            rowData._collapsed = true;
          } else {
            rowData._collapsed = false;
          }

          G_GRDMASTER.data.updateItem(rowData.id, rowData);

          e.stopImmediatePropagation();
          return;
        }
      }
    }
  });

  // Grid 컬럼 헤더 숨김
  $NC.hideGridColumnHeader("#grdMaster");
  // Grid 가로 스크롤바 숨김
  $NC.hideGridHorzScroller("#grdMaster");
}

function grdMasterOnNewRecord(args) {

  $NC.setFocus("#edtProgram_Id");
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

  // 에디터 값 세팅
  setInputValue("#grdMaster", G_GRDMASTER.data.getItem(row));

  // 상단 현재로우/총건수 업데이트
  G_GRDMASTER.lastRow = row;
  G_GRDMASTER.lastRowModified = false;
}

function grdMasterOnCellChange(e, args) {

  if (G_GRDMASTER.lastRow == null || G_GRDMASTER.data.getLength() === 0) {
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);
  if (rowData) {

    switch (args.col) {
    case "PROGRAM_ID":
      rowData.PROGRAM_ID = args.val;
      break;
    case "PROGRAM_NM":
      rowData.PROGRAM_NM = args.val;
      break;
    case "WEB_URL":
      rowData.WEB_URL = args.val;
      break;
    case "PROGRAM_DIV_M":
    case "PROGRAM_DIV_E":
    case "PROGRAM_DIV_Q":
    case "PROGRAM_DIV_R":
      rowData.PROGRAM_DIV = args.val;
      break;
    case "WIDE_YN_Y":
    case "WIDE_YN_N":
      rowData.WIDE_YN = args.val;
      break;
    }

    if (rowData.CRUD === "R") {
      rowData.CRUD = "U";
    }
    G_GRDMASTER.data.updateItem(rowData.id, rowData);

    // 마지막 선택 Row 수정 상태로 변경
    G_GRDMASTER.lastRowModified = true;
  }
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData, grdMasterOnFilter);

  if (G_GRDMASTER.data.getLength() > 0) {

    var rowData = G_GRDMASTER.data.getItem(0);
    if (rowData) {
      // 프로그램 메뉴 펼침
      if (rowData.PROGRAM_ID === "MENU") {
        rowData._collapsed = false;

        G_GRDMASTER.data.updateItem(rowData.id, rowData);
      }
    }
    $NC.setEnableGroup("#divMasterInfoView", true);
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "PROGRAM_ID",
        selectVal: G_GRDMASTER.lastKeyVal,
        activeCell: true
      });
    }
  } else {
    $NC.setEnableGroup("#divMasterInfoView", false);
    setInputValue("#grdMaster");
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

function onSave(ajaxData) {

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTER, {
    selectKey: "PROGRAM_ID"
  });
  _Inquiry();
  G_GRDMASTER.lastKeyVal = lastKeyVal;
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
