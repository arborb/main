describe('LOM7090E.js 출고작업', function(){
	beforeEach(function(){
		$NC.G_USERINFO = {
			USER_ID: 'WMS7'
		}
		$NC.G_VAR.stateFWBW = {
			A: {
				CANCEL: '10',
				CONFIRM: null
			},
			B: {
				CANCEL: '20',
				CONFIRM: '10'
			},
			C: {
				CANCEL: '30',
				CONFIRM: '20'
			},
			D: {
				CANCEL: '40',
				CONFIRM: '30'
			},
			E: {
				CANCEL: '50',
				CONFIRM: '40'
			},
		}
		$NC.G_VAR.buttons = {}
	})

	it('전역변수 초기화', function(){
		spyOn($, 'ajax').and.callFake(function(){ return })
		_Initialize()

		expect( typeof $NC ).toBe('object');
		expect( $NC.G_VAR.policyVal.LO220 ).toBe('');
		expect( $NC.G_VAR.activeView.container ).toBe('');
		expect( $NC.G_VAR.activeView.PROCESS_CD ).toBe('');
		expect( $NC.G_VAR.activeView.container ).toBe('');
		expect( $NC.G_VAR.stateFWBW.A.CONFIRM ).toBe('');
		expect( $NC.G_VAR.stateFWBW.A.CANCEL ).toBe('');
		expect( $NC.G_VAR.stateFWBW.B.CONFIRM ).toBe('');
		expect( $NC.G_VAR.stateFWBW.B.CANCEL ).toBe('');
		expect( $NC.G_VAR.stateFWBW.C.CONFIRM ).toBe('');
		expect( $NC.G_VAR.stateFWBW.C.CANCEL ).toBe('');
		expect( $NC.G_VAR.stateFWBW.D.CONFIRM ).toBe('');
		expect( $NC.G_VAR.stateFWBW.D.CANCEL ).toBe('');
		expect( $NC.G_VAR.stateFWBW.E.CONFIRM ).toBe('');
		expect( $NC.G_VAR.stateFWBW.E.CANCEL ).toBe('');
	})
	it('탭 초기화', function(){
		var tabId = $("#divTabView").tabs("option", "active")
		expect(tabId).toBe(0);
	})

	describe('SP데이터를 받아와서 콜백을 호출한다.', function(){
		beforeEach(function(){
			searchValidataion = function() {
				return true;
			}
		})
		it('T1Master 버튼 검증', function(){
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				onGetT1Master();
			})
			getDataT1Master();
   			expect($NC.G_VAR.buttons._inquiry).toBe('1');
   			expect($NC.G_VAR.buttons._new).toBe('0');
   			expect($NC.G_VAR.buttons._save).toBe('0');
   			expect($NC.G_VAR.buttons._cancel).toBe('0');
   			expect($NC.G_VAR.buttons._delete).toBe('0');
   			expect($NC.G_VAR.buttons._excel).toBe('1');
   			expect($NC.G_VAR.buttons._print).toBe('0');
		})
		it('T1Master callback 호출함', function(){
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				onGetT1Master();
			})
			onGetT1Master = jasmine.createSpy('onGetT1Master');
			getDataT1Master();
   			expect(onGetT1Master).toHaveBeenCalled();
		})
		it('T1Detail', function(){
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				T1Detail();
			})
			T1Detail = jasmine.createSpy('T1Detail');
			getDataT1Master();
   			expect(T1Detail).toHaveBeenCalled();
		})
		it('T1Sub', function(){
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				T1Sub();
			})
			T1Sub = jasmine.createSpy('T1Sub');
			getDataT1Master();
   			expect(T1Sub).toHaveBeenCalled();
		})
		it('T2Master 버튼 검증', function(){
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				onGetT2Master();
			})
			getDataT2Master();
   			expect($NC.G_VAR.buttons._inquiry).toBe('1');
   			expect($NC.G_VAR.buttons._new).toBe('0');
   			expect($NC.G_VAR.buttons._save).toBe('0');
   			expect($NC.G_VAR.buttons._cancel).toBe('0');
   			expect($NC.G_VAR.buttons._delete).toBe('0');
   			expect($NC.G_VAR.buttons._excel).toBe('1');
   			expect($NC.G_VAR.buttons._print).toBe('0');
		})
		it('T2Master callback 호출함', function(){
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				onGetT2Master();
			})
			onGetT2Master = jasmine.createSpy('onGetT2Master');
			getDataT2Master();
   			expect(onGetT2Master).toHaveBeenCalled();
		})
		it('T2Detail', function(){
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				T2Detail();
			})
			T2Detail = jasmine.createSpy('T2Detail');
			getDataT2Master();
   			expect(T2Detail).toHaveBeenCalled();
		})
		it('T2Sub', function(){
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				T2Sub();
			})
			T2Sub = jasmine.createSpy('T2Sub');
			getDataT2Master();
   			expect(T2Sub).toHaveBeenCalled();
		})
		it('T3Master 버튼 검증', function(){
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				onGetT3Master();
			})
			getDataT3Master();
   			expect($NC.G_VAR.buttons._inquiry).toBe('1');
   			expect($NC.G_VAR.buttons._new).toBe('0');
   			expect($NC.G_VAR.buttons._save).toBe('0');
   			expect($NC.G_VAR.buttons._cancel).toBe('0');
   			expect($NC.G_VAR.buttons._delete).toBe('0');
   			expect($NC.G_VAR.buttons._excel).toBe('1');
   			expect($NC.G_VAR.buttons._print).toBe('0');
		})
		it('T3Master callback 호출함', function(){
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				onGetT3Master();
			})
			onGetT3Master = jasmine.createSpy('onGetT3Master');
			getDataT3Master();
   			expect(onGetT3Master).toHaveBeenCalled();
		})
		it('T3Detail', function(){
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				T3Detail();
			})
			T3Detail = jasmine.createSpy('T3Detail');
			getDataT3Master();
   			expect(T3Detail).toHaveBeenCalled();
		})
		it('T3Sub', function(){
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				T3Sub();
			})
			T3Sub = jasmine.createSpy('T3Sub');
			getDataT3Master();
   			expect(T3Sub).toHaveBeenCalled();
		})
	})

	describe('T1 확정/취소', function(){
		beforeEach(function(){
			G_GRDT1DETAIL = {
				data: {
					getLength: function(){
						return 0;
					},
					getItem: function(){
						return {}
					}
				}
			}
		})
		it('선택한 데이터가 없음', function(){
			expect( onProcessNxtA() ).toBe()
		})
		it('확정 정책 설정', function(){
			G_GRDT1DETAIL.data.getLength = function(){ return 1 }
			G_GRDT1DETAIL.data.getItem = function(){
				return { CHECK_YN: "Y" }
			}
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				onSaveT1Confirm();
			})
			onSaveT1Confirm = jasmine.createSpy('onSaveT1Confirm');
			onProcessNxtA();

			expect(onSaveT1Confirm).toHaveBeenCalled();
			expect( $NC.G_VAR.activeView.container ).toBe('#divT1DetailView')
			expect( $NC.G_VAR.activeView.PROCESS_CD ).toBe('B')
			expect( $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM ).toBe('10')
			expect( $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL ).toBe('20')
		})
	})
	describe('T2 확정/취소', function(){
		beforeEach(function(){
			G_GRDT2DETAIL = {
				data: {
					getLength: function(){
						return 0;
					},
					getItem: function(){
						return {}
					}
				}
			}
		})
		it('선택한 데이터가 없음', function(){
			expect( onProcessNxtB() ).toBe()
			expect( onProcessPreB() ).toBe()
		})
		it('확정 정책 설정', function(){
			G_GRDT2DETAIL.data.getLength = function(){ return 1 }
			G_GRDT2DETAIL.data.getItem = function(){
				return { CHECK_YN: "Y" }
			}
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				onSaveT2Confirm();
			})
			onSaveT2Confirm = jasmine.createSpy('onSaveT2Confirm');
			onProcessNxtB()

			expect(onSaveT2Confirm).toHaveBeenCalled();
			expect( $NC.G_VAR.activeView.container ).toBe('#divT2DetailView')
			expect( $NC.G_VAR.activeView.PROCESS_CD ).toBe('C')
			expect( $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM ).toBe('20')
			expect( $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL ).toBe('30')
		})
		it('취소 정책 설정', function(){
			G_GRDT2DETAIL.data.getLength = function(){ return 1 }
			G_GRDT2DETAIL.data.getItem = function(){
				return { CHECK_YN: "Y" }
			}
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				onSaveT2Cancel();
			})
			onSaveT2Cancel = jasmine.createSpy('onSaveT2Cancel');
			onProcessPreB()

			expect(onSaveT2Cancel).toHaveBeenCalled();
			expect( $NC.G_VAR.activeView.container ).toBe('#divT2DetailView')
			expect( $NC.G_VAR.activeView.PROCESS_CD ).toBe('B')
			expect( $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM ).toBe('10')
			expect( $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL ).toBe('20')
		})
	})
	describe('T3 확정/취소', function(){
		beforeEach(function(){
			G_GRDT3DETAIL = {
				data: {
					getLength: function(){
						return 0;
					},
					getItem: function(){
						return {}
					}
				}
			}
		})
		it('선택한 데이터가 없음', function(){
			expect( onProcessPreC() ).toBe()
		})
		it('취소 정책 설정', function(){
			G_GRDT3DETAIL.data.getLength = function(){ return 1 }
			G_GRDT3DETAIL.data.getItem = function(){
				return { CHECK_YN: "Y" }
			}
			spyOn($NC, 'serviceCall').and.callFake(function(url, data, success, error, option){
				onSaveT3Cancel();
			})
			onSaveT3Cancel = jasmine.createSpy('onSaveT3Cancel');
			onProcessPreC()
			
			expect(onSaveT3Cancel).toHaveBeenCalled();
			expect( $NC.G_VAR.activeView.container ).toBe('#divT3DetailView')
			expect( $NC.G_VAR.activeView.PROCESS_CD ).toBe('C')
			expect( $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CONFIRM ).toBe('20')
			expect( $NC.G_VAR.stateFWBW[$NC.G_VAR.activeView.PROCESS_CD].CANCEL ).toBe('30')
		})
	})

	
})













































