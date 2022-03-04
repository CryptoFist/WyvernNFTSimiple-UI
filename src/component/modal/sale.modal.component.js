import React from "react";
import "./sale.modal.component.scss";

const SaleModal = (props) => {
   const onPriceChange = (e) => {
      props.setNFTPrice(e.target.value);
   }
   return (
      <div className={props.isOpened === false ? "sale-modal closed" : "sale-modal opened"}>
         <div className="modal-content">
            <div className="modal-header">
               <h4 className="modal-title">Sale Modal</h4>
            </div>
            <div className="modal-body">
               <span className="txt-price">Price: </span>
               <input className="sale-price" value={props.nftPrice} onChange={(e) => onPriceChange(e)} />
            </div>
            <div className="modal-footer">
               <button className="btn-submit" onClick={() => props.saleNFT()}>Submit</button>
               <button className="btn-close" onClick={() => props.setIsOpened(false)}>Close</button>
            </div>
         </div>
      </div>
   )
}

export default SaleModal;