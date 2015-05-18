/**
 * Action2.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unchecked"})
public class Action2 implements java.io.Serializable {
  private java.lang.String         _value_;
  private static java.util.HashMap _table_ = new java.util.HashMap();

  // Constructor
  protected Action2(java.lang.String value) {
    _value_ = value;
    _table_.put(_value_, this);
  }

  public static final java.lang.String _CREATE  = "CREATE";
  public static final java.lang.String _DELETE  = "DELETE";
  public static final java.lang.String _SYNC    = "SYNC";
  public static final java.lang.String _CHANGE  = "CHANGE";
  public static final java.lang.String _ADJUST  = "ADJUST";
  public static final java.lang.String _CANCEL  = "CANCEL";
  public static final java.lang.String _REQUEST = "REQUEST";
  public static final java.lang.String _REPLY   = "REPLY";
  public static final java.lang.String _CONFIRM = "CONFIRM";
  public static final Action2          CREATE   = new Action2(_CREATE);
  public static final Action2          DELETE   = new Action2(_DELETE);
  public static final Action2          SYNC     = new Action2(_SYNC);
  public static final Action2          CHANGE   = new Action2(_CHANGE);
  public static final Action2          ADJUST   = new Action2(_ADJUST);
  public static final Action2          CANCEL   = new Action2(_CANCEL);
  public static final Action2          REQUEST  = new Action2(_REQUEST);
  public static final Action2          REPLY    = new Action2(_REPLY);
  public static final Action2          CONFIRM  = new Action2(_CONFIRM);

  public java.lang.String getValue() {
    return _value_;
  }

  public static Action2 fromValue(java.lang.String value) throws java.lang.IllegalArgumentException {
    Action2 enumeration = (Action2)_table_.get(value);
    if (enumeration == null)
      throw new java.lang.IllegalArgumentException();
    return enumeration;
  }

  public static Action2 fromString(java.lang.String value) throws java.lang.IllegalArgumentException {
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
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(Action2.class);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Action2"));
  }

  /**
   * Return type metadata object
   */
  public static org.apache.axis.description.TypeDesc getTypeDesc() {
    return typeDesc;
  }

}
