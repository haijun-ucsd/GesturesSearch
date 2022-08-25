import React, { useState, useEffect } from "react";
//import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';
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
 *  - [addedLabels, setAddedLabels]
 *  - [picAnnotation, setPicAnnotation]
 *
 * TODO: clean up the code to combine the 6 hooks.
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
            console.log(props.addedPics.length); //DEBUG
            uploadImage(i);
          }
        }

        // Clear the uploaded images according to "undefined" tombstones.
        props.setAddedPics((prev) => {
          return prev.filter((item) => item !== undefined);
        });
        props.setAddedPicsUrl((prev) => {
          return prev.filter((item) => item !== undefined);
        });
        props.setFormDataList((prev) => {
          return prev.filter((item) => item !== undefined);
        });
        props.setCompletePercentages((prev) => {
          return prev.filter((item) => item !== undefined);
        });
        props.setAddedLabels((prev) => {
          return prev.filter((item) => item !== undefined);
        });
        props.setPicAnnotation((prev) => {
          return prev.filter((item) => item !== undefined);
        });
      }
    } else {
      // Upload all pictures.
      for (let i = 0; i < props.addedPics.length; i++) {
        console.log(props.addedPics.length); //DEBUG
        uploadImage(i);
      }

      // Simply clear all helper lists.
      props.setAddedPics([]);
      props.setAddedPicsUrl([]);
      props.setFormDataList([]);
      props.setCompletePercentages([]);
      props.setAddedLabels([]);
      props.setPicAnnotation([]);
    }

    // Alert successful upload.
    alert("Pictures have been uploaded! :D");

    console.log("Uploaded pictures should have been cleared"); //DEBUG
    console.log("addedPics ↓");
    console.log(props.addedPics); //DEBUG
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
   *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
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
        let finalPicData = {
          url: url,
          ...props.formDataList[idx],
          annotation: props.picAnnotation[idx],
        };
        const db = getDatabase();
        const path = "images/" + key;
        set(ref_db(db, path), finalPicData);
        console.log("final labels ↓");
        console.log(finalPicData); //DEBUG
        var final_index = 0;

        //generate a numeric id for each image by publishing order
        get(ref_db(db, "images")).then((snapshot) => {
          let lastTimestamp = -1;
          let lastImage = null;
          console.log("snapshot size:" + snapshot.size);

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
              console.log("thisImage.timestamp:" + thisImage.timestamp);
              if (
                thisImage.timestamp > lastTimestamp &&
                thisImage.index !== undefined //looking for the second highest timestamp which is the last uploaded pic
              ) {
                lastTimestamp = thisImage.timestamp;
                lastImage = thisImage;
              }
            });
            if (lastImage) {
              //if lastImage exists
              console.log("lastImage:" + lastImage);
              set(ref_db(db, `images/${key}/index`), lastImage.index + 1); //set thisImage.index=lastImage.index+1
              final_index = lastImage.index + 1;
              console.log("final_index:" + final_index);
            }
          }

          //------temporary, will make final_index a modifiable global var and move the below out of the get() function if possible

          //**Sorting pictures by location tags
          const loc = JSON.stringify(finalPicData["location"]); //convert JSON array to string
          var result = JSON.parse(loc); //parse the string
          //Loop through location subfields
          const in_outdoor_lb = result["in_outdoor"]; //extract the target label from the string
          set(ref_db(db, "Location/" + in_outdoor_lb + "/" + final_index), {
            url: url,
          });

          const site_lb = result["purpose"];
          for (let i = 0; i < site_lb.length; i++) {
            //posture labels are stored as an array, not a JSON object
            set(ref_db(db, "Location/site/" + site_lb[i] + "/" + final_index), {
              url: url,
            });
          }

          const archi_lb = result["architecture_component"];
          if (archi_lb.length > 0) {
            //check if optional field is empty
            for (let i = 0; i < site_lb.length; i++) {
              //posture labels are stored as an array, not a JSON object
              set(
                ref_db(
                  db,
                  "Location/archi_compo/" + archi_lb[i] + "/" + final_index
                ),
                {
                  url: url,
                }
              );
            }
          }

          // Sorting by postures
          const posture_lb = finalPicData["posture"];
          for (let i = 0; i < posture_lb.length; i++) {
            //posture labels are stored as an array, not a JSON object
            console.log(posture_lb[i]);
            set(ref_db(db, "Posture/" + posture_lb[i] + "/" + final_index), {
              url: url,
            });
          }

          //Sorting by modalities
          const mod = JSON.stringify(finalPicData["modality"]); //convert JSON array to string
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
          const facial_lb = result_mod["facial_expression"]; //extract the target label from the string
          if (facial_lb === false) {
            set(ref_db(db, "Modality/FacialOccupied/" + final_index), {
              url: url,
            });
          }
          const armR_lb = result_mod["r_arm"]; //extract the target label from the string
          if (armR_lb === false) {
            set(ref_db(db, "Modality/R_armOccupied/" + final_index), {
              url: url,
            });
          }
          const armL_lb = result_mod["l_arm"]; //extract the target label from the string
          if (armL_lb === false) {
            set(ref_db(db, "Modality/L_armOccupied/" + final_index), {
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

    // Prepare to clear the uploaded picture.
    // For now, maintain a tombstone at the index to facilitate the upload loop.
    // Will remove all together after the upload loop.
    props.setAddedPics((prev) => {
      let newList = [...prev];
      newList[idx] = undefined;
      return newList;
    });
    props.setAddedPicsUrl((prev) => {
      let newList = [...prev];
      newList[idx] = undefined;
      return newList;
    });
    props.setFormDataList((prev) => {
      let newList = [...prev];
      newList[idx] = undefined;
      return newList;
    });
    props.setCompletePercentages((prev) => {
      let newList = [...prev];
      newList[idx] = undefined;
      return newList;
    });
    props.setAddedLabels((prev) => {
      let newList = [...prev];
      newList[idx] = undefined;
      return newList;
    });
    props.setPicAnnotation((prev) => {
      let newList = [...prev];
      newList[idx] = undefined;
      return newList;
    });
  };

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
    <div className="PageBox PageBox_Upload">
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
        addedLabels={props.addedLabels}
        setAddedLabels={props.setAddedLabels}
        picAnnotation={props.picAnnotation}
        setPicAnnotation={props.setPicAnnotation}
      />
    </div>
  );
}
