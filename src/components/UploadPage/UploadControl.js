import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Masonry from 'react-masonry-css'
import useResizeAware from 'react-resize-aware';
import "../components.css";

/* Assets: */
import { Icon } from '@iconify/react';
import AddPicture from "../../assets/AddPicture.png";
import PublishPicture from "../../assets/PublishPicture.png";
import SucceedIcon from "../../assets/SucceedIcon.png";



/**
 * UploadControl
 * 
 * The top bar on the UploadPage for controlling adding and uploading.
 * Consists of 3 parts:
 *	- add-pic btn
 *	- notification msgs
 *	- upload-pic btn
 * 
 * parent props:
 *	- handle_add_pic
 *	- numAddedPics
 *	- addingPic: whether currently in the process of adding picture to WaitingRoom
 *	- uploadingPic: whether currently in the process of uploading picture
 *	- setAddingPic
 *	- upload_all_valid_images
 *	- uploadDisabled
 */
export default function UploadControl(props) {
	return (
		<div className="UploadControl">
			<div className="UploadControl_addpic">
				<div id="add-pic-btn-div">
					<label htmlFor="add-pic-btn" className="Btn_primary">
						<img src={AddPicture} />
						Add picture
					</label>
					<input
						id="add-pic-btn"
						type="file"
						multiple
						accept="image/*, .heic"
						onChange={(e) => {
							props.setAddingPic(true); // to indicate adding starts
							props.handle_add_pic(e);
						}}
						style={{ display: "none" }}
					/>
				</div>
				<div className="HintText">

					{/* Custom messages */
					(() => {

						// priority 1: uploading picture
						if (props.uploadingPic === "succeed") {
							return (
								<>
									<img src={SucceedIcon} />
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

						// priority 3: usual state, show number of pictures added
						if (props.numAddedPics !==0) {
							return (
								<>Total {props.numAddedPics} pictures</>
							);
						}
						// TODO: add number of incompletion
					})()}

				</div>
			</div>
			<div className="UploadControl_selectpic"></div>
			<div className="UploadControl_addpic">
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
							src={PublishPicture}
							style={{opacity: props.uploadDisabled ? "20%" : "100%"}}
						/>
						Publish
					</button>
				</div>
			</div>
		</div>
	);
}