/**
 * AdminPage.js
 *
 * UI for admin. Should only be able to access after admin login.
 */



import React, { useState, useEffect } from "react";
import { Routes, Route, Outlet, NavLink } from "react-router-dom";
import { storage } from "../firebase";
import { getDatabase, ref as ref_db, set, child, orderByChild, get } from "firebase/database";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
//import { v4 } from "uuid";
import jwt_decode from "jwt-decode"; //decode json web token
import heic2any from "heic2any";
import reactImageSize from 'react-image-size';
import Compressor from 'compressorjs';
import "./components.css";
import WaitingRoom from "./UploadPage/WaitingRoom";
import UploadControl from "./UploadPage/UploadControl";
import UploadPopUp from "./UploadPage/UploadPopUp";
import { LabelStructure, LabelStructure_type2_only } from "./components";

// Assets
import { Icon } from '@iconify/react';
import AddPicture from "../assets/AddPicture@2x.png";
import PublishPicture from "../assets/PublishPicture@2x.png";
import SucceedIcon from "../assets/SucceedIcon@2x.png";

// Set up database
const db = getDatabase();



/**
 * AdminPage
 */
export default function AdminPage(props) {
	return (
		<div className="PageBox PageBox_Admin">
			<div className="SubNavbar">
				<NavLink to="empty_images" className="Navtab">→empty_images</NavLink>
				<NavLink to="quality_check" className="Navtab">→quality_check</NavLink>
			</div>
			<div className="AdminOutletContainer">
				<Outlet />
			</div>
		</div>
	);
}



