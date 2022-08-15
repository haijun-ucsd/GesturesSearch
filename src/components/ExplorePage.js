import React, { useState , useEffect } from 'react';
import { getDatabase, onValue, ref as ref_db, set } from 'firebase/database';
import './components.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Facet from './Facet';
import ExploreGallery from './ExploreGallery';
import { FilterStructure } from './components';

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

	const [searchData, setSearchData] = useState('');
	const handleSearch = (input) => {
		console.log('search input:', input);
		setSearchData(input);
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
		const db = getDatabase()
		const dbRef = ref_db(db, 'images')
		onValue(dbRef, (snapshot) => {
		  const data = snapshot.val();
		  let append = []
		  for (const [imgKey, labels] of Object.entries(data)) {
			append.push([imgKey, labels])
		  }
		  setImageList(append);
		})
	}, [])

	//console.log(imageList); //DEBUG

/* Render */
	useEffect(() => {
		const db = getDatabase()
		const dbRef = ref_db(db, 'images');
		onValue(dbRef, (snapshot) => {
			const data = snapshot.val();
			let filtered = []
			for (const [imgKey, labels] of Object.entries(data)) {
				console.log(labels)
				if (labels.location.in_outdoor === searchData) {
					filtered.push([imgKey, labels]);
				}
			}
			if (searchData !== '') {
				setImageList(filtered);
			}
		})
	}, [searchData])

	// Query from database for correct images:


	return (
		<div className="PageBox">
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
			/>
		</div>
	);
}