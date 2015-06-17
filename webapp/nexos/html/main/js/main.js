/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  /**
   * 단위화면에서 사용될 일반 전역 변수 정의
   */
  $NC.setGlobalVar({
    // 실행 단위 화면 목록
    windows: [ ],
    // 최종 실행 화면, 단위화면, 단위화면 팝업, 공통코드검색 팝업, 출력미리보기 팝업
    lastWindow: null,
    // 현재 활성화된 단위 화면
    activeWindow: null,
    // 현재 활성화된 단위 화면 팝업
    activeSubWindow: null,
    // 현재 활성화된 공통코드검색, 출력미리보기 팝업
    activePopupWindow: null,
    // 실행 단위 화면 리사이즈 처리 Timeout Event
    onResizeTimeout: null,
    onProgramListTimeout: null,

    onProgramBookMarkTimeout: null,
    onPrintListTimeout: null,
    // 오류 메시지 전체 표시 여부
    isFullErrorMessage: false,
    // 데이터 검색 및 복사 관련 정보
    G_COPYINFO: {
      targetGrid: "",
      columnField: "",
      columnName: "",
      rowCount: 0,
      lastSearchVal: "",
      lastSearchIndex: -1,
      onCopyDataTimeout: null
    }
  });

  // 버튼 이벤트 바인딩
  buttonsInitalize();

  // 그리드 초기화
  grdProgramMenuInitialize();
  grdProgramListInitialize();
  grdPrintListInitialize();
  grdProgramBookMarkInitialize();

  programListOverlayInitialize();
  printListOverlayInitialize();
  copyGridDataOverlayInitialize();
  ProgramBookMarkOverlayInitialize();

  // 로그인 팝업
  loginPopupInitialize();
  //showLoginPopup(0);

  showMenu(false);
  loadSessionUserInfo();
  setTimeout(function(){
    hashLoad();
  }, 500)
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.minWidth = 1100;
  $NC.G_OFFSET.minHeight = 600;
  $NC.G_OFFSET.defaultMenuWidth = 200;
  $NC.G_OFFSET.currentMenuWidth = 200;
  $NC.G_OFFSET.nonClientHeight = $("#divTopMenuBar").outerHeight() + $("#divTopLine").outerHeight()
      + $("#divBottomLine").outerHeight();
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent, syncResize) {

  // 윈도우 사이즈
  var viewportWidth = parent.width();
  var viewporHeight = parent.height();
  var viewport = $("#divViewport");
  $NC.resizeContainer(viewport, viewportWidth, viewporHeight);

  var offsetX = 0, offsetY = 0;
  if (viewportWidth < $NC.G_OFFSET.minWidth) {
    viewport.css("overflow-x", "scroll");
    offsetY = $NC.G_LAYOUT.scroll.height;
  } else {
    viewport.css("overflow-x", "hidden");
  }
  if (viewporHeight < $NC.G_OFFSET.minHeight) {
    viewport.css("overflow-y", "scroll");
    offsetX = $NC.G_LAYOUT.scroll.width;
  } else {
    viewport.css("overflow-y", "hidden");
  }

  var clientWidth = Math.max(viewportWidth, $NC.G_OFFSET.minWidth) - offsetX;
  var clientHeight = Math.max(viewporHeight, $NC.G_OFFSET.minHeight) - offsetY;
  $NC.resizeContainer("#divMainView", clientWidth, clientHeight);

  $NC.resizeContainer("#divClientView", clientWidth, clientHeight - $NC.G_OFFSET.nonClientHeight);

  if (clientWidth < $NC.G_CHILDLAYOUT.minWidth) {
    clientWidth = $NC.G_CHILDLAYOUT.minWidth;
  }
  if (clientHeight < $NC.G_CHILDLAYOUT.minHeight) {
    clientHeight = $NC.G_CHILDLAYOUT.minHeight;
  }

  // 단위 화면 사이즈
  $NC.G_CHILDLAYOUT.width = clientWidth - $NC.G_OFFSET.currentMenuWidth;
  $NC.G_CHILDLAYOUT.height = clientHeight - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMenuView", $NC.G_OFFSET.currentMenuWidth, $NC.G_CHILDLAYOUT.height - $NC.G_LAYOUT.border1);

  var gridHeight = $NC.G_CHILDLAYOUT.height - ($NC.G_LAYOUT.header + $NC.G_LAYOUT.border2 + 1);
  // 메뉴 Grid 높이 조정
  $NC.resizeGrid("#grdProgramMenu", $NC.G_OFFSET.defaultMenuWidth, gridHeight);

  // 컬럼 헤더 숨김으로 사이즈 재조정...
  $("#grdProgramMenu .slick-viewport").css({
    "height": gridHeight
  });
  $("#grdProgramMenu .slick-pane-top").css({
    "height": gridHeight
  });

  var rightWidth = 0;
  if ($NC.G_OFFSET.currentMenuWidth == 0) {
    rightWidth = $NC.G_CHILDLAYOUT.width;
  } else {
    rightWidth = $NC.G_CHILDLAYOUT.width - $NC.G_LAYOUT.border1;
  }

  // 단위 화면 영역 사이즈 조정
  $NC.resizeContainer("#divProgramView", rightWidth, $NC.G_CHILDLAYOUT.height);

  // 로그인 팝업 표시 중이면 위치 조정
  if ($NC.isDialogOpen($("#divLoginView"))) {
    var divLoginView = $("#divLoginView");
    var viewLeft = (clientWidth - divLoginView.width()) / 2;
    var viewTop = (clientHeight - divLoginView.height()) / 2;
    divLoginView.dialog("option", "position", [viewLeft, viewTop]);
  }

  clearTimeout($NC.G_VAR.onResizeTimeout);
  if (syncResize) {
    resizeChildWindows();
  } else {
    $NC.G_VAR.onResizeTimeout = setTimeout(resizeChildWindows, 100);
  }
}

/**
 * Input KeyUp Event - Input, Select Keyup 시 호출 됨
 */
function _OnInputKeyUp(e, view) {
  if (e.which !== 13) {
    return;
  }
  if (view[0].id === "edtUser_Pwd") {
    $("#btnLogin").click();
  }
}

