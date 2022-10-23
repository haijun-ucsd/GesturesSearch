import React, { useState , useEffect, useRef, useLayoutEffect } from 'react';
import Popup from 'reactjs-popup';
import '../components.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Label, LabelList, Text, RadialBarChart, RadialBar, Legend, ResponsiveContainer, PieChart, Pie, Sector, Cell } from 'recharts';


const style = {
    top: '50%',
    right: 0,
    transform: 'translate(0, -50%)',
    lineHeight: '24px',
};

export default function Visualization(props) {
    // const contentStyle = { background: '#FFFFFF' };
    const overlayStyle = { background: 'rgba(0,0,0,0.5)' };
    const arrowStyle = { color: '#000' }; // style for an svg element
    console.log("Imagelist", props.imageList);
    const sexData = SingleConverter(props.imageList, 'demographic', 'sex');
    const ageData = SingleConverter(props.imageList, 'demographic', 'age');
    const in_outData = SingleConverter(props.imageList, 'location', 'in_outdoor');
    const densityData = SingleConverter(props.imageList, 'spectators', 'density');
    const quantityData = SingleConverter(props.imageList, 'spectators', 'quantity');
    const siteData = ListConverter(props.imageList, 'location', 'site');
    const postureData = ListConverter(props.imageList, 'posture', 'posture');
    const sexAgeNest = UndefinedMarker(NestedConverter(props.imageList, ageData, 'demographic', 'age', 'sex'));
    return (
        <Popup trigger={<button className="Visbutton"> Visualization </button>}
        {...{ overlayStyle, arrowStyle }} modal>
            <div className='popup-content'>
            <div className='column1'>
            <h5>Distribution of Postures</h5>
            <ResponsiveContainer width="100%" height="45%">
                <BarChart
                width={500}
                height={300}
                data={postureData}
                margin={{
                    top: 15,
                    right: 30,
                    left: 0,
                    bottom: 15,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide='true'>
                    <Label value="Posture Distribution" offset={-10} position="insideBottom" />
                </XAxis>
                <YAxis padding={{ top: 30 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                    <LabelList dataKey="name" position="top" angle={0} fill='#5A5A5A' />
                </Bar>
                </BarChart>
            </ResponsiveContainer>
            <h5>Gender and Age Groups</h5>
            <ResponsiveContainer width="80%" height="45%">
                <BarChart
                width={500}
                height={300}
                data={sexAgeNest}
                margin={{
                    top: 20,
                    right: 30,
                    left: 0,
                    bottom: 5,
                }}
                >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="female" stackId="a" fill="#8884d8" />
                <Bar dataKey="male" stackId="a" fill="#82ca9d" />
                <Bar dataKey="unknown" stackId="a" fill="#ADD8E6" />
                </BarChart>
            </ResponsiveContainer>
            </div>
            <div className='column2'>
            <ResponsiveContainer width="100%" height="40%">
                <PieChart>
                <Pie data={in_outData} dataKey="value" cx="50%" cy="50%" outerRadius={60} fill="#8884d8" />
                <Pie data={siteData} dataKey="value" cx="50%" cy="50%" innerRadius={70} outerRadius={90} fill="#82ca9d" label />
                </PieChart>
            </ResponsiveContainer>
            </div>
            </div>
        </Popup>
    )
}

const SingleConverter = (imageList, category, subcategory) => {
    var obj = {};
    for (var i=0; i < imageList.length; i++) {
        obj[imageList[i][1][category][subcategory]] = (obj[imageList[i][1][category][subcategory]] || 0 ) +1;
    }
    var list = [];
    for (const [key, value] of Object.entries(obj)) {
        list.push({name: key, value: value});
    }
    console.log(list);
    return list;
}

const NestedConverter = (imageList, parentData, category, parentcategory, subcategory) => {
    for (var i=0; i < imageList.length; i++) {
        for (var j=0; j < parentData.length; j++) {
            if (imageList[i][1][category][parentcategory] === parentData[j]['name']) {
                if (imageList[i][1][category][subcategory] in parentData[j]) {
                    parentData[j][imageList[i][1][category][subcategory]]++;
                } else {
                    parentData[j][imageList[i][1][category][subcategory]] = 1;
                }
                break;
            }
        }
    }
    console.log(parentData);
    return parentData;
}

const ListConverter = (imageList, category, subcategory) => {
    var obj = {};
    if (category === 'posture') {
        for (var i=0; i < imageList.length; i++) {
            for (var j=0; j < imageList[i][1][category].length; j++) {
                obj[imageList[i][1][category][j]] = (obj[imageList[i][1][category][j]] || 0 ) +1;
            }
        }
    } else {
        for (var i=0; i < imageList.length; i++) {
            for (var j=0; j < imageList[i][1][category][subcategory].length; j++) {
                obj[imageList[i][1][category][subcategory][j]] = (obj[imageList[i][1][category][subcategory][j]] || 0 ) +1;
            }
        }
    }
    var list = [];
    for (const [key, value] of Object.entries(obj)) {
        list.push({name: key, value: value});
    }
    console.log(list);
    return list;
}

const UndefinedMarker = (data) => {
    for (var i=0; i < data.length; i++) {
        for (const [key, value] of Object.entries(data[i])) {
            if (key === '') {
                Object.defineProperty(data[i], 'unknown',
                    Object.getOwnPropertyDescriptor(data[i], ''));
                delete data[i][''];
            }
            if (value === '') {
                data[i][key] = 'unknown'
            }
        }
    }
    return data;
}