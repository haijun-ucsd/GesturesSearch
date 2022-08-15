import React, { Component, useState, useEffect } from "react";
import LabelsForm from "./LabelsForm";

/* Assets: */
import PopUpCloseBtn from "../assets/PopUpCloseBtn.png";


/**
 * parents props:
 *  - url: URL of the picture that has been clicked on.
 *  - closePop()
 *  - formDataList: full list of formData, will only use and modify at formDataIndex.
 *  - setFormDataList(): To update formDataList, will only use on formDataList[formDataIndex].
 *  - formDataIndex: index of the formData corresponding to the current picture.
 *  - setCompletePercentages(): To update completePercentages.
 *  - completePercentages: For progress bar and validation.
 * 
 * TODO: close PopUp when clicking outside of the modal.
 */
export default function UploadPopUp(props) {

  const required_fields = [
    {category: "location", subcategories: ["in_outdoor", "purpose"]},
    {category: "spectators", subcategories: ["quantity", "density", "attentive"]},
    {category: "posture"},
  ];
  const optional_fields = [
    {category: "location", subcategories: ["architecture_component"]},
    {category: "demographic", subcategories: ["age", "sex", "social_role"]},
  ];
  const close_pop_and_save = () => {

    // Update completePercentage by checking all required fields that needs to be validated.
    // Percentage calculation:
    //  required field = 16%
    //  optional field = 1%
    //  ≥96% = 100%, because 6*16=96.
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
      newCompletePercentages[props.formDataIndex] = percentage;
      return newCompletePercentages;
    });

    // Update addedLabels.
    props.reprint_added_labels(props.formDataIndex, formData);

    // Update formDataList.
    props.setFormDataList((prev) => {
      let newFormDataList = [...prev];
      newFormDataList[props.formDataIndex] = formData;
      return newFormDataList;
    });

    // Close the pop-up window.
    props.closePop();
  }


  /**
   * formData of this individual picture, will store into formDataList upon closing.
   */
  const [formData, setFormData] = useState(props.formDataList[props.formDataIndex]);
  // DEBUG
  useEffect(() => {
    console.log("updated formData ↓"); console.log(formData);
    //console.log("current formDataList ↓"); console.log(props.formDataList);
  }, [formData]);


  /**
   * Handle update in type 1 subcategories.
   * 
   * references:
   *  https://stackoverflow.com/questions/58478289/react-hooks-cannot-assign-to-read-only-property
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
   *  https://www.robinwieruch.de/react-add-item-to-list/
   *  https://stackoverflow.com/questions/58478289/react-hooks-cannot-assign-to-read-only-property
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
          console.log(
            "before change: " +
              categoryname +
              " >> " +
              subcategoryname +
              " >> ↓"
          );
          console.log(prev[categoryname][subcategoryname]); //DEBUG
          let newArr = [...prev[categoryname][subcategoryname], e.target.value];
          let newFormData = {
            ...prev,
            [categoryname]: {
              ...prev[categoryname],
              [subcategoryname]: newArr,
            },
          };
          console.log(
            "after change: " + categoryname + " >> " + subcategoryname + " >> ↓"
          );
          console.log(newFormData[categoryname][subcategoryname]); //DEBUG
          return newFormData;
        });
      } else {
        // Remove label.
        setFormData((prev) => {
          console.log(
            "before change: " +
              categoryname +
              " >> " +
              subcategoryname +
              " >> ↓"
          );
          console.log(prev[categoryname][subcategoryname]); //DEBUG
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
          console.log(
            "after change: " + categoryname + " >> " + subcategoryname + " >> ↓"
          );
          console.log(newFormData[categoryname][subcategoryname]); //DEBUG
          return newFormData;
        });
      }
    }
  };

  const add_label_handler_type2 = (label, categoryname, subcategoryname) => {

    // Special case: posture. No subcatrgory layer when storing.
    if (categoryname === "posture") {
      setFormData((prev) => {
        console.log("before change: posture >> ↓");
        console.log(prev["posture"]); //DEBUG
        let newArr = [...prev["posture"], label];
        let newFormData = {
          ...prev,
          ["posture"]: newArr,
        };
        console.log("after change: posture >> ↓");
        console.log(newFormData["posture"]); //DEBUG
        return newFormData;
      });
    }

    // Default case.
    else {
      setFormData((prev) => {
        console.log(
          "before change: " +
            categoryname +
            " >> " +
            subcategoryname +
            " >> ↓"
        );
        console.log(prev[categoryname][subcategoryname]); //DEBUG
        let newArr = [...prev[categoryname][subcategoryname], label];
        let newFormData = {
          ...prev,
          [categoryname]: {
            ...prev[categoryname],
            [subcategoryname]: newArr,
          },
        };
        console.log(
          "after change: " + categoryname + " >> " + subcategoryname + " >> ↓"
        );
        console.log(newFormData[categoryname][subcategoryname]); //DEBUG
        return newFormData;
      });
    }
  };

  const remove_label_handler_type2 = (label, categoryname, subcategoryname) => {

    // Special case: posture. No subcatrgory layer when storing.
    if (categoryname === "posture") {
      setFormData((prev) => {
        let newArr = prev["posture"].filter(
          (item) => item !== label
        );
        let newFormData = {
          ...prev,
          ["posture"]: newArr,
        };
        return newFormData;
      });
    }

    // Default case.
    else {
      setFormData((prev) => {
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


  /* Render */
  return (
    <div className="PopUpOverlay">
      <div className="UploadPopUpModal_container">
        <div className="UploadPopUpModal">
          <div className="UploadPopUpPic_container">
            <img className="UploadPopUpPic" src={props.url} />
          </div>
          <LabelsForm
            form_change_handler_type1={form_change_handler_type1}
            form_change_handler_type2={form_change_handler_type2}
            add_label_handler_type2={add_label_handler_type2}
            remove_label_handler_type2={remove_label_handler_type2}
            form_change_handler_type3={form_change_handler_type3}
            formData={formData}
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
