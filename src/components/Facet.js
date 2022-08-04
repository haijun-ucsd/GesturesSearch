import React, { useState , useEffect } from 'react';
//import { storage } from '../firebase';
//import { getDatabase, onValue, ref as ref_db, set } from 'firebase/database';
//import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
//import { v4 } from 'uuid';
import './components.css';
import { Filter, Checkbox, SearchBar } from './components';

/* Assets: */
import ArrowUp_secondary from "../assets/ArrowUp_secondary.png";
import ArrowDown_secondary from "../assets/ArrowDown_secondary.png";



/**
 * Facet
 *
 * Facet menu for users to search and filter pictures at will on the Explore page.
 * 
 * Structure: AppliedFilters, ExploreSearch, {Modality, Posture, Spectators, Demongraphic}
 * Each FacetModule is too different from each other to be rendered together in a loop,
 * so they are made into separate components at the end of this file.
 *
 * parent props:
 *  - setRange(): To update range (search range).
 *  - range: Search range.
 *  - range_change_handler(): To handle change of search range.
 *  - setFilterList(): To update filterList.
 *  - filterList: Up-to-date list of currently applied filters.
 *
 * hooks:
 *  - ...
 *
 * references:
 */
export default function Facet(props) {

  /**
   * add_filter
   *
   * @param e: event → preventDefault()
   * @param :
   *  A new filter in filterList contains (input as parameters):
   *  { label, label_id, category, subcategory, color }
   *
   * references:
   *  https://stackoverflow.com/questions/43784554/how-to-add-input-data-to-list-in-react-js
   *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
   */
  const add_filter = (e, label, label_id, category, subcategory, color) => {
    e.preventDefault();

    // DEBUG
    console.log("try adding filter: " + label + " ...");

    // Check for empty.
    if (label == "") { return; }

    // Check for existence.
    if (props.filterList.some(
      (item) => item.label === label
    )) {
      console.log("label repeated, not added."); //DEBUG
      return;
    }

    // Store newValue, clear input box.
    const newFilter = {
      ['label']: label,
      ['label_id']: label_id,
      ['category']: category,
      ['subcategory']: subcategory,
      ['color']: subcategory,
    };

    // Add filter to filterlist.
    props.setFilterList (prev => ([
      ...prev,
      newFilter,
    ]));

    // TODO: Update gallery.
    //console.log("adding succeeds, gallery updated."); //DEBUG
  }

  /**
   * remove_filter
   *
   * @param e: event → preventDefault()
   * @param label: Value of the element to remove.
   *
   * references:
   *  https://stackoverflow.com/questions/36326612/how-to-delete-an-item-from-state-array
   *  https://stackoverflow.com/questions/35338961/how-to-remove-the-li-element-on-click-from-the-list-in-reactjs
   */
  const remove_filter = (e, label) => {
    e.preventDefault();

    // DEBUG
    console.log("remove filter: " + label);

    // Reset state.list to remove the current filter.
    props.setFilterList (prev => {
      let newFilterList = prev.filter(
        (item) => item.label !== label
      );
      return newFilterList;
    });

    // TODO: Update gallery.
    //console.log("removing succeeds, gallery updated."); //DEBUG
  }

/* Render */

  /*return (
    <div className="Facet">
      <AppliedFilters />
      <ExploreSearch />
      <FacetModality />
      <FacetPosture />
      <FacetSpectators />
      <FacetDemongraphic />
    </div>
  );*/
  return (
    <div className="Facet">
      <AppliedFilters
        filterList={props.filterList}
        //add_filter={add_filter}
        remove_filter={remove_filter}
      />
      <ExploreSearch
        range={props.range}
        setRange={props.setRange}
        onchange_handler={props.range_change_handler}
      />
    </div>
  );
}

/**
 * AppliedFilters
 *
 * parent props:
 *  - filterList
 *  - add_filter(val)
 *  - remove_filter(val)
 *
 * references:
 *  https://robinpokorny.medium.com/index-as-a-key-is-an-anti-pattern-e0349aece318
 */
function AppliedFilters(props) {
  return (
    <div className="FacetModule">
      <div className="AppliedFiltersHeader">
        <div className="AppliedFiltersTitle">
          Applied Filters
        </div>
        <div className="AppliedFiltersCount">
          ({props.filterList.length})
        </div>
      </div>
      <div className="FilterList">
        {props.filterList.map((item) =>
          <Filter
            key={item.label_id}
            label={item.label}
            color={item.color}
            //category={item.category}
            //subcategory={item.subcategory}
            remove_filter={props.remove_filter}
          />
        )}
      </div>
    </div>
  );
}

/*function FilterRearrange(props) {
  return (
    <div className="FacetModule">
      <... />
    </div>
  );
}*/

/**
 * ExploreSearch
 * 
 * TODO: combine SearchRange and SearchRange_color variables into labels_list?
 * 
 * references:
 *  https://stackoverflow.com/questions/59016030/css-flexbox-or-grid-2-columns-row-wrapping-no-growth-inner-margins
 *  https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns
 *  https://bobbyhadz.com/blog/react-capitalize-first-letter#:~:text=To%20capitalize%20the%20first%20letter%20of%20a%20string%20in%20React%3A&text=Call%20the%20toUpperCase()%20method,the%20rest%20of%20the%20string.
 *  https://stackoverflow.com/questions/45277306/check-if-item-exists-in-array-react
 */
function ExploreSearch(props) {

  const SearchRange = ["location", "demographic", "modality", "posture"];
  const SearchRange_color = {
    location: "#A0D568",
    demographic: "#ED5564",
    modality: "#4FC1E8",
    posture: "#AC92EB",
  };
  const [expanded, setExpanded] = useState(true);  // whether the SearchRange dropdown is expanded, default as true.

  /* Render */
  return (
    <div className="FacetModule">
      <SearchBar
        //search_handler = {...} //TODO: define a search function and use it here, in the SearchBar component this function will be used onClick of the search button.
      />
      {expanded ?
        <div className="SearchRange_expanded">
          <div className="SearchRangeHeader">
            <div className="FacetSubsectionName">
              search in range:
            </div>
            <input
              type="image" src={ArrowUp_secondary} 
              onClick={(e) => {
                e.preventDefault();
                setExpanded(false);
              }}
            />
          </div>
          <div className="SearchRangeCheckboxes">
            {SearchRange.map((category) =>
              <Checkbox
                value={category}
                value_displaytext={category.charAt(0).toUpperCase() + category.slice(1)}  // capitalize first letter of the categories for display
                color={SearchRange_color[category]}
                defaultChecked={props.range.some(item => item===category) ? true : false}  // render checked state according to the recorded range
                onchange_handler={props.onchange_handler}
              />
            )}
          </div>
        </div>
      :
        <div className="SearchRangeHeader">
          <div className="SearchRange_collapsed">
            <div className="FacetSubsectionName">
              search in range:
            </div>
            <div className="SearchRangeDots">
              {props.range.map((category) =>
                <div
                  className="SearchRangeDot"
                  style={{backgroundColor: SearchRange_color[category]}}
                />
              )}
            </div>
          </div>
          <input
            type="image" src={ArrowDown_secondary} 
            onClick={(e) => {
              e.preventDefault();
              setExpanded(true);
            }}
          />
        </div>
      }
    </div>
  );
}

/*function FacetModality(props) {
  return ();
}

function FacetPosture(props) {
  return ();
}

function FacetSpectators(props) {
  return ();
}

function FacetDemongraphic(props) {
  return ();
}*/