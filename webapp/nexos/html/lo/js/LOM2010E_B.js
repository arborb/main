function onProcessPreB() {

  
  var rowCount = G_GRDMASTERB.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }

  var result = confirm("출고등록 취소 처리하시겠습니까?");
  if (!result) {
    return;
  }

  if (G_GRDMASTERB.view.getEditorLock().isActive()) {
    G_GRDMASTERB.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERB.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 출고등록 상태인 전표만 대상
      if (rowData.OUTBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
          P_OUTBOUND_NO: rowData.OUTBOUND_NO
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("출고등록 취소 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 출고등록 취소 처리 가능한 데이터가 없습니다.");
    return;
  }

  $NC.serviceCall("/LOM2010E/callLOProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "B",
    P_DIRECTION: "BW",
    P_OUTBOUND_BATCH: "",
    P_OUTBOUND_BATCH_NM: "",
    P_DELIVERY_BATCH_CD: "",
    P_DELIVERY_BATCH_NM: "",
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveB, onSaveErrorB, 2);
}

function onProcessNxtB() {

  var rowCount = G_GRDMASTERB.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }
  
  var todayDate = $NC.G_USERINFO.LOGIN_DATE;
  var OUTBOUND_DATE_B = $NC.getValue("#dtpOutbound_DateB");
  
  var result;
  var resultCheckDate;
  
  result = confirm("출고등록 처리하시겠습니까?");
  if(!result){
    return;
  } else {
    if(todayDate !== OUTBOUND_DATE_B){
      resultCheckDate = confirm("등록 출고일자가 오늘날자와 다릅니다.\n\n 그래도 출고등록 처리하시겠습니까?");
      if(!resultCheckDate){
        return;
      }
    }
  }
  /*
  if(todayDate !== OUTBOUND_DATE_B){
    result = confirm("등록 출고일자가 오늘날자와 다릅니다.\n\n출고등록 처리하시겠습니까?");
    if (!result) {
      return;
    }
  } else {
    result = confirm("출고등록 처리하시겠습니까?");
    if (!result) {
      return;
    }
  }
  */

  if (G_GRDMASTERB.view.getEditorLock().isActive()) {
    G_GRDMASTERB.view.getEditorLock().commitCurrentEdit();
  }

  var processDS = [ ];
  var chkCnt = 0;
  for ( var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERB.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      chkCnt++;
      // 출고예정 상태인 전표만 대상 "10"
      if (rowData.OUTBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.ORDER_DATE,
          P_OUTBOUND_NO: rowData.ORDER_NO,
          P_OUTBOUND_DATE_B: $NC.getValue("#dtpOutbound_DateB")
        };
        processDS.push(processData);
      }
    }
  }
  if (chkCnt == 0) {
    alert("출고등록 처리할 데이터를 선택하십시오.");
    return;
  }
  if (processDS.length == 0) {
    alert("선택한 데이터 중 출고등록 처리 가능한 데이터가 없습니다.");
    return;
  }

  var DELIVERY_BATCH_CD = $NC.getValue("#cboDelivery_BatchB");
  var DELIVERY_BATCH_NM = $NC.getValue("#edtBatch_NmB");

  $NC.serviceCall("/LOM2010E/callLOProcessing.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "B1",
    P_DIRECTION: "FW",
    P_OUTBOUND_BATCH: "",
    P_OUTBOUND_BATCH_NM: "",
    P_DELIVERY_BATCH_CD: DELIVERY_BATCH_CD,
    P_DELIVERY_BATCH_NM: DELIVERY_BATCH_NM,
    P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
    P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  }, onSaveB, onSaveErrorB, 2);
}

