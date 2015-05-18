/**
 * SplitControl2.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unused"})
public class SplitControl2 implements java.io.Serializable {
  private nexos.service.ed.ws.elca.corpOnLineEcom.SplitFlag2 splitFlag;

  private java.math.BigInteger                               sequence;

  private java.math.BigInteger                               count;

  public SplitControl2() {
  }

  public SplitControl2(nexos.service.ed.ws.elca.corpOnLineEcom.SplitFlag2 splitFlag, java.math.BigInteger sequence,
    java.math.BigInteger count) {
    this.splitFlag = splitFlag;
    this.sequence = sequence;
    this.count = count;
  }

  /**
   * Gets the splitFlag value for this SplitControl2.
   * 
   * @return splitFlag
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.SplitFlag2 getSplitFlag() {
    return splitFlag;
  }

  /**
   * Sets the splitFlag value for this SplitControl2.
   * 
   * @param splitFlag
   */
  public void setSplitFlag(nexos.service.ed.ws.elca.corpOnLineEcom.SplitFlag2 splitFlag) {
    this.splitFlag = splitFlag;
  }

  /**
   * Gets the sequence value for this SplitControl2.
   * 
   * @return sequence
   */
  public java.math.BigInteger getSequence() {
    return sequence;
  }

  /**
   * Sets the sequence value for this SplitControl2.
   * 
   * @param sequence
   */
  public void setSequence(java.math.BigInteger sequence) {
    this.sequence = sequence;
  }

  /**
   * Gets the count value for this SplitControl2.
   * 
   * @return count
   */
  public java.math.BigInteger getCount() {
    return count;
  }

  /**
   * Sets the count value for this SplitControl2.
   * 
   * @param count
   */
  public void setCount(java.math.BigInteger count) {
    this.count = count;
  }

  private java.lang.Object __equalsCalc = null;

  public synchronized boolean equals(java.lang.Object obj) {
    if (!(obj instanceof SplitControl2))
      return false;
    SplitControl2 other = (SplitControl2)obj;
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
      && ((this.splitFlag == null && other.getSplitFlag() == null) || (this.splitFlag != null && this.splitFlag
        .equals(other.getSplitFlag())))
      && ((this.sequence == null && other.getSequence() == null) || (this.sequence != null && this.sequence
        .equals(other.getSequence())))
      && ((this.count == null && other.getCount() == null) || (this.count != null && this.count
        .equals(other.getCount())));
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
    if (getSplitFlag() != null) {
      _hashCode += getSplitFlag().hashCode();
    }
    if (getSequence() != null) {
      _hashCode += getSequence().hashCode();
    }
    if (getCount() != null) {
      _hashCode += getCount().hashCode();
    }
    __hashCodeCalc = false;
    return _hashCode;
  }

  // Type metadata
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(
                                                                 SplitControl2.class, true);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "SplitControl2"));
    org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("splitFlag");
    elemField.setXmlName(new javax.xml.namespace.QName("", "SplitFlag"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "SplitFlag2"));
    elemField.setMinOccurs(0);
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("sequence");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Sequence"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "integer"));
    elemField.setMinOccurs(0);
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("count");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Count"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "integer"));
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
