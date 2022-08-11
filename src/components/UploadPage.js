import React, { useState, useEffect } from "react";
//import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { storage } from "../firebase";
import { getDatabase, onValue, ref as ref_db, set } from "firebase/database";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import "./components.css";
import WaitingRoom from "./WaitingRoom";
import { LabelStructure } from "./components";


export default function UploadPage() {

/* To collect data from WaitingRoom */

  const [addedPics, setAddedPics] = useState([]);
  const [addedPicsUrl, setAddedPicsUrl] = useState([]);
  const [formDataList, setFormDataList] = useState([]);

  // DEBUG
  useEffect(() => {
    console.log("addedPics list has changed.");
    console.log("current addedPics list ↓"); console.log(addedPics);
    console.log("current addedPicsUrl list ↓"); console.log(addedPicsUrl);
    console.log("current formDataList list ↓"); console.log(formDataList);
  }, [addedPics]);
  useEffect(() => {
    console.log("formDataList has been updated ↓"); console.log(formDataList);
  }, [formDataList])


/* To handle upload */

  /**
   * uploadImages
   * 
   * Upload all fully-labeled pictures.
   */
  const uploadImages = () => {
    console.log("call uploadImages()"); //DEBUG

    validate();
    console.log("allPicsValid: " + allPicsValid); //DEBUG

    if (allPicsValid===false) {
      if (window.confirm(
        "Some pictures are not completely labeled.\n"
        +"Do you want to continue to publish only the fully labeled pictures?"
      )) {

        // Upload all valid pictures.
        for (let i = 0; i < addedPics.length; i++) {
          if (completePercentages[i] === 100) { // valid picture, can upload
            console.log("addedPics[" + i + "] is valid"); //DEBUG
            uploadImage(i);
          }
        }
      }
    } else {

      // Upload all pictures.
      for (let i = 0; i < addedPics.length; i++) {
        uploadImage(i);
      }
    }

    console.log("Uploaded pictures should have been cleared"); //DEBUG
    console.log("addedPics ↓"); console.log(addedPics); //DEBUG

    // Alert successful upload.
    alert("Pictures have been uploaded! :D");
  }

  /**
   * uploadImage
   *
   * Final step to upload image to firebase with settled labels.
   * 
   * references:
   *  https://firebase.google.com/docs/storage/web/upload-files
   *  https://stackoverflow.com/questions/46000360/use-of-then-in-reactjs
   *  https://stackoverflow.com/questions/38923644/firebase-update-vs-set
   */
  const uploadImage = (idx) => {
    console.log("call uploadImage() on individual image at index " + idx); //DEBUG

    // Generate random key, find the space to store in firebase.
    let key = v4(); // generate random key
    const imageRef = ref(storage, `images/${key}`);
    console.log("new key: " + key); //DEBUG

    // Store picture to firebase.
    uploadBytes(imageRef, addedPics[idx]).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {

        // Store url and labels to firebase realtime database.
        //  1. get the UUID of uploaded image,
        //  2. get the labels associated with that image.
        console.log("upload image with labels at key: " + key); //DEBUG
        console.log("url: " + url); //DEBUG
        let finalLabels = processData(formDataList[idx], url); // call processData to turn javascript object into json item.
        const db = getDatabase();
        const path = "images/" + key;
        set(
          ref_db(db, path),
          finalLabels
        );
        console.log("final labels ↓"); console.log(finalLabels); //DEBUG
      });
    });

    // Clear the uploaded picture.
    setAddedPics(prev => { return (prev.filter((item, index) => index !== idx)); });
    setAddedPicsUrl(prev => { return (prev.filter((item, index) => index !== idx)); });
    setFormDataList(prev => { return (prev.filter((item, index) => index !== idx)); });
    setCompletePercentages(prev => { return (prev.filter((item, index) => index !== idx)); });
  };

  /**
   * processData
   *
   * Convert javascript object into json item.
   */
  const processData = (data, url) => {
    const spectators_group = ["all", "density", "attentive"];
    const modality_group = [
      "head",
      "eyes",
      "mouth",
      "facial_expression",
      "arms",
      "l_hand",
      "r_hand",
      "legs",
      "feet",
    ];
    const demographic_group = ["age", "sex", "occupation"];
    let finalLabels = {
      url: "",
      location: "",
      spectators: {},
      modality: {},
      demographic: {},
    };
    for (let label in data) {
      if (spectators_group.includes(label)) {
        finalLabels["spectators"] = {
          ...finalLabels["spectators"],
          [label]: data[label],
        };
      } else if (modality_group.includes(label)) {
        finalLabels["modality"] = {
          ...finalLabels["modality"],
          [label]: data[label],
        };
      } else if (demographic_group.includes(label)) {
        finalLabels["demographic"] = {
          ...finalLabels["demographic"],
          [label]: data[label],
        };
      } else {
        finalLabels[label] = data[label];
      }
    }
    finalLabels["url"] = url;
    return finalLabels;
  };

  // const handleImageAdd = (currImg) => {
  //   console.log(currImg);
  //   setCurrImg(currImg)
  // }


/* Validation & Progress */

  /**
   * completePercentages
   */
  const [completePercentages, setCompletePercentages] = useState([]);

  const [uploadDisabled, setUploadDisabled] = useState(true);
  // DEBUG
  useEffect(() => {
    console.log("uploadDisabled: " + uploadDisabled);
  }, uploadDisabled);

  const [allPicsValid, setAllPicsValid] = useState(false);
  // DEBUG
  useEffect(() => {
    console.log("allPicsValid: " + allPicsValid);
  }, allPicsValid);

  /**
   * Validate
   *
   * Check progresses to validate for uploading, return the indices of pictures that are ready to upload.
   * A picture is ready to be published if all required fields are filled, aka. completePercentage==100.
   */
  const validate = () => {
    let publishable_flag = false;
    let all_validate_flag = true;
    for (let i = 0; i < completePercentages.length; i++) {
      if (completePercentages[i] === 100) { // valid to upload
        publishable_flag = true; // turn on publishable_flag if any picture has been fully labeled
      } else {
        all_validate_flag = false; // turn off all_validate_flag if any picture has not been fully labeled
      }
    }
    if (publishable_flag===true) { // if any picture is valid, enable upload button
      setUploadDisabled(false);
    } else {
      setUploadDisabled(true);
    }
    if (all_validate_flag===true) { // if all pictures are valid, upload without warning
      setAllPicsValid(true);
    } else {
      setAllPicsValid(false);
    }
  };

  // const validate_publish_list = () => {
  //   let publishable_list=[];
  //   for (let i = 0; i < completePercentages.length; i++) {
  //     if (completePercentages[i] === 100) { // valid to upload
  //       publishable_list.push(i);
  //     }
  //   }
  //   return publishable_list;
  // };

  /**
   * Check progresses regularly to turn on the upload btn.
   */
  useEffect(() => { validate(); }, [addedPics, addedPicsUrl, formDataList, completePercentages]);


/* Render */
  return (
    <div className="PageBox">
      <WaitingRoom
        uploadDisabled={uploadDisabled}
        uploadImages={uploadImages}
        setAddedPics={setAddedPics}
        addedPics={addedPics}
        setAddedPicsUrl={setAddedPicsUrl}
        addedPicsUrl={addedPicsUrl}
        formDataList={formDataList}
        setFormDataList={setFormDataList}
        completePercentages={completePercentages}
        setCompletePercentages={setCompletePercentages}
      />
    </div>
  );
}
