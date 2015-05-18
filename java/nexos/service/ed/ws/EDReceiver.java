package nexos.service.ed.ws;

import javax.jws.WebMethod;
import javax.jws.WebParam;
import javax.jws.WebResult;
import javax.jws.WebService;

@WebService
public interface EDReceiver {

  /**
   * 상품(ELCA .NET) 수신
   * 
   * @param xmlString
   * @return
   * @throws RemoteException
   */
  @WebMethod(operationName = "ProductDataExport")
  @WebResult(name = "ProductDataExportResult")
  String productDataExport(@WebParam(name = "xmlString") String xmlString);

  /**
   * 주문(ELCA .NET) 수신
   * 
   * @param xmlString
   * @return
   * @throws RemoteException
   */
  @WebMethod(operationName = "OrderExport")
  @WebResult(name = "OrderExportResult")
  String orderExport(@WebParam(name = "xmlString") String xmlString);

  /**
   * 주문상태(ELCA .NET) 수신
   * 
   * @param xmlString
   * @return
   * @throws RemoteException
   */
  @WebMethod(operationName = "OrderStatus")
  @WebResult(name = "OrderStatusResult")
  String orderStatus(@WebParam(name = "xmlString") String xmlString);
}
