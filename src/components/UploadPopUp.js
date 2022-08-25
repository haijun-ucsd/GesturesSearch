import React, { Component, useState, useEffect, useRef } from "react";
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css'
import { CheckLabel, SearchableDropdown, DescriptionHover, FetchLabelList_helper } from './components';
import './components.css';
import { labels_data } from "./labels_data.js";
import BodyComponent from './BodyComponent';

/* Assets: */
import PopUpCloseBtn from "../assets/PopUpCloseBtn.png";
import EditPicIcon from "../assets/EditPicIcon.png";



/**
 * UploadPopUp
 *
 * parents props:
 *	- url: URL of the picture that has been clicked on.
 *	- dataIndex: Index of the data corresponding to the current picture.
 *	- closePop()
 *	- formDataList: Full list of formData, will only use and modify at dataIndex.
 *	- setFormDataList(): To update formDataList, will only use on formDataList[dataIndex].
 *	- setCompletePercentages(): To update completePercentages.
 *	- completePercentages: For progress bar and validation.
 *	- picAnnotation: Annotation on pictures.
 *	- setPicAnnotation(): To update picAnnotation.
 * 
 * TODO: close PopUp when clicking outside of the modal.
 */
export default function UploadPopUp(props) {

/* Poping and saving of the PopUp */

	const required_fields = [
		{category: "location", subcategories: ["in_outdoor", "site"]},
		{category: "spectators", subcategories: ["quantity", "density", "attentive"]},
		{category: "posture"},
	];
	const optional_fields = [
		{category: "location", subcategories: ["archi_compo"]},
		{category: "demographic", subcategories: ["age", "sex", "social_role"]},
	];
	const close_pop_and_save = () => {

		console.log("Save and close PopUp."); //DEBUG

		// Update completePercentage by checking all required fields that needs to be validated.
		// Percentage calculation:
		//	required field = 16%
		//	optional field = 1%
		//	≥96% = 100%, because 6*16=96.
		props.setCompletePercentages((prev) => {
			console.log("Checking progress..."); //DEBUG
			let newCompletePercentages = [...prev];
			let percentage = 0;

			// Calculate required fields.
			for (let i = 0; i < required_fields.length; i++) {
				const category = required_fields[i].category;
				if (required_fields[i].subcategories !== undefined) {
					for (let j = 0; j < required_fields[i].subcategories.length; j++) {
						const subcategory = required_fields[i].subcategories[j];
						if ((
							Array.isArray(formData[category][subcategory])
							&& formData[category][subcategory].length !== 0
							) || (
							(!Array.isArray(formData[category][subcategory]))
							&& formData[category][subcategory] !== ""
						)) {
							console.log("Required field '" + subcategory + "' is filled ↓"); console.log(formData[category][subcategory]); //DEBUG
							percentage += 17; // 100/6≈17
						}
					}
				} else {
					if ((
						Array.isArray(formData[category])
						&& formData[category].length !== 0
						) || (
						(!Array.isArray(formData[category]))
						&& formData[category] !== ""
					)) {
						console.log("Required field '" + category + "' is filled ↓"); console.log(formData[category]); //DEBUG
						percentage += 16;
					}
				}
			}

			// Calculate optional fields.
			for (let i = 0; i < optional_fields.length; i++) {
				const category = optional_fields[i].category;
				for (let j = 0; j < optional_fields[i].subcategories.length; j++) {
					const subcategory = optional_fields[i].subcategories[j];
					if ((
						Array.isArray(formData[category][subcategory])
						&& formData[category][subcategory].length !== 0
						) || (
						(!Array.isArray(formData[category][subcategory]))
						&& formData[category][subcategory] !== ""
					)) {
						console.log("Optional field '" + subcategory + "' is filled ↓"); console.log(formData[category][subcategory]); //DEBUG
						console.log(formData);
						percentage += 1;
					}
				}
			}

			// Accumulate and validate.
			if (percentage >= 96) { percentage = 100; }
			newCompletePercentages[props.dataIndex] = percentage;
			return newCompletePercentages;
		});

		// Update addedLabels.
		props.reprint_added_labels(props.dataIndex, formData);

		// Update formDataList.
		props.setFormDataList((prev) => {
			let newFormDataList = [...prev];
			newFormDataList[props.dataIndex] = formData;
			return newFormDataList;
		});

		// Update Annotation state, store as percentage in relationship to picture height and width.
		props.setPicAnnotation((prev) => {
			let newPicAnnotation = [...prev];
			newPicAnnotation[props.dataIndex] = [annotateStartX/canvasX, annotateStartY/canvasY, annotateEndX/canvasX, annotateEndY/canvasY];
			return newPicAnnotation;
		});

		// Close the pop-up window.
		props.closePop();
	}


/* To handle update of formData */

	/**
	 * formData of this individual picture, will store into formDataList upon closing.
	 */
	const [formData, setFormData] = useState(props.formDataList[props.dataIndex]);
	// DEBUG
	useEffect(() => {
		console.log("updated formData ↓"); console.log(formData);
		//console.log("current formDataList ↓"); console.log(props.formDataList);
	}, [formData]);

	/**
	 * Handle update in type 1 subcategories.
	 * 
	 * references:
	 *	https://stackoverflow.com/questions/58478289/react-hooks-cannot-assign-to-read-only-property
	 */
	const form_change_handler_type1 = (e, categoryname, subcategoryname) => {
		//e.preventDefault();
		console.log("form_change_handler_type1"); //DEBUG

		// Update formData by changing the value of the current subcategory.
		setFormData((prev) => {
			console.log(
				"before change: " +
					categoryname +
					" >> " +
					subcategoryname +
					" >> " +
					prev[categoryname][subcategoryname]
			); //DEBUG
			let newFormData = {
				...prev,
				[categoryname]: {
					...prev[categoryname],
					[subcategoryname]: e.target.value,
				},
			};
			console.log(
				"after change: " +
					categoryname +
					" >> " +
					subcategoryname +
					" >> " +
					newFormData[categoryname][subcategoryname]
			); //DEBUG
			return newFormData;
		});
	};

	/**
	 * Handle update in type 2 subcategories.
	 *
	 * references:
	 *	https://www.robinwieruch.de/react-add-item-to-list/
	 *	https://stackoverflow.com/questions/58478289/react-hooks-cannot-assign-to-read-only-property
	 */
	const form_change_handler_type2 = (e, checked, categoryname, subcategoryname) => {
		//e.preventDefault();
		console.log("form_change_handler_type2"); //DEBUG
		console.log("event target value: " + e.target.value); //DEBUG
		console.log("checked flag: " + checked); //DEBUG

		// Update formData by modifying the list of the current subcategory.
		// Toggle: when exists, remove; when doesn't exist, add.

		// Special case: posture. No subcatrgory layer when storing.
		if (categoryname === "posture") {
			if (checked) {
				// Add label.
				setFormData((prev) => {
					console.log("before change: posture >> ↓");
					console.log(prev["posture"]); //DEBUG
					let newArr = [...prev["posture"], e.target.value];
					let newFormData = {
						...prev,
						["posture"]: newArr,
					};
					console.log("after change: posture >> ↓");
					console.log(newFormData["posture"]); //DEBUG
					return newFormData;
				});
			} else {
				// Remove label.
				setFormData((prev) => {
					console.log("before change: posture >> ↓");
					console.log(prev["posture"]); //DEBUG
					let newArr = prev["posture"].filter(
						(item) => item !== e.target.value
					);
					let newFormData = {
						...prev,
						["posture"]: newArr,
					};
					console.log("after change: posture >> ↓");
					console.log(newFormData["posture"]); //DEBUG
					return newFormData;
				});
			}
		}

		// Default case.
		else {
			if (checked) {
				// Add label.
				setFormData((prev) => {
					console.log("before change: " + categoryname + " >> " + subcategoryname + " >> ↓"); console.log(prev[categoryname][subcategoryname]); //DEBUG
					let newArr = [...prev[categoryname][subcategoryname], e.target.value];
					let newFormData = {
						...prev,
						[categoryname]: {
							...prev[categoryname],
							[subcategoryname]: newArr,
						},
					};
					console.log("after change: " + categoryname + " >> " + subcategoryname + " >> ↓"); console.log(newFormData[categoryname][subcategoryname]); //DEBUG
					return newFormData;
				});
			} else {
				// Remove label.
				setFormData((prev) => {
					console.log("before change: " + categoryname + " >> " + subcategoryname + " >> ↓"); console.log(prev[categoryname][subcategoryname]); //DEBUG
					let newArr = prev[categoryname][subcategoryname].filter(
						(item) => item !== e.target.value
					);
					let newFormData = {
						...prev,
						[categoryname]: {
							...prev[categoryname],
							[subcategoryname]: newArr,
						},
					};
					console.log("after change: " + categoryname + " >> " + subcategoryname + " >> ↓"); console.log(newFormData[categoryname][subcategoryname]); //DEBUG
					return newFormData;
				});
			}
		}
	};

	const add_label_handler_type2 = (label, categoryname, subcategoryname) => {

		// Special case: posture. No subcatrgory layer when storing.
		if (categoryname === "posture") {
			setFormData((prev) => {
				console.log("before change (add): posture >> ↓"); console.log(prev["posture"]); //DEBUG
				let newArr = [...prev["posture"], label];
				let newFormData = {
					...prev,
					["posture"]: newArr,
				};
				console.log("after change (add): posture >> ↓"); console.log(newFormData["posture"]); //DEBUG
				return newFormData;
			});
		}

		// Default case.
		else {
			setFormData((prev) => {
				console.log("before change (add): " + categoryname + " >> " + subcategoryname + " >> ↓"); console.log(prev[categoryname][subcategoryname]); //DEBUG
				let newArr = [...prev[categoryname][subcategoryname], label];
				let newFormData = {
					...prev,
					[categoryname]: {
						...prev[categoryname],
						[subcategoryname]: newArr,
					},
				};
				console.log("after change (add): " + categoryname + " >> " + subcategoryname + " >> ↓"); console.log(newFormData[categoryname][subcategoryname]); //DEBUG
				return newFormData;
			});
		}
	};

	const remove_label_handler_type2 = (label, categoryname, subcategoryname) => {

		// Special case: posture. No subcatrgory layer when storing.
		if (categoryname === "posture") {
			setFormData((prev) => {
				console.log("before change (remove): posture >> ↓"); console.log(prev["posture"]); //DEBUG
				let newArr = prev["posture"].filter(
					(item) => item !== label
				);
				let newFormData = {
					...prev,
					["posture"]: newArr,
				};
				console.log("after change (remove): posture >> ↓"); console.log(newFormData["posture"]); //DEBUG
				return newFormData;
			});
		}

		// Default case.
		else {
			setFormData((prev) => {
				console.log("before change (remove): " + categoryname + " >> " + subcategoryname + " >> ↓"); console.log(prev[categoryname][subcategoryname]); //DEBUG
				let newArr = prev[categoryname][subcategoryname].filter(
					(item) => item !== label
				);
				let newFormData = {
					...prev,
					[categoryname]: {
						...prev[categoryname],
						[subcategoryname]: newArr,
					},
				};
				console.log("after change (remove): " + categoryname + " >> " + subcategoryname + " >> ↓"); console.log(newFormData[categoryname][subcategoryname]); //DEBUG
				return newFormData;
			});
		}
	}

	/**
	 * Handle update in type 3 (modality) subcategories.
	 */
	const form_change_handler_type3 = (target) => {

		console.log("form_change_handler_type3"); //DEBUG

		const bodypart = target.id || target.parentElement.id; // could be either depending on clicking position
		const newModality = { ...formData.modality }; // snapshot previous formData.modality, prepare for update
		console.log("bodypart: " + bodypart); //DEBUG

		// Update formData by toggling the value of the current subcategory.
		setFormData((prev) => {
			console.log("before change: modality >> " + bodypart + " >> " + prev["modality"][bodypart]); //DEBUG
			let newFormData = {
				...prev,
				["modality"]: {
					...prev["modality"],
					[bodypart]: !prev["modality"][bodypart],
				},
			};
			console.log("after change: modality >> " + bodypart + " >> " + newFormData["modality"][bodypart]); //DEBUG
			return newFormData;
		});
	};


/* To handle canvas overlay for image annotation */

	const UploadPopUpPic = useRef();
	const UploadPopUpCanvas = useRef();
	const [canvasX, setCanvasX] = useState();
	const [canvasY, setCanvasY] = useState();

	const [annotated, setAnnotated] = useState(false);
	const [annotateStartX, setAnnotateStartX] = useState(props.picAnnotation[props.dataIndex][0]); // in percentage here
	const [annotateStartY, setAnnotateStartY] = useState(props.picAnnotation[props.dataIndex][1]);
	const [annotateEndX, setAnnotateEndX] = useState(props.picAnnotation[props.dataIndex][2]);
	const [annotateEndY, setAnnotateEndY] = useState(props.picAnnotation[props.dataIndex][3]);
	const [annotationInProgress, setAnnotationInProgress] = useState(false); // whether annotation is in progress

	/**
	 * references:
	 *	https://wincent.com/wiki/clientWidth_vs_offsetWidth_vs_scrollWidth#:~:text=clientWidth%20is%20the%20inner%20width,element%2C%20including%20padding%20and%20borders)
	 *	https://codesandbox.io/s/affectionate-wildflower-jov21
	 */
	const canvas_setup = () => {
		const imgWidth = UploadPopUpPic.current.offsetWidth;
		const imgHeight = UploadPopUpPic.current.offsetHeight;
		console.log("loaded picture: [offsetWidth " + imgWidth + ", offsetHeight " + imgHeight + "]"); //DEBUG
		setCanvasX(imgWidth);
		setCanvasY(imgHeight);
		if (
			annotateStartX!==0
			&& annotateStartY!==0
			&& annotateEndX!==0
			&& annotateEndY!==0
		) {
			setAnnotateStartX(props.picAnnotation[props.dataIndex][0] * imgWidth); // turn percentage into pixel
			setAnnotateStartY(props.picAnnotation[props.dataIndex][1] * imgHeight);
			setAnnotateEndX(props.picAnnotation[props.dataIndex][2] * imgWidth);
			setAnnotateEndY(props.picAnnotation[props.dataIndex][3] * imgHeight);
			console.log("already annotated: " + props.picAnnotation[props.dataIndex]); //DEBUG
			console.log("already annotated: [↖X " + annotateStartX + ", ↖Y " + annotateStartY + ", ↘X " + annotateEndX + ", ↘Y " + annotateEndY + "]"); //DEBUG
			setAnnotated(true);
			draw_rectangle();
		}
	};
	useEffect(() => canvas_setup(), [UploadPopUpPic.current]);

	const draw_rectangle = () => {

		// Set up canvas.
		const cvs = UploadPopUpCanvas.current;
		const ctx = cvs.getContext('2d');
		ctx.clearRect(0, 0, cvs.width, cvs.height); // clear previous rectangle

		// Draw new rectangle.
		ctx.beginPath(); // begin drawing outer white outline
		ctx.rect(annotateStartX, annotateStartY, (annotateEndX-annotateStartX), (annotateEndY-annotateStartY)); // set size
		ctx.strokeStyle = "#FFFFFF"/*white*/; ctx.lineWidth = 6; // set style
		ctx.stroke();
		ctx.beginPath(); // begin drawing inner red line
		ctx.rect(annotateStartX, annotateStartY, (annotateEndX-annotateStartX), (annotateEndY-annotateStartY));
		ctx.strokeStyle = "#ED5564"/*red*/; ctx.lineWidth = 4;
		ctx.stroke();
	}

	/**
	 * references:
	 *	https://stackoverflow.com/questions/52169194/drawing-a-straight-line-using-mouse-events-on-canvas-in-reactjs
	 *	https://stackoverflow.com/questions/2142535/how-to-clear-the-canvas-for-redrawing
	 *	https://www.w3schools.com/tags/canvas_strokestyle.asp
	 *	https://www.w3schools.com/tags/canvas_linewidth.asp
	 */
	const canvas_annotate_start = (e) => {
		setAnnotationInProgress(true);
		setAnnotated(true);
		setAnnotateStartX(e.offsetX);
		setAnnotateStartY(e.offsetY);
		console.log("canvas annotation starts: [" + e.offsetX + ", " + e.offsetY + "]"); //DEBUG
	}
	const canvas_annotate_end = (e) => {
		setAnnotateEndX(e.offsetX);
		setAnnotateEndY(e.offsetY);
		console.log("canvas annotation ends: [" + e.offsetX + ", " + e.offsetY + "]"); //DEBUG
		setAnnotationInProgress(false);
	}
	const canvas_annotate_inprogress = (e) => {
		if (annotationInProgress===true) {
			setAnnotateEndX(e.offsetX);
			setAnnotateEndY(e.offsetY);
			//console.log("canvas annotation in progress: [" + e.offsetX + ", " + e.offsetY + "]"); //DEBUG
		}
	}

	// Draw rectangle when annotation ends.
	useEffect(() => {
		if (annotateStartX===annotateEndX && annotateStartY===annotateEndY) { return; } // avoid deleting rectangle when clicking image
		draw_rectangle();
	}, [annotateEndX, annotateEndY])

	const clear_annotation = () => {
		const cvs = UploadPopUpCanvas.current;
		const ctx = cvs.getContext('2d');
		ctx.clearRect(0, 0, cvs.width, cvs.height); // clear canvas
		setAnnotated(false); // reset annotation state
		setAnnotateStartX(0);
		setAnnotateStartY(0);
		setAnnotateEndX(0);
		setAnnotateEndY(0);
	}


/* Render */
	return (
		<div className="PopUpOverlay">
			<div className="UploadPopUpModal_container">
				<div className="UploadPopUpModal">
					<div className="UploadPopUpPic_outercontainer"><div className="UploadPopUpPic_innercontainer">
						<img
							className="UploadPopUpPic"
							src={props.url}
							ref={UploadPopUpPic}
						/>
						<canvas
							className="UploadPopUpCanvas"
							ref={UploadPopUpCanvas}
							width={canvasX || 0} height={canvasY || 0}
							onMouseDown={(e)=>{canvas_annotate_start(e.nativeEvent);}}
							onMouseUp={(e)=>{canvas_annotate_end(e.nativeEvent);}}
							onMouseMove={(e)=>{canvas_annotate_inprogress(e.nativeEvent);}}
						/>
					</div></div>
					<LabelsForm
						form_change_handler_type1={form_change_handler_type1}
						form_change_handler_type2={form_change_handler_type2}
						add_label_handler_type2={add_label_handler_type2}
						remove_label_handler_type2={remove_label_handler_type2}
						form_change_handler_type3={form_change_handler_type3}
						formData={formData}
						annotated={annotated}
						clear_annotation={clear_annotation}
					/>
				</div>
				<input
					className="PopUpClose"
					type="image" src={PopUpCloseBtn} 
					onClick={close_pop_and_save}
				/>
			</div>
		</div>
	);
}



