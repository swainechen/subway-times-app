import React, { useState, useEffect } from 'react';
import { getStationTimes } from './services/api';
import ArrivalCard from './components/ArrivalCard';
import LastUpdated from './components/LastUpdated';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5280/api';

function App() {
  const [allStations, setAllStations] = useState([]);
  const [trackedStations, setTrackedStations] = useState(() => {
    const saved = localStorage.getItem('tracked_transit_stations');
    return saved ? JSON.parse(saved) : ['229', '87']; // Default to Fulton St Complex and Wall St Pier 11
  });
  const [dashboardData, setDashboardData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedStationKey, setSelectedStationKey] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem('tracked_transit_stations', JSON.stringify(trackedStations));
  }, [trackedStations]);

  useEffect(() => {
    const fetchMasterStations = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/stations/`);
        if (res.ok) {
          const data = await res.json();
          const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
          setAllStations(sorted);
          if (sorted.length > 0) setSelectedStationKey(sorted[0].station_id);
        }
      } catch (err) {
        console.error("Failed to load global station list:", err);
      }
    };
    fetchMasterStations();
  }, []);

  const refreshDashboard = async () => {
    if (trackedStations.length === 0) {
      setDashboardData([]);
      setLastUpdated(null);
      setLoading(false);
      return;
    }
    try {
      const promises = trackedStations.map(id => getStationTimes(id));
      const results = await Promise.all(promises);
      setDashboardData(results);
      setLastUpdated(Date.now());
    } catch (err) {
      console.error("Dashboard refresh cycle error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshDashboard();
    const interval = setInterval(refreshDashboard, 30000);
    return () => clearInterval(interval);
  }, [trackedStations]);

  const handleAddStation = () => {
    if (!selectedStationKey) return;
    const selectedOption = allStations.find(s => s.station_id === selectedStationKey);
    if (!selectedOption) return;

    const rawId = selectedOption.raw_id;
    if (trackedStations.includes(rawId)) {
      alert("This station is already being tracked on your dashboard!");
      return;
    }
    setTrackedStations([...trackedStations, rawId]);
  };

  const handleRemoveStation = (stationId) => {
    setTrackedStations(trackedStations.filter(id => id !== stationId));
  };

  if (loading && dashboardData.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'sans-serif' }}>Loading Transit Matrix...</div>;
  }

  return (
    <div className="subway-times-app" style={{ padding: '20px', maxWidth: '100vw', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#f4f6f8', minHeight: '100vh' }}>
      <header style={{ borderBottom: '2px solid #333', paddingBottom: '12px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '1.8em', color: '#2c3e50' }}>Live Transit Board Matrix</h1>
      </header>

      {/* Selector Dashboard Controls */}
      <section style={{ display: 'flex', gap: '10px', backgroundColor: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '24px', border: '1px solid #e1e4e6', maxWidth: '600px' }}>
        <select 
          value={selectedStationKey} 
          onChange={(e) => setSelectedStationKey(e.target.value)} 
          style={{ flexGrow: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ced4da', fontSize: '14px' }}
        >
          {allStations.map(station => (
            <option key={station.station_id} value={station.station_id}>
              {station.name} {station.source === 'ferry' ? '- Ferry' : '- Subway'}
            </option>
          ))}
        </select>
        <button onClick={handleAddStation} style={{ padding: '10px 20px', backgroundColor: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer' }}>
          Add Station
        </button>
      </section>

      {/* STATIONS HORIZONTAL ROW WRAPPER */}
      {trackedStations.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#999', border: '2px dashed #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
          No stations tracked. Select a station above to begin.
        </div>
      ) : (
        <main style={{ 
          display: 'flex', 
          flexDirection: 'row', 
          alignItems: 'flex-start', 
          gap: '24px', 
          overflowX: 'auto', 
          paddingBottom: '20px',
          width: '100%'
        }}>
          {dashboardData.map((station) => (
            <section 
              key={station.station_id} 
              style={{ 
                flex: '0 0 auto',
                minWidth: '320px',
                width: 'max-content',
                backgroundColor: '#fff', 
                border: '1px solid #e1e4e6', 
                borderRadius: '8px', 
                padding: '16px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Station Head Container */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px', borderBottom: '2px solid #edf0f2', paddingBottom: '8px', width: '100%' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <h2 style={{ fontSize: '1.25em', color: '#2c3e50', margin: 0, fontWeight: '700' }}>{station.name} {station.source === 'ferry' ? '- Ferry' : '- Subway'}</h2>
                  <LastUpdated lastUpdated={lastUpdated} />
                </div>
                <button onClick={() => handleRemoveStation(station.station_id)} style={{ padding: '4px 8px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>
                  Remove
                </button>
              </div>

              {/* TRAIN LINES SEPARATED INTO INTERNAL COLUMNS */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'row', 
                gap: '12px',
                alignItems: 'flex-start',
                width: '100%'
              }}>
                {station.lines && Object.keys(station.lines).length > 0 ? (
                  Object.entries(station.lines).map(([lineLabel, arrivals]) => (
                    <div 
                      key={lineLabel} 
                      style={{ 
                        flex: '0 0 260px',
                        width: '220px',
                        border: '1px solid #eef0f1', 
                        borderRadius: '6px', 
                        overflow: 'hidden',
                        backgroundColor: '#fafbfc',
                        marginRight: '8px'
                      }}
                    >
                      {/* Column Subhead Title */}
                      <div style={{ backgroundColor: '#edf0f2', padding: '6px 10px', fontWeight: 'bold', borderBottom: '1px solid #eef0f1', color: '#495057', fontSize: '12px', textAlign: 'center' }}>
                        {lineLabel} Line
                      </div>
                      
                      {/* List of Arrivals inside this specific Column */}
                      <div style={{ backgroundColor: '#fff' }}>
                        {arrivals.map((arrival, index) => (
                          <ArrivalCard key={index} arrival={arrival} />
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ width: '100%', padding: '20px', color: '#999', textAlign: 'center', fontSize: '13px', backgroundColor: '#fafafa', borderRadius: '6px' }}>
                    No imminent arrivals scheduled (Next 30 mins)
                  </div>
                )}
              </div>
            </section>
          ))}
        </main>
      )}
    </div>
  );
}

export default App;
