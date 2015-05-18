/**
 * Krservice.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.krService;

public interface KrService extends javax.xml.rpc.Service {
  public java.lang.String getKrServiceAddress();

  public nexos.service.ed.ws.elca.krService.IKrService getKrService()
    throws javax.xml.rpc.ServiceException;

  public nexos.service.ed.ws.elca.krService.IKrService getKrService(java.net.URL portAddress)
    throws javax.xml.rpc.ServiceException;
}
