package nexos.common.spring.security;

import java.io.IOException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.NoSuchAlgorithmException;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;

import org.apache.commons.codec.binary.Base64;

import com.penta.scpdb.ScpDbAgent;

public class Encryption {

  private static final String iniFilePath = "/opt/SCP/scpdb_agent_unix.ini"; //개발기
  
  public static final String Rsa_Col1 = "ORDERER_NM";
  public static final String Rsa_Col2 = "ORDERER_HP";
  public static final String Rsa_Col3 = "ORDERER_EMAIL";
  public static final String Rsa_Col4 = "SHIPPER_NM";
  public static final String Rsa_Col5 = "SHIPPER_HP";
  public static final String Rsa_Col6 = "SHIPPER_ADDR_BASIC";
  public static final String Rsa_Col7 = "SHIPPER_ADDR_DETAIL";
  
  private static String iv;
  private static Key keySpec;
  


  /**
   * Decrypt Data 
   * 
   * @param data
   * @return
   * @throws IOException
   * @throws NoSuchPaddingException 
   * @throws NoSuchAlgorithmException 
   * @throws InvalidKeyException 
   * @throws BadPaddingException 
   * @throws IllegalBlockSizeException 
   */

  public static String aesDecode(String str) throws java.io.UnsupportedEncodingException, NoSuchAlgorithmException,
                                                   NoSuchPaddingException, InvalidKeyException, InvalidAlgorithmParameterException,
                                                   IllegalBlockSizeException, BadPaddingException {
      int ret;
      
      ScpDbAgent agt = new ScpDbAgent();
      
      ret = agt.AgentInit( iniFilePath );
      
      String key = agt.ScpExportKey( iniFilePath, "KEY1", "" );    
      System.out.println("OutKey : " + key );  
      
      iv = key.substring(0, 16);
      byte[] keyBytes = new byte[16];
      byte[] b = key.getBytes("UTF-8");
      
          int len = b.length;
          if(len > keyBytes.length)
              len = keyBytes.length;
          System.arraycopy(b, 0, keyBytes, 0, len); 
          keySpec = new SecretKeySpec(keyBytes, "AES");
          System.out.println("keySpec : " + keySpec);
          
      
      Cipher c = Cipher.getInstance("AES/CBC/PKCS5Padding");
      c.init(Cipher.DECRYPT_MODE, keySpec, new IvParameterSpec(iv.getBytes("UTF-8")));

      byte[] byteStr = Base64.decodeBase64(str.getBytes());

      return new String(c.doFinal(byteStr),"UTF-8");
  }

  /**
   * @Name Encrypt Data
   * @param data
   * @throws IOException
   */

  public static String aesEncode(String str) throws java.io.UnsupportedEncodingException, NoSuchAlgorithmException,
                                                   NoSuchPaddingException, InvalidKeyException, InvalidAlgorithmParameterException,
                                                   IllegalBlockSizeException, BadPaddingException{
    
    int ret;
    
    ScpDbAgent agt = new ScpDbAgent();
    
    ret = agt.AgentInit( iniFilePath );
    
    String key = agt.ScpExportKey( iniFilePath, "KEY1", "" );
    System.out.println("OutKey : " + key );
    
    iv = key.substring(0, 16);
    byte[] keyBytes = new byte[16];
    byte[] b = key.getBytes("UTF-8");
    
        int len = b.length;
        if(len > keyBytes.length)
            len = keyBytes.length;       
        System.arraycopy(b, 0, keyBytes, 0, len);
        keySpec = new SecretKeySpec(keyBytes, "AES");
        System.out.println("keySpec : " + keySpec); 
        
        
      Cipher c = Cipher.getInstance("AES/CBC/PKCS5Padding");

      c.init(Cipher.ENCRYPT_MODE, keySpec, new IvParameterSpec(iv.getBytes()));

      byte[] encrypted = c.doFinal(str.getBytes("UTF-8"));
      String enStr = new String(Base64.encodeBase64(encrypted));

      return enStr;
  }

  

}
