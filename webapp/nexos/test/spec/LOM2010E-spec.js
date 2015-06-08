describe('LOM2010E.js 출고작업', function(){
	it('초기화', function(){
		//console.log($NC)
		expect( typeof $NC ).toBe('object');
		expect( $NC.G_VAR.policyVal.LO190 ).toBe('');
		expect( $NC.G_VAR.policyVal.LO210 ).toBe('');
		expect( $NC.G_VAR.policyVal.LO221 ).toBe('NN');
		expect( $NC.G_VAR.policyVal.LO410 ).toBe('');
		expect( $NC.G_VAR.policyVal.LO510 ).toBe('');
	})

	describe('데이터 조회 _Inquiry', function(){
		var gVal = {}

		beforeEach(function(){
			window.alert = function(msg){
				console.warn('alert: ', msg)
			}
			$NC.setValue = function(key, value){
				gVal[key] = value
			}
			$NC.getValue = function(key){
				return gVal[key]
			}
			G_GRDMASTERB = '';
			G_GRDMASTERBT = '';
			G_GRDMASTERC = '';
			G_GRDMASTERD = '';
			G_GRDMASTERE = '';
			$NC.G_VAR = {}
			$NC.G_VAR.activeView = {}
			$NC.G_USERINFO = {
				USER_ID: 'WMS7'
			}
			$NC.setFocus = function(){}
			$NC.setInitGridData = function(){}
			$NC.setGridDisplayRows = function(){}
			$NC.setInitGridData = function(){}
			$NC.setGridDisplayRows = function(){}

			spyOn($, 'ajax').and.callFake(function (req) {
				req.success({}, '', {status:''});
				req.complete();  
			});
		})

		it('물류센터를 선택해야 한다.', function(){
			expect( _Inquiry() ).toBe();
		})
		it('사업구분 코드를 입력해야 한다.', function(){
			$NC.setValue('#cboQCenter_Cd', 'G1');
			expect( _Inquiry() ).toBe();
		})
		it('출고일자를 입력하십시오.', function(){
			$NC.setValue('#edtQBu_Cd', '2015-03-14');
			expect( _Inquiry() ).toBe();
		})
		it('출고예정 검색 시작일자를 입력하십시오.', function(){
			$NC.setValue('#dtpQOutbound_Date', '2015-03-18');
			expect( _Inquiry() ).toBe();
		})
		it('출고예정 검색 종료일자를 입력하십시오.', function(){
			$NC.setValue('#dtpQOrder_Date1', '2015-03-18');
			expect( _Inquiry() ).toBe();
		})
		it('출고구분을 선택하십시오.', function(){
			$NC.setValue('#dtpQOrder_Date2', '2015-03-18');
			expect( _Inquiry() ).toBe();
		})
		it('출고구분을 선택하십시오.', function(){
			$NC.setValue('#cboQInout_Cd', '%');
			expect( _Inquiry() ).toBe();
		})
		it('출고등록 callback 호출', function(){
			onGetMasterB = jasmine.createSpy();
			$NC.G_VAR.activeView.PROCESS_CD = 'B'
			_Inquiry();
			expect( onGetMasterB ).toHaveBeenCalled();
		})
		it('출고등록(일괄) callback 호출', function(){
			onGetMasterBT = jasmine.createSpy();
			$NC.G_VAR.activeView.PROCESS_CD = 'BT'
			_Inquiry();
			expect( onGetMasterBT ).toHaveBeenCalled();
		})
		it('출고지시 callback 호출', function(){
			onGetMasterC = jasmine.createSpy();
			$NC.G_VAR.activeView.PROCESS_CD = 'C'
			_Inquiry();
			expect( onGetMasterC ).toHaveBeenCalled();
		})
		it('출고확정 callback 호출', function(){
			onGetMasterD = jasmine.createSpy();
			$NC.G_VAR.activeView.PROCESS_CD = 'D'
			_Inquiry();
			expect( onGetMasterD ).toHaveBeenCalled();
		})
		it('배송완료 callback 호출', function(){
			onGetMasterE = jasmine.createSpy();
			$NC.G_VAR.activeView.PROCESS_CD = 'E'
			_Inquiry();
			expect( onGetMasterE ).toHaveBeenCalled();
		})
	})
})













































