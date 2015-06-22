/**
 * Security Branch
 * 공통 Function Object
 * 
 * @since 5.0
 */


(function($) {

  $.extend(true, window, {
    Nexos: {
      Common: NexosCommon
    }
  });

  /**
   * Nexos WMS 공통 Function Class<br>
   * 
   * @class NexosCommon
   * @constructor
   * @returns {Object}
   */
  function NexosCommon(options) {

    // -----------------------------------------------------------------------------------------------------------------
    // Global Variable
    // TODO: Global Variable
    // -----------------------------------------------------------------------------------------------------------------
    var $NC = this;

    // -----------------------------------------------------------------------------------------------------------------
    // Public Property
    // TODO: Public Property
    // -----------------------------------------------------------------------------------------------------------------
    $NC.G_MAIN = null;
    $NC.G_MSG = {};
    $NC.G_JWINDOW = null;
    $NC.G_VAR = {};
    $NC.G_OFFSET = {};
    $NC.G_CONSTS = {
      DIV_COMBO: " - ",
      DIV_DATE: "-",
      DIV_REP_DATE: "/",
      DIV_LOC: "-",

      JSON_ARR_PREFIX: "[",
      JSON_ARR_SUFFIX: "]",
      JSON_OBJ_PREFIX: "{",
      JSON_OBJ_SUFFIX: "}",

      RESULT_CD_OK: 0,
      RESULT_CD_ERROR: 1,
      RESULT_CD_ERROR_HTML: 2,
      RESULT_CD_ACCESSDENIED: 999,
      RESULT_TYPE_STR: "S",
      RESULT_TYPE_MAP: "M",
      RESULT_TYPE_LIST: "L",
      RESULT_TYPE_SLIST: "SL",
      RESULT_TYPE_MLIST: "ML",

      //SCREENSAVER_TIME: 10*60,
      SCREENSAVER_ALERT: 60
    };

    /**
     * 현재 로그인한 사용자의 기본 정보<br>
     * <br>
     * USER_ID, USER_NM, USER_PWD, CERTIFY_DIV,<br>
     * CENTER_CD, CENTER_NM, BU_CD, BU_NM, CUST_CD, CUST_NM,<br>
     * LOGIN_DATE, LOGIN_DATETIME, NOTICE_YN,<br>
     * PRINTER_BILL_IN, PRINTER_BILL_OUT, PRINTER_LABEL_IN, PRINTER_LABEL_OUT
     * 
     * @since 5.0
     * @returns {Object}
     */
    $NC.G_USERINFO = null;
    /**
     * 레이아웃 관련 공통 전역변수<br>
     * <br>
     * border1: Border Width<br>
     * border2: Border Width * 2<br>
     * margin1: View Margin<br>
     * margin2: View Margin * 2<br>
     * padding1: View Padding<br>
     * paddin2: View Padding * 2<br>
     * header: Grid Header Height<br>
     * tabHeader: Tab Header Height<br>
     * topOffset: Client View Top Line Height<br>
     * nonClientWidth: Border Width + View Margin<br>
     * nonClientHeight: Client View Top Line Height + Border Width<br>
     * scroll: {width : Vertical ScrollBar Size, height: Horizontal ScrollBar Size}
     */
    $NC.G_LAYOUT = {
      border1: 0,
      border2: 0,
      margin1: 0,
      margin2: 0,
      padding1: 0,
      padding2: 0,
      header: 0,
      tabHeader: 0,
      topOffset: 0,
      nonClientWidth: 0,
      nonClientHeight: 0,
      scroll: {
        width: 0,
        height: 0
      }
    };

    /**
     * 단위 화면 레이아웃 관련 공통 전역 변수<br>
     * <br>
     * minWidth: 850<br>
     * minHeight: 500<br>
     * width: 0<br>
     * height: 0<br>
     * nonClientWidth: 2<br>
     * nonClientHeight: 33<br>
     */
    $NC.G_CHILDLAYOUT = null;

    // -----------------------------------------------------------------------------------------------------------------
    // Public Function - 일반
    // TODO: Public Function - 일반 - START
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * 화면 전역변수 세팅<br>
     * 
     * @param globalVar
     */
    $NC.setGlobalVar = function(globalVar) {

      if (globalVar) {
        $NC.G_VAR = $.extend({}, $NC.G_VAR, globalVar);
      }
    };
    
    

    /**
     * Window Resize 이벤트 바인딩<br>
     * 단위화면에서는 _OnResize(parent)로 Function을 생성하고 구현
     */
    $NC.setInitViewOnResizeEvent = function() {

      if ($.isFunction(window._OnResize)) {

        $(window).bind("resize", function(e) {
          window._OnResize($(window));
        });
      }
    };

    /**
     * Input(Edit, CheckBox, RadioButton ...), Select Change 이벤트 바인딩<br>
     * 단위화면에서는 아래 Function 명으로 구현<br>
     * 조회조건 변경: _OnConditionChange(e, view)<br>
     * <br>
     * 조회조건외 변경: _OnInputChange(e, view)
     */
    $NC.setInitViewOnInputChangeEvent = function() {

      var existOnInputChange = $.isFunction(window._OnInputChange);
      var existOnConditionChange = $.isFunction(window._OnConditionChange);

      if (!existOnConditionChange && !existOnInputChange) {
        return;
      }

      var selector = "input[type=text]," //
          + "input[type=password],"//
          + "input[type=checkbox]," //
          + "input[type=radio],"//
          + "textarea,"//
          + "select";
      $(selector).bind("change", function(e) {

        var view = $(e.target);
        var parentSelector = ".ui-ctnr-condition:first,.ui-ctnr-subcondition:first";

        if (view.parents(parentSelector).length > 0) {
          if (existOnConditionChange) {
            window._OnConditionChange(e, view, $NC.getValue(view));
            return false;
          }
        } else {
          if (existOnInputChange) {
            window._OnInputChange(e, view, $NC.getValue(view));
            return false;
          }
        }
      });
    };

    /**
     * Input(Edit, CheckBox, RadioButton ...), Select(ComboBox) KeyUp 이벤트 바인딩<br>
     * 단위화면에서는 _OnInputKeyUp(e, view)로 Function을 생성하고 구현
     */
    $NC.setInitViewOnInputKeyUpEvent = function() {

      var existOnInputKeyUp = $.isFunction(window._OnInputKeyUp);

      var selector = "input[type=text]," //
          + "input[type=password],"//
          + "input[type=checkbox]," //
          + "input[type=radio],"//
          // + "textarea,"//
          + "select";
      $(selector).bind("keyup", function(e) {

        var view = $(e.target);
        if (e.which !== 13) {
          if (existOnInputKeyUp) {
            window._OnInputKeyUp(e, view);
            if (e.isImmediatePropagationStopped()) {
              e.preventDefault();
              return;
            }
          }
          return;
        }
        // Enter Key일 경우
        if (existOnInputKeyUp) {
          window._OnInputKeyUp(e, view);
          if (e.isImmediatePropagationStopped()) {
            e.preventDefault();
            return;
          }
        }
        // 현재 Input의 TabIndex로 다음 Input 검색
        var tabIndex = parseFloat(view.prop("tabindex")) + 1;
        var nextView = null;
        var nextViewSelector;
        do {
          // input, select, textarea에서 현재 tabindex 다음의 tabindex를 가진 Element 검색
          nextViewSelector = "input[tabindex=" + tabIndex + "],"//
              + "select[tabindex=" + tabIndex + "],"//
              + "textarea[tabindex=" + tabIndex + "]";
          nextView = $(nextViewSelector);
          // 없을 경우 전체 Element에서 검색하도록 loop에서 빠짐
          if (nextView.length == 0) {
            break;
          }

          // 다음 tabindex를 검색했을 경우 사용가능 하면서 팝업버튼이 아닐 경우에 focus를 처리
          if (nextView.is(":enabled:not([class^='ui-btn'])")) {
            break;
          }
          tabIndex += 1;
        } while (true);

        // TabIndex로 다음이 없으면 Object로 다음을 검색해서 focus를 줌
        if (nextView.length == 0) {
          nextViewSelector = "input[type!=hidden]:visible:enabled:not([class^='ui-btn']),"//
              + "select:visible:enabled,"//
              + "textarea:visible:enabled";
          var nextViews = $(document).find(nextViewSelector);
          var nextIndex = nextViews.index(e.target) + 1;
          if (nextIndex < nextViews.length) {
            nextView = $(nextViews[nextIndex]);
          } else {
            nextView = $(nextViews[0]);
          }
        }

        if (nextView.length > 0) {
          nextView.focus();
        }
      });
    };

    /**
     * Input(Edit) KeyDown 이벤트 바인딩<br>
     * ID를 기준으로 입력 제한<br>
     * 숫자: ..._Qty, ...Price, ...Amt, ...Box, ...Ea<br>
     * 숫자, Dot: ..._Weight, ...Cbm<br>
     * 숫자, Hypen: ...Date, ...Date1, ...Date2<br>
     * 단위화면에서는 _OnInputKeyDown(e, view)로 Function을 생성하고 구현
     */
    $NC.setInitViewOnInputKeyDownEvent = function() {

      var existOnInputKeyDown = $.isFunction(window._OnInputKeyDown);

      var selector = "[id$='_Qty']," // 수량
          + "[id$='_Price']," // 단가
          + "[id$='_Amt']," // 금액
          + "[id$='_Box']," // 수량[BOX]
          + "[id$='_RBox']," // 수량[BOX]
          + "[id$='_Ea']," // 수량[EA]
          + "[id$='_Order']," // 순위
          + "[id$='_Length']," // 길이
          + "[id$='_Width']," // 너비
          + "[id$='_Height']," // 높이
          + "[id$='_Case']," //
          + "[id$='_Val']," //
          + "[id$='_RPlt']," //
          + "[id$='_Plt']," //
          + "[id$='_Stair']," //
          + "[id$='_Place']," //
          + "[id$='_Row']," //
          + "[id$='_Cnt']," //
          + ".ui-edt-integer"; //

      var targetViews = $("input[type=text]").filter(selector);
      if (targetViews.length > 0) {
        targetViews.css("text-align", "right");
        targetViews.bind("keydown", function(e) {

          if (e.keyCode == 8 // backspace
              || e.keyCode == 46 // delete
              || e.keyCode == 9 // tab
              || e.keyCode == 27 // escape
              || e.keyCode == 13 // enter
              || e.keyCode == 35 // end
              || e.keyCode == 36 // home
              || e.keyCode == 37 // left
              || e.keyCode == 39 // right
              || (e.keyCode == 65 && e.ctrlKey === true) // Ctrl+A
              || (e.keyCode == 65 && e.metaKey === true) // Command+A
          ) {
            if (existOnInputKeyDown) {
              window._OnInputKeyDown(e, $(e.target));
              if (e.isImmediatePropagationStopped()) {
                e.preventDefault();
                return;
              }
            }
          } else {
            if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
              e.preventDefault();
            } else {
              if (existOnInputKeyDown) {
                window._OnInputKeyDown(e, $(e.target));
                if (e.isImmediatePropagationStopped()) {
                  e.preventDefault();
                  return;
                }
              }
            }
          }
        });
      }

      selector = "[id$='_Weight']," // 중량
          + "[id$='_Capa']," //
          + "[id$='_Cbm']," // 
          + ".ui-edt-double"; //
      targetViews = $("input[type=text]").filter(selector);
      if (targetViews.length > 0) {
        targetViews.css("text-align", "right");
        targetViews.bind("keydown", function(e) {

          if (e.keyCode == 190 || e.keyCode == 110) // dot
          {
            var dot = $NC.getValue($(e.target)).match(/\./gi);
            if (!$NC.isNull(dot) && dot.length > 0) {
              e.preventDefault();
            } else {
              if (existOnInputKeyDown) {
                window._OnInputKeyDown(e, $(e.target));
                if (e.isImmediatePropagationStopped()) {
                  e.preventDefault();
                  return;
                }
              }
            }
          } else if (e.keyCode == 8 // backspace
              || e.keyCode == 46 // delete
              || e.keyCode == 9 // tab
              || e.keyCode == 27 // escape
              || e.keyCode == 13 // enter
              || e.keyCode == 35 // end
              || e.keyCode == 36 // home
              || e.keyCode == 37 // left
              || e.keyCode == 39 // right
              || (e.keyCode == 65 && e.ctrlKey === true) // Ctrl+A
              || (e.keyCode == 65 && e.metaKey === true) // Ctrl+A
          ) {
            if (existOnInputKeyDown) {
              window._OnInputKeyDown(e, $(e.target));
              if (e.isImmediatePropagationStopped()) {
                e.preventDefault();
                return;
              }
            }
          } else {
            // not number
            if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
              e.preventDefault();
            } else {
              if (existOnInputKeyDown) {
                window._OnInputKeyDown(e, $(e.target));
                if (e.isImmediatePropagationStopped()) {
                  e.preventDefault();
                  return;
                }
              }
            }
          }
        });
      }

      selector = "[id$='_Date']," // 일자
          + "[id$='_Date1']," // 기간1
          + "[id$='_Date2'],"//
          + ".ui-edt-date"; //
      targetViews = $("input[type=text]").filter(selector);
      targetViews.prop("maxlength", 10);
      if (targetViews.length > 0) {
        targetViews.bind("keydown", function(e) {

          if (e.keyCode == 189 || e.keyCode == 109) // hypen
          {
            var hypen = $NC.getValue($(e.target)).match(/-/gi);
            if (!$NC.isNull(hypen) && hypen.length > 1) {
              e.preventDefault();
            } else {
              if (existOnInputKeyDown) {
                window._OnInputKeyDown(e, $(e.target));
                if (e.isImmediatePropagationStopped()) {
                  e.preventDefault();
                  return;
                }
              }
            }
          } else if (e.keyCode == 8 // backspace
              || e.keyCode == 46 // delete
              || e.keyCode == 9 // tab
              || e.keyCode == 27 // escape
              || e.keyCode == 13 // enter
              || e.keyCode == 35 // end
              || e.keyCode == 36 // home
              || e.keyCode == 37 // left
              || e.keyCode == 39 // right
              || (e.keyCode == 65 && e.ctrlKey === true) // Ctrl+A
              || (e.keyCode == 65 && e.metaKey === true) // Ctrl+A
          ) {
            if (existOnInputKeyDown) {
              window._OnInputKeyDown(e, $(e.target));
              if (e.isImmediatePropagationStopped()) {
                e.preventDefault();
                return;
              }
            }
          } else if (e.keyCode == 38 // up
          ) {
            $NC.onDatePickerMouseWheel(e, 1);
            e.preventDefault();
          } else if (e.keyCode == 40 // down
          ) {
            $NC.onDatePickerMouseWheel(e, -1);
            e.preventDefault();
          } else {
            // not number
            if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
              e.preventDefault();
            } else {
              if (existOnInputKeyDown) {
                window._OnInputKeyDown(e, $(e.target));
                if (e.isImmediatePropagationStopped()) {
                  e.preventDefault();
                  return;
                }
              }
            }
          }
        });
      }

      selector = "[id$='_Month']," // 월
          + "[id$='_Month1']," // 기간1
          + "[id$='_Month2'],"//
          + ".ui-edt-month"; //
      targetViews = $("input[type=text]").filter(selector);
      targetViews.prop("maxlength", 7);
      if (targetViews.length > 0) {
        targetViews.bind("keydown", function(e) {

          if (e.keyCode == 189 || e.keyCode == 109) // hypen
          {
            var hypen = $NC.getValue($(e.target)).match(/-/gi);
            if (!$NC.isNull(hypen) && hypen.length > 0) {
              e.preventDefault();
            } else {
              if (existOnInputKeyDown) {
                window._OnInputKeyDown(e, $(e.target));
                if (e.isImmediatePropagationStopped()) {
                  e.preventDefault();
                  return;
                }
              }
            }
          } else if (e.keyCode == 8 // backspace
              || e.keyCode == 46 // delete
              || e.keyCode == 9 // tab
              || e.keyCode == 27 // escape
              || e.keyCode == 13 // enter
              || e.keyCode == 35 // end
              || e.keyCode == 36 // home
              || e.keyCode == 37 // left
              || e.keyCode == 39 // right
              || (e.keyCode == 65 && e.ctrlKey === true) // Ctrl+A
              || (e.keyCode == 65 && e.metaKey === true) // Ctrl+A
          ) {
            if (existOnInputKeyDown) {
              window._OnInputKeyDown(e, $(e.target));
              if (e.isImmediatePropagationStopped()) {
                e.preventDefault();
                return;
              }
            }
          } else if (e.keyCode == 38 // up
          ) {
            $NC.onMonthPickerMouseWheel(e, 1);
            e.preventDefault();
          } else if (e.keyCode == 40 // down
          ) {
            $NC.onMonthPickerMouseWheel(e, -1);
            e.preventDefault();
          } else {
            // not number
            if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
              e.preventDefault();
            } else {
              if (existOnInputKeyDown) {
                window._OnInputKeyDown(e, $(e.target));
                if (e.isImmediatePropagationStopped()) {
                  e.preventDefault();
                  return;
                }
              }
            }
          }
        });
      }

      if (existOnInputKeyDown) {
        selector = ".ui-edt-keydown"; // KeyDown Event 할당
        targetViews = $("input[type=text]").filter(selector);
        if (targetViews.length > 0) {
          targetViews.bind("keydown", function(e) {

            window._OnInputKeyDown(e, $(e.target));
            if (e.isImmediatePropagationStopped()) {
              e.preventDefault();
              return;
            }
          });
        }
      }
    };
    
    /**
     * KeyDown 이벤트 단축키 기능<br>
     */
    $NC.setInitViewShortCutKeyDownEvent = function() {
      
      $(document).keydown(function (e) {
        if(e.keyCode == "49" && e.altKey == true && $NC.G_VAR.buttons._inquiry == "1"){
          $NC.G_MAIN._Inquiry();
        }else if (e.keyCode == "50" && e.altKey == true && $NC.G_VAR.buttons._new == "1"){
          $NC.G_MAIN._New();
        }else if (e.keyCode == "51" && e.altKey == true && $NC.G_VAR.buttons._save == "1"){
          $NC.G_MAIN._Save();
        }else if (e.keyCode == "52" && e.altKey == true && $NC.G_VAR.buttons._cancel == "1"){
          $NC.G_MAIN._Cancel();
        }else if (e.keyCode == "53" && e.altKey == true && $NC.G_VAR.buttons._delete == "1"){
          $NC.G_MAIN._Delete();
        }else if (e.keyCode == "81" && e.altKey == true){
          $NC.G_MAIN.document.getElementById("btnTopMenu").click(function(e) {
            if ($NC.G_MAIN.document.getElementById("btnTopMenu").is(".ui-clr-selected")) {
              alert("메뉴 항상 보이기로 설정되어 있습니다.");
              return;
            }
            toggleMenu();
          });
//          $NC.G_MAIN.toggleMenu();
        }else {
        }
      });
    };

    /**
     * 화면표시명칭 및 표시여부 초기화
     */
    $NC.setInitDisplay = function() {

      // 표시 여부
      var dspSelector = "td[id^='tdQ'],div[id^='divQ']";
      var dspFilter = "td[style*='display: none;']";
      var dspRegExp = /^tdQ[0-9]Dsp_|^divQ[0-9]Dsp_|^tdQDsp_|^divQDsp_/i;

      var views = $(dspSelector).filter(function() {
        return this.id.match(dspRegExp);
      });
      var view = null;
      var parentChildren = null;
      var MSG_ID = null;

      if (views.length > 0) {
        for (var i = 0, count = views.length; i < count; i++) {
          view = $(views[i]);
          MSG_ID = view.prop("id").replace(dspRegExp, "").toUpperCase();
          if ($NC.getDisplayYn(MSG_ID)) {
            view.show();
          } else {
            view.hide();
            if (view.prop("tagName") == "TD") {
              parentChildren = view.parent().children("td");
              if (parentChildren.length == parentChildren.filter(dspFilter).length) {
                view.parent().hide();
              }
            }
          }
        }
      }

      // 명칭 변경
      var lblSelector = "div[id^='lbl']";
      var lblFilter = ".ui-lbl-condition,.ui-lbl-key,.ui-lbl-normal,.ui-lbl-search";
      var lblRegExp = /^lblQT[0-9]_|^lblT[0-9]_|^lblQL[0-9]_|^lblL[0-9]_|^lblQ|^lbl/i;

      views = $(lblSelector).filter(lblFilter);
      view = null;
      MSG_ID = null;
      var dspText = null;
      if (views.length > 0) {
        for (var i = 0, count = views.length; i < count; i++) {
          view = $(views[i]);
          MSG_ID = view.prop("id").replace(lblRegExp, "").toUpperCase();
          dspText = $NC.nullToDefault($NC.getDisplayName(MSG_ID), $NC.getValue(view));
          $NC.setValue(view, dspText);
          if (view.innerWidth() < view[0].scrollWidth) {
            view.prop("title", dspText);
          }
        }
      }
    };

    /**
     * 메시지ID로 명칭 리턴
     * 
     * @param msgID
     * @param subID
     * @param programID
     * @returns {String}
     */
    $NC.getDisplayName = function(msgID, subID, programID) {

      return getGridDisplayInfo(msgID, subID, programID).MSG_NM;
    };

    /**
     * 메시지ID로 표시여부 리턴
     * 
     * @param msgID
     * @param subID
     * @param programID
     * @returns {Boolean}
     */
    $NC.getDisplayYn = function(msgID, subID, programID) {

      return getGridDisplayInfo(msgID, subID, programID, "D").DISPLAY_YN == "Y";
    };

    /**
     * 메시지ID로 표시정보 리턴
     * 
     * @param msgID
     * @param subID
     * @param programID
     * @returns {Object}
     */
    $NC.getDisplayInfo = function(msgID, subID, programID) {

      return getGridDisplayInfo(msgID, subID, programID);
    };

    /**
     * div 컨테이너 리사이즈
     * 
     * @param selector
     * @param width
     * @param height
     * @param withSplitter
     */
    $NC.resizeContainer = function(selector, width, height, withSplitter) {

      var view = $NC.getView(selector);
      if (view.length === 0) {
        return;
      }
      // Grid 높이 조정
      view.css({
        "min-width": width,
        "max-width": width,
        "min-height": height,
        "max-height": height
      });

      // Splitter Bar 사이즈 조정
      if ($NC.isNull(withSplitter)) {
        withSplitter = true;
      }
      if (withSplitter) {
        var splitter = view.children(".splitter-bar");
        if (splitter.length === 0) {
          return;
        }

        if (splitter.is(".splitter-bar-vertical")) {
          // Vertical Splitter
          splitter.height(height - $NC.G_LAYOUT.border1);
        } else {
          // Horizontal Splitter
          splitter.width(width - $NC.G_LAYOUT.border1);
        }
      }
    };

    /**
     * Container Group 하위의 Input(Edit, CheckBox, RadioButton ...) Enable/Disable 처리<br>
     * 
     * @param grpSelector
     *          검색 대상 Group Selector
     * @param enable
     */
    $NC.setEnableGroup = function(grpSelector, enable) {

      var selector = grpSelector + " input[type=text].ui-edt-key," // Edit 키
          + grpSelector + " input[type=text].ui-edt-normal," // Edit 일반
          + grpSelector + " input[type=password].ui-edt-key," // Password Edit 키
          + grpSelector + " input[type=password].ui-edt-normal," // Password Edit 일반
          + grpSelector + " input[type=text].ui-dtp-key," // DatePicker 키
          + grpSelector + " input[type=text].ui-dtp-normal," // DatePicker 일반
          + grpSelector + " button.ui-datepicker-trigger," // DatePicker trigger
          + grpSelector + " button.ui-monthpicker-trigger," // MonthPicker trigger
          + grpSelector + " input[type=radio].ui-rgb-normal," // Radio 일반
          + grpSelector + " input[type=checkbox].ui-chk-normal," // Checkbox 일반
          + grpSelector + " select.ui-cbo-key," // ComboBox 키
          + grpSelector + " select.ui-cbo-normal," // ComboBox 일반
          + grpSelector + " textarea.ui-edt-normal," // TextArea 일반
          + grpSelector + " input[type=button]"; // Button

      $(selector).prop("disabled", !enable);
    };

    /**
     * Input(Edit, CheckBox, RadioButton ...) Enable 여부<br>
     * 
     * @param selector
     * @returns {Boolean}
     */
    $NC.getEnable = function(selector) {

      var view = $NC.getView(selector);
      if (view.length == 0) {
        return false;
      }
      return !view.prop("disabled");
    };

    /**
     * Input(Edit, CheckBox, RadioButton ...) Enable/Disable 처리<br>
     * 
     * @param selector
     * @param enable
     *          Boolean, 미지정시 Enable
     */
    $NC.setEnable = function(selector, enable) {

      var view = $NC.getView(selector);
      if (view.length == 0) {
        return;
      }

      if ($NC.isNull(enable)) {
        enable = true;
      }
      if (view.hasClass("hasDatepicker") || view.hasClass("hasMonthpicker")) {
        var dtpButton = view.next("button.ui-datepicker-trigger");
        dtpButton.prop("disabled", !enable);
      }

      view.prop("disabled", !enable);
    };

    /**
     * ajax 호출
     * 
     * @param requestUrl
     *          호출 Url
     * @param requestData
     *          호출 파라메터
     * @param onSuccessHandler
     *          호출 성공시 실행할 Event
     * @param onError
     *          호출 실패시 실행할 Event, 지정하지 않을 경우 기본 Error Event 호출
     * @param messageOptions
     *          기본: "데이터를 가져오는 중입니다.", 다른 메시지로 표시할 경우 입력
     */
    $NC.serviceCall = function(requestUrl, requestData, onSuccessHandler, onErrorHandler, messageOptions, mockId) {
      var args = arguments;
      if (!requestData) {
        requestData = {};
      }
      var ajaxData = {
        success: null,
        error: null
      };
      $.ajax({
        async: true,
        type: "POST",
        url: requestUrl,
        data: requestData,
        beforeSend: function(jqXHR, settings) {
          // 처리 중 메시지 표시
          // setTimeout(function() {
          $NC.showProgressMessage(messageOptions);
          // }, 50);
        },
        success: function(data, textStatus, jqXHR) {
          ajaxData.success = {
            isAjaxData: true,
            data: data,
            httpStatus: jqXHR.status,
            httpStatusText: jqXHR.statusText,
            statusText: textStatus
          };
        },
        error: function(jqXHR, textStatus, errorThrown) {
          ajaxData.error = {
            isAjaxData: true,
            data: jqXHR.responseText,
            httpStatus: jqXHR.status,
            httpStatusText: jqXHR.statusText,
            statusText: textStatus,
            errorThrown: errorThrown
          };
        },
        complete: function(jqXHR, textStatus) {
          // 성공, 실패에 대한 Event 호출
          if (ajaxData.success) {
            removeServiceLog('serviceCall', args, 'SUCCESS');
            if (onSuccessHandler) {
              onSuccessHandler(ajaxData.success);
            }
          } else {
            removeServiceLog('serviceCall', args, 'ERROR');
            if ($.isFunction(onErrorHandler)) {
              onErrorHandler(ajaxData.error);
            } else {
              $NC.onError(ajaxData.error);
            }
          }
          /*
          setTimeout(function() {
            // 처리 중 메시지 숨김
            $NC.hideProgressMessage();
          }, 50);
          */
        }
      });
    };

    /**
     * ajax 호출 후 완료시까지 대기
     * 
     * @param requestUrl
     *          호출 Url
     * @param requestData
     *          호출 파라메터
     * @param onSuccessHandler
     *          호출 성공시 실행할 Event
     * @param onErrorHandler
     *          호출 실패시 실행할 Event, 지정하지 않을 경우 기본 Error Event 호출
     * @param messageOptions
     *          기본: "데이터를 가져오는 중입니다.", 다른 메시지로 표시할 경우 입력
     */
    $NC.serviceCallAndWait = function(requestUrl, requestData, onSuccessHandler, onErrorHandler, messageOptions, mockId) {
      var args = arguments;
      if (!requestData) {
        requestData = {};
      }
      var ajaxData = {
        success: null,
        error: null
      };
      $.ajax({
        async: false,
        // 타임아웃 10분
        timeout: 600000,
        type: "POST",
        url: requestUrl,
        data: requestData,
        beforeSend: function(jqXHR, settings) {
          // 처리 중 메시지 표시
          // setTimeout(function() {
          $NC.showProgressMessage(messageOptions);
          // }, 50);
        },
        success: function(data, textStatus, jqXHR) {
          ajaxData.success = {
            isAjaxData: true,
            data: data,
            httpStatus: jqXHR.status,
            httpStatusText: jqXHR.statusText,
            statusText: textStatus
          };
        },
        error: function(jqXHR, textStatus, errorThrown) {
          ajaxData.error = {
            isAjaxData: true,
            data: jqXHR.responseText,
            httpStatus: jqXHR.status,
            httpStatusText: jqXHR.statusText,
            statusText: textStatus,
            errorThrown: errorThrown
          };
        },
        complete: function(jqXHR, textStatus) {
          // 성공, 실패에 대한 Event 호출
          if (ajaxData.success) {
            removeServiceLog('serviceCall', args, 'SUCCESS');
            if (onSuccessHandler) {
              onSuccessHandler(ajaxData.success);
            }
          } else {
            removeServiceLog('serviceCall', args, 'ERROR');
            if ($.isFunction(onErrorHandler)) {
              onErrorHandler(ajaxData.error);
            } else {
              $NC.onError(ajaxData.error);
            }
          }
          /*
          setTimeout(function() {
            // 처리 중 메시지 숨김
            $NC.hideProgressMessage();
          }, 50);
          */
        }
      });
    };

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
     *          hideFocus[선택]: 기본 버튼에 포커스 지정 여부, 기본값 true
     */
    $NC.showMessage = function(options) {

      if (options == undefined || options == null) {
        return;
      }

      $NC.G_MAIN.showMessage(options);
    };

    /**
     * 처리 중 메시지 표시
     * 
     * @param options
     *          메시지 옵션<br>
     *          [NULL]: 상단에 "데이터를 가져오는 중 입니다..." 표시<br>
     *          [N]: 1 -> 상단에 "데이터를 가져오는 중 입니다..." 표시<br>
     *          [N]: 2 -> 가운데 "데이터를 처리하고 있습니다. 잠시만 기다려 주십시오..." 표시<br>
     *          [S]: 상단에 입력한 메시지 표시<br>
     *          [O]: {type: 1 or 2, message: 메시지} type에 따라 표시, 1 -> 상단, 2 -> 가운데<br>
     */
    $NC.showProgressMessage = function(options) {

      var messageOptions;
      if (options == undefined || options == null) {
        messageOptions = {
          type: "1",
          message: "데이터를 가져오는 중 입니다..."
        };
      } else {
        if (typeof options == "string") {
          messageOptions = {
            type: "1",
            message: options
          };
        } else if (typeof options == "number") {
          if (options == 1) {
            messageOptions = {
              type: "1",
              message: "데이터를 가져오는 중 입니다..."
            };
          } else {
            messageOptions = {
              type: "2",
              message: "데이터를 처리하고 있습니다. 잠시만 기다려 주십시오..."
            };
          }
        } else {
          messageOptions = options;
        }
      }

      var canCreateLayout = false;
      var container = $($NC.G_MAIN.document.body).css("cursor", "progress");
      var progressLayout = container.find("#divTopProgress");

      if (progressLayout.length == 0) {
        canCreateLayout = true;
      } else {
        if (messageOptions.type == "1" && progressLayout.find(".ui-pmsg-progressbar").length > 0) {
          canCreateLayout = true;
        } else if (messageOptions.type == "2" && progressLayout.find(".ui-pmsg-inquiry-title").length > 0) {
          canCreateLayout = true;
        }
        if (canCreateLayout) {
          progressLayout.remove();
        }
      }

      if (canCreateLayout) {
        progressLayout = $("<div id='divTopProgress' class='ui-pmsg-bg' tabindex='1'></div>").appendTo(container);
        if (messageOptions.type == "1") {
          $("<img src='../../layout/common/image/img_progress_t1.gif' />").appendTo(progressLayout).css({
            "position": "absolute",
            "top": 0,
            "left": 160,
            "margin-top": 10,
            "width": 16,
            "height": 16
          });
          $("<div class='ui-pmsg-inquiry-title'></div>").appendTo(progressLayout).text(messageOptions.message);
        } else {
          $("<div id='divTopProgressBar' class='ui-pmsg-progressbar'></div>").appendTo(progressLayout).css({
            "top": Math.ceil(($NC.G_CHILDLAYOUT.height - 8) / 2),
            "left": Math.ceil(($NC.G_CHILDLAYOUT.width - 378) / 2) + $NC.G_MAIN.$NC.G_OFFSET.currentMenuWidth
          }).progressbar({
            value: false
          }).children().css("background-color", "#e6e6e6");
          $("<div class='ui-pmsg-process-title'></div>").appendTo(progressLayout).css({
            "top": Math.ceil(($NC.G_CHILDLAYOUT.height - 30) / 2),
            "left": Math.ceil(($NC.G_CHILDLAYOUT.width - 400) / 2) + $NC.G_MAIN.$NC.G_OFFSET.currentMenuWidth
          }).text(messageOptions.message);
        }
        var eventArray = $._data(progressLayout.get(0), "events");
        if ($NC.isNull(eventArray) || !("click" in eventArray)) {
          progressLayout.click(function(e) {
            if (e.ctrlKey === true || e.metaKey === true) {
              $NC.hideProgressMessage();
            }
          }).keydown(function(e) {
            // 모든 키 입력 무시
            e.preventDefault();
          });
        }
      } else {
        progressLayout.children("div:last").text(messageOptions.message);
      }
      // progressLayout.focus();
    };

    /**
     * 처리 중 메시지 숨김
     */
    $NC.hideProgressMessage = function() {

      var container = $($NC.G_MAIN.document.body).css("cursor", "default");
      var progressLayout = container.find("#divTopProgress");
      if (progressLayout.length > 0) {
        progressLayout.remove();
      }
    };

    /**
     * 화면 로딩중 메시지 표시
     * 
     * @param message
     *          로딩 메시지
     */
    $NC.showLoadingMessage = function(isWide, message) {

      var loadingMessage = message || "Loading...";
      var loadingWidth = $NC.G_CHILDLAYOUT.width;
      if (isWide) {
        if ($NC.G_MAIN.$NC.G_OFFSET.currentMenuWidth > 0) {
          loadingWidth += $NC.G_MAIN.$NC.G_OFFSET.defaultMenuWidth;
        }
      } else {
        if ($NC.G_MAIN.$NC.G_OFFSET.currentMenuWidth == 0) {
          loadingWidth -= $NC.G_MAIN.$NC.G_OFFSET.defaultMenuWidth;
        }
      }

      var container = $($NC.G_MAIN.document.body).css("cursor", "progress");
      var progressLayout = container.find("#divTopLoadingLayer");
      if (progressLayout.length == 0) {
        var loadingLayout = $("<div id='divTopLoadingLayer' class='ui-pmsg-bg' tabindex='1'></div>")
            .appendTo(container);
        var loadingMessageLayout = $("<div class='ui-pmsg-loading-bg'></div>").appendTo(loadingLayout).css({
          "top": 39, // divTopMenuBar + divTopLine
          "left": (isWide ? 0 : $NC.G_MAIN.$NC.G_OFFSET.defaultMenuWidth) + $NC.G_LAYOUT.border1,
          "width": loadingWidth,
          "height": $NC.G_CHILDLAYOUT.height
        });
        var eventArray = $._data(loadingLayout.get(0), "events");
        if ($NC.isNull(eventArray) || !("click" in eventArray)) {
          loadingLayout.click(function(e) {
            if (e.ctrlKey === true || e.metaKey === true) {
              $NC.hideLoadingMessage(true);
            }
          }).keydown(function(e) {
            // 모든 키 입력 무시
            e.preventDefault();
          });
        }

        $("<div class='ui-pmsg-loading-title'></div>").appendTo(loadingMessageLayout).css({
          "top": Math.ceil(($NC.G_CHILDLAYOUT.height - 30) / 2),
          "left": Math.ceil((loadingWidth - 300) / 2)
        }).text(loadingMessage);

        loadingMessageLayout.fadeIn(500);
      } else {
        progressLayout.find(".ui-pmsg-loading-title:first").text(loadingMessage);
      }
    };

    /**
     * Loading 중 메시지 숨김
     */
    $NC.hideLoadingMessage = function(forceHide) {

      if ($NC.isNull(forceHide)) {
        forceHide = false;
      }
      if ((forceHide == false) && ($.active > 0 || $NC.G_MAIN == window)) {
        return;
      }

      clearInterval($NC.G_MAIN.$NC.G_VAR.onProgramLoadingTimeout);

      var container = $($NC.G_MAIN.document.body).css("cursor", "default");
      var loadingLayout = container.find("#divTopLoadingLayer");
      if (loadingLayout.length > 0) {
        loadingLayout.fadeOut(500, function() {
          loadingLayout.remove();
        });
      }
    };

    /**
     * 출력 중 메시지 표시
     * 
     * @param message
     *          로딩 메시지
     */
    $NC.showPrintingMessage = function(message) {

      var loadingMessage = message || "출력 중 입니다. 잠시만 기다려 주십시오...";
      var loadingWidth = $NC.G_CHILDLAYOUT.width;
      if ($NC.G_MAIN.$NC.G_OFFSET.currentMenuWidth > 0) {
        loadingWidth += $NC.G_MAIN.$NC.G_OFFSET.defaultMenuWidth;
      }

      var container = $($NC.G_MAIN.document.body).css("cursor", "progress");
      var progressLayout = container.find("#divTopPrintingLayer");
      if (progressLayout.length == 0) {
        var loadingLayout = $("<div id='divTopPrintingLayer' class='ui-pmsg-bg' tabindex='1'></div>").appendTo(
            container);
        var loadingMessageLayout = $("<div class='ui-pmsg-loading-bg'></div>").appendTo(loadingLayout).css({
          "top": 39, // divTopMenuBar + divTopLine
          "left": 0,
          "width": loadingWidth,
          "height": $NC.G_CHILDLAYOUT.height
        });
        var eventArray = $._data(loadingLayout.get(0), "events");
        if ($NC.isNull(eventArray) || !("click" in eventArray)) {
          loadingLayout.click(function(e) {
            if (e.ctrlKey === true || e.metaKey === true) {
              $NC.hidePrintingMessage();
            }
          }).keydown(function(e) {
            // 모든 키 입력 무시
            e.preventDefault();
          });
        }

        $("<div class='ui-pmsg-loading-title'></div>").appendTo(loadingMessageLayout).css({
          "top": Math.ceil(($NC.G_CHILDLAYOUT.height - 30) / 2),
          "left": Math.ceil((loadingWidth - 300) / 2)
        }).text(loadingMessage);

        loadingMessageLayout.fadeIn(500);
      } else {
        progressLayout.find(".ui-pmsg-loading-title:first").text(loadingMessage);
      }
    };

    /**
     * Printing 중 메시지 숨김
     */
    $NC.hidePrintingMessage = function() {

      var container = $($NC.G_MAIN.document.body).css("cursor", "default");
      var loadingLayout = container.find("#divTopPrintingLayer");
      if (loadingLayout.length > 0) {
        // loadingLayout.fadeOut(500, function() {
        loadingLayout.remove();
        // });
      }
    };

    /**
     * ajax 오류 처리
     * 
     * @param ajaxData
     *          오류 데이터( {data, httpStatus, httpStatusText, statusText, errorThrown})
     */
    $NC.onError = function(ajaxData) {

      var errorData = $NC.getErrorMessage(ajaxData);
      switch (errorData.RESULT_CD) {
      case $NC.G_CONSTS.RESULT_CD_ERROR:
        alert(errorData.RESULT_MSG);
        break;
      case $NC.G_CONSTS.RESULT_CD_ACCESSDENIED:
        alert(errorData.RESULT_MSG);
        $NC.G_MAIN.showLoginPopup(1);
        break;
      case $NC.G_CONSTS.RESULT_CD_ERROR_HTML:
        $NC.G_MAIN.showMessage({
          title: "오류",
          message: errorData.RESULT_MSG,
          width: 700,
          height: 450
        });
        break;
      default:
        $NC.G_MAIN.setFocusActiveWindow();
      }

      /*
      if (ajaxData == undefined || ajaxData == null) {
        alert("지정되지 않은 오류입니다.\n\n서버가 정상 동작 중인지 확인하십시오.");
        return;
      }
      if (ajaxData.httpStatus == 0 && $NC.isNull(ajaxData.data)) {
        alert("지정되지 않은 오류입니다.\n\n서버가 정상 동작 중인지 확인하십시오.");
        return;
      }

      var errorMessage;
      if (typeof ajaxData === "string") {
        errorMessage = ajaxData;
      } else {
        errorMessage = ajaxData.data;
      }

      var replaceMsg = false;
      // JSON Error Data
      if (errorMessage.substr(0, 1) == $NC.G_CONSTS.JSON_OBJ_PREFIX) {
        var errorData;
        try {
          errorData = JSON.parse(errorMessage);
        } catch (e) {
          alert(errorMessage);
          $NC.G_MAIN.setFocusActiveWindow();
          return;
        }
        if (errorData.RESULT_CD == undefined || errorData.RESULT_CD == null) {
          alert(errorMessage);
          $NC.G_MAIN.setFocusActiveWindow();
          return;
        }

        if (errorData.RESULT_CD == $NC.G_CONSTS.RESULT_CD_OK) {
          $NC.G_MAIN.setFocusActiveWindow();
          return;
        }

        // Access denied error
        if (errorData.RESULT_CD == $NC.G_CONSTS.RESULT_CD_ACCESSDENIED) {
          if (!$NC.isDialogOpen($($NC.G_MAIN.document).find("#divLoginView"))) {
            alert("세션이 만료되었습니다. 다시 로그인하십시오.");
            $NC.G_MAIN.showLoginPopup(1);
          }
          return;
        }

        if (errorData.RESULT_TYPE == $NC.G_CONSTS.RESULT_TYPE_STR) {
          if ($NC.G_MAIN.$NC.G_VAR.isFullErrorMessage) {
            alert(errorData.RESULT_DATA);
            $NC.G_MAIN.setFocusActiveWindow();
            return;
          }
        } else if (errorData.RESULT_TYPE == $NC.G_CONSTS.RESULT_TYPE_MAP) {
          var errorSubData;
          try {
            errorSubData = JSON.parse(errorData.RESULT_DATA);
          } catch (e) {
            alert(errorData.RESULT_DATA);
            $NC.G_MAIN.setFocusActiveWindow();
            return;
          }
          if ($NC.G_MAIN.$NC.G_VAR.isFullErrorMessage) {
            alert(errorSubData.O_MSG);
            $NC.G_MAIN.setFocusActiveWindow();
            return;
          }
          errorData.RESULT_DATA = errorSubData.O_MSG;
        }

        var exceptionPos = errorData.RESULT_DATA.lastIndexOf("Exception: ");
        if (exceptionPos > -1) {
          errorMessage = errorData.RESULT_DATA.substr(exceptionPos + 11);
        } else {
          errorMessage = errorData.RESULT_DATA;
        }
        replaceMsg = true;
        // HTML Error Data
      } else if (errorMessage.substr(0, 5).toUpperCase() == "<HTML"
          || errorMessage.substr(0, 9).toUpperCase() == "<!DOCTYPE") {
        $NC.G_MAIN.showMessage({
          title: "오류",
          message: errorMessage,
          width: 600,
          height: 400
        });
        return;
        // 그외
      } else {
        if ($NC.G_MAIN.$NC.G_VAR.isFullErrorMessage) {
          alert(errorMessage);
          $NC.G_MAIN.setFocusActiveWindow();
          return;
        }
        var exceptionPos = errorMessage.lastIndexOf("Exception: ");
        if (exceptionPos > -1) {
          errorMessage = errorMessage.substr(exceptionPos + 11);
        }
        replaceMsg = true;
      }

      if (replaceMsg) {
        // ORA-00001: 무결성 제약 조건(NEXOS_USER.CMCENTER_IDXPK)에 위배됩니다
        if (errorMessage.indexOf("ORA-00001") == 0) {
          alert("동일한 코드로 등록된 데이터가 존재합니다.\n\n신규 입력 데이터를 확인하십시오.");
        } else if (errorMessage.indexOf("ORA-02292") == 0) {
          // ORA-02292: 무결성 제약조건(NEXOS_USER.CMWAREHOUSE_FRK01)이 위배되었습니다- 자식 레코드가 발견되었습니다
          alert("해당 코드와 연계된 데이터가 존재합니다.\n\n삭제할 수 없습니다.");
        } else {
          alert(errorMessage);
        }
        $NC.G_MAIN.setFocusActiveWindow();
      }
      */
    };

    /**
     * ajaxData로 부터 오류 메시지 파싱
     * 
     * @param ajaxData
     * @returns {Object}
     */
    $NC.getErrorMessage = function(ajaxData) {

      var resultData = {
        RESULT_CD: $NC.G_CONSTS.RESULT_CD_OK,
        RESULT_MSG: ""
      };

      if (ajaxData == undefined || ajaxData == null) {
        resultData.RESULT_CD = $NC.G_CONSTS.RESULT_CD_ERROR;
        resultData.RESULT_MSG = "지정되지 않은 오류입니다.\n\n서버가 정상 동작 중인지 확인하십시오.";
        return resultData;
      }
      if (ajaxData.httpStatus == 0 && $NC.isNull(ajaxData.data)) {
        resultData.RESULT_CD = $NC.G_CONSTS.RESULT_CD_ERROR;
        resultData.RESULT_MSG = "지정되지 않은 오류입니다.\n\n서버가 정상 동작 중인지 확인하십시오.";
        return resultData;
      }

      var errorMessage;
      if (typeof ajaxData === "string") {
        errorMessage = ajaxData;
      } else {
        errorMessage = ajaxData.data;
      }

      var replaceMsg = false;
      // JSON Error Data
      if (errorMessage.substr(0, 1) == $NC.G_CONSTS.JSON_OBJ_PREFIX) {
        var errorData;
        try {
          errorData = JSON.parse(errorMessage);
        } catch (e) {
          resultData.RESULT_CD = $NC.G_CONSTS.RESULT_CD_ERROR;
          resultData.RESULT_MSG = errorMessage;
          return resultData;
        }
        if (errorData.RESULT_CD == undefined || errorData.RESULT_CD == null) {
          resultData.RESULT_CD = $NC.G_CONSTS.RESULT_CD_ERROR;
          resultData.RESULT_MSG = errorMessage;
          return resultData;
        }

        if (errorData.RESULT_CD == $NC.G_CONSTS.RESULT_CD_OK) {
          // 정상
          return resultData;
        }

        // Access denied error
        if (errorData.RESULT_CD == $NC.G_CONSTS.RESULT_CD_ACCESSDENIED) {
          if (!$NC.isDialogOpen($($NC.G_MAIN.document).find("#divLoginView"))) {
            resultData.RESULT_CD = $NC.G_CONSTS.RESULT_CD_ACCESSDENIED;
            resultData.RESULT_MSG = "세션이 종료되었습니다. 다시 로그인하십시오.";
          }
          return resultData;
        }

        if (errorData.RESULT_TYPE == $NC.G_CONSTS.RESULT_TYPE_STR) {
          if ($NC.G_MAIN.$NC.G_VAR.isFullErrorMessage) {
            resultData.RESULT_CD = $NC.G_CONSTS.RESULT_CD_ERROR;
            resultData.RESULT_MSG = errorData.RESULT_DATA;
            return resultData;
          }
        } else if (errorData.RESULT_TYPE == $NC.G_CONSTS.RESULT_TYPE_MAP) {
          var errorSubData;
          try {
            errorSubData = JSON.parse(errorData.RESULT_DATA);
          } catch (e) {
            resultData.RESULT_CD = $NC.G_CONSTS.RESULT_CD_ERROR;
            resultData.RESULT_MSG = errorData.RESULT_DATA;
            return resultData;
          }
          if ($NC.G_MAIN.$NC.G_VAR.isFullErrorMessage) {
            resultData.RESULT_CD = $NC.G_CONSTS.RESULT_CD_ERROR;
            resultData.RESULT_MSG = errorSubData.O_MSG;
            return resultData;
          }
          errorData.RESULT_DATA = errorSubData.O_MSG;
        }

        var exceptionPos = errorData.RESULT_DATA.lastIndexOf("Exception: ");
        if (exceptionPos > -1) {
          errorMessage = errorData.RESULT_DATA.substr(exceptionPos + 11);
        } else {
          errorMessage = errorData.RESULT_DATA;
        }
        replaceMsg = true;
        // HTML Error Data
      } else if (errorMessage.substr(0, 5).toUpperCase() == "<HTML"
          || errorMessage.substr(0, 9).toUpperCase() == "<!DOCTYPE") {
        resultData.RESULT_CD = $NC.G_CONSTS.RESULT_CD_ERROR_HTML;
        resultData.RESULT_MSG = errorMessage;
        return resultData;
        // 그외
      } else {
        if ($NC.G_MAIN.$NC.G_VAR.isFullErrorMessage) {
          resultData.RESULT_CD = $NC.G_CONSTS.RESULT_CD_ERROR;
          resultData.RESULT_MSG = errorMessage;
          return resultData;
        }
        var exceptionPos = errorMessage.lastIndexOf("Exception: ");
        if (exceptionPos > -1) {
          errorMessage = errorMessage.substr(exceptionPos + 11);
        }
        replaceMsg = true;
      }

      if (replaceMsg) {
        // ORA-00001: 무결성 제약 조건(NEXOS_USER.CMCENTER_IDXPK)에 위배됩니다
        if (errorMessage.indexOf("ORA-00001") == 0) {
          resultData.RESULT_CD = $NC.G_CONSTS.RESULT_CD_ERROR;
          resultData.RESULT_MSG = "동일한 코드로 등록된 데이터가 존재합니다.\n\n신규 입력 데이터를 확인하십시오.";
          return resultData;
        } else if (errorMessage.indexOf("ORA-02292") == 0) {
          // ORA-02292: 무결성 제약조건(NEXOS_USER.CMWAREHOUSE_FRK01)이 위배되었습니다- 자식 레코드가 발견되었습니다
          resultData.RESULT_CD = $NC.G_CONSTS.RESULT_CD_ERROR;
          resultData.RESULT_MSG = "해당 코드와 연계된 데이터가 존재합니다.\n\n삭제할 수 없습니다.";
          return resultData;
        } else {
          resultData.RESULT_CD = $NC.G_CONSTS.RESULT_CD_ERROR;
          resultData.RESULT_MSG = errorMessage;
          return resultData;
        }
      }

      return result;
    };

    /**
     * JsonString을 Array 또는 Object 로 변환
     * 
     * @param srcObject
     *          Json String
     * @returns {Array}<br>
     *          {Object}
     */
    $NC.toArray = function(srcObject) {

      if (srcObject == undefined || srcObject == null) {
        return [ ];
      }

      var resultObject;
      var parsedObject;

      if (typeof srcObject === "string") {
        var srcObjectPrefix = srcObject.charAt(0);
        if (srcObjectPrefix != $NC.G_CONSTS.JSON_ARR_PREFIX && srcObjectPrefix != $NC.G_CONSTS.JSON_OBJ_PREFIX) {
          return [ ];
        }
        try {
          parsedObject = JSON.parse(srcObject);
          if (parsedObject.RESULT_CD == undefined || parsedObject.RESULT_CD == null) {
            return parsedObject;
          }
        } catch (e) {
          return [ ];
        }
      } else if (typeof srcObject === "object") {
        if (Array.isArray(srcObject)) {
          return srcObject;
        } else if (srcObject.isAjaxData != undefined && srcObject.isAjaxData == true) {
          try {
            parsedObject = JSON.parse(srcObject.data);
          } catch (e) {
            return [ ];
          }
        } else if (srcObject.RESULT_CD != undefined && srcObject.RESULT_CD != null) {
          parsedObject = srcObject;
        } else {
          if (srcObject.data != undefined) {
            return srcObject.data;
          } else {
            return srcObject;
          }
        }
      } else {
        return [ ];
      }

      try {
        if (parsedObject.RESULT_TYPE == $NC.G_CONSTS.RESULT_TYPE_STR) { // 문자열 결과
          resultObject = {
            RESULT_DATA: parsedObject.RESULT_DATA
          };
        } else if (parsedObject.RESULT_TYPE == $NC.G_CONSTS.RESULT_TYPE_SLIST) { // {컬럼인덱스: 컬럼값} 형태의 단일 리스트형 결과
          if (parsedObject.RESULT_DATA != undefined && parsedObject.RESULT_DATA != null) {
            var columns = JSON.parse(parsedObject.RESULT_COLUMN);
            var columnCount = Object.keys(columns).length;
            resultObject = JSON.parse(parsedObject.RESULT_DATA);
            for (var row = 0, rowCount = resultObject.length; row < rowCount; row++) {
              for (var col = 0; col < columnCount; col++) {
                resultObject[row][columns[col]] = resultObject[row][col];
                delete resultObject[row][col];
              }
            }
          }
        } else if (parsedObject.RESULT_TYPE == $NC.G_CONSTS.RESULT_TYPE_MLIST) { // {컬럼인덱스: 컬럼값} 형태의 멀티 리스트형 결과
          var columns = JSON.parse(parsedObject.RESULT_COLUMN);
          var columnCount = Object.keys(columns).length;
          resultObject = [ ];
          var arrayCachedPush = Array.prototype.push;
          var compactArray;
          for (var i = 1, resultCount = Number(parsedObject.RESULT_DATA_CNT); i <= resultCount; i++) {
            compactArray = JSON.parse(parsedObject["RESULT_DATA" + i]);
            for (var row = 0, rowCount = compactArray.length; row < rowCount; row++) {
              for (var col = 0; col < columnCount; col++) {
                compactArray[row][columns[col]] = compactArray[row][col];
                delete compactArray[row][col];
              }
            }
            arrayCachedPush.apply(resultObject, compactArray);
            delete parsedObject["RESULT_DATA" + i];
          }
          delete compactArray;
        } else {
          if (parsedObject.RESULT_DATA != undefined && parsedObject.RESULT_DATA != null) { // {컬럼명: 컬럼값} 형태의 리스트형 결과
            resultObject = JSON.parse(parsedObject.RESULT_DATA);
            delete parsedObject.RESULT_DATA;
          }
        }
      } catch (e) {
      }
      return resultObject || [ ];
    };

    /**
     * Array, Object를 JsonString로 변환
     * 
     * @param srcObject
     *          Array, Object
     * @returns {String}
     */
    $NC.toJson = function(srcObject) {

      var resultData = null;
      if ($.isPlainObject(srcObject) || Array.isArray(srcObject)) {
        resultData = JSON.stringify(srcObject);
      }
      return resultData || "";
    };

    /**
     * Object 복사
     * 
     * @param target
     *          대상 Object
     * @returns {Object}
     */
    $NC.cloneObject = function(target) {

      if (target == null || typeof target != "object") {
        return target;
      }
      var result = target.constructor();
      for ( var attr in target) {
        if (target.hasOwnProperty(attr)) {
          result[attr] = target[attr];
        }
      }
      return result;
    };

    /**
     * Null 인지 체크
     * 
     * @param obj
     *          체크할 Object
     * @returns {Boolean}
     */
    $NC.isNull = function(obj) {

      if (obj == undefined || obj == null) {
        return true;
      }

      // JavaScript Data Types: String, Number, Boolean, Array, Object, Null, Undefined.
      switch (typeof obj) {
      case "string":
        return obj.trim() == "";
        // case "object":
        // if (Array.isArray(obj)) {
        // return obj.length == 0;
        // }
        // else if (obj.constructor !== Date) {
        // return $.isEmptyObject(obj);
        // }
        // case "number":
        // return isNaN(obj);
      default:
        return false;
      }
    };

    /**
     * 상품 중량 구하기
     * 
     * @returns {Number}
     */
    $NC.getWeight = function(item_Qty, qty_In_Box, box_Weight) {

      item_Qty = Number(item_Qty);
      if (isNaN(item_Qty) || item_Qty === 0) {
        return 0;
      }

      box_Weight = Number(box_Weight);
      if (isNaN(box_Weight) || box_Weight === 0) {
        return 0;
      }

      qty_In_Box = Number(qty_In_Box);
      if (isNaN(qty_In_Box) || qty_In_Box === 0) {
        qty_In_Box = 1;
      }

      return Math.round((item_Qty / qty_In_Box) * box_Weight * 100) / 100;
    };

    /**
     * 숫자에 콤마 추가
     * 
     * @param value
     * @returns {String}<br>
     *          #,##0
     */
    $NC.getDisplayNumber = function(value) {

      if (value == undefined || value == null) {
        return "";
      }

      value += "";
      var valArray = value.split(".");
      var intVal = valArray[0];
      var dblVal = valArray.length > 1 ? "." + valArray[1] : "";
      var regEx = /(\d+)(\d{3})/;
      while (regEx.test(intVal)) {
        intVal = intVal.replace(regEx, '$1' + ',' + '$2');
      }

      return intVal + ($NC.isNull(dblVal) ? "" : dblVal);
    };

    /**
     * 매입금액 또는 공급금액 계산
     * 
     * @param params
     *          ITEM_PRICE 매입단가 또는 공급단가<br>
     *          APPLY_PRICE 적용단가<br>
     *          ITEM_QTY 상품수량<br>
     *          ITEM_AMT 매입금액 또는 공급금액<br>
     *          POLICY_VAL 매입금액/공급금액 계산 정책값<br>
     * @returns {Number}
     */
    $NC.getItem_Amt = function(params) {

      var result;

      // 매입(공급)단가 * 수량
      if (params.POLICY_VAL == "1") {
        result = params.ITEM_PRICE * params.ITEM_QTY;
      }
      // 적용단가 * 수량
      else if (params.POLICY_VAL == "2") {
        result = params.APPLY_PRICE * params.ITEM_QTY;
      } else {
        result = params.ITEM_AMT;
      }

      return result || 0;
    };

    /**
     * 합계금액 계산
     * 
     * @param params
     *          파라메터 타입1<br>
     *          ITEM_AMT 매입금액 또는 공급금액<br>
     *          VAT_AMT 부가세<br>
     *          DC_AMT 할인금액<br>
     *          TOTAL_AMT 합계금액<br>
     *          POLICY_VAL 매입금액/공급금액 계산 정책값<br>
     *          <br>
     *          파라메터 타입2<br>
     *          ITEM_PRICE 매입단가 또는 공급단가<br>
     *          APPLY_PRICE 적용단가<br>
     *          ITEM_QTY 상품수량<br>
     *          ITEM_AMT 매입금액 또는 공급금액<br>
     *          VAT_YN 과세여부가 NULL일 경우는 부가세금액이 있는지로 체크<br>
     *          VAT_AMT 부가세<br>
     *          DC_AMT 할인금액<br>
     *          TOTAL_AMT 합계금액<br>
     *          POLICY_VAL 매입금액/공급금액 계산 정책값<br>
     * @returns {Number}
     */
    $NC.getTotal_Amt = function(params) {

      var result;

      if (params.ITEM_QTY != undefined) {
        if (params.POLICY_VAL == "1" || params.POLICY_VAL == "2") {
          // 매입(공급)금액 계산
          var V_ITEM_AMT = $NC.getItem_Amt({
            ITEM_PRICE: params.ITEM_PRICE,
            APPLY_PRICE: params.APPLY_PRICE,
            ITEM_QTY: params.ITEM_QTY,
            ITEM_AMT: params.ITEM_AMT,
            POLICY_VAL: params.POLICY_VAL
          });

          // 부가세 계산
          var V_VAT_AMT = $NC.getVat_Amt({
            ITEM_AMT: V_ITEM_AMT,
            VAT_YN: params.VAT_YN,
            VAT_AMT: params.VAT_AMT,
            POLICY_VAL: params.POLICY_VAL
          });

          result = V_ITEM_AMT + V_VAT_AMT - params.DC_AMT;
        } else {
          result = params.TOTAL_AMT;
        }
      } else {
        if (params.POLICY_VAL == "1" || params.POLICY_VAL == "2") {
          result = params.ITEM_AMT + params.VAT_AMT - params.DC_AMT;
        } else {
          result = params.TOTAL_AMT;
        }
      }

      return result || 0;
    };

    /**
     * 부가세 계산
     * 
     * @param params
     *          파라메터 타입1<br>
     *          ITEM_AMT 매입금액 또는 공급금액<br>
     *          VAT_YN 과세여부가 NULL일 경우는 부가세금액이 있는지로 체크<br>
     *          VAT_AMT 부가세<br>
     *          POLICY_VAL 매입금액/공급금액 계산 정책값<br>
     *          <br>
     *          파라메터 타입2<br>
     *          ITEM_PRICE 매입단가 또는 공급단가<br>
     *          APPLY_PRICE 적용단가<br>
     *          ITEM_QTY 상품수량<br>
     *          ITEM_AMT 매입금액 또는 공급금액<br>
     *          VAT_YN 과세여부가 NULL일 경우는 부가세금액이 있는지로 체크<br>
     *          VAT_AMT 부가세<br>
     *          POLICY_VAL 매입금액/공급금액 계산 정책값<br>
     * @returns {Number}
     */
    $NC.getVat_Amt = function(params) {

      var result;

      if (params.ITEM_QTY != undefined) {
        if (params.POLICY_VAL == "1" || params.POLICY_VAL == "2") {
          if (params.VAT_AMT > 0 || params.VAT_YN == "Y") {
            // 매입(공급)금액 계산
            var V_ITEM_AMT = $NC.getItem_Amt({
              ITEM_PRICE: params.ITEM_PRICE,
              APPLY_PRICE: params.APPLY_PRICE,
              ITEM_QTY: params.ITEM_QTY,
              ITEM_AMT: params.ITEM_AMT,
              POLICY_VAL: params.POLICY_VAL
            });
            result = $NC.getTruncVal(V_ITEM_AMT * 0.1);
          } else {
            result = 0;
          }
        } else {
          result = params.VAT_AMT;
        }

      } else {
        if (params.POLICY_VAL == "1" || params.POLICY_VAL == "2") {
          if (params.VAT_AMT > 0 || params.VAT_YN == "Y") {
            result = $NC.getTruncVal(params.ITEM_AMT * 0.1);
          } else {
            result = 0;
          }

        } else {
          result = params.VAT_AMT;
        }
      }

      return result || 0;
    };

    /**
     * 숫자 값 Truncate 처리
     * 
     * @param n
     *          숫자 값
     * @param m
     *          자릿수, + 값 소숫점, - 값 정수
     * @returns {Number}
     */
    $NC.getTruncVal = function(n, m) {

      if (isNaN(n)) {
        return 0;
      }
      if (m == undefined || m == null) {
        m = 0;
      }
      if (m == 0) {
        return Math[n > 0 ? "floor" : "ceil"](n);
      } else {
        var d = Math.pow(10, m);
        return Math[n > 0 ? "floor" : "ceil"](n * d) / d;
      }
    };

    /**
     * 숫자 값 Round 처리
     * 
     * @param n
     *          숫자 값
     * @param m
     *          자릿수, + 값 소숫점, - 값 정수
     * @returns {Number}
     */
    $NC.getRoundVal = function(n, m) {

      if (isNaN(n)) {
        return 0;
      }
      if (m == undefined || m == null) {
        m = 0;
      }
      if (m == 0) {
        return Math.round(n);
      } else {
        if (m > 0) {
          return parseFloat(n.toFixed(m));
        } else {
          var d = Math.pow(10, m);
          var t = Math.round(n * d) / d;
          return parseFloat(t.toFixed(0));
        }
      }
    };

    /**
     * BOX기준 BOX수량 구하기
     * 
     * @returns {Number}
     */

    $NC.getB_Box = function(item_Qty, qty_In_Box) {

      item_Qty = Number(item_Qty);
      if (isNaN(item_Qty) || item_Qty === 0) {
        return 0;
      }

      qty_In_Box = Number(qty_In_Box);
      if (isNaN(qty_In_Box) || qty_In_Box === 0) {
        qty_In_Box = 1;
      }

      return parseInt(item_Qty / qty_In_Box);
    };

    /**
     * BOX기준 EA수량 구하기
     * 
     * @returns {Number}
     */

    $NC.getB_Ea = function(item_Qty, qty_In_Box) {

      item_Qty = Number(item_Qty);
      if (isNaN(item_Qty) || item_Qty === 0) {
        return 0;
      }

      qty_In_Box = Number(qty_In_Box);
      if (isNaN(qty_In_Box) || qty_In_Box === 0) {
        qty_In_Box = 1;
      }

      return item_Qty % qty_In_Box;
    };

    /**
     * 숫자로 변경, 숫자가 아닐 경우 0 리턴
     * 
     * @param value
     * @returns {Number}
     */
    $NC.toNumber = function(value) {

      return Number(value) || 0;
    };

    /**
     * 값이 null일 경우 기본값 리턴
     * 
     * @param value
     * @param defaultValue
     * @returns {Object}
     */

    $NC.nullToDefault = function(value, defaultValue) {

      return $NC.isNull(value) ? defaultValue : value;
    };

    /**
     * str이 len 보다 짧을 경우 char를 앞에 채움
     * 
     * @param str
     * @param len
     * @param chr
     * @returns {String}
     */
    $NC.lPad = function(str, len, chr) {

      var strPad = "";
      var chrPad = $NC.nullToDefault(chr, "0");
      var val = $NC.nullToDefault(str, "");
      for (var i = val.length; i < len; i++) {
        strPad += chrPad;
      }

      return strPad + val;
    };

    /**
     * str이 len 보다 짧을 경우 char를 뒤에 채움
     * 
     * @param str
     * @param len
     * @param char
     * @returns {String}
     */

    $NC.rPad = function(str, len, chr) {

      var strPad = "";
      var chrPad = $NC.nullToDefault(chr, "0");
      var val = $NC.nullToDefault(str, "");
      for (var i = val.length; i < len; i++) {
        strPad += chrPad;
      }

      return val + strPad;
    };

    /**
     * Parameter 의 null 값을 빈문자열[""]로 변경하여 리턴
     * 
     * @param params
     *          Parameter Object
     * @param toJson
     *          Json 형태로 변경여부, 기본값: true
     * @returns {String}
     */
    $NC.getParams = function(params, toJson) {

      if (Array.isArray(params)) {
        for (var i = 0, paramCount = params.length; i < paramCount; i++) {
          for ( var name in params[i]) {
            if ($NC.isNull(params[i][name])) {
              params[i][name] = "";
            }
          }
        }
      } else {
        for ( var name in params) {
          if ($NC.isNull(params[name])) {
            params[name] = "";
          }
        }
      }

      if ($NC.isNull(toJson) || toJson) {
        return $NC.toJson(params);
      } else {
        return params;
      }
    };

    /**
     * Input(Edit, CheckBox, RadioButton ...), Select 값 리턴
     * 
     * @param selector
     *          대상 Selector: "#edt...", JQuery Object
     * @param emptyOption
     *          값이 비어 있을 경우 리턴할 값, 미지정시 빈문자열<br>
     *          boolean: true 일 경우 "%" 리턴<br>
     *          string: 지정 값 리턴
     * @returns {String}
     */

    $NC.getValue = function(selector, emptyOption) {

      var result = "";
      var view = $NC.getView(selector);
      if (view.length === 0) {
        if ($NC.isNull(emptyOption)) {
          emptyOption = false;
        }
        if ($.type(emptyOption) == "boolean") {
          return emptyOption == true ? "%" : "";
        } else {
          return emptyOption;
        }
      }

      switch (view[0].type) {
      case "text":
      case "textarea":
      case "hidden":
      case "password":
      case "select-one":
      case "select-multiple":
      case "button":
      case "file":
        result = view.val();
        break;
      case "checkbox":
      case "radio":
        result = view.val();
        // 체크되어 있으면
        // value 값이 세팅되어 있지 않은 경우
        if (result === "on") {
          // 체크되어 있으면 Y
          if (view.is(":checked")) {
            result = "Y";
          } else {
            result = "N";
          }
        } else {
          // value 값이 세팅되어 있을 때 체크되어 있지 않으면 ""
          if (!view.is(":checked")) {
            result = "";
          }
        }
        break;
      default:
        switch (view[0].tagName) {
        case "DIV":
        case "TD":
          result = view.text();
          break;
        }
      }

      if ($NC.isNull(result)) {
        if ($NC.isNull(emptyOption)) {
          emptyOption = false;
        }
        if ($.type(emptyOption) == "boolean") {
          return emptyOption == true ? "%" : "";
        } else {
          return emptyOption;
        }
      }
      return result;
    };

    /**
     * Input(Edit, CheckBox, RadioButton ...), Select 값 세팅
     * 
     * @param selector
     *          대상 Selector: "#edt...", JQuery Object
     * @param value
     *          세팅 값, 미지정시 Clear
     */
    $NC.setValue = function(selector, value) {

      var views = $NC.getView(selector);
      var viewCount = views.length;
      if (viewCount == 0) {
        return false;
      }

      var view;
      for (var i = 0; i < viewCount; i++) {
        view = $(views[i]);

        switch (view[0].type) {
        case "text":
          if (view.hasClass("hasDatepicker") && !$NC.isNull(value)) {
            var minDate = $NC.getOptionDatePicker(view, "minDate");
            if (!$NC.isNull(minDate) && (minDate > value)) {
              value = minDate;
            }
          }
          view.val($NC.isNull(value) ? "" : value);
          break;
        case "textarea":
        case "hidden":
        case "password":
        case "button":
          view.val($NC.isNull(value) ? "" : value);
          break;
        case "select-one":
        case "select-multiple":
          if ($NC.isNull(value)) {
            view.prop("selectedIndex", -1);
          } else {
            if ($.type(value) === "number") {
              view.prop("selectedIndex", value);
              if (view.prop("selectedIndex") === -1) {
                return false;
              }
            } else {
              view.val(value);
              if (value !== view.val()) {
                view.prop("selectedIndex", -1);
                return false;
              }
            }
          }
          break;
        case "checkbox":
        case "radio":
          // Null 이면 체크해제
          if ($NC.isNull(value)) {
            view.prop("checked", false);
          } else {
            // Boolean 값일 경우
            if ($.type(value) === "boolean") {
              view.prop("checked", value);
            } else if (value.match(/Y|N/)) {
              // Y/N 값일 경우
              view.prop("checked", value === "Y");
            } else {
              // 그 외
              view.prop("checked", value !== "0");
            }
          }
          break;
        default:
          view.text($NC.isNull(value) ? "" : value);
          break;
        }
      }
      return true;
    };

    /**
     * 포커스 주기
     * 
     * @param selector
     *          포커스를 줄 Object
     * @param withWindow
     *          jWindow Object에도 포커스를 줄지 여부
     * @param waitTime
     *          대기시간
     */
    $NC.setFocus = function(selector, withWindow, waitTime) {

      if ($NC.isNull(waitTime)) {
        if (withWindow) {
          waitTime = 300;
        } else {
          waitTime = 100;
        }
      }
      setTimeout(function() {
        if (withWindow) {
          if (!$NC.isNull($NC.G_JWINDOW)) {
            $NC.G_JWINDOW.focus();
          }
        }

        var view = $NC.getView(selector);
        view.focus();
        if (view.is("input:text")) {
          view.select();
        }
      }, waitTime);
    };

    /**
     * Select(ComboBox) 값 세팅
     * 
     * @param requestUrl
     *          서비스 호출 Url
     * @param requestData
     *          서비스 호출 파라메터
     * @param comboOptions
     *          Select(ComboBox) 옵션<br>
     *          [S]selector[필수]: Select(ComboBox) Selector(#cboCenter_Cd ...), Selector(['#cboCenter_Cd'])<br>
     *          [S]codeField[필수]: 코드 필드명<br>
     *          [S]nameField[필수]: 명 필드명<br>
     *          [S]fullNameField[필수]: 코드 - 명 필드명 -> 코드 - 명 필드가 지정되면 코드 - 명 필드를 표시<br>
     *          [A]data[옵션]: 데이터, 데이터를 넘겨줄 경우 서비스 호출하지 않음<br>
     *          [B]addAll[옵션]: % - 전체 추가 여부 - addAll, addEmpty, addCustom는 셋 중 하나 선택<br>
     *          [B]addEmpty[옵션]: 빈 값 추가 여부 - addAll, addEmpty, addCustom는 셋 중 하나 선택<br>
     *          [O]addCustom[옵션]: 특정 값 추가, {codeFieldVal: "", nameFieldVal: ""} - addAll, addEmpty, addCustom는 셋 중 하나 선택<br>
     *          [S]selectVal: 초기 값 선택 - 특정 값으로 선택, selectVal, selectOption은 둘 중 하나 지정<br>
     *          [S]selectOption: 초기 값 선택 - "F" - 첫번째, "L" - 마지막 선택, selectVal, selectOption은 둘 중 하나 지정<br>
     *          [F]onComplete[옵션]: 완료시 호출할 Event<br>
     *          [B]forceSync: 초기값 비동기(async), true시 동기화(완료시까지 대기 함)<br>
     */
    $NC.setInitCombo = function(requestUrl, requestData, comboOptions) {

      var comboInitFn = function(resultSet) {

        var optionStr = "";
        if (comboOptions.addAll) {
          optionStr += "<option value='%'>%" + $NC.G_CONSTS.DIV_COMBO + "전체</option>";
        } else if (comboOptions.addEmpty) {
          optionStr += "<option value=''></option>";
        } else if (comboOptions.addCustom) {
          optionStr += "<option value='" + comboOptions.addCustom.codeFieldVal + "'>"
              + comboOptions.addCustom.codeFieldVal + $NC.G_CONSTS.DIV_COMBO + comboOptions.addCustom.nameFieldVal
              + "</option>";
        }
        // 코드 - 명에 대한 항목이 있을 경우는 그대로 표시
        var rowData;
        if (comboOptions.fullNameField) {
          for (var row = 0, rowCount = resultSet.length; row < rowCount; row++) {
            rowData = resultSet[row];
            optionStr += "<option value='" + rowData[comboOptions.codeField] + "'>"
                + rowData[comboOptions.fullNameField] + "</option>";
          }
        } else {
          for (var row = 0, rowCount = resultSet.length; row < rowCount; row++) {
            rowData = resultSet[row];
            optionStr += "<option value='" + rowData[comboOptions.codeField] + "'>" + rowData[comboOptions.codeField]
                + $NC.G_CONSTS.DIV_COMBO + rowData[comboOptions.nameField] + "</option>";
          }
        }
        var selector = comboOptions.selector
          ,cboObj
        if (typeof selector === 'string') {
          cboObj = $(selector).empty();
          cboObj.append(optionStr);
        } else {
          for (var i in selector) {
            cboObj = $(selector[i]).empty();
            cboObj.append(optionStr);
          }
        }
        
        if (!$NC.isNull(comboOptions.selectVal)) {
          $NC.setValue(cboObj, comboOptions.selectVal);
        } else if (!$NC.isNull(comboOptions.selectOption)) {
          if (comboOptions.selectOption == "L") {
            $NC.setValue(cboObj, cboObj.children("option").length - 1);
          } else {
            $NC.setValue(cboObj, 0);
          }
        }
        if (comboOptions.onComplete) {
          comboOptions.onComplete(resultSet);
        }
      };

      if (comboOptions && comboOptions.data && Array.isArray(comboOptions.data)) {

        comboInitFn(comboOptions.data);

      } else {
        var serviceCallFn;
        if ($NC.isNull(comboOptions.forceSync) || comboOptions.forceSync == false) {
          serviceCallFn = $NC.serviceCall;
        } else {
          serviceCallFn = $NC.serviceCallAndWait;
        }

        serviceCallFn(requestUrl, requestData, function(ajaxData) {

          comboInitFn($NC.toArray(ajaxData));

        }, $.isFunction(comboOptions.onError) ? comboOptions.onError : $NC.onError);
      }
    };

    /**
     * DatePicker 로 세팅
     * 
     * @param selector
     * @param date
     * @param option
     *          오늘날짜: Null<br>
     *          빈 값: N<br>
     *          월의 시작일자: F<br>
     *          월의 마지막일자: L<br>
     */
    $NC.setInitDatePicker = function(selector, date, option) {

      var view = $NC.getView(selector);
      if (view.length == 0) {
        return;
      }

      if (!view.hasClass("hasDatepicker")) {
        view.wrap("<div style='display: inline-block;'></div>");
        view.datepicker({
          dateFormat: "yy-mm-dd",
          changeYear: true,
          changeMonth: true,
          showOtherMonths: true,
          selectOtherMonths: true,
          showButtonPanel: true,
          showOn: "button",
          buttonImage: "../../layout/common/redmond/image/calendar.gif",
          buttonImageOnly: false,
          beforeShow: function(input, inst) {
            $(this).removeData("lastDate");
            $(this).data("lastDate", $(this).val());
            setTimeout(function() {
              $.datepicker.dpDiv.css("z-index", 200);
            }, 100);
          },
          onSelect: function(dateText, inst) {
            if ($(this).data("lastDate") !== dateText) {
              $(this).change();
            }
            $(this).removeData("lastDate");
          }
        });
        // view.width(78);
        // datepicker trigger button 스타일 적용
        var btnPopup = view.next("button");
        btnPopup.addClass("ui-btn-dtppopup").prop("hideFocus", true);
        btnPopup.children("img").prop("alt", "달력");
        btnPopup.children("img").prop("title", "달력");
        // 마우스휠로 날짜 변경
        view.mousewheel($NC.onDatePickerMouseWheel);
      }

      if ($NC.isNull(date)) {
        date = $NC.G_USERINFO.LOGIN_DATE;
      }
      if ($NC.isNull(option)) {
        $NC.setValue(view, date);
      } else {
        if (option === "F") {
          $NC.setValue(view, $NC.getFirstDate(date));
        } else if (option === "L") {
          $NC.setValue(view, $NC.getLastDate(date));
        } else {
          $NC.setValue(view);
        }
      }
    };

    /**
     * MonthPicker 로 세팅
     * 
     * @param selector
     * @param date
     */
    $NC.setInitMonthPicker = function(selector, date) {

      var view = $NC.getView(selector);
      if (view.length == 0) {
        return;
      }

      if (!view.hasClass("hasMonthpicker")) {
        view.monthpicker({
          dateFormat: "yy-mm",
          changeYear: true,
          showOn: "button",
          showButtonPanel: true,
          buttonImage: "../../layout/common/redmond/image/calendar.gif",
          buttonImageOnly: false,
          beforeShow: function(input, inst) {
            $(this).removeData("lastDate");
            $(this).data("lastDate", $(this).val());
            setTimeout(function() {
              $.monthpicker.dpDiv.css("z-index", 200);
            }, 100);
          },
          onSelect: function(dateText, inst) {
            if ($(this).data("lastDate") !== dateText) {
              $(this).change();
            }
            $(this).removeData("lastDate");
          }
        });
        // view.width(78);
        // monthpicker trigger button 스타일 적용
        var btnPopup = view.next("button");
        btnPopup.addClass("ui-btn-mpkpopup").prop("hideFocus", true);
        btnPopup.children("img").prop("alt", "달력");
        btnPopup.children("img").prop("title", "달력");
        // 마우스휠로 날짜 변경
        view.mousewheel($NC.onMonthPickerMouseWheel);
      }

      if ($NC.isNull(date)) {
        date = $NC.G_USERINFO.LOGIN_DATE;
      }
      $NC.setValue(view, date.substr(0, 7));
    };

    /**
     * DatePicker MouseWheel or Keyboard Handler
     */
    $NC.onDatePickerMouseWheel = function(e, delta) {

      var date = $NC.getValue(e.target);
      if ($NC.isNull(date) || $NC.isNull($NC.getDate(date))) {
        return;
      }

      var caretPos = -1;
      if ("selectionStart" in e.target) {
        caretPos = e.target.selectionStart;
      }

      var newDate = date;
      if (e.altKey && !e.shiftKey && !e.ctrlKey) {
        if (delta > 0) {
          // UP
          // $NC.setValue(e.target, $NC.getFirstDate(date));
          newDate = $NC.getFirstDate(date);
        } else {
          // DOWN
          // $NC.setValue(e.target, $NC.getLastDate(date));
          newDate = $NC.getLastDate(date);
        }
      } else {
        var addFn;
        if (caretPos == -1) {
          addFn = $NC.addDay;
        } else if (date.length == 8) {// YYYYMMDD
          if (caretPos <= 4) {
            addFn = $NC.addYear;
          } else if (caretPos <= 6) {
            addFn = $NC.addMonth;
          } else {
            addFn = $NC.addDay;
          }
        } else {// YYYY-MM-DD
          if (caretPos <= 4) {
            addFn = $NC.addYear;
          } else if (caretPos <= 7) {
            addFn = $NC.addMonth;
          } else {
            addFn = $NC.addDay;
          }
        }
        if (delta > 0) {
          // UP
          // $NC.setValue(e.target, addFn(date, -1));
          newDate = addFn(date, -1);
        } else {
          // DOWN
          // $NC.setValue(e.target, addFn(date, 1));
          newDate = addFn(date, 1);
        }
        // Change event 발생
        $(e.target).val(newDate).change();
      }
      // Caret 위치 조정
      if (caretPos != -1) {
        if (date.length == 8) {
          // YYYYMMDD -> YYYY-MM-DD
          if (caretPos >= 7) {
            caretPos = 8;
          } else if (caretPos >= 5) {
            caretPos = 5;
          } else {
            caretPos = 0;
          }
        }
        e.target.selectionStart = caretPos;
        e.target.selectionEnd = caretPos;
      }
    };

    /**
     * MonthPicker MouseWheel or Keyboard Handler
     */
    $NC.onMonthPickerMouseWheel = function(e, delta) {

      var date = $NC.getValue(e.target);
      var oldMonth = $NC.getMonth(date);
      if ($NC.isNull(date) || $NC.isNull(oldMonth)) {
        return;
      }

      var newMonth = date;
      var caretPos = -1;
      if ("selectionStart" in e.target) {
        caretPos = e.target.selectionStart;
      }

      if (e.altKey && !e.shiftKey && !e.ctrlKey) {
        if (delta > 0) {
          // UP
          // $NC.setValue(e.target, date.substr(0, 4) + $NC.G_CONSTS.DIV_DATE + "01");
          newMonth = date.substr(0, 4) + $NC.G_CONSTS.DIV_DATE + "01";
        } else {
          // DOWN
          // $NC.setValue(e.target, date.substr(0, 4) + $NC.G_CONSTS.DIV_DATE + "12");
          newMonth = date.substr(0, 4) + $NC.G_CONSTS.DIV_DATE + "12";
        }
      } else {
        var addFn;
        if (caretPos == -1) {
          addFn = $NC.addDay;
        } else if (date.length == 6) {// YYYYMM
          if (caretPos <= 4) {
            addFn = $NC.addYear;
          } else {
            addFn = $NC.addMonth;
          }
        } else {// YYYY-MM
          if (caretPos <= 4) {
            addFn = $NC.addYear;
          } else {
            addFn = $NC.addMonth;
          }
        }
        if (delta > 0) {
          // UP
          // $NC.setValue(e.target, addFn(oldMonth + $NC.G_CONSTS.DIV_DATE + "01", -1).substr(0, 7));
          newMonth = addFn(oldMonth + $NC.G_CONSTS.DIV_DATE + "01", -1).substr(0, 7);
        } else {
          // DOWN
          // $NC.setValue(e.target, addFn(oldMonth + $NC.G_CONSTS.DIV_DATE + "01", 1).substr(0, 7));
          newMonth = addFn(oldMonth + $NC.G_CONSTS.DIV_DATE + "01", 1).substr(0, 7);
        }
        // Change event 발생
        $(e.target).val(newMonth).change();
      }
      // Caret 위치 조정
      if (caretPos != -1) {
        if (date.length == 6) {
          // YYYYMMDD -> YYYY-MM-DD
          if (caretPos >= 5) {
            caretPos = 5;
          } else {
            caretPos = 0;
          }
        }
        e.target.selectionStart = caretPos;
        e.target.selectionEnd = caretPos;
      }
    };

    /**
     * Tab로 세팅
     * 
     * @param selector
     * @param option
     *          tabIndex: 초기 탭 Index<br>
     *          onActivate: Tab Activate Event
     */
    $NC.setInitTab = function(selector, option) {

      var view = $NC.getView(selector);
      if (view.length == 0) {
        return;
      }

      if ($NC.isNull(option)) {
        option = {};
      }

      view.tabs({
        active: $NC.isNull(option.tabIndex) ? 0 : option.tabIndex,
        create: function(event, ui) {
          // 탭 사이즈 조정
          var tabNav = $(this).children(".ui-tabs-nav:first").css("padding", "1px");
          tabNav.children().css("line-height", 1);
        },
        activate: option.onActivate
      });
    };

    /**
     * DatePicker의 날짜 세팅<br>
     * date의 값이 정상적인 날짜인지 체크하고 날짜가 아닐 경우 오류메시지 표시
     * 
     * @param selector
     * @param date
     *          날짜: yyyy-mm-dd, yyyymmdd
     * @param errorMessage
     *          오류메시지[옵션]: 날짜 오류일때 표시할 메시지
     * @param clearOption
     *          초기화 옵션[옵션]: 오류시 날짜 초기화 옵션<br>
     *          오늘날짜: Null<br>
     *          빈 값: N<br>
     *          월의 시작일자: F<br>
     *          월의 마지막일자: L<br>
     * @returns boolean: selector가 존재하지 않거나 날짜가 아닐 경우 false, 그 외는 true
     */
    $NC.setValueDatePicker = function(selector, date, errorMessage, clearOption) {

      var result = true;
      var view = $NC.getView(selector);
      if (view.length == 0) {
        return false;
      }
      if (!$NC.isDate(date)) {
        if ($NC.isNull(date) && !view.hasClass("ui-dtp-key")) {
          return result;
        }
        if (!$NC.isNull(errorMessage)) {
          result = false;
          alert(errorMessage);
        }
        date = $NC.G_USERINFO.LOGIN_DATE;
        if ($NC.isNull(clearOption)) {
          // $NC.setValue(view, date);
          view.val(date);
        } else {
          if (clearOption === "F") {
            // $NC.setValue(view, $NC.getFirstDate(date));
            view.val($NC.getFirstDate(date));
          } else if (clearOption === "L") {
            // $NC.setValue(view, $NC.getLastDate(date));
            view.val($NC.getLastDate(date));
          } else {
            // $NC.setValue(view);
            view.val("");
          }
        }
        $NC.setFocus(view);
      } else {
        var minDate = $NC.getOptionDatePicker(view, "minDate");
        var val = $NC.getDate(date);
        if (!$NC.isNull(minDate) && (minDate > val)) {
          result = false;
          alert("지정가능일자: [ " + minDate + " 이후 ]\n\n지정 가능 일자보다 이전 일자로 지정할 수 없습니다.");
          val = minDate;
        }
        // $NC.setValue(view, val);
        view.val(val);
      }
      return result;
    };

    /**
     * MonthPicker의 날짜 세팅<br>
     * date의 값이 정상적인 날짜인지 체크하고 날짜가 아닐 경우 오류메시지 표시
     * 
     * @param selector
     * @param date
     *          날짜: yyyy-mm, yyyymm
     * @param errorMessage
     *          오류메시지[옵션]: 날짜 오류일때 표시할 메시지
     * @param clearOption
     *          초기화 옵션[옵션]: 오류시 날짜 초기화 옵션<br>
     *          오늘월: Null<br>
     *          빈 값: N<br>
     * @returns boolean: selector가 존재하지 않거나 날짜가 아닐 경우 false, 그 외는 true
     */
    $NC.setValueMonthPicker = function(selector, date, errorMessage, clearOption) {
      var result = true;
      var view = $NC.getView(selector);
      if (view.length == 0) {
        return false;
      }
      if (!$NC.isMonth(date)) {
        if ($NC.isNull(date) && !view.hasClass("ui-dtp-key")) {
          return result;
        }
        if (!$NC.isNull(errorMessage)) {
          result = false;
          alert(errorMessage);
        }

        date = $NC.G_USERINFO.LOGIN_DATE;
        if ($NC.isNull(clearOption)) {
          // $NC.setValue(view, date.substr(0, 7));
          view.val(date.substr(0, 7));
        } else {
          if (clearOption === "N") {
            // $NC.setValue(view);
            view.val("");
          }
        }
        $NC.setFocus(view);
      } else {
        // $NC.setValue(view, $NC.getMonth(date));
        view.val($NC.getMonth(date));
      }
      return result;
    };

    /**
     * DatePicker의 옵션 값 리턴<br>
     * setInitDatePicker로 초기화가 되어 있을 경우만 적용
     * 
     * @param selector
     * @param option
     *          옵션 명, "minDate", "maxDate"
     * @returns {String}
     */
    $NC.getOptionDatePicker = function(selector, option) {

      var result = "";
      var view = $NC.getView(selector);
      if (view.length == 0) {
        return result;
      }
      if (!view.hasClass("hasDatepicker")) {
        return result;
      }

      return view.datepicker("option", option);
    };

    /**
     * DatePicker의 옵션 세팅<br>
     * setInitDatePicker로 초기화가 되어 있을 경우만 적용
     * 
     * @param selector
     * @param option
     *          옵션 명, "minDate", "maxDate"
     * @param val
     *          옵션 값
     * @returns {Boolean}
     */
    $NC.setOptionDatePicker = function(selector, option, val) {

      var result = true;
      var view = $NC.getView(selector);
      if (view.length == 0) {
        return false;
      }
      if (!view.hasClass("hasDatepicker")) {
        return false;
      }

      view.datepicker("option", option, val);

      var btnPopup = view.next("button");
      btnPopup.addClass("ui-btn-dtppopup").prop("hideFocus", true);
      btnPopup.children("img").prop("alt", "달력");
      btnPopup.children("img").prop("title", "달력");

      return result;
    };

    /**
     * Splitter 로 세팅, Splitter는 _Initialize에서 초기화하지 않고 _OnLoaded에서 초기화 처리
     * 
     * @param selector
     * @param style
     *          "v" -> Vertical(화면은 좌우로 나눔)<br>
     *          "h" -> Horizontal(화면은 상하로 나눔)
     * @param initPos
     *          초기 위치, 미지정시 200
     * @param minLT
     *          View 최소 사이즈 Left, Top
     * @param minRB
     *          View 최소 사이즈 Right, Bottom
     */
    $NC.setInitSplitter = function(selector, style, initPos, minLT, minRB) {

      if ($NC.isNull(initPos)) {
        initPos = 200;
      }
      if ($NC.isNull(minLT)) {
        minLT = 100;
      }
      if ($NC.isNull(minRB)) {
        minRB = 100;
      }
      // Horizontal, 상하
      if (style === "h") {
        $(selector).children("div:first").height(initPos);
        $(selector).splitter({
          type: style,
          outline: true,
          resizeToWidth: true,
          minTop: minLT,
          minBottom: minRB,
          sizeTop: initPos
        });
      } else {
        $(selector).children("div:first").width(initPos);
        // Vertical, 좌우
        $(selector).splitter({
          type: style,
          outline: true,
          resizeToWidth: true,
          minLeft: minLT,
          minRight: minRB,
          sizeLeft: initPos
        });
      }
    };

    /**
     * Div 가 Splitter로 생성되었는지 여부
     * 
     * @param selector
     * @returns {Boolean}
     */
    $NC.isSplitter = function(selector) {
      var view = $NC.getView(selector);
      if (view.length == 0) {
        return false;
      }
      var result = false;
      if (view.attr("data-splitter-initialized")) {
        result = true;
      }
      return result;
    };

    /**
     * 날짜인지 체크
     * 
     * @param dateString
     * @returns {Boolean}
     */
    $NC.isDate = function(dateString) {

      var dateArray = getDateArray(dateString);
      if (dateArray.length != 3) {
        return false;
      }

      var dateObj = new Date(Number(dateArray[0]), Number(dateArray[1]) - 1, Number(dateArray[2]));
      if (dateObj.toString() === "Invalid Date") {
        return false;
      } else {
        if (addDateSeparator(dateString) !== $NC.dateToStr(dateObj)) {
          return false;
        }
      }

      return true;
    };

    /**
     * 연월인지 체크
     * 
     * @param monthString
     * @returns {Boolean}
     */
    $NC.isMonth = function(monthString) {

      var dateArray = getMonthArray(monthString);
      if (dateArray.length != 2) {
        return false;
      }

      var dateObj = new Date(Number(dateArray[0]), Number(dateArray[1]) - 1, 1);
      if (dateObj.toString() === "Invalid Date") {
        return false;
      } else {
        if (addDateSeparator(monthString, true) !== $NC.dateToStr(dateObj, true)) {
          return false;
        }
      }

      return true;
    };

    /**
     * 날짜인지 체크하여 정상적인 날짜면 YYYY-MM-DD 형식으로 리턴
     * 
     * @param dateString
     * @param returnDateObject
     *          return 값을 Date Object로 리턴할지 여부
     * @returns {Object}
     */
    $NC.getDate = function(dateString, returnDateObject) {

      var resultDateString = addDateSeparator(dateString);
      var dateArray = getDateArray(resultDateString);
      if (dateArray.length != 3) {
        return "";
      }

      var resultDateObject = new Date(Number(dateArray[0]), Number(dateArray[1]) - 1, Number(dateArray[2]));
      if (resultDateObject.toString() === "Invalid Date") {
        return "";
      } else {
        if (resultDateString !== $NC.dateToStr(resultDateObject)) {
          return "";
        }
      }

      if ($NC.isNull(returnDateObject)) {
        returnDateObject = false;
      }

      return !returnDateObject ? resultDateString : resultDateObject;
    };

    /**
     * 날짜인지 체크하여 정상적인 날짜면 YYYY-MM 형식으로 리턴
     * 
     * @param dateString
     * @param returnDateObject
     *          return 값을 Date Object로 리턴할지 여부
     * @returns {Object}
     */
    $NC.getMonth = function(dateString, returnDateObject) {

      var resultDateString = addDateSeparator(dateString, true);
      var dateArray = getMonthArray(resultDateString);
      if (dateArray.length != 2) {
        return "";
      }

      var resultDateObject = new Date(Number(dateArray[0]), Number(dateArray[1]) - 1, 1);
      if (resultDateObject.toString() === "Invalid Date") {
        return "";
      } else {
        if (resultDateString !== $NC.dateToStr(resultDateObject, true)) {
          return "";
        }
      }

      if ($NC.isNull(returnDateObject)) {
        returnDateObject = false;
      }

      return !returnDateObject ? resultDateString : resultDateObject;
    };

    /**
     * Date Object의 날짜를 문자열로 Return
     * 
     * @param date
     * @param onlyMonth
     * @returns {String}
     */
    $NC.dateToStr = function(date, onlyMonth) {

      if ($NC.isNull(date)) {
        return "";
      }

      var y = date.getFullYear();
      var m = date.getMonth() + 1;
      var d = date.getDate();
      if (onlyMonth) {
        return y + $NC.G_CONSTS.DIV_DATE + (m <= 9 ? "0" + m : m);
      } else {
        return y + $NC.G_CONSTS.DIV_DATE + (m <= 9 ? "0" + m : m) + $NC.G_CONSTS.DIV_DATE + (d <= 9 ? "0" + d : d);
      }
    };

    /**
     * 해당 월의 1일 Return
     * 
     * @param date
     * @returns {String}
     */
    $NC.getFirstDate = function(date) {

      if ($NC.isNull(date)) {
        return "";
      }
      if (typeof (date) == "string") {
        date = $NC.getDate(date);
        if ($NC.isNull(date)) {
          return "";
        }
        return date.substr(0, 8) + "01";
      }

      if (typeof (date) != "object" || date.constructor.toString().indexOf("Date()") == -1) {
        return "";
      }

      var dateObj = new Date(date);
      dateObj.setDate(1);
      return $NC.dateToStr(dateObj);
    };

    /**
     * 해당 월의 마지막날 Return
     * 
     * @param date
     * @returns {String}
     */
    $NC.getLastDate = function(date) {

      if ($NC.isNull(date)) {
        return "";
      }

      if (typeof (date) == "string") {
        date = $NC.getDate(date);
        if ($NC.isNull(date)) {
          return "";
        }
        var dateArray = date.split($NC.G_CONSTS.DIV_DATE);
        date = new Date(Number(dateArray[0]), Number(dateArray[1]) - 1, Number(dateArray[2]));
      } else if (typeof (date) != "object" || date.constructor.toString().indexOf("Date()") == -1) {
        return "";
      }

      var baseDateObj = new Date(date);
      var dateObj = new Date(baseDateObj.getFullYear(), baseDateObj.getMonth() + 1, 0);
      return $NC.dateToStr(dateObj);
    };

    /**
     * 기준 일자에 년을 더해서 Return
     * 
     * @param date
     * @param addVal
     * @returns {String}
     */
    $NC.addYear = function(date, addVal) {

      if ($NC.isNull(date)) {
        return "";
      }
      if ($NC.isNull(addVal)) {
        return date;
      }

      if (typeof (date) == "string") {
        date = $NC.getDate(date);
        if ($NC.isNull(date)) {
          return "";
        }
        var dateArray = date.split($NC.G_CONSTS.DIV_DATE);
        date = new Date(Number(dateArray[0]), Number(dateArray[1]) - 1, Number(dateArray[2]));
      } else if (typeof (date) != "object" || date.constructor.toString().indexOf("Date()") == -1) {
        return "";
      }

      var dateObj = new Date(date);
      dateObj.setFullYear(dateObj.getFullYear() + Number(addVal));
      return $NC.dateToStr(dateObj);
    };

    /**
     * 기준 일자에 월을 더해서 Return
     * 
     * @param date
     * @param addVal
     * @returns {String}
     */
    $NC.addMonth = function(date, addVal) {

      if ($NC.isNull(date)) {
        return "";
      }
      if ($NC.isNull(addVal)) {
        return date;
      }

      if (typeof (date) == "string") {
        date = $NC.getDate(date);
        if ($NC.isNull(date)) {
          return "";
        }
        var dateArray = date.split($NC.G_CONSTS.DIV_DATE);
        date = new Date(Number(dateArray[0]), Number(dateArray[1]) - 1, Number(dateArray[2]));
      } else if (typeof (date) != "object" || date.constructor.toString().indexOf("Date()") == -1) {
        return "";
      }

      var dateObj = new Date(date);
      dateObj.setMonth(dateObj.getMonth() + Number(addVal));
      return $NC.dateToStr(dateObj);
    };

    /**
     * 기준일자에 일을 더해서 Return
     * 
     * @param date
     * @param addVal
     * @returns {String}
     */
    $NC.addDay = function(date, addVal) {

      if ($NC.isNull(date)) {
        return "";
      }
      if ($NC.isNull(addVal)) {
        return date;
      }

      if (typeof (date) == "string") {
        date = $NC.getDate(date);
        if ($NC.isNull(date)) {
          return "";
        }
        var dateArray = date.split($NC.G_CONSTS.DIV_DATE);
        date = new Date(Number(dateArray[0]), Number(dateArray[1]) - 1, Number(dateArray[2]));
      } else if (typeof (date) != "object" || date.constructor.toString().indexOf("Date()") == -1) {
        return "";
      }

      var dateObj = new Date(date);
      dateObj.setDate(dateObj.getDate() + Number(addVal));
      return $NC.dateToStr(dateObj);
    };

    /**
     * 날짜비교값을 리턴한다.
     * 
     * @param date
     * @param addVal
     * @returns {String}
     */
    $NC.getDiffDate = function(date, option) {
      var d1 = new Date()
        ,d2 = new Date(date)
        ,diffMilSec = d2 - d1
        ,diffSec = diffMilSec / 1000
        ,diffMin = diffSec / 60
        ,diffHour = diffMin / 60
        ,diffDay = diffHour / 24;

      if (option === 'sec' || option === 'second') {
        return Math.floor(diffSec);
      }
      if (option === 'min' || option === 'minite') {
        return Math.floor(diffMin);
      }
      if (option === 'hour') {
        return Math.floor(diffHour);
      }
      if (option === 'day') {
        return Math.floor(diffDay);
      }
      if (option === 'day' || !option) {
        var t2 = d2.getTime();
        var t1 = d1.getTime();
        return parseInt((t2-t1)/(24*3600*1000));
      }
      if (option === 'week') {
        var t2 = d2.getTime();
        var t1 = d1.getTime();
        return parseInt((t2-t1)/(24*3600*1000*7));
      }
      if (option === 'month' || option === 'mon') {
        return Math.floor(diffDay / 30);
      }
      if (option === 'year') {
        return d2.getFullYear()-d1.getFullYear();
      }
    }

    /**
     * 비밀번호 유효성 검사
     * 
     * @param date
     * @param addVal
     * @returns {String}
     */
    $NC.varidationPw = function(pwd, uInfo) {
      var userInfo = uInfo || $NC.G_USERINFO;
      if ($NC.isNull(pwd)) {
        return false;
      }
      
      var chk_num = pwd.search(/[0-9]/g) != -1 ? true : false
        ,chk_eng_low = pwd.search(/[a-z]/g) != -1 ? true : false
        ,chk_eng_high = pwd.search(/[A-Z]/g) != -1 ? true : false
        ,chk_Special = pwd.search(/[~`!@#$%^&*()_+=?<>"',.:;/|\]\[\}\{-]/g) != -1 ? true : false
        ,countKind = 0
        ,msg_contain = '비밀번호에 ID 또는 이름을 포함할 수 없습니다.'
        ,msg_short = '비밀번호는 최소 8자리 이상이어야 합니다.'
        ,msg_mix = '영문 소문자, 대문자, 숫자, 특수문자 중 2가지 이상의 문자 조합 시: 최소 10자리 이상 비밀번호 입력, \r\n영문 소문자, 대문자, 숫자, 특수문자 중 3가지 이상의 문자 조합 시: 최소 8자리 이상 비밀번호 입력 하세요'
        ,msg_continue = '연속된 문자열(1234 또는 4321, abcd, dcba 등)을\n 4자 이상 사용 할 수 없습니다.'
        ,msg_same = '동일문자를 3번 이상 사용할 수 없습니다.';

      if (chk_num) {
        countKind++;
      }
      if (chk_eng_low) {
        countKind++;
      }
      if (chk_eng_high) {
        countKind++;
      }
      if (chk_Special) {
        countKind++;
      }

      // 요건: 비밀번호에 ID를 포함할수 없음 (사번, 생일은 서버에 요청)
      if (pwd.toUpperCase().indexOf(userInfo.USER_ID.toUpperCase()) != -1 || 
          pwd.toUpperCase().indexOf(userInfo.USER_NM.toUpperCase()) != -1) {
        alert(msg_contain);
        return false;
      }
      // 요건: 대문자, 소문자, 숫자, 특수문자조합이 2이면 10자리보다 많아야 한다.
      if (pwd.length < 8) {
        alert(msg_short);
        return false;
      }
      if (countKind < 4 && pwd.length < 8) {
        alert(msg_mix);
        return false;
      }
      if (countKind < 3 && pwd.length < 10) {
        alert(msg_mix);
        return false;
      }
      
      // 동일문자
      var samePass0 = 0; //동일문자 카운트
      var samePass1 = 0; //연속성(+) 카운드
      var samePass2 = 0; //연속성(-) 카운드
      var chr_pass0,
        chr_pass1;
      
      for(var i=0; i < pwd.length; i++){
        chr_pass0 = pwd.charAt(i);
        chr_pass1 = pwd.charAt(i+1);

        //동일문자 카운트
        if(chr_pass0 == chr_pass1) {
          samePass0++;
        }

        //연속성(+) 카운드
        if(chr_pass0.charCodeAt(0) - chr_pass1.charCodeAt(0) == -1) {
          samePass1++;
        }

        //연속성(-) 카운드
        if(chr_pass0.charCodeAt(0) - chr_pass1.charCodeAt(0) == 1) {
          samePass2++;
        }
      }
      if(samePass0 > 1) {
        // 현재까지 업무요건에 없음
        //alert(msg_same);
        //return false;
      }

      if(samePass1 >= 3 || samePass2 >= 3 ) {
        alert(msg_continue); 
        return false;
      }
      return true;
    }

    /**
     * 날짜기간을 한글 스트링으로 반환한다.
     * 
     * @param data
     * @returns {}
     */
    $NC.getPassDivString = function(string) {
      if(string == 'month') {
        return '개월';
      }
      if(string == 'week') {
        return '주';
      }
      if(string == 'day') {
        return '일';
      }
    }
    
    /**
     * 프로그램 메뉴를 hierarchy구조로 반환한다.
     * 
     * @param data
     * @returns {}
     */
    $NC.makeMenuTree = function(data) {
      if ($NC.isNull(data)) {
        return false;
      }
      var result = []
      for (var i in data) {
        var last = result.length-1
        
        // 최상위 그룹
        if (data[i]['MENU_INDENT'] === 0) {
          result.push(data[i]);
          continue;
        }

        // 중간그룹
        if (data[i]['MENU_INDENT'] === 1) {
          if (!result[last].child) {
            result[last].child = [];
          }
          result[last].child.push(data[i]);
          continue;
        }

        // 하위그룹 상위
        if (data[i]['MENU_INDENT'] === 2 && data[i]['PROGRAM_DIV'] === 'M') {
          if (!result[last].child) {
            result[last].child = [];
          }
          result[last].child.push(data[i]);
          continue;
        }

        // 하위그룹 하위
        if (data[i]['MENU_INDENT'] === 2) {
          var childLast = result[last].child.length - 1;
          if (!result[last].child[childLast].child) {
            result[last].child[childLast].child = [];
          }
          result[last].child[childLast].child.push(data[i]);
          continue;
        }
      }
      return result;
    }

    /**
     * option 값에 따라 콤보박스의 선택된 Index 또는 Value를 검색해서 결과 값 리턴
     * 
     * @param selector
     * @param option
     *          TYPE1: option = undefined면 코드 값 리턴, 문자열 값 C, N, F를 입력하면 현재 선택된 Index에서 해당 값 리턴<br>
     *          C: 코드<br>
     *          N: 명<br>
     *          F: 코드명<br>
     *          TYPE2: Object 값, searchVal로 검색하여 returnVal에 해당하는 값 리턴<br>
     *          searchVal: 검색할 Value<br>
     *          returnVal: 리턴할 결과, N, F 중 하나를 입력<br>
     *          N: 명<br>
     *          F: 코드명<br>
     * @returns {String}
     */
    $NC.getValueCombo = function(selector, option) {

      var view = $NC.getView(selector);
      if (view.length == 0) {
        return "";
      }

      var result = "";
      var result_Div = "";
      var divPos = -1;

      if (option == undefined || option == null) {
        option = "C";
      }
      // 현재 선택된 Index에서 해당 값을 리턴
      if (typeof option == "string") {
        result = view.find(":selected").text();
        result_Div = option;
      } else if (typeof option == "object") {
        // 검색한 값에서 해당 값을 리턴
        result = view.find("option[value='" + option.searchVal + "']").text();
        result_Div = option.returnVal;
      }

      if ($NC.isNull(result)) {
        return "";
      }

      // 코드명
      if (result_Div === "F") {
        return result;
      }

      // 구분자가 없으면 값을 그대로 리턴
      divPos = result.indexOf($NC.G_CONSTS.DIV_COMBO);
      if (divPos == -1) {
        return result;
      }

      // 명
      if (result_Div === "N") {
        return result.substr(divPos + 3);
      }

      // 코드
      return result.substr(0, divPos);
    };

    /**
     * RadioGroup 의 선택된 값 리턴
     * 
     * @param selector
     *          대상 Selector: RadioGroup의 Name, JQuery Object
     * @returns {String}
     */
    $NC.getValueRadioGroup = function(selector) {

      var view;
      if ($.type(selector) === "string") {
        view = $("input[type=radio][name=" + selector.replace("#", "") + "]");
      } else {
        view = selector;
      }

      if (view.length === 0) {
        return "";
      }

      var result = $NC.getValue(view.filter(":checked"));
      return $NC.isNull(result) ? "" : result;
    };

    /**
     * CheckBox Group 의 선택된 값 리턴
     * 
     * @param selector
     *          대상 Selector: CheckBox Group Name, JQuery Object
     * @returns {String}
     */
    $NC.getValueCheckGroup = function(selector) {

      var view;
      if ($.type(selector) === "string") {
        view = $("input[type=checkbox][name=" + selector.replace("#", "") + "]");
      } else {
        view = selector;
      }

      if (view.length === 0) {
        return "";
      }

      var result = $NC.getValue(view.filter(":checked"));
      return $NC.isNull(result) ? "" : result;
    };

    /**
     * RadioGroup 의 값 선택
     * 
     * @param selector
     *          대상 Selector: RadioGroup의 Name, JQuery Object
     * @param value
     *          value: 문자열이면 값 선택, 숫자면 Index로 선택, Index는 0부터
     * @returns
     */
    $NC.setValueRadioGroup = function(selector, value) {

      var view;
      if ($.type(selector) === "string") {
        view = $("input[type=radio][name=" + selector + "]");
      } else {
        view = selector;
      }

      if (view.length === 0) {
        return;
      }

      if (value > view.length) {
        return;
      }
      if ($.type(value) === "number") {
        view.get(value).prop("checked", true);
      } else {
        view.filter("[value=" + value + "]").prop("checked", true);
      }
    };

    /**
     * 공통 버튼 활성화 처리
     */
    $NC.setInitTopButtons = function(buttons, printOptions) {

      var topButtons = buttons || $NC.G_VAR.buttons;
      if ($NC.isNull(topButtons)) {
        return;
      }
      var mainDoc = $NC.G_MAIN.document;
      $NC.setEnable($(mainDoc.getElementById("btnTopInquiry")), topButtons._inquiry == "1");
      $NC.setEnable($(mainDoc.getElementById("btnTopNew")), topButtons._new == "1");
      $NC.setEnable($(mainDoc.getElementById("btnTopSave")), topButtons._save == "1");
      $NC.setEnable($(mainDoc.getElementById("btnTopCancel")), topButtons._cancel == "1");
      $NC.setEnable($(mainDoc.getElementById("btnTopDelete")), topButtons._delete == "1");
      if (topButtons._print == "0") {
        $NC.hideView($(mainDoc.getElementById("btnTopPrintList")));
        return;
      }
      var topPrintOptions = printOptions || $NC.G_VAR.printOptions;
      if ($NC.isNull(topPrintOptions)) {
        $NC.hideView($(mainDoc.getElementById("btnTopPrintList")));
        return;
      }
      $NC.G_MAIN.setPrintList(topPrintOptions);
      $NC.showView($(mainDoc.getElementById("btnTopPrintList")), {
        "opacity": 1,
        "width": 58,
        "height": 32,
        "margin": "1px 2px 1px 2px",
        "padding": "5px 4px 4px 28px"
      });
    };

    /**
     * Dialog 가 열려있는지 여부
     * 
     * @param dlgObject
     * @returns {Boolean}
     */
    $NC.isDialogOpen = function(dlgObject) {
      if (dlgObject.length == 0) {
        return false;
      }
      var dlgOpened = false;
      try {
        dlgOpened = dlgObject.dialog("isOpen");
      } catch (e) {
      }
      if (!dlgOpened) {
        if (dlgObject.is(".ui-dialog-content")) {
          dlgOpened = dlgObject.parent().css("display") != "none";
        }
      }
      return dlgOpened;
    };

    /**
     * view animation으로 보이기
     * 
     * @param selector:
     *          대상, string or jQuery Object
     * @param css:
     *          animation 후 정상적으로 표시되지 않는 경우가 있어 최종 Style 적용
     * @param onComplete:
     *          animation 완료 후 실행될 Function
     * @param animSpeed:
     *          "fast", "slow", duration(ms), 기본값: "fast"
     * @param animStyle:
     *          "swing", "blind", "slide", 기본값: "swing"
     */
    $NC.showView = function(selector, css, onComplete, animSpeed, animStyle) {
      var view = $NC.getView(selector);
      if (view.length == 0) {
        return;
      }
      var onCompleteFn = function() {
        if (css) {
          view.css(css);
        }
        if (onComplete) {
          onComplete();
        }
      };
      if ($NC.isNull(animSpeed)) {
        animSpeed = "fast";
      }
      if ($NC.isNull(animStyle)) {
        animStyle = "swing";
      }

      view.show({
        effect: animStyle,
        duration: animSpeed,
        complete: onCompleteFn
      });
    };

    /**
     * view animation으로 숨기기
     * 
     * @param selector:
     *          대상, string or jQuery Object
     * @param onComplete:
     *          animation 완료 후 실행될 Function
     * @param animSpeed:
     *          "fast", "slow", duration(ms), 기본값: "fast"
     * @param animStyle:
     *          "swing", "blind", "slide", 기본값: "swing"
     */
    $NC.hideView = function(selector, onComplete, animSpeed, animStyle) {
      var view = $NC.getView(selector);
      if (view.length == 0) {
        return;
      }
      var onCompleteFn = function() {
        view.css({
          "display": "none"
        });
        if (onComplete) {
          onComplete();
        }
      };
      if ($NC.isNull(animSpeed)) {
        animSpeed = "fast";
      }
      if ($NC.isNull(animStyle)) {
        animStyle = "swing";
      }

      view.hide({
        effect: animStyle,
        duration: animSpeed,
        complete: onCompleteFn
      });
    };

    /**
     * selector로 jQuery Object로 리턴
     * 
     * @param selector
     *          string: selector<br>
     *          object: element object, jquery object
     * @returns {Object}<br>
     *          jQuery Object
     */
    $NC.getView = function(selector) {
      var view;
      if ($.type(selector) === "string") {
        view = $((selector.indexOf("#") == 0 ? "" : "#") + selector);
      } else if ($.type(selector) === "object") {
        if (selector instanceof jQuery) {
          view = selector;
        } else {
          view = $(selector);
        }
      } else {
        view = $(null);
      }
      return view;
    };

    /**
     * selector에서 프로그램ID 파싱
     * 
     * @param selector
     *          EX). #divCS01000E, divCS01000E, CS01000E
     * @returns {String} PROGRAM_ID: EX). CS01000E
     */
    $NC.getProgramId = function(selector) {

      return selector.replace(/^#div|^div/i, "");
    };

    /**
     * 프로그램의 권한 정보 리턴
     * 
     * @param programInfo
     *          프로그램 정보: 선택, 미지정시 단위화면의 권한 정보
     * @returns {Object}<br>
     *          canSave, canDelete, canConfirm, canConfirmCancel
     */
    $NC.getProgramPermission = function(programInfo) {
      var permission = {
        canSave: false,
        canDelete: false,
        canConfirm: false,
        canConfirmCancel: false
      };

      if ($NC.isNull($NC.G_JWINDOW)) {
        return permission;
      }
      if ($NC.isNull(programInfo)) {
        programInfo = $NC.G_JWINDOW.get("userData");
      }
      if ($NC.isNull(programInfo)) {
        return permission;
      }

      permission.canSave = programInfo.EXE_LEVEL1 == "Y";
      permission.canDelete = programInfo.EXE_LEVEL2 == "Y";
      permission.canConfirm = programInfo.EXE_LEVEL3 == "Y";
      permission.canConfirmCancel = programInfo.EXE_LEVEL4 == "Y";

      return permission;
    };

    /**
     * 화면 버전 정보 리턴 [HTML: VERSION, JS: VERSION]
     * 
     * @returns {String}
     */
    $NC.getProgramVersion = function() {
      var result = "";
      var version = $("meta[name=version]").prop("content");
      if ($NC.isNull(version)) {
        version = "1";
      }
      result = "[HTML: " + version;
      version = "";
      if ($NC.G_VAR && $NC.G_VAR.version) {
        version = $NC.G_VAR.version;
      }
      if ($NC.isNull(version)) {
        version = "1";
      }
      result += ", JS: " + version + "]";
      return result;
    };

    /**
     * 팝업 창 종료 Action 세팅
     * 
     * @param action
     *          "OK", "CANCEL"
     * @param resultInfo
     *          단위화면으로 리턴할 데이터
     */
    $NC.setPopupCloseAction = function(action, resultInfo) {

      if ($NC.isNull($NC.G_JWINDOW) || $NC.isNull($NC.G_VAR.userData)) {
        return;
      }
      $NC.G_VAR.userData["CLOSE_ACTION"] = action;
      if (resultInfo) {
        $NC.G_VAR.userData["RESULT_INFO"] = resultInfo;
      }
      $NC.G_JWINDOW.set("userData", $NC.G_VAR.userData);
    };

    /**
     * 팝업 창 종료
     */
    $NC.onPopupClose = function() {

      if ($NC.isNull($NC.G_JWINDOW)) {
        return;
      }
      var onAfterClose = $NC.G_JWINDOW.get("onClose");
      if (onAfterClose) {
        $NC.G_JWINDOW.hide(onAfterClose($NC.G_JWINDOW));
      } else {
        $NC.G_JWINDOW.hide();
      }
    };

    /**
     * 로컬스토리지에서 값 읽기
     * 
     * @param key
     * @returns {String}
     */
    $NC.getLocalStorage = function(key) {

      var result = "";
      if (("localStorage" in window) && window["localStorage"] !== null) {
        result = window.localStorage[key];
      }
      return result;
    };

    /**
     * 로컬스토리지에 값 쓰기
     * 
     * @param key
     * @param value
     * @returns {Boolean}
     */
    $NC.setLocalStorage = function(key, value) {

      var result = false;
      if (("localStorage" in window) && window["localStorage"] !== null) {
        window.localStorage[key] = value;
        result = true;
      }
      return result;
    };

    /**
     * 추가 조회조건 기능 추가
     * 
     * @param conditionContainer
     *          추가 조건 표시 Layer 가 위치할 컨테이너 Selector
     * @param additionalContainer
     *          추가 조건의 컨테이너 Selector
     */
    $NC.setInitAdditionalCondition = function(conditionContainer, additionalContainer) {

      var divConditionView = $NC.getView(conditionContainer);
      var tblAddConditionView = $NC.getView(additionalContainer);
      if (divConditionView.length == 0) {
        divConditionView = $NC.getView("#divConditionView");
      }
      if (tblAddConditionView.length == 0) {
        tblAddConditionView = $NC.getView("#tblAdditionalConditionView");
      }
      if (divConditionView.length == 0 || tblAddConditionView.length == 0 || tblAddConditionView[0].tagName != "TABLE") {
        return;
      }
      var clearTimeoutFn = function(e) {
        clearTimeout($NC.G_VAR.onAdditionalConditionTimeout);
      };

      var divAddConditionId = "divAdditionalCondition" + new Date().getTime() + Math.floor((Math.random() * 10000) + 1);
      $(
          "<div id='" + divAddConditionId
              + "' class='ui-btn-additional'><span class='ui-btn-additional-title'>&#187;</span></div>").appendTo(
          document.body);
      var divAddCondition = $("#" + divAddConditionId);

      $("<tr><td><div class='ui-tbl-additional-title'><div class='ui-lbl-header'>추가 조회조건</div></div></td></tr>")
          .insertBefore(tblAddConditionView.find("tr:first"));

      tblAddConditionView.prop("tabindex", 1).find("input[type=button]").bind("click", function() {
        setTimeout(clearTimeoutFn, 1000);
      });

      $(window).bind("resize.additionalcondition", function(e) {
        divAddCondition.css({
          left: divConditionView.outerWidth() - divAddCondition.outerWidth(),
          height: divConditionView.outerHeight(),
          top: divConditionView.offset().top
        });
      });

      divAddCondition.bind("click", function(e) {
        clearTimeoutFn(e);
        if (tblAddConditionView.css("display") != "none") {
          clearTimeout($NC.G_VAR.onAdditionalConditionTimeout);
          $NC.hideView(tblAddConditionView, null, "fast", "blind");
          return;
        }
        tblAddConditionView.css({
          left: divConditionView.outerWidth() - tblAddConditionView.outerWidth() - 1,
          top: divConditionView.outerHeight() + divConditionView.offset().top
        });

        $NC.showView(tblAddConditionView, null, function() {
          tblAddConditionView.focus();
        }, "fast", "blind");
      });

      tblAddConditionView.bind("mouseleave", function(e) {
        clearTimeoutFn(e);
        if (e.target != tblAddConditionView.get(0)) {
          return;
        }
        if (tblAddConditionView.find("input,select,textarea").filter(":focus").length > 0) {
          return;
        }
        $NC.G_VAR.onAdditionalConditionTimeout = setTimeout(function() {
          $NC.hideView(tblAddConditionView, null, "fast", "blind");
        }, 1500);
      }).bind("blur", function(e) {
        clearTimeoutFn(e);
        if (e.target != tblAddConditionView.get(0)) {
          return;
        }
        $NC.G_VAR.onAdditionalConditionTimeout = setTimeout(function() {
          $NC.hideView(tblAddConditionView, null, "fast", "blind");
        }, 1500);
      });
      tblAddConditionView.bind("mouseenter", clearTimeoutFn);
      tblAddConditionView.find("input,select,textarea").bind("focus", clearTimeoutFn).bind("blur", function(e) {
        clearTimeoutFn(e);
        $NC.G_VAR.onAdditionalConditionTimeout = setTimeout(function() {
          $NC.hideView(tblAddConditionView, null, "fast", "blind");
        }, 1500);
      });

      $(window).trigger("resize.additionalcondition");
    };

    /**
     * 콘솔 로그 기록
     * 
     * @param message
     */
    $NC.writeLog = function(message) {

      var d = new Date();
      var dateArray = [d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()];
      var v;
      for (var i = 0, c = dateArray.length; i < c; i++) {
        v = dateArray[i];
        if (v < 10) {
          dateArray[i] = "0" + v;
        }
      }
      var datetime = dateArray[0] + "-" + dateArray[1] + "-" + dateArray[2] + " " + dateArray[3] + ":" + dateArray[4]
          + ":" + dateArray[5];

      if (window.console) {
        console.log(datetime + " >> " + message);
      }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // Public Function - 일반
    // TODO: Public Function - 일반 - END
    // -----------------------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------------------
    // Public Function - 그리드
    // TODO: Public Function - 그리드 - START
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Grid Data 초기화 처리
     * 
     * @param grdObject
     *          단위화면에 선언한 전역변수(G_GRDMASTER, G_GRDDETAIL ...)
     * @param data
     *          데이터(JsonString, Array)
     * @param filter
     *          데이터 필터
     * @param dataOptions
     *          DataView 옵션
     */
    $NC.setInitGridData = function(grdObject, data, filter, dataOptions) {

      // DataView가 생성이 안됐으면 생성
      if ($NC.isNull(grdObject.data)) {
        // Data 옵션이 있을 경우 세팅
        if ($NC.isNull(dataOptions)) {
          dataOptions = [ ];
        }
        if ($NC.isNull(dataOptions.container)) {
          dataOptions.container = grdObject.getContainerNode().id;
        }
        grdObject.data = new Slick.Data.DataView(dataOptions);
      }
      try {
        grdObject.data.beginUpdate();
        grdObject.data.setItems([ ]);
        var resultArray = $NC.toArray(data);
        if (Array.isArray(resultArray)) {
          grdObject.data.setItems(resultArray);
        }
        grdObject.data.endUpdate();
      } catch (e) {
        $NC.writeLog(e);
        grdObject.data.beginUpdate();
        grdObject.data.setItems([ ]);
        grdObject.data.endUpdate();

        alert("그리드에 표시할 수 없는 데이터입니다.");
      }
      // Data Filter가 있을 경우 세팅
      if ($.isFunction(filter)) {
        grdObject.data.setFilter(filter);
      }

      // 그리드 새로고침
      if (grdObject.view) {
        grdObject.view.setSortColumns([ ]);

        grdObject.view.invalidate();
      }
    };

    /**
     * Grid 기본적인 초기화 처리
     * 
     * @param selector
     *          Grid Element Selector(#grdMaster, #grdDetail ...)
     * @param options
     *          [필수]columns: 그리드 Columns<br>
     *          [필수]sortCol: 데이터 기본 정렬 컬럼<br>
     *          [선택]queryId: 그리드 데이터셋의 쿼리ID<br>
     *          [선택]gridOptions: 그리드 Options<br>
     *          [선택]data: 그리드 데이터셋<br>
     *          [선택]dataOptions: 그리드 데이터뷰 Options<br>
     *          [선택]canExportExcel: 엑셀다운로드 가능 여부<br>
     *          [선택]canCopyData: 그리드 데이터 값 복사 가능 여부<br>
     *          [선택]onSortCompare: 정렬시 사용할 비교 Function, 미지정시 기본 비교 Function<br>
     *          [선택]onFilter: 그리드 데이터 필터링 Function<br>
     */

    $NC.setInitGridObject = function(selector, options) {

      var grdElementId = selector.replace("#", "");
      var grdGlobalVar = "G_" + grdElementId.toUpperCase();
      window[grdGlobalVar] = {
        view: null,
        data: null,
        lastRow: null,
        lastRowModified: false,
        lastKeyVal: null,
        lastFilterVal: null,
        // defaultColumns: [ ],
        defaultSortCol: options.sortCol,
        sortCol: options.sortCol,
        sortDir: 1,
        focused: false,
        queryId: options.queryId,
        queryParams: null,
        onSortCompare: options.onSortCompare,
        onFilter: options.onFilter
      };
      var grdObj = window[grdGlobalVar];

      if ($NC.isNull(options.gridOptions)) {
        options.gridOptions = {};
      }

      // Data 옵션이 있을 경우 세팅
      if ($NC.isNull(options.dataOptions)) {
        options.dataOptions = [ ];
      }
      if ($NC.isNull(options.dataOptions.container)) {
        options.dataOptions.container = grdElementId;
      }

      // 그룹 옵션이 지정되어 있으면 그룹 프로바이더 생성
      if (!$NC.isNull(options.dataGroupOptions)) {
        options.dataOptions.groupItemMetadataProvider = new Slick.Data.GroupItemMetadataProvider();
        if ($NC.isNull(options.gridOptions.hideGroupDisplayColumnDataCell)) {
          options.gridOptions.showGroupDisplayColumnDataCell = false;
        }
      }

      grdObj.data = new Slick.Data.DataView(options.dataOptions);
      if (options.data) {
        try {
          grdObj.data.beginUpdate();
          grdObj.data.setItems($NC.toArray(options.data));
          grdObj.data.endUpdate();
        } catch (e) {
          $NC.writeLog(e);
          grdObj.data.beginUpdate();
          grdObj.data.setItems([ ]);
          grdObj.data.endUpdate();
          alert("그리드에 표시할 수 없는 데이터입니다.");
        }
      }
      // Data Filter가 있을 경우 세팅
      if ($.isFunction(grdObj.onFilter)) {
        grdObj.data.setFilter(grdObj.onFilter);
      }

      // if (options.columns) {
      // grdObj.defaultColumns = $.extend(true, [ ], options.columns);
      // }

      var summaryRow = options.gridOptions.summaryRow;
      var compareFn, resultFn;
      if (summaryRow && summaryRow.visible == true) {
        options.gridOptions.showHeaderRow = true;
        compareFn = summaryRow.compareFn;
        resultFn = summaryRow.resultFn;
      }

      if (!options.gridOptions.editorLock && options.gridOptions.editable === true) {
        options.gridOptions.editorLock = new Slick.EditorLock();
      }

      grdObj.view = new Slick.Grid(selector, grdObj.data, options.columns, options.gridOptions);
      // 그리드 선택 관련
      grdObj.view.setSelectionModel(new Slick.RowSelectionModel({
        selectActiveRow: true
      }));

      setInitGridGrouping(grdObj, options, grdElementId, compareFn, resultFn);
      setInitGridEvent(grdObj, options);
      setInitGridTitleBar(grdObj, options, grdElementId);

      if (summaryRow && summaryRow.visible == true) {
        $NC.refreshGridSummaryData(grdObj, summaryRow);
      }
    };

    /**
     * 그리드 상단 합계 Row 데이터 새로고침
     * 
     * @param grdObject
     * @param summaryRow
     */
    $NC.refreshGridSummaryData = function(grdObject, summaryRow) {

      var targetColumns = grdObject.view.getColumns();
      var titleColumns = [ ];
      var aggregateColumns = [ ];
      var otherColumns = [ ];
      var targetColumn = null;
      var column = null;
      for (var i = 0, colCount = targetColumns.length; i < colCount; i++) {
        column = targetColumns[i];
        if (column.summaryTitle) {
          titleColumns.push(i);
        } else if (!$NC.isNull(column.aggregator)) {
          switch (column.aggregator) {
          case "SUM":
          case "MIN":
          case "MAX":
          case "AVG":
          case "CNT":
            aggregateColumns.push({
              col: i,
              field: column.field,
              aggregator: column.aggregator
            });
            break;
          default:
            otherColumns.push(i);
            break;
          }
        } else {
          otherColumns.push(i);
        }
      }
      var headerColumns = $("#" + grdObject.view.getContainerNode().id + " .slick-headerrow-column").empty();
      var view;
      if ($NC.isNull(summaryRow)) {
        summaryRow = grdObject.view.getOptions().summaryRow;

        if ($NC.isNull(summaryRow)) {
          summaryRow = {};
        }
      }
      var summaryCssClass = summaryRow.cssClass;
      if ($NC.isNull(summaryCssClass)) {
        summaryCssClass = "ui-clr-special5";
      }
      var colIndex;
      for (var i = 0, colCount = titleColumns.length; i < colCount; i++) {
        colIndex = titleColumns[i];
        view = $("<input type='text' disabled />").appendTo($(headerColumns[colIndex])).css("text-align", "center")
            .val(targetColumns[colIndex].summaryTitle);
        view.addClass(summaryCssClass);
      }
      var aggregatedVals = {};
      if (aggregateColumns.length > 0) {
        aggregatedVals = getGridAggregatedVal(grdObject, {
          compareFn: summaryRow.compareFn,
          columns: aggregateColumns
        });
      }

      var dspVal;
      var orgVal;
      var formatter;
      for (var i = 0, colCount = aggregateColumns.length; i < colCount; i++) {
        column = aggregateColumns[i];
        orgVal = Number((summaryRow.resultFn ? summaryRow.resultFn(column.field, aggregatedVals)
            : aggregatedVals[column.field]).toFixed(6));
        if (targetColumns[column.col].formatter) {
          formatter = targetColumns[column.col].formatter;
          targetColumn = targetColumns[column.col];
        } else {
          formatter = Slick.Formatters.Number;
          targetColumn = {};
        }
        dspVal = formatter.call(this, null, null, orgVal, targetColumn, null);

        view = $("<input type='text' disabled />").appendTo($(headerColumns[column.col])).css({}).val(dspVal);
        view.addClass(summaryCssClass);
        if (targetColumns[column.col].cssClass) {
          view.addClass(targetColumns[column.col].cssClass);
        }
      }
      if (summaryRow.resultFn) {
        for (var i = 0, colCount = otherColumns.length; i < colCount; i++) {
          colIndex = otherColumns[i];
          orgVal = summaryRow.resultFn(targetColumns[colIndex].field, aggregatedVals);
          if ($NC.isNull(orgVal)) {
            continue;
          }
          if (typeof orgVal == "number") {
            if (targetColumns[colIndex].formatter) {
              formatter = targetColumns[colIndex].formatter;
              targetColumn = targetColumns[colIndex];
            } else {
              formatter = Slick.Formatters.Number;
              targetColumn = {};
            }
            dspVal = formatter.call(this, null, null, Number((orgVal).toFixed(6)), targetColumn, null);
          } else {
            dspVal = orgVal;
          }
          view = $("<input type='text' disabled />").appendTo($(headerColumns[colIndex])).val(dspVal);
          view.addClass(summaryCssClass);
          if (targetColumns[colIndex].cssClass) {
            view.addClass(targetColumns[colIndex].cssClass);
          }
        }
      }
    };

    /**
     * Grid 컬럼의 Formatter가 지정되지 않은 컬럼의 기본 Formatter 지정
     * 
     * @param columns
     * @returns { columns }
     */
    $NC.setGridColumnDefaultFormatter = function(columns) {

      // Formatter 변경
      if ($NC.isNull(columns)) {
        return null;
      }

      var intCol = /_QTY$|_PRICE$|_AMT$|_BOX$|_EA$|_ORDER$|_LENGTH$|_WIDTH$|_HEIGHT$|_CASE$|_VAL$|_PLT$|_STAIR$|_PLACE$|_ROW$|_CNT$/i;
      var dblCol = /_WEIGHT$|_CAPA$|_RATE$|_CBM$/i;
      for (var col = 0, colCount = columns.length; col < colCount; col++) {
        // Formatter가 지정되어 있지 않을 경우
        var column = columns[col];
        if (!$NC.isNull(column.fomatter)) {
          // CheckBox Formatter일 경우 _OnGridCheckBoxFormatterClick Function이 정의 되어 있으면 Function에서 처리하므로
          // Editor를 제거
          if (column.fomatter == Slick.Formatters.CheckBox && $.isFunction(window._OnGridCheckBoxFormatterClick)) {
            delete columns[col].editor;
          }
          continue;
        }
        // Editor가 지정되어 있지 않을 경우
        if ($NC.isNull(column.editor)) {
          // 일반 숫자
          if ($NC.isNull(column.field)) {
            continue;
          }
          if (column.field.match(intCol)) {
            columns[col].formatter = Slick.Formatters.Number;
          } else if (column.field.match(dblCol)) {
            columns[col].formatter = Slick.Formatters.Number;
            columns[col].formatterOptions = {
              numberType: "D"
            };
          }
        } else {
          if (column.editor != Slick.Editors.Number) {
            continue;
          }
          columns[col].formatter = Slick.Formatters.Number;
          if (!$NC.isNull(column.editorOptions) && !$NC.isNull(column.editorOptions.numberType)) {
            columns[col].formatterOptions = {
              numberType: column.editorOptions.numberType
            };
          }
        }
      }
      return columns;
    };

    /**
     * 컬럼명을 화면표시 명칭으로 변경 후 컬럼 정보 Array에 추가
     * 
     * @param columns
     *          Grid 컬럼 Array
     * @param column
     *          Grid 컬럼
     * @param canReplace
     *          [B]컬럼 명칭 변경할지 여부, 기본값 변경
     * @param subID
     *          [S]TAB이 있을 경우 TAB 구분자, T1, T2...TN
     */
    $NC.setGridColumn = function(columns, column, canReplace, subID) {

      if ($NC.isNull(columns) || $NC.isNull(column)) {
        return;
      }
      if (canReplace == false || $NC.isNull($NC.G_MSG[column.id])) {
        columns.push(column);
        return;
      }

      var programInfo = $NC.G_JWINDOW.get("userData");
      if ($NC.isNull(programInfo)) {
        programInfo = {
          PROGRAM_ID: ""
        };
      }
      setInternalGridColumn(columns, column, programInfo.PROGRAM_ID, subID);
    };

    /**
     * 그리드 Selector 로 그리드 전역변수 리턴
     * 
     * @param selector
     * @returns {Object}
     */
    $NC.getGridGlobalVar = function(selector) {

      return window["G_" + selector.replace("#", "").toUpperCase()];
    };

    /**
     * 그리드 전역변수의 값 초기화<br>
     * <br>
     * 기본대상<br>
     * lastRow = null, lastRowModified = false, sortCol = 기본값, sortDir = -1<br>
     * 옵션 - ["lastKeyVal", "lastFilterVal", "queryId", "queryParams"]<br>
     * lastKeyVal, lastFilterVal, queryId, queryParams
     * 
     * @param grdObject
     * @param options
     */
    $NC.setInitGridVar = function(grdObject, options) {

      // 기본대상 초기화
      grdObject.lastRow = null;
      grdObject.lastRowModified = false;
      grdObject.sortCol = grdObject.defaultSortCol;
      grdObject.sortDir = 1;

      if ($.isPlainObject(options)) {
        // 옵션 초기화
        var varName;
        for (var index = 0, optCount = options.length; index < optCount; index++) {
          varName = options[index];
          if (Object.keys(grdObject).indexOf(varName) > -1) {
            grdObject[varName] = null;
          }
        }
      }
    };

    /**
     * 그리드의 전역변수의 값 초기화, 데이터 Clear, 상단 타이틀의 Row 정보 초기화
     * 
     * @param grdObject
     * @param varClearOptions
     *          전역변수 값 초기화 옵션
     */
    $NC.clearGridData = function(grdObject, varClearOptions) {

      $NC.setInitGridVar(grdObject, varClearOptions);
      $NC.setInitGridData(grdObject);
      $NC.setGridDisplayRows(grdObject, 0, 0);
    };

    /**
     * 그리드 전역변수의 queryId, queryParams를 Object로 리턴
     * 
     * @param grdObject
     * @returns {Object}<br>
     *          [선택]P_QUERY_ID: grdObject.queryId, [필수]P_QUERY_PARAMS: grdObject.queryParams
     */
    $NC.getGridParams = function(grdObject) {

      var params = {};
      if (!$NC.isNull(grdObject.queryId)) {
        params["P_QUERY_ID"] = grdObject.queryId;
      }
      params["P_QUERY_PARAMS"] = grdObject.queryParams;
      return params;
    };

    /**
     * Grid 컬럼 헤더에 체크박스 생성
     * 
     * @param grdObject
     * @param field
     * @param title
     */
    $NC.setGridColumnHeaderCheckBox = function(grdObject, field, title) {

      grdObject.view.updateColumnHeader(field, "<input id='" + grdObject.view.getContainerNode().id + field
          + "' type='checkbox' style='vertical-align: middle; hidefocus'>" + ($NC.isNull(title) ? "" : title));
    };

    /**
     * 데이터가 변경되었는지 여부
     * 
     * @param grdObject
     * @returns {Boolean}
     */
    $NC.isGridModified = function(grdObject) {

      var result = false;
      // 현재 수정모드면
      if (grdObject.view.getEditorLock().isActive()) {
        grdObject.view.getEditorLock().commitCurrentEdit();
      }

      // 전체 데이터를 기준으로 처리
      var rows = grdObject.data.getItems();
      for (var row = 0, rowCount = rows.length; row < rowCount; row++) {
        if (rows[row].CRUD !== "R") {
          result = true;
          break;
        }
      }
      return result;
    };

    /**
     * Grid에 신규 데이터 추가시 사용할 ID Return
     * 
     * @returns {String}
     */
    $NC.getGridNewRowId = function() {

      return "id_new_" + new Date().getTime() + Math.floor((Math.random() * 10000) + 1);
    };

    /**
     * 삭제, 취소 처리시 다시 조회 후 현재, 이전 Row를 선택하기 위해 해당 Row의 키 값을 리턴<br>
     * 
     * @param grdObject
     * @param options
     *          selectRow: 키 값을 검색할 Row, 미지정시 lastRow<br>
     *          selectKey: 키 컬럼 항목, String, Array<br>
     *          isCancel: 취소 처리일 경우에 true
     * @returns {Object}<br>
     *          키값: String, Array
     */
    $NC.getGridLastKeyVal = function(grdObject, options) {

      var result = "";
      if ($NC.isNull(grdObject) || $NC.isNull(options) || $NC.isNull(options.selectKey)) {
        return "";
      }
      var lastRow;
      if (options.selectRow) {
        lastRow = options.selectRow;
      } else {
        lastRow = grdObject.lastRow;
      }
      var isCancel = options.isCancel;
      if ($NC.isNull(isCancel)) {
        isCancel = false;
      }

      var rowData = grdObject.data.getItem(lastRow);
      if (rowData) {
        // 삭제일 경우, 취소면서 현재 데이터가 신규 데이터일 경우
        if (rowData.CRUD == "D" || (isCancel && (rowData.CRUD == "N" || rowData.CRUD == "C"))) {
          // Row 이전 데이터 선택
          if (lastRow > 1) {
            lastRow -= 1;
          } else {
            lastRow = 0;
          }
          rowData = grdObject.data.getItem(lastRow);
        }

        if (Array.isArray(options.selectKey)) {
          result = [ ];
          for (var i = 0, keyCount = options.selectKey.length; i < keyCount; i++) {
            result.push(rowData[options.selectKey[i]]);
          }
        } else {
          result = rowData[options.selectKey];
        }
      }
      return result;
    };

    /**
     * 그리드 리사이즈
     * 
     * @param selector
     * @param width
     * @param height
     */
    $NC.resizeGrid = function(selector, width, height) {

      var view = $NC.getView(selector);
      if (view.length === 0) {
        return;
      }

      // Grid 높이 조정
      view.css({
        "width": width,
        "height": height
      });
      // frozenColWidth = view.find(".slick-viewport.slick-viewport-left:first").width();
      // view.find(".slick-viewport.slick-viewport-right").width(width - frozenColWidth);

      var grdObject = $NC.getGridGlobalVar(view[0].id);
      if ($NC.isNull(grdObject.view)) {
        return;
      }
      var forceFitColumns = grdObject.view.getOptions().forceFitColumns;
      grdObject.view.resizeCanvas();
      if (!forceFitColumns) {
        try {
          grdObject.view.autosizeColumns();
        } catch (e) {
        }
      }
    };

    /**
     * 포커스 주기
     * 
     * @param grdObject
     *          포커스를 줄 Object
     * @param selectRow
     *          row
     * @param activeCell
     *          cell
     * @param editMode
     *          edit
     * @param withWindow
     *          jWindow Object에도 포커스를 줄지 여부
     * @param waitTime
     *          대기시간
     */
    $NC.setFocusGrid = function(grdObject, selectRow, activeCell, editMode, withWindow, waitTime) {

      if ($NC.isNull(waitTime)) {
        if (withWindow) {
          waitTime = 300;
        } else {
          waitTime = 100;
        }
      }

      setTimeout(function() {
        if (withWindow) {
          if (!$NC.isNull($NC.G_JWINDOW)) {
            $NC.G_JWINDOW.focus();
          }
        }

        grdObject.view.getCanvasNode().focus();
        if ($NC.isNull(selectRow)) {
          selectRow = 0;
        }
        if ($NC.isNull(activeCell)) {
          activeCell = 0;
        }
        if ($NC.isNull(editMode)) {
          editMode = false;
        }
        grdObject.view.setSelectedRows([selectRow]);
        grdObject.view.gotoCell(selectRow, activeCell, editMode);

      }, waitTime);
    };

    /**
     * Excel Export 컬럼 정보 리턴
     * 
     * @param grdObject
     * @returns {Object}
     */
    $NC.getGridColumnInfo = function(grdObject) {

      var bands = grdObject.view.getOptions().bands || [ ];
      var columns = grdObject.view.getColumns();
      var column;
      var columnName;
      var columnDS = [ ];
      for (var col = 0, colCount = columns.length; col < colCount; col++) {
        column = columns[col];
        if ($NC.isNull(column.field)) {
          continue;
        }
        columnName = column.name.trim();
        if (columnName.substr(1, 5).toUpperCase() == "INPUT") {
          columnName = "선택"; // column.field;
        }
        if (bands.length > column.band) {
          columnName = $NC.isNull(bands[column.band]) ? columnName : "[" + bands[column.band] + "] " + columnName;
        }
        columnDS.push({
          P_COLUMN_NM: column.field,
          P_COLUMN_TITLE: columnName,
          P_COLUMN_WIDTH: Math.max(Math.ceil(Math.max(column.minWidth, column.width) / 6.5), Math
              .ceil(columnName.length * 1.8))
        });
      }
      return $NC.getParams(columnDS);
    };

    /**
     * Grid의 Row 선택, 화면에 보이지 않을 경우 보여 줌
     * 
     * @param grdObject
     *          단위화면에 선언한 전역변수(G_GRDMASTER, G_GRDDETAIL ...)
     * @param options
     *          선택 옵션(1)<br>
     *          단순 특정 Row 선택시 Row Index 지정<br>
     *          선택 옵션(2)<br>
     *          [N]selectRow[필수:택1]: 선택할 Row Index<br>
     *          [S]selectKey[필수:택1]: 검색하여 선택할 시 검색할 필드 명<br>
     *          [S]selectVal[필수:택2]: 검색하여 선택할 시 검색할 필드 값<br>
     *          [N]activeCell[옵션]: 특정 컬럼을 선택시 Column Index<br>
     *          [B]moveTop[옵션]: 해당 Row가 화면에 보이지 않을 시 보이게 함<br>
     *          [B]editMode[옵션]: Active Cell을 수정할 수 있게 Edit 모드로 변경<br>
     */
    $NC.setGridSelectRow = function(grdObject, options) {

      // options 가 number -> Row Index 로 지정했을 경우
      if (typeof options === "number") {
        var dataCount = grdObject.data.getLength();
        if (options < 0) {
          options = 0;
        } else if (dataCount - 1 < options) {
          options = dataCount;
        }
        if (dataCount == 0) {
          return;
        }
        // grdObject.view.scrollRowToTop(options);
        grdObject.view.ensureVisible(options);
        grdObject.view.setSelectedRows([options]);
        grdObject.view.setActiveCell(options, 0);
      } else if ($.isPlainObject(options)) {
        if ($NC.isNull(options.moveTop)) {
          options.moveTop = false;
        }
        if ($NC.isNull(options.activeCell)) {
          options.activeCell = 0;
        }
        if ($NC.isNull(options.editMode)) {
          options.editMode = false;
        }
        // 컬럼 값으로 선택이 아닐 경우
        if ($NC.isNull(options.selectKey)) {
          if ($NC.isNull(options.selectRow)) {
            options.selectRow = 0;
          }
          if (options.moveTop) {
            // grdObject.view.scrollRowToTop(options.selectRow);
            grdObject.view.ensureVisible(options.selectRow);
          }
          grdObject.view.setSelectedRows([options.selectRow]);
          grdObject.view.setActiveCell(options.selectRow, options.activeCell);
          if (options.editMode) {
            grdObject.view.editActiveCell();
          }
        } else {
          grdObject.lastKeyVal = "";

          var selectKey;
          var selectVal;
          if (Array.isArray(options.selectKey)) {
            selectKey = options.selectKey;
            selectVal = options.selectVal;
          } else {
            selectKey = [options.selectKey];
            selectVal = [options.selectVal];
          }

          var keyCount = selectKey.length;
          var found = false;
          var rowData;
          var columns = grdObject.view.getColumns();

          for (var i = 0, rowCount = grdObject.data.getLength(); i < rowCount; i++) {
            rowData = $NC.getGridItemFromGroup(grdObject.data.getItem(i), columns);

            found = true;
            for (var k = 0; k < keyCount; k++) {
              if (selectVal[k] !== rowData[selectKey[k]]) {
                found = false;
                break;
              }
            }

            if (found) {
              if (options.moveTop) {
                // grdObject.view.scrollRowToTop(i);
                grdObject.view.ensureVisible(i);
              }
              grdObject.view.setSelectedRows([i]);
              grdObject.view.setActiveCell(i, options.activeCell);
              if (options.editMode) {
                grdObject.view.editActiveCell();
              }
              return;
            }
          }

          // 특정 값으로 검색하는데 검색하지 못했을 경우 첫번째 레코드 선택
          if ($NC.isNull(options.selectFirst) || options.selectFirst) {
            if (options.moveTop) {
              // grdObject.view.scrollRowToTop(0);
              grdObject.view.ensureVisible(0);
            }
            grdObject.view.setSelectedRows([0]);
            grdObject.view.setActiveCell(0, options.activeCell);
          }
          if (options.editMode) {
            grdObject.view.editActiveCell();
          }
        }
      }
    };

    /**
     * Grid에서 특정 데이터 검색
     * 
     * @param grdObject
     *          단위화면에 선언한 전역변수(G_GRDMASTER, G_GRDDETAIL ...)
     * @param options
     *          [S]searchKey[필수:String, Array]: 검색하여 선택할 시 검색할 필드 명<br>
     *          [S]searchVal[필수:String, Array]: 검색하여 선택할 시 검색할 필드 값<br>
     * @returns {Number} 검색한 데이터의 Index
     */
    $NC.getGridSearchVal = function(grdObject, options) {

      var result = -1;

      var searchKey;
      var searchVal;
      if (Array.isArray(options.searchKey)) {
        searchKey = options.searchKey;
        searchVal = options.searchVal;
      } else {
        searchKey = [options.searchKey];
        searchVal = [options.searchVal];
      }

      var keyCount = searchKey.length;
      var found = false;
      var rowData;
      var columns = grdObject.view.getColumns();

      for (var i = 0, rowCount = grdObject.data.getLength(); i < rowCount; i++) {
        rowData = $NC.getGridItemFromGroup(grdObject.data.getItem(i), columns);
        found = true;
        for (var k = 0; k < keyCount; k++) {
          if (searchVal[k] !== rowData[searchKey[k]]) {
            found = false;
            break;
          }
        }
        if (found) {
          result = i;
          break;
        }
      }

      return result;
    };

    /**
     * Grid에서 해당 조건에 맞는 데이터의 합계 리턴
     * 
     * @param grdObject
     *          단위화면에 선언한 전역변수(G_GRDMASTER, G_GRDDETAIL ...)
     * @param options
     *          [S,A]searchKey[필수:택1]: 비교할 필드 명, Key or [Key1, Key2, ...]<br>
     *          [S,A]searchVal[필수:택1]: 비교할 필드 값, Val or [Val1, [Val21, Val22], ...]<br>
     *          [F]compareFn[필수:택2]: 데이터 비교를 처리할 Function, function (rowData) {}<br>
     *          [S]sumKey[필수]: 합계를 구할 필드 명, Key or [Key1, Key2, ...]<br>
     *          [B]isAllData[옵션]: 데이터에 필터가 적용되었을 경우 true를 주면 전체 데이터를 기준으로 검색<br>
     * @returns {Object}<br>
     *          합계 필드가 하나면 Number, 여러개면 Object
     */
    $NC.getGridSumVal = function(grdObject, options) {

      var result = 0;

      if ($NC.isNull(options.sumKey)) {
        return result;
      }

      var equalFn = function(equalOptions, rowData) {

        if (equalOptions.compareFn) {
          return equalOptions.compareFn.call(this, rowData);
        }

        var searchKey = equalOptions.searchKey;
        var searchVal = equalOptions.searchVal;
        if ($NC.isNull(searchKey) && $NC.isNull(searchVal)) {
          return true;
        }

        if (!Array.isArray(searchKey)) {
          searchKey = [searchKey];
        }
        if (!Array.isArray(searchVal)) {
          searchVal = [searchVal];
        }

        var isEqualCol = false;
        for (var si = 0, siCount = searchKey.length; si < siCount; si++) {
          isEqualCol = false;
          if (Array.isArray(searchVal[si])) {
            for (var vi = 0, viCount = searchVal[si].length; vi < viCount; vi++) {
              if (rowData[searchKey[si]] == searchVal[si][vi]) {
                isEqualCol = true;
                break;
              }
            }
          } else {
            for (var vi = 0, viCount = searchVal.length; vi < viCount; vi++) {
              if (rowData[searchKey[si]] == searchVal[vi]) {
                isEqualCol = true;
                break;
              }
            }
          }
          if (!isEqualCol) {
            return false;
          }
        }
        return true;
      };

      var targetRows;
      var rowData;
      var isGrouped = false;
      if (!$NC.isNull(options.isAllData) && options.isAllData) {
        targetRows = grdObject.data.getItems();
      } else {
        targetRows = grdObject.data.getGroups();
        if (targetRows.length > 0) {
          isGrouped = true;
        } else {
          targetRows = grdObject.data.getDisplayItems();
        }
      }

      if (Array.isArray(options.sumKey)) {
        var sumKeys = options.sumKey;
        result = {};
        for (var k = 0, keyCount = sumKeys.length; k < keyCount; k++) {
          result[sumKeys[k]] = 0;
        }
        if (isGrouped) {
          for (var g = 0, groupCount = targetRows.length; g < groupCount; g++) {
            for (var i = 0, rowCount = targetRows[g].rows.length; i < rowCount; i++) {
              rowData = targetRows[g].rows[i];
              if (equalFn(options, rowData)) {
                for (var k = 0, keyCount = sumKeys.length; k < keyCount; k++) {
                  result[sumKeys[k]] += Number(rowData[sumKeys[k]]) || 0;
                }
              }
            }
          }
        } else {
          for (var i = 0, rowCount = targetRows.length; i < rowCount; i++) {
            rowData = targetRows[i];
            if (equalFn(options, rowData)) {
              for (var k = 0, keyCount = sumKeys.length; k < keyCount; k++) {
                result[sumKeys[k]] += Number(rowData[sumKeys[k]]) || 0;
              }
            }
          }
        }
      } else {
        if (isGrouped) {
          for (var g = 0, groupCount = targetRows.length; g < groupCount; g++) {
            for (var i = 0, rowCount = targetRows[g].rows.length; i < rowCount; i++) {
              rowData = targetRows[g].rows[i];
              if (equalFn(options, rowData)) {
                result += Number(rowData[options.sumKey]) || 0;
              }
            }
          }
        } else {
          for (var i = 0, rowCount = targetRows.length; i < rowCount; i++) {
            rowData = targetRows[i];
            if (equalFn(options, rowData)) {
              result += Number(rowData[options.sumKey]);
            }
          }
        }
      }

      return result;
    };

    /**
     * Grid Data 중 그룹 데이터를 일반데이터 형태로 변환하여 리턴
     * 
     * @param rowData
     * @param options
     *          Grid Object or Grid Columns
     * @returns {Object}
     */
    $NC.getGridItemFromGroup = function(rowData, options) {

      // 그룹 데이터가 아니면 원 데이터 그대로 리턴
      if (!rowData.__group /*rowData instanceof Slick.Group*/) {
        return rowData;
      }

      var columns;
      if (Array.isArray(options)) {
        columns = options;
      } else {
        columns = options.view.getColumns();
      }

      var result = $.extend({}, rowData.rows[0]);
      result.CRUD = "R";
      result.id = "";

      var column;
      for (var i = 0, colCount = columns.length; i < colCount; i++) {
        column = columns[i];
        if (column.groupToggler || column.groupDisplay) {
          continue;
        } else {
          if (rowData.totals.isSummary) {
            result[column.field] = rowData.totals.summary[column.field];
          } else {
            if (column.aggregator) {
              var aggregator = rowData.totals[column.aggregator.toLowerCase()];
              if (aggregator) {
                result[column.field] = [column.field];
              }
            }
          }
        }
      }
      return result;
    };

    /**
     * Grid에서 해당 조건에 맞는 데이터의 Index를 리턴
     * 
     * @param grdObject
     *          단위화면에 선언한 전역변수(G_GRDMASTER, G_GRDDETAIL ...)
     * @param options
     *          [S,A]searchKey[필수:택1]: 비교할 필드 명, Key or [Key1, Key2, ...]<br>
     *          [S,A]searchVal[필수:택1]: 비교할 필드 값, Val or [Val1, [Val21, Val22], ...]<br>
     *          [F]compareFn[필수:택2]: 데이터 비교를 처리할 Function, function (rowData) {}<br>
     *          [B]isAllData[옵션]: 데이터에 필터가 적용되었을 경우 true를 주면 전체 데이터를 기준으로 검색<br>
     * @returns {Array}<br>
     *          검색한 데이터의 Index Array
     */
    $NC.getGridSearchRows = function(grdObject, options) {

      var result = [ ];

      var equalFn = function(compareFn, searchKey, searchVal, rowData) {

        if (compareFn) {
          return compareFn.call(this, rowData);
        }

        var isEqualCol = false;
        for (var si = 0, siCount = searchKey.length; si < siCount; si++) {
          isEqualCol = false;
          if (Array.isArray(searchVal[si])) {
            for (var vi = 0, viCount = searchVal[si].length; vi < viCount; vi++) {
              if (rowData[searchKey[si]] == searchVal[si][vi]) {
                isEqualCol = true;
                break;
              }
            }
          } else {
            for (var vi = 0, viCount = searchVal.length; vi < viCount; vi++) {
              if (rowData[searchKey[si]] == searchVal[vi]) {
                isEqualCol = true;
                break;
              }
            }
          }
          if (!isEqualCol) {
            return false;
          }
        }
        return true;
      };

      var compareFn = options.compareFn;
      var searchKey = options.searchKey;
      var searchVal = options.searchVal;
      if (!Array.isArray(searchKey)) {
        searchKey = [searchKey];
      }
      if (!Array.isArray(searchVal)) {
        searchVal = [searchVal];
      }

      var targetRows, rowData;
      var columns = grdObject.view.getColumns();
      if (!$NC.isNull(options.isAllData) && options.isAllData) {
        targetRows = grdObject.data.getItems();
      } else {
        targetRows = grdObject.data.getDisplayItems();
      }
      for (var i = 0, rowCount = targetRows.length; i < rowCount; i++) {
        rowData = targetRows[i];
        if (equalFn(compareFn, searchKey, searchVal, $NC.getGridItemFromGroup(rowData, columns))) {
          result.push(i);
        }
      }

      return result;
    };

    /**
     * Grid에서 해당 조건에 맞는 데이터의 첫번째 Index를 리턴
     * 
     * @param grdObject
     *          단위화면에 선언한 전역변수(G_GRDMASTER, G_GRDDETAIL ...)
     * @param options
     *          [S,A]searchKey[필수:택1]: 비교할 필드 명, Key or [Key1, Key2, ...]<br>
     *          [S,A]searchVal[필수:택1]: 비교할 필드 값, Val or [Val1, [Val21, Val22], ...]<br>
     *          [F]compareFn[필수:택2]: 데이터 비교를 처리할 Function, function (rowData) {}<br>
     *          [N]startIndex: 검색 시작할 인덱스, 미지정시 0부터 검색<br>
     *          [B]isAllData[옵션]: 데이터에 필터가 적용되었을 경우 true를 주면 전체 데이터를 기준으로 검색<br>
     * @returns {Number}
     */
    $NC.getGridSearchRow = function(grdObject, options) {

      var result = -1;

      var equalFn = function(compareFn, searchKey, searchVal, rowData) {

        if (compareFn) {
          return compareFn.call(this, rowData);
        }

        var isEqualCol = false;
        for (var si = 0, siCount = searchKey.length; si < siCount; si++) {
          isEqualCol = false;
          if (Array.isArray(searchVal[si])) {
            for (var vi = 0, viCount = searchVal[si].length; vi < viCount; vi++) {
              if (rowData[searchKey[si]] == searchVal[si][vi]) {
                isEqualCol = true;
                break;
              }
            }
          } else {
            for (var vi = 0, viCount = searchVal.length; vi < viCount; vi++) {
              if (rowData[searchKey[si]] == searchVal[vi]) {
                isEqualCol = true;
                break;
              }
            }
          }
          if (!isEqualCol) {
            return false;
          }
        }
        return true;
      };

      var startIndex = 0;
      if (options.startIndex) {
        startIndex = options.startIndex < 0 ? 0 : options.startIndex;
      }

      var compareFn = options.compareFn;
      var searchKey = options.searchKey;
      var searchVal = options.searchVal;
      if (!Array.isArray(searchKey)) {
        searchKey = [searchKey];
      }
      if (!Array.isArray(searchVal)) {
        searchVal = [searchVal];
      }

      var targetRows, rowData;
      var columns = grdObject.view.getColumns();
      if (!$NC.isNull(options.isAllData) && options.isAllData) {
        targetRows = grdObject.data.getItems();
      } else {
        targetRows = grdObject.data.getDisplayItems();
      }
      for (var i = startIndex, rowCount = targetRows.length; i < rowCount; i++) {
        rowData = targetRows[i];
        if (equalFn(compareFn, searchKey, searchVal, $NC.getGridItemFromGroup(rowData, columns))) {
          result = i;
          break;
        }
      }

      return result;
    };

    /**
     * 그리드 RowCount 표시<br>
     * GRID OBJECT 의 lastRow를 currRow로, lastRowModified = false 로 세팅
     * 
     * @param selector
     *          Grid Selector(#grdMaster ...), Grid Global Variant(G_GRDMASTER ...)
     * @param currRow
     *          현재 Row Index + 1
     * @param totalRow
     *          총 Record Count
     */
    $NC.setGridDisplayRows = function(selector, currRow, totalRow) {

      var grdObject;
      var grdSelector;
      if ($.type(selector) == "string") {
        grdObject = $NC.getGridGlobalVar(selector);
        grdSelector = selector;
      } else {
        grdObject = selector;
        grdSelector = "#" + grdObject.view.getContainerNode().id;
      }

      if (currRow > 0) {
        if ($NC.isNull(totalRow)) {
          totalRow = grdObject.data.getLength();
        }
        if (totalRow == 0) {
          currRow = 0;
        }
      }
      // 마지막 Row 세팅
      if (currRow == 0) {
        grdObject.lastRow = null;
      } else {
        grdObject.lastRow = currRow - 1;
      }
      // 수정 상태 복원
      grdObject.lastRowModified = false;

      // 건수 표시
      $("#divRowCount_" + grdSelector.replace("#", "")).text(currRow + "/" + totalRow + " Rows");
    };

    /**
     * DB 데이터를 기준으로 Grid에 ComboBox를 표시할 경우에 사용하며, EditorOptions를 Return
     * 
     * @param requestUrl[필수]:
     *          서비스 호출 Url
     * @param requestData[옵션]:
     *          서비스 호출시 필요한 파라메터
     * @param comboOptions[필수]:
     *          ComboBox Editor 옵션
     * @returns {Object}<br>
     *          EditorOptions
     */
    $NC.getGridComboEditorOptions = function(requestUrl, requestData, comboOptions) {

      if ($NC.isNull(requestUrl) || $NC.isNull(comboOptions)) {
        return null;
      }

      var data = [ ];
      $NC.serviceCallAndWait(requestUrl, requestData, function(ajaxData) {
        data = $NC.toArray(ajaxData);
      }, function(ajaxData) {
        $NC.onError(ajaxData);
        data = [ ];
      });
      comboOptions["data"] = data;
      return comboOptions;
    };

    /**
     * 그리드 컬럼 중 ComboBox 로 세팅된 컬럼에서 지정 값으로 FullName 검색
     * 
     * @param grdObject
     * @param comboOptions
     *          colFullNameField[필수]: ComboBox로 세팅된 컬럼 명<br>
     *          searchVal[필수]: 검색할 코드 값<br>
     *          dataCodeField[필수]: data의 Code Field 명<br>
     *          dataNameField[택1]: data의 Name Field 명<br>
     *          dataFullNameField[택1]: data의 FullName Field 명<br>
     *          리턴 받을 명칭을 dataNameField, dataFunnNameField 둘 중에 하나 지정
     * @returns {String}
     */
    $NC.getGridComboName = function(grdObject, comboOptions) {

      result = "";
      var rows = grdObject.view.getColumns()[grdObject.view.getColumnIndex(comboOptions.colFullNameField)].editorOptions.data;
      for (var row = 0, rowCount = rows.length; row < rowCount; row++) {
        rowData = rows[row];
        if (rowData[comboOptions.dataCodeField] === comboOptions.searchVal) {
          if (!$NC.isNull(comboOptions.dataFullNameField)) {
            result = rowData[comboOptions.dataFullNameField];
          } else if (!$NC.isNull(comboOptions.dataNameField)) {
            result = rowData[comboOptions.dataNameField];
          }
          break;
        }
      }
      return result;
    };

    /**
     * 그리드 데이터 엑셀 다운로드
     * 
     * @param exportIndex
     */
    $NC.excelExportGrid = function(e, exportIndex, excelTitle) {

      var grdContainer = $(e.target).parents("table:first").next("div[class*=slickgrid]:first");
      if (grdContainer.length === 0) {
        alert("엑셀 다운로드할 그리드를 검색하지 못했습니다.");
        return;
      }

      var grdObject = window["G_" + grdContainer[0].id.toUpperCase()];
      if ($NC.isNull(grdObject) || grdObject.data.getLength() === 0) {
        alert("엑셀 다운로드할 데이터가 없습니다. 조회 후 처리하십시오.");
        return;
      }

      // Excel Export
      $NC.G_MAIN.excelFileDownload({
        P_QUERY_ID: grdObject.queryId,
        P_QUERY_PARAMS: grdObject.queryParams,
        P_COLUMN_INFO: $NC.getGridColumnInfo(grdObject),
        P_EXCEL_TITLE: excelTitle.replace(/\/|\[|\]|\s/gi, ""),
        P_EXPORT_TYPE: exportIndex
      });
    };

    /**
     * 사용자가 정의한 컬럼 정보로 그리드 재조정
     * 
     * @param args
     *          gridId: 그리드ID<br>
     *          columnPosition: 컬럼 위치 정보, Json
     */
    /*
    $NC.setGridColumnReorder = function(args) {

      if (!$NC.isNull(args)) {
        var grdObject = window["G_" + args.gridId];
        var columnArray = $NC.toArray(args.columnPosition);
        var oldDefColumns = $.extend(true, [ ], grdObject.defaultColumns);
        var oldColumns = grdObject.view.getColumns();
        var newColumns = [ ];
        var columnInfo;
        var frozenColumn = -1;

        // 컬럼 순서 조정
        for (var colP = 0, colPCount = columnArray.length; colP < colPCount; colP++) {
          columnInfo = columnArray[colP];
          for (var colB = 0, colBCount = oldDefColumns.length; colB < colBCount; colB++) {
            if (columnInfo.COL_ID == oldDefColumns[colB].id) {
              var newColumn = $.extend(true, {}, oldDefColumns[colB]);
              // 콤보박스의 경우 editorOptions 데이터가 defaultColumns에 없기 때문에 현재 컬럼정보에서 가져옴
              var newColumnEditorOptions;
              if (newColumn.editor && newColumn.editor == Slick.Editors.ComboBox) {
                for (var colO = 0, colOCount = oldColumns.length; colO < colOCount; colO++) {
                  if (columnInfo.COL_ID == oldColumns[colO].id) {
                    newColumnEditorOptions = $.extend(true, {}, oldColumns[colO].editorOptions);
                    newColumn.editorOptions = newColumnEditorOptions;
                    break;
                  }
                }
              }
              newColumns.push(newColumn);
              if (columnInfo.FROZEN_YN == "Y") {
                frozenColumn += 1;
              }
              oldDefColumns[colB].append = true;
              break;
            }
          }
        }
        for (var colB = 0, colBCount = oldDefColumns.length; colB < colBCount; colB++) {
          if (oldDefColumns[colB].append) {
            continue;
          }
          var newColumn = $.extend(true, {}, oldDefColumns[colB]);
          // 콤보박스의 경우 editorOptions 데이터가 defaultColumns에 없기 때문에 현재 컬럼정보에서 가져옴
          var newColumnEditorOptions;
          if (newColumn.editor && newColumn.editor == Slick.Editors.ComboBox) {
            for (var colO = 0, colOCount = oldColumns.length; colO < colOCount; colO++) {
              if (columnInfo.COL_ID == oldColumns[colO].id) {
                newColumnEditorOptions = $.extend(true, {}, oldColumns[colO].editorOptions);
                newColumn.editorOptions = newColumnEditorOptions;
                break;
              }
            }
          }
          newColumns.push(newColumn);
        }
        // 조정된 컬럼이 있으면 반영
        if (newColumns.length > 0) {
          grdObject.view.setColumns(newColumns);
          grdObject.view.setOptions({
            frozenColumn: frozenColumn
          });
          grdObject.view.resizeCanvas();
          try {
            grdObject.view.autosizeColumns();
          } catch (e) {
          }
        }
      } else {
        // 화면의 그리드 Object 검색
        
        // var grdArray = [ ];
        // for ( var propName in window) {
        //   if (propName.substr(0, 5) == "G_GRD") {
        //     grdArray.push(propName);
        //   }
        // }
        //
        // if (grdArray.length == 0) {
        //   return;
        // }
        
        if ($NC.isNull($NC.G_JWINDOW)) {
          return;
        }

        var PROGRAM_ID = $NC.G_JWINDOW.get("userData").PROGRAM_ID;
        if ($NC.isNull(PROGRAM_ID)) {
          return;
        }

        // 사용자 컬럼정보 읽기
        var COLUMNINFO = [ ];

        $NC.serviceCallAndWait("/WC/getDataSet.do", {
          P_QUERY_ID: "WC.GET_CSUSERPROGRAMLAYOUT",
          P_QUERY_PARAMS: $NC.getParams({
            P_USER_ID: $NC.G_USERINFO.USER_ID,
            P_PROGRAM_ID: PROGRAM_ID,
            P_GRID_ID: "%"
          })
        }, function(ajaxData) {
          var resultData = $NC.toArray(ajaxData);
          if (resultData.length > 0) {
            COLUMNINFO = resultData;
          }
        }, function(ajaxData) {
          // 오류 메시지 표시하지 않음
        });

        if (COLUMNINFO.length == 0) {
          return;
        }

        for (var row = 0, rowCount = COLUMNINFO.length; row < rowCount; row++) {
          var grdObject = window["G_" + COLUMNINFO[row].GRID_ID];
          if ($NC.isNull(grdObject)) {
            continue;
          }

          // 컬럼명 Parsing
          var columnArray = $NC.toArray(COLUMNINFO[row].COLUMN_POSITION);
          if (columnArray.length == 0) {
            continue;
          }

          var oldDefColumns = $.extend(true, [ ], grdObject.defaultColumns);
          var oldColumns = grdObject.view.getColumns();
          var newColumns = [ ];
          var columnInfo;
          var frozenColumn = -1;

          // 컬럼 순서 조정
          for (var colP = 0, colPCount = columnArray.length; colP < colPCount; colP++) {
            columnInfo = columnArray[colP];
            for (var colB = 0, colBCount = oldDefColumns.length; colB < colBCount; colB++) {
              if (columnInfo.COL_ID == oldDefColumns[colB].id) {
                var newColumn = $.extend(true, {}, oldDefColumns[colB]);
                // 콤보박스의 경우 editorOptions 데이터가 defaultColumns에 없기 때문에 현재 컬럼정보에서 가져옴
                var newColumnEditorOptions;
                if (newColumn.editor && newColumn.editor == Slick.Editors.ComboBox) {
                  for (var colO = 0, colOCount = oldColumns.length; colO < colOCount; colO++) {
                    if (columnInfo.COL_ID == oldColumns[colO].id) {
                      newColumnEditorOptions = $.extend(true, {}, oldColumns[colO].editorOptions);
                      newColumn.editorOptions = newColumnEditorOptions;
                      break;
                    }
                  }
                }
                newColumns.push(newColumn);
                if (columnInfo.FROZEN_YN == "Y") {
                  frozenColumn += 1;
                }
                oldDefColumns[colB].append = true;
                break;
              }
            }
          }
          for (var colB = 0, colBCount = oldDefColumns.length; colB < colBCount; colB++) {
            if (oldDefColumns[colB].append) {
              continue;
            }
            var newColumn = $.extend(true, {}, oldDefColumns[colB]);
            // 콤보박스의 경우 editorOptions 데이터가 defaultColumns에 없기 때문에 현재 컬럼정보에서 가져옴
            var newColumnEditorOptions;
            if (newColumn.editor && newColumn.editor == Slick.Editors.ComboBox) {
              for (var colO = 0, colOCount = oldColumns.length; colO < colOCount; colO++) {
                if (columnInfo.COL_ID == oldColumns[colO].id) {
                  newColumnEditorOptions = $.extend(true, {}, oldColumns[colO].editorOptions);
                  newColumn.editorOptions = newColumnEditorOptions;
                  break;
                }
              }
            }
            newColumns.push(newColumn);
          }
          // 조정된 컬럼이 있으면 반영
          if (newColumns.length > 0) {
            grdObject.view.setColumns(newColumns);
            grdObject.view.setOptions({
              frozenColumn: frozenColumn
            });
            grdObject.view.resizeCanvas();
            try {
              grdObject.view.autosizeColumns();
            } catch (e) {
            }
          }
        }
      }
    };
    */

    /**
     * 그리드 컬럼 Header 숨김
     * 
     * @param selector
     *          Grid Selector(#grdMaster ...)
     */
    $NC.hideGridColumnHeader = function(selector) {

      $(selector + " .slick-header").css("display", "none");
    };

    /**
     * 그리드 가로 스크롤바 숨김
     * 
     * @param selector
     *          Grid Selector(#grdMaster ...)
     */
    $NC.hideGridHorzScroller = function(selector) {

      $(selector + " .slick-viewport").css("overflow-x", "hidden");
    };

    /**
     * 그리드 세로 스크롤바 숨김
     * 
     * @param selector
     *          Grid Selector(#grdMaster ...)
     */
    $NC.hideGridVertScroller = function(selector) {

      $(selector + " .slick-viewport").css("overflow-y", "hidden");
    };

    // -----------------------------------------------------------------------------------------------------------------
    // Public Function - 그리드
    // TODO: Public Function - 그리드 - END
    // -----------------------------------------------------------------------------------------------------------------

    // -----------------------------------------------------------------------------------------------------------------
    // Private Function
    // TODO: Private Function
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * 초기화
     */
    function init() {

      backwardCompatibilityMethod();

      var _Options = $.extend(true, {}, options);
      if (_Options.G_MAIN) {
        $NC.G_MAIN = _Options.G_MAIN;
      }

      if (_Options.G_VAR) {
        $NC.G_VAR = $.extend({}, $NC.G_VAR, _Options.G_VAR);
      }
      if (_Options.G_OFFSET) {
        $NC.G_OFFSET = $.extend({}, $NC.G_OFFSET, _Options.G_OFFSET);
      }

      if ($NC.G_MAIN == window) {
        $NC.G_LAYOUT = getLayout();
        $NC.G_CHILDLAYOUT = getChildLayout();
      } else {
        if (_Options.G_JWINDOW) {
          $NC.G_JWINDOW = _Options.G_JWINDOW;
        }

        // 참조
        $NC.G_LAYOUT = $NC.G_MAIN.$NC.G_LAYOUT;
        $NC.G_CHILDLAYOUT = $NC.G_MAIN.$NC.G_CHILDLAYOUT;
        $NC.G_USERINFO = $NC.G_MAIN.$NC.G_USERINFO;
        $NC.G_MSG = $NC.G_MAIN.$NC.G_MSG;
      }

      if ($NC.G_LAYOUT.adjust.width != 0 != $NC.G_LAYOUT.adjust.height != 0) {
        var btnClass = ".ui-btn-popup,.ui-btn-refresh";
        var spnClass = ".ui-span-normal";
        var styleHtml = "<style type='text/css' rel='stylesheet'>" + btnClass + " {margin-left: "
            + $NC.G_LAYOUT.adjust.width + "px; margin-right: " + $NC.G_LAYOUT.adjust.width + "px; height: "
            + (21 - $NC.G_LAYOUT.adjust.height) + "px;}\n" + spnClass + " {margin-left: " + $NC.G_LAYOUT.adjust.width
            + "px; margin-right: " + $NC.G_LAYOUT.adjust.width + "px;}" + "</style>";
        $(styleHtml).appendTo($("head"));
      }
    }

    /**
     * 하위 호환을 위한 Method 구현
     */
    function backwardCompatibilityMethod() {

      // IE8 이하 (ECMAScript 5) -> Object.keys 없음
      if (!Object.keys) {
        Object.keys = (function() {
          'use strict';
          var hasOwnProperty = Object.prototype.hasOwnProperty, hasDontEnumBug = !({
            toString: null
          }).propertyIsEnumerable('toString'), dontEnums = ['toString', 'toLocaleString', 'valueOf', 'hasOwnProperty',
              'isPrototypeOf', 'propertyIsEnumerable', 'constructor'], dontEnumsLength = dontEnums.length;

          return function(obj) {
            if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
              throw new TypeError('Object.keys called on non-object');
            }

            var result = [ ], prop, i;

            for (prop in obj) {
              if (hasOwnProperty.call(obj, prop)) {
                result.push(prop);
              }
            }

            if (hasDontEnumBug) {
              for (i = 0; i < dontEnumsLength; i++) {
                if (hasOwnProperty.call(obj, dontEnums[i])) {
                  result.push(dontEnums[i]);
                }
              }
            }
            return result;
          };
        }());
      }

      // IE8 이하 (ECMAScript 5) -> Array.isArray 없음
      if (!Array.isArray) {
        Array.isArray = function(vArg) {
          var isArray;
          isArray = vArg instanceof Array;
          return isArray;
        };
      }

      // IE8 이하 (ECMAScript 5) -> String.trim 없음
      if (!String.prototype.trim) {
        String.prototype.trim = function() {
          return this.replace(/^\s+|\s+$/g, '');
        };
      }
    }

    /**
     * 스크롤바 사이즈
     * 
     * @returns {Object}<br>
     *          width, height
     */
    function measureScrollbar() {
      var $c = $(
          "<div style='position:absolute; top:-10000px; left:-10000px; width:100px; height:100px; overflow:scroll;'></div>")
          .appendTo($NC.G_MAIN.document.body);
      var result = {
        width: $c.width() - $c[0].clientWidth,
        height: $c.height() - $c[0].clientHeight
      };
      $c.remove();
      return result;
    }

    /**
     * 스페이스 사이즈
     * 
     * @returns {Object}
     */
    function measureSpace() {
      var $c = $("<span style='position:absolute; top:-10000px; left:-10000px;'>&nbsp;</span>").appendTo(
          $NC.G_MAIN.document.body);
      var result = {
        width: $c.width(),
        height: $c.height()
      };
      $c.remove();
      return result;
    }

    /**
     * Resize시 사용할 기본 Layout Size RETURN
     * 
     * @returns {}
     */
    function getLayout() {

      var layout = {};
      // 상수값 지정
      layout.border1 = 2;
      layout.border2 = layout.border1 * 2;
      layout.margin1 = 5;
      layout.margin2 = layout.margin1 * 2;
      layout.padding1 = 5;
      layout.padding2 = layout.padding1 * 2;
      layout.header = 23;
      layout.tabHeader = 26;
      layout.topOffset = 2;
      layout.nonClientWidth = layout.border2 + layout.margin1;
      layout.nonClientHeight = layout.border1 + layout.topOffset;
      layout.scroll = measureScrollbar();
      layout.space = measureSpace();
      layout.adjust = {
        width: 3 - layout.space.width,
        height: 14 - layout.space.height
      };

      return layout;
    }

    /**
     * Resize시 사용할 단위화면 기본 Layout Size RETURN
     * 
     * @returns {}
     */
    function getChildLayout() {

      var layout = {};

      layout.minWidth = 850;
      layout.minHeight = 500;
      layout.width = 0;
      layout.height = 0;
      layout.nonClientWidth = 2;
      layout.nonClientHeight = 33;

      return layout;
    }

    /**
     * 날짜에 구분자가 없을 경우 추가
     * 
     * @param dateString
     * @param onlyMonth
     * @returns
     */
    function addDateSeparator(dateString, onlyMonth) {

      if ($NC.isNull(dateString)) {
        return "";
      }
      var len = dateString.length;
      if (onlyMonth) {
        if (len != 6) {
          return dateString;
        }

        return dateString.substr(0, 4) + $NC.G_CONSTS.DIV_DATE + dateString.substr(4, 2);
      } else {
        if (len != 8) {
          return dateString;
        }

        return dateString.substr(0, 4) + $NC.G_CONSTS.DIV_DATE + dateString.substr(4, 2) + $NC.G_CONSTS.DIV_DATE
            + dateString.substr(6, 2);
      }
    }

    /**
     * 문자열 날짜를 분할하여 Array로 RETURN<br>
     * 19000101, 1900-01-01, 1900/01/01
     * 
     * @param dateString
     * @returns {Array}
     */
    function getDateArray(dateString) {

      var resultArray = [ ];
      if ($NC.isNull(dateString)) {
        return resultArray;
      }
      var len = dateString.length;
      if (len < 8) {
        return resultArray;
      }

      // 8자면 "-" 추가
      if (len == 8) {
        resultArray.push(dateString.substr(0, 4));
        resultArray.push(dateString.substr(4, 2));
        resultArray.push(dateString.substr(6, 2));
      } else {
        // "/" -> "-" 변환
        if (dateString.search($NC.G_CONSTS.DIV_REP_DATE) > -1) {
          dateString = dateString.replace(/\/|-/g, $NC.G_CONSTS.DIV_DATE);
        }

        // "-" 이 두개가 아니면
        resultArray = dateString.split($NC.G_CONSTS.DIV_DATE);
        if (resultArray.length != 3) {
          resultArray = [ ];
        }
      }

      return resultArray;
    }

    /**
     * 문자열 년월를 분할하여 Array로 RETURN<br>
     * 190001, 1900-01, 1900/01
     * 
     * @param dateString
     * @returns {Array}
     */
    function getMonthArray(dateString) {

      var resultArray = [ ];
      if ($NC.isNull(dateString)) {
        return resultArray;
      }
      var len = dateString.length;
      if (len < 6) {
        return resultArray;
      }

      // 8자면 "-" 추가
      if (len == 6) {
        resultArray.push(dateString.substr(0, 4));
        resultArray.push(dateString.substr(4, 2));
      } else {
        // "/" -> "-" 변환
        if (dateString.search($NC.G_CONSTS.DIV_REP_DATE) > -1) {
          dateString = dateString.replace(/\/|-/g, $NC.G_CONSTS.DIV_DATE);
        }

        // "-" 이 두개가 아니면
        resultArray = dateString.split($NC.G_CONSTS.DIV_DATE);
        if (resultArray.length != 2) {
          resultArray = [ ];
        }
      }

      return resultArray;
    }

    /**
     * 메시지ID로 메시지 정보 리턴
     * 
     * @param msgID
     *          메시지ID
     * @param programID
     *          프로그램ID
     * @param subID
     *          [S]TAB이 있을 경우 TAB 구분자, T1, T2...TN
     * @param searchOption
     *          "D" : DISPLAY_YN<br>
     *          "M" : MSG_NM
     * @returns {Object}
     */
    function getInternalDisplayInfo(msgID, programID, subID, searchOption) {

      var result = {
        DISPLAY_YN: "",
        MSG_NM: ""
      };

      var PARENT_MSG = $NC.G_MSG[msgID];
      if ($NC.isNull(PARENT_MSG)) {
        return result;
      }

      var MSGS = [ ];
      if (!$NC.isNull(programID)) {
        if (!$NC.isNull(subID)) {
          MSGS.push(programID + "_" + subID);
        }
        MSGS.push(programID);
        MSGS.push(programID.substr(0, 3));
      }
      MSGS.push("NC");

      var GRP_NM = null;
      var MSG = null;
      for (var i = 0, count = MSGS.length; i < count; i++) {

        GRP_NM = MSGS[i];
        if ($NC.isNull(GRP_NM)) {
          continue;
        }

        MSG = PARENT_MSG[GRP_NM];
        if ($NC.isNull(MSG)) {
          continue;
        }

        if ($NC.isNull(result.DISPLAY_YN)) {
          result.DISPLAY_YN = MSG.DISPLAY_YN;
          if (searchOption == "D") {
            return result;
          }
        }

        if (!$NC.isNull(MSG.MSG_NM)) {
          result.MSG_NM = MSG.MSG_NM;
          break;
        }
      }
      return result;
    }

    /**
     * 메시지ID로 컬럼명을 리턴
     * 
     * @param msgID
     *          메시지ID
     * @param programID
     *          [S]프로그램ID
     * @param subID
     *          [S]TAB이 있을 경우 TAB 구분자, T1, T2...TN
     * @returns {Object}
     */
    function getGridDisplayInfo(msgID, programID, subID, searchOption) {

      if ($NC.isNull(msgID)) {
        return "";
      }

      if ($NC.isNull(programID)) {
        var programInfo = $NC.G_JWINDOW.get("userData");
        if ($NC.isNull(programInfo)) {
          programID = "";
        } else {
          programID = programInfo.PROGRAM_ID;
        }
      }

      return getInternalDisplayInfo(msgID, programID, subID, searchOption);
    }

    /**
     * 컬럼명을 화면표시 명칭으로 변경 후 컬럼 정보 Array에 추가
     * 
     * @param columns
     *          Grid 컬럼 Array
     * @param column
     *          Grid 컬럼
     * @param programID
     *          프로그램ID
     * @param subID
     *          [S]TAB이 있을 경우 TAB 구분자, T1, T2...TN
     */
    function setInternalGridColumn(columns, column, programID, subID) {

      var MSGS = [ ];
      if (!$NC.isNull(programID)) {
        if (!$NC.isNull(subID)) {
          MSGS.push(programID + "_" + subID);
        }
        MSGS.push(programID);
        MSGS.push(programID.substr(0, 3));
      }
      MSGS.push("NC");

      var GRP_NM = null;
      var PARENT_MSG = $NC.G_MSG[column.id];
      var MSG = null;
      for (var i = 0, count = MSGS.length; i < count; i++) {

        GRP_NM = MSGS[i];
        if ($NC.isNull(GRP_NM)) {
          continue;
        }

        MSG = PARENT_MSG[GRP_NM];
        if ($NC.isNull(MSG)) {
          continue;
        }

        // 화면표시 여부가 N이면 추가하지 않음
        if (MSG.DISPLAY_YN == "N") {
          return;
        }

        if (!$NC.isNull(MSG.MSG_NM)) {
          column.name = MSG.MSG_NM;
        } else {
          if (GRP_NM != "NC") {
            MSG = PARENT_MSG["NC"];
            if (!$NC.isNull(MSG) && !$NC.isNull(MSG.MSG_NM)) {
              column.name = MSG.MSG_NM;
            }
          }
        }
        break;
      }
      columns.push(column);
    }

    /**
     * 그리드 그룹핑 기능 추가
     * 
     * @param grdObj
     * @param options
     * @param grdElementId
     * @param compareFn
     * @param resultFn
     */
    function setInitGridGrouping(grdObj, options, grdElementId, compareFn, resultFn) {

      // 그룹 프로바이더 등록
      if (!$NC.isNull(options.dataGroupOptions)) {
        grdObj.view.registerPlugin(options.dataOptions.groupItemMetadataProvider);

        if (options.dataGroupOptions.comparer == undefined) {
          options.dataGroupOptions.comparer = function(group1, group2) {
            var x = group1.value, y = group2.value;
            return (x == y ? 0 : (x > y ? 1 : -1));
          };
        }
        if (options.dataGroupOptions.aggregators == undefined && options.aggregatedGroup != false) {
          options.dataGroupOptions.aggregators = [ ];
          if (options.columns) {
            if ($.isFunction(options.dataGroupOptions.compareFn)) {
              compareFn = options.dataGroupOptions.compareFn;
            }
            if ($.isFunction(options.dataGroupOptions.resultFn)) {
              resultFn = options.dataGroupOptions.resultFn;
            }
            options.dataGroupOptions.aggregators.push(new Slick.Data.Aggregators.Summary(grdObj.view, compareFn,
                resultFn));
          }
        }
        grdObj.data.setGrouping(options.dataGroupOptions);

        if (options.showGroupToggler != false && options.aggregatedGroup == false) {
          // 그룹으로 표시할 경우 Rows 옆에 그룹 처리를 위한 Toggler 추가
          var grdRowCount = $("#divRowCount_" + grdElementId);
          var spanGroupToggler = grdRowCount.after(
              "<td><span class='slick-group-toggle expanded' title='그룹 모두 접기'></span></td>").next().children();
          spanGroupToggler.data("targetGrid", grdElementId);
          spanGroupToggler.click(function(e) {
            var targetToggler = $(e.target);
            var targetGrid = window["G_" + targetToggler.data("targetGrid").toUpperCase()];
            if (targetGrid.data.getLength() == 0) {
              return;
            }
            if (targetToggler.hasClass("expanded")) {
              targetToggler.removeClass("expanded");
              targetToggler.addClass("collapsed");
              targetToggler.prop("title", "그룹 모두 펼치기");
              targetGrid.data.collapseAllGroups();
            } else {
              targetToggler.removeClass("collapsed");
              targetToggler.addClass("expanded");
              targetToggler.prop("title", "그룹 모두 접기");
              targetGrid.data.expandAllGroups();
            }
          });
        }
      }
    }

    /**
     * 그리드 이벤트 연결
     * 
     * @param grdObj
     * @param options
     */
    function setInitGridEvent(grdObj, options) {

      // 그리드 정렬, 미지정시 기본 정렬 생성
      // args
      // grid: SlickGrid, multiColumnSort, sortAsc, sortCol: Object
      grdObj.view.onSort.subscribe(function(e, args) {

        var targetGrid = window["G_" + args.grid.getContainerNode().id.toUpperCase()];

        if (targetGrid.view.getEditorLock().isActive()) {
          targetGrid.view.getEditorLock().commitCurrentEdit();
        }

        if ($(e.target).is(":checkbox")) {
          targetGrid.view.setSortColumns([{
            columnId: targetGrid.sortCol,
            sortAsc: targetGrid.sortDir == 1
          }]);

          // e.stopPropagation();
          // e.stopImmediatePropagation();
          return;
        }

        // 수정 중에는 정렬 불가
        if (targetGrid.lastRowModified) {
          grdObj.view.setSortColumns([{
            columnId: targetGrid.sortCol,
            sortAsc: !args.sortAsc
          }]);
          alert("현재 선택된 레코드의 데이터가 수정 중 입니다. 다른 레코드로 이동 후 정렬하십시오.");
          return;
        }

        targetGrid.sortCol = args.sortCol.field;
        targetGrid.sortDir = args.sortAsc ? 1 : -1;

        if (targetGrid.onSortCompare) {
          targetGrid.data.sort(targetGrid.onSortCompare, args.sortAsc);
        } else {
          var sortCompareFn;
          if (targetGrid.data.getGrouping().length > 0) {
            if (args.sortCol.groupToggler || args.sortCol.groupDisplay) {
              sortCompareFn = function(group1, group2) {
                var x = group1.rows[0][targetGrid.sortCol], y = group2.rows[0][targetGrid.sortCol];
                return (x == y ? 0 : (x > y ? 1 : -1));
              };
              targetGrid.data.groupSort(sortCompareFn, args.sortAsc);
            } else {
              sortCompareFn = function(item1, item2) {
                var x = item1[targetGrid.sortCol], y = item2[targetGrid.sortCol];
                return (x == y ? 0 : (x > y ? 1 : -1));
              };
              targetGrid.data.sort(sortCompareFn, args.sortAsc);
            }
          } else {
            sortCompareFn = function(item1, item2) {
              var x = item1[targetGrid.sortCol], y = item2[targetGrid.sortCol];
              return (x == y ? 0 : (x > y ? 1 : -1));
            };
            targetGrid.data.sort(sortCompareFn, args.sortAsc);
          }
        }

        var lastRow = targetGrid.lastRow;
        targetGrid.lastRow = null;
        $NC.setGridSelectRow(targetGrid, lastRow);
      });

      // 셀클릭시 데이터 복사 기능
      // args -> cell, row, grid
      if ($NC.isNull(options.canCopyData) || options.canCopyData) {
        grdObj.view.onClick.subscribe(function(e, args) {
          if (e.ctrlKey === true || e.metaKey === true) {
            var rowData = args.grid.getDataItem(args.row);
            var column = args.grid.getColumns()[args.cell];
            if ($NC.isNull(column.field)) {
              alert("복사 또는 검색 할 수 없는 항목입니다.");
              return;
            }
            // if ($NC.isNull(rowData[column.field]) && e.shiftKey === false) {
            // alert("복사할 값이 없는 항목입니다.");
            // return;
            // }
            $NC.G_MAIN.hideCopyGridData();
            $NC.G_MAIN.showCopyGridData(args.grid.getContainerNode().id, column, rowData, e.shiftKey, args.row,
                args.grid.getDataLength());
          }
        });
      }

      // 그리드 Data Object 관련
      grdObj.data.onRefresh.subscribe(function(e, args) {
        var targetElementId = args.dataView.getOptions().container;
        var targetGrid = window["G_" + targetElementId.toUpperCase()];
        if (args.countChangeInfo.changed) {
          targetGrid.view.updateRowCount();
          var activeCell = targetGrid.view.getActiveCell();
          if (activeCell && targetGrid.lastRow != null) {
            $NC.setGridDisplayRows(targetGrid, activeCell.row + 1);
          }
        }
        if (args.rowChangeInfo.changed) {
          targetGrid.view.invalidateRows(args.rowChangeInfo.rows);
        }
        targetGrid.view.render();

        var summaryRow = targetGrid.view.getOptions().summaryRow;
        if ($NC.isNull(summaryRow) || summaryRow.visible != true) {
          return;
        }
        $NC.refreshGridSummaryData(targetGrid, summaryRow);
      });

      /*
      grdObj.data.onRowCountChanged.subscribe(function(e, args) {
        var targetGrid = window["G_" + args.dataView.getOptions().container.toUpperCase()];
        targetGrid.view.updateRowCount();
        targetGrid.view.render();

        var summaryRow = targetGrid.view.getOptions().summaryRow;
        if ($NC.isNull(summaryRow) || summaryRow.visible != true) {
          return;
        }
        $NC.refreshGridSummaryData(targetGrid, summaryRow);
      });

      grdObj.data.onRowsChanged.subscribe(function(e, args) {
        var targetGrid = window["G_" + args.dataView.getOptions().container.toUpperCase()];
        targetGrid.view.invalidateRows(args.rows);
        targetGrid.view.render();

        var summaryRow = targetGrid.view.getOptions().summaryRow;
        if ($NC.isNull(summaryRow) || summaryRow.visible != true) {
          return;
        }
        $NC.refreshGridSummaryData(targetGrid, summaryRow);
      });
      */
    }

    /**
     * 그리드 타이틀바 교체
     * 
     * @param grdObj
     * @param options
     * @param grdElementId
     */
    function setInitGridTitleBar(grdObj, options, grdElementId) {

      // 그리드 Title 교체, 엑셀 다운로드
      var grdTitleSelector = "#divTitle_" + grdElementId;
      var grdTitleValue = $NC.getValue(grdTitleSelector);
      $NC.setValue(grdTitleSelector);

      var txtTitle = "";
      var grdTitlebarT = $(
          "<div id='divTitleCaption_" + grdElementId + "' class='ui-lbl-grid'>" + grdTitleValue + "</div>").appendTo(
          grdTitleSelector);
      if ($NC.isNull(options.canExportExcel) || options.canExportExcel) {
        txtTitle = "▶ 그리드의 내용을 엑셀 파일로 다운로드\n   [더블클릭]현재 그리드의 내용\n   [Ctrl+더블클릭]현재 그리드의 데이터셋";
        grdTitlebarT.addClass("excel").prop("title", txtTitle);
        grdTitlebarT.bind($.browser.mobile ? "taphold" : "dblclick", function(e) {
          $NC.excelExportGrid(e, e.ctrlKey ? 2 : 1, $NC.getValue($(e.target)));
        });
      }

      if (options.canDblClick) {
        if (!$NC.isNull(txtTitle)) {
          txtTitle += "\n\n";
        }
        grdTitlebarT.addClass("dblclick").prop("title", txtTitle + "▶ 그리드 내용을 더블클릭할 경우 팝업 창 표시");
      }

      /*
      // 1: 프로그램 단위화면, 2: 프로그램 단위화면 서브 팝업일 경우만 컬럼위치 조정 가능
      var windowType = -1;
      if ($NC.G_JWINDOW) {
        windowType = $NC.G_JWINDOW.get("windowType") || -1;
      }
      if (windowType == 1 || windowType == 2) {
        var grdTitlebarR = $("#divRowCount_" + grdElementId);
        grdTitlebarR.addClass("columnreorder").prop("title", "[더블클릭]그리드 컬럼순서 조정");
        grdTitlebarR.dblclick(function(e) {
          var grdContainer = $(e.target).parents("table:first").next("div[class*=slickgrid]:first");
          if (grdContainer.length === 0) {
            alert("컬럼 순서를 조정할 그리드를 검색하지 못했습니다.");
            return;
          }
          var reorderGrid = window["G_" + grdContainer[0].id.toUpperCase()];

          var bands = reorderGrid.view.getOptions().bands;
          if (bands && bands.length > 0) {
            alert("그리드 컬럼 위에 밴드 타이틀이 지정된 그리드는 컬럼순서를 조정할 수 없습니다.");
            return;
          }

          $NC.G_MAIN.showGridColumnReorderPopup({
            programTitle: $NC.G_JWINDOW.get("title"),
            programInfo: $NC.G_JWINDOW.get("userData"),
            gridTitle: $NC.getValue("#divTitleCaption_" + grdContainer[0].id),
            gridObject: reorderGrid,
            onOk: function(columnPosition) {
              $NC.setGridColumnReorder(columnPosition);
            }
          });
        });
      }
      */
    }

    /**
     * Grid에서 해당 조건에 맞는 데이터의 합계 리턴
     * 
     * @param grdObject
     *          단위화면에 선언한 전역변수(G_GRDMASTER, G_GRDDETAIL ...)
     * @param options
     *          [S]columns[필수]: 합계를 구할 필드 명, Key or [Key1, Key2, ...]<br>
     *          [F]compareFn[필수:택2]: 데이터 비교를 처리할 Function, function (rowData) {}<br>
     *          [B]isAllData[옵션]: 데이터에 필터가 적용되었을 경우 true를 주면 전체 데이터를 기준으로 검색<br>
     * @returns {Object}
     */
    function getGridAggregatedVal(grdObject, options) {

      var result = {};

      if ($NC.isNull(options.columns)) {
        return result;
      }

      var equalFn = function(compareFn, column, rowData) {

        if (compareFn) {
          return compareFn.call(this, column.field, rowData);
        }

        return true;
      };

      var targetRows, aggregateKeys;
      var rowData, column, columnVal;
      var isGrouped = false;
      if (!$NC.isNull(options.isAllData) && options.isAllData) {
        targetRows = grdObject.data.getItems();
      } else {
        targetRows = grdObject.data.getGroups();
        if (targetRows.length > 0) {
          isGrouped = true;
        } else {
          targetRows = grdObject.data.getDisplayItems();
        }
      }

      if (!Array.isArray(options.columns)) {
        aggregateKeys = [options.columns];
      } else {
        aggregateKeys = options.columns;
      }
      result = {};
      for (var k = 0, keyCount = aggregateKeys.length; k < keyCount; k++) {
        column = aggregateKeys[k];
        result[column.field] = 0;
        switch (column.aggregator) {
        case "AVG":
          result["COUNT_" + column.field] = 0;
          break;
        case "MAX":
        case "MIN":
          result["INDEX_" + column.field] = -1;
          break;
        }
      }
      if (isGrouped) {
        for (var g = 0, groupCount = targetRows.length; g < groupCount; g++) {
          for (var i = 0, rowCount = targetRows[g].rows.length; i < rowCount; i++) {
            rowData = targetRows[g].rows[i];
            for (var k = 0, keyCount = aggregateKeys.length; k < keyCount; k++) {
              column = aggregateKeys[k];
              if (equalFn(options.compareFn, column, rowData)) {
                columnVal = Number(rowData[column.field]) || 0;
                switch (column.aggregator) {
                case "SUM":
                  result[column.field] += columnVal;
                  break;
                case "AVG":
                  result[column.field] += columnVal;
                  result["COUNT_" + column.field] += 1;
                  break;
                case "MAX":
                  if (result[column.field] < columnVal) {
                    result[column.field] = columnVal;
                    result["INDEX_" + column.field] = i;
                  }
                  break;
                case "MIN":
                  if (result[column.field] > columnVal) {
                    result[column.field] = columnVal;
                    result["INDEX_" + column.field] = i;
                  }
                  break;
                case "CNT":
                  result[column.field] += 1;
                  break;
                }
              }
            }
          }
        }
      } else {
        for (var i = 0, rowCount = targetRows.length; i < rowCount; i++) {
          rowData = targetRows[i];
          for (var k = 0, keyCount = aggregateKeys.length; k < keyCount; k++) {
            column = aggregateKeys[k];
            if (equalFn(options.compareFn, column, rowData)) {
              columnVal = Number(rowData[column.field]) || 0;
              switch (column.aggregator) {
              case "SUM":
                result[column.field] += columnVal;
                break;
              case "AVG":
                result[column.field] += columnVal;
                result["COUNT_" + column.field] += 1;
                break;
              case "MAX":
                if (result[column.field] < columnVal) {
                  result[column.field] = columnVal;
                  result["INDEX_" + column.field] = i;
                }
                break;
              case "MIN":
                if (result[column.field] > columnVal) {
                  result[column.field] = columnVal;
                  result["INDEX_" + column.field] = i;
                }
                break;
              case "CNT":
                result[column.field] += 1;
                break;
              }
            }
          }
        }
      }

      // 평균 값 재계산
      for (var k = 0, keyCount = aggregateKeys.length; k < keyCount; k++) {
        column = aggregateKeys[k];
        if (column.aggregator == "AVG") {
          result[column.field] = (result[column.field] / result["COUNT_" + column.field]) || 0;
        }
      }

      return result;
    }

    /**
     * ajax Service 이중 발생 방지
     * ID를 기록하고, Service 성공시 삭제한다.
     */
    var serviceCallLog = []
      ,removeServiceLogTimeoutId = null
    function addServiceLog (id, args, flag) {
      var mode = localStorage.getItem('_MODE');
      if (mode === 'DEV') {
        console.info(flag + ': ', id, args)
      }
      clearTimeout(removeServiceLogTimeoutId);
      removeServiceLogTimeoutId = setTimeout(function(){
        removeAllServiceLog();
      }, 200)
      args.id = id
      service = JSON.stringify(args).replace(/ /g, '');
      for (var i in serviceCallLog) {
        if (serviceCallLog[i] == service) {
          console.error('serviceCall이 두 번 호출되었습니다.( ' + serviceCallLog[i] + ' )')
          return false;
        }
      }
      serviceCallLog.push(service)
      return true;
    }
    function removeServiceLog (id, args, flag) {
      var mode = localStorage.getItem('_MODE');
      if (mode === 'DEV') {
        console.info(flag + ': ', id, args)
      }
      args.id = id
      service = JSON.stringify(args).replace(/ /g, '');
      for (var i in serviceCallLog) {
        if (serviceCallLog[i] == service) {
          serviceCallLog.splice(i, 1);
          return true;
        }
      }
    }
    function removeAllServiceLog() {
      serviceCallLog.length = 0;
    }

    /**
     * 초기화
     */
    init();
  }

})(jQuery);

// ---------------------------------------------------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------------------------------------------------

$(document).ready(function() {

  window["$NC"] = new Nexos.Common({
    G_MAIN: top
  });
  if ($.isFunction(Nexos.Popup)) {
    window["$NP"] = new Nexos.Popup();
  }

  // Window Type 판단
  // 0: Main, 1: 프로그램 단위화면, 2: 프로그램 단위화면 서브 팝업, 3: 공통 코드검색, 출력 미리보기 팝업
  var windowType = 0;
  if (!$NC.isNull(top.$NC.G_VAR.lastWindow)) {
    windowType = top.$NC.G_VAR.lastWindow.get("windowType");
  }

  // 초기화
  try {
    _BeforeInitialize(windowType);
    if ($.isFunction(window._Initialize)) {
      window._Initialize();
    }
    _AfterInitialize(windowType);
  } finally {
    if ($($NC.G_MAIN.document.body).find("#divTopLoadingLayer").length > 0) {
      setTimeout(function() {
        $NC.G_MAIN.$NC.G_VAR.onProgramLoadingTimeout = setInterval($NC.hideLoadingMessage, 300);
      }, 300);
    }
  }
  $(window).on('scroll', function(){
    window.scrollTo(0,0);
  })
});

/**
 * 화면 초기화 전 전역 변수(G_MAIN, G_VAR.view) 세팅 및 Resize offset 계산
 * 
 * @param isPopup
 */
function _BeforeInitialize(windowType) {

  // ajax 설정
  $.ajaxSetup({
    global: true
  // ,
  // timeout: 600000
  // 타임아웃: 10분
  });

  // Ajax 전역 Function
  $(document).ajaxStop(function(e) {
    $NC.hideProgressMessage();
  })
  // Backspace 무시
  .keydown(function(e) {
    if (e.which == 8) { // 8 == backspace
      var editableElements = /INPUT|TEXTAREA|FILE|PASSWORD/i;
      if (!editableElements.test(e.target.tagName) || e.target.disabled || e.target.readOnly) {
        e.preventDefault();
        return;
      }
    }
    if (e.altKey && (e.keyCode == 37 // left
    || e.keyCode == 39) // right
    ) {
      e.preventDefault();
    }
  });

  if (windowType > 0) {

    // jWindow 세팅
    $NC.G_JWINDOW = top.$NC.G_VAR.lastWindow;
    var P_USER_DATA = $NC.G_JWINDOW.get("userData");

    switch (windowType) {
    case 1: // 1: 프로그램 단위화면
      $NC.setGlobalVar({
        buttons: {
          _inquiry: "1",
          _new: "0",
          _save: "0",
          _cancel: "0",
          _delete: "0",
          _print: "0"
        }
      });
      if (P_USER_DATA) {
        $("#divTopLine").addClass(P_USER_DATA.PROGRAM_DIV.toLowerCase());
      }
      break;
    case 2: // 2: 프로그램 단위화면 서브 팝업
    case 3: // 3: 공통 코드검색 팝업
      $NC.setGlobalVar({
        userData: P_USER_DATA
      });
      break;
    }

    // 프로그램 버전정보
    $NC.G_JWINDOW.set({
      subtitle: $NC.getProgramVersion()
    });

  }

  if ($.isFunction(window._SetResizeOffset)) {
    window._SetResizeOffset();
  }
}

/**
 * 화면 초기화 후 Load Event 호출
 * 
 * @param windowType
 */
function _AfterInitialize(windowType) {

  // 기본 Event 연결
  $NC.setInitViewOnInputChangeEvent();
  $NC.setInitViewOnInputKeyDownEvent();
  $NC.setInitViewOnInputKeyUpEvent();

  // 화면표시명칭 및 표시여부 초기화
  $NC.setInitDisplay();

  // 화면 Resize 이벤트 연결
  $NC.setInitViewOnResizeEvent();

  // 그리드 컬럼 재조정
  // if (windowType > 0) {
  // $NC.setGridColumnReorder();
  // }

  // 화면 Resize 호출
  if ($.isFunction(window._SetResizeOffset)) {
    window._SetResizeOffset();
  }

  if ($.isFunction(window._OnResize)) {
    window._OnResize($(window));
  }

  if (windowType == 1) {
    if ($.isFunction(window._OnLoaded)) {
      window._OnLoaded();
    }
  } else if (windowType > 1) {
    if ($.isFunction(window._OnPopupOpen)) {
      window._OnPopupOpen();
    }
  }

  // 공통 버튼 초기화
  $NC.setInitTopButtons();
  // 단축키 기능 
  $NC.setInitViewShortCutKeyDownEvent();
}

/**
 * 그리드 CheckBox Formatter의 클릭이벤트 처리
 * 
 * @param e
 * @returns {Boolean}
 */
function _GridCheckBoxFormatterOnClick(e) {
  var view = $(e.target);
  var row = view.data("row");
  var cell = view.data("cell");
  var value = view.data("value");

  if ($.isFunction(window._OnGridCheckBoxFormatterClick)) {
    window._OnGridCheckBoxFormatterClick(e, view, {
      grid: view.parents("div[class*=slickgrid]:first")[0].id,
      row: row,
      cell: cell,
      val: value
    });
  }

  e.stopPropagation();
  e.stopImmediatePropagation();
  return false;
}