/**
 * ExplorePage.js
 * 
 * This file contains the entry point of the Explore page, which is one of the major tabs.
 * Explore page allow users to search through images in the database using filters of their choice.
 */



import React, { useState, useEffect } from "react";
import { getDatabase, onValue, ref as ref_db, set } from "firebase/database";
import "bootstrap/dist/css/bootstrap.min.css";
import _, { filter, map } from "underscore";
import Fuse from 'fuse.js';
import "../components.css";
import Facet from "./Facet";
import ExploreGallery from "./ExploreGallery";
import ExploreDetails from "./ExploreDetails";
import { FilterStructure, LabelStructure_category_only, FetchLabelList_helper, colors } from "../components";
import { allModality, labels_data } from "../labels_data.js";
import jwt_decode from "jwt-decode";



/**
 * UploadPage
 *
 * hooks stored at App level:
 *	- [filterList, setFilterList]
 *  - [addedPics, setAddedPics]
 *  - [addedPicsUrl, setAddedPicsUrl]
 *  - [formDataList, setFormDataList]
 *  - [completePercentages, setCompletePercentages]
 *  - [addedLabels, setAddedLabels]
 *  - [picAnnotation, setPicAnnotation]
 * 
 * Usage:
 *  A new filter in filterList has the following strcuture:
 *  { label, label_id, category, subcategory, color }
 *
 * TODO: clean up the code to combine the 6 hooks.
 */
