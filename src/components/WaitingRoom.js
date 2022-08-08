import React from "react";
import ReactDOM from "react-dom/client";
import "./components.css";
//import { labels_data } from "./labels_data.js";
import { useState } from "react";
import PopUp from "./PopUp";

/**
 * WaitingRoom
 *
 * Waiting room for pictures to be labeled before being uploaded to filebase.
 *
 * parent props:
 *  - uploadImage()
 *  - setAddedPic(): To update addedPic.
 *  - addedPic: All added pictures in the waitingroom gallery.
 *  - setAddedPicUrl(): To update addedPicUrl.
 *  - addedPicUrl: URLs of all added pictures in the waitingroom gallery.
 *
 * hooks:
 *  - addedLabels: View-only list of added labels.
 *
 * references:
 *  https://stackoverflow.com/questions/33766085/how-to-avoid-extra-wrapping-div-in-react
 *  https://stackoverflow.com/questions/43992427/how-to-display-a-image-selected-from-input-type-file-in-reactjs
 *  https://stackoverflow.com/questions/68491348/react-checking-if-an-image-source-url-is-empty-then-return-a-different-url
 *  https://stackoverflow.com/questions/15922344/hide-image-if-src-is-empty
 *  https://levelup.gitconnected.com/how-to-implement-multiple-file-uploads-in-react-4cdcaadd0f6e
 *  https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
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
    // 1. append to the current picture list,
    // 2. create URLs and store them sequentially.
    const added_pics = e.target.files;
    var pics_to_store = [...props.addedPic];
    var urls_to_store = [...props.addedPicUrl];
    for (var i = 0; i < added_pics.length; i++) {
      pics_to_store.push(added_pics[i]);
      urls_to_store.push(URL.createObjectURL(added_pics[i]));
    }
    props.setAddedPic(pics_to_store);
    props.setAddedPicUrl(urls_to_store);
  };

  // TODO: handle_remove_pic


/* Viewing and labeling individual picture */

  /**
   * clickedUrl
   * Hook for which picture has been clicked on to be individually seen and labeled.
   */
  const [clickedUrl, setClickedUrl] = useState("");
  const closePop = () => { setClickedUrl(""); }

  /**
   * addedLabels
   * To record updates in labeling.
   */
  const [addedLabels, setAddedLabels] = useState([]);
  //const clearLabels = () => { setAddedLabels([]); }  // TODO: add "clear labels" button?


/* Render */
  return (
    <div className="WaitingRoom">
      <div className="WaitingRoomControl">
        <div className="WaitingRoomControl_addpic">
          <div id="add-pic-btn-div">
            <label htmlFor="add-pic-btn" className="Btn_primary">
              + Add picture
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
          {props.addedPic.length!==0 ?
            <div className="SubsectionName">
              Total {props.addedPic.length} pictures
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
                alert("Picture is being uploaded!");
                props.uploadImage();
              }}
              variant="primary"
              //disabled={btnDisabled}
            >
              Publish All
            </button>
          </div>
        </div>
      </div>
      <div className="WaitingRoomGallery">
        {props.addedPic != [] ? ( // check for empty addedPic list. TODO: display tutorial if empty?
          <>
            {props.addedPicUrl.map((url) => (
              <>
                <img
                  className="WaitingPic"
                  src={url}
                  onClick={(e) => {
                    e.preventDefault();
                    setClickedUrl(url);
                  }}
                />
                {/*<div className="LabelList">
                  {addedLabels.map((label) => (
                    <div className="Label">{label}</div>
                  ))}
                </div> //TODO: hover to show all added labels */}
              </>
            ))}
          </>
        ) : null}
      </div>
      {(clickedUrl!="") ? (
        <PopUp
          url={clickedUrl}
          closePop={closePop}
          form_change_handler_type1={props.form_change_handler_type1}
          form_change_handler_type2={props.form_change_handler_type2}
          form_change_handler_type3={props.form_change_handler_type3}
          formData={props.formData}
        />
      ) : null}
    </div>
  );
}
