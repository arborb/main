/**
 * TradingNetworks.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unused"})
public class TradingNetworks implements java.io.Serializable {
  private java.lang.String senderId;

  private java.lang.String senderQualifier;

  private java.lang.String receiverId;

  private java.lang.String receiverQualifier;

  private java.lang.String envelopeDateTime;

  public TradingNetworks() {
  }

  public TradingNetworks(java.lang.String senderId, java.lang.String senderQualifier, java.lang.String receiverId,
    java.lang.String receiverQualifier, java.lang.String envelopeDateTime) {
    this.senderId = senderId;
    this.senderQualifier = senderQualifier;
    this.receiverId = receiverId;
    this.receiverQualifier = receiverQualifier;
    this.envelopeDateTime = envelopeDateTime;
  }

  /**
   * Gets the senderId value for this TradingNetworks.
   * 
   * @return senderId
   */
  public java.lang.String getSenderId() {
    return senderId;
  }

  /**
   * Sets the senderId value for this TradingNetworks.
   * 
   * @param senderId
   */
  public void setSenderId(java.lang.String senderId) {
    this.senderId = senderId;
  }

  /**
   * Gets the senderQualifier value for this TradingNetworks.
   * 
   * @return senderQualifier
   */
  public java.lang.String getSenderQualifier() {
    return senderQualifier;
  }

  /**
   * Sets the senderQualifier value for this TradingNetworks.
   * 
   * @param senderQualifier
   */
  public void setSenderQualifier(java.lang.String senderQualifier) {
    this.senderQualifier = senderQualifier;
  }

  /**
   * Gets the receiverId value for this TradingNetworks.
   * 
   * @return receiverId
   */
  public java.lang.String getReceiverId() {
    return receiverId;
  }

  /**
   * Sets the receiverId value for this TradingNetworks.
   * 
   * @param receiverId
   */
  public void setReceiverId(java.lang.String receiverId) {
    this.receiverId = receiverId;
  }

  /**
   * Gets the receiverQualifier value for this TradingNetworks.
   * 
   * @return receiverQualifier
   */
  public java.lang.String getReceiverQualifier() {
    return receiverQualifier;
  }

  /**
   * Sets the receiverQualifier value for this TradingNetworks.
   * 
   * @param receiverQualifier
   */
  public void setReceiverQualifier(java.lang.String receiverQualifier) {
    this.receiverQualifier = receiverQualifier;
  }

  /**
   * Gets the envelopeDateTime value for this TradingNetworks.
   * 
   * @return envelopeDateTime
   */
  public java.lang.String getEnvelopeDateTime() {
    return envelopeDateTime;
  }

  /**
   * Sets the envelopeDateTime value for this TradingNetworks.
   * 
   * @param envelopeDateTime
   */
  public void setEnvelopeDateTime(java.lang.String envelopeDateTime) {
    this.envelopeDateTime = envelopeDateTime;
  }

  private java.lang.Object __equalsCalc = null;

  public synchronized boolean equals(java.lang.Object obj) {
    if (!(obj instanceof TradingNetworks))
      return false;
    TradingNetworks other = (TradingNetworks)obj;
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
      && ((this.senderId == null && other.getSenderId() == null) || (this.senderId != null && this.senderId
        .equals(other.getSenderId())))
      && ((this.senderQualifier == null && other.getSenderQualifier() == null) || (this.senderQualifier != null && this.senderQualifier
        .equals(other.getSenderQualifier())))
      && ((this.receiverId == null && other.getReceiverId() == null) || (this.receiverId != null && this.receiverId
        .equals(other.getReceiverId())))
      && ((this.receiverQualifier == null && other.getReceiverQualifier() == null) || (this.receiverQualifier != null && this.receiverQualifier
        .equals(other.getReceiverQualifier())))
      && ((this.envelopeDateTime == null && other.getEnvelopeDateTime() == null) || (this.envelopeDateTime != null && this.envelopeDateTime
        .equals(other.getEnvelopeDateTime())));
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
    if (getSenderId() != null) {
      _hashCode += getSenderId().hashCode();
    }
    if (getSenderQualifier() != null) {
      _hashCode += getSenderQualifier().hashCode();
    }
    if (getReceiverId() != null) {
      _hashCode += getReceiverId().hashCode();
    }
    if (getReceiverQualifier() != null) {
      _hashCode += getReceiverQualifier().hashCode();
    }
    if (getEnvelopeDateTime() != null) {
      _hashCode += getEnvelopeDateTime().hashCode();
    }
    __hashCodeCalc = false;
    return _hashCode;
  }

  // Type metadata
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(
                                                                 TradingNetworks.class, true);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "TradingNetworks"));
    org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("senderId");
    elemField.setXmlName(new javax.xml.namespace.QName("", "SenderId"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("senderQualifier");
    elemField.setXmlName(new javax.xml.namespace.QName("", "SenderQualifier"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("receiverId");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ReceiverId"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("receiverQualifier");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ReceiverQualifier"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("envelopeDateTime");
    elemField.setXmlName(new javax.xml.namespace.QName("", "EnvelopeDateTime"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
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
