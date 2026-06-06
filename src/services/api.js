const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5280/api';

/**
 * Fetches real-time structured arrival schedules for a specific station identifier.
 * Gracefully normalizes both wrapped list fragments and flat object dictionaries.
 */
export const getStationTimes = async (stationId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/times/${stationId}`);
    if (!response.ok) {
      throw new Error(`Matrix server responded with status code: ${response.status}`);
    }
    
    let data = await response.json();
    
    // Normalize step: If the payload is wrapped in a list array container, extract the first entry
    if (Array.isArray(data)) {
      data = data[0];
    }
    
    // If the data object is empty or invalid, drop back to an empty envelope layout
    if (!data) {
      return {
        station_id: stationId,
        name: 'Station Offline',
        lines: {},
        trains: []
      };
    }
    
    return {
      station_id: data.station_id || stationId,
      name: data.name || 'Transit Node',
      lines: data.lines || {},
      trains: data.trains || []
    };
    
  } catch (error) {
    console.error(`Failed to execute transit fetch sequence for station ${stationId}:`, error);
    
    return { 
      station_id: stationId, 
      name: 'Connection Error', 
      lines: {},
      trains: [] 
    };
  }
};
