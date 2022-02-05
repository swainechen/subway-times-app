import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

import Route from './components/Route';

const App = () => {
  const [stops, setStops] = useState([]);
  const [routes, setRoutes] = useState([]);

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

  
  const getStopInfo = async (selectedStop) => {
    console.log(`SELECTEDSTOP: ${selectedStop.value}`);
    const url = '/api/train_times/' + selectedStop.value;
    let routes = await axios.get(url);
    console.log(routes)
    routes = processApiObj(routes);
    setRoutes(routes);
    
    // .then(routes => setStopInfo(routes));
  };
  /*
    let routes = await axios.get(url);
    routes = processApiObj(routes);
    console.log(routes);
  };
  */
  
  useEffect(() => {
    axios.get('/api/stops/')
         .then(stops_list => processApiObj(stops_list))
         .then(stops_list => stops_list.map(
                (stop => {
                    return { 
                    value: stop.station_id, 
                    label: stop.name,
                    }
                  }
                )
              ))
          .then(results => {setStops(results)});
  }, []);
  
  return (
    <div>
      <div>
        Select stop:
        <div>
          <Select
            options={stops}
            onChange={opt => getStopInfo(opt)}
          />
        </div>
      </div>
      
      {
       routes === [] ?
       <div>noroute</div> :
        routes.map((route, i) =>
        <Route key={i} route={route} />
        )
      }
      
    
    </div>
  )
};

export default App;