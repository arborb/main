/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({

  // printOptions: [{
  // PRINT_INDEX: 0,
  // PRINT_COMMENT: "로케이션라벨 출력"
  // },
  // ]
  });
  

  // 그리드 초기화
  grdMasterInitialize();

  // 조회조건 - 물류센터 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CSUSERCENTER",
    P_QUERY_PARAMS: $NC.getParams({
      P_USER_ID: $NC.G_USERINFO.USER_ID,
      P_CENTER_CD: "%"
    })
  }, {
    selector: "#cboQCenter_Cd",
    codeField: "CENTER_CD",
    nameField: "CENTER_NM",
    onComplete: function() {
      $("#cboQCenter_Cd").val($NC.G_USERINFO.CENTER_CD);
    }
  });

  // 조회조건 - 존코드 세팅
  $NC.setInitCombo("/WC/getDataSet.do", {
    P_QUERY_ID: "WC.POP_CMZONE",
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: $NC.G_USERINFO.CENTER_CD,
      P_ZONE_CD: "%"
    })
  }, {
    selector: "#cboQZone_Cd",
    codeField: "ZONE_CD",
    nameField: "ZONE_NM",
    fullNameField: "ZONE_CD_F",
    addAll: true
  });
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {
  $NC.G_OFFSET.nonClientHeight = $("#divConditionView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
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
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  // 조회 조건에 Object Change

  var id = view.prop("id").substr(4).toUpperCase();

  if (id == "CENTER_CD") {
    // 존코드 세팅
    $NC.setInitCombo("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.POP_CMZONE",
      P_QUERY_PARAMS: $NC.getParams({
        P_CENTER_CD: val,
        P_ZONE_CD: "%"
      })
    }, {
      selector: "#cboQZone_Cd",
      codeField: "ZONE_CD",
      nameField: "ZONE_NM",
      fullNameField: "ZONE_CD_F",
      addAll: true
    });
  }

  onChangingCondition();
}

