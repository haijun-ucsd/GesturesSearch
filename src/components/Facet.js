import React, { useState , useEffect, useLayoutEffect } from 'react';
//import { storage } from '../firebase';
//import { getDatabase, onValue, ref as ref_db, set } from 'firebase/database';
//import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
//import { v4 } from 'uuid';
import './components.css';
import { Filter, Checkbox, SearchBar, AccordionSection } from './components';
import BodyComponent from './BodyComponent.tsx';

/* Assets: */
import ArrowUp_secondary from "../assets/ArrowUp_secondary.png";
import ArrowDown_secondary from "../assets/ArrowDown_secondary.png";



/**
 * Facet
 *
 * Facet menu for users to search and filter pictures at will on the Explore page.
 * 
 * Structure: ExploreSearch, {Modality, Posture, Spectators, Demongraphic}
 * Each Facet Module is too different from each other to be rendered together in a loop,
 * so they are made into separate components at the end of this file.
 *
 * parent props:
 *  - setRange(): To update range (search range).
 *  - range: Search range.
 *  - setFilterList(): To update filterList.
 *  - filterList: Up-to-date list of currently applied filters.
 *  - setFacetList(): To update facetList.
 *  - facetList: List of states in the facet sections.
 *  - remove_filter(): To help remove from filterList.
 *
 * references:
 *  https://reactjs.org/docs/composition-vs-inheritance.html
 *  https://stackoverflow.com/questions/39652686/pass-react-component-as-props
 *  https://en.wikipedia.org/wiki/Accordion_(GUI)
 */
export default function Facet(props) {

  /**
   * Handle update in search range.
   */
  const range_change_handler = (e, checked) => {
    console.log("range_change_handler"); //DEBUG

    // Default case.
    if (checked) {

      // Add category to range.
      props.setRange((prev) => {
        console.log("add category to search range. category added: " + e.target.value); //DEBUG
        return [
          ...prev,
          e.target.value,
        ];
      });
    } else {

      // Remove category from range.
      props.setRange((prev) => {
        console.log("remove category from search range. category removed: " + e.target.value); //DEBUG
        return prev.filter(
          (item => item!==e.target.value)
        );
      });
    }
  };

  /**
   * filter_change_handler
   *
   * Default filter_change_handler for checkbox facet fields.
   * Special case: Modality → see within FacetModality.
   *
   * @param :
   *  A new filter in filterList contains (input as parameters):
   *  { label, label_id, category, subcategory, color }
   *
   * references:
   *  https://stackoverflow.com/questions/43784554/how-to-add-input-data-to-list-in-react-js
   *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/some
   */
  const filter_change_handler = (label, label_id, category, subcategory, color) => {
    // DEBUG
    console.log("try adding filter: " + label + " ...");

    // Check for empty.
    if (label == "") { return; }

    // Check for existence.
    // Toggle: if exists, then remove; if doesn't exist, the add.
    if (props.filterList.some(
      (item) => item.label === label
    )) {
      console.log("label exists, remove."); //DEBUG
      props.remove_filter(label);
    } else {
      console.log("label doesn't exists yet, add."); //DEBUG
      const newFilter = {
        ['label']: label,
        ['label_id']: label_id,
        ['category']: category,
        ['subcategory']: subcategory,
        ['color']: subcategory,
      };
      props.setFilterList (prev => ([
        ...prev,
        newFilter,
      ]));

    // TODO: Update gallery.
    //console.log("adding succeeds, gallery updated."); //DEBUG
    }
  }

  /* Render */
  return (
    <div className="FacetMenu">
      {/*<AppliedFilters
        filterList={props.filterList}
        remove_filter={remove_filter}
      />*/}
      <div className="Facet">
        <ExploreSearch
          range={props.range}
          setRange={props.setRange}
          onchange_handler={range_change_handler}
          filter_change_handler={filter_change_handler}
        />
        <FacetModality
          facetList={props.facetList}
          setFacetList={props.setFacetList} // will only set "modality"
          setFilterList={props.setFilterList}
          remove_filter={props.remove_filter}
        />
        <FacetPosture
          postureStates={props.facetList.posture}
          filter_change_handler={filter_change_handler}
        />
        <FacetSpectators
          filter_change_handler={filter_change_handler}
        />
        <FacetDemongraphic
          filter_change_handler={filter_change_handler}
        />
      </div>
    </div>
  );
}

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
    <div className="Module">
      <SearchBar
        //search_handler = {...} //TODO: define a search function and use it here, in the SearchBar component this function will be used onClick of the search button.
      />
      {expanded ?
        <div className="SearchRange_expanded">
          <div className="SearchRangeHeader">
            <div className="SubsectionName">
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
            <div className="SubsectionName">
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


// TODO: improve organization of these category modules, combine things that can be combined.

/**
 * FacetModality
 * 
 * parent props:
 *  - facetList: for displaying and updating modality states.
 *  - setFacetList()
 *  - setFilterList()
 *  - remove_filter(): Tod help setFilterList().
 */
function FacetModality(props) {

  /**
   * modality_change_handler
   * 
   * 1. Modify filterList.
   * 2. Update facetList.modality.
   * Click to switch order: any → available → unavailable → any.
   */
  const modality_change_handler = (target) => {
    const bodypart = target.id || target.parentElement.id; // could be either depending on clicking position
    console.log("modality state is changed on body part: " + bodypart); //DEBUG
    let currBodypartState = props.facetList["modality"][bodypart];

    // 1. Modify filterList.
    if (currBodypartState==="any") {

      // any → available
      currBodypartState = "available";
      props.setFilterList (prev => ([
        ...prev,
        {
          ['label']: bodypart + " available",
          ['label_id']: 0, // TODO: label_id
          ['category']: "modality",
          ['subcategory']: bodypart,
          ['color']: "#4FC1E8",
        },
      ]));
    } else if (currBodypartState==="available") {

      // available → unavailable
      currBodypartState = "unavailable";
      props.remove_filter(bodypart+" available");
      props.setFilterList (prev => ([
        ...prev,
        {
          ['label']: bodypart + " unavailable",
          ['label_id']: 0, // TODO: label_id
          ['category']: "modality",
          ['subcategory']: bodypart,
          ['color']: "#4FC1E8",
        },
      ]));
    } else { // currBodypartState==="unavailable"

      // unavailable → any
      currBodypartState = "any"; // default bodypart state: any
      props.remove_filter(bodypart+" unavailable");
    }

    // 2. Update facetList.modality.
    props.setFacetList((prev) => ({
      ...prev,
      ["modality"]: {
        ...prev["modality"],
        [bodypart]: currBodypartState,
      },
    }));
  }

  /* Render */
  return (
    <AccordionSection
      title="Modality"
      color="#4FC1E8"
      //description=""
    >
      <div style={{height:'360px'}}>
        <BodyComponent
          parts={props.facetList.modality}
          defaultState="any"
          form_change_handler={modality_change_handler}
        />
      </div>
    </AccordionSection>
  );
}

/**
 * parent props:
 *  - postureStates
 */
function FacetPosture(props) {
  return (
    <AccordionSection
      title="Posture"
      color="#AC92EB"
      //description=""
    >
      TODO: Posture section
    </AccordionSection>
  );
}

function FacetSpectators(props) {
  return (
    <AccordionSection
      title="Spectators"
      color="#FFCE54"
      //description=""
    >
      TODO: Spectators section
    </AccordionSection>
  );
}

function FacetDemongraphic(props) {
  return (
    <AccordionSection
      title="Demongraphic"
      color="#ED5564"
      //description=""
    >
      TODO: Demongraphic section
    </AccordionSection>
  );
}