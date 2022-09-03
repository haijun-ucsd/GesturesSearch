import React, { useState , useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './components.css';
import Navbar from './Navbar';
import UploadPage from './UploadPage/UploadPage';
import ExplorePage from './ExplorePage/ExplorePage';
import AboutPage from './AboutPage/AboutPage';

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
        <Route path='/explore' exact element={<ExplorePage />} />
      </Routes>
    </Router>
  );
}
