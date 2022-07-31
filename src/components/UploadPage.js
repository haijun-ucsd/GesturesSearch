import React, { useState , useEffect } from 'react';
//import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { storage } from '../firebase';
import { getDatabase, onValue, ref as ref_db, set } from 'firebase/database';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import './components.css';
import LabelsForm from './LabelsForm';
import { LabelStructure, WaitingRoom } from './components';

export default function UploadPage() {
  const [uploadDisabled, setUploadDisabled] = useState(true);  // modified based on the old "btnDisabled"
  const [imageUpload, setImageUpload] = useState(null);
  // const [currImg, setCurrImg] = useState(null);


/* To collect data from LabelsForm (labels) */

  const [formData, setFormData] = useState(LabelStructure);

  /**
   * Handle update in type 1 subcategories.
   */
  const form_change_handler_type1 = (e, categoryname, subcategoryname) => {
    //e.preventDefault();
    console.log("form_change_handler_type1"); //DEBUG

    // Update formData by changing the value of the current subcategory.
    setFormData((prev) => {
      console.log("before change: " + categoryname + " >> " + subcategoryname + " >> " + prev[categoryname][subcategoryname]); //DEBUG
      prev[categoryname][subcategoryname] = e.target.value;
      console.log("after change: " + categoryname + " >> " + subcategoryname + " >> " + prev[categoryname][subcategoryname]); //DEBUG
      return prev;
    });
    console.log("updated formData ↓"); console.log(formData); //DEBUG
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
    if (categoryname === 'posture') {
      if (checked) {

        // Add label.
        setFormData((prev) => {
          console.log("before change: posture >> ↓"); console.log(prev['posture']); //DEBUG
          let newArr = [...prev['posture'], e.target.value];
          let newFormData = {
            ...prev,
            ['posture']: newArr,
          };
          console.log("after change: posture >> ↓"); console.log(newFormData['posture']); //DEBUG
          return newFormData;
        });
      } else {

        // Remove label.
        setFormData((prev) => {
          console.log("before change: posture >> ↓"); console.log(prev['posture']); //DEBUG
          let newArr =
            prev['posture'].filter(
              (item) => item!==e.target.value
            );
          let newFormData = {
            ...prev,
            ['posture']: newArr,
          };
          console.log("after change: posture >> ↓"); console.log(newFormData['posture']); //DEBUG
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
          let newArr =
            prev[categoryname][subcategoryname].filter(
              (item) => item!==e.target.value
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

  /**
   * Handle update in type 3 (modality) subcategories.
   */
  const form_change_handler_type3 = (categoryname, subcategoryname) => {
    //e.preventDefault();
    console.log("form_change_handler_type3"); //DEBUG

    // Update formData by toggling the value of the current subcategory.
    setFormData((prev) => {
      console.log("before change: " + categoryname + " >> " + subcategoryname + " >> " + prev[categoryname][subcategoryname]); //DEBUG
      prev[categoryname][subcategoryname] = !prev[categoryname][subcategoryname];
      console.log("after change: " + categoryname + " >> " + subcategoryname + " >> " + prev[categoryname][subcategoryname]); //DEBUG
      return prev;
    });
    console.log("updated formData ↓"); console.log(formData); //DEBUG
  };

  // DEBUG
  useEffect(() => {
    console.log("updated formData ↓"); console.log(formData);
  })


/* To collect data from WaitingRoom (pictures) */


/* To handle upload */

  /**
   * uploadImage
   * 
   * Final step to upload image to firebase with settled labels.
   */
  const uploadImage = () => {

    // Check for validity.
    if (imageUpload == null) return;

    // Generate random key and open up a space (?) in firebase.
    let key = v4(); // generate random key
    const imageRef  = ref(storage, `images/${key}`)
    console.log("new key: " + key); //DEBUG

    // Store picture to firebase.
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {

        // Store url and labels to firebase realtime database.
        console.log("upload image with labels at key: " + key); //DEBUG
        console.log(url)
        let finalLabels = storeLabels(key, url, formData);
        console.log("final labels ↓"); console.log(finalLabels); //DEBUG
        //setImageList((prev) => [...prev, [key, finalLabels]]);
      });
    });

    // Clear imageUpload. TODO???
    setImageUpload(null);
    console.log("imageUpload should be cleared: " + imageUpload); //DEBUG
  };

  // Implement Firebase Realtime Database Storage:
  //  1. get the UUID of uploaded image,
  //  2. get the labels associated with that image.
  const storeLabels = (id, url, data) => {
    //console.log(url)
    let finalLabels = processData(data, url);
    console.log('labels from processData: ', finalLabels)
    const db = getDatabase()
    const path = 'images/' + id;
    //console.log(path);
    set(ref_db(db, path), finalLabels);
    return finalLabels
    // imageRef.push(finalLabels);
  }

  /**
   * processData
   *
   * Convert javascript object into json item.
   */
  const processData = (data, url) => {
    const spectators_group = ['all', 'density', 'attentive']
    const modality_group = ['head', 'eyes', 'mouth', 'facial_expression', 'arms', 'l_hand', 'r_hand', 'legs', 'feet']
    const demographic_group = ['age', 'sex', 'occupation']
    let finalLabels = {
      'url': '',
      'location': '',
      'spectators': {},
      'modality': {},
      'demographic': {}
    }
    for (let label in data) {
      if (spectators_group.includes(label)) {
        finalLabels['spectators'] = {...finalLabels['spectators'], [label] : data[label]}
      } else if (modality_group.includes(label)) {
        finalLabels['modality'] = {...finalLabels['modality'], [label] : data[label]}
      } else if (demographic_group.includes(label)) {
        finalLabels['demographic'] = {...finalLabels['demographic'], [label] : data[label]}
      } else {
        finalLabels[label] = data[label];
      }
    }
    finalLabels['url'] = url;
    return finalLabels;
  }

  // const handleImageAdd = (currImg) => {
  //   console.log(currImg);
  //   setCurrImg(currImg)
  // }

/* Regular check effects */

//  useEffect(() => {
//    // listAll(imageListRef).then((response) => {
//    //   response.items.forEach((item) => {
//    //     getDownloadURL(item).then((url) => {
//    //       setImageList((prev) => [...prev, url]);
//    //     })
//    //   })
//    // })
//    const db = getDatabase()
//    const dbRef = ref_db(db, 'images')
//    onValue(dbRef, (snapshot) => {
//      const data = snapshot.val();
//      // console.log(data)
//      let append = []
//      for (const [imgKey, labels] of Object.entries(data)) {
//        append.push([imgKey, labels])
//      }
//      setImageList(append);
//    })
//  }, [])


  /**
   * Validation
   * 
   * Check validation of uploading regularly (on any change of formData & imageList).
   * Valid = image exists + all required fields are filled.
   */
  useEffect(() => {

    // Check: image exists.
    let validImg = (imageUpload !== null);
    let validLabels = true;

    // Check: all required fields are filled. TODO
    if ((formData['location']['in_outdoor'] === "") || (formData['location']['purpose'] === "") ||
        (formData['demographic']['age'] === "") || (formData['demographic']['sex'] === "") ||
        (formData['spectators']['quantity']) === "") {
          validLabels = false;
    }
    // let validLabels = (formData !== LabelStructure);

    //console.log("validLabels: " + validLabels); //DEBUG

    // If all valid, enable upload button.
    if (validLabels && validImg) {
      setUploadDisabled(false);
    }
  }, [formData])

  useEffect(() => {
    console.log(imageUpload);
  }, [imageUpload])


/* Render */

  return (
    <div className="PageBox">
      <WaitingRoom
        setImageUpload={setImageUpload}
        uploadImage={uploadImage}
      />
      <LabelsForm
        form_change_handler_type1={form_change_handler_type1}
        form_change_handler_type2={form_change_handler_type2}
        form_change_handler_type3={form_change_handler_type3}
        formData={formData}
      />
    </div>
  );

  //  return (
  //    <div className="App">
  //      <div className='img-upload textCenter'>
  //        <input
  //          id='input-file'
  //          type='file'
  //          onChange={(event) =>
  //            {
  //              if (event.target.files && event.target.files[0]) {
  //                setImageUpload(URL.createObjectURL(event.target.files[0]));
  //              }
  //            }}
  //        />
  //      </div>
  //      <img src={imageUpload} />
  //      <Labels passData={passData}/>
  //      <div className='text-center'>
  //        <Button onClick={uploadImage} variant="primary" disabled={uploadDisabled} type="submit">
  //            Upload
  //        </Button>
  //      </div>
  //      <div className='textCenter'>
  //        <div className='images'>
  //          { 
  //            imageList.map((data) => {
  //              let available_modalities = [];
  //              for (let modality in data[1].modality) {
  //                //console.log(modality)
  //                if (data[1].modality[modality]) {
  //                  available_modalities.push(modality)
  //                }
  //              }
  //              const modalities = available_modalities.join(', ');
  //              //console.log(modalities)
  //              return (<div key={data[0]} className='textLeft'>
  //                        <img key={data[0]} src={data[1].url}/> 
  //                        <p>Age: {data[1].demographic.age}</p>
  //                        <p>Occupation: {data[1].demographic.occupation}</p>
  //                        <p>Sex: {data[1].demographic.sex}</p>
  //                        <p>Location: {data[1].location}</p>
  //                        <p>Available modalities: {modalities}</p>
  //                        /*{ {
  //                          available_modalities.map((modality) => {
  //                            return <p> modality </p>
  //                          })
  //                        } }*/
  //                        <p>All: {data[1].spectators.all}</p>
  //                        <p>Attentive: {data[1].spectators.attentive}</p>
  //                        <p>Density: {data[1].spectators.density}</p>
  //                      </div>)
  //            })
  //          }
  //        </div>
  //      </div>
  //    </div>
  //  );
}