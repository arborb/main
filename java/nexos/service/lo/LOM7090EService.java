package nexos.service.lo;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.JsonDataSet;
import nexos.service.common.CommonDAO;
import nexos.service.ed.common.EDCommonService;

import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionStatus;
import org.springframework.transaction.support.DefaultTransactionDefinition;

/**
 * Class: LOM7090EService<br>
 * Description: 온라인출고스캔검수(LOM7010E) 서비스를 담당하는 Class(트랜잭션처리 담당)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 * 
 *          <pre style="font-family: NanumGothicCoding, GulimChe">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2013-01-01    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 * </pre>
 */
@Service("LOM7090E")
public class LOM7090EService {

	/**
	 * DAO 주입처리하기
	 */
	@Resource
	private LOM7090EDAO dao;

	@Resource
	private CommonDAO common;

	@Resource
	private PlatformTransactionManager transactionManager;

	@Resource
	private EDCommonService edCommonService;

  // 출고여부
  @SuppressWarnings("unchecked")
  public String Cksave(Map<String, Object> params) throws Exception {

    final String PROCEDURE_ID = "CMISPRINT_LO";

    String user_Id = (String)params.get(Consts.PK_USER_ID);
    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    // StringBuffer sbResult = new StringBuffer();
    final int dsCnt = saveDS.size();
    String result = Consts.ERROR;
    String oMsg = Consts.PK_O_MSG;
    TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
    try {
      for (int i = 0; i < dsCnt; i++) {

        // 저장 처리
        // 호출 파라메터
        Map<String, Object> callParams = saveDS.get(i);
        callParams.put(Consts.PK_USER_ID, user_Id);

        HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, callParams);
        oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        if (!Consts.OK.equals(oMsg)) {
          throw new RuntimeException(oMsg);
        }
      }
      result = Consts.OK;
      transactionManager.commit(ts);
    } catch (Exception e) {
      transactionManager.rollback(ts);
      throw new RuntimeException(e.getMessage());
    }
    return result;
  }
  
	 /**
   * 위메프 주문유형 변경 처리 프로시져 호출
   *
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  public String callOrderDiv(Map<String, Object> params) throws Exception {

    final String FW_PROCEDURE_ID = "LO_ORDER_DIV_UPDATE";

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    
    String order_Div = (String) params.get("P_ORDER_DIV");
    String process_Cd = (String) params.get("P_PROCESS_CD");
    
    // 전표 단위 Transaction
    final int dsCnt = saveDS.size();
    StringBuffer sbResult = new StringBuffer();
    TransactionDefinition td = new DefaultTransactionDefinition();
    for (int i = 0; i < dsCnt; i++) {

      // SP 호출 파라메터
      Map<String, Object> callParams = saveDS.get(i);

      callParams.put("P_ORDER_DIV", order_Div); // 전표단위
      callParams.put("P_PROCESS_CD", process_Cd);
      
      // LO_PROCESSING 호출11
      TransactionStatus ts = transactionManager.getTransaction(td);
      try {
        String oMsg;
        //String oErrMsg;
        HashMap<String, Object> mapResult;

        mapResult = callSP(FW_PROCEDURE_ID, callParams);

        oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        //oErrMsg = (String)mapResult.get("O_ERRMSG");

        // 오류면 Rollback
//        if (!Consts.OK.equals(oErrMsg)) {
//          sbResult.append(oErrMsg);
//          sbResult.append(Consts.CRLF);
//          // continue;
//        }

        // 오류면 Rollback
        if (!Consts.OK.equals(oMsg)) {
          transactionManager.rollback(ts);
          sbResult.append(oMsg);
          sbResult.append(Consts.CRLF);
          continue;
        }

        transactionManager.commit(ts);
      } catch (Exception e) {
        // SP 내에서 오류가 아니면 Exit
        transactionManager.rollback(ts);
        throw new RuntimeException(e.getMessage());
      }
    }
    if (sbResult.length() == 0) {
      sbResult.append(Consts.OK);
    }
    return sbResult.toString();
  }
  
  /**
   * 출고 부족재고 조정
   *
   * @param params
   * @return
   * @throws Exception
   */
  @SuppressWarnings("unchecked")
  public String callOrderAdjust(Map<String, Object> params) throws Exception {
    
    final String FW_PROCEDURE_ID = "LO_POLICY_ORDER_ADJUSTMENT_T3";
    
    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    
    // 전표 단위 Transaction
    final int dsCnt = saveDS.size();
    StringBuffer sbResult = new StringBuffer();
    TransactionDefinition td = new DefaultTransactionDefinition();
    for (int i = 0; i < dsCnt; i++) {
      
      // SP 호출 파라메터
      Map<String, Object> callParams = saveDS.get(i);
      
      // LO_PROCESSING 호출11
      TransactionStatus ts = transactionManager.getTransaction(td);
      try {
        String oMsg;
        //String oErrMsg;
        HashMap<String, Object> mapResult;
        
        mapResult = callSP(FW_PROCEDURE_ID, callParams);
        
        oMsg = (String)mapResult.get(Consts.PK_O_MSG);
        
        // 오류면 Rollback
        if (!Consts.OK.equals(oMsg)) {
          transactionManager.rollback(ts);
          sbResult.append(oMsg);
          sbResult.append(Consts.CRLF);
          continue;
        }
        
        transactionManager.commit(ts);
      } catch (Exception e) {
        // SP 내에서 오류가 아니면 Exit
        transactionManager.rollback(ts);
        throw new RuntimeException(e.getMessage());
      }
    }
    if (sbResult.length() == 0) {
      sbResult.append(Consts.OK);
    }
    return sbResult.toString();
  }
  
	/**
	 * 출고스캔검수-검수 취소
	 * 
	 * @param params
	 */
	@SuppressWarnings("rawtypes")
	public Map callBWScanConfirm(Map<String, Object> params) throws Exception {

		Map result;

		TransactionStatus ts = transactionManager
				.getTransaction(new DefaultTransactionDefinition());
		try {
			result = dao.callBWScanConfirm(params);
			String oMsg = (String) result.get(Consts.PK_O_MSG);
			// 오류면 Rollback
			if (!Consts.OK.equals(oMsg)) {
				throw new RuntimeException(oMsg);
			}
			transactionManager.commit(ts);
		} catch (Exception e) {
			transactionManager.rollback(ts);
			throw new RuntimeException(e.getMessage());
		}

		return result;
	}

	/**
	 * 출고스캔검수-검수 완료
	 * 
	 * @param params
	 */
	@SuppressWarnings("rawtypes")
	public Map callFWScanConfirm(Map<String, Object> params) throws Exception {

		Map result;

		TransactionStatus ts = transactionManager
				.getTransaction(new DefaultTransactionDefinition());
		try {
			result = dao.callFWScanConfirm(params);
			String oMsg = (String) result.get(Consts.PK_O_MSG);
			// 오류면 Rollback
			if (!Consts.OK.equals(oMsg)) {
				throw new RuntimeException(oMsg);
			}
			transactionManager.commit(ts);
		} catch (Exception e) {
			transactionManager.rollback(ts);
			throw new RuntimeException(e.getMessage());
		}

		return result;
	}

	/**
	 * LO_PROCESSING 호출
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public String callLOProcessing(Map<String, Object> params) throws Exception {

		final String PROCEDURE_ID = "LO_PROCESSING";
		final String ENTRY_PROCEDURE_ID = "LO_FW_ENTRY_PROCESSING";
		// 합포장 적용 SP 추가
		final String FW_DIRECTIONS_PROC = "LO_FW_DIRECTIONS_PICK_PROC";

		List<Map<String, Object>> saveDS = (List<Map<String, Object>>) params
				.get(Consts.PK_DS_MASTER);
		String process_Cd = (String) params.get("P_PROCESS_CD");
		String direction = (String) params.get("P_DIRECTION");
		String entry_Date = (String) params.get("P_ENTRY_DATE");
		String process_State_BW = (String) params.get("P_PROCESS_STATE_BW");
		String process_State_FW = (String) params.get("P_PROCESS_STATE_FW");
    
		String user_Id = (String) params.get(Consts.PK_USER_ID);
		String outbound_batch = null; // 출고차수
		String outbound_batch_nm = null; // 출고차수명
		String delivery_batch = null; // 배송차수

		// 처리할 수 있는 진행상태
		String CHECK_STATE = "";
		String CHECK_PROCESS_CD = Consts.PROCESS_ENTRY;
		// 처리
		if (Consts.DIRECTION_FW.equals(direction)) {
			CHECK_STATE = process_State_FW;
			if (Consts.PROCESS_ENTRY.equals(process_Cd) || Consts.PROCESS_ENTRY_T1.equals(process_Cd)) {
				CHECK_STATE = Consts.STATE_ORDER;
				CHECK_PROCESS_CD = Consts.PROCESS_ORDER;
			}
		} else {
			// 취소
			CHECK_STATE = process_State_BW;
		}

		HashMap<String, Object> checkParams = new HashMap<String, Object>();
		checkParams.put("P_LINE_NO", ""); // 전표단위
		checkParams.put("P_PROCESS_CD", CHECK_PROCESS_CD);
		checkParams.put("P_STATE_DIV", "1"); // 상태구분([1]MIN, [2]MAX)

		// LO_PROCESSING 호출
		// 전표 단위 Transaction
		final int dsCnt = saveDS.size();
		StringBuffer sbResult = new StringBuffer();
		TransactionDefinition td = new DefaultTransactionDefinition();
		for (int i = 0; i < dsCnt; i++) {

			// SP 호출 파라메터
			Map<String, Object> callParams = saveDS.get(i);
			callParams.put("P_PROCESS_CD", process_Cd);
			callParams.put("P_DIRECTION", direction);
			callParams.put(Consts.PK_USER_ID, user_Id);
			String outbound_No = (String) callParams.get("P_OUTBOUND_NO");

			// 진행상태 체크
			checkParams.put("P_CENTER_CD", callParams.get("P_CENTER_CD"));
			checkParams.put("P_BU_CD", callParams.get("P_BU_CD"));
			checkParams.put("P_OUTBOUND_DATE",callParams.get("P_OUTBOUND_DATE"));
			checkParams.put("P_OUTBOUND_NO", outbound_No);
			checkParams.put("P_OUTBOUND_BATCH", params.get("P_OUTBOUND_BATCH"));
			checkParams.put("P_DELIVERY_TYPE",callParams.get("P_DELIVERY_TYPE"));

//			if (i == 0 && Consts.PROCESS_DIRECTIONS.equals(process_Cd) && Consts.DIRECTION_FW.equals(direction)) {
//				String oChkYn = canDeliveryType(checkParams);
//				if (!Consts.YES.equals(oChkYn)) {
//					throw new RuntimeException(oChkYn);
//				}
//			}

			String oMsg = canProcessingState(checkParams, CHECK_STATE);
			if (!Consts.OK.equals(oMsg)) {
				sbResult.append(oMsg).append(Consts.CRLF);
				continue;
			}

			// LO_PROCESSING 호출
			TransactionStatus ts = transactionManager.getTransaction(td);
			try {
				// 개별출고등록일 경우 확정처리시 LOBATCH 추가 및 Delivery_Batch 갱신후 처리
				if (Consts.PROCESS_ENTRY_T1.equals(process_Cd)
						&& Consts.DIRECTION_FW.equals(direction)) {
					// 그리드에서 복수 선택해서 등록처리 할 경우 배송차수는 최초 취득한 배송차수로 등록한다.
					if (delivery_batch == null) {
						//delivery_batch = (String) params.get("P_DELIVERY_BATCH");
						delivery_batch = "000";
					}
					//callParams.put("P_DELIVERY_BATCH_NM",params.get("P_DELIVERY_BATCH_NM"));
					callParams.put("P_DELIVERY_BATCH_NM","");
					callParams.put("P_DELIVERY_BATCH", delivery_batch);
					callParams.put("P_ORDER_DATE",callParams.get("P_OUTBOUND_DATE"));
					callParams.put("P_ORDER_NO",callParams.get("P_OUTBOUND_NO"));
					
					// 등록버튼 클릭시의 배송차수가 "000"인 경우만 채번하고 그 외에는 선택한 배송차수로 등록처리한다.
					delivery_batch = dao.deliveryBatch(callParams);
					callParams.put("P_DELIVERY_BATCH", delivery_batch);

					callParams.put("P_OUTBOUND_DATE",entry_Date); 
					
					HashMap<String, Object> mapResult = callSP(ENTRY_PROCEDURE_ID, callParams);
					oMsg = (String) mapResult.get(Consts.PK_O_MSG);
					
					// 배송완료 처리/취소 호출
				} else if (Consts.PROCESS_DELIVERY.equals(process_Cd)) {
					HashMap<String, Object> mapResult = callSP(PROCEDURE_ID,callParams);
					oMsg = (String) mapResult.get(Consts.PK_O_MSG);
				} else {
					// 출고지시일 경우 확정처리시 Outbound_Batch 갱신후 처리
					if (Consts.PROCESS_DIRECTIONS.equals(process_Cd) && Consts.DIRECTION_FW.equals(direction)) {
						// 출고지시 정보에서 1건 이상 선택 했을 경우, 선택한 행을 모두 같은 OUTBOUND_BATH로
						// 설정 해야 함
						if (outbound_batch == null) {
							//callParams.put("P_OUTBOUND_BATCH", params.get("P_OUTBOUND_BATCH"));
							callParams.put("P_OUTBOUND_BATCH", "000");
							callParams.put("P_OUTBOUND_BATCH_NM", "");
						} else {
							callParams.put("P_OUTBOUND_BATCH", outbound_batch);
							callParams.put("P_OUTBOUND_BATCH_NM", outbound_batch_nm);
						}
						/*
						 * if (ship_type == null) { ship_type =
						 * (String)params.get("P_SHIP_TYPE");
						 * callParams.put("P_SHIP_TYPE", ship_type); } else {
						 * callParams.put("P_SHIP_TYPE", ship_type); }
						 */
						outbound_batch = dao.saveDirections(callParams);

						// ship_type = dao.saveShiptype(callParams);
					}
					HashMap<String, Object> mapResult = callSP(PROCEDURE_ID,
							callParams);
					oMsg = (String) mapResult.get(Consts.PK_O_MSG);
				}
				// 오류면 Rollback
				if (!Consts.OK.equals(oMsg)) {
					transactionManager.rollback(ts);
					sbResult.append(oMsg);
					sbResult.append(Consts.CRLF);
					continue;
				}

				// 출고진행상태별 출고주문상태 송신 및 출고가용재고 송신 호출
				oMsg = edCommonService.realtimeSendProcessing();
				// 오류면 Rollback
				if (!Consts.OK.equals(oMsg)) {
					transactionManager.rollback(ts);
					sbResult.append(oMsg);
					sbResult.append(Consts.CRLF);
					continue;
				}

				transactionManager.commit(ts);
			} catch (Exception e) {
				// SP 내에서 오류가 아니면 Exit
				transactionManager.rollback(ts);
				throw new RuntimeException(e.getMessage());
			}
		}

		if (dsCnt > 0 && Consts.PROCESS_DIRECTIONS.equals(process_Cd) && Consts.DIRECTION_FW.equals(direction)) {
			TransactionStatus ts = transactionManager.getTransaction(td);
			try {
				HashMap<String, Object> spParams = new HashMap<String, Object>();

				spParams.put("P_CENTER_CD", checkParams.get("P_CENTER_CD"));
				spParams.put("P_BU_CD", checkParams.get("P_BU_CD"));
				spParams.put("P_OUTBOUND_DATE", checkParams.get("P_OUTBOUND_DATE"));
				spParams.put("P_OUTBOUND_BATCH", outbound_batch);
				spParams.put("P_USER_ID", user_Id);

				HashMap<String, Object> mapResult = callSP(FW_DIRECTIONS_PROC, spParams);
				String oMsg = (String) mapResult.get(Consts.PK_O_MSG);

				// 오류면 Rollback
				if (!Consts.OK.equals(oMsg)) {
					transactionManager.rollback(ts);
					sbResult.append(oMsg);
					sbResult.append(Consts.CRLF);
				} else {
					transactionManager.commit(ts);
				}
			} catch (Exception e) {
				// SP 내에서 오류가 아니면 Exit
				transactionManager.rollback(ts);
				throw new RuntimeException(e.getMessage());
			}
		}
		if (sbResult.length() == 0) {
			sbResult.append(Consts.OK);
		}
		return sbResult.toString();
	}

	/**
	 * 출고스캔검수-박스 삭제(팝업화면에서)
	 * 
	 * @param params
	 */
	public String callScanBoxDelete(Map<String, Object> params)
			throws Exception {

		String result;

		TransactionStatus ts = transactionManager
				.getTransaction(new DefaultTransactionDefinition());
		try {
			result = dao.callScanBoxDelete(params);
			// 오류면 Rollback
			if (!Consts.OK.equals(result)) {
				transactionManager.rollback(ts);
			}
			transactionManager.commit(ts);
		} catch (Exception e) {
			transactionManager.rollback(ts);
			throw new RuntimeException(e.getMessage());
		}

		return result;
	}
	
	/**
	 * LO_PROCESSING 호출
	 * 
	 * @param params
	 * @return
	 * @throws Exception
	 */
	@SuppressWarnings("unchecked")
	public String callLOProcessingOrderType(Map<String, Object> params) throws Exception {

	  final String PROCEDURE_ID = "LO_PROCESSING_ORDER_TYPE";
	  // 합포장 적용 SP 추가
	  final String FW_DIRECTIONS_PROC = "LO_FW_DIRECTIONS_PICK_PROC";

	  List<Map<String, Object>> saveDS = (List<Map<String, Object>>) params.get(Consts.PK_DS_MASTER);
	  String process_Cd        = (String) params.get("P_PROCESS_CD");
	  String direction         = (String) params.get("P_DIRECTION");
	  String process_State_BW  = (String) params.get("P_PROCESS_STATE_BW");
	  String process_State_FW  = (String) params.get("P_PROCESS_STATE_FW");
      
	  String user_Id = (String) params.get(Consts.PK_USER_ID);
	  String outbound_batch    = "000"; // 출고차수
	  String outbound_batch_nm = null; // 출고차수명

	  // 처리할 수 있는 진행상태
	  String CHECK_STATE = "";
	  String CHECK_PROCESS_CD = Consts.PROCESS_ENTRY;
	  // 처리
	  if (Consts.DIRECTION_FW.equals(direction)) {
	    CHECK_STATE = process_State_FW;
	    if (Consts.PROCESS_ENTRY.equals(process_Cd) || Consts.PROCESS_ENTRY_T1.equals(process_Cd)) {
	      CHECK_STATE = Consts.STATE_ORDER;
	      CHECK_PROCESS_CD = Consts.PROCESS_ORDER;
	    }
	  } else {
	    // 취소
	    CHECK_STATE = process_State_BW;
	  }

	  HashMap<String, Object> checkParams = new HashMap<String, Object>();
	  checkParams.put("P_LINE_NO", ""); // 전표단위
	  checkParams.put("P_PROCESS_CD", CHECK_PROCESS_CD);
	  checkParams.put("P_STATE_DIV", "1"); // 상태구분([1]MIN, [2]MAX)
	  
	  // LO_PROCESSING 호출
	  // 전표 단위 Transaction
	  final int dsCnt = saveDS.size();
	  StringBuffer sbResult = new StringBuffer();
	  TransactionDefinition td = new DefaultTransactionDefinition();
	  String oMsg = "";
	  for (int i = 0; i < dsCnt; i++) {

	    // SP 호출 파라메터
	    Map<String, Object> callParams = saveDS.get(i);
	    callParams.put("P_PROCESS_CD", process_Cd);
	    callParams.put("P_DIRECTION", direction);
	    //callParams.put("P_OUTBOUND_BATCH", outbound_batch);
	    callParams.put(Consts.PK_USER_ID, user_Id);
	    
      checkParams.put("P_CENTER_CD", callParams.get("P_CENTER_CD"));
      checkParams.put("P_BU_CD", callParams.get("P_BU_CD"));
      checkParams.put("P_OUTBOUND_DATE",callParams.get("P_OUTBOUND_DATE1"));

	    TransactionStatus ts = transactionManager.getTransaction(td);
	    try{
	      //출고지시일 경우 확정처리시 Outbound_Batch 갱신후 처리
	      if (Consts.PROCESS_DIRECTIONS.equals(process_Cd) && Consts.DIRECTION_FW.equals(direction)) {
	        // 출고지시 정보에서 1건 이상 선택 했을 경우, 선택한 행을 모두 같은 OUTBOUND_BATH로
	        // 설정 해야 함
	        if (outbound_batch == null) {
	          //callParams.put("P_OUTBOUND_BATCH", params.get("P_OUTBOUND_BATCH"));
	          callParams.put("P_OUTBOUND_BATCH", "000");
	        } else {
	          callParams.put("P_OUTBOUND_BATCH", outbound_batch);
	        }
   	      //출고차수 채번 및 업데이트도 SP에서 처리함
	        //outbound_batch = dao.saveDirections(callParams); 
	      }
	      HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, callParams);
	      outbound_batch = (String) mapResult.get("O_OUTBOUND_BATCH"); //출고차수 채번 및 업데이트도 SP에서 처리함
	      oMsg = (String) mapResult.get(Consts.PK_O_MSG);     

	      // 오류면 Rollback 
	      if (!Consts.OK.equals(oMsg)) {
	        transactionManager.rollback(ts);
	        sbResult.append(oMsg);
	        sbResult.append(Consts.CRLF);
	        continue;
	      }

	      // 출고진행상태별 출고주문상태 송신 및 출고가용재고 송신 호출
	      oMsg = edCommonService.realtimeSendProcessing();
	      // 오류면 Rollback
	      if (!Consts.OK.equals(oMsg)) {
	        transactionManager.rollback(ts);
	        sbResult.append(oMsg);
	        sbResult.append(Consts.CRLF);
	        continue;
	      }

	      transactionManager.commit(ts);
	    }catch(Exception e){
	      // SP 내에서 오류가 아니면 Exit
	      transactionManager.rollback(ts);
	      throw new RuntimeException(e.getMessage());
	    }
	  }

	  if (dsCnt > 0 && Consts.PROCESS_DIRECTIONS.equals(process_Cd) && Consts.DIRECTION_FW.equals(direction)) {
	    TransactionStatus ts = transactionManager.getTransaction(td);
	    try {
	      HashMap<String, Object> spParams = new HashMap<String, Object>();

	      spParams.put("P_CENTER_CD", checkParams.get("P_CENTER_CD"));
	      spParams.put("P_BU_CD", checkParams.get("P_BU_CD"));
	      spParams.put("P_OUTBOUND_DATE", checkParams.get("P_OUTBOUND_DATE"));
	      spParams.put("P_OUTBOUND_BATCH", outbound_batch);
	      spParams.put("P_USER_ID", user_Id);

	      HashMap<String, Object> mapResult = callSP(FW_DIRECTIONS_PROC, spParams);
	      String oMsg1 = (String) mapResult.get(Consts.PK_O_MSG);

	      // 오류면 Rollback
	      if (!Consts.OK.equals(oMsg1)) {
	        transactionManager.rollback(ts);
	        sbResult.append(oMsg1);
	        sbResult.append(Consts.CRLF);
	      } else {
	        transactionManager.commit(ts);
	      }
	    } catch (Exception e) {
	      // SP 내에서 오류가 아니면 Exit
	      transactionManager.rollback(ts);
	      throw new RuntimeException(e.getMessage());
	    }
	  }
	  if (sbResult.length() == 0) {
	    sbResult.append(Consts.OK);
	  }
	  return sbResult.toString();
	}

	/**
	 * 출고스캔검수-박스 통합(팝업화면에서)
	 * 
	 * @param params
	 */
	@SuppressWarnings("rawtypes")
	public Map callScanBoxMerge(Map<String, Object> params) throws Exception {

		Map result;

		TransactionStatus ts = transactionManager
				.getTransaction(new DefaultTransactionDefinition());
		try {
			result = dao.callScanBoxMerge(params);
			String oMsg = (String) result.get(Consts.PK_O_MSG);
			// 오류면 Rollback
			if (!Consts.OK.equals(oMsg)) {
				throw new RuntimeException(oMsg);
			}
			transactionManager.commit(ts);
		} catch (Exception e) {
			transactionManager.rollback(ts);
			throw new RuntimeException(e.getMessage());
		}

		return result;
	}

	/**
	 * SP 호출 후 OUTPUT 값을 Map 형태로 Return
	 * 
	 * @param queryId
	 * @param params
	 * @return
	 */
	public HashMap<String, Object> callSP(String queryId,
			Map<String, Object> params) {

		return common.callSP(queryId, params);
	}

	/**
	 * 배송유형변경 가능 여부 체크
	 * 
	 * @param params
	 * @param checkState
	 * @return
	 */
	public String canDeliveryType(Map<String, Object> params) {

		final String PROCEDURE_ID = "WF.GET_DELVIERY_TYPE_APPLY_YN";

		String result = Consts.YES;
		HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, params);

		String oChkYn = (String) mapResult.get("O_CHK_YN");
		if (Consts.YES.equals(oChkYn)) {
			result = oChkYn;
		} else {
			result = "배송유형이 다른 차수로의 지시처리는 불가능 합니다.";
		}
		return result;
	}

	/**
	 * OUTBOUND_STATE 체크
	 * 
	 * @param params
	 * @param checkState
	 * @return
	 */
	public String canProcessingState(Map<String, Object> params,
			String checkState) {

		final String PROCEDURE_ID = "WF.GET_LO_OUTBOUND_STATE";

		String result = Consts.OK;
		HashMap<String, Object> mapResult = callSP(PROCEDURE_ID, params);

		String oMsg = (String) mapResult.get(Consts.PK_O_MSG);
		if (Consts.OK.equals(oMsg)) {
			String oOutboundState = (String) mapResult.get("O_OUTBOUND_STATE");
			if (!checkState.equals(oOutboundState)) {
				result = String.format(
						"[진행상태 : %s] 처리할 수 있는 상태가 아닙니다.\n다시 조회 후 데이터를 확인하십시오.",
						oOutboundState);
			} else {
				result = oMsg;
			}
		} else {
			result = oMsg;
		}
		return result;
	}

	/**
	 * 출고일괄등록/취소 처리
	 * 
	 * @param params
	 *            수정된 데이터
	 */
	@SuppressWarnings("unchecked")
	public String entryBatchProcessing(Map<String, Object> params)
			throws Exception {

		final String PROCEDURE_FW_ID = "LO_FW_ENTRY_BATCH";
		final String PROCEDURE_BW_ID = "LO_BW_ENTRY_BATCH";

		String process_id = null;
		String result = Consts.ERROR;
		TransactionStatus ts = transactionManager
				.getTransaction(new DefaultTransactionDefinition());
		try {

			// 일괄등록처리
			List<Map<String, Object>> saveDS = (List<Map<String, Object>>) params
					.get(Consts.PK_DS_MASTER);
			Map<String, Object> callParams = saveDS.get(0);
			String user_Id = (String) params.get(Consts.PK_USER_ID);
			if (params.get("P_DIRECTION").toString()
					.equals(Consts.DIRECTION_FW)) {
				process_id = PROCEDURE_FW_ID;
			} else {
				process_id = PROCEDURE_BW_ID;
			}

			callParams.put(Consts.PK_USER_ID, user_Id);

			HashMap<String, Object> mapResult = callSP(process_id, callParams);
			String oMsg = (String) mapResult.get(Consts.PK_O_MSG);
			// 오류면 Rollback
			if (!Consts.OK.equals(oMsg)) {
				transactionManager.rollback(ts);
				result = oMsg;
			} else {
				// 출고진행상태별 출고주문상태 송신 및 출고가용재고 송신 호출
				oMsg = edCommonService.realtimeSendProcessing();
				// 오류면 Rollback
				if (!Consts.OK.equals(oMsg)) {
					transactionManager.rollback(ts);
					result = oMsg;
				}

				transactionManager.commit(ts);
				result = Consts.OK;
			}
		} catch (Exception e) {
			transactionManager.rollback(ts);
			throw new RuntimeException(e.getMessage());
		}
		return result;
	}

	/**
	 * Query 실행 후 조회 데이터를 List 형태로 Return
	 */
	public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {

		return common.getJsonDataSet(queryId, params);
	}

	/**
	 * 출고스캔검수(상품별) 화면 저장 처리
	 * 
	 * @param params
	 *            신규, 수정된 데이터
	 */
	public String save(Map<String, Object> params) throws Exception {

		String result = Consts.ERROR;
		TransactionStatus ts = transactionManager
				.getTransaction(new DefaultTransactionDefinition());
		try {
			dao.save(params);
			transactionManager.commit(ts);
			result = Consts.OK;
	   } catch (Exception e) {
	     transactionManager.rollback(ts);
	     throw new RuntimeException(e.getMessage());
	   }
	   return result;
	 }
	 
}
