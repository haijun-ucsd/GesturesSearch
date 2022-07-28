import React, { useState , useEffect } from 'react';
import { getDatabase, onValue, ref as ref_db, set } from 'firebase/database';
import './components.css';
import 'bootstrap/dist/css/bootstrap.min.css';
//import { ... } from './components';

export default function ExplorePage() {

	const[imageList, setImageList] = useState([]);

	useEffect(() => {
		// listAll(imageListRef).then((response) => {
		//   response.items.forEach((item) => {
		//     getDownloadURL(item).then((url) => {
		//       setImageList((prev) => [...prev, url]);
		//     })
		//   })
		// })
		const db = getDatabase()
		const dbRef = ref_db(db, 'images')
		onValue(dbRef, (snapshot) => {
		  const data = snapshot.val();
		  let append = []
		  for (const [imgKey, labels] of Object.entries(data)) {
			append.push([imgKey, labels])
		  }
		  setImageList(append);
		})
	  }, [])

	//   console.log(imageList);

	return (
		<div className="PageBox">
			<div className='textCenter'>
				<div className='images d-flex justify-content-start flex-wrap w-400px'>
				{ 
					imageList.map((data) => {
					const key = data[0];
					const labelData = data[1];
					const available_modalities = []
					for (let modality in labelData.modality) {
						if (labelData.modality[modality] == 'available') {
							available_modalities.push(modality)
						}
					}
					return(
						<div key={key} className='image'>
							<img key={key} src={labelData.url} className='explore_img'/>
							<div key={key} className='labels'>
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
							</div>
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
      		</div>
		</div>
	);
}