function buttonsInitalize() {
  $("#btnTopInquiry").click(_Inquiry).prop("title", "조건에 맞는 데이터셋을 조회");
  $("#btnTopNew").click(_New).prop("title", "데이터셋의 새로운 레코드 생성");
  $("#btnTopSave").click(_Save).prop("title", "데이터셋의 변경된 내역을 저장");
  $("#btnTopCancel").click(_Cancel).prop("title", "데이터셋의 변경 사항을 취소");
  $("#btnTopDelete").click(_Delete).prop("title", "데이터셋의 현재 레코드 삭제");
  $("#btnTopMenu").click(function(e) {
    if ($("#btnPinMenu").is(".ui-clr-selected")) {
      alert("메뉴 항상 보이기로 설정되어 있습니다.");
      return;
    }
    toggleMenu();
  }).prop("title", "메뉴 보임/숨김 토글");

  $("#btnTopPrintList").prop("title", "활성화된 화면에서 출력할 수 있는 출력물 목록");
  $("#btnProgramList").prop("title", "실행된 단위화면 목록");

  $("#btnTopUserName").click(onBtnChangeUserPassword);
  $("#btnProgramBookMark").prop("title", "실행된 단위화면 목록");

  $("#btnTopClose").click(onBtnClose).prop("title", "활성화된 화면 종료\n[Ctrl+클릭]실행된 화면 전체 종료");
  $("#btnTopLogout").click(onBtnLogout).prop("title", "로그인한 사용자 로그아웃");
  $("#btnReloadMenu").click(loadUserProgramMenu).prop("title", "메뉴 새로고침");
  $("#btnPinMenu").click(function(e) {
    $("#btnPinMenu").toggleClass("ui-clr-selected");
    $NC.setLocalStorage("_PIN_MENU", $("#btnPinMenu").is(".ui-clr-selected") ? "Y" : "N");
  }).prop("title", "메뉴 항상 보이기");
  $("#btnCloseMenu").click(function() {
    if ($("#btnPinMenu").is(".ui-clr-selected")) {
      alert("메뉴 항상 보이기로 설정되어 있습니다.");
      return;
    }
    showMenu(false);
  }).prop("title", "메뉴 닫기");
  $("#btnLogin").click(onBtnLogin);

  $("#divTopLogo").click(
      function(e) {
        if (e.ctrlKey == true || e.metaKey == true) {
          if (e.altKey == false) {
            if (e.shiftKey == true) {
              reloadSqlMap(e);
            } else {
              window.location.reload(true);
            }
          } else if (e.shiftKey == false) {
            var result = prompt("암호화할 값을 입력하십시오.\n\n  -> sample1;sample2;sample3");
            if (result) {
              var resultArray = result.split(";");
              var requestParams = {};
              for ( var i = 0, count = resultArray.length; i < count; i++) {
                requestParams["P_ENCRYPT_" + (i + 1)] = resultArray[i];
              }
              $NC.serviceCall("/WC/getEncryptString.do", {
                P_ENCRYPT_PARAMS: $NC.getParams(requestParams),
                P_USER_ID: $NC.G_USERINFO.USER_ID
              }, function(ajaxData) {
                var resultData = $NC.toArray(ajaxData);
                var resultHtml = "";
                var rowCount = 0;
                for ( var paramName in requestParams) {
                  resultHtml += "<div class='ui-ctnr-row'><div class='ui-lbl-normal'>" + requestParams[paramName]
                      + "</div><input type=text class='ui-edt-normal' readonly value='" + resultData[paramName]
                      + "' style='width: 330px;' /></div>";
                  rowCount += 1;
                }
                showMessage({
                  title: "암호화 결과",
                  message: resultHtml,
                  width: 450,
                  height: 130 + (rowCount * 22)
                });
              });
            }
          }
        } else {
          if (e.altKey == true && e.shiftKey == true) {
            var result = prompt("CMD, Parameter를 입력하십시오.\n\n  -> COMMAND|PARAM1;PARAM2");
            if (result) {
              var resultArray = result.split("|");
              if (resultArray.length < 1) {
                return;
              }

              var requestParams = {};
              requestParams["P_CMD"] = resultArray[0];
              requestParams["P_PARAMS"] = resultArray[1];

              $NC.serviceCall("/WC/callFn.do", {
                P_CMD_PARAMS: $NC.getParams(requestParams)
              }, function(ajaxData) {
                var resultData = $NC.toArray(ajaxData);
                var resultHtml = "<textarea class='ui-edt-normal' readonly='readonly' id='edtMessage' "
                    + "style='resize: none; width: 434px; height: 100px;'></textarea>";
                showMessage({
                  title: "호출 결과",
                  message: resultHtml,
                  width: 450,
                  height: 200,
                  onDialogOpen: function() {
                    $NC.setValue("#edtMessage", resultData.O_RESULT_DATA);
                  }
                });
              });
            }
          }
        }
      });
  $("#divMainView").focus(function(e) {
    setFocusActiveWindow();
  });
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {
  if ($NC.G_VAR.activeWindow == null) {
    return;
  }

  var viewWindow = getChildContentWindow($NC.G_VAR.activeWindow);
  if ($.isFunction(viewWindow._Inquiry)) {
    viewWindow._Inquiry();
  }
}

/**
 * New Button Event - 메인 상단 신규 버튼 클릭시 호출 됨
 */
function _New() {

  var activeWindow = $NC.G_VAR.activeWindow;
  if ($NC.isNull(activeWindow)) {
    return;
  }

  var exe_Level = activeWindow.get("userData").EXE_LEVEL1;
  if (exe_Level == "N") {
    alert("해당 프로그램의 신규권한이 없습니다.");
    return;
  }

  var viewWindow = getChildContentWindow(activeWindow);
  if ($.isFunction(viewWindow._New)) {
    viewWindow._New();
  }
}

/**
 * Save Button Event - 메인 상단 저장 버튼 클릭시 호출 됨
 */
function _Save() {
  var activeWindow = $NC.G_VAR.activeWindow;
  if ($NC.isNull(activeWindow)) {
    return;
  }

  var exe_Level = activeWindow.get("userData").EXE_LEVEL1;
  if (exe_Level == "N") {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  var viewWindow = getChildContentWindow(activeWindow);
  if ($.isFunction(viewWindow._Save)) {
    viewWindow._Save();
  }
}

/**
 * Delete Button Event - 메인 상단 삭제 버튼 클릭시 호출 됨
 */
function _Delete() {
  var activeWindow = $NC.G_VAR.activeWindow;
  if ($NC.isNull(activeWindow)) {
    return;
  }

  var exe_Level = activeWindow.get("userData").EXE_LEVEL2;
  if (exe_Level == "N") {
    alert("해당 프로그램의 삭제권한이 없습니다.");
    return;
  }

  var viewWindow = getChildContentWindow(activeWindow);
  if ($.isFunction(viewWindow._Delete)) {
    viewWindow._Delete();
  }
}

/**
 * Cancel Button Event - 메인 상단 취소 버튼 클릭시 호출 됨
 */
function _Cancel() {
  var activeWindow = $NC.G_VAR.activeWindow;
  if ($NC.isNull(activeWindow)) {
    return;
  }

  var exe_Level = activeWindow.get("userData").EXE_LEVEL1;
  if (exe_Level == "N") {
    alert("해당 프로그램의 취소권한이 없습니다.");
    return;
  }

  var viewWindow = getChildContentWindow(activeWindow);
  if ($.isFunction(viewWindow._Cancel)) {
    viewWindow._Cancel();
  }
}

/**
 * Print Button Event - 메인 상단 출력 버튼 클릭시 호출 됨
 */
function _Print() {
  var activeWindow = $NC.G_VAR.activeWindow;
  if ($NC.isNull(activeWindow)) {
    return;
  }

  var viewWindow = getChildContentWindow(activeWindow);
  if ($.isFunction(viewWindow._Print)) {
    var rowData = G_GRDPRINTLIST.data.getItem(G_GRDPRINTLIST.lastRow);
    if (!rowData) {
      return;
    }

    setTimeout(function() {
      viewWindow._Print(rowData.PRINT_INDEX, rowData.PRINT_COMMENT);
    }, 200);
  }
}

/**
 * 종료 버튼 클릭 이벤트
 */
function onBtnClose(e) {
  var activeWindow = $NC.G_VAR.activeWindow;
  if ($NC.isNull(activeWindow)) {
    return;
  }

  if (e.ctrlKey === true || e.metaKey === true) {
    removeAllChildWindow();
  } else {
    removeChildWindow(activeWindow);
  }
}

/**
 * 로그인 버튼 클릭 이벤트
 */
function onBtnLogin() {

  var user_Id = $NC.getValue("#edtUser_Id");
  var user_Pwd = $NC.getValue("#edtUser_Pwd");

  if ($NC.isNull(user_Id)) {
    alert("사용자ID를 입력하십시오.");
    $NC.setFocus("#edtUser_Id");
    return;
  }

  if ($NC.isNull(user_Pwd)) {
    alert("비밀번호를 입력하십시오.");
    $NC.setFocus("#edtUser_Pwd");
    return;
  }

  if (!$NC.isNull($NC.G_USERINFO)) {
    if (user_Id !== $NC.G_USERINFO.USER_ID) {
      if ($NC.G_VAR.windows.length > 0) {
        var result = confirm("기존에 로그인했던 사용자가 아닙니다.\n로그인시 실행중인 프로그램이 모두 종료됩니다.\n\n입력한 사용자로 로그인하시겠습니까?");
        if (result) {
          removeAllChildWindow();
        }
      }
    }
  }

  $NC.serviceCall("/WC/getLogin.do", {
    P_USER_ID: user_Id,
    P_USER_PWD: user_Pwd
  }, onGetLogin, onGetLoginError);
}

/**
 * 로그아웃 버튼 클릭 이벤트
 */
function onBtnLogout() {
  var result = confirm("로그아웃 하시겠습니까?");
  if (result) {
    $NC.serviceCall("/WC/getLogout.do", {
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onGetLogout);
  }
}

/**
 * 사용자 비밀번호 변경 팝업 호출
 */
function onBtnChangeUserPassword(e) {

  if ($NC.isNull($NC.G_USERINFO)) {
    return;
  }

  if (e.ctrlKey && e.shiftKey || e.metaKey && e.shiftKey) {

    $NC.serviceCall("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.GET_CSMSG",
      P_QUERY_PARAMS: $NC.getParams({
        P_SYS_LANG: $NC.G_USERINFO.SYS_LANG
      })
    }, function(ajaxData) {
      onGetMsg(ajaxData);
    });

  } else {

    showProgramSubPopup({
      PROGRAM_ID: "CS01030P",
      PROGRAM_NM: "사용자 비밀번호 변경",
      url: "cs/CS01030P.html",
      width: 320,
      height: 210,
      onOk: function() {

        $NC.serviceCall("/WC/getLogout.do", {
          P_USER_ID: $NC.G_USERINFO.USER_ID
        }, onGetLogout);
      }
    });
  }
}

/**
 * SQLMAP RELOAD
 * 
 * @param e
 */
function reloadSqlMap(e) {

  alert("SQLMAP를 다시 로드합니다.");
  $NC.serviceCall("/WC/reloadSqlMap.do", null, function(ajaxData) {
    alert("정상 처리되었습니다.");
  });
}

/**
 * 사용자 정보 Load
 */
function loadSessionUserInfo() {

  // 데이터 조회
  $("#divLoginView").removeData("loginType");
  $NC.serviceCallAndWait("/WC/getSessionUserInfo.do", null, onGetLogin, function(a, b, c, d) {
    showLoginPopup(0);
  });
}

/**
 * 사용자 프로그램 메뉴 Load
 */
function loadUserProgramMenu() {

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDPROGRAMMENU);
  $NC.setInitGridVar(G_GRDPROGRAMLIST);

  // 데이터 조회
  $NC.serviceCallAndWait("/WC/getUserProgramMenu.do", {
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onGetUserProgramMenu);
}

/**
 * 사용자 즐겨찾기 메뉴
 */
function loadUserProgramBookMark() {
  
  // 데이터 조회
  $NC.serviceCall("/WC/getUserProgramBookMark.do", {
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onGetUserProgramBookMark);
}

/**
 * 공통 버튼 활성화 처리
 */
function setInitTopButtons() {
  var activeWindow = $NC.G_VAR.activeWindow;
  if ($NC.isNull(activeWindow)) {
    return;
  }

  var viewWindow = getChildContentWindow(activeWindow);
  if (viewWindow.$NC && $.isFunction(viewWindow.$NC.setInitTopButtons)) {
    viewWindow.$NC.setInitTopButtons();
  } else {
    topButtonsInitialize();
  }
}

/**
 * 공통 버튼 비활성화 처리
 */
function topButtonsInitialize(disabled) {
  if ($NC.isNull(disabled)) {
    disabled = true;
  }
  $NC.setEnable("#btnTopInquiry", !disabled);
  $NC.setEnable("#btnTopNew", false);
  $NC.setEnable("#btnTopSave", false);
  $NC.setEnable("#btnTopCancel", false);
  $NC.setEnable("#btnTopDelete", false);
  $NC.hideView("#btnTopPrintList");
}


function ProgramBookMarkOverlayInitialize() {
  // 즐겨찾기 창열기
  $("#btnProgramBookMark").click(function(e) {
    clearTimeout($NC.G_VAR.onProgramListTimeout);
    if ($("#divProgramBookMark").css("display") == "none") {
      var offset = 27;
      var clientHeight = Math.min($(window).height() - 100, Math.max(G_GRDPROGRAMBOOKMARK.data.getLength() * 25
          + offset, 150));
      $("#divProgramBookMark").css({
        "left": $("#btnProgramBookMark").offset().left,
        "width": 328,
        "height": clientHeight
      });
      $NC.resizeGrid("#grdProgramBookMark", 328, clientHeight - offset);
      // 컬럼 헤더 숨김으로 사이즈 재조정...
      $("#grdProgramBookMark .slick-viewport").css({
        "height": clientHeight - offset
      });
      $("#grdProgramBookMark .slick-pane-top").css({
        "height": clientHeight - offset
      });

      try {
        G_GRDPROGRAMBOOKMARK.view.autosizeColumns();
      } catch (e) {
      }
      G_GRDPROGRAMBOOKMARK.view.resetActiveCell();
      G_GRDPROGRAMBOOKMARK.view.setSelectedRows([ ]);
      $NC.showView("#divProgramBookMark", {}, function() {
        // 실행프로그램 목록에서 Active 화면 선택
        //loadUserProgramBookMark();
        if (!$NC.isNull($NC.G_VAR.activeWindow)) {
          var PROGRAM_ID = $NC.G_VAR.activeWindow.get("userData").PROGRAM_ID;
          $NC.setGridSelectRow(G_GRDPROGRAMBOOKMARK, {
            selectKey: "PROGRAM_ID",
            selectVal: PROGRAM_ID
          });
        }
        G_GRDPROGRAMBOOKMARK.view.invalidate();
        G_GRDPROGRAMBOOKMARK.view.focus();
      });
    }
  });
  
  // 즐겨찾기 추가
  $("#btnMenuAdd").click(function(e) {
    var programId = $NC.getValue('#edtMenuAdd')
      ,bookmarkItems = G_GRDPROGRAMBOOKMARK.data.getItems()
    for (var i in bookmarkItems) {
      if (bookmarkItems[i]['PROGRAM_ID'] == programId) {
        alert('이미 즐겨찾기에 등록된 프로그램입니다.');
        return false; 
      }
    }
    var programIndex = $NC.getGridSearchRow(G_GRDPROGRAMMENU, {
        searchKey: "PROGRAM_ID",
        searchVal: programId,
        isAllData: true
      })
      ,rowData = G_GRDPROGRAMMENU.data.getItemByIdx(programIndex)
    rowData["PROGRAM_NM_F"] = rowData["PROGRAM_NM"] + " (" + rowData["PROGRAM_ID"] + ")";
    G_GRDPROGRAMBOOKMARK.data.addItem(rowData);
    $NC.serviceCall("/WC/saveUserBookMark.do", {
      P_USER_ID: $NC.G_USERINFO['USER_ID'],
      P_PROGRAM_ID: programId,
      P_EXE_LEVEL1: 'Y',
      P_EXE_LEVEL2: 'Y',
      P_EXE_LEVEL3: 'Y',
      P_EXE_LEVEL4: 'Y',
      P_FAVORITE_YN: 'N',
      P_REG_USER_ID: $NC.G_USERINFO['USER_ID']
    }, onSaveBookMark);
  })
  var divProgramBookMark = $("#divProgramBookMark");
  divProgramBookMark.children("div:first").click(function(e) {
    if (e.target && e.target.tagName == "DIV") {
      G_GRDPROGRAMBOOKMARK.view.focus();
    }
    e.stopPropagation();
    e.stopImmediatePropagation();
  }).children("div").click(function(e) {
    if (e.target && e.target.tagName == "DIV") {
      G_GRDPROGRAMBOOKMARK.view.focus();
    }
    e.stopPropagation();
    e.stopImmediatePropagation();
  });
  var grdProgramBookMark = $("#grdProgramBookMark");
  grdProgramBookMark.find("div.grid-focus,div.grid-canvas,div.slick-viewport").blur(function(e) {
    clearTimeout($NC.G_VAR.onProgramBookMarkTimeout);
    $NC.G_VAR.onProgramBookMarkTimeout = setTimeout(function() {
      $NC.hideView(divProgramBookMark);
    }, 1000);
  }).focus(function(e) {
    clearTimeout($NC.G_VAR.onProgramBookMarkTimeout);
  });
  var cboProgramBookMarkSortDir = $("#cboProgramBookMarkSortDir");
  cboProgramBookMarkSortDir.focus(function(e) {
    clearTimeout($NC.G_VAR.onProgramBookMarkTimeout);
  });
  // 정렬
  cboProgramBookMarkSortDir.change(function(e) {
    sortProgramBookMarkList();
    G_GRDPROGRAMBOOKMARK.view.focus();
  });
}

/**
 * 프로그램 목록 overlay 초기화
 */
function programListOverlayInitialize() {
  $("#btnProgramList").click(
      function(e) {
        clearTimeout($NC.G_VAR.onProgramListTimeout);
        if ($("#divProgramList").css("display") == "none") {
          var offset = 27;
          var clientHeight = Math.min($(window).height() - 100, Math.max(G_GRDPROGRAMLIST.data.getLength() * 25
              + offset, 150));
          $("#divProgramList").css({
            "left": $("#btnProgramList").offset().left,
            "width": 228,
            "height": clientHeight
          });
          $NC.resizeGrid("#grdProgramList", 228, clientHeight - offset);
          // 컬럼 헤더 숨김으로 사이즈 재조정...
          $("#grdProgramList .slick-viewport").css({
            "height": clientHeight - offset
          });
          $("#grdProgramList .slick-pane-top").css({
            "height": clientHeight - offset
          });

          try {
            G_GRDPROGRAMLIST.view.autosizeColumns();
          } catch (e) {
          }
          G_GRDPROGRAMLIST.view.resetActiveCell();
          G_GRDPROGRAMLIST.view.setSelectedRows([ ]);
          $NC.showView("#divProgramList", {}, function() {
            // 실행프로그램 목록에서 Active 화면 선택
            if (!$NC.isNull($NC.G_VAR.activeWindow)) {
              var PROGRAM_ID = $NC.G_VAR.activeWindow.get("userData").PROGRAM_ID;
              $NC.setGridSelectRow(G_GRDPROGRAMLIST, {
                selectKey: "PROGRAM_ID",
                selectVal: PROGRAM_ID
              });
            }
            G_GRDPROGRAMLIST.view.invalidate();
            G_GRDPROGRAMLIST.view.focus();
          });
        } else {
          $NC.hideView(divProgramList);
        }
        loadUserProgramBookMark();
      });
  var divProgramList = $("#divProgramList");
  divProgramList.children("div:first").click(function(e) {
    if (e.target && e.target.tagName == "DIV") {
      G_GRDPROGRAMLIST.view.focus();
    }
    e.stopPropagation();
    e.stopImmediatePropagation();
  }).children("div").click(function(e) {
    if (e.target && e.target.tagName == "DIV") {
      G_GRDPROGRAMLIST.view.focus();
    }
    e.stopPropagation();
    e.stopImmediatePropagation();
  });
  var grdProgramList = $("#grdProgramList");
  grdProgramList.find("div.grid-focus,div.grid-canvas,div.slick-viewport").blur(function(e) {
    clearTimeout($NC.G_VAR.onProgramListTimeout);
    $NC.G_VAR.onProgramListTimeout = setTimeout(function() {
      $NC.hideView(divProgramList);
    }, 500);
  }).focus(function(e) {
    clearTimeout($NC.G_VAR.onProgramListTimeout);
  });
  var cboProgramListSortDir = $("#cboProgramListSortDir");
  cboProgramListSortDir.focus(function(e) {
    clearTimeout($NC.G_VAR.onProgramListTimeout);
  });
  cboProgramListSortDir.change(function(e) {
    sortProgramList();
    G_GRDPROGRAMLIST.view.focus();
  });
}

/**
 * 프로그램 목록 overlay 초기화
 */
function printListOverlayInitialize() {
  $("#btnTopPrintList").click(function(e) {
    clearTimeout($NC.G_VAR.onPrintListTimeout);
    if ($("#divPrintList").css("display") == "none") {
      var clientHeight = Math.max(G_GRDPRINTLIST.data.getLength() * 25, 60);
      $("#divPrintList").css({
        "left": $("#btnTopPrintList").offset().left,
        "width": 180,
        "height": clientHeight
      });
      $NC.resizeGrid("#grdPrintList", 180, clientHeight);
      // 컬럼 헤더 숨김으로 사이즈 재조정...
      $("#grdPrintList .slick-viewport").css({
        "height": clientHeight
      });
      $("#grdPrintList .slick-pane-top").css({
        "height": clientHeight
      });

      G_GRDPRINTLIST.view.resetActiveCell();
      G_GRDPRINTLIST.view.setSelectedRows([ ]);
      $NC.showView("#divPrintList", {}, function() {
        G_GRDPRINTLIST.view.invalidate();
        G_GRDPRINTLIST.view.focus();
      });
    } else {
      $NC.hideView("#divPrintList");
    }
  });
  var grdPrintList = $("#grdPrintList");
  grdPrintList.find("div.grid-focus,div.grid-canvas,div.slick-viewport").blur(function(e) {
    clearTimeout($NC.G_VAR.onPrintListTimeout);
    $NC.G_VAR.onPrintListTimeout = setTimeout(function() {
      $NC.hideView("#divPrintList");
    }, 500);
  }).focus(function(e) {
    clearTimeout($NC.G_VAR.onPrintListTimeout);
  });
}

/**
 * 즐겨찾기 저장후 응답
 */
function onSaveBookMark(ajaxData) {
  //console.log(ajaxData);
}

/**
 * 즐겨찾기 삭제후 응답
 */
function onDeleteBookMark(ajaxData) {
  //alert('삭제되었습니다.');
  //clearTimeout($NC.G_VAR.onProgramBookMarkTimeout);
  //$NC.hideView(divProgramBookMark);
}

/**
 * 메뉴 보임/숨김
 */
function showMenu(show, duration, userData) {

  G_GRDPROGRAMMENU.view.resetActiveCell();

  if (show) {
    $NC.G_OFFSET.currentMenuWidth = $NC.G_OFFSET.defaultMenuWidth;
    $NC.showView("#divMenuView", {}, null, $NC.isNull(duration) ? 0 : duration);
  } else {
    $NC.G_OFFSET.currentMenuWidth = 0;
    $NC.hideView("#divMenuView", null, $NC.isNull(duration) ? 0 : duration);
  }
  _OnResize($(window), true);

  if (!show) {
    return;
  }

  var PROGRAM_ID = null;
  if (!$NC.isNull(userData)) {
    PROGRAM_ID = userData.PROGRAM_ID;
  } else {
    if (!$NC.isNull($NC.G_VAR.activeWindow)) {
      PROGRAM_ID = $NC.G_VAR.activeWindow.get("userData").PROGRAM_ID;
    }
  }

  if ($NC.isNull(PROGRAM_ID)) {
    return;
  }

  var activeCell = G_GRDPROGRAMMENU.view.getActiveCell();
  if (!$NC.isNull(activeCell)) {
    if (PROGRAM_ID != G_GRDPROGRAMMENU.data.getItem(activeCell.row).PROGRAM_ID) {
      setActiveProgramMenu(PROGRAM_ID);
    }
  } else {
    setActiveProgramMenu(PROGRAM_ID);
  }
}

/**
 * 메뉴 토글
 */
function toggleMenu() {

  if ($NC.G_OFFSET.currentMenuWidth == 0) {
    showMenu(true);
  } else {
    showMenu(false);
  }
  scrollViewToTop();
}

/**
 * 단위 화면 실행
 */
function showProgramPopup(programInfo) {

  if (typeof programInfo == "string") {
    var programIndex = $NC.getGridSearchRow(G_GRDPROGRAMMENU, {
      searchKey: "PROGRAM_ID",
      searchVal: programInfo,
      isAllData: true
    });

    if (programIndex == -1) {
      alert("해당 프로그램[" + programInfo + "]을 사용할 권한이 없습니다.");
      return;
    }
    programInfo = G_GRDPROGRAMMENU.data.getItems()[programIndex];
  }

  // 메뉴면 아무것도 안함
  if (programInfo.PROGRAM_DIV == "M") {
    return;
  }

  // 기존에 Open한 화면인지 체크
  var containerId = "div" + programInfo.PROGRAM_ID;
  var winIndex = getWindowIndex(containerId);
  if (winIndex > -1) {
    var view = $NC.G_VAR.windows[winIndex];
    $NC.G_VAR.windows.splice(winIndex, 1);
    $NC.G_VAR.windows.push(view);
    view.focus();
    window.location.hash = $NC.G_VAR.activeWindow.get('userData').WEB_URL;
    return;
  }

  if ($("#btnProgramList").css("display") == "none") {
    $NC.showView("#btnProgramList", {
      "opacity": 1,
      "width": 105,
      "height": 32,
    });
  }

  // 화면 Layout 구성
  var programTitle = programInfo.PROGRAM_NM + " (" + programInfo.PROGRAM_ID + ")";
  // 클라이언트에 추가
  // var parent = $("#divProgramView");

  var userData = {
    ROW_ID: programInfo.id,
    PROGRAM_NM: programInfo.PROGRAM_NM,
    PROGRAM_ID: programInfo.PROGRAM_ID,
    WIDE_YN: programInfo.WIDE_YN,
    WEB_URL: programInfo.WEB_URL,
    PROGRAM_DIV: programInfo.PROGRAM_DIV,
    EXE_LEVEL1: programInfo.EXE_LEVEL1,
    EXE_LEVEL2: programInfo.EXE_LEVEL2,
    EXE_LEVEL3: programInfo.EXE_LEVEL3,
    EXE_LEVEL4: programInfo.EXE_LEVEL4
  };

  var isWide = !$("#btnPinMenu").is(".ui-clr-selected") && userData.WIDE_YN == "Y";
  $NC.hideLoadingMessage(true);
  $NC.showLoadingMessage(isWide);
  var childRect = getChildWindowRect(isWide);

  var viewWindow = $.jWindow({
    parentElement: "#divProgramView",
    id: containerId,
    title: programTitle,
    userData: userData,
    animationDuration: 200,
    posx: childRect.left,
    posy: childRect.top,
    minWidth: childRect.minWidth,
    minHeight: childRect.minHeight,
    width: childRect.width,
    height: childRect.height,
    windowType: 1,
    type: "iframe",
    url: $.browser.urlPrefix + "/nexos/html/" + programInfo.WEB_URL,
    refreshButton: false,
    minimiseButton: false,
    maximiseButton: false,
    containment: true,
    onClose: function(jWin) {
      // 화면 목록에서 제거
      removeChildWindow(jWin);
    },
    onFocus: function(jWin) {
      // 메뉴에서 해당 화면 선택
      $NC.G_VAR.activeWindow = jWin;
      $NC.G_VAR.lastWindow = jWin;
      var userData = $NC.G_VAR.activeWindow.get("userData");

      if (!$("#btnPinMenu").is(".ui-clr-selected")) {
        if (userData.WIDE_YN === "Y") {
          showMenu(false);
        } else {
          showMenu(true, null, userData);
        }
      } else {
        _OnResize($(window));

        var activeCell = G_GRDPROGRAMMENU.view.getActiveCell();
        if (!$NC.isNull(activeCell)) {
          if (userData.PROGRAM_ID != G_GRDPROGRAMMENU.data.getItem(activeCell.row).PROGRAM_ID) {
            setActiveProgramMenu(userData.PROGRAM_ID);
          }
        } else {
          setActiveProgramMenu(userData.PROGRAM_ID);
        }
      }

      scrollViewToTop();
      setInitTopButtons();
    }
  });
  // 해당 화면 목록에 추가
  $NC.G_VAR.windows.push(viewWindow);
  $NC.G_VAR.activeWindow = viewWindow;
  $NC.G_VAR.lastWindow = viewWindow;
  viewWindow.update();
  viewWindow.show({
    duration: 200
  });

  // 실행프로그램 목록에 보이기
  showProgramListMenu(programInfo.id, "Y");
  if ($("#divCommonButtons").css("display") == "none") {
    $NC.showView("#divCommonButtons");
  }

  // 해시태그 변경
  window.location.hash = programInfo.WEB_URL;
}

/**
 * 공통 팝업 창 표시
 */
function showCommonPopup(options) {
  if ($NC.isNull(options.containerId)) {
    return false;
  }
  if ($NC.isNull(options.queryId)) {
    return false;
  }
  if ($NC.isNull(options.title)) {
    options.title = "코드 검색";
  }
  if ($NC.isNull(options.url)) {
    options.url = $.browser.urlPrefix + "/nexos/html/popup/commonpopup.html";
  }

  var parentElement = "#divProgramView";
  var parent = $(parentElement);
  var parentOffset = parent.offset();

  var viewWidth = $NC.isNull(options.width) ? 300 : options.width;
  var viewHeight = $NC.isNull(options.height) ? 400 : options.height;
  var viewLeft = (parent.outerWidth() - viewWidth) / 2 + parentOffset.left;
  if (viewLeft < parentOffset.left) {
    viewLeft = parentOffset.left;
  }
  var viewTop = (parent.outerHeight() - viewHeight) / 2 + parentOffset.top;
  if (viewTop < parentOffset.top) {
    viewTop = parentOffset.top;
  }

  var viewWindow = $.jWindow({
    parentElement: parentElement,
    id: options.containerId,
    title: options.title,
    userData: options,
    popupWindow: true,
    animationDuration: 200,
    posx: viewLeft,
    posy: viewTop,
    minWidth: 350,
    minHeight: 300,
    width: viewWidth,
    height: viewHeight,
    windowType: 3,
    type: "iframe",
    url: options.url,
    refreshButton: false,
    minimiseButton: false,
    maximiseButton: false,
    modal: true,
    onClose: function(jWin) {
      var closeAction = "";
      if (jWin) {
        // X 버튼으로 Close시 onCancel 호출
        var userData = jWin.get("userData");
        if (userData && userData["CLOSE_ACTION"]) {
          closeAction = userData["CLOSE_ACTION"];
        }
        if ($NC.isNull(closeAction) && userData.onCancel) {
          userData.onCancel();
        }
        // 팝업 제거
        removePopupWindow(jWin);
      }
      setTimeout(setFocusActiveWindow, 100);
    },
    onFocus: function(jWin) {
      $NC.G_VAR.activePopupWindow = jWin;
      $NC.G_VAR.lastWindow = jWin;
    }
  });
  $NC.G_VAR.activePopupWindow = viewWindow;
  $NC.G_VAR.lastWindow = viewWindow;
  viewWindow.update();
  viewWindow.show({
    duration: 200
  });
}

/**
 * 그리드 컬럼순서 조정 팝업 표시
 * 
 * @param options
 *          P_PROGRAM_TITLE: 그리드가 포함된 프로그램의 타이틀<br>
 *          P_PROGRAM_INFO: 그리드가 포함된 프로그램의 정보<br>
 *          P_GRID_TITLE: 그리드 타이틀<br>
 *          P_GRID_OBJECT: 그리드 OBJECT<br>
 */
function showGridColumnReorderPopup(options) {

  if ($NC.isNull(options)) {
    return;
  }

  if ($NC.isNull(options.containerId)) {
    options.containerId = "divCommonPopupGridColumnReorder";
  }
  if ($NC.isNull(options.title)) {
    options.title = "컬럼순서 조정";
  }
  if ($NC.isNull(options.url)) {
    options.url = $.browser.urlPrefix + "/nexos/html/popup/gridcolumnreorderpopup.html";
  } else {
    options.url = $.browser.urlPrefix + "/nexos/html/" + options.url;
  }

  var parentElement = "#divProgramView";
  var parent = $(parentElement);
  var parentOffset = parent.offset();
  var viewWidth = $NC.isNull(options.width) ? 400 : options.width;
  var viewHeight = $NC.isNull(options.height) ? 450 : options.height;
  var viewLeft = (parent.outerWidth() - viewWidth) / 2 + parentOffset.left;
  if (viewLeft < parentOffset.left) {
    viewLeft = parentOffset.left;
  }
  var viewTop = (parent.outerHeight() - viewHeight) / 2 + parentOffset.top;
  if (viewTop < parentOffset.top) {
    viewTop = parentOffset.top;
  }

  var viewWindow = $.jWindow({
    parentElement: parentElement,
    id: options.containerId,
    title: options.title,
    userData: options,
    popupWindow: true,
    animationDuration: 200,
    posx: viewLeft,
    posy: viewTop,
    minWidth: viewWidth,
    minHeight: viewHeight,
    width: viewWidth,
    height: viewHeight,
    windowType: 3,
    type: "iframe",
    url: options.url,
    refreshButton: false,
    minimiseButton: false,
    maximiseButton: false,
    resizeable: false,
    draggable: true,
    modal: true,
    onClose: function(jWin) {
      var closeAction = "CANCEL";
      if (jWin) {
        // X 버튼으로 Close시 onCancel 호출
        var userData = jWin.get("userData");
        if (userData && userData["CLOSE_ACTION"]) {
          closeAction = userData["CLOSE_ACTION"];
        }
        if ($NC.isNull(closeAction) && userData.onCancel) {
          userData.onCancel();
        }
        // 팝업 제거
        removePopupWindow(jWin);
      }
      setTimeout(setFocusActiveWindow, 100);
    },
    onFocus: function(jWin) {
      $NC.G_VAR.activePopupWindow = jWin;
      $NC.G_VAR.lastWindow = jWin;
    }
  });
  $NC.G_VAR.activePopupWindow = viewWindow;
  $NC.G_VAR.lastWindow = viewWindow;
  viewWindow.update();
  viewWindow.show({
    duration: 200
  });
}

/**
 * 메시지 표시
 * 
 * @param options
 *          <br>
 *          String: 메시지<br>
 *          Object: <br>
 *          title[선택]: 기본값 -> 확인<br>
 *          message[필수]: 메시지<br>
 *          width, height[선택]: 메시지박스 크기<br>
 *          buttons[선택]: 기본값 -> 확인 버튼, {"예": function() { ... }, "아니오": function () { ... }}<br>
 *          hideFocus[선택]: 기본 버튼에 포커스 지정 여부, 기본값 true onDialogOpen: 메시지박스 오픈시 호출되는 Event
 */
function showMessage(options) {

  if ($NC.isNull(options)) {
    return;
  }

  if ($.type(options) == "string") {
    options = {
      message: options
    };
  }

  if ($NC.isNull(options.message)) {
    return;
  }

  var buttons;
  if ($NC.isNull(options.buttons)) {
    buttons = {
      "확인": function() {
        $(this).dialog("close");
      }
    };
  } else {
    buttons = {};
    for ( var button in options.buttons) {
      buttons[button] = function(e) {
        var target = $(e.target).text();
        var onClick = options.buttons[target];
        $(this).dialog("close");
        if ($.isFunction(onClick)) {
          onClick();
        }
      };
    }
  }

  var hideFocus = options.hideFocus || false;
  var onDialogOpen = options.onDialogOpen;

  var messagePopup = $("#divMessagePopupView");
  messagePopup.dialog({
    autoOpen: false,
    modal: true,
    minWidth: 250,
    minHeight: 100,
    title: options.title ? options.title : "확인",
    width: options.width ? options.width : 350,
    height: options.height ? options.height : 150,
    draggable: true,
    resizable: false,
    closeOnEscape: false,
    create: function(event, ui) {
      var parent = $(this).parent();
      parent.children(".ui-dialog-titlebar").css({
        "padding": "2px 5px 2px 5px",
        "cursor": "default"
      }).children("button").css({
        "width": "24px",
        "height": "17px",
        "margin": "-8px 0 0 0"
      });
      parent.css({
        "zIndex": 1301,
        "padding": "1px"
      });
    },
    open: function() {
      $(".ui-widget-overlay").css("zIndex", 1300);
      var view = $(this);
      view.html(options.message.replace(/\n|\r/gi, "<br>"));
      view.parent().find(".ui-dialog-buttonpane button").width(80);
      if (!$NC.isNull(buttons)) {
        view.parent().find(".ui-dialog-titlebar-close").hide();
      }
      if (hideFocus) {
        view.focus();
      } else if (Object.keys(buttons).length == 1) {
        view.parent().find(".ui-dialog-buttonpane button").focus();
      }
      if ($.isFunction(onDialogOpen)) {
        onDialogOpen();
      }
    },
    close: function(event, ui) {
      messagePopup.dialog("option", "title", "");
      messagePopup.dialog("destroy");
      messagePopup.css("display", "none");
    },
    buttons: buttons
  });
  setTimeout(function() {
    messagePopup.dialog("open");
  }, 100);
}

/**
 * 단위화면의 팝업 표시
 * 
 * @param options
 *          PROGRAM_ID[필수]: 프로그램ID<br>
 *          PROGRAM_NM[필수]: 프로그램명<br>
 *          url[필수]: html url<br>
 *          containerId[옵션]: 컨테이너ID(containerId)의 명칭 접두어는 divS로 지정, 미지정시 "div" + options.PROGRAM_ID<br>
 *          title[옵션]: 팝업창 제목, 미지정시 PROGRAM_NM + " (" + PROGRAM_ID + ")"<br>
 *          width[옵션]: 팝업창 너비<br>
 *          height[옵션]: 팝업창 높이<br>
 *          onOk[옵션]: 확인 버튼 이벤트<br>
 *          onCancel[옵션]: 취소, 닫기 버튼 이벤트<br>
 */
function showProgramSubPopup(options) {

  if ($NC.isNull(options.containerId)) {
    options.containerId = "div" + options.PROGRAM_ID;
  }
  if ($NC.isNull(options.title)) {
    options.title = options.PROGRAM_NM + " (" + options.PROGRAM_ID + ")";
  }

  if (options.userData) {
    options.userData["CLOSE_ACTION"] = "CANCEL";
    options.userData["PROGRAM_ID"] = options.PROGRAM_ID;
    options.userData["PROGRAM_NM"] = options.PROGRAM_NM;
  } else {
    options.userData = {
      CLOSE_ACTION: "CANCEL",
      PROGRAM_ID: options.PROGRAM_ID,
      PROGRAM_NM: options.PROGRAM_NM
    };
  }

  var parentElement = "#divProgramView";
  var parent = $(parentElement);
  var parentOffset = parent.offset();
  var viewWidth = $NC.isNull(options.width) ? 800 : options.width;
  var viewHeight = $NC.isNull(options.height) ? 500 : options.height;
  var viewLeft = (parent.outerWidth() - viewWidth) / 2 + parentOffset.left;
  if (viewLeft < parentOffset.left) {
    viewLeft = parentOffset.left;
  }
  var viewTop = (parent.outerHeight() - viewHeight) / 2 + parentOffset.top;
  if (viewTop < parentOffset.top) {
    viewTop = parentOffset.top;
  }

  var viewWindow = $.jWindow({
    parentElement: parentElement,
    id: options.containerId,
    title: options.title,
    userData: options.userData,
    popupWindow: true,
    animationDuration: 200,
    posx: viewLeft,
    posy: viewTop,
    minWidth: 250,
    minHeight: 100,
    width: viewWidth,
    height: viewHeight,
    windowType: 2,
    type: "iframe",
    url: $.browser.urlPrefix + "/nexos/html/" + options.url,
    refreshButton: false,
    minimiseButton: false,
    maximiseButton: false,
    resizeable: false,
    draggable: true,
    modal: true,
    onClose: function(jWin) {
      var closeAction = "CANCEL";
      if (jWin) {
        // X 버튼으로 Close시 onCancel 호출
        var userData = jWin.get("userData");
        var resultInfo;
        if (userData) {
          if (userData["CLOSE_ACTION"]) {
            closeAction = userData["CLOSE_ACTION"];
          }

          if (userData["RESULT_INFO"]) {
            var tmp = userData["RESULT_INFO"];
            if (typeof tmp == "object") {
              if (Array.isArray(tmp)) {
                resultInfo = $.extend(true, [ ], tmp);
              } else {
                resultInfo = $.extend(true, {}, tmp);
              }
            } else {
              resultInfo = tmp;
            }
          }
        }

        if (closeAction == "OK") {
          if (options.onOk) {
            options.onOk(resultInfo);
          }
        } else {
          if (options.onCancel) {
            options.onCancel(resultInfo);
          }
        }

        // 팝업 제거
        removePopupWindow(jWin);
      }
      setTimeout(setFocusActiveWindow, 100);
    },
    onFocus: function(jWin) {
      $NC.G_VAR.activeSubWindow = jWin;
      $NC.G_VAR.lastWindow = jWin;
    }
  });
  $NC.G_VAR.activeSubWindow = viewWindow;
  $NC.G_VAR.lastWindow = viewWindow;
  viewWindow.update();
  viewWindow.show({
    duration: 200
  });
}

function showProgramtestpopup(options) {

  if ($NC.isNull(options.containerId)) {
    options.containerId = "div" + options.PROGRAM_ID;
  }
  if ($NC.isNull(options.title)) {
    options.title = options.PROGRAM_NM + " (" + options.PROGRAM_ID + ")";
  }

  if (options.userData) {
    options.userData["CLOSE_ACTION"] = "CANCEL";
    options.userData["PROGRAM_ID"] = options.PROGRAM_ID;
    options.userData["PROGRAM_NM"] = options.PROGRAM_NM;
  } else {
    options.userData = {
      CLOSE_ACTION: "CANCEL",
      PROGRAM_ID: options.PROGRAM_ID,
      PROGRAM_NM: options.PROGRAM_NM
    };
  }

  var parentElement = "#divProgramView";
  var parent = $(parentElement);
  var parentOffset = parent.offset();
  var viewWidth = $NC.isNull(options.width) ? 800 : options.width;
  var viewHeight = $NC.isNull(options.height) ? 500 : options.height;
  var viewLeft = (parent.outerWidth() - viewWidth) / 2 + parentOffset.left;
  if (viewLeft < parentOffset.left) {
    viewLeft = parentOffset.left;
  }
  var viewTop = (parent.outerHeight() - viewHeight) / 2 + parentOffset.top;
  if (viewTop < parentOffset.top) {
    viewTop = parentOffset.top;
  }

  var isWide = true;
  $NC.hideLoadingMessage(true);
  $NC.showLoadingMessage(isWide);
  var childRect = getChildWindowRect(isWide);

  var viewWindow = $.jWindow({
    parentElement: parentElement,
    id: options.containerId,
    title: options.title,
    userData: options.userData,
    // popupWindow: true,
    animationDuration: 200,
    posx: childRect.left,
    posy: childRect.top,
    minWidth: childRect.minWidth,
    minHeight: childRect.minHeight,
    width: childRect.width,
    height: childRect.height,
    windowType: 1,
    type: "iframe",
    url: $.browser.urlPrefix + "/nexos/html/" + options.url,
    refreshButton: false,
    minimiseButton: false,
    maximiseButton: false,
    containment: true,
    // resizeable: false,
    // draggable: true,
    // modal: true,
    onClose: function(jWin) {
      var closeAction = "CANCEL";
      if (jWin) {
        // X 버튼으로 Close시 onCancel 호출
        var userData = jWin.get("userData");
        var resultInfo;
        if (userData) {
          if (userData["CLOSE_ACTION"]) {
            closeAction = userData["CLOSE_ACTION"];
          }

          if (userData["RESULT_INFO"]) {
            var tmp = userData["RESULT_INFO"];
            if (typeof tmp == "object") {
              if (Array.isArray(tmp)) {
                resultInfo = $.extend(true, [ ], tmp);
              } else {
                resultInfo = $.extend(true, {}, tmp);
              }
            } else {
              resultInfo = tmp;
            }
          }
        }

        if (closeAction == "OK") {
          if (options.onOk) {
            options.onOk(resultInfo);
          }
        } else {
          if (options.onCancel) {
            options.onCancel(resultInfo);
          }
        }

        // 팝업 제거
        removePopupWindow(jWin);
      }
      setTimeout(setFocusActiveWindow, 100);
    },

    onFocus: function(jWin) {

      $NC.G_VAR.activeSubWindow = jWin;
      $NC.G_VAR.lastWindow = jWin;
      var userData = $NC.G_VAR.activeWindow.get("userData");

      if (!$("#btnPinMenu").is(".ui-clr-selected")) {
        if (userData.WIDE_YN === "Y") {
          showMenu(false);
        } else {
          showMenu(true, null, userData);
        }
      } else {
        _OnResize($(window));

        var activeCell = G_GRDPROGRAMMENU.view.getActiveCell();
        if (!$NC.isNull(activeCell)) {
          if (userData.PROGRAM_ID != G_GRDPROGRAMMENU.data.getItem(activeCell.row).PROGRAM_ID) {
            setActiveProgramMenu(userData.PROGRAM_ID);
          }
        } else {
          setActiveProgramMenu(userData.PROGRAM_ID);
        }
      }

      scrollViewToTop();
      setInitTopButtons();
    }
  });
  $NC.G_VAR.activeSubWindow = viewWindow;
  $NC.G_VAR.lastWindow = viewWindow;
  viewWindow.update();
  viewWindow.show({
    duration: 200
  });
  // 해당 화면 목록에 추가
  $NC.G_VAR.windows.push(viewWindow);
  $NC.G_VAR.activeWindow = viewWindow;
  $NC.G_VAR.lastWindow = viewWindow;
  viewWindow.update();
  viewWindow.show({
    duration: 200
  });

  // 실행프로그램 목록에 보이기
  showProgramListMenu(programInfo.id, "Y");
  if ($("#divCommonButtons").css("display") == "none") {
    $NC.showView("#divCommonButtons");
  }
}

/**
 * 출력 미리보기 표시
 * 
 * @param options
 *          title: 미리보기 팝업창 제목, 기본값 "미리보기"<br>
 *          url: 미리보기 팝업 주소, 기본값 previewpopup<br>
 *          reportDoc: Report 파일<br>
 *          queryId: 쿼리ID<br>
 *          queryParams: 쿼리 파라메터<br>
 *          checkedValue: 선택 값<br>
 *          printerName: 출력 프린터명, PRINT_LABEL_IN, PRINT_LABEL_OUT, PRINT_BILL_IN, PRINT_BILL_OUT<br>
 *          silentPrinterName: 자동 출력 프린터명<br>
 *          internalQueryYn: Report 내부 쿼리 사용여부, 기본값 "N"<br>
 *          printCopy: 출력매수, 기본값 1
 */
function showPrintPreview(options) {

  if ($NC.isNull(options.containerId)) {
    options.containerId = "divCommonPopupPrintPreview";
  }
  if ($NC.isNull(options.title)) {
    options.title = "미리보기";
  }
  if ($NC.isNull(options.url)) {
    options.url = $.browser.urlPrefix + "/nexos/html/popup/previewpopup.html";
  } else {
    options.url = $.browser.urlPrefix + "/nexos/html/" + options.url;
  }

  if (options.userData) {
    options.userData["CLOSE_ACTION"] = "CANCEL";
  } else {
    options.userData = {
      CLOSE_ACTION: "CANCEL"
    };
  }

  var parentElement = "#divProgramView";
  var parent = $(parentElement);
  var parentOffset = parent.offset();
  var viewWidth = $NC.isNull(options.width) ? 800 : options.width;
  var viewHeight = $NC.isNull(options.height) ? 500 : options.height;
  var viewLeft = (parent.outerWidth() - viewWidth) / 2 + parentOffset.left;
  if (viewLeft < parentOffset.left) {
    viewLeft = parentOffset.left;
  }
  var viewTop = (parent.outerHeight() - viewHeight) / 2 + parentOffset.top;
  if (viewTop < parentOffset.top) {
    viewTop = parentOffset.top;
  }

  var viewWindow = $.jWindow({
    parentElement: parentElement,
    id: options.containerId,
    title: options.title,
    userData: options,
    popupWindow: true,
    animationDuration: 200,
    posx: viewLeft,
    posy: viewTop,
    minWidth: viewWidth,
    minHeight: viewHeight,
    width: viewWidth,
    height: viewHeight,
    windowType: 3,
    type: "iframe",
    url: options.url,
    refreshButton: false,
    minimiseButton: false,
    maximiseButton: false,
    resizeable: false,
    draggable: true,
    modal: true,
    onClose: function(jWin) {
      if (jWin) {
        // 팝업 제거
        removePopupWindow(jWin);
      }
      setTimeout(setFocusActiveWindow, 100);
    },
    onFocus: function(jWin) {
      $NC.G_VAR.activePopupWindow = jWin;
      $NC.G_VAR.lastWindow = jWin;
    }
  });
  $NC.G_VAR.activePopupWindow = viewWindow;
  $NC.G_VAR.lastWindow = viewWindow;
  viewWindow.update();
  viewWindow.show({
    duration: 200
  });
}

/**
 * 단위화면 사이즈 리턴
 * 
 * @param isWide
 *          와이드 화면에 대한 사이즈
 * @returns {left, top, minWidth, minHeight, width, height}
 */
function getChildWindowRect(isWide) {

  // 실행 중인 단위 화면 사이즈 조정
  // var offset = $("#divProgramView").offset();
  var viewLeft = 0;// offset.left;
  var viewTop = 0;// offset.top;
  var viewWidth = $NC.G_CHILDLAYOUT.width - $NC.G_CHILDLAYOUT.nonClientWidth
      - (isWide ? $NC.G_LAYOUT.border1 : $NC.G_LAYOUT.border2);
  var viewHeight = $NC.G_CHILDLAYOUT.height - $NC.G_CHILDLAYOUT.nonClientHeight;

  return {
    left: viewLeft,
    top: viewTop,
    minWidth: $NC.G_CHILDLAYOUT.minWidth,
    minHeight: $NC.G_CHILDLAYOUT.minHeight,
    width: viewWidth,
    height: viewHeight
  };
}

/**
 * 실행된 단위 화면 전체 사이즈 조정
 */
function resizeChildWindows() {

  // 실행 중인 단위 화면 사이즈 조정
  var childRect = getChildWindowRect($NC.G_OFFSET.currentMenuWidth == 0);

  for ( var idx = 0, winCount = $NC.G_VAR.windows.length; idx < winCount; idx++) {
    $NC.G_VAR.windows[idx].set({
      posx: childRect.left,
      posy: childRect.top,
      minWidth: childRect.minWidth,
      minHeight: childRect.minHeight,
      width: childRect.width,
      height: childRect.height
    });
  }
}

/**
 * 실행된 단위 화면 사이즈 조정
 */
function resizeActiveChildWindow() {

  // 활성화된 화면만 리사이즈
  if ($NC.G_VAR.activeWindow == null) {
    return;
  }

  // 실행 중인 단위 화면 사이즈 조정
  var childRect = getChildWindowRect($NC.G_OFFSET.currentMenuWidth == 0);

  $NC.G_VAR.activeWindow.set({
    posx: childRect.left,
    posy: childRect.top,
    minWidth: childRect.minWidth,
    minHeight: childRect.minHeight,
    width: childRect.width,
    height: childRect.height
  });
}

/**
 * 실행된 팝업 화면을 목록에서 제거
 */
function removePopupWindow(view) {

  if (!$NC.isNull($NC.G_VAR.activePopupWindow)) {
    $NC.G_VAR.activePopupWindow = null;
  } else if (!$NC.isNull($NC.G_VAR.activeSubWindow)) {
    $NC.G_VAR.activeSubWindow = null;
  }

  if (view == null) {
    return;
  }

  var removeId = view.get("id");
  view.update(null);
  view.removeWindow();
  delete view;
  $("#" + removeId).remove();
}

/**
 * 실행된 단위 화면을 목록에서 제거
 */
function removeChildWindow(view) {

  $NC.G_VAR.activeWindow = null;
  if (view == null) {
    return;
  }

  var removeId = view.get("id");
  var removeProgramId;
  for ( var idx = 0, winCount = $NC.G_VAR.windows.length; idx < winCount; idx++) {
    if (removeId == $NC.G_VAR.windows[idx].get("id")) {

      // 실행프로그램 목록에 숨기기
      showProgramListMenu(view.get("userData").ROW_ID, "N");
      removeProgramId = view.get("userData").PROGRAM_ID;

      $NC.G_VAR.windows.splice(idx, 1);

      view.update(null);
      view.removeWindow();
      delete view;
      $("#" + removeId).remove();
      break;
    }
  }

  // 마지막 화면 맨 앞으로
  var viewCount = $NC.G_VAR.windows.length;
  if (viewCount > 0) {
    $NC.G_VAR.activeWindow = $NC.G_VAR.windows[viewCount - 1];
    $NC.G_VAR.activeWindow.focus();
    window.location.hash = $NC.G_VAR.activeWindow.get("userData").WEB_URL;

    if ($("#divProgramList").css("display") != "none") {
      G_GRDPROGRAMLIST.view.resetActiveCell();
      G_GRDPROGRAMLIST.view.setSelectedRows([ ]);
      // 실행프로그램 목록에서 Active 화면 선택
      var PROGRAM_ID = $NC.G_VAR.activeWindow.get("userData").PROGRAM_ID;
      $NC.setGridSelectRow(G_GRDPROGRAMLIST, {
        selectKey: "PROGRAM_ID",
        selectVal: PROGRAM_ID
      });
      G_GRDPROGRAMLIST.view.invalidate();
    }

    resizeActiveChildWindow();
  } else {
    $NC.hideView("#btnProgramList");
    clearTimeout($NC.G_VAR.onProgramListTimeout);
    $NC.hideView("#divProgramList");
    $NC.hideView("#divCommonButtons");
    window.location.hash = '';

    topButtonsInitialize(true);
    scrollViewToTop();
    if ($NC.G_OFFSET.currentMenuWidth == 0) {
      var userData = null;
      if (!$NC.isNull(removeProgramId)) {
        userData = {
          PROGRAM_ID: removeProgramId
        };
      }
      showMenu(true, 300, userData);
    }
  }
}

/**
 * 실행된 단위 화면 전체를 목록에서 제거
 */
function removeAllChildWindow() {

  $NC.G_VAR.activeWindow = null;

  var removeId;
  var viewCount = $NC.G_VAR.windows.length;
  for ( var idx = viewCount - 1; idx > -1; idx--) {

    var view = $NC.G_VAR.windows[idx];
    removeId = view.get("id");

    // 실행프로그램 목록에 숨기기
    showProgramListMenu(view.get("userData").ROW_ID, "N");

    $NC.G_VAR.windows.splice(idx, 1);

    view.update(null);
    view.removeWindow();
    delete view;
    $("#" + removeId).remove();
  }

  $NC.hideView("#btnProgramList");
  clearTimeout($NC.G_VAR.onProgramListTimeout);
  $NC.hideView("#divProgramList");
  $NC.hideView("#divCommonButtons");

  showMenu(true, 300);
  scrollViewToTop();
}

/**
 * 프로그램ID로 jWindow 리턴
 * 
 * @params program_Id
 */
function getWindowIndex(program_Id) {

  var result = -1;
  var divProgram_Id = program_Id.indexOf("div") == 0 ? program_Id : "div" + program_Id;
  var view;
  for ( var i = 0, winCount = $NC.G_VAR.windows.length; i < winCount; i++) {
    view = $NC.G_VAR.windows[i];
    if (divProgram_Id == view.get("id")) {
      result = i;
      break;
    }
  }
  return result;
}

/**
 * 단위 화면의 iframe 리턴
 * 
 * @param selector
 *          jWindow, Program_Id
 */
function getChildIFrame(selector) {

  var containerId;
  if ($.type(selector) === "string") {
    containerId = selector;
  } else {
    containerId = selector.get("id");
  }
  return $("#ifra" + $NC.getProgramId(containerId))[0];
}

/**
 * jWindow로 해당 단위 화면의 iframe 의 컨텐츠 윈도우 가져오기
 * 
 * @param jWin
 *          jWindow
 */
function getChildContentWindow(jWin) {

  return getChildIFrame(jWin).contentWindow;
}

/**
 * jWindow로 해당 단위 화면의 iframe 의 컨텐츠 Document 가져오기
 * 
 * @param jWin
 *          jWindow
 */
function getChildContentDocument(jWin) {

  return getChildIFrame(jWin).contentDocument;
}

/**
 * 로그인 팝업 초기화
 */
function loginPopupInitialize() {
  $("#divLoginView").dialog({
    autoOpen: false,
    modal: true,
    width: 501,
    height: 303,
    resizable: false,
    closeOnEscape: false,
    create: function(event, ui) {
      var parent = $(this).parent();
      parent.children(".ui-dialog-titlebar").hide();
      parent.css({
        zIndex: 1301,
        border: "none",
        background: "url(../../layout/main/image/login.png) no-repeat center center"
      });
    },
    open: function() {
      $(".ui-widget-overlay").css("zIndex", 1300);

      var left = ($(window).width() / 2) - ($(this).width() / 2);
      var top = ($(window).height() / 2) - ($(this).height() / 2);
      $(this).dialog("option", "position", [left, top]);

      var save_User_Id = $NC.getLocalStorage("_SAVE_USER_ID");
      if (save_User_Id === "Y") {
        $NC.setValue("#chkSave_User_Id", true);
        var user_Id = $NC.getLocalStorage("_USER_ID");
        if (!$NC.isNull(user_Id)) {
          $NC.setValue("#edtUser_Id", user_Id);
          $NC.setFocus("#edtUser_Pwd");
          return;
        }
      }
      $NC.setFocus("#edtUser_Id");
    }
  });
}

/**
 * 로그인 팝업 실행
 * 
 * @param loginType
 *          loginType: "1": 재로그인
 */
function showLoginPopup(loginType) {
  $("#divLoginView").data("loginType", loginType).dialog("open");
  setTimeout(function(){
    if ($('#edtUser_Id').val() === '') {
      $('#edtUser_Id').focus();
    } else {
      $('#edtUser_Pwd').focus();
    }
  }, 500);
}

/**
 * 출력물 목록 값 세팅
 */
function setPrintList(data) {

  var newRows = $.extend(true, [ ], data);
  for ( var row = 0, rowCount = newRows.length; row < rowCount; row++) {
    newRows[row]["id"] = $NC.getGridNewRowId();
  }

  $NC.setInitGridVar(G_GRDPRINTLIST);
  $NC.setInitGridData(G_GRDPRINTLIST, newRows);
}

/**
 * 메인 윈도우에 포커스
 */
function setFocusMain() {
  window.focus();
}

/**
 * 활성화된 화면에 포커스
 */
function setFocusActiveWindow() {

  if (!$NC.isNull($NC.G_VAR.activePopupWindow)) {
    $NC.G_VAR.lastWindow = $NC.G_VAR.activePopupWindow;
    $NC.G_VAR.lastWindow.focus();
  } else if (!$NC.isNull($NC.G_VAR.activeSubWindow)) {
    $NC.G_VAR.lastWindow = $NC.G_VAR.activeSubWindow;
    $NC.G_VAR.lastWindow.focus();
  } else if ($NC.G_VAR.activeWindow) {
    $NC.G_VAR.lastWindow = $NC.G_VAR.activeWindow;
    $NC.G_VAR.lastWindow.focus();
  }
}

/**
 * 메인 윈도우가 스크롤 되어 있을 경우 왼쪽상단이 보이도록 위치 이동
 */
function scrollViewToTop() {

  var divViewport = $("#divViewport").get(0);
  if (divViewport) {
    divViewport.scrollLeft = 0;
    divViewport.scrollTop = 0;
  }
}

/**
 * 프로그램 ID로 프로그램 메뉴에서 선택
 * 
 * @param program_Id
 */
function setActiveProgramMenu(program_Id) {

  G_GRDPROGRAMMENU.view.resetActiveCell();
  // 해당 프로그램 선택 - 선택할 수 있을 경우만
  var rowCnt = G_GRDPROGRAMMENU.data.getLength();
  var rowData;
  for ( var i = 0; i < rowCnt; i++) {
    rowData = G_GRDPROGRAMMENU.data.getItem(i);
    if (program_Id === rowData.PROGRAM_ID) {
      G_GRDPROGRAMMENU.view.setActiveCell(i, 0);
      break;
    }
  }
}

/**
 * ProgramList 보임/숨김
 * 
 * @param rowId
 * @param showYn
 */
function showProgramListMenu(rowId, showYn) {

  var rowData = G_GRDPROGRAMLIST.data.getItemById(rowId);
  rowData.MENU_SHOW_YN = showYn;
  if (showYn == "Y") {
    $NC.hideView("#divProgramList");
    rowData["SORT_ID"] = $NC.getGridNewRowId();

    sortProgramList();
  }
  G_GRDPROGRAMLIST.data.updateItem(rowData.id, rowData);

}

/**
 * 엑셀 다운로드
 * 
 * @param params
 */
function excelFileDownload(params) {

  params["P_USER_ID"] = $NC.G_USERINFO.USER_ID;
  fileDownload("/WC/excelExport.do", params);
}

/**
 * File 업로드 IFrame 초기화
 * 
 * @param initType
 */
function fileFormInitalize(initType) {

  if (initType == 0 || initType == 1) {
    var fileIFrame = $("#fileIFrame");
    fileIFrame.unbind("load");
    fileIFrame.prop("src", "about:blank");
  }

  if (initType == 0 || initType == 2) {
    var fileForm = $("#fileForm");
    var fileInput = $("#P_UPLOAD_FILE");
    if (fileInput.length > 0) {
      fileInput.replaceWith(fileInput = fileInput.clone(true));
    }
    fileForm.empty();
    fileForm.removeAttr("action");
    fileForm.removeAttr("method");
    fileForm.removeAttr("target");
    fileForm.removeAttr("enctype");
  }
}

/**
 * 업로드 File 선택 Dialog
 * 
 * @param onFileSelected
 */
function uploadFileSelect(onFileSelected) {

  fileFormInitalize(0);

  var fileForm = $("#fileForm");
  var fileInput = $("<input/>", {
    id: "P_UPLOAD_FILE",
    type: "file",
    name: "P_UPLOAD_FILE"
  }).appendTo(fileForm);

  fileInput.change(function(e) {
    if ($.isFunction(onFileSelected)) {
      var view = $(e.target);
      var fileFullName = $NC.getValue(view);
      var fileName;
      if (fileFullName.indexOf("/") > -1) {
        fileName = fileFullName.substr(fileFullName.lastIndexOf("/") + 1);
      } else {
        fileName = fileFullName.substr(fileFullName.lastIndexOf("\\") + 1);
      }
      onFileSelected(view, fileFullName, fileName);
    }
  });

  fileInput.trigger("click");
}

/**
 * File 업로드 처리
 * 
 * @param url
 * @param params
 * @param onSuccess
 */
function fileUpload(url, params, onSuccess) {

  $NC.showProgressMessage({
    type: 2,
    message: "파일을 업로드 중 입니다. 잠시만 기다려 주십시오..."
  });
  var fileForm = $("#fileForm");
  var fileIFrame = $("#fileIFrame");

  fileForm.attr({
    method: "post",
    action: url,
    target: "fileIFrame",
    enctype: "multipart/form-data"
  });
  for ( var paramName in params) {
    var paramValue = params[paramName];
    $("<input/>", {
      id: paramName,
      type: "hidden",
      name: paramName,
      value: paramValue
    }).appendTo(fileForm);
  }
  fileForm.submit();
  setTimeout(function() {
    fileFormInitalize(2);
  }, 500);

  if ($.browser.msie && $.browser.versionNumber < 11) {
    fileIFrame[0].onreadystatechange = function() {
      var localFileIFrame = $("#fileIFrame");
      var readyState = localFileIFrame[0].readyState;
      if (readyState != "loading" && readyState != "uninitialized") {
        localFileIFrame[0].onreadystatechange = null;

        $NC.hideProgressMessage();
        var ajaxData = $(localFileIFrame[0].contentDocument.body).css("color", "gray").text();
        if (!$NC.isNull(ajaxData)) {
          try {
            var resultData = $NC.toArray(ajaxData);
            if ($.isArray(resultData) && resultData.length == 0) {
              $NC.onError(ajaxData);
            } else {
              if ((resultData.O_MSG && resultData.O_MSG != "OK")
                  || (resultData.RESULT_CD && resultData.RESULT_CD != "0")
                  || (!resultData.RESULT_CD && resultData.RESULT_DATA && resultData.RESULT_DATA != "OK")) {
                $NC.onError(ajaxData);
              } else {
                if ($.isFunction(onSuccess)) {
                  onSuccess(ajaxData);
                }
              }
            }
          } catch (e) {
            alert(ajaxData);
          }
        }
      }
    };
  } else {
    fileIFrame.bind("load", function() {
      $NC.hideProgressMessage();

      var ajaxData = $($("#fileIFrame")[0].contentDocument.body).css("color", "gray").text();
      if (!$NC.isNull(ajaxData)) {
        try {
          var resultData = $NC.toArray(ajaxData);
          if ($.isArray(resultData) && resultData.length == 0) {
            $NC.onError(ajaxData);
          } else {
            if ((resultData.O_MSG && resultData.O_MSG != "OK") || (resultData.RESULT_CD && resultData.RESULT_CD != "0")
                || (!resultData.RESULT_CD && resultData.RESULT_DATA && resultData.RESULT_DATA != "OK")) {
              $NC.onError(ajaxData);
            } else {
              if ($.isFunction(onSuccess)) {
                onSuccess(ajaxData);
              }
            }
          }
        } catch (e) {
          alert(ajaxData);
        }
      }
    });
  }
}

/**
 * File 다운로드 처리
 * 
 * @param options
 */
function fileDownload(url, params) {

  $NC.showProgressMessage({
    type: 2,
    message: "파일을 다운로드 중 입니다. 잠시만 기다려 주십시오..."
  });

  $.fileDownload(url, {
    parentElement: "#divFileView",
    httpMethod: "POST",
    cookieName: "neXosFileDownload",
    data: params,
    successCallback: function(url) {

      $NC.hideProgressMessage();
    },
    failCallback: function(responseHtml, url) {

      $NC.hideProgressMessage();
      $NC.onError(responseHtml);
    }
  });
}

/**
 * grdProgramMenu 초기화
 */
function grdProgramMenuInitialize() {

  var columns = [{
    id: "PROGRAM_NM",
    field: "PROGRAM_NM",
    name: "프로그램명",
    resizable: false,
    width: $NC.G_OFFSET.currentMenuWidth,
    formatter: function(row, cell, value, columnDef, dataContext) {
      var spacer = "<span style='display: inline-block; height:1px; width:" + (15 * dataContext["indent"])
          + "px'></span>";
      if (dataContext.PROGRAM_DIV === "M") {
        if (dataContext._collapsed) {
          return spacer + " <span class='slick-group-toggle collapsed'></span>&nbsp;" + value;
        } else {
          return spacer + " <span class='slick-group-toggle expanded'></span>&nbsp;" + value;
        }
      } else {
        return spacer + " <span class='slick-group-toggle" + " ui-icon-" + dataContext.PROGRAM_DIV.toLowerCase()
            + "'></span>&nbsp;" + value;
      }
    }
  }];
  
  var options = {
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.PROGRAM_DIV != "M") {
          return "hover";
        }
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdProgramMenu", {
    columns: columns,
    queryId: null,
    sortCol: "PROGRAM_ID",
    canCopyData: false,
    gridOptions: options
  });

  // Grid 클릭 이벤트
  G_GRDPROGRAMMENU.view.onClick.subscribe(grdProgramMenuOnClick);
  // Grid 더블클릭 이벤트
  G_GRDPROGRAMMENU.view.onDblClick.subscribe(grdProgramMenuOnDblClick);

  // Grid 컬럼 헤더 숨김
  $NC.hideGridColumnHeader("#grdProgramMenu");
  // Grid 가로 스크롤바 숨김
  $NC.hideGridHorzScroller("#grdProgramMenu");
}

function grdProgramMenuOnClick(e, args) {

  var rowData = G_GRDPROGRAMMENU.data.getItem(args.row);
  if (rowData) {
    if ($(e.target).hasClass("slick-group-toggle")) {
      // 메뉴
      if (rowData.PROGRAM_DIV === "M") {
        if (!rowData._collapsed) {
          rowData._collapsed = true;
        } else {
          rowData._collapsed = false;
        }

        G_GRDPROGRAMMENU.data.updateItem(rowData.id, rowData);
        G_GRDPROGRAMMENU.view.scrollRowToTop(args.row);
        G_GRDPROGRAMMENU.view.setSelectedRows([args.row]);
        G_GRDPROGRAMMENU.view.setActiveCell(args.row, 0);

        e.stopImmediatePropagation();
        return;
      }
    }
    $NC.setValue("#edtMenuAdd", rowData.PROGRAM_ID);
    showProgramPopup(rowData);
  }
}

function grdProgramMenuOnDblClick(e, args) {
  $NC.setValue("#edtMenuAdd");
  var rowData = G_GRDPROGRAMMENU.data.getItem(args.row);
  
  if (rowData) {
    if ($(e.target).hasClass("slick-cell")) {
      // 메뉴
      if (rowData.PROGRAM_DIV === "M") {
        if (!rowData._collapsed) {
          rowData._collapsed = true;
        } else {
          rowData._collapsed = false;
        }

        G_GRDPROGRAMMENU.data.updateItem(rowData.id, rowData);

        e.stopImmediatePropagation();
        return;
      }
    }
    $NC.setValue("#edtMenuAdd", rowData.PROGRAM_ID);
  }
}

/**
 * grdProgramMenu 데이터 필터링 이벤트
 */
function grdProgramMenuOnFilter(item) {

  if (item.MENU_SHOW_YN === "N") {
    return false;
  }
  if (!$NC.isNull(item.parent)) {
    var rows = G_GRDPROGRAMMENU.data.getItems();
    var parent = rows[G_GRDPROGRAMMENU.data.getIdxById(item.parent)];
    while (!$NC.isNull(parent)) {
      if (parent._collapsed) {
        return false;
      }
      parent = rows[G_GRDPROGRAMMENU.data.getIdxById(parent.parent)];
    }
  }
  return true;
}

/**
 * grdProgramList 초기화
 */
function grdProgramListInitialize() {
  var columns = [{
    id: "PROGRAM_NM_F",
    field: "PROGRAM_NM_F",
    name: "프로그램명",
    width: $NC.G_OFFSET.defaultMenuWidth - 25,
    formatter: function(row, cell, value, columnDef, dataContext) {
      if (dataContext.PROGRAM_DIV === "M") {
        if (dataContext._collapsed) {
          return "<span class='slick-group-toggle collapsed'></span>&nbsp;" + value;
        } else {
          return "<span class='slick-group-toggle expanded'></span>&nbsp;" + value;
        }
      } else {
        return "<span class='slick-group-toggle" + " ui-icon-" + dataContext.PROGRAM_DIV.toLowerCase()
            + "'></span>&nbsp;" + value;
      }
    }
  },
  {
    id: "PROGRAM_CLOSE",
    field: "PROGRAM_CLOSE",
    maxWidth: 30,
    minWidth: 30,
    formatter: function(row, cell, value, columnDef, dataContext) {
      return "<span style='min-width: 22px; min-height: 20px; cursor: pointer; text-align: center; font-size: 10px; text-shadow: 0 1px 1px rgba(0, 0, 0, .2); font-weight: bold; display: block;'>X</span>";
    }
  }];

  var options = {
    specialRow: {
      compareFn: "return 'hover';"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdProgramList", {
    columns: columns,
    queryId: null,
    sortCol: "PROGRAM_ID",
    gridOptions: options,
    canCopyData: false,
    onSortCompare: function(item1, item2) {
      var x = item1[G_GRDPROGRAMLIST.sortCol], y = item2[G_GRDPROGRAMLIST.sortCol];
      return (x == y ? 0 : (x > y ? 1 : -1));
    }
  });

  // Grid 클릭 이벤트
  // cell, grid, row
  G_GRDPROGRAMLIST.view.onClick.subscribe(grdProgramListOnClick);

  // Grid 컬럼 헤더 숨김
  $NC.hideGridColumnHeader("#grdProgramList");
  // Grid 가로 스크롤바 숨김
  $NC.hideGridHorzScroller("#grdProgramList");
}


/**
 * grdProgramList 초기화
 */
function grdProgramBookMarkInitialize() {
  var columns = [{
      id: "PROGRAM_NM_F",
      field: "PROGRAM_NM_F",
      name: "프로그램명",
      width: $NC.G_OFFSET.defaultMenuWidth - 25,
      formatter: function(row, cell, value, columnDef, dataContext) {
        if (dataContext.PROGRAM_DIV === "M") {
          if (dataContext._collapsed) {
            return "<span class='slick-group-toggle collapsed'></span>&nbsp;" + value;
          } else {
            return "<span class='slick-group-toggle expanded'></span>&nbsp;" + value;
          }
        } else {
          return "<span class='slick-group-toggle" + " ui-icon-" + dataContext.PROGRAM_DIV.toLowerCase()
              + "'></span>&nbsp;" + value;
        }
      }
    },
    {
      id: "PROGRAM_CLOSE",
      field: "PROGRAM_CLOSE",
      maxWidth: 30,
      minWidth: 30,
      
      formatter: function(row, cell, value, columnDef, dataContext) {
        return "<span style='min-width: 22px; min-height: 20px; cursor: pointer; text-align: center; font-size: 10px; text-shadow: 0 1px 1px rgba(0, 0, 0, .2); font-weight: bold; display: block;'>X</span>";
      }
    }
   /*
    {
      id: "CHECK_YN",
      field: "CHECK_YN",
      maxWidth: 30,
      minWidth: 30,
      sortable: false,
      cssClass: "align-center",
      formatter: Slick.Formatters.CheckBox,
      editor: Slick.Editors.CheckBox,
      editorOptions: {
        valueChecked: "Y",
        valueUnChecked: "N"
      }
    }
    */
    ];

  var options = {
    specialRow: {
      compareFn: "return 'hover';"
    }
  };
  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdProgramBookMark", {
    columns: columns,
    queryId: null,
    sortCol: "PROGRAM_ID",
    gridOptions: options,
    canCopyData: false,
    onSortCompare: function(item1, item2) {
      var x = item1[G_GRDPROGRAMBOOKMARK.sortCol], y = item2[G_GRDPROGRAMBOOKMARK.sortCol];
      return (x == y ? 0 : (x > y ? 1 : -1));
    }
  });

  // Grid 클릭 이벤트
  // cell, grid, row
  G_GRDPROGRAMBOOKMARK.view.onClick.subscribe(grdProgramBookMarkOnClick);

  // Grid 컬럼 헤더 숨김
  $NC.hideGridColumnHeader("#grdProgramBookMark");
  // Grid 가로 스크롤바 숨김
  $NC.hideGridHorzScroller("#grdProgramBookMark");
}



