(function($) {
  // register namespace
  $.extend(true, window, {
    "Slick": {
      "RowSelectionModel": RowSelectionModel
    }
  });

  function RowSelectionModel(options) {
    var _grid;
    var _ranges = [ ];
    var _self = this;
    var _handler = new Slick.EventHandler();
    var _inHandler;
    var _options;
    var _defaults = {
      selectActiveRow: true
    };

    function init(grid) {
      _options = $.extend(true, {}, _defaults, options);
      _grid = grid;
      _handler.subscribe(_grid.onActiveCellChanged, wrapHandler(handleActiveCellChange));
      _handler.subscribe(_grid.onKeyDown, wrapHandler(handleKeyDown));
      _handler.subscribe(_grid.onClick, wrapHandler(handleClick));
    }

    function destroy() {
      _handler.unsubscribeAll();
    }

    function wrapHandler(handler) {
      return function() {
        if (!_inHandler) {
          _inHandler = true;
          handler.apply(this, arguments);
          _inHandler = false;
        }
      };
    }

    function rangesToRows(ranges) {
      var rows = [ ];
      for (var i = 0; i < ranges.length; i++) {
        for (var j = ranges[i].fromRow; j <= ranges[i].toRow; j++) {
          rows.push(j);
        }
      }
      return rows;
    }

    function rowsToRanges(rows) {
      var ranges = [ ];
      var lastCell = _grid.getColumns().length - 1;
      for (var i = 0; i < rows.length; i++) {
        ranges.push(new Slick.Range(rows[i], 0, rows[i], lastCell));
      }
      return ranges;
    }

    function getRowsRange(from, to) {
      var i, rows = [ ];
      for (i = from; i <= to; i++) {
        rows.push(i);
      }
      for (i = to; i < from; i++) {
        rows.push(i);
      }
      return rows;
    }

    function getSelectedRows() {
      return rangesToRows(_ranges);
    }

    function setSelectedRows(rows) {
      setSelectedRanges(rowsToRanges(rows));
    }

    function setSelectedRanges(ranges) {

      //var canFiredEvent = true;
      //if (ranges.length == 1 && _ranges.length == ranges.length && _ranges[0].toRow == ranges[0].toRow) {
      //  canFiredEvent = false;
      //}
      _ranges = ranges;
      //if (canFiredEvent) {
        _self.onSelectedRangesChanged.notify(_ranges);
      //}
    }

    function getSelectedRanges() {
      return _ranges;
    }

    function handleActiveCellChange(e, data) {
      if (_options.selectActiveRow && data.row != null) {
        // TODO: 같은 Row의 다른 Cell로 이동할 경우 onSelectedRangesChanged가 발생하지 않도록 수정, 20131211
        if (_ranges && _ranges.length == 1) {
          if (_ranges[0].toRow == data.row && _ranges[0].fromRow == data.row) {
            return;
          }
        }
        setSelectedRanges([new Slick.Range(data.row, 0, data.row, _grid.getColumns().length - 1)]);
      }
    }

    function handleKeyDown(e) {
      // TODO: 멀티셀렉트가 아닐 경우 선택되지 않도록 수정
      if (e.shiftKey && !e.ctrlKey && !e.altKey && !e.metaKey && (e.which == 38 || e.which == 40)) {
        if (!_grid.getOptions().multiSelect) {
          return;
        }
        var activeRow = _grid.getActiveCell();
        if (activeRow) {
          var selectedRows = getSelectedRows();
          selectedRows.sort(function(x, y) {
            return x - y;
          });

          if (!selectedRows.length) {
            selectedRows = [activeRow.row];
          }

          var top = selectedRows[0];
          var bottom = selectedRows[selectedRows.length - 1];
          var active;

          if (e.which == 40) {
            active = activeRow.row < bottom || top == bottom ? ++bottom : ++top;
          } else {
            active = activeRow.row < bottom ? --bottom : --top;
          }

          if (active >= 0 && active < _grid.getDataLength()) {
            _grid.scrollRowIntoView(active);
            var selection = $.grep(getRowsRange(top, bottom), function(o, i) {
              return (o !== activeRow.row);
            });
            selection.unshift(activeRow.row);
            _ranges = rowsToRanges(selection);
            setSelectedRanges(_ranges);
          }

          e.preventDefault();
          e.stopPropagation();
        }
      } else if (e.ctrlKey && !e.shiftKey && !e.altKey && !e.metaKey && e.which == 65) {
        // TODO : Ctrl + A 전체 선택 추가
        if (!_grid.getOptions().multiSelect) {
          return;
        }

        var activeRow = _grid.getActiveCell();
        var top = 0;
        var bottom = _grid.getDataLength() - 1;
        if (bottom > -1) {
          if (activeRow) {
            var selection = $.grep(getRowsRange(top, bottom), function(o, i) {
              return (o !== activeRow.row);
            });
            selection.unshift(activeRow.row);
            _ranges = rowsToRanges(selection);
          } else {
            _ranges = rowsToRanges(getRowsRange(top, bottom));
          }
          setSelectedRanges(_ranges);
        }

        e.preventDefault();
        e.stopPropagation();
      }
    }

    function handleClick(e) {
      var cell = _grid.getCellFromEvent(e);
      if (!cell || !_grid.canCellBeActive(cell.row, cell.cell)) {
        return false;
      }

      if (!_grid.getOptions().multiSelect || (!e.ctrlKey && !e.shiftKey && !e.metaKey)) {
        return false;
      }

      // TODO: 셀 값 복사 기능 추가로 멀티셀렉트일 경우 Ctrl 키 핸들링
      if (e.altKey && (e.ctrlKey || e.shiftKey || e.metaKey)) {
        return false;
      }

      var selection = rangesToRows(_ranges);
      var idx = $.inArray(cell.row, selection);

      if (idx === -1 && (e.ctrlKey || e.metaKey)) {
        // TODO: 마지막 선택 Row를 배열 처음에 삽입
        // selection.push(cell.row);
        selection.unshift(cell.row);
        _grid.setActiveCell(cell.row, cell.cell);
      } else if (idx !== -1 && (e.ctrlKey || e.metaKey)) {
        // TODO: 선택해제시 현재 선택된 Row가 하나면 선택해제 안되도록 처리
        if (selection && selection.length == 1) {
          return false;
        }
        selection = $.grep(selection, function(o, i) {
          return (o !== cell.row);
        });
        // TODO: 선택해제시 마지막 Row를 선택 함
        if (selection && selection.length > 0) {
          cell.row = selection[0];
        }
        _grid.setActiveCell(cell.row, cell.cell);
      } else if (selection.length && e.shiftKey) {
        var last = selection.pop();
        var from = Math.min(cell.row, last);
        var to = Math.max(cell.row, last);
        selection = [ ];
        for (var i = from; i <= to; i++) {
          if (i !== last) {
            selection.push(i);
          }
        }
        selection.push(last);
        _grid.setActiveCell(cell.row, cell.cell);
      }

      _ranges = rowsToRanges(selection);
      setSelectedRanges(_ranges);
      e.stopImmediatePropagation();

      return true;
    }

    $.extend(this, {
      "getSelectedRows": getSelectedRows,
      "setSelectedRows": setSelectedRows,

      "getSelectedRanges": getSelectedRanges,
      "setSelectedRanges": setSelectedRanges,

      "init": init,
      "destroy": destroy,

      "onSelectedRangesChanged": new Slick.Event()
    });
  }
})(jQuery);