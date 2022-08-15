import React, { useRef } from 'react';
import ReactDOM from 'react-dom/client';
import './components.css';
import { labels_data } from "./labels_data.js";
import { useState , useEffect } from 'react';
import { Autocomplete, TextField } from '@mui/material';

/* Assets: */
import RemovableLabel_removebtn from "../assets/RemovableLabel_removebtn.png";
import YesBtn from "../assets/YesBtn.png";
import NoBtn from "../assets/NoBtn.png";
import SearchBtn from "../assets/SearchBtn.png";
import ArrowUp_primary from "../assets/ArrowUp_primary.png";
import ArrowDown_primary from "../assets/ArrowDown_primary.png";
import ArrowUp_tiny from "../assets/ArrowUp_tiny.png";
import ArrowDown_tiny from "../assets/ArrowDown_tiny.png";



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
 * RemovableLabel
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
function RemovableLabel(props) {
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
        type="image" src={RemovableLabel_removebtn} 
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
 * SearchBar
 * 
 * parent props:
 *  - search_handler(searText, ...): whatever function to perform at the current search bar.
 *  - searchResults: a list of labels as resulted from the search.
 *  - id: ref, id and name for this search bar, forwarded from parent.
 *
 * hooks:
 *  - [searchText, setSearchText]: to record current input in the search bar
 *  - [submittedSearchText, setSubmittedSearchText]: snapshot of searchText at the time of submission (clicking search btn or pressing ENTER)
 *      TODO: move "submittedSearchText" to a proper parent layer
 * 
 * references:
 *  https://stackoverflow.com/questions/12875911/how-can-i-make-my-input-type-submit-an-image
 *  https://bobbyhadz.com/blog/react-get-input-value-on-button-click
 *  https://stackoverflow.com/questions/31272207/to-call-onchange-event-after-pressing-enter-key
 */
function ExploreSearchBar(props) {

  const [searchText, setSearchText] = useState('');
  // DEBUG
  useEffect(() => {
    console.log("searchText is: " + searchText);
  }, [searchText]);

  const [submittedSearchText, setSubmittedSearchText] = useState('');
  // DEBUG
  useEffect(() => {
    console.log("submittedSearchText is: " + submittedSearchText);
  }, [submittedSearchText]);

  // Examples:
  const locationLabels = [
    { label: 'library'},
    { label: 'hospital'},
    { label: 'shopping'},
    { label: 'public transportation'},
    { label: 'entertainment'},
    { label: 'sport'},
    { label: 'nature'},
    { label: 'parking lot'},
    { label: 'street'},
    { label: 'pedestrian'},
    { label: 'restaurant'},
    { label: 'work space'},
    { label: 'hostpital'},
    { label: 'indoor'},
    { label: 'outdoor'},
    { label: 'entrance'},
    { label: 'corridor'},
    { label: 'bench'},
    { label: 'cabin'},
    { label: 'waiting room'},
    { label: 'shelf'},
    { label: 'pool'},
    { label: 'poolside'},
    { label: 'table'},
    { label: 'zebra walk'},
    { label: 'rock climbing wall'}
  ];

  /* Render */
  return (
    <div className="SearchBar_container">
      <div className="SearchBar">
        {/* <input
          type="text"
          className="SearchBarInput"
          id={props.id} name={props.id}
          placeholder=""
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
          onKeyDown={(e) => {  // pressing ENTER == clicking search icon
            if (e.key==='Enter') {
              setSubmittedSearchText(searchText);
            }
          }}
        /> */}
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={locationLabels}
          sx={{ width: 300 }}
          renderInput={
            (params) => <TextField {...params} label="Location"/>
          }
          onKeyPress= {(e, value) => {
            if (e.key === 'Enter') {
              console.log('Enter key pressed');
              // write your functionality here
              // search for relevant images here
              // send inputed location back to Facet and re-render images
              // console.log(e.target.value);
              props.handleSearch(e.target.value);
            }
          }}
        />
        <input
          type="image" src={SearchBtn}  // <input type="image"> defines an image as a submit button
          onClick={(e) => {
            e.preventDefault();
            setSubmittedSearchText(searchText);
          }}
        />
      </div>
    </div>
  );
}

/**
 * SearchableDropdown
 * 
 * parent props:
 *  - selectedLabels: a list of labels selected in this SearchableDropdown.
 *  - id: id to be used for SearchBar.
 *  - color
 *  - category
 *  - subcategory
 *  - label_change_handler()
 *  - label_remove_handler()
 *  - searchResults: a list of labels as resulted from the search.
 *  - labelsList (TODO: remove once search is implemented?)
 * 
 * Searchable drop-down in Upload page. Will do:
 *  1. Provide labels according input,
 *  2. Allow for adding new label, especially when no result found.
 * 
 * references:
 *  https://stackoverflow.com/questions/39817007/focus-next-input-once-reaching-maxlength-value-in-react-without-jquery-and-accep
 *  https://reactjs.org/docs/forwarding-refs.html
 *  https://stackoverflow.com/questions/42017401/how-to-focus-a-input-field-which-is-located-in-a-child-component
 *  https://stackoverflow.com/questions/58872407/accessing-refs-in-react-functional-component
 *  https://stackoverflow.com/questions/52727021/conditional-inline-style-in-react-js
 *  https://stackoverflow.com/questions/35522220/react-ref-with-focus-doesnt-work-without-settimeout-my-example/35522475#35522475
 *  https://www.geeksforgeeks.org/is-setstate-method-async/#:~:text=setState()%20async%20Issue%3A%20If,debugging%20issues%20in%20your%20code.
 *  https://stackoverflow.com/questions/63364282/react-only-display-items-which-fully-fit-within-flex-box-and-dynamically-deter
 *  https://www.robinwieruch.de/react-custom-hook-check-if-overflow/
 */
function SearchableDropdown(props) {
  const [expanded, setExpanded] = useState(false);

  const [searchText, setSearchText] = useState('');
  // DEBUG
  useEffect(() => {
    console.log("searchText is: " + searchText);
  }, [searchText]);

  const [submittedSearchText, setSubmittedSearchText] = useState('');
  // DEBUG
  useEffect(() => {
    console.log("submittedSearchText is: " + submittedSearchText);
  }, [submittedSearchText]);

  const [customizedLabel, setCustomizedLabel] = useState('');
  // DEBUG
  useEffect(() => {
    console.log("customizedLabel is: " + customizedLabel);
  }, [customizedLabel]);
  const addCustomizedLabel = () => {
    const newLabel = customizedLabel; // take snapshot of current entered label
    if (!(props.selectedLabels.some(item => item===newLabel))) { // check for existence
      props.label_add_handler(newLabel, props.category, props.subcategory);
    } else {
      alert("Label '" + newLabel + "'is already selected.");
    }
    setCustomizedLabel(''); // clear CustomizeLabel field
  }

  /* Jump to focus on search bar while expanding */
  const searchbarRef = useRef();
  const focusOnSearchbar = (() => {
    if (expanded==true) {
      console.log("SearchableDropdown clicked, find corresponding search bar ↓"); console.log(searchbarRef.current); //DEBUG
      searchbarRef.current.focus(); // there is a setFocus() function in the SearchBar component to set focus on the search bar input field
    }
  });
  useEffect(() => {  // cannot put this into onClick of dropdown because setState is asynchronous
    focusOnSearchbar();
  }, [expanded]);

  /* Render */
  return (
    <div className="SearchableDropdown">
      {expanded ?
        <>
          <input
            className="SearchableDropdown_expandbtn"
            type="image" src={ArrowUp_tiny} 
            onClick={(e) => {
              e.preventDefault();
              setExpanded(false);
            }}
          />
          <div
            className="SDSelectedLabelList_expanded"
            onClick={(e) => {
              //e.preventDefault();
              focusOnSearchbar();
            }}
          >
            {props.selectedLabels.map((item) =>
              <RemovableLabel
                //key={XX}
                label={item}
                color={props.color}
                category={props.category}
                subcategory={props.subcategory}
                remove_filter={(e) => props.label_remove_handler(item, props.category, props.subcategory)}
              />
            )}
          </div>
        </>
      :
        <>
          <input
            className="SearchableDropdown_expandbtn"
            type="image" src={ArrowDown_tiny} 
            onClick={(e) => {
              e.preventDefault();
              setExpanded(true);
            }}
          />
          <div
            className="SDSelectedLabelList_collapsed"
            onClick={(e) => {
              //e.preventDefault();
              setExpanded(true); // this includes focusOnSearchbar() by using useEffect
            }}
          >
            {props.selectedLabels.map((item) =>
              <RemovableLabel
                //key={XX}
                label={item}
                color={props.color}
                category={props.category}
                subcategory={props.subcategory}
                remove_filter={(e) => props.label_remove_handler(item, props.category, props.subcategory)}
              />
            ) /*TODO: "& N more" when there are too many selected labels*/}
          </div>
        </>
      }
      <div style={{
        display: expanded ? "block" : "none",
        alignSelf: "stretch",
      }}>
        <div className="SearchBar_container">
          <div className="SearchBar">
            <input
              ref={searchbarRef}
              type="text"
              className="SearchBarInput"
              id={props.id} name={props.id}
              placeholder=""
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
              }}
              /*onKeyDown={(e) => {  // pressing ENTER == clicking search icon
                if (e.key==='Enter') {
                  setSubmittedSearchText(searchText);
                  //props.search_handler(searchText, ...);
                }
              }}*/
            />
            <input
              type="image" src={SearchBtn}  // <input type="image"> defines an image as a submit button
              disabled  // TODO: remove when search is implemented
              /*onClick={(e) => {
                e.preventDefault();
                setSubmittedSearchText(searchText);
                //props.search_handler(searchText, ...);
              }}*/
            />
          </div>
          {/* search result */
          /*(() => {
            if (submittedSearchText=='') {
              return null;
            } else {
              if (searchResults=='') {
                return (
                  <p className="HintText">
                    No result is found.
                  </p>
                );
              } else {  // normal case
                return (
                  <div className="LabelList">
                    searchResults.map((item) => {});
                  </div>
                );
              }
            }
          })*/
          /* TODO: abandon once the actual search is implemented */
          <div className="LabelList">
            {props.labelsList.map((label) => {
              if (!(props.selectedLabels.some(item => item===label.label))) {
                return (
                  <CheckLabel
                    value={label.label}
                    color={props.color}
                    key={label.label_id}
                    category={props.category}
                    subcategory={props.subcategory}
                    onchange_handler={props.label_change_handler}
                  />
                );
              }
            })}
          </div>
          /* TODO: after selecting a label, clear search bar and fold the dropdown */}
        </div>
      </div>
      <div
        className="CustomizeLabel_container"
        style={{display: expanded ? "flex" : "none",}}
      >
        <div className="HintText">couldn't find proper label? customize one:</div>
        <div className="CustomizeLabel">
          <input
            type="text"
            className="CustomizeLabel_field"
            placeholder=""
            value={customizedLabel}
            onChange={(e) => {
              setCustomizedLabel(e.target.value);
            }}
            onKeyDown={(e) => {  // pressing ENTER == clicking search icon
              if (e.key==='Enter') { addCustomizedLabel(); }
            }}
          />
          {customizedLabel!=='' ?
            <>
              <input
                type="image" src={YesBtn}
                onClick={(e) => {
                  e.preventDefault();
                  addCustomizedLabel();
                }}
              />
              <input
                type="image" src={NoBtn}
                onClick={(e) => {
                  e.preventDefault();
                  setCustomizedLabel('');
                }}
              />
            </>
          : null }
        </div>
      </div>
    </div>
  );
}

/**
 * AccordionSection
 * 
 * parent props:
 *  - title: name of the the current section
 *  - color: color of title if not black
 *  - icon: icon for this section
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
          {props.icon!==undefined ?
            <div
              className={"CategoryIcon" + " " + props.icon}
              style={{"--categoryicon-color":props.color}}
            />
          : null}
          <div
            className="SectionName"
            style={
              (props.color && props.color!=="") ?
              {color:props.color} : null
            }
          >
            {props.title}
          </div>
          {(props.description && props.description!=="") ?
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

export { LabelStructure, FilterStructure, CheckLabel, RemovableLabel, Checkbox, DescriptionHover, ExploreSearchBar, SearchableDropdown, AccordionSection };