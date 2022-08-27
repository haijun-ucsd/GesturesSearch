import React, { useState , useEffect, useRef, useLayoutEffect } from 'react';
import Masonry from 'react-masonry-css';
import useResizeAware from 'react-resize-aware';
import './components.css';
import { RemovableLabel, GalleryColumn_helper } from './components';



/**
 * ExploreGallery
 *
 * Picture gallery on the Explore page, along with helper info such as AppliedFilters and (TODO: picture count).
 * This functional component is merely an organizer. Detailed contents see the Gallery & AppliedFilters functions below.
 *
 * parent props:
 *	- imageList: Up-to-date list of currently showing pictures.
 *	- filterList: Up-to-date list of currently applied filters.
 *	- remove_filter(): To help remove from filterList.
 *	- ...
 *
 * references:
 *	...
 */
export default function ExploreGallery(props) {

	/* Render */
	return (
		<div className="ExploreGallery">
			{(props.filterList.length > 0) ?	// only show when there is some applied filter
				<div className="ExploreGalleryHeader">
					<AppliedFilters
						filterList={props.filterList}
						remove_filter={props.remove_filter}
					/>
					<div className="HintText">
						 Found {props.imageList.length} results
					</div>
				</div>
			: null }
			<Gallery
				imageList={props.imageList}
				click_picture={props.click_picture}
				pictureClicked={props.pictureClicked}
			/>
		</div>
	);
}


/**
 * Gallery
 * 
 * parent props:
 *	- imageList
 *	- click_picture(): to expand the ExploreDetails menu and view details of the clicked image.
 *	- pictureClicked: to determine whether a picture should be highlighted.
 *
 * references:
 *	https://stackoverflow.com/questions/9102900/css-outside-border
 *	https://www.youtube.com/watch?v=Wvg8siCokfw (https://ember-photo-gallery.jhawk.co/)
 *	https://css-tricks.com/piecing-together-approaches-for-a-css-masonry-layout/
 *	https://www.npmjs.com/package/react-masonry-css
 *	https://github.com/FezVrasta/react-resize-aware
 */
function Gallery(props) {

	/* Resize helpers */
	const [GalleryResizeListener, GallerySize] = useResizeAware(); // custom hook "react-resize-aware"
	const [galleryNumCol, setGalleryNumCol] = useState(4); // 4 columns by default
	useEffect(() => { setGalleryNumCol(GalleryColumn_helper(GallerySize)); }, [GallerySize]);

	/* Render */
	return(
		<Masonry
			breakpointCols={{default: galleryNumCol}}
			className="Gallery"
			style={{justifyContent: (galleryNumCol >= props.imageList.length) ? "left" : "center"}}
			columnClassName="GalleryColumn"
		>
			{GalleryResizeListener}
			{props.imageList.map((data) =>
				<img
					className={
						"ExplorePic" + " "
						+ ((props.pictureClicked && props.pictureClicked.url===data[1].url) ? "ExplorePic_selected" : "")
					}
					key={data[0]}
					src={data[1].url}
					onClick={()=>props.click_picture(data[1])} // data[1] includes imgUrl, labels, and annotation info
				/>
			)}
		</Masonry>
	);
}


/**
 * AppliedFilters
 *
 * parent props:
 *	- filterList
 *	- remove_filter()
 *
 * references:
 *	https://robinpokorny.medium.com/index-as-a-key-is-an-anti-pattern-e0349aece318
 *	https://bobbyhadz.com/blog/react-map-only-part-of-array
 *	https://stackoverflow.com/questions/60755083/how-to-check-if-a-div-is-overflowing-in-react-functional-component
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
		<div className="AppliedFilters">
			<div className="ModuleHeaderBar">
				<div className="HintText">
					Applied Filters ({props.filterList.length}) :
				</div>
				{/* TODO: add btns: rearrange, clear all */}
			</div>
			 {/*<div ref={ref} className={(showMore ? "" : "AppliedFiltersList") + " " + "FilterList"}>*/}
			 <div className="FilterList">
				 {props.filterList.map((item) =>
					<RemovableLabel
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