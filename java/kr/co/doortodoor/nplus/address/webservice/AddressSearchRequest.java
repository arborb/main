/**
 * AddressSearchRequest.java
 *
 * This file was auto-generated from WSDL
 * by the Apache Axis 1.4 Apr 22, 2006 (06:55:48 PDT) WSDL2Java emitter.
 */

package kr.co.doortodoor.nplus.address.webservice;

public class AddressSearchRequest  implements java.io.Serializable {
    private java.lang.String boxTyp;

    private java.lang.String clntMgmCustCd;

    private java.lang.String clntNum;

    private java.lang.String cntrLarcCd;

    private java.lang.String fareDiv;

    private java.lang.String orderNo;

    private java.lang.String prngDivCd;

    private java.lang.String rcvrAddr;

    private java.lang.String sndprsnAddr;

    public AddressSearchRequest() {
    }

    public AddressSearchRequest(
           java.lang.String boxTyp,
           java.lang.String clntMgmCustCd,
           java.lang.String clntNum,
           java.lang.String cntrLarcCd,
           java.lang.String fareDiv,
           java.lang.String orderNo,
           java.lang.String prngDivCd,
           java.lang.String rcvrAddr,
           java.lang.String sndprsnAddr) {
           this.boxTyp = boxTyp;
           this.clntMgmCustCd = clntMgmCustCd;
           this.clntNum = clntNum;
           this.cntrLarcCd = cntrLarcCd;
           this.fareDiv = fareDiv;
           this.orderNo = orderNo;
           this.prngDivCd = prngDivCd;
           this.rcvrAddr = rcvrAddr;
           this.sndprsnAddr = sndprsnAddr;
    }


    /**
     * Gets the boxTyp value for this AddressSearchRequest.
     * 
     * @return boxTyp
     */
    public java.lang.String getBoxTyp() {
        return boxTyp;
    }


    /**
     * Sets the boxTyp value for this AddressSearchRequest.
     * 
     * @param boxTyp
     */
    public void setBoxTyp(java.lang.String boxTyp) {
        this.boxTyp = boxTyp;
    }


    /**
     * Gets the clntMgmCustCd value for this AddressSearchRequest.
     * 
     * @return clntMgmCustCd
     */
    public java.lang.String getClntMgmCustCd() {
        return clntMgmCustCd;
    }


    /**
     * Sets the clntMgmCustCd value for this AddressSearchRequest.
     * 
     * @param clntMgmCustCd
     */
    public void setClntMgmCustCd(java.lang.String clntMgmCustCd) {
        this.clntMgmCustCd = clntMgmCustCd;
    }


    /**
     * Gets the clntNum value for this AddressSearchRequest.
     * 
     * @return clntNum
     */
    public java.lang.String getClntNum() {
        return clntNum;
    }


    /**
     * Sets the clntNum value for this AddressSearchRequest.
     * 
     * @param clntNum
     */
    public void setClntNum(java.lang.String clntNum) {
        this.clntNum = clntNum;
    }


    /**
     * Gets the cntrLarcCd value for this AddressSearchRequest.
     * 
     * @return cntrLarcCd
     */
    public java.lang.String getCntrLarcCd() {
        return cntrLarcCd;
    }


    /**
     * Sets the cntrLarcCd value for this AddressSearchRequest.
     * 
     * @param cntrLarcCd
     */
    public void setCntrLarcCd(java.lang.String cntrLarcCd) {
        this.cntrLarcCd = cntrLarcCd;
    }


    /**
     * Gets the fareDiv value for this AddressSearchRequest.
     * 
     * @return fareDiv
     */
    public java.lang.String getFareDiv() {
        return fareDiv;
    }


    /**
     * Sets the fareDiv value for this AddressSearchRequest.
     * 
     * @param fareDiv
     */
    public void setFareDiv(java.lang.String fareDiv) {
        this.fareDiv = fareDiv;
    }


