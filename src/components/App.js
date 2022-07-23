import './App.css';
import { useState , useEffect } from 'react';
import { storage } from '../firebase';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css'
import Labels from './Labels';

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
    const imageRef  = ref(storage, `images/${imageUpload.name + v4()}`)
    console.log(imageUpload.name + v4());
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        /**
         * Store url and labels here to firebase realtime database
         */
        console.log(url)
        setImageList((prev) => [...prev, url]);
      });
    });
  };

  useEffect(() => {
    listAll(imageListRef).then((response) => {
      response.items.forEach((item) => {
        getDownloadURL(item).then((url) => {
          setImageList((prev) => [...prev, url]);
        })
      })
    })
  }, [])

  useEffect(() => {
    validation();
  }, [labelData, imageList])

  const passData = (formData) => {
    setLabelData(formData)
    let id = setTimeout(() => {
      console.log(labelData)
    }, 500);
    clearTimeout(id);
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

  return (
    <div className="App">
      <div className='img-upload textCenter'>
          <input
            id='input-file'
            type='file'
            onChange={(event) => {
              setImageUpload(event.target.files[0]);
              // validation(true)
            }}
          />
      </div>
      <Labels passData={passData}/>
      <div className='text-center'>
        <Button onClick={uploadImage} variant="primary" disabled={btnDisabled} type="submit">
            Upload
        </Button>
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
