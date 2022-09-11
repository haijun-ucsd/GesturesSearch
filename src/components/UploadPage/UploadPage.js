import React, { useState, useEffect } from "react";
//import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { storage } from "../../firebase";
import { getDatabase, ref as ref_db, set, child, orderByChild, get } from "firebase/database";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
//import { v4 } from "uuid";
import heic2any from "heic2any";
import reactImageSize from 'react-image-size';
import Compressor from 'compressorjs';
import "../components.css";
import WaitingRoom from "./WaitingRoom";
import UploadControl from "./UploadControl";
import UploadPopUp from "./UploadPopUp";
import { LabelStructure, LabelStructure_type2_only } from "../components";



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

/**--- Adding and removing pictures in WaitingRoom ---**/

	const [addingPic, setAddingPic] = useState(false); // whether in the progress of adding picture to waiting room
	// DEBUG
	useEffect(() => {
		console.log("Is during the process of adding picture? " + addingPic);
	}, [addingPic]);

	const defaultFormData = (() => {
		let initialFormData = { ...LabelStructure };
		for (let bodypart in initialFormData["modality"]) { // set modality default value: true (= available)
			initialFormData["modality"][bodypart] = true;
		};
		return initialFormData;
	});

	/**
	 * handle_add_pic
	 *
	 * To help store the pictures and initialize URLs for them while using add-pic-btn.
	 * 
	 * @param e: e.target.files are the files that the user temporarily uploads to the webpage (WaitingRoom).
	 * 
	 * Usage: Called by the add-picture button in UploadControl.
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
			//console.log("added_pics[" + i + "] (before convertion):", currPic); //DEBUG

			/**
			 * Convert .heic to .jpeg for proper display.
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
			forms_to_store.push(defaultFormData);
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
	console.log("userName:"+ props.user)
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

	/** TODO */
	const unify_image_format = (e, idx) => {

		const convert_to_format = "jpeg"; // or png or gif
		const size_limit = 1000000; // 1 MB

		// 1. Format conversion.
		// Check current image format, skip if already the intended format.
		if (props.addedPics[idx].type !== ("image/"+convert_to_format)) {

			// Create a temporary canvas to draw the image.
			var c = document.createElement("canvas");
			var ctx = c.getContext("2d");
			c.width = e.target.naturalWidth;
			c.height = e.target.naturalHeight;
			ctx.drawImage(e.target, 0, 0);
				
			// Convert the image to a new File object with the correct format.
			c.toBlob((blob) => {
				var newImgFile = new File( // create new image file
					[blob],
					"MyJPEG.jpeg", { //TODO: file name
					type: "image/"+convert_to_format,
					lastModified: props.addedPics[idx].lastModified,
				});
				console.log("Image format is converted at index " + idx + ".\nnewImgFile: ", newImgFile); //DEBUG
				props.setAddedPics((prev) => {
					let newAddedPics = [...prev];
					newAddedPics[idx] = newImgFile;
					return newAddedPics;
				});

				// Generate new URL and replace addedPicsUrl[idx] with it.
				var newImgUrl = URL.createObjectURL(newImgFile);
				props.setAddedPicsUrl((prev) => {
					let newAddedPicsUrl = [...prev];
					newAddedPicsUrl[idx] = newImgUrl;
					return newAddedPicsUrl;
				});

			}, ("image/"+convert_to_format), 1); // mime=convert_to_format, quality=1.00
		}
   
    // 2. Image compression.
    new Compressor(props.addedPics[idx], {
      quality: 0.6,
      mimeType: ("image/"+convert_to_format),
      convertSize: size_limit,
      success(compressionResult) {
      	console.log("Image is compressed at index " + idx + ".\ncompressionResult: ", compressionResult); //DEBUG
        props.addedPics[idx] = compressionResult;
      },
    });

		// TODO: if click too fast before image is fully loaded, will cause error
		// idea: document ready
	};


