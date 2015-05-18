package nexos.common.db;

import java.sql.SQLException;
import java.sql.Savepoint;

import nexos.common.Util;

import org.springframework.transaction.TransactionException;
import org.springframework.transaction.TransactionStatus;

public class DynamicTransactionStatus implements TransactionStatus {

  private boolean             newTransaction = true;

  private boolean             rollbackOnly   = false;

  private DynamicJdbcTemplate jdbcTemplate   = null;

  private Savepoint           savepoint      = null;

  public DynamicTransactionStatus(DynamicJdbcTemplate jdbcTemplate) {

    this.jdbcTemplate = jdbcTemplate;
  }

  @Override
  public Object createSavepoint() throws TransactionException {

    try {
      savepoint = jdbcTemplate.getConnection().setSavepoint("DynamicTX_SP" + Util.getNowDate("yyyyMMddHHmmss"));
    } catch (SQLException e) {
      throw new RuntimeException("createSavepoint error", e);
    }

    return savepoint;
  }

  @Override
  public void rollbackToSavepoint(Object savepoint) throws TransactionException {

    try {
      jdbcTemplate.getConnection().rollback((Savepoint)savepoint);
    } catch (SQLException e) {
      throw new RuntimeException("rollbackToSavepoint error", e);
    } finally {
      jdbcTemplate.releaseConnection();
    }
  }

  public void rollbackToSavepoint() throws TransactionException {

    rollbackToSavepoint(savepoint);
  }

  public void commit() throws TransactionException {

    try {
      jdbcTemplate.getConnection().commit();
    } catch (SQLException e) {
      throw new RuntimeException("commit error", e);
    } finally {
      jdbcTemplate.releaseConnection();
    }
  }

  @Override
  public void releaseSavepoint(Object savepoint) throws TransactionException {

    try {
      jdbcTemplate.getConnection().releaseSavepoint((Savepoint)savepoint);
    } catch (SQLException e) {
      throw new RuntimeException("releaseSavepoint error", e);
    } finally {
      jdbcTemplate.releaseConnection();
    }
  }

  @Override
  public boolean isNewTransaction() {

    return this.newTransaction;
  }

  @Override
  public boolean hasSavepoint() {

    return savepoint != null;
  }

  @Override
  public boolean isRollbackOnly() {

    return this.rollbackOnly;
  }

  public void setRollbackOnly() {

    this.rollbackOnly = true;
  }

  @Override
  public void flush() {

  }

  @Override
  public boolean isCompleted() {

    return false;
  }

}