    /**
     * Gets the orderNo value for this AddressSearchRequest.
     * 
     * @return orderNo
     */
    public java.lang.String getOrderNo() {
        return orderNo;
    }


    /**
     * Sets the orderNo value for this AddressSearchRequest.
     * 
     * @param orderNo
     */
    public void setOrderNo(java.lang.String orderNo) {
        this.orderNo = orderNo;
    }


    /**
     * Gets the prngDivCd value for this AddressSearchRequest.
     * 
     * @return prngDivCd
     */
    public java.lang.String getPrngDivCd() {
        return prngDivCd;
    }


    /**
     * Sets the prngDivCd value for this AddressSearchRequest.
     * 
     * @param prngDivCd
     */
    public void setPrngDivCd(java.lang.String prngDivCd) {
        this.prngDivCd = prngDivCd;
    }


    /**
     * Gets the rcvrAddr value for this AddressSearchRequest.
     * 
     * @return rcvrAddr
     */
    public java.lang.String getRcvrAddr() {
        return rcvrAddr;
    }


    /**
     * Sets the rcvrAddr value for this AddressSearchRequest.
     * 
     * @param rcvrAddr
     */
    public void setRcvrAddr(java.lang.String rcvrAddr) {
        this.rcvrAddr = rcvrAddr;
    }


    /**
     * Gets the sndprsnAddr value for this AddressSearchRequest.
     * 
     * @return sndprsnAddr
     */
    public java.lang.String getSndprsnAddr() {
        return sndprsnAddr;
    }


    /**
     * Sets the sndprsnAddr value for this AddressSearchRequest.
     * 
     * @param sndprsnAddr
     */
    public void setSndprsnAddr(java.lang.String sndprsnAddr) {
        this.sndprsnAddr = sndprsnAddr;
    }

    private java.lang.Object __equalsCalc = null;
    public synchronized boolean equals(java.lang.Object obj) {
        if (!(obj instanceof AddressSearchRequest)) return false;
        AddressSearchRequest other = (AddressSearchRequest) obj;
        if (obj == null) return false;
        if (this == obj) return true;
        if (__equalsCalc != null) {
            return (__equalsCalc == obj);
        }
        __equalsCalc = obj;
        boolean _equals;
        _equals = true && 
            ((this.boxTyp==null && other.getBoxTyp()==null) || 
             (this.boxTyp!=null &&
              this.boxTyp.equals(other.getBoxTyp()))) &&
            ((this.clntMgmCustCd==null && other.getClntMgmCustCd()==null) || 
             (this.clntMgmCustCd!=null &&
              this.clntMgmCustCd.equals(other.getClntMgmCustCd()))) &&
            ((this.clntNum==null && other.getClntNum()==null) || 
             (this.clntNum!=null &&
              this.clntNum.equals(other.getClntNum()))) &&
            ((this.cntrLarcCd==null && other.getCntrLarcCd()==null) || 
             (this.cntrLarcCd!=null &&
              this.cntrLarcCd.equals(other.getCntrLarcCd()))) &&
            ((this.fareDiv==null && other.getFareDiv()==null) || 
             (this.fareDiv!=null &&
              this.fareDiv.equals(other.getFareDiv()))) &&
            ((this.orderNo==null && other.getOrderNo()==null) || 
             (this.orderNo!=null &&
              this.orderNo.equals(other.getOrderNo()))) &&
            ((this.prngDivCd==null && other.getPrngDivCd()==null) || 
             (this.prngDivCd!=null &&
              this.prngDivCd.equals(other.getPrngDivCd()))) &&
            ((this.rcvrAddr==null && other.getRcvrAddr()==null) || 
             (this.rcvrAddr!=null &&
              this.rcvrAddr.equals(other.getRcvrAddr()))) &&
            ((this.sndprsnAddr==null && other.getSndprsnAddr()==null) || 
             (this.sndprsnAddr!=null &&
              this.sndprsnAddr.equals(other.getSndprsnAddr())));
        __equalsCalc = null;
        return _equals;
    }

