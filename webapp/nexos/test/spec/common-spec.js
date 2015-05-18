
describe('common.js', function(){
	var onSuccess = function(res){ console.log('onSucess', res) }
	var onError = function(res){ console.log('onError', res) }
	it('$NC 객체 초기화', function(){
		//console.log($NC)
		expect( typeof $NC ).toBe('object');
		expect( $NC.G_USERINFO ).toBeNull();
		//localStorage.setItem('_MOCK', true);
	})

	describe('가상 Ajax 설정', function(){
		beforeEach(function(){
			spyOn($, 'ajax').and.callFake(function (req) {
				//console.info('서비스 호출')
				req.success({}, '', {status:''});
				req.complete();
				return true
			});
		})
		it('비동기 통신: mockId가 있으면 가상데이터를 반환한다.', function(){
			$NC.serviceCall("/WC/getSessionUserInfo.do", null, onSuccess, onError, {}, '7090E_RS_T1_MASTER');
			
			
			expect().toBe();
		})
		xit('비동기 통신: mockId가 있으면 가상데이터를 반환한다.', function(){
			$NC.serviceCall("/WC/getSessionUserInfo.do", null, onSuccess, onError, {}, 'commonGetSessionUserInfo');
			
			var data = {P_QUERY_ID:'WC.GET_CSMSG'}
			$NC.serviceCall('/WC/getDataSet.do', data, onSuccess, onError, {}, 'wcGetCsMsg');
			
			var data = {P_QUERY_ID:'WC.POP_CSNOTICE'}
			$NC.serviceCall('/WC/getDataSet.do', data, onSuccess, onError, {}, 'wcPopCsNotice');
			expect().toBe();
		})
		xit('동기 통신: mockId가 있으면 가상데이터를 반환한다.', function(){
			$NC.serviceCallAndWait("/WC/getSessionUserInfo.do", null, onSuccess, onError, {}, 'commonGetSessionUserInfo');
			
			var data = {P_QUERY_ID:'WC.GET_CSMSG'}
			$NC.serviceCallAndWait('/WC/getDataSet.do', data, onSuccess, onError, {}, 'wcGetCsMsg');
			
			var data = {P_QUERY_ID:'WC.POP_CSNOTICE'}
			$NC.serviceCallAndWait('/WC/getDataSet.do', data, onSuccess, onError, {}, 'wcPopCsNotice');
			expect().toBe();
		})
		xit('비동기 통신: mockId가 없으면 실데이터를 반환한다.', function(){
			$NC.serviceCall("/WC/getSessionUserInfo.do", null, onSuccess, onError, {});
			expect().toBe();
		})
		xit('동기 통신: mockId가 없으면 실데이터를 반환한다.', function(){
			$NC.serviceCallAndWait("/WC/getSessionUserInfo.do", null, onSuccess, onError, {});
			expect().toBe();
		})
	})

	describe('비밀번호 정책: $NC.varidationPw()', function(){
		var userInfo
		beforeEach(function(){
			userInfo = {
				USER_ID: 'WMS7',
				USER_NM: 'WMS7'
			}
			window.alert = function(){}
		})
		it('비밀번호에 ID를 포함할수 없음', function(){
			var pwObj = $NC.varidationPw('awms7', userInfo)
			expect( pwObj ).toBeFalsy();
		})
		it('비밀번호는 8글자 이상이어야 함', function(){
			var pwObj = $NC.varidationPw('qwer123', userInfo)
			expect( pwObj ).toBeFalsy();
		})
		it('대문자, 소문자, 숫자, 특수문자조합이 2이면 10자리보다 많아야 한다.', function(){
			var pwObj = $NC.varidationPw('qwer12efs', userInfo)
			expect( pwObj ).toBeFalsy();
		})
		it('대문자, 소문자, 숫자, 특수문자조합이 3이면 8자리보다 많아야 한다.', function(){
			var pwObj = $NC.varidationPw('qwer#13', userInfo)
			expect( pwObj ).toBeFalsy();
		})
		it('동일숫자/문자 4개이상 사용불가', function(){
			var pwObj = $NC.varidationPw('qwerasdf1234', userInfo)
			expect( pwObj ).toBeFalsy();
			var pwObj = $NC.varidationPw('qwerasdf4321', userInfo)
			expect( pwObj ).toBeFalsy();
			var pwObj = $NC.varidationPw('qwerasdfabcd', userInfo)
			expect( pwObj ).toBeFalsy();
			var pwObj = $NC.varidationPw('qwerasdfdcba', userInfo)
			expect( pwObj ).toBeFalsy();
		})
		it('비밀번호 통과함', function(){
			var pwObj = $NC.varidationPw('q1w2e3r4t5y6', userInfo)
			expect( pwObj ).toBeTruthy();
		})
	})

	describe('날짜 비교값 리턴: $NC.getDiffDate', function(){
		beforeEach(function(){
			
		})
		it('현재시간과 초를 비교한다.', function(){
			var addTime = moment().add(50, 's').format('YYYY-MM-DD HH:mm:ss')
			var subTime = moment().subtract(50, 's').format('YYYY-MM-DD HH:mm:ss')
			expect( $NC.getDiffDate(addTime, 'sec') ).toBe(49)
			expect( $NC.getDiffDate(subTime, 'sec') ).toBe(-51)
		})
		it('현재시간과 분를 비교한다.', function(){
			var addTime = moment().add(50, 'm').format('YYYY-MM-DD HH:mm:ss')
			var subTime = moment().subtract(50, 'm').format('YYYY-MM-DD HH:mm:ss')
			expect( $NC.getDiffDate(addTime, 'min') ).toBe(49)
			expect( $NC.getDiffDate(subTime, 'min') ).toBe(-51)
		})
		it('현재시간과 시를 비교한다.', function(){
			var addTime = moment().add(50, 'h').format('YYYY-MM-DD HH:mm:ss')
			var subTime = moment().subtract(50, 'h').format('YYYY-MM-DD HH:mm:ss')
			expect( $NC.getDiffDate(addTime, 'hour') ).toBe(49)
			expect( $NC.getDiffDate(subTime, 'hour') ).toBe(-51)
		})
		it('현재시간과 날짜를 비교한다.', function(){
			var addTime = moment().add(50, 'd').format('YYYY-MM-DD HH:mm:ss')
			var subTime = moment().subtract(50, 'd').format('YYYY-MM-DD HH:mm:ss')
			expect( $NC.getDiffDate(addTime, 'day') ).toBe(49)
			expect( $NC.getDiffDate(subTime, 'day') ).toBe(-51)
		})
		it('현재시간과 월을 비교한다.', function(){
			var addTime = moment().add(50, 'M').format('YYYY-MM-DD HH:mm:ss')
			var subTime = moment().subtract(50, 'M').format('YYYY-MM-DD HH:mm:ss')
			expect( $NC.getDiffDate(addTime, 'month') ).toBe(50)
			expect( $NC.getDiffDate(subTime, 'month') ).toBe(-51)
		})
		it('현재시간과 년을 비교한다.', function(){
			var addTime = moment().add(50, 'y').format('YYYY-MM-DD HH:mm:ss')
			var subTime = moment().subtract(50, 'y').format('YYYY-MM-DD HH:mm:ss')
			expect( $NC.getDiffDate(addTime, 'year') ).toBe(50)
			expect( $NC.getDiffDate(subTime, 'year') ).toBe(-50)
		})
	})

	describe('Ajax', function(){
		onGetMaster = jasmine.createSpy();
		onError = jasmine.createSpy();
		
		beforeEach(function(){
			spyOn($, 'ajax').and.callFake(function (req) {
				//console.info('서비스 호출')
				req.success({}, '', {status:''});
				req.complete();
				return true
			});
		})
		xit('2중 호출 방지', function(){
			var param = {
				'queryId': '                 LOM7010E.RS_MASTER',
				'queryParams': {
					'P_BU_CD': '5000',
					'P_CENTER_CD': 'G1'
				}
			}
			var param1 = {
				'queryId': 'AAAAAAAAAAAAAAAAAAAAAAA'
			}
			$NC.serviceCall("/LOM7010E/getDataSet.do", param, onGetMaster, onError);
			$NC.serviceCall("/LOM7010E/getDataSet.do", param, onGetMaster, onError);
			$NC.serviceCall("/LOM7010E/getDataSet.do", param1, onGetMaster, onError);
			expect(onGetMaster).toHaveBeenCalled()
		})
	})
})








































