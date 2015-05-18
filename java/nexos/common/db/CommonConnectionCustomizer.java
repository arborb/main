package nexos.common.db;

import java.sql.Connection;
import java.sql.Statement;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.mchange.v2.c3p0.AbstractConnectionCustomizer;

public class CommonConnectionCustomizer extends AbstractConnectionCustomizer {

  private final Logger logger = LoggerFactory.getLogger(CommonConnectionCustomizer.class);

  @Override
  public void onAcquire(Connection c, String parentDataSourceIdentityToken) throws Exception {
    try {
      Statement statement = c.createStatement();
      statement.addBatch("ALTER SESSION SET NLS_LANGUAGE='KOREAN'");
      statement.addBatch("ALTER SESSION SET NLS_ISO_CURRENCY='KOREA'");
      statement.addBatch("ALTER SESSION SET NLS_TERRITORY='KOREA'");
      statement.addBatch("ALTER SESSION SET NLS_DATE_FORMAT='RR/MM/DD'");
      statement.addBatch("ALTER SESSION SET NLS_TIMESTAMP_FORMAT='RR/MM/DD HH24:MI:SSXFF'");
      statement.addBatch("ALTER SESSION SET NLS_TIMESTAMP_TZ_FORMAT='RR/MM/DD HH24:MI:SSXFF TZR'");
      statement.addBatch("ALTER SESSION SET NLS_TIME_FORMAT='HH24:MI:SSXFF'");
      statement.executeBatch();
      statement.close();
    } catch (Exception e) {
      logger.error("CommonConnectionCustomizer[onAcquire] Error", e);
    }
  }
}
