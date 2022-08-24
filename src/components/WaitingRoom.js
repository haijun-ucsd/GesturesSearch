import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import "./components.css";
//import { labels_data } from "./labels_data.js";
import { LabelStructure } from "./components";
import PopUp from "./UploadPopUp";

/**
 * circular progress bar
 * references:
 *  https://www.npmjs.com/package/react-circular-progressbar
 *  codegrepper.com/code-examples/javascript/import+%7B+CircularProgressbar%2C+buildStyles+%7D+from+%27react-circular-progressbar%27%3B
 */
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

/* Assets: */
import AddPicture from "../assets/AddPicture.png";
import PublishPicture from "../assets/PublishPicture.png";
import HintText_ArrowUp from "../assets/HintText_ArrowUp.png";

/**
 * WaitingRoom
 *
 * Waiting room for pictures to be labeled before being uploaded to filebase.
 *
 * parent props:
 *  - uploadDisabled: Whether to disable the upload btn.
 *  - uploadImages(): Method to upload images.
 *  - setAddedPics(): To update addedPics.
 *  - addedPics: All added pictures in the waitingroom gallery.
 *  - setAddedPicsUrl(): To update addedPicsUrl.
 *  - addedPicsUrl: URLs of all added pictures in the waitingroom gallery.
 *  - setFormDataList(): To update formDataList.
 *  - formDataList: List of all formDatas corrsponding to each picture.
 *  - setCompletePercentages(): To update completePercentages.
 *  - completePercentages: For progress bar and validation.
 *
 * references:
 *  https://stackoverflow.com/questions/33766085/how-to-avoid-extra-wrapping-div-in-react
 *  https://stackoverflow.com/questions/43992427/how-to-display-a-image-selected-from-input-type-file-in-reactjs
 *  https://stackoverflow.com/questions/68491348/react-checking-if-an-image-source-url-is-empty-then-return-a-different-url
 *  https://stackoverflow.com/questions/15922344/hide-image-if-src-is-empty
 *  https://levelup.gitconnected.com/how-to-implement-multiple-file-uploads-in-react-4cdcaadd0f6e
 *  https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
 *  https://stackoverflow.com/questions/60134596/create-react-app-without-typescript-got-error-failed-to-load-parser-types
 *  https://stackoverflow.com/questions/52641492/how-to-get-the-index-of-selected-element-in-react-native-array
 *  https://stackoverflow.com/questions/9334636/how-to-create-a-dialog-with-ok-and-cancel-options
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

    // Loop through all images to append to:
    //  1. append to the current picture list,
    //  2. create URLs and store them sequentially.
    const added_pics = e.target.files;
    var pics_to_store = [...props.addedPics];
    var urls_to_store = [...props.addedPicsUrl];
    var forms_to_store = [...props.formDataList];
    var percentages_to_store = [...props.completePercentages];
    for (var i = 0; i < added_pics.length; i++) {
      pics_to_store.push(added_pics[i]);
      const newUrl = URL.createObjectURL(added_pics[i]);
      urls_to_store.push(newUrl);
      const newForm = { ...LabelStructure, url: newUrl };
      forms_to_store.push(newForm);
      percentages_to_store.push(0);
    }
    props.setAddedPics(pics_to_store);
    props.setAddedPicsUrl(urls_to_store);
    props.setFormDataList(forms_to_store);
    props.setCompletePercentages(percentages_to_store);
  };

  // TODO: handle_remove_pic

  /* Viewing and labeling individual picture */

  /**
   * clickedUrl
   * Hook for which picture has been clicked on to be individually seen and labeled.
   */
  const [clickedUrl, setClickedUrl] = useState("");
  const closePop = () => {
    setClickedUrl("");
  };

  /* Render */
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
              accept="image/*" // TODO: cannot accept heic yet, possible workaround: https://stackoverflow.com/questions/57127365/make-html5-filereader-working-with-heic-files
              onChange={handle_add_pic}
              style={{ display: "none" }}
            />
          </div>
          {props.addedPics.length !== 0 ? (
            <div className="SubsectionName">
              Total {props.addedPics.length} pictures
            </div>
          ) : null}
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
                style={{ opacity: props.uploadDisabled ? "20%" : "100%" }}
              />
              Publish
            </button>
          </div>
        </div>
      </div>
      <div className="WaitingRoomGallery">
        {props.addedPics.length !== 0 ? ( // check for empty addedPics list. TODO: display tutorial if empty?
          <>
            {props.addedPicsUrl.map((url, idx) => (
              <div
                key={`WaitingPic_container-${idx}`}
                className="WaitingPic_container"
              >
                <div className="WaitingPicProgress">
                  <CircularProgressbar
                    value={props.completePercentages[idx]}
                    text={props.completePercentages[idx] + "%"}
                    strokeWidth={16}
                    background
                    backgroundPadding={4}
                    styles={buildStyles({
                      strokeLinecap: "butt",
                      textSize: "24px",
                      textColor: "#333333",
                      pathColor: "#A0D568",
                      trailColor: "#EEEEEE",
                      backgroundColor: "#FFFFFF",
                    })}
                  />
                  {/*<div className="LabelList">
                    {addedLabels.map((label) => (
                      <div className="Label">{label}</div>
                    ))}
                  </div> //TODO: hover progress to show all added labels */}
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
          </>
        ) : (
          <div className="HintText">
            <img src={HintText_ArrowUp} />
            No picture added yet. Click here to start!
          </div>
        )}
      </div>
      {clickedUrl != "" ? (
        <PopUp
          url={clickedUrl}
          closePop={closePop}
          formDataList={props.formDataList}
          setFormDataList={props.setFormDataList}
          formDataIndex={props.addedPicsUrl.findIndex(
            (item) => item === clickedUrl
          )}
          setCompletePercentages={props.setCompletePercentages}
          completePercentages={props.completePercentages}
        />
      ) : null}
    </div>
  );
}
