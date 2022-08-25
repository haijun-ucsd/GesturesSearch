import React, { useState , useEffect } from 'react';
import { getDatabase, onValue, ref as ref_db, set } from 'firebase/database';
import './components.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Facet from './Facet';
import ExploreGallery from './ExploreGallery';
import ExploreDetails from './ExploreDetails';
import { FilterStructure } from './components';
import _, { map } from 'underscore';

/* Assets: */
import ArrowLeft from "../assets/ArrowLeft.png";
import ArrowRight from "../assets/ArrowRight.png";
import ExploreDetailsCloseBtn from "../assets/ExploreDetailsCloseBtn.png";



export default function ExplorePage() {

/* Filters from Facet (search & filters) */
	/**
	 * range
	 * Search range.
	 * Default SearchRange: { Location, Demographic, Modality, Posture }
	 * TODO: combine SearchRange and SearchRange_color variables into labels_list?
	 */
	const SearchRange = ["location", "demographic", "modality", "posture"];
  const [range, setRange] = useState(SearchRange);  // range of categories to search within. //TODO: what if all categories are unchecked and range is none?
  // DEBUG
  useEffect(() => {
    console.log("updated search range ↓"); console.log(range);
  }, [range])

	/**
	 * filterList
	 * List of currently applied filters.
	 * Structure of each filter item: { label, label_id, category, subcategory, color }
	 */
	const [filterList, setFilterList] = useState([]);
	//const [filterList, setFilterList] = useState([ { label: "library", label_id: 0, category: "location", subcategory: "purpose", color: "#A0D568" }, { label: "hospital", label_id: 1, category: "location", subcategory: "purpose", color: "#A0D568" }, ]); //DEBUG
  // DEBUG
  useEffect(() => {
    console.log("updated filterList ↓"); console.log(filterList);
  }, [filterList])

  /**
   * facetList
   * List of states in the facet sections (Modality, Posture, Spectators, Demongraphic).
   * Default as: FilterStructure
   */
  const [facetList, setFacetList] = useState(FilterStructure);
  // DEBUG
  useEffect(() => {
    console.log("updated facetList ↓"); console.log(facetList);
  }, [facetList])

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

    let filterToRemove = filterList.find(
    	(item) => item.label === label
    );
    let category = filterToRemove.category;
    let subcategory = filterToRemove.subcategory;

    // Reset facetList to update the corresponding facet section.
    // Special case: Modality.
    if (category === "modality") {
    	setFacetList(prev => {
	      return ({
	        ...prev,
	        [category]: {
	          ...prev[category],
	          [subcategory]: "any", // subcategory in Modality = body part
	        },
	      });
	    });
    } else {
	    setFacetList(prev => {
	      let newSubcategoryList = prev[category][subcategory].filter((item) => item !== label);
	      console.log("newSubcategoryList: " + newSubcategoryList); //DEBUG
	      return ({
	        ...prev,
	        [category]: {
	          ...prev[category],
	          [subcategory]: newSubcategoryList,
	        },
	      });
	    });
  	}

    // Reset filterList to remove the current filter from AppliedFilter.
    setFilterList (prev => {
      let newFilterList = prev.filter(
        (item) => item.label !== label
      );
      return newFilterList;
    });

    console.log("remove filter: " + label); //DEBUG

    // TODO: Update gallery.
    //console.log("removing succeeds, gallery updated."); //DEBUG
  }


