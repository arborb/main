/**
 * IZTrxStatus.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unchecked"})
public class IZTrxStatus implements java.io.Serializable {
  private java.lang.String         _value_;
  private static java.util.HashMap _table_ = new java.util.HashMap();

  // Constructor
  protected IZTrxStatus(java.lang.String value) {
    _value_ = value;
    _table_.put(_value_, this);
  }

  public static final java.lang.String _value1 = "GOOD";
  public static final java.lang.String _value2 = "STALE";
  public static final java.lang.String _value3 = "POSSIBLE STALE";
  public static final java.lang.String _value4 = "OUT OF SEQUENCE STALE";
  public static final java.lang.String _value5 = "OUT OF SEQUENCE TRANS";
  public static final IZTrxStatus      value1  = new IZTrxStatus(_value1);
  public static final IZTrxStatus      value2  = new IZTrxStatus(_value2);
  public static final IZTrxStatus      value3  = new IZTrxStatus(_value3);
  public static final IZTrxStatus      value4  = new IZTrxStatus(_value4);
  public static final IZTrxStatus      value5  = new IZTrxStatus(_value5);

  public java.lang.String getValue() {
    return _value_;
  }

  public static IZTrxStatus fromValue(java.lang.String value) throws java.lang.IllegalArgumentException {
    IZTrxStatus enumeration = (IZTrxStatus)_table_.get(value);
    if (enumeration == null)
      throw new java.lang.IllegalArgumentException();
    return enumeration;
  }

  public static IZTrxStatus fromString(java.lang.String value) throws java.lang.IllegalArgumentException {
    return fromValue(value);
  }

  public boolean equals(java.lang.Object obj) {
    return (obj == this);
  }

  public int hashCode() {
    return toString().hashCode();
  }

  public java.lang.String toString() {
    return _value_;
  }

  public java.lang.Object readResolve() throws java.io.ObjectStreamException {
    return fromValue(_value_);
  }

  public static org.apache.axis.encoding.Serializer getSerializer(java.lang.String mechType, java.lang.Class _javaType,
    javax.xml.namespace.QName _xmlType) {
    return new org.apache.axis.encoding.ser.EnumSerializer(_javaType, _xmlType);
  }

  public static org.apache.axis.encoding.Deserializer getDeserializer(java.lang.String mechType,
    java.lang.Class _javaType, javax.xml.namespace.QName _xmlType) {
    return new org.apache.axis.encoding.ser.EnumDeserializer(_javaType, _xmlType);
  }

  // Type metadata
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(
                                                                 IZTrxStatus.class);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZTrxStatus"));
  }

  /**
   * Return type metadata object
   */
  public static org.apache.axis.description.TypeDesc getTypeDesc() {
    return typeDesc;
  }

}
