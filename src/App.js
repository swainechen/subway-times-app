import React, { useState, useEffect } from 'react';
import axios from 'axios';


const App = () => {

  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(function(position) {
    setLatitude(position.coords.latitude);
    setLongitude(position.coords.latitude);
    });
  }, []);

  useEffect(() => {
    axios
      .get('/api/stops/115')
      .then(results => console.log(JSON.stringify(results.data)));
	}, []);
  
  // console.log(data);
  return (
    <div>
      hello
    </div>
  )
};



export default App;
