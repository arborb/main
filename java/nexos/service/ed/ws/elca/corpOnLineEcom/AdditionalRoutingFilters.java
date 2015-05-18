/**
 * AdditionalRoutingFilters.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unused"})
public class AdditionalRoutingFilters implements java.io.Serializable {
  private nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter1 routingFilter1;

  private nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter2 routingFilter2;

  private nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter3 routingFilter3;

  private nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter4 routingFilter4;

  private nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter5 routingFilter5;

  public AdditionalRoutingFilters() {
  }

  public AdditionalRoutingFilters(nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter1 routingFilter1,
    nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter2 routingFilter2,
    nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter3 routingFilter3,
    nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter4 routingFilter4,
    nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter5 routingFilter5) {
    this.routingFilter1 = routingFilter1;
    this.routingFilter2 = routingFilter2;
    this.routingFilter3 = routingFilter3;
    this.routingFilter4 = routingFilter4;
    this.routingFilter5 = routingFilter5;
  }

  /**
   * Gets the routingFilter1 value for this AdditionalRoutingFilters.
   * 
   * @return routingFilter1
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter1 getRoutingFilter1() {
    return routingFilter1;
  }

  /**
   * Sets the routingFilter1 value for this AdditionalRoutingFilters.
   * 
   * @param routingFilter1
   */
  public void setRoutingFilter1(nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter1 routingFilter1) {
    this.routingFilter1 = routingFilter1;
  }

  /**
   * Gets the routingFilter2 value for this AdditionalRoutingFilters.
   * 
   * @return routingFilter2
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter2 getRoutingFilter2() {
    return routingFilter2;
  }

  /**
   * Sets the routingFilter2 value for this AdditionalRoutingFilters.
   * 
   * @param routingFilter2
   */
  public void setRoutingFilter2(nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter2 routingFilter2) {
    this.routingFilter2 = routingFilter2;
  }

  /**
   * Gets the routingFilter3 value for this AdditionalRoutingFilters.
   * 
   * @return routingFilter3
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter3 getRoutingFilter3() {
    return routingFilter3;
  }

  /**
   * Sets the routingFilter3 value for this AdditionalRoutingFilters.
   * 
   * @param routingFilter3
   */
  public void setRoutingFilter3(nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter3 routingFilter3) {
    this.routingFilter3 = routingFilter3;
  }

  /**
   * Gets the routingFilter4 value for this AdditionalRoutingFilters.
   * 
   * @return routingFilter4
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter4 getRoutingFilter4() {
    return routingFilter4;
  }

  /**
   * Sets the routingFilter4 value for this AdditionalRoutingFilters.
   * 
   * @param routingFilter4
   */
  public void setRoutingFilter4(nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter4 routingFilter4) {
    this.routingFilter4 = routingFilter4;
  }

  /**
   * Gets the routingFilter5 value for this AdditionalRoutingFilters.
   * 
   * @return routingFilter5
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter5 getRoutingFilter5() {
    return routingFilter5;
  }

  /**
   * Sets the routingFilter5 value for this AdditionalRoutingFilters.
   * 
   * @param routingFilter5
   */
  public void setRoutingFilter5(nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter5 routingFilter5) {
    this.routingFilter5 = routingFilter5;
  }

  private java.lang.Object __equalsCalc = null;

  public synchronized boolean equals(java.lang.Object obj) {
    if (!(obj instanceof AdditionalRoutingFilters))
      return false;
    AdditionalRoutingFilters other = (AdditionalRoutingFilters)obj;
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
      && ((this.routingFilter1 == null && other.getRoutingFilter1() == null) || (this.routingFilter1 != null && this.routingFilter1
        .equals(other.getRoutingFilter1())))
      && ((this.routingFilter2 == null && other.getRoutingFilter2() == null) || (this.routingFilter2 != null && this.routingFilter2
        .equals(other.getRoutingFilter2())))
      && ((this.routingFilter3 == null && other.getRoutingFilter3() == null) || (this.routingFilter3 != null && this.routingFilter3
        .equals(other.getRoutingFilter3())))
      && ((this.routingFilter4 == null && other.getRoutingFilter4() == null) || (this.routingFilter4 != null && this.routingFilter4
        .equals(other.getRoutingFilter4())))
      && ((this.routingFilter5 == null && other.getRoutingFilter5() == null) || (this.routingFilter5 != null && this.routingFilter5
        .equals(other.getRoutingFilter5())));
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
    if (getRoutingFilter1() != null) {
      _hashCode += getRoutingFilter1().hashCode();
    }
    if (getRoutingFilter2() != null) {
      _hashCode += getRoutingFilter2().hashCode();
    }
    if (getRoutingFilter3() != null) {
      _hashCode += getRoutingFilter3().hashCode();
    }
    if (getRoutingFilter4() != null) {
      _hashCode += getRoutingFilter4().hashCode();
    }
    if (getRoutingFilter5() != null) {
      _hashCode += getRoutingFilter5().hashCode();
    }
    __hashCodeCalc = false;
    return _hashCode;
  }

  // Type metadata
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(
                                                                 AdditionalRoutingFilters.class, true);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "AdditionalRoutingFilters"));
    org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("routingFilter1");
    elemField.setXmlName(new javax.xml.namespace.QName("", "RoutingFilter1"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter1"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("routingFilter2");
    elemField.setXmlName(new javax.xml.namespace.QName("", "RoutingFilter2"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter2"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("routingFilter3");
    elemField.setXmlName(new javax.xml.namespace.QName("", "RoutingFilter3"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter3"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("routingFilter4");
    elemField.setXmlName(new javax.xml.namespace.QName("", "RoutingFilter4"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter4"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("routingFilter5");
    elemField.setXmlName(new javax.xml.namespace.QName("", "RoutingFilter5"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter5"));
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
