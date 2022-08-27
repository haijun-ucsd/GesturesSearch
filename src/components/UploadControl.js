import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Masonry from 'react-masonry-css'
import useResizeAware from 'react-resize-aware';
import "./components.css";

/* Assets: */
import { Icon } from '@iconify/react';
import AddPicture from "../assets/AddPicture.png";
import PublishPicture from "../assets/PublishPicture.png";



/**
 * UploadControl
 * 
 * The top bar on the UploadPage for controlling adding and uploading.
 * 
 * parent props:
 *	- handle_add_pic
 *	- numAddedPics
 *	- addingPic
 *	- setAddingPic
 *	- uploadImages
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
				{props.addingPic == true ?
					<>
						<Icon icon="line-md:loading-twotone-loop" />
						Adding Pictures...
					</>
				:
					<>{props.numAddedPics !==0 ?
							<>Total {props.numAddedPics} pictures</>
					: null}</>
				}
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
	);
}