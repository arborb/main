/**
 * ResultMessage2.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unused"})
public class ResultMessage2 implements java.io.Serializable {
  private java.lang.String                                     messageCode;

  private nexos.service.ed.ws.elca.corpOnLineEcom.MessageType2 messageType;

  private java.lang.String                                     messageDescription;

  public ResultMessage2() {
  }

  public ResultMessage2(java.lang.String messageCode, nexos.service.ed.ws.elca.corpOnLineEcom.MessageType2 messageType,
    java.lang.String messageDescription) {
    this.messageCode = messageCode;
    this.messageType = messageType;
    this.messageDescription = messageDescription;
  }

  /**
   * Gets the messageCode value for this ResultMessage2.
   * 
   * @return messageCode
   */
  public java.lang.String getMessageCode() {
    return messageCode;
  }

  /**
   * Sets the messageCode value for this ResultMessage2.
   * 
   * @param messageCode
   */
  public void setMessageCode(java.lang.String messageCode) {
    this.messageCode = messageCode;
  }

  /**
   * Gets the messageType value for this ResultMessage2.
   * 
   * @return messageType
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.MessageType2 getMessageType() {
    return messageType;
  }

  /**
   * Sets the messageType value for this ResultMessage2.
   * 
   * @param messageType
   */
  public void setMessageType(nexos.service.ed.ws.elca.corpOnLineEcom.MessageType2 messageType) {
    this.messageType = messageType;
  }

  /**
   * Gets the messageDescription value for this ResultMessage2.
   * 
   * @return messageDescription
   */
  public java.lang.String getMessageDescription() {
    return messageDescription;
  }

  /**
   * Sets the messageDescription value for this ResultMessage2.
   * 
   * @param messageDescription
   */
  public void setMessageDescription(java.lang.String messageDescription) {
    this.messageDescription = messageDescription;
  }

  private java.lang.Object __equalsCalc = null;

  public synchronized boolean equals(java.lang.Object obj) {
    if (!(obj instanceof ResultMessage2))
      return false;
    ResultMessage2 other = (ResultMessage2)obj;
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
      && ((this.messageCode == null && other.getMessageCode() == null) || (this.messageCode != null && this.messageCode
        .equals(other.getMessageCode())))
      && ((this.messageType == null && other.getMessageType() == null) || (this.messageType != null && this.messageType
        .equals(other.getMessageType())))
      && ((this.messageDescription == null && other.getMessageDescription() == null) || (this.messageDescription != null && this.messageDescription
        .equals(other.getMessageDescription())));
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
    if (getMessageCode() != null) {
      _hashCode += getMessageCode().hashCode();
    }
    if (getMessageType() != null) {
      _hashCode += getMessageType().hashCode();
    }
    if (getMessageDescription() != null) {
      _hashCode += getMessageDescription().hashCode();
    }
    __hashCodeCalc = false;
    return _hashCode;
  }

  // Type metadata
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(
                                                                 ResultMessage2.class, true);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ResultMessage2"));
    org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("messageCode");
    elemField.setXmlName(new javax.xml.namespace.QName("", "MessageCode"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("messageType");
    elemField.setXmlName(new javax.xml.namespace.QName("", "MessageType"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "MessageType2"));
    elemField.setMinOccurs(0);
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("messageDescription");
    elemField.setXmlName(new javax.xml.namespace.QName("", "MessageDescription"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(false);
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
