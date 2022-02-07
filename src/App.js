import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

import Time from './components/Time';
import processService from './services/objToArray';

const App = () => {
  const [stops, setStops] = useState([]);
  const [times, setTimes] = useState([]);

  const getStopInfo = async (selectedStop) => {
    console.log(`SELECTEDSTOP: ${selectedStop.value}`);
    const url = '/api/train_times/' + selectedStop.value;
    let times = await axios.get(url);
    times = processService.processApiObj(times);
    times = times[0].trains;

    const routeIds = times.map(time => time.route_id)

    let colors = await axios.get('/api/routes/');
    colors = colors.data;
    
    times = times.map(time => time={...time, color: colors.find(color => color.route_id === time.route_id).color});
    setTimes(times);
  };
  
  useEffect(() => {
    axios.get('/api/stations/')
         .then(stops_list => processService.processApiObj(stops_list))
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
      <h1 class='center'><i>WHERE'S MY TRAIN?</i></h1>
      <div>
        Select stop
        <div>
          <Select
            options={stops}
            onChange={opt => getStopInfo(opt)}
          />
        </div>
      </div>
      <ol>
        {
        times === [] ?
        <div>No trains running at this station.</div> :
          times.map((time, i) =>
          <Time key={i} time={time} />
          )
        }
      </ol>
    
    </div>
  )
};

export default App;