/**--- To handle upload ---**/

	// whether in the process of uploading (publishing).
	// 3 states: true, false, "succeed" (to show succeed msg).
	const [uploadingPic, setUploadingPic] = useState(false);
	useEffect(() => {
		console.log("Is during the process of uploading picture? " + uploadingPic); //DEBUG
		if (uploadingPic === "succeed") { // let succeed msg stay for 3s
			setTimeout(() => {
		    setUploadingPic(false);
		  }, 3000); // 3s = 3000ms
		}
	}, [uploadingPic]);

	/**
	 * upload_all_valid_images
	 * 
	 * Upload all fully-labeled pictures.
	 */
	const upload_all_valid_images = async () => {
		console.log("call upload_all_valid_images()"); //DEBUG
		setUploadingPic(true);

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
						upload_single_image(i);
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
				await upload_single_image(i);
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
		setUploadingPic("succeed");

		console.log("Uploaded pictures should have been cleared."); //DEBUG
		console.log("addedPics:", props.addedPics); //DEBUG
	}

	/**
	 * upload_single_image
	 *
	 * Final step to upload image to firebase with settled labels.
	 * 
	 * references:
	 *  https://firebase.google.com/docs/storage/web/upload-files
	 *  https://stackoverflow.com/questions/46000360/use-of-then-in-reactjs
	 *  https://stackoverflow.com/questions/38923644/firebase-update-vs-set
	 *  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
	 *	https://stackoverflow.com/questions/1098040/checking-if-a-key-exists-in-a-javascript-object
	 *	https://stackoverflow.com/questions/71244451/angular-returning-a-value-from-onvalue-in-firebase-realtime-database
	 */
	const upload_single_image = async (idx) => {
		console.log("Call upload_single_image() on individual image at index " + idx); //DEBUG

		// Set up database.
		const db = getDatabase();
    // Generate index (numeric id) for the picture according to publishing order.
		var finalPicIndex = 0;
		await get(ref_db(db, "images")).then((snapshot) => {
			if (snapshot.exists()) { // not first image case
				let lastTimestamp = -1; // helpers to find the last image according to timestamp
				let lastImage = null;
				snapshot.forEach((child) => { // looking for the highest timestamp so far
					const currImage = child.val();
					if (
						currImage.timestamp > lastTimestamp &&
						currImage.index !== undefined
					) {
						lastTimestamp = currImage.timestamp;
						lastImage = currImage;
					}
				});
				if (lastImage != null) { // if lastImage exists
					finalPicIndex = lastImage.index + 1;
					console.log("finalPicIndex:" + finalPicIndex); //DEBUG
				}
			} else { // first image ever case
				console.log("First image ever."); //DEBUG
			}

			// Create space at proper index for this image.
			set(ref_db(db, `images/${finalPicIndex}/index`), finalPicIndex);
		});

		// Store picture to firebase storage, and then data to realtime database.
		const image_path = "images/" + finalPicIndex;
		const image_ref = ref(storage, image_path); // store image into firebase storage
		await uploadBytes(image_ref, props.addedPics[idx]).then((snapshot) => {
			getDownloadURL(snapshot.ref).then(async (url) => {

				// 1. Store data to firebase realtime database under "images". Data includes: form data, URL, annotation info.
				let finalPicData = {
					index: finalPicIndex,
					url: url,
					timestamp: Math.floor(Date.now() / 1000), // upload time
					...props.formDataList[idx],
					annotation: props.picAnnotation[idx],
					userID: props.user,
				}
				console.log("[Upload Step 1] Upload image, labels, and annotation."
					+ "\nindex: " + finalPicIndex
					+ "\nurl: " + url +
					"\nfinalPicData:", finalPicData); // DEBUG
				set(ref_db(db, image_path), finalPicData); // store finalPicData into the corresponding picture object under "image"

				// 2. Append the image index & URL to "labels" folder, under the associated labels.
				const formData = {...props.formDataList[idx]};
				console.log("[Upload Step 2] Append image index under associated labels."); //DEBUG
				const append_to_labels = (label, path) => { // helper function to append image under the correct path within "labels" folder
					set(ref_db(db, ("labels/" + path + label + "/" + finalPicIndex)), { url: url });
				}
				for (let category in formData) {
					if (category === "posture") { // special case: posture (no subcategory layer)
						formData["posture"].map(label => {
							append_to_labels(label, "posture/");
						});
					} else { // default case
						for (let subcategory in formData[category]) {
							if (Array.isArray(formData[category][subcategory])) {
								formData[category][subcategory].map(label => {
									append_to_labels(label, (category + "/" + subcategory + "/"));
								});
							} else {
								append_to_labels(
									formData[category][subcategory],
									(category + "/" + subcategory + "/")
								);
							}
						}
					}
				}

				// 3. If label is customized and unreviewed yet, add it to "unreviewed_labels" folder to wait for manual reviewing.
				console.log("[Upload Step 3] Find unreviewed labels and store them."); //DEBUG
				let reviewed_labels_list = { ...LabelStructure_type2_only };
				await get(ref_db(db, "reviewed_labels")).then((snapshot) => { // try to fetch full list of reviewed label from firebase
					if (!snapshot.exists()) { // no any reviewed label yet
						console.log("No reviewed label yet, all labels stored as unreviewed."); //DEBUG
					} else {
						reviewed_labels_list = {...snapshot.val()};
					}
				});
				const append_to_unreviewed = async (label, path_to_reviewed, path_to_unreviewed) => { // helper function to append label under the correct path within "unreviewed_labels" folder
					console.log("path_to_reviewed: ", path_to_reviewed); //DEBUG
					if (! (label in path_to_reviewed)) { // if the current label doesn't exist in reviewed_labels_list
						await get(ref_db(db, ("unreviewed_labels/" + path_to_unreviewed + label))).then((snapshot) => {
							if (!snapshot.exists()) { // first mention of this label ever, count start at 1
								set(ref_db(db, ("unreviewed_labels/" + path_to_unreviewed + label)), { count: 1 });
							}
							else { // otherwise, increment count
								const currCount = snapshot.val().count;
								console.log("Label '" + label + "' has been mentioned before.\ncount: " + currCount + " +1");
								set(ref_db(db, ("unreviewed_labels/" + path_to_unreviewed + label)), { count: (currCount+1) });
							}
						});
					}
				}
				for (let category in reviewed_labels_list) {
					if (category === "posture") { // special case: posture (no subcategory layer)
						formData["posture"].map(label => {
							append_to_unreviewed(label, reviewed_labels_list["posture"], "posture/");
						});
					} else { // default case
						for (let subcategory in reviewed_labels_list[category]) {
							if (Array.isArray(formData[category][subcategory])) {
								formData[category][subcategory].map(label => {
									append_to_unreviewed(
										label,
										reviewed_labels_list[category][subcategory],
										(category + "/" + subcategory + "/")
									);
								});
							} else {
								append_to_unreviewed(
									formData[category][subcategory],
									reviewed_labels_list[category][subcategory],
									(category + "/" + subcategory + "/")
								);
							}
						}
					}
				}
				
				
				
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


/**--- Validation & Progress ---**/

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


/**--- Viewing and labeling individual picture ---**/

	/**
	 * clickedUrl
	 * Hook for which picture has been clicked on to be individually seen and labeled.
	 */
	const [clickedUrl, setClickedUrl] = useState("");
	const closePop = () => { setClickedUrl(""); }

	/**
	 * refresh_added_labels
	 *
	 * Upon update of formData, create a new string for hover-to-show addedLabels to replace the old one.
	 * @param idx: Index of formDataList to fetch added labels from
	 *
	 * references:
	 *  https://www.codegrepper.com/code-examples/javascript/how+to+check+if+something+is+an+array+javascript
	 *  https://www.codegrepper.com/code-examples/javascript/remove+last+character+from+a+string+in+react
	 */
	const refresh_added_labels = (idx, data) => {
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


/**--- Render ---**/
	return (
		<div className="PageBox PageBox_Upload">
			<div className="UploadWaitingRoom">
				<UploadControl
					handle_add_pic={handle_add_pic}
					numAddedPics={props.addedPics.length}
					addingPic={addingPic}
					uploadingPic={uploadingPic}
					setAddingPic={setAddingPic}
					upload_all_valid_images={upload_all_valid_images}
					uploadDisabled={uploadDisabled}
				/>
				<WaitingRoom
					unify_image_format={unify_image_format}
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
					refresh_added_labels={refresh_added_labels}
					picAnnotation={props.picAnnotation}
					setPicAnnotation={props.setPicAnnotation}
				/>
			) : null}
		</div>
	);
}