/**
 * LabelsForm
 *
 * The form to guide labeling.
 * TODO: Currently implemented with a fixed dummy list, will replace with fetching data from database.
 *
 * parent props:
 *  - form_change_handler_type1 (e, categoryname, subcategoryname)
 *  - form_change_handler_type2 (e, checked, categoryname, subcategoryname)
 *		- add_label_handler_type2
 *		- remove_label_handler_type2
 *  - form_change_handler_type3 (e, categoryname)
 *  - formData: Up-to-date form data for displaying preview (eg. modality states).
 *	- annotated: Whether the picture has been annotated by drawing rectangle.
 *	- clear_annotation: To clear annotation on picture.
 *
 * references:
 *  https://stackoverflow.com/questions/35537229/how-can-i-update-the-parents-state-in-react
 *  https://stackoverflow.com/questions/43040721/how-to-update-nested-state-properties-in-react
 *  https://stackoverflow.com/questions/57798841/react-setting-state-for-deeply-nested-objects-w-hooks
 */
function LabelsForm(props) {

	/**
	 * render_category
	 * 
	 * To render the entire module of one category, set color accordingly.
	 * 
	 * references:
	 *  https://stackoverflow.com/questions/44046037/if-else-statement-inside-jsx-reactjs
	 *  https://stackoverflow.com/questions/42330075/is-there-a-way-to-interpolate-css-variables-with-url
	 */
	const render_category = (category) => {

		// Determine color according to category.
		var color = category.color;

		// Render subcategories.
		return (
			<div className="FormCategory">
				<div className="CategoryHeader">
					<div
						className={"CategoryIcon" + " " + category.icon}
						style={{"--categoryicon-color":color}}
					/>
					<div
						className="CategoryName"
						style={{color:color}}
					>
						{category.category_displaytext}

						{// Special case: modality, posture. RequiredField indicators should be put after CategoryName.
						category.category === 'posture' || category.category === 'modality' ?
							<span className="RequiredField">*</span>
						: null}
					</div>
					{(category.description && category.description!="") ?
						<DescriptionHover text={category.description}/> : null
					}
				</div>
				{(() => {

					// Special case: modality.
					if (category.category === 'modality') {
						return (
							<div className="ModalityDisplay">
								<div>
									<BodyComponent
										parts={props.formData.modality}
										defaultState="available"
										form_change_handler={props.form_change_handler_type3}
									/>
								</div>
								<div className="FormSubcategories ModalityDisplay_statelist">
									{category.subcategories.map(
										(subcategory) =>
										render_subcategory(subcategory, category.category, color)
									)}
								</div>
							</div>
						);
					}

					// Default case.
					else {
						return (
							<div className="FormSubcategories">
								{category.subcategories.map(
									(subcategory) =>
									render_subcategory(subcategory, category.category, color)
								)}
							</div>
						);
					}
				})() /* need this extra parathesis to work */}
			</div>
		);
	};

	/**
	 * render_subcategory
	 * 
	 * To render everything in one subcategory depending on its type.
	 *
	 * references:
	 *  https://stackoverflow.com/questions/8605516/default-select-option-as-blank
	 *  https://stackoverflow.com/questions/39523040/concatenating-variables-and-strings-in-react
	 *  https://stackoverflow.com/questions/40477245/is-it-possible-to-use-if-else-statement-in-react-render-function
	 *  https://www.w3schools.com/howto/tryit.asp?filename=tryhow_custom_select → TODO: beautify dropdownn
	 */
	const render_subcategory = (subcategory, categoryname, color) => {

		// Check subcategory type, determine style accordingly.
		switch (subcategory.type) {

			// Type 1 → dropdown (each picture should strictly have =1 label under this category.)
			case 1:
				return (
					<div className="FormSubcategory">
						{(subcategory.subcategory_displaytext && subcategory.subcategory_displaytext!="") ?
							<div className="SubcategoryHeader">
								<div className="SubcategoryName">
									{subcategory.subcategory_displaytext}
									{subcategory.required ? <span className="RequiredField">*</span> : null}
								</div>
								{(subcategory.description && subcategory.description!="") ?
									<DescriptionHover text={subcategory.description}/> : null
								}
							</div>
						: null
						}
						<select
							className="Dropdown"
							id={subcategory.subcategory}
							onChange={(e) => props.form_change_handler_type1(e, categoryname, subcategory.subcategory)}
						>

							{/* Placeholder option */
							(() => {
								if (subcategory.required) {
									if (props.formData[categoryname][subcategory.subcategory]==="") {
										// Use a placeholder as default when no value is selected for the drop down.
										return (<option disabled selected value="">---</option>);
									} else {
										// In a required field, although we still show the placeholder option after selection,
										// it is only for consistency, since this option is disabled and will no longer be useful
										// after any selection is made.
										return (<option disabled value="">---</option>);
									}
								} else {
									if (
										props.formData[categoryname][subcategory.subcategory]==="") {
										// Allow re-selecting the placeholder option for non-required fields.
										return (<option selected value="">---</option>);
									} else {
										// "---N/A---" instead of "---" to reduce confusion.
										return (<option value="">---N/A---</option>);
									}
								}
							})() /* need this extra parathesis to work */}

							{/* Actual options */
							subcategory.labels.map((label) => {
								// Select that label that has been saved.
								if (props.formData[categoryname][subcategory.subcategory]===label.label) {
									return (
										<option
											selected
											value={label.label}
											key={label.label_id}
										>
											{label.label}
										</option>
									);
								} else {
									return (
										<option
											value={label.label}
											key={label.label_id}
										>
											{label.label}
										</option>
									);
								}
							})}
						</select>
					</div>
				);
				break;

			// Type 2 → searchable dropdown (accepts a list of labels, any number from 0 to all possible.)
			case 2:
				return (
					<div className="FormSubcategory">
						{(subcategory.subcategory_displaytext && subcategory.subcategory_displaytext!="") ?
							<div className="SubcategoryHeader">
								<div className="SubcategoryName">
									{subcategory.subcategory_displaytext}
									{subcategory.required ? <span className="RequiredField">*</span> : null}
								</div>
								{(subcategory.description && subcategory.description!="") ?
									<DescriptionHover text={subcategory.description}/> : null
								}
							</div>
						: null
						}
						<SearchableDropdown
							selectedLabels={
								// Special case: posture, no subcategory in formData.
								categoryname==='posture' ?
									props.formData[categoryname]
								:
									props.formData[categoryname][subcategory.subcategory]
							}
							id={"LabelsForm-" + subcategory.subcategory}
							color={color}
							category={categoryname}
							subcategory={
								// Special case: posture, subcategory undefined.
								categoryname==='posture' ?
									undefined
								:
									subcategory.subcategory
							}
							label_change_handler={props.form_change_handler_type2}
							label_add_handler={props.add_label_handler_type2}
							label_remove_handler={props.remove_label_handler_type2}
						/>
					</div>
				);
				break;

			// Type 3 → human figure
			case 3:
				//console.log("is formData updated? ↓"); console.log(props.formData); //DEBUG
				return (
					<div className="SubcategoryName ModalityDisplay_state">
						{subcategory.subcategory_displaytext} : <span>
							{ props.formData[categoryname][subcategory.subcategory] ?
								<span style={{color:"#668842"}}>√ available</span>
							:
								<span style={{color:"#983640"}}>× occupied</span>
							}
						</span>
					</div>
				);
				break;

			default:
				// TODO: when type number is invalid
		}
	};

	/* Render */
	return (
		<Form
			className="LabelsForm"
		>
			<div className="FormCategory">
				<div className="HintTextWithIcon_container">
					<img src={EditPicIcon} />
					<span className="HintText">
						Multiple persons in the picture?<br/>
						Drag to draw rectangle around the one that you are labelling.
					</span>
				</div>
				{props.annotated ?
					<div id="clear-annotation-btn">
						<btn
							htmlFor="clear-annotation-btn"
							className="Btn_secondary"
							onClick={props.clear_annotation}
						>
							Clear annotation
						</btn>
					</div>
				: null }
			</div>
			{/* Form for all categories */
			labels_data.map(
				(category) => render_category(category)
			)}
		</Form>
	);
}
