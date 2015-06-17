package nexos.service.common;

import java.util.HashMap;
import java.util.List;
// import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.ibatis.JsonDataSet;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: CommonDAOImpl<br>
 * Description: WMS Common DAO (Data Access Object)<br>
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
@Repository("COMMONDAO")
public class CommonDAOImpl implements CommonDAO {

	// private final Logger logger =
	// LoggerFactory.getLogger(CommonDAOImpl.class);

	@Resource
	private NexosDAO nexosDAO;

	@Override
	public HashMap<String, Object> callSP(String queryId,
			Map<String, Object> params) {

		return nexosDAO.callSP(queryId, params);
	}

	@SuppressWarnings("rawtypes")
	@Override
	public List getDataSet(String queryId) {

		return nexosDAO.list(queryId);
	}

	@SuppressWarnings("rawtypes")
	@Override
	public List getDataSet(String queryId, Map<String, Object> params) {

		return nexosDAO.list(queryId, params);
	}

	@Override
	public JsonDataSet getJsonDataSet(String queryId) {

		return nexosDAO.jsonList(queryId);
	}

	@Override
	public JsonDataSet getJsonDataSet(String queryId, Map<String, Object> params) {
		JsonDataSet result = null;
		try {
			result = nexosDAO.jsonList(queryId, params);
		} catch (Exception e) {
			return result;
		}
		return result;
	}

}
