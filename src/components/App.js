//import './App.css';
import { useState , useEffect } from 'react';
import { Label, CheckLabel, Filter, FilterList, WaitingRoom, Form, Menu } from './components';
import { storage } from '../firebase';
import { getDatabase, onValue, ref as ref_db, set} from 'firebase/database';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
//import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css'
//import Labels from './Labels';

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
  // const imageListRef = ref(storage, 'images/');

  //console.log(imageList)

  const uploadImage = () => {
    if (imageUpload == null) return;
    let key = v4()
    const imageRef  = ref(storage, `images/${key}`)
    //console.log(key);
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        /**
         * Store url and labels here to firebase realtime database
         */
        //console.log(key)
        let finalLabels = storeLabels(key, url, labelData);
        // setImageList((prev) => [...prev, [key, finalLabels]]);
      });
    });
  };

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
      // console.log(data)
      let append = []
      for (const [imgKey, labels] of Object.entries(data)) {
        append.push([imgKey, labels])
      }
      setImageList(append);
    })
  }, [])

  /* Check validation of uploading regularly. */
  useEffect(() => {
    validation();
  }, [labelData, imageList])

  const passData = (formData) => {
    setLabelData(formData)
  }

  /* Valid = all required fields filled. */
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
    //console.log(url)
    let finalLabels = processData(data, url);
    //console.log(finalLabels)
    const db = getDatabase()
    const path = 'images/' + id;
    //console.log(path);
    set(ref_db(db, path), finalLabels);
    return finalLabels
    // imageRef.push(finalLabels);
  }

  const processData = (data, url) => {
    const spectators_group = ['all', 'density', 'attentive']
    const modality_group = ['head', 'eyes', 'mouth', 'facial_expression', 'arms', 'l_hand', 'r_hand', 'legs', 'feet']
    const demographic_group = ['age', 'sex', 'occupation']
    let finalLabels = {
      'url': url,
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
    return finalLabels
  }

  /*return (
    <div className="App">
      <div className='img-upload textCenter'>
        <input
          id='input-file'
          type='file'
          onChange={(event) =>
            {
              if (event.target.files && event.target.files[0]) {
                console.log("haha");  //DUBUG
                setImageUpload(URL.createObjectURL(event.target.files[0]));
              }
            }}
        />
      </div>
      <img src={imageUpload} />
      <Labels passData={passData}/>
      <div className='text-center'>
        <Button onClick={uploadImage} variant="primary" disabled={btnDisabled} type="submit">
            Upload
        </Button>
      </div>
      <div className='textCenter'>
        <div className='images'>
          { 
            imageList.map((data) => {
              let available_modalities = [];
              for (let modality in data[1].modality) {
                //console.log(modality)
                if (data[1].modality[modality]) {
                  available_modalities.push(modality)
                }
              }
              const modalities = available_modalities.join(', ');
              //console.log(modalities)
              return (<div key={data[0]} className='textLeft'>
                        <img key={data[0]} src={data[1].url}/> 
                        <p>Age: {data[1].demographic.age}</p>
                        <p>Occupation: {data[1].demographic.occupation}</p>
                        <p>Sex: {data[1].demographic.sex}</p>
                        <p>Location: {data[1].location}</p>
                        <p>Available modalities: {modalities}</p>
                        //{ {
                        //  available_modalities.map((modality) => {
                        //    return <p> modality </p>
                        //  })
                        //} }
                        <p>All: {data[1].spectators.all}</p>
                        <p>Attentive: {data[1].spectators.attentive}</p>
                        <p>Density: {data[1].spectators.density}</p>
                      </div>)
            })
          }
        </div>
      </div>
    </div>
  );*/

  return (
    <div className="PageBox">
      <WaitingRoom />
      <Form />
    </div>
  );
}

export default App;
