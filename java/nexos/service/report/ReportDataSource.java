package nexos.service.report;

import java.util.List;
import java.util.Map;

import net.sf.jasperreports.engine.JRDataSource;
import net.sf.jasperreports.engine.JRException;
import net.sf.jasperreports.engine.JRField;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.orm.ibatis.SqlMapClientTemplate;

/**
 * Class: ReportDataSource<br>
 * Description: 출력시 공통적으로 사용하는 DataSource<br>
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
public class ReportDataSource implements JRDataSource {

  private static Logger logger = LoggerFactory.getLogger(ReportDataSource.class);

  private int           index  = -1;

  @SuppressWarnings("rawtypes")
  private List          list   = null;

  /**
   * Constructor
   */
  public ReportDataSource() throws Exception {
    super();
  }

  /**
   * 출력물에서 호출할 DataSource를 조회하기.
   * 
   * @param queryId
   * @param params
   * @throws Exception
   */
  public ReportDataSource(SqlMapClientTemplate sqlMapClientTemplate, String queryId, Map<String, Object> params)
    throws Exception {

    try {
      // 1. 조회하기.
      list = sqlMapClientTemplate.queryForList(queryId, params);
    } catch (Exception e) {
      logger.error(e.getMessage());
      throw e;
    }
  }

  /**
   * Next
   */
  @Override
  public boolean next() throws JRException {

    if ((list != null) && (index < list.size() - 1)) {
      index++;
      return true;
    }
    return false;
  }

  /**
   * 특정 Field값 조회하는 Method.
   */
  @SuppressWarnings("unchecked")
  @Override
  public Object getFieldValue(JRField field) throws JRException {

    String fieldName = field.getName();

    Map<String, Object> mapRow = (Map<String, Object>)list.get(index);

    return mapRow.get(fieldName);
  }

  /**
   * 전체Size 조회하기.
   * 
   * @return
   */
  public int size() {

    if (list == null) {
      return 0;
    }
    return list.size();
  }
}
