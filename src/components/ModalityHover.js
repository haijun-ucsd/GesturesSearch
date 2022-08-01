import React from "react";
import "./DescriptionHover.css";

class ModalityHover extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hovered: false,
    };
  }
  onMouseEnter = (e) => {
    this.setState({ hovered: true });
  };
  onMouseLeave = (e) => {
    this.setState({ hovered: false });
  };

  render() {
    const { hovered } = this.state;
    const style = hovered ? { color: "#fff" } : {};
    return (
      <div>
        <div onMouseEnter={this.onMouseEnter} onMouseLeave={this.onMouseLeave}>
          {this.props.SVGbodypart}
        </div>
        <hr />
        <div style={style}>{this.props.text}</div>
        <hr />
      </div>
    );
  }
}

export default ModalityHover;
