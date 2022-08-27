import React, { useState, useEffect } from "react";
//import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { storage } from "../firebase";
import { getDatabase, onValue, ref as ref_db, set, child, orderByChild, get } from "firebase/database";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
import { v4 } from "uuid";
import heic2any from "heic2any";
import "./components.css";
import WaitingRoom from "./WaitingRoom";
import UploadControl from "./UploadControl";
import UploadPopUp from "./UploadPopUp";
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

/* Adding and removing pictures in WaitingRoom */

	const [addingPic, setAddingPic] = useState(false); // whether in the progress of adding picture to waiting room
	// DEBUG
	useEffect(() => {
		console.log("Is during the process of adding picture? " + addingPic);
	}, [addingPic]);

	/**
	 * handle_add_pic
	 * To help store the pictures and initialize URLs for them while using add-pic-btn.
	 */
	const handle_add_pic = async (e) => {

		// Check for existence of event.target.files.
		if (!e.target.files) {
			return;
		}
		console.log("Valid new pictures set : , refresh waiting room."); //DUBUG

		// Loop through all images to append to:
		//	1. append to the current picture list,
		//	2. create URLs and store them sequentially.
		const added_pics = e.target.files;
		var pics_to_store = [...props.addedPics];
		var urls_to_store = [...props.addedPicsUrl];
		var forms_to_store = [...props.formDataList];
		var percentages_to_store = [...props.completePercentages];
		var added_labels_to_store = [...props.addedLabels];
		var annotations_to_store = [...props.picAnnotation];

		for (var i = 0; i < added_pics.length; i++) {

			let currPic = added_pics[i];
			//console.log("added_pics[" + i + "] (before heic check):", currPic); //DEBUG

			/**
			 * Convert .heic to .jpg for proper display
			 * references:
			 *	https://stackoverflow.com/questions/57127365/make-html5-filereader-working-with-heic-files
			 *	https://stackoverflow.com/questions/59227281/is-there-a-way-to-upload-an-image-heic-file-on-my-wysiwyg-editor-without-any-i
			 *	https://codesandbox.io/s/kmdh7?file=/src/index.js
			 *	https://www.tokenex.com/blog/ab-what-is-a-blob-binary-large-object-can-it-be-tokenized
			 *	https://pqina.nl/blog/convert-a-blob-to-a-file-with-javascript/
			 *	https://javascript.info/async-await
			 */
			if (
				currPic.type === "image/heic"
				//|| currPic.name.toLowerCase().includes(".heic")
			) {
				const convert_to_format = "jpeg"; // or png or gif
				await heic2any({
					blob: currPic,
					toType: "image/"+convert_to_format, // TODO: or png or gif
					quality: 1,
				}).then((convertedBlob) => {
					//console.log("convertedBlob", convertedBlob); //DEBUG
					let fileName = currPic.name; // give proper rename
					if (fileName.slice(-5).toLowerCase() === ".heic") {
						fileName = fileName.slice(0,-5) + ("."+convert_to_format);
					} else {
						fileName += ("."+convert_to_format);
					}
					currPic = new File( // create new image file
						[convertedBlob],
						fileName, {
						type: convertedBlob.type,
						lastModified: currPic.lastModified,
					});
				});
			console.log("added_pics[" + i + "] after heic convertion:", currPic); //DEBUG
			}

			pics_to_store.push(currPic);
			urls_to_store.push(URL.createObjectURL(currPic));
			forms_to_store.push({...LabelStructure});
			percentages_to_store.push(0);
			added_labels_to_store.push("");
			annotations_to_store.push([0,0,0,0]);
		}

		props.setAddedPics(pics_to_store);
		props.setAddedPicsUrl(urls_to_store);
		props.setFormDataList(forms_to_store);
		props.setCompletePercentages(percentages_to_store);
		props.setAddedLabels(added_labels_to_store);
		props.setPicAnnotation(annotations_to_store);

		setAddingPic(false); // to indicate adding completes
	};

	// DEBUG
	useEffect(() => {
		console.log("\n「");
		console.log("addedPics:", props.addedPics);
		console.log("addedPicsUrl:", props.addedPicsUrl);
		console.log("formDataList:", props.formDataList);
		console.log("completePercentages:", props.completePercentages);
		console.log("addedLabels:", props.addedLabels);
		console.log("picAnnotation:", props.picAnnotation);
		console.log("」\n ");
	}, [
		props.addedPics,
		props.addedPicsUrl,
		props.formDataList,
		props.completePercentages,
		props.addedLabels,
		props.picAnnotation
	]);

	const handle_remove_pic = (idx) => {

		console.log("Remove picture from index: " + idx); //DEBUG

		// Check idx against possible range.
		if (idx >= props.addedPics.length) {
			return;
		}

		props.setAddedPics((prev) => prev.filter((item, i) => i!=idx));
		props.setAddedPicsUrl((prev) => prev.filter((item, i) => i!=idx));
		props.setFormDataList((prev) => prev.filter((item, i) => i!=idx));
		props.setCompletePercentages((prev) => prev.filter((item, i) => i!=idx));
		props.setAddedLabels((prev) => prev.filter((item, i) => i!=idx));
		props.setPicAnnotation((prev) => prev.filter((item, i) => i!=idx));
	}


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
		console.log("addedPics:", props.addedPics); //DEBUG
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
				console.log("finalPicData:", finalPicData); //DEBUG

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


