/**
 * IKRService.java
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package nexos.service.ed.ws.elca.krService;

public interface IKrService extends java.rmi.Remote {
  public java.lang.String updateOrderStatus(java.lang.String orderStatusXML) throws java.rmi.RemoteException;

  public java.lang.String updateInventoryStatus(java.lang.String inventoryStatusXML) throws java.rmi.RemoteException;

  public java.lang.String updateInventoryDelta(java.lang.String inventoryStatusXML) throws java.rmi.RemoteException;
}
