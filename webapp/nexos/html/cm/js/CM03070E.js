/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  // $NC.setGlobalVar({});

  // 그리드 초기화
  grdMasterInitialize();
  grdDetailInitialize();
  grdSubInitialize();

  $("#btnBICustUpload").click(onBtnBICustUpload);
  $("#btnBICustRemove").click(onBtnBICustRemove);

  $("#btnBIBuUpload").click(onBtnBIBuUpload);
  $("#btnBIBuRemove").click(onBtnBIBuRemove);

  $("#btnBIBrandUpload").click(onBtnBIBrandUpload);
  $("#btnBIBrandRemove").click(onBtnBIBrandRemove);

  $NC.setEnable("#btnBICustUpload", false);
  $NC.setEnable("#btnBICustRemove", false);
  $NC.setEnable("#btnBIBuUpload", false);
  $NC.setEnable("#btnBIBuRemove", false);
  $NC.setEnable("#btnBIBrandUpload", false);
  $NC.setEnable("#btnBIBrandRemove", false);
}

function _SetResizeOffset() {

  $NC.G_OFFSET.biImageViewHeight = 255;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1 * 3 - $NC.G_LAYOUT.margin1 * 2;
  var clientHeight = parent.height() - 2 * $NC.G_LAYOUT.border1;
  var biImageHeight = clientHeight - $NC.G_OFFSET.biImageViewHeight - $NC.G_LAYOUT.header;
  var viewWidth = Math.ceil(clientWidth / 3);

  $NC.resizeContainer("#divMasterView", viewWidth, clientHeight);
  $NC.resizeGrid("#grdMaster", viewWidth, biImageHeight);

  $NC.resizeContainer("#divDetailView", viewWidth, clientHeight);
  $NC.resizeGrid("#grdDetail", viewWidth, biImageHeight);

  clientWidth -= viewWidth * 2;
  $NC.resizeContainer("#divSubView", clientWidth, clientHeight);
  $NC.resizeGrid("#grdSub", clientWidth, biImageHeight);
}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  $NC.setEnable("#btnBICustUpload", false);
  $NC.setEnable("#btnBICustRemove", false);
  $NC.setEnable("#btnBIBuUpload", false);
  $NC.setEnable("#btnBIBuRemove", false);
  $NC.setEnable("#btnBIBrandUpload", false);
  $NC.setEnable("#btnBIBrandRemove", false);

  // 조회시 전역 변수 값 초기화
  $NC.setInitGridVar(G_GRDMASTER);

  // 파라메터 세팅
  G_GRDMASTER.queryParams = $NC.getParams({
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });

  // 데이터 조회
  $NC.serviceCall("/CM03070E/getDataSet.do", $NC.getGridParams(G_GRDMASTER), onGetMaster);
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

}

function onChangingCondition() {

}

/**
 * 조회조건이 변경될 때 호출
 */
function _OnConditionChange(e, view, val) {

}

function grdMasterOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "CUST_CD",
    field: "CUST_CD",
    name: "위탁사코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "CUST_NM",
    field: "CUST_NM",
    name: "위탁사명",
    minWidth: 180
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdMasterInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdMaster", {
    columns: grdMasterOnGetColumns(),
    queryId: "CM03070E.RS_MASTER",
    sortCol: "DEPART_CD",
    gridOptions: options
  });
  G_GRDMASTER.view.onSelectedRowsChanged.subscribe(grdMasterOnAfterScroll);
}

function grdMasterOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDMASTER.lastRow != null) {
    if (row == G_GRDMASTER.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  $NC.setInitGridVar(G_GRDDETAIL);
  $NC.setInitGridVar(G_GRDSUB);

  var rowData = G_GRDMASTER.data.getItem(row);

  G_GRDDETAIL.queryParams = $NC.getParams({
    P_CUST_CD: rowData.CUST_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });

  $NC.serviceCall("/CM03070E/getDataSet.do", $NC.getGridParams(G_GRDDETAIL), onGetDetail);

  G_GRDSUB.queryParams = $NC.getParams({
    P_CUST_CD: rowData.CUST_CD,
    P_USER_ID: $NC.G_USERINFO.USER_ID
  });

  $NC.serviceCall("/CM03070E/getDataSet.do", $NC.getGridParams(G_GRDSUB), onGetSub);

  onGetBIImage("#imgBICust", rowData.CUST_CD);
  $NC.setGridDisplayRows("#grdMaster", row + 1);
}

function grdDetailOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BU_CD",
    field: "BU_CD",
    name: "사업부코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BU_NM",
    field: "BU_NM",
    name: "사업부명",
    minWidth: 180
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdDetailInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdDetail", {
    columns: grdDetailOnGetColumns(),
    queryId: "CM03070E.RS_DETAIL",
    sortCol: "BU_CD",
    gridOptions: options
  });
  G_GRDDETAIL.view.onSelectedRowsChanged.subscribe(grdDetailOnAfterScroll);
}

function grdDetailOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDDETAIL.lastRow != null) {
    if (row == G_GRDDETAIL.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDDETAIL.data.getItem(row);
  onGetBIImage("#imgBIBu", rowData.BU_CD);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdDetail", row + 1);
}

function grdSubOnGetColumns() {

  var columns = [ ];
  $NC.setGridColumn(columns, {
    id: "BRAND_CD",
    field: "BRAND_CD",
    name: "판매사코드",
    minWidth: 90
  });
  $NC.setGridColumn(columns, {
    id: "BRAND_NM",
    field: "BRAND_NM",
    name: "판매사명",
    minWidth: 180
  });

  return $NC.setGridColumnDefaultFormatter(columns);
}

function grdSubInitialize() {

  var options = {
    frozenColumn: 0
  };

  // Grid Object, DataView 생성 및 초기화
  $NC.setInitGridObject("#grdSub", {
    columns: grdSubOnGetColumns(),
    queryId: "CM03070E.RS_SUB",
    sortCol: "BRAND_CD",
    gridOptions: options
  });
  G_GRDSUB.view.onSelectedRowsChanged.subscribe(grdSubOnAfterScroll);

}

function grdSubOnAfterScroll(e, args) {

  var row = args.rows[0];
  if (G_GRDSUB.lastRow != null) {
    if (row == G_GRDSUB.lastRow) {
      e.stopImmediatePropagation();
      return;
    }
  }

  var rowData = G_GRDSUB.data.getItem(row);
  onGetBIImage("#imgBIBrand", rowData.BRAND_CD);

  // 상단 현재로우/총건수 업데이트
  $NC.setGridDisplayRows("#grdSub", row + 1);
}

function onGetMaster(ajaxData) {

  $NC.setInitGridData(G_GRDMASTER, ajaxData);
  if (G_GRDMASTER.data.getLength() > 0) {
    if ($NC.isNull(G_GRDMASTER.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDMASTER, 0);
    } else {
      $NC.setGridSelectRow(G_GRDMASTER, {
        selectKey: "CUST_CD",
        selectVal: G_GRDMASTER.lastKeyVal
      });
    }
    $NC.setEnable("#btnBICustUpload");
    $NC.setEnable("#btnBICustRemove");
  } else {
    $NC.setGridDisplayRows("#grdMaster", 0, 0);

    onGetBIImage("#imgBICust", "");

    $NC.setInitGridVar(G_GRDDETAIL);
    $NC.setInitGridVar(G_GRDSUB);
    onGetDetail({
      data: null
    });
    onGetSub({
      data: null
    });
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

function onGetDetail(ajaxData) {

  $NC.setInitGridData(G_GRDDETAIL, ajaxData);
  if (G_GRDDETAIL.data.getLength() > 0) {
    if ($NC.isNull(G_GRDDETAIL.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDDETAIL, 0);
    } else {
      $NC.setGridSelectRow(G_GRDDETAIL, {
        selectKey: "BU_CD",
        selectVal: G_GRDDETAIL.lastKeyVal
      });
    }

    $NC.setEnable("#btnBIBuUpload");
    $NC.setEnable("#btnBIBuRemove");

  } else {
    $NC.setGridDisplayRows("#grdDetail", 0, 0);

    $NC.setEnable("#btnBIBuUpload", false);
    $NC.setEnable("#btnBIBuRemove", false);
    onGetBIImage("#imgBIBu", "");
  }

}

function onGetSub(ajaxData) {

  $NC.setInitGridData(G_GRDSUB, ajaxData);
  if (G_GRDSUB.data.getLength() > 0) {
    if ($NC.isNull(G_GRDSUB.lastKeyVal)) {
      $NC.setGridSelectRow(G_GRDSUB, 0);
    } else {
      $NC.setGridSelectRow(G_GRDSUB, {
        selectKey: "BRAND_CD",
        selectVal: G_GRDSUB.lastKeyVal
      });
    }
    $NC.setEnable("#btnBIBrandUpload");
    $NC.setEnable("#btnBIBrandRemove");
  } else {

    $NC.setEnable("#btnBIBrandUpload", false);
    $NC.setEnable("#btnBIBrandRemove", false);
    onGetBIImage("#imgBIBrand", "");

    $NC.setGridDisplayRows("#grdSub", 0, 0);
  }
}

function onSave(ajaxData) {

}

function onGetBIImage(selector, biImage_Cd) {

  $(selector).prop("src",
      "/CM03070E/getBIImage.do?P_BIIMAGE_DIV=" + selector.substr(6).toUpperCase() + "&P_BIIMAGE_CD=" + biImage_Cd);
}

function onBtnBICustUpload() {

  if (!$NC.getProgramPermission().canSave) {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("로고를 업로드할 위탁사를 선택 후 파일업로드 처리 하십시오.");
    return;
  }

  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  $NC.G_MAIN.uploadFileSelect(function(view, fileFullName, fileName) {
    var fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    if (fileExt !== "jpg" && fileExt !== "png") {
      alert("로고 파일(*.jpg, *.png) 파일을 선택하십시오.");
      return;
    }

    $NC.G_MAIN.fileUpload("/CM03070E/saveBIImage.do", {
      P_BIIMAGE_DIV: "CUST",
      P_BIIMAGE_CD: rowData.CUST_CD
    }, function(ajaxData) {
      onGetBIImage("#imgBICust", rowData.CUST_CD);
    });
  });
}

function onBtnBICustRemove() {

  if (!$NC.getProgramPermission().canDelete) {
    alert("해당 프로그램의 삭제권한이 없습니다.");
    return;
  }

  if (G_GRDMASTER.data.getLength() == 0) {
    alert("로고를 삭제할 위탁사를 선택 후 삭제처리 하십시오.");
    return;
  }

  if (!confirm("선택한 위탁사의 로고를 삭제하시겠습니까?")) {
    return;
  }
  var rowData = G_GRDMASTER.data.getItem(G_GRDMASTER.lastRow);

  $NC.serviceCall("/CM03070E/removeBIImage.do", {
    P_BIIMAGE_DIV: "CUST",
    P_BIIMAGE_CD: rowData.CUST_CD
  }, function(ajaxData) {
    onGetBIImage("#imgBICust", rowData.CUST_CD);
  });
}

function onBtnBIBuUpload() {

  // 저장권한
  if (!$NC.getProgramPermission().canSave) {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("로고를 업로드할 사업부를 선택 후 파일업로드 처리 하십시오.");
    return;
  }

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

  $NC.G_MAIN.uploadFileSelect(function(view, fileFullName, fileName) {
    var fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    if (fileExt !== "jpg" && fileExt !== "png") {
      alert("로고 파일(*.jpg, *.png) 파일을 선택하십시오.");
      return;
    }

    $NC.G_MAIN.fileUpload("/CM03070E/saveBIImage.do", {
      P_BIIMAGE_DIV: "BU",
      P_BIIMAGE_CD: rowData.BU_CD
    }, function(ajaxData) {
      onGetBIImage("#imgBIBu", rowData.BU_CD);
    });
  });
}

function onBtnBIBuRemove() {

  if (!$NC.getProgramPermission().canDelete) {
    alert("해당 프로그램의 삭제권한이 없습니다.");
    return;
  }

  if (G_GRDDETAIL.data.getLength() == 0) {
    alert("로고를 삭제할 사업부를 선택 후 삭제처리 하십시오.");
    return;
  }

  if (!confirm("선택한 사업부의 로고를 삭제하시겠습니까?")) {
    return;
  }

  var rowData = G_GRDDETAIL.data.getItem(G_GRDDETAIL.lastRow);

  $NC.serviceCall("/CM03070E/removeBIImage.do", {
    P_BIIMAGE_DIV: "BU",
    P_BIIMAGE_CD: rowData.BU_CD
  }, function(ajaxData) {
    onGetBIImage("#imgBIBu", rowData.BU_CD);
  });
}

function onBtnBIBrandUpload() {

  if (!$NC.getProgramPermission().canSave) {
    alert("해당 프로그램의 저장권한이 없습니다.");
    return;
  }

  if (G_GRDSUB.data.getLength() == 0) {
    alert("로고를 업로드할 판매사를 선택 후 파일업로드 처리 하십시오.");
    return;
  }

  var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);

  $NC.G_MAIN.uploadFileSelect(function(view, fileFullName, fileName) {
    var fileExt = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
    if (fileExt !== "jpg" && fileExt !== "png") {
      alert("로고 파일(*.jpg, *.png) 파일을 선택하십시오.");
      return;
    }

    $NC.G_MAIN.fileUpload("/CM03070E/saveBIImage.do", {
      P_BIIMAGE_DIV: "BRAND",
      P_BIIMAGE_CD: rowData.BRAND_CD
    }, function(ajaxData) {
      onGetBIImage("#imgBIBrand", rowData.BRAND_CD);
    });
  });
}

function onBtnBIBrandRemove() {

  if (!$NC.getProgramPermission().canDelete) {
    alert("해당 프로그램의 삭제권한이 없습니다.");
    return;
  }

  if (G_GRDSUB.data.getLength() == 0) {
    alert("로고를 삭제할 판매사를 선택 후 삭제처리 하십시오.");
    return;
  }

  if (!confirm("선택한 판매사의 로고를 삭제하시겠습니까?")) {
    return;
  }

  var rowData = G_GRDSUB.data.getItem(G_GRDSUB.lastRow);

  $NC.serviceCall("/CM03070E/removeBIImage.do", {
    P_BIIMAGE_DIV: "BRAND",
    P_BIIMAGE_CD: rowData.BRAND_CD
  }, function(ajaxData) {
    onGetBIImage("#imgBIBrand", rowData.BRAND_CD);
  });
}