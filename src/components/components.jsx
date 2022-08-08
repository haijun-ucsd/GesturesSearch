import React from 'react';
import ReactDOM from 'react-dom/client';
import './components.css';
import { labels_data } from "./labels_data.js";
import { useState , useEffect } from 'react';

/* Assets: */
import FilterRemoveBtn from "../assets/FilterRemoveBtn.png";
import SearchBtn from "../assets/SearchBtn.png";
import ArrowUp_primary from "../assets/ArrowUp_primary.png";
import ArrowDown_primary from "../assets/ArrowDown_primary.png";



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
 *  - onchange_handler()
 *      If checkedState is provided, onchange_handler(), no argument needed;
 *      If not provided, onchange_handler(e, checked, category, subcategory)
 *  - category: category name, to use in onchange_handler
 *  - subcategory: subcategory name, to use in onchange_handler
 *  - defaultChecked: boolean
 *      Optional, no need to provide when checkedState is provided.
 *  - checkedState: boolean
 *      Prioritized over the checked hook if provided.
 *
 * hooks:
 *  - checked: To help toggling the color of CheckLabels upon checking when checkedState is not provided.
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
  if (props.checkedState!==undefined) {
    return (
      <label
        className="Label"
        style={{
          cursor:"pointer",
          borderColor: props.checkedState ? props.color : "#CCCCCC",
          backgroundColor: props.checkedState ? props.color+14 : "#FFFFFF"  // +14 = 8% opacity
        }}
      >
        <input
          type="checkbox"
          className="Checkbox_checklabel"
          value={props.value}
          style={{"--checkbox-color":props.color}}
          checked={props.checkedState}
          onChange={props.onchange_handler}
        />
        <div
          className="LabelText"
          style={{
            color: props.checkedState ? "#000000" : "#AAAAAA"
          }}
        >
          {props.value}
        </div>
      </label>
    );
  } else {  // when parent did not provide checkedState, use the following as default.
    return (
      <label
        className="Label"
        style={{
          cursor:"pointer",
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
    );
  }
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
        onClick={() => props.remove_filter(props.label)}
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
 *  - checkedState: boolean, prioritized over the checked hook if provided.
 *  - spectrumBox: boolean, if true, use Checkbox_spectrum class instead of Checkbox.
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
  if (props.checkedState!==undefined) {
    return (
      <label
        className={(props.spectrumBox!==undefined && props.spectrumBox===true) ? "Checkbox_spectrum" : "Checkbox"}
      >
        <input
          type="checkbox"
          className="Checkbox_default"
          value={props.value}
          style={{"--checkbox-color":props.color}}
          checked={props.checkedState}
          onChange={props.onchange_handler}
        />
        <div className="CheckboxText">
          {props.value_displaytext}
        </div>
      </label>
    );
  } else {
    return (
      <label
        className={(props.spectrumBox!==undefined && props.spectrumBox===true) ? "Checkbox_spectrum" : "Checkbox"}
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
    );
  }
}

/**
 * AccordionSection
 * 
 * parent props:
 *  - title: name of the the current section
 *  - color: color of title if not black
 *  - description: a description for the current section to show upon hovering
 * 
 * references:
 *  https://reactjs.org/docs/composition-vs-inheritance.html
 */
function AccordionSection(props) {
  const [expanded, setExpanded] = useState(true);  // whether the current AccordionSection is expanded, default as true.
  return (
    <div className="AccordionSection">
      <div className="AccordionSectionHeaderBar">
        <div className="SectionHeader">
          <div
            className="SectionName"
            style={
              (props.color && props.color!="") ?
              {color:props.color} : null
            }
          >
            {props.title}
          </div>
          {(props.description && props.description!="") ?
            <DescriptionHover text={props.description}/> : null
          }
        </div>
        {expanded ?
          <input
            type="image" src={ArrowUp_primary} 
            onClick={(e) => {
              e.preventDefault();
              setExpanded(false);
            }}
          />
        :
          <input
            type="image" src={ArrowDown_primary} 
            onClick={(e) => {
              e.preventDefault();
              setExpanded(true);
            }}
          />
        }
      </div>
      {expanded ?
        <>{props.children}</>
      : null }
    </div>
  );
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

/**
 * FilterStructure
 * 
 * The template of facet filter structure to help filter and display (only the AccordionSection parts).
 */
const FilterStructure = Object.freeze({
  modality: {
    head: "any",
    eyes: "any",
    voice: "any",
    facial_expression: "any",
    r_arm: "any",
    l_arm: "any",
    r_hand: "any",
    l_hand: "any",
    legs: "any",
    feet: "any",
  },
  posture: {
    posture: [], // ALL: ["sitting", "standing", "walking", "running", "jumping", "bending", "squatting", "kneeling", "climbing", "hanging", "lying", "backbending", "holding sth.", "grasping sth.", "operating sth.", "pulling sth.", "pushing sth.", "reaching for sth.", "pointing at sth.", "crossing arms", "raising arm(s)", "crossing legs", "raising leg(s)"]
  },
  spectators: {
    quantity: [], // ALL: ["none", "small", "large"]
    density: [], // ALL: ["none", "sparse", "dense"]
    attentive: [], // ALL: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '>8']
  },
  demographic: {
    age: [], // ALL: ["baby", "child", "teen", "young adult", "baby", "baby"]
    sex: [], // ALL: ["male", "female"]
  },
})

export { LabelStructure, FilterStructure, CheckLabel, Filter, Checkbox, DescriptionHover, SearchBar, AccordionSection };