export default function ExplorePage(props) {

/**--- Filters from Facet (search & filters) ---**/

	const [facetDisabled, setFacetDisabled] = useState(false);

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
	const filter_change_handler = (label, label_id, category, subcategory, color, removable=true, isLocation=false) => {
		console.log("clicked on filter: " + label); //DEBUG

		// Check for empty.
		if (label == "") { return; }

		// Check for existence.
		// Toggle: if exists, then remove; if doesn't exist, the add.
		if (props.filterList.some(
			(item) => item.label === label
		)) {

			// Remove.
			if (removable){
				console.log("label exists, removable is true, remove."); //DEBUG
				remove_filter(label); // remove from both filterList and facetList
			}
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

			// Update facetList accordingly.
			if (category==="modality") { // Special case: Modality.
				const currFacetList = props.facetList; // snapshot
				const modality_label_str_arr = label.split(" ");
    		const modality_label_last_word = modality_label_str_arr[modality_label_str_arr.length - 1];
    		console.log("HEREHEREHERE!!!", currFacetList, modality_label_str_arr, modality_label_last_word);
				props.setFacetList({
					...currFacetList,
					["modality"]: {
						...currFacetList["modality"],
						[subcategory]: modality_label_last_word
					},
				});
			} else if (isLocation || category==="location") {} // Special case: Location, no module in facet.
			else { // Default case.
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
		}

		// TODO: Update gallery.
		//console.log("adding succeeds, gallery updated."); //DEBUG
	}

	/**
	 * remove_filter
	 *
	 * To specifically remove an applied filter.
	 *
	 * @param label: Value of the element to remove.
	 *
	 * references:
	 *  https://stackoverflow.com/questions/36326612/how-to-delete-an-item-from-state-array
	 *  https://stackoverflow.com/questions/35338961/how-to-remove-the-li-element-on-click-from-the-list-in-reactjs
	 */
	const remove_filter = (label) => {
		let filterToRemove = props.filterList.find((item) => item.label === label);
		let category = filterToRemove.category;
		let subcategory = filterToRemove.subcategory;

		// Reset facetList to update the corresponding facet section.
		// Special case: Modality.
		if (category === "modality") {
			props.setFacetList((prev) => {
				return {
					...prev,
					[category]: {
						...prev[category],
						[subcategory]: "any", // subcategory in Modality = body part
					},
				};
			});
		}

		// Special case: Location, Social role, not existing in Facet.
		else if (category === "location" || subcategory === "social_role") {}

		// Default case.
		else {
			props.setFacetList((prev) => {
				let newSubcategoryList = prev[category][subcategory].filter(
					(item) => item !== label
				);
				console.log("newSubcategoryList: " + newSubcategoryList); //DEBUG
				return {
					...prev,
					[category]: {
						...prev[category],
						[subcategory]: newSubcategoryList,
					},
				};
			});
		}

		// Reset filterList to remove the current filter from AppliedFilter.
		props.setFilterList (prev => {
			let newFilterList = prev.filter((item) => item.label !== label);
			return newFilterList;
		});

		console.log("remove filter: " + label); //DEBUG

		// TODO: Update gallery.
		//console.log("removing succeeds, gallery updated."); //DEBUG
	};


/**--- Gallery (pictures) ---**/

	const [imageList, setImageList] = useState([]); // list of currently shown pictures

	/* Update the gallery upon any change. */
	const update_gallery = () => {
		// listAll(imageListRef).then((response) => {
		//   response.items.forEach((item) => {
		//     getDownloadURL(item).then((url) => {
		//       setImageList((prev) => [...prev, url]);
		//     })
		//   })
		// })
		const db = getDatabase()
		const dbRef = ref_db(db, 'images')
		onValue(dbRef, (snapshot) => {
			const data = snapshot.val();
			let newImgList = [];
			for (const [imgKey, imgData] of Object.entries(data)) {
				newImgList.push([imgKey, imgData]);
			}
			setImageList(newImgList);
		})
	}
	useEffect(() => { update_gallery(); }, [])


/**--- Search ---**/

	const [searchText, setSearchText] = useState(""); // searchbar input, plain text
	const [highlightOptions, setHighlightOptions] = useState([]); // highlight options to use along with HighlightWithinTextarea
	const [searchbarDefaultResults, setSearchbarDefaultResults] = useState([]); // default search data to be accepted and append to filterList, if the user hits ENTER

	const [searchbarRecommendations, setSearchbarRecommendations] = useState(LabelStructure_category_only); // full list of recommended labels according to search input
	const [searchbarDisplayRecs, setSearchbarDisplayRecs] = useState(LabelStructure_category_only); // trimmed list of recommendations to display on the dropdown menu of searchbar

	// DEBUG
	useEffect(() => { console.log("searchText: '", searchText); }, [searchText]);
	useEffect(() => { console.log("highlightOptions: '", highlightOptions); }, [highlightOptions]);
	useEffect(() => { console.log("searchbarDefaultResults: '", searchbarDefaultResults); }, [searchbarDefaultResults]);
	useEffect(() => { console.log("searchbarRecommendations: '", searchbarRecommendations); }, [searchbarRecommendations]);
	useEffect(() => { console.log("searchbarDisplayRecs: '", searchbarDisplayRecs); }, [searchbarDisplayRecs]);

	// Fetch all existing labels in database dynamically. //TODO: make sure existingLabelList is indeed dynamically updated.
	const [existingLabelList, setExistingLabelList] = useState([]);
	useEffect(() => {
		const db = getDatabase();
		const existingLabelsRef = ref_db(db, "labels/"); //TODO: should eventually used "reviewed_labels/" instead of "labels/"
		onValue(existingLabelsRef, (snapshot) => {
			setExistingLabelList(snapshot.val());
			console.log("Existing label list fetched: ", existingLabelList); //DEBUG
		})
	}, []);

	// Use the Fuse.js library to perform fuzzy search.
	const fuse_options = {
		includeScore: true,
		shouldSort: true,
		threshold: 0.2,
		minMatchCharLength: 3
	};

	// Special case: Modality.
	const modality_fuse_options = {
		includeScore: true,
		threshold: 0.3,
		ignoreLocation: true,
		keys: ['text']
	};
	const fuseModality = new Fuse(allModality, modality_fuse_options);

	// Update searchbar details whenever searchText changes.
	useEffect(() => { handle_searchbar_input(); }, [searchText, props.filterList]);

	// Update searchbarDisplayRecs whenever searchbarRecommendations or filterList changes.
	const recommendationMaxLength = 3; // ideal length of recommended labels
	useEffect(() => {
		let newDisplayRecs = LabelStructure_category_only;	// to record the trimmed recommendations
		Object.entries(searchbarRecommendations).map(([category, recs]) => {
			if (recs.length <= 0) { return; } // skip empty categories
			let count = 0;	// to count the number of recommended labels
			for (let i = 0; i < recs.length; i++) {
				if (! props.filterList.some(element => element.label===recs[i].item)) { // if not selected yet
					newDisplayRecs = {
						...newDisplayRecs,
						[category]: [
							...newDisplayRecs[category],
							recs[i]
						],
					} // record the index of this valid recommendation
					count++;	// increment count
				}
				if (count >= recommendationMaxLength) { break; } // control the max number of recommendations under each category
			}
		})
		setSearchbarDisplayRecs(newDisplayRecs);
	}, [searchbarRecommendations, props.filterList]);

	/**
	 * handle_searchbar_input
	 * 
	 * To handle inputs to ExploreSearch, identify their categories, highlight, and offer recommendations.
	 * This function runs whenever searchText changes.
	 * 
	 * Usage:
	 *	Each identified filter should have the following structure for consistency:
	 *	{ label, label_id, category, subcategory, color }
	 * 
	 * references:
	 *	https://medium.com/@uigalaxy7/how-to-render-html-in-react-7f3c73f5cafc
	 *	https://stackoverflow.com/questions/65136866/sort-array-but-values-of-nested-arrays
	 *	https://stackoverflow.com/questions/49600799/react-native-for-loop-getting-index
	 */
	const handle_searchbar_input = () => {

		// Upon hitting ENTER, exit handle_searchbar_input() and perform handle_searchbar_accept_default().
		// This function has to be triggerred here because HighlightWithinTextarea seems not detecting key event.
		if (searchText.indexOf("\n") !== -1) { // searchText contains line break = ENTER
			handle_searchbar_accept_default();
			return;
		}

		console.log('search input:', searchText); //DEBUG

		// Clear searchbarDefaultResults and setSearchbarRecommendations before re-appending towards the end of this function.
		setSearchbarDefaultResults([]);
		setSearchbarRecommendations(LabelStructure_category_only);

		// Take a snapshot of the current search input and split it into an array of words.
		const inputArr = searchText.split(' ').map(item => item.trim());
		const inputArrLength = inputArr.length;
		let maskArr = [...inputArr]; // an mutable mask-indicator array that corresponds to inputArr
		console.log("inputArr: ", inputArr); //DEBUG

		// Check for empty array.
		if (searchText==="" || inputArrLength === 0) { return; }

		/**
		 * inputByCategory
		 * Helper variable to store input strings that need to be highlighted by category.
		 * Structure of inputByCategory: [ [ <starting char idx>, <ending char idx>, <category> ], [...] ]
		 */
		let inputByCategory = [];

		/**
		 * recommendations
		 * Helper variable to store all recommendations for the current input.
		 * Same structure as searchbarRecommendations.
		 */
		let recommendations = { ...LabelStructure_category_only };

		/**
		 * fuzzy_search()
		 * 
		 * Helper function to search a word or term within a certain range.
		 */
		const fuzzy_search = (term, range) => {
			range = Object.keys(range).map(label => label); //TODO: This line is an extra step when using the "labels" folder. Delete this line after switching to "reviewed_labels" folder!
			const fuzzy_search_helper = new Fuse(range, fuse_options);
			let all_fuzzy_search_outcome = fuzzy_search_helper.search(term);
			if (all_fuzzy_search_outcome.length > 0) { console.log("fuzzy_search() for term '" + term + "' within search range: ", range, " results in: ", all_fuzzy_search_outcome); } //DEBUG
			return all_fuzzy_search_outcome;
		}

		// Search over all words in inputArr and categorize the found labels into inputByCategory.
		for (let inputArrIdx = 0; inputArrIdx < inputArrLength; inputArrIdx++) { // for each index in inputArr
			console.log("Performing search on word '" + inputArr[inputArrIdx] + "' at idx " + inputArrIdx + ".");

			/**
			 * result
			 * Helper variables to store default search results for the current word.
			 * Will select the closest-relevant result in the end.
			 * Structure: [ { item, refIndex, score, category, subcategory }, {...} ]
			 */
			let result = [];

			/**
			 * search_in_all_categories()
			 * 
			 * Helper function to search a phrase in all categories other than Modality, and update result array if necessary.
			 * 
			 * @return boolean: True if some search_outcome is found; False if no search_outcome found.
			 */
			const search_in_all_categories = (phrase) => {
				let search_succeeds_flag = false;

				for (let category in existingLabelList) {

					// Special case: Posture, no subcategory.
					if (category === "posture") {

						// Perform fuzzy search on the current word within the current category.
						let search_outcome = fuzzy_search(
							phrase,
							existingLabelList["posture"],
						);

						// If any match is found, update default search result list and recommendations.
						if (search_outcome.length > 0) {
							search_succeeds_flag = true;
							update_result(search_outcome, "posture", "posture", phrase.split(" ").length);
						}
					}

					// Default case.
					else {
						for (let subcategory in existingLabelList[category]) {

							// Fuzzy search within the current subcategory.
							let search_outcome = fuzzy_search(
								phrase,
								existingLabelList[category][subcategory],
							);

							// Again, if any match is found, update default search result list and recommendations.
							if (search_outcome.length > 0) {
								search_succeeds_flag = true;
								update_result(search_outcome, category, subcategory, phrase.split(" ").length);
							}
						}
					}
				}

				return search_succeeds_flag;
			}

			/**
			 * update_result()
			 * 
			 * Helper function to update the result array according to fuzzy search outcome,
			 * and append to searchbarRecommendations if necessary.
			 * 
			 * If called, search_outcome.length must >0.
			 */
			const update_result = (search_outcome, category, subcategory, gram) => {

				// Append category and subcategory values to each search_outcome item.
				for (let i = 0; i < search_outcome.length; i++) {

					// Special case: Modality, structure of search_outcome is different.
					if (category === "modality") {
						//modality_search_outcome[0]['item']['text'].split(' ').slice(1).join(' '));
						search_outcome[i] = {
							item: search_outcome[i]['item']['displaytext'],
							refIndex: search_outcome[i]['refIndex'],
							score: search_outcome[i]['score'],
							category: category,
							subcategory: search_outcome[i]['item']['bodypart'],
							gram: gram,
						}
					}

					// Default case.
					else {
						search_outcome[i] = {
							...search_outcome[i],
							category: category,
							subcategory: subcategory,
							gram: gram,
						}
					}
				}

				// Use search_outcome[0] as default search result.
				const top_search_outcome = search_outcome[0];
				if (! (
					props.filterList.some(filter => filter.label === top_search_outcome.item)
					|| result.some(element => element.item === top_search_outcome.item)
				)) {
					result.push(top_search_outcome);
				}

				// Push into searchbarRecommendations if >1 results are found.
				//search_outcome = search_outcome.slice(1); // can use this line to trim off first element if found necessary
				if (search_outcome.length > 0) { // if more elements exist
					console.log("Exists more search_outcome other than the top one: ", search_outcome); //DEBUG
					let newCategoryRecommendations = [
						...recommendations[category],
						...search_outcome
					];
					recommendations[category] = newCategoryRecommendations;
				}
			}

			// Search by 3-gram phrase in category: Modality.
			if (inputArrIdx < inputArrLength - 2
				&& maskArr[inputArrIdx] !== null
				&& maskArr[inputArrIdx+1] !== null
				&& maskArr[inputArrIdx+2] !== null
			) {
				const phrase = inputArr[inputArrIdx] + ' ' + inputArr[inputArrIdx+1] + ' ' + inputArr[inputArrIdx+2];
				let modality_search_outcome = fuseModality.search(phrase);
				if (modality_search_outcome.length > 0) {
					console.log("Recognized modality phrase '", phrase, "': ", modality_search_outcome); //DEBUG
					update_result(modality_search_outcome, "modality", undefined, 3);
					maskArr.splice(inputArrIdx, 3, null, null, null);
						 // mask the checked 3 indices, so they won't be searched again during the 2-gram and single-word rounds
				}
			}

			// Search by 2-gram phrase in all categories.
			if (inputArrIdx < inputArrLength - 1
				&& maskArr[inputArrIdx] !== null
				&& maskArr[inputArrIdx+1] !== null
			) {
				const phrase = inputArr[inputArrIdx] + ' ' + inputArr[inputArrIdx+1];
				const all_categories_search_succeeds = search_in_all_categories(phrase);
				let modality_search_outcome = fuseModality.search(phrase);
				if (modality_search_outcome.length > 0) {
					console.log("Recognized modality phrase '", phrase, "': ", modality_search_outcome); //DEBUG
					update_result(modality_search_outcome, "modality", undefined, 2);
				}
				if (all_categories_search_succeeds == true || modality_search_outcome.length > 0) {
					maskArr.splice(inputArrIdx, 2, null, null); // mask the checked 2 indices
				}
			}

			// Search by single words in all categories other than Modality.
			if (maskArr[inputArrIdx] !== null) {
				search_in_all_categories(inputArr[inputArrIdx]);
			}

			// Check for existence of result.
			if (result.length < 1) { continue; }

			// Sort results from all subcategories by their degree of relevance.
			result.sort((a, b) => (a.score - b.score));
			console.log("Cross-category results after sorting: ", result); //DEBUG

			// Update inputByCategory using the category of the most-relevant result item.
			const highlight_category = result[0].category;
			let highlight_start_idx = 0;
			for (let i = 0; i < inputArrIdx; i++) {
				highlight_start_idx += (inputArr[i].length + 1); // white space // TODO: multiple white space?
			}
			let highlight_end_idx = highlight_start_idx;
			for (let i = 0; i < result[0]['gram']; i++) {
				highlight_end_idx += inputArr[inputArrIdx+i].length;
				if (i < result[0]['gram']-1) {
					highlight_end_idx += 1; // white space
				}
			}
			inputByCategory.push([highlight_start_idx, highlight_end_idx, result[0].category]);

			// Update searchbarDefaultResults according to the final result.
			setSearchbarDefaultResults(prev => [ ...prev, result[0] ]);

		}

		// Update searchbar highlights according to inputByCategory.
		// Structure of inputByCategory is: [ [ <starting char idx>, <ending char idx>, <category> ], [...] ]
		console.log("inputByCategory : ", inputByCategory); //DEBUG
		setHighlightOptions([
			...(inputByCategory.map(item => {
				const classname = "SearchBar_highlighter SearchBar_highlighter_" + item[2]/*category*/;
				return ({
					highlight: [item[0], item[1]],
					className: classname
				});
			}))
		]);

		// Sort and store recommendations.
		let newSearchbarRecommendations = recommendations; // take a snapshot
		Object.entries(newSearchbarRecommendations).map(([category, recs]) => {
			recs.sort((a, b) => (a.score - b.score)); // sort
			let uniqueRecs = [];
			for (let i = 0; i < recs.length; i++) { // remove duplicates
				if (! uniqueRecs.some(element => element.item===recs[i].item)) {
					uniqueRecs.push(recs[i]);
				}
			}
			newSearchbarRecommendations[category] = uniqueRecs;
		});
		setSearchbarRecommendations(newSearchbarRecommendations);
	}

	function handle_searchbar_accept_default() {

		// Take a snapshot of searchbarDefaultResults.
		const currSearchbarDefaultResults = searchbarDefaultResults;
		console.log("Current searchbarDefaultResults when calling handle_searchbar_accept_default(): ", currSearchbarDefaultResults); //DEBUG

		// Add to filterList and update facetList.
		for (let element of currSearchbarDefaultResults) {
			if (element.category === "location") {
				filter_change_handler(element.item, 0, element.category, element.subcategory, colors[element.category], false, true);
			} else if (element.category === "spectators") {
				filter_change_handler("spectators "+element.subcategory+": "+element.item, 0, element.category, element.subcategory, colors[element.category], false);
			} else { // default
				filter_change_handler(element.item, 0, element.category, element.subcategory, colors[element.category], false);
			}
		}

		// Clear all dynamic fields.
		setSearchText("");
		setHighlightOptions([]);
		setSearchbarDefaultResults([]);
		setSearchbarRecommendations(LabelStructure_category_only);
	}

	function search_helper (subFilterList) {
		const db = getDatabase()
		const dbRef = ref_db(db, 'images');
		let filtered = [];
		var matchDict = {};
		onValue(dbRef, (snapshot) => {
			const data = snapshot.val();
			for (const [imgKey, labels] of Object.entries(data)) {
				for (const facetLabel of subFilterList) {
					switch (facetLabel.category) {
						case 'posture':
							if (labels.posture !== undefined && String(labels.posture).includes(facetLabel.label)) {
								matchDict[imgKey] = (matchDict[imgKey] === undefined) ? true : (true && matchDict[imgKey]);
							} else {matchDict[imgKey] = (matchDict[imgKey] === undefined) ? false : false && matchDict[imgKey];}
							break;
						case 'demographic':
							if (facetLabel.subcategory === "age") {
								if (labels.demographic.age !== undefined && labels.demographic.age === facetLabel.label) {
									matchDict[imgKey] = (matchDict[imgKey] === undefined) ? true : (true && matchDict[imgKey]);
								} else {matchDict[imgKey] = (matchDict[imgKey] === undefined) ? false : false && matchDict[imgKey];}
							} else if (facetLabel.subcategory === "sex") {
								if (labels.demographic.sex !== undefined && labels.demographic.sex === facetLabel.label) {
									matchDict[imgKey] = (matchDict[imgKey] === undefined) ? true : (true && matchDict[imgKey]);
								} else {matchDict[imgKey] = (matchDict[imgKey] === undefined) ? false : false && matchDict[imgKey];}
							} else {
								if (String(labels.demographic.social_role).includes(facetLabel.label)) {
									matchDict[imgKey] = (matchDict[imgKey] === undefined) ? true : (true && matchDict[imgKey]);
								} else {matchDict[imgKey] = (matchDict[imgKey] === undefined) ? false : false && matchDict[imgKey];}
							}
							break;
						case 'modality':
							var avail = facetLabel.label.split(' ')[facetLabel.label.split(' ').length - 1];
							if (labels.modality[facetLabel.subcategory] === Boolean(avail === 'available')) {
								matchDict[imgKey] = (matchDict[imgKey] === undefined) ? true : (true && matchDict[imgKey]);
							} else {matchDict[imgKey] = (matchDict[imgKey] === undefined) ? false : false && matchDict[imgKey];}
							break;
						case 'spectators':
							var value = facetLabel.label.split(' ')[2];
							if (facetLabel.subcategory === "quantity") {
								if (labels.spectators.quantity === value) {
									matchDict[imgKey] = (matchDict[imgKey] === undefined) ? true : (true && matchDict[imgKey]);
								} else {matchDict[imgKey] = (matchDict[imgKey] === undefined) ? false : false && matchDict[imgKey];}
							} else if (facetLabel.subcategory === "density") {
								if (labels.spectators.density === value) {
									matchDict[imgKey] = (matchDict[imgKey] === undefined) ? true : (true && matchDict[imgKey]);
								} else {matchDict[imgKey] = (matchDict[imgKey] === undefined) ? false : false && matchDict[imgKey];}
							} else {
								if (labels.spectators.attentive === value) {
									matchDict[imgKey] = (matchDict[imgKey] === undefined) ? true : (true && matchDict[imgKey]);
								} else {matchDict[imgKey] = (matchDict[imgKey] === undefined) ? false : false && matchDict[imgKey];}
							}
							break;
						case 'location':
							if (facetLabel.subcategory === "site") {
								if (String(labels.location.site).includes(facetLabel.label)) {
									matchDict[imgKey] = (matchDict[imgKey] === undefined) ? true : (true && matchDict[imgKey]);
								} else {matchDict[imgKey] = (matchDict[imgKey] === undefined) ? false : false && matchDict[imgKey];}
							} else if (facetLabel.subcategory === "archi_compo") {
								if (String(labels.location.archi_compo).includes(facetLabel.label)) {
									matchDict[imgKey] = (matchDict[imgKey] === undefined) ? true : (true && matchDict[imgKey]);
								} else {matchDict[imgKey] = (matchDict[imgKey] === undefined) ? false : false && matchDict[imgKey];}
							} else {
								if (labels.location.in_outdoor === facetLabel.label) {
									matchDict[imgKey] = (matchDict[imgKey] === undefined) ? true : (true && matchDict[imgKey]);
								} else {matchDict[imgKey] = (matchDict[imgKey] === undefined) ? false : false && matchDict[imgKey];}
							}
							break;
						default:
					}
				}
				if (matchDict[imgKey] === true) {
					filtered.push([imgKey, labels]);
				}
			}
		})

		return filtered;
	}

	/**
	 * Handle search data from both searchbar and facet.
	 * Any change in AppliedFilters should update the fetched image set.
	 */
	const handle_search = () => {
		const db = getDatabase()
		const dbRef = ref_db(db, 'images');
		onValue(dbRef, (snapshot) => {
			const data = snapshot.val();
			let filtered = [];
			//match labels in searchbar query
			if (props.filterList[0] === undefined) {
				for (const [imgKey, labels] of Object.entries(data)) {
					filtered.push([imgKey, labels]);
				}
			} else {
				// filtered = [...search_helper(props.filterList)];
				for (let j = 0; j < props.filterList.length; j++){
					for (let i = props.filterList.length; i > j; i--) {
						// console.log("Subfilter List: ", props.filterList.slice(j, i));
						filtered.push(..._.difference(search_helper(props.filterList.slice(j, i)), filtered));
						// console.log("Filtering result: ", filtered);
					}
				}
			}
			
			if (filtered.length !== 0) {
				setImageList(_.uniq(filtered, false, function (arr) {return arr[0];}));
			} else if (props.filterList[0] === undefined) {
				console.log('all!');
			} else {
				setImageList(filtered);
			}
		})
	}
	useEffect(() => { handle_search(); }, [props.filterList])


/**--- Click to view details of a picture ---**/

	const [pictureClicked, setPictureClicked] = useState(undefined);
	useEffect(() => { console.log("pictureClicked: ", pictureClicked); }, [pictureClicked]); //DEBUG

	const click_picture = (labelData) => {

		// If the current picture has been clicked twice, then close ExploreDetails.
		if (pictureClicked && labelData.url === pictureClicked.url) {
			setPictureClicked(undefined);
		}

		// Otherwise, open up (or expand) ExploreDetails by setting pictureClicked as the input labelData of the picture being clicked on.
		// Facet panel will be pushed into collapsed state.
		else {
			setPictureClicked(labelData);
		}
	};

	const close_exploredetails = () => {
		setPictureClicked(undefined);
	};


/**--- Render ---**/
	return (
		<div className="PageBox PageBox_Explore">
			<Facet
				facetDisabled={facetDisabled}
				setFilterList={props.setFilterList}
				filterList={props.filterList}
				filter_change_handler={filter_change_handler}
				remove_filter={remove_filter}
				searchText={searchText}
				setSearchText={setSearchText}
				handle_searchbar_input={handle_searchbar_input}
				handle_searchbar_accept_default={handle_searchbar_accept_default}
				highlightOptions={highlightOptions}
				searchbarDisplayRecs={searchbarDisplayRecs}
				facetList={props.facetList}
				setFacetList={props.setFacetList}
			/>
			<ExploreGallery
				imageList={imageList}
				setFilterList={props.setFilterList}
				filterList={props.filterList}
				remove_filter={remove_filter}
				setFacetDisabled={setFacetDisabled}
				click_picture={click_picture}
				pictureClicked={pictureClicked}
			/>
			{pictureClicked !== undefined ? (
				<ExploreDetails
					pictureClicked={pictureClicked}
					close_exploredetails={close_exploredetails}
				/>
			) : null}
		</div>
	);
}
