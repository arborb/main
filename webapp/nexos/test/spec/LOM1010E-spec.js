describe('출고예정작업 LOM1010E.js', function(){
	it('초기화', function(){
		//console.log($NC)
		expect( typeof $NC ).toBe('object');
		expect( $NC.G_VAR.policyVal.LO190 ).toBe('');
		expect( $NC.G_VAR.policyVal.LO110 ).toBe('');
		expect( $NC.G_VAR.policyVal.LO250 ).toBe('');
	})

	describe('데이터 조회 _Inquiry', function(){
		var gVal = {}

		beforeEach(function(){
			window.alert = function(msg){
				console.error('alert: ', msg)
			}
			$NC.setValue = function(key, value){
				gVal[key] = value
			}
			$NC.getValue = function(key){
				return gVal[key]
			}
			G_GRDMASTER = '';
			G_GRDDETAIL = '';
			$NC.G_USERINFO = {
				USER_ID: 'WMS7'
			}
			$NC.setFocus = function(){}
			$NC.setInitGridData = function(){}
			$NC.setGridDisplayRows = function(){}
			$NC.setInitGridData = function(){}
			$NC.setGridDisplayRows = function(){}
		})

		it('물류센터를 선택해야 한다.', function(){
			expect( _Inquiry() ).toBe();
		})
		it('사업구분 코드를 입력해야 한다.', function(){
			$NC.setValue('#cboQCenter_Cd', 'G1');
			expect( _Inquiry() ).toBe();
		})
		it('검색 시작일자를 입력해야 한다.', function(){
			$NC.setValue('#edtQBu_Cd', '5000');
			expect( _Inquiry() ).toBe();
		})
		it('검색 종료일자를 입력해야 한다.', function(){
			$NC.setValue('#dtpQOrder_Date1', '2015-03-14');
			expect( _Inquiry() ).toBe();
		})
		it('출고예정일자 범위 입력오류', function(){
			$NC.setValue('#dtpQOrder_Date2', '2015-03-18');
			expect( _Inquiry() ).toBe();
		})
		it('데이터 조회 callback 호출', function(){
			spyOn($, 'ajax').and.callFake(function (req) {
				req.success({}, '', {status:''});
				req.complete();  
			});
			onGetMaster = jasmine.createSpy();
			$NC.setValue('#dtpQOrder_Date2', '2015-03-18');
			_Inquiry();
			expect( onGetMaster ).toHaveBeenCalled();
		})
	})
})














































