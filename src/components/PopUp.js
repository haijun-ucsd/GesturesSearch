import React, { Component } from "react";
//import UploadPage from "./UploadPage";
import LabelsForm from "./LabelsForm";

/**
 * parents props:
 *  - url: URL of the picture that has been clicked on.
 *  - closePop()
 *  - form_change_handler_type1()
 *  - form_change_handler_type2()
 *  - form_change_handler_type3()
 *  - formData
 * 
 * TODO: close PopUp when clicking outside of the modal.
 */
export default function PopUp(props) {
  return (
    <div className="PopUpOverlay">
      <div className="PopUpModal">
        <div className="PopUpPic_Container">
          <img className="PopUpPic center" src={props.url} />
        </div>
        <LabelsForm
          form_change_handler_type1={props.form_change_handler_type1}
          form_change_handler_type2={props.form_change_handler_type2}
          form_change_handler_type3={props.form_change_handler_type3}
          formData={props.formData}
        />
        <span className="PopUpClose" onClick={props.closePop}>
          &times;
        </span>
      </div>
    </div>
  );
}
