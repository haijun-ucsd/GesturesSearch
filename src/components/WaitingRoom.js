import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Masonry from 'react-masonry-css'
import useResizeAware from 'react-resize-aware';
//import heic2any from "heic2any";
import "./components.css";
//import { labels_data } from "./labels_data.js";
import { LabelStructure, GalleryColumn_helper } from "./components";
import UploadPopUp from "./UploadPopUp";

/**
 * circular progress bar
 * references:
 *	https://www.npmjs.com/package/react-circular-progressbar
 *	codegrepper.com/code-examples/javascript/import+%7B+CircularProgressbar%2C+buildStyles+%7D+from+%27react-circular-progressbar%27%3B
 */
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

/* Assets: */
import AddPicture from "../assets/AddPicture.png";
import PublishPicture from "../assets/PublishPicture.png";
import HintText_ArrowUp from "../assets/HintText_ArrowUp.png";
import ZeroProgressAddLabel from "../assets/ZeroProgressAddLabel.png";

/**
 * WaitingRoom
 *
 * Waiting room for pictures to be labeled before being uploaded to filebase.
 *
 * parent props:
 *	- uploadDisabled: Whether to disable the upload btn.
 *	- uploadImages(): Method to upload images.
 *	- addedPics: All added pictures in the waitingroom gallery.
 *	- setAddedPics(): To update addedPics.
 *	- addedPicsUrl: URLs of all added pictures in the waitingroom gallery.
 *	- setAddedPicsUrl(): To update addedPicsUrl.
 *	- formDataList: List of all formDatas corrsponding to each picture.
 *	- setFormDataList(): To update formDataList.
 *	- completePercentages: For progress bar and validation.
 *	- setCompletePercentages(): To update completePercentages.
 *	- addedLabels: Strings of added labels to display upon hovering the progress.
 *	- setAddedLabels(): To update addedLabels.
 *
 * references:
 *	https://stackoverflow.com/questions/33766085/how-to-avoid-extra-wrapping-div-in-react
 *	https://stackoverflow.com/questions/43992427/how-to-display-a-image-selected-from-input-type-file-in-reactjs
 *	https://stackoverflow.com/questions/68491348/react-checking-if-an-image-source-url-is-empty-then-return-a-different-url
 *	https://stackoverflow.com/questions/15922344/hide-image-if-src-is-empty
 *	https://levelup.gitconnected.com/how-to-implement-multiple-file-uploads-in-react-4cdcaadd0f6e
 *	https://stackoverflow.com/questions/57127365/make-html5-filereader-working-with-heic-files
 *	https://stackoverflow.com/questions/59227281/is-there-a-way-to-upload-an-image-heic-file-on-my-wysiwyg-editor-without-any-i
 *	https://codesandbox.io/s/kmdh7?file=/src/index.js
 *	https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
 *	https://stackoverflow.com/questions/60134596/create-react-app-without-typescript-got-error-failed-to-load-parser-types
 *	https://stackoverflow.com/questions/52641492/how-to-get-the-index-of-selected-element-in-react-native-array
 *	https://stackoverflow.com/questions/9334636/how-to-create-a-dialog-with-ok-and-cancel-options
 * 
 * TODO: add zooming animation when opening and closing picture, to better indicate to the user which picture in the gallery is being or has been modified.
 */
