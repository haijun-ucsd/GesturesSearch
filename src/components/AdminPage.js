/**
 * AdminPage.js
 *
 * UI for admin. Should only be able to access after admin login.
 */



import React, { useState, useEffect } from "react";
import { storage } from "../firebase";
import { getDatabase, ref as ref_db, set, child, orderByChild, get } from "firebase/database";
import { ref, uploadBytes, listAll, getDownloadURL } from "firebase/storage";
//import { v4 } from "uuid";
import jwt_decode from "jwt-decode"; //decode json web token
import heic2any from "heic2any";
import reactImageSize from 'react-image-size';
import Compressor from 'compressorjs';
import "./components.css";
import { LabelStructure, LabelStructure_type2_only } from "./components";

// Assets
import PublishPicture from "../assets/PublishPicture@2x.png";

// Set up database
const db = getDatabase();



/**
 * AdminPage
 */
export default function AdminPage(props) {

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
		<div className="PageBox">
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
		</div>
	);
}