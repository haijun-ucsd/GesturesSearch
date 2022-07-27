import './App.css';
import { useState , useEffect } from 'react';
import { storage } from '../firebase';
import { getDatabase, ref as ref_db, set} from 'firebase/database';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'
import Labels from './Labels';
import "./style.css";
import { BodyComponent } from "./BodyComponent.tsx";
import { useEffect, useState } from "react";

const initialFormData = Object.freeze({
  location: '',
  all: '',
  density: '',
  attentive: '',
  head: false,
  eyes: false,
  mouth: false,
  facial_expression: false,
  arms: false,
  l_hand: false,
  r_hand: false,
  legs: false,
  feet: false,
  age: 0,
  sex: '',
  occupation: '',
  posture: ''
});

function App() {
  const [labelData, setLabelData] = useState();
  const [btnDisabled, setBtnState] = useState(true);
  const [imageUpload, setImageUpload] = useState(null);
  const[imageList, setImageList] = useState([]);
  const imageListRef = ref(storage, 'images/');

  const uploadImage = () => {
    if (imageUpload == null) return;
    let key = v4()
    const imageRef  = ref(storage, `images/${key}`)
    console.log(key);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        /**
         * Store url and labels here to firebase realtime database
         */
        console.log(url)
        storeLabels(key, url, labelData);
        setImageList((prev) => [...prev, url]);
      });
    });
  };

  useEffect(() => {
    console.log("useEffect"); // DEBUG
    listAll(imageListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageList((prev) => [...prev, url]);
        })
      })
    })
  }, [])

  useEffect(() => {
    console.log(111);
    validation();
  }, [labelData, imageList])

  const passData = (formData) => {
    setLabelData(formData)
    let timer_id = setTimeout(() => {
      console.log(labelData)
    }, 500);
    clearTimeout(timer_id);
  }

  const validation = () => {
    let validLabels = (labelData !== initialFormData);
    let validImg = (imageUpload !== null);
    if (validLabels && validImg) {
      setBtnState(false);
    }
  }

  // Implement Firebase Realtime Database Storage:
  // First get the UUID of uploaded image
  // Then get the labels associated with that image
  const storeLabels = (id, url, data) => {
    let finalLabels = processData(data);
    const db = getDatabase()
    const path = 'images/' + id;
    console.log(path);
    set(ref_db(db, path), finalLabels);
    // imageRef.push(finalLabels);
  }

  const processData = (data) => {
    const spectators_group = ['all', 'density', 'attentive']
    const modality_group = ['head', 'eyes', 'mouth', 'facial_expression', 'arms', 'l_hand', 'r_hand', 'legs', 'feet']
    const demographic_group = ['age', 'sex', 'occupation']
    let finalLabels = {
      'location': '',
      'spectators': {},
      'modality': {},
      'demographic': {}
    }
    for (let label in data) {
      if (label in spectators_group) {
        finalLabels['spectators'] = {
          ...finalLabels['spectators'],
          label : data[label]
        }
      } else if (label in modality_group) {
        finalLabels['modality'] = {
          ...finalLabels['modality'],
          label : data[label]
        }
      } else if (label in demographic_group) {
        finalLabels['demographic'] = {
          ...finalLabels['demographic'],
          label : data[label]
        }
      } else {
        finalLabels[label] = data[label];
      }
    }
    return finalLabels
  }

  const [bodyState, setBodyState] = useState({
    head: {
      show: true,
      selected: true
    },
    left_shoulder: {
      show: true,
      selected: true
    },
    right_shoulder: {
      show: true,
      selected: true
    },
    left_arm: {
      show: true,
      selected: true
    },
    right_arm: {
      show: true,
      selected: true
    },
    chest: {
      show: true,
      selected: true
    },
    stomach: {
      show: true,
      selected: true
    },
    left_leg: {
      show: true,
      selected: true
    },
    right_leg: {
      show: true,
      selected: true
    },
    left_hand: {
      show: true,
      selected: true
    },
    right_hand: {
      show: true,
      selected: true
    },
    left_foot: {
      show: true,
      selected: true
    },
    right_foot: {
      show: true,
      selected: true
    }
  });

  return (
    <div className="App">
      <div className='img-upload textCenter'>
          <input
            id='input-file'
            type='file'
            onChange={(event) => {
              setImageUpload(event.target.files[0]);
            }}
          />
      </div>
      <Labels passData={passData}/>
      <div className='text-center'>
        <Button onClick={uploadImage} variant="primary" disabled={btnDisabled} type="submit">
            Upload
        </Button>
      </div>
      <div>
        <BodyComponent partsInput={bodyState} />
      </div>
      <div className='textCenter'>
        <div className='images'>
          {imageList.map((url) => {
            return <img src={url} />
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