function callInvnoProcLine() {

  var rowCount = G_GRDMASTERB.data.getLength();
  if (rowCount === 0) {
    alert("조회 후 처리하십시오.");
    return;
  }
  
  var result = confirm("선택하신 전표의 배송유형을 재적용 하시겠습니까?");
  if (!result) {
    return;
  }
  var DIRECTION_INVNO = $NC.getValue("#cboQDelivery_TypeB");

  var processDS = [ ];
  var chkCnt = 0;
  for (var row = 0; row < rowCount; row++) {
    var rowData = G_GRDMASTERB.data.getItem(row);
    if (rowData.CHECK_YN == "Y") {
      // 출고등록 상태인 전표만 대상
        chkCnt++;
        var processData = {
          P_CENTER_CD: rowData.CENTER_CD,
          P_BU_CD: rowData.BU_CD,
          P_OUTBOUND_DATE: rowData.ORDER_DATE,
          P_OUTBOUND_NO: rowData.ORDER_NO,
          P_DIRECTION_INVNO: DIRECTION_INVNO
        };
        processDS.push(processData);
    }
  }
  
  if (chkCnt == 0) {
    alert("배송유형 재적용처리할 등록데이터를 선택하십시오.");
    return;
  }

  $NC.serviceCall("/LOM2010E/callInvProcLine.do", {
    P_DS_MASTER: $NC.getParams(processDS),
    P_PROCESS_CD: "B"
  }, onSaveB, onSaveErrorB, 2);
}

function grdMasterBOnGetColumns() {

  var processFormatter = function(row, cell, value, columnDef, dataContext) {
    if (dataContext.OUTBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
      return "<span class='ui-icon-prior'>&nbsp;</span>";
    }
    return "<span class='ui-icon-next'>&nbsp;</span>";
  };

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_STATE_P",
    field: "OUTBOUND_STATE",
    name: "P",
    minWidth: 30,
    maxWidth: 30,
    sortable: false,
    formatter: processFormatter
  }, false);
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_STATE_S",
    field: "OUTBOUND_STATE",
    name: "S",
    minWidth: 30,
    maxWidth: 30,
    formatter: grdStateFormatter
  }, false);
  $NC.setGridColumn(columns, {
    id: "CHECK_YN",
    field: "CHECK_YN",
    minWidth: 40,
    maxWidth: 40,
    cssClass: "align-center",
    sortable: false,
    formatter: Slick.Formatters.CheckBox,
    editor: Slick.Editors.CheckBox,
    editorOptions: {
      valueChecked: "Y",
      valueUnChecked: "N"
    }
  }, false);
  $NC.setGridColumn(columns, {
    id: "DELIVERY_TYPE_D",
    field: "DELIVERY_TYPE_D",
    name: "배송유형",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_DATE",
    field: "OUTBOUND_DATE",
    name: "출고일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_NO",
    field: "OUTBOUND_NO",
    name: "출고번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "OUTBOUND_STATE_D",
    field: "OUTBOUND_STATE_D",
    name: "진행상태",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "INOUT_NM",
    field: "INOUT_NM",
    name: "출고구분",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_NM",
    field: "ORDERER_NM",
    name: "주문자명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_NM",
    field: "SHIPPER_NM",
    name: "수령자명",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DIV_D",
    field: "ORDER_DIV_D",
    name: "주문구분",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "TOT_ENTRY_QTY",
    field: "TOT_ENTRY_QTY",
    name: "총수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_DATE",
    field: "ORDER_DATE",
    name: "예정일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_NO",
    field: "ORDER_NO",
    name: "예정번호",
    minWidth: 70,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATE",
    field: "BU_DATE",
    name: "전표일자",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_DATETIME",
    field: "BU_DATETIME",
    name: "전표일시",
    minWidth: 150,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BU_NO",
    field: "BU_NO",
    name: "전표번호",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BU_KEY",
    field: "BU_KEY",
    name: "전표ID",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "HOLD_YN",
    field: "HOLD_YN",
    name: "보류여부",
    minWidth: 60,
    cssClass: "align-center",
    formatter: Slick.Formatters.CheckBox
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD_D",
    field: "BRAND_CD_D",
    name: "판매사코드",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM_D",
    field: "BRAND_NM_D",
    name: "판매사명",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "MALL_CD_D",
    field: "MALL_CD_D",
    name: "MALL명",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "INORDER_TYPE_D",
    field: "INORDER_TYPE_D",
    name: "매입형태",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DELIVERY_TYPE2_D",
    field: "DELIVERY_TYPE2_D",
    name: "배송지역구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_TYPE_D",
    field: "SHIP_TYPE_D",
    name: "운송구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_PRICE_TYPE_D",
    field: "SHIP_PRICE_TYPE_D",
    name: "운송비구분",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "SHIP_PRICE",
    field: "SHIP_PRICE",
    name: "운송비",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "MALL_MSG",
    field: "MALL_MSG",
    name: "온라인몰메시지",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_TEL",
    field: "SHIPPER_TEL",
    name: "전화번호",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_HP",
    field: "SHIPPER_HP",
    name: "휴대폰번호",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ZIP_CD",
    field: "SHIPPER_ZIP_CD",
    name: "우편번호",
    minWidth: 60,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "SHIPPER_ADDR",
    field: "SHIPPER_ADDR",
    name: "주소",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "ORDERER_MSG",
    field: "ORDERER_MSG",
    name: "배송메시지",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "PLANED_DATETIME",
    field: "PLANED_DATETIME",
    name: "납품예정일시",
    minWidth: 130,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "이벤트여부",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_USER_ID",
    field: "ENTRY_USER_ID",
    name: "전표등록ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_DATETIME",
    field: "ENTRY_DATETIME",
    name: "최종등록일시",
    minWidth: 150
  });

  return $NC.setGridColumnDefaultFormatter(columns);

} 

