describe('LOM7030E.js 출고대물검수', function(){
	beforeEach(function(){
		$NC.G_USERINFO = {
			USER_ID: 'WMS7'
		}
		$NC.G_JWINDOW = {
			set: function(){},
			get: function(){},
			maximise: function(){}
		}
		$NC.G_CONSTS.SCAN_TOTAL    = 0;  //0. 토탈피킹
		$NC.G_CONSTS.SCAN_PICKING  = 1;  //1. 피킹라벨
		$NC.G_CONSTS.SCAN_BOX      = 2;  //2. 용기번호
		$NC.G_CONSTS.SCAN_PRODUCT  = 3;  //3. 상품코드
		$NC.G_CONSTS.SCAN_QUANTITY = 4;  //4. 수량입력
		$NC.G_CONSTS.SCAN_ERROR    = 5;  //5. 오류
		
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

	it('스캔 타입 체크 - 토탈피킹라벨', function(){
		var scanVal = 'TPG1-5000-20150525-001-10005969';
		expect( scanValueType(scanVal) ).toBe($NC.G_CONSTS.SCAN_TOTAL);
	})
	it('스캔 타입 체크 - 피킹라벨', function(){
		var scanVal = 'OPG1-5000-20150507-10001';
		expect( scanValueType(scanVal) ).toBe($NC.G_CONSTS.SCAN_PICKING);
	})
	it('스캔 타입 체크 - 용기번호', function(){
		var scanVal = 'YB0001';
		expect( scanValueType(scanVal) ).toBe($NC.G_CONSTS.SCAN_BOX);
	})
	it('스캔 타입 체크 - 상품코드', function(){
		var scanVal = '1000666';
		expect( scanValueType(scanVal) ).toBe($NC.G_CONSTS.SCAN_PRODUCT);
		var scanVal = '10006662';
		expect( scanValueType(scanVal) ).toBe($NC.G_CONSTS.SCAN_PRODUCT);
	})
	it('스캔 타입 체크 - 상품바코드', function(){
		var scanVal = '887350132953';
		expect( scanValueType(scanVal) ).toBe($NC.G_CONSTS.SCAN_PRODUCT);
		var scanVal = '111312953';
		expect( scanValueType(scanVal) ).toBe($NC.G_CONSTS.SCAN_PRODUCT);
	})
	it('스캔 타입 체크 - 수량입력', function(){
		var scanVal = '121212';
		expect( scanValueType(scanVal) ).toBe($NC.G_CONSTS.SCAN_QUANTITY);
		var scanVal = '12';
		expect( scanValueType(scanVal) ).toBe($NC.G_CONSTS.SCAN_QUANTITY);
	})
	it('스캔 타입 체크 - 오류', function(){
		var scanVal = 'asd';
		expect( scanValueType(scanVal) ).toBe($NC.G_CONSTS.SCAN_ERROR);
		var scanVal = '';
		expect( scanValueType(scanVal) ).toBe($NC.G_CONSTS.SCAN_ERROR);
	})
})













































