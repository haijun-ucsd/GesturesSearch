import React, { useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { getDatabase, onValue, ref as ref_db, set, get } from 'firebase/database';
import './components.css';
import { labels_data } from "./labels_data.js";
import { useState , useEffect } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import Fuse from 'fuse.js';
import useResizeAware from 'react-resize-aware';

/* Assets: */
import RemovableLabel_removebtn from "../assets/RemovableLabel_removebtn.png";
import YesBtn from "../assets/YesBtn.png";
import NoBtn from "../assets/NoBtn.png";
import SearchBtn from "../assets/SearchBtn.png";
import ArrowUp_primary from "../assets/ArrowUp_primary.png";
import ArrowDown_primary from "../assets/ArrowDown_primary.png";
import ArrowUp_tiny from "../assets/ArrowUp_tiny.png";
import ArrowDown_tiny from "../assets/ArrowDown_tiny.png";


const db = getDatabase();
/**
 * Label
 *
 * states:
 *	- value: string
 *	- id: int
 *	- category (→ color): string
 *
 * functions:
 *	- click_handler
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
 *	- value: string
 *	- color: string
 *	- onchange_handler()
 *			If checkedState is provided, onchange_handler(), no argument needed;
 *			If not provided, onchange_handler(e, checked, category, subcategory)
 *	- category: category name, to use in onchange_handler
 *	- subcategory: subcategory name, to use in onchange_handler
 *	- defaultChecked: boolean
 *			Optional, no need to provide when checkedState is provided.
 *	- checkedState: boolean
 *			Prioritized over the checked hook if provided.
 *
 * hooks:
 *	- checked: To help toggling the color of CheckLabels upon checking when checkedState is not provided.
 *
 * references:
 *	https://stackoverflow.com/questions/62768262/styling-the-label-of-a-checkbox-when-it-is-checked-with-radium
 *	https://stackoverflow.com/questions/68715629/how-to-style-a-label-when-input-inside-it-is-checked
 */
function CheckLabel(props) {
	const [checked, setChecked]	// whether the current label is checked or not.
		= useState(() => {
			if (props.defaultChecked!==undefined) { // use defaultChecked if exists
				return props.defaultChecked;
			}
			return false; // otherwise default as false
		});
	if (props.checkedState!==undefined) {
		return (
			<label
				className="Label CheckLabel"
				style={{
					cursor:"pointer",
					borderColor: props.checkedState ? props.color : "#CCCCCC",
					backgroundColor: props.checkedState ? props.color+14 : "transparent"	// +14 = 8% opacity
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
	} else {	// when parent did not provide checkedState, use the following as default.
		return (
			<label
				className="Label CheckLabel"
				style={{
					borderColor: checked ? props.color : "#CCCCCC",
					backgroundColor: checked ? props.color+14 : "transparent"	// +14 = 8% opacity
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
						props.onchange_handler(e, !checked, props.category, props.subcategory);	// note: use "!checked" instead of "checked" because check state has not changed yet here
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
 * Usage: AppliedFilters, SearchableDropdown
 *
 * parent props:
 *	- label: string
 *	- color: string
 *	- category: string
 *	- subcategory: string
 *	- remove_filter(): optional one parameter to take in the label name
 * 
 * references:
 *	https://stackoverflow.com/questions/37644265/correct-path-for-img-on-react-js
 */
function RemovableLabel(props) {
	return (
		<div
			className="Label"
			style={{
				borderColor: props.color,
				backgroundColor: props.color+14	// +14 = 8% opacity
			}}
		>
			<div className="LabelText">
				{props.label}
			</div>
			<input
				type="image" src={RemovableLabel_removebtn}
				className="RemovableLabel_removebtn"
				onClick={(e) => {
					e.preventDefault();
					props.remove_filter(props.label);
				}}
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
 *	https://usefulangle.com/post/131/css-select-siblings
 */
function DescriptionHover(props) {
	return (
		<div className="DescriptionHover">
			<div
				className="DescriptionBtn Description_elementtohover"
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
 *	- value: string
 *	- value_displaytext: string
 *	- color: string
 *	- defaultChecked: boolean
 *	- onchange_handler()
 *	- checkedState: boolean, prioritized over the checked hook if provided.
 *	- spectrumBox: boolean, if true, use Checkbox_spectrum class instead of Checkbox.
 * 
 * references:
 *	https://stackoverflow.com/questions/4148499/how-to-style-a-checkbox-using-css
 *	https://stackoverflow.com/questions/13367868/how-to-modify-the-fill-color-of-an-svg-image-when-being-served-as-background-ima
 *	https://stackoverflow.com/questions/19415641/how-to-position-before-after-pseudo-elements-on-top-of-each-other
 *	https://developer.mozilla.org/en-US/docs/Web/CSS/var
 *	https://stackoverflow.com/questions/52005083/how-to-define-css-variables-in-style-attribute-in-react-and-typescript
 */
function Checkbox(props) {
	const [checked, setChecked]	// whether the current checkbox is checked or not.
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
						props.onchange_handler(e, !checked);	// note: use "!checked" instead of "checked" because check state has not changed yet here
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
 * ExploreSearchBar
 * 
 * parent props:
 *	- search_handler(searchText, ...): whatever function to perform at the current search bar.
 *	- searchResults: a list of labels as resulted from the search.
 *	- id: ref, id and name for this search bar, forwarded from parent.
 *
 * hooks:
 *	- [searchText, setSearchText]: to record current input in the search bar
 *	- [submittedSearchText, setSubmittedSearchText]: snapshot of searchText at the time of submission (clicking search btn or pressing ENTER)
 *			TODO: move "submittedSearchText" to a proper parent layer
 * 
 * references:
 *	https://stackoverflow.com/questions/12875911/how-can-i-make-my-input-type-submit-an-image
 *	https://bobbyhadz.com/blog/react-get-input-value-on-button-click
 *	https://stackoverflow.com/questions/31272207/to-call-onchange-event-after-pressing-enter-key
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
	);
}

/**
 * SearchableDropdown
 * 
 * Usage: used in LabelsForm during upload.
 * 
 * parent props:
 *	- selectedLabels: a list of labels selected in this SearchableDropdown.
 *	- id: id to be used for SearchBar.
 *	- color
 *	- category
 *	- subcategory: optional.
 *	- label_change_handler()
 *	- label_remove_handler()
 * 
 * Searchable drop-down in Upload page. Will do:
 *	1. Provide labels according input,
 *	2. Allow for adding new label, especially when no result found.
 * 
 * references:
 *	https://fusejs.io/demo.html
 *	https://stackoverflow.com/questions/39817007/focus-next-input-once-reaching-maxlength-value-in-react-without-jquery-and-accep
 *	https://reactjs.org/docs/forwarding-refs.html
 *	https://stackoverflow.com/questions/42017401/how-to-focus-a-input-field-which-is-located-in-a-child-component
 *	https://stackoverflow.com/questions/58872407/accessing-refs-in-react-functional-component
 *	https://stackoverflow.com/questions/52727021/conditional-inline-style-in-react-js
 *	https://stackoverflow.com/questions/35522220/react-ref-with-focus-doesnt-work-without-settimeout-my-example/35522475#35522475
 *	https://www.geeksforgeeks.org/is-setstate-method-async/#:~:text=setState()%20async%20Issue%3A%20If,debugging%20issues%20in%20your%20code.
 *	https://stackoverflow.com/questions/63364282/react-only-display-items-which-fully-fit-within-flex-box-and-dynamically-deter
 *	https://www.robinwieruch.de/react-custom-hook-check-if-overflow/
 *	https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
 *	https://stackoverflow.com/questions/50431477/react-js-how-to-call-a-method-after-another-method-is-fully-executed
 */
function SearchableDropdown(props) {

	/* UI state */

	// Whether the dropdown is expanded.
	const [expanded, setExpanded] = useState(false);
	// DEBUG
	useEffect(() => {
		console.log("dropdown '" + props.id + "' expanded state is reset: " + expanded);
	}, [expanded]);

	// Jump to focus on search bar while expanding.
	const searchbarRef = useRef();
	const focus_on_searchbar = (() => {
		if (expanded==true) {
			console.log("SearchableDropdown clicked, find corresponding search bar ↓"); console.log(searchbarRef.current); //DEBUG
			searchbarRef.current.focus(); // there is a setFocus() function in the SearchBar component to set focus on the search bar input field
		}
	});
	useEffect(() => {	// cannot put this into onClick of dropdown because setState is asynchronous
		focus_on_searchbar();
	}, [expanded]);

	// Helper to collapse the dropdown and clear the input field.
	const collapse_dropdown = () => {
		setExpanded(false);
		setSearchText('');
	}

	// Collapse dropdown upon clicking outside of this component.
	const dropdownRef = useRef();
	const click_outside_handler = (e) => {
		//e.preventDefault();
		if (
			dropdownRef.current
			&& document.contains(e.target) // need this to avoid unwanted trigger
			&& !dropdownRef.current.contains(e.target)
		) {
			collapse_dropdown();
		}
	}
	useEffect(() => {
		document.addEventListener("click", click_outside_handler);
		return (() => { document.removeEventListener("click", click_outside_handler); }); // unbind eventlistener on clean up
	}, [dropdownRef]);


	/* Content of search */

	const searchRange = FetchLabelList_helper(props.category, props.subcategory);
	const minMatchCharLength = 2; // ignore single character matches. to allow, set to 1
	const fuzzy_search_helper = new Fuse( // use the Fuse.js library to perform fuzzy search
		searchRange,
		{
			isCaseSensitive: false,
			shouldSort: true,
			minMatchCharLength: minMatchCharLength,
			threshold: 0.2, // 0 = perfect match, 1 = match anything
			ignoreLocation: true, // doesn't matter where in the string the pattern appears
			ignoreFieldNorm: true, // doesn't matter how many terms there are, should match whenever the query term exists
		}
	);

	// Real-time search text while typing.
	const [searchText, setSearchText] = useState('');
	useEffect(() => {
		//console.log("searchText is: " + searchText); //DEBUG
		get_search_result(); // get search result dynamically instead of only upon hitting search
	}, [searchText]);

	// Label list that is the result of search.
	// When list is empty yet input >= 2 characters, trigger add_customized_label().
	const [searchResultList, setSearchResultList] = useState([]);

	const get_search_result = () => {
		const submittedSearchText = searchText; // take a snapshot of the current searchText upon submission
		//console.log("search '" + submittedSearchText + "' in range ↓ "); console.log(searchRange); //DEBUG
		const newSearchResult =
			fuzzy_search_helper.search(submittedSearchText) // structure of Fuse result: [{item: "XXX" (label name), refIndex: N (index in searchRange)}, ...]
			.map((item) => item.item );
		console.log("newSearchResult ↓"); console.log(newSearchResult); //DEBUG
		setSearchResultList(newSearchResult);
	}

	const add_customized_label = () => { // trigger when no search result is found
		const newLabel = searchText; // take snapshot of current entered label
		if (!(props.selectedLabels.some(item => item===newLabel))) { // check for existence
			props.label_add_handler(newLabel, props.category, props.subcategory);
			set(ref_db(db, "Label/unreviewed/"+ props.category + props.subcategory), {
				label: newLabel,
			  }); //store the customized label to firebase unreviewed folder
		} else {
			alert("Label '" + newLabel + "'is already selected.");
		}
		setSearchText(''); // clear input field
	}

	const clear_search_input_field = () => {
		setSearchText('');
		setSearchResultList([]);
	}


	/* Render */
	return (
		<div
			className="SearchableDropdown"
			ref={dropdownRef}
		>
			{(expanded==false) ?
				<>
					<input
						className="SearchableDropdown_ecbtn"
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
							setExpanded(true); // this includes focus_on_searchbar() by using useEffect
						}}
					>
						{props.selectedLabels.map((item) =>
							<RemovableLabel
								//key={XX}
								label={item}
								color={props.color}
								category={props.category}
								subcategory={props.subcategory}
								remove_filter={() => props.label_remove_handler(item, props.category, props.subcategory)}
							/>
						)}
					</div>
				</>
			:
				<>
					<input
						className="SearchableDropdown_ecbtn"
						type="image" src={ArrowUp_tiny} 
						onClick={(e) => {
							e.preventDefault();
							collapse_dropdown();
						}}
					/>
					<div
						className="SDSelectedLabelList_expanded"
						onClick={(e) => {
							//e.preventDefault();
							focus_on_searchbar();
						}}
					>
						{props.selectedLabels.map((item) =>
							<RemovableLabel
								//key={XX}
								label={item}
								color={props.color}
								category={props.category}
								subcategory={props.subcategory}
								remove_filter={() => props.label_remove_handler(item, props.category, props.subcategory)}
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
							onKeyDown={(e) => {	// pressing ENTER == clicking search icon
								if (e.key==='Enter') {
									e.preventDefault(); // seems to need this to avoid collpasing
									get_search_result();
								}
							}}
						/>
						{searchText.length > 0 ?
							<input
								type="image" src={NoBtn}
								className="SearchBar_clearbtn"
								onClick={(e) => {
									e.preventDefault();
									clear_search_input_field();
								}}
							/>
						: null }
						<input
							type="image" src={SearchBtn}
							className="SearchBar_searchbtn"
							onClick={(e) => {
								e.preventDefault();
								get_search_result();
							}}
						/>
					</div>
					{searchText.length >= minMatchCharLength ?
						<>{searchResultList.length !== 0 ?
							<div className="LabelList">
								{searchResultList.map((label) => {
									if (!(props.selectedLabels.some(item => item===label))) {
										return (
											<CheckLabel
												value={label}
												color={props.color}
												//key={label.refIndex}
												category={props.category}
												subcategory={props.subcategory}
												onchange_handler={(e, checked, categoryname, subcategoryname) => { // TODO: better way?
													props.label_change_handler(e, checked, categoryname, subcategoryname);
													clear_search_input_field();
												}}
											/>
										);
									}
								})}
							</div>
						:
							<>
								<div className="SearchBar_noresult HintText">
									No existing label found.
								</div>
								<div className="CustomizeLabel_container">
									<div className="CustomizeLabel_hint HintText">
										Save "{searchText}" as customize label?
									</div>
									<btn
										className="Btn_small"
										onClick={(e) => {
											e.preventDefault();
											add_customized_label();
										}}
									>
										<img src={YesBtn} />
									</btn>
								</div>
							</>
						}</>
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
 *	- title: name of the the current section
 *	- color: color of title if not black
 *	- icon: icon for this section
 *	- description: a description for the current section to show upon hovering
 * 
 * references:
 *	https://reactjs.org/docs/composition-vs-inheritance.html
 */
function AccordionSection(props) {
	const [expanded, setExpanded] = useState(true);	// whether the current AccordionSection is expanded, default as true.
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
 * GalleryColumn_helper
 *
 * To help determining number of gallery columns when the Gallery div is resized.
 * @return galleryNumCol
 * 
 * Usage:
 *	- The parent component calling this function should be a gallery, with a size-aware hook:
 *		[GalleryResizeListener, GallerySize(@param)] = useResizeAware();
 *	- This function should be called inside a useEffect:
 *		useEffect(() => GalleryColumn_helper(GallerySize), [GallerySize]);
 *	- This function should be modified together with the "--pic-width" variable in components.css.
 *		Calculation is currently based on the following:
 *			40 = margins on left and right. 24 = gap. 200 = picture width.
 *			∵ GallerySize.width = 40*2 + 24*(x-1) + (200*x)  =>  galleryColNum = Math.floor(x)
 *			∴ galleryColNum = Math.floor((GallerySize.width-56)/224)
 *			Min number of columns is 2.
 *
 * Why is this function here?
 *	Purpose is to be more generalizable, so it is moved here instead of hard-coded under each gallery component.
 *	So this function only needs to be defined once here and can be used in multiple galleries.
 */
const GalleryColumn_helper = (GallerySize) => {
	let newNumCol = Math.floor((GallerySize.width-56)/224);
	if (newNumCol < 2) {
		newNumCol = 2;
	}
	//console.log("GallerySize: [W " + GallerySize.width + ", H " + GallerySize.height + "], NumCol: " + newNumCol); //DEBUG
	return newNumCol;
}


/**
 * FetchLabelList_helper
 * 
 * To help get the list of existing labels under a given path (category + subcategory if appliable) of firebase.
 * 
 * @param category
 * @param subcategory: Optional. If undefined, will look only in the category level.
 * @return label list under labels/category/subcategory.
 */
const FetchLabelList_helper = (category, subcategory) => {
	const db = getDatabase();
	let newLabelList = [];
	let path = "labels/" + category;
	if (subcategory !== undefined) { path = path + "/" + subcategory; }
	const labelsRef = ref_db(db, path);
	onValue(labelsRef, (snapshot) => {
		const labels = snapshot.val();
		for (let label in labels) {
			newLabelList.push(label);
		}
	})
	//console.log("newLabelList fetched ↓ "); console.log(newLabelList); //DEBUG
	return newLabelList;
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
 *	https://medium.com/@alifabdullah/never-confuse-json-and-javascript-object-ever-again-7c32f4c071ad
 */
const LabelStructure = Object.freeze({
	//url: "",
	location: {
		in_outdoor: "",
		site: [],
		archi_compo: [],
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
	timestamp: Math.floor(Date.now() / 1000),
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

export { LabelStructure, FilterStructure, CheckLabel, RemovableLabel, Checkbox, DescriptionHover, ExploreSearchBar, SearchableDropdown, AccordionSection, GalleryColumn_helper, FetchLabelList_helper };