    private boolean __hashCodeCalc = false;
    public synchronized int hashCode() {
        if (__hashCodeCalc) {
            return 0;
        }
        __hashCodeCalc = true;
        int _hashCode = 1;
        if (getBoxTyp() != null) {
            _hashCode += getBoxTyp().hashCode();
        }
        if (getClntMgmCustCd() != null) {
            _hashCode += getClntMgmCustCd().hashCode();
        }
        if (getClntNum() != null) {
            _hashCode += getClntNum().hashCode();
        }
        if (getCntrLarcCd() != null) {
            _hashCode += getCntrLarcCd().hashCode();
        }
        if (getFareDiv() != null) {
            _hashCode += getFareDiv().hashCode();
        }
        if (getOrderNo() != null) {
            _hashCode += getOrderNo().hashCode();
        }
        if (getPrngDivCd() != null) {
            _hashCode += getPrngDivCd().hashCode();
        }
        if (getRcvrAddr() != null) {
            _hashCode += getRcvrAddr().hashCode();
        }
        if (getSndprsnAddr() != null) {
            _hashCode += getSndprsnAddr().hashCode();
        }
        __hashCodeCalc = false;
        return _hashCode;
    }

    // Type metadata
    private static org.apache.axis.description.TypeDesc typeDesc =
        new org.apache.axis.description.TypeDesc(AddressSearchRequest.class, true);

    static {
        typeDesc.setXmlType(new javax.xml.namespace.QName("http://webservice.address.nplus.doortodoor.co.kr/", "addressSearchRequest"));
        org.apache.axis.description.ElementDesc elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("boxTyp");
        elemField.setXmlName(new javax.xml.namespace.QName("", "boxTyp"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("clntMgmCustCd");
        elemField.setXmlName(new javax.xml.namespace.QName("", "clntMgmCustCd"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("clntNum");
        elemField.setXmlName(new javax.xml.namespace.QName("", "clntNum"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("cntrLarcCd");
        elemField.setXmlName(new javax.xml.namespace.QName("", "cntrLarcCd"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("fareDiv");
        elemField.setXmlName(new javax.xml.namespace.QName("", "fareDiv"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("orderNo");
        elemField.setXmlName(new javax.xml.namespace.QName("", "orderNo"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("prngDivCd");
        elemField.setXmlName(new javax.xml.namespace.QName("", "prngDivCd"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("rcvrAddr");
        elemField.setXmlName(new javax.xml.namespace.QName("", "rcvrAddr"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
        elemField = new org.apache.axis.description.ElementDesc();
        elemField.setFieldName("sndprsnAddr");
        elemField.setXmlName(new javax.xml.namespace.QName("", "sndprsnAddr"));
        elemField.setXmlType(new javax.xml.namespace.QName("http://www.w3.org/2001/XMLSchema", "string"));
        elemField.setMinOccurs(0);
        elemField.setNillable(false);
        typeDesc.addFieldDesc(elemField);
    }

    /**
     * Return type metadata object
     */
    public static org.apache.axis.description.TypeDesc getTypeDesc() {
        return typeDesc;
    }

    /**
     * Get Custom Serializer
     */
    public static org.apache.axis.encoding.Serializer getSerializer(
           java.lang.String mechType, 
           java.lang.Class _javaType,  
           javax.xml.namespace.QName _xmlType) {
        return 
          new  org.apache.axis.encoding.ser.BeanSerializer(
            _javaType, _xmlType, typeDesc);
    }

    /**
     * Get Custom Deserializer
     */
    public static org.apache.axis.encoding.Deserializer getDeserializer(
           java.lang.String mechType, 
           java.lang.Class _javaType,  
           javax.xml.namespace.QName _xmlType) {
        return 
          new  org.apache.axis.encoding.ser.BeanDeserializer(
            _javaType, _xmlType, typeDesc);
    }

}
