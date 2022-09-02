import React, { useState , useEffect, useLayoutEffect } from 'react';
import { Autocomplete, TextField } from '@mui/material';
//import Slider, { Range } from 'rc-slider';
import '../components.css';
import { labels_data } from "../labels_data.js";
import { Filter, Checkbox, CheckLabel, AccordionSection, FetchLabelList_helper } from '../components';
import BodyComponent from '../BodyComponent';

/* Assets: */
import NoBtn from "../../assets/NoBtn.png";
import SearchBtn from "../../assets/SearchBtn.png";



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
 *  - [filterList, setFilterList]
 *	- filter_change_handler (label, label_id, category, subcategory, color): to update appliedFilters according to change in facet.
 *  - remove_filter(): To help remove from filterList.
 *  - [facetList, setFacetList]
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
			props.setSearchRange((prev) => {
				console.log("add category to search range. category added: " + e.target.value); //DEBUG
				return [
					...prev,
					e.target.value,
				];
			});
		} else {

			// Remove category from range.
			props.setSearchRange((prev) => {
				console.log("remove category from search range. category removed: " + e.target.value); //DEBUG
				return prev.filter(
					(item => item!==e.target.value)
				);
			});
		}
	};

	/* Render */
	return (
		<div className="FacetMenu">
			<ExploreSearch
				filter_change_handler={props.filter_change_handler}
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
					filter_change_handler={props.filter_change_handler}
					handleSearch={props.handleSearch}
				/>
				<FacetSpectators
					facetList={props.facetList}
					filter_change_handler={props.filter_change_handler}
					handleSearch={props.handleSearch}
				/>
				<FacetDemongraphic
					facetList={props.facetList}
					filter_change_handler={props.filter_change_handler}
					handleSearch={props.handleSearch}
				/>
			</div>
		</div>
	);
}


/**
 * ExploreSearch
 * 
 * references:
 *  https://stackoverflow.com/questions/59016030/css-flexbox-or-grid-2-columns-row-wrapping-no-growth-inner-margins
 *  https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns
 *  https://bobbyhadz.com/blog/react-capitalize-first-letter#:~:text=To%20capitalize%20the%20first%20letter%20of%20a%20string%20in%20React%3A&text=Call%20the%20toUpperCase()%20method,the%20rest%20of%20the%20string.
 *  https://stackoverflow.com/questions/45277306/check-if-item-exists-in-array-react
 *	https://stackoverflow.com/questions/12875911/how-can-i-make-my-input-type-submit-an-image
 *	https://bobbyhadz.com/blog/react-get-input-value-on-button-click
 *	https://stackoverflow.com/questions/31272207/to-call-onchange-event-after-pressing-enter-key
 */
function ExploreSearch(props) {

	const [searchData, setSearchData] = useState('');

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

	const handleSearch = (input) => {
		setSearchData(input);
	}

	// Examples:
	// TODO: make this not hard-coded
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
		<div className="Module">
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
						onKeyDown={(e) => {	// pressing ENTER == clicking search icon
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
							(params) => <TextField {...params} label="location, demographic, posture...(split with ',')"/>
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
					{searchText.length > 0 ?
						<input
							type="image" src={NoBtn}
							className="SearchBar_clearbtn"
							onClick={(e) => { // clear input field
								e.preventDefault();
								setSearchText('');
								setSubmittedSearchText('');
							}}
						/>
					: null }
					<input
						type="image" src={SearchBtn}	// <input type="image"> defines an image as a submit button
						className="SearchBar_searchbtn"
						onClick={(e) => {
							e.preventDefault();
							setSubmittedSearchText(searchText);
						}}
					/>
				</div>
			</div>
		</div>
	);
}


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