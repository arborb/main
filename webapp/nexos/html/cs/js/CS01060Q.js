/**
 * 화면 초기화 - 화면 로드시 자동 호출 됨
 */
function _Initialize() {

  // 단위화면에서 사용될 일반 전역 변수 정의
  $NC.setGlobalVar({
    CLIENT1: "",
    CLIENT2: ""
  });

  _Inquiry();
  searchButton();

  // 버튼 활성화 처리
  $NC.G_VAR.buttons._inquiry = "0";
  $NC.G_VAR.buttons._new = "0";
  $NC.G_VAR.buttons._save = "0";
  $NC.G_VAR.buttons._cancel = "0";
  $NC.G_VAR.buttons._delete = "0";
  $NC.G_VAR.buttons._print = "0";
  $NC.setInitTopButtons($NC.G_VAR.buttons);
}

/**
 * 화면 리사이즈 Offset 세팅
 */
function _SetResizeOffset() {

  $NC.G_OFFSET.nonClientHeight = $NC.G_LAYOUT.nonClientHeight;
}

/**
 * Window Resize Event - Window Size 조정시 호출 됨
 */
function _OnResize(parent) {

  var clientWidth = parent.width() - $NC.G_LAYOUT.border1;
  var clientHeight = parent.height() - $NC.G_OFFSET.nonClientHeight;

  $NC.resizeContainer("#divMasterView", clientWidth, clientHeight);
}

/**
 * Input Change Event - Input, Select Change 시 호출 됨
 */
function _OnInputChange(e, view, val) {
  var id = view.prop("id").substr(3).toUpperCase();
  masterOnCellChange(e, {
    view: view,
    col: id,
    val: val
  });
}

function masterOnCellChange(e, args) {

}

/**
 * Inquiry Button Event - 메인 상단 조회 버튼 클릭시 호출 됨
 */
function _Inquiry() {

  // 데이터 조회
  $NC.serviceCall("/CS01060Q/getDataSet.do", {
    P_QUERY_ID: "CS01060Q.RS_MASTER",
    P_QUERY_PARAMS: $NC.getParams({
      P_USER_ID: $NC.G_USERINFO.USER_ID,
      P_CLIENT_IP: $NC.G_USERINFO.CLIENT_IP
    })
  }, onGetMenu);
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

/**
 * 서버에서 메뉴를 불러온다.
 * 
 * @param ajaxData
 */
function onGetMenu(ajaxData) {
  var resultData = $NC.makeMenuTree($NC.toArray(ajaxData))
    ,strL = ''
    ,strR = ''
    ,parentHeight = parseInt($('#divMasterView').css('height')) - 50
  
  for (var i in resultData) {
    if (i%2 == 0) {
      strL += getTopMenu(resultData);
    } else {
      strR += getTopMenu(resultData);
    }
  }
  $('#layoutLeft').html(strL);
  $('#layoutRight').html(strR);
  $('#sitemap').css('height', parentHeight + 'px');
  openCloseMenu();

  // 페이지 열기
  $('[data-row]').on('click', function(){
    var idx = $(this).attr('data-row')
      ,rowData = parent.G_GRDPROGRAMMENU.data.getItems();
    parent.showProgramPopup(rowData[idx]);
  })

  function getTopMenu(data) {
    var str = '';
    str += '<div class="lists">';
    str += '<div class="ui-gbox-title" ';
    str +=  'data-row="' + data[i]['ROW_ID'] + '" ';
    if (data[i]['WEB_URL']) {
      str +=  'data-url="' + data[i]['WEB_URL'] + '" ';
      str +=  'data-id="' + data[i]['PROGRAM_ID'] + '" ';
      str += '> '
    } else {
      str += '><span class="oc-icon">▲</span> ';
    }
    str += data[i]['PROGRAM_NM'];
    str += '<span>(' + data[i]['PROGRAM_ID'] + ')</span>';
    str += '</div>';
    
    if (data[i].child) {
      str += '<div class="ui-gbox-content">';
      str += '  <div class="ui-ctnr-row" data-group="' + data[i]['ROW_ID'] + '">';
      str += getSubMenu(data[i].child);
      str += '  </div>';
      str += '</div>';
    }
    str += '</div>';
    return str;
  }

  function getSubMenu(data) {
    var str = '';
    for (var i in data) {
      str += '<div class="ui-lbl-normal large ';
      if (data[i]['WEB_URL']) {
        str +=  '" data-url="' + data[i]['WEB_URL'] + '" ';
        str +=  'data-id="' + data[i]['PROGRAM_ID'] + '" ';
      } else {
        str +=  'sub-group" ';
      }
      str +=  'data-row="' + data[i]['ROW_ID'] + '" ';
      str += '>' + data[i]['PROGRAM_NM'];
      str += '<span>(' + data[i]['PROGRAM_ID'] + ')</span>';
      str += '</div>';
      
      if (data[i].child) {
        str += '<div class="ui-gbox-content">';
        str += '  <div class="ui-ctnr-row" data-group="' + data[i]['ROW_ID'] + '">';
        str += getSubMenu(data[i].child);
        str += '  </div>';
        str += '</div>';
      }
    }
    return str;
  }
}

function onSave(ajaxData) {

  _Inquiry();
}

/**
 * 메뉴 빨리 찾기
 * 
 * @param
 */
function searchButton() {
  // 메뉴 빨리 찾기
  $("#btnQBu_Cd").on('click', searchMenu);
  $("#edtQBu_Cd").on('keyup', searchMenu);

  function searchMenu() {
    var keyword = $('#edtQBu_Cd').val().toUpperCase()
      ,count = 0;
    $('[data-row]').html(function(e, t){
      return t.replace("<mark>", '').replace("</mark>", '');
    })
    $('#txtSearchResult').html('');
    if (!keyword) {
      return false;
    }
    $('[data-row]').html(function(e, t){
      if (t.indexOf(keyword) != -1) {
        count++;
      }
      return t.replace(keyword, "<mark>"+keyword+"</mark>");
    })
    $('#txtSearchResult').html('(' + count + '개의 결과가 있습니다.)');
  }
}

/**
 * 메뉴 펼치기, 닫기
 * 
 * @param
 */
function openCloseMenu() {
  // 메뉴 펼치기
  $('.ui-gbox-title').on('click', function(){
    $(this).parent().toggleClass('close');
    if ($(this).parent().hasClass('close')) {
      $(this).find('.oc-icon').html('▼');
    } else {
      $(this).find('.oc-icon').html('▲');
    }
  })

  $('#btnOpenAll').on('click', function(){
    $('.lists').removeClass('close');
    $('.oc-icon').html('▲');
  })
  $('#btnCloseAll').on('click', function(){
    $('.lists').addClass('close');
    $('.oc-icon').html('▼');
  })
}