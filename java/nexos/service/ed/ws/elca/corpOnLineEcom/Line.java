/**
 * Line.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unused"})
public class Line implements java.io.Serializable {
  private java.lang.String lineNumber;

  private java.lang.String materialNumber;

  private java.lang.String quantity;

  private java.lang.String unitPrice;

  private java.lang.String orderType;

  public Line() {
  }

  public Line(java.lang.String lineNumber, java.lang.String materialNumber, java.lang.String quantity,
    java.lang.String unitPrice, java.lang.String orderType) {
    this.lineNumber = lineNumber;
    this.materialNumber = materialNumber;
    this.quantity = quantity;
    this.unitPrice = unitPrice;
    this.orderType = orderType;
  }

  /**
   * Gets the lineNumber value for this Line.
   * 
   * @return lineNumber
   */
  public java.lang.String getLineNumber() {
    return lineNumber;
  }

  /**
   * Sets the lineNumber value for this Line.
   * 
   * @param lineNumber
   */
  public void setLineNumber(java.lang.String lineNumber) {
    this.lineNumber = lineNumber;
  }

  /**
   * Gets the materialNumber value for this Line.
   * 
   * @return materialNumber
   */
  public java.lang.String getMaterialNumber() {
    return materialNumber;
  }

  /**
   * Sets the materialNumber value for this Line.
   * 
   * @param materialNumber
   */
  public void setMaterialNumber(java.lang.String materialNumber) {
    this.materialNumber = materialNumber;
  }

  /**
   * Gets the quantity value for this Line.
   * 
   * @return quantity
   */
  public java.lang.String getQuantity() {
    return quantity;
  }

  /**
   * Sets the quantity value for this Line.
   * 
   * @param quantity
   */
  public void setQuantity(java.lang.String quantity) {
    this.quantity = quantity;
  }

  /**
   * Gets the unitPrice value for this Line.
   * 
   * @return unitPrice
   */
  public java.lang.String getUnitPrice() {
    return unitPrice;
  }

  /**
   * Sets the unitPrice value for this Line.
   * 
   * @param unitPrice
   */
  public void setUnitPrice(java.lang.String unitPrice) {
    this.unitPrice = unitPrice;
  }

  /**
   * Gets the orderType value for this Line.
   * 
   * @return orderType
   */
  public java.lang.String getOrderType() {
    return orderType;
  }

  /**
   * Sets the orderType value for this Line.
   * 
   * @param orderType
   */
  public void setOrderType(java.lang.String orderType) {
    this.orderType = orderType;
  }

  private java.lang.Object __equalsCalc = null;

  public synchronized boolean equals(java.lang.Object obj) {
    if (!(obj instanceof Line))
      return false;
    Line other = (Line)obj;
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
      && ((this.lineNumber == null && other.getLineNumber() == null) || (this.lineNumber != null && this.lineNumber
        .equals(other.getLineNumber())))
      && ((this.materialNumber == null && other.getMaterialNumber() == null) || (this.materialNumber != null && this.materialNumber
        .equals(other.getMaterialNumber())))
      && ((this.quantity == null && other.getQuantity() == null) || (this.quantity != null && this.quantity
        .equals(other.getQuantity())))
      && ((this.unitPrice == null && other.getUnitPrice() == null) || (this.unitPrice != null && this.unitPrice
        .equals(other.getUnitPrice())))
      && ((this.orderType == null && other.getOrderType() == null) || (this.orderType != null && this.orderType
        .equals(other.getOrderType())));
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
    if (getLineNumber() != null) {
      _hashCode += getLineNumber().hashCode();
    }
    if (getMaterialNumber() != null) {
      _hashCode += getMaterialNumber().hashCode();
    }
    if (getQuantity() != null) {
      _hashCode += getQuantity().hashCode();
    }
    if (getUnitPrice() != null) {
      _hashCode += getUnitPrice().hashCode();
    }
    if (getOrderType() != null) {
      _hashCode += getOrderType().hashCode();
    }
    __hashCodeCalc = false;
    return _hashCode;
  }

  // Type metadata
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(Line.class,
                                                                 true);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Line"));
    org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("lineNumber");
    elemField.setXmlName(new javax.xml.namespace.QName("", "LineNumber"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("materialNumber");
    elemField.setXmlName(new javax.xml.namespace.QName("", "MaterialNumber"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("quantity");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Quantity"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("unitPrice");
    elemField.setXmlName(new javax.xml.namespace.QName("", "UnitPrice"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("orderType");
    elemField.setXmlName(new javax.xml.namespace.QName("", "OrderType"));
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
