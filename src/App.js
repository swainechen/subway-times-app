import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

import Time from './components/Time';
import processService from './services/objToArray';

const defaultStations = ['Fulton St', 'Chambers St', 'Clark St'];

const App = () => {
  const [stops, setStops] = useState([]);
  const [data, setData] = useState([]);
  const [displayedStations, setDisplayedStations] = useState(['Fulton St', '']);

  const updateData = useCallback((station_id, property, value) => {
    setData(prevData => prevData.map(entry =>
      entry.station_id === station_id ? { ...entry, [property]: value } : entry
    ));
  }, []);

  const getTrainInfo = useCallback(async (station_id) => {
    const url = '/api/train_times/' + station_id;
    console.log(`fetching for url: ${url}`);
    let tresult = await axios.get(url);
    tresult = processService.processApiObj(tresult);
    tresult = tresult[0].trains;

    // Probably make this a global
    let colors = await axios.get('/api/routes/');
    colors = colors.data;

    tresult = tresult.map(time => ({ ...time, color: colors.find(c => c.route_id === time.route_id)?.color || 'gray' }));
    updateData(station_id, 'result', tresult);
    updateData(station_id, 'lastUpdated', new Date().toLocaleTimeString());
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

    setData(displayedStations.map(station => {
      const element = stops.find(i => i.label === station);
      return {
        name: station || '',
        station_id: element?.value || null,
        timer: null,
        result: [],
        lastUpdated: null
      };
    }));
  }, [stops, displayedStations]);

  useEffect(() => {
    if (data.length === 0) {
      return;
    }

    const intervalIds = data.flatMap((entry) => {
      if (!entry.station_id) {
        return [];
      }
      getTrainInfo(entry.station_id);
      const timerId = setInterval(() => getTrainInfo(entry.station_id), 30000);
      return [timerId];
    });

    return () => {
      intervalIds.forEach(clearInterval);
    };
  }, [data, getTrainInfo]);

  const handleStationChange = (index, newStationName) => {
    const newStations = [...displayedStations];
    newStations[index] = newStationName;
    if (index === newStations.length - 1 && newStationName) {
      newStations.push('');
    }
    setDisplayedStations(newStations);
  };

  const handleRemoveStation = (index) => {
    const newStations = displayedStations.filter((_, i) => i !== index);
    if (!newStations.includes('')) {
      newStations.push('');
    }
    setDisplayedStations(newStations);
  };

  const stationOptions = [
    { value: '', label: 'Select station' },
    ...(stops.length > 0
      ? [...stops].sort((a, b) => a.label.localeCompare(b.label))
      : defaultStations.map((station) => ({ value: station, label: station })).sort((a, b) => a.label.localeCompare(b.label)))
  ];

  return (
    <div>
      <h1 className='center'><i>Transit Hub</i></h1>
      <table className="stations-table"><tbody><tr>
        {data.length === 0 ?
          <td>Loading...</td> :
          data.map((i, index) => {
            const trainsByColor = i.result.reduce((groups, time) => {
              const color = time.color || 'gray';
              groups[color] = groups[color] || [];
              groups[color].push(time);
              return groups;
            }, {});
            const colorOrderWithLabels = Object.keys(trainsByColor).map(color => {
              const routeLabel = Array.from(new Set(trainsByColor[color].map(time => time.route_id))).sort().join('/');
              return { color, routeLabel };
            }).sort((a, b) => a.routeLabel.localeCompare(b.routeLabel));
            const colorOrder = colorOrderWithLabels.map(item => item.color);

            return (
              <td key={i.station_id || index} style={{ verticalAlign: 'top' }}>
                <div className="station-name">
                  <select
                    className="station-select"
                    id={`station-select-${index}`}
                    value={i.name}
                    onChange={(e) => handleStationChange(index, e.target.value)}
                  >
                    {stationOptions.map((stop) => (
                      <option key={stop.value} value={stop.label}>
                        {stop.label}
                      </option>
                    ))}
                  </select>
                  {i.name && i.name !== '' && (
                    <button
                      type="button"
                      className="station-remove"
                      onClick={() => handleRemoveStation(index)}
                      aria-label={`Remove ${i.name}`}
                    >
                      <img
                        src="https://cdn.creazilla.com/icons/3272128/trash-icon-sm.png"
                        alt="Remove station"
                        className="station-remove-icon"
                      />
                    </button>
                  )}
                </div>
                {!i.station_id ?
                  <div className="station-empty">Select a station</div> :
                  i.result.length === 0 ?
                    <div>Either loading or no trains running...</div> :
                    <div className="station-columns">
                    {colorOrder.map((color) => {
                      const routeLabel = Array.from(new Set(trainsByColor[color].map(time => time.route_id))).sort().join('/');
                      return (
                        <div key={color} className="station-column">
                          <div className="station-column-header" style={{ backgroundColor: color }}>
                            {routeLabel}
                          </div>
                          {i.lastUpdated && <div className="last-updated">Last updated: {i.lastUpdated}</div>}
                          {trainsByColor[color].map((time) => {
                            const key = `${time.route_id}-${time.direction}-${Math.round(time.time)}`;
                            return <Time key={key} time={time} />;
                          })}
                        </div>
                      );
                    })}
                  </div>
                }
              </td>
            );
          })
        }
      </tr></tbody></table>
    </div>
  )
};

export default App;
