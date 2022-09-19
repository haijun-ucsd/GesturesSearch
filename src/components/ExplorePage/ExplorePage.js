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
import { labels_data } from "../labels_data.js";



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
			if (removable){
				// Remove.
				console.log("label exists, remove."); //DEBUG
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

			// Special case: Location, no module in facet.
			if (! (isLocation || category==="location")) {
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
		} else if (category === "location" || subcategory === "social_role") {}
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
	const [searchbarRecommendations, setSearchbarRecommendations] = useState(LabelStructure_category_only); // recommended labels for selection in the dropdown menu

	// DEBUG
	useEffect(() => { console.log("searchText: '", searchText); }, [searchText]);
	useEffect(() => { console.log("highlightOptions: '", highlightOptions); }, [highlightOptions]);
	useEffect(() => { console.log("searchbarDefaultResults: '", searchbarDefaultResults); }, [searchbarDefaultResults]);
	useEffect(() => { console.log("searchbarRecommendations: '", searchbarRecommendations); }, [searchbarRecommendations]);

	// Fetch existing labels dynamically. //TODO: make sure existingLabelList is indeed dynamically updated.
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

	// Ideal length of recommended labels.
	const recommendationMaxLength = 3;

	// Update searchbar details whenever searchText changes.
	useEffect(() => { handle_searchbar_input(); }, [searchText, props.filterList]);

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
		console.log("inputArr: ", inputArr); //DEBUG

		// Check for empty array.
		if (searchText==="" || inputArrLength === 0) { return; }

		/**
		 * inputWithCategory
		 * Helper variable to store input strings that need to be highlighted by category.
		 * Structure of inputWithCategory: [ [ <exact string>, <category> ], [...] ]
		 */
		let inputWithCategory = [];

		/**
		 * recommendations
		 * Helper variable to store all recommendations for the current input.
		 * Same structure as searchbarRecommendations.
		 */
		let recommendations = { ...LabelStructure_category_only };

		/**
		 * fuzzy_search
		 * Helper function to search a word or term within a certain range.
		 */
		const fuzzy_search = (term, range) => {
			range = Object.keys(range).map(label => label); //TODO: This line is an extra step when using the "labels" folder. Delete this line after switching to "reviewed_labels" folder!
			const fuzzy_search_helper = new Fuse(range, fuse_options);
			let all_fuzzy_search_outcome = fuzzy_search_helper.search(term);
			if (all_fuzzy_search_outcome.length > 0) { console.log("fuzzy_search() for term '" + term + "' within search range: ", range, " results in: ", all_fuzzy_search_outcome); } //DEBUG
			return all_fuzzy_search_outcome;
		}

		// Search over all words in inputArr and categorize the found labels into inputWithCategory.
		// TODO: Add function to search multi-word terms.
		for (let [inputArrIdx, inputArrSingleWord] of inputArr.entries()) { // get index
			console.log("Performing search on word '" + inputArrSingleWord + "' at idx " + inputArrIdx + ".");

			/**
			 * result
			 * Helper variables to store default search results for the current word.
			 * Will select the closest-relevant result in the end.
			 * Structure: [ { item, refIndex, score, category, subcategory }, {...} ]
			 */
			let result = [];

			/**
			 * update_result
			 * Helper function to update result and append to searchbarRecommendations if necessary.
			 * If called, search_outcome.length must >0.
			 */
			const update_result = (search_outcome, category, subcategory) => {

				// Append category and subcategory values to each search_outcome item.
				for (let i = 0; i < search_outcome.length; i++) {
					search_outcome[i] = {
						...search_outcome[i],
						category: category,
						subcategory: subcategory,
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

			// Search through all possible categories.
			for (let category in existingLabelList) {

				// Special case: Posture, no subcategory.
				if (category === "posture") {

					// Perform fuzzy search on the current word within the current category.
					let search_outcome = fuzzy_search(
						inputArrSingleWord,
						existingLabelList[category],
					);

					// If any match is found, update default search result list and recommendations.
					if (search_outcome.length > 0) {
						update_result(search_outcome, "posture", "posture");
					}
				}

				// Default case.
				else {
					for (let subcategory in existingLabelList[category]) {

						// Fuzzy search within the current subcategory.
						let search_outcome = fuzzy_search(
							inputArrSingleWord,
							existingLabelList[category][subcategory],
						);

						// Again, if any match is found, update default search result list and recommendations.
						if (search_outcome.length > 0) {
							update_result(search_outcome, category, subcategory);
						}
					}
				}
			}

			// Check for existence of result.
			if (result.length < 1) { continue; }

			// Sort results from all subcategories by their degree of relevance.
			result.sort((a, b) => (a.score - b.score));
			console.log("Cross-category results after sorting: ", result); //DEBUG

			// Update inputWithCategory using the category of the most-relevant result item.
			inputWithCategory.push([inputArrSingleWord, result[0].category]);

			// Update searchbarDefaultResults according to the final result.
			setSearchbarDefaultResults(prev => [ ...prev, result[0] ]);


			// if (fuseSite.search(inputArrSingleWord).length !== 0) {
			// 	result.push(...fuseSite.search(inputArrSingleWord));
			// }
			// if (fuseArchi.search(inputArrSingleWord).length !== 0) {
			// 	result.push(...fuseArchi.search(inputArrSingleWord));
			// }
			// if (fuseIn_outdoor.search(inputArrSingleWord).length !== 0) {
			// 	result.push(...fuseIn_outdoor.search(inputArrSingleWord));
			// }
			// if (fuseSex.search(inputArrSingleWord).length !== 0) {
			// 	result.push(...fuseSex.search(inputArrSingleWord));
			// }
			// if (fuseAge.search(inputArrSingleWord).length !== 0) {
			// 	result.push(...fuseAge.search(inputArrSingleWord));
			// }
			// if (fuseRole.search(inputArrSingleWord).length !== 0) {
			// 	result.push(...fuseRole.search(inputArrSingleWord));
			// }
			// if (fusePosture.search(inputArrSingleWord).length !== 0) {
			// 	result.push(...fusePosture.search(inputArrSingleWord));
			// }
			// if (fuseQuantity.search(inputArrSingleWord).length !== 0) {
			// 	result.push(...fuseQuantity.search(inputArrSingleWord));
			// }
			// if (fuseDensity.search(inputArrSingleWord).length !== 0) {
			// 	result.push(...fuseDensity.search(inputArrSingleWord));
			// }
			// result.sort(function(a, b){
			// 	return a.score - b.score;
			// });
			// console.log("result after splitting and sorting: ", result); //DEBUG TODO:sorting???
			// //TODO: Mark the category of each result and change filter directly
			// if(result.length !== 0){
			// 	if (allPostures.includes(result[0].item) && !props.filterList.includes(result[0].item)) {
			// 		filter_change_handler(result[0].item, 0, "posture", "posture", postureColor, false);
			// 	} else if (allSites.includes(result[0].item) && !props.filterList.includes(result[0].item)) {
			// 		filter_change_handler(result[0].item, 0, "location", "site", locationColor, false, true);
			// 	} else if (allArchi_compo.includes(result[0].item) && !props.filterList.includes(result[0].item)) {
			// 		filter_change_handler(result[0].item, 0, "location", "archi_compo", locationColor, false, true);
			// 	} else if (allIn_outdoor.includes(result[0].item) && !props.filterList.includes(result[0].item)) {
			// 		filter_change_handler(result[0].item, 0, "location", "in_outdoor", locationColor, false, true);
			// 	} else if (allSex.includes(result[0].item) && !props.filterList.includes(result[0].item)) {
			// 		filter_change_handler(result[0].item, 0, "demographic", "sex", demographicColor, false);
			// 	} else if (allAge.includes(result[0].item) && !props.filterList.includes(result[0].item)) {
			// 		filter_change_handler(result[0].item, 0, "demographic", "age", demographicColor, false);
			// 	} else if (allRoles.includes(result[0].item) && !props.filterList.includes(result[0].item)) {
			// 		filter_change_handler(result[0].item, 0, "demographic", "social_role", demographicColor, false, true);
			// 	} else if (allQuantities.includes(result[0].item) && !props.filterList.includes(result[0].item)) {
			// 		filter_change_handler("spectators quantity: " + result[0].item, 0, "spectators", "quantity", spectatorColor, false);
			// 	} else if (allDensities.includes(result[0].item) && !props.filterList.includes(result[0].item)) {
			// 		filter_change_handler("spectators density: " + result[0].item, 0, "spectators", "density", spectatorColor, false);
			// 	}
			// }
			// props.filterList.push(result[0].item);
			// console.log("RESULT: ", result);
		}

		// Update searchbar highlights according to inputWithCategory.
		// Structure of inputWithCategory is: [ [ <exact string>, <category> ], [...] ]
		console.log("inputWithCategory : ", inputWithCategory); //DEBUG
		setHighlightOptions([
			...(inputWithCategory.map(item => {
				const exactstring = item[0];
				const classname = "SearchBar_highlighter SearchBar_highlighter_" + item[1]/*category*/;
				return ({
					highlight: exactstring,
					className: classname
				});
			}))
		]);

		// Sort and trim recommendations to the ideal length.
		let newSearchbarRecommendations = recommendations; // take a snapshot
		Object.entries(newSearchbarRecommendations).map(([category, recs]) => {
			recs.sort((a, b) => (a.score - b.score)); // sort
			console.log(recs);
			let uniqueRecs = [];
			for (let i = 0; i < recs.length; i++) { // remove duplicates
				if (! uniqueRecs.some(element => element.item===recs[i].item)) {
					uniqueRecs.push(recs[i]);
					console.log(uniqueRecs);
				}
			}
			if (uniqueRecs.length > recommendationMaxLength) {
				newSearchbarRecommendations[category]
					= uniqueRecs.slice(0, recommendationMaxLength);
			} else {
				newSearchbarRecommendations[category] = uniqueRecs;
			}
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
						console.log("Subfilter List: ", props.filterList.slice(j, i));
						filtered.push(..._.difference(search_helper(props.filterList.slice(j, i)), filtered));
						console.log("Filtering result: ", filtered);
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
				searchbarRecommendations={searchbarRecommendations}
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
