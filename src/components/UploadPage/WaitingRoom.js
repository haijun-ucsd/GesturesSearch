import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import Masonry from 'react-masonry-css'
import useResizeAware from 'react-resize-aware';
import "../components.css";
import { GalleryColumn_helper } from "../components";

/**
 * circular progress bar
 * references:
 *	https://www.npmjs.com/package/react-circular-progressbar
 *	codegrepper.com/code-examples/javascript/import+%7B+CircularProgressbar%2C+buildStyles+%7D+from+%27react-circular-progressbar%27%3B
 */
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

/* Assets: */
import HintText_ArrowUp from "../../assets/HintText_ArrowUp@2x.png";
import ZeroProgressAddLabel from "../../assets/ZeroProgressAddLabel@2x.png";
import NoBtn from "../../assets/NoBtn@2x.png";



/**
 * WaitingRoom
 *
 * Waiting room for pictures to be labeled before being uploaded to filebase.
 *
 * parent props:
 *	- handle_remove_pic(): To remove picture from WaitingRoom.
 *	- addedPics: All added pictures in Waitingroom.
 *	- addedPicsUrl: URLs of all added pictures in the waitingroom gallery.
 *	- completePercentages: For progress bar and validation.
 *	- addedLabels: Strings of added labels to display upon hovering the progress.
 *	- setClickedUrl: To reset the URL of the picture that has been clicked on to view individually, clickedUrl=="" means no picture expanded.
 *
 * references:
 *	https://stackoverflow.com/questions/33766085/how-to-avoid-extra-wrapping-div-in-react
 *	https://stackoverflow.com/questions/43992427/how-to-display-a-image-selected-from-input-type-file-in-reactjs
 *	https://stackoverflow.com/questions/68491348/react-checking-if-an-image-source-url-is-empty-then-return-a-different-url
 *	https://stackoverflow.com/questions/15922344/hide-image-if-src-is-empty
 *	https://levelup.gitconnected.com/how-to-implement-multiple-file-uploads-in-react-4cdcaadd0f6e
 *	https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept
 *	https://stackoverflow.com/questions/60134596/create-react-app-without-typescript-got-error-failed-to-load-parser-types
 *	https://stackoverflow.com/questions/52641492/how-to-get-the-index-of-selected-element-in-react-native-array
 *	https://stackoverflow.com/questions/9334636/how-to-create-a-dialog-with-ok-and-cancel-options
 * 
 * TODO: add zooming animation when opening and closing picture, to better indicate to the user which picture in the gallery is being or has been modified.
 */
export default function WaitingRoom(props) {

	/* Resize helpers */
	const [GalleryResizeListener, GallerySize] = useResizeAware(); // custom hook "react-resize-aware"
	const [galleryNumCol, setGalleryNumCol] = useState(4); // 4 columns by default
	useEffect(() => {
		setGalleryNumCol(GalleryColumn_helper(GallerySize));
	}, [GallerySize]);

	/* Render */
	return (
		<div
			className="WaitingRoom"
			style={{backgroundColor: props.draggingActive==true ? "#CCCCCC"/*gray-mid*/ : "#EDECED"/*gray-bg*/}}
			onDragEnter={props.add_pic_by_drag}
		>
			{props.addedPics.length!==0 ? // check for empty addedPics list. TODO: display tutorial if empty?
				<Masonry
					breakpointCols={{default: galleryNumCol}}
					className="Gallery"
					style={{justifyContent: (galleryNumCol >= props.addedPics.length) ? "left" : "center"}}
					columnClassName="GalleryColumn"
				>
					{GalleryResizeListener}
					{props.addedPicsUrl.map((url, idx) => (
						<div className="WaitingPic_container">
							<div className="WaitingPicProgress">
								{props.completePercentages[idx]===0 ?
									<img
										srcSet={ZeroProgressAddLabel+" 2x"}
										onClick={(e) => {
											e.preventDefault();
											props.setClickedUrl(url);
										}}
										className="Btn"
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
													{props.addedLabels[idx] ? props.addedLabels[idx].split('\n').map(str => <>{str}<br/></>) : ""}
												</div>
											</div>
										</div>
										}
									</div>
								}
							</div>
							<div className="WaitingPicRemover_outercontainer">
								<div
									className="Btn_small WaitingPicRemover_innercontainer"
									onClick={(e) => {
										e.preventDefault();
										props.handle_remove_pic(idx);
									}}
								>
									<img
										className="WaitingPicRemover"
										srcSet={NoBtn+" 2x"}
									/>
								</div>
							</div>
							<img
								className="WaitingPic"
								src={url}
								onClick={(e) => {
									e.preventDefault();
									props.setClickedUrl(url);
								}}
								onLoad = {(e) => {
									props.unify_image_format(e, idx);
								}}
							/>
						</div>
					))}
				</Masonry>
			:
				<div className="WaitingRoomGallery">
					<div className="HintText">
						<img srcSet={HintText_ArrowUp+" 2x"} />
						No picture added yet. Click here to start!
					</div>
				</div>
			}
			{/* Div that temporarily covers the entire upload area to help dragging */
			props.draggingActive==true ?
				<div
					style={{ position:"absolute", top: "0", left: "0", width:"100%", height:"100%" }}
					onDragEnter={props.add_pic_by_drag}
					onDragLeave={props.add_pic_by_drag}
					onDragOver={props.add_pic_by_drag}
					onDrop={props.add_pic_by_drag}
				></div> // empty div to cover the draggable field and help the add_pic_by_drag function
			: null }
		</div>
	);
}