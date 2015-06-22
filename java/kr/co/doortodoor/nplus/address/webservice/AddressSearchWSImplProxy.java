package kr.co.doortodoor.nplus.address.webservice;

public class AddressSearchWSImplProxy implements kr.co.doortodoor.nplus.address.webservice.AddressSearchWSImpl {
  private String _endpoint = null;
  private kr.co.doortodoor.nplus.address.webservice.AddressSearchWSImpl addressSearchWSImpl = null;
  
  public AddressSearchWSImplProxy() {
    _initAddressSearchWSImplProxy();
  }
  
  public AddressSearchWSImplProxy(String endpoint) {
    _endpoint = endpoint;
    _initAddressSearchWSImplProxy();
  }
  
  private void _initAddressSearchWSImplProxy() {
    try {
      addressSearchWSImpl = (new kr.co.doortodoor.nplus.address.webservice.AddressSearchWSImplServiceLocator()).getAddressSearchWSImplPort();
      if (addressSearchWSImpl != null) {
        if (_endpoint != null)
          ((javax.xml.rpc.Stub)addressSearchWSImpl)._setProperty("javax.xml.rpc.service.endpoint.address", _endpoint);
        else
          _endpoint = (String)((javax.xml.rpc.Stub)addressSearchWSImpl)._getProperty("javax.xml.rpc.service.endpoint.address");
      }
      
    }
    catch (javax.xml.rpc.ServiceException serviceException) {}
  }
  
  public String getEndpoint() {
    return _endpoint;
  }
  
  public void setEndpoint(String endpoint) {
    _endpoint = endpoint;
    if (addressSearchWSImpl != null)
      ((javax.xml.rpc.Stub)addressSearchWSImpl)._setProperty("javax.xml.rpc.service.endpoint.address", _endpoint);
    
  }
  
  public kr.co.doortodoor.nplus.address.webservice.AddressSearchWSImpl getAddressSearchWSImpl() {
    if (addressSearchWSImpl == null)
      _initAddressSearchWSImplProxy();
    return addressSearchWSImpl;
  }
  
  public kr.co.doortodoor.nplus.address.webservice.AddressSearchResponse[] getAddressInformationByValue(kr.co.doortodoor.nplus.address.webservice.AddressSearchRequest[] arg0) throws java.rmi.RemoteException{
    if (addressSearchWSImpl == null)
      _initAddressSearchWSImplProxy();
    return addressSearchWSImpl.getAddressInformationByValue(arg0);
  }
  
  public kr.co.doortodoor.nplus.address.webservice.AddressSearchResponse getAddressInformationByValue2(kr.co.doortodoor.nplus.address.webservice.AddressSearchRequest arg0) throws java.rmi.RemoteException{
    if (addressSearchWSImpl == null)
      _initAddressSearchWSImplProxy();
    return addressSearchWSImpl.getAddressInformationByValue2(arg0);
  }
  
  public java.lang.String getAddressInformation(kr.co.doortodoor.nplus.address.webservice.AddressSearchRequest[] arg0) throws java.rmi.RemoteException{
    if (addressSearchWSImpl == null)
      _initAddressSearchWSImplProxy();
    return addressSearchWSImpl.getAddressInformation(arg0);
  }
  
  
}