package nexos.common.db;

import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Statement;

import javax.sql.DataSource;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.CallableStatementCallback;
import org.springframework.jdbc.core.CallableStatementCreator;
import org.springframework.jdbc.core.ConnectionCallback;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ParameterDisposer;
import org.springframework.jdbc.core.PreparedStatementCallback;
import org.springframework.jdbc.core.PreparedStatementCreator;
import org.springframework.jdbc.core.SqlProvider;
import org.springframework.jdbc.core.StatementCallback;
import org.springframework.jdbc.support.JdbcUtils;
import org.springframework.util.Assert;

public class DynamicJdbcTemplate extends JdbcTemplate {

  private Connection jdbcConnection = null;

  public DynamicJdbcTemplate(DataSource dataSource) {

    setDataSource(dataSource);
    afterPropertiesSet();
  }

  public Connection getConnection() {

    if (jdbcConnection == null) {
      try {
        jdbcConnection = getDataSource().getConnection();

        jdbcConnection.setAutoCommit(false);
      } catch (SQLException e) {
        throw new RuntimeException(e.getMessage());
      }
    }

    return jdbcConnection;
  }

  public void releaseConnection() {

    if (jdbcConnection != null) {
      try {
        jdbcConnection.close();
      } catch (SQLException e) {
      }
    }
  }

  public <T> T execute(ConnectionCallback<T> action) throws DataAccessException {

    Assert.notNull(action, "Callback object must not be null");

    Connection con = getConnection();
    try {
      Connection conToUse = con;
      if (this.getNativeJdbcExtractor() != null) {
        // Extract native JDBC Connection, castable to OracleConnection or the like.
        conToUse = this.getNativeJdbcExtractor().getNativeConnection(con);
      } else {
        // Create close-suppressing Connection proxy, also preparing returned Statements.
        conToUse = createConnectionProxy(con);
      }
      return action.doInConnection(conToUse);
    } catch (SQLException ex) {
      throw getExceptionTranslator().translate("ConnectionCallback", getSql(action), ex);
    }
  }

  public <T> T execute(StatementCallback<T> action) throws DataAccessException {
    Assert.notNull(action, "Callback object must not be null");

    Connection con = getConnection();
    Statement stmt = null;
    try {
      Connection conToUse = con;
      if (this.getNativeJdbcExtractor() != null
        && this.getNativeJdbcExtractor().isNativeConnectionNecessaryForNativeStatements()) {
        conToUse = this.getNativeJdbcExtractor().getNativeConnection(con);
      }
      stmt = conToUse.createStatement();
      applyStatementSettings(stmt);
      Statement stmtToUse = stmt;
      if (this.getNativeJdbcExtractor() != null) {
        stmtToUse = this.getNativeJdbcExtractor().getNativeStatement(stmt);
      }
      T result = action.doInStatement(stmtToUse);
      handleWarnings(stmt);
      return result;
    } catch (SQLException ex) {
      // Release Connection early, to avoid potential connection pool deadlock
      // in the case when the exception translator hasn't been initialized yet.
      JdbcUtils.closeStatement(stmt);
      stmt = null;
      con = null;
      throw getExceptionTranslator().translate("StatementCallback", getSql(action), ex);
    } finally {
      JdbcUtils.closeStatement(stmt);
    }
  }

  public <T> T execute(PreparedStatementCreator psc, PreparedStatementCallback<T> action) throws DataAccessException {

    Assert.notNull(psc, "PreparedStatementCreator must not be null");
    Assert.notNull(action, "Callback object must not be null");
    if (logger.isDebugEnabled()) {
      String sql = getSql(psc);
      logger.debug("Executing prepared SQL statement" + (sql != null ? " [" + sql + "]" : ""));
    }

    Connection con = getConnection();
    PreparedStatement ps = null;
    try {
      Connection conToUse = con;
      if (this.getNativeJdbcExtractor() != null
        && this.getNativeJdbcExtractor().isNativeConnectionNecessaryForNativePreparedStatements()) {
        conToUse = this.getNativeJdbcExtractor().getNativeConnection(con);
      }
      ps = psc.createPreparedStatement(conToUse);
      applyStatementSettings(ps);
      PreparedStatement psToUse = ps;
      if (this.getNativeJdbcExtractor() != null) {
        psToUse = this.getNativeJdbcExtractor().getNativePreparedStatement(ps);
      }
      T result = action.doInPreparedStatement(psToUse);
      handleWarnings(ps);
      return result;
    } catch (SQLException ex) {
      // Release Connection early, to avoid potential connection pool deadlock
      // in the case when the exception translator hasn't been initialized yet.
      if (psc instanceof ParameterDisposer) {
        ((ParameterDisposer)psc).cleanupParameters();
      }
      String sql = getSql(psc);
      psc = null;
      JdbcUtils.closeStatement(ps);
      ps = null;
      throw getExceptionTranslator().translate("PreparedStatementCallback", sql, ex);
    } finally {
      if (psc instanceof ParameterDisposer) {
        ((ParameterDisposer)psc).cleanupParameters();
      }
      JdbcUtils.closeStatement(ps);
    }
  }

  public <T> T execute(CallableStatementCreator csc, CallableStatementCallback<T> action) throws DataAccessException {

    Assert.notNull(csc, "CallableStatementCreator must not be null");
    Assert.notNull(action, "Callback object must not be null");
    if (logger.isDebugEnabled()) {
      String sql = getSql(csc);
      logger.debug("Calling stored procedure" + (sql != null ? " [" + sql + "]" : ""));
    }

    Connection con = getConnection();
    CallableStatement cs = null;
    try {
      Connection conToUse = con;
      if (this.getNativeJdbcExtractor() != null) {
        conToUse = this.getNativeJdbcExtractor().getNativeConnection(con);
      }
      cs = csc.createCallableStatement(conToUse);
      applyStatementSettings(cs);
      CallableStatement csToUse = cs;
      if (this.getNativeJdbcExtractor() != null) {
        csToUse = this.getNativeJdbcExtractor().getNativeCallableStatement(cs);
      }
      T result = action.doInCallableStatement(csToUse);
      handleWarnings(cs);
      return result;
    } catch (SQLException ex) {
      // Release Connection early, to avoid potential connection pool deadlock
      // in the case when the exception translator hasn't been initialized yet.
      if (csc instanceof ParameterDisposer) {
        ((ParameterDisposer)csc).cleanupParameters();
      }
      String sql = getSql(csc);
      csc = null;
      JdbcUtils.closeStatement(cs);
      cs = null;
      throw getExceptionTranslator().translate("CallableStatementCallback", sql, ex);
    } finally {
      if (csc instanceof ParameterDisposer) {
        ((ParameterDisposer)csc).cleanupParameters();
      }
      JdbcUtils.closeStatement(cs);
    }
  }

  private static String getSql(Object sqlProvider) {
    if (sqlProvider instanceof SqlProvider) {
      return ((SqlProvider)sqlProvider).getSql();
    } else {
      return null;
    }
  }
}
