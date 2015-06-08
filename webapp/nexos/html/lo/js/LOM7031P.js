function _Initialize() {
  $NC.setInitTab("#divMasterView", {
    tabIndex: 0,
    onActivate: tabOnActivate
  });
  grdMasterT1Initialize();
  grdDetailT1Initialize();
  $("#btnCancel").click(onCancel);
  $("#btnPrintInvoice").click(onBtnPrintInvoice);
  $("#divButtons").show();
}
function _OnPopupOpen() {
  _Inquiry();
  G_GRDMASTERT1.view.focus();
}
function _SetResizeOffset() {
  $NC.G_OFFSET.leftViewWidth = 200;
  $NC.G_OFFSET.nonClientHeight = $("#divBottomView").outerHeight() + $NC.G_LAYOUT.nonClientHeight;
  $NC.G_OFFSET.tabHeader = $("#divMasterView").children(".ui-tabs-nav:first").outerHeight();
}
function _OnResize(c) {
  var d = c.width() - $NC.G_LAYOUT.border1 * 2;
  var b = c.height() - $NC.G_OFFSET.nonClientHeight - $NC.G_LAYOUT.border1;
  $NC.resizeContainer("#divMasterView", d, b);
  b -= $NC.G_OFFSET.tabHeader + $NC.G_LAYOUT.border1;
  var a = $("#divMasterView").tabs("option", "active");
  if (a === 0) {
    $NC.G_OFFSET.leftViewWidth = 300;
    d -= $NC.G_OFFSET.leftViewWidth + $NC.G_LAYOUT.nonClientWidth;
    $NC.resizeContainer("#divLeftViewT1", $NC.G_OFFSET.leftViewWidth, b);
    $NC.resizeContainer("#divRightViewT1", d, b);
    $NC.resizeGrid("#grdMasterT1", $NC.G_OFFSET.leftViewWidth, b - $NC.G_LAYOUT.header);
    $NC.resizeGrid("#grdDetailT1", d, b - $NC.G_LAYOUT.header);
    return;
  }
}
function _Inquiry() {
  var d = $NC.G_VAR.userData.P_CENTER_CD;
  var b = $NC.G_VAR.userData.P_BU_CD;
  var a = $NC.G_VAR.userData.P_OUTBOUND_DATE;
  var e = $NC.G_VAR.userData.P_OUTBOUND_NO;
  var c = $NC.getParams({
    P_CENTER_CD: d,
    P_BU_CD: b,
    P_OUTBOUND_DATE: a,
    P_OUTBOUND_NO: e
  });
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERT1, "CHECK_YN");
  $NC.setInitGridVar(G_GRDMASTERT1);
  G_GRDMASTERT1.queryParams = c;
  $NC.serviceCall("/LOM7030E/getDataSet.do", $NC.getGridParams(G_GRDMASTERT1), onGetMasterT1);
  $NC.setInitGridVar(G_GRDDETAILT1);
  G_GRDDETAILT1.queryParams = c;
  $NC.serviceCall("/LOM7030E/getDataSet.do", $NC.getGridParams(G_GRDDETAILT1), onGetDetailT1);
}
function _New() {
}
function _Save() {
  var h;
  var a = $("#divMasterView").tabs("option", "active");
  if (a === 1) {
    if (G_GRDDETAILT2.view.getEditorLock().isActive()) {
      G_GRDDETAILT2.view.getEditorLock().commitCurrentEdit();
    }
    if (G_GRDDETAILT2.lastRow != null) {
      if (!grdDetailT2OnBeforePost(G_GRDDETAILT2.lastRow)) {
        return;
      }
    }
    h = G_GRDDETAILT2;
  } else {
    if (a === 2) {
      if (G_GRDDETAILT3.view.getEditorLock().isActive()) {
        G_GRDDETAILT3.view.getEditorLock().commitCurrentEdit();
      }
      if (G_GRDDETAILT3.lastRow != null) {
        if (!grdDetailT3OnBeforePost(G_GRDDETAILT3.lastRow)) {
          return;
        }
      }
      h = G_GRDDETAILT3;
    } else {
      return;
    }
  }
  var g = [ ];
  var e = [ ];
  var j = h.data.getItems();
  var f = j.length;
  var c;
  for (var d = 0; d < f; d++) {
    c = j[d];
    if (c.CRUD == "U") {
      var b = {
        P_CENTER_CD: c.CENTER_CD,
        P_BU_CD: c.BU_CD,
        P_OUTBOUND_DATE: c.OUTBOUND_DATE,
        P_OUTBOUND_NO: c.OUTBOUND_NO,
        P_BOX_NO: c.BOX_NO,
        P_BRAND_CD: c.BRAND_CD,
        P_ITEM_CD: c.ITEM_CD,
        P_ITEM_STATE: c.ITEM_STATE,
        P_ITEM_LOT: c.ITEM_LOT,
        P_CONFIRM_QTY: c.CONFIRM_QTY
      };
      g.push(b);
      e.push(b);
    }
  }
  if (g.length === 0) {
    alert("저장할 데이터가 없습니다.");
    return;
  }
  $NC.serviceCall("/LOM7030E/save.do", {
    P_DS_MASTER: $NC.getParams({
      P_CENTER_CD: "",
      P_BU_CD: "",
      P_OUTBOUND_DATE: "",
      P_OUTBOUND_NO: "",
      P_BOX_NO: "",
      P_USER_ID: $NC.G_USERINFO.USER_ID
    }),
    P_DS_DETAIL: $NC.toJson(g),
    P_COMPLETE_YN: "N"
  }, onSave);
}
function _Delete() {
}
function _Cancel() {
}
function onCancel() {
  $NC.setPopupCloseAction("CANCEL");
  $NC.onPopupClose();
}
function _OnGridCheckBoxFormatterClick(d, a, b) {
  if (b.grid == "grdMasterT1") {
    if (G_GRDMASTERT1.view.getEditorLock().isActive()) {
      G_GRDMASTERT1.view.getEditorLock().commitCurrentEdit();
    }
    $NC.setGridSelectRow(G_GRDMASTERT1, b.row);
    var c = G_GRDMASTERT1.data.getItem(b.row);
    if (b.cell == G_GRDMASTERT1.view.getColumnIndex("CHECK_YN")) {
      c.CHECK_YN = b.val === "Y" ? "N" : "Y";
    }
    G_GRDMASTERT1.data.updateItem(c.id, c);
  }
}
function tabOnActivate(a, b) {
  var c = b.newTab.prop("id").substr(3).toUpperCase();
  $NC.G_VAR.activeTabName = "T" + c.substr(3);
  _OnResize($(window));
  if ($("#divMasterView").tabs("option", "active") === 0) {
    $("#divButtons").show();
  } else {
    $("#divButtons").hide();
  }
}
function onGetMasterT1(a) {
  $NC.setInitGridData(G_GRDMASTERT1, a);
  if (G_GRDMASTERT1.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTERT1.lastRow)) {
      $NC.setGridSelectRow(G_GRDMASTERT1, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERT1, G_GRDMASTERT1.lastRow);
    }
  } else {
    $NC.setGridDisplayRows("#grdMasterT1", 0, 0);
  }
}
function grdMasterT1OnGetColumns() {
  var a = [ ];
  $NC.setGridColumn(a, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 60,
    maxWidth: 60,
    sortable: false,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(a, {
    id: "WB_NO",
    field: "WB_NO",
    name: "송장번호",
    minWidth: 100,
    cssClass: "align-center"
  });
  $NC.setGridColumn(a, {
    id: "BOX_NO",
    field: "BOX_NO",
    name: "박스번호",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(a, {
    id: "BOXING_YN",
    field: "BOXING_YN",
    name: "박스완료여부",
    minWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  return $NC.setGridColumnDefaultFormatter(a);
}
function grdMasterT1Initialize() {
  var a = {
    specialRow: {
      compareFn: function(b, c) {
        if (c.BOXING_YN === "N") {
          return "specialrow4";
        }
      }
    }
  };
  $NC.setInitGridObject("#grdMasterT1", {
    columns: grdMasterT1OnGetColumns(),
    queryId: "LOM7030E.RS_T1_MASTER",
    sortCol: "BOX_NO",
    gridOptions: a
  });
  G_GRDMASTERT1.view.onSelectedRowsChanged.subscribe(grdMasterT1OnAfterScroll);
  G_GRDMASTERT1.view.onHeaderClick.subscribe(grdMasterT1OnHeaderClick);
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERT1, "CHECK_YN");
}
function grdMasterT1OnAfterScroll(b, a) {
  var c = a.rows[0];
  if (G_GRDMASTERT1.lastRow != null) {
    if (c == G_GRDMASTERT1.lastRow) {
      b.stopImmediatePropagation();
      return;
    }
  }
  $NC.setInitGridVar(G_GRDDETAILT1);
  G_GRDDETAILT1.lastFilterVal = G_GRDMASTERT1.data.getItem(c).BOX_NO;
  G_GRDDETAILT1.data.refresh();
  $NC.setGridSelectRow(G_GRDDETAILT1, 0);
  $NC.setGridDisplayRows("#grdMasterT1", c + 1);
}
function grdMasterT1OnHeaderClick(f, b) {
  if (b.column.id == "CHECK_YN") {
    if ($(f.target).is(":checkbox")) {
      if (G_GRDMASTERT1.data.getLength() == 0) {
        f.preventDefault();
        f.stopImmediatePropagation();
        return;
      }
      if (G_GRDMASTERT1.view.getEditorLock().isActive() && !G_GRDMASTERT1.view.getEditorLock().commitCurrentEdit()) {
        f.preventDefault();
        f.stopImmediatePropagation();
        return;
      }
      var c = $(f.target).is(":checked") ? "Y" : "N";
      var a = G_GRDMASTERT1.data.getLength();
      var d;
      G_GRDMASTERT1.data.beginUpdate();
      for (var g = 0; g < a; g++) {
        d = G_GRDMASTERT1.data.getItem(g);
        if (d.CHECK_YN !== c) {
          d.CHECK_YN = c;
          if (d.CRUD === "R") {
            d.CRUD = "U";
          }
          G_GRDMASTERT1.data.updateItem(d.id, d);
        }
      }
      G_GRDMASTERT1.data.endUpdate();
      f.stopPropagation();
      f.stopImmediatePropagation();
    }
    return;
  }
}
function grdDetailT1OnGetColumns() {
  var a = [ ];
  $NC.setGridColumn(a, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90
  });
  $NC.setGridColumn(a, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 150
  });
  $NC.setGridColumn(a, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(a, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 90
  });
  $NC.setGridColumn(a, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "기검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  return $NC.setGridColumnDefaultFormatter(a);
}
function grdDetailT1Initialize() {
  var a = {};
  $NC.setInitGridObject("#grdDetailT1", {
    columns: grdDetailT1OnGetColumns(),
    queryId: "LOM7030E.RS_T1_DETAIL",
    sortCol: "ITEM_CD",
    gridOptions: a
  });
  G_GRDDETAILT1.view.onSelectedRowsChanged.subscribe(grdDetailT1OnAfterScroll);
}
function grdDetailT1OnFilter(a) {
  return G_GRDDETAILT1.lastFilterVal === a.BOX_NO;
}
function grdDetailT1OnAfterScroll(b, a) {
  var c = a.rows[0];
  if (G_GRDDETAILT1.lastRow != null) {
    if (c == G_GRDDETAILT1.lastRow) {
      b.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdDetailT1", c + 1);
}
function grdMasterT2OnGetColumns() {
  var a = [ ];
  $NC.setGridColumn(a, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90
  });
  $NC.setGridColumn(a, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 150
  });
  $NC.setGridColumn(a, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(a, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 90
  });
  $NC.setGridColumn(a, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(a, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  return $NC.setGridColumnDefaultFormatter(a);
}
function grdMasterT2Initialize() {
  var a = {};
  $NC.setInitGridObject("#grdMasterT2", {
    columns: grdMasterT2OnGetColumns(),
    queryId: "LOM7030E.RS_T2_MASTER",
    sortCol: "BOX_NO",
    gridOptions: a
  });
  G_GRDMASTERT2.view.onSelectedRowsChanged.subscribe(grdMasterT2OnAfterScroll);
}
function grdMasterT2OnAfterScroll(d, a) {
  var f = a.rows[0];
  if (G_GRDMASTERT2.lastRow != null) {
    if (f == G_GRDMASTERT2.lastRow) {
      d.stopImmediatePropagation();
      return;
    }
    if (!grdDetailT2OnBeforePost(G_GRDDETAILT2.lastRow)) {
      d.stopImmediatePropagation();
      return;
    }
  }
  var c = G_GRDMASTERT2.data.getItem(f);
  var b = c.BRAND_CD + c.ITEM_CD + c.ITEM_STATE + c.ITEM_LOT;
  $NC.setInitGridVar(G_GRDDETAILT2);
  G_GRDDETAILT2.lastFilterVal = b;
  G_GRDDETAILT2.data.refresh();
  $NC.setGridSelectRow(G_GRDDETAILT2, 0);
  $NC.setGridDisplayRows("#grdMasterT2", a.rows[0] + 1);
}
function grdDetailT2OnGetColumns() {
  var a = [ ];
  $NC.setGridColumn(a, {
    id: "BOX_NO",
    field: "BOX_NO",
    name: "박스번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(a, {
    id: "ORG_CONFIRM_QTY",
    field: "ORG_CONFIRM_QTY",
    name: "기검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(a, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    editor: Slick.Editors.Number
  });
  $NC.setGridColumn(a, {
    id: "BOXING_YN",
    field: "BOXING_YN",
    name: "박스완료여부",
    minWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  return $NC.setGridColumnDefaultFormatter(a);
}
function grdDetailT2Initialize() {
  var a = {
    editable: true,
    autoEdit: true,
    specialRow: {
      compareFn: function(b, c) {
        if (c.BOXING_YN === "N") {
          return "specialrow4";
        }
      }
    }
  };
  $NC.setInitGridObject("#grdDetailT2", {
    columns: grdDetailT2OnGetColumns(),
    queryId: "LOM7030E.RS_T2_DETAIL",
    sortCol: "ITEM_CD",
    gridOptions: a
  });
  G_GRDDETAILT2.view.onSelectedRowsChanged.subscribe(grdDetailT2OnAfterScroll);
  G_GRDDETAILT2.view.onBeforeEditCell.subscribe(grdDetailT2OnBeforeEditCell);
  G_GRDDETAILT2.view.onCellChange.subscribe(grdDetailT2OnCellChange);
}
function grdDetailT2OnFilter(a) {
  var b = a.BRAND_CD + a.ITEM_CD + a.ITEM_STATE + a.ITEM_LOT;
  return G_GRDDETAILT2.lastFilterVal === b;
}
function grdDetailT2OnAfterScroll(b, a) {
  var c = a.rows[0];
  if (G_GRDDETAILT2.lastRow != null) {
    if (c == G_GRDDETAILT2.lastRow) {
      b.stopImmediatePropagation();
      return;
    }
    if (!grdDetailT2OnBeforePost(G_GRDDETAILT2.lastRow)) {
      b.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdDetailT2", c + 1);
}
function grdDetailT2OnCellChange(c, a) {
  var b = a.item;
  if (b.CRUD === "R") {
    b.CRUD = "U";
  }
  G_GRDDETAILT2.data.updateItem(b.id, b);
  G_GRDDETAILT2.lastRowModified = true;
}
function grdDetailT2OnBeforeEditCell(b, a) {
  if ($NC.G_VAR.userData.P_INSPECT_YN == "Y") {
    return false;
  }
  return true;
}
function grdDetailT2OnBeforePost(f) {
  if (!G_GRDDETAILT2.lastRowModified) {
    return true;
  }
  var c = G_GRDDETAILT2.data.getItem(f);
  if ($NC.isNull(c)) {
    return true;
  }
  if ($NC.isNull(c.CONFIRM_QTY)) {
    alert("검수수량을 입력하십시오.");
    $NC.setGridSelectRow(G_GRDDETAILT2, {
      selectRow: f,
      activeCell: G_GRDDETAILT2.view.getColumnIndex("CONFIRM_QTY"),
      editMode: true
    });
    return false;
  } else {
    var d = G_GRDMASTERT2.data.getItem(G_GRDMASTERT2.lastRow);
    var e = Number(d.ENTRY_QTY);
    var b = $NC.getGridSumVal(G_GRDDETAILT2, {
      searchKey: ["BRAND_CD", "ITEM_CD", "ITEM_STATE", "ITEM_LOT"],
      searchVal: [c.BRAND_CD, c.ITEM_CD, c.ITEM_STATE, c.ITEM_LOT],
      sumKey: "CONFIRM_QTY",
      isAllData: true
    });
    if (e < b) {
      c.CONFIRM_QTY = c.ORG_CONFIRM_QTY;
      var a = "[" + c.ITEM_NM + "]의 검수수량을 등록수량보다 많이 수정할 수 없습니다.";
      alert(a);
      G_GRDDETAILT2.data.updateItem(c.id, c);
      $NC.setGridSelectRow(G_GRDDETAILT2, {
        selectRow: f,
        activeCell: G_GRDDETAILT2.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return false;
    }
  }
  if (c.CRUD === "R") {
    c.CRUD = "U";
    G_GRDDETAILT2.data.updateItem(c.id, c);
  }
  return true;
}
function grdMasterT3OnGetColumns() {
  var a = [ ];
  $NC.setGridColumn(a, {
    id: "BOX_NO",
    field: "BOX_NO",
    name: "박스번호",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(a, {
    id: "BOXING_YN",
    field: "BOXING_YN",
    name: "박스완료여부",
    minWidth: 80,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  return $NC.setGridColumnDefaultFormatter(a);
}
function grdMasterT3Initialize() {
  var a = {
    specialRow: {
      compareFn: function(b, c) {
        if (c.BOXING_YN === "N") {
          return "specialrow4";
        }
      }
    }
  };
  $NC.setInitGridObject("#grdMasterT3", {
    columns: grdMasterT3OnGetColumns(),
    queryId: "LOM7030E.RS_T3_MASTER",
    sortCol: "BOX_NO",
    gridOptions: a
  });
  G_GRDMASTERT3.view.onSelectedRowsChanged.subscribe(grdMasterT3OnAfterScroll);
}
function grdMasterT3OnAfterScroll(b, a) {
  var c = a.rows[0];
  if (G_GRDMASTERT3.lastRow != null) {
    if (c == G_GRDMASTERT3.lastRow) {
      b.stopImmediatePropagation();
      return;
    }
    if (!grdDetailT3OnBeforePost(G_GRDDETAILT3.lastRow)) {
      b.stopImmediatePropagation();
      return;
    }
  }
  $NC.setInitGridVar(G_GRDDETAILT3);
  G_GRDDETAILT3.lastFilterVal = G_GRDMASTERT3.data.getItem(a.rows[0]).BOX_NO;
  G_GRDDETAILT3.data.refresh();
  $NC.setGridSelectRow(G_GRDDETAILT3, 0);
  $NC.setGridDisplayRows("#grdMasterT3", c + 1);
}
function grdDetailT3OnGetColumns() {
  var a = [ ];
  $NC.setGridColumn(a, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90
  });
  $NC.setGridColumn(a, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 150
  });
  $NC.setGridColumn(a, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(a, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "브랜드명",
    minWidth: 90
  });
  $NC.setGridColumn(a, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(a, {
    id: "INSPECT_QTY",
    field: "INSPECT_QTY",
    name: "총검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(a, {
    id: "OTHER_BOX_QTY",
    field: "OTHER_BOX_QTY",
    name: "타박스검수수량",
    minWidth: 100,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number
  });
  $NC.setGridColumn(a, {
    id: "CONFIRM_QTY",
    field: "CONFIRM_QTY",
    name: "검수수량",
    minWidth: 70,
    cssClass: "align-right",
    formatter: Slick.Formatters.Number,
    editor: Slick.Editors.Number
  });
  return $NC.setGridColumnDefaultFormatter(a);
}
function grdDetailT3Initialize() {
  var a = {
    editable: true,
    autoEdit: true
  };
  $NC.setInitGridObject("#grdDetailT3", {
    columns: grdDetailT3OnGetColumns(),
    queryId: "LOM7030E.RS_T3_DETAIL",
    sortCol: "ITEM_CD",
    gridOptions: a
  });
  G_GRDDETAILT3.view.onSelectedRowsChanged.subscribe(grdDetailT3OnAfterScroll);
  G_GRDDETAILT3.view.onBeforeEditCell.subscribe(grdDetailT3OnBeforeEditCell);
  G_GRDDETAILT3.view.onCellChange.subscribe(grdDetailT3OnCellChange);
}
function grdDetailT3OnFilter(a) {
  return G_GRDDETAILT3.lastFilterVal === a.BOX_NO;
}
function grdDetailT3OnAfterScroll(b, a) {
  var c = a.rows[0];
  if (G_GRDDETAILT3.lastRow != null) {
    if (c == G_GRDDETAILT3.lastRow) {
      b.stopImmediatePropagation();
      return;
    }
    if (!grdDetailT3OnBeforePost(G_GRDDETAILT3.lastRow)) {
      b.stopImmediatePropagation();
      return;
    }
  }
  $NC.setGridDisplayRows("#grdDetailT3", c + 1);
}
function grdDetailT3OnCellChange(c, a) {
  var b = a.item;
  if (b.CRUD === "R") {
    b.CRUD = "U";
  }
  G_GRDDETAILT3.data.updateItem(b.id, b);
  G_GRDDETAILT3.lastRowModified = true;
}
function grdDetailT3OnBeforeEditCell(b, a) {
  if ($NC.G_VAR.userData.P_INSPECT_YN == "Y") {
    return false;
  }
  return true;
}
function grdDetailT3OnBeforePost(e) {
  if (!G_GRDDETAILT3.lastRowModified) {
    return true;
  }
  var c = G_GRDDETAILT3.data.getItem(e);
  if ($NC.isNull(c)) {
    return true;
  }
  if ($NC.isNull(c.CONFIRM_QTY)) {
    alert("검수수량을 입력하십시오.");
    $NC.setGridSelectRow(G_GRDDETAILT3, {
      selectRow: e,
      activeCell: G_GRDDETAILT3.view.getColumnIndex("CONFIRM_QTY"),
      editMode: true
    });
    return false;
  } else {
    var d = Number(c.ENTRY_QTY);
    var b = $NC.getGridSumVal(G_GRDDETAILT3, {
      searchKey: ["BRAND_CD", "ITEM_CD", "ITEM_STATE", "ITEM_LOT"],
      searchVal: [c.BRAND_CD, c.ITEM_CD, c.ITEM_STATE, c.ITEM_LOT],
      sumKey: "CONFIRM_QTY",
      isAllData: true
    });
    if (d < b) {
      c.CONFIRM_QTY = c.ORG_CONFIRM_QTY;
      var a = c.ITEM_NM + "의 검수수량을 등록수량보다 많이 수정할 수 없습니다.";
      alert(a);
      G_GRDDETAILT3.data.updateItem(c.id, c);
      $NC.setGridSelectRow(G_GRDDETAILT3, {
        selectRow: e,
        activeCell: G_GRDDETAILT3.view.getColumnIndex("CONFIRM_QTY"),
        editMode: true
      });
      return false;
    }
  }
  if (c.CRUD === "R") {
    c.CRUD = "U";
  }
  G_GRDDETAILT3.data.updateItem(c.id, c);
  return true;
}
function onGetDetailT1(a) {
  G_GRDDETAILT1.lastFilterVal = null;
  var b = G_GRDMASTERT1.data.getItem(G_GRDMASTERT1.lastRow);
  if (b) {
    G_GRDDETAILT1.lastFilterVal = b.BOX_NO;
  }
  $NC.setInitGridData(G_GRDDETAILT1, a, grdDetailT1OnFilter);
  if (G_GRDDETAILT1.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAILT1, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetailT1", 0, 0);
  }
}
function onGetMasterT2(a) {
  $NC.setInitGridData(G_GRDMASTERT2, a);
  if (G_GRDMASTERT2.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTERT2.lastRow)) {
      $NC.setGridSelectRow(G_GRDMASTERT2, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERT2, G_GRDMASTERT2.lastRow);
    }
  } else {
    $NC.setGridDisplayRows("#grdMasterT2", 0, 0);
  }
}
function onGetDetailT2(a) {
  G_GRDDETAILT2.lastFilterVal = null;
  var c = G_GRDMASTERT2.data.getItem(G_GRDMASTERT2.lastRow);
  if (c) {
    var b = c.BRAND_CD + c.ITEM_CD + c.ITEM_STATE + c.ITEM_LOT;
    G_GRDDETAILT2.lastFilterVal = b;
  }
  $NC.setInitGridData(G_GRDDETAILT2, a, grdDetailT2OnFilter);
  if (G_GRDDETAILT2.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAILT2, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetailT2", 0, 0);
  }
}
function onGetMasterT3(a) {
  $NC.setInitGridData(G_GRDMASTERT3, a);
  if (G_GRDMASTERT3.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTERT3.lastRow)) {
      $NC.setGridSelectRow(G_GRDMASTERT3, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERT3, G_GRDMASTERT3.lastRow);
    }
  } else {
    $NC.setGridDisplayRows("#grdMasterT3", 0, 0);
  }
}
function onGetDetailT3(a) {
  G_GRDDETAILT3.lastFilterVal = null;
  var b = G_GRDMASTERT3.data.getItem(G_GRDMASTERT3.lastRow);
  if (b) {
    G_GRDDETAILT3.lastFilterVal = b.BOX_NO;
  }
  $NC.setInitGridData(G_GRDDETAILT3, a, grdDetailT3OnFilter);
  if (G_GRDDETAILT3.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAILT3, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetailT3", 0, 0);
  }
}
function onBtnBoxDelete() {
  if (G_GRDMASTERT1.data.getLength() == 0) {
    return;
  }
  if (!confirm("선택한 검수 박스내역 삭제하지겠습니까?")) {
    return;
  }
  var b = [ ];
  for (var c = 0; c < G_GRDMASTERT1.data.getLength(); c++) {
    var d = G_GRDMASTERT1.data.getItem(c);
    if (d.CHECK_YN == "Y") {
      var a = {
        P_CENTER_CD: d.CENTER_CD,
        P_BU_CD: d.BU_CD,
        P_OUTBOUND_DATE: d.OUTBOUND_DATE,
        P_OUTBOUND_NO: d.OUTBOUND_NO,
        P_BOX_NO: d.BOX_NO
      };
      b.push(a);
    }
  }
  if (b.length === 0) {
    alert("삭제할 데이터를 선택하십시오.");
    return;
  }
  $NC.serviceCall("/LOM7030E/callScanBoxDelete.do", {
    P_DS_MASTER: $NC.toJson(b),
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSave);
}
function onBtnBoxMerge() {
  if (G_GRDMASTERT1.data.getLength() == 0) {
    return;
  }
  var d = $NC.getGridSearchRows(G_GRDMASTERT1, {
    searchKey: "CHECK_YN",
    searchVal: "Y"
  });
  if (d.length != 2) {
    alert("박스병합할 2개의 박스번호를 선택하십시오.");
    return;
  }
  var g = G_GRDMASTERT1.data.getItem(d[0]);
  var e = G_GRDMASTERT1.data.getItem(d[1]);
  if (g.BOXING_YN == "N" || e.BOXING_YN == "N") {
    alert("박스완료되지 않은 박스는 박스병합 처리할 수 없습니다.");
    return;
  }
  var h = $NC.G_VAR.userData.P_CENTER_CD;
  var f = $NC.G_VAR.userData.P_BU_CD;
  var c = $NC.G_VAR.userData.P_OUTBOUND_DATE;
  var b = $NC.G_VAR.userData.P_OUTBOUND_NO;
  var a;
  var i;
  if (g.BOX_NO > e.BOX_NO) {
    i = e.BOX_NO;
    a = g.BOX_NO;
  } else {
    i = g.BOX_NO;
    a = e.BOX_NO;
  }
  if (!confirm("[" + a + "]번 박스를 [" + i + "]번 박스로 병합하시겠습니까?")) {
    return;
  }
  $NC.serviceCall("/LOM7030E/callScanBoxMerge.do", {
    P_QUERY_PARAMS: $NC.getParams({
      P_CENTER_CD: h,
      P_BU_CD: f,
      P_OUTBOUND_DATE: c,
      P_OUTBOUND_NO: b,
      P_BOX_NO_TO: i,
      P_BOX_NO_FROM: a,
      P_USER_ID: $NC.G_USERINFO.USER_ID
    })
  }, onSave);
}
function onBtnPrintInvoice() {
  var e = $NC.G_VAR.userData.P_CENTER_CD;
  var d = $NC.G_VAR.userData.P_BU_CD;
  var b = $NC.G_VAR.userData.P_OUTBOUND_DATE;
  var a = $NC.G_VAR.userData.P_OUTBOUND_NO;
  var h = $NC.G_VAR.userData.P_CARRIER_CD;
  var g = $NC.G_VAR.userData.P_ITEM_CD;
  var f = [ ];
  var i = G_GRDMASTERT1.data.getLength();
  for (var k = 0; k < i; k++) {
    var c = G_GRDMASTERT1.data.getItem(k);
    if (c.CHECK_YN == "Y") {
      f.push(c.BOX_NO);
    }
  }
  if (f.length == 0) {
    alert("출력할 데이터를 선택하십시오.");
    return;
  }
  if (h == "0020") {
    reportDoc = "lo/LABEL_LOM09_1";
    queryId = "WR.RS_LABEL_LOM03_1";
  } else {
    reportDoc = "lo/LABEL_LOM09_1";
    queryId = "WR.RS_LABEL_LOM02_1";
  }
  var j = {
    P_CENTER_CD: e,
    P_BU_CD: d,
    P_OUTBOUND_DATE: b,
    P_OUTBOUND_NO: a,
    P_ITEM_CD: g,
    P_PRINT_YN: "(재)"
  };
  $NC.G_MAIN.showPrintPreview({
    reportDoc: reportDoc,
    queryId: queryId,
    queryParams: j,
    checkedValue: f.toString(),
    internalQueryYn: "N"
  });
}
function onBtnPrintReceipt() {
  var f = $NC.G_VAR.userData.P_CENTER_CD;
  var d = $NC.G_VAR.userData.P_BU_CD;
  var a = $NC.G_VAR.userData.P_OUTBOUND_DATE;
  var h = $NC.G_VAR.userData.P_OUTBOUND_NO;
  var c = $NC.G_VAR.userData.P_POLICY_LO450;
  var b = "lo/RECEIPT_LOM01";
  var g = "WR.RS_RECEIPT_LOM01";
  var e = {
    P_CENTER_CD: f,
    P_BU_CD: d,
    P_OUTBOUND_DATE: a,
    P_OUTBOUND_NO: h,
    P_POLICY_LO450: c
  };
  $NC.G_MAIN.showPrintPreview({
    reportDoc: b,
    queryId: g,
    queryParams: e
  });
}
function onBtnPrintCard_Msg() {
  var e = $NC.G_VAR.userData.P_CENTER_CD;
  var c = $NC.G_VAR.userData.P_BU_CD;
  var a = $NC.G_VAR.userData.P_OUTBOUND_DATE;
  var h = $NC.G_VAR.userData.P_OUTBOUND_NO;
  var f = G_GRDDETAILT1.data.getItem(0);
  var b = "lo/CARD_LOM" + f.BRAND_CD;
  var g = "WR.RS_CARD_LOM01";
  var d = {
    P_CENTER_CD: e,
    P_BU_CD: c,
    P_OUTBOUND_DATE: a,
    P_OUTBOUND_NO: h
  };
  $NC.G_MAIN.showPrintPreview({
    reportDoc: b,
    queryId: g,
    queryParams: d
  });
}
function onSave(a) {
  _Inquiry();
}