import React, { useState , useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './components.css';
import Navbar from './Navbar';
import UploadPage from './UploadPage/UploadPage';
import ExplorePage from './ExplorePage/ExplorePage';
import AboutPage from './AboutPage/AboutPage';
import { FilterStructure } from "./components";


/**
 * references:
 *  
 */
export default function App() {

/**--- Hooks for UploadPage ---**/
	const [addedPics, setAddedPics] = useState([]);
	const [addedPicsUrl, setAddedPicsUrl] = useState([]);
	const [formDataList, setFormDataList] = useState([]);
	const [completePercentages, setCompletePercentages] = useState([]);
	const [addedLabels, setAddedLabels] = useState([]);
	const [picAnnotation, setPicAnnotation] = useState([]); // element structure: [ annotateStartX, annotateStartY, annotateEndX, annotateEndY ]

	// DEBUG
	useEffect(() => {
		console.log("addedPics list has changed.");
		console.log("current addedPics list:", addedPics);
		console.log("current addedPicsUrl list:", addedPicsUrl);
		console.log("current formDataList list:", formDataList);
	}, [addedPics]);
	useEffect(() => {
		console.log("formDataList has been updated:", formDataList);
	}, [formDataList])
	useEffect(() => {
		console.log("picAnnotation has been updated:", picAnnotation);
	}, [picAnnotation])


/**--- Hooks for ExplorePage ---**/
	/**
	 * filterList
	 * List of currently applied filters.
	 * Structure of each filter item: { label, label_id, category, subcategory, color }
	 */
	const [filterList, setFilterList] = useState([]);
	// DEBUG
	useEffect(() => {
		console.log("updated filterList:");
		console.log(filterList);
	}, [filterList]);

	/**
	 * facetList
	 * List of states in the facet sections (Location, Modality, Posture, Spectators, Demongraphic).
	 * Default as: FilterStructure
	 */
	const [facetList, setFacetList] = useState(() => {
		let initialFacetList = { ...FilterStructure };
		for (let bodypart in initialFacetList["modality"]) { // set modality default value: "any"
			initialFacetList["modality"][bodypart] = "any";
		};
		return initialFacetList;
	});
	// DEBUG
	useEffect(() => {
		console.log("updated facetList:");
		console.log(facetList);
	}, [facetList]);


/**--- Render --**/
	return (
		<Router>
			<Navbar />
			<Routes>
				<Route path='/' element={<AboutPage />} />
				<Route
					path='/upload'
					element={<UploadPage
						addedPics={addedPics}
						setAddedPics={setAddedPics}
						addedPicsUrl={addedPicsUrl}
						setAddedPicsUrl={setAddedPicsUrl}
						formDataList={formDataList}
						setFormDataList={setFormDataList}
						completePercentages={completePercentages}
						setCompletePercentages={setCompletePercentages}
						addedLabels={addedLabels}
						setAddedLabels={setAddedLabels}
						picAnnotation={picAnnotation}
						setPicAnnotation={setPicAnnotation}
					/>}
				/>
				<Route
					path='/explore'
					exact
					element={<ExplorePage
						filterList={filterList}
						setFilterList={setFilterList}
						facetList={facetList}
						setFacetList={setFacetList}
					/>}
				/>
			</Routes>
		</Router>
	);
}