/**
 * 출고등록 마스터 그리드 초기화
 */
function grdMasterBInitialize() {

  var options = {
    frozenColumn: 3,
    specialRow: {
      compareFn: function(specialRow, rowData) {
        if (rowData.BACKORDER_YN == "Y") {
          return "specialrow4";
        }
        if (rowData.REMARK1 == "Y") {
          return "specialrow1";
        } 
        if (rowData.POST_CHK == "X") {
          return "specialrow6";
        }
        if (rowData.REMARK1 == "Z") {
          return "specialrow7";
        }
        
      }
    }
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMasterB", {
    columns: grdMasterBOnGetColumns(),
    queryId: "LOM2010E.RS_T1A_MASTER",
    sortCol: "ORDER_DATE",
    gridOptions: options,
    canDblClick: true
  });

  G_GRDMASTERB.view.onSelectedRowsChanged.subscribe(grdMasterBOnAfterScroll);
  G_GRDMASTERB.view.onHeaderClick.subscribe(grdMasterBOnHeaderClick);
  G_GRDMASTERB.view.onClick.subscribe(grdMasterBOnClick);
  // Grid 더블클릭 이벤트
  G_GRDMASTERB.view.onDblClick.subscribe(grdMasterBOnDblClick);

  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERB, "CHECK_YN");
}

function grdMasterBOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTERB.lastRow != null) {
    if (row == G_GRDMASTERB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDDETAILB);
  onGetDetailB({
    data: null
  });

  var rowData = G_GRDMASTERB.data.getItem(row);
  G_GRDDETAILB.queryParams = $NC.getParams({
    P_CENTER_CD: rowData.CENTER_CD,
    P_BU_CD: rowData.BU_CD,
    P_ORDER_DATE: rowData.ORDER_DATE,
    P_ORDER_NO: rowData.ORDER_NO,
    P_OUTBOUND_DATE: rowData.OUTBOUND_DATE,
    P_OUTBOUND_NO: rowData.OUTBOUND_NO
  });

  // 데이터 조회
  $NC.serviceCall("/LOM2010E/getDataSet.do", $NC.getGridParams(G_GRDDETAILB), onGetDetailB);

  // 디테일 그리드 컬럼타이틀 변경
  if (rowData.OUTBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL) {
    G_GRDDETAILB.view.updateColumnHeader("ENTRY_BOX", "등록BOX");
    G_GRDDETAILB.view.updateColumnHeader("ENTRY_EA", "등록EA");
    G_GRDDETAILB.view.updateColumnHeader("ENTRY_WEIGHT", "등록중량");
  } else {
    G_GRDDETAILB.view.updateColumnHeader("ENTRY_BOX", "예정BOX");
    G_GRDDETAILB.view.updateColumnHeader("ENTRY_EA", "예정EA");
    G_GRDDETAILB.view.updateColumnHeader("ENTRY_WEIGHT", "예정중량");
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdMasterB", row + 1);
}

function grdMasterBOnHeaderClick(e, args) {

  if (args.column.id == "CHECK_YN") {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTERB.data.getLength() == 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      if (G_GRDMASTERB.view.getEditorLock().isActive() && !G_GRDMASTERB.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowCount = G_GRDMASTERB.data.getLength();
      var rowData;
      G_GRDMASTERB.data.beginUpdate();
      for ( var row = 0; row < rowCount; row++) {
        rowData = G_GRDMASTERB.data.getItem(row);

        if (rowData.CHECK_YN !== checkVal) {
          rowData.CHECK_YN = checkVal;

          if (rowData.CRUD === "R") {
            rowData.CRUD = "U";
          }

          G_GRDMASTERB.data.updateItem(rowData.id, rowData);
        }
      }
      G_GRDMASTERB.data.endUpdate();

      e.stopPropagation();
      e.stopImmediatePropagation();
    }
    return;
  }
}

function grdMasterBOnClick(e, args) {

  if (args.cell === G_GRDMASTERB.view.getColumnIndex("CHECK_YN")) {

    if ($(e.target).is(":checkbox")) {

      if (G_GRDMASTERB.view.getEditorLock().isActive() && !G_GRDMASTERB.view.getEditorLock().commitCurrentEdit()) {
        e.preventDefault();
        e.stopImmediatePropagation();
        return;
      }

      var checkVal = $(e.target).is(":checked") ? "Y" : "N";
      var rowData = G_GRDMASTERB.data.getItem(args.row);
      if (rowData.CHECK_YN !== checkVal) {

        if (rowData.CRUD === "R") {
          rowData.CRUD = "U";
        }

        G_GRDMASTERB.data.updateItem(rowData.id, rowData);
      }
      // e.stopPropagation();
      // e.stopImmediatePropagation();
    }
    return;
  }
}

function grdMasterBOnDblClick(e, args) {
  var masterRowData = G_GRDMASTERB.data.getItem(args.row);

  var permission = $NC.getProgramPermission();
  // 저장
  if (!permission.canSave) {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  if (masterRowData) {
/*
    if (masterRowData.HOLD_YN === "Y") {
      alert("보류상태인 전표는 팝업화면에서 작업하실 수 없습니다.");
      return;
    }
    
    if (masterRowData.ENTRY_USER_ID === "WMS_JOB" || masterRowData.ENTRY_USER_ID === "INTERFACE") {
      alert("인터페이스로 수신된 예정전표는 수정하실 수 없습니다.");
      return;
    }
*/
    var PROCESS_CD, OUTBOUND_DATE, OUTBOUND_NO;
    // 예정일 경우
    if (masterRowData.OUTBOUND_STATE === $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM) {
      PROCESS_CD = "A";
      OUTBOUND_DATE = masterRowData.ORDER_DATE;
      OUTBOUND_NO = masterRowData.ORDER_NO;
    } else {
      // 등록일 경우
      PROCESS_CD = "B";
      OUTBOUND_DATE = masterRowData.OUTBOUND_DATE;
      OUTBOUND_NO = masterRowData.OUTBOUND_NO;
    }

    getOutboundState({
      P_CENTER_CD: masterRowData.CENTER_CD,
      P_BU_CD: masterRowData.BU_CD,
      P_OUTBOUND_DATE: OUTBOUND_DATE,
      P_OUTBOUND_NO: OUTBOUND_NO,
      P_LINE_NO: "",
      P_PROCESS_CD: PROCESS_CD, // 프로세스코드([A]예정, [B]등록)
      P_STATE_DIV: "1" // 상태구분([1]MIN, [2]MAX)
    }, function(ajaxData) {

      var resultData = $NC.toArray(ajaxData);
      if (!$NC.isNull(resultData)) {
        if (resultData.O_MSG === "OK") {
          if (masterRowData.OUTBOUND_STATE !== resultData.O_OUTBOUND_STATE) {
            alert("[진행상태 : " + resultData.O_OUTBOUND_STATE + "] 데이터가 변경되었습니다.\n다시 조회 후 데이터를 확인하십시오.");
            return;
          }
        } else {
          alert(resultData.O_MSG);
          return;
        }
      } else {
        alert("출고진행상태를 확인하지 못했습니다.\n다시 처리하십시오.");
        return;
      }

      var CENTER_CD = $NC.getValue("#cboQCenter_Cd");
      var CENTER_CD_F = $("#cboQCenter_Cd option:selected").text();
      var BU_CD = $NC.getValue("#edtQBu_Cd");
      var BU_NM = $NC.getValue("#edtQBu_Nm");
      var CUST_CD = $NC.getValue("#edtQCust_Cd");

      $NC.G_MAIN.showProgramSubPopup({
        PROGRAM_ID: "LOM2011P",
        PROGRAM_NM: "출고등록/수정",
        url: "lo/LOM2011P.html",
        width: 1024,
        // height: 600,
        height: 750,
        userData: {
          P_PROCESS_CD: PROCESS_CD,
          P_CENTER_CD: CENTER_CD,
          P_CENTER_CD_F: CENTER_CD_F,
          P_BU_CD: BU_CD,
          P_BU_NM: BU_NM,
          P_CUST_CD: CUST_CD,
          P_POLICY_LO190: $NC.G_VAR.policyVal.LO190,
          P_POLICY_LO210: $NC.G_VAR.policyVal.LO210,
          P_POLICY_LO221: $NC.G_VAR.policyVal.LO221,
          P_POLICY_LO250: $NC.G_VAR.policyVal.LO250,
          P_PROCESS_STATE_BW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL,
          P_PROCESS_STATE_FW: $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM,
          P_MASTER_DS: masterRowData,
          P_DETAIL_DS: G_GRDDETAILB.data.getItems()
        },
        onOk: function() {
          setDeliveryBatchCombo("B"); // 배송차수 콤보 재생성
          _Inquiry();
        }
      });
    });
  }
}

function grdDetailBOnGetColumns(policyLO250) {

  if ($NC.isNull(policyLO250)) {
    policyLO250 = "1";
  }

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "LINE_NO",
    field: "LINE_NO",
    name: "순번",
    minWidth: 60,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "위탁사",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "위탁사명",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_ID",
    field: "DEAL_ID",
    name: "딜ID",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "DEAL_NM",
    field: "DEAL_NM",
    name: "딜명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_ID",
    field: "OPTION_ID",
    name: "옵션ID",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_VALUE",
    field: "OPTION_VALUE",
    name: "옵션명",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_CD",
    field: "ITEM_CD",
    name: "상품코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_NM",
    field: "ITEM_NM",
    name: "상품명",
    minWidth: 180
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_SPEC",
    field: "ITEM_SPEC",
    name: "규격",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_STATE_F",
    field: "ITEM_STATE_F",
    name: "상태",
    minWidth: 80,
    cssClass: "align-center"
  });
  $NC.setGridColumn(columns, {
    id: "QTY_IN_BOX",
    field: "QTY_IN_BOX",
    name: "입수",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_QTY",
    field: "OPTION_QTY",
    name: "옵션수량",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ORDER_QTY",
    field: "ORDER_QTY",
    name: "예정수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_QTY",
    field: "ENTRY_QTY",
    name: "등록수량",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_BOX",
    field: "ENTRY_BOX",
    name: "등록BOX",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ENTRY_EA",
    field: "ENTRY_EA",
    name: "등록EA",
    minWidth: 70,
    cssClass: "align-right"
  });
  if (policyLO250 == "2") {
    $NC.setGridColumn(columns, {
      id: "VALID_DATE",
      field: "VALID_DATE",
      name: "유통기한",
      minWidth: 100,
      cssClass: "align-center"
    });
    $NC.setGridColumn(columns, {
      id: "BATCH_NO",
      field: "BATCH_NO",
      name: "제조배치번호",
      minWidth: 100
    });
  }
  $NC.setGridColumn(columns, {
    id: "SUPPLY_PRICE",
    field: "SUPPLY_PRICE",
    name: "공급단가",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_PRICE",
    field: "DC_PRICE",
    name: "할인단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "APPLY_PRICE",
    field: "APPLY_PRICE",
    name: "적용단가",
    minWidth: 80,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "SUPPLY_AMT",
    field: "SUPPLY_AMT",
    name: "공급금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "VAT_AMT",
    field: "VAT_AMT",
    name: "부가세액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "DC_AMT",
    field: "DC_AMT",
    name: "할인금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "TOTAL_AMT",
    field: "TOTAL_AMT",
    name: "합계금액",
    minWidth: 70,
    cssClass: "align-right"
  });
  $NC.setGridColumn(columns, {
    id: "ITEM_ORDER_DIV_F",
    field: "ITEM_ORDER_DIV_F",
    name: "상품주문유형",
    minWidth: 100
  });
  $NC.setGridColumn(columns, {
    id: "BU_LINE_NO",
    field: "BU_LINE_NO",
    name: "전표순번",
    minWidth: 80
  });
  $NC.setGridColumn(columns, {
    id: "REMARK1",
    field: "REMARK1",
    name: "비고",
    minWidth: 200
  });
  $NC.setGridColumn(columns, {
    id: "SHORTAGE_DIV_F",
    field: "SHORTAGE_DIV_F",
    name: "미출고사유",
    minWidth: 120
  });
  $NC.setGridColumn(columns, {
    id: "SHORTAGE_COMMENT",
    field: "SHORTAGE_COMMENT",
    name: "미출고사유내역",
    minWidth: 150
  });
  $NC.setGridColumn(columns, {
    id: "OPTION_MSG",
    field: "OPTION_MSG",
    name: "옵션메시지",
    minWidth: 150
  });
  return $NC.setGridColumnDefaultFormatter(columns);

}

