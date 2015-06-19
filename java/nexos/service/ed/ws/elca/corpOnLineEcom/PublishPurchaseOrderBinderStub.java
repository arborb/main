/**
 * PublishPurchaseOrderBinderStub.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.corpOnLineEcom;

@SuppressWarnings({"rawtypes", "unused", "unchecked"})
public class PublishPurchaseOrderBinderStub extends org.apache.axis.client.Stub implements
  nexos.service.ed.ws.elca.corpOnLineEcom.CorpOnLineEcom_PortType {
  private java.util.Vector                           cachedSerClasses     = new java.util.Vector();
  private java.util.Vector                           cachedSerQNames      = new java.util.Vector();
  private java.util.Vector                           cachedSerFactories   = new java.util.Vector();
  private java.util.Vector                           cachedDeserFactories = new java.util.Vector();

  static org.apache.axis.description.OperationDesc[] _operations;

  static {
    _operations = new org.apache.axis.description.OperationDesc[1];
    _initOperationDesc1();
  }

  private static void _initOperationDesc1() {
    org.apache.axis.description.OperationDesc oper;
    org.apache.axis.description.ParameterDesc param;
    oper = new org.apache.axis.description.OperationDesc();
    oper.setName("publishPurchaseOrder");
    param = new org.apache.axis.description.ParameterDesc(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "publishPurchaseOrder_1"), org.apache.axis.description.ParameterDesc.IN, new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "publishPurchaseOrder_1"), nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1.class, false, false);
    oper.addParameter(param);
    oper.setReturnType(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "publishPurchaseOrder_1Response"));
    oper.setReturnClass(nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1Response.class);
    oper.setReturnQName(new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "publishPurchaseOrder_1Response"));
    oper.setStyle(org.apache.axis.constants.Style.DOCUMENT);
    oper.setUse(org.apache.axis.constants.Use.LITERAL);
    _operations[0] = oper;

  }

  public PublishPurchaseOrderBinderStub() throws org.apache.axis.AxisFault {
    this(null);
  }

  public PublishPurchaseOrderBinderStub(java.net.URL endpointURL, javax.xml.rpc.Service service)
    throws org.apache.axis.AxisFault {
    this(service);
    super.cachedEndpoint = endpointURL;
  }

  public PublishPurchaseOrderBinderStub(javax.xml.rpc.Service service) throws org.apache.axis.AxisFault {
    if (service == null) {
      super.service = new org.apache.axis.client.Service();
    } else {
      super.service = service;
    }
    ((org.apache.axis.client.Service)super.service).setTypeMappingVersion("1.2");
    java.lang.Class cls;
    javax.xml.namespace.QName qName;
    javax.xml.namespace.QName qName2;
    java.lang.Class beansf = org.apache.axis.encoding.ser.BeanSerializerFactory.class;
    java.lang.Class beandf = org.apache.axis.encoding.ser.BeanDeserializerFactory.class;
    java.lang.Class enumsf = org.apache.axis.encoding.ser.EnumSerializerFactory.class;
    java.lang.Class enumdf = org.apache.axis.encoding.ser.EnumDeserializerFactory.class;
    java.lang.Class arraysf = org.apache.axis.encoding.ser.ArraySerializerFactory.class;
    java.lang.Class arraydf = org.apache.axis.encoding.ser.ArrayDeserializerFactory.class;
    java.lang.Class simplesf = org.apache.axis.encoding.ser.SimpleSerializerFactory.class;
    java.lang.Class simpledf = org.apache.axis.encoding.ser.SimpleDeserializerFactory.class;
    java.lang.Class simplelistsf = org.apache.axis.encoding.ser.SimpleListSerializerFactory.class;
    java.lang.Class simplelistdf = org.apache.axis.encoding.ser.SimpleListDeserializerFactory.class;
    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Action");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.Action.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Action2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.Action2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "AdditionalBatchInformation");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.AdditionalBatchInformation.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "AdditionalBatchInformation2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.AdditionalBatchInformation2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "AdditionalRoutingFilters");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.AdditionalRoutingFilters.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "AdditionalRoutingFilters2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.AdditionalRoutingFilters2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Address");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.Address.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Address2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.Address2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "AuditRequiredFlag");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.AuditRequiredFlag.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "AuditRequiredFlag2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.AuditRequiredFlag2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "BatchControlRecordType");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.BatchControlRecordType.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "BatchControlRecordType2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.BatchControlRecordType2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "ConfirmationIndicator");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.ConfirmationIndicator.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "ConfirmationIndicator2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.ConfirmationIndicator2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ControlAmount");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.ControlAmount.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ControlAmount2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.ControlAmount2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Coverpage");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.Coverpage.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Coverpage2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.Coverpage2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "doc_publishPurchaseOrderRequest");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.Doc_publishPurchaseOrderRequest.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "doc_publishPurchaseOrderResponse");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.Doc_publishPurchaseOrderResponse.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Header");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.Header.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZLargeFileFlag");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.IZLargeFileFlag.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZLargeFileFlag2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.IZLargeFileFlag2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZRecordStatus");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.IZRecordStatus.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZRecordStatus2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.IZRecordStatus2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "IZResultMessageList");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage[].class;
    cachedSerClasses.add(cls);
    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ResultMessage");
    qName2 = new javax.xml.namespace.QName("", "ResultMessage");
    cachedSerFactories.add(new org.apache.axis.encoding.ser.ArraySerializerFactory(qName, qName2));
    cachedDeserFactories.add(new org.apache.axis.encoding.ser.ArrayDeserializerFactory());

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "IZResultMessageList2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage2[].class;
    cachedSerClasses.add(cls);
    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ResultMessage2");
    qName2 = new javax.xml.namespace.QName("", "ResultMessage");
    cachedSerFactories.add(new org.apache.axis.encoding.ser.ArraySerializerFactory(qName, qName2));
    cachedDeserFactories.add(new org.apache.axis.encoding.ser.ArrayDeserializerFactory());

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZResultStatus");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.IZResultStatus.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZResultStatus2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.IZResultStatus2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZTrxStatus");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.IZTrxStatus.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "IZTrxStatus2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.IZTrxStatus2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "Line");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.Line.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "MessageType");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.MessageType.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "MessageType2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.MessageType2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ObjectType");
    cachedSerQNames.add(qName);
    cls = java.lang.String.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(org.apache.axis.encoding.ser.BaseSerializerFactory.createFactory(
      org.apache.axis.encoding.ser.SimpleSerializerFactory.class, cls, qName));
    cachedDeserFactories.add(org.apache.axis.encoding.ser.BaseDeserializerFactory.createFactory(
      org.apache.axis.encoding.ser.SimpleDeserializerFactory.class, cls, qName));

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ObjectType2");
    cachedSerQNames.add(qName);
    cls = java.lang.String.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(org.apache.axis.encoding.ser.BaseSerializerFactory.createFactory(
      org.apache.axis.encoding.ser.SimpleSerializerFactory.class, cls, qName));
    cachedDeserFactories.add(org.apache.axis.encoding.ser.BaseDeserializerFactory.createFactory(
      org.apache.axis.encoding.ser.SimpleDeserializerFactory.class, cls, qName));

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "publishPurchaseOrder_1");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom",
      "publishPurchaseOrder_1Response");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1Response.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ResultMessage");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ResultMessage2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ResultMessage3");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.ResultMessage3.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter1");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter1.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter12");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter12.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter22");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter22.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter3");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter3.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter32");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter32.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter4");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter4.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter42");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter42.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter5");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter5.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "RoutingFilter52");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.RoutingFilter52.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "ShipToParty");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.ShipToParty.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "SoldToParty");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.SoldToParty.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "SplitControl");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.SplitControl.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "SplitControl2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.SplitControl2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "SplitFlag");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.SplitFlag.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "SplitFlag2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.SplitFlag2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(enumsf);
    cachedDeserFactories.add(enumdf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "TradingNetworks");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.TradingNetworks.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

    qName = new javax.xml.namespace.QName(
      "http://wm2d.am.elcompanies.net/elc/purchaseOrder/corpOnLineEcom/kr/publish/corpOnLineEcom", "TradingNetworks2");
    cachedSerQNames.add(qName);
    cls = nexos.service.ed.ws.elca.corpOnLineEcom.TradingNetworks2.class;
    cachedSerClasses.add(cls);
    cachedSerFactories.add(beansf);
    cachedDeserFactories.add(beandf);

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
      // All the type mapping information is registered
      // when the first call is made.
      // The type mapping information is actually registered in
      // the TypeMappingRegistry of the service, which
      // is the reason why registration is only needed for the first call.
      synchronized (this) {
        if (firstCall()) {
          // must set encoding style before registering serializers
          _call.setEncodingStyle(null);
          for (int i = 0; i < cachedSerFactories.size(); ++i) {
            java.lang.Class cls = (java.lang.Class)cachedSerClasses.get(i);
            javax.xml.namespace.QName qName = (javax.xml.namespace.QName)cachedSerQNames.get(i);
            java.lang.Object x = cachedSerFactories.get(i);
            if (x instanceof Class) {
              java.lang.Class sf = (java.lang.Class)cachedSerFactories.get(i);
              java.lang.Class df = (java.lang.Class)cachedDeserFactories.get(i);
              _call.registerTypeMapping(cls, qName, sf, df, false);
            } else if (x instanceof javax.xml.rpc.encoding.SerializerFactory) {
              org.apache.axis.encoding.SerializerFactory sf = (org.apache.axis.encoding.SerializerFactory)cachedSerFactories
                .get(i);
              org.apache.axis.encoding.DeserializerFactory df = (org.apache.axis.encoding.DeserializerFactory)cachedDeserFactories
                .get(i);
              _call.registerTypeMapping(cls, qName, sf, df, false);
            }
          }
        }
      }
      return _call;
    } catch (java.lang.Throwable _t) {
      throw new org.apache.axis.AxisFault("Failure trying to get the Call object", _t);
    }
  }

  public nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1Response publishPurchaseOrder(
    nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1 parameters) throws java.rmi.RemoteException {
    if (super.cachedEndpoint == null) {
      throw new org.apache.axis.NoEndPointException();
    }
    org.apache.axis.client.Call _call = createCall();
    _call.setOperation(_operations[0]);
    _call.setUseSOAPAction(true);
    _call.setSOAPActionURI("elc_purchaseOrder_corpOnLineEcom_kr_publish_corpOnLineEcom_Binder_publishPurchaseOrder");
    _call.setEncodingStyle(null);
    _call.setProperty(org.apache.axis.client.Call.SEND_TYPE_ATTR, Boolean.FALSE);
    _call.setProperty(org.apache.axis.AxisEngine.PROP_DOMULTIREFS, Boolean.FALSE);
    _call.setSOAPVersion(org.apache.axis.soap.SOAPConstants.SOAP11_CONSTANTS);
    _call.setOperationName(new javax.xml.namespace.QName("", "publishPurchaseOrder"));

    setRequestHeaders(_call);
    setAttachments(_call);
    try {
      java.lang.Object _resp = _call.invoke(new java.lang.Object[ ] {parameters});

      if (_resp instanceof java.rmi.RemoteException) {
        throw (java.rmi.RemoteException)_resp;
      } else {
        extractAttachments(_call);
        try {
          return (nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1Response)_resp;
        } catch (java.lang.Exception _exception) {
          return (nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1Response)org.apache.axis.utils.JavaUtils
            .convert(_resp, nexos.service.ed.ws.elca.corpOnLineEcom.PublishPurchaseOrder_1Response.class);
        }
      }
    } catch (org.apache.axis.AxisFault axisFaultException) {
      throw axisFaultException;
    }
  }

}
