package nexos.service.lo;

import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import nexos.common.Consts;
import nexos.common.ibatis.NexosDAO;
import nexos.common.spring.security.Encryption;

import org.springframework.stereotype.Repository;

/**
 * Class: CM01010EDAOImpl<br>
 * Description: CM01010E DAO (Data Access Object)<br>
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
@Repository("LOM3060EDAO")
public class LOM3060EDAOImpl implements LOM3060EDAO {

  // private final Logger logger = LoggerFactory.getLogger(CM01010EDAOImpl.class);

  @Resource
  private NexosDAO nexosDAO;

  @SuppressWarnings("unchecked")
  @Override
  public void save(Map<String, Object> params) throws Exception {

    List<Map<String, Object>> saveDS = (List<Map<String, Object>>)params.get(Consts.PK_DS_MASTER);
    String user_Id = (String)params.get(Consts.PK_USER_ID);


    final String PROCEDURE_ID = "LO_SHIPPER_UPDATE";

    

    int dsCnt = saveDS.size();
    for (int i = 0; i < dsCnt; i++) {
      Map<String, Object> rowData = saveDS.get(i);


      
      String ScpEncStr1 =  (String)rowData.get(Consts.DK_SCP_DATA_1);
      String ScpEncStr2 =  (String)rowData.get(Consts.DK_SCP_DATA_2);
      String ScpEncStr3 =  (String)rowData.get(Consts.DK_SCP_DATA_3);
      String ScpEncStr5 =  (String)rowData.get(Consts.DK_SCP_DATA_8);
      Encryption EncStr = new Encryption();
      
      
      rowData.put(Consts.DK_SCP_DATA_1, EncStr.aesEncode(ScpEncStr1));
      rowData.put(Consts.DK_SCP_DATA_2, EncStr.aesEncode(ScpEncStr2));
      rowData.put(Consts.DK_SCP_DATA_3, EncStr.aesEncode(ScpEncStr3));
      rowData.put(Consts.DK_SCP_DATA_8, EncStr.aesEncode(ScpEncStr5));
      
      System.out.println("ScpEncStr1 : " +ScpEncStr1);
      System.out.println("ScpEncStr1 : " +ScpEncStr2);
      System.out.println("ScpEncStr1 : " +ScpEncStr3);
      System.out.println("ScpEncStr1 : " +ScpEncStr5);
      
  
        nexosDAO.callSP(PROCEDURE_ID, rowData);
    }
  }

}
