/**
 * IZRecordStatus.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unchecked"})
public class IZRecordStatus implements java.io.Serializable {
  private java.lang.String         _value_;
  private static java.util.HashMap _table_ = new java.util.HashMap();

  // Constructor
  public IZRecordStatus(java.lang.String value) {
    _value_ = value;
    _table_.put(_value_, this);
  }

  public static final java.lang.String _AVAILABLE = "AVAILABLE";
  public static final java.lang.String _WAITING   = "WAITING";
  public static final java.lang.String _PROCESSED = "PROCESSED";
  public static final java.lang.String _FAIL      = "FAIL";
  public static final java.lang.String _ARCHIVED  = "ARCHIVED";
  public static final IZRecordStatus   AVAILABLE  = new IZRecordStatus(_AVAILABLE);
  public static final IZRecordStatus   WAITING    = new IZRecordStatus(_WAITING);
  public static final IZRecordStatus   PROCESSED  = new IZRecordStatus(_PROCESSED);
  public static final IZRecordStatus   FAIL       = new IZRecordStatus(_FAIL);
  public static final IZRecordStatus   ARCHIVED   = new IZRecordStatus(_ARCHIVED);

  public java.lang.String getValue() {
    return _value_;
  }

  public static IZRecordStatus fromValue(java.lang.String value) throws java.lang.IllegalArgumentException {
    IZRecordStatus enumeration = (IZRecordStatus)_table_.get(value);
    if (enumeration == null)
      throw new java.lang.IllegalArgumentException();
    return enumeration;
  }

  public static IZRecordStatus fromString(java.lang.String value) throws java.lang.IllegalArgumentException {
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
                                                                 IZRecordStatus.class);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZRecordStatus"));
  }

  /**
   * Return type metadata object
   */
  public static org.apache.axis.description.TypeDesc getTypeDesc() {
    return typeDesc;
  }

}
