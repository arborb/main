/**
 * IZLargeFileFlag2.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unchecked"})
public class IZLargeFileFlag2 implements java.io.Serializable {
  private java.lang.String         _value_;
  private static java.util.HashMap _table_ = new java.util.HashMap();

  // Constructor
  protected IZLargeFileFlag2(java.lang.String value) {
    _value_ = value;
    _table_.put(_value_, this);
  }

  public static final java.lang.String _Y = "Y";
  public static final java.lang.String _N = "N";
  public static final IZLargeFileFlag2 Y  = new IZLargeFileFlag2(_Y);
  public static final IZLargeFileFlag2 N  = new IZLargeFileFlag2(_N);

  public java.lang.String getValue() {
    return _value_;
  }

  public static IZLargeFileFlag2 fromValue(java.lang.String value) throws java.lang.IllegalArgumentException {
    IZLargeFileFlag2 enumeration = (IZLargeFileFlag2)_table_.get(value);
    if (enumeration == null)
      throw new java.lang.IllegalArgumentException();
    return enumeration;
  }

  public static IZLargeFileFlag2 fromString(java.lang.String value) throws java.lang.IllegalArgumentException {
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
                                                                 IZLargeFileFlag2.class);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZLargeFileFlag2"));
  }

  /**
   * Return type metadata object
   */
  public static org.apache.axis.description.TypeDesc getTypeDesc() {
    return typeDesc;
  }

}