function onChangingCondition() {

  // 초기화
  $NC.clearGridData(G_GRDMASTER);

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "1";

  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var ZONE_CD = $NC.getValue("#cboQZone_Cd", true);

  var BANK_CD1 = $NC.getValue("#edtQBank_Cd1");
  if ($NC.isNull(BANK_CD1)) {
    BANK_CD1 = "0";
  } else {
    if (BANK_CD1.length < 2) {
      alert("행 첫번째 값을 정확히 입력하십시오.");
      $NC.setFocus("#edtQBank_Cd1");
      return;
    }
  }
  var BANK_CD2 = $NC.getValue("#edtQBank_Cd2");
  if ($NC.isNull(BANK_CD2)) {
    BANK_CD2 = "ZZZ";
  } else {
    if (BANK_CD2.length < 2) {
      alert("행 두번째 값을 정확히 입력하십시오.");
      $NC.setFocus("#edtQBank_Cd2");
      return;
    }
  }
  if (BANK_CD1 > BANK_CD2) {
    alert("행 첫번째 값이 두번째 값보다 클 수 없습니다.");
    $NC.setFocus("#edtQBank_Cd1");
    return;
  }

  var BAY_CD1 = $NC.getValue("#edtQBay_Cd1");
  if ($NC.isNull(BAY_CD1)) {
    BAY_CD1 = "0";
  } else {
    if (BAY_CD1.length < 2) {
      alert("열 첫번째 값을 정확히 입력하십시오.");
      $NC.setFocus("#edtQBay_Cd1");
      return;
    }
  }
  var BAY_CD2 = $NC.getValue("#edtQBay_Cd2");
  if ($NC.isNull(BAY_CD2)) {
    BAY_CD2 = "ZZZ";
  } else {
    if (BAY_CD2.length < 2) {
      alert("열 두번째 값을 정확히 입력하십시오.");
      $NC.setFocus("#edtQBay_Cd2");
      return;
    }
  }
  if (BAY_CD1 > BAY_CD2) {
    alert("열 첫번째 값이 두번째 값보다 클 수 없습니다.");
    $NC.setFocus("#edtQBay_Cd1");
    return;
  }

  var LEV_CD1 = $NC.getValue("#edtQLev_Cd1");
  if ($NC.isNull(LEV_CD1)) {
    LEV_CD1 = "0";
  } else {
    if (LEV_CD1.length < 2) {
      alert("단 첫번째 값을 정확히 입력하십시오.");
      $NC.setFocus("#edtQLev_Cd1");
      return;
    }
  }
  var LEV_CD2 = $NC.getValue("#edtQLev_Cd2");
  if ($NC.isNull(LEV_CD2)) {
    LEV_CD2 = "ZZZ";
  } else {
    if (LEV_CD2.length < 2) {
      alert("단 두번째 값을 정확히 입력하십시오.");
      $NC.setFocus("#edtQLev_Cd2");
      return;
    }
  }
  if (LEV_CD1 > LEV_CD2) {
    alert("단 첫번째 값이 두번째 값보다 클 수 없습니다.");
    $NC.setFocus("#edtQLev_Cd1");
    return;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 데이터 조회
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_ZONE_CD: ZONE_CD,
    P_BANK_CD1: BANK_CD1,
    P_BANK_CD2: BANK_CD2,
    P_BAY_CD1: BAY_CD1,
    P_BAY_CD2: BAY_CD2,
    P_LEV_CD1: LEV_CD1,
    P_LEV_CD2: LEV_CD2
  });
  $NC.serviceCall("/CM01040Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

  var center_Cd = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(center_Cd)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  if (G_GRDMASTER.view.getEditorLock().isActive()) {
    G_GRDMASTER.view.getEditorLock().commitCurrentEdit();
  }

  var checkedValueDS = [ ];
  var rowCount = G_GRDMASTER.data.getLength();
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTER.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      checkedValueDS.push(rowData.LOCATION_CD);
    }
  }
  if (checkedValueDS.length == 0) {
    alert("출력할 데이터를 선택하십시오.");
    return;
  }
  // 기본로케이션라벨 출력
  if (printIndex === 0) {
    var printOptions = {
      reportDoc: "common/LABEL_LOCATION",
      queryId: "WR.RS_LABEL_LOCATION01",
      queryParams: {
        P_CENTER_CD: center_Cd
      },
      checkedValue: checkedValueDS.toString()
    };
    $NC.G_MAIN.showPrintPreview(printOptions);
    // 슬라이딩랙 제목라벨 출력
  } else if (printIndex === 1) {
    var printOptions = {
      reportDoc: "common/LABEL_SLIDING",
      // reportDoc: "common/LABEL_LOCATION",
      queryId: "WR.RS_LABEL_LOCATION01",
      queryParams: {
        P_CENTER_CD: center_Cd
      },
      checkedValue: checkedValueDS.toString()

    };
    $NC.G_MAIN.showPrintPreview(printOptions);
    // 슬라이딩랙 출력
  } else if (printIndex === 2) {
    var printOptions = {
      reportDoc: "common/LABEL_ITEMLOC01",
      queryId: "WR.RS_LABEL_LOCATION_ITEM01",
      queryParams: {
        P_CENTER_CD: center_Cd
      },
      checkedValue: checkedValueDS.toString()

    };

    $NC.G_MAIN.showPrintPreview(printOptions);
    // 단프라라벨 출력
  } else if (printIndex === 3) {
    var printOptions = {
      reportDoc: "common/LABEL_LOC02",
      queryId: "WR.RS_LABEL_LOCATION01",
      queryParams: {
        P_CENTER_CD: center_Cd
      },
      checkedValue: checkedValueDS.toString()

    };
    $NC.G_MAIN.showPrintPreview(printOptions);
    // 평치존라벨 출력
  } else if (printIndex === 4) {
    var printOptions = {
      reportDoc: "common/LABEL_LOC03",
      queryId: "WR.RS_LABEL_LOCATION01",
      queryParams: {
        P_CENTER_CD: center_Cd
      },
      checkedValue: checkedValueDS.toString()

    };
    $NC.G_MAIN.showPrintPreview(printOptions);

  } else if (printIndex === 5) {
    var printOptions = {
      reportDoc: "common/LABEL_LOC04",
      queryId: "WR.RS_LABEL_PUTAWAY_LOCATION01",
      queryParams: {
        P_CENTER_CD: center_Cd
      },
      checkedValue: checkedValueDS.toString()

    };
    $NC.G_MAIN.showPrintPreview(printOptions);

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

  // 마지막 선택 Row 수정 상태로 변경
  // G_GRDMASTER.lastRowModified = true;
}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 40,
    maxWidth: 40,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  });
  $NC.setGridColumn(columns, {
    id: "ZONE_CD",
    field: "ZONE_CD",
    name: "존코드",
    minWidth: 90,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ZONE_NM",
    field: "ZONE_NM",
    name: "존명",
    minWidth: 160
  });
  $NC.setGridColumn(columns, {
    id: "BANK_CD",
    field: "BANK_CD",
    name: "행",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BAY_CD",
    field: "BAY_CD",
    name: "열",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LEV_CD",
    field: "LEV_CD",
    name: "단",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "LOCATION_CD",
    field: "LOCATION_CD",
    name: "로케이션",
    minWidth: 140,
    cssClass: "align-center"
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    editable: true,
    autoEdit: true,
    frozenColumn: 2
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CM01040Q.RS_MASTER",
    sortCol: "ZONE_CD",
    gridOptions: options
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onHeaderClick.subscribe(grdMasterOnHeaderClick);
  G_GRDMASTER.view.onClick.subscribe(grdMasterOnClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
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

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTER, "CHECK_YN");
  if (G_GRDMASTER.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDMASTER, 0);
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);
  }

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "1";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "1";

  $NC.G_VAR.printOptions = [ ];
  $NC.G_VAR.printOptions.push({
    PRINT_INDEX: 5,
    PRINT_COMMENT: "파레트/앵글랙라벨 출력"
  });
  $NC.G_VAR.printOptions.push({
    PRINT_INDEX: 4,
    PRINT_COMMENT: "평치존라벨 출력"
  });
  $NC.G_VAR.printOptions.push({
    PRINT_INDEX: 3,
    PRINT_COMMENT: "단프라라벨 출력"
  });
  $NC.G_VAR.printOptions.push({
    PRINT_INDEX: 2,
    PRINT_COMMENT: "슬라이딩랙 출력"
  });
  $NC.G_VAR.printOptions.push({
    PRINT_INDEX: 1,
    PRINT_COMMENT: "슬라이딩랙 제목라벨 출력"
  });
  $NC.G_VAR.printOptions.push({
    PRINT_INDEX: 0,
    PRINT_COMMENT: "로케이션라벨 출력"
  });

  $NC.setInitTopButtons($NC.G_VAR.buttons, $NC.G_VAR.printOptions);
}
