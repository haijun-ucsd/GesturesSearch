import React, { useState , useEffect } from 'react';
import { storage } from '../firebase';
import { getDatabase, onValue, ref as ref_db, set } from 'firebase/database';
import { ref, uploadBytes, listAll, getDownloadURL } from 'firebase/storage';
import { v4 } from 'uuid';
import './components.css';
//import { ... } from './components';

export default function ExplorePage() {
	return (
		<div className="PageBox">
			Explore Page :D
		</div>
	);
}