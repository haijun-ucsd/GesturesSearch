import React, { useState , useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import { Container, Row, Col, Button, InputGroup } from 'react-bootstrap';
//import 'bootstrap/dist/css/bootstrap.min.css';
import { storage } from '../firebase';
import { getDatabase, onValue, ref as ref_db, set } from 'firebase/database';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import './components.css';
import Navbar from './Navbar';
import UploadPage from './UploadPage';
import ExplorePage from './ExplorePage';

/**
 * references:
 */
export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path='/upload' exact element={<UploadPage />} />
        <Route path='/explore' element={<ExplorePage />} />
      </Routes>
    </Router>
  );
}