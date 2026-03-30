import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import Time from './components/Time';
import processService from './services/objToArray';

const defaultStations = ['Fulton St', 'Chambers St', 'Clark St'];

const App = () => {
  const [stops, setStops] = useState([]);
  const [data, setData] = useState([]);
  const [selectedStation, setSelectedStation] = useState();

  const updateData = useCallback((i, property, value) => {
    setData(prevData => {
      const newData = [...prevData];
      if (newData.length <= i) {
        console.log(`Got invalid index ${i} for updateState when data has length ${newData.length}`);
        return newData;
      }
      newData[i] = { ...newData[i], [property]: value };
      return newData;
    });
  }, []);

  // We take station_id + index so this function is stable for useEffect deps
  const getTrainInfo = useCallback(async (station_id, i) => {
    const url = '/api/train_times/' + station_id;
    console.log(`fetching for url: ${url}`);
    let tresult = await axios.get(url);
    tresult = processService.processApiObj(tresult);
    tresult = tresult[0].trains;

    // Probably make this a global
    let colors = await axios.get('/api/routes/');
    colors = colors.data;

    tresult = tresult.map(time => ({ ...time, color: colors.find(c => c.route_id === time.route_id)?.color || 'gray' }));
    updateData(i, 'result', tresult);
  }, [updateData]);

  // Make a request to get stop info
  // Then process this into an array where each element has a value (int)
  // and label (like 'Wall St')
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

  // Wait until we have a stops list, then find the stations
  // we always want to show
  // If we're getting a new stops list, stop all existing polling
  // and reset everything
  useEffect(() => {
    if (stops.length === 0) {
      return;
    }

    setData(defaultStations.map(station => {
      const element = stops.find(i => i.label === station);
      if (!element) {
        return null;
      }
      return {
        name: element.label,
        station_id: element.value,
        timer: null,
        result: []
      };
    }).filter(Boolean));
  }, [stops]);

  useEffect(() => {
    if (data.length === 0) {
      return;
    }

    const intervalIds = data.map((entry, i) => {
      getTrainInfo(entry.station_id, i);
      const timerId = setInterval(() => getTrainInfo(entry.station_id, i), 30000);
      return timerId;
    });

    return () => {
      intervalIds.forEach(clearInterval);
    };
  }, [data.length, getTrainInfo]);

  return (
    <div>
      <h1 className='center'><i>Transit Hub</i></h1>
    <table width="90%"><tbody><tr>
      {data.length === 0 ?
	<td>Loading...</td> :
        data.map((i) =>
          <td key={i.station_id} style={{ verticalAlign: 'top', width: '30%' }}>{i.name}
            <ol>
              {
                i.result.length === 0 ?
                <div>Either loading or no trains running...</div> :
                i.result.map((time) => {
                  const key = `${time.route_id}-${time.direction}-${Math.round(time.time)}`;
                  return <Time key={key} time={time} />;
                })
              }
            </ol>
          </td>
        )
      }
    </tr></tbody></table>
    
    </div>
  )
};

export default App;