function grdDetailBInitialize() {

  var options = {
    frozenColumn: 3
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetailB", {
    columns: grdDetailBOnGetColumns(),
    queryId: "LOM2010E.RS_T1A_DETAIL",
    sortCol: "LINE_NO",
    gridOptions: options
  });

  G_GRDDETAILB.view.onSelectedRowsChanged.subscribe(grdDetailBOnAfterScroll);
}

function grdDetailBOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAILB.lastRow != null) {
    if (row == G_GRDDETAILB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetailB", row + 1);
}

function onGetMasterB(ajaxData) {

  $NC.setInitGridData(G_GRDMASTERB, ajaxData);
  // 체크 컬럼 헤터 초기화
  $NC.setGridColumnHeaderCheckBox(G_GRDMASTERB, "CHECK_YN");
  if (G_GRDMASTERB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTERB.lastRow)) {
      $NC.setGridSelectRow(G_GRDMASTERB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTERB, G_GRDMASTERB.lastRow);
    }
  } else {
    $NC.setGridDisplayRows("#grdMasterB", 0, 0);

    // 디테일 초기화
    $NC.setInitGridVar(G_GRDDETAILB);
    onGetDetailB({
      data: null
    });
  }

  // 전표 건수 정보 업데이트
  setMasterSummaryInfo();

  // 공통 버튼 활성화
  setTopButtons();
}

