/**
 * BasicHttpBinding_IKRServiceStub.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.krService;

@SuppressWarnings({"rawtypes", "unused"})
public class KrServiceBinderStub extends org.apache.axis.client.Stub implements
  nexos.service.ed.ws.elca.krService.IKrService {
  private java.util.Vector                           cachedSerClasses     = new java.util.Vector();
  private java.util.Vector                           cachedSerQNames      = new java.util.Vector();
  private java.util.Vector                           cachedSerFactories   = new java.util.Vector();
  private java.util.Vector                           cachedDeserFactories = new java.util.Vector();

  static org.apache.axis.description.OperationDesc[] _operations;

  static {
    _operations = new org.apache.axis.description.OperationDesc[3];
    _initOperationDesc1();
  }

  private static void _initOperationDesc1() {
    org.apache.axis.description.OperationDesc oper;
    org.apache.axis.description.ParameterDesc param;
    oper = new org.apache.axis.description.OperationDesc();
    oper.setName("UpdateOrderStatus");
    param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://tempuri.org/",
      "OrderStatusXML"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName(
      "http://www.w3.org/2001/XMLSchema", "string"), java.lang.String.class, false, false);
    param.setOmittable(true);
    param.setNillable(true);
    oper.addParameter(param);
    oper.setReturnType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    oper.setReturnClass(java.lang.String.class);
    oper.setReturnQName(new javax.xml.namespace.QName("http://tempuri.org/", "UpdateOrderStatusResult"));
    oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
    oper.setUse(org.apache.axis.constants.Use.LITERAL);
    _operations[0] = oper;

    oper = new org.apache.axis.description.OperationDesc();
    oper.setName("UpdateInventoryStatus");
    param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://tempuri.org/",
      "InventoryStatusXML"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName(
      "http://www.w3.org/2001/XMLSchema", "string"), java.lang.String.class, false, false);
    param.setOmittable(true);
    param.setNillable(true);
    oper.addParameter(param);
    oper.setReturnType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    oper.setReturnClass(java.lang.String.class);
    oper.setReturnQName(new javax.xml.namespace.QName("http://tempuri.org/", "UpdateInventoryStatusResult"));
    oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
    oper.setUse(org.apache.axis.constants.Use.LITERAL);
    _operations[1] = oper;

    oper = new org.apache.axis.description.OperationDesc();
    oper.setName("UpdateInventoryDelta");
    param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName("http://tempuri.org/",
      "InventoryStatusXML"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName(
      "http://www.w3.org/2001/XMLSchema", "string"), java.lang.String.class, false, false);
    param.setOmittable(true);
    param.setNillable(true);
    oper.addParameter(param);
    oper.setReturnType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
    oper.setReturnClass(java.lang.String.class);
    oper.setReturnQName(new javax.xml.namespace.QName("http://tempuri.org/", "UpdateInventoryDeltaResult"));
    oper.setStyle(org.apache.axis.constants.Style.WRAPPED);
    oper.setUse(org.apache.axis.constants.Use.LITERAL);
    _operations[2] = oper;

  }

  public KrServiceBinderStub() throws org.apache.axis.AxisFault {
    this(null);
  }

  public KrServiceBinderStub(java.net.URL endpointURL, javax.xml.rpc.Service service) throws org.apache.axis.AxisFault {
    this(service);
    super.cachedEndpoint = endpointURL;
  }

  public KrServiceBinderStub(javax.xml.rpc.Service service) throws org.apache.axis.AxisFault {
    if (service == null) {
      super.service = new org.apache.axis.client.Service();
    } else {
      super.service = service;
    }
    ((org.apache.axis.client.Service)super.service).setTypeMappingVersion("1.2");
  }

  protected org.apache.axis.client.Call createCall() throws java.rmi.RemoteException {
    try {
      org.apache.axis.client.Call _call = super._createCall();
      if (super.maintainSessionSet) {
        _call.setMaintainSession(super.maintainSession);
      }
      if (super.cachedUsername != null) {
        _call.setUsername(super.cachedUsername);
      }
      if (super.cachedPassword != null) {
        _call.setPassword(super.cachedPassword);
      }
      if (super.cachedEndpoint != null) {
        _call.setTargetEndpointAddress(super.cachedEndpoint);
      }
      if (super.cachedTimeout != null) {
        _call.setTimeout(super.cachedTimeout);
      }
      if (super.cachedPortName != null) {
        _call.setPortName(super.cachedPortName);
      }
      java.util.Enumeration keys = super.cachedProperties.keys();
      while (keys.hasMoreElements()) {
        java.lang.String key = (java.lang.String)keys.nextElement();
        _call.setProperty(key, super.cachedProperties.get(key));
      }
      return _call;
    } catch (java.lang.Throwable _t) {
      throw new org.apache.axis.AxisFault("Failure trying to get the Call object", _t);
    }
  }

  public java.lang.String updateOrderStatus(java.lang.String orderStatusXML) throws java.rmi.RemoteException {
    if (super.cachedEndpoint == null) {
      throw new org.apache.axis.NoEndPointException();
    }
    org.apache.axis.client.Call _call = createCall();
    _call.setOperation(_operations[0]);
    _call.setUseSOAPAction(true);
    _call.setSOAPActionURI("http://tempuri.org/IKRService/UpdateOrderStatus");
    _call.setEncodingStyle(null);
    _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
    _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
    _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
    _call.setOperationName(new javax.xml.namespace.QName("http://tempuri.org/", "UpdateOrderStatus"));

    setRequestHeaders(_call);
    setAttachments(_call);
    try {
      java.lang.Object _resp = _call.invoke(new java.lang.Object[ ] {orderStatusXML});

      if (_resp instanceof java.rmi.RemoteException) {
        throw (java.rmi.RemoteException)_resp;
      } else {
        extractAttachments(_call);
        try {
          return (java.lang.String)_resp;
        } catch (java.lang.Exception _exception) {
          return (java.lang.String)org.apache.axis.utils.JavaUtils.convert(_resp, java.lang.String.class);
        }
      }
    } catch (org.apache.axis.AxisFault axisFaultException) {
      throw axisFaultException;
    }
  }

  public java.lang.String updateInventoryStatus(java.lang.String inventoryStatusXML) throws java.rmi.RemoteException {
    if (super.cachedEndpoint == null) {
      throw new org.apache.axis.NoEndPointException();
    }
    org.apache.axis.client.Call _call = createCall();
    _call.setOperation(_operations[1]);
    _call.setUseSOAPAction(true);
    _call.setSOAPActionURI("http://tempuri.org/IKRService/UpdateInventoryStatus");
    _call.setEncodingStyle(null);
    _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
    _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
    _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
    _call.setOperationName(new javax.xml.namespace.QName("http://tempuri.org/", "UpdateInventoryStatus"));

    setRequestHeaders(_call);
    setAttachments(_call);
    try {
      java.lang.Object _resp = _call.invoke(new java.lang.Object[ ] {inventoryStatusXML});

      if (_resp instanceof java.rmi.RemoteException) {
        throw (java.rmi.RemoteException)_resp;
      } else {
        extractAttachments(_call);
        try {
          return (java.lang.String)_resp;
        } catch (java.lang.Exception _exception) {
          return (java.lang.String)org.apache.axis.utils.JavaUtils.convert(_resp, java.lang.String.class);
        }
      }
    } catch (org.apache.axis.AxisFault axisFaultException) {
      throw axisFaultException;
    }
  }

  public java.lang.String updateInventoryDelta(java.lang.String inventoryStatusXML) throws java.rmi.RemoteException {
    if (super.cachedEndpoint == null) {
      throw new org.apache.axis.NoEndPointException();
    }
    org.apache.axis.client.Call _call = createCall();
    _call.setOperation(_operations[2]);
    _call.setUseSOAPAction(true);
    _call.setSOAPActionURI("http://tempuri.org/IKRService/UpdateInventoryDelta");
    _call.setEncodingStyle(null);
    _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
    _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
    _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
    _call.setOperationName(new javax.xml.namespace.QName("http://tempuri.org/", "UpdateInventoryDelta"));

    setRequestHeaders(_call);
    setAttachments(_call);
    try {
      java.lang.Object _resp = _call.invoke(new java.lang.Object[ ] {inventoryStatusXML});

      if (_resp instanceof java.rmi.RemoteException) {
        throw (java.rmi.RemoteException)_resp;
      } else {
        extractAttachments(_call);
        try {
          return (java.lang.String)_resp;
        } catch (java.lang.Exception _exception) {
          return (java.lang.String)org.apache.axis.utils.JavaUtils.convert(_resp, java.lang.String.class);
        }
      }
    } catch (org.apache.axis.AxisFault axisFaultException) {
      throw axisFaultException;
    }
  }

}
