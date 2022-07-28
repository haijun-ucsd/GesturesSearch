import React from "react";
import "./DescriptionHover.css";

class DescriptionHover extends React.Component {
  constructor() {
    super();
    this.state = { text: "" };
  }
  //set the text
  onMouseover(e) {
    this.setState({ text: this.props.text });
  }
  //clear the text
  onMouseout(e) {
    this.setState({ text: "" });
  }
  render() {
    const { text } = this.state;
    return (
      <div
        onMouseEnter={this.onMouseover.bind(this)}
        onMouseLeave={this.onMouseout.bind(this)}
      >
        <button className="button-17">?</button>
        <div className="DescriptionText">{text}</div>
      </div>
    );
  }
}

export default DescriptionHover;
