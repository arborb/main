/**
 * Header.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unused"})
public class Header  implements java.io.Serializable {
    private java.lang.String documentId;

  private java.lang.String                                    alternateDocumentId;

  private java.lang.String                                    documentType;

  private java.lang.String                                    reasonCode;

  private java.lang.String                                    orderType;

  private java.lang.String                                    salesOrganization;

  private java.lang.String                                    distributionChannel;

  private java.lang.String                                    brandId;

  private java.lang.String                                    orderDate;

  private java.lang.String                                    requestedDeliveryDate;

  private nexos.service.ed.ws.elca.corpOnLineEcom.SoldToParty soldToParty;

  private nexos.service.ed.ws.elca.corpOnLineEcom.ShipToParty shipToParty;

  public Header() {
  }

  public Header(java.lang.String documentId, java.lang.String alternateDocumentId, java.lang.String documentType,
    java.lang.String reasonCode, java.lang.String orderType, java.lang.String salesOrganization,
    java.lang.String distributionChannel, java.lang.String brandId, java.lang.String orderDate,
    java.lang.String requestedDeliveryDate, nexos.service.ed.ws.elca.corpOnLineEcom.SoldToParty soldToParty,
    nexos.service.ed.ws.elca.corpOnLineEcom.ShipToParty shipToParty) {
    this.documentId = documentId;
    this.alternateDocumentId = alternateDocumentId;
    this.documentType = documentType;
    this.reasonCode = reasonCode;
    this.orderType = orderType;
    this.salesOrganization = salesOrganization;
    this.distributionChannel = distributionChannel;
    this.brandId = brandId;
    this.orderDate = orderDate;
    this.requestedDeliveryDate = requestedDeliveryDate;
    this.soldToParty = soldToParty;
    this.shipToParty = shipToParty;
  }

  /**
   * Gets the documentId value for this Header.
   * 
   * @return documentId
   */
  public java.lang.String getDocumentId() {
    return documentId;
  }

  /**
   * Sets the documentId value for this Header.
   * 
   * @param documentId
   */
  public void setDocumentId(java.lang.String documentId) {
    this.documentId = documentId;
  }

  /**
   * Gets the alternateDocumentId value for this Header.
   * 
   * @return alternateDocumentId
   */
  public java.lang.String getAlternateDocumentId() {
    return alternateDocumentId;
  }

  /**
   * Sets the alternateDocumentId value for this Header.
   * 
   * @param alternateDocumentId
   */
  public void setAlternateDocumentId(java.lang.String alternateDocumentId) {
    this.alternateDocumentId = alternateDocumentId;
  }

  /**
   * Gets the documentType value for this Header.
   * 
   * @return documentType
   */
  public java.lang.String getDocumentType() {
    return documentType;
  }

  /**
   * Sets the documentType value for this Header.
   * 
   * @param documentType
   */
  public void setDocumentType(java.lang.String documentType) {
    this.documentType = documentType;
  }

  /**
   * Gets the reasonCode value for this Header.
   * 
   * @return reasonCode
   */
  public java.lang.String getReasonCode() {
    return reasonCode;
  }

  /**
   * Sets the reasonCode value for this Header.
   * 
   * @param reasonCode
   */
  public void setReasonCode(java.lang.String reasonCode) {
    this.reasonCode = reasonCode;
  }

  /**
   * Gets the orderType value for this Header.
   * 
   * @return orderType
   */
  public java.lang.String getOrderType() {
    return orderType;
  }

  /**
   * Sets the orderType value for this Header.
   * 
   * @param orderType
   */
  public void setOrderType(java.lang.String orderType) {
    this.orderType = orderType;
  }

  /**
   * Gets the salesOrganization value for this Header.
   * 
   * @return salesOrganization
   */
  public java.lang.String getSalesOrganization() {
    return salesOrganization;
  }

  /**
   * Sets the salesOrganization value for this Header.
   * 
   * @param salesOrganization
   */
  public void setSalesOrganization(java.lang.String salesOrganization) {
    this.salesOrganization = salesOrganization;
  }

  /**
   * Gets the distributionChannel value for this Header.
   * 
   * @return distributionChannel
   */
  public java.lang.String getDistributionChannel() {
    return distributionChannel;
  }

  /**
   * Sets the distributionChannel value for this Header.
   * 
   * @param distributionChannel
   */
  public void setDistributionChannel(java.lang.String distributionChannel) {
    this.distributionChannel = distributionChannel;
  }

  /**
   * Gets the brandId value for this Header.
   * 
   * @return brandId
   */
  public java.lang.String getBrandId() {
    return brandId;
  }

  /**
   * Sets the brandId value for this Header.
   * 
   * @param brandId
   */
  public void setBrandId(java.lang.String brandId) {
    this.brandId = brandId;
  }

  /**
   * Gets the orderDate value for this Header.
   * 
   * @return orderDate
   */
  public java.lang.String getOrderDate() {
    return orderDate;
  }

  /**
   * Sets the orderDate value for this Header.
   * 
   * @param orderDate
   */
  public void setOrderDate(java.lang.String orderDate) {
    this.orderDate = orderDate;
  }

  /**
   * Gets the requestedDeliveryDate value for this Header.
   * 
   * @return requestedDeliveryDate
   */
  public java.lang.String getRequestedDeliveryDate() {
    return requestedDeliveryDate;
  }

  /**
   * Sets the requestedDeliveryDate value for this Header.
   * 
   * @param requestedDeliveryDate
   */
  public void setRequestedDeliveryDate(java.lang.String requestedDeliveryDate) {
    this.requestedDeliveryDate = requestedDeliveryDate;
  }

  /**
   * Gets the soldToParty value for this Header.
   * 
   * @return soldToParty
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.SoldToParty getSoldToParty() {
    return soldToParty;
  }

  /**
   * Sets the soldToParty value for this Header.
   * 
   * @param soldToParty
   */
  public void setSoldToParty(nexos.service.ed.ws.elca.corpOnLineEcom.SoldToParty soldToParty) {
    this.soldToParty = soldToParty;
  }

  /**
   * Gets the shipToParty value for this Header.
   * 
   * @return shipToParty
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.ShipToParty getShipToParty() {
    return shipToParty;
  }

  /**
   * Sets the shipToParty value for this Header.
   * 
   * @param shipToParty
   */
  public void setShipToParty(nexos.service.ed.ws.elca.corpOnLineEcom.ShipToParty shipToParty) {
    this.shipToParty = shipToParty;
  }

  private java.lang.Object __equalsCalc = null;

  public synchronized boolean equals(java.lang.Object obj) {
    if (!(obj instanceof Header))
      return false;
    Header other = (Header)obj;
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
      && ((this.documentId == null && other.getDocumentId() == null) || (this.documentId != null && this.documentId
        .equals(other.getDocumentId())))
      && ((this.alternateDocumentId == null && other.getAlternateDocumentId() == null) || (this.alternateDocumentId != null && this.alternateDocumentId
        .equals(other.getAlternateDocumentId())))
      && ((this.documentType == null && other.getDocumentType() == null) || (this.documentType != null && this.documentType
        .equals(other.getDocumentType())))
      && ((this.reasonCode == null && other.getReasonCode() == null) || (this.reasonCode != null && this.reasonCode
        .equals(other.getReasonCode())))
      && ((this.orderType == null && other.getOrderType() == null) || (this.orderType != null && this.orderType
        .equals(other.getOrderType())))
      && ((this.salesOrganization == null && other.getSalesOrganization() == null) || (this.salesOrganization != null && this.salesOrganization
        .equals(other.getSalesOrganization())))
      && ((this.distributionChannel == null && other.getDistributionChannel() == null) || (this.distributionChannel != null && this.distributionChannel
        .equals(other.getDistributionChannel())))
      && ((this.brandId == null && other.getBrandId() == null) || (this.brandId != null && this.brandId.equals(other
        .getBrandId())))
      && ((this.orderDate == null && other.getOrderDate() == null) || (this.orderDate != null && this.orderDate
        .equals(other.getOrderDate())))
      && ((this.requestedDeliveryDate == null && other.getRequestedDeliveryDate() == null) || (this.requestedDeliveryDate != null && this.requestedDeliveryDate
        .equals(other.getRequestedDeliveryDate())))
      && ((this.soldToParty == null && other.getSoldToParty() == null) || (this.soldToParty != null && this.soldToParty
        .equals(other.getSoldToParty())))
      && ((this.shipToParty == null && other.getShipToParty() == null) || (this.shipToParty != null && this.shipToParty
        .equals(other.getShipToParty())));
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
    if (getDocumentId() != null) {
      _hashCode += getDocumentId().hashCode();
    }
    if (getAlternateDocumentId() != null) {
      _hashCode += getAlternateDocumentId().hashCode();
    }
    if (getDocumentType() != null) {
      _hashCode += getDocumentType().hashCode();
    }
    if (getReasonCode() != null) {
      _hashCode += getReasonCode().hashCode();
    }
    if (getOrderType() != null) {
      _hashCode += getOrderType().hashCode();
    }
    if (getSalesOrganization() != null) {
      _hashCode += getSalesOrganization().hashCode();
    }
    if (getDistributionChannel() != null) {
      _hashCode += getDistributionChannel().hashCode();
    }
    if (getBrandId() != null) {
      _hashCode += getBrandId().hashCode();
    }
    if (getOrderDate() != null) {
      _hashCode += getOrderDate().hashCode();
    }
    if (getRequestedDeliveryDate() != null) {
      _hashCode += getRequestedDeliveryDate().hashCode();
    }
    if (getSoldToParty() != null) {
      _hashCode += getSoldToParty().hashCode();
    }
    if (getShipToParty() != null) {
      _hashCode += getShipToParty().hashCode();
    }
    __hashCodeCalc = false;
    return _hashCode;
  }

  // Type metadata
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(Header.class,
                                                                 true);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Header"));
    org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("documentId");
    elemField.setXmlName(new javax.xml.namespace.QName("", "DocumentId"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("alternateDocumentId");
    elemField.setXmlName(new javax.xml.namespace.QName("", "AlternateDocumentId"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("documentType");
    elemField.setXmlName(new javax.xml.namespace.QName("", "DocumentType"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("reasonCode");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ReasonCode"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("orderType");
    elemField.setXmlName(new javax.xml.namespace.QName("", "OrderType"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("salesOrganization");
    elemField.setXmlName(new javax.xml.namespace.QName("", "SalesOrganization"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("distributionChannel");
    elemField.setXmlName(new javax.xml.namespace.QName("", "DistributionChannel"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("brandId");
    elemField.setXmlName(new javax.xml.namespace.QName("", "BrandId"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("orderDate");
    elemField.setXmlName(new javax.xml.namespace.QName("", "OrderDate"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("requestedDeliveryDate");
    elemField.setXmlName(new javax.xml.namespace.QName("", "RequestedDeliveryDate"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("soldToParty");
    elemField.setXmlName(new javax.xml.namespace.QName("", "SoldToParty"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "SoldToParty"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("shipToParty");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ShipToParty"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ShipToParty"));
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
