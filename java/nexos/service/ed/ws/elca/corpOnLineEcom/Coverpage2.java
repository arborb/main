/**
 * Coverpage2.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unused"})
public class Coverpage2 implements java.io.Serializable {
  private java.lang.String                                                    IZId;

  private java.lang.String                                                    IZTrxSequence;

  private java.lang.String                                                    IZRecordSetId;

  private java.lang.String                                                    IZUuid;

  private java.lang.String                                                    IZUuidReference;

  private nexos.service.ed.ws.elca.corpOnLineEcom.IZTrxStatus2                IZTrxStatus;

  private nexos.service.ed.ws.elca.corpOnLineEcom.IZRecordStatus2             IZRecordStatus;

  private nexos.service.ed.ws.elca.corpOnLineEcom.IZResultStatus2             IZResultStatus;

  private nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage2[]            IZResultMessageList;

  private nexos.service.ed.ws.elca.corpOnLineEcom.IZLargeFileFlag2            IZLargeFileFlag;

  private java.lang.String                                                    IZLargeFileLocation;

  private java.lang.String                                                    objectType;

  private java.lang.String                                                    version;

  private nexos.service.ed.ws.elca.corpOnLineEcom.Action2                     action;

  private java.lang.String                                                    objectBusinessId;

  private java.lang.String                                                    applicationTrxId;

  private java.lang.String                                                    applicationTrxIdRef;

  private java.lang.String                                                    applicationTimestamp;

  private java.lang.String                                                    sourceApplication;

  private java.lang.String                                                    sourceApplicationRegion;

  private java.lang.String                                                    destinationApplication;

  private java.lang.String                                                    destinationApplicationRegion;

  private nexos.service.ed.ws.elca.corpOnLineEcom.ConfirmationIndicator2      confirmationIndicator;

  private java.lang.String                                                    confirmationTimeout;

  private java.lang.String                                                    routingFilter;

  private nexos.service.ed.ws.elca.corpOnLineEcom.AuditRequiredFlag2          auditRequiredFlag;

  private java.lang.String                                                    auditXMLString;

  private java.lang.String                                                    applicationBatchId;

  private java.lang.String                                                    batchControlId;

  private java.lang.Long                                                      batchRecordCount;

  private java.math.BigDecimal                                                batchControlValue;

  private nexos.service.ed.ws.elca.corpOnLineEcom.BatchControlRecordType2     batchControlRecordType;

  private java.lang.String                                                    interfaceAttributes;

  private java.lang.String                                                    language;

  private java.lang.String                                                    encoding;

  private java.lang.String                                                    sourcePackageName;

  private java.lang.String                                                    processingMode;

  private nexos.service.ed.ws.elca.corpOnLineEcom.AdditionalBatchInformation2 additionalBatchInformation;

  private nexos.service.ed.ws.elca.corpOnLineEcom.AdditionalRoutingFilters2   additionalRoutingFilters;

  private nexos.service.ed.ws.elca.corpOnLineEcom.SplitControl2               splitControl;

  private nexos.service.ed.ws.elca.corpOnLineEcom.TradingNetworks2            tradingNetworks;

  public Coverpage2() {
  }

  public Coverpage2(java.lang.String IZId, java.lang.String IZTrxSequence, java.lang.String IZRecordSetId,
    java.lang.String IZUuid, java.lang.String IZUuidReference,
    nexos.service.ed.ws.elca.corpOnLineEcom.IZTrxStatus2 IZTrxStatus,
    nexos.service.ed.ws.elca.corpOnLineEcom.IZRecordStatus2 IZRecordStatus,
    nexos.service.ed.ws.elca.corpOnLineEcom.IZResultStatus2 IZResultStatus,
    nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage2[] IZResultMessageList,
    nexos.service.ed.ws.elca.corpOnLineEcom.IZLargeFileFlag2 IZLargeFileFlag, java.lang.String IZLargeFileLocation,
    java.lang.String objectType, java.lang.String version, nexos.service.ed.ws.elca.corpOnLineEcom.Action2 action,
    java.lang.String objectBusinessId, java.lang.String applicationTrxId, java.lang.String applicationTrxIdRef,
    java.lang.String applicationTimestamp, java.lang.String sourceApplication,
    java.lang.String sourceApplicationRegion, java.lang.String destinationApplication,
    java.lang.String destinationApplicationRegion,
    nexos.service.ed.ws.elca.corpOnLineEcom.ConfirmationIndicator2 confirmationIndicator,
    java.lang.String confirmationTimeout, java.lang.String routingFilter,
    nexos.service.ed.ws.elca.corpOnLineEcom.AuditRequiredFlag2 auditRequiredFlag, java.lang.String auditXMLString,
    java.lang.String applicationBatchId, java.lang.String batchControlId, java.lang.Long batchRecordCount,
    java.math.BigDecimal batchControlValue,
    nexos.service.ed.ws.elca.corpOnLineEcom.BatchControlRecordType2 batchControlRecordType,
    java.lang.String interfaceAttributes, java.lang.String language, java.lang.String encoding,
    java.lang.String sourcePackageName, java.lang.String processingMode,
    nexos.service.ed.ws.elca.corpOnLineEcom.AdditionalBatchInformation2 additionalBatchInformation,
    nexos.service.ed.ws.elca.corpOnLineEcom.AdditionalRoutingFilters2 additionalRoutingFilters,
    nexos.service.ed.ws.elca.corpOnLineEcom.SplitControl2 splitControl,
    nexos.service.ed.ws.elca.corpOnLineEcom.TradingNetworks2 tradingNetworks) {
    this.IZId = IZId;
    this.IZTrxSequence = IZTrxSequence;
    this.IZRecordSetId = IZRecordSetId;
    this.IZUuid = IZUuid;
    this.IZUuidReference = IZUuidReference;
    this.IZTrxStatus = IZTrxStatus;
    this.IZRecordStatus = IZRecordStatus;
    this.IZResultStatus = IZResultStatus;
    this.IZResultMessageList = IZResultMessageList;
    this.IZLargeFileFlag = IZLargeFileFlag;
    this.IZLargeFileLocation = IZLargeFileLocation;
    this.objectType = objectType;
    this.version = version;
    this.action = action;
    this.objectBusinessId = objectBusinessId;
    this.applicationTrxId = applicationTrxId;
    this.applicationTrxIdRef = applicationTrxIdRef;
    this.applicationTimestamp = applicationTimestamp;
    this.sourceApplication = sourceApplication;
    this.sourceApplicationRegion = sourceApplicationRegion;
    this.destinationApplication = destinationApplication;
    this.destinationApplicationRegion = destinationApplicationRegion;
    this.confirmationIndicator = confirmationIndicator;
    this.confirmationTimeout = confirmationTimeout;
    this.routingFilter = routingFilter;
    this.auditRequiredFlag = auditRequiredFlag;
    this.auditXMLString = auditXMLString;
    this.applicationBatchId = applicationBatchId;
    this.batchControlId = batchControlId;
    this.batchRecordCount = batchRecordCount;
    this.batchControlValue = batchControlValue;
    this.batchControlRecordType = batchControlRecordType;
    this.interfaceAttributes = interfaceAttributes;
    this.language = language;
    this.encoding = encoding;
    this.sourcePackageName = sourcePackageName;
    this.processingMode = processingMode;
    this.additionalBatchInformation = additionalBatchInformation;
    this.additionalRoutingFilters = additionalRoutingFilters;
    this.splitControl = splitControl;
    this.tradingNetworks = tradingNetworks;
  }

  /**
   * Gets the IZId value for this Coverpage2.
   * 
   * @return IZId
   */
  public java.lang.String getIZId() {
    return IZId;
  }

  /**
   * Sets the IZId value for this Coverpage2.
   * 
   * @param IZId
   */
  public void setIZId(java.lang.String IZId) {
    this.IZId = IZId;
  }

  /**
   * Gets the IZTrxSequence value for this Coverpage2.
   * 
   * @return IZTrxSequence
   */
  public java.lang.String getIZTrxSequence() {
    return IZTrxSequence;
  }

  /**
   * Sets the IZTrxSequence value for this Coverpage2.
   * 
   * @param IZTrxSequence
   */
  public void setIZTrxSequence(java.lang.String IZTrxSequence) {
    this.IZTrxSequence = IZTrxSequence;
  }

  /**
   * Gets the IZRecordSetId value for this Coverpage2.
   * 
   * @return IZRecordSetId
   */
  public java.lang.String getIZRecordSetId() {
    return IZRecordSetId;
  }

  /**
   * Sets the IZRecordSetId value for this Coverpage2.
   * 
   * @param IZRecordSetId
   */
  public void setIZRecordSetId(java.lang.String IZRecordSetId) {
    this.IZRecordSetId = IZRecordSetId;
  }

  /**
   * Gets the IZUuid value for this Coverpage2.
   * 
   * @return IZUuid
   */
  public java.lang.String getIZUuid() {
    return IZUuid;
  }

  /**
   * Sets the IZUuid value for this Coverpage2.
   * 
   * @param IZUuid
   */
  public void setIZUuid(java.lang.String IZUuid) {
    this.IZUuid = IZUuid;
  }

  /**
   * Gets the IZUuidReference value for this Coverpage2.
   * 
   * @return IZUuidReference
   */
  public java.lang.String getIZUuidReference() {
    return IZUuidReference;
  }

  /**
   * Sets the IZUuidReference value for this Coverpage2.
   * 
   * @param IZUuidReference
   */
  public void setIZUuidReference(java.lang.String IZUuidReference) {
    this.IZUuidReference = IZUuidReference;
  }

  /**
   * Gets the IZTrxStatus value for this Coverpage2.
   * 
   * @return IZTrxStatus
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.IZTrxStatus2 getIZTrxStatus() {
    return IZTrxStatus;
  }

  /**
   * Sets the IZTrxStatus value for this Coverpage2.
   * 
   * @param IZTrxStatus
   */
  public void setIZTrxStatus(nexos.service.ed.ws.elca.corpOnLineEcom.IZTrxStatus2 IZTrxStatus) {
    this.IZTrxStatus = IZTrxStatus;
  }

  /**
   * Gets the IZRecordStatus value for this Coverpage2.
   * 
   * @return IZRecordStatus
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.IZRecordStatus2 getIZRecordStatus() {
    return IZRecordStatus;
  }

  /**
   * Sets the IZRecordStatus value for this Coverpage2.
   * 
   * @param IZRecordStatus
   */
  public void setIZRecordStatus(nexos.service.ed.ws.elca.corpOnLineEcom.IZRecordStatus2 IZRecordStatus) {
    this.IZRecordStatus = IZRecordStatus;
  }

  /**
   * Gets the IZResultStatus value for this Coverpage2.
   * 
   * @return IZResultStatus
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.IZResultStatus2 getIZResultStatus() {
    return IZResultStatus;
  }

  /**
   * Sets the IZResultStatus value for this Coverpage2.
   * 
   * @param IZResultStatus
   */
  public void setIZResultStatus(nexos.service.ed.ws.elca.corpOnLineEcom.IZResultStatus2 IZResultStatus) {
    this.IZResultStatus = IZResultStatus;
  }

  /**
   * Gets the IZResultMessageList value for this Coverpage2.
   * 
   * @return IZResultMessageList
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage2[] getIZResultMessageList() {
    return IZResultMessageList;
  }

  /**
   * Sets the IZResultMessageList value for this Coverpage2.
   * 
   * @param IZResultMessageList
   */
  public void setIZResultMessageList(nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage2[] IZResultMessageList) {
    this.IZResultMessageList = IZResultMessageList;
  }

  /**
   * Gets the IZLargeFileFlag value for this Coverpage2.
   * 
   * @return IZLargeFileFlag
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.IZLargeFileFlag2 getIZLargeFileFlag() {
    return IZLargeFileFlag;
  }

  /**
   * Sets the IZLargeFileFlag value for this Coverpage2.
   * 
   * @param IZLargeFileFlag
   */
  public void setIZLargeFileFlag(nexos.service.ed.ws.elca.corpOnLineEcom.IZLargeFileFlag2 IZLargeFileFlag) {
    this.IZLargeFileFlag = IZLargeFileFlag;
  }

  /**
   * Gets the IZLargeFileLocation value for this Coverpage2.
   * 
   * @return IZLargeFileLocation
   */
  public java.lang.String getIZLargeFileLocation() {
    return IZLargeFileLocation;
  }

  /**
   * Sets the IZLargeFileLocation value for this Coverpage2.
   * 
   * @param IZLargeFileLocation
   */
  public void setIZLargeFileLocation(java.lang.String IZLargeFileLocation) {
    this.IZLargeFileLocation = IZLargeFileLocation;
  }

  /**
   * Gets the objectType value for this Coverpage2.
   * 
   * @return objectType
   */
  public java.lang.String getObjectType() {
    return objectType;
  }

  /**
   * Sets the objectType value for this Coverpage2.
   * 
   * @param objectType
   */
  public void setObjectType(java.lang.String objectType) {
    this.objectType = objectType;
  }

  /**
   * Gets the version value for this Coverpage2.
   * 
   * @return version
   */
  public java.lang.String getVersion() {
    return version;
  }

  /**
   * Sets the version value for this Coverpage2.
   * 
   * @param version
   */
  public void setVersion(java.lang.String version) {
    this.version = version;
  }

  /**
   * Gets the action value for this Coverpage2.
   * 
   * @return action
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.Action2 getAction() {
    return action;
  }

  /**
   * Sets the action value for this Coverpage2.
   * 
   * @param action
   */
  public void setAction(nexos.service.ed.ws.elca.corpOnLineEcom.Action2 action) {
    this.action = action;
  }

  /**
   * Gets the objectBusinessId value for this Coverpage2.
   * 
   * @return objectBusinessId
   */
  public java.lang.String getObjectBusinessId() {
    return objectBusinessId;
  }

  /**
   * Sets the objectBusinessId value for this Coverpage2.
   * 
   * @param objectBusinessId
   */
  public void setObjectBusinessId(java.lang.String objectBusinessId) {
    this.objectBusinessId = objectBusinessId;
  }

  /**
   * Gets the applicationTrxId value for this Coverpage2.
   * 
   * @return applicationTrxId
   */
  public java.lang.String getApplicationTrxId() {
    return applicationTrxId;
  }

  /**
   * Sets the applicationTrxId value for this Coverpage2.
   * 
   * @param applicationTrxId
   */
  public void setApplicationTrxId(java.lang.String applicationTrxId) {
    this.applicationTrxId = applicationTrxId;
  }

  /**
   * Gets the applicationTrxIdRef value for this Coverpage2.
   * 
   * @return applicationTrxIdRef
   */
  public java.lang.String getApplicationTrxIdRef() {
    return applicationTrxIdRef;
  }

  /**
   * Sets the applicationTrxIdRef value for this Coverpage2.
   * 
   * @param applicationTrxIdRef
   */
  public void setApplicationTrxIdRef(java.lang.String applicationTrxIdRef) {
    this.applicationTrxIdRef = applicationTrxIdRef;
  }

  /**
   * Gets the applicationTimestamp value for this Coverpage2.
   * 
   * @return applicationTimestamp
   */
  public java.lang.String getApplicationTimestamp() {
    return applicationTimestamp;
  }

  /**
   * Sets the applicationTimestamp value for this Coverpage2.
   * 
   * @param applicationTimestamp
   */
  public void setApplicationTimestamp(java.lang.String applicationTimestamp) {
    this.applicationTimestamp = applicationTimestamp;
  }

  /**
   * Gets the sourceApplication value for this Coverpage2.
   * 
   * @return sourceApplication
   */
  public java.lang.String getSourceApplication() {
    return sourceApplication;
  }

  /**
   * Sets the sourceApplication value for this Coverpage2.
   * 
   * @param sourceApplication
   */
  public void setSourceApplication(java.lang.String sourceApplication) {
    this.sourceApplication = sourceApplication;
  }

  /**
   * Gets the sourceApplicationRegion value for this Coverpage2.
   * 
   * @return sourceApplicationRegion
   */
  public java.lang.String getSourceApplicationRegion() {
    return sourceApplicationRegion;
  }

  /**
   * Sets the sourceApplicationRegion value for this Coverpage2.
   * 
   * @param sourceApplicationRegion
   */
  public void setSourceApplicationRegion(java.lang.String sourceApplicationRegion) {
    this.sourceApplicationRegion = sourceApplicationRegion;
  }

  /**
   * Gets the destinationApplication value for this Coverpage2.
   * 
   * @return destinationApplication
   */
  public java.lang.String getDestinationApplication() {
    return destinationApplication;
  }

  /**
   * Sets the destinationApplication value for this Coverpage2.
   * 
   * @param destinationApplication
   */
  public void setDestinationApplication(java.lang.String destinationApplication) {
    this.destinationApplication = destinationApplication;
  }

  /**
   * Gets the destinationApplicationRegion value for this Coverpage2.
   * 
   * @return destinationApplicationRegion
   */
  public java.lang.String getDestinationApplicationRegion() {
    return destinationApplicationRegion;
  }

  /**
   * Sets the destinationApplicationRegion value for this Coverpage2.
   * 
   * @param destinationApplicationRegion
   */
  public void setDestinationApplicationRegion(java.lang.String destinationApplicationRegion) {
    this.destinationApplicationRegion = destinationApplicationRegion;
  }

  /**
   * Gets the confirmationIndicator value for this Coverpage2.
   * 
   * @return confirmationIndicator
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.ConfirmationIndicator2 getConfirmationIndicator() {
    return confirmationIndicator;
  }

  /**
   * Sets the confirmationIndicator value for this Coverpage2.
   * 
   * @param confirmationIndicator
   */
  public void setConfirmationIndicator(
    nexos.service.ed.ws.elca.corpOnLineEcom.ConfirmationIndicator2 confirmationIndicator) {
    this.confirmationIndicator = confirmationIndicator;
  }

  /**
   * Gets the confirmationTimeout value for this Coverpage2.
   * 
   * @return confirmationTimeout
   */
  public java.lang.String getConfirmationTimeout() {
    return confirmationTimeout;
  }

  /**
   * Sets the confirmationTimeout value for this Coverpage2.
   * 
   * @param confirmationTimeout
   */
  public void setConfirmationTimeout(java.lang.String confirmationTimeout) {
    this.confirmationTimeout = confirmationTimeout;
  }

  /**
   * Gets the routingFilter value for this Coverpage2.
   * 
   * @return routingFilter
   */
  public java.lang.String getRoutingFilter() {
    return routingFilter;
  }

  /**
   * Sets the routingFilter value for this Coverpage2.
   * 
   * @param routingFilter
   */
  public void setRoutingFilter(java.lang.String routingFilter) {
    this.routingFilter = routingFilter;
  }

  /**
   * Gets the auditRequiredFlag value for this Coverpage2.
   * 
   * @return auditRequiredFlag
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.AuditRequiredFlag2 getAuditRequiredFlag() {
    return auditRequiredFlag;
  }

  /**
   * Sets the auditRequiredFlag value for this Coverpage2.
   * 
   * @param auditRequiredFlag
   */
  public void setAuditRequiredFlag(nexos.service.ed.ws.elca.corpOnLineEcom.AuditRequiredFlag2 auditRequiredFlag) {
    this.auditRequiredFlag = auditRequiredFlag;
  }

  /**
   * Gets the auditXMLString value for this Coverpage2.
   * 
   * @return auditXMLString
   */
  public java.lang.String getAuditXMLString() {
    return auditXMLString;
  }

  /**
   * Sets the auditXMLString value for this Coverpage2.
   * 
   * @param auditXMLString
   */
  public void setAuditXMLString(java.lang.String auditXMLString) {
    this.auditXMLString = auditXMLString;
  }

  /**
   * Gets the applicationBatchId value for this Coverpage2.
   * 
   * @return applicationBatchId
   */
  public java.lang.String getApplicationBatchId() {
    return applicationBatchId;
  }

  /**
   * Sets the applicationBatchId value for this Coverpage2.
   * 
   * @param applicationBatchId
   */
  public void setApplicationBatchId(java.lang.String applicationBatchId) {
    this.applicationBatchId = applicationBatchId;
  }

  /**
   * Gets the batchControlId value for this Coverpage2.
   * 
   * @return batchControlId
   */
  public java.lang.String getBatchControlId() {
    return batchControlId;
  }

  /**
   * Sets the batchControlId value for this Coverpage2.
   * 
   * @param batchControlId
   */
  public void setBatchControlId(java.lang.String batchControlId) {
    this.batchControlId = batchControlId;
  }

  /**
   * Gets the batchRecordCount value for this Coverpage2.
   * 
   * @return batchRecordCount
   */
  public java.lang.Long getBatchRecordCount() {
    return batchRecordCount;
  }

  /**
   * Sets the batchRecordCount value for this Coverpage2.
   * 
   * @param batchRecordCount
   */
  public void setBatchRecordCount(java.lang.Long batchRecordCount) {
    this.batchRecordCount = batchRecordCount;
  }

  /**
   * Gets the batchControlValue value for this Coverpage2.
   * 
   * @return batchControlValue
   */
  public java.math.BigDecimal getBatchControlValue() {
    return batchControlValue;
  }

  /**
   * Sets the batchControlValue value for this Coverpage2.
   * 
   * @param batchControlValue
   */
  public void setBatchControlValue(java.math.BigDecimal batchControlValue) {
    this.batchControlValue = batchControlValue;
  }

  /**
   * Gets the batchControlRecordType value for this Coverpage2.
   * 
   * @return batchControlRecordType
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.BatchControlRecordType2 getBatchControlRecordType() {
    return batchControlRecordType;
  }

  /**
   * Sets the batchControlRecordType value for this Coverpage2.
   * 
   * @param batchControlRecordType
   */
  public void setBatchControlRecordType(
    nexos.service.ed.ws.elca.corpOnLineEcom.BatchControlRecordType2 batchControlRecordType) {
    this.batchControlRecordType = batchControlRecordType;
  }

  /**
   * Gets the interfaceAttributes value for this Coverpage2.
   * 
   * @return interfaceAttributes
   */
  public java.lang.String getInterfaceAttributes() {
    return interfaceAttributes;
  }

  /**
   * Sets the interfaceAttributes value for this Coverpage2.
   * 
   * @param interfaceAttributes
   */
  public void setInterfaceAttributes(java.lang.String interfaceAttributes) {
    this.interfaceAttributes = interfaceAttributes;
  }

  /**
   * Gets the language value for this Coverpage2.
   * 
   * @return language
   */
  public java.lang.String getLanguage() {
    return language;
  }

  /**
   * Sets the language value for this Coverpage2.
   * 
   * @param language
   */
  public void setLanguage(java.lang.String language) {
    this.language = language;
  }

  /**
   * Gets the encoding value for this Coverpage2.
   * 
   * @return encoding
   */
  public java.lang.String getEncoding() {
    return encoding;
  }

  /**
   * Sets the encoding value for this Coverpage2.
   * 
   * @param encoding
   */
  public void setEncoding(java.lang.String encoding) {
    this.encoding = encoding;
  }

  /**
   * Gets the sourcePackageName value for this Coverpage2.
   * 
   * @return sourcePackageName
   */
  public java.lang.String getSourcePackageName() {
    return sourcePackageName;
  }

  /**
   * Sets the sourcePackageName value for this Coverpage2.
   * 
   * @param sourcePackageName
   */
  public void setSourcePackageName(java.lang.String sourcePackageName) {
    this.sourcePackageName = sourcePackageName;
  }

  /**
   * Gets the processingMode value for this Coverpage2.
   * 
   * @return processingMode
   */
  public java.lang.String getProcessingMode() {
    return processingMode;
  }

  /**
   * Sets the processingMode value for this Coverpage2.
   * 
   * @param processingMode
   */
  public void setProcessingMode(java.lang.String processingMode) {
    this.processingMode = processingMode;
  }

  /**
   * Gets the additionalBatchInformation value for this Coverpage2.
   * 
   * @return additionalBatchInformation
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.AdditionalBatchInformation2 getAdditionalBatchInformation() {
    return additionalBatchInformation;
  }

  /**
   * Sets the additionalBatchInformation value for this Coverpage2.
   * 
   * @param additionalBatchInformation
   */
  public void setAdditionalBatchInformation(
    nexos.service.ed.ws.elca.corpOnLineEcom.AdditionalBatchInformation2 additionalBatchInformation) {
    this.additionalBatchInformation = additionalBatchInformation;
  }

  /**
   * Gets the additionalRoutingFilters value for this Coverpage2.
   * 
   * @return additionalRoutingFilters
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.AdditionalRoutingFilters2 getAdditionalRoutingFilters() {
    return additionalRoutingFilters;
  }

  /**
   * Sets the additionalRoutingFilters value for this Coverpage2.
   * 
   * @param additionalRoutingFilters
   */
  public void setAdditionalRoutingFilters(
    nexos.service.ed.ws.elca.corpOnLineEcom.AdditionalRoutingFilters2 additionalRoutingFilters) {
    this.additionalRoutingFilters = additionalRoutingFilters;
  }

  /**
   * Gets the splitControl value for this Coverpage2.
   * 
   * @return splitControl
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.SplitControl2 getSplitControl() {
    return splitControl;
  }

  /**
   * Sets the splitControl value for this Coverpage2.
   * 
   * @param splitControl
   */
  public void setSplitControl(nexos.service.ed.ws.elca.corpOnLineEcom.SplitControl2 splitControl) {
    this.splitControl = splitControl;
  }

  /**
   * Gets the tradingNetworks value for this Coverpage2.
   * 
   * @return tradingNetworks
   */
  public nexos.service.ed.ws.elca.corpOnLineEcom.TradingNetworks2 getTradingNetworks() {
    return tradingNetworks;
  }

  /**
   * Sets the tradingNetworks value for this Coverpage2.
   * 
   * @param tradingNetworks
   */
  public void setTradingNetworks(nexos.service.ed.ws.elca.corpOnLineEcom.TradingNetworks2 tradingNetworks) {
    this.tradingNetworks = tradingNetworks;
  }

  private java.lang.Object __equalsCalc = null;

  public synchronized boolean equals(java.lang.Object obj) {
    if (!(obj instanceof Coverpage2))
      return false;
    Coverpage2 other = (Coverpage2)obj;
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
      && ((this.IZId == null && other.getIZId() == null) || (this.IZId != null && this.IZId.equals(other.getIZId())))
      && ((this.IZTrxSequence == null && other.getIZTrxSequence() == null) || (this.IZTrxSequence != null && this.IZTrxSequence
        .equals(other.getIZTrxSequence())))
      && ((this.IZRecordSetId == null && other.getIZRecordSetId() == null) || (this.IZRecordSetId != null && this.IZRecordSetId
        .equals(other.getIZRecordSetId())))
      && ((this.IZUuid == null && other.getIZUuid() == null) || (this.IZUuid != null && this.IZUuid.equals(other
        .getIZUuid())))
      && ((this.IZUuidReference == null && other.getIZUuidReference() == null) || (this.IZUuidReference != null && this.IZUuidReference
        .equals(other.getIZUuidReference())))
      && ((this.IZTrxStatus == null && other.getIZTrxStatus() == null) || (this.IZTrxStatus != null && this.IZTrxStatus
        .equals(other.getIZTrxStatus())))
      && ((this.IZRecordStatus == null && other.getIZRecordStatus() == null) || (this.IZRecordStatus != null && this.IZRecordStatus
        .equals(other.getIZRecordStatus())))
      && ((this.IZResultStatus == null && other.getIZResultStatus() == null) || (this.IZResultStatus != null && this.IZResultStatus
        .equals(other.getIZResultStatus())))
      && ((this.IZResultMessageList == null && other.getIZResultMessageList() == null) || (this.IZResultMessageList != null && java.util.Arrays
        .equals(this.IZResultMessageList, other.getIZResultMessageList())))
      && ((this.IZLargeFileFlag == null && other.getIZLargeFileFlag() == null) || (this.IZLargeFileFlag != null && this.IZLargeFileFlag
        .equals(other.getIZLargeFileFlag())))
      && ((this.IZLargeFileLocation == null && other.getIZLargeFileLocation() == null) || (this.IZLargeFileLocation != null && this.IZLargeFileLocation
        .equals(other.getIZLargeFileLocation())))
      && ((this.objectType == null && other.getObjectType() == null) || (this.objectType != null && this.objectType
        .equals(other.getObjectType())))
      && ((this.version == null && other.getVersion() == null) || (this.version != null && this.version.equals(other
        .getVersion())))
      && ((this.action == null && other.getAction() == null) || (this.action != null && this.action.equals(other
        .getAction())))
      && ((this.objectBusinessId == null && other.getObjectBusinessId() == null) || (this.objectBusinessId != null && this.objectBusinessId
        .equals(other.getObjectBusinessId())))
      && ((this.applicationTrxId == null && other.getApplicationTrxId() == null) || (this.applicationTrxId != null && this.applicationTrxId
        .equals(other.getApplicationTrxId())))
      && ((this.applicationTrxIdRef == null && other.getApplicationTrxIdRef() == null) || (this.applicationTrxIdRef != null && this.applicationTrxIdRef
        .equals(other.getApplicationTrxIdRef())))
      && ((this.applicationTimestamp == null && other.getApplicationTimestamp() == null) || (this.applicationTimestamp != null && this.applicationTimestamp
        .equals(other.getApplicationTimestamp())))
      && ((this.sourceApplication == null && other.getSourceApplication() == null) || (this.sourceApplication != null && this.sourceApplication
        .equals(other.getSourceApplication())))
      && ((this.sourceApplicationRegion == null && other.getSourceApplicationRegion() == null) || (this.sourceApplicationRegion != null && this.sourceApplicationRegion
        .equals(other.getSourceApplicationRegion())))
      && ((this.destinationApplication == null && other.getDestinationApplication() == null) || (this.destinationApplication != null && this.destinationApplication
        .equals(other.getDestinationApplication())))
      && ((this.destinationApplicationRegion == null && other.getDestinationApplicationRegion() == null) || (this.destinationApplicationRegion != null && this.destinationApplicationRegion
        .equals(other.getDestinationApplicationRegion())))
      && ((this.confirmationIndicator == null && other.getConfirmationIndicator() == null) || (this.confirmationIndicator != null && this.confirmationIndicator
        .equals(other.getConfirmationIndicator())))
      && ((this.confirmationTimeout == null && other.getConfirmationTimeout() == null) || (this.confirmationTimeout != null && this.confirmationTimeout
        .equals(other.getConfirmationTimeout())))
      && ((this.routingFilter == null && other.getRoutingFilter() == null) || (this.routingFilter != null && this.routingFilter
        .equals(other.getRoutingFilter())))
      && ((this.auditRequiredFlag == null && other.getAuditRequiredFlag() == null) || (this.auditRequiredFlag != null && this.auditRequiredFlag
        .equals(other.getAuditRequiredFlag())))
      && ((this.auditXMLString == null && other.getAuditXMLString() == null) || (this.auditXMLString != null && this.auditXMLString
        .equals(other.getAuditXMLString())))
      && ((this.applicationBatchId == null && other.getApplicationBatchId() == null) || (this.applicationBatchId != null && this.applicationBatchId
        .equals(other.getApplicationBatchId())))
      && ((this.batchControlId == null && other.getBatchControlId() == null) || (this.batchControlId != null && this.batchControlId
        .equals(other.getBatchControlId())))
      && ((this.batchRecordCount == null && other.getBatchRecordCount() == null) || (this.batchRecordCount != null && this.batchRecordCount
        .equals(other.getBatchRecordCount())))
      && ((this.batchControlValue == null && other.getBatchControlValue() == null) || (this.batchControlValue != null && this.batchControlValue
        .equals(other.getBatchControlValue())))
      && ((this.batchControlRecordType == null && other.getBatchControlRecordType() == null) || (this.batchControlRecordType != null && this.batchControlRecordType
        .equals(other.getBatchControlRecordType())))
      && ((this.interfaceAttributes == null && other.getInterfaceAttributes() == null) || (this.interfaceAttributes != null && this.interfaceAttributes
        .equals(other.getInterfaceAttributes())))
      && ((this.language == null && other.getLanguage() == null) || (this.language != null && this.language
        .equals(other.getLanguage())))
      && ((this.encoding == null && other.getEncoding() == null) || (this.encoding != null && this.encoding
        .equals(other.getEncoding())))
      && ((this.sourcePackageName == null && other.getSourcePackageName() == null) || (this.sourcePackageName != null && this.sourcePackageName
        .equals(other.getSourcePackageName())))
      && ((this.processingMode == null && other.getProcessingMode() == null) || (this.processingMode != null && this.processingMode
        .equals(other.getProcessingMode())))
      && ((this.additionalBatchInformation == null && other.getAdditionalBatchInformation() == null) || (this.additionalBatchInformation != null && this.additionalBatchInformation
        .equals(other.getAdditionalBatchInformation())))
      && ((this.additionalRoutingFilters == null && other.getAdditionalRoutingFilters() == null) || (this.additionalRoutingFilters != null && this.additionalRoutingFilters
        .equals(other.getAdditionalRoutingFilters())))
      && ((this.splitControl == null && other.getSplitControl() == null) || (this.splitControl != null && this.splitControl
        .equals(other.getSplitControl())))
      && ((this.tradingNetworks == null && other.getTradingNetworks() == null) || (this.tradingNetworks != null && this.tradingNetworks
        .equals(other.getTradingNetworks())));
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
    if (getIZId() != null) {
      _hashCode += getIZId().hashCode();
    }
    if (getIZTrxSequence() != null) {
      _hashCode += getIZTrxSequence().hashCode();
    }
    if (getIZRecordSetId() != null) {
      _hashCode += getIZRecordSetId().hashCode();
    }
    if (getIZUuid() != null) {
      _hashCode += getIZUuid().hashCode();
    }
    if (getIZUuidReference() != null) {
      _hashCode += getIZUuidReference().hashCode();
    }
    if (getIZTrxStatus() != null) {
      _hashCode += getIZTrxStatus().hashCode();
    }
    if (getIZRecordStatus() != null) {
      _hashCode += getIZRecordStatus().hashCode();
    }
    if (getIZResultStatus() != null) {
      _hashCode += getIZResultStatus().hashCode();
    }
    if (getIZResultMessageList() != null) {
      for (int i = 0; i < java.lang.reflect.Array.getLength(getIZResultMessageList()); i++) {
        java.lang.Object obj = java.lang.reflect.Array.get(getIZResultMessageList(), i);
        if (obj != null && !obj.getClass().isArray()) {
          _hashCode += obj.hashCode();
        }
      }
    }
    if (getIZLargeFileFlag() != null) {
      _hashCode += getIZLargeFileFlag().hashCode();
    }
    if (getIZLargeFileLocation() != null) {
      _hashCode += getIZLargeFileLocation().hashCode();
    }
    if (getObjectType() != null) {
      _hashCode += getObjectType().hashCode();
    }
    if (getVersion() != null) {
      _hashCode += getVersion().hashCode();
    }
    if (getAction() != null) {
      _hashCode += getAction().hashCode();
    }
    if (getObjectBusinessId() != null) {
      _hashCode += getObjectBusinessId().hashCode();
    }
    if (getApplicationTrxId() != null) {
      _hashCode += getApplicationTrxId().hashCode();
    }
    if (getApplicationTrxIdRef() != null) {
      _hashCode += getApplicationTrxIdRef().hashCode();
    }
    if (getApplicationTimestamp() != null) {
      _hashCode += getApplicationTimestamp().hashCode();
    }
    if (getSourceApplication() != null) {
      _hashCode += getSourceApplication().hashCode();
    }
    if (getSourceApplicationRegion() != null) {
      _hashCode += getSourceApplicationRegion().hashCode();
    }
    if (getDestinationApplication() != null) {
      _hashCode += getDestinationApplication().hashCode();
    }
    if (getDestinationApplicationRegion() != null) {
      _hashCode += getDestinationApplicationRegion().hashCode();
    }
    if (getConfirmationIndicator() != null) {
      _hashCode += getConfirmationIndicator().hashCode();
    }
    if (getConfirmationTimeout() != null) {
      _hashCode += getConfirmationTimeout().hashCode();
    }
    if (getRoutingFilter() != null) {
      _hashCode += getRoutingFilter().hashCode();
    }
    if (getAuditRequiredFlag() != null) {
      _hashCode += getAuditRequiredFlag().hashCode();
    }
    if (getAuditXMLString() != null) {
      _hashCode += getAuditXMLString().hashCode();
    }
    if (getApplicationBatchId() != null) {
      _hashCode += getApplicationBatchId().hashCode();
    }
    if (getBatchControlId() != null) {
      _hashCode += getBatchControlId().hashCode();
    }
    if (getBatchRecordCount() != null) {
      _hashCode += getBatchRecordCount().hashCode();
    }
    if (getBatchControlValue() != null) {
      _hashCode += getBatchControlValue().hashCode();
    }
    if (getBatchControlRecordType() != null) {
      _hashCode += getBatchControlRecordType().hashCode();
    }
    if (getInterfaceAttributes() != null) {
      _hashCode += getInterfaceAttributes().hashCode();
    }
    if (getLanguage() != null) {
      _hashCode += getLanguage().hashCode();
    }
    if (getEncoding() != null) {
      _hashCode += getEncoding().hashCode();
    }
    if (getSourcePackageName() != null) {
      _hashCode += getSourcePackageName().hashCode();
    }
    if (getProcessingMode() != null) {
      _hashCode += getProcessingMode().hashCode();
    }
    if (getAdditionalBatchInformation() != null) {
      _hashCode += getAdditionalBatchInformation().hashCode();
    }
    if (getAdditionalRoutingFilters() != null) {
      _hashCode += getAdditionalRoutingFilters().hashCode();
    }
    if (getSplitControl() != null) {
      _hashCode += getSplitControl().hashCode();
    }
    if (getTradingNetworks() != null) {
      _hashCode += getTradingNetworks().hashCode();
    }
    __hashCodeCalc = false;
    return _hashCode;
  }

  // Type metadata
  private static org.apache.axis.description.TypeDesc typeDesc = new org.apache.axis.description.TypeDesc(
                                                                 Coverpage2.class, true);

  static {
    typeDesc.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Coverpage2"));
    org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("IZId");
    elemField.setXmlName(new javax.xml.namespace.QName("", "IZId"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("IZTrxSequence");
    elemField.setXmlName(new javax.xml.namespace.QName("", "IZTrxSequence"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("IZRecordSetId");
    elemField.setXmlName(new javax.xml.namespace.QName("", "IZRecordSetId"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("IZUuid");
    elemField.setXmlName(new javax.xml.namespace.QName("", "IZUuid"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("IZUuidReference");
    elemField.setXmlName(new javax.xml.namespace.QName("", "IZUuidReference"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("IZTrxStatus");
    elemField.setXmlName(new javax.xml.namespace.QName("", "IZTrxStatus"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZTrxStatus2"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("IZRecordStatus");
    elemField.setXmlName(new javax.xml.namespace.QName("", "IZRecordStatus"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZRecordStatus2"));
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("IZResultStatus");
    elemField.setXmlName(new javax.xml.namespace.QName("", "IZResultStatus"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZResultStatus2"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("IZResultMessageList");
    elemField.setXmlName(new javax.xml.namespace.QName("", "IZResultMessageList"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ResultMessage2"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    elemField.setItemQName(new javax.xml.namespace.QName("", "ResultMessage"));
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("IZLargeFileFlag");
    elemField.setXmlName(new javax.xml.namespace.QName("", "IZLargeFileFlag"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZLargeFileFlag2"));
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("IZLargeFileLocation");
    elemField.setXmlName(new javax.xml.namespace.QName("", "IZLargeFileLocation"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("objectType");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ObjectType"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("version");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Version"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("action");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Action"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Action2"));
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("objectBusinessId");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ObjectBusinessId"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("applicationTrxId");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ApplicationTrxId"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("applicationTrxIdRef");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ApplicationTrxIdRef"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("applicationTimestamp");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ApplicationTimestamp"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("sourceApplication");
    elemField.setXmlName(new javax.xml.namespace.QName("", "SourceApplication"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("sourceApplicationRegion");
    elemField.setXmlName(new javax.xml.namespace.QName("", "SourceApplicationRegion"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("destinationApplication");
    elemField.setXmlName(new javax.xml.namespace.QName("", "DestinationApplication"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("destinationApplicationRegion");
    elemField.setXmlName(new javax.xml.namespace.QName("", "DestinationApplicationRegion"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("confirmationIndicator");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ConfirmationIndicator"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "ConfirmationIndicator2"));
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("confirmationTimeout");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ConfirmationTimeout"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("routingFilter");
    elemField.setXmlName(new javax.xml.namespace.QName("", "RoutingFilter"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("auditRequiredFlag");
    elemField.setXmlName(new javax.xml.namespace.QName("", "AuditRequiredFlag"));
    elemField
      .setXmlType(new javax.xml.namespace.QName(
        "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
        "AuditRequiredFlag2"));
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("auditXMLString");
    elemField.setXmlName(new javax.xml.namespace.QName("", "AuditXMLString"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("applicationBatchId");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ApplicationBatchId"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("batchControlId");
    elemField.setXmlName(new javax.xml.namespace.QName("", "BatchControlId"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("batchRecordCount");
    elemField.setXmlName(new javax.xml.namespace.QName("", "BatchRecordCount"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "long"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("batchControlValue");
    elemField.setXmlName(new javax.xml.namespace.QName("", "BatchControlValue"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "decimal"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("batchControlRecordType");
    elemField.setXmlName(new javax.xml.namespace.QName("", "BatchControlRecordType"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "BatchControlRecordType2"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("interfaceAttributes");
    elemField.setXmlName(new javax.xml.namespace.QName("", "InterfaceAttributes"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("language");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Language"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("encoding");
    elemField.setXmlName(new javax.xml.namespace.QName("", "Encoding"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("sourcePackageName");
    elemField.setXmlName(new javax.xml.namespace.QName("", "SourcePackageName"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("processingMode");
    elemField.setXmlName(new javax.xml.namespace.QName("", "ProcessingMode"));
    elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    elemField.setMinOccurs(0);
    elemField.setNillable(true);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("additionalBatchInformation");
    elemField.setXmlName(new javax.xml.namespace.QName("", "AdditionalBatchInformation"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "AdditionalBatchInformation2"));
    elemField.setMinOccurs(0);
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("additionalRoutingFilters");
    elemField.setXmlName(new javax.xml.namespace.QName("", "AdditionalRoutingFilters"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "AdditionalRoutingFilters2"));
    elemField.setMinOccurs(0);
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("splitControl");
    elemField.setXmlName(new javax.xml.namespace.QName("", "SplitControl"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "SplitControl2"));
    elemField.setMinOccurs(0);
    elemField.setNillable(false);
    typeDesc.addFieldDesc(elemField);
    elemField = new org.apache.axis.description.ElementDesc();
    elemField.setFieldName("tradingNetworks");
    elemField.setXmlName(new javax.xml.namespace.QName("", "TradingNetworks"));
    elemField.setXmlType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "TradingNetworks2"));
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
