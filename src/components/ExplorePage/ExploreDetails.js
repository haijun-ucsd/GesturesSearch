import React, { useState , useEffect, useRef, useLayoutEffect } from 'react';
import '../components.css';
import { labels_data } from "../labels_data.js";
import BodyComponent from '../BodyComponent';

/* Assets: */
import ExploreDetailsCloseBtn from "../../assets/ExploreDetailsCloseBtn@2x.png";



/**
 * ExploreDetails
 *
 * Click on individual picture in the ExploreGallery to see display of details.
 * 
 * Structure: Image, Labels for each category
 *
 * parent props:
 *	- pictureClicked: includes URL, label details, annotation coordinates.
 *	- close_exploredetails
 *
 * references:
 *	https://stackoverflow.com/questions/60679688/how-to-get-all-keys-except-a-certain-one-in-object-keys
 *	https://stackoverflow.com/questions/35191336/how-to-map-a-dictionary-in-reactjs
 * 
 * TODO: add label_display value to labels_data, which might differ from the recorded value.
 *	After adding, Spectators no longer has to be a special case, and Modality body parts can be better displayed.
 */
export default function ExploreDetails(props) {

	/* Helpers for annotation */
	const ClickedPic = useRef();
	const ClickedPicCanvas = useRef();
	const [canvasX, setCanvasX] = useState();
	const [canvasY, setCanvasY] = useState();
	const [canvasAnnotation, setCanvasAnnotation] = useState(undefined);

	const load_canvas = () => {
		const imgWidth = ClickedPic.current.offsetWidth;
		const imgHeight = ClickedPic.current.offsetHeight;
		setCanvasX(imgWidth);
		setCanvasY(imgHeight);
		setCanvasAnnotation(props.pictureClicked["annotation"]);

		// DEBUG
		console.log("loaded picture: [W " + imgWidth + ", H " + imgHeight + "], src: " + ClickedPic.current.src);
		console.log("canvasAnnotation: [" + canvasAnnotation + "]");
	}

	const load_annotation = () => {
		const cvs = ClickedPicCanvas.current;
		const ctx = cvs.getContext('2d');
		ctx.clearRect(0, 0, cvs.width, cvs.height); // clear canvas to reload
		if (canvasAnnotation!==undefined) {
			const imgWidth = ClickedPic.current.offsetWidth;
			const imgHeight = ClickedPic.current.offsetHeight;
			const TLX = canvasAnnotation[0] * imgWidth; // top-left X, convert back from percentage
			const TLY = canvasAnnotation[1] * imgHeight; // top-left Y
			const BRX = canvasAnnotation[2] * imgWidth; // bottom-right X
			const BRY = canvasAnnotation[3] * imgHeight; // bottom-right Y
			ctx.beginPath();
			ctx.rect(TLX, TLY, (BRX-TLX), (BRY-TLY));
			ctx.strokeStyle = "#FFFFFF"/*white*/; ctx.lineWidth = 6;
			ctx.stroke();
			ctx.beginPath();
			ctx.rect(TLX, TLY, (BRX-TLX), (BRY-TLY));
			ctx.strokeStyle = "#ED5564"/*red*/; ctx.lineWidth = 4;
			ctx.stroke();
		}
	};
	useEffect(() => { load_canvas(); }, [ClickedPic.current, props.pictureClicked]); // reload canvas everytime that the displayed picture changes
	useEffect(() => { load_annotation(); }, [canvasX, canvasY, canvasAnnotation]);

	/* Render */
	return (
		<div className="ExploreDetailsMenu">
			<div
				className="ExploreDetailsCloseBtn_container"
				onClick={props.close_exploredetails}
			>
				<img
					className="ExploreDetailsCloseBtn Btn"
					srcSet={ExploreDetailsCloseBtn+" 2x"}
				/>
			</div>
			<div className="ExploreDetailsPic_container">
				<img
					className="ExploreDetailsPic"
					src={props.pictureClicked.url}
					ref={ClickedPic}
				/>
				<canvas
					className="ExploreDetailsPicCanvas"
					ref={ClickedPicCanvas}
					width={canvasX || 0} height={canvasY || 0}
				/>
			</div>
			<div className="DetailsLabels_container"><div className="DetailsLabels">
				{labels_data.map((categoryobj) => // category object
					<div className="DetailsCategory">
						<div className="CategoryHeader">
							<div className={"DetailsCategoryIcon" + " " + categoryobj.icon+"_small"} />
							<div className="HintText">
								{// Special case: modality. Only listing available modalities.
								categoryobj.category === "modality" ?
									<>Available modalities:</>
								:
									<>{categoryobj.category_displaytext}:</>
								}
							</div>
							{/* Not including description for now.
							{(categoryobj.description && categoryobj.description!="") ?
								<DescriptionHover text={categoryobj.description}/> : null
							}*/}
						</div>
						<div className="LabelList">
							{(() => {

								// Special case: spectators. Need to include subcategory names to avoid confusion)
								if (categoryobj.category === "spectators") {
									const spectators_data_arr = Object.entries(props.pictureClicked["spectators"]);
									return (
										<>{spectators_data_arr.map(([subcategory,label]) =>
											<div
												className="Label"
												style={{
													//cursor:"pointer",
													borderColor: categoryobj.color,
													backgroundColor: categoryobj.color+14 // +14 = 8% opacity
												}}
											>
												<span>{subcategory}</span>
												<div
													className="SeparationLine_V"
													style={{ borderColor: categoryobj.color }}
												/>
												<span>{props.pictureClicked[categoryobj.category][subcategory]}</span>
											</div>
										)}</>
									);
								}

								// Special case: modality. Only show available ones.
								else if (categoryobj.category === "modality") {
									const modality_data_arr = props.pictureClicked["modality"];
									let available_modalities = [];
									categoryobj.subcategories.map((subcategoryobj) => {
										if (modality_data_arr[subcategoryobj.subcategory] === true) {
											available_modalities.push(subcategoryobj.subcategory_displaytext);
										}
									});
									return (
										<>{available_modalities.map(bodypart =>
											<div
												className="Label"
												style={{
													//cursor:"pointer",
													borderColor: categoryobj.color,
													backgroundColor: categoryobj.color+14 // +14 = 8% opacity
												}}
											>
												{bodypart}
											</div>
										)}</>
									);
								}

								// Default case.
								else {
									const data_arr = Object.entries(props.pictureClicked[categoryobj.category]);
									return (
										data_arr.map(([subcategory,label]) => {
											if (Array.isArray(props.pictureClicked[categoryobj.category][subcategory])===true) {
												return (
													<>{props.pictureClicked[categoryobj.category][subcategory].map((label) =>
														<div
															className="Label"
															style={{
																//cursor:"pointer",
																borderColor: categoryobj.color,
																backgroundColor: categoryobj.color+14 // +14 = 8% opacity
															}}
														>
															{label}
														</div>
													)}</>
												);
											} else {
												let label = props.pictureClicked[categoryobj.category][subcategory];
												if (label !== "") {
													return (
														<div
															className="Label"
															style={{
																//cursor:"pointer",
																borderColor: categoryobj.color,
																backgroundColor: categoryobj.color+14 // +14 = 8% opacity
															}}
														>
															{label}
														</div>
													);
												}
											}
										})
									);
								}
							})() /* need this extra parathesis to work */}
						</div>
					</div>
				)}
			</div></div>
		</div>
	);
}