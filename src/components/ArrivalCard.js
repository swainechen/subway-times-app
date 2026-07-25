import React from 'react';

function ArrivalCard({ arrival }) {
  // Convert seconds to minutes
  const secondsToMinutes = (seconds) => {
    if (seconds === null || seconds === undefined) return null;
    const minutes = Math.floor(seconds / 60);
    return minutes <= 0 ? 'Due' : `${minutes} min`;
  };

  // Determine badge colors based on route
  // Routes are matched exactly - no substring matching
  const getBadgeColor = (routeId) => {
    const routeColors = {
      // Subway routes - individual entries for A, B, C, E, etc.
      'A': { bg: '#0039A6', text: '#fff' },
      'C': { bg: '#0039A6', text: '#fff' },
      'E': { bg: '#0039A6', text: '#fff' },
      'B': { bg: '#FF6319', text: '#fff' },
      'D': { bg: '#FF6319', text: '#fff' },
      'F': { bg: '#FF6319', text: '#fff' },
      'M': { bg: '#FF6319', text: '#fff' },
      'G': { bg: '#6CBE45', text: '#fff' },
      'J': { bg: '#996633', text: '#fff' },
      'Z': { bg: '#996633', text: '#fff' },
      'L': { bg: '#A7A9AC', text: '#fff' },
      'N': { bg: '#FCCC0A', text: '#000' },
      'Q': { bg: '#FCCC0A', text: '#000' },
      'R': { bg: '#FCCC0A', text: '#000' },
      'W': { bg: '#FCCC0A', text: '#000' },
      '1': { bg: '#EE352E', text: '#fff' },
      '2': { bg: '#EE352E', text: '#fff' },
      '3': { bg: '#EE352E', text: '#fff' },
      '4': { bg: '#00933C', text: '#fff' },
      '5': { bg: '#00933C', text: '#fff' },
      '6': { bg: '#00933C', text: '#fff' },
      '7': { bg: '#B933AD', text: '#fff' },
      // Ferry routes
      'AS': { bg: '#FF6B00', text: '#fff' },
      'ER': { bg: '#00839C', text: '#fff' },  // Group for ERA/ERB
      'ERA': { bg: '#00839C', text: '#fff' },
      'ERB': { bg: '#00839C', text: '#fff' },
      'GI': { bg: '#9795A0', text: '#fff' },
      'RES': { bg: '#00A1E1', text: '#fff' },
      'RR': { bg: '#FF8672', text: '#fff' },
      'RS': { bg: '#4E008E', text: '#fff' },
      'RWS': { bg: '#00A1E1', text: '#fff' },
      'SB': { bg: '#FFD100', text: '#fff' },
      'SG': { bg: '#D0006F', text: '#fff' }
    };

    // Return exact match, or default color
    return routeColors[routeId] || { bg: '#34495e', text: '#fff' };
  };

  const badgeStyles = getBadgeColor(arrival.route_id);

  // Format time for display
  const arrivalTimeString = secondsToMinutes(arrival.arrival_time_seconds);
  const departureTimeString = secondsToMinutes(arrival.departure_time_seconds);

  // For ferries arriving at terminus with no subsequent departure, show no row
  if (arrival.source === 'ferry' && !arrival.next_stop) {
    return null;
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 16px',
      borderBottom: '1px solid #eee',
      backgroundColor: '#fff'
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {/* Route Badge */}
        <div style={{
          backgroundColor: badgeStyles.bg,
          color: badgeStyles.text,
          borderRadius: '50%',
          width: '36px',
          height: '36px',
          minWidth: '36px',
          minHeight: '36px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          marginRight: '12px',
          fontSize: '14px'
        }}>
          {arrival.route_id}
        </div>

        {/* Destination & Source Label */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '500', color: '#2c3e50', fontSize: '14px' }}>
            {arrival.source === 'ferry' && arrival.next_stop ? arrival.next_stop : arrival.direction }
          </span>
          {arrival.source === 'ferry' && arrival.terminal && (
            <span style={{ fontSize: '12px', color: '#2c3e50', fontWeight: '500' }}>
              To {arrival.terminal}
            </span>
          )}
        </div>
      </div>

      {/* Time Display */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
        {arrival.source === 'ferry' ? (
          <>
            {departureTimeString && (
              <div style={{
                fontSize: '15px',
                fontWeight: 'bold',
                color: departureTimeString === 'Due' ? '#e74c3c' : '#2c3e50'
              }}>
                {departureTimeString}
              </div>
            )}
          </>
        ) : (
          // Subway: show single time (unchanged behavior)
          <div style={{
            fontSize: '15px',
            fontWeight: 'bold',
            color: arrivalTimeString === 'Due' ? '#e74c3c' : '#2c3e50'
          }}>
            {arrivalTimeString}
          </div>
        )}
      </div>
    </div>
  );
}

export default ArrivalCard;
