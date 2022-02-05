import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { DropdownHeader, Rating } from 'semantic-ui-react';
import SelectSearch from 'react-select-search';

const App = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [searchStops, setSearchStops] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);

  const convertObjToArray = (obj) => {
    let arr= []
      for(let i in obj)
        arr.push([i, obj[i]]);
    return arr;
  };

  const processApiObj = (obj) => {
    let arr = convertObjToArray(obj.data)
    arr = arr.map(elmt => elmt[1]);
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

  const getClosestStops = (stops_list, currentLat, currentLon, num) => {
    stops_list = stops_list.map(stop => ({...stop, distance : getDistance(stop.lat, stop.lon, currentLat, currentLon)}));
    stops_list = stops_list.sort(function(a, b) {
      var keyA = a.distance,
        keyB = b.distance;
      // Compare the 2 dates
      if (keyA < keyB) return -1;
      if (keyA > keyB) return 1;
      return 0;
    });
    return stops_list.slice(0, num)
  };

  const handleGeo = (pos) => {
    setLatitude(pos.coords.latitude);
    setLongitude(pos.coords.longitude);
    console.log(`Lat: ${latitude}, Long: ${longitude}`)
  };
  
  const getTimes = async () => {
    if (latitude == null && longitude == null) {
      getStops();
    } else {
      const stops_obj = await axios.get('/api/stops/')
      let stops_list = processApiObj(stops_obj)
      stops_list =  getClosestStops(stops_list,latitude, longitude, 5);
      const stopIds = stops_list.map(stop => stop.stop_id);
      console.log(`STOP IDS: ${stopIds}`);
      let train_times = await axios.get(`/api/train_times/`);
      train_times = convertObjToArray(train_times.data);
      train_times = train_times.map(train_time => train_time[1]);
      train_times = train_times.filter(route => stopIds.includes(route.stop_id));
      console.log(`Train times: ${train_times}`);
    }
  };

  const geoOptions = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 10000
  };

  const getStops = async (err) => {
    const stops_obj = await axios.get('/api/stops/')
    let stops_list = processApiObj(stops_obj)
    let searchList = stops_list.map(
      (stop => {
        return{ 
         value: stop.name, 
         label: stop.name,
        }
      }));
      searchList = convertObjToArray(searchList)
      console.log(`SEARCHLIST: ${searchList[0][1]}`);
      return searchList;
  };
  
  const handleErr = (err) => {
    console.log(err);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
          handleGeo(position);
      }, function() {
        handleErr();
      }, geoOptions);
    } else {
        // Fallback for no geolocation
        handleErr();
    }  
    
  }, []);

  const options = getStops();
  console.log(`OPTIONS: ${options}`)

  return (
    <div>
      Stops
    </div>
  )
};

export default App;