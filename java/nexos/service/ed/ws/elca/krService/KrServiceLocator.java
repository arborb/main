/**
 * KrserviceLocator.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.krService;

@SuppressWarnings({"serial", "rawtypes", "unchecked"})
public class KrServiceLocator extends org.apache.axis.client.Service implements
  nexos.service.ed.ws.elca.krService.KrService {

  public KrServiceLocator() {
  }

  public KrServiceLocator(org.apache.axis.EngineConfiguration config) {
    super(config);
  }

  public KrServiceLocator(java.lang.String wsdlLoc, javax.xml.namespace.QName sName)
    throws javax.xml.rpc.ServiceException {
    super(wsdlLoc, sName);
  }

  // Use to get a proxy class for BasicHttpBinding_IKRService
  private java.lang.String krServiceAddress = "http://10.32.231.37:8080/krservice/krservice.svc";

  public java.lang.String getKrServiceAddress() {
    return krServiceAddress;
  }

  // The WSDD service name defaults to the port name.
  private java.lang.String krServiceWSDDServiceName = "BasicHttpBinding_IKRService";

  public java.lang.String getKrServiceWSDDServiceName() {
    return krServiceWSDDServiceName;
  }

  public void setKrServiceWSDDServiceName(java.lang.String name) {
    krServiceWSDDServiceName = name;
  }

  public nexos.service.ed.ws.elca.krService.IKrService getKrService() throws javax.xml.rpc.ServiceException {
    java.net.URL endpoint;
    try {
      endpoint = new java.net.URL(krServiceAddress);
    } catch (java.net.MalformedURLException e) {
      throw new javax.xml.rpc.ServiceException(e);
    }
    return getKrService(endpoint);
  }

  public nexos.service.ed.ws.elca.krService.IKrService getKrService(java.net.URL portAddress)
    throws javax.xml.rpc.ServiceException {
    try {
      nexos.service.ed.ws.elca.krService.KrServiceBinderStub _stub = new nexos.service.ed.ws.elca.krService.KrServiceBinderStub(
        portAddress, this);
      _stub.setPortName(getKrServiceWSDDServiceName());
      return _stub;
    } catch (org.apache.axis.AxisFault e) {
      return null;
    }
  }

  public void setKrServiceEndpointAddress(java.lang.String address) {
    krServiceAddress = address;
  }

  /**
   * For the given interface, get the stub implementation.
   * If this service has no port for the given interface,
   * then ServiceException is thrown.
   */
  public java.rmi.Remote getPort(Class serviceEndpointInterface) throws javax.xml.rpc.ServiceException {
    try {
      if (nexos.service.ed.ws.elca.krService.IKrService.class.isAssignableFrom(serviceEndpointInterface)) {
        nexos.service.ed.ws.elca.krService.KrServiceBinderStub _stub = new nexos.service.ed.ws.elca.krService.KrServiceBinderStub(
          new java.net.URL(krServiceAddress), this);
        _stub.setPortName(getKrServiceWSDDServiceName());
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
    if ("BasicHttpBinding_IKRService".equals(inputPortName)) {
      return getKrService();
    } else {
      java.rmi.Remote _stub = getPort(serviceEndpointInterface);
      ((org.apache.axis.client.Stub)_stub).setPortName(portName);
      return _stub;
    }
  }

  public javax.xml.namespace.QName getServiceName() {
    return new javax.xml.namespace.QName("http://tempuri.org/", "krservice");
  }

  private java.util.HashSet ports = null;

  public java.util.Iterator getPorts() {
    if (ports == null) {
      ports = new java.util.HashSet();
      ports.add(new javax.xml.namespace.QName("http://tempuri.org/", "BasicHttpBinding_IKRService"));
    }
    return ports.iterator();
  }

  /**
   * Set the endpoint address for the specified port name.
   */
  public void setEndpointAddress(java.lang.String portName, java.lang.String address)
    throws javax.xml.rpc.ServiceException {

    if ("BasicHttpBinding_IKRService".equals(portName)) {
      setKrServiceEndpointAddress(address);
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
