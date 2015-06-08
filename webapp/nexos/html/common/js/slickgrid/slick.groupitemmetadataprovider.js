(function($) {
  $.extend(true, window, {
    Slick: {
      Data: {
        GroupItemMetadataProvider: GroupItemMetadataProvider
      }
    }
  });

  /**
   * Provides item metadata for group (Slick.Group) and totals (Slick.Totals) rows produced by the DataView. This
   * metadata overrides the default behavior and formatting of those rows so that they appear and function correctly
   * when processed by the grid. This class also acts as a grid plugin providing event handlers to expand & collapse
   * groups. If "grid.registerPlugin(...)" is not called, expand & collapse will not work.
   * 
   * @class GroupItemMetadataProvider
   * @module Data
   * @namespace Slick.Data
   * @constructor
   * @param options
   */
  function GroupItemMetadataProvider(options) {
    var _grid;
    var _defaults = {
      groupCssClass: "slick-group",
      groupTitleCssClass: "slick-group-title",
      totalsCssClass: "slick-group-totals",
      groupFocusable: true,
      totalsFocusable: false,
      toggleCssClass: "slick-group-toggle",
      toggleExpandedCssClass: "expanded",
      toggleCollapsedCssClass: "collapsed",
      enableExpandCollapse: true,
      groupFormatter: defaultGroupCellFormatter,
      totalsFormatter: defaultTotalsCellFormatter,
      ownerDrawing: true
    };

    options = $.extend(true, {}, _defaults, options);

    function defaultGroupCellFormatter(row, cell, value, columnDef, item) {

      var result = "";
      if (options.ownerDrawing) {

        var rowData = item.rows.length > 0 ? item.rows[0] : {};
        if (columnDef.groupToggler || columnDef.groupDisplay) {
          result = rowData[columnDef.field];
          if (result == undefined || result == null) {
            result = "";
          } else {
            result = (result + "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          }
        } else if (columnDef.aggregator) {
          var aggregator;
          if (!_grid.getData().getGrouping()[item.level].displayTotalsRow) {
            if (item.totals.isSummary) {
              aggregator = item.totals.summary;
            } else {
              aggregator = item.totals[columnDef.aggregator.toLowerCase()];
            }
          }
          if (aggregator) {
            result = aggregator[columnDef.field];
            if (result == undefined || result == null) {
              result = "";
            } else {
              result = columnDef.formatter ? columnDef.formatter.call(this, row, cell, Number((result).toFixed(6)),
                  columnDef, item) : result;
            }
          }
        } else {
          if (item.totals.isSummary) {
            result = item.totals.summary[columnDef.field];
          }
        }

        if (columnDef.groupToggler) {
          var indentation = item.level * 15 + "px";
          result = "<span class='" + options.toggleCssClass + " "
              + (item.collapsed ? options.toggleCollapsedCssClass : options.toggleExpandedCssClass)
              + "' style='margin-left:" + indentation + "'>" + "</span>" + "<span class='" + options.groupTitleCssClass
              + "' level='" + item.level + "'>" + result + "</span>";
        }
      } else {

        if (!options.enableExpandCollapse) {
          return item.title;
        }

        var indentation = item.level * 15 + "px";
        result = "<span class='" + options.toggleCssClass + " "
            + (item.collapsed ? options.toggleCollapsedCssClass : options.toggleExpandedCssClass)
            + "' style='margin-left:" + indentation + "'>" + "</span>" + "<span class='" + options.groupTitleCssClass
            + "' level='" + item.level + "'>" + item.title + "</span>";
      }
      return result;
    }

    function defaultTotalsCellFormatter(row, cell, value, columnDef, item) {
      var val;
      if (columnDef.groupTotalsFormatter) {
        val = columnDef.groupTotalsFormatter(item, columnDef);
      } else if (columnDef.aggregator) {
        if (item.isSummary) {
          aggregator = item.summary;
        } else {
          aggregator = item[columnDef.aggregator.toLowerCase()];
        }
        if (aggregator) {
          val = aggregator[columnDef.field];
        }
      }
      return (val == undefined || val == null) ? "" : val;
    }

    function init(grid) {
      _grid = grid;
      _grid.onClick.subscribe(handleGridClick);
      _grid.onKeyDown.subscribe(handleGridKeyDown);
    }

    function destroy() {
      if (_grid) {
        _grid.onClick.unsubscribe(handleGridClick);
        _grid.onKeyDown.unsubscribe(handleGridKeyDown);
      }
    }

    function handleGridClick(e, args) {
      var item = this.getDataItem(args.row);
      if (item && item instanceof Slick.Group && $(e.target).hasClass(options.toggleCssClass)) {
        var range = _grid.getRenderedRange();
        this.getData().setRefreshHints({
          ignoreDiffsBefore: range.top,
          ignoreDiffsAfter: range.bottom
        });

        if (item.collapsed) {
          this.getData().expandGroup(item.groupingKey);
        } else {
          this.getData().collapseGroup(item.groupingKey);
        }

        e.stopImmediatePropagation();
        e.preventDefault();
      }
    }

    // TODO: add -/+ handling
    function handleGridKeyDown(e, args) {
      if (options.enableExpandCollapse && (e.which == $.ui.keyCode.SPACE)) {
        var activeCell = this.getActiveCell();
        if (activeCell) {
          var item = this.getDataItem(activeCell.row);
          if (item && item instanceof Slick.Group) {
            var range = _grid.getRenderedRange();
            this.getData().setRefreshHints({
              ignoreDiffsBefore: range.top,
              ignoreDiffsAfter: range.bottom
            });

            if (item.collapsed) {
              this.getData().expandGroup(item.groupingKey);
            } else {
              this.getData().collapseGroup(item.groupingKey);
            }

            e.stopImmediatePropagation();
            e.preventDefault();
          }
        }
      }
    }

    function getRowMetadata(item) {
      if (options.getRowMetadata) {
        return options.getRowMetadata(item);
      }

      return null;
    }

    function getGroupRowMetadata(item) {
      var result;
      if (options.ownerDrawing) {
        result = {
          selectable: true,
          focusable: options.groupFocusable,
          cssClasses: options.groupCssClass,
          formatter: options.groupFormatter,
          editor: null
        };
      } else {
        result = {
          selectable: false,
          focusable: options.groupFocusable,
          cssClasses: options.groupCssClass,
          columns: {
            0: {
              colspan: "*",
              formatter: options.groupFormatter,
              editor: null
            }
          }
        };
      }
      return result;
    }

    function getTotalsRowMetadata(item) {
      return {
        selectable: false,
        focusable: options.totalsFocusable,
        cssClasses: options.totalsCssClass,
        formatter: options.totalsFormatter,
        editor: null
      };
    }

    return {
      "init": init,
      "destroy": destroy,
      "getRowMetadata": getRowMetadata,
      "getGroupRowMetadata": getGroupRowMetadata,
      "getTotalsRowMetadata": getTotalsRowMetadata
    };
  }
})(jQuery);
