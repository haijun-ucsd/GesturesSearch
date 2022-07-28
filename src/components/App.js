import { useState , useEffect } from 'react';
//import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { storage } from '../firebase';
import { getDatabase, onValue, ref as ref_db, set } from 'firebase/database';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import UploadPage from './UploadPage';

export default function App() {
  const [imageList, setImageList] = useState([]); // SearchPage

  /* DEBUG *
  return (
    <button onClick={() => {console.log("App");}}> TEST </button>
  );*/

  return (
    <UploadPage className="PageBox"/>
  );
}