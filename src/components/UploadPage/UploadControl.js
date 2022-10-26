import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Masonry from 'react-masonry-css'
import useResizeAware from 'react-resize-aware';
import "../components.css";

/* Assets: */
import { Icon } from '@iconify/react';
import AddPicture from "../../assets/AddPicture@2x.png";
import PublishPicture from "../../assets/PublishPicture@2x.png";
import SucceedIcon from "../../assets/SucceedIcon@2x.png";



/**
 * UploadControl
 * 
 * Before adding any picture:
 *	Takes up full screen and prompt the user to upload picture.
 * After adding picture:
 *	The top bar on the UploadPage for controlling adding and uploading.
 *	Consists of 3 parts:
 *		- add-pic btn
 *		- notification msgs
 *		- upload-pic btn
 * 
 * parent props:
 *	- add_pic_by_click
 *	- add_pic_by_drag
 *	- numAddedPics
 *	- addingPic: whether currently in the process of adding picture to WaitingRoom
 *	- draggingActive: whether in the progress of dragging something (unconfirmed yet if it is a picture)
 *	- dragToAddInvalid: whether any of the pictures just dragged and uploaded is invalid
 *	- uploadingPic: whether currently in the process of uploading picture
 *	- setAddingPic
 *	- upload_all_valid_images
 *	- uploadDisabled
 * 
 * Usage: Parent component is UploadPage.
 */
export default function UploadControl(props) {
	return (
		<div className="UploadControl">

			{/**--- Big add box before adding any picture ---**/}
			{props.numAddedPics === 0 ?
				<div
					className="UploadControl_addpic_bigbox HintText"
					style={{backgroundColor: props.draggingActive==true ? "#EDECED"/*gray-bg*/ : "transparent"}}
					onDragEnter={(e) => { props.add_pic_by_drag(e); }}
				>
					<span> Drag picture here </span>
					<span> or </span>
					<div>
						<label htmlFor="add-pic-btn" className="Link">
							Browse
						</label>
						<input
							id="add-pic-btn"
							type="file"
							multiple
							accept="image/*, .heic"
							onChange={(e) => {
								props.setAddingPic(true); // to indicate adding starts
								props.add_pic_by_click(e);
							}}
							style={{ display: "none" }}
						/>
					</div>

					{/* Div that temporarily covers the entire upload area to help dragging */
					props.draggingActive==true ?
						<div
							style={{ position:"absolute", width:"100%", height:"100%" }}
							onDragEnter={(e) => { props.add_pic_by_drag(e); }}
							onDragLeave={(e) => { props.add_pic_by_drag(e); }}
							onDragOver={(e) => { props.add_pic_by_drag(e); }}
							onDrop={(e) => { props.add_pic_by_drag(e); }}
						></div> // empty div to cover the draggable field and help the add_pic_by_drag function
					: null }

					{/**--- Information about added pics and messages ---**/}
					<div className="AddPicBigBox_notification">
						<UploadMessage
							numAddedPics={props.numAddedPics}
							addingPic={props.addingPic}
							dragToAddInvalid={props.dragToAddInvalid}
							uploadingPic={props.uploadingPic}
						/>
					</div>
				</div>
			:
				<>

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
									props.setAddingPic(true); // to indicate adding starts
									props.add_pic_by_click(e);
								}}
								style={{ display: "none" }}
							/>
						</div>

						{/**--- Information about added pics and messages ---**/}
						<UploadMessage
							numAddedPics={props.numAddedPics}
							addingPic={props.addingPic}
							dragToAddInvalid={props.dragToAddInvalid}
							uploadingPic={props.uploadingPic}
						/>
					</div>

					{/**--- Upload picture section ---**/}
					<div className="UploadControl_uploadpic_div">
						<div id="upload-btn-div">
							<button
								className="Btn_primary"
								type="submit"
								onClick={(e) => {
									e.preventDefault();
									props.upload_all_valid_images();
								}}
								variant="primary"
								disabled={props.uploadDisabled}
							>
								<img
									srcSet={PublishPicture+" 2x"}
									style={{opacity: props.uploadDisabled ? "20%" : "100%"}}
								/>
								Publish
							</button>
						</div>
					</div>

				</>
			}
		</div>
	);
}

/**
 * UploadMessage
 * 
 * Custom messages to show the state of picture upload.
 * 
 * parent props:
 *	- numAddedPics
 *	- addingPic: whether currently in the process of adding picture to WaitingRoom
 *	- dragToAddInvalid: whether any of the pictures just dragged and uploaded is invalid
 *	- uploadingPic: whether currently in the process of uploading picture
 * 
 * Usage: Parent component is UploadPage.
 */
function UploadMessage(props) {
	return (
		<div className="HintText">
			{(() => {

				// priority 1: uploading picture
				if (props.uploadingPic === "succeed") {
					return (
						<>
							<img srcSet={SucceedIcon+" 2x"} />
							<span style={{color: "#A0D568"}}>
								Pictures have been uploaded!
							</span>
						</>
					);
				} else if (props.uploadingPic == true) {
					return (
						<>
							<Icon icon="line-md:loading-twotone-loop" />
							Uploading Pictures...
						</>
					);
				}

				// priority 2: adding to waiting room
				if (props.addingPic == true) {
					return (
						<>
							<Icon icon="line-md:loading-twotone-loop" />
							Adding Pictures...
						</>
					);
				}

				// priority 3: invalid adding
				if (props.dragToAddInvalid == true) {
					return (
						<>
							Some or all added picture is invalid.
						</>
					);
				}

				// priority 3: usual state, show number of pictures added
				if (props.numAddedPics !==0) {
					return (
						<>Total {props.numAddedPics} pictures</>
					);
				}
				// TODO: add number of incompletion
			})()}
		</div>
	);
}