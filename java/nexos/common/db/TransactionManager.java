package nexos.common.db;

import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.TransactionException;
import org.springframework.transaction.TransactionStatus;

public interface TransactionManager {

  /**
   * Transaction 시작
   * 
   * @return
   */
  TransactionStatus beginTrans() throws TransactionException;

  /**
   * Transaction 시작
   * 
   * @param definition
   * @return
   */
  TransactionStatus beginTrans(TransactionDefinition definition) throws TransactionException;

  /**
   * Transaction commit
   * 
   * @param ts
   */
  void commitTrans(TransactionStatus ts) throws TransactionException;

  /**
   * Transaction rollback
   * 
   * @param ts
   */
  void rollbackTrans(TransactionStatus ts) throws TransactionException;
}
