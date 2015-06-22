/**
 * ControlAmount.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unused"})
public class ControlAmount implements java.io.Serializable {
  private java.lang.String     name;

  private java.lang.String     units;

  private java.lang.String     type;

  private java.math.BigDecimal value;

  public ControlAmount() {
  }

  public ControlAmount(java.lang.String name, java.lang.String units, java.lang.String type, java.math.BigDecimal value) {
    this.name = name;
    this.units = units;
    this.type = type;
    this.value = value;
  }

  /**
   * Gets the name value for this ControlAmount.
   * 
   * @return name
   */
  public java.lang.String getName() {
    return name;
  }

  /**
   * Sets the name value for this ControlAmount.
   * 
   * @param name
   */
  public void setName(java.lang.String name) {
    this.name = name;
  }

  /**
   * Gets the units value for this ControlAmount.
   * 
   * @return units
   */
  public java.lang.String getUnits() {
    return units;
  }

  /**
   * Sets the units value for this ControlAmount.
   * 
   * @param units
   */
  public void setUnits(java.lang.String units) {
    this.units = units;
  }

  /**
   * Gets the type value for this ControlAmount.
   * 
   * @return type
   */
  public java.lang.String getType() {
    return type;
  }

  /**
   * Sets the type value for this ControlAmount.
   * 
   * @param type
   */
  public void setType(java.lang.String type) {
    this.type = type;
  }

  /**
   * Gets the value value for this ControlAmount.
   * 
   * @return value
   */
  public java.math.BigDecimal getValue() {
    return value;
  }

  /**
   * Sets the value value for this ControlAmount.
   * 
   * @param value
   */
  public void setValue(java.math.BigDecimal value) {
    this.value = value;
  }

  private java.lang.Object __equalsCalc = null;

  public synchronized boolean equals(java.lang.Object obj) {
    if (!(obj instanceof ControlAmount))
      return false;
    ControlAmount other = (ControlAmount)obj;
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
      && ((this.name == null && other.getName() == null) || (this.name != null && this.name.equals(other.getName())))
      && ((this.units == null && other.getUnits() == null) || (this.units != null && this.units
        .equals(other.getUnits())))
      && ((this.type == null && other.getType() == null) || (this.type != null && this.type.equals(other.getType())))
      && ((this.value == null && other.getValue() == null) || (this.value != null && this.value
        .equals(other.getValue())));
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
    if (getName() != null) {
      _hashCode += getName().hashCode();
    }
    if (getUnits() != null) {
      _hashCode += getUnits().hashCode();
    }
    if (getType() != null) {
      _hashCode += getType().hashCode();
    }
    if (getValue() != null) {
      _hashCode += getValue().hashCode();
    }
    __hashCodeCalc = false;
    return _hashCode;
  }

  // Type metadata
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(
                                                                 ControlAmount.class, true);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ControlAmount"));
    org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("name");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Name"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("units");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Units"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("type");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Type"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("value");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Value"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "decimal"));
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