export default function WaitingRoom(props) {
  /* Adding and removing pictures in WaitingRoomGallery */

  /**
   * handle_add_pic
   * To help store the pictures and initialize URLs for them while using add-pic-btn.
   */
  const handle_add_pic = (e) => {
    // Check for existence of event.target.files.
    if (!e.target.files) {
      return;
    }
    console.log("Valid new pictures set ↓ , refresh waiting room."); //DUBUG

/* Adding and removing pictures in WaitingRoomGallery */

	/**
	 * handle_add_pic
	 * To help store the pictures and initialize URLs for them while using add-pic-btn.
	 */
	const handle_add_pic = (e) => {

		// Check for existence of event.target.files.
		if (!e.target.files) {
			return;
		}
		console.log("Valid new pictures set ↓ , refresh waiting room."); //DUBUG

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
			pics_to_store.push(added_pics[i]);
			let newUrl = "";

			// Convert .heic to .jpg for proper display
			if (added_pics[i] && (
				added_pics[i].type.toLowerCase() === "image/heic"
				|| added_pics[i].name.includes(".heic")
			)) {
				heic2any({ blob: added_pics[i], toType: "image/jpg", quality: 1 }).then(
	        (newPic) => {
	        	console.log(newPic);
	        	newUrl = URL.createObjectURL(newPic);
	        	//console.log("HERERERE: " + newUrl);
	        }
	      );
			} else {
				console.log(added_pics[i]);
				newUrl = URL.createObjectURL(added_pics[i]);
			}

			urls_to_store.push(newUrl);
			const newForm = {...LabelStructure};
			forms_to_store.push(newForm);
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
	};

	// DEBUG
	useEffect(() => {
		console.log("\n「");
		console.log("addedPics ↓"); console.log(props.addedPics);
		console.log("addedPicsUrl ↓"); console.log(props.addedPicsUrl);
		console.log("formDataList ↓"); console.log(props.formDataList);
		console.log("completePercentages ↓"); console.log(props.completePercentages);
		console.log("addedLabels ↓"); console.log(props.addedLabels);
		console.log("picAnnotation ↓"); console.log(props.picAnnotation);
		console.log("」\n ");
	}, [
		props.addedPics,
		props.addedPicsUrl,
		props.formDataList,
		props.completePercentages,
		props.addedLabels,
		props.picAnnotation
	]);

	// TODO: handle_remove_pic


/* Viewing and labeling individual picture */

	/**
	 * clickedUrl
	 * Hook for which picture has been clicked on to be individually seen and labeled.
	 */
	const [clickedUrl, setClickedUrl] = useState("");
	const closePop = () => { setClickedUrl(""); }

  // TODO: handle_remove_pic


/* Displaying progress and added labels */

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
    console.log("added_labels_string ↓\n" + added_labels_string); //DEBUG
    props.setAddedLabels((prev) => {
      let newAddedLabels = [...prev];
      newAddedLabels[idx] = added_labels_string;
      return newAddedLabels;
    });
  };

  /* Render */

  /* resize helpers */
  const [GalleryResizeListener, GallerySize] = useResizeAware(); // custom hook "react-resize-aware"
  const [galleryNumCol, setGalleryNumCol] = useState(4); // 4 columns by default
  useEffect(() => {
    setGalleryNumCol(GalleryColumn_helper(GallerySize));
  }, [GallerySize]);

	return (
		<div className="WaitingRoom">
			<div className="WaitingRoomControl">
				<div className="WaitingRoomControl_addpic">
					<div id="add-pic-btn-div">
						<label htmlFor="add-pic-btn" className="Btn_primary">
							<img src={AddPicture} />
							Add picture
						</label>
						<input
							id="add-pic-btn"
							type="file"
							multiple
              accept="image/*"
							//accept="image/*, .heic"
							onChange={handle_add_pic}
							style={{ display: "none" }}
						/>
					</div>
					{props.addedPics.length!==0 ?
						<div className="SubsectionName">
							Total {props.addedPics.length} pictures
						</div>
					: null}
				</div>
				<div className="WaitingRoomControl_selectpic"></div>
				<div className="WaitingRoomControl_addpic">
					<div id="upload-btn-div">
						<button
							className="Btn_primary"
							type="submit"
							onClick={(e) => {
								e.preventDefault();
								props.uploadImages();
							}}
							variant="primary"
							disabled={props.uploadDisabled}
						>
							<img
								src={PublishPicture}
								style={{opacity: props.uploadDisabled ? "20%" : "100%"}}
							/>
							Publish
						</button>
					</div>
				</div>
			</div>
			{props.addedPics.length!==0 ? // check for empty addedPics list. TODO: display tutorial if empty?
				<Masonry
					breakpointCols={{default: galleryNumCol}}
					className="WaitingRoomGallery Gallery"
					columnClassName="GalleryColumn"
				>
					{GalleryResizeListener}
					{props.addedPicsUrl.map((url, idx) => (
						<div className="WaitingPic_container">
							<div className="WaitingPicProgress">
								{props.completePercentages[idx]===0 ?
									<input
										type="image" src={ZeroProgressAddLabel}
										onClick={(e) => {
											e.preventDefault();
											setClickedUrl(url);
										}}
									/>
								:
									<div className="DescriptionHover">
										<div className="Description_elementtohover">
											<CircularProgressbar
												className="WaitingPicProgressBar"
												value={props.completePercentages[idx]}
												text={props.completePercentages[idx] + "%"}
												strokeWidth={16}
												background backgroundPadding={4}
												styles={buildStyles({
													strokeLinecap: "butt",
													textSize: "24px",
													textColor: "#333333",
													pathColor: "#A0D568",
													trailColor: "#EEEEEE",
													backgroundColor: "#FFFFFF",
												})}
											/>
										</div>
										{// Hover progress, show all added labels
										<div className="DescriptionTextBox_container">
											<div className="DescriptionTextBox" style={{"--desbox-color":"#FFFFFF"}}>
												<div className="DescriptionText">
													{props.addedLabels[idx].split('\n').map(str => <>{str}<br/></>)}
												</div>
											</div>
										</div>
										}
									</div>
								}
							</div>
							<img
								className="WaitingPic"
								src={url}
								onClick={(e) => {
									e.preventDefault();
									setClickedUrl(url);
								}}
							/>
						</div>
					))}
				</Masonry>
			:
				<div className="WaitingRoomGallery">
					<div className="HintText">
						<img src={HintText_ArrowUp} />
						No picture added yet. Click here to start!
					</div>
				</div>
			}
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