function AdminEmptyImages(props) {

	/**--- Upload empty pictures ---**/

	const [pictureList, setPictureList] = useState([]);
	const [urlList, setUrlList] = useState([]);

	const [uploadState, setUploadState] = useState("");
	useEffect(() => {
		if (uploadState === "Upload succeeds!") { // let succeed msg stay for 3s
			setTimeout(() => {
				setUploadState("");
			}, 3000); // 3s = 3000ms
		}
	}, [uploadState]);

	const convert_to_format = "jpeg"; // or png or gif
	const size_limit = 1000000; // 1 MB

	/**
	 * handle_add_pic
	 *
	 * Start adding and uploading picture once the admin clicks the "Upload pictures" btn
	 * 
	 * @param added_pics: the files that the admin chooses to upload.
	 */
	const handle_add_pic = async (added_pics) => {

		// Loop through all images to append to:
		//  1. append to the current picture list,
		//  2. create URLs and store them sequentially.
		var pics_to_store = [];
		var urls_to_store = [];

		for (var i = 0; i < added_pics.length; i++) {

			let currPic = added_pics[i];
			//console.log("added_pics[" + i + "] (before convertion):", currPic); //DEBUG

			// Convert .heic to .jpeg for proper display.
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
				}, ()=>{console.log("heic2any failed");});
			console.log("added_pics[" + i + "] after heic convertion:", currPic); //DEBUG
			}

			pics_to_store.push(currPic);
			urls_to_store.push(URL.createObjectURL(currPic));
		}

		setPictureList(pics_to_store);
		setUrlList(urls_to_store);
	};

	/**
	 * unify_image_format
	 * 
	 * Function to unify the format of images and compress them.
	 * This cannot run until the picture is loaded, due to use of canvas during format conversion.
	 */
	const unify_image_format = (e, idx) => {
		console.log("call unify_image_format()"); //DEBUG
		setUploadState("Unifying image format...");

		// 1. Format conversion.
		// Check current image format, skip if already the intended format.
		if (pictureList[idx].type !== ("image/"+convert_to_format)) {

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
					lastModified: pictureList[idx].lastModified,
				});
				console.log("Image format is converted at index " + idx + ".\nnewImgFile: ", newImgFile); //DEBUG
				setPictureList((prev) => {
					let newPics = [...prev];
					newPics[idx] = newImgFile;
					return newPics;
				});

				// Generate new URL and replace urlList[idx] with it.
				var newImgUrl = URL.createObjectURL(newImgFile);
				setUrlList((prev) => {
					let newUrls = [...prev];
					newUrls[idx] = newImgUrl;
					return newUrls;
				});

			}, ("image/"+convert_to_format), 1); // mime=convert_to_format, quality=1.00
		}
	 
		// 2. Image compression.
		if (pictureList[idx].size > size_limit) {
			new Compressor(pictureList[idx], {
				quality: 0.6,
				mimeType: ("image/"+convert_to_format),
				convertSize: size_limit,
				success(compressionResult) {
					console.log("Image is compressed at index " + idx + ".\ncompressionResult: ", compressionResult); //DEBUG
					setPictureList(prev => {
						let newPics = [...prev];
						newPics[idx] = compressionResult;
						return newPics;
					});
				},
			});
		}
	};

	/**
	 * upload_all_imgs
	 * 
	 * Upload all the empty pictures added once all formats have been correctly converted.
	 */
	useEffect(() => {
		if (pictureList.length > 0) {
			let all_format_valid_flag = true;
			for (let i = 0; i < pictureList.length; i++) {
				console.log(i, pictureList[i]);
				if (
					pictureList[i].type !== ("image/"+convert_to_format)
					|| pictureList[i].size > size_limit
				) {
					all_format_valid_flag = false;
				}
			}
			if (all_format_valid_flag == true) {
				upload_all_imgs();
			}
		}
	}, [pictureList]);

	const upload_all_imgs = async () => {
		console.log("call upload_all_imgs() on a list of length " + pictureList.length); //DEBUG
		setUploadState("Uploading all pics...");

		// Iterate to upload all images.
		for (let i = 0; i < pictureList.length; i++) {
			await upload_single_img(i);
		}

		// Clear helper lists.
		setPictureList([]);
		setUrlList([]);

		// Alert successful upload.
		setUploadState("Upload succeeds!");
	}

	/**
	 * upload_single_img
	 *
	 * Final step to upload an image to firebase.
	 */
	const upload_single_img = async (idx) => {
		console.log("Call upload_single_img() on individual image at index " + idx); //DEBUG

		// Generate index (numeric id) for the picture according to publishing order.
		var finalPicIndex = 0; // TODO: upload too fast timestamp too close cannot tell apart???
		await get(ref_db(db, "empty_images")).then((snapshot) => {
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
			set(ref_db(db, `empty_images/${finalPicIndex}/index`), finalPicIndex);
		});

		// Store picture to firebase storage, and then data to realtime database.
		const image_path = "empty_images/" + finalPicIndex;
		const image_ref = ref(storage, image_path); // store image into firebase storage
		await uploadBytes(image_ref, pictureList[idx]).then(async (snapshot) => {
			await getDownloadURL(snapshot.ref).then(async (url) => {

				// 1. Store data to firebase realtime database under "images". Data includes: form data, URL, annotation info.
				let picData = {
					index: finalPicIndex,
					url: url,
					timestamp: Math.floor(Date.now() / 1000), // upload time
				}
				console.log("Upload empty image."
					+ "\nindex: " + finalPicIndex
					+ "\nurl: " + url +
					"\npicData:", picData); // DEBUG
				set(ref_db(db, image_path), picData); // store picData into the corresponding picture object under "image"				
			});
		});
	};

	/**--- Render ---**/
	return (
		<div className="UploadControl_addpic_div">

			{/* Upload btn to select images */}
			<div className="UploadControl_addpic">
				<label htmlFor="add-pic-btn" className="Btn_secondary">
					<img srcSet={PublishPicture+" 2x"} />
					Upload picture
				</label>
				<input
					id="add-pic-btn"
					type="file"
					multiple
					accept="image/*, .heic"
					onChange={(e) => {
						e.preventDefault();
						if (!e.target.files) { return; } // check for existence of event.target.files
						setUploadState("Upload starts"); // to indicate adding starts
						handle_add_pic(e.target.files);
					}}
					style={{ display: "none" }}
				/>
			</div>

			{/* Hint message about upload stage */}
			<div className="HintText">
				{uploadState}
			</div>

			{/* Hidden div to load images and help format conversion */}
			<div className="Hidden_outer"><div className="Hidden_inner">
				{urlList.map((url, idx) => (
					<img
						className="WaitingPic"
						src={url}
						onLoad = {(e) => {
							unify_image_format(e, idx);
						}}
					/>
				))}
			</div></div>
		</div>
	);
}



