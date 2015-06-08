/**
 * Contains basic SlickGrid formatters.
 * 
 * @module Formatters
 * @namespace Slick
 */

(function($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "Formatters": {
        // "PercentComplete": PercentCompleteFormatter,
        // "PercentCompleteBar": PercentCompleteBarFormatter,
        // "YesNo": YesNoFormatter,
        // TODO: ProgressBar 수정
        "ProgressBar": ProgressBarFormatter,
        // TODO: CheckBox 수정
        "CheckBox": CheckBoxFormatter,
        // TODO: Number Formatter
        "Number": NumberFormatter,
        // TODO: Link Formatter
        "Link": LinkFormatter
      }
    }
  });

  function PercentCompleteFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null || value === "") {
      return "-";
    } else if (value < 50) {
      return "<span style='color:red;font-weight:bold;'>" + value + "%</span>";
    } else {
      return "<span style='color:green'>" + value + "%</span>";
    }
  }

  function PercentCompleteBarFormatter(row, cell, value, columnDef, dataContext) {
    if (value == null || value === "") {
      return "";
    }

    var color;

    if (value < 30) {
      color = "red";
    } else if (value < 70) {
      color = "silver";
    } else {
      color = "green";
    }

    return "<span class='percent-complete-bar' style='background:" + color + ";width:" + value + "%'></span>";
  }

  function YesNoFormatter(row, cell, value, columnDef, dataContext) {
    return value ? "Yes" : "No";
  }

  function ProgressBarFormatter(row, cell, value, columnDef, dataContext) {

    var color;
    var isNullFunc = function(checkVal) {
      return (checkVal == undefined || checkVal == null || (typeof checkVal == "string" && checkVal == ""));
    };
    var getMultipleColorFunc = function(checkVal) {
      if (checkVal < 20) {
        return "#f15f5f";
      } else if (checkVal < 40) {
        return "#f29661";
      } else if (checkVal < 60) {
        return "#f2cb61";
      } else if (checkVal < 80) {
        return "#e5d85c";
      } else {
        return "#bce55c";
      }
    };

    var options = columnDef.formatterOptions;
    var showText = true;
    if (options) {
      if (options.colorType == "S") {
        color = isNullFunc(options.color) ? "#bce55c" : options.color;
      } else if (options.colorType == "M") {
        var values = options.values || [ ];
        for (var i = 0, valueCount = values.length; i < valueCount; i++) {
          if (value < values[i]) {
            color = colors[i];
            break;
          }
        }
        color = isNullFunc(color) ? getMultipleColorFunc(value) : color;
      } else {
        color = getMultipleColorFunc(value);
      }
      showText = isNullFunc(options.showText) ? true : options.showText;
    } else {
      color = getMultipleColorFunc(value);
    }

    if (showText) {
      var resultFormat = "";
      if (!isNullFunc(value)) {
        resultFormat = "<span class='progress-bar' style='background:" + color + "; width:" + (value - 1)
            + "%';></span>";
      }
      return "<span class='progress-bar-text'>" + value + "%</span>" + resultFormat;
    } else {
      if (isNullFunc(value)) {
        return "";
      }
      return "<span class='progress-bar' style='background:" + color + "; width:" + (value - 1) + "%';></span>";
    }
  }

  function CheckBoxFormatter(row, cell, value, columnDef, dataContext) {
    // return value === "Y" ? "<img src='../../layout/common/redmond/image/tick.png'>" : "";
    var valueChecked = "Y", valueUnChecked = "N", onClick = "";
    var options;
    if (columnDef.formatterOptions) {
      options = columnDef.formatterOptions;
    } else if (columnDef.editorOptions) {
      options = columnDef.editorOptions;
    }

    if (options) {
      valueChecked = options.valueChecked;
      valueUnChecked = options.valueUnChecked;

      onClick = " onclick='_GridCheckBoxFormatterOnClick(event);' ";
    } else {
      onClick = " onclick='return false' onkeydown='return false' ";
    }
    value = value === valueChecked ? valueChecked : valueUnChecked;
    var data = " data-row='" + row + "' data-cell='" + cell + "' data-value='" + value + "' ";
    // return value === valueChecked ? "<img src='../../layout/common/redmond/image/checkbox_checked.gif'
    // style='vertical-align: middle' " + data + onClick + ">"
    // : "<img src='../../layout/common/redmond/image/checkbox_unchecked.gif' style='vertical-align: middle' " +
    // data + onClick + ">";
    return value === valueChecked ? "<input type='checkbox' checked='checked' style='vertical-align: middle' hidefocus "
        + data + onClick + ">"
        : "<input type='checkbox' style='vertical-align: middle' hidefocus " + data + onClick + ">";
  }
  
  function LinkFormatter( row, cell, value, columnDef, dataContext ) {
    if (value == null || value === undefined) {
      return "";
    }
    
    return '<a href="http://www.wemakeprice.com/deal/adeal/' + value + '" target="_blank">' + value + '</a>';
  }

  function NumberFormatter(row, cell, value, columnDef, dataContext) {

    var isDouble = false;
    if (columnDef.formatterOptions && columnDef.formatterOptions.numberType) {
      isDouble = columnDef.formatterOptions.numberType.toUpperCase() == "D";
    }

    if (value == undefined || value == null) {
      return "";
    }
    value += "";
    var splitVal = value.split(".");
    var intVal = splitVal[0];
    var dblVal = splitVal.length > 1 ? "." + splitVal[1] : "";
    var regEx = /(\d+)(\d{3})/;
    while (regEx.test(intVal)) {
      intVal = intVal.replace(regEx, '$1' + ',' + '$2');
    }

    return intVal + (isDouble ? dblVal : "");
  }
})(jQuery);