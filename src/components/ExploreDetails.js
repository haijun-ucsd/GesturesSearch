import React, { useState , useEffect, useLayoutEffect } from 'react';
import './components.css';
import { labels_data } from "./labels_data.js";
//import { DescriptionHover } from './components';
import BodyComponent from './BodyComponent';

/* Assets: */
import ExploreDetailsCloseBtn from "../assets/ExploreDetailsCloseBtn.png";



/**
 * ExploreDetails
 *
 * Click on individual picture in the ExploreGallery to see display of details.
 * 
 * Structure: Image, Labels for each category
 *
 * parent props:
 *  - pictureClicked: includes URL and lael details
 *  - close_exploredetails
 *
 * references:
 *  https://stackoverflow.com/questions/60679688/how-to-get-all-keys-except-a-certain-one-in-object-keys
 *  https://stackoverflow.com/questions/35191336/how-to-map-a-dictionary-in-reactjs
 * 
 * TODO: add label_display value to labels_data, which might differ from the recorded value.
 *  After adding, Spectators no longer has to be a special case, and Modality body parts can be better displayed.
 */
export default function ExploreDetails(props) {

  /* Render */
  return (
    <div className="ExploreDetailsMenu">
      <div
        className="ExploreDetailsCloseBtn_expanded"
        onClick={props.close_exploredetails}
      >
        <img
          className="ExploreDetailsCloseBtn"
          src={ExploreDetailsCloseBtn}
        />
      </div>
      <div className="ExploreDetailsPic_container">
        <img
          className="ExploreDetailsPic"
          src={props.pictureClicked.url}
        />
      </div>
      {labels_data.map((categoryobj) => // category object
        <div className="DetailsLabels_container">
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
                  return (
                    <>{Object.entries(props.pictureClicked["spectators"]).map(([subcategory,label]) =>
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
                  let available_modalities = [];
                  Object.entries(props.pictureClicked["modality"]).map(([subcategory,label]) => {
                    if (label===true) { available_modalities.push(subcategory); }
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
                  return (
                    Object.entries(props.pictureClicked[categoryobj.category]).map(([subcategory,label]) => {
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
                        return (
                          <div
                            className="Label"
                            style={{
                              //cursor:"pointer",
                              borderColor: categoryobj.color,
                              backgroundColor: categoryobj.color+14 // +14 = 8% opacity
                            }}
                          >
                            {props.pictureClicked[categoryobj.category][subcategory]}
                          </div>
                        );
                      }
                    })
                  );
                }
              })() /* need this extra parathesis to work */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}