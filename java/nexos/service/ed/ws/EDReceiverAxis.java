package nexos.service.ed.ws;

public interface EDReceiverAxis {

  /**
   * 상품(ELCA .NET) 수신
   * 
   * @param xmlString
   * @return
   * @throws RemoteException
   */
  String productDataExport(String xmlString);

  /**
   * 주문(ELCA .NET) 수신
   * 
   * @param xmlString
   * @return
   * @throws RemoteException
   */
  String orderExport(String xmlString);

  /**
   * 주문상태(ELCA .NET) 수신
   * 
   * @param xmlString
   * @return
   * @throws RemoteException
   */
  String orderStatus(String xmlString);
}
