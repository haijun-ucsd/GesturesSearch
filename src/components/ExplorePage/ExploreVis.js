import React, { PureComponent } from 'react';
import Popup from 'reactjs-popup';
import '../components.css';
import BodyComponent from '../BodyComponent';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Label, LabelList, Treemap, RadialBar, Legend, ResponsiveContainer, PieChart, Pie, Sector, Cell } from 'recharts';


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
    const siteArchiNest = JsonConverter(UndefinedMarker(NestedConverter(props.imageList, siteData, 'location', 'site', 'archi_compo', true)));
    return (
        <Popup trigger={<button className="Visbutton"> Visualization </button>}
        {...{ overlayStyle, arrowStyle }} modal>
            <div className='popup-content'>
            <div className='column1'>
            <h5>Postures</h5>
            <ResponsiveContainer width="120%" height="45%">
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
            <ResponsiveContainer width="100%" height="45%">
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
            <h5>Spectators</h5>
            <ResponsiveContainer width="100%" height="45%">
                <PieChart>
                <Pie data={quantityData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={70} outerRadius={90} fill="#82ca9d" label={renderLabel}/>
                <Pie data={densityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} fill="#8884d8">
                    <LabelList dataKey="name" position="inside" angle={0} fill='#82ca9d' />
                </Pie>
                </PieChart>
            </ResponsiveContainer>
            <h5>Location</h5>
            <ResponsiveContainer width="150%" height="45%">
                <Treemap data={siteArchiNest} dataKey="size" ratio={4 / 3} stroke="#fff" fill="#8884d8" animationDuration='800' content={<CustomizedContent colors={COLORS} />}>
                    <Tooltip content={<CustomTooltip />}/>
                </Treemap>
            </ResponsiveContainer>
            </div>
            <div className='column3'>

            </div>
            </div>
        </Popup>
    )
}

let renderLabel = function(entry) {
    return entry.name;
}

const COLORS = ['#8889DD', '#9597E4', '#8DC77B', '#A5D297', '#E2CF45', '#F8C12D'];

class CustomizedContent extends PureComponent {
  render() {
    const { root, depth, x, y, width, height, index, payload, colors, rank, name } = this.props;

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: depth < 2 ? colors[Math.floor((index / root.children.length) * 6)] : 'transparent',
            stroke: '#fff',
            strokeWidth: 2 / (depth + 1e-10),
            strokeOpacity: 1 / (depth + 1e-10),
          }}
        />
        {depth === 1 ? (
          <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
            {name}
          </text>
        ) : null}
        {depth === 1 ? (
          <text x={x + 4} y={y + 18} fill="#fff" fontSize={16} fillOpacity={0.9}>
            {index + 1}
          </text>
        ) : null}
      </g>
    );
  }
}

const CustomTooltip = ({ active, payload, label }) => {
  
    if (active && payload && payload.length) {
      return (
        <div className="treemap-custom-tooltip">
          <p>{`${payload[0].payload.root.name}`}</p>
          <p>{`${payload[0].payload.name} : ${payload[0].value}`}</p>
        </div>
      );
    }
  
    return null;
};

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

const NestedConverter = (imageList, parentData, category, parentcategory, subcategory, isArchi=false) => {
    if (isArchi) {
        for (var i=0; i < imageList.length; i++) {
            for (var j=0; j < parentData.length; j++) {
                if (imageList[i][1][category][subcategory] !== undefined) {
                    for (var l=0; l < imageList[i][1][category][parentcategory].length; l++) {
                        if (imageList[i][1][category][parentcategory][l] === parentData[j]['name']) {

                            for (var k=0; k < imageList[i][1][category][subcategory].length; k++){
                                if (imageList[i][1][category][subcategory][k] in parentData[j]) {
                                    parentData[j][imageList[i][1][category][subcategory][k]]++;
                                } else {
                                    parentData[j][imageList[i][1][category][subcategory][k]] = 1;
                                }
                            }
                        }
                    }
                }
            }
        }
        console.log(parentData);
        return parentData;
    }
    for (var i=0; i < imageList.length; i++) {
        for (var j=0; j < parentData.length; j++) {
            if (imageList[i][1][category][parentcategory] === parentData[j]['name']) {
                if (parentData[j][imageList[i][1][category][subcategory]] !== undefined) {
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
                data[i][key] = 'unknown';
            }
        }
    }
    return data;
}

const JsonConverter = (data) => {
    for (var i=0; i < data.length; i++) {
        for (const [key, value] of Object.entries(data[i])) {
            if (key === 'value') {
                data[i]['size'] = data[i][key];
                delete data[i][key];
            }
            if (key !== 'name' && key !== 'value' && data[i]['children'] === undefined) {
                data[i]['children'] = [{name: key, size: data[i][key]}];
                delete data[i][key];
            } else if (key !== 'name' && key !== 'value') {
                data[i]['children'].push({name: key, size: data[i][key]});
                delete data[i][key];
            }
        }
        if (data[i]['children'] !== undefined) {
            console.log(data[i]['children'].length);
            var total = data[i]['size'];
            for (var j=0; j < data[i]['children'].length; j++) {
                total = total - data[i]['children'][j]['size'];
            }
            data[i]['children'].push({name: '', size: total});
            delete data[i]['size'];
        } else {
            data[i]['children'] = [{name: '', size: data[i]['size']}];
            delete data[i]['size'];
        }
    }
    console.log(data)
    return data;
}