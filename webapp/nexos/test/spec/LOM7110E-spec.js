describe('LOM7110E.js 피킹검수(신규)', function(){
	beforeEach(function(){
		$NC.G_USERINFO = {
			USER_ID: 'WMS7'
		}
		$NC.G_JWINDOW = {
			set: function(){},
			get: function(){},
			maximise: function(){}
		}
		$NC.G_CONSTS.SCAN_BOX      = 0;  //0. 용기스캔
		$NC.G_CONSTS.SCAN_LABEL    = 1;  //1. 라벨스캔
		$NC.G_CONSTS.SCAN_PRODUCT  = 2;  //2. 상품바코드
		$NC.G_CONSTS.SCAN_QUANTITY = 3;  //3. 수량입력
		$NC.G_CONSTS.SCAN_ERROR    = 4;  //4. 오류
		$NC.G_VAR.buttons = {};
		$NC.setValue("#cboQCenter_Cd", "G1");
		$NC.setValue("#edtQBu_Cd", "5000");
		$NC.setValue("#dtpQOutbound_Date", "2015-03-19");
	})

	it('전역변수 초기화', function(){
		spyOn($, 'ajax').and.callFake(function(){ return })
		_Initialize();
		expect( typeof $NC ).toBe('object');
	})
	
	it('용기스캔 키보드 이벤트', function(){
		spyOn($NC, 'serviceCallAndWait').and.callFake(function(url, data, success, error, option){
			onGetItemInfo();
		})
		var onGetItemInfo = jasmine.createSpy('onGetItemInfo')
			,e = $.Event("keyup", { keyCode: 13 })
			,view = $('#edtBoxScan');
		$('#edtBoxScan').val('123');
		_OnInputKeyUp(e, view)
		expect( onGetItemInfo ).toHaveBeenCalled();
	})
	it('용기스캔 코드 형식 검증', function(){
		expect( validateBoxScanCode('1234567') ).toBe( $NC.G_CONSTS.SCAN_BOX );
		expect( validateBoxScanCode('12345678') ).toBe( $NC.G_CONSTS.SCAN_ERROR );
	})
	it('라벨스캔 코드 형식 검증', function(){
		expect( validateLabelScanCode('123456') ).toBe( $NC.G_CONSTS.SCAN_QUANTITY );
		expect( validateLabelScanCode('1234567') ).toBe( $NC.G_CONSTS.SCAN_PRODUCT );
		expect( validateLabelScanCode('OPG1-121212') ).toBe( $NC.G_CONSTS.SCAN_LABEL );
	})
	it('라벨코드값을 파싱한다.', function(){
		expect( getLabelCode('OPasdfasfd') ).toBe( false );
		var scanLabel = getLabelCode('OPG1-5000-20150513-10006')
		expect( scanLabel.center ).toBe( 'G1' );
		expect( scanLabel.bu ).toBe( '5000' );
		expect( scanLabel.outboundDate ).toBe( '2015-05-13' );
		expect( scanLabel.pickSeq ).toBe( '10006' );
	})
	it('라벨스캔 키보드 이벤트', function(){
		spyOn($NC, 'serviceCallAndWait').and.callFake(function(url, data, success, error, option){
			onGetLabelInfo();
		})
		var onGetLabelInfo = jasmine.createSpy('onGetLabelInfo')
			,e = $.Event("keyup", { keyCode: 13 })
			,view = $('#edtLabelScan');
		$('#edtLabelScan').val('OPG1-5000-20150319-10001');
		_OnInputKeyUp(e, view)
		expect( onGetLabelInfo ).toHaveBeenCalled();
	})
	it('스캔포인트 포커스', function(){
		$NC.setValue("#edtBox_No")
		expect( setFocusScan() ).toBe(false);
		expect( setFocusScan('edtBoxScan') ).toBe(false);
		$NC.setValue("#edtBox_No", '12345')
		expect( setFocusScan() ).toBe();
	})
	it('스캔포인트 포커스', function(){
		var rowData = {CANCEL_YN: "Y"};
		setItemInfoValue(rowData);
		expect( $('#btnBoxCancel').hasClass('disabled') ).toBe(false);

		var rowData = {CANCEL_YN: "N"};
		setItemInfoValue(rowData);
		expect( $('#btnBoxCancel').hasClass('disabled') ).toBe(true);
	})
	it('기존 그리드에 라벨번호가 중복되는 데이터가 있는지 체크', function(){
		var newSeq = '1000'
			,oldRow = [
				{'PICK_SEQ': '1000'},
				{'PICK_SEQ': '1001'}
			]
		var isLabel = isLabelNoInGrid(newSeq, oldRow)
		newSeq = '1002'
		var isLabel = isLabelNoInGrid(newSeq, oldRow)
		expect(isLabel).toBe(true)
	})
})













































