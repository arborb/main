package nexos.common.ibatis;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import nexos.common.Consts;
import nexos.common.spring.security.Encryption;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ibatis.sqlmap.client.event.RowHandler;


/**
 * Class: JsonRowHandler<br>
 * Description: Compact Json DataSet Handler Class, 대용량 데이터 처리를 위해 생성한 ibatis RowHandler<br>
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
public class JsonRowHandler implements RowHandler {
  
  
  private final int               PAGE_SIZE = 10000;
  private int                     rowNum;

  private JsonDataSet             dsJson;
  private HashMap<String, Object> hmWriter;
  private ObjectMapper            omWriter;
  private StringBuilder           sbWriter;
  private ArrayList<String>       alColumns;
  private int                     colCount;
  
  
  public JsonRowHandler() {

    this.dsJson = new JsonDataSet();
    this.hmWriter = new HashMap<String, Object>();
    this.omWriter = new ObjectMapper();
    this.sbWriter = new StringBuilder();

    this.rowNum = 0;
    this.alColumns = null;
    this.colCount = 0;
  }
//
//  
  @SuppressWarnings({"rawtypes", "unchecked"})
  @Override
  public void handleRow(Object valueObject) {

    Map rowData = (Map)valueObject;

    if (rowNum == 0) {
      dsJson.setColumns(rowData);
      alColumns = dsJson.getColumns();
      colCount = dsJson.getDataColumnCount(); 
    }

    addRow(rowData);
  }

  /**
   * SELECT한 레코드 건별 Json 문자열로 변환 처리
   * 
   * @param rowData
   */
  public void addRow(Map<String, Object> rowData) { 
    
    String DescryptedDataTotalAddr = null;
    try {
      // hmWriter.clear();
      
      for (int col = 0; col < colCount; col++) {
        //System.out.println("For : " + alColumns.get(col).toString());
        
        String Diff = alColumns.get(col).toString();
        String DeScryStr = null;
        //System.out.println("rowData.keySet() : " +rowData.keySet());
        /*
        System.out.println("For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"); 
        System.out.println("SystemProperties.getProperty(value1) : " +SystemProperties.getProperty(value1));
        System.out.println("For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        */
        
        
        //암호화/복호화 대상 컬럼지정
        /*
        String DeCrytAddr = globalProps.getProperty("encrypt.db.addrbasic");
        String DeCrytAddrDetail = globalProps.getProperty("db.enaddrdetail");
        String DeCrytTelno = globalProps.getProperty("db.entelno");
        System.out.println("For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
        System.out.println("암호화 및 복호화 대상 컬럼 [ 컬럼명 ] 0: [" + DeCrytAddr + " ]");
        System.out.println("암호화 및 복호화 대상 컬럼 [ 컬럼명 ] 1: [" + DeCrytAddrDetail + " ]");
        System.out.println("암호화 및 복호화 대상 컬럼 [ 컬럼명 ] 2: [" + DeCrytTelno + " ]"); 
        */
 
         Encryption en = new Encryption();
         /*
         if(Diff.equals(en.Rsa_Col1) || Diff.equals(en.Rsa_Col2) || Diff.equals(en.Rsa_Col3) 
         //              || Diff.equals(en.Rsa_Col4) || Diff.equals(en.Rsa_Col5) || Diff.equals(en.Rsa_Col6) || Diff.equals(en.Rsa_Col7))
         {
         System.out.println("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
         System.out.println("rowData.get(alColumns.get(col)).toString() : [" + rowData.get(alColumns.get(col)).toString() + " ]");
         System.out.println("Diff.equals(en.Rsa_Col1) : [" + Diff.equals(en.Rsa_Col1) + " ]");
         System.out.println("rowData.get(alColumns.get(col)).toString() : [" + Diff.equals(en.Rsa_Col2) + " ]");
         System.out.println("rowData.get(alColumns.get(col)).toString() : [" + Diff.equals(en.Rsa_Col3) + " ]");
         System.out.println("rowData.get(alColumns.get(col)).toString() : [" + Diff.equals(en.Rsa_Col4) + " ]");
         System.out.println("rowData.get(alColumns.get(col)).toString() : [" + Diff.equals(en.Rsa_Col5) + " ]");
         System.out.println("rowData.get(alColumns.get(col)).toString() : [" + Diff.equals(en.Rsa_Col6) + " ]");
         System.out.println("rowData.get(alColumns.get(col)).toString() : [" + Diff.equals(en.Rsa_Col7) + " ]");
         System.out.println("rowData.get(alColumns.get(col)).toString() : [" + Diff.equals(en.Rsa_Col8) + " ]");
         System.out.println("rowData.get(alColumns.get(col)).toString() : [" + Diff.equals(en.Rsa_Col9) + " ]");
         System.out.println("rowData.get(alColumns.get(col)).toString() : [" + Diff.equals(en.Rsa_Col10) + " ]"); 
         */
         
         //System.out.println("\n For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"); 
         //System.out.println("\n Get Colunm : " + Diff + '\t');
         //System.out.println("\n For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
         
         
         if(Diff.equals(en.Rsa_Col1) || Diff.equals(en.Rsa_Col2) 
                                     || Diff.equals(en.Rsa_Col3) 
                                     || Diff.equals(en.Rsa_Col4) 
                                     || Diff.equals(en.Rsa_Col5) 
                                     || Diff.equals(en.Rsa_Col6) 
                                     || Diff.equals(en.Rsa_Col7)
                                     || Diff.equals(en.Rsa_Col8)
                                     || Diff.equals(en.Rsa_Col9)
                                     || Diff.equals(en.Rsa_Col10)
                                     || Diff.equals(en.Rsa_Col11)
                                     || Diff.equals(en.Rsa_Col12)
                                     || Diff.equals(en.Rsa_Col13)
                                     || Diff.equals(en.Rsa_Col14)
                                     || Diff.equals(en.Rsa_Col15)
                                     || Diff.equals(en.Rsa_Col17))
                                     //|| alColumns.get(col).toString().equals("SHIPPER_ADDR"))//  
           /* 
         if(Diff.equals(en.Rsa_Col1))
         */
          {
          // 
           /*
           System.out.println("\n For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");    
           System.out.println("\n For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
           System.out.println("\n For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
           System.out.println("\n For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
           System.out.println("\n For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
           System.out.println("\n Get Colunm : " + Diff + '\t');
           System.out.println("\n For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
           System.out.println("\n For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
           System.out.println("\n For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
           System.out.println("\n For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@"); 
           */
           
          String EnStr = rowData.get(alColumns.get(col)).toString();
          //System.out.println("EnStr ########@@@@@@@@@@--> :" + EnStr);  
          String DescryptedData = en.aesDecode(EnStr);
          
          //System.out.println("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
          //System.out.println("\n 암호화 문자열 : [" + EnStr + " ] :: " + "\n 복호화 문자열 : [" + DescryptedData + " ]" + '\t'); 
          //System.out.println("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
          //System.out.println("복호화 [ DescryptedData ] : [" + DescryptedData + " ]");
          //System.out.println("For DeScryStr Return: 00--> :" + DescryptedData); 
          //System.out.println("For DeScryStr Return: 11--> :" + rowData.get(alColumns.get(col)));
          //System.out.println("For @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");    
            
            hmWriter.put("" + col, DescryptedData);
          
        }else{
          //System.out.println("ELSE @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");
          hmWriter.put("" + col, rowData.get(alColumns.get(col)));
          //System.out.println("ELSE rowData.get(alColumns.get(col))"); 
        }
      }
      hmWriter.put("" + colCount, Consts.DV_ID_PREFIX + rowNum);
      hmWriter.put("" + (colCount + 1), Consts.DV_CRUD_R);
      byte[ ] mapJsonBytes = omWriter.writeValueAsBytes(omWriter.writeValueAsString(hmWriter));
      sbWriter.append(new String(mapJsonBytes, 1, mapJsonBytes.length - 2, Consts.CHARSET)).append(
        JsonDataSet.DATA_SEPARATOR);
    } catch (Exception e) {
      throw new RuntimeException("[" + rowNum + "] 데이터 처리 중 오류가 발생했습니다.\n" + e.getMessage());
    }

    rowNum++;
    if ((rowNum % PAGE_SIZE) == 0) {
      appendDataList();
    }
  }

  /**
   * 현재까지 기록된 내용을 Json DataSet에 기록
   */
  private void appendDataList() {

    int len = sbWriter.length();
    if (len > 0) {
      sbWriter.setLength(len - 1);
      //System.out.println("sbWriter 0: " + sbWriter);
      dsJson.appendData(sbWriter);
      sbWriter = new StringBuilder();
      //System.out.println("\n sbWriter : " + sbWriter);
    }
  }

  /**
   * SELECT한 데이터를 Json DataSet으로 리턴
   * 
   * @return
   */
  public JsonDataSet getJsonDataSet() {

    appendDataList();
    alColumns = null;
    hmWriter.clear();
    hmWriter = null;
    omWriter = null;
    sbWriter = null;
    return dsJson;
  }
}