function grdProgramListOnClick(e, args) {

  var rowData = G_GRDPROGRAMLIST.data.getItem(args.row);
  if (args.cell == 0) {
    $NC.hideView("#divProgramList", null, 300);
    showProgramPopup(rowData);
  } else {
    var winIndex = getWindowIndex(rowData.PROGRAM_ID);
    if (winIndex > -1) {
      clearTimeout($NC.G_VAR.onProgramListTimeout);
      G_GRDPROGRAMLIST.view.focus();
      removeChildWindow($NC.G_VAR.windows[winIndex]);
    }
  }
}

/**
 * 즐겨찾기 이벤트 리스너
 */
function grdProgramBookMarkOnClick(e, args) {
  var rowData = G_GRDPROGRAMBOOKMARK.data.getItem(args.row);
  if (args.cell == 0) {
    $NC.hideView("#divProgramBookMark", null, 300);
    $NC.setValue("#edtMenuAdd", rowData.PROGRAM_ID);
    showProgramPopup(rowData);
  } else {
    // 삭제
    if (confirm('즐겨찾기에서 삭제하겠습니까?')) {
      G_GRDPROGRAMBOOKMARK.data.deleteItem(rowData.id)
      $NC.serviceCall("/WC/deleteUserBookMark.do", {
        P_USER_ID: $NC.G_USERINFO['USER_ID'],
        P_PROGRAM_ID: rowData['PROGRAM_ID']
      }, onDeleteBookMark);
    }
  }
}

