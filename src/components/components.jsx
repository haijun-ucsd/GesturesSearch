import React from 'react';
import ReactDOM from 'react-dom/client';
import './components.css';
import { labels_data } from "./labels_data.js";
import { useState , useEffect } from 'react';

/* Assets: */
import FilterRemoveBtn from "../assets/FilterRemoveBtn.png";
import SearchBtn from "../assets/SearchBtn.png";



/**
 * Label
 *
 * states:
 *  - value: string
 *  - id: int
 *  - category (→ color): string
 *
 * functions:
 *  - click_handler
 */
class Label extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      category: props.category,
    };
  }

  click_handler() {

    // DEBUG
    console.log("clicked");

    // Perform action: add label to picture? add label as a filter? redirect?
  }

  render() {
    return (
      <div className="Label">
        <div className="LabelText">
          {this.state.value}
        </div>
      </div>
    );
  }
}

/**
 * CheckLabel
 *
 * A checkbox input field, but in label format. Check to highlight the current label.
 *
 * parent props:
 *  - value: string
 *  - color: string
 *  - defaultChecked: boolean
 *  - onchange_handler()
 *  - category: category name, to use in onchange_handler
 *  - subcategory: subcategory name, to use in onchange_handler
 *
 * hooks:
 *  - checked: To help toggling the color of CheckLabels upon checking.
 *
 * references:
 *  https://stackoverflow.com/questions/62768262/styling-the-label-of-a-checkbox-when-it-is-checked-with-radium
 *  https://stackoverflow.com/questions/68715629/how-to-style-a-label-when-input-inside-it-is-checked
 */
function CheckLabel(props) {
  const [checked, setChecked]  // whether the current label is checked or not.
    = useState(() => {
      if (props.defaultChecked!==undefined) { // use defaultChecked if exists
        return props.defaultChecked;
      }
      return false; // otherwise default as false
    });
  return (
    <label
      className="Label"
      style={{
        borderColor: checked ? props.color : "#CCCCCC",
        backgroundColor: checked ? props.color+14 : "#FFFFFF"  // +14 = 8% opacity
      }}
    >
      <input
        type="checkbox"
        className="Checkbox_checklabel"
        value={props.value}
        style={{"--checkbox-color":props.color}}
        checked={checked}
        onChange={(e) => {
          setChecked(prev => !prev);
          //console.log("checked state in CheckLabel: " + checked); //DEBUG
          props.onchange_handler(e, !checked, props.category, props.subcategory);  // note: use "!checked" instead of "checked" because check state has not changed yet here
        }}
      />
      <div
        className="LabelText"
        style={{
          color: checked ? "#000000" : "#AAAAAA"
        }}
      >
        {props.value}
      </div>
    </label>
  )
}

/**
 * Filter
 *
 * parent props:
 *  - label: string
 *  - color: string
 *  - category: string
 *  - subcategory: string
 *  - remove_filter()
 * 
 * references:
 *  https://stackoverflow.com/questions/37644265/correct-path-for-img-on-react-js
 */
function Filter(props) {
  return (
    <div
      className="Label"
      style={{
        borderColor: props.color,
        backgroundColor: props.color+14  // +14 = 8% opacity
      }}
    >
      <div className="LabelText">
        {props.label}
      </div>
      <input
        type="image" src={FilterRemoveBtn} 
        onClick={(e) => props.remove_filter(e, props.label)}
      />
    </div>
  );
}

/**
 * DescriptionHover
 * 
 * Description to show upon hover the "?" help button
 * 
 * references:
 *  https://usefulangle.com/post/131/css-select-siblings
 */
function DescriptionHover(props) {
  return (
    <div className="DescriptionHover">
      <div
        className="DescriptionBtn"
        onClick={(e) => { e.preventDefault(); }} // prevent default refresh
      >
        ?
      </div>
      <div className="DescriptionTextBox_container">
        <div className="DescriptionTextBox">
          <div className="DescriptionText">{props.text}</div>
        </div>
      </div>
    </div>
  );
}