/* Gallery (pictures) */

	const [imageList, setImageList] = useState([]); // list of currently shown pictures

	const [searchData, setSearchData] = useState({});
	const handleSearch = (input) => {
		// console.log('search input:', input);
		// console.log('facet-list from handleSearch:', facetList);
		let obj = {...facetList}
		obj['location'] = input.split(', ').map(item => item.trim())
		setSearchData(obj);
		// console.log('facet-list from handleSearch:', facetList);
		// console.log('search + facet: ', obj);
		console.log('search data: ', searchData);
	}

	/* Update the gallery upon any change. */
	useEffect(() => {
		// listAll(imageListRef).then((response) => {
		//   response.items.forEach((item) => {
		//     getDownloadURL(item).then((url) => {
		//       setImageList((prev) => [...prev, url]);
		//     })
		//   })
		// })
		const db = getDatabase();
		const dbRef = ref_db(db, 'images');
		onValue(dbRef, (snapshot) => {
		  const data = snapshot.val();
		  let newImgList = [];
		  for (const [imgKey, labels] of Object.entries(data)) {
				newImgList.push([imgKey, labels]);
		  }
<<<<<<< HEAD
		  console.log('inital images:', append)
		  setImageList(append);
=======
		  setImageList(newImgList);
>>>>>>> a955660f77eb86beea4224e5079b4d5ae554ab0d
		})
	}, [])

	/* Query from database for correct images */
	useEffect(() => {
		const db = getDatabase()
		const dbRef = ref_db(db, 'images');
		onValue(dbRef, (snapshot) => {
			const data = snapshot.val();
<<<<<<< HEAD
			let filtered = [];
			let location = searchData.location;
			let posture = searchData.posture.posture;
			let quantity = ''
			if ((searchData.spectators.quantity).length > 0) {
				quantity = ((searchData.spectators.quantity)[0].split(':'))[1].trim();
			}
			let density = ''
			if ((searchData.spectators.density).length > 0) {
				density = ((searchData.spectators.density)[0].split(':'))[1].trim();
			}
			let attentive = ''
			if ((searchData.spectators.attentive).length > 0) {
				attentive = ((searchData.spectators.attentive)[0].split(':'))[1].trim();
			}
			let age = ''
			if ((searchData.demographic.age).length > 0) {
				age = (searchData.demographic.age)[0];
			}
			let sex = ''
			if ((searchData.demographic.sex).length > 0) {
				sex = (searchData.demographic)[0];
			}
			console.log('search input:', location, posture, quantity, density, attentive, age, sex)
			console.log('data:', data)
			console.log(quantity, density, attentive, age, sex)
			for (const [imgKey, labels] of Object.entries(data)) {
				// console.log(labels.location.in_outdoor);
				if ((labels.location.architecture_component).some(r => location.includes(r)) ||
					(labels.location.purpose).some(r => location.includes(r)) ||
					 location.includes(labels.location.in_outdoor) ||
					 (labels.posture).some(r => posture.includes(r)) ||
					 (labels.spectators.quantity) === quantity ||
					 (labels.spectators.density) === density ||
					 (labels.spectators.attentive) === String(attentive) ||
					 (labels.demographic.age) === age ||
					 (labels.demographic.sex) === sex) {
					filtered.push([imgKey, labels]);
=======
			let filtered = []
			for (const searchLabel of searchData) {
				for (const [imgKey, labels] of Object.entries(data)) {
					console.log(labels)
					console.log(labels.location);
					if (labels.location !== undefined && ((labels.location.in_outdoor !== undefined && String(labels.location.in_outdoor) === searchLabel) || 
						(labels.location.architecture_component !== undefined && String(labels.location.architecture_component).includes(searchLabel)) || 
						(labels.location.purpose !== undefined && String(labels.location.purpose).includes(searchLabel)) ||
						(labels.posture !== undefined && String(labels.posture).includes(searchLabel)) ||
						(labels.demographic.social_role !== undefined && String(labels.demographic.social_role).includes(searchLabel)))) {
						filtered.push([imgKey, labels]);
					}
>>>>>>> a955660f77eb86beea4224e5079b4d5ae554ab0d
				}
			}
			// for (const searchLabel of searchData) {
			// 	for (const [imgKey, labels] of Object.entries(data)) {
			// 		console.log(labels)
			// 		console.log(imgKey);
			// 		if (searchData['location'].includes(labels.location.in_outdoor) || 
			// 			(labels.location.architecture_component !== undefined && String(labels.location.architecture_component).includes(searchLabel)) || 
			// 			(labels.location.purpose !== undefined && String(labels.location.purpose).includes(searchLabel)) ||
			// 			(labels.posture !== undefined && String(labels.posture).includes(searchLabel)) ||
			// 			(labels.demographic.social_role !== undefined && String(labels.demographic.social_role).includes(searchLabel))) {
			// 			filtered.push([imgKey, labels]);
			// 		}
			// 	}
			// }
			if (searchData === {}) {
				for (const [imgKey, labels] of Object.entries(data)) {
					filtered.push([imgKey, labels])
				}
				console.log('inital:', filtered)
				// setImageList(_.uniq(filtered, false, function (arr) {return arr[0];}));
			}
			setImageList(filtered);
		})
	}, [searchData])


/* Click to view details of a picture */

	const [pictureClicked, setPictureClicked] = useState(undefined);
	console.log("pictureClicked ↓"); console.log(pictureClicked); //DEBUG

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
	}

	const close_exploredetails = () => {
		setPictureClicked(undefined);
	}


/* Render */
	return (
		<div className="PageBox PageBox_Explore">
			<Facet
				setRange={setRange}
				range={range}
				setFilterList={setFilterList}
				remove_filter={remove_filter}
				filterList={filterList}
				setFacetList={setFacetList}
				facetList={facetList}
				handleSearch={handleSearch}
			/>
			<ExploreGallery
				imageList={imageList}
				filterList={filterList}
				remove_filter={remove_filter}
				click_picture={click_picture}
				pictureClicked={pictureClicked}
			/>
			{pictureClicked!==undefined ?
				<ExploreDetails
					pictureClicked={pictureClicked}
					close_exploredetails={close_exploredetails}
				/>
			: null }
		</div>
	);
}