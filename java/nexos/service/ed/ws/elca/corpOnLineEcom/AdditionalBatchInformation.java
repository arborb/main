/**
 * AdditionalBatchInformation.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unused"})
public class AdditionalBatchInformation implements java.io.Serializable {
  private java.lang.String                                        fileFormatIndicator;

  private java.lang.String                                        batchFileName;

  private nexos.service.ed.ws.elca.corpOnLineEcom.ControlAmount[] controlAmount;

  private java.lang.String                                        checkSumName;

  private java.lang.String                                        checkSumValue;

  private java.lang.String                                        batchStatus;

  private java.lang.String                                        batchResubmitCount;

  public AdditionalBatchInformation() {
  }

  public AdditionalBatchInformation(java.lang.String fileFormatIndicator, java.lang.String batchFileName,
    nexos.service.ed.ws.elca.corpOnLineEcom.ControlAmount[] controlAmount, java.lang.String checkSumName,
    java.lang.String checkSumValue, java.lang.String batchStatus, java.lang.String batchResubmitCount) {
    this.fileFormatIndicator = fileFormatIndicator;
    this.batchFileName = batchFileName;
    this.controlAmount = controlAmount;
    this.checkSumName = checkSumName;
    this.checkSumValue = checkSumValue;
    this.batchStatus = batchStatus;
    this.batchResubmitCount = batchResubmitCount;
  }

  /**
   * Gets the fileFormatIndicator value for this AdditionalBatchInformation.
   * 
   * @return fileFormatIndicator
   */
  public java.lang.String getFileFormatIndicator() {
    return fileFormatIndicator;
  }

  /**
   * Sets the fileFormatIndicator value for this AdditionalBatchInformation.
   * 
   * @param fileFormatIndicator
   */
  public void setFileFormatIndicator(java.lang.String fileFormatIndicator) {
    this.fileFormatIndicator = fileFormatIndicator;
  }

  /**
   * Gets the batchFileName value for this AdditionalBatchInformation.
   * 
   * @return batchFileName
   */
  public java.lang.String getBatchFileName() {
    return batchFileName;
  }

  /**
   * Sets the batchFileName value for this AdditionalBatchInformation.
   * 
   * @param batchFileName
   */
  public void setBatchFileName(java.lang.String batchFileName) {
    this.batchFileName = batchFileName;
  }

  /**
   * Gets the controlAmount value for this AdditionalBatchInformation.
   * 
   * @return controlAmount
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.ControlAmount[] getControlAmount() {
    return controlAmount;
  }

  /**
   * Sets the controlAmount value for this AdditionalBatchInformation.
   * 
   * @param controlAmount
   */
  public void setControlAmount(nexos.service.ed.ws.elca.corpOnLineEcom.ControlAmount[] controlAmount) {
    this.controlAmount = controlAmount;
  }

  public nexos.service.ed.ws.elca.corpOnLineEcom.ControlAmount getControlAmount(int i) {
    return this.controlAmount[i];
  }

  public void setControlAmount(int i, nexos.service.ed.ws.elca.corpOnLineEcom.ControlAmount _value) {
    this.controlAmount[i] = _value;
  }

  /**
   * Gets the checkSumName value for this AdditionalBatchInformation.
   * 
   * @return checkSumName
   */
  public java.lang.String getCheckSumName() {
    return checkSumName;
  }

  /**
   * Sets the checkSumName value for this AdditionalBatchInformation.
   * 
   * @param checkSumName
   */
  public void setCheckSumName(java.lang.String checkSumName) {
    this.checkSumName = checkSumName;
  }

  /**
   * Gets the checkSumValue value for this AdditionalBatchInformation.
   * 
   * @return checkSumValue
   */
  public java.lang.String getCheckSumValue() {
    return checkSumValue;
  }

  /**
   * Sets the checkSumValue value for this AdditionalBatchInformation.
   * 
   * @param checkSumValue
   */
  public void setCheckSumValue(java.lang.String checkSumValue) {
    this.checkSumValue = checkSumValue;
  }

  /**
   * Gets the batchStatus value for this AdditionalBatchInformation.
   * 
   * @return batchStatus
   */
  public java.lang.String getBatchStatus() {
    return batchStatus;
  }

  /**
   * Sets the batchStatus value for this AdditionalBatchInformation.
   * 
   * @param batchStatus
   */
  public void setBatchStatus(java.lang.String batchStatus) {
    this.batchStatus = batchStatus;
  }

  /**
   * Gets the batchResubmitCount value for this AdditionalBatchInformation.
   * 
   * @return batchResubmitCount
   */
  public java.lang.String getBatchResubmitCount() {
    return batchResubmitCount;
  }

  /**
   * Sets the batchResubmitCount value for this AdditionalBatchInformation.
   * 
   * @param batchResubmitCount
   */
  public void setBatchResubmitCount(java.lang.String batchResubmitCount) {
    this.batchResubmitCount = batchResubmitCount;
  }

  private java.lang.Object __equalsCalc = null;

  public synchronized boolean equals(java.lang.Object obj) {
    if (!(obj instanceof AdditionalBatchInformation))
      return false;
    AdditionalBatchInformation other = (AdditionalBatchInformation)obj;
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
      && ((this.fileFormatIndicator == null && other.getFileFormatIndicator() == null) || (this.fileFormatIndicator != null && this.fileFormatIndicator
        .equals(other.getFileFormatIndicator())))
      && ((this.batchFileName == null && other.getBatchFileName() == null) || (this.batchFileName != null && this.batchFileName
        .equals(other.getBatchFileName())))
      && ((this.controlAmount == null && other.getControlAmount() == null) || (this.controlAmount != null && java.util.Arrays
        .equals(this.controlAmount, other.getControlAmount())))
      && ((this.checkSumName == null && other.getCheckSumName() == null) || (this.checkSumName != null && this.checkSumName
        .equals(other.getCheckSumName())))
      && ((this.checkSumValue == null && other.getCheckSumValue() == null) || (this.checkSumValue != null && this.checkSumValue
        .equals(other.getCheckSumValue())))
      && ((this.batchStatus == null && other.getBatchStatus() == null) || (this.batchStatus != null && this.batchStatus
        .equals(other.getBatchStatus())))
      && ((this.batchResubmitCount == null && other.getBatchResubmitCount() == null) || (this.batchResubmitCount != null && this.batchResubmitCount
        .equals(other.getBatchResubmitCount())));
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
    if (getFileFormatIndicator() != null) {
      _hashCode += getFileFormatIndicator().hashCode();
    }
    if (getBatchFileName() != null) {
      _hashCode += getBatchFileName().hashCode();
    }
    if (getControlAmount() != null) {
      for (int i = 0; i < java.lang.reflect.Array.getLength(getControlAmount()); i++) {
        java.lang.Object obj = java.lang.reflect.Array.get(getControlAmount(), i);
        if (obj != null && !obj.getClass().isArray()) {
          _hashCode += obj.hashCode();
        }
      }
    }
    if (getCheckSumName() != null) {
      _hashCode += getCheckSumName().hashCode();
    }
    if (getCheckSumValue() != null) {
      _hashCode += getCheckSumValue().hashCode();
    }
    if (getBatchStatus() != null) {
      _hashCode += getBatchStatus().hashCode();
    }
    if (getBatchResubmitCount() != null) {
      _hashCode += getBatchResubmitCount().hashCode();
    }
    __hashCodeCalc = false;
    return _hashCode;
  }

  // Type metadata
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(
                                                                 AdditionalBatchInformation.class, true);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "AdditionalBatchInformation"));
    org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("fileFormatIndicator");
    elemField.setXmlName(new javax.xml.namespace.QName("", "FileFormatIndicator"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("batchFileName");
    elemField.setXmlName(new javax.xml.namespace.QName("", "BatchFileName"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("controlAmount");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ControlAmount"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ControlAmount"));
    elemField.setMinOccurs(0);
    elemField.setNillable(false);
    elemField.setMaxOccursUnbounded(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("checkSumName");
    elemField.setXmlName(new javax.xml.namespace.QName("", "CheckSumName"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("checkSumValue");
    elemField.setXmlName(new javax.xml.namespace.QName("", "CheckSumValue"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("batchStatus");
    elemField.setXmlName(new javax.xml.namespace.QName("", "BatchStatus"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("batchResubmitCount");
    elemField.setXmlName(new javax.xml.namespace.QName("", "BatchResubmitCount"));
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
