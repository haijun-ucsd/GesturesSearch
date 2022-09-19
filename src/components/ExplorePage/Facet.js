import React, { useState , useEffect, useLayoutEffect } from 'react';
import { Autocomplete, TextField } from '@mui/material';
//import Slider, { Range } from 'rc-slider';
import HighlightWithinTextarea from "react-highlight-within-textarea"; import 'draft-js/dist/Draft.css';
//import parse from 'html-react-parser';
import '../components.css';
import { labels_data } from "../labels_data.js";
import { Filter, Checkbox, CheckLabel, AccordionSection, FetchLabelList_helper, colors } from '../components';
import BodyComponent from '../BodyComponent';

/* Assets: */
import NoBtn from "../../assets/NoBtn@2x.png";
import SearchBtn from "../../assets/SearchBtn@2x.png";



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
 *	- facetDisabled
 *  - [filterList, setFilterList]
 *	- filter_change_handler (label, label_id, category, subcategory, color): to update appliedFilters according to change in facet.
 *  - remove_filter(): To help remove from filterList.
 *	- [searchText, setSearchText]
 *	- handle_searchbar:
 *			- _input()
 *			- _accept_default()
 *			- _select_recommendation()
 *	- highlightOptions
 *	- searchbarRecommendations
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
				searchText={props.searchText}
				setSearchText={props.setSearchText}
				handle_searchbar_input={props.handle_searchbar_input}
				handle_searchbar_accept_default={props.handle_searchbar_accept_default}
				highlightOptions={props.highlightOptions}
				searchbarRecommendations={props.searchbarRecommendations}
			/>
			<div className="Facet">
				<FacetModality
					facetList={props.facetList}
					setFacetList={props.setFacetList} // will only set "modality"
					setFilterList={props.setFilterList}
					remove_filter={props.remove_filter}
				/>
				<FacetPosture
					facetList={props.facetList}
					filter_change_handler={props.filter_change_handler}
				/>
				<FacetSpectators
					facetList={props.facetList}
					filter_change_handler={props.filter_change_handler}
				/>
				<FacetDemongraphic
					facetList={props.facetList}
					filter_change_handler={props.filter_change_handler}
				/>
			</div>
			{props.facetDisabled ?
				<div className="FacetOverlay"/>
			: null }
		</div>
	);
}

/**
 * ExploreSearch
 * 
 * parent props:
 *	- filter_change_handler()
 *	- [searchText, setSearchText]
 *	- handle_searchbar_input()
 *	- handle_searchbar_accept_default()
 *	- highlightOptions
 *	- searchbarRecommendations
 * 
 * references:
 *  https://stackoverflow.com/questions/59016030/css-flexbox-or-grid-2-columns-row-wrapping-no-growth-inner-margins
 *  https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns
 *  https://bobbyhadz.com/blog/react-capitalize-first-letter#:~:text=To%20capitalize%20the%20first%20letter%20of%20a%20string%20in%20React%3A&text=Call%20the%20toUpperCase()%20method,the%20rest%20of%20the%20string.
 *  https://stackoverflow.com/questions/45277306/check-if-item-exists-in-array-react
 *	https://stackoverflow.com/questions/12875911/how-can-i-make-my-input-type-submit-an-image
 *	https://bobbyhadz.com/blog/react-get-input-value-on-button-click
 *	https://stackoverflow.com/questions/31272207/to-call-onchange-event-after-pressing-enter-key
 *	https://www.w3schools.com/tags/att_global_contenteditable.asp
 *	https://stackoverflow.com/questions/3593626/get-the-text-content-from-a-contenteditable-div-through-javascript
 *	https://www.npmjs.com/package/react-highlight-within-textarea
 *	https://github.com/facebook/draft-js/issues/403
 */
function ExploreSearch(props) {

	const [resultsExpanded, setResultsExpanded] = useState(false);
	useEffect(() => {
		let no_recs_flag = true;
		Object.entries(props.searchbarRecommendations).map(([category, recs]) => {
			if (recs.length > 0) {
				console.log("Exists some searchbarRecommendations."); //DEBUG
				setResultsExpanded(true);
				no_recs_flag = false;
			}
		});
		if (no_recs_flag==true) { // if props.searchbarRecommendations is completely empty
			setResultsExpanded(false);
		}
	}, [props.searchbarRecommendations]);

	/* Render */
	return (
		<div className="Module ExploreSearchSection">
			<div className="SearchBar_container">
				<div className="SearchBar">

					{/* Input bar for search. */}
					<div className="SearchBarInput_container">
						<div
							className="SearchBarInput"
							id={props.id} name={props.id}
						>
							<HighlightWithinTextarea
								placeholder="eg. student sitting in library"
								value={props.searchText}
								highlight={props.highlightOptions}
								onChange={(value) => {
									props.setSearchText(value);
								}}
								/*onKeyDown={(e) => {	// pressing ENTER == clicking search icon
									if (e.key==='Enter') {
										props.handle_searchbar_accept_default();
									}
								}}*/ //onKeyDown not working within HighlightWithinTextarea
							/>
						</div>
						{props.searchText.length > 0 ?
							<img
								srcSet={NoBtn+" 2x"}
								className="SearchBar_clearbtn Btn"
								onClick={(e) => { // clear input field
									e.preventDefault();
									props.setSearchText('');
								}}
							/>
						: null }
						<img
							srcSet={SearchBtn+" 2x"}	// <input type="image"> defines an image as a submit button
							className="SearchBar_searchbtn Btn"
							onClick={(e) => {
								e.preventDefault();
								props.handle_searchbar_input();
							}}
						/>
					</div>

					{/* Search results by category */
					resultsExpanded ?
						<div className="SearchBar_rec_container"><div className="SearchBarRecommendations HintText">
							<span>
								Press ENTER to accept all above, or select from following:
							</span>
							{Object.entries(props.searchbarRecommendations).map(([category, recs]) => {
								if (recs.length > 0) { // skip empty categories
									return (
										<div className="SearchBarRecommendations_category">
											<span>{category}: </span>
											<div className="LabelList">
												{recs.map((element) =>
													<CheckLabel
														value={element.item}
														color={colors[element.category]}
														onchange_handler={() =>
															props.filter_change_handler(element.item, 0, element.category, element.subcategory, colors[element.category])
														}
													/>
												)}
											</div>
										</div>
									);
								}
							})}
						</div></div>
					: null }
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
					['color']: colors["modality"],
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
					['color']: colors["modality"],
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
			color={colors["modality"]}
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
	const postureColor = colors["posture"];
	return (
		<AccordionSection
			title="Posture"
			color={postureColor}
			icon="CategoryIcon_Posture"
			//description=""
		>
			<div className="LabelList">
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
	const spectatorsColor = colors["spectators"];

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
	const demographicColor = colors["demographic"];
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