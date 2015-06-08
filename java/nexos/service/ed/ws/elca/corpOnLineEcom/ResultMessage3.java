/**
 * ResultMessage3.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unused"})
public class ResultMessage3 implements java.io.Serializable, org.apache.axis.encoding.AnyContentType {
  private java.lang.String                         briefMessage;

  private java.lang.String                         fullMessage;

  private java.lang.String                         messageCode;

  private java.lang.String                         messageType;

  private org.apache.axis.message.MessageElement[] _any;

  public ResultMessage3() {
  }

  public ResultMessage3(java.lang.String briefMessage, java.lang.String fullMessage, java.lang.String messageCode,
    java.lang.String messageType, org.apache.axis.message.MessageElement[] _any) {
    this.briefMessage = briefMessage;
    this.fullMessage = fullMessage;
    this.messageCode = messageCode;
    this.messageType = messageType;
    this._any = _any;
  }

  /**
   * Gets the briefMessage value for this ResultMessage3.
   * 
   * @return briefMessage
   */
  public java.lang.String getBriefMessage() {
    return briefMessage;
  }

  /**
   * Sets the briefMessage value for this ResultMessage3.
   * 
   * @param briefMessage
   */
  public void setBriefMessage(java.lang.String briefMessage) {
    this.briefMessage = briefMessage;
  }

  /**
   * Gets the fullMessage value for this ResultMessage3.
   * 
   * @return fullMessage
   */
  public java.lang.String getFullMessage() {
    return fullMessage;
  }

  /**
   * Sets the fullMessage value for this ResultMessage3.
   * 
   * @param fullMessage
   */
  public void setFullMessage(java.lang.String fullMessage) {
    this.fullMessage = fullMessage;
  }

  /**
   * Gets the messageCode value for this ResultMessage3.
   * 
   * @return messageCode
   */
  public java.lang.String getMessageCode() {
    return messageCode;
  }

  /**
   * Sets the messageCode value for this ResultMessage3.
   * 
   * @param messageCode
   */
  public void setMessageCode(java.lang.String messageCode) {
    this.messageCode = messageCode;
  }

  /**
   * Gets the messageType value for this ResultMessage3.
   * 
   * @return messageType
   */
  public java.lang.String getMessageType() {
    return messageType;
  }

  /**
   * Sets the messageType value for this ResultMessage3.
   * 
   * @param messageType
   */
  public void setMessageType(java.lang.String messageType) {
    this.messageType = messageType;
  }

  /**
   * Gets the _any value for this ResultMessage3.
   * 
   * @return _any
   */
  public org.apache.axis.message.MessageElement[] get_any() {
    return _any;
  }

  /**
   * Sets the _any value for this ResultMessage3.
   * 
   * @param _any
   */
  public void set_any(org.apache.axis.message.MessageElement[] _any) {
    this._any = _any;
  }

  private java.lang.Object __equalsCalc = null;

  public synchronized boolean equals(java.lang.Object obj) {
    if (!(obj instanceof ResultMessage3))
      return false;
    ResultMessage3 other = (ResultMessage3)obj;
    if (obj == null)
      return false;
    if (this == obj)
      return true;
    if (__equalsCalc != null) {
      return (__equalsCalc == obj);
    }
    __equalsCalc = obj;
    boolean _equals;
    _equals = true
      && ((this.briefMessage == null && other.getBriefMessage() == null) || (this.briefMessage != null && this.briefMessage
        .equals(other.getBriefMessage())))
      && ((this.fullMessage == null && other.getFullMessage() == null) || (this.fullMessage != null && this.fullMessage
        .equals(other.getFullMessage())))
      && ((this.messageCode == null && other.getMessageCode() == null) || (this.messageCode != null && this.messageCode
        .equals(other.getMessageCode())))
      && ((this.messageType == null && other.getMessageType() == null) || (this.messageType != null && this.messageType
        .equals(other.getMessageType())))
      && ((this._any == null && other.get_any() == null) || (this._any != null && java.util.Arrays.equals(this._any,
        other.get_any())));
    __equalsCalc = null;
    return _equals;
  }

  private boolean __hashCodeCalc = false;

  public synchronized int hashCode() {
    if (__hashCodeCalc) {
      return 0;
    }
    __hashCodeCalc = true;
    int _hashCode = 1;
    if (getBriefMessage() != null) {
      _hashCode += getBriefMessage().hashCode();
    }
    if (getFullMessage() != null) {
      _hashCode += getFullMessage().hashCode();
    }
    if (getMessageCode() != null) {
      _hashCode += getMessageCode().hashCode();
    }
    if (getMessageType() != null) {
      _hashCode += getMessageType().hashCode();
    }
    if (get_any() != null) {
      for (int i = 0; i < java.lang.reflect.Array.getLength(get_any()); i++) {
        java.lang.Object obj = java.lang.reflect.Array.get(get_any(), i);
        if (obj != null && !obj.getClass().isArray()) {
          _hashCode += obj.hashCode();
        }
      }
    }
    __hashCodeCalc = false;
    return _hashCode;
  }

  // Type metadata
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(
                                                                 ResultMessage3.class, true);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ResultMessage3"));
    org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("briefMessage");
    elemField.setXmlName(new javax.xml.namespace.QName("", "BriefMessage"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("fullMessage");
    elemField.setXmlName(new javax.xml.namespace.QName("", "FullMessage"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("messageCode");
    elemField.setXmlName(new javax.xml.namespace.QName("", "MessageCode"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("messageType");
    elemField.setXmlName(new javax.xml.namespace.QName("", "MessageType"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
  }

  /**
   * Return type metadata object
   */
  public static org.apache.axis.description.TypeDesc getTypeDesc() {
    return typeDesc;
  }

  /**
   * Get Custom Serializer
   */
  public static org.apache.axis.encoding.Serializer getSerializer(java.lang.String mechType, java.lang.Class _javaType,
    javax.xml.namespace.QName _xmlType) {
    return new org.apache.axis.encoding.ser.BeanSerializer(_javaType, _xmlType, typeDesc);
  }

  /**
   * Get Custom Deserializer
   */
  public static org.apache.axis.encoding.Deserializer getDeserializer(java.lang.String mechType,
    java.lang.Class _javaType, javax.xml.namespace.QName _xmlType) {
    return new org.apache.axis.encoding.ser.BeanDeserializer(_javaType, _xmlType, typeDesc);
  }

}
