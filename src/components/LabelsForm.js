import React, { useState } from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css'
import { CheckLabel, SearchableDropdown, DescriptionHover } from './components';
import './components.css';
import { labels_data } from "./labels_data.js";
import BodyComponent from './BodyComponent';

/* Assets: */
import EditPicIcon from "../assets/EditPicIcon.png";


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
 *
 * TODO: fetch labels from firebase instead of labels_data
 */
export default function LabelsForm(props) {

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
							//searchResults={XX}
							labelsList={subcategory.labels}
							color={color}
							category={categoryname}
							subcategory={subcategory.subcategory}
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
