import React from 'react';
import ReactDOM from 'react-dom/client';
import './components.css';
//import { useState , useEffect } from 'react';

/* Label
 *
 * states:
 *  - value: string
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
 */
class FilterList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      list: [
        {value: "value1", category: "category1"},
        {value: "value2", category: "category2"},
      ],
    };
  }

  /* add_filter
   *
   * references:
   *  https://stackoverflow.com/questions/43784554/how-to-add-input-data-to-list-in-react-js
   */
  add_filter() {

    // DEBUG
    console.log("add filter: " + this.newValue.value);

    // Add filter. TODO
    this.setState (prevState => (
      {list: [...this.state.list,
        {value: this.newValue.value, category: "category1"}
      ]}
    ));

    // Update gallery.
  }

  /* remove_filter
   *
   * @param index: Index of the element to remove.
   *
   * references:
   *  https://stackoverflow.com/questions/36326612/how-to-delete-an-item-from-state-array
   *  https://stackoverflow.com/questions/35338961/how-to-remove-the-li-element-on-click-from-the-list-in-reactjs
   */
  remove_filter(index) {

    // DEBUG
    console.log("remove filter: " + this.state.list[index].value);

    // Reset state.list to remove the current filter.
    this.setState (prevState => (
      {list:
        this.state.list.filter(
          (e, i) => i!==index
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
            (item, i) => <div key={i}>
              <Filter
                value={item.value}
                category={item.category}
                onClick={() => this.remove_filter(i)}
              />
            </div>
          )}
        </div>
        <div className="dummy_flex">
          <input
            type="text"
            placeholder="new filter"
            ref={(ip) => {this.newValue = ip}}
          />
          <button onClick={() => this.add_filter()}>
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
        <div clssName="MenuModule" />
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

export { Label, Filter, FilterList};