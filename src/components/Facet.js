import React, { useState , useEffect, useLayoutEffect } from 'react';
//import { storage } from '../firebase';
//import { getDatabase, onValue, ref as ref_db, set } from 'firebase/database';
//import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
//import { v4 } from 'uuid';
//import Slider, { Range } from 'rc-slider';
import './components.css';
import { labels_data } from "./labels_data.js";
import { Filter, Checkbox, CheckLabel, ExploreSearchBar, AccordionSection, FetchLabelList_helper } from './components';
import BodyComponent from './BodyComponent';

/* Assets: */
//import ArrowUp_secondary from "../assets/ArrowUp_secondary.png";
//import ArrowDown_secondary from "../assets/ArrowDown_secondary.png";



/**
 * Facet
 *
 * Facet menu for users to search and filter pictures at will on the Explore page.
 * 
 * Structure: ExploreSearch, { Modality, Posture, Spectators, Demongraphic }
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
	 * Special case that doesn't belong to here: Modality → see within FacetModality.
	 * The filter-removing part is located in the parent (ExplorePage) component, function name remove_filter(), because AppliedFilters also call that function.
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
		console.log("clicked on filter: " + label);

		// Check for empty.
		if (label == "") { return; }

		// Check for existence.
		// Toggle: if exists, then remove; if doesn't exist, the add.
		if (props.filterList.some(
			(item) => item.label === label
		)) {

			// Remove.
			console.log("label exists, remove."); //DEBUG
			props.remove_filter(label); // remove from both filterList and facetList
		} else {

			// Add.
			console.log("label doesn't exists yet, add."); //DEBUG
			const newFilter = {
				['label']: label,
				['label_id']: label_id,
				['category']: category,
				['subcategory']: subcategory,
				['color']: color,
			};
			props.setFilterList (prev => ([
				...prev,
				newFilter,
			]));
			props.setFacetList(prev => ({
				...prev,
				[category]: {
					...prev[category],
					[subcategory]: [
						...prev[category][subcategory],
						label,
					]
				},
			}));
		}

		// TODO: Update gallery.
		//console.log("adding succeeds, gallery updated."); //DEBUG
	}

	/* Render */
	return (
		<div className="FacetMenu">
			<ExploreSearch
				range={props.range}
				setRange={props.setRange}
				onchange_handler={range_change_handler}
				filter_change_handler={filter_change_handler}
				handleSearch={props.handleSearch}
			/>
			<div className="Facet">
				<FacetModality
					facetList={props.facetList}
					setFacetList={props.setFacetList} // will only set "modality"
					setFilterList={props.setFilterList}
					remove_filter={props.remove_filter}
					handleSearch={props.handleSearch}
				/>
				<FacetPosture
					facetList={props.facetList}
					filter_change_handler={filter_change_handler}
					handleSearch={props.handleSearch}
				/>
				<FacetSpectators
					facetList={props.facetList}
					filter_change_handler={filter_change_handler}
					handleSearch={props.handleSearch}
				/>
				<FacetDemongraphic
					facetList={props.facetList}
					filter_change_handler={filter_change_handler}
					handleSearch={props.handleSearch}
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

	const [searchData, setSearchData] = useState('');
	const handleSearch = (input) => {
		setSearchData(input);
	}

	return (
		<div className="Module">
			<ExploreSearchBar
				handleSearch={props.handleSearch}
				//search_handler = {...} //TODO: define a search function and use it here, in the SearchBar component this function will be used onClick of the search button.
			/>
			{/* Search in range deleted */}
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
		const bodypart_displaytext =
			labels_data.find((categoryobj) =>
				categoryobj.category === "modality"
			)["subcategories"].find((subcategoryobj) =>
				subcategoryobj.subcategory === bodypart
			).subcategory_displaytext;
		console.log("modality state is changed on body part: " + bodypart); //DEBUG
		let currBodypartState = props.facetList["modality"][bodypart];

		// 1. Modify filterList.
		if (currBodypartState==="any") {

			// any → available
			currBodypartState = "available";
			props.setFilterList (prev => ([
				...prev,
				{
					['label']: bodypart_displaytext + " available",
					['label_id']: 0, // TODO: label_id
					['category']: "modality",
					['subcategory']: bodypart,
					['color']: "#4FC1E8",
				},
			]));
		} else if (currBodypartState==="available") {

			// available → unavailable
			currBodypartState = "unavailable";
			props.setFilterList (prev => {
				let newFilterList = prev.filter(
					(item) => (item.label !== (bodypart_displaytext + " available"))
				);
				return newFilterList;
			});
			props.setFilterList (prev => ([
				...prev,
				{
					['label']: bodypart_displaytext + " unavailable",
					['label_id']: 0, // TODO: label_id
					['category']: "modality",
					['subcategory']: bodypart,
					['color']: "#4FC1E8",
				},
			]));
		} else { // currBodypartState==="unavailable"

			// unavailable → any
			currBodypartState = "any"; // default bodypart state: any
			props.setFilterList (prev => {
				let newFilterList = prev.filter(
					(item) => (item.label !== (bodypart_displaytext + " unavailable"))
				);
				return newFilterList;
			});
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
			icon="CategoryIcon_Modality"
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
 * FacetPosture
 * 
 * Select all == select none.
 * 
 * parent props:
 *  - facetList
 *  - filter_change_handler()
 * 
 * references:
 *  https://stackoverflow.com/questions/21659888/find-and-remove-objects-in-an-array-based-on-a-key-value-in-javascript
 *  https://stackoverflow.com/questions/53114521/react-array-contains-method
 */
function FacetPosture(props) {
	const allPostures = FetchLabelList_helper("posture", undefined);
	const postureColor = "#AC92EB";
	return (
		<AccordionSection
			title="Posture"
			color={postureColor}
			icon="CategoryIcon_Posture"
			//description=""
		>
			<div
				className="LabelList"
			>
				{allPostures.map((label) =>
					<CheckLabel
						value={label}
						color={postureColor}
						checkedState={props.facetList.posture.posture.some(item => item===label)}
						onchange_handler={() => props.filter_change_handler(label, 0, "posture", "posture", postureColor)} // TODO: label_id?
					/>
				)}
			</div>
		</AccordionSection>
	);
}


/**
 * FacetSpectators
 * 
 * Select all == select none.
 * 
 * parent props:
 *  - facetList
 *  - filter_change_handler()
 * 
 * references:
 *  https://slider-react-component.vercel.app/demo/range
 */
function FacetSpectators(props) {

	// Basic
	const allQuantities = ["none", "small", "large"];
	const allDensities = ["none", "sparse", "dense"];
	const allAttentives = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '>8'];
	const spectatorsColor = "#FFCE54";

	// Attentive slider helper
	// const Slider = require('rc-slider');
	// const { createSliderWithTooltip } = Slider;
	// const Range = createSliderWithTooltip(Slider.Range);
	// const [attentiveRange, setAttentiveRange] = useState([0, 9]); // default as full range

	// Render
	return (
		<AccordionSection
			title="Spectators"
			color={spectatorsColor}
			icon="CategoryIcon_Spectators"
			//description=""
		>
			<div className="Subsections">
				<div className="Subsection">
					<div className="SectionHeader">
						<div className="SubsectionName">
							Quantity
						</div>
					</div>
					<div className="Checkbox_spectrum_container">
						{allQuantities.map((item) =>
							<Checkbox
								spectrumBox={true}
								value={item}
								value_displaytext={item}
								defaultChecked={props.facetList.spectators.quantity.some(i => i===("spectators quantity: " + item))}
								checkedState={props.facetList.spectators.quantity.some(i => i===("spectators quantity: " + item))}
								onchange_handler={() => props.filter_change_handler(("spectators quantity: " + item), 0, "spectators", "quantity", spectatorsColor)} // TODO: label_id?
							/>
						)}
					</div>
				</div>
				<div className="Subsection">
					<div className="SectionHeader">
						<div className="SubsectionName">
							Density
						</div>
					</div>
					<div className="Checkbox_spectrum_container">
						{allDensities.map((item) =>
							<Checkbox
								spectrumBox={true}
								value={item}
								value_displaytext={item}
								defaultChecked={props.facetList.spectators.density.some(i => i===("spectators density: " + item))}
								checkedState={props.facetList.spectators.density.some(i => i===("spectators density: " + item))}
								onchange_handler={() => props.filter_change_handler(("spectators density: " + item), 0, "spectators", "density", spectatorsColor)} // TODO: label_id?
							/>
						)}
					</div>
				</div>
				<div className="Subsection">
					<div className="SectionHeader">
						<div className="SubsectionName">
							Attentive
						</div>
					</div>
					<div className="Checkbox_spectrum_container">
						{allAttentives.map((item) =>
							<Checkbox
								spectrumBox={true}
								value={item}
								value_displaytext={item}
								defaultChecked={props.facetList.spectators.attentive.some(i => i===("attentive spectators: " + item))}
								checkedState={props.facetList.spectators.attentive.some(i => i===("attentive spectators: " + item))}
								onchange_handler={() => props.filter_change_handler(("attentive spectators: " + item), 0, "spectators", "attentive", spectatorsColor)} // TODO: label_id?
							/>
						)}
					</div>
					{/*<Range />*/}
					{/*<div class="FacetAttentiveSlider">
						<div class="FacetAttentiveSlider_rail"></div>
						<div class="FacetAttentiveSlider_track rc-slider-track-1"></div>
						<div class="FacetAttentiveSlider_step">
							<span class="FacetAttentiveSlider_dot FacetAttentiveSlider_dot_active">0</span>
							<span class="FacetAttentiveSlider_dot">1</span>
							<span class="FacetAttentiveSlider_dot">2</span>
							<span class="FacetAttentiveSlider_dot">3</span>
							<span class="FacetAttentiveSlider_dot">4</span>
							<span class="FacetAttentiveSlider_dot">5</span>
							<span class="FacetAttentiveSlider_dot">6</span>
							<span class="FacetAttentiveSlider_dot">7</span>
							<span class="FacetAttentiveSlider_dot">8</span>
							<span class="FacetAttentiveSlider_dot FacetAttentiveSlider_dot_active">many</span>
						</div>
						<div
							class="FacetAttentiveSlider_handle rc-slider-handle-1"
							tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100"
							aria-valuenow="20" aria-disabled="false"
						></div>
						<div
							class="FacetAttentiveSlider_handle rc-slider-handle-2"
							tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="100"
							aria-valuenow="40" aria-disabled="false"
						></div>
					</div>*/}
				</div>
			</div>
		</AccordionSection>
	);
}


/**
 * FacetDemongraphic
 * 
 * Select all == select none.
 * 
 * parent props:
 *  - facetList
 *  - filter_change_handler()
 */
function FacetDemongraphic(props) {
	const allAges = ["baby", "child", "teen", "young adult", "adult", "senior"];
	const allSexes = ["male", "female"];
	const demographicColor = "#ED5564";
	return (
		<AccordionSection
			title="Demongraphic"
			color={demographicColor}
			icon="CategoryIcon_Demographic"
			//description=""
		>
			<div className="Subsections">
				<div className="Subsection">
					<div className="SectionHeader">
						<div className="SubsectionName">
							Age
						</div>
					</div>
					<div className="SearchRangeCheckboxes">
						{allAges.map((item) =>
							<Checkbox
								value={item}
								value_displaytext={item}
								defaultChecked={props.facetList.demographic.age.some(i => i===item)}
								checkedState={props.facetList.demographic.age.some(i => i===item)}
								onchange_handler={() => props.filter_change_handler(item, 0, "demographic", "age", demographicColor)} // TODO: label_id?
							/>
						)}
					</div>
				</div>
				<div className="Subsection">
					<div className="SectionHeader">
						<div className="SubsectionName">
							Biological sex
						</div>
					</div>
					<div className="SearchRangeCheckboxes">
						{allSexes.map((item) =>
							<Checkbox
								value={item}
								value_displaytext={item}
								defaultChecked={props.facetList.demographic.sex.some(i => i===item)}
								checkedState={props.facetList.demographic.sex.some(i => i===item)}
								onchange_handler={() => props.filter_change_handler(item, 0, "demographic", "sex", demographicColor)} // TODO: label_id?
							/>
						)}
					</div>
				</div>
			</div>
		</AccordionSection>
	);
}