function onGetDetailB(ajaxData) {

  $NC.setInitGridData(G_GRDDETAILB, ajaxData);

  if (G_GRDDETAILB.data.getLength() > 0) {
    $NC.setGridSelectRow(G_GRDDETAILB, 0);
  } else {
    $NC.setGridDisplayRows("#grdDetailB", 0, 0);
  }
}

function onGetInvnoLineSP(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  
  if (!$NC.isNull(resultData)) {
    /*
    if (resultData.O_MSG === "OK") {
      if (resultData.O_ERRMSG !== "OK") {
        alert(resultData.O_ERRMSG);
      }
    }
    */
  }

  setTimeout(function() {
    var lastRowData = G_GRDMASTERB.data.getItem(G_GRDMASTERB.lastRow);
    /*
    if (!$NC.isNull(resultData)) {
      if (resultData.O_MSG === "OK") {
        if (resultData.O_ERRMSG !== "OK") {
          alert(resultData.O_ERRMSG);
        }
      }
    }
    */
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
    _Inquiry();
    G_GRDMASTERB.lastKeyVal = lastRowData.ORDER_NO;
  }, 300);
}

function onSaveB(ajaxData) {

  var resultData = $NC.toArray(ajaxData);
  if (!$NC.isNull(resultData)) {
    if (resultData.RESULT_DATA !== "OK") {
      alert(resultData.RESULT_DATA);
    }
  }

  $NC.setValue("#edtBatch_NmB");
  // 배송차수 콤보 재생성
  setDeliveryBatchCombo("B");
  setDeliveryBatchCombo("BT");

  var lastKeyVal = $NC.getGridLastKeyVal(G_GRDMASTERB, {
    selectKey: ["ORDER_DATE", "ORDER_NO", "OUTBOUND_DATE", "OUTBOUND_NO"]
  });
  _Inquiry();
  G_GRDMASTERB.lastKeyVal = lastKeyVal;

}

function onSaveErrorB(ajaxData) {

  $NC.onError(ajaxData);
  setMasterSummaryInfo();
}
