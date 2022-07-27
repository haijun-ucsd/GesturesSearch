import React from 'react';
import ReactDOM from 'react-dom/client';
//import App from './components/App';
import { Label, CheckLabel, Filter, FilterList, Form, Menu } from './components/components';
import reportWebVitals from './reportWebVitals';
import Human from './components/human.js'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Form />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
