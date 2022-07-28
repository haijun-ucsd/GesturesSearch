import React from 'react';
import ReactDOM from 'react-dom/client';
import './components.css';
import { labels_data } from "./labels_data.js";
import { useState , useEffect } from 'react';

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
 *  - form_change_handler()
 *
 * hooks:
 *  - checked: To help toggling the color of CheckLabels upon checking.
 *
 * references:
 *  https://stackoverflow.com/questions/62768262/styling-the-label-of-a-checkbox-when-it-is-checked-with-radium
 *  https://stackoverflow.com/questions/68715629/how-to-style-a-label-when-input-inside-it-is-checked
 */
function CheckLabel(props) {
  const [checked, setChecked] = useState(false);
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
        value={props.value}
        checked={checked}
        onChange={(e) => {
          setChecked(prev => !prev);
          //console.log("checked state in CheckLabel: " + checked); //DEBUG
          props.form_change_handler(e, !checked, props.category, props.subcategory);  // note: use "!checked" instead of "checked" because check state has not changed yet here
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
 * CheckLabelList
 *
 * Display all labels in the given list, each label is checkable.
 *
 * parent props:
 *  - list
 *
function CheckLabelList(props) {
  return (
    <div className="LabelList">
      {props.list.map(
        (item) => <div key={item.key}>
          <CheckLabel
            value={item.value}
            category={item.category}
          />
        </div>
      )}
    </div>
  )
}*/

/**
 * Filter
 *
 * parent props:
 *  - value: string
 *  - id: int
 *  - category: string
 *  - remove_filter()
 */
function Filter(props) {
  return (
    <div className="Label">
      <div className="LabelText">
        {props.value}
      </div>
      <button
        className="Label_CloseBtn"
        onClick={() => props.remove_filter()}
      >
        x
      </button>
    </div>
  );
}

/**
 * FilterList
 *
 * functions:
 *  - add_filter()
 *  - remove_filter()
 *
 * references:
 *  https://robinpokorny.medium.com/index-as-a-key-is-an-anti-pattern-e0349aece318
 */
class FilterList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      list: [
        {value: "value1", id:1, category: "category1"},
        {value: "value2", id:2, category: "category2"},
      ],
      id_counter: 2, // TODO: helper, will remove
    };
  }

  /**
   * add_filter
   *
   * references:
   *  https://stackoverflow.com/questions/43784554/how-to-add-input-data-to-list-in-react-js
   *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
   */
  add_filter() {

    // DEBUG
    console.log("try adding filter: " + this.newValue.value);

    // Check for empty.
    if (this.newValue.value == "") { return; }

    // Store newValue, clear input box.
    const newVal = this.newValue.value;
    this.newValue.value = "";

    // Check for existence.
    if (this.state.list.some(
      (item) => item.value === newVal
    )) {

      // DEBUG
      console.log("repeated filter: " + newVal);

      return;
    }

    // Add filter to filterlist.
    this.state.id_counter++;  // TODO: helper, will remove
    this.setState (prevState => (
      {list: [...this.state.list,
        {value: newVal, id:this.state.id_counter, category: "category1"}
      ]}
    ));    

    // Update gallery.

    // DEBUG
    console.log("added filter: " + newVal);
  }

  /**
   * remove_filter
   *
   * @param index: Index of the element to remove.
   *
   * references:
   *  https://stackoverflow.com/questions/36326612/how-to-delete-an-item-from-state-array
   *  https://stackoverflow.com/questions/35338961/how-to-remove-the-li-element-on-click-from-the-list-in-reactjs
   */
  remove_filter(val) {

    // DEBUG
    console.log("remove filter: " + val);

    // Reset state.list to remove the current filter.
    this.setState (prevState => (
      {list:
        this.state.list.filter(
          (item) => item.value!==val
        )
      }
    ));

    // Update gallery.
  }

  render() {
    return (
      <div className="MenuModule">
        <div className="FilterList">
          {this.state.list.map(
            (item) => <div key={item.id}>
              <Filter
                value={item.value}
                category={item.category}
                remove_filter={() => this.remove_filter(item.value)}
              />
            </div>
          )}
        </div>
        <div className="dummy_flex">
          <input
            type="text"
            placeholder="new filter"
            ref={(el) => {this.newValue = el}}
          />
          <button
            className="Btn"
            onClick={() => this.add_filter()}
          >
            +
          </button>
        </div>
      </div>
    );
  }
}

