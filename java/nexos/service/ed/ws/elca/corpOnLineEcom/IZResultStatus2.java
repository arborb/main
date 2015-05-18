/**
 * IZResultStatus2.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unchecked"})
public class IZResultStatus2 implements java.io.Serializable {
  private java.lang.String         _value_;
  private static java.util.HashMap _table_ = new java.util.HashMap();

  // Constructor
  protected IZResultStatus2(java.lang.String value) {
    _value_ = value;
    _table_.put(_value_, this);
  }

  public static final java.lang.String _SENT      = "SENT";
  public static final java.lang.String _RECEIVED  = "RECEIVED";
  public static final java.lang.String _PROCESSED = "PROCESSED";
  public static final java.lang.String _SUSPENDED = "SUSPENDED";
  public static final java.lang.String _COMPLETED = "COMPLETED";
  public static final java.lang.String _FAILED    = "FAILED";
  public static final IZResultStatus2  SENT       = new IZResultStatus2(_SENT);
  public static final IZResultStatus2  RECEIVED   = new IZResultStatus2(_RECEIVED);
  public static final IZResultStatus2  PROCESSED  = new IZResultStatus2(_PROCESSED);
  public static final IZResultStatus2  SUSPENDED  = new IZResultStatus2(_SUSPENDED);
  public static final IZResultStatus2  COMPLETED  = new IZResultStatus2(_COMPLETED);
  public static final IZResultStatus2  FAILED     = new IZResultStatus2(_FAILED);

  public java.lang.String getValue() {
    return _value_;
  }

  public static IZResultStatus2 fromValue(java.lang.String value) throws java.lang.IllegalArgumentException {
    IZResultStatus2 enumeration = (IZResultStatus2)_table_.get(value);
    if (enumeration == null)
      throw new java.lang.IllegalArgumentException();
    return enumeration;
  }

  public static IZResultStatus2 fromString(java.lang.String value) throws java.lang.IllegalArgumentException {
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
                                                                 IZResultStatus2.class);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZResultStatus2"));
  }

  /**
   * Return type metadata object
   */
  public static org.apache.axis.description.TypeDesc getTypeDesc() {
    return typeDesc;
  }

}
