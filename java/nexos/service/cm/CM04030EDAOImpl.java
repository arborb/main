package nexos.service.cm;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;

import org.springframework.stereotype.Repository;

/**
 * Class: CM04030EDAOImpl<br>
 * Description: CM04030E DAO (Data Access Object)<br>
 * Copyright: Copyright (c) 2013 ASETEC Corporation. All rights reserved.<br>
 * Company : ASETEC<br>
 * 
 * @author ASETEC
 * @version 1.0
 * 
 * <pre style="font-family: NanumGothicCoding, GulimChe">
 * ---------------------------------------------------------------------------------------------------------------------
 *  Version    Date          Author           Description
 * ---------  ------------  ---------------  ---------------------------------------------------------------------------
 *  1.0        2013-01-01    ASETEC           신규작성
 * ---------------------------------------------------------------------------------------------------------------------
 * </pre>
 */
@Repository("CM04030EDAO")
public class CM04030EDAOImpl implements CM04030EDAO {

  // private final Logger logger = LoggerFactory.getLogger(CM04030EDAOImpl.class);

  @Resource
  private NexosDAO nexosDAO;

  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
    String user_Id = (String)params.get(Consts.PK_USER_ID);

    final String PRORAM_ID = "CM04030E";
    final String TABLE_NM = "CMITEMSET";
    final String INSERT_ID = PRORAM_ID + ".INSERT_" + TABLE_NM;
    final String UPDATE_ID = PRORAM_ID + ".UPDATE_" + TABLE_NM;
    final String DELETE_ID = PRORAM_ID + ".DELETE_" + TABLE_NM;

    int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);
      rowData.put(Consts.PK_REG_USER_ID, user_Id);

      String crud = (String)rowData.get(Consts.PK_CRUD);
      if (Consts.DV_CRUD_C.equals(crud)) {
        nexosDAO.insert(INSERT_ID, rowData);
      } else if (Consts.DV_CRUD_U.equals(crud)) {
        nexosDAO.update(UPDATE_ID, rowData);
      } else if (Consts.DV_CRUD_D.equals(crud)) {
        nexosDAO.delete(DELETE_ID, rowData);
      }
    }
  }

}

// package nexos.service.cm;
//
// import java.util.List;
// import java.util.Map;
//
// import javax.annotation.Resource;
//
// import nexos.common.Consts;
// import nexos.common.NexosDAO;
//
// import org.springframework.stereotype.Repository;
// import org.springframework.transaction.PlatformTransactionManager;
// import org.springframework.transaction.TransactionStatus;
// import org.springframework.transaction.support.DefaultTransactionDefinition;
//
// // import org.springframework.transaction.annotation.Transactional;
//
// /**
// * <p>WCDAOImpl</p>
// * <p>Description: CM04030E DAO (Data Access Object)</p>
// * <p>Copyright: Copyright (c) 2012</p>
// * <p>Company: ASETEC</p>
// * @author ASETEC
// * @version 1.0<br>
// * ---------------------------------------------------------------------------------------------------<br/>
// * Ver Date Author Description<br/>
// * --------- ---------- --------------- --------------------------------------------------------<br/>
// * 1.0 2013-07-01 ASETEC 신규작성<br/>
// * --------- ---------- --------------- --------------------------------------------------------<br/>
// */
// @Repository("CM04030EDAO")
// public class CM04030EDAOImpl implements CM04030EDAO {
//
// // private final Logger logger = LoggerFactory.getLogger(CM04030EDAOImpl.class);
//
// @Resource
// private NexosDAO nexosDAO;
//
// @Resource
// private PlatformTransactionManager transactionManager;
//
// @Override
// @SuppressWarnings({"rawtypes"})
// public JsonDataSet getDataSet(String queryId, Map<String, Object> params) {
// // 1. 데이터 list형태로 데이터 조회하기
// List listResult = nexosDAO.list(queryId, params);
//
// // 2.조회결과를 return한다
// return listResult;
// }
//
// @SuppressWarnings("unchecked")
// @Override
// public String save(Map<String, Object> params) throws Exception {
//
// String result = Consts.ERROR;
//
// List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_DETAIL);
// String user_Id = (String)params.get(Consts.PK_USER_ID);
//
// TransactionStatus ts = transactionManager.getTransaction(new DefaultTransactionDefinition());
// try {
// int dsCnt = saveDS.size();
// for (int i = 0; i < dsCnt; i++) {
// Map<String, Object> rowData = saveDS.get(i);
// rowData.put(Consts.PK_REG_USER_ID, user_Id);
//
// String crud = (String)rowData.get(Consts.PK_CRUD);
// if (Consts.DV_CRUD_C.equals(crud)) {
// nexosDAO.insert("CM04030E.INSERT_CMITEMSET", rowData);
// } else if (Consts.DV_CRUD_U.equals(crud)) {
// nexosDAO.update("CM04030E.UPDATE_CMITEMSET", rowData);
// } else if (Consts.DV_CRUD_D.equals(crud)) {
// nexosDAO.delete("CM04030E.DELETE_CMITEMSET", rowData);
// }
// }
// transactionManager.commit(ts);
// result = Consts.OK;
// } catch (Exception e) {
// transactionManager.rollback(ts);
// throw new RuntimeException(e.getMessage());
// }
// return result;
// }
//
// }