/* Viewing and labeling individual picture */

	/**
	 * clickedUrl
	 * Hook for which picture has been clicked on to be individually seen and labeled.
	 */
	const [clickedUrl, setClickedUrl] = useState("");
	const closePop = () => { setClickedUrl(""); }

	/**
	 * reprint_added_labels
	 *
	 * Return a text that lists out all added labels
	 * @param idx: Index of formDataList to fetch added labels from
	 *
	 * references:
	 *  https://www.codegrepper.com/code-examples/javascript/how+to+check+if+something+is+an+array+javascript
	 *  https://www.codegrepper.com/code-examples/javascript/remove+last+character+from+a+string+in+react
	 */
	const reprint_added_labels = (idx, data) => {
		let added_labels_string = "Added labels: \n";
		for (let category in data) {
			// Ignored case: url.
			if (category === "url") {
				continue;
			}

			// Special case: posture, no subcategory in formData.
			if (category === "posture") {
				if (data[category].length !== 0) {
					added_labels_string += "• Postures: ";
					for (let i = 0; i < data[category].length; i++) {
						added_labels_string += data[category][i] + ", ";
					}
					added_labels_string += "\n";
				}
			}

			// Special case modality: only record occupied modalities.
			else if (category === "modality") {
				let occupied_modalities = "";
				for (let bodypart in data[category]) {
					if (data[category][bodypart] === false) {
						occupied_modalities += bodypart + ", ";
					}
				}
				if (occupied_modalities === "") {
					added_labels_string += "• All modalities available, \n";
				} else {
					added_labels_string +=
						"• Occupied modalities: " + occupied_modalities + "\n";
				}
			}

			// Default case.
			else {
				let empty_flag = true; // whether all subcategories of this category are emoty. If empty, won't include this category in addedLabels.
				let category_added_labels = "";
				for (let subcategory in data[category]) {
					let subcategory_content = data[category][subcategory];
					if (Array.isArray(subcategory_content)) {
						if (subcategory_content.length !== 0) {
							empty_flag = false; // turn off empty_flag if any subcategory is not empty
							for (let i = 0; i < subcategory_content.length; i++) {
								category_added_labels += subcategory_content[i] + ", ";
							}
						}
					} else {
						// not array
						if (subcategory_content !== "") {
							empty_flag = false;
							category_added_labels += subcategory_content + ", ";
						}
					}
				}
				if (empty_flag === false) {
					added_labels_string +=
						"• " + // append bullet point
						(category.charAt(0).toUpperCase() + category.slice(1)) + // capitalize first letter
						": " +
						category_added_labels +
						"\n";
				}
			}
		}

		added_labels_string = added_labels_string.slice(0, -3); // cut off the extra ", \n" at the end
		console.log("added_labels_string :\n" + added_labels_string); //DEBUG
		props.setAddedLabels((prev) => {
			let newAddedLabels = [...prev];
			newAddedLabels[idx] = added_labels_string;
			return newAddedLabels;
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
	useEffect(() => {
		validate();
	}, [props.addedPics, props.addedPicsUrl, props.formDataList, props.completePercentages]);


/* Render */
	return (
		<div className="PageBox PageBox_Upload">
			<div className="UploadWaitingRoom">
				<UploadControl
					handle_add_pic={handle_add_pic}
					numAddedPics={props.addedPics.length}
					addingPic={addingPic}
					setAddingPic={setAddingPic}
					uploadImages={uploadImages}
					uploadDisabled={uploadDisabled}
				/>
				<WaitingRoom
					handle_remove_pic={handle_remove_pic}
					addedPics={props.addedPics}
					addedPicsUrl={props.addedPicsUrl}
					completePercentages={props.completePercentages}
					addedLabels={props.addedLabels}
					setClickedUrl={setClickedUrl}
				/>
			</div>
			{(clickedUrl!="") ? (
				<UploadPopUp
					url={clickedUrl}
					dataIndex={props.addedPicsUrl.findIndex(item => item===clickedUrl)}
					closePop={closePop}
					formDataList={props.formDataList}
					setFormDataList={props.setFormDataList}
					setCompletePercentages={props.setCompletePercentages}
					completePercentages={props.completePercentages}
					reprint_added_labels={reprint_added_labels}
					picAnnotation={props.picAnnotation}
					setPicAnnotation={props.setPicAnnotation}
				/>
			) : null}
		</div>
	);
}