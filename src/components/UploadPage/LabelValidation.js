import React, { useState, useEffect } from "react";
import { storage } from "../../firebase";
import { getDatabase, onValue, ref as ref_db, update, set, child, orderByChild, push, get, Database } from "firebase/database";

/**
 * What this file does:
    - During the Upload process:
        - Send a copy of all the quality control image (and their labels) to the final database
        - Keep all the quality control images separately in the initial database
        - Gate all unlabeled images in an initial database with a number indicating how many times they have been allocated to users
 - When a user sign in for the first time, create a folder/assign a dangling folder with n images allocated to the user
 - Start the quality control check until all quality control images are labeled
 - If a user pass the quality control check, all images the user labeled will be passed on to the cross-valid pool

 Rules:
  - Image ids and images are two bijective sets. No matter which database an image locates, it must have the same id. There won't be two different images that share the same id.
  - Unlabeled images in the initial database will be allocated to at least two persons. If there are not enough unlabeled images to allocate, some images can be allocated for the third time.
  - If an image in the cross-valid pool does not pass the cross validation test, it'll be allocated again until it passes.
  - If an image passes the cross validation test, all images with the same id will be earased from all databases except for the final database (the initial database, the user's folder, the cross-valid pool).
  - If a user fails the quality control check, the image folder allocated to the user will be copied and become the newest dangling folder.
  
  Image token:
  -1 - quality control
  0 - initial database, freshly uploaded
  1 - has been allocated once
  2 - has been allocated twice

  */

// after checking the user has no value under the "allocated" attribute
function Allocate(emptyTotal, userID) {
    const db = getDatabase();
    var index = 0;

    //Case 1: allocate a dangling folder
    onValue(ref_db(db, 'allocation'), (snapshot) => {
        if (snapshot.exists()) {
            snapshot.forEach((child) => {
                const currFolder = child.val();

                if(currFolder.user === "") { //find a folder that is not allocated
                    set(ref_db(db, "allocation/" + index + "/user"), userID);
                    return;
                }
                index++;
            });
        }
    });
    
    //Case 2: need to allocate a new folder
    const dbQuality = ref_db(db, 'quality_check');
    const numQuality = 2; //number of quality check images allocated to a user

    const dbEmpty = ref_db(db, 'empty_images');
    const numEmpty = 3; //number of empty images allocated to a user

    //First numQuality images are quality control images
    let qualityImgList = {};
    onValue(dbQuality, (snapshot) => {
        const data = snapshot.val();
        var i = 0;
        for (const [imgKey, imgData] of Object.entries(data)) {
            if (i < numQuality) {
                qualityImgList[imgKey] = imgData;
            }
            i++;
        }
    });

    var indicesArr = [...Array(emptyTotal).keys()];
    shuffle(indicesArr);
    indicesArr = indicesArr.slice(0, numEmpty).sort(function(a, b){return a - b});;
    console.log(indicesArr);

    let emptyImgList = {};
    onValue(dbEmpty, (snapshot) => {
        const data = snapshot.val();
        var i = 0;
        var j = 0;
        for (const [imgKey, imgData] of Object.entries(data)) {
            if (indicesArr[i] === j) {
                emptyImgList[imgKey] = imgData;
                i++;
            }
            j++;
        }
    });

    var imgList = Object.assign({}, qualityImgList, emptyImgList);
    set(ref_db(db, 'allocation/' + index), {
        images: imgList,
        user: userID,
    });
}

// Fisher-Yates (aka Knuth) Shuffle
function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
}

var qualitycheck_criteria = {
    'demographic': 0,
    'modality': 0,
    'spectators': 0,
    'location': 0,
    'posture': 0
}

var crossvalid_criteria = {
    'demographic': 0,
    'modality': 0,
    'spectators': 0,
    'location': 0,
    'posture': 0
}

//quality check and cross validation may follow different protocols
function LabelMatch(img1, img2, is_qualitycheck=true) {//paths of images
    const db = getDatabase();
    const criteria = is_qualitycheck ? qualitycheck_criteria : crossvalid_criteria;
    
    onValue(ref_db(db, img1), (snapshot1) => {
        if (snapshot1.exists()) {
            onValue(ref_db(db, img2), (snapshot2) => {
                if (snapshot2.exists()) {
                    if (CategoryMatch(snapshot1.val()['demographic'], snapshot2.val()['demographic'], criteria['demographic'])
                    && CategoryMatch(snapshot1.val()['modality'], snapshot2.val()['modality'], criteria['modality'])
                    && CategoryMatch(snapshot1.val()['spectators'], snapshot2.val()['spectators'], criteria['spectators'])
                    && CategoryMatch(snapshot1.val()['location'], snapshot2.val()['location'], criteria['location'], true)
                    && CategoryMatch(snapshot1.val()['posture'], snapshot2.val()['posture'], criteria['posture'], false, true)) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    console.log("Image 2 does not exist");
                }
            });
        } else {
            console.log("Image 1 does not exist");
        }
    });
}

const CategoryMatch = (label_dic1, label_dic2, threshold, is_location=false, is_posture=false) => {
    var match = 0;
    var total = 0;
    if (is_location) {
        if (label_dic1['in_outdoor'] !== label_dic2['in_outdoor']) {//in_outdoor field has to match
            return false;
        } else {
            for (const [key, value] of Object.entries(label_dic1['site'])) {
                total++;
                if (label_dic1['site'][key] === label_dic2['site'][key]) {
                    match++;
                }
            }
            console.log(match/total);
            return (match/total < threshold) ? false : true;
        }
    } else if (is_posture) {
        console.log((label_dic1.filter(element => label_dic2.includes(element)).length * 2) / (label_dic1.length + label_dic2.length));
        return ((label_dic1.filter(element => label_dic2.includes(element)).length * 2) / (label_dic1.length + label_dic2.length) < threshold) ? false : true;
    } else {
        for (const [key, value] of Object.entries(label_dic1)) {
            total++;
            if (label_dic1[key] === label_dic2[key]) {
                match++;
            }
        }
        console.log(match/total);
        return (match/total < threshold) ? false : true;
    }
}

export {Allocate, LabelMatch};