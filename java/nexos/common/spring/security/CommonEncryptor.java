package nexos.common.spring.security;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigInteger;
import java.security.KeyFactory;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.PrivateKey;
import java.security.Provider;
import java.security.PublicKey;
import java.security.spec.RSAPrivateCrtKeySpec;
import java.security.spec.RSAPublicKeySpec;

import javax.crypto.Cipher;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;

import nexos.common.Consts;

import org.apache.commons.codec.binary.Hex;
import org.apache.commons.io.FileUtils;
import org.jasypt.encryption.pbe.PBEStringCleanablePasswordEncryptor;
import org.jasypt.encryption.pbe.config.PBEConfig;
import org.jasypt.salt.SaltGenerator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import sun.misc.BASE64Decoder;
import sun.misc.BASE64Encoder;

/**
 * Class: CommonEncryptor<br>
 * Description: 항목 중 암호화가 필요한 항목에 대해 암호화 처리 - AES-128<br>
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
public class CommonEncryptor implements PBEStringCleanablePasswordEncryptor {

  private final Logger         logger                      = LoggerFactory.getLogger(CommonEncryptor.class);

  private final String         SK_ALGORITHM                = "AES";
  private final String         PT_ALGORITHM                = "AES/CBC/PKCS5Padding";
  private final String         HASH_ALGORITHM              = "SHA-512";
  private final String         RSA_ALGORITHM               = "RSA/ECB/PKCS1Padding";

  // RSA keys must be no longer than 16384 bits
  private final int            RSA_GEN_KEY_SIZE            = 1024;

  private final String         RSA_DEF_PUBLIC_KEY_FILE_NM  = "nexos/config/publicKey_0000.xml";
  private final String         RSA_DEF_PRIVATE_KEY_FILE_NM = "nexos/config/privateKey_0000.xml";

  // private String password = "";
  private String               secureKey                   = "576a6b2f4e555968537a496c567a4641526a5a2b55513d3d";
  private SecretKeySpec        secureKeySpec               = null;
  private String               ivParameter                 = "55583432526b417856795579537946474e54383557673d3d";
  private IvParameterSpec      ivParameterSpec             = null;

  private Cipher               aesEncoder                  = null;
  private Cipher               aesDecoder                  = null;

  private Cipher               rsaEncoder                  = null;
  private Cipher               rsaDecoder                  = null;

  // private final int RSA_ENC_MAX_BYTE = (RSA_KEY_SIZE / 8) - 11;
  // private final int RSA_DEC_MAX_BYTE = (RSA_KEY_SIZE / 8);

  private RSAPrivateCrtKeySpec rsaPrivateKeySpec           = null;
  private PrivateKey           rsaPrivateKey               = null;
  private RSAPublicKeySpec     rsaPublicKeySpec            = null;
  private PublicKey            rsaPublicKey                = null;

  private BASE64Encoder        b64Encoder                  = null;
  private BASE64Decoder        b64Decoder                  = null;

  private boolean              isInitialized               = false;

  public synchronized void setConfig(final PBEConfig config) {

    /*
     * if (config == null) {
     * return;
     * }
     * this.algorithm = config.getAlgorithm();
     * try {
     * this.password = config.getPassword();
     * this.seed = this.password.getBytes(CHARSET);
     * } catch (Exception e) {
     * this.password = null;
     * this.seed = null;
     * }
     * isInitialized = false;
     */
  }

  public void setAlgorithm(final String algorithm) {

    /*
     * this.algorithm = algorithm;
     * isInitialized = false;
     */
  }

  @Override
  public void setPassword(final String password) {

    /*
     * try {
     * this.password = password;
     * this.seed = this.password.getBytes(CHARSET);
     * } catch (Exception e) {
     * this.password = null;
     * this.seed = null;
     * }
     * isInitialized = false;
     */
  }

  @Override
  public void setPasswordCharArray(char[ ] password) {

    /*
     * setPassword(new String(password));
     */
  }

  public void setKeyObtentionIterations(final int keyObtentionIterations) {

  }

  public void setSaltGenerator(final SaltGenerator saltGenerator) {

  }

  public void setProviderName(final String providerName) {

  }

  public void setProvider(final Provider provider) {

  }

  public synchronized void setStringOutputType(final String stringOutputType) {

  }

  public boolean isInitialized() {

    return isInitialized;
  }

  public synchronized void initialize() {

    if (!this.isInitialized()) {
      initializeSpecifics();
    }
  }

  private void initializeSpecifics() {
    try {
      b64Encoder = new BASE64Encoder();
      b64Decoder = new BASE64Decoder();;

      secureKeySpec = new SecretKeySpec(decryptBase64(new String(Hex.decodeHex(secureKey.toCharArray()))), SK_ALGORITHM);
      ivParameterSpec = new IvParameterSpec(decryptBase64(new String(Hex.decodeHex(ivParameter.toCharArray()))));

      aesEncoder = Cipher.getInstance(PT_ALGORITHM);
      aesDecoder = Cipher.getInstance(PT_ALGORITHM);

      rsaEncoder = Cipher.getInstance(RSA_ALGORITHM);
      rsaDecoder = Cipher.getInstance(RSA_ALGORITHM);

      Object[ ] rsaKeys = getPrivateKey();
      rsaPrivateKeySpec = (RSAPrivateCrtKeySpec)rsaKeys[0];
      rsaPrivateKey = (PrivateKey)rsaKeys[1];
      rsaKeys = getPublicKey();
      rsaPublicKeySpec = (RSAPublicKeySpec)rsaKeys[0];
      rsaPublicKey = (PublicKey)rsaKeys[1];

      isInitialized = true;
    } catch (Exception e) {
      isInitialized = false;
    }
  }

  @Override
  public String encrypt(final String message) {

    if (message == null) {
      return null;
    }

    // Check initialization
    if (!isInitialized()) {
      initialize();
    }

    String result;
    try {
      aesEncoder.init(Cipher.ENCRYPT_MODE, secureKeySpec, ivParameterSpec);
      byte[ ] encryptedValue = aesEncoder.doFinal(message.getBytes(Consts.CHARSET));
      result = encryptBase64(encryptedValue);
    } catch (Exception e) {
      result = message;
    }
    return result;
  }

  @Override
  public String decrypt(final String encryptedMessage) {

    if (encryptedMessage == null) {
      return null;
    }

    // Check initialization
    if (!isInitialized()) {
      initialize();
    }
    String result;

    try {
      aesDecoder.init(Cipher.DECRYPT_MODE, secureKeySpec, ivParameterSpec);
      byte[ ] decryptedValue = decryptBase64(encryptedMessage);
      result = new String(aesDecoder.doFinal(decryptedValue), Consts.CHARSET);
    } catch (Exception e) {
      result = encryptedMessage;
    }
    return result;
  }

  public String encryptHASH(final String message) {

    String result = "";
    try {
      MessageDigest messageDigest = MessageDigest.getInstance(HASH_ALGORITHM);
      messageDigest.update(message.getBytes(Consts.CHARSET));

      result = toHexString(messageDigest.digest());
    } catch (Exception e) {
      result = message;
    }
    return result;
  }

  public boolean generateKeyFiles(String publicKeyFileName, String privateKeyFileName) {

    boolean result = false;

    // RSA PublicKey/PrivateKey 생성
    FileOutputStream fosKeyFile = null;
    try {
      KeyPairGenerator keyPairGenerator = KeyPairGenerator.getInstance("RSA");
      keyPairGenerator.initialize(RSA_GEN_KEY_SIZE);

      KeyPair keyPair = keyPairGenerator.genKeyPair();
      PublicKey publicKey = keyPair.getPublic();
      PrivateKey privateKey = keyPair.getPrivate();

      KeyFactory keyFactory = KeyFactory.getInstance("RSA");
      RSAPublicKeySpec publicKeySpec = keyFactory.getKeySpec(publicKey, RSAPublicKeySpec.class);
      RSAPrivateCrtKeySpec privateKeySpec = keyFactory.getKeySpec(privateKey, RSAPrivateCrtKeySpec.class);

      // Public Key 저장
      StringBuffer sbKeyXML = new StringBuffer();
      sbKeyXML.append("<RSAKeyValue>");
      sbKeyXML.append("<Modulus>").append(encryptBase64(publicKeySpec.getModulus().toByteArray())).append("</Modulus>");
      sbKeyXML.append("<Exponent>").append(encryptBase64(publicKeySpec.getPublicExponent().toByteArray()))
        .append("</Exponent>");
      sbKeyXML.append("</RSAKeyValue>");
      FileUtils.writeStringToFile(new File(publicKeyFileName), sbKeyXML.toString(), Consts.CHARSET);
      sbKeyXML.setLength(0);

      // Private Key 저장
      sbKeyXML.append("<RSAKeyValue>");
      sbKeyXML.append("<Modulus>").append(encryptBase64(privateKeySpec.getModulus().toByteArray()))
        .append("</Modulus>");
      sbKeyXML.append("<Exponent>").append(encryptBase64(privateKeySpec.getPublicExponent().toByteArray()))
        .append("</Exponent>");
      sbKeyXML.append("<P>").append(encryptBase64(privateKeySpec.getPrimeP().toByteArray())).append("</P>");
      sbKeyXML.append("<Q>").append(encryptBase64(privateKeySpec.getPrimeQ().toByteArray())).append("</Q>");
      sbKeyXML.append("<DP>").append(encryptBase64(privateKeySpec.getPrimeExponentP().toByteArray())).append("</DP>");
      sbKeyXML.append("<DQ>").append(encryptBase64(privateKeySpec.getPrimeExponentQ().toByteArray())).append("</DQ>");
      sbKeyXML.append("<InverseQ>").append(encryptBase64(privateKeySpec.getCrtCoefficient().toByteArray()))
        .append("</InverseQ>");
      sbKeyXML.append("<D>").append(encryptBase64(privateKeySpec.getPrivateExponent().toByteArray())).append("</D>");
      sbKeyXML.append("</RSAKeyValue>");
      FileUtils.writeStringToFile(new File(privateKeyFileName), sbKeyXML.toString(), Consts.CHARSET);

      // // Public Key 저장
      // X509EncodedKeySpec x509EncodedKeySpec = new X509EncodedKeySpec(publicKey.getEncoded());
      // fosKeyFile = new FileOutputStream(publicKeyFileName);
      // fosKeyFile.write(x509EncodedKeySpec.getEncoded());
      // fosKeyFile.close();
      //
      // // Private Key 저장
      // PKCS8EncodedKeySpec pkcs8EncodedKeySpec = new PKCS8EncodedKeySpec(privateKey.getEncoded());
      // fosKeyFile = new FileOutputStream(privateKeyFileName);
      // fosKeyFile.write(pkcs8EncodedKeySpec.getEncoded());
      // fosKeyFile.close();

      result = true;
    } catch (Exception e) {
      logger.error("CommonEncryptor[generateKeyFiles] Error", e);
    } finally {
      if (fosKeyFile != null) {
        try {
          fosKeyFile.close();
        } catch (Exception e) {
        }
      }
    }

    return result;
  }

  public Object[ ] getPrivateKey() {

    return getPrivateKey(RSA_DEF_PRIVATE_KEY_FILE_NM);
  }

  public Object[ ] getPrivateKey(String keyFileName) {

    RSAPrivateCrtKeySpec resultKeySpec = null;
    PrivateKey resultKey = null;

    InputStream isKey = null;
    org.springframework.core.io.Resource resKey = null;
    try {
      resKey = new ClassPathResource(keyFileName);
      isKey = resKey.getInputStream();

      KeyFactory keyFactory = KeyFactory.getInstance("RSA");

      BigInteger rsaModules = null;
      BigInteger rsaPublicExponent = null;
      BigInteger rsaPrivateExponent = null;
      BigInteger rsaPrimeP = null;
      BigInteger rsaPrimeQ = null;
      BigInteger rsaPrimeExponentP = null;
      BigInteger rsaPrimeExponentQ = null;
      BigInteger rsaCrtCoefficient = null;

      DocumentBuilderFactory xmlFactory = DocumentBuilderFactory.newInstance();
      DocumentBuilder xmlBuilder = xmlFactory.newDocumentBuilder();

      Document xmlDoc = xmlBuilder.parse(isKey);
      Element xmlRootElement = (Element)xmlDoc.getDocumentElement();

      NodeList nodeList = ((Node)xmlRootElement).getChildNodes();
      for (int i = 0, listCount = nodeList.getLength(); i < listCount; i++) {
        Node node = nodeList.item(i);
        if (node.getNodeType() == Node.ELEMENT_NODE) {
          Element xmlElement = (Element)node;
          String xmlNodeName = ((Node)xmlElement).getNodeName();
          if (xmlNodeName.equals("Modulus")) {
            rsaModules = new BigInteger(1, decryptBase64(((Node)xmlElement).getTextContent().trim()));
          } else if (xmlNodeName.equals("Exponent")) {
            rsaPublicExponent = new BigInteger(1, decryptBase64(((Node)xmlElement).getTextContent().trim()));
          } else if (xmlNodeName.equals("P")) {
            rsaPrimeP = new BigInteger(1, decryptBase64(((Node)xmlElement).getTextContent().trim()));
          } else if (xmlNodeName.equals("Q")) {
            rsaPrimeQ = new BigInteger(1, decryptBase64(((Node)xmlElement).getTextContent().trim()));
          } else if (xmlNodeName.equals("DP")) {
            rsaPrimeExponentP = new BigInteger(1, decryptBase64(((Node)xmlElement).getTextContent().trim()));
          } else if (xmlNodeName.equals("DQ")) {
            rsaPrimeExponentQ = new BigInteger(1, decryptBase64(((Node)xmlElement).getTextContent().trim()));
          } else if (xmlNodeName.equals("InverseQ")) {
            rsaCrtCoefficient = new BigInteger(1, decryptBase64(((Node)xmlElement).getTextContent().trim()));
          } else if (xmlNodeName.equals("D")) {
            rsaPrivateExponent = new BigInteger(1, decryptBase64(((Node)xmlElement).getTextContent().trim()));
          }
        }
      }

      resultKeySpec = new RSAPrivateCrtKeySpec(rsaModules, rsaPublicExponent, rsaPrivateExponent, rsaPrimeP, rsaPrimeQ,
        rsaPrimeExponentP, rsaPrimeExponentQ, rsaCrtCoefficient);

      resultKey = keyFactory.generatePrivate(resultKeySpec);
    } catch (Exception e) {
      logger.error("CommonEncryptor[getPrivateKey] Error", e);
    } finally {
      if (isKey != null) {
        try {
          isKey.close();
        } catch (Exception e) {
        }
      }
    }

    return new Object[ ] {resultKeySpec, resultKey};
  }

  public Object[ ] getPublicKey() {

    return getPublicKey(RSA_DEF_PUBLIC_KEY_FILE_NM);
  }

  public Object[ ] getPublicKey(String keyFileName) {

    RSAPublicKeySpec resultKeySpec = null;
    PublicKey resultKey = null;

    InputStream isKey = null;
    org.springframework.core.io.Resource resKey = null;
    try {
      resKey = new ClassPathResource(keyFileName);
      isKey = resKey.getInputStream();
      KeyFactory keyFactory = KeyFactory.getInstance("RSA");

      BigInteger rsaModules = null;
      BigInteger rsaPublicExponent = null;

      DocumentBuilderFactory xmlFactory = DocumentBuilderFactory.newInstance();
      DocumentBuilder xmlBuilder = xmlFactory.newDocumentBuilder();

      Document xmlDoc = xmlBuilder.parse(isKey);
      Element xmlRootElement = (Element)xmlDoc.getDocumentElement();

      NodeList nodeList = ((Node)xmlRootElement).getChildNodes();
      for (int i = 0, listCount = nodeList.getLength(); i < listCount; i++) {
        Node node = nodeList.item(i);
        if (node.getNodeType() == Node.ELEMENT_NODE) {
          Element xmlElement = (Element)node;
          String xmlNodeName = ((Node)xmlElement).getNodeName();
          if (xmlNodeName.equals("Modulus")) {
            rsaModules = new BigInteger(1, decryptBase64(((Node)xmlElement).getTextContent().trim()));
          } else if (xmlNodeName.equals("Exponent")) {
            rsaPublicExponent = new BigInteger(1, decryptBase64(((Node)xmlElement).getTextContent().trim()));
          }
        }
      }

      resultKeySpec = new RSAPublicKeySpec(rsaModules, rsaPublicExponent);

      resultKey = keyFactory.generatePublic(resultKeySpec);
    } catch (Exception e) {
      logger.error("CommonEncryptor[getPublicKey] Error", e);
    } finally {
      if (isKey != null) {
        try {
          isKey.close();
        } catch (Exception e) {
        }
      }
    }

    return new Object[ ] {resultKeySpec, resultKey};
  }

  public String encryptRSA(String message, String publicKeyFileName) {

    Object[ ] rsaKeys = getPublicKey(publicKeyFileName);

    return encryptRSA(message, (RSAPublicKeySpec)rsaKeys[0], (PublicKey)rsaKeys[1]);
  }

  public String encryptRSA(String message) {

    return encryptRSA(message, rsaPublicKeySpec, rsaPublicKey);
  }

  public String encryptRSA(String message, RSAPublicKeySpec publicKeySpec, PublicKey publicKey) {

    if (message == null) {
      return null;
    }

    // Check initialization
    if (!isInitialized()) {
      initialize();
    }

    String result;
    int rsaEncMaxLength = (publicKeySpec.getModulus().bitLength() / 8) - 11;
    ByteArrayInputStream bisMessage = null;
    ByteArrayOutputStream bosMessage = null;
    byte[ ] encryptedValue = null;
    try {
      rsaEncoder.init(Cipher.ENCRYPT_MODE, publicKey);

      byte[ ] byteMessage = message.getBytes(Consts.CHARSET);
      int length = byteMessage.length;
      if (length > rsaEncMaxLength) {

        try {
          bisMessage = new ByteArrayInputStream(byteMessage);
          bosMessage = new ByteArrayOutputStream();
          int readCount = 0;
          byte[ ] byteBuff = new byte[rsaEncMaxLength];
          while ((readCount = bisMessage.read(byteBuff)) != -1) {
            bosMessage.write(rsaEncoder.doFinal(byteBuff, 0, readCount));
          }
          encryptedValue = bosMessage.toByteArray();
        } catch (Exception e) {
        }
      } else {
        encryptedValue = rsaEncoder.doFinal(byteMessage);
      }

      result = encryptBase64(encryptedValue);
    } catch (Exception e) {
      logger.error("CommonEncryptor[encryptRSA] Error", e);
      result = message;
    } finally {
      if (bisMessage != null)
        try {
          bisMessage.close();
        } catch (Exception e) {
        }
      if (bosMessage != null)
        try {
          bosMessage.close();
        } catch (Exception e) {
        }
    }
    return result;

  }

  public String decryptRSA(final String encryptedMessage, final String privateKeyFileName) {

    Object[ ] rsaKeys = getPrivateKey(privateKeyFileName);

    return decryptRSA(encryptedMessage, (RSAPrivateCrtKeySpec)rsaKeys[0], (PrivateKey)rsaKeys[1]);
  }

  public String decryptRSA(final String encryptedMessage) {

    return decryptRSA(encryptedMessage, rsaPrivateKeySpec, rsaPrivateKey);
  }

  public String decryptRSA(final String encryptedMessage, RSAPrivateCrtKeySpec privateKeySpec, PrivateKey privateKey) {

    if (encryptedMessage == null) {
      return null;
    }

    // Check initialization
    if (!isInitialized()) {
      initialize();
    }

    String result;
    int rsaDecMaxLength = (privateKeySpec.getModulus().bitLength() / 8);
    ByteArrayInputStream bisMessage = null;
    ByteArrayOutputStream bosMessage = null;
    try {
      rsaDecoder.init(Cipher.DECRYPT_MODE, privateKey);
      byte[ ] decryptedValue = decryptBase64(encryptedMessage);

      int length = decryptedValue.length;
      if (length > rsaDecMaxLength) {
        bisMessage = new ByteArrayInputStream(decryptedValue);
        bosMessage = new ByteArrayOutputStream();
        int readCount = 0;
        byte[ ] byteBuff = new byte[rsaDecMaxLength];
        while ((readCount = bisMessage.read(byteBuff)) != -1) {
          bosMessage.write(rsaDecoder.doFinal(byteBuff, 0, readCount));
        }
        result = new String(bosMessage.toByteArray(), Consts.CHARSET);
      } else {
        result = new String(rsaDecoder.doFinal(decryptedValue), Consts.CHARSET);
      }
    } catch (Exception e) {
      logger.error("CommonEncryptor[decryptRSA] Error", e);
      result = encryptedMessage;
    } finally {
      if (bisMessage != null)
        try {
          bisMessage.close();
        } catch (Exception e) {
        }
      if (bosMessage != null)
        try {
          bosMessage.close();
        } catch (Exception e) {
        }
    }

    return result;
  }

  public String encryptBase64(String message) {

    String result = "";

    if (message == null) {
      return result;
    }

    byte[ ] byteMessage;
    try {
      byteMessage = message.getBytes(Consts.CHARSET);
    } catch (Exception e) {
      return message;
    }

    return encryptBase64(byteMessage);
  }

  public String encryptBase64(byte[ ] message) {

    String result = "";

    try {
      result = b64Encoder.encode(message);
    } catch (Exception e) {
    } finally {
      if (result == null) {
        result = "";
      }
    }

    return result.replaceAll("(?:\\r\\n|\\n\\r|\\n|\\r)", "");
  }

  public byte[ ] decryptBase64(String encryptedMessage) {

    byte[ ] result = null;

    try {
      result = b64Decoder.decodeBuffer(encryptedMessage);
    } catch (IOException e) {
      result = new byte[0];
    }

    return result;
  }

  private String toHexString(byte[ ] message) {

    String result = "";

    StringBuffer buffer = new StringBuffer();
    for (int i = 0; i < message.length; i++) {
      buffer.append(Integer.toString((message[i] & 0xff) + 0x100, 16).substring(1));
    }
    result = buffer.toString();

    return result;
  }

}
