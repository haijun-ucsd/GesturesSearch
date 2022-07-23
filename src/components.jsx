import React from 'react';
import ReactDOM from 'react-dom/client';
import './components.css';
//import { useState , useEffect } from 'react';

/* Label
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

/* Filter
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
        onClick={() => props.onClick()}
      >
        x
      </button>
    </div>
  );
}

/* FilterList
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

  /* add_filter
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

  /* remove_filter
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
                onClick={() => this.remove_filter(item.value)}
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

/* FilterRearrange
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

/* btn */
/* <div
  className="btn"
  onClick={() => this.<callback function>()}
>
</div> */
/* Checkbox */
/* Checkbox list */
/* Dropdown */
/* Top bar */

/* Menu
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



/* Applied filters */
/* Search bar */
/* Dots */
/* Search */
/* Human figure */
/* Modality */
/* Rearrange filters */
/* Img */
/* Category */
/* Statistics */
/* Info */
/* Imgs */

export { Label, Filter, FilterList, Menu};