import React, { useState , useEffect, useLayoutEffect } from 'react';
//import { storage } from '../firebase';
//import { getDatabase, onValue, ref as ref_db, set } from 'firebase/database';
//import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
//import { v4 } from 'uuid';
import './components.css';
import { Filter } from './components';



/**
 * ExploreGallery
 *
 * Picture gallery on the Explore page, along with helper info such as AppliedFilters and (TODO: picture count).
 * This functional component is merely an organizer. Detailed contents see the Gallery & AppliedFilters functions below.
 *
 * parent props:
 *  - imageList: Up-to-date list of currently showing pictures.
 *  - filterList: Up-to-date list of currently applied filters.
 *  - remove_filter(): To help remove from filterList.
 *	- ...
 *
 * references:
 *	...
 */
export default function ExploreGallery(props) {

	/* Render */
	return (
		<div className="ExploreGallery">
			<AppliedFilters
        filterList={props.filterList}
        remove_filter={props.remove_filter}
      />
      <Gallery
      	imageList={props.imageList}
      />
    </div>
	);
}


/**
 * Gallery
 * 
 * parent props:
 *	- imageList
 */
function Gallery(props) {
	return(
		<div className='Gallery'>
			{ 
				props.imageList.map((data) => {
				const key = data[0];
				const labelData = data[1];
				const available_modalities = []
				for (let modality in labelData.modality) {
					if (labelData.modality[modality] == 'available') {
						available_modalities.push(modality)
					}
				}
				return(
					<div key={key}>
						<img
							className='ExplorePic'
							key={key}
							src={labelData.url}
						/>
						{/*<div key={key} className='labels'>
							<p><b>Age: </b>{labelData.demographic.age}</p>
							<p><b>Sex: </b>{labelData.demographic.sex}</p>
							<p><b>Social Role: </b>{Array.isArray(labelData.demographic.social_role) ? (labelData.demographic.social_role).join(', ') : labelData.demographic.social_role}</p>
							<p><b>Architecture Component: </b>{Array.isArray(labelData.location.architecture_component) ? (labelData.location.architecture_component).join(', ') : labelData.location.architecture_component}</p>
							<p><b>In/outdoor: </b>{labelData.location.in_outdoor}</p>
							<p><b>Purpose: </b>{Array.isArray(labelData.location.purpose) ? (labelData.location.purpose).join(', ') : labelData.location.purpose}</p>
							<p><b>Modalities: </b>{Array.isArray(available_modalities) ? available_modalities.join(', ') : available_modalities}</p>
							<p><b>Attentive: </b>{(labelData.spectators.attentive)}</p>
							<p><b>Density: </b>{(labelData.spectators.density)}</p>
							<p><b>Quantity: </b>{(labelData.spectators.quantity)}</p>
						</div> //TODO: hover or click to show */}
					</div>
				)
				// const modalities = available_modalities.join(', ');
				// console.log(modalities)
				// return (<div key={data[0]} className='textLeft'>
				// 			<img key={data[0]} src={data[1].url}/> 
							// <p>Age: {data[1].demographic.age}</p>
							// <p>Occupation: {data[1].demographic.occupation}</p>
							// <p>Sex: {data[1].demographic.sex}</p>
							// <p>Location: {data[1].location}</p>
							// <p>Available modalities: {modalities}</p>
							// {/* {
							// available_modalities.map((modality) => {
							// 	return <p> modality </p>
							// })
							// } */}
							// <p>All: {data[1].spectators.all}</p>s
							// <p>Attentive: {data[1].spectators.attentive}</p>
							// <p>Density: {data[1].spectators.density}</p>
				// 		</div>)
				})
			}
     </div>
	);
}


/**
 * AppliedFilters
 *
 * parent props:
 *  - filterList
 *  - remove_filter()
 *
 * references:
 *  https://robinpokorny.medium.com/index-as-a-key-is-an-anti-pattern-e0349aece318
 *  https://bobbyhadz.com/blog/react-map-only-part-of-array
 *  https://stackoverflow.com/questions/60755083/how-to-check-if-a-div-is-overflowing-in-react-functional-component
 */
function AppliedFilters(props) {

	// "show more" effect when filterList is too long.
  /*const ref = React.createRef();
  const [showMore, setShowMore] = React.useState(false);
  const [showLink, setShowLink] = React.useState(false);
  useLayoutEffect(() => {
    if (ref.current.clientHeight < ref.current.scrollHeight) {
      setShowLink(true);
    }
  }, [ref]);
  const onClickMore = () => {
    setShowMore(!showMore);
  };*/

  return (
	  <div className="Module">
    	{(props.filterList.length > 0) ?  // only show when there is some applied filter
    		<>
		      <div className="ModuleHeaderBar">
		        <div className="SectionHeader">
		          <div className="SubsectionName">
		            Applied Filters
		          </div>
		          <div className="AppliedFiltersCount">
		            ({props.filterList.length})
		          </div>
		        </div>
		        {/* TODO: add btns: rearrange, clear all */}
		      </div>
	        {/*<div ref={ref} className={(showMore ? "" : "AppliedFiltersList") + " " + "FilterList"}>*/}
	        <div className="FilterList">
	          {props.filterList.map((item) =>
	            <Filter
	              key={item.label_id}
	              label={item.label}
	              color={item.color}
	              //category={item.category}
	              //subcategory={item.subcategory}
	              remove_filter={props.remove_filter}
	            />
	          )}
	        </div>
		      {/*showLink && (
		        <span onClick={onClickMore}>
		          {showMore ? "show less" : "& more"}
		        </span>
		      )*/}
	      </>
    	: null }
	  </div>
  );
}

/*function FilterRearrange(props) {
  return (
    <div className="Module">
      <... />
    </div>
  );
}*/