/**
 * FilterRearrange
 */
class FilterRearrange extends React.Component {

  render() {
    return (
      <div className="FilterRearrange">
        <Filter />
      </div>
    );
  }
}

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

/**
 * Navbar */

/**
 * WaitingRoom
 *
 * Waiting room for pictures to be labeled before being uploaded to filebase.
 *
 * parent props:
 *  - setImageUpload()
 *
 * hooks:
 *  - addedPic (same as the old "imageUpload")
 *  - addedPicUrl: View-only display of the current added pic.
 *  - addedLabels: View-only list of added labels.
 *  TODO: will need to update when allowing adding multiple pictures.
 *
 * references:
 *  https://stackoverflow.com/questions/43992427/how-to-display-a-image-selected-from-input-type-file-in-reactjs
 *  https://stackoverflow.com/questions/68491348/react-checking-if-an-image-source-url-is-empty-then-return-a-different-url
 *  https://stackoverflow.com/questions/15922344/hide-image-if-src-is-empty
 */
function WaitingRoom(props) {
  const [addedPic, setAddedPic] = useState(null);
  const [addedPicUrl, setAddedPicUrl] = useState("");
  const [addedLabels, setAddedLabels] = useState([]);
  return (
    <div style={{/* as an item */ flexGrow: 1}}>
      <div className="WaitingRoomControl">
        <div className="WaitingRoomControl_addpic">
          <div id="add-pic-btn-div">
            <label htmlFor="add-pic-btn" className="Btn_primary">
              {addedPic == null ? // TODO: change after supporting adding multiple pictures.
                <span>+ Add picture</span>
              :
                <span>&#8634; Change picture</span>
              }
            </label>
            <input
              id="add-pic-btn"
              type="file"
              onChange={(event) => {
                // On picture change, check for validity, then accept and display the new picture.
                if (event.target.files && event.target.files[0]) {
                  console.log("Valid new picture, refresh waiting room."); //DUBUG
                  setAddedPic(event.target.files[0]);
                  let newUrl = URL.createObjectURL(event.target.files[0]);
                  setAddedPicUrl(newUrl);
                  props.setImageUpload(newUrl);
                }
              }}
              style={{display:"none"}}
            />
          </div>
          <div id="upload-btn-div">
            <button
              className="Btn_primary"
              type="submit"
              onClick={props.uploadImage}
              variant="primary"
              //disabled={btnDisabled}
            >
                Upload
            </button>
          </div>
        </div>
        <div className="WaitingRoomControl_selectpic"></div>
      </div>
      <div className="WaitingRoom">
        {addedPic != null ?
          <div>
            <img
              className="WaitingPic"
              src={addedPicUrl}
            />
            <div className="LabelList">
              {addedLabels.map((label) => <div className="Label">{label}</div>)}
            </div>
          </div>
        : null}
      </div>
    </div>
  );
}

/**
 * Menu (TODO: replace with "Facet" and add more)
 */
class Menu extends React.Component {

  render() {
    return (
      <div className="Menu">
        <FilterList />
      </div>
    );
  }
}



/**
 * Applied filters */
/**
 * Search bar */
/**
 * Dots */
/**
 * Search */
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
 * Checkbox */
/**
 * CheckboxList */
/**
 * Dropdown */

export { CheckLabel, LabelStructure, WaitingRoom };