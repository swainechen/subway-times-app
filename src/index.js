import axios from 'axios';
import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './App';

// This needs to get updated with the url and port for where the mta-api app is serving. For ex. http://localhost:5000/
axios.defaults.baseURL = 'http://192.168.50.114:5280';
// Timeout for axios requests in milliseconds
axios.defaults.timeout = 15000;
ReactDOM.render(
    <App />
	,
	document.getElementById('root')
);
