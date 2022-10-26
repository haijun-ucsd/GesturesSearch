import React, { useState , useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { storage } from '../firebase';
import { getDatabase, onValue, ref as ref_db, set } from 'firebase/database';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import './components.css';
import Navbar from './Navbar';
import UploadPage from './UploadPage/UploadPage';
import ExplorePage from './ExplorePage/ExplorePage';
import AboutPage from './AboutPage/AboutPage';
import LoginPage from './Login/LoginPage';
import SignUpPage from './Login/SignUpPage';
import AdminPage, { AdminEmptyImages, AdminQualityCheck } from './AdminPage';
import { FilterStructure } from "./components";
import jwt_decode from "jwt-decode"; //decode json web token


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
  const [user, setUser] = useState("");
	const [pwd, setPwd] = useState("");
	const [errMsg, setErrMsg] = useState("");
	const [success, setSuccess] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
 
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
	 * 
	 * TODO: Remove "label_id" if found unnecessary. Right now all set as 0.
	 */
	const [filterList, setFilterList] = useState([]);
	// DEBUG
	useEffect(() => {
		console.log("updated filterList: ", filterList);
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
		console.log("updated facetList: ", facetList);
	}, [facetList]);

  

  /*----Google OAuth----*/

	const [ g_user, setG_user] = useState({});
	const handleCallbackResponse=(res)=>{
		var userObject = jwt_decode(res.credential); //decoding the token
		console.log(userObject);
			setG_user(jwt_decode(res.credential));
      console.log(g_user);
			document.getElementById("signInDiv").hidden = true;
		  document.getElementById("uploadAvail").hidden = false;
	}
	const handleSignOut=(e)=>{
		setG_user({});
		document.getElementById("signInDiv").hidden = false;
	}

	useEffect(()=>{
		/*global google*/
		google.accounts.id.initialize({
			client_id:"1040045622206-ivnovfjcd4jq58rbrcrm49qd7ra52d2l.apps.googleusercontent.com",
			callback: handleCallbackResponse, //a function called after logged in
			auto_select: true
		});
   
		google.accounts.id.renderButton(
			document.getElementById("signInDiv"),
			{ theme:"outline", size:"large", width: 100, text:"signin_with" }
		);
		
		google.accounts.id.prompt();
	},[g_user]);
  useEffect(()=>{
    console.log("G_user:",g_user);
  },g_user)


/**--- Render --**/
	return (
		<Router>
			<Navbar />
			<Routes>
				<Route path='/about' element={<AboutPage />} />
        <Route path='/Login' element={<LoginPage
          user={user}
          setUser={setUser}
          pwd={pwd}
          setPwd={setPwd}
          errMsg={errMsg}
          setErrMsg={setErrMsg}
          />}
        />
        <Route path='/SignUp' element={<SignUpPage 
          user={user}
          setUser={setUser}
          pwd={pwd}
          setPwd={setPwd}
          errMsg={errMsg}
          setErrMsg={setErrMsg}
          successMsg={successMsg}
          setSuccessMsg={setSuccessMsg}/>}
        />
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
            user={user}
            g_user={g_user}
            setG_user={setG_user}
            // success={success}
            // setSuccess={setSuccess}
          />}
        />
				<Route
					path='/explore'
					//exact // use 'exact' when there are multiple paths with similar names: https://stackoverflow.com/questions/49162311/react-difference-between-route-exact-path-and-route-path
					element={<ExplorePage
						filterList={filterList}
						setFilterList={setFilterList}
						facetList={facetList}
						setFacetList={setFacetList}
            g_user={g_user}
					/>}
				/>
				<Route
					path='/admin'
					element={<AdminPage />}
				>
					<Route path="empty_images" element={<AdminEmptyImages />} />
					<Route path="quality_check" element={<AdminQualityCheck />} />
				</Route>
			</Routes>
		</Router>
	);
}
