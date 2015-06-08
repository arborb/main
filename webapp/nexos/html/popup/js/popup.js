// -------------------------------------------------------------------------------------------------
// 공통 코드검색 팝업
// 컨테이너ID(containerId)의 명칭 접두어는 divCommonPopup으로 지정
// common.js에서 해당 명칭으로 분기 처리 함
// -------------------------------------------------------------------------------------------------
// 공통 컴포넌트 JS Include
(function($) {

  $.extend(true, window, {
    Nexos: {
      Popup: NexosPopup
    }
  });

  /**
   * Nexos WMS 공통 Popup Function Class<br>
   * prototype 사용하지 않음(Auto Completion)
   * 
   * @class NexosPopup
   * @constructor
   */
  function NexosPopup(options) {

    // -------------------------------------------------------------------------------------------------
    // Global Variable
    // TODO: Global Variable
    // -------------------------------------------------------------------------------------------------
    var $NP = this;

    // -------------------------------------------------------------------------------------------------
    // Public Function
    // TODO: Public Function
    // -------------------------------------------------------------------------------------------------

    /**
     * 작업구분 위탁사 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */

    $NP.showOwnBranPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("OWN_BRAND_CD"), "위탁사코드"),
            $NC.nullToDefault($NC.getDisplayName("OWN_BRAND_NM"), "위탁사명")];
      }

      var requestData = {
        containerId: "divCommonPopupBuBrand",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_OWN_BRAND_CD"), "위탁사") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_OWNBRAND_CD" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_OWN_BRAND_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "OWN_BRAND_CD",
          field: "OWN_BRAND_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "OWN_BRAND_NM",
          field: "OWN_BRAND_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      var userIdObj = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      $.extend(requestData.queryParams, userIdObj);

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 사업부 대표위탁사 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getOwnBrandInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      var userIdObj = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      $.extend(options.queryParams, userIdObj);

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_OWNBRAND_CD";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 위탁사입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 사업부 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showBuPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("BU_CD"), "사업구분코드"),
            $NC.nullToDefault($NC.getDisplayName("BU_NM"), "사업구분명")];
      }

      var requestData = {
        containerId: "divCommonPopupBu",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_BU_CD"), "사업구분") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMBU" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_BU_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "BU_CD",
          field: "BU_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "BU_NM",
          field: "BU_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 사업부 브랜드 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */

    $NP.showBuBrandPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("BRAND_CD"), "브랜드코드"),
            $NC.nullToDefault($NC.getDisplayName("BRAND_NM"), "브랜드명")];
      }

      var requestData = {
        containerId: "divCommonPopupBuBrand",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_BU_BRAND_CD"), "사업구분브랜드")
            + " 검색" : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMBUBRAND" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_BRAND_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? false : options.queryCanAll,
        columns: [{
          id: "BRAND_CD",
          field: "BRAND_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "BRAND_NM",
          field: "BRAND_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 위탁사 브랜드 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showCustBrandPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("BRAND_CD"), "브랜드코드"),
            $NC.nullToDefault($NC.getDisplayName("BRAND_NM"), "브랜드명")];
      }

      var requestData = {
        containerId: "divCommonPopupCustBrand",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_CUST_BRAND_CD"), "위탁사 브랜드")
            + " 검색" : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMCUSTBRAND" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_BRAND_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "BRAND_CD",
          field: "BRAND_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "BRAND_NM",
          field: "BRAND_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * MALL 브랜드 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */

    $NP.showMallBrandPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("BRAND_CD1"), "판매사코드"),
            $NC.nullToDefault($NC.getDisplayName("BRAND_NM1"), "판매사명")];
      }

      var requestData = {
        containerId: "divCommonPopupMallBrand",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_MALL_BRAND_CD"), "판매사") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMMALLBRAND" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_BRAND_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "BRAND_CD",
          field: "BRAND_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "BRAND_NM",
          field: "BRAND_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * MALL 브랜드 팝업(반입용)
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */

    $NP.getRIMallBrandInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMMALLBRAND_RI";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 판매사입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    $NP.showRIMallBrandPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("BRAND_CD1"), "판매사코드"),
            $NC.nullToDefault($NC.getDisplayName("BRAND_NM1"), "판매사명")];
      }

      var requestData = {
        containerId: "divCommonPopupRIMallBrand",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_MALL_BRAND_CD_RI"), "판매사")
            + " 검색" : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMMALLBRAND_RI" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_BRAND_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? false : options.queryCanAll,
        columns: [{
          id: "BRAND_CD",
          field: "BRAND_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "BRAND_NM",
          field: "BRAND_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 브랜드 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showBrandPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("BRAND_CD1"), "판매사코드"),
            $NC.nullToDefault($NC.getDisplayName("BRAND_NM1"), "판매사명")];
      }

      var requestData = {
        containerId: "divCommonPopupBrand",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_BRAND_CD1"), "판매사") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMBRAND" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_BRAND_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "BRAND_CD",
          field: "BRAND_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "BRAND_NM",
          field: "BRAND_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      var userIdObj = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      $.extend(requestData.queryParams, userIdObj);

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 차량 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showCarPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("CAR_CD"), "차량코드"),
            $NC.nullToDefault($NC.getDisplayName("CAR_NM"), "차량명")];
      }

      var requestData = {
        containerId: "divCommonPopupCar",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_CAR_CD"), "차량") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMCAR" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_CAR_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "CAR_CD",
          field: "CAR_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "CAR_NM",
          field: "CAR_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 물류센터 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showCenterPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("CENTER_CD"), "물류센터코드"),
            $NC.nullToDefault($NC.getDisplayName("CENTER_NM"), "물류센터명")];
      }

      var requestData = {
        containerId: "divCommonPopupCenter",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_CENTER_CD"), "물류센터") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMCENTER" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_CENTER_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "CENTER_CD",
          field: "CENTER_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "CENTER_NM",
          field: "CENTER_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 상용코드 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showCodePopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("CODE_CD"), "상용코드"),
            $NC.nullToDefault($NC.getDisplayName("CODE_NM"), "상용코드명")];
      }

      var requestData = {
        containerId: "divCommonPopupCode",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_CODE_CD"), "코드") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMCODE" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_CODE_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "CODE_CD",
          field: "CODE_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "CODE_NM",
          field: "CODE_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 위탁사 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showCustPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("CUST_CD"), "위탁사코드"),
            $NC.nullToDefault($NC.getDisplayName("CUST_NM"), "위탁사명")];
      }

      var requestData = {
        containerId: "divCommonPopupCust",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_CUST_CD"), "위탁사") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMCUST" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_CUST_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "CUST_CD",
          field: "CUST_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "CUST_NM",
          field: "CUST_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 위탁사USER 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showCustUserPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("CUST_CD"), "위탁사코드"),
            $NC.nullToDefault($NC.getDisplayName("CUST_NM"), "위탁사명")];
      }

      var requestData = {
        containerId: "divCommonPopupCustUser",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_CUST_CD"), "위탁사") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMUSERCUST" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_CUST_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "CUST_CD",
          field: "CUST_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "CUST_NM",
          field: "CUST_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 배송처 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showDeliveryPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("DELIVERY_CD"), "배송처코드"),
            $NC.nullToDefault($NC.getDisplayName("DELIVERY_NM"), "배송처명")];
      }
      var queryParams = $.isPlainObject(options.queryParams) ? options.queryParams : options;
      if (!("P_DELIVERY_DIV" in queryParams)) {
        queryParams["P_DELIVERY_DIV"] = "%";
      }

      var requestData = {
        containerId: "divCommonPopupDelivery",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_DELIVERY_CD"), "배송처") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMDELIVERY" : options.queryId,
        queryParams: queryParams,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_DELIVERY_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "DELIVERY_CD",
          field: "DELIVERY_CD",
          name: options.columnTitle[0],
          width: 70
        }, {
          id: "DELIVERY_NM",
          field: "DELIVERY_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 운송권역 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showDeliveryAreaPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("AREA_CD"), "운송권역코드"),
            $NC.nullToDefault($NC.getDisplayName("AREA_NM"), "운송권역명")];
      }

      var requestData = {
        containerId: "divCommonPopupDeliveryArea",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_AREA_CD"), "운송권역") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMDELIVERYAREA" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_AREA_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "AREA_CD",
          field: "AREA_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "AREA_NM",
          field: "AREA_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 공급처 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showVendorPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("VENDOR_CD"), "공급처코드"),
            $NC.nullToDefault($NC.getDisplayName("VENDOR_NM"), "공급처명")];
      }

      var requestData = {
        containerId: "divCommonPopupVendor",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_VENDOR_CD"), "공급처") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMVENDOR" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_VENDOR_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "VENDOR_CD",
          field: "VENDOR_CD",
          name: options.columnTitle[0],
          width: 70
        }, {
          id: "VENDOR_NM",
          field: "VENDOR_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 사용자공급처 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showVendorBrandPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("VENDOR_CD"), "공급처코드"),
            $NC.nullToDefault($NC.getDisplayName("VENDOR_NM"), "공급처명")];
      }

      var requestData = {
        containerId: "divCommonPopupVendorBrand",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_VENDORBRAND_CD"), "공급처") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMVENBRAND" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_VENDOR_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "VENDOR_CD",
          field: "VENDOR_CD",
          name: options.columnTitle[0],
          width: 70
        }, {
          id: "VENDOR_NM",
          field: "VENDOR_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 상품 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showItemPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("ITEM_CD"), "상품코드"),
            $NC.nullToDefault($NC.getDisplayName("ITEM_NM"), "상품명"),
            $NC.nullToDefault($NC.getDisplayName("ITEM_SPEC"), "규격"),
            $NC.nullToDefault($NC.getDisplayName("BRAND_NM"), "브랜드명")];
      }

      var requestData = {
        containerId: "divCommonPopupItem",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_ITEM_CD"), "상품") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMITEM" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_ITEM_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "ITEM_CD",
          field: "ITEM_CD",
          name: options.columnTitle[0],
          width: 90
        }, {
          id: "ITEM_NM",
          field: "ITEM_NM",
          name: options.columnTitle[1],
          width: 150
        }, {
          id: "ITEM_SPEC",
          field: "ITEM_SPEC",
          name: options.columnTitle[2],
          width: 100
        }, {
          id: "BRAND_NM",
          field: "BRAND_NM",
          name: options.columnTitle[3],
          width: 120
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 상품 팝업(VENDOR_CD 파라미터 추가)
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showItemPopupWithVendorCd = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("ITEM_CD"), "상품코드"),
            $NC.nullToDefault($NC.getDisplayName("ITEM_NM"), "상품명"),
            $NC.nullToDefault($NC.getDisplayName("ITEM_SPEC"), "규격"),
            $NC.nullToDefault($NC.getDisplayName("BRAND_NM"), "브랜드명")];
      }

      var requestData = {
        containerId: "divCommonPopupItem",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_ITEM_CD"), "상품") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMITEM_ADDING_VENDOR" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_ITEM_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "ITEM_CD",
          field: "ITEM_CD",
          name: options.columnTitle[0],
          width: 90
        }, {
          id: "ITEM_NM",
          field: "ITEM_NM",
          name: options.columnTitle[1],
          width: 150
        }, {
          id: "ITEM_SPEC",
          field: "ITEM_SPEC",
          name: options.columnTitle[2],
          width: 100
        }, {
          id: "BRAND_NM",
          field: "BRAND_NM",
          name: options.columnTitle[3],
          width: 120
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 딜상품 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showDealItemPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("ITEM_CD"), "상품코드"),
            $NC.nullToDefault($NC.getDisplayName("ITEM_NM"), "상품명"),
            $NC.nullToDefault($NC.getDisplayName("DEAL_ITEM_QTY"), "옵션수량"),
            $NC.nullToDefault($NC.getDisplayName("BRAND_NM"), "브랜드명")];
      }

      var requestData = {
        containerId: "divCommonPopupDealItem",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_ITEM_CD"), "상품") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMDEALITEM" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_ITEM_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "ITEM_CD",
          field: "ITEM_CD",
          name: options.columnTitle[0],
          width: 90
        }, {
          id: "ITEM_NM",
          field: "ITEM_NM",
          name: options.columnTitle[1],
          width: 160
        }, {
          id: "DEAL_ITEM_QTY",
          field: "DEAL_ITEM_QTY",
          name: options.columnTitle[2],
          width: 90
        }, {
          id: "BRAND_NM",
          field: "BRAND_NM",
          name: options.columnTitle[3],
          width: 120
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 딜 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showDealPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("DEAL_ID"), "딜ID"),
            $NC.nullToDefault($NC.getDisplayName("DEAL_NM"), "딜명"),
            $NC.nullToDefault($NC.getDisplayName("COMPANY_ID"), "업체번호"),
            $NC.nullToDefault($NC.getDisplayName("PRICE"), "딜판매가격")];
      }

      var requestData = {
        containerId: "divCommonPopupDeal",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_DEAL_ID"), "딜ID") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMDEAL" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_DEAL_ID" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "DEAL_ID",
          field: "DEAL_ID",
          name: options.columnTitle[0],
          width: 100
        }, {
          id: "DEAL_NM",
          field: "DEAL_NM",
          name: options.columnTitle[1],
          width: 150
        }, {
          id: "COMPANY_ID",
          field: "COMPANY_ID",
          name: options.columnTitle[2],
          width: 90
        }, {
          id: "PRICE",
          field: "PRICE",
          name: options.columnTitle[3],
          width: 120
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 딜옵션 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showDealOptionPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("OPTION_ID"), "옵션ID"),
            $NC.nullToDefault($NC.getDisplayName("OPTION_VALUE"), "옵션내용"),
            $NC.nullToDefault($NC.getDisplayName("OPTION_CNT"), "옵션수량"),
            $NC.nullToDefault($NC.getDisplayName("OPTION_PRICE_SALE"), "옵션판매가격")];
      }

      var requestData = {
        containerId: "divCommonPopupDealOption",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_OPTION_ID"), "옵션ID") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMDEALOPTION" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_OPTION_ID" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "OPTION_ID",
          field: "OPTION_ID",
          name: options.columnTitle[0],
          width: 100
        }, {
          id: "OPTION_VALUE",
          field: "OPTION_VALUE",
          name: options.columnTitle[1],
          width: 150
        }, {
          id: "OPTION_CNT",
          field: "OPTION_CNT",
          name: options.columnTitle[2],
          width: 90
        }, {
          id: "OPTION_PRICE_SALE",
          field: "OPTION_PRICE_SALE",
          name: options.columnTitle[3],
          width: 120
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 공급처별 상품 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showVendorItemPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("ITEM_CD"), "상품코드"),
            $NC.nullToDefault($NC.getDisplayName("ITEM_NM"), "상품명"),
            $NC.nullToDefault($NC.getDisplayName("ITEM_SPEC"), "규격"),
            $NC.nullToDefault($NC.getDisplayName("BRAND_NM"), "브랜드명")];
      }

      var requestData = {
        containerId: "divCommonPopupVendorItem",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_ITEM_CD"), "상품") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMVENDORITEM" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_ITEM_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "ITEM_CD",
          field: "ITEM_CD",
          name: options.columnTitle[0],
          width: 90
        }, {
          id: "ITEM_NM",
          field: "ITEM_NM",
          name: options.columnTitle[1],
          width: 150
        }, {
          id: "ITEM_SPEC",
          field: "ITEM_SPEC",
          name: options.columnTitle[2],
          width: 100
        }, {
          id: "BRAND_NM",
          field: "BRAND_NM",
          name: options.columnTitle[3],
          width: 120
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 상품그룹 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showItemGroupPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("DEPART_CD"), "대분류코드"),
            $NC.nullToDefault($NC.getDisplayName("DEPART_NM"), "대분류명"),
            $NC.nullToDefault($NC.getDisplayName("LINE_CD"), "중분류코드"),
            $NC.nullToDefault($NC.getDisplayName("LINE_NM"), "중분류명"),
            $NC.nullToDefault($NC.getDisplayName("CLASS_CD"), "소분류코드"),
            $NC.nullToDefault($NC.getDisplayName("CLASS_NM"), "소분류명")];
      }

      var requestData = {
        containerId: "divCommonPopupItemGroup",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_ITEM_GROUP"), "상품그룹") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 500,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMITEMGROUP" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_BRAND_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "DEPART_CD",
          field: "DEPART_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "DEPART_NM",
          field: "DEPART_NM",
          name: options.columnTitle[1],
          width: 100
        }, {
          id: "LINE_CD",
          field: "LINE_CD",
          name: options.columnTitle[2],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "LINE_NM",
          field: "LINE_NM",
          name: options.columnTitle[3],
          width: 100
        }, {
          id: "CLASS_CD",
          field: "CLASS_CD",
          name: options.columnTitle[4],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "CLASS_NM",
          field: "CLASS_NM",
          name: options.columnTitle[5],
          width: 100
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 로케이션 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showLocationPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("ZONE_CD"), "존코드"),
            $NC.nullToDefault($NC.getDisplayName("ZONE_NM"), "존명"),
            $NC.nullToDefault($NC.getDisplayName("LOCATION_CD"), "로케이션")];
      }

      var requestData = {
        containerId: "divCommonPopupLocation",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_LOCATION_CD"), "로케이션") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMLOCATION" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_LOCATION_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "ZONE_CD",
          field: "ZONE_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "ZONE_NM",
          field: "ZONE_NM",
          name: options.columnTitle[1],
          width: 100
        }, {
          id: "LOCATION_CD",
          field: "LOCATION_CD",
          name: options.columnTitle[2],
          width: 100,
          cssClass: "align-center"
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 우편번호 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showPostPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("ZIP_CD"), "우편번호"),
            $NC.nullToDefault($NC.getDisplayName("ADDR_NM"), "주소")];
      }

      var requestData = {
        containerId: "divCommonPopupZip",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_ZIP_CD"), "우편번호") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMPOST" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_ADDR_NM" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? false : options.queryCanAll,
        columns: [{
          id: "ZIP_CD",
          field: "ZIP_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "ADDR_NM",
          field: "ADDR_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 관련사 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showReferencePopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("REF_CUST_CD"), "관련사코드"),
            $NC.nullToDefault($NC.getDisplayName("REF_CUST_NM"), "관련사명")];
      }

      var requestData = {
        containerId: "divCommonPopupReference",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_REF_CUST_CD"), "관련사") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMREFERENCE" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_REF_CUST_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "REF_CUST_CD",
          field: "REF_CUST_CD",
          name: options.columnTitle[0],
          width: 70
        }, {
          id: "REF_CUST_NM",
          field: "REF_CUST_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 운송사 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showCarrierPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("CARRIER_CD"), "운송사코드"),
            $NC.nullToDefault($NC.getDisplayName("CARRIER_NM"), "운송사명")];
      }

      var requestData = {
        containerId: "divCommonPopupCarrier",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_CARRIER_CD"), "운송사") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMCARRIER" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_CARRIER_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "CARRIER_CD",
          field: "CARRIER_CD",
          name: options.columnTitle[0],
          width: 70
        }, {
          id: "CARRIER_NM",
          field: "CARRIER_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 창고구분 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showZonePopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("ZONE_CD"), "존코드"),
            $NC.nullToDefault($NC.getDisplayName("ZONE_NM"), "존명")];
      }

      var requestData = {
        containerId: "divCommonPopupZone",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_ZONE_CD"), "존") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMZONE" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_ZONE_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "ZONE_CD",
          field: "ZONE_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "ZONE_NM",
          field: "ZONE_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 사용자 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showUserPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("USER_ID"), "사용자ID"),
            $NC.nullToDefault($NC.getDisplayName("USER_NM"), "사용자명")];
      }

      var requestData = {
        containerId: "divCommonPopupUser",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_USER_ID"), "사용자") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CSUSER" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_USER_ID" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "USER_ID",
          field: "USER_ID",
          name: options.columnTitle[0],
          width: 70
        }, {
          id: "USER_NM",
          field: "USER_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 사용자 사업부 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showUserBuPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("BU_CD"), "사업구분코드"),
            $NC.nullToDefault($NC.getDisplayName("BU_NM"), "사업구분명")];
      }

      var requestData = {
        containerId: "divCommonPopupUserBu",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_BU_CD"), "사업구분") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CSUSERBU" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_BU_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "BU_CD",
          field: "BU_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "BU_NM",
          field: "BU_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 사용자 브랜드 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showUserBrandPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("BRAND_CD1"), "판매사코드"),
            $NC.nullToDefault($NC.getDisplayName("BRAND_NM1"), "판매사명")];
      }

      var requestData = {
        containerId: "divCommonPopupUserBrand",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_BRAND_CD1"), "판매사") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CSUSERBRAND" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_BRAND_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "BRAND_CD",
          field: "BRAND_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "BRAND_NM",
          field: "BRAND_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 사용자 물류센터 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showUserCenterPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("CENTER_CD"), "물류센터코드"),
            $NC.nullToDefault($NC.getDisplayName("CENTER_NM"), "물류센터명")];
      }

      var requestData = {
        containerId: "divCommonPopupUserCenter",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_USER_CENTER_CD"), "사용자 물류센터")
            + " 검색" : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CSUSERCENTER" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_CENTER_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "CENTER_CD",
          field: "CENTER_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "CENTER_NM",
          field: "CENTER_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 재고 LOT번호 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showItemLotPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("ITEM_LOT"), "LOT번호"),
            $NC.nullToDefault($NC.getDisplayName("STOCK_QTY"), "재고수량"),
            $NC.nullToDefault($NC.getDisplayName("PSTOCK_QTY"), "가용재고")];
      }

      var requestData = {
        containerId: "divCommonPopupItemLot",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_STOCK_ITEM_LOT"), "재고 LOT번호")
            + " 검색" : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_ITEM_LOT" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_ITEM_LOT" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "ITEM_LOT",
          field: "ITEM_LOT",
          name: options.columnTitle[0],
          width: 150
        }, {
          id: "STOCK_QTY",
          field: "STOCK_QTY",
          name: options.columnTitle[1],
          width: 90,
          cssClass: "align-right"
        }, {
          id: "PSTOCK_QTY",
          field: "PSTOCK_QTY",
          name: options.columnTitle[2],
          width: 90,
          cssClass: "align-right"
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 작업구분 위탁사 팝업-1(showOwnBrandPopup)
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showOwnBrandPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("OWN_BRAND_CD"), "위탁사코드"),
            $NC.nullToDefault($NC.getDisplayName("OWN_BRAND_NM"), "위탁사명")];
      }

      var requestData = {
        containerId: "divCommonPopupOwn_Brand",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_OWN_BRAND_CD"), "위탁사") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_OWNBRAND_CD" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_OWN_BRAND_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "OWN_BRAND_CD",
          field: "OWN_BRAND_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "OWN_BRAND_NM",
          field: "OWN_BRAND_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      var userIdObj = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      $.extend(requestData.queryParams, userIdObj);

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 상품그룹 대분류 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showItemGroupDepartPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("DEPART_CD"), "대분류코드"),
            $NC.nullToDefault($NC.getDisplayName("DEPART_NM"), "대분류명")];
      }

      var requestData = {
        containerId: "divCommonPopupItemGroupDepart",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_DEPART_CD"), "대분류") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_ITEMGROUP_DEPART" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_DEPART_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "DEPART_CD",
          field: "DEPART_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "DEPART_NM",
          field: "DEPART_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 상품그룹 중분류 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showItemGroupLinePopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("LINE_CD"), "중분류코드"),
            $NC.nullToDefault($NC.getDisplayName("LINE_NM"), "중분류명")];
      }

      var requestData = {
        containerId: "divCommonPopupItemGroupLine",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_LINE_CD"), "중분류") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_ITEMGROUP_LINE" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_LINE_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "LINE_CD",
          field: "LINE_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "LINE_NM",
          field: "LINE_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 상품그룹 소분류 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showItemGroupClassPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("CLASS_CD"), "소분류코드"),
            $NC.nullToDefault($NC.getDisplayName("CLASS_NM"), "소분류명")];
      }

      var requestData = {
        containerId: "divCommonPopupItemGroupDepart",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_CLASS_CD"), "소분류") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_ITEMGROUP_CLASS" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_CLASS_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "CLASS_CD",
          field: "CLASS_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "CLASS_NM",
          field: "CLASS_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 사업부 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getBuInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMBU";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 사업구분입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 사업부 브랜드 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getBuBrandInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMBUBRAND";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "사업구분에 등록되어 있지 않은 판매사입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 위탁사 브랜드 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getCustBrandInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMCUSTBRAND";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "위탁사에 등록되어 있지 않은 판매사입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * MALL 브랜드 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getMallBrandInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMMALLBRAND";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "MALL과 해당 판매사로 등록된 딜이 없습니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * MALL 브랜드 정보 검색(반입용)
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getMallBrandInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMMALLBRAND";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "MALL과 해당 판매사로 등록된 딜이 없습니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 브랜드 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getBrandInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      var userIdObj = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      $.extend(options.queryParams, userIdObj);

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMBRAND";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 판매사입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 차량정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getCarInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMCAR";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 차량입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 물류센터정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getCenterInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMCENTER";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 물류센터입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 상용코드정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getCodeInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMCODE";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 코드입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 위탁사정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getCustInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMCUST";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 위탁사입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 위탁사정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getCustUserInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMUSERCUST";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 위탁사입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 운송권역정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getDeliveryAreaInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMDELIVERYAREA";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 운송권역입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 배송처정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getDeliveryInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMDELIVERY";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 배송처입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 상품 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getItemInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMITEM";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 상품입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 공급처 상품 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getItemVendorInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMITEM_ADDING_VENDOR";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 상품입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 딜상품 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getDealItemInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMDEALITEM";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 상품입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 딜 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getDealInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMDEAL";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 딜입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 딜옵션 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getDealOptionInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMDEALOPTION";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 딜옵션입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * LOT번호 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getItemLotInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_ITEM_LOT";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "현재고에 존재하지 않는 LOT번호입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 로케이션 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getLocationInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMLOCATION";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 로케이션입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 우편번호 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getPostInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMPOST";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 우편번호입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 관련사 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getReferenceInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMREFERENCE";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 관련사입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 운송사 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getCarrierInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMCARRIER";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 운송사입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 사용자 사업부 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getUserBuInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CSUSERBU";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 사업구분입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 사용자 브랜드정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getUserBrandInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CSUSERBRAND";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 판매사입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 사용자 물류센터 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getUserCenterInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CSUSERCENTER";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 물류센터입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 사용자정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getUserInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CSUSER";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 사용자입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 공급처정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getVendorInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMVENDOR";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 공급처입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 사용자공급처정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getVendorBrandInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMVENBRAND";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 공급처입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };
    /**
     * 존정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getZoneInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMZONE";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 물류센터 존입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 상품그룹 대분류 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getItemGroupDepartInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_ITEMGROUP_DEPART";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 대분류입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 상품그룹 중분류 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getItemGroupLineInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_ITEMGROUP_LINE";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 중분류입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 상품그룹 소분류 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getItemGroupClassInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_ITEMGROUP_CLASS";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 소분류입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };
    /**
     * 공급처정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getVendor_roInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMVENDOR_RO";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 배송처입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 공급처 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showVendor_roPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("VENDOR_CD"), "배송처코드"),
            $NC.nullToDefault($NC.getDisplayName("VENDOR_NM"), "배송처명"),
            $NC.nullToDefault($NC.getDisplayName("ADDR"), "주소")];
      }

      var requestData = {
        containerId: "divCommonPopupVendor",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_VENDOR_CD"), "배송처") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 550,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMVENDOR_RO" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_VENDOR_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "VENDOR_CD",
          field: "VENDOR_CD",
          name: options.columnTitle[0],
          width: 70
        }, {
          id: "VENDOR_NM",
          field: "VENDOR_NM",
          name: options.columnTitle[1],
          width: 150
        }, {
          id: "ADDR",
          field: "ADDR",
          name: options.columnTitle[1],
          width: 250
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    $NP.getOwnBrand_roInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      var userIdObj = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      $.extend(options.queryParams, userIdObj);

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_OWNBRAND_CD_RO";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 위탁사입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    $NP.showOwnBran_roPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("OWN_BRAND_CD"), "위탁사코드"),
            $NC.nullToDefault($NC.getDisplayName("OWN_BRAND_NM"), "위탁사명"),
            $NC.nullToDefault($NC.getDisplayName("ADDR"), "주소")];
      }

      var requestData = {
        containerId: "divCommonPopupBuBrand",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_OWN_BRAND_CD"), "위탁사") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 650,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_OWNBRAND_CD_RO" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_OWN_BRAND_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "OWN_BRAND_CD",
          field: "OWN_BRAND_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "OWN_BRAND_NM",
          field: "OWN_BRAND_NM",
          name: options.columnTitle[1],
          width: 150
        }, {
          id: "ADDR",
          field: "ADDR",
          name: options.columnTitle[1],
          width: 250
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      var userIdObj = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      $.extend(requestData.queryParams, userIdObj);

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 사업구분->위탁사->판매사 여부
     */
    $NP.getSellerInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      var userIdObj = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      $.extend(options.queryParams, userIdObj);

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_SELLER_CD";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 판매사 입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    $NP.showSellerPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("SELLER_CD"), "판매사"),
            $NC.nullToDefault($NC.getDisplayName("SELLER_NM"), "판매사명")];
      }

      var requestData = {
        containerId: "divCommonPopupBuBrand",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_SELLER_CD"), "판매사") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_SELLER_CD" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_SELLER_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "SELLER_CD",
          field: "SELLER_CD",
          name: options.columnTitle[0],
          width: 70
        }, {
          id: "SELLER_NM",
          field: "SELLER_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      var userIdObj = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      $.extend(requestData.queryParams, userIdObj);

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    $NP.getLocation01Info = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMLOCATION01";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 로케이션입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    $NP.showLocation01Popup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("ZONE_CD"), "존코드"),
            $NC.nullToDefault($NC.getDisplayName("ZONE_NM"), "존명"),
            $NC.nullToDefault($NC.getDisplayName("LOCATION_CD"), "로케이션")];
      }

      var requestData = {
        containerId: "divCommonPopupLocation",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_LOCATION_CD"), "로케이션") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMLOCATION01" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_LOCATION_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "ZONE_CD",
          field: "ZONE_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "ZONE_NM",
          field: "ZONE_NM",
          name: options.columnTitle[1],
          width: 100
        }, {
          id: "LOCATION_CD",
          field: "LOCATION_CD",
          name: options.columnTitle[2],
          width: 100,
          cssClass: "align-center"
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };
    /**
     * 사업구분->위탁사->판매사 여부
     */
    $NP.getBrandDealInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_SELLER_CD";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 판매사 입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 사업구분->위탁사->판매사->딜ID 여부
     */
    $NP.getBrandDealIdInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_BRANDDEAL_ID";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 딜ID 입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    $NP.showBrandDealPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("DEAL_ID"), "딜코드"),
            $NC.nullToDefault($NC.getDisplayName("P_DEAL_NM"), "딜명")];
      }

      var requestData = {
        containerId: "divCommonPopupBuBrand",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_DEAL_ID"), "딜") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_BRANDDEAL_ID" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_DEAL_ID" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "DEAL_ID",
          field: "DEAL_ID",
          name: options.columnTitle[0],
          width: 70
        }, {
          id: "DEAL_NM",
          field: "DEAL_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 사업부 대표위탁사 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getOwnBrand_allInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      var userIdObj = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      $.extend(options.queryParams, userIdObj);

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_OWNBRAND_CD_ALL";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 위탁사입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    /**
     * 작업구분 위탁사 팝업-1(showOwnBrandPopup)
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showOwnBrand_allPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("BU_NM"), "사업구분"),
            $NC.nullToDefault($NC.getDisplayName("OWN_BRAND_CD"), "위탁사코드"),
            $NC.nullToDefault($NC.getDisplayName("OWN_BRAND_NM"), "위탁사명")];
      }

      var requestData = {
        containerId: "divCommonPopupOwn_Brand",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_OWN_BRAND_CD"), "위탁사") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_OWNBRAND_CD_ALL" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_OWN_BRAND_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "BU_NM",
          field: "BU_NM",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "OWN_BRAND_CD",
          field: "OWN_BRAND_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "OWN_BRAND_NM",
          field: "OWN_BRAND_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      var userIdObj = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      $.extend(requestData.queryParams, userIdObj);

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * HEAD 정산코드 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */

    $NP.getFee_Head_CdInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_LFHEAD";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 정산항목 입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    $NP.showFee_Head_CdPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("FEE_HEAD_CD"), "정산코드"),
            $NC.nullToDefault($NC.getDisplayName("FEE_HEAD_NM"), "정산코드명")];
      }

      var requestData = {
        containerId: "divCommonPopupHead_Cd",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_FEE_HEAD_CD"), "정산코드") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_LFHEAD" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_FEE_HEAD_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "FEE_HEAD_CD",
          field: "FEE_HEAD_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "FEE_HEAD_NM",
          field: "FEE_HEAD_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * BASE 정산코드 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */

    $NP.getFee_Base_CdInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_LFBASE";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 정산세부항목 입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };

    $NP.showFee_Base_CdPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("FEE_BASE_CD"), "세부코드"),
            $NC.nullToDefault($NC.getDisplayName("FEE_BASE_NM"), "세부코드명")];
      }

      var requestData = {
        containerId: "divCommonPopupBase_Cd",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_FEE_BASE_CD"), "세부코드드") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_LFBASE" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_FEE_BASE_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "FEE_BASE_CD",
          field: "FEE_BASE_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "FEE_BASE_NM",
          field: "FEE_BASE_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };
    

    /**
     * 딜 정보 검색 (위탁사,판매사 호출)
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getDealSearchInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_CMDEAL_SEARCH";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 딜입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };



    
    /**
     * 딜 팝업 (위탁사,판매사 호출)
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showDealPopupSearch = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("OWN_BRAND_NM"), "위탁사명"),
            $NC.nullToDefault($NC.getDisplayName("SELLER_NM"), "판매사명"),
            $NC.nullToDefault($NC.getDisplayName("DEAL_ID"), "딜ID"),
            $NC.nullToDefault($NC.getDisplayName("DEAL_NM"), "딜명")];
      }

      var requestData = {
        containerId: "divCommonPopupDealSearch",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_SEARCH_DEAL_ID"), "딜ID") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_CMDEAL_SEARCH" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_DEAL_ID" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "OWN_BRAND_NM",
          field: "OWN_BRAND_NM",
          name: options.columnTitle[0],
          width: 130
        }, {
          id: "SELLER_NM",
          field: "SELLER_NM",
          name: options.columnTitle[1],
          width: 130
        }, {
          id: "DEAL_ID",
          field: "DEAL_ID",
          name: options.columnTitle[2],
          width: 70
        }, {
          id: "DEAL_NM",
          field: "DEAL_NM",
          name: options.columnTitle[3],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    /**
     * 작업구분 위탁사 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */

    $NP.showOwnBran_lfPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("OWN_BRAND_CD"), "위탁사코드"),
            $NC.nullToDefault($NC.getDisplayName("OWN_BRAND_NM"), "위탁사명")];
      }

      var requestData = {
        containerId: "divCommonPopupBuBrand",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_OWN_BRAND_CD"), "위탁사") + " 검색"
            : options.title,
        autoInquiry: true,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_OWNBRAND_CD_LF" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_OWN_BRAND_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "OWN_BRAND_CD",
          field: "OWN_BRAND_CD",
          name: options.columnTitle[0],
          width: 70,
          cssClass: "align-center"
        }, {
          id: "OWN_BRAND_NM",
          field: "OWN_BRAND_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      var userIdObj = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      $.extend(requestData.queryParams, userIdObj);

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    
    /**
     * 사업부 대표위탁사 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getOwnBrand_lfInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      var userIdObj = {
        P_USER_ID: $NC.G_USERINFO.USER_ID
      };
      $.extend(options.queryParams, userIdObj);

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_OWNBRAND_CD_LF";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 위탁사입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };


    
    /**
     * 정산 상품 팝업
     * 
     * @param options
     *          Query 옵션<br>
     *          [S]title[옵션]: 팝업 창 타이틀<br>
     *          타입 1(단순 설정) - options 에 쿼리 파라메터를 지정한 경우 기본 쿼리로 팝업 실행<br>
     *          검색 값을 첫번째 파라메터에 입력함<br>
     *          [A]columnTitle[옵션]: 컬럼 타이틀, ["코드", "명"], 미지정시 기본 값<br>
     *          <br>
     *          타입 2(상세 설정)<br>
     *          [S]queryId[옵션]: 미지정시 기본 쿼리ID 사용<br>
     *          [A]queryParams[필수]: 쿼리 파라메터 지정<br>
     *          [S]querySearchParam[옵션]: 팝업 창 검색시 검색 값을 입력할 파라메터 명<br>
     *          [S]queryCanAll[옵션]: 팝업 창 전체 검색 가능 여부<br>
     * @param onPopupSelect
     *          선택 버튼 클릭시 호출될 이벤트
     * @param onPopupCancel
     *          취소 버튼 클릭시 호출될 이벤트
     */
    $NP.showItem_LfPopup = function(options, onPopupSelect, onPopupCancel) {

      if ($NC.isNull(options)) {
        return;
      }
      if (!$.isArray(options.columnTitle)) {
        options.columnTitle = [$NC.nullToDefault($NC.getDisplayName("CODE_CD"), "상세기준"),
            $NC.nullToDefault($NC.getDisplayName("CODE_NM"), "상세단가명")];
      }

      var requestData = {
        containerId: "divCommonPopupItem",
        title: $NC.isNull(options.title) ? $NC.nullToDefault($NC.getDisplayName("POPUP_CODE_CD"), "단가명") + " 검색"
            : options.title,
        autoInquiry: false,
        width: 400,
        height: 450,
        requestUrl: "/WC/getDataSet.do",
        queryId: $NC.isNull(options.queryId) ? "WC.POP_ADJUST_PRICE_CD" : options.queryId,
        queryParams: $.isPlainObject(options.queryParams) ? options.queryParams : options,
        queryData: options.queryData,
        querySearchParam: $NC.isNull(options.querySearchParam) ? "P_CODE_CD" : options.querySearchParam,
        queryCanAll: $NC.isNull(options.queryCanAll) ? true : options.queryCanAll,
        columns: [{
          id: "CODE_CD",
          field: "CODE_CD",
          name: options.columnTitle[0],
          width: 90
        }, {
          id: "CODE_NM",
          field: "CODE_NM",
          name: options.columnTitle[1],
          width: 150
        }],
        onSelect: onPopupSelect,
        onCancel: onPopupCancel
      };

      setTimeout(function() {
        $NC.G_MAIN.showCommonPopup(requestData);
      }, 300);
    };

    

    /**
     * 정산 상품 정보 검색
     * 
     * @param options
     *          queryId: 쿼리ID, 미지정시 기본 쿼리ID<br>
     *          queryParams: 쿼리 파라메터<br>
     *          showErrorMessage: 미지정 또는 true 시 검색 결과가 없을 시 오류 표시<br>
     *          errorMessage: 오류 메시지, 미지정시 기본 오류메시지
     * @returns
     */
    $NP.getItem_LfInfo = function(options) {

      if ($NC.isNull(options)) {
        return [ ];
      }

      if ($NC.isNull(options.queryId)) {
        options.queryId = "WC.POP_ADJUST_PRICE_CD";
      }
      if ($NC.isNull(options.showErrorMessage)) {
        options.showErrorMessage = true;
      }
      if (options.showErrorMessage) {
        if ($NC.isNull(options.errorMessage)) {
          options.errorMessage = "등록되어 있지 않은 상품입니다.";
        }
      }

      return getCommonDataSet(options) || [ ];
    };
    // -------------------------------------------------------------------------------------------------
    // Private Function
    // TODO: Private Function
    // -------------------------------------------------------------------------------------------------
    function getCommonDataSet(options) {

      var resultData;

      var requestData = {
        P_QUERY_ID: options.queryId
      };
      if (!$NC.isNull(options.queryParams)) {
        requestData.P_QUERY_PARAMS = $NC.getParams(options.queryParams);
      }
      $NC.serviceCallAndWait("/WC/getDataSet.do", requestData, function(ajaxData) {

        resultData = $NC.toArray(ajaxData);
        if (resultData && resultData.length == 0 && options.showErrorMessage) {
          alert(options.errorMessage);
        }
      });

      return resultData || [ ];
    }

  }

})(jQuery);
