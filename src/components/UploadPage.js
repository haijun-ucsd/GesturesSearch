import React, { useState, useEffect } from "react";
//import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { storage } from "../firebase";
import { getDatabase, onValue, ref as ref_db, set, child, orderByChild, get } from "firebase/database";
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

		if (allPicsValid===false) {
			if (window.confirm(
				"Some pictures are not completely labeled.\n"
				+"Do you want to continue to publish only the fully labeled pictures?"
			)) {

				// Upload all valid pictures.
				for (let i = 0; i < props.addedPics.length; i++) {
					if (props.completePercentages[i] === 100) { // valid picture, can upload
						console.log("addedPics[" + i + "] is valid"); //DEBUG
						console.log(props.addedPics.length); //DEBUG
						uploadImage(i);
					}
				}

				// Clear the uploaded images according to "undefined" tombstones.
				props.setAddedPics(prev => { return (prev.filter((item) => item !== undefined)); });
				props.setAddedPicsUrl(prev => { return (prev.filter((item) => item !== undefined)); });
				props.setFormDataList(prev => { return (prev.filter((item) => item !== undefined)); });
				props.setCompletePercentages(prev => { return (prev.filter((item) => item !== undefined)); });
				props.setAddedLabels(prev => { return (prev.filter((item) => item !== undefined)); });
				props.setPicAnnotation(prev => { return (prev.filter((item) => item !== undefined)); });
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
		console.log("addedPics ↓"); console.log(props.addedPics); //DEBUG
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
	 *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
	 */
	const uploadImage = (idx) => {
		console.log("call uploadImage() on individual image at index " + idx); //DEBUG

		// Generate random key, find the space to store in firebase.
		let key = v4(); // generate random key
		const imageRef = ref(storage, `images/${key}`);
		console.log("new key: " + key); //DEBUG
		const db = getDatabase();

		// Store picture to firebase.
		uploadBytes(imageRef, props.addedPics[idx]).then((snapshot) => {
			getDownloadURL(snapshot.ref).then((url) => {

				// 1. Store data to firebase realtime database under "images", data
				//		includes form data, URL, annotation info.
				console.log("Upload image, labels, and annotation.\nkey: " + key + "\n url: " + url); //DEBUG
				let finalPicData = {
					url: url,
					...props.formDataList[idx],
					annotation: props.picAnnotation[idx],
				};
				//finalPicData["url"] = url; // TODO: remove this line, should not need
				const image_path = "images/" + key;
				set(ref_db(db, image_path), finalPicData); // store finalPicData into the corresponding picture object under "image"
				console.log("finalPicData ↓"); console.log(finalPicData); //DEBUG

				// 2. Give a numeric id (finalPicIndex) for the picture, and use it to
				//		store the picture under "labels" in firebase realtime database.
				var finalPicIndex = 0;

				// Generate index for each image by publishing order.
				get(ref_db(db, "images")).then((snapshot) => {
					let lastTimestamp = -1;
					let lastImage = null; // helper to find the last image according tio timestamp
					console.log("snapshot size:" + snapshot.size); //DEBUG
					if (snapshot.size === 1) {
						console.log("first image ever"); //DEBUG
						set(ref_db(db, `images/${key}/index`), 0);
						snapshot.forEach((child) => {
							const thisImage = child.val();
							lastImage = thisImage;
						});
					} else {
						snapshot.forEach((child) => {
							const thisImage = child.val();
							console.log("thisImage.timestamp:" + thisImage.timestamp); //DEBUG
							if (
								thisImage.timestamp > lastTimestamp &&
								thisImage.index !== undefined // looking for the second highest timestamp which is the last uploaded pic
							) {
								lastTimestamp = thisImage.timestamp;
								lastImage = thisImage;
							}
						});
						if (lastImage) {
							//if lastImage exists
							console.log("lastImage:" + lastImage); //DEBUG
							set(ref_db(db, `images/${key}/index`), lastImage.index + 1); // set thisImage.index=lastImage.index+1
							finalPicIndex = lastImage.index + 1;
							console.log("finalPicIndex:" + finalPicIndex); //DEBUG
						}
					}

					// Store index under the correct labels.
					let formData = {...props.formDataList[idx]};
					console.log("Append image index under corresponding labels."); //DEBUG
					for (let category in formData) {
						//console.log("category: " + category); //DEBUG

						// Special case: posture. No subcategory layer.
						if (category === "posture") {
							formData["posture"].map(label => { // formData["posture"] guaranteed to be an array
								//console.log("label: " + label); //DEBUG
								const label_path = "labels/posture/" + label;
								set(ref_db(db, label_path + "/" + finalPicIndex), { url: url }); // TODO: storing url as well for now, can remove if find it unnecessary.
							});
						}

						// Default case.
						else {
							for (let subcategory in formData[category]) {
								//console.log("subcategory: " + subcategory); //DEBUG
								if (Array.isArray(formData[category][subcategory])) {
									formData[category][subcategory].map(label => {
										//console.log("label: " + label); //DEBUG
										const label_path = "labels/" + category + "/" + subcategory + "/" + label;
										set(ref_db(db, label_path + "/" + finalPicIndex), { url: url });
									});
								} else {
									const label_path = "labels/" + category + "/" + subcategory + "/" + formData[category][subcategory];
									set(ref_db(db, label_path + "/" + finalPicIndex), { url: url });
								}
							}
						}
					}
				});
			});
		});

		// Prepare to clear the uploaded picture.
		// For now, maintain a tombstone at the index to facilitate the upload loop.
		// Will remove all together after the upload loop.
		props.setAddedPics(prev => { let newList=[...prev]; newList[idx] = undefined; return (newList); });
		props.setAddedPicsUrl(prev => { let newList=[...prev]; newList[idx] = undefined; return (newList); });
		props.setFormDataList(prev => { let newList=[...prev]; newList[idx] = undefined; return (newList); });
		props.setCompletePercentages(prev => { let newList=[...prev]; newList[idx] = undefined; return (newList); });
		props.setAddedLabels(prev => { let newList=[...prev]; newList[idx] = undefined; return (newList); });
		props.setPicAnnotation(prev => { let newList=[...prev]; newList[idx] = undefined; return (newList); });
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
			if (props.completePercentages[i] === 100) { // valid to upload
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
	useEffect(() => { validate(); }, [props.addedPics, props.addedPicsUrl, props.formDataList, props.completePercentages]);


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