function AdminQualityCheck(props) {

	const [addedPics_admin, setAddedPics_admin] = useState([]);
  const [addedPicsUrl_admin, setAddedPicsUrl_admin] = useState([]);
  const [formDataList_admin, setFormDataList_admin] = useState([]);
  const [completePercentages_admin, setCompletePercentages_admin] = useState([]);
  const [addedLabels_admin, setAddedLabels_admin] = useState([]);
  const [picAnnotation_admin, setPicAnnotation_admin] = useState([]);

	const defaultFormData = (() => {
		let initialFormData = { ...LabelStructure };
		for (let bodypart in initialFormData["modality"]) { // set modality default value: true (= available)
			initialFormData["modality"][bodypart] = true;
		};
		return initialFormData;
	});

	/**--- Adding and removing pictures in WaitingRoom ---**/

	const [addingPic, setAddingPic] = useState(false); // whether in the progress of adding picture to waiting room
	// DEBUG
	useEffect(() => {
		console.log("Is during the process of adding picture? " + addingPic);
	}, [addingPic]);

	const [draggingActive, setDraggingActive] = useState(false); // whether in the progress of dragging something (unconfirmed yet if it is a picture)
	// DEBUG
	useEffect(() => {
		console.log("Is during the process of dragging something into the upload box? " + draggingActive);
	}, [draggingActive]);

	// Validator for drag-to-add.
	// When true, report to the user that some or all of their dragged items is non-image.
	const [dragToAddInvalid, setDragToAddInvalid] = useState(false);
	useEffect(() => {
		console.log("Is any dragged and dropped items invalid? " + dragToAddInvalid); //DEBUG
		if (dragToAddInvalid === true) { // let succeed msg stay for 3s
			setTimeout(() => {
				setDragToAddInvalid(false);
			}, 3000); // 3s = 3000ms
		}
	}, [dragToAddInvalid]);

	/**
	 * handle_add_pic
	 *
	 * To help store the pictures and initialize URLs for them while using add-pic-btn.
	 * 
	 * @param added_pics: the files that the user temporarily uploads to the webpage (WaitingRoom).
	 * 
	 * Usage: Called by the add-picture button in UploadControl.
	 */
	const handle_add_pic = async (added_pics) => {

		// Loop through all images to append to:
		//	1. append to the current picture list,
		//	2. create URLs and store them sequentially.
		var pics_to_store = [...addedPics_admin];
		var urls_to_store = [...addedPicsUrl_admin];
		var forms_to_store = [...formDataList_admin];
		var percentages_to_store = [...completePercentages_admin];
		var added_labels_to_store = [...addedLabels_admin];
		var annotations_to_store = [...picAnnotation_admin];

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

		setAddedPics_admin(pics_to_store);
		setAddedPicsUrl_admin(urls_to_store);
		setFormDataList_admin(forms_to_store);
		setCompletePercentages_admin(percentages_to_store);
		setAddedLabels_admin(added_labels_to_store);
		setPicAnnotation_admin(annotations_to_store);

		setAddingPic(false); // to indicate adding completes
	};

	// DEBUG
	console.log("userName:"+ props.user)
	useEffect(() => {
		console.log("\n「");
		console.log("addedPics:", addedPics_admin);
		console.log("addedPicsUrl:", addedPicsUrl_admin);
		console.log("formDataList:", formDataList_admin);
		console.log("completePercentages:", completePercentages_admin);
		console.log("addedLabels:", addedLabels_admin);
		console.log("picAnnotation:", picAnnotation_admin);
		console.log("」\n ");
	}, [
		addedPics_admin,
		addedPicsUrl_admin,
		formDataList_admin,
		completePercentages_admin,
		addedLabels_admin,
		picAnnotation_admin
	]);

	/** TODO */
	const add_pic_by_click = (e) => {
		e.preventDefault();
		if (!e.target.files) { return; } // check for existence of event.target.files
		console.log("Valid new pictures added by click:\n", e.target.files, "\nUpdating waiting room."); //DUBUG
		handle_add_pic(e.target.files);
	}

	/**
	 * add_pic_by_drag
	 * 
	 * Triggered when some item is dragged over or into a box that accepts drag-to-add.
	 * 
	 * Usage:
	 *	- In UploadControl before any picture is added
	 *	- In WaitingRoom after some picture is added
	 *
	 * references:
	 *	https://www.codemzy.com/blog/react-drag-drop-file-upload
	 *	https://www.w3schools.com/jsref/event_ondragenter.asp
	 *	https://www.w3schools.com/jsref/event_stoppropagation.asp
	 *	https://roufid.com/javascript-check-file-image/
	 */
	const add_pic_by_drag = (e) => {
		e.preventDefault();
		e.stopPropagation(); // prevents propagation, which means "bubbling up to parent elements or capturing down to child elements"
		//console.log("Dragging. Drag type: " + e.type); //DEBUG

		// During the dragging process.
		if (e.type === "dragenter" || e.type === "dragover") {
			setDraggingActive(true);
		}

		// Dragged element moves out of the drag-to-add area.
		else if (e.type === "dragleave") {
			setDraggingActive(false);
		}

		// Dragged item is dropped within the drag-to-add area.
		else if (e.type === "drop") {
			setDraggingActive(false);
			if (!e.dataTransfer.files) { return; } // check for existence of event.dataTransfer.files
			let valid_pics = [];
			for (let i = 0; i < e.dataTransfer.files.length; i++) { // check whether the files are images
				if (e.dataTransfer.files[i]["type"].split("/")[0] === "image") {
					valid_pics.push(e.dataTransfer.files[i]);
				}
			}
			if (valid_pics.length < e.dataTransfer.files.length) {
				setDragToAddInvalid(true);
			}
			if (valid_pics.length > 0) {
				console.log("Valid new pictures added through drag:\n", valid_pics, "\nUpdating waiting room."); //DUBUG
				handle_add_pic(valid_pics);
			}
		}
	}

	/** TODO */
	const handle_remove_pic = (idx) => {

		console.log("Remove picture from index: " + idx); //DEBUG

		// Check idx against possible range.
		if (idx >= addedPics_admin.length) {
			return;
		}

		setAddedPics_admin((prev) => prev.filter((item, i) => i!=idx));
		setAddedPicsUrl_admin((prev) => prev.filter((item, i) => i!=idx));
		setFormDataList_admin((prev) => prev.filter((item, i) => i!=idx));
		setCompletePercentages_admin((prev) => prev.filter((item, i) => i!=idx));
		setAddedLabels_admin((prev) => prev.filter((item, i) => i!=idx));
		setPicAnnotation_admin((prev) => prev.filter((item, i) => i!=idx));
	}

	/**
	 * unify_image_format
	 * 
	 * Function to unify the format of images and compress them.
	 * This cannot run until the picture is loaded into WaitingRoom due to use of canvas during format conversion.
	 * 
	 * Usage: Runs immediately after an image is loaded into WaitingRoom.
	 */
	const unify_image_format = (e, idx) => {

		const convert_to_format = "jpeg"; // or png or gif
		const size_limit = 1000000; // 1 MB

		// 1. Format conversion.
		// Check current image format, skip if already the intended format.
		if (addedPics_admin[idx].type !== ("image/"+convert_to_format)) {

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
					lastModified: addedPics_admin[idx].lastModified,
				});
				console.log("Image format is converted at index " + idx + ".\nnewImgFile: ", newImgFile); //DEBUG
				setAddedPics_admin((prev) => {
					let newAddedPics = [...prev];
					newAddedPics[idx] = newImgFile;
					return newAddedPics;
				});

				// Generate new URL and replace addedPicsUrl[idx] with it.
				var newImgUrl = URL.createObjectURL(newImgFile);
				setAddedPicsUrl_admin((prev) => {
					let newAddedPicsUrl = [...prev];
					newAddedPicsUrl[idx] = newImgUrl;
					return newAddedPicsUrl;
				});

			}, ("image/"+convert_to_format), 1); // mime=convert_to_format, quality=1.00
		}
	 
		// 2. Image compression.
		if (addedPics_admin[idx].size > size_limit) {
			new Compressor(addedPics_admin[idx], {
				quality: 0.6,
				mimeType: ("image/"+convert_to_format),
				convertSize: size_limit,
				success(compressionResult) {
					console.log("Image is compressed at index " + idx + ".\ncompressionResult: ", compressionResult); //DEBUG
					setAddedPics_admin(prev => {
						let newAddedPics = [...prev];
						newAddedPics[idx] = compressionResult;
						return newAddedPics;
					});
				},
			});
		}

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
				for (let i = 0; i < addedPics_admin.length; i++) {
					if (completePercentages_admin[i] === 100) { // valid picture, can upload
						console.log("addedPics[" + i + "] is valid"); //DEBUG
						console.log(addedPics_admin.length); //DEBUG
						upload_single_image(i);
					}
				}

				// Clear the uploaded images according to "undefined" tombstones.
				setAddedPics_admin(prev => { return (prev.filter((item) => item !== undefined)); });
				setAddedPicsUrl_admin(prev => { return (prev.filter((item) => item !== undefined)); });
				setFormDataList_admin(prev => { return (prev.filter((item) => item !== undefined)); });
				setCompletePercentages_admin(prev => { return (prev.filter((item) => item !== undefined)); });
				setAddedLabels_admin(prev => { return (prev.filter((item) => item !== undefined)); });
				setPicAnnotation_admin(prev => { return (prev.filter((item) => item !== undefined)); });
			}
		} else {

			// Upload all pictures.
			for (let i = 0; i < addedPics_admin.length; i++) {
				console.log(addedPics_admin.length); //DEBUG
				await upload_single_image(i);
			}

			// Simply clear all helper lists.
			setAddedPics_admin([]);
			setAddedPicsUrl_admin([]);
			setFormDataList_admin([]);
			setCompletePercentages_admin([]);
			setAddedLabels_admin([]);
			setPicAnnotation_admin([]);
		}

		// Alert successful upload.
		setUploadingPic("succeed");

		console.log("Uploaded pictures should have been cleared."); //DEBUG
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
		await uploadBytes(image_ref, addedPics_admin[idx]).then((snapshot) => {
			getDownloadURL(snapshot.ref).then(async (url) => {

				// 1. Store data to firebase realtime database under "images". Data includes: form data, URL, annotation info.
				let finalPicData = {
					index: finalPicIndex,
					url: url,
					timestamp: Math.floor(Date.now() / 1000), // upload time
					...formDataList_admin[idx],
					annotation: picAnnotation_admin[idx],
					userID: props.user,
					token: 0,
				}
				console.log("[Upload Step 1] Upload image, labels, and annotation."
					+ "\nindex: " + finalPicIndex
					+ "\nurl: " + url +
					"\nfinalPicData:", finalPicData); // DEBUG
				set(ref_db(db, image_path), finalPicData); // store finalPicData into the corresponding picture object under "image"

				// 2. Append the image index & URL to "labels" folder, under the associated labels.
				const formData = {...formDataList_admin[idx]};
				console.log("[Upload Step 2] Append image index under associated labels."); //DEBUG
				const append_to_labels = (label, path) => { // helper function to append image under the correct path within "labels" folder
					let full_path = ("labels/" + path + label + "/" + finalPicIndex);
					console.log("appendding label '" + label + "' to path: ", full_path); //DEBUG
					set(ref_db(db, full_path), { url: url });
				}
				for (let category in formData) {
					if (category === "posture") { // special case: posture (no subcategory layer)
						formData["posture"].map(label => {
							append_to_labels(label, "posture/");
						});
					} else { // default case
						for (let subcategory in formData[category]) {
							if (
								Array.isArray(formData[category][subcategory])
								&& formData[category][subcategory].length !== 0
							) {
								formData[category][subcategory].map(label => {
									append_to_labels(label, (category + "/" + subcategory + "/"));
								});
							} else if (
								!Array.isArray(formData[category][subcategory])
								&& formData[category][subcategory] !== ""
							) {
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
		setAddedPics_admin(prev => { let newList=[...prev]; newList[idx] = undefined; return (newList); });
		setAddedPicsUrl_admin(prev => { let newList=[...prev]; newList[idx] = undefined; return (newList); });
		setFormDataList_admin(prev => { let newList=[...prev]; newList[idx] = undefined; return (newList); });
		setCompletePercentages_admin(prev => { let newList=[...prev]; newList[idx] = undefined; return (newList); });
		setAddedLabels_admin(prev => { let newList=[...prev]; newList[idx] = undefined; return (newList); });
		setPicAnnotation_admin(prev => { let newList=[...prev]; newList[idx] = undefined; return (newList); });
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
		for (let i = 0; i < completePercentages_admin.length; i++) {
			if (completePercentages_admin[i] === 100) { // valid to upload
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
	}, [addedPics_admin, addedPicsUrl_admin, formDataList_admin, completePercentages_admin]);


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
		setAddedLabels_admin((prev) => {
			let newAddedLabels = [...prev];
			newAddedLabels[idx] = added_labels_string;
			return newAddedLabels;
		});
	};

	/**--- Render ---**/
	return (
		<div className="PageBox PageBox_Upload">
			<div className="UploadWaitingRoom">
				{/*<UploadControl
					add_pic_by_click={add_pic_by_click}
					add_pic_by_drag={add_pic_by_drag}
					addingPic={addingPic}
					draggingActive={draggingActive}
					dragToAddInvalid={dragToAddInvalid}
					numAddedPics={addedPics_admin.length}
					uploadingPic={uploadingPic}
					setAddingPic={setAddingPic}
					upload_all_valid_images={upload_all_valid_images}
					uploadDisabled={uploadDisabled}
				/>*/}

				{/**--- Add picture section ---**/}
				<div className="UploadControl_addpic_div">
					<div className="UploadControl_addpic">
						<label htmlFor="add-pic-btn" className="Btn_secondary">
							<img srcSet={AddPicture+" 2x"}/>
							Add picture
						</label>
						<input
							id="add-pic-btn"
							type="file"
							multiple
							accept="image/*, .heic"
							onChange={(e) => {
								setAddingPic(true); // to indicate adding starts
								add_pic_by_click(e);
							}}
							style={{ display: "none" }}
						/>
					</div>

					{/**--- Information about added pics and messages ---**/}
					<div className="HintText">

						{/* Custom messages */
						(() => {

							// priority 1: uploading picture
							if (uploadingPic === "succeed") {
								return (
									<>
										<img srcSet={SucceedIcon+" 2x"} />
										<span style={{color: "#A0D568"}}>
											Pictures have been uploaded!
										</span>
									</>
								);
							} else if (uploadingPic == true) {
								return (
									<>
										<Icon icon="line-md:loading-twotone-loop" />
										Uploading Pictures...
									</>
								);
							}

							// priority 2: adding to waiting room
							if (addingPic == true) {
								return (
									<>
										<Icon icon="line-md:loading-twotone-loop" />
										Adding Pictures...
									</>
								);
							}

							// priority 3: invalid adding
							if (dragToAddInvalid == true) {
								return (
									<>
										Some or all added picture is invalid.
									</>
								);
							}

							// priority 3: usual state, show number of pictures added
							if (addedPics_admin.length !==0) {
								return (
									<>Total {addedPics_admin.length} pictures</>
								);
							}
							// TODO: add number of incompletion
						})()}

					</div>
				</div>

				{/**--- Upload picture section ---**/}
				<div className="UploadControl_uploadpic_div">
					<div id="upload-btn-div">
						<button
							className="Btn_primary"
							type="submit"
							onClick={(e) => {
								e.preventDefault();
								upload_all_valid_images();
							}}
							variant="primary"
							disabled={uploadDisabled}
						>
							<img
								srcSet={PublishPicture+" 2x"}
								style={{opacity: uploadDisabled ? "20%" : "100%"}}
							/>
							Publish
						</button>
					</div>
				</div>

			</div>
			{(clickedUrl!="") ? (
				<UploadPopUp
					url={clickedUrl}
					dataIndex={addedPicsUrl_admin.findIndex(item => item===clickedUrl)}
					closePop={closePop}
					formDataList={formDataList_admin}
					setFormDataList={setFormDataList_admin}
					setCompletePercentages={setCompletePercentages_admin}
					completePercentages={completePercentages_admin}
					refresh_added_labels={refresh_added_labels}
					picAnnotation={picAnnotation_admin}
					setPicAnnotation={setPicAnnotation_admin}
				/>
			) : null}
		</div>
	);
}



export { AdminEmptyImages, AdminQualityCheck };