/**
 * grdProgramList 데이터 필터링 이벤트
 */
function grdProgramListOnFilter(item) {
  if (item.MENU_SHOW_YN === "N") {
    return false;
  }
  return true;
}

/**
 * grdPrintList 초기화
 */
function grdPrintListInitialize() {

  var columns = [{
    id: "PRINT_COMMENT",
    field: "PRINT_COMMENT",
    name: "출력물명",
    minWidth: 180,
    cssClass: "print",
    formatter: function(row, cell, value, columnDef, dataContext) {
      return "<span class='slick-group-toggle ui-icon-r'></span>&nbsp;" + value;
    }
  }];

  var options = {
    specialRow: {
      compareFn: "return 'hover';"
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdPrintList", {
    columns: columns,
    queryId: null,
    sortCol: "PRINT_COMMENT",
    gridOptions: options,
    canCopyData: false
  });

  // Grid 클릭 이벤트
  // cell, grid, row
  G_GRDPRINTLIST.view.onClick.subscribe(grdPrintListOnClick);

  // Grid 컬럼 헤더 숨김
  $NC.hideGridColumnHeader("#grdPrintList");
  // Grid 가로 스크롤바 숨김
  $NC.hideGridHorzScroller("#grdPrintList");
}

function grdPrintListOnClick(e, args) {

  G_GRDPRINTLIST.lastRow = args.row;
  $NC.hideView("#divPrintList", null, 300);
  _Print();
}

