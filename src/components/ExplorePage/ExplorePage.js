import React, { useState, useEffect } from "react";
import { getDatabase, onValue, ref as ref_db, set } from "firebase/database";
import "bootstrap/dist/css/bootstrap.min.css";
import "../components.css";
import Facet from "./Facet";
import ExploreGallery from "./ExploreGallery";
import ExploreDetails from "./ExploreDetails";
import { FetchLabelList_helper } from "../components";
import _, { map } from "underscore";

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
		} else {
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

	const [searchData, setSearchData] = useState([""]);

	const handle_searchbar = (input) => {
		console.log('search input:', input);
		
		setSearchData((prev) => input.split(', ').map(item => item.trim()));
		console.log("searchData: ", searchData);

		//Add searchbar content to applied filters
		const locationColor = "#80aa54";
		const postureColor = "#AC92EB";
		const demographicColor = "#ED5564";

		const inputArr = input.split(', ').map(item => item.trim());
		console.log('search input Arr:', inputArr);

		const allSites = FetchLabelList_helper("location", "site");
		const allArchi_compo = FetchLabelList_helper("location", "archi_compo");
		const allIn_outdoor = FetchLabelList_helper("location", "in_outdoor");

		const allSex = FetchLabelList_helper("demographic", "sex");
		const allAge = FetchLabelList_helper("demographic", "age");
		const allRoles = FetchLabelList_helper("demographic", "social_role");

		const allPostures = FetchLabelList_helper("posture", undefined);
		
		if (inputArr.length !== 0) {
			for (const searchField of inputArr) {
				if (allPostures.includes(searchField)) {
					filter_change_handler(searchField, 0, "posture", "posture", postureColor, false);
				} else if (allSites.includes(searchField)) {
					filter_change_handler(searchField, 0, "location", "site", locationColor, false, true);
				} else if (allArchi_compo.includes(searchField)) {
					filter_change_handler(searchField, 0, "location", "archi_compo", locationColor, false, true);
				} else if (allIn_outdoor.includes(searchField)) {
					filter_change_handler(searchField, 0, "location", "in_outdoor", locationColor, false, true);
				} else if (allSex.includes(searchField)) {
					filter_change_handler(searchField, 0, "demographic", "sex", demographicColor, false);
				} else if (allAge.includes(searchField)) {
					filter_change_handler(searchField, 0, "demographic", "age", demographicColor, false);
				} else if (allRoles.includes(searchField)) {
					filter_change_handler(searchField, 0, "demographic", "social_role", demographicColor, false, true);
				}
			}
		}
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
			for (const [imgKey, labels] of Object.entries(data)) {
				//match labels in searchbar query
				if (props.filterList[0] === undefined) {
					filtered.push([imgKey, labels]);
				} else {
					for (const facetLabel of props.filterList) {
						switch (facetLabel.category) {
							case 'posture':
								if (labels.posture !== undefined && String(labels.posture).includes(facetLabel.label)) {
									filtered.push([imgKey, labels]);
								}
								break;
							case 'demographic':
								if (facetLabel.subcategory === "age") {
									if (labels.demographic.age !== undefined && labels.demographic.age === facetLabel.label) {
										filtered.push([imgKey, labels]);
									}
								} else if (facetLabel.subcategory === "sex") {
									if (labels.demographic.sex !== undefined && labels.demographic.sex === facetLabel.label) {
										filtered.push([imgKey, labels]);
									}
								} else {
									if (String(labels.demographic.social_role).includes(facetLabel.label)) {
										filtered.push([imgKey, labels]);
									}
								}
								break;
							case 'modality':
								var avail = facetLabel.label.split(' ')[facetLabel.label.split(' ').length - 1];
								if (labels.modality[facetLabel.subcategory] === Boolean(avail === 'available')) {
									filtered.push([imgKey, labels]);
								}
								break;
							case 'spectators':
								var value = facetLabel.label.split(' ')[2];
								if (facetLabel.subcategory === "quantity") {
									if (labels.spectators.quantity === value) {
										filtered.push([imgKey, labels]);
									}
								} else if (facetLabel.subcategory === "density") {
									if (labels.spectators.density === value) {
										filtered.push([imgKey, labels]);
									}
								} else {
									if (labels.spectators.attentive === value) {
										filtered.push([imgKey, labels]);
									}
								}
								break;
							case 'location':
								if (facetLabel.subcategory === "site") {
									if (String(labels.location.site).includes(facetLabel.label)) {
										filtered.push([imgKey, labels]);
									}
								} else if (facetLabel.subcategory === "archi_compo") {
									if (String(labels.location.archi_compo).includes(facetLabel.label)) {
										filtered.push([imgKey, labels]);
									}
								} else {
									if (labels.location.in_outdoor === facetLabel.label) {
										filtered.push([imgKey, labels]);
									}
								}
								break;
							default:

						}
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
	useEffect(() => { handle_search(); }, [searchData, props.filterList])


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
