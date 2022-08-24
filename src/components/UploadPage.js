import React, { useState, useEffect } from "react";
//import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';

import firebase from "firebase/compat/app";
import { storage } from "../firebase";
import {
  getDatabase,
  onValue,
  ref as ref_db,
  set,
  child,
  orderByChild,
  get,
} from "firebase/database";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import "./components.css";
import WaitingRoom from "./WaitingRoom";
import { LabelStructure } from "./components";

/**
 * UploadPage
 *
 * hooks stored at App level:
 *  - [addedPics, setAddedPics]
 *  - [addedPicsUrl, setAddedPicsUrl]
 *  - [formDataList, setFormDataList]
 *  - [completePercentages, setCompletePercentages]
 */
export default function UploadPage(props) {
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

    if (allPicsValid === false) {
      if (
        window.confirm(
          "Some pictures are not completely labeled.\n" +
            "Do you want to continue to publish only the fully labeled pictures?"
        )
      ) {
        // Upload all valid pictures.
        for (let i = 0; i < props.addedPics.length; i++) {
          if (props.completePercentages[i] === 100) {
            // valid picture, can upload
            console.log("addedPics[" + i + "] is valid"); //DEBUG
            uploadImage(i);
          }
        }
      }
    } else {
      // Upload all pictures.
      for (let i = 0; i < props.addedPics.length; i++) {
        uploadImage(i);
      }
    }

    console.log("Uploaded pictures should have been cleared"); //DEBUG
    console.log("addedPics ↓");
    console.log(props.addedPics); //DEBUG

    // Alert successful upload.
    alert("Pictures have been uploaded! :D");
  };

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
    uploadBytes(imageRef, props.addedPics[idx]).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        // Store url and labels to firebase realtime database.
        //  1. get the UUID of uploaded image,
        //  2. get the labels associated with that image.
        console.log("upload image with labels at key: " + key); //DEBUG
        console.log("url: " + url); //DEBUG
        let finalLabels = processData(props.formDataList[idx], url); // call processData to turn javascript object into json item.

        const db = getDatabase();

        const path = "images/" + key;
        set(ref_db(db, path), finalLabels);
        console.log("final labels ↓");
        console.log(finalLabels); //DEBUG
        var final_index = 0;

        //generate a numeric id for each image by publishing order
        get(ref_db(db, "images")).then((snapshot) => {
          let lastTimestamp = -1;
          let lastImage = null;
          console.log(snapshot.size);

          if (snapshot.size === 1) {
            console.log("first image ever");
            set(ref_db(db, `images/${key}/index`), 0);
            snapshot.forEach((child) => {
              const thisImage = child.val();
              lastImage = thisImage;
            });
          } else {
            snapshot.forEach((child) => {
              const thisImage = child.val();
              if (
                thisImage.timestamp > lastTimestamp &&
                thisImage.index !== undefined //looking for the second highest timestamp which is the last uploaded pic
              ) {
                lastTimestamp = thisImage.timestamp;
                lastImage = thisImage;
              }
            });
          }

          //------temporary, will make final_index a modifiable global var and move the below out of the get() function if possible
          if (lastImage) {
            //if lastImage exists
            set(ref_db(db, `images/${key}/index`), lastImage.index + 1); //set thisImage.index=lastImage.index+1
            final_index = lastImage.index + 1;
            console.log("final_index:" + final_index);
          }

          //**Sorting pictures by location tags
          const loc = JSON.stringify(finalLabels["location"]); //convert JSON array to string
          var result = JSON.parse(loc); //parse the string
          //Loop through location subfields
          const in_outdoor_lb = result["in_outdoor"]; //extract the target label from the string
          set(ref_db(db, "Location/" + in_outdoor_lb + "/" + final_index), {
            url: url,
          });

          const site_lb = result["purpose"];
          // let cleanLb = site_lb.replace("[", "");
          // cleanLb = cleanLb.replace(/]/g, "");
          // for (let i = 0; i < 5; i++) {
          //   //posture labels are stored as an array, not a JSON object
          //   set(ref_db(db, "Location/" + cleanLb[i] + "/" + final_index), {
          //     url: url,
          //   });
          // }
          console.log(site_lb);
          set(ref_db(db, "Location/" + site_lb + "/" + final_index), {
            url: url,
          });

          const archi_lb = result["architecture_component"];
          if (archi_lb.length > 0) {
            //check if optional field is empty
            set(ref_db(db, "Location/" + archi_lb + "/" + final_index), {
              url: url,
            });
          }

          // var lastRecord = firebase
          //   .database()
          //   .ref()
          //   .orderByChild("timestamp")
          //   .limitToLast(1)
          //   .get()
          //   .val();
          // console.log("lastRecord:::::" + lastRecord);

          // Sorting by postures
          const posture_lb = finalLabels["posture"];
          for (let i = 0; i < posture_lb.length; i++) {
            //posture labels are stored as an array, not a JSON object
            console.log(posture_lb[i]);
            set(ref_db(db, "Posture/" + posture_lb[i] + "/" + final_index), {
              url: url,
            });
          }

          //Sorting by modalities
          const mod = JSON.stringify(finalLabels["modality"]); //convert JSON array to string
          var result_mod = JSON.parse(mod); //parse the string
          const head_lb = result_mod["head"]; //extract the target label from the string
          if (head_lb === false) {
            set(ref_db(db, "Modality/HeadOccupied/" + final_index), {
              url: url,
            });
          }
          const eyes_lb = result_mod["eyes"]; //extract the target label from the string
          if (eyes_lb === false) {
            set(ref_db(db, "Modality/EyesOccupied/" + final_index), {
              url: url,
            });
          }
          const voice_lb = result_mod["voice"]; //extract the target label from the string
          if (voice_lb === false) {
            set(ref_db(db, "Modality/VoiceOccupied/" + final_index), {
              url: url,
            });
          }
          const legs_lb = result_mod["legs"]; //extract the target label from the string
          if (legs_lb === false) {
            set(ref_db(db, "Modality/LegsOccupied/" + final_index), {
              url: url,
            });
          }
        });
      });
    });

    // Clear the uploaded picture.
    props.setAddedPics((prev) => {
      return prev.filter((item, index) => index !== idx);
    });
    props.setAddedPicsUrl((prev) => {
      return prev.filter((item, index) => index !== idx);
    });
    props.setFormDataList((prev) => {
      return prev.filter((item, index) => index !== idx);
    });
    props.setCompletePercentages((prev) => {
      return prev.filter((item, index) => index !== idx);
    });
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
      timestamp: Math.floor(Date.now() / 1000),
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
    for (let i = 0; i < props.completePercentages.length; i++) {
      if (props.completePercentages[i] === 100) {
        // valid to upload
        publishable_flag = true; // turn on publishable_flag if any picture has been fully labeled
      } else {
        all_validate_flag = false; // turn off all_validate_flag if any picture has not been fully labeled
      }
    }
    if (publishable_flag === true) {
      // if any picture is valid, enable upload button
      setUploadDisabled(false);
    } else {
      setUploadDisabled(true);
    }
    if (all_validate_flag === true) {
      // if all pictures are valid, upload without warning
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
  useEffect(() => {
    validate();
  }, [
    props.addedPics,
    props.addedPicsUrl,
    props.formDataList,
    props.completePercentages,
  ]);

  /* Render */
  return (
    <div className="PageBox">
      <WaitingRoom
        uploadDisabled={uploadDisabled}
        uploadImages={uploadImages}
        setAddedPics={props.setAddedPics}
        addedPics={props.addedPics}
        setAddedPicsUrl={props.setAddedPicsUrl}
        addedPicsUrl={props.addedPicsUrl}
        formDataList={props.formDataList}
        setFormDataList={props.setFormDataList}
        completePercentages={props.completePercentages}
        setCompletePercentages={props.setCompletePercentages}
      />
    </div>
  );
}
