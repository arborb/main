package nexos.common.ibatis;

import java.sql.SQLException;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;

import nexos.common.Consts;

import com.ibatis.sqlmap.client.extensions.ParameterSetter;
import com.ibatis.sqlmap.client.extensions.ResultGetter;
import com.ibatis.sqlmap.client.extensions.TypeHandlerCallback;

/**
 * Class: DataTypeHandler<br>
 * Description: ibatis Data Type Handler Class, 오라클 DATE의 날짜가 잘리는 문제로 현재 날짜에 대해서만 별도 처리 함<br>
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
public class DataTypeHandler implements TypeHandlerCallback {

  @Override
  public Object getResult(ResultGetter getter) throws SQLException {
    Object result = getter.getObject();

    if (result != null) {
      if (result instanceof java.util.Date) {
        SimpleDateFormat sdfDATETIME = new SimpleDateFormat(Consts.DATETIME_FORMAT);
        String resultVal = sdfDATETIME.format(getter.getTimestamp());
        return resultVal.replace(Consts.DV_NULL_TIME, "");
      }
    }
    return result;
  }

  @Override
  public void setParameter(ParameterSetter setter, Object parameter) throws SQLException {
    if (parameter != null) {
      if (parameter instanceof java.util.Date) {
        setter.setTimestamp(new Timestamp(((java.sql.Date)parameter).getTime()));
        return;
      }
    }
    setter.setObject(parameter);
  }

  @Override
  public Object valueOf(String s) {
    return s;
  }

}
