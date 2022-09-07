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

/**
 * references:
 *  
 */
export default function App() {

  /* Hooks for UploadPage */
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

  /* Render */
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/' element={<AboutPage />} />
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
          setErrMsg={setErrMsg}/>}
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
            // success={success}
            // setSuccess={setSuccess}
          />}
        />
        <Route path='/explore' exact element={<ExplorePage />} />
      </Routes>
    </Router>
  );
}
