/**
 * Contains basic SlickGrid editors.
 * 
 * @module Editors
 * @namespace Slick
 */

(function($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "Editors": {
        "Text": TextEditor,
        // "Integer": IntegerEditor,
        "Number": NumberEditor,
        "Date": DateEditor,
        // "YesNoSelect": YesNoSelectEditor,
        // TODO: CheckBox 수정
        "CheckBox": CheckBoxEditor,
        // "PercentComplete": PercentCompleteEditor,
        "LongText": LongTextEditor,
        // TODO: 콤보박스 추가
        "Popup": PopupEditor,
        "ComboBox": ComboBoxEditor
      }
    }
  });

  function TextEditor(args) {
    var $input;
    var defaultValue;
    var scope = this;

    this.init = function() {
      if (args.grid.getOptions().autoEdit) {
        args.grid.focus();
      }
      $input = $("<INPUT type=text class='editor-text' />");
      if (args.column.editorOptions && args.column.editorOptions.isKeyField) {
        $input.addClass("field-key");
      }
      $input.appendTo(args.container).bind("keydown.nav", function(e) {
        if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
          e.stopImmediatePropagation();
        }
      }).focus().select();
    };

    this.destroy = function() {
      $input.remove();
    };

    this.focus = function() {
      $input.focus();
    };

    this.getValue = function() {
      return $input.val();
    };

    this.setValue = function(val) {
      $input.val(val);
    };

    this.loadValue = function(item) {
      defaultValue = item[args.column.field] || "";
      $input.val(defaultValue);
      $input[0].defaultValue = defaultValue;
      $input.select();
    };

    this.serializeValue = function() {
      return $input.val();
    };

    this.applyValue = function(item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function() {
      return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
    };

    this.validate = function() {
      if (args.column.validator) {
        var validationResults = args.column.validator($input.val());
        if (!validationResults.valid) {
          return validationResults;
        }
      }

      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function IntegerEditor(args) {
    var $input;
    var defaultValue;
    var scope = this;

    this.init = function() {
      if (args.grid.getOptions().autoEdit) {
        args.grid.focus();
      }
      $input = $("<INPUT type=text class='editor-text' />");

      $input.bind("keydown.nav", function(e) {
        // if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
        // e.stopImmediatePropagation();
        // }
        // backspace, delete, tab, escape, enter
        if (e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 27 || e.keyCode == 13 ||
        // Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
        // home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        } else {
          if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
          }
        }
      });

      $input.appendTo(args.container);
      $input.focus().select();
    };

    this.destroy = function() {
      $input.remove();
    };

    this.focus = function() {
      $input.focus();
    };

    this.loadValue = function(item) {
      defaultValue = item[args.column.field];
      $input.val(defaultValue);
      $input[0].defaultValue = defaultValue;
      $input.select();
    };

    this.serializeValue = function() {
      return parseInt($input.val(), 10) || 0;
    };

    this.applyValue = function(item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function() {
      return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
    };

    this.validate = function() {
      if (isNaN($input.val())) {
        return {
          valid: false,
          msg: "Please enter a valid integer"
        };
      }

      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function NumberEditor(args) {
    var $input;
    var defaultValue;
    var scope = this;
    var isInteger = true;

    this.init = function() {
      if (args.grid.getOptions().autoEdit) {
        args.grid.focus();
      }

      $input = $("<INPUT type=text class='editor-text' />");

      if (args.column.editorOptions) {
        if (args.column.editorOptions.numberType) {
          if (args.column.editorOptions.numberType.toUpperCase() == "D") {
            isInteger = false;
          }
        }
        if (args.column.editorOptions.isKeyField) {
          $input.addClass("field-key");
        }
      }

      $input.bind("keydown.nav", function(e) {
        // dot
        if (e.keyCode == 190 || e.keyCode == 110) {
          if (isInteger) {
            e.preventDefault();
          } else {
            var dot = $input.val().match(/\./gi);
            if (dot != null && dot.length > 0) {
              e.preventDefault();
            }
          }
        }
        // backspace, delete, tab, escape, enter
        else if (e.keyCode == 8 || e.keyCode == 9 || e.keyCode == 27 || e.keyCode == 13 ||
        // Ctrl+A
        (e.keyCode == 65 && e.ctrlKey === true) ||
        // home, end, left, right
        (e.keyCode >= 35 && e.keyCode <= 39)) {
        } else {
          if (e.shiftKey || (e.keyCode < 48 || e.keyCode > 57) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
          }
        }
      });

      $input.appendTo(args.container);
      $input.focus().select();
    };

    this.destroy = function() {
      $input.remove();
    };

    this.focus = function() {
      $input.focus();
    };

    this.loadValue = function(item) {
      defaultValue = item[args.column.field];
      $input.val(defaultValue);
      $input[0].defaultValue = defaultValue;
      $input.select();
    };

    this.serializeValue = function() {
      var result = 0;

      if (isInteger) {
        result = parseInt($input.val(), 10) || 0;
      } else {
        result = parseFloat($input.val()) || 0;
      }
      return result;
    };

    this.applyValue = function(item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function() {
      return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
    };

    this.validate = function() {
      if (isNaN($input.val())) {
        return {
          valid: false,
          msg: "Please enter a valid integer"
        };
      }

      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function DateEditor(args) {
    var $input;
    var defaultValue;
    var scope = this;
    var calendarOpen = false;

    this.init = function() {
      if (args.grid.getOptions().autoEdit) {
        args.grid.focus();
      }
      $input = $("<INPUT type=text class='editor-date' />");
      if (args.column.editorOptions && args.column.editorOptions.isKeyField) {
        $input.addClass("field-key");
      }
      $input.appendTo(args.container).bind(
          "keydown.nav",
          function(e) {
            if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT || e.keyCode === $.ui.keyCode.UP
                || e.keyCode === $.ui.keyCode.DOWN) {
              e.stopImmediatePropagation();
            }
          }).prop("maxlength", "10").focus().select();
      $input.datepicker({
        dateFormat: "yy-mm-dd",
        changeYear: true,
        changeMonth: true,
        showOtherMonths: true,
        selectOtherMonths: true,
        showButtonPanel: true,
        showOn: "button",
        buttonImageOnly: true,
        buttonImage: "../../layout/common/redmond/image/calendar.gif",
        beforeShow: function() {
          calendarOpen = true;
          setTimeout(function() {
            $.datepicker.dpDiv.css("z-index", 200);
            $.datepicker.dpDiv.find(".ui-datepicker-year:first").addClass("ui-select-field-normal");
            $.datepicker.dpDiv.find(".ui-datepicker-month:first").addClass("ui-select-field-normal");
          }, 100);
        },
        onClose: function() {
          calendarOpen = false;
        }
      });
      var img = $input.next("img.ui-datepicker-trigger");
      img.css({
        cursor: "pointer",
        position: "absolute",
        top: "3px",
        right: "3px"
      }).prop("alt", "달력").prop("title", "달력");
    };

    this.destroy = function() {
      $.datepicker.dpDiv.stop(true, true);
      $input.datepicker("hide");
      $input.datepicker("destroy");
      $input.remove();
    };

    this.show = function() {
      if (calendarOpen) {
        $.datepicker.dpDiv.stop(true, true).show();
      }
    };

    this.hide = function() {
      if (calendarOpen) {
        $.datepicker.dpDiv.stop(true, true).hide();
      }
    };

    this.position = function(position) {
      if (!calendarOpen) {
        return;
      }
      $.datepicker.dpDiv.css("top", position.top + 30).css("left", position.left);
    };

    this.focus = function() {
      $input.focus();
    };

    this.loadValue = function(item) {
      defaultValue = item[args.column.field];
      $input.val(defaultValue);
      $input[0].defaultValue = defaultValue;
      $input.select();
    };

    this.serializeValue = function() {
      return $input.val();
    };

    this.applyValue = function(item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function() {
      return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
    };

    this.validate = function() {
      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function YesNoSelectEditor(args) {
    var $select;
    var defaultValue;
    var scope = this;

    this.init = function() {
      if (args.grid.getOptions().autoEdit) {
        args.grid.focus();
      }
      $select = $("<SELECT tabIndex='0' class='editor-yesno'><OPTION value='yes'>Yes</OPTION><OPTION value='no'>No</OPTION></SELECT>");
      $select.appendTo(args.container);
      $select.focus();
    };

    this.destroy = function() {
      $select.remove();
    };

    this.focus = function() {
      $select.focus();
    };

    this.loadValue = function(item) {
      $select.val((defaultValue = item[args.column.field]) ? "yes" : "no");
      $select.select();
    };

    this.serializeValue = function() {
      return ($select.val() == "yes");
    };

    this.applyValue = function(item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function() {
      return ($select.val() != defaultValue);
    };

    this.validate = function() {
      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function ComboBoxEditor(args) {
    var $select;
    var defaultValue;
    var scope = this;

    this.init = function() {
      if (args.grid.getOptions().autoEdit) {
        args.grid.focus();
      }
      var optionStr = "";
      var editOptions = args.column.editorOptions;
      if (editOptions) {
        var rows = editOptions.data;

        var codeField = editOptions.dataCodeField;
        var nameField = editOptions.dataNameField;
        var fullNameField = editOptions.dataFullNameField;

        if (editOptions.addAll) {
          optionStr += "<OPTION value='%'>% - 전체</OPTION>";
        } else if (editOptions.addEmpty) {
          optionStr += "<OPTION value=''></OPTION>";
        }

        var rowData;
        if (fullNameField) {
          for (var row = 0, rowCount = rows.length; row < rowCount; row++) {
            rowData = rows[row];
            optionStr += "<OPTION value='" + rowData[codeField] + "'>" + rowData[fullNameField] + "</OPTION>";
          }
        } else {
          for (var row = 0, rowCount = rows.length; row < rowCount; row++) {
            rowData = rows[row];
            optionStr += "<OPTION value='" + rowData[codeField] + "'>" + rowData[codeField] + " - "
                + rowData[nameField] + "</OPTION>";
          }
        }
      } else {
        optionStr += "<OPTION value=''></OPTION>";
      }

      $select = $("<SELECT tabIndex='0' class='editor-select'>" + optionStr + "</SELECT>");
      /*
      var offsetX = 1, offsetY = 2;
      if ($.browser.msie) {
        offsetX += 3;
        offsetY += 2;
      } else if ($.browser.mozilla) {
        offsetX += 3;
        offsetY += 3;
      } else if ($.browser.chrome) {
        offsetY -= 1;
      }
      $select.width(args.position.width - offsetX).height(args.position.height - offsetY);
      */

      if (args.column.editorOptions && args.column.editorOptions.isKeyField) {
        $select.addClass("field-key");
      }
      $select.appendTo(args.container);
      $select.focus();
    };

    this.destroy = function() {
      $select.remove();
    };

    this.focus = function() {
      $select.focus();
    };

    this.loadValue = function(item) {
      if (args.column.editorOptions && args.column.editorOptions.codeField) {
        defaultValue = item[args.column.editorOptions.codeField];
      } else {
        defaultValue = item[args.column.field];
      }
      $select.val(defaultValue);
    };

    this.serializeValue = function() {
      return $select.val();
    };

    this.applyValue = function(item, state) {
      if (args.column.editorOptions && args.column.editorOptions.codeField) {
        item[args.column.editorOptions.codeField] = state;
      }
      item[args.column.field] = $select.children(":selected").text();
    };

    this.isValueChanged = function() {
      return ($select.val() != defaultValue);
    };

    this.validate = function() {
      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function PopupEditor(args) {
    var $input;
    var $button;
    var defaultValue;
    var scope = this;

    this.init = function() {
      if (args.grid.getOptions().autoEdit) {
        args.grid.focus();
      }
      $input = $("<INPUT type=text class='editor-popup-text' />");
      if (args.column.editorOptions && args.column.editorOptions.isKeyField) {
        $input.addClass("field-key");
      }
      $input.appendTo(args.container).bind("keydown.nav", function(e) {
        if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT) {
          e.stopImmediatePropagation();
        }
      }).focus().select();
      $button = $("<INPUT type=button class='editor-popup-button' style='cursor: pointer' hideFocus />").appendTo(
          args.container);
      if (args.column.editorOptions.onPopup) {
        $button.click(function(e) {
          if (scope.isValueChanged()) {
            args.commitChanges();
          } else {
            args.column.editorOptions.onPopup(e, args);
          }
        });
      }
    };

    this.destroy = function() {
      $input.remove();
    };

    this.focus = function() {
      $input.focus();
    };

    this.getValue = function() {
      return $input.val();
    };

    this.setValue = function(val) {
      $input.val(val);
    };

    this.loadValue = function(item) {
      defaultValue = item[args.column.field] || "";
      $input.val(defaultValue);
      $input[0].defaultValue = defaultValue;
      $input.select();
    };

    this.serializeValue = function() {
      return $input.val();
    };

    this.applyValue = function(item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function() {
      return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
    };

    this.validate = function() {
      if (args.column.validator) {
        var validationResults = args.column.validator($input.val());
        if (!validationResults.valid) {
          return validationResults;
        }
      }

      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function CheckBoxEditor(args) {
    var $input;
    var defaultValue;
    var valueChecked = "Y";
    var valueUnChecked = "N";
    var scope = this;

    this.init = function() {
      if (args.grid.getOptions().autoEdit) {
        args.grid.focus();
      }
      if (args.column.editorOptions) {
        valueChecked = args.column.editorOptions.valueChecked;
        valueUnChecked = args.column.editorOptions.valueUnChecked;
      }

      $input = $("<INPUT type=checkbox value='false' class='editor-checkbox' hideFocus>");
      if (args.column.editorOptions && args.column.editorOptions.isKeyField) {
        $input.addClass("field-key");
      }
      $input.appendTo(args.container);
      $input.focus();
    };

    this.destroy = function() {
      $input.remove();
    };

    this.focus = function() {
      $input.focus();
    };

    this.loadValue = function(item) {
      defaultValue = item[args.column.field];
      if (defaultValue === valueChecked) {
        $input.prop('checked', true);
      } else {
        $input.prop('checked', false);
      }
    };

    this.serializeValue = function() {
      var resultValue;
      if ($input.prop("checked")) {
        resultValue = valueChecked;
      } else {
        resultValue = valueUnChecked;
      }
      return resultValue;
    };

    this.applyValue = function(item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function() {
      return (this.serializeValue() !== defaultValue);
    };

    this.validate = function() {
      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  function PercentCompleteEditor(args) {
    var $input, $picker;
    var defaultValue;
    var scope = this;

    this.init = function() {
      if (args.grid.getOptions().autoEdit) {
        args.grid.focus();
      }
      $input = $("<INPUT type=text class='editor-percentcomplete' />");
      $input.width($(args.container).innerWidth() - 25);
      $input.appendTo(args.container);

      $picker = $("<DIV class='editor-percentcomplete-picker' />").appendTo(args.container);
      $picker
          .append("<DIV class='editor-percentcomplete-helper'><DIV class='editor-percentcomplete-wrapper'><DIV class='editor-percentcomplete-slider' /><DIV class='editor-percentcomplete-buttons' /></DIV></DIV>");

      $picker
          .find(".editor-percentcomplete-buttons")
          .append(
              "<BUTTON val=0>Not started</BUTTON><br/><BUTTON val=50>In Progress</BUTTON><br/><button val=100>Complete</BUTTON>");

      $input.focus().select();

      $picker.find(".editor-percentcomplete-slider").slider({
        orientation: "vertical",
        range: "min",
        value: defaultValue,
        slide: function(event, ui) {
          $input.val(ui.value);
        }
      });

      $picker.find(".editor-percentcomplete-buttons button").bind("click", function(e) {
        $input.val($(this).attr("val"));
        $picker.find(".editor-percentcomplete-slider").slider("value", $(this).attr("val"));
      });
    };

    this.destroy = function() {
      $input.remove();
      $picker.remove();
    };

    this.focus = function() {
      $input.focus();
    };

    this.loadValue = function(item) {
      $input.val(defaultValue = item[args.column.field]);
      $input.select();
    };

    this.serializeValue = function() {
      return parseInt($input.val(), 10) || 0;
    };

    this.applyValue = function(item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function() {
      return (!($input.val() == "" && defaultValue == null)) && ((parseInt($input.val(), 10) || 0) != defaultValue);
    };

    this.validate = function() {
      if (isNaN(parseInt($input.val(), 10))) {
        return {
          valid: false,
          msg: "Please enter a valid positive number"
        };
      }

      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }

  /*
   * An example of a "detached" editor.
   * The UI is added onto document BODY and .position(), .show() and .hide() are implemented.
   * KeyDown events are also handled to provide handling for Tab, Shift-Tab, Esc and Ctrl-Enter.
   */
  function LongTextEditor(args) {
    var $input;// , $wrapper;
    var defaultValue;
    var scope = this;

    this.init = function() {
      if (args.grid.getOptions().autoEdit) {
        args.grid.focus();
      }
      // var $container = $("body");
      // $wrapper = $("<div style='z-index: 10000; position: absolute; background: white;'/>").appendTo($container);
      $input = $("<textarea hidefocus rows=5 class='editor-longtext'>").appendTo(args.container);
      if (args.column.editorOptions && args.column.editorOptions.isKeyField) {
        $input.addClass("field-key");
      }

      // $(
      // "<div style='padding: 5px; text-align:right'>"
      // + "<input type='button' class='ui-button-cmd' value='반영' style='width: 60px;' />"
      // + "<input type='button' class='ui-button-cmd' value='취소' style='width: 60px;' /></div>").appendTo(
      // $wrapper);

      // $wrapper.find("input:first").bind("click", this.save);
      // $wrapper.find("input:last").bind("click", this.cancel);
      $input.bind("keydown", this.handleKeyDown);

      // scope.position(args.position);
      // $input.css({
      // "width": args.position.width - 12,
      // "height": args.grid.getOptions().rowHeight * 3
      // });
      // $wrapper.css({
      // "top": args.position.top,
      // "left": args.position.left,
      // "width": args.position.width
      // });
      $input.focus().select();
    };

    this.handleKeyDown = function(e) {
      if (e.keyCode === $.ui.keyCode.LEFT || e.keyCode === $.ui.keyCode.RIGHT || e.keyCode === $.ui.keyCode.UP
          || e.keyCode === $.ui.keyCode.DOWN) {
        e.stopImmediatePropagation();
      } else if (e.which == $.ui.keyCode.ENTER) {
        if (e.ctrlKey === false && e.shiftKey === false && e.altKey === false) {
          e.stopImmediatePropagation();
        } else if (e.ctrlKey) {
          scope.save();
        } else if (e.altKey) {
          e.preventDefault();
          args.grid.navigateNext();
        }
      } else if (e.which == $.ui.keyCode.ESCAPE) {
        e.preventDefault();
        scope.cancel();
      } else if (e.which == $.ui.keyCode.TAB && e.shiftKey) {
        e.preventDefault();
        args.grid.navigatePrev();
      } else if (e.which == $.ui.keyCode.TAB) {
        e.preventDefault();
        args.grid.navigateNext();
      }
    };

    this.getValue = function() {
      return $input.val();
    };

    this.setValue = function(val) {
      $input.val(val);
    };

    this.save = function() {
      args.commitChanges();
    };

    this.cancel = function() {
      $input.val(defaultValue);
      args.cancelChanges();
    };

    /*
    this.hide = function() {
      $wrapper.hide();
    };

    this.show = function() {
      $wrapper.show();
    };

    this.position = function(position) {
      $wrapper.css({
        "top": position.top + args.grid.getOptions().rowHeight,
        "left": position.left,
        "width": position.width
      });
    };
    */

    this.destroy = function() {
      // $wrapper.remove();
      $input.remove();
    };

    this.focus = function() {
      $input.focus();
    };

    this.loadValue = function(item) {
      defaultValue = item[args.column.field] || "";
      $input.val(defaultValue);
      $input.select();
    };

    this.serializeValue = function() {
      return $input.val();
    };

    this.applyValue = function(item, state) {
      item[args.column.field] = state;
    };

    this.isValueChanged = function() {
      return (!($input.val() == "" && defaultValue == null)) && ($input.val() != defaultValue);
    };

    this.validate = function() {
      return {
        valid: true,
        msg: null
      };
    };

    this.init();
  }
})(jQuery);
