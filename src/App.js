import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from 'react-select';

import Time from './components/Time';
import processService from './services/objToArray';

const App = () => {
  const [stops, setStops] = useState([]);
  const [times, setTimes] = useState([]);
  const [url, setUrl] = useState('');
  const timerIdRef = useRef(null);

  const updateTimes = async () => {
    //console.log(`UPDATE FUNCTION: ${url}`);
    if (url !== '') {
      let url_data = await axios.get(url);
      url_data = processService.processApiObj(url_data);
      url_data = url_data[0].trains;

      const routeIds = url_data.map(time => time.route_id)

      let colors = await axios.get('/api/routes/');
      colors = colors.data;

      url_data = url_data.map(time => time={...time, color: colors.find(color => color.route_id === time.route_id).color});
      setTimes(url_data);
    }
  };

  const startPolling = () => {
    timerIdRef.current = setInterval(updateTimes, 30000);
    //console.log(`starting timer: ${timerIdRef.current}`);
  };
  
  const stopPolling = () => {
    //console.log(`clearing timer: ${timerIdRef.current}`);
    clearInterval(timerIdRef.current);
  };

  const getStopInfo = (selectedStop) => {
    stopPolling();
    const url = '/api/train_times/' + selectedStop.value;
    setUrl(url);
  };

  useEffect(() => {
    if (url !== '') {
      updateTimes();
      startPolling();
    }
  }, [url]);
  
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
      <h1 class='center'><i>Choose a station:</i></h1>
      <div>
        Select stop
        <div>
          <Select
            options={stops}
            onChange={opt => getStopInfo(opt)}
	    defaultValue={111}
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