/**
 * 로그인 성공시 호출되는 이벤트
 * 
 * @param ajaxData
 */
function onGetLogin(ajaxData) {

  $NC.setValue("#edtUser_Id");
  $NC.setValue("#edtUser_Pwd");

  $NC.G_USERINFO = $NC.toArray(ajaxData);

  if ($NC.G_USERINFO['RESULT_DATA'] == '') {
    showLoginPopup(0);
    return false;
  }
  $("#btnTopUserName").val(
      $NC.G_USERINFO.USER_NM.length < 5 ? $NC.G_USERINFO.USER_NM : $NC.G_USERINFO.USER_NM.substr(0, 3) + "...").prop(
      "title",
      $NC.G_USERINFO.USER_ID + " - " + $NC.G_USERINFO.USER_NM + "\n" + $NC.G_USERINFO.LOGIN_DATETIME
          + " 접속\n\n사용자 비밀번호를 변경하려면 버튼을 클릭하십시오.");

  var loginDialog = $("#divLoginView");
  var loginType = loginDialog.data("loginType");

  if ($NC.getLocalStorage("_PIN_MENU") == "Y") {
    $("#btnPinMenu").addClass("ui-clr-selected");
  }

  loginDialog.removeData("loginType");
  loginDialog.dialog("close");

  // 비밀번호 변경 3개월 초과시 비밀번호 변경 팝업 호출
  var passDiv = $NC.G_USERINFO['PASS_DIV']
    ,pass_reference = $NC.G_USERINFO['PASS_ITEM_REFERENCE'] * -1
    ,diffMonth = $NC.getDiffDate($NC.G_USERINFO['PASS_CHANGED'], passDiv);

  if ($NC.G_USERINFO['DEFAULT_PW'] === 'Y') {
    var msg = '초기 부여된 비밀번호는 사용할수 없습니다. 변경해주세요.';
    alert(msg);
    changePwPopup();
    return false;
  }
  if (diffMonth < pass_reference) {
    var msg = '비밀번호를 변경해 주세요.(마지막 비밀번호 변경이 ' + Math.abs(pass_reference) + $NC.getPassDivString(passDiv) + ' 초과됨)';
    alert(msg);
    changePwPopup();
    return false;
  }

  if (loginType != 1) {
    showMenu(true);
  }

  loadUserProgramMenu();

  if ($NC.getValue("#chkSave_User_Id") === "Y") {
    $NC.setLocalStorage("_SAVE_USER_ID", "Y");
    $NC.setLocalStorage("_USER_ID", $NC.G_USERINFO.USER_ID);
  } else {
    $NC.setLocalStorage("_SAVE_USER_ID", "N");
    $NC.setLocalStorage("_USER_ID", null);
  }

  if (loginType == 1) {
    setFocusActiveWindow();
  } else {
    $NC.serviceCall("/WC/getDataSet.do", {
      P_QUERY_ID: "WC.GET_CSMSG",
      P_QUERY_PARAMS: $NC.getParams({
        P_SYS_LANG: $NC.G_USERINFO.SYS_LANG
      })
    }, function(ajaxData) {
      onGetMsg(ajaxData);

      $NC.serviceCall("/WC/getDataSet.do", {
        P_QUERY_ID: "WC.POP_CSNOTICE",
        P_QUERY_PARAMS: $NC.getParams({
          P_USER_ID: $NC.G_USERINFO.USER_ID
        })
      }, onGetNotice);
    });
  }
  loadUserProgramBookMark();
  sessionInit();
}

