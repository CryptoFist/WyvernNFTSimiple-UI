import React from "react";
import "./buy.modal.component.scss";

const BuyModal = (props) => {
   return (
      <div className={props.isOpened === false ? "buy-modal closed" : "buy-modal opened"}>
         <div className="modal-content">
            <div className="modal-header">
               <h4 className="modal-title">Buy Modal</h4>
            </div>
            <div className="modal-body">
               
            </div>
            <div className="modal-footer">
               <button className="btn-submit" onClick={() => props.buyNFT()}>Accept</button>
               <button className="btn-close" onClick={() => props.closeOffer()}>Close Offer</button>
               <button className="btn-cancel" onClick={() => props.setIsOpened(false)}>Cancel</button>
            </div>
         </div>
      </div>
   )
}

export default BuyModal;