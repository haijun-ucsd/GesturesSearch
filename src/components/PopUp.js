import React, { Component } from "react";
import UploadPage from "./UploadPage";
import LabelsForm from "./LabelsForm";

export default class PopUp extends Component {
  handleClick = () => {
    this.props.toggle();
  };

  render() {
    return (
      <div className="modal_content">
        <div className="PopUpPic_Container">
          <img className="PopUpPic center" src={this.props.url} />
        </div>
        <LabelsForm
          form_change_handler_type1={this.props.form_change_handler_type1}
          form_change_handler_type2={this.props.form_change_handler_type2}
          form_change_handler_type3={this.props.form_change_handler_type3}
          formData={this.props.formData}
        />
        <span className="close" onClick={this.handleClick}>
          &times;
        </span>
      </div>
    );
  }
}