function changePwPopup() {
  showProgramSubPopup({
    PROGRAM_ID: "CS01030P",
    PROGRAM_NM: "사용자 비밀번호 변경",
    url: "cs/CS01030P.html",
    width: 320,
    height: 210,
    onOk: function() {
      alert('비밀번호가 변경되었습니다. 다시 로그인해주세요.')
      location.reload();
    },
    onCancel: function() {
      location.reload();
    }
  });
}

/**
 * 로그인 오류시 호출되는 이벤트
 * 
 * @param ajaxData
 */
function onGetLoginError(ajaxData) {

  $NC.G_USERINFO = null;
  $NC.onError(ajaxData);
  $("#divLoginView").removeData("loginType");
  $NC.setFocus("#edtUser_Pwd");
}

/**
 * 로그아웃 성공시 호출되는 이벤트
 * 
 * @param ajaxData
 */
function onGetLogout(ajaxData) {

  window.location.replace("/");
}

/**
 * 세션처리
 * 창 새로고침, 자동 로그아웃 처리
 */
function sessionInit() {
  /**
   * 창닫기, 새로고침시 로그아웃 처리함
   */
  /*$(window).bind('beforeunload', function(e) { 
    if($NC.G_USERINFO) {
      setTimeout(function(){
        if($NC.G_USERINFO) {
           $NC.G_USERINFO = null;
          location.reload();
        }
      }, 100)
      $NC.serviceCall("/WC/getLogout.do", {
        P_USER_ID: $NC.G_USERINFO.USER_ID
      });
      return "로그아웃 되었습니다.";
    }
  });*/

  /**
   * 일정기간 이벤트가 없을시 로그아웃 처리
   */
  var keepLoginWindow = [
      'LOM9070E',
      'LOM7010E',
      'LOM7020E',
      'LOM7030E',
      'LOM7040E',
      'LOM7050E',
      'LOM0930E',
      'RO04050E'
      ]
    //,ssTime = $NC.G_CONSTS.SCREENSAVER_TIME
    ,ssTime = $NC.G_USERINFO['SESSION_ITEM_REFERENCE'] * 60
    ,limitTime = $NC.G_CONSTS.SCREENSAVER_ALERT
    ,g = $NC.G_VAR
    ,keepLogin = false;

  g.screenSaverTime = ssTime;
  clearInterval(g.onScreenSaverInterval);
  g.onScreenSaverInterval = setInterval(function(){
    if ($NC.G_VAR.activeWindow) {
      var windowId = $NC.G_VAR.activeWindow.get("userData").PROGRAM_ID;
      for (var i in keepLoginWindow) {
        if (windowId == keepLoginWindow[i]) {
          keepLogin = true;
          break;
        }
        keepLogin = false;
      }
    }
    if (keepLogin) {
      return false;
    }
    if($NC.G_USERINFO) {
      var ssTime = g.screenSaverTime;
      //$('#divMessagePopupView').text(ssTime + "초 뒤에 로그아웃 됩니다.");
      //console.log(ssTime + "초 뒤에 로그아웃 됩니다.");
      ssTime--;
      if (ssTime === limitTime) {
        $NC.showMessage({
          title: "곧 로그아웃 됩니다.",
          message: limitTime + '초 뒤에 로그아웃 됩니다.',
          buttons: {
            '로그인 연장': function(){
              $(window).on('mousemove', resetScreenSaver);
              $(window).on('keyup', resetScreenSaver);
              ssTime = $NC.G_CONSTS.SCREENSAVER_TIME;
            },
            '로그아웃': function(){
              logout();
            }
          }
        });
        $(window).off('mousemove', resetScreenSaver);
        $(window).off('keyup', resetScreenSaver);
      }
      if (ssTime === 0) {
        logout();
      }
      g.screenSaverTime = ssTime;
    }
  
  }, 1000)

  $(window).on('mousemove', resetScreenSaver);
  $(window).on('keyup', resetScreenSaver);
  function resetScreenSaver() {
    g.screenSaverTime = ssTime;
  }
  function logout() {
    clearInterval(g.onScreenSaverInterval);
    $NC.serviceCall("/WC/getLogout.do", {
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }, onGetLogout);
    $NC.G_USERINFO = null;
    alert('자동로그 아웃 되었습니다.\n다시 로그인 해주세요.');
  }
}

