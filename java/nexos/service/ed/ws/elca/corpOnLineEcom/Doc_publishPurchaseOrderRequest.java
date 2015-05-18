/**
 * Doc_publishPurchaseOrderRequest.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unused"})
public class Doc_publishPurchaseOrderRequest implements java.io.Serializable {
  private nexos.service.ed.ws.elca.corpOnLineEcom.Coverpage coverpage;

  private nexos.service.ed.ws.elca.corpOnLineEcom.Header    header;

  private nexos.service.ed.ws.elca.corpOnLineEcom.Line[]    line;

  public Doc_publishPurchaseOrderRequest() {
  }

  public Doc_publishPurchaseOrderRequest(nexos.service.ed.ws.elca.corpOnLineEcom.Coverpage coverpage,
    nexos.service.ed.ws.elca.corpOnLineEcom.Header header, nexos.service.ed.ws.elca.corpOnLineEcom.Line[] line) {
    this.coverpage = coverpage;
    this.header = header;
    this.line = line;
  }

  /**
   * Gets the coverpage value for this Doc_publishPurchaseOrderRequest.
   * 
   * @return coverpage
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.Coverpage getCoverpage() {
    return coverpage;
  }

  /**
   * Sets the coverpage value for this Doc_publishPurchaseOrderRequest.
   * 
   * @param coverpage
   */
  public void setCoverpage(nexos.service.ed.ws.elca.corpOnLineEcom.Coverpage coverpage) {
    this.coverpage = coverpage;
  }

  /**
   * Gets the header value for this Doc_publishPurchaseOrderRequest.
   * 
   * @return header
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.Header getHeader() {
    return header;
  }

  /**
   * Sets the header value for this Doc_publishPurchaseOrderRequest.
   * 
   * @param header
   */
  public void setHeader(nexos.service.ed.ws.elca.corpOnLineEcom.Header header) {
    this.header = header;
  }

  /**
   * Gets the line value for this Doc_publishPurchaseOrderRequest.
   * 
   * @return line
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.Line[] getLine() {
    return line;
  }

  /**
   * Sets the line value for this Doc_publishPurchaseOrderRequest.
   * 
   * @param line
   */
  public void setLine(nexos.service.ed.ws.elca.corpOnLineEcom.Line[] line) {
    this.line = line;
  }

  public nexos.service.ed.ws.elca.corpOnLineEcom.Line getLine(int i) {
    return this.line[i];
  }

  public void setLine(int i, nexos.service.ed.ws.elca.corpOnLineEcom.Line _value) {
    this.line[i] = _value;
  }

  private java.lang.Object __equalsCalc = null;

  public synchronized boolean equals(java.lang.Object obj) {
    if (!(obj instanceof Doc_publishPurchaseOrderRequest))
      return false;
    Doc_publishPurchaseOrderRequest other = (Doc_publishPurchaseOrderRequest)obj;
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
      && ((this.coverpage == null && other.getCoverpage() == null) || (this.coverpage != null && this.coverpage
        .equals(other.getCoverpage())))
      && ((this.header == null && other.getHeader() == null) || (this.header != null && this.header.equals(other
        .getHeader())))
      && ((this.line == null && other.getLine() == null) || (this.line != null && java.util.Arrays.equals(this.line,
        other.getLine())));
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
    if (getCoverpage() != null) {
      _hashCode += getCoverpage().hashCode();
    }
    if (getHeader() != null) {
      _hashCode += getHeader().hashCode();
    }
    if (getLine() != null) {
      for (int i = 0; i < java.lang.reflect.Array.getLength(getLine()); i++) {
        java.lang.Object obj = java.lang.reflect.Array.get(getLine(), i);
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
                                                                 Doc_publishPurchaseOrderRequest.class, true);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "doc_publishPurchaseOrderRequest"));
    org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("coverpage");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Coverpage"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Coverpage"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("header");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Header"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Header"));
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("line");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Line"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Line"));
    elemField.setNillable(true);
    elemField.setMaxOccursUnbounded(true);
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
