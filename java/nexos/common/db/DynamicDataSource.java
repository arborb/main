package nexos.common.db;

import java.util.List;

import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionException;
import org.springframework.transaction.TransactionStatus;

public class DynamicDataSource implements TransactionManager {

  private final String[ ]     DBDRIVER_CLASS_NM = {"com.microsoft.sqlserver.jdbc.SQLServerDriver",
    "oracle.jdbc.driver.OracleDriver"           };
  private final String[ ]     DBCONNECTION_URL  = {"jdbc:sqlserver://%s:%s;databaseName=%s;",
    "jdbc:oracle:thin:@%s:%s:%s"                };

  private int                 dbType            = 0;
  private DynamicJdbcTemplate jdbcTemplate      = null;

  /**
   * 동적 DB 접속
   * 
   * @param dbType 0: SQLServer, 1: Oracle
   * @param remoteIp
   * @param remotePort
   * @param remoteDbName
   * @param remoteDbUserId
   * @param remoteDbUserPwd
   */
  public DynamicDataSource(int dbType, String remoteIp, String remotePort, String remoteDbName, String remoteDbUserId,
    String remoteDbUserPwd) {

    DriverManagerDataSource dataSource = new DriverManagerDataSource();

    dataSource.setDriverClassName(DBDRIVER_CLASS_NM[dbType]);
    dataSource.setUrl(String.format(DBCONNECTION_URL[dbType], remoteIp, remotePort, remoteDbName));
    dataSource.setUsername(remoteDbUserId);
    dataSource.setPassword(remoteDbUserPwd);

    this.jdbcTemplate = new DynamicJdbcTemplate(dataSource);

    this.dbType = dbType;
  }

  /**
   * DB종류 리턴, 0 - SQLServer, 1: Oracle
   * 
   * @return
   */
  public int getDBType() {

    return dbType;
  }

  /**
   * 해당 Query문으로 Select한 결과를 List 형태로 리턴
   * 
   * @param query
   * @return
   */
  @SuppressWarnings("rawtypes")
  public List getDataSet(String query) {

    return jdbcTemplate.queryForList(query);
  }

  /**
   * 해당 Query문으로 Update 실행
   * 
   * @param query
   * @return
   */
  public int update(String query) {

    return jdbcTemplate.update(query);
  }

  /**
   * Transaction 시작
   * 
   * @return
   */
  @Override
  public TransactionStatus beginTrans() throws TransactionException {

    TransactionStatus ts = new DynamicTransactionStatus(jdbcTemplate);
    ts.createSavepoint();

    return ts;
  }

  @Override
  public TransactionStatus beginTrans(TransactionDefinition definition) throws TransactionException {

    return beginTrans();
  }

  /**
   * Transaction commit
   * 
   * @param ts
   */
  @Override
  public void commitTrans(TransactionStatus ts) throws TransactionException {

    DynamicTransactionStatus dynamicTS = (DynamicTransactionStatus)ts;

    dynamicTS.commit();
  }

  /**
   * Transaction rollback
   * 
   * @param ts
   */
  @Override
  public void rollbackTrans(TransactionStatus ts) throws TransactionException {

    DynamicTransactionStatus dynamicTS = (DynamicTransactionStatus)ts;

    dynamicTS.rollbackToSavepoint();
  }

}
