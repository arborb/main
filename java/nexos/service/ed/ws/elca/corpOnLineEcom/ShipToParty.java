/**
 * ShipToParty.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unused"})
public class ShipToParty implements java.io.Serializable {
  private java.lang.String                                 id;

  private java.lang.String                                 customerPartyId;

  private nexos.service.ed.ws.elca.corpOnLineEcom.Address2 address;

  public ShipToParty() {
  }

  public ShipToParty(java.lang.String id, java.lang.String customerPartyId,
    nexos.service.ed.ws.elca.corpOnLineEcom.Address2 address) {
    this.id = id;
    this.customerPartyId = customerPartyId;
    this.address = address;
  }

  /**
   * Gets the id value for this ShipToParty.
   * 
   * @return id
   */
  public java.lang.String getId() {
    return id;
  }

  /**
   * Sets the id value for this ShipToParty.
   * 
   * @param id
   */
  public void setId(java.lang.String id) {
    this.id = id;
  }

  /**
   * Gets the customerPartyId value for this ShipToParty.
   * 
   * @return customerPartyId
   */
  public java.lang.String getCustomerPartyId() {
    return customerPartyId;
  }

  /**
   * Sets the customerPartyId value for this ShipToParty.
   * 
   * @param customerPartyId
   */
  public void setCustomerPartyId(java.lang.String customerPartyId) {
    this.customerPartyId = customerPartyId;
  }

  /**
   * Gets the address value for this ShipToParty.
   * 
   * @return address
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.Address2 getAddress() {
    return address;
  }

  /**
   * Sets the address value for this ShipToParty.
   * 
   * @param address
   */
  public void setAddress(nexos.service.ed.ws.elca.corpOnLineEcom.Address2 address) {
    this.address = address;
  }

  private java.lang.Object __equalsCalc = null;

  public synchronized boolean equals(java.lang.Object obj) {
    if (!(obj instanceof ShipToParty))
      return false;
    ShipToParty other = (ShipToParty)obj;
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
      && ((this.id == null && other.getId() == null) || (this.id != null && this.id.equals(other.getId())))
      && ((this.customerPartyId == null && other.getCustomerPartyId() == null) || (this.customerPartyId != null && this.customerPartyId
        .equals(other.getCustomerPartyId())))
      && ((this.address == null && other.getAddress() == null) || (this.address != null && this.address.equals(other
        .getAddress())));
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
    if (getId() != null) {
      _hashCode += getId().hashCode();
    }
    if (getCustomerPartyId() != null) {
      _hashCode += getCustomerPartyId().hashCode();
    }
    if (getAddress() != null) {
      _hashCode += getAddress().hashCode();
    }
    __hashCodeCalc = false;
    return _hashCode;
  }

  // Type metadata
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(
                                                                 ShipToParty.class, true);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ShipToParty"));
    org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("id");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Id"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("customerPartyId");
    elemField.setXmlName(new javax.xml.namespace.QName("", "CustomerPartyId"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("address");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Address"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Address2"));
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
