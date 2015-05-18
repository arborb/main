package nexos.common.spring.security;

import java.io.UnsupportedEncodingException;
import java.security.InvalidAlgorithmParameterException;
import java.security.InvalidKeyException;
import java.security.Key;
import java.security.NoSuchAlgorithmException;
import java.sql.Connection;
import java.sql.Date;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException; 
import java.util.HashMap;

import javax.crypto.BadPaddingException;
import javax.crypto.Cipher;
import javax.crypto.IllegalBlockSizeException;
import javax.crypto.NoSuchPaddingException;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.apache.commons.codec.binary.Base64;

public class Encryption {

  
  public static final String Rsa_Col1 = "ORDERER_NM";
  public static final String Rsa_Col2 = "ORDERER_HP";
  public static final String Rsa_Col3 = "ORDERER_EMAIL";
  public static final String Rsa_Col4 = "SHIPPER_NM";
  public static final String Rsa_Col5 = "SHIPPER_HP";
  public static final String Rsa_Col6 = "SHIPPER_ADDR_BASIC";
  public static final String Rsa_Col7 = "SHIPPER_ADDR_DETAIL";
  public static final String Rsa_Col8 = "ORDERER_ADDR_BASIC";
  public static final String Rsa_Col9 = "ORDERER_ADDR_DETAIL";
  public static final String Rsa_Col10 = "SHIPPER_TEL";
  
  public static final String Rsa_Col11 = "SHIPPER_NM1";
  public static final String Rsa_Col12 = "SHIPPER_TEL1";
  public static final String Rsa_Col13 = "SHIPPER_HP1";
  public static final String Rsa_Col14 = "SHIPPER_ADDR_BASIC1";
  public static final String Rsa_Col15 = "SHIPPER_ADDR_DETAIL1";
  public static final String Rsa_Col17 = "ORDERER_TEL";
  
   

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
      
      byte[] keyBytes = new byte[16];
      
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
    
    
      byte[] keyBytes = new byte[16];
 
      Cipher c = Cipher.getInstance("AES/CBC/PKCS5Padding");

      c.init(Cipher.ENCRYPT_MODE, keySpec, new IvParameterSpec(iv.getBytes()));

      byte[] encrypted = c.doFinal(str.getBytes("UTF-8"));
      String enStr = new String(Base64.encodeBase64(encrypted));

      return enStr;
  }

  

}