/**
 * SearchBar
 * 
 * parent props:
 *  - search_handler(searText, ...): whatever function to perform at the current search bar
 *  - id: id for this search bar
 * 
 * hooks:
 *  - [searchText, setSearchText]: to record current input in the search bar
 * 
 * references:
 *  https://stackoverflow.com/questions/12875911/how-can-i-make-my-input-type-submit-an-image
 *  https://bobbyhadz.com/blog/react-get-input-value-on-button-click
 */
function SearchBar(props) {
  const [searchText, setSearchText] = useState('');
  return (
    <div className="SearchBar">
      <input
        type="text"
        className="SearchBarInput"
        //id={props.id} name={props.id}
        placeholder=""
        value={searchText}
        onChange={(e) => {
          setSearchText(e.target.value);
          console.log('searchText is:', e.target.value); //DEBUG
        }}
      />
      <input
        type="image" src={SearchBtn}  // <input type="image"> defines an image as a submit button
        onClick={(e) => {
          e.preventDefault();
          //props.search_handler(searchText, ...);
        }}
      />
    </div>
  );
}

/**
 * Checkbox
 * 
 * parent props:
 *  - value: string
 *  - value_displaytext: string
 *  - color: string
 *  - defaultChecked: boolean
 *  - onchange_handler()
 * 
 * references:
 *  https://stackoverflow.com/questions/4148499/how-to-style-a-checkbox-using-css
 *  https://stackoverflow.com/questions/13367868/how-to-modify-the-fill-color-of-an-svg-image-when-being-served-as-background-ima
 *  https://stackoverflow.com/questions/19415641/how-to-position-before-after-pseudo-elements-on-top-of-each-other
 *  https://developer.mozilla.org/en-US/docs/Web/CSS/var
 *  https://stackoverflow.com/questions/52005083/how-to-define-css-variables-in-style-attribute-in-react-and-typescript
 */
function Checkbox(props) {
  const [checked, setChecked]  // whether the current checkbox is checked or not.
    = useState(() => {
      if (props.defaultChecked!==undefined) { // use defaultChecked if exists
        return props.defaultChecked;
      }
      return false; // otherwise default as false
    });
  return (
    <label
      className="Checkbox"
    >
      <input
        type="checkbox"
        className="Checkbox_default"
        value={props.value}
        style={{"--checkbox-color":props.color}}
        checked={checked}
        onChange={(e) => {
          //e.preventDefault(); // seems not needing preventDefault here
          setChecked((prev) => !prev);
          props.onchange_handler(e, !checked);  // note: use "!checked" instead of "checked" because check state has not changed yet here
        }}
      />
      <div className="CheckboxText">
        {props.value_displaytext}
      </div>
    </label>
  )
}


/**
 * Dots */
/**
 * Human figure */
/**
 * Modality */
/**
 * Rearrange filters */
/**
 * Img */
/**
 * Category */
/**
 * Statistics */
/**
 * Info */
/**
 * Imgs */
/**
 * Btn */
/**
 * CheckboxList */
/**
 * Dropdown */



/**------------ TEMPLATES ------------**/

/**
 * LabelStructure
 *
 * The template of label structure to help display and upload.
 * (updated from the old "initialFormData")
 *
 * references:
 *  https://medium.com/@alifabdullah/never-confuse-json-and-javascript-object-ever-again-7c32f4c071ad
 */
const LabelStructure = Object.freeze({
  url: "",
  location: {
    in_outdoor: "",
    purpose: [],
    architecture_component: [],
  },
  spectators: {
    quantity: "",
    density: "",
    attentive: "",
  },
  demographic: {
    age: "",
    sex: "",
    social_role: [],
  },
  modality: {
    head: true,
    eyes: true,
    voice: true,
    facial_expression: true,
    r_arm: true,
    l_arm: true,
    r_hand: true,
    l_hand: true,
    legs: true,
    feet: true,
  },
  posture: [],
})

export { LabelStructure, CheckLabel, Filter, Checkbox, DescriptionHover, SearchBar };