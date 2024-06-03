import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { Logger } from 'react-logger-lib';

import Time from './components/Time';
import processService from './services/objToArray';

const App = () => {
  const [stops, setStops] = useState([]);
  const [data, setData] = useState([]);
  const [newTrainData, setNewTrainData] = useState(0);
  const [newData, setNewData] = useState(0);
  const [seletedStation, setSeletedStation] = useState();
  const defaultStations = ['Fulton St', 'Chambers St', 'Clark St'];

  const updateData = (i, property, value) => {
    if (data.length <= i) {
      // We shouldn't get here, maybe in this case cancel all the polls?
      console.log(`Got invalid index ${i} for updateState when data has length ${data.length}`);
    } else {
      switch (property) {
        case 'timer': {
          data[i].timer = value;
          break;
        }
        case 'result': {
          data[i].result = value;
          setNewTrainData(1-newTrainData);
          break;
        }
      };
    };
  };

  // We just take an index. From this, we can get the url and know
  // which result to update
  const getTrainInfo = async (i) => {
    if (data.length <= i) {
      // This is some error that we need to handle
    } else {
      const url = '/api/train_times/' + data[i].station_id;
      console.log(`fetching for url: ${url}`);
      let tresult = await axios.get(url);
      tresult = processService.processApiObj(tresult);
      tresult = tresult[0].trains;

      const routeIds = tresult.map(time => time.route_id)

      // Probably make this a global
      let colors = await axios.get('/api/routes/');
      colors = colors.data;
    
      tresult = tresult.map(time => time={...time, color: colors.find(color => color.route_id === time.route_id).color});
      updateData(i, 'result', tresult);
    };
  };

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
    if (data.length > 0) {
      // If we get here we want to check that things haven't changed
      // For things that have changed, we stop the polling, update
      // the station information, reset timer and result, and then
      // fire things off again
    };
    if (stops.length > 0) {
      // First set the initial array with station info and null timer and result
      setData(defaultStations.map(
        station => {
          const element = stops.find((i) => i.label === station);
          console.log(station)
          console.log(element.value)
          return {
            name: element.label,
            station_id: element.value,
            timer: null,
            result: []
          }
        }
      ));
      setNewData(1-setNewData);
    };
  }, [JSON.stringify(stops)]);

  const anyNullTimers = () => {
  }

  useEffect(() => {
    for (let i = 0; i < data.length; i++) {
      // Fire off the first query for train info for each station
      getTrainInfo(i);
      // Set up polling
      updateData(i, 'timer', setInterval(getTrainInfo, 30000, i));
      console.log(`starting timer ${i}`);
    };
  }, [JSON.stringify(
    data.map(
      d => {
        return {
          name: d.name,
          station_id: d.station_id,
          timer: d.timer
        }
      }
    )
  )]);

  return (
    <div>
      <h1 class='center'><i>Transit Hub</i></h1>
    <table width="90%"><tbody><tr>
      {data.length === 0 ?
	<td>Loading...</td> :
        data.map((i) =>
          <td valign="top" width="30%">{i.name}
            <ol>
              {
                i.result.length === 0 ?
                <div>Either loading or no trains running...</div> :
                i.result.map((time, j) =>
                  <Time key={j} time={time} />
                )
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
