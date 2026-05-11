import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

import Time from './components/Time';
import LastUpdated from './components/LastUpdated';
import processService from './services/objToArray';

const defaultStations = ['Fulton St (23/45/AC/JZ)', 'Chambers St (123)', 'Clark St (23)'];

const App = () => {
  const [stops, setStops] = useState([]);
  const [data, setData] = useState([]);
  const [displayedStations, setDisplayedStations] = useState(['Fulton St (23/45/AC/JZ)']);
  const [errors, setErrors] = useState({});
  const [loadError, setLoadError] = useState(null);
  const routeColorsRef = useRef(null);

  const formatStationName = (name, routeColors) => {
    // Format route codes in parentheses by grouping them by color
    // e.g., "Fulton St (2345ACJZ)" with colors -> "Fulton St (23/45/AC/JZ)"
    return name.replace(/\(([A-Z0-9]+)\)/, (match, routes) => {
      const routeList = routes.split('');
      const routesByColor = {};
      
      // Group routes by their color
      routeList.forEach(route => {
        const routeInfo = routeColors.find(c => c.route_id === route);
        const color = routeInfo?.color || 'unknown';
        if (!routesByColor[color]) {
          routesByColor[color] = [];
        }
        routesByColor[color].push(route);
      });
      
      // Sort color groups and join routes within each group
      const groupedRoutes = Object.values(routesByColor)
        .map(routes => routes.join(''))
        .sort();
      
      return `(${groupedRoutes.join('/')})`;
    });
  };

  const updateData = useCallback((station_id, property, value) => {
    const stationIdString = station_id?.toString();
    setData(prevData => prevData.map(entry =>
      entry.station_id?.toString() === stationIdString ? { ...entry, [property]: value } : entry
    ));
  }, []);

  const clearError = useCallback((station_id) => {
    const stationIdString = station_id?.toString();
    setErrors(prev => {
      const next = { ...prev };
      delete next[stationIdString];
      return next;
    });
  }, []);

  const getTrainInfo = useCallback(async (station_id) => {
    const url = '/api/times/' + station_id;
    console.log(`fetching for url: ${url}`);

    try {
      let tresult = await axios.get(url);
      tresult = processService.processApiObj(tresult);
      tresult = tresult[0].trains;

      if (!routeColorsRef.current) {
        try {
          const response = await axios.get('/api/routes/');
          routeColorsRef.current = response.data;
        } catch (colorErr) {
          console.warn('Failed to load route colors, continuing with default colors:', colorErr);
          routeColorsRef.current = [];
        }
      }

      const colors = routeColorsRef.current || [];
      tresult = tresult.map(time => {
        const routeInfo = colors.find(c => c.route_id === time.route_id);
        return {
          ...time,
          color: routeInfo?.color || 'gray',
          route_type: routeInfo?.route_type || 'SUBWAY'
        };
      });

      updateData(station_id, 'result', tresult);
      updateData(station_id, 'lastUpdated', Date.now());
      clearError(station_id);
    } catch (err) {
      console.error(`Failed to fetch train info for station ${station_id}:`, err);
      setErrors(prev => ({
        ...prev,
        [station_id?.toString()]: err?.message || 'Network error fetching data'
      }));
    }
  }, [updateData, clearError]);

  // Make a request to get stop info and route colors
  // Then process this into an array where each element has a value (int)
  // and label (like 'Wall St')
  useEffect(() => {
    // First load routes to get color mappings
    const loadStations = async () => {
      try {
        // Load routes if not already loaded
        if (!routeColorsRef.current) {
          const routesResponse = await axios.get('/api/routes/');
          routeColorsRef.current = routesResponse.data;
        }

        const stops_list = await axios.get('/api/stations/');
        const processedStops = processService.processApiObj(stops_list);
        
        const formattedStops = processedStops.map(stop => ({
          value: stop.station_id,
          label: formatStationName(stop.name, routeColorsRef.current || [])
        }));
        
        setStops(formattedStops);
      } catch (err) {
        console.error('Failed to load station list:', err);
        setLoadError('Could not load stations. Please refresh or try again later.');
      }
    };
    
    loadStations();
  }, []);

  // Wait until we have a stops list, then find the stations
  // we always want to show
  // If we're getting a new stops list, stop all existing polling
  // and reset everything
  useEffect(() => {
    if (stops.length === 0 || data.length > 0) {
      return;
    }

    setData(displayedStations.map(station => {
      const element = stops.find(i => i.label === station);
      return {
        name: station || '',
        station_id: element?.value?.toString() || null,
        timer: null,
        result: [],
        lastUpdated: null
      };
    }));
  }, [stops, displayedStations, data.length]);

  const intervalIdsRef = useRef({});
  const activeStationIds = data.filter(entry => entry.station_id).map(entry => entry.station_id).join(',');

  useEffect(() => {
    if (!activeStationIds) {
      return;
    }

    Object.values(intervalIdsRef.current).forEach(clearInterval);
    intervalIdsRef.current = {};

    activeStationIds.split(',').forEach((stationId) => {
      getTrainInfo(stationId);
      intervalIdsRef.current[stationId] = setInterval(() => getTrainInfo(stationId), 30000);
    });

    return () => {
      Object.values(intervalIdsRef.current).forEach(clearInterval);
    };
  }, [activeStationIds, getTrainInfo]);

  const handleStationChange = (index, newStationName) => {
    const newStations = [...displayedStations];
    newStations[index] = newStationName;
    setDisplayedStations(newStations);

    const element = stops.find(i => i.label === newStationName);
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      name: newStationName,
      station_id: element?.value?.toString() || null,
      result: [],
      lastUpdated: null
    };
    setData(newData);
  };

  const handleRemoveStation = (index) => {
    const newStations = displayedStations.filter((_, i) => i !== index);
    setDisplayedStations(newStations);
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
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
      {loadError && <div className="global-error">{loadError}</div>}
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
                  <button
                    type="button"
                    className="station-remove"
                    onClick={() => handleRemoveStation(index)}
                    aria-label={`Remove ${i.name || 'station'}`}
                  >
                    <img
                      src="https://cdn.creazilla.com/icons/3272128/trash-icon-sm.png"
                      alt="Remove station"
                      className="station-remove-icon"
                    />
                  </button>
                </div>
                {i.lastUpdated && (
                  <>
                    <LastUpdated lastUpdated={i.lastUpdated} />
                    {errors[i.station_id]?.length > 0 && (
                      <div className="station-error-inline">
                        Error: {errors[i.station_id]}. Retrying in 30s.
                      </div>
                    )}
                  </>
                )}
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
        <td className="add-station-td">
          <button
            type="button"
            onClick={() => {
              setDisplayedStations([...displayedStations, '']);
              setData([...data, { name: '', station_id: null, timer: null, result: [], lastUpdated: null }]);
            }}
            className="add-station-button"
          >
            +
          </button>
        </td>
      </tr></tbody></table>
    </div>
  )
};

export default App;
