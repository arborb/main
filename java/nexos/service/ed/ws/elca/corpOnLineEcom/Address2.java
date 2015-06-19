/**
 * Address2.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unused"})
public class Address2 implements java.io.Serializable {
  private java.lang.String   firstName;

  private java.lang.String   lastName;

  private java.lang.String[] addressLine;

  private java.lang.String   city;

  private java.lang.String   postalCode;

  private java.lang.String   region;

  private java.lang.String   country;

  private java.lang.String   phone;

  private java.lang.String   mobile;

  private java.lang.String   email;

  public Address2() {
  }

  public Address2(java.lang.String firstName, java.lang.String lastName, java.lang.String[] addressLine,
    java.lang.String city, java.lang.String postalCode, java.lang.String region, java.lang.String country,
    java.lang.String phone, java.lang.String mobile, java.lang.String email) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.addressLine = addressLine;
    this.city = city;
    this.postalCode = postalCode;
    this.region = region;
    this.country = country;
    this.phone = phone;
    this.mobile = mobile;
    this.email = email;
  }

  /**
   * Gets the firstName value for this Address2.
   * 
   * @return firstName
   */
  public java.lang.String getFirstName() {
    return firstName;
  }

  /**
   * Sets the firstName value for this Address2.
   * 
   * @param firstName
   */
  public void setFirstName(java.lang.String firstName) {
    this.firstName = firstName;
  }

  /**
   * Gets the lastName value for this Address2.
   * 
   * @return lastName
   */
  public java.lang.String getLastName() {
    return lastName;
  }

  /**
   * Sets the lastName value for this Address2.
   * 
   * @param lastName
   */
  public void setLastName(java.lang.String lastName) {
    this.lastName = lastName;
  }

  /**
   * Gets the addressLine value for this Address2.
   * 
   * @return addressLine
   */
  public java.lang.String[] getAddressLine() {
    return addressLine;
  }

  /**
   * Sets the addressLine value for this Address2.
   * 
   * @param addressLine
   */
  public void setAddressLine(java.lang.String[] addressLine) {
    this.addressLine = addressLine;
  }

  public java.lang.String getAddressLine(int i) {
    return this.addressLine[i];
  }

  public void setAddressLine(int i, java.lang.String _value) {
    this.addressLine[i] = _value;
  }

  /**
   * Gets the city value for this Address2.
   * 
   * @return city
   */
  public java.lang.String getCity() {
    return city;
  }

  /**
   * Sets the city value for this Address2.
   * 
   * @param city
   */
  public void setCity(java.lang.String city) {
    this.city = city;
  }

  /**
   * Gets the postalCode value for this Address2.
   * 
   * @return postalCode
   */
  public java.lang.String getPostalCode() {
    return postalCode;
  }

  /**
   * Sets the postalCode value for this Address2.
   * 
   * @param postalCode
   */
  public void setPostalCode(java.lang.String postalCode) {
    this.postalCode = postalCode;
  }

  /**
   * Gets the region value for this Address2.
   * 
   * @return region
   */
  public java.lang.String getRegion() {
    return region;
  }

  /**
   * Sets the region value for this Address2.
   * 
   * @param region
   */
  public void setRegion(java.lang.String region) {
    this.region = region;
  }

  /**
   * Gets the country value for this Address2.
   * 
   * @return country
   */
  public java.lang.String getCountry() {
    return country;
  }

  /**
   * Sets the country value for this Address2.
   * 
   * @param country
   */
  public void setCountry(java.lang.String country) {
    this.country = country;
  }

  /**
   * Gets the phone value for this Address2.
   * 
   * @return phone
   */
  public java.lang.String getPhone() {
    return phone;
  }

  /**
   * Sets the phone value for this Address2.
   * 
   * @param phone
   */
  public void setPhone(java.lang.String phone) {
    this.phone = phone;
  }

  /**
   * Gets the mobile value for this Address2.
   * 
   * @return mobile
   */
  public java.lang.String getMobile() {
    return mobile;
  }

  /**
   * Sets the mobile value for this Address2.
   * 
   * @param mobile
   */
  public void setMobile(java.lang.String mobile) {
    this.mobile = mobile;
  }

  /**
   * Gets the email value for this Address2.
   * 
   * @return email
   */
  public java.lang.String getEmail() {
    return email;
  }

  /**
   * Sets the email value for this Address2.
   * 
   * @param email
   */
  public void setEmail(java.lang.String email) {
    this.email = email;
  }

  private java.lang.Object __equalsCalc = null;

  public synchronized boolean equals(java.lang.Object obj) {
    if (!(obj instanceof Address2))
      return false;
    Address2 other = (Address2)obj;
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
      && ((this.firstName == null && other.getFirstName() == null) || (this.firstName != null && this.firstName
        .equals(other.getFirstName())))
      && ((this.lastName == null && other.getLastName() == null) || (this.lastName != null && this.lastName
        .equals(other.getLastName())))
      && ((this.addressLine == null && other.getAddressLine() == null) || (this.addressLine != null && java.util.Arrays
        .equals(this.addressLine, other.getAddressLine())))
      && ((this.city == null && other.getCity() == null) || (this.city != null && this.city.equals(other.getCity())))
      && ((this.postalCode == null && other.getPostalCode() == null) || (this.postalCode != null && this.postalCode
        .equals(other.getPostalCode())))
      && ((this.region == null && other.getRegion() == null) || (this.region != null && this.region.equals(other
        .getRegion())))
      && ((this.country == null && other.getCountry() == null) || (this.country != null && this.country.equals(other
        .getCountry())))
      && ((this.phone == null && other.getPhone() == null) || (this.phone != null && this.phone
        .equals(other.getPhone())))
      && ((this.mobile == null && other.getMobile() == null) || (this.mobile != null && this.mobile.equals(other
        .getMobile())))
      && ((this.email == null && other.getEmail() == null) || (this.email != null && this.email
        .equals(other.getEmail())));
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
    if (getFirstName() != null) {
      _hashCode += getFirstName().hashCode();
    }
    if (getLastName() != null) {
      _hashCode += getLastName().hashCode();
    }
    if (getAddressLine() != null) {
      for (int i = 0; i < java.lang.reflect.Array.getLength(getAddressLine()); i++) {
        java.lang.Object obj = java.lang.reflect.Array.get(getAddressLine(), i);
        if (obj != null && !obj.getClass().isArray()) {
          _hashCode += obj.hashCode();
        }
      }
    }
    if (getCity() != null) {
      _hashCode += getCity().hashCode();
    }
    if (getPostalCode() != null) {
      _hashCode += getPostalCode().hashCode();
    }
    if (getRegion() != null) {
      _hashCode += getRegion().hashCode();
    }
    if (getCountry() != null) {
      _hashCode += getCountry().hashCode();
    }
    if (getPhone() != null) {
      _hashCode += getPhone().hashCode();
    }
    if (getMobile() != null) {
      _hashCode += getMobile().hashCode();
    }
    if (getEmail() != null) {
      _hashCode += getEmail().hashCode();
    }
    __hashCodeCalc = false;
    return _hashCode;
  }

  // Type metadata
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(
                                                                 Address2.class, true);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Address2"));
    org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("firstName");
    elemField.setXmlName(new javax.xml.namespace.QName("", "FirstName"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("lastName");
    elemField.setXmlName(new javax.xml.namespace.QName("", "LastName"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("addressLine");
    elemField.setXmlName(new javax.xml.namespace.QName("", "AddressLine"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    elemField.setMaxOccursUnbounded(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("city");
    elemField.setXmlName(new javax.xml.namespace.QName("", "City"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("postalCode");
    elemField.setXmlName(new javax.xml.namespace.QName("", "PostalCode"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("region");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Region"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("country");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Country"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("phone");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Phone"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("mobile");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Mobile"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("email");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Email"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
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
