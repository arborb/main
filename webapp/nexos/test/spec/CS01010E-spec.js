describe('CS01010E.js 사용자관리 비밀번호 변경 로직 테스트', function(){
	beforeEach(function(){
		// 로그인 사용자
		$NC.G_USERINFO = {
			USER_ID: 'WMS7',
			USER_NM: 'WMS7',
			USER_PWD: 'ENC(88e)'
		}
		$NC.G_USERINFO2 = {}
	})

	it('전역변수 초기화', function(){
		expect( typeof $NC ).toBe('object');
		expect( $NC.G_USERINFO.USER_ID ).toBe('WMS7');
	})
	
	describe('사용자 정보', function(){
		G_GRDMASTER = {
			lastRow: null,
			data: {
				getLength: function(){
					return 0;
				},
				// 선택한 사용자
				getItem: function(){
					return {
						CRUD: 'U',
						USER_ID: 'WMS7',
						USER_NM: '위메프',
						USER_PWD: 'ENC(88e)'
					}
				}
			}
		}
		G_GRDDETAIL1 = G_GRDMASTER;
		
		beforeEach(function(){
			$NC.G_VAR.isPasswordChanged = null;
		})
		it('저장할 데이터가 없을경우', function(){
			expect(_Save()).toBe();
			G_GRDMASTER.lastRow = 10;
			expect(_Save()).toBe();

			G_GRDMASTER.lastRow = 50
			G_GRDMASTER.data.getLength = function(){return 50}
		})
		it('비밀번호를 변경하지 않았음', function(){
			expect(_Save()).toBe();
		})
		describe('비밀번호를 변경하였음', function(){
			beforeEach(function(){
				$NC.G_VAR.isPasswordChanged = true;
				$NC.G_USERINFO2 = {
					USER_ID: 'WMS7',
					USER_NM: 'WMS7',
					USER_PWD: '?1'
				}
			})
			it('비밀번호는 최소 8자리 이상이어야 한다.', function(){
				G_GRDMASTER.data.getItem = function(){
					return {
						USER_ID: 'WMS7',
						USER_NM: '위메프',
						USER_PWD: '?1'
					}
				}
				expect(_Save()).toBe(false);
			})
			it('비밀번호에 ID 또는 이름을 포함할 수 없습니다.', function(){
				G_GRDMASTER.data.getItem = function(){
					return {
						USER_ID: 'WMS7',
						USER_NM: '위메프',
						USER_PWD: 'WMS712zcb'
					}
				}
				expect(_Save()).toBe(false);
			})
			it('2가지 조합시 10자 이상이어야 한다.', function(){
				G_GRDMASTER.data.getItem = function(){
					return {
						USER_ID: 'WMS7',
						USER_NM: '위메프',
						USER_PWD: 'q1w2e3r4t'
					}
				}
				expect(_Save()).toBe(false);
			})
			it('3가지 조합시 8자 이상이어야 한다.', function(){
				G_GRDMASTER.data.getItem = function(){
					return {
						USER_ID: 'WMS7',
						USER_NM: '위메프',
						USER_PWD: 'q1w2er#'
					}
				}
				expect(_Save()).toBe(false);
			})
			it('연속된 숫자 사용금지', function(){
				G_GRDMASTER.data.getItem = function(){
					return {
						USER_ID: 'WMS7',
						USER_NM: '위메프',
						USER_PWD: 'abwms1234'
					}
				}
				expect(_Save()).toBe(false);
				G_GRDMASTER.data.getItem = function(){
					return {
						USER_ID: 'WMS7',
						USER_NM: '위메프',
						USER_PWD: 'abwms4321'
					}
				}
				expect(_Save()).toBe(false);
			})
			it('연속된 알파벳 사용금지', function(){
				G_GRDMASTER.data.getItem = function(){
					return {
						USER_ID: 'WMS7',
						USER_NM: '위메프',
						USER_PWD: 'abwmsabcd'
					}
				}
				expect(_Save()).toBe(false);
				G_GRDMASTER.data.getItem = function(){
					return {
						USER_ID: 'WMS7',
						USER_NM: '위메프',
						USER_PWD: 'abwmsdcba'
					}
				}
				expect(_Save()).toBe(false);
			})
			it('개발모드일때 비밀번호 검증하지 않음', function(){
				devMode = true;
				G_GRDMASTER.data.getItem = function(){
					return {
						USER_ID: 'WMS7',
						USER_NM: '위메프',
						USER_PWD: '?1'
					}
				}
				expect(_Save()).toBe();
			})
		})
	})
})













