/**
 * 사용자 메뉴 가져오기 성공시 호출되는 이벤트
 * 
 * @param ajaxData
 */
function onGetUserProgramMenu(ajaxData) {

  $NC.setInitGridData(G_GRDPROGRAMMENU, ajaxData, grdProgramMenuOnFilter);

  // 실행프로그램 목록 초기화
  var programMenuRows = $NC.toArray(ajaxData);
  for ( var row = 0, rowCount = programMenuRows.length; row < rowCount; row++) {
    programMenuRows[row].MENU_SHOW_YN = "N";
    programMenuRows[row]["PROGRAM_NM_F"] = programMenuRows[row].PROGRAM_NM + " (" + programMenuRows[row].PROGRAM_ID
        + ")";
    for ( var idx = 0, winCount = $NC.G_VAR.windows.length; idx < winCount; idx++) {
      if ("div" + programMenuRows[row].PROGRAM_ID == $NC.G_VAR.windows[idx].get("id")) {
        programMenuRows[row].MENU_SHOW_YN = "Y";
        programMenuRows[row]["SORT_ID"] = "id_new_" + new Date().getTime() + (10000 + idx + 1);
        break;
      }
    }
  }
  $NC.setInitGridData(G_GRDPROGRAMLIST, programMenuRows, grdProgramListOnFilter);
  if (programMenuRows.length > 0) {
    sortProgramList();
  }
}

/**
 * 사용자 메뉴 가져오기 성공시 호출되는 이벤트
 * 
 * @param ajaxData
 */
function onGetUserProgramBookMark(ajaxData) {
  $NC.setInitGridData(G_GRDPROGRAMBOOKMARK, ajaxData);
  // 실행프로그램 목록 초기화
  var programBookMarkRows = $NC.toArray(ajaxData);
  for ( var row = 0, rowCount = programBookMarkRows.length; row < rowCount; row++) {
    var programIndex = $NC.getGridSearchRow(G_GRDPROGRAMMENU, {
      searchKey: "PROGRAM_ID",
      searchVal: programBookMarkRows[row].PROGRAM_ID,
      isAllData: true
    });
    
    G_GRDPROGRAMMENU.data.getItemByIdx(programIndex).FAVORITE_YN = 'Y';
    programBookMarkRows[row].id = G_GRDPROGRAMMENU.data.getItemByIdx(programIndex).id;
    programBookMarkRows[row].FAVORITE_YN = "N";
    programBookMarkRows[row]["PROGRAM_NM_F"] = programBookMarkRows[row].PROGRAM_NM + " ("
        + programBookMarkRows[row].PROGRAM_ID + ")";
    programBookMarkRows[row].FAVORITE_YN = "Y";
    programBookMarkRows[row]["SORT_ID"] = "id_new_" + new Date().getTime() + (10000 + row + 1);
  }
  $NC.setInitGridData(G_GRDPROGRAMBOOKMARK, programBookMarkRows);
}

/**
 * 사용자 메시지 정보
 * 
 * @param ajaxData
 */
function onGetMsg(ajaxData) {

  var resultRows = $NC.toArray(ajaxData);
  if (resultRows && resultRows.length == 0) {
    return;
  }

  delete $NC.G_MSG;
  $NC.G_MSG = {};
  var resultData = null;
  for ( var i = 0, count = resultRows.length; i < count; i++) {
    resultData = resultRows[i];
    var PARENT_MSG = $NC.G_MSG[resultData.MSG_ID];
    if ($NC.isNull(PARENT_MSG)) {
      PARENT_MSG = $NC.G_MSG[resultData.MSG_ID] = {};
    }
    var MSG = PARENT_MSG[resultData.MSG_GRP] = {};
    MSG["MSG_NM"] = resultData.MSG_NM;
    MSG["DISPLAY_YN"] = resultData.DISPLAY_YN;
  }
}

/**
 * 공지사항 팝업 표시
 * 
 * @param ajaxData
 */
function onGetNotice(ajaxData) {

  var resultRows = $NC.toArray(ajaxData);
  if (resultRows && resultRows.length == 0) {
    return;
  }

  showProgramSubPopup({
    PROGRAM_ID: "NOTICEPOPUP",
    PROGRAM_NM: "공지사항",
    url: "popup/noticepopup.html",
    width: 700,
    height: 450,
    userData: {
      P_NITICE_DS: resultRows
    }
  });
}

/**
 * 실행 프로그램 목록 정렬
 */
function sortProgramList() {
  var activeCell = G_GRDPROGRAMLIST.view.getActiveCell();
  var rowData;
  if (activeCell) {
    rowData = G_GRDPROGRAMLIST.data.getItem(activeCell.row);
  }
  var sort = $NC.getValue("#cboProgramListSortDir");
  if (sort == "1") {
    G_GRDPROGRAMLIST.sortCol = "PROGRAM_ID";
    G_GRDPROGRAMLIST.data.sort(G_GRDPROGRAMLIST.onSortCompare, true);
  } else {
    G_GRDPROGRAMLIST.sortCol = "SORT_ID";
    G_GRDPROGRAMLIST.data.sort(G_GRDPROGRAMLIST.onSortCompare, sort == "2");
  }
  if (rowData) {
    $NC.setGridSelectRow(G_GRDPROGRAMLIST, {
      selectKey: "PROGRAM_ID",
      selectVal: rowData.PROGRAM_ID
    });
  }
}

/**
 * 즐겨찾기 목록 정렬
 */
function sortProgramBookMarkList() {
  var activeCell = G_GRDPROGRAMBOOKMARK.view.getActiveCell();
  var rowData;
  if (activeCell) {
    rowData = G_GRDPROGRAMBOOKMARK.data.getItem(activeCell.row);
  }
  var sort = $NC.getValue("#cboProgramBookMarkSortDir");
  if (sort == "1") {
    G_GRDPROGRAMBOOKMARK.sortCol = "PROGRAM_ID";
    G_GRDPROGRAMBOOKMARK.data.sort(G_GRDPROGRAMBOOKMARK.onSortCompare, true);
  } else {
    G_GRDPROGRAMBOOKMARK.sortCol = "SORT_ID";
    G_GRDPROGRAMBOOKMARK.data.sort(G_GRDPROGRAMBOOKMARK.onSortCompare, sort == "2");
  }
  if (rowData) {
    $NC.setGridSelectRow(G_GRDPROGRAMBOOKMARK, {
      selectKey: "PROGRAM_ID",
      selectVal: rowData.PROGRAM_ID
    });
  }
}

