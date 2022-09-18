import React, { useState, useEffect } from "react";
import { getDatabase, onValue, ref as ref_db, set } from "firebase/database";
import "bootstrap/dist/css/bootstrap.min.css";
import "../components.css";
import Facet from "./Facet";
import ExploreGallery from "./ExploreGallery";
import ExploreDetails from "./ExploreDetails";
import { FilterStructure, FetchLabelList_helper } from "../components";
import _, { filter, map } from "underscore";
import Fuse from 'fuse.js';
import { labels_data } from "../labels_data.js";

//export var searchDataCopy = []; //TODO



/**
 * UploadPage
 *
 * hooks stored at App level:
 *  - [addedPics, setAddedPics]
 *  - [addedPicsUrl, setAddedPicsUrl]
 *  - [formDataList, setFormDataList]
 *  - [completePercentages, setCompletePercentages]
 *  - [addedLabels, setAddedLabels]
 *  - [picAnnotation, setPicAnnotation]
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
	const filter_change_handler = (label, label_id, category, subcategory, color, removable=true, location=false) => {
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
			if(category === "modality") {
				const bodypart_displaytext =
					labels_data.find((categoryobj) =>
						categoryobj.category === "modality"
					)["subcategories"].find((subcategoryobj) =>
						subcategoryobj.subcategory === subcategory
					).subcategory_displaytext;

				const newFilter = {
					['label']: bodypart_displaytext + " " + label,
					['label_id']: 0,
					['category']: "modality",
					['subcategory']: subcategory,
					['color']: "#4FC1E8",
				};
				props.setFilterList (prev => ([
					...prev,
					newFilter,
				]));
				props.setFacetList((prev) => ({
					...prev,
					["modality"]: {
						...prev["modality"],
						[subcategory]: label,
					},
				}));
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
				if(!location){
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
	const locationColor = "#A0D568";
	const postureColor = "#AC92EB";
	const demographicColor = "#ED5564";
	const spectatorColor = "#FFCE54";
	const modalityColor = "#4FC1E8";

	const allSites = FetchLabelList_helper("location", "site");
	const allArchi_compo = FetchLabelList_helper("location", "archi_compo");
	const allIn_outdoor = FetchLabelList_helper("location", "in_outdoor");

	const allSex = FetchLabelList_helper("demographic", "sex");
	const allAge = FetchLabelList_helper("demographic", "age");
	const allRoles = FetchLabelList_helper("demographic", "social_role");

	const allPostures = FetchLabelList_helper("posture", undefined);

	const allQuantities = FetchLabelList_helper("spectators", "quantity");
	const allDensities = FetchLabelList_helper("spectators", "density");

	const allModality = [
							{
								"text": "head available",
								"label": "available",
								"bodypart": "head"
							},
							{
								"text": "head unavailable",
								"label": "unavailable",
								"bodypart": "head"
							},
							{
								"text": "eyes available",
								"label": "available",
								"bodypart": "eyes"
							},
							{
								"text": "eyes unavailable",
								"label": "unavailable",
								"bodypart": "eyes"
							},
							{
								"text": "voice available",
								"label": "available",
								"bodypart": "voice"
							},
							{
								"text": "voice unavailable",
								"label": "unavailable",
								"bodypart": "voice"
							},
							{
								"text": "facial expression available",
								"label": "available",
								"bodypart": "facial expression"
							},
							{
								"text": "facial expression unavailable",
								"label": "unavailable",
								"bodypart": "facial expression"
							},
							{
								"text": "right arm available",
								"label": "available",
								"bodypart": "r_arm"
							},
							{
								"text": "right arm unavailable",
								"label": "unavailable",
								"bodypart": "r_arm"
							},
							{
								"text": "left arm available",
								"label": "available",
								"bodypart": "l_arm"
							},
							{
								"text": "left arm unavailable",
								"label": "unavailable",
								"bodypart": "l_arm"
							},
							{
								"text": "right hand available",
								"label": "available",
								"bodypart": "r_hand"
							},
							{
								"text": "right hand unavailable",
								"label": "unavailable",
								"bodypart": "r_hand"
							},
							{
								"text": "left hand available",
								"label": "available",
								"bodypart": "l_hand"
							},
							{
								"text": "left hand unavailable",
								"label": "unavailable",
								"bodypart": "l_hand"
							},
							{
								"text": "leg available",
								"label": "available",
								"bodypart": "legs"
							},
							{
								"text": "leg unavailable",
								"label": "unavailable",
								"bodypart": "legs"
							},
							{
								"text": "feet available",
								"label": "available",
								"bodypart": "feet"
							},
							{
								"text": "feet unavailable",
								"label": "unavailable",
								"bodypart": "feet"
							},
						];

	//fuse.js
	const options = {
		includeScore: true,
		threshold: 0.4,
		ignoreLocation: false,
		minMatchCharLength: 3
	};

	const modalityOptions = {
		includeScore: true,
		threshold: 0.3,
		keys: ['text']
	};

	const fuseSite = new Fuse(allSites, options);
	const fuseArchi = new Fuse(allArchi_compo, options);
	const fuseIn_outdoor = new Fuse(allIn_outdoor, options);

	const fuseSex = new Fuse(allSex, options);
	const fuseAge = new Fuse(allAge, options);
	const fuseRole = new Fuse(allRoles, options);

	const fusePosture = new Fuse(allPostures, options);

	const fuseQuantity = new Fuse(allQuantities, options);
	const fuseDensity = new Fuse(allDensities, options);

	const fuseModality = new Fuse(allModality, modalityOptions);

	// const [searchData, setSearchData] = useState([""]);

	const handle_searchbar = (input) => {
		// console.log('search input:', input);
		
		// setSearchData((prev) => input.split(', ').map(item => item.trim()));
		// console.log("searchData: ", searchData);
		const inputArr = input.split(' ').map(item => item.trim());
		console.log("ALL Postures: ", allPostures);
		console.log("INPUTARR: ", inputArr);
		let existingResult = [];

		//Add searchbar content to applied filters
		if (inputArr.length !== 0) {
			var result = [];
			//Search by words
			for (var i = 0; i < inputArr.length; i++) {
				//Search by 3-gram phrase
				if(i < inputArr.length - 2){
					const phrase = inputArr[i] + ' ' + inputArr[i+1] + ' ' + inputArr[i+2];
					if (fuseModality.search(phrase).length !== 0) {
						result.push(...fuseModality.search(phrase));
						inputArr.splice(i, 1, '-1');
						inputArr.splice(i+1, 1, '-1');
						inputArr.splice(i+2, 1, '-1');

					}
					console.log("3-gram RESULT: ", result, inputArr);
				}
				//Search by 2-gram phrase
				if(i < inputArr.length - 1 && inputArr[i] !== -1){
					const phrase = inputArr[i] + ' ' + inputArr[i+1];
					// if (fuseSite.search(phrase).length !== 0) {
					// 	result.push(...fuseSite.search(phrase));
					// }
					// if (fuseArchi.search(phrase).length !== 0) {
					// 	result.push(...fuseArchi.search(phrase));
					// }
					// if (fuseAge.search(phrase).length !== 0) {
					// 	result.push(...fuseAge.search(phrase));
					// }
					// if (fuseRole.search(phrase).length !== 0) {
					// 	result.push(...fuseRole.search(phrase));
					// }
					if (fusePosture.search(phrase).length !== 0) {
						result.push(...fusePosture.search(phrase));
						inputArr.splice(i, 1, '-1');
						inputArr.splice(i+1, 1, '-1');
					}
					if (fuseModality.search(phrase).length !== 0) {
						result.push(...fuseModality.search(phrase));
						inputArr.splice(i, 1, '-1');
						inputArr.splice(i+1, 1, '-1');
					}
					console.log("2-gram RESULT: ", result, inputArr);
				}

				//Search by words
				if (fuseSite.search(inputArr[i]).length !== 0) {
					result.push(...fuseSite.search(inputArr[i]));
				}
				if (fuseArchi.search(inputArr[i]).length !== 0) {
					result.push(...fuseArchi.search(inputArr[i]));
				}
				if (fuseIn_outdoor.search(inputArr[i]).length !== 0) {
					result.push(...fuseIn_outdoor.search(inputArr[i]));
				}
				if (fuseSex.search(inputArr[i]).length !== 0) {
					result.push(...fuseSex.search(inputArr[i]));
				}
				if (fuseAge.search(inputArr[i]).length !== 0) {
					result.push(...fuseAge.search(inputArr[i]));
				}
				if (fuseRole.search(inputArr[i]).length !== 0) {
					result.push(...fuseRole.search(inputArr[i]));
				}
				if (fusePosture.search(inputArr[i]).length !== 0) {
					result.push(...fusePosture.search(inputArr[i]));
				}
				if (fuseQuantity.search(inputArr[i]).length !== 0) {
					result.push(...fuseQuantity.search(inputArr[i]));
				}
				if (fuseDensity.search(inputArr[i]).length !== 0) {
					result.push(...fuseDensity.search(inputArr[i]));
				}

				result.sort(function(a, b){
					return a.score - b.score;
				});

				//TODO: Mark the category of each result and change filter directly
				if(result.length > 0){
					if (allPostures.includes(result[0].item) && !existingResult.includes(result[0].item)) {
						filter_change_handler(result[0].item, 0, "posture", "posture", postureColor, false);
					} else if (allSites.includes(result[0].item) && !existingResult.includes(result[0].item)) {
						filter_change_handler(result[0].item, 0, "location", "site", locationColor, false, true);
					} else if (allArchi_compo.includes(result[0].item) && !existingResult.includes(result[0].item)) {
						filter_change_handler(result[0].item, 0, "location", "archi_compo", locationColor, false, true);
					} else if (allIn_outdoor.includes(result[0].item) && !existingResult.includes(result[0].item)) {
						filter_change_handler(result[0].item, 0, "location", "in_outdoor", locationColor, false, true);
					} else if (allSex.includes(result[0].item) && !existingResult.includes(result[0].item)) {
						filter_change_handler(result[0].item, 0, "demographic", "sex", demographicColor, false);
					} else if (allAge.includes(result[0].item) && !existingResult.includes(result[0].item)) {
						filter_change_handler(result[0].item, 0, "demographic", "age", demographicColor, false);
					} else if (allRoles.includes(result[0].item) && !existingResult.includes(result[0].item)) {
						filter_change_handler(result[0].item, 0, "demographic", "social_role", demographicColor, false, true);
					} else if (allQuantities.includes(result[0].item) && !existingResult.includes(result[0].item)) {
						filter_change_handler("spectators quantity: " + result[0].item, 0, "spectators", "quantity", spectatorColor, false);
					} else if (allDensities.includes(result[0].item) && !existingResult.includes(result[0].item)) {
						filter_change_handler("spectators density: " + result[0].item, 0, "spectators", "density", spectatorColor, false);
					} else if ("text" in result[0].item) {
						console.log("ADDING MODALITY: ", result[0].item);
						filter_change_handler(result[0].item["label"], 0, "modality", result[0].item["bodypart"], modalityColor);
					}

					existingResult.push(result[0].item);
					console.log("RESULT: ", result);
				}
				result = [];
			}
		}
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
				setFacetList={props.setFacetList}
				facetList={props.facetList}
				handleSearch={handle_searchbar}
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
