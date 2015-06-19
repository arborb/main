/**
 * Action.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unchecked"})
public class Action implements java.io.Serializable {
  private java.lang.String         _value_;
  private static java.util.HashMap _table_ = new java.util.HashMap();

  // Constructor
  public Action(java.lang.String value) {
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
  public static final Action           CREATE   = new Action(_CREATE);
  public static final Action           DELETE   = new Action(_DELETE);
  public static final Action           SYNC     = new Action(_SYNC);
  public static final Action           CHANGE   = new Action(_CHANGE);
  public static final Action           ADJUST   = new Action(_ADJUST);
  public static final Action           CANCEL   = new Action(_CANCEL);
  public static final Action           REQUEST  = new Action(_REQUEST);
  public static final Action           REPLY    = new Action(_REPLY);
  public static final Action           CONFIRM  = new Action(_CONFIRM);

  public java.lang.String getValue() {
    return _value_;
  }

  public static Action fromValue(java.lang.String value) throws java.lang.IllegalArgumentException {
    Action enumeration = (Action)_table_.get(value);
    if (enumeration == null)
      throw new java.lang.IllegalArgumentException();
    return enumeration;
  }

  public static Action fromString(java.lang.String value) throws java.lang.IllegalArgumentException {
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
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(Action.class);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Action"));
  }

  /**
   * Return type metadata object
   */
  public static org.apache.axis.description.TypeDesc getTypeDesc() {
    return typeDesc;
  }

}
