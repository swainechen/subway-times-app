import React, { useState } from 'react';
import axios from 'axios';


const App = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  
  const convertObjToArray = (obj) => {
    let arr= []
      for(let i in obj)
        arr.push([i, obj[i]]);
    return arr;
  };

  const getDistance = (lat1, lon1, lat2, lon2) => {
    var R = 6371/0.621371; // miles

    var dLat = lat2-lat1;
    var dLon = lon2-lon1;

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    return d;
  };

  const getClosestStops = (stops_obj, currentLat, currentLon, num) => {
    let stops = convertObjToArray(stops_obj)
    stops = stops.map(stop => stop[1]);
    stops = stops.map(stop => ({...stop, distance : getDistance(stop.lat, stop.lon, currentLat, currentLon)}));
    stops = stops.sort(function(a, b) {
      var keyA = a.distance,
        keyB = b.distance;
      // Compare the 2 dates
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
    return stops.slice(0, num)
  };
  
  const geoCode = async (lat, lng) => {
    const stops_obj = await axios.get('/api/stops/')
    const stops_list =  getClosestStops(stops_obj.data,lat, lng, 5);
    const stopIds = stops_list.map(stop => stop.stop_id);
    console.log(`STOP IDS: ${stopIds}`);
    let train_times = await axios.get(`/api/train_times/`);
    train_times = convertObjToArray(train_times.data);
    train_times = train_times.map(train_time => train_time[1]);
    train_times = train_times.filter(route => stopIds.includes(route.stop_id));
    console.log(train_times);
  };

  function geolocFail(err) {
    console.warn(`ERROR(${err.code}): ${err.message}`);
  }

  const options = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 10000
  };

  if (navigator.geolocation) {

    navigator.geolocation.getCurrentPosition(function(position) {

        var lat = position.coords.latitude;
        var lng = position.coords.longitude;
        geoCode(lat, lng);
    }, function(error) {
        geolocFail();
    }, options);
  } else {
      // Fallback for no geolocation
      geolocFail();
  }

  return (
    <div>
      hello
    </div>
  )
};

export default App;
