import React, { useState , useEffect, useRef, useLayoutEffect } from 'react';
import Masonry from 'react-masonry-css';
import useResizeAware from 'react-resize-aware';
import '../components.css';
import { RemovableLabel, GalleryColumn_helper } from '../components';

/* Assets: */
import YesBtn from "../../assets/YesBtn@2x.png";
import ClearAllBtn from "../../assets/ClearAllBtn@2x.png";
import RearrangePriorityBtn from "../../assets/RearrangePriorityBtn@2x.png";
import TwoBinPriorityBtn from "../../assets/TwoBinPriorityBtn@2x.png";
//import GrabToOrderIcon from "../../assets/GrabToOrderIcon@2x.png";



/**
 * ExploreGallery
 *
 * Picture gallery on the Explore page, along with helper info such as AppliedFilters and (TODO: picture count).
 * This functional component is merely an organizer. Detailed contents see the Gallery & AppliedFilters functions below.
 *
 * parent props:
 *	- imageList: Up-to-date list of currently showing pictures.
 *	- [filterList, setFilterList]
 *	- remove_filter(): To help remove from filterList.
 *	- setFacetDisabled
 */
export default function ExploreGallery(props) {

	/* 2 modes for rearranging priority. */
	const [rearrangePriorityMode, setRearrangePriorityMode] = useState(false);
	const [twoBinPriorityMode, setTwoBinPriorityMode] = useState(false);
	useEffect(() => {
		if (rearrangePriorityMode==true || twoBinPriorityMode==true) {
			props.setFacetDisabled(true);
		} else {
			props.setFacetDisabled(false);
		}
	}, [rearrangePriorityMode, twoBinPriorityMode]);

	/* Render */
	return (
		<div className="ExploreGallery">
			{(props.filterList.length > 0) ?	// only show when there is some applied filter
				<div className="ExploreGalleryHeader">
					{(() => {
						if (rearrangePriorityMode == true) {
							return (
								<FilterRearrange
									filterList={props.filterList}
									setFilterList={props.setFilterList}
									exitRearrangePriorityMode={() => setRearrangePriorityMode(false)}
								/>
							);
						} /*else if (twoBinPriorityMode == true) {
							return (
								<FilterTwoBins
									filterList={props.filterList}
									setFilterList={props.setFilterList}
									exitTwoBinPriorityMode={() => setTwoBinPriorityMode(false)}
								/>
							);
						}*/ else { // default case
							return (
								<>
									<AppliedFilters
										filterList={props.filterList}
										remove_filter={props.remove_filter}
										enterRearrangePriorityMode={() => { setRearrangePriorityMode(true); }}
										enterTwoBinPriorityMode={() => { setTwoBinPriorityMode(true); }}
									/>
									<div className="HintText">
										Found {props.imageList.length} results
									</div>
								</>
							);
						}
					})()}
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
 *	https://stackoverflow.com/questions/7503183/what-is-the-easiest-way-to-create-an-html-mouseover-tool-tip
 */
function AppliedFilters(props) {

	/* "show more" effect when filterList is too long. */
	const filterlistRef = React.createRef();
	const [filterlistOverflow, setFilterlistOverflow] = React.useState(false);
	const [filterlistExpanded, setFilterlistExpanded] = React.useState(false);
	useLayoutEffect(() => {
		if (filterlistRef.current.clientWidth < filterlistRef.current.scrollWidth) {
			setFilterlistOverflow(true);
		} else {
			setFilterlistOverflow(false);
		}
	}, [filterlistRef]);
	const expand_full_filterlist = () => { // toggle expand state
		setFilterlistExpanded(!filterlistExpanded);
	};

	/* Render */
	return (
		<>{filterlistExpanded ?
			<div className="AppliedFilters AppliedFilters_expanded">
				<div className="ModuleHeaderBar">
					<div className="HintText AppliedFilters_hinttext">
						Applied Filters ({props.filterList.length}) :
					</div>
					<div className="AppliedFilters_btns_div">

						{/* Priority mode 1: drag to rearrange order */
						<img
							srcSet={RearrangePriorityBtn+" 2x"}
							title="priority mode 1: rearrange priority order"
							className="Btn"
							onClick={(e) => {
								e.preventDefault();
								props.enterRearrangePriorityMode();
							}}
						/>}

						{/* Priority mode 2: 2 bins - "must have" & "good to have" */
						/*<img
							srcSet={TwoBinPriorityBtn+" 2x"}
							title="priority mode 2: 'must have' and 'good to have' bins"
							className="Btn"
							onClick={(e) => {
								e.preventDefault();
								props.enterTwoBinPriorityMode();
							}}
						/>*/}

						{/* Clear all applied filters */
						/*<img
							srcSet={ClearAllBtn+" 2x"}
							className="Btn"
							onClick={(e) => {
								e.preventDefault();
								//clear_search_input_field();
							}}
						/>*/}
					</div>
				</div>
				<div
					ref={filterlistRef}
					className="AppliedFiltersList"
				>
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
				<span
					className="Link"
					onClick={expand_full_filterlist}
				>
					{filterlistExpanded ? "show less" : "and more"}
				</span>
			</div>
		:
			<div className="AppliedFilters AppliedFilters_collapsed">
				<div className="HintText AppliedFilters_hinttext">
					Applied Filters ({props.filterList.length}) :
				</div>
				<div
					ref={filterlistRef}
					className="AppliedFiltersList AppliedFiltersList_collapsed"
				>
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
				<div className="AppliedFilters_btns_div">

					{/* Link to expand the display of long applied filters list */
					filterlistOverflow ?
						<span
							className="Link"
							onClick={expand_full_filterlist}
						>
							{filterlistExpanded ? "show less" : "and more"}
						</span>
					: null }

					{/* Btn → Priority mode 1: drag to rearrange order */
					<img
						srcSet={RearrangePriorityBtn+" 2x"}
						title="priority mode 1: rearrange priority order"
						className="Btn"
						onClick={(e) => {
							e.preventDefault();
							props.enterRearrangePriorityMode();
						}}
					/>}

					{/* Btn → Priority mode 2: 2 bins - "must have" & "good to have" */
					/*<img
						srcSet={TwoBinPriorityBtn+" 2x"}
						title="priority mode 2: 'must have' and 'good to have' bins"
						className="Btn"
						onClick={(e) => {
							e.preventDefault();
							props.enterTwoBinPriorityMode();
						}}
					/>*/}

					{/* Clear all applied filters */
					/*<img
						srcSet={ClearAllBtn+" 2x"}
						className="Btn"
						onClick={(e) => {
							e.preventDefault();
							//clear_search_input_field();
						}}
					/>*/}
				</div>
			</div>
		}</>
	);
}

/**
 * FilterRearrange
 * 
 * Feature to help the user indicate priority of filter, mode 1: drag to rearrange order.
 *
 * parent props:
 *	- [filterList, setFilterList]
 *	- exitRearrangePriorityMode()
 *
 * references:
 *	https://tinloof.com/blog/how-to-make-and-test-your-own-react-drag-and-drop-list-with-0-dependencies
 *	https://stackoverflow.com/questions/22922761/rounded-corners-with-html-draggable
 */
function FilterRearrange(props) {

	const [tempFilterList, setTempFilterList] = useState(props.filterList);

	/* Drag to rearrange. */
	const [draggedItem, setDraggedItem] = useState(null);
	useEffect (() => {
		console.log("draggedItem: ", draggedItem); //DEBUG
	}, [draggedItem]);

	const drag_starts = (e, idx) => { setDraggedItem(tempFilterList[idx]); }
	const drag_ends = () => { setDraggedItem(null); }
	const dragging_over = (over_idx) => {
		//console.log("dragging '" + draggedItem.label + "' over index: " + over_idx); //DEBUG
		if (tempFilterList[over_idx] === draggedItem) { return; } // if the item is dragged over itself, ignore
		let newFilterList = tempFilterList.filter(item => item !== draggedItem);
		newFilterList.splice(over_idx, 0, draggedItem);
		setTempFilterList(newFilterList);
	}

	/* Render */
	return (
		<div className="AppliedFilters">
			<div className="ModuleHeaderBar">
				<div className="HintText AppliedFilters_hinttext">
					Drag to rearrange filter priority:
				</div>
				<div className="AppliedFilters_rearrange_btns_div">
					<btn
						className="Btn_small Btn_green"
						onClick={(e) => {
							e.preventDefault();
							props.setFilterList(tempFilterList);
							props.exitRearrangePriorityMode();
						}}
					>
						<img srcSet={YesBtn+" 2x"} />
						save
					</btn>
					<btn
						className="Btn_small"
						onClick={(e) => {
							e.preventDefault();
							props.exitRearrangePriorityMode(); // exist directly without updating FilterList
						}}
					>
						cancel
					</btn>
				</div>
			</div>
			<div className="AppliedFiltersList">
				{tempFilterList.map((item, idx) =>
					<div className="LabelWithPriorityNum">
						<span className="HintText">
							{idx+1 /* idx 0 = 1st priority */}:
						</span>
						<div
							className="Label DraggableLabel"
							draggable
							onDragStart={(e) => drag_starts(e, idx)}
							onDragOver={() => dragging_over(idx)}
							onDragEnd={drag_ends}
							style={{
								borderColor: item.color,
								backgroundColor: item.color+14, // +14 = 8% opacity
								borderRadius: "14px", opacity: "0.999" // need this to ensure corner radius
							}}
						>
							{item.label}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

/**
 * FilterTwoBins
 * 
 * Feature to help the user indicate priority of filter, mode 2: 2 bins - "must have" & "good to have".
 *
 * parent props:
 *	- [filterList, setFilterList] TODO: record bin info in filterList
 *	- exitTwoBinPriorityMode()
 * 
 * TODO: still buggy >0<
 */
function FilterTwoBins(props) {

	/* Drag to put into bins. */
	const [tempMustList, setTempMustList] = useState(props.filterList);
	const [tempOptionalList, setTempOptionalList] = useState([]); // TODO: update according to filterList after props.filterList containst bin info

	const [draggingToMustActive, setDraggingToMustActive] = useState(false);
	const [draggingToOptionalActive, setDraggingToOptionalActive] = useState(false);

	const [draggedItem, setDraggedItem] = useState(null);
	useEffect (() => {
		console.log("draggedItem: ", draggedItem); //DEBUG
	}, [draggedItem]);

	/**
	 * @param bin: "must" or "optional"
	 */
	const drag_starts = (e, bin, idx) => {
		if (bin === "must") { setDraggedItem(tempMustList[idx]); }
		if (bin === "optional") { setDraggedItem(tempOptionalList[idx]); }
	}

	/**
	 * @param bin: "must" or "optional"
	 */
	const drag_handler = (e, bin) => {
		e.preventDefault();
		e.stopPropagation(); // prevents propagation, which means "bubbling up to parent elements or capturing down to child elements"

		// During the dragging process.
		if (e.type === "dragenter") {
			if (bin === "must") {
				setDraggingToMustActive(true);
				setTempMustList((prev) => [...prev, draggedItem]);
			}
			if (bin === "optional") {
				setDraggingToOptionalActive(true);
				setTempOptionalList((prev) => [...prev, draggedItem]);
			}
		}

		// Dragged element moves out of the drag-to-add area.
		else if (e.type === "dragleave") {
			if (bin === "must") {
				setDraggingToMustActive(false);
				setTempMustList((prev) => prev.filter(item => item !== draggedItem));
			}
			if (bin === "optional") {
				setDraggingToOptionalActive(false);
				setTempOptionalList((prev) => prev.filter(item => item !== draggedItem));
			}
		}

		// Dragged item is dropped within the drag-to-add area.
		else if (e.type === "drop") {
			if (bin === "must") { setDraggingToMustActive(false); }
			if (bin === "optional") { setDraggingToOptionalActive(false); }
		}
	}

	/* Render */
	return (
		<div className="AppliedFilters">
			<div className="ModuleHeaderBar">
				<div className="HintText AppliedFilters_hinttext">
					Drag to change importance of filters:
				</div>
				<div className="AppliedFilters_rearrange_btns_div">
					<btn
						className="Btn_small Btn_green"
						onClick={(e) => {
							e.preventDefault();
							//props.setFilterList(...);
							props.exitTwoBinPriorityMode();
						}}
					>
						<img srcSet={YesBtn+" 2x"} />
						save
					</btn>
					<btn
						className="Btn_small"
						onClick={(e) => {
							e.preventDefault();
							props.exitTwoBinPriorityMode(); // exist directly without updating FilterList
						}}
					>
						cancel
					</btn>
				</div>
			</div>
			<div className="AppliedFilters_bins">
				<div
					className="AppliedFilters_bin AppliedFilters_bin_must"
					onDragEnter={(e) => drag_handler(e, "must")}
					onDragLeave={(e) => drag_handler(e, "must")}
					onDrop={(e) => drag_handler(e, "must")}
				>
					<span className="HintText"> must have: </span>
					<div className="AppliedFiltersList">
						{tempMustList.map((item, idx) =>
							<div
								className="Label DraggableLabel"
								draggable
								onDragStart={(e) => drag_starts(e, "must", idx)}
								style={{
									borderColor: item.color,
									backgroundColor: item.color+14, // +14 = 8% opacity
									borderRadius: "14px", opacity: "0.999" // need this to ensure corner radius
								}}
							>
								{item.label}
							</div>
						)}
					</div>
					{/* Div that temporarily covers the entire must bin to help dragging */
					draggingToMustActive==true ?
						<div
							style={{ position:"absolute", width:"100%", height:"100%" }}
							onDragEnter={(e) => drag_handler(e, "must")}
							onDragLeave={(e) => drag_handler(e, "must")}
							onDrop={(e) => drag_handler(e, "must")}
						></div> // empty div to cover the draggable field and help the add_pic_by_drag function
					: null }
				</div>
				<div
					className="AppliedFilters_bin AppliedFilters_bin_optional"
					onDragEnter={(e) => drag_handler(e, "optional")}
					onDragLeave={(e) => drag_handler(e, "optional")}
					onDrop={(e) => drag_handler(e, "optional")}
				>
					<span className="HintText"> good to have: </span>
					<div className="AppliedFiltersList">
						{tempOptionalList.map((item, idx) =>
							<div
								className="Label DraggableLabel"
								draggable
								onDragStart={(e) => drag_starts(e, "optional", idx)}
								style={{
									borderColor: item.color,
									backgroundColor: item.color+14, // +14 = 8% opacity
									borderRadius: "14px", opacity: "0.999" // need this to ensure corner radius
								}}
							>
								{item.label}
							</div>
						)}
					</div>
					{/* Div that temporarily covers the entire good-to-have bin to help dragging */
					draggingToOptionalActive==true ?
						<div
							style={{ position:"absolute", width:"100%", height:"100%" }}
							onDragEnter={(e) => drag_handler(e, "optional")}
							onDragLeave={(e) => drag_handler(e, "optional")}
							onDrop={(e) => drag_handler(e, "optional")}
						></div> // empty div to cover the draggable field and help the add_pic_by_drag function
					: null }
				</div>
			</div>
		</div>
	);
}