/**
 * AddressSearchWSImplServiceLocator.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package kr.co.doortodoor.nplus.address.webservice;

public class AddressSearchWSImplServiceLocator extends org.apache.axis.client.Service implements kr.co.doortodoor.nplus.address.webservice.AddressSearchWSImplService {

    public AddressSearchWSImplServiceLocator() {
    }


    public AddressSearchWSImplServiceLocator(org.apache.axis.EngineConfiguration config) {
        super(config);
    }

    public AddressSearchWSImplServiceLocator(java.lang.String wsdlLoc, javax.xml.namespace.QName sName) throws javax.xml.rpc.ServiceException {
        super(wsdlLoc, sName);
    }

    // Use to get a proxy class for AddressSearchWSImplPort
    private java.lang.String AddressSearchWSImplPort_address = "http://203.248.116.111:80/address/address_webservice.korex";

    public java.lang.String getAddressSearchWSImplPortAddress() {
        return AddressSearchWSImplPort_address;
    }

    // The WSDD service name defaults to the port name.
    private java.lang.String AddressSearchWSImplPortWSDDServiceName = "AddressSearchWSImplPort";

    public java.lang.String getAddressSearchWSImplPortWSDDServiceName() {
        return AddressSearchWSImplPortWSDDServiceName;
    }

    public void setAddressSearchWSImplPortWSDDServiceName(java.lang.String name) {
        AddressSearchWSImplPortWSDDServiceName = name;
    }

    public kr.co.doortodoor.nplus.address.webservice.AddressSearchWSImpl getAddressSearchWSImplPort() throws javax.xml.rpc.ServiceException {
       java.net.URL endpoint;
        try {
            endpoint = new java.net.URL(AddressSearchWSImplPort_address);
        }
        catch (java.net.MalformedURLException e) {
            throw new javax.xml.rpc.ServiceException(e);
        }
        return getAddressSearchWSImplPort(endpoint);
    }

    public kr.co.doortodoor.nplus.address.webservice.AddressSearchWSImpl getAddressSearchWSImplPort(java.net.URL portAddress) throws javax.xml.rpc.ServiceException {
        try {
            kr.co.doortodoor.nplus.address.webservice.AddressSearchWSImplPortBindingStub _stub = new kr.co.doortodoor.nplus.address.webservice.AddressSearchWSImplPortBindingStub(portAddress, this);
            _stub.setPortName(getAddressSearchWSImplPortWSDDServiceName());
            return _stub;
        }
        catch (org.apache.axis.AxisFault e) {
            return null;
        }
    }

    public void setAddressSearchWSImplPortEndpointAddress(java.lang.String address) {
        AddressSearchWSImplPort_address = address;
    }

    /**
     * For the given interface, get the stub implementation.
     * If this service has no port for the given interface,
     * then ServiceException is thrown.
     */
    public java.rmi.Remote getPort(Class serviceEndpointInterface) throws javax.xml.rpc.ServiceException {
        try {
            if (kr.co.doortodoor.nplus.address.webservice.AddressSearchWSImpl.class.isAssignableFrom(serviceEndpointInterface)) {
                kr.co.doortodoor.nplus.address.webservice.AddressSearchWSImplPortBindingStub _stub = new kr.co.doortodoor.nplus.address.webservice.AddressSearchWSImplPortBindingStub(new java.net.URL(AddressSearchWSImplPort_address), this);
                _stub.setPortName(getAddressSearchWSImplPortWSDDServiceName());
                return _stub;
            }
        }
        catch (java.lang.Throwable t) {
            throw new javax.xml.rpc.ServiceException(t);
        }
        throw new javax.xml.rpc.ServiceException("There is no stub implementation for the interface:  " + (serviceEndpointInterface == null ? "null" : serviceEndpointInterface.getName()));
    }

    /**
     * For the given interface, get the stub implementation.
     * If this service has no port for the given interface,
     * then ServiceException is thrown.
     */
    public java.rmi.Remote getPort(javax.xml.namespace.QName portName, Class serviceEndpointInterface) throws javax.xml.rpc.ServiceException {
        if (portName == null) {
            return getPort(serviceEndpointInterface);
        }
        java.lang.String inputPortName = portName.getLocalPart();
        if ("AddressSearchWSImplPort".equals(inputPortName)) {
            return getAddressSearchWSImplPort();
        }
        else  {
            java.rmi.Remote _stub = getPort(serviceEndpointInterface);
            ((org.apache.axis.client.Stub) _stub).setPortName(portName);
            return _stub;
        }
    }

    public javax.xml.namespace.QName getServiceName() {
        return new javax.xml.namespace.QName("http://webservice.address.nplus.doortodoor.co.kr/", "AddressSearchWSImplService");
    }

    private java.util.HashSet ports = null;

    public java.util.Iterator getPorts() {
        if (ports == null) {
            ports = new java.util.HashSet();
            ports.add(new javax.xml.namespace.QName("http://webservice.address.nplus.doortodoor.co.kr/", "AddressSearchWSImplPort"));
        }
        return ports.iterator();
    }

    /**
    * Set the endpoint address for the specified port name.
    */
    public void setEndpointAddress(java.lang.String portName, java.lang.String address) throws javax.xml.rpc.ServiceException {
        
if ("AddressSearchWSImplPort".equals(portName)) {
            setAddressSearchWSImplPortEndpointAddress(address);
        }
        else 
{ // Unknown Port Name
            throw new javax.xml.rpc.ServiceException(" Cannot set Endpoint Address for Unknown Port" + portName);
        }
    }

    /**
    * Set the endpoint address for the specified port name.
    */
    public void setEndpointAddress(javax.xml.namespace.QName portName, java.lang.String address) throws javax.xml.rpc.ServiceException {
        setEndpointAddress(portName.getLocalPart(), address);
    }

}
