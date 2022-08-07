import React, { useState } from 'react'
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css'
import { CheckLabel, LabelStructure, DescriptionHover } from './components';
import './components.css';
import { labels_data } from "./labels_data.js";
import BodyComponent from './BodyComponent.tsx';

/**
 * LabelsForm
 *
 * The form to guide labeling.
 * TODO: Currently implemented with a fixed dummy list, will replace with fetching data from database.
 *
 * parent props:
 *  - form_change_handler_type1 (e, categoryname, subcategoryname)
 *  - form_change_handler_type2 (e, checked, categoryname, subcategoryname)
 *  - form_change_handler_type3 (e, categoryname)
 *  - formData: up-to-date form data for displaying preview (eg. modality states).
 *
 * references:
 *  https://stackoverflow.com/questions/35537229/how-can-i-update-the-parents-state-in-react
 *  https://stackoverflow.com/questions/43040721/how-to-update-nested-state-properties-in-react
 *  https://stackoverflow.com/questions/57798841/react-setting-state-for-deeply-nested-objects-w-hooks
 */
export default function LabelsForm(props) {

  /**
   * render_category
   * 
   * To render the entire module of one category, set color accordingly.
   * 
   * references:
   *  https://stackoverflow.com/questions/44046037/if-else-statement-inside-jsx-reactjs
   */
  const render_category = (category) => {

    // Determine color according to category.
    var color = category.color;

    // Render subcategories.
    return (
      <div className="FormCategory">
        <div className="CategoryHeader">
          <div
            className="CategoryName"
            style={{color:color}}
          >
            {category.category_displaytext}
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
        })()}
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
                <option disabled selected value>
                  ---
                </option>
              {subcategory.labels.map((label) =>
                <option
                  value={label.label}
                  key={label.label_id}
                >
                  {label.label}
                </option>
              )}
            </select>
          </div>
        );
        break;

      // Type 2 → checklabel list (accepts a list of labels, any number from 0 to all possible.)
      // TODO: make searchable
      case 2:
        return (
          <div className="FormSubcategory">
            {(subcategory.subcategory_displaytext && subcategory.subcategory_displaytext!="") ?
              <div className="SubcategoryHeader">
                <div className="SubcategoryName">
                  {subcategory.subcategory_displaytext}
                </div>
                {(subcategory.description && subcategory.description!="") ?
                  <DescriptionHover text={subcategory.description}/> : null
                }
              </div>
            : null
            }
            <div
              className="LabelList"
              id={subcategory.subcategory}
              category={categoryname}
              subcategory={subcategory.subcategory}
            >
              {subcategory.labels.map((label) =>
                <CheckLabel
                  value={label.label}
                  color={color}
                  key={label.label_id}
                  category={categoryname}
                  subcategory={subcategory.subcategory}
                  onchange_handler={props.form_change_handler_type2}
                />
              )}
            </div>
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

  /* render */
  return (
    <Form
      className="LabelsForm"
    >
      {labels_data.map(
        (category) => render_category(category)
      )}
    </Form>
  );
}
