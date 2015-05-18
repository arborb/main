/**
 * Doc_publishPurchaseOrderResponse.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unused"})
public class Doc_publishPurchaseOrderResponse implements java.io.Serializable {
  private nexos.service.ed.ws.elca.corpOnLineEcom.Coverpage2       coverpage;

  private nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage3[] resultMessage;

  public Doc_publishPurchaseOrderResponse() {
  }

  public Doc_publishPurchaseOrderResponse(nexos.service.ed.ws.elca.corpOnLineEcom.Coverpage2 coverpage,
    nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage3[] resultMessage) {
    this.coverpage = coverpage;
    this.resultMessage = resultMessage;
  }

  /**
   * Gets the coverpage value for this Doc_publishPurchaseOrderResponse.
   * 
   * @return coverpage
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.Coverpage2 getCoverpage() {
    return coverpage;
  }

  /**
   * Sets the coverpage value for this Doc_publishPurchaseOrderResponse.
   * 
   * @param coverpage
   */
  public void setCoverpage(nexos.service.ed.ws.elca.corpOnLineEcom.Coverpage2 coverpage) {
    this.coverpage = coverpage;
  }

  /**
   * Gets the resultMessage value for this Doc_publishPurchaseOrderResponse.
   * 
   * @return resultMessage
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage3[] getResultMessage() {
    return resultMessage;
  }

  /**
   * Sets the resultMessage value for this Doc_publishPurchaseOrderResponse.
   * 
   * @param resultMessage
   */
  public void setResultMessage(nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage3[] resultMessage) {
    this.resultMessage = resultMessage;
  }

  public nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage3 getResultMessage(int i) {
    return this.resultMessage[i];
  }

  public void setResultMessage(int i, nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage3 _value) {
    this.resultMessage[i] = _value;
  }

  private java.lang.Object __equalsCalc = null;

  public synchronized boolean equals(java.lang.Object obj) {
    if (!(obj instanceof Doc_publishPurchaseOrderResponse))
      return false;
    Doc_publishPurchaseOrderResponse other = (Doc_publishPurchaseOrderResponse)obj;
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
      && ((this.resultMessage == null && other.getResultMessage() == null) || (this.resultMessage != null && java.util.Arrays
        .equals(this.resultMessage, other.getResultMessage())));
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
    if (getResultMessage() != null) {
      for (int i = 0; i < java.lang.reflect.Array.getLength(getResultMessage()); i++) {
        java.lang.Object obj = java.lang.reflect.Array.get(getResultMessage(), i);
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
                                                                 Doc_publishPurchaseOrderResponse.class, true);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "doc_publishPurchaseOrderResponse"));
    org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("coverpage");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Coverpage"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Coverpage2"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("resultMessage");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ResultMessage"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ResultMessage3"));
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
