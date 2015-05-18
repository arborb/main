/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({ });

  // 그리드 초기화
  grdMasterInitialize();

  // 조회조건 - 물류센터 초기화
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
      $NC.setValue("#cboQCenter_Cd", $NC.G_USERINFO.CENTER_CD);
    }
  });

  $NC.setValue("#edtQBu_Cd", $NC.G_USERINFO.BU_CD);
  $NC.setValue("#edtQBu_Nm", $NC.G_USERINFO.BU_NM);
  $("#btnQBu_Cd").click(showUserBuPopup);
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

  $NC.resizeContainer("#divCenterView", clientWidth, clientHeight);

  // Grid 사이즈 조정
  $NC.resizeGrid("#grdMaster", clientWidth, clientHeight - $NC.G_LAYOUT.header);
}

/**
 * Condition Change Event - Input, Select Change 시 호출 됨
 */
function _OnConditionChange(e, view, val) {

  var id = view.prop("id").substr(4).toUpperCase();

  // 브랜드 Key 입력
  switch (id) {
  case "BU_CD":
    var P_QUERY_PARAMS;
    var O_RESULT_DATA = [ ];
    if (!$NC.isNull(val)) {
      P_QUERY_PARAMS = {
        P_USER_ID: $NC.G_USERINFO.USER_ID,
        P_BU_CD: val
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
  }

  onChangingCondition();
}

/**
 * 검색항목 값 변경시 화면 클리어
 */
function onChangingCondition() {
  // 초기화
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
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
  if ($NC.isNull(CENTER_CD)) {
    alert("물류센터를 선택하십시오.");
    $NC.setFocus("#cboQCenter_Cd");
    return;
  }

  var BU_CD = $NC.getValue("#edtQBu_Cd");
  if ($NC.isNull(BU_CD)) {
    alert("사업부를 먼저 입력하십시오.");
    $NC.setFocus("#edtQBu_Cd");
    return;
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_CENTER_CD: CENTER_CD,
    P_BU_CD: BU_CD
  });

  // 데이터 조회
  $NC.serviceCall("/CS04040Q/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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
 * @param printIndex:
 *          선택한 출력물 Index
 */
function _Print(printIndex, printName) {

}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "POLICY_GRP_F",
    field: "POLICY_GRP_F",
    name: "정책그룹",
    minWidth: 90,
    maxWidth: 90,
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_CD",
    field: "POLICY_CD",
    name: "정책코드",
    minWidth: 70,
    maxWidth: 70,
    cssClass: "align-center",
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_NM",
    field: "POLICY_NM",
    name: "정책명",
    minWidth: 180,
    width: 180,
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_DIV_F",
    field: "POLICY_DIV_F",
    name: "정책구분",
    minWidth: 100,
    maxWidth: 100,
    groupDisplay: true
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_VAL",
    field: "POLICY_VAL",
    name: "정책값",
    minWidth: 60,
    maxWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "POLICY_VAL_NM",
    field: "POLICY_VAL_NM",
    name: "정책값명",
    minWidth: 220,
    width: 220
  });
  $NC.setGridColumn(columns, {
    id: "RECOMMEND_YN",
    field: "RECOMMEND_YN",
    name: "권장여부",
    minWidth: 70,
    maxWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "SELECT_YN",
    field: "SELECT_YN",
    name: "선택여부",
    minWidth: 70,
    maxWidth: 70,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 380
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 3,
    specialRow: {
      compareKey: "SELECT_YN",
      compareVal: "Y",
      compareOperator: "==",
      cssClass: "specialrow4",
      // css 적용 컬럼, 시작 Index
      columns: 4
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CS04040Q.RS_MASTER",
    sortCol: "POLICY_CD",
    gridOptions: options,
    // 그룹핑했을때처럼 정렬처리
    onSortCompare: function(item1, item2) {
      var result = 0;
      var compareFn = function(field) {
        var x = item1[field], y = item2[field];
        return (x == y ? 0 : (x > y ? 1 : -1));
      };

      result = compareFn("POLICY_CD");
      if (G_GRDMASTER.view.getColumn(G_GRDMASTER.sortCol).groupDisplay == true) {
        if (G_GRDMASTER.sortCol == "POLICY_CD") {
          if (result == 0) {
            result = compareFn("POLICY_VAL");
          }
        } else {
          if (result == 0) {
            result = compareFn(G_GRDMASTER.sortCol);
            if (result == 0) {
              result = compareFn("POLICY_VAL") * G_GRDMASTER.sortDir;
            }
          } else {
            var x = item1[G_GRDMASTER.sortCol] + item1["POLICY_CD"], y = item2[G_GRDMASTER.sortCol]
                + item2["POLICY_CD"];
            result = (x == y ? 0 : (x > y ? 1 : -1));
            if (result == 0) {
              result = compareFn("POLICY_VAL") * G_GRDMASTER.sortDir;
            }
          }
        }
      } else {
        if (result == 0) {
          result = compareFn(G_GRDMASTER.sortCol);
          if (result == 0 && G_GRDMASTER.sortCol != "POLICY_VAL") {
            result = compareFn("POLICY_VAL") * G_GRDMASTER.sortDir;
          }
        } else {
          result = result * G_GRDMASTER.sortDir;
        }
      }
      return result;
    }
  });

  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
  G_GRDMASTER.view.onGetCellValue.subscribe(grdMasterOnGetCellValue);
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
 * OnGetCellValue, Cell 표시 값 리턴, 그리드에 값 표시하기전에 Event 발생
 * 
 * @param e
 * @param args
 *          row<br>
 *          cell<br>
 *          item<br>
 *          column<br>
 *          value<br>
 * @returns {String}<br>
 *          display value<br>
 *          null, undefined -> default value
 */
function grdMasterOnGetCellValue(e, args) {

  if (args.row > 0 && args.column.groupDisplay == true) {
    if (G_GRDMASTER.data.getItem(args.row - 1)["POLICY_CD"] == args.item["POLICY_CD"]) {
      return "";
    }
  }
  return null;
}

function onGetMaster(ajaxData) {
  $NC.setInitGridData(G_GRDMASTER, ajaxData);
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
  $NC.G_VAR.buttons._print = "0";

  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 검색조건의 사업부 검색 이미지 클릭
 */

function showUserBuPopup() {
  $NP.showUserBuPopup({
    P_USER_ID: $NC.G_USERINFO.USER_ID,
    P_BU_CD: "%"
  }, onUserBuPopup, function() {
    $NC.setFocus("#edtQBu_Cd", true);
  });
}

/**
 * 사업부 검색 결과 / 검색 실패 했을 경우(not found)
 */
function onUserBuPopup(resultInfo) {

  if (!$NC.isNull(resultInfo)) {
    $NC.setValue("#edtQBu_Cd", resultInfo.BU_CD);
    $NC.setValue("#edtQBu_Nm", resultInfo.BU_NM);
  } else {
    $NC.setValue("#edtQBu_Cd");
    $NC.setValue("#edtQBu_Nm");
    $NC.setFocus("#edtQBu_Cd", true);
  }
  onChangingCondition();
}
