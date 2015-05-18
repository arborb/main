/**
 * CorpOnLineEcomLocator.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"serial", "rawtypes", "unchecked"})
public class CorpOnLineEcomLocator extends org.apache.axis.client.Service implements
  nexos.service.ed.ws.elca.corpOnLineEcom.CorpOnLineEcom {

  public CorpOnLineEcomLocator() {
  }

  public CorpOnLineEcomLocator(org.apache.axis.EngineConfiguration config) {
    super(config);
  }

  public CorpOnLineEcomLocator(java.lang.String wsdlLoc, javax.xml.namespace.QName sName)
    throws javax.xml.rpc.ServiceException {
    super(wsdlLoc, sName);
  }

  // Use to get a proxy class for elc_purchaseOrder_corpOnLineEcom_kr_publish_corpOnLineEcom_Port
  private java.lang.String corpOnLineEcomServiceAddress = "http://wm3px.am.elcompanies.net:54522/ws/elc.purchaseOrder.corpOnLineEcom.kr.publish:corpOnLineEcom/elc_purchaseOrder_corpOnLineEcom_kr_publish_corpOnLineEcom_Port";

  public java.lang.String getCorpOnLineEcomAddress() {
    return corpOnLineEcomServiceAddress;
  }

  // The WSDD service name defaults to the port name.
  private java.lang.String corpOnLineEcomWSDDServiceName = "elc_purchaseOrder_corpOnLineEcom_kr_publish_corpOnLineEcom_Port";

  public java.lang.String getCorpOnLineEcomWSDDServiceName() {
    return corpOnLineEcomWSDDServiceName;
  }

  public void setCorpOnLineEcomWSDDServiceName(java.lang.String name) {
    corpOnLineEcomWSDDServiceName = name;
  }

  public nexos.service.ed.ws.elca.corpOnLineEcom.CorpOnLineEcom_PortType getCorpOnLineEcom()
    throws javax.xml.rpc.ServiceException {
    java.net.URL endpoint;
    try {
      endpoint = new java.net.URL(corpOnLineEcomServiceAddress);
    } catch (java.net.MalformedURLException e) {
      throw new javax.xml.rpc.ServiceException(e);
    }
    return getCorpOnLineEcom(endpoint);
  }

  public nexos.service.ed.ws.elca.corpOnLineEcom.CorpOnLineEcom_PortType getCorpOnLineEcom(java.net.URL portAddress)
    throws javax.xml.rpc.ServiceException {
    try {
      nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrderBinderStub _stub = new nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrderBinderStub(
        portAddress, this);
      _stub.setPortName(getCorpOnLineEcomWSDDServiceName());
      return _stub;
    } catch (org.apache.axis.AxisFault e) {
      return null;
    }
  }

  public void setCorpOnLineEcomEndpointAddress(java.lang.String address) {
    corpOnLineEcomServiceAddress = address;
  }

  /**
   * For the given interface, get the stub implementation.
   * If this service has no port for the given interface,
   * then ServiceException is thrown.
   */
  public java.rmi.Remote getPort(Class serviceEndpointInterface) throws javax.xml.rpc.ServiceException {
    try {
      if (nexos.service.ed.ws.elca.corpOnLineEcom.CorpOnLineEcom_PortType.class
        .isAssignableFrom(serviceEndpointInterface)) {
        nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrderBinderStub _stub = new nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrderBinderStub(
          new java.net.URL(corpOnLineEcomServiceAddress), this);
        _stub.setPortName(getCorpOnLineEcomWSDDServiceName());
        return _stub;
      }
    } catch (java.lang.Throwable t) {
      throw new javax.xml.rpc.ServiceException(t);
    }
    throw new javax.xml.rpc.ServiceException("There is no stub implementation for the interface:  "
      + (serviceEndpointInterface == null ? "null" : serviceEndpointInterface.getName()));
  }

  /**
   * For the given interface, get the stub implementation.
   * If this service has no port for the given interface,
   * then ServiceException is thrown.
   */
  public java.rmi.Remote getPort(javax.xml.namespace.QName portName, Class serviceEndpointInterface)
    throws javax.xml.rpc.ServiceException {
    if (portName == null) {
      return getPort(serviceEndpointInterface);
    }
    java.lang.String inputPortName = portName.getLocalPart();
    if ("elc_purchaseOrder_corpOnLineEcom_kr_publish_corpOnLineEcom_Port".equals(inputPortName)) {
      return getCorpOnLineEcom();
    } else {
      java.rmi.Remote _stub = getPort(serviceEndpointInterface);
      ((org.apache.axis.client.Stub)_stub).setPortName(portName);
      return _stub;
    }
  }

  public javax.xml.namespace.QName getServiceName() {
    return new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "corpOnLineEcom");
  }

  private java.util.HashSet ports = null;

  public java.util.Iterator getPorts() {
    if (ports == null) {
      ports = new java.util.HashSet();
      ports.add(new javax.xml.namespace.QName(
        "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
        "elc_purchaseOrder_corpOnLineEcom_kr_publish_corpOnLineEcom_Port"));
    }
    return ports.iterator();
  }

  /**
   * Set the endpoint address for the specified port name.
   */
  public void setEndpointAddress(java.lang.String portName, java.lang.String address)
    throws javax.xml.rpc.ServiceException {

    if ("elc_purchaseOrder_corpOnLineEcom_kr_publish_corpOnLineEcom_Port".equals(portName)) {
      setCorpOnLineEcomEndpointAddress(address);
    } else { // Unknown Port Name
      throw new javax.xml.rpc.ServiceException(" Cannot set Endpoint Address for Unknown Port" + portName);
    }
  }

  /**
   * Set the endpoint address for the specified port name.
   */
  public void setEndpointAddress(javax.xml.namespace.QName portName, java.lang.String address)
    throws javax.xml.rpc.ServiceException {
    setEndpointAddress(portName.getLocalPart(), address);
  }

}