function copyGridDataOverlayInitialize() {

  $("#divCopyGridDataView").draggable({
    containment: "#divProgramView",
    scroll: false
  });
  var edtCopyGridData = $("#edtCopyGridData");

  edtCopyGridData.blur(function(e) {
    $NC.G_VAR.G_COPYINFO.onCopyDataTimeout = setTimeout(hideCopyGridData, 1000);
  });

  $("#chkCopyOption").focus(function(e) {
    clearTimeout($NC.G_VAR.G_COPYINFO.onCopyDataTimeout);
  }).bind("click blur", function(e) {
    edtCopyGridData.focus();
  }).change(function(e) {
    $NC.G_VAR.G_COPYINFO.lastSearchVal = "";
    $NC.G_VAR.G_COPYINFO.lastSearchIndex = -1;
  });

  edtCopyGridData.keydown(function(e) {
    if (e.keyCode == 13) {
      e.preventDefault();
    } else if ((e.ctrlKey === true && (e.keyCode == 67 || e.keyCode == 88)) || e.keyCode == 27) {
      hideCopyGridData.call(this);
    }
  }).keyup(
      function(e) {
        if (e.keyCode != 13) {
          e.preventDefault();
          return;
        }

        if ($NC.G_VAR.G_COPYINFO.columnField == "%") {
          hideCopyGridData.call(this);
          return;
        }

        if ($NC.G_VAR.activeWindow == null || $NC.isNull($NC.G_VAR.G_COPYINFO.targetGrid)) {
          alert("검색할 그리드가 지정되지 않았습니다.");
          return;
        }

        var searchVal = $NC.getValue("#edtCopyGridData");
        if ($NC.isNull(searchVal)) {
          alert("검색할 값을 입력하십시오.");
          return;
        }
        var isFirst = false;
        if (searchVal != $NC.G_VAR.G_COPYINFO.lastSearchVal) {
          $NC.G_VAR.G_COPYINFO.lastSearchIndex = -1;
          $NC.G_VAR.G_COPYINFO.lastSearchVal = searchVal;
          isFirst = true;
        }

        if ($NC.G_VAR.G_COPYINFO.lastSearchIndex > -1) {
          $NC.G_VAR.G_COPYINFO.lastSearchIndex += 1;
        }
        var isWhole = $NC.getValue("#chkCopyOption") == "Y";

        var viewWindow = getChildContentWindow($NC.G_VAR.activeWindow);
        var grdObject = "G_" + $NC.G_VAR.G_COPYINFO.targetGrid.toUpperCase();

        var searchIndex = $NC.getGridSearchRow(viewWindow[grdObject], {
          compareFn: function(rowData) {
            var targetVal = $NC.nullToDefault(rowData[$NC.G_VAR.G_COPYINFO.columnField], "");
            return isWhole ? searchVal == targetVal : targetVal.indexOf(searchVal) > -1;
          },
          startIndex: $NC.G_VAR.G_COPYINFO.lastSearchIndex
        });

        if (searchIndex == -1) {
          if (isFirst) {
            alert("해당 값이 존재하지 않습니다.");
            $NC.G_VAR.G_COPYINFO.lastSearchVal = "";
          } else {
            alert("해당 값이 더이상 존재하지 않습니다.");
          }
          $NC.G_VAR.G_COPYINFO.lastSearchIndex = -1;
        } else {
          $NC.setGridSelectRow(viewWindow[grdObject], searchIndex);

          $NC.setValue("#divCopyGridDataColumn", $NC.G_VAR.G_COPYINFO.columnName + " (" + (searchIndex + 1) + "/"
              + $NC.G_VAR.G_COPYINFO.rowCount + ")");
          $NC.G_VAR.G_COPYINFO.lastSearchIndex = searchIndex;
        }
      });
}

function showCopyGridData(selector, column, rowData, isAll, rowNum, rowCount) {
  var colData = "";
  var view = $NC.getView("#edtCopyGridData");
  if (isAll) {
    view.css({
      "min-height": 32,
      "max-height": 32
    });
    $NC.setValue("#divCopyGridDataColumn", "전체항목 (" + (rowNum + 1) + "/" + rowCount + ")");
    var colName = "";
    var colVal = "";
    var replaceData;
    if (rowData.__group) {
      replaceData = $NC.getGridItemFromGroup(rowData, getChildContentWindow($NC.G_VAR.activeWindow)["G_"
          + selector.toUpperCase()]);
    } else {
      replaceData = rowData;
    }
    for ( var field in replaceData) {
      if ($NC.isNull(field) || field == "id" || field == "CRUD") {
        continue;
      }
      colName += "\t" + field;
      colVal += "\t" + ($NC.isNull(replaceData[field]) ? "" : replaceData[field]);
    }
    colData = colName.substr(1) + "\n" + colVal.substr(1);

    $("#divCopyComments").html("데이터 복사: 값 선택 후 [Ctrl+C] 키 입력");
    $NC.G_VAR.G_COPYINFO.columnField = "%";
    $NC.G_VAR.G_COPYINFO.columnName = "전체";
  } else {
    view.css({
      "min-height": 16,
      "max-height": 16
    });
    $NC.setValue("#divCopyGridDataColumn", column.name + " (" + (rowNum + 1) + "/" + rowCount + ")");
    if (rowData.__group) {
      var replaceData = $NC.getGridItemFromGroup(rowData, getChildContentWindow($NC.G_VAR.activeWindow)["G_"
          + selector.toUpperCase()]);
      colData = replaceData[column.field];
    } else {
      colData = rowData[column.field];
    }

    $("#divCopyComments").html("데이터 검색: 검색할 값 입력 후 [Enter] 키 입력<br>데이터 복사: 값 선택 후 [Ctrl+C] 키 입력");

    $NC.G_VAR.G_COPYINFO.columnField = column.field;
    $NC.G_VAR.G_COPYINFO.columnName = column.name;
  }

  $NC.G_VAR.G_COPYINFO.targetGrid = selector;
  $NC.G_VAR.G_COPYINFO.rowCount = rowCount;

  $NC.setValue(view, colData);
  $("#divCopyGridDataView").css({
    "top": Math.ceil(($(window).height() - 60) / 2),
    "left": Math.ceil(($(window).width() - 300) / 2)
  }).show(100, function() {
    $NC.setFocus(view);
    view.select();
  });
}

function hideCopyGridData() {

  clearTimeout($NC.G_VAR.G_COPYINFO.onCopyDataTimeout);

  $NC.G_VAR.G_COPYINFO.targetGrid = "";
  $NC.G_VAR.G_COPYINFO.columnField = "";
  $NC.G_VAR.G_COPYINFO.columnName = "";
  $NC.G_VAR.G_COPYINFO.rowCount = 0;
  $NC.G_VAR.G_COPYINFO.lastSearchVal = "";
  $NC.G_VAR.G_COPYINFO.lastSearchIndex = -1;

  $NC.hideView("#divCopyGridDataView");
};

/**
 * hash를 읽어와서 마지막 페이지를 로드한다.
 */
function hashLoad() {
  if (typeof G_GRDPROGRAMLIST !== 'object') {
    return false;
  }
  var hash = window.location.hash.replace('#', '')
    ,programs = G_GRDPROGRAMLIST.data.getItems()
  for (var i in programs) {
    if (hash === programs[i].WEB_URL) {
      $NC.setValue("#edtMenuAdd", programs[i].PROGRAM_ID);
      showProgramPopup(programs[i]);
      return false;
    }
  }
  window.location.hash = '';
}

/**
 * 자동 출력
 * 
 * @param options
 *          printParams: [{<br>
 *          reportDoc: Report 파일<br>
 *          queryId: 쿼리ID<br>
 *          queryParams: 쿼리 파라메터<br>
 *          checkedValue: 선택 값<br>
 *          printerName: 출력 프린터명, PRINT_LABEL_IN, PRINT_LABEL_OUT, PRINT_BILL_IN, PRINT_BILL_OUT<br>
 *          silentPrinterName: 자동 출력 프린터명<br>
 *          internalQueryYn: Report 내부 쿼리 사용여부, 기본값 "N"<br>
 *          printCopy: 출력매수, 기본값 1<br>
 *          iFrameNo: 출력 iFrame 번호, 1 or 2, 기본값 1<br> ], ...},<br>
 *          onAfterPrint: 출력 후 호출할 Function
 */
function silentPrint(options) {

  if ($NC.isNull(options) || !Array.isArray(options.printParams)) {
    return;
  }

  new Nexos.SilentPrint(options);
}

(function($, window) {

  $.extend(true, window, {
    Nexos: {
      SilentPrint: NexosSilentPrint
    }
  });

  /**
   * Nexos 자동출력 Function Class<br>
   * 
   * @class NexosSilentPrint
   * @constructor
   * @returns {Object}
   */
  function NexosSilentPrint(options) {

    var settings = {
      checkInterval: 500,
      reportFramePrefix: "reportIFrame",
      reportFormPrefix: "reportForm",
      cookieNamePrefix: "neXosSilentPrint",
      cookieValue: "true",
      cookiePath: "/",
      printParams: [ ],
      printIndex: 0,
      printCount: 0,
      onAfterPrint: null,
      internalCallback: null
    };

    function getPrintParams(printParams) {
      var params = {
        P_REPORT_FILE: printParams.reportDoc,
        P_QUERY_ID: printParams.queryId,
        P_QUERY_PARAMS: "",
        P_CHECKED_VALUE: "",
        P_PRINTER_NM: "",
        P_SILENT_PRINTER_NM: "",
        P_INTERNAL_QUERY_YN: "N",
        P_PRINT_COPY: 1,
        P_CHECKED_VALUE: "",
        P_OTHER_TEMPO: "",
        P_SILENT_PRINT_YN: "Y"
      };

      if (!$NC.isNull(printParams.checkedValue)) {
        params.P_CHECKED_VALUE = printParams.checkedValue;
      }

      if (!$NC.isNull(printParams.otherTempo)) {
        params.P_OTHER_TEMPO = printParams.otherTempo;
      }

      if (!$NC.isNull(printParams.printerName)) {
        params.P_PRINTER_NM = printParams.printerName;
      }

      if (!$NC.isNull(printParams.silentPrinterName)) {
        params.P_SILENT_PRINTER_NM = printParams.silentPrinterName;
      }

      if (!$NC.isNull(printParams.queryParams)) {
        params.P_QUERY_PARAMS = $NC.getParams(printParams.queryParams);
      }

      if (!$NC.isNull(printParams.internalQueryYn)) {
        params.P_INTERNAL_QUERY_YN = printParams.internalQueryYn;
      }

      if (!$NC.isNull(printParams.printCopy)) {
        params.P_PRINT_COPY = printParams.printCopy;
      }

      if (!$NC.isNull(printParams.iFrameNo)) {
        params.P_IFRAME_NO = printParams.iFrameNo;
      } else {
        params.P_IFRAME_NO = 1;
      }
      params.P_COOKIE_NM = settings.cookieNamePrefix + params.P_IFRAME_NO;

      params.P_USER_ID = $NC.G_USERINFO.USER_ID;
      params.P_USER_NM = $NC.G_USERINFO.USER_NM;

      params.P_PRINT_LI_BILL = $NC.G_USERINFO.PRINT_LI_BILL;
      params.P_PRINT_LO_BILL = $NC.G_USERINFO.PRINT_LO_BILL;
      params.P_PRINT_RI_BILL = $NC.G_USERINFO.PRINT_RI_BILL;
      params.P_PRINT_RO_BILL = $NC.G_USERINFO.PRINT_RO_BILL;
      params.P_PRINT_LO_BOX = $NC.G_USERINFO.PRINT_LO_BOX;
      params.P_PRINT_WB_NO = $NC.G_USERINFO.PRINT_WB_NO;
      params.P_PRINT_CARD = $NC.G_USERINFO.PRINT_CARD;
      params.P_PRINT_SHIP_ID = $NC.G_USERINFO.PRINT_SHIP_ID;
      params.P_PRINT_LOCATION_ID = $NC.G_USERINFO.PRINT_LOCATION_ID;
      params.P_PRINT_INBOUND_SEQ = $NC.G_USERINFO.PRINT_INBOUND_SEQ;

      return $NC.getParams(params, false);
    }

    function print() {

      var params = settings.printParams[settings.printIndex];
      var targetIFrame = settings.reportFramePrefix + params.P_IFRAME_NO;
      var reportForm = $("#" + settings.reportFormPrefix + params.P_IFRAME_NO);

      reportForm.empty().attr({
        method: "post",
        action: "/report.do",
        target: targetIFrame
      });
      for ( var paramName in params) {
        var paramValue = params[paramName];
        $("<input/>", {
          id: paramName,
          type: "hidden",
          name: paramName,
          value: paramValue
        }).appendTo(reportForm);
      }
      reportForm.submit();

      setTimeout(checkPrintComplete, settings.checkInterval);
    }

    function getIFrameDocument(selector) {

      var iframe = $NC.getView(selector);
      var iframeDoc = iframe[0].contentWindow || iframe[0].contentDocument;
      if (iframeDoc.document) {
        iframeDoc = iframeDoc.document;
      }
      return iframeDoc;
    }

    function checkPrintComplete() {

      var cookieName = settings.printParams[settings.printIndex].P_COOKIE_NM;
      var container = settings.reportFramePrefix + settings.printParams[settings.printIndex].P_IFRAME_NO;
      if (document.cookie.indexOf(cookieName + "=" + settings.cookieValue) != -1) {
        document.cookie = cookieName + "=; expires=" + new Date(1000).toUTCString() + "; path=" + settings.cookiePath;
        setTimeout(function() {
          settings.internalCallback();
        }, 1000);
        return;
      }

      try {
        var formDoc = getIFrameDocument(container);

        if (formDoc && formDoc.body != null && formDoc.body.innerHTML.length) {

          var isFailure = true;
          var $contents = null;

          $contents = $(formDoc.body).contents().filter("embed,object");

          try {
            if ($contents.length && $contents[0].type === "application/pdf") {
              isFailure = false;
            }
          } catch (e) {
            if (e && e.number == -2146828218) {
              // IE 8-10 throw a permission denied after the form reloads
              // comparison
              isFailure = true;
            } else {
              throw e;
            }
          }

          if (isFailure) {
            // IE 8-10 don't always have the full content available right away, they need a litle bit to finish
            setTimeout(function() {
              showMessage("자동출력 중 오류가 발생했습니다.");
              settings.internalCallback();
            }, 100);

            return;
          }
        }
      } catch (err) {
        // 500 error less than IE9
        showMessage("자동출력 중 오류가 발생했습니다.\n\n" + err);
        settings.internalCallback();
        return;
      }

      // keep checking...
      setTimeout(checkPrintComplete, settings.checkInterval);
    }

    function init() {

      $NC.showPrintingMessage();

      if (options.onAfterPrint) {
        settings.onAfterPrint = options.onAfterPrint;
      }

      settings.printCount = options.printParams.length;
      for ( var i = 0; i < settings.printCount; i++) {
        settings.printParams.push(getPrintParams(options.printParams[i]));
      }

      settings.internalCallback = function() {
        // cleanUp();
        settings.printIndex++;
        if (settings.printIndex < settings.printCount) {
          setTimeout(function() {
            print();
          }, 100);
          return;
        }

        if (settings.onAfterPrint) {
          $NC.hidePrintingMessage();
          setTimeout(function() {
            window.setFocusActiveWindow();
            settings.onAfterPrint();
          }, 1500);
        } else {
          window.setFocusActiveWindow();
        }
      };

      print();
    }

    function cleanUp() {

      var container = settings.reportFramePrefix + settings.printParams[settings.printIndex].P_IFRAME_NO;
      try {
        var formDoc = getIFrameDocument(container);

        if (formDoc && formDoc.body != null && formDoc.body.innerHTML.length) {
          while (formDoc.body.firstChild) {
            formDoc.body.removeChild(formDoc.body.firstChild);
          }
        }
      } catch (err) {
        // 500 error less than IE9
      }
    }

    init();
  }
})(jQuery, window);