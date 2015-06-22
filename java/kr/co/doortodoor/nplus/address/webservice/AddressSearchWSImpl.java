/**
 * AddressSearchWSImpl.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package kr.co.doortodoor.nplus.address.webservice;

public interface AddressSearchWSImpl extends java.rmi.Remote {
    public kr.co.doortodoor.nplus.address.webservice.AddressSearchResponse[] getAddressInformationByValue(kr.co.doortodoor.nplus.address.webservice.AddressSearchRequest[] arg0) throws java.rmi.RemoteException;
    public kr.co.doortodoor.nplus.address.webservice.AddressSearchResponse getAddressInformationByValue2(kr.co.doortodoor.nplus.address.webservice.AddressSearchRequest arg0) throws java.rmi.RemoteException;
    public java.lang.String getAddressInformation(kr.co.doortodoor.nplus.address.webservice.AddressSearchRequest[] arg0) throws java.rmi.RemoteException;
}
