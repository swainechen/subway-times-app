import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './App';

axios.defaults.baseURL = 'http://localhost:5000';
ReactDOM.render(
    <App />
	,
	document.getElementById('root')
);
